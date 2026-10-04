/**
 * PWA — Enregistrement du Service Worker et gestion de l'installation
 */

export function registerSW() {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker non supporté par ce navigateur");
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("Service Worker enregistré:", registration.scope);

      // Vérifier les mises à jour
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Nouvelle version disponible
              showUpdatePrompt(registration);
            }
          });
        }
      });
    } catch (error) {
      console.error("Erreur d'enregistrement du Service Worker:", error);
    }
  });
}

function showUpdatePrompt(registration: ServiceWorkerRegistration) {
  // Créer une notification de mise à jour
  const prompt = document.createElement("div");
  prompt.id = "sw-update-prompt";
  prompt.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    background: #ffffff;
    border: 1px solid #eae3d9;
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: 0 16px 32px -8px rgba(28, 32, 36, 0.18), 0 0 0 1px rgba(28, 32, 36, 0.08);
    max-width: 320px;
    color: #1c2024;
    font-family: 'Inter', Arial, sans-serif;
  `;

  prompt.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c85a32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
      <strong style="font-size:14px;">Nouvelle version disponible</strong>
    </div>
    <p style="font-size:12px;color:#57423b;margin:0 0 12px 0;">
      Une mise à jour de RestoBF est disponible. Actualisez pour profiter des dernières améliorations.
    </p>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="sw-update-ignore" style="padding:6px 14px;border-radius:8px;border:1px solid #d9d2c7;background:transparent;color:#57423b;font-size:12px;cursor:pointer;">Plus tard</button>
      <button id="sw-update-refresh" style="padding:6px 14px;border-radius:8px;border:none;background:linear-gradient(135deg,#c85a32,#e5a93c);color:#0a0a0f;font-size:12px;font-weight:bold;cursor:pointer;">Actualiser</button>
    </div>
  `;

  document.body.appendChild(prompt);

  document.getElementById("sw-update-refresh")?.addEventListener("click", () => {
    registration.waiting?.postMessage("SKIP_WAITING");
    window.location.reload();
  });

  document.getElementById("sw-update-ignore")?.addEventListener("click", () => {
    prompt.remove();
  });
}

/**
 * Vérifie si l'application peut être installée (beforeinstallprompt)
 */
export function useInstallPrompt() {
  let deferredPrompt: Event | null = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  return {
    canInstall: () => deferredPrompt !== null,
    install: async () => {
      if (deferredPrompt) {
        (deferredPrompt as any).prompt();
        const result = await (deferredPrompt as any).userChoice;
        deferredPrompt = null;
        return result.outcome === "accepted";
      }
      return false;
    },
  };
}
