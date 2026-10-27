import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  Phone,
  Star,
  X,
} from "lucide-react";
import type {
  PublicGalleryImage,
  PublicMenuItem,
  PublicReview,
  TemplateProps,
  Theme,
} from "../shared";
import {
  AdvancedReservationForm,
  DishModal,
  ReviewForm,
  avgRating,
  buildWhatsAppLink,
  fmtPrice,
  groupByCategory,
} from "../shared";
import { StorageImage } from "@/components/StorageImage";
import { StorageVideo } from "@/components/StorageVideo";
import { DiamondPattern } from "@/components/landing/DiamondPattern";
import { signedUrl } from "@/lib/storage";
import { usePlanAccess } from "@/lib/plans";

/**
 * Premium « Royal » — luxe éditorial avec vrai motion design.
 * Une seule page longue : hero cinématique (vidéo si le restaurant en a une), texte qui se révèle,
 * parallaxe, texte lié au défilement, signatures, carte interactive, galerie, avis, réservation.
 * Les animations sont limitées aux propriétés légères (transform / opacity) et respectent
 * « réduire les animations » ainsi que l'économiseur de données.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

type Pal = {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  gold: string;
  wine: string;
  ink: string;
  line: string;
};

const BASE: Pal = {
  bg: "#09070b",
  surface: "#120d0c",
  surface2: "#1b1411",
  text: "#fff3d3",
  muted: "rgba(255,243,211,0.68)",
  gold: "#f4c15d",
  wine: "#7b1030",
  ink: "#160c05",
  line: "rgba(244,193,93,0.22)",
};

const VIEW_TO_ID: Record<string, string> = {
  accueil: "home",
  experience: "histoire",
  menu: "menu",
  galerie: "galerie",
  avis: "avis",
  reservation: "reservation",
  about: "contact",
  reserve: "reservation",
  reviews: "avis",
};

/* ------------------------------------------------------------------ */
/*  Briques d'animation                                                */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  y = 34,
  className,
  reduced,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  reduced: boolean;
}) {
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Mots qui montent un à un depuis un masque. `inView` = au défilement, sinon au chargement. */
function SplitWords({
  text,
  className,
  style,
  delay = 0,
  inView = false,
  reduced,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  inView?: boolean;
  reduced: boolean;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  // On observe le conteneur (jamais masqué) : un mot déjà translaté hors de son masque
  // ne serait jamais détecté comme visible.
  const seen = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const show = reduced || !inView || seen;
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span ref={ref} className={className} style={style} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em] mr-[0.26em]"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={reduced ? false : { y: "115%" }}
            animate={{ y: show ? "0%" : "115%" }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * 0.07 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function ScrollWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = Math.min(1, start + 1.6 / total);
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em]">
      {word}
    </motion.span>
  );
}

/** Paragraphe dont les mots s'allument au fil du défilement. */
function ScrollText({
  text,
  className,
  style,
  reduced,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  reduced: boolean;
}) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(/\s+/).filter(Boolean);
  if (reduced) {
    return (
      <p className={className} style={style}>
        {text}
      </p>
    );
  }
  return (
    <p ref={ref} className={className} style={style}>
      {words.map((w, i) => (
        <ScrollWord
          key={`${w}-${i}`}
          word={w}
          index={i}
          total={words.length}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
}

function Counter({
  to,
  decimals = 0,
  suffix = "",
  reduced,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  reduced: boolean;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = React.useState(reduced ? to : 0);
  React.useEffect(() => {
    if (!inView || reduced) return;
    const c = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: (v) => setVal(v) });
    return () => c.stop();
  }, [inView, to, reduced]);
  return (
    <span ref={ref}>
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Bouton qui suit légèrement le curseur (ordinateur uniquement). */
function Magnetic({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  if (reduced) return <div className="inline-block">{children}</div>;
  return (
    <motion.div
      className="inline-block"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function useSigned(path: string | null | undefined) {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let off = false;
    if (!path) {
      setUrl(null);
      return;
    }
    signedUrl(path).then((u) => !off && setUrl(u));
    return () => {
      off = true;
    };
  }, [path]);
  return url;
}

/* ------------------------------------------------------------------ */
/*  Template                                                           */
/* ------------------------------------------------------------------ */

export function TplPremRoyal(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery } = props;
  const videos = props.videos ?? [];
  const reduced = !!useReducedMotion();
  const { hasAny } = usePlanAccess(restaurant.plan);
  const canReserve = hasAny(["reservations-basiques", "reservations-avancees"]);
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const showReviews = props.reviewsEnabled !== false;

  // Couleur / police choisies par le restaurant (si son forfait l'autorise)
  const brand =
    restaurant.primary_color && HEX.test(restaurant.primary_color)
      ? restaurant.primary_color
      : null;
  const P: Pal = brand ? { ...BASE, gold: brand, line: `${brand}38` } : BASE;
  const serifFont = restaurant.font_family?.trim()
    ? `'${restaurant.font_family.trim()}', 'Cormorant Garamond', serif`
    : "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
  const serif: React.CSSProperties = { fontFamily: serifFont };

  const theme: Theme = {
    bg: P.bg,
    surface: P.surface,
    surfaceAlt: P.surface2,
    text: P.text,
    textMuted: P.muted,
    accent: P.gold,
    accentInk: P.ink,
    border: P.line,
    radius: "10px",
  };

  const available = React.useMemo(() => menu.filter((m) => m.available), [menu]);
  const signatures = React.useMemo(
    () =>
      [...available.filter((m) => m.image_url), ...available.filter((m) => !m.image_url)].slice(
        0,
        6,
      ),
    [available],
  );
  const rating = avgRating(reviews);
  const cover = gallery[0]?.image_url ?? available.find((m) => m.image_url)?.image_url ?? null;
  const heroVideo = videos[0] ?? null;

  const [openDish, setOpenDish] = React.useState<PublicMenuItem | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [saveData, setSaveData] = React.useState(false);

  React.useEffect(() => {
    const c = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    setSaveData(!!c?.saveData);
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ancien paramètre ?view= → on fait défiler jusqu'à la section correspondante
  React.useEffect(() => {
    const id = props.view ? VIEW_TO_ID[props.view] : null;
    if (!id || id === "home") return;
    const t = setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      400,
    );
    return () => clearTimeout(t);
  }, [props.view]);

  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const nav: { id: string; label: string; show: boolean }[] = [
    { id: "histoire", label: "L'esprit", show: true },
    { id: "signatures", label: "Signatures", show: signatures.length > 0 },
    { id: "menu", label: "La carte", show: available.length > 0 },
    { id: "galerie", label: "Galerie", show: gallery.length > 0 || videos.length > 0 },
    { id: "avis", label: "Avis", show: showReviews && reviews.length > 0 },
  ].filter((n) => n.show);

  const go = (id: string) => {
    setMenuOpen(false);
    setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      menuOpen ? 250 : 0,
    );
  };

  const hours = restaurant.hours?.trim() || null;
  const aboutText =
    restaurant.about_text?.trim() ||
    restaurant.description?.trim() ||
    `${restaurant.name} vous accueille à ${restaurant.city}${
      restaurant.cuisine ? ` pour une cuisine ${restaurant.cuisine}` : ""
    }. Chaque assiette est pensée pour faire de votre passage un moment à part.`;
  const socials = (
    [
      ["Facebook", restaurant.social_links?.facebook],
      ["Instagram", restaurant.social_links?.instagram],
      ["TikTok", restaurant.social_links?.tiktok],
    ] as [string, string | undefined][]
  ).filter(([, u]) => !!u && /^https?:\/\//.test(u as string)) as [string, string][];

  return (
    <div
      className="relative min-h-screen overflow-x-clip"
      style={{ background: P.bg, color: P.text, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@300;400;500;600;700&display=swap"
      />
      {restaurant.font_family?.trim() && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(restaurant.font_family.trim()).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`}
        />
      )}
      <style>{`
        @keyframes royal-marquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
        @keyframes royal-kenburns{from{transform:scale(1.04)}to{transform:scale(1.16) translate3d(-1.5%,-1%,0)}}
        @keyframes royal-pulse{0%{box-shadow:0 0 0 0 rgba(37,211,102,.55)}70%{box-shadow:0 0 0 18px rgba(37,211,102,0)}100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}}
        @keyframes royal-scroll{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
        .royal-snap{scrollbar-width:none}.royal-snap::-webkit-scrollbar{display:none}
        .royal-outline{-webkit-text-stroke:1px ${P.gold}66;color:transparent}
        @media (prefers-reduced-motion: reduce){.royal-anim{animation:none!important}}
      `}</style>

      {/* Barre de progression */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[70]"
        style={{ scaleX: progress, background: `linear-gradient(90deg, ${P.wine}, ${P.gold})` }}
      />

      {/* ============ EN-TÊTE ============ */}
      <header
        className="fixed top-0 inset-x-0 z-[60] transition-all duration-500"
        style={{
          background: scrolled ? "rgba(9,7,11,0.82)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: `1px solid ${scrolled ? P.line : "transparent"}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto h-[68px] sm:h-[78px] px-5 sm:px-10 flex items-center justify-between gap-4">
          <button onClick={() => go("home")} className="flex items-center gap-3 min-w-0 text-left">
            {restaurant.logo_url && (
              <span
                className="w-9 h-9 rounded-full overflow-hidden shrink-0 border"
                style={{ borderColor: P.line }}
              >
                <StorageImage
                  path={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </span>
            )}
            <span
              className="truncate text-[22px] sm:text-[26px] font-semibold tracking-wide"
              style={serif}
            >
              {restaurant.name}
            </span>
          </button>

          <nav
            className="hidden lg:flex items-center gap-9 text-[12px] uppercase tracking-[0.22em]"
            style={{ color: P.muted }}
          >
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="relative group py-2 hover:text-white transition-colors"
              >
                {n.label}
                <span
                  className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                  style={{ background: P.gold }}
                />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {canReserve && (
              <button
                onClick={() => go("reservation")}
                className="rounded-full px-4 sm:px-6 h-10 sm:h-11 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] transition-transform active:scale-95"
                style={{ background: P.gold, color: P.ink }}
              >
                Réserver
              </button>
            )}
            <button
              aria-label="Ouvrir le menu"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-full grid place-items-center border"
              style={{ borderColor: P.line, background: "rgba(255,255,255,0.04)" }}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Menu plein écran (mobile) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col px-6 py-5"
            style={{ background: P.bg }}
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="flex items-center justify-between h-[52px]">
              <span className="text-[22px] font-semibold" style={serif}>
                {restaurant.name}
              </span>
              <button
                aria-label="Fermer"
                onClick={() => setMenuOpen(false)}
                className="w-11 h-11 rounded-full grid place-items-center border"
                style={{ borderColor: P.line }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1">
              {[
                ...nav,
                ...(canReserve ? [{ id: "reservation", label: "Réserver", show: true }] : []),
                { id: "contact", label: "Contact", show: true },
              ].map((n, i) => (
                <motion.button
                  key={n.id}
                  onClick={() => go(n.id)}
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: EASE }}
                  className="text-left py-2.5 text-[44px] leading-none font-medium"
                  style={serif}
                >
                  <span
                    className="text-[13px] align-top mr-3 tracking-widest"
                    style={{ color: P.gold, fontFamily: "Inter" }}
                  >
                    0{i + 1}
                  </span>
                  {n.label}
                </motion.button>
              ))}
            </div>
            <div className="text-[13px] flex flex-col gap-1" style={{ color: P.muted }}>
              {restaurant.address && (
                <span>
                  {restaurant.address}, {restaurant.city}
                </span>
              )}
              <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Hero
        P={P}
        serif={serif}
        reduced={reduced}
        restaurant={restaurant}
        cover={cover}
        videoPath={heroVideo?.image_url ?? null}
        allowVideo={!reduced && !saveData}
        canReserve={canReserve}
        go={go}
        hoursShort={hours ? hours.split("\n")[0] : null}
      />

      {/* Bandeau défilant */}
      <Marquee
        P={P}
        serif={serif}
        reduced={reduced}
        items={[
          restaurant.cuisine ?? "Cuisine d'auteur",
          restaurant.city,
          "Sur place · À emporter",
          restaurant.name,
        ]}
      />

      {/* ============ L'ESPRIT DU LIEU ============ */}
      <section
        id="histoire"
        className="relative px-5 sm:px-10 py-24 sm:py-36 max-w-[1400px] mx-auto"
      >
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-14 lg:gap-24 items-start">
          <div>
            <Reveal reduced={reduced}>
              <p className="text-[12px] uppercase tracking-[0.3em] mb-8" style={{ color: P.gold }}>
                — L'esprit du lieu
              </p>
            </Reveal>
            <ScrollText
              text={aboutText}
              reduced={reduced}
              className="text-[30px] sm:text-[44px] lg:text-[54px] leading-[1.12] font-medium"
              style={serif}
            />
            <div className="mt-14 grid grid-cols-3 gap-4 max-w-xl">
              {[
                {
                  v: available.length,
                  l: available.length > 1 ? "Plats à la carte" : "Plat à la carte",
                  d: 0,
                },
                { v: rating ? Number(rating.toFixed(1)) : null, l: "Note moyenne", d: 1 },
                { v: reviews.length, l: reviews.length > 1 ? "Avis clients" : "Avis client", d: 0 },
              ]
                .filter((s) => s.v !== null && s.v !== 0)
                .map((s, i) => (
                  <Reveal key={s.l} reduced={reduced} delay={i * 0.12} y={20}>
                    <div className="border-t pt-4" style={{ borderColor: P.line }}>
                      <div
                        className="text-[42px] sm:text-[56px] leading-none font-medium"
                        style={{ ...serif, color: P.gold }}
                      >
                        <Counter to={s.v as number} decimals={s.d} reduced={reduced} />
                      </div>
                      <div
                        className="mt-2 text-[11px] uppercase tracking-[0.18em]"
                        style={{ color: P.muted }}
                      >
                        {s.l}
                      </div>
                    </div>
                  </Reveal>
                ))}
            </div>
          </div>
          <ParallaxImage
            reduced={reduced}
            path={
              gallery[1]?.image_url ??
              gallery[0]?.image_url ??
              signatures[1]?.image_url ??
              signatures[0]?.image_url ??
              null
            }
            alt={restaurant.name}
            P={P}
          />
        </div>
      </section>

      {/* ============ SIGNATURES ============ */}
      {signatures.length > 0 && (
        <section
          id="signatures"
          className="relative py-20 sm:py-32"
          style={{ background: P.surface }}
        >
          <div className="max-w-[1400px] mx-auto px-5 sm:px-10 mb-12 flex items-end justify-between gap-6">
            <div>
              <Reveal reduced={reduced}>
                <p
                  className="text-[12px] uppercase tracking-[0.3em] mb-5"
                  style={{ color: P.gold }}
                >
                  — À ne pas manquer
                </p>
              </Reveal>
              <h2 className="text-[44px] sm:text-[72px] leading-[0.95] font-medium" style={serif}>
                <SplitWords text="Nos signatures" inView reduced={reduced} />
              </h2>
            </div>
            <p
              className="hidden sm:block text-[12px] uppercase tracking-[0.2em]"
              style={{ color: P.muted }}
            >
              Faites glisser →
            </p>
          </div>
          <div className="royal-snap flex gap-5 sm:gap-7 overflow-x-auto snap-x snap-mandatory px-5 sm:px-10 pb-4">
            {signatures.map((d, i) => (
              <motion.button
                key={d.id}
                onClick={() => setOpenDish(d)}
                initial={reduced ? false : { opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, ease: EASE, delay: Math.min(i, 3) * 0.08 }}
                className={`group relative snap-start shrink-0 w-[78vw] sm:w-[360px] aspect-[3/4] overflow-hidden text-left ${
                  i % 2 ? "sm:mt-14" : ""
                }`}
                style={{ background: P.surface2, borderRadius: 6, border: `1px solid ${P.line}` }}
              >
                {d.image_url ? (
                  <StorageImage
                    path={d.image_url}
                    alt={d.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: `radial-gradient(circle at 30% 20%, ${P.wine}, ${P.bg})` }}
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(9,7,11,.95) 5%, rgba(9,7,11,.15) 55%, transparent)",
                  }}
                />
                <span
                  className="royal-outline absolute top-3 right-4 text-[84px] leading-none font-semibold"
                  style={serif}
                >
                  0{i + 1}
                </span>
                <span className="absolute inset-x-0 bottom-0 p-6">
                  <span className="block text-[30px] leading-tight font-medium" style={serif}>
                    {d.name}
                  </span>
                  {d.description && (
                    <span
                      className="block mt-1 text-[13px] leading-5 line-clamp-2"
                      style={{ color: P.muted }}
                    >
                      {d.description}
                    </span>
                  )}
                  <span className="mt-4 flex items-center justify-between">
                    <span className="text-[22px] font-medium" style={{ ...serif, color: P.gold }}>
                      {fmtPrice(d.price)}
                    </span>
                    <span
                      className="w-11 h-11 rounded-full grid place-items-center border transition-all duration-500 group-hover:rotate-45"
                      style={{ borderColor: P.gold, color: P.gold }}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* ============ LA CARTE ============ */}
      {available.length > 0 && (
        <MenuSection P={P} serif={serif} reduced={reduced} items={available} onOpen={setOpenDish} />
      )}

      {/* ============ GALERIE ============ */}
      {(gallery.length > 0 || videos.length > 0) && (
        <GallerySection
          P={P}
          serif={serif}
          reduced={reduced}
          gallery={gallery}
          videos={videos}
          name={restaurant.name}
        />
      )}

      {/* ============ AVIS ============ */}
      {showReviews && reviews.length > 0 && (
        <ReviewsSection
          P={P}
          serif={serif}
          reduced={reduced}
          reviews={reviews}
          rating={rating}
          restaurantId={restaurant.id}
          theme={theme}
        />
      )}

      {/* ============ RÉSERVATION ============ */}
      {canReserve && (
        <section
          id="reservation"
          className="relative px-5 sm:px-10 py-24 sm:py-36"
          style={{ background: P.surface }}
        >
          <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-start">
            <div>
              <Reveal reduced={reduced}>
                <p
                  className="text-[12px] uppercase tracking-[0.3em] mb-6"
                  style={{ color: P.gold }}
                >
                  — Réservation
                </p>
              </Reveal>
              <h2 className="text-[48px] sm:text-[80px] leading-[0.95] font-medium" style={serif}>
                <SplitWords text="Votre table vous attend" inView reduced={reduced} />
              </h2>
              <Reveal reduced={reduced} delay={0.2}>
                <p className="mt-6 text-[16px] leading-7 max-w-md" style={{ color: P.muted }}>
                  Choisissez la date, l'heure et le nombre de convives. Nous confirmons votre
                  réservation rapidement.
                </p>
              </Reveal>
            </div>
            <Reveal reduced={reduced} delay={0.15}>
              <div
                className="p-5 sm:p-8"
                style={{ background: P.bg, border: `1px solid ${P.line}`, borderRadius: 8 }}
              >
                <AdvancedReservationForm
                  restaurantId={restaurant.id}
                  restaurantName={restaurant.name}
                  theme={theme}
                  waLink={wa}
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ CONTACT / PIED DE PAGE ============ */}
      <footer id="contact" className="relative overflow-hidden px-5 sm:px-10 pt-24 pb-12">
        <DiamondPattern
          color={P.gold}
          opacity={0.03}
          tile={70}
          className="absolute inset-0 w-full h-full"
          fade="linear-gradient(to bottom, transparent, #000 40%, transparent)"
        />
        <div className="relative max-w-[1400px] mx-auto">
          <Reveal reduced={reduced}>
            <h2
              className="royal-outline text-center font-semibold leading-[0.9] break-words text-[17vw] sm:text-[12vw] lg:text-[9.5rem]"
              style={serif}
            >
              {restaurant.name}
            </h2>
          </Reveal>
          <div
            className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-[14px] leading-6"
            style={{ color: P.muted }}
          >
            {(restaurant.address || restaurant.city) && (
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.25em] mb-3"
                  style={{ color: P.gold }}
                >
                  Adresse
                </p>
                <p>{[restaurant.address, restaurant.city].filter(Boolean).join(", ")}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [restaurant.name, restaurant.address, restaurant.city]
                      .filter(Boolean)
                      .join(" "),
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 underline underline-offset-4 hover:text-white"
                >
                  Itinéraire <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            )}
            {hours && (
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.25em] mb-3"
                  style={{ color: P.gold }}
                >
                  Horaires
                </p>
                <p className="whitespace-pre-line">{hours}</p>
              </div>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] mb-3" style={{ color: P.gold }}>
                Contact
              </p>
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center gap-2 hover:text-white"
              >
                <Phone className="w-4 h-4" /> {restaurant.phone}
              </a>
              <a
                href={`mailto:${restaurant.email}`}
                className="block mt-1 break-all hover:text-white"
              >
                {restaurant.email}
              </a>
            </div>
            {socials.length > 0 && (
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.25em] mb-3"
                  style={{ color: P.gold }}
                >
                  Suivez-nous
                </p>
                <div className="flex flex-col gap-1">
                  {socials.map(([label, url]) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div
            className="mt-16 pt-6 border-t flex flex-col sm:flex-row justify-between gap-2 text-[12px]"
            style={{ borderColor: P.line, color: P.muted }}
          >
            <span>
              © {new Date().getFullYear()} {restaurant.name}. Tous droits réservés.
            </span>
            <span>
              Site propulsé par{" "}
              <a href="/" className="underline" style={{ color: P.gold }}>
                RestoBF
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* WhatsApp flottant */}
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Écrire sur WhatsApp"
          className="royal-anim fixed right-4 bottom-5 z-[55] w-14 h-14 rounded-full grid place-items-center text-white"
          style={{ background: "#25D366", animation: "royal-pulse 2.4s infinite" }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
          </svg>
        </a>
      )}

      {openDish && <DishModal dish={openDish} theme={theme} onClose={() => setOpenDish(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

function Hero({
  P,
  serif,
  reduced,
  restaurant,
  cover,
  videoPath,
  allowVideo,
  canReserve,
  go,
  hoursShort,
}: {
  P: Pal;
  serif: React.CSSProperties;
  reduced: boolean;
  restaurant: TemplateProps["restaurant"];
  cover: string | null;
  videoPath: string | null;
  allowVideo: boolean;
  canReserve: boolean;
  go: (id: string) => void;
  hoursShort: string | null;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "22%"]);
  const textY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "38%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], reduced ? [1, 1] : [1, 0]);
  const videoUrl = useSigned(allowVideo ? videoPath : null);
  const [videoReady, setVideoReady] = React.useState(false);

  return (
    <section ref={ref} id="home" className="relative h-[100svh] min-h-[620px] overflow-hidden">
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY }}>
        {cover ? (
          <div
            className="absolute inset-0 royal-anim"
            style={{
              animation: reduced ? "none" : "royal-kenburns 24s ease-in-out infinite alternate",
            }}
          >
            <StorageImage path={cover} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(60% 60% at 75% 25%, ${P.wine}cc, transparent 70%), radial-gradient(50% 50% at 15% 85%, ${P.gold}33, transparent 70%), ${P.bg}`,
            }}
          />
        )}
        {videoUrl && (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: videoReady ? 1 : 0 }}
          />
        )}
      </motion.div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(9,7,11,.7) 0%, rgba(9,7,11,.25) 38%, rgba(9,7,11,.92) 100%)",
        }}
      />

      <motion.div
        style={{ y: textY, opacity: fade }}
        className="relative z-10 h-full max-w-[1400px] mx-auto px-5 sm:px-10 flex flex-col justify-end pb-36 sm:pb-28"
      >
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          className="text-[11px] sm:text-[12px] uppercase tracking-[0.34em] mb-6"
          style={{ color: P.gold }}
        >
          {[restaurant.cuisine, restaurant.city].filter(Boolean).join("  ·  ")}
        </motion.p>
        <h1
          className="font-medium leading-[0.9] text-[56px] sm:text-[104px] lg:text-[148px] max-w-[14ch]"
          style={{ ...serif, textShadow: "0 12px 60px rgba(0,0,0,.6)" }}
        >
          <SplitWords
            text={restaurant.hero_title?.trim() || restaurant.name}
            delay={0.35}
            reduced={reduced}
          />
        </h1>
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 1 }}
          className="mt-7 max-w-xl text-[16px] sm:text-[19px] leading-7"
          style={{ color: "rgba(255,243,211,.82)" }}
        >
          {restaurant.hero_subtitle?.trim() ||
            restaurant.description ||
            `Une table à ${restaurant.city}.`}
        </motion.p>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 1.15 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          {canReserve && (
            <Magnetic reduced={reduced}>
              <button
                onClick={() => go("reservation")}
                className="group inline-flex items-center gap-3 rounded-full pl-7 pr-3 h-[56px] text-[12px] font-semibold uppercase tracking-[0.18em]"
                style={{ background: P.gold, color: P.ink }}
              >
                Réserver une table
                <span
                  className="w-10 h-10 rounded-full grid place-items-center transition-transform duration-500 group-hover:translate-x-1"
                  style={{ background: P.ink, color: P.gold }}
                >
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </Magnetic>
          )}
          <Magnetic reduced={reduced}>
            <button
              onClick={() => go("menu")}
              className="inline-flex items-center gap-2 rounded-full px-7 h-[56px] text-[12px] font-semibold uppercase tracking-[0.18em] border backdrop-blur-sm"
              style={{ borderColor: "rgba(255,243,211,.4)", background: "rgba(255,255,255,0.05)" }}
            >
              Découvrir la carte
            </button>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Indicateur de défilement + horaires */}
      <div
        className="absolute z-10 bottom-6 inset-x-0 max-w-[1400px] mx-auto px-5 sm:px-10 flex items-center justify-between text-[11px] uppercase tracking-[0.22em]"
        style={{ color: P.muted }}
      >
        <span className="hidden sm:flex items-center gap-3">
          <span className="relative block w-px h-10 overflow-hidden" style={{ background: P.line }}>
            <span
              className="royal-anim absolute inset-x-0 top-0 h-full"
              style={{
                background: P.gold,
                animation: reduced ? "none" : "royal-scroll 2.2s ease-in-out infinite",
              }}
            />
          </span>
          Défiler
        </span>
        {hoursShort && <span className="hidden sm:block truncate max-w-[50%]">{hoursShort}</span>}
      </div>
    </section>
  );
}

function Marquee({
  P,
  serif,
  items,
  reduced,
}: {
  P: Pal;
  serif: React.CSSProperties;
  items: string[];
  reduced: boolean;
}) {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div
      className="overflow-hidden border-y py-5 sm:py-7"
      style={{ borderColor: P.line, background: P.bg }}
      aria-hidden="true"
    >
      <div
        className="royal-anim flex w-max gap-10 whitespace-nowrap will-change-transform"
        style={{ animation: reduced ? "none" : "royal-marquee 38s linear infinite" }}
      >
        {[0, 1].map((k) => (
          <div key={k} className="flex gap-10 items-center">
            {row.map((t, i) => (
              <span
                key={`${k}-${i}`}
                className="flex items-center gap-10 text-[34px] sm:text-[56px] leading-none italic font-medium"
                style={{ ...serif, color: i % 2 ? P.gold : P.text }}
              >
                {t}
                <span className="text-[16px] not-italic" style={{ color: P.gold }}>
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ParallaxImage({
  path,
  alt,
  reduced,
  P,
}: {
  path: string | null;
  alt: string;
  reduced: boolean;
  P: Pal;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-12%", "12%"]);
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { clipPath: "inset(14% 14% 14% 14%)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.3, ease: EASE }}
      className="relative aspect-[4/5] overflow-hidden"
      style={{ background: P.surface2, borderRadius: 6, border: `1px solid ${P.line}` }}
    >
      {path ? (
        <motion.div className="absolute inset-[-14%] will-change-transform" style={{ y }}>
          <StorageImage path={path} alt={alt} className="w-full h-full object-cover" />
        </motion.div>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 30% 20%, ${P.wine}, ${P.bg})` }}
        />
      )}
    </motion.div>
  );
}

function MenuSection({
  P,
  serif,
  reduced,
  items,
  onOpen,
}: {
  P: Pal;
  serif: React.CSSProperties;
  reduced: boolean;
  items: PublicMenuItem[];
  onOpen: (d: PublicMenuItem) => void;
}) {
  const groups = React.useMemo(() => groupByCategory(items), [items]);
  const cats = groups.map(([c]) => c);
  const [cat, setCat] = React.useState(cats[0] ?? "");
  const [hover, setHover] = React.useState<PublicMenuItem | null>(null);
  React.useEffect(() => {
    if (!cats.includes(cat)) setCat(cats[0] ?? "");
  }, [cats, cat]);
  const list = groups.find(([c]) => c === cat)?.[1] ?? [];
  const preview = hover ?? list.find((d) => d.image_url) ?? list[0];

  return (
    <section id="menu" className="relative px-5 sm:px-10 py-24 sm:py-36 max-w-[1400px] mx-auto">
      <Reveal reduced={reduced}>
        <p className="text-[12px] uppercase tracking-[0.3em] mb-5" style={{ color: P.gold }}>
          — La carte
        </p>
      </Reveal>
      <h2 className="text-[48px] sm:text-[88px] leading-[0.95] font-medium" style={serif}>
        <SplitWords text="Le menu" inView reduced={reduced} />
      </h2>

      <div className="royal-snap mt-10 flex gap-2 overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
        {cats.map((c) => {
          const on = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="relative shrink-0 rounded-full px-6 h-11 text-[12px] uppercase tracking-[0.16em] font-semibold"
              style={{
                color: on ? P.ink : P.text,
                border: `1px solid ${on ? "transparent" : P.line}`,
              }}
            >
              {on && (
                <motion.span
                  layoutId="royal-cat"
                  className="absolute inset-0 rounded-full"
                  style={{ background: P.gold }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{c}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-12 grid lg:grid-cols-[1.4fr_1fr] gap-14 items-start">
        <AnimatePresence mode="wait">
          <motion.ul
            key={cat}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="divide-y"
            style={{ borderColor: P.line }}
          >
            {list.map((d, i) => (
              <motion.li
                key={d.id}
                initial={reduced ? false : { opacity: 0, x: -22 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                style={{ borderColor: P.line }}
              >
                <button
                  onClick={() => onOpen(d)}
                  onMouseEnter={() => setHover(d)}
                  onMouseLeave={() => setHover(null)}
                  className="group w-full text-left py-6 flex items-start gap-4"
                >
                  {d.image_url && (
                    <span
                      className="lg:hidden shrink-0 w-[72px] h-[72px] rounded-md overflow-hidden"
                      style={{ background: P.surface2 }}
                    >
                      <StorageImage
                        path={d.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </span>
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline gap-3">
                      <span
                        className="text-[24px] sm:text-[32px] leading-tight font-medium transition-colors duration-300 group-hover:text-[var(--g)]"
                        style={{ ...serif, ["--g" as string]: P.gold }}
                      >
                        {d.name}
                      </span>
                      <span
                        className="flex-1 border-b border-dotted translate-y-[-6px] hidden sm:block"
                        style={{ borderColor: P.line }}
                      />
                      <span
                        className="text-[22px] sm:text-[26px] font-medium whitespace-nowrap"
                        style={{ ...serif, color: P.gold }}
                      >
                        {fmtPrice(d.price)}
                      </span>
                    </span>
                    {d.description && (
                      <span
                        className="block mt-1.5 text-[14px] leading-6 max-w-xl"
                        style={{ color: P.muted }}
                      >
                        {d.description}
                      </span>
                    )}
                  </span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>

        {/* Aperçu qui suit le survol (ordinateur) */}
        <div className="hidden lg:block sticky top-28">
          <div
            className="relative aspect-[4/5] overflow-hidden"
            style={{ background: P.surface2, borderRadius: 6, border: `1px solid ${P.line}` }}
          >
            <AnimatePresence mode="popLayout">
              {preview && (
                <motion.div
                  key={preview.id}
                  initial={reduced ? false : { opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0"
                >
                  {preview.image_url ? (
                    <StorageImage
                      path={preview.image_url}
                      alt={preview.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `radial-gradient(circle at 30% 20%, ${P.wine}, ${P.bg})`,
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, rgba(9,7,11,.85), transparent 50%)",
                    }}
                  />
                  <span
                    className="absolute bottom-5 left-5 right-5 text-[26px] font-medium"
                    style={serif}
                  >
                    {preview.name}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em]" style={{ color: P.muted }}>
            Cliquez sur un plat pour le détail et commander
          </p>
        </div>
      </div>
    </section>
  );
}

function GallerySection({
  P,
  serif,
  reduced,
  gallery,
  videos,
  name,
}: {
  P: Pal;
  serif: React.CSSProperties;
  reduced: boolean;
  gallery: PublicGalleryImage[];
  videos: PublicGalleryImage[];
  name: string;
}) {
  const [light, setLight] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (light === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLight(null);
      if (e.key === "ArrowRight") setLight((i) => (i === null ? i : (i + 1) % gallery.length));
      if (e.key === "ArrowLeft")
        setLight((i) => (i === null ? i : (i - 1 + gallery.length) % gallery.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [light, gallery.length]);

  return (
    <section id="galerie" className="relative py-24 sm:py-36" style={{ background: P.surface }}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
        <Reveal reduced={reduced}>
          <p className="text-[12px] uppercase tracking-[0.3em] mb-5" style={{ color: P.gold }}>
            — Galerie
          </p>
        </Reveal>
        <h2 className="text-[48px] sm:text-[88px] leading-[0.95] font-medium" style={serif}>
          <SplitWords text="Instants choisis" inView reduced={reduced} />
        </h2>

        {gallery.length > 0 && (
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 auto-rows-[160px] sm:auto-rows-[230px] gap-3 sm:gap-4">
            {gallery.slice(0, 9).map((g, i) => (
              <motion.button
                key={g.id}
                onClick={() => setLight(i)}
                initial={reduced ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1.1, ease: EASE, delay: (i % 4) * 0.08 }}
                className={`group relative overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""} ${
                  i === 4 ? "sm:col-span-2" : ""
                }`}
                style={{ background: P.surface2, borderRadius: 6 }}
                aria-label={g.caption ?? `Photo ${i + 1} de ${name}`}
              >
                <StorageImage
                  path={g.image_url}
                  alt={g.caption ?? name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "rgba(9,7,11,.35)" }}
                />
              </motion.button>
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-16">
            <p className="text-[12px] uppercase tracking-[0.3em] mb-6" style={{ color: P.gold }}>
              — En vidéo
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              {videos.map((v) => (
                <StorageVideo
                  key={v.id}
                  path={v.image_url}
                  className="w-full aspect-video rounded-md bg-black"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {light !== null && gallery[light] && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            style={{ background: "rgba(5,4,6,.94)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLight(null)}
          >
            <motion.div
              key={gallery[light].id}
              initial={reduced ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative max-w-5xl w-full max-h-[85vh] aspect-[4/3]"
              onClick={(e) => e.stopPropagation()}
            >
              <StorageImage
                path={gallery[light].image_url}
                alt={gallery[light].caption ?? name}
                className="w-full h-full object-contain"
              />
            </motion.div>
            <button
              aria-label="Fermer"
              onClick={() => setLight(null)}
              className="absolute top-5 right-5 w-12 h-12 rounded-full grid place-items-center border"
              style={{ borderColor: P.line }}
            >
              <X className="w-5 h-5" />
            </button>
            {gallery.length > 1 && (
              <>
                <button
                  aria-label="Précédent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLight((light - 1 + gallery.length) % gallery.length);
                  }}
                  className="absolute left-3 sm:left-8 w-12 h-12 rounded-full grid place-items-center border"
                  style={{ borderColor: P.line }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  aria-label="Suivant"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLight((light + 1) % gallery.length);
                  }}
                  className="absolute right-3 sm:right-8 w-12 h-12 rounded-full grid place-items-center border"
                  style={{ borderColor: P.line }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ReviewsSection({
  P,
  serif,
  reduced,
  reviews,
  rating,
  restaurantId,
  theme,
}: {
  P: Pal;
  serif: React.CSSProperties;
  reduced: boolean;
  reviews: PublicReview[];
  rating: number | null;
  restaurantId: string;
  theme: Theme;
}) {
  const list = reviews.slice(0, 8);
  const [i, setI] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  React.useEffect(() => {
    if (paused || reduced || list.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % list.length), 7000);
    return () => clearInterval(t);
  }, [paused, reduced, list.length]);
  const r = list[i % list.length];

  return (
    <section
      id="avis"
      className="relative px-5 sm:px-10 py-24 sm:py-36 max-w-[1100px] mx-auto text-center"
    >
      <Reveal reduced={reduced}>
        <p className="text-[12px] uppercase tracking-[0.3em] mb-6" style={{ color: P.gold }}>
          — Ils en parlent
        </p>
        {rating !== null && rating > 0 && (
          <p className="flex items-center justify-center gap-3 mb-10" style={{ color: P.gold }}>
            <span className="text-[56px] leading-none font-medium" style={serif}>
              <Counter to={Number(rating.toFixed(1))} decimals={1} reduced={reduced} />
            </span>
            <Star className="w-7 h-7" fill="currentColor" />
            <span className="text-[13px] uppercase tracking-[0.18em]" style={{ color: P.muted }}>
              {reviews.length} avis
            </span>
          </p>
        )}
      </Reveal>

      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="min-h-[300px] sm:min-h-[260px] flex items-center"
      >
        <AnimatePresence mode="wait">
          <motion.figure
            key={r.id}
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="w-full"
          >
            <blockquote
              className="text-[26px] sm:text-[40px] leading-[1.2] italic font-medium"
              style={serif}
            >
              « {r.comment || "Une excellente expérience."} »
            </blockquote>
            <figcaption className="mt-8">
              <span className="block text-[13px] uppercase tracking-[0.2em] font-semibold">
                {r.author_name}
              </span>
              <span className="block mt-1.5" style={{ color: P.gold }}>
                {"★".repeat(r.rating)}
                <span style={{ opacity: 0.25 }}>{"★".repeat(5 - r.rating)}</span>
              </span>
              {r.owner_reply && (
                <span
                  className="block mt-5 mx-auto max-w-lg text-[14px] leading-6 pl-4 text-left"
                  style={{ borderLeft: `2px solid ${P.gold}`, color: P.muted }}
                >
                  <strong style={{ color: P.gold }}>Réponse du restaurant — </strong>
                  {r.owner_reply}
                </span>
              )}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {list.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-5">
          <button
            aria-label="Avis précédent"
            onClick={() => setI((i - 1 + list.length) % list.length)}
            className="w-11 h-11 rounded-full grid place-items-center border"
            style={{ borderColor: P.line }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {list.map((x, k) => (
              <button
                key={x.id}
                aria-label={`Avis ${k + 1}`}
                onClick={() => setI(k)}
                className="p-1.5"
              >
                <span
                  className="block h-[3px] rounded-full transition-all duration-500"
                  style={{ width: k === i ? 28 : 10, background: k === i ? P.gold : P.line }}
                />
              </button>
            ))}
          </div>
          <button
            aria-label="Avis suivant"
            onClick={() => setI((i + 1) % list.length)}
            className="w-11 h-11 rounded-full grid place-items-center border"
            style={{ borderColor: P.line }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="mt-14">
        <button
          onClick={() => setFormOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded-full px-7 h-12 text-[12px] font-semibold uppercase tracking-[0.18em] border"
          style={{ borderColor: P.line }}
        >
          {formOpen ? "Fermer" : "Laisser un avis"}
        </button>
        <AnimatePresence initial={false}>
          {formOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="overflow-hidden text-left"
            >
              <div
                className="mt-6 p-5 sm:p-8 max-w-xl mx-auto"
                style={{ background: P.surface, border: `1px solid ${P.line}`, borderRadius: 8 }}
              >
                <ReviewForm restaurantId={restaurantId} theme={theme} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
