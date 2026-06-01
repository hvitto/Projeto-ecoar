'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { fadeInUp, motionTransition } from '@/lib/motionVariants'
import {
  Briefcase, MapPin, Users, Route, Zap, Sword, Sparkles, Gem,
  Package, Calculator, BookOpen, User, ChevronLeft, ChevronRight, ChevronDown,
  CheckCircle2, Circle, Target, Award, Sparkle, Shield, ScrollText,
  Skull, Heart, Brain, Eye, Footprints, Wand2, Dices, RefreshCw,
  Scroll, Crown, Coins, Hammer, Map, Globe, Star, Waves, Info, X, ExternalLink
} from 'lucide-react'
import { Button, Card, Badge, SectionHeader, SelectableCard, Input, Textarea } from '@/components/ui'
import SingularityCard from '@/components/ui/SingularityCard'
import SelectionCard from '@/components/ui/SelectionCard'
import InfoCard from '@/components/ui/InfoCard'
import DisadvantageCard from '@/components/ui/DisadvantageCard'
import RaceCard from '@/components/ui/RaceCard'
import RaceImage from '@/components/ui/RaceImage'
import StatCard from '@/components/ui/StatCard'
import LimitCard from '@/components/ui/LimitCard'
import MovementCard from '@/components/ui/MovementCard'
import SenseCard from '@/components/ui/SenseCard'
import SummaryItem from '@/components/ui/SummaryItem'
import MartialSchoolCard from '@/components/ui/MartialSchoolCard'
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
import type { CatalogEntry, CatalogOwnedItem } from '@/types/equipment'
import EquipmentCatalogBrowser from '@/components/equipment/EquipmentCatalogBrowser'
import { useEquipmentCatalog } from '@/contexts/EquipmentCatalogContext'
import { catalogDisplayLine, formatCerosDisplay, newCatalogInstanceId, sumCatalogItemsCeros } from '@/lib/equipmentCost'
import { MartialSchoolSingularitiesPurchase } from '@/components/wizard/steps/pc-spending/MartialSchoolSingularitiesPurchase'


export function MartialSchoolPCSpendingStep({
  selectedEscolaMarcial,
  onSelect,
  singularidadesMarciais,
  onSingularidadesChange,
  pontosDisponiveis,
  onPointsChange,
  nivelAlma,
}: {
  selectedEscolaMarcial: string
  onSelect: (id: string) => void
  singularidadesMarciais: string[]
  onSingularidadesChange: (singularidades: string[]) => void
  pontosDisponiveis: number
  onPointsChange: (gastos: number) => void
  nivelAlma: number
}) {
  const allMartialSchools = getAllMartialSchools()
  const [showSingularities, setShowSingularities] = useState(false)
  
  // SEMPRE buscar a escola (mesmo que seja null) - hooks devem vir antes de retornos condicionais
  const school = selectedEscolaMarcial ? getMartialSchoolDataByIdResolved(selectedEscolaMarcial) : null

  // Calcula pontos gastos usando custo oficial direto em PC
  // Só calcula se tiver escola selecionada
  const pontosGastos = school ? singularidadesMarciais.reduce((sum, singId) => {
    const sing = school.singularities.find(s => s.id === singId)
    return sum + (sing ? sing.cost : 0)
  }, 0) : 0

  // Atualiza pontos gastos quando singularidades mudam
  // SEMPRE chama useEffect (mas retorna cedo se não tiver school)
  useEffect(() => {
    if (!selectedEscolaMarcial || !school) {
      onPointsChange(0)
      return
    }
    const total = singularidadesMarciais.reduce((sum, singId) => {
      const sing = school.singularities.find(s => s.id === singId)
      return sum + (sing ? sing.cost : 0)
    }, 0)
    onPointsChange(total)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singularidadesMarciais, selectedEscolaMarcial])
  
  // Se não tem escola selecionada, mostra a seleção
  if (!selectedEscolaMarcial) {
    return (
      <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
              <Sword className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
                Gastando PC (Escola Marcial)
              </h3>
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
                Escolha sua escola marcial e compre singularidades com Pontos de Criação
              </p>
            </div>
          </div>
          <div className={`mt-3 text-base font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal/90 dark:text-ecoar-teal-400/90' : 'text-ecoar-magenta/90 dark:text-ecoar-magenta-400/90'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMartialSchools.map((school, index) => (
            <motion.button
              key={school.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                onSelect(school.id)
                setShowSingularities(false) // Reset quando seleciona nova escola
              }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] bg-ecoar-light-700 dark:bg-ecoar-light-900/[0.03] hover:bg-ecoar-light-800 dark:hover:bg-ecoar-light-900/[0.06] hover:border-ecoar-teal-400 dark:hover:border-ecoar-teal-500/30 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-ecoar-light-900/90">
                    {school.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-ecoar-light-900/60">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-ecoar-light-900/20">{school.class}</span>
                    <span>{school.aptitude}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-3 text-slate-600 dark:text-ecoar-light-900/60">
                {school.description}
              </p>
              <div className="space-y-1 text-xs text-slate-500 dark:text-ecoar-light-900/50">
                <div><span className="font-medium">Ferramenta:</span> {school.tool}</div>
                <div className="mt-2">
                  <span className="font-medium">{school.singularities.length} singularidades</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Se tem escola selecionada, mostra painel de detalhes
  if (!school) return null

  // Se está na sub-etapa de singularidades, mostra apenas a compra
  if (showSingularities) {
    return (
      <MartialSchoolSingularitiesPurchase
        escolaMarcial={school}
        singularidadesMarciais={singularidadesMarciais}
        onSingularidadesChange={onSingularidadesChange}
        pontosDisponiveis={pontosDisponiveis}
        onPointsChange={onPointsChange}
        nivelAlma={nivelAlma}
        onBack={() => setShowSingularities(false)}
      />
    )
  }

  const currentIndex = allMartialSchools.findIndex(s => s.id === selectedEscolaMarcial)

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelect(allMartialSchools[currentIndex - 1].id)
    } else {
      onSelect(allMartialSchools[allMartialSchools.length - 1].id)
    }
  }

  const handleNext = () => {
    if (currentIndex < allMartialSchools.length - 1) {
      onSelect(allMartialSchools[currentIndex + 1].id)
    } else {
      onSelect(allMartialSchools[0].id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 flex flex-col h-full"
    >
      {/* Header com PC Disponíveis */}
      <div className="border-b border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onSelect('')}
            className="flex items-center gap-2 text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:text-ecoar-light-900 dark:hover:text-ecoar-light-900 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para seleção
          </button>
          
          {/* Navegação por Setas */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handlePrevious}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 dark:hover:bg-ecoar-light-900/15 border border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:text-ecoar-light-900 dark:hover:text-ecoar-light-900 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <span className="text-xs text-slate-500 dark:text-ecoar-light-900/60 px-2">
              {currentIndex + 1} / {allMartialSchools.length}
            </span>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 dark:hover:bg-ecoar-light-900/15 border border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:text-ecoar-light-900 dark:hover:text-ecoar-light-900 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center">
              <Sword className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white dark:text-ecoar-light-900">{school.name}</h3>
              <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 mt-0.5">Gastando PC (Escola Marcial)</p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal dark:text-ecoar-teal-400' : 'text-ecoar-magenta dark:text-ecoar-magenta-400'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>
        <p className="text-sm text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 leading-relaxed mt-3">
          {school.description}
        </p>
      </div>

      {/* Layout em 2 colunas: PNG à esquerda | INFO + SINGULARIDADES à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {/* Lado Esquerdo - Espaço para PNG */}
        <div className="space-y-4">
          <div className="bg-ecoar-light-800/80 dark:bg-ecoar-light-900/10 rounded-xl border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 p-6 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-ecoar-dark-400 dark:text-ecoar-light-900/40 text-sm">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-ecoar-dark-300 dark:text-ecoar-light-900/30 text-xs">Imagem PNG aqui</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - INFO + SINGULARIDADES */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-ecoar-light-800/50 dark:bg-ecoar-light-900/[0.03] rounded-lg p-4 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08]">
            <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-3">{school.name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60">Classe:</span>
                <span className="text-white dark:text-ecoar-light-900 ml-2">{school.class}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60">Aptidão:</span>
                <span className="text-white dark:text-ecoar-light-900 ml-2">{school.aptitude}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60">Ferramenta:</span>
                <span className="text-white dark:text-ecoar-light-900 ml-2 text-xs">{school.tool}</span>
              </div>
            </div>
            {school.toolNote && (
              <p className="text-xs text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 bg-ecoar-magenta-900/50 dark:bg-ecoar-magenta-800/70 px-3 py-2 rounded border border-ecoar-magenta-700/50 dark:border-ecoar-magenta-600/50 italic mt-2">↪ {school.toolNote}</p>
            )}
          </div>

          {/* Botão para ir para compra de singularidades */}
          <div className="bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 rounded-xl p-5 border border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white dark:text-ecoar-light-900 mb-1">Singularidades</h4>
                <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60">
                  {school.singularities.length} singularidades disponíveis para compra
                </p>
              </div>
              <motion.button
                onClick={() => setShowSingularities(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 hover:bg-ecoar-teal/30 dark:hover:bg-ecoar-teal-600/30 border border-ecoar-teal/50 dark:border-ecoar-teal-500/50 text-ecoar-teal dark:text-ecoar-teal-400 rounded-lg font-semibold text-sm transition-all"
              >
                Comprar Singularidades
              </motion.button>
            </div>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Custo oficial em PC | PC Disponíveis: {pontosDisponiveis}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Navegação Rápida - Ícones das Escolas */}
      <div className="border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider">
            Navegação Rápida
          </span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {allMartialSchools.map((s) => {
            const isActive = s.id === selectedEscolaMarcial
            return (
              <motion.button
                key={s.id}
                onClick={() => onSelect(s.id)}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-2 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 border-ecoar-teal dark:border-ecoar-teal-500 shadow-lg shadow-ecoar-teal/30 dark:shadow-ecoar-teal-600/30'
                    : 'bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/50 dark:hover:border-ecoar-teal-500/50'
                }`}
                title={s.name}
              >
                <Sword className={`w-5 h-5 ${isActive ? 'text-ecoar-teal' : 'text-slate-500 dark:text-ecoar-light-900/60'}`} />
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-teal-600 dark:bg-ecoar-teal-400 rounded-full border-2 border-white dark:border-ecoar-dark-900"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

