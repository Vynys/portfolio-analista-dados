# 📊 Portfólio de Analista de Dados - Vinícius da Costa Soares

Bem-vindo ao meu portfólio! 🚀  
Aqui compartilho projetos práticos em **Power BI, Excel/Power Query, DAX, SQL e Python**, mostrando minhas habilidades em tratamento, modelagem e visualização de dados.

---

## 📌 Sobre  
Este repositório tem como objetivo centralizar meus estudos e cases de análise de dados.  
Cada projeto foi desenvolvido com foco em **problemas reais de negócio**, passando por etapas de coleta, limpeza, transformação, análise e visualização de dados.

---

## 📂 Estrutura do Repositório


## 🗂 Projeto 01 — **Planilha → Dashboard no Power BI**

✅ Transformação de uma planilha Excel desestruturada em um dashboard interativo no Power BI  
✅ Limpeza e padronização no Power Query  
✅ Criação de medidas DAX  
✅ Estruturação de modelo simples  
✅ Visualizações com KPIs e filtros dinâmicos  

### 📷 Preview  
<img width="1277" height="703" alt="painel completo" src="https://github.com/user-attachments/assets/69f3c41f-7284-42c5-9a81-105413ef82a6" />

---

## 🚀 Tecnologias Utilizadas

- **Power BI Desktop**  
- **Excel / CSV**  
- **Git & GitHub** para versionamento  

---

## 📐 Exemplos de Medidas DAX

**Funcionários com Dependentes**  
```DAX
Func_com_dep = DISTINCTCOUNT(Dependente[ID_MATRICULA])
Funcionarios = COUNT(Funcionario[MATRÍCULA])
Total = SUM(Funcionario[SALÁRIO])





