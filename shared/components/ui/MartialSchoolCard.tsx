'use client'

import { CheckCircle2 } from 'lucide-react'
import { MartialSchoolData } from '@/data/martialSchoolSingularities'
import { selectedPanel, idlePanel, displayTitle, microLabel, mutedBody } from '@/shared/styles/ecoarChrome'

interface MartialSchoolCardProps {
  school: MartialSchoolData
  isSelected: boolean
  onClick: () => void
  index?: number
  className?: string
}

export default function MartialSchoolCard({
  school,
  isSelected,
  onClick,
  className = '',
}: MartialSchoolCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-none border transition-colors duration-200 text-left overflow-hidden ${
        isSelected ? selectedPanel : `${idlePanel} cursor-pointer`
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <h4 className={`${displayTitle} text-base mb-1`}>
            {school.name}
          </h4>
          <div className={`flex items-center gap-2 ${microLabel}`}>
            <span className="px-1.5 py-0.5 border border-ecoar-teal/35 dark:border-ecoar-teal/30">{school.class}</span>
            <span>{school.aptitude}</span>
          </div>
        </div>
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-ecoar-magenta flex-shrink-0" />
        )}
      </div>

      <p className={`${mutedBody} mb-3`}>
        {school.description}
      </p>

      <div className={`space-y-1.5 ${microLabel}`}>
        <div><span className="text-ecoar-teal">Ferramenta:</span> {school.tool}</div>
        {school.toolNote && (
          <div className="text-ecoar-dark-900 dark:text-ecoar-light-900 bg-ecoar-magenta/10 px-3 py-2 border border-ecoar-magenta/45 normal-case tracking-normal text-xs mt-2">↪ {school.toolNote}</div>
        )}
        <div className="pt-1">
          <span className="text-ecoar-teal">Atributos sugeridos:</span> {school.suggestedAttributes?.join(', ')}
        </div>
        <div>
          <span className="text-ecoar-teal">Habilidades sugeridas:</span> {school.suggestedSkills?.join(', ')}
        </div>
      </div>
    </button>
  )
}
