// Tipos para autenticação e gerenciamento de usuários

export interface User {
  id: string
  email: string
  fullName: string
  username: string
  createdAt: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
  token?: string
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: number
}

export interface StoredUser {
  id: string
  email: string
  fullName: string
  username: string
  passwordHash: string
  createdAt: string
}

// Dados de ficha com metadados do usuário
export interface CharacterMetadata {
  id: string
  userId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface CharacterData {
  id?: string
  // Dados completos da ficha (CharacterCreationData)
  [key: string]: any
}

export interface CharacterWithMetadata extends CharacterMetadata {
  data: CharacterData
}

// Erros de autenticação
export enum AuthError {
  INVALID_EMAIL = 'Email inválido',
  WEAK_PASSWORD = 'Senha deve ter no mínimo 6 caracteres',
  EMAIL_ALREADY_EXISTS = 'Email já cadastrado',
  INVALID_CREDENTIALS = 'Email ou senha incorretos',
  USER_NOT_FOUND = 'Usuário não encontrado',
  UNAUTHORIZED = 'Não autorizado',
  SESSION_EXPIRED = 'Sessão expirada',
  FULLNAME_REQUIRED = 'Nome completo é obrigatório',
  USERNAME_REQUIRED = 'Nome de usuário é obrigatório',
  INVALID_USERNAME = 'Nome de usuário inválido',
  USERNAME_ALREADY_EXISTS = 'Nome de usuário já está em uso',
}

