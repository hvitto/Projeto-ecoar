'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { TableChatPanel } from '@/features/table/TableChatPanel'
import { getTable } from '@/lib/storage/tablesApiService'

function resolveTableId(pathname: string, fromMesa: string | null): string | null {
  if (fromMesa) return fromMesa
  const mesaMatch = pathname.match(/^\/mesas\/([^/?#]+)/)
  return mesaMatch?.[1] ?? null
}

function resolveCharacterId(pathname: string): string | null {
  const match = pathname.match(/^\/personagens\/([^/?#]+)/)
  return match?.[1] ?? null
}

function FloatingTableChatInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const fromMesa = searchParams.get('fromMesa')
  const tableId = resolveTableId(pathname, fromMesa)
  const pathCharacterId = resolveCharacterId(pathname)

  const [open, setOpen] = useState(true)
  const [characterId, setCharacterId] = useState<string | null>(pathCharacterId)
  const [characterName, setCharacterName] = useState<string | null>(null)

  useEffect(() => {
    setCharacterId(pathCharacterId)
  }, [pathCharacterId])

  useEffect(() => {
    if (!tableId) return
    let cancelled = false
    getTable(tableId)
      .then((table) => {
        if (cancelled) return
        if (!pathCharacterId && table.myCharacterId) {
          setCharacterId(table.myCharacterId)
        }
        const member = table.members.find((m) => m.characterId === (pathCharacterId || table.myCharacterId))
        setCharacterName(member?.characterName ?? null)
      })
      .catch(() => {
        if (!cancelled) setCharacterName(null)
      })
    return () => {
      cancelled = true
    }
  }, [tableId, pathCharacterId])

  useEffect(() => {
    if (tableId) setOpen(true)
  }, [tableId])

  if (!tableId) return null

  return (
    <TableChatPanel
      tableId={tableId}
      characterId={characterId}
      characterName={characterName}
      variant="dock"
      open={open}
      onOpenChange={setOpen}
    />
  )
}

export function FloatingTableChat() {
  return (
    <Suspense fallback={null}>
      <FloatingTableChatInner />
    </Suspense>
  )
}

export default FloatingTableChat
