# Publicar no GitHub — passo a passo

## 1. Use este projeto como um repositório NOVO

Não copie a pasta `.git` de nenhum projeto anterior. Isso é importante para evitar que o histórico do Git contenha arquivos ou dados que não fazem parte do portfólio.

Extraia a pasta deste projeto, por exemplo:

```text
C:\Users\SEU_USUARIO\Documents\ServiceOps-Analytics-Dashboard
```

## 2. Teste localmente

Abra a pasta no VS Code e execute:

```powershell
npm.cmd install
npm.cmd run validate
npm.cmd run dev
```

Confira os filtros, gráficos, tabelas e responsividade.

## 3. Crie um novo repositório público no GitHub

No GitHub:

1. Clique em **New repository**.
2. Nome recomendado: `serviceops-analytics-dashboard`.
3. Description:

```text
Interactive ServiceOps dashboard built with Vanilla JS, Vite and Chart.js. Synthetic data, SLA/TMA/TMR analysis, cross-filtering and drill-down tables.
```

4. Selecione **Public**.
5. Não crie README, .gitignore ou licença pelo GitHub, porque o projeto já contém esses arquivos.
6. Clique em **Create repository**.

## 4. Inicialize o Git na pasta do projeto

No terminal do VS Code:

```powershell
git init
git add .
git commit -m "Initial public portfolio release"
git branch -M main
```

## 5. Conecte ao GitHub

Copie a URL do repositório e execute:

```powershell
git remote add origin https://github.com/SEU_USUARIO/serviceops-analytics-dashboard.git
git push -u origin main
```

## 6. Configure a página do repositório

Na lateral direita do repositório, em **About**:

- Description: use a descrição acima.
- Website: adicione o link da demo quando publicar.
- Topics recomendados:
  - `javascript`
  - `vite`
  - `chartjs`
  - `dashboard`
  - `data-visualization`
  - `analytics`
  - `service-management`
  - `portfolio`

## 7. Publicar uma demo online com Vercel

1. Entre na Vercel com sua conta GitHub.
2. Clique em **Add New → Project**.
3. Importe `serviceops-analytics-dashboard`.
4. Framework: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Clique em **Deploy**.

Depois copie o link de produção e coloque no campo **Website** do repositório.

## 8. Imagens para o README e LinkedIn

Sugestão de capturas:

1. Visão Geral completa.
2. Aba Demandas com filtros e gráficos.
3. Tabela de drill-down de um KPI.
4. Seção de Ambientes/Plataformas.

Antes da captura, confirme que o topo exibe `SERVICEOPS ANALYTICS` e `DEMO DATA`.

## 9. Segurança antes de publicar

Antes do primeiro `git push`, execute:

```powershell
git status
```

Confirme que o projeto contém apenas os dados demo. Este repositório não precisa e não deve conter planilhas, logos ou arquivos de projetos profissionais anteriores.
