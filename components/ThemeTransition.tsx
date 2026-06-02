'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/shared/contexts/ThemeContext'

export default function ThemeTransition() {
  const { theme } = useTheme()
  const prevThemeRef = useRef<typeof theme>(theme)

  useEffect(() => {
    // Apenas garantir que a transição seja suave no CSS
    // Não adicionar nenhum overlay ou elemento sobreposto
    if (theme !== prevThemeRef.current) {
      prevThemeRef.current = theme
    }
  }, [theme])

  // Componente vazio - a transição acontece apenas via CSS
  return null
}
