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
  const baseClasses = 'rounded-none border transition-colors duration-normal overflow-hidden'
  
  const variantClasses = {
    default: 'bg-white/80 dark:bg-ecoar-dark-800/80 border-ecoar-teal/35 dark:border-ecoar-teal/28 p-4 shadow-none',
    selectable: `
      ${selected 
        ? 'border-ecoar-magenta dark:border-ecoar-magenta bg-ecoar-magenta/10 dark:bg-ecoar-magenta/15' 
        : disabled
        ? 'border-ecoar-teal/15 dark:border-ecoar-teal/10 bg-white/40 dark:bg-ecoar-dark-800/40 opacity-40 cursor-not-allowed'
        : 'border-ecoar-teal/35 dark:border-ecoar-teal/28 bg-white/80 dark:bg-ecoar-dark-800/80 hover:border-ecoar-teal dark:hover:border-ecoar-teal/50'
      }
      ${onClick && !disabled ? 'cursor-pointer' : ''}
    `,
    info: 'bg-white/80 dark:bg-ecoar-dark-800/80 border-ecoar-teal/35 dark:border-ecoar-teal/28 p-4 shadow-none',
    stat: 'bg-white/70 dark:bg-ecoar-dark-800/70 border-ecoar-teal/30 dark:border-ecoar-teal/25 p-3.5 text-center hover:border-ecoar-teal/55 dark:hover:border-ecoar-teal/45'
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
        className={`${classes}`}
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
