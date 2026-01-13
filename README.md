# Portfólio — Vinicius da Costa Soares

Showcase de projetos em Power BI, DAX, SQL e Python, com foco em resolver problemas de negócio de ponta a ponta (coleta → modelagem → visualização).

Linkedin: https://www.linkedin.com/in/vinicius-soares-5885b4215/

[![MIT](https://img.shields.io/badge/License-MIT-green.svg)](#)
[![Power BI](https://img.shields.io/badge/Power%20BI-Reports-yellow)](#)
[![Python](https://img.shields.io/badge/Python-3.x-blue)](#)

![powerbigif](https://github.com/user-attachments/assets/7dbad7a9-c475-4de1-90e5-53bd59e7ef8c) 



## Sumário

- [Projeto 01 — Dashboard no Power BI](#-projeto-01--dashboard-no-power-bi)
- [Projeto 02 — Dashboard de Indicadores](#-projeto-02--dashboard-de-indicadores)
- [Projeto 03 — Dashboard com Python](#-projeto-03--dashboard-com-python)
- [Projeto 04 — Desafio Técnico BI Jr (JAAR Consult)](#-projeto-04--desafio-técnico-bi-jr-jaar-consult)
- [Projeto 05 — SQL (PostgreSQL) | Vendas e Funil](#-projeto-05--sql-postgresql--vendas-e-funil)
- [Projeto 06 — SQL (PostgreSQL) | Perfil dos Leads](#-projeto-06--sql-postgresql--perfil-dos-leads)

## 🧭 Visão rápida (tabela resumo)

| # | Projeto | Tema | Stack | Técnicas-chave | Links |
|---|---|---|---|---|---|
| 01 | 📊 Dashboard no Power BI | RH: funcionários, dependentes e salários | Power BI • Excel/CSV | Modelagem • KPIs • Segmentações (cargo/setor/UF) | 📁 [Pasta](projetos/Projeto1_Func/) • 📄 [Relatório](projetos/Projeto1_Func/relatorio/Projeto1_Func.docx) |
| 02 | 📈 Dashboard de Indicadores | KPIs e metas (visão executiva) | Power BI • DAX • Excel/CSV | DAX • KPIs • Análise de desvios vs meta | 📁 [Pasta](projetos/Projeto2_Case/) • 📄 [Dashboard](projetos/Projeto2_Case/relatorio/Projeto02-%20DashboarddeIndicadores.docx) • 🧾 [Case](projetos/Projeto2_Case/relatorio/Case%20Anal%C3%ADtico.docx) |
| 03 | 🐍 Dashboard com Python | Financeiro: coleta/atualização e dashboard | Python • Pandas • yfinance • Power BI | ETL em Python • Integração Python ↔ Power BI • Automação | 📁 [Pasta](projetos/Projeto3_Case/) • 📄 [Relatório](projetos/Projeto3_Case/relatorio/Doc_DashPython.docx) |
| 04 | 🏆 Desafio Técnico BI Jr (JAAR) | Vendas: análise, storytelling e governança | Power BI • DAX | Star Schema • Time Intelligence • RLS • Storytelling | 📁 [Pasta](projetos/Projeto4_Case/) • 📄 [Relatório](projetos/Projeto4_Case/relatorio/) |
| 05 | 🗄️ SQL (PostgreSQL) \| Vendas e Funil | KPI mensal + rankings (estado/marca/loja) | PostgreSQL • pgAdmin • Excel | CTEs • Joins • `date_trunc` • KPIs no banco | 📁 [Pasta](projetos/Projeto5_Case/) • 📄 [PDF](projetos/Projeto5_Case/assets/Projeto%20-%20DashboardDeVendas.pdf) • 📊 [Excel](projetos/Projeto5_Case/files/Projeto%20-%20DashboardDeVendas.xlsx) • 🧾 [Relatório SQL](projetos/Projeto5_Case/files/Projeto05_Relatorio_SQL_Queries.txt) |
| 06 | 🧠 SQL (PostgreSQL) \| Perfil dos Leads | Segmentação e distribuição (%) de leads | PostgreSQL • pgAdmin • Excel | CASE WHEN • Percentuais • Classificações • Ranking por marca | 📁 [Pasta](projetos/Projeto6_Case/) • 📄 [PDF](projetos/Projeto6_Case/assets/Projeto%20-%20PerfilDosLeads.pdf) • 📊 [Excel](projetos/Projeto6_Case/files/Projeto%20-%20PerfilDosLeads.xlsx) • 🧾 [Relatório SQL](projetos/Projeto6_Case/files/Projeto06_Relatorio_SQL_Queries.txt) |


---

# 🗂 Projeto 01 — **Dashboard no Power BI**

## 🎯 Objetivos do Case

- Consolidar as principais informações de **funcionários, dependentes e salários** em um único dashboard.
- Garantir uma modelagem de dados consistente, com relacionamentos corretos entre tabelas.
- Criar **KPIs estratégicos** (Total de Funcionários, Funcionários com Dependentes e Total de Salários).
- Disponibilizar análises por **cargo, setor e localidade**, permitindo diferentes perspectivas da base de dados.
- Fornecer uma visão clara, visual e interativa para apoiar a tomada de decisão.

### 📷 Preview  
![dash1](https://github.com/user-attachments/assets/d75e6227-a728-45c8-9002-dd73b2424400)

<img width="1528" height="846" alt="Projeto1_Func" src="https://github.com/user-attachments/assets/60a50770-3395-481f-99a7-17b2ceea3d1d" />


## 🚀 Tecnologias Utilizadas

- **Power BI Desktop**  
- **Excel / CSV**  
- **Git & GitHub** para versionamento  

## 📊 Resultados e 💡 Insights

- Criação de um **dashboard interativo no Power BI** consolidando funcionários, dependentes e salários.  
- Implementação de **KPIs chave** (Total de Funcionários, Funcionários com Dependentes e Total de Salários).  
- Análise por **cargo, setor e localidade (UF)**, permitindo diferentes perspectivas da base.  

## 📖 Relatório 
- Link para o relatório completo : https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto1_Func/relatorio/Projeto1_Func.docx

---

# 🗂 Projeto 02 - Dashboard de Indicadores

## 🎯 Objetivos do Case
- Centralizar os principais **indicadores de desempenho (KPIs)**.  
- Identificar pontos abaixo da meta e sugerir melhorias.  
- Apresentar os resultados de forma clara e visual.  

## 📷 Preview  
![dash2](https://github.com/user-attachments/assets/f0d744b2-3fd2-4948-a576-230dee73a121)

<img width="1432" height="702" alt="image" src="https://github.com/user-attachments/assets/c76b3e06-0f85-40dd-b637-97ef03ad757c" />

## 🚀 Tecnologias Utilizadas
- **Power BI Desktop**  
- **Excel / CSV**  
- **DAX** para criação de métricas e KPIs  
- **Git & GitHub** para versionamento  

## 📊 Resultados e 💡 Insights
- Identificação dos KPIs abaixo da meta.
- Visualização clara de desempenho por categoria/segmento. 
- Base para recomendações estratégicas de melhoria.

## 📖 Relatório 
- Link para o relatório completo: https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto2_Case/relatorio/Projeto02-%20DashboarddeIndicadores.docx
- Link para o Case Analítico: https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto2_Case/relatorio/Case%20Anal%C3%ADtico.docx

---

# 🗂 Projeto 03 - Dashboard com Python

## 🎯 Objetivos do Case
- Integrar Python e Power BI em um fluxo analítico.
- Automatizar a coleta e atualização de dados financeiros.
- Criar um dashboard em tempo real para análise de ações.
- Demonstrar aplicação prática de scripts Python dentro do Power BI.

## 📷 Preview 
![Animação](https://github.com/user-attachments/assets/25928a0c-fb00-4fda-84cc-7c677576f121)

<img width="1275" height="718" alt="image" src="https://github.com/user-attachments/assets/9b45f3e5-ce6c-4e9c-993f-41ba73837b4b" />

## 🚀 Tecnologias Utilizadas
- Python 3.x
- Pandas
- YFinance (Yahoo Finance API) 
- Virtualenv
- Power BI Desktop
- Git & GitHub para versionamento

## 📊 Resultados e 💡 Insights
- Integração bem-sucedida entre Python e Power BI.
- Automação da coleta e atualização de dados financeiros.
- Demonstração prática de habilidades técnicas em Python, DAX e Power BI.

## 📖 Relatório 
- Link para o relatório completo: https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto3_Case/relatorio/Doc_DashPython.docx

  ---

# 🗂 Projeto 04 — Desafio Técnico BI Jr (JAAR Consult)

## 🎯 Objetivos do Case
- Demonstrar domínio de **modelagem de dados (Star Schema)** no Power BI.  
- Criar e aplicar **medidas DAX** para métricas de vendas, custos, margens e descontos.  
- Implementar **análises de Time Intelligence** (YTD, LY, % vs LY e LY Exato).  
- Construir um **painel analítico interativo** com storytelling visual e foco em insights de negócio.  
- Utilizar **RLS estático e dinâmico** para controle de acesso a dados.

## 📷 Preview
![jaarrelatorioo](https://github.com/user-attachments/assets/46c9cc94-287c-4df7-9112-c410713ce314)

<img width="1512" height="853" alt="image" src="https://github.com/user-attachments/assets/91d55403-e10b-488b-bcd3-895fdb091490" />

## 🚀 Tecnologias Utilizadas
- Power BI Desktop (versão 2025)  
- Linguagem **DAX**  
- Modelagem relacional (**Star Schema**)  
- Recursos de **Time Intelligence**  
- Implementação de **RLS (Row-Level Security)**  
- Git & GitHub para versionamento  

## 📊 Resultados e 💡 Insights
- Construção de um painel limpo e eficiente para análise de **vendas líquidas, custos e margens**.  
- Identificação das **categorias e continentes com maior participação nas vendas (Share %)**.  
- Aplicação prática do **princípio de Pareto (80/20)** para priorização de produtos.  
- Implementação de análises comparativas **YTD vs LY Exato** e de **promoções mais rentáveis**.  
- Demonstração de **domínio em DAX**, storytelling e boas práticas de modelagem.

## 📖 Relatório
- Link para o relatório completo: https://github.com/Vynys/portfolio-analista-dados/tree/main/projetos/Projeto4_Case/relatorio
- Contexto: Projeto desenvolvido como parte de um **desafio técnico para processo seletivo da JAAR Consult**.  
  Todo o conteúdo é autoral e não representa oficialmente a empresa
  ---
# 🗂 Projeto 05 — SQL (PostgreSQL) | Análise de Vendas e Funil 

## 🧾 Visão geral
Este projeto é **SQL-first**: toda a transformação, cálculo de métricas e consolidação dos dados foi feita no **PostgreSQL**, utilizando **pgAdmin** como interface de desenvolvimento e validação das consultas.  
O **Excel** foi usado apenas como **camada de apresentação**, para tornar os resultados legíveis (tabelas e gráficos) e facilitar o consumo por stakeholders não técnicos.

## 🧰 Stack e ferramentas
- PostgreSQL (consultas analíticas)
- pgAdmin (Query Tool, validação e exportação de resultados)
- Excel (apresentação / dashboard e relatório em PDF)

## 🗃️ Base de dados (tabelas utilizadas)
- `sales.funnel` (visitas, funil e datas de conversão/pagamento)
- `sales.products` (preço, marca e atributos do produto)
- `sales.customers` (estado do cliente)
- `sales.stores` (lojas)

## 🎯 Objetivo de negócio
Construir uma visão gerencial de performance de vendas e funil, respondendo:
- Como evoluem **leads, vendas e receita** mês a mês?
- Qual a **conversão** do funil e o **ticket médio**?
- Quais **estados**, **marcas** e **lojas** puxaram as vendas no mês analisado?
- Em quais **dias da semana** há maior volume de visitas?

## 📷 Preview
  ![projeto6gif](https://github.com/user-attachments/assets/a17025cf-f8bb-45ae-82a2-4296afacd606)
  <img width="1240" height="719" alt="image" src="https://github.com/user-attachments/assets/4f9c9446-57a3-4701-9842-5ace8e14dfdf" />



## 🧠 O que foi feito em SQL (destaques técnicos)
- **CTEs** para organizar a lógica e garantir rastreabilidade (ex.: `leads`, `payments`)
- **Agregações** com `COUNT()` e `SUM()` para métricas-chave
- **Cálculos de KPI** no banco (conversão e ticket médio), com `CAST`/`::float` para evitar divisão inteira
- **Time intelligence** com `date_trunc('month', ...)` para padronização mensal
- **Business filtering** por período (ex.: agosto/2021) para rankings de performance
- **Dimensional joins** (`funnel` ↔ `products/customers/stores`) para enriquecer as análises

## 🧩 Consultas (perguntas respondidas)
As consultas deste projeto geram:
1. **Receita, leads, conversão e ticket médio mês a mês**
2. **Top 5 estados** com mais vendas (mês)
3. **Top 5 marcas** com mais vendas (mês)
4. **Top 5 lojas** com mais vendas (mês)
5. **Dias da semana** com maior número de visitas  
(As queries estão documentadas no arquivo de consultas do projeto.)

## 📦 Entregáveis
- Dashboard em Excel (apresentação dos resultados extraídos via SQL)
- PDF do relatório/dash
- Scripts SQL (consultas do projeto)

## 📖 Relatório
- Link para o PDF: https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto5_Case/assets/Projeto%20-%20DashboardDeVendas.pdf
- Link para o Excel: https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto5_Case/files/Projeto%20-%20DashboardDeVendas.xlsx
- Link para o Relatório Completo: https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto5_Case/files/Projeto05_Relatorio_SQL_Queries.txt


---

# 🗂 Projeto 06 — SQL (PostgreSQL) | Perfil dos Leads 
## 🧾 Visão geral
Este projeto é **SQL-first**: toda a segmentação, cálculos de distribuição (%) e consolidação do perfil dos leads foram feitos no **PostgreSQL**, utilizando **pgAdmin** para desenvolvimento, validação e extração dos resultados.  
O **Excel** foi usado apenas como **camada de apresentação**, para transformar os resultados do SQL em tabelas e gráficos legíveis para o leitor.

## 🧰 Stack e ferramentas
- PostgreSQL (consultas analíticas e segmentação)
- pgAdmin (Query Tool, validação e exportação de resultados)
- Excel (apresentação / dashboard e relatório em PDF)

## 🗃️ Base de dados (tabelas utilizadas)
- `sales.customers` (dados do lead: renda, nascimento, status profissional, etc.)
- `temp_tables.ibge_genders` (mapeamento de gênero por primeiro nome)
- `sales.funnel` (eventos de visita / navegação)
- `sales.products` (marca, modelo, ano do veículo)

## 🎯 Objetivo de negócio
Construir uma visão de **perfil e comportamento** dos leads, respondendo:
- Qual a distribuição de leads por **gênero**?
- Qual o **status profissional** predominante e sua participação (%)?
- Como os leads se distribuem por **faixa etária** e **faixa salarial**?
- Quais veículos foram mais visitados e como se comportam por **classificação** (novo vs seminovo)?
- Quais modelos são mais visitados por **marca**?
  
## 📷 Preview
  ![projeto5gif](https://github.com/user-attachments/assets/cf47fbe0-569e-432a-9d4d-f7bb920166f7)
  <img width="1741" height="661" alt="image" src="https://github.com/user-attachments/assets/b58771ec-0bf4-486a-9c96-8a05e6d57e77" />


## 🧠 O que foi feito em SQL (destaques técnicos)
- **CTEs** para organizar regras e manter a consulta legível (ex.: classificação do veículo, faixas)
- **CASE WHEN** para criar categorias de negócio (faixa etária, faixa salarial, status, classificação)
- **Cálculo de percentuais** diretamente no banco (`COUNT(*)::float / total`)
- **Regras de classificação** (ex.: “novo até 2 anos”, “seminovo acima de 2 anos”)
- **Joins dimensionais** (`customers/funnel/products`) para enriquecer o comportamento de navegação
- **Ordenação e ranking** para identificar itens mais visitados por marca

## 🧩 Consultas (perguntas respondidas)
As consultas deste projeto geram:
1. **Distribuição por gênero** dos leads
2. **Status profissional** (% de participação)
3. **Faixa etária** (% de participação)
4. **Faixa salarial** (% de participação)
5. **Classificação do veículo visitado** (novo vs seminovo)
6. **Faixa de idade do veículo visitado** (%)
7. **Veículos mais visitados por marca**  
(As queries estão documentadas no arquivo de consultas do projeto.)

## 📦 Entregáveis
- Dashboard em Excel (apresentação dos resultados extraídos via SQL)
- PDF do relatório/dash
- Scripts SQL (consultas do projeto)

## 📖 Relatório
  * Link para o PDF: https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto6_Case/assets/Projeto%20-%20PerfilDosLeads.pdf
  * Link para o Excel: https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto6_Case/files/Projeto%20-%20PerfilDosLeads.xlsx
  * Link para o Relatório Completo: https://github.com/Vynys/portfolio-analista-dados/blob/main/projetos/Projeto6_Case/files/Projeto06_Relatorio_SQL_Queries.txt





