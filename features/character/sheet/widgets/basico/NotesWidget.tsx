'use client'

import { SheetNotesSection } from '@/components/sheet/sections'
import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'

export function NotesWidget() {
  const { characterData, isEditing, updateField } = useSheetRuntime()

  return (
    <div className="p-2.5 sm:p-3">
      <SheetNotesSection
        value={characterData.anotacoes}
        isEditing={isEditing}
        onChange={(value) => updateField('anotacoes', value)}
      />
    </div>
  )
}

export default NotesWidget
