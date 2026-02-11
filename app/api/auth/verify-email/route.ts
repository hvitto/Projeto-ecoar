import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyVerificationToken } from '@/lib/auth/jwt'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    const base = process.env.NEXT_PUBLIC_API_URL || request.headers.get('origin') || ''
    return NextResponse.redirect(`${base.replace(/\/$/, '')}/?error=missing_token`)
  }

  const payload = await verifyVerificationToken(token)
  if (!payload) {
    const base = process.env.NEXT_PUBLIC_API_URL || request.headers.get('origin') || ''
    return NextResponse.redirect(`${base.replace(/\/$/, '')}/?error=invalid_token`)
  }

  try {
    await sql`
      UPDATE users SET email_verified_at = now() WHERE id = ${payload.userId}
    `
  } catch (err) {
    console.error('Verify email error:', err)
    const base = process.env.NEXT_PUBLIC_API_URL || request.headers.get('origin') || ''
    return NextResponse.redirect(`${base.replace(/\/$/, '')}/?error=verify_failed`)
  }

  const base = process.env.NEXT_PUBLIC_API_URL || request.headers.get('origin') || ''
  return NextResponse.redirect(`${base.replace(/\/$/, '')}/?verified=1`)
}
