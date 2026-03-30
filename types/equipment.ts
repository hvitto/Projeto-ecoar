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

/** Atributos de personagem usados em bônus mecânicos de equipamento. */
export type MechanicalAttributeKey =
  | 'carisma'
  | 'finesse'
  | 'forca'
  | 'inteligencia'
  | 'percepcao'
  | 'vitalidade'
  | 'vontade'

/** Bônus numéricos opcionais somados na ficha quando o item está equipado. */
export type MechanicalBonuses = {
  attributes?: Partial<Record<MechanicalAttributeKey, number>>
  skills?: Record<string, number>
}

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

/** Linha de dano por tipo (armas). */
export interface WeaponDamageEntry {
  type: ArmorResistanceKey
  amount: number
}

/** Rótulos em PT-BR para tipos de dano / resistência (UI). */
export const DAMAGE_TYPE_LABELS_PT: Record<ArmorResistanceKey, string> = {
  contundente: 'Contundente',
  cortante: 'Cortante',
  perfurante: 'Perfurante',
  balistico: 'Balístico',
  esmagador: 'Esmagador',
  explosivo: 'Explosivo',
  ardente: 'Ardente',
  congelante: 'Congelante',
  eletrico: 'Elétrico',
  corrosivo: 'Corrosivo',
  magico: 'Mágico',
  toxico: 'Tóxico',
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
  /** Evasão (ex.: teste de esquiva). */
  evasionTest?: string
  /** Legado: alcance num único texto; preferir os três campos de alcance abaixo. */
  rangeNotes?: string
  /** Desfavorável (perto), metros ou “—”. */
  rangeDisadvantageNear?: string
  /** Alcance efetivo (ex.: “0 a 1”). */
  rangeEffective?: string
  /** Desfavorável (longe). */
  rangeDisadvantageFar?: string
  /** Dano por tipo e quantidade (preferir em relação a texto livre). */
  damageEntries?: WeaponDamageEntry[]
  /** Legado: texto livre; usado na exibição se `damageEntries` estiver vazio. */
  damageNotes?: string
  /** Legado: traços da classe num único texto; preferir os três campos abaixo. */
  classTraits?: string
  /** Traços da classe — acerto crítico. */
  classTraitCrit?: string
  /** Traços da classe — alvos. */
  classTraitTargets?: string
  /** Traços da classe — dano máximo. */
  classTraitMaxDamage?: string
  properties?: string[]
  ammoCategory?: string
  ammoCostPerUnit?: string
  reloadNotes?: string
  capacity?: string
  technology?: string
  flavor?: string
  detailSections?: EquipmentDetailSection[]
  mechanicalBonuses?: MechanicalBonuses
}

export type VestuarioTabId = 'armaduras' | 'capacetes' | 'acessorios'

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
  mechanicalBonuses?: MechanicalBonuses
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
  mechanicalBonuses?: MechanicalBonuses
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
