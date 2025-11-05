'use client'

import { motion } from 'framer-motion'
import { Crown, UserPlus } from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'

interface HeaderProps {
  onNewCharacter?: () => void
}

export default function Header({ onNewCharacter }: HeaderProps) {
  const handleNewCharacter = () => {
    if (onNewCharacter) {
      onNewCharacter()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <header className="bg-ecoar-dark/80 dark:bg-ecoar-dark-800/90 backdrop-blur-xl border-b border-ecoar-dark/50 dark:border-ecoar-light-900/20 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <motion.button
            onClick={handleNewCharacter}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-10 h-10 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 rounded-xl flex items-center justify-center border border-ecoar-teal/30 dark:border-ecoar-teal-500/40">
              <Crown className="w-5 h-5 text-ecoar-teal dark:text-ecoar-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white dark:text-ecoar-light-900">ECOAR</h1>
              <p className="text-xs text-white/60 dark:text-ecoar-light-900/70">Beyond</p>
            </div>
          </motion.button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            <ThemeSwitcher />
            <button
              onClick={handleNewCharacter}
              className="px-4 py-2 bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 hover:bg-ecoar-teal/30 dark:hover:bg-ecoar-teal-600/30 text-white dark:text-ecoar-light-900 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-ecoar-teal/30 dark:border-ecoar-teal-500/40"
            >
              <UserPlus className="w-4 h-4" />
              Novo Personagem
            </button>
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeSwitcher />
            <button 
              onClick={handleNewCharacter}
              className="w-10 h-10 flex items-center justify-center text-white/70 dark:text-ecoar-light-900/70 hover:text-white dark:hover:text-ecoar-light-900 transition-colors"
              aria-label="Novo personagem"
            >
              <UserPlus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

