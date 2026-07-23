'use client'

import SingularityCard from '@/shared/components/ui/SingularityCard'
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
          Projeções Artísticas
        </h4>
        <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70">
          Aprimoramentos das escolas marciais de Vox (Barda, Desenhista, Musicista). O nível I de cada
          escola é concedido automaticamente ao preencher o requisito marcial.
        </p>
      </div>
      {schools.map((school) => {
        const projections = getEsperancaProjectionsBySchool(school)
        return (
          <div key={school} className="space-y-3">
            <h5 className="text-sm font-semibold text-ecoar-teal dark:text-ecoar-teal-400">
              {ESPERANCA_SCHOOL_LABELS[school] ?? school}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    </div>
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
          Patrono
        </h4>
        <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70">
          Escolha uma divindade, entidade menor ou entidade planar. A primeira bênção é concedida
          automaticamente.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PATH_PATRONS.map((p) => {
          const isSelected = props.pathPatronChoice === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPatron(p.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-ecoar-teal bg-ecoar-teal/10'
                  : 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50'
              }`}
            >
              <div className="text-xs uppercase tracking-wide text-ecoar-teal/80 mb-1">{p.typeLabel}</div>
              <div className="font-semibold text-slate-900 dark:text-ecoar-light-900">{p.name}</div>
              <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70 mt-2 leading-relaxed">
                {p.description}
              </p>
            </button>
          )
        })}
      </div>

      {patron && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
            Bênçãos — {patron.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>
      )}
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
          Código de Honra
        </h4>
        <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70">
          Escolha um código. Ultraviolências só concedem bônus enquanto você age de acordo com ele.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PATH_HONOR_CODES.map((code) => {
          const isSelected = props.pathHonorCode === code.id
          return (
            <button
              key={code.id}
              type="button"
              onClick={() => props.onPathHonorCodeChange(code.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-ecoar-teal bg-ecoar-teal/10'
                  : 'border-slate-200 dark:border-ecoar-light-900/20 bg-slate-50 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50'
              }`}
            >
              <div className="font-semibold text-slate-900 dark:text-ecoar-light-900">{code.name}</div>
              <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70 mt-2 leading-relaxed">
                <span className="font-medium text-ecoar-magenta/90">Limitação:</span> {code.limitation}
              </p>
              <p className="text-xs text-slate-600 dark:text-ecoar-light-900/70 mt-2 leading-relaxed">
                <span className="font-medium text-ecoar-teal/90">{code.benefitName}:</span> {code.benefit}
              </p>
            </button>
          )
        })}
      </div>

      {selectedCode && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900 border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
            Ultraviolências ({selectedUvCount}/{nivelPoder})
          </h4>
          <p className="text-sm text-slate-600 dark:text-ecoar-light-900/70">
            Máximo igual ao seu Nível de Poder ({nivelPoder}).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    atCap
                      ? 'Limite de Nível de Poder atingido'
                      : !check.ok
                        ? check.reason
                        : undefined
                  }
                  variant="teal"
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
