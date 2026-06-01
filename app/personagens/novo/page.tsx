import { Suspense } from 'react'
import CharacterWizardPage from '@/features/character/pages/CharacterWizardPage'

function WizardFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-0">
      <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando...</div>
    </div>
  )
}

export default function NovoPersonagemPage() {
  return (
    <Suspense fallback={<WizardFallback />}>
      <CharacterWizardPage />
    </Suspense>
  )
}
