import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'
import { sql } from '@/lib/db'
import {
  ensureTableChatListener,
  subscribeTableChat,
  type TableChatNotifyPayload,
} from '@/lib/realtime/tableChatBus'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const HEARTBEAT_MS = 15000

async function isMember(tableId: string, userId: string): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM game_table_members WHERE table_id = ${tableId} AND user_id = ${userId} LIMIT 1
  `) as Array<{ '?column?': number }>
  return rows.length > 0
}

function encodeSse(event: string, data: unknown): Uint8Array {
  const payload = typeof data === 'string' ? data : JSON.stringify(data)
  return new TextEncoder().encode(`event: ${event}\ndata: ${payload}\n\n`)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { id: tableId } = await params
  try {
    if (!(await isMember(tableId, auth.userId))) {
      return new Response(JSON.stringify({ error: 'Mesa não encontrada ou acesso negado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'Erro ao abrir stream' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await ensureTableChatListener()

  let unsubscribe: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let closed = false

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return
        try {
          controller.enqueue(chunk)
        } catch {
          closed = true
        }
      }

      const close = () => {
        if (closed) return
        closed = true
        if (heartbeat) clearInterval(heartbeat)
        heartbeat = null
        unsubscribe?.()
        unsubscribe = null
        try {
          controller.close()
        } catch {
          /* ignore */
        }
      }

      unsubscribe = subscribeTableChat(tableId, (payload: TableChatNotifyPayload) => {
        if (payload.kind === 'message') {
          safeEnqueue(encodeSse('message', payload.message))
          return
        }
        safeEnqueue(encodeSse('bump', { tableId: payload.tableId }))
      })

      safeEnqueue(encodeSse('ready', { tableId }))

      heartbeat = setInterval(() => {
        safeEnqueue(encodeSse('ping', {}))
      }, HEARTBEAT_MS)

      request.signal.addEventListener('abort', close)
    },
    cancel() {
      closed = true
      if (heartbeat) clearInterval(heartbeat)
      heartbeat = null
      unsubscribe?.()
      unsubscribe = null
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
