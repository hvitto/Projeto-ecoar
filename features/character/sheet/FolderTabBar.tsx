'use client'

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
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EyeOff, GripVertical } from 'lucide-react'
import { useSheetLayout } from '@/features/character/sheet/SheetLayoutProvider'
import {
  SHEET_TAB_LABELS,
  visibleTabs,
  type SheetTabId,
} from '@/features/character/sheet/sheetLayoutTypes'

type SortableTabProps = {
  tabId: SheetTabId
  isActive: boolean
  canHide: boolean
  onSelect: () => void
  onHide: () => void
}

function SortableTab({ tabId, isActive, canHide, onSelect, onHide }: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tabId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex shrink-0 items-stretch ${isDragging ? 'z-20 opacity-90' : ''}`}
    >
      <button
        type="button"
        className="flex cursor-grab touch-none items-center px-1 text-slate-400 opacity-60 transition-opacity hover:text-ecoar-teal-600 hover:opacity-100 active:cursor-grabbing dark:text-ecoar-light-900/40 dark:hover:text-ecoar-teal-400"
        aria-label={`Arrastar ${SHEET_TAB_LABELS[tabId]}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className={`relative flex min-w-[6.5rem] items-center gap-1 border-b-2 px-2 py-2 text-left text-sm font-semibold transition-colors ${
          isActive
            ? 'border-ecoar-teal text-slate-900 dark:text-ecoar-light-900'
            : 'border-transparent text-slate-500 hover:border-slate-300/60 hover:text-slate-800 dark:text-ecoar-light-900/55 dark:hover:border-ecoar-light-900/25 dark:hover:text-ecoar-light-900/85'
        }`}
      >
        <span className="truncate pr-5">{SHEET_TAB_LABELS[tabId]}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onHide()
        }}
        disabled={!canHide}
        className="absolute right-0.5 top-1/2 z-10 -translate-y-1/2 rounded-sm p-1 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 dark:text-ecoar-light-900/45 dark:hover:bg-ecoar-light-900/10 dark:hover:text-ecoar-light-900/80"
        aria-label={`Ocultar ${SHEET_TAB_LABELS[tabId]}`}
      >
        <EyeOff className="h-3 w-3" />
      </button>
    </div>
  )
}

export function FolderTabBar() {
  const { layout, setActiveTab, reorderTabs, toggleTabHidden } = useSheetLayout()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
  )

  const tabs = visibleTabs(layout)
  const canHide = tabs.length > 1

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = tabs.indexOf(active.id as SheetTabId)
    const newIndex = tabs.indexOf(over.id as SheetTabId)
    if (oldIndex < 0 || newIndex < 0) return
    const nextVisible = arrayMove(tabs, oldIndex, newIndex)
    let vi = 0
    const nextOrder = layout.tabOrder.map((id) =>
      layout.hiddenTabs.includes(id) ? id : nextVisible[vi++],
    )
    reorderTabs(nextOrder)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
        <div className="overflow-x-auto">
          <div className="flex w-max max-w-none items-stretch justify-start gap-0.5">
            {tabs.map((tabId) => (
              <SortableTab
                key={tabId}
                tabId={tabId}
                isActive={layout.activeTab === tabId}
                canHide={canHide}
                onSelect={() => setActiveTab(tabId)}
                onHide={() => toggleTabHidden(tabId)}
              />
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  )
}
