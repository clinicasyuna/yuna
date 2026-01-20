# 📊 Dashboard Yuna TI 2025 - Guia para Apresentação à Diretoria

**Data da Apresentação:** Semana de 20-24 de Janeiro de 2026  
**Desenvolvido em:** 16 de Janeiro de 2026  
**Versão:** 1.0 - Produção

---

## 🎯 Resumo Executivo

Dashboard unificado com análise completa da operação de TI da Yuna em 2025, consolidando:
- **Chamados/Atendimentos** (937 registros)
- **Inventário de Equipamentos** (Estações, Servidores, Switches, Antenas)
- **Gastos de TI** (R$ 609.840,08 ao longo do ano)
- **Análises Integradas** e métricas de eficiência

---

## 🚀 Como Iniciar o Dashboard

### Opção 1: Clique Duplo (RECOMENDADO)
1. Localize o arquivo: **`INICIAR_DASHBOARD_APRESENTACAO.bat`**
2. Clique duas vezes para abrir
3. Aguarde 5-10 segundos
4. Uma aba do navegador abrirá automaticamente

### Opção 2: Linha de Comando
```bash
cd E:\APP\deploy
E:\APP\deploy\.venv\Scripts\streamlit.exe run scripts\dashboard_unificado.py --server.port 8502
```

### Opção 3: PowerShell
```powershell
Start-Process -FilePath "E:\APP\deploy\.venv\Scripts\streamlit.exe" `
  -ArgumentList "run","scripts\dashboard_unificado.py","--server.port","8502"
Start-Sleep 8
Start-Process "http://localhost:8502"
```

---

## 📍 URL de Acesso

**Local:** `http://localhost:8502`  
**Rede:** `http://192.168.1.55:8502`

---

## 📑 Estrutura do Dashboard

### **ABA 1: 📞 Chamados 2025**
- **Propósito:** Visão geral de todos os atendimentos do ano
- **Métricas Principais:**
  - Total de Chamados: 937 atendimentos
  - Taxa de Resolução: % de chamados resolvidos
  - Tempo Médio: Horas para resolver um chamado
  - Chamados no Prazo: % resolvidos em 24h

- **Visualizações:**
  - Distribuição por Status (Resolvido, Aberto, etc)
  - Chamados por Assunto (gráfico de barras)
  - Top 10 Temas mais frequentes
  - Cronograma mensal de atividades

**DICA PARA APRESENTAÇÃO:** Destaque a taxa de resolução e tempo médio para demonstrar eficiência da equipe.

---

### **ABA 2: 📦 Inventário**
- **Propósito:** Visão consolidada de todos os equipamentos sob gestão
- **Categorias:**
  - **Estações de Trabalho:** Máquinas dos usuários finais
  - **Servidores:** Infraestrutura crítica
  - **Switches:** Dispositivos de rede
  - **Antenas:** Equipamentos de comunicação

- **Dados Exibidos:**
  - Tabelas com especificações técnicas
  - CPU, Memória RAM, Sistema Operacional
  - Número de série e fabricante

**DICA PARA APRESENTAÇÃO:** Use os totais de equipamentos para contextualizar o tamanho da infraestrutura.

---

### **ABA 3: 💰 Gastos TI** ⭐ (PRINCIPAL)
**Esta é a aba mais importante para apresentação!**

#### **SEÇÃO A: Gastos Consolidados**
- **Total Gasto Anual:** R$ 609.840,08
- **Média Mensal:** R$ 50.820,00
- **Maior Gasto Mensal:** Identificado dinamicamente
- **Menor Gasto Mensal:** Identificado dinamicamente

#### **SEÇÃO B: Evolução Mensal**
- Gráfico interativo mostrando gastos de janeiro a dezembro
- Linha de média para referência
- Identifica picos e vales de investimento

#### **SEÇÃO C: Detalhamento Mensal**
- Tabela com valores exatos por mês
- Percentual do total para cada mês
- Exportável para relatórios

#### **SEÇÃO D: 💼 Análise por Fornecedor** ⭐⭐ (DESTAQUE!)
- **Métricas:**
  - Total de fornecedores ativos
  - Maior fornecedor (principal investimento)
  - Soma total validada contra fluxo de caixa

- **Visualizações:**
  - **Gráfico de Barras:** Top 10 fornecedores com valores
  - **Gráfico de Pizza:** Distribuição percentual (Top 8 + Outros)
  - **Tabela Completa:** Todos fornecedores com filtro de busca

- **Detalhamento Mensal:**
  - Expansível: Visualizar gasto mês a mês de cada fornecedor
  - Seletor dropdown para explorar fornecedores específicos
  - Gráfico de barras com evolução mensal

#### **SEÇÃO E: Métricas Financeiras**
- Saldo Inicial de Caixa (12 meses somados)
- Saldo Final de Caixa (12 meses somados)
- Variação Mensal (12 meses somados)

**DICA PARA APRESENTAÇÃO:** 
- Comece com o total anual R$ 609.840,08
- Mostre a distribuição por fornecedor (pizza)
- Destaque o Top 3-5 fornecedores
- Explore 1-2 fornecedores em detalhes mensais para demonstrar controle

---

### **ABA 4: 📈 Análise Integrada**
- **Propósito:** Correlacionar Equipamentos + Gastos + Chamados
- **Métricas de Eficiência:**
  - Custo Médio por Equipamento
  - Gasto Médio Mensal
  - Chamados por Equipamento
  - Tendência de gastos ao longo do ano

**DICA PARA APRESENTAÇÃO:** Use para justificar investimentos em relação aos equipamentos gerenciados.

---

### **ABA 5: 📊 Visão Executiva**
- **Propósito:** Resumo de KPIs em alto nível
- **Métricas Resumidas:**
  - Taxa de Resolução de Chamados
  - Tempo Médio de Atendimento
  - % Chamados Resolvidos em Prazo
  - Total de Fluxo de Caixa Anual
  - Gasto por Equipamento

**DICA PARA APRESENTAÇÃO:** Use para encerrar a apresentação com números-chave.

---

## 💡 Dicas para uma Apresentação Impactante

### 1. **Estruture sua Fala (15-20 minutos)**
- **Introdução (1 min):** "Vamos revisar a operação de TI de 2025"
- **Equipamentos (2 min):** Mostre ABA 2 - tamanho da infraestrutura
- **Gastos (5-7 min):** FOQUE AQUI - Mostre ABA 3 completa
- **Eficiência (3-4 min):** ABA 4 - correlações
- **Resumo (1 min):** ABA 5 - KPIs finais

### 2. **Dados-Chave para Memorizar**
```
Equipamentos Gerenciados:
- Estações de Trabalho: [número]
- Servidores: [número]
- Switches: [número]
- Antenas: [número]
Total: [número] equipamentos

Investimento 2025:
- Total: R$ 609.840,08
- Média Mensal: R$ 50.820,00
- Por Equipamento: [valor]

Operações:
- Total de Chamados: 937
- Taxa de Resolução: [%]
- Tempo Médio: [horas]
```

### 3. **Demonstração Interativa**
O dashboard permite:
- ✅ Clicar em gráficos para mais detalhes
- ✅ Buscar fornecedores específicos
- ✅ Expandir seções para detalhamento
- ✅ Ver dados em tempo real (se desejar)

### 4. **Antecipe Perguntas Comuns**
- **"Qual foi nosso maior investimento?"** → Mostre Top 3 fornecedores (ABA 3)
- **"Os gastos aumentaram?"** → Mostre gráfico de tendência (ABA 3)
- **"Temos muitos chamados?"** → Mostre taxa de resolução e tempo médio (ABA 1)
- **"Qual é o ROI por equipamento?"** → Mostre ABA 4

### 5. **Configuração da Sala**
- Certifique-se que pode abrir o dashboard 5 minutos antes
- Teste a conexão de rede (se apresentando em rede externa)
- Tenha uma cópia PDF pronta como backup
- Deixe o mouse/touchpad bem posicionado para navegação suave

---

## ⚙️ Troubleshooting Rápido

### Dashboard não abre
```powershell
# Fechar processos Python antigos
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Tentar novamente
cd E:\APP\deploy
.\INICIAR_DASHBOARD_APRESENTACAO.bat
```

### Porta 8502 já em uso
```powershell
# Encontrar processo na porta
netstat -ano | findstr :8502

# Ou usar outra porta (editar .bat)
streamlit run scripts\dashboard_unificado.py --server.port 8503
```

### Dados não carregam
- Verifique se os arquivos Excel estão em E:\APP\deploy
- CF_YUNA_TI_2025.xlsx
- Relatório_Chamados_15-01-2026_937 - Samuel Lacerda.xlsx
- Yuna - *.xlsx (inventário)

---

## 📊 Validação de Dados

**Valores Confirmados (NÃO MUDAR):**
```
Total Fluxo de Caixa 2025: R$ 609.840,08
  Janeiro:    R$ 38.247,77
  Fevereiro:  R$ 47.232,40
  Março:      R$ 36.156,57
  Abril:      R$ 116.575,22
  Maio:       R$ 86.430,99
  Junho:      R$ 39.732,28
  Julho:      R$ 44.681,20
  Agosto:     R$ 40.388,81
  Setembro:   R$ 40.463,69
  Outubro:    R$ 44.588,57
  Novembro:   R$ 30.429,67
  Dezembro:   R$ 44.912,91
```

---

## 📞 Suporte Durante Apresentação

Se precisar de ajuda durante a apresentação:

1. **Contato Técnico:** [Seu contato/email]
2. **Backup PDF:** Disponível em `dashboard_backup.pdf`
3. **Dados Brutos:** Todos os Excel estão em E:\APP\deploy

---

## ✅ Checklist Pré-Apresentação

- [ ] Dashboard iniciado e testado
- [ ] Todos os dados carregando corretamente
- [ ] Conexão de rede verificada
- [ ] Projetor/monitores configurados
- [ ] Navegador em tela cheia (F11)
- [ ] Zoom do navegador em 100%
- [ ] Microfone/áudio testado
- [ ] PDF de backup pronto
- [ ] Números-chave memorizado

---

## 🎉 Você Está Pronto!

Boa apresentação à diretoria! Este dashboard mostra profissionalismo, controle e eficiência operacional de TI. 

**Qualquer dúvida, consulte este documento ou execute:** `INICIAR_DASHBOARD_APRESENTACAO.bat`

---

*Documento gerado em: 16 de Janeiro de 2026*  
*Dashboard Yuna TI 2025 - Versão 1.0*
