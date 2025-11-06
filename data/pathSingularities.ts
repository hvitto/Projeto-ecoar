// Singularidades de Trilhas (Path Singularities) data from Ecoar RPG

export interface PathBaseSingularity {
  id: string
  pathId: string
  name: string
  description: string
  cost: number // Pontos de Evolução
  requirements?: {
    skills?: Record<string, number> // Habilidades necessárias
    noOtherPath?: boolean // Não seguir nenhuma outra Trilha
  }
  effects: string[] // Lista de efeitos/singularidades concedidas
}

export interface Bruxaria {
  id: string
  category: 'destruicao' | 'terror' | 'ilusao' | 'agouro' | 'protecao' | 'reparacao' | 'controle'
  name: string
  description: string
  manaCost: number | string // Custo de Mana (pode ser variável)
  action: 'menor' | 'curta' | 'longa' | 'reacao' | 'livre'
  range?: string // Alcance
  effects: string
}

export interface CacadaPower {
  id: string
  name: string
  description: string
  cost: number // Pontos de Evolução
  requirements?: {
    pathId?: string // Requer qualquer Trilha da Caçada
  }
  effects: string
  choices?: {
    id: string
    name: string
    description: string
  }[]
}

export interface CacadaEnhancement {
  id: string
  name: string
  description: string
  cost: number // Pontos de Evolução
  requirements: {
    powerId: string // Requer um poder específico
    noOtherEnhancement?: boolean // Nenhum outro aprimoramento para o poder relacionado
  }
  effects: string
}

// Função auxiliar para calcular Nível de Trilha baseado no Nível de Alma
export function getPathLevelFromSoulLevel(soulLevel: number): number {
  const levelMap: Record<number, number> = {
    1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 10: 5,
    11: 6, 12: 6, 13: 7, 14: 7, 15: 8, 16: 8, 17: 9, 18: 9, 19: 10, 20: 10,
    21: 11, 22: 11, 23: 12, 24: 12
  }
  return levelMap[soulLevel] || 1
}

// ========== BASE PATH SINGULARITIES ==========

export const pathBaseSingularities: PathBaseSingularity[] = [
  {
    id: 'bruxo',
    pathId: 'bruxaria',
    name: 'Bruxo(a)',
    description: 'Aqueles que seguem esta Trilha se tornam Bruxos e Bruxas.',
    cost: 60,
    requirements: {
      skills: { arcana: 2 },
      noOtherPath: true,
    },
    effects: [
      'Falso Ídolo',
      'Véu da Angústia',
      'Canalização Arcana',
      'Bruxarias',
    ],
  },
  {
    id: 'cacador',
    pathId: 'cacada',
    name: 'Caçador(a)',
    description: 'Aqueles que lutam diretamente contra a Praga podem se tornar Caçadores.',
    cost: 60,
    requirements: {
      noOtherPath: true,
    },
    effects: [
      'Caçador de Monstros',
      'Expurgo',
      'Invisibilidade Moral',
      'Sentido da Trilha',
      'Resistência à Praga',
      'Poderes da Caçada',
    ],
  },
]

// ========== BRUXARIAS ==========

export const bruxarias: Bruxaria[] = [
  // ========== BRUXARIAS DE DESTRUIÇÃO ==========
  {
    id: 'confissao',
    category: 'destruicao',
    name: 'Confissão',
    description: 'Bruxarias de destruição causam efeitos cruéis e mortais, feitas para ceifar vidas.',
    manaCost: 6,
    action: 'menor',
    range: '15 metros',
    effects: 'Sacrificando 6 pontos de Mana e com uma ação menor, você realiza um teste de ataque especial contra até três alvos adjacentes que você possa ver dentro de 15 metros com seu modificador de Arcana + Mágica (Arcana), resistido por um teste de esquiva. O dano base deste ataque é igual a 6 + seu Nível de Trilha, e a diferença entre o ataque e a esquiva é somado ao dano. O ataque não pode causar acertos limpos e danos monstruosos, e o Dano Máximo do mesmo é igual a 12 + o triplo do seu Nível de Trilha. Você pode escolher causar dano explosivo, corrosivo ou tóxico no momento do ataque, e o dano é resistido normalmente pelo seu alvo.',
  },
  {
    id: 'nuvem-de-morte',
    category: 'destruicao',
    name: 'Nuvem de Morte',
    description: 'Bruxarias de destruição causam efeitos cruéis e mortais, feitas para ceifar vidas.',
    manaCost: '2+',
    action: 'longa',
    range: '15 metros',
    effects: 'Sacrificando 2 pontos de Mana e com uma ação longa, você cria uma nuvem em um quadrado dentro de 15 metros que causa um valor de dano mágico igual ao seu Nível da Caçada. A nuvem ocupa um quadrado, mas pode afetar até 3 criaturas por rodada em quadrados adjacentes ou no quadrado afetado. Uma criatura é afetada caso entre no alcance da nuvem, e você pode decidir se ela será afetada ou não no momento do contato. Quando uma criatura é afetada, você deve realizar um teste de ataque especial com seu modificador de Arcana + Mágica (Arcana), resistido por um teste de evasão especial com Percepção + Compostura (Determinação). A diferença entre o ataque e a evasão é adicionada como dano, ele não causa acertos limpos e danos monstruosos, e o Dano Máximo do ataque é igual a 12 + o trilho do seu Nível de Trilha. O dano causado é mágico, e pode ser resistido normalmente pelo alvo do seu ataque. A nuvem dura uma rodada, mas você pode sacrificar 1 ponto de Mana adicional para estender sua duração por mais uma rodada. Quando uma criatura é afetada, você também pode escolher sacrificar pontos de Mana adicionais, aumentando o dano em +2 para cada ponto sacrificado, respeitando o Dano Máximo.',
  },
  {
    id: 'raio-elemental',
    category: 'destruicao',
    name: 'Raio Elemental',
    description: 'Bruxarias de destruição causam efeitos cruéis e mortais, feitas para ceifar vidas.',
    manaCost: 4,
    action: 'menor',
    range: '15 metros',
    effects: 'Sacrificando 4 pontos de Mana e com uma ação menor, você realiza um teste de ataque especial contra um alvo que você possa ver dentro de 15 metros com seu modificador de Arcana + Mágica (Arcana), resistido por um teste de esquiva. O dano base deste ataque é igual a 6 + seu Nível de Trilha, e a diferença entre o ataque e a esquiva é somado ao dano. O ataque não possui bônus de acerto crítico mas pode causar acertos limpos e danos monstruosos, e o Dano Máximo do mesmo é igual a 12 + o triplo do seu Nível de Trilha. Você pode escolher causar dano ardente, congelante ou elétrico no momento do ataque, e o dano é resistido normalmente pelo seu alvo.',
  },
  {
    id: 'traicao-do-idolo',
    category: 'destruicao',
    name: 'Traição do Ídolo',
    description: 'Bruxarias de destruição causam efeitos cruéis e mortais, feitas para ceifar vidas.',
    manaCost: 2,
    action: 'menor',
    range: '15 metros',
    effects: 'Sacrificando 2 pontos de Mana e com uma ação menor, os ataques mágicos do seu alvo (o qual pode ser você) ignoram Resistência Monstruosa por uma rodada.',
  },
  {
    id: 'vinganca',
    category: 'destruicao',
    name: 'Vingança',
    description: 'Bruxarias de destruição causam efeitos cruéis e mortais, feitas para ceifar vidas.',
    manaCost: 'variável',
    action: 'reacao',
    range: '15 metros',
    effects: 'Ao ser acertado por um ataque físico de uma criatura que você possa ver, sacrificando pontos de Mana igual a metade (arredondada para baixo) do dano recebido e com uma reação, você causa o mesmo dano recebido ao atacante.',
  },

  // ========== BRUXARIAS DE TERROR ==========
  {
    id: 'causar-panico',
    category: 'terror',
    name: 'Causar Pânico',
    description: 'Bruxarias de terror focam em causar dano mental e apavorar criaturas.',
    manaCost: 'variável',
    action: 'longa',
    range: '15 metros',
    effects: 'Sacrificando pontos de Mana e com uma ação longa, você força uma criatura que você possa ver dentro de 15 metros a realizar um teste de Vontade + Compostura (Determinação) com uma dificuldade igual a 3 + pontos de Mana sacrificados. Se a criatura falhar, ela fica apavorada por 1 rodada a cada seu Nível de Trilha. Você não pode sacrificar um número de pontos de Mana maior que o seu Nível de Trilha, e a criatura afetada pode refazer o teste no fim de cada uma de suas rodadas para tentar se livrar da condição.',
  },
  {
    id: 'explosao-de-stress',
    category: 'terror',
    name: 'Explosão de Stress',
    description: 'Bruxarias de terror focam em causar dano mental e apavorar criaturas.',
    manaCost: '1+4',
    action: 'menor',
    range: '15 metros',
    effects: 'Sacrificando 1 ponto de Mana e com uma ação menor, você inicia o efeito. Durante 10 minutos, você deve anotar todo o dano mental recebido. Caso você cure seus pontos de Mente, Mana, ou equivalente durante esse tempo, você deve subtrair a cura recebida do dano anotado. Durante o efeito, você pode sacrificar 4 pontos de Mana e utilizar uma ação longa para direcionar todo o dano recebido contra uma criatura que você possa ver dentro de 15 metros. O alvo deve realizar um teste de Vontade + Compostura (Coragem). O resultado do teste irá subtrair no dano aplicado, o qual será igual ao dano que você anotou. Ao realizar esse ataque mental, o efeito cessa.',
  },
  {
    id: 'falsa-empatia',
    category: 'terror',
    name: 'Falsa Empatia',
    description: 'Bruxarias de terror focam em causar dano mental e apavorar criaturas.',
    manaCost: 'variável',
    action: 'longa',
    range: '15 metros',
    effects: 'Sacrificando pontos de Mana e com uma ação longa, você causa dano mental em si mesmo para causar dano em uma quantidade de criaturas que você pode ver dentro de 15 metros igual ao seu Nível de Trilha. O dano mental causado em si mesmo é igual aos pontos de Mana sacrificados, e o dano recebido pelas criaturas é igual ao dobro disso. Caso o número de criaturas afetadas seja maior que o seu Nível de Poder, elas podem resistir ao efeito com um teste de Vontade + Compostura (Coragem), reduzindo o dano em um valor igual ao resultado do teste.',
  },
  {
    id: 'manto-de-terror',
    category: 'terror',
    name: 'Manto de Terror',
    description: 'Bruxarias de terror focam em causar dano mental e apavorar criaturas.',
    manaCost: 'variável',
    action: 'longa',
    range: 'Pessoal',
    effects: 'Sacrificando pontos de Mana e com uma ação longa, você cria um manto de terror sobre você que afeta atacantes e dura um turno para cada Nível de Trilha. Caso uma criatura te ataque com uma arma que não seja de artilharia, granada ou explosivo, ela deve realizar um teste de Vontade + Compostura (Determinação) com uma dificuldade igual ao seus pontos de Mana sacrificados nessa ação. Se a criatura falhar no teste, ela deve desistir dessa ação ou receber a condição apavorado após realizar o ataque.',
  },
  {
    id: 'pesadelo-farsante',
    category: 'terror',
    name: 'Pesadelo Farsante',
    description: 'Bruxarias de terror focam em causar dano mental e apavorar criaturas.',
    manaCost: 5,
    action: 'menor',
    range: '15 metros',
    effects: 'Sacrificando 5 pontos de Mana e com uma ação menor ou reação, você transforma o dano de um ataque físico em dano mental. Você deve usar uma ação menor caso seja o seu ataque, e uma reação caso seja o ataque de outra criatura. O dano recebe um bônus igual ao seu Nível de Trilha. Tanto a criatura alvo quanto a criatura atacante devem estar dentro de 15 de você e dentro do seu campo de visão.',
  },

  // ========== BRUXARIAS DE ILUSÃO ==========
  {
    id: 'cordas-fantasmas',
    category: 'ilusao',
    name: 'Cordas Fantasmas',
    description: 'Bruxarias de ilusão criam efeitos temporários que soam como reais.',
    manaCost: 6,
    action: 'curta',
    range: '15 metros',
    effects: 'Sacrificando 6 pontos de Mana e com uma ação curta, você realiza um teste de ataque especial contra uma criatura que você possa ver dentro de 15 metros com seu modificador de Arcana + Mágica (Arcana) resistido com Vontade + Compostura (Determinação). Em um sucesso, a criatura alvo recebe a condição restringida. A condição dura 1 minuto, e a criatura pode usar uma ação longa para repetir o teste e tentar se livrar da condição, com uma dificuldade igual a 3 + seu Nível de Trilha.',
  },
  {
    id: 'equipamento-do-bruxo',
    category: 'ilusao',
    name: 'Equipamento do Bruxo',
    description: 'Bruxarias de ilusão criam efeitos temporários que soam como reais.',
    manaCost: 'variável',
    action: 'curta',
    range: 'Pessoal',
    effects: 'Sacrificando pontos de Mana e com uma ação curta para criar uma arma ou uma ação longa para criar uma armadura, você pode criar um equipamento com magia. Cada ponto de Mana sacrificado adiciona 250 moedas no custo total permitido do equipamento. Você pode sacrificar, no máximo, um valor de Mana igual ao triplo do seu Nível de Trilha. O equipamento dura até seu próximo descanso e é claramente de criação mágica. O mesmo não pode ser uma granada, explosivo ou arma de artilharia, e embora precise recarregar não consome ou requer munição.',
  },
  {
    id: 'pseudomorte',
    category: 'ilusao',
    name: 'Pseudomorte',
    description: 'Bruxarias de ilusão criam efeitos temporários que soam como reais.',
    manaCost: '6+2',
    action: 'longa',
    range: 'Pessoal',
    effects: 'Sacrificando 6 pontos de Mana e com uma ação longa, você se transforma temporariamente em um morto-vivo. O efeito dura até o seu próximo descanso, ou até você sacrificar 2 pontos de Mana e usar uma ação curta para finalizá-lo de forma prematura. Você é considerado um morto-vivo, e não é afetado pelas seguintes condições: envenenado, hemorragia, hemorragia letal, sangrando, inconsciente, sentença de morte e À Beira do Abismo. Você possui fraqueza a dano ardente, mas não recebe nenhum tipo de dano por não cumprir suas necessidades básicas. Você não pode receber cura através da ação de primeiros socorros, ou dano através de um estrangulamento. Um morto-vivo não pode ter sua cabeça ou tronco destruídos a menos que o ataque também reduza seu Corpo e Fôlego (ou equivalente) à 0, ou os mesmos já sejam 0. Uma cabeça ou tronco destruído concede uma penalidade cumulativa em todos os testes do morto-vivo igual ao seu Nível de Poder.',
  },
  {
    id: 'solidao',
    category: 'ilusao',
    name: 'Solidão',
    description: 'Bruxarias de ilusão criam efeitos temporários que soam como reais.',
    manaCost: 6,
    action: 'longa',
    range: 'Pessoal',
    effects: 'Sacrificando 6 pontos de Mana e com uma ação longa, você torna os seus testes de Furtividade favoráveis, e pode tentar se esconder mesmo fora de qualquer cobertura. Este efeito dura 1 minuto. Você se torna completamente invisível para aqueles que não percebem a sua presença, mesmo que você esteja de pé na frente deles.',
  },
  {
    id: 'miragem',
    category: 'ilusao',
    name: 'Miragem',
    description: 'Bruxarias de ilusão criam efeitos temporários que soam como reais.',
    manaCost: 2,
    action: 'longa',
    range: '15 metros',
    effects: 'Sacrificando 2 pontos de Mana e com uma ação longa, você cria uma imagem ou som falso (ou ambos) em um ponto dentro de 15 metros de você. A imagem não pode ocupar mais que quatro quadrados de área e dois de altura, e o som não pode ir além de 50 metros. Uma criatura que suspeite que isso é uma ilusão pode fazer um teste de Percepção + Atenção (Investigação) com uma dificuldade igual ao seu modificador de Arcana + seu Nível de Trilha. Em um sucesso, ela percebe a ilusão.',
  },

  // ========== BRUXARIAS DE AGOURO ==========
  {
    id: 'acao-dupla',
    category: 'agouro',
    name: 'Ação Dupla',
    description: 'Bruxarias de agouro preveem o futuro e brincam com os pilares do destino e da realidade.',
    manaCost: 2,
    action: 'longa',
    range: 'Pessoal',
    effects: 'No início de sua rodada, sacrificando 2 pontos de Mana e com uma ação longa, você não age durante essa rodada para realizar o dobro de ações na sua próxima rodada. Esse efeito deve ser ativado no início da sua rodada, e você não pode realizar nenhuma ação ou reação após usá-lo até que essa rodada termine.',
  },
  {
    id: 'percepcao-do-bruxo',
    category: 'agouro',
    name: 'Percepção do Bruxo',
    description: 'Bruxarias de agouro preveem o futuro e brincam com os pilares do destino e da realidade.',
    manaCost: 6,
    action: 'longa',
    range: '15 metros',
    effects: 'Sacrificando 6 pontos de Mana e com uma ação longa, você torna os testes de iniciativa de uma criatura que você possa ver dentro de 15 metros (que pode ser você) favoráveis até o próximo descanso dela.',
  },
  {
    id: 'prever-perigo',
    category: 'agouro',
    name: 'Prever Perigo',
    description: 'Bruxarias de agouro preveem o futuro e brincam com os pilares do destino e da realidade.',
    manaCost: 6,
    action: 'reacao',
    range: 'Pessoal',
    effects: 'Ao ser alvo de um ataque, sacrificando 6 pontos de Mana e com uma reação, você torna um teste de esquiva favorável.',
  },
  {
    id: 'ramificacoes-do-destino',
    category: 'agouro',
    name: 'Ramificações do Destino',
    description: 'Bruxarias de agouro preveem o futuro e brincam com os pilares do destino e da realidade.',
    manaCost: 4,
    action: 'menor',
    range: 'Pessoal',
    effects: 'Sacrificando 4 pontos de Mana e com uma ação menor, você lhe concede um bônus igual ao seu Nível de Trilha e o armazena durante o período máximo de um minuto. Até esse minuto acabar, você pode consumir esse bônus e aplicá-lo em um teste à sua escolha. Apenas um bônus pode ser armazenado por vez, e você pode consumi-lo após saber se um teste falhou ou não.',
  },
  {
    id: 'rastreamento',
    category: 'agouro',
    name: 'Rastreamento',
    description: 'Bruxarias de agouro preveem o futuro e brincam com os pilares do destino e da realidade.',
    manaCost: 5,
    action: 'longa',
    range: 'Especial',
    effects: 'Com um pertence ou parte do corpo de uma criatura em mãos, sacrificando 5 pontos de Mana e com uma ação longa, você identifica a direção de onde aquela criatura está. Este efeito perdura até o seu próximo descanso.',
  },

  // ========== BRUXARIAS DE PROTEÇÃO ==========
  {
    id: 'armadura-do-bruxo',
    category: 'protecao',
    name: 'Armadura do Bruxo',
    description: 'Bruxarias de proteção concede efeitos de preservação para criaturas, evitando ferimentos e mágoas.',
    manaCost: 6,
    action: 'longa',
    range: 'Pessoal',
    effects: 'Sacrificando 6 pontos de Mana e com uma ação longa, você cria uma armadura sobre você que lhe fornece um bônus em cálculos de resistência igual ao seu modificador de Arcana. Se você não estiver vestido com uma armadura ou capacete, o bônus é dobrado em cálculos contra ataques gerais, não localizados. A armadura dura até ser dispensada com uma ação menor, ou até seu próximo descanso.',
  },
  {
    id: 'casulo-nefasto',
    category: 'protecao',
    name: 'Casulo Nefasto',
    description: 'Bruxarias de proteção concede efeitos de preservação para criaturas, evitando ferimentos e mágoas.',
    manaCost: 'variável',
    action: 'curta',
    range: '15 metros',
    effects: 'Sacrificando pontos de Mana e com uma ação curta, você cria um casulo mágico sobre uma criatura que você pode ver dentro de 15 metros (a qual pode ser você), que absorve uma quantidade de dano físico ou mental igual a soma do seu modificador de Arcana + Nível de Trilha + pontos de Mana sacrificados. O casulo serve como um limite adicional, e é quebrado quando seu valor chega em 0. Ele não se regenera, e dura até ser quebrado ou até seu próximo descanso. Caso a criatura seja afetada pelo mesmo efeito antes de seu fim, ele é substituído.',
  },
  {
    id: 'desfazer',
    category: 'protecao',
    name: 'Desfazer',
    description: 'Bruxarias de proteção concede efeitos de preservação para criaturas, evitando ferimentos e mágoas.',
    manaCost: 'variável',
    action: 'reacao',
    range: '15 metros',
    effects: 'Quando uma criatura que você pode ver dentro de 15 metros (a qual pode ser você) recebe dano de um ataque, sacrificando pontos de Mana e com uma reação, você reverte os efeitos do ataque em questão. Qualquer dano ou efeito aplicado pelo ataque é anulado. A quantidade de Mana sacrificada na ação é igual ao dano causado pelo ataque.',
  },
  {
    id: 'escudo-vivo',
    category: 'protecao',
    name: 'Escudo Vivo',
    description: 'Bruxarias de proteção concede efeitos de preservação para criaturas, evitando ferimentos e mágoas.',
    manaCost: 4,
    action: 'curta',
    range: 'Pessoal',
    effects: 'Sacrificando 4 pontos de Mana e com uma ação curta, você anima um escudo que irá te proteger sem que você precise usar as mãos. Enquanto sob este efeito, o equipamento flutua ao seu redor, não ocupa espaços, e lhe concede seus benefícios sem que você precise usar as mãos. O efeito pode ser finalizado com uma ação menor, e dura até o seu próximo descanso. Você não pode ter mais de um efeito como esse ativo por vez.',
  },
  {
    id: 'impeto-de-reflexo',
    category: 'protecao',
    name: 'Ímpeto de Reflexo',
    description: 'Bruxarias de proteção concede efeitos de preservação para criaturas, evitando ferimentos e mágoas.',
    manaCost: 6,
    action: 'menor',
    range: '15 metros',
    effects: 'Sacrificando 6 pontos de Mana e com uma ação menor, você concede a uma criatura que você pode ver dentro de 15 metros (a qual pode ser você) um bônus igual ao seu modificador de Arcana em testes de esquiva. O efeito pode ser finalizado por você com uma ação menor, e dura até o seu próximo descanso. Você não pode ter mais de um efeito como esse ativo por vez.',
  },

  // ========== BRUXARIAS DE REPARAÇÃO ==========
  {
    id: 'conserto-inanimado',
    category: 'reparacao',
    name: 'Conserto Inanimado',
    description: 'Bruxarias de reparação curam ferimentos e laços, recuperando a sanidade e cicatrizando feridas mortais.',
    manaCost: 'variável',
    action: 'longa',
    range: 'Toque',
    effects: 'Ao tocar em um equipamento ou veículo, sacrificando pontos de Mana e com uma ação longa, você recupera 1 ponto de Durabilidade de um equipamento ou Estrutura de um veículo para cada ponto de Mana sacrificado.',
  },
  {
    id: 'lagrimas-de-cura',
    category: 'reparacao',
    name: 'Lágrimas de Cura',
    description: 'Bruxarias de reparação curam ferimentos e laços, recuperando a sanidade e cicatrizando feridas mortais.',
    manaCost: 'variável',
    action: 'curta',
    range: 'Toque',
    effects: 'Ao tocar em uma criatura que pode ser você, sacrificando pontos de Mana e com uma ação curta, você recupera 1 ponto de Corpo dessa criatura a cada 2 pontos de Mana sacrificados.',
  },
  {
    id: 'recuperacao-coletiva',
    category: 'reparacao',
    name: 'Recuperação Coletiva',
    description: 'Bruxarias de reparação curam ferimentos e laços, recuperando a sanidade e cicatrizando feridas mortais.',
    manaCost: 'variável',
    action: 'longa',
    range: '5 metros',
    effects: 'Sacrificando pontos de Mana e com uma ação longa, você distribui pontos de cura em Corpo e Mente para diversas criaturas que você pode ver a até 5 metros de você. A quantidade de criaturas afetadas é igual ao seu modificador de Arcana, e a quantidade de pontos de cura que podem ser distribuídos é igual aos pontos de Mana sacrificados.',
  },
  {
    id: 'reserva-de-cura',
    category: 'reparacao',
    name: 'Reserva de Cura',
    description: 'Bruxarias de reparação curam ferimentos e laços, recuperando a sanidade e cicatrizando feridas mortais.',
    manaCost: 'variável',
    action: 'curta',
    range: '5 metros',
    effects: 'Sacrificando pontos de Mana e com uma ação curta, você concede uma reserva de pontos de cura para uma criatura que você pode ver dentro de 5 metros (a qual pode ser você), que devem ser consumidos com uma ação curta por aquela criatura. A quantidade de pontos de cura na reserva é igual a 1 ponto a cada 2 pontos de Mana sacrificados, e uma quantidade à escolha da criatura afetada pode ser consumida com uma ação curta e aplicada sobre o Corpo ou Mente da mesma. A reserva acaba quando todos os pontos são consumidos, ou dura até o próximo descanso da criatura. Caso a criatura seja afetada pelo mesmo efeito antes de seu fim, ele é substituído.',
  },
  {
    id: 'simpatia',
    category: 'reparacao',
    name: 'Simpatia',
    description: 'Bruxarias de reparação curam ferimentos e laços, recuperando a sanidade e cicatrizando feridas mortais.',
    manaCost: 'variável',
    action: 'longa',
    range: '15 metros',
    effects: 'Sacrificando pontos de Mana e com uma ação longa, você recupera 1 ponto de Mente de uma criatura que você possa ver dentro de 15 metros (a qual pode ser você) a cada 2 pontos de Mana sacrificados.',
  },

  // ========== BRUXARIAS DE CONTROLE ==========
  {
    id: 'conceder-acao',
    category: 'controle',
    name: 'Conceder Ação',
    description: 'Bruxarias de controle são focadas em elementos além do bruxo, facilitando situações e muitas vezes deixando o trabalho duro para outros.',
    manaCost: 2,
    action: 'curta',
    range: '15 metros',
    effects: 'Sacrificando 2 pontos de Mana e com uma ação curta, você concede a opção de uma criatura que você possa ver dentro de 15 metros realizar uma ação curta.',
  },
  {
    id: 'lado-sombrio',
    category: 'controle',
    name: 'Lado Sombrio',
    description: 'Bruxarias de controle são focadas em elementos além do bruxo, facilitando situações e muitas vezes deixando o trabalho duro para outros.',
    manaCost: 10,
    action: 'longa',
    range: 'Adjacente',
    effects: 'Sacrificando 10 pontos de Mana e com uma ação longa, você cria uma sombra de si mesmo. A sombra aparece em um quadrado adjacente à você, e é semelhante à você mas claramente não é você. Ela possui a mesma ficha que você, mas não pode usar essa bruxaria e sacrifica os seus recursos e limites. Quando a sombra toma dano, você pode escolher que ela seja destruída, ou você pode escolher sofrer o dano no lugar dela. A sombra age no seu turno, não pode usar equipamentos diferentes do que você está equipado, e não pode se afastar para além de 15 metros de você. Ela ficará ao seu lado até que seja destruída ou até seu próximo descanso. Você não pode ter mais de uma sombra por vez, e mesmo que você tenha mais de um turno por rodada, a sombra agirá apenas no seu primeiro turno.',
  },
  {
    id: 'vinganca-compelida',
    category: 'controle',
    name: 'Vingança Compelida',
    description: 'Bruxarias de controle são focadas em elementos além do bruxo, facilitando situações e muitas vezes deixando o trabalho duro para outros.',
    manaCost: 8,
    action: 'reacao',
    range: '15 metros',
    effects: 'Sacrificando 8 pontos de Mana e com uma reação e ao ser atacado, você obriga uma criatura que você possa ver dentro de 15 metros com um Nível de Poder menor ou igual ao seu Nível de Trilha a atacar o alvo que te atacou.',
  },
  {
    id: 'ferimentos-imprevisiveis',
    category: 'controle',
    name: 'Ferimentos Imprevisíveis',
    description: 'Bruxarias de controle são focadas em elementos além do bruxo, facilitando situações e muitas vezes deixando o trabalho duro para outros.',
    manaCost: 4,
    action: 'menor',
    range: '15 metros',
    effects: 'Durante o ataque físico de uma criatura que você possa ver dentro de 15 metros (a qual pode ser você), sacrificando 4 pontos de Mana e com uma ação menor para seus ataques ou reação para ataque de outros, você transforma o dano do ataque em outro tipo de dano físico.',
  },
  {
    id: 'enxame-amaldicoado',
    category: 'controle',
    name: 'Enxame Amaldiçoado',
    description: 'Bruxarias de controle são focadas em elementos além do bruxo, facilitando situações e muitas vezes deixando o trabalho duro para outros.',
    manaCost: 8,
    action: 'longa',
    range: '15 metros',
    effects: 'Sacrificando 8 pontos de Mana e com uma ação longa, você cria uma área de 4 quadrados em um ponto dentro de 15 metros. Todas as criaturas que você deseja afetar dentro dessa área recebem uma penalidade igual ao seu modificador de Arcana em testes de ataque e evasão. A área de enxame dura 1 minuto, ou até você dispensá-la com uma ação menor.',
  },
]

// ========== PODERES DA CAÇADA ==========

export const cacadaPowers: CacadaPower[] = [
  {
    id: 'agilidade-da-cacada',
    name: 'Agilidade da Caçada',
    description: 'Você recebe um bônus de 1 metro no deslocamento escolhido.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Ao adquirir essa singularidade, você deve escolher um tipo de deslocamento básico. Você recebe um bônus de 1 metro no deslocamento escolhido. Essa singularidade pode ser adquirida várias vezes, mas o mesmo tipo de deslocamento não pode ser escolhido duas ou mais vezes.',
    choices: [
      { id: 'terrestre', name: 'Terrestre', description: 'Bônus de 1 metro no deslocamento terrestre' },
      { id: 'aquatico', name: 'Aquático', description: 'Bônus de 1 metro no deslocamento aquático' },
      { id: 'aereo', name: 'Aéreo', description: 'Bônus de 1 metro no deslocamento aéreo' },
    ],
  },
  {
    id: 'apendice-sobrenatural',
    name: 'Apêndice Sobrenatural',
    description: 'Você recebe um membro independente que pode ser usado para interação.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Você recebe um membro independente que pode ser usado para interação. Este membro é considerado um braço, você decide onde ele está localizado no seu tórax e sua aparência varia de acordo com a sua Trilha da Caçada.',
  },
  {
    id: 'armamento-aprimorado',
    name: 'Armamento Aprimorado',
    description: 'Você recebe um bônus de +1 em todos os testes de ataques e +2 em cálculos de dano físicos.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Você recebe um bônus de +1 em todos os testes de ataques e +2 em cálculos de dano físicos, exceto com armas de artilharia, armas de cerco, explosivos e granadas.',
  },
  {
    id: 'caca-silenciosa',
    name: 'Caça Silenciosa',
    description: 'Uma força maior oculta seus rastros, oculta sua silhueta e abafa seus passos.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Você recebe um bônus de +2 em testes da habilidade Furtividade.',
  },
  {
    id: 'dano-imparavel',
    name: 'Dano Imparável',
    description: 'Seus ataques atravessam armaduras com facilidade sobrenatural.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Todos os seus ataques recebem um bônus de +2 em Penetração, exceto com armas de artilharia, armas de cerco, explosivos e granadas.',
  },
  {
    id: 'frenesi-do-cacador',
    name: 'Frenesi do Caçador',
    description: 'Com uma ação curta e sacrificando 1 ponto de Mana, você entra em frenesi.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Com uma ação curta e sacrificando 1 ponto de Mana, você entra em frenesi. Enquanto você estiver em frenesi, você recebe um bônus de +1 em testes de ataque e +3 em cálculos de dano, exceto com armas de artilharia, armas de cerco, explosivos e granadas. No início de sua próxima rodada, você pode escolher sacrificar mais 1 ponto de Mana para se manter em frenesi.',
  },
  {
    id: 'intuicao-da-cacada',
    name: 'Intuição da Caçada',
    description: 'Você possui uma intuição sobrenatural das ameaças e detalhes ao seu redor.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Você recebe um bônus de +1 em testes de Atenção.',
  },
  {
    id: 'manipulacao-das-feras',
    name: 'Manipulação das Feras',
    description: 'Você possui a capacidade de manipular mentes simples de forma sobrenatural.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Com uma ação menor, você pode colocar uma marca sobre um entiensis dentro de 15 metros. Você recebe um bônus de +3 em testes de Lidar com Animais feitos contra ele. A marcação persiste até que o entiensis morra, você marque outro entiensis, se passe 24 horas, ou que você abruptamente remova a marca com uma ação menor.',
  },
  {
    id: 'marcado-para-a-caca',
    name: 'Marcado para a Caça',
    description: 'As criaturas sendo caçadas por você estão marcadas para morrer.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Com uma ação menor e sacrificando 1 ponto de Mana, você pode marcar uma criatura dentro de 15 metros. Você recebe um bônus de +1 em testes de acerto e +2 em cálculos de dano contra criaturas marcadas dessa forma. A marcação persiste até que a criatura morra, você marque outra criatura, se passe 24 horas, ou que você abruptamente remova a marca com uma ação menor.',
  },
  {
    id: 'protecao-da-cacada',
    name: 'Proteção da Caçada',
    description: 'Uma camada de energia sobrenatural lhe serve como proteção.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Para cada posição (cabeça, rosto, tronco, braços e pernas) onde não tiver uma armadura equipada, você recebe um bônus irredutível igual a metade (arredondada para baixo) do seu Nível de Trilha em cálculos de resistência a dano físico. O bônus de Proteção da Caçada ainda é aplicado em posições equipadas apenas com uma armadura com a propriedade Confortável.',
  },
  {
    id: 'punhos-da-cacada',
    name: 'Punhos da Caçada',
    description: 'Seu corpo é sua arma.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Você recebe um bônus de +2 no dano de seus ataques físicos com armas naturais.',
  },
  {
    id: 'roubo-de-vida',
    name: 'Roubo de Vida',
    description: 'Você rouba a essência vital de outras criaturas vivas através de seus golpes.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Ao causar dano físico no Corpo de uma criatura dentro de 15 metros, sacrificando 1 ponto de Mana, e com uma ação menor, você recebe uma quantidade de pontos de cura em Corpo e Mente igual à metade (arredondada para cima) do dano causado. O valor recuperado não pode exceder o valor máximo de Corpo do seu alvo.',
  },
  {
    id: 'sentido-do-cacador',
    name: 'Sentido do Caçador',
    description: 'Seus sentidos sobrenaturais enxergam até mesmo através da parede.',
    cost: 5,
    requirements: {
      pathId: 'cacada',
    },
    effects: 'Com uma ação longa, você pode obter um instinto com alcance de 1 metro que atravessa obstáculos por uma rodada.',
  },
]

// ========== APRIMORAMENTOS DA CAÇADA ==========

export const cacadaEnhancements: CacadaEnhancement[] = [
  {
    id: 'aliado-das-feras',
    name: 'Aliado das Feras',
    description: 'Você não é atacado por entienses, a menos que os hostilize ou ameace diretamente.',
    cost: 5,
    requirements: {
      powerId: 'manipulacao-das-feras',
      noOtherEnhancement: true,
    },
    effects: 'Você não é atacado por entienses, a menos que os hostilize ou ameace diretamente, e na maioria das vezes eles ignoram você. Um cão, por exemplo, não irá coar contra você e possivelmente alertar sua presença, mas lutará contra você caso tente machucá-lo.',
  },
  {
    id: 'atributo-melhorado',
    name: 'Atributo Melhorado',
    description: 'Escolha um atributo. Você recebe um bônus igual a metade do seu Nível de Trilha.',
    cost: 25,
    requirements: {
      powerId: 'dano-imparavel',
      noOtherEnhancement: true,
    },
    effects: 'Escolha um atributo. Você recebe um bônus igual a metade do seu Nível de Trilha (arredondado para baixo) em seu modificador.',
  },
  {
    id: 'confusao-induzida',
    name: 'Confusão Induzida',
    description: 'Caso você assim deseje, você pode declarar que as criaturas com a sua Marca da Caçada receberão uma penalidade.',
    cost: 10,
    requirements: {
      powerId: 'marcado-para-a-caca',
      noOtherEnhancement: true,
    },
    effects: 'Caso você assim deseje, você pode declarar que as criaturas com a sua Marca da Caçada receberão uma penalidade igual a metade do seu Nível de Trilha (arredondado para cima) em todos os testes com habilidades de combate e habilidades primárias.',
  },
  {
    id: 'equilibrio-letal',
    name: 'Equilíbrio Letal',
    description: 'Você recebe um bônus de +2 em Acerto Crítico.',
    cost: 10,
    requirements: {
      powerId: 'armamento-aprimorado',
      noOtherEnhancement: true,
    },
    effects: 'Você recebe um bônus de +2 em Acerto Crítico, exceto com armas de artilharia, armas de cerco, explosivos e granadas.',
  },
  {
    id: 'expurgar-e-drenar',
    name: 'Expurgar e Drenar',
    description: 'Você cura um valor de pontos de Corpo e Mente ao expurgar uma criatura da Praga morta.',
    cost: 15,
    requirements: {
      powerId: 'roubo-de-vida',
      noOtherEnhancement: true,
    },
    effects: 'Você cura um valor de pontos de Corpo e Mente ao expurgar uma criatura da Praga morta igual ao seu Nível de Trilha, e metade disso (arredondado para cima e no mínimo 1) caso seja um Cultista.',
  },
  {
    id: 'moldar-a-carne',
    name: 'Moldar a Carne',
    description: 'Com uma ação longa e sacrificando 1 ponto de Mana, você pode mudar sua aparência de forma limitada.',
    cost: 5,
    requirements: {
      powerId: 'apendice-sobrenatural',
      noOtherEnhancement: true,
    },
    effects: 'Com uma ação longa e sacrificando 1 ponto de Mana, você pode mudar sua aparência de forma limitada, mas incluindo detalhes como cabelo e porte corporal. Você não pode alterar seu sexo, raça ou raça dessa forma.',
  },
  {
    id: 'movimentacao-acelerada',
    name: 'Movimentação Acelerada',
    description: 'Os bônus recebidos em Agilidade da Caçada agora são iguais à metade do seu Nível de Trilha.',
    cost: 5,
    requirements: {
      powerId: 'agilidade-da-cacada',
      noOtherEnhancement: true,
    },
    effects: 'Os bônus recebidos em Agilidade da Caçada agora são iguais à metade do seu Nível de Trilha (arredondado para cima).',
  },
  {
    id: 'passos-invisiveis',
    name: 'Passos Invisíveis',
    description: 'Você recebe um bônus igual ao seu Nível de Trilha em testes de Furtividade.',
    cost: 10,
    requirements: {
      powerId: 'caca-silenciosa',
      noOtherEnhancement: true,
    },
    effects: 'Você recebe um bônus igual ao seu Nível de Trilha em testes de Furtividade, e seus passos não deixam pegadas se você assim desejar. Você também não deixa impressões digitais a menos que queira.',
  },
  {
    id: 'punhos-concussivos',
    name: 'Punhos Concussivos',
    description: 'Caso você acerte um ataque com uma arma natural, seu alvo deve realizar um teste de Vitalidade.',
    cost: 5,
    requirements: {
      powerId: 'punhos-da-cacada',
      noOtherEnhancement: true,
    },
    effects: 'Caso você acerte um ataque com uma arma natural, com uma ação menor e sacrificando 1 ponto de Mana, seu alvo deve realizar um teste de Vitalidade + Compostura (Determinação) com uma dificuldade igual a 4 + seu Nível de Trilha ou receber a condição confuso por uma rodada.',
  },
  {
    id: 'sempre-alerta',
    name: 'Sempre Alerta',
    description: 'Você recebe um bônus em testes de iniciativa igual a metade do seu Nível de Trilha.',
    cost: 5,
    requirements: {
      powerId: 'intuicao-da-cacada',
      noOtherEnhancement: true,
    },
    effects: 'Você recebe um bônus em testes de iniciativa igual a metade (arredondada para cima) do seu Nível de Trilha.',
  },
  {
    id: 'sentidos-aprimorados',
    name: 'Sentidos Aprimorados',
    description: 'Você recebe um bônus em testes de Atenção igual a metade do seu Nível de Trilha.',
    cost: 10,
    requirements: {
      powerId: 'sentido-do-cacador',
      noOtherEnhancement: true,
    },
    effects: 'Você recebe um bônus em testes de Atenção igual a metade (arredondada para cima) do seu Nível de Trilha.',
  },
  {
    id: 'vitalidade-independente',
    name: 'Vitalidade Independente',
    description: 'Você recebe um incremento igual ao seu Nível de Trilha em Corpo.',
    cost: 5,
    requirements: {
      powerId: 'protecao-da-cacada',
      noOtherEnhancement: true,
    },
    effects: 'Você recebe um incremento igual ao seu Nível de Trilha em Corpo.',
  },
  {
    id: 'vontade-de-ferro',
    name: 'Vontade de Ferro',
    description: 'Você recebe um bônus igual ao seu Nível de Trilha em testes de Compostura.',
    cost: 20,
    requirements: {
      powerId: 'frenesi-do-cacador',
      noOtherEnhancement: true,
    },
    effects: 'Você recebe um bônus igual ao seu Nível de Trilha em testes de Compostura.',
  },
]

// ========== HELPER FUNCTIONS ==========

export function getPathBaseSingularityById(id: string): PathBaseSingularity | undefined {
  return pathBaseSingularities.find(s => s.id === id)
}

export function getPathBaseSingularityByPathId(pathId: string): PathBaseSingularity | undefined {
  return pathBaseSingularities.find(s => s.pathId === pathId)
}

export function getBruxariasByCategory(category: Bruxaria['category']): Bruxaria[] {
  return bruxarias.filter(b => b.category === category)
}

export function getBruxariaById(id: string): Bruxaria | undefined {
  return bruxarias.find(b => b.id === id)
}

export function getCacadaPowerById(id: string): CacadaPower | undefined {
  return cacadaPowers.find(p => p.id === id)
}

export function getAllCacadaPowers(): CacadaPower[] {
  return cacadaPowers
}

export function getCacadaEnhancementById(id: string): CacadaEnhancement | undefined {
  return cacadaEnhancements.find(e => e.id === id)
}

export function getCacadaEnhancementsByPowerId(powerId: string): CacadaEnhancement[] {
  return cacadaEnhancements.filter(e => e.requirements.powerId === powerId)
}

export function getAllBruxarias(): Bruxaria[] {
  return bruxarias
}

