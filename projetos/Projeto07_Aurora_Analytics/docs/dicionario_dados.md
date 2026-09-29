# Dicionário de Dados

## fato_vendas

| Campo | Tipo | Descrição |
|---|---|---|
| id_pedido | STRING | Identificador do pedido |
| id_item_pedido | STRING | Identificador do item |
| data_pedido | DATE | Data da venda |
| id_cliente | STRING | Chave do cliente |
| id_produto | STRING | Chave do produto |
| id_vendedor | STRING | Chave do vendedor |
| canal | STRING | Canal comercial |
| forma_pagamento | STRING | Forma de pagamento |
| quantidade | INTEGER | Quantidade vendida |
| preco_unitario | NUMERIC | Preço unitário |
| percentual_desconto | NUMERIC | Percentual de desconto |
| custo_unitario | NUMERIC | Custo unitário |
| custo_frete | NUMERIC | Custo do frete |
| devolvido | BOOLEAN | Indicador de devolução |
| venda_bruta | NUMERIC | Venda antes dos descontos |
| valor_desconto | NUMERIC | Valor do desconto |
| receita_liquida | NUMERIC | Receita após desconto |
| custo_produto | NUMERIC | Custo total do produto |
| lucro_bruto | NUMERIC | Receita líquida menos custos |

## Dimensões

- `dim_data`
- `dim_cliente`
- `dim_produto`
- `dim_vendedor`
- `fato_metas`
