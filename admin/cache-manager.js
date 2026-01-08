/**
 * Cache Manager - Sistema YUNA
 * Sistema de cache inteligente com LRU (Least Recently Used)
 * 
 * Objetivo: Limitar uso de memória mantendo apenas dados mais relevantes
 */

class CacheManager {
    constructor(maxSize = 200) {
        this.maxSize = maxSize;
        this.solicitacoesCache = new Map();
        this.usuariosCache = new Map();
        this.accessOrder = {
            solicitacoes: [],
            usuarios: []
        };
        
        console.log(`[CACHE] 💾 Cache Manager iniciado (limite: ${maxSize} itens por tipo)`);
    }

    /**
     * Adicionar/atualizar solicitação no cache
     * @param {string} id - ID da solicitação
     * @param {object} data - Dados da solicitação
     */
    setSolicitacao(id, data) {
        // Atualizar ordem de acesso
        this._updateAccessOrder('solicitacoes', id);
        
        // Adicionar ao cache
        this.solicitacoesCache.set(id, {
            data,
            cachedAt: new Date().toISOString(),
            accessCount: (this.solicitacoesCache.get(id)?.accessCount || 0) + 1
        });

        // Limpar excesso se necessário
        this._evictIfNeeded('solicitacoes');
    }

    /**
     * Adicionar/atualizar usuário no cache
     * @param {string} id - ID do usuário
     * @param {object} data - Dados do usuário
     */
    setUsuario(id, data) {
        // Atualizar ordem de acesso
        this._updateAccessOrder('usuarios', id);
        
        // Adicionar ao cache
        this.usuariosCache.set(id, {
            data,
            cachedAt: new Date().toISOString(),
            accessCount: (this.usuariosCache.get(id)?.accessCount || 0) + 1
        });

        // Limpar excesso se necessário
        this._evictIfNeeded('usuarios');
    }

    /**
     * Obter solicitação do cache
     * @param {string} id - ID da solicitação
     */
    getSolicitacao(id) {
        const cached = this.solicitacoesCache.get(id);
        if (!cached) return null;

        // Atualizar ordem de acesso
        this._updateAccessOrder('solicitacoes', id);
        
        // Incrementar contador de acesso
        cached.accessCount++;
        cached.lastAccessAt = new Date().toISOString();

        return cached.data;
    }

    /**
     * Obter usuário do cache
     * @param {string} id - ID do usuário
     */
    getUsuario(id) {
        const cached = this.usuariosCache.get(id);
        if (!cached) return null;

        // Atualizar ordem de acesso
        this._updateAccessOrder('usuarios', id);
        
        // Incrementar contador de acesso
        cached.accessCount++;
        cached.lastAccessAt = new Date().toISOString();

        return cached.data;
    }

    /**
     * Obter todas as solicitações do cache como array
     */
    getAllSolicitacoes() {
        return Array.from(this.solicitacoesCache.entries()).map(([id, cached]) => ({
            id,
            ...cached.data
        }));
    }

    /**
     * Obter todos os usuários do cache como array
     */
    getAllUsuarios() {
        return Array.from(this.usuariosCache.entries()).map(([id, cached]) => ({
            id,
            ...cached.data
        }));
    }

    /**
     * Limpar solicitações do cache
     * @param {Array<string>} idsToKeep - IDs para manter (opcional)
     */
    clearSolicitacoes(idsToKeep = null) {
        if (idsToKeep) {
            const keepSet = new Set(idsToKeep);
            for (const id of this.solicitacoesCache.keys()) {
                if (!keepSet.has(id)) {
                    this.solicitacoesCache.delete(id);
                }
            }
            this.accessOrder.solicitacoes = this.accessOrder.solicitacoes.filter(id => keepSet.has(id));
            console.log(`[CACHE] 🧹 Solicitações limpas, mantidos ${idsToKeep.length} itens`);
        } else {
            this.solicitacoesCache.clear();
            this.accessOrder.solicitacoes = [];
            console.log('[CACHE] 🧹 Cache de solicitações completamente limpo');
        }
    }

    /**
     * Limpar usuários do cache
     * @param {Array<string>} idsToKeep - IDs para manter (opcional)
     */
    clearUsuarios(idsToKeep = null) {
        if (idsToKeep) {
            const keepSet = new Set(idsToKeep);
            for (const id of this.usuariosCache.keys()) {
                if (!keepSet.has(id)) {
                    this.usuariosCache.delete(id);
                }
            }
            this.accessOrder.usuarios = this.accessOrder.usuarios.filter(id => keepSet.has(id));
            console.log(`[CACHE] 🧹 Usuários limpos, mantidos ${idsToKeep.length} itens`);
        } else {
            this.usuariosCache.clear();
            this.accessOrder.usuarios = [];
            console.log('[CACHE] 🧹 Cache de usuários completamente limpo');
        }
    }

    /**
     * Atualizar ordem de acesso (LRU)
     * @private
     */
    _updateAccessOrder(type, id) {
        const order = this.accessOrder[type];
        const index = order.indexOf(id);
        
        // Remover da posição atual se existir
        if (index > -1) {
            order.splice(index, 1);
        }
        
        // Adicionar no final (mais recente)
        order.push(id);
    }

    /**
     * Remover itens antigos se exceder o limite (LRU eviction)
     * @private
     */
    _evictIfNeeded(type) {
        const cache = type === 'solicitacoes' ? this.solicitacoesCache : this.usuariosCache;
        const order = this.accessOrder[type];

        if (cache.size > this.maxSize) {
            const toRemove = cache.size - this.maxSize;
            console.log(`[CACHE] ⚠️ Limite excedido para ${type}, removendo ${toRemove} itens antigos`);

            // Remover os mais antigos (início do array)
            for (let i = 0; i < toRemove; i++) {
                const oldestId = order.shift();
                if (oldestId) {
                    cache.delete(oldestId);
                }
            }

            console.log(`[CACHE] ✅ Cache de ${type} reduzido para ${cache.size} itens`);
        }
    }

    /**
     * Obter estatísticas do cache
     */
    getStats() {
        const stats = {
            solicitacoes: {
                size: this.solicitacoesCache.size,
                maxSize: this.maxSize,
                utilizacao: Math.round((this.solicitacoesCache.size / this.maxSize) * 100),
                maisAcessados: this._getMostAccessed('solicitacoes', 5)
            },
            usuarios: {
                size: this.usuariosCache.size,
                maxSize: this.maxSize,
                utilizacao: Math.round((this.usuariosCache.size / this.maxSize) * 100),
                maisAcessados: this._getMostAccessed('usuarios', 5)
            }
        };

        return stats;
    }

    /**
     * Obter itens mais acessados
     * @private
     */
    _getMostAccessed(type, limit = 5) {
        const cache = type === 'solicitacoes' ? this.solicitacoesCache : this.usuariosCache;
        
        const items = Array.from(cache.entries())
            .map(([id, cached]) => ({
                id,
                accessCount: cached.accessCount,
                cachedAt: cached.cachedAt
            }))
            .sort((a, b) => b.accessCount - a.accessCount)
            .slice(0, limit);

        return items;
    }

    /**
     * Gerar relatório detalhado
     */
    generateReport() {
        const stats = this.getStats();
        
        console.group('[CACHE] 📊 Relatório de Cache');
        
        console.log('\n🔹 Solicitações:');
        console.log(`  Itens em cache: ${stats.solicitacoes.size}/${stats.solicitacoes.maxSize}`);
        console.log(`  Utilização: ${stats.solicitacoes.utilizacao}%`);
        if (stats.solicitacoes.maisAcessados.length > 0) {
            console.log('  Mais acessados:');
            stats.solicitacoes.maisAcessados.forEach(item => {
                console.log(`    - ${item.id.substring(0, 8)}... (${item.accessCount} acessos)`);
            });
        }

        console.log('\n🔹 Usuários:');
        console.log(`  Itens em cache: ${stats.usuarios.size}/${stats.usuarios.maxSize}`);
        console.log(`  Utilização: ${stats.usuarios.utilizacao}%`);
        if (stats.usuarios.maisAcessados.length > 0) {
            console.log('  Mais acessados:');
            stats.usuarios.maisAcessados.forEach(item => {
                console.log(`    - ${item.id.substring(0, 8)}... (${item.accessCount} acessos)`);
            });
        }

        console.groupEnd();

        return stats;
    }

    /**
     * Integrar com cache global legado (window.cachedSolicitacoes/Usuarios)
     */
    syncWithLegacyCache() {
        console.log('[CACHE] 🔄 Sincronizando com cache legado...');

        // Migrar window.cachedSolicitacoes
        if (Array.isArray(window.cachedSolicitacoes)) {
            window.cachedSolicitacoes.forEach(sol => {
                if (sol.id) {
                    this.setSolicitacao(sol.id, sol);
                }
            });
            console.log(`[CACHE] ✅ Migrados ${window.cachedSolicitacoes.length} solicitações do cache legado`);
        }

        // Migrar window.cachedUsuarios
        if (Array.isArray(window.cachedUsuarios)) {
            window.cachedUsuarios.forEach(user => {
                if (user.id || user.uid) {
                    this.setUsuario(user.id || user.uid, user);
                }
            });
            console.log(`[CACHE] ✅ Migrados ${window.cachedUsuarios.length} usuários do cache legado`);
        }

        // Substituir cache legado por getters que usam o novo sistema
        Object.defineProperty(window, 'cachedSolicitacoes', {
            get: () => this.getAllSolicitacoes(),
            set: (value) => {
                console.warn('[CACHE] ⚠️ Uso de window.cachedSolicitacoes detectado. Use cacheManager.setSolicitacao()');
                if (Array.isArray(value)) {
                    this.clearSolicitacoes();
                    value.forEach(sol => {
                        if (sol.id) this.setSolicitacao(sol.id, sol);
                    });
                }
            }
        });

        Object.defineProperty(window, 'cachedUsuarios', {
            get: () => this.getAllUsuarios(),
            set: (value) => {
                console.warn('[CACHE] ⚠️ Uso de window.cachedUsuarios detectado. Use cacheManager.setUsuario()');
                if (Array.isArray(value)) {
                    this.clearUsuarios();
                    value.forEach(user => {
                        if (user.id || user.uid) this.setUsuario(user.id || user.uid, user);
                    });
                }
            }
        });

        console.log('[CACHE] ✅ Cache legado substituído por sistema inteligente');
    }
}

// Criar instância global
window.cacheManager = new CacheManager(200); // Limite de 200 itens por tipo

// Sincronizar com cache legado se existir
if (typeof window.cachedSolicitacoes !== 'undefined' || typeof window.cachedUsuarios !== 'undefined') {
    window.cacheManager.syncWithLegacyCache();
}

// Expor funções úteis no console
window.showCacheStats = () => window.cacheManager.generateReport();
window.clearAllCache = () => {
    window.cacheManager.clearSolicitacoes();
    window.cacheManager.clearUsuarios();
    console.log('[CACHE] ✅ Todo o cache foi limpo');
};

console.log('[CACHE] ✅ Cache Manager ativo. Use showCacheStats() no console para ver estatísticas.');
