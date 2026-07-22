'use client'

import type { ReactNode } from 'react'
import { WidgetGrid } from '@/features/character/sheet/WidgetGrid'
import type { SheetWidgetId } from '@/features/character/sheet/sheetLayoutTypes'

type BasicoTabProps = {
  renderWidget: (id: SheetWidgetId) => ReactNode
}

export function BasicoTab({ renderWidget }: BasicoTabProps) {
  return <WidgetGrid tabId="basico" renderWidget={renderWidget} />
}
