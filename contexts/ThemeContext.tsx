'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: (origin?: { x: number; y: number }) => void
  setTheme: (theme: Theme) => void
  transitionOrigin: { x: number; y: number } | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const [transitionOrigin, setTransitionOrigin] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setMounted(true)
    // Verificar preferência salva ou do sistema
    const savedTheme = localStorage.getItem('ecoar-theme') as Theme | null
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setThemeState(savedTheme)
    } else if (systemPrefersDark) {
      setThemeState('dark')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Aplicar tema no documento (html e body para garantir compatibilidade)
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.toggle('dark', theme === 'dark')
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('ecoar-theme', theme)
    
    // Limpar transitionOrigin após um delay para permitir que a animação use
    if (transitionOrigin) {
      const timer = setTimeout(() => {
        setTransitionOrigin(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [theme, mounted, transitionOrigin])

  const toggleTheme = (origin?: { x: number; y: number }) => {
    if (origin) {
      setTransitionOrigin(origin)
    }
    // Pequeno delay para permitir que a animação capture a posição do botão
    setTimeout(() => {
      setThemeState(prev => prev === 'light' ? 'dark' : 'light')
    }, 10)
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Sempre renderizar o Provider, mesmo antes do mount
  // Isso garante que o contexto esteja disponível durante a hidratação
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, transitionOrigin }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

