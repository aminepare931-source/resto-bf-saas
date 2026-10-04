import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Calendar, Lock, MessageSquare, QrCode, Smartphone } from "lucide-react";

export const Route = createFileRoute("/auth/abonnement")({
  head: () => ({
    meta: [
      { title: "Abonnement Basique — RestoBF" },
      {
        name: "description",
        content:
          "Découvrez l'abonnement basique de RestoBF. Menu digital, commandes en ligne, QR Code. Simple et abordable.",
      },
    ],
  }),
  component: AbonnementBasiquePage,
});

function AbonnementBasiquePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero avec fond émeraude léger */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-tint via-background to-background" />
        <div className="absolute inset-0 opacity-10">
          <img src="/bg-savane.jpg" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald/30 bg-emerald-tint text-emerald-deep text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                Abonnement Basique
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Commencez avec le plan <span className="text-emerald">Basique</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                Parfait pour les petits restaurants qui veulent se lancer. Menu digital, commandes
                commandes en ligne et QR Code inclus.
                <strong className="text-foreground"> 30 jours d'essai gratuit.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth/inscription"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald text-white font-medium hover:bg-emerald-deep transition-colors"
                >
                  Commencer l'essai gratuit
                </Link>
                <Link
                  to="/"
                  hash="tarifs"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-emerald/30 text-emerald-deep font-medium hover:bg-emerald/10 transition-colors"
                >
                  Voir tous les tarifs
                </Link>
              </div>
            </div>

            {/* Image de nourriture */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-border shadow-card">
                <img
                  src="/bg-marché.jpg"
                  alt="Restaurant"
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prix */}
      <section className="py-16 px-4 sm:px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-emerald/25 bg-emerald-tint/60 p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Plan Basique</h2>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl sm:text-6xl font-bold">0 FCFA</span>
            </div>
            <p className="text-emerald-deep mb-8">30 jours d'essai gratuit, puis 2 500 FCFA/mois</p>

            <ul className="max-w-md mx-auto space-y-3 text-left mb-8">
              <li className="flex items-start gap-3">
                <span className="text-emerald-deep mt-0.5">✓</span>
                <span>Template basique unique</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-deep mt-0.5">✓</span>
                <span>Menu jusqu'à 10 plats</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-deep mt-0.5">✓</span>
                <span>Commandes en ligne avec suivi en direct</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-deep mt-0.5">✓</span>
                <span>QR Code restaurant</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-deep mt-0.5">✓</span>
                <span>Réservations basiques</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-deep mt-0.5">✓</span>
                <span>Statistiques essentielles</span>
              </li>
            </ul>

            <Link
              to="/auth/inscription"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-emerald text-white font-medium hover:bg-emerald-deep transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 px-4 sm:px-6 bg-surface-warm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Tout ce dont vous avez besoin pour <span className="text-emerald">démarrer</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: "Menu digital",
                desc: "Créez votre menu en ligne avec photos et prix. Vos clients consultent vos plats en un clic.",
              },
              {
                icon: MessageSquare,
                title: "Commandes en ligne",
                desc: "Chaque plat a un bouton Commander. La commande part directement en cuisine avec suivi en temps réel.",
              },
              {
                icon: QrCode,
                title: "QR Code",
                desc: "Générez votre QR Code restaurant. Les clients scannent et voient votre menu instantanément.",
              },
              {
                icon: Calendar,
                title: "Réservations",
                desc: "Recevez et gérez les réservations de vos clients directement depuis votre tableau de bord.",
              },
              {
                icon: BarChart3,
                title: "Statistiques",
                desc: "Suivez vos ventes et vos plats les plus populaires avec des statistiques simples.",
              },
              {
                icon: Lock,
                title: "Sans engagement",
                desc: "30 jours d'essai gratuit. Annulation à tout moment. Pas de carte bancaire requise.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-border bg-card shadow-card hover:border-emerald/40 transition-colors"
              >
                <feature.icon className="h-7 w-7 text-emerald-deep mb-3" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à <span className="text-emerald">démarrer</span> ?
          </h2>
          <p className="text-base text-muted-foreground mb-8">
            Créez votre compte en 5 minutes et accédez immédiatement à votre tableau de bord.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/inscription"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-emerald text-white font-medium hover:bg-emerald-deep transition-colors"
            >
              Créer mon restaurant gratuitement
            </Link>
            <a
              href="https://wa.me/22655300868"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-emerald/30 text-emerald-deep font-medium hover:bg-emerald/10 transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
