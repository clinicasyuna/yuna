// ===== TESTE FINAL DE Z-INDEX - SOLUÇÃO DEFINITIVA =====

function testeZIndexFinal() {
    console.log('🧪 [TESTE-FINAL] Iniciando teste definitivo de z-index...');
    
    // 1. Abrir modal de gerenciar usuários
    if (typeof showManageUsersModal === 'function') {
        showManageUsersModal();
        console.log('✅ [TESTE-FINAL] Modal gerenciar usuários aberto');
        
        setTimeout(() => {
            // 2. Tentar abrir modal de edição simulando clique
            const editButtons = document.querySelectorAll('button[onclick*="editarUsuario"]');
            if (editButtons.length > 0) {
                console.log('✅ [TESTE-FINAL] Encontrados botões de editar:', editButtons.length);
                
                // Simular clique no primeiro botão
                editButtons[0].click();
                console.log('🎯 [TESTE-FINAL] Clique simulado no botão de editar');
                
                setTimeout(() => {
                    // 3. Verificar z-index após abertura
                    const editModal = document.getElementById('edit-user-modal');
                    const manageModal = document.getElementById('manage-users-modal');
                    
                    if (editModal && manageModal) {
                        const editZ = parseInt(window.getComputedStyle(editModal).zIndex);
                        const manageZ = parseInt(window.getComputedStyle(manageModal).zIndex);
                        
                        console.log(`📊 [TESTE-FINAL] Z-Index Modal Edição: ${editZ}`);
                        console.log(`📊 [TESTE-FINAL] Z-Index Modal Gerenciar: ${manageZ}`);
                        
                        if (editZ > manageZ) {
                            console.log('🎉 [TESTE-FINAL] SUCESSO! Modal de edição está acima!');
                            alert(`✅ SUCESSO! Modal de edição (${editZ}) está acima do modal de gerenciar (${manageZ})`);
                        } else {
                            console.log('❌ [TESTE-FINAL] FALHA! Modal de edição ainda está atrás!');
                            alert(`❌ FALHA! Modal de edição (${editZ}) ainda está atrás do modal de gerenciar (${manageZ})`);
                        }
                    } else {
                        console.log('❌ [TESTE-FINAL] Modais não encontrados');
                        alert('❌ ERRO: Modais não encontrados para teste');
                    }
                }, 500);
                
            } else {
                console.log('❌ [TESTE-FINAL] Nenhum botão de editar encontrado');
                alert('❌ ERRO: Nenhum botão de editar encontrado');
            }
        }, 1000);
        
    } else {
        console.log('❌ [TESTE-FINAL] Função showManageUsersModal não encontrada');
        alert('❌ ERRO: Função showManageUsersModal não encontrada');
    }
}

// Expor função globalmente
window.testeZIndexFinal = testeZIndexFinal;

console.log('🎯 [TESTE-FINAL] Função testeZIndexFinal() disponível para uso');
console.log('📝 [TESTE-FINAL] Execute: testeZIndexFinal() para testar automaticamente');