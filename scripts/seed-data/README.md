# Seed data (bootstrap)

Os arrays de conteúdo em `data/*.ts` existem **apenas** como fonte de bootstrap para:

- `yarn seed:reference`
- `yarn seed:catalog`
- `yarn seed:ecoar`
- `yarn seed:system`
- `yarn import:pdm`
- `yarn validate:parity`

O runtime do ecoar.dev **não** deve usar esses arrays como fallback. A fonte canônica em produção é o Neon (versão publicada / catálogo ativo).

Antes de apagar ou esvaziar `data/*.ts`:

1. `yarn validate:parity` exit 0
2. `yarn export:catalog` (backup em `backups/`)
3. Confirmar que o app sobe só com hydrate/API do banco

CSVs em `data/pdm/` permanecem até o Ecoar Studio ter round-trip de planilha.

Patronos (`path_patron`) e códigos de honra (`path_honor_code`) estão em `game_reference_catalog` — seed via `yarn seed:reference`.
