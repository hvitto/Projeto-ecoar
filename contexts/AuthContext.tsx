'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { authService } from '@/lib/auth/authService'
import { User, AuthResult } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  loginDemo: (accountId?: string) => Promise<AuthResult>
  register: (email: string, password: string, fullName: string, username: string) => Promise<AuthResult>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar usuário atual ao montar
  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading current user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await authService.login(email, password)
      
      if (result.success && result.user) {
        setUser(result.user)
      }
      
      return result
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer login',
      }
    }
  }, [])

  const loginDemo = useCallback(async (accountId?: string): Promise<AuthResult> => {
    try {
      const result = await authService.loginDemo(accountId)
      if (result.success && result.user) {
        setUser(result.user)
      }
      return result
    } catch (error) {
      console.error('Demo login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao entrar com conta de teste',
      }
    }
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string, username: string): Promise<AuthResult> => {
    try {
      const result = await authService.register(email, password, fullName, username)
      
      if (result.success && result.user) {
        setUser(result.user)
      }
      
      return result
    } catch (error) {
      console.error('Register error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao cadastrar',
      }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Mesmo com erro, limpar estado local
      setUser(null)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    await loadCurrentUser()
  }, [loadCurrentUser])

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    loginDemo,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

