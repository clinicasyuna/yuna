/*
 * 🔬 DIAGNÓSTICO FINAL DO EXCEL
 * Versão: 2025-11-25
 * 
 * Este script faz um diagnóstico completo e repara o botão Excel
 */

console.log('🔬 ===== DIAGNÓSTICO EXCEL FINAL =====');

// 1. Verificar se XLSX está carregado
if (typeof XLSX === 'undefined') {
    console.error('❌ XLSX não está carregado!');
    console.log('📋 SOLUÇÃO: Verifique se a biblioteca XLSX está sendo carregada corretamente');
} else {
    console.log('✅ XLSX biblioteca carregada:', typeof XLSX);
}

// 2. Verificar se o botão existe
const botaoExcel = document.getElementById('btn-importar-lote');
if (!botaoExcel) {
    console.error('❌ Botão Excel não encontrado!');
    console.log('📋 SOLUÇÃO: O botão com ID "btn-importar-lote" não existe no DOM');
} else {
    console.log('✅ Botão Excel encontrado:', botaoExcel);
    
    // Verificar propriedades do botão
    console.log('🔍 Propriedades do botão:');
    console.log('  - Visible:', !botaoExcel.hidden && botaoExcel.style.display !== 'none');
    console.log('  - Disabled:', botaoExcel.disabled);
    console.log('  - Onclick:', botaoExcel.onclick ? 'Definido' : 'Não definido');
    console.log('  - Event listeners:', getEventListeners ? getEventListeners(botaoExcel) : 'Console não suportado');
}

// 3. Verificar se o input de arquivo existe
const inputArquivo = document.getElementById('arquivo-lote');
if (!inputArquivo) {
    console.error('❌ Input de arquivo não encontrado!');
} else {
    console.log('✅ Input de arquivo encontrado:', inputArquivo);
    console.log('  - Listeners:', inputArquivo.onchange ? 'Definido' : 'Não definido');
}

// 4. Verificar se o modal existe
const modal = document.getElementById('modal-importacao-lote');
if (!modal) {
    console.error('❌ Modal de importação não encontrado!');
} else {
    console.log('✅ Modal de importação encontrado');
    console.log('  - Hidden:', modal.classList.contains('hidden'));
}

// 5. Verificar funções globais relacionadas
const funcoes = [
    'abrirModalImportacao',
    'lerArquivoExcel',
    'processarUsuarios',
    'configurarImportacaoExcel'
];

console.log('🔍 Verificando funções globais:');
funcoes.forEach(funcao => {
    if (typeof window[funcao] === 'function') {
        console.log(`✅ ${funcao} definida`);
    } else {
        console.log(`❌ ${funcao} NÃO definida`);
    }
});

// 6. Forçar configuração do botão
console.log('🛠️ Forçando configuração do botão...');

if (botaoExcel) {
    // Remover todos os event listeners existentes
    const novoBotao = botaoExcel.cloneNode(true);
    botaoExcel.parentNode.replaceChild(novoBotao, botaoExcel);
    
    // Configurar novo event listener
    novoBotao.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('[EXCEL-CLICK] Botão clicado - abrindo modal');
        
        if (typeof window.abrirModalImportacao === 'function') {
            window.abrirModalImportacao();
        } else {
            console.error('[EXCEL-CLICK] Função abrirModalImportacao não encontrada');
            // Tentar abrir modal diretamente
            const modal = document.getElementById('modal-importacao-lote');
            if (modal) {
                modal.classList.remove('hidden');
                console.log('[EXCEL-CLICK] Modal aberto manualmente');
            }
        }
    });
    
    console.log('✅ Event listener do botão reconfigurado');
}

// 7. Configurar listener do arquivo se necessário
if (inputArquivo) {
    inputArquivo.addEventListener('change', function(e) {
        console.log('[EXCEL-FILE] Arquivo selecionado:', e.target.files[0]);
        
        if (e.target.files[0] && typeof window.lerArquivoExcel === 'function') {
            window.lerArquivoExcel(e.target.files[0]);
        } else {
            console.error('[EXCEL-FILE] Função lerArquivoExcel não encontrada ou arquivo inválido');
        }
    });
    
    console.log('✅ Event listener do input arquivo configurado');
}

// 8. Teste final
console.log('🧪 TESTE FINAL:');
console.log('Clique no botão Excel agora para testar...');

// 9. Função de reparo de emergência
window.repararExcelEmergencia = function() {
    console.log('🚨 REPARO DE EMERGÊNCIA ATIVADO');
    
    // Recriar função de abertura do modal
    window.abrirModalImportacao = function() {
        console.log('[REPARO] Abrindo modal de importação...');
        const modal = document.getElementById('modal-importacao-lote');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('[REPARO] Modal aberto com sucesso');
        } else {
            alert('Modal de importação não encontrado!');
        }
    };
    
    // Recriar função de leitura de arquivo
    window.lerArquivoExcel = function(arquivo) {
        console.log('[REPARO] Processando arquivo:', arquivo.name);
        
        if (!arquivo) {
            alert('Nenhum arquivo selecionado');
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
                }
                
            } catch (error) {
                console.error('[REPARO] Erro ao processar arquivo:', error);
                alert('Erro ao processar arquivo: ' + error.message);
            }
        };
        
        reader.readAsArrayBuffer(arquivo);
    };
    
    console.log('✅ Funções de emergência criadas');
};

console.log('🔬 ===== FIM DO DIAGNÓSTICO =====');
console.log('💡 Se o botão ainda não funcionar, execute: repararExcelEmergencia()');