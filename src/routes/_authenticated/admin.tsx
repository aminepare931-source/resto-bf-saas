import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
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
    if (!data) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Super-Admin — Resto BF" }] }),
  component: AdminPage,
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

type Review = {
  id: string;
  restaurant_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

function AdminPage() {
  const [tab, setTab] = useState<"overview" | "restaurants" | "activity">("overview");
  const [restos, setRestos] = useState<Resto[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const [r, res, rev] = await Promise.all([
      supabase.from("restaurants").select("id, name, slug, city, cuisine, plan, template, email, phone, owner_name, created_at").order("created_at", { ascending: false }),
      supabase.from("reservations").select("id, restaurant_id, customer_name, reservation_date, party_size, status, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("reviews").select("id, restaurant_id, author_name, rating, comment, created_at").order("created_at", { ascending: false }).limit(50),
    ]);
    setRestos((r.data ?? []) as Resto[]);
    setReservations((res.data ?? []) as Reservation[]);
    setReviews((rev.data ?? []) as Review[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const changePlan = async (id: string, plan: string) => {
    const { error } = await supabase.from("restaurants").update({ plan }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Forfait mis à jour");
    load();
  };

  const filtered = restos.filter((r) => {
    if (planFilter !== "all" && r.plan !== planFilter) return false;
    if (q && !`${r.name} ${r.city} ${r.email} ${r.owner_name}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: restos.length,
    gratuit: restos.filter((r) => r.plan === "gratuit").length,
    standard: restos.filter((r) => r.plan === "standard").length,
    premium: restos.filter((r) => r.plan === "premium").length,
    last30: restos.filter((r) => new Date(r.created_at) > new Date(Date.now() - 30 * 86400_000)).length,
    resa: reservations.length,
    reviews: reviews.length,
  };

  const restoName = (id: string) => restos.find((r) => r.id === id)?.name ?? "—";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center font-black text-[#0a0a0f]">★</div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Super-Admin</p>
              <strong className="block text-base">Resto BF — Pilotage SaaS</strong>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard" className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold hover:border-gold/40">← Mon resto</Link>
            <button onClick={load} className="px-4 py-2 rounded-xl bg-gradient-gold text-[#0a0a0f] text-sm font-bold">Rafraîchir</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-white/5">
          {(["overview", "restaurants", "activity"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "overview" ? "Vue d'ensemble" : t === "restaurants" ? `Restaurants (${restos.length})` : "Activité"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && <p className="text-muted-foreground">Chargement...</p>}

        {!loading && tab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-4">
              <Stat label="Restaurants" value={stats.total} accent />
              <Stat label="Inscriptions 30j" value={stats.last30} />
              <Stat label="Réservations" value={stats.resa} />
              <Stat label="Avis" value={stats.reviews} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <PlanCard label="Gratuit" value={stats.gratuit} total={stats.total} color="from-white/20 to-white/5" />
              <PlanCard label="Standard" value={stats.standard} total={stats.total} color="from-blue-500/30 to-blue-500/5" />
              <PlanCard label="Premium" value={stats.premium} total={stats.total} color="from-gold/40 to-gold/5" />
            </div>
            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
              <h3 className="text-sm font-black uppercase tracking-widest text-gold mb-4">Derniers inscrits</h3>
              <div className="space-y-2">
                {restos.slice(0, 8).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04]">
                    <div className="min-w-0">
                      <strong className="block truncate">{r.name}</strong>
                      <span className="text-xs text-muted-foreground">{r.city} · {r.email}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <PlanBadge plan={r.plan} />
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && tab === "restaurants" && (
          <div>
            <div className="flex flex-wrap gap-3 mb-5">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher (nom, ville, email...)"
                className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm focus:border-gold/40 outline-none"
              />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm"
              >
                <option value="all">Tous forfaits</option>
                <option value="gratuit">Gratuit</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/8 bg-dark-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/5">
                    <th className="px-4 py-3">Restaurant</th>
                    <th className="px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Gérant</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Forfait</th>
                    <th className="px-4 py-3">Inscrit</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <strong className="block">{r.name}</strong>
                        <span className="text-xs text-muted-foreground">{r.cuisine ?? "—"} · {r.template ?? "no template"}</span>
                      </td>
                      <td className="px-4 py-3">{r.city}</td>
                      <td className="px-4 py-3">{r.owner_name}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs">{r.email}</div>
                        <div className="text-xs text-muted-foreground">{r.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.plan}
                          onChange={(e) => changePlan(r.id, e.target.value)}
                          className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/10 text-xs"
                        >
                          <option value="gratuit">Gratuit</option>
                          <option value="standard">Standard</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-3 text-right">
                        {r.slug && (
                          <a href={`/r/${r.slug}`} target="_blank" rel="noopener" className="text-xs text-gold hover:underline">Voir site →</a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Aucun restaurant.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === "activity" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
              <h3 className="text-sm font-black uppercase tracking-widest text-gold mb-4">Dernières réservations</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {reservations.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-white/[0.02]">
                    <div className="flex justify-between items-start gap-2">
                      <strong>{r.customer_name}</strong>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-gold/10 text-gold">{r.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {restoName(r.restaurant_id)} · {r.party_size} pers. · {new Date(r.reservation_date).toLocaleString("fr-FR")}
                    </div>
                  </div>
                ))}
                {reservations.length === 0 && <p className="text-muted-foreground text-sm">Aucune réservation.</p>}
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
              <h3 className="text-sm font-black uppercase tracking-widest text-gold mb-4">Derniers avis</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {reviews.map((rv) => (
                  <div key={rv.id} className="p-3 rounded-xl bg-white/[0.02]">
                    <div className="flex justify-between items-start gap-2">
                      <strong>{rv.author_name}</strong>
                      <span className="text-xs text-gold">{"★".repeat(rv.rating)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{restoName(rv.restaurant_id)}</div>
                    {rv.comment && <p className="text-sm mt-1 text-foreground/80">{rv.comment}</p>}
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-muted-foreground text-sm">Aucun avis.</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${accent ? "border-gold/30 bg-gradient-to-br from-gold/10 to-transparent" : "border-white/8 bg-dark-card"}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-4xl font-black text-gradient-gold">{value}</p>
    </div>
  );
}

function PlanCard({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className={`p-6 rounded-2xl border border-white/8 bg-gradient-to-br ${color}`}>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
      <div className="mt-3 h-2 rounded-full bg-black/40 overflow-hidden">
        <div className="h-full bg-gradient-gold" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground mt-2">{pct}% des restos</p>
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const cls =
    plan === "premium" ? "bg-gold/15 text-gold border-gold/30" :
    plan === "standard" ? "bg-blue-500/15 text-blue-300 border-blue-500/30" :
    "bg-white/5 text-muted-foreground border-white/10";
  return <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${cls}`}>{plan}</span>;
}
