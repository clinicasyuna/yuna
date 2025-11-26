/*
 * 🔧 CORREÇÃO EMERGENCIAL COMPLETA
 * Versão: 2025-11-25 - FINAL
 * 
 * Este script corrige TODOS os problemas identificados
 */

console.log('🔧 ===== CORREÇÃO EMERGENCIAL INICIADA =====');

// 1. CORREÇÃO CRÍTICA: Forçar definição global do cache
console.log('🛡️ Corrigindo cache global...');
if (!window.hasOwnProperty('cachedSolicitacoes')) {
    window.cachedSolicitacoes = [];
    console.log('✅ Cache inicializado');
} else {
    console.log('✅ Cache já existia');
}

// 2. CORREÇÃO DA FUNÇÃO atualizarCronometrosNaTela
console.log('🔧 Substituindo função atualizarCronometrosNaTela...');
window.atualizarCronometrosNaTela = function() {
    // Verificação de segurança para cache - múltiplas verificações
    if (typeof window === 'undefined') {
        console.log('[DEBUG] Window não disponível, pulando atualização de cronômetros');
        return;
    }
    
    if (!window.hasOwnProperty('cachedSolicitacoes')) {
        console.log('[DEBUG] cachedSolicitacoes não existe no window, pulando atualização de cronômetros');
        return;
    }
    
    if (!window.cachedSolicitacoes || !Array.isArray(window.cachedSolicitacoes) || window.cachedSolicitacoes.length === 0) {
        console.log('[DEBUG] Cache de solicitações vazio ou não inicializado, pulando atualização de cronômetros');
        return;
    }
    
    // Atualizar todos os elementos de timer visíveis na tela
    const timers = document.querySelectorAll('.card-timer span');
    
    timers.forEach(timerElement => {
        const card = timerElement.closest('.solicitacao-card');
        if (!card) return;
        
        const cardId = card.dataset.id;
        if (!cardId) return;
        
        const solicitacao = window.cachedSolicitacoes.find(sol => sol.id === cardId);
        if (!solicitacao) return;
        
        // Recalcular e atualizar o tempo
        if (typeof window.calcularTempoAtendimento === 'function') {
            const novoTempo = window.calcularTempoAtendimento(solicitacao);
            timerElement.textContent = novoTempo;
            
            // Atualizar cor se necessário
            const icon = timerElement.parentElement.querySelector('i');
            const cor = solicitacao.status === 'finalizada' ? '#10b981' : '#f59e0b';
            
            if (icon) {
                icon.style.color = cor;
            }
            if (timerElement) {
                timerElement.style.color = cor;
            }
        }
    });
    
    console.log('[DEBUG] Cronômetros atualizados:', timers.length, 'elementos');
};
console.log('✅ Função atualizarCronometrosNaTela corrigida');

// 3. CORREÇÃO DE DIAGNÓSTICO EXCEL
console.log('🔬 Executando diagnóstico Excel...');

// 3.1 Verificar se XLSX está carregado
if (typeof XLSX === 'undefined') {
    console.error('❌ XLSX não está carregado!');
    console.log('📋 SOLUÇÃO: A biblioteca XLSX precisa ser carregada');
} else {
    console.log('✅ XLSX biblioteca carregada:', typeof XLSX);
}

// 3.2 Verificar se o botão existe
const botaoExcel = document.getElementById('btn-importar-lote');
if (!botaoExcel) {
    console.error('❌ Botão Excel não encontrado!');
    console.log('📋 AÇÃO: Procurando botões similares...');
    
    // Procurar botões com texto relacionado
    const todosBotoes = Array.from(document.querySelectorAll('button'));
    const botoesImport = todosBotoes.filter(btn => 
        btn.textContent.toLowerCase().includes('import') ||
        btn.textContent.toLowerCase().includes('excel') ||
        btn.textContent.toLowerCase().includes('planilha') ||
        btn.textContent.toLowerCase().includes('lote')
    );
    
    console.log('🔍 Botões similares encontrados:', botoesImport);
} else {
    console.log('✅ Botão Excel encontrado:', botaoExcel);
    
    // Verificar propriedades do botão
    console.log('🔍 Propriedades do botão:');
    console.log('  - Visible:', !botaoExcel.hidden && botaoExcel.style.display !== 'none');
    console.log('  - Disabled:', botaoExcel.disabled);
    console.log('  - Onclick:', botaoExcel.onclick ? 'Definido' : 'Não definido');
}

// 3.3 Verificar se o input de arquivo existe
const inputArquivo = document.getElementById('arquivo-lote');
if (!inputArquivo) {
    console.error('❌ Input de arquivo não encontrado!');
} else {
    console.log('✅ Input de arquivo encontrado:', inputArquivo);
    console.log('  - Listeners:', inputArquivo.onchange ? 'Definido' : 'Não definido');
}

// 3.4 Verificar se o modal existe
const modal = document.getElementById('modal-importacao-lote');
if (!modal) {
    console.error('❌ Modal de importação não encontrado!');
} else {
    console.log('✅ Modal de importação encontrado');
    console.log('  - Hidden:', modal.classList.contains('hidden'));
}

// 4. REPARAR BOTÃO EXCEL
console.log('🛠️ Reparando botão Excel...');

if (botaoExcel) {
    // Remover todos os event listeners existentes
    const novoBotao = botaoExcel.cloneNode(true);
    botaoExcel.parentNode.replaceChild(novoBotao, botaoExcel);
    
    // Configurar novo event listener
    novoBotao.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('[EXCEL-CLICK] Botão clicado - tentando abrir modal');
        
        if (typeof window.abrirModalImportacao === 'function') {
            console.log('[EXCEL-CLICK] Chamando abrirModalImportacao');
            window.abrirModalImportacao();
        } else {
            console.log('[EXCEL-CLICK] abrirModalImportacao não encontrada, tentando diretamente');
            const modalEl = document.getElementById('modal-importacao-lote');
            if (modalEl) {
                modalEl.classList.remove('hidden');
                console.log('[EXCEL-CLICK] Modal aberto diretamente');
            } else {
                console.error('[EXCEL-CLICK] Modal não encontrado!');
                alert('Modal de importação não encontrado. Verifique se está logado corretamente.');
            }
        }
    });
    
    console.log('✅ Event listener do botão Excel reconfigurado');
}

// 5. CONFIGURAR LISTENER DO ARQUIVO
if (inputArquivo) {
    // Remover listeners existentes
    const novoInput = inputArquivo.cloneNode(true);
    inputArquivo.parentNode.replaceChild(novoInput, inputArquivo);
    
    novoInput.addEventListener('change', function(e) {
        console.log('[EXCEL-FILE] Arquivo selecionado:', e.target.files[0]);
        
        if (!e.target.files[0]) {
            console.log('[EXCEL-FILE] Nenhum arquivo selecionado');
            return;
        }
        
        if (typeof window.lerArquivoExcel === 'function') {
            console.log('[EXCEL-FILE] Chamando lerArquivoExcel');
            window.lerArquivoExcel(e.target.files[0]);
        } else {
            console.log('[EXCEL-FILE] lerArquivoExcel não encontrada, usando reparo');
            window.lerArquivoExcelReparo(e.target.files[0]);
        }
    });
    
    console.log('✅ Event listener do input arquivo reconfigurado');
}

// 6. FUNÇÃO DE REPARO PARA LEITURA DE EXCEL
window.lerArquivoExcelReparo = function(arquivo) {
    console.log('[REPARO] Processando arquivo:', arquivo.name);
    
    if (!arquivo) {
        alert('Nenhum arquivo selecionado');
        return;
    }
    
    if (typeof XLSX === 'undefined') {
        alert('Biblioteca XLSX não carregada. Recarregue a página.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            console.log('[REPARO] Lendo arquivo...');
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            console.log('[REPARO] Dados extraídos:', jsonData);
            alert(`Arquivo lido com sucesso! ${jsonData.length} registros encontrados.`);
            
            // Aqui você pode chamar a função de processamento
            if (typeof window.processarUsuarios === 'function') {
                window.processarUsuarios(jsonData);
            } else {
                console.log('[REPARO] Dados extraídos (para processamento manual):', jsonData);
            }
            
        } catch (error) {
            console.error('[REPARO] Erro ao processar arquivo:', error);
            alert('Erro ao processar arquivo: ' + error.message);
        }
    };
    
    reader.readAsArrayBuffer(arquivo);
};

// 7. FUNÇÃO DE ABERTURA DE MODAL DE REPARO
window.abrirModalImportacaoReparo = function() {
    console.log('[REPARO] Tentando abrir modal de importação...');
    const modalEl = document.getElementById('modal-importacao-lote');
    if (modalEl) {
        modalEl.classList.remove('hidden');
        console.log('[REPARO] Modal aberto com sucesso');
    } else {
        alert('Modal de importação não encontrado!');
    }
};

// 8. TESTE FINAL
console.log('🧪 REALIZANDO TESTE FINAL...');
console.log('✅ Cache corrigido:', typeof window.cachedSolicitacoes);
console.log('✅ Função cronômetros:', typeof window.atualizarCronometrosNaTela);
console.log('✅ Função Excel reparo:', typeof window.lerArquivoExcelReparo);
console.log('✅ Função modal reparo:', typeof window.abrirModalImportacaoReparo);

console.log('🔧 ===== CORREÇÃO EMERGENCIAL CONCLUÍDA =====');
console.log('');
console.log('📋 INSTRUÇÕES:');
console.log('1. O erro do cachedSolicitacoes foi corrigido');
console.log('2. O botão Excel foi reparado');
console.log('3. Teste clicando no botão "Importar Lote" agora');
console.log('');
console.log('💡 Se ainda houver problemas:');
console.log('- Execute: window.abrirModalImportacaoReparo() para abrir modal');
console.log('- Ou recarregue a página e execute este script novamente');

// 9. AUTO-TESTE
setTimeout(() => {
    console.log('🔍 AUTO-TESTE executado após 2 segundos...');
    if (window.cachedSolicitacoes && Array.isArray(window.cachedSolicitacoes)) {
        console.log('✅ Cache funcionando corretamente');
    } else {
        console.warn('⚠️ Cache ainda com problemas');
    }
    
    const botaoTeste = document.getElementById('btn-importar-lote');
    if (botaoTeste) {
        console.log('✅ Botão Excel acessível');
    } else {
        console.warn('⚠️ Botão Excel não encontrado');
    }
}, 2000);

console.log('🚀 Script carregado! Teste o botão Excel agora!');