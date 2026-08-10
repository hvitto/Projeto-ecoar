import Image from 'next/image'
import type { ReactNode } from 'react'

type SelectPlateProps = {
  title: string
  description?: string
  meta?: ReactNode
  figure?: string
  imageSrc?: string
  imageAlt?: string
  selected?: boolean
  onClick?: () => void
  index?: number
  className?: string
  ariaLabel?: string
  selection?: 'toggle' | 'radio' | 'action'
}

export default function SelectPlate({
  title,
  description,
  meta,
  figure,
  imageSrc,
  imageAlt,
  selected = false,
  onClick,
  index,
  className = '',
  ariaLabel,
  selection = 'toggle',
}: SelectPlateProps) {
  const code = index != null ? String(index + 1).padStart(2, '0') : '—'

  const selectionProps =
    selection === 'radio'
      ? ({ role: 'radio', 'aria-checked': selected } as const)
      : selection === 'action'
        ? ({} as const)
        : ({ 'aria-pressed': selected } as const)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      {...selectionProps}
      className={`group relative text-left border transition-colors overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-magenta ${
        selected
          ? '!border-ecoar-magenta bg-[#1a1218] dark:bg-ecoar-magenta/15'
          : '!border-ecoar-teal/45 dark:!border-ecoar-teal/55 bg-[#12151a] dark:bg-[#0a0a0a]/70 hover:!border-ecoar-magenta/55'
      } ${className}`}
    >
      <div
        className={`flex items-stretch ${figure ? 'min-h-[6.5rem]' : 'min-h-[5.25rem]'}`}
        aria-hidden={ariaLabel ? true : undefined}
      >
        <div className="w-8 shrink-0 border-r border-inherit flex flex-col items-center justify-between py-2 text-[0.6875rem] uppercase tracking-[0.14em] text-[#c5c8ce] font-normal">
          <span>{code}</span>
          <span className="writing-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>
            PLATE
          </span>
        </div>

        {imageSrc ? (
          <div className="relative w-[5.5rem] sm:w-28 shrink-0 border-r border-inherit bg-[#0a0a0a]">
            <Image
              src={imageSrc}
              alt={imageAlt ?? ''}
              fill
              sizes="112px"
              className="object-cover object-top contrast-[1.08] saturate-[0.85] grayscale-[0.15]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,transparent_40%,rgba(10,10,10,0.55)_100%)] pointer-events-none" />
          </div>
        ) : null}

        {figure ? (
          <div className="shrink-0 w-[4.25rem] sm:w-[5rem] border-r border-inherit flex items-center justify-center px-2">
            <span
              className={`font-display text-[1.85rem] sm:text-[2.25rem] leading-none tracking-[-0.03em] tabular-nums ${
                selected ? 'text-[#e8a8d8]' : 'text-[#f5f5f5]'
              }`}
            >
              {figure}
            </span>
          </div>
        ) : null}

        <div className="flex-1 min-w-0 p-2.5 flex flex-col gap-1">
          <span
            className={
              figure
                ? `font-mono text-xs uppercase tracking-[0.14em] font-normal ${
                    selected ? 'text-[#e8a8d8]' : 'text-[#c5c8ce]'
                  }`
                : 'font-display text-sm sm:text-[0.95rem] uppercase tracking-[-0.02em] leading-[1.05] text-[#f5f5f5] truncate'
            }
          >
            {title}
          </span>
          {description ? (
            <p className="text-xs leading-snug text-[#c5c8ce] line-clamp-2 font-normal">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-auto pt-1 font-normal">{meta}</div> : null}
        </div>
      </div>

      {selected ? (
        <span
          aria-hidden="true"
          className="absolute top-0 right-0 px-2 py-1 text-xs uppercase tracking-[0.14em] font-normal bg-ecoar-magenta text-[var(--ecoar-accent-ink)]"
        >
          SEL
        </span>
      ) : null}
    </button>
  )
}
