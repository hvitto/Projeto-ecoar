// Mesas (ambientes de jogo) e membros

export type TableRole = 'gm' | 'player'

export interface GameTable {
  id: string
  gmUserId: string
  name: string
  coverImageUrl: string | null
  nextSessionAt: string | null
  description: string | null
  inviteToken: string
  inviteCode: string | null
  inviteExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TableMember {
  tableId: string
  userId: string
  role: TableRole
  characterId: string | null
  joinedAt: string
  userName?: string
  characterName?: string
}

export interface GameTableWithMembers extends GameTable {
  members: TableMember[]
  myRole?: TableRole
  myCharacterId?: string | null
}

export interface CreateTableBody {
  name: string
  coverImageUrl?: string
  nextSessionAt?: string
  description?: string
}

export interface JoinTableBody {
  token?: string
  code?: string
}

export type TableMessageType = 'text' | 'roll' | 'system'

export type TableRollPayload = {
  label: string
  expression: string
  normalized: string
  total: number
  faces: number[]
  dice: Array<{ sides: number; value: number }>
  detail: string
  characterName?: string | null
}

export interface TableMessage {
  id: string
  tableId: string
  userId: string
  characterId: string | null
  type: TableMessageType
  body: string | null
  payload: TableRollPayload | null
  createdAt: string
  userName?: string | null
  characterName?: string | null
}

export type PostTableTextMessageBody = {
  type: 'text'
  body: string
}

export type PostTableRollMessageBody = {
  type: 'roll'
  label: string
  expression: string
  characterId?: string | null
}

export type PostTableMessageBody = PostTableTextMessageBody | PostTableRollMessageBody
