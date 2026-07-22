import { formatDiceWithModifier, getSkillDice, getAptitudeDice } from '@/lib/calculations'
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
  getAttributeMod?: (key: AttributeStateKey) => number
  getSkillBonus?: (skillId: string) => number
  extraAttackBonus?: number
}

export type WeaponAttackResolved = {
  text: string
  diceText: string
  attributeKey: AttributeStateKey
  skillId?: string
  totalMod: number
}

function readStoredAttrMod(
  characterData: AttackResolutionCharacterData,
  attributeKey: AttributeStateKey,
): number {
  const attrModRaw = (characterData as Record<string, { mod?: number } | undefined>)?.[attributeKey]?.mod
  return typeof attrModRaw === 'number' ? attrModRaw : parseInt(String(attrModRaw ?? 0), 10) || 0
}

export function resolveWeaponAttackDetails(
  input: AttackResolutionInput,
): WeaponAttackResolved | { text: string; raw: true } | null {
  const { entry, characterData, getAttributeMod, getSkillBonus, extraAttackBonus = 0 } = input
  const raw = entry?.attackTest
  if (!raw || typeof raw !== 'string') return null

  const normalized = normalizeAttackTestText(raw)
  const match = normalized.match(/^(.+?)\s*\+\s*([^(]+?)\s*\(([^)]+)\)\s*$/)
  if (!match) return { text: raw, raw: true }

  const attrNorm = match[1].trim()
  const skillNameNorm = match[2].trim()
  const specLabelNorm = match[3].trim()

  const attributeKey = ATTRIBUTE_KEY_BY_ATTACK_TEST_LABEL[attrNorm]
  if (!attributeKey) return { text: raw, raw: true }

  const attrMod = getAttributeMod?.(attributeKey) ?? readStoredAttrMod(characterData, attributeKey)

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
  let skillId: string | undefined
  if (skillDef) {
    skillId = skillDef.id
    const specializationId =
      skillDef.specializations.find((sp) => normalizeAttackTestText(sp.name) === specLabelNorm)?.id ??
      skillDef.specializations.find((sp) => normalizeAttackTestText(sp.id) === specLabelNorm)?.id ??
      (specLabelNorm === 'arqueria'
        ? skillDef.specializations.find((sp) => normalizeAttackTestText(sp.id) === 'arqueira')?.id
        : undefined)

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

  const skillBonus = skillId && getSkillBonus ? getSkillBonus(skillId) : 0
  const totalMod = attrMod + skillBonus + extraAttackBonus

  return {
    text: formatDiceWithModifier(diceText, totalMod),
    diceText,
    attributeKey,
    skillId,
    totalMod,
  }
}

export function resolveWeaponAttackAutoText(input: AttackResolutionInput): string | null {
  const resolved = resolveWeaponAttackDetails(input)
  if (!resolved) return null
  return resolved.text
}
