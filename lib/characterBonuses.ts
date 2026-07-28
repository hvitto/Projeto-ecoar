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
  singularidadesPath?: string[]
  singularidadesCondicionaisCriacaoAtivas: string[]
  singularidadesCondicionaisAtivas: string[]
  singularidadesCondicionaisMarciaisAtivas: string[]
  singularidadesCondicionaisRaciaisAtivas: string[]
  singularidadesCondicionaisPathAtivas?: string[]
}

export function partitionCreationAndMartialSingularityIds(input: {
  singularidades: string[]
  singularidadesMarciais: string[]
  isMartialId: (id: string) => boolean
}): { criacao: string[]; marciais: string[] } {
  const criacao: string[] = []
  const marciaisFromCreation: string[] = []
  for (const id of input.singularidades) {
    if (input.isMartialId(id)) marciaisFromCreation.push(id)
    else criacao.push(id)
  }
  const marciais = Array.from(new Set([...input.singularidadesMarciais, ...marciaisFromCreation]))
  return { criacao, marciais }
}

export function aggregateSingularityInputFromCharacterData(
  characterData: CharacterSingularitySelectionSlice,
  options?: { isMartialId?: (id: string) => boolean },
): {
  selectedSingularityIdsByKind: {
    criacao: string[]
    ecoar: string[]
    marciais: string[]
    raciais: string[]
    path: string[]
  }
  conditionalEnabledIdsByKind: {
    criacao: string[]
    ecoar: string[]
    marciais: string[]
    raciais: string[]
    path: string[]
  }
} {
  const partitioned = options?.isMartialId
    ? partitionCreationAndMartialSingularityIds({
        singularidades: characterData.singularidades,
        singularidadesMarciais: characterData.singularidadesMarciais,
        isMartialId: options.isMartialId,
      })
    : {
        criacao: characterData.singularidades,
        marciais: characterData.singularidadesMarciais,
      }

  return {
    selectedSingularityIdsByKind: {
      criacao: partitioned.criacao,
      ecoar: characterData.singularidadesEcoar,
      marciais: partitioned.marciais,
      raciais: characterData.singularidadesRaciais,
      path: characterData.singularidadesPath ?? [],
    },
    conditionalEnabledIdsByKind: {
      criacao: characterData.singularidadesCondicionaisCriacaoAtivas,
      ecoar: characterData.singularidadesCondicionaisAtivas,
      marciais: characterData.singularidadesCondicionaisMarciaisAtivas,
      raciais: characterData.singularidadesCondicionaisRaciaisAtivas,
      path: characterData.singularidadesCondicionaisPathAtivas ?? [],
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
    attack: 0,
    damage: 0,
    penetration: 0,
    crit: 0,
    maxDamage: 0,
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
