importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyAogGkN5N24Puss4-kF9Z6npPYyEzVei3M',
    authDomain: 'studio-5526632052-23813.firebaseapp.com',
    projectId: 'studio-5526632052-23813',
    storageBucket: 'studio-5526632052-23813.firebasestorage.app',
    messagingSenderId: '251931417472',
    appId: '1:251931417472:web:4b955052a184d114f57f65'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificacao = payload.notification || {};
    const dados = payload.data || {};

    self.registration.showNotification(notificacao.title || 'Yuna Solicite', {
        body: notificacao.body || 'Existe uma atualização importante para o painel administrativo.',
        icon: './favicon.ico',
        badge: './favicon.ico',
        tag: dados.tag || `yuna-${dados.solicitacaoId || 'notificacao'}`,
        renotify: false,
        data: {
            url: dados.url || './admin/',
            solicitacaoId: dados.solicitacaoId || null
        }
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || './admin/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('/admin') && 'focus' in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }

            return null;
        })
    );
});