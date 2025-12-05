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
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      className={`relative p-3.5 rounded-lg border transition-all duration-200 ${
        isSelected
          ? 'border-teal-300 dark:border-ecoar-teal-500/60 bg-teal-50 dark:bg-ecoar-teal-600/15 shadow-md shadow-teal-100/50 dark:shadow-ecoar-teal-600/20'
          : 'bg-white dark:bg-ecoar-light-900/[0.03] border-slate-200 dark:border-ecoar-light-900/[0.08] hover:bg-slate-50 dark:hover:bg-ecoar-light-900/[0.06] hover:border-slate-300 dark:hover:border-ecoar-teal-500/30'
      } ${className}`}
    >
      {isSelected && (
        <motion.div
          className="absolute top-1.5 right-1.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-ecoar-teal-400/80" />
        </motion.div>
      )}
      <div className="text-center">
        {Icon && (
          <Icon className="w-6 h-6 mx-auto mb-1.5 text-teal-600 dark:text-ecoar-teal-400/80" />
        )}
        <div className={`font-medium text-sm mb-0.5 ${
          isSelected ? 'text-slate-900 dark:text-ecoar-light-900/90' : 'text-slate-700 dark:text-ecoar-light-900/80'
        }`}>
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 dark:text-ecoar-light-900/50">
            {subtitle}
          </div>
        )}
        {children}
      </div>
    </motion.button>
  )
}

