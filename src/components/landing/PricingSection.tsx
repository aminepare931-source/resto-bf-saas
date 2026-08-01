import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Interactive3DButton } from "./Interactive3DButton";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  Calculator,
  Percent,
  Clock,
  Flame,
  Check,
} from "lucide-react";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [dailyOrders, setDailyOrders] = useState<number>(30);

  // ROI Calculator Calculations
  // Average meal ticket: 2,500 FCFA
  // Commission on standard delivery apps: ~15%
  // RestoBF commission: 0%
  const avgTicket = 2500;
  const monthlyVolume = dailyOrders * 30 * avgTicket;
  const deliveryAppCommissions = Math.round(monthlyVolume * 0.15);
  const restoBfCost = billingCycle === "monthly" ? 5000 : 4000;
  const monthlySavings = deliveryAppCommissions - restoBfCost;

  const plans = [
    {
      id: "basique",
      name: "Essai / Découverte",
      badge: "30 Jours Gratuits",
      desc: "Idéal pour tester l'impact du menu QR Code sans aucun engagement.",
      monthlyPrice: 0,
      yearlyPrice: 0,
      period: "100% gratuit pendant 30j",
      popular: false,
      accentColor: "#38bdf8",
      cta: "Démarrer l'essai gratuit",
      href: "/auth/inscription" as const,
      features: [
        "Menu digital QR Code (jusqu'à 10 plats)",
        "Commandes WhatsApp directes en 1-clic",
        "1 Template classique personnalisable",
        "Génération de QR Code haute résolution",
        "Support WhatsApp réactif 7j/7",
        "Puis 2 500 FCFA / mois après l'essai",
      ],
    },
    {
      id: "standard",
      name: "Standard Pro",
      badge: "Formule la plus populaire 🔥",
      desc: "Pour maquis, restaurants et fast-foods qui veulent automatiser leur service.",
      monthlyPrice: 5000,
      yearlyPrice: 4000, // 20% discount (48,000 FCFA / an)
      period: billingCycle === "monthly" ? "/ mois" : "/ mois (facturé annuellement)",
      popular: true,
      accentColor: "#d4a853",
      cta: "Choisir la formule Standard",
      href: "/auth/inscription" as const,
      features: [
        "Menu jusqu'à 35 plats & boissons avec options",
        "Commandes WhatsApp illimitées & formatées",
        "4 Templates premium 3D au choix",
        "Écran Cuisine KDS & suivi des bons en direct",
        "Avis clients & galerie photos HD",
        "Réservations de tables avec notifications",
        "Paiement Mobile Money (Orange & Moov)",
      ],
    },
    {
      id: "premium",
      name: "Premium VIP",
      badge: "Performances Maximale",
      desc: "Pour grands établissements, lounges VIP et enseignes multi-salles.",
      monthlyPrice: 7500,
      yearlyPrice: 6000, // 20% discount (72,000 FCFA / an)
      period: billingCycle === "monthly" ? "/ mois" : "/ mois (facturé annuellement)",
      popular: false,
      accentColor: "#a855f7",
      cta: "Passer en Premium VIP",
      href: "/auth/inscription" as const,
      features: [
        "Menu illimité & catégories personnalisées",
        "Les 5 Templates 3D d'exception inclus",
        "Facturation PDF avec logo & entête personnalisée",
        "Gestion d'équipe complète & droits par PIN",
        "Statistiques détaillées & rapports de ventes",
        "Gestion des stocks & alertes ingrédients",
        "Accompagnement & paramétrage VIP offert",
      ],
    },
  ];

  return (
    <section
      id="tarifs"
      className="py-12 sm:py-24 px-4 sm:px-6 bg-[#0a0a0f]/90 border-y border border-[#d4a853]/20 relative overflow-hidden"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#d4a853]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto text-center mb-8 sm:mb-12 space-y-4">
        <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#d4a853]/15 text-[#f0d48a] border border-[#d4a853]/30 shadow-sm inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#d4a853]" />
          <span>Abonnements Transparents — 0% Commission</span>
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
          Investissez dans la{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#b08800]">
            croissance de votre restaurant
          </span>
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Payer au mois ou économisez jusqu'à <strong className="text-[#f0d48a]">20%</strong> avec
          l'engagement annuel. Essai gratuit de 30 jours sans carte bancaire sur toutes les
          formules.
        </p>

        {/* Billing Toggle (Monthly vs Yearly) */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span
            className={`text-xs font-extrabold ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Facturation Mensuelle
          </span>

          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-8 rounded-full bg-[#1a1a24] border border-[#d4a853]/40 p-1 cursor-pointer transition-colors focus:outline-none"
          >
            <motion.div
              animate={{ x: billingCycle === "yearly" ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-6 h-6 rounded-full bg-gradient-to-r from-[#d4a853] to-[#f0d48a] shadow-md flex items-center justify-center text-[#0a0a0f]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
            </motion.div>
          </button>

          <span
            className={`text-xs font-extrabold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
          >
            <span>Facturation Annuelle</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold">
              -20% Réduction
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-6xl mx-auto flex md:grid md:grid-cols-3 gap-5 md:gap-8 items-stretch mb-10 sm:mb-16 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none px-4 -mx-4 md:px-0 md:mx-auto [&::-webkit-scrollbar]:hidden">
        {plans.map((p, i) => {
          const displayPrice = billingCycle === "monthly" ? p.monthlyPrice : p.yearlyPrice;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className={`relative shrink-0 w-[84vw] md:w-auto snap-center rounded-3xl p-6 sm:p-8 border bg-[#111118]/95 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 group ${
                p.popular
                  ? "border-[#d4a853] shadow-[0_20px_50px_rgba(212,168,83,0.3)] ring-2 ring-[#d4a853]/50"
                  : "border-border hover:border-[#d4a853]/40 shadow-xl"
              }`}
            >
              {/* Highlight Top Banner for Popular Plan */}
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] shadow-lg flex items-center gap-1.5 whitespace-nowrap z-20">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{p.badge}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-foreground">{p.name}</h3>
                  {!p.popular && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1a1a24] border border-border text-muted-foreground">
                      {p.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground min-h-[36px] leading-relaxed">
                  {p.desc}
                </p>

                {/* Price Display */}
                <div className="mt-6 p-4 rounded-2xl bg-[#0a0a0f]/80 border border-white/5 flex items-baseline justify-between">
                  <div>
                    {displayPrice === 0 ? (
                      <span className="text-3xl font-black text-emerald-400">0 FCFA</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                          {displayPrice.toLocaleString("fr-FR")}
                        </span>
                        <span className="text-xs font-bold text-[#f0d48a]">FCFA</span>
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                      {p.period}
                    </p>
                  </div>

                  {billingCycle === "yearly" && displayPrice > 0 && (
                    <div className="text-right">
                      <span className="line-through text-xs text-muted-foreground block">
                        {(p.monthlyPrice * 12).toLocaleString("fr-FR")} FCFA
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        Économisez {((p.monthlyPrice - p.yearlyPrice) * 12).toLocaleString("fr-FR")}{" "}
                        FCFA/an
                      </span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="mt-6 space-y-3">
                  {p.features.map((f, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${p.accentColor}25`, color: p.accentColor }}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-5 border-t border-border/60">
                <Interactive3DButton
                  to={p.href}
                  search={{ plan: p.id }}
                  variant={p.popular ? "primary" : "outline"}
                  size="md"
                  className="w-full"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  {p.cta}
                </Interactive3DButton>
                <p className="text-[10px] text-center text-muted-foreground mt-2 font-medium">
                  30 jours gratuits · Sans carte requise
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DEPLOIEMENT CLE EN MAIN & WHY RESTOBF (REPLACES SIMULATOR) */}
      <div className="max-w-5xl mx-auto p-5 sm:p-10 rounded-3xl border border-[#d4a853]/40 bg-gradient-to-br from-[#111118] via-[#111118] to-[#1a160d] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4a853]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#d4a853]/15 border border-[#d4a853]/30 text-xs font-bold text-[#f0d48a]">
              <ShieldCheck className="w-4 h-4 text-[#d4a853]" />
              <span>Inclus avec votre abonnement</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-foreground">
              Déploiement <span className="text-[#f0d48a]">100% Clé en Main</span> & Sans Effort
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Vous n'avez rien à configurer de complexe. Notre équipe locale au Burkina Faso
              s'occupe de tout pour que votre établissement soit opérationnel dès aujourd'hui.
            </p>
          </div>

          {/* 4 Pillars of Turnkey Setup */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0a0a0f]/80 border border-white/10 hover:border-[#d4a853]/50 transition-all space-y-1.5 sm:space-y-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#d4a853]/20 text-[#f0d48a] flex items-center justify-center font-bold text-base sm:text-lg group-hover:scale-110 transition-transform">
                1
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">Saisie de votre Menu Offerte</h4>
              <p className="hidden sm:block text-xs text-muted-foreground leading-relaxed">
                Envoyez-nous simplement la photo de votre carte papier actuelle sur WhatsApp. Nous
                saisissons tous vos plats, tarifs et photos en 24h.
              </p>
            </div>

            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0a0a0f]/80 border border-white/10 hover:border-[#d4a853]/50 transition-all space-y-1.5 sm:space-y-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#d4a853]/20 text-[#f0d48a] flex items-center justify-center font-bold text-base sm:text-lg group-hover:scale-110 transition-transform">
                2
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">Stickers QR Prêts à l'Emploi</h4>
              <p className="hidden sm:block text-xs text-muted-foreground leading-relaxed">
                Nous générons vos visuels QR Code haute définition prêts à imprimer pour vos tables,
                le bar, le comptoir et vos réseaux sociaux.
              </p>
            </div>

            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0a0a0f]/80 border border-white/10 hover:border-[#d4a853]/50 transition-all space-y-1.5 sm:space-y-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#d4a853]/20 text-[#f0d48a] flex items-center justify-center font-bold text-base sm:text-lg group-hover:scale-110 transition-transform">
                3
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">Formation Express Staff</h4>
              <p className="hidden sm:block text-xs text-muted-foreground leading-relaxed">
                Vos serveurs et cuisiniers sont formés en 15 minutes. L'interface est fluide et
                s'utilise sur n'importe quel smartphone ou tablette.
              </p>
            </div>

            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0a0a0f]/80 border border-white/10 hover:border-[#d4a853]/50 transition-all space-y-1.5 sm:space-y-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#d4a853]/20 text-[#f0d48a] flex items-center justify-center font-bold text-base sm:text-lg group-hover:scale-110 transition-transform">
                4
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">Assistance WhatsApp 7j/7</h4>
              <p className="hidden sm:block text-xs text-muted-foreground leading-relaxed">
                Une équipe basée à Ouagadougou et Bobo-Dioulasso disponible 7 jours sur 7 pour vous
                assister à tout moment.
              </p>
            </div>
          </div>

          {/* Guarantee Highlight Banner */}
          <div className="p-4 rounded-xl bg-[#1a1a24] border border-[#d4a853]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/90">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white block font-bold">
                  Garantie Risque Zéro — 30 Jours d'Essai Totalement Gratuits
                </strong>
                <span className="text-muted-foreground">
                  Testez sur le terrain dans votre maquis ou restaurant sans sortir 1 seul franc.
                </span>
              </div>
            </div>

            <Interactive3DButton
              to="/auth/inscription"
              variant="primary"
              size="sm"
              className="shrink-0"
            >
              Tester Gratuitement Maintenant
            </Interactive3DButton>
          </div>
        </div>
      </div>

      {/* SUR MESURE / WHATSAPP BANNER */}
      <div className="max-w-5xl mx-auto mt-8 sm:mt-12 p-5 sm:p-8 rounded-2xl border border-white/10 bg-[#111118]/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#f0d48a]">
            Grandes Enseignes & Multi-Salles
          </span>
          <h4 className="text-lg font-extrabold text-foreground">
            Besoin d'une plateforme personnalisée avec votre propre nom de domaine (.bf / .com) ?
          </h4>
          <p className="text-xs text-muted-foreground">
            Notre équipe au Burkina vous accompagne de A à Z (Nom de domaine, installation sur
            place, formation du personnel).
          </p>
        </div>

        <Interactive3DButton
          href="https://wa.me/22655300868?text=Bonjour%2C%20je%20souhaite%20une%20offre%20sur%20mesure%20Resto%20BF"
          variant="gold-glow"
          size="md"
          icon={<MessageCircle className="w-4 h-4" />}
          className="shrink-0"
        >
          Discuter avec notre expert
        </Interactive3DButton>
      </div>
    </section>
  );
}
