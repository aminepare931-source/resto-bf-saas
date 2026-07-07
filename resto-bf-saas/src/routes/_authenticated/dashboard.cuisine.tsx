import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { useRealtimeSubscription, useNotificationSound } from "@/hooks/use-realtime";
import { toast } from "sonner";
import { Clock, ChefHat, Bell, RefreshCw } from "lucide-react";
import { OrderCardSkeleton } from "@/components/ui/skeleton";
import type { Order, OrderStatus } from "@/types";
import { formatCurrency } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/cuisine")({
  component: CuisinePage,
});

type OrderItem = { name: string; price: number; qty: number };

const STATUS_LABEL: Record<string, string> = {
  new: "📌 En attente",
  in_kitchen: "🔥 En préparation",
  ready: "✅ Prêt",
  served: "Servi",
  paid: "Payé",
  cancelled: "Annulé",
};

const STATUS_COLOR: Record<string, string> = {
  new: "border-amber-500/30 bg-amber-500/5",
  in_kitchen: "border-blue-500/30 bg-blue-500/5",
  ready: "border-emerald-500/30 bg-emerald-500/5",
};

function Timer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState("");
  const start = new Date(startTime).getTime();

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - start;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(`${mins}:${secs.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [start]);

  const diff = Date.now() - start;
  const isUrgent = diff > 15 * 60 * 1000;
  const isWarning = diff > 10 * 60 * 1000;

  return (
    <span className={`font-mono text-sm font-bold ${
      isUrgent ? "text-red-400" : isWarning ? "text-amber-400" : "text-muted-foreground"
    }`}>
      <Clock className="w-3 h-3 inline mr-1" />
      {elapsed}
    </span>
  );
}

function CuisinePage() {
  const { restaurant: r } = useMyRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "cooking" | "ready">("pending");
  const playSound = useNotificationSound();

  // Chargement initial
  useEffect(() => {
    if (!r) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("orders" as never)
        .select("*")
        .eq("restaurant_id", r.id)
        .in("status", ["new", "in_kitchen", "ready"])
        .order("created_at", { ascending: true });

      if (!cancelled && data) {
        setOrders(data as unknown as Order[]);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [r]);

  // Abonnement temps réel
  useRealtimeSubscription<Order>({
    table: "orders",
    restaurantId: r?.id || "",
    enabled: !!r,
    onInsert: (newOrder) => {
      if (["new", "in_kitchen", "ready"].includes(newOrder.status)) {
        setOrders((prev) => [...prev, newOrder]);
        toast.success(`🛎️ Nouvelle commande !`, { duration: 5000 });
        playSound();
      }
    },
    onUpdate: (updated) => {
      setOrders((prev) => {
        if (["new", "in_kitchen", "ready"].includes(updated.status)) {
          return prev.map((o) => (o.id === updated.id ? updated : o));
        }
        return prev.filter((o) => o.id !== updated.id);
      });
    },
    onDelete: (old) => {
      setOrders((prev) => prev.filter((o) => o.id !== old.id));
    },
  });

  const setStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders" as never)
      .update({ status } as never)
      .eq("id", orderId);

    if (error) toast.error(error.message);
  };

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return orders.filter((o) => o.status === "new");
      case "cooking":
        return orders.filter((o) => o.status === "in_kitchen");
      case "ready":
        return orders.filter((o) => o.status === "ready");
      default:
        return orders;
    }
  }, [orders, activeTab]);

  const counts = {
    pending: orders.filter((o) => o.status === "new").length,
    cooking: orders.filter((o) => o.status === "in_kitchen").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  if (!r) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Cuisine</p>
        <h1 className="text-3xl font-black">Espace Cuisine</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center">
          <p className="text-2xl font-black text-amber-400">{counts.pending}</p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </div>
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 text-center">
          <p className="text-2xl font-black text-blue-400">{counts.cooking}</p>
          <p className="text-xs text-muted-foreground">En cours</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center">
          <p className="text-2xl font-black text-emerald-400">{counts.ready}</p>
          <p className="text-xs text-muted-foreground">Prêts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["pending", "cooking", "ready"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "bg-gold text-[#0a0a0f]"
                : "bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {STATUS_LABEL[tab === "pending" ? "new" : tab === "cooking" ? "in_kitchen" : "ready"]}
            {" · "}
            {counts[tab]}
          </button>
        ))}
      </div>

      {/* Commandes */}
      <div className="space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => <OrderCardSkeleton key={i} />)}
          </>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-white/15 text-center text-muted-foreground">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune commande</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`p-5 rounded-2xl border ${STATUS_COLOR[order.status] || "border-white/8 bg-dark-card"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <strong className="text-lg">
                      {order.table_number ? `🪑 Table ${order.table_number}` : "🛍️ À emporter"}
                    </strong>
                    {order.status === "in_kitchen" && <Timer startTime={order.created_at} />}
                  </div>
                  {order.customer_name && (
                    <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                  )}
                </div>
                <strong className="text-xl text-gold">{formatCurrency(Number(order.total))}</strong>
              </div>

              <ul className="text-sm space-y-1 mb-3">
                {(order.items as OrderItem[]).map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      <span className="text-gold font-bold">{item.qty}×</span> {item.name}
                    </span>
                    <span className="text-muted-foreground">{formatCurrency(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>

              {order.notes && (
                <p className="text-xs italic text-amber-400/80 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-3">
                  📝 {order.notes}
                </p>
              )}

              <div className="flex gap-2">
                {order.status === "new" && (
                  <button
                    onClick={() => setStatus(order.id, "in_kitchen")}
                    className="px-5 py-2.5 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-sm hover:bg-blue-500/30 flex items-center gap-2"
                  >
                    🔥 Commencer
                  </button>
                )}
                {order.status === "in_kitchen" && (
                  <button
                    onClick={() => setStatus(order.id, "ready")}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-sm hover:bg-emerald-500/30 flex items-center gap-2"
                  >
                    ✅ Marquer prêt
                  </button>
                )}
                {order.status === "ready" && (
                  <button
                    onClick={() => setStatus(order.id, "served")}
                    className="px-5 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-sm hover:bg-purple-500/30 flex items-center gap-2"
                  >
                    🚀 Servi
                  </button>
                )}
                {order.status !== "cancelled" && order.status !== "paid" && (
                  <button
                    onClick={() => setStatus(order.id, "cancelled")}
                    className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/10"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}