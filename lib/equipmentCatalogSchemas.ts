import { z } from 'zod'
import type { ArmorCatalogEntry, CatalogEntry, CostMultiplierTable, UtilityCatalogEntry, WeaponCatalogEntry } from '@/types/equipment'

const weaponMacroSectionId = z.enum([
  'intro',
  'corpo-a-corpo',
  'arqueria',
  'arremesso',
  'magicas',
  'municiadas',
  'artilharia',
  'cerco',
  'granadas',
  'explosivos',
])

const vestuarioTabId = z.enum(['armaduras', 'capacetes', 'acessorios'])

const detailSectionSchema = z.object({
  title: z.string(),
  body: z.string(),
})

const weaponCatalogEntrySchema = z
  .object({
    id: z.string().min(1),
    kind: z.literal('weapon'),
    name: z.string(),
    macroSection: weaponMacroSectionId,
    equipmentClass: z.string().optional(),
    category: z.string().optional(),
    durability: z.string().optional(),
    space: z.string().optional(),
    costLabel: z.string().optional(),
    attackTest: z.string().optional(),
    rangeNotes: z.string().optional(),
    damageNotes: z.string().optional(),
    classTraits: z.string().optional(),
    properties: z.array(z.string()).optional(),
    ammoCategory: z.string().optional(),
    ammoCostPerUnit: z.string().optional(),
    reloadNotes: z.string().optional(),
    capacity: z.string().optional(),
    technology: z.string().optional(),
    flavor: z.string().optional(),
    detailSections: z.array(detailSectionSchema).optional(),
  })
  .passthrough()

const armorCatalogEntrySchema = z
  .object({
    id: z.string().min(1),
    kind: z.literal('armor'),
    name: z.string(),
    vestuarioTab: vestuarioTabId,
    category: z.string().optional(),
    space: z.string().optional(),
    costLabel: z.string().optional(),
    resistances: z.string().optional(),
    defenseCritico: z.string().optional(),
    esquiva: z.string().optional(),
    furtividade: z.string().optional(),
    propriedades: z.array(z.string()).optional(),
    flavor: z.string().optional(),
    detailSections: z.array(detailSectionSchema).optional(),
  })
  .passthrough()

const utilityCatalogEntrySchema = z
  .object({
    id: z.string().min(1),
    kind: z.literal('utility'),
    name: z.string(),
    utilityCategory: z.string(),
    space: z.string().optional(),
    costLabel: z.string().optional(),
    charges: z.string().optional(),
    effect: z.string().optional(),
    flavor: z.string().optional(),
    detailSections: z.array(detailSectionSchema).optional(),
  })
  .passthrough()

const costMultiplierRowSchema = z.object({
  group: z.string(),
  reclusa: z.string(),
  vaporAlquimico: z.string(),
  darenferrum: z.string(),
  imaculada: z.string(),
  paginas: z.string(),
})

export const costMultiplierTablesSchema = z.array(
  z.object({
    id: z.enum(['weapons', 'clothing']),
    title: z.string(),
    rows: z.array(costMultiplierRowSchema),
  })
)

export function parseCatalogPayload(kind: 'weapon' | 'armor' | 'utility', payload: unknown): { ok: true; data: CatalogEntry } | { ok: false; error: string } {
  try {
    if (kind === 'weapon') {
      const r = weaponCatalogEntrySchema.safeParse(payload)
      if (!r.success) return { ok: false, error: r.error.message }
      return { ok: true, data: r.data as WeaponCatalogEntry }
    }
    if (kind === 'armor') {
      const r = armorCatalogEntrySchema.safeParse(payload)
      if (!r.success) return { ok: false, error: r.error.message }
      return { ok: true, data: r.data as ArmorCatalogEntry }
    }
    const r = utilityCatalogEntrySchema.safeParse(payload)
    if (!r.success) return { ok: false, error: r.error.message }
    return { ok: true, data: r.data as UtilityCatalogEntry }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Validação falhou' }
  }
}

export function parseMultiplierTables(payload: unknown): { ok: true; data: CostMultiplierTable[] } | { ok: false; error: string } {
  const r = costMultiplierTablesSchema.safeParse(payload)
  if (!r.success) return { ok: false, error: r.error.message }
  return { ok: true, data: r.data }
}
