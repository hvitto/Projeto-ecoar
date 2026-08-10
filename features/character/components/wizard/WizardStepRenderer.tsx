'use client'

import { memo, useEffect, useRef, useState } from 'react'
import StampButton from '@/components/beyond/StampButton'
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
import { statusLabel } from '@/shared/styles/ecoarChrome'
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
  disturbios: import('@/data/disturbios').DisturbioOwnedEntry[]
  ecoarAcoes: string[]
  selectedTrilha: string
  pathSingularityBase: string
  pathBruxarias: string[]
  pathCacadaPowers: string[]
  pathCacadaEnhancements: string[]
  pathExtraIds: string[]
  pathPatronChoice: string
  pathHonorCode: string
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
  setPathExtraIds: (ids: string[]) => void
  setPathPatronChoice: (id: string) => void
  setPathHonorCode: (id: string) => void
  setSelectedEscolaMarcial: (id: string) => void
  setSingularidades: (ids: string[]) => void
  setSingularidadesRaciais: (ids: string[]) => void
  setSelectedEcoar: (id: string) => void
  setSingularidadesEcoar: (ids: string[]) => void
  setDisturbios: (entries: import('@/data/disturbios').DisturbioOwnedEntry[]) => void
  setEcoarAcoes: (ids: string[]) => void
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
  disturbios,
  ecoarAcoes,
  selectedTrilha,
  pathSingularityBase,
  pathBruxarias,
  pathCacadaPowers,
  pathCacadaEnhancements,
  pathExtraIds,
  pathPatronChoice,
  pathHonorCode,
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
  setPathExtraIds,
  setPathPatronChoice,
  setPathHonorCode,
  setSelectedEscolaMarcial,
  setSingularidades,
  setSingularidadesRaciais,
  setSelectedEcoar,
  setSingularidadesEcoar,
  setDisturbios,
  setEcoarAcoes,
  setAttributes,
  setPCSubStep,
  setItensCatalogo,
  setNome,
  setBackstory,
  setTracoPositivo,
  setTracoNegativo,
  setPersonalidade,
}: WizardStepRendererProps) {
  const [raceDetailOpen, setRaceDetailOpen] = useState(false)
  const [previewRaca, setPreviewRaca] = useState<string | null>(null)
  const stepScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentStep !== 0) {
      setRaceDetailOpen(false)
      setPreviewRaca(null)
    }
  }, [currentStep])

  useEffect(() => {
    if (!selectedRaca) {
      setRaceDetailOpen(false)
      setPreviewRaca(null)
    }
  }, [selectedRaca])

  useEffect(() => {
    if (currentStep !== 0) return
    stepScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [currentStep, raceDetailOpen, previewRaca])

  const nextBlocked = !canProceed || Boolean(previewRaca)

  const navStatus =
    currentStep === 0
      ? previewRaca
        ? 'Espiar ativo. Confirme Usar ou Manter antes de avançar.'
        : !selectedRaca
          ? 'Escolha uma raça para avançar.'
          : null
      : null

  const navDock = (
    <div
      data-wizard-nav-dock
      className="z-20 -mx-3 sm:-mx-5 mt-auto px-3 sm:px-5 pt-3 flex flex-col gap-2 shrink-0 border-t border-ecoar-teal/50 dark:border-ecoar-teal bg-[#1a1d21] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3"
    >
      {navStatus ? (
        <p role="status" className={`${statusLabel} sm:text-right`}>
          {navStatus}
        </p>
      ) : null}
      <div className="flex flex-row items-stretch justify-stretch sm:justify-end gap-2">
        <StampButton
          tone="ghost"
          onClick={onBack}
          disabled={currentStep === 0}
          className="min-h-12 flex-1 sm:min-h-11 sm:flex-none sm:w-auto"
        >
          Voltar
        </StampButton>
        {currentStep < totalSteps ? (
          <StampButton
            onClick={onNext}
            disabled={nextBlocked}
            title={navStatus ?? undefined}
            className="min-h-12 flex-[1.35] sm:min-h-11 sm:flex-none sm:w-auto sm:min-w-[9rem]"
          >
            Próximo
          </StampButton>
        ) : (
          <StampButton
            onClick={onFinish}
            disabled={nextBlocked}
            title={navStatus ?? undefined}
            className="min-h-12 flex-[1.35] sm:min-h-11 sm:flex-none sm:w-auto sm:min-w-[9rem]"
          >
            Finalizar
          </StampButton>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col w-full min-h-0 flex-1">
      <div
        ref={stepScrollRef}
        className="flex flex-col w-full min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-3 scrollbar-hide pr-1"
      >
        {currentStep === 0 &&
          (selectedRaca && raceDetailOpen ? (
            <LazySelectionDetailsPanel
              type="race"
              selectedId={selectedRaca}
              previewId={previewRaca}
              getItemById={getRaceById}
              availableRaces={availableRaces}
              onBack={() => {
                setPreviewRaca(null)
                setRaceDetailOpen(false)
              }}
              onPreview={(id) => {
                if (id === selectedRaca) {
                  setPreviewRaca(null)
                  return
                }
                setPreviewRaca(id)
              }}
              onCommitPreview={() => {
                if (!previewRaca) return
                onRacaSelect(previewRaca)
                setPreviewRaca(null)
              }}
              onDismissPreview={() => setPreviewRaca(null)}
            />
          ) : (
            <LazyRaceSelectionStep
              selectedRaca={selectedRaca}
              onRacaSelect={(id) => {
                onRacaSelect(id)
                setPreviewRaca(null)
                setRaceDetailOpen(true)
              }}
              availableRaces={availableRaces}
            />
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
            disturbios={disturbios}
            onDisturbiosChange={setDisturbios}
            ecoarAcoes={ecoarAcoes}
            onEcoarAcoesChange={setEcoarAcoes}
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
            pathExtraIds={pathExtraIds}
            onPathExtraIdsChange={setPathExtraIds}
            pathPatronChoice={pathPatronChoice}
            onPathPatronChoiceChange={setPathPatronChoice}
            pathHonorCode={pathHonorCode}
            onPathHonorCodeChange={setPathHonorCode}
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
              <div className="mb-4 p-3 border border-ecoar-magenta/60 bg-ecoar-magenta/10 text-[11px] text-ecoar-dark-900 dark:text-ecoar-light-900">
                <span className="font-display uppercase tracking-[-0.02em] text-ecoar-magenta">Orçamento insuficiente. </span>
                Remova itens ou ajuste PC — saldo negativo em {formatCerosDisplay(Math.abs(equipmentSaldoRestante))}.
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

      {navDock}
    </div>
  )
}

export default memo(WizardStepRenderer)
