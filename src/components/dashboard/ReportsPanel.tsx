/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { toast } from "sonner";
import { Download, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlanAccess } from "@/lib/plans";

type Row = Record<string, any>;

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(filename: string, rows: Row[]) {
  if (!rows.length) {
    toast.error("Aucune donnée à exporter");
    return;
  }
  const cols = Object.keys(rows[0]);
  const body = [
    cols.join(";"),
    ...rows.map((r) => cols.map((c) => csvEscape(r[c])).join(";")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const fmt = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} F`;
const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/**
 * Exports CSV + rapport mensuel imprimable.
 * Chaque bloc n'apparaît que si la case correspondante est cochée pour le forfait (super admin).
 */
export function ReportsPanel({
  restaurantId,
  restaurantName,
  plan,
}: {
  restaurantId: string;
  restaurantName: string;
  plan?: string | null;
}) {
  const { has } = usePlanAccess(plan);
  const canExportStats = has("export-statistiques");
  const canExportData = has("export-donnees");
  const canMonthly = has("rapports-mensuels");
  const canSales = has("rapports-ventes");
  const [month, setMonth] = React.useState(monthKey());
  const [report, setReport] = React.useState<{
    orders: number;
    revenue: number;
    reservations: number;
    reviews: number;
    avgRating: number;
    avgTicket: number;
    top: { name: string; qty: number; revenue: number }[];
  } | null>(null);
  const [busy, setBusy] = React.useState(false);

  if (!canExportStats && !canExportData && !canMonthly && !canSales) return null;

  const range = () => {
    const [y, m] = month.split("-").map(Number);
    return { from: new Date(y, m - 1, 1).toISOString(), to: new Date(y, m, 1).toISOString() };
  };

  const fetchOrders = async () => {
    const { from, to } = range();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", from)
      .lt("created_at", to)
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as Row[];
  };

  const exportSales = async () => {
    setBusy(true);
    try {
      const orders = (await fetchOrders()).filter((o) => o.status !== "cancelled");
      const byDay = new Map<string, { commandes: number; chiffre_affaires: number }>();
      for (const o of orders) {
        const d = String(o.created_at).slice(0, 10);
        const cur = byDay.get(d) ?? { commandes: 0, chiffre_affaires: 0 };
        cur.commandes += 1;
        cur.chiffre_affaires += Number(o.total ?? 0);
        byDay.set(d, cur);
      }
      downloadCsv(
        `statistiques-${month}.csv`,
        [...byDay.entries()].map(([date, v]) => ({ date, ...v })),
      );
    } catch (e: any) {
      toast.error(e.message ?? "Erreur d'export");
    } finally {
      setBusy(false);
    }
  };

  const exportTable = async (table: string, label: string) => {
    setBusy(true);
    try {
      const { data, error } = await (supabase.from(table as never) as any)
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      downloadCsv(`${label}-${monthKey()}.csv`, (data ?? []) as Row[]);
    } catch (e: any) {
      toast.error(e.message ?? "Erreur d'export");
    } finally {
      setBusy(false);
    }
  };

  const buildReport = async () => {
    setBusy(true);
    try {
      const { from, to } = range();
      const orders = (await fetchOrders()).filter((o) => o.status !== "cancelled");
      const [{ count: resCount }, { data: revs }] = await Promise.all([
        supabase
          .from("reservations")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId)
          .gte("created_at", from)
          .lt("created_at", to),
        supabase
          .from("reviews")
          .select("rating")
          .eq("restaurant_id", restaurantId)
          .gte("created_at", from)
          .lt("created_at", to),
      ]);
      const revenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
      const top = new Map<string, { qty: number; revenue: number }>();
      for (const o of orders) {
        const items = Array.isArray(o.items) ? o.items : [];
        for (const it of items as Row[]) {
          const name = String(it.name ?? it.description ?? "Article");
          const qty = Number(it.quantity ?? it.qty ?? 1);
          const price = Number(it.price ?? it.unit_price ?? 0);
          const cur = top.get(name) ?? { qty: 0, revenue: 0 };
          cur.qty += qty;
          cur.revenue += qty * price;
          top.set(name, cur);
        }
      }
      const ratings = (revs ?? []).map((r: any) => Number(r.rating));
      setReport({
        orders: orders.length,
        revenue,
        reservations: resCount ?? 0,
        reviews: ratings.length,
        avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
        avgTicket: orders.length ? revenue / orders.length : 0,
        top: [...top.entries()]
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 8),
      });
    } catch (e: any) {
      toast.error(e.message ?? "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const btn =
    "px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-surface-warm inline-flex items-center gap-2 disabled:opacity-50";

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-6 print:border-0">
      <h3 className="text-lg font-bold mb-1">Rapports & exports</h3>
      <p className="text-xs text-muted-foreground mb-4 print:hidden">
        Mois sélectionné pour les rapports et l'export des ventes.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4 print:hidden">
        <input
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setReport(null);
          }}
          className="px-3 py-2 rounded-lg bg-surface-warm border border-input text-sm"
        />
        {(canMonthly || canSales) && (
          <button className={btn} onClick={buildReport} disabled={busy}>
            Générer le rapport
          </button>
        )}
        {canExportStats && (
          <button className={btn} onClick={exportSales} disabled={busy}>
            <Download className="w-4 h-4" /> Export des ventes (CSV)
          </button>
        )}
      </div>

      {canExportData && (
        <div className="flex flex-wrap gap-2 mb-4 print:hidden">
          <span className="text-xs uppercase tracking-wider text-muted-foreground self-center mr-1">
            Export des données :
          </span>
          <button
            className={btn}
            onClick={() => exportTable("orders", "commandes")}
            disabled={busy}
          >
            <Download className="w-4 h-4" /> Commandes
          </button>
          <button
            className={btn}
            onClick={() => exportTable("reservations", "reservations")}
            disabled={busy}
          >
            <Download className="w-4 h-4" /> Réservations
          </button>
          <button className={btn} onClick={() => exportTable("reviews", "avis")} disabled={busy}>
            <Download className="w-4 h-4" /> Avis
          </button>
          <button className={btn} onClick={() => exportTable("menu_items", "menu")} disabled={busy}>
            <Download className="w-4 h-4" /> Menu
          </button>
        </div>
      )}

      {report && (
        <div className="mt-4 rounded-xl border border-border p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-terracotta font-bold">
                Rapport {canMonthly ? "mensuel" : "de ventes"}
              </p>
              <h4 className="text-xl font-black">
                {restaurantName} —{" "}
                {new Date(`${month}-01`).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>
            </div>
            <button className={`${btn} print:hidden`} onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Imprimer / PDF
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <Kpi label="Chiffre d'affaires" value={fmt(report.revenue)} />
            <Kpi label="Commandes" value={String(report.orders)} />
            <Kpi label="Ticket moyen" value={fmt(report.avgTicket)} />
            {canMonthly && <Kpi label="Réservations" value={String(report.reservations)} />}
            {canMonthly && <Kpi label="Avis reçus" value={String(report.reviews)} />}
            {canMonthly && (
              <Kpi
                label="Note moyenne"
                value={report.avgRating ? `${report.avgRating.toFixed(1)} ★` : "—"}
              />
            )}
          </div>
          {report.top.length > 0 && (
            <div>
              <p className="text-sm font-bold mb-2">Articles les plus vendus</p>
              <table className="w-full text-sm">
                <tbody>
                  {report.top.map((t) => (
                    <tr key={t.name} className="border-b border-border/50">
                      <td className="py-1.5">{t.name}</td>
                      <td className="py-1.5 text-right text-muted-foreground">{t.qty} vendus</td>
                      <td className="py-1.5 text-right font-semibold">{fmt(t.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-warm p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}
