// ===== AUTO-CORREÇÃO Z-INDEX PARA MODAIS =====
// Este script monitora automaticamente a abertura de modais e corrige o z-index

(function() {
    console.log('🔧 [AUTO-Z-INDEX] Iniciando monitoramento automático de z-index...');
    
    // Configuração de z-index
    const Z_INDEX_CONFIG = {
        'manage-users-modal': 1000005,
        'edit-user-modal': 1000010,
        'modal-novo-usuario': 1000015
    };
    
    // Função para aplicar z-index correto
    function aplicarZIndexCorreto(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && Z_INDEX_CONFIG[modalId]) {
            modal.style.zIndex = Z_INDEX_CONFIG[modalId];
            console.log(`✅ [AUTO-Z-INDEX] ${modalId}: ${Z_INDEX_CONFIG[modalId]}`);
            return true;
        }
        return false;
    }
    
    // Função para verificar e corrigir todos os modais
    function corrigirTodosModais() {
        Object.keys(Z_INDEX_CONFIG).forEach(modalId => {
            aplicarZIndexCorreto(modalId);
        });
    }
    
    // Observer para detectar mudanças na classe 'hidden' dos modais
    function criarObserverModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const isVisible = !modal.classList.contains('hidden');
                        if (isVisible) {
                            console.log(`👁️ [AUTO-Z-INDEX] Modal ${modalId} detectado como visível`);
                            aplicarZIndexCorreto(modalId);
                            
                            // Se for modal de edição, garantir que está acima do gerenciamento
                            if (modalId === 'edit-user-modal') {
                                setTimeout(() => {
                                    aplicarZIndexCorreto('manage-users-modal');
                                    aplicarZIndexCorreto('edit-user-modal');
                                    console.log('🔝 [AUTO-Z-INDEX] Modal de edição forçado para o topo');
                                }, 50);
                            }
                        }
                    }
                    
                    // Também monitorar mudanças no style
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (!modal.classList.contains('hidden') && modal.style.display !== 'none') {
                            aplicarZIndexCorreto(modalId);
                        }
                    }
                });
            });
            
            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['class', 'style']
            });
            
            console.log(`👀 [AUTO-Z-INDEX] Observer criado para ${modalId}`);
        }
    }
    
    // Sobrescrever funções que abrem modais
    function interceptarFuncoesModal() {
        // Interceptar showManageUsersModal
        if (window.showManageUsersModal) {
            const originalShowManage = window.showManageUsersModal;
            window.showManageUsersModal = function() {
                console.log('🎯 [AUTO-Z-INDEX] Interceptando showManageUsersModal');
                const result = originalShowManage.apply(this, arguments);
                setTimeout(() => {
                    aplicarZIndexCorreto('manage-users-modal');
                }, 10);
                return result;
            };
        }
        
        // Interceptar editarUsuario
        if (window.editarUsuario) {
            const originalEditUser = window.editarUsuario;
            window.editarUsuario = function() {
                console.log('🎯 [AUTO-Z-INDEX] Interceptando editarUsuario');
                const result = originalEditUser.apply(this, arguments);
                setTimeout(() => {
                    corrigirTodosModais();
                    // Extra força para modal de edição
                    const editModal = document.getElementById('edit-user-modal');
                    if (editModal) {
                        editModal.style.zIndex = '1000001';
                        editModal.style.position = 'fixed';
                    }
                }, 50);
                return result;
            };
        }
        
        // Interceptar showCreateUserModal
        if (window.showCreateUserModal) {
            const originalShowCreate = window.showCreateUserModal;
            window.showCreateUserModal = function() {
                console.log('🎯 [AUTO-Z-INDEX] Interceptando showCreateUserModal');
                const result = originalShowCreate.apply(this, arguments);
                setTimeout(() => {
                    aplicarZIndexCorreto('modal-novo-usuario');
                }, 10);
                return result;
            };
        }
    }
    
    // Função para inicializar tudo
    function inicializar() {
        console.log('🚀 [AUTO-Z-INDEX] Inicializando sistema de correção automática...');
        
        // Corrigir z-index inicial
        corrigirTodosModais();
        
        // Criar observers
        Object.keys(Z_INDEX_CONFIG).forEach(modalId => {
            criarObserverModal(modalId);
        });
        
        // Interceptar funções
        setTimeout(interceptarFuncoesModal, 100);
        
        // Correção periódica a cada 2 segundos
        setInterval(() => {
            const editModal = document.getElementById('edit-user-modal');
            const manageModal = document.getElementById('manage-users-modal');
            
            if (editModal && !editModal.classList.contains('hidden') &&
                manageModal && !manageModal.classList.contains('hidden')) {
                console.log('🔄 [AUTO-Z-INDEX] Correção periódica - ambos modais visíveis');
                aplicarZIndexCorreto('manage-users-modal');
                aplicarZIndexCorreto('edit-user-modal');
            }
        }, 2000);
        
        console.log('✅ [AUTO-Z-INDEX] Sistema inicializado com sucesso');
    }
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }
    
    // Expor função global para correção manual
    window.corrigirZIndexManual = corrigirTodosModais;
    
})();