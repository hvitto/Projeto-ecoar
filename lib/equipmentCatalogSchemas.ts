import { z } from 'zod'
import type { ArmorCatalogEntry, CatalogEntry, CostMultiplierTable, UtilityCatalogEntry, WeaponCatalogEntry } from '@/shared/types/equipment'

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

const armorResistanceKeyEnum = z.enum([
  'contundente',
  'cortante',
  'perfurante',
  'balistico',
  'esmagador',
  'explosivo',
  'ardente',
  'congelante',
  'eletrico',
  'corrosivo',
  'magico',
  'toxico',
])

const weaponDamageEntrySchema = z.object({
  type: armorResistanceKeyEnum,
  amount: z.coerce.number(),
})

const armorResistancesSchema = z.object({
  contundente: z.coerce.number(),
  cortante: z.coerce.number(),
  perfurante: z.coerce.number(),
  balistico: z.coerce.number(),
  esmagador: z.coerce.number(),
  explosivo: z.coerce.number(),
  ardente: z.coerce.number(),
  congelante: z.coerce.number(),
  eletrico: z.coerce.number(),
  corrosivo: z.coerce.number(),
  magico: z.coerce.number(),
  toxico: z.coerce.number(),
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
    evasionTest: z.string().optional(),
    rangeNotes: z.string().optional(),
    rangeDisadvantageNear: z.string().optional(),
    rangeEffective: z.string().optional(),
    rangeDisadvantageFar: z.string().optional(),
    damageEntries: z.array(weaponDamageEntrySchema).optional(),
    damageNotes: z.string().optional(),
    classTraits: z.string().optional(),
    classTraitCrit: z.string().optional(),
    classTraitTargets: z.string().optional(),
    classTraitMaxDamage: z.string().optional(),
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
    name: z.string().min(1),
    vestuarioTab: vestuarioTabId,
    category: z.string().min(1),
    space: z.string().min(1),
    costLabel: z.string().min(1),
    resistances: armorResistancesSchema,
    defenseCritico: z.string().min(1),
    esquiva: z.string().min(1),
    furtividade: z.string().min(1),
    propriedades: z.array(z.string()),
    flavor: z.string().min(1),
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
