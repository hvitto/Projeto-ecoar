'use client'

import { useState } from 'react'
import CharacterSheet from '@/components/CharacterSheet'
import CharacterCreationWizard from '@/components/CharacterCreationWizard'

export default function Home() {
  const [showWizard, setShowWizard] = useState(true)
  const [characterData, setCharacterData] = useState<any>(null)

  const handleWizardComplete = (data: any) => {
    setCharacterData(data)
    setShowWizard(false)
  }

  if (showWizard) {
    return <CharacterCreationWizard onComplete={handleWizardComplete} />
  }

  return (
    <div className="min-h-full bg-ecoar-light">
      {/* Main Content */}
      <CharacterSheet initialData={characterData} />
    </div>
  )
}
