export interface Path {
  id: string
  name: string
  description: string
  type: 'bruxaria' | 'cacada' | 'esperanca' | 'patronos' | 'violencia' | 'anti-cacada'
}

export let paths: Path[] = [
  {
    id: 'bruxaria',
    name: 'Trilha da Bruxaria',
    description:
      'Aqueles que seguem esta Trilha se tornam Bruxos e Bruxas. Empoderam-se através dos terrores e emoções negativas canalizadas em magia.',
    type: 'bruxaria',
  },
  {
    id: 'cacada',
    name: 'Trilha da Caçada',
    description:
      'Caçadores Independentes ou Absolutos (Abismo, Éter, Lunara, Grande-Chama) especializados no combate à Praga.',
    type: 'cacada',
  },
  {
    id: 'esperanca',
    name: 'Trilha da Esperança',
    description:
      'Aqueles que seguem esta Trilha se tornam ímpetos: arautos da esperança que, através da arte (Vox), inspiram aliados e projetam escolas marciais artísticas.',
    type: 'esperanca',
  },
  {
    id: 'patronos',
    name: 'Trilha dos Patronos',
    description:
      'Campeões de fé inabalável vinculados a uma divindade, entidade menor ou entidade planar (ex.: Caeruleum), imunes à infecção da Praga.',
    type: 'patronos',
  },
  {
    id: 'violencia',
    name: 'Trilha da Violência',
    description:
      'Carrascos que canalizam ultraviolência sob um código de honra — oficiais, soldados, mercenários ou criminosos com violência disciplinada.',
    type: 'violencia',
  },
  {
    id: 'anti-cacada',
    name: 'Anti-Caçador',
    description:
      'Trilha corrompida a serviço da Praga, com acesso amplo a infusões sob o juramento do pecado.',
    type: 'anti-cacada',
  },
]

export function hydratePaths(list: Path[]) {
  if (list.length > 0) paths = list
}

export const getPathById = (id: string): Path | undefined => {
  return paths.find((p) => p.id === id)
}
