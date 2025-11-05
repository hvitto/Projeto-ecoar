'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, MapPin, Users, Route, Zap, Sword, Sparkles, Gem,
  Package, Calculator, BookOpen, User, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Target, Award, Sparkle, Shield, ScrollText,
  Skull, Heart, Brain, Eye, Footprints, Wand2, Dices, RefreshCw,
  Scroll, Crown, Coins, Hammer, Map, Globe, Star, Waves, Info
} from 'lucide-react'
import { races, getAllGenus, getRacesByGenus, getRaceById, Race } from '@/data/races'
import { paths, getPathById, Path } from '@/data/paths'
import { martialSchools, getMartialSchoolById, MartialSchool } from '@/data/martialSchools'
import { skills as skillsData, getSkillsByCategory, getSkillById, Skill } from '@/data/skills'
import { aptitudes as aptitudesData, getAptitudeById, Aptitude } from '@/data/aptitudes'
import { singularities, getSingularitiesByCategory, getSingularityById, Singularity } from '@/data/singularities'
import { creationSingularities, getCreationSingularityById, getCreationSingularitiesByCategory, CreationSingularity } from '@/data/creationSingularities'
import { getAllMartialSchools, getMartialSchoolDataById, MartialSchoolData, MartialSchoolSingularity } from '@/data/martialSchoolSingularities'
import { locations, getLocationById, Location } from '@/data/locations'
import { ecoarTypes as ecoaTypes, getEcoarById, Ecoar } from '@/data/ecoar'
import { soulLevels, getSoulLevelByNivel, SoulLevel, getEstagios } from '@/data/soulLevels'
import { disadvantages, getDisadvantageById, getDisadvantagesByCategory } from '@/data/disadvantages'
import { getAttributeModifier, getSkillDice } from '@/lib/calculations'

interface CharacterCreationData {
  // Step 1: Race
  genus?: string
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
}

interface CharacterCreationWizardProps {
  onComplete: (data: CharacterCreationData) => void
}

export default function CharacterCreationWizard({ onComplete }: CharacterCreationWizardProps) {
  const [showIntroduction, setShowIntroduction] = useState(true)
  const [initialLevel, setInitialLevel] = useState(1) // Nível inicial escolhido (1, 2, 3+)
  const [nivelAlmaInicial, setNivelAlmaInicial] = useState<number>(1) // Nível de Alma inicial (1-24)
  const [currentStep, setCurrentStep] = useState(0) // 0 = introdução, depois 1-8
  const [selectedGenus, setSelectedGenus] = useState<string>('')
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
  const [pontosCriacao, setPontosCriacao] = useState({ obtidos: 30, gastos: 0, disponiveis: 30 }) // Começa com 30
  const [nome, setNome] = useState('')
  const [backstory, setBackstory] = useState('')
  const [tracoPositivo, setTracoPositivo] = useState('')
  const [tracoNegativo, setTracoNegativo] = useState('')
  const [personalidade, setPersonalidade] = useState('')
  const [ideais, setIdeais] = useState('')
  const [vinculos, setVinculos] = useState('')
  const [defeitos, setDefeitos] = useState('')
  const [equipamentos, setEquipamentos] = useState<string[]>([])
  const [armas, setArmas] = useState<string[]>([])
  const [raceBonuses, setRaceBonuses] = useState<Record<string, number>>({})
  const [martialSchoolBonuses, setMartialSchoolBonuses] = useState<Record<string, number>>({})

  const availableRaces = selectedGenus ? getRacesByGenus(selectedGenus) : []
  const selectedRaceData = selectedRaca ? getRaceById(selectedRaca) : null

  // Calcula pontos de criação com desvantagens (30 base + até 30 de desvantagens = 60 max)
  useEffect(() => {
    const disadvantagePoints = selectedDisadvantages.reduce((sum, disId) => {
      const dis = getDisadvantageById(disId)
      return sum + (dis?.pontosCriacao || 0)
    }, 0)
    const totalPoints = 30 + Math.min(disadvantagePoints, 30)
    setPontosCriacao(prev => ({
      obtidos: totalPoints,
      gastos: prev.gastos,
      disponiveis: totalPoints - prev.gastos
    }))
  }, [selectedDisadvantages])

  // Apply race bonuses when race is selected
  useEffect(() => {
    const race = selectedRaca ? getRaceById(selectedRaca) : null
    const newBonuses = race?.bonuses?.attributes || {}
    
    setAttributes(prevAttrs => {
      const updated = { ...prevAttrs }
      
      // Remove old race bonuses
      Object.entries(raceBonuses).forEach(([attr, bonus]) => {
        const attrKey = attr as keyof typeof updated
        updated[attrKey] = Math.max(0, updated[attrKey] - bonus)
      })
      
      // Add new race bonuses
      Object.entries(newBonuses).forEach(([attr, bonus]) => {
        const attrKey = attr as keyof typeof updated
        updated[attrKey] = Math.max(0, Math.min(8, updated[attrKey] + bonus))
      })
      
      return updated
    })
    
    setRaceBonuses(newBonuses)
  }, [selectedRaca])

  // Apply martial school bonuses when school is selected
  useEffect(() => {
    const school = selectedEscolaMarcial ? getMartialSchoolById(selectedEscolaMarcial) : null
    const newBonuses = school?.bonuses?.attributes || {}
    
    setAttributes(prevAttrs => {
      const updated = { ...prevAttrs }
      
      // Remove old martial school bonuses
      Object.entries(martialSchoolBonuses).forEach(([attr, bonus]) => {
        const attrKey = attr as keyof typeof updated
        updated[attrKey] = Math.max(0, updated[attrKey] - bonus)
      })
      
      // Add new martial school bonuses
      Object.entries(newBonuses).forEach(([attr, bonus]) => {
        const attrKey = attr as keyof typeof updated
        updated[attrKey] = Math.max(0, Math.min(8, updated[attrKey] + bonus))
      })
      
      return updated
    })
    
    setMartialSchoolBonuses(newBonuses)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEscolaMarcial])


  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedGenus && selectedRaca // Raça
      case 1:
        // Atributos: todos devem ser >= 0 e pontos de atributo devem estar zerados
        return Object.values(attributes).every((a: number) => a >= 0 && a <= 3) && attributePoints === 0
      case 2:
        return true // Habilidades - pode avançar sem preencher
      case 3:
        return true // Aptidões - pode avançar sem preencher
      case 4:
        return true // Pontos de Criação - pode avançar
      case 5:
        return true // Gastando PC (Singularidades) - pode avançar
      case 6:
        return true // Gastando PC (Traços) - pode avançar
      case 7:
        return selectedEscolaMarcial !== '' // Gastando PC (Escola Marcial) - precisa selecionar escola
      case 8:
        return nivelAlmaInicial > 1 ? true : false // Evolução - só aparece se nível > 1
      case 9:
        return true // Equipamentos
      case 10:
        return nome.trim() !== '' // Finalização - precisa de nome
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      let nextStep = currentStep + 1
      // Se o próximo step é Evolução (8) mas nível é 1, pula para Equipamentos (9)
      if (nextStep === 8 && nivelAlmaInicial === 1) {
        nextStep = 9
      }
      setCurrentStep(nextStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1
      // Se o step anterior é Evolução (8) mas nível é 1, pula para Escola Marcial (7)
      if (prevStep === 8 && nivelAlmaInicial === 1) {
        prevStep = 7
      }
      setCurrentStep(prevStep)
    }
  }

  const handleFinish = () => {
    if (canProceed()) {
      onComplete({
        genus: selectedGenus,
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
        pontosCriacao,
        nome,
        backstory,
        tracoPositivo,
        tracoNegativo,
        personalidade,
        ideais,
        vinculos,
        defeitos,
        equipamentos,
        armas,
      })
    }
  }

  const updateAttribute = (attr: string, newTotalValue: number) => {
    const attrKey = attr as keyof typeof attributes
    const oldValue = attributes[attrKey]
    const raceBonus = raceBonuses[attr] || 0
    const martialSchoolBonus = martialSchoolBonuses[attr] || 0
    const totalBonus = raceBonus + martialSchoolBonus
    
    const maxLevel = currentStep === 9 ? 8 : 3 // Máximo 3 exceto na Evolução (step 9)
    const maxTotalValue = maxLevel + totalBonus
    
    // Garante que o valor não exceda o máximo e não seja negativo
    const newValue = Math.max(0, Math.min(maxTotalValue, newTotalValue))
    
    if (newValue === oldValue) return
    
    // Calcula o valor base (sem bônus) antes e depois
    const oldBaseValue = Math.max(0, oldValue - totalBonus)
    const newBaseValue = Math.max(0, newValue - totalBonus)
    
    // Calcula o total de pontos base usados (sem bônus) ANTES da mudança
    const oldTotalBasePoints = Object.entries(attributes).reduce((sum, [a, v]) => {
      const rB = raceBonuses[a] || 0
      const mB = martialSchoolBonuses[a] || 0
      return sum + Math.max(0, v - (rB + mB))
    }, 0)
    
    // Calcula o total de pontos base usados (sem bônus) DEPOIS da mudança
    const newAttributes = { ...attributes, [attr]: newValue }
    const newTotalBasePoints = Object.entries(newAttributes).reduce((sum, [a, v]) => {
      const rB = raceBonuses[a] || 0
      const mB = martialSchoolBonuses[a] || 0
      return sum + Math.max(0, v - (rB + mB))
    }, 0)
    
    // Quantos pontos além dos 12 gratuitos estão sendo usados
    const oldPointsOverFree = Math.max(0, oldTotalBasePoints - 12)
    const newPointsOverFree = Math.max(0, newTotalBasePoints - 12)
    const pointsOverFreeDiff = newPointsOverFree - oldPointsOverFree
    
    // Não permite gastar PC além dos 12 pontos gratuitos
    if (newTotalBasePoints > 12) {
      return // Não permite aumentar além dos pontos gratuitos
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
    
    // Calcula bônus de cada atributo
    const bonusValues: number[] = []
    attributeKeys.forEach((attr) => {
      const raceBonus = raceBonuses[attr] || 0
      const martialSchoolBonus = martialSchoolBonuses[attr] || 0
      const totalBonus = raceBonus + martialSchoolBonus
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
    Users, Zap, BookOpen, Award, Calculator, Sparkles, Zap, Sword, Gem, Package, User
  ]

  const stepTitles = [
    'Raça', 'Atributos', 'Habilidades', 'Aptidões', 'Pontos de Criação',
    'Gastando PC (Singularidades)', 'Gastando PC (Traços)', 
    'Gastando PC (Escola Marcial)', 'Evolução', 'Equipamentos', 'Finalização'
  ]

  // Total of steps: Evolução só aparece se nível > 1
  // Steps: 0-6 (básicos), 7 (Gastando PC - Escola Marcial), 8 (Evolução - condicional), 9 (Equipamentos), 10 (Finalização)
  const totalSteps = nivelAlmaInicial > 1 
    ? stepTitles.length - 1  // Com Evolução: 11 steps (0-10)
    : stepTitles.length - 2  // Sem Evolução: 10 steps (0-9, pula step 8)

  // Tela de Introdução
  if (showIntroduction) {
    return (
      <div className="min-h-screen bg-ecoar-light p-6 md:p-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 backdrop-blur-sm border border-ecoar-dark/10 rounded-2xl p-8 md:p-12 max-w-3xl w-full"
          >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-ecoar-teal/10 rounded-xl mb-6">
              <ScrollText className="w-8 h-8 text-ecoar-teal" />
            </div>
            <h1 className="text-3xl font-semibold text-ecoar-dark mb-4">
              Bem-vindo ao ECOAR
            </h1>
            <p className="text-ecoar-dark/70 text-base mb-8 leading-relaxed">
              Crie seu personagem e embarque em uma jornada épica neste mundo de fantasia sombria.
              Escolha o nível inicial do seu personagem para começar.
            </p>
          </div>

          {/* Seleção de Nível Inicial */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-ecoar-dark mb-4 text-center">
              Nível Inicial do Personagem
            </h2>
            <p className="text-sm text-ecoar-dark/70 mb-6 text-center">
              Esta escolha deve ser feita pelo Mestre Absoluto. Por padrão, recomenda-se Nível de Alma 1 para iniciantes.
            </p>
            <SoulLevelSelectionStep
              nivelAlmaInicial={nivelAlmaInicial}
              onSelect={setNivelAlmaInicial}
              variant="light"
            />
          </div>

          <motion.button
            onClick={() => {
              setShowIntroduction(false)
              setCurrentStep(0) // Começa em Raça (step 0)
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-gradient-to-r from-ecoar-teal to-ecoar-magenta hover:from-ecoar-teal/90 hover:to-ecoar-magenta/90 text-white rounded-lg font-medium text-base transition-all shadow-lg shadow-ecoar-teal/20"
          >
            Começar Criação
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-ecoar-light via-ecoar-light to-ecoar-teal/5 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Layout em 3 colunas: Sidebar | Conteúdo | Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">
          
          {/* Sidebar Esquerda - Stepper Vertical */}
          <aside className="lg:col-span-3 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-ecoar-dark/80 backdrop-blur-xl border border-ecoar-dark/50 rounded-2xl p-6 flex flex-col h-full"
            >
              {/* Header */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <h1 className="text-xl font-semibold text-white mb-2">
                  Criação de Personagem
                </h1>
                <p className="text-xs text-white/70">Nível {initialLevel}</p>
                {/* Progress Bar */}
                <div className="mt-4 w-full bg-ecoar-dark/30 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-ecoar-teal to-ecoar-magenta"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-2 text-center">
                  {currentStep} de {totalSteps} etapas
                </p>
              </div>

              {/* Steps List */}
              <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {stepTitles.map((title, idx) => {
                  // Pula o step de Evolução (8) se nível for 1
                  if (idx === 8 && nivelAlmaInicial === 1) {
                    return null
                  }
                  
                  const stepNum = idx
                  const StepIcon = stepIcons[idx] || Circle
                  const isActive = currentStep === stepNum
                  const isCompleted = currentStep > stepNum
                  const isClickable = isCompleted || stepNum === currentStep
                  
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => {
                        if (isClickable && stepNum <= totalSteps) {
                          setCurrentStep(stepNum)
                        }
                      }}
                      disabled={!isClickable}
                      whileHover={isClickable ? { x: 4 } : {}}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                        isActive
                          ? 'bg-ecoar-teal/20 border border-ecoar-teal/30 text-white'
                          : isCompleted
                          ? 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
                          : 'bg-transparent border border-white/5 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-ecoar-teal/30 text-ecoar-teal'
                          : isCompleted
                          ? 'bg-ecoar-teal/20 text-ecoar-teal'
                          : 'bg-white/5 text-white/30'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">
                          Etapa {stepNum}
                        </div>
                        <div className={`text-sm font-semibold truncate ${
                          isActive ? 'text-white' : 'text-white/70'
                        }`}>
                          {title}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </aside>

          {/* Área Central - Conteúdo do Step */}
          <main className="lg:col-span-6 flex flex-col">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-ecoar-dark/80 backdrop-blur-xl border border-ecoar-dark/50 rounded-2xl p-6 md:p-8 flex flex-col h-full"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Step 0: Raça Selection */}
                {currentStep === 0 && (
                  selectedRaca ? (
                    <SelectionDetailsPanel 
                      type="race"
                      selectedId={selectedRaca}
                      getItemById={getRaceById}
                      onBack={() => setSelectedRaca('')}
                      onSelect={(id) => setSelectedRaca(id)}
                    />
                  ) : (
                    <RaceSelectionStep
                      selectedGenus={selectedGenus}
                      selectedRaca={selectedRaca}
                      onGenusSelect={setSelectedGenus}
                      onRacaSelect={(raca) => {
                        setSelectedRaca(raca)
                        if (selectedGenus) {
                          setSelectedRaca(raca)
                        }
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
                    onPointsChange={(gastos) => setPontosCriacao(prev => ({ ...prev, gastos, disponiveis: prev.obtidos - gastos }))}
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
                    onPointsChange={(gastos) => setPontosCriacao(prev => ({ ...prev, gastos, disponiveis: prev.obtidos - gastos }))}
                    isEvolutionStep={false}
                  />
                )}

                {/* Step 3: Aptitudes */}
                {currentStep === 3 && (
                  <AptitudesStep
                    aptitudes={aptitudes}
                    pontosCriacao={pontosCriacao}
                    onAptitudesChange={setAptitudes}
                    onPointsChange={(gastos) => setPontosCriacao(prev => ({ ...prev, gastos, disponiveis: prev.obtidos - gastos }))}
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

                {/* Step 5: Gastando PC (Singularidades) */}
                {currentStep === 5 && (
                  <SingularitiesSpendingStep
                    singularidades={singularidades}
                    selectedEcoar={selectedEcoar}
                    singularidadesEcoar={singularidadesEcoar}
                    pontosDisponiveis={pontosCriacao.disponiveis}
                    onSingularidadesChange={setSingularidades}
                    onEcoarSelect={setSelectedEcoar}
                    onSingularidadesEcoarChange={setSingularidadesEcoar}
                    onPointsChange={(gastos) => setPontosCriacao(prev => ({ ...prev, gastos, disponiveis: prev.obtidos - gastos }))}
                  />
                )}

                {/* Step 6: Gastando PC (Traços) */}
                {currentStep === 6 && (
                  <TraitsSpendingStep
                    attributes={attributes}
                    skills={skills}
                    aptitudes={aptitudes}
                    pontosDisponiveis={pontosCriacao.disponiveis}
                    raceBonuses={raceBonuses}
                    martialSchoolBonuses={martialSchoolBonuses}
                    onAttributesChange={(attrs) => setAttributes(attrs as typeof attributes)}
                    onSkillsChange={setSkills}
                    onAptitudesChange={setAptitudes}
                    onPointsChange={(gastos) => setPontosCriacao(prev => ({ ...prev, gastos, disponiveis: prev.obtidos - gastos }))}
                  />
                )}

                {/* Step 7: Gastando PC (Escola Marcial) */}
                {currentStep === 7 && (
                  <MartialSchoolPCSpendingStep
                    selectedEscolaMarcial={selectedEscolaMarcial}
                    onSelect={setSelectedEscolaMarcial}
                    singularidadesMarciais={singularidades.filter(s => {
                      const school = getMartialSchoolDataById(selectedEscolaMarcial)
                      return school?.singularities.some(sing => sing.id === s)
                    })}
                    onSingularidadesChange={(singIds) => {
                      // Remove singularidades marciais antigas e adiciona novas
                      const otherSingularities = singularidades.filter(s => {
                        const school = getMartialSchoolDataById(selectedEscolaMarcial)
                        return !school?.singularities.some(sing => sing.id === s)
                      })
                      setSingularidades([...otherSingularities, ...singIds])
                    }}
                    pontosDisponiveis={pontosCriacao.disponiveis}
                    onPointsChange={(gastos) => setPontosCriacao(prev => ({ ...prev, gastos, disponiveis: prev.obtidos - gastos }))}
                    nivelAlma={nivelAlmaInicial}
                  />
                )}

                {/* Step 8: Evolução (só aparece se nível > 1) */}
                {currentStep === 8 && nivelAlmaInicial > 1 && (
                  <EvolutionStep
                    nivelAlmaInicial={nivelAlmaInicial}
                    pontosEvolucao={getSoulLevelByNivel(nivelAlmaInicial)?.pontosEvolucao || 0}
                  />
                )}

                {/* Step 9: Equipamentos */}
                {currentStep === 9 && (
                  <EquipmentStep
                    equipamentos={equipamentos}
                    armas={armas}
                    onEquipamentosChange={setEquipamentos}
                    onArmasChange={setArmas}
                    dinheiroExtra={
                      (nivelAlmaInicial > 1 ? (getSoulLevelByNivel(nivelAlmaInicial)?.pontosEvolucao || 0) * 50 : 0) +
                      (pontosCriacao.disponiveis * 100) // Cada PC não utilizado = 100 moedas
                    }
                  />
                )}

                {/* Step 10: Finalização */}
                {currentStep === 10 && (
                  <BackgroundStep
                    nome={nome}
                    backstory={backstory}
                    tracoPositivo={tracoPositivo}
                    tracoNegativo={tracoNegativo}
                    personalidade={personalidade}
                    ideais={ideais}
                    vinculos={vinculos}
                    defeitos={defeitos}
                    onNomeChange={setNome}
                    onBackstoryChange={setBackstory}
                    onTracoPositivoChange={setTracoPositivo}
                    onTracoNegativoChange={setTracoNegativo}
                    onPersonalidadeChange={setPersonalidade}
                    onIdeaisChange={setIdeais}
                    onVinculosChange={setVinculos}
                    onDefeitosChange={setDefeitos}
                  />
                )}
              </div>

            {/* Navigation Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-between gap-4 mt-auto pt-6"
            >
              <motion.button
                onClick={handleBack}
                disabled={currentStep === 0}
                whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </motion.button>
              
              {currentStep < totalSteps ? (
                <motion.button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  whileHover={{ scale: !canProceed() ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-ecoar-teal to-ecoar-magenta hover:from-ecoar-teal/90 hover:to-ecoar-magenta/90 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ecoar-teal/20"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleFinish}
                  disabled={!canProceed()}
                  whileHover={{ scale: !canProceed() ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-ecoar-teal to-ecoar-magenta hover:from-ecoar-teal/90 hover:to-ecoar-magenta/90 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ecoar-teal/20"
                >
                  <Sparkle className="w-4 h-4" />
                  Finalizar
                </motion.button>
              )}
            </motion.div>
          </motion.div>
          </main>

          {/* Sidebar Direita - Resumo */}
          <aside className="lg:col-span-3 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-ecoar-dark/80 backdrop-blur-xl border border-ecoar-dark/50 rounded-2xl p-6 flex flex-col h-full"
            >
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4 shrink-0">
                Resumo
              </h3>
              <div className="space-y-4 text-sm">
                {/* Raça com detalhes */}
                {selectedRaca && (
                  <div>
                    <div className="text-white/60 text-xs mb-2">Raça</div>
                    <div className="text-white font-semibold mb-2">
                      {getRaceById(selectedRaca)?.name || '—'}
                    </div>
                    {(() => {
                      const race = getRaceById(selectedRaca)
                      if (!race?.bonuses) return null
                      
                      return (
                        <div className="space-y-1.5 text-xs">
                          {race.bonuses.movement && (
                            <div className="flex items-center gap-2 text-white/70">
                              <Footprints className="w-3 h-3 text-ecoar-teal" />
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
                                <div className="flex items-center gap-2 text-white/70">
                                  <Eye className="w-3 h-3 text-ecoar-teal" />
                                  <span>Visão: {race.bonuses.senses.visao}m</span>
                                </div>
                              )}
                              {race.bonuses.senses.audicao !== undefined && (
                                <div className="flex items-center gap-2 text-white/70">
                                  <Users className="w-3 h-3 text-ecoar-teal" />
                                  <span>Audição: {race.bonuses.senses.audicao}m</span>
                                </div>
                              )}
                              {race.bonuses.senses.olfato !== undefined && (
                                <div className="flex items-center gap-2 text-white/70">
                                  <Star className="w-3 h-3 text-ecoar-teal" />
                                  <span>Olfato: {race.bonuses.senses.olfato}m</span>
                                </div>
                              )}
                            </div>
                          )}
                          {race.bonuses.attributes && Object.keys(race.bonuses.attributes).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(race.bonuses.attributes).map(([attr, value]) => (
                                <span key={attr} className="text-xs px-1.5 py-0.5 rounded bg-ecoar-teal/20 text-ecoar-teal border border-ecoar-teal/30">
                                  {attr === 'carisma' ? 'Car' : attr === 'finesse' ? 'Fin' : attr === 'forca' ? 'For' : attr === 'inteligencia' ? 'Int' : attr === 'percepcao' ? 'Per' : attr === 'vitalidade' ? 'Vit' : 'Von'}+{value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* Escola Marcial */}
                {selectedEscolaMarcial && (
                  <div>
                    <div className="text-white/60 text-xs mb-1">Escola Marcial</div>
                    <div className="text-white">
                      {getMartialSchoolById(selectedEscolaMarcial)?.name || '—'}
                    </div>
                  </div>
                )}
                
                {/* Trilha */}
                {selectedTrilha && (
                  <div>
                    <div className="text-white/60 text-xs mb-1">Trilha</div>
                    <div className="text-white">
                      {getPathById(selectedTrilha)?.name || '—'}
                    </div>
                  </div>
                )}
                {/* Atributos */}
                {Object.keys(attributes).length > 0 && Object.values(attributes).some(v => v > 0) && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-white/60 text-xs mb-2 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-ecoar-teal" />
                      Atributos
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {Object.entries(attributes).map(([attr, value]) => {
                        if (value === 0) return null
                        const modifier = getAttributeModifier(value)
                        const label = attr === 'carisma' ? 'Car' : attr === 'finesse' ? 'Fin' : attr === 'forca' ? 'For' : attr === 'inteligencia' ? 'Int' : attr === 'percepcao' ? 'Per' : attr === 'vitalidade' ? 'Vit' : 'Von'
                        return (
                          <div key={attr} className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/10">
                            <span className="text-white/70">{label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-semibold">{value}</span>
                              <span className="text-ecoar-teal/70">({modifier >= 0 ? '+' : ''}{modifier})</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Habilidades */}
                {Object.keys(skills).length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-white/60 text-xs mb-2 flex items-center gap-2">
                      <BookOpen className="w-3 h-3 text-ecoar-teal" />
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
                            <div key={skillId} className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/10 text-xs">
                              <span className="text-white/80 truncate flex-1">{skillData.name}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-white font-semibold">Nv.{skill.level}</span>
                                {skill.specialization && (
                                  <span className="text-ecoar-magenta/70 text-[10px]">Esp.</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      {Object.keys(skills).filter(id => skills[id].level > 0).length > 5 && (
                        <div className="text-white/40 text-[10px] text-center pt-1">
                          +{Object.keys(skills).filter(id => skills[id].level > 0).length - 5} mais
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Aptidões */}
                {Object.keys(aptitudes).length > 0 && Object.values(aptitudes).some(v => v > 0) && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-white/60 text-xs mb-2 flex items-center gap-2">
                      <Award className="w-3 h-3 text-ecoar-teal" />
                      Aptidões
                    </div>
                    <div className="space-y-1">
                      {Object.entries(aptitudes)
                        .filter(([_, level]) => level > 0)
                        .map(([aptId, level]) => {
                          const aptData = getAptitudeById(aptId)
                          if (!aptData) return null
                          return (
                            <div key={aptId} className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/10 text-xs">
                              <span className="text-white/80 truncate flex-1">{aptData.name}</span>
                              <span className="text-white font-semibold shrink-0">Nv.{level}</span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Desvantagens */}
                {selectedDisadvantages.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-white/60 text-xs mb-2 flex items-center gap-2">
                      <Skull className="w-3 h-3 text-ecoar-magenta" />
                      Desvantagens
                    </div>
                    <div className="space-y-1">
                      {selectedDisadvantages.map((disId) => {
                        const dis = getDisadvantageById(disId)
                        if (!dis) return null
                        return (
                          <div key={disId} className="p-1.5 bg-ecoar-magenta/10 rounded border border-ecoar-magenta/30 text-xs">
                            <span className="text-white/80">{dis.name}</span>
                            <span className="text-ecoar-magenta ml-1">+{dis.pontosCriacao} PC</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Singularidades */}
                {singularidades.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-white/60 text-xs mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-ecoar-teal" />
                      Singularidades
                    </div>
                    <div className="space-y-1">
                      {singularidades.map((singId) => {
                        const sing = getSingularityById(singId)
                        if (!sing) return null
                        return (
                          <div key={singId} className="p-1.5 bg-white/5 rounded border border-white/10 text-xs">
                            <span className="text-white/80">{sing.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Equipamentos */}
                {(equipamentos.length > 0 || armas.length > 0) && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-white/60 text-xs mb-2 flex items-center gap-2">
                      <Package className="w-3 h-3 text-ecoar-teal" />
                      Equipamentos
                    </div>
                    <div className="space-y-1">
                      {equipamentos.length > 0 && (
                        <div>
                          <div className="text-white/60 text-[10px] mb-1">Equipamentos:</div>
                          {equipamentos.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="p-1.5 bg-white/5 rounded border border-white/10 text-xs mb-1">
                              <span className="text-white/80">{item}</span>
                            </div>
                          ))}
                          {equipamentos.length > 3 && (
                            <div className="text-white/40 text-[10px] text-center pt-1">
                              +{equipamentos.length - 3} mais
                            </div>
                          )}
                        </div>
                      )}
                      {armas.length > 0 && (
                        <div className="mt-2">
                          <div className="text-white/60 text-[10px] mb-1">Armas:</div>
                          {armas.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="p-1.5 bg-white/5 rounded border border-white/10 text-xs mb-1">
                              <span className="text-white/80">{item}</span>
                            </div>
                          ))}
                          {armas.length > 3 && (
                            <div className="text-white/40 text-[10px] text-center pt-1">
                              +{armas.length - 3} mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pontos de Criação */}
                <div className="pt-4 border-t border-white/10">
                  <div className="text-white/60 text-xs mb-2">Pontos de Criação</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-ecoar-teal font-semibold">{pontosCriacao.disponiveis}</div>
                      <div className="text-white/40 text-xs">disponíveis</div>
                    </div>
                    <div className="text-white/40">/</div>
                    <div className="flex-1 text-right">
                      <div className="text-white font-semibold">{pontosCriacao.obtidos}</div>
                      <div className="text-white/40 text-xs">total</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// Step Components
function RaceSelectionStep({
  selectedGenus,
  selectedRaca,
  onGenusSelect,
  onRacaSelect,
  availableRaces,
}: {
  selectedGenus: string
  selectedRaca: string
  onGenusSelect: (genus: string) => void
  onRacaSelect: (raca: string) => void
  availableRaces: Race[]
}) {
  const genusVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

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
    <div className="space-y-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              Escolha sua Raça
            </h3>
            <p className="text-sm text-white/70">Selecione seu Genus e depois sua Raça específica</p>
          </div>
        </div>
      </div>

      {/* Genus Selection */}
      <div>
        <h4 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-ecoar-teal/20 rounded-lg border border-ecoar-teal/30">
            <Shield className="w-4 h-4 text-ecoar-teal" />
          </div>
          <span>Selecione seu Genus</span>
        </h4>
        <motion.div
          variants={genusVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {getAllGenus().map((genus) => (
            <motion.button
              key={genus}
              variants={itemVariants}
              onClick={() => {
                onGenusSelect(genus)
                onRacaSelect('')
              }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selectedGenus === genus
                  ? 'border-ecoar-teal bg-ecoar-teal/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-ecoar-teal/30'
              }`}
            >
              {selectedGenus === genus && (
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-ecoar-teal" />
                </motion.div>
              )}
              <div className="text-center">
                <div className={`font-semibold text-base mb-1 ${
                  selectedGenus === genus ? 'text-white' : 'text-white/90'
                }`}>
                  {genus}
                </div>
                <div className="text-sm text-white/60">
                  {getRacesByGenus(genus).length} raça(s)
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Race Selection */}
      <AnimatePresence mode="wait">
        {selectedGenus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-ecoar-teal/20 rounded-lg border border-ecoar-teal/30">
                <Circle className="w-4 h-4 text-ecoar-teal" />
              </div>
              <span>Selecione sua Raça</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableRaces.map((race, index) => {
                const getBonusesSummary = (race: Race) => {
                  if (!race.bonuses) return []
                  const summary: string[] = []
                  
                  if (race.bonuses.attributes) {
                    Object.entries(race.bonuses.attributes).forEach(([attr, value]) => {
                      summary.push(`${attributeLabelsShort[attr] || attr}+${value}`)
                    })
                  }
                  
                  if (race.bonuses.movement) {
                    if (race.bonuses.movement.terrestre) summary.push(`Ter:${race.bonuses.movement.terrestre}m`)
                    if (race.bonuses.movement.aquatico) summary.push(`Aqu:${race.bonuses.movement.aquatico}m`)
                    if (race.bonuses.movement.aereo) summary.push(`Aer:${race.bonuses.movement.aereo}m`)
                  }
                  
                  if (race.bonuses.senses) {
                    if (race.bonuses.senses.visao) summary.push(`Vis:${race.bonuses.senses.visao}m`)
                  }
                  
                  return summary
                }
                
                const bonuses = getBonusesSummary(race)
                const isSelected = selectedRaca === race.id
                
                return (
                  <motion.button
                    key={race.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onRacaSelect(race.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'bg-ecoar-teal/10 border-ecoar-teal shadow-lg shadow-ecoar-teal/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-ecoar-teal/30'
                    }`}
                  >
                    {/* Ícone e Título */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-ecoar-teal/20 text-ecoar-teal'
                          : 'bg-white/5 text-white/60'
                      }`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${
                          isSelected ? 'text-white' : 'text-white/90'
                        }`}>
                          {race.name}
                        </h4>
                        <span className="text-xs text-white/60">{race.genus}</span>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-ecoar-teal" />
                        </motion.div>
                      )}
                    </div>

                    {/* Descrição */}
                    <p className={`text-xs leading-relaxed mb-2 ${
                      isSelected ? 'text-white/80' : 'text-white/60'
                    }`}>
                      {race.description}
                    </p>

                    {/* Badges de Bônus */}
                    {bonuses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {bonuses.slice(0, 3).map((bonus, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-ecoar-teal/20 text-ecoar-teal border border-ecoar-teal/30">
                            {bonus}
                          </span>
                        ))}
                        {bonuses.length > 3 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/20">
                            +{bonuses.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
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
    <div className="space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Sword className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              Escolha sua Escola Marcial
            </h3>
            <p className="text-sm text-white/70">Selecione a classe de combate do seu personagem</p>
          </div>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allMartialSchools.map((school, index) => {
          const isSelected = selectedEscolaMarcial === school.id
          
          return (
            <motion.button
              key={school.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(school.id)}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'bg-ecoar-teal/20 border-ecoar-teal shadow-lg shadow-ecoar-teal/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-ecoar-teal/50'
              }`}
            >
              {/* Ícone e Título */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className={`font-bold text-lg mb-1 ${
                    isSelected ? 'text-white' : 'text-white/90'
                  }`}>
                    {school.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="px-2 py-0.5 rounded bg-white/10">{school.class}</span>
                    <span>{school.aptitude}</span>
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-ecoar-teal" />
                  </motion.div>
                )}
              </div>

              {/* Descrição */}
              <p className={`text-sm leading-relaxed mb-3 ${
                isSelected ? 'text-white/80' : 'text-white/60'
              }`}>
                {school.description}
              </p>

              {/* Informações da Escola */}
              <div className="space-y-1 text-xs text-white/50">
                <div><span className="font-medium">Ferramenta:</span> {school.tool}</div>
                {school.toolNote && (
                  <div className="text-ecoar-magenta italic">↪ {school.toolNote}</div>
                )}
                <div className="mt-2">
                  <span className="font-medium">Atributos sugeridos:</span> {school.suggestedAttributes?.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Habilidades sugeridas:</span> {school.suggestedSkills?.join(', ')}
                </div>
              </div>
            </motion.button>
          )
        })}
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
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
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
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <span className="text-xs text-white/60 px-2">
              {currentIndex + 1} / {allMartialSchools.length}
            </span>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-ecoar-teal/20 rounded-lg flex items-center justify-center">
            <Sword className="w-5 h-5 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{school.name}</h3>
            <p className="text-xs text-white/60 mt-0.5">Escola Marcial</p>
          </div>
        </div>
        <p className="text-sm text-white/80 leading-relaxed mt-3">
          {school.description}
        </p>
      </div>

      {/* Layout em 2 colunas: PNG à esquerda | INFO à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Lado Esquerdo - Espaço para PNG */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-white/40 text-sm">
              {/* Espaço reservado para imagem PNG */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white/30 text-xs">
                  Imagem PNG aqui
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - INFO */}
        <div className="space-y-6 overflow-y-auto custom-scrollbar">
          {/* Informações Básicas */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4">{school.name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-white/60">Classe:</span>
                <span className="text-white ml-2">{school.class}</span>
              </div>
              <div>
                <span className="text-white/60">Aptidão:</span>
                <span className="text-white ml-2">{school.aptitude}</span>
              </div>
              <div className="col-span-2">
                <span className="text-white/60">Ferramenta:</span>
                <span className="text-white ml-2 text-xs">{school.tool}</span>
              </div>
            </div>
            {school.toolNote && (
              <p className="text-xs text-ecoar-magenta mt-2 italic">↪ {school.toolNote}</p>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <div>
                <span className="text-white/60 font-medium">Atributos sugeridos:</span>
                <span className="text-white ml-2">{school.suggestedAttributes?.join(', ')}</span>
              </div>
              <div>
                <span className="text-white/60 font-medium">Habilidades sugeridas:</span>
                <span className="text-white ml-2">{school.suggestedSkills?.join(', ')}</span>
              </div>
              {school.suggestedEquipment && (
                <div>
                  <span className="text-white/60 font-medium">Equipamento sugerido:</span>
                  <span className="text-white ml-2">{school.suggestedEquipment}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informações sobre Singularidades */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-3">Singularidades</h4>
            <p className="text-sm text-white/70 mb-3">
              Esta escola possui {school.singularities.length} singularidades disponíveis, que podem ser adquiridas com Pontos de Evolução na próxima etapa.
            </p>
            <div className="text-xs text-white/60">
              <p>• Primeira singularidade requer: {school.singularities[0]?.requirements.nivelAlma ? `Nível de Alma ${school.singularities[0].requirements.nivelAlma}+` : 'Sem requisitos de nível'}</p>
              <p>• Custo inicial: {school.singularities[0]?.cost || 'N/A'} Pontos de Evolução</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Navegação Rápida - Ícones das Escolas na parte inferior */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
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
                    ? 'bg-ecoar-teal/20 border-ecoar-teal shadow-lg shadow-ecoar-teal/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-ecoar-teal/50'
                }`}
                title={s.name}
              >
                <Sword className={`w-5 h-5 ${isActive ? 'text-ecoar-teal' : 'text-white/60'}`} />
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-ecoar-teal rounded-full border-2 border-ecoar-dark"
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
    if (!selectedEscolaMarcial || !school) return
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
      <div className="space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
              <Sword className="w-6 h-6 text-ecoar-teal" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-1">
                Gastando PC (Escola Marcial)
              </h3>
              <p className="text-sm text-white/70">
                Escolha sua escola marcial e compre singularidades com Pontos de Criação
              </p>
            </div>
          </div>
          <div className={`mt-4 text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
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
              className="relative p-5 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-ecoar-teal/50 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1 text-white/90">
                    {school.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="px-2 py-0.5 rounded bg-white/10">{school.class}</span>
                    <span>{school.aptitude}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-3 text-white/60">
                {school.description}
              </p>
              <div className="space-y-1 text-xs text-white/50">
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
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onSelect('')}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
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
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <span className="text-xs text-white/60 px-2">
              {currentIndex + 1} / {allMartialSchools.length}
            </span>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ecoar-teal/20 rounded-lg flex items-center justify-center">
              <Sword className="w-5 h-5 text-ecoar-teal" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{school.name}</h3>
              <p className="text-xs text-white/60 mt-0.5">Gastando PC (Escola Marcial)</p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>
        <p className="text-sm text-white/80 leading-relaxed mt-3">
          {school.description}
        </p>
      </div>

      {/* Layout em 2 colunas: PNG à esquerda | INFO + SINGULARIDADES à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar">
        {/* Lado Esquerdo - Espaço para PNG */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-white/40 text-sm">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white/30 text-xs">Imagem PNG aqui</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - INFO + SINGULARIDADES */}
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h4 className="text-xl font-bold text-white mb-4">{school.name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-white/60">Classe:</span>
                <span className="text-white ml-2">{school.class}</span>
              </div>
              <div>
                <span className="text-white/60">Aptidão:</span>
                <span className="text-white ml-2">{school.aptitude}</span>
              </div>
              <div className="col-span-2">
                <span className="text-white/60">Ferramenta:</span>
                <span className="text-white ml-2 text-xs">{school.tool}</span>
              </div>
            </div>
            {school.toolNote && (
              <p className="text-xs text-ecoar-magenta mt-2 italic">↪ {school.toolNote}</p>
            )}
          </div>

          {/* Botão para ir para compra de singularidades */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Singularidades</h4>
                <p className="text-xs text-white/60">
                  {school.singularities.length} singularidades disponíveis para compra
                </p>
              </div>
              <motion.button
                onClick={() => setShowSingularities(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-ecoar-teal/20 hover:bg-ecoar-teal/30 border border-ecoar-teal/50 text-ecoar-teal rounded-lg font-semibold text-sm transition-all"
              >
                Comprar Singularidades
              </motion.button>
            </div>
            <p className="text-xs text-white/50">
              Custo: 1 PE = 10 PC | PC Disponíveis: {pontosDisponiveis}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Navegação Rápida - Ícones das Escolas */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
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
                    ? 'bg-ecoar-teal/20 border-ecoar-teal shadow-lg shadow-ecoar-teal/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-ecoar-teal/50'
                }`}
                title={s.name}
              >
                <Sword className={`w-5 h-5 ${isActive ? 'text-ecoar-teal' : 'text-white/60'}`} />
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-ecoar-teal rounded-full border-2 border-ecoar-dark"
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
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para detalhes da escola
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ecoar-teal/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-ecoar-teal" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Singularidades da {escolaMarcial.name}</h3>
              <p className="text-xs text-white/60 mt-0.5">Gastando PC (Escola Marcial)</p>
            </div>
          </div>
          <div className={`text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
            PC Disponíveis: {pontosDisponiveis}
          </div>
        </div>
        <p className="text-sm text-white/70 leading-relaxed mt-3">
          Compre singularidades com Pontos de Criação. Custo: 1 PE = 10 PC
        </p>
      </div>

      {/* Lista de Singularidades */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escolaMarcial.singularities.map((singularity) => {
            const isSelected = singularidadesMarciais.includes(singularity.id)
            const costInPC = singularity.cost * 10 // Converte PE para PC
            const canAfford = pontosDisponiveis >= costInPC
            const hasPrevious = !singularity.requirements.previous || singularidadesMarciais.includes(singularity.requirements.previous)
            const hasNivelAlma = !singularity.requirements.nivelAlma || nivelAlma >= singularity.requirements.nivelAlma
            const canSelect = canAfford && hasPrevious && hasNivelAlma

            return (
              <motion.button
                key={singularity.id}
                onClick={() => toggleSingularity(singularity.id)}
                disabled={!isSelected && !canSelect}
                whileHover={{ scale: !isSelected && canSelect ? 1.02 : 1 }}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-ecoar-teal bg-ecoar-teal/20 shadow-lg shadow-ecoar-teal/30'
                    : canSelect
                    ? 'border-white/10 bg-white/5 hover:border-ecoar-teal/50 hover:bg-white/10'
                    : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-bold text-lg">{singularity.name}</div>
                    <div className="text-xs text-white/60 mt-1">
                      Nível {singularity.level} ({['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][singularity.level - 1]})
                    </div>
                  </div>
                  <div className="text-ecoar-magenta font-semibold">
                    {costInPC} PC
                    <div className="text-xs text-white/50">({singularity.cost} PE)</div>
                  </div>
                </div>
                <p className="text-white/70 text-sm mb-2">{singularity.description}</p>
                {singularity.effects && (
                  <p className="text-white/60 text-xs mb-2">{singularity.effects}</p>
                )}
                <div className="text-xs text-white/50 mt-2">
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
      <div className="text-center py-12 text-white/60">
        <p>Escola marcial não encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              Singularidades da {school.name}
            </h3>
            <p className="text-sm text-white/70">
              Gaste seus Pontos de Evolução em singularidades marciais
            </p>
          </div>
        </div>
        <div className={`mt-4 text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
          PE Disponíveis: {pontosDisponiveis} / {pontosEvolucao}
        </div>
      </div>

      {/* Informações da Escola */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
        <h4 className="text-xl font-bold text-white mb-2">{school.name}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <span className="text-white/60">Classe:</span>
            <span className="text-white ml-2">{school.class}</span>
          </div>
          <div>
            <span className="text-white/60">Aptidão:</span>
            <span className="text-white ml-2">{school.aptitude}</span>
          </div>
          <div>
            <span className="text-white/60">Ferramenta:</span>
            <span className="text-white ml-2 text-xs">{school.tool}</span>
          </div>
        </div>
        <p className="text-white/70 text-sm mb-2">{school.description}</p>
        {school.toolNote && (
          <p className="text-xs text-ecoar-magenta mt-2 italic">↪ {school.toolNote}</p>
        )}
      </div>

      {/* Lista de Singularidades */}
      <div className="space-y-3">
        <h5 className="text-lg font-semibold text-white">Singularidades</h5>
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
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-ecoar-teal bg-ecoar-teal/20 shadow-lg shadow-ecoar-teal/30'
                    : canSelect
                    ? 'border-white/10 bg-white/5 hover:border-ecoar-teal/50 hover:bg-white/10'
                    : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-bold text-lg">{singularity.name}</div>
                    <div className="text-xs text-white/60 mt-1">
                      Nível {singularity.level} (Romano: {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][singularity.level - 1]})
                    </div>
                  </div>
                  <div className="text-ecoar-magenta font-semibold">{singularity.cost} PE</div>
                </div>
                <p className="text-white/70 text-sm mb-2">{singularity.description}</p>
                {singularity.effects && (
                  <p className="text-white/60 text-xs mb-2">{singularity.effects}</p>
                )}
                <div className="text-xs text-white/50 mt-2">
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
  onSelect
}: { 
  type: 'race' | 'path' | 'location' | 'martialSchool'
  selectedId: string
  getItemById: (id: string) => any
  onBack?: () => void
  onSelect?: (id: string) => void
}) {
  const item = getItemById(selectedId)
  if (!item) return null

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
      className="space-y-6"
    >
      {/* Header com Botão Voltar */}
      <div className="border-b border-white/10 pb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para seleção
          </button>
        )}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-ecoar-teal/20 rounded-lg flex items-center justify-center">
            {type === 'race' && <Users className="w-5 h-5 text-ecoar-teal" />}
            {type === 'path' && <Route className="w-5 h-5 text-ecoar-teal" />}
            {type === 'location' && <MapPin className="w-5 h-5 text-ecoar-teal" />}
            {type === 'martialSchool' && <Sword className="w-5 h-5 text-ecoar-teal" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
            <p className="text-xs text-white/60 mt-0.5">
              {type === 'race' && 'Raça'}
              {type === 'path' && 'Trilha'}
              {type === 'location' && 'Localização'}
              {type === 'martialSchool' && 'Escola Marcial'}
            </p>
          </div>
        </div>
        <p className="text-sm text-white/80 leading-relaxed mt-3">
          {item.description}
        </p>
      </div>

      {/* Layout em 2 colunas: PNG à esquerda | INFO à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lado Esquerdo - Espaço para PNG */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 min-h-[400px] flex items-center justify-center">
            <div className="text-center text-white/40 text-sm">
              {/* Espaço reservado para imagem PNG */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white/30 text-xs">
                  Imagem PNG aqui
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - INFO */}
        <div className="space-y-6">
          {/* Bônus Detalhados com Explicações */}
          {item.bonuses && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-ecoar-teal" />
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Bônus e Efeitos
                </h4>
              </div>

              {/* Bônus de Atributos */}
              {item.bonuses.attributes && Object.keys(item.bonuses.attributes).length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                    Atributos
                  </div>
                  <div className="space-y-3">
                    {Object.entries(item.bonuses.attributes).map(([attr, value]) => {
                      const attrInfo = attributeDescriptions[attr] || { name: attr, description: '' }
                      const Icon = attributeIconsMap[attr] || Star
                      const bonusValue = value as number
                      return (
                        <div key={attr} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="w-5 h-5 text-ecoar-teal" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-white">
                                  {attrInfo.name}
                                </span>
                                <span className="text-sm font-bold text-ecoar-teal">
                                  +{bonusValue}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-white/60 ml-8 leading-relaxed">
                            {attrInfo.description}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Bônus de Skills */}
              {item.bonuses.skills && Object.keys(item.bonuses.skills).length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                    Habilidades
                  </div>
                  <div className="space-y-2">
                    {Object.entries(item.bonuses.skills).map(([skill, value]) => {
                      const skillBonusValue = value as number
                      return (
                        <div key={skill} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-2">
                            <Sword className="w-4 h-4 text-ecoar-teal" />
                            <span className="text-sm font-semibold text-white capitalize">
                              {skill}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-ecoar-teal">+{skillBonusValue}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Limites */}
              {(item.bonuses.corpo || item.bonuses.mente || item.bonuses.folego || item.bonuses.mana) && (
                <div>
                  <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                    Limites
                  </div>
                  <div className="space-y-3">
                    {item.bonuses.corpo && (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-ecoar-teal" />
                            <span className="text-sm font-semibold text-white">
                              {limitDescriptions.corpo.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-ecoar-teal">+{item.bonuses.corpo}</span>
                        </div>
                        <p className="text-xs text-white/60 ml-6 leading-relaxed">
                          {limitDescriptions.corpo.description}
                        </p>
                      </div>
                    )}
                    {item.bonuses.mente && (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-ecoar-teal" />
                            <span className="text-sm font-semibold text-white">
                              {limitDescriptions.mente.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-ecoar-teal">+{item.bonuses.mente}</span>
                        </div>
                        <p className="text-xs text-white/60 ml-6 leading-relaxed">
                          {limitDescriptions.mente.description}
                        </p>
                      </div>
                    )}
                    {item.bonuses.folego && (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Waves className="w-4 h-4 text-ecoar-teal" />
                            <span className="text-sm font-semibold text-white">
                              {limitDescriptions.folego.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-ecoar-teal">+{item.bonuses.folego}</span>
                        </div>
                        <p className="text-xs text-white/60 ml-6 leading-relaxed">
                          {limitDescriptions.folego.description}
                        </p>
                      </div>
                    )}
                    {item.bonuses.mana && (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-ecoar-teal" />
                            <span className="text-sm font-semibold text-white">
                              {limitDescriptions.mana.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-ecoar-teal">+{item.bonuses.mana}</span>
                        </div>
                        <p className="text-xs text-white/60 ml-6 leading-relaxed">
                          {limitDescriptions.mana.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Movimento (para raças) */}
              {item.bonuses.movement && (
                <div>
                  <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                    Movimento
                  </div>
                  <div className="space-y-2">
                    {item.bonuses.movement.terrestre && (
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2">
                          <Footprints className="w-4 h-4 text-ecoar-teal" />
                          <span className="text-sm font-semibold text-white">Terrestre</span>
                        </div>
                        <span className="text-sm font-bold text-ecoar-teal">{item.bonuses.movement.terrestre}m</span>
                      </div>
                    )}
                    {item.bonuses.movement.aquatico && (
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2">
                          <Waves className="w-4 h-4 text-ecoar-teal" />
                          <span className="text-sm font-semibold text-white">Aquático</span>
                        </div>
                        <span className="text-sm font-bold text-ecoar-teal">{item.bonuses.movement.aquatico}m</span>
                      </div>
                    )}
                    {item.bonuses.movement.aereo && (
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-ecoar-teal" />
                          <span className="text-sm font-semibold text-white">Aéreo</span>
                        </div>
                        <span className="text-sm font-bold text-ecoar-teal">{item.bonuses.movement.aereo}m</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sentidos (para raças) */}
              {item.bonuses.senses && (
                <div>
                  <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                    Sentidos
                  </div>
                  <div className="space-y-2">
                    {item.bonuses.senses.visao !== undefined && (
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-ecoar-teal" />
                          <span className="text-sm font-semibold text-white">Visão</span>
                        </div>
                        <span className="text-sm font-bold text-ecoar-teal">{item.bonuses.senses.visao}m</span>
                      </div>
                    )}
                    {item.bonuses.senses.audicao !== undefined && (
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-ecoar-teal" />
                          <span className="text-sm font-semibold text-white">Audição</span>
                        </div>
                        <span className="text-sm font-bold text-ecoar-teal">{item.bonuses.senses.audicao}m</span>
                      </div>
                    )}
                    {item.bonuses.senses.olfato !== undefined && (
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-ecoar-teal" />
                          <span className="text-sm font-semibold text-white">Olfato</span>
                        </div>
                        <span className="text-sm font-bold text-ecoar-teal">{item.bonuses.senses.olfato}m</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!item.bonuses && (
            <div className="text-sm text-white/60 text-center py-8">
              Esta seleção não possui bônus especiais.
            </div>
          )}
        </div>
      </div>

      {/* Comparação Rápida para Raças */}
      {type === 'race' && onSelect && (
        <RaceComparisonSection
          selectedRaca={selectedId}
          onSelect={onSelect}
        />
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
      className="bg-ecoar-teal/5 border border-ecoar-teal/20 rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-ecoar-teal" />
        <h5 className="text-sm font-semibold text-white uppercase tracking-wider">
          Bônus Detalhados
        </h5>
      </div>

      {/* Bônus de Atributos */}
      {bonuses.attributes && Object.keys(bonuses.attributes).length > 0 && (
        <div>
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Atributos
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(bonuses.attributes).map(([attr, value]) => {
              const Icon = attributeIconsMap[attr] || Star
              const bonusValue = value as number
              return (
                <div key={attr} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <Icon className="w-4 h-4 text-ecoar-teal" />
                  <span className="text-sm font-semibold text-white">
                    {attributeLabelsShort[attr] || attr}
                  </span>
                  <span className="text-sm font-bold text-ecoar-teal">+{bonusValue}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bônus de Skills */}
      {bonuses.skills && Object.keys(bonuses.skills).length > 0 && (
        <div>
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Habilidades
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(bonuses.skills).map(([skill, value]) => (
              <div key={skill} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Sword className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white capitalize">
                  {skill}
                </span>
                <span className="text-sm font-bold text-ecoar-teal">+{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outros Bônus */}
      {(bonuses.corpo || bonuses.mente || bonuses.folego || bonuses.mana) && (
        <div>
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Limites
          </div>
          <div className="flex flex-wrap gap-2">
            {bonuses.corpo && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Heart className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Corpo</span>
                <span className="text-sm font-bold text-ecoar-teal">+{bonuses.corpo}</span>
              </div>
            )}
            {bonuses.mente && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Brain className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Mente</span>
                <span className="text-sm font-bold text-ecoar-teal">+{bonuses.mente}</span>
              </div>
            )}
            {bonuses.folego && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Waves className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Fôlego</span>
                <span className="text-sm font-bold text-ecoar-teal">+{bonuses.folego}</span>
              </div>
            )}
            {bonuses.mana && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Sparkles className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Mana</span>
                <span className="text-sm font-bold text-ecoar-teal">+{bonuses.mana}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movimento (para raças) */}
      {bonuses.movement && (
        <div>
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Movimento
          </div>
          <div className="flex flex-wrap gap-2">
            {bonuses.movement.terrestre && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Footprints className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Terrestre</span>
                <span className="text-sm font-bold text-ecoar-teal">{bonuses.movement.terrestre}m</span>
              </div>
            )}
            {bonuses.movement.aquatico && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Waves className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Aquático</span>
                <span className="text-sm font-bold text-ecoar-teal">{bonuses.movement.aquatico}m</span>
              </div>
            )}
            {bonuses.movement.aereo && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Zap className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Aéreo</span>
                <span className="text-sm font-bold text-ecoar-teal">{bonuses.movement.aereo}m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sentidos (para raças) */}
      {bonuses.senses && (
        <div>
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
            Sentidos
          </div>
          <div className="flex flex-wrap gap-2">
            {bonuses.senses.visao !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Eye className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Visão</span>
                <span className="text-sm font-bold text-ecoar-teal">{bonuses.senses.visao}m</span>
              </div>
            )}
            {bonuses.senses.audicao !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Users className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Audição</span>
                <span className="text-sm font-bold text-ecoar-teal">{bonuses.senses.audicao}m</span>
              </div>
            )}
            {bonuses.senses.olfato !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Star className="w-4 h-4 text-ecoar-teal" />
                <span className="text-sm font-semibold text-white">Olfato</span>
                <span className="text-sm font-bold text-ecoar-teal">{bonuses.senses.olfato}m</span>
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
    carisma: 'Car',
    finesse: 'Fin',
    forca: 'For',
    inteligencia: 'Int',
    percepcao: 'Per',
    vitalidade: 'Vit',
    vontade: 'Von',
  }

  const getBonusesSummary = (race: Race) => {
    if (!race.bonuses) return []
    const summary: string[] = []
    
    if (race.bonuses.attributes) {
      Object.entries(race.bonuses.attributes).forEach(([attr, value]) => {
        summary.push(`${attributeLabels[attr] || attr}+${value}`)
      })
    }
    
    if (race.bonuses.skills) {
      Object.keys(race.bonuses.skills).forEach((skill) => {
        summary.push(`Skill: ${skill}`)
      })
    }
    
    if (race.bonuses.corpo) summary.push(`Corpo+${race.bonuses.corpo}`)
    if (race.bonuses.mente) summary.push(`Mente+${race.bonuses.mente}`)
    if (race.bonuses.folego) summary.push(`Fôlego+${race.bonuses.folego}`)
    if (race.bonuses.mana) summary.push(`Mana+${race.bonuses.mana}`)
    
    if (race.bonuses.movement) {
      if (race.bonuses.movement.terrestre) summary.push(`Mov: ${race.bonuses.movement.terrestre}m`)
      if (race.bonuses.movement.aquatico) summary.push(`Aqu: ${race.bonuses.movement.aquatico}m`)
      if (race.bonuses.movement.aereo) summary.push(`Aer: ${race.bonuses.movement.aereo}m`)
    }
    
    if (race.bonuses.senses) {
      if (race.bonuses.senses.visao) summary.push(`Vis: ${race.bonuses.senses.visao}m`)
      if (race.bonuses.senses.audicao) summary.push(`Aud: ${race.bonuses.senses.audicao}m`)
      if (race.bonuses.senses.olfato) summary.push(`Olf: ${race.bonuses.senses.olfato}m`)
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
      className="pt-6 border-t border-white/10 mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-ecoar-teal" />
        <h3 className="text-base font-semibold text-white">
          Comparar com outras Raças
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
              className="relative p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-ecoar-teal/30 transition-all text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-white/60" />
                <h5 className="text-sm font-semibold text-white/90">
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
                        className={`text-xs px-1.5 py-0.5 rounded-full border ${
                          isDifferent
                            ? 'bg-ecoar-magenta/20 text-ecoar-magenta border-ecoar-magenta/30'
                            : 'bg-white/5 text-white/60 border-white/10'
                        }`}
                      >
                        {bonus}
                      </span>
                    )
                  })}
                  {otherBonuses.length > 2 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                      +{otherBonuses.length - 2}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/40 mt-2">Sem bônus especiais</p>
              )}
              
              {hasDifferentBonuses && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-ecoar-magenta rounded-full animate-pulse"></div>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
      <p className="text-xs text-white/50 mt-3 flex items-center gap-2">
        <Eye className="w-3 h-3" />
        <span>Bônus em rosa indicam diferenças em relação à raça selecionada</span>
      </p>
    </motion.div>
  )
}

// Componente de Seleção de Nível de Alma Inicial
function SoulLevelSelectionStep({
  nivelAlmaInicial,
  onSelect,
  variant = 'dark',
}: {
  nivelAlmaInicial: number
  onSelect: (nivel: number) => void
  variant?: 'light' | 'dark'
}) {
  const isLight = variant === 'light'
  const textColor = isLight ? 'text-ecoar-dark' : 'text-white'
  const textColorMuted = isLight ? 'text-ecoar-dark/70' : 'text-white/70'
  const textColorSubtle = isLight ? 'text-ecoar-dark/60' : 'text-white/60'
  const bgCard = isLight ? 'bg-white border-ecoar-teal/20' : 'bg-ecoar-teal/10 border-ecoar-teal/30'
  const bgIcon = isLight ? 'bg-ecoar-teal/10' : 'bg-ecoar-teal/20'
  const bgSelected = isLight ? 'bg-ecoar-teal/10 border-ecoar-teal' : 'bg-ecoar-teal/20 border-ecoar-teal'
  const bgUnselected = isLight ? 'bg-white border-ecoar-dark/10' : 'bg-white/5 border-white/10'
  const bgInfo = isLight ? 'bg-ecoar-teal/5 border-ecoar-teal/20' : 'bg-white/5 border-white/10'
  const selectedSoulLevel = getSoulLevelByNivel(nivelAlmaInicial)
  const estagios = getEstagios()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-12 h-12 ${bgIcon} rounded-xl flex items-center justify-center`}>
            <Crown className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className={`text-2xl font-semibold ${textColor} mb-1`}>
              Nível de Alma Inicial
            </h3>
            <p className={`text-sm ${textColorMuted}`}>
              Escolha o Nível de Alma inicial do seu personagem. Esta escolha deve ser feita pelo Mestre Absoluto.
            </p>
          </div>
        </div>
      </div>

      {/* Informação sobre o nível selecionado */}
      {selectedSoulLevel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${bgCard} border rounded-xl p-6 mb-6`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${bgIcon} rounded-lg flex items-center justify-center`}>
                <Star className="w-5 h-5 text-ecoar-teal" />
              </div>
              <div>
                <p className={`text-xs ${textColorSubtle} uppercase tracking-wider`}>Nível de Alma</p>
                <p className={`text-lg font-bold ${textColor}`}>{selectedSoulLevel.nivel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${bgIcon} rounded-lg flex items-center justify-center`}>
                <Sparkles className="w-5 h-5 text-ecoar-teal" />
              </div>
              <div>
                <p className={`text-xs ${textColorSubtle} uppercase tracking-wider`}>Pontos de Evolução</p>
                <p className={`text-lg font-bold ${textColor}`}>{selectedSoulLevel.pontosEvolucao}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${bgIcon} rounded-lg flex items-center justify-center`}>
                <Zap className="w-5 h-5 text-ecoar-teal" />
              </div>
              <div>
                <p className={`text-xs ${textColorSubtle} uppercase tracking-wider`}>Nível de Poder</p>
                <p className={`text-lg font-bold ${textColor}`}>{selectedSoulLevel.nivelPoder}</p>
              </div>
            </div>
          </div>
          <div className={`mt-4 pt-4 border-t ${isLight ? 'border-ecoar-teal/20' : 'border-ecoar-teal/20'}`}>
            <p className={`text-sm font-semibold ${textColor} mb-2`}>{selectedSoulLevel.estagio}</p>
            {selectedSoulLevel.nivel > 1 && (
              <div className="space-y-2 mt-3">
                <p className={`text-xs ${textColorMuted}`}>
                  Você receberá <span className="font-bold text-ecoar-teal">{selectedSoulLevel.pontosEvolucao} Pontos de Evolução</span> para usar na criação do personagem.
                </p>
                <p className={`text-xs ${textColorMuted}`}>
                  Bônus em dinheiro: <span className="font-bold text-ecoar-teal">ȼ{selectedSoulLevel.pontosEvolucao * 50}</span> ({selectedSoulLevel.pontosEvolucao} × ȼ50)
                </p>
              </div>
            )}
            {selectedSoulLevel.nivel === 1 && (
              <p className={`text-xs ${textColorMuted} mt-2`}>
                Recomendado para jogadores iniciantes. Comece do zero e evolua junto com o grupo.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Seleção por Estágio */}
      <div className="space-y-6">
        {estagios.map((estagio, estagioIndex) => {
          const niveisDoEstagio = soulLevels.filter(sl => sl.estagio === estagio)
          const nivelPoder = niveisDoEstagio[0]?.nivelPoder || 0

          return (
            <div key={estagio} className="space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <h4 className={`text-lg font-semibold ${textColor}`}>{estagio}</h4>
                <span className="text-xs px-2 py-1 bg-ecoar-teal/20 text-ecoar-teal rounded-full border border-ecoar-teal/30">
                  Nível de Poder {nivelPoder}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {niveisDoEstagio.map((soulLevel) => {
                  const isSelected = nivelAlmaInicial === soulLevel.nivel
                  return (
                    <motion.button
                      key={soulLevel.nivel}
                      onClick={() => onSelect(soulLevel.nivel)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? `${bgSelected} shadow-lg shadow-ecoar-teal/20`
                          : `${bgUnselected} ${isLight ? 'hover:bg-ecoar-teal/5' : 'hover:bg-white/10'} hover:border-ecoar-teal/30`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-lg font-bold ${isSelected ? textColor : textColorMuted}`}>
                          Nível {soulLevel.nivel}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-ecoar-teal" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className={`text-xs ${textColorMuted}`}>
                          {soulLevel.pontosEvolucao} PE
                        </p>
                        {soulLevel.nivel > 1 && (
                          <p className="text-xs text-ecoar-teal">
                            +ȼ{soulLevel.pontosEvolucao * 50}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota informativa */}
      <div className={`mt-6 p-4 ${bgInfo} border rounded-lg`}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-ecoar-teal flex-shrink-0 mt-0.5" />
          <div className={`text-xs ${textColorMuted} space-y-1`}>
            <p>
              <strong className={textColor}>Por padrão:</strong> É recomendado para jogadores iniciantes ou casuais que os personagens comecem no início (Nível de Alma 1) e que todos aprendam juntos, evoluindo de forma conjunta.
            </p>
            <p>
              <strong className={textColor}>Nível acima de 1:</strong> Caso seu Nível de Alma inicial seja acima de 1, você pode usar estes Pontos de Evolução durante a criação de personagem para adquirir singularidades ou evoluir traços, e deverão ser gastos conforme as regras de evolução vistas mais para frente. Para cada Ponto de Evolução inicial, você também recebe ȼ50 extras.
            </p>
          </div>
        </div>
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
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Route className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              Escolha sua Trilha
            </h3>
            <p className="text-sm text-white/70">
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
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'bg-ecoar-teal/10 border-ecoar-teal shadow-lg shadow-ecoar-teal/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-ecoar-teal/30'
              }`}
            >
              {/* Ícone e Título */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-ecoar-teal/20 text-ecoar-teal'
                    : 'bg-white/5 text-white/60'
                }`}>
                  <Route className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm ${
                    isSelected ? 'text-white' : 'text-white/90'
                  }`}>
                    {path.name}
                  </h4>
                  <span className={`text-xs ${
                    path.type === 'caçador'
                      ? 'text-ecoar-teal'
                      : 'text-ecoar-magenta'
                  }`}>
                    {path.type === 'caçador' ? '⚔️ Caçador' : '💀 Corrompido'}
                  </span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-ecoar-teal" />
                  </motion.div>
                )}
              </div>

              {/* Descrição */}
              <p className={`text-xs leading-relaxed ${
                isSelected ? 'text-white/80' : 'text-white/60'
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
      const classBonus = classBonuses[attr] || 0
      return sum + Math.max(0, val - (raceBonus + martialSchoolBonus + classBonus))
    }, 0)
    const pointsOverFree = Math.max(0, totalBasePoints - 12)
    return pointsOverFree * 10
  })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              {isEvolutionStep ? 'Evoluir Atributos' : 'Atributos'}
            </h3>
            <p className="text-sm text-white/70">
              Você tem 12 pontos gratuitos para distribuir
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-xl border transition-all ${
          attributePoints >= 0 
            ? 'bg-ecoar-teal/10 border-ecoar-teal/30 text-white' 
            : 'bg-ecoar-magenta/10 border-ecoar-magenta/30 text-white'
        }`}>
          <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Pontos Gratuitos</div>
          <div className={`text-2xl font-bold ${attributePoints >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
            {attributePoints}
          </div>
        </div>
        <motion.button
          onClick={onRandomize}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-xl border bg-gradient-to-r from-ecoar-teal to-ecoar-magenta hover:from-ecoar-teal/90 hover:to-ecoar-magenta/90 border-ecoar-teal/30 text-white flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-ecoar-teal/20"
        >
          <RefreshCw className="w-5 h-5" />
          Aleatório
        </motion.button>
      </div>

      {/* Bônus Aplicados */}
              {(Object.keys(raceBonuses).length > 0 || Object.keys(martialSchoolBonuses).length > 0) && (
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-3">Bônus aplicados automaticamente</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.keys(raceBonuses).length > 0 && (
              <div className="text-white/80">
                <span className="font-semibold text-ecoar-magenta">Raça:</span> {Object.entries(raceBonuses).map(([attr, bonus]) => (
                  <span key={attr} className="ml-2 text-white/70">
                    {attributeLabels[attr]}: <span className="text-ecoar-teal">+{bonus}</span>
                  </span>
                ))}
              </div>
            )}
            {Object.keys(martialSchoolBonuses).length > 0 && (
              <div className="text-white/80">
                <span className="font-semibold text-ecoar-teal">Escola Marcial:</span> {Object.entries(martialSchoolBonuses).map(([attr, bonus]) => (
                  <span key={attr} className="ml-2 text-white/70">
                    {attributeLabels[attr]}: <span className="text-ecoar-teal">+{bonus}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid de Atributos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(attributes).map((attr) => {
          const value = attributes[attr]
          const modifier = getAttributeModifier(value)
          const raceBonus = raceBonuses[attr] || 0
          const martialSchoolBonus = martialSchoolBonuses[attr] || 0
          const totalBonus = raceBonus + martialSchoolBonus
          const baseValue = value - totalBonus
          const AttributeIcon = attributeIcons[attr] || Star
          const hasBonus = totalBonus > 0
          
          return (
            <motion.div
              key={attr}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="relative p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-ecoar-teal/30 transition-all"
            >
              {/* Header do Card */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ecoar-teal/20 rounded-lg flex items-center justify-center border border-ecoar-teal/30">
                    <AttributeIcon className="w-5 h-5 text-ecoar-teal" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{attributeLabels[attr]}</div>
                    {hasBonus && (
                      <div className="text-xs text-white/60">
                        Base: {baseValue} + {totalBonus}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-ecoar-teal">{modifier >= 0 ? '+' : ''}{modifier}</div>
                  <div className="text-xs text-white/50">Modificador</div>
                </div>
              </div>

              {/* Bônus Detalhados */}
              {hasBonus && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10 space-y-1.5">
                  {raceBonus !== 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">Bônus da Raça</span>
                      <span className="text-ecoar-magenta font-semibold">+{raceBonus}</span>
                    </div>
                  )}
                  {martialSchoolBonus !== 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">Bônus da Escola Marcial</span>
                      <span className="text-ecoar-teal font-semibold">+{martialSchoolBonus}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Controles */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => onUpdate(attr, value - 1)}
                  disabled={baseValue === 0}
                  whileHover={{ scale: baseValue === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-ecoar-magenta/20 hover:border-ecoar-magenta/30 text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  -
                </motion.button>
                
                <div className="flex-1 text-center">
                  <div className="text-4xl font-bold text-white mb-1">{value}</div>
                  <div className="text-xs text-white/60">Total</div>
                  {baseValue > 0 && (
                    <div className="text-xs text-ecoar-teal/70 mt-1">
                      {baseValue * 10} PC
                    </div>
                  )}
                </div>
                
                <motion.button
                  onClick={() => {
                    const newValue = value + 1
                    const maxValue = (isEvolutionStep ? 8 : 3) + totalBonus
                    if (newValue <= maxValue) {
                      onUpdate(attr, newValue)
                    }
                  }}
                  disabled={
                    (() => {
                      const maxValue = (isEvolutionStep ? 8 : 3) + totalBonus
                      if (value >= maxValue) return true
                      // Só pode aumentar se tiver pontos gratuitos (não permite gastar PC)
                      return attributePoints === 0
                    })()
                  }
                  whileHover={{ scale: (value >= ((isEvolutionStep ? 8 : 3) + totalBonus) || (attributePoints === 0 && pontosCriacao.disponiveis < 10)) ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-ecoar-teal/20 hover:border-ecoar-teal/30 text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
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

function EquipmentStep({
  equipamentos,
  armas,
  onEquipamentosChange,
  onArmasChange,
  dinheiroExtra = 0,
}: {
  equipamentos: string[]
  armas: string[]
  onEquipamentosChange: (items: string[]) => void
  onArmasChange: (items: string[]) => void
  dinheiroExtra?: number
}) {
  const [newEquipamento, setNewEquipamento] = useState('')
  const [newArma, setNewArma] = useState('')

  const addEquipamento = () => {
    if (newEquipamento.trim()) {
      onEquipamentosChange([...equipamentos, newEquipamento.trim()])
      setNewEquipamento('')
    }
  }

  const removeEquipamento = (index: number) => {
    onEquipamentosChange(equipamentos.filter((_, i) => i !== index))
  }

  const addArma = () => {
    if (newArma.trim()) {
      onArmasChange([...armas, newArma.trim()])
      setNewArma('')
    }
  }

  const removeArma = (index: number) => {
    onArmasChange(armas.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              Equipamentos & Armas
            </h3>
            <p className="text-sm text-white/70">Adicione seus equipamentos e armas</p>
            {dinheiroExtra > 0 && (
              <div className="mt-3 inline-block p-3 bg-ecoar-teal/10 border border-ecoar-teal/30 rounded-lg">
                <p className="text-xs text-white">
                  <span className="font-semibold text-ecoar-teal">Dinheiro Extra:</span> ȼ{dinheiroExtra}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sword className="w-5 h-5 text-ecoar-teal" />
            <h4 className="text-lg font-semibold text-white">Equipamentos</h4>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEquipamento}
              onChange={(e) => setNewEquipamento(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEquipamento()}
              placeholder="Adicionar equipamento..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-ecoar-teal focus:border-ecoar-teal"
            />
            <motion.button
              onClick={addEquipamento}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-ecoar-teal to-ecoar-magenta hover:from-ecoar-teal/90 hover:to-ecoar-magenta/90 text-white rounded-lg font-semibold transition-all shadow-lg shadow-ecoar-teal/20 border border-ecoar-teal/30"
            >
              +
            </motion.button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {equipamentos.length === 0 ? (
              <div className="text-white/40 text-center py-8 text-sm">Nenhum equipamento adicionado</div>
            ) : (
              equipamentos.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-ecoar-teal/30 transition-all"
                >
                  <span className="text-white text-sm">{item}</span>
                  <button
                    onClick={() => removeEquipamento(index)}
                    className="text-white/60 hover:text-ecoar-magenta px-2 transition-colors"
                  >
                    ✕
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Weapons Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sword className="w-5 h-5 text-ecoar-magenta" />
            <h4 className="text-lg font-semibold text-white">Armas</h4>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newArma}
              onChange={(e) => setNewArma(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addArma()}
              placeholder="Adicionar arma..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-ecoar-magenta focus:border-ecoar-magenta"
            />
            <motion.button
              onClick={addArma}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-ecoar-teal to-ecoar-magenta hover:from-ecoar-teal/90 hover:to-ecoar-magenta/90 text-white rounded-lg font-semibold transition-all shadow-lg shadow-ecoar-magenta/20 border border-ecoar-magenta/30"
            >
              +
            </motion.button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {armas.length === 0 ? (
              <div className="text-white/40 text-center py-8 text-sm">Nenhuma arma adicionada</div>
            ) : (
              armas.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-ecoar-magenta/30 transition-all"
                >
                  <span className="text-white text-sm">{item}</span>
                  <button
                    onClick={() => removeArma(index)}
                    className="text-white/60 hover:text-ecoar-magenta px-2 transition-colors"
                  >
                    ✕
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              Escolha sua Localização
            </h3>
            <p className="text-sm text-white/70">Selecione a localização de origem do seu personagem</p>
          </div>
        </div>
      </div>

      {/* Grid de Cards Compactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {locations.map((location, index) => {
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
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-ecoar-teal/30'
              }`}
            >
              {/* Ícone e Título */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-ecoar-teal/20 text-ecoar-teal'
                    : 'bg-white/5 text-white/60'
                }`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm ${
                    isSelected ? 'text-white' : 'text-white/90'
                  }`}>
                    {location.name}
                  </h4>
                  {location.region && (
                    <span className="text-xs text-white/60">{location.region}</span>
                  )}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-ecoar-teal" />
                  </motion.div>
                )}
              </div>

              {/* Descrição */}
              {location.description && (
                <p className={`text-xs leading-relaxed ${
                  isSelected ? 'text-white/80' : 'text-white/60'
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

  return (
    <div className="space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              {isEvolutionStep ? 'Evoluir Habilidades' : 'Habilidades e Especialidades'}
            </h3>
            <p className="text-sm text-white/70">
              Você tem 48 pontos gratuitos para distribuir. Combate/Primárias custam 2 pontos, resto custa 1 ponto por nível. Especialidade custa o mesmo que um nível.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-xl border transition-all ${
          skillPoints >= 0 
            ? 'bg-ecoar-teal/10 border-ecoar-teal/30 text-white' 
            : 'bg-ecoar-magenta/10 border-ecoar-magenta/30 text-white'
        }`}>
          <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Pontos Gratuitos</div>
          <div className={`text-2xl font-bold ${skillPoints >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
            {skillPoints}
          </div>
        </div>
      </div>

      {categories.map((category) => {
        const categorySkills = getSkillsByCategory(category)
        return (
          <div key={category} className="space-y-4">
            <h4 className="text-lg font-semibold text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Sword className="w-4 h-4 text-ecoar-teal" />
              {categoryLabels[category]}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categorySkills.map((skill) => {
                const skillData = skills[skill.id] || { level: 0, specialization: undefined }
                const freeCostPerLevel = getSkillFreeCost(category)
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
                  const pcCostPerLevel = getSkillPCCost(category)
                  const pcCost = pointsOverFree * (pcCostPerLevel / freeCostPerLevel)
                  canIncrease = pontosCriacao.disponiveis >= pcCost && skillData.level < maxLevel
                }
                
                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-ecoar-teal/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white mb-1">{skill.name}</div>
                        <div className="text-xs text-white/60 mb-1">
                          {getSkillDice(skillData.level)} • Nível {skillData.level}
                        </div>
                        <div className="text-xs text-ecoar-teal/70 font-semibold">
                          {freeCostPerLevel} ponto{freeCostPerLevel > 1 ? 's' : ''} por nível
                        </div>
                        {skillData.specialization && (
                          <div className="text-xs text-ecoar-magenta/70 mt-1">
                            Especialidade: +{freeCostPerLevel} ponto{freeCostPerLevel > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => updateSkill(skill.id, Math.max(0, skillData.level - 1), skillData.specialization)}
                          disabled={skillData.level === 0}
                          whileHover={{ scale: skillData.level === 0 ? 1 : 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-ecoar-magenta/20 hover:border-ecoar-magenta/30 text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                        >
                          -
                        </motion.button>
                        <div className="w-12 text-center">
                          <div className="text-2xl font-bold text-white">
                            {skillData.level}
                          </div>
                          <div className="text-xs text-white/50 font-mono">
                            {currentCost} pts
                          </div>
                        </div>
                        <motion.button
                          onClick={() => updateSkill(skill.id, skillData.level + 1, skillData.specialization)}
                          disabled={!canIncrease}
                          whileHover={{ scale: !canIncrease ? 1 : 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-ecoar-teal/20 hover:border-ecoar-teal/30 text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                        >
                          +
                        </motion.button>
                      </div>
                    </div>
                    {skill.specializations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <label className="text-white/70 text-xs mb-2 block font-semibold">
                          Especialidade <span className="text-ecoar-teal/70">(+{freeCostPerLevel} ponto{freeCostPerLevel > 1 ? 's' : ''})</span>:
                        </label>
                        <select
                          value={skillData.specialization || ''}
                          onChange={(e) => {
                            updateSkill(skill.id, skillData.level, e.target.value || undefined)
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-ecoar-teal focus:border-ecoar-teal"
                        >
                          <option value="">Nenhuma</option>
                          {skill.specializations.map((spec) => (
                            <option key={spec.id} value={spec.id} className="bg-ecoar-dark">
                              {spec.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
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
    
    if (level < 0 || level > maxLevel) return
    
    // Calcula o total de pontos usados antes e depois
    const currentTotal = calculateFreePointsUsed()
    const newTotal = currentTotal - currentLevel + level
    
    // Se está dentro dos 3 pontos gratuitos
    if (newTotal <= 3) {
      if (aptitudePoints + (currentLevel - level) >= 0) {
        onAptitudesChange({
          ...aptitudes,
          [aptitudeId]: level,
        })
        onAptitudePointsChange(3 - newTotal)
      }
    }
    // Se vai além dos 3 pontos gratuitos, precisa de PC (20 PC por ponto)
    else {
      const pointsOverFreeDiff = Math.max(0, newTotal - 3) - Math.max(0, currentTotal - 3)
      const costInPC = pointsOverFreeDiff * 20
      
      if (costInPC > 0) {
        // Está aumentando além dos gratuitos
        if (pontosCriacao.disponiveis >= costInPC) {
          onAptitudesChange({
            ...aptitudes,
            [aptitudeId]: level,
          })
          onAptitudePointsChange(0) // Já gastou todos os pontos gratuitos
          onPointsChange(pontosCriacao.gastos + costInPC)
        }
      } else {
        // Está diminuindo, libera PC
        const refundPC = Math.abs(costInPC)
        const newFreeUsed = Math.min(3, newTotal)
        onAptitudesChange({
          ...aptitudes,
          [aptitudeId]: level,
        })
        onAptitudePointsChange(3 - newFreeUsed)
        onPointsChange(Math.max(0, pontosCriacao.gastos - refundPC))
      }
    }
  }

  return (
    <div className="space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              {isEvolutionStep ? 'Evoluir Aptidões' : 'Aptidões'}
            </h3>
            <p className="text-sm text-white/70">
              Você tem 3 pontos gratuitos para distribuir
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-xl border transition-all ${
          aptitudePoints >= 0 
            ? 'bg-ecoar-teal/10 border-ecoar-teal/30 text-white' 
            : 'bg-ecoar-magenta/10 border-ecoar-magenta/30 text-white'
        }`}>
          <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Pontos Gratuitos</div>
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
          const canIncrease = level < maxLevel && (
            (aptitudePoints > 0 && totalPointsUsed < 3) || 
            (totalPointsUsed >= 3 && pontosCriacao.disponiveis >= 20)
          )
          
          return (
            <motion.div
              key={aptitude.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-ecoar-teal/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white mb-1">{aptitude.name}</div>
                  <p className="text-xs text-white/60 mb-2 leading-relaxed">{aptitude.description}</p>
                  <div className="text-xs text-white/50 mb-1">
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
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-ecoar-magenta/20 hover:border-ecoar-magenta/30 text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  -
                </motion.button>
                <div className="flex-1 text-center">
                  <div className="text-4xl font-bold text-white mb-1">{level}</div>
                  <div className="text-xs text-white/60">Nível</div>
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
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-ecoar-teal/20 hover:border-ecoar-teal/30 text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
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
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              Evolução do Personagem
            </h3>
            <p className="text-sm text-white/70">
              Você começou com Nível de Alma {nivelAlmaInicial}. Use seus {pontosEvolucao} Pontos de Evolução para adquirir singularidades ou evoluir traços.
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-ecoar-teal flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/70 space-y-2">
            <p>
              <strong className="text-white">Pontos de Evolução:</strong> Você possui {pontosEvolucao} Pontos de Evolução que podem ser gastos para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Evoluir Atributos (máximo nível 8)</li>
              <li>Evoluir Habilidades (máximo nível 8)</li>
              <li>Evoluir Aptidões (máximo nível 8)</li>
              <li>Adquirir Singularidades</li>
            </ul>
            <p className="mt-3">
              <strong className="text-white">Nota:</strong> Os Pontos de Evolução são convertidos em Pontos de Criação (PC) na proporção de 1 PE = 10 PC. Você pode gastá-los nos steps anteriores ou guardá-los para usar durante o jogo.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="p-6 rounded-xl border bg-ecoar-teal/10 border-ecoar-teal/30">
        <div className="text-xs text-white/60 uppercase tracking-wider mb-2">Pontos de Evolução Disponíveis</div>
        <div className="text-3xl font-bold text-ecoar-teal">{pontosEvolucao}</div>
        <div className="text-xs text-white/60 mt-2">
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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-white mb-2 font-serif">Características Físicas</h3>
        <p className="text-white/70">Defina tamanho, peso, deslocamento e sentidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tamanho */}
        <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40">
          <label className="block text-white font-semibold mb-2">Tamanho</label>
          <select
            value={tamanho}
            onChange={(e) => onTamanhoChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
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
        <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40">
          <label className="block text-white font-semibold mb-2">Peso</label>
          <select
            value={peso}
            onChange={(e) => onPesoChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
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
        <h4 className="text-xl font-bold text-white mb-4">Deslocamento (em metros)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Terrestre</label>
            <input
              type="number"
              value={deslocamento.terrestre}
              onChange={(e) => onDeslocamentoChange({ ...deslocamento, terrestre: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Aquático</label>
            <input
              type="number"
              value={deslocamento.aquatico}
              onChange={(e) => onDeslocamentoChange({ ...deslocamento, aquatico: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Aéreo</label>
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
        <h4 className="text-xl font-bold text-white mb-4">Sentidos (em metros)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Visão</label>
            <input
              type="number"
              value={sentidos.visao}
              onChange={(e) => onSentidosChange({ ...sentidos, visao: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Audição</label>
            <input
              type="number"
              value={sentidos.audicao}
              onChange={(e) => onSentidosChange({ ...sentidos, audicao: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Olfato</label>
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

// Gastando PC (Singularidades) Step
function SingularitiesSpendingStep({
  singularidades,
  selectedEcoar,
  singularidadesEcoar,
  pontosDisponiveis,
  onSingularidadesChange,
  onEcoarSelect,
  onSingularidadesEcoarChange,
  onPointsChange,
}: {
  singularidades: string[]
  selectedEcoar: string
  singularidadesEcoar: string[]
  pontosDisponiveis: number
  onSingularidadesChange: (singularidades: string[]) => void
  onEcoarSelect: (id: string) => void
  onSingularidadesEcoarChange: (singularidades: string[]) => void
  onPointsChange: (gastos: number) => void
}) {
  const [activeTab, setActiveTab] = useState<'criacao' | 'trilha' | 'ecoa'>('criacao')

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
      onSingularidadesChange(singularidades.filter(s => s !== id))
      onPointsChange(pontosDisponiveis + cost)
    } else {
      // Verifica requisitos (não pode ter desvantagens/singularidades conflitantes)
      if (isCreation && 'requirements' in singularity && singularity.requirements) {
        const hasConflict = singularity.requirements.some((req: string) => singularidades.includes(req))
        if (hasConflict) return
      }
      
      if (pontosDisponiveis >= cost) {
        onSingularidadesChange([...singularidades, id])
        onPointsChange(pontosDisponiveis - cost)
      }
    }
  }

  // Singularidades de Criação (vantagens)
  const criacaoSingularities = creationSingularities

  // Singularidades de Trilha (placeholder - pode ser expandido)
  const trilhaSingularities: Singularity[] = []

  return (
    <div className="space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              Gastando Pontos de Criação (Singularidades)
            </h3>
            <p className="text-sm text-white/70">
              Escolha singularidades para seu personagem
            </p>
          </div>
        </div>
        <div className={`mt-4 text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
          PC Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(['criacao', 'trilha', 'ecoa'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            {tab === 'criacao' && 'Singularidades de Criação'}
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
                  <h5 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                    {categoryLabels[category]}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorySingularities.map((singularity) => {
                      const isSelected = singularidades.includes(singularity.id)
                      const canAfford = pontosDisponiveis >= singularity.cost
                      const hasConflict = singularity.requirements?.some(req => singularidades.includes(req)) || false
                      const canSelect = canAfford && !hasConflict
                      
                      return (
                        <motion.button
                          key={singularity.id}
                          onClick={() => toggleSingularity(singularity.id, true)}
                          disabled={!isSelected && !canSelect}
                          whileHover={{ scale: !isSelected && canSelect ? 1.02 : 1 }}
                          className={`p-5 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-ecoar-teal bg-ecoar-teal/20 shadow-lg shadow-ecoar-teal/30'
                              : canSelect
                              ? 'border-white/10 bg-white/5 hover:border-ecoar-teal/50 hover:bg-white/10'
                              : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-white font-bold text-lg">{singularity.name}</div>
                            <div className="text-ecoar-magenta font-semibold">{singularity.cost} PC</div>
                          </div>
                          <p className="text-white/70 text-sm mb-2">{singularity.description}</p>
                          {singularity.requirements && singularity.requirements.length > 0 && (
                            <div className="text-xs text-white/60 mt-2">
                              <span className="font-medium">Não pode possuir:</span> {singularity.requirements.map(req => {
                                const dis = getDisadvantageById(req)
                                const sing = getSingularityById(req) || getCreationSingularityById(req)
                                return dis?.name || sing?.name || req
                              }).join(', ')}
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'trilha' && (
          <div className="text-center py-12 text-white/60">
            <p>Singularidades de Trilha serão adicionadas em breve</p>
          </div>
        )}

        {activeTab === 'ecoa' && (
          <EcoarSelection
            selectedEcoar={selectedEcoar}
            singularidadesEcoar={singularidadesEcoar}
            onEcoarSelect={onEcoarSelect}
            onSingularidadesEcoarChange={onSingularidadesEcoarChange}
          />
        )}
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
}: {
  selectedEcoar: string
  singularidadesEcoar: string[]
  onEcoarSelect: (id: string) => void
  onSingularidadesEcoarChange: (singularidades: string[]) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-semibold text-white mb-4">Tipo de Ecoar</h4>
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
                  : 'border-white/10 bg-white/5 hover:border-ecoar-teal/50 hover:bg-white/10'
              }`}
            >
              <div className="text-white font-bold text-lg">{ecoa.name}</div>
              <p className="text-white/70 text-sm mt-2">{ecoa.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedEcoar && (
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Singularidades do Ecoar</h4>
          <p className="text-white/60 text-sm mb-4">Selecione singularidades específicas do seu Ecoar</p>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/60 text-sm">Funcionalidade em desenvolvimento...</p>
          </div>
        </div>
      )}
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

  // Lógica para atualizar atributos com PC (10 PC por ponto além dos gratuitos)
  const updateAttributeWithPC = (attr: string, newTotalValue: number) => {
    const attrKey = attr as keyof typeof attributes
    const oldValue = attributes[attrKey]
    const raceBonus = raceBonuses[attr] || 0
    const martialSchoolBonus = martialSchoolBonuses[attr] || 0
    const totalBonus = raceBonus + martialSchoolBonus
    
    const maxTotalValue = 3 + totalBonus
    const newValue = Math.max(0, Math.min(maxTotalValue, newTotalValue))
    
    if (newValue === oldValue) return
    
    const oldBaseValue = Math.max(0, oldValue - totalBonus)
    const newBaseValue = Math.max(0, newValue - totalBonus)
    
    // Se está aumentando além dos 12 pontos gratuitos, precisa de PC
    if (newBaseValue > 12) {
      const pointsOverFree = newBaseValue - 12
      const oldPointsOverFree = Math.max(0, oldBaseValue - 12)
      const pointsOverFreeDiff = pointsOverFree - oldPointsOverFree
      const costInPC = pointsOverFreeDiff * 10
      
      if (costInPC > 0 && pontosDisponiveis >= costInPC) {
        onAttributesChange({ ...attributes, [attr]: newValue })
        onPointsChange(pontosDisponiveis - costInPC)
      } else if (costInPC < 0) {
        // Diminuindo, libera PC
        const refundPC = Math.abs(costInPC)
        onAttributesChange({ ...attributes, [attr]: newValue })
        onPointsChange(pontosDisponiveis + refundPC)
      }
    } else {
      // Dentro dos 12 pontos gratuitos - não deve chegar aqui nesta etapa
      onAttributesChange({ ...attributes, [attr]: newValue })
    }
  }

  return (
    <div className="space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-ecoar-teal/20 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-ecoar-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">
              Gastando Pontos de Criação (Traços)
            </h3>
            <p className="text-sm text-white/70">
              Use PC para evoluir atributos, habilidades e aptidões
            </p>
          </div>
        </div>
        <div className={`mt-4 text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-ecoar-magenta'}`}>
          PC Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(['atributos', 'habilidades', 'aptidoes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                : 'text-white/60 hover:text-white/80'
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
            pontosCriacao={{ obtidos: 0, gastos: 0, disponiveis: pontosDisponiveis }}
            onUpdate={updateAttributeWithPC}
            raceBonuses={raceBonuses}
            martialSchoolBonuses={martialSchoolBonuses}
            classBonuses={{}}
            onRandomize={() => {}}
            onPointsChange={(gastos) => onPointsChange(pontosDisponiveis - gastos)}
            isEvolutionStep={false}
          />
        )}

        {activeTab === 'habilidades' && (
          <div className="text-center py-12 text-white/60">
            <p>Funcionalidade de gastar PC em habilidades em desenvolvimento</p>
          </div>
        )}

        {activeTab === 'aptidoes' && (
          <AptitudesStep
            aptitudes={aptitudes}
            pontosCriacao={{ obtidos: 0, gastos: 0, disponiveis: pontosDisponiveis }}
            onAptitudesChange={onAptitudesChange}
            onPointsChange={(gastos) => onPointsChange(pontosDisponiveis - gastos)}
            aptitudePoints={0}
            onAptitudePointsChange={() => {}}
            isEvolutionStep={false}
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
    <div className="space-y-8 max-h-[700px] overflow-y-auto">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-white mb-2 font-serif">Singularidades</h3>
        <p className="text-white/70">Escolha singularidades para seu personagem</p>
        <div className={`mt-2 text-lg font-semibold ${pontosDisponiveis >= 0 ? 'text-ecoar-teal' : 'text-red-400'}`}>
          Pontos Disponíveis: {pontosDisponiveis}
        </div>
      </div>

      {categories.map((category) => {
        const categorySingularities = getSingularitiesByCategory(category)
        if (categorySingularities.length === 0) return null

        return (
          <div key={category} className="space-y-4">
            <h4 className="text-2xl font-bold text-white border-b border-ecoar-dark/50 pb-2">
              {categoryLabels[category]}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorySingularities.map((singularity) => {
                const isSelected = singularidades.includes(singularity.id)
                const canAfford = pontosDisponiveis >= singularity.cost
                return (
                  <button
                    key={singularity.id}
                    onClick={() => toggleSingularity(singularity.id)}
                    disabled={!isSelected && !canAfford}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-900/40 shadow-lg shadow-purple-900/60'
                        : canAfford
                        ? 'border-gray-700/50 bg-gray-900/30 hover:border-ecoar-teal/50 hover:bg-gray-800/40'
                        : 'border-gray-700/30 bg-gray-900/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-white font-bold text-lg">{singularity.name}</div>
                      <div className="text-ecoar-magenta/80 font-semibold">{singularity.cost} PC</div>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{singularity.description}</p>
                    {singularity.requirements && singularity.requirements.length > 0 && (
                      <div className="text-ecoar-magenta/60 text-xs">
                        Requisitos: {singularity.requirements.join(', ')}
                      </div>
                    )}
                  </button>
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
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-white mb-2 font-serif">Ecoar</h3>
        <p className="text-white/70">Selecione seu Ecoar e suas singularidades</p>
      </div>

      {/* Ecoar Selection */}
      <div>
        <h4 className="text-2xl font-bold text-white mb-4">Tipo de Ecoar</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecoaTypes.map((ecoa) => (
            <button
              key={ecoa.id}
              onClick={() => onEcoarSelect(ecoa.id)}
              className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${
                selectedEcoar === ecoa.id
                  ? 'border-ecoar-teal bg-ecoar-teal/40 shadow-lg shadow-ecoar-teal/60 ring-2 ring-ecoar-teal/50'
                  : 'border-gray-700/50 bg-gray-900/30 hover:border-ecoar-teal/50 hover:bg-gray-800/40'
              }`}
            >
              <div className="text-white font-bold text-lg">{ecoa.name}</div>
              <p className="text-white/70 text-sm mt-2">{ecoa.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Ecoar Singularities - Placeholder */}
      {selectedEcoar && (
        <div>
          <h4 className="text-2xl font-bold text-white mb-4">Singularidades do Ecoar</h4>
          <p className="text-white/60 text-sm">Selecione singularidades específicas do seu Ecoar</p>
          <div className="mt-4 p-4 bg-gray-800/40 rounded-lg border border-ecoar-dark/50">
            <p className="text-white/60 text-sm">Funcionalidade em desenvolvimento...</p>
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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-white mb-2">Pontos de Criação</h3>
        <p className="text-sm text-white/70">Gerencie seus pontos de criação e escolha desvantagens opcionais para obter mais pontos</p>
      </div>

      {/* Informação sobre próximas etapas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-xl border border-ecoar-teal/30 bg-ecoar-teal/10 backdrop-blur-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-ecoar-teal/20 rounded-lg flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-ecoar-teal" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">O que vem a seguir?</h4>
            <p className="text-sm text-white/70 mb-4">
              A etapa a seguir será focada na obtenção de Pontos de Criação, os quais poderão ser gastos das seguintes formas:
            </p>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ecoar-teal mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-teal">Singularidades Marciais:</span>
                  <p className="text-white/70 mt-0.5">
                    Vantagens vinculadas às aptidões mágicas que concedem benefícios diversos para aumentar a efetividade dentro de um combate. Maestrias de combate concedem bônus de combate para categorias específicas de armas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ecoar-teal mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-teal">Singularidades de Criação:</span>
                  <p className="text-white/70 mt-0.5">
                    Vantagens que oferecem diferentes tipos de bônus. <span className="text-ecoar-magenta font-medium">Você não terá outra chance para adquirir Singularidades de Criação, já que elas só podem ser adquiridas durante esta etapa.</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ecoar-teal mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-teal">Ecoar:</span>
                  <p className="text-white/70 mt-0.5">
                    Vantagens do Ecoar que permitem retornar à vida após a morte.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ecoar-teal mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-teal">Talentos Raciais:</span>
                  <p className="text-white/70 mt-0.5">
                    Vantagens relacionadas à identidade da raça do personagem.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ecoar-teal mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-teal">Evoluindo Traços:</span>
                  <p className="text-white/70 mt-0.5">
                    Você terá chance de aumentar o nível dos atributos (10 PC por ponto), habilidades e aptidões (20 PC por ponto) que ainda não estejam em 3.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-4 pt-3 border-t border-white/10">
                <div className="w-2 h-2 rounded-full bg-ecoar-magenta mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold text-ecoar-magenta">Equipamentos:</span>
                  <p className="text-white/70 mt-0.5">
                    Cada Ponto de Criação não utilizado será automaticamente convertido em 100 moedas para compra de equipamentos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pontos Obtidos */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <label className="block text-white font-semibold mb-2 text-sm">Pontos Obtidos</label>
          <input
            type="number"
            value={basePoints}
            onChange={(e) => {
              const obtidos = parseInt(e.target.value) || 0
              onPointsChange({
                obtidos: obtidos + totalDisadvantagesPoints,
                gastos: pontosCriacao.gastos,
                disponiveis: obtidos + totalDisadvantagesPoints - pontosCriacao.gastos,
              })
            }}
            min="0"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ecoar-teal"
          />
          <p className="text-xs text-white/60 mt-2">
            Base: {basePoints} | Desvantagens: +{totalDisadvantagesPoints}
          </p>
        </div>

        {/* Pontos Gastos */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <label className="block text-white font-semibold mb-2 text-sm">Pontos Gastos</label>
          <input
            type="number"
            value={pontosCriacao.gastos}
            readOnly
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60"
          />
          <p className="text-white/60 text-xs mt-2">Calculado automaticamente</p>
        </div>

        {/* Pontos Disponíveis */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <label className="block text-white font-semibold mb-2 text-sm">Pontos Disponíveis</label>
          <input
            type="number"
            value={pontosCriacao.disponiveis}
            readOnly
            className={`w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg ${
              pontosCriacao.disponiveis < 0 ? 'text-ecoar-magenta' : 'text-ecoar-teal'
            }`}
          />
          <p className="text-white/60 text-xs mt-2">
            {pontosCriacao.disponiveis < 0 ? 'Você gastou mais pontos do que obteve!' : 'Disponíveis para uso'}
          </p>
        </div>
      </div>

      {/* Seleção de Desvantagens */}
      {onDisadvantagesChange && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-ecoar-teal" />
            <h4 className="text-lg font-semibold text-white">Desvantagens (Opcional)</h4>
          </div>
          <p className="text-sm text-white/70 mb-4">
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
                <h5 className="text-base font-semibold text-white border-b border-white/10 pb-2">
                  {categoryLabels[category]}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryDisadvantages.map((disadvantage) => {
                    const isSelected = selectedDisadvantages?.includes(disadvantage.id) || false
                    return (
                      <motion.button
                        key={disadvantage.id}
                        onClick={() => {
                          if (!onDisadvantagesChange) return
                          const newDisadvantages = isSelected
                            ? selectedDisadvantages?.filter(id => id !== disadvantage.id) || []
                            : [...(selectedDisadvantages || []), disadvantage.id]
                          onDisadvantagesChange(newDisadvantages)
                          
                          // Atualiza pontos obtidos
                          const newTotalDisadvantages = newDisadvantages.reduce((total, id) => {
                            const dis = getDisadvantageById(id)
                            return total + (dis?.pontosCriacao || 0)
                          }, 0)
                          onPointsChange({
                            obtidos: basePoints + newTotalDisadvantages,
                            gastos: pontosCriacao.gastos,
                            disponiveis: basePoints + newTotalDisadvantages - pontosCriacao.gastos,
                          })
                        }}
                        whileHover={{ y: -2 }}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'bg-ecoar-magenta/10 border-ecoar-magenta shadow-lg shadow-ecoar-magenta/20'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-ecoar-magenta/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-white/90'}`}>
                            {disadvantage.name}
                          </h5>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-ecoar-magenta" />
                          )}
                        </div>
                        <p className="text-xs text-white/70 mb-2">
                          {disadvantage.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-ecoar-magenta/20 text-ecoar-magenta rounded-full border border-ecoar-magenta/30">
                            +{disadvantage.pontosCriacao} PC
                          </span>
                        </div>
                      </motion.button>
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
  ideais,
  vinculos,
  defeitos,
  onNomeChange,
  onBackstoryChange,
  onTracoPositivoChange,
  onTracoNegativoChange,
  onPersonalidadeChange,
  onIdeaisChange,
  onVinculosChange,
  onDefeitosChange,
}: {
  nome: string
  backstory: string
  tracoPositivo: string
  tracoNegativo: string
  personalidade: string
  ideais: string
  vinculos: string
  defeitos: string
  onNomeChange: (value: string) => void
  onBackstoryChange: (value: string) => void
  onTracoPositivoChange: (value: string) => void
  onTracoNegativoChange: (value: string) => void
  onPersonalidadeChange: (value: string) => void
  onIdeaisChange: (value: string) => void
  onVinculosChange: (value: string) => void
  onDefeitosChange: (value: string) => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-white mb-2 font-serif">Background do Personagem</h3>
        <p className="text-white/70">Preencha as informações sobre seu personagem</p>
      </div>

      <div className="space-y-6">
        {/* Nome */}
        <div>
          <label className="block text-white font-semibold mb-2">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome do personagem"
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Backstory */}
        <div>
          <label className="block text-white font-semibold mb-2">História/Background</label>
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
          <label className="block text-white font-semibold mb-2">Personalidade</label>
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
            <label className="block text-white font-semibold mb-2">Traço Positivo</label>
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
            <label className="block text-white font-semibold mb-2">Traço Negativo</label>
            <input
              type="text"
              value={tracoNegativo}
              onChange={(e) => onTracoNegativoChange(e.target.value)}
              placeholder="Um traço negativo..."
              className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Ideais */}
        <div>
          <label className="block text-white font-semibold mb-2">Ideais</label>
          <textarea
            value={ideais}
            onChange={(e) => onIdeaisChange(e.target.value)}
            placeholder="O que seu personagem valoriza..."
            rows={2}
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </div>

        {/* Vinculos */}
        <div>
          <label className="block text-white font-semibold mb-2">Vínculos</label>
          <textarea
            value={vinculos}
            onChange={(e) => onVinculosChange(e.target.value)}
            placeholder="Pessoas ou lugares importantes para seu personagem..."
            rows={2}
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
        </div>

        {/* Defeitos */}
        <div>
          <label className="block text-white font-semibold mb-2">Defeitos</label>
          <textarea
            value={defeitos}
            onChange={(e) => onDefeitosChange(e.target.value)}
            placeholder="Fraquezas ou defeitos do personagem..."
            rows={2}
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
          />
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
  const selectedRace = data.raca ? getRaceById(data.raca) : null
  const selectedMartialSchool = data.escolaMarcial ? getMartialSchoolById(data.escolaMarcial) : null
  const selectedPath = data.trilha ? getPathById(data.trilha) : null
  const selectedLocation = data.localizacao ? getLocationById(data.localizacao) : null
  const selectedEcoar = data.ecoar ? getEcoarById(data.ecoar) : null

  return (
    <div className="space-y-8 max-h-[700px] overflow-y-auto">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-white mb-2 font-serif">Revisão Final</h3>
        <p className="text-white/70">Revise todas as escolhas do seu personagem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40">
          <h4 className="text-white font-bold text-lg mb-4">Informações Básicas</h4>
          <div className="space-y-2 text-sm">
            <div><span className="text-white/60">Nome:</span> <span className="text-white">{data.nome || 'Não definido'}</span></div>
            {selectedRace && <div><span className="text-white/60">Raça:</span> <span className="text-white">{selectedRace.name}</span></div>}
            {selectedMartialSchool && <div><span className="text-white/60">Escola Marcial:</span> <span className="text-white">{selectedMartialSchool.name}</span></div>}
            {selectedLocation && <div><span className="text-white/60">Localização:</span> <span className="text-white">{selectedLocation.name}</span></div>}
            {selectedPath && <div><span className="text-white/60">Trilha:</span> <span className="text-white">{selectedPath.name}</span></div>}
            {selectedEcoar && <div><span className="text-white/60">Ecoar:</span> <span className="text-white">{selectedEcoar.name}</span></div>}
          </div>
        </div>

        {/* Attributes Summary */}
        {data.attributes && (
          <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40">
            <h4 className="text-white font-bold text-lg mb-4">Atributos</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(data.attributes).map(([attr, value]) => (
                <div key={attr}>
                  <span className="text-white/60 capitalize">{attr}:</span> <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Summary */}
        {data.skills && Object.keys(data.skills).length > 0 && (
          <div className="md:col-span-2 p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40">
            <h4 className="text-white font-bold text-lg mb-4">Habilidades</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {Object.entries(data.skills).map(([skillId, skillData]) => {
                const skill = getSkillById(skillId)
                if (!skill || skillData.level === 0) return null
                return (
                  <div key={skillId}>
                    <span className="text-white/60">{skill.name}:</span> <span className="text-white font-semibold">{skillData.level}</span>
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
          <div className="md:col-span-2 p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40">
            <h4 className="text-white font-bold text-lg mb-4">Background</h4>
            <div className="space-y-3 text-sm">
              {data.backstory && <div><span className="text-white/60">História:</span> <span className="text-white">{data.backstory}</span></div>}
              {data.personalidade && <div><span className="text-white/60">Personalidade:</span> <span className="text-white">{data.personalidade}</span></div>}
              {data.ideais && <div><span className="text-white/60">Ideais:</span> <span className="text-white">{data.ideais}</span></div>}
              {data.vinculos && <div><span className="text-white/60">Vínculos:</span> <span className="text-white">{data.vinculos}</span></div>}
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

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-white mb-2 font-serif">Finalize seu Personagem</h3>
        <p className="text-white/70">Revise suas escolhas e dê um nome ao seu personagem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Character Name */}
        <div className="md:col-span-2">
          <label className="block text-white font-semibold mb-2">Nome do Personagem</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Digite o nome..."
            className="w-full px-4 py-3 bg-gray-900/60 border border-ecoar-dark/50 rounded-lg text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          />
        </div>

        {/* Summary Cards */}
        <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40 backdrop-blur-sm shadow-lg">
          <h4 className="text-white font-bold text-lg mb-4">Raça</h4>
          {selectedRace ? (
            <div>
              <div className="text-white text-xl font-semibold">{selectedRace.name}</div>
              <div className="text-white/60 text-sm">{selectedRace.genus}</div>
            </div>
          ) : (
            <div className="text-white/40">Não selecionado</div>
          )}
        </div>

        <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40 backdrop-blur-sm shadow-lg">
          <h4 className="text-white font-bold text-lg mb-4">Escola Marcial</h4>
          {selectedMartialSchool ? (
            <div>
              <div className="text-white text-xl font-semibold">{selectedMartialSchool.name}</div>
              <div className="text-ecoar-magenta/60 text-sm">{selectedMartialSchool.category}</div>
            </div>
          ) : (
            <div className="text-white/40">Não selecionado</div>
          )}
        </div>

        <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40 backdrop-blur-sm shadow-lg">
          <h4 className="text-white font-bold text-lg mb-4">Trilha</h4>
          {selectedPath ? (
            <div className="text-white text-xl font-semibold">{selectedPath.name}</div>
          ) : (
            <div className="text-white/40">Não selecionado</div>
          )}
        </div>

          <div className="p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40 backdrop-blur-sm shadow-lg">
          <h4 className="text-white font-bold text-lg mb-4">Atributos</h4>
          <div className="space-y-2">
            {Object.entries(data.attributes || {}).map(([attr, value]) => (
              <div key={attr} className="flex justify-between text-white/80">
                <span className="capitalize">{attr}:</span>
                <span className="font-semibold">{value} ({getAttributeModifier(value) >= 0 ? '+' : ''}{getAttributeModifier(value)})</span>
              </div>
            ))}
          </div>
        </div>

        {((data.equipamentos && data.equipamentos.length > 0) || (data.armas && data.armas.length > 0)) && (
          <div className="md:col-span-2 p-6 rounded-xl border border-ecoar-dark/50 bg-gray-900/40 backdrop-blur-sm shadow-lg">
            <h4 className="text-white font-bold text-lg mb-4">Equipamentos & Armas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.equipamentos && data.equipamentos.length > 0 && (
                <div>
                  <h5 className="text-white/80 font-semibold mb-2">Equipamentos:</h5>
                  <ul className="list-disc list-inside text-white/70 space-y-1">
                    {data.equipamentos.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.armas && data.armas.length > 0 && (
                <div>
                  <h5 className="text-white/80 font-semibold mb-2">Armas:</h5>
                  <ul className="list-disc list-inside text-white/70 space-y-1">
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

