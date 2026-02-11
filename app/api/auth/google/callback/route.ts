import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { signToken } from '@/lib/auth/jwt'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

function getOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_API_URL || request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '') || ''
}

function redirectToLogin(base: string, error?: string) {
  const url = new URL(base)
  if (error) url.searchParams.set('error', error)
  return NextResponse.redirect(url.toString())
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const base = getOrigin(request).replace(/\/$/, '')

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return redirectToLogin(base, 'google_not_configured')
  }

  if (!code) {
    return redirectToLogin(base, 'missing_code')
  }

  const redirectUri = `${base}/api/auth/google/callback`

  let accessToken: string
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('Google token error:', tokenRes.status, err)
      return redirectToLogin(base, 'token_exchange_failed')
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string }
    const at = tokenData.access_token
    if (!at) return redirectToLogin(base, 'token_exchange_failed')
    accessToken = at
  } catch (err) {
    console.error('Google token fetch error:', err)
    return redirectToLogin(base, 'token_exchange_failed')
  }

  let email: string
  let name: string
  let picture: string | null
  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!userRes.ok) {
      console.error('Google userinfo error:', userRes.status)
      return redirectToLogin(base, 'userinfo_failed')
    }
    const userInfo = (await userRes.json()) as { email?: string; name?: string; picture?: string }
    email = userInfo.email?.trim().toLowerCase() || ''
    name = userInfo.name?.trim() || 'Usuário'
    picture = userInfo.picture || null
    if (!email) return redirectToLogin(base, 'no_email')
  } catch (err) {
    console.error('Google userinfo fetch error:', err)
    return redirectToLogin(base, 'userinfo_failed')
  }

  const existing = (await sql`
    SELECT id, auth_provider, email_verified_at FROM users WHERE email = ${email} LIMIT 1
  `) as Array<{ id: string; auth_provider: string; email_verified_at: string | null }>

  let userId: string

  if (existing.length > 0) {
    const row = existing[0]
    if (row.auth_provider === 'email') {
      return redirectToLogin(base, 'email_already_used')
    }
    userId = row.id
    await sql`
      UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()), avatar_url = ${picture}, full_name = ${name}
      WHERE id = ${userId}
    `
  } else {
    const baseUsername = email.replace(/@.*/, '').replace(/[^a-z0-9_-]/g, '_').slice(0, 18)
    let username = baseUsername
    let suffix = 0
    while (true) {
      const taken = (await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`) as Array<{ id: string }>
      if (taken.length === 0) break
      suffix += 1
      username = `${baseUsername}${suffix}`.slice(0, 20)
    }

    const rows = (await sql`
      INSERT INTO users (email, full_name, username, password_hash, auth_provider, email_verified_at, avatar_url)
      VALUES (${email}, ${name}, ${username}, NULL, 'google', now(), ${picture})
      RETURNING id
    `) as Array<{ id: string }>
    userId = rows[0].id
  }

  const token = await signToken({ userId })
  return NextResponse.redirect(`${base}/?token=${encodeURIComponent(token)}`)
}
