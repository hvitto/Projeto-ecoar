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
    default: 'border-teal-300 dark:border-ecoar-teal-500/60 bg-teal-50 dark:bg-ecoar-teal-600/15 shadow-md shadow-teal-100/50 dark:shadow-ecoar-teal-600/20',
    teal: 'border-teal-300 dark:border-ecoar-teal-500/60 bg-teal-50 dark:bg-ecoar-teal-600/15 shadow-md shadow-teal-100/50 dark:shadow-ecoar-teal-600/20',
    magenta: 'border-magenta-300 dark:border-ecoar-magenta-600/60 bg-magenta-50 dark:bg-ecoar-magenta-800/15 shadow-md shadow-magenta-100/50 dark:shadow-ecoar-magenta-900/20'
  }

  const unselectedClasses = {
    default: 'border-slate-200 dark:border-ecoar-light-900/[0.08] bg-white dark:bg-ecoar-light-900/[0.03] hover:border-slate-300 dark:hover:border-ecoar-teal-500/30 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/[0.06]',
    teal: 'border-slate-200 dark:border-ecoar-light-900/[0.08] bg-white dark:bg-ecoar-light-900/[0.03] hover:border-slate-300 dark:hover:border-ecoar-teal-500/30 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/[0.06]',
    magenta: 'border-slate-200 dark:border-ecoar-light-900/[0.08] bg-white dark:bg-ecoar-light-900/[0.03] hover:border-slate-300 dark:hover:border-ecoar-teal-500/30 hover:bg-slate-50 dark:hover:bg-ecoar-light-900/[0.06]'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={!isSelected && !canSelect}
      whileHover={!isSelected && canSelect ? { scale: 1.01 } : {}}
      className={`p-3.5 rounded-lg border text-left transition-all duration-200 ${
        isSelected
          ? selectedClasses[variant]
          : canSelect
          ? unselectedClasses[variant]
          : 'border-slate-200 dark:border-ecoar-light-900/[0.04] bg-slate-50 dark:bg-ecoar-light-900/[0.03] opacity-40 cursor-not-allowed'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="text-slate-900 dark:text-ecoar-light-900/90 font-semibold text-sm leading-tight">{name}</div>
          {level && (
            <div className="text-[11px] text-slate-500 dark:text-ecoar-light-900/50 mt-0.5">
              {levelLabel || `Nível ${level}`} {level <= 12 ? `(${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][level - 1]})` : ''}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-slate-900 dark:text-ecoar-light-900/90 font-medium text-xs bg-magenta-50 dark:bg-ecoar-magenta-700/15 px-1.5 py-0.5 rounded border border-magenta-200 dark:border-ecoar-magenta-500/30 whitespace-nowrap">
          {cost} {costLabel}
          {secondaryCost && (
            <div className="text-[10px] text-slate-700 dark:text-ecoar-light-900/70">({secondaryCost})</div>
          )}
        </div>
      </div>
      <p className="text-slate-600 dark:text-ecoar-light-900/60 text-xs leading-relaxed mb-1 line-clamp-3">{description}</p>
      {effects && (
        <p className="text-slate-500 dark:text-ecoar-light-900/50 text-[11px] mb-1.5">{effects}</p>
      )}
      {requirements && requirements.length > 0 && (
        <div className="text-slate-700 dark:text-ecoar-light-900/70 text-[11px]">
          Requisitos: {requirements.join(', ')}
        </div>
      )}
      {requirementsText && (
        <div className="text-slate-700 dark:text-ecoar-light-900/70 text-[11px] mt-1.5 pt-1.5 border-t border-slate-200 dark:border-white/[0.06]">
          {requirementsText}
        </div>
      )}
      {footer}
    </motion.button>
  )
}

