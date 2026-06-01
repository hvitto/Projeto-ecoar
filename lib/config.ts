export const OFFLINE_DEMO_MODE = true // demo: localStorage, sem auth API

function getApiBaseUrl(): string {
  const origin = typeof process.env.NEXT_PUBLIC_API_URL === 'string' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined'
      ? window.location.origin
      : ''
  return origin ? `${origin.replace(/\/$/, '')}/api` : '/api'
}

// contas demo — senha demo123 (fluxo API legado)
export const DEMO_ACCOUNTS = [
  {
    id: 'demo',
    email: 'demo@ecoar.test',
    password: 'demo123',
    fullName: 'Usuário Demo',
    username: 'demo',
    label: 'Demo geral',
  },
  {
    id: 'admin',
    email: 'demo-admin@ecoar.test',
    password: 'demo123',
    fullName: 'Admin Demo',
    username: 'demo_admin',
    label: 'Admin (catálogo DB)',
  },
  {
    id: 'mestre',
    email: 'demo-mestre@ecoar.test',
    password: 'demo123',
    fullName: 'Mestre Demo',
    username: 'demo_mestre',
    label: 'Mestre',
  },
  {
    id: 'jogador1',
    email: 'demo-jogador1@ecoar.test',
    password: 'demo123',
    fullName: 'Jogador Um',
    username: 'demo_j1',
    label: 'Jogador 1',
  },
  {
    id: 'jogador2',
    email: 'demo-jogador2@ecoar.test',
    password: 'demo123',
    fullName: 'Jogador Dois',
    username: 'demo_j2',
    label: 'Jogador 2',
  },
  {
    id: 'jogador3',
    email: 'demo-jogador3@ecoar.test',
    password: 'demo123',
    fullName: 'Jogador Três',
    username: 'demo_j3',
    label: 'Jogador 3',
  },
  {
    id: 'jogador4',
    email: 'demo-jogador4@ecoar.test',
    password: 'demo123',
    fullName: 'Jogador Quatro',
    username: 'demo_j4',
    label: 'Jogador 4',
  },
] as const

export type DemoAccountId = (typeof DEMO_ACCOUNTS)[number]['id']

export function getDemoAccountById(accountId: string | undefined | null) {
  const id = (accountId ?? 'demo').trim() || 'demo'
  return DEMO_ACCOUNTS.find((a) => a.id === id) ?? null
}

export const config = {
  OFFLINE_DEMO_MODE,
  USE_LOCAL_STORAGE: OFFLINE_DEMO_MODE,

  STORAGE_KEYS: {
    USERS: 'ecoar-users',
    AUTH: 'ecoar-auth',
    CHARACTERS_PREFIX: 'ecoar-characters-',
  },

  API: {
    get BASE_URL() {
      return getApiBaseUrl()
    },
    ENDPOINTS: {
      LOGIN: '/auth/login',
      DEMO: '/auth/demo',
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

  DEMO_ACCOUNTS,

  DEMO_ACCOUNT: {
    email: DEMO_ACCOUNTS[0].email,
    password: DEMO_ACCOUNTS[0].password,
  },
}
