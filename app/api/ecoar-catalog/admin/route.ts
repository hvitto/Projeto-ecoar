import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isEcoarCatalogSchemaMissingError } from '@/lib/ecoarCatalogDbErrors'
import { requireEcoarAdmin } from '@/lib/isEcoarAdmin'

export const dynamic = 'force-dynamic'

type AdminSingularityRow = {
  id: string
  ecoar_id: string
  name: string
  description: string
  cost: number
  activation_type: 'passiva' | 'condicional' | 'complexa' | 'ativa' | null
  bonuses_simple: unknown
  is_active: boolean
  updated_at: string
}

export async function GET(request: Request) {
  const gate = await requireEcoarAdmin(request)
  if (gate instanceof Response) return gate
  try {
    const singularities = (await sql`
      SELECT id, ecoar_id, name, description, cost, activation_type, bonuses_simple, is_active, updated_at
      FROM ecoar_singularities
      ORDER BY ecoar_id, tier NULLS LAST, name
    `) as AdminSingularityRow[]
    return NextResponse.json({ singularities })
  } catch (err) {
    if (isEcoarCatalogSchemaMissingError(err)) {
      return NextResponse.json({
        singularities: [] as AdminSingularityRow[],
        schemaMissing: true as const,
        hint: 'Execute scripts/migrations/003_ecoar_catalog.sql e scripts/migrations/004_ecoar_singularity_activation.sql.',
      })
    }
    console.error('GET ecoar-catalog/admin:', err)
    return NextResponse.json({ error: 'Erro ao carregar singularidades (admin)' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const gate = await requireEcoarAdmin(request)
  if (gate instanceof Response) return gate
  try {
    const body = (await request.json()) as {
      id?: string
      name?: string
      description?: string
      activationType?: 'passiva' | 'condicional' | 'complexa' | 'ativa'
      bonuses?: {
        attributes?: Record<string, number>
        skills?: Record<string, number>
        corpo?: number
        mente?: number
        folego?: number
        mana?: number
      }
      isActive?: boolean
    }
    if (!body.id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    if (!body.name?.trim()) return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 })
    if (!body.description?.trim()) return NextResponse.json({ error: 'description é obrigatória' }, { status: 400 })
    const activationType = body.activationType ?? 'complexa'
    const bonusesSimple = body.bonuses ? JSON.stringify(body.bonuses) : null
    const rows = (await sql`
      UPDATE ecoar_singularities
      SET name = ${body.name.trim()},
          description = ${body.description.trim()},
          activation_type = ${activationType},
          bonuses_simple = ${bonusesSimple}::jsonb,
          is_active = ${body.isActive ?? true},
          updated_at = now()
      WHERE id = ${body.id}
      RETURNING id
    `) as Array<{ id: string }>
    if (rows.length === 0) return NextResponse.json({ error: 'Singularidade não encontrada' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (isEcoarCatalogSchemaMissingError(err)) {
      return NextResponse.json({ error: 'Schema do catálogo Ecoar ausente' }, { status: 400 })
    }
    console.error('PUT ecoar-catalog/admin:', err)
    return NextResponse.json({ error: 'Erro ao salvar singularidade' }, { status: 500 })
  }
}
