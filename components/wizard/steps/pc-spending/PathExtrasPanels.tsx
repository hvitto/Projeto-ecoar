'use client'

import SingularityCard from '@/shared/components/ui/SingularityCard'
import SelectPlate from '@/components/beyond/SelectPlate'
import RangeFrame from '@/components/beyond/RangeFrame'
import type { PathBookEntry } from '@/data/pathBookContent'
import {
  PATH_HONOR_CODES,
  PATH_PATRONS,
  ESPERANCA_SCHOOL_LABELS,
  canSelectPathBookEntry,
  getEsperancaProjectionSchools,
  getEsperancaProjectionsBySchool,
  getPathHonorCodeById,
  getPathPatronById,
  getPatronosBlessingsByPatron,
  getViolenciaUltraviolences,
  getPathBookEntryById,
} from '@/data/pathExtraOptions'
import { getSoulLevelByNivel } from '@/data/soulLevels'

type SharedProps = {
  pathSingularityBase: string
  pathExtraIds: string[]
  onPathExtraIdsChange: (ids: string[]) => void
  pontosDisponiveis: number
  martialSingularityIds: string[]
  nivelAlma: number
  costLabel?: string
}

function toggleExtra(
  id: string,
  entry: PathBookEntry,
  props: SharedProps & { maxCount?: number; countKind?: string },
) {
  const selected = props.pathExtraIds.includes(id)
  if (selected) {
    const remaining = props.pathExtraIds.filter((x) => x !== id)
    const drop = new Set<string>([id])
    let changed = true
    while (changed) {
      changed = false
      for (const otherId of remaining) {
        if (drop.has(otherId)) continue
        const other = getPathBookEntryById(otherId)
        if ((other?.previousIds ?? []).some((req) => drop.has(req))) {
          drop.add(otherId)
          changed = true
        }
      }
    }
    props.onPathExtraIdsChange(remaining.filter((x) => !drop.has(x)))
    return
  }

  const check = canSelectPathBookEntry(entry, {
    pathSingularityBase: props.pathSingularityBase,
    ownedIds: [],
    martialSingularityIds: props.martialSingularityIds,
    selectedExtraIds: props.pathExtraIds,
  })
  if (!check.ok) return

  if (props.maxCount != null && props.countKind) {
    const currentCount = props.pathExtraIds.filter((x) => {
      const e = getPathBookEntryById(x)
      return e?.meta?.kind === props.countKind
    }).length
    if (currentCount >= props.maxCount) return
  }

  if (entry.cost > 0 && props.pontosDisponiveis < entry.cost) return
  props.onPathExtraIdsChange([...props.pathExtraIds, id])
}

export function EsperancaPathExtras(props: SharedProps) {
  const schools = getEsperancaProjectionSchools()
  const costLabel = props.costLabel ?? 'PC'
  return (
    <RangeFrame title="Projeções artísticas" refId="PATH-ESP" bodyClassName="p-3">
      <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] mb-4">
        Aprimoramentos das escolas marciais de Vox (Barda, Desenhista, Musicista). O nível I de cada
        escola é concedido automaticamente ao preencher o requisito marcial.
      </p>
      {schools.map((school) => {
        const projections = getEsperancaProjectionsBySchool(school)
        return (
          <div key={school} className="space-y-2 mb-5 last:mb-0">
            <h5 className="font-display text-xs uppercase tracking-[0.04em] text-ecoar-teal border-b border-ecoar-teal/35 pb-1.5">
              {ESPERANCA_SCHOOL_LABELS[school] ?? school}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {projections.map((entry) => {
                const isSelected = props.pathExtraIds.includes(entry.id)
                const check = canSelectPathBookEntry(entry, {
                  pathSingularityBase: props.pathSingularityBase,
                  ownedIds: [],
                  martialSingularityIds: props.martialSingularityIds,
                  selectedExtraIds: props.pathExtraIds,
                })
                const canAfford = entry.cost === 0 || props.pontosDisponiveis >= entry.cost
                return (
                  <SingularityCard
                    key={entry.id}
                    name={entry.name}
                    description={entry.description}
                    cost={entry.cost}
                    costLabel={entry.cost === 0 ? undefined : costLabel}
                    secondaryCost={entry.cost === 0 ? 'Automática' : undefined}
                    isSelected={isSelected}
                    canAfford={canAfford}
                    canSelect={isSelected || (check.ok && canAfford)}
                    onClick={() => toggleExtra(entry.id, entry, props)}
                    requirementsText={!check.ok ? check.reason : undefined}
                    variant="teal"
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </RangeFrame>
  )
}

export function PatronosPathExtras(
  props: SharedProps & {
    pathPatronChoice: string
    onPathPatronChoiceChange: (id: string) => void
  },
) {
  const costLabel = props.costLabel ?? 'PC'
  const patron = props.pathPatronChoice ? getPathPatronById(props.pathPatronChoice) : undefined
  const blessings = patron ? getPatronosBlessingsByPatron(patron.id) : []

  const selectPatron = (patronId: string) => {
    if (props.pathPatronChoice === patronId) return
    const next = getPathPatronById(patronId)
    if (!next) return
    const kept = props.pathExtraIds.filter((id) => {
      const e = getPathBookEntryById(id)
      return !(e?.pathKind === 'patronos' && e.meta?.patron)
    })
    props.onPathPatronChoiceChange(patronId)
    props.onPathExtraIdsChange([...kept, next.firstBlessingId])
  }

  return (
    <div className="space-y-4">
      <RangeFrame title="Patrono" refId="PATH-PAT" bodyClassName="p-3">
        <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] mb-3">
          Escolha uma divindade, entidade menor ou entidade planar. A primeira bênção é concedida
          automaticamente.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {PATH_PATRONS.map((p, index) => (
            <SelectPlate
              key={p.id}
              index={index}
              title={p.name}
              description={p.description}
              selected={props.pathPatronChoice === p.id}
              onClick={() => selectPatron(p.id)}
              meta={
                <span className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal">{p.typeLabel}</span>
              }
            />
          ))}
        </div>
      </RangeFrame>

      {patron ? (
        <RangeFrame title={`Bênçãos · ${patron.name}`} refId="PATH-BEN" bodyClassName="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {blessings.map((entry) => {
              const isSelected = props.pathExtraIds.includes(entry.id)
              const isFirst = entry.id === patron.firstBlessingId
              const check = canSelectPathBookEntry(entry, {
                pathSingularityBase: props.pathSingularityBase,
                ownedIds: [],
                martialSingularityIds: props.martialSingularityIds,
                selectedExtraIds: props.pathExtraIds,
              })
              const canAfford = entry.cost === 0 || props.pontosDisponiveis >= entry.cost
              return (
                <SingularityCard
                  key={entry.id}
                  name={entry.name}
                  description={entry.description}
                  cost={entry.cost}
                  costLabel={entry.cost === 0 ? undefined : costLabel}
                  secondaryCost={entry.cost === 0 ? 'Automática' : undefined}
                  isSelected={isSelected}
                  canAfford={canAfford}
                  canSelect={isSelected || (check.ok && canAfford && !isFirst)}
                  onClick={() => {
                    if (isFirst) return
                    toggleExtra(entry.id, entry, props)
                  }}
                  requirementsText={!check.ok && !isSelected ? check.reason : undefined}
                  variant="teal"
                />
              )
            })}
          </div>
        </RangeFrame>
      ) : null}
    </div>
  )
}

export function ViolenciaPathExtras(
  props: SharedProps & {
    pathHonorCode: string
    onPathHonorCodeChange: (id: string) => void
  },
) {
  const costLabel = props.costLabel ?? 'PC'
  const soul = getSoulLevelByNivel(props.nivelAlma)
  const nivelPoder = soul?.nivelPoder ?? 1
  const uvList = getViolenciaUltraviolences()
  const selectedUvCount = props.pathExtraIds.filter((id) => {
    const e = getPathBookEntryById(id)
    return e?.meta?.kind === 'ultraviolence'
  }).length
  const selectedCode = props.pathHonorCode ? getPathHonorCodeById(props.pathHonorCode) : undefined

  return (
    <div className="space-y-4">
      <RangeFrame title="Código de honra" refId="PATH-HON" bodyClassName="p-3">
        <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] mb-3">
          Escolha um código. Ultraviolências só concedem bônus enquanto você age de acordo com ele.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PATH_HONOR_CODES.map((code, index) => (
            <SelectPlate
              key={code.id}
              index={index}
              title={code.name}
              description={`${code.limitation} · ${code.benefitName}: ${code.benefit}`}
              selected={props.pathHonorCode === code.id}
              onClick={() => props.onPathHonorCodeChange(code.id)}
              meta={
                <span className="text-[9px] uppercase tracking-[0.1em] text-ecoar-magenta">
                  Limitação · {code.limitation.slice(0, 40)}…
                </span>
              }
            />
          ))}
        </div>
      </RangeFrame>

      {selectedCode ? (
        <RangeFrame
          title={`Ultraviolências · ${selectedUvCount}/${nivelPoder}`}
          refId="PATH-UV"
          bodyClassName="p-3"
        >
          <p className="text-[11px] leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] mb-3">
            Máximo igual ao seu Nível de Poder ({nivelPoder}).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {uvList.map((entry) => {
              const isSelected = props.pathExtraIds.includes(entry.id)
              const check = canSelectPathBookEntry(entry, {
                pathSingularityBase: props.pathSingularityBase,
                ownedIds: [],
                martialSingularityIds: props.martialSingularityIds,
                selectedExtraIds: props.pathExtraIds,
              })
              const atCap = !isSelected && selectedUvCount >= nivelPoder
              const canAfford = entry.cost === 0 || props.pontosDisponiveis >= entry.cost
              return (
                <SingularityCard
                  key={entry.id}
                  name={entry.name}
                  description={entry.description}
                  cost={entry.cost}
                  costLabel={costLabel}
                  isSelected={isSelected}
                  canAfford={canAfford}
                  canSelect={isSelected || (check.ok && canAfford && !atCap)}
                  onClick={() =>
                    toggleExtra(entry.id, entry, {
                      ...props,
                      maxCount: nivelPoder,
                      countKind: 'ultraviolence',
                    })
                  }
                  requirementsText={
                    atCap ? 'Limite de Nível de Poder atingido' : !check.ok ? check.reason : undefined
                  }
                  variant="teal"
                />
              )
            })}
          </div>
        </RangeFrame>
      ) : null}
    </div>
  )
}
