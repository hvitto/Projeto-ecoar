/**
 * Popula catálogo normalizado de Ecoar no banco.
 * Uso: npx tsx scripts/seed-ecoar-catalog.ts
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { neon } from '@neondatabase/serverless'
import {
  ecoarActionsSeed,
  ecoarBaseTraitsSeed,
  ecoarCatalogSeed,
  ecoarSingularitiesSeed,
} from '../data/ecoarCatalogSeed'

function loadEnvLocal() {
  const p = resolve(process.cwd(), '.env.local')
  if (!existsSync(p)) return
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

loadEnvLocal()

function extraRequirementsForSingularity(singId: string): Array<{
  requirement_type: string
  requirement_key: string
  requirement_value: string
  numeric_value: number | null
}> {
  const out: Array<{
    requirement_type: string
    requirement_key: string
    requirement_value: string
    numeric_value: number | null
  }> = []

  const add = (
    requirement_type: string,
    requirement_key: string,
    requirement_value: string,
    numeric_value: number | null = null
  ) => out.push({ requirement_type, requirement_key, requirement_value, numeric_value })

  const familyByPrefix: Array<[string, string]> = [
    ['ravenborne-', 'ravenborne'],
    ['abyssaux-', 'abyssaux'],
    ['kriegshetzer-', 'kriegshetzer'],
    ['rocha-', 'rocha'],
    ['estrella-', 'estrella'],
    ['stigia-', 'stigia'],
    ['grekhonov-', 'grekhonov'],
    ['orfao-', 'orfao'],
  ]
  for (const [prefix, fam] of familyByPrefix) {
    if (singId.startsWith(prefix)) add('family', 'family', fam)
  }

  const pecadoByPrefix: Array<[string, string]> = [
    ['vampiro-crueldade', 'crueldade'],
    ['vampiro-ganancia', 'ganancia'],
    ['vampiro-luxuria', 'luxuria'],
    ['vampiro-orgulho', 'orgulho'],
    ['vampiro-furia', 'furia'],
    ['vampiro-obsessao', 'obsessao'],
    ['vampiro-sabotagem', 'sabotagem'],
    ['ravenborne-luxuria', 'luxuria'],
    ['ravenborne-orgulho', 'orgulho'],
    ['ravenborne-obsessao', 'obsessao'],
    ['abyssaux-crueldade', 'crueldade'],
    ['abyssaux-sabotagem', 'sabotagem'],
    ['abyssaux-obsessao', 'obsessao'],
    ['kriegshetzer-crueldade', 'crueldade'],
    ['kriegshetzer-furia', 'furia'],
    ['kriegshetzer-sabotagem', 'sabotagem'],
    ['rocha-ganancia', 'ganancia'],
    ['rocha-orgulho', 'orgulho'],
    ['rocha-furia', 'furia'],
    ['estrella-ganancia', 'ganancia'],
    ['estrella-luxuria', 'luxuria'],
    ['estrella-sabotagem', 'sabotagem'],
    ['stigia-crueldade', 'crueldade'],
    ['stigia-ganancia', 'ganancia'],
    ['stigia-orgulho', 'orgulho'],
    ['grekhonov-luxuria', 'luxuria'],
    ['grekhonov-furia', 'furia'],
    ['grekhonov-obsessao', 'obsessao'],
  ]
  for (const [prefix, pecado] of pecadoByPrefix) {
    if (singId.startsWith(prefix)) add('sin', 'sin', pecado)
  }

  if (singId === 'ecoar-vampiro-i') add('vampiric_min_count', 'vampiric_min_count', '1', 1)
  if (singId === 'ecoar-vampiro-ii') add('vampiric_min_count', 'vampiric_min_count', '3', 3)
  if (singId === 'ecoar-vampiro-iii') add('vampiric_min_count', 'vampiric_min_count', '6', 6)

  if (singId === 'vampiro-placeholder-em-jogo' || singId === 'vampiro-placeholder-ecoar') {
    add('placeholder', 'content_status', 'pending_source_text')
  }

  return out
}

function inferActivationType(sing: { id: string; name: string; description: string; effects?: string }): 'passiva' | 'condicional' | 'complexa' | 'ativa' {
  const text = `${sing.name} ${sing.description} ${sing.effects ?? ''}`.toLowerCase()
  if (text.includes('com uma ação') || text.includes('ação completa') || text.includes('ação menor') || text.includes('ação longa')) {
    return 'ativa'
  }
  if (text.includes('enquanto') || text.includes('se ') || text.includes('quando ')) {
    return 'condicional'
  }
  if (text.includes('placeholder') || text.includes('tabela') || text.includes('resistido') || text.includes('expurg')) {
    return 'complexa'
  }
  return 'passiva'
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL não definido.')
    process.exit(1)
  }
  const sql = neon(connectionString)

  for (const eco of ecoarCatalogSeed) {
    await sql`
      INSERT INTO ecoar_catalog (id, name, type, acquisition_requirement, acquisition_cost, description, is_active, updated_at)
      VALUES (${eco.id}, ${eco.name}, ${eco.type}, ${eco.acquisitionRequirement}, ${eco.acquisitionCost}, ${eco.description}, true, now())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        acquisition_requirement = EXCLUDED.acquisition_requirement,
        acquisition_cost = EXCLUDED.acquisition_cost,
        description = EXCLUDED.description,
        is_active = true,
        updated_at = now()
    `
  }

  for (const trait of ecoarBaseTraitsSeed) {
    await sql`
      INSERT INTO ecoar_base_traits (id, ecoar_id, name, description, display_order, is_active, updated_at)
      VALUES (${trait.id}, ${trait.ecoarId}, ${trait.name}, ${trait.description}, ${trait.displayOrder}, true, now())
      ON CONFLICT (id) DO UPDATE SET
        ecoar_id = EXCLUDED.ecoar_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        display_order = EXCLUDED.display_order,
        is_active = true,
        updated_at = now()
    `
  }

  for (const action of ecoarActionsSeed) {
    await sql`
      INSERT INTO ecoar_actions (id, name, description, is_active, updated_at)
      VALUES (${action.id}, ${action.name}, ${action.description}, true, now())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_active = true,
        updated_at = now()
    `
  }

  for (const sing of ecoarSingularitiesSeed) {
    const activationType = sing.activationType ?? inferActivationType(sing)
    const bonusesSimple = sing.bonuses ? JSON.stringify(sing.bonuses) : null
    await sql`
      INSERT INTO ecoar_singularities (id, ecoar_id, name, description, cost, tier, activation_type, bonuses_simple, is_base, is_active, updated_at)
      VALUES (${sing.id}, ${sing.ecoarId}, ${sing.name}, ${sing.description}, ${sing.cost}, ${sing.tier ?? null}, ${activationType}, ${bonusesSimple}::jsonb, false, true, now())
      ON CONFLICT (id) DO UPDATE SET
        ecoar_id = EXCLUDED.ecoar_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        cost = EXCLUDED.cost,
        tier = EXCLUDED.tier,
        activation_type = EXCLUDED.activation_type,
        bonuses_simple = EXCLUDED.bonuses_simple,
        is_base = false,
        is_active = true,
        updated_at = now()
    `

    await sql`DELETE FROM ecoar_singularity_requirements WHERE singularity_id = ${sing.id}`
    await sql`DELETE FROM ecoar_singularity_effects WHERE singularity_id = ${sing.id}`

    if (sing.requirements?.previous) {
      await sql`
        INSERT INTO ecoar_singularity_requirements (id, singularity_id, requirement_type, requirement_key, requirement_value, numeric_value, updated_at)
        VALUES (${`${sing.id}-req-prev`}, ${sing.id}, ${'previous'}, ${'id'}, ${sing.requirements.previous}, null, now())
      `
    }
    if (typeof sing.requirements?.nivelAlma === 'number') {
      await sql`
        INSERT INTO ecoar_singularity_requirements (id, singularity_id, requirement_type, requirement_key, requirement_value, numeric_value, updated_at)
        VALUES (${`${sing.id}-req-nivel-alma`}, ${sing.id}, ${'nivelAlma'}, ${'nivelAlma'}, ${String(sing.requirements.nivelAlma)}, ${sing.requirements.nivelAlma}, now())
      `
    }
    const extras = extraRequirementsForSingularity(sing.id)
    for (let i = 0; i < extras.length; i++) {
      const req = extras[i]
      await sql`
        INSERT INTO ecoar_singularity_requirements (id, singularity_id, requirement_type, requirement_key, requirement_value, numeric_value, updated_at)
        VALUES (${`${sing.id}-req-extra-${i + 1}`}, ${sing.id}, ${req.requirement_type}, ${req.requirement_key}, ${req.requirement_value}, ${req.numeric_value}, now())
      `
    }

    await sql`
      INSERT INTO ecoar_singularity_effects (id, singularity_id, effect_type, title, description, display_order, updated_at)
      VALUES (${`${sing.id}-fx-main`}, ${sing.id}, ${'main'}, ${sing.name}, ${sing.description}, 1, now())
    `
  }

  console.log(
    `Seed Ecoar concluído: ${ecoarCatalogSeed.length} ecos, ${ecoarBaseTraitsSeed.length} bases, ${ecoarActionsSeed.length} ações, ${ecoarSingularitiesSeed.length} singularidades.`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
