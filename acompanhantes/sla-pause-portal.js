/**
 * SLA PAUSE - INTEGRAÇÃO PORTAL DE ACOMPANHANTES
 * ===============================================
 * 
 * Exibe ao acompanhante quando o SLA de sua solicitação está pausado
 * e o motivo da pausa.
 */

/**
 * Formatar status de pausa para exibição no portal
 */
function formatarStatusPausaParaPortal(solicitacao) {
    if (!solicitacao.slaEmPausa || !solicitacao.pausaAtiva) {
        return '';
    }

    const pausa = solicitacao.pausaAtiva;
    const inicioStr = pausa.dataInicio;
    const inicio = new Date(inicioStr);
    const agora = new Date();
    const duracao = Math.round((agora - inicio) / (1000 * 60));

    return `
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); 
                    border: 2px solid #f59e0b; 
                    border-radius: 12px; 
                    padding: 16px; 
                    margin: 16px 0;
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="font-size: 28px; line-height: 1;">⏸️</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #d97706; font-size: 16px; margin-bottom: 4px;">
                        Atendimento em Pausa
                    </div>
                    <div style="color: #92400e; font-size: 14px; line-height: 1.6;">
                        <div style="margin-bottom: 8px;">
                            <strong>Motivo da pausa:</strong>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.7); 
                                    padding: 8px 12px; 
                                    border-radius: 6px;
                                    border-left: 3px solid #d97706;
                                    margin-bottom: 8px;">
                            ${pausa.motivo}
                        </div>
                        <div style="font-size: 12px; color: #b45309;">
                            Pausado há ${duracao} minuto${duracao !== 1 ? 's' : ''}
                            ${pausa.email ? `pela equipe de ${pausa.email.split('@')[0]}` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Adicionar indicador de pausa ao card de solicitação
 */
function adicionarIndicadorPausaCard(elementoCard, solicitacao) {
    if (!elementoCard || !solicitacao.slaEmPausa) return;

    // Procurar por badge de status ou criar um
    let badge = elementoCard.querySelector('[data-status-badge]');
    
    if (!badge) {
        badge = document.createElement('div');
        badge.setAttribute('data-status-badge', 'true');
        badge.style.position = 'absolute';
        badge.style.top = '8px';
        badge.style.right = '8px';
        elementoCard.style.position = 'relative';
        elementoCard.appendChild(badge);
    }

    badge.innerHTML = `
        <div style="background: #f59e0b; 
                    color: white; 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-size: 11px; 
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;">
            <span>⏸️</span>
            <span>SLA Pausado</span>
        </div>
    `;
}

/**
 * Notificar acompanhante sobre pausa de SLA
 */
function notificarPausaSLA(solicitacaoId, motivo, emailEquipe) {
    try {
        // Tentar usar a função showToast se disponível
        if (typeof showToast === 'function') {
            showToast(
                '⏸️ Atendimento Pausado',
                `Motivo: ${motivo}`,
                'warning',
                7000
            );
        }

        // Log para análise
        console.log('[SLA PAUSE] Notificação ao acompanhante:', {
            solicitacao: solicitacaoId,
            motivo: motivo,
            equipe: emailEquipe,
            timestamp: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('[SLA PAUSE NOTIFY ERROR]', error);
        return false;
    }
}

/**
 * Ouvir mudanças de pausa em tempo real (para portal de acompanhantes)
 */
function ouvirPausaSLA(solicitacaoId, callbackOnChange) {
    try {
        if (!window.db || !solicitacaoId) return null;

        const unsubscribe = window.db
            .collection('solicitacoes')
            .doc(solicitacaoId)
            .onSnapshot(snapshot => {
                const solicitacao = snapshot.data();

                if (!solicitacao) return;

                // Verificar mudança de estado de pausa
                const agora = new Date();
                const estadoPausa = {
                    emPausa: solicitacao.slaEmPausa,
                    motivo: solicitacao.motivoPausa,
                    dataAtual: agora.toISOString()
                };

                if (typeof callbackOnChange === 'function') {
                    callbackOnChange(estadoPausa, solicitacao);
                }

                // Log
                if (solicitacao.slaEmPausa) {
                    console.log('[SLA] Solicitação em pausa:', {
                        id: solicitacaoId,
                        motivo: solicitacao.motivoPausa
                    });
                } else if (solicitacao.historicopauas && solicitacao.historicopauas.length > 0) {
                    const ultimaPausa = solicitacao.historicopauas[solicitacao.historicopauas.length - 1];
                    console.log('[SLA] Última pausa:', {
                        id: solicitacaoId,
                        duracao: ultimaPausa.duracao,
                        motivo: ultimaPausa.motivo
                    });
                }
            }, error => {
                console.error('[SLA LISTENER ERROR]', error);
                if (typeof callbackOnChange === 'function') {
                    callbackOnChange({ erro: true, mensagem: error.message });
                }
            });

        return unsubscribe;
    } catch (error) {
        console.error('[SLA LISTENER SETUP ERROR]', error);
        return null;
    }
}

// Expor funções globalmente
window.formatarStatusPausaParaPortal = formatarStatusPausaParaPortal;
window.adicionarIndicadorPausaCard = adicionarIndicadorPausaCard;
window.notificarPausaSLA = notificarPausaSLA;
window.ouvirPausaSLA = ouvirPausaSLA;

console.log('✅ Integração de Pausa SLA para Portal carregada com sucesso');
