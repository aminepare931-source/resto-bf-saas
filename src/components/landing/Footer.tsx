import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Youtube, type LucideIcon } from "lucide-react";
import { DiamondPattern } from "./DiamondPattern";

const LOGO_URL = "/restobf-logo.png";
const C = { bg: "#fdf9ef", ink: "#2b130b", muted: "#6d5a50", line: "#ecdfd0", accent: "#c4420f" };

/** Renseignez vos liens ici : une icône n'apparaît que si son lien est rempli. */
const SOCIALS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Facebook", href: "", icon: Facebook },
  { label: "Instagram", href: "", icon: Instagram },
  { label: "YouTube", href: "", icon: Youtube },
  { label: "LinkedIn", href: "", icon: Linkedin },
];

const linkCls = "block text-[13px] leading-6 transition-colors hover:text-[#c4420f]";

export function Footer() {
  const socials = SOCIALS.filter((s) => s.href);
  return (
    <footer
      className="relative overflow-hidden px-5 sm:px-8 pt-8 pb-16"
      style={{ background: C.bg, color: C.ink, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-0 items-start">
          <div className="md:pr-8">
            <div className="flex items-center gap-2.5">
              <img
                src={LOGO_URL}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-contain"
              />
              <strong
                className="text-[22px] font-bold"
                style={{ fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif" }}
              >
                RestoBF
              </strong>
            </div>
            <p
              className="mt-3 text-[14px] leading-relaxed max-w-[260px]"
              style={{ color: C.muted }}
            >
              Des restaurants mieux connectés, une cuisine plus accessible.
            </p>
          </div>

          <nav
            aria-label="Plateforme"
            className="grid grid-cols-3 gap-4 md:contents text-left"
            style={{ color: C.muted }}
          >
            <div className="md:px-7 md:border-l" style={{ borderColor: C.line }}>
              <h4
                className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: C.ink }}
              >
                Plateforme
              </h4>
              <a href="#fonctionnalites" className={linkCls}>
                Fonctionnalités
              </a>
              <a href="#templates" className={linkCls}>
                Templates
              </a>
            </div>
            <div className="md:px-7 md:border-l" style={{ borderColor: C.line }}>
              <h4
                className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: C.ink }}
              >
                Espace restaurant
              </h4>
              <Link to="/auth" className={linkCls}>
                Connexion
              </Link>
              <a href="#tarifs" className={linkCls}>
                Tarifs
              </a>
            </div>
            <div className="md:px-7 md:border-l" style={{ borderColor: C.line }}>
              <h4
                className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: C.ink }}
              >
                Contact
              </h4>
              <a
                href="https://wa.me/22655300868"
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
              >
                WhatsApp
              </a>
              <a href="#faq" className={linkCls}>
                FAQ
              </a>
            </div>
          </nav>
        </div>

        <div
          className="mt-8 pt-5 border-t flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: C.line }}
        >
          <div className="text-[12px] space-y-1.5" style={{ color: C.muted }}>
            <p>© {new Date().getFullYear()} RestoBF. Tous droits réservés.</p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <Link to="/confidentialite" className="hover:text-[#c4420f]">
                Confidentialité
              </Link>
              <Link to="/conditions" className="hover:text-[#c4420f]">
                Conditions
              </Link>
              <Link to="/mentions-legales" className="hover:text-[#c4420f]">
                Mentions légales
              </Link>
            </p>
          </div>
          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full grid place-items-center text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: C.ink }}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <DiamondPattern
        className="absolute inset-x-0 bottom-0 h-9"
        opacity={0.06}
        tile={40}
        fade="linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)"
      />
    </footer>
  );
}
