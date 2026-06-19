import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center font-black text-[#0a0a0f] text-xl shadow-gold group-hover:scale-105 transition-transform">
            R
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <strong className="text-base font-bold text-foreground">Resto BF</strong>
            <small className="text-xs text-muted-foreground">Site web pour restaurants</small>
          </div>
        </Link>

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
            className="inline-flex items-center px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-gold text-[#0a0a0f] hover:shadow-gold hover:-translate-y-0.5 transition-all"
          >
            Créer mon restaurant
          </Link>
        </div>
      </div>
    </header>
  );
}
