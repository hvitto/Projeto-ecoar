import type { Metadata } from 'next'
import MesasLayoutClient from '@/app/mesas/MesasLayoutClient'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function MesasLayout({ children }: { children: React.ReactNode }) {
  return <MesasLayoutClient>{children}</MesasLayoutClient>
}
