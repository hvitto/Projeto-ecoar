/**
 * Valida paridade entre fontes estáticas e banco para singularidades de Criação/Marciais.
 * Uso: npx tsx scripts/validate-system-singularity-parity.ts
 */
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { neon } from '@neondatabase/serverless'
import { creationSingularities } from '../data/creationSingularities'
import { singularities as legacyCreationSingularities } from '../data/singularities'
import { getAllMartialSchools } from '../data/martialSchoolSingularities'
import { racialSingularities } from '../data/racialSingularities'

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

async function main() {
  loadEnvFiles()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL não definido.')
    process.exit(1)
  }
  const sql = neon(connectionString)
  const staticCriacao = new Set<string>([...creationSingularities, ...legacyCreationSingularities].map((s) => s.id))
  const staticMarciais = new Set<string>(getAllMartialSchools().flatMap((school) => school.singularities.map((s) => s.id)))
  const staticMartialCostById = new Map<string, number>(
    getAllMartialSchools().flatMap((school) => school.singularities.map((s) => [s.id, s.cost] as const))
  )
  const staticRaciais = new Set<string>(racialSingularities.map((s) => s.id))

  const dbRows = (await sql`
    SELECT id, system_type, cost
    FROM ecoar_singularities
    WHERE is_active = true
      AND system_type IN ('criacao', 'marcial', 'racial')
  `) as Array<{ id: string; system_type: 'criacao' | 'marcial' | 'racial'; cost: number }>

  const dbCriacao = new Set(dbRows.filter((r) => r.system_type === 'criacao').map((r) => r.id))
  const dbMarciais = new Set(dbRows.filter((r) => r.system_type === 'marcial').map((r) => r.id))
  const dbRaciais = new Set(dbRows.filter((r) => r.system_type === 'racial').map((r) => r.id))

  const missingCriacao = Array.from(staticCriacao).filter((id) => !dbCriacao.has(id))
  const missingMarciais = Array.from(staticMarciais).filter((id) => !dbMarciais.has(id))
  const missingRaciais = Array.from(staticRaciais).filter((id) => !dbRaciais.has(id))
  const extraCriacao = Array.from(dbCriacao).filter((id) => !staticCriacao.has(id))
  const extraMarciais = Array.from(dbMarciais).filter((id) => !staticMarciais.has(id))
  const extraRaciais = Array.from(dbRaciais).filter((id) => !staticRaciais.has(id))
  const martialCostMismatches = dbRows
    .filter((r) => r.system_type === 'marcial' && staticMartialCostById.has(r.id))
    .filter((r) => (staticMartialCostById.get(r.id) ?? r.cost) !== r.cost)
    .map((r) => ({
      id: r.id,
      expected: staticMartialCostById.get(r.id),
      actual: r.cost,
    }))

  console.log('Paridade singularidades')
  console.log(`Criação estático: ${staticCriacao.size} | banco: ${dbCriacao.size} | faltantes: ${missingCriacao.length} | extras: ${extraCriacao.length}`)
  console.log(`Marciais estático: ${staticMarciais.size} | banco: ${dbMarciais.size} | faltantes: ${missingMarciais.length} | extras: ${extraMarciais.length}`)
  console.log(`Raciais estático: ${staticRaciais.size} | banco: ${dbRaciais.size} | faltantes: ${missingRaciais.length} | extras: ${extraRaciais.length}`)
  console.log(`Marciais com custo divergente: ${martialCostMismatches.length}`)

  if (missingCriacao.length) console.log(`Faltando Criação: ${missingCriacao.join(', ')}`)
  if (missingMarciais.length) console.log(`Faltando Marciais: ${missingMarciais.join(', ')}`)
  if (missingRaciais.length) console.log(`Faltando Raciais: ${missingRaciais.join(', ')}`)
  if (extraCriacao.length) console.log(`Extras Criação no banco: ${extraCriacao.join(', ')}`)
  if (extraMarciais.length) console.log(`Extras Marciais no banco: ${extraMarciais.join(', ')}`)
  if (extraRaciais.length) console.log(`Extras Raciais no banco: ${extraRaciais.join(', ')}`)
  if (martialCostMismatches.length) {
    console.log('Divergências de custo marciais:')
    martialCostMismatches.forEach((item) => {
      console.log(`- ${item.id}: esperado=${item.expected} | atual=${item.actual}`)
    })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
