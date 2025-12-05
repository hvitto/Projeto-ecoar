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
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-teal-600 dark:text-ecoar-teal-400/80" />
          <span className="text-xs font-medium text-slate-900 dark:text-ecoar-light-900/90">
            {name}
          </span>
        </div>
        <span className="text-xs font-semibold text-teal-600 dark:text-ecoar-teal-400/90">+{bonus}</span>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-ecoar-light-900/50 ml-5 leading-relaxed">
        {description}
      </p>
    </Card>
  )
}

