import { DAMAGE_TYPE_LABELS_PT, type WeaponCatalogEntry } from '@/shared/types/equipment'

function readPropertyNumber(properties: string[], prefix: string): number | null {
  const hit = properties.find((p) => p.toLowerCase().startsWith(prefix.toLowerCase()))
  if (!hit) return null
  const m = hit.match(/(-?\d+)/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return Number.isFinite(n) ? n : null
}

function readPropertyText(properties: string[], prefix: string): string | null {
  const hit = properties.find((p) => p.toLowerCase().startsWith(prefix.toLowerCase()))
  return hit ?? null
}

/** Primeiro inteiro num texto (ex.: traços da classe ou propriedades). */
export function parseFirstIntegerInText(s?: string | null): number | null {
  if (!s || typeof s !== 'string') return null
  const m = s.match(/-?\d+/)
  if (!m) return null
  const n = parseInt(m[0], 10)
  return Number.isFinite(n) ? n : null
}

export type TraitFieldDisplay =
  | { kind: 'number'; value: number }
  | { kind: 'text'; value: string }

function traitFromClassOrLegacy(
  classField: string | undefined,
  properties: string[],
  legacyPrefix: string,
): TraitFieldDisplay | null {
  const trimmed = classField?.trim()
  if (trimmed) {
    const compact = trimmed.replace(/\s/g, '')
    if (/^-?\d+$/.test(compact)) {
      const n = parseInt(compact, 10)
      return Number.isFinite(n) ? { kind: 'number', value: n } : { kind: 'text', value: trimmed }
    }
    return { kind: 'text', value: trimmed }
  }
  const legacy = readPropertyNumber(properties, legacyPrefix)
  return legacy !== null ? { kind: 'number', value: legacy } : null
}

export function deriveWeaponTraitDisplays(
  entry: WeaponCatalogEntry | undefined,
  properties: string[],
): {
  crit: TraitFieldDisplay | null
  targets: TraitFieldDisplay | null
  maxDamage: TraitFieldDisplay | null
  reloadText: string | null
  capacityText: string | null
} {
  return {
    crit: traitFromClassOrLegacy(entry?.classTraitCrit, properties, 'Acerto Crítico'),
    targets: traitFromClassOrLegacy(entry?.classTraitTargets, properties, 'Alvos'),
    maxDamage: traitFromClassOrLegacy(entry?.classTraitMaxDamage, properties, 'Dano máximo'),
    reloadText: readPropertyText(properties, 'Recarga'),
    capacityText: readPropertyText(properties, 'Capacidade'),
  }
}

export function formatWeaponDamageTypesList(entry: WeaponCatalogEntry | undefined): string {
  const entries = entry?.damageEntries
  if (Array.isArray(entries) && entries.length > 0) {
    return entries.map((e) => DAMAGE_TYPE_LABELS_PT[e.type]).join(', ')
  }
  return '—'
}
