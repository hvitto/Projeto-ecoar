'use client'

import { useSheetRuntime } from '@/features/character/sheet/SheetRuntimeContext'
import { sheetLabel } from '@/features/character/sheet/sheetChrome'

export function NotesWidget() {
  const { characterData, isEditing, updateField } = useSheetRuntime()

  return (
    <div className="p-2.5 sm:p-3">
      <label className={sheetLabel} htmlFor="sheet-notes">
        Anotações
      </label>
      <textarea
        id="sheet-notes"
        value={characterData.anotacoes}
        disabled={!isEditing}
        onChange={(e) => updateField('anotacoes', e.target.value)}
        placeholder="Anotações da sessão, pistas, débitos…"
        className="min-h-48 w-full resize-y rounded-none border border-ecoar-teal/40 bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-[#f5f5f5] outline-none placeholder:text-[#adb5bd]/55 focus:border-ecoar-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ecoar-teal disabled:cursor-not-allowed disabled:opacity-55"
      />
    </div>
  )
}

export default NotesWidget
