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


export function RacialSingularitiesTab({
  selectedRaca,
  singularidadesRaciais,
  onSingularidadesRaciaisChange,
  pontosDisponiveis,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedRaca: string
  singularidadesRaciais: string[]
  onSingularidadesRaciaisChange: (ids: string[]) => void
  pontosDisponiveis: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const race = selectedRaca ? getRaceById(selectedRaca) : null
  const racialList = selectedRaca ? getRacialSingularitiesByRaceId(selectedRaca) : []

  const toggleRacial = (id: string) => {
    const singularity = getRacialSingularityById(id)
    if (!singularity) return
    const isSelected = singularidadesRaciais.includes(id)
    if (isSelected) {
      onSingularidadesRaciaisChange(
        pruneRacialSingularitiesToValidRequirements(singularidadesRaciais.filter((s) => s !== id)),
      )
      return
    }
    const hasRequirements = (singularity.requirements ?? []).every((reqId) => singularidadesRaciais.includes(reqId))
    if (!hasRequirements) return
    if (pontosCriacao.disponiveis < singularity.cost) return
    onSingularidadesRaciaisChange([...singularidadesRaciais, id])
  }

  if (!selectedRaca || !race) {
    return (
      <div className="space-y-5">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
              <Users className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-0.5">
                Singularidades Raciais
              </h3>
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50">
                Selecione uma raça para ver singularidades disponíveis
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20">
          <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">
          Por favor, selecione uma raça na Etapa 1 para ver as singularidades raciais disponíveis.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">
                Singularidades Raciais - {race.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-0.5">
                Singularidades específicas da sua raça
              </p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal dark:text-ecoar-teal-400' : 'text-ecoar-magenta dark:text-ecoar-magenta-400'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {racialList.map((singularity) => {
          const isSelected = singularidadesRaciais.includes(singularity.id)
          const hasRequirements = (singularity.requirements ?? []).every((reqId) => singularidadesRaciais.includes(reqId))
          const canAfford = pontosCriacao.disponiveis >= singularity.cost
          const canSelect = isSelected || (hasRequirements && canAfford)
          return (
            <SingularityCard
              key={singularity.id}
              name={singularity.name}
              description={singularity.description}
              cost={singularity.cost}
              costLabel={singularity.cost === 0 ? undefined : 'PC'}
              secondaryCost={singularity.cost === 0 ? 'Inata' : undefined}
              isSelected={isSelected}
              canAfford={canAfford}
              canSelect={canSelect}
              onClick={() => toggleRacial(singularity.id)}
              effects={singularity.effects}
              requirementsText={!hasRequirements ? 'Requer talento racial anterior' : undefined}
              variant="teal"
            />
          )
        })}
      </div>
    </div>
  )
}

// Ecoar Selection Component
