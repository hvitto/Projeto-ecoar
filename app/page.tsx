'use client'

import { useEffect, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import DemoOnlyLogin from '@/components/auth/DemoOnlyLogin'
import LegacyViewRedirect from '@/features/character/LegacyViewRedirect'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const hasInitialized = useRef(false)

  const requestedView = searchParams.get('view')

  useEffect(() => {
    if (isLoading) return

    if (!hasInitialized.current) {
      if (isAuthenticated) {
        const legacyViews = ['wizard', 'sheet', 'evolution', 'dashboard']
        if (!legacyViews.includes(requestedView ?? '')) {
          router.replace('/personagens')
        }
      }
      hasInitialized.current = true
      return
    }

    if (isAuthenticated && !['wizard', 'sheet', 'evolution', 'dashboard'].includes(requestedView ?? '')) {
      router.replace('/personagens')
    }
  }, [isAuthenticated, isLoading, requestedView, router])

  const handleDemoSuccess = useCallback(() => {
    router.push('/personagens')
  }, [router])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    const legacyViews = ['wizard', 'sheet', 'evolution', 'dashboard']
    if (legacyViews.includes(requestedView ?? '')) {
      return (
        <>
          <LegacyViewRedirect />
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Redirecionando...</div>
          </div>
        </>
      )
    }
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Redirecionando...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 items-center justify-center px-3 py-4 sm:p-4 md:p-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-md">
        <DemoOnlyLogin onSuccess={handleDemoSuccess} />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-0">Carregando...</div>}>
      <HomeContent />
    </Suspense>
  )
}
