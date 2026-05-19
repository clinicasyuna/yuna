/*
 * Envia alertas de SLA por e-mail (janela de risco e SLA estourado)
 * usando GitHub Actions, sem depender de Cloud Functions.
 */

const nodemailer = require('nodemailer');
const { admin, initFirebaseAdmin } = require('./firebase-admin-init');

const EMAIL_CONFIG = {
    enabled: String(process.env.SLA_EMAIL_ENABLED || 'true').toLowerCase() !== 'false',
    smtpHost: process.env.SLA_SMTP_HOST || '',
    smtpPort: Number(process.env.SLA_SMTP_PORT || 465),
    smtpSecure: String(process.env.SLA_SMTP_SECURE || 'true').toLowerCase() !== 'false',
    smtpUser: process.env.SLA_SMTP_USER || '',
    smtpPass: process.env.SLA_SMTP_PASS || '',
    from: process.env.SLA_EMAIL_FROM || process.env.SLA_SMTP_USER || '',
    adminUrl: process.env.YUNA_ADMIN_URL || 'https://clinicasyuna.github.io/yuna/admin/',
    notificationWindowMinutes: Number(process.env.SLA_EMAIL_WINDOW_MINUTES || 30),
    startHour: Number(process.env.SLA_ALERT_START_HOUR || 7),
    endHour: Number(process.env.SLA_ALERT_END_HOUR || 19)
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

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeText(value) {
    return String(value || '').trim();
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

        if (hour >= EMAIL_CONFIG.startHour && hour < EMAIL_CONFIG.endHour) {
            total += (limit - cursor) / (1000 * 60);
        }

        cursor = limit;
    }

    return Math.floor(total);
}

function getTransporter() {
    if (!EMAIL_CONFIG.enabled) {
        return null;
    }

    if (!EMAIL_CONFIG.smtpHost || !EMAIL_CONFIG.smtpUser || !EMAIL_CONFIG.smtpPass) {
        throw new Error('SLA_SMTP_HOST, SLA_SMTP_USER e SLA_SMTP_PASS sao obrigatorios para envio de e-mail.');
    }

    return nodemailer.createTransport({
        host: EMAIL_CONFIG.smtpHost,
        port: EMAIL_CONFIG.smtpPort,
        secure: EMAIL_CONFIG.smtpSecure,
        auth: {
            user: EMAIL_CONFIG.smtpUser,
            pass: EMAIL_CONFIG.smtpPass
        }
    });
}

function addEmailToSet(set, value) {
    const email = normalizeEmail(value);
    if (!email || !email.includes('@')) {
        return;
    }

    set.add(email);
}

async function carregarDestinatariosEmail(db) {
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
        `Acesse o painel: ${EMAIL_CONFIG.adminUrl}`
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
                <a href="${EMAIL_CONFIG.adminUrl}" style="display: inline-block; background: #1d4ed8; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">
                    Abrir painel administrativo
                </a>
            </p>
        </div>
    `;

    return { assunto, texto, html };
}

async function run() {
    if (!EMAIL_CONFIG.enabled) {
        console.log('[SLA-EMAIL] Envio desativado por SLA_EMAIL_ENABLED=false');
        return;
    }

    initFirebaseAdmin();
    const transporter = getTransporter();
    const db = admin.firestore();

    const [solicitacoesSnapshot, destinatarios] = await Promise.all([
        db.collection('solicitacoes').where('status', 'in', ['pendente', 'em-andamento']).get(),
        carregarDestinatariosEmail(db)
    ]);

    if (solicitacoesSnapshot.empty) {
        console.log('[SLA-EMAIL] Sem solicitações elegíveis.');
        return;
    }

    const now = new Date();
    let enviados = 0;

    for (const doc of solicitacoesSnapshot.docs) {
        const solicitacao = { id: doc.id, ...doc.data() };
        const createdAt = getSolicitacaoDataCriacao(solicitacao);

        if (!createdAt) {
            continue;
        }

        const slaConfig = getSlaConfig(solicitacao.equipe);
        const elapsed = calcularMinutosOperacionais(createdAt, now);
        const remaining = slaConfig.minutos - elapsed;

        const alertaRisco = remaining >= 0 && remaining <= EMAIL_CONFIG.notificationWindowMinutes;
        const alertaEstourado = remaining < 0;

        if (!alertaRisco && !alertaEstourado) {
            continue;
        }

        const tipoAlerta = alertaEstourado ? 'sla_estourado' : 'sla_proximo_30_minutos';
        const lockSuffix = alertaEstourado ? 'breach_email' : '30min_email';

        const emails = obterDestinatariosPorSolicitacao(destinatarios, solicitacao);
        if (!emails.length) {
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
                janelaMinutos: EMAIL_CONFIG.notificationWindowMinutes,
                minutosRestantes: Math.max(0, Math.ceil(remaining)),
                criadoEm: admin.firestore.FieldValue.serverTimestamp(),
                source: 'github-actions-email'
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
            minutosConsumidos: elapsed,
            minutosRestantes: remaining,
            tipoAlerta
        });

        try {
            await transporter.sendMail({
                from: EMAIL_CONFIG.from,
                to: emails.join(','),
                subject: mensagem.assunto,
                text: mensagem.texto,
                html: mensagem.html
            });

            await lockRef.set({
                enviadoEm: admin.firestore.FieldValue.serverTimestamp(),
                destinatarios: emails,
                minutosConsumidos: Math.max(0, Math.ceil(elapsed)),
                minutosRestantes: Math.max(0, Math.ceil(remaining))
            }, { merge: true });

            enviados += 1;
            console.log('[SLA-EMAIL] Alerta enviado:', {
                solicitacaoId: solicitacao.id,
                tipoAlerta,
                destinatarios: emails.length
            });
        } catch (error) {
            console.error('[SLA-EMAIL] Falha ao enviar e-mail:', {
                solicitacaoId: solicitacao.id,
                tipoAlerta,
                erro: error?.message || error
            });

            await lockRef.delete().catch((lockError) => {
                console.warn('[SLA-EMAIL] Erro ao remover lock apos falha:', lockError?.message || lockError);
            });
        }
    }

    console.log(`[SLA-EMAIL] Execução finalizada. Alertas enviados: ${enviados}`);
}

run().catch((error) => {
    console.error('[SLA-EMAIL] Execução abortada:', error);
    process.exitCode = 1;
});
