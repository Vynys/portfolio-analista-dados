# Validação dos dados demo

Este projeto utiliza exclusivamente dados sintéticos gerados por `scripts/generate-demo-data.mjs`.

A validação automática verifica:

- existência de volume suficiente para demonstrar os gráficos;
- presença de backlog e melhorias;
- consistência dos campos mínimos;
- existência de casos de SLA de primeiro atendimento rompido;
- existência de casos de SLA de resolução rompido.

Execute:

```bash
npm run validate
```

A geração é determinística, permitindo que o dashboard apresente os mesmos números após cada instalação.
