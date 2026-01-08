/**
 * Firestore Query Helper - Sistema YUNA
 * Helpers para queries otimizadas com paginação
 * 
 * Objetivo: Reduzir reads do Firestore e melhorar performance
 */

class FirestoreQueryHelper {
    constructor() {
        this.paginationState = {
            solicitacoes: {
                lastDoc: null,
                hasMore: true,
                currentPage: 0,
                itemsPerPage: 50
            },
            usuarios: {
                lastDoc: null,
                hasMore: true,
                currentPage: 0,
                itemsPerPage: 50
            }
        };
        
        console.log('[QUERY] 🔍 Firestore Query Helper iniciado');
    }

    /**
     * Buscar solicitações com paginação
     * @param {Object} options - Opções de busca
     * @param {string} options.status - Status para filtrar (opcional)
     * @param {string} options.equipe - Equipe para filtrar (opcional)
     * @param {string} options.usuarioId - ID do usuário (opcional)
     * @param {number} options.limit - Limite de itens (padrão: 50)
     * @param {boolean} options.nextPage - Se deve carregar próxima página
     */
    async buscarSolicitacoes(options = {}) {
        const timer = window.perfMonitor?.startTimer('buscarSolicitacoes');
        
        try {
            const {
                status = null,
                equipe = null,
                usuarioId = null,
                limit = 50,
                nextPage = false
            } = options;

            console.log('[QUERY] 📄 Buscando solicitações:', { status, equipe, usuarioId, limit, nextPage });

            let query = window.db.collection('solicitacoes');

            // Aplicar filtros
            if (status) {
                query = query.where('status', '==', status);
            }
            if (equipe) {
                query = query.where('equipe', '==', equipe);
            }
            if (usuarioId) {
                query = query.where('usuarioId', '==', usuarioId);
            }

            // Ordenação (sempre por timestamp decrescente)
            query = query.orderBy('criadoEm', 'desc');

            // Paginação
            if (nextPage && this.paginationState.solicitacoes.lastDoc) {
                query = query.startAfter(this.paginationState.solicitacoes.lastDoc);
            }

            query = query.limit(limit);

            // Executar query
            const snapshot = await query.get();

            console.log(`[QUERY] ✅ Obtidos ${snapshot.size} documentos (reads: ${snapshot.size})`);

            // Atualizar estado de paginação
            if (snapshot.docs.length > 0) {
                this.paginationState.solicitacoes.lastDoc = snapshot.docs[snapshot.docs.length - 1];
                this.paginationState.solicitacoes.hasMore = snapshot.docs.length === limit;
                this.paginationState.solicitacoes.currentPage++;
            } else {
                this.paginationState.solicitacoes.hasMore = false;
            }

            // Processar documentos
            const solicitacoes = [];
            snapshot.forEach(doc => {
                solicitacoes.push({
                    id: doc.id,
                    ...doc.data()
                });

                // Adicionar ao cache
                if (window.cacheManager) {
                    window.cacheManager.setSolicitacao(doc.id, { id: doc.id, ...doc.data() });
                }
            });

            return {
                data: solicitacoes,
                hasMore: this.paginationState.solicitacoes.hasMore,
                currentPage: this.paginationState.solicitacoes.currentPage,
                count: solicitacoes.length
            };

        } catch (error) {
            console.error('[QUERY] 🔴 Erro ao buscar solicitações:', error);
            window.perfMonitor?.logError(error, 'buscarSolicitacoes');
            throw error;
        } finally {
            timer?.end();
        }
    }

    /**
     * Buscar usuários com paginação
     * @param {Object} options - Opções de busca
     * @param {string} options.tipo - Tipo de usuário ('admin', 'equipe', 'acompanhante')
     * @param {boolean} options.apenasAtivos - Filtrar apenas ativos (padrão: true)
     * @param {number} options.limit - Limite de itens (padrão: 50)
     * @param {boolean} options.nextPage - Se deve carregar próxima página
     */
    async buscarUsuarios(options = {}) {
        const timer = window.perfMonitor?.startTimer('buscarUsuarios');
        
        try {
            const {
                tipo = 'acompanhante',
                apenasAtivos = true,
                limit = 50,
                nextPage = false
            } = options;

            console.log('[QUERY] 👥 Buscando usuários:', { tipo, apenasAtivos, limit, nextPage });

            const collectionMap = {
                'admin': 'usuarios_admin',
                'equipe': 'usuarios_equipe',
                'acompanhante': 'usuarios_acompanhantes'
            };

            let query = window.db.collection(collectionMap[tipo] || 'usuarios_acompanhantes');

            // Filtrar apenas ativos
            if (apenasAtivos) {
                query = query.where('ativo', '==', true);
            }

            // Ordenação por email
            query = query.orderBy('email', 'asc');

            // Paginação
            if (nextPage && this.paginationState.usuarios.lastDoc) {
                query = query.startAfter(this.paginationState.usuarios.lastDoc);
            }

            query = query.limit(limit);

            // Executar query
            const snapshot = await query.get();

            console.log(`[QUERY] ✅ Obtidos ${snapshot.size} usuários (reads: ${snapshot.size})`);

            // Atualizar estado de paginação
            if (snapshot.docs.length > 0) {
                this.paginationState.usuarios.lastDoc = snapshot.docs[snapshot.docs.length - 1];
                this.paginationState.usuarios.hasMore = snapshot.docs.length === limit;
                this.paginationState.usuarios.currentPage++;
            } else {
                this.paginationState.usuarios.hasMore = false;
            }

            // Processar documentos
            const usuarios = [];
            snapshot.forEach(doc => {
                usuarios.push({
                    id: doc.id,
                    ...doc.data()
                });

                // Adicionar ao cache
                if (window.cacheManager) {
                    window.cacheManager.setUsuario(doc.id, { id: doc.id, ...doc.data() });
                }
            });

            return {
                data: usuarios,
                hasMore: this.paginationState.usuarios.hasMore,
                currentPage: this.paginationState.usuarios.currentPage,
                count: usuarios.length
            };

        } catch (error) {
            console.error('[QUERY] 🔴 Erro ao buscar usuários:', error);
            window.perfMonitor?.logError(error, 'buscarUsuarios');
            throw error;
        } finally {
            timer?.end();
        }
    }

    /**
     * Buscar solicitação específica (com cache)
     * @param {string} id - ID da solicitação
     * @param {boolean} forceRefresh - Forçar busca no Firestore
     */
    async buscarSolicitacao(id, forceRefresh = false) {
        const timer = window.perfMonitor?.startTimer('buscarSolicitacao');
        
        try {
            // Tentar buscar do cache primeiro
            if (!forceRefresh && window.cacheManager) {
                const cached = window.cacheManager.getSolicitacao(id);
                if (cached) {
                    console.log(`[QUERY] 💾 Solicitação ${id} obtida do cache`);
                    timer?.end();
                    return cached;
                }
            }

            // Buscar do Firestore
            console.log(`[QUERY] 🔍 Buscando solicitação ${id} do Firestore`);
            const doc = await window.db.collection('solicitacoes').doc(id).get();

            if (!doc.exists) {
                console.warn(`[QUERY] ⚠️ Solicitação ${id} não encontrada`);
                return null;
            }

            const data = { id: doc.id, ...doc.data() };

            // Adicionar ao cache
            if (window.cacheManager) {
                window.cacheManager.setSolicitacao(id, data);
            }

            return data;

        } catch (error) {
            console.error(`[QUERY] 🔴 Erro ao buscar solicitação ${id}:`, error);
            window.perfMonitor?.logError(error, 'buscarSolicitacao');
            throw error;
        } finally {
            timer?.end();
        }
    }

    /**
     * Buscar usuário específico (com cache)
     * @param {string} id - ID do usuário
     * @param {string} tipo - Tipo de usuário
     * @param {boolean} forceRefresh - Forçar busca no Firestore
     */
    async buscarUsuario(id, tipo = 'acompanhante', forceRefresh = false) {
        const timer = window.perfMonitor?.startTimer('buscarUsuario');
        
        try {
            // Tentar buscar do cache primeiro
            if (!forceRefresh && window.cacheManager) {
                const cached = window.cacheManager.getUsuario(id);
                if (cached) {
                    console.log(`[QUERY] 💾 Usuário ${id} obtido do cache`);
                    timer?.end();
                    return cached;
                }
            }

            const collectionMap = {
                'admin': 'usuarios_admin',
                'equipe': 'usuarios_equipe',
                'acompanhante': 'usuarios_acompanhantes'
            };

            // Buscar do Firestore
            console.log(`[QUERY] 🔍 Buscando usuário ${id} do Firestore`);
            const doc = await window.db.collection(collectionMap[tipo]).doc(id).get();

            if (!doc.exists) {
                console.warn(`[QUERY] ⚠️ Usuário ${id} não encontrado`);
                return null;
            }

            const data = { id: doc.id, ...doc.data() };

            // Adicionar ao cache
            if (window.cacheManager) {
                window.cacheManager.setUsuario(id, data);
            }

            return data;

        } catch (error) {
            console.error(`[QUERY] 🔴 Erro ao buscar usuário ${id}:`, error);
            window.perfMonitor?.logError(error, 'buscarUsuario');
            throw error;
        } finally {
            timer?.end();
        }
    }

    /**
     * Resetar estado de paginação
     * @param {string} type - Tipo a resetar ('solicitacoes', 'usuarios', ou 'all')
     */
    resetPagination(type = 'all') {
        if (type === 'all' || type === 'solicitacoes') {
            this.paginationState.solicitacoes = {
                lastDoc: null,
                hasMore: true,
                currentPage: 0,
                itemsPerPage: 50
            };
            console.log('[QUERY] 🔄 Paginação de solicitações resetada');
        }

        if (type === 'all' || type === 'usuarios') {
            this.paginationState.usuarios = {
                lastDoc: null,
                hasMore: true,
                currentPage: 0,
                itemsPerPage: 50
            };
            console.log('[QUERY] 🔄 Paginação de usuários resetada');
        }
    }

    /**
     * Contar documentos (sem carregar dados)
     * ATENÇÃO: Usa getCountFromServer (Firebase SDK 9.0+)
     */
    async contarSolicitacoes(options = {}) {
        const timer = window.perfMonitor?.startTimer('contarSolicitacoes');
        
        try {
            const { status = null, equipe = null } = options;

            let query = window.db.collection('solicitacoes');

            if (status) query = query.where('status', '==', status);
            if (equipe) query = query.where('equipe', '==', equipe);

            // Usar count() se disponível (requer índice), senão get()
            let count;
            if (typeof query.count === 'function') {
                const snapshot = await query.count().get();
                count = snapshot.data().count;
            } else {
                // Fallback: buscar documentos (mais caro)
                const snapshot = await query.get();
                count = snapshot.size;
            }

            console.log(`[QUERY] 📊 Contagem: ${count} solicitações`);
            return count;

        } catch (error) {
            console.error('[QUERY] 🔴 Erro ao contar solicitações:', error);
            window.perfMonitor?.logError(error, 'contarSolicitacoes');
            throw error;
        } finally {
            timer?.end();
        }
    }

    /**
     * Gerar relatório de uso de queries
     */
    getReport() {
        const report = {
            paginationState: this.paginationState,
            cacheStats: window.cacheManager ? window.cacheManager.getStats() : null,
            recommendations: []
        };

        // Análise e recomendações
        if (window.cacheManager) {
            const stats = window.cacheManager.getStats();
            
            if (stats.solicitacoes.utilizacao > 90) {
                report.recommendations.push('⚠️ Cache de solicitações quase cheio. Considere aumentar limite ou limpar itens antigos.');
            }
            
            if (stats.usuarios.utilizacao > 90) {
                report.recommendations.push('⚠️ Cache de usuários quase cheio. Considere aumentar limite ou limpar itens antigos.');
            }
        }

        if (!this.paginationState.solicitacoes.hasMore) {
            report.recommendations.push('ℹ️ Todas as solicitações foram carregadas. Considere adicionar filtros.');
        }

        console.group('[QUERY] 📊 Relatório de Queries');
        console.log('Paginação:', report.paginationState);
        console.log('Cache:', report.cacheStats);
        if (report.recommendations.length > 0) {
            console.log('Recomendações:', report.recommendations);
        }
        console.groupEnd();

        return report;
    }
}

// Criar instância global
window.queryHelper = new FirestoreQueryHelper();

// Expor funções úteis no console
window.showQueryReport = () => window.queryHelper.getReport();
window.resetQueryPagination = (type) => window.queryHelper.resetPagination(type);

console.log('[QUERY] ✅ Firestore Query Helper ativo. Use showQueryReport() para ver estatísticas.');
