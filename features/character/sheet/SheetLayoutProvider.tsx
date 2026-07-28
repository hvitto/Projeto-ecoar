'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  normalizeSheetLayout,
  type SheetLayout,
  type SheetTabId,
} from '@/features/character/sheet/sheetLayoutTypes'

type SheetLayoutContextValue = {
  layout: SheetLayout
  setActiveTab: (tabId: SheetTabId) => void
  persistLayout: () => void | Promise<void>
}

const SheetLayoutContext = createContext<SheetLayoutContextValue | null>(null)

type SheetLayoutProviderProps = {
  initialLayout: SheetLayout
  onLayoutChange?: (layout: SheetLayout) => void
  onPersist?: (layout: SheetLayout) => void | Promise<void>
  children: ReactNode
}

export function SheetLayoutProvider({
  initialLayout,
  onLayoutChange,
  onPersist,
  children,
}: SheetLayoutProviderProps) {
  const [layout, setLayoutState] = useState<SheetLayout>(() => normalizeSheetLayout(initialLayout))
  const layoutRef = useRef(layout)
  const onLayoutChangeRef = useRef(onLayoutChange)
  const onPersistRef = useRef(onPersist)

  useEffect(() => {
    layoutRef.current = layout
  }, [layout])

  useEffect(() => {
    onLayoutChangeRef.current = onLayoutChange
  }, [onLayoutChange])

  useEffect(() => {
    onPersistRef.current = onPersist
  }, [onPersist])

  const setActiveTab = useCallback(
    (tabId: SheetTabId) => {
      const next = normalizeSheetLayout({ ...layoutRef.current, activeTab: tabId })
      setLayoutState(next)
      layoutRef.current = next
      onLayoutChangeRef.current?.(next)
    },
    [],
  )

  const persistLayout = useCallback(() => {
    return onPersistRef.current?.(layoutRef.current)
  }, [])

  const value = useMemo<SheetLayoutContextValue>(
    () => ({
      layout,
      setActiveTab,
      persistLayout,
    }),
    [layout, setActiveTab, persistLayout],
  )

  return <SheetLayoutContext.Provider value={value}>{children}</SheetLayoutContext.Provider>
}

export function useSheetLayout(): SheetLayoutContextValue {
  const ctx = useContext(SheetLayoutContext)
  if (!ctx) {
    throw new Error('useSheetLayout must be used within SheetLayoutProvider')
  }
  return ctx
}
