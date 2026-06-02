'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'

interface PersonagensAuthGuardProps {
  children: ReactNode
}

export default function PersonagensAuthGuard({ children }: PersonagensAuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
