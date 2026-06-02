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
import { attributeIconsMap, attributeLabelsShort } from '@/components/wizard/shared/attributeMaps'


export function BonusDetailsPanel({ bonuses }: { bonuses: any }) {
  if (!bonuses) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-teal-50 dark:bg-ecoar-teal-600/8 border border-teal-200 dark:border-ecoar-teal-500/20 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-teal-600 dark:text-ecoar-teal-400" />
        <h5 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 uppercase tracking-wider">
          Bônus Detalhados
        </h5>
      </div>

      {/* Bônus de Atributos */}
      {bonuses.attributes && Object.keys(bonuses.attributes).length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Atributos
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(bonuses.attributes).map(([attr, value]) => {
              const Icon = attributeIconsMap[attr] || Star
              const bonusValue = value as number
              return (
                <div key={attr} className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                  <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                  <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">
                    {attributeLabelsShort[attr] || attr}
                  </span>
                  <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{bonusValue}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bônus de Skills */}
      {bonuses.skills && Object.keys(bonuses.skills).length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Habilidades
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(bonuses.skills).map(([skill, value]) => {
              const skillBonusValue = value as number
              return (
                <div key={skill} className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                  <Sword className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                  <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 capitalize">
                    {skill}
                  </span>
                  <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{skillBonusValue}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Outros Bônus */}
      {(bonuses.corpo || bonuses.mente || bonuses.folego || bonuses.mana) && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Limites
          </div>
          <div className="flex flex-wrap gap-2">
            {bonuses.corpo && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Heart className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Corpo</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{bonuses.corpo}</span>
              </div>
            )}
            {bonuses.mente && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Brain className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Mente</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{bonuses.mente}</span>
              </div>
            )}
            {bonuses.folego && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Waves className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Fôlego</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{bonuses.folego}</span>
              </div>
            )}
            {bonuses.mana && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">Mana</span>
                <span className="text-sm font-bold text-teal-600 dark:text-ecoar-teal-400">+{bonuses.mana}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movimento (para raças) */}
      {bonuses.movement && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Movimento
          </div>
          <div className="flex flex-wrap gap-2">
            {bonuses.movement.terrestre && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Footprints className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Terrestre</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.movement.terrestre}m</span>
              </div>
            )}
            {bonuses.movement.aquatico && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Waves className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Aquático</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.movement.aquatico}m</span>
              </div>
            )}
            {bonuses.movement.aereo && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Zap className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Aéreo</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.movement.aereo}m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sentidos (para raças) */}
      {bonuses.senses && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Sentidos
          </div>
          <div className="flex flex-wrap gap-2">
            {bonuses.senses.visao !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Eye className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Visão</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.senses.visao}m</span>
              </div>
            )}
            {bonuses.senses.audicao !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Users className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Audição</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.senses.audicao}m</span>
              </div>
            )}
            {bonuses.senses.olfato !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Star className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Olfato</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.senses.olfato}m</span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Componente de Comparação Rápida para Raças
