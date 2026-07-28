'use client'

import { useEffect, useState } from 'react'
import { sheetBtnCompact, sheetBtnGhost } from '@/features/character/sheet/sheetChrome'

const STORAGE_KEY = 'ecoar.sheet.dual-mode-hint.v1'

export function SheetDualModeHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === '1') return
      setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      setVisible(false)
    }
  }

  if (!visible) return null

  return (
    <aside
      role="status"
      aria-live="polite"
      className="mb-1.5 rounded-none border border-ecoar-teal/45 bg-ecoar-teal/10 px-2.5 py-2 sm:mb-2 sm:px-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] font-normal uppercase tracking-[0.14em] text-ecoar-teal">
            Mesa e ficha
          </p>
          <p className="mt-1 font-mono text-[11px] leading-relaxed tracking-[0.02em] text-[#f5f5f5]">
            Na mesa, ajuste limites sem Editar. Para raça, trilha, inventário e estrutura, use
            Editar e depois Salvar.
          </p>
          <p className="mt-1.5 font-mono text-[10px] leading-relaxed tracking-[0.04em] text-[#adb5bd]">
            Atalhos: 1–3 abas · E editar · Ctrl+S salvar · Esc cancelar
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className={`${sheetBtnGhost} ${sheetBtnCompact} shrink-0`}
        >
          Entendi
        </button>
      </div>
    </aside>
  )
}

export default SheetDualModeHint
