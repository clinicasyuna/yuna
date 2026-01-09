# 🔧 Configuração DNS para ti@yuna.com.br

## Resumo Executivo
Este documento descreve as configurações recomendadas de DNS para o domínio **yuna.com.br**, essenciais para:
- ✅ Entregas confiáveis de e-mails
- ✅ Autenticação segura
- ✅ Prevenção de falsificação (phishing)
- ✅ Reputação de envio

---

## 1. SPF (Sender Policy Framework)

### O que é?
Autoriza quais servidores podem enviar e-mails em nome do seu domínio.

### Configuração Recomendada

**Adicione este registro TXT no DNS:**

```
Nome: yuna.com.br
Tipo: TXT
Valor: v=spf1 include:google.com ~all
```

**Variações por provedor:**

| Provedor | Incluir |
|----------|---------|
| **Google Workspace** | `include:google.com` |
| **SendGrid** | `include:sendgrid.net` |
| **Amazon SES** | `include:amazonses.com` |
| **Office 365** | `include:outlook.com` |
| **Nenhum (apenas receber)** | `v=spf1 -all` |

**Exemplo completo com vários provedores:**
```
v=spf1 include:google.com include:sendgrid.net include:amazonses.com ~all
```

---

## 2. DKIM (DomainKeys Identified Mail)

### O que é?
Assina criptograficamente e-mails para provar que vieram do seu domínio.

### Configuração

**Passo 1:** Gerar chave DKIM no seu provedor:
- **Google Workspace:** Google Admin → Apps → Gmail → Autenticação → Adicionar DKIM
- **SendGrid:** Settings → Sender Authentication → Verify Domain
- **Amazon SES:** Domains → Create DKIM

**Passo 2:** Adicionar registros TXT ao DNS

Seu provedor fornecerá registros como:
```
Nome: default._domainkey.yuna.com.br
Tipo: CNAME ou TXT
Valor: [fornecido pelo provedor]
```

**Múltiplos seletores DKIM (opcional, para redundância):**
```
default._domainkey.yuna.com.br  → CNAME para [provedor1]
sendgrid._domainkey.yuna.com.br → CNAME para [provedor2]
```

---

## 3. DMARC (Domain-based Message Authentication)

### O que é?
Define política de ação para e-mails que falham em SPF/DKIM.

### Configuração Recomendada

**Fase 1: Monitoramento (semanas 1-4)**
```
Nome: _dmarc.yuna.com.br
Tipo: TXT
Valor: v=DMARC1; p=none; rua=mailto:dmarc@yuna.com.br; ruf=mailto:dmarc@yuna.com.br
```

**Fase 2: Quarentena (semanas 5-8)**
```
Valor: v=DMARC1; p=quarantine; rua=mailto:dmarc@yuna.com.br; ruf=mailto:dmarc@yuna.com.br
```

**Fase 3: Rejeição (após 8+ semanas, se 100% SPF/DKIM)**
```
Valor: v=DMARC1; p=reject; rua=mailto:dmarc@yuna.com.br; ruf=mailto:dmarc@yuna.com.br
```

**Parâmetros:**
- `p=none` → Apenas relatar, não rejeitar
- `p=quarantine` → Marcar como spam
- `p=reject` → Rejeitar completamente
- `rua` → E-mail para relatórios agregados
- `ruf` → E-mail para relatórios forenses

---

## 4. MX Records (Mail Exchange)

### Verificar Configuração Existente

```bash
nslookup -type=MX yuna.com.br
```

**Deve retornar algo como:**
```
yuna.com.br MX preference = 10, mail exchanger = aspmx.l.google.com
yuna.com.br MX preference = 20, mail exchanger = alt1.aspmx.l.google.com
```

Se vazio, adicione ao DNS:
```
Nome: yuna.com.br
Tipo: MX
Priorit: 10
Valor: aspmx.l.google.com
```

---

## 5. CNAME para Subdomínios

### Configurar ti@yuna.com.br (Opcional)

Se deseja que `ti@yuna.com.br` seja um subdomínio com autenticação separada:

```
Nome: ti.yuna.com.br
Tipo: MX
Priorit: 10
Valor: aspmx.l.google.com  (ou seu provedor)
```

---

## 📋 Checklist de Implementação

### Fase 1: Preparação (Dia 1)
- [ ] Definir provedor de e-mail (Gmail/Office 365/SendGrid/SES)
- [ ] Contatar suporte do provedor para instruções DKIM
- [ ] Documentar SPF, DKIM, DMARC valores

### Fase 2: Configuração DNS (Dia 2-3)
- [ ] Acessar painel de controle DNS (registrar)
- [ ] Adicionar SPF record
- [ ] Adicionar DKIM records (conforme provedor)
- [ ] Adicionar DMARC com `p=none` (monitoramento)
- [ ] Verificar propagação DNS (4-24h): `nslookup -type=TXT yuna.com.br`

### Fase 3: Validação (Dia 4-7)
- [ ] Enviar e-mail teste para Gmail (gmail.com)
- [ ] Clicar "Mostrar detalhes" → Verificar autenticação
- [ ] Usar ferramentas de teste:
  - [Google Admin Toolbox](https://toolbox.googleapps.com/apps/checkmx/)
  - [MXToolbox](https://mxtoolbox.com/)
  - [DMAReporting](https://dmarcreporting.gmail.com/)

### Fase 4: Produção (Dia 8+)
- [ ] Monitorar relatórios DMARC por 2-4 semanas
- [ ] Upgrade DMARC de `p=none` → `p=quarantine` → `p=reject`
- [ ] Comunicar novo e-mail de contato (ti@yuna.com.br) aos usuários

---

## 🔍 Testes de Validação

### Teste 1: SPF
```bash
dig yuna.com.br TXT | grep "v=spf1"
```

**Resultado esperado:**
```
yuna.com.br. 300 IN TXT "v=spf1 include:google.com ~all"
```

### Teste 2: DKIM
```bash
dig default._domainkey.yuna.com.br TXT
```

**Resultado esperado:**
```
[chave publica criptografada em formato Base64]
```

### Teste 3: DMARC
```bash
dig _dmarc.yuna.com.br TXT
```

**Resultado esperado:**
```
_dmarc.yuna.com.br. 300 IN TXT "v=DMARC1; p=none; rua=mailto:dmarc@yuna.com.br"
```

### Teste 4: SMTP Completo (Enviar e-mail teste)
1. Abrir Gmail
2. Enviar e-mail para qualquer endereço
3. Clicar seta ↓ → "Mostrar original"
4. Procurar por:
   - ✅ `spf=pass` ou `spf=softfail`
   - ✅ `dkim=pass`
   - ✅ `dmarc=pass`

Se aparecer **❌ failed**, investigar:
```
X-Goog-Original-From: [verificar origem]
Received-SPF: [erro específico]
```

---

## 📊 Monitoramento Contínuo

### Ferramentas Recomendadas

| Ferramenta | URL | Função |
|-----------|-----|--------|
| **Google Admin Toolbox** | toolbox.googleapps.com | SPF, DKIM, MX, SMTP |
| **MXToolbox** | mxtoolbox.com | Diagnóstico completo |
| **DMARC Analytics** | dmarcreporting.gmail.com | Relatórios de entrega |
| **250ok** | 250ok.com | Score de reputação |

### Métricas a Acompanhar

```
Semanal:
- Taxa de entrega (Target: >98%)
- Bounce rate (Target: <3%)
- DMARC alignment pass % (Target: >95%)
- Relatórios de spam (Target: <0.1%)

Mensal:
- Reputação de IP (Barracuda, etc)
- Blacklist status (UCEPROTECTL, Spamhaus)
- Phishing/malware alerts
```

---

## ⚠️ Troubleshooting

### Problema: SPF Softfail, não Pass
**Causa:** Ordem dos includes no SPF
**Solução:** Verificar que `~all` (softfail) está no final, ou mudar para `-all` (hardfail)

### Problema: DKIM signature inválida
**Causa:** Seletor DKIM incorreto ou chave não propagada
**Solução:** 
1. Aguardar 24h para propagação DNS
2. Gerar nova chave DKIM
3. Verificar expiração da chave anterior

### Problema: DMARC mostra "alignment=fail"
**Causa:** Domínio "From:" é diferente do domínio DKIM
**Solução:** Usar e-mail com domínio yuna.com.br (ex: ti@yuna.com.br, não gmail.com)

### Problema: E-mails indo para SPAM
**Causa:** SPF/DKIM/DMARC não configurados, ou volume muito alto
**Solução:**
1. Validar toda a cadeia SPF→DKIM→DMARC
2. Usar bulk mail warming (aumentar volume gradualmente)
3. Verificar IP em blacklists: mxtoolbox.com/blacklists

---

## 🔐 Segurança Adicional

### DANE (DNSSEC - Opcional)
Para máxima segurança, adicione validação DANE:
```
_25._tcp.yuna.com.br TLSA [gerado por provedor]
```

### CAA Records (Certificate Authority Authorization)
Restringir quem pode emitir certificados SSL:
```
yuna.com.br CAA 0 issue "letsencrypt.org"
```

---

## 📞 Suporte

**Para dúvidas sobre configuração DNS:**
- **Suporte YUNA:** ti@yuna.com.br
- **Seu registrar (ex. NameCheap, GoDaddy):** Contato suporte
- **Seu provedor e-mail (ex. Google):** Admin console

---

## Referências

- [RFC 7208: SPF](https://tools.ietf.org/html/rfc7208)
- [RFC 6376: DKIM](https://tools.ietf.org/html/rfc6376)
- [RFC 7489: DMARC](https://tools.ietf.org/html/rfc7489)
- [Google: SPF Setup](https://support.google.com/a/answer/178723)
- [Microsoft: DKIM Guide](https://docs.microsoft.com/en-us/microsoft-365/security/office-365-security/use-dkim-to-validate-outbound-email)

---

**Versão:** 1.0  
**Atualizado em:** 9 de janeiro de 2026  
**Mantido por:** Equipe YUNA
