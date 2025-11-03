## 🔧 PLANO DE CORREÇÃO IMEDIATA

### 🎯 Problema Identificado
O usuário `manutencao.jardins@yuna.com.br` está na coleção correta (`usuarios_equipe`) mas o campo `equipe` está `undefined`, causando falha na autenticação.

### 📋 Passos para Correção

**1. Abra o Console do Navegador no Painel Admin**
- Acesse `https://seu-site.netlify.app/admin/`
- Pressione `F12` para abrir DevTools
- Vá para a aba `Console`

**2. Execute o Diagnóstico**
```javascript
// Verificar estado atual do usuário
const userQuery = await window.db.collection('usuarios_equipe')
  .where('email', '==', 'manutencao.jardins@yuna.com.br')
  .get();

if (!userQuery.empty) {
  userQuery.forEach(doc => {
    console.log('📋 ID do documento:', doc.id);
    console.log('📋 Dados atuais:', doc.data());
  });
} else {
  console.log('❌ Usuário não encontrado');
}
```

**3. Execute a Correção**
```javascript
await corrigirPorEmail()
```

### 🔍 O que a Correção Faz
1. Busca o usuário por email na coleção `usuarios_equipe`
2. Verifica se o campo `equipe` está undefined
3. Atualiza o documento com `equipe: 'manutencao'`
4. Confirma que a correção foi aplicada

### ✅ Teste Final
Após a correção:
1. Faça logout do sistema
2. Faça login novamente com `manutencao.jardins@yuna.com.br`
3. Verifique se agora aparece apenas as solicitações de manutenção

### 🚨 Se Ainda Não Funcionar
Execute este comando adicional no console:
```javascript
// Forçar refresh da autenticação
window.location.reload();
```

### 📞 Código de Emergência
Se nada funcionar, execute este comando para debug completo:
```javascript
// Debug completo do sistema de autenticação
console.log('🔍 DIAGNÓSTICO COMPLETO');
console.log('=====================');

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    console.log('👤 Usuário logado:', user.email);
    
    // Verificar em todas as coleções
    const adminDoc = await window.db.collection('usuarios_admin').doc(user.uid).get();
    const equipeDoc = await window.db.collection('usuarios_equipe').doc(user.uid).get();
    
    console.log('🔍 Admin collection:', adminDoc.exists ? adminDoc.data() : 'Não encontrado');
    console.log('🔍 Equipe collection:', equipeDoc.exists ? equipeDoc.data() : 'Não encontrado');
    
    // Testar a função de verificação
    const resultado = await verificarUsuarioAdminJS(user);
    console.log('🔍 Resultado verificação:', resultado);
  }
});
```