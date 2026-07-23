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
    description: 'Cadavérico resistente, com Consciência no lugar de Mente e Mana.',
  },
  {
    id: 'elisiade',
    name: 'Elísiade',
    type: 'elisiade',
    description: 'Imortal ligado ao Éter, suporte de Compostura e aura de pureza.',
  },
  {
    id: 'fenix',
    name: 'Fênix',
    type: 'fenix',
    description: 'Imortal ligado à Grande-Chama, cura e resiliência ardente.',
  },
  {
    id: 'geist',
    name: 'Geist',
    type: 'geist',
    description: 'Espectro incorpóreo com possessão e corpo baseado em Espírito.',
  },
  {
    id: 'immortalis',
    name: 'Immortalis',
    type: 'immortalis',
    description: 'Imortal versátil sem especialização rígida, com foco em habilidades.',
  },
  {
    id: 'lycantropo',
    name: 'Lycantropo',
    type: 'lycantropo',
    description: 'Imortal de Lunara que assume forma monstruosa de alto combate.',
  },
  {
    id: 'proelita',
    name: 'Proelita',
    type: 'proelita',
    description: 'Acorrentado pela Fúria, agressivo e resiliente em combate direto.',
  },
  {
    id: 'revenant',
    name: 'Revenant',
    type: 'revenant',
    description: 'Imortal abissal, aura de penalidade e foco em Compostura.',
  },
  {
    id: 'triade',
    name: 'Tríade',
    type: 'triade',
    description: 'Imortal de alma fragmentada em três identidades com troca de fichas e projeções.',
  },
  {
    id: 'vampiro',
    name: 'Vampiro',
    type: 'vampiro',
    description: 'Acorrentado pela Sede de sangue, com maldição solar e progressão por pecados e famílias vampíricas.',
  },
]

export const getEcoarById = (id: string): Ecoar | undefined => {
  return ecoarTypes.find(eco => eco.id === id)
}

