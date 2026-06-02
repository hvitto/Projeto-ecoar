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


export function BackgroundStep({
  nome,
  backstory,
  tracoPositivo,
  tracoNegativo,
  personalidade,
  onNomeChange,
  onBackstoryChange,
  onTracoPositivoChange,
  onTracoNegativoChange,
  onPersonalidadeChange,
}: {
  nome: string
  backstory: string
  tracoPositivo: string
  tracoNegativo: string
  personalidade: string
  onNomeChange: (value: string) => void
  onBackstoryChange: (value: string) => void
  onTracoPositivoChange: (value: string) => void
  onTracoNegativoChange: (value: string) => void
  onPersonalidadeChange: (value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Background do Personagem</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Preencha as informações sobre seu personagem</p>
      </div>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome do personagem"
            className="w-full px-3 py-2 bg-white/[0.03] dark:bg-ecoar-dark-700/[0.03] border border-white/[0.08] dark:border-ecoar-light-900/[0.08] rounded-lg text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 placeholder-white/40 dark:placeholder-ecoar-light-900/40 focus:outline-none focus:ring-1 focus:ring-ecoar-teal/30 dark:focus:ring-ecoar-teal-500/30"
          />
        </div>

        {/* Backstory */}
        <div>
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">História/Background</label>
          <textarea
            value={backstory}
            onChange={(e) => onBackstoryChange(e.target.value)}
            placeholder="Conte a história do seu personagem..."
            rows={5}
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </div>

        {/* Personalidade */}
        <div>
          <label className="block text-slate-900 dark:text-ecoar-light-900 font-semibold mb-2">Personalidade</label>
          <textarea
            value={personalidade}
            onChange={(e) => onPersonalidadeChange(e.target.value)}
            placeholder="Como seu personagem age e reage..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traço Positivo */}
          <div>
            <label className="block text-slate-900 dark:text-ecoar-light-900 font-semibold mb-2">Traço Positivo</label>
            <input
              type="text"
              value={tracoPositivo}
              onChange={(e) => onTracoPositivoChange(e.target.value)}
              placeholder="Um traço positivo..."
              className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Traço Negativo */}
          <div>
            <label className="block text-slate-900 dark:text-ecoar-light-900 font-semibold mb-2">Traço Negativo</label>
            <input
              type="text"
              value={tracoNegativo}
              onChange={(e) => onTracoNegativoChange(e.target.value)}
              placeholder="Um traço negativo..."
              className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* FinalReviewVisualizer / FinalReviewStep não são montados no fluxo atual (o passo 7 usa só BackgroundStep).
 * A revisão com bônus de singularidades está na coluna lateral "Resumo". Se estes componentes voltarem ao fluxo,
 * reutilize a mesma agregação (aggregateSimpleBonuses / computeEffectiveAttributeRows) que o Resumo. */
// Final Review Visualizer (Read-only)
