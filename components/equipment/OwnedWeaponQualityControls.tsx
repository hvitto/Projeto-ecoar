'use client'

import {
  EQUIPMENT_QUALITY_MAX,
  EQUIPMENT_QUALITY_MIN,
  clampEquipmentQualityNivel,
  costDeltaForQualityChange,
  formatOwnedItemQualityLabel,
  resolveOwnedBaseCeros,
} from '@/lib/equipmentQuality'
import { formatCerosDisplay } from '@/lib/equipmentCost'
import type { CatalogOwnedItem } from '@/shared/types/equipment'

export function OwnedWeaponQualityControls({
  item,
  saldoDisponivel,
  disabled,
  onChangeQuality,
  compact = false,
}: {
  item: CatalogOwnedItem
  saldoDisponivel: number
  disabled?: boolean
  onChangeQuality: (nextNivel: number) => void
  compact?: boolean
}) {
  if (item.kind !== 'weapon') return null

  const nivel = clampEquipmentQualityNivel(item.qualidadeNivel ?? 0)
  const base = resolveOwnedBaseCeros(item)
  const upNivel = clampEquipmentQualityNivel(nivel + 1)
  const downNivel = clampEquipmentQualityNivel(nivel - 1)
  const upDelta = costDeltaForQualityChange({
    baseCeros: base,
    fromNivel: nivel,
    toNivel: upNivel,
    banhadoPrata: item.banhadoPrata,
  })
  const canUp = !disabled && nivel < EQUIPMENT_QUALITY_MAX && upDelta <= saldoDisponivel
  const canDown = !disabled && nivel > EQUIPMENT_QUALITY_MIN

  return (
    <div
      className={
        compact
          ? 'flex flex-wrap items-center gap-1.5'
          : 'flex flex-wrap items-center gap-2'
      }
    >
      <span
        className={
          compact
            ? 'text-[11px] text-slate-600 dark:text-ecoar-light-900/70'
            : 'text-xs text-slate-600 dark:text-ecoar-light-900/70'
        }
      >
        Qualidade: <span className="font-semibold text-slate-900 dark:text-ecoar-light-900">{formatOwnedItemQualityLabel(nivel)}</span>
      </span>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          disabled={!canDown}
          onClick={() => onChangeQuality(downNivel)}
          className="h-7 min-w-7 rounded-md border border-slate-200 px-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-ecoar-light-900/20 dark:text-ecoar-light-900"
          aria-label="Diminuir qualidade"
        >
          −
        </button>
        <button
          type="button"
          disabled={!canUp}
          onClick={() => onChangeQuality(upNivel)}
          className="h-7 min-w-7 rounded-md border border-ecoar-teal/40 bg-ecoar-teal/10 px-2 text-xs font-semibold text-ecoar-teal-800 disabled:cursor-not-allowed disabled:opacity-40 dark:text-ecoar-teal-300"
          aria-label="Aumentar qualidade"
          title={
            nivel >= EQUIPMENT_QUALITY_MAX
              ? 'Qualidade máxima (Artefato)'
              : upDelta > saldoDisponivel
                ? `Saldo insuficiente (${formatCerosDisplay(upDelta)})`
                : `Melhorar (+${formatCerosDisplay(upDelta)})`
          }
        >
          +
        </button>
      </div>
      {nivel < EQUIPMENT_QUALITY_MAX && (
        <span className="text-[10px] tabular-nums text-slate-500 dark:text-ecoar-light-900/55">
          próximo: {formatCerosDisplay(upDelta)}
        </span>
      )}
    </div>
  )
}

export default OwnedWeaponQualityControls
