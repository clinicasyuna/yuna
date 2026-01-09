# 🎯 PRÓXIMOS PASSOS PARA REGISTRO - YUNA V2.0

## ✅ O QUE JÁ FOI FEITO (AUTOMATIZADO)

Preparei automaticamente todo o pacote de registro. Veja o que já está pronto:

### Documentos Criados:
- ✅ **Declaração de autoria** (template para você assinar)
- ✅ **Manual do usuário completo** (300+ linhas)
- ✅ **Guia de captura de screenshots** (instruções detalhadas)
- ✅ **Diagramas de arquitetura** (7 diagramas em Mermaid)
- ✅ **Documentação técnica** (3 documentos em Markdown)
- ✅ **Histórico de versões** (Git log exportado)
- ✅ **Script de compactação** (para código-fonte)
- ✅ **README completo** (índice e instruções)

### Estrutura Organizada:
```
REGISTRO_YUNA_V2.0/
├── 1_FORMULARIOS/ ............. Declaração de autoria
├── 2_DOCUMENTOS_IDENTIFICACAO/ [Você precisa adicionar RG, CPF, comprovante]
├── 3_CODIGO_FONTE/ ............ Script pronto para zipar código
├── 4_DOCUMENTACAO_TECNICA/ .... Docs em Markdown (converter para PDF)
├── 5_INTERFACES/ .............. Guia de screenshots (capturar 30 imagens)
├── 6_DIAGRAMAS/ ............... Diagramas Mermaid (renderizar 7 diagramas)
├── 7_MANUAL/ .................. Manual usuário (converter para PDF)
├── 8_HISTORICO/ ............... Git log exportado
└── README_REGISTRO.txt ........ Índice completo
```

---

## 📋 O QUE VOCÊ PRECISA FAZER AGORA

Seguir estes 7 passos simples:

---

### 🔴 PASSO 1: DOCUMENTOS PESSOAIS (30 min)

#### O que fazer:
Reunir e digitalizar seus documentos pessoais.

#### Como fazer:
1. **RG** (frente e verso):
   - Tirar foto ou escanear
   - Qualidade alta, legível
   - Salvar como: `RG_Samuel_Jesus_Santos.pdf`
   - Colocar na pasta: `REGISTRO_YUNA_V2.0/2_DOCUMENTOS_IDENTIFICACAO/`

2. **CPF**:
   - Acessar: https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp
   - Fazer print ou download
   - Salvar como: `CPF_Samuel_Jesus_Santos.pdf`
   - Colocar na mesma pasta

3. **Comprovante de Residência**:
   - Conta de luz, água ou internet (últimos 3 meses)
   - Escanear ou fotografar
   - Salvar como: `Comprovante_Residencia.pdf`
   - Colocar na mesma pasta

---

### 🔴 PASSO 2: ASSINAR DECLARAÇÃO (30 min + cartório)

#### O que fazer:
Assinar e reconhecer firma da declaração de autoria.

#### Como fazer:
1. **Abrir arquivo:**
   - `REGISTRO_YUNA_V2.0/1_FORMULARIOS/DECLARACAO_AUTORIA.md`

2. **Imprimir** (2 vias)

3. **Preencher à caneta:**
   - Seu CPF
   - Seu RG
   - Data de nascimento
   - Local e data de assinatura
   - **Assinar com caneta azul**

4. **Ir ao cartório** mais próximo:
   - Levar RG original
   - Pedir "reconhecimento de firma"
   - Custo: R$10-20

5. **Escanear** declaração reconhecida (alta qualidade)

6. **Salvar como:**
   - `DECLARACAO_AUTORIA_ASSINADA.pdf`
   - Colocar em: `REGISTRO_YUNA_V2.0/1_FORMULARIOS/`

---

### 🟡 PASSO 3: COMPACTAR CÓDIGO-FONTE (5 min)

#### O que fazer:
Executar script que cria automaticamente o ZIP do código.

#### Como fazer:

**Abrir PowerShell** na pasta do projeto:
```powershell
cd e:\APP\deploy
.\REGISTRO_YUNA_V2.0\3_CODIGO_FONTE\criar_zip_codigo_fonte.ps1
```

Aguardar mensagem: "✅ COMPACTAÇÃO CONCLUÍDA COM SUCESSO!"

Resultado: `codigo-fonte-yuna-v2.0.zip` (~500KB)

---

### 🟡 PASSO 4: CAPTURAR SCREENSHOTS (1-2 horas)

#### O que fazer:
Capturar 30 imagens das interfaces do sistema.

#### Como fazer:

1. **Abrir guia:**
   - `REGISTRO_YUNA_V2.0/5_INTERFACES/GUIA_CAPTURA_SCREENSHOTS.md`

2. **Baixar ferramenta** (Windows):
   - ShareX: https://getsharex.com/ (recomendado)
   - Ou usar "Ferramenta de Captura" do Windows

3. **Seguir lista** de 30 screenshots:
   - 11 do Portal Acompanhantes
   - 15 do Painel Admin
   - 4 do Console (módulos)

4. **Consolidar em PDF:**
   - Abrir PowerPoint
   - 1 slide por imagem
   - Adicionar legenda em cada
   - Exportar como: `YUNA_v2.0_Interfaces_Screenshots.pdf`

5. **Salvar em:**
   - `REGISTRO_YUNA_V2.0/5_INTERFACES/`

---

### 🟡 PASSO 5: RENDERIZAR DIAGRAMAS (30 min)

#### O que fazer:
Converter 7 diagramas de Mermaid para PNG/PDF.

#### Como fazer:

1. **Abrir:**
   - https://mermaid.live/ (ferramenta online)

2. **Abrir arquivo:**
   - `REGISTRO_YUNA_V2.0/6_DIAGRAMAS/DIAGRAMA_ARQUITETURA_GERAL.md`

3. **Para cada diagrama** (são 7):
   - Copiar código entre \`\`\`mermaid ... \`\`\`
   - Colar no mermaid.live
   - Clicar "Download PNG"
   - Salvar como: `01_arquitetura_geral.png`, `02_fluxo_solicitacao.png`, etc.

4. **Consolidar em PDF:**
   - Abrir PowerPoint
   - 1 slide por diagrama
   - Adicionar título
   - Exportar como: `YUNA_v2.0_Diagramas_Arquitetura.pdf`

5. **Salvar em:**
   - `REGISTRO_YUNA_V2.0/6_DIAGRAMAS/`

---

### 🟢 PASSO 6: CONVERTER DOCS PARA PDF (15 min)

#### O que fazer:
Converter documentação Markdown para PDF.

#### Como fazer:

**Opção A: Pandoc (melhor qualidade)**
```powershell
# Instalar: https://pandoc.org/installing.html
cd REGISTRO_YUNA_V2.0\4_DOCUMENTACAO_TECNICA\Documentos_Originais_Markdown

pandoc DOCUMENTACAO_REGISTRO_DIREITOS_AUTORAIS.md -o ..\DOCUMENTACAO_PRINCIPAL.pdf
pandoc ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.md -o ..\ADENDO_MODULOS.pdf
pandoc copilot-instructions.md -o ..\GUIA_PROGRAMACAO.pdf
```

**Opção B: Online (mais fácil)**
1. Acessar: https://www.markdowntopdf.com/
2. Upload de cada arquivo `.md`
3. Download do PDF gerado
4. Renomear e salvar em: `4_DOCUMENTACAO_TECNICA/`

**Converter também:**
- Manual do usuário: `7_MANUAL/MANUAL_USUARIO_YUNA_V2.0.md` → PDF

---

### 🔴 PASSO 7: REGISTRAR ONLINE (1-2 horas)

#### O que fazer:
Criar conta e submeter registro na Biblioteca Nacional.

#### Como fazer:

1. **Acessar:**
   - https://www.bn.gov.br/servicos/escritorio-direitos-autorais

2. **Criar conta** no sistema EDA:
   - Clicar "Criar Conta"
   - Preencher dados pessoais
   - Confirmar email

3. **Fazer login**

4. **Iniciar novo registro:**
   - Selecionar: "Programa de Computador"
   - Título: **"Yuna Solicite - Sistema de Gerenciamento de Solicitações"**
   - Versão: **2.0**

5. **Preencher formulário:**

   **Dados do Autor:**
   - Nome completo
   - CPF, RG
   - Endereço
   - Telefone, email

   **Dados da Obra:**
   - Título: YUNA - Sistema de Gerenciamento de Solicitações
   - Subtítulo: Sistema Web PWA para Gestão de Serviços em Clínicas
   - Ano: 2025-2026
   - País: Brasil
   - Idioma: Português (pt-BR)
   - Linhas de código: 19.825+

   **Descrição:**
   ```
   Sistema web progressivo (PWA) para gerenciamento de solicitações 
   de serviços em ambientes de saúde. Arquitetura multi-SPA com duas 
   interfaces independentes: Portal dos Acompanhantes e Painel 
   Administrativo. Inclui 4 módulos proprietários de otimização: 
   Performance Monitor, Listener Manager, Cache Manager LRU e Query 
   Helper. Sistema RBAC completo, real-time sync via Firestore, 
   session timeout automático, avaliação de satisfação com dashboard 
   analítico e exportação de relatórios detalhados em Excel.
   ```

6. **Anexar documentos:**
   - ✅ Declaração autoria assinada (PDF)
   - ✅ RG e CPF (PDF)
   - ✅ Comprovante residência (PDF)
   - ✅ Código-fonte (ZIP)
   - ✅ Documentação técnica (3 PDFs)
   - ✅ Screenshots (PDF)
   - ✅ Diagramas (PDF)
   - ✅ Manual usuário (PDF)
   - ✅ Histórico versões (TXT)

7. **Revisar tudo**

8. **Gerar boleto:**
   - Pessoa física: **R$20,00**
   - Validade: 3 dias úteis

9. **Pagar boleto** (internet banking)

10. **Acompanhar protocolo:**
    - Login no sistema EDA
    - Verificar status
    - Aguardar 5-7 dias úteis

---

### 🟢 PASSO 8 (RECOMENDADO): BACKUP E ALERTAS (30 min)

Para garantir operação contínua (3+ anos):

1. **Alerta de billing (GCP/Firebase):**
   - Criar budget mensal com alerta em 80% do valor
   - Enviar para seu email principal

2. **Backup do Firestore:**
   - Se tiver `gcloud`: `gcloud firestore export gs://<bucket>/backups/$(date +%Y%m%d)`
   - Sem `gcloud`: usar console Firebase (Firestore → Export/Import) ou exportar CSV/JSON das coleções e salvar em nuvem
   - Frequência recomendada: semanal; retenção: 6-12 meses

3. **Higienização/arquivamento:**
   - Se o volume crescer (>1M docs), arquivar solicitações concluídas há 6+ meses para coleção de histórico ou CSV/JSON em storage frio

4. **Métricas a acompanhar:**
   - Leituras Firestore/dia, cache hit rate, listeners ativos, latência p95, erros por hora

---

## ⏱️ CRONOGRAMA SUGERIDO

| Dia | O que fazer | Tempo |
|-----|-------------|-------|
| **Hoje** | Passos 1, 2, 3 | 2h |
| **Amanhã** | Passos 4, 5 | 2h |
| **Dia 3** | Passos 6, 7 | 2h |
| **Dia 4-5** | Aguardar compensação boleto | - |
| **Dia 5-12** | Análise da Biblioteca Nacional | - |

**TOTAL:** ~7-8 dias até certificado

---

## 💰 CUSTOS

- Registro BN: **R$20,00**
- Reconhecimento firma: **R$10-20,00**
- **TOTAL: R$30-40,00**

---

## ✅ CHECKLIST SIMPLIFICADO

**Antes de submeter online, tenha em mãos:**

- [ ] RG, CPF, comprovante (PDF)
- [ ] Declaração assinada e reconhecida (PDF)
- [ ] Screenshots consolidados (PDF)
- [ ] Diagramas consolidados (PDF)
- [ ] Docs técnicos convertidos (3 PDFs)
- [ ] Manual usuário (PDF)
- [ ] Código-fonte (ZIP)
- [ ] Histórico versões (TXT)

---

## 📞 DÚVIDAS?

### Biblioteca Nacional:
- **Site:** https://www.bn.gov.br/servicos/escritorio-direitos-autorais
- **Email:** eda@bn.gov.br
- **Tel:** (21) 2220-3096 / 2220-3097

### Suporte Técnico:
- **Email:** informaticasamtech@gmail.com
- **Tel:** +55 11 94586-4671

---

## 🎯 OBJETIVO FINAL

Obter **certificado digital de registro de direitos autorais** da **Biblioteca Nacional** para o **Yuna Solicite v2.0**, garantindo **proteção legal** da propriedade intelectual.

---

## 💡 DICA IMPORTANTE

**Faça um passo de cada vez, com calma!**

Não precisa fazer tudo em um dia. Siga o cronograma sugerido e você terá o certificado em ~1 semana.

---

**Boa sorte! 🚀**

Se tiver qualquer dúvida, estou à disposição no email: informaticasamtech@gmail.com

---

**Copyright © 2026 YUNA - Todos os direitos reservados**  
**Preparado automaticamente em:** Janeiro 2026
