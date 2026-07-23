'use client'

import Badge from './Badge'
import Image from 'next/image'

interface RaceCardProps {
  name: string
  description: string
  bonuses: string[]
  isSelected: boolean
  onClick: () => void
  index?: number
  className?: string
}

export default function RaceCard({
  name,
  description,
  bonuses,
  isSelected,
  onClick,
  index = 0,
  className = '',
}: RaceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-3.5 rounded-lg border transition-colors duration-200 text-left overflow-hidden ${
        isSelected
          ? 'bg-ecoar-teal-50 dark:bg-ecoar-teal-600/15 border-ecoar-teal-400 dark:border-ecoar-teal-500/60 shadow-md shadow-ecoar-teal-200/30 dark:shadow-ecoar-teal-600/20'
          : 'bg-ecoar-light-700 dark:bg-ecoar-light-900/[0.03] border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] hover:bg-ecoar-light-800 dark:hover:bg-ecoar-light-900/[0.06] hover:border-ecoar-dark-400/40 dark:hover:border-ecoar-teal-500/30'
      } ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-ecoar-light-800 dark:bg-ecoar-dark-600">
          <Image
            src="/assets/icons/mayne-icon.png"
            alt="Ícone de raça"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
            priority={index < 4}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${
            isSelected ? 'text-ecoar-dark-900 dark:text-ecoar-light-900' : 'text-ecoar-dark-900 dark:text-ecoar-light-900/90'
          }`}>
            {name}
          </h4>
        </div>
      </div>

      <p className={`text-xs leading-relaxed mb-2 ${
        isSelected ? 'text-ecoar-dark-700 dark:text-ecoar-light-900/80' : 'text-ecoar-dark-600 dark:text-ecoar-light-900/60'
      }`}>
        {description}
      </p>

      {bonuses.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {bonuses.slice(0, 3).map((bonus, idx) => (
            <Badge key={idx} variant="bonus" size="sm">
              {bonus}
            </Badge>
          ))}
          {bonuses.length > 3 && (
            <Badge variant="status" size="sm">
              +{bonuses.length - 3} bônus
            </Badge>
          )}
        </div>
      )}
    </button>
  )
}
