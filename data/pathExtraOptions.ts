import { pathBookEntries, type PathBookEntry } from '@/data/pathBookContent'

export type PathPatronType = 'planar' | 'menor' | 'divindade'

export type PathPatronOption = {
  id: string
  name: string
  type: PathPatronType
  typeLabel: string
  description: string
  firstBlessingId: string
}

export type PathHonorCode = {
  id: string
  name: string
  limitation: string
  benefitName: string
  benefit: string
}

export const PATH_PATRONS: PathPatronOption[] = [
  {
    id: 'caeruleum',
    name: 'Caeruleum',
    type: 'planar',
    typeLabel: 'Entidade planar',
    description:
      'Entidade planar do plano Caeruleum. Bênçãos ligadas à Mana e à natureza arcana do plano.',
    firstBlessingId: 'patron-caeruleum-mana',
  },
  {
    id: 'nevermore',
    name: 'Nevermore',
    type: 'menor',
    typeLabel: 'Entidade menor',
    description:
      'A Mãe dos Corvos. Comunica-se com campeões e concede um corvo vinculado à alma.',
    firstBlessingId: 'patron-nevermore-corvo',
  },
  {
    id: 'medo',
    name: 'Medo',
    type: 'menor',
    typeLabel: 'Entidade menor',
    description: 'Personificação do pavor. Bênçãos focadas em dano mental e terror.',
    firstBlessingId: 'patron-medo-assistente',
  },
  {
    id: 'umbraverme',
    name: 'Umbraverme',
    type: 'menor',
    typeLabel: 'Entidade menor',
    description: 'Entidade disforme de vermes umbrais. Expurga almas e se alimenta da morte.',
    firstBlessingId: 'patron-umbra-banquete',
  },
  {
    id: 'vigia',
    name: "C’calathghed, o Vigia",
    type: 'menor',
    typeLabel: 'Entidade menor',
    description: 'Busca conhecimento. Conecta campeões em mente de colmeia.',
    firstBlessingId: 'patron-vigia-colmeia',
  },
  {
    id: 'festa',
    name: 'Deus da Festa',
    type: 'divindade',
    typeLabel: 'Divindade',
    description: 'Esfera das festividades e carisma (ex.: Baco). Bênçãos sociais e mentais.',
    firstBlessingId: 'patron-festa-festividades',
  },
  {
    id: 'guerra',
    name: 'Deus da Guerra',
    type: 'divindade',
    typeLabel: 'Divindade',
    description: 'Esfera da guerra (ex.: Marte, Odin, Hachiman). Bênçãos de combate.',
    firstBlessingId: 'patron-guerra-bencao',
  },
  {
    id: 'mortos',
    name: 'Deus dos Mortos',
    type: 'divindade',
    typeLabel: 'Divindade',
    description: 'Esfera da morte e das almas (ex.: Anúbis, Plutão, Leto).',
    firstBlessingId: 'patron-mortos-bencao',
  },
  {
    id: 'natureza',
    name: 'Deus da Natureza',
    type: 'divindade',
    typeLabel: 'Divindade',
    description: 'Esfera da natureza, caça e agricultura.',
    firstBlessingId: 'patron-natureza-bencao',
  },
]

export const PATH_HONOR_CODES: PathHonorCode[] = [
  {
    id: 'honor-forca-equivalente',
    name: 'Força Equivalente',
    limitation:
      'Você não pode usar ultraviolência em um combate onde um aliado não foi reduzido a 0 pontos de Corpo ou Mente, ou teve um limite como Espírito ou Consciência (ou equivalente) reduzido para a metade.',
    benefitName: 'Valor Provado',
    benefit:
      'Enquanto você ou um aliado estão com 0 pontos de Corpo ou Mente, ou menos da metade dos pontos de Espírito/Consciência (ou equivalente), você incrementa em +2 todos os bônus concedidos pela ultraviolência.',
  },
  {
    id: 'honor-jogo-limpo',
    name: 'Jogo Limpo',
    limitation:
      'Você não pode usar ultraviolência em um combate contra inimigos que foram pegos de surpresa, ou onde foram ou você sabe que serão empregadas táticas sujas ou desonestas.',
    benefitName: 'Presença Anunciada',
    benefit:
      'Caso você ou os seus aliados tenham iniciado um combate de acordo com Jogo Limpo, você recebe um turno extra durante a primeira rodada de combate. Durante este turno, você incrementa seus bônus concedidos pela ultraviolência em +3. Este turno extra será o primeiro na iniciativa.',
  },
  {
    id: 'honor-legitima-defesa',
    name: 'Legítima Defesa',
    limitation:
      'Você só pode usar ultraviolência em combates que você tem certeza que não foram iniciados por você ou por seus aliados, e perde a ultraviolência se continuar um combate após os hostis já estarem rendidos ou derrotados.',
    benefitName: 'Combate Rápido',
    benefit:
      'Durante um combate de acordo com Legítima Defesa e ao derrotar um hostil, você recebe uma ação curta que deve utilizar imediatamente. Esse efeito só pode ser ativado uma vez por turno.',
  },
  {
    id: 'honor-mano-a-mano',
    name: 'Mano a Mano',
    limitation:
      'Você não pode usar ultraviolência contra um alvo que já foi atacado por alguém que não seja você neste combate (duelo / confronto pessoal).',
    benefitName: 'Você e Eu',
    benefit:
      'Durante o seu confronto mano a mano, você incrementa em +2 seus bônus concedidos pela ultraviolência.',
  },
  {
    id: 'honor-pacifismo',
    name: 'Pacifismo',
    limitation:
      'Você não pode usar ultraviolência em combates onde força letal está sendo usada por você ou pelos seus aliados contra personas.',
    benefitName: 'O Verdadeiro Inimigo',
    benefit:
      'Você é completamente imune aos efeitos da infecção da Praga, mas ainda pode ficar infectado com ela. Enquanto infectado, você ainda pode passar a infecção para outras pessoas que você interage, mas incrementa em +2 todos os bônus concedidos pela ultraviolência.',
  },
  {
    id: 'honor-vinganca',
    name: 'Vingança',
    limitation:
      'Você não pode usar ultraviolência contra personas que não fazem parte de um grupo ao qual você possui extremo ressentimento. Especifique este grupo ao adquirir o código (com o Mestre Absoluto).',
    benefitName: 'Vingança Jurada',
    benefit:
      'Ao derrotar um inimigo que faz parte do grupo ao qual você jurou vingança, você incrementa em +2 seus bônus concedidos pela ultraviolência. Esse incremento dura até o final do combate e é cumulativo.',
  },
]

const PATH_BASE_ALIASES: Record<string, string[]> = {
  'path-impeto': ['impeto', 'path-impeto'],
  'path-campeao': ['campeao', 'path-campeao'],
  'path-carrasco': ['carrasco', 'path-carrasco'],
  'path-anti-cacador': ['anti-cacador', 'path-anti-cacador'],
}

export function getPathBookEntryById(id: string): PathBookEntry | undefined {
  return pathBookEntries.find((e) => e.id === id)
}

export function getPathPatronById(id: string): PathPatronOption | undefined {
  return PATH_PATRONS.find((p) => p.id === id)
}

export function getPathHonorCodeById(id: string): PathHonorCode | undefined {
  return PATH_HONOR_CODES.find((c) => c.id === id)
}

export function getEsperancaProjections(): PathBookEntry[] {
  return pathBookEntries.filter((e) => e.pathKind === 'esperanca' && e.meta?.kind === 'projection')
}

export function getEsperancaProjectionsBySchool(school: string): PathBookEntry[] {
  return getEsperancaProjections()
    .filter((e) => e.meta?.school === school)
    .sort((a, b) => Number(a.meta?.level ?? 0) - Number(b.meta?.level ?? 0))
}

export function getEsperancaProjectionSchools(): string[] {
  const schools = new Set<string>()
  for (const e of getEsperancaProjections()) {
    if (typeof e.meta?.school === 'string') schools.add(e.meta.school)
  }
  return Array.from(schools)
}

export function getPatronosBlessings(): PathBookEntry[] {
  return pathBookEntries.filter(
    (e) =>
      e.pathKind === 'patronos' &&
      (e.meta?.kind === 'blessing' || (e.meta?.kind === 'enhancement' && e.meta?.patron)),
  )
}

export function getPatronosBlessingsByPatron(patronId: string): PathBookEntry[] {
  return getPatronosBlessings()
    .filter((e) => e.meta?.patron === patronId)
    .sort((a, b) => Number(a.meta?.level ?? 0) - Number(b.meta?.level ?? 0))
}

export function getViolenciaUltraviolences(): PathBookEntry[] {
  return pathBookEntries.filter((e) => e.pathKind === 'violencia' && e.meta?.kind === 'ultraviolence')
}

export function getPathExtraEntryCost(id: string): number {
  return getPathBookEntryById(id)?.cost ?? 0
}

export function sumPathExtraCosts(ids: string[]): number {
  return ids.reduce((sum, id) => sum + getPathExtraEntryCost(id), 0)
}

export function isPathBookPreviousMet(
  previousId: string,
  ctx: {
    pathSingularityBase: string
    ownedIds: string[]
    martialSingularityIds?: string[]
  },
): boolean {
  const owned = new Set([
    ...ctx.ownedIds,
    ...(ctx.martialSingularityIds ?? []),
    ctx.pathSingularityBase,
  ])
  if (owned.has(previousId)) return true
  const aliases = PATH_BASE_ALIASES[previousId]
  if (aliases?.some((a) => owned.has(a))) return true
  return false
}

export function canSelectPathBookEntry(
  entry: PathBookEntry,
  ctx: {
    pathSingularityBase: string
    ownedIds: string[]
    martialSingularityIds?: string[]
    selectedExtraIds: string[]
  },
): { ok: boolean; reason?: string } {
  const previous = entry.previousIds ?? []
  for (const req of previous) {
    if (
      !isPathBookPreviousMet(req, {
        pathSingularityBase: ctx.pathSingularityBase,
        ownedIds: [...ctx.ownedIds, ...ctx.selectedExtraIds],
        martialSingularityIds: ctx.martialSingularityIds,
      })
    ) {
      return { ok: false, reason: `Requer ${req}` }
    }
  }
  if (entry.meta?.requiresThree === true) {
    const otherUv = ctx.selectedExtraIds.filter((id) => {
      const e = getPathBookEntryById(id)
      return e?.meta?.kind === 'ultraviolence' && id !== entry.id
    })
    if (otherUv.length < 3) {
      return { ok: false, reason: 'Requer pelo menos 3 outras ultraviolências' }
    }
  }
  return { ok: true }
}

export const ESPERANCA_SCHOOL_LABELS: Record<string, string> = {
  barda: 'Escola da Barda',
  desenhista: 'Escola da Desenhista',
  musicista: 'Escola do Musicista',
}
