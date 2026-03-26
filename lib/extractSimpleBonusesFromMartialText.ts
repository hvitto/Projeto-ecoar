import type { SimpleBonusesAggregate } from '@/lib/systemSingularities'

function stripDiacritics(s: string): string {
  // Remove acentos deixando apenas caracteres base.
  // Evita flags de Unicode property escapes (ex.: /\\p{Diacritic}/), que dependem de target moderno.
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function norm(s: string): string {
  return stripDiacritics(s).toLowerCase()
}

function pickSignedNumber(s: string): number | null {
  const m = s.match(/([+-]?\d+)/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return Number.isFinite(n) ? n : null
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
  [/percepcao|aten[ck]ao|arredores/, 'percepcao'], // fallback: "Atenção/Arredores" pode ser percepção em certos textos
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

function inferCommonSkillKeyFromText(text: string): 'atencao' | 'raciocinio' | 'reflexos' | 'compostura' | null {
  const t = norm(text)
  if (t.includes('atencao') || t.includes('arredores')) return 'atencao'
  if (t.includes('raciocinio') || t.includes('iniciativa')) return 'raciocinio'
  if (t.includes('reflexos') || t.includes('esquiva')) return 'reflexos'
  if (t.includes('compostura') || t.includes('coragem')) return 'compostura'
  return null
}

/**
 * Tenta extrair bônus simples numéricos de textos marciais.
 * Foco: atributos comuns + testes comuns + incrementos de corpo/mente/folego/mana.
 */
export function extractSimpleBonusesFromMartialText(args: {
  description: string
  effects?: string
}): SimpleBonusesAggregate {
  const text = `${args.description ?? ''}\n${args.effects ?? ''}`
  const t = norm(text)

  const out: SimpleBonusesAggregate = {
    attributes: {},
    skills: {},
    corpo: 0,
    mente: 0,
    folego: 0,
    mana: 0,
  }

  // --- Atributos ---
  // Exemplos:
  // "bônus de +1 no seu modificador de Inteligência"
  // "bônus de +2 em seu modificador de Vox" (não mapeamos tudo)
  const attrPatterns = [
    /b[oó]nus\s+de\s+([+-]?\d+)\s+(?:no\s+seu|em\s+seu|no\s+modificador\s+de|no\s+modificador\s+de)\s+(?:seu\s+)?modificador\s+de\s+([a-zà-ÿA-ZÀ-ÿ ]+)/i,
    /incremento\s+de\s+([+-]?\d+)\s+em\s+seu\s+modificador\s+de\s+([a-zà-ÿA-ZÀ-ÿ ]+)/i,
    /b[oó]nus\s+de\s+([+-]?\d+)\s+no\s+seu\s+modificador\s+de\s+([a-zà-ÿA-ZÀ-ÿ ]+)/i,
    /b[oó]nus\s+de\s+([+-]?\d+)\s+em\s+seu\s+modificador\s+de\s+([a-zà-ÿA-ZÀ-ÿ ]+)/i,
    /b[oó]nus\s+de\s+([+-]?\d+)\s+em\s+([a-zà-ÿA-ZÀ-ÿ ]+)/i,
  ]

  for (const re of attrPatterns) {
    const m = text.match(re)
    if (!m) continue
    // m[1] is number; m[2] is attribute text when captured; else m[2] might be something else.
    const maybeNumber = m[1]
    const maybeAttrText = m[2]
    const delta = parseInt(maybeNumber, 10)
    if (!Number.isFinite(delta) || !maybeAttrText) continue
    const attrKey = inferAttributeKeyFromText(maybeAttrText)
    if (attrKey) addToMap(out.attributes, attrKey, delta)
  }

  // --- Corpo/Mente/Fôlego/Mana ---
  const bodyMindPatterns = [
    /incremento\s+de\s+([+-]?\d+)\s+em\s+(corpo|mente|folego|mana)\b/i,
    /b[oó]nus\s+de\s+([+-]?\d+)\s+em\s+(corpo|mente|folego|mana)\b/i,
    /incremento\s+de\s+([+-]?\d+)\s+em\s+(corpo|mente|f[oó]lego|mana)\b/i,
  ]
  for (const re of bodyMindPatterns) {
    const m = text.match(re)
    if (!m) continue
    const delta = parseInt(m[1], 10)
    const rawKey = norm(m[2])
    if (!Number.isFinite(delta)) continue
    if (rawKey.includes('corpo')) out.corpo += delta
    else if (rawKey.includes('mente')) out.mente += delta
    else if (rawKey.includes('folego')) out.folego += delta
    else if (rawKey.includes('mana')) out.mana += delta
  }

  // --- Testes comuns (Atenção/Arredores, Raciocínio/Iniciativa, Reflexos/Esquiva, Compostura/Coragem) ---
  // A maioria dos textos usa: "bônus ... em testes de X"
  const skillTestRe = /b[oó]nus\s+de\s+([+-]?\d+)\s+em\s+testes?\s+de\s+([a-zà-ÿA-ZÀ-ÿ ]+)/gi
  let match: RegExpExecArray | null
  while ((match = skillTestRe.exec(text)) !== null) {
    const delta = parseInt(match[1], 10)
    const skillText = match[2]
    if (!Number.isFinite(delta)) continue
    const skillKey = inferCommonSkillKeyFromText(skillText)
    if (!skillKey) continue
    addToMap(out.skills, skillKey, delta)
  }

  // Complemento: às vezes vem como "esquiva" sem "testes de"
  const dodgeRe = /b[oó]nus\s+de\s+([+-]?\d+)\s+em\s+esquiva\b/gi
  while ((match = dodgeRe.exec(text)) !== null) {
    const delta = parseInt(match[1], 10)
    if (!Number.isFinite(delta)) continue
    addToMap(out.skills, 'reflexos', delta)
  }

  return out
}

