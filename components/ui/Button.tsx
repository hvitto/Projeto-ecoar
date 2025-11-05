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
    primary: 'bg-gradient-to-r from-ecoar-teal to-ecoar-magenta dark:from-ecoar-teal-600 dark:to-ecoar-magenta-600 hover:from-ecoar-teal/90 hover:to-ecoar-magenta/90 dark:hover:from-ecoar-teal-700 dark:hover:to-ecoar-magenta-700 text-white dark:text-ecoar-light-900 shadow-lg shadow-ecoar-teal/20 dark:shadow-ecoar-teal-600/30',
    secondary: 'bg-white/10 dark:bg-ecoar-light-900/10 hover:bg-white/20 dark:hover:bg-ecoar-light-900/20 border border-white/20 dark:border-ecoar-light-900/20 text-white dark:text-ecoar-light-900 backdrop-blur-sm',
    outline: 'bg-transparent border-2 border-ecoar-teal/50 dark:border-ecoar-teal-500/50 text-ecoar-teal dark:text-ecoar-teal-400 hover:bg-ecoar-teal/10 dark:hover:bg-ecoar-teal-600/10',
    ghost: 'bg-transparent text-white/70 dark:text-ecoar-light-900/70 hover:bg-white/5 dark:hover:bg-ecoar-light-900/10 hover:text-white dark:hover:text-ecoar-light-900'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={classes}
      {...motionProps}
    >
      {LeftIcon && <LeftIcon className="w-4 h-4" />}
      {children}
      {RightIcon && <RightIcon className="w-4 h-4" />}
    </motion.button>
  )
}

