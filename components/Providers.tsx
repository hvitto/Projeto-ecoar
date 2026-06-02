'use client'

import { ReactNode } from 'react'
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'
import { AuthProvider } from '@/shared/contexts/AuthContext'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProviderWrapper>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProviderWrapper>
  )
}

