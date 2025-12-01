// 🧪 SCRIPT DE TESTE - Correção de Sincronização Email
// Execute no console do navegador após fazer login no admin

console.log('🧪 INICIANDO TESTES DE CORREÇÃO DE EMAIL...');

// Função para testar a validação de email
function testarValidacaoEmail() {
    console.log('\n📧 TESTE 1: Validação de Email');
    
    const emails = [
        'teste@yuna.com.br',     // Válido
        'invalid-email',         // Inválido
        'test@',                 // Inválido
        '',                      // Vazio
        'usuario@exemplo.com'    // Válido
    ];
    
    emails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        console.log(`  ${isValid ? '✅' : '❌'} Email: "${email}" - ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
    });
}

// Função para simular detecção de email alterado
function testarDeteccaoEmailAlterado() {
    console.log('\n🔍 TESTE 2: Detecção de Email Alterado');
    
    const cenarios = [
        { original: 'antigo@yuna.com', novo: 'novo@yuna.com', esperado: true },
        { original: 'mesmo@yuna.com', novo: 'mesmo@yuna.com', esperado: false },
        { original: '', novo: 'email@yuna.com', esperado: true },
    ];
    
    cenarios.forEach((cenario, i) => {
        const emailMudou = cenario.original !== cenario.novo;
        const resultado = emailMudou === cenario.esperado ? '✅' : '❌';
        console.log(`  ${resultado} Cenário ${i + 1}: "${cenario.original}" → "${cenario.novo}" - Mudou: ${emailMudou}`);
    });
}

// Função para verificar se as funções existem
function verificarFuncoesImplementadas() {
    console.log('\n🔧 TESTE 3: Verificação de Funções');
    
    const funcoes = [
        'salvarUsuarioEditado',
        'verificarEmailExistente', 
        'corrigirProblemaEmail',
        'editarUsuario',
        'handleLogin'
    ];
    
    funcoes.forEach(funcao => {
        const existe = typeof window[funcao] === 'function';
        console.log(`  ${existe ? '✅' : '❌'} Função: ${funcao} - ${existe ? 'EXISTE' : 'NÃO ENCONTRADA'}`);
    });
}

// Função para testar estrutura de dados do usuário com problema
function testarEstruturaDadosProblema() {
    console.log('\n📊 TESTE 4: Estrutura de Dados para Problema de Email');
    
    const usuarioComProblema = {
        nome: 'Teste Usuario',
        email: 'novo.email@yuna.com',
        emailAlteradoPorAdmin: true,
        dataAlteracaoEmail: new Date(),
        role: 'equipe',
        departamento: 'nutricao'
    };
    
    const temProblema = !!usuarioComProblema.emailAlteradoPorAdmin;
    console.log(`  ${temProblema ? '⚠️' : '✅'} Usuário tem problema: ${temProblema}`);
    console.log(`  📅 Data alteração: ${usuarioComProblema.dataAlteracaoEmail}`);
    console.log(`  📧 Email atual: ${usuarioComProblema.email}`);
}

// Função para simular erro de login
function simularTratamentoErroLogin() {
    console.log('\n🚫 TESTE 5: Simulação de Tratamento de Erro de Login');
    
    const errosLogin = [
        { code: 'auth/invalid-login-credentials', esperado: 'Detecção de email alterado' },
        { code: 'auth/user-not-found', esperado: 'Verificação no Firestore' },
        { code: 'auth/wrong-password', esperado: 'Senha incorreta normal' },
    ];
    
    errosLogin.forEach(erro => {
        const isEmailRelated = erro.code === 'auth/invalid-login-credentials' || erro.code === 'auth/user-not-found';
        console.log(`  ${isEmailRelated ? '🔍' : '✅'} Erro: ${erro.code} - ${isEmailRelated ? 'Verificar Firestore' : 'Tratamento normal'}`);
    });
}

// Executar todos os testes
function executarTodosTestes() {
    console.log('🎯 EXECUTANDO BATERIA COMPLETA DE TESTES...\n');
    
    testarValidacaoEmail();
    testarDeteccaoEmailAlterado();
    verificarFuncoesImplementadas();
    testarEstruturaDadosProblema();
    simularTratamentoErroLogin();
    
    console.log('\n🎉 TESTES CONCLUÍDOS! Verifique os resultados acima.');
    console.log('💡 Para testar funcionalidades reais, use o painel admin.');
}

// Auto-executar se estiver no contexto correto
if (typeof window !== 'undefined' && window.location && window.location.pathname.includes('admin')) {
    console.log('🏥 Contexto: Painel Admin YUNA detectado');
    executarTodosTestes();
} else {
    console.log('ℹ️ Execute este script no painel admin do YUNA para testes completos');
    console.log('📝 Ou chame: executarTodosTestes()');
}

// Exportar função para uso manual
if (typeof window !== 'undefined') {
    window.testarCorrecaoEmail = executarTodosTestes;
}