import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth/jwt'
import { getDemoAccountById } from '@/lib/config'

/**
 * POST /api/auth/demo
 * Body opcional: `{ "accountId": "demo" | "admin" | "mestre" | "jogador1" | ... }`
 * Sem corpo ou id inválido: usa a conta `demo` (primeira).
 */
export async function POST(request: Request) {
  try {
    let accountId: string | undefined
    try {
      const body = (await request.json()) as { accountId?: string }
      if (body && typeof body.accountId === 'string') accountId = body.accountId
    } catch {
      /* corpo vazio ou não-JSON */
    }

    const account = getDemoAccountById(accountId)
    if (!account) {
      return NextResponse.json({ success: false, error: 'Conta de teste inválida' }, { status: 400 })
    }

    const passwordHash = await hashPassword(account.password)

    const existing = (await sql`
      SELECT id, email, full_name, username, created_at
      FROM users WHERE email = ${account.email} LIMIT 1
    `) as Array<{ id: string; email: string; full_name: string; username: string; created_at: string }>

    let row: { id: string; email: string; full_name: string; username: string; created_at: string }

    if (existing.length > 0) {
      await sql`
        UPDATE users
        SET password_hash = ${passwordHash},
            full_name = ${account.fullName},
            username = ${account.username},
            email_verified_at = now()
        WHERE email = ${account.email}
      `
      row = existing[0]
    } else {
      const inserted = (await sql`
        INSERT INTO users (email, full_name, username, password_hash, auth_provider, email_verified_at)
        VALUES (${account.email}, ${account.fullName}, ${account.username}, ${passwordHash}, 'email', now())
        RETURNING id, email, full_name, username, created_at
      `) as Array<{ id: string; email: string; full_name: string; username: string; created_at: string }>
      if (inserted.length === 0) {
        return NextResponse.json({ success: false, error: 'Erro ao criar usuário de teste' }, { status: 500 })
      }
      row = inserted[0]
    }

    const user = {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      username: row.username,
      createdAt: row.created_at,
    }
    const token = await signToken({ userId: row.id })
    return NextResponse.json({ success: true, user, token })
  } catch (err) {
    console.error('Demo login error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao entrar com conta de teste' }, { status: 500 })
  }
}
