SELECT
  MIN(data_pedido) AS primeira_data,
  MAX(data_pedido) AS ultima_data,
  COUNT(*) AS total_linhas,
  COUNT(DISTINCT id_pedido) AS total_pedidos,
  ROUND(SUM(receita_liquida), 2) AS receita_total,
  ROUND(SUM(lucro_bruto), 2) AS lucro_bruto,
  ROUND(SAFE_DIVIDE(SUM(lucro_bruto), SUM(receita_liquida)) * 100, 2) AS margem_bruta_pct
FROM `aurora-analytics-portfolio.aurora_dw.fato_vendas`;
