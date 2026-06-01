import { Suspense } from 'react'
import CharacterSheetPage from '@/features/character/pages/CharacterSheetPage'

type PageProps = {
  params: Promise<{ id: string }>
}

function SheetFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-0">
      <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando ficha...</div>
    </div>
  )
}

export default async function CharacterPage({ params }: PageProps) {
  const { id } = await params
  return (
    <Suspense fallback={<SheetFallback />}>
      <CharacterSheetPage characterId={id} />
    </Suspense>
  )
}
