'use client'

import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps extends Omit<MotionProps, 'children'> {
  children: ReactNode
  variant?: 'default' | 'selectable' | 'info' | 'stat'
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export default function Card({
  children,
  variant = 'default',
  selected = false,
  disabled = false,
  onClick,
  className = '',
  ...motionProps
}: CardProps) {
  const baseClasses = 'rounded-lg border transition-all duration-200 overflow-hidden'
  
  const variantClasses = {
    default: 'bg-ecoar-light-700 dark:bg-ecoar-light-900/[0.03] border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] p-4 shadow-sm',
    selectable: `
      ${selected 
        ? 'border-ecoar-teal-400 dark:border-ecoar-teal-500/60 bg-ecoar-teal-50 dark:bg-ecoar-teal-600/15 shadow-md shadow-ecoar-teal-200/30 dark:shadow-ecoar-teal-600/20' 
        : disabled
        ? 'border-ecoar-dark-300/20 dark:border-ecoar-light-900/[0.04] bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] opacity-40 cursor-not-allowed'
        : 'border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] bg-ecoar-light-700 dark:bg-ecoar-light-900/[0.03] hover:border-ecoar-dark-400/40 dark:hover:border-ecoar-teal-500/30 hover:bg-ecoar-light-800 dark:hover:bg-ecoar-light-900/[0.06]'
      }
      ${onClick && !disabled ? 'cursor-pointer' : ''}
    `,
    info: 'bg-ecoar-light-700 dark:bg-ecoar-dark-800/60 backdrop-blur-sm border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] p-4 shadow-sm',
    stat: 'bg-ecoar-light-700 dark:bg-ecoar-dark-700/[0.05] backdrop-blur-sm border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] p-3.5 text-center hover:border-ecoar-dark-400/40 dark:hover:border-ecoar-teal-400/30 hover:shadow-md hover:shadow-ecoar-dark-300/20 dark:hover:shadow-ecoar-teal-600/10'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (onClick && !disabled) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
        className={classes}
        {...motionProps}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div className={classes} {...motionProps}>
      {children}
    </motion.div>
  )
}

