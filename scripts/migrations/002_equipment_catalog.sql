-- Catálogo de equipamentos editável (Neon). Aplicar manualmente ou via console.

CREATE TABLE IF NOT EXISTS equipment_catalog_items (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('weapon', 'armor', 'utility')),
  payload JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_catalog_items_kind ON equipment_catalog_items (kind);
CREATE INDEX IF NOT EXISTS idx_equipment_catalog_items_active ON equipment_catalog_items (is_active);

CREATE TABLE IF NOT EXISTS equipment_cost_multiplier_tables (
  id TEXT PRIMARY KEY DEFAULT 'default',
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
