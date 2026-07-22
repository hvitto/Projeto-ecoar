import { describe, expect, it } from 'vitest'
import { resolveWeaponAttackAutoText } from './equippedWeaponAttack'
import type { WeaponCatalogEntry } from '@/shared/types/equipment'

const arco = {
  id: 'weapon.arco-guerra',
  kind: 'weapon',
  name: 'Arco de Guerra',
  macroSection: 'arqueria',
  attackTest: 'Finesse + Pontaria (Arqueria)',
} as WeaponCatalogEntry

describe('resolveWeaponAttackAutoText', () => {
  it('usa mod efetivo e bônus de perícia/ataque no total', () => {
    const text = resolveWeaponAttackAutoText({
      entry: arco,
      characterData: {
        finesse: { mod: 1 },
        skills: { pontaria: { level: 4, specialization: 'arqueira' } },
      },
      getAttributeMod: () => 3,
      getSkillBonus: (id) => (id === 'pontaria' ? 2 : 0),
      extraAttackBonus: 1,
    })
    expect(text).toBe('1d12 + 6')
  })

  it('cai no mod armazenado quando não há getAttributeMod', () => {
    const text = resolveWeaponAttackAutoText({
      entry: arco,
      characterData: {
        finesse: { mod: 2 },
        skills: { pontaria: { level: 3 } },
      },
    })
    expect(text).toBe('1d10 + 2')
  })
})
