'use client'

import { useState, useCallback } from 'react'
import SingularityCard from '@/shared/components/ui/SingularityCard'
import { PointBanner } from '@/components/beyond/WizardStage'
import RangeFrame from '@/components/beyond/RangeFrame'
import { getCreationSingularitiesByCategory, getCreationSingularityById } from '@/data/creationSingularities'
import { getSingularityById } from '@/data/singularities'
import { getDisadvantageById } from '@/data/disadvantages'
import { getSoulLevelByNivel } from '@/data/soulLevels'
import { requirementsConflictWithSelection } from '@/lib/creationSingularityDisadvantageConflict'
import { MartialSingularitiesTab } from '@/components/wizard/steps/pc-spending/MartialSingularitiesTab'
import { RacialSingularitiesTab } from '@/components/wizard/steps/pc-spending/RacialSingularitiesTab'
import { PathSingularitiesTab } from '@/components/wizard/steps/pc-spending/PathSingularitiesTab'
import { EcoarSelection } from '@/components/wizard/steps/pc-spending/EcoarSelection'
import type { DisturbioOwnedEntry } from '@/data/disturbios'

const TABS = [
  { id: 'criacao' as const, label: 'Criação' },
  { id: 'marciais' as const, label: 'Marciais' },
  { id: 'raciais' as const, label: 'Raciais' },
  { id: 'trilha' as const, label: 'Trilha' },
  { id: 'ecoa' as const, label: 'Ecoar' },
]

const CATEGORY_LABELS = {
  atributos: 'Atributos',
  habilidades: 'Habilidades',
  genetica: 'Genética',
  talentos: 'Talentos',
} as const

export function SingularitiesSpendingStep({
  singularidades,
  selectedEcoar,
  singularidadesEcoar,
  disturbios,
  onDisturbiosChange,
  ecoarAcoes,
  onEcoarAcoesChange,
  selectedTrilha,
  onTrilhaSelect,
  pathSingularityBase,
  onPathSingularityBaseChange,
  pathBruxarias,
  onPathBruxariasChange,
  pathCacadaPowers,
  onPathCacadaPowersChange,
  pathCacadaEnhancements,
  onPathCacadaEnhancementsChange,
  pathExtraIds,
  onPathExtraIdsChange,
  pathPatronChoice,
  onPathPatronChoiceChange,
  pathHonorCode,
  onPathHonorCodeChange,
  selectedEscolaMarcial,
  onEscolaMarcialSelect,
  singularidadesMarciais,
  onSingularidadesMarciaisChange,
  selectedRaca,
  singularidadesRaciais,
  onSingularidadesRaciaisChange,
  pontosDisponiveis,
  onSingularidadesChange,
  onEcoarSelect,
  onSingularidadesEcoarChange,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
  selectedDisadvantages,
}: {
  singularidades: string[]
  selectedEcoar: string
  singularidadesEcoar: string[]
  disturbios: DisturbioOwnedEntry[]
  onDisturbiosChange: (entries: DisturbioOwnedEntry[]) => void
  ecoarAcoes: string[]
  onEcoarAcoesChange: (ids: string[]) => void
  selectedTrilha: string
  onTrilhaSelect: (id: string) => void
  pathSingularityBase: string
  onPathSingularityBaseChange: (id: string) => void
  pathBruxarias: string[]
  onPathBruxariasChange: (ids: string[]) => void
  pathCacadaPowers: string[]
  onPathCacadaPowersChange: (ids: string[]) => void
  pathCacadaEnhancements: string[]
  onPathCacadaEnhancementsChange: (ids: string[]) => void
  pathExtraIds: string[]
  onPathExtraIdsChange: (ids: string[]) => void
  pathPatronChoice: string
  onPathPatronChoiceChange: (id: string) => void
  pathHonorCode: string
  onPathHonorCodeChange: (id: string) => void
  selectedEscolaMarcial: string
  onEscolaMarcialSelect: (id: string) => void
  singularidadesMarciais: string[]
  onSingularidadesMarciaisChange: (ids: string[]) => void
  selectedRaca: string
  singularidadesRaciais: string[]
  onSingularidadesRaciaisChange: (ids: string[]) => void
  pontosDisponiveis: number
  onSingularidadesChange: (singularidades: string[]) => void
  onEcoarSelect: (id: string) => void
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
  selectedDisadvantages: string[]
}) {
  const [activeTab, setActiveTab] = useState<'criacao' | 'marciais' | 'raciais' | 'trilha' | 'ecoa'>('criacao')
  const nivelPoder = getSoulLevelByNivel(nivelAlma)?.nivelPoder ?? 3

  const toggleSingularity = useCallback(
    (id: string, isCreation: boolean = false) => {
      const singularity = isCreation ? getCreationSingularityById(id) : getSingularityById(id)
      const cost = singularity?.cost || 0

      if (!singularity) return

      const isSelected = singularidades.includes(id)

      if (isSelected) {
        onSingularidadesChange(singularidades.filter((s) => s !== id))
      } else {
        if (isCreation && 'requirements' in singularity && singularity.requirements) {
          const hasConflict = requirementsConflictWithSelection(
            singularity.requirements,
            singularidades,
            selectedDisadvantages,
          )
          if (hasConflict) return
        }

        if (pontosCriacao.disponiveis >= cost) {
          onSingularidadesChange([...singularidades, id])
        }
      }
    },
    [singularidades, selectedDisadvantages, pontosCriacao.disponiveis, onSingularidadesChange],
  )

  return (
    <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
      <PointBanner label="PC disponíveis" value={pontosDisponiveis} danger={pontosDisponiveis < 0} />

      <div className="flex flex-wrap gap-px bg-ecoar-teal/40 border border-ecoar-teal/50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[5rem] px-3 py-2.5 text-[10px] uppercase tracking-[0.12em] transition-colors ${
              activeTab === tab.id
                ? 'bg-ecoar-magenta text-[var(--ecoar-accent-ink)]'
                : 'bg-[#0a0a0a]/75 text-ecoar-dark-900 dark:text-ecoar-light-900 hover:bg-ecoar-teal/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <RangeFrame title="Singularidades" refId="PC-06" bodyClassName="p-0">
        {activeTab === 'criacao' && (
          <div className="space-y-5 p-3 sm:p-4">
            {(['atributos', 'habilidades', 'genetica', 'talentos'] as const).map((category) => {
              const categorySingularities = getCreationSingularitiesByCategory(category)
              if (categorySingularities.length === 0) return null

              return (
                <div key={category} className="space-y-3">
                  <h5 className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 border-b border-ecoar-teal/35 pb-2">
                    {CATEGORY_LABELS[category]}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {categorySingularities.map((singularity) => {
                      const isSelected = singularidades.includes(singularity.id)
                      const canAfford = pontosDisponiveis >= singularity.cost
                      const hasConflict = requirementsConflictWithSelection(
                        singularity.requirements,
                        singularidades,
                        selectedDisadvantages,
                      )
                      const canSelect = canAfford && !hasConflict

                      return (
                        <SingularityCard
                          key={singularity.id}
                          name={singularity.name}
                          description={singularity.description}
                          cost={singularity.cost}
                          isSelected={isSelected}
                          canAfford={canAfford}
                          canSelect={canSelect}
                          onClick={() => toggleSingularity(singularity.id, true)}
                          requirementsText={
                            singularity.requirements && singularity.requirements.length > 0
                              ? `Não pode possuir: ${singularity.requirements
                                  .map((req) => {
                                    const dis = getDisadvantageById(req)
                                    const sing = getSingularityById(req) || getCreationSingularityById(req)
                                    return dis?.name || sing?.name || req
                                  })
                                  .join(', ')}`
                              : undefined
                          }
                          variant="teal"
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'marciais' && (
          <div className="p-3 sm:p-4">
            <MartialSingularitiesTab
              selectedEscolaMarcial={selectedEscolaMarcial}
              onEscolaMarcialSelect={onEscolaMarcialSelect}
              todasSingularidades={singularidades}
              singularidadesMarciais={singularidadesMarciais}
              onSingularidadesMarciaisChange={onSingularidadesMarciaisChange}
              pontosDisponiveis={pontosDisponiveis}
              pontosCriacao={pontosCriacao}
              nivelAlma={nivelAlma}
              attributes={attributes}
              skills={skills}
              aptitudes={aptitudes}
            />
          </div>
        )}

        {activeTab === 'raciais' && (
          <div className="p-3 sm:p-4">
            <RacialSingularitiesTab
              selectedRaca={selectedRaca}
              singularidadesRaciais={singularidadesRaciais}
              onSingularidadesRaciaisChange={onSingularidadesRaciaisChange}
              pontosDisponiveis={pontosDisponiveis}
              pontosCriacao={pontosCriacao}
              nivelAlma={nivelAlma}
              attributes={attributes}
              skills={skills}
              aptitudes={aptitudes}
            />
          </div>
        )}

        {activeTab === 'trilha' && (
          <div className="p-3 sm:p-4">
            <PathSingularitiesTab
              selectedTrilha={selectedTrilha}
              selectedPathBase={pathSingularityBase}
              selectedBruxarias={pathBruxarias}
              selectedCacadaPowers={pathCacadaPowers}
              selectedCacadaEnhancements={pathCacadaEnhancements}
              pathExtraIds={pathExtraIds}
              pathPatronChoice={pathPatronChoice}
              pathHonorCode={pathHonorCode}
              onTrilhaSelect={(id) => {
                if (id !== selectedTrilha) {
                  onPathSingularityBaseChange('')
                  onPathBruxariasChange([])
                  onPathCacadaPowersChange([])
                  onPathCacadaEnhancementsChange([])
                  onPathExtraIdsChange([])
                  onPathPatronChoiceChange('')
                  onPathHonorCodeChange('')
                }
                onTrilhaSelect(id)
              }}
              onPathBaseSelect={onPathSingularityBaseChange}
              onBruxariasChange={onPathBruxariasChange}
              onCacadaPowersChange={onPathCacadaPowersChange}
              onCacadaEnhancementsChange={onPathCacadaEnhancementsChange}
              onPathExtraIdsChange={onPathExtraIdsChange}
              onPathPatronChoiceChange={onPathPatronChoiceChange}
              onPathHonorCodeChange={onPathHonorCodeChange}
              pontosDisponiveis={pontosDisponiveis}
              martialSingularityIds={singularidadesMarciais}
              nivelAlma={nivelAlma}
            />
          </div>
        )}

        {activeTab === 'ecoa' && (
          <div className="p-3 sm:p-4">
            <EcoarSelection
              selectedEcoar={selectedEcoar}
              singularidadesEcoar={singularidadesEcoar}
              onEcoarSelect={onEcoarSelect}
              onSingularidadesEcoarChange={onSingularidadesEcoarChange}
              disturbios={disturbios}
              onDisturbiosChange={onDisturbiosChange}
              ecoarAcoes={ecoarAcoes}
              onEcoarAcoesChange={onEcoarAcoesChange}
              nivelAlma={nivelAlma}
              nivelPoder={nivelPoder}
              attributes={attributes}
              skills={skills}
              aptitudes={aptitudes}
            />
          </div>
        )}
      </RangeFrame>
    </div>
  )
}
