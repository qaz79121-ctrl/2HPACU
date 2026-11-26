/* 2H恢復室 財產點班：離線快取。裝一次後不需網路即可使用。
   更新網頁時把 VER 改掉，手機連上網路打開一次就會換成新版。 */
const VER = '2h-20261126c';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // 先用手機裡存好的版本（離線也能開），有網路時順便在背景更新
  e.respondWith(caches.open(VER).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true }) || (r.mode === 'navigate' ? await c.match('./index.html') : null);
    const net = fetch(r).then(res => { if (res && res.ok) c.put(r.mode === 'navigate' ? './index.html' : r, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || new Response('離線中，且此檔案尚未存到手機', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
