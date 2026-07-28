'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import { WIZARD_STEP_TITLES, WIZARD_TOTAL_STEPS } from '@/features/character/constants/wizardSteps'
import StampButton from '@/components/beyond/StampButton'

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
      <div className="lg:hidden sticky top-16 z-40 border-b border-ecoar-teal/50 dark:border-ecoar-teal bg-[#1a1d21]/95">
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setOpenPanel('steps')}
            className="min-w-[44px] min-h-[44px] px-2 flex items-center justify-center border-r border-ecoar-teal/40 text-[9px] uppercase tracking-[0.12em] text-ecoar-teal"
            aria-label="Etapas"
          >
            Steps
          </button>
          <div className="flex-1 min-w-0 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ecoar-light-900 truncate">
                {stepTitle}
              </p>
              <p className="text-[9px] uppercase tracking-[0.12em] text-ecoar-teal shrink-0">
                {String(currentStep + 1).padStart(2, '0')}/{String(totalSteps + 1).padStart(2, '0')} · NV.{initialLevel}
              </p>
            </div>
            <div className="w-full bg-white/[0.06] h-1 overflow-hidden">
              <div className="h-full bg-ecoar-magenta transition-[width] duration-200" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpenPanel('summary')}
            className="min-w-[44px] min-h-[44px] px-2 flex items-center justify-center border-l border-ecoar-teal/40 text-[9px] uppercase tracking-[0.12em] text-ecoar-teal"
            aria-label="Resumo"
          >
            Sum
          </button>
        </div>
      </div>

      {openPanel ? (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Fechar"
            onClick={() => setOpenPanel(null)}
          />
          <div
            role="dialog"
            aria-labelledby={titleId}
            className={`relative z-10 flex flex-col w-[min(100%,20rem)] h-full border-ecoar-teal bg-[#0a0a0a] ${
              openPanel === 'summary' ? 'ml-auto border-l' : 'border-r'
            }`}
          >
            <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-ecoar-teal/50">
              <p id={titleId} className="text-[10px] uppercase tracking-[0.16em] text-ecoar-teal">
                {openPanel === 'steps' ? 'CREATE // SEQUENCE' : 'FICHA // RESUMO'}
              </p>
              <StampButton tone="ghost" onClick={() => setOpenPanel(null)} className="!px-3 !py-2">
                Fechar
              </StampButton>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {openPanel === 'steps' ? leftNav : summarySidebar}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
