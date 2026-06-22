import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord — Resto BF" }] }),
  component: DashboardLayout,
});

type Restaurant = {
  id: string;
  name: string;
  slug: string | null;
  plan: string;
  template: string | null;
  city: string;
};

const nav = [
  { to: "/dashboard", label: "Aperçu", icon: "📊", exact: true },
  { to: "/dashboard/menu", label: "Menu", icon: "🍽️" },
  { to: "/dashboard/reservations", label: "Réservations", icon: "📅" },
  { to: "/dashboard/galerie", label: "Galerie", icon: "🖼️" },
  { to: "/dashboard/avis", label: "Avis clients", icon: "⭐" },
  { to: "/dashboard/parametres", label: "Paramètres", icon: "⚙️" },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [resto, setResto] = useState<Restaurant | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("restaurants")
        .select("id, name, slug, plan, template, city")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (data) setResto(data as Restaurant);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate({ to: "/" });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 border-r border-white/5 bg-[#070710] flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 p-5 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center font-black text-[#0a0a0f] shadow-gold">
            R
          </div>
          <div>
            <strong className="block text-sm">Resto BF</strong>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</span>
          </div>
        </Link>

        {resto && (
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Restaurant</p>
            <strong className="block text-base text-gold truncate">{resto.name}</strong>
            <span className="text-xs text-muted-foreground">{resto.city}</span>
            <span className="mt-2 inline-block px-2 py-0.5 rounded-md bg-gold/10 border border-gold/20 text-[10px] font-bold uppercase tracking-wider text-gold">
              {resto.plan}
            </span>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive(n.to, n.exact)
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground border border-transparent"
              }`}
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            to="/auth/choisir-template"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-white/[0.03] hover:text-gold transition-colors"
          >
            🎨 Changer de template
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-background/80 backdrop-blur-xl">
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center"
            aria-label="Menu"
          >
            ☰
          </button>
          <strong className="text-sm">{resto?.name ?? "Resto BF"}</strong>
          <div className="w-10" />
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
