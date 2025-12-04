'use client'

import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends Omit<MotionProps, 'children'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  onClick,
  type = 'button',
  ...motionProps
}: ButtonProps) {
  const baseClasses = 'flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-ecoar-teal to-ecoar-magenta dark:from-ecoar-teal-600 dark:to-ecoar-magenta-600 hover:from-ecoar-teal/90 hover:to-ecoar-magenta/90 dark:hover:from-ecoar-teal-700 dark:hover:to-ecoar-magenta-700 text-white/90 dark:text-ecoar-light-900/90 shadow-lg shadow-ecoar-teal/10 dark:shadow-ecoar-teal-600/20',
    secondary: 'bg-white/[0.08] dark:bg-ecoar-light-900/[0.08] hover:bg-white/[0.12] dark:hover:bg-ecoar-light-900/[0.12] border border-white/[0.12] dark:border-ecoar-light-900/[0.12] text-white/90 dark:text-ecoar-light-900/90 backdrop-blur-sm',
    outline: 'bg-transparent border border-ecoar-teal/40 dark:border-ecoar-teal-500/40 text-ecoar-teal/90 dark:text-ecoar-teal-400/90 hover:bg-ecoar-teal/8 dark:hover:bg-ecoar-teal-600/8',
    ghost: 'bg-transparent text-white/60 dark:text-ecoar-light-900/60 hover:bg-white/[0.03] dark:hover:bg-ecoar-light-900/[0.03] hover:text-white/80 dark:hover:text-ecoar-light-900/80'
  }
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-5 py-2.5 text-base rounded-lg'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      className={classes}
      {...motionProps}
    >
      {LeftIcon && <LeftIcon className="w-4 h-4" />}
      {children}
      {RightIcon && <RightIcon className="w-4 h-4" />}
    </motion.button>
  )
}

