'use client'

import { ReactNode } from 'react'

interface SummaryItemProps {
  label: string | ReactNode
  value: string | ReactNode
  className?: string
}

export default function SummaryItem({
  label,
  value,
  className = '',
}: SummaryItemProps) {
  return (
    <div className={`flex items-center justify-between p-1.5 bg-white/5 dark:bg-ecoar-light-900/10 rounded border border-white/10 dark:border-ecoar-light-900/20 text-xs ${className}`}>
      <span className="text-white/60 dark:text-ecoar-light-900/60">{label}</span>
      {value ? (
        <span className="text-white dark:text-ecoar-light-900 font-medium">{value}</span>
      ) : null}
    </div>
  )
}

