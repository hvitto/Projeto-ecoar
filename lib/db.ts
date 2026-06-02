// Client Neon único. Não abrir outro sql nas features.
import { neon } from '@neondatabase/serverless'

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}

let _sql: ReturnType<typeof neon> | null = null

function getSql(): ReturnType<typeof neon> {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) throw new Error('DATABASE_URL is not set')
    _sql = neon(connectionString)
  }
  return _sql
}

export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  getSql()(strings, ...values)) as ReturnType<typeof neon>
