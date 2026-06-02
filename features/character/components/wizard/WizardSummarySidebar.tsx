'use client'

import { memo } from 'react'
import {
  Zap,
  Sparkles,
  BookOpen,
  Award,
  Skull,
  Package,
  Footprints,
  Eye,
  Users,
  Star,
} from 'lucide-react'
import SummaryItem from '@/shared/components/ui/SummaryItem'
import { getRaceById } from '@/data/races'
import { getPathById } from '@/data/paths'
import { getMartialSchoolById } from '@/data/martialSchools'
import { getMartialSchoolDataByIdResolved } from '@/data/martialSchoolSingularities'
import { getSkillById } from '@/data/skills'
import { getAptitudeById } from '@/data/aptitudes'
import { getDisadvantageById } from '@/data/disadvantages'
import { getSingularityById } from '@/data/singularities'
import { getAttributeModifier, formatModifier } from '@/lib/calculations'
import {
  CHARACTER_ATTRIBUTE_KEYS,
  type EffectiveAttributeRow,
} from '@/lib/characterBonuses'
import type { WizardAttributes, WizardPontosCriacao } from '@/features/character/wizard/wizardFormTypes'

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
}: WizardSummarySidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 p-3 min-h-0 max-h-[calc(100dvh-5rem)] overflow-y-auto overflow-x-hidden">
      <div className="bg-ecoar-light-700 dark:bg-ecoar-dark-800/70 backdrop-blur-xl border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06] rounded-lg p-4 flex flex-col min-h-0 flex-1 shadow-sm overflow-hidden transition-opacity duration-200">
        <h3 className="text-xs font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-3 shrink-0">
          Resumo
        </h3>
        <div className="space-y-3 text-xs flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          {selectedRaca && (
            <div>
              <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2">Raça</div>
              <div className="text-ecoar-dark-900 dark:text-ecoar-light-900 font-semibold mb-2">
                {getRaceById(selectedRaca)?.name || '—'}
              </div>
              {(() => {
                const race = getRaceById(selectedRaca)
                if (!race?.bonuses) return null

                return (
                  <div className="space-y-1.5 text-xs">
                    {race.bonuses.movement && (
                      <div className="flex items-center gap-2 text-slate-700 dark:text-ecoar-light-900/70">
                        <Footprints className="w-3 h-3 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                        <span>
                          {race.bonuses.movement.terrestre && `Terrestre: ${race.bonuses.movement.terrestre}m`}
                          {race.bonuses.movement.aquatico && ` • Aquático: ${race.bonuses.movement.aquatico}m`}
                          {race.bonuses.movement.aereo && ` • Aéreo: ${race.bonuses.movement.aereo}m`}
                        </span>
                      </div>
                    )}
                    {race.bonuses.senses && (
                      <div className="space-y-1">
                        {race.bonuses.senses.visao !== undefined && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-ecoar-light-900/70">
                            <Eye className="w-3 h-3 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                            <span>Visão: {race.bonuses.senses.visao}m</span>
                          </div>
                        )}
                        {race.bonuses.senses.audicao !== undefined && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-ecoar-light-900/70">
                            <Users className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                            <span>Audição: {race.bonuses.senses.audicao}m</span>
                          </div>
                        )}
                        {race.bonuses.senses.olfato !== undefined && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-ecoar-light-900/70">
                            <Star className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                            <span>Olfato: {race.bonuses.senses.olfato}m</span>
                          </div>
                        )}
                      </div>
                    )}
                    {(race.bonuses.attributes && Object.keys(race.bonuses.attributes).length > 0) ||
                    race.bonuses.sizeModifier ||
                    race.bonuses.weightModifier ? (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {race.bonuses.attributes &&
                          Object.entries(race.bonuses.attributes).map(([attr, value]) => (
                            <span
                              key={attr}
                              className="text-xs px-1.5 py-0.5 rounded bg-ecoar-teal/20 dark:bg-ecoar-teal-600/30 text-ecoar-teal dark:text-ecoar-teal-300 border border-ecoar-teal/30 dark:border-ecoar-teal-500/40"
                            >
                              {attr === 'carisma'
                                ? 'Car'
                                : attr === 'finesse'
                                  ? 'Fin'
                                  : attr === 'forca'
                                    ? 'For'
                                    : attr === 'inteligencia'
                                      ? 'Int'
                                      : attr === 'percepcao'
                                        ? 'Per'
                                        : attr === 'vitalidade'
                                          ? 'Vit'
                                          : 'Von'}
                              +{value}
                            </span>
                          ))}
                        {race.bonuses.sizeModifier !== undefined && race.bonuses.sizeModifier !== 0 && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded bg-ecoar-magenta/20 dark:bg-ecoar-magenta-600/30 text-ecoar-magenta dark:text-ecoar-magenta-300 border border-ecoar-magenta/30 dark:border-ecoar-magenta-500/40"
                            title={`Tamanho ${race.bonuses.sizeModifier} = Força ${race.bonuses.sizeModifier > 0 ? '+' : ''}${race.bonuses.sizeModifier}`}
                          >
                            For{race.bonuses.sizeModifier > 0 ? '+' : ''}
                            {race.bonuses.sizeModifier} (Tamanho)
                          </span>
                        )}
                        {race.bonuses.weightModifier !== undefined && race.bonuses.weightModifier !== 0 && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded bg-ecoar-magenta/20 dark:bg-ecoar-magenta-600/30 text-ecoar-magenta dark:text-ecoar-magenta-300 border border-ecoar-magenta/30 dark:border-ecoar-magenta-500/40"
                            title={`Peso ${race.bonuses.weightModifier} = Vitalidade ${race.bonuses.weightModifier > 0 ? '+' : ''}${race.bonuses.weightModifier}`}
                          >
                            Vit{race.bonuses.weightModifier > 0 ? '+' : ''}
                            {race.bonuses.weightModifier} (Peso)
                          </span>
                        )}
                        {((race.bonuses.sizeModifier !== undefined && race.bonuses.sizeModifier !== 0) ||
                          (race.bonuses.weightModifier !== undefined && race.bonuses.weightModifier !== 0)) && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 dark:bg-orange-600/30 text-orange-600 dark:text-orange-300 border border-orange-500/30 dark:border-orange-500/40"
                            title={`Esquiva: -(${race.bonuses.sizeModifier ?? 0} + ${race.bonuses.weightModifier ?? 0}) = ${-((race.bonuses.sizeModifier ?? 0) + (race.bonuses.weightModifier ?? 0))}`}
                          >
                            Esq
                            {(() => {
                              const penalty = -((race.bonuses.sizeModifier ?? 0) + (race.bonuses.weightModifier ?? 0))
                              return penalty > 0 ? `+${penalty}` : `${penalty}`
                            })()}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })()}
            </div>
          )}

          {selectedEscolaMarcial && (
            <div>
              <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-1">Escola Marcial</div>
              <div className="text-ecoar-dark-900 dark:text-ecoar-light-900">
                {getMartialSchoolDataByIdResolved(selectedEscolaMarcial)?.name ||
                  getMartialSchoolById(selectedEscolaMarcial)?.name ||
                  '—'}
              </div>
            </div>
          )}

          {selectedTrilha && (
            <div>
              <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-1">Trilha</div>
              <div className="text-ecoar-dark-900 dark:text-ecoar-light-900">
                {getPathById(selectedTrilha)?.name || '—'}
              </div>
            </div>
          )}

          {Object.keys(attributes).length > 0 &&
            CHARACTER_ATTRIBUTE_KEYS.some(
              (k) =>
                (attributes[k as keyof typeof attributes] ?? 0) > 0 ||
                (effectiveAttributesCreation[k]?.singularityBonus ?? 0) !== 0 ||
                (effectiveAttributesCreation[k]?.bookDisadvantageBonus ?? 0) !== 0,
            ) && (
              <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                  Atributos
                </div>
                <p className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55 mb-2">
                  Número principal = base (raça/escola + pontos). Linha &quot;Efetivo&quot; inclui singularidades e
                  desvantagens do livro.
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
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
                    const label =
                      attr === 'carisma'
                        ? 'Car'
                        : attr === 'finesse'
                          ? 'Fin'
                          : attr === 'forca'
                            ? 'For'
                            : attr === 'inteligencia'
                              ? 'Int'
                              : attr === 'percepcao'
                                ? 'Per'
                                : attr === 'vitalidade'
                                  ? 'Vit'
                                  : 'Von'
                    return (
                      <SummaryItem
                        key={attr}
                        label={label}
                        value={
                          <div className="flex flex-col items-end gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{value}</span>
                              <span className="text-ecoar-teal/70 dark:text-ecoar-teal-400">
                                ({formatModifier(storedMod)})
                              </span>
                            </div>
                            {((eff?.singularityBonus ?? 0) !== 0 || (eff?.bookDisadvantageBonus ?? 0) !== 0) && (
                              <span className="text-[10px] text-ecoar-teal-600 dark:text-ecoar-teal-400 leading-tight text-right">
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

          {Object.keys(skills).length > 0 && (
            <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
              <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                Habilidades
              </div>
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
                            <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">
                              Nv.{skill.level}
                            </span>
                            {skBonus !== 0 && (
                              <span className="text-[10px] px-1 py-0.5 rounded bg-ecoar-teal/15 text-ecoar-teal-700 dark:text-ecoar-teal-300 border border-ecoar-teal/25">
                                bônus {formatModifier(skBonus)}
                              </span>
                            )}
                            {skill.specialization && (
                              <span className="text-ecoar-magenta/70 dark:text-ecoar-magenta-400 text-[10px]">
                                Esp.
                              </span>
                            )}
                          </div>
                        }
                        className="text-xs"
                      />
                    )
                  })}
                {Object.keys(skills).filter((id) => skills[id].level > 0).length > 5 && (
                  <div className="text-slate-400 dark:text-ecoar-light-900/40 text-[10px] text-center pt-1">
                    +{Object.keys(skills).filter((id) => skills[id].level > 0).length - 5} mais
                  </div>
                )}
              </div>
            </div>
          )}

          {Object.keys(aptitudes).length > 0 && Object.values(aptitudes).some((v) => v > 0) && (
            <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
              <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                <Award className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                Aptidões
              </div>
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
          )}

          {selectedDisadvantages.length > 0 && (
            <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
              <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                <Skull className="w-3 h-3 text-magenta-600 dark:text-ecoar-magenta-400" />
                Desvantagens
              </div>
              <div className="space-y-1">
                {selectedDisadvantages.map((disId) => {
                  const dis = getDisadvantageById(disId)
                  if (!dis) return null
                  return (
                    <div
                      key={disId}
                      className="p-1.5 bg-magenta-50 dark:bg-ecoar-magenta-800/50 rounded border border-magenta-200 dark:border-ecoar-magenta-600 text-xs"
                    >
                      <span className="text-slate-700 dark:text-ecoar-light-900/90">{dis.name}</span>
                      <span className="text-slate-900 dark:text-ecoar-light-900 ml-1 font-medium">
                        +{dis.pontosCriacao} PC
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {singularidades.length > 0 && (
            <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
              <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                Singularidades
              </div>
              <div className="space-y-1">
                {singularidades.map((singId) => {
                  const sing = getSingularityById(singId)
                  if (!sing) return null
                  return <SummaryItem key={singId} label={sing.name} value="" className="text-xs" />
                })}
              </div>
            </div>
          )}

          {(Object.keys(signedSingularityEffects.bonusAttributes).length > 0 ||
            Object.keys(signedSingularityEffects.penaltyAttributes).length > 0 ||
            Object.keys(signedSingularityEffects.bonusSkills).length > 0 ||
            Object.keys(signedSingularityEffects.penaltySkills).length > 0 ||
            singularityBonusesCreation.corpo !== 0 ||
            singularityBonusesCreation.mente !== 0 ||
            singularityBonusesCreation.folego !== 0 ||
            singularityBonusesCreation.mana !== 0) && (
            <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
              <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                Singularidades: efeitos numéricos
              </div>
              <div className="space-y-2 text-[10px]">
                {(Object.keys(signedSingularityEffects.bonusAttributes).length > 0 ||
                  Object.keys(signedSingularityEffects.bonusSkills).length > 0 ||
                  singularityBonusesCreation.corpo > 0 ||
                  singularityBonusesCreation.mente > 0 ||
                  singularityBonusesCreation.folego > 0 ||
                  singularityBonusesCreation.mana > 0) && (
                  <div className="p-2 rounded border border-ecoar-teal/25 bg-ecoar-teal/5 dark:bg-ecoar-teal-900/10">
                    <div className="font-semibold text-ecoar-teal-800 dark:text-ecoar-teal-300 mb-1">Bônus</div>
                    <ul className="space-y-0.5 text-slate-700 dark:text-ecoar-light-900/80">
                      {Object.entries(signedSingularityEffects.bonusAttributes).map(([k, v]) => (
                        <li key={`ba-${k}`}>
                          Atributo {k}: +{v}
                        </li>
                      ))}
                      {Object.entries(signedSingularityEffects.bonusSkills).map(([id, v]) => (
                        <li key={`bs-${id}`}>
                          {getSkillById(id)?.name ?? id}: +{v}
                        </li>
                      ))}
                      {singularityBonusesCreation.corpo > 0 && <li>Corpo: +{singularityBonusesCreation.corpo}</li>}
                      {singularityBonusesCreation.mente > 0 && <li>Mente: +{singularityBonusesCreation.mente}</li>}
                      {singularityBonusesCreation.folego > 0 && <li>Fôlego: +{singularityBonusesCreation.folego}</li>}
                      {singularityBonusesCreation.mana > 0 && <li>Mana: +{singularityBonusesCreation.mana}</li>}
                    </ul>
                  </div>
                )}
                {(Object.keys(signedSingularityEffects.penaltyAttributes).length > 0 ||
                  Object.keys(signedSingularityEffects.penaltySkills).length > 0 ||
                  singularityBonusesCreation.corpo < 0 ||
                  singularityBonusesCreation.mente < 0 ||
                  singularityBonusesCreation.folego < 0 ||
                  singularityBonusesCreation.mana < 0) && (
                  <div className="p-2 rounded border border-ecoar-magenta/30 bg-ecoar-magenta/5 dark:bg-ecoar-magenta-900/15">
                    <div className="font-semibold text-ecoar-magenta-800 dark:text-ecoar-magenta-300 mb-1">
                      Desvantagens (singularidades)
                    </div>
                    <ul className="space-y-0.5 text-slate-700 dark:text-ecoar-light-900/80">
                      {Object.entries(signedSingularityEffects.penaltyAttributes).map(([k, v]) => (
                        <li key={`pa-${k}`}>
                          Atributo {k}: {v}
                        </li>
                      ))}
                      {Object.entries(signedSingularityEffects.penaltySkills).map(([id, v]) => (
                        <li key={`ps-${id}`}>
                          {getSkillById(id)?.name ?? id}: {v}
                        </li>
                      ))}
                      {singularityBonusesCreation.corpo < 0 && <li>Corpo: {singularityBonusesCreation.corpo}</li>}
                      {singularityBonusesCreation.mente < 0 && <li>Mente: {singularityBonusesCreation.mente}</li>}
                      {singularityBonusesCreation.folego < 0 && <li>Fôlego: {singularityBonusesCreation.folego}</li>}
                      {singularityBonusesCreation.mana < 0 && <li>Mana: {singularityBonusesCreation.mana}</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {(mergedEquipamentosLista.length > 0 || mergedArmasLista.length > 0) && (
            <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
              <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                <Package className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                Equipamentos
              </div>
              <div className="space-y-1">
                {mergedEquipamentosLista.length > 0 && (
                  <div>
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-[10px] mb-1">Equipamentos:</div>
                    {mergedEquipamentosLista.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 bg-slate-50 dark:bg-ecoar-light-900/10 rounded border border-slate-200 dark:border-ecoar-light-900/20 text-xs mb-1"
                      >
                        <span className="text-slate-700 dark:text-ecoar-light-900/80">{item}</span>
                      </div>
                    ))}
                    {mergedEquipamentosLista.length > 3 && (
                      <div className="text-slate-400 dark:text-ecoar-light-900/40 text-[10px] text-center pt-1">
                        +{mergedEquipamentosLista.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
                {mergedArmasLista.length > 0 && (
                  <div className="mt-2">
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-[10px] mb-1">Armas:</div>
                    {mergedArmasLista.slice(0, 3).map((item, idx) => (
                      <SummaryItem key={idx} label={item} value="" className="text-xs mb-1" />
                    ))}
                    {mergedArmasLista.length > 3 && (
                      <div className="text-slate-400 dark:text-ecoar-light-900/40 text-[10px] text-center pt-1">
                        +{mergedArmasLista.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
            <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2">Pontos de Criação</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-teal-600 dark:text-ecoar-teal-400 font-semibold">{pontosCriacao.disponiveis}</div>
                <div className="text-slate-400 dark:text-ecoar-light-900/40 text-xs">disponíveis</div>
              </div>
              <div className="text-slate-400 dark:text-ecoar-light-900/40">/</div>
              <div className="flex-1 text-right">
                <div className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{pontosCriacao.obtidos}</div>
                <div className="text-slate-400 dark:text-ecoar-light-900/40 text-xs">total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default memo(WizardSummarySidebar)
