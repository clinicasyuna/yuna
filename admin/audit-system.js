/**
 * YUNA SOLICITE - SISTEMA DE AUDITORIA E MONITORAMENTO
 * 
 * Módulo completo para registro de ações, monitoramento de usuários online,
 * histórico de mudanças e relatórios de auditoria.
 * 
 * @version 2.0
 * @date 14/01/2026
 * @author Samuel dos Reis Lacerda Junior
 */

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const AUDIT_CONFIG = {
    // Tempo para considerar usuário offline (5 minutos sem atividade)
    OFFLINE_TIMEOUT: 5 * 60 * 1000,
    
    // Intervalo de atualização de presença (30 segundos)
    PRESENCE_UPDATE_INTERVAL: 30 * 1000,
    
    // Retenção de logs (90 dias)
    LOG_RETENTION_DAYS: 90,
    
    // Tipos de ação
    ACTION_TYPES: {
        LOGIN: 'login',
        LOGOUT: 'logout',
        CREATE: 'create',
        UPDATE: 'update',
        DELETE: 'delete',
        VIEW: 'view',
        EXPORT: 'export',
        IMPORT: 'import'
    },
    
    // Recursos monitorados
    RESOURCES: {
        SOLICITACOES: 'solicitacoes',
        USUARIOS_ADMIN: 'usuarios_admin',
        USUARIOS_EQUIPE: 'usuarios_equipe',
        USUARIOS_ACOMPANHANTES: 'usuarios_acompanhantes',
        DASHBOARD: 'dashboard',
        RELATORIOS: 'relatorios',
        CONFIGURACOES: 'configuracoes'
    }
};

// ============================================================================
// VARIÁVEIS GLOBAIS
// ============================================================================

let presenceInterval = null;
let onlineUsersListener = null;
let currentSessionId = null;

// ============================================================================
// FUNÇÃO PRINCIPAL: REGISTRAR AÇÃO
// ============================================================================

/**
 * Registra uma ação no sistema de auditoria
 * @param {Object} params - Parâmetros da ação
 * @param {string} params.action - Tipo de ação (login, create, update, etc.)
 * @param {string} params.resource - Recurso afetado (solicitacoes, usuarios, etc.)
 * @param {string} params.resourceId - ID do documento afetado
 * @param {Object} params.details - Detalhes adicionais (before, after, changes)
 * @param {boolean} params.success - Se a ação foi bem-sucedida
 * @param {string} params.error - Mensagem de erro (se houver)
 */
async function registrarAcaoAuditoria(params) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn('[AUDIT] Tentativa de registrar ação sem usuário autenticado');
            return;
        }

        // Obter informações do usuário
        let userRole = 'desconhecido';
        let userEmail = user.email || 'email-desconhecido';
        
        // Tentar obter role do cache
        if (window.currentUser && window.currentUser.role) {
            userRole = window.currentUser.role;
        }

        // Criar registro de auditoria
        const auditLog = {
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: user.uid,
            userEmail: userEmail,
            userRole: userRole,
            action: params.action,
            resource: params.resource,
            resourceId: params.resourceId || null,
            details: {
                before: params.details?.before || null,
                after: params.details?.after || null,
                changes: params.details?.changes || [],
                ip: await obterIPUsuario(),
                userAgent: navigator.userAgent,
                page: window.location.pathname,
                ...params.details
            },
            metadata: {
                page: window.location.pathname,
                sessionId: currentSessionId,
                success: params.success !== false,
                error: params.error || null,
                timestamp_local: new Date().toISOString()
            }
        };

        // Salvar no Firestore
        await firebase.firestore().collection('audit_logs').add(auditLog);
        
        console.log('[AUDIT] ✅ Ação registrada:', params.action, params.resource);
        
    } catch (error) {
        console.error('[AUDIT] ❌ Erro ao registrar ação:', error);
    }
}

// ============================================================================
// MONITORAMENTO DE PRESENÇA (QUEM ESTÁ ONLINE)
// ============================================================================

/**
 * Inicializa o sistema de presença (usuários online)
 */
function inicializarSistemaPresenca() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    console.log('[AUDIT] 🟢 Inicializando sistema de presença...');

    // Gerar ID único para esta sessão
    currentSessionId = `${user.uid}_${Date.now()}`;

    // Criar/atualizar registro de presença
    atualizarPresenca('online');

    // Atualizar presença periodicamente
    presenceInterval = setInterval(() => {
        atualizarPresenca('online');
    }, AUDIT_CONFIG.PRESENCE_UPDATE_INTERVAL);

    // Marcar como offline ao fechar aba/navegador
    window.addEventListener('beforeunload', () => {
        atualizarPresenca('offline', true);
    });

    // Detectar inatividade (idle)
    let inactivityTimer;
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        atualizarPresenca('online');
        inactivityTimer = setTimeout(() => {
            atualizarPresenca('idle');
        }, 5 * 60 * 1000); // 5 minutos
    };

    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });

    console.log('[AUDIT] ✅ Sistema de presença ativo');
}

/**
 * Atualiza o status de presença do usuário atual
 * @param {string} status - Status (online, idle, offline)
 * @param {boolean} isSync - Se é síncrono (para beforeunload)
 */
function atualizarPresenca(status, isSync = false) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const presencaData = {
        userId: user.uid,
        email: user.email,
        role: window.currentUser?.role || 'desconhecido',
        lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
        page: window.location.pathname,
        status: status,
        sessionId: currentSessionId,
        sessionStart: firebase.firestore.Timestamp.now()
    };

    const docRef = firebase.firestore().collection('usuarios_online').doc(user.uid);

    if (isSync) {
        // Usar sendBeacon para envio síncrono em beforeunload (não implementado aqui, usar set normal)
        docRef.set(presencaData).catch(err => console.error('[AUDIT] Erro ao atualizar presença:', err));
    } else {
        docRef.set(presencaData)
            .catch(err => console.error('[AUDIT] Erro ao atualizar presença:', err));
    }
}

/**
 * Para o sistema de presença (logout)
 */
function pararSistemaPresenca() {
    if (presenceInterval) {
        clearInterval(presenceInterval);
        presenceInterval = null;
    }
    
    atualizarPresenca('offline');
    
    console.log('[AUDIT] 🔴 Sistema de presença desativado');
}

// ============================================================================
// MONITORAMENTO DE USUÁRIOS ONLINE (TEMPO REAL)
// ============================================================================

/**
 * Inicia listener para monitorar usuários online em tempo real
 * @param {Function} callback - Função chamada com lista de usuários online
 */
function monitorarUsuariosOnline(callback) {
    console.log('[AUDIT] 👁️ Iniciando monitoramento de usuários online...');

    const now = Date.now();
    const cutoffTime = new Date(now - AUDIT_CONFIG.OFFLINE_TIMEOUT);

    onlineUsersListener = firebase.firestore()
        .collection('usuarios_online')
        .where('lastActivity', '>', firebase.firestore.Timestamp.fromDate(cutoffTime))
        .onSnapshot(snapshot => {
            const usuariosOnline = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                
                // Calcular tempo de sessão
                const sessionStart = data.sessionStart?.toDate() || new Date();
                const tempoSessao = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
                
                usuariosOnline.push({
                    id: doc.id,
                    email: data.email,
                    role: data.role,
                    page: data.page,
                    status: data.status,
                    lastActivity: data.lastActivity?.toDate() || new Date(),
                    tempoSessao: tempoSessao,
                    sessionId: data.sessionId
                });
            });

            // Ordenar por última atividade (mais recente primeiro)
            usuariosOnline.sort((a, b) => b.lastActivity - a.lastActivity);

            callback(usuariosOnline);
        }, error => {
            console.error('[AUDIT] Erro ao monitorar usuários online:', error);
        });
}

/**
 * Para o listener de usuários online
 */
function pararMonitoramentoOnline() {
    if (onlineUsersListener) {
        onlineUsersListener();
        onlineUsersListener = null;
        console.log('[AUDIT] Monitoramento de usuários online parado');
    }
}

// ============================================================================
// CONSULTAS E RELATÓRIOS
// ============================================================================

/**
 * Busca logs de auditoria com filtros
 * @param {Object} filtros - Filtros de busca
 * @returns {Promise<Array>} Array de logs
 */
async function buscarLogsAuditoria(filtros = {}) {
    try {
        let query = firebase.firestore().collection('audit_logs');

        // Aplicar filtros
        if (filtros.userId) {
            query = query.where('userId', '==', filtros.userId);
        }
        
        if (filtros.action) {
            query = query.where('action', '==', filtros.action);
        }
        
        if (filtros.resource) {
            query = query.where('resource', '==', filtros.resource);
        }
        
        if (filtros.dataInicio) {
            query = query.where('timestamp', '>=', filtros.dataInicio);
        }
        
        if (filtros.dataFim) {
            query = query.where('timestamp', '<=', filtros.dataFim);
        }

        // Ordenar por timestamp (mais recente primeiro)
        query = query.orderBy('timestamp', 'desc');

        // Limitar resultados
        const limite = filtros.limite || 100;
        query = query.limit(limite);

        const snapshot = await query.get();
        
        const logs = [];
        snapshot.forEach(doc => {
            logs.push({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date()
            });
        });

        console.log('[AUDIT] 📊 Logs encontrados:', logs.length);
        return logs;
        
    } catch (error) {
        console.error('[AUDIT] Erro ao buscar logs:', error);
        return [];
    }
}

/**
 * Busca histórico de mudanças de um recurso específico
 * @param {string} resource - Tipo de recurso
 * @param {string} resourceId - ID do recurso
 * @returns {Promise<Array>} Histórico de mudanças
 */
async function buscarHistoricoRecurso(resource, resourceId) {
    try {
        const snapshot = await firebase.firestore()
            .collection('audit_logs')
            .where('resource', '==', resource)
            .where('resourceId', '==', resourceId)
            .orderBy('timestamp', 'desc')
            .get();

        const historico = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            historico.push({
                id: doc.id,
                timestamp: data.timestamp?.toDate() || new Date(),
                action: data.action,
                userId: data.userId,
                userEmail: data.userEmail,
                userRole: data.userRole,
                before: data.details?.before,
                after: data.details?.after,
                changes: data.details?.changes || []
            });
        });

        console.log('[AUDIT] 📜 Histórico do recurso:', resource, resourceId, '→', historico.length, 'registros');
        return historico;
        
    } catch (error) {
        console.error('[AUDIT] Erro ao buscar histórico:', error);
        return [];
    }
}

/**
 * Gera relatório de atividades de um usuário
 * @param {string} userId - ID do usuário
 * @param {Date} dataInicio - Data inicial
 * @param {Date} dataFim - Data final
 * @returns {Promise<Object>} Relatório de atividades
 */
async function gerarRelatorioUsuario(userId, dataInicio, dataFim) {
    try {
        const logs = await buscarLogsAuditoria({
            userId: userId,
            dataInicio: firebase.firestore.Timestamp.fromDate(dataInicio),
            dataFim: firebase.firestore.Timestamp.fromDate(dataFim),
            limite: 1000
        });

        // Agrupar por tipo de ação
        const acoesPorTipo = {};
        logs.forEach(log => {
            acoesPorTipo[log.action] = (acoesPorTipo[log.action] || 0) + 1;
        });

        // Agrupar por recurso
        const acoesPorRecurso = {};
        logs.forEach(log => {
            acoesPorRecurso[log.resource] = (acoesPorRecurso[log.resource] || 0) + 1;
        });

        const relatorio = {
            userId: userId,
            periodo: { inicio: dataInicio, fim: dataFim },
            totalAcoes: logs.length,
            acoesPorTipo: acoesPorTipo,
            acoesPorRecurso: acoesPorRecurso,
            logs: logs
        };

        console.log('[AUDIT] 📈 Relatório gerado:', relatorio.totalAcoes, 'ações');
        return relatorio;
        
    } catch (error) {
        console.error('[AUDIT] Erro ao gerar relatório:', error);
        return null;
    }
}

// ============================================================================
// DETECÇÃO DE ATIVIDADES SUSPEITAS
// ============================================================================

/**
 * Verifica atividades suspeitas (múltiplas falhas de login, ações fora do horário, etc.)
 * @param {string} userId - ID do usuário (opcional)
 * @returns {Promise<Array>} Lista de alertas
 */
async function detectarAtividadesSuspeitas(userId = null) {
    try {
        const agora = new Date();
        const umDiaAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
        
        let query = firebase.firestore()
            .collection('audit_logs')
            .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(umDiaAtras));
        
        if (userId) {
            query = query.where('userId', '==', userId);
        }

        const snapshot = await query.get();
        
        const alertas = [];
        const falhasPorUsuario = {};
        const acoesPorUsuario = {};

        snapshot.forEach(doc => {
            const log = doc.data();
            const timestamp = log.timestamp?.toDate() || new Date();
            const hora = timestamp.getHours();

            // 1. Múltiplas falhas de login
            if (log.action === 'login' && log.metadata?.success === false) {
                falhasPorUsuario[log.userId] = (falhasPorUsuario[log.userId] || 0) + 1;
                
                if (falhasPorUsuario[log.userId] >= 3) {
                    alertas.push({
                        tipo: 'MULTIPLAS_FALHAS_LOGIN',
                        severidade: 'alta',
                        userId: log.userId,
                        userEmail: log.userEmail,
                        detalhes: `${falhasPorUsuario[log.userId]} tentativas falhas de login`,
                        timestamp: timestamp
                    });
                }
            }

            // 2. Ações fora do horário (00h-06h)
            if ((hora >= 0 && hora < 6) && log.action === 'delete') {
                alertas.push({
                    tipo: 'ACAO_FORA_HORARIO',
                    severidade: 'media',
                    userId: log.userId,
                    userEmail: log.userEmail,
                    detalhes: `Ação de ${log.action} às ${hora}h`,
                    timestamp: timestamp
                });
            }

            // 3. Muitas ações em curto período
            const chave = `${log.userId}_${log.action}`;
            acoesPorUsuario[chave] = (acoesPorUsuario[chave] || []);
            acoesPorUsuario[chave].push(timestamp);
        });

        // Verificar ações em cascata (mais de 10 ações em 1 minuto)
        Object.entries(acoesPorUsuario).forEach(([chave, timestamps]) => {
            if (timestamps.length >= 10) {
                const primeiraAcao = timestamps[0];
                const ultimaAcao = timestamps[timestamps.length - 1];
                const diferencaMinutos = (ultimaAcao - primeiraAcao) / (1000 * 60);
                
                if (diferencaMinutos <= 1) {
                    const [userId, action] = chave.split('_');
                    alertas.push({
                        tipo: 'ACOES_EM_CASCATA',
                        severidade: 'media',
                        userId: userId,
                        detalhes: `${timestamps.length} ações de ${action} em ${Math.round(diferencaMinutos * 60)}s`,
                        timestamp: ultimaAcao
                    });
                }
            }
        });

        console.log('[AUDIT] 🚨 Alertas detectados:', alertas.length);
        return alertas;
        
    } catch (error) {
        console.error('[AUDIT] Erro ao detectar atividades suspeitas:', error);
        return [];
    }
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Obtém o IP do usuário (via serviço externo)
 * @returns {Promise<string>} IP do usuário
 */
async function obterIPUsuario() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'IP-desconhecido';
    }
}

/**
 * Formata tempo de sessão em formato legível
 * @param {number} segundos - Tempo em segundos
 * @returns {string} Tempo formatado
 */
function formatarTempoSessao(segundos) {
    if (segundos < 60) return `${segundos}s`;
    if (segundos < 3600) return `${Math.floor(segundos / 60)}min`;
    
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas}h ${minutos}min`;
}

/**
 * Limpa logs antigos (executar periodicamente)
 */
async function limparLogsAntigos() {
    try {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - AUDIT_CONFIG.LOG_RETENTION_DAYS);
        
        const snapshot = await firebase.firestore()
            .collection('audit_logs')
            .where('timestamp', '<', firebase.firestore.Timestamp.fromDate(dataLimite))
            .limit(500)
            .get();

        const batch = firebase.firestore().batch();
        let count = 0;
        
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            count++;
        });

        if (count > 0) {
            await batch.commit();
            console.log(`[AUDIT] 🧹 ${count} logs antigos removidos`);
        }
        
    } catch (error) {
        console.error('[AUDIT] Erro ao limpar logs antigos:', error);
    }
}

// ============================================================================
// EXPORTAR FUNÇÕES GLOBAIS
// ============================================================================

window.registrarAcaoAuditoria = registrarAcaoAuditoria;
window.inicializarSistemaPresenca = inicializarSistemaPresenca;
window.pararSistemaPresenca = pararSistemaPresenca;
window.monitorarUsuariosOnline = monitorarUsuariosOnline;
window.pararMonitoramentoOnline = pararMonitoramentoOnline;
window.buscarLogsAuditoria = buscarLogsAuditoria;
window.buscarHistoricoRecurso = buscarHistoricoRecurso;
window.gerarRelatorioUsuario = gerarRelatorioUsuario;
window.detectarAtividadesSuspeitas = detectarAtividadesSuspeitas;
window.formatarTempoSessao = formatarTempoSessao;
window.limparLogsAntigos = limparLogsAntigos;
window.AUDIT_CONFIG = AUDIT_CONFIG;

console.log('✅ [AUDIT] Sistema de auditoria carregado com sucesso');
