import Image from 'next/image'

export type HeroVariant = 'glitch' | 'circuit' | 'blocks' | 'dither' | 'trade'

const HERO_SRC: Record<
  HeroVariant,
  { full: string; alt: string; code: string; transparent?: boolean }
> = {
  glitch: {
    full: '/assets/branding/heroes/hero-01-glitch-2k.png',
    alt: 'ECOAR + — ondas glitch do mundo ECOAR',
    code: '01 · GLITCH WAVES',
  },
  circuit: {
    full: '/assets/branding/heroes/hero-02-circuit-2k.png',
    alt: 'ECOAR + — blueprint de circuito',
    code: '02 · CIRCUIT BLUEPRINT',
  },
  blocks: {
    full: '/assets/branding/heroes/hero-03-blocks-2k.png',
    alt: 'ECOAR + — blocos geométricos',
    code: '03 · GEOMETRIC BLOCKS',
  },
  dither: {
    full: '/assets/branding/heroes/hero-04-dither-2k.png',
    alt: 'ECOAR + — campo dither',
    code: '04 · DITHER FIELD',
  },
  trade: {
    full: '/assets/branding/heroes/hero-trade.png',
    alt: 'Figura ECOAR — Triade em espelho partido',
    code: '03.1 · TRÍADE',
    transparent: true,
  },
}

type HeroFrameProps = {
  variant?: HeroVariant
  label?: string
  className?: string
  aspect?: '16/11' | 'fill' | 'portrait'
  priority?: boolean
  objectPosition?: string
}

export default function HeroFrame({
  variant = 'glitch',
  label,
  className = '',
  aspect = '16/11',
  priority = false,
  objectPosition = 'center',
}: HeroFrameProps) {
  const hero = HERO_SRC[variant]
  const aspectClass =
    aspect === 'fill'
      ? 'min-h-0 aspect-auto'
      : aspect === 'portrait'
        ? 'aspect-[3/4] min-h-[120px] max-h-[min(36vh,200px)] lg:max-h-none'
        : 'aspect-[16/11]'
  const caption = label ?? `ECOAR · ${hero.code}`
  const cutout = Boolean(hero.transparent)
  const imageTone = cutout
    ? 'object-cover object-top contrast-[1.04] saturate-[1.04]'
    : 'object-cover contrast-[1.05] saturate-[1.05]'

  return (
    <div
      className={`relative w-full overflow-hidden border border-ecoar-dark-900/40 dark:border-ecoar-teal/35 ${
        cutout ? 'bg-transparent' : 'bg-[#0a0a0a]'
      } ${aspectClass} ${className}`}
    >
      <Image
        src={hero.full}
        alt={hero.alt}
        fill
        priority={priority}
        unoptimized={cutout}
        sizes="(max-width: 1024px) 100vw, 40vw"
        className={imageTone}
        style={{ objectPosition }}
      />
      <span className="absolute left-2 bottom-1.5 right-2 z-10 truncate bg-[#0a0a0a]/75 px-2 py-1 text-[0.6875rem] uppercase tracking-[0.12em] text-[#f5f5f5]">
        {caption}
      </span>
    </div>
  )
}
