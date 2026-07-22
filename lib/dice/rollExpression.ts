import { DiceRoll } from '@dice-roller/rpg-dice-roller'

export type DiceFaceResult = {
  sides: number
  value: number
}

export type DiceRollResult = {
  expression: string
  normalized: string
  total: number
  faces: number[]
  dice: DiceFaceResult[]
  detail: string
}

export function normalizeDiceExpression(input: string): string {
  return String(input ?? '')
    .trim()
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, '')
}

function parseDiceGroups(normalized: string): Array<{ count: number; sides: number }> {
  const groups: Array<{ count: number; sides: number }> = []
  const re = /(\d*)d(\d+)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(normalized)) !== null) {
    const count = m[1] ? parseInt(m[1], 10) : 1
    const sides = parseInt(m[2], 10)
    if (Number.isFinite(count) && count > 0 && Number.isFinite(sides) && sides > 0) {
      groups.push({ count, sides })
    }
  }
  return groups
}

function extractFaceValues(roll: DiceRoll): number[][] {
  const groups: number[][] = []
  const json = JSON.parse(JSON.stringify(roll.toJSON())) as { rolls?: unknown[]; output?: string }
  const rolls = json.rolls
  if (Array.isArray(rolls)) {
    for (const node of rolls) {
      if (!node || typeof node !== 'object') continue
      const n = node as { type?: string; rolls?: unknown[] }
      if (n.type !== 'roll-results' || !Array.isArray(n.rolls)) continue
      const values: number[] = []
      for (const face of n.rolls) {
        if (typeof face === 'number') values.push(face)
        else if (face && typeof face === 'object' && typeof (face as { value?: unknown }).value === 'number') {
          values.push((face as { value: number }).value)
        }
      }
      if (values.length > 0) groups.push(values)
    }
  }

  if (groups.length === 0 && typeof json.output === 'string') {
    const bracketRe = /\[([^\]]+)\]/g
    let m: RegExpExecArray | null
    while ((m = bracketRe.exec(json.output)) !== null) {
      const values = m[1]
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n))
      if (values.length > 0) groups.push(values)
    }
  }

  return groups
}

export function rollExpression(expression: string): DiceRollResult {
  const normalized = normalizeDiceExpression(expression)
  if (!normalized) {
    throw new Error('Expressão de dados vazia')
  }

  const roll = new DiceRoll(normalized)
  const notationGroups = parseDiceGroups(normalized)
  const valueGroups = extractFaceValues(roll)

  const dice: DiceFaceResult[] = []
  const groupCount = Math.max(notationGroups.length, valueGroups.length)
  for (let i = 0; i < groupCount; i++) {
    const sides = notationGroups[i]?.sides ?? 20
    const values = valueGroups[i] ?? []
    for (const value of values) {
      dice.push({ sides, value })
    }
  }

  const faces = dice.map((d) => d.value)
  const total = typeof roll.total === 'number' ? roll.total : Number(roll.total)
  if (!Number.isFinite(total)) {
    throw new Error('Não foi possível calcular o total da rolagem')
  }

  const detail = String(roll.output ?? `${normalized} = ${total}`)

  return {
    expression: String(expression).trim(),
    normalized,
    total,
    faces,
    dice,
    detail,
  }
}
