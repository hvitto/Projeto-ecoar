'use client'

import { motion } from 'framer-motion'

interface SheetNotesSectionProps {
  value: string
  isEditing: boolean
  onChange: (value: string) => void
}

export default function SheetNotesSection({ value, isEditing, onChange }: SheetNotesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white dark:bg-ecoar-dark-800/70 border border-slate-200 dark:border-ecoar-light-900/[0.12] rounded-lg p-4 sm:p-5 shadow-sm overflow-hidden"
    >
      <h3 className="text-xs font-semibold text-slate-700 dark:text-ecoar-light-900/90 uppercase tracking-wider mb-4">
        Anotações
      </h3>
      <textarea
        value={value}
        disabled={!isEditing}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Anotações gerais..."
        className="w-full max-w-full min-w-0 h-64 px-4 py-3 bg-white dark:bg-ecoar-dark-700 border border-ecoar-dark-300/40 dark:border-ecoar-light-900/30 rounded-lg text-ecoar-dark-900 dark:text-ecoar-light-900 text-sm resize-none focus:outline-none focus:border-ecoar-teal-500 dark:focus:border-ecoar-teal-400 focus:ring-2 focus:ring-ecoar-teal-400/30 dark:focus:ring-ecoar-teal-500/30 transition-all shadow-sm break-words disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </motion.div>
  )
}
