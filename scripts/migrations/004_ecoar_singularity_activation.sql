-- Expande singularidades Ecoar para suportar classificação de ativação
-- e bônus simples computáveis na ficha.

ALTER TABLE ecoar_singularities
  ADD COLUMN IF NOT EXISTS activation_type TEXT;

ALTER TABLE ecoar_singularities
  ADD COLUMN IF NOT EXISTS bonuses_simple JSONB;

UPDATE ecoar_singularities
SET activation_type = 'complexa'
WHERE activation_type IS NULL;

ALTER TABLE ecoar_singularities
  ALTER COLUMN activation_type SET DEFAULT 'complexa';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ecoar_singularities_activation_type_check'
  ) THEN
    ALTER TABLE ecoar_singularities
      ADD CONSTRAINT ecoar_singularities_activation_type_check
      CHECK (activation_type IN ('passiva', 'condicional', 'complexa', 'ativa'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ecoar_singularities_activation_type
  ON ecoar_singularities (activation_type);
