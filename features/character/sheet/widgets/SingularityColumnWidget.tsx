'use client'

import { useMemo } from 'react'
import SingularityCard from '@/shared/components/ui/SingularityCard'
import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'
import type { CharacterSingularitySelectionSlice } from '@/lib/characterBonuses'
import { partitionCreationAndMartialSingularityIds } from '@/lib/characterBonuses'
import type { SingularitiesBonusAggregate } from '@/lib/singularityBonuses'
import {
  buildSystemSingularities,
  type SystemSingularity,
  type SystemSingularityActivationType,
  type SystemSingularityKind,
} from '@/lib/systemSingularities'
import { sheetFocusRing, sheetMeta } from '@/features/character/sheet/sheetChrome'

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
  martialScope?: 'escola' | 'maestria'
  activation: SystemSingularityActivationType
  characterData: CharacterSingularitySlice
  canEdit: boolean
  isEditing: boolean
  onToggleConditional: (kind: SystemSingularityKind, id: string, enabled: boolean) => void
  singularityBonuses?: SingularitiesBonusAggregate | null
}

function kindLabel(kind: SystemSingularityKind, isMastery?: boolean): string {
  switch (kind) {
    case 'criacao':
      return 'Criação'
    case 'ecoar':
      return 'Ecoar'
    case 'marcial':
      return isMastery ? 'Maestria' : 'Escola marcial'
    case 'racial':
      return 'Racial'
    case 'path':
      return 'Trilha'
  }
}

function emptyCopyForActivation(activation: SystemSingularityActivationType): string {
  switch (activation) {
    case 'passiva':
      return 'Nenhum efeito passivo neste grupo. Adquira com PE em Evoluir.'
    case 'condicional':
      return 'Nenhuma condicional neste grupo. Quando houver, marque Ativa na mesa.'
    case 'complexa':
      return 'Nenhuma complexa neste grupo. Adquira com PE em Evoluir.'
    case 'ativa':
      return 'Nenhuma ativa neste grupo. Adquira com PE em Evoluir.'
  }
}

function idsForKind(
  slice: CharacterSingularitySlice,
  kind: SystemSingularityKind,
  isMartialId: (id: string) => boolean,
): string[] {
  if (kind === 'criacao' || kind === 'marcial') {
    const partitioned = partitionCreationAndMartialSingularityIds({
      singularidades: slice.singularidades ?? [],
      singularidadesMarciais: slice.singularidadesMarciais ?? [],
      isMartialId,
    })
    if (kind === 'criacao') return partitioned.criacao
    return partitioned.marciais
  }
  if (kind === 'ecoar') return slice.singularidadesEcoar ?? []
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
  martialScope,
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
    const isMartialId = (id: string) => systemSingularityById.get(id)?.kind === 'marcial'
    const out: SelectedEntry[] = []
    let seq = 0
    for (const kind of kinds) {
      for (const id of idsForKind(characterData, kind, isMartialId)) {
        const sys = systemSingularityById.get(id)
        if (sys && sys.kind !== kind) continue
        if (kind === 'marcial' && martialScope) {
          const isMastery = Boolean(sys?.isMastery)
          if (martialScope === 'maestria' && !isMastery) continue
          if (martialScope === 'escola' && isMastery) continue
        }
        const activationType = sys?.activationType ?? 'complexa'
        if (activationType !== activation) continue
        if (!kindSet.has(kind)) continue
        out.push({ id, kind, reactKey: `sing-${kind}-${id}-${seq++}`, sys })
      }
    }
    out.sort((a, b) => (a.sys?.name ?? a.id).localeCompare(b.sys?.name ?? b.id, 'pt-BR'))
    return out
  }, [activation, characterData, kindSet, kinds, martialScope, systemSingularityById])

  const interactive = canEdit

  if (entries.length === 0) {
    return (
      <div className="p-2.5 sm:p-3">
        <p className="font-mono text-xs leading-relaxed text-[#adb5bd]">
          {emptyCopyForActivation(activation)}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 p-2.5 sm:p-3">
      {entries.map(({ id, kind, reactKey, sys }) => {
        if (!sys) {
          return (
            <div key={reactKey} className="font-mono text-xs text-[#adb5bd]">
              Singularidade sem dados no catálogo ({id}).
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
            className="!rounded-none !p-2.5"
            footer={
              <div className="mt-1.5 flex w-full flex-wrap items-center justify-between gap-2 border-t border-ecoar-teal/25 pt-1.5 text-left">
                <div className={sheetMeta}>{kindLabel(kind, sys.isMastery)}</div>
                {activation === 'condicional' && (
                  <label
                    className={`flex items-center gap-1.5 font-mono text-[11px] ${
                      interactive ? 'cursor-pointer text-[#f5f5f5]' : 'cursor-default text-[#adb5bd]'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className={`rounded-none border-ecoar-teal/40 text-ecoar-teal ${sheetFocusRing} disabled:opacity-60`}
                      checked={condOn}
                      disabled={!interactive}
                      onChange={(e) => onToggleConditional(kind, id, e.target.checked)}
                    />
                    <span>Ativa na mesa</span>
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
