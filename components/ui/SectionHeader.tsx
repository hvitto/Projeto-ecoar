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
    <div className={`section-header ${className}`}>
      {Icon && <Icon className="section-header-icon" />}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-ecoar-dark-900 dark:text-ecoar-light-900">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-ecoar-dark-600 dark:text-ecoar-light-900/70 mt-1">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

