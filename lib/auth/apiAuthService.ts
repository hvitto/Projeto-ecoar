import { config } from '@/lib/config'
import { User, AuthResult } from '@/shared/types/auth'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(config.STORAGE_KEYS.AUTH)
    if (!raw) return null
    const session = JSON.parse(raw) as { user?: User; expiresAt?: number }
    if (session.expiresAt != null && session.expiresAt < Date.now()) {
      localStorage.removeItem(config.STORAGE_KEYS.AUTH)
      return null
    }
    return session.user ?? null
  } catch {
    return null
  }
}

function saveUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    config.STORAGE_KEYS.AUTH,
    JSON.stringify({
      user,
      expiresAt: Date.now() + SESSION_DURATION,
    }),
  )
}

function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(config.STORAGE_KEYS.AUTH)
}

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${config.API.BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
}

export const apiAuthService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const response = await request(config.API.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { success: false, error: data.error || 'Erro ao fazer login' }
    }
    if (data.success && data.user) {
      saveUser(data.user)
      return { success: true, user: data.user }
    }
    return { success: false, error: data.error || 'Erro ao fazer login' }
  },

  async register(email: string, password: string, fullName: string, username: string): Promise<AuthResult> {
    const response = await request(config.API.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, username }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { success: false, error: data.error || 'Erro ao cadastrar' }
    }
    if (data.success) {
      if (data.user) {
        saveUser(data.user)
        return { success: true, user: data.user }
      }
      return { success: true, message: data.message }
    }
    return { success: false, error: data.error || 'Erro ao cadastrar' }
  },

  async logout(): Promise<void> {
    try {
      await request(config.API.ENDPOINTS.LOGOUT, { method: 'POST' })
    } finally {
      clearSession()
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await request(config.API.ENDPOINTS.CURRENT_USER)
      if (!response.ok) {
        clearSession()
        return null
      }
      const data = await response.json().catch(() => ({}))
      if (data.user) {
        saveUser(data.user)
        return data.user
      }
      clearSession()
      return null
    } catch {
      return getStoredUser()
    }
  },

  isAuthenticated(): boolean {
    return getStoredUser() != null
  },
}
