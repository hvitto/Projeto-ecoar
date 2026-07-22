'use client'

import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetLabel } from '@/features/character/sheet/sheetChrome'

const limitInput =
  'h-7 w-12 shrink-0 rounded-sm border border-slate-300/80 bg-white px-1 text-center text-xs font-semibold tabular-nums text-slate-900 outline-none focus:border-ecoar-teal-500 disabled:opacity-55 dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-700 dark:text-ecoar-light-900 dark:focus:border-ecoar-teal-400 [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none'

export function LimitsWidget() {
  const {
    characterData,
    updateField,
    isEditing,
    canEditSheet,
    derivedValues,
    markLimitsUserTriggered,
  } = useSheetRuntime()

  const limits = [
    { key: 'corpo', label: 'Corpo', max: derivedValues.corpoMax },
    { key: 'mente', label: 'Mente', max: derivedValues.menteMax },
    { key: 'folego', label: 'Fôlego', max: derivedValues.folegoMax },
    { key: 'mana', label: 'Mana', max: derivedValues.manaMax },
  ] as const

  return (
    <div className="grid h-full w-full grid-cols-2 gap-1.5 p-2 sm:grid-cols-4 sm:grid-rows-1">
      {limits.map((limit) => {
        const current = characterData[limit.key] as { atual: number; max: number }
        return (
          <div
            key={limit.key}
            className="flex h-full min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-sm border border-slate-200/80 bg-slate-50/70 px-1.5 py-1.5 text-center dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/25"
          >
            <div className={`${sheetLabel} mb-0 w-full truncate text-center`}>{limit.label}</div>
            <div className="flex w-full items-center justify-center gap-1">
              <input
                type="number"
                inputMode="numeric"
                value={current.atual}
                disabled={!canEditSheet}
                onChange={(e) => {
                  if (!isEditing) markLimitsUserTriggered()
                  updateField(`${limit.key}.atual`, parseInt(e.target.value) || 0)
                }}
                className={limitInput}
              />
              <span className="shrink-0 text-[11px] leading-none text-slate-500 dark:text-ecoar-light-900/45">
                /
              </span>
              <span className="text-xs font-semibold tabular-nums leading-none text-slate-800 dark:text-ecoar-light-900/90">
                {limit.max}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default LimitsWidget
