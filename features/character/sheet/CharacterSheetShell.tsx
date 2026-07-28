'use client'

import type { ReactNode } from 'react'
import CoordLabel from '@/components/beyond/CoordLabel'
import { FolderTabBar } from '@/features/character/sheet/FolderTabBar'
import { SessionStrip } from '@/features/character/sheet/SessionStrip'
import { SheetDualModeHint } from '@/features/character/sheet/SheetDualModeHint'
import { useSheetLayout } from '@/features/character/sheet/SheetLayoutProvider'
import { useSheetSessionShortcuts } from '@/features/character/sheet/useSheetSessionShortcuts'
import {
  FIXED_FOLDER_WIDTH,
  type SheetTabId,
} from '@/features/character/sheet/sheetLayoutTypes'
import { sheetFolder, sheetFooterHelp, sheetGridTexture } from '@/features/character/sheet/sheetChrome'

type CharacterSheetShellProps = {
  children?: ReactNode
  renderActiveTab?: (tabId: SheetTabId) => ReactNode
}

function SheetShellBody({ children, renderActiveTab }: CharacterSheetShellProps) {
  const { layout } = useSheetLayout()
  useSheetSessionShortcuts()
  const content =
    renderActiveTab != null ? renderActiveTab(layout.activeTab) : children

  return (
    <div className="flex w-full flex-col pb-8">
      <div className="sticky top-0 z-20 border-b border-ecoar-teal/25 bg-[#0a0a0a]">
        <div
          className="mx-auto w-full px-1.5 py-0 sm:px-4 sm:py-0.5"
          style={{ maxWidth: FIXED_FOLDER_WIDTH }}
        >
          <SessionStrip />
        </div>
      </div>

      <div
        className="mx-auto mt-1 w-full min-w-0 px-1.5 sm:mt-2 sm:px-4"
        style={{ maxWidth: FIXED_FOLDER_WIDTH }}
      >
        <SheetDualModeHint />

        <section aria-label="Ficha do personagem" className="relative min-w-0">
          <div className={sheetFolder}>
            <div className={sheetGridTexture} aria-hidden />
            <div className="relative border-b border-ecoar-teal/40 px-2.5 sm:px-4">
              <FolderTabBar />
            </div>

            <div className="relative min-h-[16rem] p-2.5 sm:min-h-[20rem] sm:p-4">{content}</div>

            <div className="relative flex flex-col gap-1 border-t border-ecoar-teal/35 px-2.5 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:px-4 sm:py-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ecoar-teal sm:text-[11px]">
                Ficha · ECOAR +
              </span>
              <p className={sheetFooterHelp}>
                Mesa: limites sem Editar · Ficha: Editar → Salvar · 1–3 abas · E editar · Ctrl+S
                salvar · Esc cancelar
              </p>
              <CoordLabel refId="EB-FICHA" className="sm:text-right" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function CharacterSheetShell(props: CharacterSheetShellProps) {
  return <SheetShellBody {...props} />
}
