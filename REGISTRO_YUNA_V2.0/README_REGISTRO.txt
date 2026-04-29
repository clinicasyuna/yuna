# 📦 PACOTE DE REGISTRO - YUNA SOLICITE V2.0

## 🎯 BIBLIOTECA NACIONAL - ESCRITÓRIO DE DIREITOS AUTORAIS

**Sistema:** Yuna Solicite - Sistema de Gerenciamento de Solicitações  
**Versão:** 2.0  
**Autor:** Samuel Jesus Santos  
**CPF:** [A preencher]  
**Data:** Janeiro 2026  
**Copyright:** © 2026 YUNA - Todos os direitos reservados

---

## 📋 ÍNDICE DO PACOTE

### 1️⃣ FORMULÁRIOS (`1_FORMULARIOS/`)

#### ✅ CRIADOS AUTOMATICAMENTE:
- **DECLARACAO_AUTORIA.md** - Declaração formal de autoria (9 pontos)
  - ⚠️ **AÇÃO NECESSÁRIA:** Imprimir, preencher CPF/RG/data nascimento, assinar, reconhecer firma, escanear para PDF

#### ⏳ VOCÊ PRECISA PREENCHER ONLINE:
- Acessar: https://www.bn.gov.br/servicos/escritorio-direitos-autorais
- Criar conta no sistema EDA
- Preencher formulário online de registro
- Gerar boleto (R$20 pessoa física)

---

### 2️⃣ DOCUMENTOS DE IDENTIFICAÇÃO (`2_DOCUMENTOS_IDENTIFICACAO/`)

#### ⚠️ VOCÊ PRECISA FORNECER:
- **RG** (Registro Geral) - Frente e verso, colorido, legível
- **CPF** (Cadastro de Pessoa Física) - Digitalização ou print da Receita Federal
- **Comprovante de Residência** - Conta de luz/água/internet (últimos 3 meses)

**Formato:** PDF, JPEG ou PNG  
**Qualidade:** Alta resolução, texto legível  
**Tamanho máximo:** 5MB por arquivo

---

### 3️⃣ CÓDIGO-FONTE (`3_CODIGO_FONTE/`)

#### ⏳ EXECUTAR SCRIPT DE COMPACTAÇÃO:

Criei um script PowerShell para zipar automaticamente o código-fonte:

```powershell
.\REGISTRO_YUNA_V2.0\3_CODIGO_FONTE\criar_zip_codigo_fonte.ps1
```

Este script irá:
- ✅ Comprimir todos os arquivos `.js`, `.html`, `.css`, `.json`, `.md`
- ✅ Incluir `firestore.rules`, `netlify.toml`, `manifest.json`, `service-worker.js`
- ✅ Excluir automaticamente:
  - `node_modules/`
  - `firebase-service-account.json`
  - `.git/`
  - Arquivos temporários

**Resultado:** `codigo-fonte-yuna-v2.0.zip` (~500KB estimado)

---

### 4️⃣ DOCUMENTAÇÃO TÉCNICA (`4_DOCUMENTACAO_TECNICA/`)

#### ✅ JÁ ORGANIZADOS:

**Documentos Originais (Markdown):**
- ✅ `DOCUMENTACAO_REGISTRO_DIREITOS_AUTORAIS.md` - Documento principal v2.0
- ✅ `ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.md` - Módulos proprietários
- ✅ `copilot-instructions.md` - Guia de programação para IA

#### ⏳ VOCÊ PRECISA CONVERTER PARA PDF:

**Opções de conversão:**

**Opção 1: Pandoc (Recomendado)**
```powershell
# Instalar Pandoc: https://pandoc.org/installing.html
cd REGISTRO_YUNA_V2.0\4_DOCUMENTACAO_TECNICA\Documentos_Originais_Markdown

pandoc DOCUMENTACAO_REGISTRO_DIREITOS_AUTORAIS.md -o ..\DOCUMENTACAO_PRINCIPAL.pdf
pandoc ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.md -o ..\ADENDO_MODULOS.pdf
pandoc copilot-instructions.md -o ..\GUIA_PROGRAMACAO.pdf
```

**Opção 2: Markdown to PDF (VS Code)**
1. Instalar extensão: "Markdown PDF" no VS Code
2. Abrir arquivo `.md`
3. Ctrl+Shift+P → "Markdown PDF: Export (pdf)"

**Opção 3: Online**
- https://www.markdowntopdf.com/
- Upload cada arquivo `.md`
- Download PDF gerado

---

### 5️⃣ INTERFACES (`5_INTERFACES/`)

#### 📸 GUIA COMPLETO CRIADO:

✅ **GUIA_CAPTURA_SCREENSHOTS.md** - Instruções detalhadas com:
- Lista de 30 screenshots necessários
- Passo a passo para cada captura
- Ferramentas recomendadas (ShareX, Ferramenta de Captura)
- Padrões de qualidade (resolução, formato, enquadramento)
- Como consolidar em PDF

#### ⏳ VOCÊ PRECISA CAPTURAR:

**Portal dos Acompanhantes (11 screenshots):**
1. Tela de login
2. Dashboard principal
3. Cards de serviços (4 tipos)
4. Modais de nova solicitação (4 modais)
5. Lista de solicitações
6. Detalhes de solicitação
7. Modal de avaliação
8. Versão mobile

**Painel Administrativo (15 screenshots):**
1. Tela de login admin
2. Dashboard geral
3. Painéis por departamento (4 departamentos)
4. Detalhes de solicitação
5. Gestão de usuários (lista, criar, editar)
6. Relatórios e gráficos
7. Sistema RBAC
8. Notificações
9. Timeout de sessão

**Console - Módulos de Otimização (4 screenshots):**
1. Performance Monitor
2. Cache Manager
3. Listener Manager
4. Query Helper

**Tempo estimado:** 1-2 horas  
**Consolidar em:** `YUNA_v2.0_Interfaces_Screenshots.pdf`

---

### 6️⃣ DIAGRAMAS (`6_DIAGRAMAS/`)

#### ✅ DIAGRAMAS MERMAID CRIADOS:

**DIAGRAMA_ARQUITETURA_GERAL.md** contém 7 diagramas:
1. Arquitetura Geral do Sistema
2. Fluxo de Dados - Solicitação de Serviço
3. Fluxo de Autenticação e RBAC
4. Módulos de Otimização - Interação
5. Sistema de Quartos - Controle Atômico
6. Sistema de Avaliação Automática
7. PWA - Estratégia de Cache

#### ⏳ VOCÊ PRECISA RENDERIZAR:

**Ferramente recomendada:** https://mermaid.live/

**Passos:**
1. Abrir https://mermaid.live/
2. Copiar código de cada diagrama
3. Colar no editor
4. Ajustar tema (Padrão)
5. Baixar como PNG ou SVG
6. Nomear: `01_arquitetura_geral.png`, `02_fluxo_solicitacao.png`, etc.
7. Consolidar em PowerPoint → Exportar PDF

**Consolidar em:** `YUNA_v2.0_Diagramas_Arquitetura.pdf`

---

### 7️⃣ MANUAL DO USUÁRIO (`7_MANUAL/`)

#### ✅ CRIADO AUTOMATICAMENTE:

- **MANUAL_USUARIO_YUNA_V2.0.md** - Manual completo com:
  - Introdução ao sistema
  - Requisitos técnicos
  - Instruções de acesso
  - Guia do Portal dos Acompanhantes
  - Guia do Painel Administrativo
  - FAQ (10 perguntas frequentes)
  - Troubleshooting (problemas comuns)
  - Contatos e suporte

#### ⏳ VOCÊ PRECISA CONVERTER PARA PDF:

```powershell
cd REGISTRO_YUNA_V2.0\7_MANUAL
pandoc MANUAL_USUARIO_YUNA_V2.0.md -o MANUAL_USUARIO_YUNA_V2.0.pdf
```

---

### 8️⃣ HISTÓRICO DE VERSÕES (`8_HISTORICO/`)

#### ✅ EXPORTADO AUTOMATICAMENTE:

- **historico_versoes.txt** - Log completo do Git com todos os commits

#### ⏳ VOCÊ PODE CRIAR CHANGELOG OPCIONAL:

Criar arquivo `CHANGELOG.md` formatado:

```markdown
# CHANGELOG - YUNA v2.0

## [2.0.0] - Janeiro 2026
### Adicionado
- 4 novos módulos de otimização proprietários
- Sistema de avaliação automática
- PWA com suporte offline
- Session timeout (10 min)
- Sistema RBAC completo

### Melhorado
- Performance 60% mais rápida
- 90% menos leituras Firestore
- UI redesenhada
- Notificações em tempo real

## [1.0.0] - Dezembro 2025
### Lançamento Inicial
- Portal dos Acompanhantes
- Painel Administrativo
- 4 departamentos de serviço
```

---

## 📊 STATUS DO PACOTE

### ✅ COMPLETO (Criado Automaticamente):
- [x] Declaração de autoria (template)
- [x] Manual do usuário
- [x] Guia de captura de screenshots
- [x] Diagramas de arquitetura (Mermaid)
- [x] Documentação técnica (Markdown)
- [x] Histórico de versões (Git log)
- [x] README do pacote

### ⏳ PENDENTE (Requer Ação Manual):

#### 🔴 ALTA PRIORIDADE:
- [ ] **Preencher e assinar** declaração de autoria
- [ ] **Digitalizar** documentos pessoais (RG, CPF, comprovante)
- [ ] **Criar conta** no sistema EDA da Biblioteca Nacional
- [ ] **Preencher formulário** online de registro
- [ ] **Gerar boleto** e efetuar pagamento (R$20)

#### 🟠 OPERAÇÃO CONTÍNUA (RECOMENDADO):
- [ ] **Configurar alerta de billing** no GCP/Firebase (limite mensal + aviso 80%)
- [ ] **Definir rotina de backup** do Firestore (export semanal ou mensal para Storage)

#### 🟡 MÉDIA PRIORIDADE:
- [ ] **Capturar** 30 screenshots do sistema
- [ ] **Consolidar** screenshots em PDF
- [ ] **Renderizar** 7 diagramas Mermaid
- [ ] **Consolidar** diagramas em PDF

#### 🟢 BAIXA PRIORIDADE:
- [ ] **Converter** documentação Markdown para PDF (3 arquivos)
- [ ] **Executar script** de compactação do código-fonte
- [ ] **Criar CHANGELOG** formatado (opcional)

---

## 🚀 PRÓXIMOS PASSOS DETALHADOS

### ETAPA 1: PREPARAR DOCUMENTOS PESSOAIS (1 hora)

1. **RG:**
   - Tirar foto ou escanear frente e verso
   - Qualidade alta, legível
   - Salvar como: `RG_Samuel_Jesus_Santos.pdf`
   - Colocar em: `2_DOCUMENTOS_IDENTIFICACAO/`

2. **CPF:**
   - Acessar: https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp
   - Print ou download do PDF
   - Salvar como: `CPF_Samuel_Jesus_Santos.pdf`
   - Colocar em: `2_DOCUMENTOS_IDENTIFICACAO/`

3. **Comprovante de Residência:**
   - Conta de luz/água/internet (últimos 3 meses)
   - Escanear ou fazer foto
   - Salvar como: `Comprovante_Residencia.pdf`
   - Colocar em: `2_DOCUMENTOS_IDENTIFICACAO/`

---

### ETAPA 2: ASSINAR DECLARAÇÃO DE AUTORIA (30 min + cartório)

1. **Abrir:** `1_FORMULARIOS/DECLARACAO_AUTORIA.md`
2. **Imprimir** (2 vias)
3. **Preencher:**
   - CPF: INFORMAR NO ATO DE ASSINATURA
   - RG: INFORMAR NO ATO DE ASSINATURA
   - Data de Nascimento: INFORMAR NO ATO DE ASSINATURA
   - Local e Data: CIDADE E DATA DA ASSINATURA (DD/MM/2026)
   - Assinar com caneta azul
4. **Reconhecer firma** no cartório (R$10-20)
5. **Escanear** versão reconhecida em alta qualidade
6. **Salvar como:** `DECLARACAO_AUTORIA_ASSINADA.pdf`
7. **Colocar em:** `1_FORMULARIOS/`

---

### ETAPA 3: CAPTURAR SCREENSHOTS (1-2 horas)

1. **Abrir:** `5_INTERFACES/GUIA_CAPTURA_SCREENSHOTS.md`
2. **Seguir instruções** passo a passo
3. **Usar ferramenta:**
   - Windows: ShareX (https://getsharex.com/) ou Ferramenta de Captura
   - Mac: Cmd+Shift+4
4. **Capturar todas as 30 imagens:**
   - 11 do Portal Acompanhantes
   - 15 do Painel Admin
   - 4 do Console (módulos)
5. **Consolidar em PowerPoint:**
   - 1 slide por imagem
   - Adicionar legenda
   - Exportar como PDF
6. **Salvar como:** `YUNA_v2.0_Interfaces_Screenshots.pdf`
7. **Colocar em:** `5_INTERFACES/`

---

### ETAPA 4: RENDERIZAR DIAGRAMAS (30 min)

1. **Abrir:** `6_DIAGRAMAS/DIAGRAMA_ARQUITETURA_GERAL.md`
2. **Acessar:** https://mermaid.live/
3. **Para cada um dos 7 diagramas:**
   - Copiar código `mermaid`
   - Colar no editor online
   - Baixar PNG ou SVG
   - Nomear: `01_arquitetura_geral.png`, etc.
4. **Consolidar em PowerPoint:**
   - 1 slide por diagrama
   - Adicionar título e descrição
   - Exportar como PDF
5. **Salvar como:** `YUNA_v2.0_Diagramas_Arquitetura.pdf`
6. **Colocar em:** `6_DIAGRAMAS/`

---

### ETAPA 5: CONVERTER DOCUMENTAÇÃO PARA PDF (15 min)

**Opção A: Pandoc (Recomendado)**
```powershell
# Instalar: https://pandoc.org/installing.html
cd REGISTRO_YUNA_V2.0\4_DOCUMENTACAO_TECNICA\Documentos_Originais_Markdown

pandoc DOCUMENTACAO_REGISTRO_DIREITOS_AUTORAIS.md -o ..\DOCUMENTACAO_PRINCIPAL.pdf
pandoc ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.md -o ..\ADENDO_MODULOS.pdf
pandoc copilot-instructions.md -o ..\GUIA_PROGRAMACAO.pdf
```

**Opção B: Online**
1. Acessar: https://www.markdowntopdf.com/
2. Upload cada arquivo `.md`
3. Download PDF gerado
4. Renomear conforme acima
5. Mover para: `4_DOCUMENTACAO_TECNICA/`

---

### ETAPA 6: COMPACTAR CÓDIGO-FONTE (5 min)

```powershell
cd e:\APP\deploy
.\REGISTRO_YUNA_V2.0\3_CODIGO_FONTE\criar_zip_codigo_fonte.ps1
```

Aguardar criação de: `codigo-fonte-yuna-v2.0.zip` (~500KB)

---

### ETAPA 7: CRIAR CONTA E REGISTRAR ONLINE (1-2 horas)

1. **Acessar:** https://www.bn.gov.br/servicos/escritorio-direitos-autorais

2. **Criar conta no sistema EDA:**
   - Clicar em "Criar Conta"
   - Preencher dados pessoais
   - Confirmar email

3. **Fazer login**

4. **Iniciar novo registro:**
   - Selecionar: "Programa de Computador"
   - Título: "YUNA - Sistema de Gerenciamento de Solicitações"
   - Versão: 2.0
   - Categoria: Software/Sistema Web

5. **Preencher formulário:**
   - **Dados do Autor:**
     - Nome completo
     - CPF, RG
     - Endereço completo
     - Telefone e email
   
   - **Dados da Obra:**
     - Título: "YUNA - Sistema de Gerenciamento de Solicitações"
     - Subtítulo: "Sistema Web PWA para Gestão de Serviços em Clínicas"
     - Ano de criação: 2025-2026
     - País: Brasil
     - Idioma: Português (pt-BR)
     - Natureza: Original
   
   - **Características Técnicas:**
     - Tipo: Sistema Web (PWA)
     - Linguagem: JavaScript
     - Framework: Vanilla JS + Firebase
     - Linhas de código: 19.825+
     - Plataforma: Multi-plataforma (web, mobile, tablet)
   
   - **Descrição da Obra:**
     ```
     Sistema web progressivo (PWA) para gerenciamento de solicitações 
     de serviços em ambientes de saúde. Arquitetura multi-SPA com duas 
     interfaces independentes: Portal dos Acompanhantes e Painel 
     Administrativo. Inclui 4 módulos proprietários de otimização: 
     Performance Monitor, Listener Manager, Cache Manager LRU e Query 
     Helper. Sistema RBAC completo, real-time sync via Firestore, 
     session timeout automático e avaliação de satisfação.
     ```
   
   - **Inovações Técnicas:**
     - Sistema RBAC multi-nível
     - Otimização LRU proprietária (60% mais rápido)
     - Controle atômico de recursos (transações Firestore)
     - Sistema de avaliação automática com janela temporal
     - PWA offline-capable com estratégia de cache inteligente

6. **Anexar documentos:**
   - ✅ Declaração de autoria assinada e reconhecida (PDF)
   - ✅ RG e CPF (PDF)
   - ✅ Comprovante de residência (PDF)
   - ✅ Código-fonte compactado (ZIP)
   - ✅ Documentação técnica (3 PDFs)
   - ✅ Screenshots das interfaces (PDF)
   - ✅ Diagramas de arquitetura (PDF)
   - ✅ Manual do usuário (PDF)
   - ✅ Histórico de versões (TXT ou PDF)

7. **Revisar tudo**

8. **Gerar boleto:**
   - Pessoa física: R$20,00
   - Validade: 3 dias úteis

9. **Efetuar pagamento:**
   - Via internet banking
   - Ou agência bancária

10. **Aguardar confirmação:**
    - Compensação bancária: 1-2 dias úteis
    - Análise EDA: 5-7 dias úteis
    - Certificado digital: disponível no sistema

11. **Acompanhar protocolo:**
    - Login no sistema EDA
    - Verificar status do registro

---

## 📞 SUPORTE E DÚVIDAS

### Biblioteca Nacional - EDA:
- **Site:** https://www.bn.gov.br/servicos/escritorio-direitos-autorais
- **Email:** eda@bn.gov.br
- **Telefone:** (21) 2220-3096 / 2220-3097
- **Horário:** Segunda a sexta, 9h às 17h

### Dúvidas Técnicas do Sistema:
- **Desenvolvedor:** Samuel Jesus Santos
- **Email:** ti@yuna.com.br
- **Telefone:** +55 11 94586-4671

---

## ⏱️ CRONOGRAMA ESTIMADO

| Etapa | Duração | Quando |
|-------|---------|--------|
| Preparar documentos pessoais | 1h | Hoje |
| Assinar declaração + cartório | 2h | Hoje |
| Capturar screenshots | 1-2h | Hoje/Amanhã |
| Renderizar diagramas | 30min | Amanhã |
| Converter docs para PDF | 15min | Amanhã |
| Compactar código-fonte | 5min | Amanhã |
| Criar conta EDA | 30min | Dia 3 |
| Preencher formulário online | 1h | Dia 3 |
| Anexar documentos | 30min | Dia 3 |
| Pagar boleto | - | Dia 3-4 |
| Compensação bancária | - | Dia 4-5 |
| Análise EDA | - | Dia 5-12 |
| **TOTAL** | **~7-8 dias** | - |

---

## 💰 CUSTOS TOTAIS

| Item | Valor |
|------|-------|
| Registro na Biblioteca Nacional (pessoa física) | R$ 20,00 |
| Reconhecimento de firma (cartório) | R$ 10-20,00 |
| **TOTAL** | **R$ 30-40,00** |

---

## ✅ CHECKLIST FINAL

### Antes de Submeter:

- [ ] Todos os documentos pessoais digitalizados
- [ ] Declaração assinada e reconhecida em cartório
- [ ] 30 screenshots capturados e consolidados em PDF
- [ ] 7 diagramas renderizados e consolidados em PDF
- [ ] 3 documentações técnicas convertidas para PDF
- [ ] Código-fonte compactado em ZIP
- [ ] Manual do usuário convertido para PDF
- [ ] Conta criada no sistema EDA
- [ ] Formulário online preenchido completamente
- [ ] Todos os anexos enviados
- [ ] Boleto gerado e pago
- [ ] Protocolo de registro anotado

---

## 🎯 OBJETIVO FINAL

**Obter certificado digital de registro** de direitos autorais emitido pela **Biblioteca Nacional do Brasil** para o **Yuna Solicite v2.0**, garantindo proteção legal da propriedade intelectual do software.

---

## 📄 DOCUMENTOS ANEXADOS A ESTE PACOTE

```
REGISTRO_YUNA_V2.0/
│
├── README_REGISTRO.txt (este arquivo)
│
├── 1_FORMULARIOS/
│   ├── DECLARACAO_AUTORIA.md (template criado)
│   └── [PENDENTE] DECLARACAO_AUTORIA_ASSINADA.pdf (você precisa assinar)
│
├── 2_DOCUMENTOS_IDENTIFICACAO/
│   ├── [PENDENTE] RG_Samuel_Jesus_Santos.pdf
│   ├── [PENDENTE] CPF_Samuel_Jesus_Santos.pdf
│   └── [PENDENTE] Comprovante_Residencia.pdf
│
├── 3_CODIGO_FONTE/
│   ├── criar_zip_codigo_fonte.ps1 (script criado)
│   └── [PENDENTE] codigo-fonte-yuna-v2.0.zip (executar script)
│
├── 4_DOCUMENTACAO_TECNICA/
│   ├── Documentos_Originais_Markdown/
│   │   ├── DOCUMENTACAO_REGISTRO_DIREITOS_AUTORAIS.md (✅)
│   │   ├── ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.md (✅)
│   │   └── copilot-instructions.md (✅)
│   ├── [PENDENTE] DOCUMENTACAO_PRINCIPAL.pdf
│   ├── [PENDENTE] ADENDO_MODULOS.pdf
│   └── [PENDENTE] GUIA_PROGRAMACAO.pdf
│
├── 5_INTERFACES/
│   ├── GUIA_CAPTURA_SCREENSHOTS.md (✅ guia completo)
│   ├── screenshots_originais/ (pasta vazia - você preenche)
│   └── [PENDENTE] YUNA_v2.0_Interfaces_Screenshots.pdf
│
├── 6_DIAGRAMAS/
│   ├── DIAGRAMA_ARQUITETURA_GERAL.md (✅ 7 diagramas Mermaid)
│   └── [PENDENTE] YUNA_v2.0_Diagramas_Arquitetura.pdf
│
├── 7_MANUAL/
│   ├── MANUAL_USUARIO_YUNA_V2.0.md (✅)
│   └── [PENDENTE] MANUAL_USUARIO_YUNA_V2.0.pdf
│
└── 8_HISTORICO/
    ├── historico_versoes.txt (✅ Git log exportado)
    └── [OPCIONAL] CHANGELOG.md
```

---

## 🎉 BOA SORTE COM O REGISTRO!

Este pacote foi preparado automaticamente para facilitar seu processo de registro na Biblioteca Nacional. Siga os próximos passos com calma, um de cada vez, e você terá seu certificado em aproximadamente 7-8 dias.

**Qualquer dúvida, estou à disposição! 📧 ti@yuna.com.br**

---

**Copyright © 2026 YUNA - Todos os direitos reservados**  
**Autor:** Samuel Jesus Santos  
**Versão:** 2.0  
**Data:** Janeiro 2026
