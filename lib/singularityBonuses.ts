import type { EcoarSingularity } from '@/data/ecoarSingularities'
import type { SystemSingularity } from '@/lib/systemSingularities'

export type SingularitiesBonusAggregate = {
  attributes: Record<string, number>
  skills: Record<string, number>
  corpo: number
  mente: number
  folego: number
  mana: number
}

const EMPTY: SingularitiesBonusAggregate = {
  attributes: {},
  skills: {},
  corpo: 0,
  mente: 0,
  folego: 0,
  mana: 0,
}

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
  }
  conditionalEnabledIdsByKind: {
    criacao: string[]
    ecoar: string[]
    marciais: string[]
  }
  getSystemSingularityById: (id: string) => SystemSingularity | undefined
}

export function aggregateSimpleBonuses(args: LegacyEcoarAggregateArgs): SingularitiesBonusAggregate
export function aggregateSimpleBonuses(args: SystemAggregateArgs): SingularitiesBonusAggregate
export function aggregateSimpleBonuses(args: LegacyEcoarAggregateArgs | SystemAggregateArgs): SingularitiesBonusAggregate {
  const out: SingularitiesBonusAggregate = {
    attributes: {},
    skills: {},
    corpo: 0,
    mente: 0,
    folego: 0,
    mana: 0,
  }

  // Legacy: Ecoar-only.
  if ('getEcoarSingularityById' in args) {
    const conditionalSet = new Set(args.conditionalEnabledIds)
    for (const id of args.selectedSingularityIds) {
      const sing = args.getEcoarSingularityById(id)
      if (!sing?.bonuses) continue
      const activationType = sing.activationType ?? 'complexa'
      if (activationType === 'complexa' || activationType === 'ativa') continue
      if (activationType === 'condicional' && !conditionalSet.has(id)) continue

      for (const [k, v] of Object.entries(sing.bonuses.attributes ?? {})) out.attributes[k] = (out.attributes[k] ?? 0) + v
      for (const [k, v] of Object.entries(sing.bonuses.skills ?? {})) out.skills[k] = (out.skills[k] ?? 0) + v
      if (typeof sing.bonuses.corpo === 'number') out.corpo += sing.bonuses.corpo
      if (typeof sing.bonuses.mente === 'number') out.mente += sing.bonuses.mente
      if (typeof sing.bonuses.folego === 'number') out.folego += sing.bonuses.folego
      if (typeof sing.bonuses.mana === 'number') out.mana += sing.bonuses.mana
    }
    return out
  }

  // System: Criação + Ecoar + Marciais.
  const systemArgs = args as SystemAggregateArgs
  const conditionalEnabledSets: Record<'criacao' | 'ecoar' | 'marciais', Set<string>> = {
    criacao: new Set(systemArgs.conditionalEnabledIdsByKind.criacao),
    ecoar: new Set(systemArgs.conditionalEnabledIdsByKind.ecoar),
    marciais: new Set(systemArgs.conditionalEnabledIdsByKind.marciais),
  }

  const addOne = (id: string, kind: 'criacao' | 'ecoar' | 'marciais') => {
    const sing = systemArgs.getSystemSingularityById(id)
    if (!sing) return

    const activationType = sing.activationType ?? 'complexa'
    if (activationType === 'complexa' || activationType === 'ativa') return
    if (activationType === 'condicional' && !conditionalEnabledSets[kind].has(id)) return

    const b = sing.bonusesSimpleExtracted
    if (!b) return
    for (const [k, v] of Object.entries(b.attributes ?? {})) out.attributes[k] = (out.attributes[k] ?? 0) + v
    for (const [k, v] of Object.entries(b.skills ?? {})) out.skills[k] = (out.skills[k] ?? 0) + v
    out.corpo += typeof b.corpo === 'number' ? b.corpo : 0
    out.mente += typeof b.mente === 'number' ? b.mente : 0
    out.folego += typeof b.folego === 'number' ? b.folego : 0
    out.mana += typeof b.mana === 'number' ? b.mana : 0
  }

  for (const id of systemArgs.selectedSingularityIdsByKind.criacao) addOne(id, 'criacao')
  for (const id of systemArgs.selectedSingularityIdsByKind.ecoar) addOne(id, 'ecoar')
  for (const id of systemArgs.selectedSingularityIdsByKind.marciais) addOne(id, 'marciais')
  return out
}

export function emptySingularityBonuses(): SingularitiesBonusAggregate {
  return {
    attributes: { ...EMPTY.attributes },
    skills: { ...EMPTY.skills },
    corpo: 0,
    mente: 0,
    folego: 0,
    mana: 0,
  }
}
