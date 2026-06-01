import { WIZARD_TOTAL_STEPS } from '@/features/character/constants/wizardSteps'

export const WIZARD_LAST_STEP = WIZARD_TOTAL_STEPS

export interface WizardNavigationState {
  currentStep: number
  maxStepVisited: number
}

export type WizardNavigationAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'VISIT_STEP'; step: number }
  | { type: 'RESET' }

export const initialWizardNavigationState: WizardNavigationState = {
  currentStep: 0,
  maxStepVisited: 0,
}

export function wizardNavigationReducer(
  state: WizardNavigationState,
  action: WizardNavigationAction,
): WizardNavigationState {
  switch (action.type) {
    case 'SET_STEP': {
      const step = clampStep(action.step)
      return {
        currentStep: step,
        maxStepVisited: Math.max(state.maxStepVisited, step),
      }
    }
    case 'NEXT': {
      if (state.currentStep >= WIZARD_LAST_STEP) return state
      const next = state.currentStep + 1
      return {
        currentStep: next,
        maxStepVisited: Math.max(state.maxStepVisited, next),
      }
    }
    case 'BACK': {
      if (state.currentStep <= 0) return state
      return { ...state, currentStep: state.currentStep - 1 }
    }
    case 'VISIT_STEP': {
      const step = clampStep(action.step)
      if (step > state.maxStepVisited && step !== state.currentStep) {
        return state
      }
      return { currentStep: step, maxStepVisited: Math.max(state.maxStepVisited, step) }
    }
    case 'RESET':
      return initialWizardNavigationState
    default:
      return state
  }
}

function clampStep(step: number): number {
  if (!Number.isFinite(step)) return 0
  return Math.min(WIZARD_LAST_STEP, Math.max(0, Math.floor(step)))
}

export interface StepValidationInput {
  selectedRaca: string
  attributes: Record<string, number>
  attributePoints: number
  skillPoints: number
  nome: string
  equipmentSaldoRestante: number
}

/** Validação pura de `canProceed` por etapa (espelha o wizard). */
export function canProceedForStep(step: number, input: StepValidationInput): boolean {
  switch (step) {
    case 0:
      return Boolean(input.selectedRaca)
    case 1:
      return (
        Object.values(input.attributes).every((a) => a >= 0 && a <= 3) &&
        input.attributePoints === 0
      )
    case 2:
      return input.skillPoints === 0
    case 3:
    case 4:
    case 5:
      return true
    case 6:
      return input.equipmentSaldoRestante >= 0
    case 7:
      return input.nome.trim() !== ''
    default:
      return false
  }
}

export function canAdvanceStep(
  state: WizardNavigationState,
  canProceed: boolean,
): boolean {
  return canProceed && state.currentStep < WIZARD_LAST_STEP
}
