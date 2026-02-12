'use client'

/**
 * Fundo da tela de login:
 * modo claro: gradiente teal claro, reflexo sutil, grain discreto.
 * modo escuro: gradiente preto, reflexo em branco (animado), grain.
 */
export default function LoginBackground() {
  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Camada 1 – Base: light = gradiente claro; dark = preto */}
      <div
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#e8eeed] via-ecoar-teal-50 to-ecoar-teal-100 dark:from-[#0a0a0a] dark:via-[#141414] dark:to-[#1a1a1a]"
        aria-hidden="true"
      />
      {/* Reflexo – light: sutil escuro; dark: branco animado */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none login-bg-shine opacity-100 dark:opacity-0"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 30% 30%, rgba(0,0,0,0.04) 0%, transparent 55%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 w-full h-full pointer-events-none login-bg-shine opacity-0 dark:opacity-100"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      {/* Grain – light: multiply + fundo claro; dark: screen + fundo escuro */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="login-bg-grain" x="0" y="0">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" result="gray" />
            <feBlend in="SourceGraphic" in2="gray" mode="screen" />
          </filter>
          <filter id="login-bg-grain-light" x="0" y="0">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" result="gray" />
            <feBlend in="SourceGraphic" in2="gray" mode="multiply" />
          </filter>
        </defs>
      </svg>
      <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12] dark:opacity-0"
        style={{ filter: 'url(#login-bg-grain-light)', background: 'rgba(255,255,255,0.6)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-0 dark:opacity-20"
        style={{ filter: 'url(#login-bg-grain)', background: 'rgba(0,0,0,0.9)' }}
        aria-hidden="true"
      />

      {/* Overlay bordas – light: claro; dark: escuro */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,rgba(240,250,251,0.35)_70%,rgba(232,245,245,0.5)_100%)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,rgba(20,20,20,0.3)_70%,rgba(10,10,10,0.5)_100%)]"
        aria-hidden="true"
      />
    </div>
  )
}
