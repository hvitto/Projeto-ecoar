import bcrypt from 'bcryptjs'
import * as jose from 'jose'

function getSecret(): Uint8Array {
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(JWT_SECRET)
}
const JWT_EXPIRATION = '7d'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export interface JwtPayload {
  userId: string
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new jose.SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRATION)
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret())
    const userId = payload.userId as string
    if (!userId) return null
    return { userId }
  } catch {
    return null
  }
}
