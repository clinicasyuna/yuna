// COLE ESTE CÓDIGO COMPLETO NO CONSOLE

console.log('🚨 DIAGNÓSTICO E CORREÇÃO DIRETA');
console.log('===============================');

// Função para diagnóstico e correção
async function diagnosticoCompleto() {
    try {
        // 1. Verificar usuário atual
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log('❌ Nenhum usuário logado');
            return false;
        }
        
        console.log('👤 Usuário logado:', user.email);
        console.log('🆔 UID:', user.uid);
        
        // 2. Buscar na coleção usuarios_equipe por UID
        console.log('\n🔍 Buscando por UID...');
        const docPorUID = await window.db.collection('usuarios_equipe').doc(user.uid).get();
        
        if (docPorUID.exists) {
            const dados = docPorUID.data();
            console.log('📋 Documento por UID:', dados);
            console.log('🔍 Campo equipe:', dados.equipe);
            console.log('🔍 Tipo do campo equipe:', typeof dados.equipe);
            
            if (!dados.equipe || dados.equipe === undefined) {
                console.log('❌ PROBLEMA ENCONTRADO: Campo equipe está undefined!');
                console.log('🔧 Corrigindo agora...');
                
                await docPorUID.ref.update({
                    equipe: 'manutencao'
                });
                
                console.log('✅ Campo equipe corrigido para: manutencao');
                
                // Verificar correção
                const docCorrigido = await window.db.collection('usuarios_equipe').doc(user.uid).get();
                const dadosCorrigidos = docCorrigido.data();
                console.log('📋 Dados após correção:', dadosCorrigidos);
                
                if (dadosCorrigidos.equipe === 'manutencao') {
                    console.log('🎉 CORREÇÃO REALIZADA COM SUCESSO!');
                    console.log('🔄 Recarregue a página agora!');
                    return true;
                } else {
                    console.log('❌ Erro: Campo ainda não está correto');
                    return false;
                }
            } else {
                console.log('✅ Campo equipe já está correto:', dados.equipe);
                console.log('🤔 O problema pode estar em outro lugar...');
                
                // Testar a função de verificação
                console.log('\n🧪 Testando verificarUsuarioAdminJS...');
                const resultado = await verificarUsuarioAdminJS(user);
                console.log('📋 Resultado verificação:', resultado);
                
                return true;
            }
        } else {
            console.log('❌ Documento não encontrado por UID');
            
            // Buscar por email
            console.log('\n🔍 Buscando por email...');
            const queryPorEmail = await window.db.collection('usuarios_equipe')
                .where('email', '==', user.email)
                .get();
                
            if (!queryPorEmail.empty) {
                let corrigido = false;
                queryPorEmail.forEach(async doc => {
                    console.log('📋 Documento por email:', doc.id, doc.data());
                    
                    const dados = doc.data();
                    if (!dados.equipe || dados.equipe === undefined) {
                        console.log('❌ Campo equipe undefined - corrigindo...');
                        
                        await doc.ref.update({
                            equipe: 'manutencao'
                        });
                        
                        console.log('✅ Corrigido!');
                        corrigido = true;
                    }
                });
                
                if (corrigido) {
                    console.log('🔄 Recarregue a página agora!');
                }
                
                return corrigido;
            } else {
                console.log('❌ Usuário não encontrado em nenhuma busca');
                return false;
            }
        }
        
    } catch (error) {
        console.error('❌ Erro no diagnóstico:', error);
        return false;
    }
}

// Executar automaticamente
console.log('🚀 Executando diagnóstico...');
diagnosticoCompleto().then(sucesso => {
    if (sucesso) {
        console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
        console.log('🔄 Execute: window.location.reload()');
    } else {
        console.log('\n❌ FALHA NO DIAGNÓSTICO');
        console.log('📞 Contacte o desenvolvedor');
    }
});