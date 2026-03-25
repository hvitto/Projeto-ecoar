import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'

export function parseEquipmentAdminEmails(): string[] {
  const raw = process.env.EQUIPMENT_ADMIN_EMAILS?.trim() ?? ''
  if (!raw) return []
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function isEquipmentAdminUser(userId: string): Promise<boolean> {
  const allow = parseEquipmentAdminEmails()
  if (allow.length === 0) return false
  const rows = (await sql`
    SELECT lower(email::text) AS email FROM users WHERE id = ${userId} LIMIT 1
  `) as Array<{ email: string }>
  if (rows.length === 0) return false
  return allow.includes(rows[0].email)
}

/**
 * Retorna `{ userId }` se autenticado e na lista de admins de equipamento; caso contrário `Response` com 401/403.
 */
export async function requireEquipmentAdmin(request: Request): Promise<{ userId: string } | Response> {
  const auth = await getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const ok = await isEquipmentAdminUser(auth.userId)
  if (!ok) {
    return NextResponse.json({ error: 'Sem permissão para gerenciar o catálogo de equipamentos' }, { status: 403 })
  }
  return { userId: auth.userId }
}
