import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyPassword, signToken } from '@/lib/auth/jwt'
import { config } from '@/lib/config'
import { AuthError } from '@/types/auth'

const EMAIL_REGEX = config.VALIDATION.EMAIL_REGEX
const MIN_PASSWORD = config.VALIDATION.MIN_PASSWORD_LENGTH

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !EMAIL_REGEX.test(String(email))) {
      return NextResponse.json({ success: false, error: AuthError.INVALID_EMAIL }, { status: 400 })
    }
    if (!password || String(password).length < MIN_PASSWORD) {
      return NextResponse.json({ success: false, error: AuthError.WEAK_PASSWORD }, { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase()
    const rows = (await sql`
      SELECT id, email, full_name, username, password_hash, created_at
      FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `) as Array<{ id: string; email: string; full_name: string; username: string; password_hash: string; created_at: string }>
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: AuthError.INVALID_CREDENTIALS }, { status: 401 })
    }

    const row = rows[0]
    const valid = await verifyPassword(String(password), row.password_hash)
    if (!valid) {
      return NextResponse.json({ success: false, error: AuthError.INVALID_CREDENTIALS }, { status: 401 })
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
    console.error('Login error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao fazer login' }, { status: 500 })
  }
}
