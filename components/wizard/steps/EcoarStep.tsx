'use client'

import { useEcoarCatalogData } from '@/lib/ecoarCatalogClient'

export function EcoarStep({
  selectedEcoar,
  singularidadesEcoar,
  onEcoarSelect,
  onSingularidadesChange,
}: {
  selectedEcoar: string
  singularidadesEcoar: string[]
  onEcoarSelect: (id: string) => void
  onSingularidadesChange: (singularidades: string[]) => void
}) {
  const { playableEcoarTypes } = useEcoarCatalogData()
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-1.5">Ecoar</h3>
        <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50 dark:text-ecoar-light-900/50">Selecione seu Ecoar e suas singularidades</p>
      </div>

      {/* Ecoar Selection */}
      <div>
        <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 dark:text-ecoar-light-900/90 mb-3">Tipo de Ecoar</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playableEcoarTypes.map((ecoa) => (
            <button
              key={ecoa.id}
              type="button"
              onClick={() => onEcoarSelect(selectedEcoar === ecoa.id ? '' : ecoa.id)}
              className={`p-4 rounded-none border transition-all transform hover:scale-101 text-left ${
                selectedEcoar === ecoa.id
                  ? 'border-ecoar-teal/60 bg-ecoar-teal/15 shadow-none shadow-ecoar-teal/10'
                  : 'border-white/[0.08] dark:border-ecoar-light-900/[0.08] bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] hover:border-ecoar-teal/30 dark:hover:border-ecoar-teal-500/30 hover:bg-white/[0.06] dark:hover:bg-ecoar-light-900/[0.06]'
              }`}
            >
              <div className="text-slate-900 dark:text-ecoar-light-900 font-bold text-lg">{ecoa.name}</div>
              <p className="text-slate-600 dark:text-ecoar-light-900/70 text-sm mt-2">{ecoa.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Ecoar Singularities - Placeholder */}
      {selectedEcoar && (
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-ecoar-light-900 mb-4">Singularidades do Ecoar</h4>
          <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">Selecione singularidades específicas do seu Ecoar</p>
          <div className="mt-4 p-4 bg-gray-800/40 rounded-none border border-ecoar-dark/50">
            <p className="text-slate-500 dark:text-ecoar-light-900/60 text-sm">Funcionalidade em desenvolvimento...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Creation Points Step
