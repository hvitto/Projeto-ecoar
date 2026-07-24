import type { ArmorCatalogEntry, CatalogEntry, UtilityCatalogEntry, WeaponCatalogEntry } from '@/shared/types/equipment'
import { getEquipmentQualityTier, clampEquipmentQualityNivel, computeOwnedEquipmentCostCeros, resolveOwnedBaseCeros } from '@/lib/equipmentQuality'
import type { CatalogOwnedItem } from '@/shared/types/equipment'

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

export function getCatalogEntryFromMap(map: Map<string, CatalogEntry>, id: string): CatalogEntry | undefined {
  return map.get(id)
}

function qualitySuffix(qualidadeNivel?: number, banhadoPrata?: boolean): string {
  const parts: string[] = []
  if (banhadoPrata) parts.push('Prata')
  const nivel = qualidadeNivel ?? 0
  if (nivel !== 0) {
    const tier = getEquipmentQualityTier(nivel)
    const sign = nivel > 0 ? '+' : ''
    parts.push(`${tier.name} [${sign}${nivel}]`)
  }
  return parts.length ? ` · ${parts.join(' · ')}` : ''
}

export function catalogDisplayLine(
  entry: CatalogEntry,
  custoCeros: number,
  opts?: { qualidadeNivel?: number; banhadoPrata?: boolean },
): string {
  const qualidadeNivel = opts?.qualidadeNivel ?? 0
  const costLabel =
    qualidadeNivel === 0 &&
    !opts?.banhadoPrata &&
    entry.costLabel &&
    entry.costLabel.trim() &&
    entry.costLabel.trim() !== '—'
      ? entry.costLabel.trim()
      : formatCerosDisplay(custoCeros)
  return `${entry.name}${qualitySuffix(qualidadeNivel, opts?.banhadoPrata)} (${costLabel})`
}

export function ownedCatalogDisplayLine(item: {
  nome: string
  custoCeros: number
  qualidadeNivel?: number
  banhadoPrata?: boolean
}): string {
  return `${item.nome}${qualitySuffix(item.qualidadeNivel, item.banhadoPrata)} (${formatCerosDisplay(item.custoCeros)})`
}

export function applyOwnedItemQuality(
  item: CatalogOwnedItem,
  nextNivel: number,
): CatalogOwnedItem {
  const qualidadeNivel = clampEquipmentQualityNivel(nextNivel)
  const custoBaseCeros = resolveOwnedBaseCeros(item)
  const custoCeros = computeOwnedEquipmentCostCeros({
    baseCeros: custoBaseCeros,
    qualidadeNivel,
    banhadoPrata: item.banhadoPrata,
  })
  return {
    ...item,
    qualidadeNivel,
    custoBaseCeros,
    custoCeros,
    displayLine: ownedCatalogDisplayLine({
      nome: item.nome,
      custoCeros,
      qualidadeNivel,
      banhadoPrata: item.banhadoPrata,
    }),
  }
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
