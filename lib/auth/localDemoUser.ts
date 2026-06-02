import { getDemoAccountById } from '@/lib/config'
import { OFFLINE_USER_PREFIX } from '@/lib/auth/offlineDemoAuthService'
import type { User } from '@/shared/types/auth'

const LOCAL_PREFIX = 'local-demo-'

function accountIdFromDemoUserId(userId: string): string | null {
  if (userId.startsWith(OFFLINE_USER_PREFIX)) return userId.slice(OFFLINE_USER_PREFIX.length)
  if (userId.startsWith(LOCAL_PREFIX)) return userId.slice(LOCAL_PREFIX.length)
  return null
}

export function isLocalDemoUserId(userId: string): boolean {
  return accountIdFromDemoUserId(userId) !== null
}

export function userFromLocalDemoId(userId: string): User | null {
  const accountId = accountIdFromDemoUserId(userId)
  if (!accountId) return null
  const account = getDemoAccountById(accountId)
  if (!account) return null
  return {
    id: userId,
    email: account.email,
    fullName: account.fullName,
    username: account.username,
    createdAt: new Date().toISOString(),
  }
}
