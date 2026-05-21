const admin = require('firebase-admin');
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

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

const EMAIL_ALERT_CONFIG = {
    enabled: String(process.env.SLA_EMAIL_ENABLED || 'true').toLowerCase() !== 'false',
    smtpHost: process.env.SLA_SMTP_HOST || '',
    smtpPort: Number(process.env.SLA_SMTP_PORT || 465),
    smtpSecure: String(process.env.SLA_SMTP_SECURE || 'true').toLowerCase() !== 'false',
    smtpUser: process.env.SLA_SMTP_USER || '',
    smtpPass: process.env.SLA_SMTP_PASS || '',
    from: process.env.SLA_EMAIL_FROM || process.env.SLA_SMTP_USER || '',
    adminUrl: process.env.YUNA_ADMIN_URL || 'https://clinicasyuna.github.io/yuna/admin/',
    notificationWindowMinutes: Number(process.env.SLA_EMAIL_WINDOW_MINUTES || 30)
};

let emailTransporter = null;

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

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeText(value) {
    return String(value || '').trim();
}

function getEmailTransporter() {
    if (!EMAIL_ALERT_CONFIG.enabled) {
        return null;
    }

    if (emailTransporter) {
        return emailTransporter;
    }

    if (!EMAIL_ALERT_CONFIG.smtpHost || !EMAIL_ALERT_CONFIG.smtpUser || !EMAIL_ALERT_CONFIG.smtpPass) {
        console.warn('[SLA-EMAIL] SMTP não configurado. Defina SLA_SMTP_HOST, SLA_SMTP_USER e SLA_SMTP_PASS.');
        return null;
    }

    emailTransporter = nodemailer.createTransport({
        host: EMAIL_ALERT_CONFIG.smtpHost,
        port: EMAIL_ALERT_CONFIG.smtpPort,
        secure: EMAIL_ALERT_CONFIG.smtpSecure,
        auth: {
            user: EMAIL_ALERT_CONFIG.smtpUser,
            pass: EMAIL_ALERT_CONFIG.smtpPass
        }
    });

    return emailTransporter;
}

function addEmailToSet(set, value) {
    const email = normalizeEmail(value);
    if (!email || !email.includes('@')) {
        return;
    }

    set.add(email);
}

async function carregarDestinatariosEmail() {
    const [adminsSnapshot, equipesSnapshot] = await Promise.all([
        db.collection('usuarios_admin').where('ativo', '==', true).get(),
        db.collection('usuarios_equipe').where('ativo', '==', true).get()
    ]);

    const admins = new Set();
    const porEquipe = new Map();

    adminsSnapshot.forEach((doc) => {
        const data = doc.data() || {};
        addEmailToSet(admins, data.email);
    });

    equipesSnapshot.forEach((doc) => {
        const data = doc.data() || {};
        const equipe = normalizeEquipe(data.equipe || data.departamento);

        if (!equipe) {
            return;
        }

        if (!porEquipe.has(equipe)) {
            porEquipe.set(equipe, new Set());
        }

        addEmailToSet(porEquipe.get(equipe), data.email);
    });

    return { admins, porEquipe };
}

function obterDestinatariosPorSolicitacao(destinatarios, solicitacao) {
    const equipe = normalizeEquipe(solicitacao?.equipe);
    const emails = new Set(destinatarios.admins || []);

    if (equipe && destinatarios.porEquipe?.has(equipe)) {
        destinatarios.porEquipe.get(equipe).forEach((email) => emails.add(email));
    }

    return Array.from(emails);
}

function montarMensagemEmailSla({ solicitacao, slaConfig, minutosConsumidos, minutosRestantes, tipoAlerta }) {
    const minutosRestantesFormatado = Math.max(0, Math.ceil(minutosRestantes));
    const minutosAtrasoFormatado = Math.max(0, Math.ceil(Math.abs(minutosRestantes)));
    const quarto = normalizeText(solicitacao.quarto || '-');
    const tipo = normalizeText(solicitacao.tipo || 'não informado');
    const solicitante = normalizeText(solicitacao.nomeAcompanhante || solicitacao.usuarioNome || solicitacao.solicitante || 'não identificado');
    const equipe = normalizeText(slaConfig.nome || solicitacao.equipe || 'Equipe');
    const status = normalizeText(solicitacao.status || 'pendente');

    const estourado = tipoAlerta === 'sla_estourado';
    const tituloAlerta = estourado ? 'SLA estourado' : 'SLA em risco';
    const detalheAlerta = estourado
        ? `A solicitação está ${minutosAtrasoFormatado} min em atraso.`
        : `Restam ${minutosRestantesFormatado} min para atingir o SLA.`;

    const assunto = `[YUNA] ${tituloAlerta} (${equipe}) - Solicitação ${solicitacao.id}`;
    const texto = [
        `Alerta automático: ${tituloAlerta} (YUNA).`,
        '',
        `Solicitação: ${solicitacao.id}`,
        `Equipe: ${equipe}`,
        `Tipo: ${tipo}`,
        `Quarto: ${quarto}`,
        `Solicitante: ${solicitante}`,
        `Status atual: ${status}`,
        `SLA limite: ${slaConfig.minutos} min`,
        `Tempo consumido: ${Math.max(0, Math.ceil(minutosConsumidos))} min`,
        estourado ? `Tempo em atraso: ${minutosAtrasoFormatado} min` : `Tempo restante: ${minutosRestantesFormatado} min`,
        detalheAlerta,
        '',
        `Acesse o painel: ${EMAIL_ALERT_CONFIG.adminUrl}`
    ].join('\n');

    const html = `
        <div style="font-family: Arial, sans-serif; color: #1f2937;">
            <h2 style="margin: 0 0 12px; color: ${estourado ? '#dc2626' : '#b45309'};">${tituloAlerta}</h2>
            <p style="margin: 0 0 12px;">${detalheAlerta}</p>
            <table style="border-collapse: collapse; width: 100%; max-width: 620px;">
                <tr><td style="padding: 6px 0; font-weight: bold;">Solicitação</td><td style="padding: 6px 0;">${solicitacao.id}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold;">Equipe</td><td style="padding: 6px 0;">${equipe}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold;">Tipo</td><td style="padding: 6px 0;">${tipo}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold;">Quarto</td><td style="padding: 6px 0;">${quarto}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold;">Solicitante</td><td style="padding: 6px 0;">${solicitante}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold;">Status</td><td style="padding: 6px 0;">${status}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold;">SLA limite</td><td style="padding: 6px 0;">${slaConfig.minutos} min</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold;">Tempo consumido</td><td style="padding: 6px 0;">${Math.max(0, Math.ceil(minutosConsumidos))} min</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold; color: ${estourado ? '#dc2626' : '#b45309'};">${estourado ? 'Tempo em atraso' : 'Tempo restante'}</td><td style="padding: 6px 0; color: ${estourado ? '#dc2626' : '#b45309'};"><strong>${estourado ? `${minutosAtrasoFormatado} min` : `${minutosRestantesFormatado} min`}</strong></td></tr>
            </table>
            <p style="margin-top: 16px;">
                <a href="${EMAIL_ALERT_CONFIG.adminUrl}" style="display: inline-block; background: #1d4ed8; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">
                    Abrir painel administrativo
                </a>
            </p>
        </div>
    `;

    return { assunto, texto, html };
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

exports.notifyImminentSlaBreachesByEmail = functions
    .region('southamerica-east1')
    .pubsub.schedule('every 5 minutes')
    .timeZone('America/Sao_Paulo')
    .onRun(async () => {
        const transporter = getEmailTransporter();
        if (!transporter) {
            console.log('[SLA-EMAIL] Envio por e-mail desativado ou sem configuração SMTP.');
            return null;
        }

        const [solicitacoesSnapshot, destinatarios] = await Promise.all([
            db.collection('solicitacoes').where('status', 'in', ['pendente', 'em-andamento']).get(),
            carregarDestinatariosEmail()
        ]);

        if (solicitacoesSnapshot.empty) {
            console.log('[SLA-EMAIL] Sem solicitações elegíveis no ciclo atual.');
            return null;
        }

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

            const alertaRisco = minutosRestantes >= 0 && minutosRestantes <= EMAIL_ALERT_CONFIG.notificationWindowMinutes;
            const alertaEstourado = minutosRestantes < 0;

            if (!alertaRisco && !alertaEstourado) {
                continue;
            }

            const tipoAlerta = alertaEstourado ? 'sla_estourado' : 'sla_proximo_30_minutos';
            const lockSuffix = alertaEstourado ? 'breach_email' : '30min_email';

            const emails = obterDestinatariosPorSolicitacao(destinatarios, solicitacao);
            if (!emails.length) {
                console.log('[SLA-EMAIL] Sem destinatários para solicitação:', solicitacao.id);
                continue;
            }

            const lockRef = db.collection('sla_notification_locks').doc(`${solicitacao.id}_${lockSuffix}`);

            try {
                await lockRef.create({
                    solicitacaoId: solicitacao.id,
                    equipe: solicitacao.equipe || slaConfig.nome,
                    status: solicitacao.status,
                    canal: 'email',
                    tipoAlerta,
                    criadoEm: admin.firestore.FieldValue.serverTimestamp(),
                    minutosRestantes: Math.max(0, Math.ceil(minutosRestantes)),
                    janelaMinutos: EMAIL_ALERT_CONFIG.notificationWindowMinutes
                });
            } catch (error) {
                if (error.code === 6 || error.code === 'already-exists') {
                    continue;
                }

                throw error;
            }

            const mensagem = montarMensagemEmailSla({
                solicitacao,
                slaConfig,
                minutosConsumidos,
                minutosRestantes,
                tipoAlerta
            });

            try {
                await transporter.sendMail({
                    from: EMAIL_ALERT_CONFIG.from,
                    to: emails.join(','),
                    subject: mensagem.assunto,
                    text: mensagem.texto,
                    html: mensagem.html
                });

                await lockRef.set({
                    enviadoEm: admin.firestore.FieldValue.serverTimestamp(),
                    destinatarios: emails,
                    minutosConsumidos: Math.max(0, Math.ceil(minutosConsumidos)),
                    minutosRestantes: Math.max(0, Math.ceil(minutosRestantes))
                }, { merge: true });

                console.log('[SLA-EMAIL] Alerta enviado:', {
                    solicitacaoId: solicitacao.id,
                    equipe: slaConfig.nome,
                    destinatarios: emails.length
                });
            } catch (error) {
                console.error('[SLA-EMAIL] Erro ao enviar e-mail de SLA:', {
                    solicitacaoId: solicitacao.id,
                    error: error?.message || error
                });

                await lockRef.delete().catch((lockError) => {
                    console.warn('[SLA-EMAIL] Erro ao remover lock após falha de envio:', lockError?.message || lockError);
                });
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