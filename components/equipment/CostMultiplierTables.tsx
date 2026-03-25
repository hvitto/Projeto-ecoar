'use client'

import type { CostMultiplierTable } from '@/types/equipment'
import { equipmentStyleLabels } from '@/data/equipment/costMultipliers'

const COLS = ['reclusa', 'vaporAlquimico', 'darenferrum', 'imaculada', 'paginas'] as const

export default function CostMultiplierTables({ tables }: { tables: CostMultiplierTable[] }) {
  return (
    <div className="space-y-8">
      {tables.map((t) => (
        <div key={t.id}>
          <h3 className="text-sm font-semibold text-ecoar-dark-800 dark:text-ecoar-light-900/90 mb-3">{t.title}</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-ecoar-light-900/15">
            <table className="w-full text-xs text-left min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-ecoar-light-900/[0.06] border-b border-slate-200 dark:border-ecoar-light-900/10">
                  <th className="px-3 py-2 font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900/80">Grupo</th>
                  {COLS.map((c) => (
                    <th key={c} className="px-2 py-2 font-semibold text-ecoar-dark-700 dark:text-ecoar-light-900/80 whitespace-nowrap">
                      {equipmentStyleLabels[c]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row) => (
                  <tr
                    key={row.group}
                    className="border-b border-slate-100 dark:border-ecoar-light-900/[0.06] last:border-0 hover:bg-slate-50/80 dark:hover:bg-ecoar-light-900/[0.04]"
                  >
                    <td className="px-3 py-2 text-ecoar-dark-800 dark:text-ecoar-light-900/85">{row.group}</td>
                    {COLS.map((c) => (
                      <td key={c} className="px-2 py-2 text-ecoar-dark-600 dark:text-ecoar-light-900/65 tabular-nums">
                        {row[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
