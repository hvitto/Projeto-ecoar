import type { EcoarSingularity } from '@/data/ecoarSingularities'
import type { MartialSchoolSingularity } from '@/data/martialSchoolSingularities'
import { martialSchoolData } from '@/data/martialSchoolSingularities'
import type { PathBookEntry, PathBookKind } from '@/data/pathBookContent'
import {
  hydratePathBookEntries,
} from '@/data/pathBookContent'
import {
  hydratePathUiCatalog,
  type Bruxaria,
  type CacadaEnhancement,
  type CacadaPower,
  type PathBaseSingularity,
} from '@/data/pathSingularities'

function meta(s: EcoarSingularity): Record<string, unknown> {
  return (s.sourceMeta ?? {}) as Record<string, unknown>
}

function reqPrevious(s: EcoarSingularity): string | undefined {
  return s.requirements?.previous ?? s.requirementEntries?.find((e) => e.type === 'previous')?.value
}

function reqNivelAlma(s: EcoarSingularity): number | undefined {
  const n = s.requirements?.nivelAlma
  if (typeof n === 'number') return n
  const entry = s.requirementEntries?.find((e) => e.type === 'nivelAlma')
  if (entry?.numericValue != null) return entry.numericValue
  return undefined
}

function splitDescriptionEffects(description: string): { description: string; effects: string } {
  const parts = description.split('\n')
  if (parts.length <= 1) return { description, effects: description }
  return { description: parts[0] ?? description, effects: parts.slice(1).join('\n') }
}

function tierOrLevel(s: EcoarSingularity, m: Record<string, unknown>): number {
  if (typeof m.level === 'number') return m.level
  const tier = (s as EcoarSingularity & { tier?: number }).tier
  if (typeof tier === 'number') return tier
  return 1
}

function reqRecordFromEntries(
  s: EcoarSingularity,
  type: 'attributes' | 'skills' | 'aptitudes',
): Record<string, number> | undefined {
  const fromObject = s.requirements?.[type]
  if (fromObject && Object.keys(fromObject).length > 0) return { ...fromObject }

  const entries = s.requirementEntries?.filter((e) => e.type === type) ?? []
  if (entries.length === 0) return undefined
  const out: Record<string, number> = {}
  for (const e of entries) {
    const key = e.key || e.value
    const n = e.numericValue
    if (!key || typeof n !== 'number') continue
    out[key] = n
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function reqFromSourceMeta(s: EcoarSingularity): MartialSchoolSingularity['requirements'] | undefined {
  const raw = meta(s).requirements
  if (!raw || typeof raw !== 'object') return undefined
  return raw as MartialSchoolSingularity['requirements']
}

export function hydrateMartialSchoolsFromCatalog(list: EcoarSingularity[]) {
  const bySchool = new Map<string, MartialSchoolSingularity[]>()
  for (const s of list.filter((x) => x.systemType === 'marcial')) {
    const schoolId = String(meta(s).schoolId ?? '')
    if (!schoolId) continue
    const m = meta(s)
    const split = splitDescriptionEffects(s.description)
    const fromMeta = reqFromSourceMeta(s)
    const row: MartialSchoolSingularity = {
      id: s.id,
      schoolId,
      level: tierOrLevel(s, m),
      name: s.name,
      description: split.description,
      cost: s.cost,
      requirements: {
        previous: reqPrevious(s) ?? fromMeta?.previous,
        nivelAlma: reqNivelAlma(s) ?? fromMeta?.nivelAlma,
        attributes: reqRecordFromEntries(s, 'attributes') ?? fromMeta?.attributes,
        skills: reqRecordFromEntries(s, 'skills') ?? fromMeta?.skills,
        aptitudes: reqRecordFromEntries(s, 'aptitudes') ?? fromMeta?.aptitudes,
      },
      effects: split.effects,
    }
    const cur = bySchool.get(schoolId) ?? []
    cur.push(row)
    bySchool.set(schoolId, cur)
  }
  for (const school of martialSchoolData) {
    const sings = bySchool.get(school.id)
    if (sings && sings.length > 0) {
      const prevById = new Map(school.singularities.map((sing) => [sing.id, sing]))
      for (const row of sings) {
        const prev = prevById.get(row.id)
        if (!prev) continue
        row.requirements = {
          previous: row.requirements.previous ?? prev.requirements.previous,
          nivelAlma: row.requirements.nivelAlma ?? prev.requirements.nivelAlma,
          attributes: row.requirements.attributes ?? prev.requirements.attributes,
          skills: row.requirements.skills ?? prev.requirements.skills,
          aptitudes: row.requirements.aptitudes ?? prev.requirements.aptitudes,
        }
      }
      sings.sort((a, b) => a.level - b.level)
      school.singularities = sings
    }
  }
}

export function hydratePathCatalogFromSingularities(list: EcoarSingularity[]) {
  const pathRows = list.filter((x) => x.systemType === 'path')

  const book: PathBookEntry[] = []
  const bases: PathBaseSingularity[] = []
  const bx: Bruxaria[] = []
  const powers: CacadaPower[] = []
  const enh: CacadaEnhancement[] = []

  for (const s of pathRows) {
    const m = meta(s)
    const kind = String(m.kind ?? '')
    if (kind === 'path-base') {
      const split = splitDescriptionEffects(s.description)
      bases.push({
        id: s.id,
        pathId: String(m.pathId ?? ''),
        name: s.name,
        description: split.description,
        cost: s.cost,
        requirements: (m.requirements as PathBaseSingularity['requirements']) ?? undefined,
        effects: split.effects ? split.effects.split(';').map((t) => t.trim()).filter(Boolean) : [],
      })
      continue
    }
    if (kind === 'bruxaria') {
      const split = splitDescriptionEffects(s.description)
      bx.push({
        id: s.id,
        category: (m.category as Bruxaria['category']) ?? 'destruicao',
        name: s.name,
        description: split.description,
        manaCost: (m.manaCost as number | string) ?? 0,
        action: (m.action as Bruxaria['action']) ?? 'menor',
        range: (m.range as string | undefined) ?? undefined,
        effects: split.effects,
      })
      continue
    }
    if (kind === 'cacada-power') {
      const split = splitDescriptionEffects(s.description)
      powers.push({
        id: s.id,
        name: s.name,
        description: split.description,
        cost: s.cost,
        requirements: { pathId: String(m.pathId ?? 'cacada') },
        effects: split.effects,
      })
      continue
    }
    if (kind === 'cacada-enhancement') {
      const split = splitDescriptionEffects(s.description)
      enh.push({
        id: s.id,
        name: s.name,
        description: split.description,
        cost: s.cost,
        requirements: {
          powerId: String(m.powerId ?? reqPrevious(s) ?? ''),
          noOtherEnhancement: Boolean(m.noOtherEnhancement),
        },
        effects: split.effects,
      })
      continue
    }
    if (m.pathKind) {
      const previousIds = (s.requirementEntries ?? [])
        .filter((e) => e.type === 'previous')
        .map((e) => e.value)
      const nestedMeta =
        m.meta && typeof m.meta === 'object' && !Array.isArray(m.meta)
          ? (m.meta as Record<string, unknown>)
          : undefined
      const reconstructedMeta: Record<string, unknown> = { ...(nestedMeta ?? {}) }
      if (typeof m.kind === 'string') reconstructedMeta.kind = m.kind
      if (typeof m.powerId === 'string') reconstructedMeta.powerId = m.powerId
      if (typeof m.entity === 'string') reconstructedMeta.entity = m.entity
      if (typeof m.oath === 'string') reconstructedMeta.oath = m.oath
      if (m.noOtherPath != null) reconstructedMeta.noOtherPath = m.noOtherPath
      if (m.skills && typeof m.skills === 'object') reconstructedMeta.skills = m.skills
      if (m.requirements && typeof m.requirements === 'object') {
        reconstructedMeta.requirements = m.requirements
      }
      book.push({
        id: s.id,
        name: s.name,
        description: s.description,
        cost: s.cost,
        systemType: 'path',
        sourceGroup: s.sourceGroup ?? String(m.pathKind),
        activationType: s.activationType ?? 'complexa',
        pathKind: m.pathKind as PathBookKind,
        variant: (m.variant as string | undefined) ?? undefined,
        bonuses: s.bonuses,
        requirementsText: (m.requirementsText as string | undefined) ?? undefined,
        previousIds: previousIds.length ? previousIds : undefined,
        meta: Object.keys(reconstructedMeta).length > 0 ? reconstructedMeta : undefined,
      })
    }
  }

  if (book.length > 0) hydratePathBookEntries(book)
  hydratePathUiCatalog({
    bases: bases.length > 0 ? bases : undefined,
    bruxarias: bx.length > 0 ? bx : undefined,
    powers: powers.length > 0 ? powers : undefined,
    enhancements: enh.length > 0 ? enh : undefined,
  })
}

export function hydrateSystemCatalogsFromEcoar(list: EcoarSingularity[]) {
  hydrateMartialSchoolsFromCatalog(list)
  hydratePathCatalogFromSingularities(list)
}
