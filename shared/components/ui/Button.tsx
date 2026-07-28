'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const baseClasses = 'flex items-center justify-center gap-2 font-medium transition-all duration-fast disabled:opacity-50 disabled:cursor-not-allowed active:opacity-90 uppercase tracking-[0.1em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal'
  
  const variantClasses = {
    primary: 'bg-ecoar-magenta text-[var(--ecoar-accent-ink)] hover:brightness-110 shadow-none',
    secondary: 'bg-transparent border border-ecoar-teal/50 dark:border-ecoar-teal/40 hover:bg-ecoar-teal/10 text-ecoar-dark-900 dark:text-ecoar-light-900/90',
    outline: 'bg-transparent border border-ecoar-teal text-ecoar-teal-800 dark:text-ecoar-teal hover:bg-ecoar-teal/10',
    ghost: 'bg-transparent text-ecoar-dark-600 dark:text-ecoar-light-900/60 hover:bg-ecoar-teal/10 hover:text-ecoar-dark-800 dark:hover:text-ecoar-light-900/80'
  }
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[10px] rounded-none',
    md: 'px-4 py-2 text-xs rounded-none min-h-[44px]',
    lg: 'px-5 py-2.5 text-sm rounded-none min-h-[44px]'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      {...rest}
    >
      {LeftIcon && <LeftIcon className="w-4 h-4" />}
      {children}
      {RightIcon && <RightIcon className="w-4 h-4" />}
    </button>
  )
}
