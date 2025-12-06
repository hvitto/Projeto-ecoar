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
    <div className={`flex items-center justify-between p-1.5 bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] rounded border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] text-[11px] ${className}`}>
      <span className="text-ecoar-dark-500 dark:text-ecoar-light-900/50">{label}</span>
      {value ? (
        <span className="text-ecoar-dark-700 dark:text-ecoar-light-900/80 font-medium">{value}</span>
      ) : null}
    </div>
  )
}

