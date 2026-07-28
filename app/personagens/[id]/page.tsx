import { Suspense } from 'react'
import CharacterSheetPage from '@/features/character/pages/CharacterSheetPage'

type PageProps = {
  params: Promise<{ id: string }>
}

function SheetFallback() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-[#0a0a0a]">
      <div
        role="status"
        aria-live="polite"
        className="border border-ecoar-teal/40 bg-[#1a1d21] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ecoar-teal"
      >
        Abrindo ficha…
      </div>
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
