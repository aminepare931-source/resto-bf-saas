import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/commandes")({
  component: OrdersPage,
});

type OrderItem = { name: string; price: number; qty: number };
type Order = {
  id: string;
  restaurant_id: string;
  table_number: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  items: OrderItem[];
  total: number;
  status: "new" | "in_kitchen" | "ready" | "served" | "paid" | "cancelled";
  source: string;
  notes: string | null;
  created_at: string;
  whatsapp_sent_at: string | null;
};

const STATUS_LABEL: Record<Order["status"], string> = {
  new: "Nouveau",
  in_kitchen: "En cuisine",
  ready: "Prêt",
  served: "Servi",
  paid: "Payé",
  cancelled: "Annulé",
};
const STATUS_COLOR: Record<Order["status"], string> = {
  new: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  in_kitchen: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  ready: "bg-green-500/15 text-green-300 border-green-500/30",
  served: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
};
const NEXT_STATUS: Record<Order["status"], Order["status"] | null> = {
  new: "in_kitchen",
  in_kitchen: "ready",
  ready: "served",
  served: "paid",
  paid: null,
  cancelled: null,
};

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " F";
}

function OrdersPage() {
  const { restaurant: r } = useMyRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const lastSeenCount = useRef(0);

  useEffect(() => {
    if (!r) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("orders" as never)
        .select("*")
        .eq("restaurant_id", r.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (!cancelled && data) {
        setOrders(data as unknown as Order[]);
        lastSeenCount.current = data.length;
      }
    })();

    const channel = supabase
      .channel(`orders-${r.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${r.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as unknown as Order, ...prev]);
            toast.success(`🛎️ Nouvelle commande${(payload.new as Order).table_number ? ` · Table ${(payload.new as Order).table_number}` : ""}`);
            try {
              const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==");
              audio.play().catch(() => {});
            } catch {}
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) => prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as unknown as Order) : o)));
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== (payload.old as Order).id));
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [r]);

  const setStatus = async (o: Order, status: Order["status"]) => {
    const { error } = await supabase
      .from("orders" as never)
      .update({ status } as never)
      .eq("id", o.id);
    if (error) toast.error(error.message);
  };

  const sendToWhatsApp = (o: Order) => {
    if (!r?.whatsapp) {
      toast.error("Configurez votre numéro WhatsApp dans Paramètres.");
      return;
    }
    const lines = o.items.map((it) => `• ${it.qty}× ${it.name} — ${fmt(it.price * it.qty)}`).join("\n");
    const msg = encodeURIComponent(
      `🛎️ Nouvelle commande${o.table_number ? ` — Table ${o.table_number}` : ""}\n\n${lines}\n\nTotal : ${fmt(o.total)}${o.notes ? `\n\nNotes : ${o.notes}` : ""}${o.customer_phone ? `\n\nClient : ${o.customer_name ?? ""} ${o.customer_phone}` : ""}`,
    );
    window.open(`https://wa.me/${r.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
    void supabase.from("orders" as never).update({ whatsapp_sent_at: new Date().toISOString() } as never).eq("id", o.id);
  };

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of Object.keys(STATUS_LABEL)) c[s] = orders.filter((o) => o.status === s).length;
    return c;
  }, [orders]);

  if (!r) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Commandes</p>
        <h1 className="text-3xl font-black">Commandes en direct</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Les commandes des clients (QR code, WhatsApp, manuel) arrivent ici en temps réel.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(["all", ...Object.keys(STATUS_LABEL)] as Array<Order["status"] | "all">).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              filter === s ? "bg-gold/20 border-gold/40 text-gold" : "border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "all" ? "Toutes" : STATUS_LABEL[s as Order["status"]]} · {counts[s] ?? 0}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 text-muted-foreground">
            Aucune commande pour le moment.
          </div>
        )}
        {filtered.map((o) => {
          const next = NEXT_STATUS[o.status];
          return (
            <article key={o.id} className="p-5 rounded-2xl border border-white/8 bg-dark-card">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-base">
                      {o.table_number ? `🪑 Table ${o.table_number}` : "🛍️ À emporter"}
                    </strong>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${STATUS_COLOR[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {o.source}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(o.created_at).toLocaleString("fr-FR")}
                    {o.customer_name && ` · ${o.customer_name}`}
                    {o.customer_phone && ` · ${o.customer_phone}`}
                  </p>
                </div>
                <strong className="text-xl text-gold">{fmt(Number(o.total))}</strong>
              </div>

              <ul className="text-sm space-y-1 mb-3">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{it.qty}× {it.name}</span>
                    <span className="text-muted-foreground">{fmt(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>

              {o.notes && (
                <p className="text-xs italic text-muted-foreground p-3 rounded-lg bg-white/[0.02] border border-white/5 mb-3">
                  📝 {o.notes}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {next && (
                  <button
                    onClick={() => setStatus(o, next)}
                    className="px-4 py-2 rounded-lg bg-gradient-gold text-[#0a0a0f] font-bold text-xs"
                  >
                    → {STATUS_LABEL[next]}
                  </button>
                )}
                <button
                  onClick={() => sendToWhatsApp(o)}
                  className="px-4 py-2 rounded-lg bg-[#25D366] text-white font-bold text-xs"
                >
                  💬 Envoyer WhatsApp{o.whatsapp_sent_at ? " ✓" : ""}
                </button>
                {o.status !== "cancelled" && o.status !== "paid" && (
                  <button
                    onClick={() => setStatus(o, "cancelled")}
                    className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/10"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}