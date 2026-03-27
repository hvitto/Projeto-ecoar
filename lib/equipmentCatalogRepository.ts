import { sql } from '@/lib/db'
import type { ArmorCatalogEntry, CatalogEntry, CostMultiplierTable, UtilityCatalogEntry, WeaponCatalogEntry } from '@/types/equipment'
import { equipmentCostMultiplierTables } from '@/data/equipment/costMultipliers'

export const EQUIPMENT_MULTIPLIER_ROW_ID = 'default'

export type EquipmentCatalogItemRow = {
  id: string
  kind: 'weapon' | 'armor' | 'utility'
  payload: CatalogEntry
  is_active: boolean
  updated_at: string
}

function rowPayload(row: { payload: unknown }): CatalogEntry {
  return row.payload as CatalogEntry
}

export async function listActiveCatalogItems(): Promise<EquipmentCatalogItemRow[]> {
  const rows = (await sql`
    SELECT id, kind, payload, is_active, updated_at
    FROM equipment_catalog_items
    WHERE is_active = true
    ORDER BY kind, id
  `) as Array<{
    id: string
    kind: string
    payload: unknown
    is_active: boolean
    updated_at: string
  }>
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind as 'weapon' | 'armor' | 'utility',
    payload: rowPayload(r),
    is_active: r.is_active,
    updated_at: r.updated_at,
  }))
}

export async function listAllCatalogItemsForAdmin(): Promise<EquipmentCatalogItemRow[]> {
  const rows = (await sql`
    SELECT id, kind, payload, is_active, updated_at
    FROM equipment_catalog_items
    ORDER BY kind, id
  `) as Array<{
    id: string
    kind: string
    payload: unknown
    is_active: boolean
    updated_at: string
  }>
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind as 'weapon' | 'armor' | 'utility',
    payload: rowPayload(r),
    is_active: r.is_active,
    updated_at: r.updated_at,
  }))
}

export async function getCatalogItemById(id: string): Promise<EquipmentCatalogItemRow | null> {
  const rows = (await sql`
    SELECT id, kind, payload, is_active, updated_at
    FROM equipment_catalog_items
    WHERE id = ${id}
    LIMIT 1
  `) as Array<{
    id: string
    kind: string
    payload: unknown
    is_active: boolean
    updated_at: string
  }>
  if (rows.length === 0) return null
  const r = rows[0]
  return {
    id: r.id,
    kind: r.kind as 'weapon' | 'armor' | 'utility',
    payload: rowPayload(r),
    is_active: r.is_active,
    updated_at: r.updated_at,
  }
}

export async function upsertCatalogItem(
  id: string,
  kind: 'weapon' | 'armor' | 'utility',
  payload: CatalogEntry,
  isActive: boolean
): Promise<void> {
  const json = JSON.stringify(payload)
  await sql`
    INSERT INTO equipment_catalog_items (id, kind, payload, is_active, updated_at)
    VALUES (${id}, ${kind}, ${json}::jsonb, ${isActive}, now())
    ON CONFLICT (id) DO UPDATE SET
      kind = EXCLUDED.kind,
      payload = EXCLUDED.payload,
      is_active = EXCLUDED.is_active,
      updated_at = now()
  `
}

export async function setCatalogItemActive(id: string, isActive: boolean): Promise<boolean> {
  const result = (await sql`
    UPDATE equipment_catalog_items
    SET is_active = ${isActive}, updated_at = now()
    WHERE id = ${id}
    RETURNING id
  `) as Array<{ id: string }>
  return result.length > 0
}

/** Soft delete: desativa o item. */
export async function softDeleteCatalogItem(id: string): Promise<boolean> {
  return setCatalogItemActive(id, false)
}

export async function getMultiplierTablesFromDb(): Promise<CostMultiplierTable[] | null> {
  const rows = (await sql`
    SELECT payload FROM equipment_cost_multiplier_tables
    WHERE id = ${EQUIPMENT_MULTIPLIER_ROW_ID}
    LIMIT 1
  `) as Array<{ payload: unknown }>
  if (rows.length === 0) return null
  const raw = rows[0].payload
  if (!Array.isArray(raw)) return null
  return raw as CostMultiplierTable[]
}

export async function setMultiplierTablesInDb(tables: CostMultiplierTable[]): Promise<void> {
  const json = JSON.stringify(tables)
  await sql`
    INSERT INTO equipment_cost_multiplier_tables (id, payload, updated_at)
    VALUES (${EQUIPMENT_MULTIPLIER_ROW_ID}, ${json}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = now()
  `
}

export function defaultMultiplierTables(): CostMultiplierTable[] {
  return equipmentCostMultiplierTables
}

function normalizeWeaponPayload(p: WeaponCatalogEntry): WeaponCatalogEntry {
  return {
    ...p,
    kind: 'weapon',
    properties: Array.isArray(p.properties) ? p.properties : [],
  }
}

function normalizeArmorPayload(p: ArmorCatalogEntry): ArmorCatalogEntry {
  return {
    ...p,
    kind: 'armor',
    propriedades: Array.isArray(p.propriedades) ? p.propriedades : [],
  }
}

export function splitItemsByKind(items: EquipmentCatalogItemRow[]): {
  weapons: WeaponCatalogEntry[]
  armor: ArmorCatalogEntry[]
  utilities: UtilityCatalogEntry[]
} {
  const weapons: WeaponCatalogEntry[] = []
  const armor: ArmorCatalogEntry[] = []
  const utilities: UtilityCatalogEntry[] = []
  for (const row of items) {
    if (row.kind === 'weapon') weapons.push(normalizeWeaponPayload(row.payload as WeaponCatalogEntry))
    else if (row.kind === 'armor') armor.push(normalizeArmorPayload(row.payload as ArmorCatalogEntry))
    else utilities.push(row.payload as UtilityCatalogEntry)
  }
  return { weapons, armor, utilities }
}

export async function countActiveCatalogItems(): Promise<number> {
  const rows = (await sql`
    SELECT count(*)::int AS c FROM equipment_catalog_items WHERE is_active = true
  `) as Array<{ c: number }>
  return rows[0]?.c ?? 0
}
