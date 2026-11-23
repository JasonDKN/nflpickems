// App shell only. Live data (ESPN, Firebase) is cross-origin and always goes straight to the network.
const CACHE = 'pickem-v1';
const keep = (req, res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(req, c)); } return res; };
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/assets/')) { // hashed build files never change, so cache first
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => keep(req, res))));
  } else { // pages and icons: network first so new deploys show up right away, cache only when offline
    e.respondWith(fetch(req).then((res) => keep(req, res)).catch(() => caches.match(req).then((hit) => hit || caches.match(new URL('./index.html', self.registration.scope)))));
  }
});
