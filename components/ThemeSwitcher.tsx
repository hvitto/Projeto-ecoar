'use client'

import { useTheme } from '@/shared/contexts/ThemeContext'
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
        type="button"
        className="min-w-9 h-9 px-2 border border-ecoar-teal/50 dark:border-ecoar-teal text-[0.6875rem] uppercase tracking-[0.14em] text-ecoar-teal"
        aria-label="Carregando tema"
        disabled
      >
        ···
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      data-theme-toggle
      className="min-w-9 h-9 px-2 flex items-center justify-center border border-ecoar-teal/50 dark:border-ecoar-teal text-[0.6875rem] uppercase tracking-[0.14em] text-ecoar-dark-700 dark:text-ecoar-light-900 hover:bg-ecoar-magenta/15 hover:border-ecoar-magenta transition-colors duration-fast"
      aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
      title={`Tema ${theme === 'light' ? 'claro' : 'escuro'}`}
    >
      {theme === 'light' ? 'DIA' : 'NOITE'}
    </button>
  )
}
