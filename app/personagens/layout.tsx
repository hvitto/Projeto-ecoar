import type { Metadata } from 'next'
import { ReactNode } from 'react'
import PersonagensLayoutClient from '@/app/personagens/PersonagensLayoutClient'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function PersonagensLayout({ children }: { children: ReactNode }) {
  return <PersonagensLayoutClient>{children}</PersonagensLayoutClient>
}
