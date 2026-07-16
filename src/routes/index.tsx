import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/landing/Topbar";
import { Footer } from "@/components/landing/Footer";
import { Reveal } from "@/components/landing/Reveal";
import { Particles } from "@/components/landing/Particles";
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
      {
        property: "og:description",
        content: "Site web, menu digital, commande WhatsApp et réservation. Simple et pas cher.",
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
    desc: "Photos, descriptions, prix et catégories. Vos clients commandent directement en ligne.",
  },
  {
    icon: "💬",
    title: "Commandes WhatsApp automatiques",
    desc: "Chaque plat a un bouton Commander. Le message est pré-rempli avec les détails de la commande.",
  },
  {
    icon: "🛎️",
    title: "Gestion des commandes en temps réel",
    desc: "Recevez, validez et suivez toutes les commandes depuis votre tableau de bord.",
  },
  {
    icon: "📅",
    title: "Réservations & gestion des tables",
    desc: "Plan de salle interactif, attribution automatique des tables, confirmations instantanées.",
  },
  {
    icon: "📊",
    title: "Tableau de bord & statistiques",
    desc: "Suivez vos ventes, plats populaires, heures de pointe et chiffre d'affaires.",
  },
  {
    icon: "👥",
    title: "Gestion du staff & stocks",
    desc: "Ajoutez votre équipe, gérez les rôles et suivez vos stocks en temps réel.",
  },
];

const templates = [
  { name: "TplNuit", emoji: "🌙", desc: "Ambiance nocturne élégante" },
  { name: "TplSoleil", emoji: "☀️", desc: "Style lumineux et chaleureux" },
  { name: "TplSavane", emoji: "🌾", desc: "Inspiration nature et authenticité" },
  { name: "TplMarché", emoji: "🏪", desc: "Design coloré et dynamique" },
  { name: "TplModerne", emoji: "✨", desc: "Minimaliste et contemporain" },
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
    text: "Depuis que j'ai ma page Resto BF, mes clients commandent directement sur WhatsApp. J'ai gagné du temps et je vends plus. Le tableau de bord est très simple.",
  },
  {
    name: "Oumar S.",
    role: "Propriétaire — Bobo-Dioulasso",
    avatar: "OS",
    text: "Je n'y connaissais rien en informatique. Mon fils a créé ma page en 10 minutes. Maintenant les clients voient mes plats avant de venir. Je recommande à 100%.",
  },
  {
    name: "Fatima D.",
    role: "Cheffe de cuisine — Koudougou",
    avatar: "FD",
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
  {
    q: "Combien de temps pour être opérationnel ?",
    a: "5 minutes pour créer votre compte et accéder à votre tableau de bord. Ajoutez votre menu et vos plats en 30 minutes. Votre page est immédiatement en ligne et partageable.",
  },
  {
    q: "Est-ce que je peux vraiment essayer gratuitement ?",
    a: "Oui, 30 jours d'essai gratuit avec toutes les fonctionnalités. Aucune carte bancaire requise. À la fin de l'essai, choisissez le forfait qui vous convient ou arrêtez simplement.",
  },
  {
    q: "Mes employés peuvent-ils utiliser l'application ?",
    a: "Oui, ajoutez votre équipe avec des rôles spécifiques : serveur, cuisinier, manager. Chacun accède aux fonctionnalités adaptées à son poste. Chat interne inclus pour la communication.",
  },
  {
    q: "Comment fonctionnent les commandes WhatsApp ?",
    a: "Chaque plat a un bouton Commander. Le client clique, un message WhatsApp s'ouvre avec le nom du plat, le prix et vos coordonnées. Vous recevez la commande et pouvez la valider depuis votre tableau de bord.",
  },
  {
    q: "Est-ce que je peux gérer mes stocks ?",
    a: "Oui, suivez vos ingrédients en temps réel. Recevez des alertes automatiques quand un stock est bas. Générez des rapports de consommation. Idéal pour maîtriser vos coûts et éviter les ruptures.",
  },
  {
    q: "Que se passe-t-il si je veux résilier ?",
    a: "Annulation à tout moment, sans frais. Vos données sont exportables. Vous pouvez télécharger votre menu, vos statistiques et vos factures. Aucun engagement, pas de pénalité.",
  },
];

function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        className="fixed inset-0 -z-10 opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 900px 700px at 15% 0%, rgba(212,168,83,0.16) 0%, transparent 60%), radial-gradient(ellipse 800px 600px at 100% 30%, rgba(212,168,83,0.10) 0%, transparent 60%), radial-gradient(ellipse 700px 700px at 20% 100%, rgba(212,168,83,0.09) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 grid-bg opacity-30 pointer-events-none" aria-hidden="true" />
      <Particles count={7} />

      <Topbar />

      <main>
        {/* HERO */}
        <section className="pt-28 pb-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted text-xs text-muted-foreground mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Pour les restaurants, maquis & fast-foods
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Votre restaurant
                <br />
                <span className="text-primary">en ligne en 5 minutes</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                L'application web complète pour gérer votre restaurant : menu digital, commandes en
                temps réel, gestion de cuisine, stocks, facturation et statistiques.{" "}
                <strong>Tout-en-un, simple et puissant.</strong>
              </p>
              <div className="mt-6 flex flex-col xs:flex-row gap-3">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  Créer ma page gratuite
                </Link>
                <a
                  href="#tarifs"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Voir les tarifs →
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span>🔒 Sans carte bancaire</span>
                <span>🚫 Annulation à tout moment</span>
                <span>⚡ Installation en 5 minutes</span>
                <span>🇧🇫 Conçu pour le Burkina</span>
              </div>
            </div>

            {/* Dashboard aperçu */}
            <div className="w-full max-w-sm mx-auto lg:mx-0">
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Tableau de bord</span>
                  </div>
                  <span className="text-xs font-medium text-primary">Maquis Le Karité</span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 border-b border-border">
                  {[
                    { label: "Commandes", value: "12", change: "+3", up: true },
                    { label: "Chiffre", value: "45 500", change: "+18%", up: true },
                    { label: "Clients", value: "8", change: "-2", up: false },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-sm font-bold">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                      <span
                        className={`text-[10px] font-medium ${stat.up ? "text-green-600" : "text-red-500"}`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 space-y-2">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Dernières commandes
                  </div>
                  {[
                    { plat: "Poulet braisé royal", qte: "x2", time: "18:42", statut: "Prêt" },
                    {
                      plat: "Poisson grillé Airfryer",
                      qte: "x1",
                      time: "18:38",
                      statut: "En cours",
                    },
                    { plat: "Brochettes bœuf & frites", qte: "x3", time: "18:30", statut: "Livré" },
                  ].map((cmd) => (
                    <div
                      key={cmd.plat}
                      className="flex items-center justify-between py-1.5 border-t border-border first:border-t-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs truncate">{cmd.plat}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {cmd.qte}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{cmd.time}</span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            cmd.statut === "Prêt"
                              ? "bg-green-100 text-green-700"
                              : cmd.statut === "En cours"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {cmd.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/auth/inscription"
                  className="block w-full py-2.5 text-center bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Créer mon tableau de bord gratuit →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-12 px-4 sm:px-6 border-y border-border bg-muted/30">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{s.n}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TEMPLATES */}
        <section id="templates" className="py-16 px-4 sm:px-6">
          <SectionHeader
            eyebrow="Choisissez votre style"
            title={
              <>
                5 templates <span className="text-primary">prêts à l'emploi</span>
              </>
            }
            desc="Des designs modernes et adaptés au Burkina Faso. Personnalisez couleurs, logo et photos en un clic."
          />
          <div className="max-w-6xl mx-auto mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {templates.map((t) => (
              <div
                key={t.name}
                className="p-4 rounded-xl border border-border bg-card text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 mx-auto rounded-lg bg-muted flex items-center justify-center text-2xl mb-3">
                  {t.emoji}
                </div>
                <h3 className="text-sm font-semibold">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="fonctionnalites"
          className="py-16 px-4 sm:px-6 bg-muted/30 border-y border-border"
        >
          <SectionHeader
            eyebrow="Tout ce qu'il vous faut"
            title={
              <>
                Une application web <span className="text-primary">complète</span> pour votre
                restaurant
              </>
            }
            desc="Menu digital, commandes en temps réel, gestion de cuisine, stocks, facturation, statistiques. Tout est inclus."
          />
          <div className="max-w-6xl mx-auto mt-8 grid gap-4 grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-4 sm:p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg mb-3">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* POURQUOI RESTO BF */}
        <section id="pourquoi" className="py-16 px-4 sm:px-6">
          <SectionHeader
            eyebrow="Pourquoi Resto BF"
            title={
              <>
                Tout ce qu'il faut pour{" "}
                <span className="text-primary">booster votre restaurant</span>
              </>
            }
            desc="Une solution complète pensée pour les restaurateurs du Burkina Faso."
          />
          <div className="max-w-6xl mx-auto mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🇧🇫",
                title: "100% Burkina",
                desc: "Conçu pour les restaurateurs burkinabè. Paiements Orange Money & Moov Money.",
              },
              {
                icon: "⚡",
                title: "Installation rapide",
                desc: "Créez votre page en 5 minutes. Menu, photos, prix : tout est prêt.",
              },
              {
                icon: "📱",
                title: "Commandes WhatsApp",
                desc: "Chaque plat a son bouton Commander. Le client clique, vous recevez.",
              },
              {
                icon: "🔒",
                title: "Sans engagement",
                desc: "30 jours gratuits, annulation à tout moment. Pas de carte bancaire.",
              },
              {
                icon: "🎨",
                title: "5 templates pro",
                desc: "Des designs modernes et adaptés. Personnalisez couleurs et logo.",
              },
              {
                icon: "📊",
                title: "Statistiques en temps réel",
                desc: "Suivez vos ventes, plats populaires et heures d'affluence.",
              },
              {
                icon: "👨‍🍳",
                title: "Interface cuisine",
                desc: "Les cuisiniers voient les commandes en direct. Plus d'erreurs.",
              },
              {
                icon: "💎",
                title: "Support prioritaire",
                desc: "Une équipe dédiée sur WhatsApp 7j/7 pour vous accompagner.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 sm:p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="avis" className="py-16 px-4 sm:px-6 bg-muted/30 border-y border-border">
          <SectionHeader
            eyebrow="Ils nous font confiance"
            title={
              <>
                Des restaurateurs qui en parlent{" "}
                <span className="text-primary">mieux que nous</span>
              </>
            }
            desc="Découvrez ce que disent les restaurateurs qui utilisent déjà Resto BF au quotidien."
          />
          <div className="max-w-6xl mx-auto mt-8 grid gap-4 grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="p-4 sm:p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-1 mb-2">
                  <div className="text-primary text-sm">★★★★★</div>
                  <span className="text-[10px] text-muted-foreground">Avis vérifié</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3 pt-3 border-t border-border">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium text-xs text-muted-foreground shrink-0">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <strong className="block text-xs truncate">{t.name}</strong>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {t.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="tarifs" className="py-16 px-4 sm:px-6">
          <SectionHeader
            eyebrow="Prix transparents"
            title={
              <>
                Nos <span className="text-primary">abonnements</span>
              </>
            }
            desc="Pas de frais cachés. Pas de commission sur vos ventes. Annulation à tout moment."
          />

          <div className="max-w-7xl mx-auto mt-8">
            {/* Desktop: grille 3 colonnes */}
            <div className="hidden md:grid gap-5 lg:gap-6 grid-cols-3">
              {plans.map((p) => (
                <div
                  key={p.name}
                  className={`relative p-6 rounded-xl border transition-colors ${
                    p.popular
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground whitespace-nowrap">
                      Populaire
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{p.price}</span>
                    <small className="text-xs text-muted-foreground">{p.unit}</small>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.period}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5 shrink-0">✓</span>
                        <span className="text-foreground/85">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={p.href}
                    search={{ plan: p.plan }}
                    className={`mt-6 inline-flex w-full items-center justify-center px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      p.popular
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "border border-border hover:bg-muted"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>

            {/* Mobile: cartes empilées */}
            <div className="md:hidden space-y-4">
              {plans.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedPlan(p)}
                  className={`w-full text-left relative p-5 rounded-xl border transition-colors cursor-pointer ${
                    p.popular ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-2 left-4 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground whitespace-nowrap">
                      Populaire
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold">{p.name}</h3>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold">{p.price}</span>
                        <small className="text-[10px] text-muted-foreground">{p.unit}</small>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{p.period}</p>
                    </div>
                    <span
                      className={`shrink-0 px-3 py-1.5 rounded-lg font-medium text-xs ${
                        p.popular ? "bg-primary text-primary-foreground" : "border border-border"
                      }`}
                    >
                      {p.cta}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    {p.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <span className="text-primary mt-0.5 shrink-0">✓</span>
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
              ))}
            </div>
          </div>

          {/* MODAL PLAN */}
          {selectedPlan && (
            <div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setSelectedPlan(null)}
            >
              <div className="absolute inset-0 bg-black/50" />
              <div
                className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl border border-border bg-card p-6 sm:p-8 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                    selectedPlan.popular
                      ? "bg-primary text-primary-foreground"
                      : "border border-border"
                  }`}
                >
                  {selectedPlan.popular ? "Populaire" : selectedPlan.name}
                </div>

                <h3 className="text-2xl font-bold">{selectedPlan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold">{selectedPlan.price}</span>
                  <small className="text-sm text-muted-foreground">{selectedPlan.unit}</small>
                  <span className="text-xs text-muted-foreground ml-1">{selectedPlan.period}</span>
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ce qui est inclus :
                  </p>
                  <ul className="space-y-2.5">
                    {selectedPlan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span className="text-primary mt-0.5 shrink-0">✓</span>
                        <span className="text-foreground/85">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={selectedPlan.href}
                  search={{ plan: selectedPlan.plan }}
                  className={`mt-6 inline-flex w-full items-center justify-center px-5 py-3 rounded-lg font-medium text-sm transition-colors ${
                    selectedPlan.popular
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {selectedPlan.cta}
                </Link>
              </div>
            </div>
          )}

          {/* SUR MESURE */}
          <div className="max-w-7xl mx-auto mt-8 p-6 sm:p-8 rounded-xl border-2 border-primary/30 bg-primary/5 grid lg:grid-cols-[1fr_auto] gap-4 sm:gap-6 items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                Offre Sur Mesure
              </p>
              <h3 className="text-xl sm:text-2xl font-bold">
                Un site 100% personnalisé pour votre restaurant
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Nom de domaine personnalisé, design unique, fonctionnalités spécifiques selon vos
                besoins. À partir de <strong className="text-primary">250 000 FCFA</strong>.
              </p>
            </div>
            <a
              href="https://wa.me/22655300868?text=Bonjour%2C%20je%20souhaite%20une%20offre%20sur%20mesure%20Resto%20BF"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity whitespace-nowrap text-sm"
            >
              Demander une offre sur mesure →
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 px-4 sm:px-6 bg-muted/30 border-y border-border">
          <SectionHeader
            eyebrow="Questions fréquentes"
            title={
              <>
                On répond à vos <span className="text-primary">questions</span>
              </>
            }
            desc="Les réponses aux questions que les restaurateurs nous posent le plus souvent."
          />
          <div className="max-w-3xl mx-auto mt-8 space-y-3">
            {faqs.map((f, i) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-card open:border-primary/30 transition-colors"
                open={i === 0}
              >
                <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-4 text-sm font-medium">
                  {f.q}
                  <span className="text-primary transition-transform group-open:rotate-45 shrink-0">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">
              On discute ?
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Vous avez des <span className="text-primary">questions</span> ?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Envoyez-nous un message sur WhatsApp, on vous répond en 5 minutes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="https://wa.me/22655300868"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Nous écrire sur WhatsApp
              </a>
              <a
                href="tel:+22655300868"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm"
              >
                +226 55 30 08 68
              </a>
            </div>
          </div>
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
    <div className="text-center max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">{eyebrow}</p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
