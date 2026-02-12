import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'
import { CharacterData } from '@/types/auth'

function rowToCharacter(row: { id: string; user_id: string; name: string; data: unknown; created_at: string; updated_at: string }) {
  const data = (row.data as CharacterData) || {}
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    data: { ...data, id: row.id },
  }
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
    const memberRows = (await sql`
      SELECT gtm.user_id, gtm.role, gtm.character_id
      FROM game_table_members gtm
      WHERE gtm.table_id = ${tableId} AND gtm.user_id = ${auth.userId} LIMIT 1
    `) as Array<{ user_id: string; role: string; character_id: string | null }>
    if (memberRows.length === 0) {
      return NextResponse.json({ error: 'Mesa não encontrada ou acesso negado' }, { status: 404 })
    }
    const isGm = memberRows[0].role === 'gm'

    const list = (await sql`
      SELECT gtm.user_id AS member_user_id, gtm.role, gtm.character_id, u.username AS member_username,
             c.id AS char_id, c.user_id AS char_user_id, c.name AS char_name, c.data AS char_data, c.created_at AS char_created_at, c.updated_at AS char_updated_at
      FROM game_table_members gtm
      LEFT JOIN users u ON u.id = gtm.user_id
      LEFT JOIN characters c ON c.id = gtm.character_id
      WHERE gtm.table_id = ${tableId} AND gtm.character_id IS NOT NULL
    `) as Array<{
      member_user_id: string
      role: string
      character_id: string | null
      member_username: string | null
      char_id: string
      char_user_id: string
      char_name: string
      char_data: unknown
      char_created_at: string
      char_updated_at: string
    }>

    const characters = list.map((r) => {
      const character = rowToCharacter({
        id: r.char_id,
        user_id: r.char_user_id,
        name: r.char_name,
        data: r.char_data,
        created_at: r.char_created_at,
        updated_at: r.char_updated_at,
      })
      const canEdit = isGm || r.member_user_id === auth.userId
      return {
        character,
        memberUserId: r.member_user_id,
        memberUsername: r.member_username ?? undefined,
        canEdit,
      }
    })

    return NextResponse.json(characters)
  } catch (err) {
    console.error('Table characters list error:', err)
    return NextResponse.json({ error: 'Erro ao listar fichas da mesa' }, { status: 500 })
  }
}
