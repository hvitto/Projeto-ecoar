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


export function EvolutionStep({
  nivelAlmaInicial,
  pontosEvolucao,
}: {
  nivelAlmaInicial: number
  pontosEvolucao: number
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Sparkles className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Evolução do Personagem
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Você começou com Nível de Alma {nivelAlmaInicial}. Use seus {pontosEvolucao} Pontos de Evolução para adquirir singularidades ou evoluir traços.
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-lg border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 space-y-1.5">
            <p>
              <strong className="text-slate-900 dark:text-ecoar-light-900">Pontos de Evolução:</strong> Você possui {pontosEvolucao} Pontos de Evolução que podem ser gastos para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Evoluir Atributos (máximo nível 8)</li>
              <li>Evoluir Habilidades (máximo nível 8)</li>
              <li>Evoluir Aptidões (máximo nível 8)</li>
              <li>Adquirir Singularidades</li>
            </ul>
            <p className="mt-3">
              <strong className="text-slate-900 dark:text-ecoar-light-900">Nota:</strong> Os Pontos de Evolução são convertidos em Pontos de Criação (PC) na proporção de 1 PE = 10 PC. Você pode gastá-los nos steps anteriores ou guardá-los para usar durante o jogo.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="p-4 rounded-lg border bg-ecoar-teal/8 border-ecoar-teal/20">
        <div className="text-[11px] text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50 uppercase tracking-wider mb-1.5">Pontos de Evolução Disponíveis</div>
        <div className="text-xl font-semibold text-ecoar-teal/90 dark:text-ecoar-teal-400/90">{pontosEvolucao}</div>
        <div className="text-[11px] text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50 mt-1.5">
          Equivalente a {pontosEvolucao * 10} Pontos de Criação
        </div>
      </div>
    </div>
  )
}

// Physical Characteristics Step
