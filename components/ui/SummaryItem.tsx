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
    <div className={`flex items-center justify-between p-1.5 bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] rounded border border-white/[0.08] dark:border-ecoar-light-900/[0.08] text-[11px] ${className}`}>
      <span className="text-white/50 dark:text-ecoar-light-900/50">{label}</span>
      {value ? (
        <span className="text-white/80 dark:text-ecoar-light-900/80 font-medium">{value}</span>
      ) : null}
    </div>
  )
}

