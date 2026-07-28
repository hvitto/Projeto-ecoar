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
      <div
        className="flex flex-1 min-h-0 items-center justify-center border-t border-ecoar-teal/30 bg-[#1a1d21]"
        role="status"
        aria-live="polite"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ecoar-teal">
          Carregando sessão…
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-1 min-h-0 items-center justify-center border-t border-ecoar-teal/30 bg-[#1a1d21]"
        role="status"
        aria-live="polite"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ecoar-teal">
          Redirecionando para entrar…
        </p>
      </div>
    )
  }

  return <>{children}</>
}
