// Trilhas (Paths) data from Ecoar RPG

export interface Path {
  id: string
  name: string
  description: string
  type: 'caçador' | 'caçador-corrompido' | 'bruxaria' | 'cacada'
}

export const paths: Path[] = [
  {
    id: 'bruxaria',
    name: 'Trilha da Bruxaria',
    description: 'Aqueles que seguem esta Trilha se tornam Bruxos e Bruxas. Os Bruxos são frequentemente confundidos com cultistas devido ao fato de se apoiarem em emoções negativas para trazer seus efeitos mágicos à realidade.',
    type: 'bruxaria',
  },
  {
    id: 'cacada',
    name: 'Trilha da Caçada',
    description: 'Aqueles que lutam diretamente contra a Praga podem se tornar Caçadores. Os Caçadores são especialistas no combate contra a Praga, e possuem a vantagem de não precisar de armas de prata para causar dano na vasta maioria de criaturas criadas pela Praga.',
    type: 'cacada',
  },
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

