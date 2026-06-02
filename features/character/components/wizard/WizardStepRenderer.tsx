'use client'

import { memo, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Sparkle } from 'lucide-react'
import { Button } from '@/shared/components/ui'
import {
  LazyAttributesStep,
  LazyAptitudesStep,
  LazyBackgroundStep,
  LazyCreationPointsStep,
  LazyEquipmentStep,
  LazyPCSpendingStep,
  LazyRaceSelectionStep,
  LazySelectionDetailsPanel,
  LazySkillsStep,
} from '@/components/wizard/wizardLazySteps'
import { getRaceById } from '@/data/races'
import { getMartialSchoolDataByIdResolved } from '@/data/martialSchoolSingularities'
import { formatCerosDisplay } from '@/lib/equipmentCost'
import type { WizardAttributes, WizardPontosCriacao } from '@/features/character/wizard/wizardFormTypes'
import type { CatalogOwnedItem } from '@/shared/types/equipment'
import type { Race } from '@/data/races'

export type WizardStepRendererProps = {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  selectedRaca: string
  availableRaces: Race[]
  attributes: WizardAttributes
  attributePoints: number
  pontosCriacao: WizardPontosCriacao
  skills: Record<string, { level: number; specialization?: string }>
  skillPoints: number
  aptitudes: Record<string, number>
  aptitudePoints: number
  singularidades: string[]
  selectedEcoar: string
  singularidadesEcoar: string[]
  selectedTrilha: string
  pathSingularityBase: string
  pathBruxarias: string[]
  pathCacadaPowers: string[]
  pathCacadaEnhancements: string[]
  selectedEscolaMarcial: string
  singularidadesRaciais: string[]
  selectedDisadvantages: string[]
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
  nivelAlmaInicial: number
  pcSubStep: 'singularidades' | 'traços' | 'escola-marcial'
  itensCatalogo: CatalogOwnedItem[]
  equipmentOrcamentoCeros: number
  equipmentSaldoRestante: number
  nome: string
  backstory: string
  tracoPositivo: string
  tracoNegativo: string
  personalidade: string
  onBack: () => void
  onNext: () => void
  onFinish: () => void
  onRacaSelect: (raca: string) => void
  onRacaClear: () => void
  updateAttribute: (attr: string, newTotalValue: number) => void
  onRandomizeAttributes: () => void
  onCreationPointsSpentChange: (spent: number) => void
  setSkills: (skills: Record<string, { level: number; specialization?: string }>) => void
  setSkillPoints: (points: number) => void
  setAptitudes: (aptitudes: Record<string, number>) => void
  setAptitudePoints: (points: number) => void
  setPontosCriacao: (points: WizardPontosCriacao) => void
  setSelectedDisadvantages: (ids: string[]) => void
  handleTrilhaSelectForPCStep: (trilha: string) => void
  setPathSingularityBase: (id: string) => void
  setPathBruxarias: (ids: string[]) => void
  setPathCacadaPowers: (ids: string[]) => void
  setPathCacadaEnhancements: (ids: string[]) => void
  setSelectedEscolaMarcial: (id: string) => void
  setSingularidades: (ids: string[]) => void
  setSingularidadesRaciais: (ids: string[]) => void
  setSelectedEcoar: (id: string) => void
  setSingularidadesEcoar: (ids: string[]) => void
  setAttributes: (attrs: WizardAttributes) => void
  setPCSubStep: (sub: 'singularidades' | 'traços' | 'escola-marcial') => void
  setItensCatalogo: (items: CatalogOwnedItem[]) => void
  setNome: (nome: string) => void
  setBackstory: (v: string) => void
  setTracoPositivo: (v: string) => void
  setTracoNegativo: (v: string) => void
  setPersonalidade: (v: string) => void
}

function WizardStepRenderer({
  currentStep,
  totalSteps,
  canProceed,
  selectedRaca,
  availableRaces,
  attributes,
  attributePoints,
  pontosCriacao,
  skills,
  skillPoints,
  aptitudes,
  aptitudePoints,
  singularidades,
  selectedEcoar,
  singularidadesEcoar,
  selectedTrilha,
  pathSingularityBase,
  pathBruxarias,
  pathCacadaPowers,
  pathCacadaEnhancements,
  selectedEscolaMarcial,
  singularidadesRaciais,
  selectedDisadvantages,
  raceBonuses,
  martialSchoolBonuses,
  nivelAlmaInicial,
  pcSubStep,
  itensCatalogo,
  equipmentOrcamentoCeros,
  equipmentSaldoRestante,
  nome,
  backstory,
  tracoPositivo,
  tracoNegativo,
  personalidade,
  onBack,
  onNext,
  onFinish,
  onRacaSelect,
  onRacaClear,
  updateAttribute,
  onRandomizeAttributes,
  onCreationPointsSpentChange,
  setSkills,
  setSkillPoints,
  setAptitudes,
  setAptitudePoints,
  setPontosCriacao,
  setSelectedDisadvantages,
  handleTrilhaSelectForPCStep,
  setPathSingularityBase,
  setPathBruxarias,
  setPathCacadaPowers,
  setPathCacadaEnhancements,
  setSelectedEscolaMarcial,
  setSingularidades,
  setSingularidadesRaciais,
  setSelectedEcoar,
  setSingularidadesEcoar,
  setAttributes,
  setPCSubStep,
  setItensCatalogo,
  setNome,
  setBackstory,
  setTracoPositivo,
  setTracoNegativo,
  setPersonalidade,
}: WizardStepRendererProps) {
  const navButtons = (extra?: ReactNode) => (
    <div className="flex justify-end gap-2 shrink-0 pb-4">
      {extra}
      <Button variant="secondary" size="md" leftIcon={ChevronLeft} onClick={onBack} disabled={currentStep === 0} className="min-h-[44px]">
        Voltar
      </Button>
      {currentStep < totalSteps ? (
        <Button variant="primary" size="md" rightIcon={ChevronRight} onClick={onNext} disabled={!canProceed} className="min-h-[44px]">
          Próximo
        </Button>
      ) : (
        <Button variant="primary" size="md" leftIcon={Sparkle} onClick={onFinish} disabled={!canProceed} className="min-h-[44px]">
          Finalizar
        </Button>
      )}
    </div>
  )

  return (
    <>
      {!(currentStep === 0 && selectedRaca) && navButtons()}

      <div className="flex flex-col w-full min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-5 scrollbar-hide pr-1">
        {currentStep === 0 &&
          (selectedRaca ? (
            <LazySelectionDetailsPanel
              type="race"
              selectedId={selectedRaca}
              getItemById={getRaceById}
              onBack={onRacaClear}
              onSelect={(id) => onRacaSelect(id)}
              headerActions={
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="md" leftIcon={ChevronLeft} onClick={onBack} disabled={currentStep === 0} className="min-h-[44px]">
                    Voltar
                  </Button>
                  {currentStep < totalSteps ? (
                    <Button variant="primary" size="md" rightIcon={ChevronRight} onClick={onNext} disabled={!canProceed} className="min-h-[44px]">
                      Próximo
                    </Button>
                  ) : (
                    <Button variant="primary" size="md" leftIcon={Sparkle} onClick={onFinish} disabled={!canProceed} className="min-h-[44px]">
                      Finalizar
                    </Button>
                  )}
                </div>
              }
            />
          ) : (
            <LazyRaceSelectionStep selectedRaca={selectedRaca} onRacaSelect={onRacaSelect} availableRaces={availableRaces} />
          ))}

        {currentStep === 1 && (
          <LazyAttributesStep
            attributes={attributes}
            attributePoints={attributePoints}
            pontosCriacao={pontosCriacao}
            onUpdate={updateAttribute}
            raceBonuses={raceBonuses}
            martialSchoolBonuses={martialSchoolBonuses}
            classBonuses={{}}
            onRandomize={onRandomizeAttributes}
            onPointsChange={onCreationPointsSpentChange}
            isEvolutionStep={false}
          />
        )}

        {currentStep === 2 && (
          <LazySkillsStep
            skills={skills}
            skillPoints={skillPoints}
            pontosCriacao={pontosCriacao}
            onSkillsChange={setSkills}
            onSkillPointsChange={setSkillPoints}
            onPointsChange={onCreationPointsSpentChange}
            isEvolutionStep={false}
          />
        )}

        {currentStep === 3 && (
          <LazyAptitudesStep
            aptitudes={aptitudes}
            pontosCriacao={pontosCriacao}
            onAptitudesChange={setAptitudes}
            onPointsChange={onCreationPointsSpentChange}
            aptitudePoints={aptitudePoints}
            onAptitudePointsChange={setAptitudePoints}
            isEvolutionStep={false}
          />
        )}

        {currentStep === 4 && (
          <LazyCreationPointsStep
            pontosCriacao={pontosCriacao}
            onPointsChange={setPontosCriacao}
            singularidades={singularidades}
            selectedDisadvantages={selectedDisadvantages}
            onDisadvantagesChange={setSelectedDisadvantages}
          />
        )}

        {currentStep === 5 && (
          <LazyPCSpendingStep
            singularidades={singularidades}
            selectedEcoar={selectedEcoar}
            singularidadesEcoar={singularidadesEcoar}
            selectedTrilha={selectedTrilha}
            onTrilhaSelect={handleTrilhaSelectForPCStep}
            pathSingularityBase={pathSingularityBase}
            onPathSingularityBaseChange={setPathSingularityBase}
            pathBruxarias={pathBruxarias}
            onPathBruxariasChange={setPathBruxarias}
            pathCacadaPowers={pathCacadaPowers}
            onPathCacadaPowersChange={setPathCacadaPowers}
            pathCacadaEnhancements={pathCacadaEnhancements}
            onPathCacadaEnhancementsChange={setPathCacadaEnhancements}
            attributes={attributes}
            skills={skills}
            aptitudes={aptitudes}
            selectedEscolaMarcial={selectedEscolaMarcial}
            onEscolaMarcialSelect={setSelectedEscolaMarcial}
            selectedRaca={selectedRaca}
            singularidadesMarciais={singularidades.filter((s) => {
              const school = getMartialSchoolDataByIdResolved(selectedEscolaMarcial)
              return school?.singularities.some((sing) => sing.id === s)
            })}
            onSingularidadesMarciaisChange={(singIds) => {
              const otherSingularities = singularidades.filter((s) => {
                const school = getMartialSchoolDataByIdResolved(selectedEscolaMarcial)
                return !school?.singularities.some((sing) => sing.id === s)
              })
              setSingularidades([...otherSingularities, ...singIds])
            }}
            singularidadesRaciais={singularidadesRaciais}
            onSingularidadesRaciaisChange={setSingularidadesRaciais}
            raceBonuses={raceBonuses}
            martialSchoolBonuses={martialSchoolBonuses}
            pontosDisponiveis={pontosCriacao.disponiveis}
            onSingularidadesChange={setSingularidades}
            onEcoarSelect={setSelectedEcoar}
            onSingularidadesEcoarChange={setSingularidadesEcoar}
            onAttributesChange={(attrs: Record<string, number>) => setAttributes(attrs as WizardAttributes)}
            onSkillsChange={setSkills}
            onAptitudesChange={setAptitudes}
            pontosCriacao={pontosCriacao}
            nivelAlma={nivelAlmaInicial}
            activeSubStep={pcSubStep}
            onSubStepChange={setPCSubStep}
            selectedDisadvantages={selectedDisadvantages}
          />
        )}

        {currentStep === 6 && (
          <>
            {equipmentSaldoRestante < 0 && (
              <div className="mb-4 p-4 rounded-lg border-2 border-ecoar-magenta/40 bg-ecoar-magenta/10 text-sm text-slate-800 dark:text-ecoar-light-900/90">
                <strong>Orçamento insuficiente.</strong> Remova itens do catálogo ou volte para ajustar Pontos de
                Criação não gastos — o saldo ficou negativo em {formatCerosDisplay(Math.abs(equipmentSaldoRestante))}.
              </div>
            )}
            <LazyEquipmentStep
              itensCatalogo={itensCatalogo}
              onItensCatalogoChange={setItensCatalogo}
              orcamentoCeros={equipmentOrcamentoCeros}
              saldoRestanteCeros={equipmentSaldoRestante}
            />
          </>
        )}

        {currentStep === 7 && (
          <LazyBackgroundStep
            nome={nome}
            backstory={backstory}
            tracoPositivo={tracoPositivo}
            tracoNegativo={tracoNegativo}
            personalidade={personalidade}
            onNomeChange={setNome}
            onBackstoryChange={setBackstory}
            onTracoPositivoChange={setTracoPositivo}
            onTracoNegativoChange={setTracoNegativo}
            onPersonalidadeChange={setPersonalidade}
          />
        )}
      </div>
    </>
  )
}

export default memo(WizardStepRenderer)
