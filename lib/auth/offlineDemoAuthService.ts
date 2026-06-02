import { config, getDemoAccountById } from '@/lib/config'
import type { AuthResult, User } from '@/shared/types/auth'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000
export const OFFLINE_DEMO_TOKEN = 'offline-demo-session'
export const OFFLINE_USER_PREFIX = 'offline-demo-'

type OfflineSession = {
  token: string
  user: User
  mode: 'offline-demo'
  expiresAt: number
}

function readSession(): OfflineSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(config.STORAGE_KEYS.AUTH)
    if (!raw) return null
    const session = JSON.parse(raw) as OfflineSession
    if (session.mode !== 'offline-demo' || !session.user) return null
    if (session.expiresAt != null && session.expiresAt < Date.now()) {
      localStorage.removeItem(config.STORAGE_KEYS.AUTH)
      return null
    }
    return session
  } catch {
    return null
  }
}

function writeSession(user: User): void {
  const session: OfflineSession = {
    token: OFFLINE_DEMO_TOKEN,
    user,
    mode: 'offline-demo',
    expiresAt: Date.now() + SESSION_DURATION,
  }
  localStorage.setItem(config.STORAGE_KEYS.AUTH, JSON.stringify(session))
}

function userFromAccount(accountId: string): User | null {
  const account = getDemoAccountById(accountId)
  if (!account) return null
  return {
    id: `${OFFLINE_USER_PREFIX}${account.id}`,
    email: account.email,
    fullName: account.fullName,
    username: account.username,
    createdAt: new Date().toISOString(),
  }
}

const disabled: AuthResult = {
  success: false,
  error: 'Login por email/senha desativado no modo demonstração.',
}

export function getOfflineAccessToken(): string | null {
  return readSession() ? OFFLINE_DEMO_TOKEN : null
}

export function isOfflineDemoSessionActive(): boolean {
  return readSession() !== null
}

export const offlineDemoAuthService = {
  async login(): Promise<AuthResult> {
    return disabled
  },

  async loginDemo(accountId?: string): Promise<AuthResult> {
    const user = userFromAccount((accountId ?? 'demo').trim() || 'demo')
    if (!user) {
      return { success: false, error: 'Conta de demonstração inválida' }
    }
    writeSession(user)
    return { success: true, user, token: OFFLINE_DEMO_TOKEN }
  },

  async register(): Promise<AuthResult> {
    return {
      success: false,
      error: 'Cadastro desativado no modo demonstração.',
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(config.STORAGE_KEYS.AUTH)
    }
  },

  async getCurrentUser(): Promise<User | null> {
    return readSession()?.user ?? null
  },

  isAuthenticated(): boolean {
    return readSession() !== null
  },
}
