'use client'

import { motion } from 'framer-motion'
import { Route, CheckCircle2 } from 'lucide-react'
import { paths } from '@/data/paths'

export function PathSelectionStep({
  selectedTrilha,
  onSelect,
}: {
  selectedTrilha: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-none flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Route className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-0.5">
              Escolha sua Trilha
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">
              Defina o caminho que seu personagem seguirá <span className="text-ecoar-magenta/70">(opcional)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Cards Compactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {paths.map((path, index) => {
          const isSelected = selectedTrilha === path.id
          
          return (
            <motion.button
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(path.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-3.5 rounded-none border transition-all text-left ${
                isSelected
                  ? 'bg-ecoar-teal/15 border-ecoar-teal/60 shadow-none shadow-ecoar-teal/10'
                  : 'bg-slate-50 dark:bg-ecoar-light-900/10 border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30'
              }`}
            >
              {/* Ícone e Título */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex-shrink-0 w-10 h-10 rounded-none flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-ecoar-teal/20 text-ecoar-teal'
                    : 'bg-slate-50 dark:bg-ecoar-light-900/10 text-slate-500 dark:text-ecoar-light-900/60'
                }`}>
                  <Route className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm ${
                    isSelected ? 'text-slate-900 dark:text-ecoar-light-900' : 'text-slate-900 dark:text-ecoar-light-900/90'
                  }`}>
                    {path.name}
                  </h4>
                  <span className={`text-xs ${
                    path.type === 'anti-cacada'
                      ? 'text-ecoar-magenta'
                      : 'text-ecoar-teal'
                  }`}>
                    {{
                      bruxaria: 'Bruxaria',
                      cacada: 'Caçada',
                      esperanca: 'Esperança',
                      patronos: 'Patronos',
                      violencia: 'Violência',
                      'anti-cacada': 'Anti-Caçada',
                    }[path.type]}
                  </span>
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
              <p className={`text-xs leading-relaxed ${
                isSelected ? 'text-slate-700 dark:text-ecoar-light-900/80 dark:text-ecoar-light-900/80' : 'text-slate-500 dark:text-ecoar-light-900/60 dark:text-ecoar-light-900/60'
              }`}>
                {path.description}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

