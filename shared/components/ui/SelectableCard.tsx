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
    p-4 rounded-lg border text-left transition-all duration-200 overflow-hidden
    ${isSelected
      ? 'border-ecoar-teal-400 dark:border-ecoar-teal-500/60 bg-ecoar-teal-50 dark:bg-ecoar-teal-600/15 shadow-md shadow-ecoar-teal-200/30 dark:shadow-ecoar-teal-600/20'
      : disabled
      ? 'border-ecoar-dark-300/20 dark:border-ecoar-light-900/[0.04] bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] opacity-40 cursor-not-allowed'
      : 'border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] bg-ecoar-light-700 dark:bg-ecoar-light-900/[0.03] hover:border-ecoar-dark-400/40 dark:hover:border-ecoar-teal-500/30 hover:bg-ecoar-light-800 dark:hover:bg-ecoar-light-900/[0.06] cursor-pointer'
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
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
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

