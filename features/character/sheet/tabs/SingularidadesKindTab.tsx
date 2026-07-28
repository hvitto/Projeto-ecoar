'use client'

import { useState, type ReactNode } from 'react'
import { SheetWidgetFrame } from '@/features/character/sheet/WidgetGrid'
import {
  ALL_SING_GROUPS,
  SING_GROUP_LABELS,
  defaultWidgetSpan,
  visibleSingWidgets,
  type SingularitySheetKindGroup,
  type SheetWidgetId,
} from '@/features/character/sheet/sheetLayoutTypes'
import { sheetChipActive, sheetChipIdle } from '@/features/character/sheet/sheetChrome'

type SingularidadesTabProps = {
  renderWidget: (group: SingularitySheetKindGroup, id: SheetWidgetId) => ReactNode
}

export function SingularidadesTab({ renderWidget }: SingularidadesTabProps) {
  const [group, setGroup] = useState<SingularitySheetKindGroup>('ecoar')
  const widgetIds = visibleSingWidgets(group)

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Tipo de singularidade"
        className="flex flex-wrap gap-1.5"
      >
        {ALL_SING_GROUPS.map((id) => {
          const active = group === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setGroup(id)}
              className={active ? sheetChipActive : sheetChipIdle}
            >
              {SING_GROUP_LABELS[id]}
            </button>
          )
        })}
      </div>
      <p className="font-mono text-[11px] leading-relaxed text-[#adb5bd]">
        Só o que a ficha já possui. Para adquirir novas, gaste PE em Evoluir.
      </p>

      <div className="grid w-full grid-cols-12 items-stretch gap-3">
        {widgetIds.map((widgetId) => (
          <SheetWidgetFrame
            key={`${group}-${widgetId}`}
            widgetId={widgetId}
            span={defaultWidgetSpan(widgetId)}
          >
            {renderWidget(group, widgetId)}
          </SheetWidgetFrame>
        ))}
      </div>
    </div>
  )
}

export { SingularidadesTab as SingularidadesKindTab }

