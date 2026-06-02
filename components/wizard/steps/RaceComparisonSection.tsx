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


export function RaceComparisonSection({
  selectedRaca,
  onSelect,
}: {
  selectedRaca: string
  onSelect: (id: string) => void
}) {
  const selectedRace = selectedRaca ? getRaceById(selectedRaca) : null
  const otherRaces = selectedRaca ? races.filter(r => r.id !== selectedRaca) : []

  const attributeLabels: Record<string, string> = {
    carisma: 'Carisma',
    finesse: 'Finesse',
    forca: 'Força',
    inteligencia: 'Inteligência',
    percepcao: 'Percepção',
    vitalidade: 'Vitalidade',
    vontade: 'Vontade',
  }

  const getBonusesSummary = (race: Race) => {
    if (!race.bonuses) return []
    const summary: string[] = []
    
    // Atributos com formatação clara
    if (race.bonuses.attributes) {
      Object.entries(race.bonuses.attributes).forEach(([attr, value]) => {
        const label = attributeLabels[attr] || attr
        const sign = value >= 0 ? '+' : ''
        summary.push(`${label} ${sign}${value}`)
      })
    }
    
    if (race.bonuses.skills) {
      Object.keys(race.bonuses.skills).forEach((skill) => {
        summary.push(`Habilidade: ${skill}`)
      })
    }
    
    // Limites com formatação clara
    if (race.bonuses.corpo) {
      const sign = race.bonuses.corpo >= 0 ? '+' : ''
      summary.push(`Corpo ${sign}${race.bonuses.corpo}`)
    }
    if (race.bonuses.mente) {
      const sign = race.bonuses.mente >= 0 ? '+' : ''
      summary.push(`Mente ${sign}${race.bonuses.mente}`)
    }
    if (race.bonuses.folego) {
      const sign = race.bonuses.folego >= 0 ? '+' : ''
      summary.push(`Fôlego ${sign}${race.bonuses.folego}`)
    }
    if (race.bonuses.mana) {
      const sign = race.bonuses.mana >= 0 ? '+' : ''
      summary.push(`Mana ${sign}${race.bonuses.mana}`)
    }
    
    // Deslocamentos com nomes completos
    if (race.bonuses.movement) {
      if (race.bonuses.movement.terrestre) summary.push(`Terrestre: ${race.bonuses.movement.terrestre}m`)
      if (race.bonuses.movement.aquatico) summary.push(`Aquático: ${race.bonuses.movement.aquatico}m`)
      if (race.bonuses.movement.aereo) summary.push(`Aéreo: ${race.bonuses.movement.aereo}m`)
    }
    
    // Sentidos com nomes completos
    if (race.bonuses.senses) {
      if (race.bonuses.senses.visao) summary.push(`Visão: ${race.bonuses.senses.visao}m`)
      if (race.bonuses.senses.audicao) summary.push(`Audição: ${race.bonuses.senses.audicao}m`)
      if (race.bonuses.senses.olfato) summary.push(`Olfato: ${race.bonuses.senses.olfato}m`)
    }
    
    return summary
  }

  if (!selectedRace || otherRaces.length === 0) return null

  const selectedBonuses = getBonusesSummary(selectedRace)

  const getBonusType = (bonus: string): string => {
    if (bonus.includes('Skill:')) return 'skill'
    if (bonus.includes('Corpo')) return 'corpo'
    if (bonus.includes('Mente')) return 'mente'
    if (bonus.includes('Fôlego')) return 'folego'
    if (bonus.includes('Mana')) return 'mana'
    if (bonus.includes('Mov:') || bonus.includes('Aqu:') || bonus.includes('Aer:')) return 'movement'
    if (bonus.includes('Vis:') || bonus.includes('Aud:') || bonus.includes('Olf:')) return 'senses'
    return 'attribute'
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-5 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 mt-5"
    >
      <div className="bg-ecoar-light-700 dark:bg-ecoar-dark-800 rounded-xl p-3 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
          <h3 className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">
            Comparar com outras Raças
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        {otherRaces.slice(0, 6).map((otherRace, index) => {
          const otherBonuses = getBonusesSummary(otherRace)
          
          const hasDifferentBonuses = otherBonuses.some(otherBonus => {
            if (selectedBonuses.includes(otherBonus)) return false
            const otherType = getBonusType(otherBonus)
            const hasSameTypeInSelected = selectedBonuses.some(selBonus => {
              return getBonusType(selBonus) === otherType
            })
            return !hasSameTypeInSelected
          })
          
          return (
            <motion.button
              key={otherRace.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(otherRace.id)}
              whileHover={{ y: -2 }}
              className="relative p-2.5 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 bg-ecoar-light-700 dark:bg-ecoar-dark-800 hover:bg-ecoar-light-800 dark:hover:bg-ecoar-dark-700 hover:border-ecoar-teal-400 dark:hover:border-ecoar-teal-500/40 transition-all text-left"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="w-3.5 h-3.5 text-ecoar-dark-500 dark:text-ecoar-light-900/60" />
                <h5 className="text-xs font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900/90">
                  {otherRace.name}
                </h5>
              </div>
              
              {otherBonuses.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {otherBonuses.slice(0, 2).map((bonus, idx) => {
                    const bonusType = getBonusType(bonus)
                    const isExactMatch = selectedBonuses.includes(bonus)
                    const hasSameTypeInSelected = selectedBonuses.some(selBonus => {
                      return getBonusType(selBonus) === bonusType
                    })
                    const isDifferent = !isExactMatch && !hasSameTypeInSelected
                    
                    return (
                      <span
                        key={idx}
                        className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${
                          isDifferent
                            ? 'bg-ecoar-magenta-100 dark:bg-ecoar-magenta-700/90 text-ecoar-magenta-700 dark:text-ecoar-light-900 border-ecoar-magenta-300 dark:border-ecoar-magenta-500'
                            : 'bg-ecoar-light-800 dark:bg-ecoar-light-900/10 text-ecoar-dark-500 dark:text-ecoar-light-900/60 border-ecoar-dark-300/30 dark:border-ecoar-light-900/20'
                        }`}
                      >
                        {bonus}
                      </span>
                    )
                  })}
                  {otherBonuses.length > 2 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-ecoar-light-800 dark:bg-ecoar-light-900/10 text-ecoar-dark-400 dark:text-ecoar-light-900/50 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20" title={`Mais ${otherBonuses.length - 2} bônus`}>
                      +{otherBonuses.length - 2} bônus
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-ecoar-dark-400 dark:text-ecoar-light-900/40 mt-2">Sem bônus especiais</p>
              )}
              
              {hasDifferentBonuses && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-ecoar-magenta-600 dark:bg-ecoar-magenta-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </motion.button>
          )
        })}
        </div>
        <p className="text-xs text-ecoar-dark-500 dark:text-ecoar-light-900/50 mt-1.5 flex items-center gap-2">
          <Eye className="w-3 h-3 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
          <span>Bônus em rosa indicam diferenças em relação à raça selecionada</span>
        </p>
      </div>
    </motion.div>
  )
}

// Componente de Seleção de Nível de Alma Inicial
