'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

const PARALLAX_FACTOR = 0.03
const MAX_OFFSET_PX = 20
const TRANSITION_MS = 120
const IMAGE_SCALE = 1.05
const IMAGE_SRC = '/assets/images/login-parallax.png'

export default function LoginParallaxArt() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const rafId = useRef<number | null>(null)
  const lastInput = useRef<{ x: number; y: number } | null>(null)

  const clamp = (value: number, max: number) =>
    Math.max(-max, Math.min(max, value))

  const updateFromPosition = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const rawX = (clientX - centerX) * PARALLAX_FACTOR
    const rawY = (clientY - centerY) * PARALLAX_FACTOR
    const x = clamp(rawX, MAX_OFFSET_PX)
    const y = clamp(rawY, MAX_OFFSET_PX)
    lastInput.current = { x, y }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const tick = () => {
      rafId.current = null
      if (lastInput.current) {
        setOffset(lastInput.current)
      }
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY : e.clientY
      if (clientX == null || clientY == null) return
      updateFromPosition(clientX, clientY)
      if (rafId.current == null) {
        rafId.current = requestAnimationFrame(tick)
      }
    }

    const onLeave = () => {
      lastInput.current = { x: 0, y: 0 }
      setOffset({ x: 0, y: 0 })
    }

    el.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('touchend', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('touchend', onLeave)
      if (rafId.current != null) cancelAnimationFrame(rafId.current)
    }
  }, [updateFromPosition])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Arte em tela cheia, meio opaca e apagada (estilo fundo suave) */}
      <div
        className="absolute inset-0 w-full h-full opacity-60"
        style={{
          transition: `transform ${TRANSITION_MS}ms ease-out`,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${IMAGE_SCALE})`,
        }}
      >
        <img
          src={IMAGE_SRC}
          alt=""
          role="presentation"
          className="w-full h-full object-cover object-[center_30%]"
          draggable={false}
        />
      </div>
      {/* Overlay suave para “apagar” e integrar ao fundo */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.25) 100%)',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
