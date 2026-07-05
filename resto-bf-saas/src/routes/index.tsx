import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/landing/Topbar";
import { Footer } from "@/components/landing/Footer";
import { Particles } from "@/components/landing/Particles";
import { Reveal } from "@/components/landing/Reveal";
import { Counter } from "@/components/landing/Counter";


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
  { icon: "👨‍🍳", title: "Interface cuisine dédiée", desc: "Les cuisiniers voient les commandes en direct avec minuteur et statut de préparation." },
  { icon: "📅", title: "Réservations & gestion des tables", desc: "Plan de salle interactif, attribution automatique des tables, confirmations instantanées." },
  { icon: "📊", title: "Tableau de bord complet", desc: "Statistiques détaillées, gestion du menu, des prix, des stocks et de votre équipe." },
  { icon: "📦", title: "Gestion des stocks", desc: "Suivez vos ingrédients en temps réel. Alertes automatiques quand le stock est bas." },
  { icon: "🧾", title: "Facturation PDF professionnelle", desc: "Générez des factures automatiquement avec votre logo. Envoyez-les par WhatsApp ou email." },
  { icon: "💬", title: "Chat interne équipe", desc: "Communication instantanée entre le service, la cuisine et le management." },
  { icon: "⭐", title: "Avis clients & réputation", desc: "Collectez et affichez les témoignages. Chaque avis renforce votre confiance." },
  { icon: "📈", title: "Statistiques avancées", desc: "Analysez vos ventes, vos plats populaires, vos heures de pointe et votre chiffre d'affaires." },
  { icon: "👥", title: "Gestion du staff", desc: "Ajoutez des employés avec rôles (serveur, cuisinier, manager). Contrôlez les accès." },
];

const steps = [
  { n: 1, title: "Créez votre compte", desc: "Entrez le nom de votre restaurant et votre email. Accédez immédiatement à votre tableau de bord." },
  { n: 2, title: "Configurez votre espace", desc: "Ajoutez votre menu, vos plats, vos prix. Personnalisez votre template. Gérez votre équipe et vos stocks." },
  { n: 3, title: "Partagez et gérez", desc: "Vos clients commandent sur votre page. Vous gérez tout depuis l'appli : commandes, cuisine, stocks, factures." },
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

            {/* Mockup */}
            <Reveal delay={2} className="lg:justify-self-end w-full max-w-sm sm:max-w-md mx-auto lg:mx-0">
              <div className="relative">
                <span className="absolute -top-3 -right-3 z-10 px-2 sm:px-3 py-1 rounded-lg bg-gradient-gold text-[#0a0a0f] text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-gold">
                  Plan Premium
                </span>
                <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-dark-card overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                  <div className="flex gap-1.5 p-3 sm:p-4 border-b border-white/5">
                    <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-500/60" />
                    <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-yellow-500/60" />
                    <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="p-3 sm:p-5">
                    <div className="flex items-center gap-3 mb-4 sm:mb-5">
                      <span className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-gradient-gold flex items-center justify-center font-black text-[#0a0a0f] text-sm sm:text-base">
                        R
                      </span>
                      <strong className="text-sm sm:text-base">Maquis Le Karité</strong>
                    </div>
                    {[
                      { name: "Poulet braisé royal", price: "3 000 FCFA", emoji: "🍗" },
                      { name: "Poisson grillé Airfryer", price: "4 500 FCFA", emoji: "🐟" },
                      { name: "Brochettes de bœuf & frites", price: "3 500 FCFA", emoji: "🥩" },
                    ].map((d) => (
                      <div key={d.name} className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-t border-white/5 first:border-t-0">
                        <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-lg sm:text-2xl shrink-0">
                          {d.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <strong className="block text-xs sm:text-sm truncate">{d.name}</strong>
                          <span className="text-[11px] sm:text-xs text-gold font-bold">{d.price}</span>
                        </div>
                      </div>
                    ))}
                    <button className="mt-3 sm:mt-4 w-full py-2.5 sm:py-3 rounded-xl bg-[#25D366] text-white font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity">
                      📱 Commander sur WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* STATS */}
        <section className="relative border-y border-white/5 bg-[#080810] py-10 sm:py-12 px-4 sm:px-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(212,168,83,0.15), transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            {[
              { n: 5, suffix: "", label: "Minutes pour créer sa page" },
              { n: 30, suffix: " jours", label: "Essai gratuit offert" },
              { n: 10000, suffix: " F", label: "Plan Standard / mois" },
              { n: 0, suffix: "%", label: "Commission sur les ventes" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={(i + 1) as 1 | 2 | 3 | 4}>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gradient-gold">
                    <Counter target={s.n} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-muted-foreground">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="relative mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3 max-w-5xl mx-auto px-2">
            {["📱 Orange Money", "📱 Moov Money", "🇧🇫 Made in Burkina", "🔒 Sans engagement", "⚡ Installation offerte"].map((b) => (
              <span key={b} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs border border-white/10 bg-white/[0.02] text-muted-foreground">
                {b}
              </span>
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
          <div className="max-w-6xl mx-auto mt-8 sm:mt-12 grid gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.slice(0, 6).map((f, i) => (
              <Reveal key={f.title} delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
                <article className="group relative h-full p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/8 bg-dark-card hover:bg-dark-card-hover hover:border-gold/30 transition-all hover:-translate-y-1 hover:shadow-gold overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-10 sm:w-14 h-10 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-5 group-hover:scale-110 transition-transform">
                      {f.icon}
                    </div>
                    <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
            <div className="max-w-6xl mx-auto mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">Et bien plus encore :</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {features.slice(6).map((f) => (
                  <span key={f.title} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs border border-white/10 bg-white/[0.02] text-muted-foreground">
                    {f.icon} {f.title}
                  </span>
                ))}
              </div>
            </div>
          </section>

        {/* STEPS */}
        <section id="demo" className="py-16 sm:py-28 px-4 sm:px-6 bg-[#080810] border-y border-white/5">
          <SectionHeader
            eyebrow="Simple et rapide"
            title={<>Comment <span className="text-gradient-gold">ça marche</span></>}
            desc="Trois étapes pour accéder à votre application web complète."
          />
          <div className="max-w-5xl mx-auto mt-10 sm:mt-16 grid gap-6 sm:gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={((i * 2) + 1) as 1 | 3 | 5}>
                <div className="relative text-center px-2 sm:px-4">
                  <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-gold text-[#0a0a0f] text-lg sm:text-2xl font-black shadow-gold mb-3 sm:mb-5">
                    {s.n}
                  </div>
                  <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="avis" className="py-16 sm:py-28 px-4 sm:px-6">
          <SectionHeader
            eyebrow="Ils nous font confiance"
            title={<>Des restaurateurs qui en parlent <span className="text-gradient-gold">mieux que nous</span></>}
            desc="Découvrez ce que disent les restaurateurs qui utilisent déjà Resto BF au quotidien."
          />
          <div className="max-w-6xl mx-auto mt-10 sm:mt-14 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={(i + 1) as 1 | 2 | 3}>
                <article className="relative h-full p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/8 bg-dark-card">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className="text-gold text-xs sm:text-sm tracking-widest">★★★★★</div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Avis vérifié</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed text-sm sm:text-[15px]">"{t.text}"</p>
                  <div className="mt-4 sm:mt-6 flex items-center gap-3 pt-4 sm:pt-5 border-t border-white/5">
                    <div
                      className="w-9 sm:w-11 h-9 sm:h-11 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm shrink-0"
                      style={{ background: t.color }}
                    >
                      {t.avatar}
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-xs sm:text-sm truncate">{t.name}</strong>
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate block">{t.role}</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="tarifs" className="py-16 sm:py-28 px-4 sm:px-6">
          <SectionHeader
            eyebrow="Prix transparents"
            title={<>Nos <span className="text-gradient-gold">abonnements</span></>}
            desc="Pas de frais cachés. Pas de commission sur vos ventes. Annulation à tout moment."
          />
          <div className="max-w-7xl mx-auto mt-10 sm:mt-14 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
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