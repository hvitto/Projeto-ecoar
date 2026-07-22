'use client'

import { useEffect, useRef, useState } from 'react'
import type { DiceFaceResult } from '@/lib/dice/rollExpression'
import { mountDiceThrowScene } from '@/features/dice/threeDiceScene'

export const DICE_THROW_EVENT = 'ecoar-dice-throw'

export type DiceThrowEventDetail = {
  tableId?: string | null
  label?: string
  total?: number
  detail?: string
  dice: DiceFaceResult[]
}

export function dispatchDiceThrow(detail: DiceThrowEventDetail) {
  if (typeof window === 'undefined') return
  if (!detail.dice || detail.dice.length === 0) return
  window.dispatchEvent(new CustomEvent(DICE_THROW_EVENT, { detail }))
}

type ActiveThrow = {
  key: string
  label?: string
  total?: number
  detail?: string
  dice: DiceFaceResult[]
}

export function DiceThrowStage() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<ActiveThrow | null>(null)
  const [visible, setVisible] = useState(false)
  const [showHud, setShowHud] = useState(false)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const onThrow = (ev: Event) => {
      const detail = (ev as CustomEvent<DiceThrowEventDetail>).detail
      if (!detail?.dice?.length) return
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      setShowHud(false)
      setActive({
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: detail.label,
        total: detail.total,
        detail: detail.detail,
        dice: detail.dice,
      })
      setVisible(true)
    }
    window.addEventListener(DICE_THROW_EVENT, onThrow)
    return () => window.removeEventListener(DICE_THROW_EVENT, onThrow)
  }, [])

  useEffect(() => {
    if (!active || !hostRef.current) return
    const host = hostRef.current
    const handle = mountDiceThrowScene(host, active.dice, {
      durationMs: 1800,
      onSettled: () => {
        setShowHud(true)
        hideTimerRef.current = window.setTimeout(() => {
          setVisible(false)
          setActive(null)
          setShowHud(false)
          hideTimerRef.current = null
        }, 1600)
      },
    })
    return () => {
      handle.dispose()
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [active])

  if (!visible || !active) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden
    >
      <div ref={hostRef} className="absolute inset-0 h-full w-full" />
      {showHud && active.total != null ? (
        <div className="absolute bottom-8 left-1/2 z-[101] max-w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-sm border border-ecoar-teal-500/35 bg-ecoar-dark-900/80 px-4 py-2.5 text-center shadow-lg backdrop-blur-sm">
          {active.label ? (
            <div className="truncate text-[10px] font-semibold uppercase tracking-wide text-ecoar-teal-300/90">
              {active.label}
            </div>
          ) : null}
          {active.detail ? (
            <div className="mt-0.5 truncate text-[11px] text-slate-300/90">{active.detail}</div>
          ) : null}
          <div className="mt-1 text-3xl font-semibold tabular-nums text-ecoar-teal-300">{active.total}</div>
        </div>
      ) : null}
    </div>
  )
}

export default DiceThrowStage
