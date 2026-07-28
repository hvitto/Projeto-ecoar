'use client'

import type { ReactNode } from 'react'
import { useSheetLayout } from '@/features/character/sheet/SheetLayoutProvider'
import {
  WIDGET_LABELS,
  resolveWidgetSpan,
  visibleWidgets,
  type SheetTabId,
  type SheetWidgetId,
  type WidgetSpan,
} from '@/features/character/sheet/sheetLayoutTypes'
import {
  sheetPanel,
  sheetPanelSecondary,
  sheetWidgetHeader,
  sheetWidgetTitle,
} from '@/features/character/sheet/sheetChrome'

const SPAN_CLASS: Record<WidgetSpan, string> = {
  S: 'col-span-12 sm:col-span-6 lg:col-span-4',
  M: 'col-span-12 sm:col-span-6',
  L: 'col-span-12',
}

type WidgetTone = 'primary' | 'secondary'

type WidgetGridProps = {
  tabId: SheetTabId
  renderWidget: (id: SheetWidgetId) => ReactNode
  widgetIds?: SheetWidgetId[]
  gapClass?: string
  toneForWidget?: (id: SheetWidgetId) => WidgetTone
}

export function SheetWidgetFrame({
  widgetId,
  span,
  children,
  tone = 'primary',
}: {
  widgetId: SheetWidgetId
  span: WidgetSpan
  children: ReactNode
  tone?: WidgetTone
}) {
  const panel = tone === 'secondary' ? sheetPanelSecondary : sheetPanel
  const titleClass =
    tone === 'secondary'
      ? 'truncate font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-ecoar-teal/70'
      : sheetWidgetTitle

  return (
    <div className={`${SPAN_CLASS[span]} flex min-h-0 min-w-0 self-start`}>
      <div className={`flex w-full min-w-0 flex-1 flex-col ${panel}`}>
        <div className={sheetWidgetHeader}>
          <span className={titleClass}>{WIDGET_LABELS[widgetId]}</span>
        </div>
        <div className="min-h-0 min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}

export function WidgetGrid({
  tabId,
  renderWidget,
  widgetIds: widgetIdsProp,
  gapClass = 'gap-3',
  toneForWidget,
}: WidgetGridProps) {
  const { layout } = useSheetLayout()
  const tabState = layout.widgets[tabId]
  const widgetIds = widgetIdsProp ?? visibleWidgets(layout, tabId)

  return (
    <div className={`grid w-full grid-cols-12 items-stretch ${gapClass}`}>
      {widgetIds.map((widgetId) => {
        const span = resolveWidgetSpan(tabState, widgetId)
        return (
          <SheetWidgetFrame
            key={widgetId}
            widgetId={widgetId}
            span={span}
            tone={toneForWidget?.(widgetId) ?? 'primary'}
          >
            {renderWidget(widgetId)}
          </SheetWidgetFrame>
        )
      })}
    </div>
  )
}
