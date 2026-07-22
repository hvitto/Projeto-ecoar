'use client'

import { ReactNode } from 'react'
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper'
import { AuthProvider } from '@/shared/contexts/AuthContext'
import { GameReferenceProvider } from '@/shared/contexts/GameReferenceContext'
import { DiceRollProvider } from '@/features/dice/DiceRollProvider'
import { DiceThrowStage } from '@/features/dice/DiceThrowStage'
import { FloatingTableChat } from '@/features/table/FloatingTableChat'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProviderWrapper>
      <AuthProvider>
        <GameReferenceProvider>
          <DiceRollProvider>
            {children}
            <FloatingTableChat />
            <DiceThrowStage />
          </DiceRollProvider>
        </GameReferenceProvider>
      </AuthProvider>
    </ThemeProviderWrapper>
  )
}
