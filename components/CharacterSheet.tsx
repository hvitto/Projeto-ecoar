'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Sparkles, Shield, Heart, Brain, Zap, Eye, Navigation,
  TrendingUp, Sword, BookOpen, Package, FileText, Target,
  Waves, Wind, Edit
} from 'lucide-react'
import {
  getAttributeModifier,
  calculateCorpoMax,
  calculateMenteMax,
  calculateCommonTests,
  formatModifier,
} from '@/lib/calculations'
import { races, getAllGenus, getRacesByGenus, getRaceById } from '@/data/races'
import { paths, getPathById } from '@/data/paths'
import { locations, getLocationById, getLocationsByNation, getAllNations } from '@/data/locations'

const ATTRIBUTE_STATE_KEYS = [
  'carisma',
  'finesse',
  'forca',
  'inteligencia',
  'percepcao',
  'vitalidade',
  'vontade',
] as const

type AttributeStateKey = (typeof ATTRIBUTE_STATE_KEYS)[number]

const isAttributeStateKey = (key: string): key is AttributeStateKey => {
  switch (key) {
    case 'carisma':
    case 'finesse':
    case 'forca':
    case 'inteligencia':
    case 'percepcao':
    case 'vitalidade':
    case 'vontade':
      return true
    default:
      return false
  }
}

interface CharacterSheetProps {
  initialData?: any
  onEdit?: () => void
}

export default function CharacterSheet({ initialData, onEdit }: CharacterSheetProps) {
  const [characterData, setCharacterData] = useState({
    // Levels
    nivelAlma: 1,
    nivelPoder: 3,
    nivelTrilha: 1,
    
    // Basic Info
    pontosEvolucao: { atual: 0, max: 0 },
    nome: '',
    localizacao: '',
    genus: '',
    moeda: '',
    raca: '',
    trilha: '',
    
    // Personality
    tracoPositivo: '',
    tracoNegativo: '',
    peso: 0,
    tamanho: 0,
    
    // Movements
    terrestre: '',
    aquatico: '',
    aereo: '',
    
    // Limits
    corpo: { atual: 9, max: 9 },
    mente: { atual: 9, max: 9 },
    folego: { atual: 0, max: 0 },
    mana: { atual: 0, max: 0 },
    
    // Attributes
    carisma: { nivel: 0, mod: 0 },
    finesse: { nivel: 0, mod: 0 },
    forca: { nivel: 0, mod: 0 },
    inteligencia: { nivel: 0, mod: 0 },
    percepcao: { nivel: 0, mod: 0 },
    vitalidade: { nivel: 0, mod: 0 },
    vontade: { nivel: 0, mod: 0 },
    
    // Senses
    visao: '',
    audicao: '',
    olfato: '',
    
    // Common Tests
    arredores: '',
    iniciativa: '',
    esquiva: '',
    coragem: '',
    
    // Equipment & Notes
    equipamentos: '',
    espacos: '',
    anotacoes: '',
  })

  // Apply initial data from wizard
  useEffect(() => {
    if (initialData) {
      setCharacterData(prev => {
        const updated = { ...prev }
        
        if (initialData.nome) updated.nome = initialData.nome
        if (initialData.genus) updated.genus = initialData.genus
        if (initialData.raca) updated.raca = initialData.raca
        if (initialData.localizacao) updated.localizacao = initialData.localizacao
        if (initialData.trilha) updated.trilha = initialData.trilha
        
        if (initialData.attributes) {
          Object.entries(initialData.attributes).forEach(([key, value]) => {
            if (typeof value === 'number' && isAttributeStateKey(key)) {
              updated[key] = {
                nivel: value,
                mod: getAttributeModifier(value),
              }
            }
          })
        }
        
        if (initialData.equipamentos || initialData.armas) {
          const equipList = [
            ...(initialData.equipamentos || []),
            ...(initialData.armas || []),
          ]
          updated.equipamentos = equipList.join('\n')
        }
        
        return updated
      })
      
      if (initialData.raca) {
        setTimeout(() => {
          const raceId = initialData.raca
          if (raceId) {
            const race = getRaceById(raceId)
            if (!race || !race.bonuses) return

            if (race.bonuses.movement) {
              setCharacterData(prev => ({
                ...prev,
                terrestre: race.bonuses!.movement!.terrestre ? `${race.bonuses!.movement!.terrestre}m` : prev.terrestre,
                aquatico: race.bonuses!.movement!.aquatico ? `${race.bonuses!.movement!.aquatico}m` : prev.aquatico,
                aereo: race.bonuses!.movement!.aereo ? `${race.bonuses!.movement!.aereo}m` : prev.aereo,
              }))
            }

            if (race.bonuses.senses) {
              setCharacterData(prev => ({
                ...prev,
                visao: race.bonuses!.senses!.visao ? `${race.bonuses!.senses!.visao}m` : prev.visao,
                audicao: race.bonuses!.senses!.audicao ? `${race.bonuses!.senses!.audicao}m` : prev.audicao,
                olfato: race.bonuses!.senses!.olfato ? `${race.bonuses!.senses!.olfato}m` : prev.olfato,
              }))
            }

            if (race.bonuses.attributes) {
              Object.entries(race.bonuses.attributes).forEach(([attr, bonus]) => {
                const attrMap: Record<string, string> = {
                  forca: 'forca',
                  carisma: 'carisma',
                  finesse: 'finesse',
                  inteligencia: 'inteligencia',
                  percepcao: 'percepcao',
                  vitalidade: 'vitalidade',
                  vontade: 'vontade',
                }
                const attrKey = attrMap[attr]
                if (attrKey) {
                  setCharacterData(prev => {
                    const attrData = prev[attrKey as keyof typeof prev] as { nivel: number; mod: number }
                    const newLevel = (attrData?.nivel || 0) + (bonus as number)
                    return {
                      ...prev,
                      [attrKey]: {
                        nivel: newLevel,
                        mod: getAttributeModifier(newLevel),
                      },
                    }
                  })
                }
              })
            }
          }
        }, 100)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateField = (path: string, value: any) => {
    const keys = path.split('.')
    setCharacterData(prev => {
      const newData = { ...prev }
      let current: any = newData
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      
      if (keys[0] && keys[1] === 'nivel' && (keys[0] === 'carisma' || keys[0] === 'finesse' || 
          keys[0] === 'forca' || keys[0] === 'inteligencia' || keys[0] === 'percepcao' || 
          keys[0] === 'vitalidade' || keys[0] === 'vontade')) {
        const attrName = keys[0] as keyof typeof newData
        const attr = newData[attrName] as { nivel: number | string, mod: number }
        const level = typeof attr.nivel === 'string' ? parseInt(attr.nivel) || 0 : attr.nivel
        attr.mod = getAttributeModifier(level)
      }
      
      return newData
    })
  }


  const applyRaceBonuses = (raceId: string) => {
    if (!raceId) {
      updateField('terrestre', '')
      updateField('aquatico', '')
      updateField('aereo', '')
      updateField('visao', '')
      updateField('audicao', '')
      updateField('olfato', '')
      return
    }

    const race = getRaceById(raceId)
    if (!race || !race.bonuses) return

    if (race.bonuses.movement) {
      if (race.bonuses.movement.terrestre) {
        updateField('terrestre', `${race.bonuses.movement.terrestre}m`)
      }
      if (race.bonuses.movement.aquatico) {
        updateField('aquatico', `${race.bonuses.movement.aquatico}m`)
      }
      if (race.bonuses.movement.aereo) {
        updateField('aereo', `${race.bonuses.movement.aereo}m`)
      }
    }

    if (race.bonuses.senses) {
      if (race.bonuses.senses.visao) {
        updateField('visao', `${race.bonuses.senses.visao}m`)
      }
      if (race.bonuses.senses.audicao) {
        updateField('audicao', `${race.bonuses.senses.audicao}m`)
      }
      if (race.bonuses.senses.olfato) {
        updateField('olfato', `${race.bonuses.senses.olfato}m`)
      }
    }

    if (race.bonuses.attributes) {
      Object.entries(race.bonuses.attributes).forEach(([attr, bonus]) => {
        const attrMap: Record<string, string> = {
          forca: 'forca',
          carisma: 'carisma',
          finesse: 'finesse',
          inteligencia: 'inteligencia',
          percepcao: 'percepcao',
          vitalidade: 'vitalidade',
          vontade: 'vontade',
        }
        const attrKey = attrMap[attr]
        if (attrKey) {
          setCharacterData(prev => {
            const attrData = prev[attrKey as keyof typeof prev] as { nivel: number; mod: number }
            const newLevel = (attrData?.nivel || 0) + (bonus as number)
            return {
              ...prev,
              [attrKey]: {
                nivel: newLevel,
                mod: getAttributeModifier(newLevel),
              },
            }
          })
        }
      })
    }

    if (race.bonuses.sizeModifier !== undefined) {
      updateField('tamanho', race.bonuses.sizeModifier)
    }
    if (race.bonuses.weightModifier !== undefined) {
      updateField('peso', race.bonuses.weightModifier)
    }

    if (race.bonuses.corpo) {
      setCharacterData(prev => ({
        ...prev,
        corpo: {
          ...prev.corpo,
          atual: prev.corpo.atual + race.bonuses!.corpo!,
        },
      }))
    }
    if (race.bonuses.mente) {
      setCharacterData(prev => ({
        ...prev,
        mente: {
          ...prev.mente,
          atual: prev.mente.atual + race.bonuses!.mente!,
        },
      }))
    }
    if (race.bonuses.folego) {
      updateField('folego.max', race.bonuses.folego)
      updateField('folego.atual', race.bonuses.folego)
    }
    if (race.bonuses.mana) {
      updateField('mana.max', race.bonuses.mana)
      updateField('mana.atual', race.bonuses.mana)
    }
  }

  const derivedValues = useMemo(() => {
    const percepcaoLevel = typeof characterData.percepcao.nivel === 'string' 
      ? parseInt(characterData.percepcao.nivel) || 0 
      : characterData.percepcao.nivel
    const vitalidadeLevel = typeof characterData.vitalidade.nivel === 'string'
      ? parseInt(characterData.vitalidade.nivel) || 0
      : characterData.vitalidade.nivel
    const vontadeLevel = typeof characterData.vontade.nivel === 'string'
      ? parseInt(characterData.vontade.nivel) || 0
      : characterData.vontade.nivel

    return {
      corpoMax: calculateCorpoMax(vitalidadeLevel),
      menteMax: calculateMenteMax(vontadeLevel),
      commonTests: calculateCommonTests(percepcaoLevel, vontadeLevel),
    }
  }, [
    characterData.percepcao.nivel,
    characterData.vitalidade.nivel,
    characterData.vontade.nivel
  ])

  const attributes = [
    { key: 'carisma', label: 'Carisma', icon: Sparkles },
    { key: 'finesse', label: 'Finesse', icon: Zap },
    { key: 'forca', label: 'Força', icon: Sword },
    { key: 'inteligencia', label: 'Inteligência', icon: Brain },
    { key: 'percepcao', label: 'Percepção', icon: Eye },
    { key: 'vitalidade', label: 'Vitalidade', icon: Heart },
    { key: 'vontade', label: 'Vontade', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-ecoar-light dark:bg-ecoar-dark-900 py-12 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Layout em 3 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Esquerda - Informações Principais */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Atributos */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900 uppercase tracking-wider mb-6">
                Atributos
              </h3>
              <div className="space-y-4">
                {attributes.map((attr) => {
                  const Icon = attr.icon
                  const attrData = characterData[attr.key as keyof typeof characterData] as { nivel: number; mod: number }
                  const nivel = typeof attrData.nivel === 'string' 
                    ? parseInt(attrData.nivel) || 0 
                    : attrData.nivel
                  const mod = attrData.mod || 0
                  
                  return (
                    <div key={attr.key} className="flex items-center justify-between py-3 border-b border-ecoar-dark-300/20 dark:border-ecoar-light-900/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                        <span className="text-sm text-ecoar-dark-800 dark:text-ecoar-light-900 font-medium">{attr.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          value={nivel}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0
                            updateField(`${attr.key}.nivel`, val)
                            updateField(`${attr.key}.mod`, getAttributeModifier(val))
                          }}
                          className="w-12 text-center text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
                        />
                        <span className="text-sm font-semibold text-ecoar-teal-600 dark:text-ecoar-teal-400 w-8 text-right">
                          {formatModifier(mod)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Níveis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900 uppercase tracking-wider mb-6">
                Níveis
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ecoar-dark-800 dark:text-ecoar-light-900 font-medium">Alma</span>
                  <input
                    type="number"
                    value={characterData.nivelAlma}
                    onChange={(e) => updateField('nivelAlma', parseInt(e.target.value) || 0)}
                    className="w-16 text-center text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ecoar-dark-800 dark:text-ecoar-light-900 font-medium">Poder</span>
                  <input
                    type="number"
                    value={characterData.nivelPoder}
                    onChange={(e) => updateField('nivelPoder', parseInt(e.target.value) || 0)}
                    className="w-16 text-center text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ecoar-dark-800 dark:text-ecoar-light-900 font-medium">Trilha</span>
                  <input
                    type="number"
                    value={characterData.nivelTrilha}
                    onChange={(e) => updateField('nivelTrilha', parseInt(e.target.value) || 0)}
                    className="w-16 text-center text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="pt-3 border-t border-ecoar-dark-300/20 dark:border-ecoar-light-900/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-ecoar-dark-800 dark:text-ecoar-light-900 font-medium">Pontos Evolução</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={characterData.pontosEvolucao.atual}
                      onChange={(e) => updateField('pontosEvolucao.atual', parseInt(e.target.value) || 0)}
                      className="flex-1 text-center text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
                    />
                    <span className="text-ecoar-dark-500 dark:text-ecoar-light-900/60">/</span>
                    <input
                      type="number"
                      value={characterData.pontosEvolucao.max}
                      onChange={(e) => updateField('pontosEvolucao.max', parseInt(e.target.value) || 0)}
                      className="flex-1 text-center text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Limites */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900 uppercase tracking-wider mb-6">
                Limites
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'corpo', label: 'Corpo', icon: Heart, max: derivedValues.corpoMax },
                  { key: 'mente', label: 'Mente', icon: Brain, max: derivedValues.menteMax },
                  { key: 'folego', label: 'Fôlego', icon: Waves, max: characterData.folego.max },
                  { key: 'mana', label: 'Mana', icon: Sparkles, max: characterData.mana.max },
                ].map((limit) => {
                  const Icon = limit.icon
                  const current = characterData[limit.key as keyof typeof characterData] as { atual: number; max: number }
                  
                  return (
                    <div key={limit.key} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                        <span className="text-sm text-ecoar-dark-800 dark:text-ecoar-light-900 font-medium">{limit.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={current.atual}
                          onChange={(e) => updateField(`${limit.key}.atual`, parseInt(e.target.value) || 0)}
                          className="w-12 text-center text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
                        />
                        <span className="text-ecoar-dark-500 dark:text-ecoar-light-900/60">/</span>
                        <span className="text-sm font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900 w-8 text-right">
                          {limit.max}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </aside>

          {/* Área Central - Conteúdo Principal */}
          <main className="lg:col-span-6 space-y-8">
            {/* Header do Personagem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 rounded-2xl p-8 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <input
                  type="text"
                  value={characterData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  className="flex-1 text-4xl font-bold bg-transparent border-none text-ecoar-dark-900 dark:text-ecoar-light-900 placeholder-ecoar-dark-400 dark:placeholder-ecoar-light-900/50 focus:outline-none"
                  placeholder="Nome do Personagem"
                />
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="ml-4 px-4 py-2 bg-ecoar-teal-100 dark:bg-ecoar-teal-600/20 hover:bg-ecoar-teal-200 dark:hover:bg-ecoar-teal-600/30 text-ecoar-teal-700 dark:text-ecoar-teal-300 rounded-lg transition-all duration-200 flex items-center gap-2 border border-ecoar-teal-300 dark:border-ecoar-teal-500/40 shadow-sm"
                    title="Editar personagem"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">Editar</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900/80 uppercase tracking-wider mb-2">
                    Genus
                  </label>
                  <select
                    value={characterData.genus}
                    onChange={(e) => {
                      updateField('genus', e.target.value)
                      updateField('raca', '')
                      applyRaceBonuses('')
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm"
                  >
                    <option value="">Selecione um Genus</option>
                    {getAllGenus().map((genus) => (
                      <option key={genus} value={genus}>
                        {genus}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900/80 uppercase tracking-wider mb-2">
                    Raça
                  </label>
                  <select
                    value={characterData.raca}
                    onChange={(e) => {
                      updateField('raca', e.target.value)
                      applyRaceBonuses(e.target.value)
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all disabled:opacity-50 shadow-sm"
                    disabled={!characterData.genus}
                  >
                    <option value="">Selecione uma Raça</option>
                    {characterData.genus && getRacesByGenus(characterData.genus).map((race) => (
                      <option key={race.id} value={race.id}>
                        {race.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900/80 uppercase tracking-wider mb-2">
                    Região
                  </label>
                  <select
                    value={characterData.localizacao}
                    onChange={(e) => updateField('localizacao', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm"
                  >
                    <option value="">Selecione</option>
                    {getAllNations().map((nation) => {
                      const nationLocations = getLocationsByNation(nation)
                      return (
                        <optgroup key={nation} label={nation}>
                          {nationLocations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}{location.region ? ` (${location.region})` : ''}
                            </option>
                          ))}
                        </optgroup>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900/80 uppercase tracking-wider mb-2">
                    Trilha
                  </label>
                  <select
                    value={characterData.trilha}
                    onChange={(e) => updateField('trilha', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm"
                  >
                    <option value="">Selecione</option>
                    {paths.map((path) => (
                      <option key={path.id} value={path.id}>
                        {path.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Testes Comuns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900 uppercase tracking-wider mb-6">
                Testes Comuns
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'arredores', label: 'Arredores', desc: 'Percepção + Atenção', value: derivedValues.commonTests.arredores },
                  { key: 'iniciativa', label: 'Iniciativa', desc: 'Percepção + Raciocínio', value: derivedValues.commonTests.iniciativa },
                  { key: 'esquiva', label: 'Esquiva', desc: 'Percepção + Reflexos', value: derivedValues.commonTests.esquiva },
                  { key: 'coragem', label: 'Coragem', desc: 'Vontade + Compostura', value: derivedValues.commonTests.coragem },
                ].map((test) => (
                  <div key={test.key} className="text-center py-4 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 bg-ecoar-teal-50/50 dark:bg-ecoar-teal-900/30 rounded-lg">
                    <div className="text-xs font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900/80 uppercase tracking-wider mb-2">
                      {test.label}
                    </div>
                    <div className="text-2xl font-bold text-ecoar-teal-600 dark:text-ecoar-teal-400 mb-1">
                      {formatModifier(test.value)}
                    </div>
                    <div className="text-xs text-ecoar-dark-600 dark:text-ecoar-light-900/70">{test.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Deslocamentos e Sentidos */}
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-ecoar-dark-700 uppercase tracking-wider mb-6">
                  Deslocamentos
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'terrestre', label: 'Terrestre', icon: Navigation },
                    { key: 'aquatico', label: 'Aquático', icon: Waves },
                    { key: 'aereo', label: 'Aéreo', icon: Wind },
                  ].map((move) => {
                    const Icon = move.icon
                    return (
                      <div key={move.key} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                        <input
                          type="text"
                          value={characterData[move.key as keyof typeof characterData] as string}
                          onChange={(e) => updateField(move.key, e.target.value)}
                          placeholder="0m"
                          className="flex-1 px-3 py-2 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm"
                        />
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-ecoar-dark-700 uppercase tracking-wider mb-6">
                  Sentidos
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'visao', label: 'Visão', icon: Eye },
                    { key: 'audicao', label: 'Audição', icon: Waves },
                    { key: 'olfato', label: 'Olfato', icon: Navigation },
                  ].map((sense) => {
                    const Icon = sense.icon
                    return (
                      <div key={sense.key} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400" />
                        <input
                          type="text"
                          value={characterData[sense.key as keyof typeof characterData] as string}
                          onChange={(e) => updateField(sense.key, e.target.value)}
                          placeholder="0m"
                          className="flex-1 px-3 py-2 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm"
                        />
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </main>

          {/* Sidebar Direita - Informações Secundárias */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Equipamentos */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            className="bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-ecoar-dark-700 uppercase tracking-wider mb-4">
                Equipamentos
              </h3>
              <textarea
                value={characterData.equipamentos}
                onChange={(e) => updateField('equipamentos', e.target.value)}
                placeholder="Liste seus equipamentos..."
                className="w-full h-64 px-4 py-3 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm resize-none focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm"
              />
            </motion.div>

            {/* Anotações */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/90 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-ecoar-dark-700 uppercase tracking-wider mb-4">
                Anotações
              </h3>
              <textarea
                value={characterData.anotacoes}
                onChange={(e) => updateField('anotacoes', e.target.value)}
                placeholder="Anotações gerais..."
                className="w-full h-64 px-4 py-3 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm resize-none focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm"
              />
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  )
}
