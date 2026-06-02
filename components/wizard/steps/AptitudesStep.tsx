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


export function AptitudesStep({
  aptitudes,
  pontosCriacao,
  onAptitudesChange,
  onPointsChange,
  aptitudePoints,
  onAptitudePointsChange,
  isEvolutionStep = false,
}: {
  aptitudes: Record<string, number>
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onAptitudesChange: (aptitudes: Record<string, number>) => void
  onPointsChange: (gastos: number) => void
  aptitudePoints: number
  onAptitudePointsChange: (points: number) => void
  isEvolutionStep?: boolean
}) {
  const getMaxLevel = () => isEvolutionStep ? 8 : 3
  
  // Calcula quantos pontos gratuitos foram gastos
  const calculateFreePointsUsed = () => {
    return Object.values(aptitudes).reduce((sum, level) => sum + level, 0)
  }
  
  // Calcula quantos PC foram gastos (apenas pontos além dos 3 gratuitos)
  const calculatePCUsed = () => {
    const totalLevels = calculateFreePointsUsed()
    const pointsOverFree = Math.max(0, totalLevels - 3)
    return pointsOverFree * 20
  }
  
  const updateAptitude = (aptitudeId: string, level: number) => {
    const currentLevel = aptitudes[aptitudeId] || 0
    const maxLevel = getMaxLevel()
    
    // Não permite nível negativo ou acima do máximo individual
    if (level < 0 || level > maxLevel) return
    
    // Calcula o total de pontos usados antes e depois
    const currentTotal = calculateFreePointsUsed()
    const newTotal = currentTotal - currentLevel + level
    
    // Calcula pontos além dos 3 gratuitos
    const oldPointsOverFree = Math.max(0, currentTotal - 3)
    const newPointsOverFree = Math.max(0, newTotal - 3)
    const pointsOverFreeDiff = newPointsOverFree - oldPointsOverFree
    const costInPC = pointsOverFreeDiff * 20
    
    // Se está dentro dos 3 pontos gratuitos
    if (newTotal <= 3) {
      // Verifica se está aumentando
      if (level > currentLevel) {
        const pointsNeeded = level - currentLevel
        
        // Se não tem pontos gratuitos suficientes
        if (aptitudePoints < pointsNeeded) {
          // Na evolução (etapa de gastar PC), permite reconstruir/redistribuir
          // aptidões dentro dos 3 pontos sem depender de aptitudePoints local.
          if (isEvolutionStep) {
            onAptitudesChange({
              ...aptitudes,
              [aptitudeId]: level,
            })
            onAptitudePointsChange(3 - newTotal)
          }
          return
        }
      } else if (level < currentLevel) {
        // Está diminuindo - libera PC se houver
        if (isEvolutionStep && costInPC < 0) {
          onAptitudesChange({
            ...aptitudes,
            [aptitudeId]: level,
          })
          onAptitudePointsChange(3 - newTotal)
          return
        }
      }
      
      // Redistribuição normal ou aumento com pontos gratuitos disponíveis
      onAptitudesChange({
        ...aptitudes,
        [aptitudeId]: level,
      })
      onAptitudePointsChange(3 - newTotal)
    }
    // Se vai além dos 3 pontos gratuitos, só permite na evolução com PC
    else {
      // Na criação, não permite passar dos 3 pontos gratuitos
      if (!isEvolutionStep) return
      
      // Na evolução, permite usar PC (20 PC por ponto além dos 3 gratuitos)
      if (level > currentLevel) {
        // Verifica se tem PC suficiente
        if (pontosCriacao.disponiveis < costInPC) return
        
        onAptitudesChange({
          ...aptitudes,
          [aptitudeId]: level,
        })
        onAptitudePointsChange(0) // Já gastou todos os pontos gratuitos
      } else if (level < currentLevel) {
        // Está diminuindo, libera PC
        const newFreeUsed = Math.min(3, newTotal)
        
        onAptitudesChange({
          ...aptitudes,
          [aptitudeId]: level,
        })
        onAptitudePointsChange(3 - newFreeUsed)
      }
    }
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Award className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              {isEvolutionStep ? 'Evoluir Aptidões' : 'Aptidões'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Você tem 3 pontos gratuitos para distribuir
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className={`p-3.5 rounded-lg border transition-all ${
          aptitudePoints >= 0 
            ? 'bg-ecoar-teal/10 border-ecoar-teal/30 text-slate-900 dark:text-ecoar-light-900' 
            : 'bg-ecoar-magenta/10 border-ecoar-magenta/30 text-slate-900 dark:text-ecoar-light-900'
        }`}>
          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">Pontos Gratuitos</div>
          <div className={`text-2xl font-bold ${aptitudePoints >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
            {aptitudePoints}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aptitudesData.map((aptitude) => {
          const level = aptitudes[aptitude.id] || 0
          const dice = getSkillDice(level)
          const maxLevel = getMaxLevel()
          const totalPointsUsed = Object.values(aptitudes).reduce((sum, l) => sum + l, 0)
          const newTotalIfIncrease = totalPointsUsed - level + (level + 1)
          
          // Só pode aumentar se:
          // 1. Não atingiu o máximo individual (3 na criação, 8 na evolução)
          // 2. Tem pontos gratuitos disponíveis OU (na evolução) tem PC suficiente
          // 3. O novo total não excede 3 pontos gratuitos OU (na evolução) tem PC para o excedente
          let canIncrease = false
          if (level >= maxLevel) {
            canIncrease = false
          } else if (newTotalIfIncrease <= 3) {
            // Está dentro dos 3 gratuitos
            if (aptitudePoints > 0) {
              // Tem pontos gratuitos disponíveis
              canIncrease = true
            } else if (isEvolutionStep) {
              // Na etapa de gastar PC, permite reconstruir/redistribuir
              // aptidões dentro dos 3 pontos, mesmo após zerar.
              canIncrease = true
            } else {
              canIncrease = false
            }
          } else {
            // Está além dos 3 gratuitos - só permite na evolução com PC suficiente.
            // O custo para o próximo ponto é incremental (20 PC), não absoluto.
            if (isEvolutionStep) {
              const costInPCDiff = 20
              canIncrease = pontosCriacao.disponiveis >= costInPCDiff
            } else {
              canIncrease = false // Na criação, não permite passar dos 3 gratuitos
            }
          }
          
          return (
            <motion.div
              key={aptitude.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="p-5 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 mb-1">{aptitude.name}</div>
                  <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mb-2 leading-relaxed">{aptitude.description}</p>
                  <div className="text-xs text-slate-400 dark:text-ecoar-light-900/50 mb-1">
                    {dice} • Nível {level}
                  </div>
                  <div className="text-xs text-ecoar-teal/70 font-semibold">
                    Gratuito
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => updateAptitude(aptitude.id, Math.max(0, level - 1))}
                  disabled={level === 0}
                  whileHover={{ scale: level === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 hover:bg-ecoar-magenta/20 hover:border-ecoar-magenta/30 text-slate-900 dark:text-ecoar-light-900 font-bold text-lg disabled:opacity-30 transition-all flex items-center justify-center"
                >
                  -
                </motion.button>
                <div className="flex-1 text-center">
                  <div className="text-4xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-1">{level}</div>
                  <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">Nível</div>
                  {level > 0 && (
                    <div className="text-xs text-ecoar-teal/70 mt-1">
                      Gratuito
                    </div>
                  )}
                </div>
                <motion.button
                  onClick={() => updateAptitude(aptitude.id, level + 1)}
                  disabled={!canIncrease}
                  whileHover={{ scale: !canIncrease ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 hover:bg-ecoar-teal/20 hover:border-ecoar-teal/30 text-slate-900 dark:text-ecoar-light-900 font-bold text-lg disabled:opacity-30 transition-all flex items-center justify-center"
                >
                  +
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Evolution Step
