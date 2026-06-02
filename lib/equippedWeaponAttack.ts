import { getSkillDice, getAptitudeDice } from '@/lib/calculations'
import { skills as skillsDefinitions } from '@/data/skills'
import { aptitudes as aptitudesDefinitions } from '@/data/aptitudes'
import type { WeaponCatalogEntry } from '@/shared/types/equipment'

const ATTRIBUTE_STATE_KEYS = [
  'carisma',
  'finesse',
  'forca',
  'inteligencia',
  'percepcao',
  'vitalidade',
  'vontade',
] as const

export type AttributeStateKey = (typeof ATTRIBUTE_STATE_KEYS)[number]

export const normalizeAttackTestText = (input: string): string => {
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

export type CharacterSkillState = Record<string, { level: number; specialization?: string }>
export type CharacterAptitudesState = Record<string, number>

export type AttackResolutionCharacterData = {
  skills?: CharacterSkillState
  aptitudes?: CharacterAptitudesState
} & Record<string, { mod?: number } | unknown>

export type AttackResolutionInput = {
  entry: WeaponCatalogEntry | undefined
  characterData: AttackResolutionCharacterData
}

/**
 * Texto de ataque automático (dado + mod. de atributo) a partir de `attackTest` do catálogo.
 * Devolve `null` se não for possível resolver (usa-se então o texto bruto ou "—").
 */
export function resolveWeaponAttackAutoText(input: AttackResolutionInput): string | null {
  const { entry, characterData } = input
  const raw = entry?.attackTest
  if (!raw || typeof raw !== 'string') return null

  const normalized = normalizeAttackTestText(raw)
  const match = normalized.match(/^(.+?)\s*\+\s*([^(]+?)\s*\(([^)]+)\)\s*$/)
  if (!match) return raw

  const attrNorm = match[1].trim()
  const skillNameNorm = match[2].trim()
  const specLabelNorm = match[3].trim()

  const attributeKey = ATTRIBUTE_KEY_BY_ATTACK_TEST_LABEL[attrNorm]
  if (!attributeKey) return raw

  const attrModRaw = (characterData as Record<string, { mod?: number } | undefined>)?.[attributeKey]?.mod
  const attrMod =
    typeof attrModRaw === 'number' ? attrModRaw : parseInt(String(attrModRaw ?? 0), 10) || 0

  const skillsByNormalizedName = new Map<string, (typeof skillsDefinitions)[number]>()
  skillsDefinitions.forEach((skill) => {
    skillsByNormalizedName.set(normalizeAttackTestText(skill.name), skill)
  })

  const aptitudesByNormalizedLabel = new Map<string, (typeof aptitudesDefinitions)[number]>()
  aptitudesDefinitions.forEach((apt) => {
    aptitudesByNormalizedLabel.set(normalizeAttackTestText(apt.name), apt)
    aptitudesByNormalizedLabel.set(normalizeAttackTestText(apt.id), apt)
  })

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
    const aptLevel = typeof aptLevelRaw === 'number' ? aptLevelRaw : parseInt(String(aptLevelRaw ?? 0), 10) || 0
    diceText = getAptitudeDice(aptLevel)
  }

  if (!diceText) return null

  return `${diceText} ${attrMod >= 0 ? '+' : '-'} ${Math.abs(attrMod)}`
}
