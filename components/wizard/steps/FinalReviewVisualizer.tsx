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
import type { CharacterCreationData } from '@/components/wizard/CharacterCreationWizard'
import { martialSchoolCreationLabel } from '@/components/wizard/shared/wizardHelpers'


export function FinalReviewVisualizer({
  data,
}: {
  data: Partial<CharacterCreationData>
}) {
  const { getEcoarById } = useEcoarCatalogData()
  const selectedRace = data.raca ? getRaceById(data.raca) : null
  const martialSchoolLabel = martialSchoolCreationLabel(data.escolaMarcial)
  const selectedPath = data.trilha ? getPathById(data.trilha) : null
  const selectedLocation = data.localizacao ? getLocationById(data.localizacao) : null
  const selectedEcoar = data.ecoar ? getEcoarById(data.ecoar) : null

  const reviewCardClasses =
    'p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40 dark:bg-ecoar-light-900/10 dark:border-ecoar-light-900/20 backdrop-blur-sm'

  return (
    <div className="space-y-8 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-2 font-serif">Revisão Final</h3>
        <p className="text-slate-600 dark:text-ecoar-light-900/70">Revise todas as escolhas do seu personagem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Informações Básicas</h4>
          <div className="space-y-2 text-sm">
            <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Nome:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{data.nome || 'Não definido'}</span></div>
            {selectedRace && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Raça:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedRace.name}</span></div>}
            {martialSchoolLabel && (
              <div>
                <span className="text-slate-500 dark:text-ecoar-light-900/60">Escola Marcial:</span>{' '}
                <span className="text-slate-900 dark:text-ecoar-light-900">{martialSchoolLabel.name}</span>
              </div>
            )}
            {selectedLocation && (
              <div>
                <span className="text-slate-500 dark:text-ecoar-light-900/60">Região:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedLocation.name}</span>
                {selectedLocation.nation && (
                  <div className="text-slate-400 dark:text-ecoar-light-900/50 text-xs mt-1 ml-4">{selectedLocation.nation}</div>
                )}
                {selectedLocation.region && (
                  <div className="text-ecoar-teal/70 text-xs mt-1 ml-4">{selectedLocation.region}</div>
                )}
              </div>
            )}
            {selectedPath && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Trilha:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedPath.name}</span></div>}
            {selectedEcoar && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Ecoar:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedEcoar.name}</span></div>}
          </div>
        </div>

        {/* Attributes Summary */}
        {data.attributes && (
          <div className={reviewCardClasses}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Atributos</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(data.attributes).map(([attr, value]) => (
                <div key={attr}>
                  <span className="text-slate-500 dark:text-ecoar-light-900/60 capitalize">{attr}:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Summary */}
        {data.skills && Object.keys(data.skills).length > 0 && (
          <div className={`md:col-span-2 ${reviewCardClasses}`}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Habilidades</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {Object.entries(data.skills).map(([skillId, skillData]) => {
                const skill = getSkillById(skillId)
                if (!skill || skillData.level === 0) return null
                return (
                  <div key={skillId}>
                    <span className="text-slate-500 dark:text-ecoar-light-900/60">{skill.name}:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{skillData.level}</span>
                    {skillData.specialization && (
                      <span className="text-ecoar-magenta/60 text-xs ml-1">({skillData.specialization})</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Background */}
        {(data.backstory || data.personalidade) && (
          <div className={`md:col-span-2 ${reviewCardClasses}`}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Background</h4>
            <div className="space-y-3 text-sm">
              {data.backstory && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">História:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{data.backstory}</span></div>}
              {data.personalidade && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Personalidade:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{data.personalidade}</span></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

