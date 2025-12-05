'use client'

import { LucideIcon } from 'lucide-react'
import Card from './Card'

interface SenseCardProps {
  icon: LucideIcon
  name: string
  value: number
  unit?: string
  className?: string
}

export default function SenseCard({
  icon: Icon,
  name,
  value,
  unit = 'm',
  className = '',
}: SenseCardProps) {
  return (
    <Card variant="default" className={`flex items-center justify-between p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-teal-600 dark:text-ecoar-teal-400/80" />
        <span className="text-xs font-medium text-slate-900 dark:text-ecoar-light-900/90">{name}</span>
      </div>
      <span className="text-xs font-semibold text-teal-600 dark:text-ecoar-teal-400/90">{value}{unit}</span>
    </Card>
  )
}

