'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { CheckCircle2, ChevronDown, Info, Star } from 'lucide-react'
import { soulLevels, getSoulLevelByNivel, getEstagios } from '@/data/soulLevels'

export function SoulLevelSelectionStep({
  nivelAlmaInicial,
  onSelect,
  variant,
}: {
  nivelAlmaInicial: number
  onSelect: (nivel: number) => void
  variant?: 'light' | 'dark'
}) {
  const { theme } = useTheme()
  const isLight = variant === 'light' || (variant === undefined && theme === 'light')
  const textColor = isLight ? 'text-ecoar-dark' : 'text-white dark:text-ecoar-light-900'
  const textColorMuted = isLight
    ? 'text-ecoar-dark/70'
    : 'text-slate-600 dark:text-ecoar-light-900/70'
  const bgCard = isLight
    ? 'bg-ecoar-light-700 border-ecoar-teal-400/30'
    : 'bg-ecoar-teal-100/50 dark:bg-ecoar-teal-600/20 border-ecoar-teal-400/40 dark:border-ecoar-teal-500/40'
  const bgSelected = isLight
    ? 'bg-ecoar-teal-100/50 border-ecoar-teal-400'
    : 'bg-ecoar-teal-200/50 dark:bg-ecoar-teal-600/20 border-ecoar-teal-400 dark:border-ecoar-teal-500'
  const bgUnselected = isLight
    ? 'bg-ecoar-light-800 border-ecoar-dark-300/30'
    : 'bg-ecoar-light-800 dark:bg-ecoar-light-900/10 border-ecoar-dark-300/30 dark:border-ecoar-light-900/20'
  const bgInfo = isLight
    ? 'bg-ecoar-teal/5 border-ecoar-teal/20'
    : 'bg-slate-50 dark:bg-ecoar-light-900/10 border-slate-200 dark:border-ecoar-light-900/20'
  const selectedSoulLevel = getSoulLevelByNivel(nivelAlmaInicial)
  const estagios = getEstagios()
  const initialTabIndex = selectedSoulLevel ? estagios.indexOf(selectedSoulLevel.estagio) : 0
  const [openEstagioIndex, setOpenEstagioIndex] = useState(initialTabIndex >= 0 ? initialTabIndex : 0)
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className="space-y-4">
      {selectedSoulLevel && (
        <div
          className={`flex flex-wrap items-center gap-2 sm:gap-3 py-2.5 px-3 sm:px-4 rounded-lg border ${bgCard} border-ecoar-dark-300/30 dark:border-ecoar-light-900/20`}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-ecoar-teal dark:text-ecoar-teal-400 flex-shrink-0" />
            <span className={`text-sm font-semibold ${textColor}`}>Nível {selectedSoulLevel.nivel}</span>
          </div>
          <span className="text-slate-400 dark:text-ecoar-light-900/40">·</span>
          <span className={`text-sm ${textColorMuted}`}>{selectedSoulLevel.pontosEvolucao} PE</span>
          <span className="text-slate-400 dark:text-ecoar-light-900/40">·</span>
          <span className={`text-sm ${textColorMuted}`}>Poder {selectedSoulLevel.nivelPoder}</span>
          <span className="text-slate-400 dark:text-ecoar-light-900/40 hidden sm:inline">·</span>
          <span className={`text-xs ${textColorMuted} w-full sm:w-auto`}>
            {selectedSoulLevel.nivel === 1
              ? 'Recomendado para iniciantes. Base de ȼ5500 + pontos de criação.'
              : `Base de ȼ5500 + pontos de criação + ${selectedSoulLevel.pontosEvolucao} PE (ȼ${selectedSoulLevel.pontosEvolucao * 50}).`}
          </span>
        </div>
      )}

      <div className="-mx-1 px-1 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 mb-3 min-w-max sm:min-w-0 sm:flex-wrap">
          {estagios.map((estagio, estagioIndex) => {
            const niveisDoEstagio = soulLevels.filter((sl) => sl.estagio === estagio)
            const nivelPoder = niveisDoEstagio[0]?.nivelPoder || 0
            const isActive = openEstagioIndex === estagioIndex
            const shortName = estagio.replace(/^Personagem\s+/, '')
            return (
              <button
                key={estagio}
                type="button"
                onClick={() => setOpenEstagioIndex(estagioIndex)}
                className={`px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all border flex items-center gap-2 shrink-0 ${
                  isActive
                    ? `${bgSelected} border-ecoar-teal/50 dark:border-ecoar-teal-500/50 shadow-md`
                    : `${bgUnselected} ${
                        isLight
                          ? 'hover:bg-ecoar-teal/5 hover:border-ecoar-teal/30'
                          : 'hover:bg-ecoar-light-900/10 hover:border-ecoar-teal-500/30'
                      } border-ecoar-dark-300/30 dark:border-ecoar-light-900/20`
                }`}
              >
                <span className={isActive ? textColor : textColorMuted}>{shortName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-ecoar-teal/15 dark:bg-ecoar-teal-600/20 text-ecoar-teal dark:text-ecoar-teal-400">
                  Poder {nivelPoder}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {(() => {
          const estagioAtivo = estagios[openEstagioIndex]
          const niveisDoEstagio = estagioAtivo
            ? soulLevels.filter((sl) => sl.estagio === estagioAtivo)
            : []
          return niveisDoEstagio.map((soulLevel) => {
            const isSelected = nivelAlmaInicial === soulLevel.nivel
            return (
              <motion.button
                key={soulLevel.nivel}
                onClick={() => onSelect(soulLevel.nivel)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 sm:p-3.5 rounded-lg border transition-all text-left min-h-[96px] ${
                  isSelected
                    ? `${bgSelected} shadow-lg shadow-ecoar-teal/10 dark:shadow-ecoar-teal-600/20`
                    : `${bgUnselected} ${
                        isLight ? 'hover:bg-ecoar-teal/5' : 'hover:bg-slate-100 dark:hover:bg-ecoar-light-900/15'
                      } hover:border-ecoar-teal/30 dark:hover:border-ecoar-teal-500/40`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-base sm:text-lg font-bold ${isSelected ? textColor : textColorMuted}`}>
                    Nível {soulLevel.nivel}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className={`text-xs ${textColorMuted}`}>{soulLevel.pontosEvolucao} PE</p>
                  <p className="text-xs text-ecoar-teal dark:text-ecoar-teal-400">+ȼ5500 base</p>
                  {soulLevel.nivel > 1 && (
                    <p className="text-xs text-ecoar-teal dark:text-ecoar-teal-400">
                      +ȼ{soulLevel.pontosEvolucao * 50} do nível
                    </p>
                  )}
                </div>
              </motion.button>
            )
          })
        })()}
      </div>

      <div
        className={`mt-4 rounded-lg border overflow-hidden ${bgInfo} border-ecoar-dark-300/20 dark:border-ecoar-light-900/20`}
      >
        <button
          type="button"
          onClick={() => setInfoOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 py-3 px-3 text-left transition-colors hover:bg-ecoar-teal/5 dark:hover:bg-ecoar-light-900/10 min-h-[44px]"
        >
          <span className="flex items-center gap-2 text-sm text-ecoar-teal dark:text-ecoar-teal-400">
            <Info className="w-4 h-4 flex-shrink-0" />
            Saiba mais sobre níveis iniciais
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 dark:text-ecoar-light-900/60 transition-transform duration-200 flex-shrink-0 ${
              infoOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {infoOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-0 border-t border-ecoar-teal/10 dark:border-ecoar-light-900/10">
                <div className={`text-xs ${textColorMuted} space-y-2 pt-2`}>
                  <p>
                    <strong className={textColor}>Por padrão:</strong> É recomendado para jogadores
                    iniciantes ou casuais que os personagens comecem no início (Nível de Alma 1) e
                    que todos aprendam juntos, evoluindo de forma conjunta.
                  </p>
                  <p>
                    <strong className={textColor}>Nível acima de 1:</strong> Caso seu Nível de Alma
                    inicial seja acima de 1, você pode usar estes Pontos de Evolução durante a
                    criação de personagem para adquirir singularidades ou evoluir traços, e deverão
                    ser gastos conforme as regras de evolução vistas mais para frente. Para cada
                    Ponto de Evolução inicial, você também recebe ȼ50 extras.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
