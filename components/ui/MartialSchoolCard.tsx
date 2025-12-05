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
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-4 rounded-lg border transition-all duration-200 text-left ${
        isSelected
          ? 'bg-teal-50 dark:bg-ecoar-teal-600/15 border-teal-300 dark:border-ecoar-teal-500/60 shadow-md shadow-teal-100/50 dark:shadow-ecoar-teal-600/20'
          : 'bg-white dark:bg-ecoar-light-900/[0.03] border-slate-200 dark:border-ecoar-light-900/[0.08] hover:bg-slate-50 dark:hover:bg-ecoar-light-900/[0.06] hover:border-slate-300 dark:hover:border-ecoar-teal-500/30'
      } ${className}`}
    >
      {/* Ícone e Título */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className={`font-bold text-lg mb-1 ${
            isSelected ? 'text-slate-900 dark:text-ecoar-light-900' : 'text-slate-900 dark:text-ecoar-light-900/90'
          }`}>
            {school.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-ecoar-light-900/60">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-ecoar-light-900/20">{school.class}</span>
            <span>{school.aptitude}</span>
          </div>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-ecoar-teal-400" />
          </motion.div>
        )}
      </div>

      {/* Descrição */}
      <p className={`text-sm leading-relaxed mb-3 ${
        isSelected ? 'text-slate-700 dark:text-ecoar-light-900/80' : 'text-slate-600 dark:text-ecoar-light-900/60'
      }`}>
        {school.description}
      </p>

      {/* Informações da Escola */}
      <div className="space-y-1 text-xs text-slate-500 dark:text-ecoar-light-900/50">
        <div><span className="font-medium">Ferramenta:</span> {school.tool}</div>
        {school.toolNote && (
          <div className="text-slate-900 dark:text-ecoar-light-900/90 bg-magenta-50 dark:bg-ecoar-magenta-800/70 px-3 py-2 rounded border border-magenta-200 dark:border-ecoar-magenta-600/50 italic text-sm mt-2">↪ {school.toolNote}</div>
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

