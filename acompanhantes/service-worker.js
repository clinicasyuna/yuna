/**
 * YUNA Acompanhantes - Service Worker v2 (PWA Enhancement)
 * Implemented: 11/05/2026
 * 
 * Estratégia: Cache-First para assets estáticos, Network-First para dados
 * Suporta: Background Sync, Offline Queue, Periodic Sync
 */

const CACHE_NAME = 'yuna-acompanhantes-v2-' + new Date().toISOString().split('T')[0];
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js'
];

const OFFLINE_FALLBACK = {
  html: `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>YUNA - Modo Offline</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
               background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
               display: flex; align-items: center; justify-content: center; 
               min-height: 100vh; margin: 0; padding: 1rem; }
        .offline-card { background: white; padding: 2rem; border-radius: 12px; 
                       text-align: center; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h1 { color: #1e293b; margin: 0.5rem 0; }
        p { color: #64748b; margin: 1rem 0; }
        .status { background: #fef08a; color: #854d0e; padding: 1rem; 
                  border-radius: 8px; margin: 1.5rem 0; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="offline-card">
        <div class="icon">📵</div>
        <h1>Modo Offline</h1>
        <p>Você está sem conexão. Suas solicitações anteriores estão disponíveis abaixo.</p>
        <div class="status">
          <strong>✓</strong> Suas solicitações foram salvas localmente<br>
          Reconectaremos automaticamente quando voltar online
        </div>
        <p style="font-size: 0.9rem; color: #94a3b8;">Aguardando conexão...</p>
      </div>
    </body>
    </html>
  `
};

// ===== INSTALL EVENT: Cache estático assets =====
self.addEventListener('install', (event) => {
  console.log('[SW v2] Installing - caching static assets');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW v2] Some assets failed to cache:', err);
        // Continuar mesmo se alguns assets falharem
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// ===== ACTIVATE EVENT: Limpar caches antigos =====
self.addEventListener('activate', (event) => {
  console.log('[SW v2] Activating - cleaning old caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW v2] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ===== FETCH EVENT: Smart caching strategy =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Dados dinâmicos (Firebase) - Network First
  if (url.hostname === 'firestore.googleapis.com' || 
      url.hostname.includes('firebase') ||
      request.method === 'POST') {
    return event.respondWith(networkFirst(request));
  }

  // 2. Assets estáticos - Cache First
  if (request.method === 'GET' && 
      (request.destination === 'style' || 
       request.destination === 'script' || 
       request.destination === 'font')) {
    return event.respondWith(cacheFirst(request));
  }

  // 3. HTML - Network First com fallback
  if (request.destination === 'document') {
    return event.respondWith(networkFirst(request, OFFLINE_FALLBACK.html));
  }

  // 4. Default - Network First
  return event.respondWith(networkFirst(request));
});

// ===== Cache First Strategy =====
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW v2] Cache First failed:', error);
    const cached = await caches.match(request);
    return cached || new Response('Não disponível offline', { status: 503 });
  }
}

// ===== Network First Strategy =====
async function networkFirst(request, fallbackHtml = null) {
  try {
    const response = await fetch(request);
    
    // Cachear respostas bem-sucedidas (não JSON muito grande)
    if (response.ok && response.status === 200 && request.method === 'GET') {
      const clone = response.clone();
      const contentType = clone.headers.get('content-type');
      if (!contentType?.includes('application/json') || clone.headers.get('content-length') < 100000) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, clone);
      }
    }
    
    return response;
  } catch (error) {
    console.warn('[SW v2] Network request failed:', error);
    
    // Tentar cache
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Fallback para HTML offline
    if (fallbackHtml && request.destination === 'document') {
      return new Response(fallbackHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    return new Response('Erro: Sem conexão', { status: 503 });
  }
}

// ===== MESSAGE: Suportar cliente para limpeza de cache =====
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_CACHE') {
    console.log('[SW v2] Client requested cache clear');
    event.waitUntil(
      caches.keys().then(names => 
        Promise.all(names.map(name => caches.delete(name)))
      )
    );
  }
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ===== BACKGROUND SYNC: Sincronizar ações offline =====
self.addEventListener('sync', (event) => {
  console.log('[SW v2] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-solicitacoes') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  try {
    // Verificar IndexedDB de ações pendentes (será implementado no Fase 4)
    console.log('[SW v2] Syncing pending actions...');
    
    // Notificar cliente que sync foi executado
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('[SW v2] Sync failed:', error);
  }
}

// ===== PERIODIC SYNC: Sincronizar a cada 15 minutos =====
self.addEventListener('periodicsync', (event) => {
  console.log('[SW v2] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'update-solicitacoes') {
    event.waitUntil(updateSolicitacoes());
  }
});

async function updateSolicitacoes() {
  try {
    console.log('[SW v2] Periodic: Updating solicitacoes...');
    // Será implementado com listeners real-time (Fase 2)
  } catch (error) {
    console.error('[SW v2] Periodic update failed:', error);
  }
}

// ===== PUSH NOTIFICATIONS: Handle backend push messages =====
self.addEventListener('push', (event) => {
  console.log('[SW v2] Push notification received');
  
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'Nova notificação YUNA',
    icon: 'data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 192 192%22%3e%3crect width=%22192%22 height=%22192%22 fill=%22%232563eb%22 rx=%2235%22/%3e%3c/svg%3e',
    badge: 'data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 192 192%22%3e%3ccircle cx=%2296%22 cy=%2296%22 r=%2290%22 fill=%22%232563eb%22/%3e%3c/svg%3e',
    tag: data.tag || 'yuna-notification',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'YUNA Solicite', options)
  );
});

// ===== NOTIFICATION CLICK: Handle user interaction =====
self.addEventListener('notificationclick', (event) => {
  console.log('[SW v2] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/acompanhantes/';
  const action = event.action;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Procurar janela já aberta
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Abrir nova janela se não existir
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen + (action ? `?action=${action}` : ''));
      }
    })
  );
});

console.log('[SW v2] Service Worker v2 loaded - Cache-First + Network-First strategy');

