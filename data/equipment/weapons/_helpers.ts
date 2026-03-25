import type { WeaponCatalogEntry } from '@/types/equipment'

export function weapon(entry: Omit<WeaponCatalogEntry, 'kind'>): WeaponCatalogEntry {
  return { kind: 'weapon', ...entry }
}
