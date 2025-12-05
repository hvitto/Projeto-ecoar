// Serviço de autenticação local usando localStorage
import { config } from '@/lib/config'
import { User, AuthResult, AuthSession, StoredUser, AuthError } from '@/types/auth'

// Hash de senha usando Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Validação de email
function isValidEmail(email: string): boolean {
  return config.VALIDATION.EMAIL_REGEX.test(email)
}

// Validação de senha
function isValidPassword(password: string): boolean {
  return password.length >= config.VALIDATION.MIN_PASSWORD_LENGTH
}

// Validação de nome completo
function isValidFullName(fullName: string): boolean {
  const trimmed = fullName.trim()
  return (
    trimmed.length >= config.VALIDATION.MIN_FULLNAME_LENGTH &&
    trimmed.length <= config.VALIDATION.MAX_FULLNAME_LENGTH
  )
}

// Validação de nome de usuário
function isValidUsername(username: string): boolean {
  const trimmed = username.trim().toLowerCase()
  if (
    trimmed.length < config.VALIDATION.MIN_USERNAME_LENGTH ||
    trimmed.length > config.VALIDATION.MAX_USERNAME_LENGTH
  ) {
    return false
  }
  if (!config.VALIDATION.USERNAME_REGEX.test(trimmed)) {
    return false
  }
  // Não pode começar ou terminar com - ou _
  if (trimmed.startsWith('-') || trimmed.startsWith('_') || trimmed.endsWith('-') || trimmed.endsWith('_')) {
    return false
  }
  return true
}

// Gerenciamento de usuários no localStorage
function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  
  try {
    const usersJson = localStorage.getItem(config.STORAGE_KEYS.USERS)
    if (!usersJson) return []
    return JSON.parse(usersJson)
  } catch (error) {
    console.error('Error reading users from localStorage:', error)
    return []
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(config.STORAGE_KEYS.USERS, JSON.stringify(users))
  } catch (error) {
    console.error('Error saving users to localStorage:', error)
    throw new Error('Erro ao salvar dados no navegador')
  }
}

// Gerenciamento de sessão
function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  
  try {
    const sessionJson = localStorage.getItem(config.STORAGE_KEYS.AUTH)
    if (!sessionJson) return null
    
    const session: AuthSession = JSON.parse(sessionJson)
    
    // Verificar se a sessão expirou
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(config.STORAGE_KEYS.AUTH)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error reading session from localStorage:', error)
    return null
  }
}

function saveSession(session: AuthSession): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(config.STORAGE_KEYS.AUTH, JSON.stringify(session))
  } catch (error) {
    console.error('Error saving session to localStorage:', error)
    throw new Error('Erro ao salvar sessão')
  }
}

function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(config.STORAGE_KEYS.AUTH)
}

// Serviço de autenticação local
export const localAuthService = {
  // Registrar novo usuário
  async register(email: string, password: string, fullName: string, username: string): Promise<AuthResult> {
    // Validações
    if (!isValidEmail(email)) {
      return {
        success: false,
        error: AuthError.INVALID_EMAIL,
      }
    }
    
    if (!isValidPassword(password)) {
      return {
        success: false,
        error: AuthError.WEAK_PASSWORD,
      }
    }
    
    if (!fullName || !fullName.trim()) {
      return {
        success: false,
        error: AuthError.FULLNAME_REQUIRED,
      }
    }
    
    if (!isValidFullName(fullName)) {
      return {
        success: false,
        error: `Nome completo deve ter entre ${config.VALIDATION.MIN_FULLNAME_LENGTH} e ${config.VALIDATION.MAX_FULLNAME_LENGTH} caracteres`,
      }
    }
    
    if (!username || !username.trim()) {
      return {
        success: false,
        error: AuthError.USERNAME_REQUIRED,
      }
    }
    
    if (!isValidUsername(username)) {
      return {
        success: false,
        error: AuthError.INVALID_USERNAME,
      }
    }
    
    // Verificar se email já existe
    const users = getStoredUsers()
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return {
        success: false,
        error: AuthError.EMAIL_ALREADY_EXISTS,
      }
    }
    
    // Verificar se username já existe
    const normalizedUsername = username.trim().toLowerCase()
    if (users.some(u => u.username?.toLowerCase() === normalizedUsername)) {
      return {
        success: false,
        error: AuthError.USERNAME_ALREADY_EXISTS,
      }
    }
    
    // Criar novo usuário
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const passwordHash = await hashPassword(password)
    
    const newUser: StoredUser = {
      id: userId,
      email: email.toLowerCase(),
      fullName: fullName.trim(),
      username: normalizedUsername,
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    
    users.push(newUser)
    saveStoredUsers(users)
    
    // Criar sessão
    const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`
    const session: AuthSession = {
      userId,
      token,
      expiresAt: Date.now() + config.SESSION_DURATION,
    }
    
    saveSession(session)
    
    const user: User = {
      id: userId,
      email: email.toLowerCase(),
      fullName: newUser.fullName,
      username: newUser.username,
      createdAt: newUser.createdAt,
    }
    
    return {
      success: true,
      user,
      token,
    }
  },
  
  // Fazer login
  async login(email: string, password: string): Promise<AuthResult> {
    // Validações
    if (!isValidEmail(email)) {
      return {
        success: false,
        error: AuthError.INVALID_EMAIL,
      }
    }
    
    if (!isValidPassword(password)) {
      return {
        success: false,
        error: AuthError.WEAK_PASSWORD,
      }
    }
    
    // Buscar usuário
    const users = getStoredUsers()
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return {
        success: false,
        error: AuthError.INVALID_CREDENTIALS,
      }
    }
    
    // Verificar senha
    const passwordHash = await hashPassword(password)
    if (user.passwordHash !== passwordHash) {
      return {
        success: false,
        error: AuthError.INVALID_CREDENTIALS,
      }
    }
    
    // Criar sessão
    const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`
    const session: AuthSession = {
      userId: user.id,
      token,
      expiresAt: Date.now() + config.SESSION_DURATION,
    }
    
    saveSession(session)
    
    const userData: User = {
      id: user.id,
      email: user.email,
      fullName: user.fullName || '',
      username: user.username || '',
      createdAt: user.createdAt,
    }
    
    return {
      success: true,
      user: userData,
      token,
    }
  },
  
  // Fazer logout
  async logout(): Promise<void> {
    clearSession()
  },
  
  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    const session = getStoredSession()
    
    if (!session) {
      return null
    }
    
    const users = getStoredUsers()
    const storedUser = users.find(u => u.id === session.userId)
    
    if (!storedUser) {
      clearSession()
      return null
    }
    
    return {
      id: storedUser.id,
      email: storedUser.email,
      fullName: storedUser.fullName || '',
      username: storedUser.username || '',
      createdAt: storedUser.createdAt,
    }
  },
  
  // Verificar se há sessão ativa
  isAuthenticated(): boolean {
    const session = getStoredSession()
    return session !== null
  },
}

