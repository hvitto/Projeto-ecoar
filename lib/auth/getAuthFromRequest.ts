import { verifyToken } from './jwt'

export async function getAuthFromRequest(request: Request): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.slice(7)
  return verifyToken(token)
}
