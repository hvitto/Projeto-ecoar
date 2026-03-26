import { useEffect, useMemo, useState } from 'react'
import { ecoarTypes as staticEcoarTypes } from '@/data/ecoar'
import { ecoarSingularities as staticEcoarSingularities } from '@/data/ecoarSingularities'
import type { Ecoar } from '@/data/ecoar'
import type { EcoarSingularity } from '@/data/ecoarSingularities'

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
        if (Array.isArray(payload.ecoarSingularities) && payload.ecoarSingularities.length) setEcoarSingularities(payload.ecoarSingularities)
        if (payload.source === 'database' || payload.source === 'fallback') setSource(payload.source)
      } catch {
        // Mantém fallback estático silenciosamente.
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

  return {
    ecoarSingularities,
    source,
    loading,
    ecoarTypes,
    getEcoarById: (id: string) => ecoarById.get(id),
    getEcoarSingularitiesByEcoarId: (ecoarId: string) => ecoarSingularities.filter((s) => s.ecoarId === ecoarId),
    getEcoarSingularityById: (id: string) => singularityById.get(id),
  }
}
