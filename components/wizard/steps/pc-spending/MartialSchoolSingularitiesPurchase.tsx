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


export function MartialSchoolSingularitiesPurchase({
  escolaMarcial,
  singularidadesMarciais,
  onSingularidadesChange,
  pontosDisponiveis,
  onPointsChange,
  nivelAlma,
  onBack,
}: {
  escolaMarcial: MartialSchoolData
  singularidadesMarciais: string[]
  onSingularidadesChange: (singularidades: string[]) => void
  pontosDisponiveis: number
  onPointsChange: (gastos: number) => void
  nivelAlma: number
  onBack: () => void
}) {
  // Calcula pontos gastos usando custo oficial direto em PC
  const pontosGastos = singularidadesMarciais.reduce((sum, singId) => {
    const sing = escolaMarcial.singularities.find(s => s.id === singId)
    return sum + (sing ? sing.cost : 0)
  }, 0)

  // Atualiza pontos gastos quando singularidades mudam
  useEffect(() => {
    const total = singularidadesMarciais.reduce((sum, singId) => {
      const sing = escolaMarcial.singularities.find(s => s.id === singId)
      return sum + (sing ? sing.cost : 0)
    }, 0)
    onPointsChange(total)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singularidadesMarciais])

  const toggleSingularity = (id: string) => {
    const singularity = escolaMarcial.singularities.find(s => s.id === id)
    if (!singularity) return

    const isSelected = singularidadesMarciais.includes(id)
    const costInPC = singularity.cost
    
    if (isSelected) {
      // Remove
      onSingularidadesChange(singularidadesMarciais.filter(s => s !== id))
    } else {
      // Verifica requisitos
      if (singularity.requirements.previous && !singularidadesMarciais.includes(singularity.requirements.previous)) {
        return
      }
      if (singularity.requirements.nivelAlma && nivelAlma < singularity.requirements.nivelAlma) {
        return
      }
      if (pontosDisponiveis >= costInPC) {
        onSingularidadesChange([...singularidadesMarciais, id])
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 flex flex-col h-full"
    >
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:text-ecoar-light-900 dark:hover:text-ecoar-light-900 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para detalhes da escola
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white dark:text-ecoar-light-900">Singularidades da {escolaMarcial.name}</h3>
              <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 mt-0.5">Gastando PC (Escola Marcial)</p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal dark:text-ecoar-teal-400' : 'text-ecoar-magenta dark:text-ecoar-magenta-400'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70 leading-relaxed mt-3">
          Compre singularidades com Pontos de Criação usando custo oficial em PC
        </p>
      </div>

      {/* Lista de Singularidades */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escolaMarcial.singularities.map((singularity) => {
            const isSelected = singularidadesMarciais.includes(singularity.id)
            const costInPC = singularity.cost
            const canAfford = pontosDisponiveis >= costInPC
            const hasPrevious = !singularity.requirements.previous || singularidadesMarciais.includes(singularity.requirements.previous)
            const hasNivelAlma = !singularity.requirements.nivelAlma || nivelAlma >= singularity.requirements.nivelAlma
            const canSelect = canAfford && hasPrevious && hasNivelAlma

            return (
              <SingularityCard
                key={singularity.id}
                name={singularity.name}
                description={singularity.description}
                cost={costInPC}
                costLabel="PC"
                isSelected={isSelected}
                canAfford={canAfford}
                canSelect={canSelect}
                onClick={() => toggleSingularity(singularity.id)}
                level={singularity.level}
                effects={singularity.effects}
                variant="teal"
                footer={
                  <div className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50 mt-2">
                    {singularity.requirements.nivelAlma && (
                      <div className={hasNivelAlma ? '' : 'text-ecoar-magenta dark:text-ecoar-magenta-400'}>
                        Requer Nível de Alma {singularity.requirements.nivelAlma}+
                      </div>
                    )}
                    {singularity.requirements.previous && !hasPrevious && (
                      <div className="text-ecoar-magenta dark:text-ecoar-magenta-400">Requer singularidade anterior</div>
                    )}
                  </div>
                }
              />
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

