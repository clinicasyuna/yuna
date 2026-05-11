/**
 * YUNA PWA - Offline Sync Manager
 * Permite criar solicitações offline e sincronizar automaticamente
 * 
 * Funcionalidades:
 * - Capturar solicitação quando offline
 * - Armazenar em IndexedDB
 * - Sincronizar automaticamente ao conectar
 * - Notificar usuário do status de sync
 */

class YunaOfflineSync {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.lastSyncTime = null;
  }

  /**
   * Inicializar offline sync
   */
  async init() {
    console.log('[OfflineSync] Inicializando');

    // Listen para mudanças de conexão
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[OfflineSync] 🔗 Online! Iniciando sync de ações pendentes');
      this.syncAllPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[OfflineSync] 📵 Offline - ações serão enfileiradas');
    });

    // Interceptar enviarSolicitacao original
    if (window.enviarSolicitacao && !window._originalEnviarSolicitacao) {
      window._originalEnviarSolicitacao = window.enviarSolicitacao;
      window.enviarSolicitacao = () => this.enviarSolicitacaoComSync();
    }

    console.log('[OfflineSync] ✅ Inicializado');
  }

  /**
   * Enviar solicitação com detecção de offline
   */
  async enviarSolicitacaoComSync() {
    console.log('[OfflineSync] Enviando solicitação (online:', this.isOnline, ')');

    if (this.isOnline) {
      // Online: executar normalmente
      try {
        await window._originalEnviarSolicitacao();
      } catch (error) {
        console.error('[OfflineSync] Erro ao enviar (estava online):', error);
        throw error;
      }
    } else {
      // Offline: capturar dados e armazenar
      console.log('[OfflineSync] 📵 Offline - capturando solicitação para fila');
      await this.captureAndQueueSolicitacao();
    }
  }

  /**
   * Capturar dados da solicitação e armazenar offline
   */
  async captureAndQueueSolicitacao() {
    try {
      const currentUser = window.currentUser;
      const equipeSelecionada = window.equipeSelecionada;

      if (!currentUser || !equipeSelecionada) {
        throw new Error('Usuário não autenticado ou equipe não selecionada');
      }

      // Validar campos
      const prioridade = document.getElementById('prioridade-solicitacao')?.value;
      const horarioSelecionado = document.getElementById('horario-selecionado')?.value;

      if (!prioridade || !horarioSelecionado) {
        throw new Error('Campos obrigatórios não preenchidos');
      }

      // Montar objeto solicitação
      let dadosSolicitacao = {
        equipe: equipeSelecionada.toLowerCase(),
        status: 'pendente',
        prioridade: prioridade,
        horarioPreferencial: horarioSelecionado,
        usuarioId: currentUser.uid,
        userId: currentUser.uid,
        usuarioEmail: currentUser.email,
        usuarioNome: currentUser.email.split('@')[0],
        quarto: 'N/A',
        dataAberturaLocal: new Date().toLocaleString('pt-BR'),
        criadoEm: new Date().toISOString()
      };

      // Coletar dados específicos baseado na equipe
      switch (equipeSelecionada) {
        case 'manutencao':
          const tipoManutencao = document.getElementById('tipo-manutencao')?.value;
          const descricaoProblema = document.getElementById('descricao-problema')?.value;
          if (!tipoManutencao || !descricaoProblema) {
            throw new Error('Campos de manutenção não preenchidos');
          }
          dadosSolicitacao = {
            ...dadosSolicitacao,
            tipo: tipoManutencao,
            descricao: descricaoProblema
          };
          break;

        case 'higienizacao':
          const tipoHigienizacao = document.getElementById('tipo-higienizacao')?.value;
          const observacoesHigienizacao = document.getElementById('observacoes-higienizacao')?.value || '';
          if (!tipoHigienizacao) {
            throw new Error('Tipo de higienização não selecionado');
          }
          dadosSolicitacao = {
            ...dadosSolicitacao,
            tipo: tipoHigienizacao,
            observacoes: observacoesHigienizacao
          };
          break;

        case 'hotelaria':
          const tipoHotelaria = document.getElementById('tipo-hotelaria')?.value;
          const detalhesHotelaria = document.getElementById('detalhes-hotelaria')?.value;
          if (!tipoHotelaria || !detalhesHotelaria) {
            throw new Error('Campos de hotelaria não preenchidos');
          }
          dadosSolicitacao = {
            ...dadosSolicitacao,
            tipo: tipoHotelaria,
            detalhes: detalhesHotelaria
          };
          break;

        default:
          throw new Error('Equipe inválida');
      }

      // Adicionar à fila de sincronização
      if (window.yunaPersistence) {
        await window.yunaPersistence.addPendingAction({
          type: 'create_solicitacao',
          data: dadosSolicitacao,
          createdAt: new Date().toISOString(),
          retries: 0
        });
      }

      // Notificar usuário
      this.showOfflineNotification(equipeSelecionada);
      
      if (window.fecharModal) {
        window.fecharModal();
      }

      console.log('[OfflineSync] ✅ Solicitação enfileirada para sync');

    } catch (error) {
      console.error('[OfflineSync] Erro ao capturar solicitação:', error);
      if (window.showToast) {
        window.showToast(
          'Erro',
          'Erro ao processar solicitação offline: ' + error.message,
          'error'
        );
      }
    }
  }

  /**
   * Mostrar notificação de solicitação offline
   */
  showOfflineNotification(tipoSolicitacao) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 400px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 999999;
      animation: slideUpIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    toast.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 0.5rem;">📵 Solicitação Enfileirada</div>
      <div style="font-size: 0.9rem; opacity: 0.95;">
        Você está offline. Sua solicitação de <strong>${tipoSolicitacao}</strong> será enviada assim que reconectar.
      </div>
      <div style="margin-top: 0.75rem; font-size: 0.85rem; opacity: 0.8;">
        ℹ️ Você pode fechar o app normalmente - enviaremos quando voltar online
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideDownOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 6000);
  }

  /**
   * Sincronizar todas as ações pendentes
   */
  async syncAllPendingActions() {
    if (this.syncInProgress || !this.isOnline) {
      console.log('[OfflineSync] Sync já em progresso ou offline');
      return;
    }

    this.syncInProgress = true;
    console.log('[OfflineSync] 🔄 Iniciando sincronização de ações pendentes');

    try {
      if (!window.yunaPersistence || !window.db || !window.currentUser) {
        console.warn('[OfflineSync] Dependências não disponíveis');
        this.syncInProgress = false;
        return;
      }

      // Obter ações pendentes
      const pendingActions = await window.yunaPersistence.getPendingActions();
      console.log('[OfflineSync] Ações pendentes encontradas:', pendingActions.length);

      if (pendingActions.length === 0) {
        console.log('[OfflineSync] Nenhuma ação pendente');
        this.syncInProgress = false;
        return;
      }

      // Sincronizar cada ação
      for (const action of pendingActions) {
        try {
          await this.syncAction(action);
          await window.yunaPersistence.markActionSynced(action.id);
          console.log('[OfflineSync] ✅ Ação sincronizada:', action.id);
        } catch (error) {
          console.error('[OfflineSync] ❌ Erro ao sincronizar ação:', action.id, error);
          // Continuar com próxima ação
        }
      }

      // Atualizar último sync time
      await window.yunaPersistence.updateLastSync();
      this.lastSyncTime = new Date();

      // Notificar sucesso
      this.showSyncCompleteNotification(pendingActions.length);

      console.log('[OfflineSync] ✅ Sincronização completa');

    } catch (error) {
      console.error('[OfflineSync] Erro geral no sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sincronizar uma ação individual
   */
  async syncAction(action) {
    console.log('[OfflineSync] Sincronizando ação:', action.type);

    switch (action.type) {
      case 'create_solicitacao':
        return await this.syncCreateSolicitacao(action);
      
      default:
        throw new Error('Tipo de ação desconhecido: ' + action.type);
    }
  }

  /**
   * Sincronizar criação de solicitação
   */
  async syncCreateSolicitacao(action) {
    const data = action.data;

    console.log('[OfflineSync] Sincronizando solicitação:', data.equipe);

    // Tentar buscar dados atualizados do usuário
    try {
      const userEmail = data.usuarioEmail;
      let usuarioAtualizado = null;

      // Buscar em usuarios_acompanhantes
      const acompSnapshot = await window.db
        .collection('usuarios_acompanhantes')
        .where('email', '==', userEmail)
        .get();

      if (!acompSnapshot.empty) {
        usuarioAtualizado = acompSnapshot.docs[0].data();
      } else {
        // Tentar em usuarios_equipe
        const equipeSnapshot = await window.db
          .collection('usuarios_equipe')
          .where('email', '==', userEmail)
          .get();

        if (!equipeSnapshot.empty) {
          usuarioAtualizado = equipeSnapshot.docs[0].data();
        }
      }

      // Atualizar dados com informações mais recentes
      if (usuarioAtualizado) {
        data.usuarioNome = usuarioAtualizado.nome || data.usuarioNome;
        data.quarto = usuarioAtualizado.quarto || data.quarto;
      }
    } catch (error) {
      console.warn('[OfflineSync] Erro ao buscar dados atualizados do usuário:', error);
      // Continuar com dados antigos
    }

    // Adicionar timestamps do servidor
    data.dataAbertura = new Date().toISOString();
    data.cronometro = {
      inicio: new Date().toISOString(),
      fim: null,
      duracao: null
    };

    // Enviar para Firestore
    const docRef = await window.db.collection('solicitacoes').add(data);

    // Registrar auditoria
    try {
      await window.db.collection('audit_logs').add({
        timestamp: new Date().toISOString(),
        userId: data.usuarioId,
        userEmail: data.usuarioEmail,
        userRole: 'acompanhante',
        action: 'create',
        resource: 'solicitacoes',
        resourceId: docRef.id,
        details: {
          after: {
            equipe: data.equipe,
            prioridade: data.prioridade,
            tipo: data.tipo
          },
          changes: ['create'],
          offline: true // Indicar que foi criada offline
        },
        metadata: {
          page: '/acompanhantes/',
          success: true,
          syncedAt: new Date().toISOString()
        }
      });
    } catch (auditError) {
      console.warn('[OfflineSync] Erro ao registrar auditoria:', auditError);
    }

    console.log('[OfflineSync] Solicitação criada no Firestore:', docRef.id);
    return docRef.id;
  }

  /**
   * Mostrar notificação de sincronização completa
   */
  showSyncCompleteNotification(count) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 400px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 999999;
      animation: slideUpIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    toast.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 0.5rem;">✅ Sincronizado com Sucesso!</div>
      <div style="font-size: 0.9rem;">
        ${count} solicitação${count > 1 ? 's' : ''} enviada${count > 1 ? 's' : ''} com sucesso.
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideDownOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Obter status de sync
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime
    };
  }
}

// Instância global
window.yunaOfflineSync = null;

/**
 * Inicializar offline sync
 */
async function initYunaOfflineSync() {
  try {
    window.yunaOfflineSync = new YunaOfflineSync();
    await window.yunaOfflineSync.init();
    console.log('[OfflineSync] ✅ Offline sync inicializado');
    return window.yunaOfflineSync;
  } catch (error) {
    console.error('[OfflineSync] ❌ Falha na inicialização:', error);
    return null;
  }
}

// Auto-iniciar após PWA persistence estar pronto
document.addEventListener('DOMContentLoaded', async () => {
  // Aguardar um pouco para persistence estar pronto
  setTimeout(initYunaOfflineSync, 1000);
});

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

  @keyframes slideDownOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
