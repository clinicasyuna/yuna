importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyB8vh5TxODwXXQIq49vkhtfCK6VLk9bMRs',
    authDomain: 'app-pedidos-4656c.firebaseapp.com',
    projectId: 'app-pedidos-4656c',
    storageBucket: 'app-pedidos-4656c.firebasestorage.app',
    messagingSenderId: '979848418674',
    appId: '1:979848418674:web:c591005f8f262702cdb9eb'
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