(function () {
    const PUSH_CONFIG = {
        vapidKey: window.YUNA_PUSH_VAPID_KEY || 'BG_KlAN6MzrDS4ptLlFwukjfC2oGnWqXtzWCgk2DinzvQX0DkzSNaZ9f-rcNiNUVreRrwTIrDGbIwd4p4kmC9SY',
        tokenCollection: 'admin_push_tokens',
        serviceWorkerPath: '../firebase-messaging-sw.js',
        storage: {
            tokenDocId: 'yuna_push_token_doc_id',
            tokenUid: 'yuna_push_token_uid',
            tokenValue: 'yuna_push_token_value',
            bannerDismissed: 'yuna_push_banner_dismissed'
        }
    };

    let messaging = null;
    let authListenerAttached = false;
    let permissionBanner = null;

    function logPush(message, details) {
        if (typeof details === 'undefined') {
            console.log(`[PUSH] ${message}`);
            return;
        }

        console.log(`[PUSH] ${message}`, details);
    }

    function isPushSupported() {
        return typeof window !== 'undefined'
            && 'serviceWorker' in navigator
            && 'Notification' in window
            && typeof firebase !== 'undefined'
            && typeof firebase.messaging === 'function';
    }

    function isVapidConfigured() {
        return !!PUSH_CONFIG.vapidKey && !PUSH_CONFIG.vapidKey.includes('PREENCHER');
    }

    function hashString(value) {
        let hash = 0;

        for (let index = 0; index < value.length; index += 1) {
            hash = ((hash << 5) - hash) + value.charCodeAt(index);
            hash |= 0;
        }

        return Math.abs(hash).toString(36);
    }

    function obterPerfilUsuarioAtual() {
        const usuarioCache = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');

        return {
            role: usuarioCache.role || 'admin',
            equipe: usuarioCache.equipe || usuarioCache.departamento || null,
            nome: usuarioCache.nome || null,
            email: window.auth?.currentUser?.email || usuarioCache.email || null
        };
    }

    function notificarUsuario(titulo, mensagem, tipo) {
        if (typeof window.showToast === 'function') {
            window.showToast(titulo, mensagem, tipo || 'warning');
            return;
        }

        console.log(`[${titulo}] ${mensagem}`);
    }

    function removerBannerPermissao() {
        if (permissionBanner && permissionBanner.parentNode) {
            permissionBanner.parentNode.removeChild(permissionBanner);
        }

        permissionBanner = null;
    }

    async function registrarTokenPush() {
        if (!isPushSupported()) {
            logPush('Navegador sem suporte a Web Push.');
            return null;
        }

        if (!isVapidConfigured()) {
            logPush('Chave VAPID ainda não configurada.');
            return null;
        }

        if (!window.auth?.currentUser || !window.db) {
            logPush('Auth/Firestore ainda não disponíveis para registrar token.');
            return null;
        }

        let serviceWorkerRegistration = null;
        let token = null;

        try {
            serviceWorkerRegistration = await navigator.serviceWorker.register(PUSH_CONFIG.serviceWorkerPath);
            token = await messaging.getToken({
                vapidKey: PUSH_CONFIG.vapidKey,
                serviceWorkerRegistration
            });
        } catch (error) {
            const errorCode = error?.code || '';
            const errorMessage = (error?.message || '').toLowerCase();
            const isAuthIssue = errorCode.includes('token-subscribe-failed')
                || errorMessage.includes('401')
                || errorMessage.includes('authentication credential');

            if (isAuthIssue) {
                console.warn('[PUSH] FCM recusou o registro do token (401/autenticação). Verifique Web Push certificates (VAPID) e APIs do projeto Firebase.', error);
                notificarUsuario('Push indisponível', 'Não foi possível ativar notificações neste ambiente. Verifique configuração do Firebase Cloud Messaging.', 'warning');
                return null;
            }

            throw error;
        }

        if (!token) {
            logPush('Firebase Messaging não retornou token.');
            return null;
        }

        const user = window.auth.currentUser;
        const perfil = obterPerfilUsuarioAtual();
        const docId = `${user.uid}_${hashString(token)}`;

        await window.db.collection(PUSH_CONFIG.tokenCollection).doc(docId).set({
            userId: user.uid,
            token,
            enabled: true,
            role: perfil.role,
            equipe: perfil.equipe || null,
            nome: perfil.nome || null,
            email: perfil.email,
            origem: 'admin-web',
            userAgent: navigator.userAgent,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastKnownPath: window.location.pathname
        }, { merge: true });

        localStorage.setItem(PUSH_CONFIG.storage.tokenDocId, docId);
        localStorage.setItem(PUSH_CONFIG.storage.tokenUid, user.uid);
        localStorage.setItem(PUSH_CONFIG.storage.tokenValue, token);
        localStorage.removeItem(PUSH_CONFIG.storage.bannerDismissed);
        removerBannerPermissao();

        logPush('Token push registrado com sucesso.', { docId, role: perfil.role, equipe: perfil.equipe });
        notificarUsuario('Notificações', 'Notificações do navegador ativadas com sucesso.', 'success');

        return token;
    }

    async function removerTokenPushRegistrado() {
        if (!window.db) {
            return;
        }

        const docId = localStorage.getItem(PUSH_CONFIG.storage.tokenDocId);
        const tokenUid = localStorage.getItem(PUSH_CONFIG.storage.tokenUid);
        const tokenValue = localStorage.getItem(PUSH_CONFIG.storage.tokenValue);

        if (!docId || !tokenUid) {
            return;
        }

        try {
            await window.db.collection(PUSH_CONFIG.tokenCollection).doc(docId).delete();
            logPush('Token push removido do Firestore.', { docId, tokenUid });
        } catch (error) {
            console.warn('[PUSH] Falha ao remover token push:', error);
        }

        if (tokenValue && messaging && typeof messaging.deleteToken === 'function') {
            try {
                await messaging.deleteToken(tokenValue);
            } catch (error) {
                console.warn('[PUSH] Falha ao invalidar token local:', error);
            }
        }

        localStorage.removeItem(PUSH_CONFIG.storage.tokenDocId);
        localStorage.removeItem(PUSH_CONFIG.storage.tokenUid);
        localStorage.removeItem(PUSH_CONFIG.storage.tokenValue);
    }

    async function ativarNotificacoesPush() {
        const permissao = Notification.permission === 'granted'
            ? 'granted'
            : await Notification.requestPermission();

        if (permissao !== 'granted') {
            notificarUsuario('Notificações', 'Permissão de notificações não concedida.', 'warning');
            return null;
        }

        if (!isVapidConfigured()) {
            notificarUsuario('Configuração pendente', 'Permissão concedida, mas a chave VAPID ainda não está configurada para concluir a ativação push.', 'warning');
            return null;
        }

        return registrarTokenPush();
    }

    function criarBannerPermissao() {
        if (permissionBanner || Notification.permission !== 'default' || !window.auth?.currentUser) {
            return;
        }

        if (localStorage.getItem(PUSH_CONFIG.storage.bannerDismissed) === '1') {
            return;
        }

        permissionBanner = document.createElement('div');
        permissionBanner.id = 'push-permission-banner';
        permissionBanner.style.cssText = [
            'position: fixed',
            'left: 24px',
            'bottom: 24px',
            'z-index: 1000000',
            'max-width: 420px',
            'padding: 16px 18px',
            'border-radius: 14px',
            'background: linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            'color: #ffffff',
            'box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28)',
            'font-family: system-ui, -apple-system, sans-serif'
        ].join(';');

        permissionBanner.innerHTML = `
            <div style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">Ativar alertas do navegador</div>
            <div style="font-size: 13px; line-height: 1.45; opacity: 0.92; margin-bottom: 12px;">
                Receba alerta de SLA em risco mesmo com o painel administrativo fechado.
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button id="push-enable-btn" style="border: none; border-radius: 10px; padding: 10px 14px; cursor: pointer; font-weight: 700; background: #f59e0b; color: #111827;">Ativar agora</button>
                <button id="push-dismiss-btn" style="border: 1px solid rgba(255,255,255,0.18); border-radius: 10px; padding: 10px 14px; cursor: pointer; font-weight: 600; background: transparent; color: #ffffff;">Depois</button>
            </div>
        `;

        document.body.appendChild(permissionBanner);

        permissionBanner.querySelector('#push-enable-btn')?.addEventListener('click', async () => {
            const enableBtn = permissionBanner?.querySelector('#push-enable-btn');
            if (enableBtn) {
                enableBtn.disabled = true;
                enableBtn.textContent = 'Ativando...';
                enableBtn.style.opacity = '0.75';
            }

            try {
                await ativarNotificacoesPush();

                // Se o usuário decidiu (granted/denied), remove banner para não travar a UI.
                if (Notification.permission !== 'default') {
                    localStorage.setItem(PUSH_CONFIG.storage.bannerDismissed, '1');
                    removerBannerPermissao();
                }
            } catch (error) {
                console.error('[PUSH] Falha ao ativar notificações:', error);
                notificarUsuario('Erro', 'Não foi possível ativar as notificações push.', 'error');
            } finally {
                const refreshBtn = permissionBanner?.querySelector('#push-enable-btn');
                if (refreshBtn) {
                    refreshBtn.disabled = false;
                    refreshBtn.textContent = 'Ativar agora';
                    refreshBtn.style.opacity = '1';
                }
            }
        });

        permissionBanner.querySelector('#push-dismiss-btn')?.addEventListener('click', () => {
            localStorage.setItem(PUSH_CONFIG.storage.bannerDismissed, '1');
            removerBannerPermissao();
        });
    }

    async function sincronizarEstadoPush(user) {
        if (!user) {
            removerBannerPermissao();
            await removerTokenPushRegistrado();
            return;
        }

        if (Notification.permission === 'denied') {
            removerBannerPermissao();
            localStorage.setItem(PUSH_CONFIG.storage.bannerDismissed, '1');
            return;
        }

        if (Notification.permission === 'granted') {
            await registrarTokenPush();
            return;
        }

        if (Notification.permission === 'default') {
            criarBannerPermissao();
        }
    }

    function anexarListenerMensagensForeground() {
        if (!messaging || typeof messaging.onMessage !== 'function') {
            return;
        }

        messaging.onMessage((payload) => {
            const titulo = payload?.notification?.title || 'Alerta do sistema';
            const mensagem = payload?.notification?.body || 'Você recebeu uma nova notificação.';
            notificarUsuario(titulo, mensagem, 'warning');
        });
    }

    function exporAPI() {
        window.ativarNotificacoesPushYuna = ativarNotificacoesPush;
        window.desativarNotificacoesPushYuna = removerTokenPushRegistrado;
        window.statusNotificacoesPushYuna = function () {
            return {
                supported: isPushSupported(),
                permission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
                vapidConfigured: isVapidConfigured(),
                tokenDocId: localStorage.getItem(PUSH_CONFIG.storage.tokenDocId)
            };
        };
    }

    function inicializarQuandoPronto() {
        const maxTentativas = 60;
        let tentativaAtual = 0;

        const intervalo = setInterval(() => {
            tentativaAtual += 1;

            if (window.auth && window.db && isPushSupported()) {
                clearInterval(intervalo);

                try {
                    messaging = firebase.messaging();
                    anexarListenerMensagensForeground();
                    exporAPI();

                    if (!authListenerAttached) {
                        window.auth.onAuthStateChanged((user) => {
                            setTimeout(() => {
                                sincronizarEstadoPush(user).catch((error) => {
                                    console.error('[PUSH] Erro ao sincronizar estado push:', error);
                                });
                            }, 800);
                        });
                        authListenerAttached = true;
                    }

                    logPush('Módulo de push inicializado.');
                } catch (error) {
                    console.error('[PUSH] Falha ao inicializar Firebase Messaging:', error);
                }

                return;
            }

            if (tentativaAtual >= maxTentativas) {
                clearInterval(intervalo);
                logPush('Dependências de push não ficaram prontas a tempo.');
            }
        }, 500);
    }

    inicializarQuandoPronto();
})();