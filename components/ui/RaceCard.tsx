'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Users } from 'lucide-react'
import Badge from './Badge'

interface RaceCardProps {
  name: string
  genus: string
  description: string
  bonuses: string[]
  isSelected: boolean
  onClick: () => void
  index?: number
  className?: string
}

export default function RaceCard({
  name,
  genus,
  description,
  bonuses,
  isSelected,
  onClick,
  index = 0,
  className = '',
}: RaceCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'bg-ecoar-teal/10 dark:bg-ecoar-teal-600/20 border-ecoar-teal dark:border-ecoar-teal-500 shadow-lg shadow-ecoar-teal/20 dark:shadow-ecoar-teal-600/30'
          : 'bg-white/5 dark:bg-ecoar-light-900/10 border-white/10 dark:border-ecoar-light-900/20 hover:bg-white/10 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30 dark:hover:border-ecoar-teal-500/40'
      } ${className}`}
    >
      {/* Ícone e Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-ecoar-teal/20 dark:bg-ecoar-teal-600/30 text-ecoar-teal dark:text-ecoar-teal-400'
            : 'bg-white/5 dark:bg-ecoar-light-900/10 text-white/60 dark:text-ecoar-light-900/60'
        }`}>
          <Users className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${
            isSelected ? 'text-white dark:text-ecoar-light-900' : 'text-white/90 dark:text-ecoar-light-900/90'
          }`}>
            {name}
          </h4>
          <span className="text-xs text-white/60 dark:text-ecoar-light-900/60">{genus}</span>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <CheckCircle2 className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
          </motion.div>
        )}
      </div>

      {/* Descrição */}
      <p className={`text-xs leading-relaxed mb-2 ${
        isSelected ? 'text-white/80 dark:text-ecoar-light-900/80' : 'text-white/60 dark:text-ecoar-light-900/60'
      }`}>
        {description}
      </p>

      {/* Bônus */}
      {bonuses.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {bonuses.slice(0, 3).map((bonus, idx) => (
            <Badge key={idx} variant="bonus" size="sm">
              {bonus}
            </Badge>
          ))}
          {bonuses.length > 3 && (
            <Badge variant="status" size="sm">
              +{bonuses.length - 3} bônus
            </Badge>
          )}
        </div>
      )}
    </motion.button>
  )
}

