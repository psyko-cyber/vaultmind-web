// VaultMind: il service worker che fa funzionare l'app senza rete.
//
// Scritto a mano e non quello di Flutter, che dalla 3.2x si limita a
// disinstallarsi. Cosa fa, e cosa NON fa di proposito:
//
// - All'installazione mette in cache TUTTI i file dell'app, elencati da
//   pubblica_web.ps1 al momento della pubblicazione (["./","assets/AssetManifest.bin","assets/AssetManifest.bin.json","assets/assets/fonts/Inter-400.ttf","assets/assets/fonts/Inter-500.ttf","assets/assets/fonts/Inter-600.ttf","assets/assets/fonts/Inter-700.ttf","assets/assets/fonts/JetBrainsMono-400.ttf","assets/assets/fonts/JetBrainsMono-700.ttf","assets/assets/fonts/OFL-Inter.txt","assets/assets/fonts/OFL-JetBrainsMono.txt","assets/assets/fonts/OFL-SpaceGrotesk.txt","assets/assets/fonts/SpaceGrotesk-600.ttf","assets/assets/logo.png","assets/FontManifest.json","assets/fonts/MaterialIcons-Regular.otf","assets/packages/cupertino_icons/assets/CupertinoIcons.ttf","assets/shaders/ink_sparkle.frag","assets/shaders/stretch_effect.frag","canvaskit/canvaskit.js","canvaskit/canvaskit.wasm","favicon.png","flutter.js","flutter_bootstrap.js","icons/apple-touch-icon.png","icons/Icon-192.png","icons/Icon-512.png","icons/Icon-maskable-192.png","icons/Icon-maskable-512.png","index.html","main.dart.js","manifest.json","version.json"]). Da li' in poi
//   l'app si apre anche in aereo.
// - Una versione nuova si scarica in sottofondo ma NON prende il posto di
//   quella in uso (niente skipWaiting): parte alla prossima apertura, dopo
//   aver chiuso l'app. Due versioni mescolate nella stessa sessione sono il
//   modo di rompere un vault senza capire perche'.
// - Non tocca mai il vault: sta nella memoria del sito (deposito_web.dart),
//   non nella cache. Cancellare la cache non cancella le password.
'use strict';

const VERSIONE = '20260916-160003-e65e13b';
const CACHE = 'vaultmind-' + VERSIONE;
const FILE = ["./","assets/AssetManifest.bin","assets/AssetManifest.bin.json","assets/assets/fonts/Inter-400.ttf","assets/assets/fonts/Inter-500.ttf","assets/assets/fonts/Inter-600.ttf","assets/assets/fonts/Inter-700.ttf","assets/assets/fonts/JetBrainsMono-400.ttf","assets/assets/fonts/JetBrainsMono-700.ttf","assets/assets/fonts/OFL-Inter.txt","assets/assets/fonts/OFL-JetBrainsMono.txt","assets/assets/fonts/OFL-SpaceGrotesk.txt","assets/assets/fonts/SpaceGrotesk-600.ttf","assets/assets/logo.png","assets/FontManifest.json","assets/fonts/MaterialIcons-Regular.otf","assets/packages/cupertino_icons/assets/CupertinoIcons.ttf","assets/shaders/ink_sparkle.frag","assets/shaders/stretch_effect.frag","canvaskit/canvaskit.js","canvaskit/canvaskit.wasm","favicon.png","flutter.js","flutter_bootstrap.js","icons/apple-touch-icon.png","icons/Icon-192.png","icons/Icon-512.png","icons/Icon-maskable-192.png","icons/Icon-maskable-512.png","index.html","main.dart.js","manifest.json","version.json"];

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache: 'reload' salta la cache HTTP del server: senza, GitHub Pages
    // potrebbe restituire file della versione precedente dentro la nuova.
    await cache.addAll(FILE.map((f) => new Request(f, { cache: 'reload' })));
  })());
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    for (const nome of await caches.keys()) {
      if (nome.startsWith('vaultmind-') && nome !== CACHE) await caches.delete(nome);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== 'GET') return;
  if (new URL(richiesta.url).origin !== self.location.origin) return;
  evento.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const trovata = await cache.match(richiesta, { ignoreSearch: true });
    if (trovata) return trovata;
    if (richiesta.mode === 'navigate') {
      const pagina = await cache.match('./');
      if (pagina) return pagina;
    }
    return fetch(richiesta);
  })());
});
