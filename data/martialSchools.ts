// Escolas Marciais (Martial Schools) - Classes de combate do Ecoar RPG
// Estas são as verdadeiras "classes" do sistema, equivalentes às classes do D&D

export interface MartialSchool {
  id: string
  name: string
  category: 'Doutores' | 'Conjuradores' | 'Elementalistas' | 'Gravimagos' | 'Atiradores' | 'Emboscadores' | 'Guerreiros'
  description: string
  bonuses?: {
    attributes?: Record<string, number>
    skills?: Record<string, number>
    corpo?: number
    mente?: number
    folego?: number
    mana?: number
  }
}

export const martialSchools: MartialSchool[] = [
  {
    id: 'doutores-praga',
    name: 'Doutores da Praga',
    category: 'Doutores',
    description: 'Médicos especialistas em utilizar equipamentos médicos e curar ferimentos.',
    bonuses: {
      skills: { medicina: 2 },
      attributes: { inteligencia: 1 },
    },
  },
  {
    id: 'conjuradores',
    name: 'Conjuradores',
    category: 'Conjuradores',
    description: 'Conjuradores de magias extremamente poderosas, que manipulam a realidade através da magia.',
    bonuses: {
      attributes: { inteligencia: 2 },
      mana: 5,
    },
  },
  {
    id: 'elementalistas',
    name: 'Elementalistas',
    category: 'Elementalistas',
    description: 'Elementalistas são conjuradores de magias extremamente poderosas, que dominam os elementos.',
    bonuses: {
      attributes: { inteligencia: 1, percepcao: 1 },
      mana: 3,
    },
  },
  {
    id: 'gravimagos',
    name: 'Gravimagos',
    category: 'Gravimagos',
    description: 'Usam telecinese para aumentar sua força física e interagir e atacar à distância.',
    bonuses: {
      attributes: { forca: 1, inteligencia: 1 },
      mana: 3,
    },
  },
  {
    id: 'atiradores',
    name: 'Atiradores',
    category: 'Atiradores',
    description: 'Ameaças mortais que utilizam ataques de longo alcance para eliminar inimigos à distância.',
    bonuses: {
      attributes: { percepcao: 2 },
      skills: { arco: 2 },
    },
  },
  {
    id: 'emboscadores',
    name: 'Emboscadores',
    category: 'Emboscadores',
    description: 'Combatentes caóticos, furtivos e oportunistas, que acertam golpes precisos quando o inimigo menos espera.',
    bonuses: {
      attributes: { finesse: 2 },
      skills: { furtividade: 2 },
    },
  },
  {
    id: 'guerreiros',
    name: 'Guerreiros',
    category: 'Guerreiros',
    description: 'Combatentes corpo-a-corpo letais e resistentes, que são mestres em combate direto.',
    bonuses: {
      attributes: { forca: 2 },
      corpo: 2,
    },
  },
]

export const getMartialSchoolById = (id: string): MartialSchool | undefined => {
  return martialSchools.find(school => school.id === id)
}

export const getMartialSchoolsByCategory = (category: string): MartialSchool[] => {
  return martialSchools.filter(school => school.category === category)
}

export const getAllCategories = (): string[] => {
  return Array.from(new Set(martialSchools.map(school => school.category)))
}

