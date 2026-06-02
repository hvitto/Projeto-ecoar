'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import {
  createInitialWizardFormState,
  type WizardFormState,
} from '@/features/character/wizard/wizardFormTypes'
import {
  wizardFormReducer,
  type WizardFormAction,
} from '@/features/character/wizard/wizardFormReducer'

type WizardFormContextValue = {
  state: WizardFormState
  dispatch: Dispatch<WizardFormAction>
  patch: (patch: Partial<WizardFormState>) => void
}

const WizardFormContext = createContext<WizardFormContextValue | null>(null)

export function WizardFormProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: Partial<WizardFormState>
}) {
  const [state, dispatch] = useReducer(wizardFormReducer, undefined, () => ({
    ...createInitialWizardFormState(),
    ...initialState,
  }))

  const patch = useCallback((p: Partial<WizardFormState>) => {
    dispatch({ type: 'PATCH', patch: p })
  }, [])

  const value = useMemo(() => ({ state, dispatch, patch }), [state, patch])

  return <WizardFormContext.Provider value={value}>{children}</WizardFormContext.Provider>
}

export function useWizardForm() {
  const ctx = useContext(WizardFormContext)
  if (!ctx) throw new Error('useWizardForm must be used within WizardFormProvider')
  return ctx
}
