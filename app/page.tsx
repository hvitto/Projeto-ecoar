'use client'

import { useState, useEffect, useRef } from 'react'
import CharacterSheet from '@/components/CharacterSheet'
import CharacterCreationWizard from '@/components/CharacterCreationWizard'
import { AppProvider } from '@/contexts/AppContext'

// Helper function to safely parse localStorage data
function getSavedCharacter(): any | null {
  if (typeof window === 'undefined') return null
  
  try {
    const savedCharacter = localStorage.getItem('ecoar-character')
    if (!savedCharacter) return null
    
    const parsed = JSON.parse(savedCharacter)
    
    // Validate that the parsed data has required fields
    if (parsed && typeof parsed === 'object' && parsed.nome && typeof parsed.nome === 'string') {
      return parsed
    }
    
    // Invalid data, clean it up
    localStorage.removeItem('ecoar-character')
    return null
  } catch (e) {
    // Corrupted data, clean it up
    console.error('Error loading character from localStorage:', e)
    localStorage.removeItem('ecoar-character')
    return null
  }
}

export default function Home() {
  const [showWizard, setShowWizard] = useState(true)
  const [characterData, setCharacterData] = useState<any>(null)
  const [wizardKey, setWizardKey] = useState(0) // Key to force reset of wizard
  const hasCheckedLocalStorage = useRef(false)

  // Check localStorage only once after mount, but don't block initial render
  useEffect(() => {
    if (hasCheckedLocalStorage.current) return
    
    hasCheckedLocalStorage.current = true
    const savedCharacter = getSavedCharacter()
    
    if (savedCharacter) {
      setCharacterData(savedCharacter)
      setShowWizard(false)
    }
  }, [])

  const handleWizardComplete = (data: any) => {
    if (!data || !data.nome) {
      console.error('Invalid character data provided')
      return
    }
    
    setCharacterData(data)
    setShowWizard(false)
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('ecoar-character', JSON.stringify(data))
    } catch (e) {
      console.error('Error saving character to localStorage:', e)
    }
  }

  const handleEditCharacter = () => {
    setShowWizard(true)
    // Don't reset wizard key when editing - allow editing existing character
  }

  const handleNewCharacter = () => {
    // Clear all data first
    setCharacterData(null)
    
    // Clear localStorage
    try {
      localStorage.removeItem('ecoar-character')
    } catch (e) {
      console.error('Error clearing localStorage:', e)
    }
    
    // Force complete reset by changing key and showing wizard
    setWizardKey(prev => prev + 1)
    setShowWizard(true)
  }

  if (showWizard) {
    return (
      <AppProvider onNewCharacter={handleNewCharacter}>
        <CharacterCreationWizard 
          key={wizardKey}
          onComplete={handleWizardComplete} 
        />
      </AppProvider>
    )
  }

  return (
    <AppProvider onNewCharacter={handleNewCharacter}>
      <div className="min-h-full bg-ecoar-light">
        <CharacterSheet 
          initialData={characterData} 
          onEdit={handleEditCharacter}
        />
      </div>
    </AppProvider>
  )
}
