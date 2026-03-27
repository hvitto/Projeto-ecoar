import { sql } from '@/lib/db'
import type { Ecoar } from '@/data/ecoar'
import type { EcoarSingularity } from '@/data/ecoarSingularities'
import { ecoarCatalogSeed, ecoarSingularitiesSeed } from '@/data/ecoarCatalogSeed'

type EcoarCatalogRow = {
  id: string
  name: string
  type: string
  acquisition_requirement: string
  acquisition_cost: number
  description: string
}

type EcoarSingularityRow = {
  id: string
  ecoar_id: string
  system_type: 'ecoar' | 'criacao' | 'marcial' | 'racial' | null
  source_group: string | null
  name: string
  description: string
  cost: number
  activation_type: 'passiva' | 'condicional' | 'complexa' | 'ativa' | null
  bonuses_simple: unknown
}

export async function listActiveEcoarCatalog(): Promise<Ecoar[]> {
  const rows = (await sql`
    SELECT id, name, type, acquisition_requirement, acquisition_cost, description
    FROM ecoar_catalog
    WHERE is_active = true
    ORDER BY name
  `) as EcoarCatalogRow[]

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type as Ecoar['type'],
    description: r.description,
  }))
}

export async function listActiveEcoarSingularities(): Promise<EcoarSingularity[]> {
  const rows = (await sql`
    SELECT id, ecoar_id, system_type, source_group, name, description, cost, activation_type, bonuses_simple
    FROM ecoar_singularities
    WHERE is_active = true
    ORDER BY system_type NULLS LAST, source_group NULLS LAST, ecoar_id, tier NULLS LAST, name
  `) as EcoarSingularityRow[]

  const reqRows = (await sql`
    SELECT singularity_id, requirement_type, requirement_key, requirement_value, numeric_value
    FROM ecoar_singularity_requirements
  `) as Array<{
    singularity_id: string
    requirement_type: string
    requirement_key: string | null
    requirement_value: string
    numeric_value: number | null
  }>

  const fxRows = (await sql`
    SELECT singularity_id, effect_type, title, description, display_order
    FROM ecoar_singularity_effects
    ORDER BY singularity_id, display_order, id
  `) as Array<{
    singularity_id: string
    effect_type: string
    title: string | null
    description: string
    display_order: number
  }>

  const reqBySing = new Map<string, EcoarSingularity['requirements']>()
  const reqEntriesBySing = new Map<string, NonNullable<EcoarSingularity['requirementEntries']>>()
  for (const rr of reqRows) {
    const cur = reqBySing.get(rr.singularity_id) ?? {}
    if (rr.requirement_type === 'previous') cur.previous = rr.requirement_value
    if (rr.requirement_type === 'nivelAlma') cur.nivelAlma = rr.numeric_value ?? undefined
    reqBySing.set(rr.singularity_id, cur)

    const reqEntries = reqEntriesBySing.get(rr.singularity_id) ?? []
    reqEntries.push({
      type: rr.requirement_type,
      key: rr.requirement_key ?? undefined,
      value: rr.requirement_value,
      numericValue: rr.numeric_value ?? undefined,
    })
    reqEntriesBySing.set(rr.singularity_id, reqEntries)
  }

  const fxEntriesBySing = new Map<string, NonNullable<EcoarSingularity['effectEntries']>>()
  for (const fx of fxRows) {
    const cur = fxEntriesBySing.get(fx.singularity_id) ?? []
    cur.push({
      type: fx.effect_type,
      title: fx.title ?? undefined,
      description: fx.description,
      displayOrder: fx.display_order,
    })
    fxEntriesBySing.set(fx.singularity_id, cur)
  }

  return rows.map((r) => ({
    id: r.id,
    ecoarId: r.ecoar_id,
    systemType: r.system_type ?? 'ecoar',
    sourceGroup: r.source_group ?? undefined,
    name: r.name,
    description: r.description,
    cost: r.cost,
    activationType: r.activation_type ?? 'complexa',
    requirements: reqBySing.get(r.id),
    requirementEntries: reqEntriesBySing.get(r.id),
    effectEntries: fxEntriesBySing.get(r.id),
    effects: fxEntriesBySing.get(r.id)?.map((fx) => fx.description).join('\n'),
    bonuses: (() => {
      const v = r.bonuses_simple as unknown
      if (!v) return undefined
      if (typeof v === 'string') {
        try {
          return JSON.parse(v) as EcoarSingularity['bonuses']
        } catch {
          return undefined
        }
      }
      // If JSONB came as object already
      return v as EcoarSingularity['bonuses']
    })(),
  }))
}

export async function getEcoarCatalogPayloadFromDb(): Promise<{ ecoarTypes: Ecoar[]; ecoarSingularities: EcoarSingularity[] }> {
  const [ecoarTypes, ecoarSingularities] = await Promise.all([
    listActiveEcoarCatalog(),
    listActiveEcoarSingularities(),
  ])
  return { ecoarTypes, ecoarSingularities }
}

export function getEcoarCatalogFallbackPayload(): { ecoarTypes: Ecoar[]; ecoarSingularities: EcoarSingularity[] } {
  return {
    ecoarTypes: ecoarCatalogSeed.map((e) => ({ id: e.id, name: e.name, type: e.type as Ecoar['type'], description: e.description })),
    ecoarSingularities: ecoarSingularitiesSeed,
  }
}
