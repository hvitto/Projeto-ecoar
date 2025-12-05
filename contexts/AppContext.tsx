'use client'

import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { CharacterWithMetadata } from '@/types/auth'

interface AppContextType {
  onNewCharacter?: () => void
  selectedCharacter?: CharacterWithMetadata | null
  setSelectedCharacter?: (character: CharacterWithMetadata | null) => void
}

const AppContext = createContext<AppContextType>({})

export const useApp = () => useContext(AppContext)

interface AppProviderProps {
  children: ReactNode
  onNewCharacter?: () => void
}

export function AppProvider({ children, onNewCharacter }: AppProviderProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterWithMetadata | null>(null)

  const handleSetSelectedCharacter = useCallback((character: CharacterWithMetadata | null) => {
    setSelectedCharacter(character)
  }, [])

  return (
    <AppContext.Provider value={{ 
      onNewCharacter, 
      selectedCharacter,
      setSelectedCharacter: handleSetSelectedCharacter,
    }}>
      {children}
    </AppContext.Provider>
  )
}

