import { NextResponse } from 'next/server'
import { isEcoarCatalogSchemaMissingError } from '@/lib/ecoarCatalogDbErrors'
import { getEcoarCatalogFallbackPayload, getEcoarCatalogPayloadFromDb } from '@/lib/ecoarCatalogRepository'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getEcoarCatalogPayloadFromDb()
    if (!payload.ecoarTypes.length || !payload.ecoarSingularities.length) {
      const fallback = getEcoarCatalogFallbackPayload()
      return NextResponse.json({ ...fallback, source: 'fallback' as const })
    }
    return NextResponse.json({ ...payload, source: 'database' as const })
  } catch (err) {
    if (isEcoarCatalogSchemaMissingError(err)) {
      const fallback = getEcoarCatalogFallbackPayload()
      return NextResponse.json({ ...fallback, source: 'fallback' as const, schemaMissing: true as const })
    }
    console.error('GET ecoar-catalog:', err)
    return NextResponse.json({ error: 'Erro ao carregar catálogo de Ecoar' }, { status: 500 })
  }
}
