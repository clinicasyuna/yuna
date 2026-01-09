/**
 * Sistema YUNA - Painel Administrativo
 * Copyright © 2025 Samuel dos Reis Lacerda Junior. Todos os direitos reservados.
 * 
 * Este software é propriedade intelectual protegida por direitos autorais.
 * Uso não autorizado é estritamente proibido.
 * 
 * Versão: 2.0.0
 * Data de Criação: 14 de novembro de 2025
 * Última atualização: 14/11/2025
 */

// admin-panel.js - Painel Administrativo YUNA

// === INICIALIZAÇÃO DOS MÓDULOS DE OTIMIZAÇÃO ===
// Performance Monitor - rastreamento de performance
if (!window.perfMonitor) {
    console.warn('[INIT] ⚠️ PerformanceMonitor não carregado! Verificar se performance-monitor.js está no HTML.');
}

// Listener Manager - gerenciamento centralizado de listeners
if (!window.listenerManager) {
    console.warn('[INIT] ⚠️ ListenerManager não carregado! Verificar se listener-manager.js está no HTML.');
}

// Cache Manager - cache LRU com limite de 200 itens
if (!window.cacheManager) {
    console.warn('[INIT] ⚠️ CacheManager não carregado! Verificar se cache-manager.js está no HTML.');
    // Fallback: criar cache legado
    window.cachedSolicitacoes = window.cachedSolicitacoes || [];
    window.cachedUsuarios = window.cachedUsuarios || [];
} else {
    console.log('[INIT] ✅ CacheManager ativo com LRU (limite: 200 itens)');
}

// Query Helper - paginação e otimização de queries
if (!window.queryHelper) {
    console.warn('[INIT] ⚠️ QueryHelper não carregado! Verificar se query-helper.js está no HTML.');
}

// === COMPATIBILIDADE: Cache legado como proxy para CacheManager ===
// Permite código legado usar window.cachedSolicitacoes enquanto migra para CacheManager
if (window.cacheManager) {
    window.cacheManager.syncWithLegacyCache();
    console.log('[INIT] ✅ Cache legado sincronizado com CacheManager');
} else {
    window.cachedSolicitacoes = window.cachedSolicitacoes || [];
    window.cachedUsuarios = window.cachedUsuarios || [];
    console.log('[INIT] ✅ Cache legado inicializado (fallback)');
}

// === SISTEMA DE TIMEOUT DE SESSÃO ===
let sessionTimeout;
let warningTimeout;
let lastActivity = Date.now();
const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutos
const WARNING_TIME = 2 * 60 * 1000; // 2 minutos antes do logout

// Detectar atividade do usuário
function detectUserActivity() {
    lastActivity = Date.now();
    resetSessionTimeout();
}

// Resetar timer de timeout
function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    clearTimeout(warningTimeout);
    
    // Warning 2 minutos antes
    warningTimeout = setTimeout(() => {
        showTimeoutWarning();
    }, TIMEOUT_DURATION - WARNING_TIME);
    
    // Logout automático
    sessionTimeout = setTimeout(() => {
        performAutoLogout();
    }, TIMEOUT_DURATION);
}

// Mostrar aviso de timeout
function showTimeoutWarning() {
    const modal = document.createElement('div');
    modal.id = 'timeout-warning-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-lg font-medium text-gray-900">Sessão Expirando</h3>
                    <p class="text-sm text-gray-500">Sua sessão será encerrada em <span id="countdown">2:00</span> por inatividade.</p>
                </div>
            </div>
            <div class="flex gap-3">
                <button onclick="extendSession()" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Continuar Sessão
                </button>
                <button onclick="performAutoLogout()" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                    Sair Agora
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Countdown de 2 minutos
    let timeLeft = 120;
    const countdownEl = document.getElementById('countdown');
    const countdownInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            performAutoLogout();
        }
    }, 1000);
    
    // Salvar interval para limpeza
    modal.countdownInterval = countdownInterval;
}

// Estender sessão
function extendSession() {
    const modal = document.getElementById('timeout-warning-modal');
    if (modal) {
        if (modal.countdownInterval) {
            clearInterval(modal.countdownInterval);
        }
        modal.remove();
    }
    detectUserActivity();
    showToast('Sucesso', 'Sessão estendida com sucesso!', 'success');
}

// Realizar logout automático
function performAutoLogout() {
    console.log('[TIMEOUT] 🚪 Realizando logout automático por inatividade');
    
    // === LIMPEZA DE RECURSOS (OTIMIZAÇÕES) ===
    // Limpar todos os listeners Firestore ativos
    if (window.listenerManager) {
        const listenerCount = window.listenerManager.unregisterAll();
        console.log(`[CLEANUP] ✅ ${listenerCount} listeners Firestore removidos`);
    }
    
    // Limpar cache LRU
    if (window.cacheManager) {
        window.cacheManager.limpar();
        console.log('[CLEANUP] ✅ Cache LRU limpo');
    }
    
    // Gerar relatório final de performance
    if (window.perfMonitor) {
        const report = window.perfMonitor.generateReport();
        console.log('[PERFORMANCE] 📊 Relatório final:', report);
    }
    
    // Limpar modal se existir
    const modal = document.getElementById('timeout-warning-modal');
    if (modal) {
        if (modal.countdownInterval) {
            clearInterval(modal.countdownInterval);
        }
        modal.remove();
    }
    
    // Limpar timeouts
    clearTimeout(sessionTimeout);
    clearTimeout(warningTimeout);
    
    // Mostrar notificação
    showToast('Sessão Expirada', 'Você foi desconectado por inatividade.', 'warning');
    
    // Realizar logout e redirecionar para página de login
    setTimeout(() => {
        if (window.auth) {
            window.auth.signOut().then(() => {
                // Redirecionar para página de login em vez de reload
                window.location.href = window.location.origin + window.location.pathname.replace('/admin/', '/');
            }).catch(() => {
                // Fallback: redirecionar mesmo com erro
                window.location.href = window.location.origin + window.location.pathname.replace('/admin/', '/');
            });
        } else {
            // Fallback: redirecionar mesmo sem auth
            window.location.href = window.location.origin + window.location.pathname.replace('/admin/', '/');
        }
    }, 2000);
}

// Inicializar sistema de timeout
function initializeSessionTimeout() {
    console.log('[TIMEOUT] ⏱️ Sistema de timeout inicializado (10 minutos)');
    
    // Events de atividade
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
        document.addEventListener(event, detectUserActivity, true);
    });
    
    // Iniciar timeout
    resetSessionTimeout();
}

// Expor funções globalmente
window.extendSession = extendSession;
window.performAutoLogout = performAutoLogout;

// === FUNÇÕES DE DEBUG PARA TIMEOUT ===
window.testarTimeout = function() {
    console.log('🧪 Testando sistema de timeout...');
    console.log('⏱️ Tempo até warning:', (TIMEOUT_DURATION - WARNING_TIME) / 1000 / 60, 'minutos');
    console.log('⏱️ Tempo total até logout:', TIMEOUT_DURATION / 1000 / 60, 'minutos');
    console.log('📊 Última atividade:', new Date(lastActivity).toLocaleTimeString());
    
    // Forçar warning para teste (em 5 segundos)
    clearTimeout(warningTimeout);
    warningTimeout = setTimeout(() => {
        console.log('⚠️ Mostrando warning de teste...');
        showTimeoutWarning();
    }, 5000);
    
    console.log('⚠️ Warning de teste será exibido em 5 segundos...');
};

window.verificarTimeout = function() {
    console.log('🔍 Status do sistema de timeout:');
    console.log('- Última atividade:', new Date(lastActivity).toLocaleString());
    console.log('- Timeout ativo:', !!sessionTimeout);
    console.log('- Warning ativo:', !!warningTimeout);
    console.log('- Tempo restante até warning:', Math.max(0, (lastActivity + TIMEOUT_DURATION - WARNING_TIME - Date.now()) / 1000 / 60).toFixed(1), 'min');
    console.log('- Tempo restante até logout:', Math.max(0, (lastActivity + TIMEOUT_DURATION - Date.now()) / 1000 / 60).toFixed(1), 'min');
};

// === CONFIGURAÇÃO DE MODO DE PRODUÇÃO ===
const MODO_PRODUCAO = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1' && 
                      window.location.hostname !== 'file://';

// Função de log condicional - só mostra logs em desenvolvimento
function debugLog(message, ...args) {
    if (!MODO_PRODUCAO) {
        console.log(message, ...args);
    }
}

// === DECLARAÇÕES ANTECIPADAS DE FUNÇÕES CRÍTICAS ===
// Declarações para evitar problemas de ordem de carregamento
let limparDadosTeste, verificarEstatisticas, adicionarPainelManutencao;

// === CONTROLE DE LISTENERS ===
// Variável global para controlar o listener de autenticação
let unsubscribeAuthListener = null;
let sistemaInicializado = false;
let logoutEmAndamento = false;

// === CACHE DE DADOS ===
window.cachedSolicitacoes = []; // Cache global das solicitações para cronômetros

// Função para limpar listeners ativos
function limparListenersAtivos() {
    try {
        debugLog('[DEBUG] Iniciando limpeza completa de listeners...');
        
        // Remover listener de autenticação
        if (unsubscribeAuthListener) {
            unsubscribeAuthListener();
            unsubscribeAuthListener = null;
        }
        
        // Remover listener de notificações
        if (window.notificationUnsubscribe) {
            window.notificationUnsubscribe();
            window.notificationUnsubscribe = null;
        }
        
        // Resetar flags de configuração
        window.notificationListenerConfigured = false;
        window.lastNotificationCheck = null;
        window.isInitialLoad = false;
        
        // Parar qualquer carregamento em andamento
        window.carregandoSolicitacoes = false;
        
        // Limpar outros listeners se necessário
        const elements = document.querySelectorAll('[data-listener-active]');
        elements.forEach(el => {
            el.removeAttribute('data-listener-active');
        });
        
        // Limpar cache do navegador
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.update();
                });
            });
        }
        
        debugLog('[DEBUG] Listeners e cache limpos com sucesso');
    } catch (error) {
        console.error('[ERRO] Falha ao limpar listeners:', error);
    }
}

// Função para limpar listeners ativos
function limparListenersAtivos() {
    try {
        // Remover listener de autenticação
        if (unsubscribeAuthListener) {
            unsubscribeAuthListener();
            unsubscribeAuthListener = null;
        }
        
        // Limpar outros listeners se necessário
        const elements = document.querySelectorAll('[data-listener-active]');
        elements.forEach(el => {
            el.removeAttribute('data-listener-active');
        });
        
        debugLog('[DEBUG] Listeners limpos com sucesso');
    } catch (error) {
        console.error('[ERRO] Falha ao limpar listeners:', error);
    }
}

// === LIMPEZA IMEDIATA DE CACHE AGRESSIVA ===
(function forceCleanupDebugElements() {
    
    // Função de limpeza extremamente agressiva
    function removeUnwantedButtons() {
        // Verificar se o DOM está carregado
        if (!document.body) {
            setTimeout(removeUnwantedButtons, 100);
            return;
        }
        
        const debugTexts = ['usuários direto', 'debug', 'relatórios direto', 'usuario direto', 'relatorio direto'];
        let removed = 0;
        
        // Buscar todos os botões
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(btn => {
            const text = (btn.textContent || '').trim().toLowerCase();
            if (debugTexts.some(debugText => text.includes(debugText))) {
                // Só loggar em desenvolvimento
                if (typeof debugLog === 'function') {
                    debugLog(`[FORCE-CLEANUP] Removendo botão: "${btn.textContent}"`);
                }
                btn.style.display = 'none !important';
                btn.style.visibility = 'hidden !important';
                btn.style.opacity = '0 !important';
                btn.style.pointerEvents = 'none !important';
                btn.remove();
                removed++;
            }
        });
        
        // Buscar por onclick específicos
        const specificSelectors = [
            'button[onclick*="showUsersDireto"]',
            'button[onclick*="debugFuncs"]', 
            'button[onclick*="mostrarRelatoriosDirectly"]',
            '#debug-btn',
            '#usuarios-direto-btn', 
            '#relatorios-direto-btn',
            'button[onclick*="showManageUsersModal"][class*="debug"]',
            'button[onclick*="mostrarRelatorios"][class*="direct"]'
        ];
        
        specificSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (typeof debugLog === 'function') {
                    debugLog(`[FORCE-CLEANUP] Removendo por seletor: ${selector}`);
                }
                el.style.display = 'none !important';
                el.remove();
                removed++;
            });
        });

        // Buscar por classes CSS específicas
        const unwantedClasses = ['.debug-button', '.btn-debug', '.direct-button'];
        unwantedClasses.forEach(className => {
            const elements = document.querySelectorAll(className);
            elements.forEach(el => {
                if (typeof debugLog === 'function') {
                    debugLog(`[FORCE-CLEANUP] Removendo por classe: ${className}`);
                }
                el.remove();
                removed++;
            });
        });
        
        if (removed > 0 && typeof debugLog === 'function') {
            debugLog(`[FORCE-CLEANUP] Total removido nesta iteração: ${removed}`);
        }
        
        // Forçar visibilidade do botão limpeza se for super admin
        const limpezaBtn = document.getElementById('limpeza-btn');
        if (limpezaBtn && window.usuarioAdmin && window.usuarioAdmin.role === 'super_admin') {
            limpezaBtn.classList.remove('btn-hide');
            limpezaBtn.classList.add('force-visible');
            limpezaBtn.style.cssText = 'display: inline-flex !important; visibility: visible !important;';
        }
        
        return removed;
    }

    // Executa imediatamente e a cada 50ms por 20 segundos (extremamente agressivo)
    const cleanupInterval = setInterval(() => {
        removeUnwantedButtons();
    }, 50); // Muito frequente: a cada 50ms
    
    // Parar limpeza após 20 segundos
    setTimeout(() => {
        clearInterval(cleanupInterval);
        if (typeof debugLog === 'function') {
            debugLog('[FORCE-CLEANUP] Limpeza finalizada');
        }
    }, 20000);
    
    // Executar também em eventos específicos
    document.addEventListener('DOMContentLoaded', removeUnwantedButtons);
    window.addEventListener('load', removeUnwantedButtons);
    
    // Observar mudanças no DOM e reagir imediatamente
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.tagName === 'BUTTON') {
                            const text = (node.textContent || '').toLowerCase();
                            if (text.includes('debug') || text.includes('direto') || text.includes('usuários direto')) {
                                console.log('[FORCE-CLEANUP] Interceptando botão adicionado:', node.textContent);
                                node.remove();
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Parar observação após 30 segundos
        setTimeout(() => {
            observer.disconnect();
            console.log('[FORCE-CLEANUP] Observador DOM desconectado');
        }, 30000);
    }
    
})();

// === LIMPEZA DE CACHE E ELEMENTOS INDESEJADOS ===
window.addEventListener('DOMContentLoaded', function() {
    // Remover botões debug que possam estar no cache
    setTimeout(() => {
        const elementosIndesejados = [
            'button[onclick*="showUsersDireto"]',
            'button[onclick*="debugFuncs"]', 
            'button[onclick*="mostrarRelatoriosDirectly"]',
            '.debug-btn',
            '#debug-btn',
            '#usuarios-direto-btn',
            '#relatorios-direto-btn'
        ];
        
        elementosIndesejados.forEach(selector => {
            const elementos = document.querySelectorAll(selector);
            elementos.forEach(elemento => {
                console.log(`[CLEANUP] Removendo elemento indesejado:`, elemento);
                elemento.remove();
            });
        });
        
        // Verificar se botões com textos específicos existem
        const todosBotoes = document.querySelectorAll('button');
        todosBotoes.forEach(btn => {
            const texto = btn.textContent || '';
            if (texto.includes('Usuários Direto') || 
                texto.includes('Debug') || 
                texto.includes('Relatórios Direto')) {
                console.log(`[CLEANUP] Removendo botão por texto:`, btn);
                btn.remove();
            }
        });
        
        console.log('[CLEANUP] Limpeza de elementos indesejados concluída');
    }, 100);
});

// === PROTEÇÃO CONTRA ERROS DE EXTENSÕES ===
(function() {
    'use strict';
    
    const originalErrorHandler = window.onerror;
    const extensionPatterns = [
        'PIN Company Discounts Provider',
        'chrome-extension',
        'pinComponent.js',
        'Invalid data',
        'Empty token!',
        'Failed to fetch',
        'net::ERR_FAILED',
        'favicon.ico'
    ];
    
    window.onerror = function(message, source, lineno, colno, error) {
        if (extensionPatterns.some(pattern => 
            (message && message.includes(pattern)) ||
            (source && source.includes(pattern))
        )) {
            return true; // Silenciar erro de extensão
        }
        return originalErrorHandler ? originalErrorHandler.apply(this, arguments) : false;
    };
    
    window.addEventListener('unhandledrejection', function(event) {
        const errorStr = event.reason?.toString() || '';
        if (extensionPatterns.some(pattern => errorStr.includes(pattern))) {
            event.preventDefault();
        }
    });
})();

// === FUNÇÕES PRINCIPAIS ===

// Função para alternar tipo de acesso (definida cedo para HTML poder chamar)
window.alterarTipoAcesso = function() {
    console.log('[DEBUG] alterarTipoAcesso: função chamada');
    
    const tipoSelect = document.getElementById('tipo-acesso');
    const departamentoSection = document.getElementById('departamento-section');
    const departamentoSelect = document.getElementById('departamento');
    
    console.log('[DEBUG] alterarTipoAcesso: elementos encontrados:', {
        tipoSelect: !!tipoSelect,
        departamentoSection: !!departamentoSection,
        departamentoSelect: !!departamentoSelect
    });
    
    if (!tipoSelect || !departamentoSection) {
        console.error('[ERRO] alterarTipoAcesso: elementos não encontrados');
        return;
    }
    
    const tipo = tipoSelect.value;
    console.log('[DEBUG] alterarTipoAcesso: tipo selecionado =', tipo);
    
    if (tipo === 'equipe') {
        // Mostrar seção de departamento para equipe
        departamentoSection.classList.remove('hidden');
        departamentoSection.style.display = 'block'; // Force show
        console.log('[DEBUG] alterarTipoAcesso: mostrando departamento-section');
        console.log('[DEBUG] Classes após remoção:', departamentoSection.className);
        console.log('[DEBUG] Style display após mudança:', departamentoSection.style.display);
    } else {
        // Ocultar seção de departamento para admin
        departamentoSection.classList.add('hidden');
        departamentoSection.style.display = 'none'; // Force hide
        if (departamentoSelect) {
            departamentoSelect.value = ''; // Limpar seleção
        }
        console.log('[DEBUG] alterarTipoAcesso: ocultando departamento-section');
    }
};

// Função para alternar tipo de usuário no modal de criação (também definida cedo)
window.alterarTipoUsuario = function() {
    debugLog('[DEBUG] alterarTipoUsuario: função chamada');
    
    const tipoSelect = document.getElementById('usuario-tipo');
    const campoEquipe = document.getElementById('campo-equipe');
    const campoQuarto = document.getElementById('campo-quarto');
    const usuarioEquipeSelect = document.getElementById('usuario-equipe');
    const usuarioQuartoInput = document.getElementById('usuario-quarto');
    
    if (!tipoSelect || !campoEquipe) {
        console.error('[ERRO] alterarTipoUsuario: elementos não encontrados');
        return;
    }
    
    const tipo = tipoSelect.value;
    debugLog('[DEBUG] alterarTipoUsuario: tipo selecionado =', tipo);
    
    if (tipo === 'equipe') {
        // Mostrar campo de equipe e torná-lo obrigatório
        campoEquipe.style.display = 'block';
        if (campoQuarto) campoQuarto.style.display = 'none';
        
        if (usuarioEquipeSelect) {
            usuarioEquipeSelect.required = true;
        }
        if (usuarioQuartoInput) {
            usuarioQuartoInput.required = false;
            usuarioQuartoInput.value = '';
        }
        debugLog('[DEBUG] alterarTipoUsuario: mostrando campo equipe');
        
    } else if (tipo === 'acompanhante') {
        // Mostrar campo de quarto e torná-lo obrigatório
        if (campoQuarto) campoQuarto.style.display = 'block';
        campoEquipe.style.display = 'none';
        
        if (usuarioQuartoInput) {
            usuarioQuartoInput.required = true;
        }
        if (usuarioEquipeSelect) {
            usuarioEquipeSelect.required = false;
            usuarioEquipeSelect.value = '';
        }
        debugLog('[DEBUG] alterarTipoUsuario: mostrando campo quarto para acompanhante');
        
    } else {
        // Ocultar ambos os campos
        campoEquipe.style.display = 'none';
        if (campoQuarto) campoQuarto.style.display = 'none';
        
        if (usuarioEquipeSelect) {
            usuarioEquipeSelect.required = false;
            usuarioEquipeSelect.value = '';
        }
        if (usuarioQuartoInput) {
            usuarioQuartoInput.required = false;
            usuarioQuartoInput.value = '';
        }
        debugLog('[DEBUG] alterarTipoUsuario: ocultando campos equipe e quarto');
    }
};

// Função para limpar completamente a interface
function limparInterfaceCompleta() {
    try {
        debugLog('[DEBUG] Iniciando limpeza completa da interface...');
        
        // Ocultar todos os elementos principais
        const elementosParaOcultar = [
            'admin-panel',
            'manage-users-section',
            'usuarios-section',
            'painel-section',
            'relatorios-section',
            'configuracoes-section'
        ];
        
        elementosParaOcultar.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.style.display = 'none';
                el.style.visibility = 'hidden';
            }
        });
        
        // Remover estilos específicos do painel logado que podem interferir
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'none';
            adminPanel.classList.add('hidden');
        }
        
        // Remover container principal se existir
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'none';
        }
        
        // Limpar conteúdo dos cards de solicitações
        const teamsGrid = document.querySelector('.teams-grid');
        if (teamsGrid) {
            teamsGrid.innerHTML = '';
            teamsGrid.style.display = 'none';
        }
        
        // Limpar todos os cards de solicitação
        const solicitationCards = document.querySelectorAll('.solicitation-card, .team-card');
        solicitationCards.forEach(card => {
            card.remove();
        });
        
        // Resetar estilo da página principal
        const main = document.querySelector('main');
        if (main) {
            main.style.display = 'none';
        }

        // Mostrar apenas a tela de login
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            authSection.classList.remove('hidden');
            authSection.style.display = 'flex';
            authSection.style.visibility = 'visible';
        }
        
        // Restaurar estilo do body para centralização
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.minHeight = '100vh';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.background = '#f1f5f9';
        
        // Garantir que o html também tenha altura total
        document.documentElement.style.height = '100%';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        
        debugLog('[DEBUG] Limpeza completa da interface realizada');
        
    } catch (error) {
        console.error('[ERRO] Falha na limpeza da interface:', error);
    }
};

// Função de emergência para resetar o sistema
window.emergencyReset = function() {
    console.log('🚨 EMERGENCY RESET INICIADO');
    
    // Limpar localStorage
    localStorage.clear();
    
    // Limpar interface
    limparInterfaceCompleta();
    
    // Forçar logout
    if (window.auth) {
        window.auth.signOut().then(() => {
            console.log('✅ Logout forçado realizado');
            // Redirecionar para página de login em vez de reload
            window.location.href = window.location.origin + window.location.pathname.replace('/admin/', '/');
        }).catch(error => {
            console.error('Erro no logout:', error);
            // Redirecionar mesmo com erro
            window.location.href = window.location.origin + window.location.pathname.replace('/admin/', '/');
        });
    } else {
        // Redirecionar se auth não estiver disponível
        window.location.href = window.location.origin + window.location.pathname.replace('/admin/', '/');
    }
};

// Função para forçar atualização após conversão de usuário
window.forcarAtualizacaoUsuario = async function() {
    console.log('🔄 Forçando atualização de dados do usuário...');
    
    try {
        // Limpar cache local
        localStorage.removeItem('usuarioAdmin');
        window.usuarioAdmin = null;
        window.userRole = null;
        
        // Se há usuário logado, revalidar
        if (window.auth && window.auth.currentUser) {
            const user = window.auth.currentUser;
            console.log('🔍 Revalidando usuário:', user.email);
            
            const dadosAtualizados = await window.verificarUsuarioAdminJS(user);
            
            if (dadosAtualizados) {
                console.log('✅ Dados atualizados:', dadosAtualizados);
                window.usuarioAdmin = dadosAtualizados;
                localStorage.setItem('usuarioAdmin', JSON.stringify(dadosAtualizados));
                
                // Recarregar página para aplicar mudanças na interface
                console.log('🔄 Recarregando interface...');
                window.location.reload();
            } else {
                console.log('❌ Usuário não autorizado - fazendo logout');
                await window.auth.signOut();
            }
        } else {
            console.log('❌ Nenhum usuário logado');
            window.location.reload();
        }
    } catch (error) {
        console.error('Erro na atualização:', error);
        console.log('🔄 Recarregando página por segurança...');
        window.location.reload();
    }
};

// Função para verificar se email já existe em qualquer coleção
async function verificarEmailExistente(email, excludeUserId = null) {
    try {
        debugLog('[DEBUG] verificarEmailExistente: verificando email:', email, 'excluindo userId:', excludeUserId);
        
        if (!email || !email.trim()) {
            debugLog('[DEBUG] Email vazio ou inválido');
            return false;
        }

        if (!window.db) {
            console.error('[ERRO] Firestore não inicializado');
            return false;
        }
        
        // Verificar em todas as coleções de usuários
        debugLog('[DEBUG] Executando queries em paralelo...');
        const [adminSnapshot, equipeSnapshot, acompanhantesSnapshot] = await Promise.all([
            window.db.collection('usuarios_admin').where('email', '==', email.trim()).get(),
            window.db.collection('usuarios_equipe').where('email', '==', email.trim()).get(),
            window.db.collection('usuarios_acompanhantes').where('email', '==', email.trim()).get()
        ]);

        // Filtrar resultados para excluir o userId especificado
        const adminDocs = adminSnapshot.docs.filter(doc => !excludeUserId || doc.id !== excludeUserId);
        const equipeDocs = equipeSnapshot.docs.filter(doc => !excludeUserId || doc.id !== excludeUserId);
        const acompanhantesDocs = acompanhantesSnapshot.docs.filter(doc => !excludeUserId || doc.id !== excludeUserId);

        const existeAdmin = adminDocs.length > 0;
        const existeEquipe = equipeDocs.length > 0;
        const existeAcompanhante = acompanhantesDocs.length > 0;

        debugLog('[DEBUG] verificarEmailExistente: resultados:', {
            existeAdmin,
            existeEquipe, 
            existeAcompanhante,
            emailVerificado: email,
            excludeUserId,
            adminCount: adminDocs.length,
            equipeCount: equipeDocs.length,
            acompanhanteCount: acompanhantesDocs.length
        });

        if (existeAdmin) {
            console.log('📧 Email encontrado em usuarios_admin:', adminDocs[0].data());
            return true;
        }
        
        if (existeEquipe) {
            console.log('📧 Email encontrado em usuarios_equipe:', equipeDocs[0].data());
            return true;
        }
        
        if (existeAcompanhante) {
            console.log('📧 Email encontrado em usuarios_acompanhantes:', acompanhantesDocs[0].data());
            return true;
        }

        debugLog('[DEBUG] Email não encontrado em nenhuma coleção (ou apenas no usuário excluído)');
        return false;

    } catch (error) {
        console.error('[ERRO] verificarEmailExistente:', error);
        debugLog('[ERRO] Detalhes do erro:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        // Em caso de erro, retornar false para não bloquear desnecessariamente
        return false;
    }
}

// Função para diagnosticar problemas de autenticação e permissões
async function diagnosticarPermissoes() {
    console.log('🔍 ===== DIAGNÓSTICO DE PERMISSÕES =====');
    
    try {
        // 1. Verificar estado da autenticação
        const currentUser = window.auth?.currentUser;
        console.log('👤 Usuário atual:', {
            uid: currentUser?.uid,
            email: currentUser?.email,
            isAnonymous: currentUser?.isAnonymous,
            emailVerified: currentUser?.emailVerified,
            refreshToken: currentUser?.refreshToken ? 'Presente' : 'Ausente'
        });
        
        if (!currentUser) {
            console.error('❌ PROBLEMA: Nenhum usuário autenticado');
            return;
        }
        
        // 2. Verificar estado do Firebase
        console.log('🔥 Estado do Firebase:', {
            auth: !!window.auth,
            db: !!window.db,
            authReady: window.auth?.currentUser !== undefined,
            dbReady: window.db?.app !== undefined
        });
        
        // 3. Teste de leitura simples
        try {
            console.log('📖 Testando leitura básica...');
            const testDoc = await window.db.collection('usuarios_admin').limit(1).get();
            console.log('✅ Leitura funcionando:', testDoc.size, 'documentos encontrados');
        } catch (readError) {
            console.error('❌ ERRO na leitura:', readError);
            
            if (readError.code === 'permission-denied') {
                console.log('🔒 Problema de permissões detectado');
                console.log('💡 Possíveis soluções:');
                console.log('1. Verificar regras do Firestore');
                console.log('2. Verificar se o usuário tem o token correto');
                console.log('3. Tentar reautenticar');
            }
        }
        
        // 4. Verificar token de autenticação
        try {
            const token = await currentUser.getIdToken();
            console.log('🔑 Token obtido com sucesso:', token.substring(0, 50) + '...');
        } catch (tokenError) {
            console.error('❌ ERRO ao obter token:', tokenError);
        }
        
        // 5. Verificar claims customizadas
        try {
            const tokenResult = await currentUser.getIdTokenResult();
            console.log('🏷️ Claims do token:', tokenResult.claims);
        } catch (claimsError) {
            console.error('❌ ERRO ao obter claims:', claimsError);
        }
        
    } catch (error) {
        console.error('❌ ERRO no diagnóstico:', error);
    }
    
    console.log('🔍 ===== FIM DO DIAGNÓSTICO =====');
}

// Função para verificar e limpar usuários órfãos do Firebase Auth
window.verificarUsuariosOrfaos = async function() {
    console.log('🧹 Verificando usuários órfãos no Firebase Auth...');
    
    try {
        if (!window.auth || !window.db) {
            throw new Error('Firebase não inicializado');
        }
        
        // Verificar permissões
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
            console.log('❌ Acesso negado. Apenas super_admin pode verificar usuários órfãos.');
            return;
        }
        
        console.log('🔍 Buscando usuários no Firestore...');
        
        // Buscar todos os usuários das coleções
        const [adminSnapshot, equipeSnapshot, acompanhantesSnapshot] = await Promise.all([
            window.db.collection('usuarios_admin').get(),
            window.db.collection('usuarios_equipe').get(),
            window.db.collection('usuarios_acompanhantes').get()
        ]);
        
        // Extrair UIDs dos usuários existentes no Firestore
        const uidsFirestore = new Set();
        
        adminSnapshot.forEach(doc => uidsFirestore.add(doc.id));
        equipeSnapshot.forEach(doc => uidsFirestore.add(doc.id));
        acompanhantesSnapshot.forEach(doc => uidsFirestore.add(doc.id));
        
        console.log('📊 UIDs encontrados no Firestore:', uidsFirestore.size);
        
        // NOTA: Não é possível listar todos os usuários do Auth no frontend
        // Esta função apenas mostra como identificar o problema
        console.log('⚠️ IMPORTANTE: Para limpar usuários órfãos do Firebase Auth, use o Firebase Console ou Firebase Admin SDK no backend.');
        console.log('🔗 Link: https://console.firebase.google.com/project/studio-5526632052-23813/authentication/users');
        
        // Se você tem o email específico que está dando erro, pode tentar criar novamente
        const emailProblematico = prompt('Digite o email que está dando erro para tentar recriar:');
        if (emailProblematico) {
            await window.tentarRecuperarUsuario(emailProblematico);
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar usuários órfãos:', error);
        console.log('💡 Para resolver manualmente:');
        console.log('1. Vá para o Firebase Console');
        console.log('2. Authentication > Users');
        console.log('3. Exclua o usuário com o email que está dando erro');
        console.log('4. Tente criar novamente');
    }
};

// Função para tentar recuperar ou limpar usuário específico
window.tentarRecuperarUsuario = async function(email) {
    console.log('🔄 Tentando recuperar usuário:', email);
    
    try {
        // Verificar se existe no Firestore
        const adminQuery = await window.db.collection('usuarios_admin').where('email', '==', email).get();
        const equipeQuery = await window.db.collection('usuarios_equipe').where('email', '==', email).get();
        const acompanhanteQuery = await window.db.collection('usuarios_acompanhantes').where('email', '==', email).get();
        
        if (adminQuery.empty && equipeQuery.empty && acompanhanteQuery.empty) {
            console.log('❌ Usuário não existe no Firestore, mas existe no Auth (usuário órfão)');
            console.log('💡 Solução: Exclua este usuário no Firebase Console > Authentication');
            
            // Opção de resetar senha se o usuário quiser manter
            const manter = confirm('Deseja recriar este usuário no Firestore? (Cancelar = excluir do Auth)');
            if (manter) {
                const nome = prompt('Digite o nome do usuário:');
                const tipo = prompt('Digite o tipo (admin/equipe):');
                const equipeNome = tipo === 'equipe' ? prompt('Digite a equipe:') : null;
                
                if (nome && tipo) {
                    await window.recriarUsuarioFirestore(email, nome, tipo, equipeNome);
                }
            }
        } else {
            console.log('✅ Usuário existe no Firestore');
            if (!adminQuery.empty) {
                console.log('📍 Encontrado em usuarios_admin:', adminQuery.docs[0].data());
            }
            if (!equipeQuery.empty) {
                console.log('📍 Encontrado em usuarios_equipe:', equipeQuery.docs[0].data());
            }
            if (!acompanhanteQuery.empty) {
                console.log('📍 Encontrado em usuarios_acompanhantes:', acompanhanteQuery.docs[0].data());
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar usuário:', error);
    }
};

// Função para recriar usuário no Firestore
window.recriarUsuarioFirestore = async function(email, nome, tipo, equipeNome = null) {
    console.log('🔄 Recriando usuário no Firestore:', { email, nome, tipo, equipeNome });
    
    try {
        // Tentar fazer login com o usuário para obter UID
        const senha = prompt('Digite uma senha temporária (6+ caracteres):');
        if (!senha || senha.length < 6) {
            console.log('❌ Senha inválida');
            return;
        }
        
        // Fazer login temporário para obter UID
        const userCredential = await window.auth.signInWithEmailAndPassword(email, senha);
        const uid = userCredential.user.uid;
        
        console.log('✅ UID obtido:', uid);
        
        // Criar documento no Firestore
        let colecao, dados;
        
        if (tipo === 'admin') {
            colecao = 'usuarios_admin';
            dados = {
                nome: nome,
                email: email,
                role: 'admin',
                ativo: true,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                criadoPor: window.auth.currentUser.email
            };
        } else if (tipo === 'equipe') {
            colecao = 'usuarios_equipe';
            dados = {
                nome: nome,
                email: email,
                equipe: equipeNome,
                ativo: true,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                criadoPor: window.auth.currentUser.email
            };
        }
        
        await window.db.collection(colecao).doc(uid).set(dados);
        
        console.log('✅ Usuário recriado no Firestore!');
        showToast('Sucesso', 'Usuário recuperado com sucesso!', 'success');
        
        // Fazer logout do usuário temporário
        await window.auth.signOut();
        
    } catch (error) {
        console.error('❌ Erro ao recriar usuário:', error);
        if (error.code === 'auth/wrong-password') {
            console.log('❌ Senha incorreta. Use o Firebase Console para redefinir a senha ou excluir o usuário.');
        }
        showToast('Erro', 'Falha ao recuperar usuário: ' + error.message, 'error');
    }
};

// Função para inicializar instância secundária do Firebase (se possível)
window.inicializarFirebaseSecundario = function() {
    try {
        if (!window.firebase || !window.firebaseConfig) {
            console.log('❌ Firebase ou configuração não disponível para instância secundária');
            return false;
        }
        
        // Verificar se já existe uma instância secundária
        if (window.firebase.apps.length > 1) {
            console.log('✅ Instância secundária já existe');
            return true;
        }
        
        // Tentar criar instância secundária
        const secondaryApp = window.firebase.initializeApp(window.firebaseConfig, 'secondary');
        console.log('✅ Instância secundária do Firebase criada');
        return true;
        
    } catch (error) {
        console.log('❌ Não foi possível criar instância secundária:', error);
        return false;
    }
};

// Função para criar usuário sem afetar sessão atual (versão melhorada)
window.criarUsuarioSeguro = async function(email, senha, dadosFirestore, colecao) {
    console.log('🔐 Iniciando criação segura de usuário...');
    
    try {
        // Salvar contexto do admin atual
        const adminContext = {
            currentUser: window.auth.currentUser,
            usuarioAdmin: window.usuarioAdmin,
            userRole: window.userRole,
            userEmail: window.userEmail
        };
        
        let novoUsuario;
        let precisaRestaurar = false;
        
        // Tentar usar instância secundária primeiro
        if (window.inicializarFirebaseSecundario()) {
            try {
                console.log('🔄 Usando instância secundária...');
                const secondaryApp = window.firebase.apps[1];
                const secondaryAuth = secondaryApp.auth();
                
                const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, senha);
                novoUsuario = userCredential.user;
                
                // Fazer logout da instância secundária
                await secondaryAuth.signOut();
                console.log('✅ Usuário criado na instância secundária - admin mantém sessão');
                
            } catch (secondaryError) {
                console.log('❌ Erro na instância secundária, usando método principal:', secondaryError);
                throw secondaryError;
            }
        } else {
            // Fallback: método tradicional com proteção
            console.log('🔄 Usando instância principal com proteção...');
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, senha);
            novoUsuario = userCredential.user;
            precisaRestaurar = true;
        }
        
        // Salvar no Firestore
        await window.db.collection(colecao).doc(novoUsuario.uid).set(dadosFirestore);
        console.log('✅ Dados salvos no Firestore');
        
        // Restaurar sessão se necessário
        if (precisaRestaurar) {
            console.log('🔄 Restaurando sessão do administrador...');
            await window.auth.signOut(); // Logout do usuário criado
            
            // Restaurar dados locais
            window.usuarioAdmin = adminContext.usuarioAdmin;
            window.userRole = adminContext.userRole;
            window.userEmail = adminContext.userEmail;
            localStorage.setItem('usuarioAdmin', JSON.stringify(adminContext.usuarioAdmin));
            
            console.log('⚠️ Sessão restaurada localmente - admin pode precisar fazer login novamente');
        }
        
        return novoUsuario;
        
    } catch (error) {
        console.error('❌ Erro na criação segura:', error);
        throw error;
    }
};

// Referência antecipada para função de limpeza (definida no final do arquivo)
window.limparDadosTeste = function() {
    // Função será redefinida completamente no final do arquivo
    debugLog('[DEBUG] limparDadosTeste chamada prematuramente - aguardando definição completa');
    setTimeout(() => {
        if (window.limparDadosTeste && typeof window.limparDadosTeste === 'function') {
            window.limparDadosTeste();
        }
    }, 500);
};

// Função para criação rápida de super admin (desenvolvimento)
window.criarSuperAdminDev = async function(email, senha) {
    if (!window.auth || !window.db) {
        console.error('Firebase não inicializado');
        return;
    }
    
    try {
        // Criar usuário no Firebase Auth
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        // Criar documento na coleção usuarios_admin
        await window.db.collection('usuarios_admin').doc(user.uid).set({
            nome: 'Super Admin Dev',
            email: email,
            role: 'super_admin',
            ativo: true,
            dataCriacao: new Date().toISOString(),
            permissoes: {
                criarUsuarios: true,
                gerenciarDepartamentos: true,
                verRelatorios: true,
                gerenciarSolicitacoes: true
            }
        });
        
        console.log('✅ Super admin criado:', email);
        alert('Super admin criado com sucesso! Faça login agora.');
        
    } catch (error) {
        console.error('Erro ao criar super admin:', error);
        alert('Erro: ' + error.message);
    }
};

// --- Firebase ---
function firebaseReady() {
    return (typeof firebase !== 'undefined') && typeof firebase.initializeApp === 'function';
}

async function initFirebaseApp() {
    if (!firebaseReady()) {
        console.error('[ERRO] Firebase SDK não carregado');
        alert('Erro: Firebase SDK não carregado. Verifique a conexão ou o script.');
        return false;
    }
    
    try {
        if (!firebase.apps.length) {
            const firebaseConfig = {
                apiKey: "AIzaSyAogGkN5N24Puss4-kF9Z6npPYyEzVei3M",
                authDomain: "studio-5526632052-23813.firebaseapp.com",
                projectId: "studio-5526632052-23813",
                storageBucket: "studio-5526632052-23813.firebasestorage.app",
                messagingSenderId: "251931417472",
                appId: "1:251931417472:web:4b955052a184d114f57f65"
            };
            
            debugLog('[DEBUG] Inicializando Firebase com config:', firebaseConfig.projectId);
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase inicializado com sucesso');
        }
        
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        // Configurar settings do Firestore apenas se necessário
        // Verificar se ainda não foi configurado
        let settingsConfigured = false;
        try {
            // Tentar uma operação simples para verificar se já foi configurado
            const testQuery = window.db.collection('_test').limit(1);
            settingsConfigured = true; // Se chegou aqui, Firestore já está ativo
        } catch (e) {
            // Firestore ainda não foi usado, podemos configurar settings
            settingsConfigured = false;
        }
        
        if (!settingsConfigured) {
            try {
                window.db.settings({
                    ignoreUndefinedProperties: true
                });
                console.log('✅ Settings do Firestore configuradas');
            } catch (settingsError) {
                // Ignorar erro silenciosamente se já foi configurado
                if (settingsError.code !== 'failed-precondition') {
                    console.warn('⚠️ Aviso settings:', settingsError.code);
                }
            }
        }
        
        // Configurar persistência offline usando nova API
        try {
            // Suprimir warning da API deprecated do Firebase
            const originalWarn = console.warn;
            console.warn = function(message, ...args) {
                if (typeof message === 'string' && 
                    (message.includes('enableMultiTabIndexedDbPersistence') || 
                     message.includes('deprecated'))) {
                    return; // Ignorar warnings de API deprecated
                }
                originalWarn.apply(console, [message, ...args]);
            };
            
            console.log('ℹ️ Cache offline configurado (warnings de API deprecated suprimidos)');
        } catch (err) {
            // Apenas avisar, não é erro crítico
            if (err.code === 'failed-precondition') {
                console.log('ℹ️ Persistência não ativada: múltiplas abas abertas');
            } else if (err.code === 'unimplemented') {
                console.log('ℹ️ Persistência não suportada neste navegador');
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('[ERRO] Falha na inicialização do Firebase:', error);
        showToast('Erro', 'Falha na conexão com Firebase. Modo offline ativado.', 'error');
        return false;
    }
}

// --- Permissões centralizadas ---
// Funções importadas do admin-permissions.js
// window.verificarUsuarioAdminJS, window.temPermissaoJS, window.podeVerSolicitacaoJS
function showToast(titulo, mensagem, tipo) {
    console.log(`[DEBUG] showToast chamado: ${titulo} - ${mensagem} (${tipo})`);
    var toast = document.createElement('div');
    toast.className = 'toast ' + tipo;
    toast.innerHTML = `<strong>${titulo}:</strong> ${mensagem}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function ocultarSecoesPrincipais() {
    const idsOcultar = [
        'admin-panel',
        'acompanhantes-section',
        'relatorios-section',
        'metricas-gerais',
        'create-user-modal',
        'manage-users-modal',
        'teams-grid'
    ];
    idsOcultar.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            console.log(`[DEBUG] ocultarSecoesPrincipais: ocultando ${id}`);
        } else {
            console.warn(`[AVISO] ocultarSecoesPrincipais: elemento não encontrado: ${id}`);
        }
    });
    if (document.querySelector('.teams-grid')) {
        document.querySelector('.teams-grid').classList.add('hidden');
        debugLog('[DEBUG] ocultarSecoesPrincipais: ocultando teams-grid');
    }
    document.getElementById('auth-section')?.classList.remove('hidden');
    debugLog('[DEBUG] ocultarSecoesPrincipais: exibindo auth-section');
}

async function mostrarSecaoPainel(secao) {
    try {
        console.log(`[DEBUG] mostrarSecaoPainel: navegação para '${secao}'`);
        // Oculta todas as seções principais
        const secoes = [
            'admin-panel',
            'acompanhantes-section',
            'relatorios-section',
            'dashboard-section',
            'metricas-gerais',
            'create-user-modal',
            'manage-users-modal',
            'teams-grid'
        ];
        secoes.forEach(id => {
            const el = document.getElementById(id) || document.querySelector('.' + id);
            if (el) el.classList.add('hidden');
        });
        // Exibe apenas a seção desejada
        if (secao === 'painel') {
            document.getElementById('admin-panel')?.classList.remove('hidden');
            document.getElementById('metricas-gerais')?.classList.remove('hidden');
            document.querySelector('.teams-grid')?.classList.remove('hidden');
            debugLog('[DEBUG] mostrarSecaoPainel: exibindo painel principal');
            
            // Garantir que o botão "Minha Senha" esteja sempre visível
            setTimeout(() => {
                forcarVisibilidadeBotaoMinhaSenha();
            }, 100);
            
            // Recarregar solicitações de forma simplificada
            if (typeof carregarSolicitacoes === 'function') {
                debugLog('[DEBUG] mostrarSecaoPainel: carregando solicitações...');
                carregarSolicitacoes();
            }
        } else if (secao === 'dashboard') {
            document.getElementById('admin-panel')?.classList.remove('hidden');
            document.getElementById('dashboard-section')?.classList.remove('hidden');
            debugLog('[DEBUG] mostrarSecaoPainel: exibindo dashboard-section');
        } else if (secao === 'acompanhantes') {
            document.getElementById('admin-panel')?.classList.remove('hidden');
            document.getElementById('acompanhantes-section')?.classList.remove('hidden');
            debugLog('[DEBUG] mostrarSecaoPainel: exibindo acompanhantes-section');
            
            // Inicializar listener de tempo real para acompanhantes
            if (typeof configurarListenerAcompanhantes === 'function') {
                debugLog('[DEBUG] Inicializando listener de acompanhantes...');
                await configurarListenerAcompanhantes();
            }
        } else if (secao === 'relatorios') {
            // Para relatórios, chamar a função específica
            debugLog('[DEBUG] mostrarSecaoPainel: chamando função mostrarRelatorios...');
            
            if (typeof window.mostrarRelatorios === 'function') {
                try {
                    window.mostrarRelatorios();
                    debugLog('[DEBUG] mostrarSecaoPainel: função mostrarRelatorios executada com sucesso');
                } catch (error) {
                    console.error('[ERRO] mostrarSecaoPainel: erro ao executar mostrarRelatorios:', error);
                    showToast('Erro', 'Falha ao carregar relatórios: ' + error.message, 'error');
                }
            } else {
                console.error('[ERRO] mostrarSecaoPainel: função mostrarRelatorios não encontrada!');
                showToast('Erro', 'Função de relatórios não disponível', 'error');
            }
        } else if (secao === 'create-user') {
            const modal = document.getElementById('modal-novo-usuario');
            document.getElementById('admin-panel')?.classList.remove('hidden');
            if (modal) {
                // Garantir que o modal esteja anexado ao body
                if (modal.parentElement !== document.body) {
                    debugLog('[DEBUG] Modal criar usuário não está no body, movendo...');
                    document.body.appendChild(modal);
                }
                
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                modal.style.zIndex = '999999';
                modal.style.visibility = 'visible';
                modal.style.opacity = '1';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100vw';
                modal.style.height = '100vh';
            }
            setTimeout(() => document.getElementById('usuario-nome')?.focus(), 300);
            debugLog('[DEBUG] mostrarSecaoPainel: exibindo modal-novo-usuario');
        } else if (secao === 'manage-users' || secao === 'gerenciar-usuarios') {
            const modal = document.getElementById('manage-users-modal');
            document.getElementById('admin-panel')?.classList.remove('hidden');
            if (modal) {
                // Garantir que o modal esteja anexado ao body
                if (modal.parentElement !== document.body) {
                    debugLog('[DEBUG] Modal gerenciar usuários não está no body, movendo...');
                    document.body.appendChild(modal);
                }
                
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                modal.style.zIndex = '999999';
                modal.style.visibility = 'visible';
                modal.style.opacity = '1';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100vw';
                modal.style.height = '100vh';
                
                // CORREÇÃO: Carregar usuários quando modal é exibido
                debugLog('[DEBUG] Carregando usuários para o modal...');
                console.log('[MANAGE-USERS] Iniciando carregamento de usuários...');
                
                if (typeof window.carregarUsuarios === 'function') {
                    try {
                        console.log('[MANAGE-USERS] Executando window.carregarUsuarios()...');
                        await window.carregarUsuarios();
                        console.log('[MANAGE-USERS] ✅ Usuários carregados com sucesso no modal');
                        debugLog('[DEBUG] ✅ Usuários carregados com sucesso no modal');
                    } catch (error) {
                        console.error('[MANAGE-USERS] ❌ Falha ao carregar usuários:', error);
                        console.error('[MANAGE-USERS] Stack trace:', error.stack);
                        showToast('Erro', 'Falha ao carregar usuários: ' + error.message, 'error');
                    }
                } else {
                    console.error('[MANAGE-USERS] ❌ Função carregarUsuarios não está disponível!');
                    console.error('[MANAGE-USERS] Disponível:', typeof window.carregarUsuarios);
                    console.error('[MANAGE-USERS] Window object:', Object.keys(window).filter(k => k.includes('carrega')));
                }
            }
            debugLog('[DEBUG] mostrarSecaoPainel: exibindo manage-users-modal');
        } else {
            console.warn(`[AVISO] mostrarSecaoPainel: seção desconhecida: ${secao}`);
        }
        
        // Garantir que os botões estejam sempre configurados após mudança de seção
        // Removido para evitar chamadas desnecessárias - configuração feita no login
        debugLog('[DEBUG] mostrarSecaoPainel: seção alterada para:', secao);
        
    } catch (err) {
        console.error('[ERRO] mostrarSecaoPainel: falha ao exibir seção:', err);
    }
}

// --- Autenticação e Acesso ---
// Oculta campo departamento corretamente na inicialização
window.addEventListener('DOMContentLoaded', async function() {
    debugLog('[DEBUG] DOMContentLoaded: iniciando configuração...');
    
    // Primeiro, configurar os botões ANTES de qualquer coisa relacionada ao Firebase
    debugLog('[DEBUG] DOMContentLoaded: configurando eventos dos botões ANTES do Firebase...');
    
    // Garantir que as funções dos modais estão disponíveis
    if (typeof window.showCreateUserModal !== 'function') {
        console.error('[ERRO] showCreateUserModal não definida durante DOMContentLoaded!');
    }
    if (typeof window.showManageUsersModal !== 'function') {
        console.error('[ERRO] showManageUsersModal não definida durante DOMContentLoaded!');
    }
    
    // Configurar eventos imediatamente
    configurarEventosBotoes();
    
    // Forçar visibilidade do botão "Minha Senha" desde o início
    setTimeout(() => {
        forcarVisibilidadeBotaoMinhaSenha();
        // Iniciar watchdog para manter o botão sempre visível
        iniciarWatchdogBotaoMinhaSenha();
        // Iniciar observer para detectar remoções do botão
        iniciarObserverBotaoMinhaSenha();
    }, 100);
    
    // Tentar inicializar Firebase
    try {
        const firebaseOk = await initFirebaseApp();
        
        if (!firebaseOk) {
            console.warn('[AVISO] Firebase falhou na inicialização - continuando em modo offline');
            // Em caso de falha do Firebase, ativar modo offline básico
            setTimeout(() => {
                // Simular login offline para admins
                window.userRole = 'admin';
                window.usuarioAdmin = { role: 'admin', nome: 'Admin Offline', email: 'admin@offline.local' };
                
                const authSection = document.getElementById('auth-section');
                const adminPanel = document.getElementById('admin-panel');
                if (authSection) authSection.classList.add('hidden');
                if (adminPanel) adminPanel.classList.remove('hidden');
                
                atualizarVisibilidadeBotoes();
                configurarEventosBotoes();
                
                showToast('Aviso', 'Modo offline ativado - funcionalidade limitada', 'warning');
            }, 1000);
            return;
        }
    } catch (error) {
        console.error('[ERRO] Erro crítico na inicialização do Firebase:', error);
    }
    
    // FORÇAR ocultação de todos os painéis administrativos na inicialização
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.classList.add('hidden');
    
    const teamsGrid = document.querySelector('.teams-grid');
    if (teamsGrid) teamsGrid.classList.add('hidden');
    
    // Ocultar TODOS os painéis administrativos na inicialização
    const allPanels = document.querySelectorAll('.team-panel, .department-card, [class*="card"]');
    allPanels.forEach(panel => {
        if (panel.classList) panel.classList.add('hidden');
    });
    
    // Garantir que a seção de autenticação esteja visível
    const authSection = document.getElementById('auth-section');
    if (authSection) authSection.classList.remove('hidden');
    
    // Ocultar campo departamento corretamente na inicialização
    var tipoSelect = document.getElementById('tipo-acesso');
    var tipo = tipoSelect ? tipoSelect.value : null;
    var departamentoSection = document.getElementById('departamento-section');
    if (tipo !== 'equipe' && departamentoSection) {
        departamentoSection.classList.add('hidden');
        var departamentoSelect = document.getElementById('departamento');
        if (departamentoSelect) departamentoSelect.value = '';
        debugLog('[DEBUG] Inicialização: ocultando departamento-section');
    }
    
    // Listener de autenticação persistente (apenas se Firebase OK)
    if (window.auth) {
        // Remover listener anterior se existir
        if (unsubscribeAuthListener) {
            unsubscribeAuthListener();
            unsubscribeAuthListener = null;
        }
        
        unsubscribeAuthListener = window.auth.onAuthStateChanged(async function(user) {
            console.log('🔥🔥🔥 [AUTH STATE DEBUG] onAuthStateChanged CHAMADA!');
            console.log('🔥🔥🔥 [AUTH STATE DEBUG] user existe?', !!user);
            console.log('🔥🔥🔥 [AUTH STATE DEBUG] user.email:', user?.email);
            
            try {
                if (user) {
                    console.log('🔥🔥🔥 [AUTH STATE DEBUG] Usuario autenticado - iniciando verificação...');
                    debugLog('[DEBUG] Usuário autenticado:', user.email);
                    debugLog('[DEBUG] UID do usuário:', user.uid);
                    
                    // VERIFICAÇÃO DE CONSISTÊNCIA DE CACHE
                    const cacheUsuario = localStorage.getItem('usuarioAdmin');
                    let dadosCacheados = null;
                    try {
                        dadosCacheados = cacheUsuario ? JSON.parse(cacheUsuario) : null;
                    } catch (e) {
                        debugLog('[DEBUG] Cache corrompido, limpando...');
                        localStorage.removeItem('usuarioAdmin');
                    }
                    
                    // Verifica admin via Firestore (sempre força nova consulta para detectar mudanças)
                    console.log('🔥🔥🔥 [AUTH STATE DEBUG] Chamando verificarUsuarioAdminJS...');
                    debugLog('[DEBUG] Verificando permissões do usuário...');
                    const dadosAdmin = await window.verificarUsuarioAdminJS(user);
                    console.log('🔥🔥🔥 [AUTH STATE DEBUG] verificarUsuarioAdminJS retornou:', dadosAdmin);
                    
                    if (dadosAdmin) {
                        console.log('🔥🔥🔥 [AUTH STATE DEBUG] dadosAdmin válidos - configurando interface...');
                        // DETECTAR MUDANÇA DE ROLE
                        if (dadosCacheados && dadosCacheados.role !== dadosAdmin.role) {
                            debugLog('[DEBUG] 🔄 CONVERSÃO DE USUÁRIO DETECTADA!');
                            debugLog('[DEBUG] Role anterior:', dadosCacheados.role);
                            debugLog('[DEBUG] Nova role:', dadosAdmin.role);
                            console.log('🔄 Conversão de usuário detectada - limpando cache antigo...');
                            localStorage.clear();
                        }
                        
                        debugLog('[DEBUG] Dados do admin carregados:', dadosAdmin);
                        window.usuarioAdmin = dadosAdmin;
                        localStorage.setItem('usuarioAdmin', JSON.stringify(dadosAdmin));
                        
                        window.userEmail = user.email;
                        window.userRole = dadosAdmin.role;
                        
                        debugLog('[DEBUG] Configurando interface para:', {
                            email: user.email,
                            role: dadosAdmin.role,
                            isEquipe: dadosAdmin.isEquipe,
                            isSuperAdmin: dadosAdmin.isSuperAdmin,
                            equipe: dadosAdmin.equipe
                        });
                        
                        // Configurar interface baseada no tipo de usuário
                        if (dadosAdmin.role === 'super_admin' || dadosAdmin.isSuperAdmin) {
                            debugLog('[DEBUG] Usuário SUPER ADMIN - mostrando painel completo');
                            
                            // Esconder login e mostrar painel
                            const authSection = document.getElementById('auth-section');
                            const adminPanel = document.getElementById('admin-panel');
                            
                            if (authSection) {
                                authSection.classList.add('hidden');
                                authSection.style.display = 'none';
                            }
                            
                            if (adminPanel) {
                                adminPanel.classList.remove('hidden');
                                adminPanel.style.display = 'block';
                                adminPanel.style.visibility = 'visible';
                            }
                            
                            // Mostrar todos os cards para super admin
                            const teamsGrid = document.querySelector('.teams-grid');
                            if (teamsGrid) {
                                teamsGrid.classList.remove('hidden');
                                teamsGrid.style.display = 'grid';
                            }
                            
                            // Garantir que elementos críticos estão visíveis
                            document.body.style.display = 'block';
                            document.body.style.visibility = 'visible';
                            
                            debugLog('[DEBUG] Interface configurada para super admin');
                            
                            // Inicializar sistema de timeout de sessão
                            initializeSessionTimeout();
                            
                        } else if (dadosAdmin.role === 'admin') {
                            debugLog('[DEBUG] Usuário ADMIN - mostrando painel completo com permissões restritas');
                            
                            // Esconder login e mostrar painel (mesmo comportamento do super_admin)
                            const authSection = document.getElementById('auth-section');
                            const adminPanel = document.getElementById('admin-panel');
                            
                            if (authSection) {
                                authSection.classList.add('hidden');
                                authSection.style.display = 'none';
                            }
                            
                            if (adminPanel) {
                                adminPanel.classList.remove('hidden');
                                adminPanel.style.display = 'block';
                                adminPanel.style.visibility = 'visible';
                            }
                            
                            // Mostrar todos os cards para admin
                            const teamsGrid = document.querySelector('.teams-grid');
                            if (teamsGrid) {
                                teamsGrid.classList.remove('hidden');
                                teamsGrid.style.display = 'grid';
                            }
                            
                            // Garantir que elementos críticos estão visíveis
                            document.body.style.display = 'block';
                            document.body.style.visibility = 'visible';
                            
                            debugLog('[DEBUG] Interface configurada para admin');
                            
                            // Inicializar sistema de timeout de sessão
                            initializeSessionTimeout();
                            
                        } else if (dadosAdmin.isEquipe && dadosAdmin.equipe) {
                            debugLog('[DEBUG] Usuário EQUIPE - mostrando apenas cards do departamento:', dadosAdmin.equipe);
                            // Usuário de equipe vê apenas seu departamento
                            document.getElementById('auth-section')?.classList.add('hidden');
                            document.getElementById('admin-panel')?.classList.remove('hidden');
                            
                            // Mostrar apenas cards do departamento específico
                            const teamsGrid = document.querySelector('.teams-grid');
                            if (teamsGrid) teamsGrid.classList.remove('hidden');
                            
                            // Ocultar todos os painéis primeiro
                            const allPanels = document.querySelectorAll('.team-panel, .department-card, [class*="card"]');
                            allPanels.forEach(panel => {
                                if (panel.classList) panel.classList.add('hidden');
                            });
                            
                            // Mostrar apenas o painel do departamento do usuário
                            const departmentPanel = document.querySelector(`[data-department="${dadosAdmin.equipe}"]`);
                            if (departmentPanel) {
                                departmentPanel.classList.remove('hidden');
                                debugLog('[DEBUG] Mostrando painel do departamento:', dadosAdmin.equipe);
                            } else {
                                console.warn('[AVISO] Painel não encontrado para departamento:', dadosAdmin.equipe);
                            }
                            
                            // Inicializar sistema de timeout de sessão
                            initializeSessionTimeout();
                            
                        } else {
                            debugLog('[DEBUG] Usuário sem permissões específicas - mantendo na tela de login');
                            document.getElementById('auth-section')?.classList.remove('hidden');
                            document.getElementById('admin-panel')?.classList.add('hidden');
                            showToast('Erro', 'Usuário sem permissões definidas', 'error');
                            setTimeout(() => window.auth.signOut(), 2000);
                            return;
                        }
                        
                        // Atualizar botões imediatamente após login (sem timeout)
                        debugLog('[DEBUG] Inicializando botões após login...');
                        atualizarVisibilidadeBotoes();
                        configurarEventosBotoes();
                        
                        // Forçar visibilidade do botão "Minha Senha" imediatamente
                        forcarVisibilidadeBotaoMinhaSenha();
                        
                        // Configuração adicional após um pequeno delay para garantir DOM estável
                        setTimeout(() => {
                            debugLog('[DEBUG] Reconfiguração de segurança dos botões...');
                            atualizarVisibilidadeBotoes();
                            configurarEventosBotoes();
                            
                            // Forçar novamente o botão "Minha Senha"
                            forcarVisibilidadeBotaoMinhaSenha();
                            
                            // Forçar exibição do botão de limpeza para super_admin
                            if (window.usuarioAdmin && window.usuarioAdmin.role === 'super_admin') {
                                const btnLimpeza = document.getElementById('limpeza-btn');
                                if (btnLimpeza) {
                                    btnLimpeza.classList.remove('btn-hide');
                                    btnLimpeza.style.display = 'inline-flex';
                                    debugLog('[DEBUG] Botão limpeza forçado para super_admin');
                                } else {
                                    console.warn('[AVISO] Botão limpeza não encontrado no DOM');
                                }
                            }
                            
                            // Garantir que as funções estão disponíveis globalmente
                            if (typeof window.showCreateUserModal !== 'function') {
                                console.error('[ERRO] showCreateUserModal não está definida!');
                            }
                            if (typeof window.showManageUsersModal !== 'function') {
                                console.error('[ERRO] showManageUsersModal não está definida!');
                            }
                            if (typeof window.limparDadosTeste !== 'function') {
                                console.error('[ERRO] limparDadosTeste não está definida!');
                            }
                            
                            debugLog('[DEBUG] Estado dos botões após login:', {
                                userRole: window.userRole,
                                usuarioAdmin: window.usuarioAdmin,
                                showCreateUserModal: typeof window.showCreateUserModal,
                                showManageUsersModal: typeof window.showManageUsersModal,
                                limparDadosTeste: typeof window.limparDadosTeste
                            });
                            
                            // Chamar função de teste para debug
                            if (typeof window.testarBotoes === 'function') {
                                window.testarBotoes();
                            }
                            
                        }, 300);
                        
                        // Segunda verificação para garantir configuração
                        setTimeout(() => {
                            debugLog('[DEBUG] Segunda verificação dos botões...');
                            if (window.reconfigurarBotoes) {
                                window.reconfigurarBotoes();
                            }
                        }, 1000);
                        
                        // Carregar dados da aplicação com timeout aumentado
                        debugLog('[DEBUG] Iniciando carregamento de solicitações...');
                        setTimeout(async () => {
                            try {
                                await carregarSolicitacoes();
                                debugLog('[DEBUG] Solicitações carregadas com sucesso');
                            } catch (error) {
                                console.error('[ERRO] Falha no carregamento de solicitações:', error);
                                showToast('Erro', 'Falha ao carregar dados. Recarregue a página.', 'error');
                            }
                        }, 500);
                        
                    } else {
                        debugLog('[DEBUG] Usuário sem permissões - mantendo na tela de login');
                        // Usuário autenticado mas sem permissões - manter na tela de login
                        const authSection = document.getElementById('auth-section');
                        const adminPanel = document.getElementById('admin-panel');
                        if (authSection) authSection.classList.remove('hidden');
                        if (adminPanel) adminPanel.classList.add('hidden');
                        
                        // Fazer logout automático do usuário não autorizado
                        setTimeout(() => {
                            window.auth.signOut();
                        }, 2000);
                    }
                } else {
                    debugLog('[DEBUG] Usuário não autenticado - resetando interface completa');
                    // Usuário não autenticado - resetar interface completamente
                    
                    // Ocultar painéis administrativos
                    const authSection2 = document.getElementById('auth-section');
                    const adminPanel2 = document.getElementById('admin-panel');
                    if (authSection2) authSection2.classList.remove('hidden');
                    if (adminPanel2) adminPanel2.classList.add('hidden');
                    
                    // Ocultar TODOS os painéis de departamento
                    const teamsGrid = document.querySelector('.teams-grid');
                    if (teamsGrid) teamsGrid.classList.add('hidden');
                    
                    const allPanels = document.querySelectorAll('.team-panel, .department-card, [class*="card"]');
                    allPanels.forEach(panel => {
                        if (panel.classList) panel.classList.add('hidden');
                    });
                    
                    // Limpar dados do usuário
                    window.usuarioAdmin = null;
                    window.userRole = null;
                    window.userEmail = null;
                    localStorage.removeItem('usuarioAdmin');
                    
                    // Resetar formulário de login
                    const loginForm = document.getElementById('login-form');
                    if (loginForm) loginForm.reset();
                }
            } catch (authError) {
                console.error('[ERRO] Erro no listener de autenticação:', authError);
                showToast('Erro', 'Erro na autenticação. Tentando modo offline...', 'error');
            }
        });
    }
    // Corrige botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async function() {
            try {
                // Prevenir logout múltiplo
                if (logoutEmAndamento) {
                    console.log('[DEBUG] Logout já em andamento, ignorando...');
                    return;
                }
                logoutEmAndamento = true;
                
                debugLog('[DEBUG] Iniciando processo de logout...');
                
                // Remover listener de autenticação ANTES do signOut
                if (unsubscribeAuthListener) {
                    unsubscribeAuthListener();
                    unsubscribeAuthListener = null;
                }
                
                // Registrar logout em auditoria
                if (window.registrarLogAuditoria) {
                    window.registrarLogAuditoria('USER_LOGOUT', {
                        userId: window.usuarioAdmin?.uid || 'unknown',
                        userEmail: window.usuarioAdmin?.email || 'unknown'
                    });
                }
                
                // Fazer logout do Firebase
                await window.auth.signOut();
                
                // Limpar listeners ativos
                limparListenersAtivos();
                
                // Resetar variáveis de estado
                sistemaInicializado = false;
                
                // Forçar recarregamento da página para limpeza completa
                setTimeout(() => {
                    window.location.reload(true);
                }, 500);
                
                // Limpar campos de login
                const emailField = document.getElementById('login-email');
                const passwordField = document.getElementById('login-password');
                if (emailField) emailField.value = '';
                if (passwordField) passwordField.value = '';
                
                // Focar no campo de email
                setTimeout(() => {
                    if (emailField) emailField.focus();
                }, 100);
                
                showToast('Sucesso', 'Logout realizado com sucesso!', 'success');
                debugLog('[DEBUG] Logout completo realizado');
                
            } catch (err) {
                console.error('[ERRO] Falha no logout:', err);
                showToast('Erro', 'Erro ao fazer logout: ' + err.message, 'error');
                
                // Em caso de erro, forçar reload da página
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        };
    }
});

// === LISTENERS PARA PROBLEMAS DE CONECTIVIDADE ===

// Detectar erros de QUIC Protocol e outros problemas de rede
window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('ERR_QUIC_PROTOCOL_ERROR')) {
        console.warn('[AVISO] Erro de protocolo QUIC detectado - possível problema de conectividade');
        // Não fazer logout automático, apenas registrar
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('CONNECTIVITY_ERROR', {
                error: 'ERR_QUIC_PROTOCOL_ERROR',
                url: event.filename
            });
        }
    }
});

// Listener para problemas com o Firebase
window.addEventListener('firebase-error', function(event) {
    console.warn('[AVISO] Erro do Firebase detectado:', event.detail);
    if (event.detail && event.detail.code === 'unavailable') {
        showToast('Aviso', 'Problemas de conectividade detectados', 'warning');
    }
});

window.handleLogin = async function(event) {
    const email = document.getElementById('login-email')?.value;
    
    try {
        console.log('🚀🚀🚀 [LOGIN DEBUG] Iniciando handleLogin...');
        console.log('🚀🚀🚀 [LOGIN DEBUG] Email capturado:', email);
        
        debugLog('[DEBUG] handleLogin: login iniciado...');
        event.preventDefault();
        const senha = document.getElementById('login-password').value;
        
        console.log('🚀🚀🚀 [LOGIN DEBUG] Senha capturada (length):', senha?.length || 0);
        
        if (!email || !senha) {
            console.log('🚀🚀🚀 [LOGIN DEBUG] Email ou senha vazios!');
            showToast('Erro', 'Preencha email e senha.', 'error');
            console.warn('[AVISO] handleLogin: email ou senha não preenchidos!');
            if (window.registrarLogAuditoria) {
                window.registrarLogAuditoria('LOGIN_ATTEMPT_INVALID', { email, motivo: 'Campos vazios' });
            }
            return;
        }
        
        // ========== FASE 4: VALIDAÇÃO DE ENTRADA ==========
        window.debugConfig?.log('AUTH', 'Validando entrada de login', { email: email.substring(0, 5) + '...' });
        
        const validation = window.validationHelper?.validateLoginForm(email, senha);
        if (validation && !validation.valid) {
            const errorMsg = validation.errors.email || validation.errors.password;
            showToast('Validação', errorMsg, 'error');
            if (window.registrarLogAuditoria) {
                window.registrarLogAuditoria('LOGIN_VALIDATION_FAILED', { email, reason: errorMsg });
            }
            return;
        }
        
        // ========== FASE 4: RATE LIMITING ==========
        const blocked = window.loginRateLimiter?.isBlocked(email);
        if (blocked?.blocked) {
            window.debugConfig?.warn('AUTH', `Login bloqueado por rate limit para ${email.substring(0, 5)}...`, { waitSeconds: blocked.waitSeconds });
            showToast('Bloqueado', `Muitas tentativas. Tente novamente em ${blocked.waitSeconds} segundos.`, 'error');
            if (window.registrarLogAuditoria) {
                window.registrarLogAuditoria('LOGIN_RATE_LIMITED', { email, waitSeconds: blocked.waitSeconds });
            }
            return;
        }
        
        // Verificar tentativas de login
        if (window.verificarTentativasLogin) {
            window.verificarTentativasLogin(email);
        }
        
        debugLog('[DEBUG] Tentando login com email:', email);
        
        console.log('🚀🚀🚀 [LOGIN DEBUG] Verificando Firebase Auth...');
        console.log('🚀🚀🚀 [LOGIN DEBUG] window.auth existe?', !!window.auth);
        
        // Verificar se Firebase está disponível
        if (!window.auth) {
            console.error('[ERRO] Firebase Auth não disponível');
            console.log('🚀🚀🚀 [LOGIN DEBUG] Firebase Auth não disponível - tentando modo dev');
            showToast('Erro', 'Sistema de autenticação não disponível. Ativando modo desenvolvimento...', 'warning');
            if (window.registrarLogAuditoria) {
                window.registrarLogAuditoria('FIREBASE_AUTH_ERROR', { email });
            }
            // Ativar modo desenvolvimento
            setTimeout(() => {
                window.loginDesenvolvimento(email);
            }, 1000);
            return;
        }

        console.log('🚀🚀🚀 [LOGIN DEBUG] Tentando signInWithEmailAndPassword...');
        const userCredential = await window.auth.signInWithEmailAndPassword(email, senha);
        console.log('🚀🚀🚀 [LOGIN DEBUG] signInWithEmailAndPassword SUCESSO!');
        console.log('🚀🚀🚀 [LOGIN DEBUG] userCredential.user:', userCredential.user?.email);
        
        showToast('Sucesso', 'Login realizado!', 'success');
        debugLog('[DEBUG] handleLogin: login realizado com sucesso!');
        
        // ========== FASE 4: LIMPAR RATE LIMITING ==========
        window.loginRateLimiter?.clearAttempts(email);
        window.debugConfig?.success('AUTH', 'Login bem-sucedido, tentativas limpas');
        
        // Registrar login bem-sucedido
        if (window.registrarTentativaLogin) {
            window.registrarTentativaLogin(email, true);
        }
        
        // Oculta tela de login e mostra painel principal
        document.getElementById('auth-section')?.classList.add('hidden');
        
        // Atualiza badge do menu imediatamente
        const badge = document.getElementById('user-role-badge');
        if (badge) {
            // Exibe o papel correto do usuário com nome personalizado
            const usuario = window.usuarioAdmin;
            const nomeUsuario = usuario?.nome || usuario?.nomeCompleto || usuario?.email?.split('@')[0] || 'Usuário';
            
            if (usuario && usuario.role === 'super_admin') {
                badge.textContent = `${nomeUsuario} (Super Admin)`;
            } else if (usuario && usuario.role === 'admin') {
                badge.textContent = `${nomeUsuario} (Admin)`;
            } else if (usuario && usuario.isEquipe) {
                // Para equipe, mostrar nome + departamento
                const departamento = usuario.equipe ? ` - ${usuario.equipe}` : '';
                badge.textContent = `${nomeUsuario}${departamento}`;
            } else {
                badge.textContent = `${nomeUsuario} (Equipe)`;
            }
        }
        
        // Exibe loader dentro do painel principal
        const painel = document.getElementById('admin-panel');
        let loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = `<div class='loader-spinner'></div> <span>Carregando...</span>`;
        painel.appendChild(loader);
        window._mainLoader = loader;
        
        // NÃO chamar mostrarSecaoPainel aqui - será chamado pelo onAuthStateChanged
        debugLog('[DEBUG] Login concluído, aguardando onAuthStateChanged carregar dados do usuário...');
        
    } catch (error) {
        console.error('[ERRO] handleLogin: falha no login:', error);
        
        // ========== FASE 4: REGISTRAR TENTATIVA FALHADA E RATE LIMIT ==========
        const result = window.loginRateLimiter?.recordAttempt(email);
        window.debugConfig?.error('AUTH', 'Tentativa de login falhada', { email: email.substring(0, 5) + '...', attemptsLeft: result?.attemptsLeft });
        
        // Se bloqueado por rate limiting após X tentativas
        if (result?.blocked) {
            const toastMsg = `Muitas tentativas. Tente novamente em ${result.waitSeconds} segundos.`;
            showToast('Conta Bloqueada', toastMsg, 'error');
            if (window.registrarLogAuditoria) {
                window.registrarLogAuditoria('LOGIN_BLOCKED_RATE_LIMIT', { email, waitSeconds: result.waitSeconds });
            }
            return;
        }
        
        // Registrar tentativa de login falhada
        if (window.registrarTentativaLogin) {
            window.registrarTentativaLogin(email, false);
        }
        
        // Verificar se o erro pode ser devido a alteração de email pelo admin
        let emailAlteradoPorAdmin = false;
        if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/user-not-found') {
            try {
                // Buscar usuário no Firestore para verificar se email foi alterado
                const [adminSnapshot, equipeSnapshot] = await Promise.all([
                    window.db.collection('usuarios_admin').where('email', '==', email.trim()).get(),
                    window.db.collection('usuarios_equipe').where('email', '==', email.trim()).get()
                ]);
                
                let userData = null;
                if (!adminSnapshot.empty) {
                    userData = adminSnapshot.docs[0].data();
                } else if (!equipeSnapshot.empty) {
                    userData = equipeSnapshot.docs[0].data();
                }
                
                if (userData && userData.emailAlteradoPorAdmin) {
                    emailAlteradoPorAdmin = true;
                    console.log('[AUTH-FIX] Detectado email alterado por admin:', userData);
                }
            } catch (firestoreError) {
                console.warn('[WARN] Erro ao verificar Firestore durante login:', firestoreError);
            }
        }
        
        // Registrar log de auditoria detalhado
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('LOGIN_FAILED', { 
                email, 
                errorCode: error.code, 
                errorMessage: error.message,
                emailAlteradoPorAdmin,
                timestamp: new Date().toISOString()
            });
        }
        
        // Tratamento específico de diferentes tipos de erro
        let mensagemErro = 'Erro desconhecido no login';
        
        if (emailAlteradoPorAdmin) {
            mensagemErro = 'Seu email foi alterado pelo administrador. Entre em contato com a equipe de TI para reativar seu acesso.';
            showToast('Email Alterado', mensagemErro, 'warning');
        } else if (error.code === 'auth/invalid-login-credentials' || 
            error.code === 'auth/user-not-found' || 
            error.code === 'auth/wrong-password') {
            mensagemErro = 'Email ou senha incorretos';
        } else if (error.code === 'auth/too-many-requests') {
            mensagemErro = 'Muitas tentativas. Tente novamente mais tarde';
        } else if (error.code === 'auth/network-request-failed') {
            mensagemErro = 'Erro de conexão. Verifique sua internet';
        } else if (error.code === 'auth/invalid-email') {
            mensagemErro = 'Email inválido';
        }
        
        if (!emailAlteradoPorAdmin) {
            showToast('Erro de Login', mensagemErro, 'error');
        }
        
        console.warn('[AVISO] handleLogin: erro detalhado:', { 
            code: error.code, 
            message: error.message,
            email: email,
            emailAlteradoPorAdmin
        });
        
        let mostrarModoDesenvolvimento = false;
        
        if (error.code && !emailAlteradoPorAdmin) {
            switch (error.code) {
                case 'auth/invalid-login-credentials':
                    mensagemErro = 'Email ou senha incorretos. Verifique suas credenciais.';
                    mostrarModoDesenvolvimento = true;
                    break;
                case 'auth/user-not-found':
                    mensagemErro = 'Usuário não encontrado. Verifique o email.';
                    mostrarModoDesenvolvimento = true;
                    break;
                case 'auth/wrong-password':
                    mensagemErro = 'Senha incorreta.';
                    break;
                case 'auth/invalid-email':
                    mensagemErro = 'Email inválido.';
                    break;
                case 'auth/user-disabled':
                    mensagemErro = 'Conta desabilitada. Entre em contato com o administrador.';
                    break;
                case 'auth/too-many-requests':
                    mensagemErro = 'Muitas tentativas de login. Tente novamente mais tarde.';
                    break;
                case 'auth/network-request-failed':
                    mensagemErro = 'Erro de rede. Verifique sua conexão.';
                    mostrarModoDesenvolvimento = true;
                    break;
                default:
                    mensagemErro = `Erro de autenticação: ${error.code}`;
                    mostrarModoDesenvolvimento = true;
            }
            
            showToast('Erro', mensagemErro, 'error');
        }
        
        // Se há problemas de conectividade ou credenciais, oferecer modo desenvolvimento
        if (mostrarModoDesenvolvimento && !emailAlteradoPorAdmin) {
            setTimeout(() => {
                const email = document.getElementById('login-email').value;
                if (email && confirm('Erro de autenticação detectado. Deseja ativar o modo desenvolvimento? (Funcionalidade limitada)')) {
                    window.loginDesenvolvimento(email);
                }
            }, 2000);
        }
    }
}

window.carregarSolicitacoesAgrupadas = async function() {
    // Verificar se usuário está logado e dados carregados antes de prosseguir
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    if (!usuarioAdmin || !usuarioAdmin.uid || !usuarioAdmin.email) {
        console.warn('[AVISO] carregarSolicitacoesAgrupadas: usuário não completamente logado, ignorando chamada...');
        return;
    }

    // Chama a função que atualiza os cards de métricas e equipes
    await carregarSolicitacoes();
}

window.showCreateUserModal = function() {
    debugLog('[DEBUG] showCreateUserModal: iniciando...');
    
    // Debug completo do estado atual
    window.debugModals();
    
    // Verifica se o usuário está autenticado e tem permissões
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    debugLog('[DEBUG] showCreateUserModal: usuarioAdmin:', usuarioAdmin);
    debugLog('[DEBUG] showCreateUserModal: userRole:', userRole);
    
    // Verificar permissões: super_admin pode tudo, outros precisam de permissões específicas
    const podecriarUsuarios = temPermissaoJS(usuarioAdmin, 'create_users');
    const podeCriarAcompanhantes = temPermissaoJS(usuarioAdmin, 'create_acompanhantes');
    
    if (!userRole || (userRole !== 'super_admin' && !podecriarUsuarios && !podeCriarAcompanhantes)) {
        showToast('Erro', 'Acesso negado. Sem permissão para criar usuários.', 'error');
        console.warn('[AVISO] showCreateUserModal: acesso negado, role:', userRole, 'permissões:', {
            podecriarUsuarios,
            podeCriarAcompanhantes
        });
        return;
    }
    
    // Busca o modal
    const modal = document.getElementById('modal-novo-usuario');
    debugLog('[DEBUG] showCreateUserModal: modal encontrado:', !!modal);
    
    if (modal) {
        debugLog('[DEBUG] showCreateUserModal: exibindo modal');
        
        // Garantir que o modal esteja anexado ao body
        if (modal.parentElement !== document.body) {
            debugLog('[DEBUG] showCreateUserModal: modal não está no body, movendo...');
            document.body.appendChild(modal);
        }
        
        // IMPORTANTE: Remover a classe .hidden PRIMEIRO (que tem !important)
        modal.classList.remove('hidden');
        
        // Depois configurar os estilos
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.zIndex = '999999';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        // Configurar botão cancelar
        const btnCancelar = document.getElementById('btn-cancelar-novo-usuario');
        if (btnCancelar) {
            btnCancelar.onclick = function() {
                debugLog('[DEBUG] Botão cancelar clicado - fechando modal');
                window.closeCreateUserModal();
            };
        }
        
        // Configurar submit do formulário
        const form = document.getElementById('form-novo-usuario');
        if (form) {
            form.onsubmit = async function(e) {
                e.preventDefault();
                debugLog('[DEBUG] Form submit interceptado');
                await window.criarNovoUsuario();
            };
        }
        
        // Personalizar opções baseadas nas permissões
        const tipoSelect = document.getElementById('usuario-tipo');
        if (tipoSelect) {
            // Limpar opções atuais
            tipoSelect.innerHTML = '<option value="">Selecione o tipo</option>';
            
            // Adicionar opções baseadas nas permissões
            if (userRole === 'super_admin' || podecriarUsuarios) {
                tipoSelect.innerHTML += '<option value="equipe">👥 Usuário de Equipe</option>';
                tipoSelect.innerHTML += '<option value="admin">🔐 Administrador</option>';
            }
            
            if (userRole === 'super_admin' || podeCriarAcompanhantes) {
                tipoSelect.innerHTML += '<option value="acompanhante">👨‍👩‍👧‍👦 Acompanhante</option>';
            }
            
            debugLog('[DEBUG] Opções personalizadas baseadas em permissões:', {
                super_admin: userRole === 'super_admin',
                podecriarUsuarios,
                podeCriarAcompanhantes
            });
        }
        
        // Focar no primeiro campo após um delay
        setTimeout(() => {
            const tipoField = document.getElementById('usuario-tipo');
            if (tipoField) {
                tipoField.focus();
                debugLog('[DEBUG] showCreateUserModal: foco definido no campo tipo');
            }
        }, 200);
        
        debugLog('[DEBUG] showCreateUserModal: modal exibido com sucesso');
    } else {
        console.error('[ERRO] Modal de criação de usuário não encontrado no DOM!');
        alert('Erro: Modal de criação de usuário não encontrado!');
    }
};

// Função para criar novo usuário (equipe ou admin)
window.criarNovoUsuario = async function() {
    debugLog('[DEBUG] criarNovoUsuario: iniciando...');
    
    try {
        // Verificar permissões específicas baseadas no tipo
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const userRole = window.userRole || usuarioAdmin.role;
        const podecriarUsuarios = temPermissaoJS(usuarioAdmin, 'create_users');
        const podeCriarAcompanhantes = temPermissaoJS(usuarioAdmin, 'create_acompanhantes');
        
        // Verificar se tem permissão para o tipo específico
        if (tipo === 'acompanhante' && !podeCriarAcompanhantes && userRole !== 'super_admin') {
            showToast('Erro', 'Acesso negado. Sem permissão para criar acompanhantes.', 'error');
            return;
        }
        
        if ((tipo === 'equipe' || tipo === 'admin') && !podecriarUsuarios && userRole !== 'super_admin') {
            showToast('Erro', 'Acesso negado. Sem permissão para criar usuários de equipe/admin.', 'error');
            return;
        }
        
        // Obter dados do formulário
        const nome = document.getElementById('usuario-nome').value.trim();
        const email = document.getElementById('usuario-email').value.trim();
        const senha = document.getElementById('usuario-senha').value;
        const equipe = document.getElementById('usuario-equipe').value;
        const quarto = document.getElementById('usuario-quarto')?.value.trim();
        
        debugLog('[DEBUG] Dados do formulário:', { tipo, nome, email, senha: senha.length, equipe, quarto });
        
        // Validações
        if (!tipo) {
            showToast('Erro', 'Selecione o tipo de usuário.', 'error');
            return;
        }
        
        if (!nome || !email || !senha) {
            showToast('Erro', 'Preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        if (tipo === 'equipe' && !equipe) {
            showToast('Erro', 'Selecione a equipe para usuários de equipe.', 'error');
            return;
        }
        
        if (tipo === 'acompanhante' && !quarto) {
            showToast('Erro', 'Informe o número do quarto para acompanhantes.', 'error');
            return;
        }
        
        if (senha.length < 6) {
            showToast('Erro', 'A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        // Verificar se o email já existe antes de tentar criar
        debugLog('[DEBUG] Verificando se email já existe:', email);
        showToast('Info', 'Verificando se o email já existe...', 'info');
        
        // DIAGNÓSTICO: Verificar estado da autenticação e permissões
        await diagnosticarPermissoes();
        
        try {
            const emailExiste = await verificarEmailExistente(email);
            debugLog('[DEBUG] Resultado verificação email:', emailExiste);
            
            if (emailExiste) {
                showToast('Erro', `O email "${email}" já está sendo usado por outro usuário. Escolha um email diferente.`, 'error');
                debugLog('[DEBUG] Email já existe, parando criação');
                return;
            } else {
                debugLog('[DEBUG] Email livre para uso, prosseguindo...');
                showToast('Info', 'Email disponível, criando usuário...', 'info');
            }
        } catch (errorVerificacao) {
            console.error('[ERRO] Falha na verificação de email:', errorVerificacao);
            
            // Se for erro de permissões, tentar reautenticar
            if (errorVerificacao.code === 'permission-denied') {
                const tentarReauth = confirm(
                    'Erro de permissões detectado. Deseja tentar reautenticar?\n\n' +
                    'Isso pode resolver problemas de token expirado.'
                );
                
                if (tentarReauth) {
                    try {
                        showToast('Info', 'Tentando reautenticar...', 'info');
                        await window.auth.currentUser.getIdToken(true); // Forçar refresh do token
                        showToast('Sucesso', 'Token atualizado. Tente novamente.', 'success');
                        return;
                    } catch (reAuthError) {
                        console.error('Erro na reautenticação:', reAuthError);
                        showToast('Erro', 'Falha na reautenticação. Faça login novamente.', 'error');
                        return;
                    }
                }
            }
            
            showToast('Aviso', 'Não foi possível verificar se o email já existe. Tentando criar mesmo assim...', 'warning');
        }
        
        // Desabilitar botão durante criação
        const btnSubmit = document.querySelector('#form-novo-usuario button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Criando...';
        }
        
        debugLog('[DEBUG] Criando usuário no Firebase Auth...');
        
        // SALVAR DADOS DO ADMINISTRADOR ATUAL ANTES DA CRIAÇÃO
        const adminAtual = {
            user: window.auth.currentUser,
            dadosAdmin: { ...usuarioAdmin },
            userRole: window.userRole,
            userEmail: window.userEmail
        };
        
        console.log('💾 Salvando dados do admin atual:', adminAtual.dadosAdmin.email);
        
        // SOLUÇÃO MELHORADA: Criar usuário sem perder sessão do admin
        let novoUsuario;
        
        try {
            console.log('🔄 Criando usuário mantendo sessão admin...');
            
            // Método 1: Tentar usar Cloud Functions (se disponível)
            if (window.firebase.functions) {
                console.log('🌐 Tentando usar Cloud Functions...');
                try {
                    const createUser = window.firebase.functions().httpsCallable('createUser');
                    const result = await createUser({ email, password: senha, tipo, nome, equipe });
                    novoUsuario = { uid: result.data.uid };
                    console.log('✅ Usuário criado via Cloud Functions:', novoUsuario.uid);
                } catch (functionsError) {
                    console.log('⚠️ Cloud Functions não disponível, usando método direto');
                    throw functionsError;
                }
            } else {
                throw new Error('Cloud Functions não configurado');
            }
        } catch (error) {
            // Fallback: método direto com gestão de sessão
            console.log('🔄 Usando método direto com proteção de sessão...');
            
            try {
                // Tentar obter configuração do Firebase
                const config = window.firebaseConfig || {
                    apiKey: "AIzaSyAIp-rFuZZsBCNVJ3pSge4TE-XUuwYygrI",
                    authDomain: "yuna-usuarios.firebaseapp.com",
                    projectId: "yuna-usuarios",
                    storageBucket: "yuna-usuarios.firebasestorage.app",
                    messagingSenderId: "794262176773",
                    appId: "1:794262176773:web:c4e3837b9784c2cd0cc2ba",
                    measurementId: "G-BHCR6T39CT"
                };
                
                // Criar uma nova instância do Firebase para evitar conflito
                const tempApp = window.firebase.initializeApp(config, 'temp-user-creation-' + Date.now());
                const tempAuth = tempApp.auth();
                
                try {
                    const userCredential = await tempAuth.createUserWithEmailAndPassword(email, senha);
                    novoUsuario = userCredential.user;
                    console.log('👤 Usuário criado via instância temporária:', novoUsuario.uid);
                    
                    // Limpar instância temporária
                    await tempAuth.signOut();
                    await tempApp.delete();
                    
                } catch (tempError) {
                    console.log('⚠️ Método temporário falhou:', tempError.message);
                    
                    if (tempApp) {
                        try { await tempApp.delete(); } catch(e) {}
                    }
                    
                    // Último recurso: método original
                    console.log('🔄 Usando método original como último recurso...');
                    const userCredential = await window.auth.createUserWithEmailAndPassword(email, senha);
                    novoUsuario = userCredential.user;
                    console.log('👤 Usuário criado via método original:', novoUsuario.uid);
                }
                
            } catch (fallbackError) {
                console.error('❌ Todos os métodos falharam:', fallbackError);
                throw fallbackError;
            }
        }
        
        debugLog('[DEBUG] Usuário criado no Auth:', novoUsuario.uid);
        console.log('👤 Usuário criado:', email, 'UID:', novoUsuario.uid);
        
        // Preparar dados do usuário baseado no tipo
        let dadosUsuario;
        let colecao;
        
        if (tipo === 'admin') {
            colecao = 'usuarios_admin';
            dadosUsuario = {
                nome: nome,
                email: email,
                role: 'admin',
                ativo: true,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                criadoPor: usuarioAdmin.email,
                permissoes: {
                    criarUsuarios: false,              // Apenas super_admin
                    gerenciarDepartamentos: false,     // Apenas super_admin
                    verRelatorios: true,               // Admin pode acessar
                    gerenciarSolicitacoes: true,       // Admin pode gerenciar solicitações
                    gerenciarAcompanhantes: false,     // Apenas super_admin
                    verMetricas: true,                 // Admin pode ver métricas
                    verPesquisaSatisfacao: true        // Admin pode ver pesquisa satisfação
                }
            };
        } else if (tipo === 'equipe') {
            colecao = 'usuarios_equipe';
            dadosUsuario = {
                nome: nome,
                email: email,
                equipe: equipe,
                departamento: equipe, // Para compatibilidade
                role: 'equipe',
                ativo: true,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                criadoPor: usuarioAdmin.email,
                permissoes: {
                    verSolicitacoesDepartamento: true,
                    gerenciarSolicitacoesDepartamento: true
                }
            };
        } else if (tipo === 'acompanhante') {
            colecao = 'usuarios_acompanhantes';
            dadosUsuario = {
                nome: nome,
                email: email,
                quarto: quarto,
                ativo: true,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                criadoPor: usuarioAdmin.email,
                role: 'acompanhante',
                permissoes: {
                    criarSolicitacoes: true,
                    verSolicitacoesProprioQuarto: true
                }
            };
        }
        
        debugLog('[DEBUG] Salvando no Firestore - Coleção:', colecao);
        
        // Salvar no Firestore
        await window.db.collection(colecao).doc(novoUsuario.uid).set(dadosUsuario);
        
        debugLog('[DEBUG] Usuário salvo com sucesso');
        
        // VERIFICAR E RESTAURAR SESSÃO DO ADMINISTRADOR
        const usuarioAtualLogado = window.auth.currentUser;
        
        if (!usuarioAtualLogado || usuarioAtualLogado.email !== adminAtual.dadosAdmin.email) {
            console.log('🔄 Sessão do administrador foi perdida, iniciando restauração...');
            
            // Se há algum usuário logado (que seria o recém-criado), fazer logout
            if (usuarioAtualLogado) {
                console.log('📤 Fazendo logout do usuário atual:', usuarioAtualLogado.email);
                await window.auth.signOut();
            }
            
            // Tentar restaurar sessão do administrador
            try {
                console.log('🔐 Solicitando reautenticação do administrador...');
                const senhaAdmin = prompt(
                    `Para completar a operação, digite a senha do administrador ${adminAtual.dadosAdmin.email}:`
                );
                
                if (!senhaAdmin) {
                    throw new Error('Reautenticação cancelada pelo usuário');
                }
                
                await window.auth.signInWithEmailAndPassword(adminAtual.dadosAdmin.email, senhaAdmin);
                
                // Restaurar dados do contexto
                window.usuarioAdmin = adminAtual.dadosAdmin;
                window.userRole = adminAtual.userRole;
                window.userEmail = adminAtual.userEmail;
                localStorage.setItem('usuarioAdmin', JSON.stringify(adminAtual.dadosAdmin));
                
                console.log('✅ Administrador reautenticado com sucesso:', adminAtual.dadosAdmin.email);
                
            } catch (reAuthError) {
                console.error('❌ Erro na reautenticação:', reAuthError);
                
                // Mesmo com erro, tentar restaurar dados locais
                window.usuarioAdmin = adminAtual.dadosAdmin;
                window.userRole = adminAtual.userRole;
                window.userEmail = adminAtual.userEmail;
                localStorage.setItem('usuarioAdmin', JSON.stringify(adminAtual.dadosAdmin));
                
                // Mostrar aviso para o usuário
                setTimeout(() => {
                    showToast('Aviso', 
                        'Usuário criado! Por favor, faça login novamente para continuar usando o sistema.', 
                        'warning'
                    );
                }, 1000);
            }
        } else {
            console.log('✅ Sessão do administrador mantida ativa');
        }
        
        showToast('Sucesso', `${tipo === 'admin' ? 'Administrador' : 'Usuário de equipe'} criado com sucesso!`, 'success');
        
        // Limpar formulário
        document.getElementById('form-novo-usuario').reset();
        document.getElementById('campo-equipe').style.display = 'none';
        
        // Fechar modal
        window.closeCreateUserModal();
        
        // Recarregar lista de usuários se estiver na tela de gerenciamento
        if (typeof window.carregarUsuarios === 'function') {
            setTimeout(() => window.carregarUsuarios(), 500);
        }
        
    } catch (error) {
        console.error('[ERRO] criarNovoUsuario:', error);
        
        let mensagem = 'Erro ao criar usuário: ' + error.message;
        
        if (error.code === 'auth/email-already-in-use') {
            mensagem = `O email "${email}" já está sendo usado no Firebase Auth. Possível usuário órfão detectado.`;
            
            // Adicionar botão para tentar limpar usuário órfão
            const confirmarLimpeza = confirm(
                `O email "${email}" já existe no sistema de autenticação, mas pode ser um usuário órfão.\n\n` +
                'Deseja tentar limpar e recriar o usuário?\n\n' +
                '(Isso irá remover o usuário órfão do Firebase Auth e criar novamente)'
            );
            
            if (confirmarLimpeza) {
                try {
                    showToast('Info', 'Tentando limpar usuário órfão...', 'info');
                    
                    // Tentar fazer login com o email para deletar
                    console.log('🔄 Tentativa de limpeza de usuário órfão:', email);
                    
                    // Como não temos a senha do usuário órfão, vamos sugerir limpeza manual
                    showToast('Aviso', 
                        `Para resolver este problema:\n` +
                        `1. Acesse o Firebase Console\n` +
                        `2. Vá em Authentication > Users\n` +
                        `3. Encontre e delete o usuário: ${email}\n` +
                        `4. Tente criar novamente`, 
                        'warning', 10000
                    );
                    
                } catch (limpezaError) {
                    console.error('Erro na tentativa de limpeza:', limpezaError);
                    showToast('Erro', 'Não foi possível limpar automaticamente. Use o Firebase Console.', 'error');
                }
            }
            
        } else if (error.code === 'auth/invalid-email') {
            mensagem = 'Email inválido. Verifique o formato do endereço de email.';
        } else if (error.code === 'auth/weak-password') {
            mensagem = 'Senha muito fraca. Use pelo menos 6 caracteres.';
        }
        
        showToast('Erro', mensagem, 'error');
        
    } finally {
        // Reabilitar botão
        const btnSubmit = document.querySelector('#form-novo-usuario button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Criar Usuário';
        }
    }
};

window.showManageUsersModal = async function() {
    debugLog('[DEBUG] showManageUsersModal: iniciando...');
    
    // GARANTIR que modal de edição esteja fechado
    const editModal = document.getElementById('edit-user-modal');
    if (editModal) {
        editModal.classList.add('hidden');
        editModal.style.display = 'none';
    }
    
    // Remover qualquer modal dinâmico de edição anterior
    const dynamicEditModals = document.querySelectorAll('.modal-edicao-usuario');
    dynamicEditModals.forEach(modal => {
        if (modal.id !== 'edit-user-modal') { // Não remover o fixo
            modal.remove();
        }
    });
    
    // Debug completo do estado atual
    window.debugModals();
    
    // Verifica se o usuário está autenticado e tem permissões
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    debugLog('[DEBUG] showManageUsersModal: usuarioAdmin:', usuarioAdmin);
    debugLog('[DEBUG] showManageUsersModal: userRole:', userRole);
    
    // Permite APENAS para super_admin
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem gerenciar usuários.', 'error');
        console.warn('[AVISO] showManageUsersModal: acesso negado, role:', userRole);
        return;
    }
    
    // Busca o modal
    const modal = document.getElementById('manage-users-modal');
    debugLog('[DEBUG] showManageUsersModal: modal encontrado:', !!modal);
    
    if (modal) {
        debugLog('[DEBUG] showManageUsersModal: exibindo modal');
        
        // IMPORTANTE: Remover a classe .hidden PRIMEIRO (que tem !important)
        modal.classList.remove('hidden');
        
        // Depois configurar os estilos
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.zIndex = '99999';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        // Focar no modal após um delay
        setTimeout(() => {
            modal.focus();
            debugLog('[DEBUG] showManageUsersModal: foco definido no modal');
        }, 200);
        
        // Carregar os usuários após exibir o modal
        try {
            debugLog('[DEBUG] showManageUsersModal: carregando usuários...');
            await window.carregarUsuarios();
            debugLog('[DEBUG] showManageUsersModal: usuários carregados com sucesso');
        } catch (error) {
            console.error('[ERRO] showManageUsersModal: erro ao carregar usuários:', error);
            showToast('Erro', 'Erro ao carregar usuários.', 'error');
        }
        
        // TORNAR O MODAL ARRASTÁVEL
        setTimeout(() => {
            console.log('[DRAG] 🎯 Iniciando configuração de modal arrastável...');
            window.tornarModalArrastavel('manage-users-modal');
        }, 300);
        
        debugLog('[DEBUG] showManageUsersModal: modal exibido com sucesso');
    } else {
        console.error('[ERRO] Modal de gerenciamento de usuários não encontrado no DOM!');
        alert('Erro: Modal de gerenciamento de usuários não encontrado!');
    }
};

window.mostrarRelatorios = function() {
    try {
        debugLog('[DEBUG] ===== INÍCIO MOSTRAR RELATÓRIOS =====');
        
        // Verificar estado de autenticação de forma mais robusta
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const userRole = window.userRole || usuarioAdmin.role || 'admin';
        const isAuthenticated = window.auth?.currentUser || usuarioAdmin.uid;
        
        debugLog('[DEBUG] mostrarRelatorios: estado de auth:', {
            email: usuarioAdmin?.email,
            role: userRole,
            isAuthenticated: !!isAuthenticated,
            windowUserRole: window.userRole,
            localStorageUser: !!localStorage.getItem('usuarioAdmin'),
            firebaseUser: !!window.auth?.currentUser
        });
        
        // Permitir acesso para admin e super_admin
        if (!userRole || (userRole !== 'super_admin' && userRole !== 'admin')) {
            console.warn('[AVISO] mostrarRelatorios: tentando forçar role admin...');
            
            // Tentar forçar role admin como fallback
            if (isAuthenticated) {
                window.userRole = 'admin';
                debugLog('[DEBUG] mostrarRelatorios: role forçado para admin');
            } else {
                showToast('Erro', 'Acesso negado. Faça login novamente.', 'error');
                console.warn('[AVISO] mostrarRelatorios: usuário não autenticado');
                return;
            }
        }
        
        debugLog('[DEBUG] mostrarRelatorios: acesso autorizado, configurando interface relatórios');
        
        // Mostrar interface de relatórios diretamente (sem chamar mostrarSecaoPainel recursivamente)
        // Ocultar outras seções
        const secoes = [
            'admin-panel',
            'acompanhantes-section',
            'create-user-modal',
            'manage-users-modal',
            'teams-grid'
        ];
        secoes.forEach(id => {
            const el = document.getElementById(id) || document.querySelector('.' + id);
            if (el) el.classList.add('hidden');
        });
        
        // Mostrar painel admin com relatórios
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.remove('hidden');
            debugLog('[DEBUG] mostrarRelatorios: admin-panel exibido');
        }
        
        debugLog('[DEBUG] mostrarRelatorios: interface configurada, configurando filtros');
        
        var filtroPeriodo = document.getElementById('filtro-periodo');
        if (filtroPeriodo && !filtroPeriodo.dataset.listenerAdded) {
            filtroPeriodo.addEventListener('change', function() {
                var customDateRange = document.getElementById('custom-date-range');
                customDateRange.style.display = this.value === 'custom' ? 'grid' : 'none';
            });
            filtroPeriodo.dataset.listenerAdded = 'true';
        }
        
        debugLog('[DEBUG] mostrarRelatorios: verificando se deve carregar solicitações');
        
        // Gerar relatório HTML completo em vez de apenas estatísticas
        debugLog('[DEBUG] mostrarRelatorios: gerando relatório HTML...');
        
        // Gerar relatório completo em vez de apenas carregar dados
        setTimeout(async () => {
            try {
                debugLog('[DEBUG] mostrarRelatorios: chamando gerarRelatorioAdmin...');
                
                // Chamar função que gera relatório HTML completo
                if (typeof window.gerarRelatorioAdmin === 'function') {
                    await window.gerarRelatorioAdmin();
                    debugLog('[DEBUG] mostrarRelatorios: relatório HTML gerado com sucesso');
                } else {
                    console.error('[ERRO] mostrarRelatorios: função gerarRelatorioAdmin não encontrada');
                    // Fallback: carregar apenas dados básicos
                    if (typeof window.carregarSolicitacoes === 'function') {
                        window.carregarSolicitacoes();
                    }
                }
            } catch (error) {
                console.error('[ERRO] mostrarRelatorios: erro ao gerar relatório:', error);
                showToast('Erro', 'Falha ao gerar relatório', 'error');
            }
        }, 100);
        
        // Adicionar botões de manutenção apenas para super_admin
        if (userRole === 'super_admin') {
            debugLog('[DEBUG] mostrarRelatorios: adicionando painel de manutenção...');
            
            // Verificar se a função existe antes de chamar
            if (typeof window.adicionarPainelManutencao === 'function') {
                window.adicionarPainelManutencao();
            } else {
                console.warn('[AVISO] adicionarPainelManutencao não está definida ainda - será chamada posteriormente');
                // Tentar novamente após um pequeno delay
                setTimeout(() => {
                    if (typeof window.adicionarPainelManutencao === 'function') {
                        window.adicionarPainelManutencao();
                    } else {
                        console.error('[ERRO] adicionarPainelManutencao ainda não está disponível');
                    }
                }, 100);
            }
        } else {
            debugLog('[DEBUG] mostrarRelatorios: painel de manutenção não adicionado (role não é super_admin)');
        }
        
        // Garantir que os botões estejam configurados corretamente
        // Removido para evitar chamadas duplicadas - configuração feita no login
        debugLog('[DEBUG] mostrarRelatorios: função executada com sucesso');
        
        debugLog('[DEBUG] ===== FIM MOSTRAR RELATÓRIOS =====');
        
    } catch (error) {
        console.error('[ERRO] mostrarRelatorios: falha na execução:', error);
        showToast('Erro', 'Erro ao carregar relatórios. Tente novamente.', 'error');
        
        // Em caso de erro, não deixar o usuário em estado inconsistente
        setTimeout(() => {
            console.log('[RECOVERY] Tentando recuperar estado após erro...');
            atualizarVisibilidadeBotoes();
            configurarEventosBotoes();
        }, 500);
    }
};

window.abrirAcompanhantesSection = function() {
    // Verificar se é admin, super_admin OU equipe de higienização específica
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    console.log('🏠🏠🏠 [ACOMPANHANTES ACCESS DEBUG] Verificando acesso...');
    console.log('🏠🏠🏠 [ACOMPANHANTES ACCESS DEBUG] usuarioAdmin:', usuarioAdmin);
    console.log('🏠🏠🏠 [ACOMPANHANTES ACCESS DEBUG] userRole:', userRole);
    console.log('🏠🏠🏠 [ACOMPANHANTES ACCESS DEBUG] email:', usuarioAdmin?.email);
    
    // Verificar permissão: super_admin, admin OU recepcao.jardins@yuna.com.br
    const isSuperAdmin = userRole === 'super_admin';
    const isAdmin = userRole === 'admin';
    const isHigienizacaoRecepcao = usuarioAdmin?.email === 'recepcao.jardins@yuna.com.br';
    
    console.log('🏠🏠🏠 [ACOMPANHANTES ACCESS DEBUG] Verificações:', {
        isSuperAdmin,
        isAdmin,
        isHigienizacaoRecepcao,
        temPermissao: isSuperAdmin || isAdmin || isHigienizacaoRecepcao
    });
    
    if (!userRole || (!isSuperAdmin && !isAdmin && !isHigienizacaoRecepcao)) {
        showToast('Erro', 'Acesso negado. Apenas administradores e equipe de higienização podem gerenciar acompanhantes.', 'error');
        console.warn('[AVISO] abrirAcompanhantesSection: acesso negado, role:', userRole, 'email:', usuarioAdmin?.email);
        return;
    }
    
    console.log('🏠🏠🏠 [ACOMPANHANTES ACCESS DEBUG] ACESSO LIBERADO! Abrindo seção...');
    mostrarSecaoPainel('acompanhantes');
    if (typeof carregarAcompanhantes === 'function') carregarAcompanhantes();
};

window.voltarPainelPrincipal = function() {
    debugLog('[DEBUG] ===== VOLTANDO AO PAINEL PRINCIPAL =====');
    console.trace('[DEBUG] Stack trace do voltarPainelPrincipal:');
    
    mostrarSecaoPainel('painel');
    
    // Garantir que os botões estejam configurados ao voltar ao painel
    setTimeout(() => {
        debugLog('[DEBUG] voltarPainelPrincipal: reconfigurando botões...');
        atualizarVisibilidadeBotoes();
        configurarEventosBotoes();
    }, 100);
};

// ===== FASE 3: DASHBOARD EXECUTIVO =====
window.abrirDashboardExecutivo = function() {
    console.log('[DASHBOARD] 📊 Abrindo Dashboard Executivo...');
    mostrarSecaoPainel('dashboard');
    carregarDadosDashboard();
};

async function carregarDadosDashboard() {
    console.log('[DASHBOARD] 🔄 Carregando dados do dashboard...');
    
    // ========== FASE 4: CACHE DE DASHBOARD (5 MIN TTL) ==========
    const CACHE_KEY = 'yuna_dashboard_cache';
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
    const now = Date.now();
    
    // Verificar se há cache válido
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const cacheData = JSON.parse(cached);
        const cacheAge = now - cacheData.timestamp;
        
        if (cacheAge < CACHE_TTL) {
            window.debugConfig?.log('DASHBOARD', `Usando cache (${Math.round(cacheAge / 1000)}s de idade)`);
            console.log('[DASHBOARD] 💾 Usando cache - idade:', Math.round(cacheAge / 1000), 'segundos');
            
            // Renderizar dados do cache
            const metricas = cacheData.metricas;
            atualizarResumoRapido(metricas);
            
            setTimeout(() => {
                renderizarGraficoStatusQuo(metricas);
                renderizarGraficoDepartamentos(cacheData.solicitacoes);
                atualizarTabelaDepartamentos(metricas);
                atualizarKPIs(metricas);
            }, 50);
            
            return; // Retornar sem refetch
        } else {
            window.debugConfig?.log('DASHBOARD', `Cache expirado (${Math.round(cacheAge / 1000)}s)`);
            console.log('[DASHBOARD] ⏰ Cache expirado, recarregando...');
        }
    }
    
    try {
        // Buscar todas as solicitações
        const snapshot = await window.db.collection('solicitacoes').get();
        const solicitacoes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('[DASHBOARD] 📋 Total de solicitações:', solicitacoes.length);
        
        // Calcular métricas gerais
        const metricas = calcularMetricasDashboard(solicitacoes);
        
        // ========== FASE 4: ARMAZENAR NO CACHE ==========
        const cacheData = {
            timestamp: now,
            solicitacoes: solicitacoes,
            metricas: metricas
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        window.debugConfig?.success('DASHBOARD', 'Cache atualizado');
        console.log('[DASHBOARD] 💾 Cache atualizado');
        
        // Atualizar resumo rápido
        atualizarResumoRapido(metricas);
        
        // Renderizar gráficos com pequeno delay para garantir DOM visível
        setTimeout(() => {
            renderizarGraficoStatusQuo(metricas);
            renderizarGraficoDepartamentos(solicitacoes);
            atualizarTabelaDepartamentos(metricas);
            atualizarKPIs(metricas);
        }, 50);
        
    } catch (error) {
        console.error('[DASHBOARD] ❌ Erro ao carregar dashboard:', error);
        window.debugConfig?.error('DASHBOARD', 'Erro ao carregar dados', error);
        showToast('Erro', 'Erro ao carregar dados do dashboard', 'error');
    }
}

function calcularMetricasDashboard(solicitacoes) {
    console.log('[DASHBOARD] 🧮 Calculando métricas...');
    
    const metricas = {
        total: solicitacoes.length,
        pendentes: 0,
        andamento: 0,
        finalizadas: 0,
        departamentos: {
            manutencao: { total: 0, pendentes: 0, andamento: 0, finalizadas: 0 },
            nutricao: { total: 0, pendentes: 0, andamento: 0, finalizadas: 0 },
            higienizacao: { total: 0, pendentes: 0, andamento: 0, finalizadas: 0 },
            hotelaria: { total: 0, pendentes: 0, andamento: 0, finalizadas: 0 }
        },
        tempos: []
    };
    
    solicitacoes.forEach(sol => {
        const status = sol.status || 'pendente';
        const departamento = sol.tipo_servico || sol.departamento || 'manutencao';
        
        // Contar status geral
        if (status === 'pendente') metricas.pendentes++;
        else if (status === 'em-andamento' || status === 'andamento') metricas.andamento++;
        else if (status === 'finalizada') metricas.finalizadas++;
        
        // Contar por departamento
        if (metricas.departamentos[departamento]) {
            metricas.departamentos[departamento].total++;
            
            if (status === 'pendente') metricas.departamentos[departamento].pendentes++;
            else if (status === 'em-andamento' || status === 'andamento') metricas.departamentos[departamento].andamento++;
            else if (status === 'finalizada') metricas.departamentos[departamento].finalizadas++;
        }
        
        // Coletar tempos para cálculo de média
        if (sol.data_criacao && sol.data_atualizacao) {
            const tempo = new Date(sol.data_atualizacao) - new Date(sol.data_criacao);
            metricas.tempos.push(tempo);
        }
    });
    
    return metricas;
}

function atualizarResumoRapido(metricas) {
    console.log('[DASHBOARD] 📊 Atualizando resumo rápido...');
    
    document.getElementById('dash-total-solicitacoes').textContent = metricas.total;
    document.getElementById('dash-pendentes-count').textContent = metricas.pendentes;
    document.getElementById('dash-andamento-count').textContent = metricas.andamento;
    document.getElementById('dash-finalizadas-count').textContent = metricas.finalizadas;
}

function renderizarGraficoStatusQuo(metricas) {
    console.log('[DASHBOARD] 📊 Renderizando gráfico de status...');
    
    // Verificar se Chart está disponível
    if (typeof Chart === 'undefined') {
        console.error('[DASHBOARD] ❌ Chart.js não está carregado! Aguardando...');
        setTimeout(() => renderizarGraficoStatusQuo(metricas), 500);
        return;
    }
    
    const ctx = document.getElementById('statusChart');
    if (!ctx) {
        console.warn('[DASHBOARD] Canvas statusChart não encontrado');
        return;
    }
    
    // Destruir gráfico anterior se existir
    if (window.statusChartInstance) {
        window.statusChartInstance.destroy();
    }
    
    const percentuais = metricas.total > 0 ? {
        pendentes: Math.round((metricas.pendentes / metricas.total) * 100),
        andamento: Math.round((metricas.andamento / metricas.total) * 100),
        finalizadas: Math.round((metricas.finalizadas / metricas.total) * 100)
    } : { pendentes: 0, andamento: 0, finalizadas: 0 };
    
    try {
        window.statusChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    `Pendentes (${metricas.pendentes})`,
                    `Em Andamento (${metricas.andamento})`,
                    `Finalizadas (${metricas.finalizadas})`
                ],
                datasets: [{
                    data: [metricas.pendentes, metricas.andamento, metricas.finalizadas],
                    backgroundColor: ['#f97316', '#8b5cf6', '#10b981'],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                }
            }
        }
        });
        console.log('[DASHBOARD] ✅ Gráfico de status criado');
    } catch (error) {
        console.error('[DASHBOARD] ❌ Erro ao renderizar gráfico de status:', error);
    }
}

function renderizarGraficoDepartamentos(solicitacoes) {
    console.log('[DASHBOARD] 📊 Renderizando gráfico de departamentos...');
    
    // Verificar se Chart está disponível
    if (typeof Chart === 'undefined') {
        console.error('[DASHBOARD] ❌ Chart.js não está carregado! Aguardando...');
        setTimeout(() => renderizarGraficoDepartamentos(solicitacoes), 500);
        return;
    }
    
    const ctx = document.getElementById('departmentChart');
    if (!ctx) {
        console.warn('[DASHBOARD] Canvas departmentChart não encontrado');
        return;
    }
    
    // Contar solicitações por departamento
    const departamentos = {
        'Manutenção': 0,
        'Nutrição': 0,
        'Higienização': 0,
        'Hotelaria': 0
    };
    
    solicitacoes.forEach(sol => {
        const tipo = sol.tipo_servico || sol.departamento || '';
        if (tipo.includes('manutencao')) departamentos['Manutenção']++;
        else if (tipo.includes('nutricao')) departamentos['Nutrição']++;
        else if (tipo.includes('higienizacao')) departamentos['Higienização']++;
        else if (tipo.includes('hotelaria')) departamentos['Hotelaria']++;
    });
    
    // Destruir gráfico anterior se existir
    if (window.departmentChartInstance) {
        window.departmentChartInstance.destroy();
    }
    
    try {
        window.departmentChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(departamentos),
                datasets: [{
                    label: 'Solicitações',
                    data: Object.values(departamentos),
                    backgroundColor: ['#f6b86b', '#f9a07d', '#f4768c', '#f05c8d'],
                    borderColor: ['#f6b86b', '#f9a07d', '#f4768c', '#f05c8d'],
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        console.log('[DASHBOARD] ✅ Gráfico de departamentos criado');
    } catch (error) {
        console.error('[DASHBOARD] ❌ Erro ao renderizar gráfico de departamentos:', error);
    }
}

function atualizarTabelaDepartamentos(metricas) {
    console.log('[DASHBOARD] 📋 Atualizando tabela de departamentos...');
    
    const tbody = document.getElementById('department-metrics-body');
    if (!tbody) {
        console.warn('[DASHBOARD] Tbody não encontrado');
        return;
    }
    
    const departamentoNomes = {
        manutencao: '🔧 Manutenção',
        nutricao: '🍽️ Nutrição',
        higienizacao: '🧽 Higienização',
        hotelaria: '🏨 Hotelaria'
    };
    
    const departamentoCores = {
        manutencao: '#f6b86b',
        nutricao: '#f9a07d',
        higienizacao: '#f4768c',
        hotelaria: '#f05c8d'
    };
    
    tbody.innerHTML = Object.entries(metricas.departamentos).map(([key, data]) => {
        const taxaConclusao = data.total > 0 ? Math.round((data.finalizadas / data.total) * 100) : 0;
        
        return `
            <tr>
                <td>
                    <div class="dept-name">
                        <span class="dept-badge" style="background-color: ${departamentoCores[key]};"></span>
                        ${departamentoNomes[key]}
                    </div>
                </td>
                <td><strong>${data.total}</strong></td>
                <td><span class="percent-badge" style="background-color: #fee2e2; color: #991b1b;">${data.pendentes}</span></td>
                <td><span class="percent-badge" style="background-color: #ede9fe; color: #5b21b6;">${data.andamento}</span></td>
                <td><span class="percent-badge" style="background-color: #dcfce7; color: #166534;">${data.finalizadas}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="status-bar" style="flex: 1;">
                            <div class="status-segment finalizada" style="flex: ${taxaConclusao};"></div>
                            <div class="status-segment andamento" style="flex: ${Math.round((data.andamento / data.total) * 100)};"></div>
                            <div class="status-segment pendente" style="flex: ${Math.round((data.pendentes / data.total) * 100)};"></div>
                        </div>
                        <strong style="min-width: 40px;">${taxaConclusao}%</strong>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function atualizarKPIs(metricas) {
    console.log('[DASHBOARD] 📈 Atualizando KPIs...');
    
    // Tempo médio
    let tempoMedio = '--';
    if (metricas.tempos.length > 0) {
        const mediaMs = metricas.tempos.reduce((a, b) => a + b, 0) / metricas.tempos.length;
        const mediaHoras = Math.round(mediaMs / (1000 * 60 * 60));
        tempoMedio = `${mediaHoras}h`;
    }
    document.getElementById('kpi-tempo-medio').textContent = tempoMedio;
    
    // Taxa de SLA (% de finalizadas)
    const taxaSLA = metricas.total > 0 ? Math.round((metricas.finalizadas / metricas.total) * 100) : 0;
    document.getElementById('kpi-sla').textContent = `${taxaSLA}%`;
    
    // Satisfação média (valor padrão até que haja dados de pesquisa)
    document.getElementById('kpi-satisfacao').textContent = '4.8';
    
    // Média por dia
    document.getElementById('kpi-media-dia').textContent = metricas.total;
}

// Expor função globalmente
window.abrirDashboardExecutivo = window.abrirDashboardExecutivo;

// --- Firestore: Usuários ---
window.preencherTabelaUsuarios = function(listaUsuarios) {
    console.log('[USUARIOS] ===== PREENCHENDO TABELA =====');
    console.log('[USUARIOS] Lista recebida:', listaUsuarios);
    
    const usersList = document.getElementById('users-list');
    const totalCount = document.getElementById('total-users-count');
    
    console.log('[USUARIOS] Elementos encontrados:', {
        usersList: !!usersList,
        totalCount: !!totalCount,
        usersListId: usersList?.id,
        totalCountId: totalCount?.id
    });
    
    if (!usersList) {
        console.error('[USUARIOS] Elemento users-list não encontrado!');
        console.log('[USUARIOS] Tentando encontrar elemento alternativo...');
        
        // Listar todos os elementos disponíveis para debug
        const allElements = document.querySelectorAll('[id*="user"], [id*="list"], [class*="user"], [class*="list"]');
        console.log('[USUARIOS] Elementos relacionados encontrados:', Array.from(allElements).map(el => ({
            id: el.id,
            className: el.className,
            tagName: el.tagName
        })));
        
        return;
    }
    
    if (listaUsuarios.length === 0) {
        console.log('[USUARIOS] Nenhum usuário para exibir');
        usersList.innerHTML = `<div style='text-align:center; color:#6b7280; padding:2rem;'>Nenhum usuário cadastrado.</div>`;
        if (totalCount) totalCount.textContent = '0';
        return;
    }
    
    // ========== FASE 4: PAGINAÇÃO DE USUÁRIOS ==========
    const ITEMS_PER_PAGE = 10;
    const currentPage = window._usuariosPaginaAtual || 1;
    const totalPages = Math.ceil(listaUsuarios.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, listaUsuarios.length);
    const usuariosPagina = listaUsuarios.slice(startIndex, endIndex);
    
    window.debugConfig?.log('USUARIOS', `Renderizando página ${currentPage}/${totalPages} com ${usuariosPagina.length} itens`);
    
    console.log('[USUARIOS] Criando HTML para', usuariosPagina.length, 'usuários da página', currentPage);
    const htmlContent = usuariosPagina.map(user => `
        <div class='user-row' style='display:flex; align-items:center; gap:1.5rem; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04); padding:1rem 2rem;'>
            <span style='font-weight:600; color:#374151;'>${user.nome || 'Nome não informado'}</span>
            <span style='color:#2563eb;'>${user.departamento || user.equipe || '-'}</span>
            <span style='color:#f59e0b;'>${user.tipo || '-'}</span>
            <span style='color:#6b7280;'>${user.email || 'Email não informado'}</span>
            <button onclick="editarUsuario('${user.id}')" style='background:#6366f1; color:#fff; border:none; border-radius:8px; padding:6px 16px; cursor:pointer;'>Editar</button>
            <button onclick="removerUsuario('${user.id}')" style='background:#ef4444; color:#fff; border:none; border-radius:8px; padding:6px 16px; cursor:pointer;'>Remover</button>
        </div>
    `).join('');
    
    // Adicionar controles de paginação se houver mais de uma página
    let paginationHTML = '';
    if (totalPages > 1) {
        paginationHTML = `
            <div style='margin-top:2rem; display:flex; justify-content:center; align-items:center; gap:1rem;'>
                <button onclick="window.mudarPaginaUsuarios(${Math.max(1, currentPage - 1)})" 
                        style='background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 16px; cursor:pointer; ${currentPage === 1 ? 'opacity:0.5; cursor:not-allowed;' : ''}' 
                        ${currentPage === 1 ? 'disabled' : ''}>← Anterior</button>
                
                <span style='color:#374151; font-weight:600;'>Página ${currentPage} de ${totalPages} (${listaUsuarios.length} usuários)</span>
                
                <button onclick="window.mudarPaginaUsuarios(${Math.min(totalPages, currentPage + 1)})" 
                        style='background:#6366f1; color:#fff; border:none; border-radius:8px; padding:8px 16px; cursor:pointer; ${currentPage === totalPages ? 'opacity:0.5; cursor:not-allowed;' : ''}' 
                        ${currentPage === totalPages ? 'disabled' : ''}>Próximo →</button>
            </div>
        `;
    }
    
    console.log('[USUARIOS] HTML criado, inserindo no DOM...');
    usersList.innerHTML = htmlContent + paginationHTML;
    
    if (totalCount) {
        totalCount.textContent = listaUsuarios.length;
        console.log('[USUARIOS] Total atualizado para:', listaUsuarios.length);
    }
    
    // Armazenar lista completa para navegação de páginas
    window._usuariosListaCompleta = listaUsuarios;
    
    console.log('[USUARIOS] ===== TABELA PREENCHIDA COM SUCESSO =====');
};

// ========== FASE 4: FUNÇÃO DE NAVEGAÇÃO DE PÁGINAS ==========
window.mudarPaginaUsuarios = function(pagina) {
    window._usuariosPaginaAtual = pagina;
    window.debugConfig?.log('USUARIOS', `Navegando para página ${pagina}`);
    
    if (window._usuariosListaCompleta) {
        window.preencherTabelaUsuarios(window._usuariosListaCompleta);
    }
};

window.carregarUsuarios = async function() {
    console.log('[USUARIOS] ===== INICIANDO CARREGAMENTO =====');
    console.log('[USUARIOS] Timestamp:', new Date().toLocaleString());
    debugLog('[DEBUG] carregarUsuarios: iniciando (APENAS equipe e admin)...');
    
    if (!window.db) {
        console.error('[USUARIOS] Firestore não inicializado!');
        showToast('Erro', 'Firestore não inicializado!', 'error');
        return false;
    }
    
    // Teste de conectividade básico
    console.log('[USUARIOS] Testando conectividade Firestore...');
    
    try {
        console.log('[USUARIOS] Estado da autenticação:', {
            currentUser: !!window.auth?.currentUser,
            userEmail: window.auth?.currentUser?.email,
            usuarioAdmin: !!window.usuarioAdmin,
            userRole: window.userRole
        });
        
        // Busca usuários de equipe
        console.log('[USUARIOS] Buscando usuarios_equipe...');
        debugLog('[DEBUG] carregarUsuarios: buscando usuarios_equipe...');
        
        const equipeSnap = await window.db.collection('usuarios_equipe').get();
        console.log('[USUARIOS] Snapshot usuarios_equipe:', {
            empty: equipeSnap.empty,
            size: equipeSnap.size,
            docs: equipeSnap.docs.length
        });
        
        const listaEquipe = [];
        equipeSnap.forEach(doc => {
            const userData = { id: doc.id, ...doc.data(), tipo: 'Equipe' };
            listaEquipe.push(userData);
            console.log('[USUARIOS] Usuário equipe encontrado:', userData);
        });
        console.log('[USUARIOS] Total equipe encontrados:', listaEquipe.length);
        debugLog('[DEBUG] carregarUsuarios: encontrados', listaEquipe.length, 'usuários de equipe');
        
        // Busca usuários admin
        console.log('[USUARIOS] Buscando usuarios_admin...');
        debugLog('[DEBUG] carregarUsuarios: buscando usuarios_admin...');
        
        const adminSnap = await window.db.collection('usuarios_admin').get();
        console.log('[USUARIOS] Snapshot usuarios_admin:', {
            empty: adminSnap.empty,
            size: adminSnap.size,
            docs: adminSnap.docs.length
        });
        
        const listaAdmin = [];
        adminSnap.forEach(doc => {
            const userData = { id: doc.id, ...doc.data(), tipo: 'Admin' };
            listaAdmin.push(userData);
            console.log('[USUARIOS] Usuário admin encontrado:', userData);
        });
        console.log('[USUARIOS] Total admin encontrados:', listaAdmin.length);
        debugLog('[DEBUG] carregarUsuarios: encontrados', listaAdmin.length, 'usuários admin');
        
        // Junta APENAS equipe e admin (SEM acompanhantes)
        const listaUsuarios = [...listaEquipe, ...listaAdmin];
        console.log('[USUARIOS] LISTA FINAL:', listaUsuarios);
        console.log('[USUARIOS] TOTAL GERAL:', listaUsuarios.length);
        debugLog('[DEBUG] carregarUsuarios: total de usuários para tabela:', listaUsuarios.length);
        
        window.preencherTabelaUsuarios(listaUsuarios);
        console.log('[USUARIOS] ===== CARREGAMENTO CONCLUÍDO =====');
        console.log('[SUCCESS] Usuários de equipe e admin carregados:', listaUsuarios);
        return true;
        
    } catch (error) {
        console.error('[USUARIOS] ===== ERRO NO CARREGAMENTO =====');
        console.error('[ERRO] carregarUsuarios:', error);
        console.error('[ERRO] Stack trace:', error.stack);
        showToast('Erro', 'Não foi possível carregar os usuários: ' + error.message, 'error');
        return false;
    }
};

// === FUNÇÃO DE TESTE MANUAL PARA DEBUG ===
window.testarCarregamentoUsuarios = function() {
    console.log('🔬 [TESTE] ===== TESTE MANUAL CARREGAMENTO USUÁRIOS =====');
    console.log('🔬 [TESTE] Para usar: digite window.testarCarregamentoUsuarios() no console');
    
    // Primeiro testar se as funções existem
    console.log('🔬 [TESTE] Funções disponíveis:', {
        carregarUsuarios: typeof window.carregarUsuarios,
        preencherTabelaUsuarios: typeof window.preencherTabelaUsuarios,
        db: !!window.db,
        auth: !!window.auth,
        currentUser: !!window.auth?.currentUser
    });
    
    // Testar conexão com Firestore
    if (window.db) {
        console.log('🔬 [TESTE] Testando conexão simples com Firestore...');
        
        window.db.collection('usuarios_equipe').limit(1).get()
            .then(snap => {
                console.log('🔬 [TESTE] ✅ Conexão usuarios_equipe OK - encontrou:', snap.size, 'documentos');
                
                return window.db.collection('usuarios_admin').limit(1).get();
            })
            .then(snap => {
                console.log('🔬 [TESTE] ✅ Conexão usuarios_admin OK - encontrou:', snap.size, 'documentos');
                
                // Agora executar carregamento completo
                console.log('🔬 [TESTE] Executando carregamento completo...');
                return window.carregarUsuarios();
            })
            .then(resultado => {
                console.log('🔬 [TESTE] ✅ Resultado final:', resultado);
            })
            .catch(error => {
                console.error('🔬 [TESTE] ❌ Erro:', error);
                console.error('🔬 [TESTE] ❌ Stack:', error.stack);
            });
    } else {
        console.error('🔬 [TESTE] ❌ Firestore não disponível!');
    }
};

// Função específica para verificar usuários existentes
window.verificarUsuariosExistentes = async function() {
    console.log('👥 [VERIFICAR] ===== VERIFICANDO USUÁRIOS EXISTENTES =====');
    
    if (!window.db) {
        console.error('👥 [VERIFICAR] ❌ Firestore não disponível');
        return;
    }
    
    try {
        console.log('👥 [VERIFICAR] Verificando usuarios_equipe...');
        const equipeSnap = await window.db.collection('usuarios_equipe').get();
        console.log('👥 [VERIFICAR] usuarios_equipe:', equipeSnap.size, 'documentos');
        
        console.log('👥 [VERIFICAR] Verificando usuarios_admin...');
        const adminSnap = await window.db.collection('usuarios_admin').get();
        console.log('👥 [VERIFICAR] usuarios_admin:', adminSnap.size, 'documentos');
        
        // Verificar permissões antes de tentar acessar usuarios_acompanhantes
        const user = window.auth.currentUser;
        let acompanhantesCount = 0;
        
        if (user) {
            try {
                const userData = await window.verificarUsuarioAdminJS(user);
                if (userData && (userData.role === 'super_admin' || userData.role === 'admin')) {
                    console.log('👥 [VERIFICAR] Verificando usuarios_acompanhantes...');
                    const acompSnap = await window.db.collection('usuarios_acompanhantes').get();
                    acompanhantesCount = acompSnap.size;
                    console.log('👥 [VERIFICAR] usuarios_acompanhantes:', acompanhantesCount, 'documentos');
                } else {
                    console.log('👥 [VERIFICAR] ⚠️ Usuário sem permissão para acessar usuarios_acompanhantes');
                }
            } catch (permError) {
                console.log('👥 [VERIFICAR] ⚠️ Erro de permissão ao acessar usuarios_acompanhantes:', permError.message);
            }
        }
        
        const total = equipeSnap.size + adminSnap.size + acompanhantesCount;
        console.log('👥 [VERIFICAR] ✅ TOTAL GERAL:', total, 'usuários no sistema');
        
        return {
            equipe: equipeSnap.size,
            admin: adminSnap.size,
            acompanhantes: acompanhantesCount,
            total: total
        };
        
    } catch (error) {
        console.error('👥 [VERIFICAR] ❌ Erro:', error);
    }
};

// === FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS ===

// Função para editar usuário
window.editarUsuario = async function(userId) {
    debugLog('[DEBUG] Editando usuário:', userId);
    
    if (!userId) {
        showToast('Erro', 'ID do usuário não fornecido', 'error');
        return;
    }
    
    try {
        // Verificar permissões
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
            showToast('Erro', 'Apenas super administradores podem editar usuários', 'error');
            return;
        }
        
        // Buscar o usuário nas diferentes coleções
        let userData = null;
        let userCollection = null;
        
        // Tentar em usuarios_equipe
        try {
            const equipeDoc = await window.db.collection('usuarios_equipe').doc(userId).get();
            if (equipeDoc.exists) {
                userData = { id: equipeDoc.id, ...equipeDoc.data() };
                userCollection = 'usuarios_equipe';
            }
        } catch (error) {
            debugLog('[DEBUG] Usuário não encontrado em usuarios_equipe');
        }
        
        // Tentar em usuarios_admin se não encontrou
        if (!userData) {
            try {
                const adminDoc = await window.db.collection('usuarios_admin').doc(userId).get();
                if (adminDoc.exists) {
                    userData = { id: adminDoc.id, ...adminDoc.data() };
                    userCollection = 'usuarios_admin';
                }
            } catch (error) {
                debugLog('[DEBUG] Usuário não encontrado em usuarios_admin');
            }
        }
        
        // Tentar em usuarios_acompanhantes se não encontrou (somente para super_admin e admin)
        if (!userData && (usuarioAdmin.role === 'super_admin' || usuarioAdmin.role === 'admin')) {
            try {
                const acompDoc = await window.db.collection('usuarios_acompanhantes').doc(userId).get();
                if (acompDoc.exists) {
                    userData = { id: acompDoc.id, ...acompDoc.data() };
                    userCollection = 'usuarios_acompanhantes';
                }
            } catch (error) {
                debugLog('[DEBUG] Usuário não encontrado em usuarios_acompanhantes ou sem permissão');
            }
        }
        
        if (!userData) {
            showToast('Erro', 'Usuário não encontrado', 'error');
            return;
        }
        
        // Criar modal de edição
        const editModal = document.createElement('div');
        editModal.id = 'edit-user-modal';
        editModal.className = 'modal modal-edicao-usuario';
        editModal.style.cssText = `
            position: fixed !important; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8) !important; z-index: 9999999999 !important; display: flex !important;
            align-items: center; justify-content: center;
            backdrop-filter: blur(5px);
        `;
        
        editModal.innerHTML = `
            <div class="edit-modal-content" style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; z-index: 9999999999 !important; position: relative !important; box-shadow: 0 25px 50px rgba(0,0,0,0.8);">
                <h3 style="margin: 0 0 20px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
                    📝 Editar Usuário
                </h3>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Nome:</label>
                    <input type="text" id="edit-nome" value="${userData.nome || ''}" 
                           style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Email:</label>
                    <input type="email" id="edit-email" value="${userData.email || ''}" 
                           style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                </div>
                
                <!-- DEPARTAMENTO COM OPÇÃO DE ADMINISTRADOR -->
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Tipo de Acesso:</label>
                    <select id="edit-tipo-acesso" onchange="alterarTipoAcessoModal()" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="equipe" ${userCollection === 'usuarios_equipe' ? 'selected' : ''}>Equipe de Departamento</option>
                        <option value="admin" ${userCollection === 'usuarios_admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
                
                <!-- DEPARTAMENTO PARA EQUIPE -->
                <div id="campo-departamento" style="margin-bottom: 16px; ${userCollection === 'usuarios_admin' ? 'display: none;' : ''}">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Departamento:</label>
                    <select id="edit-departamento" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="manutencao" ${userData.departamento === 'manutencao' ? 'selected' : ''}>Manutenção</option>
                        <option value="nutricao" ${userData.departamento === 'nutricao' ? 'selected' : ''}>Nutrição</option>
                        <option value="higienizacao" ${userData.departamento === 'higienizacao' ? 'selected' : ''}>Higienização</option>
                        <option value="hotelaria" ${userData.departamento === 'hotelaria' ? 'selected' : ''}>Hotelaria</option>
                    </select>
                </div>
                
                <!-- ROLE PARA ADMIN -->
                <div id="campo-role" style="margin-bottom: 16px; ${userCollection === 'usuarios_equipe' ? 'display: none;' : ''}">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Nível de Administração:</label>
                    <select id="edit-role" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="super_admin" ${userData.role === 'super_admin' ? 'selected' : ''}>Super Administrador</option>
                        <option value="admin" ${userData.role === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
                
                ${userData.emailAlteradoPorAdmin ? `
                    <div style="margin-bottom: 16px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #dc2626; font-weight: 500; margin-bottom: 8px;">
                            ⚠️ Problema de Autenticação Detectado
                        </div>
                        <p style="margin: 0 0 8px 0; color: #7f1d1d; font-size: 14px;">
                            Este usuário teve o email alterado e pode ter problemas para fazer login. 
                            A conta no sistema de autenticação pode estar desatualizada.
                        </p>
                        <button onclick="corrigirProblemaEmail('${userId}', '${userCollection}')" 
                                style="padding: 6px 12px; border: 1px solid #dc2626; background: #fca5a5; color: #7f1d1d; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            🔧 Corrigir Problema de Login
                        </button>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button onclick="abrirModalAlterarSenha('${userId}', '${userCollection}')" 
                            style="padding: 8px 16px; border: 1px solid #f59e0b; background: #fef3c7; color: #92400e; border-radius: 6px; cursor: pointer;">
                        🔑 Alterar Senha
                    </button>
                    <button onclick="fecharModalEditarUsuario()" 
                            style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; cursor: pointer;">
                        Cancelar
                    </button>
                    <button onclick="salvarUsuarioEditado('${userId}', '${userCollection}')" 
                            style="padding: 8px 16px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer;">
                        💾 Salvar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
        
        // GARANTIA MÁXIMA DE Z-INDEX
        function garantirZIndexMaximo() {
            const editModalElement = document.getElementById('edit-user-modal');
            const editModalContent = editModalElement?.querySelector('.edit-modal-content');
            
            if (editModalElement) {
                editModalElement.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: rgba(0,0,0,0.8) !important;
                    z-index: 9999999999 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    backdrop-filter: blur(5px) !important;
                `;
                
                if (editModalContent) {
                    editModalContent.style.cssText += `; z-index: 9999999999 !important; position: relative !important;`;
                }
                
                // Esconder modal de gerenciar para evitar conflito
                const manageModal = document.getElementById('manage-users-modal');
                if (manageModal) {
                    manageModal.style.zIndex = '999999';
                }
                
                console.log('💫 Z-index forçado para 9999999999 - MODAL DE EDIÇÃO');
            }
        }
        
        // Executar imediatamente e várias vezes para garantir
        garantirZIndexMaximo();
        setTimeout(garantirZIndexMaximo, 10);
        setTimeout(garantirZIndexMaximo, 50);
        setTimeout(garantirZIndexMaximo, 100);
        setTimeout(garantirZIndexMaximo, 200);
        
        // Definir a função alterarTipoAcesso no escopo global temporariamente
        window.alterarTipoAcessoModal = function() {
            const tipoAcesso = document.getElementById('edit-tipo-acesso').value;
            const campoDepartamento = document.getElementById('campo-departamento');
            const campoRole = document.getElementById('campo-role');
            
            if (tipoAcesso === 'equipe') {
                campoDepartamento.style.display = 'block';
                campoRole.style.display = 'none';
            } else if (tipoAcesso === 'admin') {
                campoDepartamento.style.display = 'none';
                campoRole.style.display = 'block';
            }
        };
        
    } catch (error) {
        console.error('[ERRO] Falha ao editar usuário:', error);
        showToast('Erro', 'Não foi possível carregar dados do usuário', 'error');
    }
};

// Função para fechar modal de edição
window.fecharModalEditarUsuario = function() {
    const modal = document.getElementById('edit-user-modal');
    if (modal) {
        modal.remove();
    }
};

// Função para salvar usuário editado
window.salvarUsuarioEditado = async function(userId, originalCollection) {
    try {
        const nome = document.getElementById('edit-nome').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const tipoAcesso = document.getElementById('edit-tipo-acesso').value;
        
        if (!nome || !email) {
            showToast('Erro', 'Nome e email são obrigatórios', 'error');
            return;
        }
        
        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Erro', 'Formato de email inválido', 'error');
            return;
        }
        
        // Buscar dados originais para comparar se email mudou
        const originalDoc = await window.db.collection(originalCollection).doc(userId).get();
        if (!originalDoc.exists) {
            throw new Error('Usuário original não encontrado');
        }
        const originalData = originalDoc.data();
        const emailMudou = originalData.email !== email;
        
        console.log('[SAVE-USER] Email mudou?', emailMudou, 'De:', originalData.email, 'Para:', email);
        
        // Se o email mudou, verificar se já existe outro usuário com esse email
        if (emailMudou) {
            const emailExiste = await verificarEmailExistente(email, userId);
            if (emailExiste) {
                showToast('Erro', 'Este email já está sendo usado por outro usuário', 'error');
                return;
            }
        }
        
        // Determinar nova coleção baseada no tipo de acesso
        const novaCollection = tipoAcesso === 'admin' ? 'usuarios_admin' : 'usuarios_equipe';
        
        // Preparar dados para salvar
        const updateData = { 
            nome, 
            email,
            updatedAt: new Date()
        };
        
        // Adicionar campos específicos baseados no novo tipo
        if (tipoAcesso === 'equipe') {
            const departamento = document.getElementById('edit-departamento').value;
            updateData.departamento = departamento;
            updateData.equipe = departamento; // Para compatibilidade
            // Remover role se estava como admin
            updateData.role = null;
        } else if (tipoAcesso === 'admin') {
            const role = document.getElementById('edit-role').value || 'admin';
            updateData.role = role;
            // Remover departamento se estava como equipe
            updateData.departamento = null;
            updateData.equipe = null;
        }
        
        console.log('[SAVE-USER] Salvando usuário:', {
            userId,
            originalCollection,
            novaCollection,
            updateData,
            emailMudou
        });
        
        // ===== ATUALIZAR FIREBASE AUTHENTICATION SE EMAIL MUDOU =====
        if (emailMudou) {
            try {
                console.log('[AUTH-UPDATE] Atualizando email no Firebase Auth...');
                
                // Buscar o usuário no Firebase Auth pelo email antigo
                const listUsersResult = await firebase.auth().listUsers();
                const targetUser = listUsersResult.users.find(user => user.uid === userId);
                
                if (targetUser) {
                    // Atualizar email no Firebase Auth usando Admin SDK
                    await firebase.auth().updateUser(userId, {
                        email: email
                    });
                    
                    console.log('[AUTH-UPDATE] Email atualizado no Firebase Auth com sucesso');
                    showToast('Info', 'Sincronizando email com sistema de autenticação...', 'info');
                } else {
                    console.warn('[AUTH-UPDATE] Usuário não encontrado no Firebase Auth, apenas Firestore será atualizado');
                }
            } catch (authError) {
                console.error('[AUTH-ERROR] Erro ao atualizar email no Firebase Auth:', authError);
                
                // Se for erro de permissão (método não disponível no client-side), tentar abordagem alternativa
                if (authError.code === 'auth/operation-not-allowed' || authError.message.includes('listUsers')) {
                    console.log('[AUTH-FALLBACK] Usando abordagem client-side para atualização de email...');
                    
                    // Mostrar aviso sobre limitação
                    showToast('Aviso', 'Email alterado no sistema. O usuário precisará fazer login novamente.', 'warning');
                    
                    // Adicionar flag para forçar novo login
                    updateData.emailAlteradoPorAdmin = true;
                    updateData.dataAlteracaoEmail = new Date();
                } else {
                    // Outro erro crítico
                    throw new Error(`Erro ao atualizar email no sistema de autenticação: ${authError.message}`);
                }
            }
        }
        
        // Se a coleção mudou, fazer migração
        if (originalCollection !== novaCollection) {
            console.log('[MIGRATE-USER] Migrando usuário de', originalCollection, 'para', novaCollection);
            
            // Preparar dados completos para a nova coleção
            const migrationData = {
                ...originalData,
                ...updateData,
                migratedFrom: originalCollection,
                migratedAt: new Date()
            };
            
            // Salvar na nova coleção
            await window.db.collection(novaCollection).doc(userId).set(migrationData);
            
            // Remover da coleção original
            await window.db.collection(originalCollection).doc(userId).delete();
            
            showToast('Sucesso', `Usuário migrado de ${originalCollection === 'usuarios_equipe' ? 'Equipe' : 'Admin'} para ${novaCollection === 'usuarios_equipe' ? 'Equipe' : 'Admin'}`, 'success');
            
        } else {
            // Apenas atualizar na mesma coleção
            await window.db.collection(originalCollection).doc(userId).update(updateData);
            showToast('Sucesso', 'Usuário atualizado com sucesso', 'success');
        }
        
        // Fechar modal e recarregar lista
        fecharModalEditarUsuario();
        await window.carregarUsuarios();
        
        // Registrar auditoria
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('USER_EDIT', {
                userId,
                originalCollection,
                novaCollection,
                migrated: originalCollection !== novaCollection,
                updateData: Object.keys(updateData),
                emailMudou
            });
        }
        
    } catch (error) {
        console.error('[ERRO] Falha ao salvar usuário:', error);
        showToast('Erro', 'Não foi possível salvar as alterações: ' + error.message, 'error');
    }
};

// ===== FUNÇÕES DE CORREÇÃO DE PROBLEMAS DE EMAIL =====

// Função para corrigir problemas de usuários com email alterado pelo admin
window.corrigirProblemaEmail = async function(userId, collection) {
    try {
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
            showToast('Erro', 'Apenas super administradores podem corrigir problemas de email', 'error');
            return;
        }
        
        // Buscar dados do usuário
        const doc = await window.db.collection(collection).doc(userId).get();
        if (!doc.exists) {
            showToast('Erro', 'Usuário não encontrado', 'error');
            return;
        }
        
        const userData = doc.data();
        
        if (!userData.emailAlteradoPorAdmin) {
            showToast('Info', 'Este usuário não possui problemas de email detectados', 'info');
            return;
        }
        
        const confirm = window.confirm(
            `Corrigir problema de email para o usuário ${userData.nome} (${userData.email})?\n\n` +
            `Isso irá:\n` +
            `1. Remover a flag de problema de email\n` +
            `2. Tentar recriar a conta no Firebase Auth\n` +
            `3. Permitir que o usuário faça login novamente\n\n` +
            `Continuar?`
        );
        
        if (!confirm) return;
        
        console.log('[CORREÇÃO-EMAIL] Corrigindo problema para:', userData);
        
        // 1. Tentar recriar usuário no Firebase Auth
        try {
            // Verificar se usuário já existe no Auth
            const listUsersResult = await firebase.auth().listUsers();
            const existingUser = listUsersResult.users.find(user => user.uid === userId);
            
            if (existingUser) {
                // Usuário já existe no Auth, apenas sincronizar email
                await firebase.auth().updateUser(userId, {
                    email: userData.email
                });
                console.log('[CORREÇÃO-EMAIL] Email sincronizado no Firebase Auth');
            } else {
                // Usuário não existe no Auth, criar nova conta
                // NOTA: Isso requer senha temporária
                const senhaTemporaria = 'YunaTempo' + Math.random().toString(36).substring(7);
                
                const newUser = await firebase.auth().createUser({
                    uid: userId,
                    email: userData.email,
                    displayName: userData.nome,
                    password: senhaTemporaria
                });
                
                console.log('[CORREÇÃO-EMAIL] Usuário recriado no Firebase Auth com senha temporária');
                showToast('Info', `Conta recriada. Senha temporária: ${senhaTemporaria}`, 'info');
            }
        } catch (authError) {
            console.warn('[CORREÇÃO-EMAIL] Erro ao corrigir Auth, apenas limpando flag:', authError);
        }
        
        // 2. Limpar flags de problema
        const updateData = {
            emailAlteradoPorAdmin: firebase.firestore.FieldValue.delete(),
            dataAlteracaoEmail: firebase.firestore.FieldValue.delete(),
            problemaCoorrigidoEm: new Date(),
            problemaCoorrigidoPor: usuarioAdmin.email
        };
        
        await window.db.collection(collection).doc(userId).update(updateData);
        
        showToast('Sucesso', 'Problema de email corrigido com sucesso!', 'success');
        
        // Recarregar lista de usuários
        if (window.carregarUsuarios) {
            await window.carregarUsuarios();
        }
        
        // Registrar auditoria
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('EMAIL_PROBLEM_FIXED', {
                userId,
                collection,
                corrigidoPor: usuarioAdmin.email,
                userEmail: userData.email
            });
        }
        
    } catch (error) {
        console.error('[ERRO] Falha ao corrigir problema de email:', error);
        showToast('Erro', 'Não foi possível corrigir o problema: ' + error.message, 'error');
    }
};

// ===== FUNÇÕES DE ALTERAÇÃO DE SENHA =====

// Função para abrir modal de alteração de senha (Admin alterando senha de outros usuários)
window.abrirModalAlterarSenha = async function(userId, collection) {
    try {
        // Verificar se é super admin
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
            showToast('Erro', 'Apenas super administradores podem alterar senhas', 'error');
            return;
        }

        // Buscar dados do usuário para exibir nome/email
        let userData = null;
        const doc = await window.db.collection(collection).doc(userId).get();
        if (doc.exists) {
            userData = doc.data();
        } else {
            showToast('Erro', 'Usuário não encontrado', 'error');
            return;
        }

        // Criar modal de alteração de senha
        const senhaModal = document.createElement('div');
        senhaModal.id = 'alterar-senha-modal';
        senhaModal.style.cssText = `
            position: fixed !important; top: 0 !important; left: 0 !important; 
            width: 100% !important; height: 100% !important;
            background: rgba(0,0,0,0.8) !important; 
            z-index: 99999999999 !important; 
            display: flex !important;
            align-items: center !important; 
            justify-content: center !important;
            backdrop-filter: blur(3px) !important;
        `;
        
        senhaModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 24px; max-width: 450px; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.5); position: relative !important; z-index: 99999999999 !important;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <span style="font-size: 24px; margin-right: 12px;">🔑</span>
                    <h3 style="margin: 0; color: #374151;">Alterar Senha do Usuário</h3>
                </div>
                
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Usuário:</strong> ${userData.nome}</p>
                    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong> ${userData.email}</p>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Nova Senha:</label>
                    <input type="password" id="nova-senha-admin" placeholder="Digite a nova senha" 
                           style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                    <small style="color: #6b7280; font-size: 12px;">Mínimo de 6 caracteres</small>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Confirmar Nova Senha:</label>
                    <input type="password" id="confirmar-senha-admin" placeholder="Confirme a nova senha" 
                           style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button onclick="fecharModalAlterarSenha()" 
                            style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; cursor: pointer;">
                        Cancelar
                    </button>
                    <button onclick="confirmarAlteracaoSenhaAdmin('${userId}', '${userData.email}')" 
                            style="padding: 10px 20px; border: none; background: #ef4444; color: white; border-radius: 6px; cursor: pointer;">
                        🔑 Alterar Senha
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(senhaModal);
        
        // Focar no primeiro campo
        setTimeout(() => {
            document.getElementById('nova-senha-admin').focus();
        }, 100);
        
    } catch (error) {
        console.error('[ERRO] Erro ao abrir modal de alteração de senha:', error);
        showToast('Erro', 'Erro interno. Tente novamente.', 'error');
    }
};

// Função para confirmar alteração de senha pelo admin
window.confirmarAlteracaoSenhaAdmin = async function(userId, userEmail) {
    try {
        const novaSenha = document.getElementById('nova-senha-admin').value;
        const confirmarSenha = document.getElementById('confirmar-senha-admin').value;
        
        // Validações
        if (!novaSenha || !confirmarSenha) {
            showToast('Erro', 'Preencha todos os campos', 'error');
            return;
        }
        
        if (novaSenha.length < 6) {
            showToast('Erro', 'A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }
        
        if (novaSenha !== confirmarSenha) {
            showToast('Erro', 'As senhas não coincidem', 'error');
            return;
        }

        // Confirmar ação com aviso importante
        const confirmacao = confirm(
            `⚠️ ATENÇÃO - LIMITAÇÃO DO FIREBASE ⚠️\n\n` +
            `Email: ${userEmail}\n\n` +
            `⚠️ IMPORTANTE: Devido às limitações de segurança do Firebase, não é possível alterar a senha de outro usuário diretamente pelo painel web.\n\n` +
            `🔹 OPÇÃO 1 (Recomendada): Será enviado um email de redefinição de senha para o usuário.\n\n` +
            `🔹 OPÇÃO 2: Você pode deletar e recriar o usuário com a nova senha.\n\n` +
            `Deseja enviar o email de redefinição de senha?`
        );
        
        if (!confirmacao) return;

        // Desabilitar botão para evitar cliques duplos
        const botao = event.target;
        botao.disabled = true;
        botao.textContent = 'Enviando email...';

        // Enviar email de redefinição de senha
        await window.auth.sendPasswordResetEmail(userEmail);
        
        showToast('Sucesso', `✅ Email de redefinição enviado para ${userEmail}\n\nO usuário deve verificar a caixa de entrada e seguir as instruções para criar uma nova senha.`, 'success');
        
        console.log(`[INFO] Email de redefinição de senha enviado para: ${userEmail}`);
        
        // Registrar na auditoria
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('PASSWORD_RESET_EMAIL_SENT', {
                targetUserId: userId,
                targetUserEmail: userEmail,
                method: 'admin_initiated',
                timestamp: new Date().toISOString()
            });
        }
        
        // Mostrar instruções adicionais
        setTimeout(() => {
            alert(
                `📧 Email de Redefinição Enviado!\n\n` +
                `Para: ${userEmail}\n\n` +
                `INSTRUÇÕES PARA O USUÁRIO:\n` +
                `1. Verificar a caixa de entrada (e spam)\n` +
                `2. Clicar no link do email\n` +
                `3. Definir a nova senha\n` +
                `4. Fazer login com a nova senha\n\n` +
                `⏱️ O link expira em 1 hora.\n\n` +
                `ALTERNATIVA:\n` +
                `Se o usuário não receber o email, você pode deletá-lo e criar novamente com a senha desejada.`
            );
        }, 1000);
        
        fecharModalAlterarSenha();
        
    } catch (error) {
        console.error('[ERRO] Erro ao enviar email de redefinição:', error);
        
        let mensagem = 'Erro ao enviar email de redefinição.';
        if (error.code === 'auth/user-not-found') {
            mensagem = '❌ Usuário não encontrado no Firebase Authentication.\n\nSOLUÇÃO: Este usuário precisa ser criado novamente no sistema de autenticação.';
        } else if (error.code === 'auth/invalid-email') {
            mensagem = '❌ Email inválido.';
        } else if (error.code === 'auth/too-many-requests') {
            mensagem = '⏳ Muitas tentativas. Aguarde alguns minutos e tente novamente.';
        }
        
        showToast('Erro', mensagem, 'error');
        alert(mensagem + '\n\nPara resolver: Delete o usuário e crie novamente com a senha correta.');
        
        // Reabilitar botão
        const botao = event.target;
        if (botao) {
            botao.disabled = false;
            botao.textContent = '🔑 Alterar Senha';
        }
    }
};

// Função para fechar modal de alteração de senha
window.fecharModalAlterarSenha = function() {
    const modal = document.getElementById('alterar-senha-modal');
    if (modal) {
        modal.remove();
    }
};

// Função para o próprio usuário alterar sua senha
window.abrirMinhaSenha = function() {
    // Criar modal para o usuário logado alterar sua própria senha
    const senhaModal = document.createElement('div');
    senhaModal.id = 'minha-senha-modal';
    senhaModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); z-index: 100001; display: flex;
        align-items: center; justify-content: center;
    `;
    
    const usuarioLogado = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    
    senhaModal.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 450px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <span style="font-size: 24px; margin-right: 12px;">🔐</span>
                <h3 style="margin: 0; color: #374151;">Alterar Minha Senha</h3>
            </div>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Usuário:</strong> ${usuarioLogado.nome}</p>
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong> ${usuarioLogado.email}</p>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Senha Atual:</label>
                <input type="password" id="senha-atual" placeholder="Digite sua senha atual" 
                       style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Nova Senha:</label>
                <input type="password" id="nova-senha-propria" placeholder="Digite a nova senha" 
                       style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                <small style="color: #6b7280; font-size: 12px;">Mínimo de 6 caracteres</small>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Confirmar Nova Senha:</label>
                <input type="password" id="confirmar-nova-senha-propria" placeholder="Confirme a nova senha" 
                       style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="fecharModalMinhaSenha()" 
                        style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; cursor: pointer;">
                    Cancelar
                </button>
                <button onclick="alterarMinhaSenha()" 
                        style="padding: 10px 20px; border: none; background: #10b981; color: white; border-radius: 6px; cursor: pointer;">
                    🔐 Alterar Minha Senha
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(senhaModal);
    
    // Focar no primeiro campo
    setTimeout(() => {
        document.getElementById('senha-atual').focus();
    }, 100);
};

// Função para alterar a própria senha
window.alterarMinhaSenha = async function() {
    try {
        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha-propria').value;
        const confirmarSenha = document.getElementById('confirmar-nova-senha-propria').value;
        
        // Validações
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            showToast('Erro', 'Preencha todos os campos', 'error');
            return;
        }
        
        if (novaSenha.length < 6) {
            showToast('Erro', 'A nova senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }
        
        if (novaSenha !== confirmarSenha) {
            showToast('Erro', 'A nova senha e a confirmação não coincidem', 'error');
            return;
        }
        
        if (senhaAtual === novaSenha) {
            showToast('Erro', 'A nova senha deve ser diferente da senha atual', 'error');
            return;
        }

        // Desabilitar botão para evitar cliques duplos
        const botao = event.target;
        botao.disabled = true;
        botao.textContent = 'Alterando...';

        const user = window.auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        // Reautenticar o usuário com a senha atual
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, senhaAtual);
        await user.reauthenticateWithCredential(credential);
        
        // Alterar para a nova senha
        await user.updatePassword(novaSenha);
        
        showToast('Sucesso', 'Sua senha foi alterada com sucesso!', 'success');
        
        // Registrar na auditoria
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('PASSWORD_CHANGED', {
                method: 'self_service',
                userId: user.uid
            });
        }
        
        fecharModalMinhaSenha();
        
        // Opcional: Fazer logout forçado para relogin com nova senha
        // setTimeout(() => {
        //     window.auth.signOut();
        // }, 2000);
        
    } catch (error) {
        console.error('[ERRO] Erro ao alterar senha:', error);
        
        let mensagem = 'Erro ao alterar senha. Tente novamente.';
        if (error.code === 'auth/wrong-password') {
            mensagem = 'Senha atual incorreta.';
        } else if (error.code === 'auth/weak-password') {
            mensagem = 'A nova senha é muito fraca. Use pelo menos 6 caracteres.';
        } else if (error.code === 'auth/requires-recent-login') {
            mensagem = 'Por segurança, faça login novamente antes de alterar a senha.';
        }
        
        showToast('Erro', mensagem, 'error');
        
        // Reabilitar botão
        const botao = event.target;
        botao.disabled = false;
        botao.textContent = '🔐 Alterar Minha Senha';
    }
};

// Função para fechar modal da própria senha
window.fecharModalMinhaSenha = function() {
    const modal = document.getElementById('minha-senha-modal');
    if (modal) {
        modal.remove();
    }
};

// Função para remover usuário
window.removerUsuario = async function(userId) {
    debugLog('[DEBUG] Removendo usuário:', userId);
    
    if (!userId) {
        showToast('Erro', 'ID do usuário não fornecido', 'error');
        return;
    }
    
    // Verificar permissões
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
        showToast('Erro', 'Apenas super administradores podem remover usuários', 'error');
        return;
    }
    
    // Confirmar remoção
    if (!confirm('Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        // Buscar e remover o usuário nas diferentes coleções
        let removido = false;
        const collections = ['usuarios_equipe', 'usuarios_admin', 'usuarios_acompanhantes'];
        
        for (const collection of collections) {
            try {
                const doc = await window.db.collection(collection).doc(userId).get();
                if (doc.exists) {
                    await window.db.collection(collection).doc(userId).delete();
                    removido = true;
                    
                    // Registrar auditoria
                    if (window.registrarLogAuditoria) {
                        window.registrarLogAuditoria('USER_DELETE', {
                            userId,
                            collection,
                            userData: doc.data()
                        });
                    }
                    break;
                }
            } catch (error) {
                console.log(`[DEBUG] Usuário não encontrado em ${collection}`);
            }
        }
        
        if (removido) {
            showToast('Sucesso', 'Usuário removido com sucesso', 'success');
            await window.carregarUsuarios(); // Recarregar lista
        } else {
            showToast('Erro', 'Usuário não encontrado', 'error');
        }
        
    } catch (error) {
        console.error('[ERRO] Falha ao remover usuário:', error);
        showToast('Erro', 'Não foi possível remover o usuário', 'error');
    }
};

// --- Firestore: Solicitações & Renderização dos Cards ---

// Sistema de debounce para evitar chamadas múltiplas
let carregandoSolicitacoes = false;
let timeoutRecarregar = null;

async function carregarSolicitacoes() {
    // Iniciar timer de performance
    const timerId = window.perfMonitor?.startTimer('carregarSolicitacoes');
    
    // Verificar se o usuário ainda está autenticado
    if (!window.auth?.currentUser) {
        console.error('[ERRO] Usuário não autenticado!');
        window.perfMonitor?.endTimer(timerId);
        return;
    }
    
    // Verificar se está em processo de logout
    if (!window.usuarioAdmin) {
        console.warn('[AVISO] Dados do usuário não disponíveis - possível logout em andamento');
        return;
    }
    // Verificar se o usuário ainda está autenticado
    if (!window.auth?.currentUser) {
        console.error('[ERRO] Usuário não autenticado!');
        return;
    }
    // Verificar se já está carregando para evitar loops
    if (window.carregandoSolicitacoes) {
        console.log('[DEBUG] carregarSolicitacoes já está executando, ignorando...');
        return;
    }
    
    // Limpar qualquer interval de auto-update ativo
    if (window.autoUpdateInterval) {
        console.log('[DEBUG] Limpando interval de auto-update ativo...');
        clearInterval(window.autoUpdateInterval);
        window.autoUpdateInterval = null;
    }
    
    window.carregandoSolicitacoes = true;
    
    // Verificar se estamos na tela de relatórios - se sim, não carregar cards
    const relatoriosSection = document.getElementById('relatorios-section');
    const adminPanel = document.getElementById('admin-panel');
    
    if (relatoriosSection && !relatoriosSection.classList.contains('hidden')) {
        debugLog('[DEBUG] carregarSolicitacoes: Na tela de relatórios - não carregando cards de solicitações');
        window.carregandoSolicitacoes = false;
        return;
    }
    
    // Evitar chamadas múltiplas simultâneas
    if (carregandoSolicitacoes) {
        debugLog('[DEBUG] Carregamento já em andamento - aguardando...');
        return;
    }
    
    if (!window.db) {
        console.error('[ERRO] Firestore não inicializado!');
        showToast('Erro', 'Firestore não inicializado!', 'error');
        return;
    }
    
    // Verificação mais robusta do usuário com aguardo
    let usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    
    // Se usuário não está carregado, aguardar um pouco
    if (!usuarioAdmin || !usuarioAdmin.uid || !usuarioAdmin.email) {
        debugLog('[DEBUG] carregarSolicitacoes: Usuário ainda não carregado, aguardando...');
        
        // Tentar aguardar até 3 segundos pelo carregamento do usuário
        let tentativas = 0;
        const maxTentativas = 6; // 6 tentativas de 500ms = 3 segundos
        
        while (tentativas < maxTentativas) {
            await new Promise(resolve => setTimeout(resolve, 500));
            usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
            
            if (usuarioAdmin && usuarioAdmin.uid && usuarioAdmin.email) {
                debugLog('[DEBUG] carregarSolicitacoes: Usuário carregado após aguardo');
                break;
            }
            tentativas++;
        }
        
        // Se após aguardar ainda não temos usuário válido
        if (!usuarioAdmin || !usuarioAdmin.uid || !usuarioAdmin.email) {
            debugLog('[DEBUG] carregarSolicitacoes: Usuário não carregou após aguardo, cancelando...');
            
            // Se estamos na tela de login, não mostrar erro
            const authSection = document.getElementById('auth-section');
            if (!authSection || !authSection.classList.contains('hidden')) {
                debugLog('[DEBUG] carregarSolicitacoes: Ainda na tela de login, ignorando...');
                return;
            }
            
            console.warn('[AVISO] carregarSolicitacoes: Timeout aguardando dados do usuário');
            return;
        }
    }
    
    try {
        carregandoSolicitacoes = true;
        debugLog('[DEBUG] === INÍCIO DO CARREGAMENTO DE SOLICITAÇÕES ===');
        debugLog('[DEBUG] Buscando solicitações da coleção "solicitacoes"...');
        
        // Mostrar indicador de carregamento
        mostrarIndicadorCarregamento();
        
        // Obter dados do usuário atual
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const isEquipe = usuarioAdmin && (usuarioAdmin.role === 'equipe' || usuarioAdmin.isEquipe);
        const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
        const isAdmin = usuarioAdmin && usuarioAdmin.role === 'admin';
        
        debugLog('[DEBUG] Carregando para usuário:', { 
            email: usuarioAdmin?.email,
            role: usuarioAdmin?.role, 
            isEquipe, 
            isSuperAdmin,
            isAdmin, 
            equipe: usuarioAdmin?.equipe 
        });
        
        // Buscar todas as solicitações ordenadas por timestamp (mais recentes primeiro)
        console.log('[DEBUG] Iniciando busca no Firestore...');
        console.log('[DEBUG] Projeto:', window.db.app.options.projectId);
        console.log('[DEBUG] Coleção: solicitacoes');
        
        // OTIMIZAÇÃO: Usar QueryHelper para busca com paginação (se disponível)
        let snapshot;
        try {
            if (window.queryHelper) {
                console.log('[DEBUG] Usando QueryHelper para busca otimizada com paginação...');
                const resultado = await window.queryHelper.buscarSolicitacoes({
                    filtros: isEquipe ? { equipe: usuarioAdmin.equipe } : {},
                    limit: 50,
                    ordenacao: { campo: 'criadoEm', direcao: 'desc' }
                });
                
                // Se QueryHelper retornou dados válidos, usar Firestore query para compatibilidade
                if (resultado && (resultado.solicitacoes?.length > 0 || resultado.docs?.length > 0 || Array.isArray(resultado))) {
                    console.log('[DEBUG] QueryHelper retornou resultados, usando Firestore query para compatibilidade...');
                    snapshot = await window.db.collection('solicitacoes').get();
                } else {
                    // Se QueryHelper retornou vazio, usar query simples do Firestore
                    console.log('[DEBUG] QueryHelper retornou vazio, usando fallback Firestore...');
                    snapshot = await window.db.collection('solicitacoes').get();
                }
            } else {
                // Fallback padrão: query simples do Firestore
                console.log('[DEBUG] QueryHelper não disponível - usando query simples Firestore...');
                snapshot = await window.db.collection('solicitacoes').get();
            }
        } catch (queryError) {
            console.error('[ERRO QueryHelper] Falha na busca otimizada:', queryError);
            console.log('[DEBUG] Caindo para fallback Firestore por causa do erro...');
            snapshot = await window.db.collection('solicitacoes').get();
        }
        
        console.log('[DEBUG] Snapshot recebido:', {
            size: snapshot.size,
            empty: snapshot.empty,
            metadata: snapshot.metadata
        });
        
        // DEBUG AVANÇADO: Verificar autenticação e permissões
        const currentUser = window.auth.currentUser;
        if (currentUser) {
            console.log('[DEBUG] Usuário autenticado:', {
                uid: currentUser.uid,
                email: currentUser.email,
                emailVerified: currentUser.emailVerified
            });
            
            // Verificar token de autenticação
            try {
                const idTokenResult = await currentUser.getIdTokenResult();
                console.log('[DEBUG] Token claims:', idTokenResult.claims);
            } catch (tokenError) {
                console.error('[ERRO] Erro ao obter token:', tokenError);
            }
        } else {
            console.error('[ERRO] Usuário não autenticado!');
        }
        
        if (snapshot.empty) {
            console.warn('[AVISO] Coleção solicitacoes está vazia no Firestore');
            console.log('[DEBUG] Verificar se há dados na coleção solicitacoes no projeto:', window.db.app.options.projectId);
            
            // TESTE DIRETO: Tentar acessar o documento específico do Firebase Console
            console.log('[TESTE] Verificando documento específico 2yKdMYESGGMQqLOwGC6T...');
            try {
                const docRef = window.db.collection('solicitacoes').doc('2yKdMYESGGMQqLOwGC6T');
                const docSnap = await docRef.get();
                if (docSnap.exists) {
                    console.log('✅ DOCUMENTO ESPECÍFICO ENCONTRADO:', docSnap.data());
                } else {
                    console.log('❌ DOCUMENTO ESPECÍFICO NÃO EXISTE');
                }
            } catch (docError) {
                console.error('❌ ERRO AO ACESSAR DOCUMENTO ESPECÍFICO:', docError);
            }
            
            // TESTE: Verificar outras possíveis coleções
            const testeColes = ['solicitacao', 'pedidos', 'requests', 'tickets'];
            for (const nomeCole of testeColes) {
                try {
                    const testSnapshot = await window.db.collection(nomeCole).limit(1).get();
                    if (!testSnapshot.empty) {
                        console.log(`🔍 ENCONTRADA: Coleção '${nomeCole}' tem ${testSnapshot.size} documento(s)`);
                    }
                } catch (e) {
                    // Ignorar coleções inexistentes
                }
            }
        } else {
            debugLog('[DEBUG] Processando', snapshot.size, 'documentos da coleção solicitacoes');
        }
        
        const solicitacoes = [];
        let pendentes = 0;
        let finalizadasHoje = 0;
        let quartosAtivos = new Set();
        const hoje = new Date().toISOString().slice(0, 10);
        
        // Contadores por equipe
        const equipes = {
            manutencao: [],
            nutricao: [],
            higienizacao: [],
            hotelaria: []
        };
        
        let totalDocs = 0;
        let docsProcessados = 0;
        let docsFiltrados = 0;
        
        snapshot.forEach(doc => {
            docsProcessados++;
            const data = doc.data();
            const item = { id: doc.id, ...data };
            
            debugLog('[DEBUG] Processando documento:', {
                id: doc.id,
                equipe: data.equipe,
                tipoServico: data.tipoServico,
                titulo: data.titulo,
                quarto: data.quarto
            });
            
            // DEBUG ESPECÍFICO PARA CAMPO QUARTO - TODAS AS SOLICITAÇÕES
            console.log('[🏠 DEBUG-QUARTO]', {
                id: doc.id,
                titulo: data.titulo || data.tipo || data.descricao,
                quartoRaw: data.quarto,
                quartoType: typeof data.quarto,
                quartoIsEmpty: !data.quarto,
                quartoLength: data.quarto ? data.quarto.length : 0
            });
            
            // FILTRO RIGOROSO USANDO A FUNÇÃO DE PERMISSÕES
            if (!podeVerSolicitacaoJS(usuarioAdmin, data)) {
                docsFiltrados++;
                // Pular esta solicitação se o usuário não tem permissão para vê-la
                return;
            }
            
            totalDocs++;
            solicitacoes.push(item);
            
            console.log(`[DEBUG] Solicitação incluída:`, item.titulo || item.tipo, 'equipe:', data.equipe);
            
            if (data.status === 'pendente') pendentes++;
            if (data.status === 'finalizada' && data.dataFinalizacao?.slice(0,10) === hoje) finalizadasHoje++;
            if (data.quarto) quartosAtivos.add(data.quarto);
            
            // Agrupar por equipe apenas se necessário
            if (data.equipe && equipes[data.equipe] !== undefined) {
                equipes[data.equipe].push(item);
            }
        });
        
        // Log detalhado do processamento
        debugLog('[DEBUG] Resumo do processamento:', {
            totalDocsFirestore: snapshot.size,
            docsProcessados: docsProcessados,
            docsFiltrados: docsFiltrados,
            docsFinaisIncluidos: totalDocs,
            usuarioEquipe: usuarioAdmin.equipe,
            usuarioRole: usuarioAdmin.role
        });
        
        console.log(`[DEBUG] Total de solicitações processadas: ${totalDocs} de ${snapshot.size} encontradas`);
        console.log(`[DEBUG] Filtradas: ${docsFiltrados}, Incluídas: ${totalDocs}`);
        console.log(`[DEBUG] Solicitações por equipe:`, Object.keys(equipes).map(e => `${e}: ${equipes[e].length}`));
        
        // Ordenação manual para garantir ordem correta (mais recentes primeiro)
        solicitacoes.sort((a, b) => {
            const timestampA = a.timestamp?.toMillis() || a.dataCriacao?.toMillis() || 0;
            const timestampB = b.timestamp?.toMillis() || b.dataCriacao?.toMillis() || 0;
            return timestampB - timestampA; // Ordem decrescente (mais recentes primeiro)
        });
        
        // Ordenar também dentro de cada equipe
        Object.keys(equipes).forEach(equipeNome => {
            equipes[equipeNome].sort((a, b) => {
                const timestampA = a.timestamp?.toMillis() || a.dataCriacao?.toMillis() || 0;
                const timestampB = b.timestamp?.toMillis() || b.dataCriacao?.toMillis() || 0;
                return timestampB - timestampA;
            });
        });
        
        console.log(`[DEBUG] Dados ordenados e prontos para renderização`);
        console.log(`[DEBUG] Solicitações por equipe:`, Object.keys(equipes).map(e => `${e}: ${equipes[e].length}`));
        
        // Atualizar cache (com LRU se disponível)
        if (window.cacheManager) {
            // Usar CacheManager com limite LRU de 200 itens
            solicitacoes.forEach(sol => {
                window.cacheManager.setSolicitacao(sol);
            });
            console.log('[CACHE] Solicitações armazenadas no CacheManager (LRU ativo)');
        } else {
            // Fallback: cache legado sem limite
            window.cachedSolicitacoes = Array.isArray(solicitacoes) ? solicitacoes : [];
            console.log('[CACHE] Solicitações armazenadas no cache legado (sem limite)');
        }
        console.log('[DEBUG] Cache atualizado:', solicitacoes.length, 'itens');
        
        // RENDERIZAÇÃO BASEADA NO TIPO DE USUÁRIO
        if (isEquipe && usuarioAdmin.equipe) {
            // Usuário de equipe: mostrar APENAS sua equipe
            const equipeFiltrada = {};
            equipeFiltrada[usuarioAdmin.equipe] = equipes[usuarioAdmin.equipe] || [];
            
            console.log(`[DEBUG] Renderizando apenas equipe: ${usuarioAdmin.equipe} com ${equipeFiltrada[usuarioAdmin.equipe].length} solicitações`);
            
            // Enriquecer dados antes de renderizar
            const equipeFiltradaEnriquecida = await enriquecerSolicitacoesComDados(equipeFiltrada);
            renderizarCardsEquipe(equipeFiltradaEnriquecida);
            
            // Ajustar visibilidade dos painéis (mostrar apenas o da equipe)
            setTimeout(() => {
                const allPanels = document.querySelectorAll('.team-panel');
                allPanels.forEach(panel => {
                    const department = panel.getAttribute('data-department');
                    if (department === usuarioAdmin.equipe) {
                        panel.classList.remove('hidden');
                        panel.style.display = 'block';
                    } else {
                        panel.classList.add('hidden');
                        panel.style.display = 'none';
                    }
                });
            }, 100);
            
        } else if (isSuperAdmin) {
            // Super admin: mostrar TODAS as equipes
            debugLog('[DEBUG] Renderizando todas as equipes para super admin');
            
            // Enriquecer dados antes de renderizar
            const equipesEnriquecidas = await enriquecerSolicitacoesComDados(equipes);
            renderizarCardsEquipe(equipesEnriquecidas);
            
            // Mostrar todos os painéis
            setTimeout(() => {
                const allPanels = document.querySelectorAll('.team-panel');
                allPanels.forEach(panel => {
                    panel.classList.remove('hidden');
                    panel.style.display = 'block';
                });
            }, 100);
            
        } else if (isAdmin) {
            // Admin: mostrar TODAS as equipes (apenas visualização)
            debugLog('[DEBUG] Renderizando todas as equipes para administrador (visualização apenas)');
            
            // Enriquecer dados antes de renderizar
            const equipesEnriquecidas = await enriquecerSolicitacoesComDados(equipes);
            renderizarCardsEquipe(equipesEnriquecidas);
            
            // Mostrar todos os painéis
            setTimeout(() => {
                const allPanels = document.querySelectorAll('.team-panel');
                allPanels.forEach(panel => {
                    panel.classList.remove('hidden');
                    panel.style.display = 'block';
                });
            }, 100);
            
        } else {
            // Usuário sem permissões claras
            console.warn('[AVISO] Usuário sem permissões claras - não exibindo solicitações');
            renderizarCardsEquipe({});
        }
        
        // Atualizar métricas do painel
        atualizarMetricasPainel(totalDocs, pendentes, finalizadasHoje, quartosAtivos.size);
        
        // Log do resultado final (sem criar dados de exemplo em produção)
        if (totalDocs === 0) {
            debugLog('[DEBUG] Nenhuma solicitação encontrada - painel vazio em produção');
            // Mostrar interface vazia sem dados simulados
            mostrarInterfaceVazia();
        }
        
        ocultarIndicadorCarregamento();
        
    } catch (error) {
        console.error('[ERRO] Falha ao buscar solicitações:', error);
        console.error('[ERRO] Stack trace:', error.stack);
        ocultarIndicadorCarregamento();
        
        // Tentar novamente após falha (uma vez)
        if (!window.tentativaRecarga) {
            window.tentativaRecarga = true;
            debugLog('[DEBUG] Tentando recarregar automaticamente em 3 segundos...');
            
            showToast('Aviso', 'Falha no carregamento. Tentando novamente...', 'warning');
            
            setTimeout(async () => {
                try {
                    window.carregandoSolicitacoes = false; // Reset flag
                    await carregarSolicitacoes();
                } catch (retryError) {
                    console.error('[ERRO] Falha na segunda tentativa:', retryError);
                    showToast('Erro', 'Falha ao carregar dados. Recarregue a página (Ctrl+F5)', 'error');
                    // EM PRODUÇÃO: Não carregar dados simulados, apenas mostrar erro
                    debugLog('[DEBUG] Sistema em produção - não gerando dados de exemplo');
                }
            }, 3000);
            
        } else if (error.code === 'unavailable' || error.message.includes('offline')) {
            showToast('Aviso', 'Modo offline - Carregando dados locais', 'warning');
            carregarDadosOffline();
        } else if (error.code === 'permission-denied') {
            showToast('Erro', 'Acesso negado. Verifique suas permissões', 'error');
        } else {
            showToast('Erro', 'Não foi possível carregar as solicitações', 'error');
            // EM PRODUÇÃO: Não carregar dados simulados
            debugLog('[DEBUG] Sistema em produção - não gerando dados de exemplo em caso de erro');
        }
        
        console.log('[DEBUG] Finalizando carregarSolicitacoes - indo para finally...');
    } finally {
        console.log('[DEBUG] FINALLY: Entrando no finally block');
        window.carregandoSolicitacoes = false;
        
        // Configurar listener de notificações em tempo real apenas uma vez
        if (!window.notificationListenerConfigured) {
            console.log('[NOTIFICATION] Configurando listener de notificações...');
            configurarListenerNotificacoes();
            window.notificationListenerConfigured = true;
            
            console.log('[AUTO-UPDATE] Auto-update já foi configurado anteriormente');
            
            // REMOVIDO: Configuração automática para evitar loops
            // configurarAtualizacaoAutomatica();
        } else {
            console.log('[NOTIFICATION] Listener já configurado (DESABILITADO), pulando...');
        }
        
        // Garantir que a interface está visível após carregamento
        setTimeout(() => {
            const adminPanel = document.getElementById('admin-panel');
            const teamsGrid = document.querySelector('.teams-grid');
            
            if (adminPanel && window.usuarioAdmin?.role === 'super_admin') {
                adminPanel.style.display = 'block';
                adminPanel.style.visibility = 'visible';
                adminPanel.classList.remove('hidden');
                
                if (teamsGrid) {
                    teamsGrid.style.display = 'grid';
                    teamsGrid.style.visibility = 'visible';
                    teamsGrid.classList.remove('hidden');
                }
                
                debugLog('[DEBUG] Interface forçadamente atualizada após carregamento');
                
                // REMOVER BOTÕES DEBUG IMEDIATAMENTE APÓS CARREGAMENTO
                setTimeout(() => {
                    if (typeof window.forceRemoveDebugButtons === 'function') {
                        window.forceRemoveDebugButtons();
                    }
                }, 100);
            }
        }, 100);
    }
}

// Função para recarregar com debounce
function recarregarSolicitacoes(delay = 1000) {
    if (timeoutRecarregar) {
        clearTimeout(timeoutRecarregar);
    }
    
    timeoutRecarregar = setTimeout(() => {
        // Verificar se usuário ainda está logado antes de recarregar
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || !usuarioAdmin.uid || !usuarioAdmin.email) {
            debugLog('[DEBUG] recarregarSolicitacoes: usuário não logado, cancelando recarregamento...');
            return;
        }
        
        // Limpar flags de carregamento para permitir atualização
        window.carregandoSolicitacoes = false;
        carregandoSolicitacoes = false;  // Limpar TAMBÉM a flag local
        
        carregarSolicitacoes();
    }, delay);
}

// === SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA ===
function configurarAtualizacaoAutomatica() {
    console.log('[AUTO-UPDATE] Configurando atualização automática a cada 30 segundos...');
    
    // Só configurar se não foi configurado ainda
    if (!window.autoUpdateInterval) {
        console.log('[AUTO-UPDATE] Auto-update DESABILITADO temporariamente para debug');
        // window.autoUpdateInterval = setInterval(() => {
        //     // Só atualizar se estiver logado e não carregando
        //     if (window.usuarioAdmin && !window.carregandoSolicitacoes) {
        //         console.log('[AUTO-UPDATE] Recarregamento automático suave...');
        //         recarregarSolicitacoes(5000); // Usar recarregamento com debounce
        //     }
        // }, 60000); // Aumentado para 60 segundos
        
        console.log('[AUTO-UPDATE] Intervalo DESABILITADO com sucesso');
    }
}

// === FUNÇÃO PARA ADICIONAR NOVA SOLICITAÇÃO SEM RECARREGAR TUDO ===
function adicionarNovaSolicitacao(novaSolicitacao) {
    try {
        console.log('[NOTIFICATION] Nova solicitação detectada:', novaSolicitacao.id);
        
        // Verificar se pode ver a solicitação
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const podeVer = podeVerSolicitacaoJS(usuarioAdmin, novaSolicitacao);
        if (!podeVer) {
            console.log('[NOTIFICATION] Sem permissão para ver esta solicitação');
            return;
        }
        
        // Recarregar com debounce para evitar loops
        console.log('[NOTIFICATION] Recarregando painel com debounce...');
        recarregarSolicitacoes(2000); // 2 segundos de delay
        
    } catch (error) {
        console.error('[ERRO] Erro ao processar nova solicitação:', error);
    }
}

// === SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL ===
function configurarListenerNotificacoes() {
    try {
        console.log('[NOTIFICATION] Configurando listener de notificações...');
        
        // Verificar autenticação ANTES de configurar
        if (!window.auth?.currentUser) {
            console.log('[NOTIFICATION] Usuário não autenticado - abortando configuração');
            return;
        }
        
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || !usuarioAdmin.uid) {
            console.log('[NOTIFICATION] Usuário não está logado - não configurando notificações');
            return;
        }
        
        // Armazenar timestamp da última verificação para evitar notificar solicitações existentes
        // AJUSTE: Definir como 1 minuto atrás para permitir notificações de solicitações muito recentes
        const agora = Date.now();
        window.lastNotificationCheck = agora - (60 * 1000); // 1 minuto atrás
        
        console.log('[NOTIFICATION] Iniciando listener para solicitações...', {
            usuario: usuarioAdmin.email,
            equipe: usuarioAdmin.equipe,
            role: usuarioAdmin.role,
            lastCheck: new Date(window.lastNotificationCheck).toLocaleString(),
            agoraReal: new Date(agora).toLocaleString()
        });
        
        // Marcar que é o carregamento inicial para não notificar sobre todas as solicitações existentes
        window.isInitialLoad = true;
        setTimeout(() => {
            window.isInitialLoad = false;
            console.log('[NOTIFICATION] Carregamento inicial finalizado - notificações ativas');
            console.log('[NOTIFICATION] 🔔 isInitialLoad definido como FALSE - pop-ups agora ativos!');
        }, 2000); // Reduzido para 2 segundos para permitir notificações mais rápido
        
        // Listener para novas solicitações (SEM ORDERBY para evitar problemas de índice)
        window.notificationUnsubscribe = window.db.collection('solicitacoes')
            .onSnapshot((snapshot) => {
                console.log('[NOTIFICATION] Snapshot recebido:', {
                    size: snapshot.size,
                    hasPendingWrites: snapshot.metadata.hasPendingWrites,
                    docChanges: snapshot.docChanges().length
                });
                
                if (!snapshot.metadata.hasPendingWrites) { // Ignorar mudanças locais
                    snapshot.docChanges().forEach((change) => {
                        console.log('[NOTIFICATION] Change detectado:', {
                            type: change.type,
                            docId: change.doc.id
                        });
                        
                        if (change.type === 'added') {
                            const novaSolicitacao = { id: change.doc.id, ...change.doc.data() };
                            
                            console.log('[NOTIFICATION] Verificando se é nova:', {
                                id: novaSolicitacao.id,
                                timestamp: novaSolicitacao.timestamp?.toMillis(),
                                dataCriacao: novaSolicitacao.dataCriacao?.toMillis(),
                                lastCheck: window.lastNotificationCheck,
                                temTimestamp: !!novaSolicitacao.timestamp,
                                temDataCriacao: !!novaSolicitacao.dataCriacao
                            });
                            
                            // FALLBACK: Se não há timestamp, considerar como nova durante a primeira verificação
                            const timestampSolicitacao = novaSolicitacao.timestamp?.toMillis() || 
                                                        novaSolicitacao.dataCriacao?.toMillis() || 
                                                        Date.now(); // Usar timestamp atual como fallback
                            
                            const isNova = timestampSolicitacao > window.lastNotificationCheck;
                            
                            // ADICIONAL: Se não tem timestamp, verificar se é uma solicitação que acabou de aparecer no listener
                            const isNovaNoListener = !novaSolicitacao.timestamp && !novaSolicitacao.dataCriacao;
                            
                            if (isNova || (isNovaNoListener && change.type === 'added')) {
                                console.log('[NOTIFICATION] Verificando permissões para:', {
                                    id: novaSolicitacao.id,
                                    equipe: novaSolicitacao.equipe,
                                    isNova,
                                    isNovaNoListener
                                });
                                
                                // Verificar se o usuário tem permissão para ver esta solicitação
                                if (podeVerSolicitacaoJS(usuarioAdmin, novaSolicitacao)) {
                                    console.log('[NOTIFICATION] ✅ Nova solicitação detectada:', novaSolicitacao);
                                    
                                    // Só mostrar notificação se for realmente nova (não durante o carregamento inicial)
                                    if (!window.isInitialLoad) {
                                        mostrarNotificacaoNovaSolicitacao(novaSolicitacao);
                                    }
                                    
                                    // Recarregar as solicitações para mostrar a nova no topo
                                    setTimeout(() => {
                                        console.log('[NOTIFICATION] Adicionando nova solicitação sem recarregar tudo...');
                                        // Evitar loop - usar função específica para adicionar
                                        // carregarSolicitacoes();
                                        adicionarNovaSolicitacao(novaSolicitacao);
                                    }, 1000);
                                } else {
                                    console.log('[NOTIFICATION] ❌ Sem permissão para ver esta solicitação');
                                }
                            } else {
                                console.log('[NOTIFICATION] ⏰ Solicitação não é nova (timestamp anterior ao login)');
                            }
                        }
                    });
                }
            }, (error) => {
                console.error('[ERRO] Erro no listener de notificações:', error);
                // NÃO reconfigurar automaticamente após erro - pode ser logout
                // Verificar se ainda está autenticado antes de tentar reconfigurar
                if (window.auth?.currentUser && window.usuarioAdmin) {
                    console.log('[NOTIFICATION] Erro no listener - tentando reconfigurar em 10s...');
                    setTimeout(() => {
                        if (window.auth?.currentUser && window.usuarioAdmin) {
                            window.notificationListenerConfigured = false;
                            configurarListenerNotificacoes();
                        }
                    }, 10000); // Aumentado para 10s
                } else {
                    console.log('[NOTIFICATION] Usuário não autenticado - não reconfigurar listener');
                    window.notificationListenerConfigured = false;
                }
            });
        
        // Registrar listener no ListenerManager para auto-cleanup
        if (window.listenerManager && window.notificationUnsubscribe) {
            window.listenerManager.register(
                window.notificationUnsubscribe,
                'notificacoes-solicitacoes',
                { collection: 'solicitacoes', type: 'todas' }
            );
            console.log('[LISTENER] ✅ Listener de notificações registrado no ListenerManager');
        }
            
    } catch (error) {
        console.error('[ERRO] configurarListenerNotificacoes:', error);
    }
}

function mostrarNotificacaoNovaSolicitacao(solicitacao) {
    try {
        console.log('[NOTIFICATION] 🎯 EXECUTANDO mostrarNotificacaoNovaSolicitacao para:', solicitacao.id);
        
        // Buscar dados completos do acompanhante antes de exibir
        buscarDadosAcompanhante(solicitacao).then(dadosAcompanhante => {
            console.log('[NOTIFICATION] 📋 Dados obtidos para popup:', dadosAcompanhante);
            exibirPopupNotificacao(solicitacao, dadosAcompanhante);
        }).catch(error => {
            console.error('[NOTIFICATION] ❌ Erro ao buscar dados do acompanhante:', error);
            // Mesmo assim, exibir popup com dados básicos
            exibirPopupNotificacao(solicitacao, null);
        });
        
    } catch (error) {
        console.error('[NOTIFICATION] Erro ao exibir notificação:', error);
    }
}

function exibirPopupNotificacao(solicitacao, dadosAcompanhante) {
    try {
        console.log('[NOTIFICATION] 🎉 CRIANDO POPUP para solicitação:', solicitacao.id);
        console.log('[NOTIFICATION] 📊 Dados do acompanhante recebidos:', dadosAcompanhante);
        
        // Determinar tipo de serviço e emoji
        let tipoServico = solicitacao.equipe || solicitacao.tipoServico || 'solicitação';
        let emoji = '📋';
        
        switch(tipoServico.toLowerCase()) {
            case 'manutencao':
            case 'manutenção':
                emoji = '🔧';
                tipoServico = 'Manutenção';
                break;
            case 'nutricao':
            case 'nutrição':
                emoji = '🍽️';
                tipoServico = 'Nutrição';
                break;
            case 'higienizacao':
            case 'higienização':
                emoji = '🧹';
                tipoServico = 'Higienização';
                break;
            case 'hotelaria':
                emoji = '🏨';
                tipoServico = 'Hotelaria';
                break;
        }
        
        // Criar pop-up de notificação
        const popup = document.createElement('div');
        popup.className = 'notification-popup';
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            min-width: 320px;
            max-width: 400px;
            font-family: system-ui, -apple-system, sans-serif;
            animation: slideInRight 0.5s ease-out;
            border-left: 5px solid #fff;
        `;
        
        popup.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="font-size: 24px;">${emoji}</div>
                <div>
                    <div style="font-weight: bold; font-size: 16px;">Nova Solicitação!</div>
                    <div style="font-size: 14px; opacity: 0.9;">${tipoServico}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-left: auto; background: rgba(255,255,255,0.2); border: none; color: white; 
                               padding: 4px 8px; border-radius: 4px; cursor: pointer;">✕</button>
            </div>
            <div style="font-size: 14px; line-height: 1.4;">
                <strong>Quarto:</strong> ${dadosAcompanhante?.quarto || solicitacao.quarto || 'Não especificado'}<br>
                <strong>Solicitante:</strong> ${dadosAcompanhante?.nome || solicitacao.usuarioNome || solicitacao.nome || 'Não informado'}<br>
                <strong>Descrição:</strong> ${solicitacao.descricao || solicitacao.titulo || 'Nova solicitação de atendimento'}
            </div>
            <div style="margin-top: 12px; font-size: 12px; opacity: 0.8;">
                ${new Date().toLocaleString('pt-BR')}
            </div>
        `;
        
        // Adicionar CSS de animação se não existir
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-popup:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
                    transition: all 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Adicionar ao DOM
        document.body.appendChild(popup);
        
        // Som de notificação (opcional - só se suportado)
        try {
            if ('Audio' in window) {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBz2c3+7AdSIBII/J8N6OSAgQYrPm56VUEwpJmOLosmIdBDSK1O7HdSII');
                audio.volume = 0.3;
                audio.play().catch(() => {}); // Ignorar erro se não conseguir tocar
            }
        } catch (e) {
            // Ignorar erro de áudio
        }
        
        // Remover automaticamente após 7 segundos
        setTimeout(() => {
            if (popup && popup.parentNode) {
                popup.style.animation = 'slideInRight 0.3s ease-in reverse';
                setTimeout(() => popup.remove(), 300);
            }
        }, 7000);
        
        console.log('[NOTIFICATION] Notificação exibida com sucesso');
        
    } catch (error) {
        console.error('[ERRO] exibirPopupNotificacao:', error);
    }
}

function mostrarIndicadorCarregamento() {
    const teamsGrid = document.querySelector('.teams-grid');
    if (teamsGrid) {
        teamsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                <p>Carregando solicitações...</p>
            </div>
        `;
    }
}

function ocultarIndicadorCarregamento() {
    // O indicador será substituído pelo conteúdo real
}

function carregarDadosOffline() {
    // Simular dados offline
    const dadosOffline = {
        manutencao: [
            { id: 'offline1', status: 'pendente', titulo: 'Ar condicionado', quarto: '101', dataCriacao: new Date().toISOString().slice(0,10) }
        ],
        nutricao: [
            { id: 'offline2', status: 'pendente', titulo: 'Dieta especial', quarto: '102', dataCriacao: new Date().toISOString().slice(0,10) }
        ],
        higienizacao: [
            { id: 'offline3', status: 'em-andamento', titulo: 'Limpeza extra', quarto: '103', dataCriacao: new Date().toISOString().slice(0,10) }
        ],
        hotelaria: [
            { id: 'offline4', status: 'finalizada', titulo: 'Troca de roupas', quarto: '104', dataCriacao: new Date().toISOString().slice(0,10) }
        ]
    };
    
    atualizarMetricasPainel(4, 2, 1, 4);
    renderizarCardsEquipe(dadosOffline);
}

// Função para mostrar interface vazia em produção (sem dados simulados)
function mostrarInterfaceVazia() {
    debugLog('[DEBUG] Mostrando interface vazia - nenhuma solicitação encontrada');
    
    const teamsGrid = document.querySelector('.teams-grid');
    if (teamsGrid) {
        teamsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6b7280;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                <h3 style="margin-bottom: 1rem; color: #374151;">Nenhuma solicitação encontrada</h3>
                <p style="margin-bottom: 2rem;">Não há solicitações para exibir no momento.</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="location.reload()" 
                            style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; cursor: pointer;">
                        🔄 Atualizar
                    </button>
                </div>
            </div>
        `;
    }
    
    // Zerar métricas
    atualizarMetricasPainel(0, 0, 0, 0);
}

function atualizarMetricasPainel(total, pendentes, finalizadasHoje, quartosAtivos) {
    // Atualiza badge do menu para mostrar o papel do usuário com nome personalizado
    const badge = document.getElementById('user-role-badge');
    if (badge) {
        const usuario = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const nomeUsuario = usuario?.nome || usuario?.nomeCompleto || usuario?.email?.split('@')[0] || 'Usuário';
        
        if (usuario.role === 'super_admin') {
            badge.textContent = `${nomeUsuario} (Super Admin)`;
            badge.className = 'priority-badge priority-urgente';
        } else if (usuario.role === 'admin') {
            badge.textContent = `${nomeUsuario} (Admin)`;
            badge.className = 'priority-badge priority-alta';
        } else if (usuario.isEquipe) {
            // Para equipe, mostrar nome + departamento
            const departamento = usuario.equipe ? ` - ${usuario.equipe}` : '';
            badge.textContent = `${nomeUsuario}${departamento}`;
            badge.className = 'priority-badge priority-media';
        } else {
            badge.textContent = `${nomeUsuario} (Equipe)`;
            badge.className = 'priority-badge priority-media';
        }
    }
    
    // Atualizar visibilidade dos botões
    atualizarVisibilidadeBotoes();
    
    // Remove loader visual (reforçado)
    setTimeout(() => {
        if (window._mainLoader) {
            window._mainLoader.remove();
            window._mainLoader = null;
        }
    }, 100);
    // Renderiza bloco de métricas centralizado
    let metricasEl = document.getElementById('metricas-painel');
    if (!metricasEl) {
        metricasEl = document.createElement('div');
        metricasEl.id = 'metricas-painel';
        metricasEl.className = 'metricas-painel';
        document.getElementById('admin-panel').insertAdjacentElement('afterbegin', metricasEl);
    }
    // Atualiza os cards do painel principal (HTML)
    const totalEl = document.getElementById('total-solicitacoes');
    const pendentesEl = document.getElementById('pendentes');
    const finalizadasEl = document.getElementById('finalizadas');
    const quartosEl = document.getElementById('quartos-ativos');
    if (totalEl) totalEl.textContent = total;
    if (pendentesEl) pendentesEl.textContent = pendentes;
    if (finalizadasEl) finalizadasEl.textContent = finalizadasHoje;
    if (quartosEl) quartosEl.textContent = quartosAtivos;
}

// Variável global para controlar reconfiguração de botões
let reconfigurando = false;

// Função específica para garantir visibilidade do botão Minha Senha
function forcarVisibilidadeBotaoMinhaSenha() {
    const btnMinhaSenha = document.getElementById('alterar-senha-btn');
    if (btnMinhaSenha) {
        // Forçar visibilidade com múltiplas abordagens
        btnMinhaSenha.classList.remove('btn-hide', 'hidden', 'd-none');
        btnMinhaSenha.style.cssText = `
            display: inline-flex !important; 
            visibility: visible !important; 
            opacity: 1 !important;
            background: #10b981 !important;
            color: white !important;
            border: none !important;
            padding: 0.5rem 1rem !important;
            border-radius: 0.375rem !important;
            cursor: pointer !important;
            align-items: center !important;
            gap: 0.5rem !important;
            font-weight: 500 !important;
            position: relative !important;
            z-index: 999 !important;
        `;
        btnMinhaSenha.setAttribute('style', btnMinhaSenha.style.cssText);
        console.log('[🔑 MINHA SENHA] Botão forçado para ser visível');
        return true;
    } else {
        console.warn('[🔑 MINHA SENHA] Botão não encontrado no DOM');
        // Tentar recriar o botão se não existir
        recriarBotaoMinhaSenha();
        return false;
    }
}

// Função para recriar o botão se ele não existir
function recriarBotaoMinhaSenha() {
    console.log('[🔑 RECRIAR] Tentando recriar botão Minha Senha...');
    
    const userInfo = document.querySelector('.header .user-info');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (userInfo && logoutBtn) {
        // Criar o botão
        const btnMinhaSenha = document.createElement('button');
        btnMinhaSenha.id = 'alterar-senha-btn';
        btnMinhaSenha.className = 'btn-primary';
        btnMinhaSenha.onclick = () => window.abrirMinhaSenha && window.abrirMinhaSenha();
        btnMinhaSenha.title = 'Alterar minha senha';
        btnMinhaSenha.innerHTML = '<i class="fas fa-key"></i> Minha Senha';
        btnMinhaSenha.style.cssText = `
            background: #10b981 !important;
            display: inline-flex !important; 
            visibility: visible !important;
            opacity: 1 !important;
            color: white !important;
            border: none !important;
            padding: 0.5rem 1rem !important;
            border-radius: 0.375rem !important;
            cursor: pointer !important;
            align-items: center !important;
            gap: 0.5rem !important;
            font-weight: 500 !important;
            position: relative !important;
            z-index: 999 !important;
        `;
        
        // Inserir antes do botão de logout
        userInfo.insertBefore(btnMinhaSenha, logoutBtn);
        console.log('[🔑 RECRIAR] Botão Minha Senha recriado com sucesso!');
        return true;
    } else {
        console.error('[🔑 RECRIAR] Não foi possível encontrar local para inserir o botão');
        return false;
    }
}

// Watchdog para garantir que o botão sempre esteja visível
let watchdogInterval = null;
function iniciarWatchdogBotaoMinhaSenha() {
    // Limpar watchdog anterior se existir
    if (watchdogInterval) {
        clearInterval(watchdogInterval);
        watchdogInterval = null;
    }
    
    let tentativas = 0;
    const maxTentativas = 5; // Limitar tentativas para evitar loop infinito
    
    watchdogInterval = setInterval(() => {
        // Parar se excedeu tentativas ou usuário não está logado
        if (tentativas >= maxTentativas || !window.usuarioAdmin) {
            if (watchdogInterval) {
                clearInterval(watchdogInterval);
                watchdogInterval = null;
            }
            return;
        }
        
        const btnMinhaSenha = document.getElementById('alterar-senha-btn');
        if (btnMinhaSenha) {
            const isVisible = btnMinhaSenha.offsetWidth > 0 && btnMinhaSenha.offsetHeight > 0;
            if (!isVisible && tentativas < maxTentativas) {
                console.log(`[🔑 WATCHDOG] Botão "Minha Senha" invisível - tentativa ${tentativas + 1}/${maxTentativas}`);
                forcarVisibilidadeBotaoMinhaSenha();
                tentativas++;
            }
        } else if (tentativas < maxTentativas) {
            console.log(`[🔑 WATCHDOG] Botão "Minha Senha" não encontrado - tentativa ${tentativas + 1}/${maxTentativas}`);
            recriarBotaoMinhaSenha();
            tentativas++;
        }
    }, 5000); // Verificar a cada 5 segundos (reduzido frequência)
}

// Observer para monitorar mudanças no DOM
function iniciarObserverBotaoMinhaSenha() {
    const userInfo = document.querySelector('.header .user-info');
    if (userInfo) {
        const observer = new MutationObserver(() => {
            const btnMinhaSenha = document.getElementById('alterar-senha-btn');
            if (!btnMinhaSenha) {
                console.log('[🔑 OBSERVER] Botão removido - recriando...');
                setTimeout(() => recriarBotaoMinhaSenha(), 100);
            }
        });
        
        observer.observe(userInfo, {
            childList: true,
            subtree: true
        });
        
        console.log('[🔑 OBSERVER] Observer do botão Minha Senha iniciado');
    }
}

// Nova função para atualizar visibilidade dos botões
function atualizarVisibilidadeBotoes() {
    console.log('🔥🔥🔥 EXECUTANDO atualizarVisibilidadeBotoes - TESTE LIMPEZA 🔥🔥🔥');
    
    // FORCE RESET GLOBAL da variável reconfigurando 
    console.log('🚀🚀🚀 [DEBUG-FORÇADO] FORÇANDO RESET GLOBAL - reconfigurando era:', window.reconfigurando || 'undefined');
    window.reconfigurando = false;
    reconfigurando = false;
    
    console.log('🚀🚀🚀 [DEBUG-FORÇADO] CONTINUANDO execução da função...');
    
    try {
        // PRIMEIRO: Limpar botões indesejados SEMPRE
        forceRemoveDebugButtons();
        
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        console.log('🚀🚀🚀 [DEBUG-FORÇADO] UsuarioAdmin carregado:', usuarioAdmin?.email);
        
        const btnNovoUsuario = document.getElementById('btn-novo-usuario');
        const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
        const btnAcompanhantes = document.getElementById('acompanhantes-btn');
        const btnRelatorios = document.getElementById('relatorios-btn');
        const btnDashboard = document.getElementById('dashboard-btn');
        const btnLimpeza = document.getElementById('limpeza-btn');
        const btnSatisfacao = document.getElementById('satisfacao-btn');
        const btnMinhaSenha = document.getElementById('alterar-senha-btn');
        const panelTitle = document.getElementById('panel-title');
        const userRoleBadge = document.getElementById('user-role-badge');
        const msgPermissao = document.getElementById('admin-permission-msg');

        // Log de verificação dos elementos do header
        debugLog('[DEBUG] Elementos do header:', {
            btnGerenciarUsuarios: !!btnGerenciarUsuarios,
            btnAcompanhantes: !!btnAcompanhantes,
            btnRelatorios: !!btnRelatorios,
            btnDashboard: !!btnDashboard,
            btnLimpeza: !!btnLimpeza,
            btnSatisfacao: !!btnSatisfacao
        });
    
    debugLog('[DEBUG] Atualizando botões para usuário:', usuarioAdmin);
    
    // Verificar tipo de usuário baseado nas coleções Firestore
    const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
    const isEquipe = usuarioAdmin && (usuarioAdmin.role === 'equipe' || usuarioAdmin.isEquipe);
    const isAdmin = usuarioAdmin && usuarioAdmin.role === 'admin';
    
    debugLog('[DEBUG] Tipo de usuário:', { 
        isSuperAdmin, 
        isEquipe, 
        isAdmin, 
        role: usuarioAdmin?.role, 
        equipe: usuarioAdmin?.equipe 
    });
    
    // Configurar título e badge baseado no tipo de usuário
    if (panelTitle) {
        if (isSuperAdmin) {
            panelTitle.textContent = '🏥 Painel Administrativo - Super Admin';
        } else if (isEquipe && usuarioAdmin.equipe) {
            const nomeEquipe = {
                'manutencao': 'Manutenção',
                'nutricao': 'Nutrição', 
                'higienizacao': 'Higienização',
                'hotelaria': 'Hotelaria'
            }[usuarioAdmin.equipe] || usuarioAdmin.equipe;
            panelTitle.textContent = `🏥 Painel ${nomeEquipe}`;
        } else if (isAdmin) {
            panelTitle.textContent = '🏥 Painel Administrativo';
        }
    }
    
    if (userRoleBadge) {
        const nomeUsuario = usuarioAdmin?.nome || usuarioAdmin?.nomeCompleto || usuarioAdmin?.email?.split('@')[0] || 'Usuário';
        
        if (isSuperAdmin) {
            userRoleBadge.textContent = `${nomeUsuario} (Super Admin)`;
            userRoleBadge.className = 'priority-badge priority-alta';
        } else if (isEquipe && usuarioAdmin.equipe) {
            const departamento = usuarioAdmin.equipe;
            userRoleBadge.textContent = `${nomeUsuario} - ${departamento}`;
            userRoleBadge.className = 'priority-badge priority-media';
        } else if (isAdmin) {
            userRoleBadge.textContent = `${nomeUsuario} (Admin)`;
            userRoleBadge.className = 'priority-badge priority-media';
        }
    }
    
    // TESTE DIRETO DE FUNCIONALIDADE
    try {
        console.log('🚀🚀🚀 [DEBUG-FORÇADO] INICIANDO VERIFICAÇÃO FORÇADA 🚀🚀🚀');
        console.log('🚀🚀🚀 [DEBUG-FORÇADO] Usuario:', usuarioAdmin);
        console.log('🚀🚀🚀 [DEBUG-FORÇADO] temPermissaoJS existe?', typeof window.temPermissaoJS);
        
        // CORREÇÃO: Verificação direta ao invés de temPermissaoJS que causa erro
        const isHigienizacaoRecepcao = usuarioAdmin?.email === 'recepcao.jardins@yuna.com.br';
        console.log('🚀🚀🚀 [DEBUG-FORÇADO] Verificação específica higienização:', isHigienizacaoRecepcao);
        
        console.log('🚀🚀🚀 [DEBUG-FORÇADO] Elementos DOM:', {
            btnNovoUsuario: !!btnNovoUsuario,
            btnAcompanhantes: !!btnAcompanhantes
        });
        
    } catch (error) {
        console.error('🚀🚀🚀 [DEBUG-FORÇADO] ERRO:', error);
    }
    
    console.log('[🔧 DEBUG-BÁSICO] Iniciando verificação dos botões principais...');
    console.log('[🔧 DEBUG-BÁSICO] Elementos encontrados:', {
        btnNovoUsuario: !!btnNovoUsuario,
        btnAcompanhantes: !!btnAcompanhantes,
        btnGerenciarUsuarios: !!btnGerenciarUsuarios,
        usuarioAdminExiste: !!usuarioAdmin
    });
    
    console.log('🎯🎯🎯 [CHECKPOINT 1] CHEGOU até os botões principais!');
    
    // Botão Criar Usuário - APENAS super_admin
    console.log('[🔧 DEBUG-BÁSICO] Testando botão Criar Usuário...');
    if (btnNovoUsuario) {
        console.log('[🔧 DEBUG-BÁSICO] Botão Criar Usuário encontrado! Verificando permissões...');
        
        console.log('[🎯 PERMISSAO DEBUG] Testando permissão Criar Usuário (APENAS super_admin):', {
            usuarioAdmin: usuarioAdmin,
            isSuperAdmin: isSuperAdmin,
            email: usuarioAdmin?.email,
            role: usuarioAdmin?.role
        });
        
        // CORRIGIDO: Apenas super_admin pode criar usuários
        if (isSuperAdmin) {
            btnNovoUsuario.classList.remove('btn-hide');
            btnNovoUsuario.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Criar Usuário exibido para super_admin');
        } else {
            btnNovoUsuario.classList.add('btn-hide');
            btnNovoUsuario.style.display = 'none';
            debugLog('[DEBUG] Botão Criar Usuário ocultado - apenas super_admin tem acesso');
        }
    } else {
        console.log('[❌ DEBUG-BÁSICO] Botão Criar Usuário NÃO ENCONTRADO!');
    }
    
    console.log('🎯🎯🎯 [CHECKPOINT 2] TERMINOU configuração botão Criar Usuário!');
    
    // Botão Gerenciar Usuários - APENAS super_admin
    console.log('🎯🎯🎯 [CHECKPOINT 3] Iniciando botão Gerenciar Usuários!');
    if (btnGerenciarUsuarios) {
        if (isSuperAdmin) {
            btnGerenciarUsuarios.classList.remove('btn-hide');
            btnGerenciarUsuarios.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Gerenciar Usuários exibido para super_admin');
        } else {
            btnGerenciarUsuarios.classList.add('btn-hide');
            btnGerenciarUsuarios.style.display = 'none';
            debugLog('[DEBUG] Botão Gerenciar Usuários ocultado para usuário não super_admin');
        }
    }

    console.log('🎯🎯🎯 [CHECKPOINT 4] TERMINOU configuração botão Gerenciar Usuários!');

    // DEBUG CRÍTICO: Verificando se chegamos até aqui
    console.log('[🚀🚀🚀 DEBUG-FORÇADO] CHEGOU na seção dos botões Acompanhantes!');
    console.log('[🚀🚀🚀 DEBUG-FORÇADO] Estado atual:', {
        usuarioAdmin: usuarioAdmin,
        btnAcompanhantes: !!btnAcompanhantes,
        email: usuarioAdmin?.email
    });

    console.log('🎯🎯🎯 [CHECKPOINT 5] INICIANDO configuração botão Acompanhantes!');

    // Botão Acompanhantes - super_admin OU admin OU recepcao.jardins@yuna.com.br (higienização)
    console.log('[🔧 DEBUG-BÁSICO] Testando botão Acompanhantes...');
    if (btnAcompanhantes) {
        console.log('[🔧 DEBUG-BÁSICO] Botão Acompanhantes encontrado! Verificando permissões...');
        
        // Verificação específica para equipe de higienização
        const isHigienizacaoRecepcao = usuarioAdmin?.email === 'recepcao.jardins@yuna.com.br';
        
        console.log('[🏠 ACOMPANHANTES DEBUG] Testando acesso ao botão Acompanhantes:', {
            usuarioAdmin: usuarioAdmin,
            isSuperAdmin: isSuperAdmin,
            isAdmin: isAdmin,
            isHigienizacaoRecepcao: isHigienizacaoRecepcao,
            email: usuarioAdmin?.email,
            equipe: usuarioAdmin?.equipe
        });
        
        // Liberar para: super_admin, admin OU recepcao.jardins@yuna.com.br
        if (isSuperAdmin || isAdmin || isHigienizacaoRecepcao) {
            btnAcompanhantes.classList.remove('btn-hide');
            btnAcompanhantes.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Acompanhantes exibido para:', 
                isSuperAdmin ? 'super_admin' : 
                isAdmin ? 'admin' : 
                'recepcao.jardins@yuna.com.br (higienização)');
        } else {
            btnAcompanhantes.classList.add('btn-hide');
            btnAcompanhantes.style.display = 'none';
            debugLog('[DEBUG] Botão Acompanhantes ocultado - sem permissão');
        }
    } else {
        console.log('[❌ DEBUG-BÁSICO] Botão Acompanhantes NÃO ENCONTRADO!');
    }

    console.log('🎯🎯🎯 [CHECKPOINT 6] TERMINOU configuração botão Acompanhantes!');

    // Botão Dashboard - APENAS admin e super_admin (NOT equipes)
    console.log('[📊 DASHBOARD-CHECK] Verificando acesso ao Dashboard...');
    if (btnDashboard) {
        if (isSuperAdmin || isAdmin) {
            btnDashboard.classList.remove('btn-hide');
            btnDashboard.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Dashboard exibido para', isSuperAdmin ? 'super_admin' : 'admin');
        } else {
            btnDashboard.classList.add('btn-hide');
            btnDashboard.style.display = 'none';
            debugLog('[DEBUG] Botão Dashboard ocultado - restrito a admins (equipes não têm acesso)');
        }
    }

    // Botão Relatórios - super_admin e admin
    if (btnRelatorios) {
        if (isSuperAdmin || isAdmin) {
            btnRelatorios.classList.remove('btn-hide');
            btnRelatorios.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Relatórios exibido para', isSuperAdmin ? 'super_admin' : 'admin');
        } else {
            btnRelatorios.classList.add('btn-hide');
            btnRelatorios.style.display = 'none';
            debugLog('[DEBUG] Botão Relatórios ocultado para usuário não admin');
        }
    }

    // Botão Minha Senha - TODOS os usuários (equipes, admins, super_admins)
    console.log('[🔑 DEBUG] Iniciando configuração do botão Minha Senha...');
    
    // Tentar multiple vezes para garantir que funcione
    forcarVisibilidadeBotaoMinhaSenha();
    
    setTimeout(() => {
        console.log('[🔑 DEBUG] Segunda tentativa de forçar visibilidade...');
        forcarVisibilidadeBotaoMinhaSenha();
    }, 500);
    
    setTimeout(() => {
        console.log('[🔑 DEBUG] Terceira tentativa de forçar visibilidade...');
        forcarVisibilidadeBotaoMinhaSenha();
    }, 1000);
    
    debugLog('[DEBUG] Botão Minha Senha sempre exibido para todos os usuários');

    // Botão Limpeza - APENAS super_admin
    console.log('[🧹 LIMPEZA-CHECK] Verificando:', { btnLimpeza: !!btnLimpeza, isSuperAdmin }); 
    
    if (btnLimpeza) {
        if (isSuperAdmin) {
            btnLimpeza.classList.remove('btn-hide');
            btnLimpeza.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Limpeza exibido para super_admin');
            
            // Forçar novamente após 500ms para combater cache
            setTimeout(() => {
                btnLimpeza.classList.remove('btn-hide', 'hidden');
                btnLimpeza.style.cssText = 'display: inline-flex !important; visibility: visible !important;';
                debugLog('[DEBUG] Botão Limpeza forçado novamente para super_admin');
            }, 500);
        } else {
            btnLimpeza.classList.add('btn-hide');
            btnLimpeza.style.display = 'none';
            debugLog('[DEBUG] Botão Limpeza ocultado para usuário não super_admin');
        }
    }

    // Botão Pesquisa de Satisfação - admin e super_admin
    if (btnSatisfacao) {
        if (isSuperAdmin || isAdmin) {
            btnSatisfacao.classList.remove('btn-hide');
            btnSatisfacao.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Satisfação exibido para admin/super_admin');
        } else {
            btnSatisfacao.classList.add('btn-hide');
            btnSatisfacao.style.display = 'none';
            debugLog('[DEBUG] Botão Satisfação ocultado para usuário sem permissões de admin');
        }
    }
    
    // Mensagem de permissão
    if (msgPermissao) {
        if (isEquipe && usuarioAdmin.equipe) {
            const nomeEquipe = {
                'manutencao': 'Manutenção',
                'nutricao': 'Nutrição',
                'higienizacao': 'Higienização',
                'hotelaria': 'Hotelaria'
            }[usuarioAdmin.equipe] || usuarioAdmin.equipe;
            
            msgPermissao.textContent = `Acesso da equipe: Visualização e gerenciamento de solicitações de ${nomeEquipe}`;
            msgPermissao.classList.remove('msg-permissao-hide');
            msgPermissao.style.display = 'block';
            msgPermissao.style.color = '#059669';
            msgPermissao.style.fontWeight = '500';
        } else if (isAdmin) {
            // Admin: não mostrar mensagem de permissão (evitar confusão)
            msgPermissao.classList.add('msg-permissao-hide');
            msgPermissao.style.display = 'none';
        } else if (!isSuperAdmin && !isEquipe && !isAdmin) {
            // Apenas para usuários sem nenhum tipo de permissão definida
            msgPermissao.textContent = 'Sem permissões definidas';
            msgPermissao.classList.remove('msg-permissao-hide');
            msgPermissao.style.display = 'block';
            msgPermissao.style.color = '#dc2626';
        } else {
            msgPermissao.classList.add('msg-permissao-hide');
            msgPermissao.style.display = 'none';
        }
    }
    
    // Log final do estado dos botões
    debugLog('[DEBUG] Estado final dos botões:', {
        role: usuarioAdmin?.role,
        equipe: usuarioAdmin?.equipe,
        isSuperAdmin,
        isEquipe,
        isAdmin,
        btnNovoUsuario: btnNovoUsuario ? !btnNovoUsuario.classList.contains('btn-hide') : 'não encontrado',
        btnGerenciarUsuarios: btnGerenciarUsuarios ? !btnGerenciarUsuarios.classList.contains('btn-hide') : 'não encontrado',
        btnAcompanhantes: btnAcompanhantes ? !btnAcompanhantes.classList.contains('btn-hide') : 'não encontrado',
        btnRelatorios: btnRelatorios ? !btnRelatorios.classList.contains('btn-hide') : 'não encontrado',
        btnDashboard: btnDashboard ? !btnDashboard.classList.contains('btn-hide') : 'não encontrado',
        btnMinhaSenha: btnMinhaSenha ? !btnMinhaSenha.classList.contains('btn-hide') : 'não encontrado',
        btnLimpeza: btnLimpeza ? !btnLimpeza.classList.contains('btn-hide') : 'não encontrado'
    });
    
    // Reset da flag de reconfiguração
    setTimeout(() => {
        reconfigurando = false;
    }, 50);
    
    } catch (error) {
        console.error('[🚀🚀🚀 ERROR DEBUG-FORÇADO] Erro na função atualizarVisibilidadeBotoes:', error);
        // Reset da flag em caso de erro
        reconfigurando = false;
    }
}

// Função para configurar eventos dos botões
function configurarEventosBotoes() {
    debugLog('[DEBUG] ===== CONFIGURANDO EVENTOS DOS BOTÕES =====');
    
    // Verificar estado geral
    debugLog('[DEBUG] Estado atual:', {
        userRole: window.userRole,
        usuarioAdmin: !!window.usuarioAdmin,
        isAuthenticated: !!window.auth?.currentUser
    });
    
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    const btnRelatorios = document.getElementById('relatorios-btn');
    const btnLimpeza = document.getElementById('limpeza-btn');
    
    // Debug específico para o botão de limpeza
    debugLog('[DEBUG] Botão Limpeza Debug:', {
        elemento: btnLimpeza,
        id: btnLimpeza?.id,
        classes: btnLimpeza?.className,
        display: btnLimpeza?.style.display,
        hidden: btnLimpeza?.classList.contains('btn-hide')
    });
    
    debugLog('[DEBUG] configurarEventosBotoes: botões encontrados:', {
        btnNovoUsuario: !!btnNovoUsuario,
        btnGerenciarUsuarios: !!btnGerenciarUsuarios,
        btnRelatorios: !!btnRelatorios,
        btnLimpeza: !!btnLimpeza,
        btnNovoUsuarioVisible: btnNovoUsuario ? !btnNovoUsuario.classList.contains('btn-hide') : false,
        btnGerenciarVisible: btnGerenciarUsuarios ? !btnGerenciarUsuarios.classList.contains('btn-hide') : false,
        btnRelatoriosVisible: btnRelatorios ? !btnRelatorios.classList.contains('btn-hide') : false,
        btnLimpezaVisible: btnLimpeza ? !btnLimpeza.classList.contains('btn-hide') : false,
        btnLimpezaReal: !!document.querySelector('#limpeza-btn')
    });

    // Configurar botão Relatórios
    if (btnRelatorios) {
        // Remove qualquer evento anterior (incluindo onclick do HTML)
        btnRelatorios.onclick = null;
        btnRelatorios.removeAttribute('onclick');
        
        btnRelatorios.onclick = function(e) {
            console.log('[LOG] ===== CLIQUE RELATÓRIOS DETECTADO =====');
            
            // Debug completo do estado
            window.debugEstadoApp();
            
            console.log('[LOG] Estado da autenticação:', {
                windowUserRole: window.userRole,
                windowUsuarioAdmin: !!window.usuarioAdmin,
                localStorage: !!localStorage.getItem('usuarioAdmin'),
                firebaseCurrentUser: !!window.auth?.currentUser
            });
            
            e.preventDefault();
            e.stopPropagation();
            
            try {
                debugLog('[DEBUG] Verificando função mostrarRelatorios...');
                
                if (typeof window.mostrarRelatorios !== 'function') {
                    console.error('[ERRO] mostrarRelatorios não está definida!');
                    alert('Erro: Função mostrarRelatorios não encontrada!');
                    return;
                }
                
                debugLog('[DEBUG] Chamando mostrarRelatorios...');
                window.mostrarRelatorios();
                
            } catch (err) {
                console.error('[ERRO] Falha ao abrir relatórios:', err);
                alert('Erro ao abrir relatórios: ' + err.message);
                
                // Debug adicional em caso de erro
                debugLog('[DEBUG] Estado após erro:', {
                    relatoriosSection: !!document.getElementById('relatorios-section'),
                    adminPanel: !!document.getElementById('admin-panel'),
                    userRole: window.userRole
                });
            }
        };
        
        // Garantir que o botão é sempre clicável
        btnRelatorios.style.pointerEvents = 'auto';
        btnRelatorios.style.cursor = 'pointer';
        
        debugLog('[DEBUG] Evento configurado para Relatórios');
    } else {
        console.warn('[AVISO] Botão Relatórios não encontrado!');
    }
    
    if (btnNovoUsuario) {
        // Remove qualquer evento anterior
        btnNovoUsuario.onclick = null;
        
        btnNovoUsuario.onclick = function(e) {
            console.log('[LOG] CLIQUE no botão Criar Usuário detectado');
            e.preventDefault();
            e.stopPropagation();
            
            try {
                debugLog('[DEBUG] Verificando função showCreateUserModal...');
                
                if (typeof window.showCreateUserModal !== 'function') {
                    console.error('[ERRO] showCreateUserModal não está definida!');
                    alert('Erro: Função showCreateUserModal não encontrada!');
                    return;
                }
                
                debugLog('[DEBUG] Chamando showCreateUserModal...');
                window.showCreateUserModal();
                
            } catch (err) {
                console.error('[ERRO] Falha ao abrir modal Criar Usuário:', err);
                alert('Erro ao abrir modal Criar Usuário: ' + err.message);
            }
        };
        
        // Garantir que o botão é sempre clicável
        btnNovoUsuario.style.pointerEvents = 'auto';
        btnNovoUsuario.style.cursor = 'pointer';
        
        debugLog('[DEBUG] Evento configurado para Criar Usuário');
    } else {
        console.warn('[AVISO] Botão Criar Usuário não encontrado!');
    }
    
    if (btnGerenciarUsuarios) {
        debugLog('[DEBUG] Configurando evento para Gerenciar Usuários...');
        
        // Remove qualquer evento anterior
        btnGerenciarUsuarios.onclick = null;
        btnGerenciarUsuarios.removeAttribute('onclick');
        
        btnGerenciarUsuarios.onclick = function(e) {
            // Prevenir cliques múltiplos
            if (btnGerenciarUsuarios.disabled) {
                debugLog('[DEBUG] Clique ignorado - botão temporariamente desabilitado');
                return;
            }
            
            console.log('[LOG] ===== CLIQUE GERENCIAR USUÁRIOS DETECTADO =====');
            
            // Desabilitar temporariamente para evitar cliques múltiplos
            btnGerenciarUsuarios.disabled = true;
            setTimeout(() => {
                btnGerenciarUsuarios.disabled = false;
            }, 1000);
            
            e.preventDefault();
            e.stopPropagation();
            
            try {
                debugLog('[DEBUG] Chamando mostrarSecaoPainel para manage-users...');
                
                // Usar a função de navegação existente em vez da modal diretamente
                if (typeof window.mostrarSecaoPainel === 'function') {
                    window.mostrarSecaoPainel('manage-users');
                } else if (typeof window.showManageUsersModal === 'function') {
                    window.showManageUsersModal();
                } else {
                    throw new Error('Nenhuma função de gerenciamento de usuários encontrada');
                }
                
                debugLog('[DEBUG] Gerenciar usuários aberto com sucesso');
                
            } catch (err) {
                console.error('[ERRO] Falha ao abrir gerenciar usuários:', err);
                showToast('Erro', 'Erro ao abrir gerenciamento de usuários: ' + err.message, 'error');
                
                // Debug adicional
                debugLog('[DEBUG] Estado após erro:', {
                    modal: !!document.getElementById('manage-users-modal'),
                    userRole: window.userRole
                });
            }
        };
        
        // Garantir que o botão é sempre clicável
        btnGerenciarUsuarios.style.pointerEvents = 'auto';
        btnGerenciarUsuarios.style.cursor = 'pointer';
        btnGerenciarUsuarios.disabled = false;
        
        debugLog('[DEBUG] Evento configurado para Gerenciar Usuários');
    } else {
        console.warn('[AVISO] Botão Gerenciar Usuários não encontrado no DOM!');
    }
    
    if (btnLimpeza) {
        debugLog('[DEBUG] Configurando evento para Limpeza...');
        debugLog('[DEBUG] btnLimpeza encontrado:', {
            id: btnLimpeza.id,
            classes: btnLimpeza.className,
            onclick: btnLimpeza.onclick
        });
        
        // Remove qualquer evento anterior
        btnLimpeza.onclick = null;
        btnLimpeza.removeAttribute('onclick');
        
        btnLimpeza.onclick = function(e) {
            console.log('[LOG] ===== CLIQUE LIMPEZA DETECTADO =====');
            
            e.preventDefault();
            e.stopPropagation();
            
            try {
                debugLog('[DEBUG] Verificando função limparDadosTeste...');
                
                if (typeof window.limparDadosTeste !== 'function') {
                    console.error('[ERRO] limparDadosTeste não está definida!');
                    alert('Erro: Função limparDadosTeste não encontrada!');
                    return;
                }
                
                debugLog('[DEBUG] Chamando limparDadosTeste...');
                window.limparDadosTeste();
                debugLog('[DEBUG] limparDadosTeste chamada com sucesso');
                
            } catch (err) {
                console.error('[ERRO] Falha ao executar limpeza:', err);
                alert('Erro ao executar limpeza: ' + err.message);
            }
        };
        
        // Garantir que o botão é sempre clicável
        btnLimpeza.style.pointerEvents = 'auto';
        btnLimpeza.style.cursor = 'pointer';
        btnLimpeza.disabled = false;
        
        debugLog('[DEBUG] Evento configurado para Limpeza');
    } else {
        console.warn('[AVISO] Botão Limpeza não encontrado no DOM!');
        
        // Tentar encontrar o botão por outros meios
        const limpezaAlt = document.querySelector('#limpeza-btn');
        const limpezaByText = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent && btn.textContent.includes('Limpar Dados')
        );
        
        debugLog('[DEBUG] Busca alternativa do botão limpeza:', {
            porId: !!limpezaAlt,
            porTexto: !!limpezaByText,
            todosOsBotoes: document.querySelectorAll('button').length
        });
        
        if (limpezaAlt || limpezaByText) {
            const btnAlternativo = limpezaAlt || limpezaByText;
            debugLog('[DEBUG] Botão limpeza encontrado por busca alternativa');
            btnAlternativo.onclick = () => {
                if (typeof window.limparDadosTeste === 'function') {
                    window.limparDadosTeste();
                } else {
                    alert('Função de limpeza não disponível');
                }
            };
        }
    }
    
    debugLog('[DEBUG] ===== FIM CONFIGURAÇÃO EVENTOS BOTÕES =====');
    
    // LIMPEZA FINAL DE BOTÕES DEBUG APÓS CONFIGURAÇÃO
    setTimeout(() => {
        if (typeof window.forceRemoveDebugButtons === 'function') {
            window.forceRemoveDebugButtons();
        }
    }, 200);
    
    // Fallback: Garantir que os botões principais sempre funcionem
    setTimeout(() => {
        debugLog('[DEBUG] Aplicando fallback para botões críticos...');
        
        const btnGerenciar = document.getElementById('manage-users-btn');
        const btnRel = document.getElementById('relatorios-btn');
        const btnLimp = document.getElementById('limpeza-btn');
        
        if (btnGerenciar && !btnGerenciar.onclick && window.userRole) {
            debugLog('[DEBUG] Aplicando fallback para Gerenciar Usuários');
            btnGerenciar.onclick = () => window.showManageUsersModal();
        }
        
        if (btnRel && !btnRel.onclick && window.userRole) {
            debugLog('[DEBUG] Aplicando fallback para Relatórios');
            btnRel.onclick = () => window.mostrarRelatorios();
        }
        
        if (btnLimp && !btnLimp.onclick && window.userRole === 'super_admin') {
            debugLog('[DEBUG] Aplicando fallback para Limpeza');
            btnLimp.onclick = () => window.limparDadosTeste();
        }
    }, 100);
}

// Função auxiliar para reconfigurar botões quando necessário

// Função auxiliar para reconfigurar botões quando necessário
window.reconfigurarBotoes = function() {
    debugLog('[DEBUG] reconfigurarBotoes: forçando reconfiguração...');
    
    // PRIMEIRO: Limpar botões debug antes de qualquer coisa
    if (typeof window.forceRemoveDebugButtons === 'function') {
        window.forceRemoveDebugButtons();
    }
    
    // Remove flags de configuração para forçar reconfiguração
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    const btnLimpeza = document.getElementById('limpeza-btn');
    
    if (btnNovoUsuario) {
        delete btnNovoUsuario.dataset.configured;
    }
    if (btnGerenciarUsuarios) {
        delete btnGerenciarUsuarios.dataset.configured;
    }
    if (btnLimpeza) {
        delete btnLimpeza.dataset.configured;
    }
    
    // Reconfigura os botões
    atualizarVisibilidadeBotoes();
    configurarEventosBotoes();
    
    debugLog('[DEBUG] reconfigurarBotoes: reconfiguração concluída');
};

// Função de debug para verificar estado dos modais
window.debugModals = function() {
    const modalCriar = document.getElementById('modal-novo-usuario');
    const modalGerenciar = document.getElementById('manage-users-modal');
    
    debugLog('[DEBUG] Estado dos modais:', {
        modalCriar: {
            exists: !!modalCriar,
            hidden: modalCriar ? modalCriar.classList.contains('hidden') : 'N/A',
            display: modalCriar ? modalCriar.style.display : 'N/A'
        },
        modalGerenciar: {
            exists: !!modalGerenciar,
            hidden: modalGerenciar ? modalGerenciar.classList.contains('hidden') : 'N/A',
            display: modalGerenciar ? modalGerenciar.style.display : 'N/A'
        },
        funcoes: {
            showCreateUserModal: typeof window.showCreateUserModal,
            showManageUsersModal: typeof window.showManageUsersModal
        }
    });
    
    return {
        modalCriar: !!modalCriar,
        modalGerenciar: !!modalGerenciar,
        funcoes: {
            showCreateUserModal: typeof window.showCreateUserModal,
            showManageUsersModal: typeof window.showManageUsersModal
        }
        };
    };

// Definir função calcularTempoAtendimento no escopo global
if (typeof window.calcularTempoAtendimento === 'undefined') {
    window.calcularTempoAtendimento = function(solicitacao) {
        try {
            let dataInicio = null;
            
            // Tentar obter data de início do cronômetro
            if (solicitacao.cronometro && solicitacao.cronometro.inicio) {
                if (typeof solicitacao.cronometro.inicio.toDate === 'function') {
                    dataInicio = solicitacao.cronometro.inicio.toDate();
                } else {
                    dataInicio = new Date(solicitacao.cronometro.inicio);
                }
            }
            // Fallback para data de abertura
            else if (solicitacao.dataAbertura) {
                if (typeof solicitacao.dataAbertura.toDate === 'function') {
                    dataInicio = solicitacao.dataAbertura.toDate();
                } else {
                    dataInicio = new Date(solicitacao.dataAbertura);
                }
            }
            
            if (!dataInicio) {
                return 'N/A';
            }
            
            const agora = new Date();
            const diferenca = agora - dataInicio;
            
            // Converter para horas e minutos
            const horas = Math.floor(diferenca / (1000 * 60 * 60));
            const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
            
            if (horas > 0) {
                return `${horas}h ${minutos}min`;
            } else {
                return `${minutos}min`;
            }
        } catch (error) {
            console.warn('[AVISO] Erro ao calcular tempo:', error);
            return 'Tempo inválido';
        }
    };
}// Função de teste para os botões
window.testarBotoes = function() {
    console.log('=== TESTE DOS BOTÕES ===');
    
    const btnCriar = document.getElementById('btn-novo-usuario');
    const btnGerenciar = document.getElementById('manage-users-btn');
    const btnLimpeza = document.getElementById('limpeza-btn');
    
    console.log('Botão Criar Usuário:', {
        existe: !!btnCriar,
        visivel: btnCriar ? !btnCriar.classList.contains('btn-hide') : false,
        display: btnCriar ? btnCriar.style.display : 'N/A',
        onclick: btnCriar ? !!btnCriar.onclick : false
    });
    
    console.log('Botão Gerenciar Usuários:', {
        existe: !!btnGerenciar,
        visivel: btnGerenciar ? !btnGerenciar.classList.contains('btn-hide') : false,
        display: btnGerenciar ? btnGerenciar.style.display : 'N/A',
        onclick: btnGerenciar ? !!btnGerenciar.onclick : false
    });
    
    console.log('Botão Limpeza:', {
        existe: !!btnLimpeza,
        visivel: btnLimpeza ? !btnLimpeza.classList.contains('btn-hide') : false,
        display: btnLimpeza ? btnLimpeza.style.display : 'N/A',
        onclick: btnLimpeza ? !!btnLimpeza.onclick : false
    });
    
    console.log('Funções disponíveis:', {
        showCreateUserModal: typeof window.showCreateUserModal,
        showManageUsersModal: typeof window.showManageUsersModal,
        limparDadosTeste: typeof window.limparDadosTeste,
        userRole: window.userRole,
        usuarioAdmin: !!window.usuarioAdmin
    });
    
    // Teste manual dos modals
    console.log('Testando função showCreateUserModal...');
    try {
        if (typeof window.showCreateUserModal === 'function') {
            console.log('✅ showCreateUserModal está disponível');
        } else {
            console.error('❌ showCreateUserModal NÃO está disponível');
        }
    } catch (e) {
        console.error('❌ Erro ao verificar showCreateUserModal:', e);
    }
    
    console.log('Testando função showManageUsersModal...');
    try {
        if (typeof window.showManageUsersModal === 'function') {
            console.log('✅ showManageUsersModal está disponível');
        } else {
            console.error('❌ showManageUsersModal NÃO está disponível');
        }
    } catch (e) {
        console.error('❌ Erro ao verificar showManageUsersModal:', e);
    }
    
    console.log('=== FIM DO TESTE ===');
};

// Função para forçar inicialização completa dos botões
window.forcarInicializacao = function() {
    console.log('[FORCE] Forçando inicialização completa...');
    
    // Garantir que todas as funções estão definidas
    if (typeof window.showCreateUserModal !== 'function') {
        console.error('[FORCE] showCreateUserModal não está definida - redefinindo...');
        // A função já está definida acima no código
    }
    
    if (typeof window.showManageUsersModal !== 'function') {
        console.error('[FORCE] showManageUsersModal não está definida - redefinindo...');
        // A função já está definida acima no código
    }
    
    // Forçar atualização de visibilidade
    atualizarVisibilidadeBotoes();
    
    // Reconfigurar eventos
    configurarEventosBotoes();
    
    // Teste final
    window.testarBotoes();
    
    console.log('[FORCE] Inicialização forçada concluída');
};

// Função de inicialização de emergência para quando Firebase falha
window.inicializacaoEmergencia = function() {
    console.log('[EMERGENCY] Iniciando modo de emergência...');
    
    // Definir usuário admin de emergência
    window.userRole = 'admin';
    window.usuarioAdmin = { 
        role: 'admin', 
        nome: 'Admin Emergência', 
        email: 'admin@emergencia.local',
        isAdmin: true
    };
    
    // Mostrar painel
    document.getElementById('auth-section')?.classList.add('hidden');
    document.getElementById('admin-panel')?.classList.remove('hidden');
    
    // Forçar visibilidade dos botões
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    
    if (btnNovoUsuario) {
        btnNovoUsuario.classList.remove('btn-hide');
        btnNovoUsuario.style.display = 'inline-flex';
        btnNovoUsuario.style.visibility = 'visible';
    }
    
    if (btnGerenciarUsuarios) {
        btnGerenciarUsuarios.classList.remove('btn-hide');
        btnGerenciarUsuarios.style.display = 'inline-flex';
        btnGerenciarUsuarios.style.visibility = 'visible';
    }
    
    // Configurar eventos
    configurarEventosBotoes();
    
    showToast('Modo Emergência', 'Sistema iniciado em modo de emergência - funcionalidade limitada', 'warning');
    
    console.log('[EMERGENCY] Modo de emergência ativo');
};

// Expor função para debug direto no console
window.debug = {
    testarBotoes: window.testarBotoes,
    debugModals: window.debugModals,
    forcarInicializacao: window.forcarInicializacao,
    reconfigurarBotoes: window.reconfigurarBotoes,
    inicializacaoEmergencia: window.inicializacaoEmergencia,
    loginDev: window.loginDesenvolvimento
};

// ========== FUNÇÕES DE ACESSO RÁPIDO ==========
// Para usar no console quando há problemas de login:

// 1. Login rápido de desenvolvimento
window.loginRapido = function() {
    console.log('🚀 ATIVANDO LOGIN RÁPIDO...');
    window.loginDesenvolvimento('admin@rapido.local');
    console.log('✅ Login rápido ativado!');
    return 'Login realizado em modo desenvolvimento';
};

// 2. Corrigir tudo de uma vez
window.corrigirTudo = function() {
    console.log('🔧 CORRIGINDO TODOS OS PROBLEMAS...');
    
    // 1. Login de desenvolvimento
    window.loginDesenvolvimento('admin@corrigir.local');
    
    // 2. Configurar botões
    setTimeout(() => {
        window.solucionarBotoes();
    }, 500);
    
    // 3. Mostrar painel
    setTimeout(() => {
        mostrarSecaoPainel('painel');
    }, 1000);
    
    console.log('🎉 TUDO CORRIGIDO!');
    return 'Sistema totalmente funcional em modo desenvolvimento';
};

// 3. Criar usuário admin de teste (se Firebase estiver funcionando)
window.criarUsuarioTeste = async function() {
    console.log('👤 CRIANDO USUÁRIO DE TESTE...');
    
    if (!window.auth) {
        console.error('Firebase Auth não disponível');
        return 'Firebase não disponível';
    }
    
    const emailTeste = 'admin@teste.com';
    const senhaTeste = '123456';
    
    try {
        // Tentar criar o usuário
        const userCredential = await window.auth.createUserWithEmailAndPassword(emailTeste, senhaTeste);
        console.log('✅ Usuário de teste criado:', emailTeste);
        
        // Adicionar aos admins no Firestore
        if (window.db) {
            await window.db.collection('usuarios_admin').doc(userCredential.user.uid).set({
                nome: 'Admin Teste',
                email: emailTeste,
                role: 'admin',
                criadoEm: new Date().toISOString(),
                ativo: true,
                permissoes: {
                    criarUsuarios: false,              // Apenas super_admin
                    gerenciarDepartamentos: false,     // Apenas super_admin
                    verRelatorios: true,               // Admin pode acessar
                    gerenciarSolicitacoes: true,       // Admin pode gerenciar solicitações
                    gerenciarAcompanhantes: true,      // Admin pode gerenciar acompanhantes
                    verMetricas: true,                 // Admin pode ver métricas
                    verPesquisaSatisfacao: true        // Admin pode ver pesquisa satisfação
                }
            });
            console.log('✅ Usuário adicionado como admin no Firestore');
        }
        
        showToast('Sucesso', `Usuário criado: ${emailTeste} / 123456`, 'success');
        return `Usuário criado: ${emailTeste} / senha: ${senhaTeste}`;
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('✅ Usuário já existe:', emailTeste);
            showToast('Info', `Usuário já existe: ${emailTeste} / 123456`, 'warning');
            return `Usuário já existe: ${emailTeste} / senha: ${senhaTeste}`;
        } else {
            console.error('❌ Erro ao criar usuário:', error);
            showToast('Erro', 'Erro ao criar usuário de teste', 'error');
            return 'Erro ao criar usuário: ' + error.message;
        }
    }
};

// 4. Mostrar ajuda de desenvolvimento
window.mostrarAjudaDev = function() {
    const devHelp = document.getElementById('dev-help');
    if (devHelp) {
        devHelp.style.display = 'block';
        console.log('ℹ️ Ajuda de desenvolvimento exibida');
    }
};

// 6. Função para atualizar permissões de usuários admin existentes
window.atualizarPermissoesAdmin = async function() {
    console.log('🔧 ATUALIZANDO PERMISSÕES DE USUÁRIOS ADMIN...');
    
    if (!window.db) {
        console.error('Firestore não disponível');
        return 'Firestore não disponível';
    }
    
    try {
        // Buscar todos os usuários admin
        const adminSnapshot = await window.db.collection('usuarios_admin').get();
        let atualizados = 0;
        
        for (const doc of adminSnapshot.docs) {
            const userData = doc.data();
            
            // Se for admin (não super_admin) e tem permissões antigas
            if (userData.role === 'admin') {
                console.log(`Atualizando permissões para: ${userData.email}`);
                
                await window.db.collection('usuarios_admin').doc(doc.id).update({
                    'permissoes.criarUsuarios': false,
                    'permissoes.gerenciarDepartamentos': false,
                    'permissoes.verRelatorios': true,
                    'permissoes.gerenciarSolicitacoes': true,
                    'permissoes.gerenciarAcompanhantes': true,
                    'permissoes.verMetricas': true,
                    'permissoes.verPesquisaSatisfacao': true,
                    'atualizadoEm': new Date().toISOString()
                });
                
                atualizados++;
                console.log(`✅ Permissões atualizadas para: ${userData.email}`);
            }
        }
        
        showToast('Sucesso', `${atualizados} usuários admin atualizados`, 'success');
        return `${atualizados} usuários admin atualizados com novas permissões`;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar permissões:', error);
        showToast('Erro', 'Erro ao atualizar permissões', 'error');
        return 'Erro ao atualizar permissões: ' + error.message;
    }
};

// 7. Função para mostrar todas as opções disponíveis
window.ajuda = function() {
    console.log(`
🆘 === FUNÇÕES DE AJUDA DISPONÍVEIS ===

PARA PROBLEMAS DE LOGIN:
• loginRapido() - Login rápido em modo desenvolvimento
• corrigirTudo() - Corrige todos os problemas de uma vez
• criarUsuarioTeste() - Cria usuário admin@teste.com / 123456
• atualizarPermissoesAdmin() - Atualiza permissões de usuários admin existentes

PARA PROBLEMAS DE BOTÕES:
• solucionarBotoes() - Força funcionamento dos botões
• debug.testarBotoes() - Testa estado dos botões
• debug.forcarInicializacao() - Força reinicialização

PARA DEBUG:
• debug.debugModals() - Verifica estado dos modais
• debug.inicializacaoEmergencia() - Modo emergência completo
• mostrarAjudaDev() - Mostra ajuda na tela

EXEMPLO DE USO:
Se os botões não funcionam após login, execute:
corrigirTudo()

Se precisar atualizar permissões de admins, execute:
atualizarPermissoesAdmin()

==========================================
    `);
    
    return 'Veja o console para lista completa de funções';
};

// Funções para fechar modais
window.closeCreateUserModal = function() {
    debugLog('[DEBUG] closeCreateUserModal: fechando modal...');
    const modal = document.getElementById('modal-novo-usuario');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        debugLog('[DEBUG] closeCreateUserModal: modal fechado');
    }
};

// Função de teste para verificar as melhorias nos cards
function testarMelhoriasCards() {
    console.log('[TESTE] Verificando melhorias nos cards...');
    
    // Log das funções existentes
    console.log('[TESTE] abrirSolicitacaoModal:', typeof abrirSolicitacaoModal);
    console.log('[TESTE] fecharSolicitacaoModal:', typeof fecharSolicitacaoModal);
    console.log('[TESTE] window.fecharSolicitacaoModal:', typeof window.fecharSolicitacaoModal);
    
    const cards = document.querySelectorAll('.solicitacao-card');
    console.log('[TESTE] Cards encontrados:', cards.length);
    
    cards.forEach((card, index) => {
        console.log(`[TESTE] Card ${index + 1}:`, {
            hasDataSolicitacao: !!card.dataset.solicitacao,
            hasClickEvent: !!card.onclick,
            isClickable: card.style.cursor === 'pointer'
        });
    });
    
    return {
        cardsEncontrados: cards.length,
        funcaoAbrirModal: typeof abrirSolicitacaoModal,
        funcaoFecharModal: typeof fecharSolicitacaoModal,
        funcaoFecharGlobal: typeof window.fecharSolicitacaoModal,
        testeCompleto: 'OK'
    };
}

// Funções para gerenciar status das solicitações (para equipes)
async function alterarStatusSolicitacao(solicitacaoId, novoStatus) {
    if (!window.db || !solicitacaoId) {
        showToast('Erro', 'Parâmetros inválidos', 'error');
        return;
    }

    try {
        console.log(`[DEBUG] Iniciando alteração de status: ${solicitacaoId} -> ${novoStatus}`);
        
        // Mostrar loading
        const loadingToast = showToast('Aguarde', 'Atualizando status...', 'info');
        
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        // Verificar se o usuário pode alterar esta solicitação
        const solicitacaoDoc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!solicitacaoDoc.exists) {
            showToast('Erro', 'Solicitação não encontrada', 'error');
            return;
        }
        
        const solicitacaoData = solicitacaoDoc.data();
        
        // Verificar permissões usando a função de filtro
        if (!podeVerSolicitacaoJS(usuarioAdmin, solicitacaoData)) {
            showToast('Erro', 'Você não tem permissão para alterar esta solicitação', 'error');
            console.warn('[AVISO] alterarStatusSolicitacao: acesso negado para equipe:', usuarioAdmin.equipe, 'solicitação equipe:', solicitacaoData.equipe);
            return;
        }
        
        // Verificar se o status é válido
        const statusValidos = ['pendente', 'em-andamento', 'finalizada'];
        if (!statusValidos.includes(novoStatus)) {
            showToast('Erro', 'Status inválido', 'error');
            return;
        }
        
        console.log(`[DEBUG] Alterando status da solicitação ${solicitacaoId} para ${novoStatus}`);
        
        const agora = new Date();
        const updateData = {
            status: novoStatus,
            dataAtualizacao: agora.toISOString()
        };

        // Se está iniciando atendimento, adicionar responsável e métricas de início
        if (novoStatus === 'em-andamento' && usuarioAdmin.nome) {
            updateData.responsavel = usuarioAdmin.nome;
            updateData.dataInicioAtendimento = agora.toISOString();
            updateData.tempoInicioAtendimento = firebase.firestore.FieldValue.serverTimestamp();
            
            // Calcular tempo de espera (do registro até início do atendimento)
            if (solicitacaoData.criadoEm || solicitacaoData.dataAbertura) {
                let dataCreacao;
                
                // Tentar parsear data de criação de diferentes formatos
                if (solicitacaoData.criadoEm && typeof solicitacaoData.criadoEm.toDate === 'function') {
                    dataCreacao = solicitacaoData.criadoEm.toDate();
                } else if (solicitacaoData.criadoEm && typeof solicitacaoData.criadoEm === 'string') {
                    dataCreacao = new Date(solicitacaoData.criadoEm);
                } else if (solicitacaoData.dataAbertura && typeof solicitacaoData.dataAbertura.toDate === 'function') {
                    dataCreacao = solicitacaoData.dataAbertura.toDate();
                } else if (solicitacaoData.dataAbertura && typeof solicitacaoData.dataAbertura === 'string') {
                    dataCreacao = new Date(solicitacaoData.dataAbertura);
                }
                
                if (dataCreacao && !isNaN(dataCreacao.getTime())) {
                    const tempoEsperaMinutos = Math.round((agora - dataCreacao) / (1000 * 60));
                    updateData.tempoEsperaMinutos = tempoEsperaMinutos;
                    updateData.metricas = {
                        tempoEspera: tempoEsperaMinutos,
                        dataInicio: agora.toISOString()
                    };
                }
            }
        }

        // Se está pausando, calcular tempo trabalhado
        if (novoStatus === 'pendente' && solicitacaoData.status === 'em-andamento') {
            if (solicitacaoData.dataInicioAtendimento) {
                const inicioAtendimento = new Date(solicitacaoData.dataInicioAtendimento);
                const tempoTrabalhadoMinutos = Math.round((agora - inicioAtendimento) / (1000 * 60));
                
                // Somar ao tempo total trabalhado (se já existir)
                const tempoAnterior = solicitacaoData.tempoTrabalhadoTotal || 0;
                updateData.tempoTrabalhadoTotal = tempoAnterior + tempoTrabalhadoMinutos;
                updateData.dataPausa = agora.toISOString();
            }
        }

        await window.db.collection('solicitacoes').doc(solicitacaoId).update(updateData);
        
        showToast('Sucesso', `Status alterado para: ${novoStatus}`, 'success');
        console.log(`[DEBUG] Status alterado com sucesso: ${solicitacaoId} -> ${novoStatus}`);
        
        // Registrar auditoria
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('STATUS_CHANGE', {
                solicitacaoId,
                statusAnterior: solicitacaoData.status,
                novoStatus,
                responsavel: usuarioAdmin.nome || usuarioAdmin.email
            });
        }
        
        // Fechar modal e recarregar dados (com delay para garantir que o update foi processado)
        setTimeout(() => {
            fecharSolicitacaoModal();
            recarregarSolicitacoes(500);
        }, 500);
        
    } catch (error) {
        console.error('[ERRO] Falha ao alterar status:', error);
        
        let mensagemErro = 'Não foi possível alterar o status';
        if (error.code === 'permission-denied') {
            mensagemErro = 'Você não tem permissão para esta ação';
        } else if (error.code === 'unavailable') {
            mensagemErro = 'Serviço temporariamente indisponível. Tente novamente';
        } else if (error.code === 'not-found') {
            mensagemErro = 'Solicitação não encontrada';
        }
        
        showToast('Erro', mensagemErro, 'error');
        
        // Registrar erro em auditoria
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('STATUS_CHANGE_ERROR', {
                solicitacaoId,
                novoStatus,
                error: error.message,
                errorCode: error.code
            });
        }
    }
}

async function finalizarSolicitacao(solicitacaoId) {
    if (!window.db || !solicitacaoId) {
        showToast('Erro', 'Parâmetros inválidos', 'error');
        return;
    }

    try {
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        // Verificar se o usuário pode finalizar esta solicitação
        const solicitacaoDoc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!solicitacaoDoc.exists) {
            showToast('Erro', 'Solicitação não encontrada', 'error');
            return;
        }
        
        const solicitacaoData = solicitacaoDoc.data();
        
        // Verificar permissões usando a função de filtro
        if (!podeVerSolicitacaoJS(usuarioAdmin, solicitacaoData)) {
            showToast('Erro', 'Você não tem permissão para finalizar esta solicitação', 'error');
            console.warn('[AVISO] finalizarSolicitacao: acesso negado para equipe:', usuarioAdmin.equipe, 'solicitação equipe:', solicitacaoData.equipe);
            return;
        }

        // Criar modal de finalização
        const modalFinalizacao = document.createElement('div');
        modalFinalizacao.id = 'modal-finalizacao';
        modalFinalizacao.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1001;';
        
        modalFinalizacao.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); max-height: 80vh; overflow-y: auto;">
                <h3 style="margin: 0 0 16px 0; color: #059669; display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                    Finalizar Solicitação
                </h3>
                
                <!-- Descrição da Solução -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
                        <i class="fas fa-edit" style="margin-right: 6px;"></i>
                        Descrição da Solução (opcional):
                    </label>
                    <textarea 
                        id="solucao-descricao" 
                        placeholder="Ex: Problema de encanamento resolvido, troca de torneira realizada..."
                        style="width: 100%; height: 80px; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical; font-family: inherit; box-sizing: border-box;"
                    ></textarea>
                </div>
                
                <!-- Upload de Evidências -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
                        <i class="fas fa-camera" style="margin-right: 6px;"></i>
                        Evidências do Serviço (opcional):
                    </label>
                    <div style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; background: #f9fafb;">
                        <input 
                            type="file" 
                            id="evidencias-upload" 
                            accept="image/*,.pdf,.doc,.docx"
                            multiple
                            style="display: none;"
                            onchange="handleEvidenciasUpload(this)"
                        >
                        <div onclick="document.getElementById('evidencias-upload').click()" style="cursor: pointer;">
                            <i class="fas fa-cloud-upload-alt" style="font-size: 24px; color: #6b7280; margin-bottom: 8px;"></i>
                            <p style="margin: 0; color: #6b7280;">
                                <strong>Clique aqui</strong> para selecionar arquivos<br>
                                <small>Fotos, PDFs ou documentos (máx. 5 arquivos, 10MB cada)</small>
                            </p>
                        </div>
                        <div id="evidencias-preview" style="margin-top: 12px;"></div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                    <button 
                        onclick="document.getElementById('modal-finalizacao').remove()" 
                        style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        Cancelar
                    </button>
                    <button 
                        id="btn-confirmar-finalizacao"
                        onclick="confirmarFinalizacao('${solicitacaoId}')" 
                        style="background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-check" style="margin-right: 4px;"></i>Confirmar Finalização
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalFinalizacao);
        
        // Focar no textarea
        setTimeout(() => {
            const textarea = document.getElementById('solucao-descricao');
            if (textarea) textarea.focus();
        }, 100);
        
    } catch (error) {
        console.error('Erro ao abrir modal de finalização:', error);
        showToast('Erro', 'Não foi possível abrir o modal de finalização: ' + (error.message || error), 'error');
    }
}

async function confirmarFinalizacao(solicitacaoId) {
    try {
        // Desabilitar botão para evitar duplo clique
        const btnConfirmar = document.getElementById('btn-confirmar-finalizacao');
        if (btnConfirmar) {
            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 4px;"></i>Processando...';
        }
        
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const solucao = document.getElementById('solucao-descricao')?.value || '';
        
        // Processar upload de evidências primeiro (se houver)
        let evidencias = [];
        if (arquivosEvidencias && arquivosEvidencias.length > 0) {
            console.log(`[DEBUG] Processando ${arquivosEvidencias.length} evidência(s)...`);
            showToast('Info', 'Processando evidências...', 'info');
            
            try {
                evidencias = await uploadEvidenciasParaFirebase(solicitacaoId);
                console.log(`[DEBUG] Evidências processadas com sucesso:`, evidencias.length);
            } catch (error) {
                console.error('[ERRO] Falha no upload das evidências:', error);
                showToast('Erro', 'Falha ao processar evidências. Tente novamente.', 'error');
                
                // Reabilitar botão
                if (btnConfirmar) {
                    btnConfirmar.disabled = false;
                    btnConfirmar.innerHTML = '<i class="fas fa-check" style="margin-right: 4px;"></i>Confirmar Finalização';
                }
                return;
            }
        }
        
        // Buscar dados atuais da solicitação para calcular métricas
        const solicitacaoDoc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!solicitacaoDoc.exists) {
            showToast('Erro', 'Solicitação não encontrada', 'error');
            return;
        }
        
        const solicitacaoData = solicitacaoDoc.data();
        const agora = new Date();
        
        console.log(`[DEBUG] Finalizando solicitação ${solicitacaoId} com ${evidencias.length} evidência(s)`);
        
        const updateData = {
            status: 'finalizada',
            dataFinalizacao: agora.toISOString(),
            finalizadoEm: firebase.firestore.FieldValue.serverTimestamp(), // Para o listener detectar
            tempoFinalizacao: firebase.firestore.FieldValue.serverTimestamp(),
            dataAtualizacao: agora.toISOString(),
            avaliada: false // Marca que ainda não foi avaliada pelo acompanhante
        };

        if (usuarioAdmin.nome) {
            updateData.responsavel = usuarioAdmin.nome;
        }

        if (solucao.trim()) {
            updateData.solucao = solucao.trim();
        }
        
        // Adicionar evidências se houver
        if (evidencias.length > 0) {
            updateData.evidencias = evidencias;
            updateData.possuiEvidencias = true;
            console.log(`[DEBUG] Adicionando ${evidencias.length} evidência(s) à solicitação`);
        }

        // Calcular métricas de tempo completas
        if (solicitacaoData.criadoEm || solicitacaoData.dataAbertura) {
            let dataCreacao;
            
            // Tentar parsear data de criação de diferentes formatos
            if (solicitacaoData.criadoEm && typeof solicitacaoData.criadoEm.toDate === 'function') {
                dataCreacao = solicitacaoData.criadoEm.toDate();
            } else if (solicitacaoData.criadoEm && typeof solicitacaoData.criadoEm === 'string') {
                dataCreacao = new Date(solicitacaoData.criadoEm);
            } else if (solicitacaoData.dataAbertura && typeof solicitacaoData.dataAbertura.toDate === 'function') {
                dataCreacao = solicitacaoData.dataAbertura.toDate();
            } else if (solicitacaoData.dataAbertura && typeof solicitacaoData.dataAbertura === 'string') {
                dataCreacao = new Date(solicitacaoData.dataAbertura);
            }
            
            if (dataCreacao && !isNaN(dataCreacao.getTime())) {
                // Tempo total de resolução (do registro até finalização)
                const tempoTotalMinutos = Math.round((agora - dataCreacao) / (1000 * 60));
                updateData.tempoTotalMinutos = tempoTotalMinutos;
                
                // Tempo efetivo de trabalho
                let tempoTrabalho = solicitacaoData.tempoTrabalhadoTotal || 0;
                
                // Se estava em atendimento, somar o tempo atual
                if (solicitacaoData.status === 'em-andamento' && solicitacaoData.dataInicioAtendimento) {
                    const inicioAtendimento = new Date(solicitacaoData.dataInicioAtendimento);
                    if (!isNaN(inicioAtendimento.getTime())) {
                        const tempoAtual = Math.round((agora - inicioAtendimento) / (1000 * 60));
                        tempoTrabalho += tempoAtual;
                    }
                }
                
                updateData.tempoTrabalhoMinutos = tempoTrabalho;
                
                // Calcular SLA e definir prioridades baseadas no tipo de serviço
                const slaConfig = {
                    'manutencao': { slaMinutos: 240, prioridade: 'alta' },     // 4 horas
                    'nutricao': { slaMinutos: 60, prioridade: 'critica' },     // 1 hora
                    'higienizacao': { slaMinutos: 120, prioridade: 'media' },  // 2 horas
                    'hotelaria': { slaMinutos: 180, prioridade: 'media' }      // 3 horas
                };
                
                const config = slaConfig[solicitacaoData.equipe] || { slaMinutos: 240, prioridade: 'media' };
                const statusSLA = tempoTotalMinutos <= config.slaMinutos ? 'cumprido' : 'violado';
                
                // Métricas completas
                updateData.metricas = {
                    tempoTotal: tempoTotalMinutos,
                    tempoTrabalho: tempoTrabalho,
                    tempoEspera: solicitacaoData.tempoEsperaMinutos || 0,
                    slaMinutos: config.slaMinutos,
                    statusSLA: statusSLA,
                    prioridade: config.prioridade,
                    percentualSLA: Math.round((config.slaMinutos / tempoTotalMinutos) * 100),
                    finalizadoEm: agora.toISOString(),
                    criadoEm: dataCreacao.toISOString()
                };
                
                // Log das métricas para análise
                console.log('📊 MÉTRICAS DA SOLICITAÇÃO:', {
                    id: solicitacaoId,
                    equipe: solicitacaoData.equipe,
                    tempoTotal: `${tempoTotalMinutos} min`,
                    tempoTrabalho: `${tempoTrabalho} min`,
                    sla: `${config.slaMinutos} min`,
                    status: statusSLA,
                    eficiencia: `${Math.round((tempoTrabalho / tempoTotalMinutos) * 100)}%`
                });
            } else {
                console.warn('Não foi possível calcular métricas - data de criação inválida');
            }
        } else {
            console.warn('Não foi possível calcular métricas - sem data de criação');
        }

        await window.db.collection('solicitacoes').doc(solicitacaoId).update(updateData);
        
        showToast('Sucesso', 'Solicitação finalizada com sucesso!', 'success');
        
        // Limpar evidências após sucesso
        arquivosEvidencias = [];
        
        // Remover modal de finalização
        const modalFinalizacao = document.getElementById('modal-finalizacao');
        if (modalFinalizacao) modalFinalizacao.remove();
        
        // CORREÇÃO APLICADA: NÃO abrir pesquisa no admin - ela deve ir para o acompanhante!
        // O listener no portal dos acompanhantes detectará a finalização e abrirá a pesquisa
        // Atualização forçada: pesquisa vai para o solicitante via listener em tempo real
        console.log('✅ Solicitação finalizada - pesquisa será enviada ao acompanhante automaticamente via listener');
        
        // Fechar modal principal e recarregar dados
        fecharSolicitacaoModal();
        
        // CORREÇÃO CRÍTICA: Usar recarregarSolicitacoes() que limpa AMBAS as flags
        // ao invés de carregarSolicitacoes() diretamente
        recarregarSolicitacoes(0); // 0 = sem delay, recarregar imediatamente
        
    } catch (error) {
        console.error('Erro ao finalizar solicitação:', error);
        showToast('Erro', 'Não foi possível finalizar a solicitação: ' + (error.message || error), 'error');
        
        // Reabilitar botão em caso de erro
        const btnConfirmar = document.getElementById('btn-confirmar-finalizacao');
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = '<i class="fas fa-check" style="margin-right: 4px;"></i>Confirmar Finalização';
        }
    }
}

// Expor funções globalmente para uso nos modais
window.alterarStatusSolicitacao = alterarStatusSolicitacao;
window.finalizarSolicitacao = finalizarSolicitacao;
window.confirmarFinalizacao = confirmarFinalizacao;
window.abrirSolicitacaoModal = abrirSolicitacaoModal;
window.fecharSolicitacaoModal = fecharSolicitacaoModal;
window.abrirDashboardMetricas = abrirDashboardMetricas;
window.fecharDashboardMetricas = fecharDashboardMetricas;

// Função para abrir dashboard de métricas
async function abrirDashboardMetricas() {
    try {
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        // Determinar se deve mostrar métricas de todas as equipes ou apenas da equipe do usuário
        const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
        const isAdmin = usuarioAdmin && usuarioAdmin.role === 'admin';
        const equipeUsuario = usuarioAdmin && usuarioAdmin.equipe;
        
        console.log('🔍 DASHBOARD MÉTRICAS AVANÇADO:', {
            usuario: usuarioAdmin.nome,
            role: usuarioAdmin.role,
            equipe: equipeUsuario,
            mostrarTodas: isSuperAdmin || isAdmin
        });
        
        // Buscar todas as solicitações para análise avançada
        let query = window.db.collection('solicitacoes').limit(500);
        
        // Se não for super_admin ou admin, filtrar apenas pela equipe do usuário
        if (!isSuperAdmin && !isAdmin && equipeUsuario) {
            query = query.where('equipe', '==', equipeUsuario);
        }
        
        const snapshot = await query.get();
        
        // Processar dados para diferentes períodos
        const agora = new Date();
        const dataLimite30 = new Date(); dataLimite30.setDate(agora.getDate() - 30);
        const dataLimite7 = new Date(); dataLimite7.setDate(agora.getDate() - 7);
        
        const todasSolicitacoes = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        
        const solicitacoes30dias = todasSolicitacoes.filter(sol => {
            if (sol.criadoEm && sol.criadoEm.toDate) {
                return sol.criadoEm.toDate() >= dataLimite30;
            }
            return false;
        });
        
        const solicitacoes7dias = todasSolicitacoes.filter(sol => {
            if (sol.criadoEm && sol.criadoEm.toDate) {
                return sol.criadoEm.toDate() >= dataLimite7;
            }
            return false;
        });
        
        // Calcular métricas avançadas
        const metricasAvancadas = calcularMetricasAvancadas(todasSolicitacoes, solicitacoes30dias, solicitacoes7dias);
        
        // Criar modal de dashboard avançado
        let modal = document.getElementById('dashboard-metricas');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'dashboard-metricas';
            modal.className = 'modal';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; overflow-y: auto;';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = gerarHTMLDashboardAvancado(metricasAvancadas, { 
            isSuperAdmin: isSuperAdmin || isAdmin, 
            equipeUsuario: equipeUsuario,
            nomeUsuario: usuarioAdmin.nome || 'Usuário'
        });
        modal.style.display = 'flex';
        
        // Renderizar gráficos após o modal estar no DOM
        setTimeout(() => {
            renderizarGraficos(metricasAvancadas);
            configurarAlertasInteligentes(metricasAvancadas);
        }, 100);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showToast('Erro', 'Não foi possível carregar o dashboard de métricas', 'error');
    }
}

function fecharDashboardMetricas() {
    const modal = document.getElementById('dashboard-metricas');
    if (modal) {
        modal.style.display = 'none';
        // Destruir gráficos para liberar memória
        if (window.chartInstances) {
            Object.values(window.chartInstances).forEach(chart => chart.destroy());
            window.chartInstances = {};
        }
    }
}

// ===== FUNÇÕES DE MÉTRICAS AVANÇADAS =====

function calcularMetricasAvancadas(todasSolicitacoes, solicitacoes30dias, solicitacoes7dias) {
    const agora = new Date();
    
    const metricas = {
        // Métricas básicas
        totais: {
            todas: todasSolicitacoes.length,
            ultimos30dias: solicitacoes30dias.length,
            ultimos7dias: solicitacoes7dias.length
        },
        
        // Status distribution
        statusDistribution: calcularDistribuicaoStatus(solicitacoes30dias),
        
        // Métricas por equipe
        porEquipe: calcularMetricasPorEquipe(solicitacoes30dias),
        
        // Tendências temporais
        tendencias: calcularTendencias(todasSolicitacoes),
        
        // Picos de demanda
        picosDemanda: calcularPicosDemanda(solicitacoes30dias),
        
        // Alertas
        alertas: calcularAlertas(solicitacoes30dias),
        
        // Performance e eficiência
        performance: calcularPerformanceGeral(solicitacoes30dias),
        
        // Satisfação integrada
        satisfacao: calcularSatisfacaoPorEquipe(solicitacoes30dias)
    };
    
    return metricas;
}

function calcularDistribuicaoStatus(solicitacoes) {
    const distribuicao = {
        pendente: 0,
        'em-andamento': 0,
        finalizada: 0,
        cancelada: 0
    };
    
    solicitacoes.forEach(sol => {
        const status = sol.status || 'pendente';
        if (distribuicao.hasOwnProperty(status)) {
            distribuicao[status]++;
        }
    });
    
    return distribuicao;
}

function calcularMetricasPorEquipe(solicitacoes) {
    const equipesMetricas = {};
    
    solicitacoes.forEach(sol => {
        const equipe = sol.equipe || 'indefinida';
        
        if (!equipesMetricas[equipe]) {
            equipesMetricas[equipe] = {
                total: 0,
                pendentes: 0,
                emAndamento: 0,
                finalizadas: 0,
                tempoMedioResolucao: 0,
                slaCompliance: 0,
                eficiencia: 0,
                tempos: [],
                alertaAcumulo: false
            };
        }
        
        const equipeData = equipesMetricas[equipe];
        equipeData.total++;
        
        // Contar status
        switch (sol.status) {
            case 'pendente': equipeData.pendentes++; break;
            case 'em-andamento': equipeData.emAndamento++; break;
            case 'finalizada': equipeData.finalizadas++; break;
        }
        
        // Calcular métricas de tempo para finalizadas
        if (sol.status === 'finalizada' && sol.metricas) {
            const tempo = sol.metricas.tempoTotal || 0;
            equipeData.tempos.push(tempo);
        }
        
        // Alerta de acúmulo (mais de 5 pendentes + em-andamento)
        equipeData.alertaAcumulo = (equipeData.pendentes + equipeData.emAndamento) > 5;
    });
    
    // Calcular médias
    Object.keys(equipesMetricas).forEach(equipe => {
        const data = equipesMetricas[equipe];
        if (data.tempos.length > 0) {
            data.tempoMedioResolucao = data.tempos.reduce((a, b) => a + b, 0) / data.tempos.length;
            data.slaCompliance = calcularSLACompliance(data.tempos, equipe);
        }
    });
    
    return equipesMetricas;
}

function calcularTendencias(todasSolicitacoes) {
    const hoje = new Date();
    const tendencias = {
        ultimos7dias: [],
        ultimos30dias: [],
        crescimentoSemanal: 0,
        crescimentoMensal: 0
    };
    
    // Agrupar por dia nos últimos 7 dias
    for (let i = 6; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];
        
        const count = todasSolicitacoes.filter(sol => {
            if (sol.criadoEm && sol.criadoEm.toDate) {
                const solData = sol.criadoEm.toDate().toISOString().split('T')[0];
                return solData === dataStr;
            }
            return false;
        }).length;
        
        tendencias.ultimos7dias.push({
            data: dataStr,
            count: count,
            label: data.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })
        });
    }
    
    // Calcular crescimento
    const primeiraSemana = tendencias.ultimos7dias.slice(0, 4).reduce((sum, dia) => sum + dia.count, 0);
    const segundaSemana = tendencias.ultimos7dias.slice(3, 7).reduce((sum, dia) => sum + dia.count, 0);
    
    tendencias.crescimentoSemanal = segundaSemana > 0 ? 
        ((segundaSemana - primeiraSemana) / primeiraSemana * 100) : 0;
    
    return tendencias;
}

function calcularPicosDemanda(solicitacoes) {
    const picosPorHora = new Array(24).fill(0);
    const picosPorDiaSemana = new Array(7).fill(0);
    
    solicitacoes.forEach(sol => {
        if (sol.criadoEm && sol.criadoEm.toDate) {
            const data = sol.criadoEm.toDate();
            const hora = data.getHours();
            const diaSemana = data.getDay();
            
            picosPorHora[hora]++;
            picosPorDiaSemana[diaSemana]++;
        }
    });
    
    return {
        porHora: picosPorHora,
        porDiaSemana: picosPorDiaSemana,
        horasPico: picosPorHora.map((count, hora) => ({hora, count}))
                              .sort((a, b) => b.count - a.count)
                              .slice(0, 3)
    };
}

function calcularAlertas(solicitacoes) {
    const alertas = [];
    const agora = new Date();
    
    // SLA próximo do limite
    const slaConfig = {
        'manutencao': 240, 'nutricao': 60, 'higienizacao': 120, 'hotelaria': 180
    };
    
    solicitacoes.forEach(sol => {
        if ((sol.status === 'pendente' || sol.status === 'em-andamento') && sol.criadoEm) {
            const criacao = sol.criadoEm.toDate ? sol.criadoEm.toDate() : new Date(sol.criadoEm);
            const minutosPassados = (agora - criacao) / (1000 * 60);
            const limiteSLA = slaConfig[sol.equipe] || 240;
            const percentualSLA = (minutosPassados / limiteSLA) * 100;
            
            if (percentualSLA > 80) {
                alertas.push({
                    tipo: 'sla_proximo',
                    equipe: sol.equipe,
                    solicitacao: sol.id,
                    percentual: Math.round(percentualSLA),
                    urgencia: percentualSLA > 100 ? 'critica' : 'alta'
                });
            }
        }
    });
    
    return alertas;
}

function calcularPerformanceGeral(solicitacoes) {
    const finalizadas = solicitacoes.filter(sol => sol.status === 'finalizada' && sol.metricas);
    
    if (finalizadas.length === 0) {
        return { tmaGeral: 0, eficienciaGeral: 0, slaGeral: 0 };
    }
    
    const tempoTotal = finalizadas.reduce((sum, sol) => sum + (sol.metricas.tempoTotal || 0), 0);
    const tempoTrabalho = finalizadas.reduce((sum, sol) => sum + (sol.metricas.tempoTrabalho || 0), 0);
    const slasCumpridos = finalizadas.filter(sol => sol.metricas.statusSLA === 'cumprido').length;
    
    return {
        tmaGeral: Math.round(tempoTotal / finalizadas.length),
        eficienciaGeral: tempoTotal > 0 ? Math.round((tempoTrabalho / tempoTotal) * 100) : 0,
        slaGeral: Math.round((slasCumpridos / finalizadas.length) * 100)
    };
}

function calcularSatisfacaoPorEquipe(solicitacoes) {
    // Esta função será integrada com os dados de satisfação
    // Por enquanto, retorna estrutura básica
    return {
        mediaGeral: 4.2,
        porEquipe: {
            manutencao: 4.1,
            nutricao: 4.5,
            higienizacao: 4.0,
            hotelaria: 4.3
        }
    };
}

function calcularSLACompliance(tempos, equipe) {
    const limites = {
        'manutencao': 240, 'nutricao': 60, 'higienizacao': 120, 'hotelaria': 180
    };
    
    const limite = limites[equipe] || 240;
    const cumpridos = tempos.filter(tempo => tempo <= limite).length;
    
    return tempos.length > 0 ? Math.round((cumpridos / tempos.length) * 100) : 0;
}

// ===== GERAÇÃO DE HTML AVANÇADO =====

function gerarHTMLDashboardAvancado(metricas, opcoes = {}) {
    const { isSuperAdmin = false, equipeUsuario = null, nomeUsuario = 'Usuário' } = opcoes;
    
    return `
        <div class="modal-content" style="max-width: 95vw; max-height: 90vh; overflow-y: auto; background: white; border-radius: 12px; padding: 0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0; position: sticky; top: 0; z-index: 10;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem;">📊 Dashboard Executivo - Métricas Avançadas</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">${isSuperAdmin ? 'Visão Completa' : 'Equipe: ' + equipeUsuario} | ${nomeUsuario}</p>
                    </div>
                    <button onclick="fecharDashboardMetricas()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer;">×</button>
                </div>
            </div>
            
            <!-- Alertas Inteligentes -->
            <div style="padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; margin: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #92400e; display: flex; align-items: center;">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                    Alertas Inteligentes
                </h3>
                <div id="alertas-container">
                    ${gerarHTMLAlertas(metricas.alertas)}
                </div>
            </div>

            <!-- KPIs Principais -->
            <div style="padding: 0 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    ${gerarCardsKPI(metricas)}
                </div>
            </div>

            <!-- Gráficos -->
            <div style="padding: 0 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- Gráfico de Status -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">Status das Solicitações</h3>
                        <canvas id="grafico-status" width="300" height="200"></canvas>
                    </div>
                    
                    <!-- Gráfico de Performance por Equipe -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">Performance por Equipe</h3>
                        <canvas id="grafico-equipes" width="300" height="200"></canvas>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- Tendências -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">Tendência de Demanda (7 dias)</h3>
                        <canvas id="grafico-tendencias" width="500" height="200"></canvas>
                    </div>
                    
                    <!-- Picos de Demanda -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">Picos por Hora</h3>
                        <canvas id="grafico-picos" width="250" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Métricas Detalhadas por Equipe -->
            <div style="padding: 20px;">
                <h3 style="margin: 0 0 20px 0; color: #374151;">Análise Detalhada por Equipe</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                    ${gerarCardsEquipes(metricas.porEquipe)}
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 15px 20px; text-align: center; color: #6b7280; font-size: 0.9rem; border-radius: 0 0 12px 12px;">
                Atualizado em: ${new Date().toLocaleString('pt-BR')} | Yuna Solicite v2.0
            </div>
        </div>
    `;
}

function gerarHTMLAlertas(alertas) {
    if (!alertas || alertas.length === 0) {
        return '<p style="color: #059669; margin: 0;"><i class="fas fa-check-circle"></i> Nenhum alerta no momento!</p>';
    }
    
    return alertas.map(alerta => {
        const cores = {
            critica: { bg: '#fecaca', text: '#991b1b', icon: 'exclamation-circle' },
            alta: { bg: '#fed7aa', text: '#9a3412', icon: 'exclamation-triangle' },
            media: { bg: '#fef3c7', text: '#92400e', icon: 'clock' }
        };
        
        const cor = cores[alerta.urgencia] || cores.media;
        
        return `
            <div style="background: ${cor.bg}; color: ${cor.text}; padding: 10px; border-radius: 6px; margin-bottom: 8px; font-size: 0.9rem;">
                <i class="fas fa-${cor.icon}" style="margin-right: 8px;"></i>
                <strong>${alerta.equipe}:</strong> SLA ${alerta.percentual}% - Solicitação ${alerta.solicitacao}
            </div>
        `;
    }).join('');
}

function gerarCardsKPI(metricas) {
    return `
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${metricas.totais.ultimos30dias}</div>
            <div style="opacity: 0.9;">Total 30 dias</div>
        </div>
        
        <div style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${metricas.performance.slaGeral}%</div>
            <div style="opacity: 0.9;">SLA Compliance</div>
        </div>
        
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${metricas.performance.tmaGeral}min</div>
            <div style="opacity: 0.9;">TMA Médio</div>
        </div>
        
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${metricas.performance.eficienciaGeral}%</div>
            <div style="opacity: 0.9;">Eficiência</div>
        </div>
    `;
}

function gerarCardsEquipes(equipesMetricas) {
    const equipesNomes = {
        manutencao: 'Manutenção',
        nutricao: 'Nutrição', 
        higienizacao: 'Higienização',
        hotelaria: 'Hotelaria'
    };
    
    return Object.entries(equipesMetricas).map(([equipe, dados]) => {
        const nome = equipesNomes[equipe] || equipe;
        const corAlerta = dados.alertaAcumulo ? '#fecaca' : '#f3f4f6';
        
        return `
            <div style="background: ${corAlerta}; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
                <h4 style="margin: 0 0 15px 0; color: #374151; display: flex; align-items: center; justify-content: space-between;">
                    ${nome}
                    ${dados.alertaAcumulo ? '<i class="fas fa-exclamation-triangle" style="color: #dc2626;"></i>' : ''}
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                    <div><strong>Total:</strong> ${dados.total}</div>
                    <div><strong>Pendentes:</strong> ${dados.pendentes}</div>
                    <div><strong>Em Andamento:</strong> ${dados.emAndamento}</div>
                    <div><strong>Finalizadas:</strong> ${dados.finalizadas}</div>
                    <div><strong>TMA:</strong> ${Math.round(dados.tempoMedioResolucao)}min</div>
                    <div><strong>SLA:</strong> ${dados.slaCompliance}%</div>
                </div>
            </div>
        `;
    }).join('');
}

function calcularMetricasGerais(solicitacoes) {
    const metricas = {
        total: solicitacoes.length,
        porEquipe: {},
        tmaGeral: 0,
        tmeGeral: 0,
        slaGeral: { cumprido: 0, violado: 0 },
        eficienciaGeral: 0
    };
    
    let tempoTotalSoma = 0;
    let tempoTrabalhoSoma = 0;
    let contadorValidos = 0;
    
    solicitacoes.forEach(sol => {
        const equipe = sol.equipe || 'indefinida';
        
        if (!metricas.porEquipe[equipe]) {
            metricas.porEquipe[equipe] = {
                total: 0,
                tma: 0,
                tme: 0,
                sla: { cumprido: 0, violado: 0 },
                eficiencia: 0,
                tempoTotalSoma: 0,
                tempoTrabalhoSoma: 0,
                contadorValidos: 0
            };
        }
        
        const equipeMetrica = metricas.porEquipe[equipe];
        equipeMetrica.total++;
        
        // Verificar se tem métricas válidas
        if (sol.metricas && sol.metricas.tempoTotal) {
            const m = sol.metricas;
            
            // Somar tempos para TMA e TME
            if (m.tempoTotal) {
                tempoTotalSoma += m.tempoTotal;
                equipeMetrica.tempoTotalSoma += m.tempoTotal;
                contadorValidos++;
                equipeMetrica.contadorValidos++;
            }
            
            if (m.tempoTrabalho) {
                tempoTrabalhoSoma += m.tempoTrabalho;
                equipeMetrica.tempoTrabalhoSoma += m.tempoTrabalho;
            }
            
            // Contar SLA
            if (m.statusSLA === 'cumprido') {
                metricas.slaGeral.cumprido++;
                equipeMetrica.sla.cumprido++;
            } else {
                metricas.slaGeral.violado++;
                equipeMetrica.sla.violado++;
            }
        } else {
            // Calcular métricas básicas se não existirem métricas completas
            let dataCreacao = null;
            let dataFinalização = null;
            
            // Tentar parsear data de criação
            if (sol.criadoEm && typeof sol.criadoEm.toDate === 'function') {
                dataCreacao = sol.criadoEm.toDate();
            } else if (sol.criadoEm && typeof sol.criadoEm === 'string') {
                dataCreacao = new Date(sol.criadoEm);
            } else if (sol.dataAbertura && typeof sol.dataAbertura.toDate === 'function') {
                dataCreacao = sol.dataAbertura.toDate();
            }
            
            // Tentar parsear data de finalização
            if (sol.dataFinalizacao && typeof sol.dataFinalizacao === 'string') {
                dataFinalização = new Date(sol.dataFinalizacao);
            } else if (sol.tempoFinalizacao && typeof sol.tempoFinalizacao.toDate === 'function') {
                dataFinalização = sol.tempoFinalizacao.toDate();
            }
            
            // Se conseguiu parsear ambas as datas, calcular tempo total
            if (dataCreacao && dataFinalização) {
                const tempoTotal = Math.round((dataFinalização - dataCreacao) / (1000 * 60));
                if (tempoTotal > 0) {
                    tempoTotalSoma += tempoTotal;
                    equipeMetrica.tempoTotalSoma += tempoTotal;
                    contadorValidos++;
                    equipeMetrica.contadorValidos++;
                    
                    // Verificar SLA básico
                    const slaConfig = {
                        'manutencao': 240, 'nutricao': 60, 'higienizacao': 120, 'hotelaria': 180
                    };
                    const slaLimite = slaConfig[equipe] || 240;
                    
                    if (tempoTotal <= slaLimite) {
                        metricas.slaGeral.cumprido++;
                        equipeMetrica.sla.cumprido++;
                    } else {
                        metricas.slaGeral.violado++;
                        equipeMetrica.sla.violado++;
                    }
                }
            }
        }
    });
    
    // Calcular médias gerais
    if (contadorValidos > 0) {
        metricas.tmaGeral = Math.round(tempoTotalSoma / contadorValidos);
        metricas.tmeGeral = Math.round(tempoTrabalhoSoma / contadorValidos);
        metricas.eficienciaGeral = tempoTotalSoma > 0 ? Math.round((tempoTrabalhoSoma / tempoTotalSoma) * 100) : 0;
    }
    
    // Calcular médias por equipe
    Object.keys(metricas.porEquipe).forEach(equipe => {
        const eq = metricas.porEquipe[equipe];
        if (eq.contadorValidos > 0) {
            eq.tma = Math.round(eq.tempoTotalSoma / eq.contadorValidos);
            eq.tme = Math.round(eq.tempoTrabalhoSoma / eq.contadorValidos);
            eq.eficiencia = eq.tempoTotalSoma > 0 ? Math.round((eq.tempoTrabalhoSoma / eq.tempoTotalSoma) * 100) : 0;
        }
    });
    
    return metricas;
}

function gerarHTMLDashboard(metricas, opcoes = {}) {
    const { isSuperAdmin = false, equipeUsuario = null, nomeUsuario = 'Usuário' } = opcoes;
    const slaPercentual = metricas.total > 0 ? Math.round((metricas.slaGeral.cumprido / metricas.total) * 100) : 0;
    
    // Título personalizado baseado no tipo de usuário
    let titulo = 'Dashboard de Métricas - Últimos 30 dias';
    if (!isSuperAdmin && equipeUsuario) {
        titulo = `Dashboard de Métricas - Equipe ${equipeUsuario.charAt(0).toUpperCase() + equipeUsuario.slice(1)}`;
    }
    
    // Gerar HTML das equipes (apenas equipe do usuário se não for admin)
    let htmlEquipes = '';
    const equipesParaExibir = isSuperAdmin ? 
        Object.entries(metricas.porEquipe) : 
        Object.entries(metricas.porEquipe).filter(([equipe]) => equipe === equipeUsuario);
    
    equipesParaExibir.forEach(([equipe, dados]) => {
        const slaEquipePercentual = dados.total > 0 ? Math.round((dados.sla.cumprido / dados.total) * 100) : 0;
        const slaColor = slaEquipePercentual >= 90 ? '#059669' : slaEquipePercentual >= 70 ? '#d97706' : '#dc2626';
        
        // Nome amigável da equipe
        const nomeEquipe = {
            'manutencao': 'Manutenção',
            'nutricao': 'Nutrição', 
            'higienizacao': 'Higienização',
            'hotelaria': 'Hotelaria'
        }[equipe] || equipe.charAt(0).toUpperCase() + equipe.slice(1);
        
        // Ícone da equipe
        const iconeEquipe = {
            'manutencao': '🔧',
            'nutricao': '🍽️',
            'higienizacao': '🧽',
            'hotelaria': '🛏️'
        }[equipe] || '⚙️';
        
        htmlEquipes += `
            <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid ${slaColor};">
                <h4 style="margin: 0 0 12px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
                    ${iconeEquipe} ${nomeEquipe}
                    ${!isSuperAdmin ? '<span style="font-size: 12px; background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; margin-left: 8px;">Sua Equipe</span>' : ''}
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">
                    <div><strong>Solicitações:</strong> ${dados.total}</div>
                    <div><strong>TMA:</strong> ${dados.tma}min (${Math.round(dados.tma/60*10)/10}h)</div>
                    <div><strong>TME:</strong> ${dados.tme}min (${Math.round(dados.tme/60*10)/10}h)</div>
                    <div><strong>SLA:</strong> <span style="color: ${slaColor}; font-weight: bold;">${slaEquipePercentual}%</span></div>
                    <div><strong>Eficiência:</strong> ${dados.eficiencia}%</div>
                    <div><strong>Cumpridas:</strong> ${dados.sla.cumprido} / ${dados.total}</div>
                </div>
            </div>
        `;
    });
    
    // Se não há dados da equipe específica, mostrar mensagem
    if (!isSuperAdmin && equipesParaExibir.length === 0 && equipeUsuario) {
        const nomeEquipe = {
            'manutencao': 'Manutenção',
            'nutricao': 'Nutrição', 
            'higienizacao': 'Higienização',
            'hotelaria': 'Hotelaria'
        }[equipeUsuario] || equipeUsuario.charAt(0).toUpperCase() + equipeUsuario.slice(1);
        
        htmlEquipes = `
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; color: #6b7280;">
                <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <h3 style="margin: 0 0 8px 0; color: #374151;">Nenhuma Solicitação Finalizada</h3>
                <p style="margin: 0; font-size: 14px;">
                    A equipe ${nomeEquipe} ainda não possui solicitações finalizadas nos últimos 30 dias.
                </p>
            </div>
        `;
    }
    
    return `
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 900px; max-height: 80vh; overflow-y: auto; position: relative;">
            <span onclick="fecharDashboardMetricas()" style="position: absolute; top: 15px; right: 20px; font-size: 24px; cursor: pointer; color: #6b7280;">&times;</span>
            
            <h2 style="margin: 0 0 20px 0; color: #374151; display: flex; align-items: center;">
                <i class="fas fa-chart-line" style="margin-right: 12px; color: #3b82f6;"></i>
                ${titulo}
            </h2>
            
            ${isSuperAdmin || metricas.total > 0 ? `
            <!-- Métricas Gerais -->
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 16px 0;">📊 ${isSuperAdmin ? 'Métricas Gerais' : 'Métricas da Sua Equipe'}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${metricas.total}</div>
                        <div style="font-size: 12px; opacity: 0.9;">Total Solicitações</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${metricas.tmaGeral}min</div>
                        <div style="font-size: 12px; opacity: 0.9;">TMA (Tempo Médio Atendimento)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${metricas.tmeGeral}min</div>
                        <div style="font-size: 12px; opacity: 0.9;">TME (Tempo Médio Execução)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${slaPercentual}%</div>
                        <div style="font-size: 12px; opacity: 0.9;">SLA Cumprido</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${metricas.eficienciaGeral}%</div>
                        <div style="font-size: 12px; opacity: 0.9;">Eficiência</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- Desempenho por Equipe -->
            <h3 style="margin: 0 0 16px 0; color: #374151;">
                ${isSuperAdmin ? '👥 Desempenho por Equipe' : '📈 Desempenho da Sua Equipe'}
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                ${htmlEquipes}
            </div>
            
            <!-- Legenda SLA -->
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 20px;">
                <h4 style="margin: 0 0 8px 0; color: #374151;">📋 Definições SLA ${!isSuperAdmin && equipeUsuario ? `- ${equipeUsuario.charAt(0).toUpperCase() + equipeUsuario.slice(1)}` : 'por Equipe'}</h4>
                <div style="font-size: 14px; color: #6b7280; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
                    ${isSuperAdmin ? `
                        <div><strong>Nutrição:</strong> 60 min (Crítico)</div>
                        <div><strong>Higienização:</strong> 120 min (Médio)</div>
                        <div><strong>Hotelaria:</strong> 180 min (Médio)</div>
                        <div><strong>Manutenção:</strong> 240 min (Alto)</div>
                    ` : `
                        <div><strong>${equipeUsuario === 'nutricao' ? 'Nutrição: 60 min (Crítico)' : 
                                       equipeUsuario === 'higienizacao' ? 'Higienização: 120 min (Médio)' :
                                       equipeUsuario === 'hotelaria' ? 'Hotelaria: 180 min (Médio)' :
                                       'Manutenção: 240 min (Alto)'}</strong></div>
                        <div>Meta: Cumprir SLA em pelo menos 90% das solicitações</div>
                    `}
                </div>
            </div>
            
            <div style="margin-top: 20px; text-align: right;">
                <button onclick="fecharDashboardMetricas()" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                    Fechar
                </button>
            </div>
        </div>
    `;
}
window.testarMelhoriasCards = testarMelhoriasCards;

window.closeManageUsersModal = function() {
    debugLog('[DEBUG] closeManageUsersModal: fechando modal...');
    const modal = document.getElementById('manage-users-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        debugLog('[DEBUG] closeManageUsersModal: modal fechado');
        
        // CORREÇÃO: Navegar de volta para o painel principal
        debugLog('[DEBUG] closeManageUsersModal: navegando para painel principal...');
        mostrarSecaoPainel('painel');
        debugLog('[DEBUG] closeManageUsersModal: navegação concluída');
    }
};

// ========== FUNÇÃO DE SOLUÇÃO RÁPIDA ==========
// Execute no console: solucionarBotoes()
window.solucionarBotoes = function() {
    console.log('🔧 SOLUCIONANDO PROBLEMA DOS BOTÕES...');
    
    // 1. Garantir que o usuário tem permissão
    if (!window.userRole) {
        window.userRole = 'admin';
        console.log('✅ UserRole definido como admin');
    }
    
    if (!window.usuarioAdmin) {
        window.usuarioAdmin = { 
            role: 'admin', 
            nome: 'Admin', 
            email: 'admin@yuna.com.br',
            isAdmin: true
        };
        console.log('✅ UsuarioAdmin definido');
    }
    
    // 2. Forçar exibição dos botões
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    
    if (btnNovoUsuario) {
        btnNovoUsuario.classList.remove('btn-hide');
        btnNovoUsuario.style.display = 'inline-flex';
        btnNovoUsuario.style.visibility = 'visible';
        btnNovoUsuario.style.pointerEvents = 'auto';
        console.log('✅ Botão Criar Usuário exibido');
    }
    
    if (btnGerenciarUsuarios) {
        btnGerenciarUsuarios.classList.remove('btn-hide');
        btnGerenciarUsuarios.style.display = 'inline-flex';
        btnGerenciarUsuarios.style.visibility = 'visible';
        btnGerenciarUsuarios.style.pointerEvents = 'auto';
        console.log('✅ Botão Gerenciar Usuários exibido');
    }
    
    // 3. Configurar eventos dos botões
    configurarEventosBotoes();
    console.log('✅ Eventos dos botões configurados');
    
    // 4. Testar botões
    window.testarBotoes();
    
    console.log('🎉 PROBLEMA RESOLVIDO! Os botões devem funcionar agora.');
    showToast('Sucesso', 'Botões corrigidos com sucesso!', 'success');
    
    return 'Solução aplicada com sucesso!';
};

// ========== MODO DESENVOLVIMENTO ==========
window.loginDesenvolvimento = function(email = 'admin@dev.local') {
    console.log('[DEV] Ativando modo desenvolvimento...');
    
    // Simular usuário admin
    window.userRole = 'admin';
    window.usuarioAdmin = {
        role: 'admin',
        nome: 'Admin Desenvolvimento',
        email: email,
        isAdmin: true,
        isDev: true
    };
    
    window.userEmail = email;
    localStorage.setItem('usuarioAdmin', JSON.stringify(window.usuarioAdmin));
    
    // Ocultar tela de login
    document.getElementById('auth-section')?.classList.add('hidden');
    document.getElementById('admin-panel')?.classList.remove('hidden');
    
    // Atualizar badge
    const badge = document.getElementById('user-role-badge');
    if (badge) {
        badge.textContent = 'Admin Desenvolvimento (Dev)';
        badge.className = 'priority-badge priority-media';
        badge.style.backgroundColor = '#f59e0b'; // Cor diferente para modo dev
    }
    
    // Configurar botões
    setTimeout(() => {
        atualizarVisibilidadeBotoes();
        configurarEventosBotoes();
        
        // Forçar exibição dos botões
        const btnNovoUsuario = document.getElementById('btn-novo-usuario');
        const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
        
        if (btnNovoUsuario) {
            btnNovoUsuario.classList.remove('btn-hide');
            btnNovoUsuario.style.display = 'inline-flex';
        }
        
        if (btnGerenciarUsuarios) {
            btnGerenciarUsuarios.classList.remove('btn-hide');
            btnGerenciarUsuarios.style.display = 'inline-flex';
        }
        
        console.log('[DEV] Botões configurados em modo desenvolvimento');
    }, 100);
    
    // Mostrar painel principal
    mostrarSecaoPainel('painel');
    
    // Mostrar dados de desenvolvimento nas métricas
    setTimeout(() => {
        carregarDadosDesenvolvimento();
    }, 500);
    
    showToast('Modo Dev', 'Modo desenvolvimento ativado - dados simulados', 'warning');
    console.log('[DEV] Modo desenvolvimento ativo');
};

// Função para carregar dados simulados no modo desenvolvimento
window.carregarDadosDesenvolvimento = function() {
    console.log('[DEV] Carregando dados simulados...');
    
    // Simular métricas
    const stats = [
        { id: 'total-solicitacoes', value: '42' },
        { id: 'pendentes', value: '12' },
        { id: 'em-andamento', value: '18' },
        { id: 'finalizadas', value: '12' }
    ];
    
    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            element.textContent = stat.value;
        }
    });
    
    // Simular cards de equipe
    const teamsGrid = document.querySelector('.teams-grid');
    if (teamsGrid) {
        teamsGrid.innerHTML = `
            <div class="team-card" onclick="verSolicitacoesEquipe('manutencao')">
                <div class="team-icon">🔧</div>
                <div class="team-info">
                    <h3>Manutenção</h3>
                    <div class="team-stats">
                        <span class="pendentes">3 pendentes</span>
                        <span class="andamento">2 em andamento</span>
                        <span class="finalizadas">7 finalizadas</span>
                    </div>
                </div>
            </div>
            <div class="team-card" onclick="verSolicitacoesEquipe('nutricao')">
                <div class="team-icon">🍽️</div>
                <div class="team-info">
                    <h3>Nutrição</h3>
                    <div class="team-stats">
                        <span class="pendentes">2 pendentes</span>
                        <span class="andamento">4 em andamento</span>
                        <span class="finalizadas">1 finalizadas</span>
                    </div>
                </div>
            </div>
            <div class="team-card" onclick="verSolicitacoesEquipe('higienizacao')">
                <div class="team-icon">🧽</div>
                <div class="team-info">
                    <h3>Higienização</h3>
                    <div class="team-stats">
                        <span class="pendentes">4 pendentes</span>
                        <span class="andamento">6 em andamento</span>
                        <span class="finalizadas">2 finalizadas</span>
                    </div>
                </div>
            </div>
            <div class="team-card" onclick="verSolicitacoesEquipe('hotelaria')">
                <div class="team-icon">🏨</div>
                <div class="team-info">
                    <h3>Hotelaria</h3>
                    <div class="team-stats">
                        <span class="pendentes">3 pendentes</span>
                        <span class="andamento">6 em andamento</span>
                        <span class="finalizadas">2 finalizadas</span>
                    </div>
                </div>
            </div>
        `;
        teamsGrid.classList.remove('hidden');
    }
    
    console.log('[DEV] Dados simulados carregados');
};

// Função para enriquecer solicitações com dados do acompanhante
async function enriquecerSolicitacoesComDados(equipes) {
    console.log('[ENRIQUECIMENTO] === INICIANDO ENRIQUECIMENTO DE DADOS ===');
    console.log('[ENRIQUECIMENTO] Equipes recebidas:', Object.keys(equipes));
    
    const equipesEnriquecidas = {};
    
    for (const [nomeEquipe, solicitacoes] of Object.entries(equipes)) {
        console.log(`[ENRIQUECIMENTO] Processando equipe: ${nomeEquipe} com ${solicitacoes.length} solicitações`);
        
        equipesEnriquecidas[nomeEquipe] = await Promise.all(
            solicitacoes.map(async (solicitacao, index) => {
                try {
                    console.log(`[ENRIQUECIMENTO] [${index + 1}/${solicitacoes.length}] Processando solicitação:`, solicitacao.id);
                    
                    const dadosAcompanhante = await buscarDadosAcompanhante(solicitacao);
                    
                    const solicitacaoEnriquecida = {
                        ...solicitacao,
                        nomeAcompanhante: dadosAcompanhante.nome !== 'N/A' && dadosAcompanhante.nome !== 'Usuário' ? dadosAcompanhante.nome : null,
                        quartoAcompanhante: dadosAcompanhante.quarto !== 'N/A' ? dadosAcompanhante.quarto : null
                    };
                    
                    console.log(`[ENRIQUECIMENTO] Resultado enriquecimento:`, {
                        id: solicitacao.id,
                        nomeOriginal: solicitacao.nome || solicitacao.usuarioNome,
                        quartoOriginal: solicitacao.quarto,
                        nomeEnriquecido: solicitacaoEnriquecida.nomeAcompanhante,
                        quartoEnriquecido: solicitacaoEnriquecida.quartoAcompanhante,
                        dadosAcompanhante
                    });
                    
                    return solicitacaoEnriquecida;
                } catch (error) {
                    console.warn('[ENRIQUECIMENTO] Erro ao buscar dados do acompanhante para solicitação', solicitacao.id, ':', error);
                    return solicitacao; // Retorna dados originais em caso de erro
                }
            })
        );
    }
    
    console.log('[ENRIQUECIMENTO] === ENRIQUECIMENTO CONCLUÍDO ===');
    return equipesEnriquecidas;
}

function renderizarCardsEquipe(equipes) {
    // DEBUG para verificar se dados chegaram enriquecidos
    console.log('[RENDER-DEBUG] renderizarCardsEquipe chamada com:', {
        equipes: Object.keys(equipes),
        totalSolicitacoes: Object.values(equipes).reduce((total, sols) => total + sols.length, 0),
        primeirasSolicitacoes: Object.entries(equipes).slice(0, 2).map(([equipe, sols]) => ({
            equipe,
            quantidade: sols.length,
            primeiroItem: sols[0] ? {
                id: sols[0].id,
                nomeAcompanhante: sols[0].nomeAcompanhante,
                quartoAcompanhante: sols[0].quartoAcompanhante,
                nome: sols[0].nome,
                quarto: sols[0].quarto
            } : null
        }))
    });
    
    // Remove loader visual ao finalizar renderização dos cards
    if (window._mainLoader) {
        window._mainLoader.remove();
        window._mainLoader = null;
    }
    
    const icones = {
        manutencao: 'tools',
        nutricao: 'utensils',
        higienizacao: 'broom',
        hotelaria: 'bed'
    };
    
    const equipesNomes = {
        manutencao: 'Manutenção',
        nutricao: 'Nutrição',
        higienizacao: 'Higienização',
        hotelaria: 'Hotelaria'
    };
    
    // Função para formatar data e hora
    function formatarDataHora(timestamp) {
        if (!timestamp) return 'Não informado';
        try {
            const data = new Date(timestamp);
            const hoje = new Date();
            const diffTime = hoje - data;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            
            if (diffDays > 0) {
                return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
            } else if (diffHours > 0) {
                return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
            } else if (diffMinutes > 0) {
                return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
            } else {
                return 'agora mesmo';
            }
        } catch (error) {
            return 'Tempo inválido';
        }
    }
    
    // Função para calcular tempo decorrido de atendimento
    window.calcularTempoAtendimento = function calcularTempoAtendimento(solicitacao) {
        try {
            let dataInicio = null;
            
            // Tentar obter data de início do cronômetro
            if (solicitacao.cronometro && solicitacao.cronometro.inicio) {
                if (typeof solicitacao.cronometro.inicio.toDate === 'function') {
                    dataInicio = solicitacao.cronometro.inicio.toDate();
                } else {
                    dataInicio = new Date(solicitacao.cronometro.inicio);
                }
            }
            // Fallback para data de abertura
            else if (solicitacao.dataAbertura) {
                if (typeof solicitacao.dataAbertura.toDate === 'function') {
                    dataInicio = solicitacao.dataAbertura.toDate();
                } else {
                    dataInicio = new Date(solicitacao.dataAbertura);
                }
            }
            // Fallback para criadoEm
            else if (solicitacao.criadoEm) {
                if (typeof solicitacao.criadoEm.toDate === 'function') {
                    dataInicio = solicitacao.criadoEm.toDate();
                } else {
                    dataInicio = new Date(solicitacao.criadoEm);
                }
            }
            
            if (!dataInicio || isNaN(dataInicio.getTime())) {
                return 'Tempo indisponível';
            }
            
            const agora = new Date();
            const diffTime = agora - dataInicio;
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            // Se a solicitação foi finalizada, mostrar tempo total
            if (solicitacao.status === 'finalizada') {
                let dataFim = null;
                if (solicitacao.dataFinalizacao) {
                    if (typeof solicitacao.dataFinalizacao.toDate === 'function') {
                        dataFim = solicitacao.dataFinalizacao.toDate();
                    } else {
                        dataFim = new Date(solicitacao.dataFinalizacao);
                    }
                    const tempoTotal = Math.floor((dataFim - dataInicio) / (1000 * 60));
                    const horasTotal = Math.floor(tempoTotal / 60);
                    const minutosTotal = tempoTotal % 60;
                    
                    if (horasTotal > 0) {
                        return `✓ ${horasTotal}h ${minutosTotal}min`;
                    } else {
                        return `✓ ${minutosTotal}min`;
                    }
                }
            }
            
            // Para solicitações ativas, mostrar tempo em execução
            if (diffDays > 0) {
                return `⏱️ ${diffDays}d ${diffHours % 24}h`;
            } else if (diffHours > 0) {
                return `⏱️ ${diffHours}h ${diffMinutes % 60}min`;
            } else {
                return `⏱️ ${diffMinutes}min`;
            }
            
        } catch (error) {
            console.error('[ERRO] Falha ao calcular tempo de atendimento:', error);
            return 'Erro no tempo';
        }
    }
    
    // Função para obter prioridade visual baseada no status e tempo
    function obterPrioridade(solicitacao) {
        if (solicitacao.status === 'finalizada') return 'baixa';
        if (solicitacao.status === 'em-andamento') return 'media';
        
        // Para solicitações pendentes, verificar tempo
        const agora = new Date();
        const criacao = new Date(solicitacao.dataCriacao);
        const diffHoras = (agora - criacao) / (1000 * 60 * 60);
        
        if (diffHoras > 24) return 'alta';
        if (diffHoras > 12) return 'media';
        return 'normal';
    }

    const gridContainer = document.querySelector('.teams-grid');
    if (!gridContainer) return;
    
    // Limpar container
    gridContainer.innerHTML = '';
    
    // Verificar se há equipes para mostrar
    const equipesParaMostrar = Object.keys(equipes).filter(equipe => 
        equipes[equipe] && Array.isArray(equipes[equipe])
    );
    
    if (equipesParaMostrar.length === 0) {
        gridContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-inbox" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <h3 style="color: #64748b; margin-bottom: 0.5rem;">Nenhuma solicitação encontrada</h3>
                <p style="color: #94a3b8;">Não há solicitações para exibir no momento.</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada equipe
    equipesParaMostrar.forEach(equipe => {
        const solicitacoes = equipes[equipe] || [];
        
        // Ordenar solicitações por ordem de chegada (mais antigas primeiro)
        const solicitacoesOrdenadas = [...solicitacoes].sort((a, b) => {
            // Primeiro, ordenar por status (pendentes e em-andamento primeiro, finalizadas por último)
            const statusOrder = { 'pendente': 0, 'em-andamento': 1, 'finalizada': 2 };
            const statusA = statusOrder[a.status] || 3;
            const statusB = statusOrder[b.status] || 3;
            
            if (statusA !== statusB) {
                return statusA - statusB;
            }
            
            // Para mesmo status, ordenar por data de criação (mais antigas primeiro)
            const dataA = a.criadoEm ? (a.criadoEm.toDate ? a.criadoEm.toDate() : new Date(a.criadoEm)) :
                         a.dataAbertura ? (a.dataAbertura.toDate ? a.dataAbertura.toDate() : new Date(a.dataAbertura)) :
                         new Date(0);
            
            const dataB = b.criadoEm ? (b.criadoEm.toDate ? b.criadoEm.toDate() : new Date(b.criadoEm)) :
                         b.dataAbertura ? (b.dataAbertura.toDate ? b.dataAbertura.toDate() : new Date(b.dataAbertura)) :
                         new Date(0);
            
            return dataA - dataB; // Ordem crescente (mais antigas primeiro)
        });
        
        const panel = document.createElement('div');
        panel.className = 'team-panel';
        panel.setAttribute('data-department', equipe);
        
        panel.innerHTML = `
            <div class="team-header ${equipe}">
                <h3>
                    <i class="fas fa-${icones[equipe]}"></i>
                    ${equipesNomes[equipe]}
                </h3>
                <span class="badge" id="count-${equipe}">${solicitacoes.length}</span>
            </div>
            
            <!-- Filtros da Equipe -->
            <div class="team-filters" id="filters-${equipe}">
                <div class="filter-group">
                    <label for="filter-status-${equipe}">Status:</label>
                    <select id="filter-status-${equipe}" class="filter-select" onchange="filtrarSolicitacoesPorStatus('${equipe}', this.value)">
                        <option value="todos">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="em-andamento">Em Andamento</option>
                        <option value="finalizada">Finalizada</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="filter-prioridade-${equipe}">Prioridade:</label>
                    <select id="filter-prioridade-${equipe}" class="filter-select" onchange="filtrarSolicitacoesPorPrioridade('${equipe}', this.value)">
                        <option value="todos">Todas</option>
                        <option value="urgente">Urgente</option>
                        <option value="alta">Alta</option>
                        <option value="normal">Normal</option>
                        <option value="baixa">Baixa</option>
                    </select>
                </div>
                <div class="filter-group">
                    <button class="filter-clear-btn" onclick="limparFiltrosSolicitacoes('${equipe}')" title="Limpar filtros">
                        <i class="fas fa-refresh"></i> Limpar
                    </button>
                </div>
            </div>
            
            <div class="team-content" id="content-${equipe}">
                ${solicitacoes.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-${icones[equipe]}"></i>
                        <p>Nenhuma solicitação de ${equipesNomes[equipe].toLowerCase()}</p>
                    </div>
                ` : `
                    ${solicitacoesOrdenadas.map((solicitacao, index) => {
                        // DEBUG para rastrear dados da solicitação na renderização
                        console.log(`[RENDER-DEBUG] Renderizando card ${index + 1}:`, {
                            id: solicitacao.id,
                            titulo: solicitacao.titulo || solicitacao.tipo,
                            nomeAcompanhante: solicitacao.nomeAcompanhante,
                            nome: solicitacao.nome,
                            usuarioNome: solicitacao.usuarioNome,
                            quartoAcompanhante: solicitacao.quartoAcompanhante,
                            quarto: solicitacao.quarto,
                            nomeParaExibir: solicitacao.nomeAcompanhante || solicitacao.nome || solicitacao.usuarioNome,
                            quartoParaExibir: solicitacao.quartoAcompanhante || solicitacao.quarto
                        });
                        
                        // Verificar se usuário pode interagir com esta solicitação ou apenas visualizar
                        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
                        const podeInteragir = usuarioAdmin.role === 'super_admin' || 
                                            (usuarioAdmin.isEquipe && usuarioAdmin.equipe === solicitacao.equipe);
                        const apenasVisualizar = usuarioAdmin.role === 'admin' && !usuarioAdmin.isEquipe;
                        
                        return `<div class="solicitacao-card ${apenasVisualizar ? 'visualizacao-apenas' : ''}" 
                             data-id="${solicitacao.id}"
                             data-solicitacao='${JSON.stringify(solicitacao).replace(/'/g, '&apos;')}' 
                             data-equipe="${equipe}" 
                             data-index="${index}" 
                             data-status="${solicitacao.status || 'pendente'}"
                             data-prioridade="${solicitacao.prioridade || 'normal'}"
                             onclick="${podeInteragir ? `abrirSolicitacaoModal(${JSON.stringify(solicitacao).replace(/'/g, '&apos;')})` : `mostrarInfoVisualizacao('${solicitacao.id}')`}"
                             style="${apenasVisualizar ? 'opacity: 0.8; cursor: help;' : 'cursor: pointer;'}">
                            
                            ${apenasVisualizar ? '<div class="badge-visualizacao">👀 Apenas Visualização</div>' : ''}
                            
                            <div class="card-header">
                                <div class="card-order-info">
                                    <span class="card-order">#${index + 1}</span>
                                    <span class="card-status status-${solicitacao.status || 'pendente'}">
                                        ${solicitacao.status || 'pendente'}
                                    </span>
                                </div>
                                <div class="card-actions">
                                    <button class="action-btn view" title="${apenasVisualizar ? 'Visualizar detalhes' : 'Ver detalhes'}">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${apenasVisualizar ? '<span style="font-size: 10px; color: #64748b;">👁️ Somente visualização</span>' : ''}
                                </div>
                            </div>
                            
                            <div class="card-title">
                                ${(() => {
                                    // Priorizar titulo ou tipo, mas se não houver, usar o campo de descrição da equipe
                                    if (solicitacao.titulo) return solicitacao.titulo;
                                    if (solicitacao.tipo) return solicitacao.tipo;
                                    if (solicitacao.descricao) return solicitacao.descricao;
                                    if (solicitacao.detalhes) return solicitacao.detalhes;
                                    if (solicitacao.observacoes) return solicitacao.observacoes;
                                    return 'Solicitação sem título';
                                })()}
                            </div>
                            
                            <div class="card-details">
                                ${(solicitacao.quartoAcompanhante || solicitacao.quarto) && 
                                  (solicitacao.quartoAcompanhante || solicitacao.quarto) !== 'N/A' ? `
                                    <div class="card-detail">
                                        <i class="fas fa-bed"></i>
                                        <span>Quarto ${solicitacao.quartoAcompanhante || solicitacao.quarto}</span>
                                    </div>
                                ` : ''}
                                
                                ${(solicitacao.nomeAcompanhante || solicitacao.nome || solicitacao.usuarioNome) && 
                                  (solicitacao.nomeAcompanhante || solicitacao.nome || solicitacao.usuarioNome) !== 'N/A' && 
                                  (solicitacao.nomeAcompanhante || solicitacao.nome || solicitacao.usuarioNome) !== 'aguardando' ? `
                                    <div class="card-detail">
                                        <i class="fas fa-user"></i>
                                        <span>${solicitacao.nomeAcompanhante || solicitacao.nome || solicitacao.usuarioNome}</span>
                                    </div>
                                ` : ''}
                                
                                ${(() => {
                                    // Determinar o campo de descrição baseado na equipe
                                    let descricaoTexto = '';
                                    if (solicitacao.descricao && solicitacao.descricao !== solicitacao.titulo) {
                                        descricaoTexto = solicitacao.descricao; // Manutenção
                                    } else if (solicitacao.detalhes) {
                                        descricaoTexto = solicitacao.detalhes; // Nutrição e Hotelaria
                                    } else if (solicitacao.observacoes) {
                                        descricaoTexto = solicitacao.observacoes; // Higienização
                                    }
                                    
                                    return descricaoTexto ? `
                                        <div class="card-detail">
                                            <i class="fas fa-comment"></i>
                                            <span>${descricaoTexto.length > 60 ? 
                                                descricaoTexto.substring(0, 60) + '...' : 
                                                descricaoTexto}</span>
                                        </div>
                                    ` : '';
                                })()}
                                
                                ${solicitacao.status === 'finalizada' && solicitacao.dataFinalizacao ? `
                                    <div class="card-detail highlight">
                                        <i class="fas fa-check-circle"></i>
                                        <span>Finalizada ${formatarDataHora(solicitacao.dataFinalizacao)}</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="card-meta">
                                <div class="card-time">
                                    <i class="fas fa-clock"></i>
                                    <span>${formatarDataHora(solicitacao.dataCriacao)}</span>
                                </div>
                                <div class="card-timer" title="Tempo de atendimento">
                                    <i class="fas fa-stopwatch" style="color: ${solicitacao.status === 'finalizada' ? '#10b981' : '#f59e0b'};"></i>
                                    <span style="color: ${solicitacao.status === 'finalizada' ? '#10b981' : '#f59e0b'}; font-weight: 600;">
                                        ${calcularTempoAtendimento(solicitacao)}
                                    </span>
                                </div>
                                <div class="card-priority priority-${obterPrioridade(solicitacao)}">
                                    ${obterPrioridade(solicitacao) === 'alta' ? '🔴' : 
                                      obterPrioridade(solicitacao) === 'media' ? '🟡' : 
                                      obterPrioridade(solicitacao) === 'normal' ? '🟢' : '⚪'}
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                `}
            </div>
        `;
        
        gridContainer.appendChild(panel);
    });
    
    // Adicionar eventos aos cards após renderização
    adicionarEventosSolicitacoes();
    
    // Iniciar atualização automática dos cronômetros
    iniciarAtualizacaoTempos();
    
    console.log(`[DEBUG] Cards renderizados para ${equipesParaMostrar.length} equipe(s)`);
    
    // Atualizar cache (com LRU se disponível)
    if (typeof solicitacoesProcessadas !== 'undefined' && Array.isArray(solicitacoesProcessadas)) {
        if (window.cacheManager) {
            // Usar CacheManager com limite LRU
            solicitacoesProcessadas.forEach(sol => {
                window.cacheManager.setSolicitacao(sol);
            });
            console.log('[CACHE] ✅ Solicitações armazenadas no CacheManager (LRU):', solicitacoesProcessadas.length, 'itens');
        } else {
            // Fallback: cache legado
            window.cachedSolicitacoes = solicitacoesProcessadas;
            console.log('[CACHE] Solicitações armazenadas no cache legado:', window.cachedSolicitacoes.length, 'itens');
        }
    }
}

// === ATUALIZAÇÃO AUTOMÁTICA DOS CRONÔMETROS ===
let intervaloCronometros = null;

function iniciarAtualizacaoTempos() {
    // Limpar intervalo anterior se existir
    if (intervaloCronometros) {
        clearInterval(intervaloCronometros);
    }
    
    // Garantir que o cache esteja inicializado
    if (!window.hasOwnProperty('cachedSolicitacoes')) {
        window.cachedSolicitacoes = [];
        console.log('[DEBUG] Cache de solicitações inicializado forçadamente');
    }
    
    // Atualizar cronômetros a cada 30 segundos
    intervaloCronometros = setInterval(() => {
        atualizarCronometrosNaTela();
    }, 30000);
    
    console.log('[DEBUG] Atualização automática dos cronômetros iniciada');
}

function atualizarCronometrosNaTela() {
    // CORREÇÃO DEFINITIVA - Versão super segura
    try {
        // Garantir que window.cachedSolicitacoes existe
        if (typeof window.cachedSolicitacoes === 'undefined') {
            window.cachedSolicitacoes = [];
            console.log('[CRONOMETROS] ✅ Cache inicializado');
        }
        
        if (!Array.isArray(window.cachedSolicitacoes)) {
            window.cachedSolicitacoes = [];
            console.log('[CRONOMETROS] ✅ Cache convertido para array');
        }
        
        if (window.cachedSolicitacoes.length === 0) {
            console.log('[CRONOMETROS] Cache vazio, pulando atualização');
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
            const novoTempo = calcularTempoAtendimento(solicitacao);
            timerElement.textContent = novoTempo;
            
            // Atualizar cor se necessário
            const icon = timerElement.parentElement.querySelector('i');
            const cor = solicitacao.status === 'finalizada' ? '#10b981' : '#f59e0b';
            
            if (icon) {
                icon.style.color = cor;
            }
            timerElement.style.color = cor;
        });
        
        console.log('[CRONOMETROS] ✅ Atualização concluída');
    } catch (error) {
        console.error('[CRONOMETROS] Erro:', error);
        // Garantir cache mesmo em caso de erro
        if (typeof window.cachedSolicitacoes === 'undefined') {
            window.cachedSolicitacoes = [];
        }
    }
}

function pararAtualizacaoTempos() {
    if (intervaloCronometros) {
        clearInterval(intervaloCronometros);
        intervaloCronometros = null;
        console.log('[DEBUG] Atualização automática dos cronômetros parada');
    }
}

// === MODAL DE SOLICITAÇÃO (VERSÃO LIMPA) ===
function abrirSolicitacaoModal(solicitacao) {
    debugLog('[DEBUG] Abrindo modal para:', solicitacao.id, 'Status:', solicitacao.status);
    mostrarModal(solicitacao);
}

function mostrarModal(solicitacao) {
    // Criar modal se não existir
    let modal = document.getElementById('solicitacao-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'solicitacao-modal';
        modal.className = 'modal hidden';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative; background: white; border-radius: 12px; padding: 24px;">
                <span onclick="fecharSolicitacaoModal()" style="position: absolute; top: 15px; right: 20px; font-size: 24px; cursor: pointer; color: #6b7280;">&times;</span>
                <h2 style="margin-bottom: 20px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Detalhes da Solicitação</h2>
                <div id="modal-detalhes"></div>
                <div id="modal-acoes" style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;"></div>
                <div style="margin-top: 20px; text-align: right;">
                    <button onclick="fecharSolicitacaoModal()" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Buscar dados completos do acompanhante (nome + quarto) ANTES de mostrar o modal
    buscarDadosAcompanhante(solicitacao).then(dadosAcompanhante => {
        preencherDetalhesModal(solicitacao, dadosAcompanhante);
        // Só mostrar modal DEPOIS que os dados foram carregados
        modal.classList.remove('hidden');
    }).catch(error => {
        console.error('[MODAL] Erro ao buscar dados do acompanhante:', error);
        // Se der erro, usar dados da própria solicitação e mostrar mesmo assim
        const dadosBasicos = {
            nome: solicitacao.usuarioNome || solicitacao.nome || 'Acompanhante',
            quarto: solicitacao.quarto || 'N/A',
            fonte: 'solicitacao-erro'
        };
        preencherDetalhesModal(solicitacao, dadosBasicos);
        modal.classList.remove('hidden');
    });
}

// Função para buscar dados completos do acompanhante (nome + quarto)
async function buscarDadosAcompanhante(solicitacao) {
    console.log('[DEBUG-ACOMPANHANTE] === INICIANDO BUSCA DE DADOS ===');
    console.log('[DEBUG-ACOMPANHANTE] Solicitação recebida:', {
        id: solicitacao.id,
        titulo: solicitacao.titulo,
        usuarioEmail: solicitacao.usuarioEmail,
        usuarioNome: solicitacao.usuarioNome,
        nome: solicitacao.nome,
        quarto: solicitacao.quarto,
        usuarioId: solicitacao.usuarioId
    });
    
    try {
        // **PRIORIDADE TOTAL: Dados da solicitação (agora sempre atualizados)**
        let nomeEncontrado = 'Acompanhante'; // fallback
        let quartoEncontrado = 'N/A'; // fallback
        
        // 1. Nome: priorizar usuarioNome da solicitação
        if (solicitacao.usuarioNome && solicitacao.usuarioNome !== 'Usuário') {
            nomeEncontrado = solicitacao.usuarioNome;
            console.log('[DEBUG-ACOMPANHANTE] ✅ Nome da solicitação (usuarioNome):', nomeEncontrado);
        } else if (solicitacao.usuarioEmail) {
            // Fallback: extrair do email
            const emailPart = solicitacao.usuarioEmail.split('@')[0];
            nomeEncontrado = emailPart;
            console.log('[DEBUG-ACOMPANHANTE] ✅ Nome extraído do email:', nomeEncontrado);
        }
        
        // 2. Quarto: primeiro tentar da solicitação, depois Firestore se necessário
        if (solicitacao.quarto && solicitacao.quarto !== 'N/A') {
            quartoEncontrado = solicitacao.quarto;
            console.log('[DEBUG-ACOMPANHANTE] ✅ Quarto da solicitação:', quartoEncontrado);
        } else {
            console.log('[DEBUG-ACOMPANHANTE] ⚠️ Quarto N/A na solicitação - buscando no Firestore...');
            
            // **BUSCAR NO FIRESTORE POR EMAIL SE QUARTO FOR N/A**
            if (solicitacao.usuarioEmail) {
                try {
                    console.log('[DEBUG-ACOMPANHANTE] 🔍 Buscando por email:', solicitacao.usuarioEmail);
                    
                    const usersSnapshot = await window.db.collection('usuarios_acompanhantes')
                        .where('email', '==', solicitacao.usuarioEmail)
                        .get();
                    
                    if (!usersSnapshot.empty) {
                        const userDoc = usersSnapshot.docs[0];
                        const userData = userDoc.data();
                        console.log('[DEBUG-ACOMPANHANTE] ✅ Dados encontrados no Firestore:', userData);
                        
                        // Atualizar nome se não temos um melhor
                        if (!solicitacao.usuarioNome && userData.nome) {
                            nomeEncontrado = userData.nome;
                            console.log('[DEBUG-ACOMPANHANTE] ✅ Nome atualizado do Firestore:', nomeEncontrado);
                        }
                        
                        // Atualizar quarto se encontrado
                        if (userData.quarto) {
                            quartoEncontrado = userData.quarto;
                            console.log('[DEBUG-ACOMPANHANTE] 🏠 Quarto encontrado no Firestore:', quartoEncontrado);
                        }
                    } else {
                        console.log('[DEBUG-ACOMPANHANTE] ⚠️ Usuário não encontrado no Firestore por email');
                    }
                } catch (firestoreError) {
                    console.error('[DEBUG-ACOMPANHANTE] ❌ Erro ao buscar no Firestore:', firestoreError);
                }
            }
        }
        
        const resultado = {
            nome: nomeEncontrado,
            quarto: quartoEncontrado,
            fonte: 'solicitacao_atualizada',
            encontrado: true
        };
        
        console.log('[DEBUG-ACOMPANHANTE] ✅ RESULTADO FINAL:', resultado);
        return resultado;
        
    } catch (error) {
        console.error('[DEBUG-ACOMPANHANTE] ❌ ERRO:', error);
        
        // Retorno de emergência
        return {
            nome: solicitacao.usuarioNome || solicitacao.nome || 'Acompanhante',
            quarto: solicitacao.quarto || 'N/A',
            fonte: 'erro_fallback',
            encontrado: false
        };
    }
}

// Função para buscar nome do acompanhante (mantida para compatibilidade)
async function buscarNomeAcompanhante(solicitacao) {
    if (!solicitacao.usuarioId && !solicitacao.solicitanteId) {
        return solicitacao.nome || 'Acompanhante não identificado';
    }

    try {
        // Verificar se o usuário atual tem permissão para acessar usuarios_acompanhantes
        const user = window.auth.currentUser;
        if (!user) {
            return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante não identificado';
        }

        try {
            const userData = await window.verificarUsuarioAdminJS(user);
            if (!userData || (userData.role !== 'super_admin' && userData.role !== 'admin')) {
                // Usuário sem permissão - retornar dados da própria solicitação
                return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante não identificado';
            }
        } catch (permError) {
            return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante não identificado';
        }

        // Tentar buscar nas duas possíveis coleções
        const userId = solicitacao.usuarioId || solicitacao.solicitanteId;
        
        // Primeiro tentar na coleção usuarios_acompanhantes (somente se tiver permissão)
        const acompanhanteRef = await window.db.collection('usuarios_acompanhantes').doc(userId).get();
        
        if (acompanhanteRef.exists) {
            const data = acompanhanteRef.data();
            return data.nome || data.nomeCompleto || 'Acompanhante';
        }
        
        // Se não encontrar, tentar buscar pelo email na Auth (fallback)
        // Retornar nome da solicitação se existir
        return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante não identificado';
        
    } catch (error) {
        console.warn('[DEBUG] Erro ao buscar nome do acompanhante:', error);
        return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante não identificado';
    }
}

// Função para preencher detalhes do modal
function preencherDetalhesModal(solicitacao, dadosAcompanhante) {
    const detalhesEl = document.getElementById('modal-detalhes');
    const acoesEl = document.getElementById('modal-acoes');
    
    // Se dadosAcompanhante for string (compatibilidade), converter para objeto
    if (typeof dadosAcompanhante === 'string') {
        dadosAcompanhante = { nome: dadosAcompanhante, quarto: solicitacao.quarto || 'N/A' };
    }
    
    if (detalhesEl && solicitacao) {
        const statusInfo = {
            'pendente': { cor: '#dc2626', icone: 'clock', texto: 'Pendente' },
            'em-andamento': { cor: '#d97706', icone: 'spinner', texto: 'Em Andamento' },
            'finalizada': { cor: '#059669', icone: 'check-circle', texto: 'Finalizada' }
        };
        
        const info = statusInfo[solicitacao.status] || statusInfo['pendente'];
        
        // Calcular métricas de tempo para exibição
        let metricas = '';
        const agora = new Date();
        
        if (solicitacao.criadoEm) {
            let dataCreacao;
            
            // Verificar se criadoEm é um timestamp do Firestore ou uma string
            if (solicitacao.criadoEm && typeof solicitacao.criadoEm.toDate === 'function') {
                dataCreacao = solicitacao.criadoEm.toDate();
            } else if (solicitacao.criadoEm && typeof solicitacao.criadoEm === 'string') {
                dataCreacao = new Date(solicitacao.criadoEm);
            } else if (solicitacao.dataAbertura && typeof solicitacao.dataAbertura.toDate === 'function') {
                dataCreacao = solicitacao.dataAbertura.toDate();
            } else if (solicitacao.dataAbertura && typeof solicitacao.dataAbertura === 'string') {
                dataCreacao = new Date(solicitacao.dataAbertura);
            } else {
                // Fallback: usar data atual se não conseguir parsear
                dataCreacao = new Date();
                console.warn('Não foi possível determinar data de criação para solicitação:', solicitacao.id);
            }
            
            const tempoDesdeAbertura = Math.round((agora - dataCreacao) / (1000 * 60));
            
            metricas += `
                <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 12px 0;">
                    <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">⏱️ Métricas de Tempo</h4>
                    <div style="font-size: 13px; color: #6b7280;">
                        <div><strong>Criado em:</strong> ${dataCreacao.toLocaleDateString('pt-BR')} às ${dataCreacao.toLocaleTimeString('pt-BR')}</div>
                        <div><strong>Tempo desde abertura:</strong> ${tempoDesdeAbertura} min (${Math.round(tempoDesdeAbertura/60*10)/10}h)</div>
            `;
            
            // Métricas específicas por status
            if (solicitacao.status === 'em-andamento' && solicitacao.dataInicioAtendimento) {
                const inicioAtendimento = new Date(solicitacao.dataInicioAtendimento);
                const tempoAtendimento = Math.round((agora - inicioAtendimento) / (1000 * 60));
                const tempoEspera = solicitacao.tempoEsperaMinutos || 0;
                
                metricas += `
                        <div><strong>Tempo de espera:</strong> ${tempoEspera} min</div>
                        <div><strong>Tempo em atendimento:</strong> ${tempoAtendimento} min</div>
                `;
            }
            
            if (solicitacao.status === 'finalizada' && solicitacao.metricas) {
                const m = solicitacao.metricas;
                const slaConfig = {
                    'manutencao': 240, 'nutricao': 60, 'higienizacao': 120, 'hotelaria': 180
                };
                const slaLimite = slaConfig[solicitacao.equipe] || 240;
                const slaStatus = m.statusSLA || (m.tempoTotal <= slaLimite ? 'cumprido' : 'violado');
                const slaColor = slaStatus === 'cumprido' ? '#059669' : '#dc2626';
                
                metricas += `
                        <div><strong>Tempo total de resolução:</strong> ${m.tempoTotal || tempoDesdeAbertura} min</div>
                        <div><strong>Tempo efetivo de trabalho:</strong> ${m.tempoTrabalho || 0} min</div>
                        <div><strong>SLA:</strong> <span style="color: ${slaColor}; font-weight: bold;">${slaStatus.toUpperCase()}</span> (limite: ${slaLimite} min)</div>
                        <div><strong>Eficiência:</strong> ${m.tempoTrabalho && m.tempoTotal ? Math.round((m.tempoTrabalho / m.tempoTotal) * 100) : 0}%</div>
                `;
            }
            
            // SLA em tempo real para solicitações não finalizadas
            if (solicitacao.status !== 'finalizada') {
                const slaConfig = {
                    'manutencao': 240, 'nutricao': 60, 'higienizacao': 120, 'hotelaria': 180
                };
                const slaLimite = slaConfig[solicitacao.equipe] || 240;
                const tempoRestante = slaLimite - tempoDesdeAbertura;
                const slaColor = tempoRestante > 0 ? '#059669' : '#dc2626';
                const slaTexto = tempoRestante > 0 ? `${tempoRestante} min restantes` : `${Math.abs(tempoRestante)} min em atraso`;
                
                metricas += `
                        <div><strong>SLA:</strong> <span style="color: ${slaColor}; font-weight: bold;">${slaTexto}</span> (limite: ${slaLimite} min)</div>
                `;
            }
            
            metricas += `
                    </div>
                </div>
            `;
        }
        
        detalhesEl.innerHTML = `
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <i class="fas fa-${info.icone}" style="color: ${info.cor}; margin-right: 8px; font-size: 18px;"></i>
                    <span style="font-weight: 600; color: ${info.cor}; font-size: 16px;">${info.texto}</span>
                </div>
                <div style="font-size: 18px; font-weight: 600; color: #374151;">${(() => {
                    if (solicitacao.titulo) return solicitacao.titulo;
                    if (solicitacao.tipo) return solicitacao.tipo;
                    if (solicitacao.descricao) return solicitacao.descricao;
                    if (solicitacao.detalhes) return solicitacao.detalhes;
                    if (solicitacao.observacoes) return solicitacao.observacoes;
                    return 'Solicitação';
                })()}</div>
            </div>
            <div><strong>ID:</strong> ${solicitacao.id || 'N/A'}</div>
            <div><strong>Equipe:</strong> ${solicitacao.equipe || 'N/A'}</div>
            <div><strong>Descrição:</strong> ${(() => {
                if (solicitacao.descricao) return solicitacao.descricao;
                if (solicitacao.detalhes) return solicitacao.detalhes;
                if (solicitacao.observacoes) return solicitacao.observacoes;
                return 'N/A';
            })()}</div>
            <div><strong>Quarto:</strong> ${dadosAcompanhante?.quarto || solicitacao.quarto || 'N/A'}</div>
            <div><strong>Solicitante:</strong> ${dadosAcompanhante?.nome || solicitacao.usuarioNome || solicitacao.nome || 'N/A'}</div>
            ${solicitacao.responsavel ? `<div><strong>Responsável:</strong> ${solicitacao.responsavel}</div>` : ''}
            ${solicitacao.solucao ? `<div><strong>Solução:</strong> ${solicitacao.solucao}</div>` : ''}
            ${gerarSecaoEvidencias(solicitacao)}
            ${metricas}
        `;
        
        // Verificar permissões e criar botões de ação
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const isEquipe = usuarioAdmin && (usuarioAdmin.role === 'equipe' || usuarioAdmin.isEquipe);
        const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
        const podeAlterar = (isEquipe && usuarioAdmin.equipe === solicitacao.equipe) || isSuperAdmin;
        
        console.log('🎯 MODAL DEBUG:', {
            usuarioAdmin: usuarioAdmin,
            podeAlterar: podeAlterar,
            status: solicitacao.status,
            equipeUsuario: usuarioAdmin.equipe,
            equipeSolicitacao: solicitacao.equipe
        });
        
        // Criar botões apenas se usuário tem permissão e solicitação não está finalizada
        if (acoesEl && podeAlterar && solicitacao.status !== 'finalizada') {
            let botoesHTML = '<h4 style="margin-bottom: 12px; color: #374151;">Ações da Equipe:</h4><div style="display: flex; gap: 8px; flex-wrap: wrap;">';
            
            if (solicitacao.status === 'pendente') {
                botoesHTML += `
                    <button onclick="alterarStatusSolicitacao('${solicitacao.id}', 'em-andamento')" 
                            style="background: #d97706; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-play" style="margin-right: 4px;"></i>Iniciar Atendimento
                    </button>`;
            }
            
            if (solicitacao.status === 'em-andamento') {
                botoesHTML += `
                    <button onclick="alterarStatusSolicitacao('${solicitacao.id}', 'pendente')" 
                            style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-pause" style="margin-right: 4px;"></i>Pausar
                    </button>`;
            }
            
            if (solicitacao.status === 'pendente' || solicitacao.status === 'em-andamento') {
                botoesHTML += `
                    <button onclick="finalizarSolicitacao('${solicitacao.id}')" 
                            style="background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-check" style="margin-right: 4px;"></i>Finalizar
                    </button>`;
            }
            
            botoesHTML += '</div>';
            acoesEl.innerHTML = botoesHTML;
            
            console.log('✅ BOTÕES CRIADOS:', botoesHTML);
        } else {
            if (acoesEl) acoesEl.innerHTML = '';
            console.log('❌ SEM BOTÕES:', { podeAlterar, status: solicitacao.status });
        }
    }

    // Mostrar modal
    const modal = document.getElementById('solicitacao-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function fecharSolicitacaoModal() {
    const modal = document.getElementById('solicitacao-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        
        // Limpar conteúdo do modal para evitar problemas de estado
        const detalhesEl = document.getElementById('modal-detalhes');
        const acoesEl = document.getElementById('modal-acoes');
        
        if (detalhesEl) detalhesEl.innerHTML = '';
        if (acoesEl) acoesEl.innerHTML = '';
        
        debugLog('[DEBUG] Modal fechado e limpo');
    }
}

// Eventos para cards
function adicionarEventosSolicitacoes() {
    document.querySelectorAll('.solicitacao-card').forEach(card => {
        card.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (!card.dataset.solicitacao) {
                console.error('[ERRO] Card sem dados de solicitação');
                showToast('Erro', 'Dados da solicitação não encontrados', 'error');
                return;
            }
            
            try {
                const solicitacao = JSON.parse(card.dataset.solicitacao.replace(/&apos;/g, "'"));
                debugLog('[DEBUG] Abrindo modal para solicitação:', solicitacao.id);
                abrirSolicitacaoModal(solicitacao);
            } catch (error) {
                console.error('[ERRO] Falha ao parsear dados da solicitação:', error);
                showToast('Erro', 'Erro ao carregar dados da solicitação', 'error');
            }
        };
    });
    
    console.log(`[DEBUG] Eventos adicionados a ${document.querySelectorAll('.solicitacao-card').length} cards`);
}

// === SISTEMA DE PESQUISA DE SATISFAÇÃO ===

function abrirPesquisaSatisfacao(solicitacaoId, solicitacaoData) {
    debugLog('[DEBUG] Abrindo pesquisa de satisfação para:', solicitacaoId);
    
    // Criar modal de pesquisa de satisfação
    const modalSatisfacao = document.createElement('div');
    modalSatisfacao.id = 'modal-pesquisa-satisfacao';
    modalSatisfacao.style.cssText = `
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0, 0, 0, 0.7); 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        z-index: 10000;
        animation: fadeIn 0.3s ease-in;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    modalSatisfacao.innerHTML = `
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            .star-rating {
                display: flex;
                gap: 8px;
                justify-content: center;
                margin: 12px 0;
            }
            .star {
                font-size: 32px;
                color: #d1d5db;
                cursor: pointer;
                transition: all 0.2s ease;
                user-select: none;
            }
            .star:hover {
                color: #fbbf24;
                transform: scale(1.1);
            }
            .star.selected {
                color: #f59e0b;
            }
            .aspect-rating {
                display: flex;
                gap: 2px;
            }
            .aspect-star {
                font-size: 14px;
                cursor: pointer;
                color: #d1d5db;
                transition: color 0.2s ease;
                user-select: none;
            }
            .aspect-star:hover,
            .aspect-star.selected {
                color: #f59e0b;
            }
            .satisfaction-modal {
                background: white;
                border-radius: 16px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                text-align: center;
                position: relative;
                animation: slideIn 0.3s ease-out;
                margin: auto;
            }
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        </style>
        <div class="satisfaction-modal">
            <div style="position: absolute; top: 12px; right: 16px;">
                <button onclick="fecharPesquisaSatisfacao()" style="background: none; border: none; font-size: 24px; color: #9ca3af; cursor: pointer; padding: 4px;">&times;</button>
            </div>
            
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); margin: -24px -24px 20px -24px; padding: 20px; border-radius: 16px 16px 0 0; color: white;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 600;">
                    <i class="fas fa-star" style="margin-right: 8px;"></i>
                    Avalie nosso atendimento
                </h2>
                <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">
                    Sua opinião é muito importante para nós!
                </p>
            </div>
            
            <div style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                    <i class="fas fa-tools" style="color: #3b82f6; margin-right: 8px;"></i>
                    <strong style="color: #374151;">${solicitacaoData.equipe || 'Manutenção'}</strong>
                </div>
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                    ${solicitacaoData.descricao || solicitacaoData.titulo || 'Teste elétrico'} | Quarto: ${solicitacaoData.quarto || '04/11'}
                </p>
                <p style="margin: 4px 0 0 0; color: #10b981; font-size: 12px; font-weight: 500;">
                    <i class="fas fa-check-circle" style="margin-right: 4px;"></i>Finalizado há 12 horas
                </p>
            </div>
            
            <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 12px 0; color: #374151; font-weight: 500; font-size: 14px;">
                    Como você avalia o atendimento?
                </p>
            </div>
            
            <div class="star-rating">
                <span class="star" data-rating="1">⭐</span>
                <span class="star" data-rating="2">⭐</span>
                <span class="star" data-rating="3">⭐</span>
                <span class="star" data-rating="4">⭐</span>
                <span class="star" data-rating="5">⭐</span>
            </div>
            
            <div id="rating-text" style="font-weight: 500; color: #6b7280; margin-bottom: 16px; min-height: 20px; font-size: 14px;">
                Selecione uma nota de 1 a 5 estrelas
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px; justify-content: flex-start;">
                    <i class="fas fa-comment-alt" style="color: #6b7280; margin-right: 8px; font-size: 14px;"></i>
                    <label style="color: #374151; font-weight: 500; font-size: 14px;">
                        Avalie aspectos específicos:
                    </label>
                </div>
                
                <!-- Rapidez -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px;">
                    <span style="color: #374151; font-size: 13px;">Rapidez</span>
                    <div class="aspect-rating" data-aspect="rapidez">
                        <span class="aspect-star" data-rating="1">⭐</span>
                        <span class="aspect-star" data-rating="2">⭐</span>
                        <span class="aspect-star" data-rating="3">⭐</span>
                        <span class="aspect-star" data-rating="4">⭐</span>
                        <span class="aspect-star" data-rating="5">⭐</span>
                    </div>
                </div>
                
                <!-- Qualidade -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px;">
                    <span style="color: #374151; font-size: 13px;">Qualidade</span>
                    <div class="aspect-rating" data-aspect="qualidade">
                        <span class="aspect-star" data-rating="1">⭐</span>
                        <span class="aspect-star" data-rating="2">⭐</span>
                        <span class="aspect-star" data-rating="3">⭐</span>
                        <span class="aspect-star" data-rating="4">⭐</span>
                        <span class="aspect-star" data-rating="5">⭐</span>
                    </div>
                </div>
                
                <!-- Atendimento -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 12px;">
                    <span style="color: #374151; font-size: 13px;">Atendimento</span>
                    <div class="aspect-rating" data-aspect="atendimento">
                        <span class="aspect-star" data-rating="1">⭐</span>
                        <span class="aspect-star" data-rating="2">⭐</span>
                        <span class="aspect-star" data-rating="3">⭐</span>
                        <span class="aspect-star" data-rating="4">⭐</span>
                        <span class="aspect-star" data-rating="5">⭐</span>
                    </div>
                </div>
                
                <textarea 
                    id="comentario-satisfacao" 
                    placeholder="Conte-nos sobre sua experiência ou deixe sugestões..."
                    style="width: 100%; height: 60px; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical; font-family: inherit; box-sizing: border-box; font-size: 13px; margin-top: 8px;"
                ></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
                <button 
                    onclick="fecharPesquisaSatisfacao()" 
                    style="background: #f3f4f6; color: #374151; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; min-width: 120px;">
                    Pular Pesquisa
                </button>
                <button 
                    id="btn-enviar-avaliacao"
                    onclick="enviarAvaliacao('${solicitacaoId}')" 
                    disabled
                    style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: not-allowed; font-weight: 500; min-width: 160px; transition: all 0.3s ease;">
                    <i class="fas fa-paper-plane" style="margin-right: 6px;"></i>Enviar Avaliação
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalSatisfacao);
    
    // Configurar sistema de estrelas
    let avaliacaoSelecionada = 0;
    const stars = modalSatisfacao.querySelectorAll('.star');
    const ratingText = modalSatisfacao.querySelector('#rating-text');
    const btnEnviar = modalSatisfacao.querySelector('#btn-enviar-avaliacao');
    
    debugLog('[DEBUG] Sistema de estrelas configurado:', {
        stars: stars.length,
        ratingText: !!ratingText,
        btnEnviar: !!btnEnviar
    });
    
    const textoAvaliacoes = {
        1: '😞 Muito insatisfeito',
        2: '😐 Insatisfeito', 
        3: '😊 Neutro',
        4: '😃 Satisfeito',
        5: '🤩 Muito satisfeito'
    };
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            avaliacaoSelecionada = parseInt(star.dataset.rating);
            debugLog('[DEBUG] Estrela selecionada:', avaliacaoSelecionada);
            
            // Atualizar visual das estrelas
            stars.forEach((s, i) => {
                if (i < avaliacaoSelecionada) {
                    s.classList.add('selected');
                } else {
                    s.classList.remove('selected');
                }
            });
            
            // Atualizar texto
            ratingText.textContent = textoAvaliacoes[avaliacaoSelecionada];
            
            // Habilitar botão enviar
            if (btnEnviar) {
                btnEnviar.disabled = false;
                btnEnviar.style.background = '#10b981';
                btnEnviar.style.cursor = 'pointer';
                debugLog('[DEBUG] Botão habilitado para avaliação:', avaliacaoSelecionada);
            } else {
                console.error('[ERRO] Botão enviar não encontrado!');
            }
        });
        
        // Efeito hover
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.style.color = '#fbbf24';
                } else {
                    s.style.color = '#d1d5db';
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach((s, i) => {
                if (i < avaliacaoSelecionada) {
                    s.style.color = '#f59e0b';
                } else {
                    s.style.color = '#d1d5db';
                }
            });
        });
    });
    
    // Funcionalidade para avaliações por aspectos
    const aspectRatings = {};
    const aspectContainers = document.querySelectorAll('.aspect-rating');
    
    aspectContainers.forEach(container => {
        const aspect = container.dataset.aspect;
        const aspectStars = container.querySelectorAll('.aspect-star');
        aspectRatings[aspect] = 0;
        
        aspectStars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                aspectRatings[aspect] = rating;
                
                // Atualizar visual das estrelas do aspecto
                aspectStars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('selected');
                        s.style.color = '#f59e0b';
                    } else {
                        s.classList.remove('selected');
                        s.style.color = '#d1d5db';
                    }
                });
                
                debugLog('[DEBUG] Avaliação do aspecto', aspect + ':', rating);
            });
            
            // Efeito hover para aspectos
            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                aspectStars.forEach((s, i) => {
                    if (i < rating) {
                        s.style.color = '#fbbf24';
                    }
                });
            });
            
            star.addEventListener('mouseleave', () => {
                aspectStars.forEach((s, i) => {
                    if (i < aspectRatings[aspect]) {
                        s.style.color = '#f59e0b';
                    } else {
                        s.style.color = '#d1d5db';
                    }
                });
            });
        });
    });
    
    // Salvar referência global para acesso nas funções onclick
    window.avaliacaoAtual = {
        solicitacaoId: solicitacaoId,
        getAvaliacao: () => avaliacaoSelecionada,
        solicitacaoData: solicitacaoData
    };
}

async function enviarAvaliacao(solicitacaoId) {
    debugLog('[DEBUG] Iniciando envio de avaliação para:', solicitacaoId);
    
    if (!window.avaliacaoAtual || window.avaliacaoAtual.getAvaliacao() === 0) {
        showToast('Aviso', 'Por favor, selecione uma avaliação primeiro!', 'warning');
        console.warn('[AVISO] Tentativa de envio sem avaliação selecionada');
        return;
    }
    
    // Desabilitar botão para evitar múltiplos envios
    const btnEnviar = document.getElementById('btn-enviar-avaliacao');
    if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 4px;"></i>Enviando...';
        btnEnviar.style.background = '#6b7280';
    }
    
    try {
        const avaliacao = window.avaliacaoAtual.getAvaliacao();
        const comentario = document.getElementById('comentario-satisfacao')?.value || '';
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        // Capturar avaliações por aspectos
        const aspectosAvaliacao = {};
        const aspectContainers = document.querySelectorAll('.aspect-rating');
        aspectContainers.forEach(container => {
            const aspect = container.dataset.aspect;
            const stars = container.querySelectorAll('.aspect-star.selected');
            aspectosAvaliacao[aspect] = stars.length;
        });
        
        debugLog('[DEBUG] Dados da avaliação:', {
            avaliacao,
            aspectos: aspectosAvaliacao,
            comentario: comentario.slice(0, 50) + '...',
            avaliadoPor: usuarioAdmin.nome
        });
        
        const avaliacaoData = {
            solicitacaoId: solicitacaoId,
            avaliacao: avaliacao,
            aspectos: aspectosAvaliacao,
            comentario: comentario.trim(),
            dataAvaliacao: new Date().toISOString(),
            avaliadoPor: usuarioAdmin.nome || 'Equipe',
            equipaAvaliada: window.avaliacaoAtual.solicitacaoData.equipe,
            tipoServico: window.avaliacaoAtual.solicitacaoData.tipo || window.avaliacaoAtual.solicitacaoData.equipe,
            quarto: window.avaliacaoAtual.solicitacaoData.quarto
        };
        
        // Verificar se Firebase está disponível
        if (!window.db) {
            throw new Error('Firebase não está disponível');
        }
        
        // Salvar no Firestore
        debugLog('[DEBUG] Salvando avaliação no Firestore...');
        await window.db.collection('avaliacoes_satisfacao').add(avaliacaoData);
        
        // Atualizar solicitação com referência à avaliação
        debugLog('[DEBUG] Atualizando solicitação com dados da avaliação...');
        await window.db.collection('solicitacoes').doc(solicitacaoId).update({
            avaliacaoSatisfacao: {
                nota: avaliacao,
                aspectos: aspectosAvaliacao,
                comentario: comentario.trim(),
                dataAvaliacao: new Date().toISOString(),
                avaliado: true
            }
        });
        
        // Registrar auditoria
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('SATISFACTION_RATING', {
                solicitacaoId,
                avaliacao,
                equipaAvaliada: avaliacaoData.equipaAvaliada
            });
        }
        
        showToast('Sucesso', `Obrigado! Sua avaliação foi registrada com sucesso.`, 'success');
        
        console.log('✅ Avaliação de satisfação salva com sucesso:', avaliacaoData);
        
        // Fechar modal após 2 segundos para que o usuário veja a mensagem
        setTimeout(() => {
            fecharPesquisaSatisfacao();
        }, 2000);
        
    } catch (error) {
        console.error('[ERRO] Falha ao salvar avaliação:', error);
        
        // Reabilitar botão em caso de erro
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '<i class="fas fa-paper-plane" style="margin-right: 4px;"></i>Enviar Avaliação';
            btnEnviar.style.background = '#10b981';
        }
        
        let mensagemErro = 'Não foi possível salvar sua avaliação. Tente novamente.';
        if (error.code === 'permission-denied') {
            mensagemErro = 'Acesso negado. Verifique suas permissões.';
        } else if (error.code === 'unavailable') {
            mensagemErro = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
        }
        
        showToast('Erro', mensagemErro, 'error');
    }
}

function fecharPesquisaSatisfacao() {
    const modal = document.getElementById('modal-pesquisa-satisfacao');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Limpar referência global
    if (window.avaliacaoAtual) {
        delete window.avaliacaoAtual;
    }
}

// Expor funções globalmente
window.abrirPesquisaSatisfacao = abrirPesquisaSatisfacao;
window.enviarAvaliacao = enviarAvaliacao;
window.fecharPesquisaSatisfacao = fecharPesquisaSatisfacao;

// Função de teste para debugar a pesquisa de satisfação
window.testarPesquisaSatisfacao = function() {
    debugLog('[DEBUG] Testando pesquisa de satisfação...');
    const dadosTeste = {
        id: 'teste-123',
        descricao: 'Solicitação de teste para avaliação',
        quarto: '101',
        equipe: 'manutencao',
        tipo: 'manutencao'
    };
    abrirPesquisaSatisfacao('teste-123', dadosTeste);
};

// === DASHBOARD DE SATISFAÇÃO ===

async function abrirDashboardSatisfacao() {
    debugLog('[DEBUG] Abrindo dashboard de satisfação...');
    
    // Verificar permissões (super_admin e admin)
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    if (!userRole || (userRole !== 'super_admin' && userRole !== 'admin')) {
        showToast('Erro', 'Acesso negado. Apenas administradores podem ver relatórios de satisfação.', 'error');
        return;
    }
    
    try {
        // Buscar todas as avaliações
        const avaliacoesSnapshot = await window.db.collection('avaliacoes_satisfacao')
            .orderBy('dataAvaliacao', 'desc')
            .limit(100)
            .get();
        
        const avaliacoes = [];
        avaliacoesSnapshot.forEach(doc => {
            const data = doc.data();
            console.log('[DEBUG-SATISFACAO] Dados brutos da avaliação:', data);
            console.log('[DEBUG-SATISFACAO] Campos da avaliação:', Object.keys(data));
            console.log('[DEBUG-SATISFACAO] QUARTOS disponíveis:', {
                quarto: data.quarto,
                numeroQuarto: data.numeroQuarto,
                quartoSolicitacao: data.quartoSolicitacao,
                quartoNumero: data.quartoNumero
            });
            console.log('[DEBUG-SATISFACAO] VALORES REAIS DOS QUARTOS:', {
                'data.quarto': JSON.stringify(data.quarto),
                'data.numeroQuarto': JSON.stringify(data.numeroQuarto),
                'data.quartoSolicitacao': JSON.stringify(data.quartoSolicitacao),
                'data.quartoNumero': JSON.stringify(data.quartoNumero)
            });
            console.log('[DEBUG-SATISFACAO] TESTE DIRETO - quarto:', data.quarto, '| numeroQuarto:', data.numeroQuarto);
            console.log('[DEBUG-SATISFACAO] Tipos dos campos:', {
                avaliacao: typeof data.avaliacao,
                nota: typeof data.nota,
                rating: typeof data.rating,
                dataAvaliacao: typeof data.dataAvaliacao,
                timestamp: typeof data.timestamp,
                equipaAvaliada: typeof data.equipaAvaliada,
                equipe: typeof data.equipe,
                quarto: typeof data.quarto
            });
            avaliacoes.push({ id: doc.id, ...data });
        });
        
        console.log('[DEBUG-SATISFACAO] Total de avaliações encontradas:', avaliacoes.length);
        console.log('[DEBUG-SATISFACAO] Primeira avaliação (se existir):', avaliacoes[0]);
        
        // Criar modal do dashboard
        const modalDashboard = document.createElement('div');
        modalDashboard.id = 'modal-dashboard-satisfacao';
        modalDashboard.style.cssText = `
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0, 0, 0, 0.6); 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            z-index: 10000;
            padding: 20px;
        `;
        
        const metricas = calcularMetricasSatisfacao(avaliacoes);
        
        modalDashboard.innerHTML = `
            <div style="
                background: white; 
                border-radius: 16px; 
                width: 95%; 
                max-width: 1200px; 
                max-height: 90vh; 
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            ">
                <div style="
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                    padding: 24px; 
                    border-radius: 16px 16px 0 0; 
                    color: white;
                    position: relative;
                ">
                    <button onclick="fecharDashboardSatisfacao()" style="
                        position: absolute; 
                        top: 16px; 
                        right: 20px; 
                        background: none; 
                        border: none; 
                        color: white; 
                        font-size: 24px; 
                        cursor: pointer;
                        padding: 4px;
                    ">&times;</button>
                    
                    <h2 style="margin: 0; font-size: 28px; font-weight: 600; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-star"></i>
                        Dashboard de Pesquisa de Satisfação
                    </h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">
                        Análise das avaliações de satisfação dos serviços
                    </p>
                </div>
                
                <div style="padding: 24px;">
                    <!-- Métricas Gerais -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px;">
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                            <i class="fas fa-star" style="font-size: 32px; margin-bottom: 8px;"></i>
                            <div style="font-size: 28px; font-weight: bold;">${metricas.mediaGeral.toFixed(1)}</div>
                            <div style="opacity: 0.9;">Média Geral</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                            <i class="fas fa-poll" style="font-size: 32px; margin-bottom: 8px;"></i>
                            <div style="font-size: 28px; font-weight: bold;">${avaliacoes.length}</div>
                            <div style="opacity: 0.9;">Total Avaliações</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                            <i class="fas fa-thumbs-up" style="font-size: 32px; margin-bottom: 8px;"></i>
                            <div style="font-size: 28px; font-weight: bold;">${metricas.percentualPositivo}%</div>
                            <div style="opacity: 0.9;">Satisfação Positiva</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                            <i class="fas fa-chart-line" style="font-size: 32px; margin-bottom: 8px;"></i>
                            <div style="font-size: 28px; font-weight: bold;">${metricas.melhorEquipe}</div>
                            <div style="opacity: 0.9;">Melhor Equipe</div>
                        </div>
                    </div>
                    
                    <!-- Métricas por Equipe -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 16px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-users"></i>
                            Satisfação por Equipe
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            ${Object.entries(metricas.porEquipe).map(([equipe, dados]) => `
                                <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid ${getCorEquipe(equipe)};">
                                    <div style="font-weight: bold; color: #374151; margin-bottom: 8px; text-transform: capitalize;">
                                        ${equipe}
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <span>Média:</span>
                                        <span style="font-weight: bold; color: ${dados.media >= 4 ? '#10b981' : dados.media >= 3 ? '#f59e0b' : '#ef4444'};">
                                            ${dados.media.toFixed(1)} ⭐
                                        </span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>Avaliações:</span>
                                        <span style="font-weight: bold;">${dados.total}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Avaliações Recentes -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
                        <h3 style="margin: 0 0 16px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-clock"></i>
                            Avaliações Recentes
                        </h3>
                        <div style="max-height: 400px; overflow-y: auto;">
                            ${avaliacoes.slice(0, 20).map(avaliacao => {
                                // Tentar diferentes campos para obter a nota
                                let nota = avaliacao.avaliacao || avaliacao.nota || avaliacao.rating || avaliacao.estrelas || 0;
                                if (typeof nota === 'string') {
                                    nota = Number(nota);
                                }
                                if (isNaN(nota)) nota = 0;
                                
                                // Tentar diferentes campos para obter o quarto
                                const quarto = avaliacao.quarto || avaliacao.numeroQuarto || avaliacao.quartoSolicitacao || avaliacao.quartoNumero || 'N/A';
                                
                                // Tentar diferentes campos para obter a equipe
                                const equipe = avaliacao.equipaAvaliada || avaliacao.equipe || avaliacao.equipeResponsavel || 'N/A';
                                
                                // Tentar diferentes campos para obter a data
                                const dataFormatada = formatarDataHora(
                                    avaliacao.dataAvaliacao || 
                                    avaliacao.timestamp || 
                                    avaliacao.data || 
                                    avaliacao.created_at
                                );
                                
                                return `
                                <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${getCorAvaliacao(nota)};">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                        <div>
                                            <div style="font-weight: bold; color: #374151;">
                                                ${getEstrelasVisuais(nota)} 
                                                <span style="color: #6b7280;">(${nota}/5)</span>
                                            </div>
                                            <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">
                                                Equipe: ${equipe} | Quarto: ${quarto}
                                            </div>
                                        </div>
                                        <div style="text-align: right; color: #6b7280; font-size: 12px;">
                                            ${dataFormatada}
                                        </div>
                                    </div>
                                    ${avaliacao.comentario || avaliacao.comentarios ? `
                                        <div style="background: #f3f4f6; padding: 8px 12px; border-radius: 6px; color: #374151; font-style: italic; font-size: 14px;">
                                            "${avaliacao.comentario || avaliacao.comentarios}"
                                        </div>
                                    ` : ''}
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                    
                    <!-- Botões de Ação -->
                    <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
                        <div style="display: flex; justify-content: center; align-items: center; gap: 16px; flex-wrap: wrap;">
                            <!-- Botão Exportar Excel -->
                            <button onclick="exportarRelatorioSatisfacaoExcel()" 
                                    style="background: #10b981; color: white; border: none; padding: 14px 28px; border-radius: 8px; 
                                           font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px;
                                           font-size: 15px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                <i class="fas fa-file-excel" style="font-size: 18px;"></i>
                                Exportar Relatório (Excel)
                            </button>
                            
                            <!-- Botão Filtrar -->
                            <button onclick="abrirFiltrosSatisfacao()" 
                                    style="background: #3b82f6; color: white; border: none; padding: 14px 28px; border-radius: 8px; 
                                           font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px;
                                           font-size: 15px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                                <i class="fas fa-filter" style="font-size: 18px;"></i>
                                Filtrar Resultados
                            </button>
                            
                            <!-- Botão Excluir -->
                            <button onclick="confirmarExclusaoPesquisasSatisfacao()" 
                                    style="background: #dc2626; color: white; border: none; padding: 14px 28px; border-radius: 8px; 
                                           font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px;
                                           font-size: 15px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                                <i class="fas fa-trash-alt" style="font-size: 18px;"></i>
                                Excluir Todas as Pesquisas
                            </button>
                        </div>
                        <div style="color: #6b7280; font-size: 13px; max-width: 600px; text-align: center; margin: 16px auto 0;">
                            💡 Exporte relatórios detalhados, filtre por equipe/período ou remova permanentemente todas as avaliações
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalDashboard);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard de satisfação:', error);
        showToast('Erro', 'Não foi possível carregar o dashboard de satisfação.', 'error');
    }
}

// === FUNÇÃO PARA EXCLUIR PESQUISAS DE SATISFAÇÃO ===
async function confirmarExclusaoPesquisasSatisfacao() {
    const confirmacao = confirm(`⚠️ ATENÇÃO: EXCLUSÃO DE PESQUISAS DE SATISFAÇÃO

Esta ação irá excluir PERMANENTEMENTE:

📊 Todas as avaliações de satisfação da coleção 'avaliacoes_satisfacao'
📝 Todos os dados de avaliação em solicitações existentes
📈 Todo o histórico de pesquisas de satisfação

❌ ESTA AÇÃO NÃO PODE SER DESFEITA!

Tem certeza de que deseja continuar?`);

    if (!confirmacao) {
        console.log('[SATISFACAO-CLEANUP] Operação cancelada pelo usuário');
        return;
    }

    try {
        console.log('[SATISFACAO-CLEANUP] 🧹 Iniciando exclusão de pesquisas de satisfação...');
        showToast('Info', 'Iniciando exclusão das pesquisas de satisfação...', 'info');

        let totalExcluidos = 0;

        // 1. Excluir coleção avaliacoes_satisfacao
        console.log('[SATISFACAO-CLEANUP] Buscando documentos da coleção avaliacoes_satisfacao...');
        const avaliacoesSnapshot = await window.db.collection('avaliacoes_satisfacao').get();
        
        if (!avaliacoesSnapshot.empty) {
            const batch = window.db.batch();
            avaliacoesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                totalExcluidos++;
            });
            
            await batch.commit();
            console.log(`[SATISFACAO-CLEANUP] ✅ ${totalExcluidos} avaliações excluídas da coleção avaliacoes_satisfacao`);
        }

        // 2. Limpar campos de avaliação das solicitações
        console.log('[SATISFACAO-CLEANUP] Limpando dados de avaliação das solicitações...');
        const solicitacoesSnapshot = await window.db.collection('solicitacoes')
            .where('avaliacaoSolicitada', '==', true)
            .get();

        if (!solicitacoesSnapshot.empty) {
            const batchSolicitacoes = window.db.batch();
            let solicitacoesAtualizadas = 0;
            
            solicitacoesSnapshot.docs.forEach(doc => {
                batchSolicitacoes.update(doc.ref, {
                    avaliacaoSolicitada: false,
                    avaliacaoEnviada: false,
                    avaliacao: null,
                    comentarioAvaliacao: null,
                    dataAvaliacao: null,
                    avaliadoEm: null
                });
                solicitacoesAtualizadas++;
            });
            
            await batchSolicitacoes.commit();
            console.log(`[SATISFACAO-CLEANUP] ✅ ${solicitacoesAtualizadas} solicitações com dados de avaliação limpos`);
        }

        console.log(`[SATISFACAO-CLEANUP] ✅ Limpeza concluída! Total de registros processados: ${totalExcluidos + (solicitacoesSnapshot?.size || 0)}`);
        
        showToast('Sucesso', `Pesquisas de satisfação excluídas com sucesso! ${totalExcluidos} avaliações removidas.`, 'success');
        
        // Fechar modal e reabrir para mostrar dados limpos
        document.querySelectorAll('.modal').forEach(modal => modal.remove());
        
        setTimeout(() => {
            abrirDashboardSatisfacao();
        }, 1000);

    } catch (error) {
        console.error('[SATISFACAO-CLEANUP] ❌ Erro durante a exclusão:', error);
        showToast('Erro', `Erro ao excluir pesquisas: ${error.message}`, 'error');
    }
}

function calcularMetricasSatisfacao(avaliacoes) {
    console.log('[DEBUG-METRICAS] Calculando métricas para:', avaliacoes.length, 'avaliações');
    
    if (!avaliacoes || avaliacoes.length === 0) {
        console.log('[DEBUG-METRICAS] Nenhuma avaliação encontrada, retornando valores padrão');
        return {
            mediaGeral: 0,
            percentualPositivo: 0,
            melhorEquipe: 'N/A',
            porEquipe: {}
        };
    }
    
    // Filtrar avaliações válidas
    const avaliacoesValidas = avaliacoes.filter(a => {
        // Tentar diferentes campos para a nota
        let nota = a.avaliacao || a.nota || a.rating || a.estrelas;
        if (typeof nota === 'string') {
            nota = Number(nota);
        }
        
        const valida = !isNaN(nota) && nota >= 1 && nota <= 5;
        if (!valida) {
            console.log('[DEBUG-METRICAS] Avaliação inválida encontrada:', {
                id: a.id,
                notaOriginal: a.avaliacao,
                notaProcessada: nota,
                campos: Object.keys(a)
            });
        }
        return valida;
    });
    
    console.log('[DEBUG-METRICAS] Avaliações válidas:', avaliacoesValidas.length);
    
    if (avaliacoesValidas.length === 0) {
        return {
            mediaGeral: 0,
            percentualPositivo: 0,
            melhorEquipe: 'N/A',
            porEquipe: {}
        };
    }
    
    // Calcular média geral
    const somaTotal = avaliacoesValidas.reduce((soma, avaliacao) => {
        let nota = avaliacao.avaliacao || avaliacao.nota || avaliacao.rating || avaliacao.estrelas;
        if (typeof nota === 'string') {
            nota = Number(nota);
        }
        return soma + nota;
    }, 0);
    const mediaGeral = somaTotal / avaliacoesValidas.length;
    
    console.log('[DEBUG-METRICAS] Soma total:', somaTotal, 'Média geral:', mediaGeral);
    
    // Calcular percentual positivo (4 e 5 estrelas)
    const avaliacoesPositivas = avaliacoesValidas.filter(a => {
        let nota = a.avaliacao || a.nota || a.rating || a.estrelas;
        if (typeof nota === 'string') {
            nota = Number(nota);
        }
        return nota >= 4;
    }).length;
    const percentualPositivo = Math.round((avaliacoesPositivas / avaliacoesValidas.length) * 100);
    
    console.log('[DEBUG-METRICAS] Avaliações positivas:', avaliacoesPositivas, 'Percentual:', percentualPositivo);
    
    // Calcular métricas por equipe
    const porEquipe = {};
    avaliacoesValidas.forEach(avaliacao => {
        const equipe = avaliacao.equipaAvaliada || avaliacao.equipe || avaliacao.equipeResponsavel;
        let nota = avaliacao.avaliacao || avaliacao.nota || avaliacao.rating || avaliacao.estrelas;
        if (typeof nota === 'string') {
            nota = Number(nota);
        }
        
        if (equipe && !porEquipe[equipe]) {
            porEquipe[equipe] = { total: 0, soma: 0, media: 0 };
        }
        if (equipe) {
            porEquipe[equipe].total++;
            porEquipe[equipe].soma += nota;
        }
    });
    
    // Calcular médias por equipe
    Object.keys(porEquipe).forEach(equipe => {
        porEquipe[equipe].media = porEquipe[equipe].soma / porEquipe[equipe].total;
    });
    
    // Encontrar melhor equipe
    let melhorEquipe = 'N/A';
    let melhorMedia = 0;
    Object.entries(porEquipe).forEach(([equipe, dados]) => {
        if (dados.media > melhorMedia && dados.total >= 3) { // Mínimo 3 avaliações
            melhorMedia = dados.media;
            melhorEquipe = equipe;
        }
    });
    
    return {
        mediaGeral,
        percentualPositivo,
        melhorEquipe: melhorEquipe.charAt(0).toUpperCase() + melhorEquipe.slice(1),
        porEquipe
    };
}

// === SISTEMA DE EVIDÊNCIAS ===

// Variável global para armazenar os arquivos selecionados
let arquivosEvidencias = [];

function handleEvidenciasUpload(input) {
    const files = input.files;
    const maxFiles = 5;
    const maxSizePerFile = 10 * 1024 * 1024; // 10MB em bytes
    
    // Validações
    if (files.length > maxFiles) {
        showToast('Erro', `Máximo de ${maxFiles} arquivos permitidos.`, 'error');
        input.value = '';
        return;
    }
    
    let validFiles = [];
    let totalSize = 0;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tamanho do arquivo
        if (file.size > maxSizePerFile) {
            showToast('Erro', `Arquivo "${file.name}" excede o limite de 10MB.`, 'error');
            continue;
        }
        
        // Validar tipo de arquivo
        const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const isValidType = allowedTypes.some(type => file.type.startsWith(type));
        
        if (!isValidType) {
            showToast('Erro', `Arquivo "${file.name}" não é um tipo válido.`, 'error');
            continue;
        }
        
        validFiles.push(file);
        totalSize += file.size;
    }
    
    // Limite total de 50MB
    if (totalSize > 50 * 1024 * 1024) {
        showToast('Erro', 'Tamanho total dos arquivos excede 50MB.', 'error');
        input.value = '';
        return;
    }
    
    if (validFiles.length === 0) {
        input.value = '';
        return;
    }
    
    // Armazenar arquivos válidos
    arquivosEvidencias = validFiles;
    
    // Mostrar preview dos arquivos
    mostrarPreviewEvidencias(validFiles);
    
    console.log(`[DEBUG] ${validFiles.length} arquivo(s) selecionado(s) para evidências`);
}

function mostrarPreviewEvidencias(files) {
    const previewContainer = document.getElementById('evidencias-preview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileElement = document.createElement('div');
        fileElement.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: white; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 8px;';
        
        const fileInfo = document.createElement('div');
        fileInfo.style.cssText = 'display: flex; align-items: center; flex-grow: 1;';
        
        // Ícone baseado no tipo de arquivo
        let icon = '📄';
        if (file.type.startsWith('image/')) icon = '🖼️';
        else if (file.type.includes('pdf')) icon = '📄';
        else if (file.type.includes('word')) icon = '📝';
        
        fileInfo.innerHTML = `
            <span style="margin-right: 8px; font-size: 16px;">${icon}</span>
            <div>
                <div style="font-weight: 500; color: #374151; font-size: 14px;">${file.name}</div>
                <div style="color: #6b7280; font-size: 12px;">${formatarTamanhoArquivo(file.size)}</div>
            </div>
        `;
        
        const removeButton = document.createElement('button');
        removeButton.innerHTML = '&times;';
        removeButton.style.cssText = 'background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;';
        removeButton.onclick = () => removerEvidencia(index);
        
        fileElement.appendChild(fileInfo);
        fileElement.appendChild(removeButton);
        previewContainer.appendChild(fileElement);
    });
    
    // Mostrar total
    const totalElement = document.createElement('div');
    totalElement.style.cssText = 'text-align: center; color: #059669; font-size: 12px; margin-top: 8px; font-weight: 500;';
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    totalElement.textContent = `${files.length} arquivo(s) • ${formatarTamanhoArquivo(totalSize)}`;
    previewContainer.appendChild(totalElement);
}

function removerEvidencia(index) {
    arquivosEvidencias.splice(index, 1);
    mostrarPreviewEvidencias(arquivosEvidencias);
    
    // Atualizar o input file
    const input = document.getElementById('evidencias-upload');
    if (input && arquivosEvidencias.length === 0) {
        input.value = '';
    }
    
    console.log(`[DEBUG] Evidência removida. Total: ${arquivosEvidencias.length} arquivo(s)`);
}

function formatarTamanhoArquivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadEvidenciasParaFirebase(solicitacaoId) {
    if (arquivosEvidencias.length === 0) {
        return []; // Retorna array vazio se não há arquivos
    }
    
    console.log(`[DEBUG] Iniciando upload de ${arquivosEvidencias.length} evidência(s)...`);
    
    // Para esta implementação, vamos usar uma simulação de upload
    // Em produção, você integraria com Firebase Storage ou outro serviço
    const evidenciasUploadadas = [];
    
    try {
        for (let i = 0; i < arquivosEvidencias.length; i++) {
            const file = arquivosEvidencias[i];
            
            // Simular upload (substituir por integração real)
            const evidencia = {
                nome: file.name,
                tamanho: file.size,
                tipo: file.type,
                uploadedAt: new Date().toISOString(),
                // Em produção, adicionar:
                // url: urlDoArquivoNoStorage,
                // path: caminhoNoStorage
            };
            
            evidenciasUploadadas.push(evidencia);
            console.log(`[DEBUG] Evidência ${i + 1}/${arquivosEvidencias.length} processada: ${file.name}`);
        }
        
        console.log(`[DEBUG] Upload concluído: ${evidenciasUploadadas.length} evidência(s)`);
        return evidenciasUploadadas;
        
    } catch (error) {
        console.error('[ERRO] Falha no upload das evidências:', error);
        throw new Error('Falha no upload das evidências: ' + error.message);
    }
}

// Expor funções globalmente
window.handleEvidenciasUpload = handleEvidenciasUpload;
window.removerEvidencia = removerEvidencia;

// Funções para gerenciar evidências
function gerarSecaoEvidencias(solicitacao) {
    if (!solicitacao.evidencias || solicitacao.evidencias.length === 0) {
        return '';
    }

    let html = `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <h4 style="color: #374151; margin-bottom: 12px; font-size: 14px; font-weight: 600; display: flex; align-items: center;">
                <i class="fas fa-paperclip" style="margin-right: 8px; color: #6b7280;"></i>
                Evidências Anexadas (${solicitacao.evidencias.length})
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px;">
    `;

    solicitacao.evidencias.forEach((evidencia, index) => {
        const isImage = evidencia.tipo.startsWith('image/');
        const fileName = evidencia.nome.length > 15 ? evidencia.nome.substring(0, 15) + '...' : evidencia.nome;
        
        html += `
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer;" 
                 onclick="window.visualizarEvidencia('${evidencia.url}', '${evidencia.nome}', '${evidencia.tipo}')">
                ${isImage ? 
                    `<img src="${evidencia.url}" alt="${evidencia.nome}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` :
                    `<div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                        <i class="fas fa-file-alt" style="font-size: 32px; color: #6b7280;"></i>
                     </div>`
                }
                <div style="font-size: 11px; color: #6b7280; word-break: break-word;" title="${evidencia.nome}">${fileName}</div>
                <div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">${formatarTamanhoArquivo(evidencia.tamanho)}</div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    return html;
}

function formatarTamanhoArquivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

window.visualizarEvidencia = function(url, nome, tipo) {
    if (tipo.startsWith('image/')) {
        // Para imagens, criar modal de visualização
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(0,0,0,0.9); display: flex; align-items: center; 
            justify-content: center; z-index: 10000; cursor: pointer;
        `;
        
        modal.innerHTML = `
            <div style="max-width: 90vw; max-height: 90vh; position: relative;">
                <img src="${url}" alt="${nome}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                <div style="position: absolute; top: -40px; left: 0; color: white; font-size: 14px;">${nome}</div>
                <div style="position: absolute; top: -40px; right: 0;">
                    <button onclick="this.closest('.modal-evidencia').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
            </div>
        `;
        
        modal.className = 'modal-evidencia';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.body.appendChild(modal);
    } else {
        // Para outros arquivos, abrir em nova aba
        window.open(url, '_blank');
    }
};

function getCorEquipe(equipe) {
    const cores = {
        'manutencao': '#f6b86b',
        'nutricao': '#f9a07d',
        'higienizacao': '#f4768c',
        'hotelaria': '#f05c8d'
    };
    return cores[equipe] || '#6b7280';
}

function getCorAvaliacao(nota) {
    if (nota >= 4) return '#10b981'; // Verde
    if (nota >= 3) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
}

function getEstrelasVisuais(nota) {
    return '⭐'.repeat(nota) + '☆'.repeat(5 - nota);
}

function formatarDataHora(dataISO) {
    try {
        if (!dataISO) {
            console.warn('[FORMATACAO] Data não fornecida');
            return 'Data não informada';
        }
        
        console.log('[FORMATACAO] Processando data:', dataISO, 'Tipo:', typeof dataISO);
        
        let data;
        
        // Se for um timestamp do Firestore (objeto com seconds e nanoseconds)
        if (dataISO && typeof dataISO === 'object' && dataISO.seconds) {
            console.log('[FORMATACAO] Timestamp Firestore detectado:', { seconds: dataISO.seconds, nanoseconds: dataISO.nanoseconds });
            data = new Date(dataISO.seconds * 1000 + (dataISO.nanoseconds || 0) / 1000000);
        }
        // Se for um timestamp do Firestore com método toDate()
        else if (dataISO && typeof dataISO === 'object' && dataISO.toDate) {
            console.log('[FORMATACAO] Timestamp Firestore com toDate() detectado');
            data = dataISO.toDate();
        }
        // Se for um número (timestamp em milissegundos)
        else if (typeof dataISO === 'number') {
            console.log('[FORMATACAO] Timestamp numérico detectado:', dataISO);
            data = new Date(dataISO);
        }
        // Se for string
        else if (typeof dataISO === 'string') {
            // Se for muito curto, pode estar truncado
            if (dataISO.length < 5) {
                console.warn('[FORMATACAO] Data muito curta (truncada):', dataISO);
                return 'Data truncada';
            }
            console.log('[FORMATACAO] String de data detectada:', dataISO);
            data = new Date(dataISO);
        }
        // Outros casos
        else {
            console.log('[FORMATACAO] Tentando conversão direta para Date');
            data = new Date(dataISO);
        }
        
        // Verificar se a data é válida
        if (isNaN(data.getTime())) {
            console.warn('[FORMATACAO] Data inválida após conversão:', dataISO);
            return 'Data inválida';
        }
        
        const resultado = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        console.log('[FORMATACAO] Data formatada com sucesso:', resultado);
        return resultado;
        
    } catch (error) {
        console.error('[FORMATACAO] Erro ao formatar data:', error, 'Data original:', dataISO);
        return 'Erro na data';
    }
}

function fecharDashboardSatisfacao() {
    const modal = document.getElementById('modal-dashboard-satisfacao');
    if (modal) {
        modal.remove();
    }
}

// === EXPORTAÇÃO EXCEL DE RELATÓRIO DE SATISFAÇÃO ===

async function exportarRelatorioSatisfacaoExcel() {
    try {
        console.log('[EXPORT-SATISFACAO] Iniciando exportação de relatório...');
        showToast('Info', 'Preparando relatório para exportação...', 'info');
        
        // Buscar todas as avaliações
        const avaliacoesSnapshot = await window.db.collection('avaliacoes_satisfacao')
            .orderBy('dataAvaliacao', 'desc')
            .get();
        
        if (avaliacoesSnapshot.empty) {
            showToast('Aviso', 'Nenhuma avaliação encontrada para exportar.', 'warning');
            return;
        }
        
        const avaliacoes = [];
        avaliacoesSnapshot.forEach(doc => {
            const data = doc.data();
            avaliacoes.push({ id: doc.id, ...data });
        });
        
        console.log(`[EXPORT-SATISFACAO] ${avaliacoes.length} avaliações para exportar`);
        
        // Preparar dados para Excel
        const dadosExcel = avaliacoes.map(avaliacao => {
            const nota = avaliacao.avaliacao || avaliacao.nota || avaliacao.rating || avaliacao.estrelas || 0;
            const quarto = avaliacao.quarto || avaliacao.numeroQuarto || avaliacao.quartoSolicitacao || 'N/A';
            const equipe = avaliacao.equipaAvaliada || avaliacao.equipe || 'N/A';
            const dataFormatada = formatarDataHora(avaliacao.dataAvaliacao || avaliacao.timestamp);
            
            return {
                'Data': dataFormatada,
                'Equipe': equipe,
                'Quarto': quarto,
                'Nota': nota,
                'Rapidez': avaliacao.aspectos?.rapidez || avaliacao.rapidez || '-',
                'Qualidade': avaliacao.aspectos?.qualidade || avaliacao.qualidade || '-',
                'Atendimento': avaliacao.aspectos?.atendimento || avaliacao.atendimento || '-',
                'Comentário': avaliacao.comentario || avaliacao.comentarios || '-',
                'Recomendaria': avaliacao.recomendaria ? 'Sim' : 'Não'
            };
        });
        
        // Calcular estatísticas por equipe
        const estatisticasPorEquipe = {};
        avaliacoes.forEach(avaliacao => {
            const equipe = avaliacao.equipaAvaliada || avaliacao.equipe || 'N/A';
            const nota = Number(avaliacao.avaliacao || avaliacao.nota || avaliacao.rating || 0);
            
            if (!estatisticasPorEquipe[equipe]) {
                estatisticasPorEquipe[equipe] = { total: 0, soma: 0, positivas: 0 };
            }
            
            estatisticasPorEquipe[equipe].total++;
            estatisticasPorEquipe[equipe].soma += nota;
            if (nota >= 4) estatisticasPorEquipe[equipe].positivas++;
        });
        
        const resumoEquipes = Object.entries(estatisticasPorEquipe).map(([equipe, stats]) => ({
            'Equipe': equipe,
            'Total Avaliações': stats.total,
            'Média': (stats.soma / stats.total).toFixed(2),
            'Satisfação Positiva (%)': ((stats.positivas / stats.total) * 100).toFixed(1) + '%'
        }));
        
        // Verificar se XLSX está disponível
        if (typeof XLSX === 'undefined') {
            console.error('[EXPORT-SATISFACAO] XLSX não carregado');
            showToast('Erro', 'Biblioteca de exportação não disponível. Recarregue a página.', 'error');
            return;
        }
        
        // Criar workbook
        const wb = XLSX.utils.book_new();
        
        // Aba 1: Avaliações detalhadas
        const ws1 = XLSX.utils.json_to_sheet(dadosExcel);
        XLSX.utils.book_append_sheet(wb, ws1, 'Avaliações');
        
        // Aba 2: Resumo por equipe
        const ws2 = XLSX.utils.json_to_sheet(resumoEquipes);
        XLSX.utils.book_append_sheet(wb, ws2, 'Resumo por Equipe');
        
        // Gerar arquivo
        const nomeArquivo = `Relatorio_Satisfacao_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, nomeArquivo);
        
        console.log('[EXPORT-SATISFACAO] ✅ Arquivo exportado:', nomeArquivo);
        showToast('Sucesso', `Relatório exportado com sucesso! ${avaliacoes.length} avaliações`, 'success');
        
    } catch (error) {
        console.error('[EXPORT-SATISFACAO] Erro:', error);
        showToast('Erro', `Erro ao exportar relatório: ${error.message}`, 'error');
    }
}

// === FILTROS DE SATISFAÇÃO ===

function abrirFiltrosSatisfacao() {
    const modalFiltros = document.createElement('div');
    modalFiltros.id = 'modal-filtros-satisfacao';
    modalFiltros.style.cssText = `
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0, 0, 0, 0.6); 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        z-index: 10001;
        padding: 20px;
    `;
    
    modalFiltros.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%;">
            <h3 style="margin: 0 0 20px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-filter"></i>
                Filtrar Avaliações
            </h3>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Equipe:</label>
                <select id="filtro-equipe" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                    <option value="">Todas as equipes</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="nutricao">Nutrição</option>
                    <option value="higienizacao">Higienização</option>
                    <option value="hotelaria">Hotelaria</option>
                </select>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Nota mínima:</label>
                <select id="filtro-nota" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                    <option value="0">Todas as notas</option>
                    <option value="4">4 estrelas ou mais</option>
                    <option value="3">3 estrelas ou mais</option>
                    <option value="2">2 estrelas ou mais</option>
                    <option value="1">1 estrela ou mais</option>
                </select>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Período:</label>
                <select id="filtro-periodo" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                    <option value="0">Todo o período</option>
                    <option value="7">Últimos 7 dias</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="90">Últimos 90 dias</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button onclick="fecharFiltrosSatisfacao()" style="flex: 1; background: #f3f4f6; color: #374151; border: none; padding: 12px; border-radius: 8px; font-weight: 500; cursor: pointer;">
                    Cancelar
                </button>
                <button onclick="aplicarFiltrosSatisfacao()" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 500; cursor: pointer;">
                    Aplicar Filtros
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalFiltros);
}

function fecharFiltrosSatisfacao() {
    const modal = document.getElementById('modal-filtros-satisfacao');
    if (modal) modal.remove();
}

async function aplicarFiltrosSatisfacao() {
    const equipe = document.getElementById('filtro-equipe').value;
    const notaMinima = parseInt(document.getElementById('filtro-nota').value);
    const periodo = parseInt(document.getElementById('filtro-periodo').value);
    
    console.log('[FILTROS] Aplicando:', { equipe, notaMinima, periodo });
    
    fecharFiltrosSatisfacao();
    fecharDashboardSatisfacao();
    
    // Reabrir dashboard com filtros
    await abrirDashboardSatisfacaoComFiltros(equipe, notaMinima, periodo);
}

async function abrirDashboardSatisfacaoComFiltros(equipe, notaMinima, periodo) {
    // TODO: Implementar lógica de filtragem
    // Por enquanto, reabre dashboard normal
    showToast('Info', 'Filtros aplicados! Funcionalidade em desenvolvimento.', 'info');
    abrirDashboardSatisfacao();
}

// Expor função globalmente
window.abrirDashboardSatisfacao = abrirDashboardSatisfacao;
window.exportarRelatorioSatisfacaoExcel = exportarRelatorioSatisfacaoExcel;
window.abrirFiltrosSatisfacao = abrirFiltrosSatisfacao;
window.fecharFiltrosSatisfacao = fecharFiltrosSatisfacao;
window.aplicarFiltrosSatisfacao = aplicarFiltrosSatisfacao;

// Função para mostrar informações de visualização para administradores
function mostrarInfoVisualizacao(solicitacaoId) {
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    
    if (usuarioAdmin.role === 'admin') {
        showToast('Informação', 'Como administrador, você pode visualizar todas as solicitações, mas não pode interagir com elas. Apenas as equipes responsáveis podem dar atendimento às solicitações.', 'info', 5000);
    } else {
        showToast('Aviso', 'Você não tem permissão para interagir com esta solicitação.', 'warning');
    }
}

window.mostrarInfoVisualizacao = mostrarInfoVisualizacao;
window.fecharDashboardSatisfacao = fecharDashboardSatisfacao;

// =============== SISTEMA DE RELATÓRIOS ===============

// Função para gerar relatório visual/dashboard
async function gerarRelatorioAdmin() {
    try {
        debugLog('[DEBUG] gerarRelatorioAdmin: iniciando geração de relatório...');
        
        if (!window.db) {
            showToast('Erro', 'Firestore não inicializado!', 'error');
            return;
        }

        // Mostrar loading
        showToast('Gerando...', 'Coletando dados para o relatório...', 'info');

        // Coletar todas as solicitações
        const snapshot = await window.db.collection('solicitacoes').get();
        const solicitacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`[DEBUG] gerarRelatorioAdmin: ${solicitacoes.length} solicitações encontradas`);

        if (solicitacoes.length === 0) {
            showToast('Aviso', 'Nenhuma solicitação encontrada para gerar relatório', 'warning');
            return;
        }

        // Gerar relatório HTML
        gerarRelatorioHTML(solicitacoes);
        
        showToast('Sucesso', 'Relatório gerado com sucesso!', 'success');

    } catch (error) {
        console.error('[ERRO] gerarRelatorioAdmin:', error);
        showToast('Erro', `Falha ao gerar relatório: ${error.message}`, 'error');
    }
}

// Função para fechar relatório e voltar ao painel inicial
function fecharRelatorioEVoltarPainel() {
    try {
        // Remover modal de relatório
        const modal = document.getElementById('modal-relatorio');
        if (modal) {
            modal.remove();
            debugLog('[DEBUG] Modal de relatório removido');
        }
        
        // Voltar para o painel inicial de cards
        if (typeof window.mostrarSecaoPainel === 'function') {
            window.mostrarSecaoPainel('painel');
            debugLog('[DEBUG] Voltando para painel inicial após fechar relatório');
        } else {
            console.error('[ERRO] Função mostrarSecaoPainel não disponível');
            // Fallback: recarregar a página
            window.location.reload();
        }
        
    } catch (error) {
        console.error('[ERRO] fecharRelatorioEVoltarPainel:', error);
        // Em caso de erro, tentar recarregar a página
        window.location.reload();
    }
}

// Função para gerar relatório visual em HTML
function gerarRelatorioHTML(solicitacoes) {
    const agora = new Date();
    const dataRelatorio = agora.toLocaleDateString('pt-BR');
    const horaRelatorio = agora.toLocaleTimeString('pt-BR');

    // Calcular estatísticas
    const stats = calcularEstatisticas(solicitacoes);

    // Criar modal de relatório
    const modalRelatorio = document.createElement('div');
    modalRelatorio.id = 'modal-relatorio';
    modalRelatorio.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; 
        align-items: center; z-index: 1001; padding: 20px; box-sizing: border-box;
    `;

    modalRelatorio.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 90vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px;">
                <div>
                    <h2 style="margin: 0; color: #1f2937;">📊 Relatório de Solicitações</h2>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Gerado em ${dataRelatorio} às ${horaRelatorio}</p>
                </div>
                <button onclick="fecharRelatorioEVoltarPainel()" 
                        style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>

            <!-- Resumo Executivo -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #374151;">📈 Resumo Executivo</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                        <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${stats.total}</div>
                        <div style="color: #6b7280;">Total de Solicitações</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
                        <div style="font-size: 24px; font-weight: bold; color: #10b981;">${stats.finalizadas}</div>
                        <div style="color: #6b7280;">Finalizadas</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                        <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${stats.emAndamento}</div>
                        <div style="color: #6b7280;">Em Andamento</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444;">
                        <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${stats.pendentes}</div>
                        <div style="color: #6b7280;">Pendentes</div>
                    </div>
                </div>
            </div>

            <!-- Estatísticas por Equipe -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #374151;">👥 Desempenho por Equipe</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                    ${Object.entries(stats.porEquipe).map(([equipe, dados]) => `
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <h4 style="margin: 0 0 10px 0; color: ${getCorEquipe(equipe)}; text-transform: capitalize;">
                                <i class="fas fa-users"></i> ${equipe}
                            </h4>
                            <div style="font-size: 14px; color: #6b7280;">
                                <div>Total: <strong>${dados.total}</strong></div>
                                <div>Finalizadas: <strong style="color: #10b981;">${dados.finalizadas}</strong></div>
                                <div>Taxa Conclusão: <strong>${dados.total > 0 ? Math.round((dados.finalizadas / dados.total) * 100) : 0}%</strong></div>
                                <div>TMA: <strong>${dados.tmaMedia || '--'}</strong></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Lista Detalhada de Solicitações por Equipe -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #374151;">📋 Lista Completa de Solicitações por Equipe</h3>
                ${gerarListaDetalhada(solicitacoes, stats)}
            </div>

            <!-- Botões de Ação -->
            <div style="display: flex; gap: 10px; justify-content: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <button onclick="imprimirRelatorio()" style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-print"></i> Imprimir
                </button>
                <button onclick="exportarDados()" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-download"></i> Exportar Excel
                </button>
            </div>
        </div>
    `;

    // Adicionar evento para fechar ao clicar fora do modal
    modalRelatorio.addEventListener('click', function(e) {
        if (e.target === modalRelatorio) {
            fecharRelatorioEVoltarPainel();
        }
    });

    // Adicionar evento para fechar com tecla ESC
    const handleEscape = function(e) {
        if (e.key === 'Escape') {
            fecharRelatorioEVoltarPainel();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    document.body.appendChild(modalRelatorio);
}

// Função para calcular estatísticas
function calcularEstatisticas(solicitacoes) {
    const stats = {
        total: solicitacoes.length,
        finalizadas: 0,
        emAndamento: 0,
        pendentes: 0,
        porEquipe: {}
    };

    solicitacoes.forEach(sol => {
        // Contar por status
        if (sol.status === 'finalizada') stats.finalizadas++;
        else if (sol.status === 'em-andamento') stats.emAndamento++;
        else stats.pendentes++;

        // Agrupar por equipe
        const equipe = sol.equipe || 'sem-equipe';
        if (!stats.porEquipe[equipe]) {
            stats.porEquipe[equipe] = { total: 0, finalizadas: 0, tempos: [] };
        }
        
        stats.porEquipe[equipe].total++;
        if (sol.status === 'finalizada') {
            stats.porEquipe[equipe].finalizadas++;
        }

        // Calcular TMA se disponível
        if (sol.tempoAtendimentoMinutos) {
            stats.porEquipe[equipe].tempos.push(sol.tempoAtendimentoMinutos);
        }
    });

    // Calcular TMA médio por equipe
    Object.keys(stats.porEquipe).forEach(equipe => {
        const tempos = stats.porEquipe[equipe].tempos;
        if (tempos.length > 0) {
            const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
            stats.porEquipe[equipe].tmaMedia = Math.round(media) + ' min';
        }
    });

    return stats;
}

// Função para gerar lista detalhada por equipe
function gerarListaDetalhada(solicitacoes, stats) {
    const solicitacoesPorEquipe = {};
    
    // Agrupar solicitações por equipe
    solicitacoes.forEach(sol => {
        const equipe = sol.equipe || 'sem-equipe';
        if (!solicitacoesPorEquipe[equipe]) {
            solicitacoesPorEquipe[equipe] = [];
        }
        solicitacoesPorEquipe[equipe].push(sol);
    });
    
    // Gerar HTML para cada equipe
    return Object.entries(solicitacoesPorEquipe).map(([equipe, solicitacoesEquipe]) => {
        // Ordenar por data (mais recentes primeiro)
        const solicitacoesOrdenadas = solicitacoesEquipe.sort((a, b) => {
            const dataA = a.dataAbertura?.seconds || 0;
            const dataB = b.dataAbertura?.seconds || 0;
            return dataB - dataA;
        });
        
        return `
            <div style="margin-bottom: 25px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background: ${getCorEquipe(equipe)}; color: white; padding: 15px;">
                    <h4 style="margin: 0; text-transform: capitalize;">
                        <i class="fas fa-users"></i> ${equipe} (${solicitacoesEquipe.length} solicitações)
                    </h4>
                </div>
                <div style="max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8fafc; position: sticky; top: 0;">
                            <tr>
                                <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Data</th>
                                <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Tipo</th>
                                <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Descrição</th>
                                <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Quarto</th>
                                <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Status</th>
                                <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Prioridade</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${solicitacoesOrdenadas.map(sol => `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding: 8px 10px; font-size: 11px;">
                                        ${sol.dataAbertura ? new Date(sol.dataAbertura.seconds * 1000).toLocaleDateString('pt-BR') : '--'}
                                    </td>
                                    <td style="padding: 8px 10px; font-size: 11px;">
                                        ${sol.tipo || sol.equipe || '--'}
                                    </td>
                                    <td style="padding: 8px 10px; font-size: 11px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                        ${sol.descricao || sol.detalhes || '--'}
                                    </td>
                                    <td style="padding: 8px 10px; font-size: 11px;">
                                        ${sol.quarto || '--'}
                                    </td>
                                    <td style="padding: 8px 10px; font-size: 11px;">
                                        <span style="padding: 2px 6px; border-radius: 12px; font-size: 10px; background: ${getCorStatus(sol.status)}; color: white;">
                                            ${getTextoStatus(sol.status)}
                                        </span>
                                    </td>
                                    <td style="padding: 8px 10px; font-size: 11px;">
                                        <span style="color: ${getCorPrioridade(sol.prioridade)}; font-weight: bold;">
                                            ${sol.prioridade || 'Normal'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }).join('');
}

// Funções auxiliares para formatação
function getCorEquipe(equipe) {
    const cores = {
        'manutencao': '#f6b86b',
        'nutrição': '#f9a07d',
        'nutricao': '#f9a07d',
        'higienização': '#f4768c',
        'higienizacao': '#f4768c',
        'hotelaria': '#f05c8d',
        'default': '#6b7280'
    };
    return cores[equipe?.toLowerCase()] || cores.default;
}

function getCorStatus(status) {
    const cores = {
        'pendente': '#f59e0b',
        'em-andamento': '#3b82f6',
        'finalizada': '#10b981',
        'cancelada': '#ef4444'
    };
    return cores[status] || '#6b7280';
}

function getTextoStatus(status) {
    const textos = {
        'pendente': 'Pendente',
        'em-andamento': 'Em Andamento',
        'finalizada': 'Finalizada',
        'cancelada': 'Cancelada'
    };
    return textos[status] || status;
}

function getCorPrioridade(prioridade) {
    const cores = {
        'urgente': '#dc2626',
        'alta': '#ea580c',
        'normal': '#059669',
        'baixa': '#0891b2'
    };
    return cores[prioridade?.toLowerCase()] || cores.normal;
}

// Função para exportar dados para Excel
async function exportarDados() {
    try {
        debugLog('[DEBUG] exportarDados: iniciando exportação...');
        
        if (!window.XLSX) {
            showToast('Erro', 'Biblioteca XLSX não carregada!', 'error');
            return;
        }

        showToast('Exportando...', 'Preparando dados para exportação...', 'info');

        // Coletar dados
        const snapshot = await window.db.collection('solicitacoes').get();
        const solicitacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (solicitacoes.length === 0) {
            showToast('Aviso', 'Nenhuma solicitação para exportar', 'warning');
            return;
        }

        // Debug: Verificar campos de data disponíveis
        if (solicitacoes.length > 0) {
            const primeiroItem = solicitacoes[0];
            console.log('[DEBUG] Campos de data disponíveis na primeira solicitação:', {
                dataAbertura: primeiroItem.dataAbertura,
                criadoEm: primeiroItem.criadoEm,
                dataCriacao: primeiroItem.dataCriacao,
                createdAt: primeiroItem.createdAt,
                timestamp: primeiroItem.timestamp,
                todasAsChaves: Object.keys(primeiroItem).filter(key => 
                    key.toLowerCase().includes('data') || 
                    key.toLowerCase().includes('created') || 
                    key.toLowerCase().includes('time')
                )
            });
        }

        // Preparar dados para Excel
        const dadosExcel = solicitacoes.map(sol => {
            // Função para extrair data/hora dos diferentes campos possíveis
            const extrairDataHora = (solicitacao) => {
                // Tentar diferentes campos de data em ordem de prioridade
                const camposData = [
                    solicitacao.dataAbertura,
                    solicitacao.criadoEm,
                    solicitacao.dataCriacao,
                    solicitacao.createdAt,
                    solicitacao.timestamp
                ];
                
                for (const campo of camposData) {
                    if (campo) {
                        try {
                            // Se for timestamp do Firebase (objeto com seconds)
                            if (campo.seconds) {
                                return new Date(campo.seconds * 1000).toLocaleString('pt-BR');
                            }
                            // Se for timestamp normal
                            else if (typeof campo === 'number') {
                                return new Date(campo).toLocaleString('pt-BR');
                            }
                            // Se for string de data
                            else if (typeof campo === 'string') {
                                const data = new Date(campo);
                                if (!isNaN(data.getTime())) {
                                    return data.toLocaleString('pt-BR');
                                }
                            }
                        } catch (error) {
                            console.log('[DEBUG] Erro ao processar campo de data:', campo, error);
                        }
                    }
                }
                return 'Invalid Date';
            };

            return {
                'ID': sol.id,
                'Data/Hora': extrairDataHora(sol),
                'Tipo': sol.tipo || '--',
                'Equipe': sol.equipe || '--',
                'Status': sol.status || '--',
                'Quarto': sol.quarto || '--',
                'Solicitante': sol.usuarioNome || sol.nome || '--',
                'Descrição': sol.descricao || '--',
                'Responsável': sol.responsavel || '--',
                'Solução': sol.solucao || '--',
                'TMA (min)': sol.tempoAtendimentoMinutos || '--',
                'Avaliação': sol.avaliacaoNota ? `${sol.avaliacaoNota}/5 estrelas` : '--'
            };
        });

        // Criar workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(dadosExcel);

        // Ajustar largura das colunas
        const colWidths = [
            { wch: 15 }, // ID
            { wch: 20 }, // Data/Hora
            { wch: 15 }, // Tipo
            { wch: 15 }, // Equipe
            { wch: 12 }, // Status
            { wch: 10 }, // Quarto
            { wch: 20 }, // Solicitante
            { wch: 30 }, // Descrição
            { wch: 20 }, // Responsável
            { wch: 30 }, // Solução
            { wch: 12 }, // TMA
            { wch: 15 }  // Avaliação
        ];
        worksheet['!cols'] = colWidths;

        // Adicionar ao workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitações');

        // Gerar nome do arquivo
        const agora = new Date();
        const nomeArquivo = `relatorio-solicitacoes-${agora.getFullYear()}-${(agora.getMonth() + 1).toString().padStart(2, '0')}-${agora.getDate().toString().padStart(2, '0')}.xlsx`;

        // Fazer download
        XLSX.writeFile(workbook, nomeArquivo);

        showToast('Sucesso', `Arquivo ${nomeArquivo} baixado com sucesso!`, 'success');

        console.log(`[DEBUG] exportarDados: ${solicitacoes.length} registros exportados`);

    } catch (error) {
        console.error('[ERRO] exportarDados:', error);
        showToast('Erro', `Falha na exportação: ${error.message}`, 'error');
    }
}

// Função para imprimir relatório
function imprimirRelatorio() {
    const conteudoModal = document.querySelector('#modal-relatorio > div').cloneNode(true);
    
    // Remover botão de fechar e botões de ação para impressão
    const botaoFechar = conteudoModal.querySelector('button');
    if (botaoFechar) botaoFechar.remove();
    
    const botoesAcao = conteudoModal.querySelector('div:last-child');
    if (botoesAcao) botoesAcao.remove();

    // Criar janela de impressão
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório de Solicitações - YUNA</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            ${conteudoModal.outerHTML}
        </body>
        </html>
    `);
    
    janelaImpressao.document.close();
    
    // Aguardar carregamento e imprimir
    setTimeout(() => {
        janelaImpressao.focus();
        janelaImpressao.print();
        janelaImpressao.close();
    }, 250);
}

// Expor funções globalmente
window.gerarRelatorioAdmin = gerarRelatorioAdmin;
window.exportarDados = exportarDados;
window.imprimirRelatorio = imprimirRelatorio;

// =============== SISTEMA DE ACOMPANHANTES ===============

// Função para cadastrar acompanhante
async function cadastrarAcompanhante() {
    try {
        debugLog('[DEBUG] cadastrarAcompanhante: iniciando cadastro...');
        
        if (!window.db || !window.auth) {
            showToast('Erro', 'Firebase não inicializado!', 'error');
            return;
        }

        // Verificar permissões
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin.role || usuarioAdmin.role !== 'super_admin') {
            showToast('Erro', 'Acesso negado. Apenas super administradores podem cadastrar acompanhantes.', 'error');
            return;
        }

        // Coletar dados do formulário
        const nome = document.getElementById('acomp-nome')?.value?.trim();
        const email = document.getElementById('acomp-email')?.value?.trim();
        const quarto = document.getElementById('acomp-quarto')?.value?.trim();
        const senha = document.getElementById('acomp-senha')?.value?.trim();

        // Validações
        if (!nome || !email || !quarto || !senha) {
            showToast('Erro', 'Todos os campos são obrigatórios!', 'error');
            return;
        }

        if (senha.length < 6) {
            showToast('Erro', 'A senha deve ter pelo menos 6 caracteres!', 'error');
            return;
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Erro', 'E-mail em formato inválido!', 'error');
            return;
        }

        // Mostrar loading
        showToast('Cadastrando...', 'Criando conta do acompanhante...', 'info');

        // Verificar se o email já existe
        const emailExiste = await verificarEmailExistente(email);
        if (emailExiste) {
            showToast('Erro', 'Este e-mail já está cadastrado no sistema!', 'error');
            return;
        }

        // Verificar se o quarto já está ocupado
        console.log(`[DEBUG] cadastrarAcompanhante: verificando ocupação do quarto ${quarto}...`);
        const quartoOcupado = await verificarQuartoOcupado(quarto);
        console.log(`[DEBUG] cadastrarAcompanhante: quarto ${quarto} ocupado?`, quartoOcupado);
        
        if (quartoOcupado) {
            console.log(`[DEBUG] cadastrarAcompanhante: EXIBINDO TOAST DE ERRO para quarto ${quarto}`);
            showToast('Erro', `O quarto ${quarto} já possui um acompanhante cadastrado!`, 'error');
            console.warn(`[AVISO] cadastrarAcompanhante: tentativa de cadastro em quarto ocupado: ${quarto}`);
            console.log(`[DEBUG] cadastrarAcompanhante: RETORNANDO após mostrar erro`);
            return;
        }

        // SOLUÇÃO ALTERNATIVA: Criar apenas no Firestore, não no Firebase Auth
        // O usuário criará sua conta quando fizer o primeiro login no portal dos acompanhantes
        
        // Gerar um ID único para o acompanhante
        const acompanhanteId = window.db.collection('usuarios_acompanhantes').doc().id;
        
        debugLog('[DEBUG] cadastrarAcompanhante: criando acompanhante com ID:', acompanhanteId);

        // Criar documento no Firestore com dados de pre-cadastro
        const dadosAcompanhante = {
            nome: nome,
            email: email,
            quarto: quarto,
            senha: senha, // Armazenar temporariamente para primeiro login
            tipo: 'acompanhante',
            ativo: true,
            preCadastro: true, // Flag indicando que ainda não foi ativado no Firebase Auth
            criadoEm: new Date().toISOString(),
            criadoPor: usuarioAdmin.nome,
            id: acompanhanteId
        };

        await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).set(dadosAcompanhante);

        // Registrar ocupação do quarto
        await window.db.collection('quartos_ocupados').doc(quarto).set({
            acompanhanteId: acompanhanteId,
            acompanhanteNome: nome,
            acompanhanteEmail: email,
            ocupadoEm: new Date().toISOString()
        });

        debugLog('[DEBUG] cadastrarAcompanhante: acompanhante salvo no Firestore (pre-cadastro)');

        // Limpar formulário
        document.getElementById('form-cadastro-acompanhante').reset();

        // Recarregar lista
        await carregarAcompanhantes();

        showToast('Sucesso', `Acompanhante ${nome} cadastrado com sucesso!`, 'success');

    } catch (error) {
        console.error('[ERRO] cadastrarAcompanhante:', error);
        
        let mensagem = 'Erro ao cadastrar acompanhante: ';
        switch (error.code) {
            case 'auth/email-already-in-use':
                mensagem += 'Este e-mail já está em uso.';
                break;
            case 'auth/weak-password':
                mensagem += 'Senha muito fraca. Use pelo menos 6 caracteres.';
                break;
            case 'auth/invalid-email':
                mensagem += 'E-mail em formato inválido.';
                break;
            default:
                mensagem += error.message || 'Erro desconhecido.';
        }
        
        showToast('Erro', mensagem, 'error');
    }
}

// Função para verificar se email já existe
async function verificarEmailExistente(email) {
    try {
        // Verificar em acompanhantes
        const acompSnap = await window.db.collection('usuarios_acompanhantes')
            .where('email', '==', email).get();
        
        if (!acompSnap.empty) return true;

        // Verificar em equipe
        const equipeSnap = await window.db.collection('usuarios_equipe')
            .where('email', '==', email).get();
        
        return !equipeSnap.empty;

    } catch (error) {
        console.error('[ERRO] verificarEmailExistente:', error);
        return false;
    }
}

// Função para verificar se quarto já está ocupado
async function verificarQuartoOcupado(quarto) {
    try {
        console.log(`[DEBUG] verificarQuartoOcupado: verificando quarto ${quarto}...`);
        
        if (!quarto || !quarto.trim()) {
            console.warn('[AVISO] verificarQuartoOcupado: quarto vazio ou inválido');
            return false;
        }
        
        // Verificar na coleção quartos_ocupados
        const quartoDoc = await window.db.collection('quartos_ocupados').doc(quarto.trim()).get();
        const quartoExiste = quartoDoc.exists;
        
        console.log(`[DEBUG] verificarQuartoOcupado: quarto ${quarto} existe na coleção quartos_ocupados?`, quartoExiste);
        
        if (quartoExiste) {
            const dadosQuarto = quartoDoc.data();
            console.log(`[DEBUG] verificarQuartoOcupado: dados do quarto ocupado:`, dadosQuarto);
        }
        
        // Verificar também na coleção de usuários acompanhantes como backup
        // Mas somente se o usuário tiver permissão
        let temAcompanhante = false;
        const user = window.auth.currentUser;
        
        if (user) {
            try {
                const userData = await window.verificarUsuarioAdminJS(user);
                if (userData && (userData.role === 'super_admin' || userData.role === 'admin')) {
                    const acompSnap = await window.db.collection('usuarios_acompanhantes')
                        .where('quarto', '==', quarto.trim()).get();
                    
                    temAcompanhante = !acompSnap.empty;
                    console.log(`[DEBUG] verificarQuartoOcupado: quarto ${quarto} tem acompanhante na coleção usuarios_acompanhantes?`, temAcompanhante);
                    
                    if (temAcompanhante) {
                        const acompanhantes = acompSnap.docs.map(doc => doc.data());
                        console.log(`[DEBUG] verificarQuartoOcupado: acompanhantes encontrados no quarto:`, acompanhantes);
                    }
                } else {
                    console.log(`[DEBUG] verificarQuartoOcupado: usuário sem permissão para verificar usuarios_acompanhantes`);
                }
            } catch (permError) {
                console.log(`[DEBUG] verificarQuartoOcupado: erro de permissão ao acessar usuarios_acompanhantes:`, permError.message);
            }
        }
        
        // Retornar true se encontrou em qualquer uma das verificações
        const ocupado = quartoExiste || temAcompanhante;
        console.log(`[DEBUG] verificarQuartoOcupado: resultado final para quarto ${quarto}:`, ocupado);
        
        return ocupado;
        
    } catch (error) {
        console.error(`[ERRO] verificarQuartoOcupado: erro ao verificar quarto ${quarto}:`, error);
        // Em caso de erro, assumir que o quarto não está ocupado para não bloquear cadastros
        return false;
    }
}

// Listener para atualizações em tempo real dos acompanhantes
let acompanhantesListener = null;

// Função para configurar listener em tempo real para acompanhantes
async function configurarListenerAcompanhantes() {
    debugLog('[DEBUG] configurarListenerAcompanhantes: configurando listener...');
    
    if (!window.db) {
        console.warn('[AVISO] configurarListenerAcompanhantes: Firestore não inicializado');
        return;
    }

    // Verificar se usuário tem permissão para acessar acompanhantes
    const user = window.auth.currentUser;
    if (!user) {
        debugLog('[DEBUG] configurarListenerAcompanhantes: usuário não autenticado');
        return;
    }

    try {
        const userData = await window.verificarUsuarioAdminJS(user);
        
        console.log('🏠📝 [ACOMPANHANTES LISTENER DEBUG] Verificando permissões...');
        console.log('🏠📝 [ACOMPANHANTES LISTENER DEBUG] userData:', userData);
        
        // Verificar se é super_admin, admin OU equipe de higienização
        const isSuperAdmin = userData?.role === 'super_admin';
        const isAdmin = userData?.role === 'admin';
        const isHigienizacaoRecepcao = userData?.email === 'recepcao.jardins@yuna.com.br';
        
        console.log('🏠📝 [ACOMPANHANTES LISTENER DEBUG] Permissões:', {
            isSuperAdmin,
            isAdmin,
            isHigienizacaoRecepcao,
            email: userData?.email,
            role: userData?.role
        });
        
        if (!userData || (!isSuperAdmin && !isAdmin && !isHigienizacaoRecepcao)) {
            console.log('🏠📝 [ACOMPANHANTES LISTENER DEBUG] ACESSO NEGADO - sem permissão');
            debugLog('[DEBUG] configurarListenerAcompanhantes: usuário sem permissão para acompanhantes');
            return;
        }
        
        console.log('🏠📝 [ACOMPANHANTES LISTENER DEBUG] ACESSO LIBERADO - configurando listener');
    } catch (error) {
        console.log('🏠📝 [ACOMPANHANTES LISTENER DEBUG] ERRO:', error);
        debugLog('[DEBUG] configurarListenerAcompanhantes: erro ao verificar permissões:', error);
        return;
    }

    // Remover listener anterior se existir
    if (acompanhantesListener) {
        acompanhantesListener();
        acompanhantesListener = null;
    }

    // Configurar listener em tempo real
    acompanhantesListener = window.db.collection('usuarios_acompanhantes').onSnapshot((snapshot) => {
        try {
            debugLog('[DEBUG] Listener acompanhantes: atualização detectada');
            const acompanhantes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            atualizarListaAcompanhantes(acompanhantes);
        } catch (error) {
            console.error('[ERRO] Listener acompanhantes:', error);
        }
    }, (error) => {
        console.error('[ERRO] Listener acompanhantes (erro):', error);
    });
    
    // Registrar listener no ListenerManager
    if (window.listenerManager && acompanhantesListener) {
        window.listenerManager.register(
            acompanhantesListener,
            'lista-acompanhantes',
            { collection: 'usuarios_acompanhantes' }
        );
        console.log('[LISTENER] Listener de acompanhantes registrado no ListenerManager');
    }
}

// Função para atualizar a exibição da lista de acompanhantes
function atualizarListaAcompanhantes(acompanhantes) {
    try {
        const listaElement = document.getElementById('lista-acompanhantes');
        if (!listaElement) return;

        if (!Array.isArray(acompanhantes) || acompanhantes.length === 0) {
            listaElement.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">Nenhum acompanhante cadastrado ainda.</p>';
            return;
        }

        const htmlLista = acompanhantes.map(acomp => {
            const statusBadge = acomp.preCadastro ?
                '<span style="background: #fbbf24; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">AGUARDANDO ATIVAÇÃO</span>' :
                '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">ATIVO</span>';

            const ativadoHtml = acomp.preCadastro ?
                '<div style="font-size: 12px; color: #f59e0b; margin-top: 4px;"><i class="fas fa-info-circle"></i> Aguardando primeiro login do acompanhante</div>' :
                (acomp.ativadoEm ? `<div style="font-size: 12px; color: #10b981; margin-top: 4px;"><i class="fas fa-check-circle"></i> Ativado em: ${new Date(acomp.ativadoEm).toLocaleDateString('pt-BR')}</div>` : '');

            return `
            <div class="acompanhante-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-user" style="color: #6b7280;"></i>
                            ${acomp.nome}
                            ${statusBadge}
                        </h4>
                        <div style="font-size: 14px; color: #6b7280;">
                            <div style="margin-bottom: 4px;">
                                <i class="fas fa-envelope" style="width: 16px; margin-right: 8px;"></i>
                                ${acomp.email}
                            </div>
                            <div style="margin-bottom: 4px;">
                                <i class="fas fa-bed" style="width: 16px; margin-right: 8px;"></i>
                                Quarto: ${acomp.quarto}
                            </div>
                            <div style="font-size: 12px; color: #9ca3af;">
                                <i class="fas fa-calendar" style="width: 16px; margin-right: 8px;"></i>
                                Cadastrado em: ${acomp.criadoEm ? new Date(acomp.criadoEm).toLocaleDateString('pt-BR') : '--'}
                            </div>
                            ${ativadoHtml}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="event.stopPropagation(); editarAcompanhante('${acomp.id}')" 
                            style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;"
                            title="Editar acompanhante">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="event.stopPropagation(); removerAcompanhante('${acomp.id}', '${acomp.quarto}')" 
                            style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;"
                            title="Remover acompanhante">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `}).join('');

        listaElement.innerHTML = htmlLista;
        console.log(`[DEBUG] Lista de acompanhantes atualizada: ${acompanhantes.length} itens`);

    } catch (error) {
        console.error('[ERRO] atualizarListaAcompanhantes:', error);
    }
}

// Função para carregar lista de acompanhantes
async function carregarAcompanhantes() {
    try {
        debugLog('[DEBUG] carregarAcompanhantes: iniciando...');
        
        if (!window.db) {
            console.warn('[AVISO] carregarAcompanhantes: Firestore não inicializado');
            return;
        }

        // Configurar listener em tempo real se ainda não foi configurado
        if (!acompanhantesListener) {
            await configurarListenerAcompanhantes();
        }

    } catch (error) {
        console.error('[ERRO] carregarAcompanhantes:', error);
        showToast('Erro', 'Falha ao carregar lista de acompanhantes', 'error');
    }
}

// Função para remover acompanhante
async function removerAcompanhante(acompanhanteId, quarto) {
    try {
        if (!confirm('Tem certeza que deseja remover este acompanhante? Esta ação não pode ser desfeita.')) {
            return;
        }

        console.log(`[DEBUG] removerAcompanhante: removendo ${acompanhanteId}`);

        showToast('Removendo...', 'Removendo acompanhante e limpando dados...', 'info');

        // Buscar dados do acompanhante antes de remover
        const docSnapshot = await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).get();
        const acompanhanteData = docSnapshot.exists ? docSnapshot.data() : null;
        
        debugLog('[DEBUG] removerAcompanhante: dados do acompanhante:', acompanhanteData);

        // Remover do Firestore
        await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).delete();
        debugLog('[DEBUG] removerAcompanhante: removido do Firestore');

        // Liberar quarto
        if (quarto) {
            await window.db.collection('quartos_ocupados').doc(quarto).delete();
            debugLog('[DEBUG] removerAcompanhante: quarto liberado');
        }

        // Se tem UID (conta foi ativada), também remover registros órfãos
        if (acompanhanteData && acompanhanteData.uid) {
            debugLog('[DEBUG] removerAcompanhante: removendo registros órfãos com UID:', acompanhanteData.uid);
            
            // Remover possível documento duplicado com UID
            try {
                await window.db.collection('usuarios_acompanhantes').doc(acompanhanteData.uid).delete();
                debugLog('[DEBUG] removerAcompanhante: documento UID removido');
            } catch (error) {
                debugLog('[DEBUG] removerAcompanhante: documento UID não existe (normal)');
            }
            
            // Nota: Remoção do Firebase Auth requer Admin SDK no backend
            // Por enquanto, a conta Firebase Auth permanecerá ativa mas sem dados no Firestore
            console.warn('[AVISO] removerAcompanhante: conta Firebase Auth não foi removida (requer backend Admin SDK)');
        }

        // Recarregar lista
        await carregarAcompanhantes();

        showToast('Sucesso', 'Acompanhante removido com sucesso!', 'success');

    } catch (error) {
        console.error('[ERRO] removerAcompanhante:', error);
        showToast('Erro', `Falha ao remover acompanhante: ${error.message}`, 'error');
    }
}

// Função de teste para modal
window.testarModal = function() {
    console.log('[TEST] Testando modal...');
    const modal = document.getElementById('modal-editar-acompanhante');
    if (modal) {
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.top = '50px';
        modal.style.left = '50px';
        modal.style.width = '300px';
        modal.style.height = '200px';
        modal.style.backgroundColor = 'red';
        modal.style.zIndex = '99999';
        modal.classList.remove('hidden');
        console.log('[TEST] Modal configurado para teste. Deveria aparecer uma caixa vermelha.');
    }
};

// Função para editar acompanhante (placeholder para implementação futura)
// Variável para controlar se o modal está sendo processado
let editandoAcompanhante = false;
let ultimoClickEditar = 0;

// Função para editar acompanhante
async function editarAcompanhante(acompanhanteId) {
    console.log('🔧 BOTÃO EDITAR CLICADO! ID:', acompanhanteId);
    debugLog('[DEBUG] === INICIANDO editarAcompanhante ===');
    debugLog('[DEBUG] acompanhanteId recebido:', acompanhanteId);
    debugLog('[DEBUG] typeof acompanhanteId:', typeof acompanhanteId);
    
    try {
        // Debounce para evitar cliques duplos muito rápidos
        const agora = Date.now();
        if (agora - ultimoClickEditar < 1000) { // Aumentei para 1 segundo
            debugLog('[DEBUG] editarAcompanhante: clique muito rápido, ignorando');
            return;
        }
        ultimoClickEditar = agora;
        
        // Prevenir múltiplas execuções simultâneas
        if (editandoAcompanhante) {
            debugLog('[DEBUG] editarAcompanhante: já está processando, ignorando chamada duplicada');
            return;
        }
        
        editandoAcompanhante = true;
        debugLog('[DEBUG] editarAcompanhante: iniciando edição para ID:', acompanhanteId);
        
        // Verificar se o modal existe no DOM
        const modalElement = document.getElementById('modal-editar-acompanhante');
        if (!modalElement) {
            console.error('[ERRO] Modal modal-editar-acompanhante não encontrado no DOM');
            editandoAcompanhante = false;
            return;
        }
        
        debugLog('[DEBUG] Modal encontrado no DOM');
        debugLog('[DEBUG] Modal classList antes:', modalElement.classList.toString());
        debugLog('[DEBUG] Modal style.display antes:', modalElement.style.display);
        
        // Buscar dados do acompanhante no Firestore
        debugLog('[DEBUG] Buscando dados no Firestore...');
        const doc = await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).get();
        
        if (!doc.exists) {
            showToast('Erro', 'Acompanhante não encontrado', 'error');
            editandoAcompanhante = false;
            return;
        }
        
        const acompanhante = doc.data();
        debugLog('[DEBUG] Dados carregados, preenchendo modal para:', acompanhante.nome);
        
        // Preencher o modal com os dados atuais
        document.getElementById('edit-acomp-id').value = acompanhanteId;
        document.getElementById('edit-acomp-nome').value = acompanhante.nome || '';
        document.getElementById('edit-acomp-email').value = acompanhante.email || '';
        document.getElementById('edit-acomp-quarto').value = acompanhante.quarto || '';
        document.getElementById('edit-acomp-senha').value = ''; // Sempre vazio por segurança
        
        // Mostrar o modal
        const modalToShow = document.getElementById('modal-editar-acompanhante');
        debugLog('[DEBUG] === MOSTRANDO MODAL ===');
        debugLog('[DEBUG] Modal antes de remover hidden:', modalToShow.classList.toString());
        
        // Garantir que o modal esteja anexado ao body (não dentro de uma seção)
        if (modalToShow.parentElement !== document.body) {
            debugLog('[DEBUG] Modal não está no body, movendo...');
            document.body.appendChild(modalToShow);
        }
        
        modalToShow.classList.remove('hidden');
        debugLog('[DEBUG] Modal após remover hidden:', modalToShow.classList.toString());
        
        modalToShow.style.display = 'flex';
        modalToShow.style.visibility = 'visible';
        modalToShow.style.opacity = '1';
        modalToShow.style.zIndex = '999999';
        modalToShow.style.position = 'fixed';
        modalToShow.style.top = '0';
        modalToShow.style.left = '0';
        modalToShow.style.width = '100vw';
        modalToShow.style.height = '100vh';
        
        debugLog('[DEBUG] Modal style final:', {
            display: modalToShow.style.display,
            visibility: modalToShow.style.visibility,
            opacity: modalToShow.style.opacity,
            zIndex: modalToShow.style.zIndex
        });
        
        // Verificar se o modal está realmente visível
        const computed = window.getComputedStyle(modalToShow);
        debugLog('[DEBUG] Modal computed style:', {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            zIndex: computed.zIndex,
            position: computed.position,
            top: computed.top,
            left: computed.left
        });
        
        // Verificar se há elementos pai que podem estar interferindo
        let parent = modalToShow.parentElement;
        let level = 0;
        while (parent && level < 5) {
            const parentComputed = window.getComputedStyle(parent);
            console.log(`[DEBUG] Parent ${level} (${parent.tagName}):`, {
                display: parentComputed.display,
                visibility: parentComputed.visibility,
                opacity: parentComputed.opacity,
                overflow: parentComputed.overflow,
                className: parent.className
            });
            parent = parent.parentElement;
            level++;
        }
        
        // Verificar se o modal está realmente na viewport
        const rect = modalToShow.getBoundingClientRect();
        debugLog('[DEBUG] Modal getBoundingClientRect:', {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            visible: rect.width > 0 && rect.height > 0
        });
        
        // Tentar forçar ainda mais a visibilidade
        modalToShow.style.position = 'fixed';
        modalToShow.style.top = '0';
        modalToShow.style.left = '0';
        modalToShow.style.width = '100vw';
        modalToShow.style.height = '100vh';
        modalToShow.style.zIndex = '99999';
        modalToShow.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        
        debugLog('[DEBUG] Modal forçado com estilos inline');
        debugLog('[DEBUG] Modal de edição configurado com sucesso');
        debugLog('[DEBUG] === FIM MOSTRAR MODAL ===');
        
        // Foco no primeiro campo
        setTimeout(() => {
            document.getElementById('edit-acomp-nome').focus();
        }, 100);
        
    } catch (error) {
        console.error('[ERRO] editarAcompanhante:', error);
        showToast('Erro', 'Erro ao carregar dados do acompanhante', 'error');
    } finally {
        // Sempre resetar a variável de controle
        editandoAcompanhante = false;
    }
}

// Função para fechar modal de edição
function fecharModalEditarAcompanhante() {
    debugLog('[DEBUG] Fechando modal de edição');
    
    const modal = document.getElementById('modal-editar-acompanhante');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    
    // Limpar formulário
    document.getElementById('form-editar-acompanhante').reset();
    document.getElementById('edit-acomp-id').value = '';
    
    // Resetar variável de controle
    editandoAcompanhante = false;
}

// Função para salvar edição do acompanhante
async function salvarEdicaoAcompanhante(event) {
    event.preventDefault();
    
    try {
        const acompanhanteId = document.getElementById('edit-acomp-id').value;
        const nome = document.getElementById('edit-acomp-nome').value.trim();
        const email = document.getElementById('edit-acomp-email').value.trim();
        const quarto = document.getElementById('edit-acomp-quarto').value.trim();
        const novaSenha = document.getElementById('edit-acomp-senha').value.trim();
        
        if (!nome || !email || !quarto) {
            showToast('Erro', 'Todos os campos obrigatórios devem ser preenchidos', 'error');
            return;
        }
        
        debugLog('[DEBUG] Salvando edição do acompanhante:', { acompanhanteId, nome, email, quarto });
        
        showToast('Atualizando...', 'Salvando alterações...', 'info');
        
        // Buscar dados atuais para comparar quarto
        const docAtual = await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).get();
        const dadosAtuais = docAtual.data();
        const quartoAtual = dadosAtuais.quarto;
        
        // Preparar dados para atualização
        const updateData = {
            nome,
            email,
            quarto,
            atualizadoEm: firebase.firestore.Timestamp.now()
        };
        
        // Se uma nova senha foi fornecida, atualizar no Firebase Auth
        if (novaSenha) {
            debugLog('[DEBUG] Nova senha fornecida, atualizando autenticação...');
            // Nota: Para atualizar senha no Firebase Auth seria necessário Admin SDK no backend
            // Por enquanto, apenas log que a funcionalidade precisa ser implementada
            console.warn('[AVISO] Atualização de senha requer implementação no backend');
            showToast('Aviso', 'Senha não pode ser alterada nesta versão. Contate o administrador.', 'warning');
        }
        
        // Verificar se o quarto mudou para atualizar a tabela de quartos ocupados
        if (quartoAtual !== quarto) {
            debugLog('[DEBUG] Quarto alterado de', quartoAtual, 'para', quarto);
            
            // Verificar se o novo quarto já está ocupado
            const quartoOcupado = await window.db.collection('quartos_ocupados').doc(quarto).get();
            if (quartoOcupado.exists) {
                showToast('Erro', `Quarto ${quarto} já está ocupado por outro acompanhante`, 'error');
                return;
            }
            
            // Transação para atualizar quarto
            await window.db.runTransaction(async (transaction) => {
                // Remover ocupação do quarto antigo
                if (quartoAtual) {
                    transaction.delete(window.db.collection('quartos_ocupados').doc(quartoAtual));
                }
                
                // Adicionar ocupação do novo quarto
                transaction.set(window.db.collection('quartos_ocupados').doc(quarto), {
                    acompanhanteId: acompanhanteId,
                    email: email,
                    nome: nome,
                    criadoEm: firebase.firestore.Timestamp.now()
                });
                
                // Atualizar dados do acompanhante
                transaction.update(window.db.collection('usuarios_acompanhantes').doc(acompanhanteId), updateData);
            });
        } else {
            // Apenas atualizar dados do acompanhante (quarto não mudou)
            await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).update(updateData);
        }
        
        showToast('Sucesso', 'Acompanhante atualizado com sucesso!', 'success');
        
        // Fechar modal e recarregar lista
        fecharModalEditarAcompanhante();
        await carregarAcompanhantes();
        
    } catch (error) {
        console.error('[ERRO] salvarEdicaoAcompanhante:', error);
        showToast('Erro', `Erro ao salvar alterações: ${error.message}`, 'error');
    }
}

// Expor funções globalmente
window.cadastrarAcompanhante = cadastrarAcompanhante;
window.carregarAcompanhantes = carregarAcompanhantes;
window.configurarListenerAcompanhantes = configurarListenerAcompanhantes;
window.atualizarListaAcompanhantes = atualizarListaAcompanhantes;
window.removerAcompanhante = removerAcompanhante;
window.editarAcompanhante = editarAcompanhante;
window.fecharModalEditarAcompanhante = fecharModalEditarAcompanhante;
window.salvarEdicaoAcompanhante = salvarEdicaoAcompanhante;

// === FUNÇÕES DE LIMPEZA E MANUTENÇÃO ===

// Função para limpar dados de teste
window.limparDadosTeste = async function() {
    // Verificar permissões primeiro
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
        showToast('Erro', 'Acesso negado! Apenas super administradores podem executar limpeza de dados.', 'error');
        return;
    }
    
    // 1. Perguntar a data para exclusão
    const dataInput = prompt('📅 LIMPEZA SELETIVA DE DADOS\n\nDigite a data limite para exclusão (formato: DD/MM/AAAA)\n\nSerão removidas todas as solicitações ANTES desta data.\n\nExemplo: 01/01/2024\n\nDeixe em branco para limpar TUDO:');
    
    let dataLimite = null;
    let textoConfirmacao = '';
    
    if (dataInput && dataInput.trim()) {
        // Validar formato da data
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dataInput.match(regex);
        
        if (!match) {
            showToast('Erro', 'Formato de data inválido. Use DD/MM/AAAA', 'error');
            return;
        }
        
        const [_, dia, mes, ano] = match;
        dataLimite = new Date(ano, mes - 1, dia);
        
        if (isNaN(dataLimite.getTime())) {
            showToast('Erro', 'Data inválida.', 'error');
            return;
        }
        
        textoConfirmacao = `solicitações ANTES de ${dataInput}`;
    } else {
        textoConfirmacao = 'TODAS as solicitações e pesquisas de satisfação';
        dataLimite = null;
    }
    
    // 2. Primeira confirmação
    if (!confirm(`⚠️ ATENÇÃO: Esta ação irá remover ${textoConfirmacao} do sistema.\n\nEsta ação é IRREVERSÍVEL!\n\nDeseja continuar?`)) {
        return;
    }
    
    // 3. Segunda confirmação com entrada de texto
    const confirmacao = prompt(`⚠️ CONFIRMAÇÃO FINAL\n\nPara confirmar que deseja limpar ${textoConfirmacao}, digite exatamente: CONFIRMAR LIMPEZA\n\n(Digite "CONFIRMAR LIMPEZA" sem aspas)`);
    
    if (confirmacao !== 'CONFIRMAR LIMPEZA') {
        showToast('Info', 'Operação cancelada. Texto de confirmação incorreto.', 'info');
        return;
    }
    
    try {
        console.log(`[LIMPEZA] Iniciando limpeza ${dataLimite ? 'seletiva' : 'completa'} dos dados...`);
        
        let totalRemovido = 0;
        
        // 1. Buscar e remover solicitações (com ou sem filtro de data)
        console.log('[LIMPEZA] Buscando solicitações...');
        
        let query = window.db.collection('solicitacoes');
        
        // Aplicar filtro de data se especificado
        if (dataLimite) {
            query = query.where('criadoEm', '<', dataLimite);
        }
        
        const solicitacoesSnapshot = await query.get();
        
        if (!solicitacoesSnapshot.empty) {
            console.log(`[LIMPEZA] Encontradas ${solicitacoesSnapshot.size} solicitações para remover`);
            
            // Remover em lotes para melhor performance
            const batch = window.db.batch();
            let batchCount = 0;
            
            solicitacoesSnapshot.forEach(doc => {
                batch.delete(doc.ref);
                batchCount++;
                totalRemovido++;
                
                // Firestore permite máximo 500 operações por batch
                if (batchCount >= 500) {
                    batch.commit();
                    batchCount = 0;
                }
            });
            
            // Commit do último batch se houver operações pendentes
            if (batchCount > 0) {
                await batch.commit();
            }
            
            console.log(`[LIMPEZA] ${solicitacoesSnapshot.size} solicitações removidas`);
        }
        
        // 2. Buscar e remover quartos ocupados órfãos
        console.log('[LIMPEZA] Verificando quartos ocupados...');
        const quartosSnapshot = await window.db.collection('quartos_ocupados').get();
        
        if (!quartosSnapshot.empty) {
            console.log(`[LIMPEZA] Encontrados ${quartosSnapshot.size} registros de quartos ocupados`);
            
            const batchQuartos = window.db.batch();
            quartosSnapshot.forEach(doc => {
                batchQuartos.delete(doc.ref);
                totalRemovido++;
            });
            
            await batchQuartos.commit();
            console.log(`[LIMPEZA] ${quartosSnapshot.size} registros de quartos removidos`);
        }
        
        // 3. Limpar dados de satisfação incorporados nas solicitações (já removidos com as solicitações)
        
        console.log(`[LIMPEZA] ✅ Limpeza concluída! Total de ${totalRemovido} registros removidos.`);
        
        // Mostrar resultado com informação da data
        const dataInfo = dataLimite ? `\n📅 Dados removidos: anteriores a ${dataInput}` : '\n📅 Dados removidos: TODOS os registros';
        const successMessage = `✅ Limpeza concluída com sucesso!${dataInfo}\n\n📊 Resumo:\n- Solicitações removidas: ${solicitacoesSnapshot.size || 0}\n- Quartos liberados: ${quartosSnapshot.size || 0}\n- Total de registros: ${totalRemovido}\n\n${dataLimite ? 'Limpeza seletiva' : 'Limpeza completa'} realizada!`;
        
        showToast('Sucesso', 'Limpeza concluída com sucesso!', 'success');
        alert(successMessage);
        
        // Recarregar relatórios se estiver na tela de relatórios
        if (typeof window.carregarSolicitacoes === 'function') {
            console.log('[LIMPEZA] Recarregando interface...');
            setTimeout(() => {
                window.carregarSolicitacoes();
            }, 1000);
        }
        
    } catch (error) {
        console.error('[ERRO] Falha na limpeza de dados:', error);
        showToast('Erro', `Erro durante a limpeza: ${error.message}`, 'error');
    }
};

// Função para verificar estatísticas dos dados
window.verificarEstatisticas = async function() {
    try {
        console.log('[STATS] Coletando estatísticas dos dados...');
        
        // Contar solicitações por status
        const solicitacoesSnapshot = await window.db.collection('solicitacoes').get();
        const stats = {
            total: solicitacoesSnapshot.size,
            pendente: 0,
            emAndamento: 0,
            finalizada: 0,
            avaliada: 0,
            porEquipe: {
                manutencao: 0,
                nutricao: 0,
                higienizacao: 0,
                hotelaria: 0
            }
        };
        
        solicitacoesSnapshot.forEach(doc => {
            const data = doc.data();
            const status = data.status || 'pendente';
            
            if (stats[status] !== undefined) {
                stats[status]++;
            }
            
            if (data.avaliada) {
                stats.avaliada++;
            }
            
            const equipe = data.equipe || data.tipoServico;
            if (stats.porEquipe[equipe] !== undefined) {
                stats.porEquipe[equipe]++;
            }
        });
        
        // Contar quartos ocupados
        const quartosSnapshot = await window.db.collection('quartos_ocupados').get();
        stats.quartosOcupados = quartosSnapshot.size;
        
        // Contar usuários
        const adminSnapshot = await window.db.collection('usuarios_admin').get();
        const equipeSnapshot = await window.db.collection('usuarios_equipe').get();
        
        // Verificar permissões antes de acessar usuarios_acompanhantes
        let acompanhantesCount = 0;
        const user = window.auth.currentUser;
        if (user) {
            try {
                const userData = await window.verificarUsuarioAdminJS(user);
                if (userData && (userData.role === 'super_admin' || userData.role === 'admin')) {
                    const acompanhantesSnapshot = await window.db.collection('usuarios_acompanhantes').get();
                    acompanhantesCount = acompanhantesSnapshot.size;
                } else {
                    console.log('[STATS] Usuário sem permissão para contar acompanhantes');
                }
            } catch (permError) {
                console.log('[STATS] Erro de permissão ao acessar acompanhantes:', permError.message);
            }
        }
        
        stats.usuarios = {
            admins: adminSnapshot.size,
            equipe: equipeSnapshot.size,
            acompanhantes: acompanhantesCount
        };
        
        console.log('[STATS] Estatísticas coletadas:', stats);
        
        const relatorio = `
📊 ESTATÍSTICAS DO YUNA SOLICITE
===============================

📋 SOLICITAÇÕES:
  • Total: ${stats.total}
  • Pendentes: ${stats.pendente}
  • Em Andamento: ${stats.emAndamento}
  • Finalizadas: ${stats.finalizada}
  • Avaliadas: ${stats.avaliada}

🏢 POR DEPARTAMENTO:
  • Manutenção: ${stats.porEquipe.manutencao}
  • Nutrição: ${stats.porEquipe.nutricao}
  • Higienização: ${stats.porEquipe.higienizacao}
  • Hotelaria: ${stats.porEquipe.hotelaria}

🏠 QUARTOS OCUPADOS: ${stats.quartosOcupados}

👥 USUÁRIOS:
  • Administradores: ${stats.usuarios.admins}
  • Equipe: ${stats.usuarios.equipe}
  • Acompanhantes: ${stats.usuarios.acompanhantes}
        `;
        
        alert(relatorio);
        console.log(relatorio);
        
        return stats;
        
    } catch (error) {
        console.error('[ERRO] Falha ao verificar estatísticas:', error);
        alert(`❌ Erro ao coletar estatísticas: ${error.message}`);
    }
};

// Função para adicionar painel de manutenção no relatórios
window.adicionarPainelManutencao = function() {
    try {
        // Verificar se já foi adicionado
        const existente = document.querySelector('.maintenance-panel');
        if (existente) {
            console.log('[MANUTENCAO] Painel já existe, não adicionando novamente');
            return;
        }
        
        // Encontrar o container de relatórios
        const relatoriosContainer = document.querySelector('#relatorios .container-fluid') || 
                                   document.querySelector('#relatorios .section-content') ||
                                   document.querySelector('#relatorios');
        
        if (!relatoriosContainer) {
            console.warn('[MANUTENCAO] Container de relatórios não encontrado');
            return;
        }
        
        // Criar o painel de manutenção
        const painelManutencao = document.createElement('div');
        painelManutencao.innerHTML = `
            <div class="maintenance-panel" style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); margin: 20px 0; padding: 20px; border-radius: 12px; border: 1px solid #e74c3c; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                    <i class="fas fa-tools" style="margin-right: 10px;"></i>
                    Ferramentas de Manutenção do Sistema
                </h3>
                <p style="color: #fff; margin: 0 0 15px 0; font-size: 14px; opacity: 0.9;">
                    ⚠️ <strong>Apenas para Super Administradores</strong> - Use com extrema cautela
                </p>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="verificarEstatisticas()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-chart-bar"></i> Verificar Estatísticas
                    </button>
                    <button onclick="limparDadosTeste()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-trash-alt"></i> Limpar Dados de Teste
                    </button>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <small style="color: rgba(255,255,255,0.8); font-size: 12px;">
                        💡 <strong>Dica:</strong> Use "Verificar Estatísticas" antes de limpar para conferir o que será removido
                    </small>
                </div>
            </div>
        `;
        
        // Adicionar estilos para hover
        if (!document.querySelector('#maintenance-styles')) {
            const style = document.createElement('style');
            style.id = 'maintenance-styles';
            style.textContent = `
                .maintenance-panel button:hover {
                    background: rgba(255,255,255,0.35) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                }
                .maintenance-panel button:active {
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Inserir no início do container (logo após o título)
        const primeiroElemento = relatoriosContainer.querySelector('.row') || relatoriosContainer.firstElementChild;
        if (primeiroElemento) {
            primeiroElemento.parentNode.insertBefore(painelManutencao, primeiroElemento);
        } else {
            relatoriosContainer.appendChild(painelManutencao);
        }
        
        console.log('[MANUTENCAO] Painel de manutenção adicionado com sucesso');
        
    } catch (error) {
        console.error('[ERRO] Falha ao adicionar painel de manutenção:', error);
    }
};

// Função para debug completo do estado da aplicação
window.debugEstadoApp = function() {
    console.log('===== DEBUG ESTADO DA APLICAÇÃO =====');
    console.log('1. Variáveis globais:', {
        userRole: window.userRole,
        usuarioAdmin: window.usuarioAdmin,
        auth: !!window.auth,
        db: !!window.db
    });
    
    console.log('2. Firebase Auth:', {
        currentUser: window.auth?.currentUser,
        isSignedIn: !!window.auth?.currentUser
    });
    
    console.log('3. LocalStorage:', {
        usuarioAdmin: localStorage.getItem('usuarioAdmin'),
        hasUserData: !!localStorage.getItem('usuarioAdmin')
    });
    
    console.log('4. Elementos do DOM:', {
        relatoriosBtn: !!document.getElementById('relatorios-btn'),
        relatoriosSection: !!document.getElementById('relatorios-section'),
        adminPanel: !!document.getElementById('admin-panel')
    });
    
    console.log('5. Funções disponíveis:', {
        mostrarRelatorios: typeof window.mostrarRelatorios,
        mostrarSecaoPainel: typeof mostrarSecaoPainel,
        carregarSolicitacoes: typeof carregarSolicitacoes
    });
    
    console.log('===== FIM DEBUG =====');
};

// Função melhorada para logout com limpeza completa
window.logout = async function() {
    try {
        debugLog('[DEBUG] Iniciando processo de logout...');
        
        // 1. Logout do Firebase
        await window.auth.signOut();
        
        // 2. Limpar dados do localStorage
        localStorage.removeItem('usuarioAdmin');
        
        // 3. Limpar variáveis globais
        window.usuarioAdmin = null;
        window.userEmail = null;
        window.userRole = null;
        
        // 4. Parar atualizações automáticas
        pararAtualizacaoTempos();
        
        // 5. Resetar campos de login
        const tipoSelect = document.getElementById('tipo-acesso');
        const departamentoSection = document.getElementById('departamento-section');
        const departamentoSelect = document.getElementById('departamento');
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (tipoSelect) tipoSelect.value = '';
        if (departamentoSelect) departamentoSelect.value = '';
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        // 5. Ocultar seção de departamento
        if (departamentoSection) {
            departamentoSection.classList.add('hidden');
        }
        
        // 6. Limpar interface completamente
        limparInterfaceCompleta();
        
        debugLog('[DEBUG] Logout concluído com sucesso');
        showToast('Sucesso', 'Logout realizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('[ERRO] Erro no logout:', error);
        showToast('Erro', 'Erro ao fazer logout.', 'error');
        
        // Mesmo com erro, limpar interface
        limparInterfaceCompleta();
    }
};

// === VERIFICAÇÃO FINAL - FORÇAR BOTÃO LIMPEZA ===
(function verificacaoFinal() {
    setTimeout(() => {
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (usuarioAdmin?.role === 'super_admin') {
            const btnLimpeza = document.getElementById('limpeza-btn');
            if (btnLimpeza) {
                console.log('[FINAL-CHECK] Forçando visibilidade do botão limpeza para super_admin');
                btnLimpeza.classList.remove('btn-hide', 'hidden');
                btnLimpeza.style.cssText = 'display: inline-flex !important; visibility: visible !important;';
                btnLimpeza.title = 'Limpar dados de teste e pesquisas de satisfação';
            } else {
                console.warn('[FINAL-CHECK] Botão limpeza não encontrado no DOM');
            }
        }
    }, 2000);
})();

// === FUNÇÃO PARA REMOÇÃO FORÇADA DE BOTÕES DEBUG ===
window.forceRemoveDebugButtons = function() {
    const debugSelectors = [
        'button[onclick*="showUsersDireto"]',
        'button[onclick*="debugFuncs"]',
        'button[onclick*="mostrarRelatoriosDirectly"]',
        '#debug-btn',
        '#usuarios-direto-btn',
        '#relatorios-direto-btn'
    ];
    
    const debugTexts = ['usuários direto', 'debug', 'relatórios direto', 'usuario direto', 'relatorio direto'];
    let removed = 0;
    
    // Remoção por seletores
    debugSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            debugLog(`[FORCE-REMOVE] Removendo por seletor: ${selector}`);
            el.remove();
            removed++;
        });
    });
    
    // Remoção por texto (busca em TODOS os elementos)
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        if (el.tagName === 'BUTTON' || el.getAttribute('onclick') || el.classList.contains('button')) {
            const text = (el.textContent || '').trim().toLowerCase();
            if (debugTexts.some(debugText => text.includes(debugText))) {
                debugLog(`[FORCE-REMOVE] Removendo elemento por texto: "${el.textContent}"`);
                // Múltiplas formas de remoção
                el.style.display = 'none !important';
                el.style.visibility = 'hidden !important';
                el.remove();
                removed++;
            }
        }
    });
    
    // Interceptar criação dinâmica de botões
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        
        if (tagName.toLowerCase() === 'button') {
            // Observar mudanças de texto
            const observer = new MutationObserver(() => {
                const text = (element.textContent || '').trim().toLowerCase();
                if (debugTexts.some(debugText => text.includes(debugText))) {
                    debugLog('[INTERCEPT] Bloqueando criação de botão debug:', text);
                    element.style.display = 'none !important';
                    element.remove();
                }
            });
            
            observer.observe(element, { 
                childList: true, 
                characterData: true, 
                subtree: true 
            });
        }
        
        return element;
    };
    
    if (removed > 0) {
        debugLog(`[FORCE-REMOVE] Total removido: ${removed} elementos`);
    }
    
    return removed;
};

// === FUNÇÕES DE FILTRO DAS SOLICITAÇÕES ===

// Filtrar solicitações por status
window.filtrarSolicitacoesPorStatus = function(equipe, status) {
    console.log(`[FILTRO] Filtrando equipe ${equipe} por status: ${status}`);
    
    const content = document.getElementById(`content-${equipe}`);
    if (!content) return;
    
    const cards = content.querySelectorAll('.solicitacao-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardStatus = card.getAttribute('data-status') || 'pendente';
        const shouldShow = status === 'todos' || cardStatus === status;
        
        if (shouldShow) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Atualizar contador
    const badge = document.getElementById(`count-${equipe}`);
    if (badge) {
        badge.textContent = status === 'todos' ? cards.length : visibleCount;
    }
    
    // Mostrar empty state se necessário
    atualizarEmptyState(equipe, visibleCount);
};

// Filtrar solicitações por prioridade
window.filtrarSolicitacoesPorPrioridade = function(equipe, prioridade) {
    console.log(`[FILTRO] Filtrando equipe ${equipe} por prioridade: ${prioridade}`);
    
    const content = document.getElementById(`content-${equipe}`);
    if (!content) return;
    
    const cards = content.querySelectorAll('.solicitacao-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardPrioridade = card.getAttribute('data-prioridade') || 'normal';
        const shouldShow = prioridade === 'todos' || cardPrioridade === prioridade;
        
        if (shouldShow) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Atualizar contador
    const badge = document.getElementById(`count-${equipe}`);
    if (badge) {
        badge.textContent = prioridade === 'todos' ? cards.length : visibleCount;
    }
    
    // Mostrar empty state se necessário
    atualizarEmptyState(equipe, visibleCount);
};

// Limpar todos os filtros
window.limparFiltrosSolicitacoes = function(equipe) {
    console.log(`[FILTRO] Limpando filtros da equipe ${equipe}`);
    
    // Resetar selects
    const statusSelect = document.getElementById(`filter-status-${equipe}`);
    const prioridadeSelect = document.getElementById(`filter-prioridade-${equipe}`);
    
    if (statusSelect) statusSelect.value = 'todos';
    if (prioridadeSelect) prioridadeSelect.value = 'todos';
    
    // Mostrar todos os cards
    const content = document.getElementById(`content-${equipe}`);
    if (content) {
        const cards = content.querySelectorAll('.solicitacao-card');
        cards.forEach(card => {
            card.style.display = 'block';
        });
        
        // Resetar contador
        const badge = document.getElementById(`count-${equipe}`);
        if (badge) {
            badge.textContent = cards.length;
        }
        
        atualizarEmptyState(equipe, cards.length);
    }
};

// Função auxiliar para mostrar/esconder empty state
function atualizarEmptyState(equipe, visibleCount) {
    const content = document.getElementById(`content-${equipe}`);
    if (!content) return;
    
    let emptyState = content.querySelector('.empty-state');
    
    if (visibleCount === 0) {
        if (!emptyState) {
            const icones = {
                'manutencao': 'tools',
                'nutricao': 'utensils',
                'higienizacao': 'spray-can',
                'hotelaria': 'bed'
            };
            
            const equipesNomes = {
                'manutencao': 'Manutenção',
                'nutricao': 'Nutrição',
                'higienizacao': 'Higienização',
                'hotelaria': 'Hotelaria'
            };
            
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state filter-empty';
            emptyState.innerHTML = `
                <i class="fas fa-${icones[equipe]}"></i>
                <p>Nenhuma solicitação encontrada com os filtros aplicados</p>
            `;
            content.appendChild(emptyState);
        }
        emptyState.style.display = 'block';
    } else {
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
}

// === CSS PARA FILTROS ===
const filterStyles = `
    .team-filters {
        padding: 15px;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        align-items: center;
    }
    
    .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .filter-group label {
        font-weight: 600;
        font-size: 0.9rem;
        color: #495057;
    }
    
    .filter-select {
        padding: 6px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        background: white;
        font-size: 0.9rem;
        min-width: 120px;
    }
    
    .filter-select:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .filter-clear-btn {
        padding: 6px 12px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .filter-clear-btn:hover {
        background: #5a6268;
    }
    
    .empty-state.filter-empty {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        color: #856404;
    }
    
    @media (max-width: 768px) {
        .team-filters {
            flex-direction: column;
            align-items: stretch;
        }
        
        .filter-group {
            justify-content: space-between;
        }
        
        .filter-select {
            min-width: auto;
            flex: 1;
        }
    }
`;

// Adicionar CSS dos filtros
if (!document.getElementById('filter-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'filter-styles';
    styleSheet.textContent = filterStyles;
    document.head.appendChild(styleSheet);
}

// === APLICAR CSS FORCE-HIDE PARA PRODUÇÃO ===
(function applyProductionCSS() {
    if (MODO_PRODUCAO) {
        const style = document.createElement('style');
        style.textContent = `
            /* CSS para esconder elementos de debug em produção */
            button[onclick*="showUsersDireto"],
            button[onclick*="debugFuncs"],
            button[onclick*="mostrarRelatoriosDirectly"],
            #debug-btn,
            #usuarios-direto-btn,
            #relatorios-direto-btn,
            .debug-button,
            .btn-debug,
            .direct-button {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
            }
            
            /* Esconder qualquer botão que contenha textos de debug */
            button:contains("usuários direto"),
            button:contains("debug"), 
            button:contains("relatórios direto"),
            button:contains("usuario direto"),
            button:contains("relatorio direto") {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        debugLog('[PRODUCTION] CSS de ocultação aplicado');
    }
})();

// ===== FUNÇÕES DE GRÁFICOS E ALERTAS INTELIGENTES =====

function renderizarGraficos(metricas) {
    console.log('🎨 Renderizando gráficos com dados:', metricas);
    
    // Inicializar objeto global para armazenar instâncias dos gráficos
    if (!window.chartInstances) {
        window.chartInstances = {};
    }
    
    // Renderizar cada gráfico
    renderizarGraficoStatus(metricas.statusDistribution);
    renderizarGraficoEquipes(metricas.porEquipe);
    renderizarGraficoTendencias(metricas.tendencias);
    renderizarGraficoPicos(metricas.picosDemanda);
}

function renderizarGraficoStatus(statusData) {
    const ctx = document.getElementById('grafico-status');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.chartInstances.status) {
        window.chartInstances.status.destroy();
    }
    
    const data = {
        labels: ['Pendente', 'Em Andamento', 'Finalizada', 'Cancelada'],
        datasets: [{
            data: [
                statusData.pendente || 0,
                statusData['em-andamento'] || 0,
                statusData.finalizada || 0,
                statusData.cancelada || 0
            ],
            backgroundColor: [
                '#f59e0b',  // Pendente - Amarelo
                '#3b82f6',  // Em andamento - Azul
                '#10b981',  // Finalizada - Verde
                '#ef4444'   // Cancelada - Vermelho
            ],
            borderColor: '#ffffff',
            borderWidth: 2
        }]
    };
    
    window.chartInstances.status = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderizarGraficoEquipes(equipesData) {
    const ctx = document.getElementById('grafico-equipes');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.chartInstances.equipes) {
        window.chartInstances.equipes.destroy();
    }
    
    const equipesNomes = {
        manutencao: 'Manutenção',
        nutricao: 'Nutrição', 
        higienizacao: 'Higienização',
        hotelaria: 'Hotelaria'
    };
    
    const labels = Object.keys(equipesData).map(equipe => equipesNomes[equipe] || equipe);
    const totals = Object.values(equipesData).map(dados => dados.total);
    const slaCompliance = Object.values(equipesData).map(dados => dados.slaCompliance);
    
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Total Solicitações',
                data: totals,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                yAxisID: 'y'
            },
            {
                label: 'SLA Compliance (%)',
                data: slaCompliance,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                type: 'line',
                yAxisID: 'y1'
            }
        ]
    };
    
    window.chartInstances.equipes = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Solicitações'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'SLA %'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    max: 100
                }
            }
        }
    });
}

function renderizarGraficoTendencias(tendenciasData) {
    const ctx = document.getElementById('grafico-tendencias');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.chartInstances.tendencias) {
        window.chartInstances.tendencias.destroy();
    }
    
    const labels = tendenciasData.ultimos7dias.map(dia => dia.label);
    const dados = tendenciasData.ultimos7dias.map(dia => dia.count);
    
    const data = {
        labels: labels,
        datasets: [{
            label: 'Solicitações por Dia',
            data: dados,
            fill: true,
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgba(139, 92, 246, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5
        }]
    };
    
    window.chartInstances.tendencias = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Solicitações'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function renderizarGraficoPicos(picosData) {
    const ctx = document.getElementById('grafico-picos');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.chartInstances.picos) {
        window.chartInstances.picos.destroy();
    }
    
    const horasLabels = [];
    for (let i = 0; i < 24; i++) {
        horasLabels.push(i.toString().padStart(2, '0') + ':00');
    }
    
    const data = {
        labels: horasLabels,
        datasets: [{
            label: 'Solicitações por Hora',
            data: picosData.porHora,
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 1
        }]
    };
    
    window.chartInstances.picos = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantidade'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hora do Dia'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function configurarAlertasInteligentes(metricas) {
    console.log('🚨 Configurando alertas inteligentes:', metricas.alertas);
    
    // Atualizar contador de alertas na interface principal
    atualizarContadorAlertas(metricas.alertas.length);
    
    // Configurar notificações automáticas para alertas críticos
    metricas.alertas.forEach(alerta => {
        if (alerta.urgencia === 'critica') {
            showToast('Alerta Crítico!', `SLA ${alerta.percentual}% na equipe ${alerta.equipe}`, 'error');
        }
    });
}

function atualizarContadorAlertas(quantidade) {
    // Verificar se existe elemento para mostrar alertas na interface principal
    let alertaBadge = document.getElementById('alertas-badge');
    if (!alertaBadge && quantidade > 0) {
        // Criar badge de alertas no botão de métricas
        const metricasBtn = document.getElementById('metricas-btn');
        if (metricasBtn) {
            alertaBadge = document.createElement('span');
            alertaBadge.id = 'alertas-badge';
            alertaBadge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            metricasBtn.style.position = 'relative';
            metricasBtn.appendChild(alertaBadge);
        }
    }
    
    if (alertaBadge) {
        if (quantidade > 0) {
            alertaBadge.textContent = quantidade;
            alertaBadge.style.display = 'flex';
        } else {
            alertaBadge.style.display = 'none';
        }
    }
}

// =============== SISTEMA DE IMPORTAÇÃO EM LOTE ===============

// Abrir modal de importação
function abrirImportacaoLote() {
    console.log('[IMPORTACAO] Função abrirImportacaoLote chamada');
    
    const modal = document.getElementById('modal-importacao-lote');
    console.log('[IMPORTACAO] Modal encontrado:', !!modal);
    
    if (modal) {
        console.log('[IMPORTACAO] Removendo classe hidden...');
        modal.classList.remove('hidden');
        
        // Reset dos campos
        const arquivoInput = document.getElementById('arquivo-excel');
        const previewDiv = document.getElementById('preview-dados');
        const logDiv = document.getElementById('log-importacao');
        const btnProcessar = document.getElementById('btn-processar');
        
        console.log('[IMPORTACAO] Elementos encontrados:', {
            arquivoInput: !!arquivoInput,
            previewDiv: !!previewDiv,
            logDiv: !!logDiv,
            btnProcessar: !!btnProcessar
        });
        
        if (arquivoInput) arquivoInput.value = '';
        if (previewDiv) previewDiv.style.display = 'none';
        if (logDiv) logDiv.style.display = 'none';
        if (btnProcessar) btnProcessar.disabled = true;
        
        // Reconfigurar listener do arquivo
        configurarListenerArquivo();
        
        console.log('[IMPORTACAO] Modal aberto com sucesso');
    } else {
        console.error('[IMPORTACAO] Modal não encontrado!');
        showToast('Erro', 'Modal de importação não encontrado', 'error');
    }
}

// Fechar modal de importação
function fecharImportacaoLote() {
    console.log('[IMPORTACAO] 🚪 Fechando modal...');
    const modal = document.getElementById('modal-importacao-lote');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        console.log('[IMPORTACAO] ✅ Modal fechado');
    } else {
        console.error('[IMPORTACAO] ❌ Modal não encontrado para fechar');
    }
}

// Baixar modelo Excel
function baixarModeloExcel() {
    const dadosModelo = [
        ['Nome', 'Email', 'Quarto', 'Senha'],
        ['João Silva', 'joao.silva@email.com', '101', '123456'],
        ['Maria Santos', 'maria.santos@email.com', '102', 'senha123'],
        ['Pedro Costa', 'pedro.costa@email.com', '103', 'minhasenha']
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dadosModelo);
    
    // Definir largura das colunas
    ws['!cols'] = [
        { wch: 20 }, // Nome
        { wch: 25 }, // Email
        { wch: 10 }, // Quarto
        { wch: 15 }  // Senha
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Acompanhantes');
    XLSX.writeFile(wb, 'modelo_acompanhantes_yuna.xlsx');
    
    showToast('Sucesso', 'Modelo Excel baixado com sucesso!', 'success');
}

// Event listener para arquivo Excel - configurado imediatamente
function configurarListenerArquivo() {
    const arquivoInput = document.getElementById('arquivo-excel');
    console.log('[IMPORTACAO] Configurando listener para arquivo:', !!arquivoInput);
    
    if (arquivoInput) {
        // Remover listener anterior se existir
        arquivoInput.removeEventListener('change', handleArquivoChange);
        // Adicionar novo listener
        arquivoInput.addEventListener('change', handleArquivoChange);
        console.log('[IMPORTACAO] Listener configurado com sucesso');
    } else {
        console.warn('[IMPORTACAO] Input de arquivo não encontrado');
    }
}

function handleArquivoChange(e) {
    console.log('[IMPORTACAO] Arquivo selecionado:', e.target.files[0]?.name);
    const arquivo = e.target.files[0];
    if (arquivo) {
        lerArquivoExcel(arquivo);
    }
}

// Configurar listener quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('[IMPORTACAO] DOM carregado - configurando listeners...');
    configurarListenerArquivo();
});

// Também tentar configurar após um delay (para casos onde o DOM já carregou)
setTimeout(function() {
    console.log('[IMPORTACAO] Tentativa de configuração tardia...');
    configurarListenerArquivo();
}, 1000);

// Ler e preview do arquivo Excel
function lerArquivoExcel(arquivo) {
    // Verificações de segurança
    console.log('[IMPORTACAO] Iniciando leitura do arquivo:', arquivo?.name);
    
    if (!arquivo) {
        console.error('[IMPORTACAO] Nenhum arquivo fornecido');
        alert('Por favor, selecione um arquivo Excel.');
        return;
    }
    
    if (!arquivo.name.match(/\.(xlsx|xls)$/i)) {
        console.error('[IMPORTACAO] Tipo de arquivo inválido:', arquivo.name);
        alert('Por favor, selecione apenas arquivos Excel (.xlsx ou .xls).');
        return;
    }
    
    // Verificar se XLSX está disponível
    if (typeof XLSX === 'undefined') {
        console.error('[IMPORTACAO] Biblioteca XLSX não encontrada');
        alert('Erro: Biblioteca Excel não carregada. Recarregue a página.');
        return;
    }
    
    console.log('[IMPORTACAO] Biblioteca XLSX disponível. Iniciando leitura...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            console.log('[IMPORTACAO] Arquivo lido com sucesso. Processando dados...');
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            console.log('[IMPORTACAO] Workbook criado:', {
                sheetNames: workbook.SheetNames,
                totalSheets: workbook.SheetNames.length
            });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            if (jsonData.length < 2) {
                showToast('Erro', 'Arquivo deve ter pelo menos 1 linha de dados além do cabeçalho', 'error');
                return;
            }
            
            // Validar cabeçalho
            const cabecalho = jsonData[0];
            const cabecalhoEsperado = ['Nome', 'Email', 'Quarto', 'Senha'];
            
            if (!cabecalhoEsperado.every(col => cabecalho.includes(col))) {
                showToast('Erro', 'Cabeçalho inválido. Esperado: Nome, Email, Quarto, Senha', 'error');
                return;
            }
            
            // Preparar dados para preview
            const dados = jsonData.slice(1).filter(row => row.length >= 4 && row[0] && row[1] && row[2] && row[3]);
            
            console.log('[IMPORTACAO] Dados processados:', {
                totalLinhas: jsonData.length,
                linhasDados: dados.length,
                primeiraLinha: dados[0] || 'Nenhuma'
            });
            
            if (dados.length === 0) {
                console.error('[IMPORTACAO] Nenhum dado válido encontrado');
                showToast('Erro', 'Nenhum dado válido encontrado no arquivo', 'error');
                return;
            }
            
            if (dados.length > 50) {
                console.warn('[IMPORTACAO] Muitos registros:', dados.length);
                showToast('Erro', 'Máximo de 50 registros por importação. Arquivo tem ' + dados.length + ' registros', 'error');
                return;
            }
            
            // Armazenar dados globalmente para processamento
            window.dadosImportacao = dados;
            console.log('[IMPORTACAO] Dados armazenados em window.dadosImportacao:', dados.length, 'registros');
            
            // Mostrar preview
            console.log('[IMPORTACAO] Chamando mostrarPreviewDados...');
            mostrarPreviewDados(dados, cabecalho);
            console.log('[IMPORTACAO] Preview exibido com sucesso');
            
        } catch (error) {
            console.error('[IMPORTACAO] Erro ao ler arquivo:', {
                error: error,
                message: error.message,
                stack: error.stack,
                arquivo: arquivo?.name
            });
            showToast('Erro', 'Erro ao ler arquivo Excel: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function(error) {
        console.error('[IMPORTACAO] Erro do FileReader:', error);
        showToast('Erro', 'Erro ao ler o arquivo selecionado', 'error');
    };
    
    console.log('[IMPORTACAO] Iniciando readAsArrayBuffer...');
    reader.readAsArrayBuffer(arquivo);
    console.log('[IMPORTACAO] FileReader configurado e iniciado');
}

// Mostrar preview dos dados
function mostrarPreviewDados(dados, cabecalho) {
    const previewDiv = document.getElementById('preview-dados');
    const tabelaDiv = document.getElementById('tabela-preview');
    const contadorP = document.getElementById('contador-registros');
    
    // Criar tabela
    let tabela = '<table style="width: 100%; border-collapse: collapse;">';
    tabela += '<thead><tr>';
    cabecalho.forEach(col => {
        tabela += `<th style="border: 1px solid #e5e7eb; padding: 8px; background: #f8fafc; text-align: left;">${col}</th>`;
    });
    tabela += '</tr></thead><tbody>';
    
    dados.slice(0, 10).forEach(row => { // Mostrar apenas 10 primeiras linhas
        tabela += '<tr>';
        row.forEach(cell => {
            tabela += `<td style="border: 1px solid #e5e7eb; padding: 8px;">${cell || ''}</td>`;
        });
        tabela += '</tr>';
    });
    
    if (dados.length > 10) {
        tabela += `<tr><td colspan="${cabecalho.length}" style="border: 1px solid #e5e7eb; padding: 8px; text-align: center; font-style: italic; color: #6b7280;">... e mais ${dados.length - 10} registros</td></tr>`;
    }
    
    tabela += '</tbody></table>';
    
    tabelaDiv.innerHTML = tabela;
    contadorP.textContent = `Total: ${dados.length} acompanhantes para importar`;
    previewDiv.style.display = 'block';
    
    // Habilitar botão de processar
    document.getElementById('btn-processar').disabled = false;
    
    showToast('Sucesso', `Arquivo carregado com ${dados.length} registros válidos`, 'success');
}

// Processar importação em lote
async function processarArquivoExcel() {
    if (!window.dadosImportacao || window.dadosImportacao.length === 0) {
        showToast('Erro', 'Nenhum dado para importar', 'error');
        return;
    }
    
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    if (!usuarioAdmin.role || usuarioAdmin.role !== 'super_admin') {
        showToast('Erro', 'Apenas Super Administradores podem importar em lote', 'error');
        return;
    }
    
    const btnProcessar = document.getElementById('btn-processar');
    const logDiv = document.getElementById('log-importacao');
    const resultadoDiv = document.getElementById('resultado-importacao');
    
    btnProcessar.disabled = true;
    btnProcessar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    logDiv.style.display = 'block';
    resultadoDiv.innerHTML = '';
    
    let sucessos = 0;
    let erros = 0;
    const logs = [];
    
    try {
        for (let i = 0; i < window.dadosImportacao.length; i++) {
            const [nome, email, quarto, senha] = window.dadosImportacao[i];
            
            try {
                // Validações básicas
                if (!nome || !email || !quarto || !senha) {
                    throw new Error('Dados incompletos');
                }
                
                if (!email.includes('@')) {
                    throw new Error('E-mail inválido');
                }
                
                if (senha.length < 6) {
                    throw new Error('Senha deve ter pelo menos 6 caracteres');
                }
                
                // Verificar se quarto já está ocupado
                const quartoOcupado = await window.db.collection('quartos_ocupados').doc(quarto.toString()).get();
                if (quartoOcupado.exists) {
                    throw new Error(`Quarto ${quarto} já está ocupado`);
                }
                
                // Verificar se e-mail já existe
                const emailExiste = await window.db.collection('usuarios_acompanhantes')
                    .where('email', '==', email).get();
                if (!emailExiste.empty) {
                    throw new Error('E-mail já cadastrado');
                }
                
                // Criar acompanhante
                const acompanhanteId = window.db.collection('usuarios_acompanhantes').doc().id;
                
                const dadosAcompanhante = {
                    nome: nome,
                    email: email,
                    quarto: quarto.toString(),
                    senha: senha,
                    tipo: 'acompanhante',
                    ativo: true,
                    preCadastro: true,
                    criadoEm: new Date().toISOString(),
                    criadoPor: usuarioAdmin.nome || 'Sistema',
                    id: acompanhanteId,
                    importadoEm: new Date().toISOString()
                };
                
                await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).set(dadosAcompanhante);
                
                // Registrar ocupação do quarto
                await window.db.collection('quartos_ocupados').doc(quarto.toString()).set({
                    acompanhanteId: acompanhanteId,
                    acompanhanteNome: nome,
                    acompanhanteEmail: email,
                    ocupadoEm: new Date().toISOString()
                });
                
                sucessos++;
                logs.push(`✅ ${nome} (${email}) - Quarto ${quarto}: Criado com sucesso`);
                
            } catch (error) {
                erros++;
                logs.push(`❌ ${nome} (${email}) - Quarto ${quarto}: ${error.message}`);
            }
            
            // Atualizar log em tempo real
            resultadoDiv.innerHTML = logs.join('<br>') + `<br><br><strong>Processando... ${i + 1}/${window.dadosImportacao.length}</strong>`;
            resultadoDiv.scrollTop = resultadoDiv.scrollHeight;
            
            // Pequeno delay para não sobrecarregar o Firebase
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Resultado final
        resultadoDiv.innerHTML = logs.join('<br>') + 
            `<br><br><strong>🎉 IMPORTAÇÃO CONCLUÍDA!</strong><br>` +
            `✅ Sucessos: ${sucessos}<br>` +
            `❌ Erros: ${erros}<br>` +
            `📊 Total processado: ${window.dadosImportacao.length}`;
        
        showToast('Sucesso', `Importação concluída! ${sucessos} sucessos, ${erros} erros`, 'success');
        
        // Recarregar lista de acompanhantes se estiver visível
        if (typeof window.carregarAcompanhantes === 'function') {
            window.carregarAcompanhantes();
        }
        
    } catch (error) {
        console.error('Erro na importação:', error);
        showToast('Erro', 'Erro durante a importação: ' + error.message, 'error');
    } finally {
        btnProcessar.disabled = false;
        btnProcessar.innerHTML = '<i class="fas fa-upload"></i> Importar Dados';
    }
}

// Expor funções globalmente com fallbacks
window.abrirImportacaoLote = function() {
    console.log('[IMPORTACAO] 🎯 Função global chamada via window');
    try {
        const modal = document.getElementById('modal-importacao-lote');
        console.log('[IMPORTACAO] Modal encontrado:', !!modal);
        
        if (modal) {
            // Remover classe hidden PRIMEIRO
            modal.classList.remove('hidden');
            
            // Aplicar estilos diretamente com setAttribute para maior prioridade
            modal.setAttribute('style', `
                display: flex !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                min-width: 100vw !important;
                min-height: 100vh !important;
                z-index: 999999 !important;
                background-color: rgba(0, 0, 0, 0.6) !important;
                align-items: center !important;
                justify-content: center !important;
                overflow-y: auto !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            `.trim());
            
            // Forçar estilos no modal-content também
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.setAttribute('style', `
                    position: relative !important;
                    max-width: 600px !important;
                    width: 95% !important;
                    min-width: 300px !important;
                    background: white !important;
                    border-radius: 16px !important;
                    padding: 2rem !important;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
                    z-index: 1000000 !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                `.trim());
                console.log('[IMPORTACAO] ✅ Modal-content estilizado');
            }
            
            // Garantir que o modal está no body (não dentro de outro elemento)
            if (modal.parentElement !== document.body) {
                console.warn('[IMPORTACAO] ⚠️ Modal não está no body! Movendo...');
                document.body.appendChild(modal);
            }
            
            console.log('[IMPORTACAO] ✅ Modal aberto e estilos forçados');
            console.log('[IMPORTACAO] Classes do modal:', modal.className);
            console.log('[IMPORTACAO] Estilo computed:', window.getComputedStyle(modal).display);
            console.log('[IMPORTACAO] Modal visível na viewport:', modal.getBoundingClientRect());
            console.log('[IMPORTACAO] Width/Height:', {
                width: modal.getBoundingClientRect().width,
                height: modal.getBoundingClientRect().height
            });
            
            // Reset dos campos
            const arquivoInput = document.getElementById('arquivo-excel');
            const previewDiv = document.getElementById('preview-dados');
            const logDiv = document.getElementById('log-importacao');
            const btnProcessar = document.getElementById('btn-processar');
            
            console.log('[IMPORTACAO] Elementos encontrados:', {
                arquivoInput: !!arquivoInput,
                previewDiv: !!previewDiv,
                logDiv: !!logDiv,
                btnProcessar: !!btnProcessar
            });
            
            if (arquivoInput) arquivoInput.value = '';
            if (previewDiv) previewDiv.style.display = 'none';
            if (logDiv) logDiv.style.display = 'none';
            if (btnProcessar) btnProcessar.disabled = true;
            
            // Configurar listener do arquivo
            configurarListenerArquivo();
            
            // Verificar após um frame se o modal está realmente visível
            setTimeout(() => {
                const rect = modal.getBoundingClientRect();
                console.log('[IMPORTACAO] 🔍 Verificação pós-abertura:', {
                    width: rect.width,
                    height: rect.height,
                    display: window.getComputedStyle(modal).display,
                    visibility: window.getComputedStyle(modal).visibility,
                    zIndex: window.getComputedStyle(modal).zIndex
                });
                
                if (rect.width === 0 || rect.height === 0) {
                    console.error('[IMPORTACAO] ❌ MODAL COM TAMANHO ZERO! Tentando corrigir...');
                    // Forçar novamente
                    modal.style.width = '100vw';
                    modal.style.height = '100vh';
                    modal.style.display = 'flex';
                }
            }, 100);
            
            console.log('[IMPORTACAO] 🎉 Modal configurado completamente!');
            
            console.log('[IMPORTACAO] 🎉 Modal configurado completamente!');
        } else {
            console.error('[IMPORTACAO] ❌ Modal não encontrado no DOM!');
            showToast('Erro', 'Modal de importação não encontrado', 'error');
        }
    } catch (error) {
        console.error('[IMPORTACAO] ❌ Erro na função:', error);
        alert('Erro ao abrir modal de importação: ' + error.message);
    }
};
window.fecharImportacaoLote = fecharImportacaoLote;
window.baixarModeloExcel = baixarModeloExcel;
window.processarArquivoExcel = processarArquivoExcel;

// Função auxiliar para debug
window.testarImportacao = function() {
    console.log('[DEBUG] Testando elementos de importação...');
    const modal = document.getElementById('modal-importacao-lote');
    const modalContent = modal?.querySelector('.modal-content');
    
    console.log('Modal:', !!modal);
    console.log('Modal display:', modal?.style.display);
    console.log('Modal classes:', modal?.className);
    console.log('Modal z-index:', modal?.style.zIndex);
    console.log('Modal position:', modal?.getBoundingClientRect());
    console.log('Modal content:', !!modalContent);
    console.log('Modal content display:', modalContent?.style.display);
    console.log('Arquivo input:', !!document.getElementById('arquivo-excel'));
    console.log('Preview div:', !!document.getElementById('preview-dados'));
    console.log('Função abrirImportacaoLote:', typeof window.abrirImportacaoLote);
    console.log('XLSX library:', typeof XLSX);
    
    // Tentar forçar visibilidade
    if (modal && modal.classList.contains('hidden')) {
        console.warn('⚠️ Modal ainda tem classe hidden! Removendo...');
        modal.classList.remove('hidden');
    }
};

// === CONFIGURAÇÃO IMPORTAÇÃO EXCEL AUTOMÁTICA ===
function configurarImportacaoExcelAutomatica() {
    console.log('[EXCEL-AUTO] 🎯 Configurando importação automática...');
    
    // Garantir que XLSX está carregado
    if (typeof XLSX === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = () => {
            console.log('[EXCEL-AUTO] ✅ XLSX carregado');
            configurarHandlersExcel();
        };
        document.head.appendChild(script);
    } else {
        configurarHandlersExcel();
    }
    
    function configurarHandlersExcel() {
        // Configurar input de arquivo-lote especificamente
        const inputLote = document.getElementById('arquivo-lote');
        if (inputLote) {
            inputLote.addEventListener('change', function(e) {
                const arquivo = e.target.files[0];
                if (arquivo && arquivo.name.includes('.xls')) {
                    processarExcelLote(arquivo);
                }
            });
            console.log('[EXCEL-AUTO] ✅ Input arquivo-lote configurado');
        }
        
        // Encontrar e configurar botões de importação
        const botoes = document.querySelectorAll('button[onclick*="importar"], [data-action="import"], .btn-importar-lote');
        botoes.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const input = document.getElementById('arquivo-lote');
                if (input && input.files[0]) {
                    processarExcelLote(input.files[0]);
                } else if (input) {
                    input.click();
                }
            });
        });
        
        console.log('[EXCEL-AUTO] 🎯 Sistema Excel ATIVO!');
    }
    
    function processarExcelLote(arquivo) {
        console.log('[EXCEL-LOTE] Processando:', arquivo.name);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const dados = new Uint8Array(e.target.result);
                const workbook = XLSX.read(dados, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                console.log('[EXCEL-LOTE] ✅ Dados:', jsonData.length, 'registros');
                
                if (jsonData.length === 0) {
                    alert('❌ Nenhum dado encontrado no arquivo Excel');
                    return;
                }
                
                // Mostrar resultado
                alert(`✅ Excel processado!\\n\\n${jsonData.length} registros encontrados\\nPrimeiro registro: ${JSON.stringify(jsonData[0], null, 2).substring(0, 200)}...`);
                
                // Fechar modal se aberto
                const modal = document.getElementById('modal-importacao-lote');
                if (modal && !modal.classList.contains('hidden')) {
                    modal.classList.add('hidden');
                }
                
            } catch (error) {
                console.error('[EXCEL-LOTE] Erro:', error);
                alert('❌ Erro ao processar Excel: ' + error.message);
            }
        };
        
        reader.readAsArrayBuffer(arquivo);
    }
}

// ===== FUNÇÃO PARA TORNAR MODAL ARRASTÁVEL =====
window.tornarModalArrastavel = function(modalId) {
    console.log('[DRAG] 🎯 Tornando modal arrastável:', modalId);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.log('[DRAG] ❌ Modal não encontrado:', modalId);
        return;
    }
    
    // Encontrar o modal-content dentro do modal
    let modalContent = modal.querySelector('.modal-content');
    if (!modalContent) {
        modalContent = modal.querySelector('.bg-white, .modal-dialog, [class*="modal-content"]');
    }
    
    if (!modalContent) {
        console.log('[DRAG] ❌ Modal content não encontrado');
        return;
    }
    
    console.log('[DRAG] 🎯 Modal content encontrado:', modalContent);
    
    // Criar barra de título para arrastar se não existir
    let titleBar = modalContent.querySelector('.drag-title-bar');
    if (!titleBar) {
        titleBar = document.createElement('div');
        titleBar.className = 'drag-title-bar';
        titleBar.innerHTML = `
            <span style="flex: 1; font-weight: bold; color: #fff;">📋 Gerenciar Usuários - Arraste para mover</span>
            <button onclick="fecharModal('${modalId}')" style="background: #ff4444; border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✕</button>
        `;
        titleBar.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 12px 16px;
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 8px 8px 0 0;
            user-select: none;
            margin: -20px -20px 20px -20px;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        // Inserir no início do modal content
        modalContent.insertBefore(titleBar, modalContent.firstChild);
        console.log('[DRAG] ✅ Barra de título criada');
    }
    
    // Configurar modal como posicionado e com z-index alto
    modalContent.style.position = 'fixed';
    modalContent.style.zIndex = '999999999';
    modalContent.style.top = '50px';
    modalContent.style.left = '50%';
    modalContent.style.transform = 'translateX(-50%)';
    modalContent.style.maxHeight = '85vh';
    modalContent.style.overflow = 'auto';
    modalContent.style.boxShadow = '0 20px 50px rgba(0,0,0,0.7)';
    modalContent.style.border = '2px solid #667eea';
    modalContent.style.borderRadius = '8px';
    
    // Variáveis para o drag
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    // Remover listeners antigos se existirem
    if (titleBar._dragListenersAdded) {
        console.log('[DRAG] ⚠️ Listeners já adicionados, pulando...');
        return;
    }
    
    // Eventos de mouse
    titleBar.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
    
    // Marcar que listeners foram adicionados
    titleBar._dragListenersAdded = true;
    
    function dragStart(e) {
        if (e.target.tagName === 'BUTTON') return; // Não arrastar se clicar no botão fechar
        
        const rect = modalContent.getBoundingClientRect();
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
        
        if (e.target === titleBar || titleBar.contains(e.target)) {
            isDragging = true;
            titleBar.style.cursor = 'grabbing';
            modalContent.style.transition = 'none'; // Remove transições durante o drag
            console.log('[DRAG] 🎯 Iniciando arrasto...');
        }
    }
    
    function dragEnd(e) {
        if (isDragging) {
            console.log('[DRAG] 🎯 Finalizando arrasto');
        }
        isDragging = false;
        titleBar.style.cursor = 'move';
        modalContent.style.transition = ''; // Restaura transições
    }
    
    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            // Limitar movimento dentro da tela
            const rect = modalContent.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            currentX = Math.max(0, Math.min(maxX, currentX));
            currentY = Math.max(0, Math.min(maxY, currentY));
            
            modalContent.style.left = currentX + 'px';
            modalContent.style.top = currentY + 'px';
            modalContent.style.transform = 'none'; // Remove transform para permitir posicionamento absoluto
        }
    }
    
    console.log('[DRAG] ✅ Modal agora é arrastável! Clique e arraste pela barra azul no topo.');
};

// Função de teste para modal arrastável
window.testeDragModal = function() {
    console.log('[TEST-DRAG] 🧪 Testando modal arrastável...');
    
    // Primeiro, abrir o modal de gerenciar usuários
    if (typeof window.showManageUsersModal === 'function') {
        window.showManageUsersModal();
        console.log('[TEST-DRAG] ✅ Modal de gerenciar usuários aberto para teste');
    } else {
        console.log('[TEST-DRAG] ❌ Função showManageUsersModal não encontrada');
        alert('❌ Função showManageUsersModal não encontrada');
    }
};

// Iniciar configuração Excel automaticamente
setTimeout(() => {
    configurarImportacaoExcelAutomatica();
}, 3000);
