'use client'

import { useSheetLayout } from '@/features/character/sheet/SheetLayoutProvider'
import {
  ALL_SHEET_TABS,
  SHEET_TAB_LABELS,
  type SheetTabId,
} from '@/features/character/sheet/sheetLayoutTypes'
import { sheetFocusRingInset } from '@/features/character/sheet/sheetChrome'

const tabActive = 'border-ecoar-teal font-display text-[#f5f5f5]'
const tabIdle =
  'border-transparent font-mono text-[#adb5bd] hover:border-ecoar-teal/40 hover:text-[#f5f5f5]'

function TabButton({
  tabId,
  isActive,
  onSelect,
  shortcutIndex,
}: {
  tabId: SheetTabId
  isActive: boolean
  onSelect: () => void
  shortcutIndex: number
}) {
  const label = SHEET_TAB_LABELS[tabId]
  return (
    <button
      type="button"
      role="tab"
      id={`sheet-tab-${tabId}`}
      aria-selected={isActive}
      aria-label={`${label} (atalho ${shortcutIndex})`}
      title={`${label} (${shortcutIndex})`}
      tabIndex={isActive ? 0 : -1}
      onClick={onSelect}
      className={`relative flex min-h-8 min-w-[4.75rem] items-center border-b-2 px-2 py-1 text-left text-[10px] font-normal uppercase tracking-[0.12em] transition-colors sm:min-h-10 sm:min-w-[6.5rem] sm:px-3 sm:text-[11px] [@media(pointer:coarse)]:min-h-9 ${sheetFocusRingInset} ${
        isActive ? tabActive : tabIdle
      }`}
    >
      <span className="truncate">{label}</span>
    </button>
  )
}

export function FolderTabBar() {
  const { layout, setActiveTab } = useSheetLayout()

  return (
    <div
      className="flex min-w-0 items-stretch overflow-x-auto"
      role="tablist"
      aria-label="Seções da ficha"
      onKeyDown={(event) => {
        const current = ALL_SHEET_TABS.indexOf(layout.activeTab)
        if (current < 0) return
        let next = current
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          next = (current + 1) % ALL_SHEET_TABS.length
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          next = (current - 1 + ALL_SHEET_TABS.length) % ALL_SHEET_TABS.length
        } else if (event.key === 'Home') {
          next = 0
        } else if (event.key === 'End') {
          next = ALL_SHEET_TABS.length - 1
        } else {
          return
        }
        event.preventDefault()
        setActiveTab(ALL_SHEET_TABS[next])
        window.requestAnimationFrame(() => {
          document.getElementById(`sheet-tab-${ALL_SHEET_TABS[next]}`)?.focus()
        })
      }}
    >
      {ALL_SHEET_TABS.map((tabId, index) => (
        <TabButton
          key={tabId}
          tabId={tabId}
          isActive={layout.activeTab === tabId}
          onSelect={() => setActiveTab(tabId)}
          shortcutIndex={index + 1}
        />
      ))}
    </div>
  )
}
