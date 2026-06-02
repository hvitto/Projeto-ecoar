'use client'

// Só guard de auth. Sem lógica de ficha.
import { ReactNode } from 'react'
import PersonagensAuthGuard from '@/features/character/PersonagensAuthGuard'
import PersonagensProviders from '@/app/personagens/PersonagensProviders'

export default function PersonagensLayout({ children }: { children: ReactNode }) {
  return (
    <PersonagensAuthGuard>
      <PersonagensProviders>{children}</PersonagensProviders>
    </PersonagensAuthGuard>
  )
}
