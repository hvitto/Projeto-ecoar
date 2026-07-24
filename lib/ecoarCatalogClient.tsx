'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isPlayableEcoarCatalogEntry } from '@/data/ecoar'
import type { Ecoar } from '@/data/ecoar'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import {
  mapCatalogToCreationSingularities,
  mapCatalogToDisadvantages,
  mapCatalogToRacialSingularities,
  setRuntimeCatalog,
} from '@/lib/runtimeCatalogStore'
import { hydrateSystemCatalogsFromEcoar } from '@/lib/hydrateSystemCatalogsFromEcoar'

type EcoarCatalogResponse = {
  ecoarTypes: Ecoar[]
  ecoarSingularities: EcoarSingularity[]
  source?: 'database' | 'fallback'
  error?: string
}

type EcoarCatalogContextValue = {
  ecoarSingularities: EcoarSingularity[]
  creationSingularities: ReturnType<typeof mapCatalogToCreationSingularities>
  disadvantages: ReturnType<typeof mapCatalogToDisadvantages>
  racialSingularities: ReturnType<typeof mapCatalogToRacialSingularities>
  source: 'database' | 'unavailable'
  loading: boolean
  error: string | null
  ecoarTypes: Ecoar[]
  playableEcoarTypes: Ecoar[]
  getEcoarById: (id: string) => Ecoar | undefined
  getEcoarSingularitiesByEcoarId: (ecoarId: string) => EcoarSingularity[]
  getEcoarSingularityById: (id: string) => EcoarSingularity | undefined
}

const EcoarCatalogContext = createContext<EcoarCatalogContextValue | null>(null)

let sharedCatalogPromise: Promise<EcoarCatalogResponse> | null = null

function loadEcoarCatalog(): Promise<EcoarCatalogResponse> {
  if (!sharedCatalogPromise) {
    sharedCatalogPromise = fetch('/api/ecoar-catalog', { cache: 'no-store' })
      .then(async (res) => {
        const payload = (await res.json()) as EcoarCatalogResponse
        if (!res.ok) {
          const err = new Error(payload.error ?? `HTTP ${res.status}`)
          sharedCatalogPromise = null
          throw err
        }
        return payload
      })
      .catch((e) => {
        sharedCatalogPromise = null
        throw e
      })
  }
  return sharedCatalogPromise
}

export function EcoarCatalogProvider({ children }: { children: ReactNode }) {
  const [ecoarTypes, setEcoarTypes] = useState<Ecoar[]>([])
  const [ecoarSingularities, setEcoarSingularities] = useState<EcoarSingularity[]>([])
  const [source, setSource] = useState<'database' | 'unavailable'>('unavailable')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const payload = await loadEcoarCatalog()
        if (!isMounted) return
        if (Array.isArray(payload.ecoarTypes) && payload.ecoarTypes.length) setEcoarTypes(payload.ecoarTypes)
        if (Array.isArray(payload.ecoarSingularities) && payload.ecoarSingularities.length) {
          setEcoarSingularities(payload.ecoarSingularities)
          setRuntimeCatalog(payload.ecoarSingularities, 'database')
          hydrateSystemCatalogsFromEcoar(payload.ecoarSingularities)
        }
        setSource(payload.source === 'database' ? 'database' : 'unavailable')
        setError(null)
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Falha ao carregar catálogo Ecoar')
          setSource('unavailable')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const singularityById = useMemo(() => {
    const map = new Map<string, EcoarSingularity>()
    for (const s of ecoarSingularities) map.set(s.id, s)
    return map
  }, [ecoarSingularities])

  const ecoarById = useMemo(() => {
    const map = new Map<string, Ecoar>()
    for (const e of ecoarTypes) map.set(e.id, e)
    return map
  }, [ecoarTypes])

  const playableEcoarTypes = useMemo(() => ecoarTypes.filter(isPlayableEcoarCatalogEntry), [ecoarTypes])

  const creationSingularitiesFromCatalog = useMemo(
    () => mapCatalogToCreationSingularities(ecoarSingularities),
    [ecoarSingularities],
  )
  const disadvantagesFromCatalog = useMemo(
    () => mapCatalogToDisadvantages(ecoarSingularities),
    [ecoarSingularities],
  )
  const racialSingularitiesFromCatalog = useMemo(
    () => mapCatalogToRacialSingularities(ecoarSingularities),
    [ecoarSingularities],
  )

  const value = useMemo(
    (): EcoarCatalogContextValue => ({
      ecoarSingularities,
      creationSingularities: creationSingularitiesFromCatalog,
      disadvantages: disadvantagesFromCatalog,
      racialSingularities: racialSingularitiesFromCatalog,
      source,
      loading,
      error,
      ecoarTypes,
      playableEcoarTypes,
      getEcoarById: (id: string) => ecoarById.get(id),
      getEcoarSingularitiesByEcoarId: (ecoarId: string) =>
        ecoarSingularities.filter((s) => s.ecoarId === ecoarId),
      getEcoarSingularityById: (id: string) => singularityById.get(id),
    }),
    [
      ecoarSingularities,
      creationSingularitiesFromCatalog,
      disadvantagesFromCatalog,
      racialSingularitiesFromCatalog,
      source,
      loading,
      error,
      ecoarTypes,
      playableEcoarTypes,
      ecoarById,
      singularityById,
    ],
  )

  return <EcoarCatalogContext.Provider value={value}>{children}</EcoarCatalogContext.Provider>
}

export function useEcoarCatalogData(): EcoarCatalogContextValue {
  const ctx = useContext(EcoarCatalogContext)
  if (!ctx) {
    throw new Error('useEcoarCatalogData deve ser usado dentro de EcoarCatalogProvider')
  }
  return ctx
}
