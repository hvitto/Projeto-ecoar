'use client'

import { useEffect, useId, useRef } from 'react'
import StampButton from '@/components/beyond/StampButton'
import CoordLabel from '@/components/beyond/CoordLabel'

type DeleteCharacterDialogProps = {
  characterName: string
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteCharacterDialog({
  characterName,
  busy,
  error,
  onCancel,
  onConfirm,
}: DeleteCharacterDialogProps) {
  const titleId = useId()
  const bodyId = useId()
  const errorId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const displayName = characterName.trim() || 'Sem nome'

  useEffect(() => {
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusId = window.setTimeout(() => cancelRef.current?.focus(), 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault()
        event.stopPropagation()
        onCancel()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.clearTimeout(focusId)
      window.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = prevOverflow
      prev?.focus()
    }
  }, [busy, onCancel])

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel()
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-busy={busy}
        aria-labelledby={titleId}
        aria-describedby={error ? `${bodyId} ${errorId}` : bodyId}
        className="w-full max-w-md border border-ecoar-teal/50 bg-[#1a1d21] p-4"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className="font-display text-base uppercase tracking-[-0.02em] text-[#f5f5f5] min-w-0 break-words"
          >
            Apagar {displayName}
          </h2>
          <CoordLabel refId="DEL-SHEET" className="shrink-0" />
        </div>
        <p id={bodyId} className="font-mono text-xs leading-relaxed text-[#adb5bd]">
          Esta ação é irreversível. A ficha some do elenco e não dá para desfazer.
        </p>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-3 border border-ecoar-magenta/50 bg-ecoar-magenta/10 px-3 py-2 font-mono text-xs text-[#f5f5f5]"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <StampButton
            ref={cancelRef}
            tone="ghost"
            onClick={onCancel}
            disabled={busy}
            className="min-h-11 px-4 py-2"
          >
            Voltar
          </StampButton>
          <StampButton
            tone="accent"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-11 px-4 py-2"
            aria-label={
              busy
                ? `Apagando ${displayName}`
                : error
                  ? `Tentar apagar ${displayName} de novo`
                  : `Confirmar apagar ${displayName}`
            }
          >
            {busy ? 'Apagando…' : error ? 'Tentar de novo' : 'Apagar ficha'}
          </StampButton>
        </div>
      </div>
    </div>
  )
}
