// ===== EMERGÊNCIA Z-INDEX - CORREÇÃO IMEDIATA =====
// Script que força z-index correto IMEDIATAMENTE na abertura

(function() {
    console.log('🚨 [EMERGÊNCIA] Iniciando correção imediata de z-index...');
    
    // Função de força bruta
    function forcaZIndexEmergencia() {
        const editModal = document.getElementById('edit-user-modal');
        const manageModal = document.getElementById('manage-users-modal');
        const createModal = document.getElementById('modal-novo-usuario');
        
        // FORCE BRUTAL - usar !important via style.cssText
        if (manageModal) {
            manageModal.style.cssText += '; z-index: 1000005 !important; position: fixed !important;';
        }
        
        if (editModal) {
            editModal.style.cssText += '; z-index: 1000010 !important; position: fixed !important;';
        }
        
        if (createModal) {
            createModal.style.cssText += '; z-index: 1000015 !important; position: fixed !important;';
        }
        
        console.log('🚨 [EMERGÊNCIA] Z-Index forçado via cssText');
    }
    
    // Sobrescrever a função editarUsuario IMEDIATAMENTE
    function interceptarEditarUsuario() {
        if (window.editarUsuario) {
            const originalEditUser = window.editarUsuario;
            window.editarUsuario = function() {
                console.log('🎯 [EMERGÊNCIA] INTERCEPTANDO editarUsuario');
                
                // Executar função original
                const result = originalEditUser.apply(this, arguments);
                
                // FORÇA IMEDIATA (0ms)
                forcaZIndexEmergencia();
                
                // FORÇA NOVAMENTE (10ms)
                setTimeout(forcaZIndexEmergencia, 10);
                
                // FORÇA MAIS UMA VEZ (50ms)
                setTimeout(forcaZIndexEmergencia, 50);
                
                // FORÇA FINAL (100ms)
                setTimeout(forcaZIndexEmergencia, 100);
                
                console.log('🚨 [EMERGÊNCIA] Múltiplas correções aplicadas');
                return result;
            };
            console.log('✅ [EMERGÊNCIA] editarUsuario interceptado');
        } else {
            // Se função ainda não existe, tentar novamente
            setTimeout(interceptarEditarUsuario, 100);
        }
    }
    
    // Observer que detecta QUALQUER mudança nos modais
    function criarObserverEmergencia() {
        const targetNode = document.body;
        const config = { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] };
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Verificar se algum modal foi alterado
                if (mutation.target.id === 'edit-user-modal' || 
                    mutation.target.id === 'manage-users-modal' ||
                    mutation.target.classList?.contains('modal')) {
                    
                    const editModal = document.getElementById('edit-user-modal');
                    if (editModal && !editModal.classList.contains('hidden')) {
                        console.log('👁️ [EMERGÊNCIA] Modal de edição detectado como ativo');
                        forcaZIndexEmergencia();
                    }
                }
            });
        });
        
        observer.observe(targetNode, config);
        console.log('👀 [EMERGÊNCIA] Observer de emergência ativo');
    }
    
    // Correção a cada segundo (força bruta)
    function correcaoPeriodica() {
        const editModal = document.getElementById('edit-user-modal');
        const manageModal = document.getElementById('manage-users-modal');
        
        if (editModal && manageModal && 
            !editModal.classList.contains('hidden') && 
            !manageModal.classList.contains('hidden')) {
            
            const editZ = parseInt(window.getComputedStyle(editModal).zIndex);
            const manageZ = parseInt(window.getComputedStyle(manageModal).zIndex);
            
            if (editZ <= manageZ) {
                console.log('🚨 [EMERGÊNCIA] Detectado z-index incorreto, corrigindo...');
                forcaZIndexEmergencia();
            }
        }
    }
    
    // Inicializar tudo IMEDIATAMENTE
    function inicializarEmergencia() {
        console.log('🚀 [EMERGÊNCIA] Inicializando sistema de emergência...');
        
        // Força inicial
        forcaZIndexEmergencia();
        
        // Interceptar função
        interceptarEditarUsuario();
        
        // Observer
        criarObserverEmergencia();
        
        // Correção periódica a cada 500ms (mais frequente)
        setInterval(correcaoPeriodica, 500);
        
        console.log('✅ [EMERGÊNCIA] Sistema de emergência ativo');
    }
    
    // Executar IMEDIATAMENTE
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarEmergencia);
    } else {
        inicializarEmergencia();
    }
    
    // Expor função global de emergência
    window.emergenciaZIndex = forcaZIndexEmergencia;
    
})();