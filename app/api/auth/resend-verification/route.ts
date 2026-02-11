import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { signVerificationToken } from '@/lib/auth/jwt'
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : null
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email é obrigatório' }, { status: 400 })
    }

    const rows = (await sql`
      SELECT id FROM users WHERE email = ${email} AND auth_provider = 'email' AND email_verified_at IS NULL LIMIT 1
    `) as Array<{ id: string }>
    if (rows.length === 0) {
      return NextResponse.json({ success: true, message: 'Se o email estiver cadastrado e não verificado, você receberá um novo link.' })
    }

    const verificationToken = await signVerificationToken(rows[0].id)
    const origin = process.env.NEXT_PUBLIC_API_URL || ''
    const verificationLink = `${origin.replace(/\/$/, '')}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`
    await sendVerificationEmail(email, verificationLink)

    return NextResponse.json({ success: true, message: 'Email reenviado. Verifique sua caixa de entrada.' })
  } catch (err) {
    console.error('Resend verification error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao reenviar email' }, { status: 500 })
  }
}
