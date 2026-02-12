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
  const baseClasses = 'flex items-center justify-center gap-2 font-medium transition-all duration-fast disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-ecoar-teal-600 to-ecoar-magenta-600 dark:from-ecoar-teal-600 dark:to-ecoar-magenta-600 hover:from-ecoar-teal-700 hover:to-ecoar-magenta-700 dark:hover:from-ecoar-teal-700 dark:hover:to-ecoar-magenta-700 text-white/90 dark:text-ecoar-light-900/90 shadow-lg shadow-ecoar-teal-300/30 dark:shadow-ecoar-teal-600/20',
    secondary: 'bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.08] hover:bg-ecoar-light-700 dark:hover:bg-ecoar-light-900/[0.12] border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.12] text-ecoar-dark-900 dark:text-ecoar-light-900/90 backdrop-blur-sm',
    outline: 'bg-transparent border border-ecoar-teal-500/50 dark:border-ecoar-teal-500/40 text-ecoar-teal-700 dark:text-ecoar-teal-400/90 hover:bg-ecoar-teal-50 dark:hover:bg-ecoar-teal-600/8',
    ghost: 'bg-transparent text-ecoar-dark-600 dark:text-ecoar-light-900/60 hover:bg-ecoar-light-800 dark:hover:bg-ecoar-light-900/[0.03] hover:text-ecoar-dark-800 dark:hover:text-ecoar-light-900/80'
  }
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg min-h-[44px]',
    lg: 'px-5 py-2.5 text-base rounded-lg min-h-[44px]'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'tween', duration: 0.2 }}
      className={classes}
      {...motionProps}
    >
      {LeftIcon && <LeftIcon className="w-4 h-4" />}
      {children}
      {RightIcon && <RightIcon className="w-4 h-4" />}
    </motion.button>
  )
}

