'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import Badge from './Badge'

interface DisadvantageCardProps {
  name: string
  description: string
  pontosCriacao: number
  isSelected: boolean
  onClick: () => void
  className?: string
}

export default function DisadvantageCard({
  name,
  description,
  pontosCriacao,
  isSelected,
  onClick,
  className = '',
}: DisadvantageCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      className={`p-3.5 rounded-lg border transition-all duration-200 text-left ${
        isSelected
          ? 'bg-ecoar-magenta-100/50 dark:bg-ecoar-magenta-800/15 border-ecoar-magenta-500/60 dark:border-ecoar-magenta-500/60 shadow-lg shadow-ecoar-magenta-200/30 dark:shadow-ecoar-magenta-900/20'
          : 'bg-ecoar-light-700/50 dark:bg-ecoar-light-900/[0.03] border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] hover:bg-ecoar-light-800/70 dark:hover:bg-ecoar-light-900/[0.06] hover:border-ecoar-magenta-400/40 dark:hover:border-ecoar-magenta-500/30'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <h5 className={`font-medium text-sm ${isSelected ? 'text-ecoar-dark-900 dark:text-ecoar-light-900/90' : 'text-ecoar-dark-800 dark:text-ecoar-light-900/80'}`}>
          {name}
        </h5>
        {isSelected && (
          <CheckCircle2 className="w-4 h-4 text-ecoar-magenta-600 dark:text-ecoar-magenta-400/80" />
        )}
      </div>
      <p className={`text-xs mb-1.5 ${isSelected ? 'text-ecoar-dark-700 dark:text-ecoar-light-900/70' : 'text-ecoar-dark-600 dark:text-ecoar-light-900/60'}`}>
        {description}
      </p>
      <div className="flex items-center gap-2">
        <Badge variant="cost" size="sm">
          +{pontosCriacao} PC
        </Badge>
      </div>
    </motion.button>
  )
}

