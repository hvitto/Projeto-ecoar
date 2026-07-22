'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { GameReferencePayload } from '@/lib/gameReferenceRepository'
import { hydrateGameReferenceFromPayload } from '@/lib/gameReferenceHydrate'

type GameReferenceContextValue = {
  ready: boolean
  source: GameReferencePayload['source'] | 'static'
  error: string | null
}

const GameReferenceContext = createContext<GameReferenceContextValue>({
  ready: false,
  source: 'static',
  error: null,
})

export function useGameReferenceCatalog() {
  return useContext(GameReferenceContext)
}

export function GameReferenceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [source, setSource] = useState<GameReferenceContextValue['source']>('static')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/game-reference', { cache: 'no-store', credentials: 'include' })
        if (!res.ok) {
          if (!cancelled) {
            setError('Falha ao carregar referências do servidor')
            setReady(true)
          }
          return
        }
        const data = (await res.json()) as GameReferencePayload
        if (cancelled) return
        const hydrated = hydrateGameReferenceFromPayload(data)
        setSource(hydrated ? 'database' : 'static')
        setReady(true)
      } catch {
        if (!cancelled) {
          setError('Erro de rede ao carregar referências')
          setReady(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <GameReferenceContext.Provider value={{ ready, source, error }}>
      {children}
    </GameReferenceContext.Provider>
  )
}
