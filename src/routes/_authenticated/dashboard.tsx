import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ConciergeBell,
  ChefHat,
  Armchair,
  CalendarDays,
  Images,
  Star,
  QrCode,
  Users,
  MessagesSquare,
  MessageCircle,
  Palette,
  BarChart3,
  Package,
  Brush,
  ReceiptText,
  CreditCard,
  Settings,
  LogOut,
  LayoutTemplate,
  Menu,
  type LucideIcon,
} from "lucide-react";
const LOGO_URL = "/restobf-logo.png";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord — RestoBF" }] }),
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
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
};

const adminNav: NavItem[] = [
  { to: "/dashboard", label: "Aperçu", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/dashboard/commandes", label: "Commandes", icon: ConciergeBell, badge: "Live" },
  { to: "/dashboard/cuisine", label: "Cuisine", icon: ChefHat },
  { to: "/dashboard/tables", label: "Tables", icon: Armchair },
  { to: "/dashboard/reservations", label: "Réservations", icon: CalendarDays },
  { to: "/dashboard/galerie", label: "Galerie", icon: Images },
  { to: "/dashboard/avis", label: "Avis clients", icon: Star },
  { to: "/dashboard/qr-code", label: "QR Code", icon: QrCode },
  { to: "/dashboard/staff", label: "Staff", icon: Users },
  { to: "/dashboard/chat", label: "Chat interne", icon: MessagesSquare, badge: "Nouveau" },
  { to: "/dashboard/messaging", label: "WhatsApp", icon: MessageCircle, badge: "Premium" },
  { to: "/dashboard/templates", label: "Templates", icon: Palette, badge: "Premium" },
  { to: "/dashboard/statistiques", label: "Statistiques", icon: BarChart3 },
  { to: "/dashboard/stocks", label: "Stocks", icon: Package },
  { to: "/dashboard/contenu", label: "Contenu & branding", icon: Brush },
  { to: "/dashboard/facturation", label: "Facturation", icon: ReceiptText, badge: "Premium" },
  { to: "/dashboard/paiements", label: "Paiements", icon: CreditCard },
  { to: "/dashboard/parametres", label: "Paramètres", icon: Settings },
];

const staffNav: Record<string, NavItem[]> = {
  cuisinier: [
    { to: "/dashboard/cuisine", label: "Cuisine", icon: ChefHat },
    { to: "/dashboard/commandes", label: "Commandes", icon: ConciergeBell },
    { to: "/dashboard/stocks", label: "Stocks", icon: Package },
    { to: "/dashboard/chat", label: "Chat", icon: MessagesSquare },
  ],
  serveur: [
    { to: "/dashboard/commandes", label: "Commandes", icon: ConciergeBell },
    { to: "/dashboard/tables", label: "Tables", icon: Armchair },
    { to: "/dashboard/chat", label: "Chat", icon: MessagesSquare },
  ],
  manager: [
    { to: "/dashboard", label: "Aperçu", icon: LayoutDashboard, exact: true },
    { to: "/dashboard/commandes", label: "Commandes", icon: ConciergeBell },
    { to: "/dashboard/cuisine", label: "Cuisine", icon: ChefHat },
    { to: "/dashboard/stocks", label: "Stocks", icon: Package },
    { to: "/dashboard/statistiques", label: "Statistiques", icon: BarChart3 },
    { to: "/dashboard/chat", label: "Chat", icon: MessagesSquare },
  ],
};

const badgeStyle: Record<string, string> = {
  Live: "bg-terracotta-tint text-terracotta-deep",
  Nouveau: "bg-emerald-tint text-emerald-deep",
  Premium: "bg-amber-tint text-amber-deep",
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
    sessionStorage.removeItem("staff_restaurant_id");

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
        <div className="lg:hidden fixed inset-0 bg-charcoal/45 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 border-r border-border bg-card flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 p-5 border-b border-border">
          <img
            src={LOGO_URL}
            alt="RestoBF"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl bg-white object-contain p-1 shadow-card border border-border"
          />
          <div>
            <strong className="block text-sm text-foreground">RestoBF</strong>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {isStaff ? staffName || "Staff" : "Admin"}
            </span>
          </div>
        </Link>

        {resto && !isStaff && (
          <div className="px-5 py-4 border-b border-border bg-surface-warm">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Restaurant
            </p>
            <strong className="block text-base text-foreground truncate">{resto.name}</strong>
            <span className="text-xs text-muted-foreground">{resto.city}</span>
            <span className="mt-2 inline-block px-2 py-0.5 rounded-md bg-terracotta-tint border border-terracotta/20 text-[10px] font-bold uppercase tracking-wider text-terracotta-deep">
              {resto.plan}
            </span>
          </div>
        )}

        {isStaff && (
          <div className="px-5 py-4 border-b border-border bg-surface-warm">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Staff
            </p>
            <strong className="block text-base text-foreground truncate">{staffName}</strong>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-tint border border-emerald/20 text-[10px] font-bold uppercase tracking-wider text-emerald-deep">
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
                  ? "bg-accent text-accent-foreground border border-terracotta/20"
                  : "text-muted-foreground hover:bg-surface-warm hover:text-foreground border border-transparent"
              }`}
            >
              <n.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1">{n.label}</span>
              {n.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-black ${
                    badgeStyle[n.badge] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {n.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          {!isStaff && (
            <Link
              to="/auth/choisir-template"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-surface-warm hover:text-terracotta transition-colors"
            >
              <LayoutTemplate className="w-[18px] h-[18px] shrink-0" />
              <span>Changer de template</span>
            </Link>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-border bg-card/90 backdrop-blur-xl">
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-foreground hover:bg-surface-warm transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <strong className="text-sm">{resto?.name ?? staffName ?? "RestoBF"}</strong>
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
