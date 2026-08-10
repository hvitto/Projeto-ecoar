'use client'

import type { ReactNode } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WizardMobileChrome from '@/features/character/components/wizard/WizardMobileChrome'

export type CharacterCreationWizardShellProps = {
  onGoToDashboard?: () => void
  currentStep: number
  initialLevel: number
  leftNav: ReactNode
  children: ReactNode
  summarySidebar: ReactNode
}

export default function CharacterCreationWizardShell({
  onGoToDashboard,
  currentStep,
  initialLevel,
  leftNav,
  children,
  summarySidebar,
}: CharacterCreationWizardShellProps) {
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <Header onGoToDashboard={onGoToDashboard} />
      </div>

      <WizardMobileChrome
        currentStep={currentStep}
        initialLevel={initialLevel}
        leftNav={leftNav}
        summarySidebar={summarySidebar}
      />

      <div className="flex-1 min-h-0 flex items-stretch gap-0 min-w-0 overflow-hidden">
        <div className="hidden lg:contents">{leftNav}</div>
        <div className="flex-1 min-h-0 flex gap-0 min-w-0 items-stretch overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col min-w-0 max-w-full px-3 sm:px-4 md:px-6 py-3 sm:py-6">
            <div className="max-w-[1400px] mx-auto w-full flex flex-col flex-1 min-h-0">
              {children}
            </div>
          </div>
          <div className="hidden lg:contents">{summarySidebar}</div>
        </div>
      </div>

      <div className="flex-shrink-0 hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}
