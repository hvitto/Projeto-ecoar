import { sql, isDatabaseConfigured } from '@/lib/db'
import type { Race } from '@/data/races'
import type { Path } from '@/data/paths'
import type { Skill } from '@/data/skills'
import type { Aptitude } from '@/data/aptitudes'
import type { Location } from '@/data/locations'
import type { SoulLevel } from '@/data/soulLevels'
import type { MartialSchool } from '@/data/martialSchools'
import type { DisturbioIdentityPart, DisturbioComum, EcoarAcao } from '@/data/disturbios'
import type { PathPatronOption, PathHonorCode } from '@/data/pathExtraOptions'

export type GameReferenceKind =
  | 'race'
  | 'path'
  | 'skill'
  | 'aptitude'
  | 'location'
  | 'soul_level'
  | 'martial_school'
  | 'disturbio_gatilho'
  | 'disturbio_efeito'
  | 'disturbio_penalidade'
  | 'disturbio_comum'
  | 'ecoar_acao'
  | 'path_patron'
  | 'path_honor_code'

export type GameReferencePayload = {
  races: Race[]
  paths: Path[]
  skills: Skill[]
  aptitudes: Aptitude[]
  locations: Location[]
  soulLevels: SoulLevel[]
  martialSchools: MartialSchool[]
  disturbioGatilhos: DisturbioIdentityPart[]
  disturbioEfeitos: DisturbioIdentityPart[]
  disturbioPenalidades: DisturbioIdentityPart[]
  disturbiosComuns: DisturbioComum[]
  ecoarAcoes: EcoarAcao[]
  pathPatrons: PathPatronOption[]
  pathHonorCodes: PathHonorCode[]
  source: 'database' | 'empty'
}

const EMPTY_PAYLOAD: GameReferencePayload = {
  races: [],
  paths: [],
  skills: [],
  aptitudes: [],
  locations: [],
  soulLevels: [],
  martialSchools: [],
  disturbioGatilhos: [],
  disturbioEfeitos: [],
  disturbioPenalidades: [],
  disturbiosComuns: [],
  ecoarAcoes: [],
  pathPatrons: [],
  pathHonorCodes: [],
  source: 'empty',
}

type Row = { kind: GameReferenceKind; payload: unknown }

function asArray<T>(rows: Row[], kind: GameReferenceKind): T[] {
  return rows
    .filter((r) => r.kind === kind)
    .map((r) => r.payload as T)
}

export async function getGameReferencePayloadFromDb(): Promise<GameReferencePayload> {
  if (!isDatabaseConfigured()) return { ...EMPTY_PAYLOAD }

  const rows = (await sql`
    SELECT kind, payload
    FROM game_reference_catalog
    WHERE is_active = true
    ORDER BY kind, id
  `) as Row[]

  if (rows.length === 0) return { ...EMPTY_PAYLOAD }

  const soulLevels = asArray<SoulLevel>(rows, 'soul_level').sort((a, b) => a.nivel - b.nivel)

  return {
    races: asArray<Race>(rows, 'race'),
    paths: asArray<Path>(rows, 'path'),
    skills: asArray<Skill>(rows, 'skill'),
    aptitudes: asArray<Aptitude>(rows, 'aptitude'),
    locations: asArray<Location>(rows, 'location'),
    soulLevels,
    martialSchools: asArray<MartialSchool>(rows, 'martial_school'),
    disturbioGatilhos: asArray<DisturbioIdentityPart>(rows, 'disturbio_gatilho'),
    disturbioEfeitos: asArray<DisturbioIdentityPart>(rows, 'disturbio_efeito'),
    disturbioPenalidades: asArray<DisturbioIdentityPart>(rows, 'disturbio_penalidade'),
    disturbiosComuns: asArray<DisturbioComum>(rows, 'disturbio_comum'),
    ecoarAcoes: asArray<EcoarAcao>(rows, 'ecoar_acao'),
    pathPatrons: asArray<PathPatronOption>(rows, 'path_patron'),
    pathHonorCodes: asArray<PathHonorCode>(rows, 'path_honor_code'),
    source: 'database',
  }
}

export function isGameReferenceSchemaMissing(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === '42P01'
  )
}
