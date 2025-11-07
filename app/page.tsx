'use client'

import { useState, useEffect } from 'react'
import CharacterSheet from '@/components/CharacterSheet'
import CharacterCreationWizard from '@/components/CharacterCreationWizard'

export default function Home() {
  const [showWizard, setShowWizard] = useState(true)
  const [characterData, setCharacterData] = useState<any>(null)

  // Check if we should start with wizard or sheet based on URL or localStorage
  useEffect(() => {
    const savedCharacter = localStorage.getItem('ecoar-character')
    if (savedCharacter) {
      try {
        const parsed = JSON.parse(savedCharacter)
        if (parsed && parsed.nome) {
          setCharacterData(parsed)
          setShowWizard(false)
        }
      } catch (e) {
        // Invalid saved data, start fresh
      }
    }
  }, [])

  const handleWizardComplete = (data: any) => {
    setCharacterData(data)
    setShowWizard(false)
    // Save to localStorage for persistence
    localStorage.setItem('ecoar-character', JSON.stringify(data))
  }

  const handleEditCharacter = () => {
    setShowWizard(true)
  }

  const handleNewCharacter = () => {
    setShowWizard(true)
    setCharacterData(null)
    localStorage.removeItem('ecoar-character')
  }

  if (showWizard) {
    return <CharacterCreationWizard onComplete={handleWizardComplete} />
  }

  return (
    <div className="min-h-full bg-ecoar-light dark:bg-ecoar-dark-900">
      <CharacterSheet 
        initialData={characterData} 
        onEdit={handleEditCharacter}
      />
    </div>
  )
}
