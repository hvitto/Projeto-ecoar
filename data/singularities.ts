// Singularities (Singularidades) data from Ecoar RPG

export interface Singularity {
  id: string
  name: string
  category: 'evolucao' | 'talento' | 'infusao' | 'adaptacao' | 'fragil' | 'mente-prodigiosa' | 'fisica-prodiga'
  description: string
  cost: number // Pontos de Criação
  requirements?: string[]
  bonuses?: {
    attributes?: Record<string, number>
    skills?: Record<string, number>
    corpo?: number
    mente?: number
    folego?: number
    mana?: number
  }
  penalties?: {
    attributes?: Record<string, number>
  }
}

export const singularities: Singularity[] = [
  // Exemplos baseados no PDF - será expandido com dados completos
  {
    id: 'humanoid-pequeno',
    name: 'Humanóide Pequeno',
    category: 'fragil',
    description: 'Você recebe um bônus de +2 em testes de esquiva e +2 em Furtividade, e uma penalidade de -1 no seu modificador de peso.',
    cost: 5,
    bonuses: {
      skills: { furtividade: 2 },
    },
  },
  {
    id: 'mente-prodigiosa',
    name: 'Mente Prodigiosa',
    category: 'evolucao',
    description: 'Você recebe um bônus de +1 no seu modificador de Inteligência, e um incremento de +2 em Mente.',
    cost: 15,
    bonuses: {
      attributes: { inteligencia: 1 },
      mente: 2,
    },
  },
  {
    id: 'precisao-cirurgica',
    name: 'Precisão Cirúrgica',
    category: 'talento',
    description: 'Você recebe um bônus de +1 no seu modificador de Finesse, e um bônus de +2 em cálculos.',
    cost: 20,
    bonuses: {
      attributes: { finesse: 1 },
    },
  },
]

export const getSingularitiesByCategory = (category: Singularity['category']): Singularity[] => {
  return singularities.filter(sing => sing.category === category)
}

export const getSingularityById = (id: string): Singularity | undefined => {
  return singularities.find(sing => sing.id === id)
}

