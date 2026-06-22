import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { SubscribeContactModal } from "@/components/SubscribeContactModal";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { restaurant: r } = useMyRestaurant();
  const [counts, setCounts] = useState({ menu: 0, resa: 0, reviews: 0, pending: 0 });
  const [subModal, setSubModal] = useState(false);

  useEffect(() => {
    if (!r) return;
    (async () => {
      const [m, res, rev, pen] = await Promise.all([
        supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("restaurant_id", r.id),
        supabase.from("reservations").select("id", { count: "exact", head: true }).eq("restaurant_id", r.id),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("restaurant_id", r.id),
        supabase.from("reservations").select("id", { count: "exact", head: true }).eq("restaurant_id", r.id).eq("status", "pending"),
      ]);
      setCounts({ menu: m.count ?? 0, resa: res.count ?? 0, reviews: rev.count ?? 0, pending: pen.count ?? 0 });
    })();
  }, [r?.id]);

  const publicUrl = r?.slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/r/${r.slug}` : null;

  const status = (r as { subscription_status?: string } | null)?.subscription_status;
  const trialEnds = (r as { trial_ends_at?: string | null } | null)?.trial_ends_at;
  const daysLeft = trialEnds
    ? Math.max(0, Math.ceil((new Date(trialEnds).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Tableau de bord</p>
        <h1 className="text-4xl font-black">
          Bonjour <span className="text-gradient-gold">{r?.name ?? "..."}</span> 👋
        </h1>
        <p className="mt-2 text-muted-foreground">Voici un aperçu de votre espace restaurateur.</p>
      </div>

      {status === "trial" && daysLeft !== null && (
        <div className="mb-8 p-5 rounded-2xl border-2 border-blue-400/40 bg-gradient-to-br from-blue-400/10 to-transparent grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-blue-300 font-bold mb-1">
              🎁 Essai gratuit
            </p>
            <strong className="block text-lg">
              {daysLeft > 0
                ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`
                : "Votre essai a expiré"}
            </strong>
            <p className="text-sm text-muted-foreground mt-1">
              Choisissez un abonnement pour garder toutes vos données et fonctionnalités actives.
            </p>
          </div>
          <button
            onClick={() => setSubModal(true)}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold whitespace-nowrap"
          >
            S'abonner
          </button>
        </div>
      )}

      {status === "expired" && (
        <div className="mb-8 p-5 rounded-2xl border-2 border-red-400/40 bg-red-400/5">
          <p className="text-xs uppercase tracking-widest text-red-300 font-bold mb-1">⚠️ Abonnement expiré</p>
          <strong className="block text-lg">Votre site n'est plus actif</strong>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Contactez notre assistance pour réactiver votre abonnement et remettre votre site en ligne.
          </p>
          <button
            onClick={() => setSubModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold"
          >
            Réactiver mon abonnement
          </button>
        </div>
      )}

      {!r?.template && (
        <Link to="/auth/choisir-template" className="block mb-8 p-5 rounded-2xl border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors">
          <strong className="text-gold">🎨 Choisissez votre template</strong>
          <p className="text-sm text-muted-foreground mt-1">Sélectionnez un design pour votre site public.</p>
        </Link>
      )}

      {publicUrl && (
        <div className="mb-8 p-5 rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold font-bold">Votre site est en ligne 🚀</p>
            <a href={publicUrl} target="_blank" rel="noopener" className="font-mono text-sm text-gold hover:underline">{publicUrl}</a>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(publicUrl); }} className="px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold hover:border-gold/40">Copier</button>
            <a href={publicUrl} target="_blank" rel="noopener" className="px-4 py-2 rounded-lg bg-gradient-gold text-[#0a0a0f] text-sm font-bold">Voir le site →</a>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-4 mb-10">
        <Stat label="Plats au menu" value={counts.menu} link="/dashboard/menu" />
        <Stat label="Réservations" value={counts.resa} hint={counts.pending ? `${counts.pending} en attente` : undefined} link="/dashboard/reservations" />
        <Stat label="Avis clients" value={counts.reviews} link="/dashboard/avis" />
        <Stat label="Forfait" value={(r?.plan ?? "—").toUpperCase()} link="/dashboard/parametres" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard title="Informations restaurant">
          <Row label="Nom" value={r?.name} />
          <Row label="Ville" value={r?.city} />
          <Row label="Cuisine" value={r?.cuisine ?? "—"} />
          <Row label="Téléphone" value={r?.phone} />
          <Row label="Email" value={r?.email} />
        </InfoCard>

        <InfoCard title="Votre site">
          <Row label="Template" value={r?.template ?? "Non choisi"} />
          <Row label="URL" value={r?.slug ? <code className="text-xs text-gold">/r/{r.slug}</code> : "—"} />
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
            <Link to="/dashboard/parametres" className="flex-1 text-center px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold hover:border-gold/40">Modifier infos</Link>
            <Link to="/auth/choisir-template" className="flex-1 text-center px-4 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] text-sm font-bold">Templates</Link>
          </div>
        </InfoCard>
      </div>

      <SubscribeContactModal open={subModal} onClose={() => setSubModal(false)} plan={r?.plan} />
    </div>
  );
}

function Stat({ label, value, hint, link }: { label: string; value: number | string; hint?: string; link?: string }) {
  const inner = (
    <div className="p-6 rounded-2xl border border-white/8 bg-dark-card hover:border-gold/30 transition-colors h-full">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-3xl font-black text-gradient-gold">{value}</p>
      {hint && <p className="mt-1 text-xs text-amber-400">{hint}</p>}
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
      <h3 className="text-sm font-black uppercase tracking-widest text-gold mb-4">{title}</h3>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-right truncate">{value ?? "—"}</span>
    </div>
  );
}
