'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { MartialSchoolData } from '@/data/martialSchoolSingularities'

interface MartialSchoolCardProps {
  school: MartialSchoolData
  isSelected: boolean
  onClick: () => void
  index?: number
  className?: string
}

export default function MartialSchoolCard({
  school,
  isSelected,
  onClick,
  index = 0,
  className = '',
}: MartialSchoolCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-5 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 border-ecoar-teal dark:border-ecoar-teal-500 shadow-lg shadow-ecoar-teal/30 dark:shadow-ecoar-teal-600/30'
          : 'bg-white/5 dark:bg-ecoar-light-900/10 border-white/10 dark:border-ecoar-light-900/20 hover:bg-white/10 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/50 dark:hover:border-ecoar-teal-500/50'
      } ${className}`}
    >
      {/* Ícone e Título */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className={`font-bold text-lg mb-1 ${
            isSelected ? 'text-white dark:text-ecoar-light-900' : 'text-white/90 dark:text-ecoar-light-900/90'
          }`}>
            {school.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-white/60 dark:text-ecoar-light-900/60">
            <span className="px-2 py-0.5 rounded bg-white/10 dark:bg-ecoar-light-900/20">{school.class}</span>
            <span>{school.aptitude}</span>
          </div>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <CheckCircle2 className="w-6 h-6 text-ecoar-teal dark:text-ecoar-teal-400" />
          </motion.div>
        )}
      </div>

      {/* Descrição */}
      <p className={`text-sm leading-relaxed mb-3 ${
        isSelected ? 'text-white/80 dark:text-ecoar-light-900/80' : 'text-white/60 dark:text-ecoar-light-900/60'
      }`}>
        {school.description}
      </p>

      {/* Informações da Escola */}
      <div className="space-y-1 text-xs text-white/50 dark:text-ecoar-light-900/50">
        <div><span className="font-medium">Ferramenta:</span> {school.tool}</div>
        {school.toolNote && (
          <div className="text-white/90 dark:text-ecoar-light-900/90 bg-ecoar-magenta-900/50 dark:bg-ecoar-magenta-800/70 px-3 py-2 rounded border border-ecoar-magenta-700/50 dark:border-ecoar-magenta-600/50 italic text-sm mt-2">↪ {school.toolNote}</div>
        )}
        <div className="mt-2">
          <span className="font-medium">Atributos sugeridos:</span> {school.suggestedAttributes?.join(', ')}
        </div>
        <div>
          <span className="font-medium">Habilidades sugeridas:</span> {school.suggestedSkills?.join(', ')}
        </div>
      </div>
    </motion.button>
  )
}

