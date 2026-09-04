'use client'

import { useEffect, useRef, Suspense, useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import LegacyViewRedirect from '@/features/character/LegacyViewRedirect'
import HeroFrame from '@/components/branding/HeroFrame'
import RulerTicks from '@/components/branding/RulerTicks'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import StampButton from '@/components/beyond/StampButton'

type AuthView = 'login' | 'register'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const hasInitialized = useRef(false)
  const [authView, setAuthView] = useState<AuthView>('login')
  const authRef = useRef<HTMLDivElement>(null)

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

  const handleAuthSuccess = useCallback(() => {
    router.push('/personagens')
  }, [router])

  const openAuth = useCallback((view: AuthView) => {
    setAuthView(view)
    requestAnimationFrame(() => {
      authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }, [])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ecoar-teal">MESA · PREPARANDO</p>
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
            <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ecoar-teal">MESA · SEGUINDO</p>
          </div>
        </>
      )
    }
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ecoar-teal">MESA · SEGUINDO</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-stretch border-b border-ecoar-teal/50 dark:border-ecoar-teal shrink-0">
        <div className="flex-1 px-4 sm:px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.14em] text-ecoar-teal-700 dark:text-ecoar-teal border-r border-ecoar-teal/50 dark:border-ecoar-teal">
          EB · MESA
        </div>
        <div className="px-2.5 sm:px-3 flex items-center border-r border-ecoar-teal/50 dark:border-ecoar-teal">
          <ThemeSwitcher />
        </div>
        <StampButton
          onClick={() => openAuth('login')}
          aria-label="Entrar na conta existente"
          className="self-stretch h-auto rounded-none px-4 sm:px-5 py-2.5 text-[0.6875rem]"
        >
          Entrar
        </StampButton>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.80fr)] overflow-y-auto lg:overflow-hidden">
        <aside className="order-2 lg:order-1 relative min-h-0 border-t lg:border-t-0 lg:border-r border-ecoar-teal/50 dark:border-ecoar-teal lg:h-full lg:overflow-hidden">
          <HeroFrame
            variant="trade"
            aspect="fill"
            priority
            objectPosition="center top"
            label="ECOAR · 03.1 · TRÍADE"
            className="border-0 w-full h-[min(34vh,280px)] lg:absolute lg:inset-0 lg:h-full"
          />
        </aside>

        <div className="order-1 lg:order-2 flex flex-col min-h-0 bg-white dark:bg-[#1a1d21] lg:h-full lg:overflow-y-auto">
          <div className="shrink-0 px-5 sm:px-7 lg:px-8 pt-5 pb-4 border-b border-ecoar-teal/40 dark:border-ecoar-teal/50">
            <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ecoar-teal-700 dark:text-ecoar-teal mb-2">
              Companion · ECOAR TTRPG
            </p>
            <h1 className="font-display text-[1.75rem] xl:text-[2rem] uppercase leading-[0.9] tracking-[-0.03em] text-ecoar-dark-900 dark:text-ecoar-light-900 max-w-[12ch] mb-2">
              ECOAR +
            </h1>
            <p className="font-display text-[0.95rem] uppercase tracking-[-0.02em] leading-[1.1] text-ecoar-teal-800 dark:text-ecoar-teal max-w-[22ch] mb-3">
              Criar ficha sem atrito
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <p className="text-xs leading-relaxed max-w-[40ch] text-ecoar-dark-600 dark:text-[#c5c8ce]">
                Companion digital do RPG ECOAR. Crie, gerencie e use fichas com fluidez — divertido para quem joga, óbvio para quem mestra.
              </p>
              <StampButton
                onClick={() => openAuth('register')}
                aria-label="Criar conta nova"
                className="shrink-0 px-4 py-2.5 text-[0.6875rem] min-h-[40px]"
              >
                Criar conta
              </StampButton>
            </div>
          </div>

          <div ref={authRef} className="flex-1 px-5 sm:px-7 lg:px-8 py-4 sm:py-5 w-full">
            {authView === 'login' ? (
              <LoginForm
                onSwitchToRegister={() => setAuthView('register')}
                onSuccess={handleAuthSuccess}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={() => setAuthView('login')}
                onSuccess={handleAuthSuccess}
              />
            )}
            <RulerTicks className="hidden sm:flex mt-5" />
          </div>
        </div>
      </div>

      <footer className="shrink-0 grid grid-cols-1 sm:grid-cols-3 border-t border-ecoar-teal/50 dark:border-ecoar-teal text-[0.6875rem] uppercase tracking-[0.12em] text-ecoar-dark-600 dark:text-[#c5c8ce]">
        <div className="px-4 py-2 border-b sm:border-b-0 sm:border-r border-ecoar-teal/40 dark:border-ecoar-teal/50">
          Mesa digital · fichas ECOAR
        </div>
        <div className="px-4 py-2 border-b sm:border-b-0 sm:border-r border-ecoar-teal/40 dark:border-ecoar-teal/50">
          Criar · gerenciar · jogar
        </div>
        <div className="px-4 py-2">
          Para jogadores e mestres
        </div>
      </footer>
    </div>
  )
}

export default function HomePageClient() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-0">
          <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ecoar-teal">MESA · PREPARANDO</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
