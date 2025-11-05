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
      whileHover={{ y: -2 }}
      className={`p-4 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'bg-ecoar-magenta-800/70 dark:bg-ecoar-magenta-800/70 border-ecoar-magenta-600 dark:border-ecoar-magenta-500 shadow-lg shadow-ecoar-magenta-900/40 dark:shadow-ecoar-magenta-900/40'
          : 'bg-white/5 dark:bg-ecoar-light-900/10 border-white/10 dark:border-ecoar-light-900/20 hover:bg-white/10 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-magenta/30 dark:hover:border-ecoar-magenta-500/30'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h5 className={`font-semibold text-sm ${isSelected ? 'text-white dark:text-ecoar-light-900' : 'text-white/90 dark:text-ecoar-light-900/90'}`}>
          {name}
        </h5>
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-white dark:text-ecoar-light-900" />
        )}
      </div>
      <p className={`text-xs mb-2 ${isSelected ? 'text-white/90 dark:text-ecoar-light-900/90' : 'text-white/70 dark:text-ecoar-light-900/70'}`}>
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

