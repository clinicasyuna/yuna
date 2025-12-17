# 🚀 3 OPÇÕES DE AUTOMAÇÃO PARA RECREAÇÃO DE USUÁRIOS

## 📊 COMPARAÇÃO DAS OPÇÕES

| Aspecto | Opção 1: Admin SDK | Opção 2: Email Reset | Opção 3: Manual Admin |
|---------|------------------|-------------------|---------------------|
| **Complexidade** | ⭐⭐⭐ Alta | ⭐ Baixa | ⭐⭐ Média |
| **Rapidez** | Imediata | Depende do usuário | Depende do usuário |
| **Segurança** | ⭐⭐⭐ Excelente | ⭐⭐⭐ Excelente | ⭐⭐ Boa |
| **Requer Setup** | Chave de serviço | Só Node.js | Painel admin |
| **Tempo para Começar** | 10-15 min | 2-3 min | 1-2 min |
| **Melhor Para** | Produção | Testes | Emergências |

---

## ✅ OPÇÃO 1: RECREAÇÃO COMPLETA (Admin SDK)

### O Que Faz?
- ❌ Deleta usuário do Authentication
- ❌ Deleta usuário do Firestore
- ✅ Recria com nova senha
- ✅ Respeita permissões originais

### Vantagens
- ✨ Totalmente automático
- 🔒 Novo usuário "limpo" (sem histórico)
- ⚡ Instantâneo - sem depender do usuário

### Desvantagens
- ⚙️ Requer chave de serviço do Firebase (mais setup)
- 📋 Requer Node.js + npm
- 🔑 Precisa proteger a chave de serviço

### Como Executar

```powershell
# 1. Instalar dependências (PRIMEIRA VEZ)
cd e:\APP\deploy
npm install firebase-admin

# 2. Adicionar chave de serviço em: scripts/firebase-service-account.json
# (Veja instruções em INSTRUCOES-RECREACAO-USUARIOS.md)

# 3. Executar script
node scripts\recriar-usuarios.js

# 4. Digitar "confirmo" quando solicitado
```

### Resultado
```
✅ TODOS OS USUÁRIOS FORAM RECRIADOS COM SUCESSO!

Equipes: nutricao.jardins@yuna.com.br / Nuti@123456
Admin: edinar.leao@yuna.com.br / Edi@123456
```

---

## 📧 OPÇÃO 2: EMAIL DE RESET (Recomendado para Começar)

### O Que Faz?
- 📨 Envia email de reset para cada usuário
- 🔗 Usuário clica link e cria nova senha
- ✅ Mantém os usuários existentes intactos
- 🔐 Seguro e conforme padrões Firebase

### Vantagens
- 🟢 **MAIS SEGURO** (padrão Firebase)
- 📝 **MAIS SIMPLES** (sem chave de serviço)
- 👤 **MANTÉM HISTÓRICO** do usuário
- 🚀 Começa em 2 minutos
- ✅ Não requer configurações complexas

### Desvantagens
- ⏱️ Depende do usuário receber email (5-10 min)
- 🔗 Link expira em 1 hora
- 👤 Usuário deve estar ciente

### Como Executar

```powershell
# 1. Instalar Node.js se não tiver
node --version

# 2. Executar script
cd e:\APP\deploy
node scripts\enviar-emails-reset.js

# 3. Pronto! Emails estão sendo enviados
```

### O Que Acontece Depois

1. Usuário recebe email de reset
2. Clica no link
3. Cria nova senha: `Nuti@123456` (conforme configurado)
4. Faz login normalmente

**Exemplo de Email Recebido:**
```
From: Firebase <noreply@firebase.com>
Subject: Reset your password

Para resetar sua senha YUNA, clique no link abaixo:
https://yuna.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=...

O link expira em 1 hora.
```

---

## 🔑 OPÇÃO 3: ALTERAR VIA PAINEL ADMIN (Manual)

### O Que Faz?
- 🎯 Usar o painel admin YUNA
- 👥 Selecionar cada usuário
- 🔐 Clicar "Alterar Senha"
- 📧 Sistema envia email automaticamente

### Vantagens
- 🟢 Sem linhas de comando
- 🟢 Interface familiar
- 🟢 Sem scripts ou dependências
- 🟢 Controle visual completo

### Desvantagens
- ⚠️ Manual (7 usuários = ~5-10 minutos)
- 📊 Repetitivo
- 🐌 Mais lento que automação

### Como Executar

1. **Acesse o Painel Admin**
   ```
   https://yuna.clinicasyuna.com/admin/
   ```

2. **Faça login como super_admin**
   ```
   samuel.lacerda@yuna.com.br / (sua senha)
   ```

3. **Vá para "Gerenciar Usuários"**
   - Clique em "👥 Gerenciar Usuários"

4. **Para cada usuário:**
   - Clique no email do usuário
   - Clique no botão "🔐 Alterar Senha"
   - Confirme
   - Sistema enviará email automaticamente

5. **Repita para os 7 usuários:**
   - nutricao.jardins@yuna.com.br
   - manutencao.jardins@yuna.com.br
   - hotelaria.jardins@yuna.com.br
   - recepcao.jardins@yuna.com.br
   - edinar.leao@yuna.com.br
   - amanda.braga@yuna.com.br
   - caroline.chinaglia@yuna.com.br

---

## 🎯 RECOMENDAÇÃO FINAL

### Para Você Agora:
**Comece com a OPÇÃO 2 (Email Reset)** ✅

**Por quê?**
- ✨ Mais seguro (padrão Firebase)
- 🚀 Mais rápido de começar (2 min)
- 🟢 Sem complicações
- 📧 Auditável (email trail)
- 👤 Mantém histórico dos usuários

### Depois, Opcionalmente:
Se precisar fazer isso regularmente → **Opção 1 (Admin SDK)**

### Se Tiver Pressa:
Usar **Opção 3 (Manual via Painel)** enquanto os scripts são testados

---

## 🔄 FLUXO DE DECISÃO

```
┌─ Precisa fazer agora mesmo?
│  ├─ SIM, AGORA → Use Opção 3 (Manual)
│  └─ NÃO
│
└─ Vai repetir isso frequentemente?
   ├─ SIM → Use Opção 1 (Admin SDK)
   └─ NÃO → Use Opção 2 (Email Reset)
```

---

## 📋 CHECKLIST PRÉ-EXECUÇÃO

### Para Opção 1 (Admin SDK):
- [ ] Node.js instalado? → `node --version`
- [ ] Arquivo JSON do Firebase baixado?
- [ ] Pasta `scripts/` criada?
- [ ] Arquivo em `scripts/firebase-service-account.json`?
- [ ] `npm install firebase-admin` executado?

### Para Opção 2 (Email Reset):
- [ ] Node.js instalado? → `node --version`
- [ ] Teste de email funcionando?
- [ ] Usuários têm acesso aos emails?
- [ ] Links de reset não expiram antes do uso?

### Para Opção 3 (Manual):
- [ ] Painel admin acessível?
- [ ] Super_admin logado?
- [ ] Tempo disponível (~5-10 min)?
- [ ] Senhas anotadas em local seguro?

---

## ⚡ COMANDOS RÁPIDOS

### Opção 1:
```powershell
npm install firebase-admin
# Adicionar firebase-service-account.json
node scripts\recriar-usuarios.js
```

### Opção 2:
```powershell
node scripts\enviar-emails-reset.js
```

### Opção 3:
Abrir navegador → https://yuna.clinicasyuna.com/admin/ → Gerenciar Usuários

---

## 🆘 PRÓXIMOS PASSOS

**Qual opção você escolhe?**

1. **Opção 1?** → Leia [INSTRUCOES-RECREACAO-USUARIOS.md](INSTRUCOES-RECREACAO-USUARIOS.md)
2. **Opção 2?** → Execute `node scripts\enviar-emails-reset.js`
3. **Opção 3?** → Acesse o painel admin e faça manualmente

---

**Data**: Dezembro 2025  
**Sistema**: YUNA  
**Versão**: 1.0
