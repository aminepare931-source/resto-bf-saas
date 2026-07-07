import * as React from "react";
import type { TemplateProps, PublicMenuItem, PublicGalleryImage, Theme } from "./shared";
import {
  MenuGrid,
  GalleryGrid,
  ReviewList,
  ReservationForm,
  AdvancedReservationForm,
  ReviewForm,
  SectionHead,
  FloatingWhatsApp,
  buildWhatsAppLink,
  avgRating,
  fmtPrice,
} from "./shared";
import { StorageImage } from "@/components/StorageImage";
import { TplPremiumFeu, TplPremiumLuxe, TplPremiumNuit, TplPremiumRoyal } from "./premium-templates";
import { useRestaurantFeatures } from "@/hooks/use-restaurant-features";

/* ============= Helpers ============= */

function pickCover(gallery: PublicGalleryImage[], menu: PublicMenuItem[]) {
  return gallery[0]?.image_url ?? menu.find((m) => m.image_url)?.image_url ?? null;
}

function signatureDishes(menu: PublicMenuItem[], n = 3) {
  return menu.filter((m) => m.available && m.image_url).slice(0, n);
}

function FontImport() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Archivo+Black&family=DM+Serif+Display&family=Space+Grotesk:wght@400;500;700&display=swap"
    />
  );
}

function MetaStrip({ items, theme }: { items: { label: string; value: React.ReactNode }[]; theme: Theme }) {
  return (
    <div
      className="grid sm:grid-cols-3 gap-x-8 gap-y-5"
      style={{ borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          className="py-5 sm:py-6 px-1"
          style={{
            borderLeft: i > 0 ? `1px solid ${theme.border}` : undefined,
            paddingLeft: i > 0 ? "2rem" : undefined,
          }}
        >
          <p
            className="text-[10px] font-bold uppercase mb-2"
            style={{ color: theme.accent, letterSpacing: "0.35em" }}
          >
            {it.label}
          </p>
          <div className="text-sm leading-relaxed" style={{ color: theme.text }}>
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function PoweredFooter({
  restaurant,
  wa,
  theme,
}: {
  restaurant: TemplateProps["restaurant"];
  wa: string | null;
  theme: Theme;
}) {
  return (
    <footer
      id="contact"
      style={{ background: theme.surfaceAlt, borderTop: `1px solid ${theme.border}`, color: theme.text }}
    >
      <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-2xl font-black mb-2" style={{ color: theme.accent }}>
            {restaurant.name}
          </h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {restaurant.cuisine ?? "Restaurant"} · {restaurant.city}
          </p>
          {restaurant.description && (
            <p className="mt-4 text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              {restaurant.description}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase mb-3" style={{ color: theme.accent, letterSpacing: "0.35em" }}>
            Visitez-nous
          </p>
          {restaurant.address && <p className="text-sm mb-2">{restaurant.address}</p>}
          <p className="text-sm whitespace-pre-line" style={{ color: theme.textMuted }}>
            {restaurant.hours ?? "Tous les jours · 11h — 23h"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase mb-3" style={{ color: theme.accent, letterSpacing: "0.35em" }}>
            Contact
          </p>
          <p className="text-sm">
            <a href={`tel:${restaurant.phone}`} className="hover:underline">{restaurant.phone}</a>
          </p>
          <p className="text-sm mt-1">
            <a href={`mailto:${restaurant.email}`} className="hover:underline">{restaurant.email}</a>
          </p>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm hover:opacity-90 transition"
              style={{ background: theme.accent, color: theme.accentInk, borderRadius: theme.radius }}
            >
              Commander sur WhatsApp
            </a>
          )}
        </div>
      </div>
      <div
        className="max-w-6xl mx-auto px-5 py-5 text-xs flex justify-between flex-wrap gap-2"
        style={{ borderTop: `1px solid ${theme.border}`, color: theme.textMuted }}
      >
        <span>© {new Date().getFullYear()} {restaurant.name}. Tous droits réservés.</span>
        <span>
          Site propulsé par{" "}
          <a href="/" className="underline" style={{ color: theme.accent }}>
            Resto BF
          </a>
        </span>
      </div>
    </footer>
  );
}

/* ================================================================== */
/*  1. NUIT — Dark luxury, premium par défaut                         */
/* ================================================================== */

export function TplNuit(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery } = props;
  const features = useRestaurantFeatures(restaurant.id, restaurant.plan);
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const cover = pickCover(gallery, menu);
  const signatures = signatureDishes(menu, 3);
  const rating = avgRating(reviews);
  const [mobOpen, setMobOpen] = useState(false);

  const theme: Theme = {
    bg: "#0a0907",
    surface: "#13110d",
    surfaceAlt: "#0e0c08",
    text: "#f0e6d0",
    textMuted: "rgba(240,230,208,0.6)",
    accent: "#c9a35a",
    accentInk: "#0a0907",
    border: "rgba(201,163,90,0.18)",
    radius: "2px",
  };

  return (
    <div className="min-h-screen" style={{ background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <FontImport />

      {/* NAV */}
      <header className="absolute top-0 inset-x-0 z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-6 h-px shrink-0" style={{ background: theme.accent }} />
            <span
              className="text-xs sm:text-sm uppercase truncate"
              style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.45em", color: theme.text }}
            >
              {restaurant.name}
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-[11px] uppercase" style={{ letterSpacing: "0.3em", color: theme.textMuted }}>
            <a href="#histoire" className="hover:text-[#c9a35a] transition-colors">Histoire</a>
            <a href="#carte" className="hover:text-[#c9a35a] transition-colors">Carte</a>
            <a href="#galerie" className="hover:text-[#c9a35a] transition-colors">Galerie</a>
            <a href="#reserver" className="hover:text-[#c9a35a] transition-colors">Réserver</a>
          </nav>
          <button
            onClick={() => setMobOpen((v) => !v)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
        {mobOpen && (
          <nav className="md:hidden border-t border-white/10 bg-[#0a0907]/95 backdrop-blur-xl">
            <div className="flex flex-col px-4 py-4 gap-1">
              <a href="#histoire" onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">Histoire</a>
              <a href="#carte" onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">Carte</a>
              <a href="#galerie" onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">Galerie</a>
              <a href="#reserver" onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">Réserver</a>
            </div>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {cover ? (
          <StorageImage path={cover} alt={restaurant.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : null}

        <div className="relative max-w-7xl mx-auto w-full px-5 sm:px-8 pb-20 pt-40">
          <p className="text-[10px] uppercase mb-6" style={{ color: theme.accent, letterSpacing: "0.55em" }}>
            {restaurant.city} · Établi·e dans la tradition
          </p>
          <h1
            className="leading-[0.88] italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: theme.text,
              fontSize: "clamp(3.5rem, 11vw, 9rem)",
              fontWeight: 500,
            }}
          >
            {restaurant.name}
          </h1>
          <div className="mt-8 grid lg:grid-cols-12 gap-8 items-end">
            <p className="lg:col-span-7 max-w-xl text-lg leading-relaxed" style={{ color: theme.textMuted }}>
              {restaurant.description ?? `Une expérience culinaire d'exception au cœur de ${restaurant.city}. Produits du terroir, savoir-faire artisanal, ambiance feutrée.`}
            </p>
            <div className="lg:col-span-5 flex flex-col gap-3">
              <a
                href="#carte"
                className="px-8 py-4 text-center border text-xs uppercase transition hover:bg-[#c9a35a] hover:text-[#0a0907]"
                style={{ borderColor: theme.accent, color: theme.accent, letterSpacing: "0.35em" }}
              >
                Découvrir la carte
              </a>
              {features.can_reserve && (
                <a
                  href="#reserver"
                  className="px-8 py-4 text-center text-xs uppercase hover:opacity-90 transition"
                  style={{ background: theme.accent, color: theme.accentInk, letterSpacing: "0.35em" }}
                >
                  Réserver une table
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* META */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <MetaStrip
          theme={theme}
          items={[
            { label: "Adresse", value: restaurant.address ?? restaurant.city },
            { label: "Horaires", value: <span className="whitespace-pre-line">{restaurant.hours ?? "Tous les jours · 11h — 23h"}</span> },
            { label: "Réservation", value: <a href={`tel:${restaurant.phone}`} className="hover:text-[#c9a35a]">{restaurant.phone}</a> },
          ]}
        />
      </div>

      {/* HISTOIRE */}
      <section id="histoire" className="py-14 sm:py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          <div className="lg:col-span-7">
            <p className="text-[10px] uppercase mb-4" style={{ color: theme.accent, letterSpacing: "0.45em" }}>— Notre maison —</p>
            <h2
              className="leading-[1.05] italic"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: theme.text, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 500 }}
            >
              Une cuisine <span style={{ color: theme.accent }}>d'auteur</span>,<br />une expérience à part.
            </h2>
            <p className="mt-8 text-lg leading-relaxed max-w-2xl" style={{ color: theme.textMuted }}>
              {restaurant.description ?? `Au cœur de ${restaurant.city}, ${restaurant.name} vous invite à une expérience culinaire mémorable. Produits choisis avec soin, savoir-faire à chaque assiette.`}
            </p>
          </div>
          <aside className="lg:col-span-5 lg:pl-10 lg:border-l space-y-8" style={{ borderColor: theme.border }}>
            <Stat label="Cuisine" value={restaurant.cuisine ?? "Traditionnelle"} theme={theme} />
            <Stat label="Plats à la carte" value={`${menu.filter((m) => m.available).length}+`} theme={theme} />
            {rating !== null && (
              <Stat
                label="Note moyenne"
                value={
                  <span>
                    {rating.toFixed(1)}<span style={{ color: theme.textMuted, fontSize: "0.6em" }}>/5 · {reviews.length} avis</span>
                  </span>
                }
                theme={theme}
              />
            )}
          </aside>
        </div>
      </section>

      {/* SIGNATURES */}
      {signatures.length > 0 && (
        <section className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-7xl mx-auto">
            <SectionHead kicker="— Signatures —" title="Les incontournables" theme={theme} serif />
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {signatures.map((d) => (
                <article key={d.id} className="group">
                  <div className="aspect-[3/4] sm:aspect-[4/5] overflow-hidden" style={{ background: theme.surface }}>
                    <StorageImage path={d.image_url} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="text-2xl italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: theme.text, fontWeight: 600 }}>
                      {d.name}
                    </h3>
                    <span className="font-medium whitespace-nowrap" style={{ color: theme.accent }}>{fmtPrice(d.price)}</span>
                  </div>
                  {d.description && <p className="text-sm mt-2 leading-relaxed" style={{ color: theme.textMuted }}>{d.description}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CARTE */}
      <section id="carte" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead kicker="— La carte —" title="Notre menu" theme={theme} serif />
          <MenuGrid menu={menu} theme={theme} />
        </div>
      </section>

      {/* SECTION PREMIUM - Menu Dégustation */}
      <section className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead kicker="— Expérience gastronomique —" title="Menu Dégustation" theme={theme} serif />
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="p-8 rounded-2xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.accent }}>Menu Étoilé</p>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>7 services</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Une expérience culinaire complète avec accord mets-vins</p>
              <p className="text-3xl font-black" style={{ color: theme.accent }}>35 000 F</p>
            </div>
            <div className="p-8 rounded-2xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.accent }}>Menu Découverte</p>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>5 services</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Nos meilleures créations en format découverte</p>
              <p className="text-3xl font-black" style={{ color: theme.accent }}>25 000 F</p>
            </div>
          </div>
        </div>
      </section>

      {/* GALERIE */}
      {gallery.length > 0 && (
        <section id="galerie" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-7xl mx-auto">
            <SectionHead kicker="— Galerie —" title="L'ambiance" theme={theme} serif />
            <GalleryGrid gallery={gallery} theme={theme} />
          </div>
        </section>
      )}

      {/* RESERVATION */}
      {features.can_reserve && (
        <section id="reserver" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
          <div className="max-w-3xl mx-auto">
            <SectionHead kicker="— Réservation —" title="Réserver votre table" theme={theme} serif />
            <AdvancedReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} theme={theme} waLink={wa} />
          </div>
        </section>
      )}

      {/* AVIS */}
      <section id="avis" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead kicker="— Ils en parlent —" title="Avis de nos clients" theme={theme} serif />
          <ReviewList reviews={reviews} theme={theme} />
          <div className="mt-10 sm:mt-12 max-w-xl">
            <h3 className="text-lg italic mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: theme.text }}>
              Laissez votre avis
            </h3>
            <ReviewForm restaurantId={restaurant.id} theme={theme} />
          </div>
        </div>
      </section>

      <PoweredFooter restaurant={restaurant} wa={wa} theme={theme} />
      <FloatingWhatsApp href={wa} accent={theme.accent} ink={theme.accentInk} />
    </div>
  );
}

function Stat({ label, value, theme }: { label: string; value: React.ReactNode; theme: Theme }) {
  return (
    <div>
      <p className="text-[10px] uppercase mb-2" style={{ color: theme.accent, letterSpacing: "0.4em" }}>{label}</p>
      <p className="text-2xl" style={{ color: theme.text, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>{value}</p>
    </div>
  );
}

/* ================================================================== */
/*  Decorative backgrounds (CDN patterns from the references)         */
/* ================================================================== */

const BG_SOLEIL = "/bg-soleil.webp";
const BG_SAVANE = "/bg-savane.jpg";
const BG_MARCHE = "/bg-marché.jpg";
const BG_MODERNE = "/bg-moderne.jpg";

const TPL_BG_CSS = "\n/* Standard template full-screen backgrounds */\n.tpl-page{position:relative;min-height:100vh;overflow:hidden;isolation:isolate;}\n.tpl-bg{position:fixed;inset:0;z-index:-2;overflow:hidden;background:transparent;}\n.tpl-bg img{width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.1);transform:scale(1.08);animation:tpl-bg-drift 22s ease-in-out infinite alternate;}\n.tpl-bg span{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.40),rgba(0,0,0,.80));}\n@keyframes tpl-bg-drift{0%{transform:scale(1.08) translate3d(-1.5%,0,0)}100%{transform:scale(1.18) translate3d(1.5%,-1.5%,0)}}\n@media(prefers-reduced-motion:reduce){.tpl-bg img{animation:none;transition:none}}\n";


function CategoryIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (/pizza/.test(n)) return <>🍕</>;
  if (/burger|sandwich/.test(n)) return <>🍔</>;
  if (/pasta|p[âa]tes|spaghet/.test(n)) return <>🍝</>;
  if (/dessert|sucre|p[âa]tiss/.test(n)) return <>🍰</>;
  if (/boisson|drink|jus|cocktail/.test(n)) return <>🥤</>;
  if (/entr[ée]e|starter|salade/.test(n)) return <>🥗</>;
  if (/grill|brochette|viande|bbq/.test(n)) return <>🍖</>;
  if (/poisson|fish|fruits de mer/.test(n)) return <>🐟</>;
  if (/riz|t[ôo]|plat/.test(n)) return <>🍛</>;
  if (/petit|breakfast|d[ée]j/.test(n)) return <>🥐</>;
  return <>🍽️</>;
}

/* ================================================================== */
/*  2. SOLEIL — Savoria-style cream/terracotta editorial              */
/* ================================================================== */

export function TplSoleil(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery } = props;
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const cover = pickCover(gallery, menu);
  const rating = avgRating(reviews);
  const cats = Array.from(new Set(menu.filter((m) => m.available).map((m) => m.category))).slice(0, 6);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const popular = (activeTab ? menu.filter((m) => m.available && m.category === activeTab) : menu.filter((m) => m.available)).slice(0, 8);
  
  const [currentView, setCurrentView] = useState<"home" | "menu" | "about" | "reserve">("home");
  const [mobOpen, setMobOpen] = useState(false);

  const theme: Theme = {
    bg: "#fbf3e6",
    surface: "#ffffff",
    surfaceAlt: "#f0e3cd",
    text: "#1e1308",
    textMuted: "#6b5440",
    accent: "#c7522a",
    accentInk: "#ffffff",
    border: "rgba(30,19,8,0.12)",
    radius: "14px",
  };

  const heroOverlay = "linear-gradient(135deg, rgba(251,243,230,0.92) 0%, rgba(251,243,230,0.88) 50%, rgba(251,243,230,0.82) 100%)";

  const goTo = (view: typeof currentView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="tpl-page min-h-screen" style={{ background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif", isolation: "isolate" }}>
      <FontImport />
      <style>{TPL_BG_CSS}</style>

      <div className="tpl-bg" aria-hidden>
        <img src={BG_SOLEIL} alt="" />
        <span />
      </div>

      {/* TOP STRIP */}
      <div style={{ background: theme.surfaceAlt, color: theme.text }} className="text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <span><strong>Tél :</strong> {restaurant.phone}</span>
            <span className="hidden sm:inline"><strong>Email :</strong> {restaurant.email}</span>
          </div>
          <span style={{ color: theme.accent, fontWeight: 700 }}>★ Offre : livraison offerte dès 15 000 F</span>
        </div>
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur" style={{ background: "rgba(251,243,230,0.95)", borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="h-10 w-auto object-contain rounded" />
            ) : null}
            <div>
              <strong className="block text-2xl sm:text-3xl tracking-[0.25em] truncate" style={{ fontFamily: "'Playfair Display', serif", color: theme.text }}>
                {restaurant.name.toUpperCase()}
              </strong>
              <span className="block text-[10px] tracking-[0.5em] mt-0.5" style={{ color: theme.accent }}>~ KITCHEN ~</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <nav className="hidden md:flex gap-5 text-sm font-medium" style={{ color: theme.text }}>
              <button onClick={() => goTo("home")} className={`hover:text-[#c7522a] transition ${currentView === "home" ? "text-[#c7522a] border-b-2 border-[#c7522a]" : ""}`}>Accueil</button>
              <button onClick={() => goTo("menu")} className={`hover:text-[#c7522a] transition ${currentView === "menu" ? "text-[#c7522a] border-b-2 border-[#c7522a]" : ""}`}>Menu</button>
              <button onClick={() => goTo("about")} className={`hover:text-[#c7522a] transition ${currentView === "about" ? "text-[#c7522a] border-b-2 border-[#c7522a]" : ""}`}>À propos</button>
            </nav>
            {restaurant.plan !== "gratuit" && (
              <button onClick={() => goTo("reserve")} className="hidden md:block px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition border-2 border-white" style={{ color: "#ffffff" }}>
                Réserver
              </button>
            )}
            <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="hidden md:flex w-10 h-10 rounded-full grid place-items-center text-base hover:scale-105 transition" style={{ background: theme.accent, color: theme.accentInk }} aria-label="Commander">
              🛒
            </a>
            <button
              onClick={() => setMobOpen((v) => !v)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
        {mobOpen && (
          <nav className="md:hidden border-t border-black/10 bg-white/95 backdrop-blur-xl">
            <div className="flex flex-col px-4 py-4 gap-1">
              <button onClick={() => goTo("home")} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors text-left">Accueil</button>
              <button onClick={() => goTo("menu")} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors text-left">Menu</button>
              <button onClick={() => goTo("about")} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors text-left">À propos</button>
              {restaurant.plan !== "gratuit" && (
                <button onClick={() => goTo("reserve")} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors text-left">Réserver</button>
              )}
              <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors">🛒 Commander</a>
            </div>
          </nav>
        )}
      </header>

      {/* HOME VIEW */}
      {currentView === "home" && (
        <>
          {/* HERO card */}
          <section id="home" className="px-4 sm:px-5 pt-6 sm:pt-8 pb-10 sm:pb-12">
            <div className="max-w-6xl mx-auto rounded-[28px] overflow-hidden relative" style={{ background: heroOverlay }}>
              
              <div className="relative grid lg:grid-cols-2 gap-4 sm:gap-6 p-6 sm:p-12 items-center">
                <div>
                  <h1 className="font-black leading-[0.95]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "#ffffff", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
                    Délicieux instants<br/>pour <em style={{ color: theme.accent, fontStyle: "italic" }}>chaque goût</em>
                  </h1>
                  <p className="mt-5 max-w-md leading-relaxed" style={{ color: "#ffffff", fontWeight: 500, textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
                    {restaurant.description ?? `Une cuisine d'excellence préparée avec passion à ${restaurant.city}, ingrédients frais et locaux.`}
                  </p>
                  <div className="mt-7 flex gap-3 flex-wrap">
                    <a href={wa ?? "#menu"} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="px-7 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition shadow-lg" style={{ background: theme.accent, color: theme.accentInk }}>
                      Commander
                    </a>
                    {restaurant.plan !== "gratuit" && (
                      <button onClick={() => goTo("reserve")} className="px-7 py-3.5 rounded-full font-bold text-sm border-2 border-white hover:bg-white hover:text-[#1e1308] transition shadow-md" style={{ color: "#ffffff" }}>
                        Réserver une table
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  {cover ? (
                    <StorageImage path={cover} alt={restaurant.name} className="w-full aspect-[4/3] object-cover rounded-[20px]" />
                  ) : (
                    <div className="w-full aspect-[4/3] rounded-[20px] grid place-items-center text-8xl" style={{ background: "linear-gradient(135deg,#e5c89a,#c7522a)" }}>👨‍🍳</div>
                  )}
                  {rating !== null && (
                    <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm">
                      <span style={{ color: theme.accent }}>★</span>
                      <strong>{rating.toFixed(1)}</strong>
                      <span style={{ color: theme.textMuted }}>· {reviews.length} avis</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* CATEGORIES circular */}
          {cats.length > 0 && (
            <section className="px-5 py-12">
              <div className="max-w-6xl mx-auto text-center">
                <h2 className="font-black mb-10" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                  Parcourir par catégorie
                </h2>
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                  {cats.map((c) => (
                    <button key={c} onClick={() => { setActiveTab(c); goTo("menu"); }} className="group flex flex-col items-center gap-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full grid place-items-center text-4xl sm:text-5xl group-hover:scale-110 transition" style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                        <CategoryIcon name={c} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#ffffff", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* POPULAR DISHES with tabs */}
          <section id="menu" className="px-5 py-12">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="font-black mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                Plats populaires
              </h2>
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                <button onClick={() => setActiveTab(null)} className="px-4 py-1 text-sm font-medium" style={{ color: activeTab === null ? "#ffffff" : "rgba(255,255,255,0.7)", borderBottom: activeTab === null ? `2px solid #ffffff` : "2px solid transparent", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>[Tous]</button>
                {cats.map((c) => (
                  <button key={c} onClick={() => setActiveTab(c)} className="px-4 py-1 text-sm font-medium" style={{ color: activeTab === c ? "#ffffff" : "rgba(255,255,255,0.7)", borderBottom: activeTab === c ? `2px solid #ffffff` : "2px solid transparent", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>[{c}]</button>
                ))}
              </div>
              {popular.length === 0 ? (
                <p className="italic" style={{ color: theme.textMuted }}>Aucun plat disponible pour le moment.</p>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 text-left">
                  {popular.map((d, i) => (
                    <article key={d.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
                      <div className="aspect-[4/3] overflow-hidden relative" style={{ background: theme.surfaceAlt }}>
                        {d.image_url ? (
                          <StorageImage path={d.image_url} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-4xl"><CategoryIcon name={d.category} /></div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 text-[10px] font-bold" style={{ color: theme.text }}>
                          {i < 2 ? "Best Seller" : "Hot"}
                        </span>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-bold leading-tight truncate">{d.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold" style={{ color: theme.accent }}>{fmtPrice(d.price)}</span>
                          <span className="text-xs flex items-center gap-1"><span style={{ color: "#e8b400" }}>★</span> 4.8</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* MENU VIEW */}
      {currentView === "menu" && (
        <section id="menu" className="py-16 px-5" style={{ background: theme.surface }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="La carte" title="Notre menu complet" theme={theme} align="center" />
            <MenuGrid menu={menu} theme={theme} />
          </div>
        </section>
      )}

      {/* ABOUT VIEW */}
      {currentView === "about" && (
        <section id="about" className="py-16 px-5" style={{ background: theme.surfaceAlt }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="Notre histoire" title="À propos de nous" theme={theme} align="center" />
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg leading-relaxed mb-6" style={{ color: theme.text }}>
                {restaurant.description ?? `Bienvenue au ${restaurant.name}, votre restaurant préféré à ${restaurant.city}. Nous vous proposons une cuisine ${restaurant.cuisine ?? "traditionnelle"} préparée avec des ingrédients frais et locaux.`}
              </p>
              {restaurant.address && (
                <div className="mt-6 p-6 rounded-2xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                  <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>📍 Adresse</p>
                  <p style={{ color: theme.text }}>{restaurant.address}</p>
                  {restaurant.hours && (
                    <>
                      <p className="text-sm font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: theme.accent }}>🕐 Horaires</p>
                      <p style={{ color: theme.text }} className="whitespace-pre-line">{restaurant.hours}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* RESERVATION VIEW */}
      {currentView === "reserve" && restaurant.plan !== "gratuit" && (
        <section id="reserver" className="py-16 px-5 bg-white">
          <div className="max-w-3xl mx-auto">
            <SectionHead kicker="Réservation" title="Réservez votre table" theme={theme} align="center" />
            <AdvancedReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} theme={theme} waLink={wa} />
          </div>
        </section>
      )}

      {/* SECTION PREMIUM - Événements privés */}
      <section className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead kicker="— Moments spéciaux —" title="Événements Privés" theme={theme} serif />
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div className="p-6 rounded-2xl text-center" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
              <div className="text-4xl mb-3">🎂</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Anniversaires</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Menu spécial et décoration personnalisée</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>À partir de 15 000 F/pers</p>
            </div>
            <div className="p-6 rounded-2xl text-center" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Repas d'affaires</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Espace privé et service dédié</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>Sur demande</p>
            </div>
            <div className="p-6 rounded-2xl text-center" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
              <div className="text-4xl mb-3">🥂</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Dîners romantiques</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Ambiance intimiste et menu duo</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>À partir de 20 000 F</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      {currentView === "home" && (
        <div className="px-5 py-7" style={{ background: "#8b3a1c" }}>
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6">
            <strong className="text-white text-xl sm:text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>Savourez le meilleur, commandez maintenant</strong>
            <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="px-7 py-3 rounded-full bg-white font-bold text-sm hover:bg-[#fbf3e6] transition" style={{ color: "#8b3a1c" }}>
              Commander en ligne
            </a>
          </div>
        </div>
      )}

      {/* SECTION PREMIUM - Chef's Table */}
      <section className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}`, background: theme.surfaceAlt }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead kicker="— Expérience exclusive —" title="Chef's Table" theme={theme} serif />
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="p-8 rounded-2xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
              <div className="text-4xl mb-3">👨‍🍳</div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Table du Chef</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Dînez en cuisine et observez le chef à l'œuvre</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>Sur réservation uniquement</p>
            </div>
            <div className="p-8 rounded-2xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
              <div className="text-4xl mb-3">🍷</div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Dégustation Privée</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Menu personnalisé avec accord mets-vins</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>À partir de 40 000 F/pers</p>
            </div>
          </div>
        </div>
      </section>

      {/* GALERIE & AVIS - Intégrés dans l'accueil */}
      {currentView === "home" && (
        <>
          {gallery.length > 0 && (
            <section className="py-16 px-5">
              <div className="max-w-6xl mx-auto">
                <SectionHead kicker="Galerie" title="L'ambiance chez nous" theme={theme} align="center" />
                <GalleryGrid gallery={gallery} theme={theme} />
              </div>
            </section>
          )}

          <section className="py-16 px-5" style={{ background: theme.surfaceAlt }}>
            <div className="max-w-6xl mx-auto">
              <SectionHead kicker="Témoignages" title="Ils ont aimé" theme={theme} align="center" />
              <ReviewList reviews={reviews} theme={theme} />
              <div className="mt-12 max-w-xl mx-auto p-6 bg-white rounded-2xl">
                <h3 className="font-bold mb-4 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Laissez votre avis</h3>
                <ReviewForm restaurantId={restaurant.id} theme={{ ...theme, surface: theme.bg }} />
              </div>
            </div>
          </section>
        </>
      )}

      <PoweredFooter restaurant={restaurant} wa={wa} theme={{ ...theme, surfaceAlt: "#1e1308", text: "#fbf3e6", textMuted: "rgba(251,243,230,0.65)", accent: "#f0a878", border: "rgba(255,255,255,0.1)" }} />
      <FloatingWhatsApp href={wa} accent={theme.accent} ink={theme.accentInk} />
    </div>
  );
}

/* ================================================================== */
/*  3. SAVANE — Bold fast-food red/yellow (burger reference)          */
/* ================================================================== */

export function TplSavane(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery } = props;
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const cover = pickCover(gallery, menu);
  const signatures = signatureDishes(menu, 3);

  const theme: Theme = {
    bg: "#fff8e7",
    surface: "#ffffff",
    surfaceAlt: "#fde9b6",
    text: "#1a0d05",
    textMuted: "rgba(26,13,5,0.7)",
    accent: "#f5b921",
    accentInk: "#1a0d05",
    border: "rgba(26,13,5,0.12)",
    radius: "20px",
  };

  const RED = "#c8281e";
  const heroOverlay = "linear-gradient(135deg, rgba(200,40,30,0.92) 0%, rgba(200,40,30,0.85) 50%, rgba(200,40,30,0.78) 100%)";

  const [currentView, setCurrentView] = useState<"home" | "menu" | "about" | "reserve">("home");
  const [mobOpen, setMobOpen] = useState(false);

  const goTo = (view: typeof currentView) => {
    setCurrentView(view);
    setMobOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="tpl-page min-h-screen" style={{ background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif", isolation: "isolate" }}>
      <FontImport />
      <style>{TPL_BG_CSS}</style>

      <div className="tpl-bg" aria-hidden>
        <img src={BG_SAVANE} alt="" />
        <span />
      </div>

      {/* HERO RED BANNER */}
      <section className="relative overflow-hidden" style={{ background: heroOverlay }}>
        
        {/* NAV */}
        <header className="relative">
          <div className="max-w-7xl mx-auto px-5 py-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="flex items-center gap-2 min-w-0">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="h-8 w-auto object-contain rounded" />
              ) : (
                <span className="text-2xl shrink-0">🍔</span>
              )}
              <strong className="text-xl sm:text-2xl truncate text-white" style={{ fontFamily: "'Archivo Black', sans-serif", letterSpacing: "0.05em" }}>
                {restaurant.name}
              </strong>
            </div>
            <div className="flex items-center gap-2 sm:gap-5">
              <nav className="hidden md:flex gap-5 text-[12px] uppercase font-bold text-white/90" style={{ letterSpacing: "0.18em" }}>
                <button onClick={() => goTo("home")} className={`hover:text-white ${currentView === "home" ? "text-white" : ""}`}>Accueil</button>
                <button onClick={() => goTo("menu")} className={`hover:text-white ${currentView === "menu" ? "text-white" : ""}`}>Menu</button>
              </nav>
              {restaurant.plan !== "gratuit" && (
                <button onClick={() => goTo("reserve")} className="hidden md:block px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition border-2 border-white" style={{ color: "#ffffff" }}>
                  Réserver
                </button>
              )}
              <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition" style={{ background: theme.accent, color: theme.accentInk }}>
                Commander
              </a>
              <button
                onClick={() => setMobOpen((v) => !v)}
                className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Menu"
              >
                <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobOpen ? "opacity-0" : ""}`} />
                <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>
          </div>
        </header>
        {mobOpen && (
          <nav className="md:hidden border-t border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl">
            <div className="flex flex-col px-4 py-4 gap-1">
              <button onClick={() => goTo("home")} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left">Accueil</button>
              <button onClick={() => goTo("about")} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left">À propos</button>
              <button onClick={() => goTo("menu")} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left">Menu</button>
              {restaurant.plan !== "gratuit" && (
                <button onClick={() => goTo("reserve")} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left">Réserver</button>
              )}
            </div>
          </nav>
        )}

        {/* HOME VIEW */}
        {currentView === "home" && (
          <div className="relative max-w-7xl mx-auto px-5 pt-8 pb-28 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm font-bold uppercase mb-3 tracking-widest" style={{ color: theme.accent, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>★ Le goût qui claque</p>
              <h1 className="leading-[0.9] text-white" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(3rem, 9vw, 6.5rem)", textShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                Commande<br/>tes favoris
              </h1>
              <p className="mt-6 text-white max-w-md text-lg leading-relaxed" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                {restaurant.description ?? `Les meilleurs burgers, brochettes et fast-food de ${restaurant.city}, livrés chauds.`}
              </p>
              <div className="mt-7 flex gap-3 flex-wrap">
                <button onClick={() => goTo("menu")} className="inline-block px-8 py-4 rounded-full font-black text-sm hover:scale-105 transition shadow-xl" style={{ background: theme.accent, color: theme.accentInk }}>
                  VOIR LE MENU →
                </button>
                <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 rounded-full font-black text-sm border-2 border-white hover:bg-white hover:text-red-600 transition shadow-lg">
                  COMMANDER
                </a>
              </div>
            </div>
            <div className="relative">
              {cover ? (
                <StorageImage path={cover} alt={restaurant.name} className="w-full aspect-square object-cover rounded-full shadow-2xl border-8 border-white/20" />
              ) : (
                <div className="w-full aspect-square rounded-full grid place-items-center text-9xl" style={{ background: "radial-gradient(circle,#f5b921,#c8281e)" }}>🍔</div>
              )}
              <span className="absolute -top-2 -right-2 text-5xl rotate-12">✨</span>
              <span className="absolute bottom-4 -left-4 text-4xl">⚡</span>
            </div>
          </div>
        )}

        {/* MENU VIEW */}
        {currentView === "menu" && (
          <div className="max-w-6xl mx-auto px-5 py-12">
            <div className="text-center">
              <h2 className="font-black mb-6" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                Notre Menu
              </h2>
              <MenuGrid menu={menu} theme={theme} />
            </div>
          </div>
        )}

        {/* ABOUT VIEW */}
        {currentView === "about" && (
          <div className="max-w-6xl mx-auto px-5 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-black mb-6" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                À propos de nous
              </h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: "#ffffff", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                {restaurant.description ?? `Bienvenue au ${restaurant.name}, votre fast-food préféré à ${restaurant.city}. Nous vous proposons les meilleurs burgers, brochettes et plats rapides, préparés avec des ingrédients frais.`}
              </p>
              {restaurant.address && (
                <div className="mt-6 p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                  <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: theme.accent }}>📍 Adresse</p>
                  <p style={{ color: "#ffffff" }}>{restaurant.address}</p>
                  {restaurant.hours && (
                    <>
                      <p className="text-sm font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: theme.accent }}>🕐 Horaires</p>
                      <p style={{ color: "#ffffff" }} className="whitespace-pre-line">{restaurant.hours}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESERVATION VIEW */}
        {currentView === "reserve" && restaurant.plan !== "gratuit" && (
          <div className="max-w-3xl mx-auto px-5 py-12">
            <div className="text-center mb-8">
              <h2 className="font-black" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                Réserve ta table
              </h2>
            </div>
            <AdvancedReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} theme={{ ...theme, surface: "rgba(255,255,255,0.1)", text: "#fff", textMuted: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.2)", accent: theme.accent, accentInk: theme.accentInk }} waLink={wa} />
          </div>
        )}

        {/* COMBO PILL - only on home */}
        {currentView === "home" && (
          <div className="relative max-w-5xl mx-auto px-5 -mb-14 translate-y-14">
            <div className="bg-white rounded-full shadow-2xl px-6 py-4 grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-4 items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚗</span>
                <div>
                  <strong className="text-sm block">Livraison rapide</strong>
                  <span className="text-xs" style={{ color: theme.textMuted }}>Sous 30 min en ville</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥤</span>
                <div>
                  <strong className="text-sm block">Combos & boissons</strong>
                  <span className="text-xs" style={{ color: theme.textMuted }}>Économise jusqu'à 20%</span>
                </div>
              </div>
              <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-block px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap" style={{ background: theme.accent, color: theme.accentInk }}>
                COMMANDER
              </a>
            </div>
          </div>
        )}
      </section>

      {/* SECONDARY RED CARD - only on home */}
      {currentView === "home" && (
        <section className="px-5 pt-28 pb-12">
          <div className="max-w-6xl mx-auto rounded-[28px] overflow-hidden grid lg:grid-cols-[1fr_auto] gap-6 p-8 sm:p-10 items-center" style={{ background: RED }}>
            <div className="text-white">
              <h2 className="leading-[0.95]" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                Commande en quelques minutes
              </h2>
              <p className="mt-3 text-white/85 max-w-md">Choisis, paie, et déguste — c'est aussi simple que ça.</p>
              <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block px-7 py-3 rounded-full font-bold text-sm" style={{ background: theme.accent, color: theme.accentInk }}>
                COMMANDER MAINTENANT
              </a>
            </div>
            <div className="text-7xl sm:text-8xl text-center">🍔</div>
          </div>
        </section>
      )}

      {/* SIGNATURES 3-card - only on home */}
      {currentView === "home" && signatures.length > 0 && (
        <section id="menu" className="py-12 px-5">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs font-black uppercase tracking-[0.4em] mb-2" style={{ color: RED }}>★ Best Sellers</p>
            <h2 className="font-black mb-12" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
              Nos incontournables
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {signatures.map((d, i) => (
                <article key={d.id} className="rounded-3xl overflow-hidden text-left shadow-md hover:shadow-2xl hover:-translate-y-1 transition" style={{ background: i % 2 === 0 ? RED : theme.accent, color: i % 2 === 0 ? "#fff" : theme.accentInk }}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <StorageImage path={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-black uppercase text-lg" style={{ fontFamily: "'Archivo Black', sans-serif" }}>{d.name}</h3>
                    {d.description && <p className="text-sm mt-1 opacity-85 line-clamp-2">{d.description}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-black text-lg">{fmtPrice(d.price)}</span>
                      <a href={wa ?? "#"} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-full font-bold text-xs bg-white" style={{ color: RED }}>COMMANDER</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FULL MENU - only on menu view */}
      {currentView === "menu" && (
        <section id="menu" className="py-16 px-5" style={{ background: theme.surface }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="La carte complète" title="Tous nos plats" theme={theme} align="center" />
            <MenuGrid menu={menu} theme={theme} />
          </div>
        </section>
      )}

      {/* ABOUT SECTION - only on about view */}
      {currentView === "about" && (
        <section id="about" className="py-16 px-5" style={{ background: theme.surfaceAlt }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="Notre histoire" title="À propos de nous" theme={theme} align="center" />
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg leading-relaxed mb-6" style={{ color: theme.text }}>
                {restaurant.description ?? `Bienvenue au ${restaurant.name}, votre fast-food préféré à ${restaurant.city}. Nous vous proposons les meilleurs burgers, brochettes et plats rapides, préparés avec des ingrédients frais.`}
              </p>
              {restaurant.address && (
                <div className="mt-6 p-6 rounded-2xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                  <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: RED }}>📍 Adresse</p>
                  <p style={{ color: theme.text }}>{restaurant.address}</p>
                  {restaurant.hours && (
                    <>
                      <p className="text-sm font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: RED }}>🕐 Horaires</p>
                      <p style={{ color: theme.text }} className="whitespace-pre-line">{restaurant.hours}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* RESERVATION SECTION */}
      {currentView === "reserve" && restaurant.plan !== "gratuit" && (
        <section className="py-16 px-5" style={{ background: RED, color: "#fff" }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-black uppercase tracking-[0.4em] mb-2" style={{ color: theme.accent }}>★ Réservation</p>
              <h2 className="font-black" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)" }}>Réserve ta table</h2>
            </div>
            <AdvancedReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} theme={{ ...theme, surface: "rgba(255,255,255,0.1)", text: "#fff", textMuted: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.2)", accent: theme.accent, accentInk: theme.accentInk }} waLink={wa} />
          </div>
        </section>
      )}

      {/* GALERIE & AVIS - Intégrés dans l'accueil */}
      {currentView === "home" && (
        <>
          {gallery.length > 0 && (
            <section className="py-16 px-5">
              <div className="max-w-6xl mx-auto">
                <SectionHead kicker="Galerie" title="Dans nos cuisines" theme={theme} align="center" />
                <GalleryGrid gallery={gallery} theme={theme} />
              </div>
            </section>
          )}

          <section className="py-16 px-5" style={{ background: theme.surfaceAlt }}>
            <div className="max-w-6xl mx-auto">
              <SectionHead kicker="Avis" title="Ils nous adorent" theme={theme} align="center" />
              <ReviewList reviews={reviews} theme={theme} />
              <div className="mt-12 max-w-xl mx-auto bg-white p-6 rounded-2xl">
                <h3 className="font-black mb-4 text-lg" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Laisse ton avis</h3>
                <ReviewForm restaurantId={restaurant.id} theme={theme} />
              </div>
            </div>
          </section>
        </>
      )}

      <PoweredFooter restaurant={restaurant} wa={wa} theme={{ ...theme, surfaceAlt: "#1a0d05", text: "#fff8e7", textMuted: "rgba(255,248,231,0.65)", accent: theme.accent, border: "rgba(255,255,255,0.1)" }} />
      <FloatingWhatsApp href={wa} accent={theme.accent} ink={theme.accentInk} />
    </div>
  );
}

/* ================================================================== */
/*  4. MARCHE — Indian-inspired dark green + orange/gold              */
/* ================================================================== */

export function TplMarche(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery } = props;
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const cover = pickCover(gallery, menu);
  const rating = avgRating(reviews);

  const theme: Theme = {
    bg: "#0d2818",
    surface: "rgba(255,255,255,0.04)",
    surfaceAlt: "#0a1f12",
    text: "#f0e9d6",
    textMuted: "rgba(240,233,214,0.7)",
    accent: "#ed8023",
    accentInk: "#0d2818",
    border: "rgba(237,128,35,0.2)",
    radius: "10px",
  };

  const [currentView, setCurrentView] = useState<"home" | "menu" | "about" | "reserve">("home");
  const [mobOpen, setMobOpen] = useState(false);

  const goTo = (view: typeof currentView) => {
    setCurrentView(view);
    setMobOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="tpl-page min-h-screen" style={{ background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif", isolation: "isolate" }}>
      <FontImport />
      <style>{TPL_BG_CSS}</style>

      <div className="tpl-bg" aria-hidden>
        <img src={BG_MARCHE} alt="" />
        <span />
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur" style={{ background: "rgba(13,40,24,0.92)", borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto px-5 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="h-8 w-auto object-contain rounded" />
            ) : (
              <span className="text-2xl shrink-0">🌶️</span>
            )}
            <strong className="text-xl sm:text-2xl truncate" style={{ fontFamily: "'Playfair Display', serif", color: theme.accent }}>
              {restaurant.name}
            </strong>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <nav className="hidden md:flex gap-5 text-[12px] uppercase font-medium" style={{ letterSpacing: "0.15em", color: theme.textMuted }}>
              <button onClick={() => goTo("home")} className={`hover:text-[#ed8023] ${currentView === "home" ? "text-[#ed8023] border-b border-[#ed8023]" : ""}`}>Accueil</button>
              <button onClick={() => goTo("about")} className={`hover:text-[#ed8023] ${currentView === "about" ? "text-[#ed8023] border-b border-[#ed8023]" : ""}`}>À propos</button>
              <button onClick={() => goTo("menu")} className={`hover:text-[#ed8023] ${currentView === "menu" ? "text-[#ed8023] border-b border-[#ed8023]" : ""}`}>Menu</button>
            </nav>
            {restaurant.plan !== "gratuit" && (
              <button onClick={() => goTo("reserve")} className="px-5 py-2 rounded-full border text-xs font-semibold hover:bg-[#ed8023] hover:text-[#0d2818] transition" style={{ borderColor: theme.accent, color: theme.accent }}>
                Réserver
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HOME VIEW */}
      {currentView === "home" && (
        <section id="home" className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, transparent 30%, #0d2818 90%)" }} />
          <div className="relative max-w-7xl mx-auto px-5 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="leading-[0.95]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 8vw, 6rem)", color: theme.accent }}>
                {restaurant.cuisine?.split(/[ &]/)[0] ?? restaurant.name}<br/>
                <span style={{ color: theme.text }}>Restaurant</span>
              </h1>
              <p className="mt-6 max-w-lg leading-relaxed" style={{ color: theme.textMuted }}>
                {restaurant.description ?? `Plongez dans une expérience culinaire authentique à ${restaurant.city}. Épices, saveurs et tradition à chaque bouchée.`}
              </p>
              <div className="mt-8 flex gap-3 flex-wrap">
                <button onClick={() => goTo("menu")} className="px-7 py-3 rounded-full font-bold text-sm hover:opacity-90 transition" style={{ background: theme.accent, color: theme.accentInk }}>
                  Voir le menu
                </button>
                <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="px-7 py-3 rounded-full font-bold text-sm border hover:bg-white/5 transition" style={{ borderColor: theme.accent, color: theme.accent }}>
                  Commander
                </a>
              </div>
            </div>
            <div className="relative">
              {cover ? (
                <StorageImage path={cover} alt={restaurant.name} className="w-full aspect-square object-cover rounded-full shadow-2xl" />
              ) : (
                <div className="w-full aspect-square rounded-full grid place-items-center text-9xl" style={{ background: "radial-gradient(circle,#ed8023,#7a3a0e)" }}>🍛</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* MENU VIEW */}
      {currentView === "menu" && (
        <section id="menu" className="py-20 px-5" style={{ background: theme.surfaceAlt }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="La carte" title="Notre menu" theme={theme} align="center" serif />
            <MenuGrid menu={menu} theme={theme} />
          </div>
        </section>
      )}

      {/* ABOUT VIEW */}
      {currentView === "about" && (
        <section id="about" className="py-20 px-5" style={{ background: theme.surfaceAlt }}>
          <div className="max-w-6xl mx-auto">
            <p className="text-center max-w-3xl mx-auto leading-relaxed mb-14" style={{ color: theme.textMuted }}>
              {restaurant.description ?? `Découvrez l'art de la cuisine ${restaurant.cuisine ?? "traditionnelle"} dans un cadre chaleureux à ${restaurant.city}.`}
            </p>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {cover && (
                <div className="aspect-square rounded-full overflow-hidden mx-auto max-w-md">
                  <StorageImage path={cover} alt={restaurant.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h2 className="mb-8" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                  Pourquoi nous choisir
                </h2>
                <ul className="space-y-4">
                  {[
                    ["Ingrédients frais", "Sélectionnés chaque matin sur les marchés locaux."],
                    ["Chefs passionnés", "Une équipe expérimentée à votre service."],
                    ["Saveurs authentiques", "Des recettes traditionnelles transmises depuis des générations."],
                    ["Cadre chaleureux", "Une ambiance qui invite à savourer."],
                    ["Service rapide", "Commande et livraison sans attente."],
                  ].map(([t, d]) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className="text-lg shrink-0 mt-0.5" style={{ color: theme.accent }}>✦</span>
                      <div>
                        <strong>{t}</strong>
                        <span className="block text-sm" style={{ color: theme.textMuted }}>{d}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RESERVATION VIEW */}
      {currentView === "reserve" && restaurant.plan !== "gratuit" && (
        <section className="py-20 px-5" style={{ background: theme.surfaceAlt }}>
          <div className="max-w-3xl mx-auto">
            <SectionHead kicker="Réservation" title="Réservez votre table" theme={theme} align="center" serif />
            <AdvancedReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} theme={theme} waLink={wa} />
          </div>
        </section>
      )}

      {/* GALERIE & AVIS - Intégrés dans l'accueil */}
      {currentView === "home" && (
        <>
          {gallery.length > 0 && (
            <section id="galerie" className="py-20 px-5">
              <div className="max-w-6xl mx-auto">
                <SectionHead kicker="Galerie" title="Notre univers" theme={theme} align="center" serif />
                <GalleryGrid gallery={gallery} theme={theme} />
              </div>
            </section>
          )}

          <section className="py-20 px-5">
            <div className="max-w-6xl mx-auto">
              <SectionHead kicker="Avis" title="Ils en parlent" theme={theme} align="center" serif />
              <ReviewList reviews={reviews} theme={theme} />
              <div className="mt-12 max-w-xl mx-auto">
                <ReviewForm restaurantId={restaurant.id} theme={theme} />
              </div>
            </div>
          </section>
        </>
      )}

      <PoweredFooter restaurant={restaurant} wa={wa} theme={theme} />
      <FloatingWhatsApp href={wa} accent={theme.accent} ink={theme.accentInk} />
    </div>
  );
}

/* ================================================================== */
/*  5. MODERNE — Dark elegant + gold (Food reference)                 */
/* ================================================================== */

export function TplModerne(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery } = props;
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const cover = pickCover(gallery, menu);

  const theme: Theme = {
    bg: "#0e0e10",
    surface: "#16161a",
    surfaceAlt: "#1a1a1f",
    text: "#f5f1e6",
    textMuted: "rgba(245,241,230,0.65)",
    accent: "#c9a35a",
    accentInk: "#0e0e10",
    border: "rgba(201,163,90,0.25)",
    radius: "4px",
  };

  const [currentView, setCurrentView] = useState<"home" | "menu" | "about" | "reserve">("home");
  const [mobOpen, setMobOpen] = useState(false);

  const goTo = (view: typeof currentView) => {
    setCurrentView(view);
    setMobOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="tpl-page min-h-screen" style={{ background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif", isolation: "isolate" }}>
      <FontImport />
      <style>{TPL_BG_CSS}</style>

      <div className="tpl-bg" aria-hidden>
        <img src={BG_MODERNE} alt="" />
        <span />
      </div>

      {/* NAV */}
      <header className="absolute top-0 inset-x-0 z-30">
        <div className="max-w-7xl mx-auto px-5 py-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="h-8 w-auto object-contain rounded" />
            ) : (
              <span className="text-2xl shrink-0">🌿</span>
            )}
            <strong className="text-xl sm:text-2xl truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
              {restaurant.name}
            </strong>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            <nav className="hidden md:flex gap-6 text-[12px] uppercase font-medium" style={{ letterSpacing: "0.15em", color: theme.textMuted }}>
              <button onClick={() => goTo("home")} className={`hover:text-[#c9a35a] ${currentView === "home" ? "text-[#c9a35a]" : ""}`}>Accueil</button>
              <button onClick={() => goTo("about")} className={`hover:text-[#c9a35a] ${currentView === "about" ? "text-[#c9a35a]" : ""}`}>À propos</button>
              <button onClick={() => goTo("menu")} className={`hover:text-[#c9a35a] ${currentView === "menu" ? "text-[#c9a35a]" : ""}`}>Menu</button>
            </nav>
            {restaurant.plan !== "gratuit" && (
              <button onClick={() => goTo("reserve")} className="hidden md:block px-5 py-2.5 border text-xs font-semibold hover:bg-[#c9a35a] hover:text-[#0e0e10] transition rounded-full" style={{ borderColor: theme.accent, color: theme.accent }}>
                Réserver une table →
              </button>
            )}
            <button
              onClick={() => setMobOpen((v) => !v)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* HOME VIEW */}
      {currentView === "home" && (
        <section id="home" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {cover ? (
            <StorageImage path={cover} alt={restaurant.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : null}

          <div className="relative text-center px-5 pt-32 pb-20 max-w-3xl">
            <h1 className="leading-[1.05]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
              La meilleure cuisine<br/>pour <em style={{ color: theme.accent, fontStyle: "italic" }}>votre goût</em>
            </h1>
            <p className="mt-5 max-w-xl mx-auto" style={{ color: theme.textMuted }}>
              {restaurant.description ?? `Une expérience culinaire d'exception au cœur de ${restaurant.city}.`}
            </p>
            <button onClick={() => goTo("menu")} className="mt-8 inline-block px-7 py-3 border font-medium text-sm hover:bg-[#c9a35a] hover:text-[#0e0e10] transition" style={{ borderColor: theme.accent, color: theme.accent }}>
              Découvrir →
            </button>
          </div>
        </section>
      )}

      {/* ABOUT VIEW */}
      {currentView === "about" && (
        <section id="about" className="relative py-24 px-5" style={{ background: theme.surface }}>
          <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {cover ? (
                <StorageImage path={cover} alt={restaurant.name} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square grid place-items-center text-9xl" style={{ background: theme.surfaceAlt }}>🥗</div>
              )}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 hidden lg:block" style={{ background: `radial-gradient(circle, ${theme.accent} 1px, transparent 1px)`, backgroundSize: "10px 10px" }} />
            </div>
            <div>
              <p className="italic mb-3" style={{ color: theme.accent, fontFamily: "'Playfair Display', serif" }}>À propos</p>
              <h2 className="leading-tight mb-5" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                Un voyage exceptionnel des saveurs
              </h2>
              <p className="leading-relaxed mb-8" style={{ color: theme.textMuted }}>
                {restaurant.description ?? "Depuis nos débuts, nous mettons l'accent sur la qualité, l'authenticité et l'art du dressage. Chaque plat est une promesse de découverte."}
              </p>
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                {[
                  ["🍴", "Spécialiste", "Une équipe formée aux meilleures techniques."],
                  ["🏛️", "Restaurant", "Un cadre élégant pour vos moments précieux."],
                ].map(([icon, t, d]) => (
                  <div key={t}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl" style={{ color: theme.accent }}>{icon}</span>
                      <strong style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem" }}>{t}</strong>
                    </div>
                    <p className="text-sm" style={{ color: theme.textMuted }}>{d}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-2 mb-8">
                {["Ingrédients sélectionnés avec soin", "Service attentionné et personnalisé", "Carte renouvelée selon les saisons"].map((s) => (
                  <li key={s} className="flex items-center gap-3 text-sm" style={{ color: theme.textMuted }}>
                    <span style={{ color: theme.accent }}>✓</span>{s}
                  </li>
                ))}
              </ul>
              <button onClick={() => goTo("menu")} className="inline-block px-7 py-3 border text-sm hover:bg-[#c9a35a] hover:text-[#0e0e10] transition" style={{ borderColor: theme.accent, color: theme.accent }}>
                En savoir plus →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MENU VIEW */}
      {currentView === "menu" && (
        <section id="menu" className="py-20 px-5" style={{ background: theme.surface, borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="La carte" title="Notre menu" theme={theme} align="center" serif />
            <MenuGrid menu={menu} theme={theme} />
          </div>
        </section>
      )}

      {/* RESERVATION VIEW */}
      {currentView === "reserve" && restaurant.plan !== "gratuit" && (
        <section id="reserver" className="py-20 px-5" style={{ background: theme.surface, borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-3xl mx-auto">
            <SectionHead kicker="Réservation" title="Réservez votre table" theme={theme} align="center" serif />
            <AdvancedReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} theme={theme} waLink={wa} />
          </div>
        </section>
      )}

      {/* GALERIE & AVIS - Intégrés dans l'accueil */}
      {currentView === "home" && (
        <>
          {gallery.length > 0 && (
            <section id="galerie" className="py-20 px-5" style={{ borderTop: `1px solid ${theme.border}` }}>
              <div className="max-w-6xl mx-auto">
                <SectionHead kicker="Galerie" title="Notre maison" theme={theme} align="center" serif />
                <GalleryGrid gallery={gallery} theme={theme} />
              </div>
            </section>
          )}

          <section className="py-20 px-5" style={{ borderTop: `1px solid ${theme.border}` }}>
            <div className="max-w-6xl mx-auto">
              <SectionHead kicker="Avis" title="Ils nous recommandent" theme={theme} align="center" serif />
              <ReviewList reviews={reviews} theme={theme} />
              <div className="mt-12 max-w-xl mx-auto">
                <ReviewForm restaurantId={restaurant.id} theme={theme} />
              </div>
            </div>
          </section>
        </>
      )}

      <PoweredFooter restaurant={restaurant} wa={wa} theme={theme} />
      <FloatingWhatsApp href={wa} accent={theme.accent} ink={theme.accentInk} />
    </div>
  );
}

/* ================================================================== */
/*  4. CLASSIQUE — Swiss minimal B&W (Gratuit)                        */
/* ================================================================== */

export function TplClassique(props: TemplateProps) {
  return <ClassiqueGratuit {...props} />;
}

/* ============= Classique (Gratuit) — green minimal multi-section ============= */

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CartLine = { name: string; price: number; qty: number };

function ClassiqueGratuit({ restaurant, menu, reviews: initialReviews, gallery }: TemplateProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const wa = (restaurant.whatsapp || "").replace(/\D/g, "");
  const waLink = (text: string) =>
    wa ? `https://wa.me/${wa}?text=${encodeURIComponent(text)}` : "#";

  const available = useMemo(() => menu.filter((m) => m.available), [menu]);
  const ratingAvg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const [mobOpen, setMobOpen] = useState(false);
  const [active, setActive] = useState<"home" | "menu" | "order" | "reserve" | "reviews">("home");
  const [prefill, setPrefill] = useState<{ name: string; price: number } | null>(null);

  const go = (id: typeof active) => {
    setActive(id);
    setMobOpen(false);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const navLinks: { id: typeof active; label: string; icon: string }[] = [
    { id: "home", label: "Accueil", icon: "🏠" },
    { id: "menu", label: "Menu", icon: "🍲" },
    { id: "order", label: "Commander", icon: "🛒" },
    { id: "reserve", label: "Réservation", icon: "📅" },
    { id: "reviews", label: "Avis", icon: "⭐" },
  ];

  return (
    <div className="cl-root">
      <style>{CL_CSS}</style>

      <nav className="cl-nav">
        <button className="cl-brand" onClick={() => go("home")}>
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt={restaurant.name} style={{ maxHeight: "32px", objectFit: "contain" }} />
          ) : (
            restaurant.name
          )}
        </button>
        <div className="cl-nav-links">
          {navLinks.map((l) => (
            <button
              key={l.id}
              className={`cl-nav-link ${active === l.id ? "active" : ""}`}
              onClick={() => go(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button className="cl-nav-cta" onClick={() => go("reserve")}>📅 Réserver</button>
        <button className="cl-hamburger" onClick={() => setMobOpen((v) => !v)}>☰</button>
      </nav>

      {mobOpen && (
        <div className="cl-mob-menu">
          {navLinks.map((l) => (
            <button key={l.id} onClick={() => go(l.id)}>{l.icon} {l.label}</button>
          ))}
        </div>
      )}

      <div className="cl-page-wrap">
        {active === "home" && (
          <HomeView restaurant={restaurant} menu={available} reviews={reviews} ratingAvg={ratingAvg} waLink={waLink} onGo={go} />
        )}
        {active === "menu" && (
          <MenuView restaurant={restaurant} menu={available} waLink={waLink} onOrder={(n, p) => { setPrefill({ name: n, price: p }); go("order"); }} />
        )}
        {active === "order" && (
          <OrderView restaurant={restaurant} menu={available} waLink={waLink} prefill={prefill} clearPrefill={() => setPrefill(null)} />
        )}
        {active === "reserve" && (
          <ReservationForm restaurantId={restaurant.id} theme={{ bg: "#ffffff", surface: "#f8f8f8", surfaceAlt: "#f0f0f0", text: "#111111", textMuted: "#666666", accent: "#111111", accentInk: "#ffffff", border: "#e0e0e0", radius: "10px" }} />
        )}
        {active === "reviews" && (
          <ReviewsView restaurant={restaurant} reviews={reviews} onAdded={(r) => setReviews((prev) => [r, ...prev])} />
        )}
      </div>

      <footer className="cl-footer">
        <div className="cl-footer-brand">{restaurant.name}</div>
        <div className="cl-footer-sub">
          {restaurant.cuisine || "Cuisine africaine"} — {restaurant.city}
        </div>
        <div className="cl-footer-links">
          {navLinks.map((l) => (
            <button key={l.id} onClick={() => go(l.id)}>{l.label}</button>
          ))}
        </div>
        <div className="cl-footer-credit">
          Propulsé par <a href="/">Resto BF</a>
        </div>
      </footer>

      {wa && (
        <a className="cl-fab" href={waLink(`Bonjour ${restaurant.name} !`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
      )}
    </div>
  );
}


/* === Subviews === */

function HomeView({ restaurant, menu, reviews, ratingAvg, waLink, onGo }: {
  restaurant: TemplateProps["restaurant"];
  menu: PublicMenuItem[];
  reviews: TemplateProps["reviews"];
  ratingAvg: string | null;
  waLink: (t: string) => string;
  onGo: (id: any) => void;
}) {
  const preview = menu.slice(0, 4);
  const revPreview = reviews.slice(0, 3);
  return (
    <div>
      <div className="cl-hero">
        <div className="cl-hero-inner">
          <div>
            <div className="cl-eyebrow">{restaurant.cuisine || "Restaurant"} · {restaurant.city}</div>
            <h1 className="cl-hero-title">
              Bienvenue <em>chez {restaurant.name}</em>
            </h1>
            <p className="cl-hero-sub">
              {restaurant.description || "Cuisine authentique servie avec le sourire."}
            </p>
            <div className="cl-hero-btns">
              <button className="cl-btn cl-btn-wa" onClick={() => onGo("menu")}>🍲 Voir le menu</button>
              <button className="cl-btn cl-btn-outline-light" onClick={() => onGo("reserve")}>📅 Réserver</button>
            </div>
          </div>
          <div className="cl-hero-img" aria-hidden />
        </div>
        <div className="cl-hero-stats">
          <div className="cl-hero-stat"><span className="cl-stat-num">{menu.length}</span><span className="cl-stat-lbl">Plats</span></div>
          <div className="cl-hero-stat"><span className="cl-stat-num">{ratingAvg ? `${ratingAvg}⭐` : "—"}</span><span className="cl-stat-lbl">Note</span></div>
          <div className="cl-hero-stat"><span className="cl-stat-num">{reviews.length}</span><span className="cl-stat-lbl">Avis</span></div>
        </div>
      </div>

      <div className="cl-info-band">
        <div className="cl-info-band-inner">
          <div className="cl-info-item">📞 <span>{restaurant.phone || "—"}</span></div>
          <div className="cl-info-item">📍 <span>{restaurant.address || restaurant.city}</span></div>
          <div className="cl-info-item">🕐 <span>{restaurant.hours || "—"}</span></div>
        </div>
      </div>

      <section className="cl-section">
        <div className="cl-container">
          <div className="cl-sec-head center">
            <div className="cl-sec-label">Pourquoi nous choisir</div>
            <h2 className="cl-sec-title">Une expérience complète</h2>
          </div>
          <div className="cl-features">
            {[
              { i: "🔥", t: "Grillades au feu de bois", d: "Nos viandes sont marinées et grillées à la commande." },
              { i: "🛒", t: "Commande en ligne", d: "Commandez directement via WhatsApp sans vous déplacer." },
              { i: "📅", t: "Réservation facile", d: "Réservez votre table en quelques secondes, 7j/7." },
              { i: "⭐", t: "Clients satisfaits", d: "Plus de 95% de nos clients reviennent." },
            ].map((f) => (
              <div key={f.t} className="cl-card cl-feat">
                <div className="cl-feat-icon">{f.i}</div>
                <div className="cl-feat-title">{f.t}</div>
                <div className="cl-feat-desc">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cl-divider" />

      <section className="cl-section cl-section-alt">
        <div className="cl-container">
          <div className="cl-sec-head row">
            <div>
              <div className="cl-sec-label">Notre carte</div>
              <h2 className="cl-sec-title">Quelques spécialités</h2>
            </div>
            <button className="cl-btn cl-btn-outline cl-btn-sm" onClick={() => onGo("menu")}>Voir tout →</button>
          </div>
          <div className="cl-menu-preview">
            {preview.length ? preview.map((d) => (
              <button key={d.id} className="cl-card cl-dish-mini" onClick={() => onGo("menu")}>
                <div className="cl-dish-mini-icon">🍽️</div>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div className="cl-dish-mini-cat">{d.category}</div>
                  <div className="cl-dish-mini-name">{d.name}</div>
                </div>
                <div className="cl-dish-mini-price">{d.price.toLocaleString("fr-FR")} F</div>
              </button>
            )) : <p style={{ color: "var(--cl-muted)" }}>Aucun plat encore.</p>}
          </div>
        </div>
      </section>

      <div className="cl-divider" />

      <section className="cl-section">
        <div className="cl-container">
          <div className="cl-sec-head row">
            <div>
              <div className="cl-sec-label">Ce qu'ils disent</div>
              <h2 className="cl-sec-title">Avis de nos clients</h2>
            </div>
            <button className="cl-btn cl-btn-outline cl-btn-sm" onClick={() => onGo("reviews")}>Tous les avis →</button>
          </div>
          <div className="cl-reviews-row">
            {revPreview.length ? revPreview.map((r) => (
              <div key={r.id} className="cl-card cl-rev-card">
                <div className="cl-rev-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <div className="cl-rev-text">"{r.comment}"</div>
                <div className="cl-rev-name">{r.author_name}</div>
              </div>
            )) : <p style={{ color: "var(--cl-muted)" }}>Aucun avis encore.</p>}
          </div>
        </div>
      </section>

      <div className="cl-divider" />

      <section className="cl-section cl-section-alt">
        <div className="cl-container" style={{ textAlign: "center" }}>
          <div className="cl-sec-label">Prêt ?</div>
          <h2 className="cl-sec-title">Réservez votre table ce soir</h2>
          <p className="cl-sec-sub" style={{ margin: "0 auto 28px" }}>Places limitées. Réservez maintenant.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="cl-btn cl-btn-green" onClick={() => onGo("reserve")}>📅 Réserver maintenant</button>
            <a className="cl-btn cl-btn-wa" href={waLink(`Bonjour ${restaurant.name} !`)} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function MenuView({ restaurant, menu, waLink, onOrder }: {
  restaurant: TemplateProps["restaurant"];
  menu: PublicMenuItem[];
  waLink: (t: string) => string;
  onOrder: (name: string, price: number) => void;
}) {
  const cats = useMemo(() => ["Tout", ...Array.from(new Set(menu.map((d) => d.category)))], [menu]);
  const [active, setActive] = useState("Tout");
  const [open, setOpen] = useState<PublicMenuItem | null>(null);
  const filtered = active === "Tout" ? menu : menu.filter((d) => d.category === active);

  return (
    <>
      <div className="cl-page-hero">
        <h1>Notre Menu</h1>
        <p>{menu.length} plats · {restaurant.cuisine || "Cuisine africaine"}</p>
      </div>
      <div className="cl-cat-bar">
        <div className="cl-cat-bar-inner">
          {cats.map((c) => (
            <button key={c} className={`cl-cat-pill ${c === active ? "active" : ""}`} onClick={() => setActive(c)}>{c}</button>
          ))}
        </div>
      </div>
      <section className="cl-section">
        <div className="cl-container">
          {filtered.length ? (
            <div className="cl-dishes-grid">
              {filtered.map((d) => (
                <button key={d.id} className="cl-card cl-dish-card" onClick={() => setOpen(d)}>
                  <div className="cl-dish-img">
                    {d.image_url ? <StorageImage path={d.image_url} alt={d.name} className="w-full h-full object-cover" /> : "🍽️"}
                    <span className="cl-dish-avail cl-badge cl-badge-green">✅</span>
                  </div>
                  <div className="cl-dish-body">
                    <div className="cl-dish-cat">{d.category}</div>
                    <div className="cl-dish-name">{d.name}</div>
                    {d.description && <div className="cl-dish-desc">{d.description}</div>}
                    <div className="cl-dish-foot">
                      <span className="cl-dish-price">{d.price.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="cl-empty">🍽️<br /><br />Aucun plat ici.</div>
          )}
        </div>
      </section>

      {open && (
        <div className="cl-modal-bg open" onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="cl-modal-box">
            <div className="cl-dm-img">
              {open.image_url ? <StorageImage path={open.image_url} alt={open.name} className="w-full h-full object-cover" /> : "🍽️"}
            </div>
            <div className="cl-dm-body">
              <button className="cl-modal-close" onClick={() => setOpen(null)}>✕</button>
              <div className="cl-dm-cat">{open.category}</div>
              <div className="cl-dm-name">{open.name}</div>
              {open.description && <div className="cl-dm-desc">{open.description}</div>}
              <div className="cl-dm-price">{open.price.toLocaleString("fr-FR")} FCFA</div>
              <div className="cl-dm-actions">
                <button className="cl-btn cl-btn-green" onClick={() => { onOrder(open.name, open.price); setOpen(null); }}>🛒 Commander</button>
                <a className="cl-btn cl-btn-wa" target="_blank" rel="noopener noreferrer" href={waLink(`Bonjour ! Je voudrais *${open.name}* (${open.price.toLocaleString("fr-FR")} FCFA).`)}>💬 WhatsApp</a>
                <button className="cl-btn cl-btn-outline cl-btn-sm" onClick={() => setOpen(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OrderView({ restaurant, menu, waLink, prefill, clearPrefill }: {
  restaurant: TemplateProps["restaurant"];
  menu: PublicMenuItem[];
  waLink: (t: string) => string;
  prefill: { name: string; price: number } | null;
  clearPrefill: () => void;
}) {
  const cats = useMemo(() => ["Tout", ...Array.from(new Set(menu.map((d) => d.category)))], [menu]);
  const [active, setActive] = useState("Tout");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [delMode, setDelMode] = useState<"place" | "livraison">("place");
  const [form, setForm] = useState({ name: "", phone: "", addr: "", note: "" });

  const didPrefill = useRef(false);
  useEffect(() => {
    if (prefill && !didPrefill.current) {
      didPrefill.current = true;
      addItem(prefill.name, prefill.price);
      clearPrefill();
    }
  }, [prefill, clearPrefill]);

  const addItem = (name: string, price: number) => {
    setCart((c) => {
      const ex = c.find((x) => x.name === name);
      if (ex) return c.map((x) => x.name === name ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { name, price, qty: 1 }];
    });
  };
  const changeQty = (name: string, d: number) => {
    setCart((c) => c.flatMap((x) => x.name === name ? (x.qty + d <= 0 ? [] : [{ ...x, qty: x.qty + d }]) : [x]));
  };

  const filtered = active === "Tout" ? menu : menu.filter((d) => d.category === active);
  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  const submit = () => {
    if (!cart.length) return toast.error("Panier vide");
    if (!form.name.trim() || !form.phone.trim()) return toast.error("Nom et téléphone requis");
    const items = cart.map((c) => `• ${c.name} x${c.qty} = ${(c.qty * c.price).toLocaleString("fr-FR")} FCFA`).join("\n");
    let msg = `🛒 *Commande — ${restaurant.name}*\n\n👤 ${form.name}\n📞 ${form.phone}\n🚀 ${delMode === "livraison" ? "Livraison" : "Sur place"}`;
    if (form.addr) msg += `\n📍 ${form.addr}`;
    msg += `\n\n${items}\n\n💰 *Total: ${total.toLocaleString("fr-FR")} FCFA*`;
    if (form.note) msg += `\n💬 ${form.note}`;
    window.open(waLink(msg), "_blank");
    setCart([]);
    setForm({ name: "", phone: "", addr: "", note: "" });
    toast.success("Commande envoyée 🎉");
  };

  return (
    <>
      <div className="cl-page-hero">
        <h1>🛒 Passer une commande</h1>
        <p>Choisissez vos plats et envoyez via WhatsApp</p>
      </div>
      <div className="cl-order-wrap">
        <div>
          <div className="cl-catalogue-title">Choisissez vos plats</div>
          <div className="cl-cat-pills">
            {cats.map((c) => (
              <button key={c} className={`cl-cat-pill ${c === active ? "active" : ""}`} onClick={() => setActive(c)}>{c}</button>
            ))}
          </div>
          <div className="cl-catalogue-grid">
            {filtered.length ? filtered.map((d) => (
              <div key={d.id} className="cl-card cl-cat-item" onClick={() => addItem(d.name, d.price)}>
                <div className="cl-cat-item-img">
                  {d.image_url ? <StorageImage path={d.image_url} alt={d.name} className="w-full h-full object-cover" /> : "🍽️"}
                </div>
                <div className="cl-cat-item-body">
                  <div className="cl-cat-item-name">{d.name}</div>
                  <div className="cl-cat-item-foot">
                    <span className="cl-cat-item-price">{d.price.toLocaleString("fr-FR")} F</span>
                    <button className="cl-cat-item-add" onClick={(e) => { e.stopPropagation(); addItem(d.name, d.price); }}>+</button>
                  </div>
                </div>
              </div>
            )) : <p style={{ color: "var(--cl-muted)", gridColumn: "1/-1", padding: 20 }}>Aucun plat.</p>}
          </div>
        </div>

        <div>
          <div className="cl-cart-sticky">
            <div className="cl-card cl-cart-box">
              <div className="cl-cart-head">
                <h3>🛒 Mon panier</h3>
                <span className="cl-cart-count">{count}</span>
              </div>
              <div className="cl-cart-body">
                {cart.length ? cart.map((c) => (
                  <div key={c.name} className="cl-cart-row">
                    <div className="cl-cart-row-name">{c.name}</div>
                    <div className="cl-cart-qty">
                      <button className="cl-qty-btn" onClick={() => changeQty(c.name, -1)}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 800, minWidth: 16, textAlign: "center" }}>{c.qty}</span>
                      <button className="cl-qty-btn" onClick={() => changeQty(c.name, 1)}>+</button>
                    </div>
                    <div className="cl-cart-row-price">{(c.qty * c.price).toLocaleString("fr-FR")} F</div>
                  </div>
                )) : <div className="cl-cart-empty">Ajoutez des plats</div>}
              </div>
              <div className="cl-cart-total-row">
                <span className="cl-cart-total-lbl">Total</span>
                <span className="cl-cart-total-val">{total.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="cl-cart-form">
                <div className="cl-lbl">Mode de récupération</div>
                <div className="cl-del-toggle">
                  <div className={`cl-del-opt ${delMode === "place" ? "active" : ""}`} onClick={() => setDelMode("place")}>🏠 Sur place</div>
                  <div className={`cl-del-opt ${delMode === "livraison" ? "active" : ""}`} onClick={() => setDelMode("livraison")}>🛵 Livraison</div>
                </div>
                <div className="cl-form-group"><label>Nom *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" /></div>
                <div className="cl-form-group"><label>Téléphone *</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+226 70 00 00 00" /></div>
                {delMode === "livraison" && (
                  <div className="cl-form-group"><label>Adresse</label><input value={form.addr} onChange={(e) => setForm({ ...form, addr: e.target.value })} placeholder="Quartier, rue..." /></div>
                )}
                <div className="cl-form-group"><label>Note</label><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Pas trop épicé..." /></div>
                <button className="cl-btn cl-btn-green cl-btn-block" onClick={submit}>💬 Envoyer via WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ReserveView({ restaurant, waLink }: { restaurant: TemplateProps["restaurant"]; waLink: (t: string) => string }) {
  const [form, setForm] = useState({ name: "", phone: "", date: "", occ: "", msg: "" });
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const times = ["12h00", "12h30", "13h00", "13h30", "19h00", "19h30", "20h00", "20h30", "21h00", "21h30", "22h00", "22h30"];
  const guestList = ["1", "2", "3", "4", "5", "6", "7", "8+"];

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return toast.error("Nom et téléphone requis");
    if (!form.date) return toast.error("Choisissez une date");
    if (!time) return toast.error("Choisissez une heure");
    if (!guests) return toast.error("Indiquez le nombre de personnes");
    setBusy(true);
    const partySize = Number(guests.replace("+", "")) || 8;
    const t24 = time.replace("h", ":");
    const { error } = await supabase.from("reservations").insert({
      restaurant_id: restaurant.id,
      customer_name: form.name,
      customer_phone: form.phone,
      party_size: partySize,
      reservation_date: form.date,
      reservation_time: t24,
      notes: [form.occ && `Occasion: ${form.occ}`, form.msg].filter(Boolean).join(" — "),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    let wa = `📅 *Réservation — ${restaurant.name}*\n\n👤 ${form.name}\n📞 ${form.phone}\n📅 ${form.date} à ${time}\n👥 ${guests} personne(s)`;
    if (form.occ) wa += `\n🎉 ${form.occ}`;
    if (form.msg) wa += `\n💬 ${form.msg}`;
    window.open(waLink(wa), "_blank");
    setDone(true);
  };

  const reset = () => {
    setForm({ name: "", phone: "", date: "", occ: "", msg: "" });
    setTime("");
    setGuests("");
    setDone(false);
  };

  return (
    <>
      <div className="cl-page-hero">
        <h1>📅 Réserver une table</h1>
        <p>Réservez en ligne, confirmation rapide !</p>
      </div>
      <div className="cl-res-wrap">
        <div>
          {!done ? (
            <div className="cl-card cl-res-card">
              <p className="cl-step-title">👤 Vos coordonnées</p>
              <div className="cl-form-2col">
                <div className="cl-form-group"><label>Nom *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alassane Kaboré" /></div>
                <div className="cl-form-group"><label>Téléphone *</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+226 70 00 00 00" /></div>
              </div>
              <p className="cl-step-title" style={{ marginTop: 18 }}>📅 Date & heure</p>
              <div className="cl-form-group" style={{ marginBottom: 14 }}><label>Date *</label><input type="date" min={new Date().toISOString().split("T")[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <p className="cl-sub-label">Heure *</p>
              <div className="cl-time-grid">
                {times.map((t) => (
                  <div key={t} className={`cl-time-slot ${time === t ? "active" : ""}`} onClick={() => setTime(t)}>{t}</div>
                ))}
              </div>
              <p className="cl-step-title" style={{ marginTop: 18 }}>👥 Nombre de personnes *</p>
              <div className="cl-guests-row">
                {guestList.map((g) => (
                  <button key={g} className={`cl-guest-btn ${guests === g ? "active" : ""}`} onClick={() => setGuests(g)}>{g}</button>
                ))}
              </div>
              <p className="cl-step-title" style={{ marginTop: 18 }}>🎉 Extras</p>
              <div className="cl-form-group"><label>Occasion</label><input value={form.occ} onChange={(e) => setForm({ ...form, occ: e.target.value })} placeholder="Anniversaire, réunion..." /></div>
              <div className="cl-form-group"><label>Message</label><textarea value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} placeholder="Demandes spéciales, allergies..." /></div>
              <button className="cl-btn cl-btn-green cl-btn-block" disabled={busy} onClick={submit}>{busy ? "Envoi..." : "✅ Confirmer ma réservation"}</button>
            </div>
          ) : (
            <div className="cl-card cl-success-box">
              <div className="cl-success-icon">🎉</div>
              <div className="cl-success-title">Réservation envoyée !</div>
              <div className="cl-success-sub">Table pour {guests} personne(s) le {form.date} à {time}.</div>
              <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="cl-btn cl-btn-outline" onClick={reset}>+ Nouvelle réservation</button>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="cl-card cl-side-card">
            <div className="cl-side-title">Infos pratiques</div>
            <div className="cl-side-row"><span className="cl-side-icon">📍</span><div><div className="cl-side-lbl">Adresse</div><div className="cl-side-val">{restaurant.address || "—"}</div></div></div>
            <div className="cl-side-row"><span className="cl-side-icon">📞</span><div><div className="cl-side-lbl">Téléphone</div><div className="cl-side-val">{restaurant.phone || "—"}</div></div></div>
            <div className="cl-side-row"><span className="cl-side-icon">🕐</span><div><div className="cl-side-lbl">Horaires</div><div className="cl-side-val">{restaurant.hours || "—"}</div></div></div>
          </div>
          <div className="cl-wa-box">
            <p>Préférez réserver par WhatsApp ?</p>
            <a className="cl-btn cl-btn-block" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" }} target="_blank" rel="noopener noreferrer" href={waLink(`Bonjour ${restaurant.name} ! Je voudrais réserver.`)}>💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </>
  );
}

function ReviewsView({ restaurant, reviews, onAdded }: {
  restaurant: TemplateProps["restaurant"];
  reviews: TemplateProps["reviews"];
  onAdded: (r: TemplateProps["reviews"][number]) => void;
}) {
  const [filterStar, setFilterStar] = useState(0);
  const [picked, setPicked] = useState(0);
  const [form, setForm] = useState({ name: "", occ: "", text: "" });
  const [busy, setBusy] = useState(false);

  const counts = [5, 4, 3, 2, 1].map((n) => reviews.filter((r) => r.rating === n).length);
  const max = Math.max(...counts, 1);
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const filtered = reviews.filter((r) => filterStar === 0 || r.rating === filterStar);

  const submit = async () => {
    if (!picked) return toast.error("Choisissez une note");
    if (!form.name.trim()) return toast.error("Entrez votre nom");
    if (!form.text.trim()) return toast.error("Écrivez votre avis");
    setBusy(true);
    const { data, error } = await supabase.from("reviews").insert({
      restaurant_id: restaurant.id,
      author_name: form.name,
      rating: picked,
      comment: form.text,
    }).select("id, author_name, rating, comment, created_at").maybeSingle();
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data) onAdded(data as any);
    toast.success("Merci pour votre avis ! ⭐ (en attente de validation)");
    setForm({ name: "", occ: "", text: "" });
    setPicked(0);
  };

  return (
    <>
      <div className="cl-page-hero">
        <h1>⭐ Avis clients</h1>
        <p>{reviews.length} avis · Note {avg || "—"}/5</p>
      </div>
      <section className="cl-section">
        <div className="cl-container">
          <div className="cl-card cl-summary-wrap">
            <div className="cl-summary-big">
              <div className="cl-summary-num">{avg || "—"}</div>
              <div className="cl-summary-stars">{avg ? "★".repeat(Math.round(parseFloat(avg))) + "☆".repeat(5 - Math.round(parseFloat(avg))) : "☆☆☆☆☆"}</div>
              <div className="cl-summary-count">{reviews.length} avis</div>
            </div>
            <div className="cl-bars">
              {[5, 4, 3, 2, 1].map((n, i) => (
                <div key={n} className="cl-bar-row">
                  <span className="cl-bar-lbl">{n}</span>
                  <div className="cl-bar-track"><div className="cl-bar-fill" style={{ width: `${(counts[i] / max) * 100}%` }} /></div>
                  <span className="cl-bar-count">{counts[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cl-filt-row">
            <button className={`cl-filt-btn ${filterStar === 0 ? "active" : ""}`} onClick={() => setFilterStar(0)}>Tous</button>
            {[5, 4, 3].map((n) => (
              <button key={n} className={`cl-filt-btn ${filterStar === n ? "active" : ""}`} onClick={() => setFilterStar(n)}>{"⭐".repeat(n)}</button>
            ))}
          </div>

          {filtered.length ? (
            <div className="cl-reviews-grid">
              {filtered.map((r) => (
                <div key={r.id} className="cl-card cl-rev-card2">
                  <div className="cl-rev-head">
                    <div className="cl-rev-avatar">{r.author_name[0]?.toUpperCase()}</div>
                    <div className="cl-rev-info">
                      <div className="cl-rev-name">{r.author_name}</div>
                      <div className="cl-rev-date">{new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                    </div>
                    <div className="cl-rev-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  </div>
                  {r.comment && <div className="cl-rev-text">"{r.comment}"</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="cl-empty-state"><div className="cl-empty-icon">💬</div><p>{filterStar ? `Aucun avis ${filterStar}⭐` : "Soyez le premier !"}</p></div>
          )}

          <div className="cl-divider" style={{ margin: "40px 0" }} />

          <div className="cl-card cl-add-wrap">
            <div className="cl-add-title">✍️ Donnez votre avis</div>
            <div className="cl-stars-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`cl-star-pick ${n <= picked ? "on" : ""}`} onClick={() => setPicked(n)}>⭐</button>
              ))}
            </div>
            <div className="cl-form-2col">
              <div className="cl-form-group"><label>Nom *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mariam O." /></div>
              <div className="cl-form-group"><label>Occasion</label><input value={form.occ} onChange={(e) => setForm({ ...form, occ: e.target.value })} placeholder="Déjeuner, anniversaire..." /></div>
            </div>
            <div className="cl-form-group"><label>Votre avis *</label><textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Partagez votre expérience..." /></div>
            <button className="cl-btn cl-btn-green cl-btn-block" disabled={busy} onClick={submit}>{busy ? "Envoi..." : "⭐ Publier mon avis"}</button>
          </div>
        </div>
      </section>
    </>
  );
}

const CL_CSS = `
.cl-root{--cl-green:#2d6a4f;--cl-green-light:#40916c;--cl-green-soft:rgba(45,106,79,0.10);--cl-accent:#f4a261;--cl-bg:#fafaf8;--cl-bg2:#f3f2ee;--cl-bg3:#e8e6df;--cl-text:#1a1a14;--cl-muted:#6b6b55;--cl-border:#dddbd2;--cl-card:#ffffff;--cl-radius:8px;--cl-shadow:0 2px 12px rgba(0,0,0,0.07);font-family:'Segoe UI',-apple-system,sans-serif;background:var(--cl-bg);color:var(--cl-text);min-height:100vh;}
.cl-root *,.cl-root *::before,.cl-root *::after{box-sizing:border-box;}
.cl-nav{position:sticky;top:0;left:0;right:0;z-index:100;background:var(--cl-green);height:58px;display:flex;align-items:center;padding:0 24px;gap:24px;}
.cl-brand{color:#fff;font-size:17px;font-weight:800;background:none;border:none;cursor:pointer;padding:0;}
.cl-nav-links{display:flex;gap:4px;flex:1;}
.cl-nav-link{color:rgba(255,255,255,0.75);font-size:13px;font-weight:600;background:none;border:none;cursor:pointer;padding:6px 12px;border-radius:6px;transition:all 0.2s;}
.cl-nav-link:hover,.cl-nav-link.active{color:#fff;background:rgba(255,255,255,0.15);}
.cl-nav-cta{background:#fff;color:var(--cl-green);font-size:12px;font-weight:800;padding:8px 16px;border-radius:6px;border:none;cursor:pointer;flex-shrink:0;}
.cl-nav-cta:hover{background:var(--cl-accent);color:#fff;}
.cl-hamburger{display:none;background:none;border:none;color:#fff;font-size:22px;cursor:pointer;margin-left:auto;}
.cl-mob-menu{position:sticky;top:58px;background:var(--cl-green);padding:12px 24px;display:flex;flex-direction:column;gap:4px;z-index:99;}
.cl-mob-menu button{color:rgba(255,255,255,0.85);font-size:14px;font-weight:600;background:none;border:none;text-align:left;cursor:pointer;padding:10px 14px;border-radius:6px;}
.cl-mob-menu button:hover{background:rgba(255,255,255,0.15);color:#fff;}
.cl-container{max-width:1060px;margin:0 auto;padding:0 24px;}
.cl-section{padding:64px 0;}.cl-section-alt{background:var(--cl-bg2);}
.cl-sec-label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:var(--cl-green);margin-bottom:8px;}
.cl-sec-title{font-size:clamp(22px,4vw,34px);font-weight:900;color:var(--cl-text);margin-bottom:10px;}
.cl-sec-sub{font-size:14px;color:var(--cl-muted);line-height:1.7;max-width:480px;}
.cl-sec-head{margin-bottom:40px;}.cl-sec-head.center{text-align:center;}.cl-sec-head.center .cl-sec-sub{margin:0 auto;}
.cl-sec-head.row{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.cl-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:var(--cl-radius);font-size:14px;font-weight:700;text-decoration:none;border:none;cursor:pointer;transition:all 0.2s;}
.cl-btn-green{background:var(--cl-green);color:#fff;box-shadow:0 4px 14px rgba(45,106,79,0.3);}
.cl-btn-green:hover{background:var(--cl-green-light);transform:translateY(-1px);}
.cl-btn-outline{background:transparent;border:2px solid var(--cl-green);color:var(--cl-green);}
.cl-btn-outline:hover{background:var(--cl-green-soft);}
.cl-btn-outline-light{background:transparent;border:2px solid rgba(255,255,255,0.5);color:#fff;}
.cl-btn-outline-light:hover{background:rgba(255,255,255,0.15);}
.cl-btn-wa{background:rgba(37,211,102,0.12);color:#25d366;border:1px solid rgba(37,211,102,0.3);}
.cl-btn-wa:hover{background:#25d366;color:#fff;}
.cl-btn-sm{padding:8px 16px;font-size:12px;}.cl-btn-block{width:100%;justify-content:center;}
.cl-card{background:var(--cl-card);border:1px solid var(--cl-border);border-radius:var(--cl-radius);box-shadow:var(--cl-shadow);}
.cl-divider{height:1px;background:var(--cl-border);}
.cl-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:800;}
.cl-badge-green{background:rgba(45,106,79,0.12);color:var(--cl-green);}
.cl-hero{position:relative;color:#fff;padding:80px 0 0;overflow:hidden;background:#1a0a0a;}
.cl-hero::before{content:"";position:absolute;inset:0;background-image:url("/hero-jollof.png");background-size:cover;background-position:center;opacity:0.55;z-index:0;}
.cl-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,8,8,0.55) 0%,rgba(20,8,8,0.9) 100%);z-index:0;}
.cl-hero-inner{position:relative;z-index:1;max-width:1060px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
.cl-eyebrow{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:var(--cl-accent);margin-bottom:14px;}
.cl-hero-title{font-size:clamp(28px,5vw,52px);font-weight:900;line-height:1.1;margin-bottom:16px;text-shadow:0 2px 20px rgba(0,0,0,0.5);}
.cl-hero-title em{color:var(--cl-accent);font-style:normal;}
.cl-hero-sub{font-size:15px;opacity:0.92;line-height:1.7;margin-bottom:28px;text-shadow:0 1px 10px rgba(0,0,0,0.5);}
.cl-hero-btns{display:flex;gap:12px;flex-wrap:wrap;}
.cl-hero-img{background-image:url("/hero-jollof.png");background-size:contain;background-repeat:no-repeat;background-position:center;border-radius:12px;height:380px;}
.cl-hero-stats{position:relative;z-index:1;display:flex;gap:0;background:rgba(0,0,0,0.55);margin-top:48px;backdrop-filter:blur(6px);}
.cl-hero-stat{flex:1;text-align:center;padding:20px 12px;border-right:1px solid rgba(255,255,255,0.1);}
.cl-hero-stat:last-child{border-right:none;}
.cl-stat-num{font-size:26px;font-weight:900;color:var(--cl-accent);display:block;}
.cl-stat-lbl{font-size:10px;opacity:0.65;text-transform:uppercase;letter-spacing:0.5px;}
.cl-info-band{background:var(--cl-accent);}
.cl-info-band-inner{max-width:1060px;margin:0 auto;padding:16px 24px;display:flex;gap:32px;align-items:center;flex-wrap:wrap;justify-content:center;}
.cl-info-item{display:flex;align-items:center;gap:8px;color:#fff;font-size:13px;font-weight:600;}
.cl-features{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;}
.cl-feat{padding:24px;text-align:center;}
.cl-feat-icon{font-size:36px;margin-bottom:14px;}
.cl-feat-title{font-size:14px;font-weight:800;margin-bottom:6px;}
.cl-feat-desc{font-size:13px;color:var(--cl-muted);line-height:1.6;}
.cl-menu-preview{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;}
.cl-dish-mini{display:flex;align-items:center;gap:14px;padding:14px;background:var(--cl-card);border:1px solid var(--cl-border);border-radius:var(--cl-radius);box-shadow:var(--cl-shadow);cursor:pointer;text-align:left;}
.cl-dish-mini:hover{transform:translateY(-2px);}
.cl-dish-mini-icon{width:52px;height:52px;border-radius:8px;background:var(--cl-bg2);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;}
.cl-dish-mini-name{font-size:14px;font-weight:700;margin-bottom:2px;color:var(--cl-text);}
.cl-dish-mini-cat{font-size:11px;color:var(--cl-green);font-weight:700;text-transform:uppercase;}
.cl-dish-mini-price{font-size:14px;font-weight:800;color:var(--cl-green);margin-left:auto;flex-shrink:0;}
.cl-reviews-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}
.cl-rev-card{padding:20px;}
.cl-rev-stars{color:var(--cl-accent);font-size:15px;margin-bottom:8px;}
.cl-rev-text{font-size:13px;color:var(--cl-muted);line-height:1.6;font-style:italic;margin-bottom:12px;}
.cl-rev-name{font-size:13px;font-weight:700;color:var(--cl-text);}
.cl-footer{background:var(--cl-green);color:#fff;padding:32px 24px;text-align:center;}
.cl-footer-brand{font-size:20px;font-weight:900;margin-bottom:6px;}
.cl-footer-sub{font-size:13px;opacity:0.7;margin-bottom:16px;}
.cl-footer-links{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;}
.cl-footer-links button{background:none;border:none;color:rgba(255,255,255,0.75);font-size:13px;cursor:pointer;}
.cl-footer-links button:hover{color:#fff;}
.cl-footer-credit{font-size:11px;opacity:0.5;}
.cl-footer-credit a{color:#fff;}
.cl-fab{position:fixed;bottom:24px;right:24px;width:54px;height:54px;border-radius:50%;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:200;}
.cl-page-hero{background:var(--cl-green);color:#fff;padding:48px 24px 40px;text-align:center;}
.cl-page-hero h1{font-size:clamp(24px,4vw,40px);font-weight:900;margin-bottom:8px;}
.cl-page-hero p{font-size:14px;opacity:0.8;}
.cl-cat-bar{background:#fff;border-bottom:1px solid var(--cl-border);position:sticky;top:58px;z-index:50;}
.cl-cat-bar-inner{max-width:1060px;margin:0 auto;padding:12px 24px;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;}
.cl-cat-bar-inner::-webkit-scrollbar{display:none;}
.cl-cat-pill{padding:7px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1.5px solid var(--cl-border);background:transparent;color:var(--cl-muted);cursor:pointer;white-space:nowrap;transition:all 0.2s;}
.cl-cat-pill.active,.cl-cat-pill:hover{background:var(--cl-green);color:#fff;border-color:var(--cl-green);}
.cl-dishes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;}
.cl-dish-card{cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;overflow:hidden;padding:0;text-align:left;border:1px solid var(--cl-border);background:#fff;}
.cl-dish-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.12);}
.cl-dish-img{height:150px;background:var(--cl-bg2);display:flex;align-items:center;justify-content:center;font-size:52px;position:relative;overflow:hidden;}
.cl-dish-avail{position:absolute;top:8px;right:8px;}
.cl-dish-body{padding:14px 16px;}
.cl-dish-cat{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--cl-green);margin-bottom:3px;}
.cl-dish-name{font-size:15px;font-weight:800;margin-bottom:4px;color:var(--cl-text);}
.cl-dish-desc{font-size:12px;color:var(--cl-muted);line-height:1.5;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-line-orient:vertical;overflow:hidden;}
.cl-dish-foot{display:flex;align-items:center;justify-content:space-between;}
.cl-dish-price{font-size:16px;font-weight:900;color:var(--cl-green);}
.cl-empty{text-align:center;padding:56px;color:var(--cl-muted);}
.cl-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;}
.cl-modal-box{background:#fff;border-radius:12px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;}
.cl-dm-img{height:200px;background:var(--cl-bg2);display:flex;align-items:center;justify-content:center;font-size:72px;border-radius:12px 12px 0 0;overflow:hidden;}
.cl-dm-body{padding:20px;position:relative;}
.cl-dm-cat{font-size:11px;font-weight:800;text-transform:uppercase;color:var(--cl-green);margin-bottom:4px;}
.cl-dm-name{font-size:22px;font-weight:900;margin-bottom:8px;color:var(--cl-text);}
.cl-dm-desc{font-size:14px;color:var(--cl-muted);line-height:1.7;margin-bottom:12px;}
.cl-dm-price{font-size:26px;font-weight:900;color:var(--cl-green);margin-bottom:20px;}
.cl-dm-actions{display:flex;gap:10px;flex-wrap:wrap;}
.cl-modal-close{position:absolute;top:8px;right:12px;background:none;border:none;font-size:20px;cursor:pointer;color:#999;padding:4px;}
.cl-res-wrap{max-width:860px;margin:0 auto;display:grid;grid-template-columns:1fr 300px;gap:32px;padding:40px 24px;}
.cl-res-card{padding:28px;}
.cl-step-title{font-size:13px;font-weight:800;color:var(--cl-green);text-transform:uppercase;letter-spacing:0.8px;margin:0 0 14px;padding-bottom:10px;border-bottom:1px solid var(--cl-border);}
.cl-time-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}
.cl-time-slot{padding:10px 4px;border:1.5px solid var(--cl-border);border-radius:var(--cl-radius);text-align:center;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;color:var(--cl-muted);background:#fff;}
.cl-time-slot:hover,.cl-time-slot.active{border-color:var(--cl-green);color:var(--cl-green);background:var(--cl-green-soft);}
.cl-guests-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.cl-guest-btn{width:44px;height:44px;border:1.5px solid var(--cl-border);border-radius:var(--cl-radius);text-align:center;line-height:40px;font-size:14px;font-weight:800;cursor:pointer;transition:all 0.2s;color:var(--cl-muted);background:#fff;}
.cl-guest-btn:hover,.cl-guest-btn.active{border-color:var(--cl-green);color:var(--cl-green);background:var(--cl-green-soft);}
.cl-side-card{padding:18px;margin-bottom:12px;}
.cl-side-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--cl-muted);margin-bottom:12px;}
.cl-side-row{display:flex;gap:10px;margin-bottom:10px;}
.cl-side-icon{font-size:18px;}
.cl-side-lbl{font-size:10px;font-weight:700;color:var(--cl-muted);text-transform:uppercase;}
.cl-side-val{font-size:13px;font-weight:600;color:var(--cl-text);}
.cl-wa-box{background:var(--cl-green);border-radius:var(--cl-radius);padding:18px;text-align:center;}
.cl-wa-box p{font-size:12px;color:rgba(255,255,255,0.85);margin-bottom:12px;line-height:1.5;}
.cl-success-box{text-align:center;padding:40px 20px;}
.cl-success-icon{font-size:56px;margin-bottom:14px;}
.cl-success-title{font-size:20px;font-weight:900;color:var(--cl-green);margin-bottom:8px;}
.cl-success-sub{font-size:14px;color:var(--cl-muted);}
.cl-sub-label{font-size:11px;font-weight:700;color:var(--cl-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
.cl-form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
.cl-form-group label{font-size:11px;font-weight:700;color:var(--cl-muted);text-transform:uppercase;letter-spacing:0.5px;}
.cl-form-group input,.cl-form-group select,.cl-form-group textarea{padding:11px 14px;background:var(--cl-bg);border:1.5px solid var(--cl-border);border-radius:var(--cl-radius);color:var(--cl-text);font-size:14px;outline:none;transition:all 0.2s;font-family:inherit;}
.cl-form-group input:focus,.cl-form-group select:focus,.cl-form-group textarea:focus{border-color:var(--cl-green);box-shadow:0 0 0 3px var(--cl-green-soft);}
.cl-form-group textarea{resize:vertical;min-height:80px;}
.cl-form-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.cl-order-wrap{max-width:1060px;margin:0 auto;padding:40px 24px;display:grid;grid-template-columns:1fr 380px;gap:32px;}
.cl-catalogue-title{font-size:16px;font-weight:800;margin-bottom:16px;color:var(--cl-text);}
.cl-cat-pills{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.cl-catalogue-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;}
.cl-cat-item{overflow:hidden;cursor:pointer;transition:transform 0.2s;}
.cl-cat-item:hover{transform:translateY(-2px);}
.cl-cat-item-img{height:100px;background:var(--cl-bg2);display:flex;align-items:center;justify-content:center;font-size:38px;overflow:hidden;}
.cl-cat-item-body{padding:10px 12px;}
.cl-cat-item-name{font-size:13px;font-weight:800;margin-bottom:6px;color:var(--cl-text);}
.cl-cat-item-foot{display:flex;align-items:center;justify-content:space-between;}
.cl-cat-item-price{font-size:13px;font-weight:900;color:var(--cl-green);}
.cl-cat-item-add{background:var(--cl-green);color:#fff;border:none;border-radius:6px;padding:3px 10px;font-size:13px;font-weight:800;cursor:pointer;}
.cl-cat-item-add:hover{background:var(--cl-green-light);}
.cl-cart-sticky{position:sticky;top:76px;}
.cl-cart-box{overflow:hidden;}
.cl-cart-head{background:var(--cl-green);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;}
.cl-cart-head h3{font-size:14px;font-weight:800;color:#fff;margin:0;}
.cl-cart-count{background:var(--cl-accent);color:#fff;font-size:11px;font-weight:800;padding:2px 8px;border-radius:10px;}
.cl-cart-body{padding:14px 18px;min-height:80px;max-height:260px;overflow-y:auto;}
.cl-cart-empty{text-align:center;padding:24px 0;color:var(--cl-muted);font-size:13px;}
.cl-cart-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--cl-border);}
.cl-cart-row:last-child{border-bottom:none;}
.cl-cart-row-name{flex:1;font-size:13px;font-weight:600;color:var(--cl-text);}
.cl-cart-qty{display:flex;align-items:center;gap:5px;}
.cl-qty-btn{width:24px;height:24px;border-radius:5px;background:var(--cl-bg2);border:1px solid var(--cl-border);cursor:pointer;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center;color:var(--cl-text);}
.cl-qty-btn:hover{background:var(--cl-green);color:#fff;border-color:var(--cl-green);}
.cl-cart-row-price{font-size:13px;font-weight:900;color:var(--cl-green);min-width:62px;text-align:right;}
.cl-cart-total-row{padding:12px 18px;border-top:2px solid var(--cl-border);display:flex;justify-content:space-between;background:var(--cl-bg2);}
.cl-cart-total-lbl{font-size:13px;font-weight:700;color:var(--cl-muted);}
.cl-cart-total-val{font-size:18px;font-weight:900;color:var(--cl-green);}
.cl-cart-form{padding:14px 18px 18px;}
.cl-del-toggle{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}
.cl-del-opt{padding:10px;border:1.5px solid var(--cl-border);border-radius:8px;text-align:center;cursor:pointer;font-size:12px;font-weight:700;transition:all 0.2s;color:var(--cl-muted);}
.cl-del-opt.active{border-color:var(--cl-green);color:var(--cl-green);background:var(--cl-green-soft);}
.cl-lbl{font-size:11px;font-weight:700;color:var(--cl-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
.cl-summary-wrap{max-width:760px;margin:0 auto 44px;display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:center;padding:24px;}
.cl-summary-big{text-align:center;}
.cl-summary-num{font-size:64px;font-weight:900;color:var(--cl-green);line-height:1;}
.cl-summary-stars{font-size:22px;color:var(--cl-accent);margin:4px 0;}
.cl-summary-count{font-size:12px;color:var(--cl-muted);}
.cl-bars{display:flex;flex-direction:column;gap:8px;}
.cl-bar-row{display:flex;align-items:center;gap:10px;}
.cl-bar-lbl{font-size:12px;font-weight:700;color:var(--cl-muted);width:16px;text-align:right;}
.cl-bar-track{flex:1;height:8px;background:var(--cl-bg3);border-radius:4px;overflow:hidden;}
.cl-bar-fill{height:100%;background:var(--cl-accent);border-radius:4px;transition:width 0.7s;}
.cl-bar-count{font-size:11px;color:var(--cl-muted);width:22px;}
.cl-filt-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;}
.cl-filt-btn{padding:7px 14px;border-radius:20px;font-size:12px;font-weight:700;border:1.5px solid var(--cl-border);background:#fff;color:var(--cl-muted);cursor:pointer;transition:all 0.2s;}
.cl-filt-btn.active,.cl-filt-btn:hover{background:var(--cl-green);color:#fff;border-color:var(--cl-green);}
.cl-reviews-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;margin-bottom:48px;}
.cl-rev-card2{padding:20px;}
.cl-rev-head{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.cl-rev-avatar{width:40px;height:40px;border-radius:50%;background:var(--cl-green-soft);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:var(--cl-green);flex-shrink:0;}
.cl-rev-info{flex:1;}
.cl-rev-date{font-size:11px;color:var(--cl-muted);}
.cl-add-wrap{max-width:560px;margin:0 auto;padding:28px;}
.cl-add-title{font-size:16px;font-weight:800;margin-bottom:20px;color:var(--cl-text);}
.cl-stars-row{display:flex;gap:8px;margin-bottom:20px;}
.cl-star-pick{font-size:32px;cursor:pointer;filter:grayscale(1);opacity:0.25;transition:all 0.2s;border:none;background:none;}
.cl-star-pick.on{filter:none;opacity:1;transform:scale(1.15);}
.cl-empty-state{text-align:center;padding:48px;color:var(--cl-muted);}
.cl-empty-icon{font-size:48px;margin-bottom:12px;}
@media(max-width:780px){
  .cl-nav-links,.cl-nav-cta{display:none;}
  .cl-hamburger{display:block;}
  .cl-hero-inner{grid-template-columns:1fr;}
  .cl-hero-img{height:200px;}
  .cl-section{padding:48px 0;}
  .cl-res-wrap,.cl-order-wrap{grid-template-columns:1fr;}
  .cl-time-grid{grid-template-columns:repeat(3,1fr);}
  .cl-form-2col{grid-template-columns:1fr;}
  .cl-summary-wrap{grid-template-columns:1fr;}
  .cl-cart-sticky{position:static;}
}
`;

/* ============= Dispatcher ============= */

export function renderTemplate(template: string | null, props: TemplateProps) {
  switch (template) {
    case "nuit":
    case "prem-nuit":
      return <TplPremiumNuit {...props} />;
    case "prem-royal":
      return <TplPremiumRoyal {...props} />;
    case "prem-feu":
      return <TplPremiumFeu {...props} />;
    case "prem-luxe":
      return <TplPremiumLuxe {...props} />;
    case "soleil":
    case "std-soleil":
      return <TplSoleil {...props} />;
    case "savane":
    case "std-savane":
      return <TplSavane {...props} />;
    case "marche":
    case "std-marche":
      return <TplMarche {...props} />;
    case "moderne":
    case "std-moderne":
      return <TplModerne {...props} />;
    case "classique":
    case "gratuit-classique":
    default:
      return <TplClassique {...props} />;
  }
}

