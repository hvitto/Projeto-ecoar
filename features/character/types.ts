import type { CatalogOwnedItem } from '@/types/equipment'

/** Payload completo da criação/edição de personagem (wizard). */
export interface CharacterCreationData {
  nivelAlma?: number
  nivelPoder?: number
  nivelTrilha?: number
  raca?: string
  localizacao?: string
  trilha?: string
  escolaMarcial?: string
  escolasMarciais?: string[]
  attributes?: Record<string, number>
  skills?: Record<string, number>
  aptitudes?: Record<string, number>
  singularidades?: string[]
  singularidadesEcoar?: string[]
  singularidadesMarciais?: string[]
  singularidadesRaciais?: string[]
  desvantagens?: string[]
  pontosCriacao: {
    obtidos: number
    gastos: number
    disponiveis: number
  }
  nome: string
  backstory?: string
  tracoPositivo?: string
  tracoNegativo?: string
  personalidade?: string
  ideais?: string
  vinculos?: string
  defeitos?: string
  equipamentos: string[]
  armas: string[]
  itensCatalogo?: CatalogOwnedItem[]
  saldoMoedas?: number
  equipamentosLivres?: string[]
  armasLivres?: string[]
  moeda?: string
  [key: string]: unknown
}

export interface WizardStepNavigationProps {
  onNext?: () => void
  onBack?: () => void
  canProceed?: boolean
  isFirstStep?: boolean
  isLastStep?: boolean
}

export type CharacterFlowFromMesa = {
  fromMesa?: string
}
