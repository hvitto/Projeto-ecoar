'use client'

import { ReactNode } from 'react'
import Card from './Card'

interface InfoCardProps {
  title?: string
  children: ReactNode
  className?: string
}

export default function InfoCard({
  title,
  children,
  className = '',
}: InfoCardProps) {
  return (
    <Card variant="info" className={className}>
      {title && (
        <h3 className="text-lg font-bold text-ecoar-dark-900 dark:text-ecoar-light-900 mb-3">
          {title}
        </h3>
      )}
      {children}
    </Card>
  )
}

