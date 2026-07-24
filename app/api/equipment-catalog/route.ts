import { NextResponse } from 'next/server'
import { isEquipmentCatalogSchemaMissingError } from '@/lib/equipmentCatalogDbErrors'
import {
  getMultiplierTablesFromDb,
  listActiveCatalogItems,
  splitItemsByKind,
} from '@/lib/equipmentCatalogRepository'

export const dynamic = 'force-dynamic'

let warnedMissingDatabaseUrl = false

/** Resposta vazia: o cliente não usa mais fallback estático. */
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
        'GET equipment-catalog: DATABASE_URL não definido. Resposta vazia.',
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
    if (!fromDb?.length) {
      return emptyCatalogResponse()
    }
    return NextResponse.json({
      weapons,
      armor,
      utilities,
      multiplierTables: fromDb,
      source: 'database' as const,
    })
  } catch (err) {
    if (isEquipmentCatalogSchemaMissingError(err)) {
      console.warn(
        'GET equipment-catalog: tabelas ausentes (aplique scripts/migrations/002_equipment_catalog.sql e yarn seed:catalog).',
      )
      return emptyCatalogResponse()
    }
    console.error('GET equipment-catalog:', err)
    return NextResponse.json({ error: 'Erro ao carregar catálogo' }, { status: 500 })
  }
}
