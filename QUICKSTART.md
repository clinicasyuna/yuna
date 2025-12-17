# 🚀 QUICKSTART - Execução em 5 Minutos

## 1️⃣ Abra PowerShell

```powershell
# Pressione: Windows + R
# Digite: powershell
# Pressione: ENTER
```

## 2️⃣ Vá para a pasta

```powershell
cd e:\APP\deploy
```

## 3️⃣ Escolha uma forma de executar

### 🌟 FORMA 1: Menu Interativo (RECOMENDADO)

```powershell
.\executar-recreacao.ps1
```

**Depois escolha:**
- `1` para enviar emails (mais simples)
- `2` para recrear usuários (mais rápido se já tiver setup)
- `3` para ver guia
- `4` para verificar dependências

---

### ⚡ FORMA 2: Executar Diretamente

```powershell
# OPÇÃO 1: Enviar emails (recomendado)
node scripts\enviar-emails-reset.js

# OPÇÃO 2: Recrear completo (requer chave Firebase)
npm install firebase-admin
node scripts\recriar-usuarios.js
```

---

## 4️⃣ Acompanhe o Progresso

A tela mostrará algo assim:

```
╔══════════════════════════════════════════════════════════╗
║  📧 SCRIPT DE ENVIO DE EMAILS DE RESET DE SENHA          ║
╚══════════════════════════════════════════════════════════╝

1. 🔄 Processando: Nutricao Jardins (nutricao.jardins@yuna.com.br)
   ✅ Email de reset enviado para: nutricao.jardins@yuna.com.br

2. 🔄 Processando: Manutenção Jardins (manutencao.jardins@yuna.com.br)
   ✅ Email de reset enviado para: manutencao.jardins@yuna.com.br

... (e assim por diante para os 7 usuários)

✅ PROCESSAMENTO CONCLUÍDO (7/7 sucessos)
```

## 5️⃣ Notifique os Usuários

Avise os usuários que:

```
📧 Você recebeu um email para resetar sua senha YUNA.

1. Abra o email de: noreply@firebase.com
2. Clique no link "Resetar senha"
3. Crie uma nova senha (qualquer senha que você queira)
4. Faça login com sua nova senha

⏱️ IMPORTANTE: O link expira em 1 HORA
```

---

## ✅ Pronto!

Depois de alguns segundos, os usuários devem receber os emails.

---

## 🆘 SE DER ERRO

### Erro: "Command not found: node"

```powershell
# Instale Node.js:
# https://nodejs.org/

# Reinicie PowerShell
# Tente novamente
```

### Erro: "firebase-service-account.json not found"

Isso é normal na **Opção 1 (Email)** - ignore!

Se estiver tentando Opção 2:
1. Acesse: https://console.firebase.google.com
2. Baixe a chave JSON
3. Salve em: `scripts/firebase-service-account.json`

### "Ainda não funciona?"

Leia os arquivos:
- [COMECE-AQUI.md](COMECE-AQUI.md)
- [RESUMO-OPCOES.md](RESUMO-OPCOES.md)
- [OPCOES-RECREACAO-USUARIOS.md](OPCOES-RECREACAO-USUARIOS.md)

---

## 📋 USUÁRIOS E SENHAS

```
Equipe Nutrição:          nutricao.jardins@yuna.com.br     → Nuti@123456
Equipe Manutenção:        manutencao.jardins@yuna.com.br   → Manu@123456
Equipe Hotelaria:         hotelaria.jardins@yuna.com.br    → Hotel@123456
Equipe Higienização:      recepcao.jardins@yuna.com.br     → Recep@123456

Admin Edinar:             edinar.leao@yuna.com.br          → Edi@123456
Admin Amanda:             amanda.braga@yuna.com.br         → Aman@123456
Admin Caroline:           caroline.chinaglia@yuna.com.br   → Carol@123456
```

---

## ⏱️ Quanto Tempo Leva?

```
Menu Interativo:   1-2 min
Email Reset:       3-5 min (esperar os emails)
Recreação Completa: 2-3 min (instantâneo)
Manual via Painel:  5-10 min
```

---

## 🎯 Próximo Passo

Execute agora:

```powershell
cd e:\APP\deploy
.\executar-recreacao.ps1
```

Depois escolha a opção que preferir!

---

**Dúvidas?** Leia [COMECE-AQUI.md](COMECE-AQUI.md)

Vamos lá! 🚀
