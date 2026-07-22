import type { SystemSingularityActivationType } from '@/lib/systemSingularities'

export type SingularityNumericBonuses = {
  attributes: Record<string, number>
  skills: Record<string, number>
  corpo: number
  mente: number
  folego: number
  mana: number
  attack: number
  damage: number
  penetration: number
  crit: number
  maxDamage: number
}

export type SingularityConditionalEffect = {
  id: string
  label: string
  bonuses: SingularityNumericBonuses
}

export type SingularityEffectChannels = {
  passivos: SingularityNumericBonuses
  condicionais: SingularityConditionalEffect[]
}

export function emptyNumericBonuses(): SingularityNumericBonuses {
  return {
    attributes: {},
    skills: {},
    corpo: 0,
    mente: 0,
    folego: 0,
    mana: 0,
    attack: 0,
    damage: 0,
    penetration: 0,
    crit: 0,
    maxDamage: 0,
  }
}

export function emptyEffectChannels(): SingularityEffectChannels {
  return {
    passivos: emptyNumericBonuses(),
    condicionais: [],
  }
}

export function hasAnyNumericBonus(b: SingularityNumericBonuses | null | undefined): boolean {
  if (!b) return false
  return (
    Object.keys(b.attributes).length > 0 ||
    Object.keys(b.skills).length > 0 ||
    b.corpo !== 0 ||
    b.mente !== 0 ||
    b.folego !== 0 ||
    b.mana !== 0 ||
    b.attack !== 0 ||
    b.damage !== 0 ||
    b.penetration !== 0 ||
    b.crit !== 0 ||
    b.maxDamage !== 0
  )
}

export function mergeNumericBonuses(
  into: SingularityNumericBonuses,
  add: SingularityNumericBonuses,
): SingularityNumericBonuses {
  for (const [k, v] of Object.entries(add.attributes)) {
    into.attributes[k] = (into.attributes[k] ?? 0) + v
  }
  for (const [k, v] of Object.entries(add.skills)) {
    into.skills[k] = (into.skills[k] ?? 0) + v
  }
  into.corpo += add.corpo
  into.mente += add.mente
  into.folego += add.folego
  into.mana += add.mana
  into.attack += add.attack
  into.damage += add.damage
  into.penetration += add.penetration
  into.crit += add.crit
  into.maxDamage += add.maxDamage
  return into
}

export function cloneNumericBonuses(b: SingularityNumericBonuses): SingularityNumericBonuses {
  return {
    attributes: { ...b.attributes },
    skills: { ...b.skills },
    corpo: b.corpo,
    mente: b.mente,
    folego: b.folego,
    mana: b.mana,
    attack: b.attack,
    damage: b.damage,
    penetration: b.penetration,
    crit: b.crit,
    maxDamage: b.maxDamage,
  }
}

/**
 * Distribui bônus numéricos nos canais da planilha:
 * - passivos: sempre na ficha
 * - condicionais: só com toggle (Ativa? da planilha)
 * - ativa: ação/reação — não altera números permanentes
 * - complexa com números flat: trata como passivo (evita silenciar bônus mal classificados)
 */
export function buildEffectChannels(args: {
  singularityId: string
  name?: string
  activationType: SystemSingularityActivationType
  bonuses: SingularityNumericBonuses
  conditionalEffects?: SingularityConditionalEffect[]
}): SingularityEffectChannels {
  if (args.conditionalEffects && args.conditionalEffects.length > 0) {
    const passivos = emptyNumericBonuses()
    const condicionais: SingularityConditionalEffect[] = []
    if (hasAnyNumericBonus(args.bonuses) && args.activationType === 'passiva') {
      mergeNumericBonuses(passivos, args.bonuses)
    } else if (hasAnyNumericBonus(args.bonuses) && args.activationType === 'condicional') {
      condicionais.push({
        id: args.singularityId,
        label: args.name?.trim() || 'Efeito condicional',
        bonuses: cloneNumericBonuses(args.bonuses),
      })
    } else if (hasAnyNumericBonus(args.bonuses) && args.activationType !== 'ativa') {
      mergeNumericBonuses(passivos, args.bonuses)
    }
    for (const fx of args.conditionalEffects) {
      condicionais.push({
        id: fx.id,
        label: fx.label,
        bonuses: cloneNumericBonuses(fx.bonuses),
      })
    }
    return { passivos, condicionais }
  }

  if (!hasAnyNumericBonus(args.bonuses)) return emptyEffectChannels()

  if (args.activationType === 'ativa') {
    return emptyEffectChannels()
  }

  if (args.activationType === 'condicional') {
    return {
      passivos: emptyNumericBonuses(),
      condicionais: [
        {
          id: args.singularityId,
          label: args.name?.trim() || 'Efeito condicional',
          bonuses: cloneNumericBonuses(args.bonuses),
        },
      ],
    }
  }

  return {
    passivos: cloneNumericBonuses(args.bonuses),
    condicionais: [],
  }
}

export function isConditionalEffectEnabled(
  effectId: string,
  singularityId: string,
  enabledIds: Set<string>,
): boolean {
  return enabledIds.has(effectId) || enabledIds.has(singularityId)
}
