'use client'

import { useMemo } from 'react'
import type { Race } from '@/data/races'
import RaceCard from '@/shared/components/ui/RaceCard'
import WizardStage from '@/components/beyond/WizardStage'
import { formatRaceBonusChips } from '@/lib/formatRaceBonuses'
import { microLabel, statusLabel } from '@/shared/styles/ecoarChrome'

type SpeedBand = 4 | 6 | 8

const SPEED_BANDS: { speed: SpeedBand; label: string }[] = [
  { speed: 4, label: 'Passo 4m' },
  { speed: 6, label: 'Passo 6m' },
  { speed: 8, label: 'Passo 8m' },
]

function terrestrialSpeed(race: Race): SpeedBand {
  const t = race.bonuses?.movement?.terrestre ?? 6
  if (t <= 4) return 4
  if (t >= 8) return 8
  return 6
}

function groupRacesBySpeed(races: Race[]) {
  return SPEED_BANDS.map(({ speed, label }) => ({
    speed,
    label,
    races: races.filter((race) => terrestrialSpeed(race) === speed),
  })).filter((group) => group.races.length > 0)
}

export function RaceSelectionStep({
  selectedRaca,
  onRacaSelect,
  availableRaces,
}: {
  selectedRaca: string
  onRacaSelect: (raca: string) => void
  availableRaces: Race[]
}) {
  const groups = useMemo(() => groupRacesBySpeed(availableRaces), [availableRaces])

  const sections = useMemo(() => {
    let plateIndex = 0
    return groups.map((group) => ({
      ...group,
      items: group.races.map((race) => {
        const index = plateIndex
        plateIndex += 1
        return { race, index }
      }),
    }))
  }, [groups])

  return (
    <WizardStage
      title="Raça"
      refId="STEP-01"
      lede="Agrupadas pelo deslocamento terrestre."
      hero={false}
      quiet
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p
            role="status"
            className={`${statusLabel} font-normal ${
              selectedRaca ? 'text-ecoar-magenta' : ''
            }`}
          >
            {selectedRaca
              ? `Selecionada · ${
                  availableRaces.find((r) => r.id === selectedRaca)?.name ?? 'raça'
                }`
              : 'Escolha uma raça'}
          </p>
          <p className={`${microLabel} font-normal tabular-nums`}>
            {availableRaces.length} linhagens · {groups.length} faixas
          </p>
        </div>

        {sections.map((group) => (
          <section
            key={group.speed}
            className="space-y-2"
            aria-labelledby={`race-band-${group.speed}`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 id={`race-band-${group.speed}`} className={statusLabel}>
                {group.label}
              </h3>
              <span className={`${microLabel} font-normal tabular-nums`}>
                {group.races.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {group.items.map(({ race, index }) => (
                <RaceCard
                  key={race.id}
                  name={race.name}
                  bonuses={formatRaceBonusChips(race, 2)}
                  isSelected={selectedRaca === race.id}
                  onClick={() => onRacaSelect(race.id)}
                  index={index}
                  imageSrc={race.image?.src}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </WizardStage>
  )
}
