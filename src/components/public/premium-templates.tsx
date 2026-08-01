import { useEffect, useMemo, useState, useRef } from "react";
import type { CSSProperties, FormEvent } from "react";
import * as QRCode from "qrcode";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StorageImage } from "@/components/StorageImage";
import type { TemplateProps, PublicMenuItem, Theme, PublicGalleryImage } from "./shared";
import {
  FloatingWhatsApp,
  ReviewForm,
  ReviewList,
  avgRating,
  fmtPrice,
  groupByCategory,
} from "./shared";
import { useCart } from "./CartContext";
import { Reveal } from "@/components/landing/Reveal";
import {
  Sparkles,
  Search,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  Flame,
  Crown,
  Share2,
  Maximize2,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Utensils,
  Wine,
  Award,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Download,
  Info,
} from "lucide-react";

const PREMIUM_FEU_BG = "/premium-bgs/premium-feu-bg.png";
const PREMIUM_GRILL_BG = "/premium-bgs/premium-grill-bg.png";
const PREMIUM_ORANGE_BG = "/premium-bgs/premium-orange-bg.png";
const PREMIUM_PASTA_BG = "/premium-bgs/premium-pasta-bg.png";

type PremiumKind = "royal" | "nuit" | "feu" | "luxe";

type PremiumConfig = {
  kind: PremiumKind;
  label: string;
  title: string;
  subtitle: string;
  background: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  ink: string;
  border: string;
  serif: string;
  capsule: string;
};

const PREMIUM_CONFIGS: Record<PremiumKind, PremiumConfig> = {
  royal: {
    kind: "royal",
    label: "Le Palais Gourmand",
    title: "L'expérience royale & gastronomie",
    subtitle: "Menus d'exception, grands crus, salons VIP et réservation haute réception.",
    background: PREMIUM_ORANGE_BG,
    bg: "#09070b",
    surface: "rgba(22, 14, 12, 0.88)",
    surfaceAlt: "rgba(46, 26, 14, 0.82)",
    text: "#fff3d3",
    muted: "rgba(255, 243, 211, 0.72)",
    accent: "#f4c15d",
    accent2: "#7b1030",
    ink: "#160c05",
    border: "rgba(244, 193, 93, 0.34)",
    serif: "'Cormorant Garamond', serif",
    capsule: "Couronnes · Salons VIP · Haute Gastronomie",
  },
  nuit: {
    kind: "nuit",
    label: "Aurum Fine Dining",
    title: "Une soirée d'exception au-delà du goût",
    subtitle: "Ambiance feutrée, carte signature curatée et galerie immersive.",
    background: PREMIUM_PASTA_BG,
    bg: "#05070a",
    surface: "rgba(12, 17, 21, 0.9)",
    surfaceAlt: "rgba(18, 22, 26, 0.82)",
    text: "#f8ead6",
    muted: "rgba(248, 234, 214, 0.68)",
    accent: "#d7a85a",
    accent2: "#24333c",
    ink: "#06080a",
    border: "rgba(215, 168, 90, 0.28)",
    serif: "'Playfair Display', serif",
    capsule: "Fine dining · Nuit d'Or · Ambiance feutrée",
  },
  feu: {
    kind: "feu",
    label: "Ignis Wood-Fired",
    title: "Forgé dans le feu & les braises",
    subtitle: "Spécialités grillées au feu de bois, poulet bicyclette & piments fumés.",
    background: PREMIUM_FEU_BG,
    bg: "#080604",
    surface: "rgba(22, 12, 7, 0.9)",
    surfaceAlt: "rgba(48, 20, 10, 0.82)",
    text: "#ffe2c7",
    muted: "rgba(255, 226, 199, 0.68)",
    accent: "#ff8a2a",
    accent2: "#8c1f12",
    ink: "#160601",
    border: "rgba(255, 138, 42, 0.34)",
    serif: "'DM Serif Display', serif",
    capsule: "Braises · Wood-Fired Grill · Maquis Prestige",
  },
  luxe: {
    kind: "luxe",
    label: "Maison Signature",
    title: "Le prestige d'une grande table",
    subtitle: "Gastronomie sur mesure, QR code interactif et service de prestige.",
    background: PREMIUM_GRILL_BG,
    bg: "#070908",
    surface: "rgba(10, 18, 15, 0.9)",
    surfaceAlt: "rgba(18, 35, 28, 0.82)",
    text: "#fff2dc",
    muted: "rgba(255, 242, 220, 0.7)",
    accent: "#e4b25f",
    accent2: "#0f5a43",
    ink: "#07100c",
    border: "rgba(228, 178, 95, 0.3)",
    serif: "'Playfair Display', serif",
    capsule: "Table d'Honneur · Recommandations du Chef",
  },
};

export function TplPremiumRoyal(props: TemplateProps) {
  return <PremiumRestaurantTemplate {...props} config={PREMIUM_CONFIGS.royal} />;
}

export function TplPremiumNuit(props: TemplateProps) {
  return <PremiumRestaurantTemplate {...props} config={PREMIUM_CONFIGS.nuit} />;
}

export function TplPremiumFeu(props: TemplateProps) {
  return <PremiumRestaurantTemplate {...props} config={PREMIUM_CONFIGS.feu} />;
}

export function TplPremiumLuxe(props: TemplateProps) {
  return <PremiumRestaurantTemplate {...props} config={PREMIUM_CONFIGS.luxe} />;
}

/** 3D TILT CARD COMPONENT WITH SPECULAR LIGHT EFFECT */
function TiltCard3D({
  children,
  className = "",
  style = {},
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const [transform, setTransform] = useState(
    "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
  );
  const [gloss, setGloss] = useState(
    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0), transparent 70%)",
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
    );
    setGloss(
      `radial-gradient(circle at ${percentX.toFixed(1)}% ${percentY.toFixed(1)}%, rgba(255,255,255,0.2), transparent 65%)`,
    );
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGloss("radial-gradient(circle at 50% 50%, rgba(255,255,255,0), transparent 70%)");
  };

  return (
    <div
      className={`relative transition-transform duration-200 ease-out cursor-pointer ${className}`}
      style={{
        ...style,
        transform,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-10"
        style={{ background: gloss }}
      />
    </div>
  );
}

/** EMBER & STARDUST CANVAS PARTICLES */
function EmberParticleCanvas({ color = "#f4c15d" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const particleCount = 42;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedY: Math.random() * 0.7 + 0.25,
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * 0.02 + 0.008,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * p.pulse) * 0.008;
        if (p.alpha < 0.1) p.alpha = 0.2;
        if (p.alpha > 0.8) p.alpha = 0.65;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  );
}

/** INTERACTIVE 3D PLATTER SHOWCASE */
function Interactive3DPlatterHero({
  dish,
  config,
  onClick,
}: {
  dish?: PublicMenuItem;
  config: PremiumConfig;
  onClick: () => void;
}) {
  const [rotation, setRotation] = useState({ x: 10, y: -12 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = 15 - (y / rect.height) * 30;
    const rotY = -15 + (x / rect.width) * 30;
    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 8, y: -10 });
  };

  return (
    <div
      className="relative w-full h-[380px] sm:h-[440px] flex items-center justify-center perspective-1000 cursor-pointer group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Dynamic Aura Glow */}
      <div
        className="absolute w-[280px] h-[280px] rounded-full blur-3xl opacity-40 transition-transform duration-500 group-hover:scale-125"
        style={{ background: config.accent }}
      />

      {/* 3D Floating Platter Container */}
      <div
        className="relative w-[300px] sm:w-[350px] h-[300px] sm:h-[350px] rounded-full p-4 transition-transform duration-300 ease-out border border-white/20 shadow-2xl backdrop-blur-xl bg-black/40 flex items-center justify-center"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(30px)`,
          transformStyle: "preserve-3d",
          boxShadow: `0 30px 60px -15px ${config.accent}33`,
        }}
      >
        {/* Ring Orbit Animation */}
        <div className="absolute inset-2 rounded-full border border-dashed border-[#f0d48a]/40 animate-spin-slow pointer-events-none" />

        {/* Dish Image */}
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#f0d48a]/50 shadow-inner relative">
          {dish?.image_url ? (
            <StorageImage
              path={dish.image_url}
              alt={dish.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <img
              src={config.background}
              alt={dish?.name ?? "Plat du chef"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#f0d48a] mb-1">
              👑 Plat Signature Interactive
            </span>
            <h3 className="text-xl font-extrabold text-white line-clamp-1">
              {dish?.name ?? "Dégustation Prestige"}
            </h3>
            <p className="text-sm font-bold text-[#f0d48a] mt-1">
              {dish ? fmtPrice(dish.price) : "Sur Mesure"}
            </p>
          </div>
        </div>

        {/* Floating 3D Badge 1 */}
        <div
          className="absolute -top-4 -left-4 bg-black/80 border border-[#f0d48a]/60 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-1.5 transition-transform duration-300 group-hover:translate-z-10"
          style={{ transform: "translateZ(40px)" }}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>Fait Maison</span>
        </div>

        {/* Floating 3D Badge 2 */}
        <div
          className="absolute -bottom-2 -right-4 bg-[#f0d48a] text-black px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-1.5 transition-transform duration-300"
          style={{ transform: "translateZ(50px)" }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cliquer pour Découvrir</span>
        </div>
      </div>
    </div>
  );
}

function PremiumRestaurantTemplate({
  restaurant,
  menu,
  reviews,
  gallery,
  config,
  view,
}: TemplateProps & { config: PremiumConfig }) {
  const [category, setCategory] = useState("Tout");
  const [searchQuery, setSearchQuery] = useState("");
  const [qr, setQr] = useState("");
  const [mobOpen, setMobOpen] = useState(false);
  const [openDish, setOpenDish] = useState<PublicMenuItem | null>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const cart = useCart();
  const available = useMemo(() => menu.filter((item) => item.available), [menu]);
  const categories = useMemo(
    () => ["Tout", ...Array.from(new Set(available.map((item) => item.category)))],
    [available],
  );

  // Filter menu items by search + category
  const filtered = useMemo(() => {
    return available.filter((item) => {
      const matchCat = category === "Tout" || item.category === category;
      if (!searchQuery.trim()) return matchCat;
      const q = searchQuery.toLowerCase();
      const matchText =
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchCat && matchText;
    });
  }, [available, category, searchQuery]);

  const signatures = available
    .filter((item) => item.image_url)
    .slice(0, 4)
    .concat(available.filter((item) => !item.image_url).slice(0, 4))
    .slice(0, 4);

  const heroDish = signatures[0] ?? available[0];

  const groups = groupByCategory(available).slice(0, 4);
  const rating = avgRating(reviews);
  const whatsapp = restaurant.whatsapp?.replace(/\D/g, "") ?? "";
  const waHref = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        `Bonjour ${restaurant.name}, je souhaite réserver une table ou poser une question.`,
      )}`
    : null;

  const theme: Theme = {
    bg: config.bg,
    surface: config.surface,
    surfaceAlt: config.surfaceAlt,
    text: config.text,
    textMuted: config.muted,
    accent: config.accent,
    accentInk: config.ink,
    border: config.border,
    radius: config.kind === "royal" ? "8px" : config.kind === "feu" ? "6px" : "12px",
  };

  const activeView = (view ?? "accueil") as
    "accueil" | "menu" | "experience" | "galerie" | "avis" | "reservation";

  const buildViewHref = (target: typeof activeView) => {
    if (typeof window === "undefined") return "#";
    const params = new URLSearchParams(window.location.search);
    params.set("view", target);
    return `${window.location.pathname}?${params.toString()}`;
  };

  useEffect(() => {
    const target = typeof window !== "undefined" ? window.location.href : restaurant.name;
    QRCode.toDataURL(target, {
      margin: 1,
      width: 260,
      color: { dark: config.ink, light: "#00000000" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [config.ink, restaurant.name]);

  const renderDedicatedView = () => {
    switch (activeView) {
      case "menu":
        return (
          <section className="premium-section">
            <PremiumHeading
              eyebrow="Carte Gourmande"
              title="Notre Menu Gastronomique"
              subtitle={`${restaurant.cuisine ?? "Cuisine d'Exception"} · ${restaurant.city}`}
            />

            {/* Search Bar */}
            <div className="premium-search-box">
              <Search className="premium-search-icon" />
              <input
                type="text"
                placeholder="Rechercher un plat, une boisson, un ingrédient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="premium-search-clear">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="premium-tabs">
              {categories.map((cat) => {
                const count =
                  cat === "Tout"
                    ? available.length
                    : available.filter((i) => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    className={cat === category ? "active" : ""}
                    onClick={() => setCategory(cat)}
                  >
                    <span>{cat}</span>
                    <small>({count})</small>
                  </button>
                );
              })}
            </div>

            <Reveal as="div" className="premium-menu-grid">
              {filtered.map((dish) => (
                <TiltCard3D key={dish.id} onClick={() => setOpenDish(dish)}>
                  <article style={{ height: "100%" }}>
                    <div>
                      <small>{dish.category}</small>
                      <h3>{dish.name}</h3>
                      {dish.description && <p>{dish.description}</p>}
                    </div>
                    <footer>
                      <strong>{fmtPrice(dish.price)}</strong>
                      {cart && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cart.addItem(dish.id);
                            toast.success(`${dish.name} ajouté au panier !`);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          Commander
                        </button>
                      )}
                    </footer>
                  </article>
                </TiltCard3D>
              ))}
            </Reveal>
          </section>
        );

      case "experience":
        return (
          <section className="premium-section premium-experience">
            <div>
              <PremiumHeading
                eyebrow="Service de Prestige"
                title={config.title}
                subtitle={config.subtitle}
              />
              <Reveal as="div" className="premium-experience-list">
                {groups.map(([cat, items]) => (
                  <article key={cat}>
                    <span>{cat}</span>
                    <strong>
                      {items
                        .slice(0, 3)
                        .map((item) => item.name)
                        .join(" · ")}
                    </strong>
                  </article>
                ))}
                <article>
                  <span>Adresse</span>
                  <strong>{restaurant.address ?? restaurant.city}</strong>
                </article>
                <article>
                  <span>Horaires d'Ouverture</span>
                  <strong>{restaurant.hours ?? "Tous les jours · 11h00 — 23h30"}</strong>
                </article>
                <article>
                  <span>Service Réservation</span>
                  <strong>{restaurant.phone}</strong>
                </article>
              </Reveal>
            </div>

            <div className="premium-chef-card">
              <div className="premium-chef-image">
                {gallery[0]?.image_url ? (
                  <StorageImage
                    path={gallery[0].image_url}
                    alt={gallery[0].caption ?? restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src={config.background} alt="Ambiance prestige" />
                )}
              </div>
              <h3>Table d'Honneur & Salon VIP</h3>
              <p>
                Accueil personnalisé, salons climatisés, réceptions d'affaires, anniversaires et
                menus dégustation créés sur demande par notre Chef.
              </p>
            </div>
          </section>
        );

      case "galerie":
        return (
          <section className="premium-section">
            <PremiumHeading
              eyebrow="Immersion Visuelle"
              title="Ambiance, Salle & Plats Signatures"
              subtitle="Chaque plat et chaque espace de notre établissement en haute définition."
            />
            <Reveal as="div" className="premium-gallery">
              {(gallery.length
                ? gallery.slice(0, 12)
                : [{ id: "bg", image_url: config.background, caption: restaurant.name }]
              ).map((photo, idx) => (
                <figure
                  key={photo.id ?? idx}
                  onClick={() => setActiveLightboxIndex(idx)}
                  className="cursor-pointer group relative overflow-hidden rounded-xl border border-white/10"
                >
                  {photo.image_url.startsWith("/") ? (
                    <img
                      src={photo.image_url}
                      alt={photo.caption ?? restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <StorageImage
                      path={photo.image_url}
                      alt={photo.caption ?? restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="premium-gallery-overlay">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                  {photo.caption && <figcaption>{photo.caption}</figcaption>}
                </figure>
              ))}
            </Reveal>
          </section>
        );

      case "avis":
        return (
          <section className="premium-section">
            <PremiumHeading
              eyebrow="Témoignages & Note"
              title="Avis de nos Connaisseurs"
              subtitle="Découvrez les retours authentiques de nos clients habitués et VIP."
            />
            <ReviewList reviews={reviews} theme={theme} />
            <div className="premium-review-form">
              <ReviewForm restaurantId={restaurant.id} theme={theme} />
            </div>
          </section>
        );

      case "reservation":
        return (
          <section className="premium-reservation">
            <div className="premium-reservation-inner">
              <PremiumHeading
                eyebrow="Réservation de Table"
                title="Réservez Votre Expérience Gastronomique"
                subtitle="Sélectionnez l'heure, la table et l'occasion pour un accueil sur mesure."
              />
              <div className="premium-reservation-layout">
                <PremiumReservationForm restaurant={restaurant} config={config} />
                <aside className="premium-qr-card">
                  <h3>Menu QR Code Table</h3>
                  <p>Partagez ce QR code sur vos tables, flyers ou réseaux sociaux.</p>
                  {qr ? (
                    <img src={qr} alt={`QR code ${restaurant.name}`} />
                  ) : (
                    <div className="premium-qr-placeholder">QR</div>
                  )}
                  <div className="premium-contact-mini">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#f0d48a]" /> {restaurant.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#f0d48a]" />{" "}
                      {restaurant.address ?? restaurant.city}
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        );

      case "accueil":
      default:
        return null;
    }
  };

  const galleryList = gallery.length
    ? gallery
    : [{ id: "bg", image_url: config.background, caption: restaurant.name }];

  return (
    <div
      className={`premium-page premium-${config.kind}`}
      style={
        {
          "--pr-bg": config.bg,
          "--pr-surface": config.surface,
          "--pr-surface-alt": config.surfaceAlt,
          "--pr-text": config.text,
          "--pr-muted": config.muted,
          "--pr-accent": config.accent,
          "--pr-accent-2": config.accent2,
          "--pr-ink": config.ink,
          "--pr-border": config.border,
          "--pr-serif": config.serif,
          "--pr-radius": theme.radius,
          background: config.bg,
          color: config.text,
        } as CSSProperties
      }
    >
      <style>{PREMIUM_CSS}</style>

      {/* DYNAMIC EMBER PARTICLES */}
      <EmberParticleCanvas color={config.accent} />

      {/* BACKGROUND DRIFT & AMBIANCE GLOW */}
      <div className="premium-bg" aria-hidden>
        <img src={config.background} alt="" />
        <span />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="premium-nav">
        <a href={buildViewHref("accueil")} className="premium-brand">
          {restaurant.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              style={{ maxHeight: "50px", objectFit: "contain" }}
            />
          ) : (
            <>
              <span>{restaurant.name}</span>
              <small>{config.label}</small>
            </>
          )}
        </a>

        <nav>
          <a href={buildViewHref("menu")} className={activeView === "menu" ? "active" : ""}>
            Menu
          </a>
          <a
            href={buildViewHref("experience")}
            className={activeView === "experience" ? "active" : ""}
          >
            Expérience
          </a>
          <a href={buildViewHref("galerie")} className={activeView === "galerie" ? "active" : ""}>
            Galerie
          </a>
          <a href={buildViewHref("avis")} className={activeView === "avis" ? "active" : ""}>
            Avis
          </a>
          <a
            href={buildViewHref("reservation")}
            className={activeView === "reservation" ? "active" : ""}
          >
            Réserver
          </a>
        </nav>

        <a className="premium-book" href={buildViewHref("reservation")}>
          <Crown className="w-3.5 h-3.5" />
          <span>Réserver Table</span>
        </a>

        <button
          onClick={() => setMobOpen((v) => !v)}
          className="premium-hamburger"
          aria-label="Menu"
        >
          <span className={`premium-hamburger-line ${mobOpen ? "open" : ""}`} />
          <span className={`premium-hamburger-line ${mobOpen ? "open" : ""}`} />
          <span className={`premium-hamburger-line ${mobOpen ? "open" : ""}`} />
        </button>
      </header>

      {/* MOBILE DROPDOWN MENU */}
      {mobOpen && (
        <nav className="premium-mob-menu">
          <a href={buildViewHref("menu")} onClick={() => setMobOpen(false)}>
            Menu & Carte
          </a>
          <a href={buildViewHref("experience")} onClick={() => setMobOpen(false)}>
            Expérience & VIP
          </a>
          <a href={buildViewHref("galerie")} onClick={() => setMobOpen(false)}>
            Galerie Photo
          </a>
          <a href={buildViewHref("avis")} onClick={() => setMobOpen(false)}>
            Avis Clients
          </a>
          <a href={buildViewHref("reservation")} onClick={() => setMobOpen(false)}>
            Réserver une Table
          </a>
        </nav>
      )}

      {/* MAIN VIEW CONTENT */}
      <main>
        {activeView !== "accueil" ? (
          renderDedicatedView()
        ) : (
          <>
            {/* HERO SECTION WITH 3D PLATTER */}
            <section id="accueil" className="premium-hero">
              <div className="premium-hero-copy">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-[#f0d48a]/40 text-xs font-black text-[#f0d48a] mb-4 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{restaurant.cuisine ?? config.capsule}</span>
                </div>

                <h1>{restaurant.name}</h1>
                <p className="premium-lead">{restaurant.description ?? config.subtitle}</p>

                <div className="premium-actions">
                  <a href={buildViewHref("reservation")} className="premium-btn-main">
                    <span>Réserver Votre Table</span>
                  </a>
                  <a href={buildViewHref("menu")} className="premium-btn-sec">
                    <span>Voir la Carte</span>
                  </a>
                  {waHref && (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="premium-btn-wa"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Commander WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 3D INTERACTIVE HERO STAGE / PANEL */}
              <div className="flex flex-col gap-6">
                <Interactive3DPlatterHero
                  dish={heroDish}
                  config={config}
                  onClick={() => heroDish && setOpenDish(heroDish)}
                />

                <aside className="premium-hero-panel">
                  <TiltCard3D>
                    <div>
                      <span>{available.length}</span>
                      <small>Plats Signatures</small>
                    </div>
                  </TiltCard3D>
                  <TiltCard3D>
                    <div>
                      <span>{rating ? rating.toFixed(1) : "5.0"}★</span>
                      <small>Excellence Client</small>
                    </div>
                  </TiltCard3D>
                  <TiltCard3D>
                    <div>
                      <span>VIP</span>
                      <small>Service Sur Mesure</small>
                    </div>
                  </TiltCard3D>
                </aside>
              </div>
            </section>

            {/* FEATURE HIGHLIGHT STRIP */}
            <section className="premium-strip" aria-label="Points forts">
              {[
                ["📲", "Scan QR Code", "Lien partageable & QR table direct"],
                ["📅", "Réservation VIP", "Formulaire fluide avec choix d'ambiance"],
                ["⚡", "Commandes Directes", "Connexion temps réel cuisine & serveurs"],
                ["⭐", "Avis Vérifiés", "Preuve sociale & notes garanties"],
                ["🖼️", "Galerie HD", "Photos immersives de la salle"],
                ["🥂", "Salons Privés", "Privatisation, anniversaire & business"],
              ].map(([icon, title, text]) => (
                <TiltCard3D key={title}>
                  <article style={{ height: "100%" }}>
                    <b>{icon}</b>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </article>
                </TiltCard3D>
              ))}
            </section>

            {/* SIGNATURE DISHES & MENU SECTION */}
            <section id="menu" className="premium-section">
              <PremiumHeading
                eyebrow="Sélection Gastronomique"
                title="Plats & Spécialités du Chef"
                subtitle={`${restaurant.cuisine ?? "Cuisine d'Exception"} · ${restaurant.city}`}
              />

              {/* SIGNATURE CARDS CAROUSEL / GRID */}
              {signatures.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#f0d48a] flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#d4a853]" />
                      <span>Incontournables de la Maison</span>
                    </h3>
                  </div>

                  <Reveal as="div" className="premium-signatures">
                    {signatures.map((dish) => (
                      <SignatureCard
                        key={dish.id}
                        dish={dish}
                        config={config}
                        onClick={() => setOpenDish(dish)}
                      />
                    ))}
                  </Reveal>
                </div>
              )}

              {/* SEARCH + CATEGORY FILTER TABS */}
              <div className="premium-search-box mb-6">
                <Search className="premium-search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher un plat, une boisson, un ingrédient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="premium-search-clear">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="premium-tabs">
                {categories.map((cat) => {
                  const count =
                    cat === "Tout"
                      ? available.length
                      : available.filter((i) => i.category === cat).length;
                  return (
                    <button
                      key={cat}
                      className={cat === category ? "active" : ""}
                      onClick={() => setCategory(cat)}
                    >
                      <span>{cat}</span>
                      <small>({count})</small>
                    </button>
                  );
                })}
              </div>

              {/* DISH GRID WITH 3D TILT */}
              <Reveal as="div" className="premium-menu-grid">
                {filtered.map((dish) => (
                  <TiltCard3D key={dish.id} onClick={() => setOpenDish(dish)}>
                    <article style={{ height: "100%" }}>
                      <div>
                        <small>{dish.category}</small>
                        <h3>{dish.name}</h3>
                        {dish.description && <p>{dish.description}</p>}
                      </div>
                      <footer>
                        <strong>{fmtPrice(dish.price)}</strong>
                        {cart && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cart.addItem(dish.id);
                              toast.success(`${dish.name} ajouté au panier !`);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            Commander
                          </button>
                        )}
                      </footer>
                    </article>
                  </TiltCard3D>
                ))}
              </Reveal>
            </section>

            {/* EXPERIENCE & VIP SECTION */}
            <section id="experience" className="premium-section premium-experience">
              <div>
                <PremiumHeading
                  eyebrow="Service d'Exception"
                  title={config.title}
                  subtitle={config.subtitle}
                />
                <Reveal as="div" className="premium-experience-list">
                  {groups.map(([cat, items]) => (
                    <article key={cat}>
                      <span>{cat}</span>
                      <strong>
                        {items
                          .slice(0, 3)
                          .map((item) => item.name)
                          .join(" · ")}
                      </strong>
                    </article>
                  ))}
                  <article>
                    <span>Adresse</span>
                    <strong>{restaurant.address ?? restaurant.city}</strong>
                  </article>
                  <article>
                    <span>Horaires d'Ouverture</span>
                    <strong>{restaurant.hours ?? "Tous les jours · 11h00 — 23h30"}</strong>
                  </article>
                  <article>
                    <span>Ligne Directe</span>
                    <strong>{restaurant.phone}</strong>
                  </article>
                </Reveal>
              </div>

              <div className="premium-chef-card">
                <div className="premium-chef-image">
                  {gallery[0]?.image_url ? (
                    <StorageImage
                      path={gallery[0].image_url}
                      alt={gallery[0].caption ?? restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img src={config.background} alt="Ambiance prestige" />
                  )}
                </div>
                <h3>Table d'Honneur & VIP</h3>
                <p>
                  Salons climatisés, ambiance feutrée, sonorisation douce, service de sommelier et
                  tables personnalisées pour vos déjeuners et dîners.
                </p>
              </div>
            </section>

            {/* GALLERY SHOWCASE */}
            <section id="galerie" className="premium-section">
              <PremiumHeading
                eyebrow="Galerie Photographique"
                title="Cadre, Cuisine & Instants Chaleureux"
                subtitle="Cliquez sur une photo pour l'agrandir en plein écran."
              />
              <Reveal as="div" className="premium-gallery">
                {(gallery.length
                  ? gallery.slice(0, 8)
                  : [{ id: "bg", image_url: config.background, caption: restaurant.name }]
                ).map((photo, idx) => (
                  <figure
                    key={photo.id ?? idx}
                    onClick={() => setActiveLightboxIndex(idx)}
                    className="cursor-pointer group relative overflow-hidden rounded-xl border border-white/10"
                  >
                    {photo.image_url.startsWith("/") ? (
                      <img
                        src={photo.image_url}
                        alt={photo.caption ?? restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <StorageImage
                        path={photo.image_url}
                        alt={photo.caption ?? restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="premium-gallery-overlay">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                    {photo.caption && <figcaption>{photo.caption}</figcaption>}
                  </figure>
                ))}
              </Reveal>
            </section>

            {/* RESERVATION FORM */}
            <section id="reservation" className="premium-reservation">
              <div className="premium-reservation-inner">
                <PremiumHeading
                  eyebrow="Réservation de Table"
                  title="Réservez Votre Table en Quelques Clics"
                  subtitle="Une confirmation instantanée et une organisation irréprochable pour votre arrivée."
                />
                <div className="premium-reservation-layout">
                  <PremiumReservationForm restaurant={restaurant} config={config} />
                  <aside className="premium-qr-card">
                    <h3>QR Code de la Page</h3>
                    <p>Faites scanner ce code pour ouvrir le menu interactif instantanément.</p>
                    {qr ? (
                      <img src={qr} alt={`QR code ${restaurant.name}`} />
                    ) : (
                      <div className="premium-qr-placeholder">QR</div>
                    )}
                    <div className="premium-contact-mini">
                      <span>📞 {restaurant.phone}</span>
                      <span>✉️ {restaurant.email}</span>
                      <span>📍 {restaurant.address ?? restaurant.city}</span>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            {/* REVIEWS SECTION */}
            <section id="avis" className="premium-section">
              <PremiumHeading
                eyebrow="Appréciations & Avis"
                title="Ce que Pensent nos Gourmets"
                subtitle="La satisfaction de nos clients est notre meilleure distinction."
              />
              <ReviewList reviews={reviews} theme={theme} />
              <div className="premium-review-form">
                <ReviewForm restaurantId={restaurant.id} theme={theme} />
              </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="premium-footer">
        <div>
          <strong>{restaurant.name}</strong>
          <span>
            {restaurant.cuisine ?? "Restaurant"} · {restaurant.city}
          </span>
        </div>
        <div>
          <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
          <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <FloatingWhatsApp href={waHref} accent={config.accent} ink={config.ink} />

      {/* MOBILE BOTTOM TOOLBAR */}
      <div className="premium-mobile-bar">
        <a href={buildViewHref("menu")} className="premium-mob-btn">
          <Utensils className="w-4 h-4 text-[#f0d48a]" />
          <span>Menu</span>
        </a>
        <a href={buildViewHref("reservation")} className="premium-mob-btn highlight">
          <Calendar className="w-4 h-4" />
          <span>Réserver</span>
        </a>
        {waHref && (
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="premium-mob-btn wa">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </a>
        )}
      </div>

      {/* DISH DETAIL MODAL */}
      {openDish && (
        <PremiumDishModal dish={openDish} config={config} onClose={() => setOpenDish(null)} />
      )}

      {/* LIGHTBOX MODAL CAROUSEL */}
      {activeLightboxIndex !== null && (
        <PremiumLightbox
          images={galleryList}
          index={activeLightboxIndex}
          restaurantName={restaurant.name}
          onClose={() => setActiveLightboxIndex(null)}
          onChangeIndex={(idx) => setActiveLightboxIndex(idx)}
        />
      )}
    </div>
  );
}

function PremiumHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Reveal as="header" className="premium-heading">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{subtitle}</span>
    </Reveal>
  );
}

function SignatureCard({
  dish,
  config,
  onClick,
}: {
  dish: PublicMenuItem;
  config: PremiumConfig;
  onClick: () => void;
}) {
  return (
    <TiltCard3D onClick={onClick}>
      <article className="premium-signature-card">
        <div>
          {dish.image_url ? (
            <StorageImage
              path={dish.image_url}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={config.background} alt={dish.name} />
          )}
        </div>
        <footer>
          <small>{dish.category}</small>
          <strong>{dish.name}</strong>
          <span>{fmtPrice(dish.price)}</span>
        </footer>
      </article>
    </TiltCard3D>
  );
}

/** INTERACTIVE RICH DISH MODAL */
function PremiumDishModal({
  dish,
  config,
  onClose,
}: {
  dish: PublicMenuItem;
  config: PremiumConfig;
  onClose: () => void;
}) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [spiciness, setSpiciness] = useState<number>(1);
  const [side, setSide] = useState<string>("Frites Maison");
  const [notes, setNotes] = useState<string>("");

  const sideOptions = [
    "Frites Maison",
    "Riz Parfumé",
    "Alloco Banane",
    "Attiéké Frais",
    "Légumes Sautés",
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 350,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(0,0,0,.85)",
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--pr-surface)",
          border: "1px solid var(--pr-border)",
          borderRadius: "var(--pr-radius)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.8)",
        }}
      >
        <div
          style={{
            position: "relative",
            height: 260,
            overflow: "hidden",
            background: "var(--pr-bg)",
          }}
        >
          {dish.image_url ? (
            <StorageImage
              path={dish.image_url}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "var(--pr-accent)",
                fontFamily: "var(--pr-serif)",
                fontSize: 28,
              }}
            >
              {dish.category}
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(0,0,0,.6)",
              color: "#fff",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 28 }}>
          <small
            style={{
              color: "var(--pr-accent)",
              textTransform: "uppercase",
              letterSpacing: ".22em",
              fontWeight: 900,
              fontSize: 11,
            }}
          >
            {dish.category}
          </small>

          <h3
            style={{
              fontFamily: "var(--pr-serif)",
              fontSize: 30,
              color: "var(--pr-text)",
              margin: "6px 0 10px",
            }}
          >
            {dish.name}
          </h3>

          {dish.description && (
            <p
              style={{
                color: "var(--pr-muted)",
                lineHeight: 1.65,
                fontSize: 14,
                margin: "0 0 18px",
              }}
            >
              {dish.description}
            </p>
          )}

          {/* Spiciness Level Selector */}
          <div className="mb-4 p-3 rounded-xl bg-black/30 border border-white/10">
            <span className="text-[11px] font-black uppercase text-[#f0d48a] tracking-wider block mb-2">
              🌶️ Niveau de Piment / Épices
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { lvl: 0, label: "Doux" },
                { lvl: 1, label: "Moyen" },
                { lvl: 2, label: "Épicé" },
                { lvl: 3, label: "Extra Feu" },
              ].map(({ lvl, label }) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setSpiciness(lvl)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    spiciness === lvl
                      ? "bg-[#f0d48a] text-black border-[#f0d48a]"
                      : "bg-white/5 text-white/70 border-white/10 hover:border-white/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Accompaniment Choice */}
          <div className="mb-4 p-3 rounded-xl bg-black/30 border border-white/10">
            <span className="text-[11px] font-black uppercase text-[#f0d48a] tracking-wider block mb-2">
              🍚 Accompagnement Préféré
            </span>
            <div className="flex flex-wrap gap-2">
              {sideOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setSide(opt)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                    side === opt
                      ? "bg-[#f0d48a] text-black border-[#f0d48a]"
                      : "bg-white/5 text-white/70 border-white/10 hover:border-white/30"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin: "20px 0",
              padding: "14px 18px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: "calc(var(--pr-radius) * 0.7)",
              border: "1px solid var(--pr-border)",
            }}
          >
            <strong style={{ color: "var(--pr-accent)", fontSize: 26 }}>
              {fmtPrice(dish.price * qty)}
            </strong>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1px solid var(--pr-border)",
                  background: "rgba(255,255,255,0.08)",
                  color: "var(--pr-text)",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                -
              </button>

              <span style={{ color: "var(--pr-text)", fontWeight: 900, fontSize: 16 }}>{qty}</span>

              <button
                onClick={() => setQty((q) => q + 1)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1px solid var(--pr-border)",
                  background: "rgba(255,255,255,0.08)",
                  color: "var(--pr-text)",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {cart && (
              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++) {
                    cart.addItem(dish.id);
                  }
                  toast.success(`${qty}x ${dish.name} (${side}) ajouté au panier !`);
                  onClose();
                }}
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: "var(--pr-accent)",
                  color: "var(--pr-ink)",
                  padding: "16px",
                  borderRadius: 999,
                  fontWeight: 900,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px color-mix(in oklab, var(--pr-accent) 40%, transparent)",
                }}
              >
                Ajouter au Panier ({fmtPrice(dish.price * qty)})
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: "16px 22px",
                border: "1px solid var(--pr-border)",
                borderRadius: 999,
                background: "transparent",
                color: "var(--pr-text)",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** LIGHTBOX CAROUSEL MODAL */
function PremiumLightbox({
  images,
  index,
  restaurantName,
  onClose,
  onChangeIndex,
}: {
  images: PublicGalleryImage[];
  index: number;
  restaurantName: string;
  onClose: () => void;
  onChangeIndex: (newIndex: number) => void;
}) {
  const current = images[index];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChangeIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onChangeIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, images.length, onClose, onChangeIndex]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[400] bg-black/92 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={() => onChangeIndex((index - 1 + images.length) % images.length)}
            className="absolute left-2 sm:-left-14 top-120 sm:top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 border border-white/20 text-white hover:bg-[#f0d48a] hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-xl z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={() => onChangeIndex((index + 1) % images.length)}
            className="absolute right-2 sm:-right-14 top-120 sm:top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 border border-white/20 text-white hover:bg-[#f0d48a] hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-xl z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image Display */}
        <div className="w-full h-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
          {current.image_url.startsWith("/") ? (
            <img
              src={current.image_url}
              alt={current.caption ?? restaurantName}
              className="w-full h-full object-contain max-h-[78vh]"
            />
          ) : (
            <StorageImage
              path={current.image_url}
              alt={current.caption ?? restaurantName}
              className="w-full h-full object-contain max-h-[78vh]"
            />
          )}
        </div>

        {/* Caption & Counter */}
        <div className="mt-4 flex items-center gap-4 bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
          <span className="text-xs font-black text-[#f0d48a]">
            {index + 1} / {images.length}
          </span>
          {current.caption && (
            <p className="text-sm font-bold text-white border-l border-white/20 pl-4">
              {current.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PremiumReservationForm({
  restaurant,
  config,
}: {
  restaurant: TemplateProps["restaurant"];
  config: PremiumConfig;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    reservation_date: new Date().toISOString().split("T")[0],
    reservation_time: "20:00",
    party_size: 2,
    occasion: "Dîner Romantique",
    seating: "Terrasse Panoramique",
    service: "Service Standard",
    allergies: "",
    notes: "",
  });

  const times = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

  const seatingOptions = [
    {
      id: "Terrasse Panoramique",
      label: "Terrasse Panoramique",
      desc: "Vue Coucher de Soleil",
      icon: "🌅",
    },
    {
      id: "Salon Climatisé VIP",
      label: "Salon VIP Climatisé",
      desc: "Ambiance Intimiste & Calme",
      icon: "👑",
    },
    {
      id: "Table Proche Scène",
      label: "Scène & Animation",
      desc: "Ambiance Musique Live",
      icon: "🎵",
    },
    {
      id: "Coin Calme & Discret",
      label: "Coin Discret",
      desc: "Pour Affaires & Romantique",
      icon: "🕯️",
    },
  ];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !form.customer_name ||
      !form.customer_phone ||
      !form.reservation_date ||
      !form.reservation_time
    ) {
      toast.error("Veuillez remplir votre nom, téléphone, date et heure.");
      return;
    }

    setBusy(true);

    const details = [
      `Occasion: ${form.occasion}`,
      `Placement: ${form.seating}`,
      `Service: ${form.service}`,
      form.allergies ? `Allergies: ${form.allergies}` : null,
      form.notes ? `Notes: ${form.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase.from("reservations").insert({
      restaurant_id: restaurant.id,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      reservation_date: form.reservation_date,
      reservation_time: form.reservation_time,
      party_size: Number(form.party_size),
      notes: details,
    });

    setBusy(false);

    if (error) {
      toast.error("Erreur réservation : " + error.message);
      return;
    }

    toast.success("Votre réservation VIP a été confirmée !");

    // Send WhatsApp notification
    const whatsappPhone = restaurant.whatsapp?.replace(/\D/g, "");
    if (whatsappPhone) {
      const waText = encodeURIComponent(
        `👑 *NOUVELLE RÉSERVATION TABLE VIP*\n\n` +
          `• Nom : ${form.customer_name}\n` +
          `• Tél : ${form.customer_phone}\n` +
          `• Date : ${form.reservation_date} à ${form.reservation_time}\n` +
          `• Personnes : ${form.party_size}\n` +
          `• Emplacement : ${form.seating}\n` +
          `• Occasion : ${form.occasion}\n` +
          (form.notes ? `• Message : ${form.notes}` : ""),
      );
      window.open(`https://wa.me/${whatsappPhone}?text=${waText}`, "_blank");
    }

    setForm({
      customer_name: "",
      customer_phone: "",
      reservation_date: new Date().toISOString().split("T")[0],
      reservation_time: "20:00",
      party_size: 2,
      occasion: "Dîner Romantique",
      seating: "Terrasse Panoramique",
      service: "Service Standard",
      allergies: "",
      notes: "",
    });
  };

  return (
    <form className="premium-form" onSubmit={submit}>
      <div className="premium-form-row">
        <label>
          Nom Complet
          <input
            required
            placeholder="Ex: Ouedraogo Jean"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          />
        </label>

        <label>
          Téléphone WhatsApp
          <input
            required
            type="tel"
            placeholder="Ex: +226 70 00 00 00"
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          />
        </label>
      </div>

      <div className="premium-form-row">
        <label>
          Date de Réservation
          <input
            required
            type="date"
            value={form.reservation_date}
            onChange={(e) => setForm({ ...form, reservation_date: e.target.value })}
          />
        </label>

        <label>
          Nombre de Personnes
          <input
            type="number"
            min={1}
            max={80}
            value={form.party_size}
            onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })}
          />
        </label>
      </div>

      {/* Interactive Seating Area Selector */}
      <div>
        <span className="text-[11px] font-black uppercase text-[#f0d48a] tracking-wider mb-2 block">
          Zone & Ambiances de Table Préférées
        </span>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {seatingOptions.map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => setForm({ ...form, seating: opt.id })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                form.seating === opt.id
                  ? "bg-[#f0d48a]/15 border-[#f0d48a] text-white shadow-lg shadow-[#f0d48a]/10"
                  : "bg-black/30 border-white/10 text-white/70 hover:border-white/30"
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <div>
                <strong className="block text-xs font-bold text-white">{opt.label}</strong>
                <span className="text-[10px] text-white/60">{opt.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[11px] font-black uppercase text-[#f0d48a] tracking-wider mb-2 block">
          Heure souhaitée
        </span>
        <div className="premium-time-grid">
          {times.map((time) => (
            <button
              type="button"
              key={time}
              className={form.reservation_time === time ? "active" : ""}
              onClick={() => setForm({ ...form, reservation_time: time })}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div className="premium-form-row">
        <label>
          Occasion
          <select
            value={form.occasion}
            onChange={(e) => setForm({ ...form, occasion: e.target.value })}
          >
            <option>Dîner Romantique</option>
            <option>Anniversaire / Fête</option>
            <option>Déjeuner d'Affaires</option>
            <option>Retrouvailles de Famille</option>
            <option>Événement Privé / VIP</option>
          </select>
        </label>

        <label>
          Type de Service
          <select
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
          >
            <option>Service Standard À la carte</option>
            <option>Menu Dégustation Chef</option>
            <option>Buffet Prestige / Groupe</option>
          </select>
        </label>
      </div>

      <label>
        Consignes ou demandes particulières
        <textarea
          placeholder="Régime alimentaire, bougie d'anniversaire, allergies..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        style={{
          background: `linear-gradient(135deg, ${config.accent}, ${config.accent2})`,
          color: config.ink,
        }}
      >
        {busy ? "Confirmation en cours..." : "👑 Confirmer la Réservation VIP"}
      </button>
    </form>
  );
}

const PREMIUM_CSS = `
.premium-page{position:relative;min-height:100vh;overflow:hidden;font-family:Inter,system-ui,sans-serif;isolation:isolate;background:var(--pr-bg);}
.premium-bg{position:fixed;inset:0;z-index:-2;overflow:hidden;background:var(--pr-bg);}
.premium-bg img{width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.15);transform:scale(1.08);animation:premium-bg-drift 22s ease-in-out infinite alternate;}
.premium-bg span{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.52),rgba(0,0,0,.9)),radial-gradient(circle at 50% 15%,color-mix(in oklab,var(--pr-accent) 24%,transparent),transparent 45%);}

.premium-nav{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px clamp(18px,4vw,56px);background:color-mix(in oklab,var(--pr-bg) 80%,transparent);border-bottom:1px solid var(--pr-border);backdrop-filter:blur(20px);}
.premium-brand{display:grid;text-decoration:none;color:var(--pr-text);min-width:0}
.premium-brand span{font-family:var(--pr-serif);font-size:clamp(22px,3vw,34px);line-height:1;font-weight:700}
.premium-brand small{color:var(--pr-accent);font-size:10px;text-transform:uppercase;letter-spacing:.24em;margin-top:4px}
.premium-nav nav{display:flex;gap:22px}
.premium-nav nav a{color:var(--pr-muted);font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:.18em;position:relative;padding-bottom:3px;transition:color .25s;font-weight:700}
.premium-nav nav a::after{content:"";position:absolute;left:0;right:100%;bottom:0;height:2px;background:var(--pr-accent);transition:right .3s cubic-bezier(.16,1,.3,1)}
.premium-nav nav a:hover,.premium-nav nav a.active{color:var(--pr-accent)}
.premium-nav nav a:hover::after,.premium-nav nav a.active::after{right:0}

.premium-book{background:var(--pr-accent);color:var(--pr-ink);padding:10px 20px;border-radius:999px;font-weight:900;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:.12em;border:1px solid var(--pr-accent);transition:transform .18s,box-shadow .25s;display:inline-flex;align-items:center;gap:8px;box-shadow:0 0 0 0 color-mix(in oklab,var(--pr-accent) 60%,transparent);}
.premium-book:hover{box-shadow:0 6px 24px color-mix(in oklab,var(--pr-accent) 55%,transparent);transform:translateY(-2px)}
.premium-book:active{transform:scale(.93) translateY(0)}

.premium-hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;z-index:30}
.premium-hamburger-line{width:22px;height:2px;background:var(--pr-text);transition:all .3s;border-radius:2px}
.premium-hamburger-line.open:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
.premium-hamburger-line.open:nth-child(2){opacity:0}
.premium-hamburger-line.open:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}

.premium-mob-menu{display:flex;position:sticky;top:60px;background:color-mix(in oklab,var(--pr-bg) 95%,transparent);backdrop-filter:blur(22px);border-bottom:1px solid var(--pr-border);padding:16px;z-index:35;flex-direction:column;gap:8px}
.premium-mob-menu a{color:var(--pr-text);text-decoration:none;font-size:14px;font-weight:700;padding:12px 16px;border-radius:10px;transition:background .2s;border:1px solid transparent}
.premium-mob-menu a:hover{background:rgba(255,255,255,.08);border-color:var(--pr-border)}

.premium-hero{min-height:calc(100vh - 74px);display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,420px);align-items:center;gap:40px;padding:clamp(60px,8vw,120px) clamp(18px,5vw,72px) 54px;}
.premium-hero-copy{max-width:860px}
.premium-kicker{color:var(--pr-accent);font-size:11px;text-transform:uppercase;letter-spacing:.36em;font-weight:900;margin-bottom:18px}
.premium-hero h1{font-family:var(--pr-serif);font-size:clamp(54px,11vw,130px);line-height:.88;margin:0;text-wrap:balance;text-shadow:0 18px 60px rgba(0,0,0,.75)}
.premium-lead{max-width:680px;color:var(--pr-muted);font-size:clamp(16px,2vw,22px);line-height:1.7;margin:24px 0 0}

.premium-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:32px}
.premium-btn-main{background:var(--pr-accent);color:var(--pr-ink);padding:14px 28px;border-radius:999px;font-weight:900;text-decoration:none;font-size:13px;text-transform:uppercase;letter-spacing:.12em;border:1px solid var(--pr-accent);transition:transform .18s,box-shadow .25s;box-shadow:0 8px 25px color-mix(in oklab,var(--pr-accent) 45%,transparent)}
.premium-btn-main:hover{transform:translateY(-2px);box-shadow:0 12px 35px color-mix(in oklab,var(--pr-accent) 60%,transparent)}
.premium-btn-sec{border:1px solid var(--pr-border);color:var(--pr-text);background:rgba(255,255,255,.05);padding:14px 24px;border-radius:999px;text-decoration:none;font-size:13px;font-weight:800;transition:transform .18s,border-color .25s,background .25s}
.premium-btn-sec:hover{border-color:var(--pr-accent);background:rgba(255,255,255,.1);transform:translateY(-2px)}
.premium-btn-wa{border:1px solid rgba(16,185,129,0.4);color:#ffffff;background:rgba(16,185,129,0.15);padding:14px 24px;border-radius:999px;text-decoration:none;font-size:13px;font-weight:800;display:inline-flex;align-items:center;gap:8px;transition:transform .18s,background .25s}
.premium-btn-wa:hover{background:rgba(16,185,129,0.3);transform:translateY(-2px)}

.premium-hero-panel{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.premium-hero-panel div{background:var(--pr-surface);border:1px solid var(--pr-border);padding:18px 12px;backdrop-filter:blur(16px);border-radius:var(--pr-radius);text-align:center}
.premium-hero-panel span{display:block;font-family:var(--pr-serif);font-size:32px;color:var(--pr-accent);line-height:1;font-weight:800}
.premium-hero-panel small{color:var(--pr-muted);font-size:10px;text-transform:uppercase;letter-spacing:.14em;font-weight:800;margin-top:6px;display:block}

.premium-strip{display:grid;grid-template-columns:repeat(6,1fr);border-top:1px solid var(--pr-border);border-bottom:1px solid var(--pr-border);background:color-mix(in oklab,var(--pr-bg) 80%,transparent);backdrop-filter:blur(18px);}
.premium-strip article{padding:26px 20px;border-right:1px solid var(--pr-border);display:grid;gap:8px;transition:background .3s}
.premium-strip article:hover{background:color-mix(in oklab,var(--pr-accent) 10%,transparent)}
.premium-strip b{font-size:26px}
.premium-strip strong{color:var(--pr-text);font-size:14px}
.premium-strip span{color:var(--pr-muted);font-size:12px;line-height:1.45}

.premium-section{padding:96px clamp(18px,5vw,72px);position:relative}
.premium-heading{max-width:820px;margin-bottom:38px}
.premium-heading p{color:var(--pr-accent);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.34em;margin-bottom:12px}
.premium-heading h2{font-family:var(--pr-serif);font-size:clamp(36px,6vw,74px);line-height:.96;margin:0;color:var(--pr-text)}
.premium-heading span{display:block;color:var(--pr-muted);margin-top:14px;font-size:16px;line-height:1.65}

.premium-search-box{position:relative;max-width:600px;margin-bottom:24px}
.premium-search-icon{position:absolute;left:18px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--pr-accent)}
.premium-search-box input{width:100%;padding:14px 48px 14px 48px;background:var(--pr-surface);border:1px solid var(--pr-border);border-radius:999px;color:var(--pr-text);font-size:13px;outline:none;backdrop-filter:blur(16px);transition:border-color .2s}
.premium-search-box input:focus{border-color:var(--pr-accent)}
.premium-search-clear{position:absolute;right:18px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--pr-muted);cursor:pointer}

.premium-signatures{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:38px}
.premium-signature-card{position:relative;min-height:340px;overflow:hidden;border:1px solid var(--pr-border);background:var(--pr-surface);border-radius:var(--pr-radius);transition:transform .3s,box-shadow .3s,border-color .3s}
.premium-signature-card:hover{transform:translateY(-6px);border-color:var(--pr-accent);box-shadow:0 18px 45px color-mix(in oklab,var(--pr-accent) 26%,transparent)}
.premium-signature-card>div{position:absolute;inset:0}
.premium-signature-card img{width:100%;height:100%;object-fit:cover;transition:transform .8s}
.premium-signature-card:hover img{transform:scale(1.08)}
.premium-signature-card:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88),transparent 58%)}
.premium-signature-card footer{position:absolute;inset:auto 0 0;padding:20px;z-index:1}
.premium-signature-card small,.premium-menu-grid small{color:var(--pr-accent);text-transform:uppercase;letter-spacing:.2em;font-size:10px;font-weight:900}
.premium-signature-card strong{display:block;color:var(--pr-text);font-size:19px;margin:6px 0}
.premium-signature-card span{color:var(--pr-accent);font-weight:900;font-size:16px}

.premium-tabs{display:flex;gap:10px;overflow-x:auto;margin-bottom:24px;padding-bottom:6px}
.premium-tabs button{border:1px solid var(--pr-border);background:rgba(255,255,255,.04);color:var(--pr-muted);padding:11px 18px;border-radius:999px;font-weight:800;cursor:pointer;transition:transform .15s,box-shadow .2s,border-color .2s,background .2s,color .2s;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;font-size:12px}
.premium-tabs button.active,.premium-tabs button:hover{background:var(--pr-accent);border-color:var(--pr-accent);color:var(--pr-ink);box-shadow:0 4px 18px color-mix(in oklab,var(--pr-accent) 45%,transparent)}
.premium-tabs button small{opacity:.75;font-size:10px;font-weight:900}

.premium-time-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.premium-time-grid button{border:1px solid var(--pr-border);background:rgba(0,0,0,.25);color:var(--pr-muted);padding:12px;border-radius:12px;font-weight:800;cursor:pointer;transition:all .2s;font-size:12px}
.premium-time-grid button.active,.premium-time-grid button:hover{background:var(--pr-accent);border-color:var(--pr-accent);color:var(--pr-ink);font-weight:900}

.premium-menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.premium-menu-grid article{display:grid;gap:18px;background:var(--pr-surface);border:1px solid var(--pr-border);padding:22px;backdrop-filter:blur(16px);border-radius:var(--pr-radius);transition:transform .25s,box-shadow .25s,border-color .25s}
.premium-menu-grid article:hover{border-color:var(--pr-accent);box-shadow:0 12px 34px color-mix(in oklab,var(--pr-accent) 20%,transparent);transform:translateY(-3px)}
.premium-menu-grid h3{color:var(--pr-text);margin:6px 0 6px;font-size:21px;font-family:var(--pr-serif)}
.premium-menu-grid p{color:var(--pr-muted);line-height:1.6;font-size:14px;margin:0}
.premium-menu-grid footer{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--pr-border);padding-top:16px}
.premium-menu-grid strong{color:var(--pr-accent);font-size:19px;font-weight:900}
.premium-menu-grid button{color:var(--pr-text);border:1px solid var(--pr-border);padding:9px 16px;border-radius:999px;font-size:12px;font-weight:800;background:transparent;transition:all .2s}
.premium-menu-grid button:hover{border-color:var(--pr-accent);background:var(--pr-accent);color:var(--pr-ink);box-shadow:0 4px 16px color-mix(in oklab,var(--pr-accent) 40%,transparent)}

.premium-experience{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:40px;align-items:start;background:linear-gradient(180deg,transparent,rgba(0,0,0,.3),transparent)}
.premium-experience-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.premium-experience-list article,.premium-chef-card,.premium-qr-card,.premium-form,.premium-review-form{background:var(--pr-surface);border:1px solid var(--pr-border);backdrop-filter:blur(18px);border-radius:var(--pr-radius)}
.premium-experience-list article{padding:20px}
.premium-experience-list span{display:block;color:var(--pr-accent);font-size:10px;text-transform:uppercase;letter-spacing:.22em;font-weight:900;margin-bottom:8px}
.premium-experience-list strong{color:var(--pr-text);font-size:14px;line-height:1.5}

.premium-chef-card{padding:20px}
.premium-chef-image{height:380px;overflow:hidden;border:1px solid var(--pr-border);margin-bottom:20px;border-radius:var(--pr-radius)}
.premium-chef-image img{width:100%;height:100%;object-fit:cover}
.premium-chef-card h3{font-family:var(--pr-serif);font-size:36px;margin:0 0 10px;color:var(--pr-text)}
.premium-chef-card p{color:var(--pr-muted);line-height:1.7;font-size:14px}

.premium-gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.premium-gallery figure{height:280px;margin:0;position:relative;overflow:hidden;border:1px solid var(--pr-border);background:var(--pr-surface);border-radius:var(--pr-radius)}
.premium-gallery figure:nth-child(3n+1){height:360px}
.premium-gallery img{width:100%;height:100%;object-fit:cover;transition:transform .8s}
.premium-gallery figure:hover img{transform:scale(1.08)}
.premium-gallery-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.4);display:grid;place-items:center;opacity:0;transition:opacity .3s}
.premium-gallery figure:hover .premium-gallery-overlay{opacity:1}
.premium-gallery figcaption{position:absolute;left:14px;right:14px;bottom:14px;color:var(--pr-text);font-size:12px;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1)}

.premium-reservation{padding:96px clamp(18px,5vw,72px);background:linear-gradient(135deg,color-mix(in oklab,var(--pr-accent-2) 32%,transparent),rgba(0,0,0,.5));border-block:1px solid var(--pr-border)}
.premium-reservation-inner{max-width:1320px;margin:auto}
.premium-reservation-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:26px}

.premium-form{padding:28px;display:grid;gap:16px}
.premium-form-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.premium-form label{display:grid;gap:8px;color:var(--pr-muted);font-size:11px;text-transform:uppercase;letter-spacing:.16em;font-weight:900}
.premium-form input,.premium-form select,.premium-form textarea{width:100%;border:1px solid var(--pr-border);background:rgba(0,0,0,.3);color:var(--pr-text);padding:14px 16px;border-radius:calc(var(--pr-radius) * 0.7);outline:none;font:inherit;text-transform:none;letter-spacing:0}
.premium-form textarea{min-height:90px;resize:vertical}
.premium-form input:focus,.premium-form select:focus,.premium-form textarea:focus{border-color:var(--pr-accent)}

.premium-form>button{border:0;border-radius:999px;padding:18px 24px;font-weight:950;text-transform:uppercase;letter-spacing:.16em;cursor:pointer;background:var(--pr-accent);color:var(--pr-ink);transition:transform .18s,box-shadow .25s;box-shadow:0 8px 25px color-mix(in oklab,var(--pr-accent) 50%,transparent);margin-top:10px}
.premium-form>button:hover{box-shadow:0 12px 35px color-mix(in oklab,var(--pr-accent) 65%,transparent);transform:translateY(-2px)}

.premium-qr-card{padding:26px;text-align:center}
.premium-qr-card h3{font-family:var(--pr-serif);font-size:32px;margin:0 0 10px;color:var(--pr-text)}
.premium-qr-card p{color:var(--pr-muted);line-height:1.6;font-size:14px}
.premium-qr-card img,.premium-qr-placeholder{width:220px;height:220px;margin:20px auto;background:var(--pr-accent);padding:14px;border-radius:calc(var(--pr-radius) * 1.4);box-shadow:0 10px 30px rgba(0,0,0,0.5)}
.premium-qr-placeholder{display:grid;place-items:center;color:var(--pr-ink);font-weight:900;font-size:40px}
.premium-contact-mini{display:grid;gap:10px;text-align:left;color:var(--pr-muted);font-size:12px;margin-top:20px;padding-top:16px;border-top:1px solid var(--pr-border)}

.premium-review-form{padding:26px;margin-top:30px;max-width:760px}
.premium-footer{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:40px clamp(18px,5vw,72px);border-top:1px solid var(--pr-border);background:var(--pr-bg)}
.premium-footer strong{display:block;font-family:var(--pr-serif);font-size:32px;color:var(--pr-accent)}
.premium-footer span,.premium-footer a{display:block;color:var(--pr-muted);text-decoration:none;margin-top:6px}

.premium-mobile-bar{display:none;position:fixed;bottom:0;left:0;right:0;z-index:50;background:color-mix(in oklab,var(--pr-bg) 92%,transparent);backdrop-filter:blur(20px);border-top:1px solid var(--pr-border);padding:10px 16px;justify-content:space-around;align-items:center}
.premium-mob-btn{display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--pr-muted);text-decoration:none;font-size:10px;font-weight:800;position:relative}
.premium-mob-btn.highlight{color:var(--pr-ink);background:var(--pr-accent);padding:8px 16px;border-radius:999px;flex-direction:row;gap:6px;font-size:11px}
.premium-mob-btn.cart-badge .count{position:absolute;-top-8;right:-6px;background:#ef4444;color:#fff;font-size:9px;font-weight:900;width:16px;height:16px;border-radius:50%;display:grid;place-items:center}

.premium-luxe .premium-hero h1{background:linear-gradient(115deg,var(--pr-text) 20%,var(--pr-accent) 42%,var(--pr-text) 58%,var(--pr-accent) 80%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:premium-luxe-shine 9s ease-in-out infinite}
@keyframes premium-luxe-shine{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes premium-bg-drift{0%{transform:scale(1.08) translate3d(-1.5%,0,0)}100%{transform:scale(1.18) translate3d(1.5%,-1.5%,0)}}

@keyframes spin-slow{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.animate-spin-slow{animation:spin-slow 28s linear infinite}
.perspective-1000{perspective:1000px}

@media(max-width:980px){
  .premium-nav nav{display:none}
  .premium-hamburger{display:flex}
  .premium-hero,.premium-experience,.premium-reservation-layout{grid-template-columns:1fr}
  .premium-strip{grid-template-columns:repeat(3,1fr)}
  .premium-signatures,.premium-gallery{grid-template-columns:repeat(2,1fr)}
  .premium-menu-grid{grid-template-columns:1fr}
  .premium-hero{min-height:auto;padding-top:90px}
  .premium-hero-panel{grid-template-columns:repeat(3,1fr)}
  .premium-mobile-bar{display:flex}
}

@media(max-width:620px){
  .premium-nav{padding:12px 16px}
  .premium-book{display:none}
  .premium-hero{padding:82px 16px 36px;gap:24px}
  .premium-hero h1{font-size:clamp(38px,11vw,56px);line-height:.96}
  .premium-lead{font-size:15px;margin-top:16px}
  .premium-actions{margin-top:22px;gap:10px}
  .premium-actions a{padding:12px 18px;font-size:12px}
  .premium-hero-panel{grid-template-columns:repeat(3,1fr);gap:8px}
  .premium-hero-panel div{padding:12px 8px;text-align:center}
  .premium-hero-panel span{font-size:22px}
  .premium-hero-panel small{font-size:9px;letter-spacing:.08em}
  .premium-strip{grid-template-columns:repeat(2,1fr)}
  .premium-strip article{padding:16px 14px}
  .premium-section{padding:48px 16px}
  .premium-heading h2{font-size:clamp(28px,8vw,42px)}
  .premium-signatures{grid-template-columns:repeat(2,1fr);gap:10px}
  .premium-signature-card{min-height:200px}
  .premium-experience-list,.premium-form-row{grid-template-columns:repeat(2,1fr)}
  .premium-time-grid{grid-template-columns:repeat(3,1fr)}
  .premium-gallery{grid-template-columns:repeat(2,1fr);gap:10px}
  .premium-gallery figure,.premium-gallery figure:nth-child(3n+1){height:160px}
  .premium-reservation{padding:48px 16px}
  .premium-form{padding:20px}
  .premium-chef-image{height:240px}
  .premium-footer{padding:30px 16px;gap:18px;padding-bottom:80px}
}
`;
