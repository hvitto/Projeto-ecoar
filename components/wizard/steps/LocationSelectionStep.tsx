'use client'

import { MapPin, CheckCircle2 } from 'lucide-react'
import { getAllNations, getLocationsByNation } from '@/data/locations'

export function LocationSelectionStep({
  selectedLocalizacao,
  onSelect,
}: {
  selectedLocalizacao: string
  onSelect: (id: string) => void
}) {
  const nations = getAllNations()

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-none flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <MapPin className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-0.5">
              Escolha sua Localização
            </h3>
            <p className="text-xs text-slate-400 dark:text-ecoar-light-900/50">
              Selecione a localização de origem do seu personagem
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {nations.map((nation) => {
          const nationLocations = getLocationsByNation(nation)
          if (nationLocations.length === 0) return null

          return (
            <div key={nation} className="space-y-4">
              <div className="border-b border-slate-200 dark:border-ecoar-light-900/20 pb-2">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900">{nation}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nationLocations.map((location) => {
                  const isSelected = selectedLocalizacao === location.id

                  return (
                    <button
                      type="button"
                      key={location.id}
                      onClick={() => onSelect(location.id)}
                      className={`relative p-4 rounded-none border-2 transition-colors text-left ${
                        isSelected
                          ? 'bg-ecoar-teal/10 border-ecoar-teal shadow-none shadow-ecoar-teal/20'
                          : 'bg-slate-50 dark:bg-ecoar-light-900/10 border-slate-200 dark:border-ecoar-light-900/20 hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15 hover:border-ecoar-teal/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-none flex items-center justify-center ${
                            isSelected
                              ? 'bg-ecoar-teal/20 text-ecoar-teal'
                              : 'bg-slate-50 dark:bg-ecoar-light-900/10 text-slate-500 dark:text-ecoar-light-900/60'
                          }`}
                        >
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-semibold text-sm ${
                              isSelected
                                ? 'text-slate-900 dark:text-ecoar-light-900'
                                : 'text-slate-900 dark:text-ecoar-light-900/90'
                            }`}
                          >
                            {location.name}
                          </h4>
                          {location.region && (
                            <span className="text-xs text-slate-500 dark:text-ecoar-light-900/60">
                              {location.region}
                            </span>
                          )}
                          {location.technology && (
                            <span className="text-xs text-ecoar-teal/70 ml-2">• {location.technology}</span>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
                        )}
                      </div>

                      {location.description && (
                        <p
                          className={`text-xs leading-relaxed ${
                            isSelected
                              ? 'text-slate-700 dark:text-ecoar-light-900/80'
                              : 'text-slate-500 dark:text-ecoar-light-900/60'
                          }`}
                        >
                          {location.description}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
