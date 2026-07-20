/**
 * Service Worker — Resto BF PWA
 * Stratégies de cache intelligentes pour le mode hors ligne
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `restobf-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `restobf-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `restobf-images-${CACHE_VERSION}`;
const API_CACHE = `restobf-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
];

// ─── Installation : pré-cache des assets statiques ───
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // On ajoute chaque ressource individuellement : si l'une d'elles
      // échoue (404, offline pendant le build, etc.), les autres sont
      // quand même mises en cache au lieu de tout faire échouer
      // (cache.addAll rejette en bloc à la moindre erreur).
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn("SW précache échoué pour", url, err)),
        ),
      );
    }),
  );
  self.skipWaiting();
});

// ─── Activation : nettoyage des anciens caches ───
self.addEventListener("activate", (event) => {
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Stratégies de cache ───

function isImage(url) {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)(\?.*)?$/i.test(url);
}

function isApiRequest(url) {
  return url.includes("/api/") || url.includes("/rest/") || url.includes("supabase");
}

function isStaticAsset(url) {
  return (
    STATIC_ASSETS.includes(url) ||
    /\.(js|css|woff2?|ttf|eot)(\?.*)?$/i.test(url)
  );
}

// ─── Cache First (statique) ───
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match("/offline");
  }
}

// ─── Network First (API) ───
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: "offline", message: "Vous êtes hors ligne" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ─── Stale While Revalidate (pages) ───
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ─── Cache Only (images) ───
async function cacheOnly(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Retourner une image placeholder
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#1a1a2e" width="200" height="200"/><text fill="#d4a853" font-size="14" text-anchor="middle" x="100" y="105">Image non disponible</text></svg>',
      { headers: { "Content-Type": "image/svg+xml" } }
    );
  }
}

// ─── Interception des requêtes ───
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes non-HTTP
  if (!url.protocol.startsWith("http")) return;

  // Ne pas intercepter les requêtes chrome-extension
  if (url.protocol === "chrome-extension:") return;

  // Stratégie selon le type de ressource
  if (isImage(url.href)) {
    event.respondWith(cacheOnly(request));
  } else if (isApiRequest(url.href)) {
    event.respondWith(networkFirst(request));
  } else if (isStaticAsset(url.href)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// ─── Gestion des messages ───
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CACHE_PAGE") {
    const { url, html } = event.data;
    caches.open(DYNAMIC_CACHE).then((cache) => {
      cache.put(
        url,
        new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        })
      );
    });
  }
});