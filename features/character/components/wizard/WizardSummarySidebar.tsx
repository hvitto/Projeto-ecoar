'use client'

import { memo } from 'react'
import SummaryItem from '@/shared/components/ui/SummaryItem'
import { getRaceById } from '@/data/races'
import { getPathById } from '@/data/paths'
import { getMartialSchoolById } from '@/data/martialSchools'
import { getMartialSchoolDataByIdResolved } from '@/data/martialSchoolSingularities'
import { getSkillById } from '@/data/skills'
import { getAptitudeById } from '@/data/aptitudes'
import { getDisadvantageById } from '@/data/disadvantages'
import { getSingularityById } from '@/data/singularities'
import { getAttributeModifier, formatModifier, type CharacterLimits } from '@/lib/calculations'
import {
  CHARACTER_ATTRIBUTE_KEYS,
  type EffectiveAttributeRow,
} from '@/lib/characterBonuses'
import type { WizardAttributes, WizardPontosCriacao } from '@/features/character/wizard/wizardFormTypes'
import CoordLabel from '@/components/beyond/CoordLabel'

export type WizardSummarySidebarProps = {
  selectedRaca: string
  selectedEscolaMarcial: string
  selectedTrilha: string
  attributes: WizardAttributes
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
  selectedDisadvantages: string[]
  singularidades: string[]
  pontosCriacao: WizardPontosCriacao
  mergedEquipamentosLista: string[]
  mergedArmasLista: string[]
  effectiveAttributesCreation: Record<string, EffectiveAttributeRow>
  singularityBonusesCreation: {
    skills: Record<string, number>
    corpo: number
    mente: number
    folego: number
    mana: number
  }
  bookDisadvantageCreation: { skills: Record<string, number> }
  signedSingularityEffects: {
    bonusAttributes: Record<string, number>
    penaltyAttributes: Record<string, number>
    bonusSkills: Record<string, number>
    penaltySkills: Record<string, number>
  }
  creationLimits: CharacterLimits
}

const sectionHeading = 'text-[9px] uppercase tracking-[0.16em] text-ecoar-teal mb-2'
const sectionBlock = 'pt-3 mt-3 border-t border-ecoar-teal/30 first:mt-0 first:pt-0 first:border-t-0'
const attrShort: Record<string, string> = {
  carisma: 'Car',
  finesse: 'Fin',
  forca: 'For',
  inteligencia: 'Int',
  percepcao: 'Per',
  vitalidade: 'Vit',
  vontade: 'Von',
}

function WizardSummarySidebar({
  selectedRaca,
  selectedEscolaMarcial,
  selectedTrilha,
  attributes,
  skills,
  aptitudes,
  selectedDisadvantages,
  singularidades,
  pontosCriacao,
  mergedEquipamentosLista,
  mergedArmasLista,
  effectiveAttributesCreation,
  singularityBonusesCreation,
  bookDisadvantageCreation,
  signedSingularityEffects,
  creationLimits,
}: WizardSummarySidebarProps) {
  return (
    <aside className="flex flex-col w-full lg:w-72 flex-shrink-0 p-3 lg:p-0 min-h-0 lg:h-full overflow-y-auto overflow-x-hidden">
      <div className="bg-transparent lg:bg-[#0a0a0a]/70 lg:border-l border-ecoar-teal/50 dark:border-ecoar-teal rounded-none flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="hidden lg:block px-4 pt-4 pb-3 border-b border-ecoar-teal/40 dark:border-ecoar-teal/50 shrink-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-ecoar-teal">FICHA // RESUMO</p>
          <CoordLabel refId="SUM-LIVE" className="mt-2" />
        </div>

        <div className="space-y-0 text-[11px] flex-1 min-h-0 overflow-y-auto px-4 py-3 custom-scrollbar">
          {selectedRaca ? (
            <div className={sectionBlock}>
              <div className={sectionHeading}>Raça</div>
              <div className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 mb-2">
                {getRaceById(selectedRaca)?.name || '—'}
              </div>
              {(() => {
                const race = getRaceById(selectedRaca)
                if (!race?.bonuses) return null
                return (
                  <div className="space-y-1.5 text-[10px] uppercase tracking-[0.08em] text-ecoar-dark-500 dark:text-[#adb5bd]">
                    {race.bonuses.movement ? (
                      <p>
                        {race.bonuses.movement.terrestre ? `Terrestre ${race.bonuses.movement.terrestre}m` : ''}
                        {race.bonuses.movement.aquatico ? ` · Aquático ${race.bonuses.movement.aquatico}m` : ''}
                        {race.bonuses.movement.aereo ? ` · Aéreo ${race.bonuses.movement.aereo}m` : ''}
                      </p>
                    ) : null}
                    {race.bonuses.senses ? (
                      <p>
                        {race.bonuses.senses.visao !== undefined ? `Visão ${race.bonuses.senses.visao}m` : ''}
                        {race.bonuses.senses.audicao !== undefined
                          ? ` · Audição ${race.bonuses.senses.audicao}m`
                          : ''}
                        {race.bonuses.senses.olfato !== undefined
                          ? ` · Olfato ${race.bonuses.senses.olfato}m`
                          : ''}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {race.bonuses.attributes &&
                        Object.entries(race.bonuses.attributes).map(([attr, value]) => (
                          <span
                            key={attr}
                            className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-ecoar-teal/40 text-ecoar-teal"
                          >
                            {attrShort[attr] || attr}+{value}
                          </span>
                        ))}
                      {race.bonuses.sizeModifier !== undefined && race.bonuses.sizeModifier !== 0 ? (
                        <span className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-ecoar-magenta/50 text-ecoar-magenta">
                          For{race.bonuses.sizeModifier > 0 ? '+' : ''}
                          {race.bonuses.sizeModifier} (Tam)
                        </span>
                      ) : null}
                      {race.bonuses.weightModifier !== undefined && race.bonuses.weightModifier !== 0 ? (
                        <span className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-ecoar-magenta/50 text-ecoar-magenta">
                          Vit{race.bonuses.weightModifier > 0 ? '+' : ''}
                          {race.bonuses.weightModifier} (Peso)
                        </span>
                      ) : null}
                      {((race.bonuses.sizeModifier !== undefined && race.bonuses.sizeModifier !== 0) ||
                        (race.bonuses.weightModifier !== undefined && race.bonuses.weightModifier !== 0)) && (
                        <span className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-ecoar-magenta/50 text-ecoar-magenta">
                          Esq
                          {(() => {
                            const penalty = -((race.bonuses.sizeModifier ?? 0) + (race.bonuses.weightModifier ?? 0))
                            return penalty > 0 ? `+${penalty}` : `${penalty}`
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : null}

          {selectedEscolaMarcial ? (
            <div className={sectionBlock}>
              <div className={sectionHeading}>Escola Marcial</div>
              <div className="text-ecoar-dark-900 dark:text-ecoar-light-900">
                {getMartialSchoolDataByIdResolved(selectedEscolaMarcial)?.name ||
                  getMartialSchoolById(selectedEscolaMarcial)?.name ||
                  '—'}
              </div>
            </div>
          ) : null}

          {selectedTrilha ? (
            <div className={sectionBlock}>
              <div className={sectionHeading}>Trilha</div>
              <div className="text-ecoar-dark-900 dark:text-ecoar-light-900">
                {getPathById(selectedTrilha)?.name || '—'}
              </div>
            </div>
          ) : null}

          {Object.keys(attributes).length > 0 &&
            CHARACTER_ATTRIBUTE_KEYS.some(
              (k) =>
                (attributes[k as keyof typeof attributes] ?? 0) > 0 ||
                (effectiveAttributesCreation[k]?.singularityBonus ?? 0) !== 0 ||
                (effectiveAttributesCreation[k]?.bookDisadvantageBonus ?? 0) !== 0,
            ) && (
              <div className={sectionBlock}>
                <div className={sectionHeading}>Atributos</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CHARACTER_ATTRIBUTE_KEYS.map((attr) => {
                    const value = attributes[attr as keyof typeof attributes] ?? 0
                    const eff = effectiveAttributesCreation[attr]
                    if (
                      value === 0 &&
                      (eff?.singularityBonus ?? 0) === 0 &&
                      (eff?.bookDisadvantageBonus ?? 0) === 0
                    )
                      return null
                    const storedMod = getAttributeModifier(value)
                    return (
                      <SummaryItem
                        key={attr}
                        label={attrShort[attr]}
                        value={
                          <div className="flex flex-col items-end gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">
                                {value}
                              </span>
                              <span className="text-ecoar-teal">({formatModifier(storedMod)})</span>
                            </div>
                            {((eff?.singularityBonus ?? 0) !== 0 ||
                              (eff?.bookDisadvantageBonus ?? 0) !== 0) && (
                              <span className="text-[9px] text-ecoar-teal text-right">
                                Efetivo {eff.effectiveLevel} {formatModifier(eff.effectiveMod)}
                              </span>
                            )}
                          </div>
                        }
                      />
                    )
                  })}
                </div>
              </div>
            )}

          <div className={sectionBlock}>
            <div className={sectionHeading}>Limites</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'corpo', label: 'Corpo', max: creationLimits.corpoMax },
                { key: 'mente', label: 'Mente', max: creationLimits.menteMax },
                { key: 'folego', label: 'Fôlego', max: creationLimits.folegoMax },
                { key: 'mana', label: 'Mana', max: creationLimits.manaMax },
              ].map((limit) => (
                <div
                  key={limit.key}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 border border-ecoar-teal/35"
                >
                  <span className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal">{limit.label}</span>
                  <span className="font-display text-base leading-none text-ecoar-dark-900 dark:text-ecoar-light-900">
                    {limit.max}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {Object.keys(skills).length > 0 ? (
            <div className={sectionBlock}>
              <div className={sectionHeading}>Habilidades</div>
              <div className="space-y-1">
                {Object.entries(skills)
                  .filter(([, skill]) => skill.level > 0)
                  .slice(0, 5)
                  .map(([skillId, skill]) => {
                    const skillData = getSkillById(skillId)
                    if (!skillData) return null
                    const skBonus =
                      (singularityBonusesCreation.skills[skillId] ?? 0) +
                      (bookDisadvantageCreation.skills[skillId] ?? 0)
                    return (
                      <SummaryItem
                        key={skillId}
                        label={skillData.name}
                        value={
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            <span className="font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">
                              Nv.{skill.level}
                            </span>
                            {skBonus !== 0 ? (
                              <span className="text-[9px] px-1 py-0.5 border border-ecoar-teal/40 text-ecoar-teal">
                                {formatModifier(skBonus)}
                              </span>
                            ) : null}
                            {skill.specialization ? (
                              <span className="text-ecoar-magenta text-[9px] uppercase tracking-[0.1em]">Esp</span>
                            ) : null}
                          </div>
                        }
                        className="text-xs"
                      />
                    )
                  })}
                {Object.keys(skills).filter((id) => skills[id].level > 0).length > 5 ? (
                  <div className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal text-center pt-1">
                    +{Object.keys(skills).filter((id) => skills[id].level > 0).length - 5} mais
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {Object.keys(aptitudes).length > 0 && Object.values(aptitudes).some((v) => v > 0) ? (
            <div className={sectionBlock}>
              <div className={sectionHeading}>Aptidões</div>
              <div className="space-y-1">
                {Object.entries(aptitudes)
                  .filter(([, level]) => level > 0)
                  .map(([aptId, level]) => {
                    const aptData = getAptitudeById(aptId)
                    if (!aptData) return null
                    return (
                      <SummaryItem key={aptId} label={aptData.name} value={`Nv.${level}`} className="text-xs" />
                    )
                  })}
              </div>
            </div>
          ) : null}

          {selectedDisadvantages.length > 0 ? (
            <div className={sectionBlock}>
              <div className={sectionHeading}>Desvantagens</div>
              <div className="space-y-1">
                {selectedDisadvantages.map((disId) => {
                  const dis = getDisadvantageById(disId)
                  if (!dis) return null
                  return (
                    <div key={disId} className="p-1.5 border border-ecoar-magenta/40 text-[10px]">
                      <span className="text-ecoar-dark-900 dark:text-ecoar-light-900">{dis.name}</span>
                      <span className="text-ecoar-magenta ml-1">+{dis.pontosCriacao} PC</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {singularidades.length > 0 ? (
            <div className={sectionBlock}>
              <div className={sectionHeading}>Singularidades</div>
              <div className="space-y-1">
                {singularidades.map((singId) => {
                  const sing = getSingularityById(singId)
                  if (!sing) return null
                  return <SummaryItem key={singId} label={sing.name} value="" className="text-xs" />
                })}
              </div>
            </div>
          ) : null}

          {(Object.keys(signedSingularityEffects.bonusAttributes).length > 0 ||
            Object.keys(signedSingularityEffects.penaltyAttributes).length > 0 ||
            Object.keys(signedSingularityEffects.bonusSkills).length > 0 ||
            Object.keys(signedSingularityEffects.penaltySkills).length > 0 ||
            singularityBonusesCreation.corpo !== 0 ||
            singularityBonusesCreation.mente !== 0 ||
            singularityBonusesCreation.folego !== 0 ||
            singularityBonusesCreation.mana !== 0) && (
            <div className={sectionBlock}>
              <div className={sectionHeading}>Efeitos numéricos</div>
              <div className="space-y-2 text-[10px]">
                {(Object.keys(signedSingularityEffects.bonusAttributes).length > 0 ||
                  Object.keys(signedSingularityEffects.bonusSkills).length > 0 ||
                  singularityBonusesCreation.corpo > 0 ||
                  singularityBonusesCreation.mente > 0 ||
                  singularityBonusesCreation.folego > 0 ||
                  singularityBonusesCreation.mana > 0) && (
                  <div className="p-2 border border-ecoar-teal/35">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal mb-1">Bônus</div>
                    <ul className="space-y-0.5 text-ecoar-dark-500 dark:text-[#adb5bd]">
                      {Object.entries(signedSingularityEffects.bonusAttributes).map(([k, v]) => (
                        <li key={`ba-${k}`}>
                          {k}: +{v}
                        </li>
                      ))}
                      {Object.entries(signedSingularityEffects.bonusSkills).map(([id, v]) => (
                        <li key={`bs-${id}`}>
                          {getSkillById(id)?.name ?? id}: +{v}
                        </li>
                      ))}
                      {singularityBonusesCreation.corpo > 0 ? (
                        <li>Corpo: +{singularityBonusesCreation.corpo}</li>
                      ) : null}
                      {singularityBonusesCreation.mente > 0 ? (
                        <li>Mente: +{singularityBonusesCreation.mente}</li>
                      ) : null}
                      {singularityBonusesCreation.folego > 0 ? (
                        <li>Fôlego: +{singularityBonusesCreation.folego}</li>
                      ) : null}
                      {singularityBonusesCreation.mana > 0 ? (
                        <li>Mana: +{singularityBonusesCreation.mana}</li>
                      ) : null}
                    </ul>
                  </div>
                )}
                {(Object.keys(signedSingularityEffects.penaltyAttributes).length > 0 ||
                  Object.keys(signedSingularityEffects.penaltySkills).length > 0 ||
                  singularityBonusesCreation.corpo < 0 ||
                  singularityBonusesCreation.mente < 0 ||
                  singularityBonusesCreation.folego < 0 ||
                  singularityBonusesCreation.mana < 0) && (
                  <div className="p-2 border border-ecoar-magenta/40">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-ecoar-magenta mb-1">
                      Penalidades
                    </div>
                    <ul className="space-y-0.5 text-ecoar-dark-500 dark:text-[#adb5bd]">
                      {Object.entries(signedSingularityEffects.penaltyAttributes).map(([k, v]) => (
                        <li key={`pa-${k}`}>
                          {k}: {v}
                        </li>
                      ))}
                      {Object.entries(signedSingularityEffects.penaltySkills).map(([id, v]) => (
                        <li key={`ps-${id}`}>
                          {getSkillById(id)?.name ?? id}: {v}
                        </li>
                      ))}
                      {singularityBonusesCreation.corpo < 0 ? (
                        <li>Corpo: {singularityBonusesCreation.corpo}</li>
                      ) : null}
                      {singularityBonusesCreation.mente < 0 ? (
                        <li>Mente: {singularityBonusesCreation.mente}</li>
                      ) : null}
                      {singularityBonusesCreation.folego < 0 ? (
                        <li>Fôlego: {singularityBonusesCreation.folego}</li>
                      ) : null}
                      {singularityBonusesCreation.mana < 0 ? (
                        <li>Mana: {singularityBonusesCreation.mana}</li>
                      ) : null}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {(mergedEquipamentosLista.length > 0 || mergedArmasLista.length > 0) && (
            <div className={sectionBlock}>
              <div className={sectionHeading}>Equipamentos</div>
              <div className="space-y-1">
                {mergedEquipamentosLista.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="p-1.5 border border-ecoar-teal/30 text-[10px] text-ecoar-dark-500 dark:text-[#adb5bd]">
                    {item}
                  </div>
                ))}
                {mergedArmasLista.slice(0, 3).map((item, idx) => (
                  <SummaryItem key={`a-${idx}`} label={item} value="" className="text-xs mb-1" />
                ))}
              </div>
            </div>
          )}

          <div className={sectionBlock}>
            <div className={sectionHeading}>Pontos de Criação</div>
            <div className="flex items-end justify-between gap-2 border border-ecoar-teal/40 px-2 py-2">
              <span className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal">Disponíveis</span>
              <span className="font-display text-2xl leading-none text-ecoar-magenta tabular-nums">
                {pontosCriacao.disponiveis}
                <span className="text-sm text-ecoar-dark-500 dark:text-[#adb5bd]">/{pontosCriacao.obtidos}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default memo(WizardSummarySidebar)
