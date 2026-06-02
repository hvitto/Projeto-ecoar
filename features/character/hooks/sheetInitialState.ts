import type { CatalogOwnedItem } from '@/shared/types/equipment'

export type EquippedArmorState = { instanceId: string }
export type CharacterSkillState = Record<string, { level: number; specialization?: string }>
export type CharacterAptitudesState = Record<string, number>

export type CharacterSheetState = {
  pontosEvolucao: { atual: number; max: number }
  nome: string
  localizacao: string
  moeda: string
  raca: string
  trilha: string
  tracoPositivo: string
  tracoNegativo: string
  personalidade: string
  peso: number
  tamanho: number
  terrestre: string
  aquatico: string
  aereo: string
  corpo: { atual: number; max: number }
  mente: { atual: number; max: number }
  folego: { atual: number; max: number }
  mana: { atual: number; max: number }
  carisma: { nivel: number; mod: number }
  finesse: { nivel: number; mod: number }
  forca: { nivel: number; mod: number }
  inteligencia: { nivel: number; mod: number }
  percepcao: { nivel: number; mod: number }
  vitalidade: { nivel: number; mod: number }
  vontade: { nivel: number; mod: number }
  visao: string
  audicao: string
  olfato: string
  arredores: string
  iniciativa: string
  esquiva: string
  coragem: string
  equipamentos: string
  saldoMoedas: number
  itensCatalogo: CatalogOwnedItem[]
  equippedWeapons: {
    slot1?: { instanceId: string }
    slot2?: { instanceId: string }
  }
  equippedArmors: EquippedArmorState[]
  equippedAccessories: EquippedArmorState[]
  hasVestuarioEquipState: boolean
  skills: CharacterSkillState
  aptitudes: CharacterAptitudesState
  equipamentosLivresText: string
  armasLivresText: string
  espacos: string
  anotacoes: string
  singularidades: string[]
  singularidadesEcoar: string[]
  singularidadesCondicionaisAtivas: string[]
  singularidadesCondicionaisCriacaoAtivas: string[]
  singularidadesMarciais: string[]
  singularidadesCondicionaisMarciaisAtivas: string[]
  singularidadesCondicionaisRaciaisAtivas: string[]
  singularidadesRaciais: string[]
  desvantagens: string[]
}

export function createInitialCharacterSheetState(): CharacterSheetState {
  return {
    pontosEvolucao: { atual: 0, max: 0 },
    nome: '',
    localizacao: '',
    moeda: '',
    raca: '',
    trilha: '',
    tracoPositivo: '',
    tracoNegativo: '',
    personalidade: '',
    peso: 0,
    tamanho: 0,
    terrestre: '',
    aquatico: '',
    aereo: '',
    corpo: { atual: 9, max: 9 },
    mente: { atual: 9, max: 9 },
    folego: { atual: 0, max: 0 },
    mana: { atual: 0, max: 0 },
    carisma: { nivel: 0, mod: 0 },
    finesse: { nivel: 0, mod: 0 },
    forca: { nivel: 0, mod: 0 },
    inteligencia: { nivel: 0, mod: 0 },
    percepcao: { nivel: 0, mod: 0 },
    vitalidade: { nivel: 0, mod: 0 },
    vontade: { nivel: 0, mod: 0 },
    visao: '',
    audicao: '',
    olfato: '',
    arredores: '',
    iniciativa: '',
    esquiva: '',
    coragem: '',
    equipamentos: '',
    saldoMoedas: 0,
    itensCatalogo: [],
    equippedWeapons: { slot1: undefined, slot2: undefined },
    equippedArmors: [],
    equippedAccessories: [],
    hasVestuarioEquipState: false,
    skills: {},
    aptitudes: {},
    equipamentosLivresText: '',
    armasLivresText: '',
    espacos: '',
    anotacoes: '',
    singularidades: [],
    singularidadesEcoar: [],
    singularidadesCondicionaisAtivas: [],
    singularidadesCondicionaisCriacaoAtivas: [],
    singularidadesMarciais: [],
    singularidadesCondicionaisMarciaisAtivas: [],
    singularidadesCondicionaisRaciaisAtivas: [],
    singularidadesRaciais: [],
    desvantagens: [],
  }
}
