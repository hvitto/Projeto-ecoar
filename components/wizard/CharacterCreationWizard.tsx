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
import { WIZARD_STEP_TITLES, WIZARD_STEP_ICONS, WIZARD_TOTAL_STEPS } from '@/features/character/constants/wizardSteps'
import { useCharacterWizard } from '@/features/character/wizard/useCharacterWizard'

export interface CharacterCreationData {
  // Níveis do personagem
  nivelAlma?: number
  nivelPoder?: number
  nivelTrilha?: number

  // Pontos de Evolução (lado antes de '/' = não utilizados; lado após '/' = acumulados)
  // Nesta aplicação, a ficha permite apenas adicionar PE, então iniciamos os dois lados iguais ao total inicial.
  pontosEvolucao?: { atual: number; max: number }

  // Step 1: Race
  raca?: string
  
  // Step 2: Martial School (Classe de combate)
  escolaMarcial?: string
  
  
  // Step 4: Location
  localizacao?: string
  
  // Step 5: Attributes
  attributes: {
    carisma: number
    finesse: number
    forca: number
    inteligencia: number
    percepcao: number
    vitalidade: number
    vontade: number
  }
  
  // Step 6: Skills (all categories)
  skills: Record<string, { level: number; specialization?: string }>
  
  // Step 7: Aptitudes
  aptitudes: Record<string, number>
  
  // Step 8: Physical Characteristics
  tamanho?: string
  peso?: string
  deslocamento?: {
    terrestre?: number
    aquatico?: number
    aereo?: number
  }
  sentidos?: {
    visao?: number
    audicao?: number
    olfato?: number
  }
  
  // Step 9: Path
  trilha?: string
  
  // Step 10: Singularities
  singularidades?: string[]
  
  // Step 11: Ecoar
  ecoar?: string
  singularidadesEcoar?: string[]

  // Step 11 (complemento): singularidades marciais e raciais
  singularidadesMarciais?: string[]
  singularidadesRaciais?: string[]

  /** IDs de desvantagens do livro (ex.: antipatico). */
  desvantagens?: string[]
  
  // Step 12: Creation Points
  pontosCriacao: {
    obtidos: number
    gastos: number
    disponiveis: number
  }
  
  // Step 13: Background
  nome: string
  backstory?: string
  tracoPositivo?: string
  tracoNegativo?: string
  personalidade?: string
  ideais?: string
  vinculos?: string
  defeitos?: string
  
  // Step 14: Equipment
  equipamentos: string[]
  armas: string[]
  /** Itens comprados pelo catálogo (saldo debitado). */
  itensCatalogo?: CatalogOwnedItem[]
  saldoMoedas?: number
  /** Linhas livres quando há itens de catálogo (round-trip na edição). */
  equipamentosLivres?: string[]
  armasLivres?: string[]
  moeda?: string
}

interface CharacterCreationWizardProps {
  onComplete: (data: CharacterCreationData) => void
  initialData?: Partial<CharacterCreationData>
  /** Logo / início: volta ao painel sem confundir com novo personagem */
  onGoToDashboard?: () => void
}

import {
  martialSchoolCreationLabel,
  mergeMartialSchoolAttributeBonusesFromDataSchoolIds,
} from '@/components/wizard/shared/wizardHelpers'

export default function CharacterCreationWizard({ onComplete, initialData, onGoToDashboard }: CharacterCreationWizardProps) {
  const { ecoarSingularities, getEcoarSingularityById } = useEcoarCatalogData()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showIntroduction, setShowIntroduction] = useState(true)
  const [initialLevel, setInitialLevel] = useState(1) // Nível inicial escolhido (1, 2, 3+)
  const [nivelAlmaInicial, setNivelAlmaInicial] = useState<number>(1) // Nível de Alma inicial (1-24)
  const [pcSubStep, setPCSubStep] = useState<'singularidades' | 'traços' | 'escola-marcial'>('singularidades') // 0 = introdução, depois 1-8
  const [selectedRaca, setSelectedRaca] = useState<string>('')
  const [selectedEscolaMarcial, setSelectedEscolaMarcial] = useState<string>('')
  const [selectedLocalizacao, setSelectedLocalizacao] = useState<string>('')
  const [selectedTrilha, setSelectedTrilha] = useState<string>('')
  const [attributes, setAttributes] = useState({
    carisma: 0,
    finesse: 0,
    forca: 0,
    inteligencia: 0,
    percepcao: 0,
    vitalidade: 0,
    vontade: 0,
  })
  const [attributePoints, setAttributePoints] = useState(12) // 12 pontos gratuitos para atributos
  const [skillPoints, setSkillPoints] = useState(48) // 48 pontos gratuitos para habilidades
  const [aptitudePoints, setAptitudePoints] = useState(3) // 3 pontos gratuitos para aptidões
  const [moedaExtra, setMoedaExtra] = useState(0) // Moeda extra comprada com PC (500 ceros = 5 PC)
  const [selectedDisadvantages, setSelectedDisadvantages] = useState<string[]>([]) // Desvantagens selecionadas
  const [skills, setSkills] = useState<Record<string, { level: number; specialization?: string }>>({})
  const [aptitudes, setAptitudes] = useState<Record<string, number>>({})
  const [tamanho, setTamanho] = useState<string>('')
  const [peso, setPeso] = useState<string>('')
  const [deslocamento, setDeslocamento] = useState({ terrestre: 0, aquatico: 0, aereo: 0 })
  const [sentidos, setSentidos] = useState({ visao: 0, audicao: 0, olfato: 0 })
  const [singularidades, setSingularidades] = useState<string[]>([])
  const [selectedEcoar, setSelectedEcoar] = useState<string>('')
  const [singularidadesEcoar, setSingularidadesEcoar] = useState<string[]>([])
  const [singularidadesRaciais, setSingularidadesRaciais] = useState<string[]>([])
  /** Gastos de PC na aba Trilha (estado elevado para somar com traços ao trocar sub-etapa). */
  const [pathSingularityBase, setPathSingularityBase] = useState('')
  const [pathBruxarias, setPathBruxarias] = useState<string[]>([])
  const [pathCacadaPowers, setPathCacadaPowers] = useState<string[]>([])
  const [pathCacadaEnhancements, setPathCacadaEnhancements] = useState<string[]>([])
  const [pontosCriacao, setPontosCriacao] = useState({ obtidos: 30, gastos: 0, disponiveis: 30 }) // Começa com 30
  const [nome, setNome] = useState('')
  const [backstory, setBackstory] = useState('')
  const [tracoPositivo, setTracoPositivo] = useState('')
  const [tracoNegativo, setTracoNegativo] = useState('')
  const [personalidade, setPersonalidade] = useState('')
  const [equipamentos, setEquipamentos] = useState<string[]>([])
  const [armas, setArmas] = useState<string[]>([])
  const [itensCatalogo, setItensCatalogo] = useState<CatalogOwnedItem[]>([])
  const [raceBonuses, setRaceBonuses] = useState<Record<string, number>>({})
  const [martialSchoolBonuses, setMartialSchoolBonuses] = useState<Record<string, number>>({})
  const hasInitialized = useRef(false)
  const hasSyncedStepFromUrl = useRef(false)

  const handleCreationPointsSpentChange = useCallback((gastos: number) => {
    setPontosCriacao((prev) => {
      const disponiveis = prev.obtidos - gastos
      if (prev.gastos === gastos && prev.disponiveis === disponiveis) {
        return prev
      }
      return { ...prev, gastos, disponiveis }
    })
  }, [])

  const handleTrilhaSelectForPCStep = useCallback((id: string) => {
    setSelectedTrilha((prev) => {
      if (id !== prev) {
        setPathSingularityBase('')
        setPathBruxarias([])
        setPathCacadaPowers([])
        setPathCacadaEnhancements([])
      }
      return id
    })
  }, [])

  // Initialize states from initialData when editing an existing character
  // This should only run once when the component mounts with initialData
  useEffect(() => {
    if (!initialData || hasInitialized.current) return

    // Initialize basic selections first (these trigger other effects)
    if (initialData.raca) setSelectedRaca(initialData.raca)
    if (initialData.escolaMarcial) setSelectedEscolaMarcial(initialData.escolaMarcial)
    if (initialData.localizacao) setSelectedLocalizacao(initialData.localizacao)
    if (initialData.trilha) setSelectedTrilha(initialData.trilha)
    if (initialData.ecoar) setSelectedEcoar(initialData.ecoar)

    if (initialData.nivelAlma !== undefined && initialData.nivelAlma !== null) {
      const v = typeof initialData.nivelAlma === 'string' ? parseInt(initialData.nivelAlma) : initialData.nivelAlma
      if (Number.isFinite(v)) setNivelAlmaInicial(v)
    }

    // Initialize attributes (these already include race/martial school bonuses)
    if (initialData.attributes) {
      setAttributes(initialData.attributes)
    }

    // Initialize skills
    if (initialData.skills) {
      setSkills(initialData.skills)
    }

    // Initialize aptitudes
    if (initialData.aptitudes) {
      setAptitudes(initialData.aptitudes)
    }

    // Initialize physical characteristics
    if (initialData.tamanho) setTamanho(initialData.tamanho)
    if (initialData.peso) setPeso(initialData.peso)
    if (initialData.deslocamento) {
      setDeslocamento({
        terrestre: initialData.deslocamento.terrestre || 0,
        aquatico: initialData.deslocamento.aquatico || 0,
        aereo: initialData.deslocamento.aereo || 0,
      })
    }
    if (initialData.sentidos) {
      setSentidos({
        visao: initialData.sentidos.visao || 0,
        audicao: initialData.sentidos.audicao || 0,
        olfato: initialData.sentidos.olfato || 0,
      })
    }

    // Initialize singularities
    if (initialData.singularidades) {
      setSingularidades(initialData.singularidades)
    }
    if (initialData.singularidadesEcoar) {
      setSingularidadesEcoar(initialData.singularidadesEcoar)
    }

    // Initialize creation points
    if (initialData.pontosCriacao) {
      setPontosCriacao(initialData.pontosCriacao)
    }

    // Initialize background
    if (initialData.nome) setNome(initialData.nome)
    if (initialData.backstory) setBackstory(initialData.backstory)
    if (initialData.tracoPositivo) setTracoPositivo(initialData.tracoPositivo)
    if (initialData.tracoNegativo) setTracoNegativo(initialData.tracoNegativo)
    if (initialData.personalidade) setPersonalidade(initialData.personalidade)
    if (Array.isArray((initialData as { desvantagens?: string[] }).desvantagens))
      setSelectedDisadvantages((initialData as { desvantagens: string[] }).desvantagens)

    // Initialize equipment (catálogo + linhas livres ou legado só com arrays)
    const cat = initialData.itensCatalogo
    if (Array.isArray(cat) && cat.length > 0) {
      setItensCatalogo(cat as CatalogOwnedItem[])
      setEquipamentos(Array.isArray(initialData.equipamentosLivres) ? initialData.equipamentosLivres : [])
      setArmas(Array.isArray(initialData.armasLivres) ? initialData.armasLivres : [])
    } else {
      setItensCatalogo([])
      if (initialData.equipamentos) setEquipamentos(initialData.equipamentos)
      if (initialData.armas) setArmas(initialData.armas)
    }

    // Skip introduction screen when editing
    setShowIntroduction(false)
    
    // Mark as initialized to prevent re-running
    hasInitialized.current = true
  }, [initialData])

  const availableRaces = useMemo(() => races, [])
  
  const selectedRaceData = useMemo(() => 
    selectedRaca ? getRaceById(selectedRaca) : null
  , [selectedRaca])

  // Calcula pontos de criação com desvantagens (30 base + até 30 de desvantagens = 60 max)
  const disadvantagePoints = useMemo(() => 
    selectedDisadvantages.reduce((sum, disId) => {
      const dis = getDisadvantageById(disId)
      return sum + (dis?.pontosCriacao || 0)
    }, 0)
  , [selectedDisadvantages])
  
  const totalCreationPoints = useMemo(() => {
    const racialExtra = selectedRaca ? getRacialCreationExtraPoints(selectedRaca) : 0
    return 30 + Math.min(disadvantagePoints, 30) + racialExtra
  }, [disadvantagePoints, selectedRaca])
  
  useEffect(() => {
    setPontosCriacao(prev => ({
      obtidos: totalCreationPoints,
      gastos: prev.gastos,
      disponiveis: totalCreationPoints - prev.gastos
    }))
  }, [totalCreationPoints])

  // Apply race bonuses when race is selected
  useEffect(() => {
    const race = selectedRaca ? getRaceById(selectedRaca) : null
    const manualBonuses = race?.bonuses?.attributes || {}
    
    // Calculate automatic bonuses from size and weight modifiers
    const sizeModifier = race?.bonuses?.sizeModifier ?? 0
    const weightModifier = race?.bonuses?.weightModifier ?? 0
    const automaticBonuses: Record<string, number> = {}
    
    // Anão ignora penalidade racial de Força vinda do tamanho.
    if (sizeModifier !== 0 && !(race?.id === 'anao' && sizeModifier < 0)) {
      automaticBonuses.forca = sizeModifier
    }
    
    // Each +1 weight gives +1 vitality
    if (weightModifier !== 0) {
      automaticBonuses.vitalidade = weightModifier
    }
    
    // Combine manual and automatic bonuses
    const newBonuses: Record<string, number> = { ...manualBonuses }
    Object.entries(automaticBonuses).forEach(([attr, bonus]) => {
      newBonuses[attr] = (newBonuses[attr] || 0) + bonus
    })
    
    setAttributes(prevAttrs => {
      const updated = { ...prevAttrs }
      
      // Remove old race bonuses first (restore base values that user allocated)
      Object.entries(raceBonuses).forEach(([attr, oldBonus]) => {
        const attrKey = attr as keyof typeof updated
        // Current value = oldBase + oldBonus, so oldBase = current - oldBonus
        const oldBase = updated[attrKey] - oldBonus
        updated[attrKey] = oldBase
      })
      
      // Apply new race bonuses directly - this is the initial value (not optional)
      // The attribute starts at the bonus value automatically
      Object.entries(newBonuses).forEach(([attr, bonus]) => {
        const attrKey = attr as keyof typeof updated
        const baseValue = updated[attrKey] // Base value after removing old bonus (user-allocated points)
        // Final value = base (user points) + bonus (race bonus)
        // If user has 0 points and bonus is -1, final is -1 (starts at -1)
        // If user has 0 points and bonus is +1, final is +1 (starts at +1)
        updated[attrKey] = baseValue + bonus // Allow negative if bonus is negative
      })
      
      return updated
    })
    
    // Initialize size and weight modifiers from race (if not already set from initialData)
    if (race && sizeModifier !== undefined && tamanho === '') {
      setTamanho(String(sizeModifier))
    }
    if (race && weightModifier !== undefined && peso === '') {
      setPeso(String(weightModifier))
    }
    
    setRaceBonuses(newBonuses)
    if (race) {
      setSingularidadesRaciais(
        getRacialSingularitiesByRaceId(race.id)
          .filter((s) => (s.acquisitionPhase ?? 'creation') === 'creation')
          .map((s) => s.id),
      )
    } else {
      setSingularidadesRaciais([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRaca])

  // Bônus marciais: soma das escolas com pelo menos uma singularidade comprada; senão, preview da escola em foco
  useEffect(() => {
    const schoolIdsFromPurchases = new Set<string>()
    singularidades.forEach((sid) => {
      const m = getMartialSchoolSingularityById(sid)
      if (m?.schoolId) schoolIdsFromPurchases.add(m.schoolId)
    })

    let newBonuses: Record<string, number> = {}
    if (schoolIdsFromPurchases.size > 0) {
      newBonuses = mergeMartialSchoolAttributeBonusesFromDataSchoolIds(Array.from(schoolIdsFromPurchases))
    } else if (selectedEscolaMarcial) {
      const resolved = resolveMartialSchoolDataId(selectedEscolaMarcial)
      const uiId = resolved ? MARTIAL_SCHOOL_DATA_ID_TO_UI_ID[resolved] : undefined
      const school = uiId
        ? getMartialSchoolById(uiId)
        : getMartialSchoolById(selectedEscolaMarcial)
      newBonuses = school?.bonuses?.attributes || {}
    }

    setAttributes(prevAttrs => {
      const updated = { ...prevAttrs }
      
      // Remove old martial school bonuses first (restore base values that user allocated)
      Object.entries(martialSchoolBonuses).forEach(([attr, oldBonus]) => {
        const attrKey = attr as keyof typeof updated
        // Current value = oldBase + oldBonus, so oldBase = current - oldBonus
        const oldBase = updated[attrKey] - oldBonus
        updated[attrKey] = oldBase
      })
      
      // Apply new martial school bonuses directly
      Object.entries(newBonuses).forEach(([attr, bonus]) => {
        const attrKey = attr as keyof typeof updated
        const baseValue = updated[attrKey] // Base value after removing old bonus (user-allocated points)
        // Final value = base (user points) + bonus (martial school bonus)
        updated[attrKey] = baseValue + bonus // Allow negative if bonus is negative
      })
      
      return updated
    })
    
    setMartialSchoolBonuses(newBonuses)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singularidades, selectedEscolaMarcial])

  // Recalculate attribute points whenever bonuses change
  // This ensures that bonuses don't consume free attribute points
  useEffect(() => {
    // Calculate total base points (excluding all bonuses)
    // Base value = total value - all bonuses (can be negative if bonus is negative)
    const totalBasePoints = Object.entries(attributes).reduce((sum, [attr, val]) => {
      const raceBonus = raceBonuses[attr] || 0
      const martialSchoolBonus = martialSchoolBonuses[attr] || 0
      const classBonus = 0 // TODO: Add class bonuses if needed
      const totalBonus = raceBonus + martialSchoolBonus + classBonus
      // Calculate base value (what user allocated manually)
      const baseValue = val - totalBonus
      // Only count positive base values towards the 12 free points
      return sum + Math.max(0, baseValue)
    }, 0)
    
    // Update available attribute points (12 free points - base points used)
    setAttributePoints(Math.max(0, 12 - totalBasePoints))
  }, [attributes, raceBonuses, martialSchoolBonuses])

  const equipmentOrcamentoCeros = useMemo(
    () =>
      5500 +
      pontosCriacao.disponiveis * 100 +
      (nivelAlmaInicial > 1 ? (getSoulLevelByNivel(nivelAlmaInicial)?.pontosEvolucao || 0) * 50 : 0),
    [nivelAlmaInicial, pontosCriacao.disponiveis]
  )

  const equipmentGastoCeros = useMemo(() => sumCatalogItemsCeros(itensCatalogo), [itensCatalogo])

  const equipmentSaldoRestante = equipmentOrcamentoCeros - equipmentGastoCeros

  const {
    currentStep,
    maxStepVisited,
    canProceed,
    goNext: handleNext,
    goBack: handleBack,
    setStep: setCurrentStep,
    visitStep,
  } = useCharacterWizard({
    selectedRaca,
    attributes,
    attributePoints,
    skillPoints,
    nome,
    equipmentSaldoRestante,
  })

  useEffect(() => {
    if (hasSyncedStepFromUrl.current) return
    const stepParam = searchParams.get('step')
    if (stepParam == null) {
      hasSyncedStepFromUrl.current = true
      return
    }
    const parsedStep = Number.parseInt(stepParam, 10)
    if (!Number.isFinite(parsedStep)) {
      hasSyncedStepFromUrl.current = true
      return
    }
    const boundedStep = Math.max(0, Math.min(7, parsedStep))
    setShowIntroduction(false)
    setCurrentStep(boundedStep)
    hasSyncedStepFromUrl.current = true
  }, [searchParams, setCurrentStep])

  useEffect(() => {
    if (showIntroduction) return
    const params = new URLSearchParams(searchParams.toString())
    const expected = String(currentStep)
    if (params.get('step') === expected) return
    params.set('step', expected)
    router.replace(`${pathname}?${params.toString()}`)
  }, [currentStep, pathname, router, searchParams, showIntroduction])

  const singularidadesMarciaisFiltered = useMemo(() => {
    if (!selectedEscolaMarcial) return [] as string[]
    const school = getMartialSchoolDataByIdResolved(selectedEscolaMarcial)
    if (!school) return []
    return singularidades.filter((s) => school.singularities.some((sing) => sing.id === s))
  }, [singularidades, selectedEscolaMarcial])

  /** PC gasto em singularidades (criação + ecoar + marciais + raciais), mesma regra de SingularitiesSpendingStep. */
  const gastosPCEmSingularidades = useMemo(() => {
    const criacaoCost = singularidades.reduce((sum, singId) => {
      if (getMartialSchoolSingularityById(singId)) return sum
      let sing: { cost?: number } | null | undefined = getCreationSingularityById(singId)
      if (!sing) sing = getSingularityById(singId)
      return sum + (sing?.cost || 0)
    }, 0)
    const ecoarCost = singularidadesEcoar.reduce((sum, singId) => {
      const sing = getEcoarSingularityById(singId)
      return sum + (sing?.cost || 0)
    }, 0)
    const marciaisCost = singularidades.reduce((sum, singId) => {
      const sing = getMartialSchoolSingularityById(singId)
      return sum + (sing?.cost ?? 0)
    }, 0)
    const raciaisCost = singularidadesRaciais.reduce((sum, singId) => {
      const sing = getRacialSingularityById(singId)
      return sum + (sing?.cost ?? 0)
    }, 0)
    return criacaoCost + ecoarCost + marciaisCost + raciaisCost
  }, [
    singularidades,
    singularidadesEcoar,
    singularidadesRaciais,
    getEcoarSingularityById,
  ])

  /** PC gasto na aba Trilha (base + caçada). */
  const gastosPCEmTrilha = useMemo(() => {
    const pathBaseSingularity = selectedTrilha ? getPathBaseSingularityByPathId(selectedTrilha) : null
    let total = 0
    if (pathSingularityBase && pathBaseSingularity) {
      total += pathBaseSingularity.cost
    }
    // Bruxarias are free
    pathCacadaPowers.forEach((powerId) => {
      const power = getCacadaPowerById(powerId)
      if (power) total += power.cost
    })
    pathCacadaEnhancements.forEach((enhId) => {
      const enh = getCacadaEnhancementById(enhId)
      if (enh) total += enh.cost
    })
    return total
  }, [selectedTrilha, pathSingularityBase, pathCacadaPowers, pathCacadaEnhancements])

  /** PC gasto em atributos (além dos 12) e aptidões (além dos 3). */
  const gastosPCEmTracos = useMemo(() => {
    const totalBase = CHARACTER_ATTRIBUTE_KEYS.reduce((sum, a) => {
      const k = a as keyof typeof attributes
      const rB = raceBonuses[k] || 0
      const mB = martialSchoolBonuses[k] || 0
      return sum + Math.max(0, (attributes[k] ?? 0) - rB - mB)
    }, 0)
    const pointsOverFreeAttrs = Math.max(0, totalBase - 12)
    const aptTotal = Object.values(aptitudes).reduce((s, l) => s + l, 0)
    const pointsOverFreeApt = Math.max(0, aptTotal - 3)
    return pointsOverFreeAttrs * 10 + pointsOverFreeApt * 20
  }, [attributes, aptitudes, raceBonuses, martialSchoolBonuses])

  /** Singularidades + trilha (tudo que não é traço atributo/aptidão). */
  const gastosPCNaoTracos = useMemo(
    () => gastosPCEmSingularidades + gastosPCEmTrilha,
    [gastosPCEmSingularidades, gastosPCEmTrilha],
  )

  /** Sincroniza gastos de PC na etapa "Gastando PC" a partir do estado (singularidades + trilha + traços). */
  useEffect(() => {
    if (currentStep !== 5) return
    handleCreationPointsSpentChange(gastosPCNaoTracos + gastosPCEmTracos)
  }, [currentStep, gastosPCNaoTracos, gastosPCEmTracos, handleCreationPointsSpentChange])

  const systemSingularities = useMemo(() => buildSystemSingularities(ecoarSingularities), [ecoarSingularities])
  const systemSingularityById = useMemo(() => {
    const map = new globalThis.Map<string, (typeof systemSingularities)[number]>()
    for (const s of systemSingularities) map.set(s.id, s)
    return map
  }, [systemSingularities])

  const singularityBonusesCreation = useMemo(
    () =>
      aggregateSimpleBonuses({
        ...aggregateSingularityInputFromCharacterData({
          singularidades,
          singularidadesEcoar,
          singularidadesMarciais: singularidadesMarciaisFiltered,
          singularidadesRaciais,
          singularidadesCondicionaisCriacaoAtivas: [],
          singularidadesCondicionaisAtivas: [],
          singularidadesCondicionaisMarciaisAtivas: [],
          singularidadesCondicionaisRaciaisAtivas: [],
        }),
        getSystemSingularityById: (id) => systemSingularityById.get(id),
      }),
    [
      singularidades,
      singularidadesEcoar,
      singularidadesMarciaisFiltered,
      singularidadesRaciais,
      systemSingularityById,
    ],
  )

  const bookDisadvantageCreation = useMemo(
    () => aggregateBookDisadvantagePenalties(selectedDisadvantages),
    [selectedDisadvantages],
  )

  const effectiveAttributesCreation = useMemo(() => {
    const attrsOnly = Object.fromEntries(
      CHARACTER_ATTRIBUTE_KEYS.map((k) => [k, { nivel: attributes[k as keyof typeof attributes] ?? 0 }]),
    ) as Record<string, { nivel?: number | string }>
    const bookAttr = bookDisadvantageCreation.attributes as Partial<
      Record<(typeof CHARACTER_ATTRIBUTE_KEYS)[number], number>
    >
    return computeEffectiveAttributeRows(attrsOnly, singularityBonusesCreation, {}, bookAttr)
  }, [attributes, singularityBonusesCreation, bookDisadvantageCreation])

  const signedSingularityEffects = useMemo(
    () => partitionSignedBonuses(singularityBonusesCreation),
    [singularityBonusesCreation],
  )

  const mergedEquipamentosLista = useMemo(
    () => [
      ...itensCatalogo.filter((i) => i.kind !== 'weapon').map((i) => i.displayLine),
      ...equipamentos,
    ],
    [itensCatalogo, equipamentos]
  )

  const mergedArmasLista = useMemo(
    () => [
      ...itensCatalogo.filter((i) => i.kind === 'weapon').map((i) => i.displayLine),
      ...armas,
    ],
    [itensCatalogo, armas]
  )

  const handleFinish = useCallback(() => {
    if (canProceed) {
      const soulLevel = getSoulLevelByNivel(nivelAlmaInicial)
      const pontosEvolucao = soulLevel?.pontosEvolucao ?? 0
      const nivelPoder = soulLevel?.nivelPoder ?? 3
      const nivelTrilha = getPathLevelFromSoulLevel(nivelAlmaInicial)
      // Keep tamanho and peso as strings (they can be numeric strings for modifiers or text for custom values)
      const catEquipLines = itensCatalogo.filter((i) => i.kind !== 'weapon').map((i) => i.displayLine)
      const catArmaLines = itensCatalogo.filter((i) => i.kind === 'weapon').map((i) => i.displayLine)
      const saldoMoedas = Math.max(0, equipmentOrcamentoCeros - sumCatalogItemsCeros(itensCatalogo))

      onComplete({
        nivelAlma: nivelAlmaInicial,
        nivelPoder,
        nivelTrilha,
        pontosEvolucao: { atual: pontosEvolucao, max: pontosEvolucao },
        raca: selectedRaca,
        escolaMarcial: (() => {
          const fromSings = Array.from(
            new Set(
              singularidades
                .map((s) => getMartialSchoolSingularityById(s)?.schoolId)
                .filter((id): id is string => Boolean(id)),
            ),
          ).sort()
          if (fromSings.length > 0) return fromSings[0]
          return resolveMartialSchoolDataId(selectedEscolaMarcial) ?? selectedEscolaMarcial
        })(),
        localizacao: selectedLocalizacao,
        attributes,
        skills,
        aptitudes,
        tamanho,
        peso,
        deslocamento,
        sentidos,
        trilha: selectedTrilha,
        singularidades,
        ecoar: selectedEcoar,
        singularidadesEcoar,
        singularidadesMarciais: singularidades.filter((s) => Boolean(getMartialSchoolSingularityById(s))),
        singularidadesRaciais,
        desvantagens: selectedDisadvantages,
        pontosCriacao,
        nome,
        backstory,
        tracoPositivo,
        tracoNegativo,
        personalidade,
        equipamentos: [...catEquipLines, ...equipamentos],
        armas: [...catArmaLines, ...armas],
        itensCatalogo,
        saldoMoedas,
        equipamentosLivres: equipamentos,
        armasLivres: armas,
        moeda: formatCerosDisplay(saldoMoedas),
      })
    }
  }, [
    canProceed,
    onComplete,
    nivelAlmaInicial,
    selectedRaca,
    selectedEscolaMarcial,
    selectedLocalizacao,
    attributes,
    skills,
    aptitudes,
    tamanho,
    peso,
    deslocamento,
    sentidos,
    selectedTrilha,
    singularidades,
    selectedEcoar,
    singularidadesEcoar,
    singularidadesRaciais,
    selectedDisadvantages,
    pontosCriacao,
    nome,
    backstory,
    tracoPositivo,
    tracoNegativo,
    personalidade,
    equipamentos,
    armas,
    itensCatalogo,
    equipmentOrcamentoCeros,
  ])

  const updateAttribute = (attr: string, newTotalValue: number) => {
    const attrKey = attr as keyof typeof attributes
    const oldValue = attributes[attrKey]
    const raceBonus = raceBonuses[attr] || 0
    const martialSchoolBonus = martialSchoolBonuses[attr] || 0
    const classBonus = 0 // TODO: Add class bonuses if needed
    const totalBonus = raceBonus + martialSchoolBonus + classBonus
    
    const maxLevel = currentStep === 9 ? 8 : 3 // Máximo 3 pontos base (exceto na Evolução que é 8)
    const maxTotalValue = maxLevel + totalBonus // Máximo total = máximo base + bônus
    
    // Calculate current base value (what user allocated)
    const currentBase = oldValue - totalBonus
    
    // Calculate new base value from the new total value
    const newBase = newTotalValue - totalBonus
    
    // Base value must be between 0 and maxLevel (user can allocate 0 to 3 points)
    const clampedNewBase = Math.max(0, Math.min(maxLevel, newBase))
    
    // Final value = clamped base + bonus (bonus is always applied, can be negative)
    const newValue = clampedNewBase + totalBonus
    
    if (newValue === oldValue) return
    
    // Calcula o valor base (sem bônus) antes e depois
    // Base pode ser negativo se bônus for negativo e não houver pontos alocados
    const oldBaseValue = oldValue - totalBonus
    const newBaseValue = newValue - totalBonus
    
    // Calcula o total de pontos base usados (sem bônus) ANTES da mudança
    // Só conta pontos base positivos (alocados pelo usuário)
    const oldTotalBasePoints = Object.entries(attributes).reduce((sum, [a, v]) => {
      const rB = raceBonuses[a] || 0
      const mB = martialSchoolBonuses[a] || 0
      const cB = 0 // TODO: Add class bonuses if needed
      const baseVal = v - (rB + mB + cB)
      return sum + Math.max(0, baseVal) // Só conta valores base positivos
    }, 0)
    
    // Calcula o total de pontos base usados (sem bônus) DEPOIS da mudança
    const newAttributes = { ...attributes, [attr]: newValue }
    const newTotalBasePoints = Object.entries(newAttributes).reduce((sum, [a, v]) => {
      const rB = raceBonuses[a] || 0
      const mB = martialSchoolBonuses[a] || 0
      const cB = 0 // TODO: Add class bonuses if needed
      const baseVal = v - (rB + mB + cB)
      return sum + Math.max(0, baseVal) // Só conta valores base positivos
    }, 0)
    
    // Quantos pontos além dos 12 gratuitos estão sendo usados
    const oldPointsOverFree = Math.max(0, oldTotalBasePoints - 12)
    const newPointsOverFree = Math.max(0, newTotalBasePoints - 12)
    const pointsOverFreeDiff = newPointsOverFree - oldPointsOverFree
    
    // Bug 1 Fix: Se o total já está acima de 12 (de PC gasto em step 5), permite diminuir mas não aumentar além do atual
    // Permite diminuir atributos mesmo se o total estiver acima de 12 (de PC gasto anteriormente)
    if (newTotalBasePoints > 12) {
      // Se está tentando aumentar além dos 12, não permite
      if (newTotalBasePoints > oldTotalBasePoints) {
        // Silenciosamente rejeita - mas agora pelo menos permite diminuir
        return
      }
      // Se está diminuindo (mesmo que o total ainda fique acima de 12), permite
      // Isso permite que o usuário ajuste atributos que foram aumentados com PC
    }
    
    // Se está usando apenas os 12 pontos gratuitos, atualiza normalmente
    setAttributes(newAttributes)
    setAttributePoints(Math.max(0, 12 - newTotalBasePoints))
  }

  const randomizeAttributes = () => {
    const totalPoints = 12 // 12 pontos gratuitos para distribuir
    const attributeKeys: (keyof typeof attributes)[] = ['carisma', 'finesse', 'forca', 'inteligencia', 'percepcao', 'vitalidade', 'vontade']
    const maxLevel = currentStep === 9 ? 8 : 3 // Máximo 3 exceto na Evolução
    const newAttributes: typeof attributes = {
      carisma: 0,
      finesse: 0,
      forca: 0,
      inteligencia: 0,
      percepcao: 0,
      vitalidade: 0,
      vontade: 0,
    }
    const baseValues: number[] = []
    
    // Calcula bônus de cada atributo (incluindo raça, escola marcial e classe)
    const bonusValues: number[] = []
    attributeKeys.forEach((attr) => {
      const raceBonus = raceBonuses[attr] || 0
      const martialSchoolBonus = martialSchoolBonuses[attr] || 0
      const classBonus = 0 // TODO: Add class bonuses if needed
      const totalBonus = raceBonus + martialSchoolBonus + classBonus
      bonusValues.push(totalBonus)
    })
    
    let remainingPoints = totalPoints
    
    // Inicializa valores base como 0
    for (let i = 0; i < attributeKeys.length; i++) {
      baseValues.push(0)
    }
    
    // Distribui os 12 pontos gratuitos aleatoriamente
    let attempts = 0
    while (remainingPoints > 0 && attempts < 1000) {
      attempts++
      const randomIndex = Math.floor(Math.random() * attributeKeys.length)
      const maxBaseValue = Math.max(0, maxLevel - bonusValues[randomIndex])
      const maxIncrease = Math.min(remainingPoints, maxBaseValue - baseValues[randomIndex])
      
      if (maxIncrease > 0) {
        const increase = Math.min(maxIncrease, remainingPoints)
        baseValues[randomIndex] += increase
        remainingPoints -= increase
      } else {
        // Se este atributo já está no máximo, verifica se todos estão no máximo
        const allAtMax = baseValues.every((val, idx) => val >= Math.max(0, maxLevel - bonusValues[idx]))
        if (allAtMax) break
      }
    }
    
    // Aplica valores base com bônus
    attributeKeys.forEach((attr, index) => {
      const totalBonus = bonusValues[index]
      newAttributes[attr] = Math.min(maxLevel, baseValues[index] + totalBonus)
    })
    
    setAttributes(newAttributes)
    setAttributePoints(remainingPoints) // Atualiza pontos gratuitos restantes
  }

  const stepVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  }

  const stepIcons = WIZARD_STEP_ICONS
  const stepTitles = [...WIZARD_STEP_TITLES]
  const totalSteps = WIZARD_TOTAL_STEPS

  // Tela de Introdução: Header + conteúdo largo; CTA e Footer ficam abaixo, é preciso rolar para alcançar
  if (showIntroduction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onGoToDashboard={onGoToDashboard} />
        <main className="flex-1 w-full min-h-[calc(100vh-4rem)] px-3 sm:px-4 md:px-6 py-6 md:py-8">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-ecoar-light-700 dark:bg-ecoar-dark-800/60 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] rounded-xl p-6 md:p-8 shadow-lg"
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg mb-3 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
                  <ScrollText className="w-6 h-6 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
                </div>
                <h1 className="text-xl font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900/90 mb-1">
                  Bem-vindo ao ECOAR
                </h1>
                <p className="text-ecoar-dark-600 dark:text-ecoar-light-900/60 text-sm max-w-xl">
                  Crie seu personagem e embarque em uma jornada épica. Escolha o nível inicial abaixo.
                </p>
              </div>

              <h2 className="text-base font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900/90 mb-1">
                Nível Inicial do Personagem
              </h2>
              <p className="text-xs text-ecoar-dark-500 dark:text-ecoar-light-900/50 mb-4">
                Esta escolha deve ser feita pelo Mestre Absoluto. Por padrão, recomenda-se Nível de Alma 1 para iniciantes.
              </p>
              <SoulLevelSelectionStep
                nivelAlmaInicial={nivelAlmaInicial}
                onSelect={setNivelAlmaInicial}
              />

              {/* CTA abaixo do conteúdo: é preciso rolar para alcançar */}
              <div className="mt-8 pt-6 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/60">
                  Nível {nivelAlmaInicial} selecionado
                </p>
                <motion.button
                  onClick={() => {
                    setShowIntroduction(false)
                    setCurrentStep(0)
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('step', '0')
                    router.replace(`${pathname}?${params.toString()}`)
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto min-w-[200px] py-2.5 px-6 bg-gradient-to-r from-ecoar-teal to-ecoar-magenta dark:from-ecoar-teal-600 dark:to-ecoar-magenta-600 hover:from-ecoar-teal/90 hover:to-ecoar-magenta/90 dark:hover:from-ecoar-teal-700 dark:hover:to-ecoar-magenta-700 text-white dark:text-ecoar-light-900/90 rounded-lg font-medium text-sm transition-all shadow-lg shadow-ecoar-teal/10 dark:shadow-ecoar-teal-600/20"
                >
                  Começar Criação
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-y-auto overflow-x-hidden">
      <div className="flex-shrink-0">
        <Header onGoToDashboard={onGoToDashboard} />
      </div>
      {/* Área de conteúdo preenche a viewport para o footer ficar sempre abaixo da dobra (só visível ao rolar) */}
      <div className="flex-1 min-h-[calc(100dvh-5rem)] flex items-stretch gap-4 min-w-0">
        {/* Sidebar Esquerda */}
        <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 p-3 min-h-0 max-h-[calc(100dvh-5rem)] overflow-y-auto overflow-x-hidden">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-ecoar-light-700 dark:bg-ecoar-dark-800/70 backdrop-blur-xl border-r border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06] rounded-lg p-4 flex flex-col min-h-0 flex-1 shadow-sm overflow-hidden"
          >
              {/* Header */}
              <div className="mb-5 pb-4 border-b border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06]">
                <h1 className="text-base font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900/90 mb-1.5">
                  Criação de Personagem
                </h1>
                <p className="text-[11px] text-slate-600 dark:text-ecoar-light-900/50">Nível {initialLevel}</p>
                {/* Progress Bar */}
                <div className="mt-3 w-full bg-ecoar-dark-300/20 dark:bg-white/[0.03] rounded-full h-1 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-ecoar-teal-600 to-ecoar-magenta-600 dark:from-ecoar-teal dark:to-ecoar-magenta"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / (totalSteps + 1)) * 100}%` }}
                    transition={motionTransition.smooth}
                  />
                </div>
                <p className="text-[11px] text-ecoar-dark-500 dark:text-ecoar-light-900/40 mt-1.5 text-center">
                  {currentStep + 1} de {totalSteps + 1} etapas
                </p>
              </div>

              {/* Steps List */}
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
                {stepTitles.map((title, idx) => {
                  const stepNum = idx
                  const StepIcon = stepIcons[idx] || Circle
                  const isActive = currentStep === stepNum
                  const isCompleted = currentStep > stepNum
                  // Permite clicar em qualquer etapa já visitada (até maxStepVisited) ou na etapa atual
                  const isClickable = stepNum <= maxStepVisited || stepNum === currentStep
                  const isPCStep = stepNum === 5 // Etapa "Gastando PC"
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <motion.button
                        onClick={() => {
                          if (isClickable && stepNum <= totalSteps) {
                            visitStep(stepNum)
                            if (isPCStep) {
                              setPCSubStep('singularidades')
                            }
                          }
                        }}
                        disabled={!isClickable}
                        whileHover={isClickable ? { x: 4 } : {}}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                          isActive
                            ? 'bg-teal-50 dark:bg-ecoar-teal-600/15 border border-teal-300 dark:border-ecoar-teal-500/20 text-slate-900 dark:text-ecoar-light-900/90'
                            : isCompleted
                            ? 'bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] text-ecoar-dark-700 dark:text-ecoar-light-900/70 hover:bg-ecoar-light-700 dark:hover:bg-ecoar-light-900/[0.06]'
                            : 'bg-transparent border border-ecoar-dark-300/20 dark:border-ecoar-light-900/[0.04] text-ecoar-dark-400 dark:text-ecoar-light-900/30 '
                        }`}
                      >
                        <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                          isActive
                            ? 'bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 text-ecoar-teal/80 dark:text-ecoar-teal-400/80'
                            : isCompleted
                            ? 'bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 text-ecoar-teal/80 dark:text-ecoar-teal-400/80'
                            : 'bg-slate-50 dark:bg-ecoar-light-900/[0.03] text-slate-400 dark:text-ecoar-light-900/20'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <StepIcon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-medium">
                            Etapa {stepNum + 1}
                          </div>
                          <div className={`text-xs font-medium truncate ${
                            isActive ? 'text-ecoar-dark-900 dark:text-ecoar-light-900/90' : 'text-ecoar-dark-600 dark:text-ecoar-light-900/60'
                          }`}>
                            {title}
                          </div>
                        </div>
                      </motion.button>
                      
                      {/* Sub-etapas para "Gastando PC" */}
                      {isPCStep && isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 space-y-1 border-l-2 border-ecoar-teal/30 pl-2"
                        >
                          {([
                            { id: 'singularidades', label: 'Singularidades', icon: Sparkles },
                            { id: 'traços', label: 'Traços', icon: Zap },
                          ] as const).map(({ id, label, icon: SubIcon }) => {
                            const isSubActive = pcSubStep === id
                            return (
                              <motion.button
                                key={id}
                                onClick={() => setPCSubStep(id)}
                                whileHover={{ x: 2 }}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left text-sm ${
                                  isSubActive
                                    ? 'bg-ecoar-teal-50 dark:bg-ecoar-teal-600/15 border border-ecoar-teal-400 dark:border-ecoar-teal-500/30 text-ecoar-dark-900 dark:text-ecoar-light-900'
                                    : 'bg-ecoar-light-800 dark:bg-ecoar-light-900/10 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/10 text-ecoar-dark-600 dark:text-ecoar-light-900/60 hover:bg-ecoar-light-700 dark:hover:bg-ecoar-light-900/15'
                                }`}
                              >
                                <SubIcon className={`w-3 h-3 ${isSubActive ? 'text-ecoar-teal-600 dark:text-ecoar-teal-400' : 'text-ecoar-dark-400 dark:text-ecoar-light-900/40'}`} />
                                <span className="text-xs font-medium">{label}</span>
                              </motion.button>
                            )
                          })}
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </aside>

        {/* Conteúdo Principal - altura natural para que o footer fique abaixo ao rolar */}
        <div className="flex-1 min-h-0 flex gap-4 min-w-0 items-stretch">
          <div className="flex-1 min-h-0 flex flex-col min-w-0 max-w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="max-w-[1400px] mx-auto w-full flex flex-col min-h-full">
          {/* Área Central - Conteúdo do Step */}
          <main className="flex flex-col w-full min-h-full">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-ecoar-light-700 dark:bg-ecoar-dark-800/85 backdrop-blur-xl border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06] rounded-lg p-5 flex flex-col w-full min-h-0 flex-1"
            >
              {/* Botões no topo à direita; na etapa 0 (detalhe da raça) vão no header do painel, alinhados ao título */}
              {!(currentStep === 0 && selectedRaca) && (
                <div className="flex justify-end gap-2 shrink-0 pb-4">
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={ChevronLeft}
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="min-h-[44px]"
                  >
                    Voltar
                  </Button>
                  {currentStep < totalSteps ? (
                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={ChevronRight}
                      onClick={handleNext}
                      disabled={!canProceed}
                      className="min-h-[44px]"
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      leftIcon={Sparkle}
                      onClick={handleFinish}
                      disabled={!canProceed}
                      className="min-h-[44px]"
                    >
                      Finalizar
                    </Button>
                  )}
                </div>
              )}
              <div className="flex flex-col w-full min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-5 scrollbar-hide pr-1">
                {/* Step 0: Raça Selection */}
                {currentStep === 0 && (
                  selectedRaca ? (
                    <SelectionDetailsPanel 
                      type="race"
                      selectedId={selectedRaca}
                      getItemById={getRaceById}
                      onBack={() => setSelectedRaca('')}
                      onSelect={(id) => setSelectedRaca(id)}
                      headerActions={
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="md"
                            leftIcon={ChevronLeft}
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="min-h-[44px]"
                          >
                            Voltar
                          </Button>
                          {currentStep < totalSteps ? (
                            <Button
                              variant="primary"
                              size="md"
                              rightIcon={ChevronRight}
                              onClick={handleNext}
                              disabled={!canProceed}
                              className="min-h-[44px]"
                            >
                              Próximo
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="md"
                              leftIcon={Sparkle}
                              onClick={handleFinish}
                              disabled={!canProceed}
                              className="min-h-[44px]"
                            >
                              Finalizar
                            </Button>
                          )}
                        </div>
                      }
                    />
                  ) : (
                    <RaceSelectionStep
                      selectedRaca={selectedRaca}
                      onRacaSelect={(raca) => {
                        setSelectedRaca(raca)
                      }}
                      availableRaces={availableRaces}
                    />
                  )
                )}

                {/* Step 1: Attributes */}
                {currentStep === 1 && (
                  <AttributesStep
                    attributes={attributes}
                    attributePoints={attributePoints}
                    pontosCriacao={pontosCriacao}
                    onUpdate={updateAttribute}
              raceBonuses={raceBonuses}
              martialSchoolBonuses={martialSchoolBonuses}
              classBonuses={{}}
              onRandomize={randomizeAttributes}
                    onPointsChange={handleCreationPointsSpentChange}
                    isEvolutionStep={false}
                  />
                )}

                {/* Step 2: Skills */}
                {currentStep === 2 && (
                  <SkillsStep
                    skills={skills}
                    skillPoints={skillPoints}
                    pontosCriacao={pontosCriacao}
                    onSkillsChange={setSkills}
                    onSkillPointsChange={setSkillPoints}
                    onPointsChange={handleCreationPointsSpentChange}
                    isEvolutionStep={false}
                  />
                )}

                {/* Step 3: Aptitudes */}
                {currentStep === 3 && (
                  <AptitudesStep
                    aptitudes={aptitudes}
                    pontosCriacao={pontosCriacao}
                    onAptitudesChange={setAptitudes}
                    onPointsChange={handleCreationPointsSpentChange}
                    aptitudePoints={aptitudePoints}
                    onAptitudePointsChange={setAptitudePoints}
                    isEvolutionStep={false}
                  />
                )}

                {/* Step 4: Pontos de Criação com Desvantagens */}
                {currentStep === 4 && (
                  <CreationPointsStep
                    pontosCriacao={pontosCriacao}
                    onPointsChange={setPontosCriacao}
                    singularidades={singularidades}
                    selectedDisadvantages={selectedDisadvantages}
                    onDisadvantagesChange={setSelectedDisadvantages}
                  />
                )}

                {/* Step 5: Gastando PC (com sub-etapas na sidebar) */}
                {currentStep === 5 && (
                  <PCSpendingStep
                    singularidades={singularidades}
                    selectedEcoar={selectedEcoar}
                    singularidadesEcoar={singularidadesEcoar}
                    selectedTrilha={selectedTrilha}
                    onTrilhaSelect={handleTrilhaSelectForPCStep}
                    pathSingularityBase={pathSingularityBase}
                    onPathSingularityBaseChange={setPathSingularityBase}
                    pathBruxarias={pathBruxarias}
                    onPathBruxariasChange={setPathBruxarias}
                    pathCacadaPowers={pathCacadaPowers}
                    onPathCacadaPowersChange={setPathCacadaPowers}
                    pathCacadaEnhancements={pathCacadaEnhancements}
                    onPathCacadaEnhancementsChange={setPathCacadaEnhancements}
                    attributes={attributes}
                    skills={skills}
                    aptitudes={aptitudes}
                    selectedEscolaMarcial={selectedEscolaMarcial}
                    onEscolaMarcialSelect={setSelectedEscolaMarcial}
                    selectedRaca={selectedRaca}
                    singularidadesMarciais={singularidades.filter(s => {
                      const school = getMartialSchoolDataByIdResolved(selectedEscolaMarcial)
                      return school?.singularities.some(sing => sing.id === s)
                    })}
                    onSingularidadesMarciaisChange={(singIds) => {
                      // Remove singularidades marciais antigas e adiciona novas
                      const otherSingularities = singularidades.filter(s => {
                        const school = getMartialSchoolDataByIdResolved(selectedEscolaMarcial)
                        return !school?.singularities.some(sing => sing.id === s)
                      })
                      setSingularidades([...otherSingularities, ...singIds])
                    }}
                    singularidadesRaciais={singularidadesRaciais}
                    onSingularidadesRaciaisChange={setSingularidadesRaciais}
                    raceBonuses={raceBonuses}
                    martialSchoolBonuses={martialSchoolBonuses}
                    pontosDisponiveis={pontosCriacao.disponiveis}
                    onSingularidadesChange={setSingularidades}
                    onEcoarSelect={setSelectedEcoar}
                    onSingularidadesEcoarChange={setSingularidadesEcoar}
                    onAttributesChange={(attrs: Record<string, number>) => setAttributes(attrs as typeof attributes)}
                    onSkillsChange={setSkills}
                    onAptitudesChange={setAptitudes}
                    pontosCriacao={pontosCriacao}
                    nivelAlma={nivelAlmaInicial}
                    activeSubStep={pcSubStep}
                    onSubStepChange={setPCSubStep}
                    selectedDisadvantages={selectedDisadvantages}
                  />
                )}

                {/* Etapa 6: Evolução removida do fluxo (mantido apenas como placeholder) */}
                {false && (
                  nivelAlmaInicial > 1 ? (
                    <EvolutionStep
                      nivelAlmaInicial={nivelAlmaInicial}
                      pontosEvolucao={getSoulLevelByNivel(nivelAlmaInicial)?.pontosEvolucao || 0}
                    />
                  ) : (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
                            <Sparkles className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-0.5">
                              Evolução do Personagem
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50">
                              Esta etapa está disponível apenas para personagens com Nível de Alma acima de 1
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Aviso */}
                      <div className="p-6 rounded-lg border-2 border-ecoar-magenta/30 dark:border-ecoar-magenta-500/30 bg-ecoar-magenta/10 dark:bg-ecoar-magenta-800/20">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-ecoar-magenta dark:text-ecoar-magenta-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-slate-700 dark:text-ecoar-light-900/80 space-y-2">
                            <p className="font-semibold text-slate-900 dark:text-ecoar-light-900">
                              Evolução não disponível para Nível de Alma 1
                            </p>
                            <p>
                              A etapa de Evolução permite usar Pontos de Evolução para evoluir atributos, habilidades, aptidões e adquirir singularidades. 
                              No entanto, esta funcionalidade está disponível apenas para personagens que começam com <strong>Nível de Alma acima de 1</strong>.
                            </p>
                            <p>
                              Se você escolheu começar no Nível de Alma 1, você pode avançar para a próxima etapa. 
                              Durante o jogo, conforme seu personagem evolui e ganha níveis, você poderá usar Pontos de Evolução para melhorar seu personagem.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Step 6: Equipamentos */}
                {currentStep === 6 && (
                  <>
                    {equipmentSaldoRestante < 0 && (
                      <div className="mb-4 p-4 rounded-lg border-2 border-ecoar-magenta/40 bg-ecoar-magenta/10 text-sm text-slate-800 dark:text-ecoar-light-900/90">
                        <strong>Orçamento insuficiente.</strong> Remova itens do catálogo ou volte para ajustar Pontos de Criação não
                        gastos — o saldo ficou negativo em {formatCerosDisplay(Math.abs(equipmentSaldoRestante))}.
                      </div>
                    )}
                    <EquipmentStep
                      itensCatalogo={itensCatalogo}
                      onItensCatalogoChange={setItensCatalogo}
                      orcamentoCeros={equipmentOrcamentoCeros}
                      saldoRestanteCeros={equipmentSaldoRestante}
                    />
                  </>
                )}

                {/* Step 7: Finalização */}
                {currentStep === 7 && (
                  <BackgroundStep
                    nome={nome}
                    backstory={backstory}
                    tracoPositivo={tracoPositivo}
                    tracoNegativo={tracoNegativo}
                    personalidade={personalidade}
                    onNomeChange={setNome}
                    onBackstoryChange={setBackstory}
                    onTracoPositivoChange={setTracoPositivo}
                    onTracoNegativoChange={setTracoNegativo}
                    onPersonalidadeChange={setPersonalidade}
                  />
                )}
              </div>
          </motion.div>
          </main>
          </div>
          </div>
          
          {/* Sidebar Direita - Resumo */}
          <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 p-3 min-h-0 max-h-[calc(100dvh-5rem)] overflow-y-auto overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-ecoar-light-700 dark:bg-ecoar-dark-800/70 backdrop-blur-xl border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06] rounded-lg p-4 flex flex-col min-h-0 flex-1 shadow-sm overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-3 shrink-0">
                Resumo
              </h3>
              <div className="space-y-3 text-xs flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                {/* Raça com detalhes */}
                {selectedRaca && (
                  <div>
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2">Raça</div>
                    <div className="text-ecoar-dark-900 dark:text-ecoar-light-900 font-semibold mb-2">
                      {getRaceById(selectedRaca)?.name || '—'}
                    </div>
                    {(() => {
                      const race = getRaceById(selectedRaca)
                      if (!race?.bonuses) return null
                      
                      return (
                        <div className="space-y-1.5 text-xs">
                          {race.bonuses.movement && (
                            <div className="flex items-center gap-2 text-slate-700 dark:text-ecoar-light-900/70">
                              <Footprints className="w-3 h-3 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                              <span>
                                {race.bonuses.movement.terrestre && `Terrestre: ${race.bonuses.movement.terrestre}m`}
                                {race.bonuses.movement.aquatico && ` • Aquático: ${race.bonuses.movement.aquatico}m`}
                                {race.bonuses.movement.aereo && ` • Aéreo: ${race.bonuses.movement.aereo}m`}
                              </span>
                            </div>
                          )}
                          {race.bonuses.senses && (
                            <div className="space-y-1">
                              {race.bonuses.senses.visao !== undefined && (
                                <div className="flex items-center gap-2 text-slate-700 dark:text-ecoar-light-900/70">
                                  <Eye className="w-3 h-3 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                                  <span>Visão: {race.bonuses.senses.visao}m</span>
                                </div>
                              )}
                              {race.bonuses.senses.audicao !== undefined && (
                                <div className="flex items-center gap-2 text-slate-700 dark:text-ecoar-light-900/70">
                                  <Users className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                                  <span>Audição: {race.bonuses.senses.audicao}m</span>
                                </div>
                              )}
                              {race.bonuses.senses.olfato !== undefined && (
                                <div className="flex items-center gap-2 text-slate-700 dark:text-ecoar-light-900/70">
                                  <Star className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                                  <span>Olfato: {race.bonuses.senses.olfato}m</span>
                                </div>
                              )}
                            </div>
                          )}
                          {(race.bonuses.attributes && Object.keys(race.bonuses.attributes).length > 0) || race.bonuses.sizeModifier || race.bonuses.weightModifier ? (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {/* Manual attribute bonuses */}
                              {race.bonuses.attributes && Object.entries(race.bonuses.attributes).map(([attr, value]) => (
                                <span key={attr} className="text-xs px-1.5 py-0.5 rounded bg-ecoar-teal/20 dark:bg-ecoar-teal-600/30 text-ecoar-teal dark:text-ecoar-teal-300 border border-ecoar-teal/30 dark:border-ecoar-teal-500/40">
                                  {attr === 'carisma' ? 'Car' : attr === 'finesse' ? 'Fin' : attr === 'forca' ? 'For' : attr === 'inteligencia' ? 'Int' : attr === 'percepcao' ? 'Per' : attr === 'vitalidade' ? 'Vit' : 'Von'}+{value}
                                </span>
                              ))}
                              {/* Automatic bonuses from size modifier */}
                              {race.bonuses.sizeModifier !== undefined && race.bonuses.sizeModifier !== 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-ecoar-magenta/20 dark:bg-ecoar-magenta-600/30 text-ecoar-magenta dark:text-ecoar-magenta-300 border border-ecoar-magenta/30 dark:border-ecoar-magenta-500/40" title={`Tamanho ${race.bonuses.sizeModifier} = Força ${race.bonuses.sizeModifier > 0 ? '+' : ''}${race.bonuses.sizeModifier}`}>
                                  For{race.bonuses.sizeModifier > 0 ? '+' : ''}{race.bonuses.sizeModifier} (Tamanho)
                                </span>
                              )}
                              {/* Automatic bonuses from weight modifier */}
                              {race.bonuses.weightModifier !== undefined && race.bonuses.weightModifier !== 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-ecoar-magenta/20 dark:bg-ecoar-magenta-600/30 text-ecoar-magenta dark:text-ecoar-magenta-300 border border-ecoar-magenta/30 dark:border-ecoar-magenta-500/40" title={`Peso ${race.bonuses.weightModifier} = Vitalidade ${race.bonuses.weightModifier > 0 ? '+' : ''}${race.bonuses.weightModifier}`}>
                                  Vit{race.bonuses.weightModifier > 0 ? '+' : ''}{race.bonuses.weightModifier} (Peso)
                                </span>
                              )}
                              {/* Size and weight modifiers effect on esquiva */}
                              {(race.bonuses.sizeModifier !== undefined && race.bonuses.sizeModifier !== 0) || (race.bonuses.weightModifier !== undefined && race.bonuses.weightModifier !== 0) ? (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 dark:bg-orange-600/30 text-orange-600 dark:text-orange-300 border border-orange-500/30 dark:border-orange-500/40" title={`Esquiva: -(${race.bonuses.sizeModifier ?? 0} + ${race.bonuses.weightModifier ?? 0}) = ${-((race.bonuses.sizeModifier ?? 0) + (race.bonuses.weightModifier ?? 0))}`}>
                                  Esq{(() => {
                                    const penalty = -((race.bonuses.sizeModifier ?? 0) + (race.bonuses.weightModifier ?? 0))
                                    return penalty > 0 ? `+${penalty}` : `${penalty}`
                                  })()}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* Escola Marcial */}
                {selectedEscolaMarcial && (
                  <div>
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-1">Escola Marcial</div>
                    <div className="text-ecoar-dark-900 dark:text-ecoar-light-900">
                      {getMartialSchoolDataByIdResolved(selectedEscolaMarcial)?.name ||
                        getMartialSchoolById(selectedEscolaMarcial)?.name ||
                        '—'}
                    </div>
                  </div>
                )}
                
                {/* Trilha */}
                {selectedTrilha && (
                  <div>
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-1">Trilha</div>
                    <div className="text-ecoar-dark-900 dark:text-ecoar-light-900">
                      {getPathById(selectedTrilha)?.name || '—'}
                    </div>
                  </div>
                )}
                {/* Atributos (nível armazenado + efetivo com singularidades) */}
                {Object.keys(attributes).length > 0 &&
                  CHARACTER_ATTRIBUTE_KEYS.some(
                    (k) =>
                      (attributes[k as keyof typeof attributes] ?? 0) > 0 ||
                      (effectiveAttributesCreation[k]?.singularityBonus ?? 0) !== 0 ||
                      (effectiveAttributesCreation[k]?.bookDisadvantageBonus ?? 0) !== 0,
                  ) && (
                  <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                      Atributos
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55 mb-2">
                      Número principal = base (raça/escola + pontos). Linha &quot;Efetivo&quot; inclui singularidades e desvantagens do livro.
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {CHARACTER_ATTRIBUTE_KEYS.map((attr) => {
                        const value = attributes[attr as keyof typeof attributes] ?? 0
                        const eff = effectiveAttributesCreation[attr]
                        if (value === 0 && (eff?.singularityBonus ?? 0) === 0 && (eff?.bookDisadvantageBonus ?? 0) === 0) return null
                        const storedMod = getAttributeModifier(value)
                        const label =
                          attr === 'carisma'
                            ? 'Car'
                            : attr === 'finesse'
                              ? 'Fin'
                              : attr === 'forca'
                                ? 'For'
                                : attr === 'inteligencia'
                                  ? 'Int'
                                  : attr === 'percepcao'
                                    ? 'Per'
                                    : attr === 'vitalidade'
                                      ? 'Vit'
                                      : 'Von'
                        return (
                          <SummaryItem
                            key={attr}
                            label={label}
                            value={
                              <div className="flex flex-col items-end gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{value}</span>
                                  <span className="text-ecoar-teal/70 dark:text-ecoar-teal-400">
                                    ({formatModifier(storedMod)})
                                  </span>
                                </div>
                                {((eff?.singularityBonus ?? 0) !== 0 || (eff?.bookDisadvantageBonus ?? 0) !== 0) && (
                                  <span className="text-[10px] text-ecoar-teal-600 dark:text-ecoar-teal-400 leading-tight text-right">
                                    Efetivo {eff.effectiveLevel} {formatModifier(eff.effectiveMod)}
                                  </span>
                                )}
                              </div>
                            }
                          />
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Habilidades */}
                {Object.keys(skills).length > 0 && (
                  <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                      <BookOpen className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                      Habilidades
                    </div>
                    <div className="space-y-1">
                      {Object.entries(skills)
                        .filter(([_, skill]) => skill.level > 0)
                        .slice(0, 5)
                        .map(([skillId, skill]) => {
                          const skillData = getSkillById(skillId)
                          if (!skillData) return null
                          const skBonus =
                            (singularityBonusesCreation.skills[skillId] ?? 0) +
                            (bookDisadvantageCreation.skills[skillId] ?? 0)
                          return (
                            <SummaryItem
                              key={skillId}
                              label={skillData.name}
                              value={
                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                  <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">Nv.{skill.level}</span>
                                  {skBonus !== 0 && (
                                    <span className="text-[10px] px-1 py-0.5 rounded bg-ecoar-teal/15 text-ecoar-teal-700 dark:text-ecoar-teal-300 border border-ecoar-teal/25">
                                      bônus {formatModifier(skBonus)}
                                    </span>
                                  )}
                                  {skill.specialization && (
                                    <span className="text-ecoar-magenta/70 dark:text-ecoar-magenta-400 text-[10px]">Esp.</span>
                                  )}
                                </div>
                              }
                              className="text-xs"
                            />
                          )
                        })}
                      {Object.keys(skills).filter(id => skills[id].level > 0).length > 5 && (
                        <div className="text-slate-400 dark:text-ecoar-light-900/40 text-[10px] text-center pt-1">
                          +{Object.keys(skills).filter(id => skills[id].level > 0).length - 5} mais
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Aptidões */}
                {Object.keys(aptitudes).length > 0 && Object.values(aptitudes).some(v => v > 0) && (
                  <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                      <Award className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                      Aptidões
                    </div>
                    <div className="space-y-1">
                      {Object.entries(aptitudes)
                        .filter(([_, level]) => level > 0)
                        .map(([aptId, level]) => {
                          const aptData = getAptitudeById(aptId)
                          if (!aptData) return null
                          return (
                            <SummaryItem
                              key={aptId}
                              label={aptData.name}
                              value={`Nv.${level}`}
                              className="text-xs"
                            />
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Desvantagens */}
                {selectedDisadvantages.length > 0 && (
                  <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                      <Skull className="w-3 h-3 text-magenta-600 dark:text-ecoar-magenta-400" />
                      Desvantagens
                    </div>
                    <div className="space-y-1">
                      {selectedDisadvantages.map((disId) => {
                        const dis = getDisadvantageById(disId)
                        if (!dis) return null
                        return (
                          <div key={disId} className="p-1.5 bg-magenta-50 dark:bg-ecoar-magenta-800/50 rounded border border-magenta-200 dark:border-ecoar-magenta-600 text-xs">
                            <span className="text-slate-700 dark:text-ecoar-light-900/90">{dis.name}</span>
                            <span className="text-slate-900 dark:text-ecoar-light-900 ml-1 font-medium">+{dis.pontosCriacao} PC</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Singularidades */}
                {singularidades.length > 0 && (
                  <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                      Singularidades
                    </div>
                    <div className="space-y-1">
                      {singularidades.map((singId) => {
                        const sing = getSingularityById(singId)
                        if (!sing) return null
                        return (
                          <SummaryItem
                            key={singId}
                            label={sing.name}
                            value=""
                            className="text-xs"
                          />
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Efeitos numéricos agregados (singularidades): bônus e desvantagens */}
                {(Object.keys(signedSingularityEffects.bonusAttributes).length > 0 ||
                  Object.keys(signedSingularityEffects.penaltyAttributes).length > 0 ||
                  Object.keys(signedSingularityEffects.bonusSkills).length > 0 ||
                  Object.keys(signedSingularityEffects.penaltySkills).length > 0 ||
                  singularityBonusesCreation.corpo !== 0 ||
                  singularityBonusesCreation.mente !== 0 ||
                  singularityBonusesCreation.folego !== 0 ||
                  singularityBonusesCreation.mana !== 0) && (
                  <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                      Singularidades: efeitos numéricos
                    </div>
                    <div className="space-y-2 text-[10px]">
                      {(Object.keys(signedSingularityEffects.bonusAttributes).length > 0 ||
                        Object.keys(signedSingularityEffects.bonusSkills).length > 0 ||
                        singularityBonusesCreation.corpo > 0 ||
                        singularityBonusesCreation.mente > 0 ||
                        singularityBonusesCreation.folego > 0 ||
                        singularityBonusesCreation.mana > 0) && (
                        <div className="p-2 rounded border border-ecoar-teal/25 bg-ecoar-teal/5 dark:bg-ecoar-teal-900/10">
                          <div className="font-semibold text-ecoar-teal-800 dark:text-ecoar-teal-300 mb-1">Bônus</div>
                          <ul className="space-y-0.5 text-slate-700 dark:text-ecoar-light-900/80">
                            {Object.entries(signedSingularityEffects.bonusAttributes).map(([k, v]) => (
                              <li key={`ba-${k}`}>
                                Atributo {k}: +{v}
                              </li>
                            ))}
                            {Object.entries(signedSingularityEffects.bonusSkills).map(([id, v]) => (
                              <li key={`bs-${id}`}>
                                {getSkillById(id)?.name ?? id}: +{v}
                              </li>
                            ))}
                            {singularityBonusesCreation.corpo > 0 && <li>Corpo: +{singularityBonusesCreation.corpo}</li>}
                            {singularityBonusesCreation.mente > 0 && <li>Mente: +{singularityBonusesCreation.mente}</li>}
                            {singularityBonusesCreation.folego > 0 && <li>Fôlego: +{singularityBonusesCreation.folego}</li>}
                            {singularityBonusesCreation.mana > 0 && <li>Mana: +{singularityBonusesCreation.mana}</li>}
                          </ul>
                        </div>
                      )}
                      {(Object.keys(signedSingularityEffects.penaltyAttributes).length > 0 ||
                        Object.keys(signedSingularityEffects.penaltySkills).length > 0 ||
                        singularityBonusesCreation.corpo < 0 ||
                        singularityBonusesCreation.mente < 0 ||
                        singularityBonusesCreation.folego < 0 ||
                        singularityBonusesCreation.mana < 0) && (
                        <div className="p-2 rounded border border-ecoar-magenta/30 bg-ecoar-magenta/5 dark:bg-ecoar-magenta-900/15">
                          <div className="font-semibold text-ecoar-magenta-800 dark:text-ecoar-magenta-300 mb-1">
                            Desvantagens (singularidades)
                          </div>
                          <ul className="space-y-0.5 text-slate-700 dark:text-ecoar-light-900/80">
                            {Object.entries(signedSingularityEffects.penaltyAttributes).map(([k, v]) => (
                              <li key={`pa-${k}`}>
                                Atributo {k}: {v}
                              </li>
                            ))}
                            {Object.entries(signedSingularityEffects.penaltySkills).map(([id, v]) => (
                              <li key={`ps-${id}`}>
                                {getSkillById(id)?.name ?? id}: {v}
                              </li>
                            ))}
                            {singularityBonusesCreation.corpo < 0 && <li>Corpo: {singularityBonusesCreation.corpo}</li>}
                            {singularityBonusesCreation.mente < 0 && <li>Mente: {singularityBonusesCreation.mente}</li>}
                            {singularityBonusesCreation.folego < 0 && <li>Fôlego: {singularityBonusesCreation.folego}</li>}
                            {singularityBonusesCreation.mana < 0 && <li>Mana: {singularityBonusesCreation.mana}</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Equipamentos */}
                {(mergedEquipamentosLista.length > 0 || mergedArmasLista.length > 0) && (
                  <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                      <Package className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                      Equipamentos
                    </div>
                    <div className="space-y-1">
                      {mergedEquipamentosLista.length > 0 && (
                        <div>
                          <div className="text-slate-600 dark:text-ecoar-light-900/60 text-[10px] mb-1">Equipamentos:</div>
                          {mergedEquipamentosLista.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="p-1.5 bg-slate-50 dark:bg-ecoar-light-900/10 rounded border border-slate-200 dark:border-ecoar-light-900/20 text-xs mb-1">
                              <span className="text-slate-700 dark:text-ecoar-light-900/80">{item}</span>
                            </div>
                          ))}
                          {mergedEquipamentosLista.length > 3 && (
                            <div className="text-slate-400 dark:text-ecoar-light-900/40 text-[10px] text-center pt-1">
                              +{mergedEquipamentosLista.length - 3} mais
                            </div>
                          )}
                        </div>
                      )}
                      {mergedArmasLista.length > 0 && (
                        <div className="mt-2">
                          <div className="text-slate-600 dark:text-ecoar-light-900/60 text-[10px] mb-1">Armas:</div>
                          {mergedArmasLista.slice(0, 3).map((item, idx) => (
                            <SummaryItem
                              key={idx}
                              label={item}
                              value=""
                              className="text-xs mb-1"
                            />
                          ))}
                          {mergedArmasLista.length > 3 && (
                            <div className="text-slate-400 dark:text-ecoar-light-900/40 text-[10px] text-center pt-1">
                              +{mergedArmasLista.length - 3} mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pontos de Criação */}
                <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                  <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2">Pontos de Criação</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-teal-600 dark:text-ecoar-teal-400 font-semibold">{pontosCriacao.disponiveis}</div>
                      <div className="text-slate-400 dark:text-ecoar-light-900/40 text-xs">disponíveis</div>
                    </div>
                    <div className="text-slate-400 dark:text-ecoar-light-900/40">/</div>
                    <div className="flex-1 text-right">
                      <div className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{pontosCriacao.obtidos}</div>
                      <div className="text-slate-400 dark:text-ecoar-light-900/40 text-xs">total</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  )
}

// Step Components

import { RaceSelectionStep } from '@/components/wizard/steps/RaceSelectionStep'
import { MartialSchoolSelectionStep } from '@/components/wizard/steps/MartialSchoolSelectionStep'
import { MartialSchoolDetailsPanel } from '@/components/wizard/steps/MartialSchoolDetailsPanel'
import { MartialSchoolPCSpendingStep } from '@/components/wizard/steps/pc-spending/MartialSchoolPCSpendingStep'
import { MartialSchoolSingularitiesPurchase } from '@/components/wizard/steps/pc-spending/MartialSchoolSingularitiesPurchase'
import { MartialSchoolSingularitiesStep } from '@/components/wizard/steps/pc-spending/MartialSchoolSingularitiesStep'
import { SelectionDetailsPanel } from '@/components/wizard/steps/SelectionDetailsPanel'
import { BonusDetailsPanel } from '@/components/wizard/steps/BonusDetailsPanel'
import { RaceComparisonSection } from '@/components/wizard/steps/RaceComparisonSection'
import { SoulLevelSelectionStep } from '@/components/wizard/steps/SoulLevelSelectionStep'
import { PathSelectionStep } from '@/components/wizard/steps/PathSelectionStep'
import { AttributesStep } from '@/components/wizard/steps/AttributesStep'
import { EquipmentStep } from '@/components/wizard/steps/EquipmentStep'
import { LocationSelectionStep } from '@/components/wizard/steps/LocationSelectionStep'
import { SkillsStep } from '@/components/wizard/steps/SkillsStep'
import { AptitudesStep } from '@/components/wizard/steps/AptitudesStep'
import { EvolutionStep } from '@/components/wizard/steps/EvolutionStep'
import { PhysicalCharacteristicsStep } from '@/components/wizard/steps/PhysicalCharacteristicsStep'
import { PathSingularitiesTab } from '@/components/wizard/steps/pc-spending/PathSingularitiesTab'
import { PCSpendingStep } from '@/components/wizard/steps/pc-spending/PCSpendingStep'
import { SingularitiesSpendingStep } from '@/components/wizard/steps/pc-spending/SingularitiesSpendingStep'
import { EcoarSingularitiesList } from '@/components/wizard/steps/pc-spending/EcoarSingularitiesList'
import { MartialSingularitiesTab } from '@/components/wizard/steps/pc-spending/MartialSingularitiesTab'
import { RacialSingularitiesTab } from '@/components/wizard/steps/pc-spending/RacialSingularitiesTab'
import { EcoarSelection } from '@/components/wizard/steps/pc-spending/EcoarSelection'
import { TraitsSpendingStep } from '@/components/wizard/steps/pc-spending/TraitsSpendingStep'
import { SingularitiesStep } from '@/components/wizard/steps/SingularitiesStep'
import { EcoarStep } from '@/components/wizard/steps/EcoarStep'
import { CreationPointsStep } from '@/components/wizard/steps/CreationPointsStep'
import { BackgroundStep } from '@/components/wizard/steps/BackgroundStep'
import { FinalReviewVisualizer } from '@/components/wizard/steps/FinalReviewVisualizer'
import { FinalReviewStep } from '@/components/wizard/steps/FinalReviewStep'
