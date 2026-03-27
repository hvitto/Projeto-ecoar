'use client'

import { useMemo, useState } from 'react'
import type { CharacterData } from '@/types/auth'
import SingularityCard from '@/components/ui/SingularityCard'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { getCreationSingularityById } from '@/data/creationSingularities'
import { getSingularityById } from '@/data/singularities'
import { getMartialSchoolSingularityById } from '@/data/martialSchoolSingularities'
import { getRacialSingularityById } from '@/data/racialSingularities'

type PlayerSingularityTab = 'criacao' | 'ecoar' | 'marciais' | 'raciais'

interface Props {
  characterData: CharacterData
  initialTab?: PlayerSingularityTab
  compact?: boolean
}

export default function PlayerSingularitiesViewer({ characterData, initialTab, compact }: Props) {
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

  const buttonBase =
    'flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors'
  const buttonActive =
    'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border-ecoar-teal-500/30'
  const buttonIdle =
    'bg-white dark:bg-ecoar-dark-800/40 text-slate-700 dark:text-ecoar-light-900/80 border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10'

  return (
    <div className="space-y-3">
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

                return (
                  <SingularityCard
                    key={id}
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

                return (
                  <SingularityCard
                    key={id}
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

