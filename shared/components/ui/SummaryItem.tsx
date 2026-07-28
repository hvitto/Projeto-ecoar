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
    <div className={`flex items-center justify-between p-1.5 rounded-none bg-transparent border border-ecoar-teal/30 dark:border-ecoar-teal/25 text-[11px] ${className}`}>
      <span className="text-ecoar-dark-500 dark:text-[#adb5bd] uppercase tracking-[0.08em]">{label}</span>
      {value ? (
        <span className="text-ecoar-dark-900 dark:text-ecoar-light-900 font-semibold">{value}</span>
      ) : null}
    </div>
  )
}
