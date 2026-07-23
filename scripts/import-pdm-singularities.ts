/**
 * Importa singularidades do PDM (data/pdm/*.csv) para ecoar_singularities.
 * Uso: npx tsx scripts/import-pdm-singularities.ts
 *
 * DB permanece fonte de verdade; este script é bootstrap/migração pontual.
 */
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { neon } from '@neondatabase/serverless'
import {
  CREATION_CATEGORY_MAP,
  KNOWN_CREATION_IDS,
  KNOWN_DISADVANTAGE_IDS,
  RACE_SUBCLASS_TO_ID,
  emptyParsedBonuses,
  extractBonusesFromPdmRow,
  hasParsedBonuses,
  mapPdmTipo,
  mergeParsedBonuses,
  parseCsv,
  parsePtNumber,
  slugifyPt,
  type ParsedPdmBonuses,
  type PdmActivationType,
} from '../lib/pdmCsv'

type SystemType = 'ecoar' | 'criacao' | 'marcial' | 'racial' | 'desvantagem' | 'tag' | 'path'

type EffectChannelsPayload = {
  passivos: ParsedPdmBonuses
  condicionais: Array<{ id: string; label: string; bonuses: ParsedPdmBonuses }>
}

type ImportRow = {
  id: string
  ecoarId: string
  systemType: SystemType
  sourceGroup: string
  sourceMeta: Record<string, unknown>
  name: string
  description: string
  cost: number
  tier: number | null
  activationType: PdmActivationType
  bonusesSimple: ParsedPdmBonuses
  effectChannels: EffectChannelsPayload
  requirements: Array<{ type: string; key: string; value: string; numericValue: number | null }>
}

function loadEnvFiles() {
  for (const fileName of ['.env.local', '.env']) {
    const p = resolve(process.cwd(), fileName)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf8').split('\n')) {
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

function resolveId(name: string, known: Record<string, string>, prefix?: string): string {
  const slug = slugifyPt(name)
  if (known[slug]) return known[slug]
  return prefix ? `${prefix}-${slug}` : slug
}

function rowsToObjects(pathRel: string, headerRowIndex = 0): { header: string[]; rows: string[][] } {
  const full = resolve(process.cwd(), pathRel)
  const parsed = parseCsv(readFileSync(full, 'utf8'))
  const header = parsed[headerRowIndex]
  return { header, rows: parsed.slice(headerRowIndex + 1) }
}

function indexHeader(header: string[]): Record<string, number> {
  return Object.fromEntries(header.map((h, i) => [h, i]))
}

function emptyChannels(): EffectChannelsPayload {
  return { passivos: emptyParsedBonuses(), condicionais: [] }
}

function applyEffectToChannels(
  channels: EffectChannelsPayload,
  activation: PdmActivationType,
  bonuses: ParsedPdmBonuses,
  effectId: string,
  label: string,
) {
  if (!hasParsedBonuses(bonuses)) return
  if (activation === 'ativa') return
  if (activation === 'condicional') {
    channels.condicionais.push({ id: effectId, label, bonuses: structuredClone(bonuses) })
    return
  }
  mergeParsedBonuses(channels.passivos, bonuses)
}

function pickPrimaryActivation(types: PdmActivationType[]): PdmActivationType {
  if (types.includes('passiva')) return 'passiva'
  if (types.includes('condicional')) return 'condicional'
  if (types.includes('ativa')) return 'ativa'
  return 'complexa'
}

function parseRequirements(raw: string): Array<{ type: string; key: string; value: string; numericValue: number | null }> {
  const out: Array<{ type: string; key: string; value: string; numericValue: number | null }> = []
  const parts = raw
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
  for (const part of parts) {
    const lower = part.toLowerCase()
    if (lower.startsWith('criação de personagem') || lower.startsWith('criacao de personagem')) continue
    if (lower.startsWith('não possuir') || lower.startsWith('nao possuir')) {
      const name = part.replace(/^não possuir\s+/i, '').replace(/^nao possuir\s+/i, '').trim()
      const id = resolveId(name, { ...KNOWN_CREATION_IDS, ...KNOWN_DISADVANTAGE_IDS })
      out.push({ type: 'conflict', key: 'id', value: id, numericValue: null })
      continue
    }
    if (RACE_SUBCLASS_TO_ID[part] || Object.values(RACE_SUBCLASS_TO_ID).includes(slugifyPt(part))) {
      continue
    }
    const prevId = resolveId(part, { ...KNOWN_CREATION_IDS, ...KNOWN_DISADVANTAGE_IDS })
    out.push({ type: 'previous', key: 'id', value: prevId, numericValue: null })
  }
  return out
}

async function ensureGroup(sql: any, groupId: string, systemType: SystemType, label: string) {
  await sql`
    INSERT INTO ecoar_catalog (id, name, type, acquisition_requirement, acquisition_cost, description, is_active, updated_at)
    VALUES (${groupId}, ${label}, ${systemType}, ${'pdm-import'}, 0, ${`Agrupador ${label}`}, true, now())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      type = EXCLUDED.type,
      description = EXCLUDED.description,
      is_active = true,
      updated_at = now()
  `
}

async function upsertSingularity(sql: any, row: ImportRow) {
  await sql`
    INSERT INTO ecoar_singularities (
      id, ecoar_id, system_type, source_group, source_meta, name, description, cost, tier,
      activation_type, bonuses_simple, effect_channels, is_base, is_active, updated_at
    )
    VALUES (
      ${row.id},
      ${row.ecoarId},
      ${row.systemType},
      ${row.sourceGroup},
      ${JSON.stringify(row.sourceMeta)}::jsonb,
      ${row.name},
      ${row.description},
      ${Math.trunc(row.cost)},
      ${row.tier},
      ${row.activationType},
      ${JSON.stringify(row.bonusesSimple)}::jsonb,
      ${JSON.stringify(row.effectChannels)}::jsonb,
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
      effect_channels = EXCLUDED.effect_channels,
      is_active = true,
      updated_at = now()
  `

  await sql`DELETE FROM ecoar_singularity_requirements WHERE singularity_id = ${row.id}`
  for (let i = 0; i < row.requirements.length; i++) {
    const req = row.requirements[i]
    await sql`
      INSERT INTO ecoar_singularity_requirements (id, singularity_id, requirement_type, requirement_key, requirement_value, numeric_value, updated_at)
      VALUES (
        ${`${row.id}-req-${req.type}-${i + 1}`},
        ${row.id},
        ${req.type},
        ${req.key},
        ${req.value},
        ${req.numericValue},
        now()
      )
    `
  }

  await sql`
    INSERT INTO ecoar_singularity_effects (id, singularity_id, effect_type, title, description, display_order, updated_at)
    VALUES (${`${row.id}-fx-main`}, ${row.id}, ${'main'}, ${row.name}, ${row.description}, 1, now())
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      updated_at = now()
  `
}

function groupMechanicalRows(
  header: string[],
  rows: string[][],
  opts: {
    systemType: SystemType
    groupIdFor: (cls: string, sub: string, name: string) => { ecoarId: string; sourceGroup: string; label: string }
    idFor: (name: string, cls: string, sub: string) => string
    costMode: 'signed' | 'abs-positive'
  },
): ImportRow[] {
  const idx = indexHeader(header)
  const get = (row: string[], name: string) => row[idx[name]] ?? ''
  let lastCls = ''
  let lastSub = ''
  const buckets = new Map<
    string,
    {
      id: string
      name: string
      cls: string
      sub: string
      descriptions: string[]
      types: PdmActivationType[]
      cost: number
      channels: EffectChannelsPayload
      bonuses: ParsedPdmBonuses
      requirements: ImportRow['requirements']
      effectIndex: number
    }
  >()

  for (const row of rows) {
    let cls = get(row, 'Classificação').trim()
    let sub = get(row, 'Subclassificação').trim()
    const name = get(row, 'Singularidade').trim()
    if (!name) continue
    if (cls) lastCls = cls
    else cls = lastCls
    if (sub) lastSub = sub
    else sub = lastSub
    if (!cls) continue

    const id = opts.idFor(name, cls, sub)
    const activation = mapPdmTipo(get(row, 'Tipo'))
    const description = (get(row, 'Descrição') || get(row, 'Efeito') || name).trim()
    const condition = get(row, 'Condição').trim()
    const custoRaw = parsePtNumber(get(row, 'Custo Real')) ?? 0
    const cost = opts.costMode === 'abs-positive' ? Math.abs(custoRaw) : custoRaw
    const bonuses = extractBonusesFromPdmRow(header, row, idx)
    const requirements = parseRequirements(get(row, 'Requisitos'))

    let bucket = buckets.get(id)
    if (!bucket) {
      bucket = {
        id,
        name,
        cls,
        sub,
        descriptions: [],
        types: [],
        cost,
        channels: emptyChannels(),
        bonuses: emptyParsedBonuses(),
        requirements: [],
        effectIndex: 0,
      }
      buckets.set(id, bucket)
    } else {
      bucket.cost = Math.max(bucket.cost, cost)
    }

    if (description && !bucket.descriptions.includes(description)) bucket.descriptions.push(description)
    bucket.types.push(activation)
    bucket.effectIndex += 1
    const effectId = `${id}-fx-${bucket.effectIndex}`
    const label = condition || description || name
    applyEffectToChannels(bucket.channels, activation, bonuses, effectId, label)
    for (const req of requirements) {
      if (!bucket.requirements.some((r) => r.type === req.type && r.value === req.value)) {
        bucket.requirements.push(req)
      }
    }
  }

  const out: ImportRow[] = []
  for (const bucket of Array.from(buckets.values())) {
    const group = opts.groupIdFor(bucket.cls, bucket.sub, bucket.name)
    const activationType = pickPrimaryActivation(bucket.types)
    const bonusesSimple =
      hasParsedBonuses(bucket.channels.passivos) || bucket.channels.condicionais.length
        ? {
            ...bucket.channels.passivos,
            ...(bucket.channels.condicionais.length === 0
              ? {}
              : {}),
          }
        : bucket.bonuses

    const flatBonuses = emptyParsedBonuses()
    mergeParsedBonuses(flatBonuses, bucket.channels.passivos)
    for (const c of bucket.channels.condicionais) mergeParsedBonuses(flatBonuses, c.bonuses)

    out.push({
      id: bucket.id,
      ecoarId: group.ecoarId,
      systemType: opts.systemType,
      sourceGroup: group.sourceGroup,
      sourceMeta: {
        classificacao: bucket.cls,
        subclassificacao: bucket.sub,
        category: CREATION_CATEGORY_MAP[bucket.sub] ?? 'talentos',
        pdm: true,
      },
      name: bucket.name,
      description: bucket.descriptions.join('\n') || bucket.name,
      cost: bucket.cost,
      tier: null,
      activationType,
      bonusesSimple: hasParsedBonuses(bucket.channels.passivos) ? bucket.channels.passivos : flatBonuses,
      effectChannels: bucket.channels,
      requirements: bucket.requirements,
    })
  }
  return out
}

function importCreationAdvantages(): ImportRow[] {
  const { header, rows } = rowsToObjects('data/pdm/vantagens-criacao.csv', 0)
  return groupMechanicalRows(header, rows, {
    systemType: 'criacao',
    costMode: 'signed',
    groupIdFor: () => ({
      ecoarId: 'sistema-criacao',
      sourceGroup: 'sistema-criacao',
      label: 'Criação',
    }),
    idFor: (name) => resolveId(name, KNOWN_CREATION_IDS),
  }).map((row) => ({
    ...row,
    sourceMeta: {
      ...row.sourceMeta,
      category: CREATION_CATEGORY_MAP[String(row.sourceMeta.subclassificacao)] ?? 'talentos',
    },
  }))
}

function importCreationDisadvantages(): ImportRow[] {
  const { header, rows } = rowsToObjects('data/pdm/desvantagens-criacao.csv', 0)
  return groupMechanicalRows(header, rows, {
    systemType: 'desvantagem',
    costMode: 'abs-positive',
    groupIdFor: () => ({
      ecoarId: 'sistema-desvantagens',
      sourceGroup: 'sistema-desvantagens',
      label: 'Desvantagens',
    }),
    idFor: (name) => resolveId(name, KNOWN_DISADVANTAGE_IDS),
  }).map((row) => {
    const penalties = emptyParsedBonuses()
    mergeParsedBonuses(penalties, row.effectChannels.passivos)
    for (const c of row.effectChannels.condicionais) mergeParsedBonuses(penalties, c.bonuses)
    return {
      ...row,
      bonusesSimple: penalties,
      sourceMeta: {
        ...row.sourceMeta,
        category: CREATION_CATEGORY_MAP[String(row.sourceMeta.subclassificacao)] ?? 'atributos',
        pontosCriacao: row.cost,
      },
    }
  })
}

function importComuns(): ImportRow[] {
  const { header, rows } = rowsToObjects('data/pdm/singularidades-comuns.csv', 1)
  const idx = indexHeader(header)
  const get = (row: string[], name: string) => row[idx[name]] ?? ''
  let lastCls = ''
  let lastSub = ''
  const racial: string[][] = []
  const martial: string[][] = []
  for (const row of rows) {
    let cls = get(row, 'Classificação').trim()
    let sub = get(row, 'Subclassificação').trim()
    const name = get(row, 'Singularidade').trim()
    if (!name) continue
    if (cls) lastCls = cls
    else cls = lastCls
    if (sub) lastSub = sub
    else sub = lastSub
    if (cls === 'Talentos Raciais') racial.push(row)
    else if (cls === 'Escolas Marciais') martial.push(row)
  }

  const racialRows = groupMechanicalRows(header, racial, {
    systemType: 'racial',
    costMode: 'signed',
    groupIdFor: (_cls, sub) => {
      const raceId = RACE_SUBCLASS_TO_ID[sub] ?? slugifyPt(sub)
      return {
        ecoarId: `racial-${raceId}`,
        sourceGroup: `racial-${raceId}`,
        label: `Racial: ${sub}`,
      }
    },
    idFor: (name, _cls, sub) => {
      const raceId = RACE_SUBCLASS_TO_ID[sub] ?? slugifyPt(sub)
      return `racial-${raceId}-${slugifyPt(name)}`
    },
  }).map((row) => {
    const raceId = String(row.sourceGroup).replace(/^racial-/, '')
    return {
      ...row,
      requirements: row.requirements.map((req) => {
        if (req.type !== 'previous') return req
        if (req.value.startsWith('racial-')) return req
        return { ...req, value: `racial-${raceId}-${req.value}` }
      }),
      sourceMeta: {
        ...row.sourceMeta,
        raceId,
        acquisitionPhase: row.cost === 0 ? 'creation' : 'evolution',
        pdm: true,
      },
    }
  })

  const martialRows = groupMechanicalRows(header, martial, {
    systemType: 'marcial',
    costMode: 'signed',
    groupIdFor: (_cls, sub) => {
      const schoolId = slugifyPt(sub)
      return {
        ecoarId: `sistema-marcial-${schoolId}`,
        sourceGroup: `sistema-marcial-${schoolId}`,
        label: `Marcial: ${sub}`,
      }
    },
    idFor: (name, _cls, sub) => {
      const schoolId = slugifyPt(sub)
      const levelMatch = name.match(/\b(XII|XI|IX|X|VIII|VII|VI|IV|V|III|II|I|\d+)\b\s*$/i)
      const roman: Record<string, number> = {
        I: 1,
        II: 2,
        III: 3,
        IV: 4,
        V: 5,
        VI: 6,
        VII: 7,
        VIII: 8,
        IX: 9,
        X: 10,
        XI: 11,
        XII: 12,
      }
      const tier = levelMatch
        ? roman[levelMatch[1].toUpperCase()] ?? parsePtNumber(levelMatch[1]) ?? null
        : null
      return tier ? `${schoolId}-${tier}` : `${schoolId}-${slugifyPt(name)}`
    },
  }).map((row) => {
    const schoolId = String(row.sourceGroup).replace(/^sistema-marcial-/, '')
    const maybeTier = Number(row.id.split('-').pop())
    const tier = Number.isFinite(maybeTier) ? maybeTier : null
    return {
      ...row,
      tier,
      sourceMeta: {
        ...row.sourceMeta,
        schoolId,
        schoolName: row.sourceMeta.subclassificacao,
        level: tier,
        pdm: true,
      },
    }
  })

  return [...racialRows, ...martialRows]
}

function importTags(): ImportRow[] {
  const { rows } = rowsToObjects('data/pdm/singularidades-tags.csv', 1)
  const out: ImportRow[] = []
  for (const row of rows) {
    const name = (row[0] || '').trim()
    if (!name) continue
    const description = [row[1], row[2], row[3]].filter((x) => String(x || '').trim()).join('\n').trim() || name
    const cost = Math.trunc(parsePtNumber(row[4]) ?? 0)
    const id = `tag-${slugifyPt(name)}`
    out.push({
      id,
      ecoarId: 'sistema-tags',
      systemType: 'tag',
      sourceGroup: 'sistema-tags',
      sourceMeta: { pdm: true, kind: 'tag' },
      name,
      description,
      cost,
      tier: null,
      activationType: 'complexa',
      bonusesSimple: emptyParsedBonuses(),
      effectChannels: emptyChannels(),
      requirements: [],
    })
  }
  return out
}

async function main() {
  loadEnvFiles()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL não definido.')
    process.exit(1)
  }
  const sql = neon(connectionString)

  await sql`ALTER TABLE ecoar_singularities ADD COLUMN IF NOT EXISTS effect_channels JSONB`
  await sql`ALTER TABLE ecoar_singularities DROP CONSTRAINT IF EXISTS ecoar_singularities_cost_check`
  await sql`ALTER TABLE ecoar_singularities DROP CONSTRAINT IF EXISTS ecoar_singularities_system_type_check`
  await sql`
    ALTER TABLE ecoar_singularities
    ADD CONSTRAINT ecoar_singularities_system_type_check
    CHECK (system_type IN ('ecoar', 'criacao', 'marcial', 'racial', 'desvantagem', 'tag', 'path'))
  `

  const all = [
    ...importCreationAdvantages(),
    ...importCreationDisadvantages(),
    ...importComuns(),
    ...importTags(),
  ]

  const groups = new Map<string, { systemType: SystemType; label: string }>()
  for (const row of all) {
    groups.set(row.ecoarId, { systemType: row.systemType, label: row.sourceGroup })
  }
  for (const [groupId, meta] of Array.from(groups.entries())) {
    await ensureGroup(sql, groupId, meta.systemType, meta.label)
  }

  for (const row of all) {
    await upsertSingularity(sql, row)
  }

  const summary = (await sql`
    SELECT system_type, COUNT(*)::int AS n
    FROM ecoar_singularities
    WHERE is_active = true
    GROUP BY system_type
    ORDER BY system_type
  `) as Array<{ system_type: string; n: number }>

  console.log('Import PDM concluído. Linhas processadas:', all.length)
  console.log('Resumo por system_type:', Object.fromEntries(summary.map((r) => [r.system_type, r.n])))
  console.log(
    'Novas vantagens de criação esperadas:',
    ['robusto', 'carismatico', 'mente-prodigiosa', 'precisao-cirurgica', 'sentidos-afiados', 'vontade-inabalavel'],
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
