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
    background: #1a1a2e;
    border: 1px solid #d4a853;
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    max-width: 320px;
    color: #e8e6e3;
    font-family: Arial, sans-serif;
  `;

  prompt.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <span style="font-size:20px;">🔄</span>
      <strong style="font-size:14px;">Nouvelle version disponible</strong>
    </div>
    <p style="font-size:12px;color:#999;margin:0 0 12px 0;">
      Une mise à jour de Resto BF est disponible. Actualisez pour profiter des dernières améliorations.
    </p>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="sw-update-ignore" style="padding:6px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#999;font-size:12px;cursor:pointer;">Plus tard</button>
      <button id="sw-update-refresh" style="padding:6px 14px;border-radius:8px;border:none;background:linear-gradient(135deg,#d4a853,#b08800);color:#0a0a0f;font-size:12px;font-weight:bold;cursor:pointer;">Actualiser</button>
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