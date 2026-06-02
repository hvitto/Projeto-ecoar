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


export function EquipmentStep({
  itensCatalogo,
  onItensCatalogoChange,
  orcamentoCeros,
  saldoRestanteCeros,
}: {
  itensCatalogo: CatalogOwnedItem[]
  onItensCatalogoChange: (items: CatalogOwnedItem[]) => void
  orcamentoCeros: number
  saldoRestanteCeros: number
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const { weapons, armor, utilities, multiplierTables } = useEquipmentCatalog()

  const handlePickCatalog = (entry: CatalogEntry, custoCeros: number) => {
    const displayLine = catalogDisplayLine(entry, custoCeros)
    onItensCatalogoChange([
      ...itensCatalogo,
      {
        instanceId: newCatalogInstanceId(),
        catalogId: entry.id,
        kind: entry.kind,
        nome: entry.name,
        custoCeros,
        displayLine,
      },
    ])
  }

  const removeCatalogItem = (instanceId: string) => {
    onItensCatalogoChange(itensCatalogo.filter((i) => i.instanceId !== instanceId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Package className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Equipamentos & Armas
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Escolha itens no catálogo; o custo é descontado do orçamento. Na ficha você pode anotar itens extras à mão, se precisar.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex p-3 bg-ecoar-teal/10 border border-ecoar-teal/30 rounded-lg">
                <p className="text-xs text-slate-900 dark:text-ecoar-light-900">
                  <span className="font-semibold text-ecoar-teal">Orçamento:</span>{' '}
                  <span className="tabular-nums">{formatCerosDisplay(orcamentoCeros)}</span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span className="font-semibold text-ecoar-teal">Saldo:</span>{' '}
                  <span className={`tabular-nums ${saldoRestanteCeros < 0 ? 'text-ecoar-magenta' : ''}`}>
                    {formatCerosDisplay(Math.max(0, saldoRestanteCeros))}
                  </span>
                </p>
              </div>
              <motion.button
                type="button"
                onClick={() => setPickerOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-ecoar-teal to-ecoar-magenta text-slate-900 dark:text-ecoar-light-900 border border-ecoar-teal/30 shadow-md"
              >
                Abrir catálogo
              </motion.button>
              <Link
                href="/referencia/aquisicao-equipamentos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                Referência completa (nova aba)
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/80 dark:bg-ecoar-dark-800/40">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 mb-2">Itens escolhidos</h4>
        {itensCatalogo.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-ecoar-light-900/50 text-center py-6">
            Nenhum item ainda. Use &quot;Abrir catálogo&quot; para adicionar equipamentos e armas.
          </p>
        ) : (
          <ul className="space-y-2">
            {itensCatalogo.map((item) => (
              <li
                key={item.instanceId}
                className="flex items-center justify-between gap-2 text-sm text-slate-800 dark:text-ecoar-light-900/90 py-2 px-3 rounded-md bg-white dark:bg-ecoar-dark-800/60 border border-slate-200 dark:border-ecoar-light-900/15"
              >
                <span className="min-w-0 break-words">{item.displayLine}</span>
                <button
                  type="button"
                  onClick={() => removeCatalogItem(item.instanceId)}
                  className="shrink-0 text-ecoar-magenta hover:underline text-xs"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/50 p-2 sm:p-4 md:p-6">
          <div className="mx-auto w-full max-w-4xl flex flex-col min-h-0 flex-1 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-dark-900 shadow-xl overflow-hidden">
            <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-ecoar-light-900/15 bg-white dark:bg-ecoar-dark-800/80">
              <span className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">Catálogo de aquisição</span>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10"
              >
                Fechar
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
              <EquipmentCatalogBrowser
                mode="picker"
                urlSync={false}
                saldoDisponivel={saldoRestanteCeros}
                onPickItem={handlePickCatalog}
                showCostMultiplierTables={false}
                weaponCatalog={weapons}
                armorCatalog={armor}
                utilityCatalog={utilities}
                costMultiplierTables={multiplierTables}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Location Selection Step
