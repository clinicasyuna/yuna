# 📧 Configuração de E-mail ti@yuna.com.br no Hostinger

## 🎯 Objetivo
Configurar o e-mail **ti@yuna.com.br** para receber e enviar mensagens de suporte do sistema YUNA.

---

## ✅ **OPÇÃO RECOMENDADA: E-mail Hostinger (Titan)**

O Hostinger oferece **e-mail profissional gratuito** por 3 meses, depois R$ 9,99/mês.

### 📋 **Passos no Hostinger**

#### **1. Acessar o Painel**
1. Login em: https://hpanel.hostinger.com
2. Menu lateral → **Emails**
3. Selecionar domínio: **yuna.com.br**

#### **2. Criar Conta de E-mail**
1. Clicar em **"Criar Conta de E-mail"**
2. Preencher:
   - **Nome:** `ti`
   - **Domínio:** `@yuna.com.br` (já selecionado)
   - **Senha:** [escolher senha forte]
3. **Ativar** → Aguardar 5-10 minutos para propagação

#### **3. Configurar Redirecionamento (Opcional)**
Para que e-mails de ti@yuna.com.br cheguem também em samukajr82@gmail.com:

1. Acessar: **Emails** → **Redirecionamentos**
2. Clicar em **"Criar Redirecionamento"**
3. Preencher:
   - **De:** ti@yuna.com.br
   - **Para:** samukajr82@gmail.com
4. **Salvar**

---

## 📱 **Acessar o E-mail ti@yuna.com.br**

### **Opção A: Webmail Hostinger (Titan)**
1. Acessar: https://mail.hostinger.com
2. Login:
   - **E-mail:** ti@yuna.com.br
   - **Senha:** [sua senha]

### **Opção B: Gmail (Adicionar como Conta)**
1. No Gmail (samukajr82@gmail.com):
   - **Configurações** → **Contas e Importação**
   - **Verificar e-mail de outras contas** → **Adicionar conta de e-mail**

2. Preencher:
   - **E-mail:** ti@yuna.com.br
   - **Importar e-mails:** ✅ Sim

3. Configurações IMAP/POP3:
   ```
   Servidor de entrada (IMAP):
   - Servidor: imap.hostinger.com
   - Porta: 993
   - SSL: Sim
   - Usuário: ti@yuna.com.br
   - Senha: [sua senha]
   ```

4. Agora pode **ler e-mails de ti@yuna.com.br** no Gmail!

### **Opção C: Enviar COMO ti@yuna.com.br pelo Gmail**
1. No Gmail → **Configurações** → **Contas e Importação**
2. **Enviar e-mail como** → **Adicionar outro endereço**
3. Preencher:
   - **Nome:** Suporte YUNA
   - **E-mail:** ti@yuna.com.br
4. Configurações SMTP:
   ```
   Servidor de saída (SMTP):
   - Servidor: smtp.hostinger.com
   - Porta: 465
   - SSL: Sim
   - Usuário: ti@yuna.com.br
   - Senha: [sua senha]
   ```
5. **Verificar** (Gmail envia código de confirmação)
6. Pronto! Agora pode **responder como ti@yuna.com.br** no Gmail

---

## 🔒 **DNS Automático (Já Configurado pelo Hostinger)**

Quando você cria um e-mail no Hostinger, os registros DNS são configurados automaticamente:

### **Verificar se está configurado:**
1. Painel Hostinger → **Domínios**
2. Selecionar **yuna.com.br**
3. **Zona DNS** → Verificar se existe:

```
Tipo: MX
Nome: @
Valor: mx1.hostinger.com
Prioridade: 10

Tipo: MX
Nome: @
Valor: mx2.hostinger.com
Prioridade: 20

Tipo: TXT
Nome: @
Valor: v=spf1 include:_spf.hostinger.com ~all
```

✅ **Se esses registros existem, está tudo certo!** Não precisa fazer nada.

---

## ⚡ **Testar o E-mail**

### **Teste 1: Receber E-mails**
1. De outro e-mail (ex: Gmail pessoal), envie para: **ti@yuna.com.br**
2. Aguarde 1-2 minutos
3. Verifique:
   - Webmail Hostinger: https://mail.hostinger.com
   - Gmail (se configurou redirecionamento/importação)

### **Teste 2: Enviar E-mails**
1. Entre no Webmail Hostinger ou Gmail (com "Enviar como")
2. Compose novo e-mail
3. **De:** ti@yuna.com.br
4. **Para:** Seu e-mail pessoal
5. **Assunto:** Teste de envio
6. Enviar e verificar se chegou

### **Teste 3: Sistema YUNA**
1. Acesse o site: https://clinicasyuna.github.io/yuna/
2. Clique no **botão flutuante de suporte** (💬 no canto inferior direito)
3. Deve abrir seu cliente de e-mail com:
   - **Para:** ti@yuna.com.br
   - **Assunto:** Suporte Yuna Solicite

---

## 🚨 **Troubleshooting**

### **Problema 1: E-mail não chega**
**Verificar:**
```bash
# No PowerShell ou CMD:
nslookup -type=MX yuna.com.br
```

**Deve retornar:**
```
yuna.com.br MX preference = 10, mail exchanger = mx1.hostinger.com
yuna.com.br MX preference = 20, mail exchanger = mx2.hostinger.com
```

**Se não aparecer:** Aguardar 24h para propagação DNS.

---

### **Problema 2: Gmail não aceita IMAP/SMTP**
**Solução:**
1. Verificar se **senha está correta**
2. Verificar se **porta e SSL estão corretos**
3. No Hostinger, verificar se **"Acesso IMAP/POP3"** está ativado:
   - Emails → Gerenciar → Configurações → IMAP ✅

---

### **Problema 3: E-mails indo para SPAM**
**Solução:**
1. Pedir para destinatários marcarem como **"Não é spam"**
2. No Hostinger, ativar **DKIM** (se disponível):
   - Emails → Configurações → Segurança → DKIM ✅
3. Aguardar 7 dias para reputação melhorar

---

## 💰 **Custos Hostinger**

| Plano | Preço | Armazenamento | Contas |
|-------|-------|---------------|--------|
| **Business Email (Titan)** | R$ 9,99/mês | 10 GB | 1 conta |
| **Profissional** | R$ 14,99/mês | 50 GB | 100 contas |

**Grátis por 3 meses** se ativar no primeiro mês de hospedagem.

---

## 📞 **Suporte Hostinger**

- **Chat ao vivo:** 24/7 no hpanel.hostinger.com
- **Tutoriais:** https://support.hostinger.com/pt-BR/
- **Telefone:** +55 0800 878 8467

---

## 🎯 **Resumo Rápido (5 minutos)**

1. ✅ Login em hpanel.hostinger.com
2. ✅ Criar e-mail: ti@yuna.com.br
3. ✅ (Opcional) Configurar redirecionamento para samukajr82@gmail.com
4. ✅ Testar enviando/recebendo e-mail
5. ✅ (Opcional) Adicionar ao Gmail para gerenciar tudo em um lugar

**Pronto!** Agora ti@yuna.com.br está funcionando e o botão de suporte no site está pronto para usar. 🚀

---

## 📝 **Próximos Passos Opcionais**

### **1. Assinatura Profissional**
No Webmail Hostinger → Configurações → Assinatura:
```
--
Suporte YUNA
Sistema de Gerenciamento de Solicitações
📧 ti@yuna.com.br
🌐 https://clinicasyuna.github.io/yuna/
```

### **2. Resposta Automática (Fora do Expediente)**
Emails → Gerenciar → Resposta Automática:
```
Obrigado pelo contato!

Recebemos sua mensagem e responderemos em até 24 horas úteis.

Atenciosamente,
Equipe YUNA
```

### **3. Alertas de E-mail no Celular**
- **Android:** Instalar app "Hostinger Mail" ou configurar IMAP no Gmail app
- **iOS:** Configurações → Contas → Adicionar Conta → Outro → ti@yuna.com.br

---

**Última atualização:** 9 de janeiro de 2026  
**Mantido por:** Equipe YUNA
