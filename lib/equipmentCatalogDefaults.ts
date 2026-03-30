import {
  ARMOR_RESISTANCE_KEYS,
  type ArmorResistanceValues,
  type CatalogEntry,
} from '@/types/equipment'

function zeroResistances(): ArmorResistanceValues {
  return ARMOR_RESISTANCE_KEYS.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {} as ArmorResistanceValues)
}

/** Payload mínimo válido para salvar um item novo no catálogo (admin). */
export function createDefaultCatalogEntry(kind: 'weapon' | 'armor' | 'utility', id: string): CatalogEntry {
  if (kind === 'weapon') {
    return {
      id,
      kind: 'weapon',
      name: 'Novo equipamento',
      macroSection: 'corpo-a-corpo',
    }
  }
  if (kind === 'armor') {
    return {
      id,
      kind: 'armor',
      name: 'Nova armadura',
      vestuarioTab: 'armaduras',
      category: '—',
      space: '1',
      costLabel: '¢0',
      resistances: zeroResistances(),
      defenseCritico: '0',
      esquiva: '0',
      furtividade: '0',
      propriedades: [],
      flavor: '—',
    }
  }
  return {
    id,
    kind: 'utility',
    name: 'Novo utilitário',
    utilityCategory: '—',
  }
}
