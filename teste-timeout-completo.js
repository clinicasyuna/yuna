// =============================
// 🔐 SCRIPT DE TESTE COMPLETO DO TIMEOUT
// Sistema YUNA - Timeout de Sessão
// =============================

console.log('🔐 INICIANDO TESTES DE TIMEOUT - YUNA SYSTEM');

// =============================
// 📊 FUNÇÕES DE DIAGNÓSTICO
// =============================

function diagnosticoCompleto() {
    console.log('\n📊 DIAGNÓSTICO COMPLETO DO TIMEOUT:');
    console.log('===================================');
    
    // Verifica se as variáveis existem
    console.log('🔍 Variáveis globais:');
    console.log('  sessionTimeoutID:', typeof window.sessionTimeoutID !== 'undefined' ? '✅' : '❌');
    console.log('  warningTimeoutID:', typeof window.warningTimeoutID !== 'undefined' ? '✅' : '❌');
    console.log('  timeoutWarningModal:', typeof window.timeoutWarningModal !== 'undefined' ? '✅' : '❌');
    console.log('  countdownInterval:', typeof window.countdownInterval !== 'undefined' ? '✅' : '❌');
    
    // Verifica se as funções existem
    console.log('\n🔧 Funções disponíveis:');
    console.log('  detectUserActivity:', typeof detectUserActivity === 'function' ? '✅' : '❌');
    console.log('  resetSessionTimeout:', typeof resetSessionTimeout === 'function' ? '✅' : '❌');
    console.log('  showTimeoutWarning:', typeof showTimeoutWarning === 'function' ? '✅' : '❌');
    console.log('  performAutoLogout:', typeof performAutoLogout === 'function' ? '✅' : '❌');
    console.log('  initializeSessionTimeout:', typeof initializeSessionTimeout === 'function' ? '✅' : '❌');
    
    // Verifica estado dos timers
    console.log('\n⏰ Estado atual dos timers:');
    console.log('  sessionTimeoutID ativo:', window.sessionTimeoutID ? '✅' : '❌');
    console.log('  warningTimeoutID ativo:', window.warningTimeoutID ? '✅' : '❌');
    
    // Verifica Firebase
    console.log('\n🔥 Firebase Auth:');
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const currentUser = firebase.auth().currentUser;
        console.log('  Usuário logado:', currentUser ? '✅ ' + currentUser.email : '❌');
    } else {
        console.log('  Firebase não carregado:', '❌');
    }
    
    console.log('\n===================================');
}

// =============================
// 🧪 TESTES ESPECÍFICOS
// =============================

function testeInicializacao() {
    console.log('\n🧪 TESTE DE INICIALIZAÇÃO:');
    console.log('============================');
    
    try {
        initializeSessionTimeout();
        console.log('✅ Inicialização executada com sucesso');
        
        setTimeout(() => {
            if (window.sessionTimeoutID) {
                console.log('✅ Timer de sessão ativado');
            } else {
                console.log('❌ Timer de sessão não foi ativado');
            }
        }, 1000);
        
    } catch (error) {
        console.log('❌ Erro na inicialização:', error.message);
    }
}

function testeDeteccaoAtividade() {
    console.log('\n🧪 TESTE DE DETECÇÃO DE ATIVIDADE:');
    console.log('===================================');
    
    // Armazena IDs originais
    const originalSessionID = window.sessionTimeoutID;
    const originalWarningID = window.warningTimeoutID;
    
    console.log('🔍 IDs antes da atividade:');
    console.log('  Session:', originalSessionID);
    console.log('  Warning:', originalWarningID);
    
    // Simula atividade
    detectUserActivity();
    
    setTimeout(() => {
        console.log('\n🔍 IDs após atividade:');
        console.log('  Session:', window.sessionTimeoutID);
        console.log('  Warning:', window.warningTimeoutID);
        
        if (window.sessionTimeoutID !== originalSessionID) {
            console.log('✅ Timer de sessão foi resetado');
        } else {
            console.log('❌ Timer de sessão não foi resetado');
        }
    }, 500);
}

function testeModalAviso() {
    console.log('\n🧪 TESTE DE MODAL DE AVISO:');
    console.log('============================');
    
    try {
        showTimeoutWarning();
        
        setTimeout(() => {
            const modal = document.getElementById('timeoutWarningModal');
            if (modal && !modal.classList.contains('hidden')) {
                console.log('✅ Modal de aviso exibido');
                console.log('🔍 Verificando elementos do modal...');
                
                const countdown = document.getElementById('countdownTimer');
                const continueBtn = document.getElementById('continueSessionBtn');
                const logoutBtn = document.getElementById('logoutNowBtn');
                
                console.log('  Countdown:', countdown ? '✅' : '❌');
                console.log('  Botão Continuar:', continueBtn ? '✅' : '❌');
                console.log('  Botão Sair:', logoutBtn ? '✅' : '❌');
                
                if (countdown) {
                    console.log('  Texto do countdown:', countdown.textContent);
                }
            } else {
                console.log('❌ Modal de aviso não foi exibido');
            }
        }, 1000);
        
    } catch (error) {
        console.log('❌ Erro ao exibir modal:', error.message);
    }
}

function testeLogoutAutomatico() {
    console.log('\n🧪 TESTE DE LOGOUT AUTOMÁTICO:');
    console.log('===============================');
    
    // Aviso ao usuário
    console.log('⚠️ ATENÇÃO: Este teste irá fazer logout automático em 5 segundos!');
    console.log('   Digite "cancelar()" para cancelar o teste.');
    
    window.cancelarTeste = function() {
        clearTimeout(window.testeLogoutTimeout);
        console.log('✅ Teste de logout cancelado');
    };
    
    window.testeLogoutTimeout = setTimeout(() => {
        try {
            performAutoLogout();
            console.log('✅ Função de logout executada');
        } catch (error) {
            console.log('❌ Erro no logout:', error.message);
        }
    }, 5000);
}

// =============================
// 🎯 TESTES RÁPIDOS
// =============================

function testesRapidos() {
    console.log('\n🎯 EXECUTANDO TESTES RÁPIDOS:');
    console.log('==============================');
    
    // Teste 1: Variáveis globais
    const variaveis = ['sessionTimeoutID', 'warningTimeoutID', 'timeoutWarningModal', 'countdownInterval'];
    console.log('\n📋 Variáveis globais:');
    variaveis.forEach(v => {
        console.log(`  ${v}: ${typeof window[v] !== 'undefined' ? '✅' : '❌'}`);
    });
    
    // Teste 2: Funções
    const funcoes = ['detectUserActivity', 'resetSessionTimeout', 'showTimeoutWarning', 'performAutoLogout'];
    console.log('\n⚙️ Funções:');
    funcoes.forEach(f => {
        console.log(`  ${f}: ${typeof window[f] === 'function' ? '✅' : '❌'}`);
    });
    
    // Teste 3: DOM
    console.log('\n🌐 Elementos DOM:');
    const elementos = ['timeoutWarningModal', 'countdownTimer', 'continueSessionBtn', 'logoutNowBtn'];
    elementos.forEach(e => {
        const elem = document.getElementById(e);
        console.log(`  ${e}: ${elem ? '✅' : '❌'}`);
    });
}

// =============================
// 🚀 EXECUTAR TODOS OS TESTES
// =============================

function executarTodosTestes() {
    console.log('\n🚀 EXECUTANDO BATERIA COMPLETA DE TESTES:');
    console.log('==========================================');
    
    diagnosticoCompleto();
    
    setTimeout(() => {
        testeInicializacao();
    }, 1000);
    
    setTimeout(() => {
        testeDeteccaoAtividade();
    }, 3000);
    
    setTimeout(() => {
        testeModalAviso();
    }, 5000);
    
    setTimeout(() => {
        testesRapidos();
    }, 7000);
    
    console.log('\n⏰ Cronograma dos testes:');
    console.log('  0s: Diagnóstico completo');
    console.log('  1s: Teste de inicialização');
    console.log('  3s: Teste de detecção de atividade');
    console.log('  5s: Teste de modal de aviso');
    console.log('  7s: Testes rápidos');
    console.log('\n⚠️ Para teste de logout: digite "testeLogoutAutomatico()"');
}

// =============================
// 🎮 COMANDOS DISPONÍVEIS
// =============================

console.log('\n🎮 COMANDOS DISPONÍVEIS:');
console.log('========================');
console.log('diagnosticoCompleto()     - Diagnóstico completo do sistema');
console.log('testeInicializacao()      - Testa inicialização do timeout');
console.log('testeDeteccaoAtividade()  - Testa detecção de atividade do usuário');
console.log('testeModalAviso()         - Testa exibição do modal de aviso');
console.log('testeLogoutAutomatico()   - Testa logout automático (CUIDADO!)');
console.log('testesRapidos()           - Executa testes rápidos básicos');
console.log('executarTodosTestes()     - Executa bateria completa de testes');
console.log('\n🔧 COMANDOS DO SISTEMA:');
console.log('verificarTimeout()        - Verifica status atual');
console.log('testarTimeout()           - Força aviso em 5 segundos');
console.log('extendSession()           - Estende sessão atual');
console.log('\n🚀 Execute "executarTodosTestes()" para começar!');