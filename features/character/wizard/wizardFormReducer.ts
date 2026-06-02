import {
  createInitialWizardFormState,
  type WizardFormState,
  type WizardPontosCriacao,
} from '@/features/character/wizard/wizardFormTypes'

export type WizardFormAction =
  | { type: 'PATCH'; patch: Partial<WizardFormState> }
  | { type: 'SET_PONTOS_CRIACAO'; pontosCriacao: WizardPontosCriacao }
  | { type: 'SET_PONTOS_CRIACAO_GASTOS'; gastos: number }
  | { type: 'RESET'; state?: WizardFormState }
  | { type: 'CLEAR_PATH_ON_TRILHA_CHANGE'; trilha: string }

export function wizardFormReducer(state: WizardFormState, action: WizardFormAction): WizardFormState {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.patch }
    case 'SET_PONTOS_CRIACAO':
      return { ...state, pontosCriacao: action.pontosCriacao }
    case 'SET_PONTOS_CRIACAO_GASTOS': {
      const { obtidos } = state.pontosCriacao
      const gastos = action.gastos
      const disponiveis = obtidos - gastos
      if (state.pontosCriacao.gastos === gastos && state.pontosCriacao.disponiveis === disponiveis) {
        return state
      }
      return { ...state, pontosCriacao: { obtidos, gastos, disponiveis } }
    }
    case 'CLEAR_PATH_ON_TRILHA_CHANGE':
      if (action.trilha === state.selectedTrilha) return state
      return {
        ...state,
        selectedTrilha: action.trilha,
        pathSingularityBase: '',
        pathBruxarias: [],
        pathCacadaPowers: [],
        pathCacadaEnhancements: [],
      }
    case 'RESET':
      return action.state ?? createInitialWizardFormState()
    default:
      return state
  }
}

export { createInitialWizardFormState }
