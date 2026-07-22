export type DisturbioIdentityPartKind = 'gatilho' | 'efeito' | 'penalidade'

export type DisturbioIdentityPart = {
  id: string
  kind: DisturbioIdentityPartKind
  name: string
  description: string
  pontosEcoar: number
}

export type DisturbioComum = {
  id: string
  name: string
  description: string
  pontosEcoar: number
  repeatableByAttribute?: boolean
  choices?: { id: string; name: string }[]
}

export type EcoarAcao = {
  id: string
  name: string
  description: string
  universal?: boolean
}

export type DisturbioIdentidadeSelection = {
  gatilhoId: string
  efeitoId: string
  penalidadeId: string
}

export type DisturbioOwnedEntry =
  | { kind: 'comum'; id: string; choiceId?: string }
  | { kind: 'identidade'; gatilhoId: string; efeitoId: string; penalidadeId: string }

export let disturbioIdentityGatilhos: DisturbioIdentityPart[] = [
  {
    id: 'gatilho-panico',
    kind: 'gatilho',
    name: 'Pânico',
    description: 'Quando você ou um dos seus aliados ficam com 0 pontos em Corpo, Mente, ou equivalente.',
    pontosEcoar: 5,
  },
  {
    id: 'gatilho-apatia',
    kind: 'gatilho',
    name: 'Apatia',
    description: 'Quando você causa dano físico ou mental contra um entiensis ou persona.',
    pontosEcoar: 10,
  },
  {
    id: 'gatilho-vicio',
    kind: 'gatilho',
    name: 'Vício',
    description:
      'Ao adquirir, defina uma substância, hábito ou semelhante. Gatilho: quando finaliza um descanso sem ter cumprido o vício no dia anterior.',
    pontosEcoar: 5,
  },
  {
    id: 'gatilho-ansiedade',
    kind: 'gatilho',
    name: 'Ansiedade',
    description: 'Quando você entra em um combate e rola iniciativa.',
    pontosEcoar: 15,
  },
  {
    id: 'gatilho-inseguranca',
    kind: 'gatilho',
    name: 'Insegurança',
    description: 'Quando você faz um ou mais testes durante um turno de combate, mas não tem sucesso em nenhum deles.',
    pontosEcoar: 5,
  },
  {
    id: 'gatilho-melancolia',
    kind: 'gatilho',
    name: 'Melancolia',
    description: 'Quando você falha em um teste fora de um combate.',
    pontosEcoar: 5,
  },
  {
    id: 'gatilho-procrastinacao',
    kind: 'gatilho',
    name: 'Procrastinação',
    description: 'Quando você finaliza seu turno em um combate sem usar a ação “esperar”.',
    pontosEcoar: 10,
  },
]

export let disturbioIdentityEfeitos: DisturbioIdentityPart[] = [
  {
    id: 'efeito-ataques',
    kind: 'efeito',
    name: 'Ataques',
    description: 'A penalidade será aplicada em testes de habilidades de combate.',
    pontosEcoar: 10,
  },
  {
    id: 'efeito-causar-dano',
    kind: 'efeito',
    name: 'Causar Dano',
    description: 'A penalidade será aplicada em seus cálculos de dano físico ou mental.',
    pontosEcoar: 10,
  },
  {
    id: 'efeito-funcoes-cognitivas',
    kind: 'efeito',
    name: 'Funções Cognitivas',
    description: 'A penalidade será aplicada em testes de habilidades primárias.',
    pontosEcoar: 10,
  },
  {
    id: 'efeito-interacoes-sociais',
    kind: 'efeito',
    name: 'Interações Sociais',
    description: 'A penalidade será aplicada em testes de habilidades sociais.',
    pontosEcoar: 5,
  },
  {
    id: 'efeito-outras-atividades',
    kind: 'efeito',
    name: 'Outras Atividades',
    description: 'A penalidade será aplicada em testes de habilidades que não são de combate ou primárias.',
    pontosEcoar: 0,
  },
]

export let disturbioIdentityPenalidades: DisturbioIdentityPart[] = [
  {
    id: 'penalidade-modificador-fixo',
    kind: 'penalidade',
    name: 'Modificador Fixo',
    description: 'A penalidade é de -2.',
    pontosEcoar: 0,
  },
  {
    id: 'penalidade-meio-nivel-poder',
    kind: 'penalidade',
    name: '½ do Nível de Poder',
    description: 'A penalidade é igual à metade (arredondada para cima) do seu Nível de Poder.',
    pontosEcoar: 5,
  },
  {
    id: 'penalidade-nivel-poder',
    kind: 'penalidade',
    name: 'Nível de Poder',
    description: 'A penalidade é igual ao seu Nível de Poder.',
    pontosEcoar: 10,
  },
  {
    id: 'penalidade-dado-baixo',
    kind: 'penalidade',
    name: 'Dado Baixo',
    description: 'A penalidade é igual ao resultado de 1d6.',
    pontosEcoar: 5,
  },
  {
    id: 'penalidade-dado-alto',
    kind: 'penalidade',
    name: 'Dado Alto',
    description: 'A penalidade é igual ao resultado de 1d12.',
    pontosEcoar: 10,
  },
]

export let disturbiosComuns: DisturbioComum[] = [
  {
    id: 'assombro-temporario',
    name: 'Assombro Temporário',
    description:
      'Em 1d4 minutos após a morte, o corpo vira casulo da Praga (ficha pelo MA). Volta ao corpo ao finalizar a ressurreição. Limites do monstro = Praga (Nível de Poder × 10).',
    pontosEcoar: 60,
  },
  {
    id: 'atributo-prejudicado',
    name: 'Atributo Prejudicado',
    description: 'Escolha um atributo para receber −1 no modificador. Pode ser adquirido mais de uma vez, em atributos diferentes.',
    pontosEcoar: 10,
    repeatableByAttribute: true,
    choices: [
      { id: 'carisma', name: 'Carisma' },
      { id: 'finesse', name: 'Finesse' },
      { id: 'forca', name: 'Força' },
      { id: 'inteligencia', name: 'Inteligência' },
      { id: 'percepcao', name: 'Percepção' },
      { id: 'vitalidade', name: 'Vitalidade' },
      { id: 'vontade', name: 'Vontade' },
    ],
  },
  {
    id: 'autofobia',
    name: 'Autofobia',
    description: 'Nunca causa acerto crítico ou dano monstruoso (salvo acidente).',
    pontosEcoar: 20,
  },
  {
    id: 'comportamento-desmoralizador',
    name: 'Comportamento Desmoralizador',
    description:
      'Ao sofrer dano mental, aliados que testemunharem sofrem o mesmo em Mente (limitado pelo NdP), 1× por rodada.',
    pontosEcoar: 20,
  },
  {
    id: 'corpo-fragil',
    name: 'Corpo Frágil',
    description: 'Penalidade em Corpo igual ao Nível de Poder.',
    pontosEcoar: 15,
  },
  {
    id: 'mente-fragil',
    name: 'Mente Frágil',
    description: 'Penalidade em Mente igual ao Nível de Poder.',
    pontosEcoar: 15,
  },
  {
    id: 'desejos-autodestrutivos',
    name: 'Desejos Autodestrutivos',
    description: 'Cura em Corpo/Mente fora de descanso reduzida pelo Nível de Poder.',
    pontosEcoar: 20,
  },
  {
    id: 'favoritismo',
    name: 'Favoritismo',
    description:
      'Escolha arma ou armadura apego. Sem ela: testes desfavoráveis (ataque se arma, esquiva se armadura). Troca exige 3 testes de Vontade + Compostura (Determinação) CD = NdP.',
    pontosEcoar: 30,
  },
  {
    id: 'fragilidade-a-praga',
    name: 'Fragilidade à Praga',
    description: 'Ainda pode ser infectado; penalidades da infecção reduzidas pela metade (↑).',
    pontosEcoar: 10,
  },
  {
    id: 'inconsequencia',
    name: 'Inconsequência',
    description: 'Testes de iniciativa e esquiva desfavoráveis.',
    pontosEcoar: 50,
  },
  {
    id: 'perda-de-memorias',
    name: 'Perda de Memórias',
    description:
      'Penalidade igual ao NdP em Atenção, Raciocínio, artísticas, científicas, sociais e gerais.',
    pontosEcoar: 60,
  },
  {
    id: 'pesadelos-e-tristeza',
    name: 'Pesadelos e Tristeza',
    description:
      'Você e quem descansa no mesmo ambiente tratam descanso como meio-descanso. Pode tentar Vontade + Compostura CD 4+NdP para suprimir (dificuldade acumula +2 por sucesso).',
    pontosEcoar: 30,
  },
  {
    id: 'recuperacao-lenta',
    name: 'Recuperação Lenta',
    description:
      'No descanso cura metade. Se um limite não recebeu dano até o próximo descanso, cura completo nesse limite.',
    pontosEcoar: 20,
  },
  {
    id: 'remorso',
    name: 'Remorso',
    description:
      'Ao testemunhar aliado sofrer dano físico/mental, sofre o mesmo em Mente (limitado pelo NdP), 1× por rodada.',
    pontosEcoar: 15,
  },
  {
    id: 'trauma-da-morte',
    name: 'Trauma da Morte',
    description:
      'Ao sofrer dano na presença de algo semelhante à primeira morte, sofre NdP em Mente, 1× por rodada.',
    pontosEcoar: 15,
  },
]

export let ecoarAcoes: EcoarAcao[] = [
  {
    id: 'ressurreicao',
    name: 'Ressurreição',
    description:
      'Entre 12h e 24h após a morte, regenera ferimentos mortais e volta com Corpo/Mente zerados e Fôlego/Mana no máximo. Universal a todos os Ecos.',
    universal: true,
  },
  {
    id: 'ressurreicao-imediata',
    name: 'Ressurreição Imediata',
    description: 'Como a ressurreição, mas de 1 minuto até 24h após a morte, à escolha do Eco.',
  },
  {
    id: 'regeneracao',
    name: 'Regeneração',
    description:
      'No descanso regenera membros; permite ressurreição mesmo com cabeça/tronco destruídos ou corpo queimado/decapitado.',
  },
  {
    id: 'reposicionar-ressurreicao',
    name: 'Reposicionar Ressurreição',
    description: 'Ao ressuscitar pelo Ecoar, pode voltar em local onde esteve nas últimas 24h.',
  },
]

export function hydrateDisturbios(input: {
  gatilhos: DisturbioIdentityPart[]
  efeitos: DisturbioIdentityPart[]
  penalidades: DisturbioIdentityPart[]
  comuns: DisturbioComum[]
  acoes: EcoarAcao[]
}) {
  if (input.gatilhos.length > 0) disturbioIdentityGatilhos = input.gatilhos
  if (input.efeitos.length > 0) disturbioIdentityEfeitos = input.efeitos
  if (input.penalidades.length > 0) disturbioIdentityPenalidades = input.penalidades
  if (input.comuns.length > 0) disturbiosComuns = input.comuns
  if (input.acoes.length > 0) ecoarAcoes = input.acoes
}

export function getDisturbioIdentityPartById(id: string): DisturbioIdentityPart | undefined {
  return (
    disturbioIdentityGatilhos.find((p) => p.id === id) ||
    disturbioIdentityEfeitos.find((p) => p.id === id) ||
    disturbioIdentityPenalidades.find((p) => p.id === id)
  )
}

export function getDisturbioComumById(id: string): DisturbioComum | undefined {
  return disturbiosComuns.find((d) => d.id === id)
}

export function getEcoarAcaoById(id: string): EcoarAcao | undefined {
  return ecoarAcoes.find((a) => a.id === id)
}

export function getIdentityPontosEcoar(sel: DisturbioIdentidadeSelection | null | undefined): number {
  if (!sel?.gatilhoId || !sel?.efeitoId || !sel?.penalidadeId) return 0
  const g = getDisturbioIdentityPartById(sel.gatilhoId)
  const e = getDisturbioIdentityPartById(sel.efeitoId)
  const p = getDisturbioIdentityPartById(sel.penalidadeId)
  if (!g || g.kind !== 'gatilho' || !e || e.kind !== 'efeito' || !p || p.kind !== 'penalidade') return 0
  return g.pontosEcoar + e.pontosEcoar + p.pontosEcoar
}

export function countOwnedDisturbios(entries: DisturbioOwnedEntry[]): number {
  return entries.length
}

export function getDisturbiosPontosEcoarObtidos(entries: DisturbioOwnedEntry[]): number {
  return entries.reduce((sum, entry) => {
    if (entry.kind === 'identidade') {
      return sum + getIdentityPontosEcoar(entry)
    }
    const comum = getDisturbioComumById(entry.id)
    return sum + (comum?.pontosEcoar ?? 0)
  }, 0)
}

export function ownedEntryKey(entry: DisturbioOwnedEntry): string {
  if (entry.kind === 'identidade') {
    return `identidade:${entry.gatilhoId}:${entry.efeitoId}:${entry.penalidadeId}`
  }
  return entry.choiceId ? `${entry.id}:${entry.choiceId}` : entry.id
}

export function hasIdentityDisturbio(entries: DisturbioOwnedEntry[]): boolean {
  return entries.some((e) => e.kind === 'identidade')
}

export function isComumOwned(
  entries: DisturbioOwnedEntry[],
  id: string,
  choiceId?: string,
): boolean {
  return entries.some(
    (e) => e.kind === 'comum' && e.id === id && (choiceId ? e.choiceId === choiceId : !e.choiceId || e.choiceId === choiceId),
  )
}

export function attributeChoicesTaken(entries: DisturbioOwnedEntry[], comumId: string): string[] {
  return entries
    .filter((e): e is Extract<DisturbioOwnedEntry, { kind: 'comum' }> => e.kind === 'comum' && e.id === comumId)
    .map((e) => e.choiceId)
    .filter((c): c is string => Boolean(c))
}
