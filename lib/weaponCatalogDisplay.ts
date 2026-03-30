import { DAMAGE_TYPE_LABELS_PT, type WeaponCatalogEntry } from '@/types/equipment'

function nonempty(s?: string): boolean {
  return s != null && String(s).trim() !== ''
}

/** Alcance para ficha/card: três subcampos ou legado `rangeNotes`. */
export function formatWeaponRangeDisplay(w: WeaponCatalogEntry): string {
  const near = w.rangeDisadvantageNear
  const eff = w.rangeEffective
  const far = w.rangeDisadvantageFar
  if (nonempty(near) || nonempty(eff) || nonempty(far)) {
    return [
      `perto: ${nonempty(near) ? String(near).trim() : '—'}`,
      `efetivo: ${nonempty(eff) ? String(eff).trim() : '—'}`,
      `longe: ${nonempty(far) ? String(far).trim() : '—'}`,
    ].join(' · ')
  }
  const legacy = w.rangeNotes?.trim()
  return legacy && legacy.length > 0 ? legacy : '—'
}

/** Traços da classe: três campos ou legado `classTraits`. */
export function formatWeaponClassTraitsDisplay(w: WeaponCatalogEntry): string {
  const c = w.classTraitCrit?.trim()
  const t = w.classTraitTargets?.trim()
  const m = w.classTraitMaxDamage?.trim()
  if (nonempty(c) || nonempty(t) || nonempty(m)) {
    const parts: string[] = []
    if (nonempty(c)) parts.push(`Acerto crítico: ${c}`)
    if (nonempty(t)) parts.push(`Alvos: ${t}`)
    if (nonempty(m)) parts.push(`Dano máximo: ${m}`)
    return parts.join(' · ')
  }
  const legacy = w.classTraits?.trim()
  return legacy && legacy.length > 0 ? legacy : ''
}

/** Dano na ficha/card: linhas estruturadas ou legado `damageNotes`. */
export function formatWeaponDamageDisplay(w: WeaponCatalogEntry): string {
  const entries = w.damageEntries
  if (Array.isArray(entries) && entries.length > 0) {
    return entries
      .map((e) => `${DAMAGE_TYPE_LABELS_PT[e.type]}: ${e.amount}`)
      .join(' · ')
  }
  const legacy = w.damageNotes?.trim()
  return legacy && legacy.length > 0 ? legacy : '—'
}
