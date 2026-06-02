import type { CatalogOwnedItem } from '@/shared/types/equipment'

export type WizardAttributes = {
  carisma: number
  finesse: number
  forca: number
  inteligencia: number
  percepcao: number
  vitalidade: number
  vontade: number
}

export type WizardPontosCriacao = {
  obtidos: number
  gastos: number
  disponiveis: number
}

export type WizardFormState = {
  nivelAlmaInicial: number
  selectedRaca: string
  selectedEscolaMarcial: string
  selectedLocalizacao: string
  selectedTrilha: string
  attributes: WizardAttributes
  attributePoints: number
  skillPoints: number
  aptitudePoints: number
  moedaExtra: number
  selectedDisadvantages: string[]
  skills: Record<string, { level: number; specialization?: string }>
  aptitudes: Record<string, number>
  tamanho: string
  peso: string
  deslocamento: { terrestre: number; aquatico: number; aereo: number }
  sentidos: { visao: number; audicao: number; olfato: number }
  singularidades: string[]
  selectedEcoar: string
  singularidadesEcoar: string[]
  singularidadesRaciais: string[]
  pathSingularityBase: string
  pathBruxarias: string[]
  pathCacadaPowers: string[]
  pathCacadaEnhancements: string[]
  pontosCriacao: WizardPontosCriacao
  nome: string
  backstory: string
  tracoPositivo: string
  tracoNegativo: string
  personalidade: string
  equipamentos: string[]
  armas: string[]
  itensCatalogo: CatalogOwnedItem[]
  raceBonuses: Record<string, number>
  martialSchoolBonuses: Record<string, number>
}

export const initialWizardAttributes = (): WizardAttributes => ({
  carisma: 0,
  finesse: 0,
  forca: 0,
  inteligencia: 0,
  percepcao: 0,
  vitalidade: 0,
  vontade: 0,
})

export function createInitialWizardFormState(): WizardFormState {
  return {
    nivelAlmaInicial: 1,
    selectedRaca: '',
    selectedEscolaMarcial: '',
    selectedLocalizacao: '',
    selectedTrilha: '',
    attributes: initialWizardAttributes(),
    attributePoints: 12,
    skillPoints: 48,
    aptitudePoints: 3,
    moedaExtra: 0,
    selectedDisadvantages: [],
    skills: {},
    aptitudes: {},
    tamanho: '',
    peso: '',
    deslocamento: { terrestre: 0, aquatico: 0, aereo: 0 },
    sentidos: { visao: 0, audicao: 0, olfato: 0 },
    singularidades: [],
    selectedEcoar: '',
    singularidadesEcoar: [],
    singularidadesRaciais: [],
    pathSingularityBase: '',
    pathBruxarias: [],
    pathCacadaPowers: [],
    pathCacadaEnhancements: [],
    pontosCriacao: { obtidos: 30, gastos: 0, disponiveis: 30 },
    nome: '',
    backstory: '',
    tracoPositivo: '',
    tracoNegativo: '',
    personalidade: '',
    equipamentos: [],
    armas: [],
    itensCatalogo: [],
    raceBonuses: {},
    martialSchoolBonuses: {},
  }
}
