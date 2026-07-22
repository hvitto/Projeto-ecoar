// Aptitudes data from Ecoar RPG

export interface Aptitude {
  id: string
  name: string
  description: string
  attribute: 'forca' | 'finesse' | 'carisma' | 'inteligencia' | 'percepcao' | 'vitalidade' | 'vontade'
}

export let aptitudes: Aptitude[] = [
  {
    id: 'arcana',
    name: 'Arcana',
    description: 'Manipulação de energia mágica pura e elementar.',
    attribute: 'inteligencia',
  },
  {
    id: 'lethalis',
    name: 'Lethalis',
    description: 'Manipulação de energia de morte e necromancia.',
    attribute: 'inteligencia',
  },
  {
    id: 'natura',
    name: 'Natura',
    description: 'Manipulação de energia natural e da vida.',
    attribute: 'inteligencia',
  },
  {
    id: 'vox',
    name: 'Vox',
    description: 'Manipulação através de palavras e comandos mágicos.',
    attribute: 'carisma',
  },
]

const STATIC_APTITUDES: Aptitude[] = aptitudes

export function hydrateAptitudes(list: Aptitude[]) {
  aptitudes = list.length > 0 ? list : STATIC_APTITUDES
}

export const getAptitudeById = (id: string): Aptitude | undefined => {
  return aptitudes.find(apt => apt.id === id)
}

