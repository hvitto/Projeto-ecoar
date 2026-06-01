import { describe, expect, it } from 'vitest'
import {
  canProceedForStep,
  canAdvanceStep,
  initialWizardNavigationState,
  wizardNavigationReducer,
  WIZARD_LAST_STEP,
} from './wizardReducer'

const baseValidation = {
  selectedRaca: 'humano',
  attributes: { carisma: 0, finesse: 0, forca: 0, inteligencia: 0, percepcao: 0, vitalidade: 0, vontade: 0 },
  attributePoints: 0,
  skillPoints: 0,
  nome: 'Teste',
  equipmentSaldoRestante: 10,
}

describe('wizardNavigationReducer', () => {
  it('avança e atualiza maxStepVisited', () => {
    const next = wizardNavigationReducer(initialWizardNavigationState, { type: 'NEXT' })
    expect(next.currentStep).toBe(1)
    expect(next.maxStepVisited).toBe(1)
  })

  it('não avança além do último passo', () => {
    let state = { currentStep: WIZARD_LAST_STEP, maxStepVisited: WIZARD_LAST_STEP }
    state = wizardNavigationReducer(state, { type: 'NEXT' })
    expect(state.currentStep).toBe(WIZARD_LAST_STEP)
  })

  it('volta um passo', () => {
    const state = wizardNavigationReducer(
      { currentStep: 2, maxStepVisited: 2 },
      { type: 'BACK' },
    )
    expect(state.currentStep).toBe(1)
  })

  it('reseta para o estado inicial', () => {
    const state = wizardNavigationReducer(
      { currentStep: 5, maxStepVisited: 5 },
      { type: 'RESET' },
    )
    expect(state).toEqual(initialWizardNavigationState)
  })
})

describe('canProceedForStep', () => {
  it('exige raça no passo 0', () => {
    expect(canProceedForStep(0, { ...baseValidation, selectedRaca: '' })).toBe(false)
    expect(canProceedForStep(0, baseValidation)).toBe(true)
  })

  it('exige atributos válidos e pontos zerados no passo 1', () => {
    expect(canProceedForStep(1, { ...baseValidation, attributePoints: 1 })).toBe(false)
    expect(canProceedForStep(1, baseValidation)).toBe(true)
  })

  it('exige nome no passo final', () => {
    expect(canProceedForStep(7, { ...baseValidation, nome: '  ' })).toBe(false)
    expect(canProceedForStep(7, baseValidation)).toBe(true)
  })
})

describe('canAdvanceStep', () => {
  it('só avança se canProceed e não estiver no último passo', () => {
    expect(
      canAdvanceStep({ currentStep: 3, maxStepVisited: 3 }, true),
    ).toBe(true)
    expect(
      canAdvanceStep({ currentStep: WIZARD_LAST_STEP, maxStepVisited: WIZARD_LAST_STEP }, true),
    ).toBe(false)
    expect(
      canAdvanceStep({ currentStep: 2, maxStepVisited: 2 }, false),
    ).toBe(false)
  })
})
