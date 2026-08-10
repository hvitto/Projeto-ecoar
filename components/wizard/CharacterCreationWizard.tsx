'use client'

// Shell legado. Estado do wizard em features/character/wizard.
import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react'
import { WizardFormProvider, useWizardForm } from '@/features/character/wizard/WizardFormContext'
import { LazySoulLevelSelectionStep } from '@/components/wizard/wizardLazySteps'
import CharacterCreationWizardShell from '@/features/character/components/wizard/CharacterCreationWizardShell'
import WizardStepNav from '@/features/character/components/wizard/WizardStepNav'
import WizardStepRenderer from '@/features/character/components/wizard/WizardStepRenderer'
import WizardSummarySidebar from '@/features/character/components/wizard/WizardSummarySidebar'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { fadeInUp, motionTransition } from '@/lib/motionVariants'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StampButton from '@/components/beyond/StampButton'
import {
  hairline,
  kicker,
  panel,
  statusLabel as statusLabelClass,
} from '@/shared/styles/ecoarChrome'
import { races, getRaceById } from '@/data/races'
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
import { soulLevels, getSoulLevelByNivel, SoulLevel, getEstagios, resolveSoulLevelOrDefault } from '@/data/soulLevels'
import { disadvantages, getDisadvantageById, getDisadvantagesByCategory } from '@/data/disadvantages'
import { getAttributeModifier, getSkillDice, formatModifier, calculateCharacterLimits, toLimitShape } from '@/lib/calculations'
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
import { sumPathExtraCosts } from '@/data/pathExtraOptions'
import {
  pathBaseSingularities,
  getPathBaseSingularityByPathId,
  getPathBaseSingularityById,
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
  getBruxariaExtraCostTotal,
  Bruxaria,
  CacadaPower,
  CacadaEnhancement,
} from '@/data/pathSingularities'
import { getDisturbiosPontosEcoarObtidos } from '@/data/disturbios'
import type { CatalogEntry, CatalogOwnedItem } from '@/shared/types/equipment'
import { catalogDisplayLine, formatCerosDisplay, newCatalogInstanceId, sumCatalogItemsCeros } from '@/lib/equipmentCost'
import { WIZARD_TOTAL_STEPS } from '@/features/character/constants/wizardSteps'
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
  disturbios?: import('@/data/disturbios').DisturbioOwnedEntry[]
  ecoarAcoes?: string[]
  pontosEcoar?: { obtidos: number; gastos: number; disponiveis: number }

  // Step 11 (complemento): singularidades marciais e raciais
  singularidadesMarciais?: string[]
  singularidadesRaciais?: string[]
  singularidadesPath?: string[]
  pathCacadaPowers?: string[]
  pathCacadaEnhancements?: string[]
  pathExtraIds?: string[]
  pathPatronChoice?: string
  pathHonorCode?: string
  pathSingularityBase?: string
  pathBruxarias?: string[]

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

  corpo?: { atual: number; max: number }
  mente?: { atual: number; max: number }
  folego?: { atual: number; max: number }
  mana?: { atual: number; max: number }
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

export default function CharacterCreationWizard(props: CharacterCreationWizardProps) {
  return (
    <WizardFormProvider>
      <CharacterCreationWizardInner {...props} />
    </WizardFormProvider>
  )
}

function CharacterCreationWizardInner({ onComplete, initialData, onGoToDashboard }: CharacterCreationWizardProps) {
  const { ecoarSingularities, getEcoarSingularityById } = useEcoarCatalogData()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { state: form, dispatch, patch } = useWizardForm()
  const [showIntroduction, setShowIntroduction] = useState(true)
  const [confirmLevelLock, setConfirmLevelLock] = useState(false)
  const [isStartingCreation, setIsStartingCreation] = useState(false)
  const [narrowViewport, setNarrowViewport] = useState(false)
  const confirmLockRef = useRef<HTMLDivElement | null>(null)
  const [pcSubStep, setPCSubStep] = useState<'singularidades' | 'traços' | 'escola-marcial'>('singularidades')
  const hasInitialized = useRef(false)
  const hasSyncedStepFromUrl = useRef(false)

  const {
    nivelAlmaInicial,
    selectedRaca,
    selectedEscolaMarcial,
    selectedLocalizacao,
    selectedTrilha,
    attributes,
    attributePoints,
    skillPoints,
    aptitudePoints,
    selectedDisadvantages,
    skills,
    aptitudes,
    tamanho,
    peso,
    deslocamento,
    sentidos,
    singularidades,
    selectedEcoar,
    singularidadesEcoar,
    disturbios,
    ecoarAcoes,
    singularidadesRaciais,
    pathSingularityBase,
    pathBruxarias,
    pathCacadaPowers,
    pathCacadaEnhancements,
    pathExtraIds,
    pathPatronChoice,
    pathHonorCode,
    pontosCriacao,
    nome,
    backstory,
    tracoPositivo,
    tracoNegativo,
    personalidade,
    equipamentos,
    armas,
    itensCatalogo,
    raceBonuses,
    martialSchoolBonuses,
  } = form

  const setNivelAlmaInicial = useCallback((v: number) => patch({ nivelAlmaInicial: v }), [patch])
  const setSelectedRaca = useCallback((v: string) => patch({ selectedRaca: v }), [patch])
  const setSelectedEscolaMarcial = useCallback((v: string) => patch({ selectedEscolaMarcial: v }), [patch])
  const setSelectedLocalizacao = useCallback((v: string) => patch({ selectedLocalizacao: v }), [patch])
  const setSelectedTrilha = useCallback((v: string) => patch({ selectedTrilha: v }), [patch])
  const setAttributes = useCallback(
    (v: typeof attributes | ((prev: typeof attributes) => typeof attributes)) =>
      patch({ attributes: typeof v === 'function' ? v(form.attributes) : v }),
    [patch, form.attributes],
  )
  const setAttributePoints = useCallback((v: number) => patch({ attributePoints: v }), [patch])
  const setSkillPoints = useCallback((v: number) => patch({ skillPoints: v }), [patch])
  const setAptitudePoints = useCallback((v: number) => patch({ aptitudePoints: v }), [patch])
  const setSelectedDisadvantages = useCallback((v: string[]) => patch({ selectedDisadvantages: v }), [patch])
  const setSkills = useCallback(
    (v: typeof skills | ((prev: typeof skills) => typeof skills)) =>
      patch({ skills: typeof v === 'function' ? v(form.skills) : v }),
    [patch, form.skills],
  )
  const setAptitudes = useCallback(
    (v: typeof aptitudes | ((prev: typeof aptitudes) => typeof aptitudes)) =>
      patch({ aptitudes: typeof v === 'function' ? v(form.aptitudes) : v }),
    [patch, form.aptitudes],
  )
  const setTamanho = useCallback((v: string) => patch({ tamanho: v }), [patch])
  const setPeso = useCallback((v: string) => patch({ peso: v }), [patch])
  const setDeslocamento = useCallback((v: typeof deslocamento) => patch({ deslocamento: v }), [patch])
  const setSentidos = useCallback((v: typeof sentidos) => patch({ sentidos: v }), [patch])
  const setSingularidades = useCallback((v: string[]) => patch({ singularidades: v }), [patch])
  const setSelectedEcoar = useCallback((v: string) => patch({ selectedEcoar: v }), [patch])
  const setSingularidadesEcoar = useCallback((v: string[]) => patch({ singularidadesEcoar: v }), [patch])
  const setDisturbios = useCallback(
    (v: import('@/data/disturbios').DisturbioOwnedEntry[]) => patch({ disturbios: v }),
    [patch],
  )
  const setEcoarAcoes = useCallback((v: string[]) => patch({ ecoarAcoes: v }), [patch])
  const setSingularidadesRaciais = useCallback((v: string[]) => patch({ singularidadesRaciais: v }), [patch])
  const setPathSingularityBase = useCallback((v: string) => patch({ pathSingularityBase: v }), [patch])
  const setPathBruxarias = useCallback((v: string[]) => patch({ pathBruxarias: v }), [patch])
  const setPathCacadaPowers = useCallback((v: string[]) => patch({ pathCacadaPowers: v }), [patch])
  const setPathCacadaEnhancements = useCallback((v: string[]) => patch({ pathCacadaEnhancements: v }), [patch])
  const setPathExtraIds = useCallback((v: string[]) => patch({ pathExtraIds: v }), [patch])
  const setPathPatronChoice = useCallback((v: string) => patch({ pathPatronChoice: v }), [patch])
  const setPathHonorCode = useCallback((v: string) => patch({ pathHonorCode: v }), [patch])
  const setPontosCriacao = useCallback((v: typeof pontosCriacao) => dispatch({ type: 'SET_PONTOS_CRIACAO', pontosCriacao: v }), [dispatch])
  const setNome = useCallback((v: string) => patch({ nome: v }), [patch])
  const setBackstory = useCallback((v: string) => patch({ backstory: v }), [patch])
  const setTracoPositivo = useCallback((v: string) => patch({ tracoPositivo: v }), [patch])
  const setTracoNegativo = useCallback((v: string) => patch({ tracoNegativo: v }), [patch])
  const setPersonalidade = useCallback((v: string) => patch({ personalidade: v }), [patch])
  const setEquipamentos = useCallback((v: string[]) => patch({ equipamentos: v }), [patch])
  const setArmas = useCallback((v: string[]) => patch({ armas: v }), [patch])
  const setItensCatalogo = useCallback((v: CatalogOwnedItem[]) => patch({ itensCatalogo: v }), [patch])
  const setRaceBonuses = useCallback((v: Record<string, number>) => patch({ raceBonuses: v }), [patch])
  const setMartialSchoolBonuses = useCallback((v: Record<string, number>) => patch({ martialSchoolBonuses: v }), [patch])

  const handleCreationPointsSpentChange = useCallback(
    (gastos: number) => dispatch({ type: 'SET_PONTOS_CRIACAO_GASTOS', gastos }),
    [dispatch],
  )

  const handleTrilhaSelectForPCStep = useCallback(
    (id: string) => dispatch({ type: 'CLEAR_PATH_ON_TRILHA_CHANGE', trilha: id }),
    [dispatch],
  )

  // Initialize states from initialData when editing an existing character
  // This should only run once when the component mounts with initialData
  useEffect(() => {
    if (!initialData || hasInitialized.current) return

    const nivelAlma =
      initialData.nivelAlma !== undefined && initialData.nivelAlma !== null
        ? typeof initialData.nivelAlma === 'string'
          ? parseInt(initialData.nivelAlma, 10)
          : initialData.nivelAlma
        : undefined

    patch({
      ...(initialData.raca ? { selectedRaca: initialData.raca } : {}),
      ...(initialData.escolaMarcial ? { selectedEscolaMarcial: initialData.escolaMarcial } : {}),
      ...(initialData.localizacao ? { selectedLocalizacao: initialData.localizacao } : {}),
      ...(initialData.trilha ? { selectedTrilha: initialData.trilha } : {}),
      ...(initialData.ecoar ? { selectedEcoar: initialData.ecoar } : {}),
      ...(Number.isFinite(nivelAlma) ? { nivelAlmaInicial: nivelAlma as number } : {}),
      ...(initialData.attributes ? { attributes: initialData.attributes as typeof attributes } : {}),
      ...(initialData.skills ? { skills: initialData.skills } : {}),
      ...(initialData.aptitudes ? { aptitudes: initialData.aptitudes } : {}),
      ...(initialData.tamanho ? { tamanho: initialData.tamanho } : {}),
      ...(initialData.peso ? { peso: initialData.peso } : {}),
      ...(initialData.deslocamento
        ? {
            deslocamento: {
              terrestre: initialData.deslocamento.terrestre || 0,
              aquatico: initialData.deslocamento.aquatico || 0,
              aereo: initialData.deslocamento.aereo || 0,
            },
          }
        : {}),
      ...(initialData.sentidos
        ? {
            sentidos: {
              visao: initialData.sentidos.visao || 0,
              audicao: initialData.sentidos.audicao || 0,
              olfato: initialData.sentidos.olfato || 0,
            },
          }
        : {}),
      ...(initialData.singularidades ? { singularidades: initialData.singularidades } : {}),
      ...(initialData.singularidadesEcoar ? { singularidadesEcoar: initialData.singularidadesEcoar } : {}),
      ...(Array.isArray(initialData.disturbios) ? { disturbios: initialData.disturbios } : {}),
      ...(Array.isArray(initialData.ecoarAcoes) ? { ecoarAcoes: initialData.ecoarAcoes } : {}),
      ...(initialData.pontosCriacao ? { pontosCriacao: initialData.pontosCriacao } : {}),
      ...(initialData.nome ? { nome: initialData.nome } : {}),
      ...(initialData.backstory ? { backstory: initialData.backstory } : {}),
      ...(initialData.tracoPositivo ? { tracoPositivo: initialData.tracoPositivo } : {}),
      ...(initialData.tracoNegativo ? { tracoNegativo: initialData.tracoNegativo } : {}),
      ...(initialData.personalidade ? { personalidade: initialData.personalidade } : {}),
      ...(Array.isArray((initialData as { desvantagens?: string[] }).desvantagens)
        ? { selectedDisadvantages: (initialData as { desvantagens: string[] }).desvantagens }
        : {}),
      ...(Array.isArray(initialData.itensCatalogo) && initialData.itensCatalogo.length > 0
        ? {
            itensCatalogo: initialData.itensCatalogo as CatalogOwnedItem[],
            equipamentos: Array.isArray(initialData.equipamentosLivres) ? initialData.equipamentosLivres : [],
            armas: Array.isArray(initialData.armasLivres) ? initialData.armasLivres : [],
          }
        : {
            itensCatalogo: [],
            ...(initialData.equipamentos ? { equipamentos: initialData.equipamentos } : {}),
            ...(initialData.armas ? { armas: initialData.armas } : {}),
          }),
      ...(typeof initialData.pathSingularityBase === 'string'
        ? { pathSingularityBase: initialData.pathSingularityBase }
        : {}),
      ...(Array.isArray(initialData.pathBruxarias) ? { pathBruxarias: initialData.pathBruxarias } : {}),
      ...(Array.isArray(initialData.pathCacadaPowers)
        ? { pathCacadaPowers: initialData.pathCacadaPowers }
        : {}),
      ...(Array.isArray(initialData.pathCacadaEnhancements)
        ? { pathCacadaEnhancements: initialData.pathCacadaEnhancements }
        : {}),
      ...(Array.isArray(initialData.pathExtraIds) ? { pathExtraIds: initialData.pathExtraIds } : {}),
      ...(typeof initialData.pathPatronChoice === 'string'
        ? { pathPatronChoice: initialData.pathPatronChoice }
        : {}),
      ...(typeof initialData.pathHonorCode === 'string'
        ? { pathHonorCode: initialData.pathHonorCode }
        : {}),
      ...(Array.isArray(initialData.singularidadesRaciais)
        ? { singularidadesRaciais: initialData.singularidadesRaciais }
        : {}),
      ...(Array.isArray(initialData.desvantagens)
        ? { selectedDisadvantages: initialData.desvantagens }
        : {}),
    })

    setShowIntroduction(false)
    hasInitialized.current = true
  }, [initialData, patch])

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
    const gastos = pontosCriacao.gastos
    const disponiveis = totalCreationPoints - gastos
    if (pontosCriacao.obtidos === totalCreationPoints && pontosCriacao.disponiveis === disponiveis) {
      return
    }
    dispatch({
      type: 'SET_PONTOS_CRIACAO',
      pontosCriacao: { obtidos: totalCreationPoints, gastos, disponiveis },
    })
  }, [totalCreationPoints, pontosCriacao.gastos, pontosCriacao.obtidos, pontosCriacao.disponiveis, dispatch])

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
          .filter((s) => (s.acquisitionPhase ?? 'creation') === 'creation' && (s.cost ?? 0) === 0)
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

  const stepValidation = useMemo(
    () => ({
      selectedRaca,
      attributes,
      attributePoints,
      skillPoints,
      nome,
      equipmentSaldoRestante,
    }),
    [selectedRaca, attributes, attributePoints, skillPoints, nome, equipmentSaldoRestante],
  )

  const {
    currentStep,
    maxStepVisited,
    canProceed,
    canGoNext,
    goNext: handleNext,
    goBack: handleBack,
    setStep: setCurrentStep,
    visitStep,
  } = useCharacterWizard(stepValidation)

  const beginCreation = useCallback(() => {
    if (isStartingCreation) return
    const resolved = resolveSoulLevelOrDefault(nivelAlmaInicial)
    if (resolved.nivel !== nivelAlmaInicial) {
      setNivelAlmaInicial(resolved.nivel)
    }
    setIsStartingCreation(true)
    setConfirmLevelLock(false)
    setShowIntroduction(false)
    setCurrentStep(0)
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', '0')
    router.replace(`${pathname}?${params.toString()}`)
  }, [
    isStartingCreation,
    nivelAlmaInicial,
    pathname,
    router,
    searchParams,
    setCurrentStep,
    setNivelAlmaInicial,
  ])

  const requestBeginCreation = useCallback(() => {
    if (isStartingCreation) return
    if (soulLevels.length === 0) {
      if (nivelAlmaInicial !== 1) setNivelAlmaInicial(1)
      beginCreation()
      return
    }
    const resolved = getSoulLevelByNivel(nivelAlmaInicial)
    if (!resolved) {
      setNivelAlmaInicial(1)
      beginCreation()
      return
    }
    if (nivelAlmaInicial > 1) {
      setConfirmLevelLock(true)
      return
    }
    beginCreation()
  }, [beginCreation, isStartingCreation, nivelAlmaInicial, setNivelAlmaInicial])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const sync = () => setNarrowViewport(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!confirmLevelLock) return
    const node = confirmLockRef.current
    const previous = document.activeElement as HTMLElement | null
    const mobilePrimary = document.querySelector<HTMLElement>(
      '[data-soul-level-confirm-mobile]',
    )
    const desktopPrimary = node?.querySelector<HTMLElement>(
      '[data-soul-level-confirm-desktop]',
    )
    const focusTarget =
      (narrowViewport ? mobilePrimary : desktopPrimary) ?? node
    focusTarget?.focus?.()
    node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setConfirmLevelLock(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previous?.focus?.()
    }
  }, [confirmLevelLock, narrowViewport])

  const syncStepToUrl = useCallback(
    (step: number) => {
      const params = new URLSearchParams(window.location.search)
      params.set('step', String(step))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router],
  )

  const onVisitStep = useCallback(
    (step: number) => {
      visitStep(step)
      syncStepToUrl(step)
    },
    [visitStep, syncStepToUrl],
  )

  const onNext = useCallback(() => {
    if (!canGoNext) return
    handleNext()
    syncStepToUrl(Math.min(currentStep + 1, WIZARD_TOTAL_STEPS))
  }, [canGoNext, currentStep, handleNext, syncStepToUrl])

  const onBack = useCallback(() => {
    if (currentStep === 0) return
    handleBack()
    syncStepToUrl(currentStep - 1)
  }, [currentStep, handleBack, syncStepToUrl])

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

  const singularidadesMarciaisFiltered = useMemo(() => {
    return singularidades.filter((s) => Boolean(getMartialSchoolSingularityById(s)))
  }, [singularidades])

  /** PC gasto em singularidades (criação + marciais + raciais). Ecoar usa Pontos de Ecoar. */
  const gastosPCEmSingularidades = useMemo(() => {
    const criacaoCost = singularidades.reduce((sum, singId) => {
      if (getMartialSchoolSingularityById(singId)) return sum
      let sing: { cost?: number } | null | undefined = getCreationSingularityById(singId)
      if (!sing) sing = getSingularityById(singId)
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
    return criacaoCost + marciaisCost + raciaisCost
  }, [singularidades, singularidadesRaciais])

  /** PC gasto na aba Trilha (base + caçada). */
  const gastosPCEmTrilha = useMemo(() => {
    const pathBaseSingularity = pathSingularityBase
      ? getPathBaseSingularityById(pathSingularityBase)
      : null
    let total = 0
    if (pathSingularityBase && pathBaseSingularity) {
      total += pathBaseSingularity.cost
    }
    pathCacadaPowers.forEach((powerId) => {
      const power = getCacadaPowerById(powerId)
      if (power) total += power.cost
    })
    pathCacadaEnhancements.forEach((enhId) => {
      const enh = getCacadaEnhancementById(enhId)
      if (enh) total += enh.cost
    })
    total += sumPathExtraCosts(pathExtraIds)
    total += getBruxariaExtraCostTotal(pathBruxarias.length)
    return total
  }, [pathSingularityBase, pathCacadaPowers, pathCacadaEnhancements, pathExtraIds, pathBruxarias])

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

  /** Sincroniza gastos de PC na etapa "Gastando PC" antes do paint (evita flash 30 → valor real). */
  useLayoutEffect(() => {
    if (currentStep !== 5) return
    handleCreationPointsSpentChange(gastosPCNaoTracos + gastosPCEmTracos)
  }, [currentStep, gastosPCNaoTracos, gastosPCEmTracos, handleCreationPointsSpentChange])

  const pontosCriacaoExibicao = useMemo(() => {
    if (currentStep !== 5) return pontosCriacao
    const gastos = gastosPCNaoTracos + gastosPCEmTracos
    return {
      obtidos: pontosCriacao.obtidos,
      gastos,
      disponiveis: pontosCriacao.obtidos - gastos,
    }
  }, [currentStep, pontosCriacao, gastosPCNaoTracos, gastosPCEmTracos])

  const systemSingularities = useMemo(() => buildSystemSingularities(ecoarSingularities), [ecoarSingularities])
  const systemSingularityById = useMemo(() => {
    const map = new globalThis.Map<string, (typeof systemSingularities)[number]>()
    for (const s of systemSingularities) map.set(s.id, s)
    return map
  }, [systemSingularities])

  const singularityBonusesCreation = useMemo(
    () =>
      aggregateSimpleBonuses({
        ...aggregateSingularityInputFromCharacterData(
          {
            singularidades,
            singularidadesEcoar,
            singularidadesMarciais: singularidadesMarciaisFiltered,
            singularidadesRaciais,
            singularidadesPath: [...pathCacadaPowers, ...pathCacadaEnhancements, ...pathExtraIds],
            singularidadesCondicionaisCriacaoAtivas: [],
            singularidadesCondicionaisAtivas: [],
            singularidadesCondicionaisMarciaisAtivas: [],
            singularidadesCondicionaisRaciaisAtivas: [],
            singularidadesCondicionaisPathAtivas: [],
          },
          { isMartialId: (id) => Boolean(getMartialSchoolSingularityById(id)) },
        ),
        getSystemSingularityById: (id) => systemSingularityById.get(id),
      }),
    [
      singularidades,
      singularidadesEcoar,
      singularidadesMarciaisFiltered,
      singularidadesRaciais,
      pathCacadaPowers,
      pathCacadaEnhancements,
      pathExtraIds,
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

  const creationLimits = useMemo(() => {
    const soulLevel = getSoulLevelByNivel(nivelAlmaInicial)
    const nivelPoder = soulLevel?.nivelPoder ?? 3
    const race = selectedRaca ? getRaceById(selectedRaca) : undefined
    const raceCorpo = race?.bonuses?.corpo ?? 0
    const raceMente = race?.bonuses?.mente ?? 0
    return calculateCharacterLimits({
      vitalidade: effectiveAttributesCreation.vitalidade?.effectiveLevel ?? 0,
      vontade: effectiveAttributesCreation.vontade?.effectiveLevel ?? 0,
      nivelPoder,
      corpoBonus: singularityBonusesCreation.corpo + bookDisadvantageCreation.corpo + raceCorpo,
      menteBonus: singularityBonusesCreation.mente + bookDisadvantageCreation.mente + raceMente,
      folegoBonus: singularityBonusesCreation.folego + bookDisadvantageCreation.folego,
      manaBonus: singularityBonusesCreation.mana + bookDisadvantageCreation.mana,
    })
  }, [
    nivelAlmaInicial,
    selectedRaca,
    effectiveAttributesCreation.vitalidade?.effectiveLevel,
    effectiveAttributesCreation.vontade?.effectiveLevel,
    singularityBonusesCreation.corpo,
    singularityBonusesCreation.mente,
    singularityBonusesCreation.folego,
    singularityBonusesCreation.mana,
    bookDisadvantageCreation.corpo,
    bookDisadvantageCreation.mente,
    bookDisadvantageCreation.folego,
    bookDisadvantageCreation.mana,
  ])

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
      const limits = calculateCharacterLimits({
        vitalidade: effectiveAttributesCreation.vitalidade?.effectiveLevel ?? 0,
        vontade: effectiveAttributesCreation.vontade?.effectiveLevel ?? 0,
        nivelPoder,
        corpoBonus:
          singularityBonusesCreation.corpo +
          bookDisadvantageCreation.corpo +
          (getRaceById(selectedRaca)?.bonuses?.corpo ?? 0),
        menteBonus:
          singularityBonusesCreation.mente +
          bookDisadvantageCreation.mente +
          (getRaceById(selectedRaca)?.bonuses?.mente ?? 0),
        folegoBonus: singularityBonusesCreation.folego + bookDisadvantageCreation.folego,
        manaBonus: singularityBonusesCreation.mana + bookDisadvantageCreation.mana,
      })

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
        singularidades: singularidades.filter((s) => !getMartialSchoolSingularityById(s)),
        ecoar: selectedEcoar,
        singularidadesEcoar,
        disturbios,
        ecoarAcoes,
        pontosEcoar: {
          obtidos: getDisturbiosPontosEcoarObtidos(disturbios),
          gastos: singularidadesEcoar.reduce(
            (sum, id) => sum + (getEcoarSingularityById(id)?.cost ?? 0),
            0,
          ),
          disponiveis:
            getDisturbiosPontosEcoarObtidos(disturbios) -
            singularidadesEcoar.reduce((sum, id) => sum + (getEcoarSingularityById(id)?.cost ?? 0), 0),
        },
        singularidadesMarciais: singularidades.filter((s) => Boolean(getMartialSchoolSingularityById(s))),
        singularidadesRaciais,
        singularidadesPath: [...pathCacadaPowers, ...pathCacadaEnhancements, ...pathExtraIds],
        pathCacadaPowers,
        pathCacadaEnhancements,
        pathExtraIds,
        pathPatronChoice,
        pathHonorCode,
        pathSingularityBase,
        pathBruxarias,
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
        corpo: toLimitShape(limits.corpoMax),
        mente: toLimitShape(limits.menteMax),
        folego: toLimitShape(limits.folegoMax),
        mana: toLimitShape(limits.manaMax),
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
    disturbios,
    ecoarAcoes,
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
    effectiveAttributesCreation,
    singularityBonusesCreation,
    bookDisadvantageCreation,
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

  const totalSteps = WIZARD_TOTAL_STEPS

  if (showIntroduction) {
    const catalogEmpty = soulLevels.length === 0
    const resolvedLevel = resolveSoulLevelOrDefault(nivelAlmaInicial)
    const locksLevel = !catalogEmpty && resolvedLevel.nivel > 1
    const ctaLabel = locksLevel
      ? `Travar Alma ${resolvedLevel.nivel} e criar`
      : 'Começar criação'
    const statusLabel = catalogEmpty
      ? 'Catálogo offline · Alma 1'
      : locksLevel
        ? `Alma ${resolvedLevel.nivel} · não poderá mudar depois`
        : 'Alma 1 · pronto para criar'
    return (
      <div className="h-full min-h-0 flex flex-col overflow-y-auto overscroll-y-contain">
        <Header onGoToDashboard={onGoToDashboard} />
        <main
          className={`flex-1 w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 sm:pb-8 ${
            confirmLevelLock
              ? 'pb-[calc(15.5rem+env(safe-area-inset-bottom))]'
              : 'pb-[calc(12rem+env(safe-area-inset-bottom))]'
          }`}
        >
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className={`${panel} p-4 sm:p-6 md:p-8`}
            >
              <div className="mb-5 sm:mb-6">
                <p className={`${kicker} mb-3`}>
                  1://WIZARD · INTRO
                </p>
                <h1 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] uppercase leading-[0.9] tracking-[-0.03em] text-ecoar-dark-900 dark:text-ecoar-light-900 mb-2 max-w-[12ch]">
                  Bem-vindo ao ECOAR
                </h1>
                <p className="text-xs leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] max-w-[42ch] font-normal">
                  Confirme o Nível de Alma inicial. A maioria das mesas começa no Alma 1.
                </p>
              </div>

              <LazySoulLevelSelectionStep
                nivelAlmaInicial={nivelAlmaInicial}
                onSelect={(nivel) => {
                  setConfirmLevelLock(false)
                  setNivelAlmaInicial(nivel)
                }}
              />

              {confirmLevelLock ? (
                <div
                  ref={confirmLockRef}
                  role="alertdialog"
                  aria-modal="true"
                  tabIndex={-1}
                  aria-labelledby="soul-level-lock-title"
                  aria-describedby="soul-level-lock-desc"
                  className={`mt-8 pt-6 border-t ${hairline} space-y-4 outline-none`}
                >
                  <p
                    id="soul-level-lock-title"
                    className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900"
                  >
                    Travar Alma {resolvedLevel.nivel}
                  </p>
                  <p
                    id="soul-level-lock-desc"
                    className="text-xs leading-relaxed text-ecoar-dark-600 dark:text-[#c5c8ce] max-w-[48ch] font-normal"
                  >
                    Alma {resolvedLevel.nivel} será travado nesta ficha. PE e orçamento em ȼ ficam
                    definidos por esse nível e não poderão ser alterados depois.
                  </p>
                  <div className="hidden sm:flex flex-col sm:flex-row gap-2">
                    <StampButton
                      tone="ghost"
                      onClick={() => setConfirmLevelLock(false)}
                      className="w-full sm:w-auto font-normal"
                      disabled={isStartingCreation}
                    >
                      Alterar nível
                    </StampButton>
                    <StampButton
                      onClick={beginCreation}
                      className="w-full sm:w-auto min-w-[200px] font-normal"
                      disabled={isStartingCreation}
                      data-soul-level-confirm-desktop
                    >
                      {isStartingCreation ? 'Abrindo criação…' : ctaLabel}
                    </StampButton>
                  </div>
                </div>
              ) : (
                <div className={`hidden sm:flex mt-8 pt-6 border-t ${hairline} flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3`}>
                  <p className={statusLabelClass}>
                    {statusLabel}
                  </p>
                  <StampButton
                    onClick={requestBeginCreation}
                    className="w-full sm:w-auto min-w-[200px] font-normal"
                    disabled={isStartingCreation}
                  >
                    {isStartingCreation ? 'Abrindo criação…' : ctaLabel}
                  </StampButton>
                </div>
              )}
            </motion.div>
          </div>
        </main>

        {!confirmLevelLock ? (
          <div
            className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-ecoar-teal/50 dark:border-ecoar-teal bg-[#1a1d21]/96 backdrop-blur-[2px] px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.35)]"
            data-soul-level-dock="cta"
          >
            <p className={`${statusLabelClass} mb-2.5 text-center`}>
              {statusLabel}
            </p>
            <StampButton
              onClick={requestBeginCreation}
              className="w-full font-normal min-h-[52px] text-[0.8125rem]"
              disabled={isStartingCreation}
            >
              {isStartingCreation ? 'Abrindo criação…' : ctaLabel}
            </StampButton>
          </div>
        ) : (
          <div
            className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-ecoar-teal/50 dark:border-ecoar-teal bg-[#1a1d21]/96 backdrop-blur-[2px] px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2 shadow-[0_-8px_24px_rgba(0,0,0,0.35)]"
            data-soul-level-dock="confirm"
          >
            <p className={`${statusLabelClass} mb-1 text-center`}>
              Alma {resolvedLevel.nivel} · confirmação
            </p>
            <StampButton
              tone="grid"
              onClick={() => setConfirmLevelLock(false)}
              className="w-full font-normal min-h-[48px]"
              disabled={isStartingCreation}
            >
              Alterar nível
            </StampButton>
            <StampButton
              onClick={beginCreation}
              className="w-full font-normal min-h-[52px] text-[0.8125rem]"
              disabled={isStartingCreation}
              data-soul-level-confirm-mobile
            >
              {isStartingCreation ? 'Abrindo criação…' : ctaLabel}
            </StampButton>
          </div>
        )}

        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <CharacterCreationWizardShell
      onGoToDashboard={onGoToDashboard}
      currentStep={currentStep}
      initialLevel={nivelAlmaInicial}
      leftNav={
        <WizardStepNav
          currentStep={currentStep}
          maxStepVisited={maxStepVisited}
          initialLevel={nivelAlmaInicial}
          pcSubStep={pcSubStep}
          onVisitStep={onVisitStep}
          onPcSubStepChange={setPCSubStep}
        />
      }
      summarySidebar={
        <WizardSummarySidebar
          selectedRaca={selectedRaca}
          selectedEscolaMarcial={selectedEscolaMarcial}
          selectedTrilha={selectedTrilha}
          attributes={attributes}
          skills={skills}
          aptitudes={aptitudes}
          selectedDisadvantages={selectedDisadvantages}
          singularidades={singularidades}
          pontosCriacao={pontosCriacaoExibicao}
          mergedEquipamentosLista={mergedEquipamentosLista}
          mergedArmasLista={mergedArmasLista}
          effectiveAttributesCreation={effectiveAttributesCreation}
          singularityBonusesCreation={singularityBonusesCreation}
          bookDisadvantageCreation={bookDisadvantageCreation}
          signedSingularityEffects={signedSingularityEffects}
          creationLimits={creationLimits}
        />
      }
    >
      <main className="flex flex-col w-full flex-1 min-h-0">
        <motion.div
          key={currentStep}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/85 dark:bg-ecoar-dark-800/90 border border-ecoar-teal/50 dark:border-ecoar-teal rounded-none p-3 sm:p-5 flex flex-col w-full min-h-0 flex-1 overflow-hidden"
        >
          <WizardStepRenderer
            currentStep={currentStep}
            totalSteps={totalSteps}
            canProceed={canProceed}
            selectedRaca={selectedRaca}
            availableRaces={availableRaces}
            attributes={attributes}
            attributePoints={attributePoints}
            pontosCriacao={pontosCriacaoExibicao}
            skills={skills}
            skillPoints={skillPoints}
            aptitudes={aptitudes}
            aptitudePoints={aptitudePoints}
            singularidades={singularidades}
            selectedEcoar={selectedEcoar}
            singularidadesEcoar={singularidadesEcoar}
            disturbios={disturbios}
            ecoarAcoes={ecoarAcoes}
            selectedTrilha={selectedTrilha}
            pathSingularityBase={pathSingularityBase}
            pathBruxarias={pathBruxarias}
            pathCacadaPowers={pathCacadaPowers}
            pathCacadaEnhancements={pathCacadaEnhancements}
            pathExtraIds={pathExtraIds}
            pathPatronChoice={pathPatronChoice}
            pathHonorCode={pathHonorCode}
            selectedEscolaMarcial={selectedEscolaMarcial}
            singularidadesRaciais={singularidadesRaciais}
            selectedDisadvantages={selectedDisadvantages}
            raceBonuses={raceBonuses}
            martialSchoolBonuses={martialSchoolBonuses}
            nivelAlmaInicial={nivelAlmaInicial}
            pcSubStep={pcSubStep}
            itensCatalogo={itensCatalogo}
            equipmentOrcamentoCeros={equipmentOrcamentoCeros}
            equipmentSaldoRestante={equipmentSaldoRestante}
            nome={nome}
            backstory={backstory}
            tracoPositivo={tracoPositivo}
            tracoNegativo={tracoNegativo}
            personalidade={personalidade}
            onBack={onBack}
            onNext={onNext}
            onFinish={handleFinish}
            onRacaSelect={setSelectedRaca}
            onRacaClear={() => setSelectedRaca('')}
            updateAttribute={updateAttribute}
            onRandomizeAttributes={randomizeAttributes}
            onCreationPointsSpentChange={handleCreationPointsSpentChange}
            setSkills={setSkills}
            setSkillPoints={setSkillPoints}
            setAptitudes={setAptitudes}
            setAptitudePoints={setAptitudePoints}
            setPontosCriacao={setPontosCriacao}
            setSelectedDisadvantages={setSelectedDisadvantages}
            handleTrilhaSelectForPCStep={handleTrilhaSelectForPCStep}
            setPathSingularityBase={setPathSingularityBase}
            setPathBruxarias={setPathBruxarias}
            setPathCacadaPowers={setPathCacadaPowers}
            setPathCacadaEnhancements={setPathCacadaEnhancements}
            setPathExtraIds={setPathExtraIds}
            setPathPatronChoice={setPathPatronChoice}
            setPathHonorCode={setPathHonorCode}
            setSelectedEscolaMarcial={setSelectedEscolaMarcial}
            setSingularidades={setSingularidades}
            setSingularidadesRaciais={setSingularidadesRaciais}
            setSelectedEcoar={setSelectedEcoar}
            setSingularidadesEcoar={setSingularidadesEcoar}
            setDisturbios={setDisturbios}
            setEcoarAcoes={setEcoarAcoes}
            setAttributes={setAttributes}
            setPCSubStep={setPCSubStep}
            setItensCatalogo={setItensCatalogo}
            setNome={setNome}
            setBackstory={setBackstory}
            setTracoPositivo={setTracoPositivo}
            setTracoNegativo={setTracoNegativo}
            setPersonalidade={setPersonalidade}
          />
        </motion.div>
      </main>
    </CharacterCreationWizardShell>
  )
}
