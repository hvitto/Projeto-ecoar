// Ecoar types and data from Ecoar RPG

export type EcoarType = 'apodrecido' | 'elisiade' | 'fenix' | 'geist' | 'immortalis' | 'lycantropo' | 'proelita' | 'revenant' | 'triade' | 'vampiro'

export interface Ecoar {
  id: string
  name: string
  type: EcoarType
  description: string
}

/** Tipos de Eco jogáveis (exclui agrupadores de sistema: criação, marcial, racial no mesmo catálogo). */
const PLAYABLE_ECOAR_TYPE_SET = new Set<string>([
  'apodrecido',
  'elisiade',
  'fenix',
  'geist',
  'immortalis',
  'lycantropo',
  'proelita',
  'revenant',
  'triade',
  'vampiro',
])

export function isPlayableEcoarCatalogEntry(eco: { type: string }): boolean {
  return PLAYABLE_ECOAR_TYPE_SET.has(eco.type)
}

export const ecoarTypes: Ecoar[] = [
  {
    id: 'apodrecido',
    name: 'Apodrecido',
    type: 'apodrecido',
    description: 'Eco de aparência cadavérica, com Mente e Mana substituídas por Consciência.',
  },
  {
    id: 'elisiade',
    name: 'Elísiade',
    type: 'elisiade',
    description: 'Eco de origem etérea, nascido através de uma vida passada pura e justa.',
  },
  {
    id: 'fenix',
    name: 'Fênix',
    type: 'fenix',
    description: 'Eco de origem solar, nascido através da vontade de levar o expurgo até o mal.',
  },
  {
    id: 'geist',
    name: 'Geist',
    type: 'geist',
    description: 'Eco fantasmagórico, capaz de possessão e onde Corpo e Fôlego são substituídos por Espírito.',
  },
  {
    id: 'immortalis',
    name: 'Immortalis',
    type: 'immortalis',
    description: 'Eco simples e de natureza imortal, com facilidade para masterizar técnicas.',
  },
  {
    id: 'lycantropo',
    name: 'Lycantropo',
    type: 'lycantropo',
    description: 'Eco de origem lunar, que pode se transformar em um monstro poderoso e descontrolado.',
  },
  {
    id: 'proelita',
    name: 'Proelita',
    type: 'proelita',
    description: 'Eco furioso, obcecado com o combate e a guerra, e igualmente dependente de ambos para se manter são.',
  },
  {
    id: 'revenant',
    name: 'Revenant',
    type: 'revenant',
    description: 'Eco de origem abissal, uma alma que nem mesmo as chamas do sol conseguiram expurgar, e foi dada uma segunda chance para se redimir.',
  },
  {
    id: 'triade',
    name: 'Tríade',
    type: 'triade',
    description: 'Eco onde três mentes se fundem em uma, capaz de trocar técnicas conhecidas com facilidade e até mesmo projetar três corpos com mentes e identidades distintas.',
  },
  {
    id: 'vampiro',
    name: 'Vampiro',
    type: 'vampiro',
    description: 'Eco acorrentado pela Sede de sangue, com maldição solar e evolução por pecados e família vampírica.',
  },
]

export const getEcoarById = (id: string): Ecoar | undefined => {
  return ecoarTypes.find(eco => eco.id === id)
}

