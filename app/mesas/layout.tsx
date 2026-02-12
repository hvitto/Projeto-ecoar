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
      <div className="min-h-screen flex items-center justify-center bg-ecoar-light dark:bg-ecoar-dark-900">
        <div className="text-slate-600 dark:text-ecoar-light-900/60">Carregando...</div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return null
  }
  return <>{children}</>
}
