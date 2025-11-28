// SCRIPT PARA TESTAR CORREÇÃO DOS Z-INDEX DOS MODAIS
// Execute este código no console para verificar se os modais estão com z-index correto

console.log('🔍 VERIFICANDO Z-INDEX DOS MODAIS...');
console.log('=====================================');

function verificarZIndexModais() {
    const modals = {
        'manage-users-modal': document.getElementById('manage-users-modal'),
        'edit-user-modal': document.getElementById('edit-user-modal'),
        'modal-novo-usuario': document.getElementById('modal-novo-usuario'),
        'finalizar-solicitacao-modal': document.getElementById('finalizar-solicitacao-modal')
    };
    
    console.log('📋 MODAIS ENCONTRADOS:');
    
    Object.entries(modals).forEach(([name, modal]) => {
        if (modal) {
            const zIndex = window.getComputedStyle(modal).zIndex;
            console.log(`✅ ${name}: z-index = ${zIndex}`);
        } else {
            console.log(`❌ ${name}: não encontrado no DOM`);
        }
    });
    
    // Verificar todos os modais na página
    const allModals = document.querySelectorAll('.modal, [id*="modal"]');
    console.log('');
    console.log('📋 TODOS OS MODAIS NA PÁGINA:');
    
    allModals.forEach(modal => {
        const id = modal.id || modal.className;
        const zIndex = window.getComputedStyle(modal).zIndex;
        const isVisible = !modal.classList.contains('hidden') && modal.style.display !== 'none';
        
        console.log(`${isVisible ? '👁️' : '👁️‍🗨️'} ${id}: z-index = ${zIndex} (${isVisible ? 'VISÍVEL' : 'oculto'})`);
    });
}

function forcarCorrecaoZIndex() {
    console.log('');
    console.log('🔧 FORÇANDO CORREÇÃO DE Z-INDEX...');
    
    // Definir z-index corretos
    const zIndexConfig = {
        'manage-users-modal': '999999',
        'edit-user-modal': '1000001',
        'modal-novo-usuario': '1000002'
    };
    
    Object.entries(zIndexConfig).forEach(([modalId, zIndex]) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.zIndex = zIndex;
            modal.style.position = 'fixed';
            console.log(`✅ ${modalId}: z-index definido para ${zIndex}`);
        } else {
            console.log(`❌ ${modalId}: não encontrado`);
        }
    });
    
    // Aplicar classes CSS adicionais
    const editModal = document.getElementById('edit-user-modal');
    if (editModal) {
        editModal.classList.add('modal', 'modal-edicao-usuario');
        console.log('✅ Classes CSS adicionadas ao modal de edição');
    }
}

function testarAberturaDosModais() {
    console.log('');
    console.log('🧪 TESTE DE ABERTURA DOS MODAIS:');
    console.log('');
    
    console.log('1️⃣ Para testar GERENCIAR USUÁRIOS:');
    console.log('   window.showManageUsersModal()');
    console.log('');
    
    console.log('2️⃣ Para testar EDIÇÃO DE USUÁRIO (após abrir gerenciar):');
    console.log('   - Clique em qualquer botão "Editar" na lista de usuários');
    console.log('   - O modal de edição deve aparecer ACIMA do modal de gerenciamento');
    console.log('');
    
    console.log('3️⃣ Para testar CRIAR USUÁRIO:');
    console.log('   window.showCreateUserModal()');
    console.log('');
    
    console.log('❓ Se algum modal aparecer atrás de outro, execute:');
    console.log('   forcarCorrecaoZIndex()');
}

// Executar verificação inicial
verificarZIndexModais();
forcarCorrecaoZIndex();
testarAberturaDosModais();

// Disponibilizar funções globalmente
window.verificarZIndexModais = verificarZIndexModais;
window.forcarCorrecaoZIndex = forcarCorrecaoZIndex;
window.testarAberturaDosModais = testarAberturaDosModais;

console.log('');
console.log('✅ CORREÇÃO DE Z-INDEX APLICADA!');
console.log('🧪 Use as funções acima para testar os modais');