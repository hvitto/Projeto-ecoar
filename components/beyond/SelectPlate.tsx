import Image from 'next/image'
import type { ReactNode } from 'react'

type SelectPlateProps = {
  title: string
  description?: string
  meta?: ReactNode
  imageSrc?: string
  imageAlt?: string
  selected?: boolean
  onClick?: () => void
  index?: number
  className?: string
}

export default function SelectPlate({
  title,
  description,
  meta,
  imageSrc,
  imageAlt,
  selected = false,
  onClick,
  index,
  className = '',
}: SelectPlateProps) {
  const code = index != null ? String(index + 1).padStart(2, '0') : '—'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative text-left border transition-colors overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal ${
        selected
          ? 'border-ecoar-magenta bg-ecoar-magenta/10 dark:bg-ecoar-magenta/15'
          : 'border-ecoar-teal/45 dark:border-ecoar-teal/55 bg-[#0a0a0a]/40 hover:border-ecoar-teal'
      } ${className}`}
    >
      <div className="flex items-stretch min-h-[5.25rem]">
        <div className="w-8 shrink-0 border-r border-inherit flex flex-col items-center justify-between py-2 text-[9px] uppercase tracking-[0.14em] text-ecoar-teal">
          <span>{code}</span>
          <span className="writing-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>
            PLATE
          </span>
        </div>

        {imageSrc ? (
          <div className="relative w-[5.5rem] sm:w-28 shrink-0 border-r border-inherit bg-[#0a0a0a]">
            <Image
              src={imageSrc}
              alt={imageAlt ?? title}
              fill
              sizes="112px"
              className="object-cover object-top contrast-[1.08] saturate-[0.85] grayscale-[0.15]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,transparent_40%,rgba(10,10,10,0.55)_100%)] pointer-events-none" />
          </div>
        ) : null}

        <div className="flex-1 min-w-0 p-2.5 flex flex-col gap-1">
          <h3 className="font-display text-sm sm:text-base uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 truncate">
            {title}
          </h3>
          {description ? (
            <p className="text-[0.6875rem] sm:text-xs leading-snug text-ecoar-dark-600 dark:text-[#c5c8ce] line-clamp-2">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-auto pt-1">{meta}</div> : null}
        </div>
      </div>

      {selected ? (
        <span className="absolute top-0 right-0 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] bg-ecoar-magenta text-[var(--ecoar-accent-ink)]">
          SEL
        </span>
      ) : null}
    </button>
  )
}
