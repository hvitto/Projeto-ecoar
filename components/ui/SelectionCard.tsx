'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface SelectionCardProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  isSelected: boolean
  onClick: () => void
  className?: string
  children?: ReactNode
}

export default function SelectionCard({
  title,
  subtitle,
  icon: Icon,
  isSelected,
  onClick,
  className = '',
  children,
}: SelectionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-ecoar-teal dark:border-ecoar-teal-500 bg-ecoar-teal/10 dark:bg-ecoar-teal-600/20'
          : 'bg-white/5 dark:bg-ecoar-light-900/10 border-white/10 dark:border-ecoar-light-900/20 hover:bg-white/10 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30 dark:hover:border-ecoar-teal-500/40'
      } ${className}`}
    >
      {isSelected && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <CheckCircle2 className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
        </motion.div>
      )}
      <div className="text-center">
        {Icon && (
          <Icon className="w-8 h-8 mx-auto mb-2 text-ecoar-teal dark:text-ecoar-teal-400" />
        )}
        <div className={`font-semibold text-base mb-1 ${
          isSelected ? 'text-white dark:text-ecoar-light-900' : 'text-white/90 dark:text-ecoar-light-900/90'
        }`}>
          {title}
        </div>
        {subtitle && (
          <div className="text-sm text-white/60 dark:text-ecoar-light-900/60">
            {subtitle}
          </div>
        )}
        {children}
      </div>
    </motion.button>
  )
}

