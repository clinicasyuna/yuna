# ⚡ OPÇÃO 4: Atualizar Senhas Diretamente (NOVA!)

## 🎯 Quando Usar

Para emails **fictícios** que não recebem mensagens:
- nutricao.jardins@yuna.com.br
- manutencao.jardins@yuna.com.br
- hotelaria.jardins@yuna.com.br
- recepcao.jardins@yuna.com.br
- edinar.leao@yuna.com.br
- amanda.braga@yuna.com.br
- caroline.chinaglia@yuna.com.br

## 🚀 Como Fazer em 3 Passos

### 1. Baixar Chave do Firebase (5 min)

```
https://console.firebase.google.com
  → studio-5526632052-23813
  → ⚙️ Configurações
  → Contas de Serviço
  → Gerar nova chave privada
  → Salvar em: e:\APP\deploy\firebase-service-account.json
```

### 2. Instalar Dependências (2 min)

```powershell
cd e:\APP\deploy
npm install firebase-admin
```

### 3. Executar Script (2 min)

```powershell
cd e:\APP\deploy
node scripts\atualizar-senhas-direto.js
```

Digite `confirmo` quando solicitado.

## ✅ Pronto!

As 7 senhas foram atualizadas **diretamente no Firebase** sem enviar emails!

---

**Total**: 10 minutos desde o início até ter tudo funcionando

Leia o arquivo [ATUALIZAR-SENHAS-DIRETO.md](ATUALIZAR-SENHAS-DIRETO.md) para mais detalhes.
