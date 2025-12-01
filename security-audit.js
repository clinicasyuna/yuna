// === SISTEMA DE LOGS DE AUDITORIA ===
// Arquivo para funções de auditoria e segurança

// Função para registrar logs de auditoria
async function registrarLogAuditoria(acao, detalhes = {}) {
    try {
        // Verificar se o usuário está autenticado
        if (!window.auth || !window.auth.currentUser) {
            console.warn('[AUDITORIA] Usuário não autenticado - log não registrado:', acao);
            return;
        }
        
        const usuario = window.usuarioAdmin || window.usuarioLogado || window.auth.currentUser || {};
        const timestamp = new Date();
        
        const logData = {
            acao: acao,
            usuarioId: usuario.uid || window.auth.currentUser?.uid || 'anonimo',
            usuarioEmail: usuario.email || window.auth.currentUser?.email || 'desconhecido',
            userRole: usuario.role || window.userRole || 'indefinido',
            timestamp: timestamp,
            ip: await obterIP(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            detalhes: detalhes,
            sessionId: obterSessionId()
        };
        
        // Tentar registrar o log com timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        await Promise.race([
            window.db.collection('logs_auditoria').add(logData),
            timeoutPromise
        ]);
        
        console.log(`[AUDITORIA] ${acao}:`, { acao, usuarioId: logData.usuarioId });
        
    } catch (error) {
        // Log local em caso de falha
        console.warn('[AUDITORIA] Falha ao registrar - salvando localmente:', acao, error.message);
        salvarLogLocal(acao, detalhes);
    }
}

// Função para obter IP do usuário (aproximado)
async function obterIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'IP_NAO_DISPONIVEL';
    }
}

// Função para obter/gerar session ID
function obterSessionId() {
    let sessionId = sessionStorage.getItem('yuna_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('yuna_session_id', sessionId);
    }
    return sessionId;
}

// Função para detectar tentativas suspeitas
function detectarAtividadeSuspeita(acao, detalhes) {
    const suspeito = {
        tentativasLoginFalhou: acao === 'LOGIN_FAILED',
        acessoForaHorario: new Date().getHours() < 6 || new Date().getHours() > 22,
        multiplosLogins: acao === 'LOGIN_SUCCESS' && detalhes.ultimoLogin,
        acessoIPDiferente: detalhes.ipAnterior && detalhes.ipAtual !== detalhes.ipAnterior
    };
    
    if (Object.values(suspeito).some(Boolean)) {
        registrarLogAuditoria('ATIVIDADE_SUSPEITA', { ...detalhes, suspeito });
    }
}

// Função para monitorar tentativas de login
let tentativasLogin = 0;
const maxTentativas = 5;
const tempoBloquio = 15 * 60 * 1000; // 15 minutos

// Função para resetar tentativas de login (uso de emergência)
function resetarTentativasLogin(email) {
    const chave = `login_tentativas_${email}`;
    localStorage.removeItem(chave);
    console.log(`🔓 Tentativas de login resetadas para: ${email}`);
    registrarLogAuditoria('LOGIN_ATTEMPTS_RESET', { email, resetBy: 'admin' });
}

// Função para limpar TODAS as tentativas de login (Super Admin)
function limparTodasTentativasLogin() {
    const keys = Object.keys(localStorage);
    const loginKeys = keys.filter(key => key.startsWith('login_tentativas_'));
    
    loginKeys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    console.log(`🔓 Todas as tentativas de login foram resetadas (${loginKeys.length} usuários)`);
    registrarLogAuditoria('ALL_LOGIN_ATTEMPTS_RESET', { count: loginKeys.length });
}

function verificarTentativasLogin(email) {
    const chave = `login_tentativas_${email}`;
    const dados = JSON.parse(localStorage.getItem(chave) || '{"count": 0, "lastAttempt": 0}');
    
    const agora = Date.now();
    
    // Reset se passou do tempo de bloqueio
    if (agora - dados.lastAttempt > tempoBloquio) {
        dados.count = 0;
    }
    
    // Verificar se está bloqueado
    if (dados.count >= maxTentativas) {
        const tempoRestante = Math.ceil((tempoBloquio - (agora - dados.lastAttempt)) / 1000 / 60);
        
        // Mostrar dica para resetar tentativas em desenvolvimento
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1') || window.location.hostname.includes('github.io')) {
            console.warn(`🔒 BLOQUEADO: ${email} - Para resetar execute: resetarTentativasLogin('${email}')`);
        }
        
        throw new Error(`Muitas tentativas de login. Tente novamente em ${tempoRestante} minutos.`);
    }
    
    return dados;
}

function registrarTentativaLogin(email, sucesso) {
    const chave = `login_tentativas_${email}`;
    const dados = verificarTentativasLogin(email);
    
    if (sucesso) {
        // Login bem-sucedido, limpar tentativas
        localStorage.removeItem(chave);
        registrarLogAuditoria('LOGIN_SUCCESS', { email });
    } else {
        // Login falhou, incrementar contador
        dados.count++;
        dados.lastAttempt = Date.now();
        localStorage.setItem(chave, JSON.stringify(dados));
        registrarLogAuditoria('LOGIN_FAILED', { email, tentativas: dados.count });
    }
}

// Função para limpar dados sensíveis do console em produção
function limparConsoleProducao() {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Em produção, sobrescrever console.log para dados sensíveis
        const originalLog = console.log;
        console.log = function(...args) {
            const mensagem = args.join(' ');
            if (mensagem.includes('password') || mensagem.includes('senha') || mensagem.includes('token')) {
                return; // Não exibir logs sensíveis em produção
            }
            originalLog.apply(console, args);
        };
    }
}

// Função para verificar integridade da sessão
function verificarIntegridadeSessao() {
    const usuario = window.usuarioAdmin || window.usuarioLogado;
    if (!usuario) return;
    
    // Verificar se a sessão não foi comprometida
    const sessionInfo = {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        url: window.location.href
    };
    
    const sessionAnterior = localStorage.getItem('yuna_session_info');
    if (sessionAnterior) {
        const anterior = JSON.parse(sessionAnterior);
        if (anterior.userAgent !== sessionInfo.userAgent) {
            registrarLogAuditoria('SESSAO_SUSPEITA', {
                motivo: 'UserAgent diferente',
                anterior: anterior.userAgent,
                atual: sessionInfo.userAgent
            });
        }
    }
    
    localStorage.setItem('yuna_session_info', JSON.stringify(sessionInfo));
}

// Função para salvar logs localmente quando o Firestore falha
function salvarLogLocal(acao, detalhes) {
    try {
        const logs = JSON.parse(localStorage.getItem('yuna_logs_locais') || '[]');
        logs.push({
            acao,
            detalhes,
            timestamp: new Date().toISOString(),
            url: window.location.href
        });
        
        // Manter apenas os últimos 50 logs locais
        if (logs.length > 50) {
            logs.splice(0, logs.length - 50);
        }
        
        localStorage.setItem('yuna_logs_locais', JSON.stringify(logs));
    } catch (error) {
        console.warn('[AUDITORIA] Falha ao salvar log local:', error);
    }
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.registrarLogAuditoria = registrarLogAuditoria;
    window.detectarAtividadeSuspeita = detectarAtividadeSuspeita;
    window.verificarTentativasLogin = verificarTentativasLogin;
    window.registrarTentativaLogin = registrarTentativaLogin;
    window.verificarIntegridadeSessao = verificarIntegridadeSessao;
    window.resetarTentativasLogin = resetarTentativasLogin;
    window.limparTodasTentativasLogin = limparTodasTentativasLogin;
    
    // Inicializar segurança
    limparConsoleProducao();
    verificarIntegridadeSessao();
    
    // Registrar carregamento da página
    registrarLogAuditoria('PAGE_LOAD', { 
        referrer: document.referrer,
        timestamp: new Date().toISOString()
    });
}