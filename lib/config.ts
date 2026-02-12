// Configuração do sistema - app usa sempre API e banco de dados

function getApiBaseUrl(): string {
  const origin = typeof process.env.NEXT_PUBLIC_API_URL === 'string' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined'
      ? window.location.origin
      : ''
  return origin ? `${origin.replace(/\/$/, '')}/api` : '/api'
}

export const config = {
  USE_LOCAL_STORAGE: false,

  // Chave usada no navegador para guardar o token JWT (sessão)
  STORAGE_KEYS: {
    USERS: 'ecoar-users',
    AUTH: 'ecoar-auth',
    CHARACTERS_PREFIX: 'ecoar-characters-',
  },

  // Configurações de API
  API: {
    get BASE_URL() {
      return getApiBaseUrl()
    },
    ENDPOINTS: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      CURRENT_USER: '/auth/me',
      CHARACTERS: '/characters',
      TABLES: '/tables',
      TABLES_JOIN: '/tables/join',
    },
  },
  
  // Validações
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Nome completo: mínimo 2 caracteres, máximo 100, pode conter espaços e acentos
    MIN_FULLNAME_LENGTH: 2,
    MAX_FULLNAME_LENGTH: 100,
    // Nome de usuário: letras (maiúsculas e minúsculas), números, underscore e hífen
    USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
  },
}

