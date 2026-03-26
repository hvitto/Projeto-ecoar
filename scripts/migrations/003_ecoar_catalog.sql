-- Catálogo de Ecoar (normalizado)

CREATE TABLE IF NOT EXISTS ecoar_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  acquisition_requirement TEXT NOT NULL,
  acquisition_cost INTEGER NOT NULL CHECK (acquisition_cost >= 0),
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecoar_base_traits (
  id TEXT PRIMARY KEY,
  ecoar_id TEXT NOT NULL REFERENCES ecoar_catalog(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecoar_actions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecoar_singularities (
  id TEXT PRIMARY KEY,
  ecoar_id TEXT NOT NULL REFERENCES ecoar_catalog(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK (cost >= 0),
  tier SMALLINT,
  is_base BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecoar_singularity_requirements (
  id TEXT PRIMARY KEY,
  singularity_id TEXT NOT NULL REFERENCES ecoar_singularities(id) ON DELETE CASCADE,
  requirement_type TEXT NOT NULL,
  requirement_key TEXT,
  requirement_value TEXT NOT NULL,
  numeric_value INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecoar_singularity_effects (
  id TEXT PRIMARY KEY,
  singularity_id TEXT NOT NULL REFERENCES ecoar_singularities(id) ON DELETE CASCADE,
  effect_type TEXT NOT NULL,
  title TEXT,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ecoar_catalog_active ON ecoar_catalog (is_active);
CREATE INDEX IF NOT EXISTS idx_ecoar_singularities_ecoar ON ecoar_singularities (ecoar_id);
CREATE INDEX IF NOT EXISTS idx_ecoar_singularities_tier ON ecoar_singularities (tier);
CREATE INDEX IF NOT EXISTS idx_ecoar_singularities_active ON ecoar_singularities (is_active);
CREATE INDEX IF NOT EXISTS idx_ecoar_sing_req_singularity ON ecoar_singularity_requirements (singularity_id);
CREATE INDEX IF NOT EXISTS idx_ecoar_sing_effects_singularity ON ecoar_singularity_effects (singularity_id);
