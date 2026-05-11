/**
 * YUNA PWA - Analytics & Engagement Metrics
 * Rastreia eventos de uso e coleta métricas de desempenho
 * 
 * Funcionalidades:
 * - Tracking automático de eventos
 * - Métricas de performance (Core Web Vitals)
 * - Análise de uso por horário/tipo
 * - Dashboard de analytics no portal
 * - Relatórios agregados
 */

class YunaAnalytics {
  constructor(db) {
    this.db = db;
    this.sessionId = this.generateSessionId();
    this.eventQueue = [];
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 segundos
    this.initialized = false;
  }

  /**
   * Inicializar analytics
   */
  async init() {
    try {
      console.log('[Analytics] Inicializando');

      if (!this.db) {
        console.warn('[Analytics] Firestore não disponível');
        return false;
      }

      // Coletar Web Vitals
      this.collectWebVitals();

      // Iniciar flush periódico de eventos
      this.startFlushInterval();

      // Ouvir eventos de contexto
      this.setupContextListeners();

      this.initialized = true;
      console.log('[Analytics] ✅ Inicializado (sessionId:', this.sessionId, ')');
      return true;

    } catch (error) {
      console.error('[Analytics] ❌ Erro na inicialização:', error);
      return false;
    }
  }

  /**
   * Rastrear evento
   */
  async trackEvent(eventName, data = {}) {
    try {
      const timestamp = new Date().toISOString();
      const currentUser = window.currentUser;

      const event = {
        id: `${this.sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: this.sessionId,
        userId: currentUser?.uid || 'anonymous',
        userEmail: currentUser?.email || 'anonymous',
        eventName,
        data: {
          ...data,
          timestamp,
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent
        },
        pageViewId: window.pageViewId,
        offline: !navigator.onLine
      };

      // Adicionar à fila
      this.eventQueue.push(event);

      console.log('[Analytics] Event queued:', eventName);

      // Se fila está cheia, fazer flush
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      }

      return event.id;

    } catch (error) {
      console.error('[Analytics] Erro ao rastrear evento:', error);
    }
  }

  /**
   * Flush de eventos para Firestore
   */
  async flushEvents() {
    if (this.eventQueue.length === 0) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      console.log('[Analytics] Flushing', eventsToSend.length, 'events...');

      // Usar batch para performance
      const batch = this.db.batch();
      const collection = this.db.collection('analytics_events');

      eventsToSend.forEach(event => {
        const docRef = collection.doc(event.id);
        batch.set(docRef, event);
      });

      await batch.commit();

      console.log('[Analytics] ✅ Batch enviado:', eventsToSend.length, 'events');

    } catch (error) {
      console.error('[Analytics] Erro ao flush events:', error);
      // Re-adicionar à fila para tentar depois
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  /**
   * Iniciar flush periódico
   */
  startFlushInterval() {
    setInterval(() => {
      if (navigator.onLine && this.eventQueue.length > 0) {
        this.flushEvents().catch(err => {
          console.error('[Analytics] Erro no flush periódico:', err);
        });
      }
    }, this.flushInterval);
  }

  /**
   * Coletar Web Vitals (performance)
   */
  collectWebVitals() {
    try {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            this.trackEvent('web_vital_lcp', {
              value: lastEntry.renderTime || lastEntry.loadTime,
              element: lastEntry.element?.tagName || 'unknown'
            });
          });

          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('[Analytics] LCP não suportado');
        }

        // First Input Delay (FID)
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              this.trackEvent('web_vital_fid', {
                value: entry.processingDuration,
                name: entry.name
              });
            });
          });

          observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('[Analytics] FID não suportado');
        }

        // Cumulative Layout Shift (CLS)
        try {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });

            this.trackEvent('web_vital_cls', {
              value: clsValue
            });
          });

          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('[Analytics] CLS não suportado');
        }
      }

      // Page load time
      window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        this.trackEvent('page_load_time', {
          value: pageLoadTime,
          dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcpConnection: perfData.connectEnd - perfData.connectStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
          resourcesLoaded: perfData.loadEventEnd - perfData.domContentLoadedEventEnd
        });
      });

    } catch (error) {
      console.warn('[Analytics] Erro ao coletar Web Vitals:', error);
    }
  }

  /**
   * Listeners de contexto (offline, online, etc)
   */
  setupContextListeners() {
    window.addEventListener('online', () => {
      this.trackEvent('connection_online', {
        timestamp: new Date().toISOString()
      });
    });

    window.addEventListener('offline', () => {
      this.trackEvent('connection_offline', {
        timestamp: new Date().toISOString()
      });
    });

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('page_visibility_change', {
        hidden: document.hidden,
        timestamp: new Date().toISOString()
      });
    });

    // Unload (flush ao sair)
    window.addEventListener('beforeunload', () => {
      // Flush síncrono
      if (this.eventQueue.length > 0) {
        // Usar sendBeacon para garantir envio mesmo com navegação
        const blob = new Blob([JSON.stringify({
          batch: this.eventQueue,
          timestamp: new Date().toISOString()
        })], { type: 'application/json' });

        navigator.sendBeacon('/api/analytics/batch', blob);
      }
    });
  }

  /**
   * Gerar ID de sessão único
   */
  generateSessionId() {
    return `${window.currentUser?.uid || 'anon'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agregações úteis
   */
  async getEventStats(eventName, timeRangeHours = 24) {
    try {
      const since = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

      const query = await this.db
        .collection('analytics_events')
        .where('eventName', '==', eventName)
        .where('data.timestamp', '>=', since.toISOString())
        .get();

      return {
        eventName,
        totalCount: query.size,
        timeRange: `${timeRangeHours}h`,
        docs: query.docs.map(doc => doc.data())
      };

    } catch (error) {
      console.error('[Analytics] Erro ao buscar stats:', error);
      return null;
    }
  }

  /**
   * Status do analytics
   */
  getStatus() {
    return {
      initialized: this.initialized,
      sessionId: this.sessionId,
      queuedEvents: this.eventQueue.length,
      batchSize: this.batchSize
    };
  }
}

// Instância global
window.yunaAnalytics = null;

/**
 * Inicializar analytics
 */
async function initYunaAnalytics(db) {
  try {
    window.yunaAnalytics = new YunaAnalytics(db);
    const success = await window.yunaAnalytics.init();

    if (success) {
      // Rastrear app_opened já no init
      await window.yunaAnalytics.trackEvent('app_opened', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine,
        platform: navigator.platform
      });

      console.log('[Analytics] ✅ Analytics inicializado');
    }

    return window.yunaAnalytics;
  } catch (error) {
    console.error('[Analytics] ❌ Falha na inicialização:', error);
    return null;
  }
}

// Expor globalmente
window.initYunaAnalytics = initYunaAnalytics;

/**
 * Dashboard de Analytics - Painel simples no portal
 */
class YunaAnalyticsDashboard {
  constructor(container, db) {
    this.container = container;
    this.db = db;
  }

  /**
   * Renderizar dashboard
   */
  async render() {
    try {
      const stats = await this.fetchStats();

      const html = `
        <div style="padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
          <h2 style="margin: 0 0 1.5rem 0; font-size: 1.5rem;">📊 Seu Uso do App</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; backdrop-filter: blur(10px);">
              <div style="font-size: 0.9rem; opacity: 0.9;">Solicitações Criadas</div>
              <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">${stats.solicitacoesCriadas || 0}</div>
              <div style="font-size: 0.8rem; opacity: 0.7;">neste mês</div>
            </div>

            <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; backdrop-filter: blur(10px);">
              <div style="font-size: 0.9rem; opacity: 0.9;">Tempo Médio</div>
              <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">${stats.tempoMedio || '--'}h</div>
              <div style="font-size: 0.8rem; opacity: 0.7;">para atender</div>
            </div>

            <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; backdrop-filter: blur(10px);">
              <div style="font-size: 0.9rem; opacity: 0.9;">Satisfação</div>
              <div style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">${stats.satisfacao || '--'}%</div>
              <div style="font-size: 0.8rem; opacity: 0.7;">média avaliada</div>
            </div>
          </div>
        </div>
      `;

      if (this.container) {
        this.container.innerHTML = html;
      }

    } catch (error) {
      console.error('[Dashboard] Erro ao renderizar:', error);
    }
  }

  /**
   * Buscar estatísticas
   */
  async fetchStats() {
    try {
      const currentUser = window.currentUser;
      if (!currentUser) {
        return {};
      }

      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

      // Solicitações do mês
      const solicitacoesSnapshot = await this.db
        .collection('solicitacoes')
        .where('usuarioId', '==', currentUser.uid)
        .where('criadoEm', '>=', inicioMes.toISOString())
        .get();

      // Tempo médio
      let tempoTotal = 0;
      let count = 0;

      solicitacoesSnapshot.forEach(doc => {
        const sol = doc.data();
        if (sol.cronometro?.duracao) {
          tempoTotal += sol.cronometro.duracao;
          count++;
        }
      });

      const tempoMedio = count > 0 ? Math.round(tempoTotal / count / 60) : 0;

      // Satisfação média
      const avaliadasSnapshot = await this.db
        .collection('solicitacoes')
        .where('usuarioId', '==', currentUser.uid)
        .where('avaliada', '==', true)
        .where('satisfacao.nota', '>', 0)
        .get();

      let satisfacaoTotal = 0;
      let avaliacoes = 0;

      avaliadasSnapshot.forEach(doc => {
        const sol = doc.data();
        if (sol.satisfacao?.nota) {
          satisfacaoTotal += sol.satisfacao.nota;
          avaliacoes++;
        }
      });

      const satisfacao = avaliacoes > 0 ? Math.round((satisfacaoTotal / avaliacoes / 5) * 100) : 0;

      return {
        solicitacoesCriadas: solicitacoesSnapshot.size,
        tempoMedio,
        satisfacao,
        avaliacoes
      };

    } catch (error) {
      console.error('[Dashboard] Erro ao buscar stats:', error);
      return {};
    }
  }
}

// Expor dashboard
window.YunaAnalyticsDashboard = YunaAnalyticsDashboard;
