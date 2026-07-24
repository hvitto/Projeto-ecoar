import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { neon } from '@neondatabase/serverless'
import { loadEnvFiles } from './loadEnvFiles'
import { races } from '../data/races'
import { paths } from '../data/paths'
import { skills } from '../data/skills'
import { aptitudes } from '../data/aptitudes'
import { locations } from '../data/locations'
import { soulLevels } from '../data/soulLevels'
import { martialSchools } from '../data/martialSchools'
import {
  disturbioIdentityGatilhos,
  disturbioIdentityEfeitos,
  disturbioIdentityPenalidades,
  disturbiosComuns,
  ecoarAcoes,
} from '../data/disturbios'
import { PATH_PATRONS, PATH_HONOR_CODES } from '../data/pathExtraOptions'
import { creationSingularities } from '../data/creationSingularities'
import { singularities as legacyCreationSingularities } from '../data/singularities'
import { getAllMartialSchools, getOfficialMartialCostByLevel } from '../data/martialSchoolSingularities'
import { racialSingularities } from '../data/racialSingularities'
import { disadvantages } from '../data/disadvantages'
import { ecoarCatalogSeed, ecoarSingularitiesSeed } from '../data/ecoarCatalogSeed'
import { pathBookEntries } from '../data/pathBookContent'
import {
  pathBaseSingularities,
  bruxarias,
  cacadaPowers,
  cacadaEnhancements,
} from '../data/pathSingularities'
import { weaponCatalog } from '../data/equipment/weapons'
import { armorCatalog } from '../data/equipment/armor'
import { utilityCatalog } from '../data/equipment/utilities'
type DiffSection = {
  family: string
  staticCount: number
  dbCount: number
  missingInDb: string[]
  extraInDb: string[]
  costMismatches: Array<{ id: string; expected: number; actual: number }>
}

function diffSets(
  family: string,
  staticIds: Set<string>,
  dbIds: Set<string>,
  costMismatches: DiffSection['costMismatches'] = [],
): DiffSection {
  return {
    family,
    staticCount: staticIds.size,
    dbCount: dbIds.size,
    missingInDb: Array.from(staticIds).filter((id) => !dbIds.has(id)).sort(),
    extraInDb: Array.from(dbIds).filter((id) => !staticIds.has(id)).sort(),
    costMismatches,
  }
}

async function main() {
  loadEnvFiles()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL não definido.')
    process.exit(1)
  }
  const sql = neon(connectionString)
  const sections: DiffSection[] = []

  const refRows = (await sql`
    SELECT id, kind FROM game_reference_catalog WHERE is_active = true
  `) as Array<{ id: string; kind: string }>
  const refByKind = (kind: string) => new Set(refRows.filter((r) => r.kind === kind).map((r) => r.id))

  sections.push(diffSets('reference:race', new Set(races.map((r) => r.id)), refByKind('race')))
  sections.push(diffSets('reference:path', new Set(paths.map((p) => p.id)), refByKind('path')))
  sections.push(diffSets('reference:skill', new Set(skills.map((s) => s.id)), refByKind('skill')))
  sections.push(diffSets('reference:aptitude', new Set(aptitudes.map((a) => a.id)), refByKind('aptitude')))
  sections.push(diffSets('reference:location', new Set(locations.map((l) => l.id)), refByKind('location')))
  sections.push(
    diffSets(
      'reference:soul_level',
      new Set(soulLevels.map((s) => String(s.nivel))),
      refByKind('soul_level'),
    ),
  )
  sections.push(
    diffSets('reference:martial_school', new Set(martialSchools.map((m) => m.id)), refByKind('martial_school')),
  )
  sections.push(
    diffSets(
      'reference:disturbio_gatilho',
      new Set(disturbioIdentityGatilhos.map((d) => d.id)),
      refByKind('disturbio_gatilho'),
    ),
  )
  sections.push(
    diffSets(
      'reference:disturbio_efeito',
      new Set(disturbioIdentityEfeitos.map((d) => d.id)),
      refByKind('disturbio_efeito'),
    ),
  )
  sections.push(
    diffSets(
      'reference:disturbio_penalidade',
      new Set(disturbioIdentityPenalidades.map((d) => d.id)),
      refByKind('disturbio_penalidade'),
    ),
  )
  sections.push(
    diffSets(
      'reference:disturbio_comum',
      new Set(disturbiosComuns.map((d) => d.id)),
      refByKind('disturbio_comum'),
    ),
  )
  sections.push(
    diffSets('reference:ecoar_acao', new Set(ecoarAcoes.map((d) => d.id)), refByKind('ecoar_acao')),
  )
  sections.push(
    diffSets(
      'reference:path_patron',
      new Set(PATH_PATRONS.map((p) => p.id)),
      refByKind('path_patron'),
    ),
  )
  sections.push(
    diffSets(
      'reference:path_honor_code',
      new Set(PATH_HONOR_CODES.map((c) => c.id)),
      refByKind('path_honor_code'),
    ),
  )

  const singRows = (await sql`
    SELECT id, system_type, cost, tier
    FROM ecoar_singularities
    WHERE is_active = true
  `) as Array<{ id: string; system_type: string; cost: number; tier: number | null }>
  const singByType = (t: string) => new Set(singRows.filter((r) => r.system_type === t).map((r) => r.id))
  const costById = new Map(singRows.map((r) => [r.id, r.cost]))

  const ecoarCatalogIds = new Set(ecoarCatalogSeed.map((e) => e.id))
  const ecoarCatalogDb = (await sql`
    SELECT id FROM ecoar_catalog WHERE is_active = true
  `) as Array<{ id: string }>
  sections.push(diffSets('ecoar_catalog', ecoarCatalogIds, new Set(ecoarCatalogDb.map((r) => r.id))))

  const staticEcoarSing = new Set(ecoarSingularitiesSeed.map((s) => s.id))
  sections.push(diffSets('singularities:ecoar', staticEcoarSing, singByType('ecoar')))

  const staticCriacao = new Set(
    [...creationSingularities, ...legacyCreationSingularities].map((s) => s.id),
  )
  sections.push(diffSets('singularities:criacao', staticCriacao, singByType('criacao')))

  const staticMarciais = new Set(
    getAllMartialSchools().flatMap((school) => school.singularities.map((s) => s.id)),
  )
  const martialCostExpected = new Map<string, number>()
  for (const school of getAllMartialSchools()) {
    for (const sing of school.singularities) {
      martialCostExpected.set(sing.id, getOfficialMartialCostByLevel(sing.level) ?? sing.cost)
    }
  }
  const martialCostMismatches = Array.from(staticMarciais)
    .filter((id) => costById.has(id) && martialCostExpected.has(id))
    .filter((id) => costById.get(id) !== martialCostExpected.get(id))
    .map((id) => ({ id, expected: martialCostExpected.get(id)!, actual: costById.get(id)! }))
  sections.push(diffSets('singularities:marcial', staticMarciais, singByType('marcial'), martialCostMismatches))

  sections.push(
    diffSets(
      'singularities:racial',
      new Set(racialSingularities.map((s) => s.id)),
      singByType('racial'),
    ),
  )
  sections.push(
    diffSets(
      'singularities:desvantagem',
      new Set(disadvantages.map((d) => d.id)),
      singByType('desvantagem'),
    ),
  )

  const staticPath = new Set<string>([
    ...pathBookEntries.map((e) => e.id),
    ...pathBaseSingularities.map((e) => e.id),
    ...bruxarias.map((e) => e.id),
    ...cacadaPowers.map((e) => e.id),
    ...cacadaEnhancements.map((e) => e.id),
  ])
  sections.push(diffSets('singularities:path', staticPath, singByType('path')))

  const eqRows = (await sql`
    SELECT id, kind FROM equipment_catalog_items WHERE is_active = true
  `) as Array<{ id: string; kind: string }>
  const eqByKind = (kind: string) => new Set(eqRows.filter((r) => r.kind === kind).map((r) => r.id))
  sections.push(diffSets('equipment:weapon', new Set(weaponCatalog.map((w) => w.id)), eqByKind('weapon')))
  sections.push(diffSets('equipment:armor', new Set(armorCatalog.map((a) => a.id)), eqByKind('armor')))
  sections.push(diffSets('equipment:utility', new Set(utilityCatalog.map((u) => u.id)), eqByKind('utility')))

  const multRows = (await sql`
    SELECT id FROM equipment_cost_multiplier_tables
  `) as Array<{ id: string }>
  const staticMultIds = new Set(['default'])
  sections.push(diffSets('equipment:multipliers', staticMultIds, new Set(multRows.map((r) => r.id))))

  const runtimeRisk = [
    'data/*.ts — conteúdo permanece para seeds (ver scripts/seed-data/README.md); runtime exige Neon',
    'data/singularities.ts — legado; seed/paridade de criação; lookups devem preferir runtime catalog',
  ]

  const report = {
    generatedAt: new Date().toISOString(),
    sections,
    runtimeRisk,
    missingTotal: sections.reduce((n, s) => n + s.missingInDb.length, 0),
    extrasNote: 'Extras no DB são permitidos (ex.: import PDM). Só faltantes estático→DB falham o gate.',
  }

  const reportPath = resolve(process.cwd(), 'parity-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')

  console.log('=== Paridade catálogo data/*.ts × Neon ===\n')
  for (const s of sections) {
    const costNote = s.costMismatches.length ? ` | custo≠ ${s.costMismatches.length}` : ''
    console.log(
      `${s.family}: static=${s.staticCount} db=${s.dbCount} missing=${s.missingInDb.length} extra=${s.extraInDb.length}${costNote}`,
    )
    if (s.missingInDb.length) {
      console.log(`  FALTANDO no DB: ${s.missingInDb.slice(0, 40).join(', ')}${s.missingInDb.length > 40 ? '…' : ''}`)
    }
    if (s.costMismatches.length) {
      for (const m of s.costMismatches.slice(0, 20)) {
        console.log(`  custo ${m.id}: expected=${m.expected} actual=${m.actual}`)
      }
    }
  }

  console.log('\n=== Runtime risk (ainda estático no app) ===')
  for (const line of runtimeRisk) console.log(`- ${line}`)
  console.log(`\nRelatório: ${reportPath}`)
  console.log(`Total faltantes estático→DB: ${report.missingTotal}`)

  if (report.missingTotal > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
