'use client'

import type { ReactNode } from 'react'
import { WidgetGrid } from '@/features/character/sheet/WidgetGrid'
import type { SheetTabId, SheetWidgetId } from '@/features/character/sheet/sheetLayoutTypes'

type SingularidadesTabId = Exclude<SheetTabId, 'basico' | 'equipamentos'>

type SingularidadesKindTabProps = {
  tabId: SingularidadesTabId
  renderWidget: (id: SheetWidgetId) => ReactNode
}

export function SingularidadesKindTab({ tabId, renderWidget }: SingularidadesKindTabProps) {
  return <WidgetGrid tabId={tabId} renderWidget={renderWidget} />
}
