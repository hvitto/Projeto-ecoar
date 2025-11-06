'use client'

import { motion } from 'framer-motion'
import Badge from './Badge'
import { ReactNode } from 'react'

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

export default function SingularityCard({
  name,
  description,
  cost,
  costLabel = 'PC',
  secondaryCost,
  isSelected,
  canAfford,
  canSelect,
  onClick,
  requirements,
  requirementsText,
  level,
  levelLabel,
  effects,
  variant = 'magenta',
  footer,
  className = '',
}: SingularityCardProps) {
  const selectedClasses = {
    default: 'border-ecoar-teal dark:border-ecoar-teal-500 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 shadow-lg shadow-ecoar-teal/30 dark:shadow-ecoar-teal-600/30',
    teal: 'border-ecoar-teal dark:border-ecoar-teal-500 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 shadow-lg shadow-ecoar-teal/30 dark:shadow-ecoar-teal-600/30',
    magenta: 'border-ecoar-magenta-600 dark:border-ecoar-magenta-500 bg-ecoar-magenta-800/70 dark:bg-ecoar-magenta-800/70 shadow-lg shadow-ecoar-magenta-900/60 dark:shadow-ecoar-magenta-900/60'
  }

  const unselectedClasses = {
    default: 'border-white/10 dark:border-ecoar-light-900/20 bg-white/5 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50 dark:hover:border-ecoar-teal-500/50 hover:bg-white/10 dark:hover:bg-ecoar-light-900/15',
    teal: 'border-white/10 dark:border-ecoar-light-900/20 bg-white/5 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50 dark:hover:border-ecoar-teal-500/50 hover:bg-white/10 dark:hover:bg-ecoar-light-900/15',
    magenta: 'border-gray-700/50 dark:border-ecoar-light-900/20 bg-gray-900/30 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50 dark:hover:border-ecoar-teal-500/50 hover:bg-gray-800/40 dark:hover:bg-ecoar-light-900/15'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={!isSelected && !canSelect}
      whileHover={!isSelected && canSelect ? { scale: 1.02 } : {}}
      className={`p-4 rounded-lg border-2 text-left transition-all ${
        isSelected
          ? selectedClasses[variant]
          : canSelect
          ? unselectedClasses[variant]
          : 'border-white/5 dark:border-ecoar-light-900/10 bg-white/5 dark:bg-ecoar-light-900/10 opacity-50 cursor-not-allowed'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-white dark:text-ecoar-light-900 font-semibold text-base leading-tight">{name}</div>
          {level && (
            <div className="text-xs text-white/60 dark:text-ecoar-light-900/60 mt-0.5">
              {levelLabel || `Nível ${level}`} {level <= 12 ? `(${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][level - 1]})` : ''}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-white dark:text-ecoar-light-900 font-semibold text-sm bg-ecoar-magenta-700/80 dark:bg-ecoar-magenta-700/90 px-2 py-1 rounded border border-ecoar-magenta-600 dark:border-ecoar-magenta-500 whitespace-nowrap">
          {cost} {costLabel}
          {secondaryCost && (
            <div className="text-xs text-white/80 dark:text-ecoar-light-900/80">({secondaryCost})</div>
          )}
        </div>
      </div>
      <p className="text-white/70 dark:text-ecoar-light-900/70 text-xs leading-relaxed mb-1.5 line-clamp-3">{description}</p>
      {effects && (
        <p className="text-white/60 dark:text-ecoar-light-900/60 text-xs mb-2">{effects}</p>
      )}
      {requirements && requirements.length > 0 && (
        <div className="text-white/80 dark:text-ecoar-light-900/80 text-xs">
          Requisitos: {requirements.join(', ')}
        </div>
      )}
      {requirementsText && (
        <div className="text-white/80 dark:text-ecoar-light-900/80 text-xs mt-1.5 pt-1.5 border-t border-white/10">
          {requirementsText}
        </div>
      )}
      {footer}
    </motion.button>
  )
}

