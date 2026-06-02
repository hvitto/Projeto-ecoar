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


export function PathSingularitiesTab({
  selectedTrilha,
  selectedPathBase,
  selectedBruxarias,
  selectedCacadaPowers,
  selectedCacadaEnhancements,
  onTrilhaSelect,
  onPathBaseSelect,
  onBruxariasChange,
  onCacadaPowersChange,
  onCacadaEnhancementsChange,
  pontosDisponiveis,
}: {
  selectedTrilha: string
  selectedPathBase: string
  selectedBruxarias: string[]
  selectedCacadaPowers: string[]
  selectedCacadaEnhancements: string[]
  onTrilhaSelect: (id: string) => void
  onPathBaseSelect: (id: string) => void
  onBruxariasChange: (ids: string[]) => void
  onCacadaPowersChange: (ids: string[]) => void
  onCacadaEnhancementsChange: (ids: string[]) => void
  pontosDisponiveis: number
}) {
  const selectedPath = selectedTrilha ? getPathById(selectedTrilha) : null
  const pathBaseSingularity = selectedTrilha ? getPathBaseSingularityByPathId(selectedTrilha) : null

  // Calculate total cost
  const calculateTotalCost = () => {
    let total = 0
    if (selectedPathBase && pathBaseSingularity) {
      total += pathBaseSingularity.cost
    }
    // Bruxarias are free (chosen based on Path Level)
    // Cacada powers cost
    selectedCacadaPowers.forEach(powerId => {
      const power = getCacadaPowerById(powerId)
      if (power) total += power.cost
    })
    // Cacada enhancements cost
    selectedCacadaEnhancements.forEach(enhId => {
      const enh = getCacadaEnhancementById(enhId)
      if (enh) total += enh.cost
    })
    return total
  }

  const togglePathBase = (id: string) => {
    if (selectedPathBase === id) {
      onPathBaseSelect('')
    } else {
      onPathBaseSelect(id)
    }
  }

  const toggleBruxaria = (id: string) => {
    if (selectedBruxarias.includes(id)) {
      onBruxariasChange(selectedBruxarias.filter(b => b !== id))
    } else {
      // Bruxarias are free, just add to selection
      onBruxariasChange([...selectedBruxarias, id])
    }
  }

  const toggleCacadaPower = (id: string) => {
    const power = getCacadaPowerById(id)
    if (!power) return

    const isSelected = selectedCacadaPowers.includes(id)
    const currentCost = calculateTotalCost()
    
    if (isSelected) {
      // Remove power and any associated enhancements
      const newPowers = selectedCacadaPowers.filter(p => p !== id)
      const newEnhancements = selectedCacadaEnhancements.filter(e => {
        const enh = getCacadaEnhancementById(e)
        return enh?.requirements.powerId !== id
      })
      onCacadaPowersChange(newPowers)
      onCacadaEnhancementsChange(newEnhancements)
    } else {
      // Add power if can afford
      if (pontosDisponiveis >= (currentCost + power.cost)) {
        onCacadaPowersChange([...selectedCacadaPowers, id])
      }
    }
  }

  const toggleCacadaEnhancement = (id: string) => {
    const enhancement = getCacadaEnhancementById(id)
    if (!enhancement) return

    const isSelected = selectedCacadaEnhancements.includes(id)
    const hasPower = selectedCacadaPowers.includes(enhancement.requirements.powerId)
    
    if (!hasPower) return // Can't select enhancement without power

    const currentCost = calculateTotalCost()
    
    if (isSelected) {
      const newEnhancements = selectedCacadaEnhancements.filter(e => e !== id)
      onCacadaEnhancementsChange(newEnhancements)
    } else {
      // Check if another enhancement for same power is selected
      const otherEnhancements = selectedCacadaEnhancements.filter(e => {
        const eData = getCacadaEnhancementById(e)
        return eData?.requirements.powerId === enhancement.requirements.powerId
      })
      
      if (enhancement.requirements.noOtherEnhancement && otherEnhancements.length > 0) {
        return // Can't select if another enhancement is selected
      }

      if (pontosDisponiveis >= (currentCost + enhancement.cost)) {
        onCacadaEnhancementsChange([...selectedCacadaEnhancements, id])
      }
    }
  }

  if (!selectedPath) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="mb-4">
            <Route className="w-16 h-16 text-ecoar-teal/50 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900 mb-2">Selecione uma Trilha</h4>
            <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm mb-6">
              Escolha uma trilha para ver suas singularidades disponíveis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {paths.filter(p => p.type === 'bruxaria' || p.type === 'cacada').map((path) => (
              <motion.button
                key={path.id}
                onClick={() => onTrilhaSelect(path.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-xl border-2 border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-ecoar-teal/20 flex items-center justify-center">
                    <Route className="w-5 h-5 text-ecoar-teal" />
                  </div>
                  <h5 className="font-semibold text-slate-900 dark:text-ecoar-light-900 text-lg">{path.name}</h5>
                </div>
                <p className="text-slate-600 dark:text-ecoar-light-900/70 text-sm leading-relaxed">{path.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const bruxariaCategories: Bruxaria['category'][] = ['destruicao', 'terror', 'ilusao', 'agouro', 'protecao', 'reparacao', 'controle']
  const categoryLabels: Record<Bruxaria['category'], string> = {
    destruicao: 'Bruxarias de Destruição',
    terror: 'Bruxarias de Terror',
    ilusao: 'Bruxarias de Ilusão',
    agouro: 'Bruxarias de Agouro',
    protecao: 'Bruxarias de Proteção',
    reparacao: 'Bruxarias de Reparação',
    controle: 'Bruxarias de Controle',
  }

  return (
    <div className="space-y-6">
      {/* Trilha Selecionada Header */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-ecoar-teal/30 bg-ecoar-teal/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ecoar-teal/20 flex items-center justify-center">
            <Route className="w-5 h-5 text-ecoar-teal" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">{selectedPath.name}</h4>
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60">{selectedPath.description}</p>
          </div>
        </div>
        <button
          onClick={() => {
            onPathBaseSelect('')
            onBruxariasChange([])
            onCacadaPowersChange([])
            onCacadaEnhancementsChange([])
            onTrilhaSelect('')
          }}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 transition-colors text-slate-500 dark:text-ecoar-light-900/60 hover:text-slate-900 dark:text-ecoar-light-900"
          title="Remover Trilha"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Base Path Singularity */}
      {pathBaseSingularity && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
            Singularidade Base da Trilha
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <SingularityCard
              name={pathBaseSingularity.name}
              description={pathBaseSingularity.description}
              cost={pathBaseSingularity.cost}
              isSelected={selectedPathBase === pathBaseSingularity.id}
              canAfford={pontosDisponiveis >= pathBaseSingularity.cost}
              canSelect={pontosDisponiveis >= pathBaseSingularity.cost}
              onClick={() => togglePathBase(pathBaseSingularity.id)}
              variant="teal"
            />
          </div>
        </div>
      )}

      {/* Bruxarias (for Bruxaria path) */}
      {selectedTrilha === 'bruxaria' && selectedPathBase && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">Bruxarias</h4>
            <Badge variant="bonus">
              {selectedBruxarias.length} selecionadas
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70">
            Escolha um número de bruxarias igual ao seu Nível de Trilha. Você pode substituir uma bruxaria por outra durante um descanso.
          </p>
          {bruxariaCategories.map((category) => {
            const categoryBruxarias = getBruxariasByCategory(category)
            if (categoryBruxarias.length === 0) return null

            return (
              <div key={category} className="space-y-3">
                <h5 className="text-md font-semibold text-slate-900 dark:text-ecoar-light-900/90 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
                  {categoryLabels[category]}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryBruxarias.map((bruxaria) => {
                    const isSelected = selectedBruxarias.includes(bruxaria.id)
                    return (
                      <Card
                        key={bruxaria.id}
                        className={`p-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-ecoar-teal bg-ecoar-teal/10'
                            : 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50'
                        }`}
                        onClick={() => toggleBruxaria(bruxaria.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h6 className="font-semibold text-slate-900 dark:text-ecoar-light-900 text-sm leading-tight flex-1">{bruxaria.name}</h6>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-ecoar-teal flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70 leading-relaxed line-clamp-2">{bruxaria.description}</p>
                        <div className="flex gap-2 text-xs text-slate-500 dark:text-ecoar-light-900/60">
                          <span>Mana: {bruxaria.manaCost}</span>
                          <span>•</span>
                          <span>Ação: {bruxaria.action}</span>
                          {bruxaria.range && (
                            <>
                              <span>•</span>
                              <span>Alcance: {bruxaria.range}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-ecoar-light-900/80 mt-2">{bruxaria.effects}</p>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Caçada Powers and Enhancements */}
      {selectedTrilha === 'cacada' && selectedPathBase && (
        <div className="space-y-6">
          {/* Powers */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
              Poderes da Caçada
            </h4>
            <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70">
              Você pode ter, no máximo, um número de poderes igual ao seu Nível de Poder.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getAllCacadaPowers().map((power) => {
                const isSelected = selectedCacadaPowers.includes(power.id)
                const canAfford = pontosDisponiveis >= power.cost
                const enhancements = getCacadaEnhancementsByPowerId(power.id)
                
                return (
                  <div key={power.id} className="space-y-2">
                    <SingularityCard
                      name={power.name}
                      description={power.description}
                      cost={power.cost}
                      isSelected={isSelected}
                      canAfford={canAfford}
                      canSelect={canAfford}
                      onClick={() => toggleCacadaPower(power.id)}
                      variant="teal"
                    />
                    {/* Enhancements for this power */}
                    {isSelected && enhancements.length > 0 && (
                      <div className="ml-4 space-y-2 border-l-2 border-ecoar-teal/30 pl-4">
                        <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 font-semibold">Aprimoramentos:</p>
                        {enhancements.map((enhancement) => {
                          const isEnhSelected = selectedCacadaEnhancements.includes(enhancement.id)
                          const canAffordEnh = pontosDisponiveis >= enhancement.cost
                          const hasOtherEnh = selectedCacadaEnhancements.some(e => {
                            const eData = getCacadaEnhancementById(e)
                            return eData?.requirements.powerId === power.id && e !== enhancement.id
                          })
                          const canSelectEnh = canAffordEnh && !(enhancement.requirements.noOtherEnhancement && hasOtherEnh)
                          
                          return (
                            <SingularityCard
                              key={enhancement.id}
                              name={enhancement.name}
                              description={enhancement.description}
                              cost={enhancement.cost}
                              isSelected={isEnhSelected}
                              canAfford={canAffordEnh}
                              canSelect={canSelectEnh}
                              onClick={() => toggleCacadaEnhancement(enhancement.id)}
                              variant="teal"
                              className="text-sm"
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Gastando PC - Step Principal (sub-etapas controladas pela sidebar)
