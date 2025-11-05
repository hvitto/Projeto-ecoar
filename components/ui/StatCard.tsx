'use client'

import { ReactNode } from 'react'
import Card from './Card'

interface StatCardProps {
  label: string
  value: string | number
  modifier?: string | number
  className?: string
  children?: ReactNode
}

export default function StatCard({
  label,
  value,
  modifier,
  className = '',
  children,
}: StatCardProps) {
  return (
    <Card variant="stat" className={className}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {modifier && (
        <div className="stat-modifier">
          {typeof modifier === 'number' && modifier >= 0 ? '+' : ''}{modifier}
        </div>
      )}
      {children}
    </Card>
  )
}

