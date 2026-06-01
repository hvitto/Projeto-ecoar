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
import { SingularitiesSpendingStep } from '@/components/wizard/steps/pc-spending/SingularitiesSpendingStep'
import { TraitsSpendingStep } from '@/components/wizard/steps/pc-spending/TraitsSpendingStep'


export function PCSpendingStep({
  singularidades,
  selectedEcoar,
  singularidadesEcoar,
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
  return (
    <div className="space-y-6">
      {/* Content based on active sub-step */}
      <div>
        {activeSubStep === 'singularidades' && (
          <SingularitiesSpendingStep
            singularidades={singularidades}
            selectedEcoar={selectedEcoar}
            singularidadesEcoar={singularidadesEcoar}
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
        )}

        {activeSubStep === 'traços' && (
          <TraitsSpendingStep
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
        )}

      </div>
    </div>
  )
}

// Gastando PC (Singularidades) Step
