import { NextResponse } from 'next/server'
import { SESSION_MAX_AGE_SECONDS } from '@/lib/auth/jwt'

export const SESSION_COOKIE_NAME = 'ecoar_session'

function cookieSecure(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function readSessionToken(request: Request): string | null {
  const header = request.headers.get('cookie')
  if (!header) return null
  const parts = header.split(';')
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split('=')
    if (rawName === SESSION_COOKIE_NAME) {
      const value = rest.join('=').trim()
      return value ? decodeURIComponent(value) : null
    }
  }
  return null
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
