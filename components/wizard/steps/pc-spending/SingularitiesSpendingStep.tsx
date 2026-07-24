'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { fadeInUp, motionTransition } from '@/lib/motionVariants'
import {
  Briefcase, MapPin, Users, Route, Zap, Sword, Sparkles, Gem,
  Package, Calculator, BookOpen, User, ChevronLeft, ChevronRight, ChevronDown,
  CheckCircle2, Circle, Target, Award, Sparkle, Shield, ScrollText,
  Skull, Heart, Brain, Eye, Footprints, Wand2, Dices, RefreshCw,
  Scroll, Crown, Coins, Hammer, Map, Globe, Star, Waves, Info, X, ExternalLink
} from 'lucide-react'
import { Button, Card, Badge, SectionHeader, SelectableCard, Input, Textarea } from '@/shared/components/ui'
import SingularityCard from '@/shared/components/ui/SingularityCard'
import SelectionCard from '@/shared/components/ui/SelectionCard'
import InfoCard from '@/shared/components/ui/InfoCard'
import DisadvantageCard from '@/shared/components/ui/DisadvantageCard'
import RaceCard from '@/shared/components/ui/RaceCard'
import RaceImage from '@/shared/components/ui/RaceImage'
import StatCard from '@/shared/components/ui/StatCard'
import LimitCard from '@/shared/components/ui/LimitCard'
import MovementCard from '@/shared/components/ui/MovementCard'
import SenseCard from '@/shared/components/ui/SenseCard'
import SummaryItem from '@/shared/components/ui/SummaryItem'
import MartialSchoolCard from '@/shared/components/ui/MartialSchoolCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { races, getRaceById, Race, RaceImageConfig } from '@/data/races'
import {
  getRacialSingularitiesByRaceId,
  getRacialSingularityById,
  pruneRacialSingularitiesToValidRequirements,
} from '@/data/racialSingularities'
import { paths, getPathById, Path } from '@/data/paths'
import { martialSchools, getMartialSchoolById, MartialSchool } from '@/data/martialSchools'
import { skills as skillsData, getSkillsByCategory, getSkillById, Skill } from '@/data/skills'
import { aptitudes as aptitudesData, getAptitudeById, Aptitude } from '@/data/aptitudes'
import { singularities, getSingularitiesByCategory, getSingularityById, Singularity } from '@/data/singularities'
import { creationSingularities, getCreationSingularityById, getCreationSingularitiesByCategory, CreationSingularity } from '@/data/creationSingularities'
import {
  getAllMartialSchools,
  getMartialSchoolDataById,
  getMartialSchoolDataByIdResolved,
  getMartialSchoolSingularityById,
  MARTIAL_SCHOOL_DATA_ID_TO_UI_ID,
  resolveMartialSchoolDataId,
  MartialSchoolData,
  MartialSchoolSingularity,
} from '@/data/martialSchoolSingularities'
import { getRacialCreationExtraPoints } from '@/lib/racialRules'
import { locations, getLocationById, getLocationsByNation, getAllNations, Location } from '@/data/locations'
import type { Ecoar } from '@/data/ecoar'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { isEcoarPreviousRequirementMet } from '@/lib/ecoarSingularityRequirements'
import { soulLevels, getSoulLevelByNivel, SoulLevel, getEstagios } from '@/data/soulLevels'
import { disadvantages, getDisadvantageById, getDisadvantagesByCategory } from '@/data/disadvantages'
import { getAttributeModifier, getSkillDice, formatModifier } from '@/lib/calculations'
import { aggregateSimpleBonuses } from '@/lib/singularityBonuses'
import { buildSystemSingularities } from '@/lib/systemSingularities'
import {
  aggregateBookDisadvantagePenalties,
  aggregateSingularityInputFromCharacterData,
  CHARACTER_ATTRIBUTE_KEYS,
  computeEffectiveAttributeRows,
  partitionSignedBonuses,
} from '@/lib/characterBonuses'
import {
  anySelectedSingularityForbidsDisadvantage,
  requirementsConflictWithSelection,
} from '@/lib/creationSingularityDisadvantageConflict'
import {
  pathBaseSingularities,
  getPathBaseSingularityByPathId,
  bruxarias,
  getBruxariasByCategory,
  getAllBruxarias,
  cacadaPowers,
  getAllCacadaPowers,
  getCacadaPowerById,
  cacadaEnhancements,
  getCacadaEnhancementsByPowerId,
  getCacadaEnhancementById,
  getPathLevelFromSoulLevel,
  Bruxaria,
  CacadaPower,
  CacadaEnhancement,
} from '@/data/pathSingularities'
import type { CatalogEntry, CatalogOwnedItem } from '@/shared/types/equipment'
import EquipmentCatalogBrowser from '@/components/equipment/EquipmentCatalogBrowser'
import { useEquipmentCatalog } from '@/shared/contexts/EquipmentCatalogContext'
import { catalogDisplayLine, formatCerosDisplay, newCatalogInstanceId, sumCatalogItemsCeros } from '@/lib/equipmentCost'
import { MartialSingularitiesTab } from '@/components/wizard/steps/pc-spending/MartialSingularitiesTab'
import { RacialSingularitiesTab } from '@/components/wizard/steps/pc-spending/RacialSingularitiesTab'
import { PathSingularitiesTab } from '@/components/wizard/steps/pc-spending/PathSingularitiesTab'
import { EcoarSelection } from '@/components/wizard/steps/pc-spending/EcoarSelection'


import type { DisturbioOwnedEntry } from '@/data/disturbios'

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
  const { getEcoarSingularityById } = useEcoarCatalogData()
  const [activeTab, setActiveTab] = useState<
    'criacao' | 'marciais' | 'maestrias' | 'raciais' | 'trilha' | 'ecoa'
  >('criacao')
  const nivelPoder = getSoulLevelByNivel(nivelAlma)?.nivelPoder ?? 3

  const calculateTotalCost = useCallback(() => {
    const criacaoCost = singularidades.reduce((sum, singId) => {
      if (getMartialSchoolSingularityById(singId)) return sum
      let sing: any = getCreationSingularityById(singId)
      if (!sing) {
        sing = getSingularityById(singId)
      }
      return sum + (sing?.cost || 0)
    }, 0)

    const marciaisCost = singularidades.reduce((sum, singId) => {
      const sing = getMartialSchoolSingularityById(singId)
      return sum + (sing?.cost ?? 0)
    }, 0)

    const raciaisCost = singularidadesRaciais.reduce((sum, singId) => {
      const sing = getRacialSingularityById(singId)
      return sum + (sing?.cost || 0)
    }, 0)

    return criacaoCost + marciaisCost + raciaisCost
  }, [singularidades, singularidadesRaciais])

  const toggleSingularity = (id: string, isCreation: boolean = false) => {
    let singularity: any = null
    let cost = 0

    if (isCreation) {
      singularity = getCreationSingularityById(id)
      cost = singularity?.cost || 0
    } else {
      singularity = getSingularityById(id)
      cost = singularity?.cost || 0
    }

    if (!singularity) return

    const isSelected = singularidades.includes(id)
    
    if (isSelected) {
      // Remove: o useEffect recalculará o custo total automaticamente
      onSingularidadesChange(singularidades.filter(s => s !== id))
    } else {
      // Verifica requisitos (não pode ter desvantagens/singularidades conflitantes)
      if (isCreation && 'requirements' in singularity && singularity.requirements) {
        const hasConflict = requirementsConflictWithSelection(
          singularity.requirements,
          singularidades,
          selectedDisadvantages,
        )
        if (hasConflict) return
      }
      
      // Calcula o custo total atual incluindo singularidades de Ecoar
      const currentTotalCost = calculateTotalCost()
      
      // Verifica se tem PC suficiente
      if (pontosCriacao.disponiveis >= cost) {
        onSingularidadesChange([...singularidades, id])
        // O useEffect recalculará o custo total automaticamente
      }
    }
  }

  // Singularidades de Criação (vantagens)
  const criacaoSingularities = creationSingularities

  // Singularidades de Trilha (placeholder - pode ser expandido)
  const trilhaSingularities: Singularity[] = []

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-ecoar-light-900 mb-1">
              Gastando Pontos de Criação (Singularidades)
            </h3>
            <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70">
              Escolha singularidades para seu personagem
            </p>
          </div>
        </div>
        <div className={`mt-4 text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
          PC Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-ecoar-light-900/20 flex-wrap">
        {(['criacao', 'marciais', 'maestrias', 'raciais', 'trilha', 'ecoa'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                : 'text-slate-500 dark:text-ecoar-light-900/60 hover:text-slate-700 dark:text-ecoar-light-900/80'
            }`}
          >
            {tab === 'criacao' && 'Singularidades de Criação'}
            {tab === 'marciais' && 'Singularidades Marciais'}
            {tab === 'maestrias' && 'Maestrias'}
            {tab === 'raciais' && 'Singularidades Raciais'}
            {tab === 'trilha' && 'Singularidades de Trilha'}
            {tab === 'ecoa' && 'Ecoar'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'criacao' && (
          <div className="space-y-6">
            {/* Categorias de Singularidades de Criação */}
            {(['atributos', 'habilidades', 'genetica', 'talentos'] as const).map((category) => {
              const categorySingularities = getCreationSingularitiesByCategory(category)
              if (categorySingularities.length === 0) return null

              const categoryLabels: Record<typeof category, string> = {
                atributos: 'Atributos',
                habilidades: 'Habilidades',
                genetica: 'Genética',
                talentos: 'Talentos',
              }

              return (
                <div key={category} className="space-y-3">
                  <h5 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
                    {categoryLabels[category]}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categorySingularities.map((singularity) => {
                      const isSelected = singularidades.includes(singularity.id)
                      const canAfford = pontosDisponiveis >= singularity.cost
                      const hasConflict =
                        requirementsConflictWithSelection(
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
                          requirementsText={singularity.requirements && singularity.requirements.length > 0 ? `Não pode possuir: ${singularity.requirements.map(req => {
                            const dis = getDisadvantageById(req)
                            const sing = getSingularityById(req) || getCreationSingularityById(req)
                            return dis?.name || sing?.name || req
                          }).join(', ')}` : undefined}
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
          <MartialSingularitiesTab
            catalogType="escolas"
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
        )}

        {activeTab === 'maestrias' && (
          <MartialSingularitiesTab
            catalogType="maestrias"
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
        )}

        {activeTab === 'raciais' && (
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
        )}

        {activeTab === 'trilha' && (
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
        )}

        {activeTab === 'ecoa' && (
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
        )}
      </div>
    </div>
  )
}

// Ecoar Singularities List Component
