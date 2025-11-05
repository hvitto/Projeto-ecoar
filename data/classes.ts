// Classes (Ofícios) data from Ecoar RPG

export interface Class {
  id: string
  name: string
  description: string
  bonuses?: {
    attributes?: Record<string, number>
    skills?: Record<string, number>
    corpo?: number
    mente?: number
    folego?: number
    mana?: number
  }
}

// Based on common RPG classes structure - will be updated when we find the exact Ofícios list
export const classes: Class[] = [
  {
    id: 'medico',
    name: 'Médico',
    description: 'Especialista em cura e medicina.',
    bonuses: {
      skills: { medicina: 1 },
    },
  },
  {
    id: 'artista',
    name: 'Artista',
    description: 'Criador de obras artísticas.',
    bonuses: {
      skills: { artes: 1 },
    },
  },
  {
    id: 'guarda',
    name: 'Guarda',
    description: 'Protetor e defensor.',
    bonuses: {
      attributes: { vitalidade: 1 },
    },
  },
  {
    id: 'mercador',
    name: 'Mercador',
    description: 'Comerciante e negociante.',
    bonuses: {
      skills: { conversacao: 1 },
    },
  },
  {
    id: 'pesquisador',
    name: 'Pesquisador',
    description: 'Estudioso e investigador.',
    bonuses: {
      attributes: { inteligencia: 1 },
    },
  },
  {
    id: 'artesao',
    name: 'Artesão',
    description: 'Criador de itens e ferramentas.',
    bonuses: {
      skills: { armeiro: 1 },
    },
  },
  {
    id: 'explorador',
    name: 'Explorador',
    description: 'Aventureiro e desbravador.',
    bonuses: {
      attributes: { percepcao: 1 },
    },
  },
]

export const getClassById = (id: string): Class | undefined => {
  return classes.find(c => c.id === id)
}

