import type { SimpleBonusesAggregate } from '@/lib/systemSingularities'
import { emptyNumericBonuses } from '@/lib/singularityEffectChannels'

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function norm(s: string): string {
  return stripDiacritics(s).toLowerCase()
}

function addToMap(map: Record<string, number>, key: string, delta: number) {
  if (!delta) return
  map[key] = (map[key] ?? 0) + delta
}

const attributeNameToKey: Array<[RegExp, string]> = [
  [/forca/, 'forca'],
  [/carisma/, 'carisma'],
  [/finesse/, 'finesse'],
  [/inteligencia/, 'inteligencia'],
  [/percepcao/, 'percepcao'],
  [/vitalidade/, 'vitalidade'],
  [/vontade/, 'vontade'],
]

function inferAttributeKeyFromText(text: string): string | null {
  const t = norm(text)
  for (const [re, key] of attributeNameToKey) {
    if (re.test(t)) return key
  }
  return null
}

function inferCommonSkillKeyFromText(text: string): string | null {
  const t = norm(text)
  if (t.includes('atencao') || t.includes('arredores')) return 'atencao'
  if (t.includes('raciocinio') || t.includes('iniciativa')) return 'raciocinio'
  if (t.includes('reflexos') || t.includes('esquiva')) return 'reflexos'
  if (t.includes('compostura') || t.includes('coragem')) return 'compostura'
  if (t.includes('furtividade')) return 'furtividade'
  if (t.includes('pontaria')) return 'pontaria'
  if (t.includes('atletismo')) return 'atletismo'
  return null
}

export function extractSimpleBonusesFromMartialText(args: {
  description: string
  effects?: string
}): SimpleBonusesAggregate {
  const parts = [args.description ?? '', args.effects ?? '']
    .map((p) => p.trim())
    .filter(Boolean)
  const text = Array.from(new Set(parts)).join('\n')
  const out = emptyNumericBonuses()

  const attrPatterns = [
    /b[oó]nus\s+de\s+([+-]?\d+)\s+(?:no\s+seu|em\s+seu)\s+modificador\s+de\s+([a-zà-ÿA-ZÀ-ÿ ]+)/gi,
    /incremento\s+de\s+([+-]?\d+)\s+em\s+seu\s+modificador\s+de\s+([a-zà-ÿA-ZÀ-ÿ ]+)/gi,
    /b[oó]nus\s+de\s+([+-]?\d+)\s+no\s+seu\s+modificador\s+de\s+([a-zà-ÿA-ZÀ-ÿ ]+)/gi,
    /b[oó]nus\s+de\s+([+-]?\d+)\s+em\s+seu\s+modificador\s+de\s+([a-zà-ÿA-ZÀ-ÿ ]+)/gi,
  ]

  for (const re of attrPatterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const delta = parseInt(m[1], 10)
      const attrKey = inferAttributeKeyFromText(m[2] ?? '')
      if (!Number.isFinite(delta) || !attrKey) continue
      addToMap(out.attributes, attrKey, delta)
    }
  }

  const bodyMindPatterns = [
    /incremento\s+de\s+([+-]?\d+)\s+em\s+(corpo|mente|f[oó]lego|mana)\b/gi,
    /b[oó]nus\s+de\s+([+-]?\d+)\s+em\s+(corpo|mente|f[oó]lego|mana)\b/gi,
    /redu[cç][aã]o\s+de\s+([+-]?\d+)\s+em\s+(corpo|mente|f[oó]lego|mana)\b/gi,
  ]
  for (const re of bodyMindPatterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      let delta = parseInt(m[1], 10)
      if (!Number.isFinite(delta)) continue
      if (/redu/i.test(m[0]) && delta > 0) delta = -delta
      const rawKey = norm(m[2])
      if (rawKey.includes('corpo')) out.corpo += delta
      else if (rawKey.includes('mente')) out.mente += delta
      else if (rawKey.includes('folego')) out.folego += delta
      else if (rawKey.includes('mana')) out.mana += delta
    }
  }

  const skillTestRe =
    /(?:b[oó]nus|penalidade)\s+de\s+([+-]?\d+)\s+em\s+testes?\s+(?:da\s+habilidade\s+|de\s+)?([a-zà-ÿA-ZÀ-ÿ ()]+)/gi
  let match: RegExpExecArray | null
  while ((match = skillTestRe.exec(text)) !== null) {
    let delta = parseInt(match[1], 10)
    if (!Number.isFinite(delta)) continue
    if (/penalidade/i.test(match[0]) && delta > 0) delta = -delta
    const skillKey = inferCommonSkillKeyFromText(match[2] ?? '')
    if (!skillKey) continue
    addToMap(out.skills, skillKey, delta)
  }

  const dodgeRe = /b[oó]nus\s+de\s+([+-]?\d+)\s+em\s+esquiva\b/gi
  while ((match = dodgeRe.exec(text)) !== null) {
    const delta = parseInt(match[1], 10)
    if (!Number.isFinite(delta)) continue
    addToMap(out.skills, 'reflexos', delta)
  }

  const attackRe =
    /(?:b[oó]nus\s+de\s+)?([+-]?\d+)\s+em\s+(?:todos\s+os\s+)?testes?\s+de\s+ataques?\b/gi
  while ((match = attackRe.exec(text)) !== null) {
    const delta = parseInt(match[1], 10)
    if (!Number.isFinite(delta)) continue
    if (Math.abs(delta) > Math.abs(out.attack)) out.attack = delta
  }

  const damageRe = /(?:b[oó]nus\s+de\s+)?([+-]?\d+)\s+em\s+c[aá]lculos?\s+de\s+dano\b/gi
  while ((match = damageRe.exec(text)) !== null) {
    const delta = parseInt(match[1], 10)
    if (!Number.isFinite(delta)) continue
    if (Math.abs(delta) > Math.abs(out.damage)) out.damage = delta
  }

  const penRe = /(?:b[oó]nus\s+de\s+)?([+-]?\d+)\s+em\s+penetra[cç][aã]o/gi
  while ((match = penRe.exec(text)) !== null) {
    const delta = parseInt(match[1], 10)
    if (!Number.isFinite(delta)) continue
    if (Math.abs(delta) > Math.abs(out.penetration)) out.penetration = delta
  }

  const critRe = /(?:b[oó]nus\s+de\s+)?([+-]?\d+)\s+em\s+acerto\s+cr[ií]tico/gi
  while ((match = critRe.exec(text)) !== null) {
    const delta = parseInt(match[1], 10)
    if (!Number.isFinite(delta)) continue
    if (Math.abs(delta) > Math.abs(out.crit)) out.crit = delta
  }

  const maxDmgRe = /(?:b[oó]nus\s+de\s+|incremento\s+de\s+)?([+-]?\d+)\s+em\s+dano\s+m[aá]ximo/gi
  while ((match = maxDmgRe.exec(text)) !== null) {
    const delta = parseInt(match[1], 10)
    if (!Number.isFinite(delta)) continue
    if (Math.abs(delta) > Math.abs(out.maxDamage)) out.maxDamage = delta
  }

  return out
}
