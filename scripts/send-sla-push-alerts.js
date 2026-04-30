/*
 * Envia notificações push de SLA em risco (janela de 30 minutos)
 * sem depender de Cloud Functions (útil para projeto Firebase no plano Spark).
 */

const admin = require('firebase-admin');

const PUSH_CONFIG = {
    adminUrl: process.env.YUNA_ADMIN_URL || 'https://clinicasyuna.github.io/yuna/admin/',
    notificationWindowMinutes: 30,
    startHour: 7,
    endHour: 19
};

const SLA_BY_EQUIPE = {
    manutencao: { minutos: 240, nome: 'Manutenção' },
    nutricao: { minutos: 60, nome: 'Nutrição' },
    higienizacao: { minutos: 120, nome: 'Higienização' },
    hotelaria: { minutos: 180, nome: 'Hotelaria' }
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
    return SLA_BY_EQUIPE[normalized] || { minutos: 240, nome: equipe || 'Equipe' };
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
    const fields = ['criadoEm', 'dataAbertura', 'timestamp', 'dataCriacao'];

    for (const field of fields) {
        const parsed = toDate(solicitacao[field]);
        if (parsed) {
            return parsed;
        }
    }

    return null;
}

function calcularMinutosOperacionais(dataInicio, dataFim) {
    if (!dataInicio || !dataFim || dataFim <= dataInicio) {
        return 0;
    }

    let total = 0;
    let cursor = new Date(dataInicio);

    while (cursor < dataFim) {
        const endHour = new Date(cursor);
        endHour.setHours(endHour.getHours() + 1, 0, 0, 0);

        const limit = endHour < dataFim ? endHour : dataFim;
        const hour = cursor.getHours();

        if (hour >= PUSH_CONFIG.startHour && hour < PUSH_CONFIG.endHour) {
            total += (limit - cursor) / (1000 * 60);
        }

        cursor = limit;
    }

    return Math.floor(total);
}

function shouldReceiveNotification(tokenData, solicitacao) {
    if (!tokenData || tokenData.enabled !== true || !tokenData.token) {
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
        'messaging/registration-token-not-registered',
        'messaging/invalid-registration-token',
        'messaging/invalid-argument'
    ].includes(errorCode);
}

function initFirebaseAdmin() {
    if (admin.apps.length) {
        return;
    }

    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (json) {
        const serviceAccount = JSON.parse(json);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        return;
    }

    const localServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '../firebase-service-account.json';
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const serviceAccount = require(localServiceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function run() {
    initFirebaseAdmin();

    const db = admin.firestore();

    const [solicitacoesSnapshot, tokensSnapshot] = await Promise.all([
        db.collection('solicitacoes').where('status', 'in', ['pendente', 'em-andamento']).get(),
        db.collection('admin_push_tokens').where('enabled', '==', true).get()
    ]);

    if (solicitacoesSnapshot.empty || tokensSnapshot.empty) {
        console.log('[SLA-PUSH] Sem solicitações ou sem tokens ativos.');
        return;
    }

    const tokens = tokensSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const invalidTokens = [];
    const now = new Date();

    for (const doc of solicitacoesSnapshot.docs) {
        const solicitacao = { id: doc.id, ...doc.data() };
        const createdAt = getSolicitacaoDataCriacao(solicitacao);

        if (!createdAt) {
            continue;
        }

        const slaConfig = getSlaConfig(solicitacao.equipe);
        const elapsed = calcularMinutosOperacionais(createdAt, now);
        const remaining = slaConfig.minutos - elapsed;

        if (remaining < 0 || remaining > PUSH_CONFIG.notificationWindowMinutes) {
            continue;
        }

        const destinatarios = tokens.filter((tokenData) => shouldReceiveNotification(tokenData, solicitacao));
        if (!destinatarios.length) {
            continue;
        }

        const lockRef = db.collection('sla_notification_locks').doc(`${solicitacao.id}_30min`);

        try {
            await lockRef.create({
                solicitacaoId: solicitacao.id,
                equipe: solicitacao.equipe || slaConfig.nome,
                status: solicitacao.status,
                janelaMinutos: PUSH_CONFIG.notificationWindowMinutes,
                minutosRestantes: Math.max(0, Math.ceil(remaining)),
                criadoEm: admin.firestore.FieldValue.serverTimestamp(),
                source: 'github-actions'
            });
        } catch (error) {
            if (error.code === 6 || error.code === 'already-exists') {
                continue;
            }

            throw error;
        }

        try {
            const response = await admin.messaging().sendEachForMulticast({
                tokens: destinatarios.map((item) => item.token),
                notification: {
                    title: 'SLA em risco',
                    body: `${slaConfig.nome}: restam ${Math.max(0, Math.ceil(remaining))} min para a solicitação ${solicitacao.id}.`
                },
                data: {
                    url: PUSH_CONFIG.adminUrl,
                    tag: `sla-${solicitacao.id}`,
                    solicitacaoId: String(solicitacao.id),
                    equipe: String(solicitacao.equipe || slaConfig.nome),
                    minutosRestantes: String(Math.max(0, Math.ceil(remaining)))
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

            console.log('[SLA-PUSH] Notificação enviada:', {
                solicitacaoId: solicitacao.id,
                equipe: slaConfig.nome,
                enviados: response.successCount,
                falhas: response.failureCount
            });
        } catch (error) {
            console.error('[SLA-PUSH] Falha no envio de push:', error.message);
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

    console.log('[SLA-PUSH] Execução finalizada.');
}

run().catch((error) => {
    console.error('[SLA-PUSH] Execução abortada:', error);
    process.exitCode = 1;
});
