import { config } from '@/lib/config'
import type { GameTable, GameTableWithMembers, CreateTableBody, JoinTableBody } from '@/types/tables'
import type { CharacterWithMetadata } from '@/types/auth'

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(config.STORAGE_KEYS.AUTH)
    if (!raw) return null
    const session = JSON.parse(raw) as { token?: string }
    return session.token ?? null
  } catch {
    return null
  }
}

async function request(path: string, options: RequestInit & { token?: string | null } = {}): Promise<Response> {
  const token = options.token ?? getStoredToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${config.API.BASE_URL}${path}`, { ...options, headers })
}

export async function getUserTables(): Promise<GameTable[]> {
  const res = await request(config.API.ENDPOINTS.TABLES)
  if (!res.ok) {
    if (res.status === 401) return []
    throw new Error('Erro ao listar mesas')
  }
  return res.json()
}

export async function createTable(body: CreateTableBody): Promise<GameTable> {
  const res = await request(config.API.ENDPOINTS.TABLES, { method: 'POST', body: JSON.stringify(body) })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao criar mesa')
  }
  return res.json()
}

export async function getTable(tableId: string): Promise<GameTableWithMembers> {
  const res = await request(`${config.API.ENDPOINTS.TABLES}/${tableId}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Mesa não encontrada')
    throw new Error('Erro ao buscar mesa')
  }
  return res.json()
}

export async function joinTable(body: JoinTableBody): Promise<{ success: boolean; tableId: string; alreadyMember?: boolean }> {
  const res = await request(config.API.ENDPOINTS.TABLES_JOIN, { method: 'POST', body: JSON.stringify(body) })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao entrar na mesa')
  }
  return res.json()
}

export interface TableCharacterItem {
  character: CharacterWithMetadata
  memberUserId: string
  memberUsername?: string
  canEdit: boolean
}

export async function getTableCharacters(tableId: string): Promise<TableCharacterItem[]> {
  const res = await request(`${config.API.ENDPOINTS.TABLES}/${tableId}/characters`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Mesa não encontrada')
    throw new Error('Erro ao listar fichas da mesa')
  }
  return res.json()
}

export async function setMyTableCharacter(tableId: string, characterId: string | null): Promise<void> {
  const res = await request(`${config.API.ENDPOINTS.TABLES}/${tableId}/members/me/character`, {
    method: 'PUT',
    body: JSON.stringify({ characterId }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao vincular ficha')
  }
}
