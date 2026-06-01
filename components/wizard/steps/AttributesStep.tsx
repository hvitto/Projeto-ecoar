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


export function AttributesStep({
  attributes,
  attributePoints,
  pontosCriacao,
  onUpdate,
  raceBonuses,
  martialSchoolBonuses,
  classBonuses,
  onRandomize,
  onPointsChange,
  isEvolutionStep = false,
}: {
  attributes: Record<string, number>
  attributePoints: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onUpdate: (attr: string, value: number) => void
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
  classBonuses?: Record<string, number>
  onRandomize: () => void
  onPointsChange: (gastos: number) => void
  isEvolutionStep?: boolean
}) {
  
  const attributeLabels: Record<string, string> = {
    carisma: 'Carisma',
    finesse: 'Finesse',
    forca: 'Força',
    inteligencia: 'Inteligência',
    percepcao: 'Percepção',
    vitalidade: 'Vitalidade',
    vontade: 'Vontade',
  }

  const attributeIcons: Record<string, any> = {
    carisma: Crown,
    finesse: Zap,
    forca: Hammer,
    inteligencia: Brain,
    percepcao: Eye,
    vitalidade: Heart,
    vontade: Shield,
  }

  const pcGastosEmAtributos = (() => {
    const totalBasePoints = Object.entries(attributes).reduce((sum, [attr, val]) => {
      const raceBonus = raceBonuses[attr] || 0
      const martialSchoolBonus = martialSchoolBonuses[attr] || 0
      const classBonus = 0 // TODO: Add class bonuses if needed - classBonuses?.[attr] || 0
      const totalBonus = raceBonus + martialSchoolBonus + classBonus
      return sum + Math.max(0, val - totalBonus)
    }, 0)
    const pointsOverFree = Math.max(0, totalBasePoints - 12)
    return pointsOverFree * 10
  })()

  // Descrições dos atributos
  const attributeDescriptions: Record<string, string> = {
    carisma: 'Representa sua capacidade de liderança, persuasão e influência social.',
    finesse: 'Agilidade e precisão. Afeta ações que requerem destreza e coordenação.',
    forca: 'Poder físico bruto. Afeta dano em combate corpo a corpo e capacidade de carga.',
    inteligencia: 'Capacidade mental, raciocínio e conhecimento. Essencial para magias e investigação.',
    percepcao: 'Atenção aos detalhes e consciência do ambiente. Afeta detecção e precisão.',
    vitalidade: 'Resistência física e saúde geral. Afeta pontos de vida e resistência a danos.',
    vontade: 'Força mental e determinação. Afeta resistência a efeitos mentais e controle.',
  }

  const [expandedAttribute, setExpandedAttribute] = useState<string | null>(null)

  // Valores e regras por atributo (para a lista compacta)
  const getAttributeRowData = (attr: string) => {
    const value = attributes[attr]
    const modifier = getAttributeModifier(value)
    const raceBonus = raceBonuses[attr] || 0
    const martialSchoolBonus = martialSchoolBonuses[attr] || 0
    const classBonus = 0
    const totalBonus = raceBonus + martialSchoolBonus + classBonus
    const baseValue = value - totalBonus
    const maxValue = (isEvolutionStep ? 8 : 3) + totalBonus
    const canDecrease = baseValue > 0
    const canIncrease = (() => {
      if (value >= maxValue) return false
      if (isEvolutionStep) {
        const currentTotalBase = Object.entries(attributes).reduce((sum, [a, v]) => {
          const rB = raceBonuses[a] || 0
          const mB = martialSchoolBonuses[a] || 0
          return sum + Math.max(0, v - (rB + mB + classBonus))
        }, 0)
        const newTotalBase = currentTotalBase - baseValue + (baseValue + 1)
        const currentPointsOverFree = Math.max(0, currentTotalBase - 12)
        const newPointsOverFree = Math.max(0, newTotalBase - 12)
        const costInPC = (newPointsOverFree - currentPointsOverFree) * 10
        if (costInPC <= 0) return true
        // disponiveis já reflete obtidos - gastos (incluindo PC já gasto em atributos)
        return pontosCriacao.disponiveis >= costInPC
      }
      return attributePoints > 0
    })()
    const pcCost = (() => {
      if (!isEvolutionStep) return 0
      const currentTotalBase = Object.entries(attributes).reduce((sum, [a, v]) => {
        const rB = raceBonuses[a] || 0
        const mB = martialSchoolBonuses[a] || 0
        return sum + Math.max(0, v - (rB + mB + classBonus))
      }, 0)
      const newTotalBase = currentTotalBase - baseValue + (baseValue + 1)
      const currentPointsOverFree = Math.max(0, currentTotalBase - 12)
      const newPointsOverFree = Math.max(0, newTotalBase - 12)
      return (newPointsOverFree - currentPointsOverFree) * 10
    })()
    return {
      value,
      modifier,
      raceBonus,
      martialSchoolBonus,
      totalBonus,
      baseValue,
      maxValue,
      canDecrease,
      canIncrease,
      pcCost,
      Icon: attributeIcons[attr] || Star,
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Zap className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              {isEvolutionStep ? 'Evoluir Atributos' : 'Atributos'}
            </h3>
            {!isEvolutionStep && (
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
                Você tem 12 pontos gratuitos para distribuir
              </p>
            )}
            {isEvolutionStep && (
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
                Melhore seus atributos gastando Pontos de Criação. Cada ponto além do valor base custa 10 PC.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Barra única: pontos restantes / PC + Aleatório (harmoniosa com a tabela de atributos) */}
      <div className="flex items-center justify-between py-2.5 px-4 mb-4 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 bg-ecoar-light-700/50 dark:bg-ecoar-light-900/[0.03]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-ecoar-light-900/60">
            {!isEvolutionStep ? 'Pontos restantes' : 'PC disponíveis'}
          </span>
          <span
            className={`text-xl font-bold tabular-nums ${
              !isEvolutionStep
                ? attributePoints >= 0
                  ? 'text-ecoar-teal-600 dark:text-ecoar-teal-400'
                  : 'text-ecoar-magenta-600 dark:text-ecoar-magenta-400'
                : pontosCriacao.disponiveis >= 0
                  ? 'text-ecoar-teal-600 dark:text-ecoar-teal-400'
                  : 'text-ecoar-magenta-600 dark:text-ecoar-magenta-400'
            }`}
          >
            {!isEvolutionStep ? attributePoints : pontosCriacao.disponiveis}
          </span>
        </div>
        {!isEvolutionStep && (
          <button
            type="button"
            onClick={onRandomize}
            className="flex items-center gap-2 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 px-3 py-2 text-sm font-medium text-slate-700 dark:text-ecoar-light-900/90 hover:bg-ecoar-teal/10 dark:hover:bg-ecoar-teal-600/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Aleatório
          </button>
        )}
      </div>

      {/* Bônus Aplicados */}
              {(Object.keys(raceBonuses).length > 0 || Object.keys(martialSchoolBonuses).length > 0) && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-2">Bônus aplicados automaticamente</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.keys(raceBonuses).length > 0 && (
              <div className="text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80">
                <span className="font-semibold text-ecoar-magenta dark:text-ecoar-magenta-400">Raça:</span> {Object.entries(raceBonuses).map(([attr, bonus]) => (
                  <span key={attr} className="ml-2 text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70">
                    {attributeLabels[attr]}: <span className="text-ecoar-teal dark:text-ecoar-teal-400">+{bonus}</span>
                  </span>
                ))}
              </div>
            )}
            {Object.keys(martialSchoolBonuses).length > 0 && (
              <div className="text-slate-700 dark:text-ecoar-light-900/80">
                <span className="font-semibold text-ecoar-teal">Escola Marcial:</span> {Object.entries(martialSchoolBonuses).map(([attr, bonus]) => (
                  <span key={attr} className="ml-2 text-slate-600 dark:text-ecoar-light-900/70">
                    {attributeLabels[attr]}: <span className="text-ecoar-teal">+{bonus}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista única de atributos (sem cards) */}
      <div className="rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 bg-ecoar-light-700/50 dark:bg-ecoar-light-900/[0.03] overflow-hidden">
        <div className={`grid gap-4 py-2 px-3 text-xs font-semibold text-slate-500 dark:text-ecoar-light-900/60 uppercase tracking-wider border-b border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 ${isEvolutionStep ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto]'}`}>
          <span>Atributo</span>
          <span className="text-center w-20">Valor</span>
          <span className="w-10 text-right">Mod</span>
          {isEvolutionStep && <span className="w-14 text-right">Custo</span>}
        </div>
        {Object.keys(attributes).map((attr) => {
          const row = getAttributeRowData(attr)
          const { Icon } = row
          const isExpanded = expandedAttribute === attr
          return (
            <div key={attr}>
              <div
                className={`grid gap-4 items-center py-2 px-3 border-b border-ecoar-dark-300/20 dark:border-ecoar-light-900/[0.06] ${isEvolutionStep ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto]'}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedAttribute((prev) => (prev === attr ? null : attr))}
                  className="flex items-center gap-3 min-w-0 w-full text-left bg-transparent border-0 cursor-pointer py-0 px-0 rounded"
                >
                  <div className="w-6 h-6 rounded-md bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3 h-3 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-ecoar-light-900 truncate">
                    {attributeLabels[attr]}
                  </span>
                  {row.totalBonus !== 0 && (
                    <span className="text-xs text-slate-500 dark:text-ecoar-light-900/50 flex-shrink-0">
                      +{row.totalBonus}
                    </span>
                  )}
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 ml-auto mr-1 text-slate-500 dark:text-ecoar-light-900/50"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>
                <div className="flex items-center gap-1.5 justify-center w-20">
                  <button
                    type="button"
                    onClick={() => row.canDecrease && onUpdate(attr, row.value - 1)}
                    disabled={!row.canDecrease}
                    className="w-8 h-8 rounded-full border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 hover:enabled:bg-ecoar-magenta/10 hover:enabled:border-ecoar-magenta/30 dark:hover:enabled:border-ecoar-magenta-500/40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-lg font-bold text-slate-900 dark:text-ecoar-light-900 w-6 text-center tabular-nums">
                    {row.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (row.canIncrease && row.value + 1 <= row.maxValue) onUpdate(attr, row.value + 1)
                    }}
                    disabled={!row.canIncrease}
                    className="w-8 h-8 rounded-full border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 hover:enabled:bg-ecoar-teal/10 hover:enabled:border-ecoar-teal/30 dark:hover:enabled:border-ecoar-teal-500/40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className={`text-sm font-semibold w-10 text-right tabular-nums ${row.modifier >= 0 ? 'text-ecoar-teal-600 dark:text-ecoar-teal-400' : 'text-slate-600 dark:text-ecoar-light-900/70'}`}>
                  {row.modifier >= 0 ? '+' : ''}{row.modifier}
                </span>
                {isEvolutionStep && (
                  <span className="text-xs text-slate-500 dark:text-ecoar-light-900/50 w-14 text-right">
                    {row.canIncrease && row.pcCost > 0 ? `${row.pcCost} PC` : '—'}
                  </span>
                )}
              </div>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mx-3 mb-2 mt-1 rounded-lg border border-ecoar-dark-300/25 dark:border-ecoar-light-900/15 bg-ecoar-light-800/80 dark:bg-ecoar-light-900/[0.06] px-3 py-2 text-xs leading-snug text-slate-600 dark:text-ecoar-light-900/80 shadow-sm line-clamp-3">
                      {attributeDescriptions[attr]}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

