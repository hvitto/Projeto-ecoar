// Configuração do sistema - permite alternar entre localStorage e API

export const config = {
  // Flag para usar localStorage (true) ou API (false)
  USE_LOCAL_STORAGE: true,
  
  // Configurações de localStorage
  STORAGE_KEYS: {
    USERS: 'ecoar-users',
    AUTH: 'ecoar-auth',
    CHARACTERS_PREFIX: 'ecoar-characters-',
  },
  
  // Configurações de sessão (quando usar localStorage)
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
  
  // Configurações de API (preparado para futuro)
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    ENDPOINTS: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      CURRENT_USER: '/auth/me',
      CHARACTERS: '/characters',
    },
  },
  
  // Validações
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Nome completo: mínimo 2 caracteres, máximo 100, pode conter espaços e acentos
    MIN_FULLNAME_LENGTH: 2,
    MAX_FULLNAME_LENGTH: 100,
    // Nome de usuário: apenas letras minúsculas, números, underscore e hífen
    USERNAME_REGEX: /^[a-z0-9_-]+$/,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
  },
}

