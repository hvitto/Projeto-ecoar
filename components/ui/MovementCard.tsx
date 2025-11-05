'use client'

import { LucideIcon } from 'lucide-react'
import Card from './Card'

interface MovementCardProps {
  icon: LucideIcon
  name: string
  value: number
  unit?: string
  className?: string
}

export default function MovementCard({
  icon: Icon,
  name,
  value,
  unit = 'm',
  className = '',
}: MovementCardProps) {
  return (
    <Card variant="default" className={`flex items-center justify-between p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-ecoar-teal dark:text-ecoar-teal-400" />
        <span className="text-sm font-semibold text-white dark:text-ecoar-light-900">{name}</span>
      </div>
      <span className="text-sm font-bold text-ecoar-teal dark:text-ecoar-teal-400">{value}{unit}</span>
    </Card>
  )
}

