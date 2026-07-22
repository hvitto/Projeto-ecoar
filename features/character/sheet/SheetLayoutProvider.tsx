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
  type FolderSize,
  type SheetLayout,
  type SheetTabId,
  type SheetWidgetId,
  type WidgetSpan,
  cycleWidgetSpan,
  resolveWidgetSpan,
} from '@/features/character/sheet/sheetLayoutTypes'

type SheetLayoutContextValue = {
  layout: SheetLayout
  setLayout: (layout: SheetLayout | ((prev: SheetLayout) => SheetLayout)) => void
  setActiveTab: (tabId: SheetTabId) => void
  setFolderSize: (size: FolderSize) => void
  reorderTabs: (orderedIds: SheetTabId[]) => void
  toggleTabHidden: (tabId: SheetTabId) => void
  reorderWidgets: (tabId: SheetTabId, orderedIds: SheetWidgetId[]) => void
  toggleWidgetHidden: (tabId: SheetTabId, widgetId: SheetWidgetId) => void
  cycleWidgetSize: (tabId: SheetTabId, widgetId: SheetWidgetId) => void
  getWidgetSpan: (tabId: SheetTabId, widgetId: SheetWidgetId) => WidgetSpan
  restoreWidget: (tabId: SheetTabId, widgetId: SheetWidgetId) => void
  restoreTab: (tabId: SheetTabId) => void
  persistLayout: () => void | Promise<void>
}

const SheetLayoutContext = createContext<SheetLayoutContextValue | null>(null)

const PERSIST_DEBOUNCE_MS = 500

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
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    }
  }, [])

  const schedulePersist = useCallback(() => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      void onPersistRef.current?.(layoutRef.current)
    }, PERSIST_DEBOUNCE_MS)
  }, [])

  const applyLayout = useCallback(
    (next: SheetLayout, persist = false) => {
      const normalized = normalizeSheetLayout(next)
      setLayoutState(normalized)
      layoutRef.current = normalized
      onLayoutChangeRef.current?.(normalized)
      if (persist) schedulePersist()
      return normalized
    },
    [schedulePersist],
  )

  const setLayout = useCallback(
    (value: SheetLayout | ((prev: SheetLayout) => SheetLayout)) => {
      const prev = layoutRef.current
      const next = typeof value === 'function' ? value(prev) : value
      applyLayout(next, true)
    },
    [applyLayout],
  )

  const persistLayout = useCallback(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
      persistTimerRef.current = null
    }
    return onPersistRef.current?.(layoutRef.current)
  }, [])

  const setActiveTab = useCallback(
    (tabId: SheetTabId) => {
      applyLayout({ ...layoutRef.current, activeTab: tabId }, false)
    },
    [applyLayout],
  )

  const setFolderSize = useCallback(
    (size: FolderSize) => {
      applyLayout({ ...layoutRef.current, folderSize: size }, true)
    },
    [applyLayout],
  )

  const reorderTabs = useCallback(
    (orderedIds: SheetTabId[]) => {
      applyLayout({ ...layoutRef.current, tabOrder: orderedIds }, true)
    },
    [applyLayout],
  )

  const toggleTabHidden = useCallback(
    (tabId: SheetTabId) => {
      const current = layoutRef.current
      const isHidden = current.hiddenTabs.includes(tabId)
      if (isHidden) {
        applyLayout({ ...current, hiddenTabs: current.hiddenTabs.filter((id) => id !== tabId) }, true)
        return
      }
      const visibleCount = current.tabOrder.filter((id) => !current.hiddenTabs.includes(id)).length
      if (visibleCount <= 1) return
      const hiddenTabs = [...current.hiddenTabs, tabId]
      const nextActive =
        current.activeTab === tabId
          ? (current.tabOrder.find((id) => id !== tabId && !hiddenTabs.includes(id)) ?? current.activeTab)
          : current.activeTab
      applyLayout({ ...current, hiddenTabs, activeTab: nextActive }, true)
    },
    [applyLayout],
  )

  const restoreTab = useCallback(
    (tabId: SheetTabId) => {
      const current = layoutRef.current
      if (!current.hiddenTabs.includes(tabId)) return
      applyLayout(
        {
          ...current,
          hiddenTabs: current.hiddenTabs.filter((id) => id !== tabId),
        },
        true,
      )
    },
    [applyLayout],
  )

  const reorderWidgets = useCallback(
    (tabId: SheetTabId, orderedIds: SheetWidgetId[]) => {
      const current = layoutRef.current
      const tabState = current.widgets[tabId]
      if (!tabState) return
      applyLayout(
        {
          ...current,
          widgets: {
            ...current.widgets,
            [tabId]: { ...tabState, order: orderedIds },
          },
        },
        true,
      )
    },
    [applyLayout],
  )

  const toggleWidgetHidden = useCallback(
    (tabId: SheetTabId, widgetId: SheetWidgetId) => {
      const current = layoutRef.current
      const tabState = current.widgets[tabId]
      if (!tabState) return
      const isHidden = tabState.hidden.includes(widgetId)
      const hidden = isHidden
        ? tabState.hidden.filter((id) => id !== widgetId)
        : [...tabState.hidden, widgetId]
      applyLayout(
        {
          ...current,
          widgets: {
            ...current.widgets,
            [tabId]: { ...tabState, hidden },
          },
        },
        true,
      )
    },
    [applyLayout],
  )

  const restoreWidget = useCallback(
    (tabId: SheetTabId, widgetId: SheetWidgetId) => {
      const current = layoutRef.current
      const tabState = current.widgets[tabId]
      if (!tabState || !tabState.hidden.includes(widgetId)) return
      applyLayout(
        {
          ...current,
          widgets: {
            ...current.widgets,
            [tabId]: {
              ...tabState,
              hidden: tabState.hidden.filter((id) => id !== widgetId),
            },
          },
        },
        true,
      )
    },
    [applyLayout],
  )

  const cycleWidgetSize = useCallback(
    (tabId: SheetTabId, widgetId: SheetWidgetId) => {
      const current = layoutRef.current
      const tabState = current.widgets[tabId]
      if (!tabState) return
      const next = cycleWidgetSpan(resolveWidgetSpan(tabState, widgetId))
      applyLayout(
        {
          ...current,
          widgets: {
            ...current.widgets,
            [tabId]: {
              ...tabState,
              sizes: { ...(tabState.sizes ?? {}), [widgetId]: next },
            },
          },
        },
        true,
      )
    },
    [applyLayout],
  )

  const getWidgetSpan = useCallback((tabId: SheetTabId, widgetId: SheetWidgetId): WidgetSpan => {
    return resolveWidgetSpan(layoutRef.current.widgets[tabId], widgetId)
  }, [])

  const value = useMemo<SheetLayoutContextValue>(
    () => ({
      layout,
      setLayout,
      setActiveTab,
      setFolderSize,
      reorderTabs,
      toggleTabHidden,
      reorderWidgets,
      toggleWidgetHidden,
      cycleWidgetSize,
      getWidgetSpan,
      restoreWidget,
      restoreTab,
      persistLayout,
    }),
    [
      layout,
      setLayout,
      setActiveTab,
      setFolderSize,
      reorderTabs,
      toggleTabHidden,
      reorderWidgets,
      toggleWidgetHidden,
      cycleWidgetSize,
      getWidgetSpan,
      restoreWidget,
      restoreTab,
      persistLayout,
    ],
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
