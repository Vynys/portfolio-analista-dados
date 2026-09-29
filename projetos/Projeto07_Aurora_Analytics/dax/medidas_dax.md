# Medidas DAX — Aurora Analytics

```DAX
Receita Total =
SUM ( fato_vendas[receita_liquida] )
```

```DAX
Lucro Bruto =
SUM ( fato_vendas[lucro_bruto] )
```

```DAX
Margem Bruta % =
DIVIDE ( [Lucro Bruto], [Receita Total] )
```

```DAX
Pedidos =
DISTINCTCOUNT ( fato_vendas[id_pedido] )
```

```DAX
Ticket Médio =
DIVIDE ( [Receita Total], [Pedidos] )
```

```DAX
_Data Referência Comparação =
MAX ( dim_data[data] )
```

```DAX
_Texto Período Comparação =
"vs. p. do mês ant."
```

> O relatório usa medidas adicionais para comparação mensal de Receita, Lucro, Margem, Pedidos e Ticket Médio com cores condicionais.
