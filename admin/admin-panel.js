// admin-panel.js - Painel Administrativo YUNA

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

// === LIMPEZA IMEDIATA DE CACHE AGRESSIVA ===
(function forceCleanupDebugElements() {
    
    // Função de limpeza extremamente agressiva
    function removeUnwantedButtons() {
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
    debugLog('[DEBUG] alterarTipoAcesso: função chamada');
    
    const tipoSelect = document.getElementById('tipo-acesso');
    const departamentoSection = document.getElementById('departamento-section');
    const departamentoSelect = document.getElementById('departamento');
    
    if (!tipoSelect || !departamentoSection) {
        console.error('[ERRO] alterarTipoAcesso: elementos não encontrados');
        return;
    }
    
    const tipo = tipoSelect.value;
    debugLog('[DEBUG] alterarTipoAcesso: tipo selecionado =', tipo);
    
    if (tipo === 'equipe') {
        // Mostrar seção de departamento para equipe
        departamentoSection.classList.remove('hidden');
        debugLog('[DEBUG] alterarTipoAcesso: mostrando departamento-section');
    } else {
        // Ocultar seção de departamento para admin
        departamentoSection.classList.add('hidden');
        if (departamentoSelect) {
            departamentoSelect.value = ''; // Limpar seleção
        }
        debugLog('[DEBUG] alterarTipoAcesso: ocultando departamento-section');
    }
};

// Função para alternar tipo de usuário no modal de criação (também definida cedo)
window.alterarTipoUsuario = function() {
    debugLog('[DEBUG] alterarTipoUsuario: função chamada');
    
    const tipoSelect = document.getElementById('usuario-tipo');
    const campoEquipe = document.getElementById('campo-equipe');
    const usuarioEquipeSelect = document.getElementById('usuario-equipe');
    
    if (!tipoSelect || !campoEquipe) {
        console.error('[ERRO] alterarTipoUsuario: elementos não encontrados');
        return;
    }
    
    const tipo = tipoSelect.value;
    debugLog('[DEBUG] alterarTipoUsuario: tipo selecionado =', tipo);
    
    if (tipo === 'equipe') {
        // Mostrar campo de equipe e torná-lo obrigatório
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
            usuarioEquipeSelect.value = ''; // Limpar seleção
        }
        debugLog('[DEBUG] alterarTipoUsuario: ocultando campo equipe');
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
            window.location.reload();
        }).catch(error => {
            console.error('Erro no logout:', error);
            window.location.reload();
        });
    } else {
        window.location.reload();
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
            
            // Recarregar solicitações de forma simplificada
            if (typeof carregarSolicitacoes === 'function') {
                debugLog('[DEBUG] mostrarSecaoPainel: carregando solicitações...');
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
            // Para relatórios, mostrar APENAS a seção de relatórios (não o admin-panel)
            const relatoriosSection = document.getElementById('relatorios-section');
            if (relatoriosSection) {
                relatoriosSection.classList.remove('hidden');
                debugLog('[DEBUG] mostrarSecaoPainel: exibindo APENAS relatorios-section');
            } else {
                console.error('[ERRO] mostrarSecaoPainel: elemento relatorios-section não encontrado no HTML!');
                alert('Erro: Seção de relatórios não encontrada no HTML');
                return false;
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
        window.auth.onAuthStateChanged(async function(user) {
            try {
                if (user) {
                    debugLog('[DEBUG] Usuário autenticado:', user.email);
                    debugLog('[DEBUG] UID do usuário:', user.uid);
                    
                    // Verifica admin via Firestore
                    debugLog('[DEBUG] Verificando permissões do usuário...');
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
                        
                        // Configuração adicional após um pequeno delay para garantir DOM estável
                        setTimeout(() => {
                            debugLog('[DEBUG] Reconfiguração de segurança dos botões...');
                            atualizarVisibilidadeBotoes();
                            configurarEventosBotoes();
                            
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
                
                // Usar função de limpeza completa
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
        debugLog('[DEBUG] handleLogin: login iniciado...');
        event.preventDefault();
        const senha = document.getElementById('login-password').value;
        
        if (!email || !senha) {
            showToast('Erro', 'Preencha email e senha.', 'error');
            console.warn('[AVISO] handleLogin: email ou senha não preenchidos!');
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
        
        // Verificar se Firebase está disponível
        if (!window.auth) {
            console.error('[ERRO] Firebase Auth não disponível');
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
            // Exibe o papel correto do usuário
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
        
        // Mostrar painel diretamente após login
        debugLog('[DEBUG] Mostrando painel após login...');
        mostrarSecaoPainel('painel');
        
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
        
        // Tratamento específico de diferentes tipos de erro
        let mensagemErro = 'Erro desconhecido no login';
        
        if (error.code === 'auth/invalid-login-credentials' || 
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
        } else if (error.message) {
            mensagemErro = error.message;
            mostrarModoDesenvolvimento = true;
        }
        
        showToast('Erro', mensagemErro, 'error');
        
        // Se há problemas de conectividade ou credenciais, oferecer modo desenvolvimento
        if (mostrarModoDesenvolvimento) {
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
    
    // Permite APENAS para super_admin
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem criar usuários.', 'error');
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
        // Verificar permissões
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const userRole = window.userRole || usuarioAdmin.role;
        
        if (!userRole || userRole !== 'super_admin') {
            showToast('Erro', 'Acesso negado. Apenas super administradores podem criar usuários.', 'error');
            return;
        }
        
        // Obter dados do formulário
        const tipo = document.getElementById('usuario-tipo').value;
        const nome = document.getElementById('usuario-nome').value.trim();
        const email = document.getElementById('usuario-email').value.trim();
        const senha = document.getElementById('usuario-senha').value;
        const equipe = document.getElementById('usuario-equipe').value;
        
        debugLog('[DEBUG] Dados do formulário:', { tipo, nome, email, senha: senha.length, equipe });
        
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
        
        if (senha.length < 6) {
            showToast('Erro', 'A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }
        
        // Desabilitar botão durante criação
        const btnSubmit = document.querySelector('#form-novo-usuario button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Criando...';
        }
        
        debugLog('[DEBUG] Criando usuário no Firebase Auth...');
        
        // Criar usuário no Firebase Auth
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        debugLog('[DEBUG] Usuário criado no Auth:', user.uid);
        
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
                    criarUsuarios: false,
                    gerenciarDepartamentos: true,
                    verRelatorios: true,
                    gerenciarSolicitacoes: true,
                    gerenciarAcompanhantes: true
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
        
        debugLog('[DEBUG] Salvando no Firestore - Coleção:', colecao);
        
        // Salvar no Firestore
        await window.db.collection(colecao).doc(user.uid).set(dadosUsuario);
        
        debugLog('[DEBUG] Usuário salvo com sucesso');
        
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
            mensagem = 'Este email já está sendo usado por outro usuário.';
        } else if (error.code === 'auth/invalid-email') {
            mensagem = 'Email inválido.';
        } else if (error.code === 'auth/weak-password') {
            mensagem = 'Senha muito fraca (mínimo 6 caracteres).';
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
        
        debugLog('[DEBUG] mostrarRelatorios: acesso autorizado, mostrando seção relatórios');
        
        // Permite acesso para admin e super_admin autenticados
        mostrarSecaoPainel('relatorios');
        
        debugLog('[DEBUG] mostrarRelatorios: seção mostrada, configurando filtros');
        
        var filtroPeriodo = document.getElementById('filtro-periodo');
        if (filtroPeriodo && !filtroPeriodo.dataset.listenerAdded) {
            filtroPeriodo.addEventListener('change', function() {
                var customDateRange = document.getElementById('custom-date-range');
                customDateRange.style.display = this.value === 'custom' ? 'grid' : 'none';
            });
            filtroPeriodo.dataset.listenerAdded = 'true';
        }
        
        debugLog('[DEBUG] mostrarRelatorios: verificando se deve carregar solicitações');
        
        // NÃO carregar solicitações na tela de relatórios - apenas configurar filtros
        debugLog('[DEBUG] mostrarRelatorios: configurando apenas filtros (não carregando solicitações)');
        
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
    // Verificar se é super_admin
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
    
    // Garantir que os botões estejam configurados ao voltar ao painel
    setTimeout(() => {
        debugLog('[DEBUG] voltarPainelPrincipal: reconfigurando botões...');
        atualizarVisibilidadeBotoes();
        configurarEventosBotoes();
    }, 100);
};

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
    
    console.log('[USUARIOS] Criando HTML para', listaUsuarios.length, 'usuários');
    const htmlContent = listaUsuarios.map(user => `
        <div class='user-row' style='display:flex; align-items:center; gap:1.5rem; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04); padding:1rem 2rem;'>
            <span style='font-weight:600; color:#374151;'>${user.nome || 'Nome não informado'}</span>
            <span style='color:#2563eb;'>${user.departamento || user.equipe || '-'}</span>
            <span style='color:#f59e0b;'>${user.tipo || '-'}</span>
            <span style='color:#6b7280;'>${user.email || 'Email não informado'}</span>
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
        editModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 100000; display: flex;
            align-items: center; justify-content: center;
        `;
        
        editModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; color: #374151;">Editar Usuário</h3>
                
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
                        <option value="manutencao" ${userData.departamento === 'manutencao' ? 'selected' : ''}>Manutenção</option>
                        <option value="nutricao" ${userData.departamento === 'nutricao' ? 'selected' : ''}>Nutrição</option>
                        <option value="higienizacao" ${userData.departamento === 'higienizacao' ? 'selected' : ''}>Higienização</option>
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
window.salvarUsuarioEditado = async function(userId, collection) {
    try {
        const nome = document.getElementById('edit-nome').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        
        if (!nome || !email) {
            showToast('Erro', 'Nome e email são obrigatórios', 'error');
            return;
        }
        
        const updateData = { nome, email };
        
        // Adicionar campos específicos da coleção
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
        
        showToast('Sucesso', 'Usuário atualizado com sucesso', 'success');
        
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
        console.error('[ERRO] Falha ao salvar usuário:', error);
        showToast('Erro', 'Não foi possível salvar as alterações', 'error');
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
    // Verificar se estamos na tela de relatórios - se sim, não carregar cards
    const relatoriosSection = document.getElementById('relatorios-section');
    const adminPanel = document.getElementById('admin-panel');
    
    if (relatoriosSection && !relatoriosSection.classList.contains('hidden')) {
        debugLog('[DEBUG] carregarSolicitacoes: Na tela de relatórios - não carregando cards de solicitações');
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
    
    // Verificação mais robusta do usuário
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    if (!usuarioAdmin || !usuarioAdmin.uid || !usuarioAdmin.email) {
        console.warn('[AVISO] carregarSolicitacoes: Usuário admin não completamente carregado');
        
        // Se estamos na tela de login, não mostrar erro
        const authSection = document.getElementById('auth-section');
        if (!authSection || !authSection.classList.contains('hidden')) {
            debugLog('[DEBUG] carregarSolicitacoes: Ainda na tela de login, ignorando...');
            return;
        }
        
        debugLog('[DEBUG] Usuário ainda não carregado completamente');
        return;
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
        
        debugLog('[DEBUG] Carregando para usuário:', { 
            email: usuarioAdmin?.email,
            role: usuarioAdmin?.role, 
            isEquipe, 
            isSuperAdmin, 
            equipe: usuarioAdmin?.equipe 
        });
        
        // Timeout de segurança para a consulta do Firestore
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout ao carregar solicitações')), 10000);
        });
        
        const firestorePromise = window.db.collection('solicitacoes').get();
        
        // Buscar todas as solicitações com timeout
        const snapshot = await Promise.race([firestorePromise, timeoutPromise]);
        debugLog('[DEBUG] Snapshot recebido:', snapshot.size, 'documentos');
        
        if (snapshot.empty) {
            console.warn('[AVISO] Nenhuma solicitação encontrada');
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
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = { id: doc.id, ...data };
            
            // FILTRO RIGOROSO USANDO A FUNÇÃO DE PERMISSÕES
            if (!podeVerSolicitacaoJS(usuarioAdmin, data)) {
                // Pular esta solicitação se o usuário não tem permissão para vê-la
                console.log(`[DEBUG] Solicitação filtrada (sem permissão):`, item.titulo || item.tipo, 'equipe:', data.equipe);
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
        
        console.log(`[DEBUG] Total de solicitações processadas: ${totalDocs}`);
        console.log(`[DEBUG] Solicitações por equipe:`, Object.keys(equipes).map(e => `${e}: ${equipes[e].length}`));
        
        // RENDERIZAÇÃO BASEADA NO TIPO DE USUÁRIO
        if (isEquipe && usuarioAdmin.equipe) {
            // Usuário de equipe: mostrar APENAS sua equipe
            const equipeFiltrada = {};
            equipeFiltrada[usuarioAdmin.equipe] = equipes[usuarioAdmin.equipe] || [];
            
            console.log(`[DEBUG] Renderizando apenas equipe: ${usuarioAdmin.equipe} com ${equipeFiltrada[usuarioAdmin.equipe].length} solicitações`);
            renderizarCardsEquipe(equipeFiltrada);
            
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
            renderizarCardsEquipe(equipes);
            
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
        
        // Se não há dados, mostrar dados simulados para teste
        if (totalDocs === 0) {
            debugLog('[DEBUG] Nenhuma solicitação encontrada, criando dados de exemplo');
            criarDadosExemplo();
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
                    carregandoSolicitacoes = false; // Reset flag
                    await carregarSolicitacoes();
                } catch (retryError) {
                    console.error('[ERRO] Falha na segunda tentativa:', retryError);
                    showToast('Erro', 'Falha ao carregar dados. Recarregue a página (Ctrl+F5)', 'error');
                    // Carregar dados simulados como fallback
                    criarDadosExemplo();
                }
            }, 3000);
            
        } else if (error.code === 'unavailable' || error.message.includes('offline')) {
            showToast('Aviso', 'Modo offline - Carregando dados locais', 'warning');
            carregarDadosOffline();
        } else if (error.code === 'permission-denied') {
            showToast('Erro', 'Acesso negado. Verifique suas permissões', 'error');
        } else {
            showToast('Erro', 'Não foi possível carregar as solicitações', 'error');
            // Carregar dados simulados como fallback
            criarDadosExemplo();
        }
    } finally {
        carregandoSolicitacoes = false;
        
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
        
        carregarSolicitacoesAgrupadas();
    }, delay);
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

function criarDadosExemplo() {
    debugLog('[DEBUG] Criando dados de exemplo para demonstração');
    
    const dadosExemplo = {
        manutencao: [
            { id: 'ex1', status: 'pendente', titulo: 'Reparo elétrico', quarto: '201A', dataCriacao: new Date().toISOString().slice(0,10), nome: 'João Silva' },
            { id: 'ex2', status: 'em-andamento', titulo: 'Manutenção AC', quarto: '205B', dataCriacao: new Date().toISOString().slice(0,10), nome: 'Maria Santos' }
        ],
        nutricao: [
            { id: 'ex3', status: 'pendente', titulo: 'Dieta sem glúten', quarto: '103C', dataCriacao: new Date().toISOString().slice(0,10), nome: 'Pedro Costa' }
        ],
        higienizacao: [
            { id: 'ex4', status: 'finalizada', titulo: 'Limpeza completa', quarto: '107A', dataCriacao: new Date().toISOString().slice(0,10), nome: 'Ana Paula' }
        ],
        hotelaria: [
            { id: 'ex5', status: 'pendente', titulo: 'Amenities extras', quarto: '210B', dataCriacao: new Date().toISOString().slice(0,10), nome: 'Carlos Lima' }
        ]
    };
    
    atualizarMetricasPainel(5, 3, 1, 5);
    renderizarCardsEquipe(dadosExemplo);
    
    showToast('Info', 'Dados de exemplo carregados para demonstração', 'success');
}

function atualizarMetricasPainel(total, pendentes, finalizadasHoje, quartosAtivos) {
    // Atualiza badge do menu para mostrar o papel do usuário
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

// Nova função para atualizar visibilidade dos botões
function atualizarVisibilidadeBotoes() {
    console.log('🔥🔥🔥 EXECUTANDO atualizarVisibilidadeBotoes - TESTE LIMPEZA 🔥🔥🔥');
    
    // PRIMEIRO: Limpar botões indesejados SEMPRE
    forceRemoveDebugButtons();
    
    if (reconfigurando) {
        debugLog('[DEBUG] atualizarVisibilidadeBotoes: já está reconfigurando, ignorando...');
        return;
    }
    
    reconfigurando = true;
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    const btnAcompanhantes = document.getElementById('acompanhantes-btn');
    const btnRelatorios = document.getElementById('relatorios-btn');
    const btnLimpeza = document.getElementById('limpeza-btn');
    const msgPermissao = document.getElementById('admin-permission-msg');
    const userRoleBadge = document.getElementById('user-role-badge');
    const panelTitle = document.getElementById('panel-title');
    
    debugLog('[DEBUG] Elementos encontrados:', {
        btnNovoUsuario: !!btnNovoUsuario,
        btnGerenciarUsuarios: !!btnGerenciarUsuarios,
        btnAcompanhantes: !!btnAcompanhantes,
        btnRelatorios: !!btnRelatorios,
        btnLimpeza: !!btnLimpeza
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
        if (isSuperAdmin) {
            userRoleBadge.textContent = 'Super Administrador';
            userRoleBadge.className = 'priority-badge priority-alta';
        } else if (isEquipe && usuarioAdmin.equipe) {
            const nomeEquipe = {
                'manutencao': 'Equipe Manutenção',
                'nutricao': 'Equipe Nutrição',
                'higienizacao': 'Equipe Higienização', 
                'hotelaria': 'Equipe Hotelaria'
            }[usuarioAdmin.equipe] || `Equipe ${usuarioAdmin.equipe}`;
            userRoleBadge.textContent = nomeEquipe;
            userRoleBadge.className = 'priority-badge priority-media';
        } else if (isAdmin) {
            userRoleBadge.textContent = 'Administrador';
            userRoleBadge.className = 'priority-badge priority-media';
        }
    }
    
    // Botão Criar Usuário - APENAS super_admin
    if (btnNovoUsuario) {
        if (isSuperAdmin) {
            btnNovoUsuario.classList.remove('btn-hide');
            btnNovoUsuario.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Criar Usuário exibido para super_admin');
        } else {
            btnNovoUsuario.classList.add('btn-hide');
            btnNovoUsuario.style.display = 'none';
            debugLog('[DEBUG] Botão Criar Usuário ocultado para usuário não super_admin');
        }
    }
    
    // Botão Gerenciar Usuários - super_admin e admin
    if (btnGerenciarUsuarios) {
        if (isSuperAdmin || isAdmin) {
            btnGerenciarUsuarios.classList.remove('btn-hide');
            btnGerenciarUsuarios.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Gerenciar Usuários exibido para', isSuperAdmin ? 'super_admin' : 'admin');
        } else {
            btnGerenciarUsuarios.classList.add('btn-hide');
            btnGerenciarUsuarios.style.display = 'none';
            debugLog('[DEBUG] Botão Gerenciar Usuários ocultado para usuário não admin');
        }
    }

    // Botão Acompanhantes - super_admin e admin
    if (btnAcompanhantes) {
        if (isSuperAdmin || isAdmin) {
            btnAcompanhantes.classList.remove('btn-hide');
            btnAcompanhantes.style.display = 'inline-flex';
            debugLog('[DEBUG] Botão Acompanhantes exibido para', isSuperAdmin ? 'super_admin' : 'admin');
        } else {
            btnAcompanhantes.classList.add('btn-hide');
            btnAcompanhantes.style.display = 'none';
            debugLog('[DEBUG] Botão Acompanhantes ocultado para usuário não admin');
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
        } else if (!isSuperAdmin) {
            msgPermissao.textContent = 'Sem permissões administrativas';
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
        btnLimpeza: btnLimpeza ? !btnLimpeza.classList.contains('btn-hide') : 'não encontrado'
    });
    
    // Reset da flag de reconfiguração
    setTimeout(() => {
        reconfigurando = false;
    }, 50);
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

// Função de teste para os botões
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
                ativo: true
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

// 5. Função para mostrar todas as opções disponíveis
window.ajuda = function() {
    console.log(`
🆘 === FUNÇÕES DE AJUDA DISPONÍVEIS ===

PARA PROBLEMAS DE LOGIN:
• loginRapido() - Login rápido em modo desenvolvimento
• corrigirTudo() - Corrige todos os problemas de uma vez
• criarUsuarioTeste() - Cria usuário admin@teste.com / 123456

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
        carregarSolicitacoes();
        
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
        
        console.log('🔍 DASHBOARD MÉTRICAS:', {
            usuario: usuarioAdmin.nome,
            role: usuarioAdmin.role,
            equipe: equipeUsuario,
            mostrarTodas: isSuperAdmin || isAdmin
        });
        
        // Buscar solicitações finalizadas
        let query = window.db.collection('solicitacoes')
            .where('status', '==', 'finalizada')
            .limit(100);
        
        // Se não for super_admin ou admin, filtrar apenas pela equipe do usuário
        if (!isSuperAdmin && !isAdmin && equipeUsuario) {
            query = query.where('equipe', '==', equipeUsuario);
        }
        
        const snapshot = await query.get();
        
        // Filtrar por data no lado do cliente (últimos 30 dias)
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 30);
        
        const solicitacoesFiltradas = snapshot.docs
            .map(doc => ({id: doc.id, ...doc.data()}))
            .filter(sol => {
                if (sol.criadoEm && sol.criadoEm.toDate) {
                    return sol.criadoEm.toDate() >= dataLimite;
                }
                return false;
            });
        
        // Calcular métricas
        const metricas = calcularMetricasGerais(solicitacoesFiltradas);
        
        // Criar modal de dashboard
        let modal = document.getElementById('dashboard-metricas');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'dashboard-metricas';
            modal.className = 'modal';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000;';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = gerarHTMLDashboard(metricas, { 
            isSuperAdmin: isSuperAdmin || isAdmin, 
            equipeUsuario: equipeUsuario,
            nomeUsuario: usuarioAdmin.nome || 'Usuário'
        });
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showToast('Erro', 'Não foi possível carregar o dashboard de métricas', 'error');
    }
}

function fecharDashboardMetricas() {
    const modal = document.getElementById('dashboard-metricas');
    if (modal) {
        modal.style.display = 'none';
    }
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
        badge.textContent = 'Admin Desenvolvimento';
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

function renderizarCardsEquipe(equipes) {
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
            <div class="team-content" id="content-${equipe}">
                ${solicitacoes.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-${icones[equipe]}"></i>
                        <p>Nenhuma solicitação de ${equipesNomes[equipe].toLowerCase()}</p>
                    </div>
                ` : `
                    ${solicitacoesOrdenadas.map((solicitacao, index) => `
                        <div class="solicitacao-card" 
                             data-solicitacao='${JSON.stringify(solicitacao).replace(/'/g, '&apos;')}' 
                             data-equipe="${equipe}" 
                             data-index="${index}" 
                             data-status="${solicitacao.status || 'pendente'}"
                             onclick="abrirSolicitacaoModal(${JSON.stringify(solicitacao).replace(/'/g, '&apos;')})">
                            
                            <div class="card-header">
                                <div class="card-order-info">
                                    <span class="card-order">#${index + 1}</span>
                                    <span class="card-status status-${solicitacao.status || 'pendente'}">
                                        ${solicitacao.status || 'pendente'}
                                    </span>
                                </div>
                                <div class="card-actions">
                                    <button class="action-btn view" title="Ver detalhes">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="card-title">
                                ${solicitacao.titulo || solicitacao.tipo || solicitacao.descricao || solicitacao.nome || 'Solicitação sem título'}
                            </div>
                            
                            <div class="card-details">
                                ${solicitacao.quarto ? `
                                    <div class="card-detail">
                                        <i class="fas fa-bed"></i>
                                        <span>Quarto ${solicitacao.quarto}</span>
                                    </div>
                                ` : ''}
                                
                                ${solicitacao.nome ? `
                                    <div class="card-detail">
                                        <i class="fas fa-user"></i>
                                        <span>${solicitacao.nome}</span>
                                    </div>
                                ` : ''}
                                
                                ${solicitacao.descricao && solicitacao.descricao !== solicitacao.titulo ? `
                                    <div class="card-detail">
                                        <i class="fas fa-comment"></i>
                                        <span>${solicitacao.descricao.length > 60 ? 
                                            solicitacao.descricao.substring(0, 60) + '...' : 
                                            solicitacao.descricao}</span>
                                    </div>
                                ` : ''}
                                
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
                                    ${obterPrioridade(solicitacao) === 'alta' ? '🔴' : 
                                      obterPrioridade(solicitacao) === 'media' ? '🟡' : 
                                      obterPrioridade(solicitacao) === 'normal' ? '🟢' : '⚪'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                `}
            </div>
        `;
        
        gridContainer.appendChild(panel);
    });
    
    // Adicionar eventos aos cards após renderização
    adicionarEventosSolicitacoes();
    
    console.log(`[DEBUG] Cards renderizados para ${equipesParaMostrar.length} equipe(s)`);
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

    // Buscar nome do acompanhante baseado no usuarioId
    buscarNomeAcompanhante(solicitacao).then(nomeAcompanhante => {
        preencherDetalhesModal(solicitacao, nomeAcompanhante);
    });

    // Mostrar modal imediatamente
    modal.classList.remove('hidden');
}

// Função para buscar nome do acompanhante
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
function preencherDetalhesModal(solicitacao, nomeAcompanhante) {
    const detalhesEl = document.getElementById('modal-detalhes');
    const acoesEl = document.getElementById('modal-acoes');
    
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
                <div style="font-size: 18px; font-weight: 600; color: #374151;">${solicitacao.titulo || solicitacao.tipo || solicitacao.descricao || 'Solicitação'}</div>
            </div>
            <div><strong>ID:</strong> ${solicitacao.id || 'N/A'}</div>
            <div><strong>Equipe:</strong> ${solicitacao.equipe || 'N/A'}</div>
            <div><strong>Descrição:</strong> ${solicitacao.descricao || 'N/A'}</div>
            <div><strong>Quarto:</strong> ${solicitacao.quarto || 'N/A'}</div>
            <div><strong>Solicitante:</strong> ${solicitacao.usuarioNome || solicitacao.nome || 'N/A'}</div>
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
    
    // Verificar permissões (apenas super_admin)
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem ver relatórios de satisfação.', 'error');
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
            avaliacoes.push({ id: doc.id, ...doc.data() });
        });
        
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
                        Dashboard de Satisfação
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
                            ${avaliacoes.slice(0, 20).map(avaliacao => `
                                <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${getCorAvaliacao(avaliacao.avaliacao)};">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                        <div>
                                            <div style="font-weight: bold; color: #374151;">
                                                ${getEstrelasVisuais(avaliacao.avaliacao)} 
                                                <span style="color: #6b7280;">(${avaliacao.avaliacao}/5)</span>
                                            </div>
                                            <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">
                                                Equipe: ${avaliacao.equipaAvaliada} | Quarto: ${avaliacao.quarto || 'N/A'}
                                            </div>
                                        </div>
                                        <div style="text-align: right; color: #6b7280; font-size: 12px;">
                                            ${formatarDataHora(avaliacao.dataAvaliacao)}
                                        </div>
                                    </div>
                                    ${avaliacao.comentario ? `
                                        <div style="background: #f3f4f6; padding: 8px 12px; border-radius: 6px; color: #374151; font-style: italic; font-size: 14px;">
                                            "${avaliacao.comentario}"
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
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

function calcularMetricasSatisfacao(avaliacoes) {
    if (avaliacoes.length === 0) {
        return {
            mediaGeral: 0,
            percentualPositivo: 0,
            melhorEquipe: 'N/A',
            porEquipe: {}
        };
    }
    
    // Calcular média geral
    const somaTotal = avaliacoes.reduce((soma, avaliacao) => soma + avaliacao.avaliacao, 0);
    const mediaGeral = somaTotal / avaliacoes.length;
    
    // Calcular percentual positivo (4 e 5 estrelas)
    const avaliacoesPositivas = avaliacoes.filter(a => a.avaliacao >= 4).length;
    const percentualPositivo = Math.round((avaliacoesPositivas / avaliacoes.length) * 100);
    
    // Calcular métricas por equipe
    const porEquipe = {};
    avaliacoes.forEach(avaliacao => {
        const equipe = avaliacao.equipaAvaliada;
        if (!porEquipe[equipe]) {
            porEquipe[equipe] = { total: 0, soma: 0, media: 0 };
        }
        porEquipe[equipe].total++;
        porEquipe[equipe].soma += avaliacao.avaliacao;
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
    return '⭐'.repeat(nota) + '☆'.repeat(5 - nota);
}

function formatarDataHora(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function fecharDashboardSatisfacao() {
    const modal = document.getElementById('modal-dashboard-satisfacao');
    if (modal) {
        modal.remove();
    }
}

// Expor função globalmente
window.abrirDashboardSatisfacao = abrirDashboardSatisfacao;
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
                <button onclick="document.getElementById('modal-relatorio').remove()" 
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

        // Preparar dados para Excel
        const dadosExcel = solicitacoes.map(sol => ({
            'ID': sol.id,
            'Data/Hora': sol.criadoEm ? new Date(sol.criadoEm).toLocaleString('pt-BR') : '--',
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
        }));

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
        if (!userData || (userData.role !== 'super_admin' && userData.role !== 'admin')) {
            debugLog('[DEBUG] configurarListenerAcompanhantes: usuário sem permissão para acompanhantes');
            return;
        }
    } catch (error) {
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
📊 ESTATÍSTICAS DO SISTEMA YUNA
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
