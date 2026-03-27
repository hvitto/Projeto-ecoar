'use client'

import { useMemo } from 'react'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import { buildSystemSingularities } from '@/lib/systemSingularities'
import { aggregateSimpleBonuses } from '@/lib/singularityBonuses'
import {
  aggregateSingularityInputFromCharacterData,
  type CharacterSingularitySelectionSlice,
} from '@/lib/characterBonuses'

type Slice = CharacterSingularitySelectionSlice

/** Agrega bônus simples de singularidades (passivas + condicionais ativas), alinhado à ficha. */
export function useSystemSingularityBonuses(characterData: Slice) {
  const { ecoarSingularities } = useEcoarCatalogData()
  const systemSingularities = useMemo(() => buildSystemSingularities(ecoarSingularities), [ecoarSingularities])
  const systemSingularityById = useMemo(() => {
    const map = new Map<string, (typeof systemSingularities)[number]>()
    for (const s of systemSingularities) map.set(s.id, s)
    return map
  }, [systemSingularities])

  return useMemo(
    () =>
      aggregateSimpleBonuses({
        ...aggregateSingularityInputFromCharacterData(characterData),
        getSystemSingularityById: (id) => systemSingularityById.get(id),
      }),
    [
      characterData.singularidades,
      characterData.singularidadesCondicionaisCriacaoAtivas,
      characterData.singularidadesEcoar,
      characterData.singularidadesCondicionaisAtivas,
      characterData.singularidadesMarciais,
      characterData.singularidadesCondicionaisMarciaisAtivas,
      characterData.singularidadesCondicionaisRaciaisAtivas,
      characterData.singularidadesRaciais,
      systemSingularityById,
    ],
  )
}
