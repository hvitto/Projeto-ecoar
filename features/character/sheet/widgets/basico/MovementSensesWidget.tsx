'use client'

import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetField, sheetLabel } from '@/features/character/sheet/sheetChrome'

export function MovementSensesWidget() {
  const { characterData, updateField, isEditing } = useSheetRuntime()

  const fields = [
    { key: 'terrestre', label: 'Terrestre', short: 'Terr.' },
    { key: 'aquatico', label: 'Aquático', short: 'Aquát.' },
    { key: 'aereo', label: 'Aéreo', short: 'Aéreo' },
    { key: 'visao', label: 'Visão', short: 'Visão' },
    { key: 'audicao', label: 'Audição', short: 'Audi.' },
    { key: 'olfato', label: 'Olfato', short: 'Olf.' },
  ] as const

  return (
    <div className="grid h-full w-full grid-cols-2 gap-2 p-2.5 sm:grid-cols-3 lg:grid-cols-6 sm:p-3">
      {fields.map((field) => (
        <div key={field.key} className="flex min-w-0 flex-col items-center text-center">
          <label className={`${sheetLabel} w-full text-center`} title={field.label}>
            <span className="hidden sm:inline">{field.label}</span>
            <span className="sm:hidden">{field.short}</span>
          </label>
          <input
            type="text"
            value={characterData[field.key]}
            disabled={!isEditing}
            onChange={(e) => updateField(field.key, e.target.value)}
            className={`${sheetField} text-center`}
          />
        </div>
      ))}
    </div>
  )
}

export default MovementSensesWidget
