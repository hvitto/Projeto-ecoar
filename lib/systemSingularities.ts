import type { EcoarSingularity } from '@/data/ecoarSingularities'
import type { CreationSingularity } from '@/data/creationSingularities'
import { creationSingularities } from '@/data/creationSingularities'
import type { Singularity } from '@/data/singularities'
import { singularities } from '@/data/singularities'
import type { MartialSchoolSingularity } from '@/data/martialSchoolSingularities'
import {
  getAllMartialSchools,
  getMartialSchoolDataById,
  getMartialSchoolSingularityById,
} from '@/data/martialSchoolSingularities'
import type { RacialSingularity } from '@/data/racialSingularities'
import { racialSingularities } from '@/data/racialSingularities'
import { getAllCacadaPowers, getAllCacadaEnhancements } from '@/data/pathSingularities'
import { pathBookEntries } from '@/data/pathBookContent'
import { inferSingularityActivationType } from '@/lib/inferSingularityActivationType'
import { extractSimpleBonusesFromMartialText } from '@/lib/extractSimpleBonusesFromMartialText'
import {
  buildEffectChannels,
  emptyNumericBonuses,
  type SingularityEffectChannels,
  type SingularityNumericBonuses,
} from '@/lib/singularityEffectChannels'

export type SystemSingularityKind = 'criacao' | 'ecoar' | 'marcial' | 'racial' | 'path'

export type SystemSingularityActivationType = 'passiva' | 'condicional' | 'complexa' | 'ativa'

export type SimpleBonusesAggregate = SingularityNumericBonuses

export type SystemSingularityRequirements =
  | {
      kind: 'criacao'
      conflictWithIds?: string[]
    }
  | {
      kind: 'ecoar'
      requirements?: EcoarSingularity['requirements']
    }
  | {
      kind: 'marcial'
      requirements?: MartialSchoolSingularity['requirements']
    }
  | {
      kind: 'racial'
      raceId: string
      previousIds?: string[]
      acquisitionPhase?: 'creation' | 'evolution'
    }
  | {
      kind: 'path'
    }

export type SystemSingularity = {
  id: string
  kind: SystemSingularityKind
  name: string
  description: string
  cost: number
  activationType: SystemSingularityActivationType
  bonusesSimpleExtracted: SimpleBonusesAggregate
  effectChannels: SingularityEffectChannels
  requirements: SystemSingularityRequirements
  isMastery?: boolean
}

function toNumeric(partial: {
  attributes?: Record<string, number>
  skills?: Record<string, number>
  corpo?: number
  mente?: number
  folego?: number
  mana?: number
  attack?: number
  damage?: number
  penetration?: number
  crit?: number
  maxDamage?: number
}): SingularityNumericBonuses {
  return {
    attributes: { ...(partial.attributes ?? {}) },
    skills: { ...(partial.skills ?? {}) },
    corpo: partial.corpo ?? 0,
    mente: partial.mente ?? 0,
    folego: partial.folego ?? 0,
    mana: partial.mana ?? 0,
    attack: partial.attack ?? 0,
    damage: partial.damage ?? 0,
    penetration: partial.penetration ?? 0,
    crit: partial.crit ?? 0,
    maxDamage: partial.maxDamage ?? 0,
  }
}

function normalizeBonusesFromCreation(s: { bonuses?: CreationSingularity['bonuses']; penalties?: CreationSingularity['penalties'] }): SingularityNumericBonuses {
  const out = emptyNumericBonuses()

  const bonuses = s.bonuses
  if (bonuses?.attributes) Object.assign(out.attributes, bonuses.attributes)
  if (bonuses?.skills) Object.assign(out.skills, bonuses.skills)
  if (typeof bonuses?.corpo === 'number') out.corpo += bonuses.corpo
  if (typeof bonuses?.mente === 'number') out.mente += bonuses.mente
  if (typeof bonuses?.folego === 'number') out.folego += bonuses.folego
  if (typeof bonuses?.mana === 'number') out.mana += bonuses.mana

  const penalties = s.penalties
  if (penalties?.attributes) {
    for (const [k, v] of Object.entries(penalties.attributes)) {
      out.attributes[k] = (out.attributes[k] ?? 0) + v
    }
  }
  if (penalties?.skills) {
    for (const [k, v] of Object.entries(penalties.skills)) {
      out.skills[k] = (out.skills[k] ?? 0) + v
    }
  }

  return out
}

function normalizeBonusesFromEcoar(sing: EcoarSingularity): SingularityNumericBonuses {
  const out = emptyNumericBonuses()
  const bonuses = sing.bonuses
  if (bonuses) {
    if (bonuses.attributes) Object.assign(out.attributes, bonuses.attributes)
    if (bonuses.skills) Object.assign(out.skills, bonuses.skills)
    if (typeof bonuses.corpo === 'number') out.corpo += bonuses.corpo
    if (typeof bonuses.mente === 'number') out.mente += bonuses.mente
    if (typeof bonuses.folego === 'number') out.folego += bonuses.folego
    if (typeof bonuses.mana === 'number') out.mana += bonuses.mana
  }
  const penalties = sing.penalties
  if (penalties?.attributes) {
    for (const [k, v] of Object.entries(penalties.attributes)) {
      out.attributes[k] = (out.attributes[k] ?? 0) + v
    }
  }
  return out
}

function normalizeBonusesFromRacial(sing: Pick<RacialSingularity, 'bonuses'>): SingularityNumericBonuses {
  if (!sing.bonuses) return emptyNumericBonuses()
  return toNumeric({
    attributes: sing.bonuses.attributes,
    skills: sing.bonuses.skills,
    corpo: sing.bonuses.corpo,
    mente: sing.bonuses.mente,
    folego: sing.bonuses.folego,
    mana: sing.bonuses.mana,
  })
}

function withChannels(
  base: Omit<SystemSingularity, 'effectChannels' | 'bonusesSimpleExtracted'> & {
    bonusesSimpleExtracted: SingularityNumericBonuses
    effectChannelsOverride?: SingularityEffectChannels
  },
): SystemSingularity {
  const effectChannels =
    base.effectChannelsOverride ??
    buildEffectChannels({
      singularityId: base.id,
      name: base.name,
      activationType: base.activationType,
      bonuses: base.bonusesSimpleExtracted,
    })
  const { effectChannelsOverride: _ignored, ...rest } = base
  return { ...rest, effectChannels }
}

function resolveMartialIsMastery(singularityId: string, sourceGroup?: string | null): boolean {
  const fromSing = getMartialSchoolSingularityById(singularityId)
  const schoolId =
    fromSing?.schoolId ??
    sourceGroup?.replace(/^sistema-marcial-/, '') ??
    undefined
  if (!schoolId) return false
  return getMartialSchoolDataById(schoolId)?.class === 'Maestria'
}

export function buildSystemSingularities(ecoarSingularities: EcoarSingularity[]): SystemSingularity[] {
  const out: SystemSingularity[] = []
  const existingIds = new Set<string>()
  const pushUnique = (value: SystemSingularity) => {
    if (existingIds.has(value.id)) return
    existingIds.add(value.id)
    out.push(value)
  }
  const dbCriacao = ecoarSingularities.filter((s) => s.systemType === 'criacao')
  const dbMarciais = ecoarSingularities.filter((s) => s.systemType === 'marcial')
  const dbRaciais = ecoarSingularities.filter((s) => s.systemType === 'racial')
  const dbEcoar = ecoarSingularities.filter((s) => !s.systemType || s.systemType === 'ecoar')
  const dbPath = ecoarSingularities.filter((s) => (s as { systemType?: string }).systemType === 'path')

  if (dbCriacao.length > 0) {
    for (const s of dbCriacao) {
      const bonuses = normalizeBonusesFromEcoar(s)
      const activationType = (s.activationType ??
        inferSingularityActivationType({
          kind: 'criacao',
          name: s.name,
          description: s.description,
          bonuses: s.bonuses,
          penalties: s.penalties,
        })) as SystemSingularityActivationType
      const conflicts = (s.requirementEntries ?? [])
        .filter((e) => e.type === 'conflict')
        .map((e) => e.value)
      pushUnique(
        withChannels({
          id: s.id,
          kind: 'criacao',
          name: s.name,
          description: s.description,
          cost: s.cost,
          activationType,
          bonusesSimpleExtracted: bonuses,
          effectChannelsOverride: s.effectChannels as SingularityEffectChannels | undefined,
          requirements: { kind: 'criacao', conflictWithIds: conflicts },
        }),
      )
    }
  } else {
    for (const s of creationSingularities) {
      const bonuses = normalizeBonusesFromCreation(s)
      const inferred = inferSingularityActivationType({
        kind: 'criacao',
        name: s.name,
        description: s.description,
        bonuses: s.bonuses,
        penalties: s.penalties,
      })
      pushUnique(
        withChannels({
          id: s.id,
          kind: 'criacao',
          name: s.name,
          description: s.description,
          cost: s.cost,
          activationType: inferred,
          bonusesSimpleExtracted: bonuses,
          requirements: { kind: 'criacao', conflictWithIds: s.requirements ?? [] },
        }),
      )
    }

    for (const s of singularities as Singularity[]) {
      const bonuses = normalizeBonusesFromCreation(s)
      const inferred = inferSingularityActivationType({
        kind: 'criacao',
        name: s.name,
        description: s.description,
        bonuses: s.bonuses,
        penalties: s.penalties,
      })
      pushUnique(
        withChannels({
          id: s.id,
          kind: 'criacao',
          name: s.name,
          description: s.description,
          cost: s.cost,
          activationType: inferred,
          bonusesSimpleExtracted: bonuses,
          requirements: { kind: 'criacao', conflictWithIds: s.requirements ?? [] },
        }),
      )
    }
  }

  for (const s of dbEcoar) {
    const bonuses = normalizeBonusesFromEcoar(s)
    const activationType = (s.activationType ??
      inferSingularityActivationType({
        kind: 'ecoar',
        name: s.name,
        description: s.description,
        effects: s.effects,
        bonuses: s.bonuses,
        penalties: s.penalties,
      })) as SystemSingularityActivationType
      pushUnique(
        withChannels({
          id: s.id,
          kind: 'ecoar',
          name: s.name,
          description: s.description,
          cost: s.cost,
          activationType,
          bonusesSimpleExtracted: bonuses,
          effectChannelsOverride: s.effectChannels as SingularityEffectChannels | undefined,
          requirements: { kind: 'ecoar', requirements: s.requirements },
        }),
      )
  }

  if (dbMarciais.length > 0) {
    for (const ms of dbMarciais) {
      const bonuses = normalizeBonusesFromEcoar(ms)
      const activationType = (ms.activationType ??
        inferSingularityActivationType({
          kind: 'marcial',
          name: ms.name,
          description: ms.description,
          bonuses: ms.bonuses,
          penalties: ms.penalties,
        })) as SystemSingularityActivationType
      pushUnique(
        withChannels({
          id: ms.id,
          kind: 'marcial',
          name: ms.name,
          description: ms.description,
          cost: ms.cost,
          activationType,
          bonusesSimpleExtracted: bonuses,
          effectChannelsOverride: ms.effectChannels as SingularityEffectChannels | undefined,
          requirements: { kind: 'marcial', requirements: ms.requirements as MartialSchoolSingularity['requirements'] | undefined },
          isMastery: resolveMartialIsMastery(ms.id, ms.sourceGroup),
        }),
      )
    }
  }
  for (const school of getAllMartialSchools()) {
    for (const ms of school.singularities) {
      if (existingIds.has(ms.id)) continue
      const bonuses = extractSimpleBonusesFromMartialText({ description: ms.description, effects: ms.effects })
      const inferred = inferSingularityActivationType({
        kind: 'marcial',
        name: ms.name,
        description: ms.description,
        effects: ms.effects,
        bonuses,
      })
      pushUnique(
        withChannels({
          id: ms.id,
          kind: 'marcial',
          name: ms.name,
          description: ms.description,
          cost: ms.cost,
          activationType: inferred,
          bonusesSimpleExtracted: bonuses,
          requirements: { kind: 'marcial', requirements: ms.requirements },
          isMastery: school.class === 'Maestria',
        }),
      )
    }
  }

  if (dbRaciais.length > 0) {
    for (const rs of dbRaciais) {
      const raceId =
        rs.sourceGroup?.replace(/^racial-/, '') ??
        rs.ecoarId?.replace(/^racial-/, '') ??
        'desconhecida'
      const previousIds = (rs.requirementEntries ?? [])
        .filter((entry) => entry.type === 'previous')
        .map((entry) => entry.value)
      const bonuses = normalizeBonusesFromEcoar(rs)
      const activationType = (rs.activationType ??
        inferSingularityActivationType({
          kind: 'racial',
          name: rs.name,
          description: rs.description,
          bonuses: rs.bonuses,
          penalties: rs.penalties,
        })) as SystemSingularityActivationType
      pushUnique(
        withChannels({
          id: rs.id,
          kind: 'racial',
          name: rs.name,
          description: rs.description,
          cost: rs.cost,
          activationType,
          bonusesSimpleExtracted: bonuses,
          effectChannelsOverride: rs.effectChannels as SingularityEffectChannels | undefined,
          requirements: {
            kind: 'racial',
            raceId,
            previousIds,
            acquisitionPhase: ((rs as { sourceMeta?: { acquisitionPhase?: string } }).sourceMeta?.acquisitionPhase ??
              'creation') as 'creation' | 'evolution',
          },
        }),
      )
    }
  } else {
    for (const rs of racialSingularities) {
      const bonuses = normalizeBonusesFromRacial(rs)
      pushUnique(
        withChannels({
          id: rs.id,
          kind: 'racial',
          name: rs.name,
          description: rs.description,
          cost: rs.cost,
          activationType: rs.activationType,
          bonusesSimpleExtracted: bonuses,
          requirements: {
            kind: 'racial',
            raceId: rs.raceId,
            previousIds: rs.requirements ?? [],
            acquisitionPhase: rs.acquisitionPhase ?? 'creation',
          },
        }),
      )
    }
  }

  if (dbPath.length > 0) {
    for (const s of dbPath) {
      const bonuses = normalizeBonusesFromEcoar(s)
      const activationType = (s.activationType ??
        inferSingularityActivationType({
          kind: 'path',
          name: s.name,
          description: s.description,
          effects: s.effects,
          bonuses: s.bonuses,
        })) as SystemSingularityActivationType
      pushUnique(
        withChannels({
          id: s.id,
          kind: 'path',
          name: s.name,
          description: s.description,
          cost: s.cost,
          activationType,
          bonusesSimpleExtracted: bonuses,
          requirements: { kind: 'path' },
        }),
      )
    }
  } else {
    for (const entry of pathBookEntries) {
      const bonuses = {
        ...emptyNumericBonuses(),
        attributes: entry.bonuses?.attributes ?? {},
        skills: entry.bonuses?.skills ?? {},
        corpo: entry.bonuses?.corpo ?? 0,
        mente: entry.bonuses?.mente ?? 0,
        folego: entry.bonuses?.folego ?? 0,
        mana: entry.bonuses?.mana ?? 0,
        attack: entry.bonuses?.attack ?? 0,
        damage: entry.bonuses?.damage ?? 0,
        penetration: entry.bonuses?.penetration ?? 0,
        crit: entry.bonuses?.crit ?? 0,
        maxDamage: entry.bonuses?.maxDamage ?? 0,
      }
      pushUnique(
        withChannels({
          id: entry.id,
          kind: 'path',
          name: entry.name,
          description: entry.description,
          cost: entry.cost,
          activationType: entry.activationType,
          bonusesSimpleExtracted: bonuses,
          requirements: { kind: 'path' },
        }),
      )
    }
    for (const power of getAllCacadaPowers()) {
      const bonuses = extractSimpleBonusesFromMartialText({
        description: power.description,
        effects: power.effects,
      })
      const inferred = inferSingularityActivationType({
        kind: 'path',
        name: power.name,
        description: power.description,
        effects: power.effects,
        bonuses,
      })
      pushUnique(
        withChannels({
          id: power.id,
          kind: 'path',
          name: power.name,
          description: power.description,
          cost: power.cost,
          activationType: inferred,
          bonusesSimpleExtracted: bonuses,
          requirements: { kind: 'path' },
        }),
      )
    }
    for (const enh of getAllCacadaEnhancements()) {
      const bonuses = extractSimpleBonusesFromMartialText({
        description: enh.description,
        effects: enh.effects,
      })
      const inferred = inferSingularityActivationType({
        kind: 'path',
        name: enh.name,
        description: enh.description,
        effects: enh.effects,
        bonuses,
      })
      pushUnique(
        withChannels({
          id: enh.id,
          kind: 'path',
          name: enh.name,
          description: enh.description,
          cost: enh.cost,
          activationType: inferred,
          bonusesSimpleExtracted: bonuses,
          requirements: { kind: 'path' },
        }),
      )
    }
  }

  return out
}
