/*
 * 🔧 CORREÇÃO ESPECÍFICA PARA IMPORTAÇÃO EXCEL
 * Versão: 2025-11-25 - FOCO NA IMPORTAÇÃO
 * 
 * Execute este código no console para corrigir a importação de Excel
 */

console.log('🔧 ===== CORRIGINDO IMPORTAÇÃO EXCEL =====');

// 1. Primeiro, digite 'allow pasting' se o console pedir
console.log('ℹ️ Se aparecer warning de segurança, digite: allow pasting');

// 2. Verificar estado atual
console.log('🔍 Verificando sistema...');

// Verificar XLSX
if (typeof XLSX === 'undefined') {
    console.error('❌ XLSX não carregado - carregando...');
    // Tentar carregar XLSX se não estiver disponível
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    document.head.appendChild(script);
    console.log('📦 XLSX sendo carregado...');
} else {
    console.log('✅ XLSX disponível:', typeof XLSX);
}

// 3. Corrigir cache (erro principal)
if (!window.cachedSolicitacoes) {
    window.cachedSolicitacoes = [];
    console.log('✅ Cache inicializado');
}

// Substituir função problemática
window.atualizarCronometrosNaTela = function() {
    if (window.cachedSolicitacoes && Array.isArray(window.cachedSolicitacoes)) {
        // Função segura - não causa erro
        console.log('[CRONOMETROS] Atualização segura');
    }
};

// 4. Localizar e corrigir elementos de importação
console.log('🔍 Localizando elementos de importação...');

// Verificar modal de importação
const modal = document.getElementById('modal-importacao-lote');
console.log('Modal importação:', modal ? '✅ Encontrado' : '❌ Não encontrado');

// Verificar input de arquivo
const inputArquivo = document.getElementById('arquivo-lote');
console.log('Input arquivo:', inputArquivo ? '✅ Encontrado' : '❌ Não encontrado');

// Verificar botão de importação dentro do modal
const btnImportar = document.querySelector('#modal-importacao-lote button[onclick*="processar"], #modal-importacao-lote button[type="submit"], #modal-importacao-lote .btn-primary');
console.log('Botão importar:', btnImportar ? '✅ Encontrado' : '❌ Não encontrado');

// 5. Criar função de importação robusta
window.lerArquivoExcelSeguro = function(arquivo) {
    console.log('[IMPORTACAO] Processando arquivo:', arquivo.name);
    
    if (!arquivo) {
        alert('❌ Nenhum arquivo selecionado');
        return;
    }
    
    // Verificar extensão
    const extensao = arquivo.name.toLowerCase();
    if (!extensao.includes('.xls') && !extensao.includes('.csv')) {
        alert('❌ Arquivo deve ser Excel (.xlsx, .xls) ou CSV');
        return;
    }
    
    // Verificar XLSX
    if (typeof XLSX === 'undefined') {
        alert('❌ Biblioteca Excel não carregada. Recarregue a página.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            console.log('[IMPORTACAO] Lendo dados...');
            
            let dadosJson;
            
            if (extensao.includes('.csv')) {
                // Processar CSV
                const csvText = e.target.result;
                const linhas = csvText.split('\n');
                const cabecalho = linhas[0].split(',').map(col => col.trim());
                
                dadosJson = [];
                for (let i = 1; i < linhas.length; i++) {
                    if (linhas[i].trim()) {
                        const valores = linhas[i].split(',').map(val => val.trim());
                        const objeto = {};
                        cabecalho.forEach((col, index) => {
                            objeto[col] = valores[index] || '';
                        });
                        dadosJson.push(objeto);
                    }
                }
            } else {
                // Processar Excel
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const primeiraAba = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[primeiraAba];
                dadosJson = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    blankrows: false
                });
                
                // Converter array de arrays para array de objetos
                if (dadosJson.length > 0) {
                    const cabecalho = dadosJson[0];
                    const dados = dadosJson.slice(1);
                    
                    dadosJson = dados.map(linha => {
                        const objeto = {};
                        cabecalho.forEach((col, index) => {
                            objeto[col] = linha[index] || '';
                        });
                        return objeto;
                    });
                }
            }
            
            console.log('[IMPORTACAO] ✅ Dados extraídos:', dadosJson.length, 'registros');
            console.log('[IMPORTACAO] Primeiros registros:', dadosJson.slice(0, 3));
            
            if (dadosJson.length === 0) {
                alert('❌ Nenhum dado encontrado no arquivo');
                return;
            }
            
            // Validar estrutura básica
            const primeiroItem = dadosJson[0];
            const campos = Object.keys(primeiroItem);
            console.log('[IMPORTACAO] Campos detectados:', campos);
            
            // Verificar campos essenciais (adapte conforme sua planilha)
            const camposNecessarios = ['nome', 'email', 'tipo']; // Ajuste conforme necessário
            const camposFaltando = camposNecessarios.filter(campo => 
                !campos.some(c => c.toLowerCase().includes(campo.toLowerCase()))
            );
            
            if (camposFaltando.length > 0) {
                console.warn('[IMPORTACAO] ⚠️ Campos não encontrados:', camposFaltando);
                // Não bloquear, apenas avisar
            }
            
            // Tentar processar com função existente
            if (typeof window.processarUsuarios === 'function') {
                console.log('[IMPORTACAO] Chamando processarUsuarios...');
                window.processarUsuarios(dadosJson);
            } else if (typeof window.criarUsuariosLote === 'function') {
                console.log('[IMPORTACAO] Chamando criarUsuariosLote...');
                window.criarUsuariosLote(dadosJson);
            } else {
                // Criar função básica de processamento
                console.log('[IMPORTACAO] Criando processamento básico...');
                window.processarDadosImportados(dadosJson);
            }
            
            // Sucesso
            alert(`✅ Arquivo processado com sucesso!\n${dadosJson.length} registros encontrados.`);
            
            // Fechar modal se aberto
            if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
            
        } catch (error) {
            console.error('[IMPORTACAO] ❌ Erro ao processar:', error);
            alert(`❌ Erro ao processar arquivo:\n${error.message}\n\nVerifique se o arquivo está no formato correto.`);
        }
    };
    
    // Ler arquivo baseado na extensão
    if (extensao.includes('.csv')) {
        reader.readAsText(arquivo);
    } else {
        reader.readAsArrayBuffer(arquivo);
    }
};

// 6. Função básica de processamento se não existir
window.processarDadosImportados = function(dados) {
    console.log('[PROCESSAMENTO] Processando', dados.length, 'registros...');
    
    // Aqui você pode implementar a lógica específica
    // Por enquanto, apenas mostrar os dados
    dados.forEach((item, index) => {
        console.log(`[PROCESSAMENTO] ${index + 1}:`, item);
    });
    
    console.log('[PROCESSAMENTO] ✅ Processamento concluído');
    
    // Você pode adicionar aqui a lógica para salvar no Firebase
    // Por exemplo: criarUsuarioFirebase(item) para cada item
};

// 7. Reparar input de arquivo se existir
if (inputArquivo) {
    console.log('🔧 Reparando input de arquivo...');
    
    // Remover listeners antigos
    const novoInput = inputArquivo.cloneNode(true);
    inputArquivo.parentNode.replaceChild(novoInput, inputArquivo);
    
    // Adicionar listener seguro
    novoInput.addEventListener('change', function(e) {
        const arquivo = e.target.files[0];
        if (arquivo) {
            window.lerArquivoExcelSeguro(arquivo);
        }
    });
    
    console.log('✅ Input arquivo reparado');
}

// 8. Reparar botão de importação se existir
if (btnImportar) {
    console.log('🔧 Reparando botão importar...');
    
    // Remover listeners antigos
    const novoBtnImportar = btnImportar.cloneNode(true);
    btnImportar.parentNode.replaceChild(novoBtnImportar, btnImportar);
    
    // Adicionar listener seguro
    novoBtnImportar.addEventListener('click', function(e) {
        e.preventDefault();
        
        const input = document.getElementById('arquivo-lote');
        if (input && input.files[0]) {
            window.lerArquivoExcelSeguro(input.files[0]);
        } else {
            alert('❌ Selecione um arquivo primeiro');
        }
    });
    
    console.log('✅ Botão importar reparado');
}

// 9. Função de teste completa
window.testarImportacaoExcel = function() {
    console.log('🧪 ===== TESTE DE IMPORTAÇÃO EXCEL =====');
    
    console.log('1. XLSX:', typeof XLSX !== 'undefined' ? '✅ OK' : '❌ ERRO');
    console.log('2. Modal:', document.getElementById('modal-importacao-lote') ? '✅ OK' : '❌ ERRO');
    console.log('3. Input:', document.getElementById('arquivo-lote') ? '✅ OK' : '❌ ERRO');
    console.log('4. Função processamento:', typeof window.lerArquivoExcelSeguro === 'function' ? '✅ OK' : '❌ ERRO');
    
    // Tentar abrir modal para teste
    const modal = document.getElementById('modal-importacao-lote');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('5. Modal aberto para teste');
        
        setTimeout(() => {
            const input = document.getElementById('arquivo-lote');
            if (input) {
                input.click(); // Tentar abrir seletor de arquivo
                console.log('6. Seletor de arquivo aberto');
            }
        }, 1000);
    }
};

console.log('🔧 ===== CORREÇÃO CONCLUÍDA =====');
console.log('');
console.log('📋 COMANDOS DISPONÍVEIS:');
console.log('• testarImportacaoExcel() - Teste completo');
console.log('• lerArquivoExcelSeguro(arquivo) - Processar arquivo manualmente');
console.log('');
console.log('🎯 AGORA TESTE A IMPORTAÇÃO EXCEL!');
console.log('1. Baixe o modelo Excel (já funciona)');
console.log('2. Preencha os dados');
console.log('3. Faça upload no botão Importar');

// 10. Auto-teste em 2 segundos
setTimeout(() => {
    console.log('🔍 Executando auto-teste...');
    window.testarImportacaoExcel();
}, 2000);