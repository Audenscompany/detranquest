// ═══════════════════════════════════════════════════════════════
// DETRAN QUEST — SERVICE WORKER
//
// !!! IMPORTANTE — LEIA ANTES DE PUBLICAR UMA ATUALIZAÇÃO !!!
// Sempre que o GAME_VERSION mudar dentro de index.html, mude o
// CACHE_VERSION abaixo também (mesmo número). Isso é o que faz o
// navegador perceber que existe uma versão nova: ele compara os
// BYTES deste arquivo a cada visita, e se mudou, dispara o fluxo
// de atualização ("Nova versão disponível"). Sem mudar esta linha,
// o navegador não vai detectar a atualização, mesmo que o
// index.html tenha mudado.
// ═══════════════════════════════════════════════════════════════
const CACHE_VERSION = 'v5.1.0';
const CACHE_NAME = 'detranquest-' + CACHE_VERSION;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ───────────────────────────────────────────────
// INSTALL — baixa e guarda a versão nova numa cache PRÓPRIA, com
// nome diferente da anterior. Nunca apaga a cache antiga aqui:
// se a instalação falhar no meio do caminho, a versão antiga
// continua intacta e servindo normalmente.
// ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => {
        console.error('[SW] Falha ao pré-cachear, mantendo versão anterior ativa:', err);
        throw err; // garante que a instalação falhe explicitamente, sem promover uma versão incompleta
      })
  );
});

// ───────────────────────────────────────────────
// ACTIVATE — só roda DEPOIS que a nova versão foi instalada com
// sucesso. Aqui sim, limpa caches de versões antigas (mantém o
// dispositivo sem lixo acumulado), mas só chega aqui se o install
// anterior deu certo.
// ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith('detranquest-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// ───────────────────────────────────────────────
// FETCH — network-first: sempre tenta buscar a versão mais nova da
// rede primeiro (é isso que faz o jogo atualizar sozinho ao recarregar
// a página, sem precisar baixar arquivo nenhum). Só usa a cache como
// fallback se estiver offline ou a rede falhar — é o que garante o
// funcionamento offline. NUNCA intercepta chamadas pra outro domínio
// (ex: nenhuma API externa é usada por este jogo, mas a regra fica
// aqui como proteção caso isso mude no futuro).
// ───────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Sem rede E sem cache para esta URL específica: tenta servir o
          // app shell (index.html) pra qualquer navegação, em vez de erro cru —
          // é o que impede tela branca/preta quando offline numa rota não cacheada.
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline e sem versão em cache para este recurso.', {
            status: 503,
            statusText: 'Offline',
          });
        })
      )
  );
});

// ───────────────────────────────────────────────
// MESSAGE — permite que a página peça pro worker "em espera" assumir
// imediatamente, ao clicar em "Atualizar agora". Sem isso, a troca só
// aconteceria depois que TODAS as abas do jogo fossem fechadas.
// ───────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
