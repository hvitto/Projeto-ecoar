'use client'

import type { ReactNode } from 'react'
import { useSheetLayout } from '@/features/character/sheet/SheetLayoutProvider'
import {
  SHEET_TAB_LABELS,
  WIDGET_LABELS,
  type FolderSize,
} from '@/features/character/sheet/sheetLayoutTypes'
import { sheetChip } from '@/features/character/sheet/sheetChrome'

const FOLDER_SIZES: FolderSize[] = ['S', 'M', 'L']

type OrganizeToolbarProps = {
  extras?: ReactNode
}

export function OrganizeToolbar({ extras }: OrganizeToolbarProps) {
  const { layout, setFolderSize, restoreTab, restoreWidget } = useSheetLayout()

  const hiddenTabs = layout.tabOrder.filter((id) => layout.hiddenTabs.includes(id))
  const activeWidgets = layout.widgets[layout.activeTab]
  const hiddenWidgets = activeWidgets
    ? activeWidgets.order.filter((id) => activeWidgets.hidden.includes(id))
    : []
  const hasHidden = hiddenTabs.length > 0 || hiddenWidgets.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center overflow-hidden rounded-sm border border-slate-300/70 dark:border-ecoar-light-900/20">
        {FOLDER_SIZES.map((size) => {
          const active = layout.folderSize === size
          return (
            <button
              key={size}
              type="button"
              onClick={() => setFolderSize(size)}
              className={`h-8 min-w-8 px-2.5 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:bg-ecoar-teal-600/25 dark:text-ecoar-teal-300'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-ecoar-light-900/70 dark:hover:bg-ecoar-light-900/10'
              }`}
            >
              {size}
            </button>
          )
        })}
      </div>

      {hasHidden && (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-ecoar-light-900/50">
            Ocultos:
          </span>
          {hiddenTabs.map((tabId) => (
            <button
              key={`tab-${tabId}`}
              type="button"
              onClick={() => restoreTab(tabId)}
              className={`${sheetChip} border-ecoar-teal-500/35 bg-ecoar-teal-500/10 text-ecoar-teal-800 hover:bg-ecoar-teal-500/20 dark:text-ecoar-teal-300`}
            >
              {SHEET_TAB_LABELS[tabId]}
            </button>
          ))}
          {hiddenWidgets.map((widgetId) => (
            <button
              key={`widget-${widgetId}`}
              type="button"
              onClick={() => restoreWidget(layout.activeTab, widgetId)}
              className={`${sheetChip} border-slate-300/80 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-ecoar-light-900/20 dark:text-ecoar-light-900/80 dark:hover:bg-ecoar-light-900/10`}
            >
              {WIDGET_LABELS[widgetId]}
            </button>
          ))}
        </div>
      )}

      {extras ? <div className="ml-auto flex flex-wrap items-center gap-2">{extras}</div> : null}
    </div>
  )
}
