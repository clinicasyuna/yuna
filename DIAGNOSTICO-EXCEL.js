// 🔬 DIAGNÓSTICO COMPLETO - EXCEL IMPORT
// Execute este código no console do navegador (F12 > Console)

console.log('=== DIAGNÓSTICO EXCEL IMPORT - YUNA ===');

// TESTE 1: Verificar dependências
console.log('\n1️⃣ VERIFICANDO DEPENDÊNCIAS:');
console.log('✅ XLSX disponível:', typeof XLSX !== 'undefined' ? '✅ SIM' : '❌ NÃO');
console.log('✅ Firebase disponível:', typeof firebase !== 'undefined' ? '✅ SIM' : '❌ NÃO');
console.log('✅ Firestore disponível:', typeof window.db !== 'undefined' ? '✅ SIM' : '❌ NÃO');

// TESTE 2: Verificar elementos DOM
console.log('\n2️⃣ VERIFICANDO ELEMENTOS DOM:');
const modal = document.getElementById('modal-importacao-lote');
const input = document.getElementById('arquivo-excel');
const btnProcessar = document.getElementById('btn-processar');

console.log('✅ Modal encontrado:', modal ? '✅ SIM' : '❌ NÃO');
console.log('✅ Input arquivo encontrado:', input ? '✅ SIM' : '❌ NÃO');
console.log('✅ Botão processar encontrado:', btnProcessar ? '✅ SIM' : '❌ NÃO');

// TESTE 3: Verificar funções globais
console.log('\n3️⃣ VERIFICANDO FUNÇÕES GLOBAIS:');
console.log('✅ abrirImportacaoLote:', typeof window.abrirImportacaoLote === 'function' ? '✅ SIM' : '❌ NÃO');
console.log('✅ lerArquivoExcel:', typeof window.lerArquivoExcel === 'function' ? '✅ SIM' : '❌ NÃO');
console.log('✅ processarArquivoExcel:', typeof window.processarArquivoExcel === 'function' ? '✅ SIM' : '❌ NÃO');

// TESTE 4: Verificar listeners
console.log('\n4️⃣ VERIFICANDO LISTENERS:');
if (input) {
    console.log('✅ Input possui listener change:', input.onchange ? '✅ SIM' : '❌ NÃO');
    
    // Teste manual de trigger
    console.log('\n🔧 TESTE MANUAL - Criando evento de mudança...');
    const eventoTeste = new Event('change');
    input.dispatchEvent(eventoTeste);
    console.log('✅ Evento change disparado manualmente');
}

// TESTE 5: Simular seleção de arquivo
console.log('\n5️⃣ INSTRUÇÕES PARA TESTE MANUAL:');
console.log('1. Clique no botão "Importar Excel" no painel');
console.log('2. Selecione um arquivo .xlsx');
console.log('3. Observe os logs que aparecerão abaixo desta mensagem');
console.log('4. Se nada aparecer, há problema no listener');

// TESTE 6: Criar arquivo de teste programaticamente
console.log('\n6️⃣ GERANDO ARQUIVO EXCEL DE TESTE:');
try {
    // Criar workbook de teste
    const wb = XLSX.utils.book_new();
    const dados = [
        ['Nome', 'Email', 'Quarto', 'Senha'],
        ['João Silva', 'joao@teste.com', '101', '123456'],
        ['Maria Santos', 'maria@teste.com', '102', '654321']
    ];
    const ws = XLSX.utils.aoa_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, 'Acompanhantes');
    
    console.log('✅ Arquivo Excel de teste criado com sucesso');
    console.log('📁 Para baixar: XLSX.writeFile(wb, "teste-acompanhantes.xlsx")');
    
    // Disponibilizar globalmente para download
    window.baixarExcelTeste = () => {
        XLSX.writeFile(wb, 'teste-acompanhantes.xlsx');
        console.log('📁 Arquivo de teste baixado!');
    };
    
    console.log('💡 Execute: window.baixarExcelTeste() para baixar arquivo de teste');
} catch (error) {
    console.error('❌ Erro ao criar arquivo de teste:', error);
}

// TESTE 7: Verificar permissões do usuário
console.log('\n7️⃣ VERIFICANDO PERMISSÕES:');
if (window.usuarioAdmin) {
    console.log('✅ Usuário logado:', window.usuarioAdmin.nome || 'Nome não disponível');
    console.log('✅ Role:', window.usuarioAdmin.role || 'Role não disponível');
    console.log('✅ Pode criar usuários:', window.usuarioAdmin.permissoes?.criarUsuarios ? '✅ SIM' : '❌ NÃO');
} else {
    console.log('❌ Usuário não está logado ou dados não disponíveis');
}

// TESTE 8: Função de teste direto
console.log('\n8️⃣ FUNÇÃO DE TESTE DIRETO:');
window.testarImportacaoExcel = function() {
    console.log('\n🧪 INICIANDO TESTE DIRETO...');
    
    // Simular dados de importação
    const dadosTeste = [
        ['Teste User 1', 'teste1@example.com', '999', 'senha123'],
        ['Teste User 2', 'teste2@example.com', '998', 'senha456']
    ];
    
    window.dadosImportacao = dadosTeste;
    console.log('✅ Dados de teste criados:', dadosTeste);
    
    // Tentar processar
    if (typeof window.processarArquivoExcel === 'function') {
        console.log('🔄 Iniciando processamento...');
        window.processarArquivoExcel();
    } else {
        console.error('❌ Função processarArquivoExcel não encontrada!');
    }
};

console.log('💡 Execute: window.testarImportacaoExcel() para teste direto');

console.log('\n=== DIAGNÓSTICO CONCLUÍDO ===');
console.log('📋 Resumo dos próximos passos:');
console.log('1. Verifique se todos os itens acima estão ✅');
console.log('2. Se algum item está ❌, esse é o problema');
console.log('3. Execute window.baixarExcelTeste() para ter um arquivo válido');
console.log('4. Execute window.testarImportacaoExcel() para teste direto');
console.log('5. Teste manual: clique Importar Excel e selecione arquivo');