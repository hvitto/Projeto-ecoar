'use client'

import { useMemo } from 'react'
import {
  getDisturbioComumById,
  getDisturbioIdentityPartById,
  getEcoarAcaoById,
  ownedEntryKey,
  type DisturbioOwnedEntry,
} from '@/data/disturbios'
import { sheetLabel, sheetMeta, sheetStatCell } from '@/features/character/sheet/sheetChrome'

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
      <div className="flex flex-wrap items-center justify-between gap-3 border border-ecoar-teal/30 bg-ecoar-teal/10 px-2.5 py-2">
        <div className="min-w-0">
          <div className={sheetLabel}>Pontos de Ecoar</div>
          <div className="mt-0.5 font-mono text-sm text-[#f5f5f5]">
            {pontosEcoar.obtidos} obtidos · {pontosEcoar.gastos} gastos ·{' '}
            <span
              className={
                pontosEcoar.disponiveis >= 0
                  ? 'font-semibold text-ecoar-teal'
                  : 'font-semibold text-[#f5f5f5]'
              }
            >
              {pontosEcoar.disponiveis} disponíveis
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={sheetMeta}>Distúrbios</div>
          <div className="font-mono text-base font-semibold tabular-nums text-ecoar-teal">
            {entries.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        <div className="space-y-1.5">
          <h4 className={sheetLabel}>Distúrbios adquiridos</h4>
          {entries.length === 0 ? (
            <p className="font-mono text-xs leading-relaxed text-[#adb5bd]">
              Sem distúrbios nesta ficha. Adquira em Evoluir ou na criação.
            </p>
          ) : (
            <ul className="space-y-1">
              {entries.map((entry) => (
                <li
                  key={ownedEntryKey(entry)}
                  className={`${sheetStatCell} px-2 py-1 font-mono text-xs text-[#f5f5f5]`}
                >
                  {resolveEntryLabel(entry)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-1.5">
          <h4 className={sheetLabel}>Ações do Ecoar</h4>
          {resolvedAcoes.length === 0 ? (
            <p className="font-mono text-xs leading-relaxed text-[#adb5bd]">
              Sem ações extras do Ecoar nesta ficha.
            </p>
          ) : (
            <ul className="space-y-1">
              {resolvedAcoes.map((acao) => (
                <li
                  key={acao.id}
                  className={`${sheetStatCell} px-2 py-1 font-mono text-xs text-[#f5f5f5]`}
                >
                  {acao.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="font-mono text-[11px] leading-relaxed text-[#adb5bd]">
        Compra e edição de Distúrbios ficam em Evoluir (com PE) ou na criação.
      </p>
    </div>
  )
}

export default DisturbiosSummaryWidget
