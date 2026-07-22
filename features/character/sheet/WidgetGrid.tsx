'use client'

import type { CSSProperties, ReactNode } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EyeOff, GripVertical } from 'lucide-react'
import { useSheetLayout } from '@/features/character/sheet/SheetLayoutProvider'
import {
  WIDGET_LABELS,
  WIDGET_SPAN_COLS,
  resolveWidgetSpan,
  visibleWidgets,
  type SheetTabId,
  type SheetWidgetId,
  type WidgetSpan,
} from '@/features/character/sheet/sheetLayoutTypes'
import { sheetPanel } from '@/features/character/sheet/sheetChrome'

const SPAN_CLASS: Record<WidgetSpan, string> = {
  S: 'col-span-12 sm:col-span-6 lg:col-span-4',
  M: 'col-span-12 sm:col-span-6',
  L: 'col-span-12',
}

type WidgetGridProps = {
  tabId: SheetTabId
  renderWidget: (id: SheetWidgetId) => ReactNode
}

type SortableWidgetProps = {
  tabId: SheetTabId
  widgetId: SheetWidgetId
  span: WidgetSpan
  onHide: () => void
  onCycleSize: () => void
  children: ReactNode
}

function SortableWidgetCard({
  widgetId,
  span,
  onHide,
  onCycleSize,
  children,
}: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widgetId,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${SPAN_CLASS[span]} flex min-h-0 min-w-0 self-stretch ${isDragging ? 'z-20 opacity-90' : ''}`}
    >
      <div className={`flex w-full min-w-0 flex-1 flex-col ${sheetPanel}`}>
        <div className="flex h-8 shrink-0 items-center justify-between gap-1 border-b border-slate-300/60 px-1.5 dark:border-ecoar-light-900/15">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              className="cursor-grab touch-none rounded-sm p-0.5 text-slate-400 hover:bg-slate-100 hover:text-ecoar-teal-600 active:cursor-grabbing dark:text-ecoar-light-900/45 dark:hover:bg-ecoar-light-900/10 dark:hover:text-ecoar-teal-400"
              aria-label={`Arrastar ${WIDGET_LABELS[widgetId]}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-ecoar-light-900/50">
              {WIDGET_LABELS[widgetId]}
            </span>
          </div>
          <div className="flex h-8 shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={onCycleSize}
              title={`Largura ${span} (${WIDGET_SPAN_COLS[span]}/12). Clique para alternar S/M/L`}
              className="rounded-sm px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-500 transition-colors hover:bg-ecoar-teal-500/15 hover:text-ecoar-teal-700 dark:text-ecoar-light-900/55 dark:hover:text-ecoar-teal-300"
            >
              {span}
            </button>
            <button
              type="button"
              onClick={onHide}
              className="rounded-sm p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-ecoar-light-900/45 dark:hover:bg-ecoar-light-900/10 dark:hover:text-ecoar-light-900/80"
              aria-label={`Ocultar ${WIDGET_LABELS[widgetId]}`}
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="min-h-0 min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}

export function WidgetGrid({ tabId, renderWidget }: WidgetGridProps) {
  const { layout, reorderWidgets, toggleWidgetHidden, cycleWidgetSize } = useSheetLayout()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
  )

  const tabState = layout.widgets[tabId]
  const widgetIds = visibleWidgets(layout, tabId)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !tabState) return
    const oldIndex = widgetIds.indexOf(active.id as SheetWidgetId)
    const newIndex = widgetIds.indexOf(over.id as SheetWidgetId)
    if (oldIndex < 0 || newIndex < 0) return
    const nextVisible = arrayMove(widgetIds, oldIndex, newIndex)
    let vi = 0
    const nextOrder = tabState.order.map((id) =>
      tabState.hidden.includes(id) ? id : nextVisible[vi++],
    )
    reorderWidgets(tabId, nextOrder)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
        <div className="grid w-full grid-cols-12 items-stretch gap-2">
          {widgetIds.map((widgetId) => {
            const span = resolveWidgetSpan(tabState, widgetId)
            return (
              <SortableWidgetCard
                key={widgetId}
                tabId={tabId}
                widgetId={widgetId}
                span={span}
                onHide={() => toggleWidgetHidden(tabId, widgetId)}
                onCycleSize={() => cycleWidgetSize(tabId, widgetId)}
              >
                {renderWidget(widgetId)}
              </SortableWidgetCard>
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
