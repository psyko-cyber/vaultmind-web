// VaultMind: il service worker che fa funzionare l'app senza rete.
//
// Scritto a mano e non quello di Flutter, che dalla 3.2x si limita a
// disinstallarsi. Cosa fa, e perche':
//
// - All'installazione mette in cache TUTTI i file dell'app, elencati da
//   pubblica_web.ps1 con l'impronta SHA-256 di ciascuno (vedi IMPRONTE). Da li'
//   in poi l'app si apre anche in aereo.
// - Ogni file scaricato si CONFRONTA con la sua impronta. Il 16/09/2026 la CDN
//   di GitHub Pages ha servito per diversi minuti il main.dart.js vecchio
//   insieme al sw.js nuovo: senza il confronto, la versione nuova avrebbe
//   messo in cache il codice vecchio e ce lo avrebbe tenuto. Se un file non
//   torna, l'installazione fallisce e il browser riprova alla prossima
//   apertura; intanto resta la versione di prima, intera.
// - Una versione verificata si attiva SUBITO (skipWaiting). Fino al 16/09 si
//   aspettava che l'utente chiudesse ogni scheda: Luca ha ricaricato la pagina
//   piu' volte vedendo sempre la vecchia, e su iPhone un'app sulla Home non si
//   chiude mai davvero. La pagina gia' aperta non si ricarica da sola -- ci
//   potrebbe essere una password a meta' -- ma lo dice (flutter_bootstrap.js).
// - Non tocca mai il vault: sta nella memoria del sito (deposito_web.dart),
//   non nella cache. Cancellare la cache non cancella le password.
'use strict';

const VERSIONE = '20260918-120640-225bccd';
const CACHE = 'vaultmind-' + VERSIONE;
const IMPRONTE = {"assets/AssetManifest.bin":"3f0563cf725ddf918a383fbf7748ce464f9e617621a4a5092b4ee213735b2902","assets/AssetManifest.bin.json":"73b4c79b07f58100fc151e139e4a56a743e79234750f91cea8404ffe6828fae7","assets/assets/fonts/Inter-400.ttf":"8477fed0e81dbc1acd23e9557d5de59283d2ded52f321b3de93e625173dc3332","assets/assets/fonts/Inter-500.ttf":"1e8595e037849c8fa185890d7b31a4186175bb0096ea14ad656c586e749ba8f8","assets/assets/fonts/Inter-600.ttf":"4645b18c1370ebc6b41825a8c2d11bfa09e8bd50e24bc8f531bf23e8849a077a","assets/assets/fonts/Inter-700.ttf":"e8c33401bb3fb986bcc3b03d7f649309a406d22e94a1c20a4077e5cc181c896e","assets/assets/fonts/JetBrainsMono-400.ttf":"5ac18c052d929c018675ea7d520548b0385cc0bfdf911df5fd0b9d185b9c191e","assets/assets/fonts/JetBrainsMono-700.ttf":"01e7c268fa720cc2f832515343d27dd06b1966af894457d18f01bc6eee4c0fae","assets/assets/fonts/OFL-Inter.txt":"f14f2b95a38f4f20cad4d27f7710593f37534c046641be0348da7c28365f4e39","assets/assets/fonts/OFL-JetBrainsMono.txt":"ef2870fd9ccb5f68d6b89aba72c3b30a27ab66f317b41d8c2c048693236bee01","assets/assets/fonts/OFL-SpaceGrotesk.txt":"564ce565c371c5e5bbf286006565a7c9aa55a9f56e7ca58d56e05d649dd61a72","assets/assets/fonts/SpaceGrotesk-600.ttf":"30f26338c8b73f80cbfa8556dacd8105a15615ceb45d43cf91d8aaff98229284","assets/assets/logo.png":"8a38729781db13b3ffdf49b35565fb5ee168180edbee34ff542a410058f51b05","assets/FontManifest.json":"e6decb7712903b51d8b57c3e2d515f7522519b34a0ff32e9adc0fdf0fa887905","assets/fonts/fallback/Roboto-Regular.ttf":"79e851404657dac2106b3d22ad256d47824a9a5765458edb72c9102a45816d95","assets/fonts/MaterialIcons-Regular.otf":"d9bad7f2677571a9c5586bb96a9fd3769a1c7742771f0165f3f9d088df89c1e1","assets/packages/cupertino_icons/assets/CupertinoIcons.ttf":"3d90c370aa4cf00dc57ee2b902f6652147c0f81e03e483df584a9c08b1687c9d","assets/shaders/ink_sparkle.frag":"2dca5ab93d4ec29e963f996f3916320ba60825e9537dfb149a68008c7a16b026","assets/shaders/stretch_effect.frag":"ab412f07a5b9b50b67a885b24dbe16929738ae28630407d6490c924caf0a3220","canvaskit/canvaskit.js":"bb559f6080c7d312ac2a912b4abec9f68ff3d3022d4a603c7796b9b31460642b","canvaskit/canvaskit.wasm":"fbed517a43e82452404446683f00f2e876d835aed84410695759e67b6bb01cd3","canvaskit/webparagraph/canvaskit.js":"3110e3e4d9b7b5657d336f253aaca8acca5777cde9319fb69ac302d6ff5a8b23","canvaskit/webparagraph/canvaskit.wasm":"0ce1b05082efdc8529550e8a01f6ff0593972d55525035010e26f5600aa9f254","favicon.png":"d550c557cebe70300ea41524c4782d980c817fa58ecefb638846192fc1c5a516","flutter.js":"2beb1ce6b159c71540aa66030af1d7964b6a92377cc78473745e02f97b74effe","flutter_bootstrap.js":"05bb8b67dd8b926f493f1b93af05843c0d302d61f405b4e9d400cbaf12cab919","icons/apple-touch-icon.png":"a38489422ec2cd235c65dbc968db9bf800efd33fe9aff7d6cf6e6925eaac9803","icons/Icon-192.png":"02d174426fe0e0d8cdcca1e5c63bf9cd58dd3847d9a844690e7160690b2c1d2c","icons/Icon-512.png":"8663f9e2c3456da8560476e3ea3a70419a55b658a6c7c9d732a786b8b23f6c02","icons/Icon-maskable-192.png":"8ff607d4db820bd44f625a4ce9d29faff57e6a8899c88b52564858f092bb5d79","icons/Icon-maskable-512.png":"2ed375d2262952f9ac511c020bbda8ad361171b83668c12f45427116c31c18c6","index.html":"9a57ccda94f85512db2a161e1952137461ef12cb012854e520393a77639adf79","./":"9a57ccda94f85512db2a161e1952137461ef12cb012854e520393a77639adf79","main.dart.js":"4e503765b75b68e08d2d58b274b74ce6effca02b242685a6ad12afe295d4fff1","manifest.json":"9c18ca9b05403f1f854dda30945a1b7dfd7156a790873fbfd715cb51a7a4cedd","version.json":"8d5dbe8894a24449ab1e8547e8f102f70530b24a15e618dc91aa0b58028f6904"};

async function impronta(buffer) {
  const h = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, '0')).join('');
}

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      await Promise.all(Object.entries(IMPRONTE).map(async ([file, attesa]) => {
        // ?v= fa chiedere alla CDN un indirizzo che non ha mai visto, e
        // cache: 'reload' salta la cache del browser. Si salva sotto il nome
        // vero, quello che l'app chiedera'.
        const risposta = await fetch(new Request(file + '?v=' + VERSIONE, { cache: 'reload' }));
        if (!risposta.ok) throw new Error(file + ': HTTP ' + risposta.status);
        const corpo = await risposta.arrayBuffer();
        if (await impronta(corpo) !== attesa) {
          throw new Error(file + ': non e\' il file pubblicato con questa versione');
        }
        await cache.put(file, new Response(corpo, {
          headers: { 'Content-Type': risposta.headers.get('Content-Type') || '' },
        }));
      }));
    } catch (errore) {
      // Una cache a meta' non deve restare in giro a sembrare buona.
      await caches.delete(CACHE);
      throw errore;
    }
    await self.skipWaiting();
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
