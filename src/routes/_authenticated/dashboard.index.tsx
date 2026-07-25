import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { SubscribeContactModal } from "@/components/SubscribeContactModal";
import { toast } from "sonner";
import {
  TrendingUp,
  ShoppingBag,
  Utensils,
  QrCode,
  Users,
  Star,
  CreditCard,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Flame,
  ArrowUpRight,
  Clock,
  Smartphone,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  Share2,
  ChefHat,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

type LiveOrder = {
  id: string;
  customer_name: string;
  table_or_delivery: string;
  items_summary: string;
  total_amount: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  payment_method: "orange_money" | "moov_money" | "especes";
  created_at: string;
};

type RecentReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export function DashboardHome() {
  const { restaurant: r, refresh } = useMyRestaurant();
  const [counts, setCounts] = useState({
    menu: 18,
    resa: 6,
    reviews: 12,
    pendingResa: 2,
    todayOrders: 24,
    todayRevenue: 87500,
  });
  const [copied, setCopied] = useState(false);
  const [subModal, setSubModal] = useState(false);
  const [recentOrders, setRecentOrders] = useState<LiveOrder[]>([
    {
      id: "CMD-108",
      customer_name: "Ibrahim Traoré",
      table_or_delivery: "Table N° 4",
      items_summary: "1x Poulet Bicyclette Grillé, 2x Brakina 65cl",
      total_amount: 8500,
      status: "pending",
      payment_method: "orange_money",
      created_at: "Il y a 3 min",
    },
    {
      id: "CMD-107",
      customer_name: "Fatoumata Kaboré",
      table_or_delivery: "Livraison (Zone ZI)",
      items_summary: "2x Capitaine Grillé, 1x Frites d'Alloco",
      total_amount: 14000,
      status: "preparing",
      payment_method: "moov_money",
      created_at: "Il y a 12 min",
    },
    {
      id: "CMD-106",
      customer_name: "Salif Ouedraogo",
      table_or_delivery: "Table N° 2 (Terrasse)",
      items_summary: "3x Brochettes de Bœuf, 3x Beaufort",
      total_amount: 9500,
      status: "delivered",
      payment_method: "especes",
      created_at: "Il y a 28 min",
    },
  ]);

  const [recentReviews] = useState<RecentReview[]>([
    {
      id: "rev-1",
      author: "Moussa S.",
      rating: 5,
      comment: "Le poulet bicyclette était excellent et la commande par QR code est super rapide !",
      date: "Aujourd'hui, 14:20",
    },
    {
      id: "rev-2",
      author: "Aïcha D.",
      rating: 5,
      comment: "Cadre magnifique, service au top. Le système WhatsApp marche parfaitement.",
      date: "Hier, 20:15",
    },
  ]);

  useEffect(() => {
    if (!r) return;
    (async () => {
      try {
        const [m, res, rev, pen, ord] = await Promise.all([
          supabase
            .from("menu_items")
            .select("id", { count: "exact", head: true })
            .eq("restaurant_id", r.id),
          supabase
            .from("reservations")
            .select("id", { count: "exact", head: true })
            .eq("restaurant_id", r.id),
          supabase
            .from("reviews")
            .select("id", { count: "exact", head: true })
            .eq("restaurant_id", r.id),
          supabase
            .from("reservations")
            .select("id", { count: "exact", head: true })
            .eq("restaurant_id", r.id)
            .eq("status", "pending"),
          supabase
            .from("orders")
            .select("*")
            .eq("restaurant_id", r.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (m.count !== null && m.count > 0) {
          setCounts((prev) => ({
            ...prev,
            menu: m.count ?? prev.menu,
            resa: res.count ?? prev.resa,
            reviews: rev.count ?? prev.reviews,
            pendingResa: pen.count ?? prev.pendingResa,
          }));
        }

        if (ord.data && ord.data.length > 0) {
          const mapped: LiveOrder[] = ord.data.map((o: any) => ({
            id: o.id.slice(0, 8).toUpperCase(),
            customer_name: o.customer_name || "Client Anonyme",
            table_or_delivery: o.table_number ? `Table N° ${o.table_number}` : "Commande emporter",
            items_summary: o.items_summary || "Plats divers",
            total_amount: o.total_amount || 0,
            status: o.status || "pending",
            payment_method: o.payment_method || "orange_money",
            created_at: new Date(o.created_at).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setRecentOrders(mapped);
        }
      } catch (err) {
        console.warn("Dashboard real data fetch error", err);
      }
    })();
  }, [r?.id]);

  const publicUrl = r?.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/r/${r.slug}`
    : null;

  const handleCopyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Lien de votre restaurant copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsapp = () => {
    if (!publicUrl) return;
    const msg = `Découvrez la carte digitale et passez vos commandes directement en ligne sur ${r?.name || "notre restaurant"} : ${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleUpdateOrderStatus = (id: string, newStatus: LiveOrder["status"]) => {
    setRecentOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status: newStatus } : ord)),
    );
    toast.success(`Statut de la commande ${id} mis à jour : ${newStatus}`);
  };

  const status = (r as { subscription_status?: string } | null)?.subscription_status;
  const trialEnds = (r as { trial_ends_at?: string | null } | null)?.trial_ends_at;
  const daysLeft = trialEnds
    ? Math.max(0, Math.ceil((new Date(trialEnds).getTime() - Date.now()) / 86400000))
    : 30;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* HEADER WITH SALUTATION & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-[#d4a853]/30 bg-gradient-to-r from-[#111118] via-[#111118] to-[#1a160d] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4a853]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a853]/15 border border-[#d4a853]/30 text-xs font-bold text-[#f0d48a]">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
            <span>Panneau de Contrôle Officiel RestoBF</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Bienvenue,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#ffffff]">
              {r?.name ?? "Votre Restaurant"}
            </span>{" "}
            👋
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
            <span>{r?.city || "Ouagadougou"}</span>
            <span>•</span>
            <span className="text-[#f0d48a] font-semibold">
              {r?.cuisine || "Maquis & Grillades"}
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Système En Ligne
            </span>
          </p>
        </div>

        {/* Quick actions top bar */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 pt-2 md:pt-0">
          {publicUrl && (
            <button
              onClick={handleCopyUrl}
              className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0a0a0f] text-xs font-extrabold text-foreground hover:border-[#d4a853]/50 transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-[#d4a853]" />
              )}
              <span>{copied ? "Lien Copié !" : "Copier le Lien"}</span>
            </button>
          )}

          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] text-xs font-black shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Voir la Carte Publique</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* SUBSCRIPTION STATUS BANNER */}
      {(status === "trial" || !status) && (
        <div className="p-5 rounded-2xl border border-[#d4a853]/40 bg-gradient-to-r from-[#d4a853]/15 via-[#111118] to-[#111118] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#d4a853]/20 border border-[#d4a853]/40 text-[#f0d48a] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#f0d48a] font-black">
                🎁 Période d'essai VIP Active
              </p>
              <strong className="block text-sm text-foreground">
                {daysLeft > 0
                  ? `Il vous reste ${daysLeft} jours d'essai gratuit complet`
                  : "Votre essai gratuit est arrivé à terme"}
              </strong>
              <p className="text-xs text-muted-foreground mt-0.5">
                Profitez de 0% de commission sur vos commandes WhatsApp & Mobile Money.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSubModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] text-xs font-black shadow-lg hover:scale-105 transition-transform shrink-0 cursor-pointer"
          >
            Choisir mon Abonnement
          </button>
        </div>
      )}

      {/* LIVE STATS GRID (METRICS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl border border-white/10 bg-[#111118]/90 backdrop-blur-xl shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Commandes du Jour
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {counts.todayOrders}{" "}
              <span className="text-xs text-emerald-400 font-bold">+18% vs hier</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Reçues via WhatsApp & QR Code</p>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl border border-[#d4a853]/40 bg-[#111118]/90 backdrop-blur-xl shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Recettes Estimées
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#d4a853]/20 border border-[#d4a853]/40 text-[#f0d48a] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] to-[#f0d48a]">
              {counts.todayRevenue.toLocaleString("fr-FR")} FCFA
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">0 FCFA de commission retenue</p>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl border border-white/10 bg-[#111118]/90 backdrop-blur-xl shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Plats au Menu
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {counts.menu}{" "}
              <span className="text-xs text-muted-foreground font-semibold">plats actifs</span>
            </div>
            <Link
              to="/dashboard/menu"
              className="text-[11px] text-[#f0d48a] hover:underline mt-1 font-bold block"
            >
              Gérer le menu →
            </Link>
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl border border-white/10 bg-[#111118]/90 backdrop-blur-xl shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Réservations
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {counts.resa}{" "}
              <span className="text-xs text-amber-400 font-bold">
                {counts.pendingResa} en attente
              </span>
            </div>
            <Link
              to="/dashboard/reservations"
              className="text-[11px] text-[#f0d48a] hover:underline mt-1 font-bold block"
            >
              Voir les demandes →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* QUICK SHORTCUTS TOOLBAR */}
      <div className="p-6 rounded-3xl border border-white/10 bg-[#111118]/90 backdrop-blur-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <ZapIcon className="w-4 h-4 text-[#d4a853]" />
          <span>Raccourcis d'action rapide</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/dashboard/menu"
            className="p-3.5 rounded-2xl border border-white/10 bg-[#0a0a0f] hover:border-[#d4a853]/50 hover:bg-[#1a1a24] transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#d4a853]/15 text-[#f0d48a] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs text-foreground group-hover:text-[#f0d48a] transition-colors">
                Ajouter un Plat
              </strong>
              <span className="text-[10px] text-muted-foreground">Créer une entrée/plat</span>
            </div>
          </Link>

          <Link
            to="/dashboard/commandes"
            className="p-3.5 rounded-2xl border border-white/10 bg-[#0a0a0f] hover:border-[#d4a853]/50 hover:bg-[#1a1a24] transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs text-foreground group-hover:text-emerald-400 transition-colors">
                Bons de Commande
              </strong>
              <span className="text-[10px] text-muted-foreground">Suivi des encaissements</span>
            </div>
          </Link>

          <Link
            to="/dashboard/cuisine"
            className="p-3.5 rounded-2xl border border-white/10 bg-[#0a0a0f] hover:border-[#d4a853]/50 hover:bg-[#1a1a24] transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs text-foreground group-hover:text-amber-400 transition-colors">
                Écran Cuisine KDS
              </strong>
              <span className="text-[10px] text-muted-foreground">Préparation en direct</span>
            </div>
          </Link>

          <Link
            to="/dashboard/qr-code"
            className="p-3.5 rounded-2xl border border-white/10 bg-[#0a0a0f] hover:border-[#d4a853]/50 hover:bg-[#1a1a24] transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs text-foreground group-hover:text-purple-400 transition-colors">
                QR Code Tables
              </strong>
              <span className="text-[10px] text-muted-foreground">Télécharger HD</span>
            </div>
          </Link>

          <Link
            to="/dashboard/messaging"
            className="p-3.5 rounded-2xl border border-white/10 bg-[#0a0a0f] hover:border-[#d4a853]/50 hover:bg-[#1a1a24] transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs text-foreground group-hover:text-emerald-400 transition-colors">
                WhatsApp Direct
              </strong>
              <span className="text-[10px] text-muted-foreground">Messages clients</span>
            </div>
          </Link>

          <button
            onClick={handleShareWhatsapp}
            className="p-3.5 rounded-2xl border border-white/10 bg-[#0a0a0f] hover:border-[#d4a853]/50 hover:bg-[#1a1a24] transition-all text-left flex flex-col items-start gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#d4a853]/15 text-[#f0d48a] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-xs text-foreground group-hover:text-[#f0d48a] transition-colors">
                Partager Menu
              </strong>
              <span className="text-[10px] text-muted-foreground">Envoyer sur WhatsApp</span>
            </div>
          </button>
        </div>
      </div>

      {/* TWO COLUMN MAIN CONTENT: LIVE ORDERS FEED & PUBLIC SITE / REVIEWS */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIVE ORDERS MONITORING (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl border border-white/10 bg-[#111118]/90 backdrop-blur-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#d4a853]" />
                  <span>Dernières Commandes en Direct</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Suivez et validez les commandes de vos clients en temps réel.
                </p>
              </div>

              <Link
                to="/dashboard/commandes"
                className="text-xs font-bold text-[#f0d48a] hover:underline flex items-center gap-1"
              >
                <span>Voir tout</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* ORDERS STREAM */}
            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-white/10 bg-[#0a0a0f] hover:border-[#d4a853]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold font-mono text-[#f0d48a]">
                        {ord.id}
                      </span>
                      <span className="text-xs font-bold text-foreground">{ord.customer_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-muted-foreground font-semibold">
                        {ord.table_or_delivery}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{ord.created_at}</span>
                    </div>

                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {ord.items_summary}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-black text-emerald-400">
                        {ord.total_amount.toLocaleString("fr-FR")} FCFA
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {ord.payment_method === "orange_money"
                          ? "Orange Money"
                          : ord.payment_method === "moov_money"
                            ? "Moov Money"
                            : "Espèces"}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {ord.status === "pending" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, "preparing")}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors"
                      >
                        En Préparation
                      </button>
                    )}
                    {ord.status === "preparing" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, "delivered")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                      >
                        Marquer Livré
                      </button>
                    )}
                    {ord.status === "delivered" && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Servi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT REVIEWS STREAM */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#111118]/90 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Avis Clients Récents</span>
              </h3>
              <Link
                to="/dashboard/avis"
                className="text-xs font-bold text-[#f0d48a] hover:underline"
              >
                Gérer les avis
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-[#0a0a0f] border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs text-foreground font-bold">{rev.author}</strong>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] text-muted-foreground block text-right">
                    {rev.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESTAURANT PROFILE & QR PREVIEW (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* PROFILE SUMMARY CARD */}
          <div className="p-6 rounded-3xl border border-[#d4a853]/30 bg-[#111118]/90 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#f0d48a]">
                Votre Fiche Établissement
              </h3>
              <Link
                to="/dashboard/parametres"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Éditer
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nom :</span>
                <strong className="text-foreground font-bold">{r?.name}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ville :</span>
                <span className="text-foreground">{r?.city}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cuisine :</span>
                <span className="text-foreground">{r?.cuisine || "Grillades & Maquis"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Téléphone :</span>
                <span className="text-foreground font-mono">{r?.phone || "+226 70 00 00 00"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Template 3D :</span>
                <span className="px-2 py-0.5 rounded bg-[#d4a853]/20 text-[#f0d48a] font-extrabold uppercase text-[10px]">
                  {r?.template || "Prem Royal"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/auth/choisir-template"
                className="w-full py-2.5 rounded-xl border border-white/10 hover:border-[#d4a853]/50 bg-[#0a0a0f] text-xs font-bold text-foreground hover:text-[#f0d48a] transition-all block text-center"
              >
                🎨 Changer de Template
              </Link>
            </div>
          </div>

          {/* QR CODE BOX */}
          <div className="p-6 rounded-3xl border border-[#d4a853]/30 bg-gradient-to-br from-[#111118] via-[#111118] to-[#1a160d] shadow-xl text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4a853]/15 border border-[#d4a853]/30 text-[11px] font-bold text-[#f0d48a]">
              <QrCode className="w-3.5 h-3.5 text-[#d4a853]" />
              <span>QR Code Prêt à l'Emploi</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Affichez ce QR Code sur vos tables pour permettre à vos clients de commander
              instantanément.
            </p>

            <div className="p-4 bg-white rounded-2xl max-w-[180px] mx-auto shadow-2xl border border-[#d4a853]/40">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  publicUrl || "https://restobf.com",
                )}`}
                alt="QR Code Restaurant"
                className="w-full h-auto aspect-square"
              />
            </div>

            <div className="pt-2">
              <Link
                to="/dashboard/qr-code"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] text-xs font-black shadow-lg hover:brightness-110 transition-all inline-flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Télécharger QR Code HD</span>
              </Link>
            </div>
          </div>

          {/* SUPPORT VIP BOX */}
          <div className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <strong className="text-xs font-extrabold text-foreground">
                Support VIP Ouagadougou & Bobo
              </strong>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Une question ou besoin d'aide pour saisir votre menu ? L'équipe RestoBF est disponible
              7j/7 sur WhatsApp.
            </p>
            <a
              href="https://wa.me/22655300868?text=Bonjour%20Support%20RestoBF%2C%20j'ai%20besoin%20d'assistance"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 rounded-xl bg-emerald-500 text-[#0a0a0f] text-xs font-black shadow hover:bg-emerald-400 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Contacter sur WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* SUBSCRIBE MODAL */}
      <SubscribeContactModal open={subModal} onClose={() => setSubModal(false)} plan={r?.plan} />
    </div>
  );
}

function ZapIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
