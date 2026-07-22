'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  Sparkles, Shield, Heart, Brain, Zap, Eye,
  Sword, Edit,
} from 'lucide-react'
import {
  getAttributeModifier,
  calculateCharacterLimits,
  calculateCommonTests,
} from '@/lib/calculations'
import { skills as skillsDefinitions } from '@/data/skills'
import { getRaceById } from '@/data/races'
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
  type EquippedWeaponSlotId,
  type EquippedWeaponState,
  type UtilityCatalogEntry,
  type WeaponCatalogEntry,
} from '@/shared/types/equipment'
import { useCharacterSheetState } from '@/features/character/hooks/useCharacterSheetState'
import { useEquipmentOnSheet } from '@/features/character/hooks/useEquipmentOnSheet'
import type {
  CharacterAptitudesState,
  CharacterSkillState,
} from '@/features/character/hooks/sheetInitialState'
import {
  catalogDisplayLine,
  formatCerosDisplay,
  newCatalogInstanceId,
  parseCostLabelToCeros,
} from '@/lib/equipmentCost'
import Header from './Header'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useEquipmentCatalog } from '@/shared/contexts/EquipmentCatalogContext'
import { saveCharacter } from '@/lib/storage/characterStorage'
import CharacterSheetShell from '@/features/character/sheet/CharacterSheetShell'
import { SheetLayoutProvider } from '@/features/character/sheet/SheetLayoutProvider'
import { SheetRuntimeProvider, type SheetRuntimeValue } from '@/features/character/sheet/SheetRuntimeContext'
import { BasicoTab } from '@/features/character/sheet/tabs/BasicoTab'
import { EquipamentosTab } from '@/features/character/sheet/tabs/EquipamentosTab'
import { SingularidadesKindTab } from '@/features/character/sheet/tabs/SingularidadesKindTab'
import { renderBasicoWidget } from '@/features/character/sheet/widgets/renderBasicoWidget'
import { renderEquipamentosWidget } from '@/features/character/sheet/widgets/renderEquipamentosWidget'
import { renderSingularityWidget } from '@/features/character/sheet/widgets/renderSingularityWidgets'
import {
  normalizeSheetLayout,
  type SheetLayout,
  type SheetTabId,
} from '@/features/character/sheet/sheetLayoutTypes'

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

/** Labels do passo físico do wizard — mod. numérico = índice relativo a "Médio". */
const WIZARD_TAMANHO_LABELS = [
  'Minúsculo',
  'Muito Pequeno',
  'Pequeno',
  'Médio',
  'Grande',
  'Enorme',
  'Gigante',
  'Massivo',
  'Titânico',
  'Colossal',
  'Absurdo',
] as const
const WIZARD_PESO_LABELS = [
  'Peso Pena',
  'Miúdo',
  'Delicado',
  'Muito Leve',
  'Leve',
  'Médio',
  'Pesado',
  'Enorme',
  'Gigante',
  'Massivo',
  'Titânico',
  'Colossal',
  'Absurdo',
] as const

function modifierFromWizardSizeOrWeight(raw: unknown, kind: 'tamanho' | 'peso'): number | undefined {
  if (raw === undefined || raw === null) return undefined
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string') {
    const s = raw.trim()
    if (!s) return undefined
    const n = parseFloat(s)
    if (Number.isFinite(n) && /^-?\d+(\.\d+)?$/.test(s)) return n
    const labels = kind === 'tamanho' ? WIZARD_TAMANHO_LABELS : WIZARD_PESO_LABELS
    const mediumIdx = labels.indexOf('Médio')
    const idx = (labels as readonly string[]).indexOf(s)
    if (idx >= 0 && mediumIdx >= 0) return idx - mediumIdx
  }
  return undefined
}

interface CharacterSheetProps {
  initialData?: any
  canEdit?: boolean
  isTableGmEditor?: boolean
  tableId?: string | null
  onBackToDashboard?: () => void
  onOpenEvolution?: () => void
  onCharacterSaved?: (saved: any) => void
}

export default function CharacterSheet({
  initialData,
  canEdit,
  isTableGmEditor = false,
  tableId = null,
  onBackToDashboard,
  onOpenEvolution,
  onCharacterSaved,
}: CharacterSheetProps) {
  const { ecoarSingularities } = useEcoarCatalogData()
  const { characterData, setCharacterData } = useCharacterSheetState()

  const { user } = useAuth()
  const { weapons, armor, utilities } = useEquipmentCatalog()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const hasMasterOverride = isTableGmEditor
  const canEditSheet = !!canEdit || hasMasterOverride
  const editBackupRef = useRef<typeof characterData | null>(null)
  const initialDataRef = useRef<any>(initialData)
  const limitsAutoSaveTimeoutRef = useRef<number | null>(null)
  const userTriggeredLimitsRef = useRef(false)
  const conditionalsAutoSaveTimeoutRef = useRef<number | null>(null)
  const userTriggeredConditionalsRef = useRef(false)

  const [equipmentSubTab, setEquipmentSubTab] = useState<'inventario' | 'equipados'>('inventario')
  const [equipmentPickerOpen, setEquipmentPickerOpen] = useState(false)
  const [peToAdd, setPeToAdd] = useState<string>('')

  const peToAddNumber = useMemo(() => {
    const n = parseInt(peToAdd, 10)
    return Number.isFinite(n) ? n : 0
  }, [peToAdd])

  const {
    weaponCatalogById,
    armorCatalogById,
    utilityCatalogById,
    resolveCatalogEntryKind,
    equipmentMechanicalBonuses,
  } = useEquipmentOnSheet(characterData, weapons, armor, utilities)

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

        if (initialData.tracoPositivo !== undefined && initialData.tracoPositivo !== null) {
          updated.tracoPositivo = String(initialData.tracoPositivo)
        }
        if (initialData.tracoNegativo !== undefined && initialData.tracoNegativo !== null) {
          updated.tracoNegativo = String(initialData.tracoNegativo)
        }
        if (initialData.personalidade !== undefined && initialData.personalidade !== null) {
          updated.personalidade = String(initialData.personalidade)
        }

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

        const eqArmors = (initialData as any).equippedArmors
        const eqArmorLegacy = (initialData as any).equippedArmor
        const hasEquippedArmorsKey = Object.prototype.hasOwnProperty.call(initialData, 'equippedArmors')
        const hasEquippedArmorLegacyKey = Object.prototype.hasOwnProperty.call(initialData, 'equippedArmor')
        const hasEquippedAccessoriesKey = Object.prototype.hasOwnProperty.call(initialData, 'equippedAccessories')
        if (Array.isArray(eqArmors)) {
          updated.equippedArmors = eqArmors
            .filter((it: unknown) => it && typeof it === 'object' && typeof (it as any).instanceId === 'string')
            .map((it: any) => ({ instanceId: it.instanceId as string }))
        } else if (eqArmorLegacy && typeof eqArmorLegacy === 'object' && typeof (eqArmorLegacy as any).instanceId === 'string') {
          updated.equippedArmors = [{ instanceId: (eqArmorLegacy as any).instanceId as string }]
        } else {
          updated.equippedArmors = []
        }

        const eqAccessories = (initialData as any).equippedAccessories
        if (Array.isArray(eqAccessories)) {
          updated.equippedAccessories = eqAccessories
            .filter((it) => it && typeof it === 'object' && typeof (it as any).instanceId === 'string')
            .map((it) => ({ instanceId: (it as any).instanceId }))
        } else {
          updated.equippedAccessories = []
        }
        updated.hasVestuarioEquipState =
          hasEquippedArmorsKey || hasEquippedArmorLegacyKey || hasEquippedAccessoriesKey

        // Singularities selected in the wizard
        if (initialData.singularidades) {
          updated.singularidades = initialData.singularidades
        }
        if (initialData.singularidadesEcoar) {
          updated.singularidadesEcoar = initialData.singularidadesEcoar
        }
        if (Array.isArray((initialData as any).disturbios)) {
          updated.disturbios = (initialData as any).disturbios
        }
        if (Array.isArray((initialData as any).ecoarAcoes)) {
          updated.ecoarAcoes = (initialData as any).ecoarAcoes
        }
        if ((initialData as any).pontosEcoar && typeof (initialData as any).pontosEcoar === 'object') {
          updated.pontosEcoar = (initialData as any).pontosEcoar
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
        {
          const pathIds = [
            ...((Array.isArray((initialData as any).singularidadesPath)
              ? (initialData as any).singularidadesPath
              : []) as string[]),
            ...((Array.isArray((initialData as any).pathCacadaPowers)
              ? (initialData as any).pathCacadaPowers
              : []) as string[]),
            ...((Array.isArray((initialData as any).pathCacadaEnhancements)
              ? (initialData as any).pathCacadaEnhancements
              : []) as string[]),
          ]
          if (pathIds.length > 0) {
            updated.singularidadesPath = Array.from(new Set(pathIds))
          }
        }
        if (Array.isArray((initialData as any).singularidadesCondicionaisPathAtivas)) {
          updated.singularidadesCondicionaisPathAtivas = (initialData as any).singularidadesCondicionaisPathAtivas
        }
        if (Array.isArray((initialData as any).desvantagens)) {
          updated.desvantagens = (initialData as any).desvantagens
        }
        updated.sheetLayout = normalizeSheetLayout((initialData as any).sheetLayout)

        // Mod. tamanho/peso: número ou rótulo do wizard (ex.: "Médio" → 0)
        if (initialData.tamanho !== undefined && initialData.tamanho !== null) {
          const mod = modifierFromWizardSizeOrWeight(initialData.tamanho, 'tamanho')
          if (mod !== undefined) updated.tamanho = mod
        }
        if (initialData.peso !== undefined && initialData.peso !== null) {
          const mod = modifierFromWizardSizeOrWeight(initialData.peso, 'peso')
          if (mod !== undefined) updated.peso = mod
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
      const prevArmors = prev.equippedArmors ?? []
      const nextArmors = prevArmors.filter((it) => ownedIds.has(it.instanceId))
      const nextAccessories = (prev.equippedAccessories ?? []).filter((it) => ownedIds.has(it.instanceId))
      const armorsUnchanged =
        nextArmors.length === prevArmors.length && nextArmors.every((it, i) => it.instanceId === prevArmors[i]?.instanceId)
      const accessoriesUnchanged =
        nextAccessories.length === (prev.equippedAccessories ?? []).length &&
        nextAccessories.every((it, idx) => it.instanceId === (prev.equippedAccessories ?? [])[idx]?.instanceId)
      if (n1 === s1 && n2 === s2 && armorsUnchanged && accessoriesUnchanged) return prev
      return {
        ...prev,
        equippedWeapons: { slot1: n1, slot2: n2 },
        equippedArmors: nextArmors,
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
      const kind = resolveCatalogEntryKind(entry)
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
            kind,
            nome: entry.name,
            custoCeros,
            displayLine,
          },
        ],
        saldoMoedas: Math.max(0, prev.saldoMoedas - custoCeros),
      }
    })
  }, [resolveCatalogEntryKind])

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
                : kind === 'path'
                  ? prev.singularidadesPath.includes(id)
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

          if (kind === 'path') {
            const nextCond = prev.singularidadesCondicionaisPathAtivas.filter((it) => it !== id)
            return {
              ...prev,
              pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuais },
              singularidadesPath: [...prev.singularidadesPath, id],
              singularidadesCondicionaisPathAtivas: nextCond,
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
        if (kind === 'path') {
          return {
            ...prev,
            pontosEvolucao: { ...prev.pontosEvolucao, atual: nextAtuais },
            singularidadesPath: prev.singularidadesPath.filter((it) => it !== id),
            singularidadesCondicionaisPathAtivas: prev.singularidadesCondicionaisPathAtivas.filter((it) => it !== id),
          }
        }

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

        if (kind === 'path') {
          if (!prev.singularidadesPath.includes(id)) return prev
          return {
            ...prev,
            singularidadesCondicionaisPathAtivas: enabled
              ? [...prev.singularidadesCondicionaisPathAtivas.filter((it) => it !== id), id]
              : prev.singularidadesCondicionaisPathAtivas.filter((it) => it !== id),
          }
        }

        return prev
      })
      if (!isEditing) {
        userTriggeredConditionalsRef.current = true
      }
    },
    [canEditSheet, isEditing],
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
      const nextArmors = (prev.equippedArmors ?? []).filter((it) => it.instanceId !== instanceId)
      const nextAccessories = (prev.equippedAccessories ?? []).filter((it) => it.instanceId !== instanceId)
      return {
        ...prev,
        itensCatalogo: next,
        saldoMoedas: prev.saldoMoedas + refund,
        equippedWeapons: nextEquipped,
        equippedArmors: nextArmors,
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
    setCharacterData((prev) => {
      const current = prev.equippedArmors ?? []
      const already = current.some((it) => it.instanceId === instanceId)
      if (shouldEquip) {
        if (already) return prev
        return { ...prev, hasVestuarioEquipState: true, equippedArmors: [...current, { instanceId }] }
      }
      if (!already) return prev
      return {
        ...prev,
        hasVestuarioEquipState: true,
        equippedArmors: current.filter((it) => it.instanceId !== instanceId),
      }
    })
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
      characterData.singularidadesPath,
      characterData.singularidadesCondicionaisPathAtivas,
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

  const limitsSyncedRef = useRef(false)

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
    const limits = calculateCharacterLimits({
      vitalidade: vitalidadeEffective,
      vontade: vontadeEffective,
      nivelPoder,
      corpoBonus,
      menteBonus,
      folegoBonus,
      manaBonus,
    })

    return {
      corpoMax: limits.corpoMax,
      menteMax: limits.menteMax,
      folegoMax: limits.folegoMax,
      manaMax: limits.manaMax,
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

  useEffect(() => {
    if (limitsSyncedRef.current) return

    const limitKeys = ['corpo', 'mente', 'folego', 'mana'] as const
    const hasAnyPersistedLimit = limitKeys.some((key) => {
      const initial = initialDataRef.current?.[key]
      return (
        initial &&
        typeof initial === 'object' &&
        Number.isFinite((initial as { max?: number }).max) &&
        ((initial as { max?: number }).max ?? 0) > 0
      )
    })

    if (hasAnyPersistedLimit) {
      limitsSyncedRef.current = true
      return
    }

    limitsSyncedRef.current = true
    setCharacterData((prev) => ({
      ...prev,
      corpo: { atual: derivedValues.corpoMax, max: derivedValues.corpoMax },
      mente: { atual: derivedValues.menteMax, max: derivedValues.menteMax },
      folego: { atual: derivedValues.folegoMax, max: derivedValues.folegoMax },
      mana: { atual: derivedValues.manaMax, max: derivedValues.manaMax },
    }))
  }, [
    derivedValues.corpoMax,
    derivedValues.menteMax,
    derivedValues.folegoMax,
    derivedValues.manaMax,
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
      tracoPositivo: characterData.tracoPositivo,
      tracoNegativo: characterData.tracoNegativo,
      personalidade: characterData.personalidade,
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
      disturbios: characterData.disturbios,
      ecoarAcoes: characterData.ecoarAcoes,
      pontosEcoar: characterData.pontosEcoar,
      singularidadesCondicionaisAtivas: characterData.singularidadesCondicionaisAtivas,
      singularidadesCondicionaisCriacaoAtivas: characterData.singularidadesCondicionaisCriacaoAtivas,
      singularidadesMarciais: characterData.singularidadesMarciais,
      singularidadesCondicionaisMarciaisAtivas: characterData.singularidadesCondicionaisMarciaisAtivas,
      singularidadesCondicionaisRaciaisAtivas: characterData.singularidadesCondicionaisRaciaisAtivas,
      singularidadesRaciais: characterData.singularidadesRaciais,
      singularidadesPath: characterData.singularidadesPath,
      singularidadesCondicionaisPathAtivas: characterData.singularidadesCondicionaisPathAtivas,
      pathCacadaPowers: characterData.singularidadesPath,
      desvantagens: (characterData as { desvantagens?: string[] }).desvantagens ?? [],
      sheetLayout: characterData.sheetLayout,
      saldoMoedas: characterData.saldoMoedas,
      moeda: formatCerosDisplay(characterData.saldoMoedas),
      equippedWeapons: characterData.equippedWeapons,
      equippedArmors: characterData.equippedArmors,
      /** Compat.: leitores antigos que só conhecem uma armadura principal. */
      equippedArmor: characterData.equippedArmors[0],
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
    derivedValues.folegoMax,
    derivedValues.manaMax,
    handleAutoSaveLimits,
  ])

  useEffect(() => {
    if (isEditing) return
    if (!userTriggeredConditionalsRef.current) return
    userTriggeredConditionalsRef.current = false

    if (conditionalsAutoSaveTimeoutRef.current) {
      clearTimeout(conditionalsAutoSaveTimeoutRef.current)
      conditionalsAutoSaveTimeoutRef.current = null
    }

    conditionalsAutoSaveTimeoutRef.current = window.setTimeout(async () => {
      if (!user || !initialDataRef.current?.id) return
      try {
        const payload = buildFullPayload()
        const saved = await saveCharacter(user.id, payload as any)
        initialDataRef.current = saved.data
        onCharacterSaved?.(saved)
      } catch (e) {
        console.error('Erro ao salvar condicionais:', e)
      }
    }, 600)

    return () => {
      if (conditionalsAutoSaveTimeoutRef.current) {
        clearTimeout(conditionalsAutoSaveTimeoutRef.current)
        conditionalsAutoSaveTimeoutRef.current = null
      }
    }
  }, [
    isEditing,
    characterData.singularidadesCondicionaisAtivas,
    characterData.singularidadesCondicionaisCriacaoAtivas,
    characterData.singularidadesCondicionaisMarciaisAtivas,
    characterData.singularidadesCondicionaisRaciaisAtivas,
    characterData.singularidadesCondicionaisPathAtivas,
    buildFullPayload,
    onCharacterSaved,
    user,
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

  /** Armaduras principais (não acessório) consideradas equipadas, com fallback legado se o jogador nunca usou o estado explícito. */
  const equippedMainArmorEntries = useMemo(() => {
    const fromState = (characterData.equippedArmors ?? [])
      .map((state) => {
        const owned = characterData.itensCatalogo.find((i) => i.instanceId === state.instanceId && i.kind === 'armor')
        const entry = owned ? (armorCatalogById.get(String(owned.catalogId)) as ArmorCatalogEntry | undefined) : undefined
        return entry && entry.vestuarioTab !== 'acessorios' ? entry : null
      })
      .filter((entry): entry is ArmorCatalogEntry => !!entry)
    if (fromState.length > 0) return fromState
    if (characterData.hasVestuarioEquipState) return []
    const ownedArmor = characterData.itensCatalogo.filter((i) => i.kind === 'armor')
    if (ownedArmor.length === 0) return []
    const last = ownedArmor
      .map((owned) => armorCatalogById.get(String(owned.catalogId)) as ArmorCatalogEntry | undefined)
      .filter((entry): entry is ArmorCatalogEntry => !!entry && entry.vestuarioTab !== 'acessorios')
      .at(-1)
    return last ? [last] : []
  }, [armorCatalogById, characterData.equippedArmors, characterData.hasVestuarioEquipState, characterData.itensCatalogo])

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

  const equippedUtilityEntries = useMemo(() => {
    return (characterData.equippedAccessories ?? [])
      .map((state) => {
        const owned = characterData.itensCatalogo.find((i) => i.instanceId === state.instanceId && i.kind === 'utility')
        return owned ? (utilityCatalogById.get(String(owned.catalogId)) as UtilityCatalogEntry | undefined) : undefined
      })
      .filter((entry): entry is UtilityCatalogEntry => !!entry)
  }, [characterData.equippedAccessories, characterData.itensCatalogo, utilityCatalogById])

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
    const equippedEntries = [...equippedMainArmorEntries, ...equippedAccessoryEntries].filter(
      (entry): entry is ArmorCatalogEntry => !!entry,
    )
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
  }, [equippedMainArmorEntries, equippedAccessoryEntries, racialRules.physicalResistanceBonus])

  const totalArmorStats = useMemo(() => {
    const equippedEntries = [...equippedMainArmorEntries, ...equippedAccessoryEntries].filter(
      (entry): entry is ArmorCatalogEntry => !!entry,
    )
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
  }, [equippedMainArmorEntries, equippedAccessoryEntries])

  const markLimitsUserTriggered = useCallback(() => {
    userTriggeredLimitsRef.current = true
  }, [])

  const handleLayoutChange = useCallback((layout: SheetLayout) => {
    setCharacterData((prev) => ({ ...prev, sheetLayout: layout }))
  }, [setCharacterData])

  const handlePersistLayout = useCallback(
    async (layout: SheetLayout) => {
      setCharacterData((prev) => ({ ...prev, sheetLayout: layout }))
      if (!user || !initialDataRef.current?.id) return
      try {
        const payload = { ...buildFullPayload(), sheetLayout: layout }
        const saved = await saveCharacter(user.id, payload as any)
        initialDataRef.current = saved.data
        onCharacterSaved?.(saved)
      } catch (e) {
        console.error('Erro ao salvar layout da ficha:', e)
      }
    },
    [buildFullPayload, onCharacterSaved, setCharacterData, user],
  )

  const sheetRuntimeValue = useMemo<SheetRuntimeValue>(() => ({
    characterData,
    setCharacterData,
    updateField,
    isEditing,
    canEditSheet,
    hasMasterOverride,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    isSaving,
    onOpenEvolution,
    peToAdd,
    setPeToAdd,
    peToAddNumber,
    nivelAlma,
    nivelPoder,
    nivelTrilha,
    derivedValues,
    effectiveAttributesByKey,
    singularityBonuses,
    equipmentMechanicalBonuses,
    bookDisadvantageBonuses,
    attributes,
    activeSkillCategory,
    setActiveSkillCategory: setActiveSkillCategory as (v: string) => void,
    skillCategoryKeys: skillCategoryKeys as string[],
    categoryLabels,
    skillsByCategory: skillsByCategory as SheetRuntimeValue['skillsByCategory'],
    coerceInt,
    markLimitsUserTriggered,
    commonTests: derivedValues.commonTests,
    equipmentSpaces,
    equipmentSubTab,
    setEquipmentSubTab,
    equipmentPickerOpen,
    setEquipmentPickerOpen,
    toggleEquipWeaponInstance,
    toggleEquipArmorInstance,
    toggleEquipAccessoryInstance,
    findEquippedSlotForInstance,
    isArmorCatalogItem,
    isAccessoryCatalogItem,
    setEquippedWeaponSlot,
    removeSheetCatalogItem,
    handleEquipmentCatalogPick,
    applyRaceBonuses,
    weaponCatalogById,
    armorCatalogById: armorCatalogById as Map<string, ArmorCatalogEntry>,
    utilityCatalogById: utilityCatalogById as Map<string, UtilityCatalogEntry>,
    totalResistances,
    totalArmorStats,
    equippedMainArmorEntries,
    equippedAccessoryEntries,
    equippedUtilityEntries,
    characterId: initialDataRef.current?.id ? String(initialDataRef.current.id) : undefined,
    tableId,
  }), [
    characterData,
    setCharacterData,
    isEditing,
    canEditSheet,
    hasMasterOverride,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    isSaving,
    onOpenEvolution,
    peToAdd,
    peToAddNumber,
    nivelAlma,
    nivelPoder,
    nivelTrilha,
    derivedValues,
    effectiveAttributesByKey,
    singularityBonuses,
    equipmentMechanicalBonuses,
    bookDisadvantageBonuses,
    attributes,
    activeSkillCategory,
    skillCategoryKeys,
    categoryLabels,
    skillsByCategory,
    coerceInt,
    markLimitsUserTriggered,
    equipmentSpaces,
    equipmentSubTab,
    equipmentPickerOpen,
    toggleEquipWeaponInstance,
    toggleEquipArmorInstance,
    toggleEquipAccessoryInstance,
    findEquippedSlotForInstance,
    isArmorCatalogItem,
    isAccessoryCatalogItem,
    setEquippedWeaponSlot,
    removeSheetCatalogItem,
    handleEquipmentCatalogPick,
    weaponCatalogById,
    armorCatalogById,
    utilityCatalogById,
    totalResistances,
    totalArmorStats,
    equippedMainArmorEntries,
    equippedAccessoryEntries,
    equippedUtilityEntries,
    tableId,
  ])

  const renderActiveTab = useCallback(
    (tabId: SheetTabId) => {
      if (tabId === 'basico') {
        return <BasicoTab renderWidget={renderBasicoWidget} />
      }
      if (tabId === 'equipamentos') {
        return <EquipamentosTab renderWidget={renderEquipamentosWidget} />
      }
      return (
        <SingularidadesKindTab
          tabId={tabId}
          renderWidget={(id) =>
            renderSingularityWidget(tabId, id, {
              onToggleConditional: (kind, id, enabled) =>
                handleToggleConditionalSystemSingularity({ kind, id, enabled }),
            })
          }
        />
      )
    },
    [handleToggleConditionalSystemSingularity],
  )

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden overflow-x-hidden">
      <div className="flex-shrink-0">
        <Header onGoToDashboard={onBackToDashboard} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <SheetLayoutProvider
          key={String(initialData?.id ?? 'new')}
          initialLayout={normalizeSheetLayout(initialData?.sheetLayout ?? characterData.sheetLayout)}
          onLayoutChange={handleLayoutChange}
          onPersist={handlePersistLayout}
        >
          <SheetRuntimeProvider value={sheetRuntimeValue}>
            <CharacterSheetShell
              headerSlot={
                <div className="flex items-center justify-between gap-3 rounded-sm border border-slate-300/70 bg-white px-3 py-2.5 dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-800/80">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-ecoar-light-900/50">
                      Ficha de personagem
                    </div>
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-ecoar-light-900/90">
                      {characterData.nome?.trim() ? characterData.nome : 'Sem nome'}
                    </div>
                  </div>
                  {canEditSheet && !isEditing && (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-sm border border-ecoar-teal-500/35 bg-ecoar-teal-500/10 px-3 text-xs font-semibold text-ecoar-teal-800 transition-colors hover:bg-ecoar-teal-500/20 dark:text-ecoar-teal-300"
                      title="Editar personagem"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  )}
                  {canEditSheet && isEditing && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="inline-flex h-8 items-center rounded-sm border border-ecoar-teal-500/35 bg-ecoar-teal-500/10 px-3 text-xs font-semibold text-ecoar-teal-800 transition-colors hover:bg-ecoar-teal-500/20 disabled:opacity-60 dark:text-ecoar-teal-300"
                        title="Salvar alterações"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="inline-flex h-8 items-center rounded-sm border border-slate-300/80 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-ecoar-light-900/20 dark:text-ecoar-light-900/80 dark:hover:bg-ecoar-light-900/10"
                        title="Cancelar"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              }
              renderActiveTab={renderActiveTab}
            />
          </SheetRuntimeProvider>
        </SheetLayoutProvider>
      </div>
    </div>
  )
}
