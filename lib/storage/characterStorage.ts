import { config } from '@/lib/config'
import { CharacterData, CharacterWithMetadata } from '@/types/auth'
import * as characterApi from './characterApiService'
import * as offlineCharacters from './offlineCharacterStorage'

const store = config.OFFLINE_DEMO_MODE ? offlineCharacters : characterApi

export function getUserCharacters(userId: string): Promise<CharacterWithMetadata[]> {
  return store.getUserCharacters(userId)
}

export function saveCharacter(userId: string, characterData: CharacterData): Promise<CharacterWithMetadata> {
  return store.saveCharacter(userId, characterData)
}

export function getCharacter(userId: string, characterId: string): Promise<CharacterWithMetadata | null> {
  return store.getCharacter(userId, characterId)
}

export function deleteCharacter(userId: string, characterId: string): Promise<boolean> {
  return store.deleteCharacter(userId, characterId)
}

export async function migrateOldCharacter(oldCharacterData: unknown, userId: string): Promise<CharacterWithMetadata | null> {
  const data = oldCharacterData as CharacterData | null | undefined
  if (!data?.nome) return null
  try {
    return await saveCharacter(userId, data)
  } catch (error) {
    console.error('Error migrating old character:', error)
    return null
  }
}
