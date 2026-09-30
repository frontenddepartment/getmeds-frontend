/*
 * Retires the Getmeds website's service worker.
 *
 * The website used to be installable as an app (a PWA), and phones that installed it still run
 * the service worker it registered at /sw.js, with its cached pages. The app features now live
 * in the Getmeds mobile app, so the website registers no worker at all. Browsers re-check this
 * address on their own, find this file, and install it in place of the old worker; it then
 * deletes the old caches, unregisters itself and reloads any open getmeds.ph tab once, so the
 * visitor gets the live website with nothing left behind.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
      await self.registration.unregister();
      const windows = await self.clients.matchAll({ type: 'window' });
      windows.forEach((client) => client.navigate(client.url).catch(() => undefined));
    })(),
  );
});
