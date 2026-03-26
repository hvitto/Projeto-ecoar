/** Estilos de custo do livro (colunas da tabela de multiplicadores). */
export type EquipmentStyleId = 'reclusa' | 'vaporAlquimico' | 'darenferrum' | 'imaculada' | 'paginas'

/** Macro-seções da aba Armas na UI de referência. */
export type WeaponMacroSectionId =
  | 'intro'
  | 'corpo-a-corpo'
  | 'arqueria'
  | 'arremesso'
  | 'magicas'
  | 'municiadas'
  | 'artilharia'
  | 'cerco'
  | 'granadas'
  | 'explosivos'

export interface EquipmentDetailSection {
  title: string
  body: string
}

export interface WeaponCatalogEntry {
  id: string
  kind: 'weapon'
  name: string
  macroSection: WeaponMacroSectionId
  /** Classe de equipamento (ex.: Armas corpo-a-corpo). */
  equipmentClass?: string
  /** Categoria no livro (ex.: Lâminas Curtas). */
  category?: string
  durability?: string
  space?: string
  costLabel?: string
  attackTest?: string
  rangeNotes?: string
  damageNotes?: string
  classTraits?: string
  properties?: string[]
  ammoCategory?: string
  ammoCostPerUnit?: string
  reloadNotes?: string
  capacity?: string
  technology?: string
  flavor?: string
  detailSections?: EquipmentDetailSection[]
}

export type VestuarioTabId = 'armaduras' | 'capacetes' | 'acessorios'

export type ArmorResistanceKey =
  | 'contundente'
  | 'cortante'
  | 'perfurante'
  | 'balistico'
  | 'esmagador'
  | 'explosivo'
  | 'ardente'
  | 'congelante'
  | 'eletrico'
  | 'corrosivo'
  | 'magico'
  | 'toxico'

export type ArmorResistanceValues = Record<ArmorResistanceKey, number>

export const ARMOR_RESISTANCE_KEYS: ArmorResistanceKey[] = [
  'contundente',
  'cortante',
  'perfurante',
  'balistico',
  'esmagador',
  'explosivo',
  'ardente',
  'congelante',
  'eletrico',
  'corrosivo',
  'magico',
  'toxico',
]

export interface ArmorCatalogEntry {
  id: string
  kind: 'armor'
  name: string
  vestuarioTab: VestuarioTabId
  category: string
  space: string
  costLabel: string
  resistances: ArmorResistanceValues
  defenseCritico: string
  esquiva: string
  furtividade: string
  propriedades: string[]
  flavor: string
  detailSections?: EquipmentDetailSection[]
}

export interface UtilityCatalogEntry {
  id: string
  kind: 'utility'
  name: string
  utilityCategory: string
  space?: string
  costLabel?: string
  charges?: string
  effect?: string
  flavor?: string
  detailSections?: EquipmentDetailSection[]
}

export type CatalogEntry = WeaponCatalogEntry | ArmorCatalogEntry | UtilityCatalogEntry

/** Item comprado pelo catálogo (persistido na ficha). */
export interface CatalogOwnedItem {
  instanceId: string
  catalogId: string
  kind: 'weapon' | 'armor' | 'utility'
  nome: string
  custoCeros: number
  /** Linha exibida e salva em equipamentos[] / armas[] para compatibilidade. */
  displayLine: string
}

export interface CostMultiplierRow {
  group: string
  reclusa: string
  vaporAlquimico: string
  darenferrum: string
  imaculada: string
  paginas: string
}

export interface CostMultiplierTable {
  id: 'weapons' | 'clothing'
  title: string
  rows: CostMultiplierRow[]
}
