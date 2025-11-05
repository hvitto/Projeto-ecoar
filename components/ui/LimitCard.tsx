'use client'

import { LucideIcon } from 'lucide-react'
import Card from './Card'

interface LimitCardProps {
  icon: LucideIcon
  name: string
  description: string
  bonus: number
  className?: string
}

export default function LimitCard({
  icon: Icon,
  name,
  description,
  bonus,
  className = '',
}: LimitCardProps) {
  return (
    <Card variant="default" className={`p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-ecoar-teal dark:text-ecoar-teal-400" />
          <span className="text-sm font-semibold text-white dark:text-ecoar-light-900">
            {name}
          </span>
        </div>
        <span className="text-sm font-bold text-ecoar-teal dark:text-ecoar-teal-400">+{bonus}</span>
      </div>
      <p className="text-xs text-white/60 dark:text-ecoar-light-900/60 ml-6 leading-relaxed">
        {description}
      </p>
    </Card>
  )
}

