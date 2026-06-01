import { Suspense } from 'react'
import CharacterWizardPage from '@/features/character/pages/CharacterWizardPage'

type PageProps = {
  params: Promise<{ id: string }>
}

function WizardFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-0">
      <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando...</div>
    </div>
  )
}

export default async function EditarCharacterPage({ params }: PageProps) {
  const { id } = await params
  return (
    <Suspense fallback={<WizardFallback />}>
      <CharacterWizardPage characterId={id} />
    </Suspense>
  )
}
