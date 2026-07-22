'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { FolderTabBar } from '@/features/character/sheet/FolderTabBar'
import { OrganizeToolbar } from '@/features/character/sheet/OrganizeToolbar'
import { useSheetLayout } from '@/features/character/sheet/SheetLayoutProvider'
import {
  FOLDER_SIZE_MAX_WIDTH,
  snapFolderSize,
  type SheetTabId,
} from '@/features/character/sheet/sheetLayoutTypes'

type CharacterSheetShellProps = {
  children?: ReactNode
  renderActiveTab?: (tabId: SheetTabId) => ReactNode
  headerSlot?: ReactNode
  toolbarExtras?: ReactNode
}

function SheetShellBody({
  children,
  renderActiveTab,
  headerSlot,
  toolbarExtras,
}: CharacterSheetShellProps) {
  const { layout, setFolderSize } = useSheetLayout()
  const shellRef = useRef<HTMLDivElement>(null)
  const [previewWidth, setPreviewWidth] = useState<number | null>(null)
  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  const previewWidthRef = useRef<number | null>(null)

  const maxWidth = previewWidth ?? FOLDER_SIZE_MAX_WIDTH[layout.folderSize]

  useEffect(() => {
    previewWidthRef.current = previewWidth
  }, [previewWidth])

  useEffect(() => {
    setPreviewWidth(null)
  }, [layout.folderSize])

  const onPointerMove = useCallback((event: PointerEvent) => {
    if (!draggingRef.current) return
    const delta = event.clientX - startXRef.current
    const next = Math.min(
      FOLDER_SIZE_MAX_WIDTH.L,
      Math.max(FOLDER_SIZE_MAX_WIDTH.S, startWidthRef.current + delta),
    )
    setPreviewWidth(next)
  }, [])

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    const width =
      previewWidthRef.current ??
      shellRef.current?.offsetWidth ??
      FOLDER_SIZE_MAX_WIDTH[layout.folderSize]
    const snapped = snapFolderSize(width)
    setPreviewWidth(null)
    setFolderSize(snapped)
  }, [layout.folderSize, onPointerMove, setFolderSize])

  const onResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    const width =
      previewWidthRef.current ??
      shellRef.current?.offsetWidth ??
      FOLDER_SIZE_MAX_WIDTH[layout.folderSize]
    draggingRef.current = true
    startXRef.current = event.clientX
    startWidthRef.current = width
    setPreviewWidth(width)
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [onPointerMove, onPointerUp])

  const content =
    renderActiveTab != null ? renderActiveTab(layout.activeTab) : children

  return (
    <div ref={shellRef} className="mx-auto w-full px-3 py-4 sm:px-4" style={{ maxWidth }}>
      {headerSlot ? <div className="mb-3">{headerSlot}</div> : null}

      <div className="mb-3">
        <OrganizeToolbar extras={toolbarExtras} />
      </div>

      <div className="relative rounded-sm border border-slate-300/60 bg-white/95 dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/40">
        <div className="border-b border-slate-300/60 px-2 dark:border-ecoar-light-900/15">
          <FolderTabBar />
        </div>

        <div className="min-h-[28rem] p-3 sm:p-4">{content}</div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar ficha"
          onPointerDown={onResizePointerDown}
          className="absolute inset-y-2 right-0 hidden w-3 cursor-ew-resize touch-none md:block"
        >
          <div className="absolute inset-y-4 right-1 w-0.5 rounded-sm bg-slate-300/70 transition-colors hover:bg-ecoar-teal-500/60 dark:bg-ecoar-light-900/25 dark:hover:bg-ecoar-teal-400/50" />
        </div>
      </div>
    </div>
  )
}

export default function CharacterSheetShell(props: CharacterSheetShellProps) {
  return <SheetShellBody {...props} />
}
