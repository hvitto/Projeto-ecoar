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


export function MartialSchoolDetailsPanel({
  selectedEscolaMarcial,
  onBack,
  onSelect,
}: {
  selectedEscolaMarcial: string
  onBack: () => void
  onSelect: (id: string) => void
}) {
  const allMartialSchools = getAllMartialSchools()
  const currentIndex = allMartialSchools.findIndex(s => s.id === selectedEscolaMarcial)
  const school = getMartialSchoolDataByIdResolved(selectedEscolaMarcial)
  
  if (!school) return null

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelect(allMartialSchools[currentIndex - 1].id)
    } else {
      onSelect(allMartialSchools[allMartialSchools.length - 1].id) // Volta para o último
    }
  }

  const handleNext = () => {
    if (currentIndex < allMartialSchools.length - 1) {
      onSelect(allMartialSchools[currentIndex + 1].id)
    } else {
      onSelect(allMartialSchools[0].id) // Volta para o primeiro
    }
  }

  const attributeDescriptions: Record<string, { name: string; description: string }> = {
    carisma: { name: 'Carisma', description: 'Representa sua capacidade de liderança, persuasão e influência social.' },
    finesse: { name: 'Finesse', description: 'Agilidade e precisão. Afeta ações que requerem destreza e coordenação.' },
    forca: { name: 'Força', description: 'Poder físico bruto. Afeta dano em combate corpo a corpo e capacidade de carga.' },
    inteligencia: { name: 'Inteligência', description: 'Capacidade mental, raciocínio e conhecimento. Essencial para magias e investigação.' },
    percepcao: { name: 'Percepção', description: 'Atenção aos detalhes e consciência do ambiente. Afeta detecção e precisão.' },
    vitalidade: { name: 'Vitalidade', description: 'Resistência física e saúde geral. Afeta pontos de vida e resistência a danos.' },
    vontade: { name: 'Vontade', description: 'Força mental e determinação. Afeta resistência a efeitos mentais e controle.' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 flex flex-col h-full"
    >
      {/* Header com Botão Voltar e Navegação por Setas */}
      <div className="border-b border-slate-200 dark:border-ecoar-light-900/20 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-700 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:hover:text-ecoar-light-900 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para seleção
          </button>
          
          {/* Navegação por Setas */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handlePrevious}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-700 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:hover:text-ecoar-light-900 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <span className="text-xs text-slate-600 dark:text-ecoar-light-900/60 px-2">
              {currentIndex + 1} / {allMartialSchools.length}
            </span>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-700 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:hover:text-ecoar-light-900 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-teal-100 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center">
            <Sword className="w-5 h-5 text-teal-600 dark:text-ecoar-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">{school.name}</h3>
            <p className="text-xs text-slate-600 dark:text-ecoar-light-900/60 mt-0.5">Escola Marcial</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 dark:text-ecoar-light-900/80 leading-relaxed mt-3">
          {school.description}
        </p>
      </div>

      {/* Layout em 2 colunas: PNG à esquerda | INFO à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">
        {/* Lado Esquerdo - Espaço para PNG */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-ecoar-light-900/10 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 p-6 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-slate-400 dark:text-ecoar-light-900/40 text-sm">
              {/* Espaço reservado para imagem PNG */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-slate-300 dark:text-ecoar-light-900/30 text-xs">
                  Imagem PNG aqui
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - INFO */}
        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
          {/* Informações Básicas */}
          <InfoCard>
            <h4 className="text-xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-4">{school.name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-slate-600 dark:text-ecoar-light-900/60">Classe:</span>
                <span className="text-slate-900 dark:text-ecoar-light-900 ml-2">{school.class}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-ecoar-light-900/60">Aptidão:</span>
                <span className="text-slate-900 dark:text-ecoar-light-900 ml-2">{school.aptitude}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-600 dark:text-ecoar-light-900/60">Ferramenta:</span>
                <span className="text-slate-900 dark:text-ecoar-light-900 ml-2 text-xs">{school.tool}</span>
              </div>
            </div>
            {school.toolNote && (
              <p className="text-xs text-slate-900 dark:text-ecoar-light-900/90 bg-magenta-50 dark:bg-ecoar-magenta-800/70 px-3 py-2 rounded border border-magenta-200 dark:border-ecoar-magenta-600/50 italic mt-2">↪ {school.toolNote}</p>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <div>
                <span className="text-slate-600 dark:text-ecoar-light-900/60 font-medium">Atributos sugeridos:</span>
                <span className="text-slate-900 dark:text-ecoar-light-900 ml-2">{school.suggestedAttributes?.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-ecoar-light-900/60 font-medium">Habilidades sugeridas:</span>
                <span className="text-slate-900 dark:text-ecoar-light-900 ml-2">{school.suggestedSkills?.join(', ')}</span>
              </div>
              {school.suggestedEquipment && (
                <div>
                  <span className="text-slate-600 dark:text-ecoar-light-900/60 font-medium">Equipamento sugerido:</span>
                  <span className="text-slate-900 dark:text-ecoar-light-900 ml-2">{school.suggestedEquipment}</span>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Informações sobre Singularidades */}
          <InfoCard>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 mb-3">Singularidades</h4>
            <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70 mb-3">
              Esta escola possui {school.singularities.length} singularidades disponíveis, que podem ser adquiridas com Pontos de Evolução na próxima etapa.
            </p>
            <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
              <p>• Primeira singularidade requer: {school.singularities[0]?.requirements.nivelAlma ? `Nível de Alma ${school.singularities[0].requirements.nivelAlma}+` : 'Sem requisitos de nível'}</p>
              <p>• Custo inicial: {school.singularities[0]?.cost || 'N/A'} Pontos de Evolução</p>
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Barra de Navegação Rápida - Ícones das Escolas na parte inferior */}
      <div className="border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider">
            Navegação Rápida
          </span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {allMartialSchools.map((s) => {
            const isActive = s.id === selectedEscolaMarcial
            return (
              <motion.button
                key={s.id}
                onClick={() => onSelect(s.id)}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-2 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 border-ecoar-teal dark:border-ecoar-teal-500 shadow-lg shadow-ecoar-teal/30 dark:shadow-ecoar-teal-600/30'
                    : 'bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/50 dark:hover:border-ecoar-teal-500/50'
                }`}
                title={s.name}
              >
                <Sword className={`w-5 h-5 ${isActive ? 'text-ecoar-teal' : 'text-slate-500 dark:text-ecoar-light-900/60'}`} />
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-teal-600 dark:bg-ecoar-teal-400 rounded-full border-2 border-white dark:border-ecoar-dark-900"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

