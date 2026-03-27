'use client'

import { Fragment, useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/motionVariants'
import {
  User, Sparkles, Shield, Heart, Brain, Zap, Eye, Navigation,
  TrendingUp, Sword, BookOpen, Package, FileText, Target,
  Waves, Wind, Edit
} from 'lucide-react'
import {
  getAttributeModifier,
  getSkillDice,
  getAptitudeDice,
  calculateCorpoMax,
  calculateMenteMax,
  calculateFolegoMax,
  calculateManaMax,
  calculateCommonTests,
  formatModifier,
} from '@/lib/calculations'
import { skills as skillsDefinitions } from '@/data/skills'
import { aptitudes as aptitudesDefinitions } from '@/data/aptitudes'
import { races, getRaceById } from '@/data/races'
import { paths, getPathById } from '@/data/paths'
import { locations, getLocationById, getLocationsByNation, getAllNations } from '@/data/locations'
import SingularityCard from '@/components/ui/SingularityCard'
import { getCreationSingularityById } from '@/data/creationSingularities'
import { getSingularityById } from '@/data/singularities'
import { getMartialSchoolSingularityById } from '@/data/martialSchoolSingularities'
import { getPathLevelFromSoulLevel } from '@/data/pathSingularities'
import { getSoulLevelByNivel, getSoulLevelByPontosEvolucao } from '@/data/soulLevels'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { aggregateSimpleBonuses } from '@/lib/singularityBonuses'
import {
  aggregateBookDisadvantagePenalties,
  aggregateSingularityInputFromCharacterData,
  CHARACTER_ATTRIBUTE_KEYS,
  computeEffectiveAttributeRows,
} from '@/lib/characterBonuses'
import { buildSystemSingularities } from '@/lib/systemSingularities'
import type { SystemSingularityKind } from '@/lib/systemSingularities'
import { aggregateRacialRulesBySelectedIds } from '@/lib/racialRules'
import { getRacialSingularityById, pruneRacialSingularitiesToValidRequirements } from '@/data/racialSingularities'
import {
  ARMOR_RESISTANCE_KEYS,
  type ArmorCatalogEntry,
  type ArmorResistanceKey,
  type ArmorResistanceValues,
  type CatalogEntry,
  type CatalogOwnedItem,
  type UtilityCatalogEntry,
  type WeaponCatalogEntry,
} from '@/types/equipment'
import EquipmentCatalogBrowser from '@/components/equipment/EquipmentCatalogBrowser'
import SystemSingularityCatalogBrowser from '@/components/singularities/SystemSingularityCatalogBrowser'
import PlayerSingularitiesViewer from '@/components/singularities/PlayerSingularitiesViewer'
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

const normalizeAttackTestText = (input: string): string => {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const ATTRIBUTE_KEY_BY_ATTACK_TEST_LABEL: Record<string, AttributeStateKey> = {
  carisma: 'carisma',
  finesse: 'finesse',
  forca: 'forca',
  inteligencia: 'inteligencia',
  percepcao: 'percepcao',
  vitalidade: 'vitalidade',
  vontade: 'vontade',
}

interface CharacterSheetProps {
  initialData?: any
  canEdit?: boolean
  isTableGmEditor?: boolean
  onBackToDashboard?: () => void
  onOpenEvolution?: () => void
  onCharacterSaved?: (saved: any) => void
}

type EquippedWeaponSlotId = 'slot1' | 'slot2'

type EquippedWeaponOverrides = {
  attackText?: string
  rangeText?: string
  damageText?: string
  extrasText?: string
}

type EquippedWeaponState = {
  instanceId: string
  attackBonus?: number
  critBonus?: number
  damageBonus?: number
  overrides?: EquippedWeaponOverrides
}

type EquippedArmorState = {
  instanceId: string
}

type CharacterSkillState = Record<string, { level: number; specialization?: string }>
type CharacterAptitudesState = Record<string, number>

export default function CharacterSheet({
  initialData,
  canEdit,
  isTableGmEditor = false,
  onBackToDashboard,
  onOpenEvolution,
  onCharacterSaved,
}: CharacterSheetProps) {
  const { getEcoarSingularityById, ecoarSingularities } = useEcoarCatalogData()
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
    equippedWeapons: {
      slot1: undefined as EquippedWeaponState | undefined,
      slot2: undefined as EquippedWeaponState | undefined,
    },
    equippedArmor: undefined as EquippedArmorState | undefined,
    equippedAccessories: [] as EquippedArmorState[],
    hasVestuarioEquipState: false,
    skills: {} as CharacterSkillState,
    aptitudes: {} as CharacterAptitudesState,
    equipamentosLivresText: '',
    armasLivresText: '',
    espacos: '',
    anotacoes: '',

    // Singularities (IDs selected in the wizard)
    singularidades: [] as string[],
    singularidadesEcoar: [] as string[],
    singularidadesCondicionaisAtivas: [] as string[],
    singularidadesCondicionaisCriacaoAtivas: [] as string[],
    singularidadesMarciais: [] as string[],
    singularidadesCondicionaisMarciaisAtivas: [] as string[],
    singularidadesCondicionaisRaciaisAtivas: [] as string[],
    singularidadesRaciais: [] as string[],
    desvantagens: [] as string[],
  })

  const { user } = useAuth()
  const { weapons, armor, utilities, multiplierTables } = useEquipmentCatalog()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const hasMasterOverride = isTableGmEditor
  const canEditSheet = !!canEdit || hasMasterOverride
  const editBackupRef = useRef<typeof characterData | null>(null)
  const initialDataRef = useRef<any>(initialData)
  const limitsAutoSaveTimeoutRef = useRef<number | null>(null)
  const userTriggeredLimitsRef = useRef(false)

  const [activeSidebarTab, setActiveSidebarTab] = useState<'singularidades' | 'equipamentos'>('equipamentos')
  const [equipmentSubTab, setEquipmentSubTab] = useState<'inventario' | 'equipados'>('inventario')
  const [equipmentPickerOpen, setEquipmentPickerOpen] = useState(false)
  const [singularityPickerOpen, setSingularityPickerOpen] = useState(false)
  const [peToAdd, setPeToAdd] = useState<string>('')

  const peToAddNumber = useMemo(() => {
    const n = parseInt(peToAdd, 10)
    return Number.isFinite(n) ? n : 0
  }, [peToAdd])

  const weaponCatalogById = useMemo(() => {
    const map = new Map<string, WeaponCatalogEntry>()
    ;(weapons ?? []).forEach((w: any) => {
      if (w?.id) map.set(String(w.id), w as WeaponCatalogEntry)
    })
    return map
  }, [weapons])

  const armorCatalogById = useMemo(() => {
    const map = new Map<string, CatalogEntry>()
    ;(armor ?? []).forEach((a: any) => {
      if (a?.id) map.set(String(a.id), a as CatalogEntry)
    })
    return map
  }, [armor])

  const utilityCatalogById = useMemo(() => {
    const map = new Map<string, CatalogEntry>()
    ;(utilities ?? []).forEach((u: any) => {
      if (u?.id) map.set(String(u.id), u as CatalogEntry)
    })
    return map
  }, [utilities])

  /** Soma `mechanicalBonuses` de armas/armaduras/utilitários atualmente equipados. */
  const equipmentMechanicalBonuses = useMemo(() => {
    const sumAttr: Record<string, number> = {}
    const sumSkills: Record<string, number> = {}
    const add = (
      entry:
        | {
            mechanicalBonuses?: { attributes?: Record<string, number>; skills?: Record<string, number> }
          }
        | undefined,
    ) => {
      if (!entry?.mechanicalBonuses) return
      for (const [k, v] of Object.entries(entry.mechanicalBonuses.attributes ?? {})) {
        sumAttr[k] = (sumAttr[k] ?? 0) + v
      }
      for (const [k, v] of Object.entries(entry.mechanicalBonuses.skills ?? {})) {
        sumSkills[k] = (sumSkills[k] ?? 0) + v
      }
    }
    const findOwned = (instanceId: string) =>
      characterData.itensCatalogo.find((i) => i.instanceId === instanceId)
    for (const slot of [characterData.equippedWeapons?.slot1, characterData.equippedWeapons?.slot2]) {
      if (!slot?.instanceId) continue
      const owned = findOwned(slot.instanceId)
      if (owned?.kind === 'weapon') add(weaponCatalogById.get(String(owned.catalogId)) as WeaponCatalogEntry | undefined)
    }
    if (characterData.equippedArmor?.instanceId) {
      const owned = findOwned(characterData.equippedArmor.instanceId)
      if (owned?.kind === 'armor')
        add(armorCatalogById.get(String(owned.catalogId)) as ArmorCatalogEntry | undefined)
    }
    for (const acc of characterData.equippedAccessories ?? []) {
      const owned = findOwned(acc.instanceId)
      if (!owned) continue
      if (owned.kind === 'armor') add(armorCatalogById.get(String(owned.catalogId)) as ArmorCatalogEntry | undefined)
      else if (owned.kind === 'utility')
        add(utilityCatalogById.get(String(owned.catalogId)) as UtilityCatalogEntry | undefined)
    }
    return { attributes: sumAttr, skills: sumSkills }
  }, [
    armorCatalogById,
    characterData.equippedAccessories,
    characterData.equippedArmor,
    characterData.equippedWeapons,
    characterData.itensCatalogo,
    utilityCatalogById,
    weaponCatalogById,
  ])

  const skillsByNormalizedName = useMemo(() => {
    const map = new Map<string, (typeof skillsDefinitions)[number]>()
    skillsDefinitions.forEach((skill) => {
      map.set(normalizeAttackTestText(skill.name), skill)
    })
    return map
  }, [])

  const aptitudesByNormalizedLabel = useMemo(() => {
    const map = new Map<string, (typeof aptitudesDefinitions)[number]>()
    aptitudesDefinitions.forEach((apt) => {
      map.set(normalizeAttackTestText(apt.name), apt)
      map.set(normalizeAttackTestText(apt.id), apt)
    })
    return map
  }, [])

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

        // Initialize combat skills + aptitudes (used for weapon attack calculations)
        if (initialData.skills && typeof initialData.skills === 'object') {
          updated.skills = initialData.skills as CharacterSkillState
        }
        if (initialData.aptitudes && typeof initialData.aptitudes === 'object') {
          updated.aptitudes = initialData.aptitudes as CharacterAptitudesState
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

        // Equipped weapons (new, optional)
        const eq = (initialData as any).equippedWeapons
        if (eq && typeof eq === 'object') {
          const slot1 = (eq as any).slot1
          const slot2 = (eq as any).slot2
          updated.equippedWeapons = {
            slot1: slot1 && typeof slot1 === 'object' && typeof slot1.instanceId === 'string' ? (slot1 as EquippedWeaponState) : undefined,
            slot2: slot2 && typeof slot2 === 'object' && typeof slot2.instanceId === 'string' ? (slot2 as EquippedWeaponState) : undefined,
          }
        } else {
          updated.equippedWeapons = { slot1: undefined, slot2: undefined }
        }

        const eqArmor = (initialData as any).equippedArmor
        const hasEquippedArmorKey = Object.prototype.hasOwnProperty.call(initialData, 'equippedArmor')
        const hasEquippedAccessoriesKey = Object.prototype.hasOwnProperty.call(initialData, 'equippedAccessories')
        if (eqArmor && typeof eqArmor === 'object' && typeof (eqArmor as any).instanceId === 'string') {
          updated.equippedArmor = { instanceId: (eqArmor as any).instanceId }
        } else {
          updated.equippedArmor = undefined
        }

        const eqAccessories = (initialData as any).equippedAccessories
        if (Array.isArray(eqAccessories)) {
          updated.equippedAccessories = eqAccessories
            .filter((it) => it && typeof it === 'object' && typeof (it as any).instanceId === 'string')
            .map((it) => ({ instanceId: (it as any).instanceId }))
        } else {
          updated.equippedAccessories = []
        }
        updated.hasVestuarioEquipState = hasEquippedArmorKey || hasEquippedAccessoriesKey

        // Singularities selected in the wizard
        if (initialData.singularidades) {
          updated.singularidades = initialData.singularidades
        }
        if (initialData.singularidadesEcoar) {
          updated.singularidadesEcoar = initialData.singularidadesEcoar
        }
        if (Array.isArray((initialData as any).singularidadesCondicionaisAtivas)) {
          updated.singularidadesCondicionaisAtivas = (initialData as any).singularidadesCondicionaisAtivas
        }
        if (Array.isArray((initialData as any).singularidadesCondicionaisCriacaoAtivas)) {
          updated.singularidadesCondicionaisCriacaoAtivas = (initialData as any).singularidadesCondicionaisCriacaoAtivas
        }
        if (initialData.singularidadesMarciais) {
          updated.singularidadesMarciais = initialData.singularidadesMarciais
        }
        if (Array.isArray((initialData as any).singularidadesCondicionaisMarciaisAtivas)) {
          updated.singularidadesCondicionaisMarciaisAtivas = (initialData as any).singularidadesCondicionaisMarciaisAtivas
        }
        if (Array.isArray((initialData as any).singularidadesCondicionaisRaciaisAtivas)) {
          updated.singularidadesCondicionaisRaciaisAtivas = (initialData as any).singularidadesCondicionaisRaciaisAtivas
        }
        if (initialData.singularidadesRaciais) {
          updated.singularidadesRaciais = initialData.singularidadesRaciais
        }
        if (Array.isArray((initialData as any).desvantagens)) {
          updated.desvantagens = (initialData as any).desvantagens
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

  useEffect(() => {
    setCharacterData((prev) => {
      const ownedIds = new Set(prev.itensCatalogo.map((i) => i.instanceId))
      const s1 = prev.equippedWeapons?.slot1
      const s2 = prev.equippedWeapons?.slot2
      const n1 = s1 && ownedIds.has(s1.instanceId) ? s1 : undefined
      const n2 = s2 && ownedIds.has(s2.instanceId) ? s2 : undefined
      const armorState = prev.equippedArmor
      const nextArmor = armorState && ownedIds.has(armorState.instanceId) ? armorState : undefined
      const nextAccessories = (prev.equippedAccessories ?? []).filter((it) => ownedIds.has(it.instanceId))
      const accessoriesUnchanged =
        nextAccessories.length === (prev.equippedAccessories ?? []).length &&
        nextAccessories.every((it, idx) => it.instanceId === (prev.equippedAccessories ?? [])[idx]?.instanceId)
      if (n1 === s1 && n2 === s2 && nextArmor === armorState && accessoriesUnchanged) return prev
      return {
        ...prev,
        equippedWeapons: { slot1: n1, slot2: n2 },
        equippedArmor: nextArmor,
        equippedAccessories: nextAccessories,
      }
    })
  }, [characterData.itensCatalogo])

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

  const handleToggleSystemSingularity = useCallback(
    (args: { id: string; kind: SystemSingularityKind; selected: boolean; cost: number }) => {
      const { id, kind, selected, cost } = args

      setCharacterData((prev) => {
        // Prevent edits when modal is open but user can't edit.
        if (!canEditSheet) return prev

        const currentAtuais = prev.pontosEvolucao.atual ?? 0
        const alreadySelected =
          kind === 'criacao'
            ? prev.singularidades.includes(id)
            : kind === 'ecoar'
              ? prev.singularidadesEcoar.includes(id)
              : kind === 'marcial'
                ? prev.singularidadesMarciais.includes(id)
                : prev.singularidadesRaciais.includes(id)

        if (selected && alreadySelected) return prev
        if (!selected && !alreadySelected) return prev

        const delta = selected ? -cost : cost
        const nextAtuais = cost > 0 ? currentAtuais + delta : currentAtuais

        if (selected && cost > 0 && currentAtuais < cost) return prev
        if (!selected && delta < 0) return prev

        if (selected) {
          if (kind === 'criacao') {
            const nextSelected = [...prev.singularidades, id]
            // Ao selecionar, começamos com condição DESLIGADA; checkbox [X] é um ato separado.
            const nextCond = prev.singularidadesCondicionaisCriacaoAtivas.filter((it) => it !== id)
            return {
              ...prev,
              pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuais },
              singularidades: nextSelected,
              singularidadesCondicionaisCriacaoAtivas: nextCond,
            }
          }

          if (kind === 'ecoar') {
            const nextSelected = [...prev.singularidadesEcoar, id]
            const nextCond = prev.singularidadesCondicionaisAtivas.filter((it) => it !== id)
            return {
              ...prev,
              pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuais },
              singularidadesEcoar: nextSelected,
              singularidadesCondicionaisAtivas: nextCond,
            }
          }

          if (kind === 'marcial') {
            const nextSelected = [...prev.singularidadesMarciais, id]
            const nextCond = prev.singularidadesCondicionaisMarciaisAtivas.filter((it) => it !== id)
            return {
              ...prev,
              pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuais },
              singularidadesMarciais: nextSelected,
              singularidadesCondicionaisMarciaisAtivas: nextCond,
            }
          }

          const nextCondRacial = prev.singularidadesCondicionaisRaciaisAtivas.filter((it) => it !== id)
          return {
            ...prev,
            pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuais },
            singularidadesRaciais: [...prev.singularidadesRaciais, id],
            singularidadesCondicionaisRaciaisAtivas: nextCondRacial,
          }
        }

        // Unselect: refund + clear conditional.
        if (kind === 'racial') {
          const prevRacial = prev.singularidadesRaciais
          const nextRacial = pruneRacialSingularitiesToValidRequirements(prevRacial.filter((it) => it !== id))
          const removed = prevRacial.filter((x) => !nextRacial.includes(x))
          const totalRefund = removed.reduce((sum, rid) => sum + (getRacialSingularityById(rid)?.cost ?? 0), 0)
          const nextAtuaisRacial = totalRefund > 0 ? currentAtuais + totalRefund : currentAtuais
          const nextCondRacial = prev.singularidadesCondicionaisRaciaisAtivas.filter((cid) => !removed.includes(cid))
          return {
            ...prev,
            pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuaisRacial },
            singularidadesRaciais: nextRacial,
            singularidadesCondicionaisRaciaisAtivas: nextCondRacial,
          }
        }

        if (kind === 'criacao') {
          const nextSelected = prev.singularidades.filter((it) => it !== id)
          const nextCond = prev.singularidadesCondicionaisCriacaoAtivas.filter((it) => it !== id)
          return {
            ...prev,
            pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuais },
            singularidades: nextSelected,
            singularidadesCondicionaisCriacaoAtivas: nextCond,
          }
        }

        if (kind === 'ecoar') {
          const nextSelected = prev.singularidadesEcoar.filter((it) => it !== id)
          const nextCond = prev.singularidadesCondicionaisAtivas.filter((it) => it !== id)
          return {
            ...prev,
            pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuais },
            singularidadesEcoar: nextSelected,
            singularidadesCondicionaisAtivas: nextCond,
          }
        }

        if (kind === 'marcial') {
          const nextSelected = prev.singularidadesMarciais.filter((it) => it !== id)
          const nextCond = prev.singularidadesCondicionaisMarciaisAtivas.filter((it) => it !== id)
          return {
            ...prev,
            pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuais },
            singularidadesMarciais: nextSelected,
            singularidadesCondicionaisMarciaisAtivas: nextCond,
          }
        }

        return prev
      })
    },
    [canEditSheet],
  )

  const handleToggleConditionalSystemSingularity = useCallback(
    (args: { id: string; kind: SystemSingularityKind; enabled: boolean }) => {
      const { id, kind, enabled } = args
      setCharacterData((prev) => {
        if (!canEditSheet) return prev

        if (kind === 'criacao') {
          if (!prev.singularidades.includes(id)) return prev
          return {
            ...prev,
            singularidadesCondicionaisCriacaoAtivas: enabled
              ? [...prev.singularidadesCondicionaisCriacaoAtivas.filter((it) => it !== id), id]
              : prev.singularidadesCondicionaisCriacaoAtivas.filter((it) => it !== id),
          }
        }

        if (kind === 'ecoar') {
          if (!prev.singularidadesEcoar.includes(id)) return prev
          return {
            ...prev,
            singularidadesCondicionaisAtivas: enabled
              ? [...prev.singularidadesCondicionaisAtivas.filter((it) => it !== id), id]
              : prev.singularidadesCondicionaisAtivas.filter((it) => it !== id),
          }
        }

        if (kind === 'marcial') {
          if (!prev.singularidadesMarciais.includes(id)) return prev
          return {
            ...prev,
            singularidadesCondicionaisMarciaisAtivas: enabled
              ? [...prev.singularidadesCondicionaisMarciaisAtivas.filter((it) => it !== id), id]
              : prev.singularidadesCondicionaisMarciaisAtivas.filter((it) => it !== id),
          }
        }

        if (kind === 'racial') {
          if (!prev.singularidadesRaciais.includes(id)) return prev
          return {
            ...prev,
            singularidadesCondicionaisRaciaisAtivas: enabled
              ? [...prev.singularidadesCondicionaisRaciaisAtivas.filter((it) => it !== id), id]
              : prev.singularidadesCondicionaisRaciaisAtivas.filter((it) => it !== id),
          }
        }

        return prev
      })
    },
    [canEditSheet],
  )

  const removeSheetCatalogItem = useCallback((instanceId: string) => {
    setCharacterData((prev) => {
      const item = prev.itensCatalogo.find((i) => i.instanceId === instanceId)
      const next = prev.itensCatalogo.filter((i) => i.instanceId !== instanceId)
      const refund = item?.custoCeros ?? 0
      const nextEquipped = {
        slot1: prev.equippedWeapons?.slot1?.instanceId === instanceId ? undefined : prev.equippedWeapons?.slot1,
        slot2: prev.equippedWeapons?.slot2?.instanceId === instanceId ? undefined : prev.equippedWeapons?.slot2,
      }
      const nextArmor = prev.equippedArmor?.instanceId === instanceId ? undefined : prev.equippedArmor
      const nextAccessories = (prev.equippedAccessories ?? []).filter((it) => it.instanceId !== instanceId)
      return {
        ...prev,
        itensCatalogo: next,
        saldoMoedas: prev.saldoMoedas + refund,
        equippedWeapons: nextEquipped,
        equippedArmor: nextArmor,
        equippedAccessories: nextAccessories,
      }
    })
  }, [])

  const findEquippedSlotForInstance = useCallback(
    (instanceId: string): EquippedWeaponSlotId | null => {
      if (characterData.equippedWeapons?.slot1?.instanceId === instanceId) return 'slot1'
      if (characterData.equippedWeapons?.slot2?.instanceId === instanceId) return 'slot2'
      return null
    },
    [characterData.equippedWeapons],
  )

  const setEquippedWeaponSlot = useCallback((slot: EquippedWeaponSlotId, next: EquippedWeaponState | undefined) => {
    setCharacterData((prev) => {
      const otherSlot: EquippedWeaponSlotId = slot === 'slot1' ? 'slot2' : 'slot1'
      const other =
        next && prev.equippedWeapons?.[otherSlot]?.instanceId === next.instanceId ? undefined : prev.equippedWeapons?.[otherSlot]
      return {
        ...prev,
        equippedWeapons: {
          slot1: slot === 'slot1' ? next : other,
          slot2: slot === 'slot2' ? next : other,
        },
      }
    })
  }, [])

  const toggleEquipWeaponInstance = useCallback(
    (instanceId: string, shouldEquip: boolean) => {
      if (!instanceId) return
      if (!shouldEquip) {
        const slot = findEquippedSlotForInstance(instanceId)
        if (slot) setEquippedWeaponSlot(slot, undefined)
        return
      }

      setCharacterData((prev) => {
        const alreadySlot1 = prev.equippedWeapons?.slot1?.instanceId === instanceId
        const alreadySlot2 = prev.equippedWeapons?.slot2?.instanceId === instanceId
        if (alreadySlot1 || alreadySlot2) return prev

        const existing1 = prev.equippedWeapons?.slot1
        const existing2 = prev.equippedWeapons?.slot2
        const nextState: EquippedWeaponState = { instanceId }

        if (!existing1) {
          return { ...prev, equippedWeapons: { slot1: nextState, slot2: existing2 } }
        }
        return { ...prev, equippedWeapons: { slot1: existing1, slot2: nextState } }
      })
    },
    [findEquippedSlotForInstance, setEquippedWeaponSlot],
  )

  const isArmorCatalogItem = useCallback(
    (item: CatalogOwnedItem) => {
      if (item.kind !== 'armor') return false
      const entry = armorCatalogById.get(String(item.catalogId)) as ArmorCatalogEntry | undefined
      return !!entry && entry.vestuarioTab !== 'acessorios'
    },
    [armorCatalogById],
  )

  const isAccessoryCatalogItem = useCallback(
    (item: CatalogOwnedItem) => {
      if (item.kind !== 'armor') return false
      const entry = armorCatalogById.get(String(item.catalogId)) as ArmorCatalogEntry | undefined
      return !!entry && entry.vestuarioTab === 'acessorios'
    },
    [armorCatalogById],
  )

  const toggleEquipArmorInstance = useCallback((instanceId: string, shouldEquip: boolean) => {
    if (!instanceId) return
    setCharacterData((prev) => ({
      ...prev,
      hasVestuarioEquipState: true,
      equippedArmor: shouldEquip ? { instanceId } : prev.equippedArmor?.instanceId === instanceId ? undefined : prev.equippedArmor,
    }))
  }, [])

  const toggleEquipAccessoryInstance = useCallback((instanceId: string, shouldEquip: boolean) => {
    if (!instanceId) return
    setCharacterData((prev) => {
      const current = prev.equippedAccessories ?? []
      const already = current.some((it) => it.instanceId === instanceId)
      if (shouldEquip && !already) {
        return { ...prev, hasVestuarioEquipState: true, equippedAccessories: [...current, { instanceId }] }
      }
      if (!shouldEquip && already) {
        return { ...prev, hasVestuarioEquipState: true, equippedAccessories: current.filter((it) => it.instanceId !== instanceId) }
      }
      return prev
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
    // Anão ignora penalidade racial de Força vinda do tamanho.
    if (sizeModifier !== 0 && !(race.id === 'anao' && sizeModifier < 0)) {
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

  const systemSingularities = useMemo(() => buildSystemSingularities(ecoarSingularities), [ecoarSingularities])
  const systemSingularityById = useMemo(() => {
    const map = new Map<string, (typeof systemSingularities)[number]>()
    for (const s of systemSingularities) map.set(s.id, s)
    return map
  }, [systemSingularities])

  const singularityBonuses = useMemo(
    () =>
      aggregateSimpleBonuses({
        ...aggregateSingularityInputFromCharacterData(characterData),
        getSystemSingularityById: (id) => systemSingularityById.get(id),
      }),
    [
      characterData.singularidades,
      characterData.singularidadesCondicionaisCriacaoAtivas,
      characterData.singularidadesEcoar,
      characterData.singularidadesCondicionaisAtivas,
      characterData.singularidadesMarciais,
      characterData.singularidadesCondicionaisMarciaisAtivas,
      characterData.singularidadesCondicionaisRaciaisAtivas,
      characterData.singularidadesRaciais,
      systemSingularityById,
    ]
  )

  const bookDisadvantageBonuses = useMemo(
    () => aggregateBookDisadvantagePenalties((characterData as { desvantagens?: string[] }).desvantagens ?? []),
    [(characterData as { desvantagens?: string[] }).desvantagens],
  )

  /** Nível armazenado na ficha já inclui raça e escola marcial (criação); singularidades, desvantagens do livro e equipamento somam para mod efetivo. */
  const effectiveAttributesByKey = useMemo(() => {
    const attrsOnly = Object.fromEntries(
      CHARACTER_ATTRIBUTE_KEYS.map((k) => {
        const row = characterData[k as keyof typeof characterData] as { nivel?: number | string } | undefined
        return [k, { nivel: row?.nivel }]
      }),
    ) as Record<string, { nivel?: number | string }>
    const bookAttr = bookDisadvantageBonuses.attributes as Partial<
      Record<(typeof CHARACTER_ATTRIBUTE_KEYS)[number], number>
    >
    return computeEffectiveAttributeRows(
      attrsOnly,
      singularityBonuses,
      equipmentMechanicalBonuses.attributes as Record<string, number>,
      bookAttr,
    )
  }, [characterData, singularityBonuses, equipmentMechanicalBonuses.attributes, bookDisadvantageBonuses])

  const racialRules = useMemo(
    () =>
      aggregateRacialRulesBySelectedIds(
        characterData.singularidadesRaciais,
        getSoulLevelByPontosEvolucao(characterData.pontosEvolucao.max).nivelPoder,
      ),
    [characterData.singularidadesRaciais, characterData.pontosEvolucao.max],
  )

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
    const sizeWeightPenalty = -(sizeModifier + weightModifier) + racialRules.dodgeBonus

    const eqSkills = equipmentMechanicalBonuses.skills
    const book = bookDisadvantageBonuses
    const atencaoBonus =
      (singularityBonuses.skills.atencao ?? 0) + (eqSkills.atencao ?? 0) + (book.skills.atencao ?? 0)
    const raciocinioBonus =
      (singularityBonuses.skills.raciocinio ?? 0) + (eqSkills.raciocinio ?? 0) + (book.skills.raciocinio ?? 0)
    const reflexosBonus =
      (singularityBonuses.skills.reflexos ?? 0) + (eqSkills.reflexos ?? 0) + (book.skills.reflexos ?? 0)
    const composturaBonus =
      (singularityBonuses.skills.compostura ?? 0) + (eqSkills.compostura ?? 0) + (book.skills.compostura ?? 0)

    // Apply simple attribute bonuses from selected passivas/condicionais + equipamento + desvantagens do livro.
    // This keeps underlying base stats intact while still making the ficha behave consistently.
    const eqAttr = equipmentMechanicalBonuses.attributes
    const percepcaoAttrBonus =
      (singularityBonuses.attributes.percepcao ?? 0) + (eqAttr.percepcao ?? 0) + (book.attributes.percepcao ?? 0)
    const vitalidadeAttrBonus =
      (singularityBonuses.attributes.vitalidade ?? 0) + (eqAttr.vitalidade ?? 0) + (book.attributes.vitalidade ?? 0)
    const vontadeAttrBonus =
      (singularityBonuses.attributes.vontade ?? 0) + (eqAttr.vontade ?? 0) + (book.attributes.vontade ?? 0)
    const corpoBonus = (singularityBonuses.corpo ?? 0) + (book.corpo ?? 0)
    const menteBonus = (singularityBonuses.mente ?? 0) + (book.mente ?? 0)
    const folegoBonus = (singularityBonuses.folego ?? 0) + (book.folego ?? 0)
    const manaBonus = (singularityBonuses.mana ?? 0) + (book.mana ?? 0)
    const nivelPoder = getSoulLevelByPontosEvolucao(characterData.pontosEvolucao.max).nivelPoder

    const percepcaoEffective = percepcaoLevel + percepcaoAttrBonus
    const vitalidadeEffective = vitalidadeLevel + vitalidadeAttrBonus
    const vontadeEffective = vontadeLevel + vontadeAttrBonus
    const corpoMaxBase = calculateCorpoMax(vitalidadeEffective, nivelPoder)
    const menteMaxBase = calculateMenteMax(vontadeEffective, nivelPoder)
    const corpoMax = corpoMaxBase + corpoBonus
    const menteMax = menteMaxBase + menteBonus

    return {
      corpoMax,
      menteMax,
      folegoMax: calculateFolegoMax(corpoMax) + folegoBonus,
      manaMax: calculateManaMax(menteMax) + manaBonus,
      commonTests: calculateCommonTests(
        percepcaoEffective,
        vontadeEffective,
        atencaoBonus + racialRules.visionAttentionPenalty,
        raciocinioBonus + racialRules.initiativeBonus,
        reflexosBonus,
        composturaBonus + racialRules.composturaBonus,
        0,
        sizeWeightPenalty
      ),
    }
  }, [
    singularityBonuses.attributes,
    singularityBonuses.skills,
    singularityBonuses.corpo,
    singularityBonuses.mente,
    singularityBonuses.folego,
    singularityBonuses.mana,
    characterData.pontosEvolucao.max,
    characterData.percepcao.nivel,
    characterData.vitalidade.nivel,
    characterData.vontade.nivel,
    characterData.tamanho,
    characterData.peso,
    racialRules.dodgeBonus,
    racialRules.initiativeBonus,
    racialRules.composturaBonus,
    racialRules.visionAttentionPenalty,
    equipmentMechanicalBonuses.attributes,
    equipmentMechanicalBonuses.skills,
    bookDisadvantageBonuses,
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
      folego: coerceLimitShape(base.folego, characterData.folego.atual, derivedValues.folegoMax),
      mana: coerceLimitShape(base.mana, characterData.mana.atual, derivedValues.manaMax),
    }
  }, [
    characterData,
    coerceLimitShape,
    derivedValues.corpoMax,
    derivedValues.menteMax,
    derivedValues.folegoMax,
    derivedValues.manaMax,
  ])

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
      folego: coerceLimitShape(base.folego, characterData.folego.atual, derivedValues.folegoMax),
      mana: coerceLimitShape(base.mana, characterData.mana.atual, derivedValues.manaMax),
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
      singularidadesCondicionaisAtivas: characterData.singularidadesCondicionaisAtivas,
      singularidadesCondicionaisCriacaoAtivas: characterData.singularidadesCondicionaisCriacaoAtivas,
      singularidadesMarciais: characterData.singularidadesMarciais,
      singularidadesCondicionaisMarciaisAtivas: characterData.singularidadesCondicionaisMarciaisAtivas,
      singularidadesCondicionaisRaciaisAtivas: characterData.singularidadesCondicionaisRaciaisAtivas,
      singularidadesRaciais: characterData.singularidadesRaciais,
      desvantagens: (characterData as { desvantagens?: string[] }).desvantagens ?? [],
      saldoMoedas: characterData.saldoMoedas,
      moeda: formatCerosDisplay(characterData.saldoMoedas),
      equippedWeapons: characterData.equippedWeapons,
      equippedArmor: characterData.equippedArmor,
      equippedAccessories: characterData.equippedAccessories,
      skills: characterData.skills,
      aptitudes: characterData.aptitudes,
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
    derivedValues.folegoMax,
    derivedValues.manaMax,
    nivelAlma,
    nivelPoder,
    nivelTrilha,
    parseMeters,
  ])

  const handleStartEdit = useCallback(() => {
    if (!canEditSheet) return
    editBackupRef.current = deepClone(characterData)
    userTriggeredLimitsRef.current = false
    setIsEditing(true)

    if (limitsAutoSaveTimeoutRef.current) {
      clearTimeout(limitsAutoSaveTimeoutRef.current)
      limitsAutoSaveTimeoutRef.current = null
    }
  }, [canEditSheet, characterData, deepClone])

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

  const categoryLabels: Record<string, string> = {
    combate: 'Combate',
    primarias: 'Primárias',
    artisticas: 'Artísticas',
    cientificas: 'Científicas',
    sociais: 'Sociais',
    motoras: 'Motoras',
    gerais: 'Gerais',
  }
  const skillCategoryKeys = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>
  const [activeSkillCategory, setActiveSkillCategory] = useState<'all' | keyof typeof categoryLabels>('combate')

  const skillsByCategory = useMemo(() => {
    const map = new Map<string, typeof skillsDefinitions>()
    ;(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).forEach((cat) => {
      map.set(cat, skillsDefinitions.filter((s) => s.category === cat))
    })
    return map
  }, [])

  const coerceInt = useCallback((v: any, fallback = 0) => {
    const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10)
    return Number.isFinite(n) ? n : fallback
  }, [])

  const parseSpaceNumber = useCallback((spaceText: string | undefined | null): number => {
    if (!spaceText) return 0
    const s = String(spaceText).trim()
    if (!s) return 0
    const m = s.match(/-?\d+/)
    if (!m) return 0
    const n = parseInt(m[0], 10)
    return Number.isFinite(n) ? Math.max(0, n) : 0
  }, [])

  const equipmentSpaces = useMemo(() => {
    const totalRaw = String(characterData.espacos ?? '').trim()
    let total = 0
    if (totalRaw.includes('/')) {
      const parts = totalRaw.split('/').map((p) => p.trim())
      total = coerceInt(parts[1], 0)
    } else if (totalRaw) {
      total = coerceInt(totalRaw, 0)
    }

    const usedCatalog = characterData.itensCatalogo.reduce((sum, owned) => {
      if (owned.kind === 'weapon') {
        const entry = weaponCatalogById.get(owned.catalogId)
        return sum + parseSpaceNumber(entry?.space)
      }
      if (owned.kind === 'armor') {
        const entry = armorCatalogById.get(String(owned.catalogId))
        return sum + parseSpaceNumber(entry?.space)
      }
      const entry = utilityCatalogById.get(String(owned.catalogId))
      return sum + parseSpaceNumber(entry?.space)
    }, 0)

    return { used: usedCatalog, total: Math.max(0, total) }
  }, [armorCatalogById, characterData.espacos, characterData.itensCatalogo, coerceInt, parseSpaceNumber, utilityCatalogById, weaponCatalogById])

  const activeArmor = useMemo(() => {
    const equippedInstanceId = characterData.equippedArmor?.instanceId
    if (equippedInstanceId) {
      const owned = characterData.itensCatalogo.find((i) => i.instanceId === equippedInstanceId && i.kind === 'armor')
      const entry = owned ? (armorCatalogById.get(String(owned.catalogId)) as ArmorCatalogEntry | undefined) : undefined
      if (entry && entry.vestuarioTab !== 'acessorios') return entry
    }
    if (characterData.hasVestuarioEquipState) return null
    const ownedArmor = characterData.itensCatalogo.filter((i) => i.kind === 'armor')
    if (ownedArmor.length === 0) return null
    const last = ownedArmor
      .map((owned) => armorCatalogById.get(String(owned.catalogId)) as ArmorCatalogEntry | undefined)
      .filter((entry): entry is ArmorCatalogEntry => !!entry && entry.vestuarioTab !== 'acessorios')
      .at(-1)
    return last ?? null
  }, [armorCatalogById, characterData.equippedArmor, characterData.hasVestuarioEquipState, characterData.itensCatalogo])

  const equippedAccessoryEntries = useMemo(() => {
    return (characterData.equippedAccessories ?? [])
      .map((state) => {
        const owned = characterData.itensCatalogo.find((i) => i.instanceId === state.instanceId && i.kind === 'armor')
        const entry = owned ? (armorCatalogById.get(String(owned.catalogId)) as ArmorCatalogEntry | undefined) : undefined
        if (!entry || entry.vestuarioTab !== 'acessorios') return null
        return entry
      })
      .filter((entry): entry is ArmorCatalogEntry => !!entry)
  }, [armorCatalogById, characterData.equippedAccessories, characterData.itensCatalogo])

  const totalResistances = useMemo(() => {
    const normalizeText = (raw: string): string =>
      raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

    const parseTextResistanceBonus = (text: string): Partial<ArmorResistanceValues> => {
      const normalized = normalizeText(text)
      const numberMatch = normalized.match(/([+-]?\d+)/)
      if (!numberMatch) return {}
      const amount = parseInt(numberMatch[1], 10)
      if (!Number.isFinite(amount)) return {}

      const keyByAlias: Array<{ key: ArmorResistanceKey; aliases: string[] }> = [
        { key: 'contundente', aliases: ['contundente'] },
        { key: 'cortante', aliases: ['cortante'] },
        { key: 'perfurante', aliases: ['perfurante'] },
        { key: 'balistico', aliases: ['balistico'] },
        { key: 'esmagador', aliases: ['esmagador'] },
        { key: 'explosivo', aliases: ['explosivo'] },
        { key: 'ardente', aliases: ['ardente'] },
        { key: 'congelante', aliases: ['congelante'] },
        { key: 'eletrico', aliases: ['eletrico'] },
        { key: 'corrosivo', aliases: ['corrosivo'] },
        { key: 'magico', aliases: ['magico'] },
        { key: 'toxico', aliases: ['toxico'] },
      ]

      const bonus: Partial<ArmorResistanceValues> = {}
      keyByAlias.forEach(({ key, aliases }) => {
        if (aliases.some((alias) => normalized.includes(alias))) {
          bonus[key] = (bonus[key] ?? 0) + amount
        }
      })
      return bonus
    }

    const collectEntryResistances = (entry: ArmorCatalogEntry): ArmorResistanceValues => {
      const values = ARMOR_RESISTANCE_KEYS.reduce((acc, key) => {
        const structured = Number(entry.resistances?.[key] ?? 0)
        acc[key] = Number.isFinite(structured) ? structured : 0
        return acc
      }, {} as ArmorResistanceValues)

      const textSources = [entry.flavor ?? '', ...(entry.propriedades ?? [])]
      textSources.forEach((text) => {
        const parsed = parseTextResistanceBonus(text)
        ARMOR_RESISTANCE_KEYS.forEach((key) => {
          const extra = Number(parsed[key] ?? 0)
          if (Number.isFinite(extra) && extra !== 0) values[key] += extra
        })
      })
      return values
    }

    const base = ARMOR_RESISTANCE_KEYS.reduce((acc, key) => {
      acc[key] = 0
      return acc
    }, {} as ArmorResistanceValues)
    const equippedEntries = [activeArmor, ...equippedAccessoryEntries].filter((entry): entry is ArmorCatalogEntry => !!entry)
    equippedEntries.forEach((entry) => {
      const entryValues = collectEntryResistances(entry)
      ARMOR_RESISTANCE_KEYS.forEach((key) => {
        const value = Number(entryValues[key] ?? 0)
        base[key] += Number.isFinite(value) ? value : 0
      })
    })
    if (racialRules.physicalResistanceBonus) {
      base.contundente += racialRules.physicalResistanceBonus
      base.cortante += racialRules.physicalResistanceBonus
      base.perfurante += racialRules.physicalResistanceBonus
      base.balistico += racialRules.physicalResistanceBonus
      base.esmagador += racialRules.physicalResistanceBonus
    }
    return base
  }, [activeArmor, equippedAccessoryEntries, racialRules.physicalResistanceBonus])

  const totalArmorStats = useMemo(() => {
    const equippedEntries = [activeArmor, ...equippedAccessoryEntries].filter((entry): entry is ArmorCatalogEntry => !!entry)
    const parseSignedInt = (raw?: string): number => {
      if (!raw) return 0
      const m = String(raw).match(/-?\d+/)
      if (!m) return 0
      const n = parseInt(m[0], 10)
      return Number.isFinite(n) ? n : 0
    }
    const crit = equippedEntries.reduce((sum, entry) => sum + parseSignedInt(entry.defenseCritico), 0)
    const esquiva = equippedEntries.reduce((sum, entry) => sum + parseSignedInt(entry.esquiva), 0)
    const furtividade = equippedEntries.reduce((sum, entry) => sum + parseSignedInt(entry.furtividade), 0)
    return { crit, esquiva, furtividade }
  }, [activeArmor, equippedAccessoryEntries])

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden overflow-x-hidden">
      <div className="flex-shrink-0">
        <Header onGoToDashboard={onBackToDashboard} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="py-4 px-2 sm:px-3 md:px-4">
          <div className="max-w-[1920px] mx-auto">
            {/* Cabeçalho da ficha (estilo “ficha”, com edição inline) */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.35 }}
              className="bg-white dark:bg-ecoar-dark-800/60 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg shadow-sm overflow-hidden mb-4"
            >
              <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-ecoar-light-900/15 bg-slate-50/60 dark:bg-ecoar-dark-900/30 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider">
                    Ficha de personagem
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90 truncate">
                    {characterData.nome?.trim() ? characterData.nome : 'Sem nome'}
                  </div>
                </div>

                {canEditSheet && !isEditing && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="shrink-0 px-3 py-1.5 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 hover:bg-ecoar-teal/20 dark:hover:bg-ecoar-teal-600/20 text-ecoar-teal/90 dark:text-ecoar-teal-300/90 rounded-lg transition-all duration-200 flex items-center gap-2 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20"
                    title="Editar personagem"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">Editar</span>
                  </button>
                )}
                {canEditSheet && isEditing && (
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 hover:bg-ecoar-teal/20 dark:hover:bg-ecoar-teal-600/20 text-ecoar-teal/90 dark:text-ecoar-teal-300/90 rounded-lg transition-all duration-200 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20 disabled:opacity-60"
                      title="Salvar alterações"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-ecoar-light-900/70 rounded-lg transition-all duration-200 border border-slate-200/70 dark:border-slate-700/40 disabled:opacity-60"
                      title="Cancelar"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:items-start">
                  <div className="lg:col-span-3 space-y-3 min-w-0">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                        Nome do personagem
                      </div>
                      <input
                        type="text"
                        value={characterData.nome}
                        onChange={(e) => updateField('nome', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Nome do Personagem"
                        className="w-full h-9 px-3 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                        Imagem do personagem
                      </div>
                      <div className="h-[142px] rounded-md border border-dashed border-slate-300 dark:border-ecoar-light-900/25 bg-slate-50/70 dark:bg-ecoar-dark-900/20 flex items-center justify-center text-xs text-slate-500 dark:text-ecoar-light-900/55">
                        Placeholder
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-3 min-w-0">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                        Raça
                      </div>
                      <select
                        value={characterData.raca}
                        disabled={!isEditing}
                        onChange={(e) => {
                          updateField('raca', e.target.value)
                          applyRaceBonuses(e.target.value)
                        }}
                        className="w-full h-9 px-3 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm disabled:opacity-60"
                      >
                        <option value="">Selecione uma Raça</option>
                        {races.map((race) => (
                          <option key={race.id} value={race.id}>
                            {race.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                          Mod. peso
                        </div>
                        <input
                          type="number"
                          value={typeof characterData.peso === 'number' ? characterData.peso : 0}
                          disabled={!isEditing}
                          onChange={(e) => updateField('peso', coerceInt(e.target.value, 0))}
                          className="w-full h-9 px-3 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                          Mod. tamanho
                        </div>
                        <input
                          type="number"
                          value={typeof characterData.tamanho === 'number' ? characterData.tamanho : 0}
                          disabled={!isEditing}
                          onChange={(e) => updateField('tamanho', coerceInt(e.target.value, 0))}
                          className="w-full h-9 px-3 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm disabled:opacity-60"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                        Pontos de evolução
                      </div>
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="number"
                          value={characterData.pontosEvolucao.atual}
                          readOnly
                          disabled={!isEditing && !hasMasterOverride}
                          className="col-span-5 h-9 px-3 rounded-md bg-slate-50 dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm opacity-90"
                        />
                        <div className="col-span-2 text-center text-slate-500 dark:text-ecoar-light-900/60">/</div>
                        <input
                          type="number"
                          value={characterData.pontosEvolucao.max}
                          readOnly
                          disabled={!isEditing && !hasMasterOverride}
                          className="col-span-5 h-9 px-3 rounded-md bg-slate-50 dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm opacity-90"
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
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
                            setPeToAdd(raw)
                          }}
                          placeholder="PE recebidos"
                          className="flex-1 h-9 px-3 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm disabled:opacity-60"
                        />
                        <button
                          type="button"
                          disabled={!isEditing || peToAddNumber <= 0}
                          onClick={() => {
                            if (peToAddNumber <= 0) return
                            setCharacterData((prev) => ({
                              ...prev,
                              pontosEvolucao: {
                                atual: Math.max(0, prev.pontosEvolucao.atual + peToAddNumber),
                                max: Math.max(0, prev.pontosEvolucao.max + peToAddNumber),
                              },
                            }))
                            setPeToAdd('')
                          }}
                          className="h-9 px-3 rounded-md text-sm font-semibold bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border border-ecoar-teal-500/30 disabled:opacity-50"
                        >
                          Adicionar
                        </button>
                        {canEditSheet && !isEditing && (
                          <button
                            type="button"
                            disabled={characterData.pontosEvolucao.atual <= 0}
                            onClick={() => onOpenEvolution?.()}
                            className="h-9 px-3 rounded-md text-sm font-semibold bg-ecoar-magenta/15 text-ecoar-magenta-800 dark:text-ecoar-magenta-300 border border-ecoar-magenta-500/30 disabled:opacity-50"
                            title="Abrir tela para gastar Pontos de Evolução"
                          >
                            Evoluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-3 min-w-0">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                        Níveis
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55 mb-1">Alma</div>
                          <div className="h-9 px-2 rounded-md bg-slate-50 dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-sm text-slate-900 dark:text-ecoar-light-900/90 text-center flex items-center justify-center">
                            {nivelAlma}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55 mb-1">Poder</div>
                          <div className="h-9 px-2 rounded-md bg-slate-50 dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-sm text-slate-900 dark:text-ecoar-light-900/90 text-center flex items-center justify-center">
                            {nivelPoder}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55 mb-1">Trilha</div>
                          <div className="h-9 px-2 rounded-md bg-slate-50 dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-sm text-slate-900 dark:text-ecoar-light-900/90 text-center flex items-center justify-center">
                            {nivelTrilha}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                        Deslocamentos
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'terrestre', label: 'Terrestre' },
                          { key: 'aquatico', label: 'Aquático' },
                          { key: 'aereo', label: 'Aéreo' },
                        ].map((move) => (
                          <div key={move.key}>
                            <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55 mb-1">{move.label}</div>
                            <input
                              type="text"
                              value={characterData[move.key as keyof typeof characterData] as string}
                              disabled={!isEditing}
                              onChange={(e) => updateField(move.key, e.target.value)}
                              className="w-full h-9 px-2 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-xs disabled:opacity-60"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-3 min-w-0">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                        Personalidade
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55 mb-1">Traço positivo</div>
                          <input
                            type="text"
                            value={characterData.tracoPositivo}
                            disabled={!isEditing}
                            onChange={(e) => updateField('tracoPositivo', e.target.value)}
                            placeholder="—"
                            className="w-full h-9 px-3 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55 mb-1">Traço negativo</div>
                          <input
                            type="text"
                            value={characterData.tracoNegativo}
                            disabled={!isEditing}
                            onChange={(e) => updateField('tracoNegativo', e.target.value)}
                            placeholder="—"
                            className="w-full h-9 px-3 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider mb-1">
                        Moeda (ceros)
                      </div>
                      <input
                        type="number"
                        min={0}
                        disabled={!isEditing}
                        value={characterData.saldoMoedas}
                        onChange={(e) => updateField('saldoMoedas', Math.max(0, coerceInt(e.target.value, 0)))}
                        className="w-full h-9 px-3 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-sm disabled:opacity-60"
                      />
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-ecoar-light-900/60">
                        {formatCerosDisplay(characterData.saldoMoedas)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
        {/* Layout em 3 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          
          {/* Sidebar Esquerda - Informações Principais */}
          <aside className="lg:col-span-3 min-w-0 flex flex-col gap-3">
            {/* Atributos mini-cards (desktop) */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.35 }}
              className="hidden"
            >
              <div className="w-[132px] mx-auto space-y-3 pb-2">
                {attributes.map((attr) => {
                  const attrData = characterData[attr.key as keyof typeof characterData] as { nivel: number; mod: number }
                  const nivel = typeof attrData.nivel === 'string' ? parseInt(attrData.nivel) || 0 : attrData.nivel
                  const eff = effectiveAttributesByKey[attr.key as keyof typeof effectiveAttributesByKey]
                  return (
                    <div
                      key={`totem-${attr.key}`}
                      className="min-h-[96px] overflow-hidden rounded-lg border border-slate-300/80 dark:border-ecoar-light-900/20 bg-gradient-to-b from-slate-50 to-white dark:from-ecoar-dark-700 dark:to-ecoar-dark-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] px-2 py-1.5 flex flex-col"
                    >
                      <div className="text-[10px] font-bold text-center text-slate-800 dark:text-ecoar-light-900 uppercase truncate">
                        {attr.label}
                      </div>
                      <div className="mt-1.5">
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
                          className="w-full h-8 text-center text-[11px] font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white/85 dark:bg-ecoar-dark-700 border border-slate-300/80 dark:border-ecoar-light-900/25 rounded-md focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors disabled:opacity-60"
                        />
                      </div>
                      <div className="mt-1.5 rounded-md border border-slate-300/70 dark:border-ecoar-light-900/20 bg-slate-100/70 dark:bg-ecoar-dark-700/50 min-h-6 flex flex-col items-center justify-center py-0.5 px-1">
                        <span className="text-[11px] font-semibold text-ecoar-teal-700 dark:text-ecoar-teal-300">
                          Mod {formatModifier(eff.effectiveMod)}
                        </span>
                        {eff.singularityBonus !== 0 && (
                          <span className="text-[9px] text-slate-500 dark:text-ecoar-light-900/55 leading-tight">
                            sing. {formatModifier(eff.singularityBonus)}
                          </span>
                        )}
                        {eff.bookDisadvantageBonus !== 0 && (
                          <span className="text-[9px] text-slate-500 dark:text-ecoar-light-900/55 leading-tight">
                            livro {formatModifier(eff.bookDisadvantageBonus)}
                          </span>
                        )}
                        {eff.equipmentBonus !== 0 && (
                          <span className="text-[9px] text-slate-500 dark:text-ecoar-light-900/55 leading-tight">
                            equip. {formatModifier(eff.equipmentBonus)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Habilidades abaixo dos atributos (desktop) */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
              className="order-2 bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg shadow-sm overflow-hidden min-w-0"
            >
              <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-ecoar-light-900/15 bg-slate-50/60 dark:bg-ecoar-dark-900/30">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider">
                  Habilidades
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveSkillCategory('all')}
                    className={`px-2 py-1 rounded text-[10px] border ${activeSkillCategory === 'all' ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border-ecoar-teal-500/30' : 'bg-white dark:bg-ecoar-dark-800/40 text-slate-700 dark:text-ecoar-light-900/80 border-slate-200 dark:border-ecoar-light-900/20'}`}
                  >
                    Todas
                  </button>
                  {skillCategoryKeys.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveSkillCategory(cat)}
                      className={`px-2 py-1 rounded text-[10px] border ${activeSkillCategory === cat ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border-ecoar-teal-500/30' : 'bg-white dark:bg-ecoar-dark-800/40 text-slate-700 dark:text-ecoar-light-900/80 border-slate-200 dark:border-ecoar-light-900/20'}`}
                    >
                      {categoryLabels[cat]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-white dark:bg-ecoar-dark-800/40">
                    <tr className="border-b border-slate-200 dark:border-ecoar-light-900/15">
                      <th className="text-left px-2 py-1.5 font-semibold text-slate-700 dark:text-ecoar-light-900/80">Habilidades</th>
                      <th className="text-center px-1.5 py-1.5 font-semibold text-slate-700 dark:text-ecoar-light-900/80 w-[58px]">Nível</th>
                      <th className="text-center px-1.5 py-1.5 font-semibold text-slate-700 dark:text-ecoar-light-900/80 w-[72px]">Dado</th>
                      <th className="text-left px-2 py-1.5 font-semibold text-slate-700 dark:text-ecoar-light-900/80">Especialidade</th>
                      <th className="text-center px-1.5 py-1.5 font-semibold text-slate-700 dark:text-ecoar-light-900/80 w-[54px]">Bônus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((activeSkillCategory === 'all' ? skillCategoryKeys : [activeSkillCategory]) as Array<keyof typeof categoryLabels>).map((cat) => {
                      const list = skillsByCategory.get(cat) ?? []
                      if (list.length === 0) return null
                      return (
                        <Fragment key={cat}>
                          <tr className="bg-slate-100/70 dark:bg-ecoar-light-900/10">
                            <td colSpan={5} className="px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-ecoar-light-900/85 uppercase tracking-wider">
                              {categoryLabels[cat]}
                            </td>
                          </tr>
                          {list.map((skill) => {
                            const skillState = characterData.skills?.[skill.id]
                            const level = coerceInt(skillState?.level, 0)
                            const dice = getSkillDice(level)
                            const specId = skillState?.specialization ?? ''
                            const skillSingBonus =
                              (singularityBonuses.skills[skill.id] ?? 0) +
                              (equipmentMechanicalBonuses.skills[skill.id] ?? 0) +
                              (bookDisadvantageBonuses.skills[skill.id] ?? 0)
                            return (
                              <tr key={skill.id} className="border-b border-slate-200 dark:border-ecoar-light-900/15 last:border-b-0">
                                <td className="px-2 py-1.5 text-slate-900 dark:text-ecoar-light-900/90 whitespace-nowrap">{skill.name}</td>
                                <td className="px-1.5 py-1.5 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    max={8}
                                    disabled={!isEditing}
                                    value={level}
                                    onChange={(e) => {
                                      const next = Math.max(0, Math.min(8, coerceInt(e.target.value, 0)))
                                      setCharacterData((prev) => ({
                                        ...prev,
                                        skills: {
                                          ...(prev.skills ?? {}),
                                          [skill.id]: { ...(prev.skills?.[skill.id] ?? {}), level: next },
                                        },
                                      }))
                                    }}
                                    className="w-[52px] text-center px-1.5 py-0.5 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-[11px] disabled:opacity-60"
                                  />
                                </td>
                                <td className="px-1.5 py-1.5 text-center font-semibold text-slate-800 dark:text-ecoar-light-900/85">{dice}</td>
                                <td className="px-2 py-1.5">
                                  <select
                                    disabled={!isEditing}
                                    value={specId}
                                    onChange={(e) => {
                                      const nextSpec = e.target.value
                                      setCharacterData((prev) => ({
                                        ...prev,
                                        skills: {
                                          ...(prev.skills ?? {}),
                                          [skill.id]: {
                                            ...(prev.skills?.[skill.id] ?? { level: 0 }),
                                            specialization: nextSpec || undefined,
                                          },
                                        },
                                      }))
                                    }}
                                    className="w-full px-1.5 py-0.5 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-[11px] disabled:opacity-60"
                                  >
                                    <option value="">—</option>
                                    {skill.specializations.map((sp) => (
                                      <option key={sp.id} value={sp.id}>
                                        {sp.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-1.5 py-1.5 text-center font-semibold text-ecoar-teal-600 dark:text-ecoar-teal-400">
                                  {skillSingBonus === 0 ? '—' : formatModifier(skillSingBonus)}
                                </td>
                              </tr>
                            )
                          })}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Atributos */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
              className="order-1 bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-[11px] font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-3">
                Atributos
              </h3>
              <div className="space-y-2">
                {attributes.map((attr) => {
                  const Icon = attr.icon
                  const attrData = characterData[attr.key as keyof typeof characterData] as { nivel: number; mod: number }
                  const nivel = typeof attrData.nivel === 'string' 
                    ? parseInt(attrData.nivel) || 0 
                    : attrData.nivel
                  const eff = effectiveAttributesByKey[attr.key as keyof typeof effectiveAttributesByKey]
                  
                  return (
                    <div key={attr.key} className="flex items-center justify-between px-2 py-2 border border-slate-200 dark:border-ecoar-light-900/15 rounded-md bg-slate-50/60 dark:bg-ecoar-dark-900/20 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon className="w-3.5 h-3.5 text-ecoar-teal-600 dark:text-ecoar-teal-400 flex-shrink-0" />
                        <span className="text-xs text-slate-700 dark:text-ecoar-light-900 font-medium truncate">{attr.label}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                          className="w-10 text-center text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white dark:bg-ecoar-dark-700 border border-slate-300 dark:border-ecoar-light-900/25 rounded focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors"
                        />
                        <div className="flex flex-col items-end min-w-[3rem]">
                          <span className="text-xs font-semibold text-ecoar-teal-600 dark:text-ecoar-teal-400">
                            {formatModifier(eff.effectiveMod)}
                          </span>
                          {eff.singularityBonus !== 0 && (
                            <span className="text-[9px] text-slate-500 dark:text-ecoar-light-900/55 leading-tight">
                              sing. {formatModifier(eff.singularityBonus)}
                            </span>
                          )}
                          {eff.bookDisadvantageBonus !== 0 && (
                            <span className="text-[9px] text-slate-500 dark:text-ecoar-light-900/55 leading-tight">
                              livro {formatModifier(eff.bookDisadvantageBonus)}
                            </span>
                          )}
                          {eff.equipmentBonus !== 0 && (
                            <span className="text-[9px] text-slate-500 dark:text-ecoar-light-900/55 leading-tight">
                              equip. {formatModifier(eff.equipmentBonus)}
                            </span>
                          )}
                        </div>
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
              className="lg:hidden bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
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
                    readOnly
                    disabled={!isEditing && !hasMasterOverride}
                    className="w-16 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white/60 dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors opacity-90"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-ecoar-light-900 font-medium">Poder</span>
                  <input
                    type="number"
                    value={nivelPoder}
                    readOnly
                    disabled={!isEditing && !hasMasterOverride}
                    className="w-16 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white/60 dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors opacity-90"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-ecoar-light-900 font-medium">Trilha</span>
                  <input
                    type="number"
                    value={nivelTrilha}
                    readOnly
                    disabled={!isEditing && !hasMasterOverride}
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
                      readOnly
                      disabled={!isEditing && !hasMasterOverride}
                      className="flex-1 text-center text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 bg-white/60 dark:bg-ecoar-dark-700 border-b-2 border-slate-300 dark:border-ecoar-light-900/30 focus:border-teal-500 dark:focus:border-ecoar-teal-400 focus:outline-none transition-colors opacity-90"
                    />
                    <span className="text-slate-500 dark:text-ecoar-light-900/60">/</span>
                    <input
                      type="number"
                      value={characterData.pontosEvolucao.max}
                      readOnly
                      disabled={!isEditing && !hasMasterOverride}
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

                  {canEditSheet && !isEditing && (
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
              className="lg:hidden bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
                Limites
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'corpo', label: 'Corpo', icon: Heart, max: derivedValues.corpoMax },
                  { key: 'mente', label: 'Mente', icon: Brain, max: derivedValues.menteMax },
                  { key: 'folego', label: 'Fôlego', icon: Waves, max: derivedValues.folegoMax },
                  { key: 'mana', label: 'Mana', icon: Sparkles, max: derivedValues.manaMax },
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

            {/* Aptidão */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, delay: 0.25 }}
              className="lg:hidden bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
                Aptidão
              </h3>
              <div className="max-h-[65vh] overflow-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-ecoar-light-900/15">
                      <th className="text-left px-3 py-2 font-semibold text-slate-700 dark:text-ecoar-light-900/80">
                        Aptidão
                      </th>
                      <th className="text-center px-2 py-2 font-semibold text-slate-700 dark:text-ecoar-light-900/80 w-[70px]">
                        Nível
                      </th>
                      <th className="text-center px-2 py-2 font-semibold text-slate-700 dark:text-ecoar-light-900/80 w-[70px]">
                        Mod.
                      </th>
                      <th className="text-center px-2 py-2 font-semibold text-slate-700 dark:text-ecoar-light-900/80 w-[90px]">
                        Dado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aptitudesDefinitions.map((apt) => {
                      const level = coerceInt(characterData.aptitudes?.[apt.id], 0)
                      const attrModRaw = (characterData as any)?.[apt.attribute]?.mod
                      const attrMod = typeof attrModRaw === 'number' ? attrModRaw : coerceInt(attrModRaw, 0)
                      const effMod =
                        effectiveAttributesByKey[apt.attribute]?.effectiveMod ?? attrMod
                      return (
                        <tr key={apt.id} className="border-b border-slate-200 dark:border-ecoar-light-900/15 last:border-b-0">
                          <td className="px-3 py-2 text-slate-900 dark:text-ecoar-light-900/90">
                            {apt.name}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={8}
                              value={level}
                              disabled={!isEditing}
                              onChange={(e) => {
                                const next = Math.max(0, Math.min(8, coerceInt(e.target.value, 0)))
                                setCharacterData((prev) => ({
                                  ...prev,
                                  aptitudes: { ...(prev.aptitudes ?? {}), [apt.id]: next },
                                }))
                              }}
                              className="w-[58px] text-center px-2 py-1 rounded-md bg-white dark:bg-ecoar-dark-700 border border-slate-200 dark:border-ecoar-light-900/20 text-slate-900 dark:text-ecoar-light-900 text-xs disabled:opacity-60"
                            />
                          </td>
                          <td className="px-2 py-2 text-center font-semibold text-ecoar-teal-600 dark:text-ecoar-teal-400">
                            {formatModifier(effMod)}
                          </td>
                          <td className="px-2 py-2 text-center font-semibold text-slate-800 dark:text-ecoar-light-900/85">
                            {getAptitudeDice(level)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </aside>

          {/* Área Central - Conteúdo Principal */}
          <main className="lg:col-span-5 space-y-3 min-w-0">
            <div className="space-y-3">
            {/* Linha superior do corpo: Limites + Aptidão (desktop) */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-2.5 shadow-sm overflow-hidden"
              >
                <h3 className="text-[11px] font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-2">
                  Limites
                </h3>
                <div className="space-y-1.5">
                  {[
                    { key: 'corpo', label: 'Corpo', max: derivedValues.corpoMax },
                    { key: 'mente', label: 'Mente', max: derivedValues.menteMax },
                    { key: 'folego', label: 'Fôlego', max: derivedValues.folegoMax },
                    { key: 'mana', label: 'Mana', max: derivedValues.manaMax },
                  ].map((limit) => {
                    const current = characterData[limit.key as keyof typeof characterData] as { atual: number; max: number }
                    return (
                      <div key={limit.key} className="grid grid-cols-12 items-center gap-2 text-xs">
                        <div className="col-span-5 text-slate-700 dark:text-ecoar-light-900/85">{limit.label}</div>
                        <input
                          type="number"
                          value={current.atual}
                          disabled={!isEditing}
                          onChange={(e) => {
                            if (!isEditing) userTriggeredLimitsRef.current = true
                            updateField(`${limit.key}.atual`, parseInt(e.target.value) || 0)
                          }}
                          className="col-span-3 w-full text-center px-1.5 py-1 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700"
                        />
                        <div className="col-span-1 text-center text-slate-500">/</div>
                        <div className="col-span-3 text-center font-semibold text-slate-800 dark:text-ecoar-light-900/90">{limit.max}</div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-2.5 shadow-sm overflow-hidden"
              >
                <h3 className="text-[11px] font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-2">
                  Aptidão
                </h3>
                <div className="space-y-1.5">
                  {aptitudesDefinitions.map((apt) => {
                    const level = coerceInt(characterData.aptitudes?.[apt.id], 0)
                    const attrModRaw = (characterData as any)?.[apt.attribute]?.mod
                    const attrMod = typeof attrModRaw === 'number' ? attrModRaw : coerceInt(attrModRaw, 0)
                    const effMod =
                      effectiveAttributesByKey[apt.attribute]?.effectiveMod ?? attrMod
                    return (
                      <div key={apt.id} className="grid grid-cols-12 items-center gap-2 text-xs">
                        <div className="col-span-4 text-slate-700 dark:text-ecoar-light-900/85 truncate">{apt.name}</div>
                        <input
                          type="number"
                          min={0}
                          max={8}
                          value={level}
                          disabled={!isEditing}
                          onChange={(e) => {
                            const next = Math.max(0, Math.min(8, coerceInt(e.target.value, 0)))
                            setCharacterData((prev) => ({
                              ...prev,
                              aptitudes: { ...(prev.aptitudes ?? {}), [apt.id]: next },
                            }))
                          }}
                          className="col-span-2 w-full text-center px-1.5 py-1 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700"
                        />
                        <div className="col-span-2 text-center font-semibold text-ecoar-teal-600 dark:text-ecoar-teal-400">
                          {formatModifier(effMod)}
                        </div>
                        <div className="col-span-4 text-center font-semibold text-slate-800 dark:text-ecoar-light-900/90">
                          {getAptitudeDice(level)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            {/* Testes Comuns */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-3 shadow-sm overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-2.5">
                Testes Comuns
              </h3>
              <div className="grid grid-cols-2 gap-2">
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
                  <div key={test.key} className="text-center py-2.5 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 bg-ecoar-teal-50/50 dark:bg-ecoar-teal-900/30 rounded-lg overflow-hidden min-w-0">
                    <div className="text-[10px] font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-1 break-words px-2">
                      {test.label}
                    </div>
                    <div className="text-base font-semibold text-ecoar-teal/90 dark:text-ecoar-teal-400/90 mb-0.5">
                      {formatModifier(test.value)}
                    </div>
                    <div className="text-[10px] text-ecoar-dark-700 dark:text-ecoar-light-900/80 break-words px-2">{test.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            

            {/* Resistência a dano */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-3 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider">
                  Resistência a dano
                </h3>
                <div className="text-[11px] text-slate-500 dark:text-ecoar-light-900/60 truncate">
                  {activeArmor?.name ? `Armadura: ${activeArmor.name}` : 'Sem armadura equipada'}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-slate-200 dark:border-ecoar-light-900/20">
                  <tbody>
                    {[
                      { left: 'Contundente', key: 'contundente', mid: 'Balístico', midKey: 'balistico', right: 'Corrosivo', rightKey: 'corrosivo' },
                      { left: 'Cortante', key: 'cortante', mid: 'Esmagador', midKey: 'esmagador', right: 'Mágico', rightKey: 'magico' },
                      { left: 'Perfurante', key: 'perfurante', mid: 'Explosivo', midKey: 'explosivo', right: 'Tóxico', rightKey: 'toxico' },
                      { left: 'Ardente', key: 'ardente', mid: 'Congelante', midKey: 'congelante', right: 'Elétrico', rightKey: 'eletrico' },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-200 dark:border-ecoar-light-900/15 last:border-b-0">
                        <td className="px-3 py-2 font-semibold text-slate-700 dark:text-ecoar-light-900/80 whitespace-nowrap">
                          {row.left}
                        </td>
                        <td className="px-3 py-2 text-slate-900 dark:text-ecoar-light-900/90 text-center w-[70px]">
                          {totalResistances[row.key as ArmorResistanceKey]}
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-700 dark:text-ecoar-light-900/80 whitespace-nowrap">
                          {row.mid}
                        </td>
                        <td className="px-3 py-2 text-slate-900 dark:text-ecoar-light-900/90 text-center w-[70px]">
                          {totalResistances[row.midKey as ArmorResistanceKey]}
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-700 dark:text-ecoar-light-900/80 whitespace-nowrap">
                          {row.right}
                        </td>
                        <td className="px-3 py-2 text-slate-900 dark:text-ecoar-light-900/90 text-center w-[70px]">
                          {totalResistances[row.rightKey as ArmorResistanceKey]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/60 dark:bg-ecoar-light-900/10">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider">
                    Defesa de crítico
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90">
                    {totalArmorStats.crit}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/60 dark:bg-ecoar-light-900/10">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider">
                    Origem (equipados)
                  </div>
                  <div className="mt-1 text-[11px] text-slate-700 dark:text-ecoar-light-900/80 break-words">
                    {[activeArmor?.name, ...equippedAccessoryEntries.map((a) => a.name)].filter(Boolean).join(' + ') || '—'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Armas equipadas em cards centrais (estilo ficha) */}
            <div className="grid grid-cols-1 gap-3">
              {(['slot1', 'slot2'] as EquippedWeaponSlotId[]).map((slotId) => {
                const slotLabel = slotId === 'slot1' ? 'Arma 1' : 'Arma 2'
                const slotState = characterData.equippedWeapons?.[slotId]
                const owned = slotState
                  ? characterData.itensCatalogo.find((i) => i.instanceId === slotState.instanceId)
                  : undefined
                const entry = owned ? weaponCatalogById.get(owned.catalogId) : undefined
                const properties = entry?.properties ?? []

                const readByPrefix = (prefix: string): string => {
                  const hit = properties.find((p) => p.toLowerCase().startsWith(prefix.toLowerCase()))
                  if (!hit) return '—'
                  const parts = hit.split(':')
                  return (parts.slice(1).join(':').trim() || hit).replace(/^[+-]\s*/, (m) => m.trim())
                }

                return (
                  <motion.div
                    key={slotId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: slotId === 'slot1' ? 0.38 : 0.42 }}
                    className="bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-3 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-[11px] font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider">
                        {slotLabel}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-ecoar-light-900/60">
                        {entry?.category ?? '—'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-3">
                      {entry?.name ?? 'Não equipada'}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/70 dark:bg-ecoar-dark-900/20">
                        <div className="text-slate-500 dark:text-ecoar-light-900/60">Ataque</div>
                        <div className="font-semibold text-slate-800 dark:text-ecoar-light-900/90">{readByPrefix('Ataque')}</div>
                      </div>
                      <div className="p-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/70 dark:bg-ecoar-dark-900/20">
                        <div className="text-slate-500 dark:text-ecoar-light-900/60">Alcance</div>
                        <div className="font-semibold text-slate-800 dark:text-ecoar-light-900/90">{readByPrefix('Alcance')}</div>
                      </div>
                      <div className="p-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/70 dark:bg-ecoar-dark-900/20">
                        <div className="text-slate-500 dark:text-ecoar-light-900/60">Dano</div>
                        <div className="font-semibold text-slate-800 dark:text-ecoar-light-900/90">{readByPrefix('Dano')}</div>
                      </div>
                      <div className="p-2 rounded border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/70 dark:bg-ecoar-dark-900/20">
                        <div className="text-slate-500 dark:text-ecoar-light-900/60">Propriedades</div>
                        <div className="font-semibold text-slate-800 dark:text-ecoar-light-900/90">
                          {properties.length > 0 ? properties.join(' | ') : '—'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            </div>
          </main>

          {/* Sidebar Direita - Informações Secundárias */}
          <aside className="lg:col-span-4 space-y-3 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/50 dark:bg-ecoar-dark-800/70 border border-white/[0.12] dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider">
                  Equipamentos carregados
                </div>
                <div className="text-xs text-slate-600 dark:text-ecoar-light-900/70">
                  Espaços: <strong>{equipmentSpaces.used}</strong>/<strong>{equipmentSpaces.total || '—'}</strong>
                </div>
              </div>
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
                  <div className="p-3 bg-slate-50 dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 space-y-2">
                    {(Object.keys(singularityBonuses.attributes).length > 0 ||
                      Object.keys(singularityBonuses.skills).length > 0 ||
                      singularityBonuses.corpo !== 0 ||
                      singularityBonuses.mente !== 0 ||
                      singularityBonuses.folego !== 0 ||
                      singularityBonuses.mana !== 0 ||
                      Object.keys(equipmentMechanicalBonuses.attributes).length > 0 ||
                      Object.keys(equipmentMechanicalBonuses.skills).length > 0) && (
                      <p className="text-[11px] text-slate-600 dark:text-ecoar-light-900/65">
                        Bônus de singularidades, de equipamento (catálogo: mechanicalBonuses, quando o item está equipado) e penalidades de desvantagens do livro (lista salva em desvantagens) são aplicados automaticamente na ficha.
                      </p>
                    )}
                  </div>
                  {initialDataRef.current?.id && (
                    <a
                      href={`/personagens/${initialDataRef.current.id}/singularidades`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[11px] font-medium text-ecoar-teal-700 dark:text-ecoar-teal-300 hover:underline"
                    >
                      Abrir singularidades em nova aba
                    </a>
                  )}
                  <PlayerSingularitiesViewer
                    characterData={characterData}
                    compact
                    singularityBonuses={singularityBonuses}
                  />
                </div>
              )}

              {activeSidebarTab === 'equipamentos' && (
                <div className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                  {(() => {
                    const sheetUsesStructuredEquip =
                      characterData.itensCatalogo.length > 0 ||
                      characterData.equipamentosLivresText.trim() !== '' ||
                      characterData.armasLivresText.trim() !== ''

                    return (
                      <>
                        <div className="p-3 bg-slate-50 dark:bg-ecoar-light-900/10 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 space-y-2">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider">
                                Espaços
                              </span>
                              <span className="text-xs text-slate-700 dark:text-ecoar-light-900/80">
                                <strong>{equipmentSpaces.used}</strong> / <strong>{equipmentSpaces.total || '—'}</strong>
                              </span>
                            </div>
                            <div className="mt-1">
                              <input
                                type="text"
                                value={characterData.espacos}
                                disabled={!isEditing}
                                onChange={(e) => updateField('espacos', e.target.value)}
                                placeholder="ex.: 7 ou 1/7"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-xs text-ecoar-dark-900 dark:text-ecoar-light-900 disabled:opacity-60"
                              />
                              <p className="mt-1 text-[10px] text-slate-500 dark:text-ecoar-light-900/55">
                                O usado é calculado a partir do campo “Espaço” dos itens do catálogo.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEquipmentSubTab('inventario')}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                              equipmentSubTab === 'inventario'
                                ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border-ecoar-teal-500/30'
                                : 'bg-white dark:bg-ecoar-dark-800/40 text-slate-700 dark:text-ecoar-light-900/80 border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10'
                            }`}
                          >
                            Inventário
                          </button>
                          <button
                            type="button"
                            onClick={() => setEquipmentSubTab('equipados')}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                              equipmentSubTab === 'equipados'
                                ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300 border-ecoar-teal-500/30'
                                : 'bg-white dark:bg-ecoar-dark-800/40 text-slate-700 dark:text-ecoar-light-900/80 border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/10'
                            }`}
                          >
                            Equipados
                          </button>
                        </div>

                        {equipmentSubTab === 'inventario' ? (
                          sheetUsesStructuredEquip ? (
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
                                        <div className="min-w-0 flex-1">
                                          <div className="text-slate-800 dark:text-ecoar-light-900/85 break-words">
                                            {item.displayLine}
                                          </div>
                                          {item.kind === 'weapon' && (() => {
                                            const slot = findEquippedSlotForInstance(item.instanceId)
                                            return (
                                              <div className="mt-1 flex items-center gap-2">
                                                <label className="inline-flex items-center gap-2 text-[11px] text-slate-600 dark:text-ecoar-light-900/65 select-none">
                                                  <input
                                                    type="checkbox"
                                                    checked={!!slot}
                                                    disabled={!canEditSheet}
                                                    onChange={(e) => {
                                                      if (!isEditing) handleStartEdit()
                                                      toggleEquipWeaponInstance(item.instanceId, e.target.checked)
                                                    }}
                                                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-ecoar-light-900/25"
                                                  />
                                                  Equipar
                                                </label>
                                                {slot && (
                                                  <span className="text-[11px] text-ecoar-teal-700 dark:text-ecoar-teal-300">
                                                    {slot === 'slot1' ? 'Arma 1' : 'Arma 2'}
                                                  </span>
                                                )}
                                              </div>
                                            )
                                          })()}
                                          {item.kind === 'armor' && isArmorCatalogItem(item) && (
                                            <div className="mt-1 flex items-center gap-2">
                                              <label className="inline-flex items-center gap-2 text-[11px] text-slate-600 dark:text-ecoar-light-900/65 select-none">
                                                <input
                                                  type="checkbox"
                                                  checked={characterData.equippedArmor?.instanceId === item.instanceId}
                                                  disabled={!canEditSheet}
                                                  onChange={(e) => {
                                                    if (!isEditing) handleStartEdit()
                                                    toggleEquipArmorInstance(item.instanceId, e.target.checked)
                                                  }}
                                                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-ecoar-light-900/25"
                                                />
                                                Equipar armadura
                                              </label>
                                            </div>
                                          )}
                                          {item.kind === 'armor' && isAccessoryCatalogItem(item) && (
                                            <div className="mt-1 flex items-center gap-2">
                                              <label className="inline-flex items-center gap-2 text-[11px] text-slate-600 dark:text-ecoar-light-900/65 select-none">
                                                <input
                                                  type="checkbox"
                                                  checked={(characterData.equippedAccessories ?? []).some((it) => it.instanceId === item.instanceId)}
                                                  disabled={!canEditSheet}
                                                  onChange={(e) => {
                                                    if (!isEditing) handleStartEdit()
                                                    toggleEquipAccessoryInstance(item.instanceId, e.target.checked)
                                                  }}
                                                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-ecoar-light-900/25"
                                                />
                                                Equipar acessório
                                              </label>
                                            </div>
                                          )}
                                        </div>
                                        {isEditing && (
                                          <div className="shrink-0 flex flex-col items-end gap-1">
                                            <button
                                              type="button"
                                              onClick={() => removeSheetCatalogItem(item.instanceId)}
                                              className="text-ecoar-magenta text-[11px] hover:underline"
                                            >
                                              Remover
                                            </button>
                                          </div>
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
                          )
                        ) : (
                          <div className="space-y-3">
                            <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/60 dark:bg-ecoar-light-900/10">
                              <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider">
                                Vestuário equipado
                              </div>
                              <div className="mt-1 text-[11px] text-slate-700 dark:text-ecoar-light-900/80">
                                Armadura: {activeArmor?.name ?? '—'}
                              </div>
                              <div className="mt-1 text-[11px] text-slate-700 dark:text-ecoar-light-900/80">
                                Acessórios: {equippedAccessoryEntries.map((entry) => entry.name).join(', ') || '—'}
                              </div>
                              <div className="mt-1 text-[11px] text-slate-500 dark:text-ecoar-light-900/55">
                                Esquiva total: {totalArmorStats.esquiva} · Furtividade total: {totalArmorStats.furtividade}
                              </div>
                            </div>
                            <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50/60 dark:bg-ecoar-light-900/10">
                              <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/60 uppercase tracking-wider">
                                Armas equipadas (1 e 2)
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55">
                                Layout em estilo ficha (Ataque, Alcance, Dano, Extras e Propriedades).
                              </div>
                            </div>
                            {(['slot1', 'slot2'] as EquippedWeaponSlotId[]).map((slotId) => {
                              const slotLabel = slotId === 'slot1' ? 'Arma 1' : 'Arma 2'
                              const slotState = characterData.equippedWeapons?.[slotId]
                              const owned = slotState
                                ? characterData.itensCatalogo.find((i) => i.instanceId === slotState.instanceId)
                                : undefined
                              const entry = owned ? weaponCatalogById.get(owned.catalogId) : undefined
                              const properties = entry?.properties ?? []

                              const readNumber = (prefix: string): number | null => {
                                const hit = properties.find((p) => p.toLowerCase().startsWith(prefix.toLowerCase()))
                                if (!hit) return null
                                const m = hit.match(/(-?\\d+)/)
                                if (!m) return null
                                const n = parseInt(m[1], 10)
                                return Number.isFinite(n) ? n : null
                              }

                              const readText = (prefix: string): string | null => {
                                const hit = properties.find((p) => p.toLowerCase().startsWith(prefix.toLowerCase()))
                                return hit ? hit : null
                              }

                              const baseCrit = readNumber('Acerto Crítico')
                              const baseTargets = readNumber('Alvos')
                              const baseMaxDamage = readNumber('Dano máximo')
                              const baseReload = readText('Recarga')
                              const baseCapacity = readText('Capacidade')

                              const attackBonus = slotState?.attackBonus ?? 0

                              const attackAutoText = (() => {
                                const raw = entry?.attackTest
                                if (!raw || typeof raw !== 'string') return null

                                // Expected shape: "<Atributo> + <Habilidade> (<Especialização>)"
                                const normalized = normalizeAttackTestText(raw)
                                const match = normalized.match(/^(.+?)\s*\+\s*([^(]+?)\s*\(([^)]+)\)\s*$/)
                                if (!match) return raw

                                const attrNorm = match[1].trim()
                                const skillNameNorm = match[2].trim()
                                const specLabelNorm = match[3].trim()

                                const attributeKey = ATTRIBUTE_KEY_BY_ATTACK_TEST_LABEL[attrNorm]
                                if (!attributeKey) return raw

                                const attrModRaw = (characterData as any)?.[attributeKey]?.mod
                                const attrMod = typeof attrModRaw === 'number' ? attrModRaw : parseInt(String(attrModRaw ?? 0), 10) || 0

                                const skillDef = skillsByNormalizedName.get(skillNameNorm)

                                let diceText: string | null = null
                                if (skillDef) {
                                  const specializationId =
                                    skillDef.specializations.find((sp) => normalizeAttackTestText(sp.name) === specLabelNorm)?.id ??
                                    skillDef.specializations.find((sp) => normalizeAttackTestText(sp.id) === specLabelNorm)?.id

                                  const skillState = characterData.skills?.[skillDef.id]
                                  const levelRaw = skillState?.level
                                  const level = typeof levelRaw === 'number' ? levelRaw : parseInt(String(levelRaw ?? 0), 10) || 0

                                  const specializationMatches = specializationId
                                    ? !skillState?.specialization || skillState.specialization === specializationId
                                    : true

                                  if (skillState && specializationMatches) {
                                    diceText = getSkillDice(level)
                                  }
                                }

                                if (!diceText) {
                                  const aptitudeDef = aptitudesByNormalizedLabel.get(specLabelNorm)
                                  const aptId = aptitudeDef?.id
                                  const aptLevelRaw = aptId ? characterData.aptitudes?.[aptId] : 0
                                  const aptLevel =
                                    typeof aptLevelRaw === 'number' ? aptLevelRaw : parseInt(String(aptLevelRaw ?? 0), 10) || 0
                                  diceText = getAptitudeDice(aptLevel)
                                }

                                if (!diceText) return null

                                return `${diceText} ${attrMod >= 0 ? '+' : '-'} ${Math.abs(attrMod)}`
                              })()

                              const attackOverrideText = slotState?.overrides?.attackText?.trim()
                              const attackBase =
                                attackOverrideText && attackOverrideText.length > 0
                                  ? attackOverrideText
                                  : attackAutoText ?? entry?.attackTest ?? '—'

                              const attackText =
                                attackBase !== '—' && attackBonus !== 0
                                  ? `${attackBase} ${attackBonus > 0 ? '+' : '-'} ${Math.abs(attackBonus)}`
                                  : attackBase

                              const rangeText = slotState?.overrides?.rangeText ?? entry?.rangeNotes ?? '—'
                              const damageText = slotState?.overrides?.damageText ?? entry?.damageNotes ?? '—'
                              const extrasOverride = slotState?.overrides?.extrasText?.trim()

                              const critValue =
                                baseCrit !== null ? baseCrit + (slotState?.critBonus ?? 0) : null
                              const maxDamageValue =
                                baseMaxDamage !== null ? baseMaxDamage + (slotState?.damageBonus ?? 0) : null

                              return (
                                <div
                                  key={slotId}
                                  className="p-3 rounded-lg border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-800/40 space-y-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90">
                                        {slotLabel}
                                      </div>
                                      <div className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 break-words">
                                        {entry?.name ?? owned?.nome ?? 'Nenhuma arma equipada'}
                                      </div>
                                    </div>
                                    {slotState?.instanceId && (
                                      <button
                                        type="button"
                                        onClick={() => toggleEquipWeaponInstance(slotState.instanceId, false)}
                                        disabled={!isEditing}
                                        className="shrink-0 px-2 py-1 rounded-md text-[11px] border border-slate-200 dark:border-ecoar-light-900/20 disabled:opacity-60"
                                      >
                                        Desequipar
                                      </button>
                                    )}
                                  </div>

                                  {!slotState?.instanceId ? (
                                    <div className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                                      Equipe uma arma no Inventário para ela aparecer aqui.
                                    </div>
                                  ) : !entry ? (
                                    <div className="text-xs text-ecoar-magenta">
                                      Não foi possível carregar os dados do catálogo para este item.
                                    </div>
                                  ) : (
                                    <>
                                      <div className="grid grid-cols-12 gap-2 text-xs">
                                        <div className="col-span-12">
                                          <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/65">
                                            Ataque
                                          </div>
                                          <div className="text-slate-900 dark:text-ecoar-light-900/90 break-words">
                                            {attackText}
                                          </div>
                                          {isEditing && (
                                            <div className="mt-1 grid grid-cols-12 gap-2">
                                              <input
                                                type="number"
                                                disabled={!isEditing}
                                                value={slotState.attackBonus ?? 0}
                                                onChange={(e) => {
                                                  const n = parseInt(e.target.value, 10)
                                                  const nextBonus = Number.isFinite(n) ? n : 0
                                                  setEquippedWeaponSlot(slotId, { ...slotState, attackBonus: nextBonus })
                                                }}
                                                className="col-span-4 px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
                                                placeholder="Bônus"
                                              />
                                              <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={slotState.overrides?.attackText ?? ''}
                                                onChange={(e) => {
                                                  const v = e.target.value
                                                  setEquippedWeaponSlot(slotId, {
                                                    ...slotState,
                                                    overrides: { ...(slotState.overrides ?? {}), attackText: v || undefined },
                                                  })
                                                }}
                                                className="col-span-8 px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
                                                placeholder="Override do ataque (opcional)"
                                              />
                                            </div>
                                          )}
                                        </div>

                                        <div className="col-span-6">
                                          <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/65">
                                            Categoria
                                          </div>
                                          <div className="text-slate-900 dark:text-ecoar-light-900/90 break-words">
                                            {entry.category ?? '—'}
                                          </div>
                                        </div>
                                        <div className="col-span-3">
                                          <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/65">
                                            Durabilidade
                                          </div>
                                          <div className="text-slate-900 dark:text-ecoar-light-900/90">{entry.durability ?? '—'}</div>
                                        </div>
                                        <div className="col-span-3">
                                          <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/65">
                                            Espaço
                                          </div>
                                          <div className="text-slate-900 dark:text-ecoar-light-900/90">{entry.space ?? '—'}</div>
                                        </div>

                                        <div className="col-span-6">
                                          <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/65">
                                            Alcance
                                          </div>
                                          <div className="text-slate-900 dark:text-ecoar-light-900/90 break-words">{rangeText}</div>
                                          {isEditing && (
                                            <input
                                              type="text"
                                              disabled={!isEditing}
                                              value={slotState.overrides?.rangeText ?? ''}
                                              onChange={(e) => {
                                                const v = e.target.value
                                                setEquippedWeaponSlot(slotId, {
                                                  ...slotState,
                                                  overrides: { ...(slotState.overrides ?? {}), rangeText: v || undefined },
                                                })
                                              }}
                                              className="mt-1 w-full px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
                                              placeholder="Override do alcance (opcional)"
                                            />
                                          )}
                                        </div>
                                        <div className="col-span-6">
                                          <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/65">
                                            Dano
                                          </div>
                                          <div className="text-slate-900 dark:text-ecoar-light-900/90 break-words">{damageText}</div>
                                          {isEditing && (
                                            <input
                                              type="text"
                                              disabled={!isEditing}
                                              value={slotState.overrides?.damageText ?? ''}
                                              onChange={(e) => {
                                                const v = e.target.value
                                                setEquippedWeaponSlot(slotId, {
                                                  ...slotState,
                                                  overrides: { ...(slotState.overrides ?? {}), damageText: v || undefined },
                                                })
                                              }}
                                              className="mt-1 w-full px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
                                              placeholder="Override do dano (opcional)"
                                            />
                                          )}
                                        </div>

                                        <div className="col-span-12">
                                          <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/65">
                                            Extras
                                          </div>
                                          <div className="grid grid-cols-12 gap-2">
                                            <div className="col-span-6 sm:col-span-3">
                                              <div className="text-slate-700 dark:text-ecoar-light-900/75">
                                                Acerto Crítico
                                              </div>
                                              <div className="text-slate-900 dark:text-ecoar-light-900/90">
                                                {extrasOverride ? '—' : critValue !== null ? String(critValue) : '—'}
                                              </div>
                                            </div>
                                            <div className="col-span-6 sm:col-span-3">
                                              <div className="text-slate-700 dark:text-ecoar-light-900/75">Alvos</div>
                                              <div className="text-slate-900 dark:text-ecoar-light-900/90">
                                                {extrasOverride ? '—' : baseTargets !== null ? String(baseTargets) : '—'}
                                              </div>
                                            </div>
                                            <div className="col-span-6 sm:col-span-3">
                                              <div className="text-slate-700 dark:text-ecoar-light-900/75">Dano Máximo</div>
                                              <div className="text-slate-900 dark:text-ecoar-light-900/90">
                                                {extrasOverride ? '—' : maxDamageValue !== null ? String(maxDamageValue) : '—'}
                                              </div>
                                            </div>
                                            <div className="col-span-6 sm:col-span-3">
                                              <div className="text-slate-700 dark:text-ecoar-light-900/75">Munição</div>
                                              <div className="text-slate-900 dark:text-ecoar-light-900/90 break-words">
                                                {entry.ammoCategory ?? '—'}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="mt-2 grid grid-cols-12 gap-2">
                                            <div className="col-span-6">
                                              <div className="text-slate-700 dark:text-ecoar-light-900/75">Recarga</div>
                                              <div className="text-slate-900 dark:text-ecoar-light-900/90 break-words">
                                                {extrasOverride ? '—' : baseReload ?? entry.reloadNotes ?? '—'}
                                              </div>
                                            </div>
                                            <div className="col-span-6">
                                              <div className="text-slate-700 dark:text-ecoar-light-900/75">Capacidade</div>
                                              <div className="text-slate-900 dark:text-ecoar-light-900/90 break-words">
                                                {extrasOverride ? '—' : baseCapacity ?? (entry.capacity ? `Capacidade: ${entry.capacity}` : '—')}
                                              </div>
                                            </div>
                                          </div>
                                          {isEditing && (
                                            <input
                                              type="text"
                                              disabled={!isEditing}
                                              value={slotState.overrides?.extrasText ?? ''}
                                              onChange={(e) => {
                                                const v = e.target.value
                                                setEquippedWeaponSlot(slotId, {
                                                  ...slotState,
                                                  overrides: { ...(slotState.overrides ?? {}), extrasText: v || undefined },
                                                })
                                              }}
                                              className="mt-2 w-full px-2 py-1 rounded-md border border-slate-200 dark:border-ecoar-light-900/20 bg-white dark:bg-ecoar-dark-700 text-[11px] text-slate-900 dark:text-ecoar-light-900 disabled:opacity-60"
                                              placeholder="Override de extras (opcional, texto livre)"
                                            />
                                          )}
                                        </div>

                                        <div className="col-span-12">
                                          <div className="text-[11px] font-semibold text-slate-600 dark:text-ecoar-light-900/65">
                                            Propriedades
                                          </div>
                                          <div className="flex flex-wrap gap-1.5 mt-1">
                                            {(entry.properties ?? []).map((p) => (
                                              <span
                                                key={p}
                                                className="px-2 py-1 rounded-full text-[11px] bg-slate-100 dark:bg-ecoar-light-900/10 text-slate-800 dark:text-ecoar-light-900/80 border border-slate-200 dark:border-ecoar-light-900/15"
                                              >
                                                {p}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )
                            })}
                            <div className="text-[10px] text-slate-500 dark:text-ecoar-light-900/55">
                              Para equipar, volte ao Inventário e marque “Equipar” na arma desejada (modo edição).
                            </div>
                          </div>
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
                        {singularityPickerOpen && (
                          <div className="fixed inset-0 z-[100] flex flex-col bg-black/50 p-2 sm:p-4 md:p-6">
                            <div className="mx-auto w-full max-w-5xl flex flex-col min-h-0 flex-1 rounded-xl border border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-dark-900 shadow-xl overflow-hidden">
                              <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-ecoar-light-900/15 bg-white dark:bg-ecoar-dark-800/80">
                                <span className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">
                                  Catálogo de singularidades
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSingularityPickerOpen(false)}
                                  className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/10"
                                >
                                  Fechar
                                </button>
                              </div>
                              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
                                <SystemSingularityCatalogBrowser
                                  mode="picker"
                                  urlSync={false}
                                  singularities={systemSingularities}
                                  selectedIdsByKind={{
                                    criacao: characterData.singularidades,
                                    ecoar: characterData.singularidadesEcoar,
                                    marciais: characterData.singularidadesMarciais,
                                    raciais: characterData.singularidadesRaciais,
                                  }}
                                  conditionalEnabledIdsByKind={{
                                    criacao: characterData.singularidadesCondicionaisCriacaoAtivas,
                                    ecoar: characterData.singularidadesCondicionaisAtivas,
                                    marciais: characterData.singularidadesCondicionaisMarciaisAtivas,
                                    raciais: characterData.singularidadesCondicionaisRaciaisAtivas,
                                  }}
                                  saldoPe={characterData.pontosEvolucao.atual}
                                  context={{
                                    nivelAlma,
                                    raceId: characterData.raca,
                                    attributes: {
                                      carisma: characterData.carisma.nivel + (singularityBonuses.attributes.carisma ?? 0),
                                      finesse: characterData.finesse.nivel + (singularityBonuses.attributes.finesse ?? 0),
                                      forca: characterData.forca.nivel + (singularityBonuses.attributes.forca ?? 0),
                                      inteligencia: characterData.inteligencia.nivel + (singularityBonuses.attributes.inteligencia ?? 0),
                                      percepcao: characterData.percepcao.nivel + (singularityBonuses.attributes.percepcao ?? 0),
                                      vitalidade: characterData.vitalidade.nivel + (singularityBonuses.attributes.vitalidade ?? 0),
                                      vontade: characterData.vontade.nivel + (singularityBonuses.attributes.vontade ?? 0),
                                    },
                                    skills: characterData.skills,
                                    aptitudes: characterData.aptitudes,
                                  }}
                                  onToggleSelect={handleToggleSystemSingularity}
                                  onToggleConditional={handleToggleConditionalSystemSingularity}
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
              className="bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
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
