/**
 * `requirements.previous` no catálogo pode ser:
 * - ID de outra singularidade de Ecoar (cadeia), ou
 * - ID do tipo de Ecoar (ex.: `vampiro`) indicando “possui este Ecoar”.
 */
export function isEcoarPreviousRequirementMet(
  previous: string,
  singularidadesEcoar: string[],
  ecoarTypeId: string
): boolean {
  if (singularidadesEcoar.includes(previous)) return true
  if (previous === ecoarTypeId) return true
  return false
}
