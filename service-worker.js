// service-worker.js
// COMPLETAMENTE DESABILITADO EM 20/01/2026 15:30
// Service Worker foi removido por causar cache persistente do HTML antigo

console.log('[SW] ⚠️ Service Worker DESABILITADO - Limpando todos os caches...');

// Limpar TUDO ao instalar
self.addEventListener('install', (event) => {
  console.log('[SW] Install event - limpando caches');
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then((names) => {
      console.log('[SW] Deletando caches:', names);
      return Promise.all(names.map(name => caches.delete(name)));
    })
  );
});

// Remover todas as claims e limpar
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event - removendo service worker');
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(name => caches.delete(name)))
    )
  );
  // NÃO fazer claim - deixar cliente direto
});

// Não interceptar nenhuma requisição
self.addEventListener('fetch', (event) => {
  // Fazer nada - deixar navegador lidar diretamente
  // Sem cache, sem offline support
});

console.log('[SW] Service Worker removido completamente (20/01/2026 15:30)');