'use client'

import type { Race } from '@/data/races'
import RaceCard from '@/shared/components/ui/RaceCard'
import WizardStage from '@/components/beyond/WizardStage'

export function RaceSelectionStep({
  selectedRaca,
  onRacaSelect,
  availableRaces,
}: {
  selectedRaca: string
  onRacaSelect: (raca: string) => void
  availableRaces: Race[]
}) {
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

    if (race.bonuses.attributes) {
      Object.entries(race.bonuses.attributes).forEach(([attr, value]) => {
        const label = attributeLabelsShort[attr] || attr
        const sign = value >= 0 ? '+' : ''
        summary.push(`${label} ${sign}${value}`)
      })
    }

    if (race.bonuses.movement) {
      if (race.bonuses.movement.terrestre) summary.push(`Terrestre: ${race.bonuses.movement.terrestre}m`)
      if (race.bonuses.movement.aquatico) summary.push(`Aquático: ${race.bonuses.movement.aquatico}m`)
      if (race.bonuses.movement.aereo) summary.push(`Aéreo: ${race.bonuses.movement.aereo}m`)
    }

    if (race.bonuses.senses) {
      if (race.bonuses.senses.visao) summary.push(`Visão: ${race.bonuses.senses.visao}m`)
      if (race.bonuses.senses.audicao) summary.push(`Audição: ${race.bonuses.senses.audicao}m`)
      if (race.bonuses.senses.olfato) summary.push(`Olfato: ${race.bonuses.senses.olfato}m`)
    }

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

  return (
    <WizardStage
      title="Raça"
      refId="STEP-01"
      lede="Uma plate por linhagem. Imagem processada, bônus na margem."
      hero="glitch"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {availableRaces.map((race, index) => (
          <RaceCard
            key={race.id}
            name={race.name}
            description={race.description}
            bonuses={getBonusesSummary(race)}
            isSelected={selectedRaca === race.id}
            onClick={() => onRacaSelect(race.id)}
            index={index}
            imageSrc={race.image?.src}
          />
        ))}
      </div>
    </WizardStage>
  )
}
