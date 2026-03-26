'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
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
import { paths, getPathById, Path } from '@/data/paths'
import { martialSchools, getMartialSchoolById, MartialSchool } from '@/data/martialSchools'
import { skills as skillsData, getSkillsByCategory, getSkillById, Skill } from '@/data/skills'
import { aptitudes as aptitudesData, getAptitudeById, Aptitude } from '@/data/aptitudes'
import { singularities, getSingularitiesByCategory, getSingularityById, Singularity } from '@/data/singularities'
import { creationSingularities, getCreationSingularityById, getCreationSingularitiesByCategory, CreationSingularity } from '@/data/creationSingularities'
import { getAllMartialSchools, getMartialSchoolDataById, MartialSchoolData, MartialSchoolSingularity } from '@/data/martialSchoolSingularities'
import { locations, getLocationById, getLocationsByNation, getAllNations, Location } from '@/data/locations'
import type { Ecoar } from '@/data/ecoar'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { soulLevels, getSoulLevelByNivel, SoulLevel, getEstagios } from '@/data/soulLevels'
import { disadvantages, getDisadvantageById, getDisadvantagesByCategory } from '@/data/disadvantages'
import { getAttributeModifier, getSkillDice } from '@/lib/calculations'
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

interface CharacterCreationData {
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
}

export default function CharacterCreationWizard({ onComplete, initialData }: CharacterCreationWizardProps) {
  const [showIntroduction, setShowIntroduction] = useState(true)
  const [initialLevel, setInitialLevel] = useState(1) // Nível inicial escolhido (1, 2, 3+)
  const [nivelAlmaInicial, setNivelAlmaInicial] = useState<number>(1) // Nível de Alma inicial (1-24)
  const [currentStep, setCurrentStep] = useState(0)
  const [maxStepVisited, setMaxStepVisited] = useState(0)
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

  const handleCreationPointsSpentChange = useCallback((gastos: number) => {
    setPontosCriacao((prev) => {
      const disponiveis = prev.obtidos - gastos
      if (prev.gastos === gastos && prev.disponiveis === disponiveis) {
        return prev
      }
      return { ...prev, gastos, disponiveis }
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
  
  const totalCreationPoints = useMemo(() => 
    30 + Math.min(disadvantagePoints, 30)
  , [disadvantagePoints])
  
  useEffect(() => {
    setPontosCriacao(prev => ({
      obtidos: totalCreationPoints,
      gastos: prev.gastos,
      disponiveis: totalCreationPoints - prev.gastos
    }))
  }, [totalCreationPoints])

  // Atualiza maxStepVisited quando currentStep muda
  useEffect(() => {
    if (currentStep > maxStepVisited) {
      setMaxStepVisited(currentStep)
    }
  }, [currentStep, maxStepVisited])

  // Apply race bonuses when race is selected
  useEffect(() => {
    const race = selectedRaca ? getRaceById(selectedRaca) : null
    const manualBonuses = race?.bonuses?.attributes || {}
    
    // Calculate automatic bonuses from size and weight modifiers
    const sizeModifier = race?.bonuses?.sizeModifier ?? 0
    const weightModifier = race?.bonuses?.weightModifier ?? 0
    const automaticBonuses: Record<string, number> = {}
    
    // Each +1 size gives +1 strength
    if (sizeModifier !== 0) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRaca])

  // Apply martial school bonuses when school is selected
  useEffect(() => {
    const school = selectedEscolaMarcial ? getMartialSchoolById(selectedEscolaMarcial) : null
    const newBonuses = school?.bonuses?.attributes || {}
    
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
  }, [selectedEscolaMarcial])

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
      (nivelAlmaInicial > 1 ? (getSoulLevelByNivel(nivelAlmaInicial)?.pontosEvolucao || 0) * 50 : 0) +
      pontosCriacao.disponiveis * 100,
    [nivelAlmaInicial, pontosCriacao.disponiveis]
  )

  const equipmentGastoCeros = useMemo(() => sumCatalogItemsCeros(itensCatalogo), [itensCatalogo])

  const equipmentSaldoRestante = equipmentOrcamentoCeros - equipmentGastoCeros

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

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return selectedRaca // Raça
      case 1:
        // Atributos: todos devem ser >= 0 e pontos de atributo devem estar zerados
        return Object.values(attributes).every((a: number) => a >= 0 && a <= 3) && attributePoints === 0
      case 2:
        return skillPoints === 0 // Habilidades - deve gastar todos os 48 pontos gratuitos
      case 3:
        return true // Aptidões - pode avançar sem preencher
      case 4:
        return true // Pontos de Criação - pode avançar
      case 5:
        return true // Gastando PC - pode avançar (validação feita internamente nas tabs)
      case 6:
        return equipmentSaldoRestante >= 0 // Orçamento de aquisição não pode ficar negativo
      case 7:
        return nome.trim() !== '' // Finalização - precisa de nome
      default:
        return false
    }
  }, [currentStep, selectedRaca, attributes, attributePoints, skillPoints, nome, equipmentSaldoRestante])

  const handleNext = useCallback(() => {
    if (canProceed && currentStep < 7) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      // Atualiza maxStepVisited se necessário
      if (nextStep > maxStepVisited) {
        setMaxStepVisited(nextStep)
      }
    }
  }, [canProceed, currentStep, maxStepVisited])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
    }
  }, [currentStep])

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
        escolaMarcial: selectedEscolaMarcial,
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
        singularidadesMarciais: selectedEscolaMarcial
          ? singularidades.filter((s) => {
              const school = getMartialSchoolDataById(selectedEscolaMarcial)
              return school?.singularities.some((sing) => sing.id === s)
            })
          : [],
        singularidadesRaciais,
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

  const stepIcons = [
    Users, Zap, BookOpen, Award, Calculator, Sparkles, Package, User
  ]

  const stepTitles = [
    'Raça', 'Atributos', 'Habilidades', 'Aptidões', 'Obtendo PC',
    'Gastando PC', 'Equipamentos', 'Finalização'
  ]

  // Steps: 0-4 (básicos), 5 (Gastando PC - com tabs), 6 (Equipamentos), 7 (Finalização)
  const totalSteps = stepTitles.length - 1

  // Tela de Introdução: Header + conteúdo largo; CTA e Footer ficam abaixo, é preciso rolar para alcançar
  if (showIntroduction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onNewCharacter={() => {}} />
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
        <Header onNewCharacter={() => {}} />
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
                            setCurrentStep(stepNum)
                            // Atualiza maxStepVisited se necessário
                            if (stepNum > maxStepVisited) {
                              setMaxStepVisited(stepNum)
                            }
                            // Se for a etapa de PC, define a primeira sub-etapa
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
                    onTrilhaSelect={setSelectedTrilha}
                    attributes={attributes}
                    skills={skills}
                    aptitudes={aptitudes}
                    selectedEscolaMarcial={selectedEscolaMarcial}
                    onEscolaMarcialSelect={setSelectedEscolaMarcial}
                    selectedRaca={selectedRaca}
                    singularidadesMarciais={singularidades.filter(s => {
                      const school = getMartialSchoolDataById(selectedEscolaMarcial)
                      return school?.singularities.some(sing => sing.id === s)
                    })}
                    onSingularidadesMarciaisChange={(singIds) => {
                      // Remove singularidades marciais antigas e adiciona novas
                      const otherSingularities = singularidades.filter(s => {
                        const school = getMartialSchoolDataById(selectedEscolaMarcial)
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
                    onPointsChange={handleCreationPointsSpentChange}
                    pontosCriacao={pontosCriacao}
                    nivelAlma={nivelAlmaInicial}
                    activeSubStep={pcSubStep}
                    onSubStepChange={setPCSubStep}
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
                      {getMartialSchoolById(selectedEscolaMarcial)?.name || '—'}
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
                {/* Atributos */}
                {Object.keys(attributes).length > 0 && Object.values(attributes).some(v => v > 0) && (
                  <div className="pt-4 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                    <div className="text-slate-600 dark:text-ecoar-light-900/60 text-xs mb-2 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-teal-600 dark:text-ecoar-teal-400" />
                      Atributos
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {Object.entries(attributes).map(([attr, value]) => {
                        if (value === 0) return null
                        const modifier = getAttributeModifier(value)
                        const label = attr === 'carisma' ? 'Car' : attr === 'finesse' ? 'Fin' : attr === 'forca' ? 'For' : attr === 'inteligencia' ? 'Int' : attr === 'percepcao' ? 'Per' : attr === 'vitalidade' ? 'Vit' : 'Von'
                        return (
                          <SummaryItem
                            key={attr}
                            label={label}
                            value={
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{value}</span>
                                <span className="text-ecoar-teal/70 dark:text-ecoar-teal-400">({modifier >= 0 ? '+' : ''}{modifier})</span>
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
                          return (
                            <SummaryItem
                              key={skillId}
                              label={skillData.name}
                              value={
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">Nv.{skill.level}</span>
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
function RaceSelectionStep({
  selectedRaca,
  onRacaSelect,
  availableRaces,
}: {
  selectedRaca: string
  onRacaSelect: (raca: string) => void
  availableRaces: Race[]
}) {
  const raceVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Users className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-0.5">
              Escolha sua Raça
            </h3>
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">Selecione sua Raça</p>
          </div>
        </div>
      </div>

      {/* Race Selection */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-teal-100 dark:bg-ecoar-teal-600/20 rounded-lg border border-teal-300 dark:border-ecoar-teal-500/40">
              <Circle className="w-4 h-4 text-teal-600 dark:text-ecoar-teal-400" />
            </div>
            <span>Selecione sua Raça</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableRaces.map((race, index) => {
              const attributeLabelsShort: Record<string, string> = {
                carisma: 'Carisma',
                finesse: 'Finesse',
                forca: 'Força',
                inteligencia: 'Inteligência',
                percepcao: 'Percepção',
                vitalidade: 'Vitalidade',
                vontade: 'Vontade',
              }
              
              const getBonusesSummary = (race: Race) => {
                if (!race.bonuses) return []
                const summary: string[] = []
                
                // Atributos com formatação clara
                if (race.bonuses.attributes) {
                  Object.entries(race.bonuses.attributes).forEach(([attr, value]) => {
                    const label = attributeLabelsShort[attr] || attr
                    const sign = value >= 0 ? '+' : ''
                    summary.push(`${label} ${sign}${value}`)
                  })
                }
                
                // Deslocamentos com nomes completos
                if (race.bonuses.movement) {
                  if (race.bonuses.movement.terrestre) summary.push(`Terrestre: ${race.bonuses.movement.terrestre}m`)
                  if (race.bonuses.movement.aquatico) summary.push(`Aquático: ${race.bonuses.movement.aquatico}m`)
                  if (race.bonuses.movement.aereo) summary.push(`Aéreo: ${race.bonuses.movement.aereo}m`)
                }
                
                // Sentidos com nomes completos
                if (race.bonuses.senses) {
                  if (race.bonuses.senses.visao) summary.push(`Visão: ${race.bonuses.senses.visao}m`)
                  if (race.bonuses.senses.audicao) summary.push(`Audição: ${race.bonuses.senses.audicao}m`)
                  if (race.bonuses.senses.olfato) summary.push(`Olfato: ${race.bonuses.senses.olfato}m`)
                }
                
                // Limites
                if (race.bonuses.corpo) {
                  const sign = race.bonuses.corpo >= 0 ? '+' : ''
                  summary.push(`Corpo ${sign}${race.bonuses.corpo}`)
                }
                if (race.bonuses.mente) {
                  const sign = race.bonuses.mente >= 0 ? '+' : ''
                  summary.push(`Mente ${sign}${race.bonuses.mente}`)
                }
                
                return summary
              }
              
              const bonuses = getBonusesSummary(race)
              const isSelected = selectedRaca === race.id
              
              return (
                <RaceCard
                  key={race.id}
                  name={race.name}
                  description={race.description}
                  bonuses={bonuses}
                  isSelected={isSelected}
                  onClick={() => onRacaSelect(race.id)}
                  index={index}
                />
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function MartialSchoolSelectionStep({
  selectedEscolaMarcial,
  onSelect,
}: {
  selectedEscolaMarcial: string
  onSelect: (id: string) => void
}) {
  const allMartialSchools = getAllMartialSchools()

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Sword className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-0.5">
              Escolha sua Escola Marcial
            </h3>
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">Selecione a classe de combate do seu personagem</p>
          </div>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allMartialSchools.map((school, index) => (
          <MartialSchoolCard
            key={school.id}
            school={school}
            isSelected={selectedEscolaMarcial === school.id}
            onClick={() => onSelect(school.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

function MartialSchoolDetailsPanel({
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
  const school = getMartialSchoolDataById(selectedEscolaMarcial)
  
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

function MartialSchoolPCSpendingStep({
  selectedEscolaMarcial,
  onSelect,
  singularidadesMarciais,
  onSingularidadesChange,
  pontosDisponiveis,
  onPointsChange,
  nivelAlma,
}: {
  selectedEscolaMarcial: string
  onSelect: (id: string) => void
  singularidadesMarciais: string[]
  onSingularidadesChange: (singularidades: string[]) => void
  pontosDisponiveis: number
  onPointsChange: (gastos: number) => void
  nivelAlma: number
}) {
  const allMartialSchools = getAllMartialSchools()
  const [showSingularities, setShowSingularities] = useState(false)
  
  // SEMPRE buscar a escola (mesmo que seja null) - hooks devem vir antes de retornos condicionais
  const school = selectedEscolaMarcial ? getMartialSchoolDataById(selectedEscolaMarcial) : null

  // Calcula pontos gastos (converte PE para PC: 1 PE = 10 PC)
  // Só calcula se tiver escola selecionada
  const pontosGastos = school ? singularidadesMarciais.reduce((sum, singId) => {
    const sing = school.singularities.find(s => s.id === singId)
    return sum + (sing ? (sing.cost * 10) : 0) // Converte PE para PC
  }, 0) : 0

  // Atualiza pontos gastos quando singularidades mudam
  // SEMPRE chama useEffect (mas retorna cedo se não tiver school)
  useEffect(() => {
    if (!selectedEscolaMarcial || !school) {
      onPointsChange(0)
      return
    }
    const total = singularidadesMarciais.reduce((sum, singId) => {
      const sing = school.singularities.find(s => s.id === singId)
      return sum + (sing ? (sing.cost * 10) : 0)
    }, 0)
    onPointsChange(total)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singularidadesMarciais, selectedEscolaMarcial])
  
  // Se não tem escola selecionada, mostra a seleção
  if (!selectedEscolaMarcial) {
    return (
      <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
              <Sword className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
                Gastando PC (Escola Marcial)
              </h3>
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
                Escolha sua escola marcial e compre singularidades com Pontos de Criação
              </p>
            </div>
          </div>
          <div className={`mt-3 text-base font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal/90 dark:text-ecoar-teal-400/90' : 'text-ecoar-magenta/90 dark:text-ecoar-magenta-400/90'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMartialSchools.map((school, index) => (
            <motion.button
              key={school.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                onSelect(school.id)
                setShowSingularities(false) // Reset quando seleciona nova escola
              }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] bg-ecoar-light-700 dark:bg-ecoar-light-900/[0.03] hover:bg-ecoar-light-800 dark:hover:bg-ecoar-light-900/[0.06] hover:border-ecoar-teal-400 dark:hover:border-ecoar-teal-500/30 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-ecoar-light-900/90">
                    {school.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-ecoar-light-900/60">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-ecoar-light-900/20">{school.class}</span>
                    <span>{school.aptitude}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-3 text-slate-600 dark:text-ecoar-light-900/60">
                {school.description}
              </p>
              <div className="space-y-1 text-xs text-slate-500 dark:text-ecoar-light-900/50">
                <div><span className="font-medium">Ferramenta:</span> {school.tool}</div>
                <div className="mt-2">
                  <span className="font-medium">{school.singularities.length} singularidades</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Se tem escola selecionada, mostra painel de detalhes
  if (!school) return null

  // Se está na sub-etapa de singularidades, mostra apenas a compra
  if (showSingularities) {
    return (
      <MartialSchoolSingularitiesPurchase
        escolaMarcial={school}
        singularidadesMarciais={singularidadesMarciais}
        onSingularidadesChange={onSingularidadesChange}
        pontosDisponiveis={pontosDisponiveis}
        onPointsChange={onPointsChange}
        nivelAlma={nivelAlma}
        onBack={() => setShowSingularities(false)}
      />
    )
  }

  const currentIndex = allMartialSchools.findIndex(s => s.id === selectedEscolaMarcial)

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelect(allMartialSchools[currentIndex - 1].id)
    } else {
      onSelect(allMartialSchools[allMartialSchools.length - 1].id)
    }
  }

  const handleNext = () => {
    if (currentIndex < allMartialSchools.length - 1) {
      onSelect(allMartialSchools[currentIndex + 1].id)
    } else {
      onSelect(allMartialSchools[0].id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 flex flex-col h-full"
    >
      {/* Header com PC Disponíveis */}
      <div className="border-b border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onSelect('')}
            className="flex items-center gap-2 text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:text-ecoar-light-900 dark:hover:text-ecoar-light-900 text-sm transition-colors"
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
              className="p-2 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 dark:hover:bg-ecoar-light-900/15 border border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:text-ecoar-light-900 dark:hover:text-ecoar-light-900 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <span className="text-xs text-slate-500 dark:text-ecoar-light-900/60 px-2">
              {currentIndex + 1} / {allMartialSchools.length}
            </span>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 dark:hover:bg-ecoar-light-900/15 border border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:text-ecoar-light-900 dark:hover:text-ecoar-light-900 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center">
              <Sword className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white dark:text-ecoar-light-900">{school.name}</h3>
              <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 mt-0.5">Gastando PC (Escola Marcial)</p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal dark:text-ecoar-teal-400' : 'text-ecoar-magenta dark:text-ecoar-magenta-400'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>
        <p className="text-sm text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 leading-relaxed mt-3">
          {school.description}
        </p>
      </div>

      {/* Layout em 2 colunas: PNG à esquerda | INFO + SINGULARIDADES à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {/* Lado Esquerdo - Espaço para PNG */}
        <div className="space-y-4">
          <div className="bg-ecoar-light-800/80 dark:bg-ecoar-light-900/10 rounded-xl border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 p-6 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-ecoar-dark-400 dark:text-ecoar-light-900/40 text-sm">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-ecoar-dark-300 dark:text-ecoar-light-900/30 text-xs">Imagem PNG aqui</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - INFO + SINGULARIDADES */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-ecoar-light-800/50 dark:bg-ecoar-light-900/[0.03] rounded-lg p-4 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08]">
            <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-3">{school.name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60">Classe:</span>
                <span className="text-white dark:text-ecoar-light-900 ml-2">{school.class}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60">Aptidão:</span>
                <span className="text-white dark:text-ecoar-light-900 ml-2">{school.aptitude}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60">Ferramenta:</span>
                <span className="text-white dark:text-ecoar-light-900 ml-2 text-xs">{school.tool}</span>
              </div>
            </div>
            {school.toolNote && (
              <p className="text-xs text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 bg-ecoar-magenta-900/50 dark:bg-ecoar-magenta-800/70 px-3 py-2 rounded border border-ecoar-magenta-700/50 dark:border-ecoar-magenta-600/50 italic mt-2">↪ {school.toolNote}</p>
            )}
          </div>

          {/* Botão para ir para compra de singularidades */}
          <div className="bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 rounded-xl p-5 border border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white dark:text-ecoar-light-900 mb-1">Singularidades</h4>
                <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60">
                  {school.singularities.length} singularidades disponíveis para compra
                </p>
              </div>
              <motion.button
                onClick={() => setShowSingularities(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 hover:bg-ecoar-teal/30 dark:hover:bg-ecoar-teal-600/30 border border-ecoar-teal/50 dark:border-ecoar-teal-500/50 text-ecoar-teal dark:text-ecoar-teal-400 rounded-lg font-semibold text-sm transition-all"
              >
                Comprar Singularidades
              </motion.button>
            </div>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Custo: 1 PE = 10 PC | PC Disponíveis: {pontosDisponiveis}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Navegação Rápida - Ícones das Escolas */}
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

function MartialSchoolSingularitiesPurchase({
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
  // Calcula pontos gastos (converte PE para PC: 1 PE = 10 PC)
  const pontosGastos = singularidadesMarciais.reduce((sum, singId) => {
    const sing = escolaMarcial.singularities.find(s => s.id === singId)
    return sum + (sing ? (sing.cost * 10) : 0) // Converte PE para PC
  }, 0)

  // Atualiza pontos gastos quando singularidades mudam
  useEffect(() => {
    const total = singularidadesMarciais.reduce((sum, singId) => {
      const sing = escolaMarcial.singularities.find(s => s.id === singId)
      return sum + (sing ? (sing.cost * 10) : 0)
    }, 0)
    onPointsChange(total)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singularidadesMarciais])

  const toggleSingularity = (id: string) => {
    const singularity = escolaMarcial.singularities.find(s => s.id === id)
    if (!singularity) return

    const isSelected = singularidadesMarciais.includes(id)
    const costInPC = singularity.cost * 10 // Converte PE para PC
    
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
          Compre singularidades com Pontos de Criação. Custo: 1 PE = 10 PC
        </p>
      </div>

      {/* Lista de Singularidades */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escolaMarcial.singularities.map((singularity) => {
            const isSelected = singularidadesMarciais.includes(singularity.id)
            const costInPC = singularity.cost * 10 // Converte PE para PC
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
                secondaryCost={`${singularity.cost} PE`}
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

function MartialSchoolSingularitiesStep({
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
  const school = getMartialSchoolDataById(escolaMarcialId)
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

// Helper para ícones de atributos
const attributeIconsMap: Record<string, any> = {
  carisma: Crown,
  finesse: Zap,
  forca: Hammer,
  inteligencia: Brain,
  percepcao: Eye,
  vitalidade: Heart,
  vontade: Shield,
}

// Helper para labels de atributos
const attributeLabelsShort: Record<string, string> = {
  carisma: 'Car',
  finesse: 'Fin',
  forca: 'For',
  inteligencia: 'Int',
  percepcao: 'Per',
  vitalidade: 'Vit',
  vontade: 'Von',
}

// Componente de Detalhes Explicativos para a área central
function SelectionDetailsPanel({ 
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
function BonusDetailsPanel({ bonuses }: { bonuses: any }) {
  if (!bonuses) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-teal-50 dark:bg-ecoar-teal-600/8 border border-teal-200 dark:border-ecoar-teal-500/20 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-teal-600 dark:text-ecoar-teal-400" />
        <h5 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 uppercase tracking-wider">
          Bônus Detalhados
        </h5>
      </div>

      {/* Bônus de Atributos */}
      {bonuses.attributes && Object.keys(bonuses.attributes).length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Atributos
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(bonuses.attributes).map(([attr, value]) => {
              const Icon = attributeIconsMap[attr] || Star
              const bonusValue = value as number
              return (
                <div key={attr} className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                  <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                  <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">
                    {attributeLabelsShort[attr] || attr}
                  </span>
                  <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{bonusValue}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bônus de Skills */}
      {bonuses.skills && Object.keys(bonuses.skills).length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Habilidades
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(bonuses.skills).map(([skill, value]) => {
              const skillBonusValue = value as number
              return (
                <div key={skill} className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                  <Sword className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                  <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 capitalize">
                    {skill}
                  </span>
                  <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{skillBonusValue}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Outros Bônus */}
      {(bonuses.corpo || bonuses.mente || bonuses.folego || bonuses.mana) && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Limites
          </div>
          <div className="flex flex-wrap gap-2">
            {bonuses.corpo && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Heart className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Corpo</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{bonuses.corpo}</span>
              </div>
            )}
            {bonuses.mente && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Brain className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Mente</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{bonuses.mente}</span>
              </div>
            )}
            {bonuses.folego && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Waves className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Fôlego</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">+{bonuses.folego}</span>
              </div>
            )}
            {bonuses.mana && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">Mana</span>
                <span className="text-sm font-bold text-teal-600 dark:text-ecoar-teal-400">+{bonuses.mana}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movimento (para raças) */}
      {bonuses.movement && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Movimento
          </div>
          <div className="flex flex-wrap gap-2">
            {bonuses.movement.terrestre && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Footprints className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Terrestre</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.movement.terrestre}m</span>
              </div>
            )}
            {bonuses.movement.aquatico && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Waves className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Aquático</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.movement.aquatico}m</span>
              </div>
            )}
            {bonuses.movement.aereo && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Zap className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Aéreo</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.movement.aereo}m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sentidos (para raças) */}
      {bonuses.senses && (
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-ecoar-light-900/70 uppercase tracking-wider mb-2">
            Sentidos
          </div>
          <div className="flex flex-wrap gap-2">
            {bonuses.senses.visao !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Eye className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Visão</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.senses.visao}m</span>
              </div>
            )}
            {bonuses.senses.audicao !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Users className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Audição</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.senses.audicao}m</span>
              </div>
            )}
            {bonuses.senses.olfato !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-ecoar-light-800 dark:bg-ecoar-light-900/10 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                <Star className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                <span className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">Olfato</span>
                <span className="text-sm font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400">{bonuses.senses.olfato}m</span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Componente de Comparação Rápida para Raças
function RaceComparisonSection({
  selectedRaca,
  onSelect,
}: {
  selectedRaca: string
  onSelect: (id: string) => void
}) {
  const selectedRace = selectedRaca ? getRaceById(selectedRaca) : null
  const otherRaces = selectedRaca ? races.filter(r => r.id !== selectedRaca) : []

  const attributeLabels: Record<string, string> = {
    carisma: 'Carisma',
    finesse: 'Finesse',
    forca: 'Força',
    inteligencia: 'Inteligência',
    percepcao: 'Percepção',
    vitalidade: 'Vitalidade',
    vontade: 'Vontade',
  }

  const getBonusesSummary = (race: Race) => {
    if (!race.bonuses) return []
    const summary: string[] = []
    
    // Atributos com formatação clara
    if (race.bonuses.attributes) {
      Object.entries(race.bonuses.attributes).forEach(([attr, value]) => {
        const label = attributeLabels[attr] || attr
        const sign = value >= 0 ? '+' : ''
        summary.push(`${label} ${sign}${value}`)
      })
    }
    
    if (race.bonuses.skills) {
      Object.keys(race.bonuses.skills).forEach((skill) => {
        summary.push(`Habilidade: ${skill}`)
      })
    }
    
    // Limites com formatação clara
    if (race.bonuses.corpo) {
      const sign = race.bonuses.corpo >= 0 ? '+' : ''
      summary.push(`Corpo ${sign}${race.bonuses.corpo}`)
    }
    if (race.bonuses.mente) {
      const sign = race.bonuses.mente >= 0 ? '+' : ''
      summary.push(`Mente ${sign}${race.bonuses.mente}`)
    }
    if (race.bonuses.folego) {
      const sign = race.bonuses.folego >= 0 ? '+' : ''
      summary.push(`Fôlego ${sign}${race.bonuses.folego}`)
    }
    if (race.bonuses.mana) {
      const sign = race.bonuses.mana >= 0 ? '+' : ''
      summary.push(`Mana ${sign}${race.bonuses.mana}`)
    }
    
    // Deslocamentos com nomes completos
    if (race.bonuses.movement) {
      if (race.bonuses.movement.terrestre) summary.push(`Terrestre: ${race.bonuses.movement.terrestre}m`)
      if (race.bonuses.movement.aquatico) summary.push(`Aquático: ${race.bonuses.movement.aquatico}m`)
      if (race.bonuses.movement.aereo) summary.push(`Aéreo: ${race.bonuses.movement.aereo}m`)
    }
    
    // Sentidos com nomes completos
    if (race.bonuses.senses) {
      if (race.bonuses.senses.visao) summary.push(`Visão: ${race.bonuses.senses.visao}m`)
      if (race.bonuses.senses.audicao) summary.push(`Audição: ${race.bonuses.senses.audicao}m`)
      if (race.bonuses.senses.olfato) summary.push(`Olfato: ${race.bonuses.senses.olfato}m`)
    }
    
    return summary
  }

  if (!selectedRace || otherRaces.length === 0) return null

  const selectedBonuses = getBonusesSummary(selectedRace)

  const getBonusType = (bonus: string): string => {
    if (bonus.includes('Skill:')) return 'skill'
    if (bonus.includes('Corpo')) return 'corpo'
    if (bonus.includes('Mente')) return 'mente'
    if (bonus.includes('Fôlego')) return 'folego'
    if (bonus.includes('Mana')) return 'mana'
    if (bonus.includes('Mov:') || bonus.includes('Aqu:') || bonus.includes('Aer:')) return 'movement'
    if (bonus.includes('Vis:') || bonus.includes('Aud:') || bonus.includes('Olf:')) return 'senses'
    return 'attribute'
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-5 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 mt-5"
    >
      <div className="bg-ecoar-light-700 dark:bg-ecoar-dark-800 rounded-xl p-3 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
          <h3 className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">
            Comparar com outras Raças
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        {otherRaces.slice(0, 6).map((otherRace, index) => {
          const otherBonuses = getBonusesSummary(otherRace)
          
          const hasDifferentBonuses = otherBonuses.some(otherBonus => {
            if (selectedBonuses.includes(otherBonus)) return false
            const otherType = getBonusType(otherBonus)
            const hasSameTypeInSelected = selectedBonuses.some(selBonus => {
              return getBonusType(selBonus) === otherType
            })
            return !hasSameTypeInSelected
          })
          
          return (
            <motion.button
              key={otherRace.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(otherRace.id)}
              whileHover={{ y: -2 }}
              className="relative p-2.5 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 bg-ecoar-light-700 dark:bg-ecoar-dark-800 hover:bg-ecoar-light-800 dark:hover:bg-ecoar-dark-700 hover:border-ecoar-teal-400 dark:hover:border-ecoar-teal-500/40 transition-all text-left"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="w-3.5 h-3.5 text-ecoar-dark-500 dark:text-ecoar-light-900/60" />
                <h5 className="text-xs font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900/90">
                  {otherRace.name}
                </h5>
              </div>
              
              {otherBonuses.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {otherBonuses.slice(0, 2).map((bonus, idx) => {
                    const bonusType = getBonusType(bonus)
                    const isExactMatch = selectedBonuses.includes(bonus)
                    const hasSameTypeInSelected = selectedBonuses.some(selBonus => {
                      return getBonusType(selBonus) === bonusType
                    })
                    const isDifferent = !isExactMatch && !hasSameTypeInSelected
                    
                    return (
                      <span
                        key={idx}
                        className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${
                          isDifferent
                            ? 'bg-ecoar-magenta-100 dark:bg-ecoar-magenta-700/90 text-ecoar-magenta-700 dark:text-ecoar-light-900 border-ecoar-magenta-300 dark:border-ecoar-magenta-500'
                            : 'bg-ecoar-light-800 dark:bg-ecoar-light-900/10 text-ecoar-dark-500 dark:text-ecoar-light-900/60 border-ecoar-dark-300/30 dark:border-ecoar-light-900/20'
                        }`}
                      >
                        {bonus}
                      </span>
                    )
                  })}
                  {otherBonuses.length > 2 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-ecoar-light-800 dark:bg-ecoar-light-900/10 text-ecoar-dark-400 dark:text-ecoar-light-900/50 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20" title={`Mais ${otherBonuses.length - 2} bônus`}>
                      +{otherBonuses.length - 2} bônus
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-ecoar-dark-400 dark:text-ecoar-light-900/40 mt-2">Sem bônus especiais</p>
              )}
              
              {hasDifferentBonuses && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-ecoar-magenta-600 dark:bg-ecoar-magenta-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </motion.button>
          )
        })}
        </div>
        <p className="text-xs text-ecoar-dark-500 dark:text-ecoar-light-900/50 mt-1.5 flex items-center gap-2">
          <Eye className="w-3 h-3 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
          <span>Bônus em rosa indicam diferenças em relação à raça selecionada</span>
        </p>
      </div>
    </motion.div>
  )
}

// Componente de Seleção de Nível de Alma Inicial
function SoulLevelSelectionStep({
  nivelAlmaInicial,
  onSelect,
  variant,
}: {
  nivelAlmaInicial: number
  onSelect: (nivel: number) => void
  variant?: 'light' | 'dark'
}) {
  const { theme } = useTheme()
  // Se variant não for especificado, detecta automaticamente pelo tema
  const isLight = variant === 'light' || (variant === undefined && theme === 'light')
  const textColor = isLight ? 'text-ecoar-dark' : 'text-white dark:text-ecoar-light-900'
  const textColorMuted = isLight ? 'text-ecoar-dark/70' : 'text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70'
  const textColorSubtle = isLight ? 'text-ecoar-dark/60' : 'text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60'
  const bgCard = isLight ? 'bg-ecoar-light-700 border-ecoar-teal-400/30' : 'bg-ecoar-teal-100/50 dark:bg-ecoar-teal-600/20 border-ecoar-teal-400/40 dark:border-ecoar-teal-500/40'
  const bgIcon = isLight ? 'bg-ecoar-teal-100/50' : 'bg-ecoar-teal-200/50 dark:bg-ecoar-teal-600/20'
  const bgSelected = isLight ? 'bg-ecoar-teal-100/50 border-ecoar-teal-400' : 'bg-ecoar-teal-200/50 dark:bg-ecoar-teal-600/20 border-ecoar-teal-400 dark:border-ecoar-teal-500'
  const bgUnselected = isLight ? 'bg-ecoar-light-800 border-ecoar-dark-300/30' : 'bg-ecoar-light-800 dark:bg-ecoar-light-900/10 border-ecoar-dark-300/30 dark:border-ecoar-light-900/20'
  const bgInfo = isLight ? 'bg-ecoar-teal/5 border-ecoar-teal/20' : 'bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20'
  const selectedSoulLevel = getSoulLevelByNivel(nivelAlmaInicial)
  const estagios = getEstagios()
  const initialTabIndex = selectedSoulLevel ? estagios.indexOf(selectedSoulLevel.estagio) : 0
  const [openEstagioIndex, setOpenEstagioIndex] = useState(initialTabIndex >= 0 ? initialTabIndex : 0)
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Resumo compacto do nível selecionado (uma linha) */}
      {selectedSoulLevel && (
        <div className={`flex flex-wrap items-center gap-2 sm:gap-3 py-2.5 px-4 rounded-lg border ${bgCard} border-ecoar-dark-300/30 dark:border-ecoar-light-900/20`}>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-ecoar-teal dark:text-ecoar-teal-400 flex-shrink-0" />
            <span className={`text-sm font-semibold ${textColor}`}>Nível {selectedSoulLevel.nivel}</span>
          </div>
          <span className="text-slate-400 dark:text-ecoar-light-900/40">·</span>
          <span className={`text-sm ${textColorMuted}`}>{selectedSoulLevel.pontosEvolucao} PE</span>
          <span className="text-slate-400 dark:text-ecoar-light-900/40">·</span>
          <span className={`text-sm ${textColorMuted}`}>Poder {selectedSoulLevel.nivelPoder}</span>
          <span className="text-slate-400 dark:text-ecoar-light-900/40 hidden sm:inline">·</span>
          <span className={`text-xs ${textColorMuted} w-full sm:w-auto`}>
            {selectedSoulLevel.nivel === 1
              ? 'Recomendado para iniciantes. Comece do zero e evolua com o grupo.'
              : `${selectedSoulLevel.pontosEvolucao} PE + ȼ${selectedSoulLevel.pontosEvolucao * 50} extras na criação.`
            }
          </span>
        </div>
      )}

      {/* Tabs por estágio + 4 níveis em uma linha (sem lista/scroll) */}
      <div className="flex flex-wrap gap-2 mb-3">
        {estagios.map((estagio, estagioIndex) => {
          const niveisDoEstagio = soulLevels.filter(sl => sl.estagio === estagio)
          const nivelPoder = niveisDoEstagio[0]?.nivelPoder || 0
          const isActive = openEstagioIndex === estagioIndex
          const shortName = estagio.replace(/^Personagem\s+/, '')
          return (
            <button
              key={estagio}
              type="button"
              onClick={() => setOpenEstagioIndex(estagioIndex)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${
                isActive
                  ? `${bgSelected} border-ecoar-teal/50 dark:border-ecoar-teal-500/50 shadow-md`
                  : `${bgUnselected} ${isLight ? 'hover:bg-ecoar-teal/5 hover:border-ecoar-teal/30' : 'hover:bg-ecoar-light-900/10 hover:border-ecoar-teal-500/30'} border-ecoar-dark-300/30 dark:border-ecoar-light-900/20`
              }`}
            >
              <span className={isActive ? textColor : textColorMuted}>{shortName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-ecoar-teal/15 dark:bg-ecoar-teal-600/20 text-ecoar-teal dark:text-ecoar-teal-400">
                Poder {nivelPoder}
              </span>
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(() => {
          const estagioAtivo = estagios[openEstagioIndex]
          const niveisDoEstagio = estagioAtivo ? soulLevels.filter(sl => sl.estagio === estagioAtivo) : []
          return niveisDoEstagio.map((soulLevel) => {
            const isSelected = nivelAlmaInicial === soulLevel.nivel
            return (
              <motion.button
                key={soulLevel.nivel}
                onClick={() => onSelect(soulLevel.nivel)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3.5 rounded-lg border transition-all text-left ${
                  isSelected
                    ? `${bgSelected} shadow-lg shadow-ecoar-teal/10 dark:shadow-ecoar-teal-600/20`
                    : `${bgUnselected} ${isLight ? 'hover:bg-ecoar-teal/5' : 'hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15'} hover:border-ecoar-teal/30 dark:hover:border-ecoar-teal-500/40`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-bold ${isSelected ? textColor : textColorMuted}`}>
                    Nível {soulLevel.nivel}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className={`text-xs ${textColorMuted}`}>{soulLevel.pontosEvolucao} PE</p>
                  {soulLevel.nivel > 1 && (
                    <p className="text-xs text-ecoar-teal dark:text-ecoar-teal-400">
                      +ȼ{soulLevel.pontosEvolucao * 50}
                    </p>
                  )}
                </div>
              </motion.button>
            )
          })
        })()}
      </div>

      {/* Saiba mais (colapsável, fechado por padrão) */}
      <div className={`mt-4 rounded-lg border overflow-hidden ${bgInfo} border-ecoar-dark-300/20 dark:border-ecoar-light-900/20`}>
        <button
          type="button"
          onClick={() => setInfoOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 py-2.5 px-3 text-left transition-colors hover:bg-ecoar-teal/5 dark:hover:bg-ecoar-light-900/10"
        >
          <span className="flex items-center gap-2 text-sm text-ecoar-teal dark:text-ecoar-teal-400">
            <Info className="w-4 h-4 flex-shrink-0" />
            Saiba mais sobre níveis iniciais
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-ecoar-light-900/60 transition-transform duration-200 flex-shrink-0 ${infoOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
          {infoOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-0 border-t border-ecoar-teal/10 dark:border-ecoar-light-900/10">
                <div className={`text-xs ${textColorMuted} space-y-2 pt-2`}>
                  <p>
                    <strong className={textColor}>Por padrão:</strong> É recomendado para jogadores iniciantes ou casuais que os personagens comecem no início (Nível de Alma 1) e que todos aprendam juntos, evoluindo de forma conjunta.
                  </p>
                  <p>
                    <strong className={textColor}>Nível acima de 1:</strong> Caso seu Nível de Alma inicial seja acima de 1, você pode usar estes Pontos de Evolução durante a criação de personagem para adquirir singularidades ou evoluir traços, e deverão ser gastos conforme as regras de evolução vistas mais para frente. Para cada Ponto de Evolução inicial, você também recebe ȼ50 extras.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function PathSelectionStep({
  selectedTrilha,
  onSelect,
}: {
  selectedTrilha: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Route className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Escolha sua Trilha
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Defina o caminho que seu personagem seguirá <span className="text-ecoar-magenta/70">(opcional)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Cards Compactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {paths.map((path, index) => {
          const isSelected = selectedTrilha === path.id
          
          return (
            <motion.button
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(path.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-3.5 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'bg-ecoar-teal/15 border-ecoar-teal/60 shadow-lg shadow-ecoar-teal/10'
                  : 'bg-slate-50 dark:bg-ecoar-light-900/10 border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30'
              }`}
            >
              {/* Ícone e Título */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-ecoar-teal/20 text-ecoar-teal'
                    : 'bg-slate-50 dark:bg-ecoar-light-900/10 text-slate-500 dark:text-ecoar-light-900/60'
                }`}>
                  <Route className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm ${
                    isSelected ? 'text-slate-900 dark:text-ecoar-light-900' : 'text-slate-900 dark:text-ecoar-light-900/90'
                  }`}>
                    {path.name}
                  </h4>
                  <span className={`text-xs ${
                    path.type === 'caçador'
                      ? 'text-ecoar-teal'
                      : 'text-ecoar-magenta'
                  }`}>
                    {path.type === 'caçador' ? 'Caçador' : 'Corrompido'}
                  </span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
                  </motion.div>
                )}
              </div>

              {/* Descrição */}
              <p className={`text-xs leading-relaxed ${
                isSelected ? 'text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80' : 'text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60'
              }`}>
                {path.description}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function AttributesStep({
  attributes,
  attributePoints,
  pontosCriacao,
  onUpdate,
  raceBonuses,
  martialSchoolBonuses,
  classBonuses,
  onRandomize,
  onPointsChange,
  isEvolutionStep = false,
}: {
  attributes: Record<string, number>
  attributePoints: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onUpdate: (attr: string, value: number) => void
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
  classBonuses?: Record<string, number>
  onRandomize: () => void
  onPointsChange: (gastos: number) => void
  isEvolutionStep?: boolean
}) {
  
  const attributeLabels: Record<string, string> = {
    carisma: 'Carisma',
    finesse: 'Finesse',
    forca: 'Força',
    inteligencia: 'Inteligência',
    percepcao: 'Percepção',
    vitalidade: 'Vitalidade',
    vontade: 'Vontade',
  }

  const attributeIcons: Record<string, any> = {
    carisma: Crown,
    finesse: Zap,
    forca: Hammer,
    inteligencia: Brain,
    percepcao: Eye,
    vitalidade: Heart,
    vontade: Shield,
  }

  const pcGastosEmAtributos = (() => {
    const totalBasePoints = Object.entries(attributes).reduce((sum, [attr, val]) => {
      const raceBonus = raceBonuses[attr] || 0
      const martialSchoolBonus = martialSchoolBonuses[attr] || 0
      const classBonus = 0 // TODO: Add class bonuses if needed - classBonuses?.[attr] || 0
      const totalBonus = raceBonus + martialSchoolBonus + classBonus
      return sum + Math.max(0, val - totalBonus)
    }, 0)
    const pointsOverFree = Math.max(0, totalBasePoints - 12)
    return pointsOverFree * 10
  })()

  // Descrições dos atributos
  const attributeDescriptions: Record<string, string> = {
    carisma: 'Representa sua capacidade de liderança, persuasão e influência social.',
    finesse: 'Agilidade e precisão. Afeta ações que requerem destreza e coordenação.',
    forca: 'Poder físico bruto. Afeta dano em combate corpo a corpo e capacidade de carga.',
    inteligencia: 'Capacidade mental, raciocínio e conhecimento. Essencial para magias e investigação.',
    percepcao: 'Atenção aos detalhes e consciência do ambiente. Afeta detecção e precisão.',
    vitalidade: 'Resistência física e saúde geral. Afeta pontos de vida e resistência a danos.',
    vontade: 'Força mental e determinação. Afeta resistência a efeitos mentais e controle.',
  }

  const [expandedAttribute, setExpandedAttribute] = useState<string | null>(null)

  // Valores e regras por atributo (para a lista compacta)
  const getAttributeRowData = (attr: string) => {
    const value = attributes[attr]
    const modifier = getAttributeModifier(value)
    const raceBonus = raceBonuses[attr] || 0
    const martialSchoolBonus = martialSchoolBonuses[attr] || 0
    const classBonus = 0
    const totalBonus = raceBonus + martialSchoolBonus + classBonus
    const baseValue = value - totalBonus
    const maxValue = (isEvolutionStep ? 8 : 3) + totalBonus
    const canDecrease = baseValue > 0
    const canIncrease = (() => {
      if (value >= maxValue) return false
      if (isEvolutionStep) {
        const currentTotalBase = Object.entries(attributes).reduce((sum, [a, v]) => {
          const rB = raceBonuses[a] || 0
          const mB = martialSchoolBonuses[a] || 0
          return sum + Math.max(0, v - (rB + mB + classBonus))
        }, 0)
        const newTotalBase = currentTotalBase - baseValue + (baseValue + 1)
        const currentPointsOverFree = Math.max(0, currentTotalBase - 12)
        const newPointsOverFree = Math.max(0, newTotalBase - 12)
        const costInPC = (newPointsOverFree - currentPointsOverFree) * 10
        if (costInPC <= 0) return true
        const pcDisponivelParaAtributos = pontosCriacao.disponiveis - currentPointsOverFree * 10
        return pcDisponivelParaAtributos >= costInPC
      }
      return attributePoints > 0
    })()
    const pcCost = (() => {
      if (!isEvolutionStep) return 0
      const currentTotalBase = Object.entries(attributes).reduce((sum, [a, v]) => {
        const rB = raceBonuses[a] || 0
        const mB = martialSchoolBonuses[a] || 0
        return sum + Math.max(0, v - (rB + mB + classBonus))
      }, 0)
      const newTotalBase = currentTotalBase - baseValue + (baseValue + 1)
      const currentPointsOverFree = Math.max(0, currentTotalBase - 12)
      const newPointsOverFree = Math.max(0, newTotalBase - 12)
      return (newPointsOverFree - currentPointsOverFree) * 10
    })()
    return {
      value,
      modifier,
      raceBonus,
      martialSchoolBonus,
      totalBonus,
      baseValue,
      maxValue,
      canDecrease,
      canIncrease,
      pcCost,
      Icon: attributeIcons[attr] || Star,
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Zap className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              {isEvolutionStep ? 'Evoluir Atributos' : 'Atributos'}
            </h3>
            {!isEvolutionStep && (
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
                Você tem 12 pontos gratuitos para distribuir
              </p>
            )}
            {isEvolutionStep && (
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
                Melhore seus atributos gastando Pontos de Criação. Cada ponto além do valor base custa 10 PC.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Barra única: pontos restantes / PC + Aleatório (harmoniosa com a tabela de atributos) */}
      <div className="flex items-center justify-between py-2.5 px-4 mb-4 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 bg-ecoar-light-700/50 dark:bg-ecoar-light-900/[0.03]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-ecoar-light-900/60">
            {!isEvolutionStep ? 'Pontos restantes' : 'PC disponíveis'}
          </span>
          <span
            className={`text-xl font-bold tabular-nums ${
              !isEvolutionStep
                ? attributePoints >= 0
                  ? 'text-ecoar-teal-600 dark:text-ecoar-teal-400'
                  : 'text-ecoar-magenta-600 dark:text-ecoar-magenta-400'
                : pontosCriacao.disponiveis >= 0
                  ? 'text-ecoar-teal-600 dark:text-ecoar-teal-400'
                  : 'text-ecoar-magenta-600 dark:text-ecoar-magenta-400'
            }`}
          >
            {!isEvolutionStep ? attributePoints : pontosCriacao.disponiveis}
          </span>
        </div>
        {!isEvolutionStep && (
          <button
            type="button"
            onClick={onRandomize}
            className="flex items-center gap-2 rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 px-3 py-2 text-sm font-medium text-slate-700 dark:text-ecoar-light-900/90 hover:bg-ecoar-teal/10 dark:hover:bg-ecoar-teal-600/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Aleatório
          </button>
        )}
      </div>

      {/* Bônus Aplicados */}
              {(Object.keys(raceBonuses).length > 0 || Object.keys(martialSchoolBonuses).length > 0) && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-ecoar-light-900/10 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 dark:border-ecoar-light-900/20 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-2">Bônus aplicados automaticamente</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.keys(raceBonuses).length > 0 && (
              <div className="text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80">
                <span className="font-semibold text-ecoar-magenta dark:text-ecoar-magenta-400">Raça:</span> {Object.entries(raceBonuses).map(([attr, bonus]) => (
                  <span key={attr} className="ml-2 text-slate-600 dark:text-ecoar-light-900/70 dark:text-ecoar-light-900/70">
                    {attributeLabels[attr]}: <span className="text-ecoar-teal dark:text-ecoar-teal-400">+{bonus}</span>
                  </span>
                ))}
              </div>
            )}
            {Object.keys(martialSchoolBonuses).length > 0 && (
              <div className="text-slate-700 dark:text-ecoar-light-900/80">
                <span className="font-semibold text-ecoar-teal">Escola Marcial:</span> {Object.entries(martialSchoolBonuses).map(([attr, bonus]) => (
                  <span key={attr} className="ml-2 text-slate-600 dark:text-ecoar-light-900/70">
                    {attributeLabels[attr]}: <span className="text-ecoar-teal">+{bonus}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista única de atributos (sem cards) */}
      <div className="rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 bg-ecoar-light-700/50 dark:bg-ecoar-light-900/[0.03] overflow-hidden">
        <div className={`grid gap-4 py-2 px-3 text-xs font-semibold text-slate-500 dark:text-ecoar-light-900/60 uppercase tracking-wider border-b border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 ${isEvolutionStep ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto]'}`}>
          <span>Atributo</span>
          <span className="text-center w-20">Valor</span>
          <span className="w-10 text-right">Mod</span>
          {isEvolutionStep && <span className="w-14 text-right">Custo</span>}
        </div>
        {Object.keys(attributes).map((attr) => {
          const row = getAttributeRowData(attr)
          const { Icon } = row
          const isExpanded = expandedAttribute === attr
          return (
            <div key={attr}>
              <div
                className={`grid gap-4 items-center py-2 px-3 border-b border-ecoar-dark-300/20 dark:border-ecoar-light-900/[0.06] ${isEvolutionStep ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto]'}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedAttribute((prev) => (prev === attr ? null : attr))}
                  className="flex items-center gap-3 min-w-0 w-full text-left bg-transparent border-0 cursor-pointer py-0 px-0 rounded"
                >
                  <div className="w-6 h-6 rounded-md bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3 h-3 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-ecoar-light-900 truncate">
                    {attributeLabels[attr]}
                  </span>
                  {row.totalBonus !== 0 && (
                    <span className="text-xs text-slate-500 dark:text-ecoar-light-900/50 flex-shrink-0">
                      +{row.totalBonus}
                    </span>
                  )}
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 ml-auto mr-1 text-slate-500 dark:text-ecoar-light-900/50"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>
                <div className="flex items-center gap-1.5 justify-center w-20">
                  <button
                    type="button"
                    onClick={() => row.canDecrease && onUpdate(attr, row.value - 1)}
                    disabled={!row.canDecrease}
                    className="w-8 h-8 rounded-full border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 hover:enabled:bg-ecoar-magenta/10 hover:enabled:border-ecoar-magenta/30 dark:hover:enabled:border-ecoar-magenta-500/40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-lg font-bold text-slate-900 dark:text-ecoar-light-900 w-6 text-center tabular-nums">
                    {row.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (row.canIncrease && row.value + 1 <= row.maxValue) onUpdate(attr, row.value + 1)
                    }}
                    disabled={!row.canIncrease}
                    className="w-8 h-8 rounded-full border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 text-slate-600 dark:text-ecoar-light-900/70 hover:enabled:bg-ecoar-teal/10 hover:enabled:border-ecoar-teal/30 dark:hover:enabled:border-ecoar-teal-500/40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className={`text-sm font-semibold w-10 text-right tabular-nums ${row.modifier >= 0 ? 'text-ecoar-teal-600 dark:text-ecoar-teal-400' : 'text-slate-600 dark:text-ecoar-light-900/70'}`}>
                  {row.modifier >= 0 ? '+' : ''}{row.modifier}
                </span>
                {isEvolutionStep && (
                  <span className="text-xs text-slate-500 dark:text-ecoar-light-900/50 w-14 text-right">
                    {row.canIncrease && row.pcCost > 0 ? `${row.pcCost} PC` : '—'}
                  </span>
                )}
              </div>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mx-3 mb-2 mt-1 rounded-lg border border-ecoar-dark-300/25 dark:border-ecoar-light-900/15 bg-ecoar-light-800/80 dark:bg-ecoar-light-900/[0.06] px-3 py-2 text-xs leading-snug text-slate-600 dark:text-ecoar-light-900/80 shadow-sm line-clamp-3">
                      {attributeDescriptions[attr]}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EquipmentStep({
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
function LocationSelectionStep({
  selectedLocalizacao,
  onSelect,
}: {
  selectedLocalizacao: string
  onSelect: (id: string) => void
}) {
  const nations = getAllNations()
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <MapPin className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Escolha sua Localização
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Selecione a localização de origem do seu personagem</p>
          </div>
        </div>
      </div>

      {/* Organizado por Nações */}
      <div className="space-y-8">
        {nations.map((nation) => {
          const nationLocations = getLocationsByNation(nation)
          if (nationLocations.length === 0) return null

          return (
            <div key={nation} className="space-y-4">
              <div className="border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">{nation}</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nationLocations.map((location, index) => {
                  const isSelected = selectedLocalizacao === location.id
                  
                  return (
                    <motion.button
                      key={location.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onSelect(location.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'bg-ecoar-teal/10 border-ecoar-teal shadow-lg shadow-ecoar-teal/20'
                          : 'bg-slate-50 dark:bg-ecoar-light-900/10 border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30'
                      }`}
                    >
                      {/* Ícone e Título */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-ecoar-teal/20 text-ecoar-teal'
                            : 'bg-slate-50 dark:bg-ecoar-light-900/10 text-slate-500 dark:text-ecoar-light-900/60'
                        }`}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm ${
                            isSelected ? 'text-slate-900 dark:text-ecoar-light-900' : 'text-slate-900 dark:text-ecoar-light-900/90'
                          }`}>
                            {location.name}
                          </h4>
                          {location.region && (
                            <span className="text-xs text-slate-500 dark:text-ecoar-light-900/60">{location.region}</span>
                          )}
                          {location.technology && (
                            <span className="text-xs text-ecoar-teal/70 ml-2">• {location.technology}</span>
                          )}
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
                          </motion.div>
                        )}
                      </div>

                      {/* Descrição */}
                      {location.description && (
                        <p className={`text-xs leading-relaxed ${
                          isSelected ? 'text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80' : 'text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60'
                        }`}>
                          {location.description}
                        </p>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Skills Step
function SkillsStep({
  skills,
  skillPoints,
  pontosCriacao,
  onSkillsChange,
  onSkillPointsChange,
  onPointsChange,
  isEvolutionStep = false,
}: {
  skills: Record<string, { level: number; specialization?: string }>
  skillPoints: number
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onSkillsChange: (skills: Record<string, { level: number; specialization?: string }>) => void
  onSkillPointsChange: (points: number) => void
  onPointsChange: (gastos: number) => void
  isEvolutionStep?: boolean
}) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Skill['category']>('combate')
  
  // Inicializa a habilidade selecionada quando a categoria muda
  useEffect(() => {
    const categorySkills = getSkillsByCategory(selectedCategory)
    if (categorySkills.length > 0 && (!selectedSkill || !categorySkills.find(s => s.id === selectedSkill))) {
      setSelectedSkill(categorySkills[0].id)
    }
  }, [selectedCategory, selectedSkill])
  
  const categories: Skill['category'][] = ['combate', 'primarias', 'artisticas', 'cientificas', 'motoras', 'sociais', 'gerais']
  const categoryLabels: Record<Skill['category'], string> = {
    combate: 'Habilidades de Combate',
    primarias: 'Habilidades Primárias',
    artisticas: 'Habilidades Artísticas',
    cientificas: 'Habilidades Científicas',
    motoras: 'Habilidades Motoras',
    sociais: 'Habilidades Sociais',
    gerais: 'Habilidades Gerais',
  }

  // Custo em pontos gratuitos por categoria
  const getSkillFreeCost = (category: Skill['category']): number => {
    if (category === 'combate' || category === 'primarias') return 2
    return 1
  }

  // Custo em PC por categoria (para compras além dos 48 pontos)
  const getSkillPCCost = (category: Skill['category']): number => {
    if (category === 'combate' || category === 'primarias') return 10
    return 5
  }

  const getMaxLevel = () => isEvolutionStep ? 8 : 3

  // Calcula quantos pontos gratuitos foram gastos
  const calculateFreePointsUsed = () => {
    let total = 0
    Object.entries(skills).forEach(([skillId, skill]) => {
      if (skill.level > 0) {
        const skillData = getSkillById(skillId)
        if (skillData) {
          const costPerLevel = getSkillFreeCost(skillData.category)
          total += skill.level * costPerLevel
          // Especialidade custa o mesmo que um nível da habilidade
          if (skill.specialization) {
            total += costPerLevel
          }
        }
      }
    })
    return total
  }

  // Calcula quantos PC foram gastos (além dos 48 pontos gratuitos)
  const calculatePCUsed = () => {
    const freeUsed = calculateFreePointsUsed()
    const overFree = Math.max(0, freeUsed - 48)
    if (overFree === 0) return 0
    
    // Calcula proporcionalmente: se passou X pontos além dos 48, calcula quantos PC custaria
    // Isso é uma estimativa baseada na média de custos
    // Na prática, o cálculo exato é feito no updateSkill
    let estimatedPC = 0
    let totalPointsInSkills = 0
    
    Object.entries(skills).forEach(([skillId, skill]) => {
      if (skill.level > 0) {
        const skillData = getSkillById(skillId)
        if (skillData) {
          const freeCost = getSkillFreeCost(skillData.category)
          const pcCost = getSkillPCCost(skillData.category)
          const skillCost = (skill.level * freeCost) + (skill.specialization ? freeCost : 0)
          totalPointsInSkills += skillCost
          estimatedPC += (skill.level * pcCost) + (skill.specialization ? pcCost : 0)
        }
      }
    })
    
    // Se está usando 48 pontos ou menos, não gastou PC
    if (totalPointsInSkills <= 48) return 0
    
    // Calcula a proporção que foi comprada com PC
    const ratio = overFree / totalPointsInSkills
    return estimatedPC * ratio
  }

  const updateSkill = (skillId: string, level: number, specialization?: string) => {
    const skill = getSkillById(skillId)
    if (!skill) return

    const currentSkill = skills[skillId] || { level: 0, specialization: undefined }
    const freeCostPerLevel = getSkillFreeCost(skill.category)
    const maxLevel = getMaxLevel()
    
    // Calcula custo da mudança em pontos gratuitos
    const oldCost = (currentSkill.level * freeCostPerLevel) + (currentSkill.specialization ? freeCostPerLevel : 0)
    const newCost = (level * freeCostPerLevel) + (specialization ? freeCostPerLevel : 0)
    const costDiff = newCost - oldCost
    
    // Calcula quanto está usando atualmente
    const currentFreeUsed = calculateFreePointsUsed()
    const newFreeUsed = currentFreeUsed - oldCost + newCost
    
    // Não permite gastar PC além dos 48 pontos gratuitos
    if (newFreeUsed > 48) {
      return // Não permite aumentar além dos pontos gratuitos
    }
    
    // Se está dentro dos 48 pontos gratuitos
    if (skillPoints + oldCost >= newCost && level <= maxLevel) {
      onSkillsChange({
        ...skills,
        [skillId]: { level, specialization },
      })
      onSkillPointsChange(48 - (newFreeUsed))
    }
  }

  const randomizeSkills = () => {
    const maxLevel = getMaxLevel()
    const allSkills = skillsData
    const newSkills: Record<string, { level: number; specialization?: string }> = {}
    let remainingPoints = 48

    // Lista de habilidades disponíveis com seus custos
    const availableSkills = allSkills.map(skill => ({
      skill,
      costPerLevel: getSkillFreeCost(skill.category),
    }))

    // Embaralha as habilidades
    const shuffledSkills = [...availableSkills].sort(() => Math.random() - 0.5)

    // Primeira passada: distribui níveis nas habilidades
    let attempts = 0
    const maxAttempts = 500 // Evita loop infinito
    
    while (remainingPoints > 0 && attempts < maxAttempts) {
      attempts++
      let distributed = false
      
      // Tenta distribuir em habilidades aleatórias
      for (const { skill, costPerLevel } of shuffledSkills) {
        if (remainingPoints < costPerLevel) continue
        
        const currentLevel = newSkills[skill.id]?.level || 0
        if (currentLevel >= maxLevel) continue

        // 60% de chance de aumentar uma habilidade se tiver pontos
        if (Math.random() < 0.6 && remainingPoints >= costPerLevel) {
          const newLevel = Math.min(currentLevel + 1, maxLevel)
          const cost = costPerLevel
          
          if (remainingPoints >= cost) {
            newSkills[skill.id] = { level: newLevel }
            remainingPoints -= cost
            distributed = true
            break // Reinicia o loop para dar chance a outras habilidades
          }
        }
      }

      if (!distributed) break
    }

    // Segunda passada: adiciona especialidades aleatoriamente
    const skillsWithLevels = Object.entries(newSkills)
      .filter(([_, data]) => data.level > 0)
      .map(([skillId]) => {
        const skill = getSkillById(skillId)
        return skill ? { skillId, skill } : null
      })
      .filter(Boolean) as Array<{ skillId: string; skill: Skill }>

    // Embaralha habilidades com níveis
    const shuffledWithLevels = [...skillsWithLevels].sort(() => Math.random() - 0.5)

    for (const { skillId, skill } of shuffledWithLevels) {
      if (remainingPoints <= 0) break
      
      if (!newSkills[skillId].specialization && skill.specializations.length > 0) {
        const costPerLevel = getSkillFreeCost(skill.category)
        
        // 40% de chance de adicionar especialidade se tiver pontos
        if (Math.random() < 0.4 && remainingPoints >= costPerLevel) {
          const randomSpec = skill.specializations[Math.floor(Math.random() * skill.specializations.length)]
          newSkills[skillId] = {
            ...newSkills[skillId],
            specialization: randomSpec.id,
          }
          remainingPoints -= costPerLevel
        }
      }
    }

    // Terceira passada: tenta usar pontos restantes em níveis ou especialidades
    if (remainingPoints > 0) {
      for (const { skill, costPerLevel } of shuffledSkills) {
        if (remainingPoints < costPerLevel) continue
        
        const currentLevel = newSkills[skill.id]?.level || 0
        if (currentLevel >= maxLevel) {
          // Se já está no máximo, tenta adicionar especialidade
          if (!newSkills[skill.id]?.specialization && skill.specializations.length > 0 && remainingPoints >= costPerLevel) {
            const randomSpec = skill.specializations[Math.floor(Math.random() * skill.specializations.length)]
            newSkills[skill.id] = {
              level: currentLevel,
              specialization: randomSpec.id,
            }
            remainingPoints -= costPerLevel
          }
        } else {
          // Tenta aumentar nível
          if (remainingPoints >= costPerLevel) {
            const newLevel = Math.min(currentLevel + 1, maxLevel)
            newSkills[skill.id] = { level: newLevel }
            remainingPoints -= costPerLevel
          }
        }
        
        if (remainingPoints <= 0) break
      }
    }

    // Calcula pontos usados
    const freeUsed = Object.entries(newSkills).reduce((total, [skillId, skillData]) => {
      const skill = getSkillById(skillId)
      if (!skill) return total
      const costPerLevel = getSkillFreeCost(skill.category)
      return total + (skillData.level * costPerLevel) + (skillData.specialization ? costPerLevel : 0)
    }, 0)

    onSkillsChange(newSkills)
    onSkillPointsChange(48 - freeUsed)
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
              <BookOpen className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
                {isEvolutionStep ? 'Evoluir Habilidades' : 'Habilidades e Especialidades'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
                Você tem 48 pontos gratuitos para distribuir. Combate/Primárias custam 2 pontos, resto custa 1 ponto por nível. Especialidade custa o mesmo que um nível.
              </p>
            </div>
          </div>
          <Button
            onClick={randomizeSkills}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Dices className="w-4 h-4" />
            Aleatório
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className={`p-3.5 rounded-lg border transition-all ${
          skillPoints >= 0 
            ? 'bg-ecoar-teal/10 border-ecoar-teal/30 text-slate-900 dark:text-ecoar-light-900' 
            : 'bg-ecoar-magenta/10 border-ecoar-magenta/30 text-slate-900 dark:text-ecoar-light-900'
        }`}>
          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">Pontos Gratuitos</div>
          <div className={`text-2xl font-bold ${skillPoints >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
            {skillPoints}
          </div>
        </div>
      </div>

      {/* Layout Vertical: Categorias à Esquerda, Habilidades e Detalhes à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Lista de Categorias - Esquerda */}
        <div className="lg:col-span-1 space-y-2">
          {categories.map((category) => {
            const categorySkills = getSkillsByCategory(category)
            if (categorySkills.length === 0) return null
            
            return (
              <motion.button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  const firstSkill = categorySkills[0]
                  if (firstSkill) setSelectedSkill(firstSkill.id)
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 4 }}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  selectedCategory === category
                    ? 'border-ecoar-teal bg-ecoar-teal/10 shadow-lg shadow-ecoar-teal/20'
                    : 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">{categoryLabels[category]}</div>
                <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-1">
                  {categorySkills.length} habilidade{categorySkills.length !== 1 ? 's' : ''}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Lista de Habilidades e Detalhes - Direita */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Lista de Habilidades da Categoria */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {getSkillsByCategory(selectedCategory).map((skill) => {
              const skillData = skills[skill.id] || { level: 0, specialization: undefined }
              const freeCostPerLevel = getSkillFreeCost(selectedCategory)
              const currentCost = (skillData.level * freeCostPerLevel) + (skillData.specialization ? freeCostPerLevel : 0)
              
              return (
                <motion.button
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4 }}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    selectedSkill === skill.id
                      ? 'border-ecoar-teal bg-ecoar-teal/10 shadow-lg shadow-ecoar-teal/20'
                      : 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 truncate">{skill.name}</div>
                      <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                        {getSkillDice(skillData.level)} • Nv.{skillData.level}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-ecoar-teal">{skillData.level}</div>
                      <div className="text-[10px] text-slate-400 dark:text-ecoar-light-900/50">{currentCost}pt</div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Painel de Detalhes da Habilidade Selecionada */}
          <div>
            {selectedSkill && (() => {
              const skill = getSkillById(selectedSkill)
              if (!skill) return null
              
              const skillData = skills[skill.id] || { level: 0, specialization: undefined }
              const freeCostPerLevel = getSkillFreeCost(selectedCategory)
              const maxLevel = getMaxLevel()
              const currentCost = (skillData.level * freeCostPerLevel) + (skillData.specialization ? freeCostPerLevel : 0)
              
              // Calcula se pode aumentar
              const currentFreeUsed = calculateFreePointsUsed()
              const newCostIfIncrease = currentCost + freeCostPerLevel
              const newFreeUsed = currentFreeUsed - currentCost + newCostIfIncrease
              
              let canIncrease = false
              if (newFreeUsed <= 48) {
                canIncrease = skillPoints >= freeCostPerLevel && skillData.level < maxLevel
              } else {
                const pointsOverFree = newFreeUsed - 48
                const pcCostPerLevel = getSkillPCCost(selectedCategory)
                const pcCost = pointsOverFree * (pcCostPerLevel / freeCostPerLevel)
                canIncrease = pontosCriacao.disponiveis >= pcCost && skillData.level < maxLevel
              }
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-ecoar-teal/20 bg-ecoar-teal/8 backdrop-blur-sm h-full"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">{skill.name}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 dark:text-ecoar-light-900/60">Dado</div>
                        <div className="text-ecoar-teal font-semibold">{getSkillDice(skillData.level)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-ecoar-light-900/60">Custo</div>
                        <div className="text-ecoar-teal font-semibold">{freeCostPerLevel}pt/nível</div>
                      </div>
                    </div>
                  </div>

                  {/* Controles de Nível */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <motion.button
                        onClick={() => updateSkill(skill.id, Math.max(0, skillData.level - 1), skillData.specialization)}
                        disabled={skillData.level === 0}
                        whileHover={{ scale: skillData.level === 0 ? 1 : 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg bg-ecoar-magenta/15 border border-ecoar-magenta/25 hover:bg-ecoar-magenta/20 text-slate-900 dark:text-ecoar-light-900/90 font-semibold text-base disabled:opacity-30 transition-all flex items-center justify-center"
                      >
                        -
                      </motion.button>
                      
                      <div className="text-center min-w-[100px]">
                        <div className="text-5xl font-bold text-ecoar-teal mb-1">{skillData.level}</div>
                        <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">Nível</div>
                        <div className="text-xs text-slate-400 dark:text-ecoar-light-900/50 mt-1">{currentCost} pontos</div>
                      </div>
                      
                      <motion.button
                        onClick={() => updateSkill(skill.id, skillData.level + 1, skillData.specialization)}
                        disabled={!canIncrease}
                        whileHover={{ scale: !canIncrease ? 1 : 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg bg-ecoar-teal/15 border border-ecoar-teal/25 hover:bg-ecoar-teal/20 text-slate-900 dark:text-ecoar-light-900/90 font-semibold text-base disabled:opacity-30 transition-all flex items-center justify-center"
                      >
                        +
                      </motion.button>
                    </div>
                    <div className="text-center text-sm text-slate-500 dark:text-ecoar-light-900/60">
                      Máximo: {maxLevel}
                    </div>
                  </div>

                  {/* Especialização */}
                  {skill.specializations.length > 0 && (
                    <div className="pt-6 border-t border-ecoar-dark-300/30 dark:border-ecoar-light-900/20">
                      <label className="text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2 block font-semibold">
                        Especialidade <span className="text-ecoar-teal/70">(+{freeCostPerLevel}pt)</span>
                      </label>
                      <select
                        value={skillData.specialization || ''}
                        onChange={(e) => {
                          updateSkill(skill.id, skillData.level, e.target.value || undefined)
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 rounded-lg text-slate-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:ring-2 focus:ring-ecoar-teal focus:border-ecoar-teal"
                      >
                        <option value="">Nenhuma</option>
                        {skill.specializations.map((spec) => (
                          <option key={spec.id} value={spec.id} className="bg-ecoar-light-700 dark:bg-ecoar-dark-800">
                            {spec.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </motion.div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Aptitudes Step
function AptitudesStep({
  aptitudes,
  pontosCriacao,
  onAptitudesChange,
  onPointsChange,
  aptitudePoints,
  onAptitudePointsChange,
  isEvolutionStep = false,
}: {
  aptitudes: Record<string, number>
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onAptitudesChange: (aptitudes: Record<string, number>) => void
  onPointsChange: (gastos: number) => void
  aptitudePoints: number
  onAptitudePointsChange: (points: number) => void
  isEvolutionStep?: boolean
}) {
  const getMaxLevel = () => isEvolutionStep ? 8 : 3
  
  // Calcula quantos pontos gratuitos foram gastos
  const calculateFreePointsUsed = () => {
    return Object.values(aptitudes).reduce((sum, level) => sum + level, 0)
  }
  
  // Calcula quantos PC foram gastos (apenas pontos além dos 3 gratuitos)
  const calculatePCUsed = () => {
    const totalLevels = calculateFreePointsUsed()
    const pointsOverFree = Math.max(0, totalLevels - 3)
    return pointsOverFree * 20
  }
  
  const updateAptitude = (aptitudeId: string, level: number) => {
    const currentLevel = aptitudes[aptitudeId] || 0
    const maxLevel = getMaxLevel()
    
    // Não permite nível negativo ou acima do máximo individual
    if (level < 0 || level > maxLevel) return
    
    // Calcula o total de pontos usados antes e depois
    const currentTotal = calculateFreePointsUsed()
    const newTotal = currentTotal - currentLevel + level
    
    // Calcula pontos além dos 3 gratuitos
    const oldPointsOverFree = Math.max(0, currentTotal - 3)
    const newPointsOverFree = Math.max(0, newTotal - 3)
    const pointsOverFreeDiff = newPointsOverFree - oldPointsOverFree
    const costInPC = pointsOverFreeDiff * 20
    
    // Se está dentro dos 3 pontos gratuitos
    if (newTotal <= 3) {
      // Verifica se está aumentando
      if (level > currentLevel) {
        const pointsNeeded = level - currentLevel
        
        // Se não tem pontos gratuitos suficientes
        if (aptitudePoints < pointsNeeded) {
          // Se está na evolução (etapa de gastar PC), permite usar PC
          if (isEvolutionStep && costInPC > 0 && pontosCriacao.disponiveis >= costInPC) {
            onAptitudesChange({
              ...aptitudes,
              [aptitudeId]: level,
            })
            onAptitudePointsChange(3 - newTotal)
          }
          return
        }
      } else if (level < currentLevel) {
        // Está diminuindo - libera PC se houver
        if (isEvolutionStep && costInPC < 0) {
          onAptitudesChange({
            ...aptitudes,
            [aptitudeId]: level,
          })
          onAptitudePointsChange(3 - newTotal)
          return
        }
      }
      
      // Redistribuição normal ou aumento com pontos gratuitos disponíveis
      onAptitudesChange({
        ...aptitudes,
        [aptitudeId]: level,
      })
      onAptitudePointsChange(3 - newTotal)
    }
    // Se vai além dos 3 pontos gratuitos, só permite na evolução com PC
    else {
      // Na criação, não permite passar dos 3 pontos gratuitos
      if (!isEvolutionStep) return
      
      // Na evolução, permite usar PC (20 PC por ponto além dos 3 gratuitos)
      if (level > currentLevel) {
        // Verifica se tem PC suficiente
        if (pontosCriacao.disponiveis < costInPC) return
        
        onAptitudesChange({
          ...aptitudes,
          [aptitudeId]: level,
        })
        onAptitudePointsChange(0) // Já gastou todos os pontos gratuitos
      } else if (level < currentLevel) {
        // Está diminuindo, libera PC
        const newFreeUsed = Math.min(3, newTotal)
        
        onAptitudesChange({
          ...aptitudes,
          [aptitudeId]: level,
        })
        onAptitudePointsChange(3 - newFreeUsed)
      }
    }
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Award className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              {isEvolutionStep ? 'Evoluir Aptidões' : 'Aptidões'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Você tem 3 pontos gratuitos para distribuir
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className={`p-3.5 rounded-lg border transition-all ${
          aptitudePoints >= 0 
            ? 'bg-ecoar-teal/10 border-ecoar-teal/30 text-slate-900 dark:text-ecoar-light-900' 
            : 'bg-ecoar-magenta/10 border-ecoar-magenta/30 text-slate-900 dark:text-ecoar-light-900'
        }`}>
          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">Pontos Gratuitos</div>
          <div className={`text-2xl font-bold ${aptitudePoints >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
            {aptitudePoints}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aptitudesData.map((aptitude) => {
          const level = aptitudes[aptitude.id] || 0
          const dice = getSkillDice(level)
          const maxLevel = getMaxLevel()
          const totalPointsUsed = Object.values(aptitudes).reduce((sum, l) => sum + l, 0)
          const newTotalIfIncrease = totalPointsUsed - level + (level + 1)
          
          // Só pode aumentar se:
          // 1. Não atingiu o máximo individual (3 na criação, 8 na evolução)
          // 2. Tem pontos gratuitos disponíveis OU (na evolução) tem PC suficiente
          // 3. O novo total não excede 3 pontos gratuitos OU (na evolução) tem PC para o excedente
          let canIncrease = false
          if (level >= maxLevel) {
            canIncrease = false
          } else if (newTotalIfIncrease <= 3) {
            // Está dentro dos 3 gratuitos
            if (aptitudePoints > 0) {
              // Tem pontos gratuitos disponíveis
              canIncrease = true
            } else if (isEvolutionStep) {
              // Na etapa de gastar PC, permite redistribuir os 3 gratuitos
              // Se o total atual é 3, pode redistribuir sem custo
              const currentTotal = totalPointsUsed
              if (currentTotal === 3) {
                canIncrease = true // Permite redistribuir
              } else {
                canIncrease = false
              }
            } else {
              canIncrease = false
            }
          } else {
            // Está além dos 3 gratuitos - só permite na evolução com PC suficiente
            if (isEvolutionStep) {
              const pointsOverFreeIfIncrease = newTotalIfIncrease - 3
              const costInPCIfIncrease = pointsOverFreeIfIncrease * 20
              canIncrease = pontosCriacao.disponiveis >= costInPCIfIncrease
            } else {
              canIncrease = false // Na criação, não permite passar dos 3 gratuitos
            }
          }
          
          return (
            <motion.div
              key={aptitude.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="p-5 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 mb-1">{aptitude.name}</div>
                  <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mb-2 leading-relaxed">{aptitude.description}</p>
                  <div className="text-xs text-slate-400 dark:text-ecoar-light-900/50 mb-1">
                    {dice} • Nível {level}
                  </div>
                  <div className="text-xs text-ecoar-teal/70 font-semibold">
                    Gratuito
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => updateAptitude(aptitude.id, Math.max(0, level - 1))}
                  disabled={level === 0}
                  whileHover={{ scale: level === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 hover:bg-ecoar-magenta/20 hover:border-ecoar-magenta/30 text-slate-900 dark:text-ecoar-light-900 font-bold text-lg disabled:opacity-30 transition-all flex items-center justify-center"
                >
                  -
                </motion.button>
                <div className="flex-1 text-center">
                  <div className="text-4xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-1">{level}</div>
                  <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">Nível</div>
                  {level > 0 && (
                    <div className="text-xs text-ecoar-teal/70 mt-1">
                      Gratuito
                    </div>
                  )}
                </div>
                <motion.button
                  onClick={() => updateAptitude(aptitude.id, level + 1)}
                  disabled={!canIncrease}
                  whileHover={{ scale: !canIncrease ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-ecoar-light-900/10 border border-slate-200 dark:border-ecoar-light-900/20 hover:bg-ecoar-teal/20 hover:border-ecoar-teal/30 text-slate-900 dark:text-ecoar-light-900 font-bold text-lg disabled:opacity-30 transition-all flex items-center justify-center"
                >
                  +
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Evolution Step
function EvolutionStep({
  nivelAlmaInicial,
  pontosEvolucao,
}: {
  nivelAlmaInicial: number
  pontosEvolucao: number
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Sparkles className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Evolução do Personagem
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Você começou com Nível de Alma {nivelAlmaInicial}. Use seus {pontosEvolucao} Pontos de Evolução para adquirir singularidades ou evoluir traços.
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-lg border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60 space-y-1.5">
            <p>
              <strong className="text-slate-900 dark:text-ecoar-light-900">Pontos de Evolução:</strong> Você possui {pontosEvolucao} Pontos de Evolução que podem ser gastos para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Evoluir Atributos (máximo nível 8)</li>
              <li>Evoluir Habilidades (máximo nível 8)</li>
              <li>Evoluir Aptidões (máximo nível 8)</li>
              <li>Adquirir Singularidades</li>
            </ul>
            <p className="mt-3">
              <strong className="text-slate-900 dark:text-ecoar-light-900">Nota:</strong> Os Pontos de Evolução são convertidos em Pontos de Criação (PC) na proporção de 1 PE = 10 PC. Você pode gastá-los nos steps anteriores ou guardá-los para usar durante o jogo.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="p-4 rounded-lg border bg-ecoar-teal/8 border-ecoar-teal/20">
        <div className="text-[11px] text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50 uppercase tracking-wider mb-1.5">Pontos de Evolução Disponíveis</div>
        <div className="text-xl font-semibold text-ecoar-teal/90 dark:text-ecoar-teal-400/90">{pontosEvolucao}</div>
        <div className="text-[11px] text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50 mt-1.5">
          Equivalente a {pontosEvolucao * 10} Pontos de Criação
        </div>
      </div>
    </div>
  )
}

// Physical Characteristics Step
function PhysicalCharacteristicsStep({
  tamanho,
  peso,
  deslocamento,
  sentidos,
  onTamanhoChange,
  onPesoChange,
  onDeslocamentoChange,
  onSentidosChange,
}: {
  tamanho: string
  peso: string
  deslocamento: { terrestre: number; aquatico: number; aereo: number }
  sentidos: { visao: number; audicao: number; olfato: number }
  onTamanhoChange: (value: string) => void
  onPesoChange: (value: string) => void
  onDeslocamentoChange: (value: { terrestre: number; aquatico: number; aereo: number }) => void
  onSentidosChange: (value: { visao: number; audicao: number; olfato: number }) => void
}) {
  const tamanhos = ['Minúsculo', 'Muito Pequeno', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Gigante', 'Massivo', 'Titânico', 'Colossal', 'Absurdo']
  const pesos = ['Peso Pena', 'Miúdo', 'Delicado', 'Muito Leve', 'Leve', 'Médio', 'Pesado', 'Enorme', 'Gigante', 'Massivo', 'Titânico', 'Colossal', 'Absurdo']

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Características Físicas</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Defina tamanho, peso, deslocamento e sentidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tamanho */}
        <div className="p-4 rounded-lg border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Tamanho</label>
          <select
            value={tamanho}
            onChange={(e) => onTamanhoChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/[0.03] dark:bg-ecoar-dark-700/[0.03] border border-white/[0.08] dark:border-ecoar-light-900/[0.08] rounded-lg text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 focus:outline-none focus:ring-1 focus:ring-ecoar-teal/30 dark:focus:ring-ecoar-teal-500/30"
          >
            <option value="">Selecione...</option>
            {tamanhos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Peso */}
        <div className="p-4 rounded-lg border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03]">
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Peso</label>
          <select
            value={peso}
            onChange={(e) => onPesoChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/[0.03] dark:bg-ecoar-dark-700/[0.03] border border-white/[0.08] dark:border-ecoar-light-900/[0.08] rounded-lg text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 focus:outline-none focus:ring-1 focus:ring-ecoar-teal/30 dark:focus:ring-ecoar-teal-500/30"
          >
            <option value="">Selecione...</option>
            {pesos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deslocamento */}
      <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40">
        <h4 className="text-xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-4">Deslocamento (em metros)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Terrestre</label>
            <input
              type="number"
              value={deslocamento.terrestre}
              onChange={(e) => onDeslocamentoChange({ ...deslocamento, terrestre: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Aquático</label>
            <input
              type="number"
              value={deslocamento.aquatico}
              onChange={(e) => onDeslocamentoChange({ ...deslocamento, aquatico: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Aéreo</label>
            <input
              type="number"
              value={deslocamento.aereo}
              onChange={(e) => onDeslocamentoChange({ ...deslocamento, aereo: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Sentidos */}
      <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40">
        <h4 className="text-xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-4">Sentidos (em metros)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Visão</label>
            <input
              type="number"
              value={sentidos.visao}
              onChange={(e) => onSentidosChange({ ...sentidos, visao: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Audição</label>
            <input
              type="number"
              value={sentidos.audicao}
              onChange={(e) => onSentidosChange({ ...sentidos, audicao: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-ecoar-light-900/80 text-sm mb-2">Olfato</label>
            <input
              type="number"
              value={sentidos.olfato}
              onChange={(e) => onSentidosChange({ ...sentidos, olfato: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Path Singularities Tab Component
function PathSingularitiesTab({
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
  onPointsChange,
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
  onPointsChange: (gastos: number) => void
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
      onPointsChange(calculateTotalCost() - (pathBaseSingularity?.cost || 0))
    } else {
      onPathBaseSelect(id)
      onPointsChange(calculateTotalCost())
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
      
      // Recalculate cost
      let newCost = selectedPathBase && pathBaseSingularity ? pathBaseSingularity.cost : 0
      newPowers.forEach(pId => {
        const p = getCacadaPowerById(pId)
        if (p) newCost += p.cost
      })
      newEnhancements.forEach(eId => {
        const e = getCacadaEnhancementById(eId)
        if (e) newCost += e.cost
      })
      onPointsChange(newCost)
    } else {
      // Add power if can afford
      if (pontosDisponiveis >= (currentCost + power.cost)) {
        onCacadaPowersChange([...selectedCacadaPowers, id])
        onPointsChange(currentCost + power.cost)
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
      
      // Recalculate cost
      let newCost = selectedPathBase && pathBaseSingularity ? pathBaseSingularity.cost : 0
      selectedCacadaPowers.forEach(pId => {
        const p = getCacadaPowerById(pId)
        if (p) newCost += p.cost
      })
      newEnhancements.forEach(eId => {
        const e = getCacadaEnhancementById(eId)
        if (e) newCost += e.cost
      })
      onPointsChange(newCost)
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
        onPointsChange(currentCost + enhancement.cost)
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
            // Primeiro limpa as seleções
            onPathBaseSelect('')
            onBruxariasChange([])
            onCacadaPowersChange([])
            onCacadaEnhancementsChange([])
            // Depois remove a trilha (isso vai recalcular os pontos automaticamente)
            onTrilhaSelect('')
            // Reseta os pontos gastos da trilha
            onPointsChange(0)
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
function PCSpendingStep({
  singularidades,
  selectedEcoar,
  singularidadesEcoar,
  selectedTrilha,
  onTrilhaSelect,
  attributes,
  skills,
  aptitudes,
  selectedEscolaMarcial,
  onEscolaMarcialSelect,
  selectedRaca,
  singularidadesMarciais,
  onSingularidadesMarciaisChange,
  singularidadesRaciais,
  onSingularidadesRaciaisChange,
  raceBonuses,
  martialSchoolBonuses,
  pontosDisponiveis,
  onSingularidadesChange,
  onEcoarSelect,
  onSingularidadesEcoarChange,
  onAttributesChange,
  onSkillsChange,
  onAptitudesChange,
  onPointsChange,
  pontosCriacao,
  nivelAlma,
  activeSubStep,
  onSubStepChange,
}: {
  singularidades: string[]
  selectedEcoar: string
  singularidadesEcoar: string[]
  selectedTrilha: string
  onTrilhaSelect: (id: string) => void
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
  selectedEscolaMarcial: string
  onEscolaMarcialSelect: (id: string) => void
  selectedRaca: string
  singularidadesMarciais: string[]
  onSingularidadesMarciaisChange: (ids: string[]) => void
  singularidadesRaciais: string[]
  onSingularidadesRaciaisChange: (ids: string[]) => void
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
  pontosDisponiveis: number
  onSingularidadesChange: (singularidades: string[]) => void
  onEcoarSelect: (id: string) => void
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  onAttributesChange: (attrs: Record<string, number>) => void
  onSkillsChange: (skills: Record<string, { level: number; specialization?: string }>) => void
  onAptitudesChange: (apts: Record<string, number>) => void
  onPointsChange: (gastos: number) => void
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  activeSubStep: 'singularidades' | 'traços' | 'escola-marcial'
  onSubStepChange: (subStep: 'singularidades' | 'traços' | 'escola-marcial') => void
}) {
  return (
    <div className="space-y-6">
      {/* Content based on active sub-step */}
      <div>
        {activeSubStep === 'singularidades' && (
          <SingularitiesSpendingStep
            singularidades={singularidades}
            selectedEcoar={selectedEcoar}
            singularidadesEcoar={singularidadesEcoar}
            selectedTrilha={selectedTrilha}
            onTrilhaSelect={onTrilhaSelect}
            selectedEscolaMarcial={selectedEscolaMarcial}
            onEscolaMarcialSelect={onEscolaMarcialSelect}
            singularidadesMarciais={singularidadesMarciais}
            onSingularidadesMarciaisChange={onSingularidadesMarciaisChange}
            selectedRaca={selectedRaca}
            singularidadesRaciais={singularidadesRaciais}
            onSingularidadesRaciaisChange={onSingularidadesRaciaisChange}
            pontosDisponiveis={pontosDisponiveis}
            onSingularidadesChange={onSingularidadesChange}
            onEcoarSelect={onEcoarSelect}
            onSingularidadesEcoarChange={onSingularidadesEcoarChange}
            onPointsChange={onPointsChange}
            pontosCriacao={pontosCriacao}
            nivelAlma={nivelAlma}
            attributes={attributes}
            skills={skills}
            aptitudes={aptitudes}
          />
        )}

        {activeSubStep === 'traços' && (
          <TraitsSpendingStep
            attributes={attributes}
            skills={skills}
            aptitudes={aptitudes}
            pontosDisponiveis={pontosDisponiveis}
            raceBonuses={raceBonuses}
            martialSchoolBonuses={martialSchoolBonuses}
            onAttributesChange={onAttributesChange}
            onSkillsChange={onSkillsChange}
            onAptitudesChange={onAptitudesChange}
            onPointsChange={onPointsChange}
          />
        )}

      </div>
    </div>
  )
}

// Gastando PC (Singularidades) Step
function SingularitiesSpendingStep({
  singularidades,
  selectedEcoar,
  singularidadesEcoar,
  selectedTrilha,
  onTrilhaSelect,
  selectedEscolaMarcial,
  onEscolaMarcialSelect,
  singularidadesMarciais,
  onSingularidadesMarciaisChange,
  selectedRaca,
  singularidadesRaciais,
  onSingularidadesRaciaisChange,
  pontosDisponiveis,
  onSingularidadesChange,
  onEcoarSelect,
  onSingularidadesEcoarChange,
  onPointsChange,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  singularidades: string[]
  selectedEcoar: string
  singularidadesEcoar: string[]
  selectedTrilha: string
  onTrilhaSelect: (id: string) => void
  selectedEscolaMarcial: string
  onEscolaMarcialSelect: (id: string) => void
  singularidadesMarciais: string[]
  onSingularidadesMarciaisChange: (ids: string[]) => void
  selectedRaca: string
  singularidadesRaciais: string[]
  onSingularidadesRaciaisChange: (ids: string[]) => void
  pontosDisponiveis: number
  onSingularidadesChange: (singularidades: string[]) => void
  onEcoarSelect: (id: string) => void
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  onPointsChange: (gastos: number) => void
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const { getEcoarSingularityById } = useEcoarCatalogData()
  const [activeTab, setActiveTab] = useState<'criacao' | 'marciais' | 'raciais' | 'trilha' | 'ecoa'>('criacao')
  const [selectedBruxarias, setSelectedBruxarias] = useState<string[]>([])
  const [selectedCacadaPowers, setSelectedCacadaPowers] = useState<string[]>([])
  const [selectedCacadaEnhancements, setSelectedCacadaEnhancements] = useState<string[]>([])
  const [selectedPathBase, setSelectedPathBase] = useState<string>('')

  // Calcula o custo total incluindo todas as singularidades
  const calculateTotalCost = useCallback(() => {
    // Custo das singularidades de criação (excluindo marciais e raciais)
    const school = selectedEscolaMarcial ? getMartialSchoolDataById(selectedEscolaMarcial) : null
    const criacaoCost = singularidades.reduce((sum, singId) => {
      // Pula singularidades marciais (elas são gerenciadas separadamente)
      if (school?.singularities.some(s => s.id === singId)) {
        return sum
      }
      let sing: any = getCreationSingularityById(singId)
      if (!sing) {
        sing = getSingularityById(singId)
      }
      return sum + (sing?.cost || 0)
    }, 0)

    // Custo das singularidades de Ecoar
    const ecoarCost = singularidadesEcoar.reduce((sum, singId) => {
      const sing = getEcoarSingularityById(singId)
      return sum + (sing?.cost || 0)
    }, 0)

    // Custo das singularidades marciais (converte PE para PC: 1 PE = 10 PC)
    const marciaisCost = school ? singularidadesMarciais.reduce((sum, singId) => {
      const sing = school.singularities.find(s => s.id === singId)
      return sum + (sing ? (sing.cost * 10) : 0)
    }, 0) : 0

    // Custo das singularidades raciais (quando implementado)
    const raciaisCost = 0 // TODO: Implementar quando dados estiverem disponíveis

    return criacaoCost + ecoarCost + marciaisCost + raciaisCost
  }, [singularidades, singularidadesEcoar, singularidadesMarciais, selectedEscolaMarcial])

  // Atualiza o custo total quando qualquer singularidade muda
  useEffect(() => {
    const totalCost = calculateTotalCost()
    onPointsChange(totalCost)
  }, [singularidades, singularidadesEcoar, singularidadesMarciais, calculateTotalCost, onPointsChange])

  const toggleSingularity = (id: string, isCreation: boolean = false) => {
    let singularity: any = null
    let cost = 0

    if (isCreation) {
      singularity = getCreationSingularityById(id)
      cost = singularity?.cost || 0
    } else {
      singularity = getSingularityById(id)
      cost = singularity?.cost || 0
    }

    if (!singularity) return

    const isSelected = singularidades.includes(id)
    
    if (isSelected) {
      // Remove: o useEffect recalculará o custo total automaticamente
      onSingularidadesChange(singularidades.filter(s => s !== id))
    } else {
      // Verifica requisitos (não pode ter desvantagens/singularidades conflitantes)
      if (isCreation && 'requirements' in singularity && singularity.requirements) {
        const hasConflict = singularity.requirements.some((req: string) => singularidades.includes(req))
        if (hasConflict) return
      }
      
      // Calcula o custo total atual incluindo singularidades de Ecoar
      const currentTotalCost = calculateTotalCost()
      
      // Verifica se tem PC suficiente
      if (pontosCriacao.disponiveis >= cost) {
        onSingularidadesChange([...singularidades, id])
        // O useEffect recalculará o custo total automaticamente
      }
    }
  }

  // Singularidades de Criação (vantagens)
  const criacaoSingularities = creationSingularities

  // Singularidades de Trilha (placeholder - pode ser expandido)
  const trilhaSingularities: Singularity[] = []

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-ecoar-light-900 mb-1">
              Gastando Pontos de Criação (Singularidades)
            </h3>
            <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70">
              Escolha singularidades para seu personagem
            </p>
          </div>
        </div>
        <div className={`mt-4 text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
          PC Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-ecoar-light-900/20">
        {(['criacao', 'marciais', 'raciais', 'trilha', 'ecoa'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                : 'text-slate-500 dark:text-ecoar-light-900/60 hover:text-slate-700 dark:text-ecoar-light-900/80'
            }`}
          >
            {tab === 'criacao' && 'Singularidades de Criação'}
            {tab === 'marciais' && 'Singularidades Marciais'}
            {tab === 'raciais' && 'Singularidades Raciais'}
            {tab === 'trilha' && 'Singularidades de Trilha'}
            {tab === 'ecoa' && 'Ecoar'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'criacao' && (
          <div className="space-y-6">
            {/* Categorias de Singularidades de Criação */}
            {(['atributos', 'habilidades', 'genetica', 'talentos'] as const).map((category) => {
              const categorySingularities = getCreationSingularitiesByCategory(category)
              if (categorySingularities.length === 0) return null

              const categoryLabels: Record<typeof category, string> = {
                atributos: 'Atributos',
                habilidades: 'Habilidades',
                genetica: 'Genética',
                talentos: 'Talentos',
              }

              return (
                <div key={category} className="space-y-3">
                  <h5 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
                    {categoryLabels[category]}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categorySingularities.map((singularity) => {
                      const isSelected = singularidades.includes(singularity.id)
                      const canAfford = pontosDisponiveis >= singularity.cost
                      const hasConflict = singularity.requirements?.some(req => singularidades.includes(req)) || false
                      const canSelect = canAfford && !hasConflict
                      
                      return (
                        <SingularityCard
                          key={singularity.id}
                          name={singularity.name}
                          description={singularity.description}
                          cost={singularity.cost}
                          isSelected={isSelected}
                          canAfford={canAfford}
                          canSelect={canSelect}
                          onClick={() => toggleSingularity(singularity.id, true)}
                          requirementsText={singularity.requirements && singularity.requirements.length > 0 ? `Não pode possuir: ${singularity.requirements.map(req => {
                            const dis = getDisadvantageById(req)
                            const sing = getSingularityById(req) || getCreationSingularityById(req)
                            return dis?.name || sing?.name || req
                          }).join(', ')}` : undefined}
                          variant="teal"
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'marciais' && (
          <MartialSingularitiesTab
            selectedEscolaMarcial={selectedEscolaMarcial}
            onEscolaMarcialSelect={onEscolaMarcialSelect}
            singularidadesMarciais={singularidadesMarciais}
            onSingularidadesMarciaisChange={onSingularidadesMarciaisChange}
            pontosDisponiveis={pontosDisponiveis}
            onPointsChange={onPointsChange}
            pontosCriacao={pontosCriacao}
            nivelAlma={nivelAlma}
            attributes={attributes}
            skills={skills}
            aptitudes={aptitudes}
          />
        )}

        {activeTab === 'raciais' && (
          <RacialSingularitiesTab
            selectedRaca={selectedRaca}
            singularidadesRaciais={singularidadesRaciais}
            onSingularidadesRaciaisChange={onSingularidadesRaciaisChange}
            pontosDisponiveis={pontosDisponiveis}
            onPointsChange={onPointsChange}
            pontosCriacao={pontosCriacao}
            nivelAlma={nivelAlma}
            attributes={attributes}
            skills={skills}
            aptitudes={aptitudes}
          />
        )}

        {activeTab === 'trilha' && (
          <PathSingularitiesTab
            selectedTrilha={selectedTrilha}
            selectedPathBase={selectedPathBase}
            selectedBruxarias={selectedBruxarias}
            selectedCacadaPowers={selectedCacadaPowers}
            selectedCacadaEnhancements={selectedCacadaEnhancements}
            onTrilhaSelect={(id) => {
              // Se mudar a trilha, limpa as seleções específicas
              if (id !== selectedTrilha) {
                setSelectedPathBase('')
                setSelectedBruxarias([])
                setSelectedCacadaPowers([])
                setSelectedCacadaEnhancements([])
              }
              // Atualiza a trilha selecionada no componente pai
              onTrilhaSelect(id)
            }}
            onPathBaseSelect={setSelectedPathBase}
            onBruxariasChange={setSelectedBruxarias}
            onCacadaPowersChange={setSelectedCacadaPowers}
            onCacadaEnhancementsChange={setSelectedCacadaEnhancements}
            pontosDisponiveis={pontosDisponiveis}
            onPointsChange={onPointsChange}
          />
        )}

        {activeTab === 'ecoa' && (
          <EcoarSelection
            selectedEcoar={selectedEcoar}
            singularidadesEcoar={singularidadesEcoar}
            onEcoarSelect={onEcoarSelect}
            onSingularidadesEcoarChange={onSingularidadesEcoarChange}
            pontosDisponiveis={pontosDisponiveis}
            onPointsChange={onPointsChange}
            pontosCriacao={pontosCriacao}
            nivelAlma={nivelAlma}
            attributes={attributes}
            skills={skills}
            aptitudes={aptitudes}
          />
        )}
      </div>
    </div>
  )
}

// Ecoar Singularities List Component
function EcoarSingularitiesList({
  selectedEcoar,
  singularidadesEcoar,
  onSingularidadesEcoarChange,
  pontosDisponiveis,
  onPointsChange,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedEcoar: string
  singularidadesEcoar: string[]
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  pontosDisponiveis: number
  onPointsChange: (gastos: number) => void
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const { getEcoarSingularitiesByEcoarId, getEcoarSingularityById } = useEcoarCatalogData()
  const ecoarSingularitiesList = selectedEcoar ? getEcoarSingularitiesByEcoarId(selectedEcoar) : []
  
  // O cálculo do custo total é feito pelo componente pai (SingularitiesSpendingStep)
  // através de um useEffect que monitora singularidadesEcoar

  // Valida todos os requisitos de uma singularidade
  const checkRequirements = useCallback((singularity: EcoarSingularity): { valid: boolean; missingReqs: string[] } => {
    const missingReqs: string[] = []
    
    if (!singularity.requirements) {
      return { valid: true, missingReqs: [] }
    }

    // Verifica singularidade anterior
    if (singularity.requirements.previous) {
      if (!singularidadesEcoar.includes(singularity.requirements.previous)) {
        const prevSing = getEcoarSingularityById(singularity.requirements.previous!)
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
  }, [singularidadesEcoar, nivelAlma, attributes, skills, aptitudes])

  // Gera texto descritivo dos requisitos não atendidos
  const getRequirementText = useCallback((singularity: EcoarSingularity): string | undefined => {
    const { missingReqs } = checkRequirements(singularity)
    if (missingReqs.length === 0) return undefined
    return missingReqs.join(', ')
  }, [checkRequirements])

  const toggleSingularity = (id: string) => {
    const singularity = getEcoarSingularityById(id)
    if (!singularity) return

    const isSelected = singularidadesEcoar.includes(id)
    
    if (isSelected) {
      // Remove: o useEffect no componente pai recalculará o custo total automaticamente
      onSingularidadesEcoarChange(singularidadesEcoar.filter(s => s !== id))
    } else {
      // Verifica requisitos
      const { valid } = checkRequirements(singularity)
      if (!valid) return

      // Verifica se tem PC suficiente
      if (pontosCriacao.disponiveis >= singularity.cost) {
        onSingularidadesEcoarChange([...singularidadesEcoar, id])
        // O onPointsChange será chamado automaticamente pelo useEffect no componente pai
      }
    }
  }

  if (!ecoarSingularitiesList || ecoarSingularitiesList.length === 0) {
    return (
      <div>
        <h4 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900 mb-4">Singularidades do Ecoar</h4>
        <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm mb-4">
          Selecione singularidades específicas do seu Ecoar
        </p>
        <div className="p-4 bg-slate-50 dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20">
          <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">
            Este ecoar ainda não possui singularidades cadastradas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900 mb-2">Singularidades do Ecoar</h4>
        <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm mb-3">
          Selecione singularidades específicas do seu Ecoar
        </p>
        <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
          PC Disponíveis: {pontosDisponiveis}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ecoarSingularitiesList.map((singularity) => {
          const isSelected = singularidadesEcoar.includes(singularity.id)
          const { valid, missingReqs } = checkRequirements(singularity)
          const canAfford = pontosCriacao.disponiveis >= singularity.cost
          const canSelect = valid && (singularity.cost === 0 || canAfford)
          const requirementText = getRequirementText(singularity)
          
          return (
            <SingularityCard
              key={singularity.id}
              name={singularity.name}
              description={singularity.description}
              cost={singularity.cost}
              costLabel={singularity.cost === 0 ? undefined : 'PC'}
              secondaryCost={singularity.cost === 0 ? 'Inata' : undefined}
              isSelected={isSelected}
              canAfford={canAfford}
              canSelect={canSelect}
              onClick={() => toggleSingularity(singularity.id)}
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

// Martial Singularities Tab Component
function MartialSingularitiesTab({
  selectedEscolaMarcial,
  onEscolaMarcialSelect,
  singularidadesMarciais,
  onSingularidadesMarciaisChange,
  pontosDisponiveis,
  onPointsChange,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedEscolaMarcial: string
  onEscolaMarcialSelect: (id: string) => void
  singularidadesMarciais: string[]
  onSingularidadesMarciaisChange: (ids: string[]) => void
  pontosDisponiveis: number
  onPointsChange: (gastos: number) => void
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const allMartialSchools = getAllMartialSchools()
  const school = selectedEscolaMarcial ? getMartialSchoolDataById(selectedEscolaMarcial) : null

  // Calcula pontos gastos (converte PE para PC: 1 PE = 10 PC)
  const calculateCost = useCallback(() => {
    if (!school) return 0
    return singularidadesMarciais.reduce((sum, singId) => {
      const sing = school.singularities.find(s => s.id === singId)
      return sum + (sing ? (sing.cost * 10) : 0) // Converte PE para PC
    }, 0)
  }, [school, singularidadesMarciais])

  // Atualiza pontos gastos quando singularidades mudam
  useEffect(() => {
    const total = calculateCost()
    onPointsChange(total)
  }, [singularidadesMarciais, calculateCost, onPointsChange])

  // Valida requisitos de uma singularidade marcial
  const checkRequirements = useCallback((singularity: MartialSchoolSingularity): { valid: boolean; missingReqs: string[] } => {
    const missingReqs: string[] = []

    // Verifica singularidade anterior
    if (singularity.requirements.previous) {
      if (!singularidadesMarciais.includes(singularity.requirements.previous)) {
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
  }, [singularidadesMarciais, nivelAlma, attributes, skills, aptitudes, school])

  const toggleSingularity = (id: string) => {
    if (!school) return

    const singularity = school.singularities.find(s => s.id === id)
    if (!singularity) return

    const isSelected = singularidadesMarciais.includes(id)
    const costInPC = singularity.cost * 10 // Converte PE para PC

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
                Escolha sua escola marcial para comprar singularidades com Pontos de Criação
              </p>
            </div>
          </div>
          <div className={`mt-3 text-base font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal/90 dark:text-ecoar-teal-400/90' : 'text-ecoar-magenta/90 dark:text-ecoar-magenta-400/90'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMartialSchools.map((schoolItem, index) => (
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
          ))}
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
                Custo: 1 PE = 10 PC
              </p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal dark:text-ecoar-teal-400' : 'text-ecoar-magenta dark:text-ecoar-magenta-400'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>
        <button
          onClick={() => onEscolaMarcialSelect('')}
          className="flex items-center gap-2 text-slate-600 dark:text-ecoar-light-900/70 hover:text-slate-900 dark:text-ecoar-light-900 text-sm transition-colors mt-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Trocar escola marcial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {school.singularities.map((singularity) => {
          const isSelected = singularidadesMarciais.includes(singularity.id)
          const costInPC = singularity.cost * 10 // Converte PE para PC
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
              secondaryCost={`${singularity.cost} PE`}
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
function RacialSingularitiesTab({
  selectedRaca,
  singularidadesRaciais,
  onSingularidadesRaciaisChange,
  pontosDisponiveis,
  onPointsChange,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedRaca: string
  singularidadesRaciais: string[]
  onSingularidadesRaciaisChange: (ids: string[]) => void
  pontosDisponiveis: number
  onPointsChange: (gastos: number) => void
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const race = selectedRaca ? getRaceById(selectedRaca) : null

  // Placeholder para quando os dados forem adicionados
  useEffect(() => {
    // Quando os dados de singularidades raciais forem implementados, 
    // calcular o custo total aqui similar às outras tabs
    onPointsChange(0)
  }, [singularidadesRaciais, onPointsChange])

  if (!selectedRaca || !race) {
    return (
      <div className="space-y-5">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
              <Users className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-0.5">
                Singularidades Raciais
              </h3>
              <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50">
                Selecione uma raça para ver singularidades disponíveis
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20">
          <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">
          Por favor, selecione uma raça na Etapa 1 para ver as singularidades raciais disponíveis.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">
                Singularidades Raciais - {race.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60 mt-0.5">
                Singularidades específicas da sua raça
              </p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal dark:text-ecoar-teal-400' : 'text-ecoar-magenta dark:text-ecoar-magenta-400'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20">
        <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">
          As singularidades raciais ainda não foram implementadas. Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </div>
  )
}

// Ecoar Selection Component
function EcoarSelection({
  selectedEcoar,
  singularidadesEcoar,
  onEcoarSelect,
  onSingularidadesEcoarChange,
  pontosDisponiveis,
  onPointsChange,
  pontosCriacao,
  nivelAlma,
  attributes,
  skills,
  aptitudes,
}: {
  selectedEcoar: string
  singularidadesEcoar: string[]
  onEcoarSelect: (id: string) => void
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  pontosDisponiveis: number
  onPointsChange: (gastos: number) => void
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  nivelAlma: number
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
}) {
  const { ecoarTypes: ecoaTypes } = useEcoarCatalogData()
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900 mb-4">Tipo de Ecoar</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecoaTypes.map((ecoa) => (
            <motion.button
              key={ecoa.id}
              onClick={() => onEcoarSelect(ecoa.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                selectedEcoar === ecoa.id
                  ? 'border-ecoar-teal bg-ecoar-teal/20 shadow-lg shadow-ecoar-teal/30'
                  : 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15'
              }`}
            >
              <div className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg">{ecoa.name}</div>
              <p className="text-slate-600 dark:text-ecoar-light-900/70 text-sm mt-2">{ecoa.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedEcoar && <EcoarSingularitiesList 
        selectedEcoar={selectedEcoar}
        singularidadesEcoar={singularidadesEcoar}
        onSingularidadesEcoarChange={onSingularidadesEcoarChange}
        pontosDisponiveis={pontosDisponiveis}
        onPointsChange={onPointsChange}
        pontosCriacao={pontosCriacao}
        nivelAlma={nivelAlma}
        attributes={attributes}
        skills={skills}
        aptitudes={aptitudes}
      />}
    </div>
  )
}

// Gastando PC (Traços) Step
function TraitsSpendingStep({
  attributes,
  skills,
  aptitudes,
  pontosDisponiveis,
  raceBonuses,
  martialSchoolBonuses,
  onAttributesChange,
  onSkillsChange,
  onAptitudesChange,
  onPointsChange,
}: {
  attributes: Record<string, number>
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
  pontosDisponiveis: number
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
  onAttributesChange: (attrs: Record<string, number>) => void
  onSkillsChange: (skills: Record<string, { level: number; specialization?: string }>) => void
  onAptitudesChange: (apts: Record<string, number>) => void
  onPointsChange: (gastos: number) => void
}) {
  const [activeTab, setActiveTab] = useState<'atributos' | 'habilidades' | 'aptidoes'>('atributos')
  
  // Calcula o total de pontos base usados em todos os atributos
  const calculateTotalBasePoints = (attrs: Record<string, number>) => {
    return Object.entries(attrs).reduce((sum, [a, v]) => {
      const rB = raceBonuses[a] || 0
      const mB = martialSchoolBonuses[a] || 0
      const cB = 0 // TODO: Add class bonuses if needed
      const totalBonus = rB + mB + cB
      return sum + Math.max(0, v - totalBonus)
    }, 0)
  }

  // Calcula o total de pontos usados em aptidões
  const calculateAptitudeTotal = (apts: Record<string, number>) => {
    return Object.values(apts).reduce((sum, l) => sum + l, 0)
  }

  // Calcula gastos atuais em atributos
  const getGastosAtributos = () => {
    const totalBase = calculateTotalBasePoints(attributes)
    const pointsOverFree = Math.max(0, totalBase - 12)
    return pointsOverFree * 10
  }

  // Calcula gastos atuais em aptidões
  const getGastosAptitudes = () => {
    const total = calculateAptitudeTotal(aptitudes)
    const pointsOverFree = Math.max(0, total - 3)
    return pointsOverFree * 20
  }

  // Lógica para atualizar atributos com PC (10 PC por ponto além dos gratuitos)
  const updateAttributeWithPC = (attr: string, newTotalValue: number) => {
    const attrKey = attr as keyof typeof attributes
    const oldValue = attributes[attrKey]
    const raceBonus = raceBonuses[attr] || 0
    const martialSchoolBonus = martialSchoolBonuses[attr] || 0
    const classBonus = 0 // TODO: Add class bonuses if needed
    const totalBonus = raceBonus + martialSchoolBonus + classBonus
    
    const maxTotalValue = 3 + totalBonus
    const newValue = Math.max(0, Math.min(maxTotalValue, newTotalValue))
    
    if (newValue === oldValue) return
    
    const oldTotalBase = calculateTotalBasePoints(attributes)
    const newAttributes = { ...attributes, [attr]: newValue }
    const newTotalBase = calculateTotalBasePoints(newAttributes)
    
    // Calcula pontos além dos 12 gratuitos
    const oldPointsOverFree = Math.max(0, oldTotalBase - 12)
    const newPointsOverFree = Math.max(0, newTotalBase - 12)
    const pointsOverFreeDiff = newPointsOverFree - oldPointsOverFree
    const costInPC = pointsOverFreeDiff * 10
    
    const newGastosAtributos = newPointsOverFree * 10
    const gastosAptitudesAtuais = getGastosAptitudes()
    const gastosAtributosAtuais = getGastosAtributos()
    const gastosTotaisAtuais = gastosAtributosAtuais + gastosAptitudesAtuais
    const disponiveisAtuais = pontosDisponiveis - gastosTotaisAtuais
    
    if (costInPC > 0) {
      // Aumentando - precisa de PC
      if (disponiveisAtuais >= costInPC) {
        onAttributesChange(newAttributes)
        onPointsChange(newGastosAtributos + gastosAptitudesAtuais)
      } else {
        // Bug 2 Fix: Fornece feedback quando não há PC suficiente
        // O botão já está desabilitado pela lógica de canIncrease, então isso é uma camada extra de segurança
        // Em produção, poderia usar um toast/notificação aqui
      }
    } else if (costInPC < 0) {
      // Diminuindo - libera PC
      onAttributesChange(newAttributes)
      onPointsChange(newGastosAtributos + gastosAptitudesAtuais)
    } else {
      // Sem mudança no custo de PC (redistribuição dentro dos gratuitos)
      // Na etapa 6, permite redistribuir mesmo sem custo
      onAttributesChange(newAttributes)
      // Atualiza os gastos mesmo que não mude (para manter sincronizado)
      onPointsChange(newGastosAtributos + gastosAptitudesAtuais)
    }
  }

  // Wrapper para atualizar aptidões que também atualiza os gastos totais
  const handleAptitudesChange = (newAptitudes: Record<string, number>) => {
    onAptitudesChange(newAptitudes)
    // Recalcula os gastos de aptidões com os novos valores
    const newTotal = Object.values(newAptitudes).reduce((sum, l) => sum + l, 0)
    const newPointsOverFree = Math.max(0, newTotal - 3)
    const newGastosAptitudes = newPointsOverFree * 20
    // Atualiza os gastos totais incluindo atributos e aptidões
    onPointsChange(getGastosAtributos() + newGastosAptitudes)
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Zap className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Gastando Pontos de Criação (Traços)
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Use Pontos de Criação para melhorar seus traços. Atributos custam 10 PC por ponto além do valor base. Aptidões custam 20 PC por ponto além dos 3 gratuitos.
            </p>
          </div>
        </div>
        <div className={`mt-3 text-base font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal/90' : 'text-ecoar-magenta/90'}`}>
          PC Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-ecoar-light-900/20">
        {(['atributos', 'habilidades', 'aptidoes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                : 'text-slate-500 dark:text-ecoar-light-900/60 hover:text-slate-700 dark:text-ecoar-light-900/80'
            }`}
          >
            {tab === 'atributos' && 'Atributos (10 PC por ponto)'}
            {tab === 'habilidades' && 'Habilidades'}
            {tab === 'aptidoes' && 'Aptidões (20 PC por ponto)'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'atributos' && (
          <AttributesStep
            attributes={attributes}
            attributePoints={0}
            pontosCriacao={{ obtidos: 0, gastos: 0, disponiveis: Math.max(0, pontosDisponiveis - getGastosAptitudes()) }}
            onUpdate={updateAttributeWithPC}
            raceBonuses={raceBonuses}
            martialSchoolBonuses={martialSchoolBonuses}
            classBonuses={{}}
            onRandomize={() => {}}
            onPointsChange={() => {}} // Não usado, calculamos manualmente
            isEvolutionStep={true}
          />
        )}

        {activeTab === 'habilidades' && (
          <div className="text-center py-12 text-slate-500 dark:text-ecoar-light-900/60">
            <p>Funcionalidade de gastar PC em habilidades em desenvolvimento</p>
          </div>
        )}

        {activeTab === 'aptidoes' && (
          <AptitudesStep
            aptitudes={aptitudes}
            pontosCriacao={{ obtidos: 0, gastos: 0, disponiveis: Math.max(0, pontosDisponiveis - getGastosAtributos()) }}
            onAptitudesChange={handleAptitudesChange}
            onPointsChange={() => {}} // Não usado, calculamos manualmente
            aptitudePoints={0}
            onAptitudePointsChange={() => {}}
            isEvolutionStep={true}
          />
        )}
      </div>
    </div>
  )
}

// Singularities Step
function SingularitiesStep({
  singularidades,
  pontosDisponiveis,
  onSingularidadesChange,
  onPointsChange,
}: {
  singularidades: string[]
  pontosDisponiveis: number
  onSingularidadesChange: (singularidades: string[]) => void
  onPointsChange: (gastos: number) => void
}) {
  const toggleSingularity = (id: string) => {
    const singularity = getSingularityById(id)
    if (!singularity) return

    const isSelected = singularidades.includes(id)
    if (isSelected) {
      onSingularidadesChange(singularidades.filter(s => s !== id))
      onPointsChange(pontosDisponiveis + singularity.cost)
    } else {
      if (pontosDisponiveis >= singularity.cost) {
        onSingularidadesChange([...singularidades, id])
        onPointsChange(pontosDisponiveis - singularity.cost)
      }
    }
  }

  const categories: Singularity['category'][] = ['evolucao', 'talento', 'infusao', 'adaptacao', 'fragil', 'mente-prodigiosa', 'fisica-prodiga']
  const categoryLabels: Record<Singularity['category'], string> = {
    evolucao: 'Evolução',
    talento: 'Talento',
    infusao: 'Infusão',
    adaptacao: 'Adaptação',
    fragil: 'Frágil',
    'mente-prodigiosa': 'Mente Prodigiosa',
    'fisica-prodiga': 'Física Pródiga',
  }

  return (
    <div className="space-y-5 max-h-[700px] overflow-y-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Singularidades</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Escolha singularidades para seu personagem</p>
        <div className={`mt-2 text-base font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal/90' : 'text-red-400/90'}`}>
          Pontos Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {categories.map((category) => {
        const categorySingularities = getSingularitiesByCategory(category)
        if (categorySingularities.length === 0) return null

        return (
          <div key={category} className="space-y-3">
            <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 border-b border-white/[0.06] dark:border-ecoar-light-900/[0.06] pb-1.5">
              {categoryLabels[category]}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categorySingularities.map((singularity) => {
                const isSelected = singularidades.includes(singularity.id)
                const canAfford = pontosDisponiveis >= singularity.cost
                return (
                  <SingularityCard
                    key={singularity.id}
                    name={singularity.name}
                    description={singularity.description}
                    cost={singularity.cost}
                    isSelected={isSelected}
                    canAfford={canAfford}
                    canSelect={canAfford}
                    onClick={() => toggleSingularity(singularity.id)}
                    requirements={singularity.requirements}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Ecoar Step
function EcoarStep({
  selectedEcoar,
  singularidadesEcoar,
  onEcoarSelect,
  onSingularidadesChange,
}: {
  selectedEcoar: string
  singularidadesEcoar: string[]
  onEcoarSelect: (id: string) => void
  onSingularidadesChange: (singularidades: string[]) => void
}) {
  const { ecoarTypes: ecoaTypes } = useEcoarCatalogData()
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Ecoar</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Selecione seu Ecoar e suas singularidades</p>
      </div>

      {/* Ecoar Selection */}
      <div>
        <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-3">Tipo de Ecoar</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecoaTypes.map((ecoa) => (
            <button
              key={ecoa.id}
              onClick={() => onEcoarSelect(ecoa.id)}
              className={`p-4 rounded-lg border transition-all transform hover:scale-101 text-left ${
                selectedEcoar === ecoa.id
                  ? 'border-ecoar-teal/60 bg-ecoar-teal/15 shadow-lg shadow-ecoar-teal/10'
                  : 'border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] hover:border-ecoar-teal/30 dark:hover:border-ecoar-teal-500/30 hover:bg-white/[0.06] dark:hover:bg-ecoar-light-900/[0.06]'
              }`}
            >
              <div className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg">{ecoa.name}</div>
              <p className="text-slate-600 dark:text-ecoar-light-900/70 text-sm mt-2">{ecoa.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Ecoar Singularities - Placeholder */}
      {selectedEcoar && (
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-4">Singularidades do Ecoar</h4>
          <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">Selecione singularidades específicas do seu Ecoar</p>
          <div className="mt-4 p-4 bg-gray-800/40 rounded-lg border border-ecoar-dark/50">
            <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">Funcionalidade em desenvolvimento...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Creation Points Step
function CreationPointsStep({
  pontosCriacao,
  onPointsChange,
  selectedDisadvantages,
  onDisadvantagesChange,
}: {
  pontosCriacao: { obtidos: number; gastos: number; disponiveis: number }
  onPointsChange: (points: { obtidos: number; gastos: number; disponiveis: number }) => void
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
                    return (
                      <DisadvantageCard
                        key={disadvantage.id}
                        name={disadvantage.name}
                        description={disadvantage.description}
                        pontosCriacao={disadvantage.pontosCriacao}
                        isSelected={isSelected}
                        onClick={() => {
                          if (!onDisadvantagesChange) return
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
function BackgroundStep({
  nome,
  backstory,
  tracoPositivo,
  tracoNegativo,
  personalidade,
  onNomeChange,
  onBackstoryChange,
  onTracoPositivoChange,
  onTracoNegativoChange,
  onPersonalidadeChange,
}: {
  nome: string
  backstory: string
  tracoPositivo: string
  tracoNegativo: string
  personalidade: string
  onNomeChange: (value: string) => void
  onBackstoryChange: (value: string) => void
  onTracoPositivoChange: (value: string) => void
  onTracoNegativoChange: (value: string) => void
  onPersonalidadeChange: (value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Background do Personagem</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Preencha as informações sobre seu personagem</p>
      </div>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome do personagem"
            className="w-full px-3 py-2 bg-white/[0.03] dark:bg-ecoar-dark-700/[0.03] border border-white/[0.08] dark:border-ecoar-light-900/[0.08] rounded-lg text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 placeholder-white/40 dark:placeholder-ecoar-light-900/40 focus:outline-none focus:ring-1 focus:ring-ecoar-teal/30 dark:focus:ring-ecoar-teal-500/30"
          />
        </div>

        {/* Backstory */}
        <div>
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">História/Background</label>
          <textarea
            value={backstory}
            onChange={(e) => onBackstoryChange(e.target.value)}
            placeholder="Conte a história do seu personagem..."
            rows={5}
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </div>

        {/* Personalidade */}
        <div>
          <label className="block text-slate-900 dark:text-ecoar-light-900 font-semibold mb-2">Personalidade</label>
          <textarea
            value={personalidade}
            onChange={(e) => onPersonalidadeChange(e.target.value)}
            placeholder="Como seu personagem age e reage..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traço Positivo */}
          <div>
            <label className="block text-slate-900 dark:text-ecoar-light-900 font-semibold mb-2">Traço Positivo</label>
            <input
              type="text"
              value={tracoPositivo}
              onChange={(e) => onTracoPositivoChange(e.target.value)}
              placeholder="Um traço positivo..."
              className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Traço Negativo */}
          <div>
            <label className="block text-slate-900 dark:text-ecoar-light-900 font-semibold mb-2">Traço Negativo</label>
            <input
              type="text"
              value={tracoNegativo}
              onChange={(e) => onTracoNegativoChange(e.target.value)}
              placeholder="Um traço negativo..."
              className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Final Review Visualizer (Read-only)
function FinalReviewVisualizer({
  data,
}: {
  data: Partial<CharacterCreationData>
}) {
  const { getEcoarById } = useEcoarCatalogData()
  const selectedRace = data.raca ? getRaceById(data.raca) : null
  const selectedMartialSchool = data.escolaMarcial ? getMartialSchoolById(data.escolaMarcial) : null
  const selectedPath = data.trilha ? getPathById(data.trilha) : null
  const selectedLocation = data.localizacao ? getLocationById(data.localizacao) : null
  const selectedEcoar = data.ecoar ? getEcoarById(data.ecoar) : null

  const reviewCardClasses =
    'p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40 dark:bg-ecoar-light-900/10 dark:border-ecoar-light-900/20 backdrop-blur-sm'

  return (
    <div className="space-y-8 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-2 font-serif">Revisão Final</h3>
        <p className="text-slate-600 dark:text-ecoar-light-900/70">Revise todas as escolhas do seu personagem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Informações Básicas</h4>
          <div className="space-y-2 text-sm">
            <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Nome:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{data.nome || 'Não definido'}</span></div>
            {selectedRace && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Raça:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedRace.name}</span></div>}
            {selectedMartialSchool && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Escola Marcial:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedMartialSchool.name}</span></div>}
            {selectedLocation && (
              <div>
                <span className="text-slate-500 dark:text-ecoar-light-900/60">Região:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedLocation.name}</span>
                {selectedLocation.nation && (
                  <div className="text-slate-400 dark:text-ecoar-light-900/50 text-xs mt-1 ml-4">{selectedLocation.nation}</div>
                )}
                {selectedLocation.region && (
                  <div className="text-ecoar-teal/70 text-xs mt-1 ml-4">{selectedLocation.region}</div>
                )}
              </div>
            )}
            {selectedPath && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Trilha:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedPath.name}</span></div>}
            {selectedEcoar && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Ecoar:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{selectedEcoar.name}</span></div>}
          </div>
        </div>

        {/* Attributes Summary */}
        {data.attributes && (
          <div className={reviewCardClasses}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Atributos</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(data.attributes).map(([attr, value]) => (
                <div key={attr}>
                  <span className="text-slate-500 dark:text-ecoar-light-900/60 capitalize">{attr}:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Summary */}
        {data.skills && Object.keys(data.skills).length > 0 && (
          <div className={`md:col-span-2 ${reviewCardClasses}`}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Habilidades</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {Object.entries(data.skills).map(([skillId, skillData]) => {
                const skill = getSkillById(skillId)
                if (!skill || skillData.level === 0) return null
                return (
                  <div key={skillId}>
                    <span className="text-slate-500 dark:text-ecoar-light-900/60">{skill.name}:</span> <span className="text-slate-900 dark:text-ecoar-light-900 font-semibold">{skillData.level}</span>
                    {skillData.specialization && (
                      <span className="text-ecoar-magenta/60 text-xs ml-1">({skillData.specialization})</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Background */}
        {(data.backstory || data.personalidade) && (
          <div className={`md:col-span-2 ${reviewCardClasses}`}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Background</h4>
            <div className="space-y-3 text-sm">
              {data.backstory && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">História:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{data.backstory}</span></div>}
              {data.personalidade && <div><span className="text-slate-500 dark:text-ecoar-light-900/60">Personalidade:</span> <span className="text-slate-900 dark:text-ecoar-light-900">{data.personalidade}</span></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FinalReviewStep({
  nome,
  onNomeChange,
  data,
}: {
  nome: string
  onNomeChange: (nome: string) => void
  data: Partial<CharacterCreationData>
}) {
  const selectedRace = data.raca ? getRaceById(data.raca) : null
  const selectedMartialSchool = data.escolaMarcial ? getMartialSchoolById(data.escolaMarcial) : null
  const selectedPath = data.trilha ? getPathById(data.trilha) : null
  const selectedLocation = data.localizacao ? getLocationById(data.localizacao) : null

  const reviewCardClasses =
    'p-4 rounded-lg border border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] backdrop-blur-sm shadow-lg'

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Finalize seu Personagem</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Revise suas escolhas e dê um nome ao seu personagem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Character Name */}
        <div className="md:col-span-2">
          <label className="block text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80 font-medium mb-1.5 text-xs">Nome do Personagem</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Digite o nome..."
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          />
        </div>

        {/* Summary Cards */}
        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Raça</h4>
          {selectedRace ? (
            <div>
              <div className="text-slate-900 dark:text-ecoar-light-900 text-xl font-semibold">{selectedRace.name}</div>
            </div>
          ) : (
            <div className="text-slate-900 dark:text-ecoar-light-900/40">Não selecionado</div>
          )}
        </div>

        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Escola Marcial</h4>
          {selectedMartialSchool ? (
            <div>
              <div className="text-slate-900 dark:text-ecoar-light-900 text-xl font-semibold">{selectedMartialSchool.name}</div>
              <div className="text-ecoar-magenta/60 text-sm">{selectedMartialSchool.category}</div>
            </div>
          ) : (
            <div className="text-slate-900 dark:text-ecoar-light-900/40">Não selecionado</div>
          )}
        </div>

        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Trilha</h4>
          {selectedPath ? (
            <div className="text-slate-900 dark:text-ecoar-light-900 text-xl font-semibold">{selectedPath.name}</div>
          ) : (
            <div className="text-slate-900 dark:text-ecoar-light-900/40">Não selecionado</div>
          )}
        </div>

        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Região</h4>
          {selectedLocation ? (
            <div>
              <div className="text-slate-900 dark:text-ecoar-light-900 text-xl font-semibold">{selectedLocation.name}</div>
              {selectedLocation.nation && (
                <div className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">{selectedLocation.nation}</div>
              )}
              {selectedLocation.region && (
                <div className="text-ecoar-teal/70 text-sm">{selectedLocation.region}</div>
              )}
            </div>
          ) : (
            <div className="text-slate-900 dark:text-ecoar-light-900/40">Não selecionado</div>
          )}
        </div>

        <div className={reviewCardClasses}>
          <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Atributos</h4>
          <div className="space-y-2">
            {Object.entries(data.attributes || {}).map(([attr, value]) => (
              <div key={attr} className="flex justify-between text-slate-700 dark:text-ecoar-light-900/80">
                <span className="capitalize">{attr}:</span>
                <span className="font-semibold">{value} ({getAttributeModifier(value) >= 0 ? '+' : ''}{getAttributeModifier(value)})</span>
              </div>
            ))}
          </div>
        </div>

        {((data.equipamentos && data.equipamentos.length > 0) || (data.armas && data.armas.length > 0)) && (
          <div className={`md:col-span-2 ${reviewCardClasses}`}>
            <h4 className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg mb-4">Equipamentos & Armas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.equipamentos && data.equipamentos.length > 0 && (
                <div>
                  <h5 className="text-slate-700 dark:text-ecoar-light-900/80 font-semibold mb-2">Equipamentos:</h5>
                  <ul className="list-disc list-inside text-slate-600 dark:text-ecoar-light-900/70 space-y-1">
                    {data.equipamentos.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.armas && data.armas.length > 0 && (
                <div>
                  <h5 className="text-slate-700 dark:text-ecoar-light-900/80 font-semibold mb-2">Armas:</h5>
                  <ul className="list-disc list-inside text-slate-600 dark:text-ecoar-light-900/70 space-y-1">
                    {data.armas.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

