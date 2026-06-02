import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'
import type { JoinTableBody } from '@/shared/types/tables'

export async function POST(request: Request) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as JoinTableBody
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''

    if (!token && !code) {
      return NextResponse.json({ error: 'Informe o token do link ou o código da mesa' }, { status: 400 })
    }

    let tableId: string | null = null
    if (token) {
      const rows = (await sql`
        SELECT id FROM game_tables WHERE invite_token = ${token} LIMIT 1
      `) as Array<{ id: string }>
      if (rows.length > 0) tableId = rows[0].id
    }
    if (!tableId && code) {
      const rows = (await sql`
        SELECT id FROM game_tables WHERE invite_code = ${code} LIMIT 1
      `) as Array<{ id: string }>
      if (rows.length > 0) tableId = rows[0].id
    }

    if (!tableId) {
      return NextResponse.json({ error: 'Link ou código inválido' }, { status: 404 })
    }

    const existing = (await sql`
      SELECT 1 FROM game_table_members WHERE table_id = ${tableId} AND user_id = ${auth.userId} LIMIT 1
    `) as Array<{ '?column?': number }>
    if (existing.length > 0) {
      return NextResponse.json({ success: true, tableId, alreadyMember: true })
    }

    await sql`
      INSERT INTO game_table_members (table_id, user_id, role)
      VALUES (${tableId}, ${auth.userId}, 'player')
    `

    await sql`
      UPDATE game_tables SET updated_at = now() WHERE id = ${tableId}
    `

    return NextResponse.json({ success: true, tableId })
  } catch (err) {
    console.error('Table join error:', err)
    return NextResponse.json({ error: 'Erro ao entrar na mesa' }, { status: 500 })
  }
}
