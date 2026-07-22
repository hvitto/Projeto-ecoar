import { useEffect, useMemo, useState } from 'react'
import { ecoarTypes as staticEcoarTypes, isPlayableEcoarCatalogEntry } from '@/data/ecoar'
import { ecoarSingularities as staticEcoarSingularities } from '@/data/ecoarSingularities'
import type { Ecoar } from '@/data/ecoar'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import {
  mapCatalogToCreationSingularities,
  mapCatalogToDisadvantages,
  mapCatalogToRacialSingularities,
  setRuntimeCatalog,
} from '@/lib/runtimeCatalogStore'

type EcoarCatalogResponse = {
  ecoarTypes: Ecoar[]
  ecoarSingularities: EcoarSingularity[]
  source?: 'database' | 'fallback'
}

export function useEcoarCatalogData() {
  const [ecoarTypes, setEcoarTypes] = useState<Ecoar[]>(staticEcoarTypes)
  const [ecoarSingularities, setEcoarSingularities] = useState<EcoarSingularity[]>(staticEcoarSingularities)
  const [source, setSource] = useState<'database' | 'fallback'>('fallback')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/ecoar-catalog', { cache: 'no-store' })
        if (!res.ok) return
        const payload = (await res.json()) as EcoarCatalogResponse
        if (!isMounted) return
        if (Array.isArray(payload.ecoarTypes) && payload.ecoarTypes.length) setEcoarTypes(payload.ecoarTypes)
        if (Array.isArray(payload.ecoarSingularities) && payload.ecoarSingularities.length) {
          setEcoarSingularities(payload.ecoarSingularities)
          setRuntimeCatalog(payload.ecoarSingularities, payload.source === 'database' ? 'database' : 'fallback')
        }
        if (payload.source === 'database' || payload.source === 'fallback') setSource(payload.source)
      } catch {
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

  const playableEcoarTypes = useMemo(() => {
    const filtered = ecoarTypes.filter(isPlayableEcoarCatalogEntry)
    if (filtered.length > 0) return filtered
    return staticEcoarTypes.filter(isPlayableEcoarCatalogEntry)
  }, [ecoarTypes])

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

  return {
    ecoarSingularities,
    creationSingularities: creationSingularitiesFromCatalog,
    disadvantages: disadvantagesFromCatalog,
    racialSingularities: racialSingularitiesFromCatalog,
    source,
    loading,
    ecoarTypes,
    playableEcoarTypes,
    getEcoarById: (id: string) => ecoarById.get(id),
    getEcoarSingularitiesByEcoarId: (ecoarId: string) => ecoarSingularities.filter((s) => s.ecoarId === ecoarId),
    getEcoarSingularityById: (id: string) => singularityById.get(id),
  }
}
