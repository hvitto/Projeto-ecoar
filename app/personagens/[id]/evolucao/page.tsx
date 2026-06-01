import { Suspense } from 'react'
import CharacterEvolutionPage from '@/features/character/pages/CharacterEvolutionPage'

type PageProps = {
  params: Promise<{ id: string }>
}

function EvolutionFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-0">
      <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando...</div>
    </div>
  )
}

export default async function EvolucaoCharacterPage({ params }: PageProps) {
  const { id } = await params
  return (
    <Suspense fallback={<EvolutionFallback />}>
      <CharacterEvolutionPage characterId={id} />
    </Suspense>
  )
}
