'use client'

import { usePathname } from 'next/navigation'

const HERO_GLITCH = "/assets/branding/heroes/hero-01-glitch-2k.png"

export default function AppSurfaceBackground() {
  const pathname = usePathname()
  const isAuthLanding = pathname === '/'

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[#e8eeed] dark:bg-[#1a1d21]" />

      {isAuthLanding && (
        <>
          <div
            className="absolute -inset-[8%] opacity-0 dark:opacity-[0.38] bg-cover bg-center scale-105 saturate-[0.85] contrast-[1.05]"
            style={{ backgroundImage: `url('${HERO_GLITCH}')` }}
          />
          <div
            className="absolute inset-0 opacity-0 dark:opacity-100"
            style={{
              background:
                'linear-gradient(90deg, rgba(26,29,33,0.92) 0%, rgba(26,29,33,0.55) 45%, rgba(26,29,33,0.35) 100%)',
            }}
          />
        </>
      )}

      {!isAuthLanding && (
        <div
          className="absolute inset-0 opacity-0 dark:opacity-[0.12] bg-cover bg-center saturate-[0.8]"
          style={{ backgroundImage: `url('${HERO_GLITCH}')` }}
        />
      )}

      <div
        className={`absolute inset-0 ${isAuthLanding ? 'opacity-[0.22] dark:opacity-[0.42]' : 'opacity-[0.18] dark:opacity-[0.28]'}`}
        style={{
          backgroundImage:
            'linear-gradient(rgba(123,183,187,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(123,183,187,0.28) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
    </div>
  )
}
