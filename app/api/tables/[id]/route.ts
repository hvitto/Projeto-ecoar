import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'
import type { GameTable, TableMember } from '@/shared/types/tables'

function rowToTable(row: {
  id: string
  gm_user_id: string
  name: string
  cover_image_url: string | null
  next_session_at: string | null
  description: string | null
  invite_token: string
  invite_code: string | null
  invite_expires_at: string | null
  created_at: string
  updated_at: string
}): GameTable {
  return {
    id: row.id,
    gmUserId: row.gm_user_id,
    name: row.name,
    coverImageUrl: row.cover_image_url,
    nextSessionAt: row.next_session_at,
    description: row.description,
    inviteToken: row.invite_token,
    inviteCode: row.invite_code,
    inviteExpiresAt: row.invite_expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function isMember(tableId: string, userId: string): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM game_table_members WHERE table_id = ${tableId} AND user_id = ${userId} LIMIT 1
  `) as Array<{ '?column?': number }>
  return rows.length > 0
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id: tableId } = await params
  try {
    const member = await isMember(tableId, auth.userId)
    if (!member) {
      return NextResponse.json({ error: 'Mesa não encontrada ou acesso negado' }, { status: 404 })
    }

    const tableRows = (await sql`
      SELECT id, gm_user_id, name, cover_image_url, next_session_at, description, invite_token, invite_code, invite_expires_at, created_at, updated_at
      FROM game_tables WHERE id = ${tableId} LIMIT 1
    `) as Array<{
      id: string
      gm_user_id: string
      name: string
      cover_image_url: string | null
      next_session_at: string | null
      description: string | null
      invite_token: string
      invite_code: string | null
      invite_expires_at: string | null
      created_at: string
      updated_at: string
    }>
    if (tableRows.length === 0) {
      return NextResponse.json({ error: 'Mesa não encontrada' }, { status: 404 })
    }

    const memberRows = (await sql`
      SELECT gtm.table_id, gtm.user_id, gtm.role, gtm.character_id, gtm.joined_at,
             u.username AS user_name,
             c.name AS character_name
      FROM game_table_members gtm
      LEFT JOIN users u ON u.id = gtm.user_id
      LEFT JOIN characters c ON c.id = gtm.character_id
      WHERE gtm.table_id = ${tableId}
    `) as Array<{
      table_id: string
      user_id: string
      role: string
      character_id: string | null
      joined_at: string
      user_name: string | null
      character_name: string | null
    }>

    const members: TableMember[] = memberRows.map((r) => ({
      tableId: r.table_id,
      userId: r.user_id,
      role: r.role as TableMember['role'],
      characterId: r.character_id,
      joinedAt: r.joined_at,
      userName: r.user_name ?? undefined,
      characterName: r.character_name ?? undefined,
    }))

    const myEntry = memberRows.find((r) => r.user_id === auth.userId)
    const table = rowToTable(tableRows[0])
    return NextResponse.json({
      ...table,
      members,
      myRole: myEntry ? (myEntry.role as TableMember['role']) : undefined,
      myCharacterId: myEntry?.character_id ?? undefined,
    })
  } catch (err) {
    console.error('Table get error:', err)
    return NextResponse.json({ error: 'Erro ao buscar mesa' }, { status: 500 })
  }
}
