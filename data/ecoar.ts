// Ecoar types and data from Ecoar RPG

export type EcoarType = 'apodrecido' | 'elisiade' | 'fenix' | 'geist' | 'immortalis' | 'proelita' | 'revenant' | 'triade'

export interface Ecoar {
  id: string
  name: string
  type: EcoarType
  description: string
}

export const ecoarTypes: Ecoar[] = [
  {
    id: 'apodrecido',
    name: 'Apodrecido',
    type: 'apodrecido',
    description: 'Corrupção da alma que transforma criaturas.',
  },
  {
    id: 'elisiade',
    name: 'Elisiade',
    type: 'elisiade',
    description: 'Ecoar de luz e pureza.',
  },
  {
    id: 'fenix',
    name: 'Fênix',
    type: 'fenix',
    description: 'Ecoar de renascimento e fogo.',
  },
  {
    id: 'geist',
    name: 'Geist',
    type: 'geist',
    description: 'Ecoar de espíritos e espectros.',
  },
  {
    id: 'immortalis',
    name: 'Immortalis',
    type: 'immortalis',
    description: 'Ecoar de imortalidade.',
  },
  {
    id: 'proelita',
    name: 'Proelita',
    type: 'proelita',
    description: 'Ecoar de batalha e guerra.',
  },
  {
    id: 'revenant',
    name: 'Revenant',
    type: 'revenant',
    description: 'Ecoar de retorno e vingança.',
  },
  {
    id: 'triade',
    name: 'Tríade',
    type: 'triade',
    description: 'Ecoar tríplice.',
  },
]

export const getEcoarById = (id: string): Ecoar | undefined => {
  return ecoarTypes.find(eco => eco.id === id)
}

