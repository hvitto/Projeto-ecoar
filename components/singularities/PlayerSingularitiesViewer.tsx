'use client'

import { useMemo, useState } from 'react'
import type { CharacterData } from '@/types/auth'
import SingularityCard from '@/components/ui/SingularityCard'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { getCreationSingularityById } from '@/data/creationSingularities'
import { getSingularityById } from '@/data/singularities'
import { getMartialSchoolSingularityById } from '@/data/martialSchoolSingularities'
import { getRacialSingularityById } from '@/data/racialSingularities'
import { getSkillById } from '@/data/skills'
import { formatModifier } from '@/lib/calculations'
import type { SingularitiesBonusAggregate } from '@/lib/singularityBonuses'
import { partitionSignedBonuses } from '@/lib/characterBonuses'

type PlayerSingularityTab = 'criacao' | 'ecoar' | 'marciais' | 'raciais'

interface Props {
  characterData: CharacterData
  initialTab?: PlayerSingularityTab
  compact?: boolean
  /** Agregado da ficha (passivas/condicionais ativas); exibe bônus e desvantagens numéricas. */
  singularityBonuses?: SingularitiesBonusAggregate | null
}

export default function PlayerSingularitiesViewer({
  characterData,
  initialTab,
  compact,
  singularityBonuses,
}: Props) {
  const { getEcoarSingularityById } = useEcoarCatalogData()
  const [tab, setTab] = useState<PlayerSingularityTab>(initialTab ?? 'criacao')

  const resolveNameById = useMemo(() => {
    return (id: string) => {
      return (
        getCreationSingularityById(id)?.name ||
        getEcoarSingularityById(id)?.name ||
        getMartialSchoolSingularityById(id)?.name ||
        getSingularityById(id)?.name ||
        id
      )
    }
  }, [getEcoarSingularityById])

  const getSimpleRequirementText = (req: any): string | undefined => {
    if (!req) return undefined
    const parts: string[] = []
    if (req.previous) parts.push(`Requer: ${resolveNameById(req.previous)}`)
    if (typeof req.nivelAlma === 'number' && !Number.isNaN(req.nivelAlma)) {
      parts.push(`Nível de Alma ${req.nivelAlma}+`)
    }
    return parts.length ? parts.join(', ') : undefined
  }

  const formatAttributePenaltiesFromSource = (penalties?: { attributes?: Record<string, number> }) => {
    const attrs = penalties?.attributes
    if (!attrs || Object.keys(attrs).length === 0) return null
    return Object.entries(attrs)
      .map(([k, v]) => `${k} ${formatModifier(v)}`)
      .join(', ')
  }

  const buttonBase =
    'flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors'
  const buttonActive =
    'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border-ecoar-teal-500/30'
  const buttonIdle =
    'bg-white dark:bg-ecoar-dark-800/40 text-slate-700 dark:text-ecoar-light-900/80 border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10'

  const signedEffects = useMemo(
    () => (singularityBonuses ? partitionSignedBonuses(singularityBonuses) : null),
    [singularityBonuses],
  )

  const hasNumericEffects =
    singularityBonuses &&
    signedEffects &&
    (Object.keys(signedEffects.bonusAttributes).length > 0 ||
      Object.keys(signedEffects.penaltyAttributes).length > 0 ||
      Object.keys(signedEffects.bonusSkills).length > 0 ||
      Object.keys(signedEffects.penaltySkills).length > 0 ||
      singularityBonuses.corpo !== 0 ||
      singularityBonuses.mente !== 0 ||
      singularityBonuses.folego !== 0 ||
      singularityBonuses.mana !== 0)

  return (
    <div className="space-y-3">
      {hasNumericEffects && singularityBonuses && signedEffects && (
        <div className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/80 dark:bg-ecoar-dark-900/40 p-3 space-y-2 text-xs">
          <div className="font-semibold text-slate-800 dark:text-ecoar-light-900/90">Efeitos numéricos (singularidades)</div>
          {(Object.keys(signedEffects.bonusAttributes).length > 0 ||
            Object.keys(signedEffects.bonusSkills).length > 0 ||
            singularityBonuses.corpo > 0 ||
            singularityBonuses.mente > 0 ||
            singularityBonuses.folego > 0 ||
            singularityBonuses.mana > 0) && (
            <div className="p-2 rounded border border-ecoar-teal/30 bg-ecoar-teal/5 dark:bg-ecoar-teal-900/15">
              <div className="font-medium text-ecoar-teal-800 dark:text-ecoar-teal-300 mb-1">Bônus</div>
              <ul className="space-y-0.5 text-slate-700 dark:text-ecoar-light-900/85">
                {Object.entries(signedEffects.bonusAttributes).map(([k, v]) => (
                  <li key={`ba-${k}`}>
                    Atributo {k}: {formatModifier(v)}
                  </li>
                ))}
                {Object.entries(signedEffects.bonusSkills).map(([id, v]) => (
                  <li key={`bs-${id}`}>
                    {getSkillById(id)?.name ?? id}: {formatModifier(v)}
                  </li>
                ))}
                {singularityBonuses.corpo > 0 && <li>Corpo: {formatModifier(singularityBonuses.corpo)}</li>}
                {singularityBonuses.mente > 0 && <li>Mente: {formatModifier(singularityBonuses.mente)}</li>}
                {singularityBonuses.folego > 0 && <li>Fôlego: {formatModifier(singularityBonuses.folego)}</li>}
                {singularityBonuses.mana > 0 && <li>Mana: {formatModifier(singularityBonuses.mana)}</li>}
              </ul>
            </div>
          )}
          {(Object.keys(signedEffects.penaltyAttributes).length > 0 ||
            Object.keys(signedEffects.penaltySkills).length > 0 ||
            singularityBonuses.corpo < 0 ||
            singularityBonuses.mente < 0 ||
            singularityBonuses.folego < 0 ||
            singularityBonuses.mana < 0) && (
            <div className="p-2 rounded border border-ecoar-magenta/35 bg-ecoar-magenta/5 dark:bg-ecoar-magenta-900/15">
              <div className="font-medium text-ecoar-magenta-800 dark:text-ecoar-magenta-300 mb-1">Desvantagens</div>
              <ul className="space-y-0.5 text-slate-700 dark:text-ecoar-light-900/85">
                {Object.entries(signedEffects.penaltyAttributes).map(([k, v]) => (
                  <li key={`pa-${k}`}>
                    Atributo {k}: {formatModifier(v)}
                  </li>
                ))}
                {Object.entries(signedEffects.penaltySkills).map(([id, v]) => (
                  <li key={`ps-${id}`}>
                    {getSkillById(id)?.name ?? id}: {formatModifier(v)}
                  </li>
                ))}
                {singularityBonuses.corpo < 0 && <li>Corpo: {formatModifier(singularityBonuses.corpo)}</li>}
                {singularityBonuses.mente < 0 && <li>Mente: {formatModifier(singularityBonuses.mente)}</li>}
                {singularityBonuses.folego < 0 && <li>Fôlego: {formatModifier(singularityBonuses.folego)}</li>}
                {singularityBonuses.mana < 0 && <li>Mana: {formatModifier(singularityBonuses.mana)}</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className={`flex items-center gap-2 ${compact ? 'flex-wrap' : ''}`}>
        <button
          type="button"
          onClick={() => setTab('criacao')}
          className={`${buttonBase} ${tab === 'criacao' ? buttonActive : buttonIdle}`}
        >
          Criação
        </button>
        <button
          type="button"
          onClick={() => setTab('ecoar')}
          className={`${buttonBase} ${tab === 'ecoar' ? buttonActive : buttonIdle}`}
        >
          Ecoar
        </button>
        <button
          type="button"
          onClick={() => setTab('marciais')}
          className={`${buttonBase} ${tab === 'marciais' ? buttonActive : buttonIdle}`}
        >
          Marciais
        </button>
        <button
          type="button"
          onClick={() => setTab('raciais')}
          className={`${buttonBase} ${tab === 'raciais' ? buttonActive : buttonIdle}`}
        >
          Raciais
        </button>
      </div>

      {tab === 'raciais' && (
        <>
          {(characterData.singularidadesRaciais ?? []).length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
              Nenhuma singularidade racial selecionada.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {(characterData.singularidadesRaciais as string[]).map((id) => {
                const sing = getRacialSingularityById(id)
                if (!sing) {
                  return (
                    <div key={id} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                      Singularidade não encontrada: {id}
                    </div>
                  )
                }
                return (
                  <SingularityCard
                    key={id}
                    name={sing.name}
                    description={sing.description}
                    cost={sing.cost}
                    costLabel={sing.cost === 0 ? undefined : 'PC'}
                    secondaryCost={sing.cost === 0 ? 'Inata' : undefined}
                    effects={sing.effects}
                    isSelected={true}
                    canAfford={true}
                    canSelect={false}
                    onClick={() => {}}
                    variant="teal"
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'criacao' && (
        <>
          {(characterData.singularidades ?? []).length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
              Nenhuma singularidade de criação selecionada.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {(characterData.singularidades as string[]).map((id) => {
                const sing = getCreationSingularityById(id) || getSingularityById(id)
                if (!sing) {
                  return (
                    <div key={id} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                      Singularidade não encontrada: {id}
                    </div>
                  )
                }

                const restrictionsText =
                  sing.requirements && sing.requirements.length > 0
                    ? `Não pode possuir: ${sing.requirements.map((reqId) => resolveNameById(reqId)).join(', ')}`
                    : undefined

                const penaltyLine = formatAttributePenaltiesFromSource(sing.penalties)

                return (
                  <div key={id} className="space-y-1">
                    <SingularityCard
                      name={sing.name}
                      description={sing.description}
                      cost={sing.cost}
                      isSelected={true}
                      canAfford={true}
                      canSelect={false}
                      onClick={() => {}}
                      variant="teal"
                      requirementsText={restrictionsText}
                    />
                    {penaltyLine && (
                      <p className="text-[11px] text-ecoar-magenta-700 dark:text-ecoar-magenta-300/90 pl-0.5">
                        Penalidades (atributos): {penaltyLine}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'ecoar' && (
        <>
          {(characterData.singularidadesEcoar ?? []).length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
              Nenhuma singularidade de ecoar selecionada.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {(characterData.singularidadesEcoar as string[]).map((id) => {
                const sing = getEcoarSingularityById(id)
                if (!sing) {
                  return (
                    <div key={id} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                      Singularidade não encontrada: {id}
                    </div>
                  )
                }

                const penaltyLine = formatAttributePenaltiesFromSource(sing.penalties)

                return (
                  <div key={id} className="space-y-1">
                    <SingularityCard
                      name={sing.name}
                      description={sing.description}
                      cost={sing.cost}
                      costLabel="PC"
                      secondaryCost={sing.cost === 0 ? 'Inata' : undefined}
                      effects={sing.effects || undefined}
                      isSelected={true}
                      canAfford={true}
                      canSelect={false}
                      onClick={() => {}}
                      variant="teal"
                      requirementsText={getSimpleRequirementText(sing.requirements)}
                    />
                    {penaltyLine && (
                      <p className="text-[11px] text-ecoar-magenta-700 dark:text-ecoar-magenta-300/90 pl-0.5">
                        Penalidades (atributos): {penaltyLine}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'marciais' && (
        <>
          {(characterData.singularidadesMarciais ?? []).length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
              Nenhuma singularidade marcial selecionada.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {(characterData.singularidadesMarciais as string[]).map((id) => {
                const sing = getMartialSchoolSingularityById(id)
                if (!sing) {
                  return (
                    <div key={id} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                      Singularidade não encontrada: {id}
                    </div>
                  )
                }

                return (
                  <SingularityCard
                    key={id}
                    name={sing.name}
                    description={sing.description}
                    cost={sing.cost * 10}
                    costLabel="PC"
                    secondaryCost={`${sing.cost} PE`}
                    level={sing.level}
                    effects={sing.effects || undefined}
                    isSelected={true}
                    canAfford={true}
                    canSelect={false}
                    onClick={() => {}}
                    variant="teal"
                    requirementsText={getSimpleRequirementText(sing.requirements)}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

