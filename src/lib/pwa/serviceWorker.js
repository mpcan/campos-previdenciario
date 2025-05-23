// Service Worker para PowerPrev
// Implementação de PWA com modo offline

const CACHE_NAME = 'powerprev-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/clientes',
  '/processos',
  '/atendimentos',
  '/pericias',
  '/documentos',
  '/leads',
  '/campanhas',
  '/whatsapp',
  '/static/styles/main.css',
  '/static/scripts/main.js',
  '/static/images/logo.png',
  '/static/images/icons/icon-192x192.png',
  '/static/images/icons/icon-512x512.png',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  // Pré-cache de recursos estáticos
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pré-cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Instalação concluída');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  
  // Limpar caches antigos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Ativação concluída');
      return self.clients.claim();
    })
  );
});

// Estratégia de cache: Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
  // Ignorar requisições para API e autenticação
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/auth/') ||
      event.request.url.includes('/supabase/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retornar resposta do cache
        if (response) {
          console.log('[Service Worker] Servindo do cache:', event.request.url);
          return response;
        }
        
        // Cache miss - buscar da rede
        console.log('[Service Worker] Buscando da rede:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Verificar se a resposta é válida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clonar a resposta para o cache
            const responseToCache = networkResponse.clone();
            
            // Adicionar ao cache para uso futuro
            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('[Service Worker] Cacheando novo recurso:', event.request.url);
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.log('[Service Worker] Erro ao buscar recurso:', error);
            
            // Se for uma página HTML, retornar página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            return new Response('Recurso não disponível offline', {
              status: 503,
              statusText: 'Serviço indisponível'
            });
          });
      })
  );
});

// Sincronização em segundo plano
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Evento de sincronização:', event.tag);
  
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificação push recebida:', event);
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/static/images/icons/icon-192x192.png',
    badge: '/static/images/icons/badge-96x96.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clique em notificação:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Função para sincronizar dados pendentes
async function syncPendingData() {
  console.log('[Service Worker] Sincronizando dados pendentes...');
  
  // Enviar mensagem para a página para iniciar sincronização
  const allClients = await clients.matchAll({ includeUncontrolled: true });
  
  for (const client of allClients) {
    client.postMessage({
      type: 'SYNC_PENDING_DATA'
    });
  }
}
