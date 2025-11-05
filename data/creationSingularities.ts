// Creation Singularities (Singularidades de Criação) - Vantagens
// As Singularidades de Criação só podem ser adquiridas durante a criação de personagem

export interface CreationSingularity {
  id: string
  name: string
  category: 'atributos' | 'habilidades' | 'genetica' | 'talentos'
  description: string
  cost: number // Pontos de Criação
  requirements?: string[] // IDs de singularidades/desvantagens que não podem ser possuídas
  bonuses?: {
    attributes?: Record<string, number>
    skills?: Record<string, number>
    corpo?: number
    mente?: number
    folego?: number
    mana?: number
    deslocamento?: {
      terrestre?: number
    }
    tamanho?: number
    peso?: number
  }
  penalties?: {
    attributes?: Record<string, number>
    skills?: Record<string, number>
    peso?: number
  }
}

export const creationSingularities: CreationSingularity[] = [
  // ========== ATRIBUTOS ==========
  {
    id: 'agil',
    name: 'Ágil',
    category: 'atributos',
    description: 'Você recebe um bônus de +1 no seu modificador de Finesse.',
    cost: 10,
    requirements: ['devagar'], // não possuir Devagar
    bonuses: {
      attributes: { finesse: 1 },
    },
  },
  {
    id: 'determinado',
    name: 'Determinado',
    category: 'atributos',
    description: 'Você recebe um bônus de +1 no seu modificador de Vontade.',
    cost: 10,
    requirements: ['destoado'], // não possuir Destoado
    bonuses: {
      attributes: { vontade: 1 },
    },
  },
  {
    id: 'extrovertido',
    name: 'Extrovertido',
    category: 'atributos',
    description: 'Você recebe um bônus de +1 no seu modificador de Carisma.',
    cost: 10,
    requirements: ['antipatico'], // não possuir Antipático
    bonuses: {
      attributes: { carisma: 1 },
    },
  },
  {
    id: 'facilidade-em-aprender',
    name: 'Facilidade em Aprender',
    category: 'atributos',
    description: 'Você recebe um bônus de +1 no seu modificador de Inteligência.',
    cost: 10,
    requirements: ['desinteligente'], // não possuir Desinteligente
    bonuses: {
      attributes: { inteligencia: 1 },
    },
  },
  {
    id: 'mesomorfo',
    name: 'Mesomorfo',
    category: 'atributos',
    description: 'Você recebe um bônus de +1 no seu modificador de Força.',
    cost: 10,
    requirements: ['ectomorfo'], // não possuir Ectomorfo
    bonuses: {
      attributes: { forca: 1 },
    },
  },
  {
    id: 'perspicacia',
    name: 'Perspicácia',
    category: 'atributos',
    description: 'Você recebe um bônus de +1 no seu modificador de Percepção.',
    cost: 10,
    requirements: ['desatento'], // não possuir Desatento
    bonuses: {
      attributes: { percepcao: 1 },
    },
  },

  // ========== HABILIDADES ==========
  {
    id: 'beleza-insuperavel',
    name: 'Beleza Insuperável',
    category: 'habilidades',
    description: 'Você recebe um bônus de +2 em testes de Conversação.',
    cost: 5,
    requirements: ['aparencia-horripilante'], // não possuir Aparência Horripilante
    bonuses: {
      skills: { conversacao: 2 },
    },
  },
  {
    id: 'aptidao-magica',
    name: 'Aptidão Mágica',
    category: 'habilidades',
    description: 'Você recebe um incremento de +4 em Mana.',
    cost: 5,
    requirements: ['inaptidao-magica'], // não possuir Inaptidão Mágica
    bonuses: {
      mana: 4,
    },
  },
  {
    id: 'duravel',
    name: 'Durável',
    category: 'habilidades',
    description: 'Você recebe um incremento de +2 em Corpo.',
    cost: 5,
    requirements: ['saude-fraca'], // não possuir Saúde Fraca
    bonuses: {
      corpo: 2,
    },
  },
  {
    id: 'inteligencia-emocional',
    name: 'Inteligência Emocional',
    category: 'habilidades',
    description: 'Você recebe um incremento de +2 em Mente.',
    cost: 5,
    requirements: ['mente-vulneravel'], // não possuir Mente Vulnerável
    bonuses: {
      mente: 2,
    },
  },
  {
    id: 'metabolismo-resistente',
    name: 'Metabolismo Resistente',
    category: 'habilidades',
    description: 'Você recebe um incremento de +4 em Fôlego.',
    cost: 5,
    requirements: ['imunidade-baixa'], // não possuir Imunidade Baixa
    bonuses: {
      folego: 4,
    },
  },

  // ========== GENÉTICA ==========
  {
    id: 'humanoid-grande',
    name: 'Humanóide Grande',
    category: 'genetica',
    description: 'Seu modificador de tamanho aumenta em +1. Esse modificador é aplicado no seu modificador de Força, no alcance efetivo de qualquer arma corpo-a-corpo que você esteja utilizando (os alcances posteriores também são ajustados), e como penalidade em seus testes de esquiva. Você pode adquirir essa singularidade até duas vezes, e deve ajustar a sua altura de acordo com o seu novo modificador de tamanho.',
    cost: 10,
    requirements: ['franzino'], // não possuir Franzino
    bonuses: {
      tamanho: 1,
    },
  },
  {
    id: 'humanoid-pesado',
    name: 'Humanóide Pesado',
    category: 'genetica',
    description: 'Seu modificador de peso aumenta em +1. Esse modificador é aplicado no seu modificador de Vitalidade, nos testes de dano físico corpo-a-corpo, e em como penalidade em seus testes de esquiva. Você pode adquirir essa singularidade até duas vezes, e deve ajustar o seu peso de acordo com o seu novo modificador de peso.',
    cost: 10,
    requirements: ['franzino'], // não possuir Franzino
    bonuses: {
      peso: 1,
    },
  },
  {
    id: 'porte-pequeno',
    name: 'Porte Pequeno',
    category: 'genetica',
    description: 'Você recebe um bônus de +1 em testes de esquiva e +2 em Furtividade, e uma penalidade de -1 no seu modificador de peso.',
    cost: 5,
    requirements: ['humanoid-grande', 'humanoid-pesado'], // não possuir Humanoide Grande ou Pesado
    bonuses: {
      skills: { furtividade: 2, esquiva: 1 },
    },
    penalties: {
      peso: -1,
    },
  },

  // ========== TALENTOS ==========
  {
    id: 'alta-mobilidade',
    name: 'Alta Mobilidade',
    category: 'talentos',
    description: 'Você recebe um bônus de 2 metros no seu deslocamento terrestre.',
    cost: 10,
    bonuses: {
      deslocamento: {
        terrestre: 2,
      },
    },
  },
  {
    id: 'atleta',
    name: 'Atleta',
    category: 'talentos',
    description: 'Você recebe um bônus de +1 em testes de habilidades motoras, e um bônus de 1 metro no seu deslocamento terrestre.',
    cost: 10,
    bonuses: {
      skills: { 'habilidades-motoras': 1 },
      deslocamento: {
        terrestre: 1,
      },
    },
  },
]

export const getCreationSingularityById = (id: string): CreationSingularity | undefined => {
  return creationSingularities.find(sing => sing.id === id)
}

export const getCreationSingularitiesByCategory = (category: CreationSingularity['category']): CreationSingularity[] => {
  return creationSingularities.filter(sing => sing.category === category)
}

