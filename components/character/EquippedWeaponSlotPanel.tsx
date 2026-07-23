'use client'

import { resolveWeaponAttackAutoText } from '@/lib/equippedWeaponAttack'
import { formatCerosDisplay } from '@/lib/equipmentCost'
import { getWeaponQualityCombatModifiers } from '@/lib/equipmentQuality'
import { buildWeaponFichaMeta } from '@/lib/weaponSheetLayout'
import WeaponFichaLayout from '@/components/equipment/WeaponFichaLayout'
import type {
  CatalogOwnedItem,
  EquippedWeaponSlotId,
  EquippedWeaponState,
  WeaponCatalogEntry,
} from '@/shared/types/equipment'
import type { AttackResolutionCharacterData } from '@/lib/equippedWeaponAttack'

export type EquippedWeaponSlotPanelProps = {
  variant: 'sheet' | 'panel'
  slotId: EquippedWeaponSlotId
  slotLabel: string
  slotState: EquippedWeaponState | undefined
  owned: CatalogOwnedItem | undefined
  entry: WeaponCatalogEntry | undefined
  characterData: AttackResolutionCharacterData
  isEditing: boolean
  showEditControls: boolean
  singularityCombatBonuses?: {
    attack?: number
    damage?: number
    crit?: number
    maxDamage?: number
    penetration?: number
  }
  onSetSlot: (slot: EquippedWeaponSlotId, next: EquippedWeaponState | undefined) => void
  onToggleEquipInstance: (instanceId: string, shouldEquip: boolean) => void
}

export default function EquippedWeaponSlotPanel({
  slotId,
  slotLabel,
  slotState,
  owned,
  entry,
  characterData,
  isEditing,
  showEditControls,
  singularityCombatBonuses,
  onSetSlot,
  onToggleEquipInstance,
}: EquippedWeaponSlotPanelProps) {
  if (!slotState?.instanceId || !owned || !entry) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 dark:border-ecoar-light-900/20 p-3 text-sm text-slate-500 dark:text-ecoar-light-900/55">
        {slotLabel}: nenhuma arma equipada
      </div>
    )
  }

  const qualityMods = getWeaponQualityCombatModifiers(owned.qualidadeNivel ?? 0)
  const singAttack = singularityCombatBonuses?.attack ?? 0
  const attackBonus = (slotState.attackBonus ?? 0) + singAttack + qualityMods.attackBonus
  const attackAutoText = resolveWeaponAttackAutoText({ entry, characterData })
  const attackResolved =
    attackAutoText && attackBonus !== 0
      ? `${attackAutoText} ${attackBonus > 0 ? '+' : '-'} ${Math.abs(attackBonus)}`
      : attackAutoText

  const meta = buildWeaponFichaMeta({
    entry,
    name: owned.nome,
    qualidadeNivel: owned.qualidadeNivel ?? 0,
  })

  return (
    <WeaponFichaLayout
      meta={meta}
      headerRight={
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/55">
            {slotLabel}
          </span>
          <span className="text-xs tabular-nums text-slate-600 dark:text-ecoar-light-900/70">
            {formatCerosDisplay(owned.custoCeros)}
          </span>
        </div>
      }
      footer={
        <div className="space-y-2">
          {attackResolved && (
            <div className="text-xs">
              <span className="text-slate-500 dark:text-ecoar-light-900/55">Teste resolvido: </span>
              <span className="font-semibold text-slate-900 dark:text-ecoar-light-900">{attackResolved}</span>
            </div>
          )}
          {showEditControls && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[11px] text-slate-500 dark:text-ecoar-light-900/60">
                Bônus ataque
                <input
                  type="number"
                  disabled={!isEditing}
                  value={slotState.attackBonus ?? 0}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10)
                    onSetSlot(slotId, {
                      ...slotState,
                      attackBonus: Number.isFinite(n) ? n : 0,
                    })
                  }}
                  className="ml-1.5 w-16 px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] disabled:opacity-60"
                />
              </label>
              <button
                type="button"
                disabled={!isEditing}
                onClick={() => onToggleEquipInstance(owned.instanceId, false)}
                className="text-[11px] text-ecoar-magenta hover:underline disabled:opacity-50"
              >
                Desequipar
              </button>
            </div>
          )}
        </div>
      }
    />
  )
}
