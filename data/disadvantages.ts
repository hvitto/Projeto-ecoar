// Disadvantages (Desvantagens) data from Ecoar RPG
// Desvantagens podem ser escolhidas para ganhar Pontos de Criação adicionais durante a criação de personagem

export interface Disadvantage {
  id: string
  name: string
  description: string
  pontosCriacao: number // Pontos de Criação ganhos ao escolher esta desvantagem
  category: 'atributos' | 'habilidades' | 'genetica'
  penalties?: {
    attributes?: Record<string, number>
    skills?: Record<string, number>
    corpo?: number
    mente?: number
    folego?: number
    mana?: number
    peso?: number
  }
}

export const disadvantages: Disadvantage[] = [
  // ========== ATRIBUTOS ==========
  {
    id: 'antipatico',
    name: 'Antipático',
    category: 'atributos',
    description: 'Você recebe uma penalidade de -1 no seu modificador de Carisma.',
    pontosCriacao: 10,
    penalties: {
      attributes: { carisma: -1 },
    },
  },
  {
    id: 'desatento',
    name: 'Desatento',
    category: 'atributos',
    description: 'Você recebe uma penalidade de -1 no seu modificador de Percepção.',
    pontosCriacao: 10,
    penalties: {
      attributes: { percepcao: -1 },
    },
  },
  {
    id: 'desinteligente',
    name: 'Desinteligente',
    category: 'atributos',
    description: 'Você recebe uma penalidade de -1 no seu modificador de Inteligência.',
    pontosCriacao: 10,
    penalties: {
      attributes: { inteligencia: -1 },
    },
  },
  {
    id: 'destoado',
    name: 'Destoado',
    category: 'atributos',
    description: 'Você recebe uma penalidade de -1 no seu modificador de Vontade.',
    pontosCriacao: 10,
    penalties: {
      attributes: { vontade: -1 },
    },
  },
  {
    id: 'devagar',
    name: 'Devagar',
    category: 'atributos',
    description: 'Você recebe uma penalidade de -1 no seu modificador de Finesse.',
    pontosCriacao: 10,
    penalties: {
      attributes: { finesse: -1 },
    },
  },
  {
    id: 'ectomorfo',
    name: 'Ectomorfo',
    category: 'atributos',
    description: 'Você recebe uma penalidade de -1 no seu modificador de Força.',
    pontosCriacao: 10,
    penalties: {
      attributes: { forca: -1 },
    },
  },
  {
    id: 'fragil',
    name: 'Frágil',
    category: 'atributos',
    description: 'Você recebe uma penalidade de -1 no seu modificador de Vitalidade.',
    pontosCriacao: 15,
    penalties: {
      attributes: { vitalidade: -1 },
    },
  },

  // ========== HABILIDADES ==========
  {
    id: 'animal-assustado',
    name: 'Animal Assustado',
    category: 'habilidades',
    description: 'Você recebe uma penalidade de -1 em testes da habilidade Compostura (Coragem).',
    pontosCriacao: 5,
    penalties: {
      skills: { compostura: -1 },
    },
  },
  {
    id: 'aparencia-horripilante',
    name: 'Aparência Horripilante',
    category: 'habilidades',
    description: 'Você recebe uma penalidade -1 em testes de Conversação.',
    pontosCriacao: 5,
    penalties: {
      skills: { conversacao: -1 },
    },
  },
  {
    id: 'desastrado',
    name: 'Desastrado',
    category: 'habilidades',
    description: 'Você recebe uma penalidade de -2 em testes de Furtividade.',
    pontosCriacao: 5,
    penalties: {
      skills: { furtividade: -2 },
    },
  },
  {
    id: 'distraido',
    name: 'Distraído',
    category: 'habilidades',
    description: 'Você recebe uma penalidade de -1 em testes de Atenção.',
    pontosCriacao: 5,
    penalties: {
      skills: { atencao: -1 },
    },
  },

  // ========== GENÉTICA ==========
  {
    id: 'franzino',
    name: 'Franzino',
    category: 'genetica',
    description: 'Você recebe uma redução de -1 no seu modificador de peso, e uma penalidade de -1 no seu modificador de Força.',
    pontosCriacao: 20,
    penalties: {
      peso: -1,
      attributes: { forca: -1 },
    },
  },
  {
    id: 'imunidade-baixa',
    name: 'Imunidade Baixa',
    category: 'genetica',
    description: 'Você recebe uma redução de -4 em Fôlego.',
    pontosCriacao: 5,
    penalties: {
      folego: -4,
    },
  },
  {
    id: 'inaptidao-magica',
    name: 'Inaptidão Mágica',
    category: 'genetica',
    description: 'Você recebe uma redução de -4 em Mana.',
    pontosCriacao: 5,
    penalties: {
      mana: -4,
    },
  },
  {
    id: 'mente-vulneravel',
    name: 'Mente Vulnerável',
    category: 'genetica',
    description: 'Você recebe uma redução de -2 em Mente.',
    pontosCriacao: 5,
    penalties: {
      mente: -2,
    },
  },
  {
    id: 'saude-fraca',
    name: 'Saúde Fraca',
    category: 'genetica',
    description: 'Você recebe uma redução de -2 em Corpo.',
    pontosCriacao: 5,
    penalties: {
      corpo: -2,
    },
  },
]

export const getDisadvantageById = (id: string): Disadvantage | undefined => {
  return disadvantages.find(d => d.id === id)
}

export const getDisadvantagesByCategory = (category: Disadvantage['category']): Disadvantage[] => {
  return disadvantages.filter(d => d.category === category)
}
