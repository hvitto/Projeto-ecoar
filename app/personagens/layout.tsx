'use client'

import { ReactNode } from 'react'
import PersonagensAuthGuard from '@/features/character/PersonagensAuthGuard'

export default function PersonagensLayout({ children }: { children: ReactNode }) {
  return <PersonagensAuthGuard>{children}</PersonagensAuthGuard>
}
