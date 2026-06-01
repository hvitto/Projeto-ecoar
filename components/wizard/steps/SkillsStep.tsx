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


export function SkillsStep({
  skills,
  skillPoints,
  pontosCriacao,
  onSkillsChange,
  onSkillPointsChange,
  onPointsChange,
  isEvolutionStep = false,
}: {
  skills: Record<string, { level: number; specialization?: string }>
  skillPoints: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onSkillsChange: (skills: Record<string, { level: number; specialization?: string }>) => void
  onSkillPointsChange: (points: number) => void
  onPointsChange: (gastos: number) => void
  isEvolutionStep?: boolean
}) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Skill['category']>('combate')
  
  // Inicializa a habilidade selecionada quando a categoria muda
  useEffect(() => {
    const categorySkills = getSkillsByCategory(selectedCategory)
    if (categorySkills.length > 0 && (!selectedSkill || !categorySkills.find(s => s.id === selectedSkill))) {
      setSelectedSkill(categorySkills[0].id)
    }
  }, [selectedCategory, selectedSkill])
  
  const categories: Skill['category'][] = ['combate', 'primarias', 'artisticas', 'cientificas', 'motoras', 'sociais', 'gerais']
  const categoryLabels: Record<Skill['category'], string> = {
    combate: 'Habilidades de Combate',
    primarias: 'Habilidades Primárias',
    artisticas: 'Habilidades Artísticas',
    cientificas: 'Habilidades Científicas',
    motoras: 'Habilidades Motoras',
    sociais: 'Habilidades Sociais',
    gerais: 'Habilidades Gerais',
  }

  // Custo em pontos gratuitos por categoria
  const getSkillFreeCost = (category: Skill['category']): number => {
    if (category === 'combate' || category === 'primarias') return 2
    return 1
  }

  // Custo em PC por categoria (para compras além dos 48 pontos)
  const getSkillPCCost = (category: Skill['category']): number => {
    if (category === 'combate' || category === 'primarias') return 10
    return 5
  }

  const getMaxLevel = () => isEvolutionStep ? 8 : 3

  const normalizeSkillState = (level: number, specialization?: string) => {
    const sanitizedLevel = Math.max(0, level)
    return {
      level: sanitizedLevel,
      specialization: sanitizedLevel > 0 ? specialization : undefined,
    }
  }

  const getSkillTotalCost = (
    skillId: string,
    skillState: { level: number; specialization?: string }
  ) => {
    const skillData = getSkillById(skillId)
    if (!skillData) return 0

    const normalizedState = normalizeSkillState(skillState.level, skillState.specialization)
    const costPerLevel = getSkillFreeCost(skillData.category)
    return (normalizedState.level * costPerLevel) + (normalizedState.specialization ? costPerLevel : 0)
  }

  // Calcula quantos pontos gratuitos foram gastos
  const calculateFreePointsUsed = () => {
    return Object.entries(skills).reduce((total, [skillId, skillData]) => {
      return total + getSkillTotalCost(skillId, skillData)
    }, 0)
  }

  // Calcula quantos PC foram gastos (além dos 48 pontos gratuitos)
  const calculatePCUsed = () => {
    const freeUsed = calculateFreePointsUsed()
    const overFree = Math.max(0, freeUsed - 48)
    if (overFree === 0) return 0
    
    // Calcula proporcionalmente: se passou X pontos além dos 48, calcula quantos PC custaria
    // Isso é uma estimativa baseada na média de custos
    // Na prática, o cálculo exato é feito no updateSkill
    let estimatedPC = 0
    let totalPointsInSkills = 0
    
    Object.entries(skills).forEach(([skillId, skill]) => {
      if (skill.level > 0) {
        const skillData = getSkillById(skillId)
        if (skillData) {
          const freeCost = getSkillFreeCost(skillData.category)
          const pcCost = getSkillPCCost(skillData.category)
          const skillCost = (skill.level * freeCost) + (skill.specialization ? freeCost : 0)
          totalPointsInSkills += skillCost
          estimatedPC += (skill.level * pcCost) + (skill.specialization ? pcCost : 0)
        }
      }
    })
    
    // Se está usando 48 pontos ou menos, não gastou PC
    if (totalPointsInSkills <= 48) return 0
    
    // Calcula a proporção que foi comprada com PC
    const ratio = overFree / totalPointsInSkills
    return estimatedPC * ratio
  }

  const updateSkill = (skillId: string, level: number, specialization?: string) => {
    const skill = getSkillById(skillId)
    if (!skill) return

    const currentSkill = normalizeSkillState(
      skills[skillId]?.level || 0,
      skills[skillId]?.specialization
    )
    const maxLevel = getMaxLevel()
    const nextSkill = normalizeSkillState(Math.min(level, maxLevel), specialization)
    
    // Calcula custo da mudança em pontos gratuitos
    const oldCost = getSkillTotalCost(skillId, currentSkill)
    const newCost = getSkillTotalCost(skillId, nextSkill)
    
    // Calcula quanto está usando atualmente
    const currentFreeUsed = calculateFreePointsUsed()
    const newFreeUsed = currentFreeUsed - oldCost + newCost
    
    // Não permite gastar PC além dos 48 pontos gratuitos
    if (newFreeUsed > 48) {
      return // Não permite aumentar além dos pontos gratuitos
    }
    
    // Se está dentro dos 48 pontos gratuitos
    if (skillPoints + oldCost >= newCost && nextSkill.level <= maxLevel) {
      onSkillsChange({
        ...skills,
        [skillId]: nextSkill,
      })
      onSkillPointsChange(Math.max(0, Math.min(48, 48 - newFreeUsed)))
    }
  }

  const randomizeSkills = () => {
    const maxLevel = getMaxLevel()
    const allSkills = skillsData
    const newSkills: Record<string, { level: number; specialization?: string }> = {}
    let remainingPoints = 48

    // Lista de habilidades disponíveis com seus custos
    const availableSkills = allSkills.map(skill => ({
      skill,
      costPerLevel: getSkillFreeCost(skill.category),
    }))

    // Embaralha as habilidades
    const shuffledSkills = [...availableSkills].sort(() => Math.random() - 0.5)

    // Primeira passada: distribui níveis nas habilidades
    let attempts = 0
    const maxAttempts = 500 // Evita loop infinito
    
    while (remainingPoints > 0 && attempts < maxAttempts) {
      attempts++
      let distributed = false
      
      // Tenta distribuir em habilidades aleatórias
      for (const { skill, costPerLevel } of shuffledSkills) {
        if (remainingPoints < costPerLevel) continue
        
        const currentLevel = newSkills[skill.id]?.level || 0
        if (currentLevel >= maxLevel) continue

        // 60% de chance de aumentar uma habilidade se tiver pontos
        if (Math.random() < 0.6 && remainingPoints >= costPerLevel) {
          const newLevel = Math.min(currentLevel + 1, maxLevel)
          const cost = costPerLevel
          
          if (remainingPoints >= cost) {
            newSkills[skill.id] = { level: newLevel }
            remainingPoints -= cost
            distributed = true
            break // Reinicia o loop para dar chance a outras habilidades
          }
        }
      }

      if (!distributed) break
    }

    // Segunda passada: adiciona especialidades aleatoriamente
    const skillsWithLevels = Object.entries(newSkills)
      .filter(([_, data]) => data.level > 0)
      .map(([skillId]) => {
        const skill = getSkillById(skillId)
        return skill ? { skillId, skill } : null
      })
      .filter(Boolean) as Array<{ skillId: string; skill: Skill }>

    // Embaralha habilidades com níveis
    const shuffledWithLevels = [...skillsWithLevels].sort(() => Math.random() - 0.5)

    for (const { skillId, skill } of shuffledWithLevels) {
      if (remainingPoints <= 0) break
      
      if (!newSkills[skillId].specialization && skill.specializations.length > 0) {
        const costPerLevel = getSkillFreeCost(skill.category)
        
        // 40% de chance de adicionar especialidade se tiver pontos
        if (Math.random() < 0.4 && remainingPoints >= costPerLevel) {
          const randomSpec = skill.specializations[Math.floor(Math.random() * skill.specializations.length)]
          newSkills[skillId] = {
            ...newSkills[skillId],
            specialization: randomSpec.id,
          }
          remainingPoints -= costPerLevel
        }
      }
    }

    // Terceira passada: tenta usar pontos restantes em níveis ou especialidades
    if (remainingPoints > 0) {
      for (const { skill, costPerLevel } of shuffledSkills) {
        if (remainingPoints < costPerLevel) continue
        
        const currentLevel = newSkills[skill.id]?.level || 0
        if (currentLevel >= maxLevel) {
          // Se já está no máximo, tenta adicionar especialidade
          if (!newSkills[skill.id]?.specialization && skill.specializations.length > 0 && remainingPoints >= costPerLevel) {
            const randomSpec = skill.specializations[Math.floor(Math.random() * skill.specializations.length)]
            newSkills[skill.id] = {
              level: currentLevel,
              specialization: randomSpec.id,
            }
            remainingPoints -= costPerLevel
          }
        } else {
          // Tenta aumentar nível
          if (remainingPoints >= costPerLevel) {
            const newLevel = Math.min(currentLevel + 1, maxLevel)
            newSkills[skill.id] = { level: newLevel }
            remainingPoints -= costPerLevel
          }
        }
        
        if (remainingPoints <= 0) break
      }
    }

    // Calcula pontos usados
    const freeUsed = Object.entries(newSkills).reduce((total, [skillId, skillData]) => {
      return total + getSkillTotalCost(skillId, skillData)
    }, 0)

    onSkillsChange(newSkills)
    onSkillPointsChange(Math.max(0, Math.min(48, 48 - freeUsed)))
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
              <BookOpen className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
                {isEvolutionStep ? 'Evoluir Habilidades' : 'Habilidades e Especialidades'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
                Você tem 48 pontos gratuitos para distribuir. Combate/Primárias custam 2 pontos, resto custa 1 ponto por nível. Especialidade custa o mesmo que um nível.
              </p>
            </div>
          </div>
          <Button
            onClick={randomizeSkills}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Dices className="w-4 h-4" />
            Aleatório
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className={`p-3.5 rounded-lg border transition-all ${
          skillPoints >= 0 
            ? 'bg-ecoar-teal/10 border-ecoar-teal/30 text-slate-900 dark:text-ecoar-light-900' 
            : 'bg-ecoar-magenta/10 border-ecoar-magenta/30 text-slate-900 dark:text-ecoar-light-900'
        }`}>
          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">Pontos Gratuitos</div>
          <div className={`text-2xl font-bold ${skillPoints >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
            {skillPoints}
          </div>
        </div>
      </div>

      {/* Layout Vertical: Categorias à Esquerda, Habilidades e Detalhes à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Lista de Categorias - Esquerda */}
        <div className="lg:col-span-1 space-y-2">
          {categories.map((category) => {
            const categorySkills = getSkillsByCategory(category)
            if (categorySkills.length === 0) return null
            
            return (
              <motion.button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  const firstSkill = categorySkills[0]
                  if (firstSkill) setSelectedSkill(firstSkill.id)
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 4 }}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  selectedCategory === category
                    ? 'border-ecoar-teal bg-ecoar-teal/10 shadow-lg shadow-ecoar-teal/20'
                    : 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">{categoryLabels[category]}</div>
                <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-1">
                  {categorySkills.length} habilidade{categorySkills.length !== 1 ? 's' : ''}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Lista de Habilidades e Detalhes - Direita */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Lista de Habilidades da Categoria */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {getSkillsByCategory(selectedCategory).map((skill) => {
              const skillData = skills[skill.id] || { level: 0, specialization: undefined }
              const freeCostPerLevel = getSkillFreeCost(skill.category)
              const currentCost = (skillData.level * freeCostPerLevel) + (skillData.specialization ? freeCostPerLevel : 0)
              
              return (
                <motion.button
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4 }}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    selectedSkill === skill.id
                      ? 'border-ecoar-teal bg-ecoar-teal/10 shadow-lg shadow-ecoar-teal/20'
                      : 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 truncate">{skill.name}</div>
                      <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                        {getSkillDice(skillData.level)} • Nv.{skillData.level}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-ecoar-teal">{skillData.level}</div>
                      <div className="text-[10px] text-slate-400 dark:text-ecoar-light-900/50">{currentCost}pt</div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Painel de Detalhes da Habilidade Selecionada */}
          <div>
            {selectedSkill && (() => {
              const skill = getSkillById(selectedSkill)
              if (!skill) return null
              
              const skillData = skills[skill.id] || { level: 0, specialization: undefined }
              const freeCostPerLevel = getSkillFreeCost(skill.category)
              const maxLevel = getMaxLevel()
              const currentCost = (skillData.level * freeCostPerLevel) + (skillData.specialization ? freeCostPerLevel : 0)
              
              // Calcula se pode aumentar
              const currentFreeUsed = calculateFreePointsUsed()
              const newCostIfIncrease = currentCost + freeCostPerLevel
              const newFreeUsed = currentFreeUsed - currentCost + newCostIfIncrease
              
              let canIncrease = false
              if (newFreeUsed <= 48) {
                canIncrease = skillPoints >= freeCostPerLevel && skillData.level < maxLevel
              } else {
                const pointsOverFree = newFreeUsed - 48
                const pcCostPerLevel = getSkillPCCost(selectedCategory)
                const pcCost = pointsOverFree * (pcCostPerLevel / freeCostPerLevel)
                canIncrease = pontosCriacao.disponiveis >= pcCost && skillData.level < maxLevel
              }
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-ecoar-teal/20 bg-ecoar-teal/8 backdrop-blur-sm h-full"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">{skill.name}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 dark:text-ecoar-light-900/60">Dado</div>
                        <div className="text-ecoar-teal font-semibold">{getSkillDice(skillData.level)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-ecoar-light-900/60">Custo</div>
                        <div className="text-ecoar-teal font-semibold">{freeCostPerLevel}pt/nível</div>
                      </div>
                    </div>
                  </div>

                  {/* Controles de Nível */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <motion.button
                        onClick={() => updateSkill(skill.id, Math.max(0, skillData.level - 1), skillData.specialization)}
                        disabled={skillData.level === 0}
                        whileHover={{ scale: skillData.level === 0 ? 1 : 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg bg-ecoar-magenta/15 border border-ecoar-magenta/25 hover:bg-ecoar-magenta/20 text-slate-900 dark:text-ecoar-light-900/90 font-semibold text-base disabled:opacity-30 transition-all flex items-center justify-center"
                      >
                        -
                      </motion.button>
                      
                      <div className="text-center min-w-[100px]">
                        <div className="text-5xl font-bold text-ecoar-teal mb-1">{skillData.level}</div>
                        <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">Nível</div>
                        <div className="text-xs text-slate-400 dark:text-ecoar-light-900/50 mt-1">{currentCost} pontos</div>
                      </div>
                      
                      <motion.button
                        onClick={() => updateSkill(skill.id, skillData.level + 1, skillData.specialization)}
                        disabled={!canIncrease}
                        whileHover={{ scale: !canIncrease ? 1 : 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg bg-ecoar-teal/15 border border-ecoar-teal/25 hover:bg-ecoar-teal/20 text-slate-900 dark:text-ecoar-light-900/90 font-semibold text-base disabled:opacity-30 transition-all flex items-center justify-center"
                      >
                        +
                      </motion.button>
                    </div>
                    <div className="text-center text-sm text-slate-500 dark:text-ecoar-light-900/60">
                      Máximo: {maxLevel}
                    </div>
                  </div>

                  {/* Especialização */}
                  {skill.specializations.length > 0 && (
                    <div className="pt-6 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                      <label className="text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2 block font-semibold">
                        Especialidade <span className="text-ecoar-teal/70">(+{freeCostPerLevel}pt)</span>
                      </label>
                      <select
                        value={skillData.specialization || ''}
                        onChange={(e) => {
                          if (skillData.level === 0) {
                            updateSkill(skill.id, 0, undefined)
                            return
                          }
                          updateSkill(skill.id, skillData.level, e.target.value || undefined)
                        }}
                        disabled={skillData.level === 0}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 rounded-lg text-slate-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:ring-2 focus:ring-ecoar-teal focus:border-ecoar-teal"
                      >
                        <option value="">Nenhuma</option>
                        {skill.specializations.map((spec) => (
                          <option key={spec.id} value={spec.id} className="bg-ecoar-light-700 dark:bg-ecoar-dark-800">
                            {spec.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </motion.div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Aptitudes Step
