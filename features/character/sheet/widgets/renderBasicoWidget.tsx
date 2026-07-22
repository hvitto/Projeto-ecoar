'use client'

import type { ReactNode } from 'react'
import type { SheetWidgetId } from '@/features/character/sheet/sheetLayoutTypes'
import { IdentityWidget } from '@/features/character/sheet/widgets/basico/IdentityWidget'
import { AttributesWidget } from '@/features/character/sheet/widgets/basico/AttributesWidget'
import { SkillsWidget } from '@/features/character/sheet/widgets/basico/SkillsWidget'
import { LimitsWidget } from '@/features/character/sheet/widgets/basico/LimitsWidget'
import { AptitudesWidget } from '@/features/character/sheet/widgets/basico/AptitudesWidget'
import { CommonTestsWidget } from '@/features/character/sheet/widgets/basico/CommonTestsWidget'
import { MovementSensesWidget } from '@/features/character/sheet/widgets/basico/MovementSensesWidget'
import { ResistancesWidget } from '@/features/character/sheet/widgets/basico/ResistancesWidget'
import { NotesWidget } from '@/features/character/sheet/widgets/basico/NotesWidget'

export function renderBasicoWidget(id: SheetWidgetId): ReactNode {
  switch (id) {
    case 'identity':
      return <IdentityWidget />
    case 'attributes':
      return <AttributesWidget />
    case 'skills':
      return <SkillsWidget />
    case 'limits':
      return <LimitsWidget />
    case 'aptitudes':
      return <AptitudesWidget />
    case 'commonTests':
      return <CommonTestsWidget />
    case 'movementSenses':
      return <MovementSensesWidget />
    case 'resistances':
      return <ResistancesWidget />
    case 'notes':
      return <NotesWidget />
    default:
      return null
  }
}
