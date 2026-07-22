import { verifyToken } from './jwt'
import { readSessionToken } from './sessionCookie'

export async function getAuthFromRequest(request: Request): Promise<{ userId: string } | null> {
  const cookieToken = readSessionToken(request)
  if (cookieToken) {
    const fromCookie = await verifyToken(cookieToken)
    if (fromCookie) return { userId: fromCookie.userId }
  }

  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const fromBearer = await verifyToken(authHeader.slice(7))
    if (fromBearer) return { userId: fromBearer.userId }
  }

  return null
}
