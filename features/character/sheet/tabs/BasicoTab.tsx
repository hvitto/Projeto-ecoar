'use client'

import type { ReactNode } from 'react'
import { WidgetGrid } from '@/features/character/sheet/WidgetGrid'
import type { SheetWidgetId } from '@/features/character/sheet/sheetLayoutTypes'

type PersonagemTabProps = {
  renderWidget: (id: SheetWidgetId) => ReactNode
}

const PERSONAGEM_VISIBLE: SheetWidgetId[] = [
  'identity',
  'attributes',
  'aptitudes',
  'skills',
]

export function PersonagemTab({ renderWidget }: PersonagemTabProps) {
  return (
    <div className="flex flex-col gap-3">
      <WidgetGrid
        tabId="personagem"
        widgetIds={PERSONAGEM_VISIBLE}
        renderWidget={renderWidget}
      />
    </div>
  )
}

export { PersonagemTab as BasicoTab }
