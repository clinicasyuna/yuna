# ⚡ GUIA RÁPIDO - Recreação Automática de Usuários

## 🎯 O QUE FOI CRIADO PARA VOCÊ

Criei **4 ferramentas** para automatizar a recreação de usuários:

1. **executar-recreacao.ps1** ← 🌟 **COMECE AQUI!**
   - Menu interativo em PowerShell
   - Sem linhas de comando complicadas
   - Guia integrado e verificação de dependências

2. **enviar-emails-reset.js**
   - Envia emails de reset para os 7 usuários
   - Mais seguro e simples
   - Usuários criam suas próprias senhas

3. **recriar-usuarios.js**
   - Recria completo todos os usuários
   - Requer chave do Firebase
   - Totalmente automático e instantâneo

4. **OPCOES-RECREACAO-USUARIOS.md**
   - Guia completo com 3 opções
   - Comparação de cada abordagem
   - Troubleshooting

---

## ⚡ COMEÇAR AGORA (3 PASSOS)

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

### Passo 4: Escolher opção
- Digite `1` para enviar emails (RECOMENDADO)
- Digite `2` para recreação completa
- Digite `3` para ver guia
- Digite `4` para verificar dependências

---

## 📊 DADOS DOS USUÁRIOS

### Equipes:
```
nutricao.jardins@yuna.com.br         → Nuti@123456
manutencao.jardins@yuna.com.br       → Manu@123456
hotelaria.jardins@yuna.com.br        → Hotel@123456
recepcao.jardins@yuna.com.br         → Recep@123456
```

### Administradores:
```
edinar.leao@yuna.com.br              → Edi@123456
amanda.braga@yuna.com.br             → Aman@123456
caroline.chinaglia@yuna.com.br       → Carol@123456
```

---

## 🚀 OPÇÃO 1: EMAIL RESET (MAIS FÁCIL)

```powershell
cd e:\APP\deploy
node scripts\enviar-emails-reset.js
```

**O que acontece:**
1. Sistema envia 7 emails
2. Cada usuário clica no link
3. Cria nova senha
4. Faz login normalmente

**Vantagem:** Não precisa de chave Firebase!

---

## 🔄 OPÇÃO 2: RECREAÇÃO COMPLETA (MAIS PODEROSO)

### Pré-requisito: Obter Chave Firebase

1. Acesse: https://console.firebase.google.com
2. Projeto: `studio-5526632052-23813`
3. ⚙️ Configurações → Contas de Serviço → Gerar nova chave
4. Salve o arquivo JSON em: `scripts/firebase-service-account.json`

### Executar:

```powershell
# Primeira vez (instalar dependências)
npm install firebase-admin

# Depois, executar o script
node scripts\recriar-usuarios.js

# Quando solicitar, digite: confirmo
```

**O que acontece:**
1. Sistema deleta todos os 7 usuários
2. Recria cada um com nova senha
3. Tudo pronto instantaneamente

---

## 🔍 TROUBLESHOOTING

### "Comando não encontrado: node"
```powershell
# Instale Node.js em: https://nodejs.org/
# Reinicie o PowerShell depois
```

### "firebase-service-account.json não encontrado"
```powershell
# Crie a pasta scripts
mkdir scripts -Force

# Baixe o arquivo do Firebase Console
# Salve em: scripts/firebase-service-account.json
```

### "EmailJS não está configurado"
```
Verifique se o arquivo firebase-config-secure.js está correto
```

---

## ✅ VERIFICAÇÃO FINAL

Após executar um dos scripts, verifique se funcionou:

### Via Painel Admin:
1. Acesse: https://yuna.clinicasyuna.com/admin/
2. Faça login com um dos usuários
3. Exemplo: `nutricao.jardins@yuna.com.br` / `Nuti@123456`

### Sinais de Sucesso:
- ✅ Login funciona
- ✅ Dashboard carrega
- ✅ Usuário está ativo

---

## 📋 CHECKLIST PRÉ-EXECUÇÃO

- [ ] Node.js instalado? → `node --version`
- [ ] PowerShell aberto?
- [ ] Pasta correta? → `cd e:\APP\deploy`
- [ ] Senhas anotadas em local seguro?
- [ ] 10-15 minutos de tempo disponível?

---

## 🎯 PRÓXIMO PASSO

**Execute o script:**

```powershell
cd e:\APP\deploy
.\executar-recreacao.ps1
```

E escolha a opção que melhor se adequa ao seu caso:

| Situação | Opção |
|----------|-------|
| "Quero começar agora, sem complicações" | 1 (Email) |
| "Tenho a chave Firebase pronta" | 2 (Recreação) |
| "Não tenho certeza" | 3 (Ver guia) |
| "Deixa eu verificar o que tenho" | 4 (Verificar deps) |

---

## 💡 DICA FINAL

Se tiver qualquer dúvida durante a execução:

1. Leia o arquivo **OPCOES-RECREACAO-USUARIOS.md** (mais detalhes)
2. Leia o arquivo **INSTRUCOES-RECREACAO-USUARIOS.md** (passo a passo)
3. Verificar logs de erro (copiar e colar em pesquisa)

---

## 📞 SUPORTE RÁPIDO

**Problema? Tente:**

1. Abrir novo PowerShell como administrador
2. Executar: `npm install -g firebase-admin`
3. Tentar novamente

**Ainda não funciona?**

1. Verifique internet/firewall
2. Tente com VPN desativada
3. Reinicie o computador

---

**Status**: ✅ Scripts criados e prontos para usar  
**Data**: Dezembro 2025  
**Versão**: 1.0  
**Sistema**: YUNA

