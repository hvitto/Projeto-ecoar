import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'
import { CharacterData } from '@/shared/types/auth'
import { dbRequiredResponse, emptyListWhenDbUnavailable } from '@/lib/api/databaseGuard'

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

export async function GET(request: Request) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const empty = emptyListWhenDbUnavailable()
  if (empty) return empty

  try {
    const rows = (await sql`
      SELECT id, user_id, name, data, created_at, updated_at
      FROM characters WHERE user_id = ${auth.userId}
      ORDER BY created_at DESC
    `) as Array<{ id: string; user_id: string; name: string; data: unknown; created_at: string; updated_at: string }>
    const characters = rows.map(rowToCharacter)
    return NextResponse.json(characters)
  } catch (err) {
    console.error('Characters list error:', err)
    return NextResponse.json({ error: 'Erro ao listar fichas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const dbRequired = dbRequiredResponse('Não é possível criar ficha sem banco de dados.')
  if (dbRequired) return dbRequired

  try {
    const body = (await request.json()) as CharacterData & { nome?: string }
    const name = body?.nome ?? body?.name ?? 'Sem nome'
    const dataPayload = { ...body } as Record<string, unknown>
    delete dataPayload.id

    const rows = (await sql`
      INSERT INTO characters (user_id, name, data)
      VALUES (${auth.userId}, ${name}, ${JSON.stringify(dataPayload)})
      RETURNING id, user_id, name, data, created_at, updated_at
    `) as Array<{ id: string; user_id: string; name: string; data: unknown; created_at: string; updated_at: string }>
    const row = rows[0]
    return NextResponse.json(rowToCharacter(row))
  } catch (err) {
    console.error('Character create error:', err)
    return NextResponse.json({ error: 'Erro ao criar ficha' }, { status: 500 })
  }
}
