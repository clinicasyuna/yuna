const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

const db = admin.firestore();

const PUSH_CONFIG = {
    adminUrl: process.env.YUNA_ADMIN_URL || './admin/',
    notificationWindowMinutes: 30,
    startHour: 7,
    endHour: 19,
    slaByEquipe: {
        manutencao: { minutos: 240, nome: 'Manutenção' },
        manutencao_sem_acento: { minutos: 240, nome: 'Manutenção' },
        nutricao: { minutos: 60, nome: 'Nutrição' },
        nutricao_sem_acento: { minutos: 60, nome: 'Nutrição' },
        higienizacao: { minutos: 120, nome: 'Higienização' },
        higienizacao_sem_acento: { minutos: 120, nome: 'Higienização' },
        hotelaria: { minutos: 180, nome: 'Hotelaria' }
    }
};

function normalizeEquipe(value) {
    const normalized = String(value || '').trim().toLowerCase();

    if (normalized === 'manutenção') {
        return 'manutencao';
    }

    if (normalized === 'nutrição') {
        return 'nutricao';
    }

    if (normalized === 'higienização') {
        return 'higienizacao';
    }

    return normalized;
}

function getSlaConfig(equipe) {
    const normalized = normalizeEquipe(equipe);

    return PUSH_CONFIG.slaByEquipe[normalized]
        || { minutos: 240, nome: equipe || 'Equipe' };
}

function toDate(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value.toDate === 'function') {
        const converted = value.toDate();
        return Number.isNaN(converted.getTime()) ? null : converted;
    }

    const converted = new Date(value);
    return Number.isNaN(converted.getTime()) ? null : converted;
}

function getSolicitacaoDataCriacao(solicitacao) {
    const campos = ['criadoEm', 'dataAbertura', 'timestamp', 'dataCriacao'];

    for (const campo of campos) {
        const data = toDate(solicitacao[campo]);
        if (data) {
            return data;
        }
    }

    return null;
}

function calcularMinutosOperacionais(dataInicio, dataFim) {
    if (!dataInicio || !dataFim || dataFim <= dataInicio) {
        return 0;
    }

    let totalMinutos = 0;
    let cursor = new Date(dataInicio);

    while (cursor < dataFim) {
        const proximaHora = new Date(cursor);
        proximaHora.setHours(proximaHora.getHours() + 1, 0, 0, 0);

        const limite = proximaHora < dataFim ? proximaHora : dataFim;
        const horaAtual = cursor.getHours();

        if (horaAtual >= PUSH_CONFIG.startHour && horaAtual < PUSH_CONFIG.endHour) {
            totalMinutos += (limite - cursor) / (1000 * 60);
        }

        cursor = limite;
    }

    return Math.floor(totalMinutos);
}

function shouldReceiveNotification(tokenData, solicitacao) {
    if (!tokenData || tokenData.enabled !== true) {
        return false;
    }

    if (tokenData.role === 'super_admin' || tokenData.role === 'admin') {
        return true;
    }

    if (tokenData.role === 'equipe') {
        return normalizeEquipe(tokenData.equipe) === normalizeEquipe(solicitacao.equipe);
    }

    return false;
}

function isInvalidTokenError(errorCode) {
    return [
        'messaging/invalid-registration-token',
        'messaging/registration-token-not-registered',
        'messaging/invalid-argument'
    ].includes(errorCode);
}

exports.notifyImminentSlaBreaches = functions
    .region('southamerica-east1')
    .pubsub.schedule('every 5 minutes')
    .timeZone('America/Sao_Paulo')
    .onRun(async () => {
        const [solicitacoesSnapshot, tokensSnapshot] = await Promise.all([
            db.collection('solicitacoes').where('status', 'in', ['pendente', 'em-andamento']).get(),
            db.collection('admin_push_tokens').where('enabled', '==', true).get()
        ]);

        if (solicitacoesSnapshot.empty || tokensSnapshot.empty) {
            console.log('[PUSH] Nada para processar no ciclo atual.');
            return null;
        }

        const tokensDisponiveis = tokensSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        const invalidTokens = [];
        const agora = new Date();

        for (const solicitacaoDoc of solicitacoesSnapshot.docs) {
            const solicitacao = { id: solicitacaoDoc.id, ...solicitacaoDoc.data() };
            const dataCriacao = getSolicitacaoDataCriacao(solicitacao);

            if (!dataCriacao) {
                continue;
            }

            const slaConfig = getSlaConfig(solicitacao.equipe);
            const minutosConsumidos = calcularMinutosOperacionais(dataCriacao, agora);
            const minutosRestantes = slaConfig.minutos - minutosConsumidos;

            if (minutosRestantes < 0 || minutosRestantes > PUSH_CONFIG.notificationWindowMinutes) {
                continue;
            }

            const destinatarios = tokensDisponiveis.filter((tokenData) => shouldReceiveNotification(tokenData, solicitacao));
            if (!destinatarios.length) {
                continue;
            }

            const lockRef = db.collection('sla_notification_locks').doc(`${solicitacao.id}_30min`);

            try {
                await lockRef.create({
                    solicitacaoId: solicitacao.id,
                    equipe: solicitacao.equipe || slaConfig.nome,
                    status: solicitacao.status,
                    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
                    minutosRestantes,
                    janelaMinutos: PUSH_CONFIG.notificationWindowMinutes
                });
            } catch (error) {
                if (error.code === 6 || error.code === 'already-exists') {
                    continue;
                }

                throw error;
            }

            const tokens = destinatarios.map((item) => item.token).filter(Boolean);
            if (!tokens.length) {
                await lockRef.delete();
                continue;
            }

            try {
                const response = await admin.messaging().sendEachForMulticast({
                    tokens,
                    notification: {
                        title: 'SLA em risco',
                        body: `${slaConfig.nome}: restam ${Math.max(0, Math.ceil(minutosRestantes))} min para a solicitação ${solicitacao.id}.`
                    },
                    data: {
                        url: PUSH_CONFIG.adminUrl,
                        tag: `sla-${solicitacao.id}`,
                        requireInteraction: 'true'
                    }
                });

                console.log(`[PUSH] Notificações de SLA enviadas: ${response.successCount} sucesso, ${response.failureCount} falhas`);

                // Remover tokens inválidos
                response.responses.forEach((resp, idx) => {
                    if (!resp.success && isInvalidTokenError(resp.error?.code)) {
                        invalidTokens.push(destinatarios[idx].id);
                    }
                });
            } catch (error) {
                console.error('[PUSH] Erro ao enviar notificações:', error);
            }

            // Limpar tokens inválidos
            for (const tokenId of invalidTokens) {
                try {
                    await db.collection('admin_push_tokens').doc(tokenId).delete();
                } catch (error) {
                    console.warn('[PUSH] Erro ao deletar token:', error);
                }
            }
        }

        return null;
    });

/**
 * 🚀 PHASE 3: NOTIFICAÇÕES DE STATUS CHANGE
 * 
 * Monitorar mudanças de status em solicitações e notificar acompanhantes
 * Estados monitorados: pendente → em-andamento → finalizada
 */
exports.notifyStatusChange = functions
    .region('southamerica-east1')
    .firestore
    .document('solicitacoes/{solicitacaoId}')
    .onUpdate(async (change, context) => {
        try {
            const before = change.before.data();
            const after = change.after.data();
            const solicitacaoId = context.params.solicitacaoId;

            // Verificar se status mudou
            if (before.status === after.status) {
                return null;
            }

            console.log(`[NOTIFY] Status mudou: ${before.status} → ${after.status} (${solicitacaoId})`);

            // Obter token do acompanhante
            const userEmail = after.usuarioEmail || after.userEmail;
            if (!userEmail) {
                console.warn('[NOTIFY] Email do usuário não encontrado');
                return null;
            }

            // Buscar documentos push token do acompanhante
            const tokensSnapshot = await db
                .collection('acompanhantes_push_tokens')
                .where('email', '==', userEmail)
                .where('enabled', '==', true)
                .get();

            if (tokensSnapshot.empty) {
                console.log('[NOTIFY] Nenhum token encontrado para:', userEmail);
                return null;
            }

            const tokens = tokensSnapshot.docs
                .map(doc => doc.data().token)
                .filter(Boolean);

            if (!tokens.length) {
                return null;
            }

            // Montar notificação baseada no novo status
            let notification = {};
            let notificationData = {
                solicitacaoId: solicitacaoId,
                statusAnterior: before.status,
                statusNovo: after.status,
                url: `/?solicitacao=${solicitacaoId}`
            };

            switch (after.status) {
                case 'em-andamento':
                    notification = {
                        title: '👷 Equipe começou a atender',
                        body: `Sua solicitação de ${after.tipo || 'serviço'} está sendo atendida.`
                    };
                    notificationData.action = 'view_status';
                    break;

                case 'finalizada':
                    notification = {
                        title: '✅ Serviço Finalizado!',
                        body: `Sua solicitação de ${after.tipo || 'serviço'} foi concluída. Clique para avaliar.`,
                        requireInteraction: 'true'
                    };
                    notificationData.action = 'avaliar';
                    break;

                case 'cancelada':
                    notification = {
                        title: '❌ Solicitação Cancelada',
                        body: `Sua solicitação de ${after.tipo || 'serviço'} foi cancelada.`
                    };
                    break;

                default:
                    return null;
            }

            // Enviar notificações
            const response = await admin.messaging().sendEachForMulticast({
                tokens,
                notification,
                data: notificationData,
                webpush: {
                    fcmOptions: {
                        link: notificationData.url
                    }
                }
            });

            console.log(`[NOTIFY] Status ${after.status}: ${response.successCount} enviadas, ${response.failureCount} falhas`);

            // Limpar tokens inválidos
            response.responses.forEach((resp, idx) => {
                if (!resp.success && isInvalidTokenError(resp.error?.code)) {
                    tokensSnapshot.docs[idx].ref.delete().catch(err => {
                        console.warn('[NOTIFY] Erro ao deletar token:', err);
                    });
                }
            });

            return null;

        } catch (error) {
            console.error('[NOTIFY] Erro ao processar mudança de status:', error);
            return null;
        }
    });

/**
 * 🚀 PHASE 3: NOTIFICAÇÕES DE PAUSA DE SLA
 * 
 * Notificar acompanhantes quando SLA é pausado ou retomado
 */
exports.notifySLAPause = functions
    .region('southamerica-east1')
    .firestore
    .document('solicitacoes/{solicitacaoId}')
    .onUpdate(async (change, context) => {
        try {
            const before = change.before.data();
            const after = change.after.data();
            const solicitacaoId = context.params.solicitacaoId;

            // Verificar se slaEmPausa mudou
            const pausouAgora = !before.slaEmPausa && after.slaEmPausa;
            const retomouAgora = before.slaEmPausa && !after.slaEmPausa;

            if (!pausouAgora && !retomouAgora) {
                return null;
            }

            console.log(`[PAUSE-NOTIFY] SLA ${pausouAgora ? 'pausado' : 'retomado'}: ${solicitacaoId}`);

            // Obter email do acompanhante
            const userEmail = after.usuarioEmail || after.userEmail;
            if (!userEmail) {
                console.warn('[PAUSE-NOTIFY] Email do usuário não encontrado');
                return null;
            }

            // Buscar tokens do acompanhante
            const tokensSnapshot = await db
                .collection('acompanhantes_push_tokens')
                .where('email', '==', userEmail)
                .where('enabled', '==', true)
                .get();

            if (tokensSnapshot.empty) {
                return null;
            }

            const tokens = tokensSnapshot.docs
                .map(doc => doc.data().token)
                .filter(Boolean);

            if (!tokens.length) {
                return null;
            }

            // Montar notificação
            let notification = {};
            let notificationData = {
                solicitacaoId: solicitacaoId,
                url: `/?solicitacao=${solicitacaoId}`
            };

            if (pausouAgora) {
                const motivo = after.pausaAtiva?.motivo || 'Ajuste operacional';
                notification = {
                    title: '⏸️ Atendimento em Pausa',
                    body: `Motivo: ${motivo.substring(0, 60)}...`,
                    requireInteraction: 'true'
                };
                notificationData.action = 'view_pause';
            } else {
                notification = {
                    title: '▶️ Atendimento Retomado',
                    body: 'Sua solicitação voltou à fila de atendimento.'
                };
                notificationData.action = 'view_status';
            }

            // Enviar notificações
            const response = await admin.messaging().sendEachForMulticast({
                tokens,
                notification,
                data: notificationData
            });

            console.log(`[PAUSE-NOTIFY] Notificações enviadas: ${response.successCount} sucesso, ${response.failureCount} falhas`);

            // Limpar tokens inválidos
            response.responses.forEach((resp, idx) => {
                if (!resp.success && isInvalidTokenError(resp.error?.code)) {
                    tokensSnapshot.docs[idx].ref.delete().catch(err => {
                        console.warn('[PAUSE-NOTIFY] Erro ao deletar token:', err);
                    });
                }
            });

            return null;

        } catch (error) {
            console.error('[PAUSE-NOTIFY] Erro ao processar pausa de SLA:', error);
            return null;
        }
    });

/**
 * 🚀 PHASE 3: NOTIFICAÇÕES DE PESQUISA DE SATISFAÇÃO
 * 
 * Notificar acompanhantes 7 dias após solicitação finalizada para avaliar
 */
exports.notifySatisfactionSurvey = functions
    .region('southamerica-east1')
    .pubsub
    .schedule('every 24 hours')
    .timeZone('America/Sao_Paulo')
    .onRun(async () => {
        try {
            const agora = new Date();
            const seteDialsAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

            // Buscar solicitações finalizadas há ~7 dias e ainda não avaliadas
            const solicitacoesSnapshot = await db
                .collection('solicitacoes')
                .where('status', '==', 'finalizada')
                .where('avaliada', '==', false)
                .where('finalizadoEm', '<=', admin.firestore.Timestamp.fromDate(agora))
                .where('finalizadoEm', '>=', admin.firestore.Timestamp.fromDate(seteDialsAtras))
                .get();

            console.log(`[SURVEY-NOTIFY] Encontradas ${solicitacoesSnapshot.size} solicitações para avaliar`);

            for (const solicitacaoDoc of solicitacoesSnapshot.docs) {
                const solicitacao = { id: solicitacaoDoc.id, ...solicitacaoDoc.data() };
                const userEmail = solicitacao.usuarioEmail || solicitacao.userEmail;

                if (!userEmail) {
                    continue;
                }

                try {
                    // Buscar tokens do acompanhante
                    const tokensSnapshot = await db
                        .collection('acompanhantes_push_tokens')
                        .where('email', '==', userEmail)
                        .where('enabled', '==', true)
                        .get();

                    if (tokensSnapshot.empty) {
                        continue;
                    }

                    const tokens = tokensSnapshot.docs
                        .map(doc => doc.data().token)
                        .filter(Boolean);

                    if (!tokens.length) {
                        continue;
                    }

                    // Enviar notificação de pesquisa
                    const response = await admin.messaging().sendEachForMulticast({
                        tokens,
                        notification: {
                            title: '⭐ Sua opinião é importante!',
                            body: 'Como foi sua experiência? Avalie o serviço em menos de 1 minuto.',
                            requireInteraction: 'true'
                        },
                        data: {
                            solicitacaoId: solicitacao.id,
                            action: 'avaliar',
                            url: `/?solicitacao=${solicitacao.id}&avaliar=true`
                        }
                    });

                    console.log(`[SURVEY-NOTIFY] Pesquisa enviada para ${solicitacao.id}: ${response.successCount} sucesso`);

                } catch (error) {
                    console.error(`[SURVEY-NOTIFY] Erro ao notificar ${userEmail}:`, error);
                }
            }

            return null;

        } catch (error) {
            console.error('[SURVEY-NOTIFY] Erro geral:', error);
            return null;
        }
    });
                        equipe: String(solicitacao.equipe || slaConfig.nome),
                        solicitacaoId: String(solicitacao.id),
                        minutosRestantes: String(Math.max(0, Math.ceil(minutosRestantes)))
                    },
                    webpush: {
                        notification: {
                            icon: './favicon.ico',
                            badge: './favicon.ico',
                            tag: `sla-${solicitacao.id}`,
                            requireInteraction: true
                        }
                    }
                });

                response.responses.forEach((result, index) => {
                    if (!result.success && isInvalidTokenError(result.error?.code)) {
                        invalidTokens.push(destinatarios[index].id);
                    }
                });

                await lockRef.set({
                    enviadoEm: admin.firestore.FieldValue.serverTimestamp(),
                    enviados: response.successCount,
                    falhas: response.failureCount
                }, { merge: true });

                console.log('[PUSH] Notificação SLA enviada:', {
                    solicitacaoId: solicitacao.id,
                    equipe: slaConfig.nome,
                    enviados: response.successCount,
                    falhas: response.failureCount
                });
            } catch (error) {
                console.error('[PUSH] Falha ao enviar notificação de SLA:', error);
                await lockRef.delete();
            }
        }

        if (invalidTokens.length) {
            const batch = db.batch();

            invalidTokens.forEach((docId) => {
                batch.delete(db.collection('admin_push_tokens').doc(docId));
            });

            await batch.commit();
        }

        return null;
    });