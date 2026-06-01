'use client'

import { useCallback, useMemo, useReducer } from 'react'
import {
  canAdvanceStep,
  canProceedForStep,
  initialWizardNavigationState,
  type StepValidationInput,
  wizardNavigationReducer,
  WIZARD_LAST_STEP,
} from '@/features/character/wizard/wizardReducer'

export function useCharacterWizard(validation: StepValidationInput) {
  const [navigation, dispatch] = useReducer(wizardNavigationReducer, initialWizardNavigationState)

  const canProceed = useMemo(
    () => canProceedForStep(navigation.currentStep, validation),
    [navigation.currentStep, validation],
  )

  const canGoNext = useMemo(
    () => canAdvanceStep(navigation, canProceed),
    [navigation, canProceed],
  )

  const goNext = useCallback(() => {
    if (canAdvanceStep(navigation, canProceed)) {
      dispatch({ type: 'NEXT' })
    }
  }, [navigation, canProceed])

  const goBack = useCallback(() => {
    dispatch({ type: 'BACK' })
  }, [])

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step })
  }, [])

  const visitStep = useCallback((step: number) => {
    dispatch({ type: 'VISIT_STEP', step })
  }, [])

  const resetNavigation = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    currentStep: navigation.currentStep,
    maxStepVisited: navigation.maxStepVisited,
    lastStep: WIZARD_LAST_STEP,
    canProceed,
    canGoNext,
    goNext,
    goBack,
    setStep,
    visitStep,
    resetNavigation,
  }
}
