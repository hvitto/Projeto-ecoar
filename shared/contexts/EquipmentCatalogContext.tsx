'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ArmorCatalogEntry, CatalogEntry, CostMultiplierTable, UtilityCatalogEntry, WeaponCatalogEntry } from '@/shared/types/equipment'
import {
  armorCatalog as staticArmor,
  equipmentCostMultiplierTables as staticMultiplierTables,
  utilityCatalog as staticUtilities,
  weaponCatalog as staticWeapons,
} from '@/data/equipment'
import { buildCatalogEntryMap } from '@/lib/equipmentCost'

export type EquipmentCatalogDataSource = 'static' | 'database'

type ApiCatalogResponse = {
  weapons: WeaponCatalogEntry[]
  armor: ArmorCatalogEntry[]
  utilities: UtilityCatalogEntry[]
  multiplierTables: CostMultiplierTable[]
  source?: 'empty' | 'database'
}

function staticPayload(): {
  weapons: WeaponCatalogEntry[]
  armor: ArmorCatalogEntry[]
  utilities: UtilityCatalogEntry[]
  multiplierTables: CostMultiplierTable[]
} {
  return {
    weapons: staticWeapons,
    armor: staticArmor,
    utilities: staticUtilities,
    multiplierTables: staticMultiplierTables,
  }
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

export function EquipmentCatalogProvider({ children }: { children: ReactNode }) {
  const staticData = useMemo(() => staticPayload(), [])
  const [remote, setRemote] = useState<ApiCatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/equipment-catalog', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as ApiCatalogResponse
        if (cancelled) return
        const total =
          (data.weapons?.length ?? 0) + (data.armor?.length ?? 0) + (data.utilities?.length ?? 0)
        if (data.source === 'empty' || total === 0) {
          setRemote(null)
        } else {
          setRemote(data)
        }
        setError(null)
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
    const weapons = useRemote ? remote!.weapons : staticData.weapons
    const armor = useRemote ? remote!.armor : staticData.armor
    const utilities = useRemote ? remote!.utilities : staticData.utilities
    const multFromRemote = useRemote && remote!.multiplierTables?.length ? remote!.multiplierTables : null
    const multiplierTables = multFromRemote ?? staticData.multiplierTables
    const catalogById = buildCatalogEntryMap(weapons, armor, utilities)
    const dataSource: EquipmentCatalogDataSource = useRemote ? 'database' : 'static'
    return {
      weapons,
      armor,
      utilities,
      multiplierTables,
      catalogById,
      dataSource,
      loading,
      error,
    }
  }, [remote, staticData, loading, error])

  return <EquipmentCatalogContext.Provider value={value}>{children}</EquipmentCatalogContext.Provider>
}

export function useEquipmentCatalog(): EquipmentCatalogContextValue {
  const ctx = useContext(EquipmentCatalogContext)
  if (!ctx) {
    throw new Error('useEquipmentCatalog deve ser usado dentro de EquipmentCatalogProvider')
  }
  return ctx
}
