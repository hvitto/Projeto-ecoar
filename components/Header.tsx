'use client'

import { motion } from 'framer-motion'
import { Crown, UserPlus, User, LogOut, Home } from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'

interface HeaderProps {
  onNewCharacter?: () => void
  onGoToDashboard?: () => void
}

export default function Header({ onNewCharacter, onGoToDashboard }: HeaderProps) {
  const appContext = useApp()
  const { user, logout } = useAuth()
  const handleNewCharacterFn = onNewCharacter || appContext.onNewCharacter

  const handleNewCharacter = () => {
    if (handleNewCharacterFn) {
      handleNewCharacterFn()
    } else {
      // Fallback: clear localStorage and reload
      try {
        localStorage.removeItem('ecoar-character')
        window.location.href = '/'
      } catch (e) {
        console.error('Error clearing localStorage:', e)
        window.location.href = '/'
      }
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="bg-white/80 dark:bg-ecoar-dark-800/70 backdrop-blur-xl border-b border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06] sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <motion.button
            onClick={onGoToDashboard || handleNewCharacter}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
              <Crown className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900/90">ECOAR</h1>
              <p className="text-[10px] text-ecoar-dark-600 dark:text-ecoar-light-900/50">Beyond</p>
            </div>
          </motion.button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2.5">
            {user && onGoToDashboard && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={Home}
                onClick={onGoToDashboard}
              >
                Dashboard
              </Button>
            )}
            <ThemeSwitcher />
            <button
              onClick={handleNewCharacter}
              className="px-3 py-1.5 bg-ecoar-teal-100/80 dark:bg-ecoar-teal-600/15 hover:bg-ecoar-teal-200/80 dark:hover:bg-ecoar-teal-600/20 text-ecoar-teal-700 dark:text-ecoar-light-900/90 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-ecoar-teal-300/50 dark:border-ecoar-teal-500/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Novo Personagem
            </button>
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06]">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08]">
                  <User className="w-4 h-4 text-ecoar-teal-600 dark:text-ecoar-teal-400/80" />
                  <span className="text-xs text-ecoar-dark-700 dark:text-ecoar-light-900/70 max-w-[150px] truncate">
                    {user.username || user.email.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 hover:bg-ecoar-light-800 dark:hover:bg-ecoar-light-900/[0.03] text-ecoar-dark-600 dark:text-ecoar-light-900/60 hover:text-ecoar-dark-800 dark:hover:text-ecoar-light-900/80 rounded-lg transition-all duration-200"
                  aria-label="Sair"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2.5">
            {user && onGoToDashboard && (
              <button
                onClick={onGoToDashboard}
                className="w-9 h-9 flex items-center justify-center text-ecoar-dark-600 dark:text-ecoar-light-900/60 hover:text-ecoar-dark-800 dark:hover:text-ecoar-light-900/80 transition-colors"
                aria-label="Dashboard"
              >
                <Home className="w-5 h-5" />
              </button>
            )}
            <ThemeSwitcher />
            <button 
              onClick={handleNewCharacter}
              className="w-9 h-9 flex items-center justify-center text-ecoar-dark-600 dark:text-ecoar-light-900/60 hover:text-ecoar-dark-800 dark:hover:text-ecoar-light-900/80 transition-colors"
              aria-label="Novo personagem"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center text-ecoar-dark-600 dark:text-ecoar-light-900/60 hover:text-ecoar-dark-800 dark:hover:text-ecoar-light-900/80 transition-colors"
                aria-label="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

