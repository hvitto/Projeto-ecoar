import { mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { neon } from '@neondatabase/serverless'
import { loadEnvFiles } from './loadEnvFiles'

async function main() {
  loadEnvFiles()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL não definido.')
    process.exit(1)
  }
  const sql = neon(connectionString)
  const stamp = new Date().toISOString().slice(0, 10)
  const dir = resolve(process.cwd(), 'backups', `catalog-${stamp}`)
  mkdirSync(dir, { recursive: true })

  const ecoarCatalog = await sql`SELECT * FROM ecoar_catalog ORDER BY id`
  const singularities = await sql`SELECT * FROM ecoar_singularities ORDER BY system_type, id`
  const requirements = await sql`SELECT * FROM ecoar_singularity_requirements ORDER BY singularity_id, id`
  const effects = await sql`SELECT * FROM ecoar_singularity_effects ORDER BY singularity_id, display_order, id`
  const gameReference = await sql`SELECT * FROM game_reference_catalog ORDER BY kind, id`
  const equipment = await sql`SELECT * FROM equipment_catalog_items ORDER BY kind, id`
  const multipliers = await sql`SELECT * FROM equipment_cost_multiplier_tables ORDER BY id`

  const files: Record<string, unknown> = {
    'ecoar_catalog.json': ecoarCatalog,
    'ecoar_singularities.json': singularities,
    'ecoar_singularity_requirements.json': requirements,
    'ecoar_singularity_effects.json': effects,
    'game_reference_catalog.json': gameReference,
    'equipment_catalog_items.json': equipment,
    'equipment_cost_multiplier_tables.json': multipliers,
  }

  for (const [name, data] of Object.entries(files)) {
    writeFileSync(resolve(dir, name), JSON.stringify(data, null, 2), 'utf8')
  }

  const summary = {
    exportedAt: new Date().toISOString(),
    counts: {
      ecoar_catalog: (ecoarCatalog as unknown[]).length,
      ecoar_singularities: (singularities as unknown[]).length,
      ecoar_singularity_requirements: (requirements as unknown[]).length,
      ecoar_singularity_effects: (effects as unknown[]).length,
      game_reference_catalog: (gameReference as unknown[]).length,
      equipment_catalog_items: (equipment as unknown[]).length,
      equipment_cost_multiplier_tables: (multipliers as unknown[]).length,
    },
  }
  writeFileSync(resolve(dir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8')
  console.log(`Backup exportado em ${dir}`)
  console.log(JSON.stringify(summary.counts, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
