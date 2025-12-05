// Serviço abstrato de autenticação - preparado para alternar entre localStorage e API
import { config } from '@/lib/config'
import { localAuthService } from './localAuthService'
import { User, AuthResult } from '@/types/auth'

// Interface para futura implementação de API
async function apiAuthService(): Promise<{
  login: (email: string, password: string) => Promise<AuthResult>
  register: (email: string, password: string, fullName: string, username: string) => Promise<AuthResult>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<User | null>
}> {
  // TODO: Implementar quando backend estiver disponível
  // Exemplo de estrutura:
  /*
  return {
    async login(email: string, password: string): Promise<AuthResult> {
      const response = await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Erro ao fazer login',
        }
      }
      
      const data = await response.json()
      return {
        success: true,
        user: data.user,
        token: data.token,
      }
    },
    
    async register(email: string, password: string, fullName: string, username: string): Promise<AuthResult> {
      const response = await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, username }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Erro ao cadastrar',
        }
      }
      
      const data = await response.json()
      return {
        success: true,
        user: data.user,
        token: data.token,
      }
    },
    
    async logout(): Promise<void> {
      await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        credentials: 'include',
      })
    },
    
    async getCurrentUser(): Promise<User | null> {
      const response = await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.CURRENT_USER}`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      return data.user
    },
  }
  */
  
  throw new Error('API authentication not implemented yet')
}

// Exportar serviço baseado na configuração
export const authService = config.USE_LOCAL_STORAGE
  ? localAuthService
  : (() => {
      // Retornar serviço de API quando implementado
      // Por enquanto, retornar erro se tentar usar API
      return {
        async login() {
          throw new Error('API authentication not available. Set USE_LOCAL_STORAGE to true in config.')
        },
        async register() {
          throw new Error('API authentication not available. Set USE_LOCAL_STORAGE to true in config.')
        },
        async logout() {
          throw new Error('API authentication not available. Set USE_LOCAL_STORAGE to true in config.')
        },
        async getCurrentUser() {
          return null
        },
        isAuthenticated() {
          return false
        },
      }
    })()

