import { NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const SCOPES = 'email profile'

export async function GET(request: Request) {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google login não configurado' }, { status: 500 })
  }

  const origin = process.env.NEXT_PUBLIC_API_URL || request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '') || ''
  const base = origin.replace(/\/$/, '')
  const redirectUri = `${base}/api/auth/google/callback`

  const state = Math.random().toString(36).slice(2) + Date.now().toString(36)
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return NextResponse.redirect(url)
}
