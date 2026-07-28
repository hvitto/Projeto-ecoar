type StepRailProps = {
  steps: string[]
  current: number
  onSelect?: (index: number) => void
  className?: string
}

export default function StepRail({ steps, current, onSelect, className = '' }: StepRailProps) {
  return (
    <nav className={`flex flex-col border border-ecoar-teal/50 dark:border-ecoar-teal ${className}`}>
      <div className="px-3 py-2 border-b border-ecoar-teal/40 dark:border-ecoar-teal/60 text-[9px] uppercase tracking-[0.16em] text-ecoar-teal">
        COORDS · STEPS
      </div>
      <ul className="flex flex-col">
        {steps.map((label, i) => {
          const active = i === current
          const done = i < current
          return (
            <li key={label} className="border-b border-ecoar-teal/30 last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect?.(i)}
                className={`w-full flex items-stretch text-left transition-colors ${
                  active
                    ? 'bg-ecoar-magenta text-[var(--ecoar-accent-ink)]'
                    : done
                      ? 'bg-ecoar-teal/10 text-ecoar-dark-900 dark:text-ecoar-light-900'
                      : 'text-ecoar-dark-500 dark:text-[#adb5bd] hover:bg-ecoar-teal/5'
                }`}
              >
                <span className="w-10 shrink-0 px-2 py-2.5 text-[10px] tracking-[0.12em] border-r border-ecoar-teal/35 flex items-center justify-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 px-3 py-2.5 text-[10px] uppercase tracking-[0.1em] font-medium">
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
