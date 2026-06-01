import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'
import { dbRequiredResponse, emptyListWhenDbUnavailable } from '@/lib/api/databaseGuard'
import { generateInviteToken, generateInviteCode } from '@/lib/tables/invite'
import type { GameTable, CreateTableBody } from '@/types/tables'

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

export async function GET(request: Request) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const empty = emptyListWhenDbUnavailable()
  if (empty) return empty

  try {
    const rows = (await sql`
      SELECT gt.id, gt.gm_user_id, gt.name, gt.cover_image_url, gt.next_session_at, gt.description,
             gt.invite_token, gt.invite_code, gt.invite_expires_at, gt.created_at, gt.updated_at
      FROM game_tables gt
      WHERE gt.gm_user_id = ${auth.userId}
         OR EXISTS (SELECT 1 FROM game_table_members gtm WHERE gtm.table_id = gt.id AND gtm.user_id = ${auth.userId})
      ORDER BY gt.updated_at DESC
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
    return NextResponse.json(rows.map(rowToTable))
  } catch (err) {
    console.error('Tables list error:', err)
    return NextResponse.json({ error: 'Erro ao listar mesas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const dbRequired = dbRequiredResponse('Não é possível criar mesa sem banco de dados.')
  if (dbRequired) return dbRequired

  try {
    const body = (await request.json()) as CreateTableBody
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'Nome da mesa é obrigatório' }, { status: 400 })
    }

    const inviteToken = generateInviteToken()
    let inviteCode = generateInviteCode(6)
    let existing = (await sql`SELECT id FROM game_tables WHERE invite_code = ${inviteCode} LIMIT 1`) as Array<{ id: string }>
    while (existing.length > 0) {
      inviteCode = generateInviteCode(6)
      existing = (await sql`SELECT id FROM game_tables WHERE invite_code = ${inviteCode} LIMIT 1`) as Array<{ id: string }>
    }

    const coverImageUrl = typeof body.coverImageUrl === 'string' ? body.coverImageUrl.trim() || null : null
    const nextSessionAt = body.nextSessionAt ? String(body.nextSessionAt) : null
    const description = typeof body.description === 'string' ? body.description.trim() || null : null

    const rows = (await sql`
      INSERT INTO game_tables (gm_user_id, name, cover_image_url, next_session_at, description, invite_token, invite_code)
      VALUES (${auth.userId}, ${name}, ${coverImageUrl}, ${nextSessionAt}, ${description}, ${inviteToken}, ${inviteCode})
      RETURNING id, gm_user_id, name, cover_image_url, next_session_at, description, invite_token, invite_code, invite_expires_at, created_at, updated_at
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
    const table = rowToTable(rows[0])

    await sql`
      INSERT INTO game_table_members (table_id, user_id, role)
      VALUES (${table.id}, ${auth.userId}, 'gm')
    `

    return NextResponse.json(table)
  } catch (err) {
    console.error('Table create error:', err)
    const message = err instanceof Error ? err.message : 'Erro ao criar mesa'
    const isDev = process.env.NODE_ENV === 'development'
    const hint = message.includes('does not exist') || message.includes('relation')
      ? ' Execute a migração em scripts/migrations/001_game_tables.sql no seu banco (Neon).'
      : ''
    return NextResponse.json(
      { error: isDev ? `${message}${hint}` : 'Erro ao criar mesa' },
      { status: 500 }
    )
  }
}
