'use client'

import { Fragment } from 'react'
import { getSkillDice, formatModifier } from '@/lib/calculations'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetChip, sheetFieldCompact, sheetField } from '@/features/character/sheet/sheetChrome'

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
  } = useSheetRuntime()

  const eqSkills =
    (equipmentMechanicalBonuses as { skills?: Record<string, number> }).skills ?? {}
  const bookSkills =
    (bookDisadvantageBonuses as { skills?: Record<string, number> }).skills ?? {}

  const categoriesToShow =
    activeSkillCategory === 'all' ? skillCategoryKeys : [activeSkillCategory]

  const chipActive =
    'border-ecoar-teal-500/35 bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300'
  const chipIdle =
    'border-slate-300/80 bg-white text-slate-700 dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-800/40 dark:text-ecoar-light-900/80'

  return (
    <div className="overflow-hidden">
      <div className="border-b border-slate-200 px-2.5 py-2 dark:border-ecoar-light-900/15 sm:px-3">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setActiveSkillCategory('all')}
            className={`${sheetChip} shrink-0 whitespace-nowrap ${
              activeSkillCategory === 'all' ? chipActive : chipIdle
            }`}
          >
            Todas
          </button>
          {skillCategoryKeys.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveSkillCategory(cat)}
              className={`${sheetChip} shrink-0 whitespace-nowrap ${
                activeSkillCategory === cat ? chipActive : chipIdle
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-[11px]">
          <thead className="bg-slate-50/80 dark:bg-ecoar-dark-800/50">
            <tr className="border-b border-slate-200 dark:border-ecoar-light-900/15">
              <th className="px-2 py-1 text-left font-semibold text-slate-600 dark:text-ecoar-light-900/70">
                Habilidade
              </th>
              <th className="w-[52px] px-1 py-1 text-center font-semibold text-slate-600 dark:text-ecoar-light-900/70">
                Nv
              </th>
              <th className="w-[64px] px-1 py-1 text-center font-semibold text-slate-600 dark:text-ecoar-light-900/70">
                Dado
              </th>
              <th className="px-2 py-1 text-left font-semibold text-slate-600 dark:text-ecoar-light-900/70">
                Especialidade
              </th>
              <th className="w-[48px] px-1 py-1 text-center font-semibold text-slate-600 dark:text-ecoar-light-900/70">
                Bônus
              </th>
            </tr>
          </thead>
          <tbody>
            {categoriesToShow.map((cat) => {
              const list = skillsByCategory.get(cat) ?? []
              if (list.length === 0) return null
              return (
                <Fragment key={cat}>
                  <tr className="bg-slate-100/60 dark:bg-ecoar-light-900/10">
                    <td
                      colSpan={5}
                      className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600 dark:text-ecoar-light-900/70"
                    >
                      {categoryLabels[cat]}
                    </td>
                  </tr>
                  {list.map((skill) => {
                    const skillState = characterData.skills?.[skill.id]
                    const level = coerceInt(skillState?.level, 0)
                    const dice = getSkillDice(level)
                    const specId = skillState?.specialization ?? ''
                    const skillSingBonus =
                      (singularityBonuses.skills[skill.id] ?? 0) +
                      (eqSkills[skill.id] ?? 0) +
                      (bookSkills[skill.id] ?? 0)
                    return (
                      <tr
                        key={skill.id}
                        className="border-b border-slate-200/80 dark:border-ecoar-light-900/10 last:border-b-0"
                      >
                        <td className="whitespace-nowrap px-2 py-1 text-slate-900 dark:text-ecoar-light-900/90">
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
                        <td className="px-1 py-1 text-center font-semibold tabular-nums text-slate-800 dark:text-ecoar-light-900/85">
                          {dice}
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
                        <td className="px-1 py-1 text-center font-semibold tabular-nums text-ecoar-teal-600 dark:text-ecoar-teal-400">
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
