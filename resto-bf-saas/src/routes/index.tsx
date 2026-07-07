import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/landing/Topbar";
import { Footer } from "@/components/landing/Footer";
import { Particles } from "@/components/landing/Particles";
import { Reveal } from "@/components/landing/Reveal";
import { Counter } from "@/components/landing/Counter";
import { useState } from "react";
import { X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resto BF — Mettez votre restaurant en ligne au Burkina Faso" },
      {
        name: "description",
        content:
          "Créez un site web professionnel pour votre restaurant, maquis ou fast-food au Burkina Faso. Menu digital, commande WhatsApp, réservation en ligne.",
      },
      { property: "og:title", content: "Resto BF — Le SaaS pour les restaurateurs du Burkina" },
      { property: "og:description", content: "Site web, menu digital, commande WhatsApp et réservation. Simple et pas cher." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});

const features = [
  { icon: "📱", title: "Menu digital intelligent", desc: "Photos, descriptions, prix et catégories. Vos clients commandent directement en ligne." },
  { icon: "💬", title: "Commandes WhatsApp automatiques", desc: "Chaque plat a un bouton Commander. Le message est pré-rempli avec les détails de la commande." },
  { icon: "🛎️", title: "Gestion des commandes en temps réel", desc: "Recevez, validez et suivez toutes les commandes depuis votre tableau de bord." },
  { icon: "📅", title: "Réservations & gestion des tables", desc: "Plan de salle interactif, attribution automatique des tables, confirmations instantanées." },
  { icon: "📊", title: "Tableau de bord & statistiques", desc: "Suivez vos ventes, plats populaires, heures de pointe et chiffre d'affaires." },
  { icon: "👥", title: "Gestion du staff & stocks", desc: "Ajoutez votre équipe, gérez les rôles et suivez vos stocks en temps réel." },
];

const templates = [
  { name: "TplNuit", emoji: "🌙", desc: "Ambiance nocturne élégante", color: "from-indigo-900/40 to-purple-900/20" },
  { name: "TplSoleil", emoji: "☀️", desc: "Style lumineux et chaleureux", color: "from-amber-900/40 to-orange-900/20" },
  { name: "TplSavane", emoji: "🌾", desc: "Inspiration nature et authenticité", color: "from-emerald-900/40 to-teal-900/20" },
  { name: "TplMarché", emoji: "🏪", desc: "Design coloré et dynamique", color: "from-rose-900/40 to-pink-900/20" },
  { name: "TplModerne", emoji: "✨", desc: "Minimaliste et contemporain", color: "from-sky-900/40 to-blue-900/20" },
];

const stats = [
  { n: "50+", label: "Restaurants inscrits" },
  { n: "5", label: "Templates disponibles" },
  { n: "4.9", label: "Note moyenne ★" },
  { n: "24/7", label: "Support WhatsApp" },
];

const testimonials = [
  {
    name: "Aminata K.",
    role: "Gérante de maquis — Ouagadougou",
    avatar: "AK",
    color: "linear-gradient(135deg,#d29922,#b08800)",
    text: "Depuis que j'ai ma page Resto BF, mes clients commandent directement sur WhatsApp. J'ai gagné du temps et je vends plus. Le tableau de bord est très simple.",
  },
  {
    name: "Oumar S.",
    role: "Propriétaire — Bobo-Dioulasso",
    avatar: "OS",
    color: "linear-gradient(135deg,#0f6b4f,#0a4f3a)",
    text: "Je n'y connaissais rien en informatique. Mon fils a créé ma page en 10 minutes. Maintenant les clients voient mes plats avant de venir. Je recommande à 100%.",
  },
  {
    name: "Fatima D.",
    role: "Cheffe de cuisine — Koudougou",
    avatar: "FD",
    color: "linear-gradient(135deg,#b95036,#7a2e1d)",
    text: "Le plan Premium est parfait pour mon maquis. La réservation en ligne et la galerie photos font toute la différence. Le QR code sur les tables : génial.",
  },
];

const plans = [
  {
    name: "Basique",
    price: "0",
    unit: "FCFA",
    period: "30 jours gratuits",
    popular: false,
    cta: "Essai gratuit 30 jours",
    href: "/auth/inscription" as const,
    plan: "basique" as const,
    features: [
      "Template basique unique",
      "Menu jusqu'à 10 plats",
      "Commande WhatsApp",
      "QR Code restaurant",
      "Réservations basiques",
      "Statistiques essentielles",
      "Puis 5 000 FCFA/mois",
    ],
  },
  {
    name: "Standard",
    price: "10 000",
    unit: "FCFA",
    period: "/ mois",
    popular: true,
    cta: "Choisir Standard",
    href: "/auth/inscription" as const,
    plan: "standard" as const,
    features: [
      "Menu jusqu'à 30 plats",
      "Commande WhatsApp",
      "4 templates Standard améliorés",
      "QR Code restaurant",
      "Réservations avancées",
      "Statistiques basiques",
      "Galerie photos",
    ],
  },
  {
    name: "Premium",
    price: "15 000",
    unit: "FCFA",
    period: "/ mois",
    popular: false,
    cta: "Passer Premium",
    href: "/auth/inscription" as const,
    plan: "premium" as const,
    features: [
      "Menu illimité",
      "4 templates Premium animés",
      "Facturation PDF + logo",
      "Statistiques avancées",
      "Gestion employés & promotions",
      "Rapports mensuels",
      "Support prioritaire",
    ],
  },
];

const faqs = [
  { q: "Combien de temps pour être opérationnel ?", a: "5 minutes pour créer votre compte et accéder à votre tableau de bord. Ajoutez votre menu et vos plats en 30 minutes. Votre page est immédiatement en ligne et partageable." },
  { q: "Est-ce que je peux vraiment essayer gratuitement ?", a: "Oui, 30 jours d'essai gratuit avec toutes les fonctionnalités. Aucune carte bancaire requise. À la fin de l'essai, choisissez le forfait qui vous convient ou arrêtez simplement." },
  { q: "Mes employés peuvent-ils utiliser l'application ?", a: "Oui, ajoutez votre équipe avec des rôles spécifiques : serveur, cuisinier, manager. Chacun accède aux fonctionnalités adaptées à son poste. Chat interne inclus pour la communication." },
  { q: "Comment fonctionnent les commandes WhatsApp ?", a: "Chaque plat a un bouton Commander. Le client clique, un message WhatsApp s'ouvre avec le nom du plat, le prix et vos coordonnées. Vous recevez la commande et pouvez la valider depuis votre tableau de bord." },
  { q: "Est-ce que je peux gérer mes stocks ?", a: "Oui, suivez vos ingrédients en temps réel. Recevez des alertes automatiques quand un stock est bas. Générez des rapports de consommation. Idéal pour maîtriser vos coûts et éviter les ruptures." },
  { q: "Que se passe-t-il si je veux résilier ?", a: "Annulation à tout moment, sans frais. Vos données sont exportables. Vous pouvez télécharger votre menu, vos statistiques et vos factures. Aucun engagement, pas de pénalité." },
];

function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden" style={{ isolation: "isolate" }}>
      <div className="tpl-bg" aria-hidden>
        <img src="/bg-saas.jpg" alt="" />
        <span />
      </div>

      <Topbar />

      <main>
        {/* HERO */}
        <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 min-h-[90vh] sm:min-h-[100vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 70% 30%, rgba(212,168,83,0.15), transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(212,168,83,0.08), transparent 70%)",
            }}
            aria-hidden="true"
          />
          <Particles count={8} />

          <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-16 items-center w-full">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-[10px] sm:text-xs font-semibold text-gold mb-4 sm:mb-6">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  Pour les restaurants, maquis & fast-foods
                </div>
              </Reveal>
              <Reveal delay={1}>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
                  Votre restaurant<br />
                  <span className="text-gradient-gold">en ligne en 5 minutes</span>
                </h1>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                  L'application web complète pour gérer votre restaurant : menu digital, commandes en temps réel,
                  gestion de cuisine, stocks, facturation et statistiques. <strong className="text-foreground">Tout-en-un, simple et puissant.</strong>
                </p>
              </Reveal>
              <Reveal delay={3}>
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/auth/inscription"
                    className="inline-flex items-center px-5 sm:px-7 py-3 sm:py-4 rounded-2xl bg-gradient-gold text-[#0a0a0f] font-bold shadow-gold hover:-translate-y-0.5 transition-transform text-sm sm:text-base"
                  >
                    ✨ Créer ma page gratuite
                  </Link>
                  <a
                    href="#tarifs"
                    className="inline-flex items-center px-5 sm:px-7 py-3 sm:py-4 rounded-2xl border border-white/10 hover:border-gold/40 hover:bg-white/[0.03] text-foreground font-semibold transition-colors text-sm sm:text-base"
                  >
                    Voir les tarifs →
                  </a>
                </div>
              </Reveal>
              <Reveal delay={4}>
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    🔒 Sans carte bancaire
                  </span>
                  <span>🚫 Annulation à tout moment</span>
                  <span>⚡ Installation en 5 minutes</span>
                  <span>🇧🇫 Conçu pour le Burkina</span>
                </div>
              </Reveal>
            </div>

            {/* Dashboard aperçu */}
            <Reveal delay={2} className="lg:justify-self-end w-full max-w-sm sm:max-w-md mx-auto lg:mx-0">
              <div className="relative">
                <span className="absolute -top-3 -right-3 z-10 px-2 sm:px-3 py-1 rounded-lg bg-gradient-gold text-[#0a0a0f] text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-gold">
                  🚀 En direct
                </span>
                <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-dark-card overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                  {/* Header */}
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Tableau de bord</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-gold font-bold">Maquis Le Karité</span>
                  </div>
                  
                  {/* Stats rapides */}
                  <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 border-b border-white/5">
                    {[
                      { label: "Commandes", value: "12", change: "+3", up: true },
                      { label: "Chiffre", value: "45 500", change: "+18%", up: true },
                      { label: "Clients", value: "8", change: "-2", up: false },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className="text-xs sm:text-sm font-black text-foreground">{stat.value}</div>
                        <div className="text-[8px] sm:text-[9px] text-muted-foreground">{stat.label}</div>
                        <span className={`text-[8px] font-bold ${stat.up ? "text-green-500" : "text-red-400"}`}>
                          {stat.change}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Dernières commandes */}
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Dernières commandes</div>
                    {[
                      { plat: "Poulet braisé royal", qte: "x2", time: "18:42", statut: "Prêt" },
                      { plat: "Poisson grillé Airfryer", qte: "x1", time: "18:38", statut: "En cours" },
                      { plat: "Brochettes bœuf & frites", qte: "x3", time: "18:30", statut: "Livré" },
                    ].map((cmd) => (
                      <div key={cmd.plat} className="flex items-center justify-between py-1.5 border-t border-white/5 first:border-t-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] sm:text-xs truncate">{cmd.plat}</span>
                          <span className="text-[8px] text-muted-foreground shrink-0">{cmd.qte}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[8px] text-muted-foreground">{cmd.time}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                            cmd.statut === "Prêt" ? "bg-green-500/20 text-green-400" :
                            cmd.statut === "En cours" ? "bg-gold/20 text-gold" :
                            "bg-white/10 text-muted-foreground"
                          }`}>
                            {cmd.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bouton CTA */}
                  <Link
                    to="/auth/inscription"
                    className="block w-full py-2.5 sm:py-3 text-center bg-gradient-gold text-[#0a0a0f] font-bold text-[11px] sm:text-xs hover:opacity-90 transition-opacity"
                  >
                    ✨ Créer mon tableau de bord gratuit →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* TEMPLATES */}
        <section id="templates" className="py-12 sm:py-20 px-4 sm:px-6">
          <SectionHeader
            eyebrow="Choisissez votre style"
            title={<>5 templates <span className="text-gradient-gold">prêts à l'emploi</span></>}
            desc="Des designs modernes et adaptés au Burkina Faso. Personnalisez couleurs, logo et photos en un clic."
          />
          <div className="max-w-6xl mx-auto mt-8 sm:mt-12 grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {templates.map((t, i) => (
              <Reveal key={t.name} delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
                <div className="group relative p-4 sm:p-5 rounded-2xl border border-white/10 bg-dark-card hover:border-gold/30 transition-all hover:-translate-y-1 text-center">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-2xl sm:text-3xl mb-3 group-hover:scale-110 transition-transform`}>
                    {t.emoji}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold">{t.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="fonctionnalites" className="py-12 sm:py-20 px-4 sm:px-6">
          <SectionHeader
            eyebrow="Tout ce qu'il vous faut"
            title={<>Une application web <span className="text-gradient-gold">complète</span> pour votre restaurant</>}
            desc="Menu digital, commandes en temps réel, gestion de cuisine, stocks, facturation, statistiques. Tout est inclus."
          />
          <div className="max-w-6xl mx-auto mt-8 sm:mt-12 grid gap-3 sm:gap-5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
                <article className="group relative h-full p-3 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/8 bg-dark-card hover:bg-dark-card-hover hover:border-gold/30 transition-all hover:-translate-y-1 hover:shadow-gold overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-8 sm:w-14 h-8 sm:h-14 rounded-lg sm:rounded-2xl bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center text-lg sm:text-2xl mb-2 sm:mb-5 group-hover:scale-110 transition-transform">
                      {f.icon}
                    </div>
                    <h3 className="text-xs sm:text-xl font-bold mb-1 sm:mb-2 leading-tight">{f.title}</h3>
                    <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">{f.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

        {/* POURQUOI RESTO BF */}
        <section id="pourquoi" className="py-12 sm:py-24 px-4 sm:px-6 bg-[#080810] border-y border-white/5">
          <SectionHeader
            eyebrow="Pourquoi Resto BF"
            title={<>Tout ce qu'il faut pour <span className="text-gradient-gold">booster votre restaurant</span></>}
            desc="Une solution complète pensée pour les restaurateurs du Burkina Faso."
          />
          <div className="max-w-6xl mx-auto mt-8 sm:mt-16 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🇧🇫", title: "100% Burkina", desc: "Conçu pour les restaurateurs burkinabè. Paiements Orange Money & Moov Money." },
              { icon: "⚡", title: "Installation rapide", desc: "Créez votre page en 5 minutes. Menu, photos, prix : tout est prêt." },
              { icon: "📱", title: "Commandes WhatsApp", desc: "Chaque plat a son bouton Commander. Le client clique, vous recevez." },
              { icon: "🔒", title: "Sans engagement", desc: "30 jours gratuits, annulation à tout moment. Pas de carte bancaire." },
              { icon: "🎨", title: "5 templates pro", desc: "Des designs modernes et adaptés. Personnalisez couleurs et logo." },
              { icon: "📊", title: "Statistiques en temps réel", desc: "Suivez vos ventes, plats populaires et heures d'affluence." },
              { icon: "👨‍🍳", title: "Interface cuisine", desc: "Les cuisiniers voient les commandes en direct. Plus d'erreurs." },
              { icon: "💎", title: "Support prioritaire", desc: "Une équipe dédiée sur WhatsApp 7j/7 pour vous accompagner." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <div className="group relative p-4 sm:p-6 rounded-2xl border border-white/10 bg-dark-card hover:border-gold/30 transition-all hover:-translate-y-1">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{item.icon}</div>
                  <h3 className="text-sm sm:text-base font-bold mb-1">{item.title}</h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="avis" className="py-12 sm:py-28 px-4 sm:px-6">
          <SectionHeader
            eyebrow="Ils nous font confiance"
            title={<>Des restaurateurs qui en parlent <span className="text-gradient-gold">mieux que nous</span></>}
            desc="Découvrez ce que disent les restaurateurs qui utilisent déjà Resto BF au quotidien."
          />
          <div className="max-w-6xl mx-auto mt-8 sm:mt-14 grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={(i + 1) as 1 | 2 | 3}>
                <article className="relative h-full p-3 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/8 bg-dark-card">
                  <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                    <div className="text-gold text-[10px] sm:text-sm tracking-widest">★★★★★</div>
                    <span className="text-[9px] sm:text-xs text-muted-foreground">Avis vérifié</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed text-xs sm:text-[15px]">"{t.text}"</p>
                  <div className="mt-3 sm:mt-6 flex items-center gap-2 sm:gap-3 pt-3 sm:pt-5 border-t border-white/5">
                    <div
                      className="w-7 sm:w-11 h-7 sm:h-11 rounded-full flex items-center justify-center font-bold text-white text-[10px] sm:text-sm shrink-0"
                      style={{ background: t.color }}
                    >
                      {t.avatar}
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-[10px] sm:text-sm truncate">{t.name}</strong>
                      <span className="text-[9px] sm:text-xs text-muted-foreground truncate block">{t.role}</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="tarifs" className="py-12 sm:py-28 px-4 sm:px-6">
          <SectionHeader
            eyebrow="Prix transparents"
            title={<>Nos <span className="text-gradient-gold">abonnements</span></>}
            desc="Pas de frais cachés. Pas de commission sur vos ventes. Annulation à tout moment."
          />
          
          <div className="max-w-7xl mx-auto mt-8 sm:mt-14">
            {/* Desktop: grille 3 colonnes */}
            <div className="hidden md:grid gap-5 lg:gap-6 grid-cols-3">
              {plans.map((p, i) => (
                <Reveal key={p.name} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                  <div
                    className={`relative h-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl border transition-all hover:-translate-y-1 ${
                      p.popular
                        ? "border-gold bg-gradient-to-b from-gold/10 to-transparent shadow-gold scale-[1.02]"
                        : "border-white/10 bg-dark-card hover:border-gold/30"
                    }`}
                    style={p.popular ? { boxShadow: "0 0 40px rgba(212,168,83,0.15)" } : {}}
                  >
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-gold text-[#0a0a0f] shadow-gold whitespace-nowrap">
                        Populaire
                      </span>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold">{p.name}</h3>
                    <div className="mt-3 sm:mt-4 flex items-baseline gap-1">
                      <span className="text-3xl sm:text-5xl font-black text-gradient-gold">{p.price}</span>
                      <small className="text-xs sm:text-sm text-muted-foreground font-semibold">{p.unit}</small>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{p.period}</p>
                    <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="text-gold mt-0.5 shrink-0">✓</span>
                          <span className="text-foreground/85">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={p.href}
                      search={{ plan: p.plan }}
                      className={`mt-6 sm:mt-8 inline-flex w-full items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                        p.popular
                          ? "bg-gradient-gold text-[#0a0a0f] hover:shadow-gold"
                          : "border border-white/10 hover:border-gold/40 hover:bg-white/[0.03]"
                      }`}
                    >
                      {p.cta}
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Mobile: cartes empilées cliquables */}
            <div className="md:hidden space-y-4">
              {plans.map((p, i) => (
                <Reveal key={p.name} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                  <button
                    onClick={() => setSelectedPlan(p)}
                    className={`w-full text-left relative p-5 rounded-2xl border transition-all cursor-pointer ${
                      p.popular
                        ? "border-gold bg-gradient-to-b from-gold/10 to-transparent shadow-gold"
                        : "border-white/10 bg-dark-card hover:border-gold/30"
                    }`}
                    style={p.popular ? { boxShadow: "0 0 30px rgba(212,168,83,0.15)" } : {}}
                  >
                    {p.popular && (
                      <span className="absolute -top-2 left-4 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-gold text-[#0a0a0f] shadow-gold whitespace-nowrap">
                        ⭐ Populaire
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-base font-bold">{p.name}</h3>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-gradient-gold">{p.price}</span>
                          <small className="text-[10px] text-muted-foreground font-semibold">{p.unit}</small>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{p.period}</p>
                      </div>
                      <span className={`shrink-0 px-3 py-1.5 rounded-lg font-bold text-[11px] ${
                        p.popular
                          ? "bg-gradient-gold text-[#0a0a0f]"
                          : "border border-white/10"
                      }`}>
                        {p.cta}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-[11px]">
                      {p.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <span className="text-gold mt-0.5 shrink-0 text-[10px]">✓</span>
                          <span className="text-foreground/85">{f}</span>
                        </li>
                      ))}
                      {p.features.length > 4 && (
                        <li className="text-[10px] text-muted-foreground pl-3">
                          +{p.features.length - 4} autres avantages
                        </li>
                      )}
                    </ul>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>

          {/* MODAL PLAN */}
          {selectedPlan && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedPlan(null)}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              <div
                className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-3xl border border-white/10 bg-dark-card p-6 sm:p-8 shadow-2xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 ${
                  selectedPlan.popular ? "bg-gradient-gold text-[#0a0a0f]" : "border border-gold/30 text-gold"
                }`}>
                  {selectedPlan.popular ? "⭐ Populaire" : selectedPlan.name}
                </div>

                <h3 className="text-2xl font-black">{selectedPlan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-gradient-gold">{selectedPlan.price}</span>
                  <small className="text-sm text-muted-foreground font-semibold">{selectedPlan.unit}</small>
                  <span className="text-xs text-muted-foreground ml-1">{selectedPlan.period}</span>
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ce qui est inclus :</p>
                  <ul className="space-y-2.5">
                    {selectedPlan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span className="text-gold mt-0.5 shrink-0">✓</span>
                        <span className="text-foreground/85">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={selectedPlan.href}
                  search={{ plan: selectedPlan.plan }}
                  className={`mt-6 inline-flex w-full items-center justify-center px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                    selectedPlan.popular
                      ? "bg-gradient-gold text-[#0a0a0f] hover:shadow-gold"
                      : "border border-white/10 hover:border-gold/40"
                  }`}
                >
                  {selectedPlan.cta}
                </Link>
              </div>
            </div>
          )}

          {/* SUR MESURE */}
          <Reveal>
            <div className="max-w-7xl mx-auto mt-6 sm:mt-8 p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border-2 border-gold/30 bg-gradient-to-br from-gold/10 via-transparent to-transparent grid lg:grid-cols-[1fr_auto] gap-4 sm:gap-6 items-center">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-1 sm:mb-2">
                  💎 Offre Sur Mesure
                </p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black">
                  Un site 100% personnalisé pour votre restaurant
                </h3>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
                  Nom de domaine personnalisé, design unique, fonctionnalités spécifiques
                  selon vos besoins. À partir de <strong className="text-gold">250 000 FCFA</strong>.
                </p>
              </div>
              <a
                href="https://wa.me/22655300868?text=Bonjour%2C%20je%20souhaite%20une%20offre%20sur%20mesure%20Resto%20BF"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 sm:px-7 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-gold text-[#0a0a0f] font-bold shadow-gold hover:-translate-y-0.5 transition-transform whitespace-nowrap text-sm sm:text-base"
              >
                Demander une offre sur mesure →
              </a>
            </div>
          </Reveal>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#080810] border-y border-white/5">
          <SectionHeader
            eyebrow="Questions fréquentes"
            title={<>On répond à vos <span className="text-gradient-gold">questions</span></>}
            desc="Les réponses aux questions que les restaurateurs nous posent le plus souvent."
          />
          <div className="max-w-3xl mx-auto mt-10 sm:mt-14 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <details
                  className="group rounded-xl sm:rounded-2xl border border-white/8 bg-dark-card open:border-gold/30 transition-colors"
                  open={i === 0}
                >
                  <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-center justify-between gap-4 text-sm sm:text-base font-semibold">
                    {f.q}
                    <span className="text-gold text-lg sm:text-xl transition-transform group-open:rotate-45 shrink-0">+</span>
                  </summary>
                  <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="relative py-16 sm:py-28 px-4 sm:px-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,83,0.18), transparent 70%)" }}
            aria-hidden="true"
          />
          <Reveal>
            <div className="relative max-w-3xl mx-auto text-center">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2 sm:mb-3">On discute ?</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
                Vous avez des <span className="text-gradient-gold">questions</span> ?
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                Envoyez-nous un message sur WhatsApp, on vous répond en 5 minutes.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href="https://wa.me/22655300868"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-5 sm:px-7 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-gold text-[#0a0a0f] font-bold shadow-gold hover:-translate-y-0.5 transition-transform text-sm sm:text-base"
                >
                  💬 Nous écrire sur WhatsApp
                </a>
                <a
                  href="tel:+22655300868"
                  className="inline-flex items-center px-5 sm:px-7 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/10 hover:border-gold/40 hover:bg-white/[0.03] font-semibold transition-colors text-sm sm:text-base"
                >
                  📞 +226 55 30 08 68
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc: string;
}) {
  return (
    <Reveal>
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2 sm:mb-3">{eyebrow}</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">{title}</h2>
        <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground">{desc}</p>
      </div>
    </Reveal>
  );
}