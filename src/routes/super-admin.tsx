import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth/connexion" });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id)
      .eq("role", "super_admin")
      .maybeSingle();
    if (!data) throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Super Administration — Resto BF" }] }),
  component: SuperAdminPage,
});

type Resto = {
  id: string;
  name: string;
  slug: string | null;
  city: string;
  cuisine: string | null;
  plan: string;
  template: string | null;
  email: string;
  phone: string;
  owner_name: string;
  created_at: string;
  subscription_status: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
};

type Reservation = {
  id: string;
  restaurant_id: string;
  customer_name: string;
  reservation_date: string;
  party_size: number;
  status: string;
  created_at: string;
};

type CustomOrder = {
  id: string;
  restaurant_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string | null;
  budget: string | null;
  message: string;
  status: string;
  created_at: string;
};

const PLAN_LABEL: Record<string, string> = {
  trial: "Essai",
  standard: "Standard",
  standard_plus: "Standard+",
  premium: "Premium",
  sur_mesure: "Sur mesure",
  gratuit: "Gratuit (legacy)",
};

function SuperAdminPage() {
  const [tab, setTab] = useState<"overview" | "restaurants" | "subscriptions" | "leads">("overview");
  const [restos, setRestos] = useState<Resto[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [leads, setLeads] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const [r, res, l] = await Promise.all([
      supabase
        .from("restaurants")
        .select(
          "id, name, slug, city, cuisine, plan, template, email, phone, owner_name, created_at, subscription_status, trial_ends_at, subscription_ends_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("reservations")
        .select("id, restaurant_id, customer_name, reservation_date, party_size, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("custom_orders" as never)
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    setRestos((r.data ?? []) as Resto[]);
    setReservations((res.data ?? []) as Reservation[]);
    setLeads(((l as { data: CustomOrder[] | null }).data ?? []) as CustomOrder[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const activate = async (id: string, plan: string) => {
    const ends = new Date();
    ends.setMonth(ends.getMonth() + 1);
    const { error } = await supabase
      .from("restaurants")
      .update({
        plan,
        subscription_status: "active",
        subscription_ends_at: ends.toISOString(),
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Abonnement ${PLAN_LABEL[plan] ?? plan} activé pour 1 mois`);
    load();
  };

  const expire = async (id: string) => {
    const { error } = await supabase
      .from("restaurants")
      .update({ subscription_status: "expired" })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Abonnement marqué expiré");
    load();
  };

  const filtered = restos.filter(
    (r) =>
      !q ||
      `${r.name} ${r.city} ${r.email} ${r.owner_name}`.toLowerCase().includes(q.toLowerCase()),
  );

  const stats = {
    total: restos.length,
    trial: restos.filter((r) => r.subscription_status === "trial").length,
    active: restos.filter((r) => r.subscription_status === "active").length,
    expired: restos.filter((r) => r.subscription_status === "expired").length,
    revenue: restos
      .filter((r) => r.subscription_status === "active")
      .reduce((acc, r) => {
        const price =
          r.plan === "standard" ? 10000 : r.plan === "standard_plus" ? 15000 : r.plan === "premium" ? 25000 : 0;
        return acc + price;
      }, 0),
    leads: leads.filter((l) => l.status === "new").length,
  };

  const restoName = (id: string) => restos.find((r) => r.id === id)?.name ?? "—";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-gold flex items-center justify-center font-black text-[#0a0a0f]">
              ★
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Super Administration</p>
              <strong className="block text-base truncate">Pilotage Resto BF</strong>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/" className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold hover:border-gold/40">
              ← Site
            </Link>
            <button
              onClick={load}
              className="px-4 py-2 rounded-xl bg-gradient-gold text-[#0a0a0f] text-sm font-bold"
            >
              Rafraîchir
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-white/5 overflow-x-auto">
          {(["overview", "restaurants", "subscriptions", "leads"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t
                  ? "border-gold text-gold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "overview"
                ? "Vue d'ensemble"
                : t === "restaurants"
                ? `Restaurants (${restos.length})`
                : t === "subscriptions"
                ? "Abonnements"
                : `Demandes (${leads.length})`}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && <p className="text-muted-foreground">Chargement...</p>}

        {!loading && tab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Restaurants" value={stats.total} accent />
              <Stat label="Essais en cours" value={stats.trial} />
              <Stat label="Abonnés actifs" value={stats.active} />
              <Stat label="Revenus mensuels" value={`${stats.revenue.toLocaleString("fr-FR")} F`} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-amber-400/30 bg-amber-400/5">
                <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">Demandes sur mesure</p>
                <p className="mt-2 text-4xl font-black">{stats.leads}</p>
                <p className="text-xs text-muted-foreground mt-1">nouvelles non traitées</p>
              </div>
              <div className="p-6 rounded-2xl border border-red-400/30 bg-red-400/5">
                <p className="text-xs uppercase tracking-widest text-red-400 font-bold">Expirés à relancer</p>
                <p className="mt-2 text-4xl font-black">{stats.expired}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === "restaurants" && (
          <div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (nom, ville, email, gérant)..."
              className="w-full max-w-md mb-5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm focus:border-gold/40 outline-none"
            />
            <div className="overflow-x-auto rounded-2xl border border-white/8 bg-dark-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/5">
                    <th className="px-4 py-3">Restaurant</th>
                    <th className="px-4 py-3">Gérant</th>
                    <th className="px-4 py-3">Forfait</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Inscrit</th>
                    <th className="px-4 py-3 text-right">Site</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <strong>{r.name}</strong>
                        <div className="text-xs text-muted-foreground">
                          {r.city} · {r.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.owner_name}
                        <div className="text-xs text-muted-foreground">{r.phone}</div>
                      </td>
                      <td className="px-4 py-3">{PLAN_LABEL[r.plan] ?? r.plan}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.subscription_status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.slug && (
                          <a
                            href={`/r/${r.slug}`}
                            target="_blank"
                            rel="noopener"
                            className="text-xs text-gold hover:underline"
                          >
                            Voir →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted-foreground">
                        Aucun restaurant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === "subscriptions" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Activez ou prolongez manuellement un abonnement après réception du paiement (Orange Money / Moov Money).
            </p>
            {restos.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl border border-white/8 bg-dark-card grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center"
              >
                <div className="min-w-0">
                  <strong className="truncate block">{r.name}</strong>
                  <div className="text-xs text-muted-foreground">
                    {PLAN_LABEL[r.plan] ?? r.plan} · <StatusBadge status={r.subscription_status} />
                    {r.subscription_ends_at && (
                      <> · fin {new Date(r.subscription_ends_at).toLocaleDateString("fr-FR")}</>
                    )}
                    {!r.subscription_ends_at && r.trial_ends_at && (
                      <> · essai {new Date(r.trial_ends_at).toLocaleDateString("fr-FR")}</>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {(["standard", "standard_plus", "premium"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => activate(r.id, p)}
                      className="px-2.5 py-1 rounded-md bg-gold/10 border border-gold/30 text-[10px] font-bold text-gold hover:bg-gold/20"
                    >
                      + {PLAN_LABEL[p]}
                    </button>
                  ))}
                  <button
                    onClick={() => expire(r.id)}
                    className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-400 hover:bg-red-500/20"
                  >
                    Expirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "leads" && (
          <div className="space-y-3">
            {leads.length === 0 && (
              <p className="text-muted-foreground">Aucune demande sur mesure pour l'instant.</p>
            )}
            {leads.map((l) => (
              <div key={l.id} className="p-5 rounded-2xl border border-white/8 bg-dark-card">
                <div className="flex justify-between gap-3 flex-wrap mb-2">
                  <div>
                    <strong className="text-base">{l.restaurant_name}</strong>
                    <div className="text-xs text-muted-foreground">
                      {l.contact_name} · {l.city ?? "—"} · {new Date(l.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/30 self-start">
                    {l.status}
                  </span>
                </div>
                <div className="text-sm mb-2">
                  📞 {l.phone} · ✉️ {l.email} {l.budget && <>· 💰 {l.budget}</>}
                </div>
                <p className="text-sm text-foreground/85 bg-white/[0.03] rounded-xl p-3">{l.message}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "overview" && reservations.length > 0 && (
          <div className="mt-8 p-6 rounded-2xl border border-white/8 bg-dark-card">
            <h3 className="text-sm font-black uppercase tracking-widest text-gold mb-4">
              Dernières réservations
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {reservations.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-white/[0.02] text-sm">
                  <div className="flex justify-between gap-2 flex-wrap">
                    <strong>{r.customer_name}</strong>
                    <span className="text-xs text-muted-foreground">{restoName(r.restaurant_id)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.party_size} pers. · {new Date(r.reservation_date).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-2xl border ${
        accent
          ? "border-gold/30 bg-gradient-to-br from-gold/10 to-transparent"
          : "border-white/8 bg-dark-card"
      }`}
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-3xl font-black text-gradient-gold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    trial: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    active: "bg-green-500/15 text-green-300 border-green-500/30",
    expired: "bg-red-500/15 text-red-300 border-red-500/30",
    cancelled: "bg-white/5 text-muted-foreground border-white/10",
  };
  const cls = map[status ?? ""] ?? "bg-white/5 text-muted-foreground border-white/10";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status ?? "—"}
    </span>
  );
}