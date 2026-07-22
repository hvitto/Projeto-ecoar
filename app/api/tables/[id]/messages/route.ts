import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'
import { rollExpression } from '@/lib/dice/rollExpression'
import { publishTableChatMessage } from '@/lib/realtime/tableChatBus'
import type {
  PostTableMessageBody,
  TableMessage,
  TableRollPayload,
} from '@/shared/types/tables'

async function isMember(tableId: string, userId: string): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM game_table_members WHERE table_id = ${tableId} AND user_id = ${userId} LIMIT 1
  `) as Array<{ '?column?': number }>
  return rows.length > 0
}

function rowToMessage(row: {
  id: string
  table_id: string
  user_id: string
  character_id: string | null
  type: string
  body: string | null
  payload: unknown
  created_at: string
  user_name?: string | null
  character_name?: string | null
}): TableMessage {
  return {
    id: row.id,
    tableId: row.table_id,
    userId: row.user_id,
    characterId: row.character_id,
    type: row.type as TableMessage['type'],
    body: row.body,
    payload: (row.payload as TableRollPayload | null) ?? null,
    createdAt: row.created_at,
    userName: row.user_name ?? null,
    characterName: row.character_name ?? null,
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id: tableId } = await params
  try {
    if (!(await isMember(tableId, auth.userId))) {
      return NextResponse.json({ error: 'Mesa não encontrada ou acesso negado' }, { status: 404 })
    }

    const url = new URL(request.url)
    const after = url.searchParams.get('after')
    const limitRaw = parseInt(url.searchParams.get('limit') ?? '50', 10)
    const limit = Number.isFinite(limitRaw) ? Math.min(100, Math.max(1, limitRaw)) : 50

    const rows = after
      ? ((await sql`
          SELECT m.id, m.table_id, m.user_id, m.character_id, m.type, m.body, m.payload, m.created_at,
                 u.username AS user_name,
                 c.name AS character_name
          FROM game_table_messages m
          LEFT JOIN users u ON u.id = m.user_id
          LEFT JOIN characters c ON c.id = m.character_id
          WHERE m.table_id = ${tableId}
            AND m.created_at > (SELECT created_at FROM game_table_messages WHERE id = ${after} LIMIT 1)
          ORDER BY m.created_at ASC
          LIMIT ${limit}
        `) as Array<{
          id: string
          table_id: string
          user_id: string
          character_id: string | null
          type: string
          body: string | null
          payload: unknown
          created_at: string
          user_name: string | null
          character_name: string | null
        }>)
      : ((await sql`
          SELECT m.id, m.table_id, m.user_id, m.character_id, m.type, m.body, m.payload, m.created_at,
                 u.username AS user_name,
                 c.name AS character_name
          FROM game_table_messages m
          LEFT JOIN users u ON u.id = m.user_id
          LEFT JOIN characters c ON c.id = m.character_id
          WHERE m.table_id = ${tableId}
          ORDER BY m.created_at DESC
          LIMIT ${limit}
        `) as Array<{
          id: string
          table_id: string
          user_id: string
          character_id: string | null
          type: string
          body: string | null
          payload: unknown
          created_at: string
          user_name: string | null
          character_name: string | null
        }>)

    const messages = (after ? rows : [...rows].reverse()).map(rowToMessage)
    return NextResponse.json({ messages })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao listar mensagens' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id: tableId } = await params
  try {
    if (!(await isMember(tableId, auth.userId))) {
      return NextResponse.json({ error: 'Mesa não encontrada ou acesso negado' }, { status: 404 })
    }

    const body = (await request.json()) as PostTableMessageBody

    if (body.type === 'text') {
      const text = String(body.body ?? '').trim()
      if (!text) {
        return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
      }
      const inserted = (await sql`
        INSERT INTO game_table_messages (table_id, user_id, type, body)
        VALUES (${tableId}, ${auth.userId}, 'text', ${text})
        RETURNING id, table_id, user_id, character_id, type, body, payload, created_at
      `) as Array<{
        id: string
        table_id: string
        user_id: string
        character_id: string | null
        type: string
        body: string | null
        payload: unknown
        created_at: string
      }>
      const nameRows = (await sql`
        SELECT username FROM users WHERE id = ${auth.userId} LIMIT 1
      `) as Array<{ username: string }>
      const message = rowToMessage({
        ...inserted[0],
        user_name: nameRows[0]?.username ?? null,
      })
      void publishTableChatMessage(tableId, message)
      return NextResponse.json(message, { status: 201 })
    }

    if (body.type === 'roll') {
      const label = String(body.label ?? '').trim() || 'Rolagem'
      const expression = String(body.expression ?? '').trim()
      if (!expression) {
        return NextResponse.json({ error: 'Expressão de dados vazia' }, { status: 400 })
      }

      let characterId: string | null =
        body.characterId != null && String(body.characterId).trim() !== ''
          ? String(body.characterId)
          : null

      if (characterId) {
        const owned = (await sql`
          SELECT 1 FROM characters WHERE id = ${characterId} AND user_id = ${auth.userId} LIMIT 1
        `) as Array<{ '?column?': number }>
        const gm = (await sql`
          SELECT 1 FROM game_table_members
          WHERE table_id = ${tableId} AND user_id = ${auth.userId} AND role = 'gm'
          LIMIT 1
        `) as Array<{ '?column?': number }>
        if (owned.length === 0 && gm.length === 0) {
          characterId = null
        }
      }

      let rolled
      try {
        rolled = rollExpression(expression)
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Expressão inválida' },
          { status: 400 },
        )
      }

      let characterName: string | null = null
      if (characterId) {
        const nameRows = (await sql`
          SELECT name FROM characters WHERE id = ${characterId} LIMIT 1
        `) as Array<{ name: string }>
        characterName = nameRows[0]?.name ?? null
      }

      const payload: TableRollPayload = {
        label,
        expression: rolled.expression,
        normalized: rolled.normalized,
        total: rolled.total,
        faces: rolled.faces,
        dice: rolled.dice,
        detail: rolled.detail,
        characterName,
      }

      const inserted = (await sql`
        INSERT INTO game_table_messages (table_id, user_id, character_id, type, body, payload)
        VALUES (
          ${tableId},
          ${auth.userId},
          ${characterId},
          'roll',
          ${`${label}: ${rolled.detail}`},
          ${JSON.stringify(payload)}::jsonb
        )
        RETURNING id, table_id, user_id, character_id, type, body, payload, created_at
      `) as Array<{
        id: string
        table_id: string
        user_id: string
        character_id: string | null
        type: string
        body: string | null
        payload: unknown
        created_at: string
      }>

      const nameRows = (await sql`
        SELECT username FROM users WHERE id = ${auth.userId} LIMIT 1
      `) as Array<{ username: string }>
      const message = rowToMessage({
        ...inserted[0],
        user_name: nameRows[0]?.username ?? null,
        character_name: characterName,
      })
      void publishTableChatMessage(tableId, message)
      return NextResponse.json(message, { status: 201 })
    }

    return NextResponse.json({ error: 'Tipo de mensagem inválido' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
