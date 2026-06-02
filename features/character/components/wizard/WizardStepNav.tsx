'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Sparkles, Zap } from 'lucide-react'
import { fadeInUp, motionTransition } from '@/lib/motionVariants'
import { WIZARD_STEP_ICONS, WIZARD_STEP_TITLES, WIZARD_TOTAL_STEPS } from '@/features/character/constants/wizardSteps'

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
  const stepIcons = WIZARD_STEP_ICONS
  const totalSteps = WIZARD_TOTAL_STEPS

  return (
    <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 p-3 min-h-0 max-h-[calc(100dvh-5rem)] overflow-y-auto overflow-x-hidden">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-ecoar-light-700 dark:bg-ecoar-dark-800/70 backdrop-blur-xl border-r border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06] rounded-lg p-4 flex flex-col min-h-0 flex-1 shadow-sm overflow-hidden"
      >
        <div className="mb-5 pb-4 border-b border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.06]">
          <h1 className="text-base font-semibold text-ecoar-dark-900 dark:text-ecoar-light-900/90 mb-1.5">
            Criação de Personagem
          </h1>
          <p className="text-[11px] text-slate-600 dark:text-ecoar-light-900/50">Nível {initialLevel}</p>
          <div className="mt-3 w-full bg-ecoar-dark-300/20 dark:bg-white/[0.03] rounded-full h-1 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-ecoar-teal-600 to-ecoar-magenta-600 dark:from-ecoar-teal dark:to-ecoar-magenta"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / (totalSteps + 1)) * 100}%` }}
              transition={motionTransition.smooth}
            />
          </div>
          <p className="text-[11px] text-ecoar-dark-500 dark:text-ecoar-light-900/40 mt-1.5 text-center">
            {currentStep + 1} de {totalSteps + 1} etapas
          </p>
        </div>

        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
          {stepTitles.map((title, idx) => {
            const stepNum = idx
            const StepIcon = stepIcons[idx] || Circle
            const isActive = currentStep === stepNum
            const isCompleted = currentStep > stepNum
            const isClickable = stepNum <= maxStepVisited || stepNum === currentStep
            const isPCStep = stepNum === 5

            return (
              <div key={idx} className="space-y-1">
                <motion.button
                  type="button"
                  onClick={() => {
                    if (isClickable && stepNum <= totalSteps) {
                      onVisitStep(stepNum)
                      if (isPCStep) onPcSubStepChange('singularidades')
                    }
                  }}
                  disabled={!isClickable}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-teal-50 dark:bg-ecoar-teal-600/15 border border-teal-300 dark:border-ecoar-teal-500/20 text-slate-900 dark:text-ecoar-light-900/90'
                      : isCompleted
                        ? 'bg-ecoar-light-800 dark:bg-ecoar-light-900/[0.03] border border-ecoar-dark-300/30 dark:border-ecoar-light-900/[0.08] text-ecoar-dark-700 dark:text-ecoar-light-900/70 hover:bg-ecoar-light-700 dark:hover:bg-ecoar-light-900/[0.06]'
                        : 'bg-transparent border border-ecoar-dark-300/20 dark:border-ecoar-light-900/[0.04] text-ecoar-dark-400 dark:text-ecoar-light-900/30'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                      isActive
                        ? 'bg-ecoar-teal/20 dark:bg-ecoar-teal-600/20 text-ecoar-teal/80 dark:text-ecoar-teal-400/80'
                        : isCompleted
                          ? 'bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 text-ecoar-teal/80 dark:text-ecoar-teal-400/80'
                          : 'bg-slate-50 dark:bg-ecoar-light-900/[0.03] text-slate-400 dark:text-ecoar-light-900/20'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium">Etapa {stepNum + 1}</div>
                    <div
                      className={`text-xs font-medium truncate ${
                        isActive ? 'text-ecoar-dark-900 dark:text-ecoar-light-900/90' : 'text-ecoar-dark-600 dark:text-ecoar-light-900/60'
                      }`}
                    >
                      {title}
                    </div>
                  </div>
                </motion.button>

                {isPCStep && isActive && (
                  <div className="ml-4 space-y-1 border-l-2 border-ecoar-teal/30 pl-2">
                    {(
                      [
                        { id: 'singularidades' as const, label: 'Singularidades', icon: Sparkles },
                        { id: 'traços' as const, label: 'Traços', icon: Zap },
                      ] as const
                    ).map(({ id, label, icon: SubIcon }) => {
                      const isSubActive = pcSubStep === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onPcSubStepChange(id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left text-sm ${
                            isSubActive
                              ? 'bg-ecoar-teal-50 dark:bg-ecoar-teal-600/15 border border-ecoar-teal-400 dark:border-ecoar-teal-500/30 text-ecoar-dark-900 dark:text-ecoar-light-900'
                              : 'bg-ecoar-light-800 dark:bg-ecoar-light-900/10 border border-ecoar-dark-300/30 dark:border-ecoar-light-900/10 text-ecoar-dark-600 dark:text-ecoar-light-900/60 hover:bg-ecoar-light-700 dark:hover:bg-ecoar-light-900/15'
                          }`}
                        >
                          <SubIcon
                            className={`w-3 h-3 ${isSubActive ? 'text-ecoar-teal-600 dark:text-ecoar-teal-400' : 'text-ecoar-dark-400 dark:text-ecoar-light-900/40'}`}
                          />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </aside>
  )
}

export default memo(WizardStepNav)
