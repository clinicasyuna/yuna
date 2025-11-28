// ===== TESTE FORÇADO DE MODAIS - YUNA ADMIN =====
// Este script executa automaticamente sem precisar do console

(function() {
    console.log('🧪 [TESTE-MODAIS] Iniciando teste automático de z-index...');
    
    // Função para verificar z-index dos modais
    function verificarZIndexModais() {
        console.log('📊 [Z-INDEX] Verificando z-index dos modais...');
        
        const modais = {
            'manage-users-modal': document.getElementById('manage-users-modal'),
            'edit-user-modal': document.getElementById('edit-user-modal'),
            'modal-novo-usuario': document.getElementById('modal-novo-usuario')
        };
        
        Object.entries(modais).forEach(([nome, elemento]) => {
            if (elemento) {
                const computedStyle = window.getComputedStyle(elemento);
                const zIndex = computedStyle.getPropertyValue('z-index');
                console.log(`🔍 [Z-INDEX] ${nome}: ${zIndex}`);
                
                // Verificar se tem z-index inline
                const inlineZIndex = elemento.style.zIndex;
                if (inlineZIndex) {
                    console.log(`📌 [Z-INDEX-INLINE] ${nome}: ${inlineZIndex}`);
                }
            } else {
                console.log(`❌ [ERRO] Modal não encontrado: ${nome}`);
            }
        });
    }
    
    // Função para forçar correção de z-index
    function forcarCorrecaoZIndex() {
        console.log('🔧 [CORREÇÃO] Forçando correção de z-index...');
        
        const manageModal = document.getElementById('manage-users-modal');
        const editModal = document.getElementById('edit-user-modal');
        const createModal = document.getElementById('modal-novo-usuario');
        
        if (manageModal) {
            manageModal.style.zIndex = '999999';
            console.log('✅ [CORREÇÃO] manage-users-modal: 999999');
        }
        
        if (editModal) {
            editModal.style.zIndex = '1000001';
            console.log('✅ [CORREÇÃO] edit-user-modal: 1000001');
        }
        
        if (createModal) {
            createModal.style.zIndex = '1000002';
            console.log('✅ [CORREÇÃO] modal-novo-usuario: 1000002');
        }
        
        // Verificar novamente
        setTimeout(verificarZIndexModais, 100);
    }
    
    // Função de teste completo
    function testarModaisCompleto() {
        console.log('🧪 [TESTE] Iniciando teste completo de modais...');
        
        // 1. Verificar estado inicial
        verificarZIndexModais();
        
        // 2. Forçar correção
        setTimeout(() => {
            forcarCorrecaoZIndex();
        }, 500);
        
        // 3. Testar abertura sequencial
        setTimeout(() => {
            console.log('🧪 [TESTE] Testando abertura do modal de gerenciar usuários...');
            
            // Simular clique no botão Gerenciar Usuários
            const btnGerenciar = document.querySelector('[onclick*="showManageUsersModal"]');
            if (btnGerenciar && window.showManageUsersModal) {
                window.showManageUsersModal();
                console.log('✅ [TESTE] Modal de gerenciar usuários aberto');
                
                // Aguardar e testar modal de edição
                setTimeout(() => {
                    console.log('🧪 [TESTE] Testando abertura do modal de edição...');
                    
                    // Simular modal de edição
                    const editModal = document.getElementById('edit-user-modal');
                    if (editModal) {
                        editModal.classList.remove('hidden');
                        editModal.style.display = 'flex';
                        console.log('✅ [TESTE] Modal de edição forçado a aparecer');
                        
                        // Verificar sobreposição
                        setTimeout(() => {
                            const manageZIndex = parseInt(window.getComputedStyle(document.getElementById('manage-users-modal')).zIndex);
                            const editZIndex = parseInt(window.getComputedStyle(editModal).zIndex);
                            
                            console.log(`📊 [RESULTADO] Manage Z-Index: ${manageZIndex}`);
                            console.log(`📊 [RESULTADO] Edit Z-Index: ${editZIndex}`);
                            
                            if (editZIndex > manageZIndex) {
                                console.log('🎉 [SUCESSO] Modal de edição está acima do modal de gerenciar!');
                            } else {
                                console.log('❌ [FALHA] Modal de edição ainda está atrás!');
                            }
                        }, 200);
                    }
                }, 1000);
            }
        }, 1000);
    }
    
    // Executar teste automaticamente quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', testarModaisCompleto);
    } else {
        testarModaisCompleto();
    }
    
    // Expor funções globalmente para uso manual se necessário
    window.testarModais = testarModaisCompleto;
    window.verificarZIndex = verificarZIndexModais;
    window.corrigirZIndex = forcarCorrecaoZIndex;
    
    console.log('🎯 [TESTE-MODAIS] Script carregado. Funções disponíveis:');
    console.log('   - testarModais() - Teste completo');
    console.log('   - verificarZIndex() - Verificar z-index atual');
    console.log('   - corrigirZIndex() - Forçar correção');
    
})();