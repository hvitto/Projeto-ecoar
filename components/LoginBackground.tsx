'use client'

/**
 * Fundo da tela de login:
 * gradiente preto, reflexo em branco (animado), grain.
 */
export default function LoginBackground() {
  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Camada 1 – Base: gradiente preto + reflexo em branco (animado) */}
      <div
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#1a1a1a]"
        aria-hidden="true"
      />
      {/* Reflexo em branco – animação sutil de opacidade/posição */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none login-bg-shine"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      {/* Camada 2 – Grain (noise) */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="login-bg-grain" x="0" y="0">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" result="gray" />
            <feBlend in="SourceGraphic" in2="gray" mode="screen" />
          </filter>
        </defs>
      </svg>
      <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        style={{ filter: 'url(#login-bg-grain)', background: 'rgba(0,0,0,0.9)' }}
        aria-hidden="true"
      />

      {/* Camada 3 – Overlay sutil nas bordas */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_0%,rgba(20,20,20,0.3)_70%,rgba(10,10,10,0.5)_100%)]"
        aria-hidden="true"
      />
    </div>
  )
}
