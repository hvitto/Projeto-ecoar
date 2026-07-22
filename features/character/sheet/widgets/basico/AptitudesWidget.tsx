'use client'

import { aptitudes as aptitudesDefinitions } from '@/data/aptitudes'
import { getAptitudeDice, getAptitudeModifier, formatModifier } from '@/lib/calculations'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetFieldCompact } from '@/features/character/sheet/sheetChrome'

export function AptitudesWidget() {
  const { characterData, setCharacterData, isEditing, coerceInt } = useSheetRuntime()

  return (
    <div className="grid h-full w-full grid-cols-1 gap-x-3 gap-y-1.5 p-2.5 sm:grid-cols-2 sm:p-3">
      <div className="col-span-full mb-0.5 grid grid-cols-12 gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/50 sm:hidden">
        <div className="col-span-4">Aptidão</div>
        <div className="col-span-2 text-center">Nv</div>
        <div className="col-span-2 text-center">Mod</div>
        <div className="col-span-4 text-center">Dado</div>
      </div>
      {aptitudesDefinitions.map((apt) => {
        const level = coerceInt(characterData.aptitudes?.[apt.id], 0)
        const mod = getAptitudeModifier(level)
        return (
          <div
            key={apt.id}
            className="grid h-full min-h-[2.75rem] grid-cols-12 items-center justify-items-center gap-1.5 rounded-sm border border-slate-200/70 bg-slate-50/50 px-2 py-1.5 dark:border-ecoar-light-900/12 dark:bg-ecoar-dark-900/20"
          >
            <div className="col-span-4 w-full truncate text-center text-xs font-medium text-slate-800 dark:text-ecoar-light-900/90">
              {apt.name}
            </div>
            <div className="col-span-2 flex w-full justify-center">
              <input
                type="number"
                min={0}
                max={8}
                value={level}
                disabled={!isEditing}
                onChange={(e) => {
                  const next = Math.max(0, Math.min(8, coerceInt(e.target.value, 0)))
                  setCharacterData((prev) => ({
                    ...prev,
                    aptitudes: { ...(prev.aptitudes ?? {}), [apt.id]: next },
                  }))
                }}
                className={`${sheetFieldCompact} mx-auto max-w-[3rem]`}
              />
            </div>
            <div className="col-span-2 text-center text-xs font-semibold tabular-nums text-ecoar-teal-600 dark:text-ecoar-teal-400">
              {formatModifier(mod)}
            </div>
            <div className="col-span-4 text-center text-xs font-semibold tabular-nums text-slate-800 dark:text-ecoar-light-900/90">
              {getAptitudeDice(level)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AptitudesWidget
