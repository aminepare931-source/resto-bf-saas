import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Topbar } from "@/components/landing/Topbar";
import { Footer } from "@/components/landing/Footer";
import { Particles } from "@/components/landing/Particles";
import { Interactive3DButton } from "@/components/landing/Interactive3DButton";
import { Motion3DTiltCard } from "@/components/landing/Motion3DTiltCard";
import { InteractiveDashboard3D } from "@/components/landing/InteractiveDashboard3D";
import { TemplateCarousel3D } from "@/components/landing/3DTemplateCarousel";
import { InfiniteFeaturesCarousel } from "@/components/landing/InfiniteFeaturesCarousel";
import { PricingSection } from "@/components/landing/PricingSection";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import {
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  PhoneCall,
  ChevronDown,
  MessageCircle,
  QrCode,
  Utensils,
  Store,
  Star,
  Users,
} from "lucide-react";

function AnimatedStat({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(() =>
    value.replace(/[0-9.]+/, (m) => (m.includes(".") ? "0.0" : "0")),
  );

  useEffect(() => {
    const match = value.match(/[0-9]+(\.[0-9]+)?/);
    const el = ref.current;
    if (!match || !el) return;
    const target = parseFloat(match[0]);
    const decimals = match[0].includes(".") ? match[0].split(".")[1].length : 0;
    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index ?? 0) + match[0].length);
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done) {
            done = true;
            const start = performance.now();
            const duration = 1400;
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              const current = (target * eased).toFixed(decimals);
              setDisplay(`${prefix}${current}${suffix}`);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-extrabold text-[#f0d48a] tracking-tight">
      {display}
    </div>
  );
}

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    let hasSession = false;
    try {
      const { data, error } = await supabase.auth.getUser();
      hasSession = !error && !!data?.user;
    } catch (err) {
      // Pas de session valide, on affiche la page d'accueil normalement
    }
    if (hasSession) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "RestoBF — SaaS pour restaurants au Burkina Faso" },
      {
        name: "description",
        content:
          "Créez un site web professionnel pour votre restaurant, maquis ou fast-food au Burkina Faso. Menu digital, commande WhatsApp, réservation en ligne.",
      },
      { property: "og:title", content: "RestoBF — Le SaaS pour les restaurateurs du Burkina" },
      {
        property: "og:description",
        content:
          "Site web, menu digital, commande WhatsApp et réservation. Simple, rapide et puissant.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: "📱",
    title: "Menu digital intelligent",
    desc: "Photos de haute qualité, catégories clairvoyantes, prix en FCFA. Vos clients commandent directement sur leur téléphone.",
  },
  {
    icon: "💬",
    title: "Commandes WhatsApp instantanées",
    desc: "Chaque plat inclut un bouton Commander. Le message part pré-rempli avec le détail exact de la commande.",
  },
  {
    icon: "🛎️",
    title: "Gestion de cuisine en direct",
    desc: "Validez, préparez et suivez chaque bon de commande sur tablette ou téléphone sans aucun bruit parasite.",
  },
  {
    icon: "📅",
    title: "Réservations & plan de salle",
    desc: "Plan de salle interactif, attribution automatique des tables, SMS et confirmations instantanées.",
  },
  {
    icon: "📊",
    title: "Tableau de bord & statistiques",
    desc: "Suivez votre chiffre d'affaires, vos plats vedettes, vos heures de pointe et prévoyez vos approvisionnements.",
  },
  {
    icon: "👥",
    title: "Gestion du staff & stocks",
    desc: "Inscrivez vos serveurs, cuisiniers et gérants avec des accès sécurisés. Alertes automatiques de stock bas.",
  },
];

const stats = [
  { n: "50+", label: "Restaurants & Maquis inscrits" },
  { n: "5", label: "Templates 3D interactifs" },
  { n: "4.9", label: "Note moyenne des clients ★" },
  { n: "24/7", label: "Assistance WhatsApp dédiée" },
];

const testimonials = [
  {
    name: "Aminata K.",
    role: "Gérante de Maquis VIP — Ouagadougou",
    avatar: "AK",
    text: "Depuis que nous avons lancé notre page RestoBF, nos clients scannent le QR Code à table et commandent directement. On vend beaucoup plus vite aux heures de pointe !",
  },
  {
    name: "Oumar S.",
    role: "Propriétaire Grillades — Bobo-Dioulasso",
    avatar: "OS",
    text: "Créer ma page a pris moins de 10 minutes. Les commandes WhatsApp pré-remplies m'évitent de répéter le menu par téléphone. C'est ultra pratique.",
  },
  {
    name: "Fatima D.",
    role: "Cheffe de Cuisine — Koudougou",
    avatar: "FD",
    text: "L'écran cuisine est révolutionnaire. Les bons de commande arrivent en temps réel. La gestion des stocks m'a permis d'éliminer le gaspillage.",
  },
];

const plans = [
  {
    name: "Basique",
    price: "0",
    unit: "FCFA",
    period: "30 jours d'essai offerts",
    popular: false,
    cta: "Tester gratuitement 30 jours",
    href: "/auth/inscription" as const,
    plan: "basique" as const,
    features: [
      "Template basique unique",
      "Menu jusqu'à 10 plats",
      "Commande WhatsApp directe",
      "QR Code restaurant à imprimer",
      "Réservations basiques",
      "Statistiques d'activité de base",
      "Puis 2 500 FCFA/mois",
    ],
  },
  {
    name: "Standard",
    price: "5 000",
    unit: "FCFA",
    period: "/ mois",
    popular: true,
    cta: "Choisir le Plan Standard",
    href: "/auth/inscription" as const,
    plan: "standard" as const,
    features: [
      "Menu jusqu'à 30 plats & boissons",
      "Commandes WhatsApp illimitées",
      "4 templates Standard personnalisables",
      "QR Code de table personnalisé",
      "Réservations de tables avancées",
      "Statistiques de ventes détaillées",
      "Galerie photo & avis clients",
    ],
  },
  {
    name: "Premium",
    price: "7 500",
    unit: "FCFA",
    period: "/ mois",
    popular: false,
    cta: "Passer en Plan Premium",
    href: "/auth/inscription" as const,
    plan: "premium" as const,
    features: [
      "Menu illimité & déclinaisons",
      "5 templates Premium animés en 3D",
      "Facturation PDF avec logo personnalisé",
      "Statistiques d'analyse avancées",
      "Gestion d'équipe, rôles & stocks",
      "Rapports mensuels de performance",
      "Support prioritaire WhatsApp 7j/7",
    ],
  },
];

const faqs = [
  {
    q: "En combien de temps mon restaurant sera-t-il en ligne ?",
    a: "Votre espace est créé instantanément en 5 minutes. Une fois inscrit, vous ajoutez vos plats, fixez vos prix et personnalisez votre logo. Votre lien et votre QR Code sont immédiatement prêts à être partagés.",
  },
  {
    q: "Faut-il payer à l'inscription ?",
    a: "Non ! Vous bénéficiez de 30 jours d'essai 100% gratuit, sans aucune carte bancaire ni frais cachés. À la fin des 30 jours, vous décidez librement de poursuivre avec l'abonnement de votre choix.",
  },
  {
    q: "Comment fonctionnent les commandes WhatsApp ?",
    a: "Chaque plat affiché sur votre menu possède un bouton 'Commander'. Lorsque le client clique, un message pré-rempli contenant la liste des plats, le total en FCFA et ses coordonnées s'ouvre directement sur votre numéro WhatsApp.",
  },
  {
    q: "Comment fonctionne la gestion de cuisine ?",
    a: "Vous disposez d'un écran cuisine utilisable sur téléphone ou tablette. Chaque nouvelle commande s'y affiche avec son statut (Nouveau, En préparation, Prêt). Les cuisiniers peuvent valider les plats d'une simple touche.",
  },
  {
    q: "Mes employés peuvent-ils avoir leurs propres accès ?",
    a: "Oui, vous pouvez créer des comptes spécifiques pour vos serveurs, cuisiniers et gérants. Chaque rôle n'accède qu'aux fonctionnalités dont il a besoin.",
  },
  {
    q: "Est-ce que je peux résilier à tout moment ?",
    a: "Absolument. Il n'y a aucun engagement de durée. Vous pouvez suspendre ou résilier votre abonnement sans pénalité en un clic.",
  },
];

function ScrollProgressBar({ isMobile }: { isMobile: boolean }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-[3.5px] z-[100] origin-left bg-gradient-to-r from-[#b08800] via-[#d4a853] to-[#f0d48a] ${isMobile ? "" : "shadow-[0_0_12px_rgba(212,168,83,0.8)]"}`}
      style={{ scaleX }}
    />
  );
}

function ParallaxAurora({ isMobile }: { isMobile: boolean }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 2000], [0, isMobile ? 0 : 250]);
  const y2 = useTransform(scrollY, [0, 2000], [0, isMobile ? 0 : -200]);

  // Sur mobile : pas de parallax lié au scroll (coûteux) et flou très réduit
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        style={{
          y: isMobile ? 0 : y1,
          background: "radial-gradient(circle, rgba(212,168,83,0.4) 0%, transparent 70%)",
        }}
        className={`absolute -top-[15%] -left-[10%] w-[650px] h-[650px] rounded-full opacity-35 ${isMobile ? "blur-2xl" : "blur-[100px]"}`}
      />
      <motion.div
        style={{
          y: isMobile ? 0 : y2,
          background: "radial-gradient(circle, rgba(240,212,138,0.3) 0%, transparent 70%)",
        }}
        className={`absolute top-[35%] -right-[15%] w-[700px] h-[700px] rounded-full opacity-30 ${isMobile ? "blur-2xl" : "blur-[120px]"}`}
      />
      <div className="absolute inset-0 grid-bg opacity-30" />
    </div>
  );
}

function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const isMobile = useIsMobile();

  return (
    <div className="relative min-h-screen text-foreground selection:bg-[#d4a853]/30 selection:text-white overflow-x-hidden">
      <ScrollProgressBar isMobile={isMobile} />
      <ParallaxAurora isMobile={isMobile} />
      <Particles count={isMobile ? 3 : 10} />

      <Topbar />

      <main className="relative z-10">
        {/* HERO SECTION WITH 3D MOTION DESIGN */}
        <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              {/* Badge */}
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d4a853]/40 bg-[#111118]/80 text-xs font-semibold text-[#f0d48a] shadow-lg backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#d4a853] animate-ping" />
                <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>N°1 des SaaS Restaurants au Burkina Faso</span>
              </motion.div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-foreground">
                Votre restaurant <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#b08800] drop-shadow-sm">
                  en ligne en 5 minutes
                </span>
              </h1>

              {/* Prominent Subtitle Card */}
              <div className="relative p-5 sm:p-6 rounded-2xl border border-[#d4a853]/40 bg-[#111118]/80 backdrop-blur-xl shadow-[0_15px_35px_rgba(212,168,83,0.15)] max-w-xl group overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#d4a853] via-[#f0d48a] to-[#b08800] rounded-l-2xl" />
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#d4a853]/15 blur-2xl rounded-full pointer-events-none group-hover:scale-125 transition-transform" />

                <p className="text-base sm:text-lg text-foreground/90 leading-relaxed font-medium pl-2 sm:hidden">
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#b08800]">
                    RestoBF
                  </span>{" "}
                  modernise et fait grandir votre maquis ou restaurant au Burkina Faso.
                </p>
                <p className="hidden sm:block text-base sm:text-lg text-foreground/90 leading-relaxed font-medium pl-2">
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#b08800]">
                    RestoBF
                  </span>{" "}
                  est le{" "}
                  <strong className="text-white font-bold underline decoration-[#d4a853]/50 underline-offset-4">
                    système d'exploitation digital
                  </strong>{" "}
                  conçu pour moderniser, automatiser et faire grandir les maquis, restaurants et
                  lounges du Burkina Faso. La solution tout-en-un qui transforme votre établissement
                  en une entreprise connectée et ultra-performante.
                </p>
              </div>

              {/* Interactive 3D CTAs */}
              <div className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-4">
                <Interactive3DButton
                  to="/auth/inscription"
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Créer ma page gratuite
                </Interactive3DButton>

                <Interactive3DButton href="#tarifs" variant="outline" size="lg">
                  Voir les forfaits →
                </Interactive3DButton>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5 text-foreground/90">
                  <ShieldCheck className="w-4 h-4 text-[#d4a853]" /> Sans carte bancaire
                </span>
                <span className="flex items-center gap-1.5 text-foreground/90">
                  <Zap className="w-4 h-4 text-[#d4a853]" /> Installation instantanée
                </span>
                <span className="flex items-center gap-1.5 text-foreground/90">
                  <Store className="w-4 h-4 text-[#d4a853]" /> Conçu pour le Burkina
                </span>
              </div>
            </motion.div>

            {/* Hero Right 3D Interactive Dashboard Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6"
            >
              <InteractiveDashboard3D />
            </motion.div>
          </div>
        </section>

        {/* STATS COUNTER BAR */}
        <section className="py-12 px-4 sm:px-6 border-y border border-[#d4a853]/20 bg-[#111118]/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center space-y-1"
              >
                <AnimatedStat value={s.n} />
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TEMPLATES INTERACTIVE SHOWCASE 3D CAROUSEL */}
        <section id="templates" className="py-20 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-6xl mx-auto text-center mb-10 space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4a853]/15 text-[#f0d48a] border border-[#d4a853]/30">
              Défilé 3D interactif
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
              Les{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#b08800]">
                5 Templates
              </span>{" "}
              en rotation circulaire
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Glissez ou laissez défiler automatiquement pour découvrir les différents univers
              graphiques conçus pour les restaurants du Burkina Faso.
            </p>
          </div>

          <TemplateCarousel3D />
        </section>

        {/* FONCTIONNALITÉS — AUTO-SCROLL HORIZONTAL INFINITE MARQUEE */}
        <section
          id="fonctionnalites"
          className="py-20 bg-[#0a0a0f]/80 border-y border border-[#d4a853]/20 relative overflow-hidden"
        >
          <div className="max-w-6xl mx-auto text-center mb-10 px-4 space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4a853]/15 text-[#f0d48a] border border-[#d4a853]/30">
              Défilement Automatique Continu
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
              Une armada de <span className="text-[#f0d48a]">fonctionnalités puissantes</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Survolez les cartes pour mettre en pause l'animation et explorer les détails.
            </p>
          </div>

          <InfiniteFeaturesCarousel />
        </section>

        {/* TESTIMONIALS */}
        <section id="avis" className="py-12 sm:py-24 px-4 sm:px-6 relative">
          <div className="max-w-6xl mx-auto text-center mb-8 sm:mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4a853]/15 text-[#f0d48a] border border-[#d4a853]/30">
              Témoignages
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
              Approuvé par les <span className="text-[#f0d48a]">restaurateurs du Burkina</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Découvrez les retours de ceux qui utilisent RestoBF tous les jours.
            </p>
          </div>

          {/* Mobile: swipe horizontal (évite l'empilement vertical long) */}
          <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 -mx-4 pb-2 [&::-webkit-scrollbar]:hidden">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="snap-center shrink-0 w-[82vw] rounded-xl border border-border bg-[#111118] p-5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[#f0d48a]">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current text-[#d4a853]" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2 font-semibold">
                      Avis vérifié
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 italic leading-relaxed">"{t.text}"</p>
                </div>
                <div className="pt-3 border-t border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d4a853]/20 border border-[#d4a853]/40 flex items-center justify-center font-bold text-sm text-[#f0d48a] shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-foreground">{t.name}</strong>
                    <span className="text-xs text-muted-foreground">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / tablette: grille avec cartes 3D */}
          <div className="hidden md:grid max-w-6xl mx-auto md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Motion3DTiltCard key={t.name} delay={i * 0.12} maxRotate={8}>
                <div className="p-6 h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[#f0d48a]">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current text-[#d4a853]" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2 font-semibold">
                        Avis vérifié
                      </span>
                    </div>

                    <p className="text-sm text-foreground/90 italic leading-relaxed">"{t.text}"</p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#d4a853]/20 border border-[#d4a853]/40 flex items-center justify-center font-bold text-sm text-[#f0d48a]">
                      {t.avatar}
                    </div>
                    <div>
                      <strong className="block text-sm font-bold text-foreground">{t.name}</strong>
                      <span className="text-xs text-muted-foreground">{t.role}</span>
                    </div>
                  </div>
                </div>
              </Motion3DTiltCard>
            ))}
          </div>
        </section>

        {/* PRICING SECTION WITH 2026 SAAS FEATURES */}
        <PricingSection />

        {/* FAQ ACCORDION */}
        <section id="faq" className="py-24 px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto text-center mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4a853]/15 text-[#f0d48a] border border-[#d4a853]/30">
              Questions Fréquentes
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
              Tout ce que vous devez <span className="text-[#f0d48a]">savoir</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  key={f.q}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border bg-[#111118] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:text-[#f0d48a] transition-colors cursor-pointer"
                  >
                    <span>{f.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0 text-[#d4a853]"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section id="contact" className="py-24 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center p-10 sm:p-14 rounded-3xl border border-[#d4a853]/40 bg-gradient-to-b from-[#111118] to-[#1a1a24] shadow-2xl space-y-6 relative">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#d4a853]/20 border border-[#d4a853]/40 flex items-center justify-center text-[#f0d48a]">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
              Prêt à propulser votre restaurant <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#b08800]">
                au Burkina Faso ?
              </span>
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Rejoignez plus de 50 restaurateurs satisfaits. Lancez votre menu digital et commencez
              à recevoir vos commandes WhatsApp en 5 minutes.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Interactive3DButton
                to="/auth/inscription"
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Créer ma page gratuitement
              </Interactive3DButton>

              <Interactive3DButton
                href="https://wa.me/22655300868"
                variant="secondary"
                size="lg"
                icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}
              >
                Nous écrire sur WhatsApp
              </Interactive3DButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
