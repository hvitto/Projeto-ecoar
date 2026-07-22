'use client'

import {
  ARMOR_RESISTANCE_KEYS,
  DAMAGE_TYPE_LABELS_PT,
  type ArmorResistanceKey,
} from '@/shared/types/equipment'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetLabel } from '@/features/character/sheet/sheetChrome'

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
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-ecoar-light-900/55">
        <span className="truncate">
          {equippedMainArmorEntries.length > 0
            ? `Armaduras: ${equippedMainArmorEntries.map((e) => e.name).join(', ')}`
            : 'Sem armadura equipada'}
        </span>
        <span className="shrink-0 tabular-nums">
          Crít. {totalArmorStats.crit}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
        {ARMOR_RESISTANCE_KEYS.map((key: ArmorResistanceKey) => (
          <div
            key={key}
            className="min-w-0 rounded-sm border border-slate-200/80 bg-slate-50/60 px-1.5 py-1.5 text-center dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/25"
          >
            <div className={`${sheetLabel} mb-0.5 truncate`} title={DAMAGE_TYPE_LABELS_PT[key]}>
              {DAMAGE_TYPE_LABELS_PT[key]}
            </div>
            <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-ecoar-light-900">
              {totalResistances[key]}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-sm border border-slate-200/80 bg-slate-50/50 px-2.5 py-1.5 text-[10px] text-slate-600 dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/20 dark:text-ecoar-light-900/70">
        <span className="font-semibold uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/50">
          Origem:{' '}
        </span>
        {origins.join(' + ') || '—'}
      </div>
    </div>
  )
}

export default ResistancesWidget
