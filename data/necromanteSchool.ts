import type { MartialSchoolData } from '@/data/martialSchoolSingularities'

const c: Record<number, number> = {
  1: 25,
  2: 5,
  3: 10,
  4: 15,
  5: 20,
  6: 30,
  7: 55,
  8: 35,
  9: 40,
  10: 45,
  11: 50,
  12: 60,
}

export const necromanteSchool: MartialSchoolData = {
  id: 'necromante',
  name: 'Escola do Necromante',
  class: 'Disruptor',
  aptitude: 'Arcana',
  tool: 'Canalizador Arcano',
  toolNote:
    'Você deve ter em mãos ou com você um canalizador arcano ou não se beneficiará das singularidades dessa escola.',
  suggestedAttributes: ['Inteligência', 'Vontade'],
  suggestedSkills: ['Mágica', 'Compostura'],
  suggestedEquipment: ['Nenhum equipamento específico'],
  description:
    'Os necromantes utilizam mortos-vivos para lutar por eles, podendo usá-los como combatentes ou servos.',
  singularities: [
    {
      id: 'necromante-1',
      schoolId: 'necromante',
      level: 1,
      name: 'Necromante I',
      description: 'Você pode criar e comandar mortos-vivos.',
      cost: c[1],
      requirements: {
        aptitudes: { arcana: 2 },
        attributes: { inteligencia: 2 },
        skills: { compostura: 2 },
      },
      effects:
        'Ao tocar um cadáver, com uma ação curta e alocando Mana igual ao dobro do seu Nível de Poder, você traz de volta uma criatura com tronco e cabeça inteiros. Entiensis (Nível de Alma ≤ 1/4 do seu, arredondado para baixo) mantém a ficha e recebe Morto-Vivo; persona vira Morto-Vivo Inferior. Com ação curta você dispensa lacaios. Cadáver sob magia não decompõe; ao dispensar, pausa por uma sesmane. Limite: metade (↑) do Nível de Poder de mortos-vivos desta singularidade; cada um aloca Mana que não regenera até ser dispensado. Inferior: metade (↑) dos seus níveis em traços, exceto 1 habilidade por categoria, 1 atributo e 1 aptidão iguais ao seu Nível de Poder (retreinável no descanso). Morto-Vivo Necromântico: Corpo = 3×NdP + 3×mod Vitalidade; imune a dano mental e a várias condições; imunidade a tóxico; fraqueza a ardente.',
    },
    {
      id: 'necromante-2',
      schoolId: 'necromante',
      level: 2,
      name: 'Necromante II',
      description:
        'Quando você é alvo de um ataque físico, um morto-vivo próximo pode intervir.',
      cost: c[2],
      requirements: { previous: 'necromante-1' },
      effects:
        'Caso um dos seus mortos-vivos esteja a até 1 metro de você ou do atacante, com uma reação e sacrificando 1 Mana, o morto-vivo intervém e concede penalidade ao ataque igual ao seu modificador de Arcana.',
    },
    {
      id: 'necromante-3',
      schoolId: 'necromante',
      level: 3,
      name: 'Necromante III',
      description: 'Cura necromântica via teste de Compostura (Determinação).',
      cost: c[3],
      requirements: { previous: 'necromante-2' },
      effects:
        'Com uma ação curta e sacrificando 1 Mana, você se cura. Pontos de Corpo = resultado de um teste especial de Compostura (Determinação) sem modificador. Pode usar consistência e considerar metade do resultado máximo sem rolar.',
    },
    {
      id: 'necromante-4',
      schoolId: 'necromante',
      level: 4,
      name: 'Necromante IV',
      description: 'Necromante III pode curar um morto-vivo a até 150 m.',
      cost: c[4],
      requirements: { previous: 'necromante-3' },
      effects:
        'Você pode utilizar Necromante III para curar um dos seus mortos-vivos dentro de 150 metros.',
    },
    {
      id: 'necromante-5',
      schoolId: 'necromante',
      level: 5,
      name: 'Necromante V',
      description: 'Bônus de Arcana em ataques físicos com lacaio próximo.',
      cost: c[5],
      requirements: { previous: 'necromante-4' },
      effects:
        'Ao realizar um ataque físico com pelo menos um morto-vivo seu a até 5 metros de você ou do alvo, você recebe bônus igual ao modificador de Arcana em todos os testes de ataques físicos.',
    },
    {
      id: 'necromante-6',
      schoolId: 'necromante',
      level: 6,
      name: 'Necromante VI',
      description: 'Empodera ataque de morto-vivo com energia necromântica.',
      cost: c[6],
      requirements: { previous: 'necromante-5' },
      effects:
        'Quando um morto-vivo seu ataca e você sacrifica 1 Mana, o dano vira mágico ou tóxico e recebe bônus igual ao modificador de Arcana.',
    },
    {
      id: 'necromante-7',
      schoolId: 'necromante',
      level: 7,
      name: 'Necromante VII',
      description: 'Designa um Morto-Vivo Comandante com ficha própria.',
      cost: c[7],
      requirements: { previous: 'necromante-6', nivelAlma: 13 },
      effects:
        'Durante um descanso, defina uma persona morta-viva como Morto-Vivo Comandante (apenas um). Ficha: 10 atributos, 40 habilidades/especialidades, 2 aptidões, 25 PC, 1/4 dos seus PE; máx. +15 PC por desvantagens; sem Ecoar nem Trilha. Turno próprio na iniciativa; pode ordenar inferiores. Retreinável no descanso.',
    },
    {
      id: 'necromante-8',
      schoolId: 'necromante',
      level: 8,
      name: 'Necromante VIII',
      description: 'Concede reações imediatas aos mortos-vivos por uma rodada.',
      cost: c[8],
      requirements: { previous: 'necromante-7', nivelAlma: 14 },
      effects:
        'Ao declarar este efeito e usar reação, seus mortos-vivos podem tomar reações imediatas por uma rodada, espaçadas no turno de outras criaturas.',
    },
    {
      id: 'necromante-9',
      schoolId: 'necromante',
      level: 9,
      name: 'Necromante IX',
      description: 'Cura de Necromante III ganha +2× Nível de Poder.',
      cost: c[9],
      requirements: { previous: 'necromante-8', nivelAlma: 15 },
      effects: 'A cura de Necromante III recebe um bônus igual ao dobro do seu Nível de Poder.',
    },
    {
      id: 'necromante-10',
      schoolId: 'necromante',
      level: 10,
      name: 'Necromante X',
      description: 'Testes não sociais/não combate favoráveis com lacaio perto.',
      cost: c[10],
      requirements: { previous: 'necromante-9', nivelAlma: 16 },
      effects:
        'Em tarefa ou ação não relacionada a combate e não social, testes favoráveis se pelo menos um morto-vivo estiver perto para ajudar.',
    },
    {
      id: 'necromante-11',
      schoolId: 'necromante',
      level: 11,
      name: 'Necromante XI',
      description: 'Bônus de dano físico 2× NdP com lacaio a 5 m.',
      cost: c[11],
      requirements: { previous: 'necromante-10', nivelAlma: 17 },
      effects:
        'Ao atacar fisicamente com morto-vivo a até 5 m de você ou do alvo, o cálculo de dano recebe bônus igual ao dobro do Nível de Poder.',
    },
    {
      id: 'necromante-12',
      schoolId: 'necromante',
      level: 12,
      name: 'Necromante XII',
      description: 'Potencializa Necromante V com Mana e consistência máxima.',
      cost: c[12],
      requirements: { previous: 'necromante-11', nivelAlma: 18 },
      effects:
        'Ao aplicar Necromante V, pode sacrificar 1 Mana para dobrar o bônus do modificador de Arcana e considerar consistência máxima no dado.',
    },
  ],
}
