// === SISTEMA DE LOGS DE AUDITORIA ===
// Arquivo para funções de auditoria e segurança

// Função para registrar logs de auditoria
async function registrarLogAuditoria(acao, detalhes = {}) {
    try {
        const usuario = window.usuarioAdmin || window.usuarioLogado || {};
        const timestamp = new Date();
        
        const logData = {
            acao: acao,
            usuarioId: usuario.uid || 'anonimo',
            usuarioEmail: usuario.email || 'desconhecido',
            userRole: usuario.role || window.userRole || 'indefinido',
            timestamp: timestamp,
            ip: await obterIP(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            detalhes: detalhes,
            sessionId: obterSessionId()
        };
        
        await window.db.collection('logs_auditoria').add(logData);
        console.log(`[AUDITORIA] ${acao}:`, logData);
        
    } catch (error) {
        console.error('[ERRO] Falha ao registrar log de auditoria:', error);
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

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.registrarLogAuditoria = registrarLogAuditoria;
    window.detectarAtividadeSuspeita = detectarAtividadeSuspeita;
    window.verificarTentativasLogin = verificarTentativasLogin;
    window.registrarTentativaLogin = registrarTentativaLogin;
    window.verificarIntegridadeSessao = verificarIntegridadeSessao;
    
    // Inicializar segurança
    limparConsoleProducao();
    verificarIntegridadeSessao();
    
    // Registrar carregamento da página
    registrarLogAuditoria('PAGE_LOAD', { 
        referrer: document.referrer,
        timestamp: new Date().toISOString()
    });
}