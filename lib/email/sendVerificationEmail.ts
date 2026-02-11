const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'

export async function sendVerificationEmail(email: string, verificationLink: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set')
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: email,
        subject: 'Confirme seu email - ECOAR',
        html: `
          <p>Olá,</p>
          <p>Clique no link abaixo para confirmar seu email e ativar sua conta:</p>
          <p><a href="${verificationLink}" style="color: #0d9488;">${verificationLink}</a></p>
          <p>Este link expira em 24 horas.</p>
          <p>Se você não criou esta conta, ignore este email.</p>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Resend error:', res.status, err)
      return false
    }
    return true
  } catch (err) {
    console.error('Send verification email error:', err)
    return false
  }
}
