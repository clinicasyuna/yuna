# SOLUÇÃO: Email já está sendo usado por outro usuário

## Problema Identificado
O erro `Firebase: The email address is already in use by another account. (auth/email-already-in-use)` acontece porque:

1. **Você excluiu o usuário do Firestore** (coleções `usuarios_admin`, `usuarios_equipe`, etc.)
2. **MAS não excluiu do Firebase Authentication**
3. **O email ainda está registrado no Firebase Auth** (usuário órfão)

## Soluções Disponíveis

### 🎯 SOLUÇÃO 1: Firebase Console (RECOMENDADA)

1. **Abrir Firebase Console**:
   - Vá para: https://console.firebase.google.com/
   - Selecione projeto: `studio-5526632052-23813`

2. **Acessar Authentication**:
   - Menu lateral: `Authentication`
   - Aba: `Users`

3. **Encontrar e excluir usuário**:
   - Procure pelo email que está dando erro
   - Clique nos **3 pontos** ao lado do usuário
   - Selecione **"Delete user"**
   - Confirme a exclusão

4. **Tentar criar novamente**:
   - Volte ao painel admin
   - Tente criar o usuário novamente

### 🔧 SOLUÇÃO 2: Script Diagnóstico

Execute no **console do navegador**:

```javascript
// Copie todo o conteúdo do arquivo: admin/diagnostico-email-ja-em-uso.js
// Cole no console e pressione Enter
```

O script vai:
- ✅ Detectar se o usuário é órfão
- 🔍 Verificar onde o usuário existe
- 💡 Oferecer soluções específicas
- 🔄 Tentar recuperação automática (se possível)

### 🛠️ SOLUÇÃO 3: Funções Administrativas

No painel admin, execute no console:

```javascript
// Verificar usuários órfãos
window.verificarUsuariosOrfaos()

// Tentar recuperar usuário específico
window.tentarRecuperarUsuario("email@exemplo.com")
```

## Como Evitar o Problema

### ✅ Procedimento Correto para Excluir Usuários:

1. **Excluir do Firebase Console primeiro**:
   - Authentication > Users > Delete user

2. **Depois excluir do Firestore**:
   - Firestore Database > Coleções > Excluir documento

### ❌ O que NÃO fazer:
- Excluir apenas do Firestore
- Deixar usuários órfãos no Authentication

## Status do Sistema

✅ **Funções de diagnóstico adicionadas**  
✅ **Scripts de recuperação disponíveis**  
✅ **Procedimentos documentados**  
🔗 **Link direto**: https://console.firebase.google.com/project/studio-5526632052-23813/authentication/users

---

**Para resolver seu problema atual**: Use a **Solução 1** (Firebase Console) para excluir o usuário órfão e depois tente criar novamente.