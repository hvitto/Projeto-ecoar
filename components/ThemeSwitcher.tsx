'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    toggleTheme(origin)
  }

  if (!mounted) {
    return (
      <button
        className="relative w-12 h-6 rounded-full bg-ecoar-dark-600 transition-colors duration-300"
        aria-label="Carregando tema"
        disabled
      />
    )
  }

  return (
    <button
      onClick={handleToggle}
      data-theme-toggle
      className="relative w-12 h-6 rounded-full bg-ecoar-dark-600 dark:bg-ecoar-dark-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ecoar-teal-500 dark:focus:ring-ecoar-teal-400 focus:ring-offset-2 dark:focus:ring-offset-ecoar-dark-800 overflow-hidden"
      aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
      title={`Tema ${theme === 'light' ? 'claro' : 'escuro'}`}
    >
      {/* Background gradient para tema escuro */}
      {theme === 'dark' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-ecoar-teal-600 to-ecoar-magenta-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: 0 }}
        />
      )}
      
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-ecoar-light-900 flex items-center justify-center shadow-lg transition-colors"
        animate={{
          x: theme === 'dark' ? 24 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        style={{ zIndex: 10 }}
      >
        {theme === 'light' ? (
          <Sun className="w-3 h-3 text-ecoar-amber-500" />
        ) : (
          <Moon className="w-3 h-3 text-ecoar-dark-900" />
        )}
      </motion.div>
    </button>
  )
}

