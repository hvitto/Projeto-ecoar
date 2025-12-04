'use client'

import { motion } from 'framer-motion'
import { Crown, UserPlus } from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { useApp } from '@/contexts/AppContext'

interface HeaderProps {
  onNewCharacter?: () => void
}

export default function Header({ onNewCharacter }: HeaderProps) {
  const appContext = useApp()
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

  return (
    <header className="bg-ecoar-dark/70 dark:bg-ecoar-dark-800/70 backdrop-blur-xl border-b border-white/[0.06] dark:border-ecoar-light-900/[0.06] sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <motion.button
            onClick={handleNewCharacter}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 rounded-lg flex items-center justify-center border border-ecoar-teal/20 dark:border-ecoar-teal-500/20">
              <Crown className="w-4 h-4 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white/90 dark:text-ecoar-light-900/90">ECOAR</h1>
              <p className="text-[10px] text-white/50 dark:text-ecoar-light-900/50">Beyond</p>
            </div>
          </motion.button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2.5">
            <ThemeSwitcher />
            <button
              onClick={handleNewCharacter}
              className="px-3 py-1.5 bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 hover:bg-ecoar-teal/20 dark:hover:bg-ecoar-teal-600/20 text-white/90 dark:text-ecoar-light-900/90 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Novo Personagem
            </button>
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2.5">
            <ThemeSwitcher />
            <button 
              onClick={handleNewCharacter}
              className="w-9 h-9 flex items-center justify-center text-white/60 dark:text-ecoar-light-900/60 hover:text-white/80 dark:hover:text-ecoar-light-900/80 transition-colors"
              aria-label="Novo personagem"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

