'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { MessageSquare, Minus, X } from 'lucide-react'
import {
  getTableMessages,
  postTableTextMessage,
  subscribeTableMessagesStream,
} from '@/lib/storage/tablesApiService'
import type { TableMessage } from '@/shared/types/tables'
import { TABLE_CHAT_BUMP_EVENT, useDiceRoll } from '@/features/dice/DiceRollProvider'
import { dispatchDiceThrow } from '@/features/dice/DiceThrowStage'

type TableChatPanelProps = {
  tableId: string
  characterId?: string | null
  characterName?: string | null
  variant?: 'panel' | 'dock'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  className?: string
}

export function TableChatPanel({
  tableId,
  characterId,
  characterName,
  variant = 'panel',
  open = true,
  onOpenChange,
  onClose,
  className = '',
}: TableChatPanelProps) {
  const { roll } = useDiceRoll()
  const [messages, setMessages] = useState<TableMessage[]>([])
  const [text, setText] = useState('')
  const [manualExpr, setManualExpr] = useState('1d20')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)
  const lastIdRef = useRef<string | null>(null)
  const knownIdsRef = useRef<Set<string>>(new Set())

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [])

  const mergeMessages = useCallback((incoming: TableMessage[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      knownIdsRef.current = new Set(incoming.map((m) => m.id))
      setMessages(incoming)
      return
    }
    if (incoming.length === 0) return
    const added = incoming.filter((m) => !knownIdsRef.current.has(m.id))
    if (added.length === 0) return
    for (const m of added) knownIdsRef.current.add(m.id)
    setMessages((prev) => [...prev, ...added])
    for (const m of added) {
      if (m.type === 'roll' && m.payload?.dice && m.payload.dice.length > 0) {
        dispatchDiceThrow({
          tableId,
          label: m.payload.label,
          total: m.payload.total,
          detail: m.payload.detail,
          dice: m.payload.dice,
        })
      }
    }
  }, [tableId])

  const refresh = useCallback(
    async (mode: 'replace' | 'append') => {
      try {
        const after = mode === 'append' ? lastIdRef.current : null
        const list = await getTableMessages(tableId, {
          after: after ?? undefined,
          limit: 50,
        })
        if (mode === 'replace') {
          mergeMessages(list, 'replace')
          lastIdRef.current = list.length > 0 ? list[list.length - 1].id : null
        } else if (list.length > 0) {
          mergeMessages(list, after ? 'append' : 'replace')
          lastIdRef.current = list[list.length - 1].id
        }
        setError(null)
        if (stickToBottomRef.current || mode === 'replace') {
          requestAnimationFrame(scrollToBottom)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar chat')
      }
    },
    [tableId, mergeMessages, scrollToBottom],
  )

  const applyIncoming = useCallback(
    (msg: TableMessage) => {
      mergeMessages([msg], 'append')
      lastIdRef.current = msg.id
      if (stickToBottomRef.current) {
        requestAnimationFrame(scrollToBottom)
      }
    },
    [mergeMessages, scrollToBottom],
  )

  useEffect(() => {
    void refresh('replace')
  }, [refresh])

  useEffect(() => {
    const stop = subscribeTableMessagesStream(tableId, {
      onMessage: (msg) => {
        applyIncoming(msg)
        setError(null)
      },
      onBump: () => {
        void refresh(lastIdRef.current ? 'append' : 'replace')
      },
      onError: () => {
        void refresh(lastIdRef.current ? 'append' : 'replace')
      },
    })
    return stop
  }, [tableId, applyIncoming, refresh])

  useEffect(() => {
    const onBump = (ev: Event) => {
      const detail = (ev as CustomEvent<{ tableId?: string | null }>).detail
      if (detail?.tableId && detail.tableId !== tableId) return
      onOpenChange?.(true)
      void refresh(lastIdRef.current ? 'append' : 'replace')
    }
    window.addEventListener(TABLE_CHAT_BUMP_EVENT, onBump)
    return () => window.removeEventListener(TABLE_CHAT_BUMP_EVENT, onBump)
  }, [tableId, refresh, onOpenChange])

  const onScroll = () => {
    const el = listRef.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  const sendText = async (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    try {
      const msg = await postTableTextMessage(tableId, body)
      mergeMessages([msg], 'append')
      lastIdRef.current = msg.id
      setText('')
      requestAnimationFrame(scrollToBottom)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar')
    } finally {
      setSending(false)
    }
  }

  const sendManualRoll = async () => {
    const expression = manualExpr.trim()
    if (!expression || sending) return
    setSending(true)
    try {
      await roll({
        label: characterName ? `${characterName} · Manual` : 'Rolagem manual',
        expression,
        tableId,
        characterId,
        characterName,
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao rolar')
    } finally {
      setSending(false)
    }
  }

  if (variant === 'dock' && !open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange?.(true)}
        className="fixed bottom-4 left-4 z-[90] inline-flex h-12 w-12 items-center justify-center rounded-sm border border-ecoar-teal-500/40 bg-ecoar-dark-900/95 text-ecoar-teal-300 shadow-lg backdrop-blur-sm transition-colors hover:bg-ecoar-teal-500/15"
        aria-label="Abrir chat da mesa"
        title="Chat da mesa"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    )
  }

  const shellClass =
    variant === 'dock'
      ? `fixed bottom-4 left-4 z-[90] flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-sm border border-slate-300/50 bg-white/95 shadow-xl backdrop-blur-sm dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-900/95 ${className}`
      : `flex h-full min-h-[22rem] flex-col overflow-hidden rounded-sm border border-slate-300/70 bg-white dark:border-ecoar-light-900/15 dark:bg-ecoar-dark-900/50 ${className}`

  return (
    <div className={shellClass}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 px-3 py-2 dark:border-ecoar-light-900/10">
        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-ecoar-light-900/50">
          Chat da mesa
        </div>
        {variant === 'dock' ? (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onOpenChange?.(false)}
              className="rounded-sm p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-ecoar-light-900/10 dark:hover:text-ecoar-light-900/80"
              aria-label="Minimizar chat"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-ecoar-light-900/10 dark:hover:text-ecoar-light-900/80"
                aria-label="Fechar chat"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        ref={listRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2"
      >
        {messages.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500 dark:text-ecoar-light-900/50">
            Nenhuma mensagem ainda. Role um teste na ficha ou escreva aqui.
          </p>
        ) : (
          messages.map((m) => {
            const who = m.characterName || m.userName || 'Jogador'
            if (m.type === 'roll' && m.payload) {
              return (
                <div
                  key={m.id}
                  className="rounded-sm border border-ecoar-teal-500/25 bg-ecoar-teal-500/10 px-2.5 py-2"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-ecoar-teal-700 dark:text-ecoar-teal-300">
                    {who}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-ecoar-light-900/90">
                    {m.payload.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-600 dark:text-ecoar-light-900/65">
                    {m.payload.detail}
                  </div>
                  <div className="mt-1 text-lg font-semibold tabular-nums text-ecoar-teal-700 dark:text-ecoar-teal-300">
                    {m.payload.total}
                  </div>
                </div>
              )
            }
            return (
              <div
                key={m.id}
                className="rounded-sm border border-slate-200/80 bg-slate-50/80 px-2.5 py-2 dark:border-ecoar-light-900/10 dark:bg-ecoar-dark-800/60"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-ecoar-light-900/50">
                  {who}
                </div>
                <div className="whitespace-pre-wrap text-sm text-slate-800 dark:text-ecoar-light-900/85">
                  {m.body}
                </div>
              </div>
            )
          })
        )}
      </div>

      {error ? (
        <div className="px-3 pb-1 text-[11px] text-ecoar-magenta">{error}</div>
      ) : null}

      <div className="space-y-2 border-t border-slate-200/80 p-2 dark:border-ecoar-light-900/10">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={manualExpr}
            onChange={(e) => setManualExpr(e.target.value)}
            placeholder="1d12+3"
            className="h-8 min-w-0 flex-1 rounded-sm border border-slate-300/80 bg-white px-2 text-xs text-slate-900 outline-none focus:border-ecoar-teal-500 dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-800 dark:text-ecoar-light-900"
          />
          <button
            type="button"
            disabled={sending}
            onClick={() => void sendManualRoll()}
            className="h-8 shrink-0 rounded-sm border border-ecoar-teal-500/35 bg-ecoar-teal-500/10 px-2.5 text-xs font-semibold text-ecoar-teal-800 disabled:opacity-50 dark:text-ecoar-teal-300"
          >
            Rolar
          </button>
        </div>
        <form onSubmit={sendText} className="flex gap-1.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mensagem…"
            className="h-8 min-w-0 flex-1 rounded-sm border border-slate-300/80 bg-white px-2 text-xs text-slate-900 outline-none focus:border-ecoar-teal-500 dark:border-ecoar-light-900/20 dark:bg-ecoar-dark-800 dark:text-ecoar-light-900"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="h-8 shrink-0 rounded-sm border border-slate-300/80 px-2.5 text-xs font-semibold text-slate-700 disabled:opacity-50 dark:border-ecoar-light-900/20 dark:text-ecoar-light-900/80"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}

export default TableChatPanel
