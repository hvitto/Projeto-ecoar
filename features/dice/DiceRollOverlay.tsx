'use client'

import { useEffect } from 'react'

type DiceRollOverlayProps = {
  open: boolean
  label: string
  result?: null
  error?: string | null
  loading?: boolean
  onClose: () => void
}

export function DiceRollOverlay({ open, label, error, onClose }: DiceRollOverlayProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !error) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label || 'Erro na rolagem'}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-sm border border-slate-300/40 bg-ecoar-dark-900/95 px-4 py-3 shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Rolagem
        </div>
        <div className="mt-1 truncate text-sm font-semibold text-ecoar-light-900">{label}</div>
        <p className="mt-3 text-sm text-ecoar-magenta">{error}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-sm border border-slate-400/30 px-3 py-2 text-sm font-semibold text-ecoar-light-900/90 transition-colors hover:bg-ecoar-light-900/10"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

export default DiceRollOverlay
