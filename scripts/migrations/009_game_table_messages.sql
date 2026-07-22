-- Chat / log de eventos da mesa (texto + rolagens)

CREATE TABLE IF NOT EXISTS game_table_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES game_tables(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'roll', 'system')),
  body TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_table_messages_table_created
  ON game_table_messages (table_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_game_table_messages_table_id_id
  ON game_table_messages (table_id, id);
