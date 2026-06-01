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
import { EcoarSingularitiesList } from '@/components/wizard/steps/pc-spending/EcoarSingularitiesList'


export function EcoarSelection({
  selectedEcoar,
  singularidadesEcoar,
  onEcoarSelect,
  onSingularidadesEcoarChange,
  pontosDisponiveis,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedEcoar: string
  singularidadesEcoar: string[]
  onEcoarSelect: (id: string) => void
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  pontosDisponiveis: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const { playableEcoarTypes } = useEcoarCatalogData()
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900 mb-4">Tipo de Ecoar</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playableEcoarTypes.map((ecoa) => (
            <motion.button
              key={ecoa.id}
              onClick={() => onEcoarSelect(ecoa.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                selectedEcoar === ecoa.id
                  ? 'border-ecoar-teal bg-ecoar-teal/20 shadow-lg shadow-ecoar-teal/30'
                  : 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15'
              }`}
            >
              <div className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg">{ecoa.name}</div>
              <p className="text-slate-600 dark:text-ecoar-light-900/70 text-sm mt-2">{ecoa.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedEcoar && <EcoarSingularitiesList 
        selectedEcoar={selectedEcoar}
        singularidadesEcoar={singularidadesEcoar}
        onSingularidadesEcoarChange={onSingularidadesEcoarChange}
        pontosDisponiveis={pontosDisponiveis}
        pontosCriacao={pontosCriacao}
        nivelAlma={nivelAlma}
        attributes={attributes}
        skills={skills}
        aptitudes={aptitudes}
      />}
    </div>
  )
}

// Gastando PC (Traços) Step
