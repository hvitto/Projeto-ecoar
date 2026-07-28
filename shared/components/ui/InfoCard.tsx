'use client'

import { ReactNode } from 'react'
import Card from './Card'
import { displayTitle } from '@/shared/styles/ecoarChrome'

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
        <h3 className={`${displayTitle} text-sm mb-2`}>
          {title}
        </h3>
      )}
      {children}
    </Card>
  )
}
