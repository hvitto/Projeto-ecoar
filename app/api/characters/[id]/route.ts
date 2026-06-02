import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'
import { CharacterData } from '@/shared/types/auth'

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

  const { id } = await params
  try {
    let rows = (await sql`
      SELECT id, user_id, name, data, created_at, updated_at
      FROM characters WHERE id = ${id} AND user_id = ${auth.userId} LIMIT 1
    `) as Array<{ id: string; user_id: string; name: string; data: unknown; created_at: string; updated_at: string }>
    if (rows.length === 0) {
      const memberRows = (await sql`
        SELECT 1 FROM game_table_members gtm
        JOIN game_tables gt ON gt.id = gtm.table_id
        WHERE gtm.character_id = ${id}
          AND (gtm.user_id = ${auth.userId} OR gt.gm_user_id = ${auth.userId})
        LIMIT 1
      `) as Array<{ '?column?': number }>
      if (memberRows.length > 0) {
        rows = (await sql`
          SELECT id, user_id, name, data, created_at, updated_at
          FROM characters WHERE id = ${id} LIMIT 1
        `) as Array<{ id: string; user_id: string; name: string; data: unknown; created_at: string; updated_at: string }>
      }
    }
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })
    }
    return NextResponse.json(rowToCharacter(rows[0]))
  } catch (err) {
    console.error('Character get error:', err)
    return NextResponse.json({ error: 'Erro ao buscar ficha' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = (await request.json()) as CharacterData & { nome?: string; name?: string }
    const name = body?.nome ?? body?.name ?? 'Sem nome'
    const data = { ...body, id } as Record<string, unknown>

    let rows = (await sql`
      UPDATE characters
      SET name = ${name}, data = ${JSON.stringify(data)}, updated_at = now()
      WHERE id = ${id} AND user_id = ${auth.userId}
      RETURNING id, user_id, name, data, created_at, updated_at
    `) as Array<{ id: string; user_id: string; name: string; data: unknown; created_at: string; updated_at: string }>
    if (rows.length === 0) {
      const gmRows = (await sql`
        SELECT 1 FROM game_table_members gtm
        JOIN game_tables gt ON gt.id = gtm.table_id
        WHERE gtm.character_id = ${id} AND gt.gm_user_id = ${auth.userId}
        LIMIT 1
      `) as Array<{ '?column?': number }>
      if (gmRows.length > 0) {
        rows = (await sql`
          UPDATE characters
          SET name = ${name}, data = ${JSON.stringify(data)}, updated_at = now()
          WHERE id = ${id}
          RETURNING id, user_id, name, data, created_at, updated_at
        `) as Array<{ id: string; user_id: string; name: string; data: unknown; created_at: string; updated_at: string }>
      }
    }
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })
    }
    return NextResponse.json(rowToCharacter(rows[0]))
  } catch (err) {
    console.error('Character update error:', err)
    return NextResponse.json({ error: 'Erro ao atualizar ficha' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  try {
    const rows = (await sql`
      DELETE FROM characters WHERE id = ${id} AND user_id = ${auth.userId}
      RETURNING id
    `) as Array<{ id: string }>
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Ficha não encontrada' }, { status: 404 })
    }
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('Character delete error:', err)
    return NextResponse.json({ error: 'Erro ao deletar ficha' }, { status: 500 })
  }
}
