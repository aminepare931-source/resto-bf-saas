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

const DEFAULT_FEATURES: PlanFeature[] = [
  { id: "menu-digital", name: "Menu digital", description: "Menu en ligne avec photos et prix", category: "menu", icon: "📱", plans: ["basique", "standard", "premium"], created_at: "", updated_at: "" },
  { id: "menu-10-plats", name: "Jusqu'à 10 plats", description: "Limite de 10 plats dans le menu", category: "menu", icon: "🍽️", plans: ["basique"], created_at: "", updated_at: "" },
  { id: "menu-30-plats", name: "Jusqu'à 30 plats", description: "Limite de 30 plats dans le menu", category: "menu", icon: "🍽️", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "menu-illimite", name: "Menu illimité", description: "Nombre de plats illimité", category: "menu", icon: "🍽️", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "categories-plats", name: "Catégories de plats", description: "Organiser les plats par catégories", category: "menu", icon: "📂", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "plats-saisonniers", name: "Plats saisonniers", description: "Ajouter des plats temporaires", category: "menu", icon: "🌿", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "commande-whatsapp", name: "Commande WhatsApp", description: "Bouton de commande directe", category: "order", icon: "💬", plans: ["basique", "standard", "premium"], created_at: "", updated_at: "" },
  { id: "panier-commande", name: "Panier de commande", description: "Système de panier multi-plats", category: "order", icon: "🛒", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "historique-commandes", name: "Historique des commandes", description: "Voir l'historique complet", category: "order", icon: "📋", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "notifications-commandes", name: "Notifications commandes", description: "Notification à chaque commande", category: "order", icon: "🔔", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "qr-code", name: "QR Code restaurant", description: "QR code pour accéder au menu", category: "qr", icon: "📲", plans: ["basique", "standard", "premium"], created_at: "", updated_at: "" },
  { id: "qr-code-table", name: "QR Code par table", description: "QR code unique par table", category: "qr", icon: "🪑", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "qr-code-personnalise", name: "QR Code personnalisé", description: "QR code avec logo et couleurs", category: "qr", icon: "🎨", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "reservations-basiques", name: "Réservations basiques", description: "Formulaire de réservation simple", category: "reservation", icon: "📅", plans: ["basique"], created_at: "", updated_at: "" },
  { id: "reservations-avancees", name: "Réservations avancées", description: "Réservations avec choix de table", category: "reservation", icon: "📅", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "calendrier-reservations", name: "Calendrier des réservations", description: "Vue calendrier", category: "reservation", icon: "🗓️", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "confirmation-auto", name: "Confirmation automatique", description: "Confirmation auto des réservations", category: "reservation", icon: "✅", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "rappel-reservation", name: "Rappel de réservation", description: "Rappel SMS/WhatsApp", category: "reservation", icon: "⏰", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "template-basique", name: "1 Template basique", description: "Template Classique uniquement", category: "template", icon: "🎨", plans: ["basique"], created_at: "", updated_at: "" },
  { id: "template-standard", name: "4 Templates Standard", description: "Soleil, Savane, Marché, Moderne", category: "template", icon: "🎨", plans: ["standard"], created_at: "", updated_at: "" },
  { id: "template-premium", name: "4 Templates Premium", description: "Templates avec animations", category: "template", icon: "✨", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "personnalisation-couleurs", name: "Personnalisation couleurs", description: "Changer les couleurs", category: "template", icon: "🎨", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "personnalisation-police", name: "Personnalisation police", description: "Changer la police", category: "template", icon: "✏️", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "stats-essentielles", name: "Statistiques essentielles", description: "Vues et commandes de base", category: "stats", icon: "📊", plans: ["basique"], created_at: "", updated_at: "" },
  { id: "stats-basiques", name: "Statistiques basiques", description: "Statistiques détaillées", category: "stats", icon: "📊", plans: ["standard"], created_at: "", updated_at: "" },
  { id: "stats-avancees", name: "Statistiques avancées", description: "Analytics complets", category: "stats", icon: "📈", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "stats-ventes", name: "Statistiques des ventes", description: "Analyse des ventes", category: "stats", icon: "💰", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "stats-clients", name: "Statistiques clients", description: "Analyse comportement clients", category: "stats", icon: "👥", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "export-statistiques", name: "Export statistiques", description: "Exporter PDF/Excel", category: "stats", icon: "📥", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "galerie-photos", name: "Galerie photos", description: "Jusqu'à 10 photos", category: "gallery", icon: "🖼️", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "galerie-illimitee", name: "Galerie illimitée", description: "Photos illimitées", category: "gallery", icon: "🖼️", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "galerie-videos", name: "Galerie vidéos", description: "Ajouter des vidéos", category: "gallery", icon: "🎬", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "avis-clients", name: "Avis clients", description: "Système d'avis et témoignages", category: "reviews", icon: "⭐", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "repondre-avis", name: "Répondre aux avis", description: "Répondre aux avis clients", category: "reviews", icon: "💬", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "avis-google", name: "Avis Google intégrés", description: "Afficher les avis Google", category: "reviews", icon: "🔗", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "facturation-pdf", name: "Facturation PDF basique", description: "Factures simples", category: "billing", icon: "🧾", plans: ["standard"], created_at: "", updated_at: "" },
  { id: "facturation-logo", name: "Facturation PDF + logo", description: "Factures avec logo", category: "billing", icon: "🧾", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "facture-auto", name: "Facturation automatique", description: "Génération automatique", category: "billing", icon: "⚡", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "devis", name: "Devis en ligne", description: "Créer et envoyer des devis", category: "billing", icon: "📄", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "gestion-employes", name: "Gestion employés", description: "Ajout de staff avec rôles", category: "staff", icon: "👥", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "login-staff-pin", name: "Connexion staff par PIN", description: "Employés se connectent par PIN", category: "staff", icon: "🔑", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "espace-cuisine", name: "Espace cuisine", description: "Interface cuisine avec minuteur", category: "staff", icon: "👨‍🍳", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "planning-staff", name: "Planning du staff", description: "Gérer les horaires", category: "staff", icon: "📋", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "plan-salle", name: "Plan de salle interactif", description: "Gérer les tables", category: "tables", icon: "🪑", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "etat-tables", name: "État des tables", description: "Tables libres/occupées en temps réel", category: "tables", icon: "🟢", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "reservation-table", name: "Réservation par table", description: "Assigner une table", category: "tables", icon: "📌", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "chat-interne", name: "Chat interne", description: "Communication cuisinier ↔ serveur", category: "chat", icon: "💬", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "notifications-chat", name: "Notifications chat", description: "Notifications sonores", category: "chat", icon: "🔔", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "chat-fichiers", name: "Partage de fichiers", description: "Envoyer photos et fichiers", category: "chat", icon: "📎", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "promotions", name: "Promotions", description: "Codes promo et réductions", category: "marketing", icon: "🏷️", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "campagnes-whatsapp", name: "Campagnes WhatsApp", description: "Envoyer des offres", category: "marketing", icon: "📢", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "fidelite", name: "Programme de fidélité", description: "Carte de fidélité digitale", category: "marketing", icon: "💎", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "reseaux-sociaux", name: "Liens réseaux sociaux", description: "Facebook, Instagram", category: "marketing", icon: "🌐", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "gestion-stocks", name: "Gestion des stocks", description: "Suivi des ingrédients", category: "stock", icon: "📦", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "alertes-stocks", name: "Alertes stocks bas", description: "Notification stock faible", category: "stock", icon: "⚠️", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "fournisseurs", name: "Gestion fournisseurs", description: "Liste des fournisseurs", category: "stock", icon: "🚚", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "messagerie-whatsapp", name: "Messagerie WhatsApp", description: "Gérer les conversations", category: "messaging", icon: "💬", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "reponses-rapides", name: "Réponses rapides", description: "Modèles de messages", category: "messaging", icon: "⚡", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "broadcast", name: "Diffusion groupée", description: "Envoyer à tous les clients", category: "messaging", icon: "📨", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "parametres-site", name: "Paramètres du site", description: "Modifier les infos", category: "settings", icon: "⚙️", plans: ["basique", "standard", "premium"], created_at: "", updated_at: "" },
  { id: "logo-personnalise", name: "Logo personnalisé", description: "Ajouter le logo", category: "settings", icon: "🖼️", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "domaine-personnalise", name: "Nom de domaine", description: "Domaine personnalisé", category: "settings", icon: "🌐", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "mode-sombre", name: "Mode sombre", description: "Thème sombre", category: "settings", icon: "🌙", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "theme-neon", name: "Thème Néon", description: "Mode néon", category: "settings", icon: "💡", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "theme-jour", name: "Thème Jour", description: "Mode clair", category: "settings", icon: "☀️", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "contenu-branding", name: "Contenu & branding", description: "Personnaliser le contenu", category: "settings", icon: "🖌️", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "apercu-dashboard", name: "Aperçu du dashboard", description: "Page d'accueil", category: "settings", icon: "📊", plans: ["basique", "standard", "premium"], created_at: "", updated_at: "" },
  { id: "support-prioritaire", name: "Support prioritaire", description: "Support WhatsApp dédié", category: "support", icon: "🎧", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "support-standard", name: "Support standard", description: "Support par email", category: "support", icon: "📧", plans: ["standard"], created_at: "", updated_at: "" },
  { id: "formation", name: "Formation en ligne", description: "Guide et tutoriels", category: "support", icon: "📚", plans: ["standard", "premium"], created_at: "", updated_at: "" },
  { id: "rapports-mensuels", name: "Rapports mensuels", description: "Rapports PDF automatiques", category: "reports", icon: "📄", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "rapports-ventes", name: "Rapports de ventes", description: "Analyse des ventes", category: "reports", icon: "📊", plans: ["premium"], created_at: "", updated_at: "" },
  { id: "export-donnees", name: "Export des données", description: "Exporter en CSV", category: "reports", icon: "💾", plans: ["premium"], created_at: "", updated_at: "" },
];

const SUPER_ADMIN_PASSWORD = "admin-1-2-3";

const generate2FAPIN = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendPINByEmail = async (email: string, pin: string): Promise<boolean> => {
  try {
    console.log(`📧 Tentative d'envoi d'email à ${email} avec PIN: ${pin}`);
    const { data, error } = await supabase.functions.invoke('send-2fa-email', {
      body: { email, pin }
    });
    console.log("📧 Réponse Edge Function:", { data, error });
    if (error) {
      console.error("❌ Erreur Edge Function:", error);
      toast.error(`Erreur: ${error.message || "Impossible d'envoyer l'email"}`);
      return false;
    }
    if (data?.error) {
      console.error("❌ Erreur dans la réponse:", data.error);
      toast.error(`Erreur: ${data.error}`);
      return false;
    }
    return data?.success || false;
  } catch (error) {
    console.error("❌ Exception lors de l'envoi d'email:", error);
    return false;
  }
};

function SuperAdminPage() {
  const [tab, setTab] = useState<"overview" | "restaurants" | "subscriptions" | "features" | "leads">("overview");
  const [restos, setRestos] = useState<Resto[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [leads, setLeads] = useState<CustomOrder[]>([]);
  const [features, setFeatures] = useState<PlanFeature[]>(DEFAULT_FEATURES);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);
  const [authStep, setAuthStep] = useState<"password" | "pin">("password");
  const [generatedPIN, setGeneratedPIN] = useState<string>("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const load = async () => {
    setLoading(true);
    setFeaturesLoading(true);
    const [r, res, l, f] = await Promise.all([
      supabase.from("restaurants").select("id, name, slug, city, cuisine, plan, template, email, phone, owner_name, created_at, subscription_status, trial_ends_at, subscription_ends_at, logo_url, hero_title, hero_subtitle, about_text, primary_color, font_family, sections, social_links").order("created_at", { ascending: false }),
      supabase.from("reservations").select("id, restaurant_id, customer_name, reservation_date, party_size, status, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("custom_orders" as never).select("*").order("created_at", { ascending: false }),
      supabase.from("plan_features" as never).select("*").order("category", { ascending: true }).order("name", { ascending: true }),
    ]);
    setRestos((r.data ?? []) as Resto[]);
    setReservations((res.data ?? []) as Reservation[]);
    setLeads(((l as { data: CustomOrder[] | null }).data ?? []) as CustomOrder[]);
    const featuresData = ((f as { data: PlanFeature[] | null }).data ?? []) as PlanFeature[];
    if (featuresData.length > 0) {
      const merged = DEFAULT_FEATURES.map(df => {
        const dbFeature = featuresData.find(fd => fd.id === df.id || fd.name === df.name);
        return dbFeature ? { ...df, plans: dbFeature.plans } : df;
      });
      featuresData.forEach(fd => {
        if (!merged.find(m => m.id === fd.id || m.name === fd.name)) {
          merged.push(fd);
        }
      });
      setFeatures(merged);
    } else {
      setFeatures(DEFAULT_FEATURES);
    }
    setFeaturesLoading(false);
    setLoading(false);
  };

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("super_admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SUPER_ADMIN_PASSWORD) {
      const pin = generate2FAPIN();
      setGeneratedPIN(pin);
      setAuthStep("pin");
      setAuthError(false);
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        try {
          const result = await sendPINByEmail(user.email, pin);
          if (result) {
            toast.success(`📧 Code envoyé à ${user.email}`, { duration: 5000 });
          } else {
            toast.error("Impossible d'envoyer l'email.", { duration: 5000 });
            toast.info(`🔐 Code: ${pin}`, { duration: 15000 });
            toast.warning("Configurez RESEND_API_KEY", { duration: 8000 });
          }
        } catch (error) {
          toast.error("Erreur lors de l'envoi.", { duration: 5000 });
          toast.info(`🔐 Code: ${pin}`, { duration: 15000 });
        }
      } else {
        toast.info(`🔐 Code: ${pin}`, { duration: 15000 });
      }
    } else {
      setAuthError(true);
      toast.error("Mot de passe incorrect");
    }
  };

  const handlePINSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === generatedPIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem("super_admin_auth", "true");
      setPinError(false);
      toast.success("✅ Authentification réussie");
    } else {
      setPinError(true);
      toast.error("Code PIN incorrect");
      setPinInput("");
    }
  };

  const activate = async (id: string, plan: string) => {
    const ends = new Date();
    ends.setMonth(ends.getMonth() + 1);
    const { error } = await supabase.from("restaurants").update({ plan, subscription_status: "active", subscription_ends_at: ends.toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Abonnement ${PLAN_LABEL[plan] ?? plan} activé pour 1 mois`);
    load();
  };

  const expire = async (id: string) => {
    const { error } = await supabase.from("restaurants").update({ subscription_status: "expired" }).eq("id", id);
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
    setFeatures(prev => prev.map(f => f.id === featureId ? { ...f, plans } : f));
    const { error } = await supabase.from("plan_features" as never).update({ plans } as never).eq("id", featureId);
    if (error) {
      console.warn("Table plan_features non disponible");
    } else {
      toast.success("Fonctionnalité mise à jour");
    }
  };

  const addFeature = async () => {
    const name = prompt("Nom de la fonctionnalité :");
    if (!name) return;
    const description = prompt("Description (optionnelle) :") || "";
    const category = prompt("Catégorie :") || "other";
    const icon = prompt("Icône (emoji) :") || "📌";
    const newFeature: PlanFeature = { id: `local-${Date.now()}`, name, description, category, icon, plans: ["basique"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setFeatures(prev => [...prev, newFeature]);
    const { error } = await supabase.from("plan_features" as never).insert({ name, description, category, icon, plans: ["basique"] } as never);
    if (error) console.warn("Table plan_features non disponible");
    toast.success("Fonctionnalité ajoutée");
  };

  const deleteFeature = async (id: string) => {
    if (!confirm("Supprimer cette fonctionnalité ?")) return;
    setFeatures(prev => prev.filter(f => f.id !== id));
    const { error } = await supabase.from("plan_features" as never).delete().eq("id", id);
    if (error) console.warn("Table plan_features non disponible");
    toast.success("Fonctionnalité supprimée");
  };

  const filtered = restos.filter((r) => !q || `${r.name} ${r.city} ${r.email} ${r.owner_name}`.toLowerCase().includes(q.toLowerCase()));
  const stats = { total: restos.length, trial: restos.filter((r) => r.subscription_status === "trial").length, active: restos.filter((r) => r.subscription_status === "active").length, expired: restos.filter((r) => r.subscription_status === "expired").length, revenue: restos.filter((r) => r.subscription_status === "active").reduce((acc, r) => { const price = r.plan === "basique" ? 5000 : r.plan === "standard" ? 10000 : r.plan === "premium" ? 15000 : 0; return acc + price; }, 0), leads: leads.filter((l) => l.status === "new").length };
  const restoName = (id: string) => restos.find((r) => r.id === id)?.name ?? "—";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="p-8 rounded-2xl border border-white/8 bg-dark-card">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-gold flex items-center justify-center font-black text-[#0a0a0f] text-2xl">🔐</div>
            </div>
            <h1 className="text-2xl font-black text-center mb-2">Super Administration</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">Authentification à deux facteurs requise</p>
            {authStep === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Étape 1/2 - Mot de passe</label>
                  <input type="password" value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setAuthError(false); }} placeholder="Entrez le mot de passe" className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm outline-none focus:border-gold/50 transition-colors ${authError ? "border-red-500/50" : "border-white/10"}`} autoFocus />
                  {authError && <p className="text-xs text-red-400 mt-2">Mot de passe incorrect. Veuillez réessayer.</p>}
                </div>
                <button type="submit" className="w-full px-5 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold hover:shadow-gold transition-all">Continuer →</button>
              </form>
            )}
            {authStep === "pin" && (
              <form onSubmit={handlePINSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Étape 2/2 - Code de sécurité</label>
                  <p className="text-xs text-muted-foreground mb-3">Un code PIN à 6 chiffres a été envoyé à votre adresse email.</p>
                  <input type="text" value={pinInput} onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setPinError(false); }} placeholder="000000" maxLength={6} className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm outline-none focus:border-gold/50 transition-colors text-center text-2xl tracking-widest ${pinError ? "border-red-500/50" : "border-white/10"}`} autoFocus />
                  {pinError && <p className="text-xs text-red-400 mt-2">Code PIN incorrect. Veuillez réessayer.</p>}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setAuthStep("password"); setPinInput(""); setGeneratedPIN(""); }} className="flex-1 px-5 py-3 rounded-xl border border-white/10 text-sm font-semibold hover:border-gold/40 transition-colors">← Retour</button>
                  <button type="submit" className="flex-1 px-5 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold hover:shadow-gold transition-all">Vérifier</button>
                </div>
              </form>
            )}
            <p className="text-xs text-muted-foreground text-center mt-4">🔒 Accès réservé aux super administrateurs uniquement</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-gold flex items-center justify-center font-black text-[#0a0a0f]">★</div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Super Administration</p>
              <strong className="block text-base truncate">Pilotage Resto BF</strong>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/" className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold hover:border-gold/40">← Site</Link>
            <button onClick={load} className="px-4 py-2 rounded-xl bg-gradient-gold text-[#0a0a0f] text-sm font-bold">Rafraîchir</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-white/5 overflow-x-auto">
          {(["overview", "restaurants", "subscriptions", "features", "leads"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === t ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "overview" ? "Vue d'ensemble" : t === "restaurants" ? `Restaurants (${restos.length})` : t === "subscriptions" ? "Abonnements" : t === "features" ? "Fonctionnalités" : `Demandes (${leads.length})`}
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
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, ville, email, gérant)..." className="w-full max-w-md mb-5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm focus:border-gold/40 outline-none" />
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
                      <td className="px-4 py-3"><strong>{r.name}</strong><div className="text-xs text-muted-foreground">{r.city} · {r.email}</div></td>
                      <td className="px-4 py-3">{r.owner_name}<div className="text-xs text-muted-foreground">{r.phone}</div></td>
                      <td className="px-4 py-3">{PLAN_LABEL[r.plan] ?? r.plan}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.subscription_status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-3 text-right">{r.slug && <a href={`/r/${r.slug}`} target="_blank" rel="noopener" className="text-xs text-gold hover:underline">Voir →</a>}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Aucun restaurant.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === "subscriptions" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Contrôle total des abonnements, plans, templates et fonctionnalités pour chaque restaurant.</p>
            {restos.map((r) => (
              <div key={r.id} className="p-6 rounded-2xl border border-white/8 bg-dark-card">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-white/5">
                  <div className="min-w-0 flex-1">
                    <strong className="truncate block text-base mb-1">{r.name}</strong>
                    <div className="text-xs text-muted-foreground space-x-2">
                      <span>👤 {r.owner_name}</span><span>·</span><span>✉️ {r.email}</span><span>·</span><span>📍 {r.city}</span><span>·</span><span>📱 {r.phone}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <StatusBadge status={r.subscription_status} />
                      <span className="text-xs text-muted-foreground">Plan: <strong className="text-gold">{PLAN_LABEL[r.plan] ?? r.plan}</strong></span>
                      {r.subscription_ends_at && <span className="text-xs text-muted-foreground">· fin {new Date(r.subscription_ends_at).toLocaleDateString("fr-FR")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a href={`/r/${r.slug}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold hover:border-gold/40 transition-colors">🌐 Voir le site</a>
                  </div>
                </div>
                <div className="mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gold mb-3">📊 Plan d'abonnement</p>
                  <div className="flex flex-wrap gap-2">
                    {(["basique", "standard", "premium"] as const).map((p) => (
                      <button key={p} onClick={() => updatePlan(r.id, p)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${r.plan === p ? "bg-gradient-gold text-[#0a0a0f] shadow-gold" : "bg-white/[0.04] border border-white/10 hover:border-gold/40 hover:bg-gold/5"}`}>{PLAN_LABEL[p]}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gold mb-3">🎨 Template du site</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ id: "gratuit-classique", name: "Classique", plan: "basique" }, { id: "std-soleil", name: "Soleil", plan: "standard" }, { id: "std-savane", name: "Savane", plan: "standard" }, { id: "std-marche", name: "Marché", plan: "standard" }, { id: "std-moderne", name: "Moderne", plan: "standard" }, { id: "prem-royal", name: "Palais Royal", plan: "premium" }, { id: "prem-nuit", name: "Aurum Nuit", plan: "premium" }, { id: "prem-feu", name: "Ignis Feu", plan: "premium" }, { id: "prem-luxe", name: "Luxe Grill", plan: "premium" }].map((tpl) => {
                      const canUse = r.plan === "premium" ? tpl.plan === "premium" : tpl.plan === "basique" || tpl.plan === "standard";
                      return <button key={tpl.id} onClick={() => canUse && updateTemplate(r.id, tpl.id)} disabled={!canUse} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${r.template === tpl.id ? "bg-gradient-gold text-[#0a0a0f]" : canUse ? "bg-white/[0.04] border border-white/10 hover:border-gold/40" : "bg-white/[0.02] border border-white/5 text-muted-foreground/50 cursor-not-allowed"}`}>{tpl.name}{!canUse && " 🔒"}</button>;
                    })}
                  </div>
                </div>
                <div className="mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gold mb-3">⏱️ Statut d'abonnement</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ value: "trial", label: "Essai", color: "bg-blue-500/10 border-blue-500/30 text-blue-300" }, { value: "active", label: "Actif", color: "bg-green-500/10 border-green-500/30 text-green-300" }, { value: "expired", label: "Expiré", color: "bg-red-500/10 border-red-500/30 text-red-400" }].map((status) => (
                      <button key={status.value} onClick={() => updateSubscriptionStatus(r.id, status.value)} className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${r.subscription_status === status.value ? status.color : "bg-white/[0.04] border-white/10 text-muted-foreground hover:border-gold/40"}`}>{status.label}</button>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gold mb-3">⚡ Actions rapides</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => { const date = new Date(); date.setDate(date.getDate() + 30); supabase.from("restaurants").update({ subscription_ends_at: date.toISOString() }).eq("id", r.id); toast.success("✅ Abonnement prolongé de 30 jours"); load(); }} className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all">+30 jours</button>
                    <button onClick={() => { const date = new Date(); date.setDate(date.getDate() + 90); supabase.from("restaurants").update({ subscription_ends_at: date.toISOString() }).eq("id", r.id); toast.success("✅ Abonnement prolongé de 3 mois"); load(); }} className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all">+3 mois</button>
                    <button onClick={() => expire(r.id)} className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">🚫 Marquer expiré</button>
                    <button onClick={() => { if (confirm(`Êtes-vous sûr de vouloir supprimer "${r.name}" ?\n\nCette action est irréversible !`)) { supabase.from("restaurants").delete().eq("id", r.id).then(() => { toast.success("🗑️ Restaurant supprimé"); load(); }); } }} className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">🗑️ Supprimer</button>
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
                <p className="text-sm text-muted-foreground">Gérez les fonctionnalités disponibles pour chaque plan d'abonnement.</p>
                <p className="text-xs text-muted-foreground mt-1">Cochez les plans qui doivent avoir accès à chaque fonctionnalité.</p>
              </div>
              <button onClick={addFeature} className="px-4 py-2 rounded-xl bg-gradient-gold text-[#0a0a0f] text-xs font-bold hover:shadow-gold transition-all">+ Ajouter une fonctionnalité</button>
            </div>
            {!featuresLoading ? (
              <div className="space-y-8">
                {Object.entries(features.reduce((acc, f) => { if (!acc[f.category]) acc[f.category] = []; acc[f.category].push(f); return acc; }, {} as Record<string, PlanFeature[]>)).map(([category, categoryFeatures]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gold border-b border-gold/20 pb-2">{getCategoryLabel(category)}</h3>
                    <div className="space-y-2">
                      {categoryFeatures.map((feature) => (
                        <div key={feature.id} className="p-4 rounded-xl border border-white/8 bg-dark-card hover:border-gold/30 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className="text-2xl">{feature.icon}</span>
                              <div>
                                <strong className="text-sm block">{feature.name}</strong>
                                {feature.description && <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>}
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              {["basique", "standard", "premium"].map((plan) => (
                                <label key={plan} className="flex items-center gap-1.5 cursor-pointer">
                                  <input type="checkbox" checked={feature.plans.includes(plan)} onChange={(e) => { const newPlans = e.target.checked ? [...feature.plans, plan] : feature.plans.filter((p) => p !== plan); updateFeaturePlans(feature.id, newPlans); }} className="w-4 h-4 accent-gold" />
                                  <span className="text-xs font-semibold text-muted-foreground capitalize">{plan}</span>
                                </label>
                              ))}
                              <button onClick={() => deleteFeature(feature.id)} className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-500/20" title="Supprimer">🗑️</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-12"><p className="text-muted-foreground">Chargement des fonctionnalités...</p></div>}
          </div>
        )}

        {!loading && tab === "leads" && (
          <div className="space-y-3">
            {leads.length === 0 && <p className="text-muted-foreground">Aucune demande sur mesure pour l'instant.</p>}
            {leads.map((l) => (
              <div key={l.id} className="p-5 rounded-2xl border border-white/8 bg-dark-card">
                <div className="flex justify-between gap-3 flex-wrap mb-2">
                  <div><strong className="text-base">{l.restaurant_name}</strong><div className="text-xs text-muted-foreground">{l.contact_name} · {l.city ?? "—"} · {new Date(l.created_at).toLocaleString("fr-FR")}</div></div>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/30 self-start">{l.status}</span>
                </div>
                <div className="text-sm mb-2">📞 {l.phone} · ✉️ {l.email} {l.budget && <>· 💰 {l.budget}</>}</div>
                <p className="text-sm text-foreground/85 bg-white/[0.03] rounded-xl p-3">{l.message}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "overview" && reservations.length > 0 && (
          <div className="mt-8 p-6 rounded-2xl border border-white/8 bg-dark-card">
            <h3 className="text-sm font-black uppercase tracking-widest text-gold mb-4">Dernières réservations</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {reservations.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-white/[0.02] text-sm">
                  <div className="flex justify-between gap-2 flex-wrap"><strong>{r.customer_name}</strong><span className="text-xs text-muted-foreground">{restoName(r.restaurant_id)}</span></div>
                  <div className="text-xs text-muted-foreground">{r.party_size} pers. · {new Date(r.reservation_date).toLocaleString("fr-FR")}</div>
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
  const labels: Record<string, string> = { menu: "🍽️ Menu", order: "💬 Commandes", qr: "📲 QR Code", reservation: "📅 Réservations", template: "🎨 Templates", stats: "📊 Statistiques", gallery: "🖼️ Galerie", reviews: "⭐ Avis clients", billing: "🧾 Facturation", staff: "👥 Staff", marketing: "🏷️ Marketing", reports: "📄 Rapports", support: "🎧 Support", custom: "✨ Personnalisation", domain: "🌐 Domaine", advanced: "🚀 Avancé", tables: "🪑 Tables", chat: "💬 Chat interne", stock: "📦 Stocks", messaging: "📨 Messagerie", settings: "⚙️ Paramètres" };
  return labels[category] || category;
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${accent ? "border-gold/30 bg-gradient-to-br from-gold/10 to-transparent" : "border-white/8 bg-dark-card"}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-3xl font-black text-gradient-gold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = { trial: "bg-blue-500/15 text-blue-300 border-blue-500/30", active: "bg-green-500/15 text-green-300 border-green-500/30", expired: "bg-red-500/15 text-red-300 border-red-500/30", cancelled: "bg-white/5 text-muted-foreground border-white/10" };
  const cls = map[status ?? ""] ?? "bg-white/5 text-muted-foreground border-white/10";
  return <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${cls}`}>{status ?? "—"}</span>;
}