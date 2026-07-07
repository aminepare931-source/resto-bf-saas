import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { Search, Filter, Clock, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { OrderCardSkeleton } from "@/components/ui/skeleton";
import type { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, ORDER_NEXT_STATUS, formatCurrency, formatDate } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/commandes")({
  component: OrdersPage,
});

type SortField = "date" | "total" | "status";
type SortDir = "asc" | "desc";

function OrdersPage() {
  const { restaurant: r } = useMyRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;
  const lastSeenCount = useRef(0);

  // Debounce la recherche
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!r) return;
    let cancelled = false;
    setLoading(true);

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
      if (!cancelled) setLoading(false);
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

  const setStatus = async (o: Order, status: OrderStatus) => {
    const { error } = await supabase
      .from("orders" as never)
      .update({ status } as never)
      .eq("id", o.id);
    if (error) toast.error(error.message);
    else toast.success(`Commande #${o.id.slice(0, 8)} → ${ORDER_STATUS_LABEL[status]}`);
  };

  const sendToKitchen = async (order: Order) => {
    if (!r?.whatsapp) {
      toast.error("Configurez votre numéro WhatsApp dans Paramètres");
      return;
    }

    const channel = order.restaurant_id ? 
      (await supabase.from("restaurants").select("notification_orders_channel").eq("id", order.restaurant_id).maybeSingle())?.data?.notification_orders_channel || "both" 
      : "both";

    const itemsList = order.items.map((it) => `• ${it.qty}x ${it.name} - ${formatCurrency(it.price * it.qty)}`).join("\n");
    const msg = `🍳 Nouvelle commande pour la cuisine\n\n` +
      `Commande #${order.id.slice(0, 8)}\n` +
      (order.table_number ? `🪑 Table ${order.table_number}\n` : "🛍️ À emporter\n") +
      (order.customer_name ? `👤 ${order.customer_name}\n` : "") +
      (order.customer_phone ? `📱 ${order.customer_phone}\n` : "") +
      `\n📋 Détails :\n${itemsList}\n` +
      `\n💰 Total : ${formatCurrency(Number(order.total))}` +
      (order.notes ? `\n\n📝 Notes : ${order.notes}` : "") +
      `\n\n⏰ ${new Date(order.created_at).toLocaleString("fr-FR")}`;

    if (channel === "whatsapp" || channel === "both") {
      const cleanPhone = r.whatsapp.replace(/\D/g, "");
      const encodedMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, "_blank");
      toast.success("Commande envoyée vers la cuisine via WhatsApp");
    } else {
      toast.success("Commande envoyée vers le panneau cuisine");
    }

    await setStatus(order, "in_kitchen");
  };

  // Filtrage et tri
  const filtered = useMemo(() => {
    let result = orders;

    // Filtre statut
    if (filter !== "all") {
      result = result.filter((o) => o.status === filter);
    }

    // Filtre date
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      result = result.filter((o) => new Date(o.created_at).toDateString() === today);
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter((o) => new Date(o.created_at) >= weekAgo);
    }

    // Recherche (debounced)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.table_number?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.toLowerCase().includes(q) ||
          o.items.some((item) => item.name.toLowerCase().includes(q)) ||
          o.notes?.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q),
      );
    }

    // Tri
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortField === "total") cmp = a.total - b.total;
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [orders, filter, debouncedSearch, dateFilter, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginatedOrders = filtered.slice(0, page * PER_PAGE);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of Object.keys(ORDER_STATUS_LABEL)) c[s] = orders.filter((o) => o.status === s).length;
    return c;
  }, [orders]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

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

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher par table, client, plat, notes..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-gold/50 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-wrap gap-2 flex-1">
          {(["all", ...Object.keys(ORDER_STATUS_LABEL)] as Array<OrderStatus | "all">).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                filter === s ? "bg-gold/20 border-gold/40 text-gold" : "border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "Toutes" : ORDER_STATUS_LABEL[s as OrderStatus]} · {counts[s] ?? 0}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["all", "today", "week"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                dateFilter === d ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {d === "all" ? "Tout" : d === "today" ? "Aujourd'hui" : "7 jours"}
            </button>
          ))}
        </div>
      </div>

      {/* Tri et résultats */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">
          {filtered.length} commande{filtered.length > 1 ? "s" : ""}
          {debouncedSearch && ` pour "${debouncedSearch}"`}
          {paginatedOrders.length < filtered.length && ` (affichage ${paginatedOrders.length})`}
        </p>
        <div className="flex gap-1">
          {(["date", "total", "status"] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                sortField === field ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              {field === "date" ? "Date" : field === "total" ? "Montant" : "Statut"}
              {sortField === field && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => <OrderCardSkeleton key={i} />)}
          </>
        ) : paginatedOrders.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 text-muted-foreground">
            {debouncedSearch ? "Aucune commande trouvée pour cette recherche." : "Aucune commande pour le moment."}
          </div>
        ) : (
          paginatedOrders.map((o) => {
            const next = ORDER_NEXT_STATUS[o.status];
            const isExpanded = expandedId === o.id;

            return (
              <article
                key={o.id}
                className="p-5 rounded-2xl border border-white/8 bg-dark-card transition-all hover:border-white/15"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-base">
                        {o.table_number ? `🪑 Table ${o.table_number}` : "🛍️ À emporter"}
                      </strong>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${ORDER_STATUS_COLOR[o.status]}`}>
                        {ORDER_STATUS_LABEL[o.status]}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {o.source}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(o.created_at)}
                      {o.customer_name && ` · ${o.customer_name}`}
                      {o.customer_phone && ` · ${o.customer_phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xl text-gold">{formatCurrency(Number(o.total))}</strong>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : o.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Articles (toujours visibles) */}
                <ul className="text-sm space-y-1 mb-3">
                  {o.items.slice(0, isExpanded ? undefined : 3).map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{it.qty}× {it.name}</span>
                      <span className="text-muted-foreground">{formatCurrency(it.price * it.qty)}</span>
                    </li>
                  ))}
                  {!isExpanded && o.items.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{o.items.length - 3} article{o.items.length - 3 > 1 ? "s" : ""}...
                    </li>
                  )}
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
                      → {ORDER_STATUS_LABEL[next]}
                    </button>
                  )}
                  {o.status === "new" && (
                    <button
                      onClick={() => sendToKitchen(o)}
                      className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 font-bold text-xs hover:bg-blue-500/30"
                    >
                      🍳 Envoyer en cuisine
                    </button>
                  )}
                  {o.status === "ready" && (
                    <button
                      onClick={() => setStatus(o, "served")}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs hover:bg-emerald-500/30"
                    >
                      ✓ Marquer servi
                    </button>
                  )}
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
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold disabled:opacity-30 hover:bg-white/5 transition-colors"
          >
            ← Précédent
          </button>
          <span className="text-xs text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold disabled:opacity-30 hover:bg-white/5 transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}