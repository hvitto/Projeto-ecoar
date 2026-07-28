'use client'

import type { ReactNode } from 'react'
import type { SystemSingularityKind } from '@/lib/systemSingularities'
import type { SystemSingularityActivationType } from '@/lib/systemSingularities'
import { SING_GROUP_TO_KINDS } from '@/features/character/sheet/singularityTabKinds'
import type {
  SingularitySheetKindGroup,
  SheetWidgetId,
} from '@/features/character/sheet/sheetLayoutTypes'
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
  activation,
  onToggleConditional,
}: {
  kinds: SystemSingularityKind[]
  activation: SystemSingularityActivationType
  onToggleConditional: SingularityRenderProps['onToggleConditional']
}) {
  const { characterData, canMutateMesa, isEditing, singularityBonuses } = useSheetRuntime()
  return (
    <SingularityColumnWidget
      kinds={kinds}
      activation={activation}
      characterData={characterData}
      canEdit={canMutateMesa}
      isEditing={isEditing}
      onToggleConditional={onToggleConditional}
      singularityBonuses={singularityBonuses}
    />
  )
}

export function renderSingularityWidget(
  group: SingularitySheetKindGroup,
  id: SheetWidgetId,
  props: SingularityRenderProps,
): ReactNode {
  const kinds = SING_GROUP_TO_KINDS[group]

  if (id === 'disturbios') {
    if (group !== 'ecoar') return null
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
        kinds={kinds}
        activation={WIDGET_ACTIVATION[id]}
        onToggleConditional={props.onToggleConditional}
      />
    )
  }

  return null
}
