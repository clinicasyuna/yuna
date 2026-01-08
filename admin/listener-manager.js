/**
 * Listener Manager - Sistema YUNA
 * Gerenciamento centralizado de listeners Firestore
 * 
 * Objetivo: Prevenir memory leaks e gerenciar listeners de forma eficiente
 */

class ListenerManager {
    constructor() {
        this.listeners = new Map();
        this.listenerCount = 0;
        
        console.log('[LISTENER] 🎧 Listener Manager iniciado');
    }

    /**
     * Registrar um novo listener
     * @param {string} key - Identificador único do listener
     * @param {function} unsubscribe - Função de unsubscribe do Firestore
     * @param {string} description - Descrição do listener para debug
     */
    register(key, unsubscribe, description = '') {
        // Se já existe listener com essa key, remover o antigo
        if (this.listeners.has(key)) {
            console.warn(`[LISTENER] ⚠️ Substituindo listener existente: ${key}`);
            this.unregister(key);
        }

        this.listeners.set(key, {
            unsubscribe,
            description,
            registeredAt: new Date().toISOString(),
            id: ++this.listenerCount
        });

        console.log(`[LISTENER] ➕ Registrado #${this.listenerCount}: ${key} (${description})`);
        console.log(`[LISTENER] 📊 Total de listeners ativos: ${this.listeners.size}`);

        // Alertar se muitos listeners
        if (this.listeners.size > 20) {
            console.warn(`[LISTENER] ⚠️ ATENÇÃO: ${this.listeners.size} listeners ativos! Considere otimizar.`);
        }

        return key;
    }

    /**
     * Remover um listener específico
     * @param {string} key - Identificador do listener
     */
    unregister(key) {
        const listener = this.listeners.get(key);
        
        if (listener) {
            try {
                listener.unsubscribe();
                this.listeners.delete(key);
                console.log(`[LISTENER] ➖ Removido: ${key} (${listener.description})`);
                console.log(`[LISTENER] 📊 Total de listeners ativos: ${this.listeners.size}`);
            } catch (error) {
                console.error(`[LISTENER] 🔴 Erro ao remover listener ${key}:`, error);
            }
        } else {
            console.warn(`[LISTENER] ⚠️ Tentativa de remover listener inexistente: ${key}`);
        }
    }

    /**
     * Remover todos os listeners
     */
    unregisterAll() {
        console.log(`[LISTENER] 🧹 Removendo todos os ${this.listeners.size} listeners...`);
        
        const keys = Array.from(this.listeners.keys());
        let removed = 0;
        let errors = 0;

        keys.forEach(key => {
            try {
                const listener = this.listeners.get(key);
                if (listener && listener.unsubscribe) {
                    listener.unsubscribe();
                    removed++;
                }
            } catch (error) {
                console.error(`[LISTENER] 🔴 Erro ao remover listener ${key}:`, error);
                errors++;
            }
        });

        this.listeners.clear();
        
        console.log(`[LISTENER] ✅ Limpeza concluída: ${removed} removidos, ${errors} erros`);
    }

    /**
     * Remover listeners por padrão de key
     * @param {RegExp|string} pattern - Padrão para buscar keys
     */
    unregisterByPattern(pattern) {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        const keys = Array.from(this.listeners.keys()).filter(key => regex.test(key));
        
        console.log(`[LISTENER] 🔍 Removendo ${keys.length} listeners que correspondem ao padrão: ${pattern}`);
        
        keys.forEach(key => this.unregister(key));
    }

    /**
     * Listar todos os listeners ativos
     */
    list() {
        console.group(`[LISTENER] 📋 Listeners Ativos (${this.listeners.size})`);
        
        this.listeners.forEach((listener, key) => {
            const age = Math.round((Date.now() - new Date(listener.registeredAt).getTime()) / 1000);
            console.log(`  #${listener.id} ${key}`);
            console.log(`    ↳ ${listener.description}`);
            console.log(`    ↳ Ativo há ${age}s`);
        });
        
        console.groupEnd();
        
        return Array.from(this.listeners.keys());
    }

    /**
     * Verificar se um listener existe
     * @param {string} key - Identificador do listener
     */
    has(key) {
        return this.listeners.has(key);
    }

    /**
     * Obter informações de um listener
     * @param {string} key - Identificador do listener
     */
    getInfo(key) {
        const listener = this.listeners.get(key);
        if (!listener) return null;

        return {
            key,
            id: listener.id,
            description: listener.description,
            registeredAt: listener.registeredAt,
            ageSeconds: Math.round((Date.now() - new Date(listener.registeredAt).getTime()) / 1000)
        };
    }

    /**
     * Gerar relatório de uso
     */
    getReport() {
        const now = Date.now();
        const listeners = Array.from(this.listeners.entries()).map(([key, listener]) => ({
            key,
            id: listener.id,
            description: listener.description,
            ageSeconds: Math.round((now - new Date(listener.registeredAt).getTime()) / 1000)
        }));

        // Ordenar por idade (mais antigos primeiro)
        listeners.sort((a, b) => b.ageSeconds - a.ageSeconds);

        return {
            totalListeners: this.listeners.size,
            totalRegistered: this.listenerCount,
            listeners,
            oldestListener: listeners[0] || null,
            newestListener: listeners[listeners.length - 1] || null
        };
    }
}

// Criar instância global
window.listenerManager = new ListenerManager();

// Cleanup automático ao fazer logout ou fechar página
window.addEventListener('beforeunload', () => {
    if (window.listenerManager) {
        console.log('[LISTENER] 🚪 Página sendo fechada, limpando listeners...');
        window.listenerManager.unregisterAll();
    }
});

// Expor funções úteis no console
window.showListeners = () => window.listenerManager.list();
window.cleanupListeners = () => window.listenerManager.unregisterAll();
window.listenerReport = () => console.table(window.listenerManager.getReport().listeners);

console.log('[LISTENER] ✅ Listener Manager ativo. Use showListeners() no console para listar.');
console.log('[LISTENER] 💡 Dica: Use cleanupListeners() para remover todos os listeners.');
