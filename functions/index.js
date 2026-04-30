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