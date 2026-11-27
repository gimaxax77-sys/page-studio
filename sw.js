// 페이지 공방 오프라인 일꾼(서비스 워커) — 설치 때 data/files.json 목록을 통째로 저장해 두고, 이후엔 저장본을 먼저 쓴다
var CACHE = 'page-studio';
self.addEventListener('install', function (e) {
  e.waitUntil(fetch('data/files.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (m) {
    return caches.open(CACHE + '-' + m.version).then(function (c) { return c.addAll(m.files); });
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(fetch('data/files.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (m) {
    return caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE + '-' + m.version; }).map(function (k) { return caches.delete(k); })); });
  }).catch(function () { /* 오프라인 */ }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) { return hit || fetch(e.request); }));
});
// 판 991b67aa4c
