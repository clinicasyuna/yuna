# âš¡ GUIA RÃPIDO - RecreaÃ§Ã£o AutomÃ¡tica de UsuÃ¡rios

## ðŸŽ¯ O QUE FOI CRIADO PARA VOCÃŠ

Criei **4 ferramentas** para automatizar a recreaÃ§Ã£o de usuÃ¡rios:

1. **executar-recreacao.ps1** â† ðŸŒŸ **COMECE AQUI!**
   - Menu interativo em PowerShell
   - Sem linhas de comando complicadas
   - Guia integrado e verificaÃ§Ã£o de dependÃªncias

2. **enviar-emails-reset.js**
   - Envia emails de reset para os 7 usuÃ¡rios
   - Mais seguro e simples
   - UsuÃ¡rios criam suas prÃ³prias senhas

3. **recriar-usuarios.js**
   - Recria completo todos os usuÃ¡rios
   - Requer chave do Firebase
   - Totalmente automÃ¡tico e instantÃ¢neo

4. **OPCOES-RECREACAO-USUARIOS.md**
   - Guia completo com 3 opÃ§Ãµes
   - ComparaÃ§Ã£o de cada abordagem
   - Troubleshooting

---

## âš¡ COMEÃ‡AR AGORA (3 PASSOS)

### Passo 1: Abrir PowerShell
```powershell
# Pressione Windows + R
powershell
```

### Passo 2: Navegar para a pasta
```powershell
cd e:\APP\deploy
```

### Passo 3: Executar o menu
```powershell
.\executar-recreacao.ps1
```

### Passo 4: Escolher opÃ§Ã£o
- Digite `1` para enviar emails (RECOMENDADO)
- Digite `2` para recreaÃ§Ã£o completa
- Digite `3` para ver guia
- Digite `4` para verificar dependÃªncias

---

## ðŸ“Š DADOS DOS USUÃRIOS

### Equipes:
```
nutricao.jardins@yuna.com.br         â†’ Nuti@123456
manutencao.jardins@yuna.com.br       â†’ Manu@123456
hotelaria.jardins@yuna.com.br        â†’ Hotel@123456
recepcao.jardins@yuna.com.br         â†’ Recep@123456
```

### Administradores:
```
edinar.leao@yuna.com.br              â†’ Edi@123456
amanda.braga@yuna.com.br             â†’ Aman@123456
caroline.chinaglia@yuna.com.br       â†’ Carol@123456
```

---

## ðŸš€ OPÃ‡ÃƒO 1: EMAIL RESET (MAIS FÃCIL)

```powershell
cd e:\APP\deploy
node scripts\enviar-emails-reset.js
```

**O que acontece:**
1. Sistema envia 7 emails
2. Cada usuÃ¡rio clica no link
3. Cria nova senha
4. Faz login normalmente

**Vantagem:** NÃ£o precisa de chave Firebase!

---

## ðŸ”„ OPÃ‡ÃƒO 2: RECREAÃ‡ÃƒO COMPLETA (MAIS PODEROSO)

### PrÃ©-requisito: Obter Chave Firebase

1. Acesse: https://console.firebase.google.com
2. Projeto: `app-pedidos-4656c`
3. âš™ï¸ ConfiguraÃ§Ãµes â†’ Contas de ServiÃ§o â†’ Gerar nova chave
4. Salve o arquivo JSON em: `scripts/firebase-service-account.json`

### Executar:

```powershell
# Primeira vez (instalar dependÃªncias)
npm install firebase-admin

# Depois, executar o script
node scripts\recriar-usuarios.js

# Quando solicitar, digite: confirmo
```

**O que acontece:**
1. Sistema deleta todos os 7 usuÃ¡rios
2. Recria cada um com nova senha
3. Tudo pronto instantaneamente

---

## ðŸ” TROUBLESHOOTING

### "Comando nÃ£o encontrado: node"
```powershell
# Instale Node.js em: https://nodejs.org/
# Reinicie o PowerShell depois
```

### "firebase-service-account.json nÃ£o encontrado"
```powershell
# Crie a pasta scripts
mkdir scripts -Force

# Baixe o arquivo do Firebase Console
# Salve em: scripts/firebase-service-account.json
```

### "EmailJS nÃ£o estÃ¡ configurado"
```
Verifique se o arquivo firebase-config-secure.js estÃ¡ correto
```

---

## âœ… VERIFICAÃ‡ÃƒO FINAL

ApÃ³s executar um dos scripts, verifique se funcionou:

### Via Painel Admin:
1. Acesse: https://yuna.clinicasyuna.com/admin/
2. FaÃ§a login com um dos usuÃ¡rios
3. Exemplo: `nutricao.jardins@yuna.com.br` / `Nuti@123456`

### Sinais de Sucesso:
- âœ… Login funciona
- âœ… Dashboard carrega
- âœ… UsuÃ¡rio estÃ¡ ativo

---

## ðŸ“‹ CHECKLIST PRÃ‰-EXECUÃ‡ÃƒO

- [ ] Node.js instalado? â†’ `node --version`
- [ ] PowerShell aberto?
- [ ] Pasta correta? â†’ `cd e:\APP\deploy`
- [ ] Senhas anotadas em local seguro?
- [ ] 10-15 minutos de tempo disponÃ­vel?

---

## ðŸŽ¯ PRÃ“XIMO PASSO

**Execute o script:**

```powershell
cd e:\APP\deploy
.\executar-recreacao.ps1
```

E escolha a opÃ§Ã£o que melhor se adequa ao seu caso:

| SituaÃ§Ã£o | OpÃ§Ã£o |
|----------|-------|
| "Quero comeÃ§ar agora, sem complicaÃ§Ãµes" | 1 (Email) |
| "Tenho a chave Firebase pronta" | 2 (RecreaÃ§Ã£o) |
| "NÃ£o tenho certeza" | 3 (Ver guia) |
| "Deixa eu verificar o que tenho" | 4 (Verificar deps) |

---

## ðŸ’¡ DICA FINAL

Se tiver qualquer dÃºvida durante a execuÃ§Ã£o:

1. Leia o arquivo **OPCOES-RECREACAO-USUARIOS.md** (mais detalhes)
2. Leia o arquivo **INSTRUCOES-RECREACAO-USUARIOS.md** (passo a passo)
3. Verificar logs de erro (copiar e colar em pesquisa)

---

## ðŸ“ž SUPORTE RÃPIDO

**Problema? Tente:**

1. Abrir novo PowerShell como administrador
2. Executar: `npm install -g firebase-admin`
3. Tentar novamente

**Ainda nÃ£o funciona?**

1. Verifique internet/firewall
2. Tente com VPN desativada
3. Reinicie o computador

---

**Status**: âœ… Scripts criados e prontos para usar  
**Data**: Dezembro 2025  
**VersÃ£o**: 1.0  
**Sistema**: YUNA


