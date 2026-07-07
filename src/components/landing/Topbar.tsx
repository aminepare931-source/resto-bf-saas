import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const LOGO_URL = "/restobf-logo.png";

const navItems = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#demo", label: "Démo" },
  { href: "#avis", label: "Avis" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Topbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu au clic sur un lien
  const handleNavClick = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/5 py-3"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img
            src={LOGO_URL}
            alt="RestoBF"
            width={44}
            height={44}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain group-hover:scale-105 transition-transform"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <strong className="text-base font-bold text-foreground">RestoBF</strong>
            <small className="text-xs text-muted-foreground">Site web pour restaurants</small>
          </div>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-muted-foreground hover:text-gold transition-colors font-medium"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/auth/connexion"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-gold transition-colors"
          >
            Connexion
          </Link>
          <Link
            to="/auth/inscription"
            className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-gradient-gold text-[#0a0a0f] hover:shadow-gold hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            Créer mon restaurant
          </Link>

          {/* Bouton hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            <span className={`block w-6 h-0.5 bg-foreground transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-foreground transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={handleNavClick}
                className="px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-gold hover:bg-white/5 transition-colors font-medium"
              >
                {n.label}
              </a>
            ))}
            <Link
              to="/auth/connexion"
              onClick={handleNavClick}
              className="sm:hidden px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-gold hover:bg-white/5 transition-colors font-medium"
            >
              Connexion
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}