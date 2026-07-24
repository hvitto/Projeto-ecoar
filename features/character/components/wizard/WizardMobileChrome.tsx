'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import { List, ClipboardList, X } from 'lucide-react'
import { WIZARD_STEP_TITLES, WIZARD_TOTAL_STEPS } from '@/features/character/constants/wizardSteps'

type WizardMobileChromeProps = {
  currentStep: number
  initialLevel: number
  leftNav: ReactNode
  summarySidebar: ReactNode
}

export default function WizardMobileChrome({
  currentStep,
  initialLevel,
  leftNav,
  summarySidebar,
}: WizardMobileChromeProps) {
  const [openPanel, setOpenPanel] = useState<'steps' | 'summary' | null>(null)
  const titleId = useId()
  const totalSteps = WIZARD_TOTAL_STEPS
  const progressPct = ((currentStep + 1) / (totalSteps + 1)) * 100
  const stepTitle = WIZARD_STEP_TITLES[currentStep] ?? 'Criação'

  useEffect(() => {
    if (!openPanel) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [openPanel])

  useEffect(() => {
    setOpenPanel(null)
  }, [currentStep])

  return (
    <>
      <div className="lg:hidden sticky top-16 z-40 border-b border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] bg-ecoar-light-700/95 dark:bg-ecoar-dark-800/95 backdrop-blur-md">
        <div className="px-3 py-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenPanel('steps')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/15 text-ecoar-dark-700 dark:text-ecoar-light-900/80"
            aria-label="Etapas"
          >
            <List className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900 truncate">
                {stepTitle}
              </p>
              <p className="text-[10px] text-ecoar-dark-500 dark:text-ecoar-light-900/50 shrink-0">
                {currentStep + 1}/{totalSteps + 1} · Nv.{initialLevel}
              </p>
            </div>
            <div className="w-full bg-ecoar-dark-300/20 dark:bg-white/[0.03] rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-ecoar-teal-600 to-ecoar-magenta-600 dark:from-ecoar-teal dark:to-ecoar-magenta transition-[width] duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpenPanel('summary')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-ecoar-dark-300/30 dark:border-ecoar-light-900/15 text-ecoar-dark-700 dark:text-ecoar-light-900/80"
            aria-label="Resumo"
          >
            <ClipboardList className="w-5 h-5" />
          </button>
        </div>
      </div>

      {openPanel && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fechar painel"
            onClick={() => setOpenPanel(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative z-10 flex flex-col bg-ecoar-light-700 dark:bg-ecoar-dark-800 shadow-xl w-[min(100%,20rem)] max-h-[100dvh] ${
              openPanel === 'steps' ? 'mr-auto' : 'ml-auto'
            }`}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-ecoar-dark-300/30 dark:border-ecoar-light-900/10">
              <h2 id={titleId} className="text-sm font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900">
                {openPanel === 'steps' ? 'Etapas' : 'Resumo'}
              </h2>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-ecoar-dark-600 dark:text-ecoar-light-900/70"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
              onClick={(e) => {
                const target = e.target as HTMLElement
                if (target.closest('button')) setOpenPanel(null)
              }}
            >
              {openPanel === 'steps' ? leftNav : summarySidebar}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
