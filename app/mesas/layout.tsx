'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function MesasLayout({ children }: { children: React.ReactNode }) {
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
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="text-slate-600 dark:text-ecoar-light-900/60">Carregando...</div>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return null
  }
  return <div className="h-full min-h-0 flex flex-col">{children}</div>
}
