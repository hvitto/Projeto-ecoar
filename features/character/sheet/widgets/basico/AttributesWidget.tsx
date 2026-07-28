'use client'

import { getAttributeModifier, formatModifier } from '@/lib/calculations'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import {
  sheetFieldCompact,
  sheetLabel,
  sheetMeta,
  sheetStatCell,
} from '@/features/character/sheet/sheetChrome'

export function AttributesWidget() {
  const { characterData, updateField, isEditing, attributes, effectiveAttributesByKey } =
    useSheetRuntime()

  const hasOriginBonus = attributes.some((attr) => {
    const eff = effectiveAttributesByKey[attr.key]
    if (!eff) return false
    return (
      eff.singularityBonus !== 0 ||
      eff.bookDisadvantageBonus !== 0 ||
      eff.equipmentBonus !== 0
    )
  })

  return (
    <div className="grid grid-cols-4 gap-1 p-2 sm:grid-cols-7 sm:gap-1.5 sm:p-3">
      {attributes.map((attr) => {
        const attrData = characterData[attr.key as keyof typeof characterData] as {
          nivel: number
          mod: number
        }
        const nivel =
          typeof attrData.nivel === 'string' ? parseInt(attrData.nivel) || 0 : attrData.nivel
        const eff = effectiveAttributesByKey[attr.key]
        const bonusLines: { short: string; full: string }[] = []
        if ((eff?.singularityBonus ?? 0) !== 0) {
          const m = formatModifier(eff!.singularityBonus)
          bonusLines.push({ short: `Sing ${m}`, full: `Singularidade ${m}` })
        }
        if ((eff?.bookDisadvantageBonus ?? 0) !== 0) {
          const m = formatModifier(eff!.bookDisadvantageBonus)
          bonusLines.push({ short: `Livro ${m}`, full: `Livro ${m}` })
        }
        if ((eff?.equipmentBonus ?? 0) !== 0) {
          const m = formatModifier(eff!.equipmentBonus)
          bonusLines.push({ short: `Equip ${m}`, full: `Equipamento ${m}` })
        }

        return (
          <div
            key={attr.key}
            className={`${sheetStatCell} min-w-0 px-1 py-1.5 text-center sm:px-1.5`}
          >
            <div
              className={`${sheetLabel} mb-0.5 truncate !text-[8px] tracking-[0.1em] sm:!text-[9px] sm:tracking-[0.14em]`}
              title={attr.label}
            >
              {attr.label}
            </div>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="8"
                value={nivel}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(8, parseInt(e.target.value) || 0))
                  updateField(`${attr.key}.nivel`, val)
                  updateField(`${attr.key}.mod`, getAttributeModifier(val))
                }}
                className={`${sheetFieldCompact} mx-auto h-7 text-xs font-semibold sm:h-8 sm:text-sm`}
                aria-label={`${attr.label} nível`}
              />
            ) : (
              <div
                className="font-mono text-sm font-semibold tabular-nums leading-none text-[#f5f5f5] sm:text-lg"
                aria-label={`${attr.label} nível ${nivel}`}
              >
                {nivel}
              </div>
            )}
            <div
              className={`${sheetMeta} mt-1 text-ecoar-teal/85`}
              aria-label={`Modificador ${formatModifier(eff?.effectiveMod ?? 0)}`}
            >
              {formatModifier(eff?.effectiveMod ?? 0)}
            </div>
            {bonusLines.length > 0 ? (
              <ul className="mt-0.5 flex list-none flex-col gap-0.5 p-0">
                {bonusLines.map((line) => (
                  <li
                    key={line.full}
                    className={`${sheetMeta} truncate leading-tight opacity-80`}
                    title={line.full}
                    aria-label={line.full}
                  >
                    {line.short}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )
      })}
      {hasOriginBonus ? (
        <p className={`col-span-full ${sheetMeta} normal-case tracking-[0.06em]`}>
          Sing = Singularidade · Livro · Equip = Equipamento — origem do bônus no modificador.
        </p>
      ) : null}
    </div>
  )
}

export default AttributesWidget
