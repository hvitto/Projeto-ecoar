'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { config } from '@/lib/config'
import { AppProvider } from '@/contexts/AppContext'
import CharacterSheet from '@/components/CharacterSheet'
import CharacterCreationWizard from '@/components/CharacterCreationWizard'
import CharacterDashboard from '@/components/CharacterDashboard'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import LoginBackground from '@/components/LoginBackground'
import { saveCharacter } from '@/lib/storage/characterStorage'
import { CharacterWithMetadata } from '@/types/auth'
import { pageTransition } from '@/lib/motionVariants'

type ViewMode = 'auth' | 'login' | 'register' | 'dashboard' | 'wizard' | 'sheet'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

function AppContent() {
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('auth')
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterWithMetadata | null>(null)
  const [wizardKey, setWizardKey] = useState(0)
  const [loginMessage, setLoginMessage] = useState<string | null>(null)
  const hasInitialized = useRef(false)

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

  // Ajustar viewMode inicial baseado na autenticação
  useEffect(() => {
    if (isLoading) return

    if (!hasInitialized.current) {
      if (isAuthenticated) {
        setViewMode('dashboard')
      } else {
        setViewMode('login')
      }
      hasInitialized.current = true
      return
    }

    if (isAuthenticated && (viewMode === 'login' || viewMode === 'register' || viewMode === 'auth')) {
      setViewMode('dashboard')
    }
  }, [isAuthenticated, isLoading, viewMode])

  const handleLoginSuccess = () => {
    setViewMode('dashboard')
  }

  const handleRegisterSuccess = () => {
    setViewMode('dashboard')
  }

  const handleNewCharacter = () => {
    setSelectedCharacter(null)
    setWizardKey(prev => prev + 1)
    setViewMode('wizard')
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
    } catch (error) {
      console.error('Error saving character:', error)
      alert('Erro ao salvar ficha. Tente novamente.')
    }
  }

  const handleViewCharacter = (character: CharacterWithMetadata) => {
    setSelectedCharacter(character)
    setViewMode('sheet')
  }

  const handleEditCharacter = (character: CharacterWithMetadata) => {
    setSelectedCharacter(character)
    setWizardKey(prev => prev + 1)
    setViewMode('wizard')
  }

  const handleGoToDashboard = () => {
    setSelectedCharacter(null)
    setViewMode('dashboard')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ecoar-light dark:bg-ecoar-dark-900">
        <div className="text-white/60 dark:text-ecoar-light-900/60">Carregando...</div>
      </div>
    )
  }

  // Auth screens - fundo estilo Sean Halpin (gradiente + formas) + formulário centralizado
  const authLayout = (
    <div className="min-h-screen relative">
      <LoginBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          {viewMode === 'register' ? (
            <RegisterForm
              onSwitchToLogin={() => setViewMode('login')}
              onSuccess={handleRegisterSuccess}
            />
          ) : (
            <LoginForm
              onSwitchToRegister={() => setViewMode('register')}
              onSuccess={handleLoginSuccess}
              initialMessage={loginMessage}
              onMessageShown={() => setLoginMessage(null)}
            />
          )}
        </div>
      </div>
    </div>
  )

  if (!isAuthenticated) {
    return authLayout
  }

  return (
    <AppProvider onNewCharacter={handleNewCharacter}>
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' && (
          <motion.div
            key="dashboard"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-full"
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
            className="min-h-full"
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
            className="min-h-full bg-ecoar-light dark:bg-ecoar-dark-900"
          >
            <CharacterSheet
              initialData={selectedCharacter.data}
              onEdit={() => handleEditCharacter(selectedCharacter)}
              onBackToDashboard={handleGoToDashboard}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AppProvider>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-ecoar-light dark:bg-ecoar-dark-900">Carregando...</div>}>
      <AppContent />
    </Suspense>
  )
}
