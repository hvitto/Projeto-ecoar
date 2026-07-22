function getApiBaseUrl(): string {
  const origin = typeof process.env.NEXT_PUBLIC_API_URL === 'string' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined'
      ? window.location.origin
      : ''
  return origin ? `${origin.replace(/\/$/, '')}/api` : '/api'
}

export const config = {
  STORAGE_KEYS: {
    AUTH: 'ecoar-auth',
    CHARACTERS_PREFIX: 'ecoar-characters-',
  },

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

  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_FULLNAME_LENGTH: 2,
    MAX_FULLNAME_LENGTH: 100,
    USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
  },
}
