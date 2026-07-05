import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "orders" | "stock_items" | "restaurant_tables" | "chat_messages" | "staff_members";

interface UseRealtimeOptions<T> {
  table: TableName;
  restaurantId: string;
  filter?: string;
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  onDelete?: (oldRecord: T) => void;
  enabled?: boolean;
}

/**
 * Hook qui s'abonne aux changements en temps réel d'une table Supabase
 * et nettoie automatiquement à la destruction
 */
export function useRealtimeSubscription<T extends Record<string, any>>({
  table,
  restaurantId,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete });
  callbacksRef.current = { onInsert, onUpdate, onDelete };

  const channelName = `${table}-${restaurantId}-${Date.now()}`;

  useEffect(() => {
    if (!enabled || !restaurantId) return;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: filter || `restaurant_id=eq.${restaurantId}`,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.eventType === "INSERT" && callbacksRef.current.onInsert) {
            callbacksRef.current.onInsert(payload.new as T);
          } else if (payload.eventType === "UPDATE" && callbacksRef.current.onUpdate) {
            callbacksRef.current.onUpdate(payload.new as T);
          } else if (payload.eventType === "DELETE" && callbacksRef.current.onDelete) {
            callbacksRef.current.onDelete(payload.old as T);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, restaurantId, filter, enabled]);
}

/**
 * Hook pour jouer un son de notification
 */
export function useNotificationSound() {
  const play = useCallback(() => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==",
      );
      audio.play().catch(() => {});
    } catch {}
  }, []);

  return play;
}