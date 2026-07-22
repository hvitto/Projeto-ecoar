'use client'

import { getAttributeModifier, formatModifier } from '@/lib/calculations'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetFieldCompact, sheetLabel } from '@/features/character/sheet/sheetChrome'

export function AttributesWidget() {
  const { characterData, updateField, isEditing, attributes, effectiveAttributesByKey } =
    useSheetRuntime()

  return (
    <div className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-4 sm:p-3 xl:grid-cols-7">
      {attributes.map((attr) => {
        const Icon = attr.icon
        const attrData = characterData[attr.key as keyof typeof characterData] as {
          nivel: number
          mod: number
        }
        const nivel =
          typeof attrData.nivel === 'string' ? parseInt(attrData.nivel) || 0 : attrData.nivel
        const eff = effectiveAttributesByKey[attr.key]

        return (
          <div
            key={attr.key}
            className="min-w-0 rounded-sm border border-slate-200/80 bg-slate-50/70 px-2 py-2 dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/25"
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 shrink-0 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
              <span className={`${sheetLabel} mb-0 truncate`}>{attr.label}</span>
            </div>
            <input
              type="number"
              min="0"
              max="8"
              value={nivel}
              disabled={!isEditing}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0
                updateField(`${attr.key}.nivel`, val)
                updateField(`${attr.key}.mod`, getAttributeModifier(val))
              }}
              className={sheetFieldCompact}
            />
            <div className="mt-1 text-center">
              <span className="text-xs font-semibold tabular-nums text-ecoar-teal-600 dark:text-ecoar-teal-400">
                {formatModifier(eff?.effectiveMod ?? 0)}
              </span>
              {(eff?.singularityBonus ?? 0) !== 0 && (
                <div className="text-[9px] leading-tight text-slate-500 dark:text-ecoar-light-900/55">
                  sing. {formatModifier(eff.singularityBonus)}
                </div>
              )}
              {(eff?.bookDisadvantageBonus ?? 0) !== 0 && (
                <div className="text-[9px] leading-tight text-slate-500 dark:text-ecoar-light-900/55">
                  livro {formatModifier(eff.bookDisadvantageBonus)}
                </div>
              )}
              {(eff?.equipmentBonus ?? 0) !== 0 && (
                <div className="text-[9px] leading-tight text-slate-500 dark:text-ecoar-light-900/55">
                  equip. {formatModifier(eff.equipmentBonus)}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AttributesWidget
