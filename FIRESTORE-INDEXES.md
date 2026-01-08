# 📊 Índices Firestore Necessários - Sistema YUNA

## 🎯 Objetivo
Documento completo dos índices compostos necessários no Firestore para otimizar queries e suportar 300+ pacientes.

## ⚠️ Importância
Sem estes índices, queries complexas com múltiplos `where()` + `orderBy()` **FALHARÃO** com erro:
```
Error: The query requires an index. You can create it here: [link]
```

---

## 📋 Índices Obrigatórios

### 1. **Solicitações por Status e Data**
**Query:** Buscar solicitações de um status específico ordenadas por data

**Campos:**
- Collection: `solicitacoes`
- Fields:
  1. `status` (Ascending)
  2. `criadoEm` (Descending)

**Comando Firebase CLI:**
```bash
firebase firestore:indexes:create \
  --collection-group=solicitacoes \
  --field-path=status \
  --field-path=criadoEm --order=desc
```

**Link Geração Manual:**
Console Firebase → Firestore → Indexes → Create Index

---

### 2. **Solicitações por Equipe e Data**
**Query:** Buscar solicitações de uma equipe específica ordenadas por data

**Campos:**
- Collection: `solicitacoes`
- Fields:
  1. `equipe` (Ascending)
  2. `criadoEm` (Descending)

**Comando Firebase CLI:**
```bash
firebase firestore:indexes:create \
  --collection-group=solicitacoes \
  --field-path=equipe \
  --field-path=criadoEm --order=desc
```

---

### 3. **Solicitações por Equipe, Status e Data**
**Query:** Buscar solicitações de uma equipe com status específico ordenadas por data

**Campos:**
- Collection: `solicitacoes`
- Fields:
  1. `equipe` (Ascending)
  2. `status` (Ascending)
  3. `criadoEm` (Descending)

**Comando Firebase CLI:**
```bash
firebase firestore:indexes:create \
  --collection-group=solicitacoes \
  --field-path=equipe \
  --field-path=status \
  --field-path=criadoEm --order=desc
```

---

### 4. **Solicitações por Usuário e Data**
**Query:** Buscar solicitações de um usuário específico ordenadas por data

**Campos:**
- Collection: `solicitacoes`
- Fields:
  1. `usuarioId` (Ascending)
  2. `criadoEm` (Descending)

**Comando Firebase CLI:**
```bash
firebase firestore:indexes:create \
  --collection-group=solicitacoes \
  --field-path=usuarioId \
  --field-path=criadoEm --order=desc
```

---

### 5. **Solicitações por Usuário, Status e Data**
**Query:** Buscar solicitações de um usuário com status específico ordenadas por data

**Campos:**
- Collection: `solicitacoes`
- Fields:
  1. `usuarioId` (Ascending)
  2. `status` (Ascending)
  3. `criadoEm` (Descending)

**Comando Firebase CLI:**
```bash
firebase firestore:indexes:create \
  --collection-group=solicitacoes \
  --field-path=usuarioId \
  --field-path=status \
  --field-path=criadoEm --order=desc
```

---

### 6. **Solicitações Finalizadas Não Avaliadas**
**Query:** Buscar solicitações finalizadas pendentes de avaliação

**Campos:**
- Collection: `solicitacoes`
- Fields:
  1. `usuarioId` (Ascending)
  2. `status` (Ascending)
  3. `avaliada` (Ascending)
  4. `finalizadoEm` (Descending)

**Comando Firebase CLI:**
```bash
firebase firestore:indexes:create \
  --collection-group=solicitacoes \
  --field-path=usuarioId \
  --field-path=status \
  --field-path=avaliada \
  --field-path=finalizadoEm --order=desc
```

---

### 7. **Usuários Ativos por Email**
**Query:** Buscar usuários ativos ordenados por email (para paginação)

**Campos:**
- Collection: `usuarios_acompanhantes`
- Fields:
  1. `ativo` (Ascending)
  2. `email` (Ascending)

**Comando Firebase CLI:**
```bash
firebase firestore:indexes:create \
  --collection-group=usuarios_acompanhantes \
  --field-path=ativo \
  --field-path=email --order=asc
```

**Repetir para outras coleções de usuários:**
```bash
# usuarios_equipe
firebase firestore:indexes:create \
  --collection-group=usuarios_equipe \
  --field-path=ativo \
  --field-path=email --order=asc

# usuarios_admin
firebase firestore:indexes:create \
  --collection-group=usuarios_admin \
  --field-path=ativo \
  --field-path=email --order=asc
```

---

### 8. **Quartos Ocupados Ativos**
**Query:** Buscar quartos ocupados (para validação)

**Campos:**
- Collection: `quartos_ocupados`
- Fields:
  1. `quarto` (Ascending)
  2. `ativo` (Ascending)

**Comando Firebase CLI:**
```bash
firebase firestore:indexes:create \
  --collection-group=quartos_ocupados \
  --field-path=quarto \
  --field-path=ativo
```

---

## 🚀 Como Criar os Índices

### **Opção 1: Via Console Firebase (Recomendado)**

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto YUNA
3. Vá em **Firestore Database** → **Indexes**
4. Clique em **Create Index**
5. Configure cada índice manualmente:
   - Collection: `solicitacoes` (ou outra conforme tabela acima)
   - Adicione os campos na ordem especificada
   - Configure Ascending/Descending conforme tabela
   - Clique em **Create Index**

### **Opção 2: Via Firebase CLI**

1. Instale Firebase CLI (se não tiver):
   ```bash
   npm install -g firebase-tools
   ```

2. Faça login:
   ```bash
   firebase login
   ```

3. Inicialize o projeto:
   ```bash
   firebase init firestore
   ```

4. Execute cada comando listado acima individualmente

5. Aguarde criação (pode levar 5-10 minutos por índice)

### **Opção 3: Aguardar Erro Automático (Não Recomendado)**

1. Use o sistema normalmente
2. Quando uma query falhar, Firebase mostrará link direto
3. Clique no link para criar o índice automaticamente
4. **Desvantagem:** Sistema fica quebrado até índice ser criado

---

## ⏱️ Tempo de Criação

| Tamanho da Coleção | Tempo Estimado por Índice |
|--------------------|---------------------------|
| < 1.000 documentos | 1-2 minutos |
| 1.000 - 10.000 docs | 5-10 minutos |
| 10.000+ documentos | 10-30 minutos |

**⚠️ IMPORTANTE:** Crie os índices em **horário de baixo uso** (madrugada) para evitar impacto nos usuários.

---

## 📊 Verificar Índices Criados

### **Via Console:**
Firebase Console → Firestore → Indexes → Verificar lista

### **Via CLI:**
```bash
firebase firestore:indexes:list
```

### **Status dos Índices:**
- ⏳ **Building** - Sendo criado (aguarde)
- ✅ **Enabled** - Ativo e funcional
- 🔴 **Error** - Falha na criação (recriar)

---

## 🎯 Índices por Prioridade

### **PRIORIDADE CRÍTICA (Criar AGORA):**
1. Solicitações por Status e Data (#1)
2. Solicitações por Equipe e Data (#2)
3. Solicitações por Usuário e Data (#4)

### **PRIORIDADE ALTA (Criar em 24h):**
4. Solicitações por Equipe, Status e Data (#3)
5. Usuários Ativos por Email (#7)

### **PRIORIDADE MÉDIA (Criar em 1 semana):**
6. Solicitações por Usuário, Status e Data (#5)
7. Solicitações Finalizadas Não Avaliadas (#6)
8. Quartos Ocupados Ativos (#8)

---

## 💾 Backup do firestore.indexes.json

Crie arquivo `firestore.indexes.json` na raiz do projeto:

```json
{
  "indexes": [
    {
      "collectionGroup": "solicitacoes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "criadoEm", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "solicitacoes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "equipe", "order": "ASCENDING" },
        { "fieldPath": "criadoEm", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "solicitacoes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "equipe", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "criadoEm", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "solicitacoes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "usuarioId", "order": "ASCENDING" },
        { "fieldPath": "criadoEm", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "solicitacoes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "usuarioId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "criadoEm", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "solicitacoes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "usuarioId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "avaliada", "order": "ASCENDING" },
        { "fieldPath": "finalizadoEm", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "usuarios_acompanhantes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ativo", "order": "ASCENDING" },
        { "fieldPath": "email", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "usuarios_equipe",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ativo", "order": "ASCENDING" },
        { "fieldPath": "email", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "usuarios_admin",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ativo", "order": "ASCENDING" },
        { "fieldPath": "email", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "quartos_ocupados",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "quarto", "order": "ASCENDING" },
        { "fieldPath": "ativo", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy via CLI:
```bash
firebase deploy --only firestore:indexes
```

---

## 📞 Suporte

Em caso de dúvidas:
1. Verificar logs do Firebase Console
2. Consultar [Documentação Oficial](https://firebase.google.com/docs/firestore/query-data/indexing)
3. Testar queries no **Query Builder** do console

---

**Última atualização:** 08/01/2026  
**Versão do documento:** 1.0  
**Compatível com:** Firebase SDK 9.23.0
