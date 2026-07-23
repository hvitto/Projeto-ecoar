'use client'

import type { ReactNode } from 'react'
import type { WeaponFichaMeta } from '@/lib/weaponSheetLayout'

function CellLabel({ children }: { children: ReactNode }) {
  return <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/55">{children}</div>
}

function CellValue({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <div
      className={
        muted
          ? 'text-sm text-slate-400 dark:text-ecoar-light-900/45 break-words'
          : 'text-sm font-medium text-slate-900 dark:text-ecoar-light-900/90 break-words'
      }
    >
      {children}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const muted = !value || value === '—'
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2 items-baseline py-0.5">
      <span className="text-[11px] text-slate-500 dark:text-ecoar-light-900/55">{label}</span>
      <span className={muted ? 'text-sm text-slate-400' : 'text-sm font-medium text-slate-900 dark:text-ecoar-light-900/90'}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function WeaponFichaLayout({
  meta,
  headerRight,
  footer,
}: {
  meta: WeaponFichaMeta
  headerRight?: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/15 bg-white dark:bg-ecoar-dark-800/50 overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-slate-200/80 dark:border-ecoar-light-900/15 bg-slate-50/80 dark:bg-ecoar-dark-900/40">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900 break-words">{meta.name}</h4>
        {headerRight}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)] gap-0">
        <div className="px-3 py-2 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-ecoar-light-900/15 space-y-0.5">
          <MetaRow label="Habilidade:" value={meta.habilidade} />
          <MetaRow label="Especialidade:" value={meta.especialidade} />
          <MetaRow label="Atributo:" value={meta.atributo} />
          <MetaRow label="Categoria:" value={meta.categoria} />
          <MetaRow label="Durabilidade:" value={meta.durabilidade} />
          <MetaRow label="Munição:" value={meta.municao} />
          <MetaRow label="Qualidade:" value={meta.qualidadeLabel} />
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200/70 dark:bg-ecoar-light-900/15">
            <div className="bg-white dark:bg-ecoar-dark-800/80 p-2.5 space-y-2">
              <CellLabel>Alcance</CellLabel>
              <div>
                <CellLabel>Desfavorável (perto)</CellLabel>
                <CellValue muted={meta.rangeNear === '—'}>{meta.rangeNear}</CellValue>
              </div>
              <div>
                <CellLabel>Alcance efetivo</CellLabel>
                <CellValue muted={meta.rangeEffective === '—'}>{meta.rangeEffective}</CellValue>
              </div>
              <div>
                <CellLabel>Desfavorável (longe)</CellLabel>
                <CellValue muted={meta.rangeFar === '—'}>{meta.rangeFar}</CellValue>
              </div>
            </div>

            <div className="bg-white dark:bg-ecoar-dark-800/80 p-2.5 space-y-2">
              <CellLabel>Dano</CellLabel>
              {meta.damageLines.length === 0 ? (
                <CellValue muted>—</CellValue>
              ) : (
                meta.damageLines.map((line) => (
                  <div key={`${line.label}-${line.amount}`}>
                    <CellLabel>{line.label}</CellLabel>
                    <CellValue>{line.amount}</CellValue>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white dark:bg-ecoar-dark-800/80 p-2.5 space-y-2">
              <CellLabel>Extras</CellLabel>
              <div>
                <CellLabel>Acerto crítico</CellLabel>
                <CellValue muted={meta.acertoCritico === '—'}>{meta.acertoCritico}</CellValue>
              </div>
              <div>
                <CellLabel>Alvos</CellLabel>
                <CellValue muted={meta.alvos === '—'}>{meta.alvos}</CellValue>
              </div>
              <div>
                <CellLabel>Dano máximo</CellLabel>
                <CellValue muted={meta.danoMaximo === '—'}>{meta.danoMaximo}</CellValue>
              </div>
            </div>

            <div className="bg-white dark:bg-ecoar-dark-800/80 p-2.5 space-y-2">
              <CellLabel>Propriedades</CellLabel>
              {meta.propriedades.length === 0 ? (
                <CellValue muted>—</CellValue>
              ) : (
                <ul className="space-y-1">
                  {meta.propriedades.map((p) => (
                    <li key={p} className="text-sm text-slate-900 dark:text-ecoar-light-900/90 break-words">
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200/70 dark:bg-ecoar-light-900/15 border-t border-slate-200/80 dark:border-ecoar-light-900/15">
            <div className="bg-white dark:bg-ecoar-dark-800/80 px-2.5 py-2">
              <CellLabel>Recarga</CellLabel>
              <CellValue muted={meta.recarga === '—'}>{meta.recarga}</CellValue>
            </div>
            <div className="bg-white dark:bg-ecoar-dark-800/80 px-2.5 py-2">
              <CellLabel>Capacidade</CellLabel>
              <CellValue muted={meta.capacidade === '—'}>{meta.capacidade}</CellValue>
            </div>
            <div className="bg-white dark:bg-ecoar-dark-800/80 px-2.5 py-2">
              <CellLabel>Estoque</CellLabel>
              <CellValue muted={meta.estoque === '—'}>{meta.estoque}</CellValue>
            </div>
          </div>

          {meta.versatilNote && (
            <div className="px-2.5 py-1.5 text-[11px] text-slate-500 dark:text-ecoar-light-900/60 border-t border-slate-200/80 dark:border-ecoar-light-900/15">
              Usando uma arma Versátil com as duas mãos: +1 dano, Acerto Crítico e Alvos; +3 Dano Máximo.
            </div>
          )}
        </div>
      </div>

      {footer ? <div className="px-3 py-2 border-t border-slate-200/80 dark:border-ecoar-light-900/15">{footer}</div> : null}
    </div>
  )
}
