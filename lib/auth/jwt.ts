import bcrypt from 'bcryptjs'
import * as jose from 'jose'

function getSecret(): Uint8Array {
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(JWT_SECRET)
}
export const JWT_EXPIRATION = '7d'
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export interface JwtPayload {
  userId: string
  purpose: 'session'
}

export async function signToken(payload: { userId: string }): Promise<string> {
  return new jose.SignJWT({ userId: payload.userId, purpose: 'session' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRATION)
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret())
    const userId = payload.userId as string
    if (!userId || payload.purpose !== 'session') return null
    return { userId, purpose: 'session' }
  } catch {
    return null
  }
}

export interface VerificationPayload {
  userId: string
  purpose: 'email_verification'
}

export async function signVerificationToken(userId: string): Promise<string> {
  return new jose.SignJWT({ userId, purpose: 'email_verification' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyVerificationToken(token: string): Promise<VerificationPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret())
    if (payload.purpose !== 'email_verification' || !payload.userId) return null
    return { userId: payload.userId as string, purpose: 'email_verification' }
  } catch {
    return null
  }
}
