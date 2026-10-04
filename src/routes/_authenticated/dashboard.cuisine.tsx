import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { useRealtimeSubscription, useNotificationSound } from "@/hooks/use-realtime";
import { toast } from "sonner";
import {
  Clock,
  ChefHat,
  Flame,
  CheckCircle2,
  UtensilsCrossed,
  XCircle,
  Volume2,
  VolumeX,
  Armchair,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { OrderCardSkeleton } from "@/components/ui/skeleton";
import type { Order, OrderStatus } from "@/types";
import { formatCurrency } from "@/types";
import { announceNewOrder, isVoiceMuted, setVoiceMuted } from "@/lib/voice";

export const Route = createFileRoute("/_authenticated/dashboard/cuisine")({
  component: CuisinePage,
});

type OrderItem = { name: string; price: number; qty: number };

const STATUS_LABEL: Record<string, string> = {
  new: "En attente",
  in_kitchen: "En préparation",
  ready: "Prêt",
  served: "Servi",
  paid: "Payé",
  cancelled: "Annulé",
};

const STATUS_ICON: Record<string, LucideIcon> = {
  new: Clock,
  in_kitchen: Flame,
  ready: CheckCircle2,
};

const STATUS_COLOR: Record<string, string> = {
  new: "border-amber-brand/40 bg-amber-tint",
  in_kitchen: "border-terracotta/30 bg-terracotta-tint",
  ready: "border-emerald/30 bg-emerald-tint",
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
    <span
      className={`font-mono text-sm font-bold ${
        isUrgent ? "text-destructive" : isWarning ? "text-amber-deep" : "text-muted-foreground"
      }`}
    >
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
  const [voiceMutedState, setVoiceMutedState] = useState(() => isVoiceMuted());
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

    return () => {
      cancelled = true;
    };
  }, [r]);

  // Abonnement temps réel
  useRealtimeSubscription<Order>({
    table: "orders",
    restaurantId: r?.id || "",
    enabled: !!r,
    onInsert: (newOrder) => {
      if (["new", "in_kitchen", "ready"].includes(newOrder.status)) {
        setOrders((prev) => [...prev, newOrder]);
        toast.success("Nouvelle commande !", { duration: 5000 });
        playSound();
        announceNewOrder({
          tableNumber: newOrder.table_number,
          items: newOrder.items ?? [],
          total: newOrder.total,
        });
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
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-terracotta font-bold mb-2">
            Cuisine
          </p>
          <h1 className="text-3xl font-black text-foreground">Espace Cuisine</h1>
        </div>
        <button
          onClick={() => {
            setVoiceMutedState((v) => {
              setVoiceMuted(!v);
              return !v;
            });
          }}
          className={`shrink-0 p-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            voiceMutedState
              ? "border-border bg-surface-warm text-muted-foreground hover:text-foreground"
              : "border-emerald/40 bg-emerald-tint text-emerald-deep"
          }`}
          title={voiceMutedState ? "Annonces vocales coupées" : "Annonces vocales activées"}
        >
          {voiceMutedState ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{voiceMutedState ? "Son coupé" : "Son actif"}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-amber-brand/40 bg-amber-tint text-center">
          <p className="text-2xl font-black text-amber-deep">{counts.pending}</p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </div>
        <div className="p-4 rounded-xl border border-terracotta/30 bg-terracotta-tint text-center">
          <p className="text-2xl font-black text-terracotta-deep">{counts.cooking}</p>
          <p className="text-xs text-muted-foreground">En cours</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald/30 bg-emerald-tint text-center">
          <p className="text-2xl font-black text-emerald-deep">{counts.ready}</p>
          <p className="text-xs text-muted-foreground">Prêts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["pending", "cooking", "ready"] as const).map((tab) => {
          const statusKey = tab === "pending" ? "new" : tab === "cooking" ? "in_kitchen" : "ready";
          const TabIcon = STATUS_ICON[statusKey];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                activeTab === tab
                  ? "bg-terracotta text-white border-terracotta"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-terracotta/30"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {STATUS_LABEL[statusKey]}
              {" · "}
              {counts[tab]}
            </button>
          );
        })}
      </div>

      {/* Commandes */}
      <div className="space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune commande</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`p-5 rounded-2xl border ${STATUS_COLOR[order.status] || "border-border bg-card"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <strong className="text-lg flex items-center gap-2">
                      {order.table_number ? (
                        <>
                          <Armchair className="w-5 h-5 text-terracotta" />
                          Table {order.table_number}
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5 text-terracotta" />
                          À emporter
                        </>
                      )}
                    </strong>
                    {order.status === "in_kitchen" && <Timer startTime={order.created_at} />}
                  </div>
                  {order.customer_name && (
                    <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                  )}
                </div>
                <strong className="text-xl text-terracotta">
                  {formatCurrency(Number(order.total))}
                </strong>
              </div>

              <ul className="text-sm space-y-1 mb-3">
                {(order.items as OrderItem[]).map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      <span className="text-terracotta font-bold">{item.qty}×</span> {item.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              {order.notes && (
                <p className="text-xs italic text-amber-deep p-3 rounded-lg bg-amber-tint border border-amber-brand/30 mb-3">
                  {order.notes}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                {order.status === "new" && (
                  <button
                    onClick={() => setStatus(order.id, "in_kitchen")}
                    className="px-5 py-2.5 rounded-xl bg-terracotta text-white font-bold text-sm hover:bg-terracotta-deep transition-colors flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    Commencer
                  </button>
                )}
                {order.status === "in_kitchen" && (
                  <button
                    onClick={() => setStatus(order.id, "ready")}
                    className="px-5 py-2.5 rounded-xl bg-emerald text-white font-bold text-sm hover:bg-emerald-deep transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marquer prêt
                  </button>
                )}
                {order.status === "ready" && (
                  <button
                    onClick={() => setStatus(order.id, "served")}
                    className="px-5 py-2.5 rounded-xl bg-charcoal text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    Servi
                  </button>
                )}
                {order.status !== "cancelled" && order.status !== "paid" && (
                  <button
                    onClick={() => setStatus(order.id, "cancelled")}
                    className="px-5 py-2.5 rounded-xl border border-destructive/30 text-destructive font-bold text-sm hover:bg-destructive/10 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
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
