/**
 * Hook useOffline — Détection de connexion et gestion du mode hors ligne
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getPendingActions, addPendingAction, type PendingAction } from "@/lib/offline-db";

type OfflineState = {
  isOnline: boolean;
  wasOffline: boolean;
  pendingCount: number;
  pendingActions: PendingAction[];
};

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: !navigator.onLine,
    pendingCount: 0,
    pendingActions: [],
  });
  const syncInProgress = useRef(false);

  const refreshPending = useCallback(async () => {
    const actions = await getPendingActions();
    setState((prev) => ({
      ...prev,
      pendingCount: actions.length,
      pendingActions: actions,
    }));
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setState((prev) => ({ ...prev, isOnline: true, wasOffline: true }));
      await refreshPending();
      // Déclencher la synchronisation automatique
      if (!syncInProgress.current) {
        syncInProgress.current = true;
        try {
          await processSyncQueue();
        } finally {
          syncInProgress.current = false;
        }
      }
      // Réinitialiser wasOffline après un délai
      setTimeout(() => {
        setState((prev) => ({ ...prev, wasOffline: false }));
      }, 5000);
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Vérifier les actions en attente au montage
    refreshPending();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshPending]);

  return state;
}

/**
 * Traite la file d'attente de synchronisation
 */
export async function processSyncQueue() {
  const actions = await getPendingActions();
  if (actions.length === 0) return;

  for (const action of actions) {
    try {
      const response = await fetch(action.endpoint, {
        method: action.method,
        headers: { "Content-Type": "application/json" },
        body: action.body ? JSON.stringify(action.body) : undefined,
      });

      if (response.ok) {
        if (action.id !== undefined) {
          const { removePendingAction } = await import("@/lib/offline-db");
          await removePendingAction(action.id);
        }
      } else if ((action.retries ?? 0) >= 5) {
        // Abandonner après 5 tentatives
        if (action.id !== undefined) {
          const { removePendingAction } = await import("@/lib/offline-db");
          await removePendingAction(action.id);
        }
      } else {
        const { incrementRetry } = await import("@/lib/offline-db");
        if (action.id !== undefined) {
          await incrementRetry(action.id);
        }
      }
    } catch {
      // Pas de connexion, on réessaiera plus tard
      break;
    }
  }
}

/**
 * Hook utilitaire pour savoir si on est hors ligne
 */
export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Enregistre une action à rejouer quand la connexion revient
 */
export async function queueOfflineAction(
  type: string,
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown
) {
  await addPendingAction({ type, endpoint, method, body });
}