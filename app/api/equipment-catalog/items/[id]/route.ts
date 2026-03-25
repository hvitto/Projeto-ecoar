import { NextResponse } from 'next/server'
import { parseCatalogPayload } from '@/lib/equipmentCatalogSchemas'
import { getCatalogItemById, softDeleteCatalogItem, upsertCatalogItem } from '@/lib/equipmentCatalogRepository'
import { requireEquipmentAdmin } from '@/lib/isEquipmentAdmin'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(request: Request, ctx: Ctx) {
  return upsertHandler(request, ctx, 'put')
}

export async function PATCH(request: Request, ctx: Ctx) {
  return upsertHandler(request, ctx, 'patch')
}

async function upsertHandler(request: Request, ctx: Ctx, mode: 'put' | 'patch') {
  const gate = await requireEquipmentAdmin(request)
  if (gate instanceof Response) return gate

  const { id: pathId } = await ctx.params
  const pathIdDecoded = decodeURIComponent(pathId)

  let body: { payload?: unknown; is_active?: boolean; kind?: 'weapon' | 'armor' | 'utility' }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const existing = await getCatalogItemById(pathIdDecoded)
  const kind = body.kind ?? (body.payload as { kind?: string } | undefined)?.kind ?? existing?.kind
  if (kind !== 'weapon' && kind !== 'armor' && kind !== 'utility') {
    return NextResponse.json({ error: 'kind inválido ou ausente' }, { status: 400 })
  }

  let payload = body.payload
  if (mode === 'patch' && (payload === undefined || payload === null) && existing) {
    payload = existing.payload
  }
  if (payload === undefined || payload === null) {
    return NextResponse.json({ error: 'payload obrigatório' }, { status: 400 })
  }

  const parsed = parseCatalogPayload(kind, payload)
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Validação do item', details: parsed.error }, { status: 400 })
  }

  if (parsed.data.id !== pathIdDecoded) {
    return NextResponse.json({ error: 'payload.id deve coincidir com o id da URL' }, { status: 400 })
  }
  if (parsed.data.kind !== kind) {
    return NextResponse.json({ error: 'payload.kind deve coincidir com kind' }, { status: 400 })
  }

  const isActive = body.is_active !== undefined ? Boolean(body.is_active) : (existing?.is_active ?? true)

  try {
    await upsertCatalogItem(pathIdDecoded, kind, parsed.data, isActive)
    return NextResponse.json({ ok: true, id: pathIdDecoded })
  } catch (err) {
    console.error('equipment-catalog item upsert:', err)
    return NextResponse.json({ error: 'Erro ao salvar item' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const gate = await requireEquipmentAdmin(_request)
  if (gate instanceof Response) return gate

  const { id: pathId } = await ctx.params
  const pathIdDecoded = decodeURIComponent(pathId)

  try {
    const ok = await softDeleteCatalogItem(pathIdDecoded)
    if (!ok) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('equipment-catalog item delete:', err)
    return NextResponse.json({ error: 'Erro ao desativar item' }, { status: 500 })
  }
}
