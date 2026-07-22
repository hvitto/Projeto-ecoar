'use client'

import { useMemo } from 'react'
import SingularityCard from '@/shared/components/ui/SingularityCard'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import type { CharacterSingularitySelectionSlice } from '@/lib/characterBonuses'
import type { SingularitiesBonusAggregate } from '@/lib/singularityBonuses'
import {
  buildSystemSingularities,
  type SystemSingularity,
  type SystemSingularityActivationType,
  type SystemSingularityKind,
} from '@/lib/systemSingularities'

type CharacterSingularitySlice = CharacterSingularitySelectionSlice & {
  pathCacadaPowers?: string[]
  pathCacadaEnhancements?: string[]
}

type SelectedEntry = {
  id: string
  kind: SystemSingularityKind
  reactKey: string
  sys?: SystemSingularity
}

type SingularityColumnWidgetProps = {
  kinds: SystemSingularityKind[]
  activation: SystemSingularityActivationType
  characterData: CharacterSingularitySlice
  canEdit: boolean
  isEditing: boolean
  onToggleConditional: (kind: SystemSingularityKind, id: string, enabled: boolean) => void
  singularityBonuses?: SingularitiesBonusAggregate | null
}

function kindLabel(kind: SystemSingularityKind): string {
  switch (kind) {
    case 'criacao':
      return 'Criação'
    case 'ecoar':
      return 'Ecoar'
    case 'marcial':
      return 'Marcial'
    case 'racial':
      return 'Racial'
    case 'path':
      return 'Trilha'
  }
}

function idsForKind(slice: CharacterSingularitySlice, kind: SystemSingularityKind): string[] {
  if (kind === 'criacao') return slice.singularidades ?? []
  if (kind === 'ecoar') return slice.singularidadesEcoar ?? []
  if (kind === 'marcial') return slice.singularidadesMarciais ?? []
  if (kind === 'racial') return slice.singularidadesRaciais ?? []
  return Array.from(
    new Set([
      ...(slice.singularidadesPath ?? []),
      ...(slice.pathCacadaPowers ?? []),
      ...(slice.pathCacadaEnhancements ?? []),
    ]),
  )
}

function conditionalEnabledForKind(
  slice: CharacterSingularitySlice,
  id: string,
  kind: SystemSingularityKind,
): boolean {
  if (kind === 'criacao') return (slice.singularidadesCondicionaisCriacaoAtivas ?? []).includes(id)
  if (kind === 'ecoar') return (slice.singularidadesCondicionaisAtivas ?? []).includes(id)
  if (kind === 'marcial') return (slice.singularidadesCondicionaisMarciaisAtivas ?? []).includes(id)
  if (kind === 'path') return (slice.singularidadesCondicionaisPathAtivas ?? []).includes(id)
  return (slice.singularidadesCondicionaisRaciaisAtivas ?? []).includes(id)
}

export function SingularityColumnWidget({
  kinds,
  activation,
  characterData,
  canEdit,
  isEditing,
  onToggleConditional,
}: SingularityColumnWidgetProps) {
  const { ecoarSingularities } = useEcoarCatalogData()

  const systemSingularityById = useMemo(() => {
    const map = new Map<string, SystemSingularity>()
    for (const s of buildSystemSingularities(ecoarSingularities)) map.set(s.id, s)
    return map
  }, [ecoarSingularities])

  const kindSet = useMemo(() => new Set(kinds), [kinds])

  const entries = useMemo((): SelectedEntry[] => {
    const out: SelectedEntry[] = []
    let seq = 0
    for (const kind of kinds) {
      for (const id of idsForKind(characterData, kind)) {
        const sys = systemSingularityById.get(id)
        const activationType = sys?.activationType ?? 'complexa'
        if (activationType !== activation) continue
        if (!kindSet.has(kind)) continue
        out.push({ id, kind, reactKey: `sing-${kind}-${id}-${seq++}`, sys })
      }
    }
    out.sort((a, b) => (a.sys?.name ?? a.id).localeCompare(b.sys?.name ?? b.id, 'pt-BR'))
    return out
  }, [activation, characterData, kindSet, kinds, systemSingularityById])

  const interactive = canEdit

  if (entries.length === 0) {
    return (
      <div className="p-2.5 sm:p-3">
        <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
          Nenhuma singularidade neste grupo.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 p-2.5 sm:p-3">
      {entries.map(({ id, kind, reactKey, sys }) => {
        if (!sys) {
          return (
            <div key={reactKey} className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
              Singularidade não encontrada no catálogo: {id}
            </div>
          )
        }

        const condOn = conditionalEnabledForKind(characterData, id, kind)

        return (
          <SingularityCard
            key={reactKey}
            name={sys.name}
            description={sys.description}
            cost={sys.cost}
            isSelected={true}
            canAfford={true}
            canSelect={false}
            onClick={() => {}}
            variant="teal"
            className="!rounded-sm !p-2.5"
            footer={
              <div className="mt-1.5 flex w-full flex-wrap items-center justify-between gap-2 border-t border-ecoar-dark-300/30 pt-1.5 text-left dark:border-ecoar-light-900/[0.06]">
                <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/55">
                  {kindLabel(kind)}
                </div>
                {activation === 'condicional' && (
                  <label
                    className={`flex items-center gap-1.5 text-[11px] ${
                      interactive
                        ? 'cursor-pointer text-slate-700 dark:text-ecoar-light-900/85'
                        : 'cursor-default text-slate-500 dark:text-ecoar-light-900/55'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded-sm border-slate-300 text-ecoar-teal-600 focus:ring-ecoar-teal-500 disabled:opacity-60"
                      checked={condOn}
                      disabled={!interactive}
                      onChange={(e) => onToggleConditional(kind, id, e.target.checked)}
                    />
                    <span>Ativa?</span>
                  </label>
                )}
              </div>
            }
          />
        )
      })}
    </div>
  )
}

export default SingularityColumnWidget
