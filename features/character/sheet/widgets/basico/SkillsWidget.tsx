'use client'

import { Fragment, useEffect, useState } from 'react'
import { getSkillDice, formatModifier, formatDiceWithModifier } from '@/lib/calculations'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import {
  sheetBtnGhost,
  sheetChipActive,
  sheetChipIdle,
  sheetField,
  sheetFieldCompact,
  sheetSkillRoll,
  sheetTableHead,
  sheetTableRow,
} from '@/features/character/sheet/sheetChrome'
import { useDiceRoll } from '@/features/dice/DiceRollProvider'

const DEFAULT_CATEGORY = 'combate'

export function SkillsWidget() {
  const {
    characterData,
    setCharacterData,
    isEditing,
    activeSkillCategory,
    setActiveSkillCategory,
    skillCategoryKeys,
    categoryLabels,
    skillsByCategory,
    coerceInt,
    singularityBonuses,
    equipmentMechanicalBonuses,
    bookDisadvantageBonuses,
    tableId,
    characterId,
  } = useSheetRuntime()
  const { roll } = useDiceRoll()

  const [showMoreCategories, setShowMoreCategories] = useState(false)

  useEffect(() => {
    if (
      activeSkillCategory !== 'all' &&
      activeSkillCategory !== DEFAULT_CATEGORY
    ) {
      setShowMoreCategories(true)
    }
  }, [activeSkillCategory])

  const eqSkills =
    (equipmentMechanicalBonuses as { skills?: Record<string, number> }).skills ?? {}
  const bookSkills =
    (bookDisadvantageBonuses as { skills?: Record<string, number> }).skills ?? {}

  const otherCategories = skillCategoryKeys.filter((cat) => cat !== DEFAULT_CATEGORY)

  const categoriesToShow =
    activeSkillCategory === 'all' ? skillCategoryKeys : [activeSkillCategory]

  const characterName = characterData.nome?.trim() || 'Sem nome'

  return (
    <div className="overflow-hidden">
      <div className="border-b border-ecoar-teal/30 px-2.5 py-2 sm:px-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveSkillCategory(DEFAULT_CATEGORY)
              setShowMoreCategories(false)
            }}
            className={`shrink-0 whitespace-nowrap ${
              activeSkillCategory === DEFAULT_CATEGORY ? sheetChipActive : sheetChipIdle
            }`}
          >
            {categoryLabels[DEFAULT_CATEGORY] ?? 'Combate'}
          </button>

          {!showMoreCategories ? (
            <button
              type="button"
              onClick={() => setShowMoreCategories(true)}
              className={`${sheetBtnGhost} !min-h-8 !px-2.5`}
            >
              Mais categorias
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveSkillCategory('all')}
                className={`shrink-0 whitespace-nowrap ${
                  activeSkillCategory === 'all' ? sheetChipActive : sheetChipIdle
                }`}
              >
                Todas
              </button>
              {otherCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveSkillCategory(cat)}
                  className={`shrink-0 whitespace-nowrap ${
                    activeSkillCategory === cat ? sheetChipActive : sheetChipIdle
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setShowMoreCategories(false)
                  setActiveSkillCategory(DEFAULT_CATEGORY)
                }}
                className={`${sheetBtnGhost} !min-h-8 !px-2.5`}
              >
                Menos
              </button>
            </>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full font-mono text-[11px]">
          <thead className="bg-[#0a0a0a]/80">
            <tr className="border-b border-ecoar-teal/25">
              <th className={`${sheetTableHead} px-2 py-1 text-left`}>Habilidade</th>
              <th className={`${sheetTableHead} w-[52px] px-1 py-1 text-center`}>Nv</th>
              <th className={`${sheetTableHead} w-[72px] px-1 py-1 text-center`}>Dado</th>
              <th className={`${sheetTableHead} px-2 py-1 text-left`}>Especialidade</th>
              <th className={`${sheetTableHead} w-[48px] px-1 py-1 text-center`}>Bônus</th>
            </tr>
          </thead>
          <tbody>
            {categoriesToShow.map((cat) => {
              const list = skillsByCategory.get(cat) ?? []
              if (list.length === 0) return null
              return (
                <Fragment key={cat}>
                  {activeSkillCategory === 'all' ? (
                    <tr className="bg-ecoar-teal/5">
                      <td
                        colSpan={5}
                        className="px-2 py-0.5 font-mono text-[9px] font-normal uppercase tracking-wider text-ecoar-teal"
                      >
                        {categoryLabels[cat]}
                      </td>
                    </tr>
                  ) : null}
                  {list.map((skill) => {
                    const skillState = characterData.skills?.[skill.id]
                    const level = coerceInt(skillState?.level, 0)
                    const dice = getSkillDice(level)
                    const specId = skillState?.specialization ?? ''
                    const skillSingBonus =
                      (singularityBonuses.skills[skill.id] ?? 0) +
                      (eqSkills[skill.id] ?? 0) +
                      (bookSkills[skill.id] ?? 0)
                    const expression = formatDiceWithModifier(dice, skillSingBonus)
                    return (
                      <tr key={skill.id} className={sheetTableRow}>
                        <td className="whitespace-nowrap px-2 py-1 text-[#f5f5f5]">
                          {skill.name}
                        </td>
                        <td className="px-1 py-1 text-center">
                          <input
                            type="number"
                            min={0}
                            max={8}
                            disabled={!isEditing}
                            value={level}
                            onChange={(e) => {
                              const next = Math.max(0, Math.min(8, coerceInt(e.target.value, 0)))
                              setCharacterData((prev) => ({
                                ...prev,
                                skills: {
                                  ...(prev.skills ?? {}),
                                  [skill.id]: { ...(prev.skills?.[skill.id] ?? {}), level: next },
                                },
                              }))
                            }}
                            className={`${sheetFieldCompact} mx-auto w-[48px]`}
                          />
                        </td>
                        <td className="px-1 py-1 text-center">
                          {isEditing ? (
                            <span
                              className="inline-block font-semibold tabular-nums text-[#adb5bd] opacity-55"
                              title="Rolagem disponível fora do modo edição"
                              aria-disabled="true"
                            >
                              {expression}
                            </span>
                          ) : (
                            <button
                              type="button"
                              title={`Rolar ${skill.name}`}
                              aria-label={`Rolar ${skill.name}: ${expression}`}
                              onClick={() =>
                                void roll({
                                  label: `${characterName} · ${skill.name}`,
                                  expression,
                                  tableId,
                                  characterId,
                                  characterName,
                                })
                              }
                              className={sheetSkillRoll}
                            >
                              {expression}
                            </button>
                          )}
                        </td>
                        <td className="px-2 py-1">
                          <select
                            disabled={!isEditing}
                            value={specId}
                            onChange={(e) => {
                              const nextSpec = e.target.value
                              setCharacterData((prev) => ({
                                ...prev,
                                skills: {
                                  ...(prev.skills ?? {}),
                                  [skill.id]: {
                                    ...(prev.skills?.[skill.id] ?? { level: 0 }),
                                    specialization: nextSpec || undefined,
                                  },
                                },
                              }))
                            }}
                            className={`${sheetField} h-7 text-[11px]`}
                          >
                            <option value="">—</option>
                            {skill.specializations.map((sp) => (
                              <option key={sp.id} value={sp.id}>
                                {sp.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-1 text-center font-semibold tabular-nums text-ecoar-teal">
                          {skillSingBonus === 0 ? '—' : formatModifier(skillSingBonus)}
                        </td>
                      </tr>
                    )
                  })}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SkillsWidget
