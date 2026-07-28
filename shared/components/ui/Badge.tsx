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
  const baseClasses =
    'inline-flex items-center justify-center rounded-none font-semibold uppercase tracking-[0.12em] border whitespace-nowrap'

  const variantClasses = {
    default: 'bg-transparent text-ecoar-teal-700 dark:text-ecoar-teal border-ecoar-teal/45 dark:border-ecoar-teal/40',
    cost: 'bg-ecoar-magenta/10 text-ecoar-magenta border-ecoar-magenta/60',
    bonus: 'bg-ecoar-teal/10 dark:bg-ecoar-teal/12 text-ecoar-teal-800 dark:text-ecoar-teal border-ecoar-teal/55',
    status: 'bg-ecoar-dark-900/5 dark:bg-[#adb5bd]/10 text-ecoar-dark-500 dark:text-[#adb5bd] border-ecoar-dark-300/30 dark:border-[#adb5bd]/20',
    disadvantage: 'bg-transparent text-ecoar-dark-400 dark:text-[#adb5bd]/50 border-ecoar-dark-300/25 dark:border-[#adb5bd]/15',
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[8px]',
    md: 'px-2 py-0.5 text-[9px]',
    lg: 'px-2.5 py-1 text-[10px]',
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <span className={classes}>
      {children}
    </span>
  )
}
