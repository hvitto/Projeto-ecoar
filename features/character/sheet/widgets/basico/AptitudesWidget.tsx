'use client'

import { aptitudes as aptitudesDefinitions } from '@/data/aptitudes'
import {
  getAptitudeDice,
  getAptitudeModifier,
  formatModifier,
} from '@/lib/calculations'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import {
  sheetFieldCompact,
  sheetLabel,
  sheetMeta,
  sheetSkillRoll,
  sheetStatCell,
} from '@/features/character/sheet/sheetChrome'
import { useDiceRoll } from '@/features/dice/DiceRollProvider'

export function AptitudesWidget() {
  const {
    characterData,
    setCharacterData,
    isEditing,
    coerceInt,
    tableId,
    characterId,
  } = useSheetRuntime()
  const { roll } = useDiceRoll()

  const characterName = characterData.nome?.trim() || 'Sem nome'

  return (
    <div className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-4 sm:gap-1.5 sm:p-3">
      {aptitudesDefinitions.map((apt) => {
        const level = coerceInt(characterData.aptitudes?.[apt.id], 0)
        const mod = getAptitudeModifier(level)
        const expression = getAptitudeDice(level)
        return (
          <div
            key={apt.id}
            className={`${sheetStatCell} flex min-w-0 items-center gap-1 px-1.5 py-1 sm:gap-1.5`}
          >
            <div className={`${sheetLabel} mb-0 min-w-0 flex-1 truncate`}>{apt.name}</div>
            {isEditing ? (
              <input
                type="number"
                min={0}
                max={8}
                value={level}
                aria-label={`${apt.name} nível`}
                onChange={(e) => {
                  const next = Math.max(0, Math.min(8, coerceInt(e.target.value, 0)))
                  setCharacterData((prev) => ({
                    ...prev,
                    aptitudes: { ...(prev.aptitudes ?? {}), [apt.id]: next },
                  }))
                }}
                className={`${sheetFieldCompact} h-7 w-8 shrink-0 text-xs font-semibold sm:w-9 sm:text-sm`}
              />
            ) : (
              <div
                className="w-5 shrink-0 text-center font-mono text-sm font-semibold tabular-nums leading-none text-[#f5f5f5] sm:w-6"
                aria-label={`${apt.name} nível ${level}`}
              >
                {level}
              </div>
            )}
            <div
              className={`${sheetMeta} w-7 shrink-0 text-center text-ecoar-teal/85 sm:w-8`}
              aria-label={`Modificador ${formatModifier(mod)}`}
            >
              {formatModifier(mod)}
            </div>
            {isEditing ? (
              <span
                className="w-[2.75rem] shrink-0 text-center font-mono text-[10px] font-semibold tabular-nums text-[#adb5bd] opacity-55 sm:w-[3.25rem]"
                title="Rolagem disponível fora do modo edição"
                aria-disabled="true"
              >
                {expression}
              </span>
            ) : (
              <button
                type="button"
                title={`Rolar ${apt.name}`}
                aria-label={`Rolar ${apt.name}: ${expression}`}
                onClick={() =>
                  void roll({
                    label: `${characterName} · ${apt.name}`,
                    expression,
                    tableId,
                    characterId,
                    characterName,
                  })
                }
                className={`${sheetSkillRoll} w-[2.75rem] shrink-0 px-1 sm:w-[3.25rem]`}
              >
                {expression}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default AptitudesWidget
