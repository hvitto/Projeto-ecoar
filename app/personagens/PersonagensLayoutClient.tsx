'use client'

import { ReactNode } from 'react'
import PersonagensAuthGuard from '@/features/character/PersonagensAuthGuard'
import PersonagensProviders from '@/app/personagens/PersonagensProviders'

export default function PersonagensLayoutClient({ children }: { children: ReactNode }) {
  return (
    <PersonagensAuthGuard>
      <PersonagensProviders>{children}</PersonagensProviders>
    </PersonagensAuthGuard>
  )
}
