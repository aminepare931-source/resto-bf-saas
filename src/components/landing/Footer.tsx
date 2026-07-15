import { Link } from "@tanstack/react-router";

const LOGO_URL = "/restobf-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid gap-8 sm:gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={LOGO_URL}
              alt="RestoBF"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain"
            />
            <strong className="text-base sm:text-lg font-bold">RestoBF</strong>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            La solution SaaS pour mettre les restaurants du Burkina Faso en ligne. Menu digital,
            commande WhatsApp, réservation.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
            Plateforme
          </h4>
          <a
            href="#fonctionnalites"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Fonctionnalités
          </a>
          <a
            href="#tarifs"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tarifs
          </a>
          <a
            href="#faq"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
            Espace restaurant
          </h4>
          <Link
            to="/auth"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Connexion
          </Link>
          <Link
            to="/auth"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Créer mon restaurant
          </Link>
          <Link
            to="/dashboard"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tableau de bord
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
            Contact
          </h4>
          <a
            href="https://wa.me/22655300868"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            WhatsApp
          </a>
          <a
            href="tel:+22655300868"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            +226 55 30 08 68
          </a>
          <a
            href="mailto:aminepare931@gmail.com"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            aminepare931@gmail.com
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 sm:mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-3 text-[10px] sm:text-xs text-muted-foreground">
        <p>© 2026 Resto BF · Ouagadougou · Tous droits réservés</p>
        <p>Fait avec ❤️ au Burkina Faso 🇧🇫</p>
      </div>
    </footer>
  );
}
