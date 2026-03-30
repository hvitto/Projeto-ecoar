/**
 * Backfill de singularidades de Criação, Marciais e Raciais no catálogo unificado.
 * Uso: npx tsx scripts/seed-system-singularities.ts
 *
 * Garante a constraint `system_type` com `racial` (equivalente a scripts/migrations/006_add_racial_system_type.sql)
 * para bases que só aplicaram a 005.
 */
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { neon } from '@neondatabase/serverless'
import { creationSingularities } from '../data/creationSingularities'
import { singularities as legacyCreationSingularities } from '../data/singularities'
import { getAllMartialSchools, getOfficialMartialCostByLevel } from '../data/martialSchoolSingularities'
import { races } from '../data/races'
import { racialSingularities } from '../data/racialSingularities'
import { extractSimpleBonusesFromMartialText } from '../lib/extractSimpleBonusesFromMartialText'

type ActivationType = 'passiva' | 'condicional' | 'complexa' | 'ativa'

function loadEnvFiles() {
  const envPaths = ['.env.local', '.env']
  for (const fileName of envPaths) {
    const p = resolve(process.cwd(), fileName)
    if (!existsSync(p)) continue
    const text = readFileSync(p, 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  }
}

function inferActivationType(textInput: string): ActivationType {
  const text = textInput.toLowerCase()
  if (
    text.includes('com uma ação') ||
    text.includes('ação completa') ||
    text.includes('ação menor') ||
    text.includes('ação curta') ||
    text.includes('ação longa') ||
    text.includes('reação')
  ) {
    return 'ativa'
  }
  if (text.includes('enquanto') || text.includes('se ') || text.includes('quando ') || text.includes('sempre')) {
    return 'condicional'
  }
  if (text.includes('placeholder') || text.includes('resistido') || text.includes('tabela')) {
    return 'complexa'
  }
  return 'passiva'
}

function buildCreationBonuses(source: {
  bonuses?: {
    attributes?: Record<string, number>
    skills?: Record<string, number>
    corpo?: number
    mente?: number
    folego?: number
    mana?: number
  }
  penalties?: {
    attributes?: Record<string, number>
  }
}) {
  const attributes = { ...(source.bonuses?.attributes ?? {}) }
  const skills = { ...(source.bonuses?.skills ?? {}) }
  if (source.penalties?.attributes) {
    for (const [key, value] of Object.entries(source.penalties.attributes)) {
      attributes[key] = (attributes[key] ?? 0) + value
    }
  }
  return {
    attributes,
    skills,
    corpo: source.bonuses?.corpo,
    mente: source.bonuses?.mente,
    folego: source.bonuses?.folego,
    mana: source.bonuses?.mana,
  }
}

async function ensureGroup(sql: any, groupId: string, systemType: 'criacao' | 'marcial' | 'racial', label: string) {
  await sql`
    INSERT INTO ecoar_catalog (id, name, type, acquisition_requirement, acquisition_cost, description, is_active, updated_at)
    VALUES (${groupId}, ${label}, ${systemType}, ${'catálogo-admin'}, 0, ${`Agrupador ${label}`}, true, now())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      type = EXCLUDED.type,
      description = EXCLUDED.description,
      is_active = true,
      updated_at = now()
  `
}

/** Bases antigas só tinham CHECK (ecoar, criacao, marcial); singularidades raciais precisam de racial. */
async function ensureSystemTypeConstraintAllowsRacial(sql: ReturnType<typeof neon>) {
  await sql`ALTER TABLE ecoar_singularities DROP CONSTRAINT IF EXISTS ecoar_singularities_system_type_check`
  await sql`
    ALTER TABLE ecoar_singularities
    ADD CONSTRAINT ecoar_singularities_system_type_check
    CHECK (system_type IN ('ecoar', 'criacao', 'marcial', 'racial'))
  `
}

async function main() {
  loadEnvFiles()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL não definido.')
    process.exit(1)
  }
  const sql = neon(connectionString)

  await ensureSystemTypeConstraintAllowsRacial(sql)

  await ensureGroup(sql, 'sistema-criacao', 'criacao', 'Criação')
  for (const school of getAllMartialSchools()) {
    await ensureGroup(sql, `sistema-marcial-${school.id}`, 'marcial', `Marcial: ${school.name}`)
  }
  for (const race of races) {
    await ensureGroup(sql, `racial-${race.id}`, 'racial', `Racial: ${race.name}`)
  }

  const creationSource = [...creationSingularities, ...legacyCreationSingularities]
  const seenCreation = new Set<string>()
  for (const sing of creationSource) {
    if (seenCreation.has(sing.id)) continue
    seenCreation.add(sing.id)
    const activationType = inferActivationType(`${sing.name} ${sing.description}`)
    const bonusesSimple = JSON.stringify(buildCreationBonuses(sing))
    await sql`
      INSERT INTO ecoar_singularities (id, ecoar_id, system_type, source_group, source_meta, name, description, cost, tier, activation_type, bonuses_simple, is_base, is_active, updated_at)
      VALUES (
        ${sing.id},
        ${'sistema-criacao'},
        ${'criacao'},
        ${'sistema-criacao'},
        ${JSON.stringify({ category: (sing as { category?: string }).category ?? 'legacy' })}::jsonb,
        ${sing.name},
        ${sing.description},
        ${Math.max(0, Math.trunc(sing.cost ?? 0))},
        null,
        ${activationType},
        ${bonusesSimple}::jsonb,
        false,
        true,
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        ecoar_id = EXCLUDED.ecoar_id,
        system_type = EXCLUDED.system_type,
        source_group = EXCLUDED.source_group,
        source_meta = EXCLUDED.source_meta,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        cost = EXCLUDED.cost,
        activation_type = EXCLUDED.activation_type,
        bonuses_simple = EXCLUDED.bonuses_simple,
        is_active = true,
        updated_at = now()
    `
    await sql`DELETE FROM ecoar_singularity_requirements WHERE singularity_id = ${sing.id}`
    if (Array.isArray(sing.requirements)) {
      for (let i = 0; i < sing.requirements.length; i++) {
        const conflictId = sing.requirements[i]
        await sql`
          INSERT INTO ecoar_singularity_requirements (id, singularity_id, requirement_type, requirement_key, requirement_value, numeric_value, updated_at)
          VALUES (${`${sing.id}-req-conflict-${i + 1}`}, ${sing.id}, ${'conflict'}, ${'id'}, ${conflictId}, null, now())
        `
      }
    }
    await sql`
      INSERT INTO ecoar_singularity_effects (id, singularity_id, effect_type, title, description, display_order, updated_at)
      VALUES (${`${sing.id}-fx-main`}, ${sing.id}, ${'main'}, ${sing.name}, ${sing.description}, 1, now())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        updated_at = now()
    `
  }

  for (const school of getAllMartialSchools()) {
    const groupId = `sistema-marcial-${school.id}`
    for (const sing of school.singularities) {
      const activationType = inferActivationType(`${sing.name} ${sing.description} ${sing.effects ?? ''}`)
      const bonusesSimple = JSON.stringify(extractSimpleBonusesFromMartialText({ description: sing.description, effects: sing.effects }))
      const normalizedMartialCost = getOfficialMartialCostByLevel(sing.level) ?? Math.max(0, Math.trunc(sing.cost ?? 0))
      await sql`
        INSERT INTO ecoar_singularities (id, ecoar_id, system_type, source_group, source_meta, name, description, cost, tier, activation_type, bonuses_simple, is_base, is_active, updated_at)
        VALUES (
          ${sing.id},
          ${groupId},
          ${'marcial'},
          ${groupId},
          ${JSON.stringify({ schoolId: school.id, schoolName: school.name, level: sing.level })}::jsonb,
          ${sing.name},
          ${`${sing.description}${sing.effects ? `\n${sing.effects}` : ''}`},
          ${normalizedMartialCost},
          ${sing.level},
          ${activationType},
          ${bonusesSimple}::jsonb,
          false,
          true,
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          ecoar_id = EXCLUDED.ecoar_id,
          system_type = EXCLUDED.system_type,
          source_group = EXCLUDED.source_group,
          source_meta = EXCLUDED.source_meta,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          cost = EXCLUDED.cost,
          tier = EXCLUDED.tier,
          activation_type = EXCLUDED.activation_type,
          bonuses_simple = EXCLUDED.bonuses_simple,
          is_active = true,
          updated_at = now()
      `
      await sql`DELETE FROM ecoar_singularity_requirements WHERE singularity_id = ${sing.id}`
      if (sing.requirements.previous) {
        await sql`
          INSERT INTO ecoar_singularity_requirements (id, singularity_id, requirement_type, requirement_key, requirement_value, numeric_value, updated_at)
          VALUES (${`${sing.id}-req-prev`}, ${sing.id}, ${'previous'}, ${'id'}, ${sing.requirements.previous}, null, now())
        `
      }
      if (typeof sing.requirements.nivelAlma === 'number') {
        await sql`
          INSERT INTO ecoar_singularity_requirements (id, singularity_id, requirement_type, requirement_key, requirement_value, numeric_value, updated_at)
          VALUES (${`${sing.id}-req-nivel-alma`}, ${sing.id}, ${'nivelAlma'}, ${'nivelAlma'}, ${String(sing.requirements.nivelAlma)}, ${sing.requirements.nivelAlma}, now())
        `
      }
      await sql`
        INSERT INTO ecoar_singularity_effects (id, singularity_id, effect_type, title, description, display_order, updated_at)
        VALUES (${`${sing.id}-fx-main`}, ${sing.id}, ${'main'}, ${sing.name}, ${`${sing.description}${sing.effects ? `\n${sing.effects}` : ''}`}, 1, now())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          updated_at = now()
      `
    }
  }

  for (const sing of racialSingularities) {
    const race = races.find((r) => r.id === sing.raceId)
    const groupId = `racial-${sing.raceId}`
    const fullDescription = `${sing.description}${sing.effects ? `\n${sing.effects}` : ''}`
    const bonusesSimple = JSON.stringify({
      attributes: sing.bonuses?.attributes ?? {},
      skills: sing.bonuses?.skills ?? {},
      corpo: sing.bonuses?.corpo,
      mente: sing.bonuses?.mente,
      folego: sing.bonuses?.folego,
      mana: sing.bonuses?.mana,
    })
    await sql`
      INSERT INTO ecoar_singularities (id, ecoar_id, system_type, source_group, source_meta, name, description, cost, tier, activation_type, bonuses_simple, is_base, is_active, updated_at)
      VALUES (
        ${sing.id},
        ${groupId},
        ${'racial'},
        ${groupId},
        ${JSON.stringify({
          raceId: sing.raceId,
          raceName: race?.name ?? sing.raceId,
          ruleEffects: sing.ruleEffects ?? {},
          requirements: sing.requirements ?? [],
          acquisitionPhase: sing.acquisitionPhase ?? 'creation',
        })}::jsonb,
        ${sing.name},
        ${fullDescription},
        ${Math.max(0, Math.trunc(sing.cost ?? 0))},
        null,
        ${sing.activationType},
        ${bonusesSimple}::jsonb,
        false,
        true,
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        ecoar_id = EXCLUDED.ecoar_id,
        system_type = EXCLUDED.system_type,
        source_group = EXCLUDED.source_group,
        source_meta = EXCLUDED.source_meta,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        cost = EXCLUDED.cost,
        activation_type = EXCLUDED.activation_type,
        bonuses_simple = EXCLUDED.bonuses_simple,
        is_active = true,
        updated_at = now()
    `
    await sql`DELETE FROM ecoar_singularity_requirements WHERE singularity_id = ${sing.id}`
    if (Array.isArray(sing.requirements)) {
      for (let i = 0; i < sing.requirements.length; i++) {
        const reqId = sing.requirements[i]
        await sql`
          INSERT INTO ecoar_singularity_requirements (id, singularity_id, requirement_type, requirement_key, requirement_value, numeric_value, updated_at)
          VALUES (${`${sing.id}-req-prev-${i + 1}`}, ${sing.id}, ${'previous'}, ${'id'}, ${reqId}, null, now())
        `
      }
    }
    await sql`
      INSERT INTO ecoar_singularity_effects (id, singularity_id, effect_type, title, description, display_order, updated_at)
      VALUES (${`${sing.id}-fx-main`}, ${sing.id}, ${'main'}, ${sing.name}, ${fullDescription}, 1, now())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        updated_at = now()
    `
  }

  const summary = (await sql`
    SELECT system_type, COUNT(*)::int AS n
    FROM ecoar_singularities
    WHERE is_active = true
    GROUP BY system_type
    ORDER BY system_type
  `) as Array<{ system_type: string; n: number }>
  console.log('Resumo por system_type (ativas):', Object.fromEntries(summary.map((r) => [r.system_type, r.n])))
  console.log('Backfill de singularidades de Criação, Marciais e Raciais concluído.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
