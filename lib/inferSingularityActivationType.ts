import type { SystemSingularityActivationType, SystemSingularityKind } from '@/lib/systemSingularities'

function includesAny(haystack: string, needles: string[]): boolean {
  const t = haystack.toLowerCase()
  return needles.some((n) => t.includes(n))
}

/**
 * Classifica `activationType` quando o dado não possui campo estruturado.
 *
 * Heurística (conservadora):
 * - "com uma ação" / "ação completa" / "ação menor" => ativa
 * - "enquanto" / "se " / "quando " => condicional
 * - padrões de efeito procedural/indireto ("teste resistido", "tabela", "placeholder") => complexa
 * - caso contrário => passiva
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

  // Complexa: conteúdo altamente procedural/narrativo ou ainda não implementado.
  if (
    includesAny(text, [
      'placeholder',
      'tabela',
      'teste resistido',
      'resistido',
      'expurg',
      'marcação',
      'condição',
    ])
  ) {
    // Ainda assim, se houver sinais fortes de "ação" pode virar "ativa"
    if (
      includesAny(text, ['ação completa', 'ação menor', 'ação curta', 'ação longa', 'com uma ação', 'com uma ação menor'])
    ) {
      return 'ativa'
    }
    // Condicionais geralmente têm "enquanto/se/quando" mesmo em textos complexos.
    if (includesAny(text, ['enquanto', 'se ', 'quando ', 'sempre'])) return 'condicional'
    return 'complexa'
  }

  // Ativa: explicitamente ação ou gatilho de uso.
  if (
    includesAny(text, [
      'com uma ação',
      'ação completa',
      'ação menor',
      'ação curta',
      'ação longa',
      'reação e sacrificando',
      'sacrificando 1 ponto de mana',
    ])
  ) {
    return 'ativa'
  }

  // Condicional: duração por gatilho temporal/estado.
  if (includesAny(text, ['enquanto', 'se ', 'quando ', 'seja', 'sempre'])) {
    return 'condicional'
  }

  return 'passiva'
}

