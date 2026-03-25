import { NextResponse } from 'next/server'
import { parseMultiplierTables } from '@/lib/equipmentCatalogSchemas'
import { setMultiplierTablesInDb } from '@/lib/equipmentCatalogRepository'
import { requireEquipmentAdmin } from '@/lib/isEquipmentAdmin'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  const gate = await requireEquipmentAdmin(request)
  if (gate instanceof Response) return gate

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = parseMultiplierTables(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Validação das tabelas', details: parsed.error }, { status: 400 })
  }

  try {
    await setMultiplierTablesInDb(parsed.data)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('equipment-catalog multipliers:', err)
    return NextResponse.json({ error: 'Erro ao salvar multiplicadores' }, { status: 500 })
  }
}
