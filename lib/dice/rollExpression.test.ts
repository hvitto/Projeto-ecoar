import { describe, expect, it } from 'vitest'
import { normalizeDiceExpression, rollExpression } from './rollExpression'

describe('normalizeDiceExpression', () => {
  it('remove espaços e normaliza menos tipográfico', () => {
    expect(normalizeDiceExpression('1d12 + 3')).toBe('1d12+3')
    expect(normalizeDiceExpression('1d4−1')).toBe('1d4-1')
  })
})

describe('rollExpression', () => {
  it('rola 1d12+mod e retorna total finito', () => {
    const r = rollExpression('1d12 + 6')
    expect(r.normalized).toBe('1d12+6')
    expect(r.faces).toHaveLength(1)
    expect(r.dice[0].sides).toBe(12)
    expect(r.faces[0]).toBeGreaterThanOrEqual(1)
    expect(r.faces[0]).toBeLessThanOrEqual(12)
    expect(r.total).toBe(r.faces[0] + 6)
    expect(r.detail).toContain('=')
  })

  it('rola 1d12+1d4', () => {
    const r = rollExpression('1d12+1d4')
    expect(r.dice).toHaveLength(2)
    expect(r.dice[0].sides).toBe(12)
    expect(r.dice[1].sides).toBe(4)
    expect(r.total).toBe(r.faces[0] + r.faces[1])
  })

  it('rola 1d4-1', () => {
    const r = rollExpression('1d4-1')
    expect(r.dice).toHaveLength(1)
    expect(r.dice[0].sides).toBe(4)
    expect(r.total).toBe(r.faces[0] - 1)
  })

  it('rejeita expressão vazia', () => {
    expect(() => rollExpression('   ')).toThrow()
  })
})
