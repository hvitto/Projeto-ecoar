'use client'

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { displayTitle } from '@/shared/styles/ecoarChrome'

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
    <div className={`flex items-center gap-2 mb-4 pb-2 border-b border-ecoar-teal/35 dark:border-ecoar-teal/30 ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-ecoar-teal" />}
      <div className="flex-1">
        <h3 className={`${displayTitle} text-base`}>
          {title}
        </h3>
        {description && (
          <p className="text-xs text-ecoar-dark-500 dark:text-[#adb5bd] mt-0.5">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
