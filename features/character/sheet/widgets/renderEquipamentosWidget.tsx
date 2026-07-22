'use client'

import type { ReactNode } from 'react'
import type { SheetWidgetId } from '@/features/character/sheet/sheetLayoutTypes'
import { CombatWeaponsWidget } from '@/features/character/sheet/widgets/basico/CombatWeaponsWidget'
import { InventoryWidget } from '@/features/character/sheet/widgets/basico/InventoryWidget'

export function renderEquipamentosWidget(id: SheetWidgetId): ReactNode {
  switch (id) {
    case 'inventory':
      return <InventoryWidget />
    case 'combatWeapons':
      return <CombatWeaponsWidget />
    default:
      return null
  }
}
