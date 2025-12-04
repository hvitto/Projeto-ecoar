'use client'

import { createContext, useContext, ReactNode } from 'react'

interface AppContextType {
  onNewCharacter?: () => void
}

const AppContext = createContext<AppContextType>({})

export const useApp = () => useContext(AppContext)

interface AppProviderProps {
  children: ReactNode
  onNewCharacter?: () => void
}

export function AppProvider({ children, onNewCharacter }: AppProviderProps) {
  return (
    <AppContext.Provider value={{ onNewCharacter }}>
      {children}
    </AppContext.Provider>
  )
}

