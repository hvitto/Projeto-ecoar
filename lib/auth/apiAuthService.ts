// Serviço de autenticação via API (JWT no localStorage)
import { config } from '@/lib/config'
import { User, AuthResult } from '@/types/auth'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 dias

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(config.STORAGE_KEYS.AUTH)
    if (!raw) return null
    const session = JSON.parse(raw) as { token?: string; expiresAt?: number }
    if (session.expiresAt != null && session.expiresAt < Date.now()) {
      localStorage.removeItem(config.STORAGE_KEYS.AUTH)
      return null
    }
    return session.token ?? null
  } catch {
    return null
  }
}

function saveSession(token: string, user: User): void {
  if (typeof window === 'undefined') return
  const session = {
    token,
    user,
    expiresAt: Date.now() + SESSION_DURATION,
  }
  localStorage.setItem(config.STORAGE_KEYS.AUTH, JSON.stringify(session))
}

function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(config.STORAGE_KEYS.AUTH)
}

async function request<T>(path: string, options: RequestInit & { token?: string | null } = {}): Promise<Response> {
  const { token = getStoredToken(), ...init } = options
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${config.API.BASE_URL}${path}`, { ...init, headers })
}

export const apiAuthService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const response = await request(config.API.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      token: null,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { success: false, error: data.error || 'Erro ao fazer login' }
    }
    if (data.success && data.user && data.token) {
      saveSession(data.token, data.user)
      return { success: true, user: data.user, token: data.token }
    }
    return { success: false, error: data.error || 'Erro ao fazer login' }
  },

  async loginDemo(): Promise<AuthResult> {
    const response = await request(config.API.ENDPOINTS.DEMO, {
      method: 'POST',
      token: null,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { success: false, error: data.error || 'Erro ao entrar com conta de teste' }
    }
    if (data.success && data.user && data.token) {
      saveSession(data.token, data.user)
      return { success: true, user: data.user, token: data.token }
    }
    return { success: false, error: data.error || 'Erro ao entrar com conta de teste' }
  },

  async register(email: string, password: string, fullName: string, username: string): Promise<AuthResult> {
    const response = await request(config.API.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, username }),
      token: null,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { success: false, error: data.error || 'Erro ao cadastrar' }
    }
    if (data.success) {
      if (data.user && data.token) {
        saveSession(data.token, data.user)
        return { success: true, user: data.user, token: data.token }
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
    const token = getStoredToken()
    if (!token) return null
    const response = await request(config.API.ENDPOINTS.CURRENT_USER, { token })
    if (!response.ok) {
      clearSession()
      return null
    }
    const data = await response.json().catch(() => ({}))
    if (data.user) return data.user
    clearSession()
    return null
  },

  isAuthenticated(): boolean {
    return getStoredToken() != null
  },
}
