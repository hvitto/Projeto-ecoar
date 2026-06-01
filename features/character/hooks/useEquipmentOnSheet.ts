'use client'

import { useCallback, useMemo } from 'react'
import type {
  ArmorCatalogEntry,
  CatalogEntry,
  CatalogOwnedItem,
  UtilityCatalogEntry,
  WeaponCatalogEntry,
} from '@/types/equipment'
import type { CharacterSheetState } from '@/features/character/hooks/sheetInitialState'

export function useEquipmentOnSheet(
  characterData: CharacterSheetState,
  weapons: unknown[] | undefined,
  armor: unknown[] | undefined,
  utilities: unknown[] | undefined,
) {
  const weaponCatalogById = useMemo(() => {
    const map = new Map<string, WeaponCatalogEntry>()
    ;(weapons ?? []).forEach((w: unknown) => {
      const row = w as { id?: string }
      if (row?.id) map.set(String(row.id), w as WeaponCatalogEntry)
    })
    return map
  }, [weapons])

  const armorCatalogById = useMemo(() => {
    const map = new Map<string, CatalogEntry>()
    ;(armor ?? []).forEach((a: unknown) => {
      const row = a as { id?: string }
      if (row?.id) map.set(String(row.id), a as CatalogEntry)
    })
    return map
  }, [armor])

  const utilityCatalogById = useMemo(() => {
    const map = new Map<string, CatalogEntry>()
    ;(utilities ?? []).forEach((u: unknown) => {
      const row = u as { id?: string }
      if (row?.id) map.set(String(row.id), u as CatalogEntry)
    })
    return map
  }, [utilities])

  const resolveCatalogEntryKind = useCallback(
    (entry: CatalogEntry): CatalogOwnedItem['kind'] => {
      const raw = entry as { id: string; kind?: CatalogOwnedItem['kind'] }
      if (raw.kind === 'weapon' || raw.kind === 'armor' || raw.kind === 'utility') {
        return raw.kind
      }
      const id = String(raw.id)
      if (weaponCatalogById.has(id)) return 'weapon'
      if (armorCatalogById.has(id)) return 'armor'
      if (utilityCatalogById.has(id)) return 'utility'
      return 'utility'
    },
    [weaponCatalogById, armorCatalogById, utilityCatalogById],
  )

  const equipmentMechanicalBonuses = useMemo(() => {
    const sumAttr: Record<string, number> = {}
    const sumSkills: Record<string, number> = {}
    const add = (
      entry:
        | {
            mechanicalBonuses?: { attributes?: Record<string, number>; skills?: Record<string, number> }
          }
        | undefined,
    ) => {
      if (!entry?.mechanicalBonuses) return
      for (const [k, v] of Object.entries(entry.mechanicalBonuses.attributes ?? {})) {
        sumAttr[k] = (sumAttr[k] ?? 0) + v
      }
      for (const [k, v] of Object.entries(entry.mechanicalBonuses.skills ?? {})) {
        sumSkills[k] = (sumSkills[k] ?? 0) + v
      }
    }
    const findOwned = (instanceId: string) =>
      characterData.itensCatalogo.find((i) => i.instanceId === instanceId)
    for (const slot of [characterData.equippedWeapons?.slot1, characterData.equippedWeapons?.slot2]) {
      if (!slot?.instanceId) continue
      const owned = findOwned(slot.instanceId)
      if (owned?.kind === 'weapon') add(weaponCatalogById.get(String(owned.catalogId)) as WeaponCatalogEntry | undefined)
    }
    for (const arm of characterData.equippedArmors ?? []) {
      if (!arm?.instanceId) continue
      const owned = findOwned(arm.instanceId)
      if (owned?.kind === 'armor')
        add(armorCatalogById.get(String(owned.catalogId)) as ArmorCatalogEntry | undefined)
    }
    for (const acc of characterData.equippedAccessories ?? []) {
      const owned = findOwned(acc.instanceId)
      if (!owned) continue
      if (owned.kind === 'armor') add(armorCatalogById.get(String(owned.catalogId)) as ArmorCatalogEntry | undefined)
      else if (owned.kind === 'utility')
        add(utilityCatalogById.get(String(owned.catalogId)) as UtilityCatalogEntry | undefined)
    }
    return { attributes: sumAttr, skills: sumSkills }
  }, [
    armorCatalogById,
    characterData.equippedAccessories,
    characterData.equippedArmors,
    characterData.equippedWeapons,
    characterData.itensCatalogo,
    utilityCatalogById,
    weaponCatalogById,
  ])

  return {
    weaponCatalogById,
    armorCatalogById,
    utilityCatalogById,
    resolveCatalogEntryKind,
    equipmentMechanicalBonuses,
  }
}
