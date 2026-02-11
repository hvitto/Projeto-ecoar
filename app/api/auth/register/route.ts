import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth/jwt'
import { config } from '@/lib/config'
import { AuthError } from '@/types/auth'

const EMAIL_REGEX = config.VALIDATION.EMAIL_REGEX
const MIN_PASSWORD = config.VALIDATION.MIN_PASSWORD_LENGTH
const MIN_FULLNAME = config.VALIDATION.MIN_FULLNAME_LENGTH
const MAX_FULLNAME = config.VALIDATION.MAX_FULLNAME_LENGTH
const USERNAME_REGEX = config.VALIDATION.USERNAME_REGEX
const MIN_USERNAME = config.VALIDATION.MIN_USERNAME_LENGTH
const MAX_USERNAME = config.VALIDATION.MAX_USERNAME_LENGTH

function validateEmail(email: string): string | null {
  if (!EMAIL_REGEX.test(email)) return AuthError.INVALID_EMAIL
  return null
}

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD) return AuthError.WEAK_PASSWORD
  return null
}

function validateFullName(fullName: string): string | null {
  const t = fullName.trim()
  if (!t) return AuthError.FULLNAME_REQUIRED
  if (t.length < MIN_FULLNAME || t.length > MAX_FULLNAME) return `Nome completo deve ter entre ${MIN_FULLNAME} e ${MAX_FULLNAME} caracteres`
  return null
}

function validateUsername(username: string): string | null {
  const t = username.trim().toLowerCase()
  if (!t) return AuthError.USERNAME_REQUIRED
  if (t.length < MIN_USERNAME || t.length > MAX_USERNAME) return AuthError.INVALID_USERNAME
  if (!USERNAME_REGEX.test(t)) return AuthError.INVALID_USERNAME
  if (t.startsWith('-') || t.startsWith('_') || t.endsWith('-') || t.endsWith('_')) return AuthError.INVALID_USERNAME
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, username } = body as { email?: string; password?: string; fullName?: string; username?: string }

    const emailError = email != null ? validateEmail(String(email)) : AuthError.INVALID_EMAIL
    if (emailError) {
      return NextResponse.json({ success: false, error: emailError }, { status: 400 })
    }

    const passwordError = password != null ? validatePassword(String(password)) : AuthError.WEAK_PASSWORD
    if (passwordError) {
      return NextResponse.json({ success: false, error: passwordError }, { status: 400 })
    }

    const fullNameError = fullName != null ? validateFullName(String(fullName)) : AuthError.FULLNAME_REQUIRED
    if (fullNameError) {
      return NextResponse.json({ success: false, error: fullNameError }, { status: 400 })
    }

    const usernameError = username != null ? validateUsername(String(username)) : AuthError.USERNAME_REQUIRED
    if (usernameError) {
      return NextResponse.json({ success: false, error: usernameError }, { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase()
    const normalizedUsername = String(username).trim().toLowerCase()

    const byEmail = (await sql`SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1`) as Array<{ id: string }>
    if (byEmail.length > 0) {
      return NextResponse.json({ success: false, error: AuthError.EMAIL_ALREADY_EXISTS }, { status: 409 })
    }
    const byUsername = (await sql`SELECT id FROM users WHERE username = ${normalizedUsername} LIMIT 1`) as Array<{ id: string }>
    if (byUsername.length > 0) {
      return NextResponse.json({ success: false, error: AuthError.USERNAME_ALREADY_EXISTS }, { status: 409 })
    }

    const passwordHash = await hashPassword(String(password))
    const rows = (await sql`
      INSERT INTO users (email, full_name, username, password_hash)
      VALUES (${normalizedEmail}, ${String(fullName).trim()}, ${normalizedUsername}, ${passwordHash})
      RETURNING id, email, full_name, username, created_at
    `) as Array<{ id: string; email: string; full_name: string; username: string; created_at: string }>
    const row = rows[0]
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
    console.error('Register error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao cadastrar' }, { status: 500 })
  }
}
