import type { ArmorCatalogEntry, CatalogEntry, UtilityCatalogEntry, WeaponCatalogEntry } from '@/shared/types/equipment'
import { armorCatalog } from '@/data/equipment/armor'
import { utilityCatalog } from '@/data/equipment/utilities'
import { weaponCatalog } from '@/data/equipment/weapons'

/** Formata ceros como no livro (ex.: 1525 → ȼ1.525). */
export function formatCerosDisplay(n: number): string {
  if (!Number.isFinite(n) || n < 0) return 'ȼ0'
  const s = String(Math.floor(n))
  const withDots = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `ȼ${withDots}`
}

/**
 * Extrai valor em ceros de costLabel (milhar com ponto).
 * Retorna null se não for comprável (—, vazio, referência p.X, sem dígitos).
 */
export function parseCostLabelToCeros(costLabel?: string): number | null {
  if (costLabel === undefined || costLabel === null) return null
  const t = String(costLabel).trim()
  if (!t) return null
  if (t === '—' || t === '-' || t === '–') return null
  const lower = t.toLowerCase()
  if (/^p\.?\d/i.test(lower) || lower.startsWith('p.x') || lower.startsWith('pág')) return null
  const digits = t.replace(/\D/g, '')
  if (!digits) return null
  const n = parseInt(digits, 10)
  return Number.isFinite(n) ? n : null
}

export function isPurchasableCost(costLabel?: string): boolean {
  return parseCostLabelToCeros(costLabel) !== null
}

export function buildCatalogEntryMap(
  weapons: WeaponCatalogEntry[],
  armor: ArmorCatalogEntry[],
  utilities: UtilityCatalogEntry[]
): Map<string, CatalogEntry> {
  const m = new Map<string, CatalogEntry>()
  for (const w of weapons) m.set(w.id, w)
  for (const a of armor) m.set(a.id, a)
  for (const u of utilities) m.set(u.id, u)
  return m
}

const staticCatalogById = buildCatalogEntryMap(weaponCatalog, armorCatalog, utilityCatalog)

export function getCatalogEntryFromMap(map: Map<string, CatalogEntry>, id: string): CatalogEntry | undefined {
  return map.get(id)
}

/** Catálogo estático embutido (fallback quando o banco está vazio). */
export function getCatalogEntryById(id: string): CatalogEntry | undefined {
  return getCatalogEntryFromMap(staticCatalogById, id)
}

export function catalogDisplayLine(entry: CatalogEntry, custoCeros: number): string {
  const label =
    entry.costLabel && entry.costLabel.trim() && entry.costLabel.trim() !== '—'
      ? entry.costLabel.trim()
      : formatCerosDisplay(custoCeros)
  return `${entry.name} (${label})`
}

export function sumCatalogItemsCeros(items: { custoCeros: number }[]): number {
  return items.reduce((a, i) => a + (Number.isFinite(i.custoCeros) ? i.custoCeros : 0), 0)
}

export function newCatalogInstanceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
