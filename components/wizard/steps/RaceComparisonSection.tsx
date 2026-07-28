'use client'

import { races } from '@/data/races'

export function RaceComparisonSection({
  selectedRaca,
  onSelect,
}: {
  selectedRaca: string
  onSelect: (id: string) => void
}) {
  const others = races.filter((r) => r.id !== selectedRaca).slice(0, 6)

  return (
    <div className="border border-ecoar-teal/50 dark:border-ecoar-teal">
      <div className="px-3 py-2 border-b border-ecoar-teal/40 dark:border-ecoar-teal/60 flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase tracking-[0.16em] text-ecoar-teal">Comparar · Outras plates</p>
        <p className="text-[9px] uppercase tracking-[0.12em] text-ecoar-dark-500 dark:text-[#adb5bd]">
          {others.length} REF
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ecoar-teal/40">
        {others.map((race) => {
          const mov = race.bonuses?.movement
          const bonusCount =
            (race.bonuses?.attributes ? Object.keys(race.bonuses.attributes).length : 0) +
            (race.bonuses?.corpo ? 1 : 0) +
            (race.bonuses?.mente ? 1 : 0) +
            (mov ? Object.values(mov).filter(Boolean).length : 0)

          return (
            <button
              key={race.id}
              type="button"
              onClick={() => onSelect(race.id)}
              className="text-left bg-[#0a0a0a]/80 p-3 hover:bg-ecoar-magenta/15 transition-colors"
            >
              <div className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 mb-1">
                {race.name}
              </div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-ecoar-teal">
                {mov?.terrestre ? `Terrestre ${mov.terrestre}m` : '—'}
                {mov?.aquatico ? ` · Aquático ${mov.aquatico}m` : ''}
              </p>
              <p className="text-[9px] uppercase tracking-[0.12em] text-ecoar-dark-500 dark:text-[#adb5bd] mt-1">
                +{bonusCount} sinais
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
