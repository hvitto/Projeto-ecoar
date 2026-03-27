export type RacialActivationType = 'passiva' | 'condicional' | 'complexa' | 'ativa'

export type RacialRuleEffects = {
  creationPointsExtra?: number
  creationPointsIgnoreCap?: boolean
  forceNoSizePenalty?: boolean
  dodgeBonus?: number
  corpoMenteFlatBonus?: number
  physicalResistanceBonus?: number
  naturalDamageBonus?: number
  naturalDamageByType?: Partial<Record<'contundente' | 'cortante' | 'perfurante', number>>
  initiativeBonus?: number
  socialPenaltyByPowerLevelHalfUp?: boolean
  socialHostilizeBonusByPowerLevelHalfUp?: boolean
  visionAttentionPenalty?: number
  mentalResistanceBonus?: number
  composturaByPowerLevelHalfUp?: boolean
}

export interface RacialSingularity {
  id: string
  raceId: string
  name: string
  description: string
  cost: number
  activationType: RacialActivationType
  requirements?: string[]
  acquisitionPhase?: 'creation' | 'evolution'
  notes?: string
  bonuses?: {
    attributes?: Record<string, number>
    skills?: Record<string, number>
    corpo?: number
    mente?: number
    folego?: number
    mana?: number
  }
  effects?: string
  ruleEffects?: RacialRuleEffects
}

export const racialSingularities: RacialSingularity[] = [
  {
    id: 'racial-peccata-gente-como-a-gente',
    raceId: 'peccata',
    name: 'Gente Como a Gente',
    description:
      'Durante a criação de personagem, personagens desta raça recebem 20 Pontos de Criação adicionais, que não contam para o limite máximo.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    ruleEffects: { creationPointsExtra: 20, creationPointsIgnoreCap: true },
  },
  {
    id: 'racial-anao-pequenos-e-robustos',
    raceId: 'anao',
    name: 'Pequenos e Robustos',
    description:
      'Você não pode adquirir talentos de genus que aumentem o seu modificador de tamanho para além de -1. No entanto, seu modificador de tamanho racial não lhe aplica penalidade em Força. Naturalmente, seu modificador de tamanho racial também lhe concede um bônus de +1 em testes de esquiva.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    ruleEffects: { forceNoSizePenalty: true, dodgeBonus: 1 },
  },
  {
    id: 'racial-anao-resistencia-ana',
    raceId: 'anao',
    name: 'Resistência Anã',
    description:
      'Você recebe um incremento de 6 pontos em Corpo e Mente, além de receber um bônus de +2 em cálculos de resistência a dano físico.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    bonuses: { corpo: 6, mente: 6 },
    ruleEffects: { corpoMenteFlatBonus: 6, physicalResistanceBonus: 2 },
  },
  {
    id: 'racial-orc-punhos-do-orc',
    raceId: 'orc',
    name: 'Punhos do Orc',
    description:
      'Ao atacar com armas naturais, você recebe um bônus de +3 em cálculos de dano contundente.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    ruleEffects: { naturalDamageByType: { contundente: 3 } },
  },
  {
    id: 'racial-orc-furia-irrefreavel',
    raceId: 'orc',
    name: 'Fúria Irrefreável',
    description:
      'Você realiza testes de À Beira do Abismo de forma favorável. Ao atacar com armas naturais, você recebe um bônus de +2 em cálculos de dano.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    ruleEffects: { naturalDamageBonus: 2 },
  },
  {
    id: 'racial-tyllow-pequeninos',
    raceId: 'tyllow',
    name: 'Pequeninos',
    description:
      'Você não pode adquirir talentos de genus que aumentem os seus modificadores de peso e tamanho para além de -1. Por causa desses modificadores, você naturalmente recebe uma penalidade de -1 nos modificadores de Força e Vitalidade, e um bônus de +2 em testes de esquiva.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    bonuses: { attributes: { forca: -1, vitalidade: -1 } },
    ruleEffects: { dodgeBonus: 2 },
  },
  {
    id: 'racial-tyllow-translocacao-do-tyllow',
    raceId: 'tyllow',
    name: 'Translocação do Tyllow',
    description:
      'Com uma ação curta, você recebe um deslocamento de translocação de 4 metros até o início do seu próximo turno. Este deslocamento pode ser usado em qualquer direção, mas não pode atravessar obstáculos e não causa ataques de oportunidade.',
    cost: 0,
    activationType: 'ativa',
    acquisitionPhase: 'creation',
  },
  {
    id: 'racial-fleurili-fotossintese-espiritual',
    raceId: 'fleurili',
    name: 'Fotossíntese Espiritual',
    description:
      'Caso um fleurili esteja diretamente sob a luz do sol, da lua ou de estrelas, ele recebe 4 pontos de cura em Corpo e Mente por rodada.',
    cost: 0,
    activationType: 'condicional',
    acquisitionPhase: 'creation',
  },
  {
    id: 'racial-fjyr-chifres-e-coices',
    raceId: 'fjyr',
    name: 'Chifres e Coices',
    description:
      'Ao atacar com armas naturais, você recebe um bônus de +3 em cálculos de dano contundente.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    ruleEffects: { naturalDamageByType: { contundente: 3 } },
  },
  {
    id: 'racial-fjyr-cascos-magicos',
    raceId: 'fjyr',
    name: 'Cascos Mágicos',
    description:
      'Você pode escalar superfícies íngremes e paredes verticais normalmente com seu deslocamento terrestre, e não recebe a condição pendurado enquanto o faz.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
  },
  {
    id: 'racial-fjyr-visao-ruim',
    raceId: 'fjyr',
    name: 'Visão Ruim',
    description:
      'Testes de Atenção que dependam exclusivamente da sua visão recebem uma penalidade de -4.',
    cost: 0,
    activationType: 'condicional',
    acquisitionPhase: 'creation',
    ruleEffects: { visionAttentionPenalty: -4 },
  },
  {
    id: 'racial-kaidler-garras-de-rapina',
    raceId: 'kaidler',
    name: 'Garras de Rapina',
    description:
      'Ao atacar com armas naturais, você recebe um bônus de +2 em cálculos de dano cortante e dano perfurante.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    ruleEffects: { naturalDamageByType: { cortante: 2, perfurante: 2 } },
  },
  {
    id: 'racial-kaidler-voo-de-kaidler',
    raceId: 'kaidler',
    name: 'Voo de Kaidler',
    description:
      'Você possui asas nos seus braços e pode voar com elas. Com uma ação longa, você recebe um deslocamento aéreo de 2 metros até o início de seu próximo turno. Para pousar, é necessário encostar no chão e usar uma ação menor. Para voar, você não pode estar carregando mais do que pode e suas mãos precisam estar livres.',
    cost: 0,
    activationType: 'ativa',
    acquisitionPhase: 'creation',
  },
  {
    id: 'racial-mayne-prontidao-leonina',
    raceId: 'mayne',
    name: 'Prontidão Leonina',
    description: 'Você recebe um bônus de +3 em testes de iniciativa.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    ruleEffects: { initiativeBonus: 3 },
  },
  {
    id: 'racial-niliapy-anatomia-robusta',
    raceId: 'niliapy',
    name: 'Anatomia Robusta',
    description:
      'Você não pode adquirir talentos de genus que diminuem os seus modificadores de peso e tamanho para menos de +1. Por causa desses modificadores, você naturalmente recebe um bônus de +1 nos modificadores de Força e Vitalidade, e uma penalidade de -2 em testes de esquiva.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    bonuses: { attributes: { forca: 1, vitalidade: 1 } },
    ruleEffects: { dodgeBonus: -2 },
  },
  {
    id: 'racial-niliapy-forca-crocodiliana',
    raceId: 'niliapy',
    name: 'Força Crocodiliana',
    description:
      'Ao atacar com armas naturais, você recebe um bônus de +2 em cálculos de dano contundente e dano cortante.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    ruleEffects: { naturalDamageByType: { contundente: 2, cortante: 2 } },
  },
  {
    id: 'racial-tsusagi-salto-lunar-dos-tsusagi',
    raceId: 'tsusagi',
    name: 'Salto Lunar dos Tsusagi',
    description:
      'Com uma ação curta, você pode saltar uma distância de até 3 metros em qualquer direção. Quedas de 4 metros ou menos não causam dano a você, mesmo que não caia em pé.',
    cost: 0,
    activationType: 'ativa',
    acquisitionPhase: 'creation',
  },
  {
    id: 'racial-triskel-anatomia-grande',
    raceId: 'triskelion',
    name: 'Anatomia Grande',
    description:
      'Você não pode adquirir talentos de genus que diminuem o seu modificador de tamanho para menos de +1. Por causa desses modificadores, você naturalmente recebe um bônus de +1 no modificador de Força, e uma penalidade de -1 em testes de esquiva.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    bonuses: { attributes: { forca: 1 } },
    ruleEffects: { dodgeBonus: -1 },
  },
  {
    id: 'racial-triskel-bencao-dos-triskelion',
    raceId: 'triskelion',
    name: 'Bênção dos Triskelion',
    description:
      'Enquanto vivo, você é imune ao contágio da Praga e à condição infectado. No entanto, você recebe uma penalidade igual a metade (arredondada para cima) do seu Nível de Poder em testes de habilidades sociais que não sejam para hostilizar uma persona, e o mesmo valor como bônus em testes sociais para hostilizar uma persona.',
    cost: 0,
    activationType: 'passiva',
    acquisitionPhase: 'creation',
    ruleEffects: {
      socialPenaltyByPowerLevelHalfUp: true,
      socialHostilizeBonusByPowerLevelHalfUp: true,
    },
  },
  {
    id: 'racial-peccata-esperanca-peccata',
    raceId: 'peccata',
    name: 'Esperança Peccata',
    description:
      'Caso você esteja com os valores atuais de Corpo ou Mente no máximo, você recebe um bônus de +1 em cálculos de resistência a dano mental.',
    cost: 5,
    activationType: 'condicional',
    acquisitionPhase: 'evolution',
    ruleEffects: { mentalResistanceBonus: 1 },
  },
  {
    id: 'racial-peccata-resiliencia-mental',
    raceId: 'peccata',
    name: 'Resiliência Mental',
    description: 'Você recebe um incremento de +2 em Mente.',
    cost: 5,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    bonuses: { mente: 2 },
  },
  {
    id: 'racial-peccata-um-com-o-caos',
    raceId: 'peccata',
    name: 'Um com o Caos',
    description: 'Você recebe um incremento de +4 em Mente.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-peccata-esperanca-peccata', 'racial-peccata-resiliencia-mental'],
    bonuses: { mente: 4 },
  },
  {
    id: 'racial-peccata-insistencia-peccata',
    raceId: 'peccata',
    name: 'Insistência Peccata',
    description:
      'Ao falhar ou não obter o resultado desejado em um teste, sacrificando 4 pontos de Fôlego e Mana e com uma ação menor, você pode refazê-lo e escolher o melhor resultado.',
    cost: 15,
    activationType: 'ativa',
    acquisitionPhase: 'evolution',
    requirements: ['racial-peccata-um-com-o-caos'],
  },
  {
    id: 'racial-peccata-espirito-indomavel',
    raceId: 'peccata',
    name: 'Espírito Indomável',
    description:
      'Você recebe um bônus em testes de Compostura igual à metade (arredondada para cima) do seu Nível de Poder.',
    cost: 15,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-peccata-insistencia-peccata'],
    ruleEffects: { composturaByPowerLevelHalfUp: true },
  },
  {
    id: 'racial-anao-resistencia-dvergr',
    raceId: 'anao',
    name: 'Resistência Dvergr',
    description:
      'O bônus de Resistência Anã recebe um incremento de +2, totalizando em um bônus de +4 em cálculos de resistência a dano físico.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    ruleEffects: { physicalResistanceBonus: 2 },
  },
  {
    id: 'racial-anao-visao-anao-aprimorada',
    raceId: 'anao',
    name: 'Visão de Anão Aprimorada',
    description: 'Você recebe o aprimoramento sensorial de visão infravermelha.',
    cost: 20,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-anao-resistencia-dvergr'],
  },
  {
    id: 'racial-anao-tolerancia-toxinas',
    raceId: 'anao',
    name: 'Tolerância a Toxinas',
    description: 'Você recebe robustez a dano tóxico.',
    cost: 30,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-anao-resistencia-dvergr'],
  },
  {
    id: 'racial-elfo-olhos-elficos',
    raceId: 'elfo',
    name: 'Olhos Élficos',
    description: 'Você recebe os aprimoramentos sensoriais de Supervisão e Visão no Escuro.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-elfo-passada-elfica',
    raceId: 'elfo',
    name: 'Passada Élfica',
    description: 'Você recebe um incremento de 2 metros no seu deslocamento terrestre.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-elfo-insistencia-elfica',
    raceId: 'elfo',
    name: 'Insistência Élfica',
    description:
      'Ao falhar ou não obter o resultado desejado em um teste, sacrificando 4 pontos de Fôlego e Mana e com uma ação menor, você pode refazê-lo e escolher o melhor resultado.',
    cost: 15,
    activationType: 'ativa',
    acquisitionPhase: 'evolution',
    requirements: ['racial-elfo-olhos-elficos'],
  },
  {
    id: 'racial-elfo-graciosidade-elfica',
    raceId: 'elfo',
    name: 'Graciosidade Élfica',
    description: 'Você realiza os testes de Furtividade de forma favorável.',
    cost: 25,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-elfo-passada-elfica'],
  },
  {
    id: 'racial-orc-resiliencia-orquica',
    raceId: 'orc',
    name: 'Resiliência Órquica',
    description: 'Você recebe um incremento de +2 em Corpo.',
    cost: 5,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    bonuses: { corpo: 2 },
  },
  {
    id: 'racial-orc-fluente-na-brutalidade',
    raceId: 'orc',
    name: 'Fluente na Brutalidade',
    description:
      'Ao realizar um ataque físico corpo-a-corpo, seu cálculo de dano recebe um bônus de +2 e um incremento de +3 em Dano Máximo.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-orc-insistencia-orquica',
    raceId: 'orc',
    name: 'Insistência Órquica',
    description:
      'Ao falhar ou não obter o resultado desejado em um teste, sacrificando 4 pontos de Fôlego e Mana e com uma ação menor, você pode refazê-lo e escolher o melhor resultado.',
    cost: 15,
    activationType: 'ativa',
    acquisitionPhase: 'evolution',
    requirements: ['racial-orc-resiliencia-orquica'],
  },
  {
    id: 'racial-orc-furia-orquica',
    raceId: 'orc',
    name: 'Fúria Órquica',
    description: 'Seus testes de À Beira do Abismo são sempre bem-sucedidos.',
    cost: 30,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-orc-fluente-na-brutalidade'],
  },
  {
    id: 'racial-tyllow-translocacao-reativa',
    raceId: 'tyllow',
    name: 'Translocação Reativa',
    description:
      'Ao sofrer dano através do ataque de uma criatura, você pode imediatamente usar uma reação para usar seu deslocamento de translocação.',
    cost: 10,
    activationType: 'ativa',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-tyllow-translocacao-aprimorada',
    raceId: 'tyllow',
    name: 'Translocação Tyllow Aprimorada',
    description: 'Você recebe um incremento de 2 metros em seu deslocamento de translocação.',
    cost: 15,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-tyllow-teleporte-tyllow',
    raceId: 'tyllow',
    name: 'Teleporte Tyllow',
    description:
      'Com uma ação longa e sacrificando 3 pontos de Mana, você pode usar um deslocamento de teleporte em uma distância igual ao seu deslocamento de translocação. Este deslocamento pode ser usado em qualquer direção, pode atravessar obstáculos e não causa ataques de oportunidade.',
    cost: 15,
    activationType: 'ativa',
    acquisitionPhase: 'evolution',
    requirements: ['racial-tyllow-translocacao-aprimorada'],
  },
  {
    id: 'racial-tyllow-harmonia-de-mana',
    raceId: 'tyllow',
    name: 'Harmonia de Mana',
    description: 'Você recupera 10 pontos de Mana a cada 10 minutos.',
    cost: 20,
    activationType: 'condicional',
    acquisitionPhase: 'evolution',
    requirements: ['racial-tyllow-teleporte-tyllow'],
  },
  {
    id: 'racial-fleurili-natureza-fleurili',
    raceId: 'fleurili',
    name: 'Natureza Fleurili',
    description:
      'A menos que você hostilize entienses, eles nunca te considerarão uma ameaça ou te atacarão.',
    cost: 5,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-fleurili-energia-natural',
    raceId: 'fleurili',
    name: 'Energia Natural',
    description: 'O valor total de Corpo e Mente recuperado por Fotossíntese Espiritual agora é 6.',
    cost: 15,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-fleurili-natureza-fleurili'],
  },
  {
    id: 'racial-fleurili-feras-e-flores',
    raceId: 'fleurili',
    name: 'Feras e Flores',
    description: 'Você recebe um bônus de +4 em testes de Lidar com Animais.',
    cost: 15,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-fleurili-natureza-fleurili'],
  },
  {
    id: 'racial-fleurili-charme-das-petalas',
    raceId: 'fleurili',
    name: 'Charme das Pétalas',
    description:
      'Quando qualquer tipo de criatura que esteja dentro de um alcance de 5 metros de você te tenha como alvo de um ataque físico, este ataque é realizado de forma desfavorável.',
    cost: 25,
    activationType: 'condicional',
    acquisitionPhase: 'evolution',
    requirements: ['racial-fleurili-energia-natural', 'racial-fleurili-feras-e-flores'],
  },
  {
    id: 'racial-fjyr-atencao-fjyr',
    raceId: 'fjyr',
    name: 'Atenção Fjyr',
    description: 'Você recebe um bônus de +2 em testes de Atenção (Arredores).',
    cost: 5,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    bonuses: { skills: { atencao: 2 } },
  },
  {
    id: 'racial-fjyr-sentido-fjyr',
    raceId: 'fjyr',
    name: 'Sentido Fjyr',
    description:
      'Você recebe um sentido monstruoso de 3 metros. Este sentido pode captar qualquer imagem, som ou odor e está sempre ativo, mesmo quando você está vendado.',
    cost: 45,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-fjyr-atencao-fjyr'],
  },
  {
    id: 'racial-fjyr-sentido-fjyr-absoluto',
    raceId: 'fjyr',
    name: 'Sentido Fjyr Absoluto',
    description:
      'Com uma ação curta, você recebe o aprimoramento sensorial sentido absoluto para o seu sentido monstruoso por uma rodada. Este aprimoramento faz com que seu sentido monstruoso atravesse obstáculos sólidos.',
    cost: 10,
    activationType: 'ativa',
    acquisitionPhase: 'evolution',
    requirements: ['racial-fjyr-sentido-fjyr'],
  },
  {
    id: 'racial-kaidler-aprimoramento-do-voo',
    raceId: 'kaidler',
    name: 'Aprimoramento do Voo',
    description: 'Você pode usar o Vôo do Kaidler com uma ação curta.',
    cost: 5,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-kaidler-aperfeicoamento-do-voo',
    raceId: 'kaidler',
    name: 'Aperfeiçoamento do Voo',
    description: 'Você pode usar o Vôo do Kaidler com uma ação menor.',
    cost: 5,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-kaidler-aprimoramento-do-voo'],
  },
  {
    id: 'racial-kaidler-olhos-de-aguia',
    raceId: 'kaidler',
    name: 'Olhos de Águia',
    description: 'Você recebe os aprimoramentos sensoriais de Supervisão e Visão no Escuro.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-kaidler-vontade-de-rapina',
    raceId: 'kaidler',
    name: 'Vontade de Rapina',
    description:
      'Você recebe um bônus igual à metade (arredondada para cima) do seu Nível de Poder em seus testes de Compostura.',
    cost: 15,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-kaidler-olhos-de-aguia'],
    ruleEffects: { composturaByPowerLevelHalfUp: true },
  },
  {
    id: 'racial-kaidler-presenca-imperial',
    raceId: 'kaidler',
    name: 'Presença Imperial',
    description:
      'Ao ser acertado por um ataque físico de uma persona e com uma reação, você pode obrigá-la a refazer o teste. Caso o seu Nível de Alma seja maior que o dessa persona, o novo teste recebe penalidade igual à diferença entre os níveis. Este efeito só pode ser usado uma vez por descanso.',
    cost: 25,
    activationType: 'ativa',
    acquisitionPhase: 'evolution',
    requirements: ['racial-kaidler-vontade-de-rapina'],
  },
  {
    id: 'racial-mayne-conquistador-felino',
    raceId: 'mayne',
    name: 'Conquistador Felino',
    description: 'Ao causar dano físico ou mental, você causa 2 pontos de dano adicionais.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-mayne-resiliencia-leonina',
    raceId: 'mayne',
    name: 'Resiliência Leonina',
    description: 'Você recebe um incremento de 2 pontos em Corpo e Mente.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-mayne-conquistador-felino'],
    bonuses: { corpo: 2, mente: 2 },
  },
  {
    id: 'racial-mayne-coracao-de-leao',
    raceId: 'mayne',
    name: 'Coração de Leão',
    description:
      'Ao realizar um teste onde você está recebendo um valor de uma ou mais penalidades, você pode reduzir o valor total das penalidades em 4.',
    cost: 15,
    activationType: 'condicional',
    acquisitionPhase: 'evolution',
    requirements: ['racial-mayne-conquistador-felino'],
  },
  {
    id: 'racial-mayne-reflexos-leoninos',
    raceId: 'mayne',
    name: 'Reflexos Leoninos',
    description: 'Você é imune à condição surpreso.',
    cost: 25,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-mayne-coracao-de-leao', 'racial-mayne-resiliencia-leonina'],
  },
  {
    id: 'racial-niliapy-anatomia-crocodiliana',
    raceId: 'niliapy',
    name: 'Anatomia Crocodiliana',
    description: 'Ao receber pelo menos 1 ponto de cura em Corpo, você recebe 3 pontos de cura adicionais.',
    cost: 10,
    activationType: 'condicional',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-niliapy-resistencia-crocodiliana',
    raceId: 'niliapy',
    name: 'Resistência Crocodiliana',
    description: 'Você recebe um bônus de +2 em cálculos de resistência a dano físico.',
    cost: 15,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-niliapy-anatomia-crocodiliana'],
    ruleEffects: { physicalResistanceBonus: 2 },
  },
  {
    id: 'racial-niliapy-forca-crocodiliana-talento',
    raceId: 'niliapy',
    name: 'Força Crocodiliana',
    description: 'Você recebe um bônus de +4 em testes de Atletismo (Peso).',
    cost: 15,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-niliapy-resistencia-crocodiliana'],
  },
  {
    id: 'racial-niliapy-escamas-espessas',
    raceId: 'niliapy',
    name: 'Escamas Espessas',
    description: 'Você recebe robustez a dano cortante e perfurante.',
    cost: 20,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-niliapy-resistencia-crocodiliana'],
  },
  {
    id: 'racial-tsusagi-agilidade-da-lebre',
    raceId: 'tsusagi',
    name: 'Agilidade da Lebre',
    description: 'Você recebe um incremento de 2 metros no seu deslocamento terrestre.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-tsusagi-evasao-tsusagi',
    raceId: 'tsusagi',
    name: 'Evasão Tsusagi',
    description: 'Com uma reação, você pode tornar um teste de Reflexos favorável.',
    cost: 25,
    activationType: 'ativa',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-tsusagi-queda-lunar',
    raceId: 'tsusagi',
    name: 'Queda Lunar',
    description: 'Você é completamente imune a dano de queda.',
    cost: 25,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-triskel-postura-monstruosa',
    raceId: 'triskelion',
    name: 'Postura Monstruosa',
    description:
      'Com uma ação menor, você pode trocar de postura normal para monstruosa. Enquanto isso, se estiver de mãos vazias, recebe incremento de deslocamento terrestre por braço utilizado no efeito.',
    cost: 5,
    activationType: 'ativa',
    acquisitionPhase: 'evolution',
  },
  {
    id: 'racial-triskel-corrida-do-lobo',
    raceId: 'triskelion',
    name: 'Corrida do Lobo',
    description: 'Aumenta o incremento de deslocamento terrestre de Postura Monstruosa em 2 metros.',
    cost: 10,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-triskel-postura-monstruosa'],
  },
  {
    id: 'racial-triskel-garras-do-triskelion',
    raceId: 'triskelion',
    name: 'Garras do Triskelion',
    description:
      'Ao atacar com armas naturais, você recebe um bônus de +3 em cálculos de dano e +2 em Acerto Crítico em ataques com armas naturais.',
    cost: 20,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-triskel-postura-monstruosa'],
    ruleEffects: { naturalDamageBonus: 3 },
  },
  {
    id: 'racial-triskel-resistencia-monstruosa',
    raceId: 'triskelion',
    name: 'Resistência Monstruosa',
    description:
      'Você recebe robustez a todo tipo de dano físico, com exceção daqueles causados por armas ou munição de prata e dano ardente.',
    cost: 25,
    activationType: 'passiva',
    acquisitionPhase: 'evolution',
    requirements: ['racial-triskel-postura-monstruosa'],
    ruleEffects: { physicalResistanceBonus: 2 },
  },
]

export function getRacialSingularitiesByRaceId(raceId: string): RacialSingularity[] {
  return racialSingularities.filter((s) => s.raceId === raceId)
}

export function getRacialSingularityById(id: string): RacialSingularity | undefined {
  return racialSingularities.find((s) => s.id === id)
}

/** Remove ids inválidos ou desconhecidos até todos os `requirements` estarem satisfeitos no próprio conjunto (cadeias e AND). */
export function pruneRacialSingularitiesToValidRequirements(selectedIds: string[]): string[] {
  let current = [...selectedIds]
  let changed = true
  while (changed) {
    changed = false
    const next = current.filter((sid) => {
      const sing = getRacialSingularityById(sid)
      if (!sing) return false
      return (sing.requirements ?? []).every((reqId) => current.includes(reqId))
    })
    if (next.length !== current.length) changed = true
    current = next
  }
  return current
}
