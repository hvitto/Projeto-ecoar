'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Redireciona bookmarks legados `/?view=...&characterId=...` para rotas `/personagens/*`.
 */
export default function LegacyViewRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const view = searchParams.get('view')
    if (!view || view === 'login' || view === 'register' || view === 'dashboard') {
      if (view === 'dashboard') {
        router.replace('/personagens')
      }
      return
    }

    const characterId = searchParams.get('characterId')
    const step = searchParams.get('step')
    const stepQs = step != null ? `?step=${encodeURIComponent(step)}` : ''

    switch (view) {
      case 'wizard':
        if (characterId) {
          router.replace(`/personagens/${characterId}/editar${stepQs}`)
        } else {
          router.replace(`/personagens/novo${stepQs}`)
        }
        break
      case 'sheet':
        if (characterId) {
          router.replace(`/personagens/${characterId}`)
        } else {
          router.replace('/personagens')
        }
        break
      case 'evolution':
        if (characterId) {
          router.replace(`/personagens/${characterId}/evolucao`)
        } else {
          router.replace('/personagens')
        }
        break
      default:
        break
    }
  }, [router, searchParams])

  return null
}
