import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Eye, MessageCircle, Monitor, Sun, type LucideIcon } from "lucide-react";

/**
 * Section « Choisissez votre univers » — reproduction de la maquette.
 * Les visuels viennent de /public/landing. Pour des aperçus plus nets, remplacez
 * `thumb` / `preview` par vos captures (même nom de fichier, format .webp).
 */

const C = {
  bg: "#fdf9ef",
  card: "#fffdf9",
  line: "#f0e4d6",
  ink: "#2b130b",
  muted: "#6d5a50",
  accent: "#c4420f",
  accentDark: "#a8360b",
  tint: "#fdebdd",
};

type Feature = { icon: LucideIcon; title: string; text: string };

type Tpl = {
  id: string; // identifiant réel du template (utilisé pour l'inscription et la démo)
  name: string;
  tagline: string;
  description: string;
  thumb: string;
  /** Aperçu large. Absent = la miniature est placée dans un cadre de navigateur. */
  preview?: string;
  frame: string;
  features: Feature[];
  /** ordre dans la rangée (bureau / mobile) */
  order: { desktop: number; mobile: number };
};

const wa: Feature = {
  icon: MessageCircle,
  title: "Bouton WhatsApp intégré",
  text: "Vos clients vous contactent en un clic",
};
const resp: Feature = {
  icon: Monitor,
  title: "100% responsive",
  text: "Parfait sur tous les appareils",
};

const TEMPLATES: Tpl[] = [
  {
    id: "std-moderne",
    name: "Gastronomie",
    tagline: "Élégant & minimaliste",
    description:
      "Un design épuré qui laisse parler vos assiettes. Parfait pour les tables gastronomiques, traiteurs et restaurants modernes.",
    thumb: "/landing/thumb-gastronomie.webp",
    frame: "#e9dccb",
    features: [
      { icon: Sun, title: "Style épuré", text: "Met vos plats au premier plan" },
      wa,
      resp,
    ],
    order: { desktop: 1, mobile: 3 },
  },
  {
    id: "std-soleil",
    name: "Soleil & Terrasse",
    tagline: "Chaleureux & convivial",
    description:
      "Un design chaleureux qui met en valeur vos plats et votre ambiance. Parfait pour les restaurants familiaux, buffets et terrasses.",
    thumb: "/landing/thumb-soleil.webp",
    preview: "/landing/preview-soleil.webp",
    frame: "#4a2012",
    features: [
      { icon: Sun, title: "Style chaleureux", text: "Évoque la convivialité et l'authenticité" },
      wa,
      resp,
    ],
    order: { desktop: 2, mobile: 1 },
  },
  {
    id: "std-nuit",
    name: "Night Lounge",
    tagline: "Moderne & sophistiqué",
    description:
      "Une ambiance sombre et dorée pour les bars, maquis VIP et lounges. Vos cocktails et vos soirées sous leur plus beau jour.",
    thumb: "/landing/thumb-nuit.webp",
    frame: "#1d1030",
    features: [
      { icon: Sun, title: "Ambiance nocturne", text: "Fond sombre et touches dorées" },
      wa,
      resp,
    ],
    order: { desktop: 3, mobile: 2 },
  },
  {
    id: "std-savane",
    name: "Savane & Authenticité",
    tagline: "Terre & tradition",
    description:
      "Inspiré des paysages burkinabè et de la cuisine du terroir. Idéal pour les restaurants de cuisine traditionnelle.",
    thumb: "/bg-savane.jpg",
    frame: "#5a3b1a",
    features: [
      { icon: Sun, title: "Esprit terroir", text: "Couleurs de terre et de savane" },
      wa,
      resp,
    ],
    order: { desktop: 4, mobile: 4 },
  },
  {
    id: "std-marche",
    name: "Marché Gourmand",
    tagline: "Vivant & gourmand",
    description:
      "Un design vivace pour les fast-foods, grillades, shawarmas et livraisons express. Commandes rapides et WhatsApp en avant.",
    thumb: "/bg-marché.jpg",
    frame: "#7a2a14",
    features: [{ icon: Sun, title: "Design vivace", text: "Fait pour vendre vite" }, wa, resp],
    order: { desktop: 5, mobile: 5 },
  },
];

const serif = { fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif" } as const;
const sans = { fontFamily: "'Plus Jakarta Sans', 'Inter Variable', sans-serif" } as const;

function Diamond() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        transform="rotate(45 12 12)"
        fill="none"
        stroke={C.accent}
        strokeWidth="2.4"
      />
      <circle cx="12" cy="12" r="2.4" fill={C.accent} />
    </svg>
  );
}

function Preview({ tpl }: { tpl: Tpl }) {
  if (tpl.preview) {
    // L'image contient déjà le cadre incliné : le fond crème disparaît par multiplication
    return (
      <img
        src={tpl.preview}
        alt={`Aperçu du template ${tpl.name}`}
        className="w-full h-auto select-none"
        style={{ mixBlendMode: "multiply" }}
        draggable={false}
      />
    );
  }
  return (
    <div
      className="mx-auto w-[92%] rounded-[22px] p-[10px] pt-7 relative"
      style={{
        background: tpl.frame,
        transform: "rotate(-4deg) perspective(1400px) rotateY(-6deg)",
        boxShadow: "0 40px 60px -25px rgba(60,25,10,.45), 0 12px 24px -12px rgba(60,25,10,.35)",
      }}
    >
      <span className="absolute top-2.5 left-4 flex gap-1.5">
        <i className="w-2 h-2 rounded-full bg-[#ff6b5e]" />
        <i className="w-2 h-2 rounded-full bg-[#ffc23e]" />
        <i className="w-2 h-2 rounded-full bg-[#4ccd5d]" />
      </span>
      <div className="rounded-[12px] overflow-hidden aspect-[4/3] bg-white">
        <img
          src={tpl.thumb}
          alt={`Aperçu du template ${tpl.name}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
}

export function TemplatesShowcase() {
  const [selectedId, setSelectedId] = React.useState("std-soleil");
  const selected = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[1];
  const activeIndex = [...TEMPLATES]
    .sort((a, b) => a.order.mobile - b.order.mobile)
    .findIndex((t) => t.id === selectedId);

  return (
    <section
      id="templates"
      className="relative overflow-hidden"
      style={{ background: C.bg, color: C.ink, ...sans }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      />

      {/* Décors */}
      <img
        src="/landing/pattern-bl.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 bottom-0 w-[120px] sm:w-[200px] lg:w-[240px] opacity-90"
        style={{ mixBlendMode: "multiply" }}
      />
      <img
        src="/landing/palm-br.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-0 w-[70px] sm:w-[100px] lg:w-[120px] top-[150px] -scale-y-100 lg:top-auto lg:bottom-0 lg:scale-y-100"
        style={{ mixBlendMode: "multiply" }}
      />

      <div className="relative max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 pb-24 lg:pt-16 lg:pb-28">
        <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)_290px] gap-x-6 gap-y-8 items-start">
          {/* ---------- Colonne gauche ---------- */}
          <div className="lg:col-start-1 lg:row-start-1 min-w-0 order-1">
            <p
              className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.16em]"
              style={{ color: C.accent }}
            >
              <Diamond />
              Choisissez votre univers
            </p>
            <h2
              className="mt-4 font-bold leading-[1.05] tracking-tight text-[2.7rem] sm:text-6xl lg:text-[3.6rem] xl:text-[4.1rem]"
              style={serif}
            >
              Un site qui donne faim<span style={{ color: C.accent }}>.</span>
            </h2>
            <p
              className="mt-5 text-[16px] sm:text-[17px] leading-relaxed max-w-md"
              style={{ color: C.muted }}
            >
              Des modèles pensés pour les restaurants africains, modernes et prêts à attirer plus de
              clients.
            </p>
          </div>

          {/* ---------- Aperçu (centre) ---------- */}
          <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:-mt-2 min-w-0 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 18, rotate: -1.5, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Preview tpl={selected} />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ---------- Cartes (gauche, sous le titre) ---------- */}
          <div className="order-3 lg:col-start-1 lg:row-start-2 min-w-0 -mx-5 sm:-mx-8 lg:mx-0">
            <div
              role="radiogroup"
              aria-label="Choisir un template"
              className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory px-5 sm:px-8 lg:px-1 pt-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TEMPLATES.map((t) => {
                const on = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSelectedId(t.id)}
                    className={`snap-start shrink-0 text-left rounded-[18px] p-2.5 transition-all duration-300 w-[44%] sm:w-[31%] lg:w-[186px] ${
                      on ? "lg:scale-[1.05] lg:-translate-y-1" : "hover:-translate-y-0.5"
                    }`}
                    style={{
                      background: C.card,
                      border: `${on ? 2 : 1}px solid ${on ? C.accent : C.line}`,
                      boxShadow: on
                        ? "0 14px 30px -12px rgba(196,66,15,.35)"
                        : "0 2px 8px -4px rgba(80,40,20,.12)",
                      order: t.order.mobile,
                    }}
                  >
                    <span
                      className="relative block rounded-xl overflow-hidden aspect-[1.3]"
                      style={{ background: "#efe3d3" }}
                    >
                      <img
                        src={t.thumb}
                        alt=""
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      {on && (
                        <span
                          className="lg:hidden absolute top-1.5 right-1.5 w-7 h-7 rounded-full grid place-items-center text-white"
                          style={{ background: C.accent }}
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </span>
                      )}
                    </span>
                    <span className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold leading-tight truncate">
                          {t.name}
                        </span>
                        <span
                          className="block text-[13px] mt-0.5 leading-snug"
                          style={{ color: C.muted }}
                        >
                          {t.tagline}
                        </span>
                      </span>
                      <span
                        className="hidden lg:grid shrink-0 place-items-center w-[22px] h-[22px] rounded-full mt-0.5"
                        style={{
                          border: `1.5px solid ${on ? C.accent : "#cdbfb2"}`,
                          background: on ? C.accent : "transparent",
                          color: "#fff",
                        }}
                      >
                        {on && <Check className="w-3.5 h-3.5" strokeWidth={3.2} />}
                      </span>
                      <span
                        className="lg:hidden shrink-0 w-[22px] h-[22px] rounded-full mt-0.5"
                        style={{
                          border: `1.5px solid ${on ? C.accent : "#cdbfb2"}`,
                          opacity: on ? 0 : 1,
                        }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Points (mobile) */}
            <div className="lg:hidden flex justify-center gap-2 mt-1">
              {[...TEMPLATES]
                .sort((a, b) => a.order.mobile - b.order.mobile)
                .map((t, i) => (
                  <button
                    key={t.id}
                    aria-label={`Voir ${t.name}`}
                    onClick={() => setSelectedId(t.id)}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: i === activeIndex ? 26 : 8,
                      background: i === activeIndex ? C.accent : "#e3d2c2",
                    }}
                  />
                ))}
            </div>
          </div>

          {/* ---------- Détails du modèle sélectionné ---------- */}
          <aside
            className="order-4 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:mt-3 min-w-0 grid grid-cols-[1.15fr_1fr] gap-x-5 gap-y-5 rounded-[22px] p-5 border bg-white/80 lg:bg-transparent lg:border-0 lg:p-0 lg:flex lg:flex-col lg:gap-0"
            style={{ borderColor: C.line }}
          >
            <div className="lg:order-1">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
                style={{ color: C.accent, background: "#fff", border: `1px solid ${C.line}` }}
              >
                <i className="w-2.5 h-2.5 rounded-full" style={{ background: C.accent }} />
                Modèle sélectionné
              </span>
              <h3
                className="mt-4 text-[1.6rem] sm:text-[2rem] font-bold leading-tight"
                style={serif}
              >
                {selected.name}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: C.muted }}>
                {selected.description}
              </p>
            </div>

            <ul
              className="space-y-4 row-span-2 col-start-2 row-start-1 lg:order-2 lg:mt-5 lg:pt-5 lg:border-t"
              style={{ borderColor: C.line }}
            >
              {selected.features.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-9 h-9 rounded-full grid place-items-center"
                    style={{ background: C.tint, color: C.accent }}
                  >
                    <f.icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold leading-tight">{f.title}</span>
                    <span
                      className="block text-[12.5px] mt-0.5 leading-snug"
                      style={{ color: C.muted }}
                    >
                      {f.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 lg:order-3 lg:mt-7 self-end lg:self-auto">
              <Link
                to="/auth/inscription"
                search={{ plan: "trial", template: selected.id }}
                className="inline-flex items-center justify-center gap-2.5 rounded-full h-[52px] text-[15px] font-semibold text-white transition-colors"
                style={{ background: C.accent, boxShadow: "0 12px 24px -10px rgba(196,66,15,.6)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.accentDark)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.accent)}
              >
                Choisir ce modèle
                <ArrowRight className="w-[18px] h-[18px]" />
              </Link>
              <a
                href={`/demo?tpl=${selected.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full h-[52px] text-[15px] font-semibold transition-colors hover:bg-white"
                style={{ border: "1.5px solid #e4d6c8", color: C.ink }}
              >
                <Eye className="w-[18px] h-[18px]" />
                Voir la démo
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
