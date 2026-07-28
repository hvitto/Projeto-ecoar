'use client'

import { memo } from 'react'
import { WIZARD_STEP_TITLES, WIZARD_TOTAL_STEPS } from '@/features/character/constants/wizardSteps'
import StepRail from '@/components/beyond/StepRail'
import CoordLabel from '@/components/beyond/CoordLabel'

export type WizardStepNavProps = {
  currentStep: number
  maxStepVisited: number
  initialLevel: number
  pcSubStep: 'singularidades' | 'traços' | 'escola-marcial'
  onVisitStep: (step: number) => void
  onPcSubStepChange: (sub: 'singularidades' | 'traços' | 'escola-marcial') => void
}

function WizardStepNav({
  currentStep,
  maxStepVisited,
  initialLevel,
  pcSubStep,
  onVisitStep,
  onPcSubStepChange,
}: WizardStepNavProps) {
  const stepTitles = [...WIZARD_STEP_TITLES]
  const totalSteps = WIZARD_TOTAL_STEPS
  const progressPct = ((currentStep + 1) / (totalSteps + 1)) * 100

  return (
    <aside className="flex flex-col w-full lg:w-72 flex-shrink-0 p-3 lg:p-0 min-h-0 lg:max-h-[calc(100dvh-5rem)] overflow-y-auto overflow-x-hidden">
      <div className="bg-transparent lg:bg-[#0a0a0a]/55 lg:border-r border-ecoar-teal/50 dark:border-ecoar-teal rounded-none flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="hidden lg:block px-4 pt-4 pb-3 border-b border-ecoar-teal/40 dark:border-ecoar-teal/50 shrink-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-ecoar-teal mb-2">
            CREATE // SEQUENCE
          </p>
          <h1 className="font-display text-lg uppercase tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900 leading-none mb-1.5">
            Criação
          </h1>
          <p className="text-[10px] uppercase tracking-[0.1em] text-ecoar-dark-500 dark:text-[#adb5bd]">
            Nível {initialLevel}
          </p>
          <CoordLabel refId="WIZ-RAIL" className="mt-2" />
          <div className="mt-3 w-full bg-ecoar-dark-900/10 dark:bg-white/[0.06] h-1 overflow-hidden">
            <div
              className="h-full bg-ecoar-magenta transition-[width] duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-ecoar-dark-500 dark:text-[#adb5bd]/70 mt-1.5 text-right">
            {String(currentStep + 1).padStart(2, '0')} / {String(totalSteps + 1).padStart(2, '0')}
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar overflow-x-hidden p-0 lg:p-0">
          <StepRail
            steps={stepTitles}
            current={currentStep}
            className="border-0 lg:border-0 rounded-none"
            onSelect={(stepNum) => {
              const isClickable = stepNum <= maxStepVisited || stepNum === currentStep
              if (!isClickable || stepNum > totalSteps) return
              onVisitStep(stepNum)
              if (stepNum === 5) onPcSubStepChange('singularidades')
            }}
          />

          {currentStep === 5 ? (
            <div className="border-t border-ecoar-teal/40 dark:border-ecoar-teal/50 p-2">
              <p className="text-[9px] uppercase tracking-[0.14em] text-ecoar-teal px-2 py-1">PC · SUB</p>
              {(
                [
                  ['singularidades', 'Singularidades'],
                  ['traços', 'Traços'],
                  ['escola-marcial', 'Escola'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onPcSubStepChange(id)}
                  className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-[0.1em] border-b border-ecoar-teal/25 last:border-0 ${
                    pcSubStep === id
                      ? 'bg-ecoar-magenta text-[var(--ecoar-accent-ink)]'
                      : 'text-ecoar-dark-500 dark:text-[#adb5bd] hover:bg-ecoar-teal/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

export default memo(WizardStepNav)
