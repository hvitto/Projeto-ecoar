import { NextResponse } from 'next/server'
import { isEquipmentCatalogSchemaMissingError } from '@/lib/equipmentCatalogDbErrors'
import { defaultMultiplierTables, getMultiplierTablesFromDb, listAllCatalogItemsForAdmin } from '@/lib/equipmentCatalogRepository'
import { requireEquipmentAdmin } from '@/lib/isEquipmentAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const gate = await requireEquipmentAdmin(request)
  if (gate instanceof Response) return gate

  try {
    const rows = await listAllCatalogItemsForAdmin()
    const fromDb = await getMultiplierTablesFromDb()
    const multiplierTables = fromDb?.length ? fromDb : defaultMultiplierTables()
    return NextResponse.json({
      items: rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        is_active: r.is_active,
        updated_at: r.updated_at,
        payload: r.payload,
      })),
      multiplierTables,
    })
  } catch (err) {
    if (isEquipmentCatalogSchemaMissingError(err)) {
      console.warn('GET equipment-catalog/admin: tabelas do catálogo ausentes.')
      return NextResponse.json({
        items: [] as unknown[],
        multiplierTables: defaultMultiplierTables(),
        schemaMissing: true as const,
        hint:
          'Execute no Neon o SQL em scripts/migrations/002_equipment_catalog.sql e depois npm run seed:catalog.',
      })
    }
    console.error('GET equipment-catalog/admin:', err)
    return NextResponse.json({ error: 'Erro ao carregar catálogo (admin)' }, { status: 500 })
  }
}
