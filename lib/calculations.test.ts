import { describe, expect, it } from 'vitest'
import {
  calculateCharacterLimits,
  calculateCorpoMax,
  calculateEspiritoMax,
  calculateFolegoMax,
  calculateManaMax,
  calculateMenteMax,
  formatDiceWithModifier,
  getAptitudeDice,
  getSkillDice,
  toLimitShape,
} from './calculations'

describe('getSkillDice', () => {
  it('segue a tabela da ficha oficial (habilidades)', () => {
    expect(getSkillDice(0)).toBe('1d4')
    expect(getSkillDice(1)).toBe('1d6')
    expect(getSkillDice(2)).toBe('1d8')
    expect(getSkillDice(3)).toBe('1d10')
    expect(getSkillDice(4)).toBe('1d12')
    expect(getSkillDice(5)).toBe('1d12+1d4')
    expect(getSkillDice(6)).toBe('1d20+1')
    expect(getSkillDice(7)).toBe('1d20+1d6')
    expect(getSkillDice(8)).toBe('1d20+1d8')
  })
})

describe('getAptitudeDice', () => {
  it('mantém a tabela de aptidões (nível 0 = 1d4-1)', () => {
    expect(getAptitudeDice(0)).toBe('1d4-1')
    expect(getAptitudeDice(1)).toBe('1d4')
    expect(getAptitudeDice(4)).toBe('1d10')
    expect(getAptitudeDice(5)).toBe('1d12')
  })
})

describe('formatDiceWithModifier', () => {
  it('formata como na ficha oficial', () => {
    expect(formatDiceWithModifier('1d10', 2)).toBe('1d10 + 2')
    expect(formatDiceWithModifier('1d10', 6)).toBe('1d10 + 6')
    expect(formatDiceWithModifier('1d6', 0)).toBe('1d6')
    expect(formatDiceWithModifier('1d10', -1)).toBe('1d10 - 1')
  })
})

describe('calculateCorpoMax', () => {
  it('aplica (Vitalidade + Nível de Poder) x 3', () => {
    expect(calculateCorpoMax(0, 3)).toBe(9)
    expect(calculateCorpoMax(2, 3)).toBe(15)
  })
})

describe('calculateMenteMax', () => {
  it('aplica (Vontade + Nível de Poder) x 3', () => {
    expect(calculateMenteMax(0, 3)).toBe(9)
    expect(calculateMenteMax(1, 3)).toBe(12)
  })
})

describe('calculateFolegoMax', () => {
  it('aplica Corpo x 2', () => {
    expect(calculateFolegoMax(9)).toBe(18)
    expect(calculateFolegoMax(15)).toBe(30)
  })
})

describe('calculateManaMax', () => {
  it('aplica Mente x 2', () => {
    expect(calculateManaMax(9)).toBe(18)
    expect(calculateManaMax(12)).toBe(24)
  })
})

describe('calculateCharacterLimits', () => {
  it('calcula limites base sem bônus flat', () => {
    expect(
      calculateCharacterLimits({
        vitalidade: 0,
        vontade: 0,
        nivelPoder: 3,
      }),
    ).toEqual({
      corpoMax: 9,
      menteMax: 9,
      folegoMax: 18,
      manaMax: 18,
    })
  })

  it('calcula limites com atributos elevados', () => {
    expect(
      calculateCharacterLimits({
        vitalidade: 2,
        vontade: 1,
        nivelPoder: 3,
      }),
    ).toEqual({
      corpoMax: 15,
      menteMax: 12,
      folegoMax: 30,
      manaMax: 24,
    })
  })

  it('soma bônus flat após fórmulas base', () => {
    expect(
      calculateCharacterLimits({
        vitalidade: 2,
        vontade: 1,
        nivelPoder: 3,
        corpoBonus: 2,
        folegoBonus: 4,
      }),
    ).toEqual({
      corpoMax: 17,
      menteMax: 12,
      folegoMax: 38,
      manaMax: 24,
    })
  })
})

describe('toLimitShape', () => {
  it('usa max como atual quando atual não informado', () => {
    expect(toLimitShape(30)).toEqual({ atual: 30, max: 30 })
  })

  it('preserva atual informado', () => {
    expect(toLimitShape(30, 12)).toEqual({ atual: 12, max: 30 })
  })
})

describe('calculateEspiritoMax', () => {
  it('aplica Nível de Poder × 15 (Geist)', () => {
    expect(calculateEspiritoMax(4)).toBe(60)
  })
})
