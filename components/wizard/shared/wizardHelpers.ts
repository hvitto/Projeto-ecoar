import { getMartialSchoolById } from '@/data/martialSchools'
import {
  getMartialSchoolDataByIdResolved,
  MARTIAL_SCHOOL_DATA_ID_TO_UI_ID,
  resolveMartialSchoolDataId,
} from '@/data/martialSchoolSingularities'

/** Nome (e subtítulo) da escola marcial na criação; aceita id do catálogo ou id legado da ficha resumida. */
export function martialSchoolCreationLabel(
  escolaMarcial: string | undefined,
): { name: string; subtitle?: string } | null {
  if (!escolaMarcial) return null
  const dataSchool = getMartialSchoolDataByIdResolved(escolaMarcial)
  if (dataSchool) return { name: dataSchool.name, subtitle: dataSchool.class }
  const resolved = resolveMartialSchoolDataId(escolaMarcial)
  const uiId = resolved ? MARTIAL_SCHOOL_DATA_ID_TO_UI_ID[resolved] : undefined
  const sheet = uiId ? getMartialSchoolById(uiId) : getMartialSchoolById(escolaMarcial)
  if (sheet) return { name: sheet.name, subtitle: sheet.category }
  return null
}

/** Soma bônus de atributo da ficha resumida para várias escolas (ids do catálogo `martialSchoolData`). */
export function mergeMartialSchoolAttributeBonusesFromDataSchoolIds(
  schoolDataIds: string[],
): Record<string, number> {
  const merged: Record<string, number> = {}
  const seen = new Set<string>()
  for (const dataId of schoolDataIds) {
    if (!dataId || seen.has(dataId)) continue
    seen.add(dataId)
    const uiId = MARTIAL_SCHOOL_DATA_ID_TO_UI_ID[dataId]
    const sheet = uiId ? getMartialSchoolById(uiId) : getMartialSchoolById(dataId)
    const attrs = sheet?.bonuses?.attributes
    if (!attrs) continue
    for (const [attr, v] of Object.entries(attrs)) {
      merged[attr] = (merged[attr] || 0) + (v as number)
    }
  }
  return merged
}
