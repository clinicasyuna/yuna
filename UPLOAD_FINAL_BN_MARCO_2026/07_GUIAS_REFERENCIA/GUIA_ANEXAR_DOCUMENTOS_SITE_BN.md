# 📤 GUIA COMPLETO: ANEXAR DOCUMENTOS NO SITE DA BIBLIOTECA NACIONAL

**Protocolo INP:** 000984.0381795/2025  
**Data de Criação:** 14 de janeiro de 2026  
**Autor:** Samuel dos Reis Lacerda Junior | CNPJ: 55.004.442/0001-06  
**Status Pagamento:** ✅ R$210 (BN) + R$80 (INP) = R$290 PAGO

---

## 🎯 QUANDO USAR ESTE GUIA

**Execute estes passos APÓS:**
1. ✅ Voltar do cartório com documento autenticado (Sábado 18/01)
2. ✅ Escanear documento em alta resolução (300 DPI, PDF)
3. ✅ Salvar em: `E:\APP\deploy\REENVIO_BN_JANEIRO_2026\`

---

## 📋 CHECKLIST PRÉ-ENVIO

Antes de começar, certifique-se de ter:

### ✅ Documento Cartorizado:
- [ ] Declaração de Autoria e Originalidade YUNA SOLICITE v2.0
- [ ] Com reconhecimento de firma por autenticidade
- [ ] Escaneado em PDF (300 DPI mínimo)
- [ ] Arquivo salvo como: `Declaracao_Autoria_Autenticada.pdf`

### ✅ Documentos Técnicos:
- [ ] `YUNA_v2.0_Interfaces_Screenshots.pdf` (29 capturas)
- [ ] `ADENDO_REGISTRO_MODULOS_OTIMIZACAO_2026.pdf`
- [ ] `CORRECAO-MODAL-TIMEOUT.md` (ou convertido para PDF)
- [ ] `ESPECIFICACOES_TECNICAS.pdf` (v2.0)
- [ ] `MANUAL_USUARIO.pdf` (v2.0)
- [ ] `HISTORICO_DESENVOLVIMENTO.pdf` (v2.0)
- [ ] `CHECKLIST_REGISTRO.pdf` (v2.0)

### ✅ Código-Fonte:
- [ ] `codigo-fonte-yuna-v2.0.zip` (2.24 MB)
- [ ] `HASHES.txt`

### ✅ Ofício:
- [ ] `01_OFICIO_COMPLEMENTACAO.md` (impresso, assinado, escaneado)

---

## 🌐 PARTE 1: PREPARAR DOCUMENTOS

### Passo 1: Organizar Arquivos

Criar pasta para upload:
```
REENVIO_BN_JANEIRO_2026/
└── UPLOAD_BN/
    ├── 01_OFICIO_COMPLEMENTACAO.pdf
    ├── 02_DECLARACAO_AUTENTICADA.pdf
    ├── 03_SCREENSHOTS_INTERFACES.pdf
    ├── 04_MODULOS_OTIMIZACAO.pdf
    ├── 05_CORRECAO_SEGURANCA.pdf
    ├── 06_ESPECIFICACOES_TECNICAS.pdf
    ├── 07_MANUAL_USUARIO.pdf
    ├── 08_HISTORICO_DESENVOLVIMENTO.pdf
    ├── 09_CHECKLIST_REGISTRO.pdf
    ├── 10_CODIGO_FONTE.zip
    └── 11_HASHES.txt
```

**⚠️ IMPORTANTE:** 
- Todos os arquivos em PDF (exceto .zip e .txt)
- Nomes claros e sequenciais
- Tamanho total < 100 MB (preferível < 50 MB)

---

### Passo 2: Converter Markdown para PDF (se necessário)

**Para converter ofício MD → PDF:**

**Opção 1: Edge/Chrome**
1. Abrir `01_OFICIO_COMPLEMENTACAO.md` no VS Code
2. Ctrl+Shift+V (preview)
3. Ctrl+P → Imprimir
4. "Salvar como PDF"
5. Nome: `01_OFICIO_COMPLEMENTACAO.pdf`

**Opção 2: Pandoc (se instalado)**
```powershell
pandoc 01_OFICIO_COMPLEMENTACAO.md -o 01_OFICIO_COMPLEMENTACAO.pdf
```

---

### Passo 3: Validar Tamanhos

Verificar tamanho de cada arquivo:
```powershell
cd E:\APP\deploy\REENVIO_BN_JANEIRO_2026\UPLOAD_BN\
Get-ChildItem | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
```

**Limites recomendados:**
- Arquivo individual: < 10 MB
- Total: < 50 MB (ideal) ou < 100 MB (máximo)

**Se exceder:**
- Comprimir PDFs: https://www.ilovepdf.com/compress_pdf
- Reduzir qualidade de screenshots (de 300 DPI para 150 DPI)
- Dividir envio em 2 partes (se necessário)

---

## 🌐 PARTE 2: ACESSAR SITE DA BIBLIOTECA NACIONAL

### Passo 4: Entrar no Sistema

**URL:** https://www.bn.gov.br/

1. **Localizar seção de Registro:**
   - Menu superior: "Serviços"
   - Submenu: "Direitos Autorais"
   - Ou direto: https://www.bn.gov.br/explore/servicos/direitos-autorais

2. **Acessar sistema de registro:**
   - Procurar: "Sistema de Registro de Obras"
   - Ou: "Protocolo Digital"
   - Ou: "Acompanhamento de Processo"

3. **Fazer Login:**
   - Email: (seu email cadastrado)
   - Senha: (sua senha)
   - Ou: Login via Gov.br (se disponível)

**⚠️ SE NÃO TIVER ACESSO AO SISTEMA:**
- Ligar: (21) 3878-9898
- Email: copyright@bn.gov.br
- Informar: "Tenho protocolo 000984.0381795/2025 e preciso anexar documentos complementares"

---

### Passo 5: Localizar Seu Protocolo

**No sistema da BN:**

1. Acessar: "Meus Processos" ou "Consultar Protocolo"

2. Buscar por:
   - Número do protocolo: **000984.0381795/2025**
   - Ou pelo nome: "Yuna Solicite v2.0"
   - Ou por CPF/CNPJ

3. Clicar no protocolo para abrir detalhes

---

## 📤 PARTE 3: ANEXAR DOCUMENTOS

### Passo 6: Opção de Complementação

**Dentro do protocolo, procurar:**

- Botão: "Anexar Documentos"
- Ou: "Adicionar Complementação"
- Ou: "Enviar Documentos Adicionais"
- Ou: "Protocolar Ofício"

**Se não houver botão visível:**
1. Procurar aba: "Documentos" ou "Anexos"
2. Ou seção: "Ações Disponíveis"
3. Ou link: "Solicitar Complementação"

**⚠️ SE NÃO ENCONTRAR:**
- **NÃO FECHE O NAVEGADOR**
- Print screen da tela
- Ligar imediatamente: (21) 3878-9898
- Explicar: "Estou no protocolo mas não vejo opção de anexar"

---

### Passo 7: Upload dos Documentos

**Ordem de upload (seguir sequência):**

1. **OFÍCIO (PRIMEIRO):**
   - `01_OFICIO_COMPLEMENTACAO.pdf`
   - Tipo: "Ofício" ou "Requerimento"
   - Descrição: "Ofício de complementação de documentação v2.0"

2. **DECLARAÇÃO AUTENTICADA:**
   - `02_DECLARACAO_AUTENTICADA.pdf`
   - Tipo: "Declaração" ou "Documento Pessoal"
   - Descrição: "Declaração de autoria com reconhecimento de firma"

3. **DOCUMENTAÇÃO NOVA:**
   - `03_SCREENSHOTS_INTERFACES.pdf`
   - Tipo: "Documentação Técnica" ou "Anexo"
   - Descrição: "29 capturas de tela das interfaces do sistema"
   
   - `04_MODULOS_OTIMIZACAO.pdf`
   - Tipo: "Documentação Técnica"
   - Descrição: "Adendo - 4 módulos de otimização proprietários v2.0"
   
   - `05_CORRECAO_SEGURANCA.pdf`
   - Tipo: "Documentação Técnica"
   - Descrição: "Correção de segurança crítica em modal de timeout"

4. **DOCUMENTAÇÃO ATUALIZADA:**
   - `06_ESPECIFICACOES_TECNICAS.pdf`
   - `07_MANUAL_USUARIO.pdf`
   - `08_HISTORICO_DESENVOLVIMENTO.pdf`
   - `09_CHECKLIST_REGISTRO.pdf`
   - Tipo: "Documentação Técnica" (todos)
   - Descrição: "Documentação técnica atualizada v2.0"

5. **CÓDIGO-FONTE:**
   - `10_CODIGO_FONTE.zip`
   - Tipo: "Código-Fonte" ou "Arquivo Compactado"
   - Descrição: "Código-fonte completo v2.0 (19.825+ LOC)"
   
   - `11_HASHES.txt`
   - Tipo: "Documento Técnico"
   - Descrição: "Hashes SHA256 para verificação de integridade"

---

### Passo 8: Preencher Formulário de Complementação

**Campos comuns:**

| Campo | Resposta |
|-------|----------|
| **Protocolo de referência** | 000984.0381795/2025 |
| **Tipo de solicitação** | Complementação de Documentação |
| **Motivo** | Envio de documentação técnica atualizada (v2.0) e evidências de interface |
| **Descrição** | Conforme ofício anexado, encaminho documentação complementar referente à versão 2.0 do software Yuna Solicite, incluindo 29 screenshots de interface, 4 módulos proprietários de otimização, correção de segurança e documentação técnica atualizada. |
| **Quantidade de arquivos** | 11 arquivos |

---

### Passo 9: Revisar e Protocolar

**ANTES DE CLICAR "ENVIAR":**

✅ Revisar checklist:
- [ ] Todos os 11 arquivos anexados
- [ ] Nomes dos arquivos corretos
- [ ] Tamanhos dentro do limite
- [ ] Descrições preenchidas
- [ ] Protocolo de referência correto (000984.0381795/2025)

✅ Fazer backup:
- Print screen de CADA tela
- Salvar prints em: `REENVIO_BN_JANEIRO_2026/PRINTS_PROTOCOLO/`

✅ Anotar:
- Data e hora do envio: ___/___/2026 às ___:___
- Número de protocolo (se gerar novo): ________________
- Número de confirmação: ________________

**ENTÃO:**
- Clicar: "Enviar" ou "Protocolar" ou "Finalizar"
- Aguardar tela de confirmação
- **NÃO FECHAR O NAVEGADOR** até ver confirmação

---

## 📧 PARTE 4: CONFIRMAÇÃO E ACOMPANHAMENTO

### Passo 10: Comprovante de Protocolo

**Após envio bem-sucedido:**

1. **Salvar comprovante:**
   - Baixar PDF do comprovante (se disponível)
   - Ou: Print screen da tela de confirmação
   - Salvar como: `Comprovante_Complementacao_BN.pdf`

2. **Anotar informações:**
   ```
   ✅ CONFIRMAÇÃO DE ENVIO
   
   Data: ___/___/2026
   Hora: ___:___
   Protocolo original: 000984.0381795/2025
   Protocolo complementação: ________________ (se houver)
   Quantidade de arquivos: 11
   Tamanho total: ___ MB
   
   Status: Documentos anexados com sucesso ✅
   ```

3. **Email de confirmação:**
   - Verificar caixa de entrada
   - Procurar email da BN
   - Salvar email como PDF

---

### Passo 11: Ligar para Confirmar Recebimento

**24-48h após envio:**

☎️ Ligar: **(21) 3878-9898**

**Script da ligação:**
```
BN: Olá, Biblioteca Nacional.

Você: Bom dia! Gostaria de confirmar o recebimento de documentação 
      complementar que enviei ontem/anteontem pelo sistema digital.
      
      Meu protocolo é 000984.0381795/2025.

BN: [verificando sistema]

Você: Enviei 11 arquivos via sistema, incluindo ofício de complementação,
      declaração autenticada e documentação técnica v2.0.

BN: [confirmação ou orientação]

Você: Perfeito! Posso anotar seu nome para referência?

BN: [nome do atendente]

Você: Obrigado! Há alguma previsão de análise?

BN: [resposta]

Você: Entendido. Muito obrigado!
```

**Anotar:**
- Data da ligação: ___/___/2026
- Atendente: ________________
- Confirmação: ✅ Recebido / ⚠️ Não recebido / 🔄 Em análise
- Previsão: ________________
- Observações: ________________

---

### Passo 12: Acompanhamento

**Verificar status semanalmente:**

1. **No sistema da BN:**
   - Acessar protocolo
   - Ver se status mudou
   - Verificar mensagens/notificações

2. **Por telefone (se necessário):**
   - Ligar 1x por semana
   - Perguntar status
   - Anotar progresso

3. **Por email:**
   - Enviar email semanal para: copyright@bn.gov.br
   - Assunto: "[PROTOCOLO 000984.0381795/2025] Acompanhamento de Complementação"
   - Corpo: Breve, perguntando status

**Timeline esperada:**
- Semana 1: Recebimento confirmado
- Semana 2-4: Em análise
- Semana 4-8: Parecer técnico
- Semana 8-12: Conclusão do registro

---

## 🚨 PLANO B: SE O SISTEMA NÃO FUNCIONAR

### Opção 1: Email Formal

**Para:** copyright@bn.gov.br  
**Assunto:** [PROTOCOLO 000984.0381795/2025] Complementação de Documentação - Yuna Solicite v2.0

**Corpo:**
```
Prezados Senhores,

Venho por este meio encaminhar complementação de documentação relativa 
ao processo de registro de programa de computador sob protocolo 
nº 000984.0381795/2025.

Anexo a este email:
1. Ofício de complementação
2. Declaração de autoria autenticada em cartório
3. Documentação técnica v2.0 (9 PDFs)
4. Código-fonte (link Google Drive)

Link do código-fonte: [inserir link]

Atenciosamente,
Samuel dos Reis Lacerda Junior
CNPJ: 55.004.442/0001-06
Telefone: +55 11 94586-4671
```

**⚠️ LIMITE EMAIL: 25 MB**
- Se exceder, usar Google Drive ou WeTransfer
- Enviar link no email
- Manter link ativo por 30 dias

---

### Opção 2: Presencial

**Se tudo falhar, ir presencialmente:**

📍 **Endereço:**
```
Biblioteca Nacional do Brasil
Av. Rio Branco, 219 - Centro
Rio de Janeiro, RJ - CEP 20040-008
```

🕐 **Horário:**
- Segunda a Sexta, 9h às 17h

📞 **Ligar ANTES de ir:**
- (21) 3878-9898
- Confirmar atendimento presencial
- Agendar horário (se necessário)

**Levar:**
- Impressos: Ofício + Declaração (originais)
- USB/HD: Todos os PDFs + ZIP
- Documento: RG/CPF
- Comprovante: Pagamento R$290

---

## 📞 CONTATOS DE EMERGÊNCIA

### Biblioteca Nacional
- ☎️ Telefone: (21) 3878-9898
- 📧 Email: copyright@bn.gov.br
- 🌐 Site: www.bn.gov.br
- 📍 Endereço: Av. Rio Branco, 219 - Centro - RJ

### Ouvidoria BN
- ☎️ 0800 021 0104
- 📧 ouvidoria@bn.gov.br

### INPI (para questões de taxa INP)
- ☎️ (21) 3037-3000
- 🌐 www.gov.br/inpi

---

## 📋 CHECKLIST FINAL PÓS-ENVIO

- [ ] Documentos anexados no sistema BN
- [ ] Comprovante de protocolo salvo
- [ ] Print screens de todas as telas salvos
- [ ] Ligação de confirmação feita (24-48h)
- [ ] Status anotado
- [ ] Acompanhamento semanal agendado
- [ ] Backup de todos os arquivos mantido
- [ ] Email de confirmação recebido e salvo

---

## 🎯 RESUMO EXECUTIVO

**O QUE FAZER NO SÁBADO (18/01):**
1. ✅ Ir ao cartório
2. ✅ Reconhecimento de firma por autenticidade
3. ✅ Voltar para casa
4. ✅ Escanear documento (300 DPI, PDF)
5. ✅ Salvar em: `E:\APP\deploy\REENVIO_BN_JANEIRO_2026\`
6. ✅ ME CHAMAR AQUI para próximos passos

**O QUE VOU TE AJUDAR:**
1. Organizar arquivos para upload
2. Acessar sistema da BN
3. Passo a passo de anexação
4. Validar envio
5. Acompanhar protocolo

---

## 💡 DICAS IMPORTANTES

✅ **FAÇA:**
- Backup de tudo antes de enviar
- Print screen de cada tela
- Ligue para confirmar recebimento
- Acompanhe semanalmente

❌ **NÃO FAÇA:**
- Enviar arquivos corrompidos
- Fechar navegador sem salvar comprovante
- Esquecer de anotar protocolo
- Deixar de acompanhar

---

**📍 VOCÊ ESTÁ AQUI:**
✅ Documentos prontos  
✅ Taxa paga (R$290)  
⏳ Aguardando cartório (Sábado 18/01)  
⏳ Após cartório: Anexar documentos no site BN  
⏳ Acompanhar até conclusão  

---

**PREPARADO EM:** 14 de janeiro de 2026  
**PROTOCOLO:** 000984.0381795/2025  
**STATUS:** ✅ PRONTO PARA USAR  

**Quando voltar do cartório, ME CHAME que eu te ajudo passo a passo! 🚀**
