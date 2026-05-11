/**
 * YUNA PWA - Push Token Management
 * Gerencia armazenamento e sincronização de tokens de push no Firestore
 * 
 * Funcionalidades:
 * - Armazenar token no Firestore após obter permissão
 * - Atualizar token quando Firebase gera novo
 * - Limpar token ao logout
 * - Sincronizar com Cloud Functions para notificações
 */

class YunaPushTokenManager {
  constructor(db, messaging) {
    this.db = db;
    this.messaging = messaging;
    this.currentToken = null;
    this.initialized = false;
  }

  /**
   * Inicializar gerenciador de tokens
   */
  async init() {
    try {
      console.log('[TokenMgr] Inicializando gerenciador de tokens de push');

      if (!this.messaging || !this.db) {
        console.warn('[TokenMgr] Firebase messaging ou Firestore não disponível');
        return false;
      }

      // Obter token atual
      try {
        const currentToken = await this.messaging.getToken({
          vapidKey: window.VAPID_KEY || 'BAK6oVCsJVqkLKEWbhV1LMQe5mKrT3B6kM0dJ9Z3qL3Pq4Q5W6X7Y8Z9A0B1C2D3E4F5G6'
        });

        if (currentToken) {
          console.log('[TokenMgr] Token obtido, armazenando no Firestore...');
          await this.storeToken(currentToken);
          this.currentToken = currentToken;
        }
      } catch (error) {
        if (error.code === 'messaging/unsupported-browser') {
          console.warn('[TokenMgr] Navegador não suporta push notifications');
        } else if (error.code === 'messaging/permission-default') {
          console.log('[TokenMgr] Permissão de notificação não foi concedida');
        } else {
          console.error('[TokenMgr] Erro ao obter token:', error);
        }
      }

      // Ouvir mudanças de token
      this.messaging.onTokenRefresh(async () => {
        console.log('[TokenMgr] Token renovado, atualizando no Firestore...');
        try {
          const newToken = await this.messaging.getToken({
            vapidKey: window.VAPID_KEY || 'BAK6oVCsJVqkLKEWbhV1LMQe5mKrT3B6kM0dJ9Z3qL3Pq4Q5W6X7Y8Z9A0B1C2D3E4F5G6'
          });

          if (newToken && newToken !== this.currentToken) {
            await this.storeToken(newToken);
            this.currentToken = newToken;
          }
        } catch (error) {
          console.error('[TokenMgr] Erro ao renovar token:', error);
        }
      });

      this.initialized = true;
      console.log('[TokenMgr] ✅ Inicializado');
      return true;

    } catch (error) {
      console.error('[TokenMgr] ❌ Erro na inicialização:', error);
      return false;
    }
  }

  /**
   * Armazenar token no Firestore
   */
  async storeToken(token) {
    try {
      const currentUser = window.currentUser;
      if (!currentUser) {
        console.warn('[TokenMgr] Usuário não autenticado');
        return;
      }

      const tokenDocId = `${currentUser.uid}_${this.getBrowserIdentifier()}`;

      await this.db.collection('acompanhantes_push_tokens').doc(tokenDocId).set(
        {
          uid: currentUser.uid,
          email: currentUser.email,
          token: token,
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          browser: this.getBrowserName(),
          deviceType: this.getDeviceType(),
          appVersion: window.APP_VERSION || '2.0'
        },
        { merge: true }
      );

      console.log('[TokenMgr] ✅ Token armazenado:', tokenDocId);

    } catch (error) {
      console.error('[TokenMgr] ❌ Erro ao armazenar token:', error);
    }
  }

  /**
   * Remover token ao logout
   */
  async removeToken() {
    try {
      const currentUser = window.currentUser;
      if (!currentUser) {
        return;
      }

      const tokenDocId = `${currentUser.uid}_${this.getBrowserIdentifier()}`;

      await this.db.collection('acompanhantes_push_tokens').doc(tokenDocId).update({
        enabled: false,
        deletedAt: new Date().toISOString()
      });

      console.log('[TokenMgr] ✅ Token removido');

    } catch (error) {
      console.error('[TokenMgr] Erro ao remover token:', error);
    }
  }

  /**
   * Desabilitar todas as notificações do usuário
   */
  async disableAllTokens() {
    try {
      const currentUser = window.currentUser;
      if (!currentUser) {
        return;
      }

      const query = await this.db
        .collection('acompanhantes_push_tokens')
        .where('uid', '==', currentUser.uid)
        .get();

      const batch = this.db.batch();
      query.forEach(doc => {
        batch.update(doc.ref, { enabled: false });
      });

      await batch.commit();
      console.log('[TokenMgr] ✅ Todos os tokens desabilitados');

    } catch (error) {
      console.error('[TokenMgr] Erro ao desabilitar tokens:', error);
    }
  }

  /**
   * Habilitar todas as notificações do usuário
   */
  async enableAllTokens() {
    try {
      const currentUser = window.currentUser;
      if (!currentUser) {
        return;
      }

      const query = await this.db
        .collection('acompanhantes_push_tokens')
        .where('uid', '==', currentUser.uid)
        .get();

      const batch = this.db.batch();
      query.forEach(doc => {
        batch.update(doc.ref, { enabled: true, enabledAt: new Date().toISOString() });
      });

      await batch.commit();
      console.log('[TokenMgr] ✅ Todos os tokens habilitados');

    } catch (error) {
      console.error('[TokenMgr] Erro ao habilitar tokens:', error);
    }
  }

  /**
   * Obter identificador único do navegador/dispositivo
   */
  getBrowserIdentifier() {
    // Usar localStorage para identificador consistente por navegador
    const storageKey = 'yuna_browser_id';
    let browserId = localStorage.getItem(storageKey);

    if (!browserId) {
      browserId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, browserId);
    }

    return browserId;
  }

  /**
   * Detectar nome do navegador
   */
  getBrowserName() {
    const userAgent = navigator.userAgent;

    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) return 'Opera';

    return 'Unknown';
  }

  /**
   * Detectar tipo de dispositivo
   */
  getDeviceType() {
    const ua = navigator.userAgent;

    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase())) {
      return 'mobile';
    }

    if (/tablet|ipad|playbook|silk|windows phone/i.test(ua.toLowerCase())) {
      return 'tablet';
    }

    if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
      return 'tablet';
    }

    return 'desktop';
  }

  /**
   * Status de inicialização
   */
  getStatus() {
    return {
      initialized: this.initialized,
      hasToken: !!this.currentToken,
      currentToken: this.currentToken ? this.currentToken.substring(0, 20) + '...' : null
    };
  }
}

// Instância global
window.yunaPushTokenManager = null;

/**
 * Inicializar gerenciador de tokens
 */
async function initYunaPushTokenManager(messaging, db) {
  try {
    window.yunaPushTokenManager = new YunaPushTokenManager(db, messaging);
    const success = await window.yunaPushTokenManager.init();
    if (success) {
      console.log('[TokenMgr] ✅ Gerenciador de tokens inicializado');
    }
    return window.yunaPushTokenManager;
  } catch (error) {
    console.error('[TokenMgr] ❌ Falha na inicialização:', error);
    return null;
  }
}

// Expor globalmente para uso em outros módulos
window.initYunaPushTokenManager = initYunaPushTokenManager;
