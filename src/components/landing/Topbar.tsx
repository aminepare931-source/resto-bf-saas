import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const LOGO_URL = "/restobf-logo.png";

const navItems = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
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

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src={LOGO_URL}
            alt="RestoBF"
            width={40}
            height={40}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain"
          />
          <div className="flex flex-col leading-tight">
            <strong className="text-sm font-bold text-foreground">RestoBF</strong>
            <small className="text-[10px] text-muted-foreground">Pour les restaurateurs</small>
          </div>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden sm:inline-flex px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Connexion
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Créer mon restaurant
          </Link>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur-md">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={handleNavClick}
                className="px-3 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {n.label}
              </a>
            ))}
            <Link
              to="/auth/connexion"
              onClick={handleNavClick}
              className="sm:hidden px-3 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-1 border-t border-border pt-3"
            >
              Connexion
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
