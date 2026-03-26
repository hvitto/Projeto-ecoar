import type { EcoarSingularity } from '@/data/ecoarSingularities'
import type { CreationSingularity } from '@/data/creationSingularities'
import { creationSingularities } from '@/data/creationSingularities'
import type { Singularity } from '@/data/singularities'
import { singularities } from '@/data/singularities'
import type { MartialSchoolSingularity } from '@/data/martialSchoolSingularities'
import { getAllMartialSchools } from '@/data/martialSchoolSingularities'
import { inferSingularityActivationType } from '@/lib/inferSingularityActivationType'
import { extractSimpleBonusesFromMartialText } from '@/lib/extractSimpleBonusesFromMartialText'

export type SystemSingularityKind = 'criacao' | 'ecoar' | 'marcial' | 'racional'

export type SystemSingularityActivationType = 'passiva' | 'condicional' | 'complexa' | 'ativa'

export type SimpleBonusesAggregate = {
  attributes: Record<string, number>
  skills: Record<string, number>
  corpo: number
  mente: number
  folego: number
  mana: number
}

export type SystemSingularityRequirements =
  | {
      kind: 'criacao'
      /** IDs de singularidades conflitantes (não pode possuir simultaneamente). */
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
      kind: 'racional'
      placeholder: true
    }

export type SystemSingularity = {
  id: string
  kind: SystemSingularityKind
  name: string
  description: string
  cost: number
  activationType: SystemSingularityActivationType
  /**
   * Bônus simples numéricos (para Aba 1).
   * - Ecoar: vem de `bonuses` (quando existir)
   * - Criação: vem de `bonuses`/`penalties` estruturados
   * - Marciais: será preenchido no to-do de parsing; aqui deixamos vazio por padrão
   */
  bonusesSimpleExtracted: SimpleBonusesAggregate
  requirements: SystemSingularityRequirements
}

const emptyBonuses: SimpleBonusesAggregate = {
  attributes: {},
  skills: {},
  corpo: 0,
  mente: 0,
  folego: 0,
  mana: 0,
}

function normalizeBonusesFromCreation(s: { bonuses?: any; penalties?: any }): SimpleBonusesAggregate {
  const out: SimpleBonusesAggregate = {
    attributes: {},
    skills: {},
    corpo: 0,
    mente: 0,
    folego: 0,
    mana: 0,
  }

  const bonuses = (s as any).bonuses as CreationSingularity['bonuses'] | undefined
  if (bonuses?.attributes) {
    out.attributes = { ...out.attributes, ...bonuses.attributes }
  }
  if (bonuses?.skills) {
    out.skills = { ...out.skills, ...bonuses.skills }
  }
  if (typeof bonuses?.corpo === 'number') out.corpo += bonuses.corpo
  if (typeof bonuses?.mente === 'number') out.mente += bonuses.mente
  if (typeof bonuses?.folego === 'number') out.folego += bonuses.folego
  if (typeof bonuses?.mana === 'number') out.mana += bonuses.mana

  const penalties = (s as any).penalties as CreationSingularity['penalties'] | undefined
  if (penalties?.attributes) {
    for (const [k, v] of Object.entries(penalties.attributes)) {
      out.attributes[k] = (out.attributes[k] ?? 0) + v
    }
  }
  // penalties.skills não existe hoje nos tipos de Criação/Base.
  return out
}

function normalizeBonusesFromEcoar(sing: EcoarSingularity): SimpleBonusesAggregate {
  if (!sing.bonuses) return emptyBonuses
  const out: SimpleBonusesAggregate = {
    attributes: { ...(sing.bonuses.attributes ?? {}) },
    skills: { ...(sing.bonuses.skills ?? {}) },
    corpo: typeof sing.bonuses.corpo === 'number' ? sing.bonuses.corpo : 0,
    mente: typeof sing.bonuses.mente === 'number' ? sing.bonuses.mente : 0,
    folego: typeof sing.bonuses.folego === 'number' ? sing.bonuses.folego : 0,
    mana: typeof sing.bonuses.mana === 'number' ? sing.bonuses.mana : 0,
  }
  return out
}

export function buildSystemSingularities(ecoarSingularities: EcoarSingularity[]): SystemSingularity[] {
  const out: SystemSingularity[] = []

  // --- Criação (inclui both data/creationSingularities and data/singularities) ---
  const baseCreation: CreationSingularity[] = creationSingularities
  for (const s of baseCreation) {
    const inferred = inferSingularityActivationType({
      kind: 'criacao',
      name: s.name,
      description: s.description,
      bonuses: s.bonuses,
      penalties: s.penalties,
    })
    out.push({
      id: s.id,
      kind: 'criacao',
      name: s.name,
      description: s.description,
      cost: s.cost,
      activationType: inferred,
      bonusesSimpleExtracted: normalizeBonusesFromCreation(s),
      requirements: { kind: 'criacao', conflictWithIds: s.requirements ?? [] },
    })
  }

  for (const s of singularities as Singularity[]) {
    const inferred = inferSingularityActivationType({
      kind: 'criacao',
      name: s.name,
      description: s.description,
      bonuses: s.bonuses,
      penalties: s.penalties,
    })
    out.push({
      id: s.id,
      kind: 'criacao',
      name: s.name,
      description: s.description,
      cost: s.cost,
      activationType: inferred,
      bonusesSimpleExtracted: normalizeBonusesFromCreation(s),
      requirements: { kind: 'criacao', conflictWithIds: s.requirements ?? [] },
    })
  }

  // --- Ecoar (vem do catálogo) ---
  for (const s of ecoarSingularities) {
    out.push({
      id: s.id,
      kind: 'ecoar',
      name: s.name,
      description: s.description,
      cost: s.cost,
      activationType: (s.activationType ?? 'complexa') as SystemSingularityActivationType,
      bonusesSimpleExtracted: normalizeBonusesFromEcoar(s),
      requirements: { kind: 'ecoar', requirements: s.requirements },
    })
  }

  // --- Marciais (todas as escolas) ---
  const allSchools = getAllMartialSchools()
  for (const school of allSchools) {
    for (const ms of school.singularities) {
      const inferred = inferSingularityActivationType({
        kind: 'marcial',
        name: ms.name,
        description: ms.description,
        effects: ms.effects,
      })
      out.push({
        id: ms.id,
        kind: 'marcial',
        name: ms.name,
        description: ms.description,
        cost: ms.cost,
        activationType: inferred,
        bonusesSimpleExtracted: extractSimpleBonusesFromMartialText({ description: ms.description, effects: ms.effects }),
        requirements: { kind: 'marcial', requirements: ms.requirements },
      })
    }
  }

  // --- Raciais placeholder (não implementadas) ---
  out.push({
    id: 'singularidades-raciais-placeholder',
    kind: 'racional',
    name: 'Singularidades Raciais',
    description: 'Placeholder: singularidades raciais ainda não estão implementadas.',
    cost: 0,
    activationType: 'complexa',
    bonusesSimpleExtracted: emptyBonuses,
    requirements: { kind: 'racional', placeholder: true },
  })

  return out
}

