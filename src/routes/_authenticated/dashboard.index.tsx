import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { useIsSuperAdmin, useSuperAdminExists } from "@/hooks/use-is-super-admin";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { restaurant: r } = useMyRestaurant();
  const { isAdmin } = useIsSuperAdmin();
  const adminExists = useSuperAdminExists();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ menu: 0, resa: 0, reviews: 0, pending: 0 });
  const [claiming, setClaiming] = useState(false);

  const claim = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_super_admin");
    setClaiming(false);
    if (error) return toast.error(error.message);
    if (data) {
      toast.success("Tu es maintenant Super-Admin du SaaS !");
      navigate({ to: "/admin" });
    } else {
      toast.error("Un super-admin existe déjà.");
    }
  };

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

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Tableau de bord</p>
        <h1 className="text-4xl font-black">
          Bonjour <span className="text-gradient-gold">{r?.name ?? "..."}</span> 👋
        </h1>
        <p className="mt-2 text-muted-foreground">Voici un aperçu de votre espace restaurateur.</p>
      </div>

      {adminExists === false && !isAdmin && (
        <div className="mb-8 p-5 rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/15 to-transparent">
          <p className="text-xs uppercase tracking-widest text-gold font-bold mb-1">★ Propriétaire du SaaS ?</p>
          <strong className="block text-lg">Aucun Super-Admin n'a encore été désigné</strong>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Le premier à cliquer ici devient l'unique Super-Admin du SaaS Resto BF et accède au pilotage de tous les comptes. Ne clique que si tu es le propriétaire.
          </p>
          <button onClick={claim} disabled={claiming} className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold disabled:opacity-50">
            {claiming ? "..." : "Devenir Super-Admin"}
          </button>
        </div>
      )}

      {isAdmin && (
        <Link to="/admin" className="block mb-8 p-5 rounded-2xl border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors">
          <strong className="text-gold">★ Accéder au pilotage SaaS</strong>
          <p className="text-sm text-muted-foreground mt-1">Voir tous les restaurants inscrits, leurs forfaits et l'activité globale.</p>
        </Link>
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
