'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Users, Circle } from 'lucide-react'
import type { Race } from '@/data/races'
import RaceCard from '@/shared/components/ui/RaceCard'

export function RaceSelectionStep({
  selectedRaca,
  onRacaSelect,
  availableRaces,
}: {
  selectedRaca: string
  onRacaSelect: (raca: string) => void
  availableRaces: Race[]
}) {
  const raceVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
            <Users className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-0.5">
              Escolha sua Raça
            </h3>
            <p className="text-xs text-slate-500 dark:text-ecoar-light-900/50">Selecione sua Raça</p>
          </div>
        </div>
      </div>

      {/* Race Selection */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-base font-semibold text-slate-900 dark:text-ecoar-light-900/90 mb-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-teal-100 dark:bg-ecoar-teal-600/20 rounded-lg border border-teal-300 dark:border-ecoar-teal-500/40">
              <Circle className="w-4 h-4 text-teal-600 dark:text-ecoar-teal-400" />
            </div>
            <span>Selecione sua Raça</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableRaces.map((race, index) => {
              const attributeLabelsShort: Record<string, string> = {
                carisma: 'Carisma',
                finesse: 'Finesse',
                forca: 'Força',
                inteligencia: 'Inteligência',
                percepcao: 'Percepção',
                vitalidade: 'Vitalidade',
                vontade: 'Vontade',
              }
              
              const getBonusesSummary = (race: Race) => {
                if (!race.bonuses) return []
                const summary: string[] = []
                
                // Atributos com formatação clara
                if (race.bonuses.attributes) {
                  Object.entries(race.bonuses.attributes).forEach(([attr, value]) => {
                    const label = attributeLabelsShort[attr] || attr
                    const sign = value >= 0 ? '+' : ''
                    summary.push(`${label} ${sign}${value}`)
                  })
                }
                
                // Deslocamentos com nomes completos
                if (race.bonuses.movement) {
                  if (race.bonuses.movement.terrestre) summary.push(`Terrestre: ${race.bonuses.movement.terrestre}m`)
                  if (race.bonuses.movement.aquatico) summary.push(`Aquático: ${race.bonuses.movement.aquatico}m`)
                  if (race.bonuses.movement.aereo) summary.push(`Aéreo: ${race.bonuses.movement.aereo}m`)
                }
                
                // Sentidos com nomes completos
                if (race.bonuses.senses) {
                  if (race.bonuses.senses.visao) summary.push(`Visão: ${race.bonuses.senses.visao}m`)
                  if (race.bonuses.senses.audicao) summary.push(`Audição: ${race.bonuses.senses.audicao}m`)
                  if (race.bonuses.senses.olfato) summary.push(`Olfato: ${race.bonuses.senses.olfato}m`)
                }
                
                // Limites
                if (race.bonuses.corpo) {
                  const sign = race.bonuses.corpo >= 0 ? '+' : ''
                  summary.push(`Corpo ${sign}${race.bonuses.corpo}`)
                }
                if (race.bonuses.mente) {
                  const sign = race.bonuses.mente >= 0 ? '+' : ''
                  summary.push(`Mente ${sign}${race.bonuses.mente}`)
                }
                
                return summary
              }
              
              const bonuses = getBonusesSummary(race)
              const isSelected = selectedRaca === race.id
              
              return (
                <RaceCard
                  key={race.id}
                  name={race.name}
                  description={race.description}
                  bonuses={bonuses}
                  isSelected={isSelected}
                  onClick={() => onRacaSelect(race.id)}
                  index={index}
                />
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

