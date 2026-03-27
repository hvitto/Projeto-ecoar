-- Habilita singularidades raciais no catálogo unificado.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ecoar_singularities_system_type_check'
  ) THEN
    ALTER TABLE ecoar_singularities DROP CONSTRAINT ecoar_singularities_system_type_check;
  END IF;
END $$;

ALTER TABLE ecoar_singularities
  ADD CONSTRAINT ecoar_singularities_system_type_check
  CHECK (system_type IN ('ecoar', 'criacao', 'marcial', 'racial'));
