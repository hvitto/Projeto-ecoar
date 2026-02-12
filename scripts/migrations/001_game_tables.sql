-- Mesas (ambientes de jogo)
-- Aplicar manualmente no Neon ou via ferramenta de migração.

CREATE TABLE IF NOT EXISTS game_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gm_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cover_image_url TEXT,
  next_session_at TIMESTAMPTZ,
  description TEXT,
  invite_token TEXT NOT NULL UNIQUE,
  invite_code TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_table_members (
  table_id UUID NOT NULL REFERENCES game_tables(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('gm', 'player')),
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (table_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_game_table_members_user ON game_table_members(user_id);
CREATE INDEX IF NOT EXISTS idx_game_tables_gm ON game_tables(gm_user_id);
CREATE INDEX IF NOT EXISTS idx_game_tables_invite_token ON game_tables(invite_token);
CREATE INDEX IF NOT EXISTS idx_game_tables_invite_code ON game_tables(invite_code);
