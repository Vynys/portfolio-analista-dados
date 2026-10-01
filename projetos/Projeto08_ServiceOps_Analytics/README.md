# ServiceOps Analytics Dashboard

Dashboard operacional interativo desenvolvido como **projeto pessoal de portfólio**, com foco em análise de operações de TI, experiência visual, performance e exploração de dados.

> **Aviso:** todos os dados, chamados, responsáveis e indicadores deste repositório são **100% sintéticos** e gerados automaticamente. O projeto não representa nem utiliza dados de nenhuma empresa real.

## Destaques

- Visão geral com KPIs de volume, horas, TMA, TMR e SLA.
- Análise diária e semanal de demandas.
- Cross-filter: clicar em barras, pontos, cards e fatias filtra toda a seção relacionada.
- Backlog com aging, status e detalhamento.
- Comparativo entre plataformas operacionais.
- SLA de primeiro atendimento e SLA de resolução.
- Identificação e detalhamento de chamados que romperam SLA.
- Drill-down de KPIs em tabelas completas.
- Filtros individuais por coluna nas tabelas.
- Gráficos interativos com Chart.js.
- Layout responsivo e otimizado para diferentes resoluções.
- Dados demo gerados deterministicamente para facilitar testes e demonstrações.

## Stack

- HTML5
- CSS3
- JavaScript ES Modules
- Vite
- Chart.js
- Inter Variable

## Executar localmente

Requisitos: Node.js 20+.

```bash
npm install
npm run dev
```

O projeto gera automaticamente uma base sintética antes de iniciar.

Para regenerar manualmente os dados:

```bash
npm run refresh-demo
```

Para validar a base demo:

```bash
npm run validate
```

Para gerar a versão de produção:

```bash
npm run build
```

## Dados sintéticos

O script `scripts/generate-demo-data.mjs` cria uma base determinística com:

- 4 semanas de histórico;
- incidentes, requisições, mudanças e registros de horas;
- prioridades P1–P4;
- plataformas CORE, INTEGRATION, CONTAINERS, API-GW e HML;
- tempos de atendimento e resolução;
- casos dentro e fora do SLA;
- backlog aberto;
- iniciativas de melhoria.

Os arquivos gerados ficam em `public/data-cache/`.

## Estrutura

```text
ServiceOps-Analytics-Dashboard/
├── public/
│   └── data-cache/
├── scripts/
│   ├── generate-demo-data.mjs
│   └── validate-demo-data.mjs
├── src/
│   ├── data.js
│   ├── main.js
│   ├── metrics.js
│   └── styles.css
├── index.html
├── package.json
└── vite.config.js
```

## Funcionalidades de análise

### Visão geral
Resumo executivo com histórico, distribuição por tipo e comparação entre períodos.

### Demandas
Análise por dia da semana selecionada, prioridade, TMA, TMR e SLAs.

### Backlog
Volume aberto, aging, status e chamados acima de 7 dias.

### Ambientes
Comparação entre plataformas com volume, horas, SLA, TMA, TMR e evolução histórica.

### Melhorias
Acompanhamento de iniciativas, status, responsáveis, previsão e evolução mensal.

## Objetivo do projeto

Este projeto foi criado para demonstrar competências em:

- desenvolvimento frontend;
- data visualization;
- modelagem de indicadores operacionais;
- UX para dashboards;
- tratamento e agregação de dados;
- otimização de performance no navegador;
- construção de filtros e drill-downs interativos.

## Publicação

Consulte [`GITHUB_PUBLISH_GUIDE.md`](./GITHUB_PUBLISH_GUIDE.md) para o passo a passo de publicação no GitHub e deploy.

## Licença

MIT. Consulte [`LICENSE`](./LICENSE).
