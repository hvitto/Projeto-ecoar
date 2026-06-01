'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PersonagensError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4 text-center gap-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90">
        Erro ao carregar personagens
      </h2>
      <p className="text-sm text-slate-600 dark:text-ecoar-light-900/60 max-w-md">
        {error.message || 'Ocorreu um problema inesperado.'}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 rounded-lg bg-ecoar-teal-600 text-white text-sm font-medium hover:bg-ecoar-teal-700 transition-colors"
        >
          Tentar novamente
        </button>
        <Link
          href="/personagens"
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-ecoar-light-900/20 text-sm font-medium hover:bg-slate-50 dark:hover:bg-ecoar-dark-800 transition-colors"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  )
}
