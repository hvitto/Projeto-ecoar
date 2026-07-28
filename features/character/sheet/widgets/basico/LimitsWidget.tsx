'use client'

import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetLabel, sheetLimitInput, sheetStatCell } from '@/features/character/sheet/sheetChrome'

export function LimitsWidget() {
  const {
    characterData,
    updateField,
    isEditing,
    canMutateMesa,
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
    <div className="grid h-full w-full grid-cols-2 gap-1.5 p-2.5 sm:grid-cols-4 sm:grid-rows-1 sm:p-3">
      {limits.map((limit) => {
        const current = characterData[limit.key] as { atual: number; max: number }
        return (
          <div
            key={limit.key}
            className={`${sheetStatCell} flex h-full min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1.5 py-1.5 text-center`}
          >
            <div className={`${sheetLabel} mb-0 w-full truncate text-center`}>{limit.label}</div>
            <div className="flex w-full items-center justify-center gap-1">
              <input
                type="number"
                inputMode="numeric"
                value={current.atual}
                disabled={!canMutateMesa}
                min={0}
                max={limit.max}
                aria-label={`${limit.label} atual`}
                onChange={(e) => {
                  if (!isEditing) markLimitsUserTriggered()
                  const raw = parseInt(e.target.value, 10)
                  const next = Number.isFinite(raw)
                    ? Math.max(0, Math.min(limit.max, raw))
                    : 0
                  updateField(`${limit.key}.atual`, next)
                }}
                className={sheetLimitInput}
              />
              <span className="shrink-0 text-[11px] leading-none text-[#adb5bd]">/</span>
              <span className="font-mono text-xs font-semibold tabular-nums leading-none text-[#f5f5f5]">
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
