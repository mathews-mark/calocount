/*
 * CalTrack service worker.
 *
 * Deliberately conservative: network-first for everything, with the cache used
 * only as an offline fallback. Data here (entries, targets, weight) lives in a
 * Google Sheet and changes constantly, so serving a stale cached copy would be
 * worse than showing nothing. API requests are never cached.
 */

const CACHE = "caltrack-shell-v1"
const OFFLINE_URL = "/offline.html"
const PRECACHE = [OFFLINE_URL, "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // Never cache API responses — they must always be live.
  if (url.pathname.startsWith("/api/")) return

  // Page navigations: try the network, fall back to the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE)
        return (await cache.match(request)) || (await cache.match(OFFLINE_URL)) || Response.error()
      }),
    )
    return
  }

  // Static assets: network first, cache the result, fall back to cache offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        return cached || Response.error()
      }),
  )
})
