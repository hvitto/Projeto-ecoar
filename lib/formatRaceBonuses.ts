import type { Race } from '@/data/races'

const ATTRIBUTE_LABELS: Record<string, string> = {
  carisma: 'Carisma',
  finesse: 'Finesse',
  forca: 'Força',
  inteligencia: 'Inteligência',
  percepcao: 'Percepção',
  vitalidade: 'Vitalidade',
  vontade: 'Vontade',
}

export type RaceBonusLine = {
  key: string
  label: string
  value: string
  hint?: string
}

function signed(value: number) {
  return value >= 0 ? `+${value}` : `${value}`
}

export function formatRaceBonusLines(race: Race): RaceBonusLine[] {
  const lines: RaceBonusLine[] = []
  const bonuses = race.bonuses
  if (!bonuses) return lines

  if (bonuses.attributes) {
    Object.entries(bonuses.attributes).forEach(([attr, value]) => {
      lines.push({
        key: `attr-${attr}`,
        label: ATTRIBUTE_LABELS[attr] || attr,
        value: signed(value),
      })
    })
  }

  if (bonuses.skills) {
    Object.entries(bonuses.skills).forEach(([skill, value]) => {
      lines.push({
        key: `skill-${skill}`,
        label: skill,
        value: signed(value),
      })
    })
  }

  if (bonuses.corpo != null) {
    lines.push({
      key: 'corpo',
      label: 'Corpo',
      value: signed(bonuses.corpo),
      hint: 'Limite de dano físico antes da incapacitação.',
    })
  }
  if (bonuses.mente != null) {
    lines.push({
      key: 'mente',
      label: 'Mente',
      value: signed(bonuses.mente),
      hint: 'Limite de estresse mental e fadiga.',
    })
  }
  if (bonuses.folego != null) {
    lines.push({
      key: 'folego',
      label: 'Fôlego',
      value: signed(bonuses.folego),
    })
  }
  if (bonuses.mana != null) {
    lines.push({
      key: 'mana',
      label: 'Mana',
      value: signed(bonuses.mana),
    })
  }

  if (bonuses.movement?.terrestre != null) {
    lines.push({
      key: 'mov-terrestre',
      label: 'Terrestre',
      value: `${bonuses.movement.terrestre}m`,
    })
  }
  if (bonuses.movement?.aquatico != null) {
    lines.push({
      key: 'mov-aquatico',
      label: 'Aquático',
      value: `${bonuses.movement.aquatico}m`,
    })
  }
  if (bonuses.movement?.aereo != null) {
    lines.push({
      key: 'mov-aereo',
      label: 'Aéreo',
      value: `${bonuses.movement.aereo}m`,
    })
  }

  if (bonuses.senses?.visao != null) {
    lines.push({
      key: 'sense-visao',
      label: 'Visão',
      value: `${bonuses.senses.visao}m`,
    })
  }
  if (bonuses.senses?.audicao != null) {
    lines.push({
      key: 'sense-audicao',
      label: 'Audição',
      value: `${bonuses.senses.audicao}m`,
    })
  }
  if (bonuses.senses?.olfato != null) {
    lines.push({
      key: 'sense-olfato',
      label: 'Olfato',
      value: `${bonuses.senses.olfato}m`,
    })
  }

  return lines
}

export function formatRaceBonusChips(race: Race, limit = 2): string[] {
  const chips: string[] = []
  const bonuses = race.bonuses
  if (!bonuses) return chips

  if (bonuses.corpo != null) {
    chips.push(`Corpo ${signed(bonuses.corpo)}`)
  }
  if (bonuses.mente != null) {
    chips.push(`Mente ${signed(bonuses.mente)}`)
  }

  if (bonuses.attributes) {
    Object.entries(bonuses.attributes).forEach(([attr, value]) => {
      if (chips.length >= limit) return
      const label = ATTRIBUTE_LABELS[attr] || attr
      chips.push(`${label} ${signed(value)}`)
    })
  }

  const mov = bonuses.movement
  if (chips.length < limit && mov?.aereo != null) {
    chips.push(`Aéreo ${mov.aereo}m`)
  }
  if (
    chips.length < limit &&
    mov?.aquatico != null &&
    mov.aquatico >= (mov.terrestre ?? 0)
  ) {
    chips.push(`Aquático ${mov.aquatico}m`)
  }
  if (chips.length < limit && mov?.terrestre != null) {
    chips.push(`Terrestre ${mov.terrestre}m`)
  }

  return chips.slice(0, limit)
}
