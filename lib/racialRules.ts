import { getRacialSingularityById, getRacialSingularitiesByRaceId, type RacialRuleEffects } from '@/data/racialSingularities'

export type RacialRulesAggregate = {
  dodgeBonus: number
  initiativeBonus: number
  physicalResistanceBonus: number
  naturalDamageBonus: number
  naturalDamageByType: Partial<Record<'contundente' | 'cortante' | 'perfurante', number>>
  socialPenaltyGeneral: number
  socialBonusHostilize: number
  visionAttentionPenalty: number
  forceNoSizePenalty: boolean
  mentalResistanceBonus: number
  composturaBonus: number
}

const EMPTY: RacialRulesAggregate = {
  dodgeBonus: 0,
  initiativeBonus: 0,
  physicalResistanceBonus: 0,
  naturalDamageBonus: 0,
  naturalDamageByType: {},
  socialPenaltyGeneral: 0,
  socialBonusHostilize: 0,
  visionAttentionPenalty: 0,
  forceNoSizePenalty: false,
  mentalResistanceBonus: 0,
  composturaBonus: 0,
}

function mergeRule(out: RacialRulesAggregate, fx: RacialRuleEffects | undefined, nivelPoder: number) {
  if (!fx) return
  out.dodgeBonus += fx.dodgeBonus ?? 0
  out.initiativeBonus += fx.initiativeBonus ?? 0
  out.physicalResistanceBonus += fx.physicalResistanceBonus ?? 0
  out.naturalDamageBonus += fx.naturalDamageBonus ?? 0
  out.visionAttentionPenalty += fx.visionAttentionPenalty ?? 0
  out.mentalResistanceBonus += fx.mentalResistanceBonus ?? 0
  if (fx.forceNoSizePenalty) out.forceNoSizePenalty = true
  for (const [k, v] of Object.entries(fx.naturalDamageByType ?? {})) {
    out.naturalDamageByType[k as 'contundente' | 'cortante' | 'perfurante'] =
      (out.naturalDamageByType[k as 'contundente' | 'cortante' | 'perfurante'] ?? 0) + (v ?? 0)
  }
  if (fx.socialPenaltyByPowerLevelHalfUp) {
    out.socialPenaltyGeneral += Math.ceil(Math.max(0, nivelPoder) / 2)
  }
  if (fx.socialHostilizeBonusByPowerLevelHalfUp) {
    out.socialBonusHostilize += Math.ceil(Math.max(0, nivelPoder) / 2)
  }
  if (fx.composturaByPowerLevelHalfUp) {
    out.composturaBonus += Math.ceil(Math.max(0, nivelPoder) / 2)
  }
}

export function getRacialCreationExtraPoints(raceId: string): number {
  return getRacialSingularitiesByRaceId(raceId).reduce((sum, s) => sum + (s.ruleEffects?.creationPointsExtra ?? 0), 0)
}

export function aggregateRacialRulesBySelectedIds(selectedRacialIds: string[], nivelPoder: number): RacialRulesAggregate {
  const out: RacialRulesAggregate = { ...EMPTY, naturalDamageByType: {} }
  for (const id of selectedRacialIds) {
    const sing = getRacialSingularityById(id)
    if (!sing) continue
    mergeRule(out, sing.ruleEffects, nivelPoder)
  }
  return out
}
