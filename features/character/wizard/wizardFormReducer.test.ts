import { describe, expect, it } from 'vitest'
import { createInitialWizardFormState } from '@/features/character/wizard/wizardFormTypes'
import { wizardFormReducer } from '@/features/character/wizard/wizardFormReducer'

describe('wizardFormReducer', () => {
  it('aplica PATCH parcial', () => {
    const state = createInitialWizardFormState()
    const next = wizardFormReducer(state, { type: 'PATCH', patch: { selectedRaca: 'elf' } })
    expect(next.selectedRaca).toBe('elf')
  })

  it('atualiza gastos de PC sem recriar obtidos', () => {
    const state = createInitialWizardFormState()
    const next = wizardFormReducer(state, { type: 'SET_PONTOS_CRIACAO_GASTOS', gastos: 10 })
    expect(next.pontosCriacao.gastos).toBe(10)
    expect(next.pontosCriacao.disponiveis).toBe(20)
  })

  it('limpa path ao trocar trilha', () => {
    const state = {
      ...createInitialWizardFormState(),
      selectedTrilha: 'a',
      pathSingularityBase: 'x',
      pathBruxarias: ['b'],
    }
    const next = wizardFormReducer(state, { type: 'CLEAR_PATH_ON_TRILHA_CHANGE', trilha: 'c' })
    expect(next.selectedTrilha).toBe('c')
    expect(next.pathSingularityBase).toBe('')
    expect(next.pathBruxarias).toEqual([])
  })
})