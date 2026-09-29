CREATE OR REPLACE TABLE `aurora-analytics-portfolio.aurora_dw.dim_data` AS
WITH limites AS (
  SELECT MIN(data_pedido) AS data_minima, MAX(data_pedido) AS data_maxima
  FROM `aurora-analytics-portfolio.aurora_raw.vendas`
)
SELECT
  d AS data,
  EXTRACT(YEAR FROM d) AS ano,
  EXTRACT(QUARTER FROM d) AS numero_trimestre,
  CONCAT('T', CAST(EXTRACT(QUARTER FROM d) AS STRING)) AS trimestre,
  EXTRACT(MONTH FROM d) AS numero_mes,
  FORMAT_DATE('%Y-%m', d) AS ano_mes,
  EXTRACT(YEAR FROM d) * 100 + EXTRACT(MONTH FROM d) AS ordem_ano_mes,
  EXTRACT(ISOWEEK FROM d) AS semana_iso,
  EXTRACT(DAY FROM d) AS dia_mes
FROM limites,
UNNEST(GENERATE_DATE_ARRAY(data_minima, data_maxima)) AS d;
