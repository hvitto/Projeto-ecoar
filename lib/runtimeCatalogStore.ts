import type { EcoarSingularity } from '@/data/ecoarSingularities'
import type { CreationSingularity } from '@/data/creationSingularities'
import type { Disadvantage } from '@/data/disadvantages'
import type { RacialSingularity } from '@/data/racialSingularities'
import type { SingularityEffectChannels } from '@/lib/singularityEffectChannels'

type CatalogSnapshot = {
  singularities: EcoarSingularity[]
  source: 'database' | 'fallback' | 'static'
}

let snapshot: CatalogSnapshot | null = null

export function setRuntimeCatalog(singularities: EcoarSingularity[], source: CatalogSnapshot['source'] = 'database') {
  snapshot = { singularities, source }
}

export function clearRuntimeCatalog() {
  snapshot = null
}

export function getRuntimeCatalogSingularities(): EcoarSingularity[] | null {
  return snapshot?.singularities ?? null
}

export function getRuntimeCatalogSource(): CatalogSnapshot['source'] | null {
  return snapshot?.source ?? null
}

function asBonuses(s: EcoarSingularity): CreationSingularity['bonuses'] {
  return s.bonuses
}

export function mapCatalogToCreationSingularities(list: EcoarSingularity[]): CreationSingularity[] {
  return list
    .filter((s) => s.systemType === 'criacao')
    .map((s) => {
      const category = (s.sourceMeta?.category as CreationSingularity['category'] | undefined) ?? 'talentos'
      const conflicts = (s.requirementEntries ?? [])
        .filter((e) => e.type === 'conflict')
        .map((e) => e.value)
      return {
        id: s.id,
        name: s.name,
        category,
        description: s.description,
        cost: s.cost,
        requirements: conflicts.length ? conflicts : undefined,
        bonuses: asBonuses(s),
        penalties: s.penalties,
      }
    })
}

export function mapCatalogToDisadvantages(list: EcoarSingularity[]): Disadvantage[] {
  return list
    .filter((s) => s.systemType === 'desvantagem')
    .map((s) => {
      const category = (s.sourceMeta?.category as Disadvantage['category'] | undefined) ?? 'atributos'
      const penalties = {
        attributes: s.bonuses?.attributes,
        skills: s.bonuses?.skills,
        corpo: s.bonuses?.corpo,
        mente: s.bonuses?.mente,
        folego: s.bonuses?.folego,
        mana: s.bonuses?.mana,
      }
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        pontosCriacao: Math.abs(s.cost),
        category,
        penalties,
      }
    })
}

export function mapCatalogToRacialSingularities(list: EcoarSingularity[]): RacialSingularity[] {
  return list
    .filter((s) => s.systemType === 'racial')
    .map((s) => {
      const raceId =
        (s.sourceMeta?.raceId as string | undefined) ??
        s.sourceGroup?.replace(/^racial-/, '') ??
        s.ecoarId.replace(/^racial-/, '')
      const previous = (s.requirementEntries ?? [])
        .filter((e) => e.type === 'previous')
        .map((e) => e.value)
      return {
        id: s.id,
        raceId,
        name: s.name,
        description: s.description,
        cost: s.cost,
        activationType: (s.activationType ?? 'complexa') as RacialSingularity['activationType'],
        requirements: previous.length ? previous : undefined,
        effects: s.effects,
        bonuses: s.bonuses,
        acquisitionPhase: (s.sourceMeta?.acquisitionPhase as 'creation' | 'evolution' | undefined) ?? 'creation',
      }
    })
}

export function getEffectChannelsFromCatalogEntry(
  s: EcoarSingularity,
): SingularityEffectChannels | undefined {
  const raw = (s as { effectChannels?: SingularityEffectChannels }).effectChannels
  if (raw && typeof raw === 'object') return raw
  return undefined
}
