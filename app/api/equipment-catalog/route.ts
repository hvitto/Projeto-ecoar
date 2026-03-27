import { NextResponse } from 'next/server'
import { isEquipmentCatalogSchemaMissingError } from '@/lib/equipmentCatalogDbErrors'
import {
  defaultMultiplierTables,
  getMultiplierTablesFromDb,
  listActiveCatalogItems,
  splitItemsByKind,
} from '@/lib/equipmentCatalogRepository'

export const dynamic = 'force-dynamic'

let warnedMissingDatabaseUrl = false

/** Resposta alinhada ao cliente: vazio → fallback para dados estáticos (sem 500). */
function emptyCatalogResponse() {
  return NextResponse.json({
    weapons: [],
    armor: [],
    utilities: [],
    multiplierTables: [],
    source: 'empty' as const,
  })
}

export async function GET() {
  if (!process.env.DATABASE_URL?.trim()) {
    if (!warnedMissingDatabaseUrl) {
      warnedMissingDatabaseUrl = true
      console.warn(
        'GET equipment-catalog: DATABASE_URL não definido. Resposta vazia; o cliente usa o catálogo estático (data/equipment).'
      )
    }
    return emptyCatalogResponse()
  }

  try {
    const items = await listActiveCatalogItems()
    if (items.length === 0) {
      return emptyCatalogResponse()
    }
    const { weapons, armor, utilities } = splitItemsByKind(items)
    const fromDb = await getMultiplierTablesFromDb()
    const multiplierTables = fromDb?.length ? fromDb : defaultMultiplierTables()
    return NextResponse.json({
      weapons,
      armor,
      utilities,
      multiplierTables,
      source: 'database' as const,
    })
  } catch (err) {
    if (isEquipmentCatalogSchemaMissingError(err)) {
      console.warn(
        'GET equipment-catalog: tabelas ausentes (aplique scripts/migrations/002_equipment_catalog.sql e npm run seed:catalog). Usando fallback vazio.'
      )
      return emptyCatalogResponse()
    }
    console.error('GET equipment-catalog:', err)
    return NextResponse.json({ error: 'Erro ao carregar catálogo' }, { status: 500 })
  }
}
