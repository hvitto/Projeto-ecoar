import { NextResponse } from 'next/server'
import {
  getGameReferencePayloadFromDb,
  isGameReferenceSchemaMissing,
} from '@/lib/gameReferenceRepository'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getGameReferencePayloadFromDb()
    return NextResponse.json(payload)
  } catch (err) {
    if (isGameReferenceSchemaMissing(err)) {
      return NextResponse.json(
        {
          races: [],
          paths: [],
          skills: [],
          aptitudes: [],
          locations: [],
          soulLevels: [],
          martialSchools: [],
          disturbioGatilhos: [],
          disturbioEfeitos: [],
          disturbioPenalidades: [],
          disturbiosComuns: [],
          ecoarAcoes: [],
          source: 'empty',
          schemaMissing: true,
        },
        { status: 200 },
      )
    }
    console.error('GET game-reference:', err)
    return NextResponse.json({ error: 'Erro ao carregar referências' }, { status: 500 })
  }
}
