import { Link } from "@tanstack/react-router";


const LOGO_URL = "/restobf-logo.png";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#070710] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={LOGO_URL} alt="RestoBF" width={48} height={48} className="w-12 h-12 rounded-xl bg-white object-contain p-1 shadow-gold" />
            <strong className="text-lg font-bold">RestoBF</strong>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            La solution SaaS pour mettre les restaurants du Burkina Faso en ligne.
            Menu digital, commande WhatsApp, réservation.
          </p>
        </div>

        <FooterCol
          title="Plateforme"
          links={[
            { href: "#fonctionnalites", label: "Fonctionnalités" },
            { href: "#tarifs", label: "Tarifs" },
            { href: "#demo", label: "Démo" },
            { href: "#faq", label: "FAQ" },
          ]}
        />

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-2">
            Espace restaurant
          </h4>
          <Link to="/auth/connexion" className="text-sm text-muted-foreground hover:text-gold transition-colors">
            Connexion
          </Link>
          <Link to="/auth/inscription" className="text-sm text-muted-foreground hover:text-gold transition-colors">
            Créer mon restaurant
          </Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-gold transition-colors">
            Tableau de bord
          </Link>
        </div>

        <FooterCol
          title="Contact"
          links={[
            { href: "https://wa.me/22655300868", label: "WhatsApp" },
            { href: "tel:+22655300868", label: "+226 55 30 08 68" },
            { href: "mailto:aminepare931@gmail.com", label: "aminepare931@gmail.com" },
            { href: "#", label: "Ouagadougou, Burkina Faso" },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
        <p>© 2026 Resto BF · Ouagadougou · Tous droits réservés</p>
        <p>Fait avec ❤️ au Burkina Faso 🇧🇫</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-2">{title}</h4>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          className="text-sm text-muted-foreground hover:text-gold transition-colors"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
