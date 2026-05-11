/**
 * YUNA PWA - IndexedDB Persistence Layer
 * Armazena dados localmente para funcionamento offline
 * 
 * Estrutura:
 * - solicitacoes: Todas as solicitações do usuário
 * - usuario: Perfil do usuário logado
 * - pendingActions: Ações para sincronizar quando online
 * - syncStatus: Último sync timestamp
 */

class YunaPersistence {
  constructor() {
    this.dbName = 'yuna-acompanhantes-db';
    this.version = 2;
    this.db = null;
    this.isOnline = navigator.onLine;
    
    // Listen para mudanças de conexão
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[Persistence] Online - iniciando sync');
      this.syncPendingActions();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[Persistence] Offline - utilizando cache local');
    });
  }

  /**
   * Inicializar banco de dados
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('[Persistence] Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[Persistence] IndexedDB inicializado');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Solicitações do usuário
        if (!db.objectStoreNames.contains('solicitacoes')) {
          const solicitacoesStore = db.createObjectStore('solicitacoes', { keyPath: 'id' });
          solicitacoesStore.createIndex('status', 'status', { unique: false });
          solicitacoesStore.createIndex('criadoEm', 'criadoEm', { unique: false });
          solicitacoesStore.createIndex('synced', 'synced', { unique: false });
        }

        // Perfil do usuário
        if (!db.objectStoreNames.contains('usuario')) {
          db.createObjectStore('usuario', { keyPath: 'uid' });
        }

        // Ações pendentes para sincronizar
        if (!db.objectStoreNames.contains('pendingActions')) {
          const actionsStore = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
          actionsStore.createIndex('type', 'type', { unique: false });
          actionsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Status de sincronização
        if (!db.objectStoreNames.contains('syncStatus')) {
          db.createObjectStore('syncStatus', { keyPath: 'key' });
        }

        console.log('[Persistence] Bancos criados/atualizados');
      };
    });
  }

  /**
   * Salvar solicitação localmente
   */
  async saveSolicitacao(solicitacao) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['solicitacoes'], 'readwrite');
      const store = transaction.objectStore('solicitacoes');
      
      const data = {
        ...solicitacao,
        synced: true,
        localSyncAt: new Date().toISOString()
      };
      
      const request = store.put(data);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[Persistence] Solicitação salva:', solicitacao.id);
        resolve(request.result);
      };
    });
  }

  /**
   * Obter todas as solicitações locais
   */
  async getSolicitacoes() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['solicitacoes'], 'readonly');
      const store = transaction.objectStore('solicitacoes');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const solicitacoes = request.result.sort((a, b) => 
          new Date(b.criadoEm) - new Date(a.criadoEm)
        );
        console.log('[Persistence] Carregadas', solicitacoes.length, 'solicitações');
        resolve(solicitacoes);
      };
    });
  }

  /**
   * Salvar perfil do usuário
   */
  async saveUsuario(usuario) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['usuario'], 'readwrite');
      const store = transaction.objectStore('usuario');
      
      const request = store.put({
        ...usuario,
        savedAt: new Date().toISOString()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[Persistence] Usuário salvo:', usuario.uid);
        resolve(request.result);
      };
    });
  }

  /**
   * Obter perfil do usuário
   */
  async getUsuario(uid) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['usuario'], 'readonly');
      const store = transaction.objectStore('usuario');
      const request = store.get(uid);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[Persistence] Usuário recuperado:', uid);
        resolve(request.result);
      };
    });
  }

  /**
   * Adicionar ação pendente (para sync offline)
   */
  async addPendingAction(action) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');

      const pendingAction = {
        ...action,
        createdAt: new Date().toISOString(),
        synced: false,
        attempts: 0
      };

      const request = store.add(pendingAction);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[Persistence] Ação pendente adicionada:', action.type);
        resolve(request.result);
      };
    });
  }

  /**
   * Obter ações pendentes
   */
  async getPendingActions() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[Persistence] Ações pendentes:', request.result.length);
        resolve(request.result);
      };
    });
  }

  /**
   * Marcar ação como sincronizada
   */
  async markActionSynced(actionId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.get(actionId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const action = request.result;
        if (action) {
          action.synced = true;
          action.syncedAt = new Date().toISOString();
          const updateRequest = store.put(action);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve(actionId);
        }
      };
    });
  }

  /**
   * Limpar ações sincronizadas antigas
   */
  async cleanupSyncedActions(daysOld = 7) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();

      const request = store.openCursor();
      let deleted = 0;

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const action = cursor.value;
          if (action.synced && action.syncedAt < cutoffDate) {
            cursor.delete();
            deleted++;
          }
          cursor.continue();
        } else {
          console.log('[Persistence] Limpas', deleted, 'ações antigas');
          resolve(deleted);
        }
      };
    });
  }

  /**
   * Atualizar último sync time
   */
  async updateLastSync() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncStatus'], 'readwrite');
      const store = transaction.objectStore('syncStatus');

      const request = store.put({
        key: 'lastSync',
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Obter último sync time
   */
  async getLastSync() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncStatus'], 'readonly');
      const store = transaction.objectStore('syncStatus');
      const request = store.get('lastSync');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result?.timestamp);
      };
    });
  }

  /**
   * Sincronizar ações pendentes com Firestore
   */
  async syncPendingActions() {
    if (!this.isOnline) {
      console.log('[Persistence] Offline - skip sync');
      return;
    }

    try {
      const pendingActions = await this.getPendingActions();
      console.log('[Persistence] Sincronizando', pendingActions.length, 'ações pendentes');

      for (const action of pendingActions) {
        try {
          await this.executePendingAction(action);
          await this.markActionSynced(action.id);
        } catch (error) {
          console.error('[Persistence] Erro ao sincronizar ação:', error);
          action.attempts = (action.attempts || 0) + 1;
          if (action.attempts < 3) {
            // Manter na fila para próxima tentativa
          }
        }
      }

      await this.updateLastSync();
      console.log('[Persistence] Sync completo');

      // Notificar UI
      window.dispatchEvent(new CustomEvent('yunaSyncComplete', { 
        detail: { actionsProcessed: pendingActions.length }
      }));

    } catch (error) {
      console.error('[Persistence] Erro no sync:', error);
    }
  }

  /**
   * Executar ação pendente
   */
  async executePendingAction(action) {
    // Será implementado na Fase 2 com integração Firestore
    console.log('[Persistence] Executando ação pendente:', action.type);
  }

  /**
   * Limpar todo o IndexedDB (para logout/reset)
   */
  async clear() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        ['solicitacoes', 'usuario', 'pendingActions', 'syncStatus'],
        'readwrite'
      );

      ['solicitacoes', 'usuario', 'pendingActions', 'syncStatus'].forEach(storeName => {
        transaction.objectStore(storeName).clear();
      });

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => {
        console.log('[Persistence] IndexedDB limpo');
        resolve();
      };
    });
  }
}

// Instância global
window.yunaPersistence = null;

/**
 * Inicializar persistence layer
 */
async function initYunaPersistence() {
  try {
    if (window.yunaPersistence) return window.yunaPersistence;
    
    window.yunaPersistence = new YunaPersistence();
    await window.yunaPersistence.init();
    
    console.log('[Persistence] ✅ PWA Persistence iniciado');
    return window.yunaPersistence;
  } catch (error) {
    console.error('[Persistence] ❌ Falha na inicialização:', error);
    // Continue sem IndexedDB
    return null;
  }
}

// Auto-iniciar se indexedDB disponível
if ('indexedDB' in window) {
  document.addEventListener('DOMContentLoaded', initYunaPersistence);
}
