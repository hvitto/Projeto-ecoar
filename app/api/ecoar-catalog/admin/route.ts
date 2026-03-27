import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isEcoarCatalogSchemaMissingError } from '@/lib/ecoarCatalogDbErrors'
import { requireEcoarAdmin } from '@/lib/isEcoarAdmin'

export const dynamic = 'force-dynamic'

type AdminSingularityRow = {
  id: string
  ecoar_id: string | null
  system_type: 'ecoar' | 'criacao' | 'marcial' | 'racial' | null
  source_group: string | null
  name: string
  description: string
  cost: number
  activation_type: 'passiva' | 'condicional' | 'complexa' | 'ativa' | null
  bonuses_simple: unknown
  is_active: boolean
  updated_at: string
}

function normalizeActivationType(
  value: AdminSingularityRow['activation_type'],
): 'passiva' | 'condicional' | 'complexa' | 'ativa' {
  if (value === 'passiva' || value === 'condicional' || value === 'complexa' || value === 'ativa') {
    return value
  }
  return 'complexa'
}

export async function GET(request: Request) {
  const gate = await requireEcoarAdmin(request)
  if (gate instanceof Response) return gate
  try {
    const rows = (await sql`
      SELECT id, ecoar_id, system_type, source_group, name, description, cost, activation_type, bonuses_simple, is_active, updated_at
      FROM ecoar_singularities
      ORDER BY system_type NULLS LAST, source_group NULLS LAST, ecoar_id NULLS LAST, tier NULLS LAST, name
    `) as AdminSingularityRow[]
    const singularities = rows.map((row) => ({
      id: row.id,
      ecoarId: row.ecoar_id ?? row.source_group ?? `sistema-${row.system_type ?? 'ecoar'}`,
      systemType: row.system_type ?? 'ecoar',
      sourceGroup: row.source_group ?? undefined,
      name: row.name,
      description: row.description,
      cost: row.cost,
      activationType: normalizeActivationType(row.activation_type),
      bonuses: row.bonuses_simple,
      isActive: row.is_active,
      updatedAt: row.updated_at,
    }))
    const normalizedCount = singularities.length
    return NextResponse.json({
      singularities,
      count: normalizedCount,
      rawCount: rows.length,
      normalizedCount,
      hasValidRows: normalizedCount > 0,
      schemaMissing: false as const,
    })
  } catch (err) {
    if (isEcoarCatalogSchemaMissingError(err)) {
      return NextResponse.json({
        singularities: [] as AdminSingularityRow[],
        count: 0,
        rawCount: 0,
        normalizedCount: 0,
        hasValidRows: false as const,
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
      ecoarId?: string
      systemType?: 'ecoar' | 'criacao' | 'marcial' | 'racial'
      cost?: number
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
    if (!body.ecoarId?.trim()) return NextResponse.json({ error: 'ecoarId é obrigatório' }, { status: 400 })
    const activationType = body.activationType ?? 'complexa'
    const bonusesSimple = body.bonuses ? JSON.stringify(body.bonuses) : null
    const systemType = body.systemType ?? 'ecoar'
    await sql`
      INSERT INTO ecoar_catalog (id, name, type, acquisition_requirement, acquisition_cost, description, is_active, updated_at)
      VALUES (${body.ecoarId.trim()}, ${body.ecoarId.trim()}, ${systemType}, ${'catálogo-admin'}, 0, ${`Agrupador ${systemType}`}, true, now())
      ON CONFLICT (id) DO NOTHING
    `
    const rows = (await sql`
      UPDATE ecoar_singularities
      SET ecoar_id = ${body.ecoarId.trim()},
          system_type = ${systemType},
          source_group = ${body.ecoarId.trim()},
          name = ${body.name.trim()},
          description = ${body.description.trim()},
          cost = ${Math.max(0, Math.trunc(body.cost ?? 0))},
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

export async function POST(request: Request) {
  const gate = await requireEcoarAdmin(request)
  if (gate instanceof Response) return gate
  try {
    const body = (await request.json()) as {
      id?: string
      ecoarId?: string
      systemType?: 'ecoar' | 'criacao' | 'marcial' | 'racial'
      name?: string
      description?: string
      cost?: number
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
    if (!body.id?.trim()) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    if (!body.name?.trim()) return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 })
    if (!body.description?.trim()) return NextResponse.json({ error: 'description é obrigatória' }, { status: 400 })
    if (!body.ecoarId?.trim()) return NextResponse.json({ error: 'ecoarId é obrigatório' }, { status: 400 })
    const activationType = body.activationType ?? 'complexa'
    const bonusesSimple = body.bonuses ? JSON.stringify(body.bonuses) : null
    const systemType = body.systemType ?? 'ecoar'
    const cost = Math.max(0, Math.trunc(body.cost ?? 0))
    await sql`
      INSERT INTO ecoar_catalog (id, name, type, acquisition_requirement, acquisition_cost, description, is_active, updated_at)
      VALUES (${body.ecoarId.trim()}, ${body.ecoarId.trim()}, ${systemType}, ${'catálogo-admin'}, 0, ${`Agrupador ${systemType}`}, true, now())
      ON CONFLICT (id) DO NOTHING
    `
    const rows = (await sql`
      INSERT INTO ecoar_singularities (id, ecoar_id, system_type, source_group, name, description, cost, tier, activation_type, bonuses_simple, is_base, is_active, updated_at)
      VALUES (
        ${body.id.trim()},
        ${body.ecoarId.trim()},
        ${systemType},
        ${body.ecoarId.trim()},
        ${body.name.trim()},
        ${body.description.trim()},
        ${cost},
        null,
        ${activationType},
        ${bonusesSimple}::jsonb,
        false,
        ${body.isActive ?? true},
        now()
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `) as Array<{ id: string }>
    if (rows.length === 0) return NextResponse.json({ error: 'ID já existe' }, { status: 409 })
    return NextResponse.json({ ok: true, id: rows[0].id })
  } catch (err) {
    if (isEcoarCatalogSchemaMissingError(err)) {
      return NextResponse.json({ error: 'Schema do catálogo Ecoar ausente' }, { status: 400 })
    }
    console.error('POST ecoar-catalog/admin:', err)
    return NextResponse.json({ error: 'Erro ao criar singularidade' }, { status: 500 })
  }
}
