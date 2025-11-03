// Script para executar correção do campo equipe no console do navegador

console.log('🔧 INICIANDO CORREÇÃO DO CAMPO EQUIPE');
console.log('===================================');

// Função para testar e corrigir usuário de manutenção
async function executarCorrecaoCompleta() {
  try {
    console.log('1️⃣ Testando usuário manutencao.jardins@yuna.com.br...');
    
    // Verificar se o usuário existe e seu estado atual
    const userRef = window.db.collection('usuarios_equipe').doc('manutencao-jardins-uid');
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const dados = userDoc.data();
      console.log('📋 Dados atuais:', dados);
      
      if (!dados.equipe || dados.equipe === undefined) {
        console.log('❌ Campo equipe está undefined/missing - CORRIGINDO...');
        
        // Corrigir o campo equipe
        await userRef.update({
          equipe: 'manutencao'
        });
        
        console.log('✅ Campo equipe corrigido para: manutencao');
        
        // Verificar a correção
        const docAtualizado = await userRef.get();
        const dadosAtualizados = docAtualizado.data();
        console.log('📋 Dados após correção:', dadosAtualizados);
        
        if (dadosAtualizados.equipe === 'manutencao') {
          console.log('🎉 CORREÇÃO REALIZADA COM SUCESSO!');
          console.log('👤 Agora teste o login novamente');
          return true;
        } else {
          console.log('❌ Erro: Campo ainda não está correto');
          return false;
        }
      } else {
        console.log('✅ Campo equipe já está correto:', dados.equipe);
        return true;
      }
    } else {
      console.log('❌ Usuário não encontrado na coleção usuarios_equipe');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
    return false;
  }
}

// Função alternativa se não soubermos o UID exato
async function corrigirPorEmail() {
  try {
    console.log('🔍 Buscando usuário por email...');
    
    const querySnapshot = await window.db.collection('usuarios_equipe')
      .where('email', '==', 'manutencao.jardins@yuna.com.br')
      .get();
    
    if (querySnapshot.empty) {
      console.log('❌ Usuário não encontrado por email');
      return false;
    }
    
    querySnapshot.forEach(async (doc) => {
      console.log('📋 Documento encontrado:', doc.id, doc.data());
      
      const dados = doc.data();
      if (!dados.equipe || dados.equipe === undefined) {
        console.log('❌ Campo equipe está undefined - CORRIGINDO...');
        
        await doc.ref.update({
          equipe: 'manutencao'
        });
        
        console.log('✅ Campo equipe corrigido para: manutencao');
      } else {
        console.log('✅ Campo equipe já correto:', dados.equipe);
      }
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante correção por email:', error);
    return false;
  }
}

console.log('🚀 EXECUTE NO CONSOLE:');
console.log('await executarCorrecaoCompleta()');
console.log('ou');
console.log('await corrigirPorEmail()');