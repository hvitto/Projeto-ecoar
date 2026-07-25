'use client'

import type { ReactNode } from 'react'
import type { SystemSingularityKind } from '@/lib/systemSingularities'
import type { SystemSingularityActivationType } from '@/lib/systemSingularities'
import { SHEET_TAB_TO_KINDS } from '@/features/character/sheet/singularityTabKinds'
import type { SheetTabId, SheetWidgetId } from '@/features/character/sheet/sheetLayoutTypes'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { SingularityColumnWidget } from '@/features/character/sheet/widgets/SingularityColumnWidget'
import { DisturbiosSummaryWidget } from '@/features/character/sheet/widgets/DisturbiosSummaryWidget'

type SingularityRenderProps = {
  onToggleConditional: (kind: SystemSingularityKind, id: string, enabled: boolean) => void
}

const WIDGET_ACTIVATION: Record<
  'singPassivos' | 'singCondicionais' | 'singComplexos' | 'singAtivos',
  SystemSingularityActivationType
> = {
  singPassivos: 'passiva',
  singCondicionais: 'condicional',
  singComplexos: 'complexa',
  singAtivos: 'ativa',
}

function DisturbiosRuntimeWidget() {
  const { characterData } = useSheetRuntime()
  return (
    <DisturbiosSummaryWidget
      entries={characterData.disturbios}
      ecoarAcoes={characterData.ecoarAcoes}
      pontosEcoar={characterData.pontosEcoar}
    />
  )
}

function SingularityRuntimeColumn({
  kinds,
  martialScope,
  activation,
  onToggleConditional,
}: {
  kinds: SystemSingularityKind[]
  martialScope?: 'escola' | 'maestria'
  activation: SystemSingularityActivationType
  onToggleConditional: SingularityRenderProps['onToggleConditional']
}) {
  const { characterData, canEditSheet, isEditing, singularityBonuses } = useSheetRuntime()
  return (
    <SingularityColumnWidget
      kinds={kinds}
      martialScope={martialScope}
      activation={activation}
      characterData={characterData}
      canEdit={canEditSheet}
      isEditing={isEditing}
      onToggleConditional={onToggleConditional}
      singularityBonuses={singularityBonuses}
    />
  )
}

export function renderSingularityWidget(
  tabId: SheetTabId,
  id: SheetWidgetId,
  props: SingularityRenderProps,
): ReactNode {
  if (tabId === 'basico' || tabId === 'equipamentos') return null

  const tabConfig = SHEET_TAB_TO_KINDS[tabId]

  if (id === 'disturbios') {
    if (tabId !== 'sing-ecoar') return null
    return <DisturbiosRuntimeWidget />
  }

  if (
    id === 'singPassivos' ||
    id === 'singCondicionais' ||
    id === 'singComplexos' ||
    id === 'singAtivos'
  ) {
    return (
      <SingularityRuntimeColumn
        kinds={tabConfig.kinds}
        martialScope={tabConfig.martialScope}
        activation={WIDGET_ACTIVATION[id]}
        onToggleConditional={props.onToggleConditional}
      />
    )
  }

  return null
}
