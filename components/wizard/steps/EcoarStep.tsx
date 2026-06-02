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


export function EcoarStep({
  selectedEcoar,
  singularidadesEcoar,
  onEcoarSelect,
  onSingularidadesChange,
}: {
  selectedEcoar: string
  singularidadesEcoar: string[]
  onEcoarSelect: (id: string) => void
  onSingularidadesChange: (singularidades: string[]) => void
}) {
  const { playableEcoarTypes } = useEcoarCatalogData()
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Ecoar</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Selecione seu Ecoar e suas singularidades</p>
      </div>

      {/* Ecoar Selection */}
      <div>
        <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-3">Tipo de Ecoar</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playableEcoarTypes.map((ecoa) => (
            <button
              key={ecoa.id}
              onClick={() => onEcoarSelect(ecoa.id)}
              className={`p-4 rounded-lg border transition-all transform hover:scale-101 text-left ${
                selectedEcoar === ecoa.id
                  ? 'border-ecoar-teal/60 bg-ecoar-teal/15 shadow-lg shadow-ecoar-teal/10'
                  : 'border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] hover:border-ecoar-teal/30 dark:hover:border-ecoar-teal-500/30 hover:bg-white/[0.06] dark:hover:bg-ecoar-light-900/[0.06]'
              }`}
            >
              <div className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg">{ecoa.name}</div>
              <p className="text-slate-600 dark:text-ecoar-light-900/70 text-sm mt-2">{ecoa.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Ecoar Singularities - Placeholder */}
      {selectedEcoar && (
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-4">Singularidades do Ecoar</h4>
          <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">Selecione singularidades específicas do seu Ecoar</p>
          <div className="mt-4 p-4 bg-gray-800/40 rounded-lg border border-ecoar-dark/50">
            <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">Funcionalidade em desenvolvimento...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Creation Points Step
