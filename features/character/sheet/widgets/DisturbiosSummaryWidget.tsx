'use client'

import { useMemo } from 'react'
import {
  getDisturbioComumById,
  getDisturbioIdentityPartById,
  getEcoarAcaoById,
  ownedEntryKey,
  type DisturbioOwnedEntry,
} from '@/data/disturbios'

type PontosEcoarSummary = {
  obtidos: number
  gastos: number
  disponiveis: number
}

type DisturbiosSummaryWidgetProps = {
  entries: DisturbioOwnedEntry[]
  ecoarAcoes: string[]
  pontosEcoar: PontosEcoarSummary
}

function resolveEntryLabel(entry: DisturbioOwnedEntry): string {
  if (entry.kind === 'identidade') {
    const gatilho = getDisturbioIdentityPartById(entry.gatilhoId)?.name ?? entry.gatilhoId
    const efeito = getDisturbioIdentityPartById(entry.efeitoId)?.name ?? entry.efeitoId
    const penalidade = getDisturbioIdentityPartById(entry.penalidadeId)?.name ?? entry.penalidadeId
    return `Identidade: ${gatilho} · ${efeito} · ${penalidade}`
  }

  const comum = getDisturbioComumById(entry.id)
  const base = comum?.name ?? entry.id
  if (!entry.choiceId) return base
  const choice = comum?.choices?.find((c) => c.id === entry.choiceId)
  return choice ? `${base} (${choice.name})` : `${base} (${entry.choiceId})`
}

export function DisturbiosSummaryWidget({
  entries,
  ecoarAcoes,
  pontosEcoar,
}: DisturbiosSummaryWidgetProps) {
  const resolvedAcoes = useMemo(
    () =>
      ecoarAcoes.map((id) => ({
        id,
        name: getEcoarAcaoById(id)?.name ?? id,
      })),
    [ecoarAcoes],
  )

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-ecoar-teal/30 bg-ecoar-teal/10 px-2.5 py-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-ecoar-light-900/70">
            Pontos de Ecoar
          </div>
          <div className="mt-0.5 text-sm text-slate-700 dark:text-ecoar-light-900/85">
            {pontosEcoar.obtidos} obtidos · {pontosEcoar.gastos} gastos ·{' '}
            <span
              className={
                pontosEcoar.disponiveis >= 0
                  ? 'font-semibold text-ecoar-teal'
                  : 'font-semibold text-ecoar-magenta'
              }
            >
              {pontosEcoar.disponiveis} disponíveis
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/55">
            Distúrbios
          </div>
          <div className="text-base font-semibold tabular-nums text-ecoar-teal">{entries.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-ecoar-light-900/70">
            Distúrbios adquiridos
          </h4>
          {entries.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60">Nenhum distúrbio.</p>
          ) : (
            <ul className="space-y-1">
              {entries.map((entry) => (
                <li
                  key={ownedEntryKey(entry)}
                  className="rounded-sm border border-slate-200/80 bg-slate-50/70 px-2 py-1 text-xs text-slate-700 dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/30 dark:text-ecoar-light-900/85"
                >
                  {resolveEntryLabel(entry)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-1.5">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-ecoar-light-900/70">
            Ações do Ecoar
          </h4>
          {resolvedAcoes.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/60">Nenhuma ação adicional.</p>
          ) : (
            <ul className="space-y-1">
              {resolvedAcoes.map((acao) => (
                <li
                  key={acao.id}
                  className="rounded-sm border border-slate-200/80 bg-slate-50/70 px-2 py-1 text-xs text-slate-700 dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/30 dark:text-ecoar-light-900/85"
                >
                  {acao.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-ecoar-light-900/55">
        Compra e edição de Distúrbios ficam na criação/evolução.
      </p>
    </div>
  )
}

export default DisturbiosSummaryWidget
