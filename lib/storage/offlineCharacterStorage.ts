import { config } from '@/lib/config'
import type { CharacterData, CharacterWithMetadata } from '@/shared/types/auth'

function storageKey(userId: string): string {
  return `${config.STORAGE_KEYS.CHARACTERS_PREFIX}${userId}`
}

function readAll(userId: string): CharacterWithMetadata[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as CharacterWithMetadata[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(userId: string, characters: CharacterWithMetadata[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(characters))
}

function characterDisplayName(data: CharacterData): string {
  const name = data.nome ?? data.name
  return typeof name === 'string' && name.trim() ? name.trim() : 'Sem nome'
}

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `char-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function getUserCharacters(userId: string): Promise<CharacterWithMetadata[]> {
  return readAll(userId)
}

export async function getCharacter(userId: string, characterId: string): Promise<CharacterWithMetadata | null> {
  return readAll(userId).find((c) => c.id === characterId) ?? null
}

export async function saveCharacter(userId: string, characterData: CharacterData): Promise<CharacterWithMetadata> {
  const list = readAll(userId)
  const now = new Date().toISOString()
  const name = characterDisplayName(characterData)
  const existingId = characterData.id
  const index = existingId ? list.findIndex((c) => c.id === existingId) : -1

  if (index >= 0) {
    const updated: CharacterWithMetadata = {
      ...list[index],
      name,
      updatedAt: now,
      data: { ...characterData, id: list[index].id },
    }
    list[index] = updated
    writeAll(userId, list)
    return updated
  }

  const id = newId()
  const created: CharacterWithMetadata = {
    id,
    userId,
    name,
    createdAt: now,
    updatedAt: now,
    data: { ...characterData, id },
  }
  writeAll(userId, [...list, created])
  return created
}

export async function deleteCharacter(userId: string, characterId: string): Promise<boolean> {
  const list = readAll(userId)
  const next = list.filter((c) => c.id !== characterId)
  if (next.length === list.length) return false
  writeAll(userId, next)
  return true
}
