'use client'

import {
  ARMOR_RESISTANCE_KEYS,
  DAMAGE_TYPE_LABELS_PT,
  type ArmorResistanceKey,
} from '@/shared/types/equipment'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetLabel, sheetMeta, sheetStatCell } from '@/features/character/sheet/sheetChrome'

export function ResistancesWidget() {
  const {
    totalResistances,
    totalArmorStats,
    equippedMainArmorEntries,
    equippedAccessoryEntries,
    equippedUtilityEntries,
  } = useSheetRuntime()

  const origins = [
    ...equippedMainArmorEntries.map((e) => e.name),
    ...equippedAccessoryEntries.map((a) => a.name),
    ...equippedUtilityEntries.map((u) => u.name),
  ].filter(Boolean)

  return (
    <div className="flex h-full w-full flex-col space-y-2 p-2.5 sm:p-3">
      <div className={`flex flex-wrap items-center justify-between gap-2 ${sheetMeta}`}>
        <span className="truncate">
          {equippedMainArmorEntries.length > 0
            ? `Armaduras: ${equippedMainArmorEntries.map((e) => e.name).join(', ')}`
            : 'Nenhuma armadura equipada — equipe na Mochila'}
        </span>
        <span className="shrink-0 tabular-nums text-ecoar-teal">Crít. {totalArmorStats.crit}</span>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
        {ARMOR_RESISTANCE_KEYS.map((key: ArmorResistanceKey) => (
          <div
            key={key}
            className={`${sheetStatCell} min-w-0 px-1.5 py-1.5 text-center`}
          >
            <div className={`${sheetLabel} mb-0.5 truncate`} title={DAMAGE_TYPE_LABELS_PT[key]}>
              {DAMAGE_TYPE_LABELS_PT[key]}
            </div>
            <div className="font-mono text-sm font-semibold tabular-nums text-[#f5f5f5]">
              {totalResistances[key]}
            </div>
          </div>
        ))}
      </div>

      <div className={`${sheetStatCell} px-2.5 py-1.5 font-mono text-[10px] text-[#adb5bd]`}>
        <span className="uppercase tracking-wide text-ecoar-teal">Origem: </span>
        {origins.join(' + ') || 'Sem bônus de origem'}
      </div>
    </div>
  )
}

export default ResistancesWidget
