import { config } from '@/lib/config'
import type {
  GameTable,
  GameTableWithMembers,
  CreateTableBody,
  JoinTableBody,
  TableMessage,
  PostTableRollMessageBody,
} from '@/shared/types/tables'
import type { CharacterWithMetadata } from '@/shared/types/auth'

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${config.API.BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
}

export async function getUserTables(): Promise<GameTable[]> {
  const res = await request(config.API.ENDPOINTS.TABLES)
  if (!res.ok) {
    if (res.status === 401) return []
    throw new Error('Erro ao listar mesas')
  }
  return res.json()
}

export async function createTable(body: CreateTableBody): Promise<GameTable> {
  const res = await request(config.API.ENDPOINTS.TABLES, { method: 'POST', body: JSON.stringify(body) })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao criar mesa')
  }
  return res.json()
}

export async function getTable(tableId: string): Promise<GameTableWithMembers> {
  const res = await request(`${config.API.ENDPOINTS.TABLES}/${tableId}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Mesa não encontrada')
    throw new Error('Erro ao buscar mesa')
  }
  return res.json()
}

export async function joinTable(
  body: JoinTableBody,
): Promise<{ success: boolean; tableId: string; alreadyMember?: boolean }> {
  const res = await request(config.API.ENDPOINTS.TABLES_JOIN, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao entrar na mesa')
  }
  return res.json()
}

export interface TableCharacterItem {
  character: CharacterWithMetadata
  memberUserId: string
  memberUsername?: string
  canEdit: boolean
}

export async function getTableCharacters(tableId: string): Promise<TableCharacterItem[]> {
  const res = await request(`${config.API.ENDPOINTS.TABLES}/${tableId}/characters`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Mesa não encontrada')
    throw new Error('Erro ao listar fichas da mesa')
  }
  return res.json()
}

export async function setMyTableCharacter(tableId: string, characterId: string | null): Promise<void> {
  const res = await request(`${config.API.ENDPOINTS.TABLES}/${tableId}/members/me/character`, {
    method: 'PUT',
    body: JSON.stringify({ characterId }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao vincular ficha')
  }
}

export async function getTableMessages(
  tableId: string,
  opts?: { after?: string | null; limit?: number },
): Promise<TableMessage[]> {
  const params = new URLSearchParams()
  if (opts?.after) params.set('after', opts.after)
  if (opts?.limit) params.set('limit', String(opts.limit))
  const qs = params.toString()
  const res = await request(
    `${config.API.ENDPOINTS.TABLES}/${tableId}/messages${qs ? `?${qs}` : ''}`,
  )
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao carregar chat')
  }
  const data = (await res.json()) as { messages: TableMessage[] }
  return data.messages ?? []
}

export async function postTableTextMessage(tableId: string, body: string): Promise<TableMessage> {
  const res = await request(`${config.API.ENDPOINTS.TABLES}/${tableId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ type: 'text', body }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao enviar mensagem')
  }
  return res.json()
}

export async function postTableRollMessage(
  tableId: string,
  body: Omit<PostTableRollMessageBody, 'type'>,
): Promise<TableMessage> {
  const res = await request(`${config.API.ENDPOINTS.TABLES}/${tableId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ type: 'roll', ...body }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || 'Erro ao rolar na mesa')
  }
  return res.json()
}

export type TableMessageStreamHandlers = {
  onMessage: (message: TableMessage) => void
  onBump?: () => void
  onError?: (error: Error) => void
}

function parseSseChunk(
  buffer: string,
  onEvent: (event: string, data: string) => void,
): string {
  const parts = buffer.split('\n\n')
  const rest = parts.pop() ?? ''
  for (const part of parts) {
    let event = 'message'
    const dataLines: string[] = []
    for (const line of part.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim()
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
    }
    if (dataLines.length > 0) onEvent(event, dataLines.join('\n'))
  }
  return rest
}

export function subscribeTableMessagesStream(
  tableId: string,
  handlers: TableMessageStreamHandlers,
): () => void {
  const ac = new AbortController()
  let closed = false
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let attempt = 0

  const clearReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const connect = async () => {
    if (closed) return
    try {
      const res = await request(`${config.API.ENDPOINTS.TABLES}/${tableId}/messages/stream`, {
        method: 'GET',
        headers: { Accept: 'text/event-stream' },
        signal: ac.signal,
      })
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'Erro ao conectar no chat ao vivo')
      }

      attempt = 0
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!closed) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        buffer = parseSseChunk(buffer, (event, data) => {
          if (event === 'ping') return
          if (event === 'ready' || event === 'bump') {
            handlers.onBump?.()
            return
          }
          if (event === 'message') {
            try {
              handlers.onMessage(JSON.parse(data) as TableMessage)
            } catch {
              /* ignore */
            }
          }
        })
      }

      if (!closed) {
        throw new Error('Stream do chat encerrado')
      }
    } catch (e) {
      if (closed || ac.signal.aborted) return
      const err = e instanceof Error ? e : new Error('Falha no stream do chat')
      handlers.onError?.(err)
      const delay = Math.min(10000, 800 * 2 ** attempt)
      attempt += 1
      clearReconnect()
      reconnectTimer = setTimeout(() => {
        void connect()
      }, delay)
    }
  }

  void connect()

  return () => {
    closed = true
    clearReconnect()
    ac.abort()
  }
}
