import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  type LucideIcon,
  Activity,
  AlarmClock,
  AlertTriangle,
  Armchair,
  Ban,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Brush,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Clock,
  Coins,
  CreditCard,
  ExternalLink,
  FileText,
  Film,
  FolderOpen,
  Gem,
  Globe,
  Headphones,
  Image,
  Inbox,
  Key,
  Leaf,
  Lightbulb,
  Link2,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Moon,
  Package,
  Palette,
  Paperclip,
  Pencil,
  Phone,
  Pin,
  QrCode,
  Receipt,
  Save,
  Send,
  Settings,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  User,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { invalidatePlanFeatures } from "@/lib/plans";
import { FEATURE_REGISTRY, FEATURE_BY_ID, type FeatureStatus } from "@/lib/features";
import { RestaurantsManager } from "@/components/super-admin/RestaurantsManager";
import { DataManager } from "@/components/super-admin/DataManager";
import { UsersManager } from "@/components/super-admin/UsersManager";

export const Route = createFileRoute("/super-admin")({
  ssr: false,
  beforeLoad: async () => {
    // Pas de session dans ce navigateur → page de connexion, puis retour ici automatiquement.
    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      throw redirect({ to: "/auth/connexion", search: { redirect: "/super-admin" } });
    }
  },
  head: () => ({ meta: [{ title: "Super Administration — RestoBF" }] }),
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
  logo_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  about_text: string | null;
  primary_color: string | null;
  font_family: string | null;
  sections: string | null;
  social_links: string | null;
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

type PlanFeature = {
  id: string;
  slug?: string | null;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  plans: string[];
  created_at: string;
  updated_at: string;
};

const PLAN_LABEL: Record<string, string> = {
  trial: "Essai",
  basique: "Basique",
  standard: "Standard",
  premium: "Premium",
  sur_mesure: "Sur mesure",
  gratuit: "Gratuit (legacy)",
};

/** Icône lucide par émoji hérité (données DB existantes) ou par nom court (saisie admin). */
const FEATURE_ICONS: Record<string, LucideIcon> = {
  "📱": Smartphone,
  "🍽️": Utensils,
  "📂": FolderOpen,
  "🌿": Leaf,
  "💬": MessageSquare,
  "🛒": ShoppingCart,
  "📋": ClipboardList,
  "🔔": Bell,
  "📲": QrCode,
  "🪑": Armchair,
  "🎨": Palette,
  "📅": Calendar,
  "🗓️": CalendarDays,
  "✅": CheckCircle2,
  "⏰": AlarmClock,
  "✨": Sparkles,
  "✏️": Pencil,
  "📊": BarChart3,
  "📈": TrendingUp,
  "💰": Coins,
  "👥": Users,
  "📥": Inbox,
  "🖼️": Image,
  "🎬": Film,
  "⭐": Star,
  "🔗": Link2,
  "🔑": Key,
  "👨‍🍳": ChefHat,
  "🟢": Activity,
  "📌": Pin,
  "📎": Paperclip,
  "🏷️": Tag,
  "📢": Megaphone,
  "💎": Gem,
  "📦": Package,
  "⚠️": AlertTriangle,
  "🚚": Truck,
  "📨": Send,
  "⚙️": Settings,
  "🌙": Moon,
  "💡": Lightbulb,
  "☀️": Sun,
  "🖌️": Brush,
  "🎧": Headphones,
  "📧": Mail,
  "📚": BookOpen,
  "💾": Save,
  "🧾": Receipt,
  "📄": FileText,
  "🌐": Globe,
  "⚡": Zap,
  menu: Utensils,
  qr: QrCode,
  stats: BarChart3,
  users: Users,
  card: CreditCard,
  clock: Clock,
  star: Star,
  bell: Bell,
  calendar: Calendar,
  message: MessageSquare,
  gallery: Image,
  settings: Settings,
  package: Package,
};

const featureIcon = (icon: string | null | undefined): LucideIcon =>
  (icon && FEATURE_ICONS[icon]) || Package;

const DEFAULT_FEATURES: PlanFeature[] = FEATURE_REGISTRY.map((f) => ({
  id: f.id,
  slug: f.id,
  name: f.name,
  description: f.description,
  category: f.category,
  icon: f.icon,
  plans: f.defaultPlans,
  created_at: "",
  updated_at: "",
}));

const STATUS_UI: Record<FeatureStatus, { label: string; cls: string; help: string }> = {
  live: {
    label: "Appliquée",
    cls: "bg-emerald-tint text-emerald-deep border-emerald/30",
    help: "Cocher / décocher change vraiment ce que voient les clients.",
  },
  core: {
    label: "Toujours active",
    cls: "bg-muted text-muted-foreground border-border",
    help: "Fonction de base, non désactivable.",
  },
  unlinked: {
    label: "Non reliée",
    cls: "bg-amber-tint text-amber-deep border-amber-brand/30",
    help: "La fonction existe, mais la case ne la contrôle pas encore.",
  },
  soon: {
    label: "À développer",
    cls: "bg-destructive/10 text-destructive border-destructive/30",
    help: "Pas encore développée : la case n'a aucun effet.",
  },
  manual: {
    label: "Service manuel",
    cls: "bg-muted text-muted-foreground border-border",
    help: "Service humain ou infrastructure, pas du code.",
  },
};

/** Vérifie le rôle puis affiche le tableau de bord, ou un écran d'accès refusé qui explique pourquoi. */
function SuperAdminPage() {
  type Access =
    | { status: "checking" }
    | { status: "ok" }
    | { status: "denied"; email?: string; error?: string; canClaim: boolean };
  const [access, setAccess] = useState<Access>({ status: "checking" });
  const [busy, setBusy] = useState(false);

  const check = async () => {
    setAccess({ status: "checking" });
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user) {
      window.location.href = "/auth/connexion?redirect=/super-admin";
      return;
    }
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();
    if (data) {
      setAccess({ status: "ok" });
      return;
    }
    const { data: exists } = await (supabase.rpc as any)("super_admin_exists");
    setAccess({
      status: "denied",
      email: user.email ?? undefined,
      error: error?.message,
      canClaim: exists === false,
    });
  };

  useEffect(() => {
    void check();
  }, []);

  const claim = async () => {
    setBusy(true);
    const { error } = await (supabase.rpc as any)("claim_super_admin");
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Vous êtes maintenant super admin");
    void check();
  };

  const switchAccount = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/connexion?redirect=/super-admin";
  };

  if (access.status === "checking") {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
        Vérification de l'accès…
      </div>
    );
  }

  if (access.status === "denied") {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground px-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <h1 className="text-2xl font-black mb-2">Accès refusé</h1>
          <p className="text-sm text-muted-foreground mb-1">
            Le compte connecté n'a pas le rôle <strong>super admin</strong>.
          </p>
          {access.email && (
            <p className="text-sm mb-4">
              Connecté en tant que <strong>{access.email}</strong>
            </p>
          )}
          {access.error && (
            <p className="text-xs text-destructive mb-4 break-words">Erreur : {access.error}</p>
          )}
          <div className="flex flex-col gap-3 mt-4">
            {access.canClaim && (
              <button
                onClick={claim}
                disabled={busy}
                className="px-5 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-black disabled:opacity-50"
              >
                {busy ? "..." : "Devenir super admin (aucun n'existe encore)"}
              </button>
            )}
            <button
              onClick={switchAccount}
              className="px-5 py-3 rounded-xl border border-border font-semibold hover:bg-surface-warm"
            >
              Me connecter avec un autre compte
            </button>
            <Link to="/dashboard" className="text-sm text-muted-foreground underline">
              Retour à mon tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <SuperAdminDashboard />;
}

function SuperAdminDashboard() {
  const [tab, setTab] = useState<
    "overview" | "restaurants" | "subscriptions" | "features" | "leads" | "data" | "users"
  >("overview");
  const [restos, setRestos] = useState<Resto[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [leads, setLeads] = useState<CustomOrder[]>([]);
  const [features, setFeatures] = useState<PlanFeature[]>(DEFAULT_FEATURES);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    setFeaturesLoading(true);
    const [r, res, l, f] = await Promise.all([
      supabase
        .from("restaurants")
        .select(
          "id, name, slug, city, cuisine, plan, template, email, phone, owner_name, created_at, subscription_status, trial_ends_at, subscription_ends_at, logo_url, hero_title, hero_subtitle, about_text, primary_color, font_family, sections, social_links",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("reservations")
        .select(
          "id, restaurant_id, customer_name, reservation_date, party_size, status, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("custom_orders" as never)
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("plan_features" as never)
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true }),
    ]);
    setRestos((r.data ?? []) as Resto[]);
    setReservations((res.data ?? []) as Reservation[]);
    setLeads(((l as { data: CustomOrder[] | null }).data ?? []) as CustomOrder[]);
    const featuresData = ((f as { data: PlanFeature[] | null }).data ?? []) as PlanFeature[];
    if (featuresData.length > 0) {
      const merged: PlanFeature[] = DEFAULT_FEATURES.map((df) => {
        const db = featuresData.find((fd) => fd.slug === df.id || fd.name === df.name);
        return db ? { ...df, id: db.id, slug: df.id, plans: db.plans } : { ...df, slug: df.id };
      });
      featuresData.forEach((fd) => {
        if (!merged.find((m) => m.id === fd.id)) merged.push(fd);
      });
      setFeatures(merged);
    } else {
      setFeatures(DEFAULT_FEATURES);
    }
    setFeaturesLoading(false);
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
      .update({ plan, subscription_status: "active", subscription_ends_at: ends.toISOString() })
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

  const updatePlan = async (id: string, plan: string) => {
    const { error } = await supabase.from("restaurants").update({ plan }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Plan mis à jour : ${PLAN_LABEL[plan] ?? plan}`);
    load();
  };

  const updateSubscriptionStatus = async (id: string, status: string) => {
    const updates: any = { subscription_status: status };
    if (status === "active") {
      const ends = new Date();
      ends.setMonth(ends.getMonth() + 1);
      updates.subscription_ends_at = ends.toISOString();
    }
    const { error } = await supabase.from("restaurants").update(updates).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Statut mis à jour : ${status}`);
    load();
  };

  const updateTemplate = async (id: string, template: string) => {
    const { error } = await supabase.from("restaurants").update({ template }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Template mis à jour : ${template}`);
    load();
  };

  const updateFeaturePlans = async (featureId: string, plans: string[]) => {
    const f = features.find((x) => x.id === featureId);
    if (!f) return;
    setFeatures((prev) => prev.map((x) => (x.id === featureId ? { ...x, plans } : x)));
    const { error } = f.slug
      ? await supabase.from("plan_features" as never).upsert(
          {
            slug: f.slug,
            name: f.name,
            description: f.description,
            category: f.category,
            icon: f.icon,
            plans,
          } as never,
          { onConflict: "slug" },
        )
      : await supabase
          .from("plan_features" as never)
          .update({ plans } as never)
          .eq("id", featureId);
    if (error) {
      toast.error(`Non enregistré : ${error.message}`);
      load();
      return;
    }
    invalidatePlanFeatures();
    toast.success("Fonctionnalité mise à jour — appliquée aux sites");
  };

  const addFeature = async () => {
    const name = prompt("Nom de la fonctionnalité :");
    if (!name) return;
    const description = prompt("Description (optionnelle) :") || "";
    const category = prompt("Catégorie :") || "other";
    const icon =
      prompt("Icône (menu, qr, stats, users, card, clock, star, bell, settings…) :") || "package";
    const slug = `custom-${name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;
    const { error } = await supabase
      .from("plan_features" as never)
      .insert({ slug, name, description, category, icon, plans: ["basique"] } as never);
    if (error) return toast.error(`Non ajouté : ${error.message}`);
    invalidatePlanFeatures();
    toast.success("Fonctionnalité ajoutée");
    load();
  };

  const deleteFeature = async (id: string) => {
    if (!confirm("Supprimer cette fonctionnalité ?")) return;
    const f = features.find((x) => x.id === id);
    const { error } = await supabase
      .from("plan_features" as never)
      .delete()
      .eq(f?.slug ? "slug" : "id", (f?.slug ?? id) as never);
    if (error) return toast.error(`Non supprimé : ${error.message}`);
    invalidatePlanFeatures();
    toast.success("Fonctionnalité supprimée");
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
          r.plan === "basique"
            ? 5000
            : r.plan === "standard"
              ? 10000
              : r.plan === "premium"
                ? 15000
                : 0;
        return acc + price;
      }, 0),
    leads: leads.filter((l) => l.status === "new").length,
  };
  const restoName = (id: string) => restos.find((r) => r.id === id)?.name ?? "—";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/95 border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-gold flex items-center justify-center font-black text-[#0a0a0f]">
              ★
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-gold font-bold">
                Super Administration
              </p>
              <strong className="block text-base truncate">Pilotage RestoBF</strong>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:border-gold/40"
            >
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
        <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-border/60 overflow-x-auto">
          {(
            [
              "overview",
              "restaurants",
              "subscriptions",
              "features",
              "leads",
              "data",
              "users",
            ] as const
          ).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === t ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t === "overview"
                ? "Vue d'ensemble"
                : t === "restaurants"
                  ? `Restaurants (${restos.length})`
                  : t === "subscriptions"
                    ? "Abonnements"
                    : t === "features"
                      ? "Fonctionnalités"
                      : t === "leads"
                        ? `Demandes (${leads.length})`
                        : t === "data"
                          ? "Données"
                          : "Comptes"}
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
              <div className="p-6 rounded-2xl border border-amber-brand/30 bg-amber-tint/60">
                <p className="text-xs uppercase tracking-widest text-amber-deep font-bold">
                  Demandes sur mesure
                </p>
                <p className="mt-2 text-4xl font-black">{stats.leads}</p>
                <p className="text-xs text-muted-foreground mt-1">nouvelles non traitées</p>
              </div>
              <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5">
                <p className="text-xs uppercase tracking-widest text-destructive font-bold">
                  Expirés à relancer
                </p>
                <p className="mt-2 text-4xl font-black">{stats.expired}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === "restaurants" && (
          <RestaurantsManager restos={restos} onChange={load} />
        )}

        {!loading && tab === "subscriptions" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Contrôle total des abonnements, plans, templates et fonctionnalités pour chaque
              restaurant.
            </p>
            {restos.map((r) => (
              <div key={r.id} className="p-6 rounded-2xl border border-border bg-card shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-border/60">
                  <div className="min-w-0 flex-1">
                    <strong className="truncate block text-base mb-1">{r.name}</strong>
                    <div className="text-xs text-muted-foreground space-x-2">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" /> {r.owner_name}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {r.email}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {r.city}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {r.phone}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge status={r.subscription_status} />
                      <span className="text-xs text-muted-foreground">
                        Plan: <strong className="text-gold">{PLAN_LABEL[r.plan] ?? r.plan}</strong>
                      </span>
                      {r.subscription_ends_at && (
                        <span className="text-xs text-muted-foreground">
                          · fin {new Date(r.subscription_ends_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`/${r.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:border-gold/40 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Voir le site
                    </a>
                  </div>
                </div>
                <div className="mb-4 p-4 rounded-xl bg-surface-warm border border-border/60">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold mb-3">
                    <CreditCard className="h-3.5 w-3.5" /> Plan d'abonnement
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(["basique", "standard", "premium"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => updatePlan(r.id, p)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${r.plan === p ? "bg-gradient-gold text-[#0a0a0f] shadow-gold" : "bg-surface-warm border border-input hover:border-gold/40 hover:bg-gold/5"}`}
                      >
                        {PLAN_LABEL[p]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4 p-4 rounded-xl bg-surface-warm border border-border/60">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold mb-3">
                    <Palette className="h-3.5 w-3.5" /> Template du site
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "gratuit-classique", name: "Classique", plan: "basique" },
                      { id: "std-soleil", name: "Soleil", plan: "standard" },
                      { id: "std-savane", name: "Savane", plan: "standard" },
                      { id: "std-marche", name: "Vert", plan: "standard" },
                      { id: "std-moderne", name: "Épuré", plan: "standard" },
                      { id: "prem-royal", name: "Palais Royal", plan: "premium" },
                      { id: "prem-nuit", name: "Aurum Nuit", plan: "premium" },
                      { id: "prem-feu", name: "Ignis Feu", plan: "premium" },
                      { id: "prem-luxe", name: "Luxe Grill", plan: "premium" },
                    ].map((tpl) => {
                      const canUse =
                        r.plan === "premium"
                          ? tpl.plan === "premium"
                          : tpl.plan === "basique" || tpl.plan === "standard";
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => canUse && updateTemplate(r.id, tpl.id)}
                          disabled={!canUse}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${r.template === tpl.id ? "bg-gradient-gold text-[#0a0a0f]" : canUse ? "bg-surface-warm border border-input hover:border-gold/40" : "bg-surface-warm border border-border/60 text-muted-foreground/50 cursor-not-allowed"}`}
                        >
                          {tpl.name}
                          {!canUse && <Lock className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-4 p-4 rounded-xl bg-surface-warm border border-border/60">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold mb-3">
                    <Clock className="h-3.5 w-3.5" /> Statut d'abonnement
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        value: "trial",
                        label: "Essai",
                        color: "bg-amber-tint border-amber-brand/30 text-amber-deep",
                      },
                      {
                        value: "active",
                        label: "Actif",
                        color: "bg-emerald-tint border-emerald/30 text-emerald-deep",
                      },
                      {
                        value: "expired",
                        label: "Expiré",
                        color: "bg-destructive/10 border-destructive/30 text-destructive",
                      },
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => updateSubscriptionStatus(r.id, status.value)}
                        className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${r.subscription_status === status.value ? status.color : "bg-surface-warm border-input text-muted-foreground hover:border-gold/40"}`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface-warm border border-border/60">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold mb-3">
                    <Zap className="h-3.5 w-3.5" /> Actions rapides
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() + 30);
                        supabase
                          .from("restaurants")
                          .update({ subscription_ends_at: date.toISOString() })
                          .eq("id", r.id);
                        toast.success("Abonnement prolongé de 30 jours");
                        load();
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-tint border border-emerald/30 text-xs font-bold text-emerald-deep hover:bg-emerald/15 transition-all"
                    >
                      +30 jours
                    </button>
                    <button
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() + 90);
                        supabase
                          .from("restaurants")
                          .update({ subscription_ends_at: date.toISOString() })
                          .eq("id", r.id);
                        toast.success("Abonnement prolongé de 3 mois");
                        load();
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-tint border border-emerald/30 text-xs font-bold text-emerald-deep hover:bg-emerald/15 transition-all"
                    >
                      +3 mois
                    </button>
                    <button
                      onClick={() => expire(r.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs font-bold text-destructive hover:bg-destructive/15 transition-all"
                    >
                      <Ban className="h-3.5 w-3.5" /> Marquer expiré
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Êtes-vous sûr de vouloir supprimer "${r.name}" ?\n\nCette action est irréversible !`,
                          )
                        ) {
                          supabase
                            .from("restaurants")
                            .delete()
                            .eq("id", r.id)
                            .then(() => {
                              toast.success("Restaurant supprimé");
                              load();
                            });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs font-bold text-destructive hover:bg-destructive/15 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "features" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Gérez les fonctionnalités disponibles pour chaque plan d'abonnement.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Une case n'a d'effet réel que si la fonctionnalité est{" "}
                  <strong>« Appliquée »</strong>. Les autres sont grisées pour ne pas vous induire
                  en erreur.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] font-bold uppercase">
                  {(["live", "unlinked", "soon", "manual", "core"] as FeatureStatus[]).map((st) => (
                    <span
                      key={st}
                      title={STATUS_UI[st].help}
                      className={`px-2 py-0.5 rounded border ${STATUS_UI[st].cls}`}
                    >
                      {STATUS_UI[st].label} (
                      {FEATURE_REGISTRY.filter((x) => x.status === st).length})
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={addFeature}
                className="px-4 py-2 rounded-xl bg-gradient-gold text-[#0a0a0f] text-xs font-bold hover:shadow-gold transition-all"
              >
                + Ajouter une fonctionnalité
              </button>
            </div>
            {!featuresLoading ? (
              <div className="space-y-8">
                {Object.entries(
                  features.reduce(
                    (acc, f) => {
                      if (!acc[f.category]) acc[f.category] = [];
                      acc[f.category].push(f);
                      return acc;
                    },
                    {} as Record<string, PlanFeature[]>,
                  ),
                ).map(([category, categoryFeatures]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gold border-b border-gold/20 pb-2">
                      {getCategoryLabel(category)}
                    </h3>
                    <div className="space-y-2">
                      {categoryFeatures.map((feature) => (
                        <div
                          key={feature.id}
                          className="p-4 rounded-xl border border-border bg-card shadow-card hover:border-gold/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <FeatureGlyph icon={feature.icon} />
                              <div>
                                <strong className="text-sm flex items-center gap-2 flex-wrap">
                                  {feature.name}
                                  {(() => {
                                    const st =
                                      FEATURE_BY_ID[feature.slug ?? feature.id]?.status ?? "live";
                                    return (
                                      <span
                                        title={STATUS_UI[st].help}
                                        className={`px-1.5 py-0.5 rounded border text-[9px] font-black uppercase ${STATUS_UI[st].cls}`}
                                      >
                                        {STATUS_UI[st].label}
                                      </span>
                                    );
                                  })()}
                                </strong>
                                {FEATURE_BY_ID[feature.slug ?? feature.id]?.note && (
                                  <p className="text-[11px] text-gold mt-0.5">
                                    {FEATURE_BY_ID[feature.slug ?? feature.id]?.note}
                                  </p>
                                )}
                                {feature.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {feature.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              {["basique", "standard", "premium"].map((plan) => (
                                <label
                                  key={plan}
                                  className="flex items-center gap-1.5 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    disabled={
                                      !["live"].includes(
                                        FEATURE_BY_ID[feature.slug ?? feature.id]?.status ?? "live",
                                      )
                                    }
                                    checked={feature.plans.includes(plan)}
                                    onChange={(e) => {
                                      const newPlans = e.target.checked
                                        ? [...feature.plans, plan]
                                        : feature.plans.filter((p) => p !== plan);
                                      updateFeaturePlans(feature.id, newPlans);
                                    }}
                                    className="w-4 h-4 accent-gold disabled:opacity-40 disabled:cursor-not-allowed"
                                  />
                                  <span className="text-xs font-semibold text-muted-foreground capitalize">
                                    {plan}
                                  </span>
                                </label>
                              ))}
                              <button
                                onClick={() => deleteFeature(feature.id)}
                                className="inline-flex items-center px-2 py-1 rounded-lg bg-destructive/10 border border-destructive/30 text-xs font-bold text-destructive hover:bg-destructive/15"
                                title="Supprimer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chargement des fonctionnalités...</p>
              </div>
            )}
          </div>
        )}

        {!loading && tab === "leads" && (
          <div className="space-y-3">
            {leads.length === 0 && (
              <p className="text-muted-foreground">Aucune demande sur mesure pour l'instant.</p>
            )}
            {leads.map((l) => (
              <div key={l.id} className="p-5 rounded-2xl border border-border bg-card shadow-card">
                <div className="flex justify-between gap-3 flex-wrap mb-2">
                  <div>
                    <strong className="text-base">{l.restaurant_name}</strong>
                    <div className="text-xs text-muted-foreground">
                      {l.contact_name} · {l.city ?? "—"} ·{" "}
                      {new Date(l.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-tint text-amber-deep border border-amber-brand/30 self-start">
                    {l.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm mb-2">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {l.phone}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {l.email}
                  </span>
                  {l.budget && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                        {l.budget}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-foreground/85 bg-surface-warm rounded-xl p-3">
                  {l.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "data" && <DataManager restos={restos} />}
        {!loading && tab === "users" && <UsersManager />}

        {!loading && tab === "overview" && reservations.length > 0 && (
          <div className="mt-8 p-6 rounded-2xl border border-border bg-card shadow-card">
            <h3 className="text-sm font-black uppercase tracking-widest text-gold mb-4">
              Dernières réservations
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {reservations.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-surface-warm text-sm">
                  <div className="flex justify-between gap-2 flex-wrap">
                    <strong>{r.customer_name}</strong>
                    <span className="text-xs text-muted-foreground">
                      {restoName(r.restaurant_id)}
                    </span>
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

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    menu: "Menu",
    order: "Commandes",
    qr: "QR Code",
    reservation: "Réservations",
    template: "Templates",
    stats: "Statistiques",
    gallery: "Galerie",
    reviews: "Avis clients",
    billing: "Facturation",
    staff: "Staff",
    marketing: "Marketing",
    reports: "Rapports",
    support: "Support",
    custom: "Personnalisation",
    domain: "Domaine",
    advanced: "Avancé",
    tables: "Tables",
    chat: "Chat interne",
    stock: "Stocks",
    messaging: "Messagerie",
    settings: "Paramètres",
  };
  return labels[category] || category;
}

function FeatureGlyph({ icon }: { icon: string | null }) {
  const Icon = featureIcon(icon);
  return <Icon className="h-5 w-5 mt-0.5 shrink-0 text-gold" />;
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
      className={`p-6 rounded-2xl border ${accent ? "border-gold/30 bg-gradient-to-br from-gold/10 to-transparent" : "border-border bg-card shadow-card"}`}
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-3xl font-black text-gradient-gold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    trial: "bg-amber-tint text-amber-deep border-amber-brand/30",
    active: "bg-emerald-tint text-emerald-deep border-emerald/30",
    expired: "bg-destructive/10 text-destructive border-destructive/30",
    suspended: "bg-destructive/10 text-destructive border-destructive/30",
    cancelled: "bg-muted text-muted-foreground border-border",
  };
  const cls = map[status ?? ""] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {status ?? "—"}
    </span>
  );
}
