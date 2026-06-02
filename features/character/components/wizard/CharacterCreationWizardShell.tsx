'use client'

import type { ReactNode } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export type CharacterCreationWizardShellProps = {
  onGoToDashboard?: () => void
  leftNav: ReactNode
  children: ReactNode
  summarySidebar: ReactNode
}

export default function CharacterCreationWizardShell({
  onGoToDashboard,
  leftNav,
  children,
  summarySidebar,
}: CharacterCreationWizardShellProps) {
  return (
    <div className="h-full min-h-0 flex flex-col overflow-y-auto overflow-x-hidden">
      <div className="flex-shrink-0">
        <Header onGoToDashboard={onGoToDashboard} />
      </div>
      <div className="flex-1 min-h-[calc(100dvh-5rem)] flex items-stretch gap-4 min-w-0">
        {leftNav}
        <div className="flex-1 min-h-0 flex gap-4 min-w-0 items-stretch">
          <div className="flex-1 min-h-0 flex flex-col min-w-0 max-w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            <div className="max-w-[1400px] mx-auto w-full flex flex-col min-h-full">{children}</div>
          </div>
          {summarySidebar}
        </div>
      </div>
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  )
}
