'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  sheetBtnGhost,
  sheetBtnTealStrong,
} from '@/features/character/sheet/sheetChrome'

export type SheetConfirmRequest = {
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
}

type SheetConfirmContextValue = {
  requestConfirm: (request: SheetConfirmRequest) => Promise<boolean>
}

const SheetConfirmContext = createContext<SheetConfirmContextValue | null>(null)

type Pending = SheetConfirmRequest & {
  resolve: (value: boolean) => void
}

export function SheetConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const bodyId = useId()

  const requestConfirm = useCallback((request: SheetConfirmRequest) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...request, resolve })
    })
  }, [])

  const close = useCallback((value: boolean) => {
    setPending((current) => {
      current?.resolve(value)
      return null
    })
  }, [])

  useEffect(() => {
    if (!pending) return
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusId = window.setTimeout(() => confirmBtnRef.current?.focus(), 0)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        close(false)
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.clearTimeout(focusId)
      window.removeEventListener('keydown', onKeyDown, true)
      prev?.focus()
    }
  }, [close, pending])

  return (
    <SheetConfirmContext.Provider value={{ requestConfirm }}>
      {children}
      {pending ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close(false)
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            className="w-full max-w-md border border-ecoar-teal/50 bg-[#1a1d21] p-4 shadow-none"
          >
            <h2
              id={titleId}
              className="font-display text-base uppercase tracking-[-0.02em] text-[#f5f5f5]"
            >
              {pending.title}
            </h2>
            <p
              id={bodyId}
              className="mt-2 font-mono text-xs leading-relaxed text-[#adb5bd]"
            >
              {pending.body}
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => close(false)}
                className={sheetBtnGhost}
              >
                {pending.cancelLabel ?? 'Voltar'}
              </button>
              <button
                type="button"
                ref={confirmBtnRef}
                onClick={() => close(true)}
                className={sheetBtnTealStrong}
              >
                {pending.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SheetConfirmContext.Provider>
  )
}

export function useSheetConfirm(): SheetConfirmContextValue {
  const ctx = useContext(SheetConfirmContext)
  if (!ctx) {
    throw new Error('useSheetConfirm must be used within SheetConfirmProvider')
  }
  return ctx
}
