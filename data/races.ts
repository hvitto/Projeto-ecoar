// Races and Genus data from Ecoar RPG

export interface RaceImageHeroConfig {
  width?: number
  height?: number
  style?: {
    width?: string
    height?: string
    maxWidth?: string
  }
  offsetLeft?: string
  offsetTop?: string
  translateX?: string
  translateY?: string
  zIndex?: number
}

export interface RaceImageConfig {
  src: string
  alt?: string
  hero?: RaceImageHeroConfig
}

export interface Race {
  id: string
  name: string
  genus: string
  description: string
  bonuses?: {
    attributes?: Record<string, number>
    skills?: Record<string, number>
    corpo?: number
    mente?: number
    folego?: number
    mana?: number
    movement?: {
      terrestre?: number
      aquatico?: number
      aereo?: number
    }
    senses?: {
      visao?: number
      audicao?: number
      olfato?: number
    }
    sizeModifier?: number
    weightModifier?: number
  }
  image?: RaceImageConfig
}

const defaultHeroImageConfig: RaceImageHeroConfig = {
  width: 380,
  height: 900,
  style: {
    width: '30rem',
    height: '38rem',
    maxWidth: '900px',
  },
  offsetLeft: '-9%',
  offsetTop: '0',
  translateX: '-60%',
  translateY: '0',
  zIndex: 0,
}

export const races: Race[] = [
  {
    id: 'peccata',
    name: 'Peccata',
    genus: 'Belluan',
    description: 'Os peccatas possuem uma vontade inquebrantável e uma persistência imensurável.',
    bonuses: {
      movement: { terrestre: 6, aquatico: 2 },
      senses: { visao: 800, audicao: 50, olfato: 1 },
      sizeModifier: 0,
      weightModifier: 0,
    },
    image: {
      src: '/assets/images/Peccata.png',
      alt: 'Peccata',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'anao',
    name: 'Anão',
    genus: 'Belluan',
    description: 'Híbridos entre dvergar e peccatas, personas de baixa estatura e corpo resiliente.',
    bonuses: {
      movement: { terrestre: 4, aquatico: 2 },
      senses: { visao: 800, audicao: 50, olfato: 1 },
      sizeModifier: -1,
      weightModifier: 0,
      corpo: 2,
    },
    image: {
      src: '/assets/images/Anão.png',
      alt: 'Anão',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'elfo',
    name: 'Elfo',
    genus: 'Belluan',
    description: 'Híbridos entre álfar e peccatas, personas graciosas e perspicazes.',
    bonuses: {
      movement: { terrestre: 6, aquatico: 2 },
      senses: { visao: 1500, audicao: 150, olfato: 1 },
      sizeModifier: 0,
      weightModifier: 0,
    },
    image: {
      src: '/assets/images/Elfo.png',
      alt: 'Elfo',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'orc',
    name: 'Orc',
    genus: 'Belluan',
    description: 'Híbridos entre orcci e peccatas, extremamente durões e difíceis de vencer.',
    bonuses: {
      movement: { terrestre: 8, aquatico: 2 },
      senses: { visao: 400, audicao: 50, olfato: 1 },
      sizeModifier: 0,
      weightModifier: 0,
    },
    image: {
      src: '/assets/images/Orc.png',
      alt: 'Orc',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'tyllow',
    name: 'Tyllow',
    genus: 'Belluan',
    description: 'Híbridos entre seelie e peccatas, pequenas e delicadas, com grande vínculo à Mana.',
    bonuses: {
      movement: { terrestre: 6, aquatico: 2 },
      senses: { visao: 800, audicao: 150, olfato: 1 },
      sizeModifier: -1,
      weightModifier: -1,
      attributes: { forca: -1, vitalidade: -1 },
    },
    image: {
      src: '/assets/images/Tyllow.png',
      alt: 'Tyllow',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'kaidler',
    name: 'Kaidler',
    genus: 'Aves',
    description: 'Possuem capacidades de voo, garras afiadas e sentidos aguçados como uma águia.',
    bonuses: {
      movement: { terrestre: 4, aquatico: 2, aereo: 2 },
      senses: { visao: 1500, audicao: 150, olfato: 1 },
      sizeModifier: 0,
      weightModifier: 0,
    },
    image: {
      src: '/assets/images/Kaidler.png',
      alt: 'Kaidler',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'fjyr',
    name: 'Fjyr',
    genus: 'Caprini',
    description: 'Personas versáteis com capacidade extremamente distinta de utilizar o instinto.',
    bonuses: {
      movement: { terrestre: 8, aquatico: 2 },
      senses: { visao: 300, audicao: 150, olfato: 1 },
      sizeModifier: 0,
      weightModifier: 0,
    },
    image: {
      src: '/assets/images/Fjar.png',
      alt: 'Fjyr',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'mayne',
    name: 'Mayne',
    genus: 'Feline',
    description: 'Personas com aparência e traços leoninos, com personalidade que reforça esse vínculo.',
    bonuses: {
      movement: { terrestre: 8, aquatico: 2 },
      senses: { visao: 800, audicao: 150, olfato: 1 },
      sizeModifier: 0,
      weightModifier: 0,
    },
    image: {
      src: '/assets/images/Mayne.png',
      alt: 'Mayne',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'tsusagi',
    name: 'Tsusagi',
    genus: 'Lepona',
    description: 'Personas com orelhas e pernas antropomórficas de coelho. Capacidade de saltar inigualável.',
    bonuses: {
      movement: { terrestre: 8, aquatico: 2 },
      senses: { visao: 800, audicao: 300, olfato: 1 },
      sizeModifier: 0,
      weightModifier: 0,
    },
    image: {
      src: '/assets/images/Tsusagi.png',
      alt: 'Tsusagi',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'niliapy',
    name: 'Niliapy',
    genus: 'Lizautraco',
    description: 'Personas com pés e uma poderosa cauda de crocodilo. Grande capacidade locomotiva embaixo da água.',
    bonuses: {
      movement: { terrestre: 6, aquatico: 6 },
      senses: { visao: 400, audicao: 50, olfato: 1 },
      sizeModifier: 1,
      weightModifier: 1,
    },
    image: {
      src: '/assets/images/Niliapy.png',
      alt: 'Niliapy',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'triskelion',
    name: 'Triskelion',
    genus: 'Lupus',
    description: 'Uma raça amaldiçoada, criada através do pecado e tentativa de alcançar imunidade contra a Praga.',
    bonuses: {
      movement: { terrestre: 8, aquatico: 2 },
      senses: { visao: 800, audicao: 150, olfato: 5 },
      sizeModifier: 0,
      weightModifier: 0,
    },
    image: {
      src: '/assets/images/Triskelion.png',
      alt: 'Triskelion',
      hero: defaultHeroImageConfig,
    },
  },
  {
    id: 'fleurili',
    name: 'Fleurili',
    genus: 'Nymphe',
    description: 'Personas com aparência humanoide e orelhas pontudas, cores vibrantes e flores que florescem.',
    bonuses: {
      movement: { terrestre: 6, aquatico: 2 },
      senses: { visao: 800, audicao: 150, olfato: 1 },
      sizeModifier: 0,
      weightModifier: 0,
    },
    image: {
      src: '/assets/images/Fleurili.png',
      alt: 'Fleurili',
      hero: defaultHeroImageConfig,
    },
  },
]

export const getRaceById = (id: string): Race | undefined => {
  return races.find(r => r.id === id)
}

export const getRacesByGenus = (genus: string): Race[] => {
  return races.filter(r => r.genus === genus)
}

export const getAllGenus = (): string[] => {
  return Array.from(new Set(races.map(r => r.genus)))
}

