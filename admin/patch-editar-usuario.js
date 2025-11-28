// ===== PATCH DIRETO NA FUNÇÃO EDITAR USUÁRIO =====
// Este script sobrescreve a função editarUsuario para garantir z-index correto

(function() {
    console.log('🔥 [PATCH] Preparando patch direto na função editarUsuario...');
    
    // Aguardar o carregamento do admin-panel.js
    function aguardarFuncaoEditarUsuario() {
        if (typeof window.editarUsuario === 'function') {
            console.log('🎯 [PATCH] Função editarUsuario encontrada, aplicando patch...');
            aplicarPatch();
        } else {
            console.log('⏳ [PATCH] Aguardando função editarUsuario...');
            setTimeout(aguardarFuncaoEditarUsuario, 100);
        }
    }
    
    function aplicarPatch() {
        // Salvar função original
        const editarUsuarioOriginal = window.editarUsuario;
        
        // Sobrescrever com nossa versão patcheada
        window.editarUsuario = function(userId, userData) {
            console.log('🔥 [PATCH] editarUsuario executada - aplicando correções z-index...');
            
            // Executar função original
            const resultado = editarUsuarioOriginal.apply(this, arguments);
            
            // CORREÇÃO IMEDIATA (múltiplas tentativas)
            const corrigirModalEdicao = () => {
                const editModal = document.getElementById('edit-user-modal');
                const manageModal = document.getElementById('manage-users-modal');
                
                if (editModal) {
                    // FORÇA MÁXIMA
                    editModal.style.cssText += `
                        z-index: 1000010 !important; 
                        position: fixed !important; 
                        display: flex !important;
                    `;
                    
                    // Garantir que está visível
                    editModal.classList.remove('hidden');
                    
                    console.log('🔥 [PATCH] Modal de edição forçado para z-index 1000010');
                }
                
                if (manageModal) {
                    manageModal.style.cssText += `
                        z-index: 1000005 !important; 
                        position: fixed !important;
                    `;
                    console.log('🔥 [PATCH] Modal de gerenciar definido para z-index 1000005');
                }
            };
            
            // Aplicar correção em vários momentos
            corrigirModalEdicao();                    // Imediato
            setTimeout(corrigirModalEdicao, 1);       // 1ms
            setTimeout(corrigirModalEdicao, 10);      // 10ms
            setTimeout(corrigirModalEdicao, 50);      // 50ms
            setTimeout(corrigirModalEdicao, 100);     // 100ms
            setTimeout(corrigirModalEdicao, 200);     // 200ms
            
            return resultado;
        };
        
        console.log('✅ [PATCH] Função editarUsuario foi patcheada com sucesso!');
    }
    
    // Iniciar processo
    aguardarFuncaoEditarUsuario();
    
})();