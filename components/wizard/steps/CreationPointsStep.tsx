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


export function CreationPointsStep({
  pontosCriacao,
  onPointsChange,
  singularidades,
  selectedDisadvantages,
  onDisadvantagesChange,
}: {
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onPointsChange: (points: { obtidos: number; gastos: number; disponiveis: number }) => void
  singularidades: string[]
  selectedDisadvantages?: string[]
  onDisadvantagesChange?: (disadvantages: string[]) => void
}) {
  const basePoints = pontosCriacao.obtidos - (selectedDisadvantages?.reduce((total, id) => {
    const disadvantage = getDisadvantageById(id)
    return total + (disadvantage?.pontosCriacao || 0)
  }, 0) || 0)
  
  const totalDisadvantagesPoints = selectedDisadvantages?.reduce((total, id) => {
    const disadvantage = getDisadvantageById(id)
    return total + (disadvantage?.pontosCriacao || 0)
  }, 0) || 0

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Pontos de Criação</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Gerencie seus pontos de criação e escolha desvantagens opcionais para obter mais pontos</p>
      </div>

      {/* Informação sobre próximas etapas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-lg border border-ecoar-teal/20 bg-ecoar-teal/8 backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-ecoar-teal/15 rounded-lg flex items-center justify-center shrink-0 border border-ecoar-teal/20">
            <Info className="w-4 h-4 text-ecoar-teal/80" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">O que vem a seguir?</h4>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50 mb-3">
              A etapa a seguir será focada na obtenção de Pontos de Criação, os quais poderão ser gastos das seguintes formas:
            </p>
            <div className="space-y-2 text-xs text-slate-600 dark:text-ecoar-light-900/70">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-ecoar-teal/80 mt-1 shrink-0" />
                <div>
                  <span className="font-medium text-ecoar-teal/90">Singularidades Marciais:</span>
                  <p className="text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50 mt-0.5">
                    Vantagens vinculadas às aptidões mágicas que concedem benefícios diversos para aumentar a efetividade dentro de um combate. Maestrias de combate concedem bônus de combate para categorias específicas de armas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ecoar-teal mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-teal">Singularidades de Criação:</span>
                  <p className="text-slate-600 dark:text-ecoar-light-900/70 mt-0.5">
                    Vantagens que oferecem diferentes tipos de bônus. <span className="text-ecoar-magenta font-medium">Você não terá outra chance para adquirir Singularidades de Criação, já que elas só podem ser adquiridas durante esta etapa.</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ecoar-teal mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-teal">Ecoar:</span>
                  <p className="text-slate-600 dark:text-ecoar-light-900/70 mt-0.5">
                    Vantagens do Ecoar que permitem retornar à vida após a morte.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ecoar-teal mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-teal">Talentos Raciais:</span>
                  <p className="text-slate-600 dark:text-ecoar-light-900/70 mt-0.5">
                    Vantagens relacionadas à identidade da raça do personagem.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ecoar-teal mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-teal">Evoluindo Traços:</span>
                  <p className="text-slate-600 dark:text-ecoar-light-900/70 mt-0.5">
                    Você terá chance de aumentar o nível dos atributos (10 PC por ponto), habilidades e aptidões (20 PC por ponto) que ainda não estejam em 3.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-4 pt-3 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <div className="w-2 h-2 rounded-full bg-ecoar-magenta mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-magenta">Equipamentos:</span>
                  <p className="text-slate-600 dark:text-ecoar-light-900/70 mt-0.5">
                    Cada Ponto de Criação não utilizado será automaticamente convertido em 100 moedas para compra de equipamentos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Pontos Obtidos */}
        <div className="p-4 rounded-lg border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Pontos Obtidos</label>
          <input
            type="number"
            value={pontosCriacao.obtidos}
            readOnly
            className="w-full px-4 py-2 bg-slate-50 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 rounded-lg text-slate-900 dark:text-ecoar-light-900 focus:outline-none focus:ring-2 focus:ring-ecoar-teal"
          />
          <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 mt-2">
            Base: 30 | Desvantagens: +{totalDisadvantagesPoints} (máximo +30)
          </p>
        </div>

        {/* Pontos Gastos */}
        <div className="p-4 rounded-lg border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Pontos Gastos</label>
          <input
            type="number"
            value={pontosCriacao.gastos}
            readOnly
            className="w-full px-4 py-2 bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/20 border border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 rounded-lg text-white dark:text-ecoar-light-900 focus:outline-none focus:ring-2 focus:ring-ecoar-teal"
          />
          <p className="text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 text-xs mt-2">Calculado automaticamente</p>
        </div>

        {/* Pontos Disponíveis */}
        <div className="p-4 rounded-lg border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Pontos Disponíveis</label>
          <input
            type="number"
            value={pontosCriacao.disponiveis}
            readOnly
            className={`w-full px-4 py-2 bg-slate-50 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 rounded-lg ${
              pontosCriacao.disponiveis < 0 ? 'text-ecoar-magenta' : 'text-ecoar-teal'
            }`}
          />
          <p className="text-slate-500 dark:text-ecoar-light-900/60 text-xs mt-2">
            {pontosCriacao.disponiveis < 0 ? 'Você gastou mais pontos do que obteve!' : 'Disponíveis para uso'}
          </p>
        </div>
      </div>

      {/* Seleção de Desvantagens */}
      {onDisadvantagesChange && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-ecoar-teal" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">Desvantagens (Opcional)</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70 mb-4">
            Escolha desvantagens para obter Pontos de Criação extras. Cada desvantagem concede pontos adicionais.
          </p>
          
          {/* Categorias de Desvantagens */}
          {(['atributos', 'habilidades', 'genetica'] as const).map((category) => {
            const categoryDisadvantages = getDisadvantagesByCategory(category)
            if (categoryDisadvantages.length === 0) return null

            const categoryLabels: Record<typeof category, string> = {
              atributos: 'Atributos',
              habilidades: 'Habilidades',
              genetica: 'Genética',
            }

            return (
              <div key={category} className="space-y-3">
                <h5 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
                  {categoryLabels[category]}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryDisadvantages.map((disadvantage) => {
                    const isSelected = selectedDisadvantages?.includes(disadvantage.id) || false
                    const blockedBySingularity =
                      !isSelected &&
                      anySelectedSingularityForbidsDisadvantage(singularidades, disadvantage.id)
                    return (
                      <DisadvantageCard
                        key={disadvantage.id}
                        name={disadvantage.name}
                        description={disadvantage.description}
                        pontosCriacao={disadvantage.pontosCriacao}
                        isSelected={isSelected}
                        disabled={blockedBySingularity}
                        onClick={() => {
                          if (!onDisadvantagesChange) return
                          if (!isSelected && anySelectedSingularityForbidsDisadvantage(singularidades, disadvantage.id)) {
                            return
                          }
                          const newDisadvantages = isSelected
                            ? selectedDisadvantages?.filter(id => id !== disadvantage.id) || []
                            : [...(selectedDisadvantages || []), disadvantage.id]
                          onDisadvantagesChange(newDisadvantages)
                          
                          // Não precisa atualizar pontos aqui - o useEffect no componente principal já faz isso
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Background Step
