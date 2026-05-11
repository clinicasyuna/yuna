/**
 * YUNA PWA - Push Notifications & Real-time Status Updates
 * Integra Firebase Cloud Messaging com listeners Firestore
 * 
 * Eventos monitorados:
 * - Status da solicitação muda (pendente → em-andamento → finalizada)
 * - SLA é pausado/resumido
 * - Solicitação está vencendo (< 1h para SLA expirar)
 * - Pesquisa de satisfação disponível (7 dias após finalização)
 */

class YunaPushNotifications {
  constructor() {
    this.messaging = null;
    this.enabled = false;
    this.listeners = [];
    this.notificationCount = 0;
  }

  /**
   * Inicializar push notifications
   */
  async init(messaging) {
    try {
      this.messaging = messaging;

      // Checar suporte para notifications
      if (!('Notification' in window)) {
        console.warn('[Notifications] Notificações não suportadas neste navegador');
        return;
      }

      // Solicitar permissão
      if (Notification.permission === 'granted') {
        this.enabled = true;
        console.log('[Notifications] ✅ Permissão já concedida');
      } else if (Notification.permission !== 'denied') {
        // Pedir permissão
        const permission = await Notification.requestPermission();
        this.enabled = permission === 'granted';
        console.log('[Notifications] Permissão:', permission);
      }

      // Registrar service worker para Firebase messaging
      if (this.enabled && 'serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('./firebase-messaging-sw.js', {
            scope: '/acompanhantes/'
          });
          console.log('[Notifications] Firebase messaging SW registrado');
        } catch (error) {
          console.warn('[Notifications] Erro ao registrar messaging SW:', error);
        }
      }

      console.log('[Notifications] ✅ Push notifications inicializado');
      return this.enabled;

    } catch (error) {
      console.error('[Notifications] Erro ao inicializar:', error);
      return false;
    }
  }

  /**
   * Setup listeners para monitorar mudanças em tempo real
   */
  setupRealtimeListeners(userId, db) {
    if (!this.enabled) return;

    console.log('[Notifications] Configurando listeners em tempo real para:', userId);

    // ===== LISTENER 1: Monitorar status da solicitação =====
    const solicitacoesListener = db
      .collection('solicitacoes')
      .where('usuarioId', '==', userId)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const solicitacao = change.doc.data();
            this.onSolicitacaoStatusChange(solicitacao);
          }
        });
      }, (error) => {
        console.error('[Notifications] Erro em listener solicitações:', error);
      });

    this.listeners.push(() => solicitacoesListener());

    console.log('[Notifications] Listeners configurados');
  }

  /**
   * Detectar mudança de status e enviar notificação
   */
  onSolicitacaoStatusChange(solicitacao) {
    const previous = window.previousSolicitacaoState || {};

    // Status mudou?
    if (previous.id === solicitacao.id && previous.status !== solicitacao.status) {
      console.log('[Notifications] Status mudou:', previous.status, '→', solicitacao.status);
      this.notifyStatusChange(solicitacao);
    }

    // SLA foi pausado?
    if (!previous.slaEmPausa && solicitacao.slaEmPausa) {
      console.log('[Notifications] SLA pausado');
      this.notifySLAPaused(solicitacao);
    }

    // SLA foi retomado?
    if (previous.slaEmPausa && !solicitacao.slaEmPausa) {
      console.log('[Notifications] SLA retomado');
      this.notifySLAResumed(solicitacao);
    }

    // Atualizar estado anterior
    window.previousSolicitacaoState = solicitacao;
  }

  /**
   * Notificação: Status mudou
   */
  notifyStatusChange(solicitacao) {
    const statusMap = {
      'pendente': { emoji: '⏳', texto: 'Sua solicitação está na fila' },
      'em-andamento': { emoji: '👷', texto: 'Equipe começou a atender' },
      'finalizada': { emoji: '✅', texto: 'Serviço finalizado!' },
      'cancelada': { emoji: '❌', texto: 'Solicitação cancelada' }
    };

    const statusInfo = statusMap[solicitacao.status] || { emoji: '📋', texto: 'Status atualizado' };

    this.showNotification(
      `${statusInfo.emoji} ${solicitacao.tipo}`,
      statusInfo.texto,
      {
        tag: `status-${solicitacao.id}`,
        requireInteraction: solicitacao.status === 'finalizada',
        data: {
          url: `/acompanhantes/?solicitacao=${solicitacao.id}`,
          solicitacaoId: solicitacao.id
        },
        actions: solicitacao.status === 'finalizada' ? [
          { action: 'avaliar', title: 'Avaliar serviço' }
        ] : []
      }
    );

    // Log para auditoria
    console.log('[Notifications] Enviada notificação de status:', solicitacao.id);
  }

  /**
   * Notificação: SLA pausado
   */
  notifySLAPaused(solicitacao) {
    const motivo = solicitacao.pausaAtiva?.motivo || 'Sem motivo informado';

    this.showNotification(
      '⏸️ Atendimento em Pausa',
      `Motivo: ${motivo.substring(0, 60)}...`,
      {
        tag: `pausa-${solicitacao.id}`,
        requireInteraction: true,
        data: {
          url: `/acompanhantes/?solicitacao=${solicitacao.id}`,
          solicitacaoId: solicitacao.id,
          motivo: motivo
        }
      }
    );
  }

  /**
   * Notificação: SLA retomado
   */
  notifySLAResumed(solicitacao) {
    this.showNotification(
      '▶️ Atendimento Retomado',
      'Sua solicitação voltou à fila de atendimento',
      {
        tag: `resume-${solicitacao.id}`,
        data: {
          url: `/acompanhantes/?solicitacao=${solicitacao.id}`,
          solicitacaoId: solicitacao.id
        }
      }
    );
  }

  /**
   * Notificação: SLA vencendo (< 1h)
   */
  notifySLAExpiring(solicitacao, minutosRestantes) {
    this.showNotification(
      '⚠️ SLA Expirando',
      `Apenas ${minutosRestantes} minutos restantes`,
      {
        tag: `expiring-${solicitacao.id}`,
        requireInteraction: true,
        data: {
          url: `/acompanhantes/?solicitacao=${solicitacao.id}`,
          solicitacaoId: solicitacao.id,
          urgency: 'high'
        }
      }
    );
  }

  /**
   * Notificação: Pesquisa de satisfação disponível
   */
  notifySatisfactionSurvey(solicitacao) {
    this.showNotification(
      '⭐ Avalie o Serviço',
      'Sua opinião é importante! Leva menos de 1 minuto',
      {
        tag: `survey-${solicitacao.id}`,
        requireInteraction: true,
        data: {
          url: `/acompanhantes/?solicitacao=${solicitacao.id}&avaliar=true`,
          solicitacaoId: solicitacao.id
        },
        actions: [
          { action: 'avaliar-agora', title: '⭐ Avaliar Agora' },
          { action: 'depois', title: 'Depois' }
        ]
      }
    );

    // Incrementar badge
    this.updateBadge(1);
  }

  /**
   * Mostrar notificação (com fallback para alert se SW não disponível)
   */
  async showNotification(title, body, options = {}) {
    try {
      if (this.enabled && 'serviceWorker' in navigator) {
        // Usar service worker para mostrar notificação
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          ...options,
          body,
          icon: 'data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 192 192%22%3e%3crect width=%22192%22 height=%22192%22 fill=%22%232563eb%22 rx=%2235%22/%3e%3ctext x=%2296%22 y=%22110%22 text-anchor=%22middle%22 font-size=%2280%22 font-weight=%22bold%22%3eY%3c/text%3e%3c/svg%3e',
          badge: 'data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3e%3ccircle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%232563eb%22/%3e%3c/svg%3e',
          timestamp: Date.now()
        });
      } else {
        // Fallback: Toast no próprio app
        this.showToastNotification(title, body, options);
      }

      this.notificationCount++;
      this.updateBadge(this.notificationCount);

    } catch (error) {
      console.error('[Notifications] Erro ao mostrar notificação:', error);
      this.showToastNotification(title, body, options);
    }
  }

  /**
   * Toast notification (fallback visual)
   */
  showToastNotification(title, body, options = {}) {
    const toast = document.createElement('div');
    toast.id = `toast-${Date.now()}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 999999;
      max-width: 350px;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    toast.innerHTML = `
      <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">${title}</div>
      <div style="font-size: 0.9rem; opacity: 0.95;">${body}</div>
    `;

    document.body.appendChild(toast);

    toast.addEventListener('click', () => {
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    });

    // Auto-remover após 5s
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Atualizar badge de notificações não lidas
   */
  updateBadge(count = 0) {
    try {
      if ('setAppBadge' in navigator) {
        if (count > 0) {
          navigator.setAppBadge(count);
        } else {
          navigator.clearAppBadge();
        }
        console.log('[Notifications] Badge atualizado:', count);
      }
    } catch (error) {
      console.warn('[Notifications] Erro ao atualizar badge:', error);
    }
  }

  /**
   * Limpar listeners
   */
  cleanup() {
    this.listeners.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('[Notifications] Erro ao limpar listener:', error);
      }
    });
    this.listeners = [];
    this.notificationCount = 0;
    this.updateBadge(0);
  }
}

// Instância global
window.yunaPushNotifications = null;

/**
 * Inicializar push notifications
 */
async function initYunaPushNotifications(messaging, db, userId) {
  try {
    if (window.yunaPushNotifications) {
      window.yunaPushNotifications.cleanup();
    }

    window.yunaPushNotifications = new YunaPushNotifications();
    const enabled = await window.yunaPushNotifications.init(messaging);

    if (enabled && db && userId) {
      window.yunaPushNotifications.setupRealtimeListeners(userId, db);
    }

    console.log('[Notifications] ✅ Push notifications pronto');
    return window.yunaPushNotifications;

  } catch (error) {
    console.error('[Notifications] ❌ Falha na inicialização:', error);
    return null;
  }
}

// CSS para animações de toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
