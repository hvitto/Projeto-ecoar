import type { MartialSchoolData } from '@/data/martialSchoolSingularities'

export const weaponMasteries: MartialSchoolData[] = [
  {
    id: 'armas-arcanas',
    name: 'Maestria das Armas Arcanas',
    class: 'Maestria',
    aptitude: 'Vontade',
    tool: 'Armas mágicas da especialidade Mágica (Arcana)',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará de algumas singularidades dessa escola.',
    suggestedAttributes: ['Inteligência', 'Vontade'],
    suggestedSkills: ['Mágica', 'Raciocínio'],
    suggestedEquipment: ['Armas mágicas', 'Qualquer armadura'],
    description:
      'A Maestria das Armas Arcanas é perita em armas mágicas arcanas, potencializando seu dano com Vontade e facilitando acertos com dano massivo.',
    singularities: [
      {
        id: 'armas-arcanas-1',
        schoolId: 'armas-arcanas',
        level: 1,
        name: 'Armas Arcanas I',
        description:
          'Armas mágicas da especialidade Mágica (Arcana) são armas arcanas. Ao atacar com uma arma arcana, você recebe um bônus igual ao seu modificador de Vontade nos seus cálculos de dano, e um bônus de +3 no Dano Máximo.',
        cost: 25,
        requirements: {
          attributes: { inteligencia: 2, vontade: 2 },
          skills: { magica: 2 },
        },
        effects: '',
      },
      {
        id: 'armas-arcanas-2',
        schoolId: 'armas-arcanas',
        level: 2,
        name: 'Armas Arcanas II',
        description: 'Ao atacar com uma arma arcana, você recebe um bônus de +6 em Dano Máximo.',
        cost: 5,
        requirements: { previous: 'armas-arcanas-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'armas-arcanas-3',
        schoolId: 'armas-arcanas',
        level: 3,
        name: 'Armas Arcanas III',
        description:
          'Ao realizar um ataque com uma arma arcana e com uma ação menor, você pode sacrificar 1 ponto de Fôlego e receber um bônus igual a metade (arredondada para cima) do seu Nível de Poder.',
        cost: 10,
        requirements: { previous: 'armas-arcanas-2', nivelAlma: 3 },
        effects: '',
      },
      {
        id: 'armas-arcanas-4',
        schoolId: 'armas-arcanas',
        level: 4,
        name: 'Armas Arcanas IV',
        description: 'Você recebe um bônus de +2 em testes das habilidades Perícias, Estudos, e Química.',
        cost: 15,
        requirements: { previous: 'armas-arcanas-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'armas-arcanas-5',
        schoolId: 'armas-arcanas',
        level: 5,
        name: 'Armas Arcanas V',
        description:
          'Ao ser alvo de um ataque físico enquanto equipado com uma arma arcana, você recebe um bônus igual ao seu modificador de Vontade em seu teste de esquiva.',
        cost: 20,
        requirements: { previous: 'armas-arcanas-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'armas-arcanas-6',
        schoolId: 'armas-arcanas',
        level: 6,
        name: 'Armas Arcanas VI',
        description:
          'Ao realizar um ataque com uma arma arcana e caso sua última ação tenha sido um ataque bem-sucedido contra o alvo deste seu ataque, você realiza o teste de ataque de forma favorável.',
        cost: 30,
        requirements: { previous: 'armas-arcanas-5', nivelAlma: 6 },
        effects: '',
      },
    ],
  },
  {
    id: 'armas-artisticas',
    name: 'Maestria das Armas Artísticas',
    class: 'Maestria',
    aptitude: 'Vontade',
    tool: 'Armas mágicas da especialidade Mágica (Vox)',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará de algumas singularidades dessa escola.',
    suggestedAttributes: ['Carisma', 'Vontade'],
    suggestedSkills: ['Mágica', 'Reflexos'],
    suggestedEquipment: ['Armas mágicas da especialidade Mágica (Vox)', 'Qualquer tipo de armadura'],
    description:
      'A Maestria das Armas Artísticas utiliza de diferentes armas artísticas para causar dano mágico e dano mental. Na mão de um artista de combate, instrumentos são armas mortais.',
    singularities: [
      {
        id: 'armas-artisticas-1',
        schoolId: 'armas-artisticas',
        level: 1,
        name: 'Armas Artísticas I',
        description:
          'Armas da especialidade Mágica (Vox) são armas artísticas. Concede Arte Horrorizante e Dano Máximo Artístico.',
        cost: 25,
        requirements: {
          attributes: { carisma: 2, vontade: 2 },
          skills: { magica: 2 },
        },
        effects:
          'Arte Horrorizante: Ao atacar uma persona ou criatura da Praga com uma arma artística, você pode optar por trocar o teste de esquiva por um teste de coragem com Inteligência + Compostura (Coragem) e o dano por dano mental. Você não considera o bônus de dano, Acerto Crítico e Dano Máximo da sua arma neste ataque mental, e só pode alvejar uma criatura. Apenas bônus de dano explicitamente mentais podem ser aplicados no cálculo de dano. Dano Máximo Artístico: O traço de Dano Máximo de instrumentos artísticos é dobrado em seus ataques.',
      },
      {
        id: 'armas-artisticas-2',
        schoolId: 'armas-artisticas',
        level: 2,
        name: 'Armas Artísticas II',
        description:
          'Ao atacar com uma arma artística, você recebe um bônus igual a metade (arredondada para cima) do seu Nível de Poder em cálculos de dano físicos e mentais.',
        cost: 5,
        requirements: { previous: 'armas-artisticas-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'armas-artisticas-3',
        schoolId: 'armas-artisticas',
        level: 3,
        name: 'Armas Artísticas III',
        description:
          'Ao atacar com uma arma artística e com uma ação menor, você pode trocar a habilidade Mágica (Vox) por uma habilidade artística e uma especialidade dessa habilidade.',
        cost: 10,
        requirements: { previous: 'armas-artisticas-2', nivelAlma: 3 },
        effects:
          'É sugerido que a habilidade artística utilizada seja a mesma indicada na propriedade Dano Artístico, se houver. A especialidade deve ser escolhida conforme a natureza da performance artística, e deve ser acordada entre jogador e Mestre Absoluto.',
      },
      {
        id: 'armas-artisticas-4',
        schoolId: 'armas-artisticas',
        level: 4,
        name: 'Armas Artísticas IV',
        description:
          'Você recebe um bônus igual a metade (arredondada para cima) do seu modificador de Vontade em testes de habilidades artísticas.',
        cost: 15,
        requirements: { previous: 'armas-artisticas-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'armas-artisticas-5',
        schoolId: 'armas-artisticas',
        level: 5,
        name: 'Armas Artísticas V',
        description:
          'Ao aplicar dano no Corpo ou Mente de uma criatura com um ataque com uma arma artística, você recebe um valor de cura em Corpo e Mente igual ao dano aplicado.',
        cost: 20,
        requirements: { previous: 'armas-artisticas-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'armas-artisticas-6',
        schoolId: 'armas-artisticas',
        level: 6,
        name: 'Armas Artísticas VI',
        description:
          'O bônus de Armas Artísticas II agora é igual ao seu Nível de Poder, e o bônus de Armas Artísticas IV agora é igual ao seu modificador de Vontade.',
        cost: 30,
        requirements: { previous: 'armas-artisticas-5', nivelAlma: 6 },
        effects: '',
      },
    ],
  },
  {
    id: 'armas-de-fe',
    name: 'Maestria das Armas de Fé',
    class: 'Maestria',
    aptitude: 'Inteligência',
    tool: 'Armas mágicas da especialidade Mágica (Natura)',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará de algumas singularidades dessa escola.',
    suggestedAttributes: ['Inteligência', 'Vontade'],
    suggestedSkills: ['Mágica', 'Raciocínio'],
    suggestedEquipment: ['Armas mágicas da especialidade Mágica (Natura)', 'Qualquer tipo de armadura'],
    description:
      'A Maestria das Armas de Fé canaliza a astúcia e vontade de seus combatentes para destruir o corpo e a mente daqueles que se opõem a eles.',
    singularities: [
      {
        id: 'armas-de-fe-1',
        schoolId: 'armas-de-fe',
        level: 1,
        name: 'Armas de Fé I',
        description:
          'Armas da especialidade Mágica (Natura) são armas de fé. Concede Punição da Fé e Castigue a Praga.',
        cost: 25,
        requirements: {
          attributes: { inteligencia: 2, vontade: 2 },
          skills: { magica: 2 },
        },
        effects:
          'Punição da Fé: Ao atacar uma persona ou criatura da Praga com uma arma de fé, você pode optar por trocar o teste de esquiva por um teste de coragem com Inteligência + Compostura (Coragem) e o dano por dano mental. Você não considera o bônus de dano, Acerto Crítico e Dano Máximo da sua arma neste ataque mental, e só pode alvejar uma criatura. Apenas bônus de dano explicitamente mentais podem ser aplicados no cálculo de dano. Castigue a Praga: Ataques com armas de fé contra criaturas da praga e mortos-vivos recebem um bônus de +2 no cálculo de dano físico ou mental.',
      },
      {
        id: 'armas-de-fe-2',
        schoolId: 'armas-de-fe',
        level: 2,
        name: 'Armas de Fé II',
        description:
          'Ao atacar com uma arma de fé, você recebe um bônus igual a metade (arredondada para cima) do seu modificador de Inteligência em seu teste de ataque.',
        cost: 5,
        requirements: { previous: 'armas-de-fe-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'armas-de-fe-3',
        schoolId: 'armas-de-fe',
        level: 3,
        name: 'Armas de Fé III',
        description:
          'Ao atacar uma persona com uma arma de fé, sacrificando 2 pontos de Fôlego e com uma ação menor, você pode transformar o dano do seu ataque em um Dano Conjunto, causando também dano mental na mesma proporção que o dano físico.',
        cost: 10,
        requirements: { previous: 'armas-de-fe-2', nivelAlma: 3 },
        effects: '',
      },
      {
        id: 'armas-de-fe-4',
        schoolId: 'armas-de-fe',
        level: 4,
        name: 'Armas de Fé IV',
        description:
          'Você recebe um bônus igual a metade (arredondada para cima) do seu modificador de Inteligência em testes de habilidades sociais.',
        cost: 15,
        requirements: { previous: 'armas-de-fe-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'armas-de-fe-5',
        schoolId: 'armas-de-fe',
        level: 5,
        name: 'Armas de Fé V',
        description:
          'Ao ser alvo de um ataque corpo-a-corpo por uma criatura da praga, morto-vivo ou persona enquanto equipado com uma arma de fé, você realiza o teste de esquiva de forma favorável.',
        cost: 20,
        requirements: { previous: 'armas-de-fe-4', nivelAlma: 5 },
        effects:
          'Além disso, você não precisa que o seu modificador de Natura seja igual ao valor da propriedade para se beneficiar dos bônus concedidos pela propriedade de arma Proteção Sagrada.',
      },
      {
        id: 'armas-de-fe-6',
        schoolId: 'armas-de-fe',
        level: 6,
        name: 'Armas de Fé VI',
        description:
          'Ao atacar com uma arma de fé, você recebe um bônus igual ao seu Nível de Poder no seu teste de ataque.',
        cost: 30,
        requirements: { previous: 'armas-de-fe-5', nivelAlma: 6 },
        effects: '',
      },
    ],
  },
  {
    id: 'armas-de-haste',
    name: 'Maestria das Armas de Haste',
    class: 'Maestria',
    aptitude: 'Percepção',
    tool: 'Armas da especialidade Corpo-a-corpo (Haste)',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará de algumas singularidades dessa escola.',
    suggestedAttributes: ['Força', 'Percepção'],
    suggestedSkills: ['Corpo-a-corpo', 'Reflexos'],
    suggestedEquipment: ['Armas de haste', 'Qualquer tipo de armadura'],
    description:
      'A Maestria das Armas de Haste mantém seus inimigos numa distância que lhe é confortável, punindo qualquer tipo de avanço ou tentativa de recuar.',
    singularities: [
      {
        id: 'armas-de-haste-1',
        schoolId: 'armas-de-haste',
        level: 1,
        name: 'Armas de Haste I',
        description:
          'Armas da especialidade Corpo-a-corpo (Haste) são armas de haste, e você recebe um bônus igual ao seu Nível de Poder em cálculos de dano em ataques com essas armas.',
        cost: 25,
        requirements: {
          attributes: { forca: 2, percepcao: 2 },
          skills: { 'corpo-a-corpo': 2 },
        },
        effects: '',
      },
      {
        id: 'armas-de-haste-2',
        schoolId: 'armas-de-haste',
        level: 2,
        name: 'Armas de Haste II',
        description:
          'Durante o teste de Força + Corpo-a-corpo (Haste) para impedir a movimentação do seu alvo em um ataque de oportunidade, você soma o total do dano aplicado no Corpo do mesmo.',
        cost: 5,
        requirements: { previous: 'armas-de-haste-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'armas-de-haste-3',
        schoolId: 'armas-de-haste',
        level: 3,
        name: 'Armas de Haste III',
        description:
          'Quando uma criatura se movimenta dentro do alcance efetivo de uma de suas armas de haste e com uma reação, você pode realizar um ataque de oportunidade.',
        cost: 10,
        requirements: { previous: 'armas-de-haste-2', nivelAlma: 3 },
        effects:
          'Em um sucesso, você impede que a criatura se desloque e ela perde todo o seu valor restante de deslocamento, apenas podendo se movimentar mais se gastar uma ação para obter mais deslocamento.',
      },
      {
        id: 'armas-de-haste-4',
        schoolId: 'armas-de-haste',
        level: 4,
        name: 'Armas de Haste IV',
        description: 'Você recebe um bônus de +4 em testes de Atenção (Arredores).',
        cost: 15,
        requirements: { previous: 'armas-de-haste-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'armas-de-haste-5',
        schoolId: 'armas-de-haste',
        level: 5,
        name: 'Armas de Haste V',
        description:
          'Ao ser atacado contra um alvo dentro do alcance efetivo de sua arma de haste, você recebe um bônus no teste de esquiva igual ao seu modificador de Percepção.',
        cost: 20,
        requirements: { previous: 'armas-de-haste-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'armas-de-haste-6',
        schoolId: 'armas-de-haste',
        level: 6,
        name: 'Armas de Haste VI',
        description:
          'Ao realizar um ataque de oportunidade com uma arma de haste, você recebe um bônus igual ao seu modificador de Percepção no teste de ataque e +6 em Dano Máximo.',
        cost: 30,
        requirements: { previous: 'armas-de-haste-5', nivelAlma: 6 },
        effects: '',
      },
    ],
  },
  {
    id: 'armas-municiadas',
    name: 'Maestria das Armas Municiadas',
    class: 'Maestria',
    aptitude: 'Percepção',
    tool: 'Armas municiadas',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará das singularidades dessa escola.',
    suggestedAttributes: ['Finesse', 'Percepção'],
    suggestedSkills: ['Pontaria', 'Raciocínio'],
    suggestedEquipment: ['Armas à distância da habilidade Pontaria', 'Armaduras leves, médias ou pesadas'],
    description:
      'A Maestria das Armas Municiadas se especializa em armas de fogo, bestas e semelhantes, aprimorando a velocidade e letalidade dessas armas. Suas técnicas possuem um grande potencial de dano, mas pouca capacidade de defesa.',
    singularities: [
      {
        id: 'armas-municiadas-1',
        schoolId: 'armas-municiadas',
        level: 1,
        name: 'Armas Municiadas I',
        description: 'Concede Precisão de Gatilho e Manual de Armas.',
        cost: 25,
        requirements: {
          attributes: { finesse: 2, percepcao: 2 },
          skills: { pontaria: 2 },
        },
        effects:
          'Precisão de Gatilho: Ao atacar com uma arma municiada, você recebe um bônus em testes de ataque igual ao seu modificador de Percepção. Manual de Armas: Enquanto utilizando uma arma municiada, você considera todas as ações de recarga de ação longa como ação curta, e todas as ações curtas como ação menor.',
      },
      {
        id: 'armas-municiadas-2',
        schoolId: 'armas-municiadas',
        level: 2,
        name: 'Armas Municiadas II',
        description:
          'Ao acertar um ataque com uma arma municiada, seu próximo ataque também com uma arma da habilidade Pontaria contra o mesmo alvo até o final do seu próximo turno receberá um bônus de +3 no cálculo de dano.',
        cost: 5,
        requirements: { previous: 'armas-municiadas-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'armas-municiadas-3',
        schoolId: 'armas-municiadas',
        level: 3,
        name: 'Armas Municiadas III',
        description:
          'Ao realizar um ataque com uma arma municiada e com uma ação menor, você recebe um bônus de +3 em Acerto Crítico neste ataque.',
        cost: 10,
        requirements: { previous: 'armas-municiadas-2', nivelAlma: 3 },
        effects: '',
      },
      {
        id: 'armas-municiadas-4',
        schoolId: 'armas-municiadas',
        level: 4,
        name: 'Armas Municiadas IV',
        description:
          'Seus testes de Atenção recebem um bônus igual a metade (arredondada para cima) do seu Nível de Poder.',
        cost: 15,
        requirements: { previous: 'armas-municiadas-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'armas-municiadas-5',
        schoolId: 'armas-municiadas',
        level: 5,
        name: 'Armas Municiadas V',
        description: 'O seu primeiro teste de esquiva após o início do combate é feito de forma favorável.',
        cost: 20,
        requirements: { previous: 'armas-municiadas-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'armas-municiadas-6',
        schoolId: 'armas-municiadas',
        level: 6,
        name: 'Armas Municiadas VI',
        description:
          'O bônus de dano de Armas Municiadas II é aumentado para +4, e o seu alvo recebe a condição Hemorragia Letal quando o mesmo é aplicado.',
        cost: 30,
        requirements: { previous: 'armas-municiadas-5', nivelAlma: 6 },
        effects: '',
      },
    ],
  },
  {
    id: 'arcos',
    name: 'Maestria dos Arcos',
    class: 'Maestria',
    aptitude: 'Força',
    tool: 'Armas de arqueria',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará de algumas singularidades dessa escola.',
    suggestedAttributes: ['Finesse', 'Força'],
    suggestedSkills: ['Pontaria', 'Raciocínio'],
    suggestedEquipment: ['Armas de arqueria', 'Qualquer armadura'],
    description:
      'A Maestria dos Arcos tem seu foco em armas de arqueria, aumentando ainda mais o poder e a precisão de arcos de acordo com a força do usuário.',
    singularities: [
      {
        id: 'arcos-1',
        schoolId: 'arcos',
        level: 1,
        name: 'Arcos I',
        description: 'Ao atacar com um arco, você recebe um bônus no teste de ataque igual ao seu modificador de Força.',
        cost: 25,
        requirements: {
          attributes: { finesse: 2, forca: 2 },
          skills: { pontaria: 2 },
        },
        effects: '',
      },
      {
        id: 'arcos-2',
        schoolId: 'arcos',
        level: 2,
        name: 'Arcos II',
        description: 'Ao atacar com um arco, você recebe um bônus de +6 em Dano Máximo.',
        cost: 5,
        requirements: { previous: 'arcos-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'arcos-3',
        schoolId: 'arcos',
        level: 3,
        name: 'Arcos III',
        description:
          'Ao atacar com um arco, sacrificando 1 ponto de Fôlego e com uma ação menor, você pode aumentar o Acerto Crítico em 4.',
        cost: 10,
        requirements: { previous: 'arcos-2', nivelAlma: 3 },
        effects: '',
      },
      {
        id: 'arcos-4',
        schoolId: 'arcos',
        level: 4,
        name: 'Arcos IV',
        description: 'Você pode recuperar metade (arredondada para cima) das flechas disparadas nas redondezas do seu alvo.',
        cost: 15,
        requirements: { previous: 'arcos-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'arcos-5',
        schoolId: 'arcos',
        level: 5,
        name: 'Arcos V',
        description:
          'Ao realizar um teste de esquiva contra um ataque corpo-a-corpo enquanto você está equipado com um arco e com uma reação, você pode tornar o seu teste de esquiva favorável.',
        cost: 20,
        requirements: { previous: 'arcos-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'arcos-6',
        schoolId: 'arcos',
        level: 6,
        name: 'Arcos VI',
        description:
          'Ao atacar com um arco e com uma ação menor, você pode escolher receber um bônus igual ao seu Nível de Poder no seu cálculo de dano ou em Acerto Crítico.',
        cost: 30,
        requirements: { previous: 'arcos-5', nivelAlma: 6 },
        effects: '',
      },
    ],
  },
  {
    id: 'arremesso',
    name: 'Maestria do Arremesso',
    class: 'Maestria',
    aptitude: 'Percepção',
    tool: 'Armas de arremesso',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará de algumas singularidades dessa escola.',
    suggestedAttributes: ['Finesse', 'Percepção'],
    suggestedSkills: ['Pontaria', 'Reflexos'],
    suggestedEquipment: ['Armas de arremesso', 'Qualquer armadura'],
    description:
      'A Maestria do Arremesso viabiliza melhor o combate com armas de arremesso, melhorando a precisão e dano dos ataques.',
    singularities: [
      {
        id: 'arremesso-1',
        schoolId: 'arremesso',
        level: 1,
        name: 'Arremesso I',
        description: 'Concede Arremesso Rápido e Ameaça Múltipla.',
        cost: 25,
        requirements: {
          attributes: { finesse: 2, forca: 2 },
          skills: { pontaria: 2 },
        },
        effects:
          'Arremesso Rápido: Você pode sacar armas de arremesso com uma ação menor. Ameaça Múltipla: Uma vez por turno e ao realizar um ataque com uma ação que não seja menor, você pode realizar um ataque com uma arma de arremesso com uma ação menor.',
      },
      {
        id: 'arremesso-2',
        schoolId: 'arremesso',
        level: 2,
        name: 'Arremesso II',
        description:
          'Ao atacar com uma arma de arremesso, você recebe um bônus igual a metade (arredondada para cima) do seu modificador de Percepção em Acerto Crítico.',
        cost: 5,
        requirements: { previous: 'arremesso-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'arremesso-3',
        schoolId: 'arremesso',
        level: 3,
        name: 'Arremesso III',
        description:
          'Ao atacar com uma arma de arremesso, sacrificando 1 ponto de Fôlego e com uma ação menor, você recebe um bônus de +4 no cálculo de dano.',
        cost: 10,
        requirements: { previous: 'arremesso-2', nivelAlma: 3 },
        effects: '',
      },
      {
        id: 'arremesso-4',
        schoolId: 'arremesso',
        level: 4,
        name: 'Arremesso IV',
        description:
          'Ao acertar um ataque com uma arma de arremesso em uma criatura e causar dano perfurante ou cortante, aquele equipamento poderá ser recuperado com uma ação menor caso você possa tocar a criatura.',
        cost: 15,
        requirements: { previous: 'arremesso-3', nivelAlma: 4 },
        effects:
          'Este efeito apenas se aplica para armas com a propriedade Recuperável, e remove os equipamentos listados da conta de quantos você pode recuperar.',
      },
      {
        id: 'arremesso-5',
        schoolId: 'arremesso',
        level: 5,
        name: 'Arremesso V',
        description:
          'Ao realizar um teste de esquiva contra um ataque corpo-a-corpo enquanto você está com uma arma de arremesso em mãos e com uma reação, você pode realizar um ataque de oportunidade com uma arma de arremesso.',
        cost: 20,
        requirements: { previous: 'arremesso-4', nivelAlma: 5 },
        effects:
          'O efeito do seu ataque será aplicado antes do efeito do ataque do seu atacante, potencialmente interrompendo-o.',
      },
      {
        id: 'arremesso-6',
        schoolId: 'arremesso',
        level: 6,
        name: 'Arremesso VI',
        description:
          'Ao atacar com uma arma de arremesso e com uma ação menor, você pode escolher receber um bônus igual ao seu Nível de Poder no seu cálculo de dano ou em Acerto Crítico.',
        cost: 30,
        requirements: { previous: 'arremesso-5', nivelAlma: 6 },
        effects: '',
      },
    ],
  },
  {
    id: 'contusao',
    name: 'Maestria da Contusão',
    class: 'Maestria',
    aptitude: 'Vitalidade',
    tool: 'Armas da especialidade Corpo-a-corpo (Contusão)',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará de algumas singularidades dessa escola.',
    suggestedAttributes: ['Força', 'Vitalidade'],
    suggestedSkills: ['Corpo-a-corpo', 'Atletismo'],
    suggestedEquipment: ['Armas de contusão', 'Armaduras leves, médias ou pesadas'],
    description: 'A Maestria da Contusão utiliza armas de contusão para esmagar seus oponentes e derrubá-los no chão.',
    singularities: [
      {
        id: 'contusao-1',
        schoolId: 'contusao',
        level: 1,
        name: 'Contusão I',
        description:
          'Armas da especialidade Corpo-a-corpo (Contusão) que não sejam da categoria machados são armas de contusão, e você recebe um bônus igual a metade (arredondada para baixo) do seu Nível de Poder em testes de ataque com essas armas.',
        cost: 25,
        requirements: {
          attributes: { forca: 2, vitalidade: 2 },
          skills: { atletismo: 2 },
        },
        effects:
          'Ao atacar com uma arma de contusão, você pode transformar um dano contundente em dano esmagador. Caso o dano sendo aplicado já seja esmagador ou caso você não opte por alterar o tipo de dano, você recebe um bônus igual ao seu Nível de Poder nos cálculos de dano.',
      },
      {
        id: 'contusao-2',
        schoolId: 'contusao',
        level: 2,
        name: 'Contusão II',
        description:
          'Enquanto empunhando uma arma de contusão, seus alvos recebem uma penalidade de -3 em testes para evadir suas ações de derrubar, empurrar e quebrar guarda.',
        cost: 5,
        requirements: { previous: 'contusao-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'contusao-3',
        schoolId: 'contusao',
        level: 3,
        name: 'Contusão III',
        description:
          'Ao acertar um ataque com uma arma de contusão, após a aplicação do dano e com uma ação menor, você pode utilizar a ação de derrubar, empurrar, ou quebrar guarda. O resultado do seu teste nessa ação será substituído pelo resultado do ataque que você fez.',
        cost: 10,
        requirements: { previous: 'contusao-2', nivelAlma: 3 },
        effects: '',
      },
      {
        id: 'contusao-4',
        schoolId: 'contusao',
        level: 4,
        name: 'Contusão IV',
        description: 'Você recebe um bônus igual ao seu modificador de Vitalidade em testes de Atletismo (Peso).',
        cost: 15,
        requirements: { previous: 'contusao-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'contusao-5',
        schoolId: 'contusao',
        level: 5,
        name: 'Contusão V',
        description:
          'Ao acertar um ataque com uma arma de contusão em uma criatura e caso a mesma realize ataques contra você dentro de uma rodada, você recebe um bônus igual ao seu modificador de Vitalidade no teste de esquiva.',
        cost: 20,
        requirements: { previous: 'contusao-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'contusao-6',
        schoolId: 'contusao',
        level: 6,
        name: 'Contusão VI',
        description:
          'O bônus em testes de ataque com armas de contusão de Contusão I agora é igual ao seu valor inteiro de Nível de Poder, e você incrementa o Dano Máximo de armas de contusão em +4.',
        cost: 30,
        requirements: { previous: 'contusao-5', nivelAlma: 6 },
        effects: '',
      },
    ],
  },
  {
    id: 'duas-armas',
    name: 'Maestria das Duas Armas',
    class: 'Maestria',
    aptitude: 'Inteligência',
    tool: 'Pelo menos duas armas em mãos',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará das singularidades dessa escola.',
    suggestedAttributes: ['Inteligência', 'Finesse ou Força'],
    suggestedSkills: ['Habilidades de combate', 'Reflexos'],
    suggestedEquipment: ['Armas de uma mão', 'Armaduras leves, médias ou pesadas'],
    description:
      'A Maestria das Duas Armas é sobre combater com duas ou mais armas ao mesmo tempo. Essas técnicas podem ser usufruídas com qualquer tipo de arma que possa ser usada com apenas uma mão, e permitem ataques poderosos e sincronizados.',
    singularities: [
      {
        id: 'duas-armas-1',
        schoolId: 'duas-armas',
        level: 1,
        name: 'Duas Armas I',
        description:
          'Uma vez por turno, você pode usar uma ação menor para anular as penalidades da ação de atacar com mais de uma arma caso você esteja usando apenas duas armas.',
        cost: 25,
        requirements: {
          attributes: { finesse: 2, percepcao: 2 },
          skills: { reflexos: 2 },
        },
        effects:
          'As penalidades apenas se aplicam da terceira arma em diante caso você esteja usando três ou mais armas.',
      },
      {
        id: 'duas-armas-2',
        schoolId: 'duas-armas',
        level: 2,
        name: 'Duas Armas II',
        description:
          'Ao atacar com duas ou mais armas, você recebe um bônus igual a metade (arredondada para cima) do seu modificador de Inteligência nos testes de ataque e em cálculos de dano físico.',
        cost: 5,
        requirements: { previous: 'duas-armas-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'duas-armas-3',
        schoolId: 'duas-armas',
        level: 3,
        name: 'Duas Armas III',
        description:
          'Ao realizar um ataque corpo-a-corpo ou à distância, caso você possua em mãos duas ou mais armas de habilidades de combate diferentes e com uma ação menor, você pode usar essas duas ou mais armas ao mesmo tempo neste ataque.',
        cost: 10,
        requirements: { previous: 'duas-armas-2', nivelAlma: 3 },
        effects:
          'Embora todos os ataques sejam parte da mesma ação, cada arma deve ter seu próprio teste de ataque e evasão. Além disso, se um ataque é feito com uma ação longa quando outro é feito com uma ação curta por padrão, você pode realizar dois ataques com a arma que utiliza ação curta.',
      },
      {
        id: 'duas-armas-4',
        schoolId: 'duas-armas',
        level: 4,
        name: 'Duas Armas IV',
        description:
          'Ao utilizar efeitos que guardam ou sacam armas, fisicamente ou até mesmo se envolver um subplano, você pode afetar duas armas que esteja segurando na mesma ação mesmo que você só pudesse guardar uma.',
        cost: 15,
        requirements: { previous: 'duas-armas-3', nivelAlma: 4 },
        effects:
          'Você ainda não poderá utilizar o efeito sob a segunda arma caso seu tipo de arma seja proibido nessa ação.',
      },
      {
        id: 'duas-armas-5',
        schoolId: 'duas-armas',
        level: 5,
        name: 'Duas Armas V',
        description:
          'Ao utilizar a ação aparar enquanto com pelo menos duas armas em mãos, você recebe um bônus igual ao seu Nível de Poder no seu teste de esquiva.',
        cost: 20,
        requirements: { previous: 'duas-armas-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'duas-armas-6',
        schoolId: 'duas-armas',
        level: 6,
        name: 'Duas Armas VI',
        description: 'O bônus de dano de Duas Armas II é agora igual ao seu modificador de Inteligência.',
        cost: 30,
        requirements: { previous: 'duas-armas-5', nivelAlma: 6 },
        effects:
          'Além disso, você aumenta o Dano Máximo de suas armas ao atacar com duas ou mais armas em um igual a metade (arredondada para cima) do seu modificador de Inteligência.',
      },
    ],
  },
  {
    id: 'laminas',
    name: 'Maestria das Lâminas',
    class: 'Maestria',
    aptitude: 'Percepção',
    tool: 'Armas da especialidade Corpo-a-corpo (Lâminas)',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará de algumas singularidades dessa escola.',
    suggestedAttributes: ['Força', 'Percepção'],
    suggestedSkills: ['Corpo-a-corpo', 'Reflexos'],
    suggestedEquipment: ['Lâminas', 'Qualquer tipo de armadura'],
    description:
      'A Maestria das Lâminas é o ápice do combate com lâminas, potencializando seus cortes e técnicas para causar o máximo de dano.',
    singularities: [
      {
        id: 'laminas-1',
        schoolId: 'laminas',
        level: 1,
        name: 'Lâminas I',
        description:
          'Lâminas curtas, lâminas longas e lâminas de esgrima são todas consideradas lâminas. Você recebe um bônus igual ao seu Nível de Poder em cálculos de dano em ataques com essas armas e um bônus de +6 no Dano Máximo desses ataques.',
        cost: 25,
        requirements: {
          attributes: { forca: 2, percepcao: 2 },
          skills: { 'corpo-a-corpo': 2 },
        },
        effects: '',
      },
      {
        id: 'laminas-2',
        schoolId: 'laminas',
        level: 2,
        name: 'Lâminas II',
        description: 'Ao atacar com uma lâmina, você recebe um bônus de +2 em Acerto Crítico.',
        cost: 5,
        requirements: { previous: 'laminas-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'laminas-3',
        schoolId: 'laminas',
        level: 3,
        name: 'Lâminas III',
        description:
          'Ao atacar com uma lâmina e com uma ação menor, você recebe um bônus igual a metade (arredondada para cima) do seu modificador de Percepção no teste de ataque.',
        cost: 10,
        requirements: { previous: 'laminas-2', nivelAlma: 3 },
        effects: '',
      },
      {
        id: 'laminas-4',
        schoolId: 'laminas',
        level: 4,
        name: 'Lâminas IV',
        description:
          'Após acertar um ataque com uma lâmina e aplicar seus efeitos, você pode imediatamente se locomover até 2 metros de um dos seus deslocamentos sem causar ataque de oportunidade.',
        cost: 15,
        requirements: { previous: 'laminas-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'laminas-5',
        schoolId: 'laminas',
        level: 5,
        name: 'Lâminas V',
        description:
          'Após acertar um ataque com uma lâmina e aplicar seus efeitos, sacrificando 1 ponto de Fôlego e com uma ação menor, você pode garantir que o seu próximo teste de esquiva contra ataques corpo-a-corpo dentro de uma rodada seja favorável.',
        cost: 20,
        requirements: { previous: 'laminas-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'laminas-6',
        schoolId: 'laminas',
        level: 6,
        name: 'Lâminas VI',
        description:
          'O bônus de Lâminas II agora é igual ao seu modificador de Percepção. Além disso, ao atacar com lâminas você aumenta o Dano Máximo em 12.',
        cost: 30,
        requirements: { previous: 'laminas-5', nivelAlma: 6 },
        effects: '',
      },
    ],
  },
  {
    id: 'machados',
    name: 'Maestria dos Machados',
    class: 'Maestria',
    aptitude: 'Força',
    tool: 'Machados',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará das singularidades dessa escola.',
    suggestedAttributes: ['Força', 'Vitalidade'],
    suggestedSkills: ['Corpo-a-corpo', 'Reflexos'],
    suggestedEquipment: ['Machados', 'Armaduras leves, médias ou pesadas'],
    description: 'A Maestria dos Machados usa machados para estraçalhar seus inimigos. Pouco papo, muita violência.',
    singularities: [
      {
        id: 'machados-1',
        schoolId: 'machados',
        level: 1,
        name: 'Machados I',
        description:
          'Ao atacar e causar dano no Corpo de uma criatura com um machado, o requisito para causar um dano monstruoso é reduzido por um valor igual ao dobro do seu Nível de Poder.',
        cost: 25,
        requirements: {
          attributes: { forca: 2, vitalidade: 2 },
          skills: { 'corpo-a-corpo': 2 },
        },
        effects: '',
      },
      {
        id: 'machados-2',
        schoolId: 'machados',
        level: 2,
        name: 'Machados II',
        description: 'Ao acertar um ataque com um machado, você recebe 2 pontos de Penetração.',
        cost: 5,
        requirements: { previous: 'machados-1', nivelAlma: 2 },
        effects: 'Cada ponto de Penetração reduz o cálculo de resistência do alvo do seu ataque em 1.',
      },
      {
        id: 'machados-3',
        schoolId: 'machados',
        level: 3,
        name: 'Machados III',
        description:
          'Ao acertar um ataque com um machado e sacrificando 1 ponto de Fôlego, você pode escolher dois alvos adicionais para o seu ataque. Estes alvos devem estar adjacentes ao seu alvo principal.',
        cost: 10,
        requirements: { previous: 'machados-2', nivelAlma: 3 },
        effects: '',
      },
      {
        id: 'machados-4',
        schoolId: 'machados',
        level: 4,
        name: 'Machados IV',
        description:
          'Você reduz em 4 qualquer penalidade em testes de esquiva recebidas através de seus equipamentos ou singularidades hostis, mas não por condições aplicadas em você.',
        cost: 15,
        requirements: { previous: 'machados-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'machados-5',
        schoolId: 'machados',
        level: 5,
        name: 'Machados V',
        description: 'Você recebe um incremento de 8 pontos no seu valor máximo de Corpo.',
        cost: 20,
        requirements: { previous: 'machados-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'machados-6',
        schoolId: 'machados',
        level: 6,
        name: 'Machados VI',
        description: 'Concede Aprimoramento de Machados II e Estraçalhar.',
        cost: 30,
        requirements: { previous: 'machados-5', nivelAlma: 6 },
        effects:
          'Aprimoramento de Machados II: O seu bônus de Machados II agora é igual a +4. Estraçalhar: Ao acertar um ataque com um machado, você recebe um bônus de +12 em Dano Máximo.',
      },
    ],
  },
  {
    id: 'punhos',
    name: 'Maestria dos Punhos',
    class: 'Maestria',
    aptitude: 'Percepção',
    tool: 'Armas naturais e armas da categoria soqueiras',
    toolNote:
      'Você deve estar empunhando um dos equipamentos listados ou não se beneficiará de algumas singularidades dessa escola.',
    suggestedAttributes: ['Força', 'Percepção'],
    suggestedSkills: ['Corpo-a-corpo', 'Reflexos'],
    suggestedEquipment: ['Soqueiras', 'Qualquer tipo de armadura'],
    description:
      'A Maestria dos Punhos potencializa o dano causado por armas naturais e soqueiras, transformando o combate com os punhos em um furacão de ataques.',
    singularities: [
      {
        id: 'punhos-1',
        schoolId: 'punhos',
        level: 1,
        name: 'Punhos I',
        description:
          'Armas naturais e armas da categoria soqueiras são armas de pugilista. Seu ataque padrão feitos com armas de pugilista consomem uma ação curta ao invés de uma ação longa, substituindo o ataque rápido.',
        cost: 25,
        requirements: {
          attributes: { forca: 2, percepcao: 2 },
          skills: { 'corpo-a-corpo': 2 },
        },
        effects: '',
      },
      {
        id: 'punhos-2',
        schoolId: 'punhos',
        level: 2,
        name: 'Punhos II',
        description:
          'Ao atacar com armas de pugilista, você recebe um bônus em testes de ataque igual a metade (arredondada para cima) do seu modificador de Percepção.',
        cost: 5,
        requirements: { previous: 'punhos-1', nivelAlma: 2 },
        effects: '',
      },
      {
        id: 'punhos-3',
        schoolId: 'punhos',
        level: 3,
        name: 'Punhos III',
        description:
          'Ao acertar um ataque com uma arma de pugilista, você pode utilizar uma ação menor para fazer uma dessas ações: agarrar, derrubar e empurrar.',
        cost: 10,
        requirements: { previous: 'punhos-2', nivelAlma: 3 },
        effects: '',
      },
      {
        id: 'punhos-4',
        schoolId: 'punhos',
        level: 4,
        name: 'Punhos IV',
        description:
          'Você recebe um bônus igual a metade (arredondada para cima) do seu Nível de Poder em testes de Atenção e Raciocínio (Iniciativa).',
        cost: 15,
        requirements: { previous: 'punhos-3', nivelAlma: 4 },
        effects: '',
      },
      {
        id: 'punhos-5',
        schoolId: 'punhos',
        level: 5,
        name: 'Punhos V',
        description:
          'Caso você esteja sem nada nas mãos ou apenas empunhando armas de pugilista, você pode usar uma reação para tornar um teste de esquiva contra um ataque corpo-a-corpo favorável. Se você tiver sucesso no teste de esquiva, e caso o atacante tenha utilizado um equipamento no ataque, você pode imediatamente tentar desarmá-lo.',
        cost: 20,
        requirements: { previous: 'punhos-4', nivelAlma: 5 },
        effects: '',
      },
      {
        id: 'punhos-6',
        schoolId: 'punhos',
        level: 6,
        name: 'Punhos VI',
        description: 'O bônus de Punhos II agora é igual ao seu Nível de Poder.',
        cost: 30,
        requirements: { previous: 'punhos-5', nivelAlma: 6 },
        effects:
          'Além disso, ao atacar com uma arma pugilista, você recebe um bônus no seu cálculo de dano igual ao seu modificador de Percepção.',
      },
    ],
  },
]
