// DIAGNÓSTICO URGENTE - Execute no console

console.log('🚨 DIAGNÓSTICO URGENTE DO CAMPO EQUIPE');
console.log('====================================');

// Função para diagnóstico completo
async function diagnosticoCompleto() {
    try {
        // 1. Verificar usuário atual
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log('❌ Nenhum usuário logado');
            return;
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
                
                console.log('✅ Campo equipe corrigido!');
                
                // Verificar correção
                const docCorrigido = await window.db.collection('usuarios_equipe').doc(user.uid).get();
                console.log('📋 Dados após correção:', docCorrigido.data());
                
                return true;
            } else {
                console.log('✅ Campo equipe está correto:', dados.equipe);
            }
        } else {
            console.log('❌ Documento não encontrado por UID');
        }
        
        // 3. Buscar por email como backup
        console.log('\n🔍 Buscando por email...');
        const queryPorEmail = await window.db.collection('usuarios_equipe')
            .where('email', '==', user.email)
            .get();
            
        if (!queryPorEmail.empty) {
            queryPorEmail.forEach(async doc => {
                console.log('📋 Documento por email:', doc.id, doc.data());
                
                const dados = doc.data();
                if (!dados.equipe || dados.equipe === undefined) {
                    console.log('❌ Campo equipe undefined - corrigindo...');
                    
                    await doc.ref.update({
                        equipe: 'manutencao'
                    });
                    
                    console.log('✅ Corrigido!');
                }
            });
        }
        
        // 4. Testar função de verificação
        console.log('\n🧪 Testando função verificarUsuarioAdminJS...');
        const resultado = await verificarUsuarioAdminJS(user);
        console.log('📋 Resultado:', resultado);
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Erro no diagnóstico:', error);
        return false;
    }
}

// Função para forçar reload após correção
function forcarReload() {
    console.log('🔄 Forçando reload da página...');
    window.location.reload();
}

console.log('\n🚀 COMANDOS DISPONÍVEIS:');
console.log('await diagnosticoCompleto() - Diagnóstico e correção');
console.log('forcarReload() - Recarregar página');

// Auto-executar se solicitado
if (window.location.search.includes('autofix=true')) {
    console.log('🤖 Auto-executando diagnóstico...');
    diagnosticoCompleto().then(() => {
        setTimeout(forcarReload, 2000);
    });
}