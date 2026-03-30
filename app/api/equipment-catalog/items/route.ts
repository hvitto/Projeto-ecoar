import { NextResponse } from 'next/server'
import { parseCatalogPayload } from '@/lib/equipmentCatalogSchemas'
import { getCatalogItemById, upsertCatalogItem } from '@/lib/equipmentCatalogRepository'
import { requireEquipmentAdmin } from '@/lib/isEquipmentAdmin'

export const dynamic = 'force-dynamic'

/** Cria um item novo; falha com 409 se o id já existir. */
export async function POST(request: Request) {
  const gate = await requireEquipmentAdmin(request)
  if (gate instanceof Response) return gate

  let body: { id?: string; payload?: unknown; is_active?: boolean; kind?: 'weapon' | 'armor' | 'utility' }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const id = body.id?.trim()
  if (!id) {
    return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
  }

  const kind = body.kind ?? (body.payload as { kind?: string } | undefined)?.kind
  if (kind !== 'weapon' && kind !== 'armor' && kind !== 'utility') {
    return NextResponse.json({ error: 'kind inválido ou ausente' }, { status: 400 })
  }

  const existing = await getCatalogItemById(id)
  if (existing) {
    return NextResponse.json({ error: 'Já existe um item com este id' }, { status: 409 })
  }

  if (body.payload === undefined || body.payload === null) {
    return NextResponse.json({ error: 'payload obrigatório' }, { status: 400 })
  }

  const parsed = parseCatalogPayload(kind, body.payload)
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Validação do item', details: parsed.error }, { status: 400 })
  }

  if (parsed.data.id !== id) {
    return NextResponse.json({ error: 'payload.id deve coincidir com o id enviado' }, { status: 400 })
  }
  if (parsed.data.kind !== kind) {
    return NextResponse.json({ error: 'payload.kind deve coincidir com kind' }, { status: 400 })
  }

  const isActive = body.is_active !== undefined ? Boolean(body.is_active) : true

  try {
    await upsertCatalogItem(id, kind, parsed.data, isActive)
    return NextResponse.json({ ok: true, id: parsed.data.id })
  } catch (err) {
    console.error('equipment-catalog item create:', err)
    return NextResponse.json({ error: 'Erro ao criar item' }, { status: 500 })
  }
}
