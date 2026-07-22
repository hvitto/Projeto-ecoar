import type { Race } from '@/data/races'
import type { Path } from '@/data/paths'
import type { Skill } from '@/data/skills'
import type { Aptitude } from '@/data/aptitudes'
import type { Location } from '@/data/locations'
import type { SoulLevel } from '@/data/soulLevels'
import type { MartialSchool } from '@/data/martialSchools'
import type { DisturbioIdentityPart, DisturbioComum, EcoarAcao } from '@/data/disturbios'
import type { GameReferencePayload } from '@/lib/gameReferenceRepository'
import * as racesMod from '@/data/races'
import * as pathsMod from '@/data/paths'
import * as skillsMod from '@/data/skills'
import * as aptitudesMod from '@/data/aptitudes'
import * as locationsMod from '@/data/locations'
import * as soulLevelsMod from '@/data/soulLevels'
import * as martialSchoolsMod from '@/data/martialSchools'
import * as disturbiosMod from '@/data/disturbios'

export function hydrateGameReferenceFromPayload(payload: GameReferencePayload): boolean {
  if (payload.source !== 'database') return false

  const hasCore =
    payload.races.length > 0 &&
    payload.paths.length > 0 &&
    payload.skills.length > 0 &&
    payload.locations.length > 0 &&
    payload.soulLevels.length > 0 &&
    payload.martialSchools.length > 0

  if (!hasCore) return false

  racesMod.hydrateRaces(payload.races as Race[])
  pathsMod.hydratePaths(payload.paths as Path[])
  skillsMod.hydrateSkills(payload.skills as Skill[])
  aptitudesMod.hydrateAptitudes(payload.aptitudes as Aptitude[])
  locationsMod.hydrateLocations(payload.locations as Location[])
  soulLevelsMod.hydrateSoulLevels(payload.soulLevels as SoulLevel[])
  martialSchoolsMod.hydrateMartialSchools(payload.martialSchools as MartialSchool[])
  disturbiosMod.hydrateDisturbios({
    gatilhos: payload.disturbioGatilhos as DisturbioIdentityPart[],
    efeitos: payload.disturbioEfeitos as DisturbioIdentityPart[],
    penalidades: payload.disturbioPenalidades as DisturbioIdentityPart[],
    comuns: payload.disturbiosComuns as DisturbioComum[],
    acoes: payload.ecoarAcoes as EcoarAcao[],
  })
  return true
}
