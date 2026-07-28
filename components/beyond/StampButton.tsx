import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type StampButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  tone?: 'accent' | 'ghost' | 'grid'
}

const StampButton = forwardRef<HTMLButtonElement, StampButtonProps>(
  function StampButton(
    { children, tone = 'accent', className = '', type = 'button', ...rest },
    ref,
  ) {
    const tones = {
      accent:
        'bg-ecoar-magenta text-[var(--ecoar-accent-ink)] hover:brightness-110 border border-ecoar-magenta',
      ghost:
        'bg-transparent text-ecoar-dark-900 dark:text-ecoar-light-900 border border-ecoar-teal/50 dark:border-ecoar-teal hover:bg-ecoar-teal/10',
      grid:
        'bg-transparent text-ecoar-teal border border-ecoar-teal/60 dark:border-ecoar-teal hover:bg-ecoar-teal/10',
    }

    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-xs font-bold uppercase tracking-[0.12em] transition-all disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal ${tones[tone]} ${className}`}
        {...rest}
      >
        {children}
      </button>
    )
  },
)

export default StampButton
