import type { WeaponCatalogEntry, WeaponMacroSectionId } from '@/types/equipment'
import { introAndMeleeWeapons } from './introAndMelee'
import { rangedAndMagicWeapons } from './rangedAndMagic'
import { municiadasWeapons } from './municiadas'
import { artilleryAndSiegeWeapons } from './artilleryAndSiege'
import { grenadesAndExplosivesWeapons } from './grenadesAndExplosives'

export const weaponCatalog: WeaponCatalogEntry[] = [
  ...introAndMeleeWeapons,
  ...rangedAndMagicWeapons,
  ...municiadasWeapons,
  ...artilleryAndSiegeWeapons,
  ...grenadesAndExplosivesWeapons,
]

export const weaponMacroSectionOrder: WeaponMacroSectionId[] = [
  'intro',
  'corpo-a-corpo',
  'arqueria',
  'arremesso',
  'magicas',
  'municiadas',
  'artilharia',
  'cerco',
  'granadas',
  'explosivos',
]

export const weaponMacroSectionLabels: Record<WeaponMacroSectionId, string> = {
  intro: 'Traços gerais e improvisadas',
  'corpo-a-corpo': 'Armas corpo-a-corpo',
  arqueria: 'Armas de arqueria',
  arremesso: 'Armas de arremesso',
  magicas: 'Armas mágicas',
  municiadas: 'Armas municiadas',
  artilharia: 'Armas de artilharia',
  cerco: 'Armas de cerco',
  granadas: 'Granadas e urnas',
  explosivos: 'Explosivos e runas',
}

export function filterWeapons(
  items: WeaponCatalogEntry[],
  query: string,
  section?: WeaponMacroSectionId | null
): WeaponCatalogEntry[] {
  const q = query.trim().toLowerCase()
  return items.filter((w) => {
    if (section && w.macroSection !== section) return false
    if (!q) return true
    const fields = [w.name, w.category, w.equipmentClass, w.id, w.attackTest, ...(w.properties ?? []), w.flavor]
    return fields.some((f) => (f ? String(f).toLowerCase().includes(q) : false))
  })
}
