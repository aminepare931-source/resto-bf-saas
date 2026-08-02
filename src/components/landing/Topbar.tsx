import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Interactive3DButton } from "./Interactive3DButton";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sparkles,
  Zap,
  Tag,
  Star,
  HelpCircle,
  PhoneCall,
  Layout,
  LogIn,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

const LOGO_URL = "/restobf-logo.png";

const navItems = [
  { href: "#fonctionnalites", label: "Fonctionnalités", icon: Zap },
  { href: "#templates", label: "Templates", icon: Layout },
  { href: "#tarifs", label: "Tarifs", icon: Tag },
  { href: "#avis", label: "Avis", icon: Star },
  { href: "#faq", label: "FAQ", icon: HelpCircle },
  { href: "#contact", label: "Contact", icon: PhoneCall },
];

export function Topbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? isMobile
            ? "bg-[#0a0a0f] border-b border-[#d4a853]/30 py-2.5"
            : "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#d4a853]/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-2.5"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* LOGO WITH GOLD GLOW */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative">
            <motion.div className="absolute -inset-1 rounded-xl bg-[#d4a853]/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src={LOGO_URL}
              alt="RestoBF"
              width={42}
              height={42}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain border border-[#d4a853]/40 bg-[#111118]"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <strong className="text-base font-black tracking-tight text-foreground group-hover:text-[#f0d48a] transition-colors">
              RestoBF
            </strong>
            <small className="text-[10px] text-muted-foreground font-medium">
              Pour les restaurateurs
            </small>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION GLASS CAPSULE */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#111118]/90 backdrop-blur-2xl p-1.5 rounded-full border border-[#d4a853]/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          {navItems.map((n, idx) => {
            const Icon = n.icon;
            const isHovered = hoveredIndex === idx;

            return (
              <a
                key={n.href}
                href={n.href}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative px-4 py-2 text-xs font-bold rounded-full text-foreground/90 hover:text-white transition-all flex items-center gap-2 cursor-pointer select-none nav-item-btn"
              >
                {/* Motion Hover Glow Pill Background */}
                {isHovered && (
                  <motion.div
                    layoutId="topbarHoverPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#d4a853]/30 via-[#f0d48a]/35 to-[#b08800]/30 border border-[#f0d48a]/60 shadow-[0_0_20px_rgba(212,168,83,0.5)]"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}

                <Icon
                  className={`w-3.5 h-3.5 relative z-10 transition-all duration-300 ${
                    isHovered ? "text-[#f0d48a] scale-125 -translate-y-0.5" : "text-[#d4a853]"
                  }`}
                />
                <span className="relative z-10 underline-grow">{n.label}</span>
              </a>
            );
          })}
        </nav>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-2.5">
          {/* Connexion Button */}
          <Link
            to="/auth"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-foreground hover:text-[#f0d48a] bg-[#111118]/80 hover:bg-[#1a1a24] border border-border hover:border-[#d4a853]/50 transition-all shadow-sm active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 text-[#d4a853]" />
            <span>Connexion</span>
          </Link>

          {/* Interactive 3D CTA Button */}
          <Interactive3DButton
            to="/auth"
            variant="primary"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            className="shadow-[0_0_20px_rgba(212,168,83,0.4)]"
          >
            Créer mon restaurant
          </Interactive3DButton>

          {/* Hamburger Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#111118] border border-[#d4a853]/30 text-foreground hover:text-[#f0d48a] active:scale-90 transition-all cursor-pointer"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-[#f0d48a]" />
            ) : (
              <Menu className="w-5 h-5 text-[#d4a853]" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-b border-[#d4a853]/30 bg-[#0a0a0f] sm:bg-[#0a0a0f]/98 sm:backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            <nav className="flex flex-col px-4 py-4 gap-2 max-w-xl mx-auto">
              {navItems.map((n) => {
                const Icon = n.icon;
                return (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={handleNavClick}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-foreground hover:text-[#f0d48a] bg-[#111118]/80 border border-border/60 hover:border-[#d4a853]/50 transition-all active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#d4a853]/15 border border-[#d4a853]/30 flex items-center justify-center text-[#f0d48a] group-hover:scale-110 group-hover:bg-[#d4a853]/30 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="underline-grow">{n.label}</span>
                  </a>
                );
              })}

              <div className="pt-2 flex flex-col gap-2 mt-2 border-t border-border">
                <Link
                  to="/auth"
                  onClick={handleNavClick}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-foreground bg-[#1a1a24] border border-border hover:border-[#d4a853]/40"
                >
                  <LogIn className="w-4 h-4 text-[#d4a853]" /> Connexion
                </Link>

                <Interactive3DButton
                  to="/auth"
                  onClick={handleNavClick}
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="w-full"
                >
                  Créer mon restaurant gratuitement
                </Interactive3DButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
