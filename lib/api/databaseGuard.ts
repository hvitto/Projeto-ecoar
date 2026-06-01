import { NextResponse } from 'next/server'
import { isDatabaseConfigured } from '@/lib/db'

const DB_UNAVAILABLE_HEADER = 'X-Ecoar-Database'

export function emptyListWhenDbUnavailable(): NextResponse | null {
  if (isDatabaseConfigured()) return null
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json([], {
      headers: { [DB_UNAVAILABLE_HEADER]: 'unavailable' },
    })
  }
  return NextResponse.json(
    { error: 'Banco de dados não configurado. Defina DATABASE_URL no servidor.' },
    { status: 503 },
  )
}

export function dbRequiredResponse(message: string): NextResponse | null {
  if (isDatabaseConfigured()) return null
  const error =
    process.env.NODE_ENV === 'development'
      ? `${message} Configure DATABASE_URL no .env.local (Neon) para persistir dados.`
      : message
  return NextResponse.json({ error }, { status: 503 })
}
