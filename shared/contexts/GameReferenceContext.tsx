'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { GameReferencePayload } from '@/lib/gameReferenceRepository'
import { hydrateGameReferenceFromPayload } from '@/lib/gameReferenceHydrate'

type GameReferenceContextValue = {
  ready: boolean
  source: GameReferencePayload['source'] | 'static' | 'unavailable'
  error: string | null
}

const GameReferenceContext = createContext<GameReferenceContextValue>({
  ready: false,
  source: 'unavailable',
  error: null,
})

let sharedGameReferencePromise: Promise<GameReferencePayload> | null = null

function loadGameReference(): Promise<GameReferencePayload> {
  if (!sharedGameReferencePromise) {
    sharedGameReferencePromise = fetch('/api/game-reference', {
      cache: 'no-store',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          sharedGameReferencePromise = null
          throw new Error('Falha ao carregar referências do servidor')
        }
        return (await res.json()) as GameReferencePayload
      })
      .catch((e) => {
        sharedGameReferencePromise = null
        throw e
      })
  }
  return sharedGameReferencePromise
}

export function useGameReferenceCatalog() {
  return useContext(GameReferenceContext)
}

export function GameReferenceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [source, setSource] = useState<GameReferenceContextValue['source']>('unavailable')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await loadGameReference()
        if (cancelled) return
        const hydrated = hydrateGameReferenceFromPayload(data)
        if (!hydrated) {
          setError('Referências vazias no banco. Rode yarn seed:reference.')
          setSource('unavailable')
        } else {
          setSource('database')
          setError(null)
        }
        setReady(true)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erro de rede ao carregar referências')
          setSource('unavailable')
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
