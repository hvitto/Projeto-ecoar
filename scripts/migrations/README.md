# Migrations

Aplique as migrações manualmente no seu banco (ex.: Neon).

- **001_game_tables.sql**: Cria `game_tables` e `game_table_members`.
  - Se a tabela `characters` usar `id` como TEXT em vez de UUID, altere a linha do FK: use `character_id TEXT REFERENCES characters(id)` (e remova a referência a UUID para essa coluna).
