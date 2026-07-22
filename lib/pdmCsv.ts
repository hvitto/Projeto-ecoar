export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    const n = text[i + 1]
    if (q) {
      if (c === '"' && n === '"') {
        cur += '"'
        i++
      } else if (c === '"') q = false
      else cur += c
    } else if (c === '"') q = true
    else if (c === ',') {
      row.push(cur)
      cur = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && n === '\n') i++
      row.push(cur)
      if (row.some((x) => String(x).trim())) rows.push(row)
      row = []
      cur = ''
    } else cur += c
  }
  if (cur.length || row.length) {
    row.push(cur)
    if (row.some((x) => String(x).trim())) rows.push(row)
  }
  return rows
}

export function slugifyPt(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parsePtNumber(raw: string | undefined | null): number | null {
  if (raw == null) return null
  const t = String(raw).trim()
  if (!t) return null
  const normalized = t.replace(/\s/g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export type PdmActivationType = 'passiva' | 'condicional' | 'complexa' | 'ativa'

export function mapPdmTipo(tipo: string): PdmActivationType {
  const t = tipo.trim().toLowerCase()
  if (t === 'passiva') return 'passiva'
  if (t === 'condicional' || t === 'complementar') return 'condicional'
  if (t === 'ativa') return 'ativa'
  if (t === 'complexa') return 'complexa'
  return 'complexa'
}

const ATTR_COLUMNS: Record<string, string> = {
  Carisma: 'carisma',
  Finesse: 'finesse',
  Força: 'forca',
  Inteligência: 'inteligencia',
  Percepção: 'percepcao',
  Vitalidade: 'vitalidade',
  Vontade: 'vontade',
}

const SKILL_COLUMNS: Record<string, string> = {
  Atenção: 'atencao',
  Compostura: 'compostura',
  Raciocínio: 'raciocinio',
  Reflexos: 'reflexos',
  Acrobacia: 'acrobacia',
  Atletismo: 'atletismo',
  Furtividade: 'furtividade',
  Prestidigitação: 'prestidigitacao',
  Conversação: 'conversacao',
  Enganação: 'enganacao',
  Empatia: 'empatia',
  Intimidação: 'intimidacao',
  'Lidar c/ Animais': 'lidar-com-animais',
  Veículos: 'veiculos',
  Armeiro: 'armeiro',
  Tecnologia: 'tecnologia',
  Química: 'quimica',
  Medicina: 'medicina',
  Perícias: 'pericias',
  Conhecimentos: 'conhecimentos',
  Arcana: 'arcana',
  Lethalis: 'lethalis',
  Natura: 'natura',
  Vox: 'vox',
  'Corpo-a-corpo': 'corpo-a-corpo',
  Mágica: 'magica',
  Pontaria: 'pontaria',
  'Armas Especiais': 'armas-especiais',
  Esquiva: 'esquiva',
  Reação: 'reacao',
}

export type ParsedPdmBonuses = {
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

export function emptyParsedBonuses(): ParsedPdmBonuses {
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

function parseBonusToken(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const m = t.match(/^([+-]?\d+(?:[.,]\d+)?)_Bonus$/i)
  if (m) return parsePtNumber(m[1])
  return null
}

export function extractBonusesFromPdmRow(
  header: string[],
  row: string[],
  idx: Record<string, number>,
): ParsedPdmBonuses {
  const out = emptyParsedBonuses()
  const get = (name: string) => row[idx[name]] ?? ''

  const corpo = parseBonusToken(get('Corpo'))
  if (corpo != null) out.corpo += corpo
  const mente = parseBonusToken(get('Mente'))
  if (mente != null) out.mente += mente
  const folego = parseBonusToken(get('Fôlego'))
  if (folego != null) out.folego += folego
  const mana = parseBonusToken(get('Mana'))
  if (mana != null) out.mana += mana

  const maxDmg = parseBonusToken(get('Dano Máximo'))
  if (maxDmg != null) out.maxDamage += maxDmg
  const pen = parseBonusToken(get('Penetração'))
  if (pen != null) out.penetration += pen
  const crit = parseBonusToken(get('Acerto Crítico'))
  if (crit != null) out.crit += crit

  for (const [col, key] of Object.entries(ATTR_COLUMNS)) {
    const v = parseBonusToken(get(col))
    if (v != null) out.attributes[key] = (out.attributes[key] ?? 0) + v
  }
  for (const [col, key] of Object.entries(SKILL_COLUMNS)) {
    const v = parseBonusToken(get(col))
    if (v != null) out.skills[key] = (out.skills[key] ?? 0) + v
  }

  const danoMental = parseBonusToken(get('Mental'))
  const danoFisico = parseBonusToken(get('Físico'))
  if (danoMental != null) out.damage += danoMental
  if (danoFisico != null) out.damage += danoFisico

  for (let i = 0; i < header.length; i++) {
    const col = header[i]
    if (!col || idx[col] !== i) continue
    if (ATTR_COLUMNS[col] || SKILL_COLUMNS[col]) continue
    if (['Corpo', 'Mente', 'Fôlego', 'Mana', 'Dano Máximo', 'Penetração', 'Acerto Crítico', 'Mental', 'Físico'].includes(col)) {
      continue
    }
    const token = parseBonusToken(row[i] ?? '')
    if (token == null) continue
    const lower = col.toLowerCase()
    if (lower.includes('dano') && !lower.includes('máximo') && !lower.includes('maximo')) {
      out.damage += token
    }
  }

  return out
}

export function mergeParsedBonuses(into: ParsedPdmBonuses, add: ParsedPdmBonuses): ParsedPdmBonuses {
  for (const [k, v] of Object.entries(add.attributes)) into.attributes[k] = (into.attributes[k] ?? 0) + v
  for (const [k, v] of Object.entries(add.skills)) into.skills[k] = (into.skills[k] ?? 0) + v
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

export function hasParsedBonuses(b: ParsedPdmBonuses): boolean {
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

export const RACE_SUBCLASS_TO_ID: Record<string, string> = {
  Peccatas: 'peccata',
  Peccata: 'peccata',
  Anões: 'anao',
  Anão: 'anao',
  Elfos: 'elfo',
  Elfo: 'elfo',
  Orcs: 'orc',
  Orc: 'orc',
  Tyllows: 'tyllow',
  Tyllow: 'tyllow',
  Fleurilis: 'fleurili',
  Fleurili: 'fleurili',
  Fjar: 'fjyr',
  Fjyr: 'fjyr',
  Kaidlers: 'kaidler',
  Kaidler: 'kaidler',
  Maynes: 'mayne',
  Mayne: 'mayne',
  Niliapys: 'niliapy',
  Niliapy: 'niliapy',
  Tsusagis: 'tsusagi',
  Tsusagi: 'tsusagi',
  Triskelion: 'triskelion',
}

export const CREATION_CATEGORY_MAP: Record<string, 'atributos' | 'habilidades' | 'genetica' | 'talentos'> = {
  Atributos: 'atributos',
  Habilidades: 'habilidades',
  Genética: 'genetica',
  Genetica: 'genetica',
  Talentos: 'talentos',
}

export const KNOWN_CREATION_IDS: Record<string, string> = {
  agil: 'agil',
  determinado: 'determinado',
  extrovertido: 'extrovertido',
  'facilidade-em-aprender': 'facilidade-em-aprender',
  mesomorfo: 'mesomorfo',
  perspicacia: 'perspicacia',
  robusto: 'robusto',
  'beleza-insuperavel': 'beleza-insuperavel',
  'aptidao-magica': 'aptidao-magica',
  duravel: 'duravel',
  'inteligencia-emocional': 'inteligencia-emocional',
  'metabolismo-resistente': 'metabolismo-resistente',
  'humanoide-grande': 'humanoid-grande',
  'humanoid-grande': 'humanoid-grande',
  'humanoide-pesado': 'humanoid-pesado',
  'humanoid-pesado': 'humanoid-pesado',
  'porte-pequeno': 'porte-pequeno',
  'alta-mobilidade': 'alta-mobilidade',
  atleta: 'atleta',
  carismatico: 'carismatico',
  'mente-prodigiosa': 'mente-prodigiosa',
  'precisao-cirurgica': 'precisao-cirurgica',
  'sentidos-afiados': 'sentidos-afiados',
  'vontade-inabalavel': 'vontade-inabalavel',
}

export const KNOWN_DISADVANTAGE_IDS: Record<string, string> = {
  antipatico: 'antipatico',
  desatento: 'desatento',
  desinteligente: 'desinteligente',
  destoado: 'destoado',
  devagar: 'devagar',
  ectomorfo: 'ectomorfo',
  fragil: 'fragil',
  'animal-assustado': 'animal-assustado',
  'aparencia-horripilante': 'aparencia-horripilante',
  desastrado: 'desastrado',
  distraido: 'distraido',
  franzino: 'franzino',
  'imunidade-baixa': 'imunidade-baixa',
  'inaptidao-magica': 'inaptidao-magica',
  'mente-vulneravel': 'mente-vulneravel',
  'saude-fraca': 'saude-fraca',
}
