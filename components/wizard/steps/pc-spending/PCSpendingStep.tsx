'use client'

import dynamic from 'next/dynamic'
import StepSkeleton from '@/components/wizard/StepSkeleton'

const LazySingularitiesSpendingStep = dynamic(
  () =>
    import('@/components/wizard/steps/pc-spending/SingularitiesSpendingStep').then((m) => ({
      default: m.SingularitiesSpendingStep,
    })),
  { loading: () => <StepSkeleton />, ssr: false },
)
const LazyTraitsSpendingStep = dynamic(
  () =>
    import('@/components/wizard/steps/pc-spending/TraitsSpendingStep').then((m) => ({
      default: m.TraitsSpendingStep,
    })),
  { loading: () => <StepSkeleton />, ssr: false },
)

export function PCSpendingStep({
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
  attributes,
  skills,
  aptitudes,
  selectedEscolaMarcial,
  onEscolaMarcialSelect,
  selectedRaca,
  singularidadesMarciais,
  onSingularidadesMarciaisChange,
  singularidadesRaciais,
  onSingularidadesRaciaisChange,
  raceBonuses,
  martialSchoolBonuses,
  pontosDisponiveis,
  onSingularidadesChange,
  onEcoarSelect,
  onSingularidadesEcoarChange,
  onAttributesChange,
  onSkillsChange,
  onAptitudesChange,
  pontosCriacao,
  nivelAlma,
  activeSubStep,
  onSubStepChange,
  selectedDisadvantages,
}: {
  singularidades: string[]
  selectedEcoar: string
  singularidadesEcoar: string[]
  disturbios: import('@/data/disturbios').DisturbioOwnedEntry[]
  onDisturbiosChange: (entries: import('@/data/disturbios').DisturbioOwnedEntry[]) => void
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
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
  selectedEscolaMarcial: string
  onEscolaMarcialSelect: (id: string) => void
  selectedRaca: string
  singularidadesMarciais: string[]
  onSingularidadesMarciaisChange: (ids: string[]) => void
  singularidadesRaciais: string[]
  onSingularidadesRaciaisChange: (ids: string[]) => void
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
  pontosDisponiveis: number
  onSingularidadesChange: (singularidades: string[]) => void
  onEcoarSelect: (id: string) => void
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  onAttributesChange: (attrs: Record<string, number>) => void
  onSkillsChange: (skills: Record<string, { level: number; specialization?: string }>) => void
  onAptitudesChange: (apts: Record<string, number>) => void
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  activeSubStep: 'singularidades' | 'traços' | 'escola-marcial'
  onSubStepChange: (subStep: 'singularidades' | 'traços' | 'escola-marcial') => void
  selectedDisadvantages: string[]
}) {
  void onSubStepChange

  return (
    <div className="space-y-4">
      {activeSubStep === 'singularidades' ? (
        <LazySingularitiesSpendingStep
          singularidades={singularidades}
          selectedEcoar={selectedEcoar}
          singularidadesEcoar={singularidadesEcoar}
          disturbios={disturbios}
          onDisturbiosChange={onDisturbiosChange}
          ecoarAcoes={ecoarAcoes}
          onEcoarAcoesChange={onEcoarAcoesChange}
          selectedTrilha={selectedTrilha}
          onTrilhaSelect={onTrilhaSelect}
          pathSingularityBase={pathSingularityBase}
          onPathSingularityBaseChange={onPathSingularityBaseChange}
          pathBruxarias={pathBruxarias}
          onPathBruxariasChange={onPathBruxariasChange}
          pathCacadaPowers={pathCacadaPowers}
          onPathCacadaPowersChange={onPathCacadaPowersChange}
          pathCacadaEnhancements={pathCacadaEnhancements}
          onPathCacadaEnhancementsChange={onPathCacadaEnhancementsChange}
          pathExtraIds={pathExtraIds}
          onPathExtraIdsChange={onPathExtraIdsChange}
          pathPatronChoice={pathPatronChoice}
          onPathPatronChoiceChange={onPathPatronChoiceChange}
          pathHonorCode={pathHonorCode}
          onPathHonorCodeChange={onPathHonorCodeChange}
          selectedEscolaMarcial={selectedEscolaMarcial}
          onEscolaMarcialSelect={onEscolaMarcialSelect}
          singularidadesMarciais={singularidadesMarciais}
          onSingularidadesMarciaisChange={onSingularidadesMarciaisChange}
          selectedRaca={selectedRaca}
          singularidadesRaciais={singularidadesRaciais}
          onSingularidadesRaciaisChange={onSingularidadesRaciaisChange}
          pontosDisponiveis={pontosDisponiveis}
          onSingularidadesChange={onSingularidadesChange}
          onEcoarSelect={onEcoarSelect}
          onSingularidadesEcoarChange={onSingularidadesEcoarChange}
          pontosCriacao={pontosCriacao}
          nivelAlma={nivelAlma}
          attributes={attributes}
          skills={skills}
          aptitudes={aptitudes}
          selectedDisadvantages={selectedDisadvantages}
        />
      ) : null}

      {activeSubStep === 'traços' ? (
        <LazyTraitsSpendingStep
          attributes={attributes}
          skills={skills}
          aptitudes={aptitudes}
          pontosDisponiveis={pontosDisponiveis}
          raceBonuses={raceBonuses}
          martialSchoolBonuses={martialSchoolBonuses}
          onAttributesChange={onAttributesChange}
          onSkillsChange={onSkillsChange}
          onAptitudesChange={onAptitudesChange}
        />
      ) : null}
    </div>
  )
}
