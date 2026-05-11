/**
 * YUNA PWA - Deep Linking Router
 * Permite URLs como: /acompanhantes/?solicitacao=ID
 * 
 * Funcionalidades:
 * - Abrir solicitação específica ao abrir app
 * - Share app com link para solicitação específica
 * - Funciona offline (carrega de IndexedDB)
 */

class YunaDeepLinking {
  constructor() {
    this.currentSolicitacaoId = null;
    this.actionAfterLoad = null;
  }

  /**
   * Inicializar router
   */
  async init() {
    console.log('[DeepLink] Inicializando router');

    // Parse query params
    const params = new URLSearchParams(window.location.search);
    this.currentSolicitacaoId = params.get('solicitacao');
    this.actionAfterLoad = params.get('action');

    // Se tem solicitacao no query param, marcar para abrir após carregamento
    if (this.currentSolicitacaoId) {
      console.log('[DeepLink] Solicitação no URL:', this.currentSolicitacaoId);

      // Esperar DOM estar pronto e tentar abrir
      document.addEventListener('DOMContentLoaded', () => {
        this.openSolicitacao(this.currentSolicitacaoId, this.actionAfterLoad);
      });

      // Se já está pronto (não é primeirodcarregamento)
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => this.openSolicitacao(this.currentSolicitacaoId, this.actionAfterLoad), 500);
      }
    }

    // Listen para mudanças do URL (navegação back/forward)
    window.addEventListener('popstate', (event) => {
      if (event.state?.solicitacaoId) {
        this.openSolicitacao(event.state.solicitacaoId);
      }
    });

    console.log('[DeepLink] ✅ Router pronto');
  }

  /**
   * Abrir solicitação específica
   */
  async openSolicitacao(solicitacaoId, action = null) {
    console.log('[DeepLink] Abrindo solicitação:', solicitacaoId, 'ação:', action);

    try {
      let solicitacao = null;

      // 1. Tentar do Firestore
      if (window.db && window.currentUser) {
        try {
          const doc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
          if (doc.exists && doc.data().usuarioId === window.currentUser.uid) {
            solicitacao = { id: doc.id, ...doc.data() };
          }
        } catch (error) {
          console.warn('[DeepLink] Erro ao buscar de Firestore:', error);
        }
      }

      // 2. Se offline ou falhou, tentar IndexedDB
      if (!solicitacao && window.yunaPersistence) {
        const cached = await window.yunaPersistence.getSolicitacoes();
        solicitacao = cached.find(s => s.id === solicitacaoId);
      }

      if (!solicitacao) {
        console.warn('[DeepLink] Solicitação não encontrada:', solicitacaoId);
        this.showError('Solicitação não encontrada');
        return false;
      }

      // 3. Executar ação conforme o tipo
      if (action === 'avaliar') {
        this.openSatisfactionSurvey(solicitacao);
      } else if (action === 'retomar') {
        this.openResumeModal(solicitacao);
      } else {
        // Default: abrir detalhes
        this.openDetailsModal(solicitacao);
      }

      // Update history
      window.history.pushState(
        { solicitacaoId: solicitacaoId },
        '',
        `/acompanhantes/?solicitacao=${solicitacaoId}`
      );

      return true;

    } catch (error) {
      console.error('[DeepLink] Erro ao abrir solicitação:', error);
      this.showError('Erro ao abrir solicitação');
      return false;
    }
  }

  /**
   * Abrir modal de detalhes
   */
  openDetailsModal(solicitacao) {
    console.log('[DeepLink] Abrindo detalhes de:', solicitacao.id);

    // Procurar card da solicitação
    const card = document.querySelector(`[data-solicitacao-id="${solicitacao.id}"]`);
    if (card && card.onclick) {
      card.onclick();
      return;
    }

    // Se não achou card, mostrar informação simples
    this.showSolicitacaoInfo(solicitacao);
  }

  /**
   * Abrir modal de pesquisa de satisfação
   */
  openSatisfactionSurvey(solicitacao) {
    console.log('[DeepLink] Abrindo pesquisa para:', solicitacao.id);

    // Procurar e disparar função de avaliação
    if (window.abrirAvaliacaoSolicitacao) {
      window.abrirAvaliacaoSolicitacao(solicitacao.id);
    } else {
      this.showSolicitacaoInfo(solicitacao, 'avaliar');
    }
  }

  /**
   * Mostrar informações da solicitação (fallback)
   */
  showSolicitacaoInfo(solicitacao, mode = 'view') {
    const modal = document.createElement('div');
    modal.className = 'deep-link-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      animation: fadeIn 0.3s ease-out;
    `;

    const statusMap = {
      'pendente': '⏳ Pendente',
      'em-andamento': '👷 Em Andamento',
      'finalizada': '✅ Finalizado',
      'cancelada': '❌ Cancelada'
    };

    const content = `
      <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 400px; width: 90%;">
        <h2 style="margin: 0 0 1rem 0; color: #1e293b;">${solicitacao.tipo || 'Serviço'}</h2>
        
        <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
          <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 0.5rem;">Status</div>
          <div style="font-size: 1.1rem; font-weight: 600; color: #2563eb;">
            ${statusMap[solicitacao.status] || solicitacao.status}
          </div>
        </div>

        ${solicitacao.descricao ? `
          <div style="margin: 1rem 0;">
            <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 0.5rem;">Descrição</div>
            <div style="color: #334155;">${solicitacao.descricao}</div>
          </div>
        ` : ''}

        ${solicitacao.criadoEm ? `
          <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 1rem;">
            Criada: ${new Date(solicitacao.criadoEm.toDate?.() || solicitacao.criadoEm).toLocaleString('pt-BR')}
          </div>
        ` : ''}

        <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
            style="flex: 1; padding: 0.75rem; background: #e2e8f0; border: none; border-radius: 6px; 
                   cursor: pointer; font-weight: 500; color: #334155;">
            Fechar
          </button>
          ${mode === 'avaliar' ? `
            <button onclick="if(window.abrirAvaliacaoSolicitacao) window.abrirAvaliacaoSolicitacao('${solicitacao.id}'); 
                             this.parentElement.parentElement.parentElement.remove();"
              style="flex: 1; padding: 0.75rem; background: #2563eb; border: none; border-radius: 6px; 
                     cursor: pointer; font-weight: 500; color: white;">
              ⭐ Avaliar
            </button>
          ` : ''}
        </div>
      </div>
    `;

    modal.innerHTML = content;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  /**
   * Mostrar erro
   */
  showError(message) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #ef4444;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 999999;
      animation: slideIn 0.3s ease-out;
    `;
    modal.textContent = message;
    document.body.appendChild(modal);

    setTimeout(() => {
      modal.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => modal.remove(), 300);
    }, 4000);
  }

  /**
   * Gerar link compartilhável
   */
  generateShareLink(solicitacaoId) {
    const baseUrl = window.location.origin + '/acompanhantes/';
    return `${baseUrl}?solicitacao=${solicitacaoId}`;
  }

  /**
   * Share API (se suportado)
   */
  async shareSolicitacao(solicitacao) {
    const link = this.generateShareLink(solicitacao.id);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'YUNA - ' + solicitacao.tipo,
          text: `Minha solicitação de ${solicitacao.tipo}`,
          url: link
        });
        console.log('[DeepLink] Compartilhada via Share API');
      } catch (error) {
        console.log('[DeepLink] Share cancelado ou falhou:', error);
      }
    } else {
      // Fallback: copiar para clipboard
      this.copyToClipboard(link);
    }
  }

  /**
   * Copiar link para clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('[DeepLink] Link copiado para clipboard');
      
      // Mostrar toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #10b981;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        z-index: 999999;
      `;
      toast.textContent = '✓ Link copiado';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);

    } catch (error) {
      console.error('[DeepLink] Erro ao copiar:', error);
    }
  }
}

// Instância global
window.yunaDeepLinking = null;

/**
 * Inicializar deep linking
 */
async function initYunaDeepLinking() {
  try {
    window.yunaDeepLinking = new YunaDeepLinking();
    await window.yunaDeepLinking.init();
    console.log('[DeepLink] ✅ Deep linking pronto');
    return window.yunaDeepLinking;
  } catch (error) {
    console.error('[DeepLink] ❌ Falha na inicialização:', error);
    return null;
  }
}

// Auto-iniciar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYunaDeepLinking);
} else {
  setTimeout(initYunaDeepLinking, 100);
}
