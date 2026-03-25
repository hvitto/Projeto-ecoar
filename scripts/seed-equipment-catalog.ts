/**
 * Popula equipment_catalog_items e equipment_cost_multiplier_tables a partir dos dados estáticos.
 * Requer DATABASE_URL (ex.: defina em .env.local e rode a partir da raiz do projeto).
 *
 * Uso: npx tsx scripts/seed-equipment-catalog.ts
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { neon } from '@neondatabase/serverless'
import { weaponCatalog } from '../data/equipment/weapons'
import { armorCatalog } from '../data/equipment/armor'
import { utilityCatalog } from '../data/equipment/utilities'
import { equipmentCostMultiplierTables } from '../data/equipment/costMultipliers'

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

const MULTIPLIER_ID = 'default'

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL não definido.')
    process.exit(1)
  }

  const sql = neon(connectionString)

  console.log('Inserindo multiplicadores…')
  await sql`
    INSERT INTO equipment_cost_multiplier_tables (id, payload, updated_at)
    VALUES (${MULTIPLIER_ID}, ${JSON.stringify(equipmentCostMultiplierTables)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = now()
  `

  let n = 0
  for (const w of weaponCatalog) {
    await sql`
      INSERT INTO equipment_catalog_items (id, kind, payload, is_active, updated_at)
      VALUES (${w.id}, ${'weapon'}, ${JSON.stringify(w)}::jsonb, true, now())
      ON CONFLICT (id) DO UPDATE SET
        kind = EXCLUDED.kind,
        payload = EXCLUDED.payload,
        is_active = EXCLUDED.is_active,
        updated_at = now()
    `
    n++
  }
  for (const a of armorCatalog) {
    await sql`
      INSERT INTO equipment_catalog_items (id, kind, payload, is_active, updated_at)
      VALUES (${a.id}, ${'armor'}, ${JSON.stringify(a)}::jsonb, true, now())
      ON CONFLICT (id) DO UPDATE SET
        kind = EXCLUDED.kind,
        payload = EXCLUDED.payload,
        is_active = EXCLUDED.is_active,
        updated_at = now()
    `
    n++
  }
  for (const u of utilityCatalog) {
    await sql`
      INSERT INTO equipment_catalog_items (id, kind, payload, is_active, updated_at)
      VALUES (${u.id}, ${'utility'}, ${JSON.stringify(u)}::jsonb, true, now())
      ON CONFLICT (id) DO UPDATE SET
        kind = EXCLUDED.kind,
        payload = EXCLUDED.payload,
        is_active = EXCLUDED.is_active,
        updated_at = now()
    `
    n++
  }

  console.log(`Seed concluído: ${n} itens + tabelas de multiplicadores.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
