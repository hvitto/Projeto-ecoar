import type { WeaponCatalogEntry } from '@/shared/types/equipment'

export function weapon(entry: Omit<WeaponCatalogEntry, 'kind'>): WeaponCatalogEntry {
  return { kind: 'weapon', ...entry }
}
