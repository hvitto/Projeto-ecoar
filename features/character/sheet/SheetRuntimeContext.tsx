'use client'

import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { CharacterSheetState } from '@/features/character/hooks/sheetInitialState'
import type {
  ArmorCatalogEntry,
  ArmorResistanceValues,
  CatalogEntry,
  CatalogOwnedItem,
  EquippedWeaponSlotId,
  EquippedWeaponState,
  UtilityCatalogEntry,
  WeaponCatalogEntry,
} from '@/shared/types/equipment'
import type { SingularitiesBonusAggregate } from '@/lib/singularityBonuses'

export type SheetAttributeDef = {
  key: string
  label: string
  icon: LucideIcon
}

export type SheetEffectiveAttribute = {
  effectiveMod: number
  singularityBonus: number
  bookDisadvantageBonus: number
  equipmentBonus: number
}

export type SheetDerivedValues = {
  corpoMax: number
  menteMax: number
  folegoMax: number
  manaMax: number
  commonTests: {
    iniciativa: number
    esquiva: number
    coragem: number
    arredores: number
  }
}

export type SheetArmorStats = {
  crit: number
  esquiva: number
  furtividade: number
}

export type SheetRuntimeValue = {
  characterData: CharacterSheetState
  setCharacterData: Dispatch<SetStateAction<CharacterSheetState>>
  updateField: (path: string, value: unknown) => void
  isEditing: boolean
  canEditSheet: boolean
  hasMasterOverride: boolean
  handleStartEdit: () => void
  handleSaveEdit: () => void | Promise<void>
  handleCancelEdit: () => void
  isSaving: boolean
  onOpenEvolution?: () => void
  peToAdd: string
  setPeToAdd: (v: string) => void
  peToAddNumber: number
  nivelAlma: number
  nivelPoder: number
  nivelTrilha: number
  derivedValues: SheetDerivedValues
  effectiveAttributesByKey: Record<string, SheetEffectiveAttribute>
  singularityBonuses: SingularitiesBonusAggregate
  equipmentMechanicalBonuses: SingularitiesBonusAggregate | Record<string, unknown>
  bookDisadvantageBonuses: SingularitiesBonusAggregate | Record<string, unknown>
  attributes: SheetAttributeDef[]
  activeSkillCategory: string
  setActiveSkillCategory: (v: string) => void
  skillCategoryKeys: string[]
  categoryLabels: Record<string, string>
  skillsByCategory: Map<string, Array<{ id: string; name: string; category: string; specializations: Array<{ id: string; name: string }> }>>
  coerceInt: (v: unknown, fallback?: number) => number
  markLimitsUserTriggered: () => void
  commonTests: {
    iniciativa: number
    esquiva: number
    coragem: number
    arredores: number
  }
  equipmentSpaces: { used: number; total: number | string }
  equipmentSubTab: 'inventario' | 'equipados'
  setEquipmentSubTab: (v: 'inventario' | 'equipados') => void
  equipmentPickerOpen: boolean
  setEquipmentPickerOpen: (open: boolean) => void
  toggleEquipWeaponInstance: (instanceId: string, shouldEquip: boolean) => void
  toggleEquipArmorInstance: (instanceId: string, shouldEquip: boolean) => void
  toggleEquipAccessoryInstance: (instanceId: string, shouldEquip: boolean) => void
  findEquippedSlotForInstance: (id: string) => EquippedWeaponSlotId | null | undefined
  isArmorCatalogItem: (item: CatalogOwnedItem) => boolean
  isAccessoryCatalogItem: (item: CatalogOwnedItem) => boolean
  setEquippedWeaponSlot: (slot: EquippedWeaponSlotId, next: EquippedWeaponState | undefined) => void
  removeSheetCatalogItem: (instanceId: string) => void
  handleEquipmentCatalogPick: (entry: CatalogEntry, custoCeros: number) => void
  applyRaceBonuses: (raceId: string) => void
  weaponCatalogById: Map<string, WeaponCatalogEntry>
  armorCatalogById: Map<string, ArmorCatalogEntry>
  utilityCatalogById: Map<string, UtilityCatalogEntry>
  totalResistances: ArmorResistanceValues
  totalArmorStats: SheetArmorStats
  equippedMainArmorEntries: ArmorCatalogEntry[]
  equippedAccessoryEntries: ArmorCatalogEntry[]
  equippedUtilityEntries: UtilityCatalogEntry[]
  characterId?: string
  tableId?: string | null
}

const SheetRuntimeContext = createContext<SheetRuntimeValue | null>(null)

export function SheetRuntimeProvider({
  value,
  children,
}: {
  value: SheetRuntimeValue
  children: ReactNode
}) {
  return <SheetRuntimeContext.Provider value={value}>{children}</SheetRuntimeContext.Provider>
}

export function useSheetRuntime(): SheetRuntimeValue {
  const ctx = useContext(SheetRuntimeContext)
  if (!ctx) {
    throw new Error('useSheetRuntime must be used within SheetRuntimeProvider')
  }
  return ctx
}
