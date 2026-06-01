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


export function SingularitiesStep({
  singularidades,
  pontosDisponiveis,
  onSingularidadesChange,
  onPointsChange,
}: {
  singularidades: string[]
  pontosDisponiveis: number
  onSingularidadesChange: (singularidades: string[]) => void
  onPointsChange: (gastos: number) => void
}) {
  const toggleSingularity = (id: string) => {
    const singularity = getSingularityById(id)
    if (!singularity) return

    const isSelected = singularidades.includes(id)
    if (isSelected) {
      onSingularidadesChange(singularidades.filter(s => s !== id))
      onPointsChange(pontosDisponiveis + singularity.cost)
    } else {
      if (pontosDisponiveis >= singularity.cost) {
        onSingularidadesChange([...singularidades, id])
        onPointsChange(pontosDisponiveis - singularity.cost)
      }
    }
  }

  const categories: Singularity['category'][] = ['evolucao', 'talento', 'infusao', 'adaptacao', 'fragil', 'mente-prodigiosa', 'fisica-prodiga']
  const categoryLabels: Record<Singularity['category'], string> = {
    evolucao: 'Evolução',
    talento: 'Talento',
    infusao: 'Infusão',
    adaptacao: 'Adaptação',
    fragil: 'Frágil',
    'mente-prodigiosa': 'Mente Prodigiosa',
    'fisica-prodiga': 'Física Pródiga',
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Singularidades</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Escolha singularidades para seu personagem</p>
        <div className={`mt-2 text-base font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal/90' : 'text-red-400/90'}`}>
          Pontos Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {categories.map((category) => {
        const categorySingularities = getSingularitiesByCategory(category)
        if (categorySingularities.length === 0) return null

        return (
          <div key={category} className="space-y-3">
            <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 border-b border-white/[0.06] dark:border-ecoar-light-900/[0.06] pb-1.5">
              {categoryLabels[category]}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categorySingularities.map((singularity) => {
                const isSelected = singularidades.includes(singularity.id)
                const canAfford = pontosDisponiveis >= singularity.cost
                return (
                  <SingularityCard
                    key={singularity.id}
                    name={singularity.name}
                    description={singularity.description}
                    cost={singularity.cost}
                    isSelected={isSelected}
                    canAfford={canAfford}
                    canSelect={canAfford}
                    onClick={() => toggleSingularity(singularity.id)}
                    requirements={singularity.requirements}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Ecoar Step
