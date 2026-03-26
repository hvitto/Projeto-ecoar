import { NextResponse } from 'next/server'
import { requireEcoarAdmin } from '@/lib/isEcoarAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const gate = await requireEcoarAdmin(request)
  if (gate instanceof Response) return gate
  return NextResponse.json({ ok: true })
}
