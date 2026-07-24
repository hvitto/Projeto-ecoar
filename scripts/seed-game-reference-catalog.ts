import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { neon } from '@neondatabase/serverless'
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

function loadEnvFile(fileName: string) {
  const p = resolve(process.cwd(), fileName)
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

loadEnvFile('.env.local')
loadEnvFile('.env')

type Kind =
  | 'race'
  | 'path'
  | 'skill'
  | 'aptitude'
  | 'location'
  | 'soul_level'
  | 'martial_school'
  | 'disturbio_gatilho'
  | 'disturbio_efeito'
  | 'disturbio_penalidade'
  | 'disturbio_comum'
  | 'ecoar_acao'
  | 'path_patron'
  | 'path_honor_code'

async function ensureKindConstraint(sql: ReturnType<typeof neon>) {
  await sql`ALTER TABLE game_reference_catalog DROP CONSTRAINT IF EXISTS game_reference_catalog_kind_check`
  await sql`
    ALTER TABLE game_reference_catalog
    ADD CONSTRAINT game_reference_catalog_kind_check
    CHECK (kind IN (
      'race',
      'path',
      'skill',
      'aptitude',
      'location',
      'soul_level',
      'martial_school',
      'disturbio_gatilho',
      'disturbio_efeito',
      'disturbio_penalidade',
      'disturbio_comum',
      'ecoar_acao',
      'path_patron',
      'path_honor_code'
    ))
  `
}

async function upsert(
  sql: ReturnType<typeof neon>,
  kind: Kind,
  id: string,
  payload: unknown,
) {
  await sql`
    INSERT INTO game_reference_catalog (id, kind, payload, is_active, updated_at)
    VALUES (${id}, ${kind}, ${JSON.stringify(payload)}::jsonb, true, now())
    ON CONFLICT (kind, id) DO UPDATE SET
      payload = EXCLUDED.payload,
      is_active = true,
      updated_at = now()
  `
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL não definido.')
    process.exit(1)
  }

  const sql = neon(connectionString)
  await ensureKindConstraint(sql)
  let n = 0

  for (const item of races) {
    await upsert(sql, 'race', item.id, item)
    n++
  }
  for (const item of paths) {
    await upsert(sql, 'path', item.id, item)
    n++
  }
  for (const item of skills) {
    await upsert(sql, 'skill', item.id, item)
    n++
  }
  for (const item of aptitudes) {
    await upsert(sql, 'aptitude', item.id, item)
    n++
  }
  for (const item of locations) {
    await upsert(sql, 'location', item.id, item)
    n++
  }
  for (const item of soulLevels) {
    await upsert(sql, 'soul_level', String(item.nivel), item)
    n++
  }
  for (const item of martialSchools) {
    await upsert(sql, 'martial_school', item.id, item)
    n++
  }
  for (const item of disturbioIdentityGatilhos) {
    await upsert(sql, 'disturbio_gatilho', item.id, item)
    n++
  }
  for (const item of disturbioIdentityEfeitos) {
    await upsert(sql, 'disturbio_efeito', item.id, item)
    n++
  }
  for (const item of disturbioIdentityPenalidades) {
    await upsert(sql, 'disturbio_penalidade', item.id, item)
    n++
  }
  for (const item of disturbiosComuns) {
    await upsert(sql, 'disturbio_comum', item.id, item)
    n++
  }
  for (const item of ecoarAcoes) {
    await upsert(sql, 'ecoar_acao', item.id, item)
    n++
  }
  for (const item of PATH_PATRONS) {
    await upsert(sql, 'path_patron', item.id, item)
    n++
  }
  for (const item of PATH_HONOR_CODES) {
    await upsert(sql, 'path_honor_code', item.id, item)
    n++
  }

  console.log(`Seed game_reference_catalog concluído: ${n} documentos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
