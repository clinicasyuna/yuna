/**
 * SISTEMA DE PAUSA DE SLA - Yuna Solicite
 * ==========================================
 * 
 * Permite que equipes pausem o SLA quando aguardando recursos externos
 * (peças, informações, etc). O tempo em pausa NÃO conta para o SLA.
 * 
 * Funcionalidades:
 * - Pausar/retomar SLA durante atendimento
 * - Registrar motivo da pausa
 * - Notificar acompanhante
 * - Calcular SLA excluindo tempo em pausa
 * - Histórico completo de pausas/retomadas
 */

// ===== ESTRUTURA DE DADOS =====
const SLA_PAUSE_STRUCTURE = {
    slaEmPausa: false,                    // boolean: SLA está em pausa?
    pausaAtiva: null,                     // {motivo, dataInicio, usuario}
    historicopausas: [                    // array de pausas completadas
        // {motivo, dataInicio, dataFim, duracao (min), usuario, email}
    ],
    tempoTotalEmPausa: 0                  // total acumulado em minutos
};

/**
 * PAUSAR SLA
 * Pausa o cronômetro de SLA registrando motivo e usuário
 */
async function pausarSLA(solicitacaoId, motivo, usuario) {
    try {
        if (!solicitacaoId || !motivo || !usuario) {
            throw new Error('Parâmetros obrigatórios faltando');
        }

        const doc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!doc.exists) throw new Error('Solicitação não encontrada');

        const solicitacao = doc.data();

        // Validações
        if (solicitacao.status !== 'em-andamento') {
            throw new Error('Só é possível pausar SLA de solicitações em andamento');
        }

        if (solicitacao.slaEmPausa) {
            throw new Error('SLA já está em pausa. Retome antes de pausar novamente');
        }

        // Nova pausa
        const agora = new Date();
        const pausaAtiva = {
            motivo: motivo.trim(),
            dataInicio: agora.toISOString(),
            usuario: usuario.uid || usuario,
            email: usuario.email || '',
            timestamp: window.firebase.firestore.Timestamp.now()
        };

        // Atualizar solicitação
        const updateData = {
            slaEmPausa: true,
            pausaAtiva: pausaAtiva,
            ultimaAtualizacao: agora.toISOString(),
            motivoPausa: motivo // Para referência rápida
        };

        await window.db.collection('solicitacoes').doc(solicitacaoId).update(updateData);

        // Registrar auditoria
        await registrarAcaoAuditoria({
            action: 'pause_sla',
            resource: 'solicitacoes',
            resourceId: solicitacaoId,
            success: true,
            details: {
                motivo: motivo,
                equipe: solicitacao.equipe,
                usuario: usuario.email || usuario.uid
            }
        });

        console.log('[SLA] ⏸️ SLA pausado:', {
            id: solicitacaoId,
            motivo: motivo,
            usuario: usuario.email
        });

        return {
            success: true,
            mensagem: 'SLA pausado com sucesso',
            pausa: pausaAtiva
        };
    } catch (error) {
        console.error('[SLA PAUSE ERROR]', error);
        throw error;
    }
}

/**
 * RETOMAR SLA
 * Retoma o cronômetro de SLA e registra o tempo em pausa
 */
async function retomarSLA(solicitacaoId, usuario) {
    try {
        if (!solicitacaoId) {
            throw new Error('ID da solicitação obrigatório');
        }

        const doc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!doc.exists) throw new Error('Solicitação não encontrada');

        const solicitacao = doc.data();

        // Validações
        if (solicitacao.status !== 'em-andamento') {
            throw new Error('Só é possível retomar SLA de solicitações em andamento');
        }

        if (!solicitacao.slaEmPausa || !solicitacao.pausaAtiva) {
            throw new Error('SLA não está em pausa. Não há nada a retomar');
        }

        // Calcular duração da pausa
        const inicioStr = solicitacao.pausaAtiva.dataInicio;
        const inicioDate = new Date(inicioStr);
        const agora = new Date();
        const duracaoMinutos = Math.round((agora - inicioDate) / (1000 * 60));

        // Construir pausa completada
        const pausaCompletada = {
            ...solicitacao.pausaAtiva,
            dataFim: agora.toISOString(),
            duracao: duracaoMinutos
        };

        // Atualizar solicitação
        const historicoAtualizado = [
            ...(solicitacao.historicopauas || []),
            pausaCompletada
        ];

        const tempoEmPausaAtualizado = (solicitacao.tempoTotalEmPausa || 0) + duracaoMinutos;

        const updateData = {
            slaEmPausa: false,
            pausaAtiva: null,
            historicopauas: historicoAtualizado,
            tempoTotalEmPausa: tempoEmPausaAtualizado,
            ultimaAtualizacao: agora.toISOString(),
            motivoPausa: null
        };

        await window.db.collection('solicitacoes').doc(solicitacaoId).update(updateData);

        // Registrar auditoria
        await registrarAcaoAuditoria({
            action: 'resume_sla',
            resource: 'solicitacoes',
            resourceId: solicitacaoId,
            success: true,
            details: {
                duracao: duracaoMinutos,
                motivo: solicitacao.pausaAtiva.motivo,
                equipe: solicitacao.equipe,
                usuario: usuario.email || usuario.uid
            }
        });

        console.log('[SLA] ▶️ SLA retomado:', {
            id: solicitacaoId,
            duracao: `${duracaoMinutos} min`,
            usuario: usuario.email
        });

        return {
            success: true,
            mensagem: 'SLA retomado com sucesso',
            duracaoPausa: duracaoMinutos,
            pausaCompletada: pausaCompletada
        };
    } catch (error) {
        console.error('[SLA RESUME ERROR]', error);
        throw error;
    }
}

/**
 * CALCULAR TEMPO SLA EFETIVO
 * Retorna o tempo passado EXCLUINDO pausas
 */
function calcularTempoSLAEfetivo(solicitacao, dataAtual = new Date()) {
    try {
        if (!solicitacao.criadoEm) return 0;

        const dataInicio = solicitacao.criadoEm instanceof Date 
            ? solicitacao.criadoEm 
            : new Date(solicitacao.criadoEm);

        // Calcular tempo total
        let tempoTotal = Math.round((dataAtual - dataInicio) / (1000 * 60));

        // Subtrair pausas completadas
        const tempoEmPausa = solicitacao.tempoTotalEmPausa || 0;
        const tempoEfetivo = Math.max(0, tempoTotal - tempoEmPausa);

        return tempoEfetivo;
    } catch (error) {
        console.error('[SLA CALC ERROR]', error);
        return 0;
    }
}

/**
 * VERIFICAR STATUS SLA
 * Retorna se o SLA foi cumprido levando em conta pausas
 */
function verificarStatusSLAComPausa(solicitacao, slaLimiteMinutos = 240) {
    try {
        const tempoEfetivo = calcularTempoSLAEfetivo(solicitacao);
        const cumprido = tempoEfetivo <= slaLimiteMinutos;
        const percentual = slaLimiteMinutos > 0 
            ? Math.round((tempoEfetivo / slaLimiteMinutos) * 100) 
            : 0;

        return {
            cumprido: cumprido,
            status: cumprido ? 'cumprido' : 'violado',
            tempoEfetivo: tempoEfetivo,
            tempoEmPausa: solicitacao.tempoTotalEmPausa || 0,
            slaLimite: slaLimiteMinutos,
            percentual: percentual,
            emPausa: solicitacao.slaEmPausa || false,
            motipoPausa: solicitacao.motivoPausa || null
        };
    } catch (error) {
        console.error('[SLA STATUS ERROR]', error);
        return {
            cumprido: false,
            status: 'erro',
            tempoEfetivo: 0,
            tempoEmPausa: 0,
            slaLimite: slaLimiteMinutos,
            percentual: 0,
            emPausa: false
        };
    }
}

/**
 * GERAR HTML DO STATUS DE PAUSA
 * Exibe visualmente o estado de pausa
 */
function gerarHTMLStatusPausa(solicitacao) {
    const temPausa = solicitacao.slaEmPausa;
    const temHistorico = (solicitacao.historicopauas && solicitacao.historicopauas.length > 0);

    let html = '';

    // Status atual de pausa
    if (temPausa && solicitacao.pausaAtiva) {
        const pausa = solicitacao.pausaAtiva;
        const inicioStr = pausa.dataInicio;
        const inicio = new Date(inicioStr);
        const agora = new Date();
        const duracao = Math.round((agora - inicio) / (1000 * 60));

        html += `
            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">⏸️</span>
                    <strong style="color: #d97706;">SLA EM PAUSA</strong>
                </div>
                <div style="font-size: 13px; color: #92400e; line-height: 1.6;">
                    <div><strong>Motivo:</strong> ${pausa.motivo}</div>
                    <div><strong>Pausado por:</strong> ${pausa.email || pausa.usuario}</div>
                    <div><strong>Duração:</strong> ${duracao} minutos (desde ${inicio.toLocaleTimeString('pt-BR')})</div>
                </div>
            </div>
        `;
    }

    // Histórico de pausas
    if (temHistorico) {
        html += `
            <div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; margin-top: 12px;">
                <strong style="color: #374151; display: block; margin-bottom: 8px;">📋 Histórico de Pausas</strong>
                <div style="font-size: 12px; color: #6b7280; max-height: 200px; overflow-y: auto;">
        `;

        solicitacao.historicopauas.forEach((pausa, idx) => {
            const inicio = new Date(pausa.dataInicio);
            const fim = new Date(pausa.dataFim);
            html += `
                <div style="padding: 8px; border-bottom: 1px solid #e5e7eb; margin-bottom: 8px;">
                    <div><strong>#${idx + 1}</strong> - ${pausa.duracao} min (${pausa.motivo})</div>
                    <div>${inicio.toLocaleString('pt-BR')} até ${fim.toLocaleTimeString('pt-BR')}</div>
                    <div style="color: #9ca3af;">Por: ${pausa.email || pausa.usuario}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        // Total em pausa
        const totalPausa = solicitacao.tempoTotalEmPausa || 0;
        html += `
            <div style="margin-top: 8px; padding: 8px; background: #e0f2fe; border-left: 3px solid #0284c7; color: #0c4a6e;">
                <strong>⏱️ Total em pausa:</strong> ${totalPausa} minutos
            </div>
        `;
    }

    return html;
}

/**
 * MODAL DE PAUSA DE SLA
 * Exibe formulário para pausar SLA
 */
function abrirModalPausarSLA(solicitacaoId, equipe) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: #1f2937;">⏸️ Pausar SLA</h3>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; color: #92400e;">
                <strong>ℹ️</strong> Enquanto o SLA estiver pausado, o tempo NÃO será contado. O acompanhante será notificado do motivo.
            </div>

            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">Motivo da Pausa:</label>
                <textarea id="motivo-pausa" placeholder="Ex: Aguardando chegada de peça reservada\nAguardando aprovação do gerente\nAguardando contato do acompanhante" 
                    style="width: 100%; min-height: 100px; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; font-size: 14px; resize: none;">
                </textarea>
                <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Mínimo 10 caracteres</div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="this.closest('.modal').remove()" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                    Cancelar
                </button>
                <button onclick="executarPausarSLA('${solicitacaoId}', '${equipe}')" style="background: #f59e0b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                    ⏸️ Pausar SLA
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.getElementById('motivo-pausa')?.focus();
}

/**
 * EXECUTAR PAUSA DE SLA
 * Valida e executa a pausa
 */
async function executarPausarSLA(solicitacaoId, equipe) {
    try {
        const motivo = document.getElementById('motivo-pausa')?.value?.trim();

        if (!motivo || motivo.length < 10) {
            showToast('Aviso', 'Digite um motivo com pelo menos 10 caracteres', 'warning');
            return;
        }

        if (!window.auth.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const resultado = await pausarSLA(solicitacaoId, motivo, window.auth.currentUser);

        showToast('Sucesso', 'SLA pausado com sucesso! ⏸️', 'success');

        // Fechar modal
        document.querySelector('.modal')?.remove();

        // Recarregar dados (se implementado refresh de solicitação)
        if (typeof carregarSolicitacoes === 'function') {
            carregarSolicitacoes();
        }

    } catch (error) {
        console.error('[PAUSA ERROR]', error);
        showToast('Erro', error.message || 'Erro ao pausar SLA', 'error');
    }
}

/**
 * EXECUTAR RETOMAR SLA
 */
async function executarRetomarSLA(solicitacaoId) {
    try {
        if (!window.auth.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const resultado = await retomarSLA(solicitacaoId, window.auth.currentUser);

        showToast(
            'Sucesso',
            `SLA retomado! A pausa durou ${resultado.duracaoPausa} minutos. ▶️`,
            'success'
        );

        // Recarregar dados
        if (typeof carregarSolicitacoes === 'function') {
            carregarSolicitacoes();
        }

    } catch (error) {
        console.error('[RESUME ERROR]', error);
        showToast('Erro', error.message || 'Erro ao retomar SLA', 'error');
    }
}

// Expor funções globalmente
window.pausarSLA = pausarSLA;
window.retomarSLA = retomarSLA;
window.calcularTempoSLAEfetivo = calcularTempoSLAEfetivo;
window.verificarStatusSLAComPausa = verificarStatusSLAComPausa;
window.gerarHTMLStatusPausa = gerarHTMLStatusPausa;
window.abrirModalPausarSLA = abrirModalPausarSLA;
window.executarPausarSLA = executarPausarSLA;
window.executarRetomarSLA = executarRetomarSLA;

console.log('✅ Sistema de Pausa de SLA carregado com sucesso');
