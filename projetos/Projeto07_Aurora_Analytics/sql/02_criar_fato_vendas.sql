CREATE OR REPLACE TABLE `aurora-analytics-portfolio.aurora_dw.fato_vendas`
CLUSTER BY id_cliente, id_produto, id_vendedor
AS
SELECT
  id_pedido,
  id_item_pedido,
  DATE(data_pedido) AS data_pedido,
  id_cliente,
  id_produto,
  id_vendedor,
  canal,
  forma_pagamento,
  CAST(quantidade AS INT64) AS quantidade,
  CAST(preco_unitario AS NUMERIC) AS preco_unitario,
  CAST(percentual_desconto AS NUMERIC) AS percentual_desconto,
  CAST(custo_unitario AS NUMERIC) AS custo_unitario,
  CAST(custo_frete AS NUMERIC) AS custo_frete,
  CAST(devolvido AS BOOL) AS devolvido,
  ROUND(quantidade * preco_unitario, 2) AS venda_bruta,
  ROUND(quantidade * preco_unitario * percentual_desconto, 2) AS valor_desconto,
  ROUND(quantidade * preco_unitario * (1 - percentual_desconto), 2) AS receita_liquida,
  ROUND(quantidade * custo_unitario, 2) AS custo_produto,
  ROUND(
    quantidade * preco_unitario * (1 - percentual_desconto)
    - quantidade * custo_unitario
    - custo_frete,
    2
  ) AS lucro_bruto
FROM `aurora-analytics-portfolio.aurora_raw.vendas`;
