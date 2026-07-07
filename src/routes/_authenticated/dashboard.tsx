import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const LOGO_URL = "/restobf-logo.png";

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

type NavItem = {
  to: string;
  label: string;
  icon: string;
  exact?: boolean;
  badge?: string;
};

const adminNav: NavItem[] = [
  { to: "/dashboard", label: "Aperçu", icon: "📊", exact: true },
  { to: "/dashboard/menu", label: "Menu", icon: "🍽️" },
  { to: "/dashboard/commandes", label: "Commandes", icon: "🛎️", badge: "Live" },
  { to: "/dashboard/cuisine", label: "Cuisine", icon: "👨‍🍳", badge: "Premium" },
  { to: "/dashboard/tables", label: "Tables", icon: "🪑" },
  { to: "/dashboard/reservations", label: "Réservations", icon: "📅" },
  { to: "/dashboard/galerie", label: "Galerie", icon: "🖼️" },
  { to: "/dashboard/avis", label: "Avis clients", icon: "⭐" },
  { to: "/dashboard/qr-code", label: "QR Code", icon: "📱" },
  { to: "/dashboard/staff", label: "Staff", icon: "👥" },
  { to: "/dashboard/chat", label: "Chat interne", icon: "💬", badge: "Nouveau" },
  { to: "/dashboard/messaging", label: "WhatsApp", icon: "📱", badge: "Premium" },
  { to: "/dashboard/templates", label: "Templates", icon: "🎨", badge: "Premium" },
  { to: "/dashboard/statistiques", label: "Statistiques", icon: "📈" },
  { to: "/dashboard/stocks", label: "Stocks", icon: "📦" },
  { to: "/dashboard/contenu", label: "Contenu & branding", icon: "🖌️" },
  { to: "/dashboard/facturation", label: "Facturation", icon: "🧾", badge: "Premium" },
  { to: "/dashboard/parametres", label: "Paramètres", icon: "⚙️" },
];

const staffNav: Record<string, NavItem[]> = {
  cuisinier: [
    { to: "/dashboard/cuisine", label: "Cuisine", icon: "👨‍🍳" },
    { to: "/dashboard/commandes", label: "Commandes", icon: "🛎️" },
    { to: "/dashboard/stocks", label: "Stocks", icon: "📦" },
    { to: "/dashboard/chat", label: "Chat", icon: "💬" },
  ],
  serveur: [
    { to: "/dashboard/commandes", label: "Commandes", icon: "🛎️" },
    { to: "/dashboard/tables", label: "Tables", icon: "🪑" },
    { to: "/dashboard/chat", label: "Chat", icon: "💬" },
  ],
  manager: [
    { to: "/dashboard", label: "Aperçu", icon: "📊", exact: true },
    { to: "/dashboard/commandes", label: "Commandes", icon: "🛎️" },
    { to: "/dashboard/cuisine", label: "Cuisine", icon: "👨‍🍳" },
    { to: "/dashboard/stocks", label: "Stocks", icon: "📦" },
    { to: "/dashboard/statistiques", label: "Statistiques", icon: "📈" },
    { to: "/dashboard/chat", label: "Chat", icon: "💬" },
  ],
};

function DashboardLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [resto, setResto] = useState<Restaurant | null>(null);
  const [open, setOpen] = useState(false);
  const [staffRole, setStaffRole] = useState<string | null>(null);
  const [staffName, setStaffName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Check if user is staff (from session storage)
      const role = sessionStorage.getItem("staff_role");
      const name = sessionStorage.getItem("staff_name");

      if (role && name) {
        setStaffRole(role);
        setStaffName(name);
        return;
      }

      // Otherwise, check if user is restaurant owner
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
    // Clear staff session
    sessionStorage.removeItem("staff_id");
    sessionStorage.removeItem("staff_name");
    sessionStorage.removeItem("staff_role");

    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate({ to: "/" });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  // Determine which nav to show
  const isStaff = !!staffRole;
  const nav = isStaff && staffRole ? staffNav[staffRole] || [] : adminNav;

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
          <img src={LOGO_URL} alt="RestoBF" width={40} height={40} className="w-10 h-10 rounded-xl bg-white object-contain p-1 shadow-gold" />
          <div>
            <strong className="block text-sm">RestoBF</strong>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {isStaff ? staffName || "Staff" : "Admin"}
            </span>
          </div>
        </Link>

        {resto && !isStaff && (
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Restaurant</p>
            <strong className="block text-base text-gold truncate">{resto.name}</strong>
            <span className="text-xs text-muted-foreground">{resto.city}</span>
            <span className="mt-2 inline-block px-2 py-0.5 rounded-md bg-gold/10 border border-gold/20 text-[10px] font-bold uppercase tracking-wider text-gold">
              {resto.plan}
            </span>
          </div>
        )}

        {isStaff && (
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Staff</p>
            <strong className="block text-base text-gold truncate">{staffName}</strong>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider text-blue-400">
              {staffRole}
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
              <span className="flex-1">{n.label}</span>
              {"badge" in n && n.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-gold/20 text-gold font-black">
                  {n.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          {!isStaff && (
            <Link
              to="/auth/choisir-template"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-white/[0.03] hover:text-gold transition-colors"
            >
              🎨 Changer de template
            </Link>
          )}
          <div className="flex items-center gap-2 px-4 py-2">
            <ThemeToggle />
          </div>
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

        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-x-hidden">
          <OfflineBanner />
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}