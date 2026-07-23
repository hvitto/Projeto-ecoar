import { describe, expect, it } from 'vitest'
import {
  applyWeaponDurabilityQuality,
  clampEquipmentQualityNivel,
  computeOwnedEquipmentCostCeros,
  costDeltaForQualityChange,
  getWeaponQualityCombatModifiers,
} from '@/lib/equipmentQuality'

describe('equipmentQuality', () => {
  it('aplica multiplicadores da tabela de qualidade', () => {
    expect(computeOwnedEquipmentCostCeros({ baseCeros: 1000, qualidadeNivel: -1 })).toBe(500)
    expect(computeOwnedEquipmentCostCeros({ baseCeros: 1000, qualidadeNivel: 0 })).toBe(1000)
    expect(computeOwnedEquipmentCostCeros({ baseCeros: 1000, qualidadeNivel: 1 })).toBe(2000)
    expect(computeOwnedEquipmentCostCeros({ baseCeros: 1000, qualidadeNivel: 2 })).toBe(3000)
    expect(computeOwnedEquipmentCostCeros({ baseCeros: 1000, qualidadeNivel: 4 })).toBe(5000)
  })

  it('aplica banho de prata antes da qualidade', () => {
    expect(
      computeOwnedEquipmentCostCeros({
        baseCeros: 1000,
        qualidadeNivel: 1,
        banhadoPrata: true,
      }),
    ).toBe(3000)
  })

  it('cobra apenas o delta ao subir qualidade', () => {
    expect(
      costDeltaForQualityChange({
        baseCeros: 1150,
        fromNivel: 0,
        toNivel: 2,
      }),
    ).toBe(2300)
  })

  it('aplica modificadores de combate em armas', () => {
    expect(getWeaponQualityCombatModifiers(2)).toEqual({
      attackBonus: 2,
      maxDamageBonus: 10,
      durabilityBonus: 2,
      penetracaoBonus: 2,
      infiniteDurability: false,
    })
    expect(getWeaponQualityCombatModifiers(4).infiniteDurability).toBe(true)
  })

  it('ajusta durabilidade e clampa níveis', () => {
    expect(applyWeaponDurabilityQuality('1', 2)).toBe('3')
    expect(applyWeaponDurabilityQuality('5', 4)).toBe('∞')
    expect(clampEquipmentQualityNivel(99)).toBe(4)
    expect(clampEquipmentQualityNivel(-9)).toBe(-1)
  })
})
