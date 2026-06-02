export {
  weaponCatalog,
  weaponMacroSectionOrder,
  weaponMacroSectionLabels,
  filterWeapons,
} from './weapons'
export { equipmentCostMultiplierTables, equipmentStyleLabels } from './costMultipliers'
export { armorCatalog } from './armor'
export { utilityCatalog } from './utilities'

import type { ArmorCatalogEntry, UtilityCatalogEntry, VestuarioTabId } from '@/shared/types/equipment'
import { armorCatalog } from './armor'
import { utilityCatalog } from './utilities'

export const vestuarioTabOrder: VestuarioTabId[] = ['armaduras', 'capacetes', 'acessorios']

export const vestuarioTabLabels: Record<VestuarioTabId, string> = {
  armaduras: 'Armaduras',
  capacetes: 'Capacetes',
  acessorios: 'Acessórios',
}

/** JSON do banco pode trazer `propriedades` como objeto; spread em array exige iterável. */
function propriedadesAsArray(a: ArmorCatalogEntry): string[] {
  return Array.isArray(a.propriedades) ? a.propriedades : []
}

export function filterArmor(items: ArmorCatalogEntry[], query: string, tab?: VestuarioTabId | null): ArmorCatalogEntry[] {
  const q = query.trim().toLowerCase()
  return items.filter((a) => {
    if (tab && a.vestuarioTab !== tab) return false
    if (!q) return true
    const fields = [a.name, a.category, a.id, a.flavor, ...propriedadesAsArray(a)]
    return fields.some((f) => (f ? String(f).toLowerCase().includes(q) : false))
  })
}

export function filterUtilities(items: UtilityCatalogEntry[], query: string, category?: string | null): UtilityCatalogEntry[] {
  const q = query.trim().toLowerCase()
  return items.filter((u) => {
    if (category && u.utilityCategory !== category) return false
    if (!q) return true
    const fields = [u.name, u.utilityCategory, u.id, u.effect, u.flavor]
    return fields.some((f) => (f ? String(f).toLowerCase().includes(q) : false))
  })
}

export function getUtilityCategories(items: UtilityCatalogEntry[]): string[] {
  return Array.from(new Set(items.map((u) => u.utilityCategory))).sort()
}
