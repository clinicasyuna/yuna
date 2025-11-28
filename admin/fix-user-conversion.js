// SOLUÇÃO PARA PROBLEMA DE CONVERSÃO DE USUÁRIOS
// Execute este script no console do navegador para forçar atualização dos dados do usuário

console.log('🔄 Iniciando limpeza de cache para conversão de usuário...');

// 1. Limpar localStorage
localStorage.clear();
console.log('✅ localStorage limpo');

// 2. Limpar dados globais
window.usuarioAdmin = null;
window.userRole = null;
window.userEmail = null;
console.log('✅ Dados globais limpos');

// 3. Forçar nova autenticação
if (window.auth && window.auth.currentUser) {
    console.log('🔄 Forçando nova verificação do usuário atual...');
    
    // Reautentica o usuário atual para forçar nova consulta ao Firestore
    const currentUser = window.auth.currentUser;
    
    // Força nova verificação
    window.verificarUsuarioAdminJS(currentUser)
        .then(dadosAtualizados => {
            if (dadosAtualizados) {
                console.log('✅ Dados atualizados obtidos:', dadosAtualizados);
                window.usuarioAdmin = dadosAtualizados;
                localStorage.setItem('usuarioAdmin', JSON.stringify(dadosAtualizados));
                console.log('✅ Cache atualizado com novos dados');
                
                // Recarregar página para aplicar mudanças
                console.log('🔄 Recarregando página...');
                window.location.reload();
            } else {
                console.log('❌ Usuário não encontrado - fazendo logout');
                window.auth.signOut().then(() => {
                    window.location.reload();
                });
            }
        })
        .catch(error => {
            console.error('❌ Erro na verificação:', error);
            console.log('🔄 Recarregando página por segurança...');
            window.location.reload();
        });
} else {
    console.log('🔄 Nenhum usuário logado - recarregando página...');
    window.location.reload();
}