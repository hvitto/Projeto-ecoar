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
  const baseClasses = 'rounded-xl border transition-all'
  
  const variantClasses = {
    default: 'bg-white/5 dark:bg-ecoar-light-900/10 border-white/10 dark:border-ecoar-light-900/20 p-5',
    selectable: `
      ${selected 
        ? 'border-ecoar-teal bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 shadow-lg shadow-ecoar-teal/30 dark:shadow-ecoar-teal-600/30' 
        : disabled
        ? 'border-white/5 dark:border-ecoar-light-900/10 bg-white/5 dark:bg-ecoar-light-900/10 opacity-50 cursor-not-allowed'
        : 'border-white/10 dark:border-ecoar-light-900/20 bg-white/5 dark:bg-ecoar-light-900/10 hover:border-ecoar-teal/50 dark:hover:border-ecoar-teal-500/50 hover:bg-white/10 dark:hover:bg-ecoar-light-900/15'
      }
      ${onClick && !disabled ? 'cursor-pointer' : ''}
    `,
    info: 'bg-white/60 dark:bg-ecoar-dark-800/80 backdrop-blur-sm border-ecoar-dark/10 dark:border-ecoar-light-900/20 p-6',
    stat: 'bg-white/80 dark:bg-ecoar-dark-700/80 backdrop-blur-sm border-ecoar-dark-300/30 dark:border-ecoar-light-900/20 p-4 text-center hover:border-ecoar-teal-500/50 dark:hover:border-ecoar-teal-400/50 hover:shadow-lg hover:shadow-ecoar-teal-200/40 dark:hover:shadow-ecoar-teal-600/20'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (onClick && !disabled) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
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

