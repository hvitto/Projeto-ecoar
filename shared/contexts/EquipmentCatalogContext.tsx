'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ArmorCatalogEntry, CatalogEntry, CostMultiplierTable, UtilityCatalogEntry, WeaponCatalogEntry } from '@/shared/types/equipment'
import { buildCatalogEntryMap } from '@/lib/equipmentCost'

export type EquipmentCatalogDataSource = 'database' | 'unavailable'

type ApiCatalogResponse = {
  weapons: WeaponCatalogEntry[]
  armor: ArmorCatalogEntry[]
  utilities: UtilityCatalogEntry[]
  multiplierTables: CostMultiplierTable[]
  source?: 'empty' | 'database'
}

export type EquipmentCatalogContextValue = {
  weapons: WeaponCatalogEntry[]
  armor: ArmorCatalogEntry[]
  utilities: UtilityCatalogEntry[]
  multiplierTables: CostMultiplierTable[]
  catalogById: Map<string, CatalogEntry>
  dataSource: EquipmentCatalogDataSource
  loading: boolean
  error: string | null
}

const EquipmentCatalogContext = createContext<EquipmentCatalogContextValue | null>(null)

const emptyLists = {
  weapons: [] as WeaponCatalogEntry[],
  armor: [] as ArmorCatalogEntry[],
  utilities: [] as UtilityCatalogEntry[],
  multiplierTables: [] as CostMultiplierTable[],
}

let sharedEquipmentCatalogPromise: Promise<ApiCatalogResponse> | null = null

function loadEquipmentCatalog(): Promise<ApiCatalogResponse> {
  if (!sharedEquipmentCatalogPromise) {
    sharedEquipmentCatalogPromise = fetch('/api/equipment-catalog', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return (await res.json()) as ApiCatalogResponse
      })
      .catch((e) => {
        sharedEquipmentCatalogPromise = null
        throw e
      })
  }
  return sharedEquipmentCatalogPromise
}

export function EquipmentCatalogProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<ApiCatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await loadEquipmentCatalog()
        if (cancelled) return
        const total =
          (data.weapons?.length ?? 0) + (data.armor?.length ?? 0) + (data.utilities?.length ?? 0)
        if (data.source === 'empty' || total === 0) {
          setRemote(null)
          setError('Catálogo de equipamento indisponível no banco. Rode yarn seed:catalog.')
        } else {
          setRemote(data)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setRemote(null)
          setError(e instanceof Error ? e.message : 'Falha ao carregar catálogo')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo((): EquipmentCatalogContextValue => {
    const useRemote = remote && (remote.weapons.length + remote.armor.length + remote.utilities.length > 0)
    const weapons = useRemote ? remote!.weapons : emptyLists.weapons
    const armor = useRemote ? remote!.armor : emptyLists.armor
    const utilities = useRemote ? remote!.utilities : emptyLists.utilities
    const multiplierTables =
      useRemote && remote!.multiplierTables?.length ? remote!.multiplierTables : emptyLists.multiplierTables
    const catalogById = buildCatalogEntryMap(weapons, armor, utilities)
    return {
      weapons,
      armor,
      utilities,
      multiplierTables,
      catalogById,
      dataSource: useRemote ? 'database' : 'unavailable',
      loading,
      error,
    }
  }, [remote, loading, error])

  return <EquipmentCatalogContext.Provider value={value}>{children}</EquipmentCatalogContext.Provider>
}

export function useEquipmentCatalog(): EquipmentCatalogContextValue {
  const ctx = useContext(EquipmentCatalogContext)
  if (!ctx) {
    throw new Error('useEquipmentCatalog deve ser usado dentro de EquipmentCatalogProvider')
  }
  return ctx
}
