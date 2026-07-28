'use client'

import { useEffect } from 'react'
import { useSheetLayout } from '@/features/character/sheet/SheetLayoutProvider'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { ALL_SHEET_TABS } from '@/features/character/sheet/sheetLayoutTypes'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return Boolean(target.closest('[contenteditable="true"]'))
}

export function useSheetSessionShortcuts() {
  const { setActiveTab } = useSheetLayout()
  const {
    isEditing,
    canEditSheet,
    isSaving,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
  } = useSheetRuntime()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isEditing && !isSaving) {
        event.preventDefault()
        handleCancelEdit()
        return
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 's' &&
        canEditSheet &&
        isEditing &&
        !isSaving
      ) {
        event.preventDefault()
        void handleSaveEdit()
        return
      }

      if (isTypingTarget(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'e' || event.key === 'E') {
        if (!canEditSheet || isEditing) return
        event.preventDefault()
        handleStartEdit()
        return
      }

      const tabIndex = Number.parseInt(event.key, 10)
      if (tabIndex >= 1 && tabIndex <= ALL_SHEET_TABS.length) {
        event.preventDefault()
        setActiveTab(ALL_SHEET_TABS[tabIndex - 1])
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    canEditSheet,
    handleCancelEdit,
    handleSaveEdit,
    handleStartEdit,
    isEditing,
    isSaving,
    setActiveTab,
  ])
}
