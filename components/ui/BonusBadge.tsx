'use client'

import Badge from './Badge'

interface BonusBadgeProps {
  value: number
  source: 'race' | 'martial-school'
  className?: string
}

export default function BonusBadge({ value, source, className = '' }: BonusBadgeProps) {
  if (value === 0) return null

  return (
    <Badge
      variant={source === 'race' ? 'cost' : 'bonus'}
      size="sm"
      className={`${className}`}
    >
      <div className="flex flex-col items-center">
        <span className="text-[8px] uppercase leading-tight">
          {source === 'race' ? 'Raça' : 'Escola'}
        </span>
        <span className="font-bold leading-none">+{value}</span>
      </div>
    </Badge>
  )
}

