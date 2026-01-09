# 📧 Guia de Boas Práticas - ti@yuna.com.br

## 1. Mudança Oficial de Contato Público

A partir de **9 de janeiro de 2026**, o contato público de suporte do **Yuna Solicite** é:

```
📧 ti@yuna.com.br
```

### Mudanças Aplicadas
- ✅ Rodapés em todas as SPAs (admin, acompanhantes, raiz) atualizado com botão flutuante
- ✅ Documentação completa (README, manuais, checklists) padronizada
- ✅ Scripts e pacotes de registro atualizados
- ✅ Nota clara em docs públicos sobre e-mail operacional do Firebase

### E-mail Operacional (Uso Interno)
```
🔐 samukajr82@gmail.com → Firebase Auth, autenticação interna
```
Este e-mail **não muda** e continua funcionando para acesso de sistemas backend.

---

## 2. Implementação Técnica

### SPA (Single Page Applications)

#### Admin (`/admin/`)
- **Antes:** Rodapé fixo com link `mailto:`
- **Agora:** Botão flutuante (FAB) canto inferior direito
  - Cores: Azul (`#3b82f6` → `#2563eb` gradient)
  - Ícone: 💬 (chat bubble)
  - Animação: Scale 1.1 ao hover, pop ao click
  - Tooltip: "Suporte" ao passar mouse

#### Acompanhantes (`/acompanhantes/`)
- **Antes:** Rodapé fixo em canto inferior
- **Agora:** Botão flutuante FAB
  - Cores: Verde (`#10b981` → `#059669` gradient)
  - Ícone: 💬 (chat bubble)
  - Animação: Idêntica ao admin

#### Raiz (`/`)
- **Antes:** Rodapé simples com link
- **Agora:** Sem FAB (página estática de entrada)
- Link `mailto:` mantido se necessário

### Especificações Técnicas do FAB
```css
/* Dimensões */
Width: 56px (48dp + 1.5x)
Height: 56px
Border-radius: 50%

/* Posicionamento */
Position: fixed
Bottom: 24px
Right: 24px
Z-index: 999999

/* Efeito Hover */
Transform: scale(1.1)
Transition: cubic-bezier(0.34, 1.56, 0.64, 1) 300ms

/* Sombra */
Box-shadow: 0 4px 12px rgba(color, 0.4)
Hover: 0 8px 20px rgba(color, 0.6)

/* Link */
href="mailto:ti@yuna.com.br?subject=Suporte%20Yuna%20Solicite"
```

---

## 3. Fluxo de Suporte

```
Usuário clica em FAB
    ↓
Abre cliente de e-mail padrão
    ↓
Pré-preenchido:
  To: ti@yuna.com.br
  Subject: "Suporte Yuna Solicite"
    ↓
Usuário escreve detalhes do problema
    ↓
Envia para inbox suporte
```

### Tratamento de Resposta
| Tipo de Solicitação | SLA Recomendado | Responsável |
|---------------------|-----------------|-------------|
| Bug crítico (offline) | 2h | Dev/Admin |
| Feature request | 24h | Product |
| Dúvida geral | 24-48h | Support Team |
| Cadastro/Acesso | 4h | Admin |

---

## 4. Configuração de Redirecionamento de E-mails

### Opção A: Gmail/Google Workspace (Recomendado)
1. Criar conta: **ti@yuna.com.br** em Google Workspace
2. Encaminhar para: **samukajr82@gmail.com**
3. Configurar forwarding automático:
   - Google Admin → Usuários → ti@yuna.com.br
   - Forwarding: ✅ Encaminhar cópias para samukajr82@gmail.com

### Opção B: Alias no Provedor Atual
Se já tem servidor de e-mail:
1. Criar alias: ti@yuna.com.br → samukajr82@gmail.com
2. Configurar SPF/DKIM/DMARC (ver `CONFIGURACAO_DNS_YUNA.md`)

### Opção C: Integração com Platform (SendGrid/AWS SES)
Se usa plataforma de envio:
```javascript
// EmailJS Config (admin/index.html)
emailjs.send(
  'service_id',
  'template_id',
  {
    from_name: 'Yuna Solicite',
    from_email: 'ti@yuna.com.br',  // ← Novo
    reply_to: 'ti@yuna.com.br',     // ← Novo
    // ... resto dos parâmetros
  }
);
```

---

## 5. Documentação e Comunicação

### Arquivos Atualizados
- [README.md](README.md) - "Email de contato"
- [INSTRUCOES_PROXIMOS_PASSOS.md](INSTRUCOES_PROXIMOS_PASSOS.md) - Seção "Suporte Técnico"
- [MANUAL_USUARIO.md](MANUAL_USUARIO.md) - Contato de suporte
- [Documentação de registro](DOCUMENTACAO_REGISTRO_DIREITOS_AUTORAIS.md) - E-mail autor
- [Especificações técnicas](ESPECIFICACOES_TECNICAS.md) - Contato
- [Copyright](COPYRIGHT.md) - Contato
- Pacote de registro: 6 arquivos atualizados

### Comunicação ao Usuários (Template)
```
📢 NOTIFICAÇÃO DE MUDANÇA DE CONTATO

Prezados Usuários,

Padronizamos o contato público de suporte do Yuna Solicite para:

📧 ti@yuna.com.br

Esta mudança reflete o profissionalismo do projeto e facilita:
✅ Respostas mais rápidas
✅ Histórico centralizado
✅ Escalação automática

O e-mail anterior (informaticasamtech@gmail.com) foi descontinuado.

Obrigado!
```

---

## 6. Monitoramento e Métricas

### O que Acompanhar
```
Daily:
  ✓ E-mails recebidos em ti@yuna.com.br
  ✓ Taxa de resposta
  ✓ Bounce/error rate

Weekly:
  ✓ Categorizar tickets por tipo
  ✓ Identificar padrões de dúvida
  ✓ Atualizar FAQ conforme necessário

Monthly:
  ✓ Análise de satisfação de suporte
  ✓ Tempo médio de resposta
  ✓ Ticket resolution rate
```

### Dashboard Sugerido (Planilha Google)
```
| Data | Assunto | Tipo | Prioridade | Resolvido | Tempo |
|------|---------|------|-----------|-----------|-------|
| 09/01 | Login problema | Bug | Alto | ✅ | 1h30m |
| 09/01 | Feature nova | Request | Médio | ⏳ | - |
```

---

## 7. Possíveis Expansões Futuras

### Chatbot com IA
```javascript
// Se implementar bot de suporte futuro
window.supportBot = {
  email: 'ti@yuna.com.br',
  fallbackHuman: 'samukajr82@gmail.com',
  responseTime: '< 5 min',
  languages: ['pt-BR', 'en']
};
```

### Sistema de Ticketing
- Migrar de mailto → plataforma de ticketing (ex: Freshdesk, Zendesk)
- Manter o FAB apontando para formulário integrado
- Redirecionar ti@yuna.com.br para sistema automático

### Help Center / Knowledge Base
- Criar portal de FAQ
- Link FAB pode abrir widget de chat em vez de e-mail
- Reduzir volume de tickets com self-service

---

## 8. Troubleshooting

### Cenário 1: E-mail não chega a ti@yuna.com.br
**Verificar:**
1. SPF/DKIM/DMARC configurados? (ver `CONFIGURACAO_DNS_YUNA.md`)
2. Domínio yuna.com.br tem MX records?
3. Google Workspace configurado e ativo?

**Solução:**
```bash
# Testar MX records
nslookup -type=MX yuna.com.br

# Testar SPF
dig yuna.com.br TXT | grep spf1
```

### Cenário 2: FAB não aparece em mobile
**Causa:** Overflow hidden no body/container
**Solução:** Z-index 999999 deve estar acima de tudo
```css
.support-fab { z-index: 999999 !important; }
body { overflow-y: auto; /* não overflow-hidden */ }
```

### Cenário 3: Forwarding de e-mail lento
**Causa:** Google Workspace delay ou filtro de spam
**Solução:** 
1. Usar Google Workspace nativo (não forwarding)
2. Aumentar polling de IMAP se usar cliente local
3. Configurar filtros para whitelist ti@yuna.com.br

---

## 9. Segurança

### SPF/DKIM/DMARC
✅ **Todos configurados** (ver documento separado)

### Proteção contra Phishing
- ✅ E-mail corporativo reduz risco
- ✅ DKIM assina mensagens
- ✅ DMARC define política anti-spoofing

### Rate Limiting
Se implementar formulário de contato adicional:
```javascript
// Limitar e-mails por IP
const emailRateLimit = {
  maxPerHour: 5,
  maxPerDay: 20,
  storage: 'localStorage'
};
```

---

## 10. Changelog

| Data | Mudança | Versão |
|------|---------|--------|
| 09/01/2026 | Padronizar para ti@yuna.com.br, adicionar FAB | 1.0 |
| TBD | Integrar ChatBot de IA | 2.0 |
| TBD | Sistema de ticketing full | 3.0 |

---

## 📞 Perguntas Frequentes

**P: Por que mudei de informaticasamtech@gmail.com para ti@yuna.com.br?**  
R: Profissionalismo, rastreabilidade e segurança. E-mail corporativo = maior confiança.

**P: O samukajr82@gmail.com deixou de funcionar?**  
R: Não. Continue como e-mail operacional (Firebase, sistemas internos).

**P: Como recebo e-mails em ti@yuna.com.br?**  
R: Via Google Workspace + forwarding para samukajr82@gmail.com (ou conforme sua configuração DNS).

**P: Posso responder de ti@yuna.com.br via Gmail?**  
R: Sim! Adicione como "Enviar como" no Gmail:
   - Configurações → Contas → Adicionar outro endereço de e-mail

**P: E se o usuário não tiver cliente de e-mail?**  
R: Implementar formulário de contato futuro com validação CAPTCHA.

---

**Mantido por:** Equipe YUNA  
**Última atualização:** 9 de janeiro de 2026  
**Próxima revisão:** 31 de janeiro de 2026
