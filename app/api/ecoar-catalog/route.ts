import { NextResponse } from 'next/server'
import { isEcoarCatalogSchemaMissingError } from '@/lib/ecoarCatalogDbErrors'
import { getEcoarCatalogPayloadFromDb } from '@/lib/ecoarCatalogRepository'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getEcoarCatalogPayloadFromDb()
    if (!payload.ecoarTypes.length || !payload.ecoarSingularities.length) {
      return NextResponse.json(
        { error: 'Catálogo Ecoar vazio no banco. Rode yarn seed:ecoar e yarn seed:system.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ ...payload, source: 'database' as const })
  } catch (err) {
    if (isEcoarCatalogSchemaMissingError(err)) {
      return NextResponse.json(
        { error: 'Schema do catálogo Ecoar ausente. Aplique as migrations e seeds.' },
        { status: 503 },
      )
    }
    console.error('GET ecoar-catalog:', err)
    return NextResponse.json({ error: 'Erro ao carregar catálogo de Ecoar' }, { status: 500 })
  }
}
