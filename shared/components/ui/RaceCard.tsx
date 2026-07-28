'use client'

import SelectPlate from '@/components/beyond/SelectPlate'

interface RaceCardProps {
  name: string
  description: string
  bonuses: string[]
  isSelected: boolean
  onClick: () => void
  index?: number
  className?: string
  imageSrc?: string
}

export default function RaceCard({
  name,
  description,
  bonuses,
  isSelected,
  onClick,
  index = 0,
  className = '',
  imageSrc,
}: RaceCardProps) {
  return (
    <SelectPlate
      title={name}
      description={description}
      imageSrc={imageSrc}
      imageAlt={name}
      selected={isSelected}
      onClick={onClick}
      index={index}
      className={className}
      meta={
        bonuses.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {bonuses.slice(0, 3).map((bonus) => (
              <span
                key={bonus}
                className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-ecoar-teal/50 text-ecoar-teal"
              >
                {bonus}
              </span>
            ))}
            {bonuses.length > 3 ? (
              <span className="text-[9px] uppercase tracking-[0.1em] text-ecoar-dark-500 dark:text-[#adb5bd]">
                +{bonuses.length - 3}
              </span>
            ) : null}
          </div>
        ) : null
      }
    />
  )
}
