export type EquipmentQualityNivel = -1 | 0 | 1 | 2 | 3 | 4

export type EquipmentQualityTier = {
  id: 'inferior' | 'padrao' | 'melhorada' | 'superior' | 'obra-prima' | 'artefato'
  name: string
  nivel: EquipmentQualityNivel
  costMultiplier: number
}

export const EQUIPMENT_QUALITY_MIN = -1 as const
export const EQUIPMENT_QUALITY_MAX = 4 as const
export const SILVER_BATH_BASE_MULTIPLIER = 1.5
export const WEAPON_QUALITY_MAX_DAMAGE_PER_LEVEL = 5

export const EQUIPMENT_QUALITY_TIERS: readonly EquipmentQualityTier[] = [
  { id: 'inferior', name: 'Inferior', nivel: -1, costMultiplier: 0.5 },
  { id: 'padrao', name: 'Padrão', nivel: 0, costMultiplier: 1 },
  { id: 'melhorada', name: 'Melhorada', nivel: 1, costMultiplier: 2 },
  { id: 'superior', name: 'Superior', nivel: 2, costMultiplier: 3 },
  { id: 'obra-prima', name: 'Obra-prima', nivel: 3, costMultiplier: 4 },
  { id: 'artefato', name: 'Artefato', nivel: 4, costMultiplier: 5 },
] as const

export function clampEquipmentQualityNivel(n: number): EquipmentQualityNivel {
  const v = Math.trunc(Number.isFinite(n) ? n : 0)
  if (v <= EQUIPMENT_QUALITY_MIN) return EQUIPMENT_QUALITY_MIN
  if (v >= EQUIPMENT_QUALITY_MAX) return EQUIPMENT_QUALITY_MAX
  return v as EquipmentQualityNivel
}

export function getEquipmentQualityTier(nivel: number): EquipmentQualityTier {
  const clamped = clampEquipmentQualityNivel(nivel)
  return (
    EQUIPMENT_QUALITY_TIERS.find((t) => t.nivel === clamped) ?? EQUIPMENT_QUALITY_TIERS[1]
  )
}

export function computeOwnedEquipmentCostCeros(opts: {
  baseCeros: number
  qualidadeNivel?: number
  banhadoPrata?: boolean
}): number {
  const base = Math.max(0, Math.floor(Number(opts.baseCeros) || 0))
  const afterSilver = opts.banhadoPrata
    ? Math.round(base * SILVER_BATH_BASE_MULTIPLIER)
    : base
  const tier = getEquipmentQualityTier(opts.qualidadeNivel ?? 0)
  return Math.max(0, Math.round(afterSilver * tier.costMultiplier))
}

export function costDeltaForQualityChange(opts: {
  baseCeros: number
  fromNivel: number
  toNivel: number
  banhadoPrata?: boolean
}): number {
  const from = computeOwnedEquipmentCostCeros({
    baseCeros: opts.baseCeros,
    qualidadeNivel: opts.fromNivel,
    banhadoPrata: opts.banhadoPrata,
  })
  const to = computeOwnedEquipmentCostCeros({
    baseCeros: opts.baseCeros,
    qualidadeNivel: opts.toNivel,
    banhadoPrata: opts.banhadoPrata,
  })
  return to - from
}

export type WeaponQualityCombatModifiers = {
  attackBonus: number
  maxDamageBonus: number
  durabilityBonus: number
  penetracaoBonus: number
  infiniteDurability: boolean
}

export function getWeaponQualityCombatModifiers(
  qualidadeNivel: number,
): WeaponQualityCombatModifiers {
  const nivel = clampEquipmentQualityNivel(qualidadeNivel)
  return {
    attackBonus: nivel,
    maxDamageBonus: nivel * WEAPON_QUALITY_MAX_DAMAGE_PER_LEVEL,
    durabilityBonus: nivel,
    penetracaoBonus: nivel,
    infiniteDurability: nivel >= 4,
  }
}

export function formatEquipmentQualityProperty(qualidadeNivel: number): string | null {
  const nivel = clampEquipmentQualityNivel(qualidadeNivel)
  if (nivel === 0) return null
  const sign = nivel > 0 ? '+' : ''
  return `Qualidade [${sign}${nivel}]`
}

export function formatOwnedItemQualityLabel(qualidadeNivel: number): string {
  const nivel = clampEquipmentQualityNivel(qualidadeNivel)
  const tier = getEquipmentQualityTier(nivel)
  if (nivel === 0) return tier.name
  const sign = nivel > 0 ? '+' : ''
  return `${tier.name} (${sign}${nivel})`
}

export function applyWeaponDurabilityQuality(
  baseDurability: string | undefined,
  qualidadeNivel: number,
): string {
  const mods = getWeaponQualityCombatModifiers(qualidadeNivel)
  if (mods.infiniteDurability) return '∞'
  const raw = String(baseDurability ?? '').trim()
  if (!raw || raw === '—') return raw || '—'
  const n = parseInt(raw.replace(/[^\d-]/g, ''), 10)
  if (!Number.isFinite(n)) return raw
  return String(Math.max(0, n + mods.durabilityBonus))
}

export function resolveOwnedBaseCeros(item: {
  custoCeros: number
  custoBaseCeros?: number
  qualidadeNivel?: number
  banhadoPrata?: boolean
}): number {
  if (typeof item.custoBaseCeros === 'number' && Number.isFinite(item.custoBaseCeros)) {
    return Math.max(0, Math.floor(item.custoBaseCeros))
  }
  const nivel = clampEquipmentQualityNivel(item.qualidadeNivel ?? 0)
  const paid = Math.max(0, Math.floor(Number(item.custoCeros) || 0))
  if (item.banhadoPrata) {
    const afterSilverInverse = paid / getEquipmentQualityTier(nivel).costMultiplier
    return Math.max(0, Math.round(afterSilverInverse / SILVER_BATH_BASE_MULTIPLIER))
  }
  const mult = getEquipmentQualityTier(nivel).costMultiplier
  if (mult <= 0) return paid
  return Math.max(0, Math.round(paid / mult))
}
