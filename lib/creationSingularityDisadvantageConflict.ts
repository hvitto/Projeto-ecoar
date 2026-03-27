import { getCreationSingularityById } from '@/data/creationSingularities'
import { getSingularityById } from '@/data/singularities'

/** IDs em `requirements` não podem estar simultaneamente nas listas de singularidades ou desvantagens selecionadas. */
export function requirementsConflictWithSelection(
  reqIds: string[] | undefined,
  singularidades: string[],
  desvantagens: string[],
): boolean {
  if (!reqIds?.length) return false
  const selected = new Set([...singularidades, ...desvantagens])
  return reqIds.some((id) => selected.has(id))
}

/** Verdadeiro se alguma singularidade já selecionada lista esta desvantagem em `requirements`. */
export function anySelectedSingularityForbidsDisadvantage(
  selectedSingularityIds: string[],
  disadvantageId: string,
): boolean {
  for (const singId of selectedSingularityIds) {
    const c = getCreationSingularityById(singId)
    if (c?.requirements?.includes(disadvantageId)) return true
    const s = getSingularityById(singId)
    if (s?.requirements?.includes(disadvantageId)) return true
  }
  return false
}
