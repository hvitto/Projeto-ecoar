import { getAttributeModifier } from '@/lib/calculations'
import type { SingularitiesBonusAggregate } from '@/lib/singularityBonuses'
import { getDisadvantageById } from '@/data/disadvantages'

export const CHARACTER_ATTRIBUTE_KEYS = [
  'carisma',
  'finesse',
  'forca',
  'inteligencia',
  'percepcao',
  'vitalidade',
  'vontade',
] as const

export type CharacterAttributeKey = (typeof CHARACTER_ATTRIBUTE_KEYS)[number]

export type CharacterSingularitySelectionSlice = {
  singularidades: string[]
  singularidadesEcoar: string[]
  singularidadesMarciais: string[]
  singularidadesRaciais: string[]
  singularidadesCondicionaisCriacaoAtivas: string[]
  singularidadesCondicionaisAtivas: string[]
  singularidadesCondicionaisMarciaisAtivas: string[]
  singularidadesCondicionaisRaciaisAtivas: string[]
}

/** Monta o payload esperado por `aggregateSimpleBonuses` (system catalog). */
export function aggregateSingularityInputFromCharacterData(
  characterData: CharacterSingularitySelectionSlice,
): {
  selectedSingularityIdsByKind: {
    criacao: string[]
    ecoar: string[]
    marciais: string[]
    raciais: string[]
  }
  conditionalEnabledIdsByKind: {
    criacao: string[]
    ecoar: string[]
    marciais: string[]
    raciais: string[]
  }
} {
  return {
    selectedSingularityIdsByKind: {
      criacao: characterData.singularidades,
      ecoar: characterData.singularidadesEcoar,
      marciais: characterData.singularidadesMarciais,
      raciais: characterData.singularidadesRaciais,
    },
    conditionalEnabledIdsByKind: {
      criacao: characterData.singularidadesCondicionaisCriacaoAtivas,
      ecoar: characterData.singularidadesCondicionaisAtivas,
      marciais: characterData.singularidadesCondicionaisMarciaisAtivas,
      raciais: characterData.singularidadesCondicionaisRaciaisAtivas,
    },
  }
}

export type EffectiveAttributeRow = {
  storedLevel: number
  singularityBonus: number
  bookDisadvantageBonus: number
  equipmentBonus: number
  effectiveLevel: number
  effectiveMod: number
}

/** Soma penalidades numéricas das desvantagens do livro (criação). */
export function aggregateBookDisadvantagePenalties(ids: string[]): SingularitiesBonusAggregate {
  const out: SingularitiesBonusAggregate = {
    attributes: {},
    skills: {},
    corpo: 0,
    mente: 0,
    folego: 0,
    mana: 0,
  }
  for (const id of ids) {
    const d = getDisadvantageById(id)
    const pen = d?.penalties
    if (!pen) continue
    for (const [k, v] of Object.entries(pen.attributes ?? {})) {
      out.attributes[k] = (out.attributes[k] ?? 0) + v
    }
    for (const [k, v] of Object.entries(pen.skills ?? {})) {
      out.skills[k] = (out.skills[k] ?? 0) + v
    }
    if (typeof pen.corpo === 'number') out.corpo += pen.corpo
    if (typeof pen.mente === 'number') out.mente += pen.mente
    if (typeof pen.folego === 'number') out.folego += pen.folego
    if (typeof pen.mana === 'number') out.mana += pen.mana
  }
  return out
}

/**
 * Nível na ficha já inclui raça e escola marcial (criação); singularidades e equipamento somam para o mod efetivo.
 */
export function computeEffectiveAttributeRows(
  characterData: Record<string, { nivel?: number | string } | undefined>,
  singularityBonuses: SingularitiesBonusAggregate,
  equipmentAttributeBonuses: Partial<Record<CharacterAttributeKey, number>> = {},
  bookDisadvantageAttributeBonuses: Partial<Record<CharacterAttributeKey, number>> = {},
): Record<CharacterAttributeKey, EffectiveAttributeRow> {
  const out = {} as Record<CharacterAttributeKey, EffectiveAttributeRow>
  for (const k of CHARACTER_ATTRIBUTE_KEYS) {
    const raw = characterData[k]?.nivel
    const storedLevel = typeof raw === 'string' ? parseInt(raw, 10) || 0 : raw ?? 0
    const singularityBonus = singularityBonuses.attributes[k] ?? 0
    const bookDisadvantageBonus = bookDisadvantageAttributeBonuses[k] ?? 0
    const equipmentBonus = equipmentAttributeBonuses[k] ?? 0
    const effectiveLevel = storedLevel + singularityBonus + bookDisadvantageBonus + equipmentBonus
    out[k] = {
      storedLevel,
      singularityBonus,
      bookDisadvantageBonus,
      equipmentBonus,
      effectiveLevel,
      effectiveMod: getAttributeModifier(effectiveLevel),
    }
  }
  return out
}

/** Separa entradas positivas e negativas para exibição (bônus vs desvantagens). */
export function partitionSignedBonuses(aggregate: SingularitiesBonusAggregate): {
  bonusAttributes: Record<string, number>
  penaltyAttributes: Record<string, number>
  bonusSkills: Record<string, number>
  penaltySkills: Record<string, number>
} {
  const bonusAttributes: Record<string, number> = {}
  const penaltyAttributes: Record<string, number> = {}
  for (const [k, v] of Object.entries(aggregate.attributes)) {
    if (v > 0) bonusAttributes[k] = v
    else if (v < 0) penaltyAttributes[k] = v
  }
  const bonusSkills: Record<string, number> = {}
  const penaltySkills: Record<string, number> = {}
  for (const [k, v] of Object.entries(aggregate.skills)) {
    if (v > 0) bonusSkills[k] = v
    else if (v < 0) penaltySkills[k] = v
  }
  return { bonusAttributes, penaltyAttributes, bonusSkills, penaltySkills }
}
