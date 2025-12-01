// 🚨 SCRIPT DE EMERGÊNCIA - Reset de Tentativas de Login YUNA
// Execute no console do navegador para resolver bloqueios de login

console.log('🚨 YUNA - Script de Emergência para Reset de Login');
console.log('================================');

// Função principal para resetar usuário específico
function emergencyResetUser(email) {
    if (!email) {
        console.error('❌ Email é obrigatório. Use: emergencyResetUser("usuario@exemplo.com")');
        return;
    }
    
    const key = `login_tentativas_${email}`;
    const antes = localStorage.getItem(key);
    
    localStorage.removeItem(key);
    
    console.log(`✅ Reset realizado para: ${email}`);
    console.log(`   Dados antes: ${antes || 'Nenhum'}`);
    console.log(`   Status: LIBERADO PARA LOGIN`);
}

// Função para resetar TODOS os usuários bloqueados
function emergencyResetAll() {
    const keys = Object.keys(localStorage);
    const loginKeys = keys.filter(key => key.startsWith('login_tentativas_'));
    
    if (loginKeys.length === 0) {
        console.log('ℹ️ Nenhum usuário bloqueado encontrado');
        return;
    }
    
    console.log(`🔓 Encontrados ${loginKeys.length} usuário(s) bloqueado(s):`);
    
    loginKeys.forEach(key => {
        const email = key.replace('login_tentativas_', '');
        const dados = JSON.parse(localStorage.getItem(key) || '{}');
        console.log(`   📧 ${email} - ${dados.count || 0} tentativas`);
        localStorage.removeItem(key);
    });
    
    console.log('✅ TODOS OS BLOQUEIOS REMOVIDOS!');
}

// Função para verificar status de usuários
function checkLoginStatus(email = null) {
    const keys = Object.keys(localStorage);
    const loginKeys = keys.filter(key => key.startsWith('login_tentativas_'));
    
    if (email) {
        // Verificar usuário específico
        const key = `login_tentativas_${email}`;
        const dados = JSON.parse(localStorage.getItem(key) || '{}');
        
        if (dados.count) {
            const agora = Date.now();
            const tempoRestante = Math.max(0, Math.ceil(((15 * 60 * 1000) - (agora - dados.lastAttempt)) / 1000 / 60));
            
            console.log(`📊 Status de ${email}:`);
            console.log(`   Tentativas: ${dados.count}/5`);
            console.log(`   Bloqueado: ${dados.count >= 5 ? 'SIM' : 'NÃO'}`);
            console.log(`   Tempo restante: ${tempoRestante} minutos`);
        } else {
            console.log(`✅ ${email}: Sem bloqueios`);
        }
    } else {
        // Verificar todos
        console.log(`📊 Status geral: ${loginKeys.length} usuário(s) com tentativas registradas`);
        
        if (loginKeys.length === 0) {
            console.log('✅ Nenhum usuário bloqueado');
            return;
        }
        
        loginKeys.forEach(key => {
            const email = key.replace('login_tentativas_', '');
            const dados = JSON.parse(localStorage.getItem(key) || '{}');
            const bloqueado = dados.count >= 5;
            
            console.log(`   ${bloqueado ? '🔒' : '⚠️'} ${email}: ${dados.count}/5 tentativas ${bloqueado ? '(BLOQUEADO)' : ''}`);
        });
    }
}

// Disponibilizar funções globalmente
window.emergencyResetUser = emergencyResetUser;
window.emergencyResetAll = emergencyResetAll;
window.checkLoginStatus = checkLoginStatus;

// Auto-executar verificação
console.log('🔍 Verificando status atual...');
checkLoginStatus();

console.log('\n📋 COMANDOS DISPONÍVEIS:');
console.log('   emergencyResetUser("email@exemplo.com") - Reset usuário específico');
console.log('   emergencyResetAll()                     - Reset TODOS os usuários');
console.log('   checkLoginStatus()                      - Verificar status geral');
console.log('   checkLoginStatus("email@exemplo.com")   - Status usuário específico');

// Para o caso específico da nutrição
if (typeof window !== 'undefined' && window.location.hostname) {
    console.log('\n🏥 RESET ESPECÍFICO PARA NUTRIÇÃO:');
    console.log('   emergencyResetUser("nutricao@yuna.com.br")');
}