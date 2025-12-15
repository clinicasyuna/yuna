/**
 * DEBUG CONFIGURATION
 * Centraliza controle de logs e modo debug
 */

class DebugConfig {
    constructor() {
        // Flag global: true em desenvolvimento, false em produção
        // Para controlar localmente, execute no console:
        // window.DEBUG_MODE = true; localStorage.setItem('DEBUG_MODE', 'true');
        this.DEBUG_MODE = localStorage.getItem('DEBUG_MODE') === 'true' || false;
        
        // Módulos com controle individual
        this.MODULES = {
            AUTH: this.DEBUG_MODE,
            DASHBOARD: this.DEBUG_MODE,
            USUARIOS: this.DEBUG_MODE,
            SOLICITACOES: this.DEBUG_MODE,
            FIRESTORE: this.DEBUG_MODE,
            PERMISSIONS: this.DEBUG_MODE,
            SESSION: this.DEBUG_MODE,
            RATE_LIMIT: this.DEBUG_MODE
        };
    }

    /**
     * Log centralizado
     * @param {string} module - Nome do módulo (ex: 'AUTH')
     * @param {string} message - Mensagem de log
     * @param {any} data - Dados opcionais para debug
     * @param {string} level - 'log', 'warn', 'error', 'info'
     */
    log(module, message, data = null, level = 'log') {
        if (!this.MODULES[module]) return;

        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${module}]`;
        const formatted = `${prefix} ${message}`;

        switch (level) {
            case 'warn':
                console.warn(formatted, data || '');
                break;
            case 'error':
                console.error(formatted, data || '');
                break;
            case 'info':
                console.info(formatted, data || '');
                break;
            default:
                console.log(formatted, data || '');
        }
    }

    /**
     * Log de erro
     */
    error(module, message, error = null) {
        this.log(module, `❌ ${message}`, error, 'error');
    }

    /**
     * Log de sucesso
     */
    success(module, message, data = null) {
        this.log(module, `✅ ${message}`, data, 'log');
    }

    /**
     * Log de aviso
     */
    warn(module, message, data = null) {
        this.log(module, `⚠️ ${message}`, data, 'warn');
    }

    /**
     * Log de informação
     */
    info(module, message, data = null) {
        this.log(module, `ℹ️ ${message}`, data, 'info');
    }

    /**
     * Ativa/Desativa debug modo
     */
    setDebugMode(enabled) {
        this.DEBUG_MODE = enabled;
        Object.keys(this.MODULES).forEach(key => {
            this.MODULES[key] = enabled;
        });
        localStorage.setItem('DEBUG_MODE', enabled.toString());
        console.log(`🔧 Debug mode: ${enabled ? 'ATIVADO' : 'DESATIVADO'}`);
    }

    /**
     * Ativa/Desativa módulo específico
     */
    setModuleDebug(module, enabled) {
        if (this.MODULES.hasOwnProperty(module)) {
            this.MODULES[module] = enabled;
            console.log(`🔧 Debug ${module}: ${enabled ? 'ATIVADO' : 'DESATIVADO'}`);
        }
    }

    /**
     * Mostra estado atual
     */
    status() {
        console.log('=== DEBUG STATUS ===');
        console.log('Modo Global:', this.DEBUG_MODE ? '✅ ON' : '❌ OFF');
        console.log('Módulos:');
        Object.entries(this.MODULES).forEach(([key, value]) => {
            console.log(`  ${key}: ${value ? '✅' : '❌'}`);
        });
        console.log('Comandos úteis:');
        console.log('  window.debugConfig.setDebugMode(true)  - Ativa tudo');
        console.log('  window.debugConfig.setModuleDebug("AUTH", true)  - Ativa AUTH');
    }
}

// Instância global
window.debugConfig = new DebugConfig();

// Função auxiliar para manter compatibilidade com código antigo
// Se o código antigo usa debugLog(), converter para novo sistema
window.debugLog = function(message, data = null) {
    if (window.debugConfig.DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`, data || '');
    }
};

/**
 * MIGRAÇÃO DO CÓDIGO EXISTENTE
 * 
 * ANTES (remover):
 * console.log('[USUARIOS] Carregando usuários...');
 * debugLog('Carregando usuários', usuarios);
 * 
 * DEPOIS (novo):
 * window.debugConfig.log('USUARIOS', 'Carregando usuários...');
 * window.debugConfig.log('USUARIOS', 'Usuários carregados', usuarios);
 * 
 * ou com nível:
 * window.debugConfig.success('USUARIOS', 'Usuários carregados', usuarios);
 * window.debugConfig.error('USUARIOS', 'Erro ao carregar', error);
 */
