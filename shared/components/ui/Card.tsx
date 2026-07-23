'use client'

import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode
  variant?: 'default' | 'selectable' | 'info' | 'stat'
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

export default function Card({
  children,
  variant = 'default',
  selected = false,
  disabled = false,
  onClick,
  className = '',
  ...rest
}: CardProps) {
  const baseClasses = 'rounded-lg border transition-colors duration-normal overflow-hidden'
  
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
    info: 'bg-ecoar-light-700 dark:bg-ecoar-dark-800/60 border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] p-4 shadow-sm',
    stat: 'bg-ecoar-light-700 dark:bg-ecoar-dark-700/[0.05] border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] p-3.5 text-center hover:border-ecoar-dark-400/40 dark:hover:border-ecoar-teal-400/30'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (onClick && !disabled) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
        className={`${classes} hover:shadow-md dark:hover:shadow-ecoar-teal-600/10`}
        {...rest}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
