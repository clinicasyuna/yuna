// ===== TESTE FINAL - MODAL ARRASTÁVEL =====
// Arquivo: teste-modal-arrastavel.js
// Data: 28/11/2025
// Finalidade: Testar funcionalidade de modal arrastável

console.log('[TEST-MODAL] 🚀 Carregando teste de modal arrastável...');

// Função de teste completo
window.testeModalArrastavel = function() {
    console.log('[TEST-MODAL] 🧪 === TESTE MODAL ARRASTÁVEL ===');
    
    const resultados = [];
    
    // 1. Verificar se as funções existem
    resultados.push('📋 VERIFICAÇÃO DE FUNÇÕES:');
    resultados.push(`- showManageUsersModal: ${typeof window.showManageUsersModal}`);
    resultados.push(`- tornarModalArrastavel: ${typeof window.tornarModalArrastavel}`);
    resultados.push(`- testeDragModal: ${typeof window.testeDragModal}`);
    
    // 2. Verificar elementos DOM
    resultados.push('\n🎯 VERIFICAÇÃO DOM:');
    const modal = document.getElementById('manage-users-modal');
    resultados.push(`- Modal manage-users-modal: ${modal ? '✅ Encontrado' : '❌ Não encontrado'}`);
    
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        resultados.push(`- Modal content: ${modalContent ? '✅ Encontrado' : '❌ Não encontrado'}`);
    }
    
    // 3. Testar abertura do modal
    resultados.push('\n🔓 TESTE DE ABERTURA:');
    try {
        if (typeof window.showManageUsersModal === 'function') {
            // Abrir o modal
            setTimeout(() => {
                window.showManageUsersModal();
                resultados.push('✅ Modal aberto com sucesso');
                
                // Aguardar um pouco e verificar se está visível
                setTimeout(() => {
                    const modal = document.getElementById('manage-users-modal');
                    const isVisible = modal && !modal.classList.contains('hidden');
                    resultados.push(`- Modal visível: ${isVisible ? '✅ SIM' : '❌ NÃO'}`);
                    
                    // Verificar se tem a barra de arrastar
                    if (isVisible) {
                        const titleBar = modal.querySelector('.drag-title-bar');
                        resultados.push(`- Barra de arrastar: ${titleBar ? '✅ Criada' : '❌ Ausente'}`);
                        
                        if (titleBar) {
                            resultados.push('✅ MODAL PRONTO PARA ARRASTAR!');
                            resultados.push('🎯 Clique e arraste pela barra azul no topo');
                        }
                    }
                    
                    // Mostrar resultados
                    const relatorio = resultados.join('\n');
                    console.log(relatorio);
                    alert('🧪 TESTE MODAL ARRASTÁVEL\n\n' + relatorio);
                }, 500);
                
            }, 100);
        } else {
            resultados.push('❌ Função showManageUsersModal não encontrada');
            const relatorio = resultados.join('\n');
            console.log(relatorio);
            alert('❌ TESTE FALHOU\n\n' + relatorio);
        }
    } catch (error) {
        resultados.push(`❌ ERRO: ${error.message}`);
        const relatorio = resultados.join('\n');
        console.log(relatorio);
        alert('❌ TESTE FALHOU\n\n' + relatorio);
    }
};

// Função de diagnóstico do DOM
window.diagnosticoModalDOM = function() {
    console.log('[DOM-DIAG] 🔍 === DIAGNÓSTICO DOM MODAL ===');
    
    const modal = document.getElementById('manage-users-modal');
    if (!modal) {
        console.log('[DOM-DIAG] ❌ Modal manage-users-modal não encontrado');
        return;
    }
    
    console.log('[DOM-DIAG] ✅ Modal encontrado:', modal);
    console.log('[DOM-DIAG] 📊 Classes:', modal.className);
    console.log('[DOM-DIAG] 📊 Display:', getComputedStyle(modal).display);
    console.log('[DOM-DIAG] 📊 Visibility:', getComputedStyle(modal).visibility);
    console.log('[DOM-DIAG] 📊 Z-Index:', getComputedStyle(modal).zIndex);
    
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        console.log('[DOM-DIAG] ✅ Modal content encontrado:', modalContent);
        console.log('[DOM-DIAG] 📊 Content position:', getComputedStyle(modalContent).position);
    } else {
        console.log('[DOM-DIAG] ❌ Modal content não encontrado');
    }
    
    const titleBar = modal.querySelector('.drag-title-bar');
    if (titleBar) {
        console.log('[DOM-DIAG] ✅ Barra de arrastar encontrada:', titleBar);
    } else {
        console.log('[DOM-DIAG] ⚠️ Barra de arrastar não encontrada');
    }
};

// Auto-executar diagnóstico na carga
setTimeout(() => {
    console.log('[TEST-MODAL] ✅ Teste de modal arrastável carregado');
}, 100);