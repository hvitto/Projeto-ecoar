// Serviço de personagens via API (usa token do localStorage)
import { config } from '@/lib/config'
import { CharacterData, CharacterWithMetadata } from '@/types/auth'

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

async function request<T>(path: string, options: RequestInit & { token?: string | null } = {}): Promise<Response> {
  const token = options.token ?? getStoredToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${config.API.BASE_URL}${path}`, { ...options, headers })
}

function toCharacterWithMetadata(row: { id: string; userId: string; name: string; createdAt: string; updatedAt: string; data: CharacterData }): CharacterWithMetadata {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    data: { ...row.data, id: row.id },
  }
}

export async function getUserCharacters(_userId: string): Promise<CharacterWithMetadata[]> {
  const res = await request(config.API.ENDPOINTS.CHARACTERS)
  if (!res.ok) {
    if (res.status === 401) return []
    throw new Error('Erro ao listar fichas')
  }
  const rows = (await res.json()) as Array<{ id: string; userId: string; name: string; createdAt: string; updatedAt: string; data: CharacterData }>
  return rows.map(toCharacterWithMetadata)
}

export async function saveCharacter(userId: string, characterData: CharacterData): Promise<CharacterWithMetadata> {
  const isUpdate = characterData.id
  const url = isUpdate
    ? `${config.API.ENDPOINTS.CHARACTERS}/${characterData.id}`
    : config.API.ENDPOINTS.CHARACTERS
  const method = isUpdate ? 'PUT' : 'POST'
  const res = await request(url, { method, body: JSON.stringify(characterData) })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao salvar ficha')
  }
  const row = (await res.json()) as { id: string; userId: string; name: string; createdAt: string; updatedAt: string; data: CharacterData }
  return toCharacterWithMetadata(row)
}

export async function getCharacter(_userId: string, characterId: string): Promise<CharacterWithMetadata | null> {
  const res = await request(`${config.API.ENDPOINTS.CHARACTERS}/${characterId}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Erro ao buscar ficha')
  }
  const row = (await res.json()) as { id: string; userId: string; name: string; createdAt: string; updatedAt: string; data: CharacterData }
  return toCharacterWithMetadata(row)
}

export async function deleteCharacter(_userId: string, characterId: string): Promise<boolean> {
  const res = await request(`${config.API.ENDPOINTS.CHARACTERS}/${characterId}`, { method: 'DELETE' })
  if (!res.ok) {
    if (res.status === 404) return false
    throw new Error('Erro ao deletar ficha')
  }
  return true
}
