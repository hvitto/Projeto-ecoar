'use client'

import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { config } from '@/lib/config'
import { AppProvider } from '@/contexts/AppContext'
import CharacterSheet from '@/components/CharacterSheet'
import CharacterCreationWizard from '@/components/CharacterCreationWizard'
import CharacterEvolutionScreen from '@/components/CharacterEvolutionScreen'
import CharacterDashboard from '@/components/CharacterDashboard'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { getCharacter, saveCharacter } from '@/lib/storage/characterStorage'
import { CharacterWithMetadata } from '@/types/auth'
import { pageTransition } from '@/lib/motionVariants'

type ViewMode = 'auth' | 'login' | 'register' | 'dashboard' | 'wizard' | 'sheet' | 'evolution'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

function AppContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('auth')
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterWithMetadata | null>(null)
  const [wizardKey, setWizardKey] = useState(0)
  const [loginMessage, setLoginMessage] = useState<string | null>(null)
  const hasInitialized = useRef(false)

  const requestedView = useMemo(() => searchParams.get('view'), [searchParams])
  const requestedCharacterId = useMemo(() => searchParams.get('characterId'), [searchParams])

  const updateUrlState = useCallback((
    nextView: 'login' | 'register' | 'dashboard' | 'wizard' | 'sheet' | 'evolution',
    nextCharacterId?: string | null,
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', nextView)
    if (nextCharacterId) {
      params.set('characterId', nextCharacterId)
    } else {
      params.delete('characterId')
    }
    router.replace(`/?${params.toString()}`)
  }, [router, searchParams])

  useEffect(() => {
    const token = searchParams.get('token')
    if (token && typeof window !== 'undefined') {
      const session = { token, user: null, expiresAt: Date.now() + SESSION_DURATION }
      localStorage.setItem(config.STORAGE_KEYS.AUTH, JSON.stringify(session))
      window.history.replaceState({}, '', window.location.pathname)
      refreshUser().then(() => {})
    }
  }, [searchParams, refreshUser])

  useEffect(() => {
    const verified = searchParams.get('verified')
    const error = searchParams.get('error')
    if (verified === '1') {
      setLoginMessage('Email confirmado. Faça login.')
      setViewMode('login')
    }
    if (error === 'invalid_token') setLoginMessage('Link de verificação inválido ou expirado.')
    if (error === 'missing_token') setLoginMessage('Link inválido.')
    if (error === 'email_already_used') setLoginMessage('Este email já está cadastrado com senha. Use o login por email.')
    if (error === 'google_not_configured' || error === 'token_exchange_failed' || error === 'userinfo_failed') setLoginMessage('Erro ao entrar com Google. Tente novamente.')
    if (error === 'no_email') setLoginMessage('Não foi possível obter seu email do Google.')
  }, [searchParams])

  // Ajustar viewMode inicial baseado na autenticação e na URL
  useEffect(() => {
    if (isLoading) return

    if (!hasInitialized.current) {
      if (isAuthenticated) {
        if (requestedView === 'wizard' || requestedView === 'sheet' || requestedView === 'evolution') {
          setViewMode(requestedView)
        } else {
          setViewMode('dashboard')
          updateUrlState('dashboard')
        }
      } else {
        if (requestedView === 'register') {
          setViewMode('register')
        } else {
          setViewMode('login')
          updateUrlState('login')
        }
      }
      hasInitialized.current = true
      return
    }

    if (!isAuthenticated) {
      if (requestedView === 'register') {
        setViewMode('register')
      } else {
        setViewMode('login')
      }
      return
    }

    if (requestedView === 'wizard' || requestedView === 'sheet' || requestedView === 'evolution' || requestedView === 'dashboard') {
      setViewMode(requestedView)
    } else if (viewMode !== 'dashboard') {
      setViewMode('dashboard')
      updateUrlState('dashboard')
    }
  }, [isAuthenticated, isLoading, requestedView, viewMode, updateUrlState])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    if ((viewMode !== 'sheet' && viewMode !== 'evolution' && viewMode !== 'wizard') || !requestedCharacterId) return
    getCharacter(user.id, requestedCharacterId)
      .then((character) => {
        if (!character) {
          setSelectedCharacter(null)
          updateUrlState('dashboard')
          return
        }
        setSelectedCharacter(character)
      })
      .catch(() => {
        setSelectedCharacter(null)
        updateUrlState('dashboard')
      })
  }, [isAuthenticated, user, viewMode, requestedCharacterId, updateUrlState])

  const handleLoginSuccess = () => {
    setViewMode('dashboard')
    updateUrlState('dashboard')
  }

  const handleRegisterSuccess = () => {
    setViewMode('dashboard')
    updateUrlState('dashboard')
  }

  const handleNewCharacter = () => {
    setSelectedCharacter(null)
    setWizardKey(prev => prev + 1)
    setViewMode('wizard')
    updateUrlState('wizard')
  }

  const handleWizardComplete = async (data: any) => {
    if (!user || !data || !data.nome) {
      console.error('Invalid character data or user')
      return
    }

    try {
      const characterWithMetadata = await saveCharacter(user.id, data)
      setSelectedCharacter(characterWithMetadata)
      setViewMode('sheet')
      updateUrlState('sheet', characterWithMetadata.id)
    } catch (error) {
      console.error('Error saving character:', error)
      alert('Erro ao salvar ficha. Tente novamente.')
    }
  }

  const handleViewCharacter = (character: CharacterWithMetadata) => {
    setSelectedCharacter(character)
    setViewMode('sheet')
    updateUrlState('sheet', character.id)
  }

  const handleEditCharacter = (character: CharacterWithMetadata) => {
    setSelectedCharacter(character)
    setWizardKey(prev => prev + 1)
    setViewMode('wizard')
    updateUrlState('wizard', character.id)
  }

  const handleGoToDashboard = () => {
    setSelectedCharacter(null)
    setViewMode('dashboard')
    updateUrlState('dashboard')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-ecoar-dark-600 dark:text-ecoar-light-900/60">Carregando...</div>
      </div>
    )
  }

  // Auth screens – fundo vem do layout raiz; preenche altura sem scroll
  const authLayout = (
    <div className="flex-1 flex flex-col min-h-0 items-center justify-center px-3 py-4 sm:p-4 md:p-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-md">
        {viewMode === 'register' ? (
          <RegisterForm
            onSwitchToLogin={() => {
              setViewMode('login')
              updateUrlState('login')
            }}
            onSuccess={handleRegisterSuccess}
          />
        ) : (
          <LoginForm
            onSwitchToRegister={() => {
              setViewMode('register')
              updateUrlState('register')
            }}
            onSuccess={handleLoginSuccess}
            initialMessage={loginMessage}
            onMessageShown={() => setLoginMessage(null)}
          />
        )}
      </div>
    </div>
  )

  if (!isAuthenticated) {
    return authLayout
  }

  return (
    <AppProvider onNewCharacter={handleNewCharacter}>
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {viewMode === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 min-h-0 flex flex-col"
            >
              <CharacterDashboard
              onNewCharacter={handleNewCharacter}
              onViewCharacter={handleViewCharacter}
              onEditCharacter={handleEditCharacter}
            />
          </motion.div>
        )}

          {viewMode === 'wizard' && (
            <motion.div
              key="wizard"
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 min-h-0 flex flex-col"
            >
              <CharacterCreationWizard
              key={wizardKey}
              onComplete={handleWizardComplete}
              initialData={selectedCharacter?.data as Parameters<typeof CharacterCreationWizard>[0]['initialData']}
            />
          </motion.div>
        )}

          {viewMode === 'sheet' && selectedCharacter && (
            <motion.div
              key="sheet"
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 min-h-0 flex flex-col"
            >
              <CharacterSheet
              initialData={selectedCharacter.data}
                canEdit={true}
                onOpenEvolution={() => {
                  setViewMode('evolution')
                  updateUrlState('evolution', selectedCharacter.id)
                }}
                onCharacterSaved={(saved) => {
                  setSelectedCharacter(saved)
                  updateUrlState('sheet', saved.id)
                }}
              onBackToDashboard={handleGoToDashboard}
            />
          </motion.div>
          )}

          {viewMode === 'evolution' && selectedCharacter && (
            <motion.div
              key="evolution"
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 min-h-0 flex flex-col"
            >
              <CharacterEvolutionScreen
                initialCharacterData={selectedCharacter.data}
                onCancel={() => {
                  setViewMode('sheet')
                  updateUrlState('sheet', selectedCharacter.id)
                }}
                onSaved={(saved) => {
                  setSelectedCharacter(saved)
                  setViewMode('sheet')
                  updateUrlState('sheet', saved.id)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppProvider>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-0">Carregando...</div>}>
      <AppContent />
    </Suspense>
  )
}
