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
  { icon: "📱", title: "Menu digital", desc: "Photos, descriptions, prix et catégories. Vos clients voient tout en un coup d'œil." },
  { icon: "💬", title: "WhatsApp intégré", desc: "Chaque plat a un bouton Commander. Le message WhatsApp est déjà préparé." },
  { icon: "📅", title: "Réservation en ligne", desc: "Formulaire avec choix de table, occasion, budget. Confirmation immédiate." },
  { icon: "🖼️", title: "Galerie ambiance", desc: "Montrez votre salle, votre terrasse, votre équipe. Les clients réservent plus." },
  { icon: "⭐", title: "Avis clients", desc: "Affichez les témoignages. Chaque avis est un motif de confiance." },
  { icon: "📊", title: "Tableau de bord", desc: "Gérez votre menu, vos prix et vos infos depuis un espace simple." },
];

const steps = [
  { n: 1, title: "Créez votre compte", desc: "Entrez le nom de votre restaurant et votre email. Gratuit et sans engagement." },
  { n: 2, title: "Ajoutez vos plats", desc: "Photos, noms, prix et catégories. Commencez avec 3 plats ou tout votre menu." },
  { n: 3, title: "Partagez votre page", desc: "Un lien unique à partager sur WhatsApp, Facebook ou en QR code sur vos tables." },
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
    name: "Essai gratuit",
    price: "0",
    unit: "FCFA",
    period: "14 jours offerts",
    popular: false,
    cta: "Démarrer mon essai",
    href: "/auth/inscription" as const,
    features: [
      "Toutes les fonctionnalités Standard",
      "Aucune carte bancaire",
      "Site en ligne immédiatement",
      "À la fin : choix d'un abonnement",
    ],
  },
  {
    name: "Standard",
    price: "10 000",
    unit: "FCFA",
    period: "/ mois",
    popular: false,
    cta: "Choisir Standard",
    href: "/auth/inscription" as const,
    features: [
      "Menu jusqu'à 30 plats",
      "Commande WhatsApp",
      "4 templates Standard améliorés",
      "QR Code restaurant",
      "Réservations avancées",
      "Statistiques basiques",
    ],
  },
  {
    name: "Standard Plus",
    price: "15 000",
    unit: "FCFA",
    period: "/ mois",
    popular: true,
    cta: "Choisir Standard Plus",
    href: "/auth/inscription" as const,
    features: [
      "Tout Standard",
      "Menu jusqu'à 80 plats",
      "Galerie ambiance améliorée",
      "Personnalisation avancée",
      "Avis clients modérés",
      "Support prioritaire",
    ],
  },
  {
    name: "Premium",
    price: "25 000",
    unit: "FCFA",
    period: "/ mois",
    popular: false,
    cta: "Passer Premium",
    href: "/auth/inscription" as const,
    features: [
      "Menu illimité",
      "4 templates Premium animés",
      "Facturation + logo personnalisé",
      "Statistiques avancées",
      "Gestion employés & promotions",
      "Rapports PDF mensuels",
      "Export & sauvegardes auto",
    ],
  },
];

const faqs = [
  { q: "Combien coûte vraiment Resto BF ?", a: "Vous démarrez par un essai gratuit de 14 jours. Ensuite : Standard 10 000 FCFA/mois, Standard Plus 15 000 FCFA/mois, Premium 25 000 FCFA/mois. Pas de frais d'installation, pas de commission." },
  { q: "Mes clients n'ont pas forcément internet rapide. Ça marche ?", a: "Votre page se charge en moins de 2 secondes même en 3G. Chaque image est optimisée pour le réseau burkinabè." },
  { q: "Comment mes clients trouvent ma page ?", a: "Vous recevez un lien unique et un QR code à imprimer. Partagez-le sur WhatsApp, sur vos tables ou sur votre enseigne." },
  { q: "Est-ce que je peux essayer gratuitement ?", a: "Oui ! L'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités Standard. À la fin, vous choisissez votre abonnement." },
  { q: "Comment fonctionne la commande WhatsApp ?", a: "Chaque plat a un bouton Commander. Le client clique, un message WhatsApp s'ouvre déjà préparé avec le nom du plat, le prix et vos coordonnées." },
  { q: "Je veux un site 100% personnalisé. C'est possible ?", a: "Oui, avec notre offre Sur Mesure (à partir de 250 000 FCFA) : nom de domaine personnalisé, design unique, fonctionnalités spécifiques selon vos besoins. Contactez-nous au +226 55 30 08 68." },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Topbar />

      <main>
        {/* HERO */}
        <section className="relative pt-32 pb-20 px-6 min-h-[100vh] flex items-center overflow-hidden">
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

          <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-xs font-semibold text-gold mb-6">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  Pour les restaurants, maquis & fast-foods
                </div>
              </Reveal>
              <Reveal delay={1}>
                <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
                  Votre restaurant<br />
                  <span className="text-gradient-gold">en ligne en 5 minutes</span>
                </h1>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Offrez à vos clients une belle page web avec menu digital, photos de vos plats,
                  commande WhatsApp et réservation. <strong className="text-foreground">Simple, rapide, pas cher.</strong>
                </p>
              </Reveal>
              <Reveal delay={3}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/auth/inscription"
                    className="inline-flex items-center px-7 py-4 rounded-2xl bg-gradient-gold text-[#0a0a0f] font-bold shadow-gold hover:-translate-y-0.5 transition-transform"
                  >
                    ✨ Créer ma page gratuite
                  </Link>
                  <a
                    href="#fonctionnalites"
                    className="inline-flex items-center px-7 py-4 rounded-2xl border border-white/10 hover:border-gold/40 hover:bg-white/[0.03] text-foreground font-semibold transition-colors"
                  >
                    Voir les fonctionnalités →
                  </a>
                </div>
              </Reveal>
              <Reveal delay={4}>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span>🔒 Sans carte bancaire</span>
                  <span>🚫 Annulation à tout moment</span>
                  <span>🇧🇫 Conçu pour le Burkina</span>
                </div>
              </Reveal>
            </div>

            {/* Mockup */}
            <Reveal delay={2} className="lg:justify-self-end w-full max-w-md">
              <div className="relative">
                <span className="absolute -top-3 -right-3 z-10 px-3 py-1 rounded-lg bg-gradient-gold text-[#0a0a0f] text-[10px] font-black uppercase tracking-wider shadow-gold">
                  Plan Premium
                </span>
                <div className="rounded-3xl border border-white/10 bg-dark-card overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                  <div className="flex gap-1.5 p-4 border-b border-white/5">
                    <span className="w-3 h-3 rounded-full bg-red-500/60" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <span className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center font-black text-[#0a0a0f]">
                        R
                      </span>
                      <strong className="text-base">Maquis Le Karité</strong>
                    </div>
                    {[
                      { name: "Poulet braisé royal", price: "3 000 FCFA", emoji: "🍗" },
                      { name: "Poisson grillé Airfryer", price: "4 500 FCFA", emoji: "🐟" },
                      { name: "Brochettes de bœuf & frites", price: "3 500 FCFA", emoji: "🥩" },
                    ].map((d) => (
                      <div key={d.name} className="flex items-center gap-3 py-3 border-t border-white/5 first:border-t-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-2xl">
                          {d.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <strong className="block text-sm truncate">{d.name}</strong>
                          <span className="text-xs text-gold font-bold">{d.price}</span>
                        </div>
                      </div>
                    ))}
                    <button className="mt-4 w-full py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:opacity-90 transition-opacity">
                      📱 Commander sur WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* STATS */}
        <section className="relative border-y border-white/5 bg-[#080810] py-12 px-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(212,168,83,0.15), transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { n: 5, suffix: "", label: "Minutes pour créer sa page" },
              { n: 5000, suffix: " F", label: "Plan Standard / mois" },
              { n: 10000, suffix: " F", label: "Plan Premium / mois" },
              { n: 0, suffix: "%", label: "Commission sur les ventes" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={(i + 1) as 1 | 2 | 3 | 4}>
                <div>
                  <div className="text-3xl md:text-4xl font-black text-gradient-gold">
                    <Counter target={s.n} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
            {["📱 Orange Money", "📱 Moov Money", "🇧🇫 Made in Burkina", "🔒 Sans engagement", "⚡ Installation offerte"].map((b) => (
              <span key={b} className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/[0.02] text-muted-foreground">
                {b}
              </span>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="fonctionnalites" className="py-28 px-6">
          <SectionHeader
            eyebrow="Tout ce qu'il vous faut"
            title={<>Une solution <span className="text-gradient-gold">complète</span> pour votre restaurant</>}
            desc="Pas besoin de compétences techniques. En quelques clics, votre restaurant a une présence en ligne professionnelle."
          />
          <div className="max-w-6xl mx-auto mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
                <article className="group relative h-full p-7 rounded-3xl border border-white/8 bg-dark-card hover:bg-dark-card-hover hover:border-gold/30 transition-all hover:-translate-y-1 hover:shadow-gold">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* STEPS */}
        <section id="demo" className="py-28 px-6 bg-[#080810] border-y border-white/5">
          <SectionHeader
            eyebrow="Simple et rapide"
            title={<>Comment <span className="text-gradient-gold">ça marche</span></>}
            desc="Trois étapes suffisent pour lancer votre page."
          />
          <div className="max-w-5xl mx-auto mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={((i * 2) + 1) as 1 | 3 | 5}>
                <div className="relative text-center px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-gold text-[#0a0a0f] text-2xl font-black shadow-gold mb-5">
                    {s.n}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="avis" className="py-28 px-6">
          <SectionHeader
            eyebrow="Ils nous font confiance"
            title={<>Des restaurateurs qui en parlent <span className="text-gradient-gold">mieux que nous</span></>}
            desc="Découvrez ce que disent les restaurateurs qui utilisent déjà Resto BF au quotidien."
          />
          <div className="max-w-6xl mx-auto mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={(i + 1) as 1 | 2 | 3}>
                <article className="relative h-full p-7 rounded-3xl border border-white/8 bg-dark-card">
                  <div className="text-gold text-sm tracking-widest mb-3">★★★★★</div>
                  <p className="text-foreground/90 leading-relaxed text-[15px]">"{t.text}"</p>
                  <div className="mt-6 flex items-center gap-3 pt-5 border-t border-white/5">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm"
                      style={{ background: t.color }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <strong className="block text-sm">{t.name}</strong>
                      <span className="text-xs text-muted-foreground">{t.role}</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="tarifs" className="py-28 px-6">
          <SectionHeader
            eyebrow="Prix transparents"
            title={<>Nos <span className="text-gradient-gold">abonnements</span></>}
            desc="Pas de frais cachés. Pas de commission sur vos ventes. Annulation à tout moment."
          />
          <div className="max-w-6xl mx-auto mt-14 grid gap-6 md:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={(i + 1) as 1 | 2 | 3}>
                <div
                  className={`relative h-full p-8 rounded-3xl border transition-all hover:-translate-y-1 ${
                    p.popular
                      ? "border-gold bg-gradient-to-b from-gold/10 to-transparent shadow-gold scale-[1.02]"
                      : "border-white/10 bg-dark-card hover:border-gold/30"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-gold text-[#0a0a0f] shadow-gold">
                      Populaire
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gradient-gold">{p.price}</span>
                    <small className="text-sm text-muted-foreground font-semibold">{p.unit}</small>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.period}</p>
                  <ul className="mt-6 space-y-3 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-gold mt-0.5">✓</span>
                        <span className="text-foreground/85">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={p.href}
                    className={`mt-8 inline-flex w-full items-center justify-center px-5 py-3 rounded-xl font-bold text-sm transition-all ${
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
        </section>

        {/* FAQ */}
        <section id="faq" className="py-28 px-6 bg-[#080810] border-y border-white/5">
          <SectionHeader
            eyebrow="Questions fréquentes"
            title={<>On répond à vos <span className="text-gradient-gold">questions</span></>}
            desc="Les réponses aux questions que les restaurateurs nous posent le plus souvent."
          />
          <div className="max-w-3xl mx-auto mt-14 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <details
                  className="group rounded-2xl border border-white/8 bg-dark-card open:border-gold/30 transition-colors"
                  open={i === 0}
                >
                  <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4 text-base font-semibold">
                    {f.q}
                    <span className="text-gold text-xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="relative py-28 px-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,83,0.18), transparent 70%)" }}
            aria-hidden="true"
          />
          <Reveal>
            <div className="relative max-w-3xl mx-auto text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">On discute ?</p>
              <h2 className="text-4xl md:text-5xl font-black">
                Vous avez des <span className="text-gradient-gold">questions</span> ?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Envoyez-nous un message sur WhatsApp, on vous répond en 5 minutes.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href="https://wa.me/22670000000"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-7 py-4 rounded-2xl bg-gradient-gold text-[#0a0a0f] font-bold shadow-gold hover:-translate-y-0.5 transition-transform"
                >
                  💬 Nous écrire sur WhatsApp
                </a>
                <a
                  href="tel:+22670000000"
                  className="inline-flex items-center px-7 py-4 rounded-2xl border border-white/10 hover:border-gold/40 hover:bg-white/[0.03] font-semibold transition-colors"
                >
                  📞 +226 70 00 00 00
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
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">{eyebrow}</p>
        <h2 className="text-4xl md:text-5xl font-black leading-tight">{title}</h2>
        <p className="mt-4 text-muted-foreground">{desc}</p>
      </div>
    </Reveal>
  );
}
