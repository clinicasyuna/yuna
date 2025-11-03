# 🚨 CORREÇÃO URGENTE - USUÁRIOS DE EQUIPE

## ❌ **PROBLEMA IDENTIFICADO**

O usuário `manutencao.jardins@yuna.com.br` está na **coleção errada** do Firestore:

- **Situação atual:** Está em `usuarios_admin` 
- **Situação correta:** Deveria estar em `usuarios_equipe`
- **Resultado:** Sistema o identifica como super admin

## 🔧 **SOLUÇÃO IMEDIATA**

### **OPÇÃO 1: Correção Automática (Recomendado)**

1. **Abra o console (F12)**
2. **Execute o comando:**
```javascript
corrigirTodosUsuarios()
```
3. **Aguarde a correção automática**
4. **Recarregue a página**

### **OPÇÃO 2: Correção Manual**

#### **Passo 1: Diagnosticar**
```javascript
diagnosticarUsuarios()
```

#### **Passo 2: Verificar usuário específico**
```javascript
verificarUsuarioEspecifico('manutencao.jardins@yuna.com.br')
```

#### **Passo 3: Mover para coleção correta**
```javascript
moverUsuarioParaEquipe('manutencao.jardins@yuna.com.br', 'manutencao')
```

## 📋 **CORREÇÕES NECESSÁRIAS**

### **Usuários que precisam ser movidos:**

1. **Manutenção:**
   - Email: `manutencao.jardins@yuna.com.br`
   - De: `usuarios_admin` → Para: `usuarios_equipe` 
   - Campo equipe: `"manutencao"`

2. **Hotelaria:**
   - Email: `caroline.chinaglia@yuna.com.br`
   - De: `usuarios_admin` → Para: `usuarios_equipe`
   - Campo equipe: `"hotelaria"`

3. **Higienização:**
   - Email: `recepcao.jardins@yuna.com.br`
   - De: `usuarios_admin` → Para: `usuarios_equipe`
   - Campo equipe: `"higienizacao"`

4. **Nutrição:**
   - Email: `leticia.costa@yuna.com.br`
   - De: `usuarios_admin` → Para: `usuarios_equipe`
   - Campo equipe: `"nutricao"`

## ✅ **ESTRUTURA CORRETA APÓS CORREÇÃO**

### **Coleção `usuarios_equipe`:**
```json
{
  "nome": "Equipe Manutenção",
  "email": "manutencao.jardins@yuna.com.br",
  "role": "equipe",
  "equipe": "manutencao",
  "ativo": true,
  "dataCriacao": "2025-10-30T...",
  "dataMigracao": "2025-10-30T...",
  "migradoDe": "usuarios_admin"
}
```

### **Coleção `usuarios_admin`:**
Deve conter **APENAS** super administradores como:
```json
{
  "nome": "Samuel Lacerda",
  "email": "samuel.lacerda@yuna.com.br", 
  "role": "super_admin",
  "ativo": true,
  "dataCriacao": "2025-10-30T..."
}
```

## 🧪 **VERIFICAÇÃO APÓS CORREÇÃO**

### **1. Testar login de manutenção:**
- Login: `manutencao.jardins@yuna.com.br`
- **Deve mostrar:** "Painel Manutenção" (não "Super Administrador")
- **Deve ver:** Apenas 1 painel (Manutenção)
- **Não deve ver:** Botões administrativos

### **2. Executar validação:**
```javascript
executarTodosOsTestes()
```

### **3. Verificar filtros:**
```javascript
testarFiltrosSolicitacoes()
```

## 🎯 **COMANDOS RÁPIDOS**

### **Corrigir tudo de uma vez:**
```javascript
corrigirTodosUsuarios()
```

### **Ver ajuda completa:**
```javascript
correcaoHelp()
```

### **Verificar se corrigiu:**
```javascript
diagnosticarUsuarios()
```

## ⚠️ **IMPORTANTE**

- **Execute apenas com login de super admin** (`samuel.lacerda@yuna.com.br`)
- **Faça backup** antes da correção (se necessário)
- **Recarregue a página** após a correção
- **Teste cada usuário** após a migração

---

## 🚀 **EXECUÇÃO IMEDIATA**

**Execute no console agora:**
```javascript
corrigirTodosUsuarios()
```

**Depois recarregue a página e teste novamente o login da equipe de manutenção.**

---

**Data:** ${new Date().toLocaleString('pt-BR')}  
**Status:** CORREÇÃO URGENTE NECESSÁRIA