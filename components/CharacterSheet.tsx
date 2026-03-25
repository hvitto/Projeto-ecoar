'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/motionVariants'
import {
  User, Sparkles, Shield, Heart, Brain, Zap, Eye, Navigation,
  TrendingUp, Sword, BookOpen, Package, FileText, Target,
  Waves, Wind, Edit, ExternalLink
} from 'lucide-react'
import {
  getAttributeModifier,
  calculateCorpoMax,
  calculateMenteMax,
  calculateCommonTests,
  formatModifier,
} from '@/lib/calculations'
import { races, getRaceById } from '@/data/races'
import { paths, getPathById } from '@/data/paths'
import { locations, getLocationById, getLocationsByNation, getAllNations } from '@/data/locations'
import SingularityCard from '@/components/ui/SingularityCard'
import { getCreationSingularityById } from '@/data/creationSingularities'
import { getSingularityById } from '@/data/singularities'
import { getEcoarSingularityById } from '@/data/ecoarSingularities'
import { getMartialSchoolSingularityById } from '@/data/martialSchoolSingularities'
import { getPathLevelFromSoulLevel } from '@/data/pathSingularities'
import { getSoulLevelByNivel, getSoulLevelByPontosEvolucao } from '@/data/soulLevels'
import type { CatalogEntry, CatalogOwnedItem } from '@/types/equipment'
import EquipmentCatalogBrowser from '@/components/equipment/EquipmentCatalogBrowser'
import {
  catalogDisplayLine,
  formatCerosDisplay,
  newCatalogInstanceId,
  parseCostLabelToCeros,
} from '@/lib/equipmentCost'
import Header from './Header'
import { useAuth } from '@/contexts/AuthContext'
import { useEquipmentCatalog } from '@/contexts/EquipmentCatalogContext'
import { saveCharacter } from '@/lib/storage/characterStorage'

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
  canEdit?: boolean
  onBackToDashboard?: () => void
  onOpenEvolution?: () => void
  onCharacterSaved?: (saved: any) => void
}

export default function CharacterSheet({
  initialData,
  canEdit,
  onBackToDashboard,
  onOpenEvolution,
  onCharacterSaved,
}: CharacterSheetProps) {
  const [characterData, setCharacterData] = useState({
    // Basic Info
    pontosEvolucao: { atual: 0, max: 0 },
    nome: '',
    localizacao: '',
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
    saldoMoedas: 0,
    itensCatalogo: [] as CatalogOwnedItem[],
    equipamentosLivresText: '',
    armasLivresText: '',
    espacos: '',
    anotacoes: '',

    // Singularities (IDs selected in the wizard)
    singularidades: [] as string[],
    singularidadesEcoar: [] as string[],
    singularidadesMarciais: [] as string[],
    singularidadesRaciais: [] as string[],
  })

  const { user } = useAuth()
  const { weapons, armor, utilities, multiplierTables } = useEquipmentCatalog()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const editBackupRef = useRef<typeof characterData | null>(null)
  const initialDataRef = useRef<any>(initialData)
  const limitsAutoSaveTimeoutRef = useRef<number | null>(null)
  const userTriggeredLimitsRef = useRef(false)

  const [activeSidebarTab, setActiveSidebarTab] = useState<'singularidades' | 'equipamentos'>('singularidades')
  const [equipmentPickerOpen, setEquipmentPickerOpen] = useState(false)
  const [peToAdd, setPeToAdd] = useState<string>('')

  const peToAddNumber = useMemo(() => {
    const n = parseInt(peToAdd, 10)
    return Number.isFinite(n) ? n : 0
  }, [peToAdd])

  useEffect(() => {
    initialDataRef.current = initialData
  }, [initialData])

  // Apply initial data from wizard
  useEffect(() => {
    if (initialData) {
      setCharacterData(prev => {
        const updated = { ...prev }
        
        if (initialData.nome) updated.nome = initialData.nome
        if (initialData.raca) updated.raca = initialData.raca
        if (initialData.localizacao) updated.localizacao = initialData.localizacao
        if (initialData.trilha) updated.trilha = initialData.trilha

        const toMeterString = (v: any): string => {
          if (v === undefined || v === null) return ''
          if (typeof v === 'string') {
            const s = v.trim()
            if (!s) return ''
            return s.endsWith('m') ? s : `${s}m`
          }
          const n = typeof v === 'number' ? v : parseFloat(String(v))
          return Number.isFinite(n) ? `${n}m` : ''
        }

        // Backstory (wizard key) -> anotacoes (sheet UI)
        if (typeof initialData.backstory === 'string') updated.anotacoes = initialData.backstory

        // Limits (atual/max) so the sheet can render the persisted values
        if (initialData.corpo && typeof initialData.corpo === 'object') {
          const atualRaw = (initialData.corpo as any).atual
          const maxRaw = (initialData.corpo as any).max
          const atual = typeof atualRaw === 'string' ? parseInt(atualRaw) : atualRaw
          const max = typeof maxRaw === 'string' ? parseInt(maxRaw) : maxRaw
          if (Number.isFinite(atual)) updated.corpo.atual = atual
          if (Number.isFinite(max)) updated.corpo.max = max
        }
        if (initialData.mente && typeof initialData.mente === 'object') {
          const atualRaw = (initialData.mente as any).atual
          const maxRaw = (initialData.mente as any).max
          const atual = typeof atualRaw === 'string' ? parseInt(atualRaw) : atualRaw
          const max = typeof maxRaw === 'string' ? parseInt(maxRaw) : maxRaw
          if (Number.isFinite(atual)) updated.mente.atual = atual
          if (Number.isFinite(max)) updated.mente.max = max
        }
        if (initialData.folego && typeof initialData.folego === 'object') {
          const atualRaw = (initialData.folego as any).atual
          const maxRaw = (initialData.folego as any).max
          const atual = typeof atualRaw === 'string' ? parseInt(atualRaw) : atualRaw
          const max = typeof maxRaw === 'string' ? parseInt(maxRaw) : maxRaw
          if (Number.isFinite(atual)) updated.folego.atual = atual
          if (Number.isFinite(max)) updated.folego.max = max
        }
        if (initialData.mana && typeof initialData.mana === 'object') {
          const atualRaw = (initialData.mana as any).atual
          const maxRaw = (initialData.mana as any).max
          const atual = typeof atualRaw === 'string' ? parseInt(atualRaw) : atualRaw
          const max = typeof maxRaw === 'string' ? parseInt(maxRaw) : maxRaw
          if (Number.isFinite(atual)) updated.mana.atual = atual
          if (Number.isFinite(max)) updated.mana.max = max
        }

        // Deslocamento/Sentidos (wizard keys) -> strings na UI
        if (initialData.deslocamento && typeof initialData.deslocamento === 'object') {
          const d = initialData.deslocamento as any
          if (d.terrestre !== undefined) updated.terrestre = toMeterString(d.terrestre)
          if (d.aquatico !== undefined) updated.aquatico = toMeterString(d.aquatico)
          if (d.aereo !== undefined) updated.aereo = toMeterString(d.aereo)
        }
        if (initialData.sentidos && typeof initialData.sentidos === 'object') {
          const s = initialData.sentidos as any
          if (s.visao !== undefined) updated.visao = toMeterString(s.visao)
          if (s.audicao !== undefined) updated.audicao = toMeterString(s.audicao)
          if (s.olfato !== undefined) updated.olfato = toMeterString(s.olfato)
        }

        // Inicializa Pontos de Evolução se vier no initialData (ex.: ao editar ficha)
        if (initialData.pontosEvolucao && typeof initialData.pontosEvolucao === 'object') {
          const peAtualRaw = (initialData.pontosEvolucao as any).atual
          const peMaxRaw = (initialData.pontosEvolucao as any).max
          const peAtual =
            typeof peAtualRaw === 'string' ? parseInt(peAtualRaw) : peAtualRaw
          const peMax =
            typeof peMaxRaw === 'string' ? parseInt(peMaxRaw) : peMaxRaw
          const atualSafe = Number.isFinite(peAtual) ? Math.max(0, peAtual) : updated.pontosEvolucao.atual
          const maxSafe = Number.isFinite(peMax) ? Math.max(0, peMax) : updated.pontosEvolucao.max
          updated.pontosEvolucao = { atual: atualSafe, max: maxSafe }
        } else if (initialData.nivelAlma !== undefined && initialData.nivelAlma !== null) {
          // Fallback: fichas antigas podem não ter `pontosEvolucao`.
          const v = typeof initialData.nivelAlma === 'string' ? parseInt(initialData.nivelAlma) : initialData.nivelAlma
          const nivelAlma = Number.isFinite(v) ? v : 1
          const sl = getSoulLevelByNivel(nivelAlma)
          const pontos = sl?.pontosEvolucao ?? 0
          updated.pontosEvolucao = { atual: pontos, max: pontos }
        }
        
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
        
        const catInit = initialData.itensCatalogo
        if (Array.isArray(catInit) && catInit.length > 0) {
          updated.itensCatalogo = catInit as CatalogOwnedItem[]
          const sm = initialData.saldoMoedas
          updated.saldoMoedas =
            typeof sm === 'number' && Number.isFinite(sm) ? sm : parseCostLabelToCeros(String(initialData.moeda ?? '')) ?? 0
          updated.equipamentosLivresText = Array.isArray(initialData.equipamentosLivres)
            ? initialData.equipamentosLivres.join('\n')
            : ''
          updated.armasLivresText = Array.isArray(initialData.armasLivres)
            ? initialData.armasLivres.join('\n')
            : ''
          updated.equipamentos = ''
        } else if (initialData.equipamentos || initialData.armas) {
          updated.itensCatalogo = []
          updated.equipamentosLivresText = ''
          updated.armasLivresText = ''
          const sm = initialData.saldoMoedas
          updated.saldoMoedas =
            typeof sm === 'number' && Number.isFinite(sm) ? sm : parseCostLabelToCeros(String(initialData.moeda ?? '')) ?? 0
          const equipList = [
            ...(initialData.equipamentos || []),
            ...(initialData.armas || []),
          ]
          updated.equipamentos = equipList.join('\n')
        }

        // Singularities selected in the wizard
        if (initialData.singularidades) {
          updated.singularidades = initialData.singularidades
        }
        if (initialData.singularidadesEcoar) {
          updated.singularidadesEcoar = initialData.singularidadesEcoar
        }
        if (initialData.singularidadesMarciais) {
          updated.singularidadesMarciais = initialData.singularidadesMarciais
        }
        if (initialData.singularidadesRaciais) {
          updated.singularidadesRaciais = initialData.singularidadesRaciais
        }
        
        // Initialize size and weight from initialData (convert string to number if needed)
        if (initialData.tamanho !== undefined && initialData.tamanho !== null) {
          const tamanhoValue = typeof initialData.tamanho === 'string' 
            ? parseFloat(initialData.tamanho) 
            : initialData.tamanho
          updated.tamanho = isNaN(tamanhoValue) ? 0 : tamanhoValue
        }
        if (initialData.peso !== undefined && initialData.peso !== null) {
          const pesoValue = typeof initialData.peso === 'string' 
            ? parseFloat(initialData.peso) 
            : initialData.peso
          updated.peso = isNaN(pesoValue) ? 0 : pesoValue
        }
        
        return updated
      })
      
      if (initialData.raca) {
        setTimeout(() => {
          const raceId = initialData.raca
          if (raceId) {
            const race = getRaceById(raceId)
            if (!race || !race.bonuses) return

              const hasDeslocamento = initialData.deslocamento && typeof initialData.deslocamento === 'object'
              const hasSentidos = initialData.sentidos && typeof initialData.sentidos === 'object'
              const hasAttributes = initialData.attributes && typeof initialData.attributes === 'object'

              const shouldApplyCorpo =
                !initialData.corpo || typeof initialData.corpo !== 'object' || (initialData.corpo as any).atual === undefined
              const shouldApplyMente =
                !initialData.mente || typeof initialData.mente !== 'object' || (initialData.mente as any).atual === undefined
              const shouldApplyFolego =
                !initialData.folego || typeof initialData.folego !== 'object' || (initialData.folego as any).atual === undefined
              const shouldApplyMana =
                !initialData.mana || typeof initialData.mana !== 'object' || (initialData.mana as any).atual === undefined

            // Apply size and weight modifiers if not already set from initialData
              if (race.bonuses.sizeModifier !== undefined && (initialData.tamanho === undefined || initialData.tamanho === null)) {
              setCharacterData(prev => ({ ...prev, tamanho: race.bonuses!.sizeModifier! }))
            }
              if (race.bonuses.weightModifier !== undefined && (initialData.peso === undefined || initialData.peso === null)) {
              setCharacterData(prev => ({ ...prev, peso: race.bonuses!.weightModifier! }))
            }

            if (race.bonuses.movement) {
                const d = (initialData.deslocamento ?? {}) as any
              setCharacterData(prev => ({
                ...prev,
                  terrestre:
                    !hasDeslocamento || d.terrestre === undefined || d.terrestre === null
                      ? race.bonuses!.movement!.terrestre ? `${race.bonuses!.movement!.terrestre}m` : prev.terrestre
                      : prev.terrestre,
                  aquatico:
                    !hasDeslocamento || d.aquatico === undefined || d.aquatico === null
                      ? race.bonuses!.movement!.aquatico ? `${race.bonuses!.movement!.aquatico}m` : prev.aquatico
                      : prev.aquatico,
                  aereo:
                    !hasDeslocamento || d.aereo === undefined || d.aereo === null
                      ? race.bonuses!.movement!.aereo ? `${race.bonuses!.movement!.aereo}m` : prev.aereo
                      : prev.aereo,
              }))
            }

            if (race.bonuses.senses) {
                const s = (initialData.sentidos ?? {}) as any
              setCharacterData(prev => ({
                ...prev,
                  visao:
                    !hasSentidos || s.visao === undefined || s.visao === null
                      ? race.bonuses!.senses!.visao ? `${race.bonuses!.senses!.visao}m` : prev.visao
                      : prev.visao,
                  audicao:
                    !hasSentidos || s.audicao === undefined || s.audicao === null
                      ? race.bonuses!.senses!.audicao ? `${race.bonuses!.senses!.audicao}m` : prev.audicao
                      : prev.audicao,
                  olfato:
                    !hasSentidos || s.olfato === undefined || s.olfato === null
                      ? race.bonuses!.senses!.olfato ? `${race.bonuses!.senses!.olfato}m` : prev.olfato
                      : prev.olfato,
              }))
            }

              // Avoid double-applying race bonuses when attributes were already persisted
              if (race.bonuses.attributes && !hasAttributes) {
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
            
            // Apply automatic bonuses from size and weight modifiers
            const sizeModifier = race.bonuses.sizeModifier ?? 0
            const weightModifier = race.bonuses.weightModifier ?? 0
            
            // Each +1 size gives +1 strength
            if (sizeModifier !== 0) {
              setCharacterData(prev => {
                const currentForca = prev.forca.nivel
                const newLevel = currentForca + sizeModifier
                return {
                  ...prev,
                  forca: {
                    nivel: Math.max(0, Math.min(8, newLevel)),
                    mod: getAttributeModifier(Math.max(0, Math.min(8, newLevel))),
                  },
                }
              })
            }
            
            // Each +1 weight gives +1 vitality
            if (weightModifier !== 0) {
              setCharacterData(prev => {
                const currentVitalidade = prev.vitalidade.nivel
                const newLevel = currentVitalidade + weightModifier
                return {
                  ...prev,
                  vitalidade: {
                    nivel: Math.max(0, Math.min(8, newLevel)),
                    mod: getAttributeModifier(Math.max(0, Math.min(8, newLevel))),
                  },
                }
              })
            }

              // Apply race limit bonuses if the persisted sheet doesn't include them yet
              if (race.bonuses.corpo && shouldApplyCorpo) {
                setCharacterData(prev => ({
                  ...prev,
                  corpo: {
                    ...prev.corpo,
                    atual: prev.corpo.atual + race.bonuses!.corpo!,
                  },
                }))
              }

              if (race.bonuses.mente && shouldApplyMente) {
                setCharacterData(prev => ({
                  ...prev,
                  mente: {
                    ...prev.mente,
                    atual: prev.mente.atual + race.bonuses!.mente!,
                  },
                }))
              }

              if (race.bonuses.folego && shouldApplyFolego) {
                updateField('folego.max', race.bonuses!.folego)
                updateField('folego.atual', race.bonuses!.folego)
              }

              if (race.bonuses.mana && shouldApplyMana) {
                updateField('mana.max', race.bonuses!.mana)
                updateField('mana.atual', race.bonuses!.mana)
              }
          }
        }, 100)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEquipmentCatalogPick = useCallback((entry: CatalogEntry, custoCeros: number) => {
    setCharacterData((prev) => {
      let livresEq = prev.equipamentosLivresText
      let livresAr = prev.armasLivresText
      let equipLegacy = prev.equipamentos
      if (prev.itensCatalogo.length === 0 && String(equipLegacy).trim() && !livresEq.trim() && !livresAr.trim()) {
        livresEq = String(equipLegacy)
        equipLegacy = ''
      }
      const displayLine = catalogDisplayLine(entry, custoCeros)
      return {
        ...prev,
        equipamentos: equipLegacy,
        equipamentosLivresText: livresEq,
        armasLivresText: livresAr,
        itensCatalogo: [
          ...prev.itensCatalogo,
          {
            instanceId: newCatalogInstanceId(),
            catalogId: entry.id,
            kind: entry.kind,
            nome: entry.name,
            custoCeros,
            displayLine,
          },
        ],
        saldoMoedas: Math.max(0, prev.saldoMoedas - custoCeros),
      }
    })
  }, [])

  const removeSheetCatalogItem = useCallback((instanceId: string) => {
    setCharacterData((prev) => {
      const item = prev.itensCatalogo.find((i) => i.instanceId === instanceId)
      const next = prev.itensCatalogo.filter((i) => i.instanceId !== instanceId)
      const refund = item?.custoCeros ?? 0
      return {
        ...prev,
        itensCatalogo: next,
        saldoMoedas: prev.saldoMoedas + refund,
      }
    })
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

    // Apply size and weight modifiers
    const sizeModifier = race.bonuses.sizeModifier ?? 0
    const weightModifier = race.bonuses.weightModifier ?? 0

    if (race.bonuses.sizeModifier !== undefined) {
      updateField('tamanho', race.bonuses.sizeModifier)
    }
    if (race.bonuses.weightModifier !== undefined) {
      updateField('peso', race.bonuses.weightModifier)
    }
    
    // Apply automatic bonuses from size and weight modifiers
    // Each +1 size gives +1 strength
    if (sizeModifier !== 0) {
      setCharacterData(prev => {
        const currentForca = prev.forca.nivel
        const newLevel = currentForca + sizeModifier
        return {
          ...prev,
          forca: {
            nivel: Math.max(0, Math.min(8, newLevel)),
            mod: getAttributeModifier(Math.max(0, Math.min(8, newLevel))),
          },
        }
      })
    }
    
    // Each +1 weight gives +1 vitality
    if (weightModifier !== 0) {
      setCharacterData(prev => {
        const currentVitalidade = prev.vitalidade.nivel
        const newLevel = currentVitalidade + weightModifier
        return {
          ...prev,
          vitalidade: {
            nivel: Math.max(0, Math.min(8, newLevel)),
            mod: getAttributeModifier(Math.max(0, Math.min(8, newLevel))),
          },
        }
      })
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

    // Calculate esquiva penalty from size and weight modifiers
    // Each +1 in size OR weight gives -1 to esquiva
    // So penalty = -(sizeModifier + weightModifier)
    // Examples: size=-1, weight=-1 => penalty = -(-1 + -1) = +2
    //           size=+1, weight=+1 => penalty = -(+1 + +1) = -2
    const sizeModifier = typeof characterData.tamanho === 'number' ? characterData.tamanho : 0
    const weightModifier = typeof characterData.peso === 'number' ? characterData.peso : 0
    const sizeWeightPenalty = -(sizeModifier + weightModifier)

    return {
      corpoMax: calculateCorpoMax(vitalidadeLevel),
      menteMax: calculateMenteMax(vontadeLevel),
      commonTests: calculateCommonTests(percepcaoLevel, vontadeLevel, 0, 0, 0, 0, 0, sizeWeightPenalty),
    }
  }, [
    characterData.percepcao.nivel,
    characterData.vitalidade.nivel,
    characterData.vontade.nivel,
    characterData.tamanho,
    characterData.peso
  ])

  // Níveis automáticos a partir dos Pontos de Evolução acumulados (lado após '/')
  const soulLevel = useMemo(
    () => getSoulLevelByPontosEvolucao(characterData.pontosEvolucao.max),
    [characterData.pontosEvolucao.max]
  )
  const nivelAlma = soulLevel.nivel
  const nivelPoder = soulLevel.nivelPoder
  const nivelTrilha = getPathLevelFromSoulLevel(nivelAlma)

  const deepClone = useCallback((obj: any) => JSON.parse(JSON.stringify(obj)), [])

  const parseMeters = useCallback((v: any): number => {
    if (v === undefined || v === null) return 0
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase().replace(/m$/i, '')
      const n = parseFloat(s)
      return Number.isFinite(n) ? n : 0
    }
    const n = parseFloat(String(v))
    return Number.isFinite(n) ? n : 0
  }, [])

  const coerceLimitShape = useCallback((prev: any, atual: number, max: number) => {
    if (prev && typeof prev === 'object') {
      return {
        ...prev,
        atual,
        max,
      }
    }
    return { atual, max }
  }, [])

  const buildLimitsPayload = useCallback(() => {
    const base = initialDataRef.current ?? {}
    return {
      ...base,
      corpo: coerceLimitShape(base.corpo, characterData.corpo.atual, derivedValues.corpoMax),
      mente: coerceLimitShape(base.mente, characterData.mente.atual, derivedValues.menteMax),
      folego: coerceLimitShape(base.folego, characterData.folego.atual, characterData.folego.max),
      mana: coerceLimitShape(base.mana, characterData.mana.atual, characterData.mana.max),
    }
  }, [characterData, coerceLimitShape, derivedValues.corpoMax, derivedValues.menteMax])

  const buildFullPayload = useCallback(() => {
    const base = initialDataRef.current ?? {}

    const attributesPayload = {
      carisma: characterData.carisma.nivel,
      finesse: characterData.finesse.nivel,
      forca: characterData.forca.nivel,
      inteligencia: characterData.inteligencia.nivel,
      percepcao: characterData.percepcao.nivel,
      vitalidade: characterData.vitalidade.nivel,
      vontade: characterData.vontade.nivel,
    }

    const eqLivresLines = characterData.equipamentosLivresText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const arLivresLines = characterData.armasLivresText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const useStructuredEquipment =
      characterData.itensCatalogo.length > 0 || eqLivresLines.length > 0 || arLivresLines.length > 0

    const commonPayload = {
      ...base,
      nivelAlma,
      nivelPoder,
      nivelTrilha,
      nome: characterData.nome,
      raca: characterData.raca,
      localizacao: characterData.localizacao,
      trilha: characterData.trilha,
      pontosEvolucao: characterData.pontosEvolucao,
      tamanho: characterData.tamanho,
      peso: characterData.peso,
      attributes: attributesPayload,
      corpo: coerceLimitShape(base.corpo, characterData.corpo.atual, derivedValues.corpoMax),
      mente: coerceLimitShape(base.mente, characterData.mente.atual, derivedValues.menteMax),
      folego: coerceLimitShape(base.folego, characterData.folego.atual, characterData.folego.max),
      mana: coerceLimitShape(base.mana, characterData.mana.atual, characterData.mana.max),
      deslocamento: {
        terrestre: parseMeters(characterData.terrestre),
        aquatico: parseMeters(characterData.aquatico),
        aereo: parseMeters(characterData.aereo),
      },
      sentidos: {
        visao: parseMeters(characterData.visao),
        audicao: parseMeters(characterData.audicao),
        olfato: parseMeters(characterData.olfato),
      },
      backstory: characterData.anotacoes,
      singularidades: characterData.singularidades,
      singularidadesEcoar: characterData.singularidadesEcoar,
      singularidadesMarciais: characterData.singularidadesMarciais,
      singularidadesRaciais: characterData.singularidadesRaciais,
      saldoMoedas: characterData.saldoMoedas,
      moeda: formatCerosDisplay(characterData.saldoMoedas),
    }

    if (useStructuredEquipment) {
      const cat = characterData.itensCatalogo
      const catEq = cat.filter((i) => i.kind !== 'weapon').map((i) => i.displayLine)
      const catAr = cat.filter((i) => i.kind === 'weapon').map((i) => i.displayLine)
      return {
        ...commonPayload,
        equipamentos: [...catEq, ...eqLivresLines],
        armas: [...catAr, ...arLivresLines],
        itensCatalogo: cat,
        equipamentosLivres: eqLivresLines,
        armasLivres: arLivresLines,
      }
    }

    const allLines = String(characterData.equipamentos ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    const baseEquip = Array.isArray(base.equipamentos) ? base.equipamentos : []
    const baseArmas = Array.isArray(base.armas) ? base.armas : []

    let equipamentosPayload: string[] = []
    let armasPayload: string[] = []

    if (baseEquip.length > 0 && baseArmas.length > 0) {
      equipamentosPayload = allLines.slice(0, baseEquip.length)
      armasPayload = allLines.slice(baseEquip.length)
    } else if (baseEquip.length > 0) {
      equipamentosPayload = allLines
      armasPayload = []
    } else if (baseArmas.length > 0) {
      equipamentosPayload = []
      armasPayload = allLines
    } else {
      equipamentosPayload = allLines
      armasPayload = []
    }

    return {
      ...commonPayload,
      equipamentos: equipamentosPayload,
      armas: armasPayload,
      itensCatalogo: [],
      equipamentosLivres: [],
      armasLivres: [],
    }
  }, [
    characterData,
    coerceLimitShape,
    derivedValues.corpoMax,
    derivedValues.menteMax,
    nivelAlma,
    nivelPoder,
    nivelTrilha,
    parseMeters,
  ])

  const handleStartEdit = useCallback(() => {
    if (!canEdit) return
    editBackupRef.current = deepClone(characterData)
    userTriggeredLimitsRef.current = false
    setIsEditing(true)

    if (limitsAutoSaveTimeoutRef.current) {
      clearTimeout(limitsAutoSaveTimeoutRef.current)
      limitsAutoSaveTimeoutRef.current = null
    }
  }, [canEdit, characterData, deepClone])

  const handleCancelEdit = useCallback(() => {
    if (editBackupRef.current) {
      setCharacterData(deepClone(editBackupRef.current))
    }
    setIsEditing(false)
    setIsSaving(false)

    if (limitsAutoSaveTimeoutRef.current) {
      clearTimeout(limitsAutoSaveTimeoutRef.current)
      limitsAutoSaveTimeoutRef.current = null
    }
    userTriggeredLimitsRef.current = false
  }, [deepClone])

  const handleSaveEdit = useCallback(async () => {
    if (!user) return
    if (!initialDataRef.current?.id) return
    setIsSaving(true)
    try {
      const payload = buildFullPayload()
      const saved = await saveCharacter(user.id, payload as any)
      initialDataRef.current = saved.data
      editBackupRef.current = null
      setIsEditing(false)
      onCharacterSaved?.(saved)
    } catch (e) {
      console.error('Erro ao salvar ficha:', e)
      alert('Erro ao salvar ficha. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }, [buildFullPayload, user])

  const handleAutoSaveLimits = useCallback(async () => {
    if (!user) return
    if (!initialDataRef.current?.id) return
    try {
      const payload = buildLimitsPayload()
      const saved = await saveCharacter(user.id, payload as any)
      initialDataRef.current = saved.data
      onCharacterSaved?.(saved)
    } catch (e) {
      console.error('Erro ao salvar limites:', e)
    }
  }, [buildLimitsPayload, user])

  useEffect(() => {
    if (isEditing) {
      if (limitsAutoSaveTimeoutRef.current) {
        clearTimeout(limitsAutoSaveTimeoutRef.current)
        limitsAutoSaveTimeoutRef.current = null
      }
    }
  }, [isEditing])

  useEffect(() => {
    if (isEditing) return
    if (!userTriggeredLimitsRef.current) return
    userTriggeredLimitsRef.current = false

    if (limitsAutoSaveTimeoutRef.current) {
      clearTimeout(limitsAutoSaveTimeoutRef.current)
      limitsAutoSaveTimeoutRef.current = null
    }

    limitsAutoSaveTimeoutRef.current = window.setTimeout(() => {
      handleAutoSaveLimits()
    }, 600)
  }, [
    isEditing,
    characterData.corpo.atual,
    characterData.mente.atual,
    characterData.folego.atual,
    characterData.mana.atual,
    derivedValues.corpoMax,
    derivedValues.menteMax,
    handleAutoSaveLimits,
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
    <div className="h-full min-h-0 flex flex-col overflow-hidden overflow-x-hidden">
      <div className="flex-shrink-0">
        <Header onGoToDashboard={onBackToDashboard} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="py-6 px-3 sm:px-4 md:px-6">
          <div className="max-w-[1600px] mx-auto">
        {/* Layout em 3 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Sidebar Esquerda - Informações Principais */}
          <aside className="lg:col-span-3 space-y-5 min-w-0">
            {/* Atributos */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
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
                    <div key={attr.key} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-ecoar-light-900/10 last:border-0 min-w-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-ecoar-light-900 font-medium break-words min-w-0">{attr.label}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          value={nivel}
                          disabled={!isEditing}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0
                            updateField(`${attr.key}.nivel`, val)
                            updateField(`${attr.key}.mod`, getAttributeModifier(val))
                          }}
                          className="w-12 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
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
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
                Níveis
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-ecoar-light-900 font-medium">Alma</span>
                  <input
                    type="number"
                    value={nivelAlma}
                    disabled
                    className="w-16 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white/60 dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors opacity-90"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-ecoar-light-900 font-medium">Poder</span>
                  <input
                    type="number"
                    value={nivelPoder}
                    disabled
                    className="w-16 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white/60 dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors opacity-90"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-ecoar-light-900 font-medium">Trilha</span>
                  <input
                    type="number"
                    value={nivelTrilha}
                    disabled
                    className="w-16 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white/60 dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors opacity-90"
                  />
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-ecoar-light-900/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700 dark:text-ecoar-light-900 font-medium">Pontos Evolução</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={characterData.pontosEvolucao.atual}
                      disabled
                      className="flex-1 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white/60 dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors opacity-90"
                    />
                    <span className="text-slate-500 dark:text-ecoar-light-900/60">/</span>
                    <input
                      type="number"
                      value={characterData.pontosEvolucao.max}
                      disabled
                      className="flex-1 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white/60 dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors opacity-90"
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={peToAdd}
                      disabled={!isEditing}
                      onChange={(e) => {
                        const raw = e.target.value
                        if (raw === '') {
                          setPeToAdd('')
                          return
                        }
                        // Mantém controle como string para não “travar” em 0 durante digitação.
                        setPeToAdd(raw)
                      }}
                      placeholder="PE recebidos"
                      className="flex-1 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={!isEditing || peToAddNumber <= 0}
                      onClick={() => {
                        if (peToAddNumber <= 0) return
                        setCharacterData(prev => ({
                          ...prev,
                          pontosEvolucao: {
                            atual: Math.max(0, prev.pontosEvolucao.atual + peToAddNumber),
                            max: Math.max(0, prev.pontosEvolucao.max + peToAddNumber),
                          },
                        }))
                        setPeToAdd('')
                      }}
                      className="px-3 py-1.5 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 hover:bg-ecoar-teal/20 dark:hover:bg-ecoar-teal-600/20 disabled:opacity-50 text-ecoar-teal/90 dark:text-ecoar-teal-300/90 rounded-lg transition-all duration-200 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20"
                    >
                      Adicionar
                    </button>
                  </div>

                  {canEdit && !isEditing && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={characterData.pontosEvolucao.atual <= 0}
                        onClick={() => onOpenEvolution?.()}
                        className="flex-1 px-3 py-1.5 bg-ecoar-magenta/15 dark:bg-ecoar-magenta-600/15 hover:bg-ecoar-magenta/20 dark:hover:bg-ecoar-magenta-600/20 disabled:opacity-50 text-ecoar-magenta/90 dark:text-ecoar-magenta-300/90 rounded-lg transition-all duration-200 border border-ecoar-magenta/20 dark:border-ecoar-magenta-500/20"
                        title="Abrir tela para gastar Pontos de Evolução"
                      >
                        Evoluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Limites */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
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
                    <div key={limit.key} className="flex items-center justify-between py-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-ecoar-light-900 font-medium break-words min-w-0">{limit.label}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <input
                          type="number"
                          value={current.atual}
                          onChange={(e) => {
                            if (!isEditing) userTriggeredLimitsRef.current = true
                            updateField(`${limit.key}.atual`, parseInt(e.target.value) || 0)
                          }}
                          className="w-12 text-center text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
                        />
                        <span className="text-slate-500 dark:text-ecoar-light-900/60">/</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-ecoar-light-900 w-8 text-right">
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
          <main className="lg:col-span-6 space-y-5 min-w-0">
            {/* Header do Personagem */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5 min-w-0">
                <input
                  type="text"
                  value={characterData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 min-w-0 text-2xl font-semibold bg-transparent border-none text-slate-900 dark:text-ecoar-light-900/90 placeholder-slate-400 dark:placeholder-ecoar-light-900/50 focus:outline-none break-words"
                  placeholder="Nome do Personagem"
                />
                {canEdit && !isEditing && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="ml-4 px-3 py-1.5 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 hover:bg-ecoar-teal/20 dark:hover:bg-ecoar-teal-600/20 text-ecoar-teal/90 dark:text-ecoar-teal-300/90 rounded-lg transition-all duration-200 flex items-center gap-2 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20 shadow-sm"
                    title="Editar personagem"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">Editar</span>
                  </button>
                )}
                {canEdit && isEditing && (
                  <div className="ml-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 hover:bg-ecoar-teal/20 dark:hover:bg-ecoar-teal-600/20 text-ecoar-teal/90 dark:text-ecoar-teal-300/90 rounded-lg transition-all duration-200 flex items-center gap-2 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20 shadow-sm disabled:opacity-60"
                      title="Salvar alterações"
                    >
                      <span className="text-sm font-medium">Salvar</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-ecoar-light-900/70 rounded-lg transition-all duration-200 flex items-center gap-2 border border-slate-200/70 dark:border-slate-700/40 shadow-sm disabled:opacity-60"
                      title="Cancelar"
                    >
                      <span className="text-sm font-medium">Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-5">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-2">
                    Raça
                  </label>
                  <select
                    value={characterData.raca}
                    disabled={!isEditing}
                    onChange={(e) => {
                      updateField('raca', e.target.value)
                      applyRaceBonuses(e.target.value)
                    }}
                    className="w-full max-w-full min-w-0 px-4 py-2.5 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all disabled:opacity-50 shadow-sm"
                  >
                    <option value="">Selecione uma Raça</option>
                    {races.map((race) => (
                      <option key={race.id} value={race.id}>
                        {race.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-2">
                    Região
                  </label>
                  <select
                    value={characterData.localizacao}
                    disabled={!isEditing}
                    onChange={(e) => updateField('localizacao', e.target.value)}
                    className="w-full max-w-full min-w-0 px-4 py-2.5 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm"
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
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-2">
                    Trilha
                  </label>
                  <select
                    value={characterData.trilha}
                    disabled={!isEditing}
                    onChange={(e) => updateField('trilha', e.target.value)}
                    className="w-full max-w-full min-w-0 px-4 py-2.5 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm"
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
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
                Testes Comuns
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {(() => {
                  const sizeModifier = typeof characterData.tamanho === 'number' ? characterData.tamanho : 0
                  const weightModifier = typeof characterData.peso === 'number' ? characterData.peso : 0
                  const sizeWeightPenalty = -(sizeModifier + weightModifier)
                  const hasSizeWeightEffect = sizeModifier !== 0 || weightModifier !== 0
                  
                  return [
                  { key: 'arredores', label: 'Arredores', desc: 'Percepção + Atenção', value: derivedValues.commonTests.arredores },
                  { key: 'iniciativa', label: 'Iniciativa', desc: 'Percepção + Raciocínio', value: derivedValues.commonTests.iniciativa },
                    { 
                      key: 'esquiva', 
                      label: 'Esquiva', 
                      desc: hasSizeWeightEffect 
                        ? `Percepção + Reflexos ${sizeWeightPenalty >= 0 ? '+' : ''}${sizeWeightPenalty} (T/P)`
                        : 'Percepção + Reflexos', 
                      value: derivedValues.commonTests.esquiva 
                    },
                  { key: 'coragem', label: 'Coragem', desc: 'Vontade + Compostura', value: derivedValues.commonTests.coragem },
                  ]
                })().map((test) => (
                  <div key={test.key} className="text-center py-4 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 bg-ecoar-teal-50/50 dark:bg-ecoar-teal-900/30 rounded-lg overflow-hidden min-w-0">
                    <div className="text-xs font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-2 break-words px-2">
                      {test.label}
                    </div>
                    <div className="text-lg font-semibold text-ecoar-teal/90 dark:text-ecoar-teal-400/90 mb-0.5">
                      {formatModifier(test.value)}
                    </div>
                    <div className="text-xs text-ecoar-dark-700 dark:text-ecoar-light-900/80 break-words px-2">{test.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bônus de Raça */}
            {characterData.raca && (() => {
              const race = getRaceById(characterData.raca)
              if (!race?.bonuses) return null
              
              const sizeModifier = race.bonuses.sizeModifier ?? 0
              const weightModifier = race.bonuses.weightModifier ?? 0
              const hasManualBonuses = race.bonuses.attributes && Object.keys(race.bonuses.attributes).length > 0
              const hasAutoBonuses = sizeModifier !== 0 || weightModifier !== 0
              
              if (!hasManualBonuses && !hasAutoBonuses) return null
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
                >
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
                    Bônus de Raça
                  </h3>
                  <div className="space-y-3">
                    {/* Manual attribute bonuses */}
                    {hasManualBonuses && (
                      <div>
                        <div className="text-xs text-slate-600 dark:text-ecoar-light-900/70 mb-2">Atributos</div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(race.bonuses.attributes || {}).map(([attr, value]) => {
                            const attrNames: Record<string, string> = {
                              carisma: 'Carisma',
                              finesse: 'Finesse',
                              forca: 'Força',
                              inteligencia: 'Inteligência',
                              percepcao: 'Percepção',
                              vitalidade: 'Vitalidade',
                              vontade: 'Vontade',
                            }
                            return (
                              <span key={attr} className="text-xs px-2 py-1 rounded bg-ecoar-teal/20 dark:bg-ecoar-teal-600/30 text-ecoar-teal dark:text-ecoar-teal-300 border border-ecoar-teal/30 dark:border-ecoar-teal-500/40">
                                {attrNames[attr] || attr}: {value > 0 ? '+' : ''}{value}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Automatic bonuses from size and weight */}
                    {hasAutoBonuses && (
                      <div>
                        <div className="text-xs text-slate-600 dark:text-ecoar-light-900/70 mb-2">Modificadores Físicos</div>
                        <div className="space-y-2">
                          {sizeModifier !== 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 dark:text-ecoar-light-900/80">
                                Tamanho {sizeModifier}:
                              </span>
                              <span className="font-semibold text-ecoar-magenta dark:text-ecoar-magenta-300">
                                Força {sizeModifier > 0 ? '+' : ''}{sizeModifier}
                              </span>
                            </div>
                          )}
                          {weightModifier !== 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 dark:text-ecoar-light-900/80">
                                Peso {weightModifier}:
                              </span>
                              <span className="font-semibold text-ecoar-magenta dark:text-ecoar-magenta-300">
                                Vitalidade {weightModifier > 0 ? '+' : ''}{weightModifier}
                              </span>
                            </div>
                          )}
                          {(sizeModifier !== 0 || weightModifier !== 0) && (
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-ecoar-light-900/10">
                              <span className="text-slate-700 dark:text-ecoar-light-900/80">
                                Penalidade Esquiva:
                              </span>
                              <span className="font-semibold text-orange-600 dark:text-orange-400">
                                {formatModifier(-(sizeModifier + weightModifier))}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })()}

            {/* Deslocamentos e Sentidos */}
            <div className="grid grid-cols-2 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
              >
                <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
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
                      <div key={move.key} className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={characterData[move.key as keyof typeof characterData] as string}
                          disabled={!isEditing}
                          onChange={(e) => updateField(move.key, e.target.value)}
                          placeholder="0m"
                          className="flex-1 min-w-0 w-full max-w-full px-3 py-2 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
              >
                <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
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
                      <div key={sense.key} className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={characterData[sense.key as keyof typeof characterData] as string}
                          disabled={!isEditing}
                          onChange={(e) => updateField(sense.key, e.target.value)}
                          placeholder="0m"
                          className="flex-1 min-w-0 w-full max-w-full px-3 py-2 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </main>

          {/* Sidebar Direita - Informações Secundárias */}
          <aside className="lg:col-span-3 space-y-5 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/50 dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-white/[0.12] dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <div className="flex gap-2 border-b border-slate-200 dark:border-ecoar-light-900/20">
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('singularidades')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeSidebarTab === 'singularidades'
                      ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                      : 'text-slate-500 dark:text-ecoar-light-900/60 hover:text-slate-700 dark:hover:text-ecoar-light-900/80'
                  }`}
                >
                  Singularidades
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('equipamentos')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeSidebarTab === 'equipamentos'
                      ? 'text-ecoar-teal border-b-2 border-ecoar-teal'
                      : 'text-slate-500 dark:text-ecoar-light-900/60 hover:text-slate-700 dark:hover:text-ecoar-light-900/80'
                  }`}
                >
                  Equipamentos
                </button>
              </div>

              {activeSidebarTab === 'singularidades' && (
                <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {(() => {
                    const hasCreation = characterData.singularidades.length > 0
                    const hasEcoar = characterData.singularidadesEcoar.length > 0
                    const hasMartial = characterData.singularidadesMarciais.length > 0

                    const hasAny = hasCreation || hasEcoar || hasMartial
                    if (!hasAny) {
                      return (
                        <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                          Nenhuma singularidade selecionada.
                        </div>
                      )
                    }

                    const resolveNameById = (id: string) => {
                      return (
                        getCreationSingularityById(id)?.name ||
                        getEcoarSingularityById(id)?.name ||
                        getMartialSchoolSingularityById(id)?.name ||
                        getSingularityById(id)?.name ||
                        id
                      )
                    }

                    const getSimpleRequirementText = (req: any): string | undefined => {
                      if (!req) return undefined
                      const parts: string[] = []
                      if (req.previous) parts.push(`Requer: ${resolveNameById(req.previous)}`)
                      if (typeof req.nivelAlma === 'number' && !Number.isNaN(req.nivelAlma)) {
                        parts.push(`Nível de Alma ${req.nivelAlma}+`)
                      }
                      return parts.length ? parts.join(', ') : undefined
                    }

                    return (
                      <div className="space-y-4">
                        {hasCreation && (
                          <div className="space-y-3">
                            <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider">
                              Criação
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {characterData.singularidades.map((id) => {
                                const sing = getCreationSingularityById(id) || getSingularityById(id)
                                if (!sing) {
                                  return (
                                    <div key={id} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                                      Singularidade não encontrada: {id}
                                    </div>
                                  )
                                }

                                const restrictionsText =
                                  sing.requirements && sing.requirements.length > 0
                                    ? `Não pode possuir: ${sing.requirements
                                      .map((reqId) => resolveNameById(reqId))
                                      .join(', ')}`
                                    : undefined

                                return (
                                  <SingularityCard
                                    key={id}
                                    name={sing.name}
                                    description={sing.description}
                                    cost={sing.cost}
                                    isSelected={true}
                                    canAfford={true}
                                    canSelect={false}
                                    onClick={() => {}}
                                    variant="teal"
                                    requirementsText={restrictionsText}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {hasEcoar && (
                          <div className="space-y-3">
                            <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider">
                              Ecoar
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {characterData.singularidadesEcoar.map((id) => {
                                const sing = getEcoarSingularityById(id)
                                if (!sing) {
                                  return (
                                    <div key={id} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                                      Singularidade não encontrada: {id}
                                    </div>
                                  )
                                }

                                return (
                                  <SingularityCard
                                    key={id}
                                    name={sing.name}
                                    description={sing.description}
                                    cost={sing.cost}
                                    costLabel="PC"
                                    secondaryCost={sing.cost === 0 ? 'Inata' : undefined}
                                    effects={sing.effects || undefined}
                                    isSelected={true}
                                    canAfford={true}
                                    canSelect={false}
                                    onClick={() => {}}
                                    variant="teal"
                                    requirementsText={getSimpleRequirementText(sing.requirements)}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {hasMartial && (
                          <div className="space-y-3">
                            <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider">
                              Marciais
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {characterData.singularidadesMarciais.map((id) => {
                                const sing = getMartialSchoolSingularityById(id)
                                if (!sing) {
                                  return (
                                    <div key={id} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                                      Singularidade não encontrada: {id}
                                    </div>
                                  )
                                }

                                return (
                                  <SingularityCard
                                    key={id}
                                    name={sing.name}
                                    description={sing.description}
                                    cost={sing.cost * 10}
                                    costLabel="PC"
                                    secondaryCost={`${sing.cost} PE`}
                                    level={sing.level}
                                    effects={sing.effects || undefined}
                                    isSelected={true}
                                    canAfford={true}
                                    canSelect={false}
                                    onClick={() => {}}
                                    variant="teal"
                                    requirementsText={getSimpleRequirementText(sing.requirements)}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}

              {activeSidebarTab === 'equipamentos' && (
                <div className="mt-4 space-y-3">
                  {(() => {
                    const sheetUsesStructuredEquip =
                      characterData.itensCatalogo.length > 0 ||
                      characterData.equipamentosLivresText.trim() !== '' ||
                      characterData.armasLivresText.trim() !== ''

                    return (
                      <>
                        <div className="p-3 bg-slate-50 dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 space-y-2">
                          <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90">Saldo (ceros)</div>
                          <input
                            type="number"
                            min={0}
                            disabled={!isEditing}
                            value={characterData.saldoMoedas}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10)
                              updateField('saldoMoedas', Number.isFinite(n) ? Math.max(0, n) : 0)
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-sm text-ecoar-dark-900 dark:text-ecoar-light-900 disabled:opacity-60"
                          />
                          <p className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55">
                            Exibido também como {formatCerosDisplay(characterData.saldoMoedas)}
                          </p>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => setEquipmentPickerOpen(true)}
                              className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-semibold bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border border-ecoar-teal-500/30"
                            >
                              Abrir catálogo (compra)
                            </button>
                          )}
                          <Link
                            href="/referencia/aquisicao-equipamentos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs inline-flex items-center gap-1 text-ecoar-teal-600 dark:text-ecoar-teal-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            Referência completa (nova aba)
                          </Link>
                        </div>

                        {sheetUsesStructuredEquip ? (
                          <>
                            {characterData.itensCatalogo.length > 0 && (
                              <div className="p-3 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 space-y-2">
                                <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90">Do catálogo</div>
                                <ul className="space-y-1.5 text-xs">
                                  {characterData.itensCatalogo.map((item) => (
                                    <li
                                      key={item.instanceId}
                                      className="flex items-start justify-between gap-2 py-1.5 px-2 rounded-md bg-white dark:bg-ecoar-dark-800/50 border border-slate-100 dark:border-ecoar-light-900/10"
                                    >
                                      <span className="text-slate-800 dark:text-ecoar-light-900/85 break-words">{item.displayLine}</span>
                                      {isEditing && (
                                        <button
                                          type="button"
                                          onClick={() => removeSheetCatalogItem(item.instanceId)}
                                          className="shrink-0 text-ecoar-magenta text-[11px] hover:underline"
                                        >
                                          Remover
                                        </button>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 mb-1">
                                Outros equipamentos (uma linha por item)
                              </div>
                              <textarea
                                value={characterData.equipamentosLivresText}
                                disabled={!isEditing}
                                onChange={(e) => updateField('equipamentosLivresText', e.target.value)}
                                placeholder="Itens fora do catálogo…"
                                className="w-full max-w-full min-w-0 h-28 px-3 py-2 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm resize-none focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 disabled:opacity-60"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 mb-1">
                                Outras armas (uma linha por item)
                              </div>
                              <textarea
                                value={characterData.armasLivresText}
                                disabled={!isEditing}
                                onChange={(e) => updateField('armasLivresText', e.target.value)}
                                placeholder="Armas fora do catálogo…"
                                className="w-full max-w-full min-w-0 h-28 px-3 py-2 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm resize-none focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 disabled:opacity-60"
                              />
                            </div>
                          </>
                        ) : (
                          <textarea
                            value={characterData.equipamentos}
                            disabled={!isEditing}
                            onChange={(e) => updateField('equipamentos', e.target.value)}
                            placeholder="Liste seus equipamentos..."
                            className="w-full max-w-full min-w-0 h-64 px-4 py-3 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm resize-none focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm break-words disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        )}

                        {equipmentPickerOpen && (
                          <div className="fixed inset-0 z-[100] flex flex-col bg-black/50 p-2 sm:p-4 md:p-6">
                            <div className="mx-auto w-full max-w-4xl flex flex-col min-h-0 flex-1 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-dark-900 shadow-xl overflow-hidden">
                              <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-ecoar-light-900/15 bg-white dark:bg-ecoar-dark-800/80">
                                <span className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">
                                  Catálogo de aquisição
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEquipmentPickerOpen(false)}
                                  className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10"
                                >
                                  Fechar
                                </button>
                              </div>
                              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
                                <EquipmentCatalogBrowser
                                  mode="picker"
                                  urlSync={false}
                                  saldoDisponivel={characterData.saldoMoedas}
                                  onPickItem={handleEquipmentCatalogPick}
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
                      </>
                    )
                  })()}
                </div>
              )}
            </motion.div>

            {/* Anotações */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-ecoar-dark-800/70 backdrop-blur-sm border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
                Anotações
              </h3>
              <textarea
                value={characterData.anotacoes}
                disabled={!isEditing}
                onChange={(e) => updateField('anotacoes', e.target.value)}
                placeholder="Anotações gerais..."
                className="w-full max-w-full min-w-0 h-64 px-4 py-3 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm resize-none focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm break-words disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </motion.div>
          </aside>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
