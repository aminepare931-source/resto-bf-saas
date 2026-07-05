import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Clock } from "lucide-react";

/**
 * Bannière indiquant le statut hors ligne avec compteur d'actions en attente
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [show, setShow] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(true);
      setShow(true);
      // Simuler la reconnexion
      setTimeout(() => {
        setIsReconnecting(false);
        setPendingCount(0);
      }, 1500);
      setTimeout(() => setShow(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShow(true);
      // Simuler des actions en attente
      setPendingCount((prev) => prev + 1);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setShow(true);
      setPendingCount(1);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[200] px-4 py-3 text-center text-sm font-bold transition-all duration-500 ${
        isReconnecting
          ? "bg-blue-600 text-white"
          : isOnline
          ? "bg-emerald-600 text-white"
          : "bg-amber-600 text-white"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isReconnecting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Reconnexion en cours...
          </>
        ) : isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            ✅ Connexion rétablie
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>
              📡 Vous êtes hors ligne
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px]">
                  <Clock className="w-3 h-3" />
                  {pendingCount} action{pendingCount > 1 ? "s" : ""} en attente
                </span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
}