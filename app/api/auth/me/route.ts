import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'

export async function GET(request: Request) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const rows = (await sql`
      SELECT id, email, full_name, username, created_at
      FROM users WHERE id = ${auth.userId} LIMIT 1
    `) as Array<{ id: string; email: string; full_name: string; username: string; created_at: string }>
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const row = rows[0]
    const user = {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      username: row.username,
      createdAt: row.created_at,
    }
    return NextResponse.json({ user })
  } catch (err) {
    console.error('Me error:', err)
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
  }
}
