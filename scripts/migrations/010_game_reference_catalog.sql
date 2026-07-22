CREATE TABLE IF NOT EXISTS game_reference_catalog (
  id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN (
    'race',
    'path',
    'skill',
    'aptitude',
    'location',
    'soul_level',
    'martial_school',
    'disturbio_gatilho',
    'disturbio_efeito',
    'disturbio_penalidade',
    'disturbio_comum',
    'ecoar_acao'
  )),
  payload JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (kind, id)
);

CREATE INDEX IF NOT EXISTS idx_game_reference_catalog_kind_active
  ON game_reference_catalog (kind, is_active);
