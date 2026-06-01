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


export function EcoarSingularitiesList({
  selectedEcoar,
  singularidadesEcoar,
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
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  pontosDisponiveis: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const { getEcoarSingularitiesByEcoarId, getEcoarSingularityById } = useEcoarCatalogData()
  const ecoarSingularitiesList = selectedEcoar ? getEcoarSingularitiesByEcoarId(selectedEcoar) : []
  
  // O cálculo do custo total é feito pelo componente pai (SingularitiesSpendingStep)
  // através de um useEffect que monitora singularidadesEcoar

  // Valida todos os requisitos de uma singularidade
  const checkRequirements = useCallback((singularity: EcoarSingularity): { valid: boolean; missingReqs: string[] } => {
    const missingReqs: string[] = []
    
    if (!singularity.requirements) {
      return { valid: true, missingReqs: [] }
    }

    // Verifica singularidade anterior (ou ID do tipo de Ecoar, ex.: vampiro)
    if (singularity.requirements.previous) {
      if (
        !isEcoarPreviousRequirementMet(
          singularity.requirements.previous,
          singularidadesEcoar,
          selectedEcoar
        )
      ) {
        const prevSing = getEcoarSingularityById(singularity.requirements.previous!)
        missingReqs.push(`Requer: ${prevSing?.name || 'Singularidade anterior'}`)
      }
    }

    // Verifica nível de alma
    if (singularity.requirements.nivelAlma) {
      if (nivelAlma < singularity.requirements.nivelAlma) {
        missingReqs.push(`Requer Nível de Alma ${singularity.requirements.nivelAlma}+`)
      }
    }

    // Verifica atributos
    if (singularity.requirements.attributes) {
      Object.entries(singularity.requirements.attributes).forEach(([attr, minValue]) => {
        const currentValue = attributes[attr] || 0
        if (currentValue < minValue) {
          const attrName = attr.charAt(0).toUpperCase() + attr.slice(1)
          missingReqs.push(`Requer ${attrName} ${minValue}+`)
        }
      })
    }

    // Verifica habilidades
    if (singularity.requirements.skills) {
      Object.entries(singularity.requirements.skills).forEach(([skillId, minLevel]) => {
        const skill = skills[skillId]
        const currentLevel = skill?.level || 0
        if (currentLevel < minLevel) {
          const skillData = getSkillById(skillId)
          missingReqs.push(`Requer ${skillData?.name || skillId} nível ${minLevel}+`)
        }
      })
    }

    // Verifica aptidões
    if (singularity.requirements.aptitudes) {
      Object.entries(singularity.requirements.aptitudes).forEach(([aptId, minValue]) => {
        const currentValue = aptitudes[aptId] || 0
        if (currentValue < minValue) {
          const aptData = getAptitudeById(aptId)
          missingReqs.push(`Requer ${aptData?.name || aptId} ${minValue}+`)
        }
      })
    }

    return { valid: missingReqs.length === 0, missingReqs }
  }, [singularidadesEcoar, selectedEcoar, nivelAlma, attributes, skills, aptitudes])

  // Gera texto descritivo dos requisitos não atendidos
  const getRequirementText = useCallback((singularity: EcoarSingularity): string | undefined => {
    const { missingReqs } = checkRequirements(singularity)
    if (missingReqs.length === 0) return undefined
    return missingReqs.join(', ')
  }, [checkRequirements])

  const toggleSingularity = (id: string) => {
    const singularity = getEcoarSingularityById(id)
    if (!singularity) return

    const isSelected = singularidadesEcoar.includes(id)
    
    if (isSelected) {
      // Remove: o useEffect no componente pai recalculará o custo total automaticamente
      onSingularidadesEcoarChange(singularidadesEcoar.filter(s => s !== id))
    } else {
      // Verifica requisitos
      const { valid } = checkRequirements(singularity)
      if (!valid) return

      // Verifica se tem PC suficiente
      if (pontosCriacao.disponiveis >= singularity.cost) {
        onSingularidadesEcoarChange([...singularidadesEcoar, id])
        // O onPointsChange será chamado automaticamente pelo useEffect no componente pai
      }
    }
  }

  if (!ecoarSingularitiesList || ecoarSingularitiesList.length === 0) {
    return (
      <div>
        <h4 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900 mb-4">Singularidades do Ecoar</h4>
        <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm mb-4">
          Selecione singularidades específicas do seu Ecoar
        </p>
        <div className="p-4 bg-slate-50 dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20">
          <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">
            Este ecoar ainda não possui singularidades cadastradas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900 mb-2">Singularidades do Ecoar</h4>
        <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm mb-3">
          Selecione singularidades específicas do seu Ecoar
        </p>
        <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
          PC Disponíveis: {pontosDisponiveis}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ecoarSingularitiesList.map((singularity) => {
          const isSelected = singularidadesEcoar.includes(singularity.id)
          const { valid, missingReqs } = checkRequirements(singularity)
          const canAfford = pontosCriacao.disponiveis >= singularity.cost
          const canSelect = valid && (singularity.cost === 0 || canAfford)
          const requirementText = getRequirementText(singularity)
          
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
              onClick={() => toggleSingularity(singularity.id)}
              effects={singularity.effects}
              variant="teal"
              footer={
                requirementText ? (
                  <div className="text-xs text-ecoar-magenta dark:text-ecoar-magenta-400 mt-2 pt-2 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06]">
                    {requirementText}
                  </div>
                ) : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

// Martial Singularities Tab Component
