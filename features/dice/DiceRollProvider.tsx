'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { rollExpression } from '@/lib/dice/rollExpression'
import { DiceRollOverlay } from '@/features/dice/DiceRollOverlay'
import { dispatchDiceThrow } from '@/features/dice/DiceThrowStage'
import { postTableRollMessage } from '@/lib/storage/tablesApiService'

export const TABLE_CHAT_BUMP_EVENT = 'ecoar-table-chat-bump'

export type DiceRollRequest = {
  label: string
  expression: string
  tableId?: string | null
  characterId?: string | null
  characterName?: string | null
}

type DiceRollContextValue = {
  roll: (req: DiceRollRequest) => Promise<void>
}

const DiceRollContext = createContext<DiceRollContextValue | null>(null)

export function bumpTableChat(tableId?: string | null) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(TABLE_CHAT_BUMP_EVENT, { detail: { tableId: tableId ?? null } }),
  )
}

export function DiceRollProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    setError(null)
  }, [])

  const roll = useCallback(async (req: DiceRollRequest) => {
    const inTable = Boolean(req.tableId)

    try {
      if (req.tableId) {
        await postTableRollMessage(req.tableId, {
          label: req.label,
          expression: req.expression,
          characterId: req.characterId ?? null,
        })
        bumpTableChat(req.tableId)
        return
      }

      const result = rollExpression(req.expression)
      dispatchDiceThrow({
        label: req.label,
        total: result.total,
        detail: result.detail,
        dice: result.dice,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Falha ao rolar dados'
      setLabel(req.label)
      setError(message)
      setOpen(true)
      if (inTable) bumpTableChat(req.tableId)
    }
  }, [])

  const value = useMemo(() => ({ roll }), [roll])

  return (
    <DiceRollContext.Provider value={value}>
      {children}
      <DiceRollOverlay
        open={open}
        label={label}
        result={null}
        error={error}
        loading={false}
        onClose={close}
      />
    </DiceRollContext.Provider>
  )
}

export function useDiceRoll(): DiceRollContextValue {
  const ctx = useContext(DiceRollContext)
  if (!ctx) {
    throw new Error('useDiceRoll deve ser usado dentro de DiceRollProvider')
  }
  return ctx
}
