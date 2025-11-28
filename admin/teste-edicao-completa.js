// ===== TESTE FINAL - MODAL EDIÇÃO E MIGRAÇÃO =====
// Arquivo: teste-edicao-completa.js
// Data: 28/11/2025
// Finalidade: Testar modal de edição com z-index correto e migração de usuários

console.log('[TEST-EDICAO] 🚀 Carregando teste de edição completa...');

// Função de teste completo de edição
window.testeEdicaoCompleta = function() {
    console.log('[TEST-EDICAO] 🧪 === TESTE EDIÇÃO COMPLETA ===');
    
    const resultados = [];
    
    // 1. Verificar se as funções existem
    resultados.push('📋 VERIFICAÇÃO DE FUNÇÕES:');
    resultados.push(`- editarUsuario: ${typeof window.editarUsuario}`);
    resultados.push(`- salvarUsuarioEditado: ${typeof window.salvarUsuarioEditado}`);
    resultados.push(`- alterarTipoAcessoModal: ${typeof window.alterarTipoAcessoModal}`);
    
    // 2. Verificar modal de gerenciar usuários
    resultados.push('\n🎯 VERIFICAÇÃO MODAL GERENCIAR:');
    
    // Abrir modal de gerenciar usuários primeiro
    if (typeof window.showManageUsersModal === 'function') {
        window.showManageUsersModal();
        
        setTimeout(() => {
            const manageModal = document.getElementById('manage-users-modal');
            const isVisible = manageModal && !manageModal.classList.contains('hidden');
            resultados.push(`- Modal gerenciar visível: ${isVisible ? '✅ SIM' : '❌ NÃO'}`);
            
            if (isVisible) {
                // Verificar se há botões de editar
                const editButtons = manageModal.querySelectorAll('button[onclick*="editarUsuario"]');
                resultados.push(`- Botões Editar encontrados: ${editButtons.length}`);
                
                if (editButtons.length > 0) {
                    resultados.push('\n✅ TESTE PRONTO!');
                    resultados.push('🎯 Clique em um botão "Editar" para testar');
                    resultados.push('🔍 Verifique se modal de edição aparece NA FRENTE');
                    resultados.push('🔄 Teste mudar tipo de acesso entre Equipe e Admin');
                } else {
                    resultados.push('\n⚠️ Nenhum usuário encontrado para editar');
                }
            }
            
            // Mostrar resultados
            const relatorio = resultados.join('\n');
            console.log(relatorio);
            alert('🧪 TESTE EDIÇÃO COMPLETA\n\n' + relatorio);
            
        }, 1000); // Aguardar carregar usuários
        
    } else {
        resultados.push('❌ Função showManageUsersModal não encontrada');
        const relatorio = resultados.join('\n');
        console.log(relatorio);
        alert('❌ TESTE FALHOU\n\n' + relatorio);
    }
};

// Função de diagnóstico específico para z-index
window.diagnosticoZIndex = function() {
    console.log('[ZINDEX-DIAG] 🔍 === DIAGNÓSTICO Z-INDEX ===');
    
    const modais = document.querySelectorAll('.modal, [id*="modal"]');
    modais.forEach((modal, index) => {
        const computedStyle = getComputedStyle(modal);
        console.log(`[ZINDEX-DIAG] Modal ${index + 1}:`, {
            id: modal.id,
            className: modal.className,
            zIndex: computedStyle.zIndex,
            position: computedStyle.position,
            display: computedStyle.display
        });
    });
    
    // Verificar especificamente os modais importantes
    const manageModal = document.getElementById('manage-users-modal');
    const editModal = document.getElementById('edit-user-modal');
    
    if (manageModal) {
        console.log('[ZINDEX-DIAG] ✅ Modal gerenciar encontrado:', {
            zIndex: getComputedStyle(manageModal).zIndex,
            visible: !manageModal.classList.contains('hidden')
        });
    }
    
    if (editModal) {
        console.log('[ZINDEX-DIAG] ✅ Modal editar encontrado:', {
            zIndex: getComputedStyle(editModal).zIndex,
            visible: editModal.style.display !== 'none'
        });
    }
};

// Auto-executar diagnóstico na carga
setTimeout(() => {
    console.log('[TEST-EDICAO] ✅ Teste de edição completa carregado');
    
    // Adicionar listener para detectar quando modal de edição é aberto
    document.addEventListener('DOMNodeInserted', function(e) {
        if (e.target.id === 'edit-user-modal') {
            console.log('[TEST-EDICAO] 🎯 Modal de edição detectado!');
            setTimeout(() => {
                window.diagnosticoZIndex();
            }, 100);
        }
    });
}, 100);