'use client'

import { ReactNode } from 'react'
import { selectedPanel, idlePanel, disabledPanel, microLabel, mutedBody } from '@/shared/styles/ecoarChrome'

interface SingularityCardProps {
  name: string
  description: string
  cost: number
  costLabel?: string
  secondaryCost?: string
  isSelected: boolean
  canAfford: boolean
  canSelect: boolean
  onClick: () => void
  requirements?: string[]
  requirementsText?: string
  level?: number
  levelLabel?: string
  effects?: string
  variant?: 'default' | 'teal' | 'magenta'
  footer?: ReactNode
  className?: string
}

const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export default function SingularityCard({
  name,
  description,
  cost,
  costLabel = 'PC',
  secondaryCost,
  isSelected,
  canSelect,
  onClick,
  requirements,
  requirementsText,
  level,
  levelLabel,
  effects,
  footer,
  className = '',
}: SingularityCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isSelected && !canSelect}
      className={`p-3.5 rounded-none border text-left transition-colors duration-200 overflow-hidden ${
        isSelected ? selectedPanel : canSelect ? `${idlePanel} cursor-pointer` : disabledPanel
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="font-display uppercase tracking-[-0.01em] text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm leading-tight">{name}</div>
          {level && (
            <div className={`${microLabel} mt-0.5`}>
              {levelLabel || `Nível ${level}`} {level <= 12 ? `(${romanNumerals[level - 1]})` : ''}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-ecoar-magenta font-semibold text-[11px] uppercase tracking-[0.08em] bg-ecoar-magenta/10 px-1.5 py-0.5 border border-ecoar-magenta/50 whitespace-nowrap">
          {cost} {costLabel}
          {secondaryCost && (
            <div className="text-[9px] text-ecoar-magenta/80 normal-case tracking-normal">({secondaryCost})</div>
          )}
        </div>
      </div>
      <p className={`${mutedBody} mb-1 line-clamp-3`}>{description}</p>
      {effects && (
        <p className="text-[11px] text-ecoar-dark-500 dark:text-[#adb5bd] mb-1.5">{effects}</p>
      )}
      {requirements && requirements.length > 0 && (
        <div className={microLabel}>
          Requisitos: {requirements.join(', ')}
        </div>
      )}
      {requirementsText && (
        <div className={`${microLabel} mt-1.5 pt-1.5 border-t border-ecoar-teal/25 dark:border-ecoar-teal/20`}>
          {requirementsText}
        </div>
      )}
      {footer}
    </button>
  )
}
