'use client'

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface SectionHeaderProps {
  icon?: LucideIcon
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export default function SectionHeader({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-2 mb-4 pb-2 border-b border-white/[0.06] dark:border-ecoar-light-900/[0.06] ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />}
      <div className="flex-1">
        <h3 className="text-base font-semibold text-white/90 dark:text-ecoar-light-900/90">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-white/50 dark:text-ecoar-light-900/50 mt-0.5">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

