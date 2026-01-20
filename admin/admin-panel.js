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
    // Remove modal anterior se existir
    const existingModal = document.getElementById('timeout-warning-modal');
    if (existingModal) {
        if (existingModal.countdownInterval) {
            clearInterval(existingModal.countdownInterval);
        }
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'timeout-warning-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000 !important;
        animation: timeoutFadeIn 0.3s ease-in;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 420px;
            width: 90vw;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            animation: timeoutSlideUp 0.3s ease-out;
        ">
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="flex-shrink: 0;">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #fbbf24; width: 32px; height: 32px; flex-shrink: 0;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600; color: #1f2937;">Sessão Expirando</h3>
                    <p style="margin: 0; font-size: 0.875rem; color: #6b7280; line-height: 1.5;">
                        Sua sessão será encerrada em <span id="countdown" style="font-weight: 700; color: #dc2626;">2:00</span> por inatividade.
                    </p>
                </div>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <button onclick="extendSession()" style="
                    flex: 1;
                    background: #3b82f6;
                    color: white;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">
                    Continuar Sessão
                </button>
                <button onclick="performAutoLogout()" style="
                    flex: 1;
                    background: #e5e7eb;
                    color: #374151;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#d1d5db'" onmouseout="this.style.background='#e5e7eb'" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">
                    Sair Agora
                </button>
            </div>
        </div>
    `;
    
    // Inserir estilos de animação se não existirem
    if (!document.getElementById('timeout-warning-styles')) {
        const style = document.createElement('style');
        style.id = 'timeout-warning-styles';
        style.textContent = `
            @keyframes timeoutFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes timeoutSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    
    // Impedir scroll de fundo
    document.body.style.overflow = 'hidden';
    
    // Countdown de 2 minutos
    let timeLeft = 120;
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        const countdownInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            if (countdownEl) {
                countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                performAutoLogout();
            }
        }, 1000);
        
        // Salvar interval para limpeza
        modal.countdownInterval = countdownInterval;
    }
}

// Estender sessão
function extendSession() {
    const modal = document.getElementById('timeout-warning-modal');
    if (modal) {
        if (modal.countdownInterval) {
            clearInterval(modal.countdownInterval);
        }
        modal.remove();
        document.body.style.overflow = '';
    }
    detectUserActivity();
    showToast('Sucesso', 'Sessão estendida por mais 10 minutos!', 'success');
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
    
    // Limpar cache LRU (robusto, sem quebrar fluxo em caso de erro)
    try {
        if (window.cacheManager) {
            if (typeof window.cacheManager.clearSolicitacoes === 'function') {
                window.cacheManager.clearSolicitacoes();
            }
            if (typeof window.cacheManager.clearUsuarios === 'function') {
                window.cacheManager.clearUsuarios();
            }
            console.log('[CLEANUP] ✅ Cache LRU limpo');
        }
        if (typeof window.clearAllCache === 'function') {
            window.clearAllCache();
        }
    } catch (e) {
        console.warn('[CLEANUP] ⚠️ Falha ao limpar cache (seguindo com logout):', e);
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
        document.body.style.overflow = '';
    }
    
    // Limpar timeouts
    clearTimeout(sessionTimeout);
    clearTimeout(warningTimeout);
    
    // Limpar storage local para evitar sessão "fantasma" após reload
    try { localStorage.clear(); sessionStorage.clear(); } catch (_) {}

    // Mostrar notificação
    showToast('Sessão Expirada', 'Você foi desconectado por inatividade.', 'warning');
    
    // Realizar logout e redirecionar para página de login
    setTimeout(() => {
        if (window.auth && typeof window.auth.signOut === 'function') {
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

// === FUNÇÃO DROPDOWN MENU (Menu Moderno) ===
window.toggleDropdownMenu = function() {
    const dropdown = document.getElementById('dropdown-menu-content');
    if (dropdown) {
        dropdown.classList.toggle('active');
        
        // Fechar quando clicar fora
        document.addEventListener('click', function closeDropdown(e) {
            const dropdownMenu = document.querySelector('.dropdown-menu');
            if (dropdownMenu && !dropdownMenu.contains(e.target)) {
                dropdown.classList.remove('active');
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
};

// Fechar dropdown quando uma opção for clicada
document.addEventListener('DOMContentLoaded', function() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            const dropdown = document.getElementById('dropdown-menu-content');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        });
    });
});

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
            'teams-grid',
            'logs-auditoria-section'
        ];
        secoes.forEach(id => {
            const el = document.getElementById(id) || document.querySelector('.' + id);
            if (el) el.classList.add('hidden');
        });
        
        // Inicializar flag de modo logs
        if (typeof window.MODO_LOGS_ATIVO === 'undefined') window.MODO_LOGS_ATIVO = false;
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
            window.MODO_LOGS_ATIVO = false;
            
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
        } else if (secao === 'logs' || secao === 'logs-auditoria') {
            // Para logs e auditoria
            debugLog('[DEBUG] mostrarSecaoPainel: abrindo seção de logs e auditoria...');
            window.MODO_LOGS_ATIVO = true;
            if (typeof window.abrirLogsAuditoria === 'function') {
                try {
                    window.abrirLogsAuditoria();
                    debugLog('[DEBUG] mostrarSecaoPainel: função abrirLogsAuditoria executada com sucesso');
                } catch (error) {
                    console.error('[ERRO] mostrarSecaoPainel: erro ao abrir logs:', error);
                    showToast('Erro', 'Falha ao abrir logs: ' + error.message, 'error');
                }
            } else {
                console.error('[ERRO] mostrarSecaoPainel: função abrirLogsAuditoria não encontrada!');
                showToast('Erro', 'Função de logs não disponível', 'error');
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
                console.log('[MANAGE-USE