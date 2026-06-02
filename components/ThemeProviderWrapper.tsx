'use client'

import { ThemeProvider } from '@/shared/contexts/ThemeContext'
import ThemeTransition from '@/components/ThemeTransition'

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeTransition />
      {children}
    </ThemeProvider>
  )
}

