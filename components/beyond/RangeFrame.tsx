import type { ReactNode } from 'react'
import CoordLabel from './CoordLabel'

type RangeFrameProps = {
  children: ReactNode
  title?: string
  refId?: string
  className?: string
  bodyClassName?: string
}

export default function RangeFrame({
  children,
  title,
  refId,
  className = '',
  bodyClassName = '',
}: RangeFrameProps) {
  const showHeader = Boolean(title) || refId != null

  return (
    <section
      className={`border border-ecoar-teal/50 dark:border-ecoar-teal bg-white/80 dark:bg-[#0a0a0a]/55 ${className}`}
    >
      {showHeader ? (
        <div className="flex items-stretch border-b border-ecoar-teal/40 dark:border-ecoar-teal/60">
          {title ? (
            <div className="flex-1 px-3 py-2 font-display text-xs uppercase tracking-[0.04em] text-ecoar-dark-900 dark:text-ecoar-light-900 border-r border-ecoar-teal/40 dark:border-ecoar-teal/60">
              {title}
            </div>
          ) : null}
          {refId != null ? (
            <div className="px-3 py-2 flex items-center">
              <CoordLabel refId={refId} />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={`relative ${bodyClassName}`}>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-3 flex flex-col justify-between py-1 text-[8px] tracking-widest text-ecoar-teal/70"
          aria-hidden
        >
          {['·', '·', '·', '·', '·'].map((tick, i) => (
            <span key={i} className="pl-1 border-t border-ecoar-teal/40">
              {tick}
            </span>
          ))}
        </div>
        <div className="pl-4">{children}</div>
      </div>
    </section>
  )
}
