// ===== FUNÇÕES DE TESTE SEM CONSOLE PARA YUNA =====
// Funções que executam os testes diretamente na UI sem usar o console

// Função principal de teste chamada pelo botão
function testarModalsSemConsole() {
    console.log('🧪 [TESTE-UI] Iniciando teste de modais via botão...');
    
    // Mostrar alert para usuário
    showToast('Teste Iniciado', 'Testando z-index dos modais...', 'info');
    
    // Verificar z-index atual
    verificarZIndexAtual();
    
    // Abrir modal de gerenciar usuários
    setTimeout(() => {
        console.log('🎯 [TESTE-UI] Abrindo modal de gerenciar usuários...');
        
        if (typeof showManageUsersModal === 'function') {
            showManageUsersModal();
            
            showToast('Teste', 'Modal Gerenciar Usuários aberto', 'info');
            
            // Aguardar e simular abertura do modal de edição
            setTimeout(() => {
                testarModalEdicao();
            }, 2000);
        } else {
            showToast('Erro', 'Função showManageUsersModal não encontrada', 'error');
        }
    }, 1000);
}

// Função para verificar z-index atual
function verificarZIndexAtual() {
    const modais = {
        'manage-users-modal': document.getElementById('manage-users-modal'),
        'edit-user-modal': document.getElementById('edit-user-modal'),
        'modal-novo-usuario': document.getElementById('modal-novo-usuario')
    };
    
    let resultados = [];
    
    Object.entries(modais).forEach(([nome, elemento]) => {
        if (elemento) {
            const computedStyle = window.getComputedStyle(elemento);
            const zIndex = computedStyle.getPropertyValue('z-index');
            const inlineZIndex = elemento.style.zIndex;
            
            resultados.push(`${nome}: ${zIndex}${inlineZIndex ? ` (inline: ${inlineZIndex})` : ''}`);
            console.log(`📊 [Z-INDEX] ${nome}: ${zIndex}${inlineZIndex ? ` (inline: ${inlineZIndex})` : ''}`);
        } else {
            resultados.push(`${nome}: elemento não encontrado`);
            console.log(`❌ [Z-INDEX] ${nome}: elemento não encontrado`);
        }
    });
    
    // Mostrar resultados em um alert customizado
    const resultadoTexto = resultados.join('\n');
    console.log('📊 [Z-INDEX] Resultados:', resultadoTexto);
}

// Função para testar modal de edição
function testarModalEdicao() {
    console.log('🎯 [TESTE-UI] Testando modal de edição...');
    
    const editModal = document.getElementById('edit-user-modal');
    const manageModal = document.getElementById('manage-users-modal');
    
    if (editModal && manageModal) {
        // Forçar abertura do modal de edição COM Z-INDEX EXTREMO
        editModal.classList.remove('hidden');
        editModal.style.display = 'flex';
        editModal.style.cssText += '; z-index: 1000010 !important; position: fixed !important;';
        
        // Garantir que manage modal esteja atrás
        manageModal.style.cssText += '; z-index: 1000005 !important; position: fixed !important;';
        
        // Verificar se está acima
        const editZIndex = parseInt(window.getComputedStyle(editModal).zIndex);
        const manageZIndex = parseInt(window.getComputedStyle(manageModal).zIndex);
        
        console.log(`📊 [TESTE] Modal Edição Z-Index: ${editZIndex}`);
        console.log(`📊 [TESTE] Modal Gerenciar Z-Index: ${manageZIndex}`);
        
        if (editZIndex > manageZIndex) {
            showToast('Sucesso!', `Modal de edição está acima! (${editZIndex} > ${manageZIndex})`, 'success');
            console.log('🎉 [SUCESSO] Modal de edição está acima do modal de gerenciar!');
        } else {
            showToast('Problema', `Modal de edição ainda está atrás! (${editZIndex} vs ${manageZIndex})`, 'error');
            console.log('❌ [PROBLEMA] Modal de edição ainda está atrás!');
            
            // Tentar correção forçada EXTREMA
            setTimeout(() => {
                editModal.style.cssText += '; z-index: 1000020 !important; position: fixed !important;';
                showToast('Correção Extrema', 'Aplicando z-index 1000020 ao modal de edição', 'warning');
            }, 500);
        }
        
        // Fechar modais após teste
        setTimeout(() => {
            editModal.classList.add('hidden');
            editModal.style.display = 'none';
            
            if (typeof closeManageUsersModal === 'function') {
                closeManageUsersModal();
            } else {
                manageModal.classList.add('hidden');
                manageModal.style.display = 'none';
            }
            
            showToast('Teste Concluído', 'Modais fechados após teste', 'info');
        }, 4000);
        
    } else {
        showToast('Erro', 'Modais não encontrados para teste', 'error');
        console.log('❌ [ERRO] Modais não encontrados');
    }
}

// Função para correção forçada
function corrigirZIndexForcado() {
    console.log('🔧 [CORREÇÃO] Aplicando correção forçada de z-index...');
    
    const manageModal = document.getElementById('manage-users-modal');
    const editModal = document.getElementById('edit-user-modal');
    const createModal = document.getElementById('modal-novo-usuario');
    
    if (manageModal) {
        manageModal.style.zIndex = '1000005';
        manageModal.style.position = 'fixed';
        console.log('✅ [CORREÇÃO] manage-users-modal: 1000005');
    }
    
    if (editModal) {
        editModal.style.zIndex = '1000010';
        editModal.style.position = 'fixed';
        console.log('✅ [CORREÇÃO] edit-user-modal: 1000010');
    }
    
    if (createModal) {
        createModal.style.zIndex = '1000015';
        createModal.style.position = 'fixed';
        console.log('✅ [CORREÇÃO] modal-novo-usuario: 1000015');
    }
    
    showToast('Correção', 'Z-Index corrigido: Edição(1000010) > Gerenciar(1000005)', 'success');
    
    // Verificar novamente após correção
    setTimeout(() => {
        verificarZIndexAtual();
        
        const editZIndex = editModal ? parseInt(window.getComputedStyle(editModal).zIndex) : 0;
        const manageZIndex = manageModal ? parseInt(window.getComputedStyle(manageModal).zIndex) : 0;
        
        if (editZIndex > manageZIndex) {
            showToast('Correção Bem-sucedida!', `Agora: Edição(${editZIndex}) > Gerenciar(${manageZIndex})`, 'success');
        } else {
            showToast('Correção Falhou', `Ainda: Edição(${editZIndex}) vs Gerenciar(${manageZIndex})`, 'error');
        }
    }, 100);
}

// Função auxiliar para mostrar toast (caso não exista)
if (typeof showToast !== 'function') {
    window.showToast = function(titulo, mensagem, tipo) {
        const cor = tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6';
        
        // Criar toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 2px solid ${cor};
            border-radius: 8px;
            padding: 1rem;
            min-width: 300px;
            max-width: 500px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                <div style="color: ${cor}; font-size: 1.2rem;">
                    ${tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div>
                    <div style="font-weight: 600; color: #1f2937; margin-bottom: 0.25rem;">${titulo}</div>
                    <div style="color: #6b7280; font-size: 0.9rem; line-height: 1.4;">${mensagem}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none; border: none; color: #9ca3af; cursor: pointer; 
                    font-size: 1.2rem; padding: 0; margin-left: auto; line-height: 1;
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove após 4 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 4000);
        
        console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensagem}`);
    };
}

console.log('🎯 [TESTE-UI] Funções de teste carregadas. Use o botão "Teste Z-Index" para testar.');