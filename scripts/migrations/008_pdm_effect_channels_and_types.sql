ALTER TABLE ecoar_singularities
  ADD COLUMN IF NOT EXISTS effect_channels JSONB;

ALTER TABLE ecoar_singularities
  DROP CONSTRAINT IF EXISTS ecoar_singularities_cost_check;

ALTER TABLE ecoar_singularities
  DROP CONSTRAINT IF EXISTS ecoar_singularities_system_type_check;

ALTER TABLE ecoar_singularities
  ADD CONSTRAINT ecoar_singularities_system_type_check
  CHECK (system_type IN ('ecoar', 'criacao', 'marcial', 'racial', 'desvantagem', 'tag', 'path'));

CREATE INDEX IF NOT EXISTS idx_ecoar_singularities_effect_channels
  ON ecoar_singularities USING GIN (effect_channels);
