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
import { attributeIconsMap, attributeLabelsShort } from '@/components/wizard/shared/attributeMaps'


export function MartialSchoolSingularitiesStep({
  escolaMarcialId,
  singularidadesMarciais,
  onSingularidadesChange,
  nivelAlma,
  pontosEvolucao,
}: {
  escolaMarcialId: string
  singularidadesMarciais: string[]
  onSingularidadesChange: (singularidades: string[]) => void
  nivelAlma: number
  pontosEvolucao: number
}) {
  const school = getMartialSchoolDataByIdResolved(escolaMarcialId)
  const [pontosGastos, setPontosGastos] = useState(0)

  // Calcula pontos gastos baseado nas singularidades selecionadas
  useEffect(() => {
    if (!school) return
    const total = singularidadesMarciais.reduce((sum, singId) => {
      const sing = school.singularities.find(s => s.id === singId)
      return sum + (sing?.cost || 0)
    }, 0)
    setPontosGastos(total)
  }, [singularidadesMarciais, school])

  const pontosDisponiveis = pontosEvolucao - pontosGastos

  const toggleSingularity = (id: string) => {
    if (!school) return
    
    const singularity = school.singularities.find(s => s.id === id)
    if (!singularity) return

    const isSelected = singularidadesMarciais.includes(id)
    
    if (isSelected) {
      // Remove
      onSingularidadesChange(singularidadesMarciais.filter(s => s !== id))
    } else {
      // Verifica requisitos
      if (singularity.requirements.previous && !singularidadesMarciais.includes(singularity.requirements.previous)) {
        return // Precisa da singularidade anterior
      }
      if (singularity.requirements.nivelAlma && nivelAlma < singularity.requirements.nivelAlma) {
        return // Nível de alma insuficiente
      }
      if (pontosDisponiveis >= singularity.cost) {
        onSingularidadesChange([...singularidadesMarciais, id])
      }
    }
  }

  if (!school) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-ecoar-light-900/60">
        <p>Escola marcial não encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Sparkles className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Singularidades da {school.name}
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Gaste seus Pontos de Evolução em singularidades marciais
            </p>
          </div>
        </div>
        <div className={`mt-4 text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
          PE Disponíveis: {pontosDisponiveis} / {pontosEvolucao}
        </div>
      </div>

      {/* Informações da Escola */}
      <div className="bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] rounded-lg p-4 border border-white/[0.08] dark:border-ecoar-light-900/[0.08]">
        <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">{school.name}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <span className="text-slate-500 dark:text-ecoar-light-900/60">Classe:</span>
            <span className="text-slate-900 dark:text-ecoar-light-900 ml-2">{school.class}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-ecoar-light-900/60">Aptidão:</span>
            <span className="text-slate-900 dark:text-ecoar-light-900 ml-2">{school.aptitude}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-ecoar-light-900/60">Ferramenta:</span>
            <span className="text-slate-900 dark:text-ecoar-light-900 ml-2 text-xs">{school.tool}</span>
          </div>
        </div>
        <p className="text-slate-600 dark:text-ecoar-light-900/70 text-sm mb-2">{school.description}</p>
        {school.toolNote && (
          <p className="text-xs text-ecoar-magenta mt-2 italic">↪ {school.toolNote}</p>
        )}
      </div>

      {/* Lista de Singularidades */}
      <div className="space-y-3">
        <h5 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">Singularidades</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {school.singularities.map((singularity) => {
            const isSelected = singularidadesMarciais.includes(singularity.id)
            const canAfford = pontosDisponiveis >= singularity.cost
            const hasPrevious = !singularity.requirements.previous || singularidadesMarciais.includes(singularity.requirements.previous)
            const hasNivelAlma = !singularity.requirements.nivelAlma || nivelAlma >= singularity.requirements.nivelAlma
            const canSelect = canAfford && hasPrevious && hasNivelAlma

            return (
              <motion.button
                key={singularity.id}
                onClick={() => toggleSingularity(singularity.id)}
                disabled={!isSelected && !canSelect}
                whileHover={{ scale: !isSelected && canSelect ? 1.02 : 1 }}
                className={`p-4 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-ecoar-teal/60 bg-ecoar-teal/15 shadow-lg shadow-ecoar-teal/10'
                    : canSelect
                    ? 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15'
                    : 'border-slate-200 dark:border-ecoar-light-900/10 bg-slate-50 dark:bg-ecoar-light-900/10 opacity-50 '
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg">{singularity.name}</div>
                    <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-1">
                      Nível {singularity.level} (Romano: {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][singularity.level - 1]})
                    </div>
                  </div>
                  <div className="text-slate-900 dark:text-ecoar-light-900 font-semibold bg-ecoar-magenta-700/80 px-2 py-1 rounded border border-ecoar-magenta-600">{singularity.cost} PE</div>
                </div>
                <p className="text-slate-600 dark:text-ecoar-light-900/70 text-sm mb-2">{singularity.description}</p>
                {singularity.effects && (
                  <p className="text-slate-500 dark:text-ecoar-light-900/60 text-xs mb-2">{singularity.effects}</p>
                )}
                <div className="text-xs text-slate-400 dark:text-ecoar-light-900/50 mt-2">
                  {singularity.requirements.nivelAlma && (
                    <div className={hasNivelAlma ? '' : 'text-ecoar-magenta'}>
                      Requer Nível de Alma {singularity.requirements.nivelAlma}+
                    </div>
                  )}
                  {singularity.requirements.previous && !hasPrevious && (
                    <div className="text-ecoar-magenta">Requer singularidade anterior</div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Componente de Detalhes Explicativos para a área central
