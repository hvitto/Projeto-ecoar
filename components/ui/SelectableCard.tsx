'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import Badge from './Badge'

interface SelectableCardProps {
  children: ReactNode
  isSelected: boolean
  disabled?: boolean
  onClick?: () => void
  cost?: number
  costLabel?: string
  className?: string
}

export default function SelectableCard({
  children,
  isSelected,
  disabled = false,
  onClick,
  cost,
  costLabel,
  className = '',
}: SelectableCardProps) {
  const baseClasses = `
    p-5 md:p-6 rounded-xl border-2 text-left transition-all
    ${isSelected
      ? 'border-ecoar-teal dark:border-ecoar-teal-500 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 shadow-lg shadow-ecoar-teal/30 dark:shadow-ecoar-teal-600/30'
      : disabled
      ? 'border-white/5 dark:border-ecoar-light-900/10 bg-white/5 dark:bg-ecoar-light-900/10 opacity-50 cursor-not-allowed'
      : 'border-white/10 dark:border-ecoar-light-900/20 bg-white/5 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50 dark:hover:border-ecoar-teal-500/50 hover:bg-white/10 dark:hover:bg-ecoar-light-900/15 cursor-pointer'
    }
  `

  const content = (
    <>
      {cost !== undefined && (
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">{children}</div>
          <Badge variant="cost" size="md">
            {cost} {costLabel || 'PC'}
          </Badge>
        </div>
      )}
      {cost === undefined && children}
    </>
  )

  if (onClick && !disabled) {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className={`${baseClasses} ${className}`}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      {content}
    </div>
  )
}

