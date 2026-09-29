SELECT
  MIN(data_pedido) AS primeira_data,
  MAX(data_pedido) AS ultima_data,
  COUNT(*) AS total_linhas,
  COUNT(DISTINCT id_pedido) AS total_pedidos
FROM `aurora-analytics-portfolio.aurora_raw.vendas`;
