'use client'

import type { ReactNode } from 'react'
import type { CatalogEntry, CatalogOwnedItem } from '@/shared/types/equipment'
import { formatCerosDisplay } from '@/lib/equipmentCost'
import { buildWeaponFichaMeta } from '@/lib/weaponSheetLayout'
import WeaponFichaLayout from '@/components/equipment/WeaponFichaLayout'

function Stat({ label, value }: { label: string; value?: string | null }) {
  if (!value || value === '—') return null
  return (
    <div className="text-[11px] leading-snug">
      <span className="text-slate-500 dark:text-ecoar-light-900/55">{label}: </span>
      <span className="text-slate-800 dark:text-ecoar-light-900/85">{value}</span>
    </div>
  )
}

export default function OwnedCatalogItemStats({
  item,
  entry,
  headerRight,
  footer,
}: {
  item: CatalogOwnedItem
  entry: CatalogEntry | undefined
  headerRight?: ReactNode
  footer?: ReactNode
}) {
  if (!entry) {
    return (
      <p className="text-[11px] text-slate-500 dark:text-ecoar-light-900/55">
        Status do catálogo indisponível para este item.
      </p>
    )
  }

  if (entry.kind === 'weapon') {
    const meta = buildWeaponFichaMeta({
      entry,
      name: item.nome,
      qualidadeNivel: item.qualidadeNivel ?? 0,
    })
    return (
      <WeaponFichaLayout
        meta={meta}
        headerRight={
          headerRight ?? (
            <span className="text-xs tabular-nums text-slate-600 dark:text-ecoar-light-900/70">
              {formatCerosDisplay(item.custoCeros)}
            </span>
          )
        }
        footer={footer}
      />
    )
  }

  if (entry.kind === 'armor') {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/15 bg-white dark:bg-ecoar-dark-800/50 p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">{item.nome}</h4>
          <span className="text-xs tabular-nums text-slate-600 dark:text-ecoar-light-900/70">
            {formatCerosDisplay(item.custoCeros)}
          </span>
        </div>
        <Stat label="Categoria" value={entry.category} />
        <Stat label="Espaço" value={entry.space} />
        <Stat label="Defesa de crítico" value={entry.defenseCritico} />
        <Stat label="Esquiva" value={entry.esquiva} />
        <Stat label="Furtividade" value={entry.furtividade} />
        {Array.isArray(entry.propriedades) && entry.propriedades.length > 0 && (
          <div className="text-[11px] leading-snug pt-1">
            <span className="text-slate-500 dark:text-ecoar-light-900/55">Propriedades: </span>
            <span className="text-slate-800 dark:text-ecoar-light-900/85">{entry.propriedades.join(' · ')}</span>
          </div>
        )}
        {footer}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-ecoar-light-900/15 bg-white dark:bg-ecoar-dark-800/50 p-3 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-ecoar-light-900">{item.nome}</h4>
        <span className="text-xs tabular-nums text-slate-600 dark:text-ecoar-light-900/70">
          {formatCerosDisplay(item.custoCeros)}
        </span>
      </div>
      <Stat label="Categoria" value={entry.utilityCategory} />
      <Stat label="Espaço" value={entry.space} />
      <Stat label="Cargas" value={entry.charges} />
      {entry.effect && (
        <div className="text-[11px] text-slate-800 dark:text-ecoar-light-900/85 whitespace-pre-wrap">{entry.effect}</div>
      )}
      {footer}
    </div>
  )
}
