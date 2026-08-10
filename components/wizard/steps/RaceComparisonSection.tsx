'use client'

import type { Race } from '@/data/races'
import { formatRaceBonusChips } from '@/lib/formatRaceBonuses'
import { microLabel, mutedBody, statusLabel } from '@/shared/styles/ecoarChrome'

function terrestrialSpeed(race: Race): number {
  return race.bonuses?.movement?.terrestre ?? 6
}

export function RaceComparisonSection({
  selectedRaca,
  previewRaca,
  availableRaces,
  onPreview,
}: {
  selectedRaca: string
  previewRaca?: string | null
  availableRaces: Race[]
  onPreview: (id: string) => void
}) {
  const others = availableRaces
    .filter((r) => r.id !== selectedRaca)
    .slice()
    .sort((a, b) => {
      const speed = terrestrialSpeed(a) - terrestrialSpeed(b)
      if (speed !== 0) return speed
      return a.name.localeCompare(b.name, 'pt-BR')
    })

  if (others.length === 0) return null

  return (
    <div className="border border-ecoar-teal/50 dark:border-ecoar-teal">
      <div className="px-3 py-2.5 border-b border-ecoar-teal/40 dark:border-ecoar-teal/60 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={statusLabel}>Comparar outras raças</p>
          <p className={`${microLabel} font-normal tabular-nums`}>
            {others.length}
          </p>
        </div>
        <p className={`${mutedBody} max-w-[52ch]`}>
          Só espiar — a raça escolhida não muda até você confirmar.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ecoar-teal/40">
        {others.map((race) => {
          const chips = formatRaceBonusChips(race, 2)
          const isPreview = previewRaca === race.id

          return (
            <button
              key={race.id}
              type="button"
              onClick={() => onPreview(race.id)}
              aria-pressed={isPreview}
              aria-label={
                isPreview
                  ? `${race.name}, em espiar`
                  : `Espiar ${race.name} sem trocar a seleção`
              }
              className={`min-h-12 text-left p-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-magenta ${
                isPreview
                  ? 'bg-ecoar-magenta/20 !border-ecoar-magenta border'
                  : 'bg-[#0a0a0a]/80 hover:bg-ecoar-magenta/15 border border-transparent'
              }`}
            >
              <div className="font-display text-sm uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 mb-1">
                {race.name}
              </div>
              {chips.length > 0 ? (
                <p className="text-xs uppercase tracking-[0.1em] text-ecoar-teal font-normal">
                  {chips.join(' · ')}
                </p>
              ) : (
                <p className={`${microLabel} font-normal mt-1`}>Sem bônus em destaque</p>
              )}
              <p className={`${microLabel} font-normal mt-1`}>
                {isPreview ? 'Em espiar' : 'Espiar'}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
