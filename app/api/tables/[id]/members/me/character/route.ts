import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id: tableId } = await params
  try {
    const body = (await request.json()) as { characterId?: string }
    const characterId = typeof body.characterId === 'string' ? body.characterId.trim() : null

    const memberRows = (await sql`
      SELECT role FROM game_table_members WHERE table_id = ${tableId} AND user_id = ${auth.userId} LIMIT 1
    `) as Array<{ role: string }>
    if (memberRows.length === 0) {
      return NextResponse.json({ error: 'Mesa não encontrada ou acesso negado' }, { status: 404 })
    }
    const isPlayer = memberRows[0].role === 'player'
    if (!isPlayer) {
      return NextResponse.json({ error: 'Apenas jogadores vinculam ficha à mesa' }, { status: 400 })
    }

    if (characterId) {
      const charRows = (await sql`
        SELECT id FROM characters WHERE id = ${characterId} AND user_id = ${auth.userId} LIMIT 1
      `) as Array<{ id: string }>
      if (charRows.length === 0) {
        return NextResponse.json({ error: 'Ficha não encontrada ou não pertence a você' }, { status: 404 })
      }
    }

    await sql`
      UPDATE game_table_members
      SET character_id = ${characterId}
      WHERE table_id = ${tableId} AND user_id = ${auth.userId}
    `

    await sql`
      UPDATE game_tables SET updated_at = now() WHERE id = ${tableId}
    `

    return NextResponse.json({ success: true, characterId })
  } catch (err) {
    console.error('Table member character update error:', err)
    return NextResponse.json({ error: 'Erro ao vincular ficha' }, { status: 500 })
  }
}
