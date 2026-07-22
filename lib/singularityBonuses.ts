import type { EcoarSingularity } from '@/data/ecoarSingularities'
import type { SystemSingularity } from '@/lib/systemSingularities'
import {
  emptyNumericBonuses,
  isConditionalEffectEnabled,
  mergeNumericBonuses,
  type SingularityNumericBonuses,
} from '@/lib/singularityEffectChannels'

export type SingularitiesBonusAggregate = SingularityNumericBonuses

const EMPTY = emptyNumericBonuses()

type LegacyEcoarAggregateArgs = {
  selectedSingularityIds: string[]
  conditionalEnabledIds: string[]
  getEcoarSingularityById: (id: string) => EcoarSingularity | undefined
}

type SystemAggregateArgs = {
  selectedSingularityIdsByKind: {
    criacao: string[]
    ecoar: string[]
    marciais: string[]
    raciais: string[]
    path?: string[]
  }
  conditionalEnabledIdsByKind: {
    criacao: string[]
    ecoar: string[]
    marciais: string[]
    raciais: string[]
    path?: string[]
  }
  getSystemSingularityById: (id: string) => SystemSingularity | undefined
}

function addBonusesToAggregate(out: SingularitiesBonusAggregate, add: SingularityNumericBonuses) {
  mergeNumericBonuses(out, add)
}

export function aggregateSimpleBonuses(args: LegacyEcoarAggregateArgs): SingularitiesBonusAggregate
export function aggregateSimpleBonuses(args: SystemAggregateArgs): SingularitiesBonusAggregate
export function aggregateSimpleBonuses(args: LegacyEcoarAggregateArgs | SystemAggregateArgs): SingularitiesBonusAggregate {
  const out = emptyNumericBonuses()

  if ('getEcoarSingularityById' in args) {
    const conditionalSet = new Set(args.conditionalEnabledIds)
    for (const id of args.selectedSingularityIds) {
      const sing = args.getEcoarSingularityById(id)
      if (!sing?.bonuses) continue
      const activationType = sing.activationType ?? 'complexa'
      if (activationType === 'ativa') continue
      if (activationType === 'condicional' && !conditionalSet.has(id)) continue
      if (activationType === 'complexa') {
        // legado: só aplica se houver bônus estruturados (tratados como passivos)
      }

      for (const [k, v] of Object.entries(sing.bonuses.attributes ?? {})) out.attributes[k] = (out.attributes[k] ?? 0) + v
      for (const [k, v] of Object.entries(sing.bonuses.skills ?? {})) out.skills[k] = (out.skills[k] ?? 0) + v
      if (typeof sing.bonuses.corpo === 'number') out.corpo += sing.bonuses.corpo
      if (typeof sing.bonuses.mente === 'number') out.mente += sing.bonuses.mente
      if (typeof sing.bonuses.folego === 'number') out.folego += sing.bonuses.folego
      if (typeof sing.bonuses.mana === 'number') out.mana += sing.bonuses.mana
    }
    return out
  }

  const systemArgs = args as SystemAggregateArgs
  const conditionalEnabledSets: Record<'criacao' | 'ecoar' | 'marciais' | 'raciais' | 'path', Set<string>> = {
    criacao: new Set(systemArgs.conditionalEnabledIdsByKind.criacao),
    ecoar: new Set(systemArgs.conditionalEnabledIdsByKind.ecoar),
    marciais: new Set(systemArgs.conditionalEnabledIdsByKind.marciais),
    raciais: new Set(systemArgs.conditionalEnabledIdsByKind.raciais),
    path: new Set(systemArgs.conditionalEnabledIdsByKind.path ?? []),
  }

  const addOne = (id: string, kind: 'criacao' | 'ecoar' | 'marciais' | 'raciais' | 'path') => {
    const sing = systemArgs.getSystemSingularityById(id)
    if (!sing) return

    const channels = sing.effectChannels
    if (channels) {
      addBonusesToAggregate(out, channels.passivos)
      for (const fx of channels.condicionais) {
        if (!isConditionalEffectEnabled(fx.id, sing.id, conditionalEnabledSets[kind])) continue
        addBonusesToAggregate(out, fx.bonuses)
      }
      return
    }

    const activationType = sing.activationType ?? 'complexa'
    if (activationType === 'ativa') return
    if (activationType === 'condicional' && !conditionalEnabledSets[kind].has(id)) return

    const b = sing.bonusesSimpleExtracted
    if (!b) return
    addBonusesToAggregate(out, {
      attributes: b.attributes ?? {},
      skills: b.skills ?? {},
      corpo: b.corpo ?? 0,
      mente: b.mente ?? 0,
      folego: b.folego ?? 0,
      mana: b.mana ?? 0,
      attack: b.attack ?? 0,
      damage: b.damage ?? 0,
      penetration: b.penetration ?? 0,
      crit: b.crit ?? 0,
      maxDamage: b.maxDamage ?? 0,
    })
  }

  for (const id of systemArgs.selectedSingularityIdsByKind.criacao) addOne(id, 'criacao')
  for (const id of systemArgs.selectedSingularityIdsByKind.ecoar) addOne(id, 'ecoar')
  for (const id of systemArgs.selectedSingularityIdsByKind.marciais) addOne(id, 'marciais')
  for (const id of systemArgs.selectedSingularityIdsByKind.raciais) addOne(id, 'raciais')
  for (const id of systemArgs.selectedSingularityIdsByKind.path ?? []) addOne(id, 'path')
  return out
}

export function emptySingularityBonuses(): SingularitiesBonusAggregate {
  return emptyNumericBonuses()
}
