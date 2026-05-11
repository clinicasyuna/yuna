/**
 * YUNA PWA - Engagement Features
 * Install prompts, app usage tracking, badges
 * 
 * Estratégia: Mostrar install prompt após 3 ações do usuário
 */

class YunaEngagement {
  constructor() {
    this.deferredPrompt = null;
    this.userActionCount = 0;
    this.installPromptShown = false;
    this.isAppInstalled = false;
  }

  /**
   * Inicializar engagement features
   */
  async init() {
    console.log('[Engagement] Inicializando features');

    // Detectar se app está instalado
    this.detectAppInstalled();

    // Capturar beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('[Engagement] Install prompt disponível');
    });

    // Listener para app instalado
    window.addEventListener('appinstalled', () => {
      console.log('[Engagement] ✅ App instalado!');
      this.isAppInstalled = true;
      this.deferredPrompt = null;
      this.userActionCount = 0;
    });

    // Rastrear ações do usuário
    document.addEventListener('click', () => this.trackUserAction());
    document.addEventListener('keydown', () => this.trackUserAction());

    // Suportar share API
    this.setupShareButton();

    console.log('[Engagement] ✅ Engagement pronto');
  }

  /**
   * Detectar se app já está instalado
   */
  detectAppInstalled() {
    // Método 1: Display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isAppInstalled = true;
      console.log('[Engagement] App detectado em standalone mode');
      return;
    }

    // Método 2: Verificar no localStorage
    if (localStorage.getItem('yuna_app_installed') === 'true') {
      this.isAppInstalled = true;
      console.log('[Engagement] App marcado como instalado (localStorage)');
      return;
    }
  }

  /**
   * Rastrear ações do usuário para install prompt
   */
  trackUserAction() {
    if (this.isAppInstalled || this.installPromptShown || !this.deferredPrompt) {
      return;
    }

    this.userActionCount++;
    console.log('[Engagement] Ação rastreada:', this.userActionCount);

    // Mostrar prompt após 3 ações
    if (this.userActionCount >= 3) {
      this.showInstallPrompt();
    }
  }

  /**
   * Mostrar prompt de instalação
   */
  async showInstallPrompt() {
    if (!this.deferredPrompt || this.installPromptShown) {
      return;
    }

    this.installPromptShown = true;

    console.log('[Engagement] Mostrando install prompt');

    // Criar UI customizada (mais bonita que o default)
    const modal = document.createElement('div');
    modal.id = 'yuna-install-prompt';
    modal.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 1.5rem;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
      z-index: 999998;
      animation: slideUpIn 0.4s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    modal.innerHTML = `
      <div style="max-width: 500px; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 2rem;">📱</div>
          <div>
            <div style="font-size: 1rem; font-weight: 600;">Instale o YUNA App</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">Acesso rápido, funciona offline</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 0.75rem;">
          <button id="yuna-install-btn" style="
            flex: 1;
            padding: 0.75rem 1rem;
            background: white;
            color: #2563eb;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            ⬇️ Instalar Agora
          </button>
          <button id="yuna-cancel-install-btn" style="
            flex: 0.5;
            padding: 0.75rem 1rem;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 0.9rem;
          ">
            Depois
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Botão instalar
    document.getElementById('yuna-install-btn').addEventListener('click', async () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('[Engagement] User choice:', outcome);

        if (outcome === 'accepted') {
          localStorage.setItem('yuna_app_installed', 'true');
          this.isAppInstalled = true;
        }

        this.deferredPrompt = null;
        modal.remove();
      }
    });

    // Botão cancelar
    document.getElementById('yuna-cancel-install-btn').addEventListener('click', () => {
      modal.remove();
      // Resetar contador para tentar novamente depois
      this.userActionCount = 1;
    });
  }

  /**
   * Setup share button
   */
  setupShareButton() {
    // Procurar botão de share no DOM
    const shareBtn = document.getElementById('yuna-share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', () => {
      this.shareApp();
    });
  }

  /**
   * Compartilhar app
   */
  async shareApp() {
    const url = window.location.origin + '/acompanhantes/';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'YUNA Solicite',
          text: 'Gerenciar solicitações de serviços é muito fácil com o YUNA!',
          url: url
        });
        console.log('[Engagement] App compartilhado');
      } catch (error) {
        console.log('[Engagement] Share cancelado:', error);
      }
    } else {
      // Copiar link
      try {
        await navigator.clipboard.writeText(url);
        alert('✓ Link do app copiado!');
      } catch (error) {
        console.error('[Engagement] Erro ao copiar:', error);
      }
    }
  }

  /**
   * Mostrar notificação de boas-vindas se é primeira vez
   */
  showWelcomeMessage() {
    const hasVisited = localStorage.getItem('yuna_has_visited');

    if (!hasVisited) {
      localStorage.setItem('yuna_has_visited', 'true');

      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 999999;
        animation: slideIn 0.3s ease-out;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        max-width: 350px;
        text-align: center;
      `;

      toast.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 0.25rem;">👋 Bem-vindo ao YUNA!</div>
        <div style="font-size: 0.9rem; opacity: 0.95;">Suas solicitações em um só lugar</div>
      `;

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }
  }

  /**
   * Registrar evento de uso
   */
  trackUsage(eventName, data = {}) {
    try {
      // Armazenar localmente
      const event = {
        name: eventName,
        timestamp: new Date().toISOString(),
        data: data
      };

      console.log('[Engagement] Event:', event);

      // Enviar para Analytics (se configurado)
      if (window.gtag) {
        window.gtag('event', eventName, data);
      }
    } catch (error) {
      console.warn('[Engagement] Erro ao rastrear evento:', error);
    }
  }
}

// Instância global
window.yunaEngagement = null;

/**
 * Inicializar engagement
 */
async function initYunaEngagement() {
  try {
    window.yunaEngagement = new YunaEngagement();
    await window.yunaEngagement.init();
    window.yunaEngagement.showWelcomeMessage();
    console.log('[Engagement] ✅ Engagement pronto');
    return window.yunaEngagement;
  } catch (error) {
    console.error('[Engagement] ❌ Falha na inicialização:', error);
    return null;
  }
}

// CSS para animações
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUpIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-50%) translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(-20px);
      opacity: 0;
    }
  }

  /* Suporte para diferentes orientações */
  @media (orientation: landscape) {
    #yuna-install-prompt {
      padding: 1rem;
      bottom: 0;
    }
  }
`;
document.head.appendChild(style);

// Auto-iniciar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYunaEngagement);
} else {
  setTimeout(initYunaEngagement, 100);
}
