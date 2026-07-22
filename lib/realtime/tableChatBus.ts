import { EventEmitter } from 'events'
import { Client, neonConfig } from '@neondatabase/serverless'
import { sql } from '@/lib/db'
import type { TableMessage } from '@/shared/types/tables'

export const TABLE_CHAT_CHANNEL = 'ecoar_table_chat'
const NOTIFY_PAYLOAD_MAX = 7500

export type TableChatNotifyPayload =
  | { v: 1; kind: 'message'; tableId: string; message: TableMessage }
  | { v: 1; kind: 'bump'; tableId: string }

type TableChatBusGlobal = {
  emitter: EventEmitter
  listenClient: Client | null
  listenStarting: Promise<void> | null
}

function getBus(): TableChatBusGlobal {
  const g = globalThis as typeof globalThis & { __ecoarTableChatBus?: TableChatBusGlobal }
  if (!g.__ecoarTableChatBus) {
    const emitter = new EventEmitter()
    emitter.setMaxListeners(200)
    g.__ecoarTableChatBus = {
      emitter,
      listenClient: null,
      listenStarting: null,
    }
  }
  return g.__ecoarTableChatBus
}

function getUnpooledConnectionString(): string {
  const unpooled = process.env.DATABASE_URL_UNPOOLED?.trim()
  if (unpooled) return unpooled
  const url = process.env.DATABASE_URL?.trim()
  if (!url) throw new Error('DATABASE_URL is not set')
  return url.replace(/-pooler\./, '.')
}

function emitPayload(payload: TableChatNotifyPayload) {
  getBus().emitter.emit('payload', payload)
}

export function subscribeTableChat(
  tableId: string,
  handler: (payload: TableChatNotifyPayload) => void,
): () => void {
  const onPayload = (payload: TableChatNotifyPayload) => {
    if (payload.tableId !== tableId) return
    handler(payload)
  }
  getBus().emitter.on('payload', onPayload)
  void ensureTableChatListener()
  return () => {
    getBus().emitter.off('payload', onPayload)
  }
}

export async function publishTableChatMessage(
  tableId: string,
  message: TableMessage,
): Promise<void> {
  const full: TableChatNotifyPayload = { v: 1, kind: 'message', tableId, message }
  emitPayload(full)

  const fullJson = JSON.stringify(full)
  const toSend: TableChatNotifyPayload =
    fullJson.length <= NOTIFY_PAYLOAD_MAX
      ? full
      : { v: 1, kind: 'bump', tableId }

  try {
    const payload = JSON.stringify(toSend)
    await sql`SELECT pg_notify(${TABLE_CHAT_CHANNEL}, ${payload})`
  } catch (e) {
    console.error('[tableChatBus] pg_notify failed', e)
  }
}

export async function ensureTableChatListener(): Promise<void> {
  const bus = getBus()
  if (bus.listenClient) return
  if (bus.listenStarting) return bus.listenStarting

  bus.listenStarting = (async () => {
    try {
      if (!neonConfig.webSocketConstructor) {
        neonConfig.webSocketConstructor = WebSocket
      }
      const client = new Client(getUnpooledConnectionString())
      client.on('notification', (msg) => {
        if (msg.channel !== TABLE_CHAT_CHANNEL || !msg.payload) return
        try {
          const parsed = JSON.parse(msg.payload) as TableChatNotifyPayload
          if (parsed?.v !== 1 || !parsed.tableId) return
          emitPayload(parsed)
        } catch {
          /* ignore malformed notify */
        }
      })
      client.on('error', (err) => {
        console.error('[tableChatBus] listen client error', err)
        bus.listenClient = null
        bus.listenStarting = null
        try {
          void client.end()
        } catch {
          /* ignore */
        }
      })
      await client.connect()
      await client.query(`LISTEN ${TABLE_CHAT_CHANNEL}`)
      bus.listenClient = client
    } catch (e) {
      bus.listenClient = null
      bus.listenStarting = null
      console.error('[tableChatBus] LISTEN failed (local fan-out still works)', e)
    }
  })()

  return bus.listenStarting
}
