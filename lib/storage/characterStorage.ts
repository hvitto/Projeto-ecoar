// Serviço de armazenamento de fichas por usuário
import { config } from '@/lib/config'
import { CharacterData, CharacterWithMetadata } from '@/types/auth'

// Gerar ID único para ficha
function generateCharacterId(): string {
  return `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Obter chave de storage para usuário
function getStorageKey(userId: string): string {
  return `${config.STORAGE_KEYS.CHARACTERS_PREFIX}${userId}`
}

// Obter todas as fichas do usuário
export function getUserCharacters(userId: string): CharacterWithMetadata[] {
  if (typeof window === 'undefined') return []
  
  try {
    const key = getStorageKey(userId)
    const charactersJson = localStorage.getItem(key)
    
    if (!charactersJson) return []
    
    return JSON.parse(charactersJson)
  } catch (error) {
    console.error('Error reading characters from localStorage:', error)
    return []
  }
}

// Salvar ficha do usuário
export function saveCharacter(userId: string, characterData: CharacterData): CharacterWithMetadata {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available')
  }
  
  const key = getStorageKey(userId)
  const characters = getUserCharacters(userId)
  
  const now = new Date().toISOString()
  const characterId = characterData.id || generateCharacterId()
  
  // Verificar se é uma atualização ou criação
  const existingIndex = characters.findIndex(c => c.id === characterId)
  
  const character: CharacterWithMetadata = {
    id: characterId,
    userId,
    name: characterData.nome || 'Sem nome',
    createdAt: existingIndex >= 0 ? characters[existingIndex].createdAt : now,
    updatedAt: now,
    data: {
      ...characterData,
      id: characterId,
    },
  }
  
  if (existingIndex >= 0) {
    // Atualizar ficha existente
    characters[existingIndex] = character
  } else {
    // Adicionar nova ficha
    characters.push(character)
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(characters))
  } catch (error) {
    console.error('Error saving character to localStorage:', error)
    throw new Error('Erro ao salvar ficha. Navegador pode estar sem espaço.')
  }
  
  return character
}

// Buscar ficha específica
export function getCharacter(userId: string, characterId: string): CharacterWithMetadata | null {
  const characters = getUserCharacters(userId)
  return characters.find(c => c.id === characterId) || null
}

// Deletar ficha
export function deleteCharacter(userId: string, characterId: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const key = getStorageKey(userId)
    const characters = getUserCharacters(userId)
    const filtered = characters.filter(c => c.id !== characterId)
    
    localStorage.setItem(key, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error deleting character from localStorage:', error)
    return false
  }
}

// Migrar ficha antiga (sem userId) para novo formato
export function migrateOldCharacter(oldCharacterData: any, userId: string): CharacterWithMetadata | null {
  if (!oldCharacterData || !oldCharacterData.nome) {
    return null
  }
  
  try {
    return saveCharacter(userId, oldCharacterData)
  } catch (error) {
    console.error('Error migrating old character:', error)
    return null
  }
}

