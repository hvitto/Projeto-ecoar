-- Corrige custos das singularidades marciais para a progressão oficial.
-- Idempotente: pode ser executada múltiplas vezes sem efeito colateral.

WITH official_costs(level, cost) AS (
  VALUES
    (1, 25),
    (2, 5),
    (3, 10),
    (4, 15),
    (5, 20),
    (6, 30),
    (7, 55),
    (8, 35),
    (9, 40),
    (10, 45),
    (11, 50),
    (12, 60)
),
martial_levels AS (
  SELECT
    es.id,
    COALESCE(
      NULLIF((es.source_meta ->> 'level')::int, 0),
      NULLIF(substring(es.id FROM '([0-9]+)$'), '')::int
    ) AS level
  FROM ecoar_singularities es
  WHERE es.system_type = 'marcial'
)
UPDATE ecoar_singularities es
SET cost = oc.cost,
    updated_at = now()
FROM martial_levels ml
JOIN official_costs oc ON oc.level = ml.level
WHERE es.id = ml.id
  AND es.cost IS DISTINCT FROM oc.cost;
