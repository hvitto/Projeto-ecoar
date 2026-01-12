'use client'

import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'cost' | 'bonus' | 'status' | 'disadvantage'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full border'
  
  const variantClasses = {
    default: 'bg-ecoar-teal-100/50 dark:bg-ecoar-teal-600/15 text-ecoar-teal-700 dark:text-ecoar-teal-300/90 border-ecoar-teal-300/50 dark:border-ecoar-teal-500/30',
    cost: 'bg-ecoar-magenta-100/50 dark:bg-ecoar-magenta-700/15 text-ecoar-magenta-700 dark:text-ecoar-light-900/90 border-ecoar-magenta-300/50 dark:border-ecoar-magenta-500/30',
    bonus: 'bg-ecoar-teal-100/50 dark:bg-ecoar-teal-600/15 text-ecoar-teal-700 dark:text-ecoar-teal-300/90 border-ecoar-teal-300/50 dark:border-ecoar-teal-500/30',
    status: 'bg-ecoar-light-800/70 dark:bg-ecoar-light-900/[0.03] text-ecoar-dark-600 dark:text-ecoar-light-900/50 border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08]',
    disadvantage: 'bg-orange-100/50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400/90 border-orange-300/50 dark:border-orange-600/30'
  }
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <span className={classes}>
      {children}
    </span>
  )
}

