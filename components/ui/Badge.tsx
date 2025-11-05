'use client'

import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'cost' | 'bonus' | 'status'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full border'
  
  const variantClasses = {
    default: 'bg-ecoar-teal-100 dark:bg-ecoar-teal-600/20 text-ecoar-teal-700 dark:text-ecoar-teal-300 border-ecoar-teal-300 dark:border-ecoar-teal-500/40',
    cost: 'bg-ecoar-magenta-700/80 dark:bg-ecoar-magenta-700/90 text-white dark:text-ecoar-light-900 border-ecoar-magenta-600 dark:border-ecoar-magenta-500',
    bonus: 'bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 text-ecoar-teal-700 dark:text-ecoar-teal-300 border-ecoar-teal/30 dark:border-ecoar-teal-500/40',
    status: 'bg-white/5 dark:bg-ecoar-light-900/20 text-white/60 dark:text-ecoar-light-900/60 border-white/10 dark:border-ecoar-light-900/20'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <span className={classes}>
      {children}
    </span>
  )
}

