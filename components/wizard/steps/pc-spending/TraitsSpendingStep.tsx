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
import { AttributesStep } from '@/components/wizard/steps/AttributesStep'
import { AptitudesStep } from '@/components/wizard/steps/AptitudesStep'


export function TraitsSpendingStep({
  attributes,
  skills,
  aptitudes,
  pontosDisponiveis,
  raceBonuses,
  martialSchoolBonuses,
  onAttributesChange,
  onSkillsChange,
  onAptitudesChange,
}: {
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
  pontosDisponiveis: number
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
  onAttributesChange: (attrs: Record<string, number>) => void
  onSkillsChange: (skills: Record<string, { level: number; specialization?: string }>) => void
  onAptitudesChange: (apts: Record<string, number>) => void
}) {
  const [activeTab, setActiveTab] = useState<'atributos' | 'habilidades' | 'aptidoes'>('atributos')
  
  // Calcula o total de pontos base usados em todos os atributos
  const calculateTotalBasePoints = (attrs: Record<string, number>) => {
    return Object.entries(attrs).reduce((sum, [a, v]) => {
      const rB = raceBonuses[a] || 0
      const mB = martialSchoolBonuses[a] || 0
      const cB = 0 // TODO: Add class bonuses if needed
      const totalBonus = rB + mB + cB
      return sum + Math.max(0, v - totalBonus)
    }, 0)
  }

  // Calcula o total de pontos usados em aptidões
  const calculateAptitudeTotal = (apts: Record<string, number>) => {
    return Object.values(apts).reduce((sum, l) => sum + l, 0)
  }

  // Lógica para atualizar atributos com PC (10 PC por ponto além dos gratuitos); gastos são sincronizados no pai (currentStep === 5).
  const updateAttributeWithPC = (attr: string, newTotalValue: number) => {
    const attrKey = attr as keyof typeof attributes
    const oldValue = attributes[attrKey]
    const raceBonus = raceBonuses[attr] || 0
    const martialSchoolBonus = martialSchoolBonuses[attr] || 0
    const classBonus = 0 // TODO: Add class bonuses if needed
    const totalBonus = raceBonus + martialSchoolBonus + classBonus
    
    const maxTotalValue = 3 + totalBonus
    const newValue = Math.max(0, Math.min(maxTotalValue, newTotalValue))
    
    if (newValue === oldValue) return
    
    const oldTotalBase = calculateTotalBasePoints(attributes)
    const newAttributes = { ...attributes, [attr]: newValue }
    const newTotalBase = calculateTotalBasePoints(newAttributes)
    
    // Calcula pontos além dos 12 gratuitos
    const oldPointsOverFree = Math.max(0, oldTotalBase - 12)
    const newPointsOverFree = Math.max(0, newTotalBase - 12)
    const pointsOverFreeDiff = newPointsOverFree - oldPointsOverFree
    const costInPC = pointsOverFreeDiff * 10
    if (costInPC > 0 && pontosDisponiveis < costInPC) return
    onAttributesChange(newAttributes)
  }

  const handleAptitudesChange = (newAptitudes: Record<string, number>) => {
    onAptitudesChange(newAptitudes)
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Zap className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Gastando Pontos de Criação (Traços)
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Use Pontos de Criação para melhorar seus traços. Atributos custam 10 PC por ponto além do valor base. Aptidões custam 20 PC por ponto além dos 3 gratuitos.
            </p>
          </div>
        </div>
        <div className={`mt-3 text-base font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal/90' : 'text-ecoar-magenta/90'}`}>
          PC Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-ecoar-light-900/20">
        {(['atributos', 'habilidades', 'aptidoes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                : 'text-slate-500 dark:text-ecoar-light-900/60 hover:text-slate-700 dark:text-ecoar-light-900/80'
            }`}
          >
            {tab === 'atributos' && 'Atributos (10 PC por ponto)'}
            {tab === 'habilidades' && 'Habilidades'}
            {tab === 'aptidoes' && 'Aptidões (20 PC por ponto)'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'atributos' && (
          <AttributesStep
            attributes={attributes}
            attributePoints={0}
            pontosCriacao={{ obtidos: 0, gastos: 0, disponiveis: Math.max(0, pontosDisponiveis) }}
            onUpdate={updateAttributeWithPC}
            raceBonuses={raceBonuses}
            martialSchoolBonuses={martialSchoolBonuses}
            classBonuses={{}}
            onRandomize={() => {}}
            onPointsChange={() => {}} // Não usado, calculamos manualmente
            isEvolutionStep={true}
          />
        )}

        {activeTab === 'habilidades' && (
          <div className="text-center py-12 text-slate-500 dark:text-ecoar-light-900/60">
            <p>Funcionalidade de gastar PC em habilidades em desenvolvimento</p>
          </div>
        )}

        {activeTab === 'aptidoes' && (
          <AptitudesStep
            aptitudes={aptitudes}
            pontosCriacao={{ obtidos: 0, gastos: 0, disponiveis: Math.max(0, pontosDisponiveis) }}
            onAptitudesChange={handleAptitudesChange}
            onPointsChange={() => {}} // Não usado, calculamos manualmente
            aptitudePoints={Math.max(0, 3 - calculateAptitudeTotal(aptitudes))}
            onAptitudePointsChange={() => {}}
            isEvolutionStep={true}
          />
        )}
      </div>
    </div>
  )
}

// Singularities Step
