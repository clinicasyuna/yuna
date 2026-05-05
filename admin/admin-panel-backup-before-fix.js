/**
 * Sistema YUNA - Painel Administrativo
 * Copyright Â© 2025 Samuel dos Reis Lacerda Junior. Todos os direitos reservados.
 * 
 * Este software Ã© propriedade intelectual protegida por direitos autorais.
 * Uso nÃ£o autorizado Ã© estritamente proibido.
 * 
 * VersÃ£o: 2.0.0
 * Data de CriaÃ§Ã£o: 14 de novembro de 2025
 * Ãšltima atualizaÃ§Ã£o: 14/11/2025
 */

// admin-panel.js - Painel Administrativo YUNA

// === CONFIGURAÃ‡ÃƒO DE MODO DE PRODUÃ‡ÃƒO ===
const MODO_PRODUCAO = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1' && 
                      window.location.hostname !== 'file://';

// FunÃ§Ã£o de log condicional - sÃ³ mostra logs em desenvolvimento
function debugLog(message, ...args) {
    if (!MODO_PRODUCAO) {
        console.log(message, ...args);
    }
}

// === DECLARAÃ‡Ã•ES ANTECIPADAS DE FUNÃ‡Ã•ES CRÃTICAS ===
// DeclaraÃ§Ãµes para evitar problemas de ordem de carregamento
let limparDadosTeste, verificarEstatisticas, adicionarPainelManutencao;

// === LIMPEZA IMEDIATA DE CACHE AGRESSIVA ===
(function forceCleanupDebugElements() {
    
    // FunÃ§Ã£o de limpeza extremamente agressiva
    function removeUnwantedButtons() {
        // Verificar se o DOM estÃ¡ carregado
        if (!document.body) {
            setTimeout(removeUnwantedButtons, 100);
            return;
        }
        
        const debugTexts = ['usuÃ¡rios direto', 'debug', 'relatÃ³rios direto', 'usuario direto', 'relatorio direto'];
        let removed = 0;
        
        // Buscar todos os botÃµes
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(btn => {
            const text = (btn.textContent || '').trim().toLowerCase();
            if (debugTexts.some(debugText => text.includes(debugText))) {
                // SÃ³ loggar em desenvolvimento
                if (typeof debugLog === 'function') {
                    debugLog(`[FORCE-CLEANUP] Removendo botÃ£o: "${btn.textContent}"`);
                }
                btn.style.display = 'none !important';
                btn.style.visibility = 'hidden !important';
                btn.style.opacity = '0 !important';
                btn.style.pointerEvents = 'none !important';
                btn.remove();
                removed++;
            }
        });
        
        // Buscar por onclick especÃ­ficos
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

        // Buscar por classes CSS especÃ­ficas
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
            debugLog(`[FORCE-CLEANUP] Total removido nesta iteraÃ§Ã£o: ${removed}`);
        }
        
        // ForÃ§ar visibilidade do botÃ£o limpeza se for super admin
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
    
    // Parar limpeza apÃ³s 20 segundos
    setTimeout(() => {
        clearInterval(cleanupInterval);
        if (typeof debugLog === 'function') {
            debugLog('[FORCE-CLEANUP] Limpeza finalizada');
        }
    }, 20000);
    
    // Executar tambÃ©m em eventos especÃ­ficos
    document.addEventListener('DOMContentLoaded', removeUnwantedButtons);
    window.addEventListener('load', removeUnwantedButtons);
    
    // Observar mudanÃ§as no DOM e reagir imediatamente
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.tagName === 'BUTTON') {
                            const text = (node.textContent || '').toLowerCase();
                            if (text.includes('debug') || text.includes('direto') || text.includes('usuÃ¡rios direto')) {
                                console.log('[FORCE-CLEANUP] Interceptando botÃ£o adicionado:', node.textContent);
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
        
        // Parar observaÃ§Ã£o apÃ³s 30 segundos
        setTimeout(() => {
            observer.disconnect();
            console.log('[FORCE-CLEANUP] Observador DOM desconectado');
        }, 30000);
    }
    
})();

// === LIMPEZA DE CACHE E ELEMENTOS INDESEJADOS ===
window.addEventListener('DOMContentLoaded', function() {
    // Remover botÃµes debug que possam estar no cache
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
        
        // Verificar se botÃµes com textos especÃ­ficos existem
        const todosBotoes = document.querySelectorAll('button');
        todosBotoes.forEach(btn => {
            const texto = btn.textContent || '';
            if (texto.includes('UsuÃ¡rios Direto') || 
                texto.includes('Debug') || 
                texto.includes('RelatÃ³rios Direto')) {
                console.log(`[CLEANUP] Removendo botÃ£o por texto:`, btn);
                btn.remove();
            }
        });
        
        console.log('[CLEANUP] Limpeza de elementos indesejados concluÃ­da');
    }, 100);
});

// === PROTEÃ‡ÃƒO CONTRA ERROS DE EXTENSÃ•ES ===
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
            return true; // Silenciar erro de extensÃ£o
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

// === FUNÃ‡Ã•ES PRINCIPAIS ===

// FunÃ§Ã£o para alternar tipo de acesso (definida cedo para HTML poder chamar)
window.alterarTipoAcesso = function() {
    console.log('[DEBUG] alterarTipoAcesso: funÃ§Ã£o chamada');
    
    const tipoSelect = document.getElementById('tipo-acesso');
    const departamentoSection = document.getElementById('departamento-section');
    const departamentoSelect = document.getElementById('departamento');
    
    console.log('[DEBUG] alterarTipoAcesso: elementos encontrados:', {
        tipoSelect: !!tipoSelect,
        departamentoSection: !!departamentoSection,
        departamentoSelect: !!departamentoSelect
    });
    
    if (!tipoSelect || !departamentoSection) {
        console.error('[ERRO] alterarTipoAcesso: elementos nÃ£o encontrados');
        return;
    }
    
    const tipo = tipoSelect.value;
    console.log('[DEBUG] alterarTipoAcesso: tipo selecionado =', tipo);
    
    if (tipo === 'equipe') {
        // Mostrar seÃ§Ã£o de departamento para equipe
        departamentoSection.classList.remove('hidden');
        departamentoSection.style.display = 'block'; // Force show
        console.log('[DEBUG] alterarTipoAcesso: mostrando departamento-section');
        console.log('[DEBUG] Classes apÃ³s remoÃ§Ã£o:', departamentoSection.className);
        console.log('[DEBUG] Style display apÃ³s mudanÃ§a:', departamentoSection.style.display);
    } else {
        // Ocultar seÃ§Ã£o de departamento para admin
        departamentoSection.classList.add('hidden');
        departamentoSection.style.display = 'none'; // Force hide
        if (departamentoSelect) {
            departamentoSelect.value = ''; // Limpar seleÃ§Ã£o
        }
        console.log('[DEBUG] alterarTipoAcesso: ocultando departamento-section');
    }
};

// FunÃ§Ã£o para alternar tipo de usuÃ¡rio no modal de criaÃ§Ã£o (tambÃ©m definida cedo)
window.alterarTipoUsuario = function() {
    debugLog('[DEBUG] alterarTipoUsuario: funÃ§Ã£o chamada');
    
    const tipoSelect = document.getElementById('usuario-tipo');
    const campoEquipe = document.getElementById('campo-equipe');
    const usuarioEquipeSelect = document.getElementById('usuario-equipe');
    
    if (!tipoSelect || !campoEquipe) {
        console.error('[ERRO] alterarTipoUsuario: elementos nÃ£o encontrados');
        return;
    }
    
    const tipo = tipoSelect.value;
    debugLog('[DEBUG] alterarTipoUsuario: tipo selecionado =', tipo);
    
    if (tipo === 'equipe') {
        // Mostrar campo de equipe e tornÃ¡-lo obrigatÃ³rio
        campoEquipe.style.display = 'block';
        if (usuarioEquipeSelect) {
            usuarioEquipeSelect.required = true;
        }
        debugLog('[DEBUG] alterarTipoUsuario: mostrando campo equipe');
    } else {
        // Ocultar campo de equipe e remover obrigatoriedade
        campoEquipe.style.display = 'none';
        if (usuarioEquipeSelect) {
            usuarioEquipeSelect.required = false;
            usuarioEquipeSelect.value = ''; // Limpar seleÃ§Ã£o
        }
        debugLog('[DEBUG] alterarTipoUsuario: ocultando campo equipe');
    }
};

// FunÃ§Ã£o para limpar completamente a interface
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
        
        // Remover estilos especÃ­ficos do painel logado que podem interferir
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
        
        // Resetar estilo da pÃ¡gina principal
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
        
        // Restaurar estilo do body para centralizaÃ§Ã£o
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.minHeight = '100vh';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.background = '#f1f5f9';
        
        // Garantir que o html tambÃ©m tenha altura total
        document.documentElement.style.height = '100%';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        
        debugLog('[DEBUG] Limpeza completa da interface realizada');
        
    } catch (error) {
        console.error('[ERRO] Falha na limpeza da interface:', error);
    }
};

// FunÃ§Ã£o de emergÃªncia para resetar o sistema
window.emergencyReset = function() {
    console.log('ðŸš¨ EMERGENCY RESET INICIADO');
    
    // Limpar localStorage
    localStorage.clear();
    
    // Limpar interface
    limparInterfaceCompleta();
    
    // ForÃ§ar logout
    if (window.auth) {
        window.auth.signOut().then(() => {
            console.log('âœ… Logout forÃ§ado realizado');
            window.location.reload();
        }).catch(error => {
            console.error('Erro no logout:', error);
            window.location.reload();
        });
    } else {
        window.location.reload();
    }
};

// ReferÃªncia antecipada para funÃ§Ã£o de limpeza (definida no final do arquivo)
window.limparDadosTeste = function() {
    // FunÃ§Ã£o serÃ¡ redefinida completamente no final do arquivo
    debugLog('[DEBUG] limparDadosTeste chamada prematuramente - aguardando definiÃ§Ã£o completa');
    setTimeout(() => {
        if (window.limparDadosTeste && typeof window.limparDadosTeste === 'function') {
            window.limparDadosTeste();
        }
    }, 500);
};

// FunÃ§Ã£o para criaÃ§Ã£o rÃ¡pida de super admin (desenvolvimento)
window.criarSuperAdminDev = async function(email, senha) {
    if (!window.auth || !window.db) {
        console.error('Firebase nÃ£o inicializado');
        return;
    }
    
    try {
        // Criar usuÃ¡rio no Firebase Auth
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        // Criar documento na coleÃ§Ã£o usuarios_admin
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
        
        console.log('âœ… Super admin criado:', email);
        alert('Super admin criado com sucesso! FaÃ§a login agora.');
        
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
        console.error('[ERRO] Firebase SDK nÃ£o carregado');
        alert('Erro: Firebase SDK nÃ£o carregado. Verifique a conexÃ£o ou o script.');
        return false;
    }
    
    try {
        if (!firebase.apps.length) {
            const firebaseConfig = {
                apiKey: "AIzaSyAogGkN5N24Puss4-kF9Z6npPYyEzVei3M",
                authDomain: "app-pedidos-4656c.firebaseapp.com",
                projectId: "app-pedidos-4656c",
                storageBucket: "app-pedidos-4656c.firebasestorage.app",
                messagingSenderId: "251931417472",
                appId: "1:251931417472:web:4b955052a184d114f57f65"
            };
            
            debugLog('[DEBUG] Inicializando Firebase com config:', firebaseConfig.projectId);
            firebase.initializeApp(firebaseConfig);
            console.log('âœ… Firebase inicializado com sucesso');
        }
        
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        // Configurar settings do Firestore apenas se necessÃ¡rio
        // Verificar se ainda nÃ£o foi configurado
        let settingsConfigured = false;
        try {
            // Tentar uma operaÃ§Ã£o simples para verificar se jÃ¡ foi configurado
            const testQuery = window.db.collection('_test').limit(1);
            settingsConfigured = true; // Se chegou aqui, Firestore jÃ¡ estÃ¡ ativo
        } catch (e) {
            // Firestore ainda nÃ£o foi usado, podemos configurar settings
            settingsConfigured = false;
        }
        
        if (!settingsConfigured) {
            try {
                window.db.settings({
                    ignoreUndefinedProperties: true
                });
                console.log('âœ… Settings do Firestore configuradas');
            } catch (settingsError) {
                // Ignorar erro silenciosamente se jÃ¡ foi configurado
                if (settingsError.code !== 'failed-precondition') {
                    console.warn('âš ï¸ Aviso settings:', settingsError.code);
                }
            }
        }
        
        // Configurar persistÃªncia offline usando nova API
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
            
            console.log('â„¹ï¸ Cache offline configurado (warnings de API deprecated suprimidos)');
        } catch (err) {
            // Apenas avisar, nÃ£o Ã© erro crÃ­tico
            if (err.code === 'failed-precondition') {
                console.log('â„¹ï¸ PersistÃªncia nÃ£o ativada: mÃºltiplas abas abertas');
            } else if (err.code === 'unimplemented') {
                console.log('â„¹ï¸ PersistÃªncia nÃ£o suportada neste navegador');
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('[ERRO] Falha na inicializaÃ§Ã£o do Firebase:', error);
        showToast('Erro', 'Falha na conexÃ£o com Firebase. Modo offline ativado.', 'error');
        return false;
    }
}

// --- PermissÃµes centralizadas ---
// FunÃ§Ãµes importadas do admin-permissions.js
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
            console.warn(`[AVISO] ocultarSecoesPrincipais: elemento nÃ£o encontrado: ${id}`);
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
        console.log(`[DEBUG] mostrarSecaoPainel: navegaÃ§Ã£o para '${secao}'`);
        // Oculta todas as seÃ§Ãµes principais
        const secoes = [
            'admin-panel',
            'acompanhantes-section',
            'relatorios-section',
            'metricas-gerais',
            'create-user-modal',
            'manage-users-modal',
            'teams-grid'
        ];
        secoes.forEach(id => {
            const el = document.getElementById(id) || document.querySelector('.' + id);
            if (el) el.classList.add('hidden');
        });
        // Exibe apenas a seÃ§Ã£o desejada
        if (secao === 'painel') {
            document.getElementById('admin-panel')?.classList.remove('hidden');
            document.getElementById('metricas-gerais')?.classList.remove('hidden');
            document.querySelector('.teams-grid')?.classList.remove('hidden');
            debugLog('[DEBUG] mostrarSecaoPainel: exibindo painel principal');
            
            // Garantir que o botÃ£o "Minha Senha" esteja sempre visÃ­vel
            setTimeout(() => {
                forcarVisibilidadeBotaoMinhaSenha();
            }, 100);
            
            // Recarregar solicitaÃ§Ãµes de forma simplificada
            if (typeof carregarSolicitacoes === 'function') {
                debugLog('[DEBUG] mostrarSecaoPainel: carregando solicitaÃ§Ãµes...');
                carregarSolicitacoes();
            }
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
            // Para relatÃ³rios, chamar a funÃ§Ã£o especÃ­fica
            debugLog('[DEBUG] mostrarSecaoPainel: chamando funÃ§Ã£o mostrarRelatorios...');
            
            if (typeof window.mostrarRelatorios === 'function') {
                try {
                    window.mostrarRelatorios();
                    debugLog('[DEBUG] mostrarSecaoPainel: funÃ§Ã£o mostrarRelatorios executada com sucesso');
                } catch (error) {
                    console.error('[ERRO] mostrarSecaoPainel: erro ao executar mostrarRelatorios:', error);
                    showToast('Erro', 'Falha ao carregar relatÃ³rios: ' + error.message, 'error');
                }
            } else {
                console.error('[ERRO] mostrarSecaoPainel: funÃ§Ã£o mostrarRelatorios nÃ£o encontrada!');
                showToast('Erro', 'FunÃ§Ã£o de relatÃ³rios nÃ£o disponÃ­vel', 'error');
            }
        } else if (secao === 'create-user') {
            const modal = document.getElementById('modal-novo-usuario');
            document.getElementById('admin-panel')?.classList.remove('hidden');
            if (modal) {
                // Garantir que o modal esteja anexado ao body
                if (modal.parentElement !== document.body) {
                    debugLog('[DEBUG] Modal criar usuÃ¡rio nÃ£o estÃ¡ no body, movendo...');
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
                    debugLog('[DEBUG] Modal gerenciar usuÃ¡rios nÃ£o estÃ¡ no body, movendo...');
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
                
                // CORREÃ‡ÃƒO: Carregar usuÃ¡rios quando modal Ã© exibido
                debugLog('[DEBUG] Carregando usuÃ¡rios para o modal...');
                console.log('[MANAGE-USERS] Iniciando carregamento de usuÃ¡rios...');
                
                if (typeof window.carregarUsuarios === 'function') {
                    try {
                        console.log('[MANAGE-USERS] Executando window.carregarUsuarios()...');
                        await window.carregarUsuarios();
                        console.log('[MANAGE-USERS] âœ… UsuÃ¡rios carregados com sucesso no modal');
                        debugLog('[DEBUG] âœ… UsuÃ¡rios carregados com sucesso no modal');
                    } catch (error) {
                        console.error('[MANAGE-USERS] âŒ Falha ao carregar usuÃ¡rios:', error);
                        console.error('[MANAGE-USERS] Stack trace:', error.stack);
                        showToast('Erro', 'Falha ao carregar usuÃ¡rios: ' + error.message, 'error');
                    }
                } else {
                    console.error('[MANAGE-USERS] âŒ FunÃ§Ã£o carregarUsuarios nÃ£o estÃ¡ disponÃ­vel!');
                    console.error('[MANAGE-USERS] DisponÃ­vel:', typeof window.carregarUsuarios);
                    console.error('[MANAGE-USERS] Window object:', Object.keys(window).filter(k => k.includes('carrega')));
                }
            }
            debugLog('[DEBUG] mostrarSecaoPainel: exibindo manage-users-modal');
        } else {
            console.warn(`[AVISO] mostrarSecaoPainel: seÃ§Ã£o desconhecida: ${secao}`);
        }
        
        // Garantir que os botÃµes estejam sempre configurados apÃ³s mudanÃ§a de seÃ§Ã£o
        // Removido para evitar chamadas desnecessÃ¡rias - configuraÃ§Ã£o feita no login
        debugLog('[DEBUG] mostrarSecaoPainel: seÃ§Ã£o alterada para:', secao);
        
    } catch (err) {
        console.error('[ERRO] mostrarSecaoPainel: falha ao exibir seÃ§Ã£o:', err);
    }
}

// --- AutenticaÃ§Ã£o e Acesso ---
// Oculta campo departamento corretamente na inicializaÃ§Ã£o
window.addEventListener('DOMContentLoaded', async function() {
    debugLog('[DEBUG] DOMContentLoaded: iniciando configuraÃ§Ã£o...');
    
    // Primeiro, configurar os botÃµes ANTES de qualquer coisa relacionada ao Firebase
    debugLog('[DEBUG] DOMContentLoaded: configurando eventos dos botÃµes ANTES do Firebase...');
    
    // Garantir que as funÃ§Ãµes dos modais estÃ£o disponÃ­veis
    if (typeof window.showCreateUserModal !== 'function') {
        console.error('[ERRO] showCreateUserModal nÃ£o definida durante DOMContentLoaded!');
    }
    if (typeof window.showManageUsersModal !== 'function') {
        console.error('[ERRO] showManageUsersModal nÃ£o definida durante DOMContentLoaded!');
    }
    
    // Configurar eventos imediatamente
    configurarEventosBotoes();
    
    // ForÃ§ar visibilidade do botÃ£o "Minha Senha" desde o inÃ­cio
    setTimeout(() => {
        forcarVisibilidadeBotaoMinhaSenha();
        // Iniciar watchdog para manter o botÃ£o sempre visÃ­vel
        iniciarWatchdogBotaoMinhaSenha();
        // Iniciar observer para detectar remoÃ§Ãµes do botÃ£o
        iniciarObserverBotaoMinhaSenha();
    }, 100);
    
    // Tentar inicializar Firebase
    try {
        const firebaseOk = await initFirebaseApp();
        
        if (!firebaseOk) {
            console.warn('[AVISO] Firebase falhou na inicializaÃ§Ã£o - continuando em modo offline');
            // Em caso de falha do Firebase, ativar modo offline bÃ¡sico
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
        console.error('[ERRO] Erro crÃ­tico na inicializaÃ§Ã£o do Firebase:', error);
    }
    
    // FORÃ‡AR ocultaÃ§Ã£o de todos os painÃ©is administrativos na inicializaÃ§Ã£o
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.classList.add('hidden');
    
    const teamsGrid = document.querySelector('.teams-grid');
    if (teamsGrid) teamsGrid.classList.add('hidden');
    
    // Ocultar TODOS os painÃ©is administrativos na inicializaÃ§Ã£o
    const allPanels = document.querySelectorAll('.team-panel, .department-card, [class*="card"]');
    allPanels.forEach(panel => {
        if (panel.classList) panel.classList.add('hidden');
    });
    
    // Garantir que a seÃ§Ã£o de autenticaÃ§Ã£o esteja visÃ­vel
    const authSection = document.getElementById('auth-section');
    if (authSection) authSection.classList.remove('hidden');
    
    // Ocultar campo departamento corretamente na inicializaÃ§Ã£o
    var tipoSelect = document.getElementById('tipo-acesso');
    var tipo = tipoSelect ? tipoSelect.value : null;
    var departamentoSection = document.getElementById('departamento-section');
    if (tipo !== 'equipe' && departamentoSection) {
        departamentoSection.classList.add('hidden');
        var departamentoSelect = document.getElementById('departamento');
        if (departamentoSelect) departamentoSelect.value = '';
        debugLog('[DEBUG] InicializaÃ§Ã£o: ocultando departamento-section');
    }
    
    // Listener de autenticaÃ§Ã£o persistente (apenas se Firebase OK)
    if (window.auth) {
        window.auth.onAuthStateChanged(async function(user) {
            try {
                if (user) {
                    debugLog('[DEBUG] UsuÃ¡rio autenticado:', user.email);
                    debugLog('[DEBUG] UID do usuÃ¡rio:', user.uid);
                    
                    // Verifica admin via Firestore
                    debugLog('[DEBUG] Verificando permissÃµes do usuÃ¡rio...');
                    const dadosAdmin = await window.verificarUsuarioAdminJS(user);
                    
                    if (dadosAdmin) {
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
                        
                        // Configurar interface baseada no tipo de usuÃ¡rio
                        if (dadosAdmin.role === 'super_admin' || dadosAdmin.isSuperAdmin) {
                            debugLog('[DEBUG] UsuÃ¡rio SUPER ADMIN - mostrando painel completo');
                            
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
                            
                            // Garantir que elementos crÃ­ticos estÃ£o visÃ­veis
                            document.body.style.display = 'block';
                            document.body.style.visibility = 'visible';
                            
                            debugLog('[DEBUG] Interface configurada para super admin');
                            
                        } else if (dadosAdmin.role === 'admin') {
                            debugLog('[DEBUG] UsuÃ¡rio ADMIN - mostrando painel completo com permissÃµes restritas');
                            
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
                            
                            // Garantir que elementos crÃ­ticos estÃ£o visÃ­veis
                            document.body.style.display = 'block';
                            document.body.style.visibility = 'visible';
                            
                            debugLog('[DEBUG] Interface configurada para admin');
                            
                        } else if (dadosAdmin.isEquipe && dadosAdmin.equipe) {
                            debugLog('[DEBUG] UsuÃ¡rio EQUIPE - mostrando apenas cards do departamento:', dadosAdmin.equipe);
                            // UsuÃ¡rio de equipe vÃª apenas seu departamento
                            document.getElementById('auth-section')?.classList.add('hidden');
                            document.getElementById('admin-panel')?.classList.remove('hidden');
                            
                            // Mostrar apenas cards do departamento especÃ­fico
                            const teamsGrid = document.querySelector('.teams-grid');
                            if (teamsGrid) teamsGrid.classList.remove('hidden');
                            
                            // Ocultar todos os painÃ©is primeiro
                            const allPanels = document.querySelectorAll('.team-panel, .department-card, [class*="card"]');
                            allPanels.forEach(panel => {
                                if (panel.classList) panel.classList.add('hidden');
                            });
                            
                            // Mostrar apenas o painel do departamento do usuÃ¡rio
                            const departmentPanel = document.querySelector(`[data-department="${dadosAdmin.equipe}"]`);
                            if (departmentPanel) {
                                departmentPanel.classList.remove('hidden');
                                debugLog('[DEBUG] Mostrando painel do departamento:', dadosAdmin.equipe);
                            } else {
                                console.warn('[AVISO] Painel nÃ£o encontrado para departamento:', dadosAdmin.equipe);
                            }
                            
                        } else {
                            debugLog('[DEBUG] UsuÃ¡rio sem permissÃµes especÃ­ficas - mantendo na tela de login');
                            document.getElementById('auth-section')?.classList.remove('hidden');
                            document.getElementById('admin-panel')?.classList.add('hidden');
                            showToast('Erro', 'UsuÃ¡rio sem permissÃµes definidas', 'error');
                            setTimeout(() => window.auth.signOut(), 2000);
                            return;
                        }
                        
                        // Atualizar botÃµes imediatamente apÃ³s login (sem timeout)
                        debugLog('[DEBUG] Inicializando botÃµes apÃ³s login...');
                        atualizarVisibilidadeBotoes();
                        configurarEventosBotoes();
                        
                        // ForÃ§ar visibilidade do botÃ£o "Minha Senha" imediatamente
                        forcarVisibilidadeBotaoMinhaSenha();
                        
                        // ConfiguraÃ§Ã£o adicional apÃ³s um pequeno delay para garantir DOM estÃ¡vel
                        setTimeout(() => {
                            debugLog('[DEBUG] ReconfiguraÃ§Ã£o de seguranÃ§a dos botÃµes...');
                            atualizarVisibilidadeBotoes();
                            configurarEventosBotoes();
                            
                            // ForÃ§ar novamente o botÃ£o "Minha Senha"
                            forcarVisibilidadeBotaoMinhaSenha();
                            
                            // ForÃ§ar exibiÃ§Ã£o do botÃ£o de limpeza para super_admin
                            if (window.usuarioAdmin && window.usuarioAdmin.role === 'super_admin') {
                                const btnLimpeza = document.getElementById('limpeza-btn');
                                if (btnLimpeza) {
                                    btnLimpeza.classList.remove('btn-hide');
                                    btnLimpeza.style.display = 'inline-flex';
                                    debugLog('[DEBUG] BotÃ£o limpeza forÃ§ado para super_admin');
                                } else {
                                    console.warn('[AVISO] BotÃ£o limpeza nÃ£o encontrado no DOM');
                                }
                            }
                            
                            // Garantir que as funÃ§Ãµes estÃ£o disponÃ­veis globalmente
                            if (typeof window.showCreateUserModal !== 'function') {
                                console.error('[ERRO] showCreateUserModal nÃ£o estÃ¡ definida!');
                            }
                            if (typeof window.showManageUsersModal !== 'function') {
                                console.error('[ERRO] showManageUsersModal nÃ£o estÃ¡ definida!');
                            }
                            if (typeof window.limparDadosTeste !== 'function') {
                                console.error('[ERRO] limparDadosTeste nÃ£o estÃ¡ definida!');
                            }
                            
                            debugLog('[DEBUG] Estado dos botÃµes apÃ³s login:', {
                                userRole: window.userRole,
                                usuarioAdmin: window.usuarioAdmin,
                                showCreateUserModal: typeof window.showCreateUserModal,
                                showManageUsersModal: typeof window.showManageUsersModal,
                                limparDadosTeste: typeof window.limparDadosTeste
                            });
                            
                            // Chamar funÃ§Ã£o de teste para debug
                            if (typeof window.testarBotoes === 'function') {
                                window.testarBotoes();
                            }
                            
                        }, 300);
                        
                        // Segunda verificaÃ§Ã£o para garantir configuraÃ§Ã£o
                        setTimeout(() => {
                            debugLog('[DEBUG] Segunda verificaÃ§Ã£o dos botÃµes...');
                            if (window.reconfigurarBotoes) {
                                window.reconfigurarBotoes();
                            }
                        }, 1000);
                        
                        // Carregar dados da aplicaÃ§Ã£o com timeout aumentado
                        debugLog('[DEBUG] Iniciando carregamento de solicitaÃ§Ãµes...');
                        setTimeout(async () => {
                            try {
                                await carregarSolicitacoes();
                                debugLog('[DEBUG] SolicitaÃ§Ãµes carregadas com sucesso');
                            } catch (error) {
                                console.error('[ERRO] Falha no carregamento de solicitaÃ§Ãµes:', error);
                                showToast('Erro', 'Falha ao carregar dados. Recarregue a pÃ¡gina.', 'error');
                            }
                        }, 500);
                        
                    } else {
                        debugLog('[DEBUG] UsuÃ¡rio sem permissÃµes - mantendo na tela de login');
                        // UsuÃ¡rio autenticado mas sem permissÃµes - manter na tela de login
                        const authSection = document.getElementById('auth-section');
                        const adminPanel = document.getElementById('admin-panel');
                        if (authSection) authSection.classList.remove('hidden');
                        if (adminPanel) adminPanel.classList.add('hidden');
                        
                        // Fazer logout automÃ¡tico do usuÃ¡rio nÃ£o autorizado
                        setTimeout(() => {
                            window.auth.signOut();
                        }, 2000);
                    }
                } else {
                    debugLog('[DEBUG] UsuÃ¡rio nÃ£o autenticado - resetando interface completa');
                    // UsuÃ¡rio nÃ£o autenticado - resetar interface completamente
                    
                    // Ocultar painÃ©is administrativos
                    const authSection2 = document.getElementById('auth-section');
                    const adminPanel2 = document.getElementById('admin-panel');
                    if (authSection2) authSection2.classList.remove('hidden');
                    if (adminPanel2) adminPanel2.classList.add('hidden');
                    
                    // Ocultar TODOS os painÃ©is de departamento
                    const teamsGrid = document.querySelector('.teams-grid');
                    if (teamsGrid) teamsGrid.classList.add('hidden');
                    
                    const allPanels = document.querySelectorAll('.team-panel, .department-card, [class*="card"]');
                    allPanels.forEach(panel => {
                        if (panel.classList) panel.classList.add('hidden');
                    });
                    
                    // Limpar dados do usuÃ¡rio
                    window.usuarioAdmin = null;
                    window.userRole = null;
                    window.userEmail = null;
                    localStorage.removeItem('usuarioAdmin');
                    
                    // Resetar formulÃ¡rio de login
                    const loginForm = document.getElementById('login-form');
                    if (loginForm) loginForm.reset();
                }
            } catch (authError) {
                console.error('[ERRO] Erro no listener de autenticaÃ§Ã£o:', authError);
                showToast('Erro', 'Erro na autenticaÃ§Ã£o. Tentando modo offline...', 'error');
            }
        });
    }
    // Corrige botÃ£o de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async function() {
            try {
                debugLog('[DEBUG] Iniciando processo de logout...');
                
                // Registrar logout em auditoria
                if (window.registrarLogAuditoria) {
                    window.registrarLogAuditoria('USER_LOGOUT', {
                        userId: window.usuarioAdmin?.uid || 'unknown',
                        userEmail: window.usuarioAdmin?.email || 'unknown'
                    });
                }
                
                // Fazer logout do Firebase
                await window.auth.signOut();
                
                // Usar funÃ§Ã£o de limpeza completa
                limparInterfaceCompleta();
                
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
                
                // Em caso de erro, forÃ§ar reload da pÃ¡gina
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
        console.warn('[AVISO] Erro de protocolo QUIC detectado - possÃ­vel problema de conectividade');
        // NÃ£o fazer logout automÃ¡tico, apenas registrar
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
        debugLog('[DEBUG] handleLogin: login iniciado...');
        event.preventDefault();
        const senha = document.getElementById('login-password').value;
        
        if (!email || !senha) {
            showToast('Erro', 'Preencha email e senha.', 'error');
            console.warn('[AVISO] handleLogin: email ou senha nÃ£o preenchidos!');
            if (window.registrarLogAuditoria) {
                window.registrarLogAuditoria('LOGIN_ATTEMPT_INVALID', { email, motivo: 'Campos vazios' });
            }
            return;
        }
        
        // Verificar tentativas de login
        if (window.verificarTentativasLogin) {
            window.verificarTentativasLogin(email);
        }
        
        debugLog('[DEBUG] Tentando login com email:', email);
        
        // Verificar se Firebase estÃ¡ disponÃ­vel
        if (!window.auth) {
            console.error('[ERRO] Firebase Auth nÃ£o disponÃ­vel');
            showToast('Erro', 'Sistema de autenticaÃ§Ã£o nÃ£o disponÃ­vel. Ativando modo desenvolvimento...', 'warning');
            if (window.registrarLogAuditoria) {
                window.registrarLogAuditoria('FIREBASE_AUTH_ERROR', { email });
            }
            // Ativar modo desenvolvimento
            setTimeout(() => {
                window.loginDesenvolvimento(email);
            }, 1000);
            return;
        }
        
        const userCredential = await window.auth.signInWithEmailAndPassword(email, senha);
        showToast('Sucesso', 'Login realizado!', 'success');
        debugLog('[DEBUG] handleLogin: login realizado com sucesso!');
        
        // Registrar login bem-sucedido
        if (window.registrarTentativaLogin) {
            window.registrarTentativaLogin(email, true);
        }
        
        // Oculta tela de login e mostra painel principal
        document.getElementById('auth-section')?.classList.add('hidden');
        
        // Atualiza badge do menu imediatamente
        const badge = document.getElementById('user-role-badge');
        if (badge) {
            // Exibe o papel correto do usuÃ¡rio
            if (window.usuarioAdmin && window.usuarioAdmin.role === 'super_admin') {
                badge.textContent = 'Super Administrador';
            } else if (window.usuarioAdmin && window.usuarioAdmin.role === 'admin') {
                badge.textContent = 'Administrador';
            } else {
                badge.textContent = 'Equipe';
            }
        }
        
        // Exibe loader dentro do painel principal
        const painel = document.getElementById('admin-panel');
        let loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = `<div class='loader-spinner'></div> <span>Carregando...</span>`;
        painel.appendChild(loader);
        window._mainLoader = loader;
        
        // NÃƒO chamar mostrarSecaoPainel aqui - serÃ¡ chamado pelo onAuthStateChanged
        debugLog('[DEBUG] Login concluÃ­do, aguardando onAuthStateChanged carregar dados do usuÃ¡rio...');
        
    } catch (error) {
        console.error('[ERRO] handleLogin: falha no login:', error);
        
        // Registrar tentativa de login falhada
        if (window.registrarTentativaLogin) {
            window.registrarTentativaLogin(email, false);
        }
        
        // Registrar log de auditoria detalhado
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('LOGIN_FAILED', { 
                email, 
                errorCode: error.code, 
                errorMessage: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // Tratamento especÃ­fico de diferentes tipos de erro
        let mensagemErro = 'Erro desconhecido no login';
        
        if (error.code === 'auth/invalid-login-credentials' || 
            error.code === 'auth/user-not-found' || 
            error.code === 'auth/wrong-password') {
            mensagemErro = 'Email ou senha incorretos';
        } else if (error.code === 'auth/too-many-requests') {
            mensagemErro = 'Muitas tentativas. Tente novamente mais tarde';
        } else if (error.code === 'auth/network-request-failed') {
            mensagemErro = 'Erro de conexÃ£o. Verifique sua internet';
        } else if (error.code === 'auth/invalid-email') {
            mensagemErro = 'Email invÃ¡lido';
        }
        
        showToast('Erro de Login', mensagemErro, 'error');
        console.warn('[AVISO] handleLogin: erro detalhado:', { 
            code: error.code, 
            message: error.message,
            email: email
        });
        let mostrarModoDesenvolvimento = false;
        
        if (error.code) {
            switch (error.code) {
                case 'auth/invalid-login-credentials':
                    mensagemErro = 'Email ou senha incorretos. Verifique suas credenciais.';
                    mostrarModoDesenvolvimento = true;
                    break;
                case 'auth/user-not-found':
                    mensagemErro = 'UsuÃ¡rio nÃ£o encontrado. Verifique o email.';
                    mostrarModoDesenvolvimento = true;
                    break;
                case 'auth/wrong-password':
                    mensagemErro = 'Senha incorreta.';
                    break;
                case 'auth/invalid-email':
                    mensagemErro = 'Email invÃ¡lido.';
                    break;
                case 'auth/user-disabled':
                    mensagemErro = 'Conta desabilitada. Entre em contato com o administrador.';
                    break;
                case 'auth/too-many-requests':
                    mensagemErro = 'Muitas tentativas de login. Tente novamente mais tarde.';
                    break;
                case 'auth/network-request-failed':
                    mensagemErro = 'Erro de rede. Verifique sua conexÃ£o.';
                    mostrarModoDesenvolvimento = true;
                    break;
                default:
                    mensagemErro = `Erro de autenticaÃ§Ã£o: ${error.code}`;
                    mostrarModoDesenvolvimento = true;
            }
        } else if (error.message) {
            mensagemErro = error.message;
            mostrarModoDesenvolvimento = true;
        }
        
        showToast('Erro', mensagemErro, 'error');
        
        // Se hÃ¡ problemas de conectividade ou credenciais, oferecer modo desenvolvimento
        if (mostrarModoDesenvolvimento) {
            setTimeout(() => {
                const email = document.getElementById('login-email').value;
                if (email && confirm('Erro de autenticaÃ§Ã£o detectado. Deseja ativar o modo desenvolvimento? (Funcionalidade limitada)')) {
                    window.loginDesenvolvimento(email);
                }
            }, 2000);
        }
    }
}
window.carregarSolicitacoesAgrupadas = async function() {
    // Verificar se usuÃ¡rio estÃ¡ logado e dados carregados antes de prosseguir
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    if (!usuarioAdmin || !usuarioAdmin.uid || !usuarioAdmin.email) {
        console.warn('[AVISO] carregarSolicitacoesAgrupadas: usuÃ¡rio nÃ£o completamente logado, ignorando chamada...');
        return;
    }

    // Chama a funÃ§Ã£o que atualiza os cards de mÃ©tricas e equipes
    await carregarSolicitacoes();
}

window.showCreateUserModal = function() {
    debugLog('[DEBUG] showCreateUserModal: iniciando...');
    
    // Debug completo do estado atual
    window.debugModals();
    
    // Verifica se o usuÃ¡rio estÃ¡ autenticado e tem permissÃµes
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    debugLog('[DEBUG] showCreateUserModal: usuarioAdmin:', usuarioAdmin);
    debugLog('[DEBUG] showCreateUserModal: userRole:', userRole);
    
    // Permite APENAS para super_admin
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem criar usuÃ¡rios.', 'error');
        console.warn('[AVISO] showCreateUserModal: acesso negado, role:', userRole);
        return;
    }
    
    // Busca o modal
    const modal = document.getElementById('modal-novo-usuario');
    debugLog('[DEBUG] showCreateUserModal: modal encontrado:', !!modal);
    
    if (modal) {
        debugLog('[DEBUG] showCreateUserModal: exibindo modal');
        
        // Garantir que o modal esteja anexado ao body
        if (modal.parentElement !== document.body) {
            debugLog('[DEBUG] showCreateUserModal: modal nÃ£o estÃ¡ no body, movendo...');
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
        
        // Configurar botÃ£o cancelar
        const btnCancelar = document.getElementById('btn-cancelar-novo-usuario');
        if (btnCancelar) {
            btnCancelar.onclick = function() {
                debugLog('[DEBUG] BotÃ£o cancelar clicado - fechando modal');
                window.closeCreateUserModal();
            };
        }
        
        // Configurar submit do formulÃ¡rio
        const form = document.getElementById('form-novo-usuario');
        if (form) {
            form.onsubmit = async function(e) {
                e.preventDefault();
                debugLog('[DEBUG] Form submit interceptado');
                await window.criarNovoUsuario();
            };
        }
        
        // Focar no primeiro campo apÃ³s um delay
        setTimeout(() => {
            const tipoField = document.getElementById('usuario-tipo');
            if (tipoField) {
                tipoField.focus();
                debugLog('[DEBUG] showCreateUserModal: foco definido no campo tipo');
            }
        }, 200);
        
        debugLog('[DEBUG] showCreateUserModal: modal exibido com sucesso');
    } else {
        console.error('[ERRO] Modal de criaÃ§Ã£o de usuÃ¡rio nÃ£o encontrado no DOM!');
        alert('Erro: Modal de criaÃ§Ã£o de usuÃ¡rio nÃ£o encontrado!');
    }
};

// FunÃ§Ã£o para criar novo usuÃ¡rio (equipe ou admin)
window.criarNovoUsuario = async function() {
    debugLog('[DEBUG] criarNovoUsuario: iniciando...');
    
    try {
        // Verificar permissÃµes
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const userRole = window.userRole || usuarioAdmin.role;
        
        if (!userRole || userRole !== 'super_admin') {
            showToast('Erro', 'Acesso negado. Apenas super administradores podem criar usuÃ¡rios.', 'error');
            return;
        }
        
        // Obter dados do formulÃ¡rio
        const tipo = document.getElementById('usuario-tipo').value;
        const nome = document.getElementById('usuario-nome').value.trim();
        const email = document.getElementById('usuario-email').value.trim();
        const senha = document.getElementById('usuario-senha').value;
        const equipe = document.getElementById('usuario-equipe').value;
        
        debugLog('[DEBUG] Dados do formulÃ¡rio:', { tipo, nome, email, senha: senha.length, equipe });
        
        // ValidaÃ§Ãµes
        if (!tipo) {
            showToast('Erro', 'Selecione o tipo de usuÃ¡rio.', 'error');
            return;
        }
        
        if (!nome || !email || !senha) {
            showToast('Erro', 'Preencha todos os campos obrigatÃ³rios.', 'error');
            return;
        }
        
        if (tipo === 'equipe' && !equipe) {
            showToast('Erro', 'Selecione a equipe para usuÃ¡rios de equipe.', 'error');
            return;
        }
        
        if (senha.length < 6) {
            showToast('Erro', 'A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }
        
        // Desabilitar botÃ£o durante criaÃ§Ã£o
        const btnSubmit = document.querySelector('#form-novo-usuario button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Criando...';
        }
        
        debugLog('[DEBUG] Criando usuÃ¡rio no Firebase Auth...');
        
        // Criar usuÃ¡rio no Firebase Auth
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        debugLog('[DEBUG] UsuÃ¡rio criado no Auth:', user.uid);
        
        // Preparar dados do usuÃ¡rio baseado no tipo
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
                    gerenciarSolicitacoes: true,       // Admin pode gerenciar solicitaÃ§Ãµes
                    gerenciarAcompanhantes: false,     // Apenas super_admin
                    verMetricas: true,                 // Admin pode ver mÃ©tricas
                    verPesquisaSatisfacao: true        // Admin pode ver pesquisa satisfaÃ§Ã£o
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
        }
        
        debugLog('[DEBUG] Salvando no Firestore - ColeÃ§Ã£o:', colecao);
        
        // Salvar no Firestore
        await window.db.collection(colecao).doc(user.uid).set(dadosUsuario);
        
        debugLog('[DEBUG] UsuÃ¡rio salvo com sucesso');
        
        showToast('Sucesso', `${tipo === 'admin' ? 'Administrador' : 'UsuÃ¡rio de equipe'} criado com sucesso!`, 'success');
        
        // Limpar formulÃ¡rio
        document.getElementById('form-novo-usuario').reset();
        document.getElementById('campo-equipe').style.display = 'none';
        
        // Fechar modal
        window.closeCreateUserModal();
        
        // Recarregar lista de usuÃ¡rios se estiver na tela de gerenciamento
        if (typeof window.carregarUsuarios === 'function') {
            setTimeout(() => window.carregarUsuarios(), 500);
        }
        
    } catch (error) {
        console.error('[ERRO] criarNovoUsuario:', error);
        
        let mensagem = 'Erro ao criar usuÃ¡rio: ' + error.message;
        
        if (error.code === 'auth/email-already-in-use') {
            mensagem = 'Este email jÃ¡ estÃ¡ sendo usado por outro usuÃ¡rio.';
        } else if (error.code === 'auth/invalid-email') {
            mensagem = 'Email invÃ¡lido.';
        } else if (error.code === 'auth/weak-password') {
            mensagem = 'Senha muito fraca (mÃ­nimo 6 caracteres).';
        }
        
        showToast('Erro', mensagem, 'error');
        
    } finally {
        // Reabilitar botÃ£o
        const btnSubmit = document.querySelector('#form-novo-usuario button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Criar UsuÃ¡rio';
        }
    }
};

window.showManageUsersModal = async function() {
    debugLog('[DEBUG] showManageUsersModal: iniciando...');
    
    // Debug completo do estado atual
    window.debugModals();
    
    // Verifica se o usuÃ¡rio estÃ¡ autenticado e tem permissÃµes
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    debugLog('[DEBUG] showManageUsersModal: usuarioAdmin:', usuarioAdmin);
    debugLog('[DEBUG] showManageUsersModal: userRole:', userRole);
    
    // Permite APENAS para super_admin
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem gerenciar usuÃ¡rios.', 'error');
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
        
        // Focar no modal apÃ³s um delay
        setTimeout(() => {
            modal.focus();
            debugLog('[DEBUG] showManageUsersModal: foco definido no modal');
        }, 200);
        
        // Carregar os usuÃ¡rios apÃ³s exibir o modal
        try {
            debugLog('[DEBUG] showManageUsersModal: carregando usuÃ¡rios...');
            await window.carregarUsuarios();
            debugLog('[DEBUG] showManageUsersModal: usuÃ¡rios carregados com sucesso');
        } catch (error) {
            console.error('[ERRO] showManageUsersModal: erro ao carregar usuÃ¡rios:', error);
            showToast('Erro', 'Erro ao carregar usuÃ¡rios.', 'error');
        }
        
        debugLog('[DEBUG] showManageUsersModal: modal exibido com sucesso');
    } else {
        console.error('[ERRO] Modal de gerenciamento de usuÃ¡rios nÃ£o encontrado no DOM!');
        alert('Erro: Modal de gerenciamento de usuÃ¡rios nÃ£o encontrado!');
    }
};

window.mostrarRelatorios = function() {
    try {
        debugLog('[DEBUG] ===== INÃCIO MOSTRAR RELATÃ“RIOS =====');
        
        // Verificar estado de autenticaÃ§Ã£o de forma mais robusta
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
            console.warn('[AVISO] mostrarRelatorios: tentando forÃ§ar role admin...');
            
            // Tentar forÃ§ar role admin como fallback
            if (isAuthenticated) {
                window.userRole = 'admin';
                debugLog('[DEBUG] mostrarRelatorios: role forÃ§ado para admin');
            } else {
                showToast('Erro', 'Acesso negado. FaÃ§a login novamente.', 'error');
                console.warn('[AVISO] mostrarRelatorios: usuÃ¡rio nÃ£o autenticado');
                return;
            }
        }
        
        debugLog('[DEBUG] mostrarRelatorios: acesso autorizado, configurando interface relatÃ³rios');
        
        // Mostrar interface de relatÃ³rios diretamente (sem chamar mostrarSecaoPainel recursivamente)
        // Ocultar outras seÃ§Ãµes
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
        
        // Mostrar painel admin com relatÃ³rios
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
        
        debugLog('[DEBUG] mostrarRelatorios: verificando se deve carregar solicitaÃ§Ãµes');
        
        // Gerar relatÃ³rio HTML completo em vez de apenas estatÃ­sticas
        debugLog('[DEBUG] mostrarRelatorios: gerando relatÃ³rio HTML...');
        
        // Gerar relatÃ³rio completo em vez de apenas carregar dados
        setTimeout(async () => {
            try {
                debugLog('[DEBUG] mostrarRelatorios: chamando gerarRelatorioAdmin...');
                
                // Chamar funÃ§Ã£o que gera relatÃ³rio HTML completo
                if (typeof window.gerarRelatorioAdmin === 'function') {
                    await window.gerarRelatorioAdmin();
                    debugLog('[DEBUG] mostrarRelatorios: relatÃ³rio HTML gerado com sucesso');
                } else {
                    console.error('[ERRO] mostrarRelatorios: funÃ§Ã£o gerarRelatorioAdmin nÃ£o encontrada');
                    // Fallback: carregar apenas dados bÃ¡sicos
                    if (typeof window.carregarSolicitacoes === 'function') {
                        window.carregarSolicitacoes();
                    }
                }
            } catch (error) {
                console.error('[ERRO] mostrarRelatorios: erro ao gerar relatÃ³rio:', error);
                showToast('Erro', 'Falha ao gerar relatÃ³rio', 'error');
            }
        }, 100);
        
        // Adicionar botÃµes de manutenÃ§Ã£o apenas para super_admin
        if (userRole === 'super_admin') {
            debugLog('[DEBUG] mostrarRelatorios: adicionando painel de manutenÃ§Ã£o...');
            
            // Verificar se a funÃ§Ã£o existe antes de chamar
            if (typeof window.adicionarPainelManutencao === 'function') {
                window.adicionarPainelManutencao();
            } else {
                console.warn('[AVISO] adicionarPainelManutencao nÃ£o estÃ¡ definida ainda - serÃ¡ chamada posteriormente');
                // Tentar novamente apÃ³s um pequeno delay
                setTimeout(() => {
                    if (typeof window.adicionarPainelManutencao === 'function') {
                        window.adicionarPainelManutencao();
                    } else {
                        console.error('[ERRO] adicionarPainelManutencao ainda nÃ£o estÃ¡ disponÃ­vel');
                    }
                }, 100);
            }
        } else {
            debugLog('[DEBUG] mostrarRelatorios: painel de manutenÃ§Ã£o nÃ£o adicionado (role nÃ£o Ã© super_admin)');
        }
        
        // Garantir que os botÃµes estejam configurados corretamente
        // Removido para evitar chamadas duplicadas - configuraÃ§Ã£o feita no login
        debugLog('[DEBUG] mostrarRelatorios: funÃ§Ã£o executada com sucesso');
        
        debugLog('[DEBUG] ===== FIM MOSTRAR RELATÃ“RIOS =====');
        
    } catch (error) {
        console.error('[ERRO] mostrarRelatorios: falha na execuÃ§Ã£o:', error);
        showToast('Erro', 'Erro ao carregar relatÃ³rios. Tente novamente.', 'error');
        
        // Em caso de erro, nÃ£o deixar o usuÃ¡rio em estado inconsistente
        setTimeout(() => {
            console.log('[RECOVERY] Tentando recuperar estado apÃ³s erro...');
            atualizarVisibilidadeBotoes();
            configurarEventosBotoes();
        }, 500);
    }
};

window.abrirAcompanhantesSection = function() {
    // Verificar se Ã© super_admin
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem gerenciar acompanhantes.', 'error');
        console.warn('[AVISO] abrirAcompanhantesSection: acesso negado, role:', userRole);
        return;
    }
    
    mostrarSecaoPainel('acompanhantes');
    if (typeof carregarAcompanhantes === 'function') carregarAcompanhantes();
};

window.voltarPainelPrincipal = function() {
    debugLog('[DEBUG] ===== VOLTANDO AO PAINEL PRINCIPAL =====');
    console.trace('[DEBUG] Stack trace do voltarPainelPrincipal:');
    
    mostrarSecaoPainel('painel');
    
    // Garantir que os botÃµes estejam configurados ao voltar ao painel
    setTimeout(() => {
        debugLog('[DEBUG] voltarPainelPrincipal: reconfigurando botÃµes...');
        atualizarVisibilidadeBotoes();
        configurarEventosBotoes();
    }, 100);
};

// --- Firestore: UsuÃ¡rios ---
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
        console.error('[USUARIOS] Elemento users-list nÃ£o encontrado!');
        console.log('[USUARIOS] Tentando encontrar elemento alternativo...');
        
        // Listar todos os elementos disponÃ­veis para debug
        const allElements = document.querySelectorAll('[id*="user"], [id*="list"], [class*="user"], [class*="list"]');
        console.log('[USUARIOS] Elementos relacionados encontrados:', Array.from(allElements).map(el => ({
            id: el.id,
            className: el.className,
            tagName: el.tagName
        })));
        
        return;
    }
    
    if (listaUsuarios.length === 0) {
        console.log('[USUARIOS] Nenhum usuÃ¡rio para exibir');
        usersList.innerHTML = `<div style='text-align:center; color:#6b7280; padding:2rem;'>Nenhum usuÃ¡rio cadastrado.</div>`;
        if (totalCount) totalCount.textContent = '0';
        return;
    }
    
    console.log('[USUARIOS] Criando HTML para', listaUsuarios.length, 'usuÃ¡rios');
    const htmlContent = listaUsuarios.map(user => `
        <div class='user-row' style='display:flex; align-items:center; gap:1.5rem; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04); padding:1rem 2rem;'>
            <span style='font-weight:600; color:#374151;'>${user.nome || 'Nome nÃ£o informado'}</span>
            <span style='color:#2563eb;'>${user.departamento || user.equipe || '-'}</span>
            <span style='color:#f59e0b;'>${user.tipo || '-'}</span>
            <span style='color:#6b7280;'>${user.email || 'Email nÃ£o informado'}</span>
            <button onclick="editarUsuario('${user.id}')" style='background:#6366f1; color:#fff; border:none; border-radius:8px; padding:6px 16px; cursor:pointer;'>Editar</button>
            <button onclick="removerUsuario('${user.id}')" style='background:#ef4444; color:#fff; border:none; border-radius:8px; padding:6px 16px; cursor:pointer;'>Remover</button>
        </div>
    `).join('');
    
    console.log('[USUARIOS] HTML criado, inserindo no DOM...');
    usersList.innerHTML = htmlContent;
    
    if (totalCount) {
        totalCount.textContent = listaUsuarios.length;
        console.log('[USUARIOS] Total atualizado para:', listaUsuarios.length);
    }
    
    console.log('[USUARIOS] ===== TABELA PREENCHIDA COM SUCESSO =====');
};
window.carregarUsuarios = async function() {
    console.log('[USUARIOS] ===== INICIANDO CARREGAMENTO =====');
    console.log('[USUARIOS] Timestamp:', new Date().toLocaleString());
    debugLog('[DEBUG] carregarUsuarios: iniciando (APENAS equipe e admin)...');
    
    if (!window.db) {
        console.error('[USUARIOS] Firestore nÃ£o inicializado!');
        showToast('Erro', 'Firestore nÃ£o inicializado!', 'error');
        return false;
    }
    
    // Teste de conectividade bÃ¡sico
    console.log('[USUARIOS] Testando conectividade Firestore...');
    
    try {
        console.log('[USUARIOS] Estado da autenticaÃ§Ã£o:', {
            currentUser: !!window.auth?.currentUser,
            userEmail: window.auth?.currentUser?.email,
            usuarioAdmin: !!window.usuarioAdmin,
            userRole: window.userRole
        });
        
        // Busca usuÃ¡rios de equipe
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
            console.log('[USUARIOS] UsuÃ¡rio equipe encontrado:', userData);
        });
        console.log('[USUARIOS] Total equipe encontrados:', listaEquipe.length);
        debugLog('[DEBUG] carregarUsuarios: encontrados', listaEquipe.length, 'usuÃ¡rios de equipe');
        
        // Busca usuÃ¡rios admin
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
            console.log('[USUARIOS] UsuÃ¡rio admin encontrado:', userData);
        });
        console.log('[USUARIOS] Total admin encontrados:', listaAdmin.length);
        debugLog('[DEBUG] carregarUsuarios: encontrados', listaAdmin.length, 'usuÃ¡rios admin');
        
        // Junta APENAS equipe e admin (SEM acompanhantes)
        const listaUsuarios = [...listaEquipe, ...listaAdmin];
        console.log('[USUARIOS] LISTA FINAL:', listaUsuarios);
        console.log('[USUARIOS] TOTAL GERAL:', listaUsuarios.length);
        debugLog('[DEBUG] carregarUsuarios: total de usuÃ¡rios para tabela:', listaUsuarios.length);
        
        window.preencherTabelaUsuarios(listaUsuarios);
        console.log('[USUARIOS] ===== CARREGAMENTO CONCLUÃDO =====');
        console.log('[SUCCESS] UsuÃ¡rios de equipe e admin carregados:', listaUsuarios);
        return true;
        
    } catch (error) {
        console.error('[USUARIOS] ===== ERRO NO CARREGAMENTO =====');
        console.error('[ERRO] carregarUsuarios:', error);
        console.error('[ERRO] Stack trace:', error.stack);
        showToast('Erro', 'NÃ£o foi possÃ­vel carregar os usuÃ¡rios: ' + error.message, 'error');
        return false;
    }
};

// === FUNÃ‡ÃƒO DE TESTE MANUAL PARA DEBUG ===
window.testarCarregamentoUsuarios = function() {
    console.log('ðŸ”¬ [TESTE] ===== TESTE MANUAL CARREGAMENTO USUÃRIOS =====');
    console.log('ðŸ”¬ [TESTE] Para usar: digite window.testarCarregamentoUsuarios() no console');
    
    // Primeiro testar se as funÃ§Ãµes existem
    console.log('ðŸ”¬ [TESTE] FunÃ§Ãµes disponÃ­veis:', {
        carregarUsuarios: typeof window.carregarUsuarios,
        preencherTabelaUsuarios: typeof window.preencherTabelaUsuarios,
        db: !!window.db,
        auth: !!window.auth,
        currentUser: !!window.auth?.currentUser
    });
    
    // Testar conexÃ£o com Firestore
    if (window.db) {
        console.log('ðŸ”¬ [TESTE] Testando conexÃ£o simples com Firestore...');
        
        window.db.collection('usuarios_equipe').limit(1).get()
            .then(snap => {
                console.log('ðŸ”¬ [TESTE] âœ… ConexÃ£o usuarios_equipe OK - encontrou:', snap.size, 'documentos');
                
                return window.db.collection('usuarios_admin').limit(1).get();
            })
            .then(snap => {
                console.log('ðŸ”¬ [TESTE] âœ… ConexÃ£o usuarios_admin OK - encontrou:', snap.size, 'documentos');
                
                // Agora executar carregamento completo
                console.log('ðŸ”¬ [TESTE] Executando carregamento completo...');
                return window.carregarUsuarios();
            })
            .then(resultado => {
                console.log('ðŸ”¬ [TESTE] âœ… Resultado final:', resultado);
            })
            .catch(error => {
                console.error('ðŸ”¬ [TESTE] âŒ Erro:', error);
                console.error('ðŸ”¬ [TESTE] âŒ Stack:', error.stack);
            });
    } else {
        console.error('ðŸ”¬ [TESTE] âŒ Firestore nÃ£o disponÃ­vel!');
    }
};

// FunÃ§Ã£o especÃ­fica para verificar usuÃ¡rios existentes
window.verificarUsuariosExistentes = async function() {
    console.log('ðŸ‘¥ [VERIFICAR] ===== VERIFICANDO USUÃRIOS EXISTENTES =====');
    
    if (!window.db) {
        console.error('ðŸ‘¥ [VERIFICAR] âŒ Firestore nÃ£o disponÃ­vel');
        return;
    }
    
    try {
        console.log('ðŸ‘¥ [VERIFICAR] Verificando usuarios_equipe...');
        const equipeSnap = await window.db.collection('usuarios_equipe').get();
        console.log('ðŸ‘¥ [VERIFICAR] usuarios_equipe:', equipeSnap.size, 'documentos');
        
        console.log('ðŸ‘¥ [VERIFICAR] Verificando usuarios_admin...');
        const adminSnap = await window.db.collection('usuarios_admin').get();
        console.log('ðŸ‘¥ [VERIFICAR] usuarios_admin:', adminSnap.size, 'documentos');
        
        // Verificar permissÃµes antes de tentar acessar usuarios_acompanhantes
        const user = window.auth.currentUser;
        let acompanhantesCount = 0;
        
        if (user) {
            try {
                const userData = await window.verificarUsuarioAdminJS(user);
                if (userData && (userData.role === 'super_admin' || userData.role === 'admin')) {
                    console.log('ðŸ‘¥ [VERIFICAR] Verificando usuarios_acompanhantes...');
                    const acompSnap = await window.db.collection('usuarios_acompanhantes').get();
                    acompanhantesCount = acompSnap.size;
                    console.log('ðŸ‘¥ [VERIFICAR] usuarios_acompanhantes:', acompanhantesCount, 'documentos');
                } else {
                    console.log('ðŸ‘¥ [VERIFICAR] âš ï¸ UsuÃ¡rio sem permissÃ£o para acessar usuarios_acompanhantes');
                }
            } catch (permError) {
                console.log('ðŸ‘¥ [VERIFICAR] âš ï¸ Erro de permissÃ£o ao acessar usuarios_acompanhantes:', permError.message);
            }
        }
        
        const total = equipeSnap.size + adminSnap.size + acompanhantesCount;
        console.log('ðŸ‘¥ [VERIFICAR] âœ… TOTAL GERAL:', total, 'usuÃ¡rios no sistema');
        
        return {
            equipe: equipeSnap.size,
            admin: adminSnap.size,
            acompanhantes: acompanhantesCount,
            total: total
        };
        
    } catch (error) {
        console.error('ðŸ‘¥ [VERIFICAR] âŒ Erro:', error);
    }
};

// === FUNÃ‡Ã•ES DE GERENCIAMENTO DE USUÃRIOS ===

// FunÃ§Ã£o para editar usuÃ¡rio
window.editarUsuario = async function(userId) {
    debugLog('[DEBUG] Editando usuÃ¡rio:', userId);
    
    if (!userId) {
        showToast('Erro', 'ID do usuÃ¡rio nÃ£o fornecido', 'error');
        return;
    }
    
    try {
        // Verificar permissÃµes
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
            showToast('Erro', 'Apenas super administradores podem editar usuÃ¡rios', 'error');
            return;
        }
        
        // Buscar o usuÃ¡rio nas diferentes coleÃ§Ãµes
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
            debugLog('[DEBUG] UsuÃ¡rio nÃ£o encontrado em usuarios_equipe');
        }
        
        // Tentar em usuarios_admin se nÃ£o encontrou
        if (!userData) {
            try {
                const adminDoc = await window.db.collection('usuarios_admin').doc(userId).get();
                if (adminDoc.exists) {
                    userData = { id: adminDoc.id, ...adminDoc.data() };
                    userCollection = 'usuarios_admin';
                }
            } catch (error) {
                debugLog('[DEBUG] UsuÃ¡rio nÃ£o encontrado em usuarios_admin');
            }
        }
        
        // Tentar em usuarios_acompanhantes se nÃ£o encontrou (somente para super_admin e admin)
        if (!userData && (usuarioAdmin.role === 'super_admin' || usuarioAdmin.role === 'admin')) {
            try {
                const acompDoc = await window.db.collection('usuarios_acompanhantes').doc(userId).get();
                if (acompDoc.exists) {
                    userData = { id: acompDoc.id, ...acompDoc.data() };
                    userCollection = 'usuarios_acompanhantes';
                }
            } catch (error) {
                debugLog('[DEBUG] UsuÃ¡rio nÃ£o encontrado em usuarios_acompanhantes ou sem permissÃ£o');
            }
        }
        
        if (!userData) {
            showToast('Erro', 'UsuÃ¡rio nÃ£o encontrado', 'error');
            return;
        }
        
        // Criar modal de ediÃ§Ã£o
        const editModal = document.createElement('div');
        editModal.id = 'edit-user-modal';
        editModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 100000; display: flex;
            align-items: center; justify-content: center;
        `;
        
        editModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; color: #374151;">Editar UsuÃ¡rio</h3>
                
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
                
                ${userCollection === 'usuarios_equipe' ? `
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Departamento:</label>
                    <select id="edit-departamento" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="manutencao" ${userData.departamento === 'manutencao' ? 'selected' : ''}>ManutenÃ§Ã£o</option>
                        <option value="nutricao" ${userData.departamento === 'nutricao' ? 'selected' : ''}>NutriÃ§Ã£o</option>
                        <option value="higienizacao" ${userData.departamento === 'higienizacao' ? 'selected' : ''}>HigienizaÃ§Ã£o</option>
                        <option value="hotelaria" ${userData.departamento === 'hotelaria' ? 'selected' : ''}>Hotelaria</option>
                    </select>
                </div>
                ` : ''}
                
                ${userCollection === 'usuarios_admin' ? `
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Tipo de Acesso:</label>
                    <select id="edit-role" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="super_admin" ${userData.role === 'super_admin' ? 'selected' : ''}>Super Administrador</option>
                        <option value="admin" ${userData.role === 'admin' ? 'selected' : ''}>Administrador</option>
                        <option value="equipe" ${userData.role === 'equipe' ? 'selected' : ''}>Equipe</option>
                    </select>
                </div>
                ` : ''}
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button onclick="abrirModalAlterarSenha('${userId}', '${userCollection}')" 
                            style="padding: 8px 16px; border: 1px solid #f59e0b; background: #fef3c7; color: #92400e; border-radius: 6px; cursor: pointer;">
                        ðŸ”‘ Alterar Senha
                    </button>
                    <button onclick="fecharModalEditarUsuario()" 
                            style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 6px; cursor: pointer;">
                        Cancelar
                    </button>
                    <button onclick="salvarUsuarioEditado('${userId}', '${userCollection}')" 
                            style="padding: 8px 16px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer;">
                        Salvar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
        
    } catch (error) {
        console.error('[ERRO] Falha ao editar usuÃ¡rio:', error);
        showToast('Erro', 'NÃ£o foi possÃ­vel carregar dados do usuÃ¡rio', 'error');
    }
};

// FunÃ§Ã£o para fechar modal de ediÃ§Ã£o
window.fecharModalEditarUsuario = function() {
    const modal = document.getElementById('edit-user-modal');
    if (modal) {
        modal.remove();
    }
};

// FunÃ§Ã£o para salvar usuÃ¡rio editado
window.salvarUsuarioEditado = async function(userId, collection) {
    try {
        const nome = document.getElementById('edit-nome').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        
        if (!nome || !email) {
            showToast('Erro', 'Nome e email sÃ£o obrigatÃ³rios', 'error');
            return;
        }
        
        const updateData = { nome, email };
        
        // Adicionar campos especÃ­ficos da coleÃ§Ã£o
        if (collection === 'usuarios_equipe') {
            const departamento = document.getElementById('edit-departamento').value;
            updateData.departamento = departamento;
            updateData.equipe = departamento; // Para compatibilidade
        } else if (collection === 'usuarios_admin') {
            const role = document.getElementById('edit-role').value;
            updateData.role = role;
        }
        
        // Atualizar no Firestore
        await window.db.collection(collection).doc(userId).update(updateData);
        
        showToast('Sucesso', 'UsuÃ¡rio atualizado com sucesso', 'success');
        
        // Fechar modal e recarregar lista
        fecharModalEditarUsuario();
        await window.carregarUsuarios();
        
        // Registrar auditoria
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('USER_EDIT', {
                userId,
                collection,
                updateData: Object.keys(updateData)
            });
        }
        
    } catch (error) {
        console.error('[ERRO] Falha ao salvar usuÃ¡rio:', error);
        showToast('Erro', 'NÃ£o foi possÃ­vel salvar as alteraÃ§Ãµes', 'error');
    }
};

// ===== FUNÃ‡Ã•ES DE ALTERAÃ‡ÃƒO DE SENHA =====

// FunÃ§Ã£o para abrir modal de alteraÃ§Ã£o de senha (Admin alterando senha de outros usuÃ¡rios)
window.abrirModalAlterarSenha = async function(userId, collection) {
    try {
        // Verificar se Ã© super admin
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
            showToast('Erro', 'Apenas super administradores podem alterar senhas', 'error');
            return;
        }

        // Buscar dados do usuÃ¡rio para exibir nome/email
        let userData = null;
        const doc = await window.db.collection(collection).doc(userId).get();
        if (doc.exists) {
            userData = doc.data();
        } else {
            showToast('Erro', 'UsuÃ¡rio nÃ£o encontrado', 'error');
            return;
        }

        // Criar modal de alteraÃ§Ã£o de senha
        const senhaModal = document.createElement('div');
        senhaModal.id = 'alterar-senha-modal';
        senhaModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 100001; display: flex;
            align-items: center; justify-content: center;
        `;
        
        senhaModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 24px; max-width: 450px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <span style="font-size: 24px; margin-right: 12px;">ðŸ”‘</span>
                    <h3 style="margin: 0; color: #374151;">Alterar Senha do UsuÃ¡rio</h3>
                </div>
                
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>UsuÃ¡rio:</strong> ${userData.nome}</p>
                    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong> ${userData.email}</p>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; color: #374151; font-weight: 500;">Nova Senha:</label>
                    <input type="password" id="nova-senha-admin" placeholder="Digite a nova senha" 
                           style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                    <small style="color: #6b7280; font-size: 12px;">MÃ­nimo de 6 caracteres</small>
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
                        ðŸ”‘ Alterar Senha
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
        console.error('[ERRO] Erro ao abrir modal de alteraÃ§Ã£o de senha:', error);
        showToast('Erro', 'Erro interno. Tente novamente.', 'error');
    }
};

// FunÃ§Ã£o para confirmar alteraÃ§Ã£o de senha pelo admin
window.confirmarAlteracaoSenhaAdmin = async function(userId, userEmail) {
    try {
        const novaSenha = document.getElementById('nova-senha-admin').value;
        const confirmarSenha = document.getElementById('confirmar-senha-admin').value;
        
        // ValidaÃ§Ãµes
        if (!novaSenha || !confirmarSenha) {
            showToast('Erro', 'Preencha todos os campos', 'error');
            return;
        }
        
        if (novaSenha.length < 6) {
            showToast('Erro', 'A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }
        
        if (novaSenha !== confirmarSenha) {
            showToast('Erro', 'As senhas nÃ£o coincidem', 'error');
            return;
        }

        // Confirmar aÃ§Ã£o
        const confirmacao = confirm(`ATENÃ‡ÃƒO: VocÃª estÃ¡ alterando a senha do usuÃ¡rio!\n\nEmail: ${userEmail}\n\nEsta aÃ§Ã£o nÃ£o pode ser desfeita. Confirma?`);
        if (!confirmacao) return;

        // Desabilitar botÃ£o para evitar cliques duplos
        const botao = event.target;
        botao.disabled = true;
        botao.textContent = 'Alterando...';

        // Usar Firebase Admin SDK via Cloud Function para alterar senha
        // Como nÃ£o temos acesso direto ao Admin SDK no frontend, vamos usar um mÃ©todo alternativo
        
        // MÃ‰TODO: Enviar email de redefiniÃ§Ã£o de senha
        await window.auth.sendPasswordResetEmail(userEmail);
        
        showToast('Sucesso', `Email de redefiniÃ§Ã£o de senha enviado para ${userEmail}. O usuÃ¡rio deve verificar a caixa de entrada.`, 'success');
        
        // Registrar na auditoria
        if (window.registrarLogAuditoria) {
            window.registrarLogAuditoria('PASSWORD_RESET_SENT', {
                targetUserId: userId,
                targetUserEmail: userEmail,
                method: 'admin_initiated'
            });
        }
        
        fecharModalAlterarSenha();
        
    } catch (error) {
        console.error('[ERRO] Erro ao alterar senha:', error);
        
        let mensagem = 'Erro ao alterar senha. Tente novamente.';
        if (error.code === 'auth/user-not-found') {
            mensagem = 'UsuÃ¡rio nÃ£o encontrado no Firebase Authentication.';
        } else if (error.code === 'auth/invalid-email') {
            mensagem = 'Email invÃ¡lido.';
        }
        
        showToast('Erro', mensagem, 'error');
        
        // Reabilitar botÃ£o
        const botao = event.target;
        botao.disabled = false;
        botao.textContent = 'ðŸ”‘ Alterar Senha';
    }
};

// FunÃ§Ã£o para fechar modal de alteraÃ§Ã£o de senha
window.fecharModalAlterarSenha = function() {
    const modal = document.getElementById('alterar-senha-modal');
    if (modal) {
        modal.remove();
    }
};

// FunÃ§Ã£o para o prÃ³prio usuÃ¡rio alterar sua senha
window.abrirMinhaSenha = function() {
    // Criar modal para o usuÃ¡rio logado alterar sua prÃ³pria senha
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
                <span style="font-size: 24px; margin-right: 12px;">ðŸ”</span>
                <h3 style="margin: 0; color: #374151;">Alterar Minha Senha</h3>
            </div>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>UsuÃ¡rio:</strong> ${usuarioLogado.nome}</p>
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
                <small style="color: #6b7280; font-size: 12px;">MÃ­nimo de 6 caracteres</small>
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
                    ðŸ” Alterar Minha Senha
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

// FunÃ§Ã£o para alterar a prÃ³pria senha
window.alterarMinhaSenha = async function() {
    try {
        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha-propria').value;
        const confirmarSenha = document.getElementById('confirmar-nova-senha-propria').value;
        
        // ValidaÃ§Ãµes
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            showToast('Erro', 'Preencha todos os campos', 'error');
            return;
        }
        
        if (novaSenha.length < 6) {
            showToast('Erro', 'A nova senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }
        
        if (novaSenha !== confirmarSenha) {
            showToast('Erro', 'A nova senha e a confirmaÃ§Ã£o nÃ£o coincidem', 'error');
            return;
        }
        
        if (senhaAtual === novaSenha) {
            showToast('Erro', 'A nova senha deve ser diferente da senha atual', 'error');
            return;
        }

        // Desabilitar botÃ£o para evitar cliques duplos
        const botao = event.target;
        botao.disabled = true;
        botao.textContent = 'Alterando...';

        const user = window.auth.currentUser;
        if (!user) {
            throw new Error('UsuÃ¡rio nÃ£o autenticado');
        }

        // Reautenticar o usuÃ¡rio com a senha atual
        const credential = window.auth.EmailAuthProvider.credential(user.email, senhaAtual);
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
        
        // Opcional: Fazer logout forÃ§ado para relogin com nova senha
        // setTimeout(() => {
        //     window.auth.signOut();
        // }, 2000);
        
    } catch (error) {
        console.error('[ERRO] Erro ao alterar senha:', error);
        
        let mensagem = 'Erro ao alterar senha. Tente novamente.';
        if (error.code === 'auth/wrong-password') {
            mensagem = 'Senha atual incorreta.';
        } else if (error.code === 'auth/weak-password') {
            mensagem = 'A nova senha Ã© muito fraca. Use pelo menos 6 caracteres.';
        } else if (error.code === 'auth/requires-recent-login') {
            mensagem = 'Por seguranÃ§a, faÃ§a login novamente antes de alterar a senha.';
        }
        
        showToast('Erro', mensagem, 'error');
        
        // Reabilitar botÃ£o
        const botao = event.target;
        botao.disabled = false;
        botao.textContent = 'ðŸ” Alterar Minha Senha';
    }
};

// FunÃ§Ã£o para fechar modal da prÃ³pria senha
window.fecharModalMinhaSenha = function() {
    const modal = document.getElementById('minha-senha-modal');
    if (modal) {
        modal.remove();
    }
};

// FunÃ§Ã£o para remover usuÃ¡rio
window.removerUsuario = async function(userId) {
    debugLog('[DEBUG] Removendo usuÃ¡rio:', userId);
    
    if (!userId) {
        showToast('Erro', 'ID do usuÃ¡rio nÃ£o fornecido', 'error');
        return;
    }
    
    // Verificar permissÃµes
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
        showToast('Erro', 'Apenas super administradores podem remover usuÃ¡rios', 'error');
        return;
    }
    
    // Confirmar remoÃ§Ã£o
    if (!confirm('Tem certeza que deseja remover este usuÃ¡rio? Esta aÃ§Ã£o nÃ£o pode ser desfeita.')) {
        return;
    }
    
    try {
        // Buscar e remover o usuÃ¡rio nas diferentes coleÃ§Ãµes
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
                console.log(`[DEBUG] UsuÃ¡rio nÃ£o encontrado em ${collection}`);
            }
        }
        
        if (removido) {
            showToast('Sucesso', 'UsuÃ¡rio removido com sucesso', 'success');
            await window.carregarUsuarios(); // Recarregar lista
        } else {
            showToast('Erro', 'UsuÃ¡rio nÃ£o encontrado', 'error');
        }
        
    } catch (error) {
        console.error('[ERRO] Falha ao remover usuÃ¡rio:', error);
        showToast('Erro', 'NÃ£o foi possÃ­vel remover o usuÃ¡rio', 'error');
    }
};

// --- Firestore: SolicitaÃ§Ãµes & RenderizaÃ§Ã£o dos Cards ---

// Sistema de debounce para evitar chamadas mÃºltiplas
let carregandoSolicitacoes = false;
let timeoutRecarregar = null;

async function carregarSolicitacoes() {
    // Verificar se jÃ¡ estÃ¡ carregando para evitar loops
    if (window.carregandoSolicitacoes) {
        console.log('[DEBUG] carregarSolicitacoes jÃ¡ estÃ¡ executando, ignorando...');
        return;
    }
    
    // Limpar qualquer interval de auto-update ativo
    if (window.autoUpdateInterval) {
        console.log('[DEBUG] Limpando interval de auto-update ativo...');
        clearInterval(window.autoUpdateInterval);
        window.autoUpdateInterval = null;
    }
    
    window.carregandoSolicitacoes = true;
    
    // Verificar se estamos na tela de relatÃ³rios - se sim, nÃ£o carregar cards
    const relatoriosSection = document.getElementById('relatorios-section');
    const adminPanel = document.getElementById('admin-panel');
    
    if (relatoriosSection && !relatoriosSection.classList.contains('hidden')) {
        debugLog('[DEBUG] carregarSolicitacoes: Na tela de relatÃ³rios - nÃ£o carregando cards de solicitaÃ§Ãµes');
        window.carregandoSolicitacoes = false;
        return;
    }
    
    // Evitar chamadas mÃºltiplas simultÃ¢neas
    if (carregandoSolicitacoes) {
        debugLog('[DEBUG] Carregamento jÃ¡ em andamento - aguardando...');
        return;
    }
    
    if (!window.db) {
        console.error('[ERRO] Firestore nÃ£o inicializado!');
        showToast('Erro', 'Firestore nÃ£o inicializado!', 'error');
        return;
    }
    
    // VerificaÃ§Ã£o mais robusta do usuÃ¡rio com aguardo
    let usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    
    // Se usuÃ¡rio nÃ£o estÃ¡ carregado, aguardar um pouco
    if (!usuarioAdmin || !usuarioAdmin.uid || !usuarioAdmin.email) {
        debugLog('[DEBUG] carregarSolicitacoes: UsuÃ¡rio ainda nÃ£o carregado, aguardando...');
        
        // Tentar aguardar atÃ© 3 segundos pelo carregamento do usuÃ¡rio
        let tentativas = 0;
        const maxTentativas = 6; // 6 tentativas de 500ms = 3 segundos
        
        while (tentativas < maxTentativas) {
            await new Promise(resolve => setTimeout(resolve, 500));
            usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
            
            if (usuarioAdmin && usuarioAdmin.uid && usuarioAdmin.email) {
                debugLog('[DEBUG] carregarSolicitacoes: UsuÃ¡rio carregado apÃ³s aguardo');
                break;
            }
            tentativas++;
        }
        
        // Se apÃ³s aguardar ainda nÃ£o temos usuÃ¡rio vÃ¡lido
        if (!usuarioAdmin || !usuarioAdmin.uid || !usuarioAdmin.email) {
            debugLog('[DEBUG] carregarSolicitacoes: UsuÃ¡rio nÃ£o carregou apÃ³s aguardo, cancelando...');
            
            // Se estamos na tela de login, nÃ£o mostrar erro
            const authSection = document.getElementById('auth-section');
            if (!authSection || !authSection.classList.contains('hidden')) {
                debugLog('[DEBUG] carregarSolicitacoes: Ainda na tela de login, ignorando...');
                return;
            }
            
            console.warn('[AVISO] carregarSolicitacoes: Timeout aguardando dados do usuÃ¡rio');
            return;
        }
    }
    
    try {
        carregandoSolicitacoes = true;
        debugLog('[DEBUG] === INÃCIO DO CARREGAMENTO DE SOLICITAÃ‡Ã•ES ===');
        debugLog('[DEBUG] Buscando solicitaÃ§Ãµes da coleÃ§Ã£o "solicitacoes"...');
        
        // Mostrar indicador de carregamento
        mostrarIndicadorCarregamento();
        
        // Obter dados do usuÃ¡rio atual
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const isEquipe = usuarioAdmin && (usuarioAdmin.role === 'equipe' || usuarioAdmin.isEquipe);
        const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
        const isAdmin = usuarioAdmin && usuarioAdmin.role === 'admin';
        
        debugLog('[DEBUG] Carregando para usuÃ¡rio:', { 
            email: usuarioAdmin?.email,
            role: usuarioAdmin?.role, 
            isEquipe, 
            isSuperAdmin,
            isAdmin, 
            equipe: usuarioAdmin?.equipe 
        });
        
        // Buscar todas as solicitaÃ§Ãµes ordenadas por timestamp (mais recentes primeiro)
        console.log('[DEBUG] Iniciando busca no Firestore...');
        console.log('[DEBUG] Projeto:', window.db.app.options.projectId);
        console.log('[DEBUG] ColeÃ§Ã£o: solicitacoes');
        
        // TESTE SIMPLIFICADO: Apenas query simples sem ordenaÃ§Ã£o
        console.log('[DEBUG] Executando query SIMPLES sem ordenaÃ§Ã£o...');
        const snapshot = await window.db.collection('solicitacoes').get();
        console.log('[DEBUG] Query simples executada com sucesso');
        
        console.log('[DEBUG] Snapshot recebido:', {
            size: snapshot.size,
            empty: snapshot.empty,
            metadata: snapshot.metadata
        });
        
        // DEBUG AVANÃ‡ADO: Verificar autenticaÃ§Ã£o e permissÃµes
        const currentUser = window.auth.currentUser;
        if (currentUser) {
            console.log('[DEBUG] UsuÃ¡rio autenticado:', {
                uid: currentUser.uid,
                email: currentUser.email,
                emailVerified: currentUser.emailVerified
            });
            
            // Verificar token de autenticaÃ§Ã£o
            try {
                const idTokenResult = await currentUser.getIdTokenResult();
                console.log('[DEBUG] Token claims:', idTokenResult.claims);
            } catch (tokenError) {
                console.error('[ERRO] Erro ao obter token:', tokenError);
            }
        } else {
            console.error('[ERRO] UsuÃ¡rio nÃ£o autenticado!');
        }
        
        if (snapshot.empty) {
            console.warn('[AVISO] ColeÃ§Ã£o solicitacoes estÃ¡ vazia no Firestore');
            console.log('[DEBUG] Verificar se hÃ¡ dados na coleÃ§Ã£o solicitacoes no projeto:', window.db.app.options.projectId);
            
            // TESTE DIRETO: Tentar acessar o documento especÃ­fico do Firebase Console
            console.log('[TESTE] Verificando documento especÃ­fico 2yKdMYESGGMQqLOwGC6T...');
            try {
                const docRef = window.db.collection('solicitacoes').doc('2yKdMYESGGMQqLOwGC6T');
                const docSnap = await docRef.get();
                if (docSnap.exists) {
                    console.log('âœ… DOCUMENTO ESPECÃFICO ENCONTRADO:', docSnap.data());
                } else {
                    console.log('âŒ DOCUMENTO ESPECÃFICO NÃƒO EXISTE');
                }
            } catch (docError) {
                console.error('âŒ ERRO AO ACESSAR DOCUMENTO ESPECÃFICO:', docError);
            }
            
            // TESTE: Verificar outras possÃ­veis coleÃ§Ãµes
            const testeColes = ['solicitacao', 'pedidos', 'requests', 'tickets'];
            for (const nomeCole of testeColes) {
                try {
                    const testSnapshot = await window.db.collection(nomeCole).limit(1).get();
                    if (!testSnapshot.empty) {
                        console.log(`ðŸ” ENCONTRADA: ColeÃ§Ã£o '${nomeCole}' tem ${testSnapshot.size} documento(s)`);
                    }
                } catch (e) {
                    // Ignorar coleÃ§Ãµes inexistentes
                }
            }
        } else {
            debugLog('[DEBUG] Processando', snapshot.size, 'documentos da coleÃ§Ã£o solicitacoes');
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
            
            // DEBUG ESPECÃFICO PARA CAMPO QUARTO - TODAS AS SOLICITAÃ‡Ã•ES
            console.log('[ðŸ  DEBUG-QUARTO]', {
                id: doc.id,
                titulo: data.titulo || data.tipo || data.descricao,
                quartoRaw: data.quarto,
                quartoType: typeof data.quarto,
                quartoIsEmpty: !data.quarto,
                quartoLength: data.quarto ? data.quarto.length : 0
            });
            
            // FILTRO RIGOROSO USANDO A FUNÃ‡ÃƒO DE PERMISSÃ•ES
            if (!podeVerSolicitacaoJS(usuarioAdmin, data)) {
                docsFiltrados++;
                // Pular esta solicitaÃ§Ã£o se o usuÃ¡rio nÃ£o tem permissÃ£o para vÃª-la
                return;
            }
            
            totalDocs++;
            solicitacoes.push(item);
            
            console.log(`[DEBUG] SolicitaÃ§Ã£o incluÃ­da:`, item.titulo || item.tipo, 'equipe:', data.equipe);
            
            if (data.status === 'pendente') pendentes++;
            if (data.status === 'finalizada' && data.dataFinalizacao?.slice(0,10) === hoje) finalizadasHoje++;
            if (data.quarto) quartosAtivos.add(data.quarto);
            
            // Agrupar por equipe apenas se necessÃ¡rio
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
        
        console.log(`[DEBUG] Total de solicitaÃ§Ãµes processadas: ${totalDocs} de ${snapshot.size} encontradas`);
        console.log(`[DEBUG] Filtradas: ${docsFiltrados}, IncluÃ­das: ${totalDocs}`);
        console.log(`[DEBUG] SolicitaÃ§Ãµes por equipe:`, Object.keys(equipes).map(e => `${e}: ${equipes[e].length}`));
        
        // OrdenaÃ§Ã£o manual para garantir ordem correta (mais recentes primeiro)
        solicitacoes.sort((a, b) => {
            const timestampA = a.timestamp?.toMillis() || a.dataCriacao?.toMillis() || 0;
            const timestampB = b.timestamp?.toMillis() || b.dataCriacao?.toMillis() || 0;
            return timestampB - timestampA; // Ordem decrescente (mais recentes primeiro)
        });
        
        // Ordenar tambÃ©m dentro de cada equipe
        Object.keys(equipes).forEach(equipeNome => {
            equipes[equipeNome].sort((a, b) => {
                const timestampA = a.timestamp?.toMillis() || a.dataCriacao?.toMillis() || 0;
                const timestampB = b.timestamp?.toMillis() || b.dataCriacao?.toMillis() || 0;
                return timestampB - timestampA;
            });
        });
        
        console.log(`[DEBUG] Dados ordenados e prontos para renderizaÃ§Ã£o`);
        console.log(`[DEBUG] SolicitaÃ§Ãµes por equipe:`, Object.keys(equipes).map(e => `${e}: ${equipes[e].length}`));
        
        // RENDERIZAÃ‡ÃƒO BASEADA NO TIPO DE USUÃRIO
        if (isEquipe && usuarioAdmin.equipe) {
            // UsuÃ¡rio de equipe: mostrar APENAS sua equipe
            const equipeFiltrada = {};
            equipeFiltrada[usuarioAdmin.equipe] = equipes[usuarioAdmin.equipe] || [];
            
            console.log(`[DEBUG] Renderizando apenas equipe: ${usuarioAdmin.equipe} com ${equipeFiltrada[usuarioAdmin.equipe].length} solicitaÃ§Ãµes`);
            
            // Enriquecer dados antes de renderizar
            const equipeFiltradaEnriquecida = await enriquecerSolicitacoesComDados(equipeFiltrada);
            renderizarCardsEquipe(equipeFiltradaEnriquecida);
            
            // Ajustar visibilidade dos painÃ©is (mostrar apenas o da equipe)
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
            
            // Mostrar todos os painÃ©is
            setTimeout(() => {
                const allPanels = document.querySelectorAll('.team-panel');
                allPanels.forEach(panel => {
                    panel.classList.remove('hidden');
                    panel.style.display = 'block';
                });
            }, 100);
            
        } else if (isAdmin) {
            // Admin: mostrar TODAS as equipes (apenas visualizaÃ§Ã£o)
            debugLog('[DEBUG] Renderizando todas as equipes para administrador (visualizaÃ§Ã£o apenas)');
            
            // Enriquecer dados antes de renderizar
            const equipesEnriquecidas = await enriquecerSolicitacoesComDados(equipes);
            renderizarCardsEquipe(equipesEnriquecidas);
            
            // Mostrar todos os painÃ©is
            setTimeout(() => {
                const allPanels = document.querySelectorAll('.team-panel');
                allPanels.forEach(panel => {
                    panel.classList.remove('hidden');
                    panel.style.display = 'block';
                });
            }, 100);
            
        } else {
            // UsuÃ¡rio sem permissÃµes claras
            console.warn('[AVISO] UsuÃ¡rio sem permissÃµes claras - nÃ£o exibindo solicitaÃ§Ãµes');
            renderizarCardsEquipe({});
        }
        
        // Atualizar mÃ©tricas do painel
        atualizarMetricasPainel(totalDocs, pendentes, finalizadasHoje, quartosAtivos.size);
        
        // Log do resultado final (sem criar dados de exemplo em produÃ§Ã£o)
        if (totalDocs === 0) {
            debugLog('[DEBUG] Nenhuma solicitaÃ§Ã£o encontrada - painel vazio em produÃ§Ã£o');
            // Mostrar interface vazia sem dados simulados
            mostrarInterfaceVazia();
        }
        
        ocultarIndicadorCarregamento();
        
    } catch (error) {
        console.error('[ERRO] Falha ao buscar solicitaÃ§Ãµes:', error);
        console.error('[ERRO] Stack trace:', error.stack);
        ocultarIndicadorCarregamento();
        
        // Tentar novamente apÃ³s falha (uma vez)
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
                    showToast('Erro', 'Falha ao carregar dados. Recarregue a pÃ¡gina (Ctrl+F5)', 'error');
                    // EM PRODUÃ‡ÃƒO: NÃ£o carregar dados simulados, apenas mostrar erro
                    debugLog('[DEBUG] Sistema em produÃ§Ã£o - nÃ£o gerando dados de exemplo');
                }
            }, 3000);
            
        } else if (error.code === 'unavailable' || error.message.includes('offline')) {
            showToast('Aviso', 'Modo offline - Carregando dados locais', 'warning');
            carregarDadosOffline();
        } else if (error.code === 'permission-denied') {
            showToast('Erro', 'Acesso negado. Verifique suas permissÃµes', 'error');
        } else {
            showToast('Erro', 'NÃ£o foi possÃ­vel carregar as solicitaÃ§Ãµes', 'error');
            // EM PRODUÃ‡ÃƒO: NÃ£o carregar dados simulados
            debugLog('[DEBUG] Sistema em produÃ§Ã£o - nÃ£o gerando dados de exemplo em caso de erro');
        }
        
        console.log('[DEBUG] Finalizando carregarSolicitacoes - indo para finally...');
    } finally {
        console.log('[DEBUG] FINALLY: Entrando no finally block');
        window.carregandoSolicitacoes = false;
        
        // Configurar listener de notificaÃ§Ãµes em tempo real apenas uma vez
        if (!window.notificationListenerConfigured) {
            console.log('[NOTIFICATION] Configurando listener de notificaÃ§Ãµes...');
            configurarListenerNotificacoes();
            window.notificationListenerConfigured = true;
            
            console.log('[AUTO-UPDATE] Auto-update jÃ¡ foi configurado anteriormente');
            
            // REMOVIDO: ConfiguraÃ§Ã£o automÃ¡tica para evitar loops
            // configurarAtualizacaoAutomatica();
        } else {
            console.log('[NOTIFICATION] Listener jÃ¡ configurado (DESABILITADO), pulando...');
        }
        
        // Garantir que a interface estÃ¡ visÃ­vel apÃ³s carregamento
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
                
                debugLog('[DEBUG] Interface forÃ§adamente atualizada apÃ³s carregamento');
                
                // REMOVER BOTÃ•ES DEBUG IMEDIATAMENTE APÃ“S CARREGAMENTO
                setTimeout(() => {
                    if (typeof window.forceRemoveDebugButtons === 'function') {
                        window.forceRemoveDebugButtons();
                    }
                }, 100);
            }
        }, 100);
    }
}

// FunÃ§Ã£o para recarregar com debounce
function recarregarSolicitacoes(delay = 1000) {
    if (timeoutRecarregar) {
        clearTimeout(timeoutRecarregar);
    }
    
    timeoutRecarregar = setTimeout(() => {
        // Verificar se usuÃ¡rio ainda estÃ¡ logado antes de recarregar
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || !usuarioAdmin.uid || !usuarioAdmin.email) {
            debugLog('[DEBUG] recarregarSolicitacoes: usuÃ¡rio nÃ£o logado, cancelando recarregamento...');
            return;
        }
        
        // Limpar flags de carregamento para permitir atualizaÃ§Ã£o
        window.carregandoSolicitacoes = false;
        carregandoSolicitacoes = false;  // Limpar TAMBÃ‰M a flag local
        
        carregarSolicitacoes();
    }, delay);
}

// === SISTEMA DE ATUALIZAÃ‡ÃƒO AUTOMÃTICA ===
function configurarAtualizacaoAutomatica() {
    console.log('[AUTO-UPDATE] Configurando atualizaÃ§Ã£o automÃ¡tica a cada 30 segundos...');
    
    // SÃ³ configurar se nÃ£o foi configurado ainda
    if (!window.autoUpdateInterval) {
        console.log('[AUTO-UPDATE] Auto-update DESABILITADO temporariamente para debug');
        // window.autoUpdateInterval = setInterval(() => {
        //     // SÃ³ atualizar se estiver logado e nÃ£o carregando
        //     if (window.usuarioAdmin && !window.carregandoSolicitacoes) {
        //         console.log('[AUTO-UPDATE] Recarregamento automÃ¡tico suave...');
        //         recarregarSolicitacoes(5000); // Usar recarregamento com debounce
        //     }
        // }, 60000); // Aumentado para 60 segundos
        
        console.log('[AUTO-UPDATE] Intervalo DESABILITADO com sucesso');
    }
}

// === FUNÃ‡ÃƒO PARA ADICIONAR NOVA SOLICITAÃ‡ÃƒO SEM RECARREGAR TUDO ===
function adicionarNovaSolicitacao(novaSolicitacao) {
    try {
        console.log('[NOTIFICATION] Nova solicitaÃ§Ã£o detectada:', novaSolicitacao.id);
        
        // Verificar se pode ver a solicitaÃ§Ã£o
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const podeVer = podeVerSolicitacaoJS(usuarioAdmin, novaSolicitacao);
        if (!podeVer) {
            console.log('[NOTIFICATION] Sem permissÃ£o para ver esta solicitaÃ§Ã£o');
            return;
        }
        
        // Recarregar com debounce para evitar loops
        console.log('[NOTIFICATION] Recarregando painel com debounce...');
        recarregarSolicitacoes(2000); // 2 segundos de delay
        
    } catch (error) {
        console.error('[ERRO] Erro ao processar nova solicitaÃ§Ã£o:', error);
    }
}

// === SISTEMA DE NOTIFICAÃ‡Ã•ES EM TEMPO REAL ===
function configurarListenerNotificacoes() {
    try {
        console.log('[NOTIFICATION] Configurando listener de notificaÃ§Ãµes...');
        
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin || !usuarioAdmin.uid) {
            console.log('[NOTIFICATION] UsuÃ¡rio nÃ£o estÃ¡ logado - nÃ£o configurando notificaÃ§Ãµes');
            return;
        }
        
        // Armazenar timestamp da Ãºltima verificaÃ§Ã£o para evitar notificar solicitaÃ§Ãµes existentes
        // AJUSTE: Definir como 1 minuto atrÃ¡s para permitir notificaÃ§Ãµes de solicitaÃ§Ãµes muito recentes
        const agora = Date.now();
        window.lastNotificationCheck = agora - (60 * 1000); // 1 minuto atrÃ¡s
        
        console.log('[NOTIFICATION] Iniciando listener para solicitaÃ§Ãµes...', {
            usuario: usuarioAdmin.email,
            equipe: usuarioAdmin.equipe,
            role: usuarioAdmin.role,
            lastCheck: new Date(window.lastNotificationCheck).toLocaleString(),
            agoraReal: new Date(agora).toLocaleString()
        });
        
        // Marcar que Ã© o carregamento inicial para nÃ£o notificar sobre todas as solicitaÃ§Ãµes existentes
        window.isInitialLoad = true;
        setTimeout(() => {
            window.isInitialLoad = false;
            console.log('[NOTIFICATION] Carregamento inicial finalizado - notificaÃ§Ãµes ativas');
            console.log('[NOTIFICATION] ðŸ”” isInitialLoad definido como FALSE - pop-ups agora ativos!');
        }, 2000); // Reduzido para 2 segundos para permitir notificaÃ§Ãµes mais rÃ¡pido
        
        // Listener para novas solicitaÃ§Ãµes (SEM ORDERBY para evitar problemas de Ã­ndice)
        window.db.collection('solicitacoes')
            .onSnapshot((snapshot) => {
                console.log('[NOTIFICATION] Snapshot recebido:', {
                    size: snapshot.size,
                    hasPendingWrites: snapshot.metadata.hasPendingWrites,
                    docChanges: snapshot.docChanges().length
                });
                
                if (!snapshot.metadata.hasPendingWrites) { // Ignorar mudanÃ§as locais
                    snapshot.docChanges().forEach((change) => {
                        console.log('[NOTIFICATION] Change detectado:', {
                            type: change.type,
                            docId: change.doc.id
                        });
                        
                        if (change.type === 'added') {
                            const novaSolicitacao = { id: change.doc.id, ...change.doc.data() };
                            
                            console.log('[NOTIFICATION] Verificando se Ã© nova:', {
                                id: novaSolicitacao.id,
                                timestamp: novaSolicitacao.timestamp?.toMillis(),
                                dataCriacao: novaSolicitacao.dataCriacao?.toMillis(),
                                lastCheck: window.lastNotificationCheck,
                                temTimestamp: !!novaSolicitacao.timestamp,
                                temDataCriacao: !!novaSolicitacao.dataCriacao
                            });
                            
                            // FALLBACK: Se nÃ£o hÃ¡ timestamp, considerar como nova durante a primeira verificaÃ§Ã£o
                            const timestampSolicitacao = novaSolicitacao.timestamp?.toMillis() || 
                                                        novaSolicitacao.dataCriacao?.toMillis() || 
                                                        Date.now(); // Usar timestamp atual como fallback
                            
                            const isNova = timestampSolicitacao > window.lastNotificationCheck;
                            
                            // ADICIONAL: Se nÃ£o tem timestamp, verificar se Ã© uma solicitaÃ§Ã£o que acabou de aparecer no listener
                            const isNovaNoListener = !novaSolicitacao.timestamp && !novaSolicitacao.dataCriacao;
                            
                            if (isNova || (isNovaNoListener && change.type === 'added')) {
                                console.log('[NOTIFICATION] Verificando permissÃµes para:', {
                                    id: novaSolicitacao.id,
                                    equipe: novaSolicitacao.equipe,
                                    isNova,
                                    isNovaNoListener
                                });
                                
                                // Verificar se o usuÃ¡rio tem permissÃ£o para ver esta solicitaÃ§Ã£o
                                if (podeVerSolicitacaoJS(usuarioAdmin, novaSolicitacao)) {
                                    console.log('[NOTIFICATION] âœ… Nova solicitaÃ§Ã£o detectada:', novaSolicitacao);
                                    
                                    // SÃ³ mostrar notificaÃ§Ã£o se for realmente nova (nÃ£o durante o carregamento inicial)
                                    if (!window.isInitialLoad) {
                                        mostrarNotificacaoNovaSolicitacao(novaSolicitacao);
                                    }
                                    
                                    // Recarregar as solicitaÃ§Ãµes para mostrar a nova no topo
                                    setTimeout(() => {
                                        console.log('[NOTIFICATION] Adicionando nova solicitaÃ§Ã£o sem recarregar tudo...');
                                        // Evitar loop - usar funÃ§Ã£o especÃ­fica para adicionar
                                        // carregarSolicitacoes();
                                        adicionarNovaSolicitacao(novaSolicitacao);
                                    }, 1000);
                                } else {
                                    console.log('[NOTIFICATION] âŒ Sem permissÃ£o para ver esta solicitaÃ§Ã£o');
                                }
                            } else {
                                console.log('[NOTIFICATION] â° SolicitaÃ§Ã£o nÃ£o Ã© nova (timestamp anterior ao login)');
                            }
                        }
                    });
                }
            }, (error) => {
                console.error('[ERRO] Erro no listener de notificaÃ§Ãµes:', error);
                console.log('[NOTIFICATION] Erro no listener - tentando reconfigurar em 5s...');
                setTimeout(() => {
                    window.notificationListenerConfigured = false;
                    configurarListenerNotificacoes();
                }, 5000);
            });
            
    } catch (error) {
        console.error('[ERRO] configurarListenerNotificacoes:', error);
    }
}

function mostrarNotificacaoNovaSolicitacao(solicitacao) {
    try {
        console.log('[NOTIFICATION] ðŸŽ¯ EXECUTANDO mostrarNotificacaoNovaSolicitacao para:', solicitacao.id);
        
        // Buscar dados completos do acompanhante antes de exibir
        buscarDadosAcompanhante(solicitacao).then(dadosAcompanhante => {
            console.log('[NOTIFICATION] ðŸ“‹ Dados obtidos para popup:', dadosAcompanhante);
            exibirPopupNotificacao(solicitacao, dadosAcompanhante);
        }).catch(error => {
            console.error('[NOTIFICATION] âŒ Erro ao buscar dados do acompanhante:', error);
            // Mesmo assim, exibir popup com dados bÃ¡sicos
            exibirPopupNotificacao(solicitacao, null);
        });
        
    } catch (error) {
        console.error('[NOTIFICATION] Erro ao exibir notificaÃ§Ã£o:', error);
    }
}

function exibirPopupNotificacao(solicitacao, dadosAcompanhante) {
    try {
        console.log('[NOTIFICATION] ðŸŽ‰ CRIANDO POPUP para solicitaÃ§Ã£o:', solicitacao.id);
        console.log('[NOTIFICATION] ðŸ“Š Dados do acompanhante recebidos:', dadosAcompanhante);
        
        // Determinar tipo de serviÃ§o e emoji
        let tipoServico = solicitacao.equipe || solicitacao.tipoServico || 'solicitaÃ§Ã£o';
        let emoji = 'ðŸ“‹';
        
        switch(tipoServico.toLowerCase()) {
            case 'manutencao':
            case 'manutenÃ§Ã£o':
                emoji = 'ðŸ”§';
                tipoServico = 'ManutenÃ§Ã£o';
                break;
            case 'nutricao':
            case 'nutriÃ§Ã£o':
                emoji = 'ðŸ½ï¸';
                tipoServico = 'NutriÃ§Ã£o';
                break;
            case 'higienizacao':
            case 'higienizaÃ§Ã£o':
                emoji = 'ðŸ§¹';
                tipoServico = 'HigienizaÃ§Ã£o';
                break;
            case 'hotelaria':
                emoji = 'ðŸ¨';
                tipoServico = 'Hotelaria';
                break;
        }
        
        // Criar pop-up de notificaÃ§Ã£o
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
                    <div style="font-weight: bold; font-size: 16px;">Nova SolicitaÃ§Ã£o!</div>
                    <div style="font-size: 14px; opacity: 0.9;">${tipoServico}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-left: auto; background: rgba(255,255,255,0.2); border: none; color: white; 
                               padding: 4px 8px; border-radius: 4px; cursor: pointer;">âœ•</button>
            </div>
            <div style="font-size: 14px; line-height: 1.4;">
                <strong>Quarto:</strong> ${dadosAcompanhante?.quarto || solicitacao.quarto || 'NÃ£o especificado'}<br>
                <strong>Solicitante:</strong> ${dadosAcompanhante?.nome || solicitacao.usuarioNome || solicitacao.nome || 'NÃ£o informado'}<br>
                <strong>DescriÃ§Ã£o:</strong> ${solicitacao.descricao || solicitacao.titulo || 'Nova solicitaÃ§Ã£o de atendimento'}
            </div>
            <div style="margin-top: 12px; font-size: 12px; opacity: 0.8;">
                ${new Date().toLocaleString('pt-BR')}
            </div>
        `;
        
        // Adicionar CSS de animaÃ§Ã£o se nÃ£o existir
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
        
        // Som de notificaÃ§Ã£o (opcional - sÃ³ se suportado)
        try {
            if ('Audio' in window) {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBz2c3+7AdSIBII/J8N6OSAgQYrPm56VUEwpJmOLosmIdBDSK1O7HdSII');
                audio.volume = 0.3;
                audio.play().catch(() => {}); // Ignorar erro se nÃ£o conseguir tocar
            }
        } catch (e) {
            // Ignorar erro de Ã¡udio
        }
        
        // Remover automaticamente apÃ³s 7 segundos
        setTimeout(() => {
            if (popup && popup.parentNode) {
                popup.style.animation = 'slideInRight 0.3s ease-in reverse';
                setTimeout(() => popup.remove(), 300);
            }
        }, 7000);
        
        console.log('[NOTIFICATION] NotificaÃ§Ã£o exibida com sucesso');
        
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
                <p>Carregando solicitaÃ§Ãµes...</p>
            </div>
        `;
    }
}

function ocultarIndicadorCarregamento() {
    // O indicador serÃ¡ substituÃ­do pelo conteÃºdo real
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

// FunÃ§Ã£o para mostrar interface vazia em produÃ§Ã£o (sem dados simulados)
function mostrarInterfaceVazia() {
    debugLog('[DEBUG] Mostrando interface vazia - nenhuma solicitaÃ§Ã£o encontrada');
    
    const teamsGrid = document.querySelector('.teams-grid');
    if (teamsGrid) {
        teamsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6b7280;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">ðŸ“‹</div>
                <h3 style="margin-bottom: 1rem; color: #374151;">Nenhuma solicitaÃ§Ã£o encontrada</h3>
                <p style="margin-bottom: 2rem;">NÃ£o hÃ¡ solicitaÃ§Ãµes para exibir no momento.</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="location.reload()" 
                            style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; cursor: pointer;">
                        ðŸ”„ Atualizar
                    </button>
                </div>
            </div>
        `;
    }
    
    // Zerar mÃ©tricas
    atualizarMetricasPainel(0, 0, 0, 0);
}

function atualizarMetricasPainel(total, pendentes, finalizadasHoje, quartosAtivos) {
    // Atualiza badge do menu para mostrar o papel do usuÃ¡rio
    const badge = document.getElementById('user-role-badge');
    if (badge) {
        const usuario = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (usuario.role === 'super_admin') {
            badge.textContent = 'Super Administrador';
            badge.className = 'priority-badge priority-urgente';
        } else if (usuario.role === 'admin') {
            badge.textContent = 'Administrador';
            badge.className = 'priority-badge priority-alta';
        } else {
            badge.textContent = 'Equipe';
            badge.className = 'priority-badge priority-media';
        }
    }
    
    // Atualizar visibilidade dos botÃµes
    atualizarVisibilidadeBotoes();
    
    // Remove loader visual (reforÃ§ado)
    setTimeout(() => {
        if (window._mainLoader) {
            window._mainLoader.remove();
            window._mainLoader = null;
        }
    }, 100);
    // Renderiza bloco de mÃ©tricas centralizado
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

// VariÃ¡vel global para controlar reconfiguraÃ§Ã£o de botÃµes
let reconfigurando = false;

// FunÃ§Ã£o especÃ­fica para garantir visibilidade do botÃ£o Minha Senha
function forcarVisibilidadeBotaoMinhaSenha() {
    const btnMinhaSenha = document.getElementById('alterar-senha-btn');
    if (btnMinhaSenha) {
        // ForÃ§ar visibilidade com mÃºltiplas abordagens
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
        console.log('[ðŸ”‘ MINHA SENHA] BotÃ£o forÃ§ado para ser visÃ­vel');
        return true;
    } else {
        console.warn('[ðŸ”‘ MINHA SENHA] BotÃ£o nÃ£o encontrado no DOM');
        // Tentar recriar o botÃ£o se nÃ£o existir
        recriarBotaoMinhaSenha();
        return false;
    }
}

// FunÃ§Ã£o para recriar o botÃ£o se ele nÃ£o existir
function recriarBotaoMinhaSenha() {
    console.log('[ðŸ”‘ RECRIAR] Tentando recriar botÃ£o Minha Senha...');
    
    const userInfo = document.querySelector('.header .user-info');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (userInfo && logoutBtn) {
        // Criar o botÃ£o
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
        
        // Inserir antes do botÃ£o de logout
        userInfo.insertBefore(btnMinhaSenha, logoutBtn);
        console.log('[ðŸ”‘ RECRIAR] BotÃ£o Minha Senha recriado com sucesso!');
        return true;
    } else {
        console.error('[ðŸ”‘ RECRIAR] NÃ£o foi possÃ­vel encontrar local para inserir o botÃ£o');
        return false;
    }
}

// Watchdog para garantir que o botÃ£o sempre esteja visÃ­vel
function iniciarWatchdogBotaoMinhaSenha() {
    setInterval(() => {
        const btnMinhaSenha = document.getElementById('alterar-senha-btn');
        if (btnMinhaSenha) {
            const isVisible = btnMinhaSenha.offsetWidth > 0 && btnMinhaSenha.offsetHeight > 0;
            if (!isVisible) {
                console.log('[ðŸ”‘ WATCHDOG] BotÃ£o "Minha Senha" invisÃ­vel - forÃ§ando visibilidade...');
                forcarVisibilidadeBotaoMinhaSenha();
            }
        } else {
            console.log('[ðŸ”‘ WATCHDOG] BotÃ£o "Minha Senha" nÃ£o encontrado - recriando...');
            recriarBotaoMinhaSenha();
        }
    }, 2000); // Verificar a cada 2 segundos
}

// Observer para monitorar mudanÃ§as no DOM
function iniciarObserverBotaoMinhaSenha() {
    const userInfo = document.querySelector('.header .user-info');
    if (userInfo) {
        const observer = new MutationObserver(() => {
            const btnMinhaSenha = document.getElementById('alterar-senha-btn');
            if (!btnMinhaSenha) {
                console.log('[ðŸ”‘ OBSERVER] BotÃ£o removido - recriando...');
                setTimeout(() => recriarBotaoMinhaSenha(), 100);
            }
        });
        
        observer.observe(userInfo, {
            childList: true,
            subtree: true
        });
        
        console.log('[ðŸ”‘ OBSERVER] Observer do botÃ£o Minha Senha iniciado');
    }
}

// Nova funÃ§Ã£o para atualizar visibilidade dos botÃµes
function atualizarVisibilidadeBotoes() {
    console.log('ðŸ”¥ðŸ”¥ðŸ”¥ EXECUTANDO atualizarVisibilidadeBotoes - TESTE LIMPEZA ðŸ”¥ðŸ”¥ðŸ”¥');
    
    // PRIMEIRO: Limpar botÃµes indesejados SEMPRE
    forceRemoveDebugButtons();
    
    if (reconfigurando) {
        debugLog('[DEBUG] atualizarVisibilidadeBotoes: jÃ¡ estÃ¡ reconfigurando, ignorando...');
        return;
    }
    
    reconfigurando = true;
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    const btnAcompanhantes = document.getElementById('acompanhantes-btn');
    const btnRelatorios = document.getElementById('relatorios-btn');
    const btnLimpeza = document.getElementById('limpeza-btn');
    const btnSatisfacao = document.getElementById('satisfacao-btn');
    const btnMinhaSenha = document.getElementById('alterar-senha-btn');
    const msgPermissao = document.getElementById('admin-permission-msg');
    const userRoleBadge = document.getElementById('user-role-badge');
    const panelTitle = document.getElementById('panel-title');
    
    debugLog('[DEBUG] Elementos encontrados:', {
        btnNovoUsuario: !!btnNovoUsuario,
        btnGerenciarUsuarios: !!btnGerenciarUsuarios,
        btnAcompanhantes: !!btnAcompanhantes,
        btnRelatorios: !!btnRelatorios,
        btnLimpeza: !!btnLimpeza,
        btnSatisfacao: !!btnSatisfacao
    });
    
    debugLog('[DEBUG] Atualizando botÃµes para usuÃ¡rio:', usuarioAdmin);
    
    // Verificar tipo de usuÃ¡rio baseado nas coleÃ§Ãµes Firestore
    const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
    const isEquipe = usuarioAdmin && (usuarioAdmin.role === 'equipe' || usuarioAdmin.isEquipe);
    const isAdmin = usuarioAdmin && usuarioAdmin.role === 'admin';
    
    debugLog('[DEBUG] Tipo de usuÃ¡rio:', { 
        isSuperAdmin, 
        isEquipe, 
        isAdmin, 
        role: usuarioAdmin?.role, 
        equipe: usuarioAdmin?.equipe 
    });
    
    // Configurar tÃ­tulo e badge baseado no tipo de usuÃ¡rio
    if (panelTitle) {
        if (isSuperAdmin) {
            panelTitle.textContent = 'ðŸ¥ Painel Administrativo - Super Admin';
        } else if (isEquipe && usuarioAdmin.equipe) {
            const nomeEquipe = {
                'manutencao': 'ManutenÃ§Ã£o',
                'nutricao': 'NutriÃ§Ã£o', 
                'higienizacao': 'HigienizaÃ§Ã£o',
                'hotelaria': 'Hotelaria'
            }[usuarioAdmin.equipe] || usuarioAdmin.equipe;
            panelTitle.textContent = `ðŸ¥ Painel ${nomeEquipe}`;
        } else if (isAdmin) {
            panelTitle.textContent = 'ðŸ¥ Painel Administrativo';
        }
    }
    
    if (userRoleBadge) {
        if (isSuperAdmin) {
            userRoleBadge.textContent = 'Super Administrador';
            userRoleBadge.className = 'priority-badge priority-alta';
        } else if (isEquipe && usuarioAdmin.equipe) {
            const nomeEquipe = {
                'manutencao': 'Equipe ManutenÃ§Ã£o',
                'nutricao': 'Equipe NutriÃ§Ã£o',
                'higienizacao': 'Equipe HigienizaÃ§Ã£o', 
                'hotelaria': 'Equipe Hotelaria'
            }[usuarioAdmin.equipe] || `Equipe ${usuarioAdmin.equipe}`;
            userRoleBadge.textContent = nomeEquipe;
            userRoleBadge.className = 'priority-badge priority-media';
        } else if (isAdmin) {
            userRoleBadge.textContent = 'Administrador';
            userRoleBadge.className = 'priority-badge priority-media';
        }
    }
    
    // BotÃ£o Criar UsuÃ¡rio - APENAS super_admin
    if (btnNovoUsuario) {
        if (isSuperAdmin) {
            btnNovoUsuario.classList.remove('btn-hide');
            btnNovoUsuario.style.display = 'inline-flex';
            debugLog('[DEBUG] BotÃ£o Criar UsuÃ¡rio exibido para super_admin');
        } else {
            btnNovoUsuario.classList.add('btn-hide');
            btnNovoUsuario.style.display = 'none';
            debugLog('[DEBUG] BotÃ£o Criar UsuÃ¡rio ocultado para usuÃ¡rio nÃ£o super_admin');
        }
    }
    
    // BotÃ£o Gerenciar UsuÃ¡rios - APENAS super_admin
    if (btnGerenciarUsuarios) {
        if (isSuperAdmin) {
            btnGerenciarUsuarios.classList.remove('btn-hide');
            btnGerenciarUsuarios.style.display = 'inline-flex';
            debugLog('[DEBUG] BotÃ£o Gerenciar UsuÃ¡rios exibido para super_admin');
        } else {
            btnGerenciarUsuarios.classList.add('btn-hide');
            btnGerenciarUsuarios.style.display = 'none';
            debugLog('[DEBUG] BotÃ£o Gerenciar UsuÃ¡rios ocultado para usuÃ¡rio nÃ£o super_admin');
        }
    }

    // BotÃ£o Acompanhantes - APENAS super_admin
    if (btnAcompanhantes) {
        if (isSuperAdmin) {
            btnAcompanhantes.classList.remove('btn-hide');
            btnAcompanhantes.style.display = 'inline-flex';
            debugLog('[DEBUG] BotÃ£o Acompanhantes exibido para', isSuperAdmin ? 'super_admin' : 'admin');
        } else {
            btnAcompanhantes.classList.add('btn-hide');
            btnAcompanhantes.style.display = 'none';
            debugLog('[DEBUG] BotÃ£o Acompanhantes ocultado para usuÃ¡rio nÃ£o admin');
        }
    }

    // BotÃ£o RelatÃ³rios - super_admin e admin
    if (btnRelatorios) {
        if (isSuperAdmin || isAdmin) {
            btnRelatorios.classList.remove('btn-hide');
            btnRelatorios.style.display = 'inline-flex';
            debugLog('[DEBUG] BotÃ£o RelatÃ³rios exibido para', isSuperAdmin ? 'super_admin' : 'admin');
        } else {
            btnRelatorios.classList.add('btn-hide');
            btnRelatorios.style.display = 'none';
            debugLog('[DEBUG] BotÃ£o RelatÃ³rios ocultado para usuÃ¡rio nÃ£o admin');
        }
    }

    // BotÃ£o Minha Senha - TODOS os usuÃ¡rios (equipes, admins, super_admins)
    console.log('[ðŸ”‘ DEBUG] Iniciando configuraÃ§Ã£o do botÃ£o Minha Senha...');
    
    // Tentar multiple vezes para garantir que funcione
    forcarVisibilidadeBotaoMinhaSenha();
    
    setTimeout(() => {
        console.log('[ðŸ”‘ DEBUG] Segunda tentativa de forÃ§ar visibilidade...');
        forcarVisibilidadeBotaoMinhaSenha();
    }, 500);
    
    setTimeout(() => {
        console.log('[ðŸ”‘ DEBUG] Terceira tentativa de forÃ§ar visibilidade...');
        forcarVisibilidadeBotaoMinhaSenha();
    }, 1000);
    
    debugLog('[DEBUG] BotÃ£o Minha Senha sempre exibido para todos os usuÃ¡rios');

    // BotÃ£o Limpeza - APENAS super_admin
    console.log('[ðŸ§¹ LIMPEZA-CHECK] Verificando:', { btnLimpeza: !!btnLimpeza, isSuperAdmin }); 
    
    if (btnLimpeza) {
        if (isSuperAdmin) {
            btnLimpeza.classList.remove('btn-hide');
            btnLimpeza.style.display = 'inline-flex';
            debugLog('[DEBUG] BotÃ£o Limpeza exibido para super_admin');
            
            // ForÃ§ar novamente apÃ³s 500ms para combater cache
            setTimeout(() => {
                btnLimpeza.classList.remove('btn-hide', 'hidden');
                btnLimpeza.style.cssText = 'display: inline-flex !important; visibility: visible !important;';
                debugLog('[DEBUG] BotÃ£o Limpeza forÃ§ado novamente para super_admin');
            }, 500);
        } else {
            btnLimpeza.classList.add('btn-hide');
            btnLimpeza.style.display = 'none';
            debugLog('[DEBUG] BotÃ£o Limpeza ocultado para usuÃ¡rio nÃ£o super_admin');
        }
    }

    // BotÃ£o Pesquisa de SatisfaÃ§Ã£o - admin e super_admin
    if (btnSatisfacao) {
        if (isSuperAdmin || isAdmin) {
            btnSatisfacao.classList.remove('btn-hide');
            btnSatisfacao.style.display = 'inline-flex';
            debugLog('[DEBUG] BotÃ£o SatisfaÃ§Ã£o exibido para admin/super_admin');
        } else {
            btnSatisfacao.classList.add('btn-hide');
            btnSatisfacao.style.display = 'none';
            debugLog('[DEBUG] BotÃ£o SatisfaÃ§Ã£o ocultado para usuÃ¡rio sem permissÃµes de admin');
        }
    }
    
    // Mensagem de permissÃ£o
    if (msgPermissao) {
        if (isEquipe && usuarioAdmin.equipe) {
            const nomeEquipe = {
                'manutencao': 'ManutenÃ§Ã£o',
                'nutricao': 'NutriÃ§Ã£o',
                'higienizacao': 'HigienizaÃ§Ã£o',
                'hotelaria': 'Hotelaria'
            }[usuarioAdmin.equipe] || usuarioAdmin.equipe;
            
            msgPermissao.textContent = `Acesso da equipe: VisualizaÃ§Ã£o e gerenciamento de solicitaÃ§Ãµes de ${nomeEquipe}`;
            msgPermissao.classList.remove('msg-permissao-hide');
            msgPermissao.style.display = 'block';
            msgPermissao.style.color = '#059669';
            msgPermissao.style.fontWeight = '500';
        } else if (isAdmin) {
            // Admin: nÃ£o mostrar mensagem de permissÃ£o (evitar confusÃ£o)
            msgPermissao.classList.add('msg-permissao-hide');
            msgPermissao.style.display = 'none';
        } else if (!isSuperAdmin && !isEquipe && !isAdmin) {
            // Apenas para usuÃ¡rios sem nenhum tipo de permissÃ£o definida
            msgPermissao.textContent = 'Sem permissÃµes definidas';
            msgPermissao.classList.remove('msg-permissao-hide');
            msgPermissao.style.display = 'block';
            msgPermissao.style.color = '#dc2626';
        } else {
            msgPermissao.classList.add('msg-permissao-hide');
            msgPermissao.style.display = 'none';
        }
    }
    
    // Log final do estado dos botÃµes
    debugLog('[DEBUG] Estado final dos botÃµes:', {
        role: usuarioAdmin?.role,
        equipe: usuarioAdmin?.equipe,
        isSuperAdmin,
        isEquipe,
        isAdmin,
        btnNovoUsuario: btnNovoUsuario ? !btnNovoUsuario.classList.contains('btn-hide') : 'nÃ£o encontrado',
        btnGerenciarUsuarios: btnGerenciarUsuarios ? !btnGerenciarUsuarios.classList.contains('btn-hide') : 'nÃ£o encontrado',
        btnAcompanhantes: btnAcompanhantes ? !btnAcompanhantes.classList.contains('btn-hide') : 'nÃ£o encontrado',
        btnRelatorios: btnRelatorios ? !btnRelatorios.classList.contains('btn-hide') : 'nÃ£o encontrado',
        btnMinhaSenha: btnMinhaSenha ? !btnMinhaSenha.classList.contains('btn-hide') : 'nÃ£o encontrado',
        btnLimpeza: btnLimpeza ? !btnLimpeza.classList.contains('btn-hide') : 'nÃ£o encontrado'
    });
    
    // Reset da flag de reconfiguraÃ§Ã£o
    setTimeout(() => {
        reconfigurando = false;
    }, 50);
}

// FunÃ§Ã£o para configurar eventos dos botÃµes
function configurarEventosBotoes() {
    debugLog('[DEBUG] ===== CONFIGURANDO EVENTOS DOS BOTÃ•ES =====');
    
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
    
    // Debug especÃ­fico para o botÃ£o de limpeza
    debugLog('[DEBUG] BotÃ£o Limpeza Debug:', {
        elemento: btnLimpeza,
        id: btnLimpeza?.id,
        classes: btnLimpeza?.className,
        display: btnLimpeza?.style.display,
        hidden: btnLimpeza?.classList.contains('btn-hide')
    });
    
    debugLog('[DEBUG] configurarEventosBotoes: botÃµes encontrados:', {
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

    // Configurar botÃ£o RelatÃ³rios
    if (btnRelatorios) {
        // Remove qualquer evento anterior (incluindo onclick do HTML)
        btnRelatorios.onclick = null;
        btnRelatorios.removeAttribute('onclick');
        
        btnRelatorios.onclick = function(e) {
            console.log('[LOG] ===== CLIQUE RELATÃ“RIOS DETECTADO =====');
            
            // Debug completo do estado
            window.debugEstadoApp();
            
            console.log('[LOG] Estado da autenticaÃ§Ã£o:', {
                windowUserRole: window.userRole,
                windowUsuarioAdmin: !!window.usuarioAdmin,
                localStorage: !!localStorage.getItem('usuarioAdmin'),
                firebaseCurrentUser: !!window.auth?.currentUser
            });
            
            e.preventDefault();
            e.stopPropagation();
            
            try {
                debugLog('[DEBUG] Verificando funÃ§Ã£o mostrarRelatorios...');
                
                if (typeof window.mostrarRelatorios !== 'function') {
                    console.error('[ERRO] mostrarRelatorios nÃ£o estÃ¡ definida!');
                    alert('Erro: FunÃ§Ã£o mostrarRelatorios nÃ£o encontrada!');
                    return;
                }
                
                debugLog('[DEBUG] Chamando mostrarRelatorios...');
                window.mostrarRelatorios();
                
            } catch (err) {
                console.error('[ERRO] Falha ao abrir relatÃ³rios:', err);
                alert('Erro ao abrir relatÃ³rios: ' + err.message);
                
                // Debug adicional em caso de erro
                debugLog('[DEBUG] Estado apÃ³s erro:', {
                    relatoriosSection: !!document.getElementById('relatorios-section'),
                    adminPanel: !!document.getElementById('admin-panel'),
                    userRole: window.userRole
                });
            }
        };
        
        // Garantir que o botÃ£o Ã© sempre clicÃ¡vel
        btnRelatorios.style.pointerEvents = 'auto';
        btnRelatorios.style.cursor = 'pointer';
        
        debugLog('[DEBUG] Evento configurado para RelatÃ³rios');
    } else {
        console.warn('[AVISO] BotÃ£o RelatÃ³rios nÃ£o encontrado!');
    }
    
    if (btnNovoUsuario) {
        // Remove qualquer evento anterior
        btnNovoUsuario.onclick = null;
        
        btnNovoUsuario.onclick = function(e) {
            console.log('[LOG] CLIQUE no botÃ£o Criar UsuÃ¡rio detectado');
            e.preventDefault();
            e.stopPropagation();
            
            try {
                debugLog('[DEBUG] Verificando funÃ§Ã£o showCreateUserModal...');
                
                if (typeof window.showCreateUserModal !== 'function') {
                    console.error('[ERRO] showCreateUserModal nÃ£o estÃ¡ definida!');
                    alert('Erro: FunÃ§Ã£o showCreateUserModal nÃ£o encontrada!');
                    return;
                }
                
                debugLog('[DEBUG] Chamando showCreateUserModal...');
                window.showCreateUserModal();
                
            } catch (err) {
                console.error('[ERRO] Falha ao abrir modal Criar UsuÃ¡rio:', err);
                alert('Erro ao abrir modal Criar UsuÃ¡rio: ' + err.message);
            }
        };
        
        // Garantir que o botÃ£o Ã© sempre clicÃ¡vel
        btnNovoUsuario.style.pointerEvents = 'auto';
        btnNovoUsuario.style.cursor = 'pointer';
        
        debugLog('[DEBUG] Evento configurado para Criar UsuÃ¡rio');
    } else {
        console.warn('[AVISO] BotÃ£o Criar UsuÃ¡rio nÃ£o encontrado!');
    }
    
    if (btnGerenciarUsuarios) {
        debugLog('[DEBUG] Configurando evento para Gerenciar UsuÃ¡rios...');
        
        // Remove qualquer evento anterior
        btnGerenciarUsuarios.onclick = null;
        btnGerenciarUsuarios.removeAttribute('onclick');
        
        btnGerenciarUsuarios.onclick = function(e) {
            // Prevenir cliques mÃºltiplos
            if (btnGerenciarUsuarios.disabled) {
                debugLog('[DEBUG] Clique ignorado - botÃ£o temporariamente desabilitado');
                return;
            }
            
            console.log('[LOG] ===== CLIQUE GERENCIAR USUÃRIOS DETECTADO =====');
            
            // Desabilitar temporariamente para evitar cliques mÃºltiplos
            btnGerenciarUsuarios.disabled = true;
            setTimeout(() => {
                btnGerenciarUsuarios.disabled = false;
            }, 1000);
            
            e.preventDefault();
            e.stopPropagation();
            
            try {
                debugLog('[DEBUG] Chamando mostrarSecaoPainel para manage-users...');
                
                // Usar a funÃ§Ã£o de navegaÃ§Ã£o existente em vez da modal diretamente
                if (typeof window.mostrarSecaoPainel === 'function') {
                    window.mostrarSecaoPainel('manage-users');
                } else if (typeof window.showManageUsersModal === 'function') {
                    window.showManageUsersModal();
                } else {
                    throw new Error('Nenhuma funÃ§Ã£o de gerenciamento de usuÃ¡rios encontrada');
                }
                
                debugLog('[DEBUG] Gerenciar usuÃ¡rios aberto com sucesso');
                
            } catch (err) {
                console.error('[ERRO] Falha ao abrir gerenciar usuÃ¡rios:', err);
                showToast('Erro', 'Erro ao abrir gerenciamento de usuÃ¡rios: ' + err.message, 'error');
                
                // Debug adicional
                debugLog('[DEBUG] Estado apÃ³s erro:', {
                    modal: !!document.getElementById('manage-users-modal'),
                    userRole: window.userRole
                });
            }
        };
        
        // Garantir que o botÃ£o Ã© sempre clicÃ¡vel
        btnGerenciarUsuarios.style.pointerEvents = 'auto';
        btnGerenciarUsuarios.style.cursor = 'pointer';
        btnGerenciarUsuarios.disabled = false;
        
        debugLog('[DEBUG] Evento configurado para Gerenciar UsuÃ¡rios');
    } else {
        console.warn('[AVISO] BotÃ£o Gerenciar UsuÃ¡rios nÃ£o encontrado no DOM!');
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
                debugLog('[DEBUG] Verificando funÃ§Ã£o limparDadosTeste...');
                
                if (typeof window.limparDadosTeste !== 'function') {
                    console.error('[ERRO] limparDadosTeste nÃ£o estÃ¡ definida!');
                    alert('Erro: FunÃ§Ã£o limparDadosTeste nÃ£o encontrada!');
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
        
        // Garantir que o botÃ£o Ã© sempre clicÃ¡vel
        btnLimpeza.style.pointerEvents = 'auto';
        btnLimpeza.style.cursor = 'pointer';
        btnLimpeza.disabled = false;
        
        debugLog('[DEBUG] Evento configurado para Limpeza');
    } else {
        console.warn('[AVISO] BotÃ£o Limpeza nÃ£o encontrado no DOM!');
        
        // Tentar encontrar o botÃ£o por outros meios
        const limpezaAlt = document.querySelector('#limpeza-btn');
        const limpezaByText = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent && btn.textContent.includes('Limpar Dados')
        );
        
        debugLog('[DEBUG] Busca alternativa do botÃ£o limpeza:', {
            porId: !!limpezaAlt,
            porTexto: !!limpezaByText,
            todosOsBotoes: document.querySelectorAll('button').length
        });
        
        if (limpezaAlt || limpezaByText) {
            const btnAlternativo = limpezaAlt || limpezaByText;
            debugLog('[DEBUG] BotÃ£o limpeza encontrado por busca alternativa');
            btnAlternativo.onclick = () => {
                if (typeof window.limparDadosTeste === 'function') {
                    window.limparDadosTeste();
                } else {
                    alert('FunÃ§Ã£o de limpeza nÃ£o disponÃ­vel');
                }
            };
        }
    }
    
    debugLog('[DEBUG] ===== FIM CONFIGURAÃ‡ÃƒO EVENTOS BOTÃ•ES =====');
    
    // LIMPEZA FINAL DE BOTÃ•ES DEBUG APÃ“S CONFIGURAÃ‡ÃƒO
    setTimeout(() => {
        if (typeof window.forceRemoveDebugButtons === 'function') {
            window.forceRemoveDebugButtons();
        }
    }, 200);
    
    // Fallback: Garantir que os botÃµes principais sempre funcionem
    setTimeout(() => {
        debugLog('[DEBUG] Aplicando fallback para botÃµes crÃ­ticos...');
        
        const btnGerenciar = document.getElementById('manage-users-btn');
        const btnRel = document.getElementById('relatorios-btn');
        const btnLimp = document.getElementById('limpeza-btn');
        
        if (btnGerenciar && !btnGerenciar.onclick && window.userRole) {
            debugLog('[DEBUG] Aplicando fallback para Gerenciar UsuÃ¡rios');
            btnGerenciar.onclick = () => window.showManageUsersModal();
        }
        
        if (btnRel && !btnRel.onclick && window.userRole) {
            debugLog('[DEBUG] Aplicando fallback para RelatÃ³rios');
            btnRel.onclick = () => window.mostrarRelatorios();
        }
        
        if (btnLimp && !btnLimp.onclick && window.userRole === 'super_admin') {
            debugLog('[DEBUG] Aplicando fallback para Limpeza');
            btnLimp.onclick = () => window.limparDadosTeste();
        }
    }, 100);
}

// FunÃ§Ã£o auxiliar para reconfigurar botÃµes quando necessÃ¡rio

// FunÃ§Ã£o auxiliar para reconfigurar botÃµes quando necessÃ¡rio
window.reconfigurarBotoes = function() {
    debugLog('[DEBUG] reconfigurarBotoes: forÃ§ando reconfiguraÃ§Ã£o...');
    
    // PRIMEIRO: Limpar botÃµes debug antes de qualquer coisa
    if (typeof window.forceRemoveDebugButtons === 'function') {
        window.forceRemoveDebugButtons();
    }
    
    // Remove flags de configuraÃ§Ã£o para forÃ§ar reconfiguraÃ§Ã£o
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
    
    // Reconfigura os botÃµes
    atualizarVisibilidadeBotoes();
    configurarEventosBotoes();
    
    debugLog('[DEBUG] reconfigurarBotoes: reconfiguraÃ§Ã£o concluÃ­da');
};

// FunÃ§Ã£o de debug para verificar estado dos modais
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

// FunÃ§Ã£o de teste para os botÃµes
window.testarBotoes = function() {
    console.log('=== TESTE DOS BOTÃ•ES ===');
    
    const btnCriar = document.getElementById('btn-novo-usuario');
    const btnGerenciar = document.getElementById('manage-users-btn');
    const btnLimpeza = document.getElementById('limpeza-btn');
    
    console.log('BotÃ£o Criar UsuÃ¡rio:', {
        existe: !!btnCriar,
        visivel: btnCriar ? !btnCriar.classList.contains('btn-hide') : false,
        display: btnCriar ? btnCriar.style.display : 'N/A',
        onclick: btnCriar ? !!btnCriar.onclick : false
    });
    
    console.log('BotÃ£o Gerenciar UsuÃ¡rios:', {
        existe: !!btnGerenciar,
        visivel: btnGerenciar ? !btnGerenciar.classList.contains('btn-hide') : false,
        display: btnGerenciar ? btnGerenciar.style.display : 'N/A',
        onclick: btnGerenciar ? !!btnGerenciar.onclick : false
    });
    
    console.log('BotÃ£o Limpeza:', {
        existe: !!btnLimpeza,
        visivel: btnLimpeza ? !btnLimpeza.classList.contains('btn-hide') : false,
        display: btnLimpeza ? btnLimpeza.style.display : 'N/A',
        onclick: btnLimpeza ? !!btnLimpeza.onclick : false
    });
    
    console.log('FunÃ§Ãµes disponÃ­veis:', {
        showCreateUserModal: typeof window.showCreateUserModal,
        showManageUsersModal: typeof window.showManageUsersModal,
        limparDadosTeste: typeof window.limparDadosTeste,
        userRole: window.userRole,
        usuarioAdmin: !!window.usuarioAdmin
    });
    
    // Teste manual dos modals
    console.log('Testando funÃ§Ã£o showCreateUserModal...');
    try {
        if (typeof window.showCreateUserModal === 'function') {
            console.log('âœ… showCreateUserModal estÃ¡ disponÃ­vel');
        } else {
            console.error('âŒ showCreateUserModal NÃƒO estÃ¡ disponÃ­vel');
        }
    } catch (e) {
        console.error('âŒ Erro ao verificar showCreateUserModal:', e);
    }
    
    console.log('Testando funÃ§Ã£o showManageUsersModal...');
    try {
        if (typeof window.showManageUsersModal === 'function') {
            console.log('âœ… showManageUsersModal estÃ¡ disponÃ­vel');
        } else {
            console.error('âŒ showManageUsersModal NÃƒO estÃ¡ disponÃ­vel');
        }
    } catch (e) {
        console.error('âŒ Erro ao verificar showManageUsersModal:', e);
    }
    
    console.log('=== FIM DO TESTE ===');
};

// FunÃ§Ã£o para forÃ§ar inicializaÃ§Ã£o completa dos botÃµes
window.forcarInicializacao = function() {
    console.log('[FORCE] ForÃ§ando inicializaÃ§Ã£o completa...');
    
    // Garantir que todas as funÃ§Ãµes estÃ£o definidas
    if (typeof window.showCreateUserModal !== 'function') {
        console.error('[FORCE] showCreateUserModal nÃ£o estÃ¡ definida - redefinindo...');
        // A funÃ§Ã£o jÃ¡ estÃ¡ definida acima no cÃ³digo
    }
    
    if (typeof window.showManageUsersModal !== 'function') {
        console.error('[FORCE] showManageUsersModal nÃ£o estÃ¡ definida - redefinindo...');
        // A funÃ§Ã£o jÃ¡ estÃ¡ definida acima no cÃ³digo
    }
    
    // ForÃ§ar atualizaÃ§Ã£o de visibilidade
    atualizarVisibilidadeBotoes();
    
    // Reconfigurar eventos
    configurarEventosBotoes();
    
    // Teste final
    window.testarBotoes();
    
    console.log('[FORCE] InicializaÃ§Ã£o forÃ§ada concluÃ­da');
};

// FunÃ§Ã£o de inicializaÃ§Ã£o de emergÃªncia para quando Firebase falha
window.inicializacaoEmergencia = function() {
    console.log('[EMERGENCY] Iniciando modo de emergÃªncia...');
    
    // Definir usuÃ¡rio admin de emergÃªncia
    window.userRole = 'admin';
    window.usuarioAdmin = { 
        role: 'admin', 
        nome: 'Admin EmergÃªncia', 
        email: 'admin@emergencia.local',
        isAdmin: true
    };
    
    // Mostrar painel
    document.getElementById('auth-section')?.classList.add('hidden');
    document.getElementById('admin-panel')?.classList.remove('hidden');
    
    // ForÃ§ar visibilidade dos botÃµes
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
    
    showToast('Modo EmergÃªncia', 'Sistema iniciado em modo de emergÃªncia - funcionalidade limitada', 'warning');
    
    console.log('[EMERGENCY] Modo de emergÃªncia ativo');
};

// Expor funÃ§Ã£o para debug direto no console
window.debug = {
    testarBotoes: window.testarBotoes,
    debugModals: window.debugModals,
    forcarInicializacao: window.forcarInicializacao,
    reconfigurarBotoes: window.reconfigurarBotoes,
    inicializacaoEmergencia: window.inicializacaoEmergencia,
    loginDev: window.loginDesenvolvimento
};

// ========== FUNÃ‡Ã•ES DE ACESSO RÃPIDO ==========
// Para usar no console quando hÃ¡ problemas de login:

// 1. Login rÃ¡pido de desenvolvimento
window.loginRapido = function() {
    console.log('ðŸš€ ATIVANDO LOGIN RÃPIDO...');
    window.loginDesenvolvimento('admin@rapido.local');
    console.log('âœ… Login rÃ¡pido ativado!');
    return 'Login realizado em modo desenvolvimento';
};

// 2. Corrigir tudo de uma vez
window.corrigirTudo = function() {
    console.log('ðŸ”§ CORRIGINDO TODOS OS PROBLEMAS...');
    
    // 1. Login de desenvolvimento
    window.loginDesenvolvimento('admin@corrigir.local');
    
    // 2. Configurar botÃµes
    setTimeout(() => {
        window.solucionarBotoes();
    }, 500);
    
    // 3. Mostrar painel
    setTimeout(() => {
        mostrarSecaoPainel('painel');
    }, 1000);
    
    console.log('ðŸŽ‰ TUDO CORRIGIDO!');
    return 'Sistema totalmente funcional em modo desenvolvimento';
};

// 3. Criar usuÃ¡rio admin de teste (se Firebase estiver funcionando)
window.criarUsuarioTeste = async function() {
    console.log('ðŸ‘¤ CRIANDO USUÃRIO DE TESTE...');
    
    if (!window.auth) {
        console.error('Firebase Auth nÃ£o disponÃ­vel');
        return 'Firebase nÃ£o disponÃ­vel';
    }
    
    const emailTeste = 'admin@teste.com';
    const senhaTeste = '123456';
    
    try {
        // Tentar criar o usuÃ¡rio
        const userCredential = await window.auth.createUserWithEmailAndPassword(emailTeste, senhaTeste);
        console.log('âœ… UsuÃ¡rio de teste criado:', emailTeste);
        
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
                    gerenciarSolicitacoes: true,       // Admin pode gerenciar solicitaÃ§Ãµes
                    gerenciarAcompanhantes: false,     // Apenas super_admin
                    verMetricas: true,                 // Admin pode ver mÃ©tricas
                    verPesquisaSatisfacao: true        // Admin pode ver pesquisa satisfaÃ§Ã£o
                }
            });
            console.log('âœ… UsuÃ¡rio adicionado como admin no Firestore');
        }
        
        showToast('Sucesso', `UsuÃ¡rio criado: ${emailTeste} / 123456`, 'success');
        return `UsuÃ¡rio criado: ${emailTeste} / senha: ${senhaTeste}`;
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('âœ… UsuÃ¡rio jÃ¡ existe:', emailTeste);
            showToast('Info', `UsuÃ¡rio jÃ¡ existe: ${emailTeste} / 123456`, 'warning');
            return `UsuÃ¡rio jÃ¡ existe: ${emailTeste} / senha: ${senhaTeste}`;
        } else {
            console.error('âŒ Erro ao criar usuÃ¡rio:', error);
            showToast('Erro', 'Erro ao criar usuÃ¡rio de teste', 'error');
            return 'Erro ao criar usuÃ¡rio: ' + error.message;
        }
    }
};

// 4. Mostrar ajuda de desenvolvimento
window.mostrarAjudaDev = function() {
    const devHelp = document.getElementById('dev-help');
    if (devHelp) {
        devHelp.style.display = 'block';
        console.log('â„¹ï¸ Ajuda de desenvolvimento exibida');
    }
};

// 6. FunÃ§Ã£o para atualizar permissÃµes de usuÃ¡rios admin existentes
window.atualizarPermissoesAdmin = async function() {
    console.log('ðŸ”§ ATUALIZANDO PERMISSÃ•ES DE USUÃRIOS ADMIN...');
    
    if (!window.db) {
        console.error('Firestore nÃ£o disponÃ­vel');
        return 'Firestore nÃ£o disponÃ­vel';
    }
    
    try {
        // Buscar todos os usuÃ¡rios admin
        const adminSnapshot = await window.db.collection('usuarios_admin').get();
        let atualizados = 0;
        
        for (const doc of adminSnapshot.docs) {
            const userData = doc.data();
            
            // Se for admin (nÃ£o super_admin) e tem permissÃµes antigas
            if (userData.role === 'admin') {
                console.log(`Atualizando permissÃµes para: ${userData.email}`);
                
                await window.db.collection('usuarios_admin').doc(doc.id).update({
                    'permissoes.criarUsuarios': false,
                    'permissoes.gerenciarDepartamentos': false,
                    'permissoes.verRelatorios': true,
                    'permissoes.gerenciarSolicitacoes': true,
                    'permissoes.gerenciarAcompanhantes': false,
                    'permissoes.verMetricas': true,
                    'permissoes.verPesquisaSatisfacao': true,
                    'atualizadoEm': new Date().toISOString()
                });
                
                atualizados++;
                console.log(`âœ… PermissÃµes atualizadas para: ${userData.email}`);
            }
        }
        
        showToast('Sucesso', `${atualizados} usuÃ¡rios admin atualizados`, 'success');
        return `${atualizados} usuÃ¡rios admin atualizados com novas permissÃµes`;
        
    } catch (error) {
        console.error('âŒ Erro ao atualizar permissÃµes:', error);
        showToast('Erro', 'Erro ao atualizar permissÃµes', 'error');
        return 'Erro ao atualizar permissÃµes: ' + error.message;
    }
};

// 7. FunÃ§Ã£o para mostrar todas as opÃ§Ãµes disponÃ­veis
window.ajuda = function() {
    console.log(`
ðŸ†˜ === FUNÃ‡Ã•ES DE AJUDA DISPONÃVEIS ===

PARA PROBLEMAS DE LOGIN:
â€¢ loginRapido() - Login rÃ¡pido em modo desenvolvimento
â€¢ corrigirTudo() - Corrige todos os problemas de uma vez
â€¢ criarUsuarioTeste() - Cria usuÃ¡rio admin@teste.com / 123456
â€¢ atualizarPermissoesAdmin() - Atualiza permissÃµes de usuÃ¡rios admin existentes

PARA PROBLEMAS DE BOTÃ•ES:
â€¢ solucionarBotoes() - ForÃ§a funcionamento dos botÃµes
â€¢ debug.testarBotoes() - Testa estado dos botÃµes
â€¢ debug.forcarInicializacao() - ForÃ§a reinicializaÃ§Ã£o

PARA DEBUG:
â€¢ debug.debugModals() - Verifica estado dos modais
â€¢ debug.inicializacaoEmergencia() - Modo emergÃªncia completo
â€¢ mostrarAjudaDev() - Mostra ajuda na tela

EXEMPLO DE USO:
Se os botÃµes nÃ£o funcionam apÃ³s login, execute:
corrigirTudo()

Se precisar atualizar permissÃµes de admins, execute:
atualizarPermissoesAdmin()

==========================================
    `);
    
    return 'Veja o console para lista completa de funÃ§Ãµes';
};

// FunÃ§Ãµes para fechar modais
window.closeCreateUserModal = function() {
    debugLog('[DEBUG] closeCreateUserModal: fechando modal...');
    const modal = document.getElementById('modal-novo-usuario');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        debugLog('[DEBUG] closeCreateUserModal: modal fechado');
    }
};

// FunÃ§Ã£o de teste para verificar as melhorias nos cards
function testarMelhoriasCards() {
    console.log('[TESTE] Verificando melhorias nos cards...');
    
    // Log das funÃ§Ãµes existentes
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

// FunÃ§Ãµes para gerenciar status das solicitaÃ§Ãµes (para equipes)
async function alterarStatusSolicitacao(solicitacaoId, novoStatus) {
    if (!window.db || !solicitacaoId) {
        showToast('Erro', 'ParÃ¢metros invÃ¡lidos', 'error');
        return;
    }

    try {
        console.log(`[DEBUG] Iniciando alteraÃ§Ã£o de status: ${solicitacaoId} -> ${novoStatus}`);
        
        // Mostrar loading
        const loadingToast = showToast('Aguarde', 'Atualizando status...', 'info');
        
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        // Verificar se o usuÃ¡rio pode alterar esta solicitaÃ§Ã£o
        const solicitacaoDoc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!solicitacaoDoc.exists) {
            showToast('Erro', 'SolicitaÃ§Ã£o nÃ£o encontrada', 'error');
            return;
        }
        
        const solicitacaoData = solicitacaoDoc.data();
        
        // Verificar permissÃµes usando a funÃ§Ã£o de filtro
        if (!podeVerSolicitacaoJS(usuarioAdmin, solicitacaoData)) {
            showToast('Erro', 'VocÃª nÃ£o tem permissÃ£o para alterar esta solicitaÃ§Ã£o', 'error');
            console.warn('[AVISO] alterarStatusSolicitacao: acesso negado para equipe:', usuarioAdmin.equipe, 'solicitaÃ§Ã£o equipe:', solicitacaoData.equipe);
            return;
        }
        
        // Verificar se o status Ã© vÃ¡lido
        const statusValidos = ['pendente', 'em-andamento', 'finalizada'];
        if (!statusValidos.includes(novoStatus)) {
            showToast('Erro', 'Status invÃ¡lido', 'error');
            return;
        }
        
        console.log(`[DEBUG] Alterando status da solicitaÃ§Ã£o ${solicitacaoId} para ${novoStatus}`);
        
        const agora = new Date();
        const updateData = {
            status: novoStatus,
            dataAtualizacao: agora.toISOString()
        };

        // Se estÃ¡ iniciando atendimento, adicionar responsÃ¡vel e mÃ©tricas de inÃ­cio
        if (novoStatus === 'em-andamento' && usuarioAdmin.nome) {
            updateData.responsavel = usuarioAdmin.nome;
            updateData.dataInicioAtendimento = agora.toISOString();
            updateData.tempoInicioAtendimento = firebase.firestore.FieldValue.serverTimestamp();
            
            // Calcular tempo de espera (do registro atÃ© inÃ­cio do atendimento)
            if (solicitacaoData.criadoEm || solicitacaoData.dataAbertura) {
                let dataCreacao;
                
                // Tentar parsear data de criaÃ§Ã£o de diferentes formatos
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

        // Se estÃ¡ pausando, calcular tempo trabalhado
        if (novoStatus === 'pendente' && solicitacaoData.status === 'em-andamento') {
            if (solicitacaoData.dataInicioAtendimento) {
                const inicioAtendimento = new Date(solicitacaoData.dataInicioAtendimento);
                const tempoTrabalhadoMinutos = Math.round((agora - inicioAtendimento) / (1000 * 60));
                
                // Somar ao tempo total trabalhado (se jÃ¡ existir)
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
        
        let mensagemErro = 'NÃ£o foi possÃ­vel alterar o status';
        if (error.code === 'permission-denied') {
            mensagemErro = 'VocÃª nÃ£o tem permissÃ£o para esta aÃ§Ã£o';
        } else if (error.code === 'unavailable') {
            mensagemErro = 'ServiÃ§o temporariamente indisponÃ­vel. Tente novamente';
        } else if (error.code === 'not-found') {
            mensagemErro = 'SolicitaÃ§Ã£o nÃ£o encontrada';
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
        showToast('Erro', 'ParÃ¢metros invÃ¡lidos', 'error');
        return;
    }

    try {
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        // Verificar se o usuÃ¡rio pode finalizar esta solicitaÃ§Ã£o
        const solicitacaoDoc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!solicitacaoDoc.exists) {
            showToast('Erro', 'SolicitaÃ§Ã£o nÃ£o encontrada', 'error');
            return;
        }
        
        const solicitacaoData = solicitacaoDoc.data();
        
        // Verificar permissÃµes usando a funÃ§Ã£o de filtro
        if (!podeVerSolicitacaoJS(usuarioAdmin, solicitacaoData)) {
            showToast('Erro', 'VocÃª nÃ£o tem permissÃ£o para finalizar esta solicitaÃ§Ã£o', 'error');
            console.warn('[AVISO] finalizarSolicitacao: acesso negado para equipe:', usuarioAdmin.equipe, 'solicitaÃ§Ã£o equipe:', solicitacaoData.equipe);
            return;
        }

        // Criar modal de finalizaÃ§Ã£o
        const modalFinalizacao = document.createElement('div');
        modalFinalizacao.id = 'modal-finalizacao';
        modalFinalizacao.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1001;';
        
        modalFinalizacao.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); max-height: 80vh; overflow-y: auto;">
                <h3 style="margin: 0 0 16px 0; color: #059669; display: flex; align-items: center;">
                    <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                    Finalizar SolicitaÃ§Ã£o
                </h3>
                
                <!-- DescriÃ§Ã£o da SoluÃ§Ã£o -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
                        <i class="fas fa-edit" style="margin-right: 6px;"></i>
                        DescriÃ§Ã£o da SoluÃ§Ã£o (opcional):
                    </label>
                    <textarea 
                        id="solucao-descricao" 
                        placeholder="Ex: Problema de encanamento resolvido, troca de torneira realizada..."
                        style="width: 100%; height: 80px; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical; font-family: inherit; box-sizing: border-box;"
                    ></textarea>
                </div>
                
                <!-- Upload de EvidÃªncias -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
                        <i class="fas fa-camera" style="margin-right: 6px;"></i>
                        EvidÃªncias do ServiÃ§o (opcional):
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
                                <small>Fotos, PDFs ou documentos (mÃ¡x. 5 arquivos, 10MB cada)</small>
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
                        <i class="fas fa-check" style="margin-right: 4px;"></i>Confirmar FinalizaÃ§Ã£o
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
        console.error('Erro ao abrir modal de finalizaÃ§Ã£o:', error);
        showToast('Erro', 'NÃ£o foi possÃ­vel abrir o modal de finalizaÃ§Ã£o: ' + (error.message || error), 'error');
    }
}

async function confirmarFinalizacao(solicitacaoId) {
    try {
        // Desabilitar botÃ£o para evitar duplo clique
        const btnConfirmar = document.getElementById('btn-confirmar-finalizacao');
        if (btnConfirmar) {
            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 4px;"></i>Processando...';
        }
        
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const solucao = document.getElementById('solucao-descricao')?.value || '';
        
        // Processar upload de evidÃªncias primeiro (se houver)
        let evidencias = [];
        if (arquivosEvidencias && arquivosEvidencias.length > 0) {
            console.log(`[DEBUG] Processando ${arquivosEvidencias.length} evidÃªncia(s)...`);
            showToast('Info', 'Processando evidÃªncias...', 'info');
            
            try {
                evidencias = await uploadEvidenciasParaFirebase(solicitacaoId);
                console.log(`[DEBUG] EvidÃªncias processadas com sucesso:`, evidencias.length);
            } catch (error) {
                console.error('[ERRO] Falha no upload das evidÃªncias:', error);
                showToast('Erro', 'Falha ao processar evidÃªncias. Tente novamente.', 'error');
                
                // Reabilitar botÃ£o
                if (btnConfirmar) {
                    btnConfirmar.disabled = false;
                    btnConfirmar.innerHTML = '<i class="fas fa-check" style="margin-right: 4px;"></i>Confirmar FinalizaÃ§Ã£o';
                }
                return;
            }
        }
        
        // Buscar dados atuais da solicitaÃ§Ã£o para calcular mÃ©tricas
        const solicitacaoDoc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!solicitacaoDoc.exists) {
            showToast('Erro', 'SolicitaÃ§Ã£o nÃ£o encontrada', 'error');
            return;
        }
        
        const solicitacaoData = solicitacaoDoc.data();
        const agora = new Date();
        
        console.log(`[DEBUG] Finalizando solicitaÃ§Ã£o ${solicitacaoId} com ${evidencias.length} evidÃªncia(s)`);
        
        const updateData = {
            status: 'finalizada',
            dataFinalizacao: agora.toISOString(),
            finalizadoEm: firebase.firestore.FieldValue.serverTimestamp(), // Para o listener detectar
            tempoFinalizacao: firebase.firestore.FieldValue.serverTimestamp(),
            dataAtualizacao: agora.toISOString(),
            avaliada: false // Marca que ainda nÃ£o foi avaliada pelo acompanhante
        };

        if (usuarioAdmin.nome) {
            updateData.responsavel = usuarioAdmin.nome;
        }

        if (solucao.trim()) {
            updateData.solucao = solucao.trim();
        }
        
        // Adicionar evidÃªncias se houver
        if (evidencias.length > 0) {
            updateData.evidencias = evidencias;
            updateData.possuiEvidencias = true;
            console.log(`[DEBUG] Adicionando ${evidencias.length} evidÃªncia(s) Ã  solicitaÃ§Ã£o`);
        }

        // Calcular mÃ©tricas de tempo completas
        if (solicitacaoData.criadoEm || solicitacaoData.dataAbertura) {
            let dataCreacao;
            
            // Tentar parsear data de criaÃ§Ã£o de diferentes formatos
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
                // Tempo total de resoluÃ§Ã£o (do registro atÃ© finalizaÃ§Ã£o)
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
                
                // Calcular SLA e definir prioridades baseadas no tipo de serviÃ§o
                const slaConfig = {
                    'manutencao': { slaMinutos: 240, prioridade: 'alta' },     // 4 horas
                    'nutricao': { slaMinutos: 60, prioridade: 'critica' },     // 1 hora
                    'higienizacao': { slaMinutos: 120, prioridade: 'media' },  // 2 horas
                    'hotelaria': { slaMinutos: 180, prioridade: 'media' }      // 3 horas
                };
                
                const config = slaConfig[solicitacaoData.equipe] || { slaMinutos: 240, prioridade: 'media' };
                const statusSLA = tempoTotalMinutos <= config.slaMinutos ? 'cumprido' : 'violado';
                
                // MÃ©tricas completas
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
                
                // Log das mÃ©tricas para anÃ¡lise
                console.log('ðŸ“Š MÃ‰TRICAS DA SOLICITAÃ‡ÃƒO:', {
                    id: solicitacaoId,
                    equipe: solicitacaoData.equipe,
                    tempoTotal: `${tempoTotalMinutos} min`,
                    tempoTrabalho: `${tempoTrabalho} min`,
                    sla: `${config.slaMinutos} min`,
                    status: statusSLA,
                    eficiencia: `${Math.round((tempoTrabalho / tempoTotalMinutos) * 100)}%`
                });
            } else {
                console.warn('NÃ£o foi possÃ­vel calcular mÃ©tricas - data de criaÃ§Ã£o invÃ¡lida');
            }
        } else {
            console.warn('NÃ£o foi possÃ­vel calcular mÃ©tricas - sem data de criaÃ§Ã£o');
        }

        await window.db.collection('solicitacoes').doc(solicitacaoId).update(updateData);
        
        showToast('Sucesso', 'SolicitaÃ§Ã£o finalizada com sucesso!', 'success');
        
        // Limpar evidÃªncias apÃ³s sucesso
        arquivosEvidencias = [];
        
        // Remover modal de finalizaÃ§Ã£o
        const modalFinalizacao = document.getElementById('modal-finalizacao');
        if (modalFinalizacao) modalFinalizacao.remove();
        
        // CORREÃ‡ÃƒO APLICADA: NÃƒO abrir pesquisa no admin - ela deve ir para o acompanhante!
        // O listener no portal dos acompanhantes detectarÃ¡ a finalizaÃ§Ã£o e abrirÃ¡ a pesquisa
        // AtualizaÃ§Ã£o forÃ§ada: pesquisa vai para o solicitante via listener em tempo real
        console.log('âœ… SolicitaÃ§Ã£o finalizada - pesquisa serÃ¡ enviada ao acompanhante automaticamente via listener');
        
        // Fechar modal principal e recarregar dados
        fecharSolicitacaoModal();
        
        // CORREÃ‡ÃƒO CRÃTICA: Usar recarregarSolicitacoes() que limpa AMBAS as flags
        // ao invÃ©s de carregarSolicitacoes() diretamente
        recarregarSolicitacoes(0); // 0 = sem delay, recarregar imediatamente
        
    } catch (error) {
        console.error('Erro ao finalizar solicitaÃ§Ã£o:', error);
        showToast('Erro', 'NÃ£o foi possÃ­vel finalizar a solicitaÃ§Ã£o: ' + (error.message || error), 'error');
        
        // Reabilitar botÃ£o em caso de erro
        const btnConfirmar = document.getElementById('btn-confirmar-finalizacao');
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = '<i class="fas fa-check" style="margin-right: 4px;"></i>Confirmar FinalizaÃ§Ã£o';
        }
    }
}

// Expor funÃ§Ãµes globalmente para uso nos modais
window.alterarStatusSolicitacao = alterarStatusSolicitacao;
window.finalizarSolicitacao = finalizarSolicitacao;
window.confirmarFinalizacao = confirmarFinalizacao;
window.abrirSolicitacaoModal = abrirSolicitacaoModal;
window.fecharSolicitacaoModal = fecharSolicitacaoModal;
window.abrirDashboardMetricas = abrirDashboardMetricas;
window.fecharDashboardMetricas = fecharDashboardMetricas;

// FunÃ§Ã£o para abrir dashboard de mÃ©tricas
async function abrirDashboardMetricas() {
    try {
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        // Determinar se deve mostrar mÃ©tricas de todas as equipes ou apenas da equipe do usuÃ¡rio
        const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
        const isAdmin = usuarioAdmin && usuarioAdmin.role === 'admin';
        const equipeUsuario = usuarioAdmin && usuarioAdmin.equipe;
        
        console.log('ðŸ” DASHBOARD MÃ‰TRICAS AVANÃ‡ADO:', {
            usuario: usuarioAdmin.nome,
            role: usuarioAdmin.role,
            equipe: equipeUsuario,
            mostrarTodas: isSuperAdmin || isAdmin
        });
        
        // Buscar todas as solicitaÃ§Ãµes para anÃ¡lise avanÃ§ada
        let query = window.db.collection('solicitacoes').limit(500);
        
        // Se nÃ£o for super_admin ou admin, filtrar apenas pela equipe do usuÃ¡rio
        if (!isSuperAdmin && !isAdmin && equipeUsuario) {
            query = query.where('equipe', '==', equipeUsuario);
        }
        
        const snapshot = await query.get();
        
        // Processar dados para diferentes perÃ­odos
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
        
        // Calcular mÃ©tricas avanÃ§adas
        const metricasAvancadas = calcularMetricasAvancadas(todasSolicitacoes, solicitacoes30dias, solicitacoes7dias);
        
        // Criar modal de dashboard avanÃ§ado
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
            nomeUsuario: usuarioAdmin.nome || 'UsuÃ¡rio'
        });
        modal.style.display = 'flex';
        
        // Renderizar grÃ¡ficos apÃ³s o modal estar no DOM
        setTimeout(() => {
            renderizarGraficos(metricasAvancadas);
            configurarAlertasInteligentes(metricasAvancadas);
        }, 100);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showToast('Erro', 'NÃ£o foi possÃ­vel carregar o dashboard de mÃ©tricas', 'error');
    }
}

function fecharDashboardMetricas() {
    const modal = document.getElementById('dashboard-metricas');
    if (modal) {
        modal.style.display = 'none';
        // Destruir grÃ¡ficos para liberar memÃ³ria
        if (window.chartInstances) {
            Object.values(window.chartInstances).forEach(chart => chart.destroy());
            window.chartInstances = {};
        }
    }
}

// ===== FUNÃ‡Ã•ES DE MÃ‰TRICAS AVANÃ‡ADAS =====

function calcularMetricasAvancadas(todasSolicitacoes, solicitacoes30dias, solicitacoes7dias) {
    const agora = new Date();
    
    const metricas = {
        // MÃ©tricas bÃ¡sicas
        totais: {
            todas: todasSolicitacoes.length,
            ultimos30dias: solicitacoes30dias.length,
            ultimos7dias: solicitacoes7dias.length
        },
        
        // Status distribution
        statusDistribution: calcularDistribuicaoStatus(solicitacoes30dias),
        
        // MÃ©tricas por equipe
        porEquipe: calcularMetricasPorEquipe(solicitacoes30dias),
        
        // TendÃªncias temporais
        tendencias: calcularTendencias(todasSolicitacoes),
        
        // Picos de demanda
        picosDemanda: calcularPicosDemanda(solicitacoes30dias),
        
        // Alertas
        alertas: calcularAlertas(solicitacoes30dias),
        
        // Performance e eficiÃªncia
        performance: calcularPerformanceGeral(solicitacoes30dias),
        
        // SatisfaÃ§Ã£o integrada
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
        
        // Calcular mÃ©tricas de tempo para finalizadas
        if (sol.status === 'finalizada' && sol.metricas) {
            const tempo = sol.metricas.tempoTotal || 0;
            equipeData.tempos.push(tempo);
        }
        
        // Alerta de acÃºmulo (mais de 5 pendentes + em-andamento)
        equipeData.alertaAcumulo = (equipeData.pendentes + equipeData.emAndamento) > 5;
    });
    
    // Calcular mÃ©dias
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
    
    // Agrupar por dia nos Ãºltimos 7 dias
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
    
    // SLA prÃ³ximo do limite
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
    // Esta funÃ§Ã£o serÃ¡ integrada com os dados de satisfaÃ§Ã£o
    // Por enquanto, retorna estrutura bÃ¡sica
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

// ===== GERAÃ‡ÃƒO DE HTML AVANÃ‡ADO =====

function gerarHTMLDashboardAvancado(metricas, opcoes = {}) {
    const { isSuperAdmin = false, equipeUsuario = null, nomeUsuario = 'UsuÃ¡rio' } = opcoes;
    
    return `
        <div class="modal-content" style="max-width: 95vw; max-height: 90vh; overflow-y: auto; background: white; border-radius: 12px; padding: 0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0; position: sticky; top: 0; z-index: 10;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem;">ðŸ“Š Dashboard Executivo - MÃ©tricas AvanÃ§adas</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">${isSuperAdmin ? 'VisÃ£o Completa' : 'Equipe: ' + equipeUsuario} | ${nomeUsuario}</p>
                    </div>
                    <button onclick="fecharDashboardMetricas()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer;">Ã—</button>
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

            <!-- GrÃ¡ficos -->
            <div style="padding: 0 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- GrÃ¡fico de Status -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">Status das SolicitaÃ§Ãµes</h3>
                        <canvas id="grafico-status" width="300" height="200"></canvas>
                    </div>
                    
                    <!-- GrÃ¡fico de Performance por Equipe -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">Performance por Equipe</h3>
                        <canvas id="grafico-equipes" width="300" height="200"></canvas>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- TendÃªncias -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">TendÃªncia de Demanda (7 dias)</h3>
                        <canvas id="grafico-tendencias" width="500" height="200"></canvas>
                    </div>
                    
                    <!-- Picos de Demanda -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #374151;">Picos por Hora</h3>
                        <canvas id="grafico-picos" width="250" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- MÃ©tricas Detalhadas por Equipe -->
            <div style="padding: 20px;">
                <h3 style="margin: 0 0 20px 0; color: #374151;">AnÃ¡lise Detalhada por Equipe</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                    ${gerarCardsEquipes(metricas.porEquipe)}
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 15px 20px; text-align: center; color: #6b7280; font-size: 0.9rem; border-radius: 0 0 12px 12px;">
                Atualizado em: ${new Date().toLocaleString('pt-BR')} | Sistema YUNA v2.0
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
                <strong>${alerta.equipe}:</strong> SLA ${alerta.percentual}% - SolicitaÃ§Ã£o ${alerta.solicitacao}
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
            <div style="opacity: 0.9;">TMA MÃ©dio</div>
        </div>
        
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 5px;">${metricas.performance.eficienciaGeral}%</div>
            <div style="opacity: 0.9;">EficiÃªncia</div>
        </div>
    `;
}

function gerarCardsEquipes(equipesMetricas) {
    const equipesNomes = {
        manutencao: 'ManutenÃ§Ã£o',
        nutricao: 'NutriÃ§Ã£o', 
        higienizacao: 'HigienizaÃ§Ã£o',
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
        
        // Verificar se tem mÃ©tricas vÃ¡lidas
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
            // Calcular mÃ©tricas bÃ¡sicas se nÃ£o existirem mÃ©tricas completas
            let dataCreacao = null;
            let dataFinalizaÃ§Ã£o = null;
            
            // Tentar parsear data de criaÃ§Ã£o
            if (sol.criadoEm && typeof sol.criadoEm.toDate === 'function') {
                dataCreacao = sol.criadoEm.toDate();
            } else if (sol.criadoEm && typeof sol.criadoEm === 'string') {
                dataCreacao = new Date(sol.criadoEm);
            } else if (sol.dataAbertura && typeof sol.dataAbertura.toDate === 'function') {
                dataCreacao = sol.dataAbertura.toDate();
            }
            
            // Tentar parsear data de finalizaÃ§Ã£o
            if (sol.dataFinalizacao && typeof sol.dataFinalizacao === 'string') {
                dataFinalizaÃ§Ã£o = new Date(sol.dataFinalizacao);
            } else if (sol.tempoFinalizacao && typeof sol.tempoFinalizacao.toDate === 'function') {
                dataFinalizaÃ§Ã£o = sol.tempoFinalizacao.toDate();
            }
            
            // Se conseguiu parsear ambas as datas, calcular tempo total
            if (dataCreacao && dataFinalizaÃ§Ã£o) {
                const tempoTotal = Math.round((dataFinalizaÃ§Ã£o - dataCreacao) / (1000 * 60));
                if (tempoTotal > 0) {
                    tempoTotalSoma += tempoTotal;
                    equipeMetrica.tempoTotalSoma += tempoTotal;
                    contadorValidos++;
                    equipeMetrica.contadorValidos++;
                    
                    // Verificar SLA bÃ¡sico
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
    
    // Calcular mÃ©dias gerais
    if (contadorValidos > 0) {
        metricas.tmaGeral = Math.round(tempoTotalSoma / contadorValidos);
        metricas.tmeGeral = Math.round(tempoTrabalhoSoma / contadorValidos);
        metricas.eficienciaGeral = tempoTotalSoma > 0 ? Math.round((tempoTrabalhoSoma / tempoTotalSoma) * 100) : 0;
    }
    
    // Calcular mÃ©dias por equipe
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
    const { isSuperAdmin = false, equipeUsuario = null, nomeUsuario = 'UsuÃ¡rio' } = opcoes;
    const slaPercentual = metricas.total > 0 ? Math.round((metricas.slaGeral.cumprido / metricas.total) * 100) : 0;
    
    // TÃ­tulo personalizado baseado no tipo de usuÃ¡rio
    let titulo = 'Dashboard de MÃ©tricas - Ãšltimos 30 dias';
    if (!isSuperAdmin && equipeUsuario) {
        titulo = `Dashboard de MÃ©tricas - Equipe ${equipeUsuario.charAt(0).toUpperCase() + equipeUsuario.slice(1)}`;
    }
    
    // Gerar HTML das equipes (apenas equipe do usuÃ¡rio se nÃ£o for admin)
    let htmlEquipes = '';
    const equipesParaExibir = isSuperAdmin ? 
        Object.entries(metricas.porEquipe) : 
        Object.entries(metricas.porEquipe).filter(([equipe]) => equipe === equipeUsuario);
    
    equipesParaExibir.forEach(([equipe, dados]) => {
        const slaEquipePercentual = dados.total > 0 ? Math.round((dados.sla.cumprido / dados.total) * 100) : 0;
        const slaColor = slaEquipePercentual >= 90 ? '#059669' : slaEquipePercentual >= 70 ? '#d97706' : '#dc2626';
        
        // Nome amigÃ¡vel da equipe
        const nomeEquipe = {
            'manutencao': 'ManutenÃ§Ã£o',
            'nutricao': 'NutriÃ§Ã£o', 
            'higienizacao': 'HigienizaÃ§Ã£o',
            'hotelaria': 'Hotelaria'
        }[equipe] || equipe.charAt(0).toUpperCase() + equipe.slice(1);
        
        // Ãcone da equipe
        const iconeEquipe = {
            'manutencao': 'ðŸ”§',
            'nutricao': 'ðŸ½ï¸',
            'higienizacao': 'ðŸ§½',
            'hotelaria': 'ðŸ›ï¸'
        }[equipe] || 'âš™ï¸';
        
        htmlEquipes += `
            <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid ${slaColor};">
                <h4 style="margin: 0 0 12px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
                    ${iconeEquipe} ${nomeEquipe}
                    ${!isSuperAdmin ? '<span style="font-size: 12px; background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; margin-left: 8px;">Sua Equipe</span>' : ''}
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">
                    <div><strong>SolicitaÃ§Ãµes:</strong> ${dados.total}</div>
                    <div><strong>TMA:</strong> ${dados.tma}min (${Math.round(dados.tma/60*10)/10}h)</div>
                    <div><strong>TME:</strong> ${dados.tme}min (${Math.round(dados.tme/60*10)/10}h)</div>
                    <div><strong>SLA:</strong> <span style="color: ${slaColor}; font-weight: bold;">${slaEquipePercentual}%</span></div>
                    <div><strong>EficiÃªncia:</strong> ${dados.eficiencia}%</div>
                    <div><strong>Cumpridas:</strong> ${dados.sla.cumprido} / ${dados.total}</div>
                </div>
            </div>
        `;
    });
    
    // Se nÃ£o hÃ¡ dados da equipe especÃ­fica, mostrar mensagem
    if (!isSuperAdmin && equipesParaExibir.length === 0 && equipeUsuario) {
        const nomeEquipe = {
            'manutencao': 'ManutenÃ§Ã£o',
            'nutricao': 'NutriÃ§Ã£o', 
            'higienizacao': 'HigienizaÃ§Ã£o',
            'hotelaria': 'Hotelaria'
        }[equipeUsuario] || equipeUsuario.charAt(0).toUpperCase() + equipeUsuario.slice(1);
        
        htmlEquipes = `
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; color: #6b7280;">
                <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <h3 style="margin: 0 0 8px 0; color: #374151;">Nenhuma SolicitaÃ§Ã£o Finalizada</h3>
                <p style="margin: 0; font-size: 14px;">
                    A equipe ${nomeEquipe} ainda nÃ£o possui solicitaÃ§Ãµes finalizadas nos Ãºltimos 30 dias.
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
            <!-- MÃ©tricas Gerais -->
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 16px 0;">ðŸ“Š ${isSuperAdmin ? 'MÃ©tricas Gerais' : 'MÃ©tricas da Sua Equipe'}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${metricas.total}</div>
                        <div style="font-size: 12px; opacity: 0.9;">Total SolicitaÃ§Ãµes</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${metricas.tmaGeral}min</div>
                        <div style="font-size: 12px; opacity: 0.9;">TMA (Tempo MÃ©dio Atendimento)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${metricas.tmeGeral}min</div>
                        <div style="font-size: 12px; opacity: 0.9;">TME (Tempo MÃ©dio ExecuÃ§Ã£o)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${slaPercentual}%</div>
                        <div style="font-size: 12px; opacity: 0.9;">SLA Cumprido</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${metricas.eficienciaGeral}%</div>
                        <div style="font-size: 12px; opacity: 0.9;">EficiÃªncia</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- Desempenho por Equipe -->
            <h3 style="margin: 0 0 16px 0; color: #374151;">
                ${isSuperAdmin ? 'ðŸ‘¥ Desempenho por Equipe' : 'ðŸ“ˆ Desempenho da Sua Equipe'}
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                ${htmlEquipes}
            </div>
            
            <!-- Legenda SLA -->
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 20px;">
                <h4 style="margin: 0 0 8px 0; color: #374151;">ðŸ“‹ DefiniÃ§Ãµes SLA ${!isSuperAdmin && equipeUsuario ? `- ${equipeUsuario.charAt(0).toUpperCase() + equipeUsuario.slice(1)}` : 'por Equipe'}</h4>
                <div style="font-size: 14px; color: #6b7280; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
                    ${isSuperAdmin ? `
                        <div><strong>NutriÃ§Ã£o:</strong> 60 min (CrÃ­tico)</div>
                        <div><strong>HigienizaÃ§Ã£o:</strong> 120 min (MÃ©dio)</div>
                        <div><strong>Hotelaria:</strong> 180 min (MÃ©dio)</div>
                        <div><strong>ManutenÃ§Ã£o:</strong> 240 min (Alto)</div>
                    ` : `
                        <div><strong>${equipeUsuario === 'nutricao' ? 'NutriÃ§Ã£o: 60 min (CrÃ­tico)' : 
                                       equipeUsuario === 'higienizacao' ? 'HigienizaÃ§Ã£o: 120 min (MÃ©dio)' :
                                       equipeUsuario === 'hotelaria' ? 'Hotelaria: 180 min (MÃ©dio)' :
                                       'ManutenÃ§Ã£o: 240 min (Alto)'}</strong></div>
                        <div>Meta: Cumprir SLA em pelo menos 90% das solicitaÃ§Ãµes</div>
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
        
        // CORREÃ‡ÃƒO: Navegar de volta para o painel principal
        debugLog('[DEBUG] closeManageUsersModal: navegando para painel principal...');
        mostrarSecaoPainel('painel');
        debugLog('[DEBUG] closeManageUsersModal: navegaÃ§Ã£o concluÃ­da');
    }
};

// ========== FUNÃ‡ÃƒO DE SOLUÃ‡ÃƒO RÃPIDA ==========
// Execute no console: solucionarBotoes()
window.solucionarBotoes = function() {
    console.log('ðŸ”§ SOLUCIONANDO PROBLEMA DOS BOTÃ•ES...');
    
    // 1. Garantir que o usuÃ¡rio tem permissÃ£o
    if (!window.userRole) {
        window.userRole = 'admin';
        console.log('âœ… UserRole definido como admin');
    }
    
    if (!window.usuarioAdmin) {
        window.usuarioAdmin = { 
            role: 'admin', 
            nome: 'Admin', 
            email: 'admin@yuna.com.br',
            isAdmin: true
        };
        console.log('âœ… UsuarioAdmin definido');
    }
    
    // 2. ForÃ§ar exibiÃ§Ã£o dos botÃµes
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    
    if (btnNovoUsuario) {
        btnNovoUsuario.classList.remove('btn-hide');
        btnNovoUsuario.style.display = 'inline-flex';
        btnNovoUsuario.style.visibility = 'visible';
        btnNovoUsuario.style.pointerEvents = 'auto';
        console.log('âœ… BotÃ£o Criar UsuÃ¡rio exibido');
    }
    
    if (btnGerenciarUsuarios) {
        btnGerenciarUsuarios.classList.remove('btn-hide');
        btnGerenciarUsuarios.style.display = 'inline-flex';
        btnGerenciarUsuarios.style.visibility = 'visible';
        btnGerenciarUsuarios.style.pointerEvents = 'auto';
        console.log('âœ… BotÃ£o Gerenciar UsuÃ¡rios exibido');
    }
    
    // 3. Configurar eventos dos botÃµes
    configurarEventosBotoes();
    console.log('âœ… Eventos dos botÃµes configurados');
    
    // 4. Testar botÃµes
    window.testarBotoes();
    
    console.log('ðŸŽ‰ PROBLEMA RESOLVIDO! Os botÃµes devem funcionar agora.');
    showToast('Sucesso', 'BotÃµes corrigidos com sucesso!', 'success');
    
    return 'SoluÃ§Ã£o aplicada com sucesso!';
};

// ========== MODO DESENVOLVIMENTO ==========
window.loginDesenvolvimento = function(email = 'admin@dev.local') {
    console.log('[DEV] Ativando modo desenvolvimento...');
    
    // Simular usuÃ¡rio admin
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
        badge.textContent = 'Admin Desenvolvimento';
        badge.style.backgroundColor = '#f59e0b'; // Cor diferente para modo dev
    }
    
    // Configurar botÃµes
    setTimeout(() => {
        atualizarVisibilidadeBotoes();
        configurarEventosBotoes();
        
        // ForÃ§ar exibiÃ§Ã£o dos botÃµes
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
        
        console.log('[DEV] BotÃµes configurados em modo desenvolvimento');
    }, 100);
    
    // Mostrar painel principal
    mostrarSecaoPainel('painel');
    
    // Mostrar dados de desenvolvimento nas mÃ©tricas
    setTimeout(() => {
        carregarDadosDesenvolvimento();
    }, 500);
    
    showToast('Modo Dev', 'Modo desenvolvimento ativado - dados simulados', 'warning');
    console.log('[DEV] Modo desenvolvimento ativo');
};

// FunÃ§Ã£o para carregar dados simulados no modo desenvolvimento
window.carregarDadosDesenvolvimento = function() {
    console.log('[DEV] Carregando dados simulados...');
    
    // Simular mÃ©tricas
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
                <div class="team-icon">ðŸ”§</div>
                <div class="team-info">
                    <h3>ManutenÃ§Ã£o</h3>
                    <div class="team-stats">
                        <span class="pendentes">3 pendentes</span>
                        <span class="andamento">2 em andamento</span>
                        <span class="finalizadas">7 finalizadas</span>
                    </div>
                </div>
            </div>
            <div class="team-card" onclick="verSolicitacoesEquipe('nutricao')">
                <div class="team-icon">ðŸ½ï¸</div>
                <div class="team-info">
                    <h3>NutriÃ§Ã£o</h3>
                    <div class="team-stats">
                        <span class="pendentes">2 pendentes</span>
                        <span class="andamento">4 em andamento</span>
                        <span class="finalizadas">1 finalizadas</span>
                    </div>
                </div>
            </div>
            <div class="team-card" onclick="verSolicitacoesEquipe('higienizacao')">
                <div class="team-icon">ðŸ§½</div>
                <div class="team-info">
                    <h3>HigienizaÃ§Ã£o</h3>
                    <div class="team-stats">
                        <span class="pendentes">4 pendentes</span>
                        <span class="andamento">6 em andamento</span>
                        <span class="finalizadas">2 finalizadas</span>
                    </div>
                </div>
            </div>
            <div class="team-card" onclick="verSolicitacoesEquipe('hotelaria')">
                <div class="team-icon">ðŸ¨</div>
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

// FunÃ§Ã£o para enriquecer solicitaÃ§Ãµes com dados do acompanhante
async function enriquecerSolicitacoesComDados(equipes) {
    console.log('[ENRIQUECIMENTO] === INICIANDO ENRIQUECIMENTO DE DADOS ===');
    console.log('[ENRIQUECIMENTO] Equipes recebidas:', Object.keys(equipes));
    
    const equipesEnriquecidas = {};
    
    for (const [nomeEquipe, solicitacoes] of Object.entries(equipes)) {
        console.log(`[ENRIQUECIMENTO] Processando equipe: ${nomeEquipe} com ${solicitacoes.length} solicitaÃ§Ãµes`);
        
        equipesEnriquecidas[nomeEquipe] = await Promise.all(
            solicitacoes.map(async (solicitacao, index) => {
                try {
                    console.log(`[ENRIQUECIMENTO] [${index + 1}/${solicitacoes.length}] Processando solicitaÃ§Ã£o:`, solicitacao.id);
                    
                    const dadosAcompanhante = await buscarDadosAcompanhante(solicitacao);
                    
                    const solicitacaoEnriquecida = {
                        ...solicitacao,
                        nomeAcompanhante: dadosAcompanhante.nome !== 'N/A' && dadosAcompanhante.nome !== 'UsuÃ¡rio' ? dadosAcompanhante.nome : null,
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
                    console.warn('[ENRIQUECIMENTO] Erro ao buscar dados do acompanhante para solicitaÃ§Ã£o', solicitacao.id, ':', error);
                    return solicitacao; // Retorna dados originais em caso de erro
                }
            })
        );
    }
    
    console.log('[ENRIQUECIMENTO] === ENRIQUECIMENTO CONCLUÃDO ===');
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
    
    // Remove loader visual ao finalizar renderizaÃ§Ã£o dos cards
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
        manutencao: 'ManutenÃ§Ã£o',
        nutricao: 'NutriÃ§Ã£o',
        higienizacao: 'HigienizaÃ§Ã£o',
        hotelaria: 'Hotelaria'
    };
    
    // FunÃ§Ã£o para formatar data e hora
    function formatarDataHora(timestamp) {
        if (!timestamp) return 'NÃ£o informado';
        try {
            const data = new Date(timestamp);
            const hoje = new Date();
            const diffTime = hoje - data;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            
            if (diffDays > 0) {
                return `hÃ¡ ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
            } else if (diffHours > 0) {
                return `hÃ¡ ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
            } else if (diffMinutes > 0) {
                return `hÃ¡ ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
            } else {
                return 'agora mesmo';
            }
        } catch (error) {
            return 'Tempo invÃ¡lido';
        }
    }
    
    // FunÃ§Ã£o para obter prioridade visual baseada no status e tempo
    function obterPrioridade(solicitacao) {
        if (solicitacao.status === 'finalizada') return 'baixa';
        if (solicitacao.status === 'em-andamento') return 'media';
        
        // Para solicitaÃ§Ãµes pendentes, verificar tempo
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
    
    // Verificar se hÃ¡ equipes para mostrar
    const equipesParaMostrar = Object.keys(equipes).filter(equipe => 
        equipes[equipe] && Array.isArray(equipes[equipe])
    );
    
    if (equipesParaMostrar.length === 0) {
        gridContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-inbox" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <h3 style="color: #64748b; margin-bottom: 0.5rem;">Nenhuma solicitaÃ§Ã£o encontrada</h3>
                <p style="color: #94a3b8;">NÃ£o hÃ¡ solicitaÃ§Ãµes para exibir no momento.</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada equipe
    equipesParaMostrar.forEach(equipe => {
        const solicitacoes = equipes[equipe] || [];
        
        // Ordenar solicitaÃ§Ãµes por ordem de chegada (mais antigas primeiro)
        const solicitacoesOrdenadas = [...solicitacoes].sort((a, b) => {
            // Primeiro, ordenar por status (pendentes e em-andamento primeiro, finalizadas por Ãºltimo)
            const statusOrder = { 'pendente': 0, 'em-andamento': 1, 'finalizada': 2 };
            const statusA = statusOrder[a.status] || 3;
            const statusB = statusOrder[b.status] || 3;
            
            if (statusA !== statusB) {
                return statusA - statusB;
            }
            
            // Para mesmo status, ordenar por data de criaÃ§Ã£o (mais antigas primeiro)
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
                        <p>Nenhuma solicitaÃ§Ã£o de ${equipesNomes[equipe].toLowerCase()}</p>
                    </div>
                ` : `
                    ${solicitacoesOrdenadas.map((solicitacao, index) => {
                        // DEBUG para rastrear dados da solicitaÃ§Ã£o na renderizaÃ§Ã£o
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
                        
                        // Verificar se usuÃ¡rio pode interagir com esta solicitaÃ§Ã£o ou apenas visualizar
                        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
                        const podeInteragir = usuarioAdmin.role === 'super_admin' || 
                                            (usuarioAdmin.isEquipe && usuarioAdmin.equipe === solicitacao.equipe);
                        const apenasVisualizar = usuarioAdmin.role === 'admin' && !usuarioAdmin.isEquipe;
                        
                        return `<div class="solicitacao-card ${apenasVisualizar ? 'visualizacao-apenas' : ''}" 
                             data-solicitacao='${JSON.stringify(solicitacao).replace(/'/g, '&apos;')}' 
                             data-equipe="${equipe}" 
                             data-index="${index}" 
                             data-status="${solicitacao.status || 'pendente'}"
                             data-prioridade="${solicitacao.prioridade || 'normal'}"
                             onclick="${podeInteragir ? `abrirSolicitacaoModal(${JSON.stringify(solicitacao).replace(/'/g, '&apos;')})` : `mostrarInfoVisualizacao('${solicitacao.id}')`}"
                             style="${apenasVisualizar ? 'opacity: 0.8; cursor: help;' : 'cursor: pointer;'}">
                            
                            ${apenasVisualizar ? '<div class="badge-visualizacao">ðŸ‘€ Apenas VisualizaÃ§Ã£o</div>' : ''}
                            
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
                                    ${apenasVisualizar ? '<span style="font-size: 10px; color: #64748b;">ðŸ‘ï¸ Somente visualizaÃ§Ã£o</span>' : ''}
                                </div>
                            </div>
                            
                            <div class="card-title">
                                ${(() => {
                                    // Priorizar titulo ou tipo, mas se nÃ£o houver, usar o campo de descriÃ§Ã£o da equipe
                                    if (solicitacao.titulo) return solicitacao.titulo;
                                    if (solicitacao.tipo) return solicitacao.tipo;
                                    if (solicitacao.descricao) return solicitacao.descricao;
                                    if (solicitacao.detalhes) return solicitacao.detalhes;
                                    if (solicitacao.observacoes) return solicitacao.observacoes;
                                    return 'SolicitaÃ§Ã£o sem tÃ­tulo';
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
                                    // Determinar o campo de descriÃ§Ã£o baseado na equipe
                                    let descricaoTexto = '';
                                    if (solicitacao.descricao && solicitacao.descricao !== solicitacao.titulo) {
                                        descricaoTexto = solicitacao.descricao; // ManutenÃ§Ã£o
                                    } else if (solicitacao.detalhes) {
                                        descricaoTexto = solicitacao.detalhes; // NutriÃ§Ã£o e Hotelaria
                                    } else if (solicitacao.observacoes) {
                                        descricaoTexto = solicitacao.observacoes; // HigienizaÃ§Ã£o
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
                                <div class="card-priority priority-${obterPrioridade(solicitacao)}">
                                    ${obterPrioridade(solicitacao) === 'alta' ? 'ðŸ”´' : 
                                      obterPrioridade(solicitacao) === 'media' ? 'ðŸŸ¡' : 
                                      obterPrioridade(solicitacao) === 'normal' ? 'ðŸŸ¢' : 'âšª'}
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                `}
            </div>
        `;
        
        gridContainer.appendChild(panel);
    });
    
    // Adicionar eventos aos cards apÃ³s renderizaÃ§Ã£o
    adicionarEventosSolicitacoes();
    
    console.log(`[DEBUG] Cards renderizados para ${equipesParaMostrar.length} equipe(s)`);
}

// === MODAL DE SOLICITAÃ‡ÃƒO (VERSÃƒO LIMPA) ===
function abrirSolicitacaoModal(solicitacao) {
    debugLog('[DEBUG] Abrindo modal para:', solicitacao.id, 'Status:', solicitacao.status);
    mostrarModal(solicitacao);
}

function mostrarModal(solicitacao) {
    // Criar modal se nÃ£o existir
    let modal = document.getElementById('solicitacao-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'solicitacao-modal';
        modal.className = 'modal hidden';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative; background: white; border-radius: 12px; padding: 24px;">
                <span onclick="fecharSolicitacaoModal()" style="position: absolute; top: 15px; right: 20px; font-size: 24px; cursor: pointer; color: #6b7280;">&times;</span>
                <h2 style="margin-bottom: 20px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Detalhes da SolicitaÃ§Ã£o</h2>
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
        // SÃ³ mostrar modal DEPOIS que os dados foram carregados
        modal.classList.remove('hidden');
    }).catch(error => {
        console.error('[MODAL] Erro ao buscar dados do acompanhante:', error);
        // Se der erro, usar dados da prÃ³pria solicitaÃ§Ã£o e mostrar mesmo assim
        const dadosBasicos = {
            nome: solicitacao.usuarioNome || solicitacao.nome || 'Acompanhante',
            quarto: solicitacao.quarto || 'N/A',
            fonte: 'solicitacao-erro'
        };
        preencherDetalhesModal(solicitacao, dadosBasicos);
        modal.classList.remove('hidden');
    });
}

// FunÃ§Ã£o para buscar dados completos do acompanhante (nome + quarto)
async function buscarDadosAcompanhante(solicitacao) {
    console.log('[DEBUG-ACOMPANHANTE] === INICIANDO BUSCA DE DADOS ===');
    console.log('[DEBUG-ACOMPANHANTE] SolicitaÃ§Ã£o recebida:', {
        id: solicitacao.id,
        titulo: solicitacao.titulo,
        usuarioEmail: solicitacao.usuarioEmail,
        usuarioNome: solicitacao.usuarioNome,
        nome: solicitacao.nome,
        quarto: solicitacao.quarto,
        usuarioId: solicitacao.usuarioId
    });
    
    try {
        // **PRIORIDADE TOTAL: Dados da solicitaÃ§Ã£o (agora sempre atualizados)**
        let nomeEncontrado = 'Acompanhante'; // fallback
        let quartoEncontrado = 'N/A'; // fallback
        
        // 1. Nome: priorizar usuarioNome da solicitaÃ§Ã£o
        if (solicitacao.usuarioNome && solicitacao.usuarioNome !== 'UsuÃ¡rio') {
            nomeEncontrado = solicitacao.usuarioNome;
            console.log('[DEBUG-ACOMPANHANTE] âœ… Nome da solicitaÃ§Ã£o (usuarioNome):', nomeEncontrado);
        } else if (solicitacao.usuarioEmail) {
            // Fallback: extrair do email
            const emailPart = solicitacao.usuarioEmail.split('@')[0];
            nomeEncontrado = emailPart;
            console.log('[DEBUG-ACOMPANHANTE] âœ… Nome extraÃ­do do email:', nomeEncontrado);
        }
        
        // 2. Quarto: primeiro tentar da solicitaÃ§Ã£o, depois Firestore se necessÃ¡rio
        if (solicitacao.quarto && solicitacao.quarto !== 'N/A') {
            quartoEncontrado = solicitacao.quarto;
            console.log('[DEBUG-ACOMPANHANTE] âœ… Quarto da solicitaÃ§Ã£o:', quartoEncontrado);
        } else {
            console.log('[DEBUG-ACOMPANHANTE] âš ï¸ Quarto N/A na solicitaÃ§Ã£o - buscando no Firestore...');
            
            // **BUSCAR NO FIRESTORE POR EMAIL SE QUARTO FOR N/A**
            if (solicitacao.usuarioEmail) {
                try {
                    console.log('[DEBUG-ACOMPANHANTE] ðŸ” Buscando por email:', solicitacao.usuarioEmail);
                    
                    const usersSnapshot = await window.db.collection('usuarios_acompanhantes')
                        .where('email', '==', solicitacao.usuarioEmail)
                        .get();
                    
                    if (!usersSnapshot.empty) {
                        const userDoc = usersSnapshot.docs[0];
                        const userData = userDoc.data();
                        console.log('[DEBUG-ACOMPANHANTE] âœ… Dados encontrados no Firestore:', userData);
                        
                        // Atualizar nome se nÃ£o temos um melhor
                        if (!solicitacao.usuarioNome && userData.nome) {
                            nomeEncontrado = userData.nome;
                            console.log('[DEBUG-ACOMPANHANTE] âœ… Nome atualizado do Firestore:', nomeEncontrado);
                        }
                        
                        // Atualizar quarto se encontrado
                        if (userData.quarto) {
                            quartoEncontrado = userData.quarto;
                            console.log('[DEBUG-ACOMPANHANTE] ðŸ  Quarto encontrado no Firestore:', quartoEncontrado);
                        }
                    } else {
                        console.log('[DEBUG-ACOMPANHANTE] âš ï¸ UsuÃ¡rio nÃ£o encontrado no Firestore por email');
                    }
                } catch (firestoreError) {
                    console.error('[DEBUG-ACOMPANHANTE] âŒ Erro ao buscar no Firestore:', firestoreError);
                }
            }
        }
        
        const resultado = {
            nome: nomeEncontrado,
            quarto: quartoEncontrado,
            fonte: 'solicitacao_atualizada',
            encontrado: true
        };
        
        console.log('[DEBUG-ACOMPANHANTE] âœ… RESULTADO FINAL:', resultado);
        return resultado;
        
    } catch (error) {
        console.error('[DEBUG-ACOMPANHANTE] âŒ ERRO:', error);
        
        // Retorno de emergÃªncia
        return {
            nome: solicitacao.usuarioNome || solicitacao.nome || 'Acompanhante',
            quarto: solicitacao.quarto || 'N/A',
            fonte: 'erro_fallback',
            encontrado: false
        };
    }
}

// FunÃ§Ã£o para buscar nome do acompanhante (mantida para compatibilidade)
async function buscarNomeAcompanhante(solicitacao) {
    if (!solicitacao.usuarioId && !solicitacao.solicitanteId) {
        return solicitacao.nome || 'Acompanhante nÃ£o identificado';
    }

    try {
        // Verificar se o usuÃ¡rio atual tem permissÃ£o para acessar usuarios_acompanhantes
        const user = window.auth.currentUser;
        if (!user) {
            return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante nÃ£o identificado';
        }

        try {
            const userData = await window.verificarUsuarioAdminJS(user);
            if (!userData || (userData.role !== 'super_admin' && userData.role !== 'admin')) {
                // UsuÃ¡rio sem permissÃ£o - retornar dados da prÃ³pria solicitaÃ§Ã£o
                return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante nÃ£o identificado';
            }
        } catch (permError) {
            return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante nÃ£o identificado';
        }

        // Tentar buscar nas duas possÃ­veis coleÃ§Ãµes
        const userId = solicitacao.usuarioId || solicitacao.solicitanteId;
        
        // Primeiro tentar na coleÃ§Ã£o usuarios_acompanhantes (somente se tiver permissÃ£o)
        const acompanhanteRef = await window.db.collection('usuarios_acompanhantes').doc(userId).get();
        
        if (acompanhanteRef.exists) {
            const data = acompanhanteRef.data();
            return data.nome || data.nomeCompleto || 'Acompanhante';
        }
        
        // Se nÃ£o encontrar, tentar buscar pelo email na Auth (fallback)
        // Retornar nome da solicitaÃ§Ã£o se existir
        return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante nÃ£o identificado';
        
    } catch (error) {
        console.warn('[DEBUG] Erro ao buscar nome do acompanhante:', error);
        return solicitacao.nome || solicitacao.nomeAcompanhante || 'Acompanhante nÃ£o identificado';
    }
}

// FunÃ§Ã£o para preencher detalhes do modal
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
        
        // Calcular mÃ©tricas de tempo para exibiÃ§Ã£o
        let metricas = '';
        const agora = new Date();
        
        if (solicitacao.criadoEm) {
            let dataCreacao;
            
            // Verificar se criadoEm Ã© um timestamp do Firestore ou uma string
            if (solicitacao.criadoEm && typeof solicitacao.criadoEm.toDate === 'function') {
                dataCreacao = solicitacao.criadoEm.toDate();
            } else if (solicitacao.criadoEm && typeof solicitacao.criadoEm === 'string') {
                dataCreacao = new Date(solicitacao.criadoEm);
            } else if (solicitacao.dataAbertura && typeof solicitacao.dataAbertura.toDate === 'function') {
                dataCreacao = solicitacao.dataAbertura.toDate();
            } else if (solicitacao.dataAbertura && typeof solicitacao.dataAbertura === 'string') {
                dataCreacao = new Date(solicitacao.dataAbertura);
            } else {
                // Fallback: usar data atual se nÃ£o conseguir parsear
                dataCreacao = new Date();
                console.warn('NÃ£o foi possÃ­vel determinar data de criaÃ§Ã£o para solicitaÃ§Ã£o:', solicitacao.id);
            }
            
            const tempoDesdeAbertura = Math.round((agora - dataCreacao) / (1000 * 60));
            
            metricas += `
                <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 12px 0;">
                    <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">â±ï¸ MÃ©tricas de Tempo</h4>
                    <div style="font-size: 13px; color: #6b7280;">
                        <div><strong>Criado em:</strong> ${dataCreacao.toLocaleDateString('pt-BR')} Ã s ${dataCreacao.toLocaleTimeString('pt-BR')}</div>
                        <div><strong>Tempo desde abertura:</strong> ${tempoDesdeAbertura} min (${Math.round(tempoDesdeAbertura/60*10)/10}h)</div>
            `;
            
            // MÃ©tricas especÃ­ficas por status
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
                        <div><strong>Tempo total de resoluÃ§Ã£o:</strong> ${m.tempoTotal || tempoDesdeAbertura} min</div>
                        <div><strong>Tempo efetivo de trabalho:</strong> ${m.tempoTrabalho || 0} min</div>
                        <div><strong>SLA:</strong> <span style="color: ${slaColor}; font-weight: bold;">${slaStatus.toUpperCase()}</span> (limite: ${slaLimite} min)</div>
                        <div><strong>EficiÃªncia:</strong> ${m.tempoTrabalho && m.tempoTotal ? Math.round((m.tempoTrabalho / m.tempoTotal) * 100) : 0}%</div>
                `;
            }
            
            // SLA em tempo real para solicitaÃ§Ãµes nÃ£o finalizadas
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
                    return 'SolicitaÃ§Ã£o';
                })()}</div>
            </div>
            <div><strong>ID:</strong> ${solicitacao.id || 'N/A'}</div>
            <div><strong>Equipe:</strong> ${solicitacao.equipe || 'N/A'}</div>
            <div><strong>DescriÃ§Ã£o:</strong> ${(() => {
                if (solicitacao.descricao) return solicitacao.descricao;
                if (solicitacao.detalhes) return solicitacao.detalhes;
                if (solicitacao.observacoes) return solicitacao.observacoes;
                return 'N/A';
            })()}</div>
            <div><strong>Quarto:</strong> ${dadosAcompanhante?.quarto || solicitacao.quarto || 'N/A'}</div>
            <div><strong>Solicitante:</strong> ${dadosAcompanhante?.nome || solicitacao.usuarioNome || solicitacao.nome || 'N/A'}</div>
            ${solicitacao.responsavel ? `<div><strong>ResponsÃ¡vel:</strong> ${solicitacao.responsavel}</div>` : ''}
            ${solicitacao.solucao ? `<div><strong>SoluÃ§Ã£o:</strong> ${solicitacao.solucao}</div>` : ''}
            ${gerarSecaoEvidencias(solicitacao)}
            ${metricas}
        `;
        
        // Verificar permissÃµes e criar botÃµes de aÃ§Ã£o
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const isEquipe = usuarioAdmin && (usuarioAdmin.role === 'equipe' || usuarioAdmin.isEquipe);
        const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
        const podeAlterar = (isEquipe && usuarioAdmin.equipe === solicitacao.equipe) || isSuperAdmin;
        
        console.log('ðŸŽ¯ MODAL DEBUG:', {
            usuarioAdmin: usuarioAdmin,
            podeAlterar: podeAlterar,
            status: solicitacao.status,
            equipeUsuario: usuarioAdmin.equipe,
            equipeSolicitacao: solicitacao.equipe
        });
        
        // Criar botÃµes apenas se usuÃ¡rio tem permissÃ£o e solicitaÃ§Ã£o nÃ£o estÃ¡ finalizada
        if (acoesEl && podeAlterar && solicitacao.status !== 'finalizada') {
            let botoesHTML = '<h4 style="margin-bottom: 12px; color: #374151;">AÃ§Ãµes da Equipe:</h4><div style="display: flex; gap: 8px; flex-wrap: wrap;">';
            
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
            
            console.log('âœ… BOTÃ•ES CRIADOS:', botoesHTML);
        } else {
            if (acoesEl) acoesEl.innerHTML = '';
            console.log('âŒ SEM BOTÃ•ES:', { podeAlterar, status: solicitacao.status });
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
        
        // Limpar conteÃºdo do modal para evitar problemas de estado
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
                console.error('[ERRO] Card sem dados de solicitaÃ§Ã£o');
                showToast('Erro', 'Dados da solicitaÃ§Ã£o nÃ£o encontrados', 'error');
                return;
            }
            
            try {
                const solicitacao = JSON.parse(card.dataset.solicitacao.replace(/&apos;/g, "'"));
                debugLog('[DEBUG] Abrindo modal para solicitaÃ§Ã£o:', solicitacao.id);
                abrirSolicitacaoModal(solicitacao);
            } catch (error) {
                console.error('[ERRO] Falha ao parsear dados da solicitaÃ§Ã£o:', error);
                showToast('Erro', 'Erro ao carregar dados da solicitaÃ§Ã£o', 'error');
            }
        };
    });
    
    console.log(`[DEBUG] Eventos adicionados a ${document.querySelectorAll('.solicitacao-card').length} cards`);
}

// === SISTEMA DE PESQUISA DE SATISFAÃ‡ÃƒO ===

function abrirPesquisaSatisfacao(solicitacaoId, solicitacaoData) {
    debugLog('[DEBUG] Abrindo pesquisa de satisfaÃ§Ã£o para:', solicitacaoId);
    
    // Criar modal de pesquisa de satisfaÃ§Ã£o
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
                    Sua opiniÃ£o Ã© muito importante para nÃ³s!
                </p>
            </div>
            
            <div style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                    <i class="fas fa-tools" style="color: #3b82f6; margin-right: 8px;"></i>
                    <strong style="color: #374151;">${solicitacaoData.equipe || 'ManutenÃ§Ã£o'}</strong>
                </div>
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                    ${solicitacaoData.descricao || solicitacaoData.titulo || 'Teste elÃ©trico'} | Quarto: ${solicitacaoData.quarto || '04/11'}
                </p>
                <p style="margin: 4px 0 0 0; color: #10b981; font-size: 12px; font-weight: 500;">
                    <i class="fas fa-check-circle" style="margin-right: 4px;"></i>Finalizado hÃ¡ 12 horas
                </p>
            </div>
            
            <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 12px 0; color: #374151; font-weight: 500; font-size: 14px;">
                    Como vocÃª avalia o atendimento?
                </p>
            </div>
            
            <div class="star-rating">
                <span class="star" data-rating="1">â­</span>
                <span class="star" data-rating="2">â­</span>
                <span class="star" data-rating="3">â­</span>
                <span class="star" data-rating="4">â­</span>
                <span class="star" data-rating="5">â­</span>
            </div>
            
            <div id="rating-text" style="font-weight: 500; color: #6b7280; margin-bottom: 16px; min-height: 20px; font-size: 14px;">
                Selecione uma nota de 1 a 5 estrelas
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px; justify-content: flex-start;">
                    <i class="fas fa-comment-alt" style="color: #6b7280; margin-right: 8px; font-size: 14px;"></i>
                    <label style="color: #374151; font-weight: 500; font-size: 14px;">
                        Avalie aspectos especÃ­ficos:
                    </label>
                </div>
                
                <!-- Rapidez -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px;">
                    <span style="color: #374151; font-size: 13px;">Rapidez</span>
                    <div class="aspect-rating" data-aspect="rapidez">
                        <span class="aspect-star" data-rating="1">â­</span>
                        <span class="aspect-star" data-rating="2">â­</span>
                        <span class="aspect-star" data-rating="3">â­</span>
                        <span class="aspect-star" data-rating="4">â­</span>
                        <span class="aspect-star" data-rating="5">â­</span>
                    </div>
                </div>
                
                <!-- Qualidade -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px;">
                    <span style="color: #374151; font-size: 13px;">Qualidade</span>
                    <div class="aspect-rating" data-aspect="qualidade">
                        <span class="aspect-star" data-rating="1">â­</span>
                        <span class="aspect-star" data-rating="2">â­</span>
                        <span class="aspect-star" data-rating="3">â­</span>
                        <span class="aspect-star" data-rating="4">â­</span>
                        <span class="aspect-star" data-rating="5">â­</span>
                    </div>
                </div>
                
                <!-- Atendimento -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 12px;">
                    <span style="color: #374151; font-size: 13px;">Atendimento</span>
                    <div class="aspect-rating" data-aspect="atendimento">
                        <span class="aspect-star" data-rating="1">â­</span>
                        <span class="aspect-star" data-rating="2">â­</span>
                        <span class="aspect-star" data-rating="3">â­</span>
                        <span class="aspect-star" data-rating="4">â­</span>
                        <span class="aspect-star" data-rating="5">â­</span>
                    </div>
                </div>
                
                <textarea 
                    id="comentario-satisfacao" 
                    placeholder="Conte-nos sobre sua experiÃªncia ou deixe sugestÃµes..."
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
                    <i class="fas fa-paper-plane" style="margin-right: 6px;"></i>Enviar AvaliaÃ§Ã£o
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
        1: 'ðŸ˜ž Muito insatisfeito',
        2: 'ðŸ˜ Insatisfeito', 
        3: 'ðŸ˜Š Neutro',
        4: 'ðŸ˜ƒ Satisfeito',
        5: 'ðŸ¤© Muito satisfeito'
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
            
            // Habilitar botÃ£o enviar
            if (btnEnviar) {
                btnEnviar.disabled = false;
                btnEnviar.style.background = '#10b981';
                btnEnviar.style.cursor = 'pointer';
                debugLog('[DEBUG] BotÃ£o habilitado para avaliaÃ§Ã£o:', avaliacaoSelecionada);
            } else {
                console.error('[ERRO] BotÃ£o enviar nÃ£o encontrado!');
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
    
    // Funcionalidade para avaliaÃ§Ãµes por aspectos
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
                
                debugLog('[DEBUG] AvaliaÃ§Ã£o do aspecto', aspect + ':', rating);
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
    
    // Salvar referÃªncia global para acesso nas funÃ§Ãµes onclick
    window.avaliacaoAtual = {
        solicitacaoId: solicitacaoId,
        getAvaliacao: () => avaliacaoSelecionada,
        solicitacaoData: solicitacaoData
    };
}

async function enviarAvaliacao(solicitacaoId) {
    debugLog('[DEBUG] Iniciando envio de avaliaÃ§Ã£o para:', solicitacaoId);
    
    if (!window.avaliacaoAtual || window.avaliacaoAtual.getAvaliacao() === 0) {
        showToast('Aviso', 'Por favor, selecione uma avaliaÃ§Ã£o primeiro!', 'warning');
        console.warn('[AVISO] Tentativa de envio sem avaliaÃ§Ã£o selecionada');
        return;
    }
    
    // Desabilitar botÃ£o para evitar mÃºltiplos envios
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
        
        // Capturar avaliaÃ§Ãµes por aspectos
        const aspectosAvaliacao = {};
        const aspectContainers = document.querySelectorAll('.aspect-rating');
        aspectContainers.forEach(container => {
            const aspect = container.dataset.aspect;
            const stars = container.querySelectorAll('.aspect-star.selected');
            aspectosAvaliacao[aspect] = stars.length;
        });
        
        debugLog('[DEBUG] Dados da avaliaÃ§Ã£o:', {
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
        
        // Verificar se Firebase estÃ¡ disponÃ­vel
        if (!window.db) {
            throw new Error('Firebase nÃ£o estÃ¡ disponÃ­vel');
        }
        
        // Salvar no Firestore
        debugLog('[DEBUG] Salvando avaliaÃ§Ã£o no Firestore...');
        await window.db.collection('avaliacoes_satisfacao').add(avaliacaoData);
        
        // Atualizar solicitaÃ§Ã£o com referÃªncia Ã  avaliaÃ§Ã£o
        debugLog('[DEBUG] Atualizando solicitaÃ§Ã£o com dados da avaliaÃ§Ã£o...');
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
        
        showToast('Sucesso', `Obrigado! Sua avaliaÃ§Ã£o foi registrada com sucesso.`, 'success');
        
        console.log('âœ… AvaliaÃ§Ã£o de satisfaÃ§Ã£o salva com sucesso:', avaliacaoData);
        
        // Fechar modal apÃ³s 2 segundos para que o usuÃ¡rio veja a mensagem
        setTimeout(() => {
            fecharPesquisaSatisfacao();
        }, 2000);
        
    } catch (error) {
        console.error('[ERRO] Falha ao salvar avaliaÃ§Ã£o:', error);
        
        // Reabilitar botÃ£o em caso de erro
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '<i class="fas fa-paper-plane" style="margin-right: 4px;"></i>Enviar AvaliaÃ§Ã£o';
            btnEnviar.style.background = '#10b981';
        }
        
        let mensagemErro = 'NÃ£o foi possÃ­vel salvar sua avaliaÃ§Ã£o. Tente novamente.';
        if (error.code === 'permission-denied') {
            mensagemErro = 'Acesso negado. Verifique suas permissÃµes.';
        } else if (error.code === 'unavailable') {
            mensagemErro = 'ServiÃ§o temporariamente indisponÃ­vel. Tente novamente em alguns instantes.';
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
    
    // Limpar referÃªncia global
    if (window.avaliacaoAtual) {
        delete window.avaliacaoAtual;
    }
}

// Expor funÃ§Ãµes globalmente
window.abrirPesquisaSatisfacao = abrirPesquisaSatisfacao;
window.enviarAvaliacao = enviarAvaliacao;
window.fecharPesquisaSatisfacao = fecharPesquisaSatisfacao;

// FunÃ§Ã£o de teste para debugar a pesquisa de satisfaÃ§Ã£o
window.testarPesquisaSatisfacao = function() {
    debugLog('[DEBUG] Testando pesquisa de satisfaÃ§Ã£o...');
    const dadosTeste = {
        id: 'teste-123',
        descricao: 'SolicitaÃ§Ã£o de teste para avaliaÃ§Ã£o',
        quarto: '101',
        equipe: 'manutencao',
        tipo: 'manutencao'
    };
    abrirPesquisaSatisfacao('teste-123', dadosTeste);
};

// === DASHBOARD DE SATISFAÃ‡ÃƒO ===

async function abrirDashboardSatisfacao() {
    debugLog('[DEBUG] Abrindo dashboard de satisfaÃ§Ã£o...');
    
    // Verificar permissÃµes (super_admin e admin)
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    if (!userRole || (userRole !== 'super_admin' && userRole !== 'admin')) {
        showToast('Erro', 'Acesso negado. Apenas administradores podem ver relatÃ³rios de satisfaÃ§Ã£o.', 'error');
        return;
    }
    
    try {
        // Buscar todas as avaliaÃ§Ãµes
        const avaliacoesSnapshot = await window.db.collection('avaliacoes_satisfacao')
            .orderBy('dataAvaliacao', 'desc')
            .limit(100)
            .get();
        
        const avaliacoes = [];
        avaliacoesSnapshot.forEach(doc => {
            const data = doc.data();
            console.log('[DEBUG-SATISFACAO] Dados brutos da avaliaÃ§Ã£o:', data);
            console.log('[DEBUG-SATISFACAO] Campos da avaliaÃ§Ã£o:', Object.keys(data));
            console.log('[DEBUG-SATISFACAO] QUARTOS disponÃ­veis:', {
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
        
        console.log('[DEBUG-SATISFACAO] Total de avaliaÃ§Ãµes encontradas:', avaliacoes.length);
        console.log('[DEBUG-SATISFACAO] Primeira avaliaÃ§Ã£o (se existir):', avaliacoes[0]);
        
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
                        Dashboard de Pesquisa de SatisfaÃ§Ã£o
                    </h2>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">
                        AnÃ¡lise das avaliaÃ§Ãµes de satisfaÃ§Ã£o dos serviÃ§os
                    </p>
                </div>
                
                <div style="padding: 24px;">
                    <!-- MÃ©tricas Gerais -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px;">
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                            <i class="fas fa-star" style="font-size: 32px; margin-bottom: 8px;"></i>
                            <div style="font-size: 28px; font-weight: bold;">${metricas.mediaGeral.toFixed(1)}</div>
                            <div style="opacity: 0.9;">MÃ©dia Geral</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                            <i class="fas fa-poll" style="font-size: 32px; margin-bottom: 8px;"></i>
                            <div style="font-size: 28px; font-weight: bold;">${avaliacoes.length}</div>
                            <div style="opacity: 0.9;">Total AvaliaÃ§Ãµes</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                            <i class="fas fa-thumbs-up" style="font-size: 32px; margin-bottom: 8px;"></i>
                            <div style="font-size: 28px; font-weight: bold;">${metricas.percentualPositivo}%</div>
                            <div style="opacity: 0.9;">SatisfaÃ§Ã£o Positiva</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                            <i class="fas fa-chart-line" style="font-size: 32px; margin-bottom: 8px;"></i>
                            <div style="font-size: 28px; font-weight: bold;">${metricas.melhorEquipe}</div>
                            <div style="opacity: 0.9;">Melhor Equipe</div>
                        </div>
                    </div>
                    
                    <!-- MÃ©tricas por Equipe -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 16px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-users"></i>
                            SatisfaÃ§Ã£o por Equipe
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            ${Object.entries(metricas.porEquipe).map(([equipe, dados]) => `
                                <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid ${getCorEquipe(equipe)};">
                                    <div style="font-weight: bold; color: #374151; margin-bottom: 8px; text-transform: capitalize;">
                                        ${equipe}
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <span>MÃ©dia:</span>
                                        <span style="font-weight: bold; color: ${dados.media >= 4 ? '#10b981' : dados.media >= 3 ? '#f59e0b' : '#ef4444'};">
                                            ${dados.media.toFixed(1)} â­
                                        </span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>AvaliaÃ§Ãµes:</span>
                                        <span style="font-weight: bold;">${dados.total}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- AvaliaÃ§Ãµes Recentes -->
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px;">
                        <h3 style="margin: 0 0 16px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-clock"></i>
                            AvaliaÃ§Ãµes Recentes
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
                    
                    <!-- BotÃ£o de ExclusÃ£o de Pesquisas -->
                    <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
                        <div style="display: flex; justify-content: center; align-items: center; gap: 12px;">
                            <button onclick="confirmarExclusaoPesquisasSatisfacao()" 
                                    style="background: #dc2626; color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                                           font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-trash-alt"></i>
                                Excluir Todas as Pesquisas de SatisfaÃ§Ã£o
                            </button>
                            <div style="color: #6b7280; font-size: 14px; max-width: 300px; text-align: center;">
                                Esta aÃ§Ã£o remove permanentemente todas as avaliaÃ§Ãµes de satisfaÃ§Ã£o do sistema
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalDashboard);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard de satisfaÃ§Ã£o:', error);
        showToast('Erro', 'NÃ£o foi possÃ­vel carregar o dashboard de satisfaÃ§Ã£o.', 'error');
    }
}

// === FUNÃ‡ÃƒO PARA EXCLUIR PESQUISAS DE SATISFAÃ‡ÃƒO ===
async function confirmarExclusaoPesquisasSatisfacao() {
    const confirmacao = confirm(`âš ï¸ ATENÃ‡ÃƒO: EXCLUSÃƒO DE PESQUISAS DE SATISFAÃ‡ÃƒO

Esta aÃ§Ã£o irÃ¡ excluir PERMANENTEMENTE:

ðŸ“Š Todas as avaliaÃ§Ãµes de satisfaÃ§Ã£o da coleÃ§Ã£o 'avaliacoes_satisfacao'
ðŸ“ Todos os dados de avaliaÃ§Ã£o em solicitaÃ§Ãµes existentes
ðŸ“ˆ Todo o histÃ³rico de pesquisas de satisfaÃ§Ã£o

âŒ ESTA AÃ‡ÃƒO NÃƒO PODE SER DESFEITA!

Tem certeza de que deseja continuar?`);

    if (!confirmacao) {
        console.log('[SATISFACAO-CLEANUP] OperaÃ§Ã£o cancelada pelo usuÃ¡rio');
        return;
    }

    try {
        console.log('[SATISFACAO-CLEANUP] ðŸ§¹ Iniciando exclusÃ£o de pesquisas de satisfaÃ§Ã£o...');
        showToast('Info', 'Iniciando exclusÃ£o das pesquisas de satisfaÃ§Ã£o...', 'info');

        let totalExcluidos = 0;

        // 1. Excluir coleÃ§Ã£o avaliacoes_satisfacao
        console.log('[SATISFACAO-CLEANUP] Buscando documentos da coleÃ§Ã£o avaliacoes_satisfacao...');
        const avaliacoesSnapshot = await window.db.collection('avaliacoes_satisfacao').get();
        
        if (!avaliacoesSnapshot.empty) {
            const batch = window.db.batch();
            avaliacoesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                totalExcluidos++;
            });
            
            await batch.commit();
            console.log(`[SATISFACAO-CLEANUP] âœ… ${totalExcluidos} avaliaÃ§Ãµes excluÃ­das da coleÃ§Ã£o avaliacoes_satisfacao`);
        }

        // 2. Limpar campos de avaliaÃ§Ã£o das solicitaÃ§Ãµes
        console.log('[SATISFACAO-CLEANUP] Limpando dados de avaliaÃ§Ã£o das solicitaÃ§Ãµes...');
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
            console.log(`[SATISFACAO-CLEANUP] âœ… ${solicitacoesAtualizadas} solicitaÃ§Ãµes com dados de avaliaÃ§Ã£o limpos`);
        }

        console.log(`[SATISFACAO-CLEANUP] âœ… Limpeza concluÃ­da! Total de registros processados: ${totalExcluidos + (solicitacoesSnapshot?.size || 0)}`);
        
        showToast('Sucesso', `Pesquisas de satisfaÃ§Ã£o excluÃ­das com sucesso! ${totalExcluidos} avaliaÃ§Ãµes removidas.`, 'success');
        
        // Fechar modal e reabrir para mostrar dados limpos
        document.querySelectorAll('.modal').forEach(modal => modal.remove());
        
        setTimeout(() => {
            abrirDashboardSatisfacao();
        }, 1000);

    } catch (error) {
        console.error('[SATISFACAO-CLEANUP] âŒ Erro durante a exclusÃ£o:', error);
        showToast('Erro', `Erro ao excluir pesquisas: ${error.message}`, 'error');
    }
}

function calcularMetricasSatisfacao(avaliacoes) {
    console.log('[DEBUG-METRICAS] Calculando mÃ©tricas para:', avaliacoes.length, 'avaliaÃ§Ãµes');
    
    if (!avaliacoes || avaliacoes.length === 0) {
        console.log('[DEBUG-METRICAS] Nenhuma avaliaÃ§Ã£o encontrada, retornando valores padrÃ£o');
        return {
            mediaGeral: 0,
            percentualPositivo: 0,
            melhorEquipe: 'N/A',
            porEquipe: {}
        };
    }
    
    // Filtrar avaliaÃ§Ãµes vÃ¡lidas
    const avaliacoesValidas = avaliacoes.filter(a => {
        // Tentar diferentes campos para a nota
        let nota = a.avaliacao || a.nota || a.rating || a.estrelas;
        if (typeof nota === 'string') {
            nota = Number(nota);
        }
        
        const valida = !isNaN(nota) && nota >= 1 && nota <= 5;
        if (!valida) {
            console.log('[DEBUG-METRICAS] AvaliaÃ§Ã£o invÃ¡lida encontrada:', {
                id: a.id,
                notaOriginal: a.avaliacao,
                notaProcessada: nota,
                campos: Object.keys(a)
            });
        }
        return valida;
    });
    
    console.log('[DEBUG-METRICAS] AvaliaÃ§Ãµes vÃ¡lidas:', avaliacoesValidas.length);
    
    if (avaliacoesValidas.length === 0) {
        return {
            mediaGeral: 0,
            percentualPositivo: 0,
            melhorEquipe: 'N/A',
            porEquipe: {}
        };
    }
    
    // Calcular mÃ©dia geral
    const somaTotal = avaliacoesValidas.reduce((soma, avaliacao) => {
        let nota = avaliacao.avaliacao || avaliacao.nota || avaliacao.rating || avaliacao.estrelas;
        if (typeof nota === 'string') {
            nota = Number(nota);
        }
        return soma + nota;
    }, 0);
    const mediaGeral = somaTotal / avaliacoesValidas.length;
    
    console.log('[DEBUG-METRICAS] Soma total:', somaTotal, 'MÃ©dia geral:', mediaGeral);
    
    // Calcular percentual positivo (4 e 5 estrelas)
    const avaliacoesPositivas = avaliacoesValidas.filter(a => {
        let nota = a.avaliacao || a.nota || a.rating || a.estrelas;
        if (typeof nota === 'string') {
            nota = Number(nota);
        }
        return nota >= 4;
    }).length;
    const percentualPositivo = Math.round((avaliacoesPositivas / avaliacoesValidas.length) * 100);
    
    console.log('[DEBUG-METRICAS] AvaliaÃ§Ãµes positivas:', avaliacoesPositivas, 'Percentual:', percentualPositivo);
    
    // Calcular mÃ©tricas por equipe
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
    
    // Calcular mÃ©dias por equipe
    Object.keys(porEquipe).forEach(equipe => {
        porEquipe[equipe].media = porEquipe[equipe].soma / porEquipe[equipe].total;
    });
    
    // Encontrar melhor equipe
    let melhorEquipe = 'N/A';
    let melhorMedia = 0;
    Object.entries(porEquipe).forEach(([equipe, dados]) => {
        if (dados.media > melhorMedia && dados.total >= 3) { // MÃ­nimo 3 avaliaÃ§Ãµes
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

// === SISTEMA DE EVIDÃŠNCIAS ===

// VariÃ¡vel global para armazenar os arquivos selecionados
let arquivosEvidencias = [];

function handleEvidenciasUpload(input) {
    const files = input.files;
    const maxFiles = 5;
    const maxSizePerFile = 10 * 1024 * 1024; // 10MB em bytes
    
    // ValidaÃ§Ãµes
    if (files.length > maxFiles) {
        showToast('Erro', `MÃ¡ximo de ${maxFiles} arquivos permitidos.`, 'error');
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
            showToast('Erro', `Arquivo "${file.name}" nÃ£o Ã© um tipo vÃ¡lido.`, 'error');
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
    
    // Armazenar arquivos vÃ¡lidos
    arquivosEvidencias = validFiles;
    
    // Mostrar preview dos arquivos
    mostrarPreviewEvidencias(validFiles);
    
    console.log(`[DEBUG] ${validFiles.length} arquivo(s) selecionado(s) para evidÃªncias`);
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
        
        // Ãcone baseado no tipo de arquivo
        let icon = 'ðŸ“„';
        if (file.type.startsWith('image/')) icon = 'ðŸ–¼ï¸';
        else if (file.type.includes('pdf')) icon = 'ðŸ“„';
        else if (file.type.includes('word')) icon = 'ðŸ“';
        
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
    totalElement.textContent = `${files.length} arquivo(s) â€¢ ${formatarTamanhoArquivo(totalSize)}`;
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
    
    console.log(`[DEBUG] EvidÃªncia removida. Total: ${arquivosEvidencias.length} arquivo(s)`);
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
        return []; // Retorna array vazio se nÃ£o hÃ¡ arquivos
    }
    
    console.log(`[DEBUG] Iniciando upload de ${arquivosEvidencias.length} evidÃªncia(s)...`);
    
    // Para esta implementaÃ§Ã£o, vamos usar uma simulaÃ§Ã£o de upload
    // Em produÃ§Ã£o, vocÃª integraria com Firebase Storage ou outro serviÃ§o
    const evidenciasUploadadas = [];
    
    try {
        for (let i = 0; i < arquivosEvidencias.length; i++) {
            const file = arquivosEvidencias[i];
            
            // Simular upload (substituir por integraÃ§Ã£o real)
            const evidencia = {
                nome: file.name,
                tamanho: file.size,
                tipo: file.type,
                uploadedAt: new Date().toISOString(),
                // Em produÃ§Ã£o, adicionar:
                // url: urlDoArquivoNoStorage,
                // path: caminhoNoStorage
            };
            
            evidenciasUploadadas.push(evidencia);
            console.log(`[DEBUG] EvidÃªncia ${i + 1}/${arquivosEvidencias.length} processada: ${file.name}`);
        }
        
        console.log(`[DEBUG] Upload concluÃ­do: ${evidenciasUploadadas.length} evidÃªncia(s)`);
        return evidenciasUploadadas;
        
    } catch (error) {
        console.error('[ERRO] Falha no upload das evidÃªncias:', error);
        throw new Error('Falha no upload das evidÃªncias: ' + error.message);
    }
}

// Expor funÃ§Ãµes globalmente
window.handleEvidenciasUpload = handleEvidenciasUpload;
window.removerEvidencia = removerEvidencia;

// FunÃ§Ãµes para gerenciar evidÃªncias
function gerarSecaoEvidencias(solicitacao) {
    if (!solicitacao.evidencias || solicitacao.evidencias.length === 0) {
        return '';
    }

    let html = `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <h4 style="color: #374151; margin-bottom: 12px; font-size: 14px; font-weight: 600; display: flex; align-items: center;">
                <i class="fas fa-paperclip" style="margin-right: 8px; color: #6b7280;"></i>
                EvidÃªncias Anexadas (${solicitacao.evidencias.length})
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
        // Para imagens, criar modal de visualizaÃ§Ã£o
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
        'manutencao': '#3b82f6',
        'nutricao': '#10b981', 
        'higienizacao': '#8b5cf6',
        'hotelaria': '#f59e0b'
    };
    return cores[equipe] || '#6b7280';
}

function getCorAvaliacao(nota) {
    if (nota >= 4) return '#10b981'; // Verde
    if (nota >= 3) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
}

function getEstrelasVisuais(nota) {
    return 'â­'.repeat(nota) + 'â˜†'.repeat(5 - nota);
}

function formatarDataHora(dataISO) {
    try {
        if (!dataISO) {
            console.warn('[FORMATACAO] Data nÃ£o fornecida');
            return 'Data nÃ£o informada';
        }
        
        console.log('[FORMATACAO] Processando data:', dataISO, 'Tipo:', typeof dataISO);
        
        let data;
        
        // Se for um timestamp do Firestore (objeto com seconds e nanoseconds)
        if (dataISO && typeof dataISO === 'object' && dataISO.seconds) {
            console.log('[FORMATACAO] Timestamp Firestore detectado:', { seconds: dataISO.seconds, nanoseconds: dataISO.nanoseconds });
            data = new Date(dataISO.seconds * 1000 + (dataISO.nanoseconds || 0) / 1000000);
        }
        // Se for um timestamp do Firestore com mÃ©todo toDate()
        else if (dataISO && typeof dataISO === 'object' && dataISO.toDate) {
            console.log('[FORMATACAO] Timestamp Firestore com toDate() detectado');
            data = dataISO.toDate();
        }
        // Se for um nÃºmero (timestamp em milissegundos)
        else if (typeof dataISO === 'number') {
            console.log('[FORMATACAO] Timestamp numÃ©rico detectado:', dataISO);
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
            console.log('[FORMATACAO] Tentando conversÃ£o direta para Date');
            data = new Date(dataISO);
        }
        
        // Verificar se a data Ã© vÃ¡lida
        if (isNaN(data.getTime())) {
            console.warn('[FORMATACAO] Data invÃ¡lida apÃ³s conversÃ£o:', dataISO);
            return 'Data invÃ¡lida';
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

// Expor funÃ§Ã£o globalmente
window.abrirDashboardSatisfacao = abrirDashboardSatisfacao;

// FunÃ§Ã£o para mostrar informaÃ§Ãµes de visualizaÃ§Ã£o para administradores
function mostrarInfoVisualizacao(solicitacaoId) {
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    
    if (usuarioAdmin.role === 'admin') {
        showToast('InformaÃ§Ã£o', 'Como administrador, vocÃª pode visualizar todas as solicitaÃ§Ãµes, mas nÃ£o pode interagir com elas. Apenas as equipes responsÃ¡veis podem dar atendimento Ã s solicitaÃ§Ãµes.', 'info', 5000);
    } else {
        showToast('Aviso', 'VocÃª nÃ£o tem permissÃ£o para interagir com esta solicitaÃ§Ã£o.', 'warning');
    }
}

window.mostrarInfoVisualizacao = mostrarInfoVisualizacao;
window.fecharDashboardSatisfacao = fecharDashboardSatisfacao;

// =============== SISTEMA DE RELATÃ“RIOS ===============

// FunÃ§Ã£o para gerar relatÃ³rio visual/dashboard
async function gerarRelatorioAdmin() {
    try {
        debugLog('[DEBUG] gerarRelatorioAdmin: iniciando geraÃ§Ã£o de relatÃ³rio...');
        
        if (!window.db) {
            showToast('Erro', 'Firestore nÃ£o inicializado!', 'error');
            return;
        }

        // Mostrar loading
        showToast('Gerando...', 'Coletando dados para o relatÃ³rio...', 'info');

        // Coletar todas as solicitaÃ§Ãµes
        const snapshot = await window.db.collection('solicitacoes').get();
        const solicitacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`[DEBUG] gerarRelatorioAdmin: ${solicitacoes.length} solicitaÃ§Ãµes encontradas`);

        if (solicitacoes.length === 0) {
            showToast('Aviso', 'Nenhuma solicitaÃ§Ã£o encontrada para gerar relatÃ³rio', 'warning');
            return;
        }

        // Gerar relatÃ³rio HTML
        gerarRelatorioHTML(solicitacoes);
        
        showToast('Sucesso', 'RelatÃ³rio gerado com sucesso!', 'success');

    } catch (error) {
        console.error('[ERRO] gerarRelatorioAdmin:', error);
        showToast('Erro', `Falha ao gerar relatÃ³rio: ${error.message}`, 'error');
    }
}

// FunÃ§Ã£o para gerar relatÃ³rio visual em HTML
function gerarRelatorioHTML(solicitacoes) {
    const agora = new Date();
    const dataRelatorio = agora.toLocaleDateString('pt-BR');
    const horaRelatorio = agora.toLocaleTimeString('pt-BR');

    // Calcular estatÃ­sticas
    const stats = calcularEstatisticas(solicitacoes);

    // Criar modal de relatÃ³rio
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
                    <h2 style="margin: 0; color: #1f2937;">ðŸ“Š RelatÃ³rio de SolicitaÃ§Ãµes</h2>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Gerado em ${dataRelatorio} Ã s ${horaRelatorio}</p>
                </div>
                <button onclick="document.getElementById('modal-relatorio').remove()" 
                        style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>

            <!-- Resumo Executivo -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #374151;">ðŸ“ˆ Resumo Executivo</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                        <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${stats.total}</div>
                        <div style="color: #6b7280;">Total de SolicitaÃ§Ãµes</div>
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

            <!-- EstatÃ­sticas por Equipe -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #374151;">ðŸ‘¥ Desempenho por Equipe</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                    ${Object.entries(stats.porEquipe).map(([equipe, dados]) => `
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <h4 style="margin: 0 0 10px 0; color: ${getCorEquipe(equipe)}; text-transform: capitalize;">
                                <i class="fas fa-users"></i> ${equipe}
                            </h4>
                            <div style="font-size: 14px; color: #6b7280;">
                                <div>Total: <strong>${dados.total}</strong></div>
                                <div>Finalizadas: <strong style="color: #10b981;">${dados.finalizadas}</strong></div>
                                <div>Taxa ConclusÃ£o: <strong>${dados.total > 0 ? Math.round((dados.finalizadas / dados.total) * 100) : 0}%</strong></div>
                                <div>TMA: <strong>${dados.tmaMedia || '--'}</strong></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Lista Detalhada de SolicitaÃ§Ãµes por Equipe -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #374151;">ðŸ“‹ Lista Completa de SolicitaÃ§Ãµes por Equipe</h3>
                ${gerarListaDetalhada(solicitacoes, stats)}
            </div>

            <!-- BotÃµes de AÃ§Ã£o -->
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

    document.body.appendChild(modalRelatorio);
}

// FunÃ§Ã£o para calcular estatÃ­sticas
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

        // Calcular TMA se disponÃ­vel
        if (sol.tempoAtendimentoMinutos) {
            stats.porEquipe[equipe].tempos.push(sol.tempoAtendimentoMinutos);
        }
    });

    // Calcular TMA mÃ©dio por equipe
    Object.keys(stats.porEquipe).forEach(equipe => {
        const tempos = stats.porEquipe[equipe].tempos;
        if (tempos.length > 0) {
            const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
            stats.porEquipe[equipe].tmaMedia = Math.round(media) + ' min';
        }
    });

    return stats;
}

// FunÃ§Ã£o para gerar lista detalhada por equipe
function gerarListaDetalhada(solicitacoes, stats) {
    const solicitacoesPorEquipe = {};
    
    // Agrupar solicitaÃ§Ãµes por equipe
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
                        <i class="fas fa-users"></i> ${equipe} (${solicitacoesEquipe.length} solicitaÃ§Ãµes)
                    </h4>
                </div>
                <div style="max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8fafc; position: sticky; top: 0;">
                            <tr>
                                <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Data</th>
                                <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Tipo</th>
                                <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">DescriÃ§Ã£o</th>
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

// FunÃ§Ãµes auxiliares para formataÃ§Ã£o
function getCorEquipe(equipe) {
    const cores = {
        'manutencao': '#ef4444',
        'nutriÃ§Ã£o': '#22c55e',
        'nutricao': '#22c55e',
        'higienizaÃ§Ã£o': '#3b82f6',
        'higienizacao': '#3b82f6',
        'hotelaria': '#a855f7',
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

// FunÃ§Ã£o para exportar dados para Excel
async function exportarDados() {
    try {
        debugLog('[DEBUG] exportarDados: iniciando exportaÃ§Ã£o...');
        
        if (!window.XLSX) {
            showToast('Erro', 'Biblioteca XLSX nÃ£o carregada!', 'error');
            return;
        }

        showToast('Exportando...', 'Preparando dados para exportaÃ§Ã£o...', 'info');

        // Coletar dados
        const snapshot = await window.db.collection('solicitacoes').get();
        const solicitacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (solicitacoes.length === 0) {
            showToast('Aviso', 'Nenhuma solicitaÃ§Ã£o para exportar', 'warning');
            return;
        }

        // Debug: Verificar campos de data disponÃ­veis
        if (solicitacoes.length > 0) {
            const primeiroItem = solicitacoes[0];
            console.log('[DEBUG] Campos de data disponÃ­veis na primeira solicitaÃ§Ã£o:', {
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
            // FunÃ§Ã£o para extrair data/hora dos diferentes campos possÃ­veis
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
                'DescriÃ§Ã£o': sol.descricao || '--',
                'ResponsÃ¡vel': sol.responsavel || '--',
                'SoluÃ§Ã£o': sol.solucao || '--',
                'TMA (min)': sol.tempoAtendimentoMinutos || '--',
                'AvaliaÃ§Ã£o': sol.avaliacaoNota ? `${sol.avaliacaoNota}/5 estrelas` : '--'
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
            { wch: 30 }, // DescriÃ§Ã£o
            { wch: 20 }, // ResponsÃ¡vel
            { wch: 30 }, // SoluÃ§Ã£o
            { wch: 12 }, // TMA
            { wch: 15 }  // AvaliaÃ§Ã£o
        ];
        worksheet['!cols'] = colWidths;

        // Adicionar ao workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'SolicitaÃ§Ãµes');

        // Gerar nome do arquivo
        const agora = new Date();
        const nomeArquivo = `relatorio-solicitacoes-${agora.getFullYear()}-${(agora.getMonth() + 1).toString().padStart(2, '0')}-${agora.getDate().toString().padStart(2, '0')}.xlsx`;

        // Fazer download
        XLSX.writeFile(workbook, nomeArquivo);

        showToast('Sucesso', `Arquivo ${nomeArquivo} baixado com sucesso!`, 'success');

        console.log(`[DEBUG] exportarDados: ${solicitacoes.length} registros exportados`);

    } catch (error) {
        console.error('[ERRO] exportarDados:', error);
        showToast('Erro', `Falha na exportaÃ§Ã£o: ${error.message}`, 'error');
    }
}

// FunÃ§Ã£o para imprimir relatÃ³rio
function imprimirRelatorio() {
    const conteudoModal = document.querySelector('#modal-relatorio > div').cloneNode(true);
    
    // Remover botÃ£o de fechar e botÃµes de aÃ§Ã£o para impressÃ£o
    const botaoFechar = conteudoModal.querySelector('button');
    if (botaoFechar) botaoFechar.remove();
    
    const botoesAcao = conteudoModal.querySelector('div:last-child');
    if (botoesAcao) botoesAcao.remove();

    // Criar janela de impressÃ£o
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>RelatÃ³rio de SolicitaÃ§Ãµes - YUNA</title>
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

// Expor funÃ§Ãµes globalmente
window.gerarRelatorioAdmin = gerarRelatorioAdmin;
window.exportarDados = exportarDados;
window.imprimirRelatorio = imprimirRelatorio;

// =============== SISTEMA DE ACOMPANHANTES ===============

// FunÃ§Ã£o para cadastrar acompanhante
async function cadastrarAcompanhante() {
    try {
        debugLog('[DEBUG] cadastrarAcompanhante: iniciando cadastro...');
        
        if (!window.db || !window.auth) {
            showToast('Erro', 'Firebase nÃ£o inicializado!', 'error');
            return;
        }

        // Verificar permissÃµes
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (!usuarioAdmin.role || usuarioAdmin.role !== 'super_admin') {
            showToast('Erro', 'Acesso negado. Apenas super administradores podem cadastrar acompanhantes.', 'error');
            return;
        }

        // Coletar dados do formulÃ¡rio
        const nome = document.getElementById('acomp-nome')?.value?.trim();
        const email = document.getElementById('acomp-email')?.value?.trim();
        const quarto = document.getElementById('acomp-quarto')?.value?.trim();
        const senha = document.getElementById('acomp-senha')?.value?.trim();

        // ValidaÃ§Ãµes
        if (!nome || !email || !quarto || !senha) {
            showToast('Erro', 'Todos os campos sÃ£o obrigatÃ³rios!', 'error');
            return;
        }

        if (senha.length < 6) {
            showToast('Erro', 'A senha deve ter pelo menos 6 caracteres!', 'error');
            return;
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Erro', 'E-mail em formato invÃ¡lido!', 'error');
            return;
        }

        // Mostrar loading
        showToast('Cadastrando...', 'Criando conta do acompanhante...', 'info');

        // Verificar se o email jÃ¡ existe
        const emailExiste = await verificarEmailExistente(email);
        if (emailExiste) {
            showToast('Erro', 'Este e-mail jÃ¡ estÃ¡ cadastrado no sistema!', 'error');
            return;
        }

        // Verificar se o quarto jÃ¡ estÃ¡ ocupado
        console.log(`[DEBUG] cadastrarAcompanhante: verificando ocupaÃ§Ã£o do quarto ${quarto}...`);
        const quartoOcupado = await verificarQuartoOcupado(quarto);
        console.log(`[DEBUG] cadastrarAcompanhante: quarto ${quarto} ocupado?`, quartoOcupado);
        
        if (quartoOcupado) {
            console.log(`[DEBUG] cadastrarAcompanhante: EXIBINDO TOAST DE ERRO para quarto ${quarto}`);
            showToast('Erro', `O quarto ${quarto} jÃ¡ possui um acompanhante cadastrado!`, 'error');
            console.warn(`[AVISO] cadastrarAcompanhante: tentativa de cadastro em quarto ocupado: ${quarto}`);
            console.log(`[DEBUG] cadastrarAcompanhante: RETORNANDO apÃ³s mostrar erro`);
            return;
        }

        // SOLUÃ‡ÃƒO ALTERNATIVA: Criar apenas no Firestore, nÃ£o no Firebase Auth
        // O usuÃ¡rio criarÃ¡ sua conta quando fizer o primeiro login no portal dos acompanhantes
        
        // Gerar um ID Ãºnico para o acompanhante
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
            preCadastro: true, // Flag indicando que ainda nÃ£o foi ativado no Firebase Auth
            criadoEm: new Date().toISOString(),
            criadoPor: usuarioAdmin.nome,
            id: acompanhanteId
        };

        await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).set(dadosAcompanhante);

        // Registrar ocupaÃ§Ã£o do quarto
        await window.db.collection('quartos_ocupados').doc(quarto).set({
            acompanhanteId: acompanhanteId,
            acompanhanteNome: nome,
            acompanhanteEmail: email,
            ocupadoEm: new Date().toISOString()
        });

        debugLog('[DEBUG] cadastrarAcompanhante: acompanhante salvo no Firestore (pre-cadastro)');

        // Limpar formulÃ¡rio
        document.getElementById('form-cadastro-acompanhante').reset();

        // Recarregar lista
        await carregarAcompanhantes();

        showToast('Sucesso', `Acompanhante ${nome} cadastrado com sucesso!`, 'success');

    } catch (error) {
        console.error('[ERRO] cadastrarAcompanhante:', error);
        
        let mensagem = 'Erro ao cadastrar acompanhante: ';
        switch (error.code) {
            case 'auth/email-already-in-use':
                mensagem += 'Este e-mail jÃ¡ estÃ¡ em uso.';
                break;
            case 'auth/weak-password':
                mensagem += 'Senha muito fraca. Use pelo menos 6 caracteres.';
                break;
            case 'auth/invalid-email':
                mensagem += 'E-mail em formato invÃ¡lido.';
                break;
            default:
                mensagem += error.message || 'Erro desconhecido.';
        }
        
        showToast('Erro', mensagem, 'error');
    }
}

// FunÃ§Ã£o para verificar se email jÃ¡ existe
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

// FunÃ§Ã£o para verificar se quarto jÃ¡ estÃ¡ ocupado
async function verificarQuartoOcupado(quarto) {
    try {
        console.log(`[DEBUG] verificarQuartoOcupado: verificando quarto ${quarto}...`);
        
        if (!quarto || !quarto.trim()) {
            console.warn('[AVISO] verificarQuartoOcupado: quarto vazio ou invÃ¡lido');
            return false;
        }
        
        // Verificar na coleÃ§Ã£o quartos_ocupados
        const quartoDoc = await window.db.collection('quartos_ocupados').doc(quarto.trim()).get();
        const quartoExiste = quartoDoc.exists;
        
        console.log(`[DEBUG] verificarQuartoOcupado: quarto ${quarto} existe na coleÃ§Ã£o quartos_ocupados?`, quartoExiste);
        
        if (quartoExiste) {
            const dadosQuarto = quartoDoc.data();
            console.log(`[DEBUG] verificarQuartoOcupado: dados do quarto ocupado:`, dadosQuarto);
        }
        
        // Verificar tambÃ©m na coleÃ§Ã£o de usuÃ¡rios acompanhantes como backup
        // Mas somente se o usuÃ¡rio tiver permissÃ£o
        let temAcompanhante = false;
        const user = window.auth.currentUser;
        
        if (user) {
            try {
                const userData = await window.verificarUsuarioAdminJS(user);
                if (userData && (userData.role === 'super_admin' || userData.role === 'admin')) {
                    const acompSnap = await window.db.collection('usuarios_acompanhantes')
                        .where('quarto', '==', quarto.trim()).get();
                    
                    temAcompanhante = !acompSnap.empty;
                    console.log(`[DEBUG] verificarQuartoOcupado: quarto ${quarto} tem acompanhante na coleÃ§Ã£o usuarios_acompanhantes?`, temAcompanhante);
                    
                    if (temAcompanhante) {
                        const acompanhantes = acompSnap.docs.map(doc => doc.data());
                        console.log(`[DEBUG] verificarQuartoOcupado: acompanhantes encontrados no quarto:`, acompanhantes);
                    }
                } else {
                    console.log(`[DEBUG] verificarQuartoOcupado: usuÃ¡rio sem permissÃ£o para verificar usuarios_acompanhantes`);
                }
            } catch (permError) {
                console.log(`[DEBUG] verificarQuartoOcupado: erro de permissÃ£o ao acessar usuarios_acompanhantes:`, permError.message);
            }
        }
        
        // Retornar true se encontrou em qualquer uma das verificaÃ§Ãµes
        const ocupado = quartoExiste || temAcompanhante;
        console.log(`[DEBUG] verificarQuartoOcupado: resultado final para quarto ${quarto}:`, ocupado);
        
        return ocupado;
        
    } catch (error) {
        console.error(`[ERRO] verificarQuartoOcupado: erro ao verificar quarto ${quarto}:`, error);
        // Em caso de erro, assumir que o quarto nÃ£o estÃ¡ ocupado para nÃ£o bloquear cadastros
        return false;
    }
}

// Listener para atualizaÃ§Ãµes em tempo real dos acompanhantes
let acompanhantesListener = null;

// FunÃ§Ã£o para configurar listener em tempo real para acompanhantes
async function configurarListenerAcompanhantes() {
    debugLog('[DEBUG] configurarListenerAcompanhantes: configurando listener...');
    
    if (!window.db) {
        console.warn('[AVISO] configurarListenerAcompanhantes: Firestore nÃ£o inicializado');
        return;
    }

    // Verificar se usuÃ¡rio tem permissÃ£o para acessar acompanhantes
    const user = window.auth.currentUser;
    if (!user) {
        debugLog('[DEBUG] configurarListenerAcompanhantes: usuÃ¡rio nÃ£o autenticado');
        return;
    }

    try {
        const userData = await window.verificarUsuarioAdminJS(user);
        if (!userData || (userData.role !== 'super_admin' && userData.role !== 'admin')) {
            debugLog('[DEBUG] configurarListenerAcompanhantes: usuÃ¡rio sem permissÃ£o para acompanhantes');
            return;
        }
    } catch (error) {
        debugLog('[DEBUG] configurarListenerAcompanhantes: erro ao verificar permissÃµes:', error);
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
            debugLog('[DEBUG] Listener acompanhantes: atualizaÃ§Ã£o detectada');
            const acompanhantes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            atualizarListaAcompanhantes(acompanhantes);
        } catch (error) {
            console.error('[ERRO] Listener acompanhantes:', error);
        }
    }, (error) => {
        console.error('[ERRO] Listener acompanhantes (erro):', error);
    });
}

// FunÃ§Ã£o para atualizar a exibiÃ§Ã£o da lista de acompanhantes
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
                '<span style="background: #fbbf24; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">AGUARDANDO ATIVAÃ‡ÃƒO</span>' :
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

// FunÃ§Ã£o para carregar lista de acompanhantes
async function carregarAcompanhantes() {
    try {
        debugLog('[DEBUG] carregarAcompanhantes: iniciando...');
        
        if (!window.db) {
            console.warn('[AVISO] carregarAcompanhantes: Firestore nÃ£o inicializado');
            return;
        }

        // Configurar listener em tempo real se ainda nÃ£o foi configurado
        if (!acompanhantesListener) {
            await configurarListenerAcompanhantes();
        }

    } catch (error) {
        console.error('[ERRO] carregarAcompanhantes:', error);
        showToast('Erro', 'Falha ao carregar lista de acompanhantes', 'error');
    }
}

// FunÃ§Ã£o para remover acompanhante
async function removerAcompanhante(acompanhanteId, quarto) {
    try {
        if (!confirm('Tem certeza que deseja remover este acompanhante? Esta aÃ§Ã£o nÃ£o pode ser desfeita.')) {
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

        // Se tem UID (conta foi ativada), tambÃ©m remover registros Ã³rfÃ£os
        if (acompanhanteData && acompanhanteData.uid) {
            debugLog('[DEBUG] removerAcompanhante: removendo registros Ã³rfÃ£os com UID:', acompanhanteData.uid);
            
            // Remover possÃ­vel documento duplicado com UID
            try {
                await window.db.collection('usuarios_acompanhantes').doc(acompanhanteData.uid).delete();
                debugLog('[DEBUG] removerAcompanhante: documento UID removido');
            } catch (error) {
                debugLog('[DEBUG] removerAcompanhante: documento UID nÃ£o existe (normal)');
            }
            
            // Nota: RemoÃ§Ã£o do Firebase Auth requer Admin SDK no backend
            // Por enquanto, a conta Firebase Auth permanecerÃ¡ ativa mas sem dados no Firestore
            console.warn('[AVISO] removerAcompanhante: conta Firebase Auth nÃ£o foi removida (requer backend Admin SDK)');
        }

        // Recarregar lista
        await carregarAcompanhantes();

        showToast('Sucesso', 'Acompanhante removido com sucesso!', 'success');

    } catch (error) {
        console.error('[ERRO] removerAcompanhante:', error);
        showToast('Erro', `Falha ao remover acompanhante: ${error.message}`, 'error');
    }
}

// FunÃ§Ã£o de teste para modal
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

// FunÃ§Ã£o para editar acompanhante (placeholder para implementaÃ§Ã£o futura)
// VariÃ¡vel para controlar se o modal estÃ¡ sendo processado
let editandoAcompanhante = false;
let ultimoClickEditar = 0;

// FunÃ§Ã£o para editar acompanhante
async function editarAcompanhante(acompanhanteId) {
    console.log('ðŸ”§ BOTÃƒO EDITAR CLICADO! ID:', acompanhanteId);
    debugLog('[DEBUG] === INICIANDO editarAcompanhante ===');
    debugLog('[DEBUG] acompanhanteId recebido:', acompanhanteId);
    debugLog('[DEBUG] typeof acompanhanteId:', typeof acompanhanteId);
    
    try {
        // Debounce para evitar cliques duplos muito rÃ¡pidos
        const agora = Date.now();
        if (agora - ultimoClickEditar < 1000) { // Aumentei para 1 segundo
            debugLog('[DEBUG] editarAcompanhante: clique muito rÃ¡pido, ignorando');
            return;
        }
        ultimoClickEditar = agora;
        
        // Prevenir mÃºltiplas execuÃ§Ãµes simultÃ¢neas
        if (editandoAcompanhante) {
            debugLog('[DEBUG] editarAcompanhante: jÃ¡ estÃ¡ processando, ignorando chamada duplicada');
            return;
        }
        
        editandoAcompanhante = true;
        debugLog('[DEBUG] editarAcompanhante: iniciando ediÃ§Ã£o para ID:', acompanhanteId);
        
        // Verificar se o modal existe no DOM
        const modalElement = document.getElementById('modal-editar-acompanhante');
        if (!modalElement) {
            console.error('[ERRO] Modal modal-editar-acompanhante nÃ£o encontrado no DOM');
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
            showToast('Erro', 'Acompanhante nÃ£o encontrado', 'error');
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
        document.getElementById('edit-acomp-senha').value = ''; // Sempre vazio por seguranÃ§a
        
        // Mostrar o modal
        const modalToShow = document.getElementById('modal-editar-acompanhante');
        debugLog('[DEBUG] === MOSTRANDO MODAL ===');
        debugLog('[DEBUG] Modal antes de remover hidden:', modalToShow.classList.toString());
        
        // Garantir que o modal esteja anexado ao body (nÃ£o dentro de uma seÃ§Ã£o)
        if (modalToShow.parentElement !== document.body) {
            debugLog('[DEBUG] Modal nÃ£o estÃ¡ no body, movendo...');
            document.body.appendChild(modalToShow);
        }
        
        modalToShow.classList.remove('hidden');
        debugLog('[DEBUG] Modal apÃ³s remover hidden:', modalToShow.classList.toString());
        
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
        
        // Verificar se o modal estÃ¡ realmente visÃ­vel
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
        
        // Verificar se hÃ¡ elementos pai que podem estar interferindo
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
        
        // Verificar se o modal estÃ¡ realmente na viewport
        const rect = modalToShow.getBoundingClientRect();
        debugLog('[DEBUG] Modal getBoundingClientRect:', {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            visible: rect.width > 0 && rect.height > 0
        });
        
        // Tentar forÃ§ar ainda mais a visibilidade
        modalToShow.style.position = 'fixed';
        modalToShow.style.top = '0';
        modalToShow.style.left = '0';
        modalToShow.style.width = '100vw';
        modalToShow.style.height = '100vh';
        modalToShow.style.zIndex = '99999';
        modalToShow.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        
        debugLog('[DEBUG] Modal forÃ§ado com estilos inline');
        debugLog('[DEBUG] Modal de ediÃ§Ã£o configurado com sucesso');
        debugLog('[DEBUG] === FIM MOSTRAR MODAL ===');
        
        // Foco no primeiro campo
        setTimeout(() => {
            document.getElementById('edit-acomp-nome').focus();
        }, 100);
        
    } catch (error) {
        console.error('[ERRO] editarAcompanhante:', error);
        showToast('Erro', 'Erro ao carregar dados do acompanhante', 'error');
    } finally {
        // Sempre resetar a variÃ¡vel de controle
        editandoAcompanhante = false;
    }
}

// FunÃ§Ã£o para fechar modal de ediÃ§Ã£o
function fecharModalEditarAcompanhante() {
    debugLog('[DEBUG] Fechando modal de ediÃ§Ã£o');
    
    const modal = document.getElementById('modal-editar-acompanhante');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    
    // Limpar formulÃ¡rio
    document.getElementById('form-editar-acompanhante').reset();
    document.getElementById('edit-acomp-id').value = '';
    
    // Resetar variÃ¡vel de controle
    editandoAcompanhante = false;
}

// FunÃ§Ã£o para salvar ediÃ§Ã£o do acompanhante
async function salvarEdicaoAcompanhante(event) {
    event.preventDefault();
    
    try {
        const acompanhanteId = document.getElementById('edit-acomp-id').value;
        const nome = document.getElementById('edit-acomp-nome').value.trim();
        const email = document.getElementById('edit-acomp-email').value.trim();
        const quarto = document.getElementById('edit-acomp-quarto').value.trim();
        const novaSenha = document.getElementById('edit-acomp-senha').value.trim();
        
        if (!nome || !email || !quarto) {
            showToast('Erro', 'Todos os campos obrigatÃ³rios devem ser preenchidos', 'error');
            return;
        }
        
        debugLog('[DEBUG] Salvando ediÃ§Ã£o do acompanhante:', { acompanhanteId, nome, email, quarto });
        
        showToast('Atualizando...', 'Salvando alteraÃ§Ãµes...', 'info');
        
        // Buscar dados atuais para comparar quarto
        const docAtual = await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).get();
        const dadosAtuais = docAtual.data();
        const quartoAtual = dadosAtuais.quarto;
        
        // Preparar dados para atualizaÃ§Ã£o
        const updateData = {
            nome,
            email,
            quarto,
            atualizadoEm: firebase.firestore.Timestamp.now()
        };
        
        // Se uma nova senha foi fornecida, atualizar no Firebase Auth
        if (novaSenha) {
            debugLog('[DEBUG] Nova senha fornecida, atualizando autenticaÃ§Ã£o...');
            // Nota: Para atualizar senha no Firebase Auth seria necessÃ¡rio Admin SDK no backend
            // Por enquanto, apenas log que a funcionalidade precisa ser implementada
            console.warn('[AVISO] AtualizaÃ§Ã£o de senha requer implementaÃ§Ã£o no backend');
            showToast('Aviso', 'Senha nÃ£o pode ser alterada nesta versÃ£o. Contate o administrador.', 'warning');
        }
        
        // Verificar se o quarto mudou para atualizar a tabela de quartos ocupados
        if (quartoAtual !== quarto) {
            debugLog('[DEBUG] Quarto alterado de', quartoAtual, 'para', quarto);
            
            // Verificar se o novo quarto jÃ¡ estÃ¡ ocupado
            const quartoOcupado = await window.db.collection('quartos_ocupados').doc(quarto).get();
            if (quartoOcupado.exists) {
                showToast('Erro', `Quarto ${quarto} jÃ¡ estÃ¡ ocupado por outro acompanhante`, 'error');
                return;
            }
            
            // TransaÃ§Ã£o para atualizar quarto
            await window.db.runTransaction(async (transaction) => {
                // Remover ocupaÃ§Ã£o do quarto antigo
                if (quartoAtual) {
                    transaction.delete(window.db.collection('quartos_ocupados').doc(quartoAtual));
                }
                
                // Adicionar ocupaÃ§Ã£o do novo quarto
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
            // Apenas atualizar dados do acompanhante (quarto nÃ£o mudou)
            await window.db.collection('usuarios_acompanhantes').doc(acompanhanteId).update(updateData);
        }
        
        showToast('Sucesso', 'Acompanhante atualizado com sucesso!', 'success');
        
        // Fechar modal e recarregar lista
        fecharModalEditarAcompanhante();
        await carregarAcompanhantes();
        
    } catch (error) {
        console.error('[ERRO] salvarEdicaoAcompanhante:', error);
        showToast('Erro', `Erro ao salvar alteraÃ§Ãµes: ${error.message}`, 'error');
    }
}

// Expor funÃ§Ãµes globalmente
window.cadastrarAcompanhante = cadastrarAcompanhante;
window.carregarAcompanhantes = carregarAcompanhantes;
window.configurarListenerAcompanhantes = configurarListenerAcompanhantes;
window.atualizarListaAcompanhantes = atualizarListaAcompanhantes;
window.removerAcompanhante = removerAcompanhante;
window.editarAcompanhante = editarAcompanhante;
window.fecharModalEditarAcompanhante = fecharModalEditarAcompanhante;
window.salvarEdicaoAcompanhante = salvarEdicaoAcompanhante;

// === FUNÃ‡Ã•ES DE LIMPEZA E MANUTENÃ‡ÃƒO ===

// FunÃ§Ã£o para limpar dados de teste
window.limparDadosTeste = async function() {
    // Verificar permissÃµes primeiro
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    if (!usuarioAdmin || usuarioAdmin.role !== 'super_admin') {
        showToast('Erro', 'Acesso negado! Apenas super administradores podem executar limpeza de dados.', 'error');
        return;
    }
    
    // 1. Perguntar a data para exclusÃ£o
    const dataInput = prompt('ðŸ“… LIMPEZA SELETIVA DE DADOS\n\nDigite a data limite para exclusÃ£o (formato: DD/MM/AAAA)\n\nSerÃ£o removidas todas as solicitaÃ§Ãµes ANTES desta data.\n\nExemplo: 01/01/2024\n\nDeixe em branco para limpar TUDO:');
    
    let dataLimite = null;
    let textoConfirmacao = '';
    
    if (dataInput && dataInput.trim()) {
        // Validar formato da data
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dataInput.match(regex);
        
        if (!match) {
            showToast('Erro', 'Formato de data invÃ¡lido. Use DD/MM/AAAA', 'error');
            return;
        }
        
        const [_, dia, mes, ano] = match;
        dataLimite = new Date(ano, mes - 1, dia);
        
        if (isNaN(dataLimite.getTime())) {
            showToast('Erro', 'Data invÃ¡lida.', 'error');
            return;
        }
        
        textoConfirmacao = `solicitaÃ§Ãµes ANTES de ${dataInput}`;
    } else {
        textoConfirmacao = 'TODAS as solicitaÃ§Ãµes e pesquisas de satisfaÃ§Ã£o';
        dataLimite = null;
    }
    
    // 2. Primeira confirmaÃ§Ã£o
    if (!confirm(`âš ï¸ ATENÃ‡ÃƒO: Esta aÃ§Ã£o irÃ¡ remover ${textoConfirmacao} do sistema.\n\nEsta aÃ§Ã£o Ã© IRREVERSÃVEL!\n\nDeseja continuar?`)) {
        return;
    }
    
    // 3. Segunda confirmaÃ§Ã£o com entrada de texto
    const confirmacao = prompt(`âš ï¸ CONFIRMAÃ‡ÃƒO FINAL\n\nPara confirmar que deseja limpar ${textoConfirmacao}, digite exatamente: CONFIRMAR LIMPEZA\n\n(Digite "CONFIRMAR LIMPEZA" sem aspas)`);
    
    if (confirmacao !== 'CONFIRMAR LIMPEZA') {
        showToast('Info', 'OperaÃ§Ã£o cancelada. Texto de confirmaÃ§Ã£o incorreto.', 'info');
        return;
    }
    
    try {
        console.log(`[LIMPEZA] Iniciando limpeza ${dataLimite ? 'seletiva' : 'completa'} dos dados...`);
        
        let totalRemovido = 0;
        
        // 1. Buscar e remover solicitaÃ§Ãµes (com ou sem filtro de data)
        console.log('[LIMPEZA] Buscando solicitaÃ§Ãµes...');
        
        let query = window.db.collection('solicitacoes');
        
        // Aplicar filtro de data se especificado
        if (dataLimite) {
            query = query.where('criadoEm', '<', dataLimite);
        }
        
        const solicitacoesSnapshot = await query.get();
        
        if (!solicitacoesSnapshot.empty) {
            console.log(`[LIMPEZA] Encontradas ${solicitacoesSnapshot.size} solicitaÃ§Ãµes para remover`);
            
            // Remover em lotes para melhor performance
            const batch = window.db.batch();
            let batchCount = 0;
            
            solicitacoesSnapshot.forEach(doc => {
                batch.delete(doc.ref);
                batchCount++;
                totalRemovido++;
                
                // Firestore permite mÃ¡ximo 500 operaÃ§Ãµes por batch
                if (batchCount >= 500) {
                    batch.commit();
                    batchCount = 0;
                }
            });
            
            // Commit do Ãºltimo batch se houver operaÃ§Ãµes pendentes
            if (batchCount > 0) {
                await batch.commit();
            }
            
            console.log(`[LIMPEZA] ${solicitacoesSnapshot.size} solicitaÃ§Ãµes removidas`);
        }
        
        // 2. Buscar e remover quartos ocupados Ã³rfÃ£os
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
        
        // 3. Limpar dados de satisfaÃ§Ã£o incorporados nas solicitaÃ§Ãµes (jÃ¡ removidos com as solicitaÃ§Ãµes)
        
        console.log(`[LIMPEZA] âœ… Limpeza concluÃ­da! Total de ${totalRemovido} registros removidos.`);
        
        // Mostrar resultado com informaÃ§Ã£o da data
        const dataInfo = dataLimite ? `\nðŸ“… Dados removidos: anteriores a ${dataInput}` : '\nðŸ“… Dados removidos: TODOS os registros';
        const successMessage = `âœ… Limpeza concluÃ­da com sucesso!${dataInfo}\n\nðŸ“Š Resumo:\n- SolicitaÃ§Ãµes removidas: ${solicitacoesSnapshot.size || 0}\n- Quartos liberados: ${quartosSnapshot.size || 0}\n- Total de registros: ${totalRemovido}\n\n${dataLimite ? 'Limpeza seletiva' : 'Limpeza completa'} realizada!`;
        
        showToast('Sucesso', 'Limpeza concluÃ­da com sucesso!', 'success');
        alert(successMessage);
        
        // Recarregar relatÃ³rios se estiver na tela de relatÃ³rios
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

// FunÃ§Ã£o para verificar estatÃ­sticas dos dados
window.verificarEstatisticas = async function() {
    try {
        console.log('[STATS] Coletando estatÃ­sticas dos dados...');
        
        // Contar solicitaÃ§Ãµes por status
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
        
        // Contar usuÃ¡rios
        const adminSnapshot = await window.db.collection('usuarios_admin').get();
        const equipeSnapshot = await window.db.collection('usuarios_equipe').get();
        
        // Verificar permissÃµes antes de acessar usuarios_acompanhantes
        let acompanhantesCount = 0;
        const user = window.auth.currentUser;
        if (user) {
            try {
                const userData = await window.verificarUsuarioAdminJS(user);
                if (userData && (userData.role === 'super_admin' || userData.role === 'admin')) {
                    const acompanhantesSnapshot = await window.db.collection('usuarios_acompanhantes').get();
                    acompanhantesCount = acompanhantesSnapshot.size;
                } else {
                    console.log('[STATS] UsuÃ¡rio sem permissÃ£o para contar acompanhantes');
                }
            } catch (permError) {
                console.log('[STATS] Erro de permissÃ£o ao acessar acompanhantes:', permError.message);
            }
        }
        
        stats.usuarios = {
            admins: adminSnapshot.size,
            equipe: equipeSnapshot.size,
            acompanhantes: acompanhantesCount
        };
        
        console.log('[STATS] EstatÃ­sticas coletadas:', stats);
        
        const relatorio = `
ðŸ“Š ESTATÃSTICAS DO SISTEMA YUNA
===============================

ðŸ“‹ SOLICITAÃ‡Ã•ES:
  â€¢ Total: ${stats.total}
  â€¢ Pendentes: ${stats.pendente}
  â€¢ Em Andamento: ${stats.emAndamento}
  â€¢ Finalizadas: ${stats.finalizada}
  â€¢ Avaliadas: ${stats.avaliada}

ðŸ¢ POR DEPARTAMENTO:
  â€¢ ManutenÃ§Ã£o: ${stats.porEquipe.manutencao}
  â€¢ NutriÃ§Ã£o: ${stats.porEquipe.nutricao}
  â€¢ HigienizaÃ§Ã£o: ${stats.porEquipe.higienizacao}
  â€¢ Hotelaria: ${stats.porEquipe.hotelaria}

ðŸ  QUARTOS OCUPADOS: ${stats.quartosOcupados}

ðŸ‘¥ USUÃRIOS:
  â€¢ Administradores: ${stats.usuarios.admins}
  â€¢ Equipe: ${stats.usuarios.equipe}
  â€¢ Acompanhantes: ${stats.usuarios.acompanhantes}
        `;
        
        alert(relatorio);
        console.log(relatorio);
        
        return stats;
        
    } catch (error) {
        console.error('[ERRO] Falha ao verificar estatÃ­sticas:', error);
        alert(`âŒ Erro ao coletar estatÃ­sticas: ${error.message}`);
    }
};

// FunÃ§Ã£o para adicionar painel de manutenÃ§Ã£o no relatÃ³rios
window.adicionarPainelManutencao = function() {
    try {
        // Verificar se jÃ¡ foi adicionado
        const existente = document.querySelector('.maintenance-panel');
        if (existente) {
            console.log('[MANUTENCAO] Painel jÃ¡ existe, nÃ£o adicionando novamente');
            return;
        }
        
        // Encontrar o container de relatÃ³rios
        const relatoriosContainer = document.querySelector('#relatorios .container-fluid') || 
                                   document.querySelector('#relatorios .section-content') ||
                                   document.querySelector('#relatorios');
        
        if (!relatoriosContainer) {
            console.warn('[MANUTENCAO] Container de relatÃ³rios nÃ£o encontrado');
            return;
        }
        
        // Criar o painel de manutenÃ§Ã£o
        const painelManutencao = document.createElement('div');
        painelManutencao.innerHTML = `
            <div class="maintenance-panel" style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); margin: 20px 0; padding: 20px; border-radius: 12px; border: 1px solid #e74c3c; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                    <i class="fas fa-tools" style="margin-right: 10px;"></i>
                    Ferramentas de ManutenÃ§Ã£o do Sistema
                </h3>
                <p style="color: #fff; margin: 0 0 15px 0; font-size: 14px; opacity: 0.9;">
                    âš ï¸ <strong>Apenas para Super Administradores</strong> - Use com extrema cautela
                </p>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="verificarEstatisticas()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-chart-bar"></i> Verificar EstatÃ­sticas
                    </button>
                    <button onclick="limparDadosTeste()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-trash-alt"></i> Limpar Dados de Teste
                    </button>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <small style="color: rgba(255,255,255,0.8); font-size: 12px;">
                        ðŸ’¡ <strong>Dica:</strong> Use "Verificar EstatÃ­sticas" antes de limpar para conferir o que serÃ¡ removido
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
        
        // Inserir no inÃ­cio do container (logo apÃ³s o tÃ­tulo)
        const primeiroElemento = relatoriosContainer.querySelector('.row') || relatoriosContainer.firstElementChild;
        if (primeiroElemento) {
            primeiroElemento.parentNode.insertBefore(painelManutencao, primeiroElemento);
        } else {
            relatoriosContainer.appendChild(painelManutencao);
        }
        
        console.log('[MANUTENCAO] Painel de manutenÃ§Ã£o adicionado com sucesso');
        
    } catch (error) {
        console.error('[ERRO] Falha ao adicionar painel de manutenÃ§Ã£o:', error);
    }
};

// FunÃ§Ã£o para debug completo do estado da aplicaÃ§Ã£o
window.debugEstadoApp = function() {
    console.log('===== DEBUG ESTADO DA APLICAÃ‡ÃƒO =====');
    console.log('1. VariÃ¡veis globais:', {
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
    
    console.log('5. FunÃ§Ãµes disponÃ­veis:', {
        mostrarRelatorios: typeof window.mostrarRelatorios,
        mostrarSecaoPainel: typeof mostrarSecaoPainel,
        carregarSolicitacoes: typeof carregarSolicitacoes
    });
    
    console.log('===== FIM DEBUG =====');
};

// FunÃ§Ã£o melhorada para logout com limpeza completa
window.logout = async function() {
    try {
        debugLog('[DEBUG] Iniciando processo de logout...');
        
        // 1. Logout do Firebase
        await window.auth.signOut();
        
        // 2. Limpar dados do localStorage
        localStorage.removeItem('usuarioAdmin');
        
        // 3. Limpar variÃ¡veis globais
        window.usuarioAdmin = null;
        window.userEmail = null;
        window.userRole = null;
        
        // 4. Resetar campos de login
        const tipoSelect = document.getElementById('tipo-acesso');
        const departamentoSection = document.getElementById('departamento-section');
        const departamentoSelect = document.getElementById('departamento');
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (tipoSelect) tipoSelect.value = '';
        if (departamentoSelect) departamentoSelect.value = '';
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        // 5. Ocultar seÃ§Ã£o de departamento
        if (departamentoSection) {
            departamentoSection.classList.add('hidden');
        }
        
        // 6. Limpar interface completamente
        limparInterfaceCompleta();
        
        debugLog('[DEBUG] Logout concluÃ­do com sucesso');
        showToast('Sucesso', 'Logout realizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('[ERRO] Erro no logout:', error);
        showToast('Erro', 'Erro ao fazer logout.', 'error');
        
        // Mesmo com erro, limpar interface
        limparInterfaceCompleta();
    }
};

// === VERIFICAÃ‡ÃƒO FINAL - FORÃ‡AR BOTÃƒO LIMPEZA ===
(function verificacaoFinal() {
    setTimeout(() => {
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (usuarioAdmin?.role === 'super_admin') {
            const btnLimpeza = document.getElementById('limpeza-btn');
            if (btnLimpeza) {
                console.log('[FINAL-CHECK] ForÃ§ando visibilidade do botÃ£o limpeza para super_admin');
                btnLimpeza.classList.remove('btn-hide', 'hidden');
                btnLimpeza.style.cssText = 'display: inline-flex !important; visibility: visible !important;';
                btnLimpeza.title = 'Limpar dados de teste e pesquisas de satisfaÃ§Ã£o';
            } else {
                console.warn('[FINAL-CHECK] BotÃ£o limpeza nÃ£o encontrado no DOM');
            }
        }
    }, 2000);
})();

// === FUNÃ‡ÃƒO PARA REMOÃ‡ÃƒO FORÃ‡ADA DE BOTÃ•ES DEBUG ===
window.forceRemoveDebugButtons = function() {
    const debugSelectors = [
        'button[onclick*="showUsersDireto"]',
        'button[onclick*="debugFuncs"]',
        'button[onclick*="mostrarRelatoriosDirectly"]',
        '#debug-btn',
        '#usuarios-direto-btn',
        '#relatorios-direto-btn'
    ];
    
    const debugTexts = ['usuÃ¡rios direto', 'debug', 'relatÃ³rios direto', 'usuario direto', 'relatorio direto'];
    let removed = 0;
    
    // RemoÃ§Ã£o por seletores
    debugSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            debugLog(`[FORCE-REMOVE] Removendo por seletor: ${selector}`);
            el.remove();
            removed++;
        });
    });
    
    // RemoÃ§Ã£o por texto (busca em TODOS os elementos)
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        if (el.tagName === 'BUTTON' || el.getAttribute('onclick') || el.classList.contains('button')) {
            const text = (el.textContent || '').trim().toLowerCase();
            if (debugTexts.some(debugText => text.includes(debugText))) {
                debugLog(`[FORCE-REMOVE] Removendo elemento por texto: "${el.textContent}"`);
                // MÃºltiplas formas de remoÃ§Ã£o
                el.style.display = 'none !important';
                el.style.visibility = 'hidden !important';
                el.remove();
                removed++;
            }
        }
    });
    
    // Interceptar criaÃ§Ã£o dinÃ¢mica de botÃµes
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        
        if (tagName.toLowerCase() === 'button') {
            // Observar mudanÃ§as de texto
            const observer = new MutationObserver(() => {
                const text = (element.textContent || '').trim().toLowerCase();
                if (debugTexts.some(debugText => text.includes(debugText))) {
                    debugLog('[INTERCEPT] Bloqueando criaÃ§Ã£o de botÃ£o debug:', text);
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

// === FUNÃ‡Ã•ES DE FILTRO DAS SOLICITAÃ‡Ã•ES ===

// Filtrar solicitaÃ§Ãµes por status
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
    
    // Mostrar empty state se necessÃ¡rio
    atualizarEmptyState(equipe, visibleCount);
};

// Filtrar solicitaÃ§Ãµes por prioridade
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
    
    // Mostrar empty state se necessÃ¡rio
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

// FunÃ§Ã£o auxiliar para mostrar/esconder empty state
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
                'manutencao': 'ManutenÃ§Ã£o',
                'nutricao': 'NutriÃ§Ã£o',
                'higienizacao': 'HigienizaÃ§Ã£o',
                'hotelaria': 'Hotelaria'
            };
            
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state filter-empty';
            emptyState.innerHTML = `
                <i class="fas fa-${icones[equipe]}"></i>
                <p>Nenhuma solicitaÃ§Ã£o encontrada com os filtros aplicados</p>
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

// === APLICAR CSS FORCE-HIDE PARA PRODUÃ‡ÃƒO ===
(function applyProductionCSS() {
    if (MODO_PRODUCAO) {
        const style = document.createElement('style');
        style.textContent = `
            /* CSS para esconder elementos de debug em produÃ§Ã£o */
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
            
            /* Esconder qualquer botÃ£o que contenha textos de debug */
            button:contains("usuÃ¡rios direto"),
            button:contains("debug"), 
            button:contains("relatÃ³rios direto"),
            button:contains("usuario direto"),
            button:contains("relatorio direto") {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        debugLog('[PRODUCTION] CSS de ocultaÃ§Ã£o aplicado');
    }
})();

// ===== FUNÃ‡Ã•ES DE GRÃFICOS E ALERTAS INTELIGENTES =====

function renderizarGraficos(metricas) {
    console.log('ðŸŽ¨ Renderizando grÃ¡ficos com dados:', metricas);
    
    // Inicializar objeto global para armazenar instÃ¢ncias dos grÃ¡ficos
    if (!window.chartInstances) {
        window.chartInstances = {};
    }
    
    // Renderizar cada grÃ¡fico
    renderizarGraficoStatus(metricas.statusDistribution);
    renderizarGraficoEquipes(metricas.porEquipe);
    renderizarGraficoTendencias(metricas.tendencias);
    renderizarGraficoPicos(metricas.picosDemanda);
}

function renderizarGraficoStatus(statusData) {
    const ctx = document.getElementById('grafico-status');
    if (!ctx) return;
    
    // Destruir grÃ¡fico anterior se existir
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
    
    // Destruir grÃ¡fico anterior se existir
    if (window.chartInstances.equipes) {
        window.chartInstances.equipes.destroy();
    }
    
    const equipesNomes = {
        manutencao: 'ManutenÃ§Ã£o',
        nutricao: 'NutriÃ§Ã£o', 
        higienizacao: 'HigienizaÃ§Ã£o',
        hotelaria: 'Hotelaria'
    };
    
    const labels = Object.keys(equipesData).map(equipe => equipesNomes[equipe] || equipe);
    const totals = Object.values(equipesData).map(dados => dados.total);
    const slaCompliance = Object.values(equipesData).map(dados => dados.slaCompliance);
    
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Total SolicitaÃ§Ãµes',
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
                        text: 'SolicitaÃ§Ãµes'
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
    
    // Destruir grÃ¡fico anterior se existir
    if (window.chartInstances.tendencias) {
        window.chartInstances.tendencias.destroy();
    }
    
    const labels = tendenciasData.ultimos7dias.map(dia => dia.label);
    const dados = tendenciasData.ultimos7dias.map(dia => dia.count);
    
    const data = {
        labels: labels,
        datasets: [{
            label: 'SolicitaÃ§Ãµes por Dia',
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
                        text: 'NÃºmero de SolicitaÃ§Ãµes'
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
    
    // Destruir grÃ¡fico anterior se existir
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
            label: 'SolicitaÃ§Ãµes por Hora',
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
    console.log('ðŸš¨ Configurando alertas inteligentes:', metricas.alertas);
    
    // Atualizar contador de alertas na interface principal
    atualizarContadorAlertas(metricas.alertas.length);
    
    // Configurar notificaÃ§Ãµes automÃ¡ticas para alertas crÃ­ticos
    metricas.alertas.forEach(alerta => {
        if (alerta.urgencia === 'critica') {
            showToast('Alerta CrÃ­tico!', `SLA ${alerta.percentual}% na equipe ${alerta.equipe}`, 'error');
        }
    });
}

function atualizarContadorAlertas(quantidade) {
    // Verificar se existe elemento para mostrar alertas na interface principal
    let alertaBadge = document.getElementById('alertas-badge');
    if (!alertaBadge && quantidade > 0) {
        // Criar badge de alertas no botÃ£o de mÃ©tricas
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

