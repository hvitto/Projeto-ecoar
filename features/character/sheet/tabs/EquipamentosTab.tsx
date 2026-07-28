'use client'

import type { ReactNode } from 'react'
import { WidgetGrid } from '@/features/character/sheet/WidgetGrid'
import type { SheetWidgetId } from '@/features/character/sheet/sheetLayoutTypes'

type EquipamentosTabProps = {
  renderWidget: (id: SheetWidgetId) => ReactNode
}

export function EquipamentosTab({ renderWidget }: EquipamentosTabProps) {
  return (
    <WidgetGrid
      tabId="equipamentos"
      renderWidget={renderWidget}
      gapClass="gap-6 sm:gap-8"
      toneForWidget={(id) => (id === 'inventory' ? 'secondary' : 'primary')}
    />
  )
}
