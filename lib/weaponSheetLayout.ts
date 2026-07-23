import { DAMAGE_TYPE_LABELS_PT, type WeaponCatalogEntry, type WeaponDamageEntry } from '@/shared/types/equipment'
import { deriveWeaponTraitDisplays } from '@/lib/weaponSlotDerivations'
import {
  applyWeaponDurabilityQuality,
  formatOwnedItemQualityLabel,
  getWeaponQualityCombatModifiers,
} from '@/lib/equipmentQuality'

const EXTRAS_PROPERTY_PREFIXES = ['acerto critico', 'alvos', 'dano maximo']

export type WeaponFichaMeta = {
  name: string
  habilidade: string
  especialidade: string
  atributo: string
  categoria: string
  durabilidade: string
  municao: string
  recarga: string
  capacidade: string
  estoque: string
  qualidadeLabel: string
  qualidadeNivel: number
  rangeNear: string
  rangeEffective: string
  rangeFar: string
  damageLines: { label: string; amount: string }[]
  acertoCritico: string
  alvos: string
  danoMaximo: string
  propriedades: string[]
  versatilNote: boolean
  attackBonusFromQuality: number
}

export function parseWeaponAttackParts(attackTest?: string): {
  atributo: string
  habilidade: string
  especialidade: string
} {
  const raw = String(attackTest ?? '').trim()
  if (!raw) return { atributo: '—', habilidade: '—', especialidade: '—' }
  const match = raw.match(/^(.+?)\s*\+\s*([^(]+?)\s*\(([^)]+)\)\s*$/)
  if (!match) return { atributo: '—', habilidade: raw, especialidade: '—' }
  return {
    atributo: match[1].trim() || '—',
    habilidade: match[2].trim() || '—',
    especialidade: match[3].trim() || '—',
  }
}

function isExtrasProperty(p: string): boolean {
  const low = p
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  return EXTRAS_PROPERTY_PREFIXES.some((prefix) => low.startsWith(prefix))
}

function formatTrait(
  trait: { kind: 'number'; value: number } | { kind: 'text'; value: string } | null,
  bonus = 0,
): string {
  if (!trait) return bonus !== 0 ? String(bonus) : '—'
  if (trait.kind === 'text') return trait.value
  return String(trait.value + bonus)
}

function damageLinesFromEntry(entry: WeaponCatalogEntry): { label: string; amount: string }[] {
  const list = entry.damageEntries
  if (Array.isArray(list) && list.length > 0) {
    return list.map((e: WeaponDamageEntry) => ({
      label: DAMAGE_TYPE_LABELS_PT[e.type],
      amount: e.amount >= 0 ? `+${e.amount}` : String(e.amount),
    }))
  }
  const notes = entry.damageNotes?.trim()
  if (notes) return [{ label: 'Dano', amount: notes }]
  return []
}

export function buildWeaponFichaMeta(opts: {
  entry: WeaponCatalogEntry
  name?: string
  qualidadeNivel?: number
  durabilityCurrent?: string
}): WeaponFichaMeta {
  const { entry } = opts
  const qualidadeNivel = opts.qualidadeNivel ?? 0
  const q = getWeaponQualityCombatModifiers(qualidadeNivel)
  const parts = parseWeaponAttackParts(entry.attackTest)
  const properties = entry.properties ?? []
  const traits = deriveWeaponTraitDisplays(entry, properties)
  const propriedades = properties.filter((p) => !isExtrasProperty(p))
  if (q.penetracaoBonus !== 0 && !propriedades.some((p) => /^Penetra/i.test(p))) {
    propriedades.push(`Penetração [${q.penetracaoBonus > 0 ? '+' : ''}${q.penetracaoBonus}]`)
  }

  const durMax = applyWeaponDurabilityQuality(entry.durability, qualidadeNivel)
  const durAtual = opts.durabilityCurrent?.trim() || durMax
  const durabilidade =
    durMax === '∞' ? '∞' : durAtual && durMax ? `${durAtual} / ${durMax}` : durMax || '—'

  const capacityRaw = entry.capacity?.trim()
  const capacityText =
    properties.find((p) => /^Capacidade/i.test(p))?.replace(/^Capacidade:\s*/i, '') ??
    capacityRaw ??
    '—'

  return {
    name: opts.name?.trim() || entry.name,
    habilidade: parts.habilidade,
    especialidade: parts.especialidade,
    atributo: parts.atributo,
    categoria: entry.category?.trim() || '—',
    durabilidade,
    municao: entry.ammoCategory?.trim() || '—',
    recarga: entry.reloadNotes?.trim() || properties.find((p) => /^Recarga/i.test(p))?.replace(/^Recarga:\s*/i, '') || '—',
    capacidade: capacityText || '—',
    estoque: '—',
    qualidadeLabel: formatOwnedItemQualityLabel(qualidadeNivel),
    qualidadeNivel,
    rangeNear: entry.rangeDisadvantageNear?.trim() || '—',
    rangeEffective: entry.rangeEffective?.trim() || '—',
    rangeFar: entry.rangeDisadvantageFar?.trim() || '—',
    damageLines: damageLinesFromEntry(entry),
    acertoCritico: formatTrait(traits.crit, 0),
    alvos: formatTrait(traits.targets, 0),
    danoMaximo: formatTrait(traits.maxDamage, q.maxDamageBonus),
    propriedades,
    versatilNote: properties.some((p) => /vers[aá]til/i.test(p)),
    attackBonusFromQuality: q.attackBonus,
  }
}
