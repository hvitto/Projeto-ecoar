import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getAuthFromRequest } from '@/lib/auth/getAuthFromRequest'

export function parseEcoarAdminEmails(): string[] {
  const raw = (process.env.ECOAR_ADMIN_EMAILS?.trim() || process.env.EQUIPMENT_ADMIN_EMAILS?.trim() || '')
  if (!raw) return []
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function isEcoarAdminUser(userId: string): Promise<boolean> {
  const allow = parseEcoarAdminEmails()
  if (allow.length === 0) return false
  const rows = (await sql`
    SELECT lower(email::text) AS email FROM users WHERE id = ${userId} LIMIT 1
  `) as Array<{ email: string }>
  if (rows.length === 0) return false
  return allow.includes(rows[0].email)
}

export async function requireEcoarAdmin(request: Request): Promise<{ userId: string } | Response> {
  const auth = await getAuthFromRequest(request)
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const ok = await isEcoarAdminUser(auth.userId)
  if (!ok) {
    return NextResponse.json({ error: 'Sem permissão para gerenciar singularidades' }, { status: 403 })
  }
  return { userId: auth.userId }
}
