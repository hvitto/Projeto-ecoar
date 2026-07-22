import { describe, expect, it } from 'vitest'
import { buildEffectChannels, isConditionalEffectEnabled, emptyNumericBonuses } from './singularityEffectChannels'
import { aggregateSimpleBonuses } from './singularityBonuses'
import { extractSimpleBonusesFromMartialText } from './extractSimpleBonusesFromMartialText'
import { inferSingularityActivationType } from './inferSingularityActivationType'
import type { SystemSingularity } from './systemSingularities'
import { calculateEspiritoMax } from './calculations'

describe('buildEffectChannels', () => {
  it('coloca bônus passivos sempre ativos', () => {
    const bonuses = emptyNumericBonuses()
    bonuses.attributes.finesse = 1
    const channels = buildEffectChannels({
      singularityId: 'agil',
      name: 'Ágil',
      activationType: 'passiva',
      bonuses,
    })
    expect(channels.passivos.attributes.finesse).toBe(1)
    expect(channels.condicionais).toHaveLength(0)
  })

  it('coloca bônus condicionais atrás do toggle Ativa?', () => {
    const bonuses = emptyNumericBonuses()
    bonuses.damage = 2
    const channels = buildEffectChannels({
      singularityId: 'precisao',
      name: 'Precisão',
      activationType: 'condicional',
      bonuses,
    })
    expect(channels.passivos.damage).toBe(0)
    expect(channels.condicionais).toHaveLength(1)
    expect(channels.condicionais[0].id).toBe('precisao')
    expect(channels.condicionais[0].bonuses.damage).toBe(2)
  })

  it('não aplica números permanentes para efeitos ativos (ação)', () => {
    const bonuses = emptyNumericBonuses()
    bonuses.attack = 1
    const channels = buildEffectChannels({
      singularityId: 'frenesi',
      activationType: 'ativa',
      bonuses,
    })
    expect(channels.passivos.attack).toBe(0)
    expect(channels.condicionais).toHaveLength(0)
  })
})

describe('aggregateSimpleBonuses com canais', () => {
  const makeSing = (partial: Partial<SystemSingularity> & Pick<SystemSingularity, 'id' | 'effectChannels'>): SystemSingularity => ({
    kind: 'criacao',
    name: partial.id,
    description: '',
    cost: 0,
    activationType: 'passiva',
    bonusesSimpleExtracted: emptyNumericBonuses(),
    requirements: { kind: 'criacao', conflictWithIds: [] },
    ...partial,
  })

  it('soma passivos sempre e condicionais só quando ligados', () => {
    const passivos = emptyNumericBonuses()
    passivos.attributes.finesse = 1
    const condBonuses = emptyNumericBonuses()
    condBonuses.damage = 2
    const sing = makeSing({
      id: 'mix',
      effectChannels: {
        passivos,
        condicionais: [{ id: 'mix:dano', label: 'Dano', bonuses: condBonuses }],
      },
    })

    const off = aggregateSimpleBonuses({
      selectedSingularityIdsByKind: { criacao: ['mix'], ecoar: [], marciais: [], raciais: [], path: [] },
      conditionalEnabledIdsByKind: { criacao: [], ecoar: [], marciais: [], raciais: [], path: [] },
      getSystemSingularityById: (id) => (id === 'mix' ? sing : undefined),
    })
    expect(off.attributes.finesse).toBe(1)
    expect(off.damage).toBe(0)

    const on = aggregateSimpleBonuses({
      selectedSingularityIdsByKind: { criacao: ['mix'], ecoar: [], marciais: [], raciais: [], path: [] },
      conditionalEnabledIdsByKind: { criacao: ['mix:dano'], ecoar: [], marciais: [], raciais: [], path: [] },
      getSystemSingularityById: (id) => (id === 'mix' ? sing : undefined),
    })
    expect(on.attributes.finesse).toBe(1)
    expect(on.damage).toBe(2)
  })

  it('aceita toggle pelo id da singularidade (compat)', () => {
    expect(isConditionalEffectEnabled('mix:dano', 'mix', new Set(['mix']))).toBe(true)
  })
})

describe('extractSimpleBonusesFromMartialText', () => {
  it('extrai ataque e dano de Armamento Aprimorado', () => {
    const b = extractSimpleBonusesFromMartialText({
      description: 'Você recebe um bônus de +1 em todos os testes de ataques e +2 em cálculos de dano físicos.',
      effects: 'Você recebe um bônus de +1 em todos os testes de ataques e +2 em cálculos de dano físicos, exceto com armas de artilharia.',
    })
    expect(b.attack).toBe(1)
    expect(b.damage).toBe(2)
  })

  it('extrai penetração', () => {
    const b = extractSimpleBonusesFromMartialText({
      description: 'penetração',
      effects: 'Todos os seus ataques recebem um bônus de +2 em Penetração.',
    })
    expect(b.penetration).toBe(2)
  })
})

describe('inferSingularityActivationType', () => {
  it('não silencia bônus estruturados como complexa', () => {
    expect(
      inferSingularityActivationType({
        kind: 'criacao',
        name: 'Ágil',
        description: 'Você recebe um bônus de +1 no seu modificador de Finesse.',
        bonuses: { attributes: { finesse: 1 } },
      }),
    ).toBe('passiva')
  })
})

describe('calculateEspiritoMax', () => {
  it('aplica Nível de Poder × 15', () => {
    expect(calculateEspiritoMax(4)).toBe(60)
    expect(calculateEspiritoMax(0)).toBe(0)
  })
})
