'use client'

import type { ReactNode } from 'react'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { useGameReferenceCatalog } from '@/shared/contexts/GameReferenceContext'

export function CatalogBootstrapGate({ children }: { children: ReactNode }) {
  const { ready, source: refSource, error: refError } = useGameReferenceCatalog()
  const { loading, source: ecoarSource, error: ecoarError } = useEcoarCatalogData()

  if (!ready || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm opacity-80">
        Carregando catálogo do banco…
      </div>
    )
  }

  const err = refError || ecoarError
  if (err || refSource !== 'database' || ecoarSource !== 'database') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 p-6 text-center text-sm">
        <p>Catálogo indisponível. O app agora exige dados no Neon.</p>
        <p className="opacity-70">{err ?? 'Verifique seeds: yarn seed:reference, seed:ecoar, seed:system, seed:catalog.'}</p>
      </div>
    )
  }

  return <>{children}</>
}
