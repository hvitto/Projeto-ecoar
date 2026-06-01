import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth/jwt'
import { getDemoAccountById } from '@/lib/config'
import { createLocalDemoSession } from '@/lib/auth/demoLoginLocal'

export async function POST(request: Request) {
  let accountId: string | undefined
  try {
    try {
      const body = (await request.json()) as { accountId?: string }
      if (body && typeof body.accountId === 'string') accountId = body.accountId
    } catch {
      // body vazio
    }

    const account = getDemoAccountById(accountId)
    if (!account) {
      return NextResponse.json({ success: false, error: 'Conta de teste inválida' }, { status: 400 })
    }

    if (!process.env.DATABASE_URL?.trim()) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          {
            success: false,
            error: 'Login demo indisponível: DATABASE_URL não configurada no servidor.',
          },
          { status: 503 },
        )
      }

      const local = await createLocalDemoSession(accountId)
      if (!local.ok) {
        return NextResponse.json({ success: false, error: local.error }, { status: local.status })
      }
      return NextResponse.json({ success: true, user: local.user, token: local.token })
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
    const message = err instanceof Error ? err.message : ''
    if (message.includes('DATABASE_URL')) {
      return NextResponse.json(
        {
          success: false,
          error:
            'DATABASE_URL não configurada. Crie um .env.local com DATABASE_URL (Neon) e JWT_SECRET, ou use só JWT_SECRET em desenvolvimento.',
        },
        { status: 503 },
      )
    }
    if (message.includes('JWT_SECRET')) {
      return NextResponse.json(
        {
          success: false,
          error: 'JWT_SECRET não configurado. Adicione JWT_SECRET ao .env.local (veja README).',
        },
        { status: 503 },
      )
    }
    return NextResponse.json({ success: false, error: 'Erro ao entrar com conta de teste' }, { status: 500 })
  }
}
