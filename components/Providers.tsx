'use client'

import { ReactNode } from 'react'
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'
import { AuthProvider } from '@/contexts/AuthContext'
import { EquipmentCatalogProvider } from '@/contexts/EquipmentCatalogContext'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProviderWrapper>
      <AuthProvider>
        <EquipmentCatalogProvider>{children}</EquipmentCatalogProvider>
      </AuthProvider>
    </ThemeProviderWrapper>
  )
}

