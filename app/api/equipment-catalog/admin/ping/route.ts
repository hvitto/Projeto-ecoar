import { NextResponse } from 'next/server'
import { requireEquipmentAdmin } from '@/lib/isEquipmentAdmin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const gate = await requireEquipmentAdmin(request)
  if (gate instanceof Response) return gate
  return NextResponse.json({ ok: true })
}
