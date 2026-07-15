import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/paiements")({
  head: () => ({ meta: [{ title: "Paiements — Resto BF" }] }),
  component: PaiementsPage,
});

type PaymentCode = {
  id: string;
  order_id: string;
  code: string;
  method: string;
  amount: number;
  used: boolean;
  used_at: string | null;
  created_at: string;
};

type OrderInfo = {
  id: string;
  table_number: string | null;
  customer_name: string | null;
  status: string;
};

type PaymentMethod = {
  id: string;
  restaurant_id: string;
  method: string;
  label: string;
  enabled: boolean;
  icon: string | null;
  phone_number: string | null;
  instructions: string | null;
  sort_order: number;
};

const METHOD_LABELS: Record<string, string> = {
  orange_money: "Orange Money",
  moov_money: "Moov Money",
  cash: "Espèces",
  wave: "Wave",
};

const METHOD_COLORS: Record<string, string> = {
  orange_money: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  moov_money: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cash: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  wave: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

function PaiementsPage() {
  const { restaurant: r, loading: loadingResto } = useMyRestaurant();
  const [payments, setPayments] = useState<(PaymentCode & { order?: OrderInfo })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "used" | "unused">("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Configuration des moyens de paiement
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [savingMethod, setSavingMethod] = useState<string | null>(null);

  const loadPayments = async () => {
    if (!r) return;
    setLoading(true);

    const { data: restaurants } = await supabase
      .from("restaurants")
      .select("id")
      .eq("user_id", (r as any).user_id);

    const restoIds = restaurants?.map((rest) => rest.id) ?? [r.id];

    const { data: orders } = await supabase
      .from("orders")
      .select("id, table_number, customer_name, status")
      .in("restaurant_id", restoIds);

    const orderMap = new Map<string, OrderInfo>();
    orders?.forEach((o) => orderMap.set(o.id, o as OrderInfo));

    const { data: codes } = await supabase
      .from("payment_codes" as never)
      .select("*")
      .order("created_at", { ascending: false });

    const enriched = ((codes ?? []) as PaymentCode[]).map((pc) => ({
      ...pc,
      order: orderMap.get(pc.order_id),
    }));

    setPayments(enriched);
    setLoading(false);
  };

  const loadPaymentMethods = async () => {
    if (!r) return;
    const { data } = await supabase
      .from("payment_methods" as never)
      .select("*")
      .eq("restaurant_id", r.id)
      .order("sort_order", { ascending: true });

    if (data) setPaymentMethods(data as PaymentMethod[]);
  };

  useEffect(() => {
    if (r) {
      loadPayments();
      loadPaymentMethods();
    }
  }, [r?.id]);

  const toggleMethod = async (method: PaymentMethod) => {
    setSavingMethod(method.id);
    const { error } = await supabase
      .from("payment_methods" as never)
      .update({ enabled: !method.enabled, updated_at: new Date().toISOString() } as never)
      .eq("id", method.id);

    if (error) {
      toast.error("Erreur: " + error.message);
    } else {
      toast.success(`${method.label} ${method.enabled ? "désactivé" : "activé"}`);
      loadPaymentMethods();
    }
    setSavingMethod(null);
  };

  const updateMethod = async (method: PaymentMethod, field: string, value: string) => {
    setSavingMethod(method.id);
    const { error } = await supabase
      .from("payment_methods" as never)
      .update({ [field]: value, updated_at: new Date().toISOString() } as never)
      .eq("id", method.id);

    if (error) {
      toast.error("Erreur: " + error.message);
    } else {
      toast.success(`${method.label} mis à jour`);
      loadPaymentMethods();
    }
    setSavingMethod(null);
  };

  // Filtrage
  const filtered = payments.filter((p) => {
    if (filter === "used" && !p.used) return false;
    if (filter === "unused" && p.used) return false;
    if (methodFilter !== "all" && p.method !== methodFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchCode = p.code.toLowerCase().includes(q);
      const matchOrder = p.order?.customer_name?.toLowerCase().includes(q);
      const matchTable = p.order?.table_number?.toLowerCase().includes(q);
      if (!matchCode && !matchOrder && !matchTable) return false;
    }
    return true;
  });

  // Stats
  const totalAmount = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const usedAmount = payments.filter((p) => p.used).reduce((s, p) => s + Number(p.amount || 0), 0);
  const pendingAmount = payments.filter((p) => !p.used).reduce((s, p) => s + Number(p.amount || 0), 0);
  const usedCount = payments.filter((p) => p.used).length;
  const pendingCount = payments.filter((p) => !p.used).length;

  if (loadingResto) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Paiements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historique des codes de paiement
          </p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent transition-colors"
        >
          {showConfig ? "Fermer" : "Configurer"}
        </button>
      </div>

      {/* Configuration des moyens de paiement */}
      {showConfig && (
        <div className="mb-8 p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Moyens de paiement</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-lg border ${method.enabled ? "border-border" : "border-border/50 opacity-60"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.enabled ? "Activé" : "Désactivé"}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={method.enabled}
                      onChange={() => toggleMethod(method)}
                      disabled={savingMethod === method.id}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>

                {(method.method === "orange_money" || method.method === "moov_money" || method.method === "wave") && method.enabled && (
                  <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Numéro</label>
                      <input
                        type="text"
                        defaultValue={method.phone_number || ""}
                        placeholder="+226 XX XX XX XX"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
                        onBlur={(e) => {
                          if (e.target.value !== (method.phone_number || "")) {
                            updateMethod(method, "phone_number", e.target.value);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Instructions</label>
                      <input
                        type="text"
                        defaultValue={method.instructions || ""}
                        placeholder="Optionnel"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
                        onBlur={(e) => {
                          if (e.target.value !== (method.instructions || "")) {
                            updateMethod(method, "instructions", e.target.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-xl font-bold">{totalAmount.toLocaleString("fr-FR")} F</p>
          <p className="text-xs text-muted-foreground">{payments.length} codes</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Payé</p>
          <p className="text-xl font-bold text-emerald-600">{usedAmount.toLocaleString("fr-FR")} F</p>
          <p className="text-xs text-muted-foreground">{usedCount} codes</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">En attente</p>
          <p className="text-xl font-bold text-amber-600">{pendingAmount.toLocaleString("fr-FR")} F</p>
          <p className="text-xs text-muted-foreground">{pendingCount} codes</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Moyens actifs</p>
          <p className="text-xl font-bold">{paymentMethods.filter((m) => m.enabled).length}</p>
          <p className="text-xs text-muted-foreground">sur {paymentMethods.length}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["all", "unused", "used"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Tous" : f === "used" ? "Payés" : "En attente"}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["all", "orange_money", "moov_money", "cash", "wave"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                methodFilter === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "all" ? "Tous" : METHOD_LABELS[m]}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="flex-1 min-w-[200px] px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
        />
      </div>

      {/* Tableau */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
          Aucun paiement trouvé
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Code</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Moyen</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Montant</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">{p.code}</td>
                  <td className="p-3">
                    <span>{p.order?.customer_name || "Client"}</span>
                    {p.order?.table_number && (
                      <span className="text-muted-foreground text-xs ml-1">
                        · T{p.order.table_number}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${METHOD_COLORS[p.method] || "bg-muted text-muted-foreground"}`}>
                      {METHOD_LABELS[p.method] || p.method}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium">
                    {Number(p.amount || 0).toLocaleString("fr-FR")} F
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3">
                    {p.used ? (
                      <span className="text-emerald-600 text-xs font-medium">Payé</span>
                    ) : (
                      <span className="text-amber-600 text-xs font-medium">En attente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Export */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            const csv = [
              ["Code", "Client", "Table", "Moyen", "Montant", "Date", "Statut"],
              ...filtered.map((p) => [
                p.code,
                p.order?.customer_name || "",
                p.order?.table_number || "",
                METHOD_LABELS[p.method] || p.method,
                Number(p.amount || 0).toString(),
                new Date(p.created_at).toLocaleDateString("fr-FR"),
                p.used ? "Payé" : "En attente",
              ]),
            ]
              .map((row) => row.join(","))
              .join("\n");

            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `paiements-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent transition-colors"
        >
          Exporter CSV
        </button>
      </div>
    </div>
  );
}