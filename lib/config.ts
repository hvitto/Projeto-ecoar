// Configuração do sistema - app usa sempre API e banco de dados

function getApiBaseUrl(): string {
  const origin = typeof process.env.NEXT_PUBLIC_API_URL === 'string' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined'
      ? window.location.origin
      : ''
  return origin ? `${origin.replace(/\/$/, '')}/api` : '/api'
}

/**
 * Contas de teste (desenvolvimento). Senha comum: `demo123`.
 * Para o admin do catálogo no banco, use `EQUIPMENT_ADMIN_EMAILS=demo-admin@ecoar.test` (ou inclua na lista).
 */
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
] as const

export type DemoAccountId = (typeof DEMO_ACCOUNTS)[number]['id']

export function getDemoAccountById(accountId: string | undefined | null) {
  const id = (accountId ?? 'demo').trim() || 'demo'
  return DEMO_ACCOUNTS.find((a) => a.id === id) ?? null
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
      DEMO: '/auth/demo',
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

  DEMO_ACCOUNTS,

  /** Compatibilidade com código que só lia a primeira conta demo */
  DEMO_ACCOUNT: {
    email: DEMO_ACCOUNTS[0].email,
    password: DEMO_ACCOUNTS[0].password,
  },
}
