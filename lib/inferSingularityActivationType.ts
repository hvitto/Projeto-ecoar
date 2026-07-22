import type { SystemSingularityActivationType, SystemSingularityKind } from '@/lib/systemSingularities'
import { hasAnyNumericBonus, type SingularityNumericBonuses } from '@/lib/singularityEffectChannels'

function includesAny(haystack: string, needles: string[]): boolean {
  const t = haystack.toLowerCase()
  return needles.some((n) => t.includes(n))
}

function hasStructuredNumericBonuses(bonuses: unknown, penalties: unknown): boolean {
  if (bonuses && typeof bonuses === 'object') {
    const b = bonuses as Partial<SingularityNumericBonuses> & {
      attributes?: Record<string, number>
      skills?: Record<string, number>
    }
    if (hasAnyNumericBonus({
      attributes: b.attributes ?? {},
      skills: b.skills ?? {},
      corpo: typeof b.corpo === 'number' ? b.corpo : 0,
      mente: typeof b.mente === 'number' ? b.mente : 0,
      folego: typeof b.folego === 'number' ? b.folego : 0,
      mana: typeof b.mana === 'number' ? b.mana : 0,
      attack: typeof b.attack === 'number' ? b.attack : 0,
      damage: typeof b.damage === 'number' ? b.damage : 0,
      penetration: typeof b.penetration === 'number' ? b.penetration : 0,
      crit: typeof b.crit === 'number' ? b.crit : 0,
      maxDamage: typeof b.maxDamage === 'number' ? b.maxDamage : 0,
    })) {
      return true
    }
  }
  if (penalties && typeof penalties === 'object') {
    const p = penalties as { attributes?: Record<string, number>; skills?: Record<string, number> }
    if (Object.keys(p.attributes ?? {}).length > 0 || Object.keys(p.skills ?? {}).length > 0) return true
  }
  return false
}

/**
 * Classifica tipo primário para UI/catálogo.
 * Bônus numéricos estruturados sem linguagem de ação → passiva (não silencia na ficha).
 * "Ativa?" da planilha = toggle de condicional; aqui `ativa` = efeito de ação/reação.
 */
export function inferSingularityActivationType(args: {
  kind: SystemSingularityKind
  name?: string
  description: string
  effects?: string
  bonuses?: unknown
  penalties?: unknown
}): SystemSingularityActivationType {
  const text = `${args.name ?? ''} ${args.description ?? ''} ${args.effects ?? ''}`.toLowerCase()
  const structured = hasStructuredNumericBonuses(args.bonuses, args.penalties)

  const isAction = includesAny(text, [
    'com uma ação',
    'ação completa',
    'ação menor',
    'ação curta',
    'ação longa',
    'reação e sacrificando',
    'sacrificando 1 ponto de mana',
    'com uma reação',
  ])

  if (isAction && !structured) return 'ativa'
  if (isAction && structured) {
    if (includesAny(text, ['enquanto', 'quando ', 'sempre que'])) return 'condicional'
    return 'passiva'
  }

  if (structured && !includesAny(text, ['enquanto', 'quando ', 'caso você', 'se estiver', 'ao atacar'])) {
    return 'passiva'
  }

  if (
    includesAny(text, [
      'placeholder',
      'tabela de',
      'teste resistido',
      'expurg',
    ])
  ) {
    if (includesAny(text, ['enquanto', 'quando ', 'sempre'])) return 'condicional'
    if (structured) return 'passiva'
    return 'complexa'
  }

  if (includesAny(text, ['enquanto', 'quando ', 'caso você', 'se estiver', 'ao atacar', 'sempre que'])) {
    return 'condicional'
  }

  if (structured) return 'passiva'

  return 'passiva'
}
