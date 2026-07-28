'use client'

import { selectedPanel, idlePanel, disabledPanel, mutedBody } from '@/shared/styles/ecoarChrome'

interface DisadvantageCardProps {
  name: string
  description: string
  pontosCriacao: number
  isSelected: boolean
  onClick: () => void
  className?: string
  disabled?: boolean
}

export default function DisadvantageCard({
  name,
  description,
  pontosCriacao,
  isSelected,
  onClick,
  className = '',
  disabled = false,
}: DisadvantageCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`p-3.5 rounded-none border transition-colors duration-200 text-left ${
        disabled ? disabledPanel : isSelected ? selectedPanel : `${idlePanel} cursor-pointer`
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h5 className="font-display uppercase tracking-[-0.01em] text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm">
          {name}
        </h5>
        {isSelected ? (
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] bg-ecoar-magenta text-[var(--ecoar-accent-ink)] px-1.5 py-0.5">
            SEL
          </span>
        ) : null}
      </div>
      <p className={`${mutedBody} mb-1.5`}>{description}</p>
      <span className="text-[9px] uppercase tracking-[0.12em] text-ecoar-magenta border border-ecoar-magenta/50 px-1.5 py-0.5">
        +{pontosCriacao} PC
      </span>
    </button>
  )
}
