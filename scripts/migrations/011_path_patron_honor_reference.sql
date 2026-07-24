ALTER TABLE game_reference_catalog DROP CONSTRAINT IF EXISTS game_reference_catalog_kind_check;

ALTER TABLE game_reference_catalog
  ADD CONSTRAINT game_reference_catalog_kind_check
  CHECK (kind IN (
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
    'ecoar_acao',
    'path_patron',
    'path_honor_code'
  ));
