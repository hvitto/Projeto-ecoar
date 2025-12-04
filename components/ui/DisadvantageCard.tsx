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
          ? 'bg-ecoar-magenta/15 dark:bg-ecoar-magenta-800/15 border-ecoar-magenta/60 dark:border-ecoar-magenta-500/60 shadow-lg shadow-ecoar-magenta/10 dark:shadow-ecoar-magenta-900/20'
          : 'bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] border-white/[0.08] dark:border-ecoar-light-900/[0.08] hover:bg-white/[0.06] dark:hover:bg-ecoar-light-900/[0.06] hover:border-ecoar-magenta/30 dark:hover:border-ecoar-magenta-500/30'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <h5 className={`font-medium text-sm ${isSelected ? 'text-white/90 dark:text-ecoar-light-900/90' : 'text-white/80 dark:text-ecoar-light-900/80'}`}>
          {name}
        </h5>
        {isSelected && (
          <CheckCircle2 className="w-4 h-4 text-ecoar-magenta/80 dark:text-ecoar-magenta-400/80" />
        )}
      </div>
      <p className={`text-xs mb-1.5 ${isSelected ? 'text-white/70 dark:text-ecoar-light-900/70' : 'text-white/60 dark:text-ecoar-light-900/60'}`}>
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

