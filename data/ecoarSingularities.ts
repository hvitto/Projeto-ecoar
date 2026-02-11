// Singularidades dos Ecoares (Ecoar Singularities) data from Ecoar RPG
// Cada ecoar tem singularidades específicas que podem ser adquiridas

export interface EcoarSingularity {
  id: string
  ecoarId: string
  name: string
  description: string
  cost: number // Pontos de Criação ou Pontos de Evolução
  requirements?: {
    previous?: string // ID da singularidade anterior necessária
    nivelAlma?: number // Nível de Alma mínimo
    aptitudes?: Record<string, number> // Aptidões necessárias
    attributes?: Record<string, number> // Atributos necessários
    skills?: Record<string, number> // Habilidades necessárias
  }
  effects?: string // Descrição dos efeitos
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

export const ecoarSingularities: EcoarSingularity[] = [
  // ========== LYCANTROPO ==========
  {
    id: 'lycantropo-transformacao',
    ecoarId: 'lycantropo',
    name: 'Transformação',
    description: 'Você pode se transformar em uma forma bestial poderosa durante a lua cheia ou sob estresse extremo.',
    cost: 0, // Habilidade inata do ecoar
    effects: 'Durante a transformação, você recebe bônus em Força e Vitalidade, mas perde controle sobre suas ações. A transformação dura até o amanhecer ou até você ser incapacitado.',
    bonuses: {
      attributes: {
        forca: 2,
        vitalidade: 2,
      },
    },
    penalties: {
      attributes: {
        inteligencia: -1,
        carisma: -1,
      },
    },
  },
  {
    id: 'lycantropo-controle-parcial',
    ecoarId: 'lycantropo',
    name: 'Controle Parcial',
    description: 'Você aprende a manter parte de sua consciência durante a transformação.',
    cost: 15, // Pontos de Criação
    requirements: {
      previous: 'lycantropo-transformacao',
      nivelAlma: 2,
    },
    effects: 'Durante a transformação, você mantém controle parcial sobre suas ações. Você pode fazer testes de Vontade (CD 15) para manter controle sobre ações específicas.',
  },
  {
    id: 'lycantropo-sentidos-agucados',
    ecoarId: 'lycantropo',
    name: 'Sentidos Aguçados',
    description: 'Seus sentidos se tornam extremamente aguçados, mesmo na forma humana.',
    cost: 10, // Pontos de Criação
    requirements: {
      nivelAlma: 1,
    },
    bonuses: {
      attributes: {
        percepcao: 1,
      },
    },
    effects: 'Você recebe vantagem em testes de Percepção relacionados a olfato e audição. Você pode rastrear criaturas pelo cheiro em uma distância de até 1km.',
  },
  {
    id: 'lycantropo-resistencia-lunar',
    ecoarId: 'lycantropo',
    name: 'Resistência Lunar',
    description: 'Você desenvolve resistência natural a dano físico e regeneração acelerada.',
    cost: 20, // Pontos de Criação
    requirements: {
      previous: 'lycantropo-transformacao',
      nivelAlma: 3,
    },
    effects: 'Você recebe resistência a dano físico não-mágico. Além disso, você regenera 1 ponto de Corpo por hora, mesmo durante o combate.',
    bonuses: {
      corpo: 2,
    },
  },
  {
    id: 'lycantropo-forma-hibrida',
    ecoarId: 'lycantropo',
    name: 'Forma Híbrida',
    description: 'Você pode assumir uma forma híbrida entre humano e besta, mantendo controle total.',
    cost: 25, // Pontos de Criação
    requirements: {
      previous: 'lycantropo-controle-parcial',
      nivelAlma: 4,
      attributes: {
        vontade: 3,
      },
    },
    effects: 'Você pode se transformar em uma forma híbrida com uma ação completa. Nesta forma, você mantém controle total, recebe bônus em Força e Vitalidade, mas não sofre penalidades em Inteligência ou Carisma. A transformação pode ser mantida por um número de horas igual ao seu Nível de Alma.',
    bonuses: {
      attributes: {
        forca: 1,
        vitalidade: 1,
      },
    },
  },
  {
    id: 'lycantropo-urro-amedrontador',
    ecoarId: 'lycantropo',
    name: 'Urro Amoedrontador',
    description: 'Seu urro pode aterrorizar inimigos e fortalecer aliados.',
    cost: 15, // Pontos de Criação
    requirements: {
      previous: 'lycantropo-sentidos-agucados',
      nivelAlma: 2,
      attributes: {
        carisma: 2,
      },
    },
    effects: 'Com uma ação completa, você pode soltar um urro aterrorizante. Criaturas inimigas dentro de 10 metros devem fazer um teste de Vontade (CD = 10 + seu modificador de Carisma) ou ficam amedrontadas por 1 rodada. Aliados dentro da mesma área recebem um bônus de +1 em testes de ataque na próxima rodada.',
  },
]

// Funções auxiliares
export const getEcoarSingularitiesByEcoarId = (ecoarId: string): EcoarSingularity[] => {
  return ecoarSingularities.filter(sing => sing.ecoarId === ecoarId)
}

export const getEcoarSingularityById = (id: string): EcoarSingularity | undefined => {
  return ecoarSingularities.find(sing => sing.id === id)
}

export const getAllEcoarSingularities = (): EcoarSingularity[] => {
  return ecoarSingularities
}
