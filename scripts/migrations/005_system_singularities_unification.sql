-- Unifica singularidades de Ecoar, Criação e Marciais
-- em uma única tabela administrativa.

ALTER TABLE ecoar_singularities
  ALTER COLUMN ecoar_id DROP NOT NULL;

ALTER TABLE ecoar_singularities
  ADD COLUMN IF NOT EXISTS system_type TEXT NOT NULL DEFAULT 'ecoar';

ALTER TABLE ecoar_singularities
  ADD COLUMN IF NOT EXISTS source_group TEXT;

ALTER TABLE ecoar_singularities
  ADD COLUMN IF NOT EXISTS source_meta JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ecoar_singularities_system_type_check'
  ) THEN
    ALTER TABLE ecoar_singularities
      ADD CONSTRAINT ecoar_singularities_system_type_check
      CHECK (system_type IN ('ecoar', 'criacao', 'marcial'));
  END IF;
END $$;

UPDATE ecoar_singularities
SET system_type = COALESCE(system_type, 'ecoar')
WHERE system_type IS NULL;

UPDATE ecoar_singularities
SET source_group = COALESCE(source_group, ecoar_id, 'ecoar')
WHERE source_group IS NULL;

CREATE INDEX IF NOT EXISTS idx_ecoar_singularities_system_type
  ON ecoar_singularities (system_type);

CREATE INDEX IF NOT EXISTS idx_ecoar_singularities_source_group
  ON ecoar_singularities (source_group);
