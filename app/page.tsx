'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
import CharacterSheet from '@/components/CharacterSheet'
import CharacterCreationWizard from '@/components/CharacterCreationWizard'
import CharacterDashboard from '@/components/CharacterDashboard'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { saveCharacter } from '@/lib/storage/characterStorage'
import { CharacterWithMetadata } from '@/types/auth'

type ViewMode = 'auth' | 'login' | 'register' | 'dashboard' | 'wizard' | 'sheet'

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('auth')
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterWithMetadata | null>(null)
  const [wizardKey, setWizardKey] = useState(0)
  const hasInitialized = useRef(false)

  // Ajustar viewMode inicial baseado na autenticação
  useEffect(() => {
    if (isLoading) return

    // Inicialização: definir modo inicial apenas uma vez
    if (!hasInitialized.current) {
      if (isAuthenticated) {
        setViewMode('dashboard')
      } else {
        setViewMode('login')
      }
      hasInitialized.current = true
      return
    }

    // Após inicialização: apenas redirecionar para dashboard quando autenticado
    // Mas não sobrescrever se usuário está navegando entre login/register
    if (isAuthenticated && (viewMode === 'login' || viewMode === 'register' || viewMode === 'auth')) {
      setViewMode('dashboard')
    }
  }, [isAuthenticated, isLoading]) // Removido viewMode das dependências para evitar loops

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
      // Salvar ficha vinculada ao usuário
      const characterWithMetadata = saveCharacter(user.id, data)
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

  // Auth screens - verificar antes de qualquer outra coisa
  if (!isAuthenticated) {
    if (viewMode === 'login') {
      return (
        <LoginForm
          onSwitchToRegister={() => setViewMode('register')}
          onSuccess={handleLoginSuccess}
        />
      )
    }

    if (viewMode === 'register') {
      return (
        <RegisterForm
          onSwitchToLogin={() => setViewMode('login')}
          onSuccess={handleRegisterSuccess}
        />
      )
    }

    // Fallback: se viewMode não está definido, mostrar login
    return (
      <LoginForm
        onSwitchToRegister={() => setViewMode('register')}
        onSuccess={handleLoginSuccess}
      />
    )
  }

  return (
    <AppProvider onNewCharacter={handleNewCharacter}>
      {viewMode === 'dashboard' && (
        <CharacterDashboard
          onNewCharacter={handleNewCharacter}
          onViewCharacter={handleViewCharacter}
          onEditCharacter={handleEditCharacter}
        />
      )}

      {viewMode === 'wizard' && (
        <CharacterCreationWizard
          key={wizardKey}
          onComplete={handleWizardComplete}
        />
      )}

      {viewMode === 'sheet' && selectedCharacter && (
        <div className="min-h-full bg-ecoar-light dark:bg-ecoar-dark-900">
          <CharacterSheet
            initialData={selectedCharacter.data}
            onEdit={() => handleEditCharacter(selectedCharacter)}
            onBackToDashboard={handleGoToDashboard}
          />
        </div>
      )}
    </AppProvider>
  )
}

export default function Home() {
  return <AppContent />
}
