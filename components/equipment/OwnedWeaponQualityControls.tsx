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
import {
  sheetBtnCompact,
  sheetBtnGhost,
  sheetBtnTeal,
} from '@/features/character/sheet/sheetChrome'

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
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#adb5bd]">
        Qualidade:{' '}
        <span className="font-semibold normal-case tracking-normal text-[#f5f5f5]">
          {formatOwnedItemQualityLabel(nivel)}
        </span>
      </span>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          disabled={!canDown}
          onClick={() => onChangeQuality(downNivel)}
          className={`${sheetBtnGhost} ${sheetBtnCompact} !min-w-7 !px-1.5`}
          aria-label="Diminuir qualidade"
        >
          −
        </button>
        <button
          type="button"
          disabled={!canUp}
          onClick={() => onChangeQuality(upNivel)}
          className={`${sheetBtnTeal} ${sheetBtnCompact} !min-w-7 !px-1.5`}
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
      {nivel < EQUIPMENT_QUALITY_MAX ? (
        <span className="font-mono text-[10px] tabular-nums text-[#adb5bd]">
          próximo: {formatCerosDisplay(upDelta)}
        </span>
      ) : null}
    </div>
  )
}

export default OwnedWeaponQualityControls
