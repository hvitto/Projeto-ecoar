// Trilhas (Paths) data from Ecoar RPG

export interface Path {
  id: string
  name: string
  description: string
  type: 'caçador' | 'caçador-corrompido'
}

export const paths: Path[] = [
  {
    id: 'cacador',
    name: 'Caçador',
    description: 'Caçadores da Praga, dedicados a eliminar ameaças.',
    type: 'caçador',
  },
  {
    id: 'cacador-corrompido',
    name: 'Caçador Corrompido',
    description: 'Caçadores que foram corrompidos pela Praga.',
    type: 'caçador-corrompido',
  },
]

export const getPathById = (id: string): Path | undefined => {
  return paths.find(p => p.id === id)
}

