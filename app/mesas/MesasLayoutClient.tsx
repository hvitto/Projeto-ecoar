'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import Header from '@/components/Header'

export default function MesasLayoutClient({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center min-h-0">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ecoar-teal">SYS · LOADING</p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return null
  }
  return (
    <div className="h-full min-h-0 flex flex-col">
      <Header />
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
