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
import { attributeIconsMap } from '@/components/wizard/shared/attributeMaps'
import { RaceComparisonSection } from '@/components/wizard/steps/RaceComparisonSection'


export function SelectionDetailsPanel({ 
  type, 
  selectedId, 
  getItemById,
  onBack,
  onSelect,
  headerActions
}: { 
  type: 'race' | 'path' | 'location' | 'martialSchool'
  selectedId: string
  getItemById: (id: string) => any
  onBack?: () => void
  onSelect?: (id: string) => void
  headerActions?: React.ReactNode
}) {
  const item = getItemById(selectedId)
  if (!item) return null

  const raceImageConfig: RaceImageConfig | undefined =
    type === 'race' ? (item.image as RaceImageConfig | undefined) : undefined
  const showRaceImage = Boolean(raceImageConfig?.src)

  const attributeDescriptions: Record<string, { name: string; description: string }> = {
    carisma: { name: 'Carisma', description: 'Representa sua capacidade de liderança, persuasão e influência social.' },
    finesse: { name: 'Finesse', description: 'Agilidade e precisão. Afeta ações que requerem destreza e coordenação.' },
    forca: { name: 'Força', description: 'Poder físico bruto. Afeta dano em combate corpo a corpo e capacidade de carga.' },
    inteligencia: { name: 'Inteligência', description: 'Capacidade mental, raciocínio e conhecimento. Essencial para magias e investigação.' },
    percepcao: { name: 'Percepção', description: 'Atenção aos detalhes e consciência do ambiente. Afeta detecção e precisão.' },
    vitalidade: { name: 'Vitalidade', description: 'Resistência física e saúde geral. Afeta pontos de vida e resistência a danos.' },
    vontade: { name: 'Vontade', description: 'Força mental e determinação. Afeta resistência a efeitos mentais e controle.' },
  }

  const limitDescriptions: Record<string, { name: string; description: string }> = {
    corpo: { name: 'Corpo', description: 'Limite de dano físico que você pode receber antes de ficar incapacitado.' },
    mente: { name: 'Mente', description: 'Limite de estresse mental e fadiga que você pode suportar.' },
    folego: { name: 'Fôlego', description: 'Capacidade de realizar ações físicas extenuantes antes de precisar descansar.' },
    mana: { name: 'Mana', description: 'Energia mágica disponível para lançar feitiços e usar habilidades especiais.' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header com Botão Voltar */}
      <div className="border-b border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 pb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-ecoar-dark-600 dark:text-ecoar-light-900/70 hover:text-ecoar-dark-900 dark:hover:text-ecoar-light-900 mb-4 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para seleção
          </button>
        )}
        <div className="flex items-center gap-3 mb-2 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 bg-ecoar-teal-100 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center">
              {type === 'race' && <Users className="w-5 h-5 text-ecoar-teal-600 dark:text-ecoar-teal-400" />}
              {type === 'path' && <Route className="w-5 h-5 text-ecoar-teal-600 dark:text-ecoar-teal-400" />}
              {type === 'location' && <MapPin className="w-5 h-5 text-ecoar-teal-600 dark:text-ecoar-teal-400" />}
              {type === 'martialSchool' && <Sword className="w-5 h-5 text-ecoar-teal-600 dark:text-ecoar-teal-400" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">{item.name}</h3>
              <p className="text-xs text-ecoar-dark-600 dark:text-ecoar-light-900/60 mt-0.5">
                {type === 'race' && 'Raça'}
                {type === 'path' && 'Trilha'}
                {type === 'location' && 'Localização'}
                {type === 'martialSchool' && 'Escola Marcial'}
              </p>
            </div>
          </div>
          {headerActions && <div className="flex items-center gap-2 flex-shrink-0">{headerActions}</div>}
        </div>
        <p className="text-sm text-ecoar-dark-700 dark:text-ecoar-light-900/80 leading-relaxed mt-3">
          {item.description}
        </p>
      </div>

      {/* Layout em 2 colunas: Arte à esquerda | INFO à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
        {showRaceImage && raceImageConfig?.src && (
          <RaceImage
            variant="hero"
            src={raceImageConfig.src}
            alt={raceImageConfig.alt ?? item.name}
            heroConfig={raceImageConfig.hero}
          />
        )}

        <div className={showRaceImage ? 'relative z-10' : 'space-y-4'}>
          {showRaceImage ? (
            <div className="min-h-[280px]" />
          ) : (
            <div className="bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-xl border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 p-6 min-h-[280px] flex items-center justify-center">
              <div className="text-center text-ecoar-dark-400 dark:text-ecoar-light-900/40 text-sm">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-ecoar-dark-300 dark:text-ecoar-light-900/30 text-xs">
                    Imagem PNG aqui
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito - INFO */}
        <div className="space-y-4 relative z-10">
          {/* Bônus Detalhados com Explicações */}
          {item.bonuses && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <h4 className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 uppercase tracking-wider">
                  Bônus e Efeitos
                </h4>
              </div>

              {/* Bônus de Atributos */}
              {item.bonuses.attributes && Object.keys(item.bonuses.attributes).length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-ecoar-dark-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-3">
                    Atributos
                  </div>
                  <div className="space-y-3">
                    {Object.entries(item.bonuses.attributes).map(([attr, value]) => {
                      const attrInfo = attributeDescriptions[attr] || { name: attr, description: '' }
                      const Icon = attributeIconsMap[attr] || Star
                      const bonusValue = value as number
                      return (
                        <Card variant="default" key={attr} className="p-3">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="w-5 h-5 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">
                                  {attrInfo.name}
                                </span>
                                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">
                                  +{bonusValue}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-ecoar-dark-600 dark:text-ecoar-light-900/60 ml-8 leading-relaxed">
                            {attrInfo.description}
                          </p>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Bônus de Skills */}
              {item.bonuses.skills && Object.keys(item.bonuses.skills).length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-3">
                    Habilidades
                  </div>
                  <div className="space-y-2">
                    {Object.entries(item.bonuses.skills).map(([skill, value]) => {
                      const skillBonusValue = value as number
                      return (
                        <div key={skill} className="flex items-center justify-between bg-slate-50 dark:bg-ecoar-light-900/10 rounded-lg p-3 border border-slate-200 dark:border-ecoar-light-900/20">
                          <div className="flex items-center gap-2">
                            <Sword className="w-4 h-4 text-teal-600 dark:text-ecoar-teal-400" />
                            <span className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 capitalize">
                              {skill}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-teal-600 dark:text-ecoar-teal-400">+{skillBonusValue}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Limites */}
              {(item.bonuses.corpo || item.bonuses.mente || item.bonuses.folego || item.bonuses.mana) && (
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-3">
                    Limites
                  </div>
                  <div className="space-y-3">
                    {item.bonuses.corpo && (
                      <LimitCard
                        icon={Heart}
                        name={limitDescriptions.corpo.name}
                        description={limitDescriptions.corpo.description}
                        bonus={item.bonuses.corpo}
                      />
                    )}
                    {item.bonuses.mente && (
                      <LimitCard
                        icon={Brain}
                        name={limitDescriptions.mente.name}
                        description={limitDescriptions.mente.description}
                        bonus={item.bonuses.mente}
                      />
                    )}
                    {item.bonuses.folego && (
                      <LimitCard
                        icon={Waves}
                        name={limitDescriptions.folego.name}
                        description={limitDescriptions.folego.description}
                        bonus={item.bonuses.folego}
                      />
                    )}
                    {item.bonuses.mana && (
                      <LimitCard
                        icon={Sparkles}
                        name={limitDescriptions.mana.name}
                        description={limitDescriptions.mana.description}
                        bonus={item.bonuses.mana}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Movimento (para raças) */}
              {item.bonuses.movement && (
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-3">
                    Movimento
                  </div>
                  <div className="space-y-2">
                    {item.bonuses.movement.terrestre && (
                      <MovementCard
                        icon={Footprints}
                        name="Terrestre"
                        value={item.bonuses.movement.terrestre}
                      />
                    )}
                    {item.bonuses.movement.aquatico && (
                      <MovementCard
                        icon={Waves}
                        name="Aquático"
                        value={item.bonuses.movement.aquatico}
                      />
                    )}
                    {item.bonuses.movement.aereo && (
                      <MovementCard
                        icon={Zap}
                        name="Aéreo"
                        value={item.bonuses.movement.aereo}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Sentidos (para raças) */}
              {item.bonuses.senses && (
                <div>
                  <div className="text-xs font-semibold text-ecoar-dark-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-3">
                    Sentidos
                  </div>
                  <div className="space-y-2">
                    {item.bonuses.senses.visao !== undefined && (
                      <SenseCard
                        icon={Eye}
                        name="Visão"
                        value={item.bonuses.senses.visao}
                      />
                    )}
                    {item.bonuses.senses.audicao !== undefined && (
                      <SenseCard
                        icon={Users}
                        name="Audição"
                        value={item.bonuses.senses.audicao}
                      />
                    )}
                    {item.bonuses.senses.olfato !== undefined && (
                      <SenseCard
                        icon={Star}
                        name="Olfato"
                        value={item.bonuses.senses.olfato}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!item.bonuses && (
            <div className="text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/60 text-center py-8">
              Esta seleção não possui bônus especiais.
            </div>
          )}
        </div>
      </div>

      {/* Comparação Rápida para Raças */}
      {type === 'race' && onSelect && (
        <div className="relative z-10">
          <RaceComparisonSection
            selectedRaca={selectedId}
            onSelect={onSelect}
          />
        </div>
      )}
    </motion.div>
  )
}

// Componente reutilizável para mostrar detalhes de bônus
