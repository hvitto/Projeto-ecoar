import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth/jwt'
import { config } from '@/lib/config'

const DEMO_EMAIL = config.DEMO_ACCOUNT.email
const DEMO_PASSWORD = config.DEMO_ACCOUNT.password
const DEMO_FULL_NAME = 'Usuário Demo'
const DEMO_USERNAME = 'demo'

/**
 * POST /api/auth/demo
 * Cria o usuário demo no banco se não existir e retorna o token (login com um clique).
 */
export async function POST() {
  try {
    const passwordHash = await hashPassword(DEMO_PASSWORD)

    const existing = (await sql`
      SELECT id, email, full_name, username, created_at
      FROM users WHERE email = ${DEMO_EMAIL} LIMIT 1
    `) as Array<{ id: string; email: string; full_name: string; username: string; created_at: string }>

    let row: { id: string; email: string; full_name: string; username: string; created_at: string }

    if (existing.length > 0) {
      await sql`
        UPDATE users
        SET password_hash = ${passwordHash}, full_name = ${DEMO_FULL_NAME}, username = ${DEMO_USERNAME}, email_verified_at = now()
        WHERE email = ${DEMO_EMAIL}
      `
      row = existing[0]
    } else {
      const inserted = (await sql`
        INSERT INTO users (email, full_name, username, password_hash, auth_provider, email_verified_at)
        VALUES (${DEMO_EMAIL}, ${DEMO_FULL_NAME}, ${DEMO_USERNAME}, ${passwordHash}, 'email', now())
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
