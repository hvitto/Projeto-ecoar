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


export function MartialSingularitiesTab({
  selectedEscolaMarcial,
  onEscolaMarcialSelect,
  todasSingularidades,
  singularidadesMarciais,
  onSingularidadesMarciaisChange,
  pontosDisponiveis,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedEscolaMarcial: string
  onEscolaMarcialSelect: (id: string) => void
  /** Lista completa de singularidades (criação + marciais de todas as escolas). */
  todasSingularidades: string[]
  singularidadesMarciais: string[]
  onSingularidadesMarciaisChange: (ids: string[]) => void
  pontosDisponiveis: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const allMartialSchools = getAllMartialSchools()
  const school = selectedEscolaMarcial ? getMartialSchoolDataByIdResolved(selectedEscolaMarcial) : null

  // Valida requisitos de uma singularidade marcial
  const checkRequirements = useCallback((singularity: MartialSchoolSingularity): { valid: boolean; missingReqs: string[] } => {
    const missingReqs: string[] = []

    // Verifica singularidade anterior
    if (singularity.requirements.previous) {
      if (!todasSingularidades.includes(singularity.requirements.previous)) {
        const prevSing = school?.singularities.find(s => s.id === singularity.requirements.previous)
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
  }, [singularidadesMarciais, todasSingularidades, nivelAlma, attributes, skills, aptitudes, school])

  const toggleSingularity = (id: string) => {
    if (!school) return

    const singularity = school.singularities.find(s => s.id === id)
    if (!singularity) return

    const isSelected = singularidadesMarciais.includes(id)
    const costInPC = singularity.cost

    if (isSelected) {
      onSingularidadesMarciaisChange(singularidadesMarciais.filter(s => s !== id))
    } else {
      // Verifica requisitos
      const { valid } = checkRequirements(singularity)
      if (!valid) return

      // Verifica se tem PC suficiente
      if (pontosCriacao.disponiveis >= costInPC) {
        onSingularidadesMarciaisChange([...singularidadesMarciais, id])
      }
    }
  }

  // Se não tem escola selecionada, mostra seleção
  if (!selectedEscolaMarcial || !school) {
    return (
      <div className="space-y-5">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
              <Sword className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-0.5">
                Singularidades Marciais
              </h3>
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50">
                Você pode comprar singularidades de várias escolas. Escolha uma escola, gaste PC e volte aqui para
                adicionar outra — nada é apagado ao trocar de escola.
              </p>
            </div>
          </div>
          <div className={`mt-3 text-base font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal/90 dark:text-ecoar-teal-400/90' : 'text-ecoar-magenta/90 dark:text-ecoar-magenta-400/90'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMartialSchools.map((schoolItem, index) => {
            const purchasedHere = schoolItem.singularities.filter((s) => todasSingularidades.includes(s.id)).length
            return (
            <motion.button
              key={schoolItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onEscolaMarcialSelect(schoolItem.id)}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] bg-ecoar-light-700 dark:bg-ecoar-light-900/[0.03] hover:bg-ecoar-light-800 dark:hover:bg-ecoar-light-900/[0.06] hover:border-ecoar-teal-400 dark:hover:border-ecoar-teal-500/30 transition-all text-left"
            >
              {purchasedHere > 0 && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ecoar-teal/20 text-ecoar-teal-700 dark:text-ecoar-teal-400 border border-ecoar-teal/30">
                  {purchasedHere} sing.
                </span>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-ecoar-light-900/90">
                    {schoolItem.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-ecoar-light-900/60">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-ecoar-light-900/20">{schoolItem.class}</span>
                    <span>{schoolItem.aptitude}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-3 text-slate-600 dark:text-ecoar-light-900/60">
                {schoolItem.description}
              </p>
              <div className="space-y-1 text-xs text-slate-500 dark:text-ecoar-light-900/50">
                <div><span className="font-medium">Ferramenta:</span> {schoolItem.tool}</div>
                <div className="mt-2">
                  <span className="font-medium">{schoolItem.singularities.length} singularidades</span>
                </div>
              </div>
            </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  // Se tem escola selecionada, mostra lista de singularidades
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center">
              <Sword className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">
                Singularidades da {school.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-0.5">
                Custo oficial em PC
              </p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal dark:text-ecoar-teal-400' : 'text-ecoar-magenta dark:text-ecoar-magenta-400'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEscolaMarcialSelect('')}
          className="flex flex-col items-start gap-1 text-left text-slate-600 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:text-ecoar-light-900 text-sm transition-colors mt-2"
        >
          <span className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4 shrink-0" />
            Trocar escola marcial
          </span>
          <span className="text-xs text-slate-500 dark:text-ecoar-light-900/55 pl-6 max-w-md">
            Volta à grade para escolher outra escola e comprar mais singularidades. O que você já comprou em outras
            escolas continua valendo e segue contando no total de PC.
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {school.singularities.map((singularity) => {
          const isSelected = singularidadesMarciais.includes(singularity.id)
          const costInPC = singularity.cost
          const canAfford = pontosCriacao.disponiveis >= costInPC
          const { valid, missingReqs } = checkRequirements(singularity)
          const canSelect = valid && canAfford
          const requirementText = missingReqs.length > 0 ? missingReqs.join(', ') : undefined

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

// Racial Singularities Tab Component
