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
  CoverPlaceholder,
  buildWhatsAppLink,
  buildViewHref,
  avgRating,
  fmtPrice,
} from "./shared";
import { StorageImage } from "@/components/StorageImage";
import {
  TplPremiumFeu,
  TplPremiumLuxe,
  TplPremiumNuit,
  TplPremiumRoyal,
} from "./premium-templates";
import { useRestaurantFeatures } from "@/hooks/use-restaurant-features";
import { TplNuit } from "./templates/tpl-nuit";
import { TplSoleil } from "./templates/tpl-soleil";
import { TplSavane } from "./templates/tpl-savane";
import { TplModerne } from "./templates/tpl-moderne";

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

function MetaStrip({
  items,
  theme,
}: {
  items: { label: string; value: React.ReactNode }[];
  theme: Theme;
}) {
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
      style={{
        background: theme.surfaceAlt,
        borderTop: `1px solid ${theme.border}`,
        color: theme.text,
      }}
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
          <p
            className="text-[10px] font-bold uppercase mb-3"
            style={{ color: theme.accent, letterSpacing: "0.35em" }}
          >
            Visitez-nous
          </p>
          {restaurant.address && <p className="text-sm mb-2">{restaurant.address}</p>}
          <p className="text-sm whitespace-pre-line" style={{ color: theme.textMuted }}>
            {restaurant.hours ?? "Tous les jours · 11h — 23h"}
          </p>
        </div>
        <div>
          <p
            className="text-[10px] font-bold uppercase mb-3"
            style={{ color: theme.accent, letterSpacing: "0.35em" }}
          >
            Contact
          </p>
          <p className="text-sm">
            <a href={`tel:${restaurant.phone}`} className="hover:underline">
              {restaurant.phone}
            </a>
          </p>
          <p className="text-sm mt-1">
            <a href={`mailto:${restaurant.email}`} className="hover:underline">
              {restaurant.email}
            </a>
          </p>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm hover:opacity-90 transition"
              style={{
                background: theme.accent,
                color: theme.accentInk,
                borderRadius: theme.radius,
              }}
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
        <span>
          © {new Date().getFullYear()} {restaurant.name}. Tous droits réservés.
        </span>
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

function Stat({ label, value, theme }: { label: string; value: React.ReactNode; theme: Theme }) {
  return (
    <div>
      <p
        className="text-[10px] uppercase mb-2"
        style={{ color: theme.accent, letterSpacing: "0.4em" }}
      >
        {label}
      </p>
      <p
        className="text-2xl"
        style={{
          color: theme.text,
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
        }}
      >
        {value}
      </p>
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

const TPL_BG_CSS =
  "\n/* Standard template full-screen backgrounds */\n.tpl-page{position:relative;min-height:100vh;overflow:hidden;isolation:isolate;}\n.tpl-bg{position:fixed;inset:0;z-index:-2;overflow:hidden;background:transparent;}\n.tpl-bg img{width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.1);transform:scale(1.08);animation:tpl-bg-drift 22s ease-in-out infinite alternate;}\n.tpl-bg span{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.40),rgba(0,0,0,.80));}\n@keyframes tpl-bg-drift{0%{transform:scale(1.08) translate3d(-1.5%,0,0)}100%{transform:scale(1.18) translate3d(1.5%,-1.5%,0)}}\n@media(prefers-reduced-motion:reduce){.tpl-bg img{animation:none;transition:none}}\n";

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
/*  4. MARCHE — Indian-inspired dark green + orange/gold              */
/* ================================================================== */

export function TplMarche({ restaurant, menu, reviews, gallery, view }: TemplateProps) {
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

  const [mobOpen, setMobOpen] = React.useState(false);

  const activeView =
    view === "home" || view === "menu" || view === "about" || view === "reserve"
      ? view
      : "home";

  React.useEffect(() => {
    setMobOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeView]);

  return (
    <div
      className="tpl-page min-h-screen"
      style={{
        background: theme.bg,
        color: theme.text,
        fontFamily: "'Inter', sans-serif",
        isolation: "isolate",
      }}
    >
      <FontImport />
      <style>{TPL_BG_CSS}</style>

      <div className="tpl-bg" aria-hidden>
        <img src={BG_MARCHE} alt="" />
        <span />
      </div>

      {/* NAV */}
      <header
        className="sticky top-0 z-30 backdrop-blur"
        style={{ background: "rgba(13,40,24,0.92)", borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="max-w-7xl mx-auto px-5 py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="h-8 w-auto object-contain rounded"
              />
            ) : (
              <span className="text-2xl shrink-0">🌶️</span>
            )}
            <strong
              className="text-xl sm:text-2xl truncate"
              style={{ fontFamily: "'Playfair Display', serif", color: theme.accent }}
            >
              {restaurant.name}
            </strong>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <nav
              className="hidden md:flex gap-5 text-[12px] uppercase font-medium"
              style={{ letterSpacing: "0.15em", color: theme.textMuted }}
            >
              <a
                href={buildViewHref("home")}
                className={`hover:text-[#ed8023] ${activeView === "home" ? "text-[#ed8023] border-b border-[#ed8023]" : ""}`}
              >
                Accueil
              </a>
              <a
                href={buildViewHref("about")}
                className={`hover:text-[#ed8023] ${activeView === "about" ? "text-[#ed8023] border-b border-[#ed8023]" : ""}`}
              >
                À propos
              </a>
              <a
                href={buildViewHref("menu")}
                className={`hover:text-[#ed8023] ${activeView === "menu" ? "text-[#ed8023] border-b border-[#ed8023]" : ""}`}
              >
                Menu
              </a>
            </nav>
            {restaurant.plan !== "gratuit" && (
              <a
                href={buildViewHref("reserve")}
                className="px-5 py-2 rounded-full border text-xs font-semibold hover:bg-[#ed8023] hover:text-[#0d2818] transition"
                style={{ borderColor: theme.accent, color: theme.accent }}
              >
                Réserver
              </a>
            )}
          </div>
        </div>
      </header>

      {/* HOME VIEW */}
      {activeView === "home" && (
        <section id="home" className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, transparent 30%, #0d2818 90%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-5 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1
                className="leading-[0.95]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  color: theme.accent,
                }}
              >
                {restaurant.cuisine?.split(/[ &]/)[0] ?? restaurant.name}
                <br />
                <span style={{ color: theme.text }}>Restaurant</span>
              </h1>
              <p className="mt-6 max-w-lg leading-relaxed" style={{ color: theme.textMuted }}>
                {restaurant.description ??
                  `Plongez dans une expérience culinaire authentique à ${restaurant.city}. Épices, saveurs et tradition à chaque bouchée.`}
              </p>
              <div className="mt-8 flex gap-3 flex-wrap">
                <a
                  href={buildViewHref("menu")}
                  className="px-7 py-3 rounded-full font-bold text-sm hover:opacity-90 transition"
                  style={{ background: theme.accent, color: theme.accentInk }}
                >
                  Voir le menu
                </a>
                <a
                  href={wa ?? buildViewHref("menu")}
                  target={wa ? "_blank" : undefined}
                  rel={wa ? "noopener noreferrer" : undefined}
                  className="px-7 py-3 rounded-full font-bold text-sm border hover:bg-white/5 transition"
                  style={{ borderColor: theme.accent, color: theme.accent }}
                >
                  Commander
                </a>
              </div>
            </div>
            <div className="relative">
              {cover ? (
                <StorageImage
                  path={cover}
                  alt={restaurant.name}
                  className="w-full aspect-square object-cover rounded-full shadow-2xl"
                />
              ) : (
                <div
                  className="w-full aspect-square rounded-full"
                  style={{ background: "radial-gradient(circle,#ed8023,#7a3a0e)" }}
                >
                  <CoverPlaceholder background="transparent" stroke="rgba(255,255,255,0.92)" rounded="9999px" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* MENU VIEW */}
      {activeView === "menu" && (
        <section id="menu" className="py-20 px-5" style={{ background: theme.surfaceAlt }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="La carte" title="Notre menu" theme={theme} align="center" serif />
            <MenuGrid menu={menu} theme={theme} />
          </div>
        </section>
      )}

      {/* ABOUT VIEW */}
      {activeView === "about" && (
        <section id="about" className="py-20 px-5" style={{ background: theme.surfaceAlt }}>
          <div className="max-w-6xl mx-auto">
            <p
              className="text-center max-w-3xl mx-auto leading-relaxed mb-14"
              style={{ color: theme.textMuted }}
            >
              {restaurant.description ??
                `Découvrez l'art de la cuisine ${restaurant.cuisine ?? "traditionnelle"} dans un cadre chaleureux à ${restaurant.city}.`}
            </p>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {cover && (
                <div className="aspect-square rounded-full overflow-hidden mx-auto max-w-md">
                  <StorageImage
                    path={cover}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h2
                  className="mb-8"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                  }}
                >
                  Pourquoi nous choisir
                </h2>
                <ul className="space-y-4">
                  {[
                    ["Ingrédients frais", "Sélectionnés chaque matin sur les marchés locaux."],
                    ["Chefs passionnés", "Une équipe expérimentée à votre service."],
                    [
                      "Saveurs authentiques",
                      "Des recettes traditionnelles transmises depuis des générations.",
                    ],
                    ["Cadre chaleureux", "Une ambiance qui invite à savourer."],
                    ["Service rapide", "Commande et livraison sans attente."],
                  ].map(([t, d]) => (
                    <li key={t} className="flex items-start gap-3">
                      <span className="text-lg shrink-0 mt-0.5" style={{ color: theme.accent }}>
                        ✦
                      </span>
                      <div>
                        <strong>{t}</strong>
                        <span className="block text-sm" style={{ color: theme.textMuted }}>
                          {d}
                        </span>
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
      {activeView === "reserve" && restaurant.plan !== "gratuit" && (
        <section id="reserver" className="py-20 px-5" style={{ background: theme.surface, borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-3xl mx-auto">
            <SectionHead
              kicker="Réservation"
              title="Réservez votre table"
              theme={theme}
              align="center"
              serif
            />
            <AdvancedReservationForm
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
              theme={theme}
              waLink={wa}
            />
          </div>
        </section>
      )}

      {/* GALERIE & AVIS - Intégrés dans l'accueil */}
      {activeView === "home" && (
        <>
          {gallery.length > 0 && (
            <section id="galerie" className="py-20 px-5">
              <div className="max-w-6xl mx-auto">
                <SectionHead
                  kicker="Galerie"
                  title="Notre univers"
                  theme={theme}
                  align="center"
                  serif
                />
                <GalleryGrid gallery={gallery} theme={theme} />
              </div>
            </section>
          )}

          <section className="py-20 px-5">
            <div className="max-w-6xl mx-auto">
              <SectionHead
                kicker="Avis"
                title="Ils en parlent"
                theme={theme}
                align="center"
                serif
              />
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

type CartLine = { id: string; name: string; price: number; qty: number };

function ClassiqueGratuit({ restaurant, menu, reviews: initialReviews, gallery, view }: TemplateProps) {
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
  const activeView =
    view === "home" || view === "menu" || view === "order" || view === "reserve" || view === "reviews"
      ? view
      : active;
  const [prefill, setPrefill] = useState<{ id: string; name: string; price: number } | null>(null);

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
      <FontImport />
      <style>{CL_CSS}</style>

      <nav className="cl-nav">
        <a className="cl-brand" href={buildViewHref("home")}>
          {restaurant.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              style={{ maxHeight: "32px", objectFit: "contain" }}
            />
          ) : (
            restaurant.name
          )}
        </a>
        <div className="cl-nav-links">
          {navLinks.map((l) => (
            <a
              key={l.id}
              className={`cl-nav-link ${activeView === l.id ? "active" : ""}`}
              href={buildViewHref(l.id as any)}
            >
              {l.label}
            </a>
          ))}
        </div>
        <a className="cl-nav-cta" href={buildViewHref("reserve")}>
          📅 Réserver
        </a>
        <button className="cl-hamburger" onClick={() => setMobOpen((v) => !v)}>
          ☰
        </button>
      </nav>

      {mobOpen && (
        <div className="cl-mob-menu">
          {navLinks.map((l) => (
            <a key={l.id} href={buildViewHref(l.id as any)} onClick={() => setMobOpen(false)}>
              {l.icon} {l.label}
            </a>
          ))}
        </div>
      )}

      <div className="cl-page-wrap">
        {activeView === "home" && (
          <HomeView
            restaurant={restaurant}
            menu={available}
            reviews={reviews}
            ratingAvg={ratingAvg}
            waLink={waLink}
          />
        )}
        {activeView === "menu" && (
          <MenuView
            restaurant={restaurant}
            menu={available}
            waLink={waLink}
            onOrder={(id, n, p) => {
              setPrefill({ id, name: n, price: p });
              go("order");
            }}
          />
        )}
        {active === "order" && (
          <OrderView
            restaurant={restaurant}
            menu={available}
            waLink={waLink}
            prefill={prefill}
            clearPrefill={() => setPrefill(null)}
          />
        )}
        {activeView === "reserve" && (
          <ReservationForm
            restaurantId={restaurant.id}
            theme={{
              bg: "#ffffff",
              surface: "#f8f8f8",
              surfaceAlt: "#f0f0f0",
              text: "#111111",
              textMuted: "#666666",
              accent: "#111111",
              accentInk: "#ffffff",
              border: "#e0e0e0",
              radius: "10px",
            }}
          />
        )}
        {activeView === "reviews" && (
          <ReviewsView
            restaurant={restaurant}
            reviews={reviews}
            onAdded={(r) => setReviews((prev) => [r, ...prev])}
          />
        )}
      </div>

      <footer className="cl-footer">
        <div className="cl-footer-brand">{restaurant.name}</div>
        <div className="cl-footer-sub">
          {restaurant.cuisine || "Cuisine africaine"} — {restaurant.city}
        </div>
        <div className="cl-footer-links">
          {navLinks.map((l) => (
            <button key={l.id} onClick={() => go(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="cl-footer-credit">
          Propulsé par <a href="/">Resto BF</a>
        </div>
      </footer>

      {wa && (
        <a
          className="cl-fab"
          href={waLink(`Bonjour ${restaurant.name} !`)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          💬
        </a>
      )}
    </div>
  );
}

/* === Subviews === */

function HomeView({
  restaurant,
  menu,
  reviews,
  ratingAvg,
  waLink,
}: {
  restaurant: TemplateProps["restaurant"];
  menu: PublicMenuItem[];
  reviews: TemplateProps["reviews"];
  ratingAvg: string | null;
  waLink: (t: string) => string;
}) {
  const preview = menu.slice(0, 4);
  const revPreview = reviews.slice(0, 3);
  return (
    <div>
      <div className="cl-hero">
        <div className="cl-hero-inner">
          <div>
            <div className="cl-eyebrow">
              {restaurant.cuisine || "Restaurant"} · {restaurant.city}
            </div>
            <h1 className="cl-hero-title">
              Bienvenue <em>chez {restaurant.name}</em>
            </h1>
            <p className="cl-hero-sub">
              {restaurant.description || "Cuisine authentique servie avec le sourire."}
            </p>
            <div className="cl-hero-btns">
              <a className="cl-btn cl-btn-wa" href={buildViewHref("menu")}>🍲 Voir le menu</a>
              <a className="cl-btn cl-btn-outline-light" href={buildViewHref("reserve")}>📅 Réserver</a>
            </div>
          </div>
          <div className="cl-hero-img" aria-hidden />
        </div>
        <div className="cl-hero-stats">
          <div className="cl-hero-stat">
            <span className="cl-stat-num">{menu.length}</span>
            <span className="cl-stat-lbl">Plats</span>
          </div>
          <div className="cl-hero-stat">
            <span className="cl-stat-num">{ratingAvg ? `${ratingAvg}⭐` : "—"}</span>
            <span className="cl-stat-lbl">Note</span>
          </div>
          <div className="cl-hero-stat">
            <span className="cl-stat-num">{reviews.length}</span>
            <span className="cl-stat-lbl">Avis</span>
          </div>
        </div>
      </div>

      <div className="cl-info-band">
        <div className="cl-info-band-inner">
          <div className="cl-info-item">
            📞 <span>{restaurant.phone || "—"}</span>
          </div>
          <div className="cl-info-item">
            📍 <span>{restaurant.address || restaurant.city}</span>
          </div>
          <div className="cl-info-item">
            🕐 <span>{restaurant.hours || "—"}</span>
          </div>
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
              {
                i: "🔥",
                t: "Grillades au feu de bois",
                d: "Nos viandes sont marinées et grillées à la commande.",
              },
              {
                i: "🛒",
                t: "Commande en ligne",
                d: "Commandez en ligne et suivez la préparation en direct.",
              },
              {
                i: "📅",
                t: "Réservation facile",
                d: "Réservez votre table en quelques secondes, 7j/7.",
              },
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
            <a className="cl-btn cl-btn-outline cl-btn-sm" href={buildViewHref("menu")}>Voir tout →</a>
          </div>
          <div className="cl-menu-preview">
            {preview.length ? (
              preview.map((d) => (
                <a key={d.id} className="cl-card cl-dish-mini" href={buildViewHref("menu") }>
                  <div className="cl-dish-mini-icon">🍽️</div>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div className="cl-dish-mini-cat">{d.category}</div>
                    <div className="cl-dish-mini-name">{d.name}</div>
                  </div>
                  <div className="cl-dish-mini-price">{d.price.toLocaleString("fr-FR")} F</div>
                </a>
              ))
            ) : (
              <p style={{ color: "var(--cl-muted)" }}>Aucun plat encore.</p>
            )}
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
            <a className="cl-btn cl-btn-outline cl-btn-sm" href={buildViewHref("reviews")}>Tous les avis →</a>
          </div>
          <div className="cl-reviews-row">
            {revPreview.length ? (
              revPreview.map((r) => (
                <div key={r.id} className="cl-card cl-rev-card">
                  <div className="cl-rev-stars">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>
                  <div className="cl-rev-text">"{r.comment}"</div>
                  <div className="cl-rev-name">{r.author_name}</div>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--cl-muted)" }}>Aucun avis encore.</p>
            )}
          </div>
        </div>
      </section>

      <div className="cl-divider" />

      <section className="cl-section cl-section-alt">
        <div className="cl-container" style={{ textAlign: "center" }}>
          <div className="cl-sec-label">Prêt ?</div>
          <h2 className="cl-sec-title">Réservez votre table ce soir</h2>
          <p className="cl-sec-sub" style={{ margin: "0 auto 28px" }}>
            Places limitées. Réservez maintenant.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="cl-btn cl-btn-green" href={buildViewHref("reserve")}>📅 Réserver maintenant</a>
            <a
              className="cl-btn cl-btn-wa"
              href={waLink(`Bonjour ${restaurant.name} !`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function MenuView({
  restaurant,
  menu,
  waLink,
  onOrder,
}: {
  restaurant: TemplateProps["restaurant"];
  menu: PublicMenuItem[];
  waLink: (t: string) => string;
  onOrder: (id: string, name: string, price: number) => void;
}) {
  const cats = useMemo(() => ["Tout", ...Array.from(new Set(menu.map((d) => d.category)))], [menu]);
  const [active, setActive] = useState("Tout");
  const [open, setOpen] = useState<PublicMenuItem | null>(null);
  const filtered = active === "Tout" ? menu : menu.filter((d) => d.category === active);

  return (
    <>
      <div className="cl-page-hero">
        <h1>Notre Menu</h1>
        <p>
          {menu.length} plats · {restaurant.cuisine || "Cuisine africaine"}
        </p>
      </div>
      <div className="cl-cat-bar">
        <div className="cl-cat-bar-inner">
          {cats.map((c) => (
            <button
              key={c}
              className={`cl-cat-pill ${c === active ? "active" : ""}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
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
                    {d.image_url ? (
                      <StorageImage
                        path={d.image_url}
                        alt={d.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "🍽️"
                    )}
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
            <div className="cl-empty">
              🍽️
              <br />
              <br />
              Aucun plat ici.
            </div>
          )}
        </div>
      </section>

      {open && (
        <div
          className="cl-modal-bg open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <div className="cl-modal-box">
            <div className="cl-dm-img">
              {open.image_url ? (
                <StorageImage
                  path={open.image_url}
                  alt={open.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                "🍽️"
              )}
            </div>
            <div className="cl-dm-body">
              <button className="cl-modal-close" onClick={() => setOpen(null)}>
                ✕
              </button>
              <div className="cl-dm-cat">{open.category}</div>
              <div className="cl-dm-name">{open.name}</div>
              {open.description && <div className="cl-dm-desc">{open.description}</div>}
              <div className="cl-dm-price">{open.price.toLocaleString("fr-FR")} FCFA</div>
              <div className="cl-dm-actions">
                <button
                  className="cl-btn cl-btn-green cl-btn-block"
                  onClick={() => {
                    onOrder(open.id, open.name, open.price);
                    setOpen(null);
                  }}
                >
                  🛒 Commander maintenant
                </button>
                <button className="cl-btn cl-btn-outline cl-btn-sm" onClick={() => setOpen(null)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OrderView({
  restaurant,
  menu,
  waLink,
  prefill,
  clearPrefill,
}: {
  restaurant: TemplateProps["restaurant"];
  menu: PublicMenuItem[];
  waLink: (t: string) => string;
  prefill: { id: string; name: string; price: number } | null;
  clearPrefill: () => void;
}) {
  const cats = useMemo(() => ["Tout", ...Array.from(new Set(menu.map((d) => d.category)))], [menu]);
  const [active, setActive] = useState("Tout");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [delMode, setDelMode] = useState<"place" | "livraison">("place");
  const [form, setForm] = useState({ name: "", phone: "", addr: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("new");
  const [statusHistory, setStatusHistory] = useState<Array<{ status: string; time: Date }>>([]);

  const didPrefill = useRef(false);
  useEffect(() => {
    if (prefill && !didPrefill.current) {
      didPrefill.current = true;
      addItem(prefill.id, prefill.name, prefill.price);
      clearPrefill();
    }
  }, [prefill, clearPrefill]);

  const addItem = (id: string, name: string, price: number) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === id);
      if (ex) return c.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { id, name, price, qty: 1 }];
    });
  };
  const changeQty = (id: string, d: number) => {
    setCart((c) =>
      c.flatMap((x) =>
        x.id === id ? (x.qty + d <= 0 ? [] : [{ ...x, qty: x.qty + d }]) : [x],
      ),
    );
  };

  const filtered = active === "Tout" ? menu : menu.filter((d) => d.category === active);
  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  const submit = async () => {
    if (!cart.length) return toast.error("Panier vide");
    if (!form.name.trim() || !form.phone.trim()) return toast.error("Nom et téléphone requis");
    setBusy(true);
    const items = cart.map((c) => ({ menu_item_id: c.id, name: c.name, price: c.price, qty: c.qty }));
    const notes = [delMode === "livraison" && form.addr ? `Livraison : ${form.addr}` : null, form.note || null]
      .filter(Boolean)
      .join(" — ");
    const { data, error } = await supabase
      .from("orders" as never)
      .insert({
        restaurant_id: restaurant.id,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        notes: notes || null,
        items,
        subtotal: total,
        total,
        status: "new",
        source: delMode === "livraison" ? "web-livraison" : "web-place",
      } as never)
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const orderId = (data as { id?: string } | null)?.id;
    if (orderId) {
      setLastOrderId(orderId);
      setOrderStatus("new");
      setStatusHistory([{ status: "new", time: new Date() }]);
    }
    setDone(true);
    toast.success("Commande envoyée à la cuisine ✓");
  };

  // Suivi en temps réel du statut de la commande
  useEffect(() => {
    if (!lastOrderId) return;
    const channel = supabase
      .channel(`cl-order-${lastOrderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${lastOrderId}` },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status;
          setOrderStatus(newStatus);
          setStatusHistory((prev) => [...prev, { status: newStatus, time: new Date() }]);
          if (newStatus === "preparing") toast.info("👨‍🍳 La cuisine prépare votre commande");
          else if (newStatus === "ready") toast.success("✅ Votre commande est prête !");
          else if (newStatus === "delivered") toast.success("🎉 Bon appétit !");
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lastOrderId]);

  const resetOrder = () => {
    setCart([]);
    setForm({ name: "", phone: "", addr: "", note: "" });
    setDone(false);
    setLastOrderId(null);
    setStatusHistory([]);
  };

  const STATUS_LABELS: Record<string, string> = {
    new: "🆕 Commande reçue",
    preparing: "👨‍🍳 En préparation",
    ready: "✅ Prête",
    delivered: "🎉 Servie / Livrée",
    cancelled: "❌ Annulée",
  };

  if (done) {
    return (
      <>
        <div className="cl-page-hero">
          <h1>Commande envoyée !</h1>
          <p>La cuisine a bien reçu votre commande.</p>
        </div>
        <div className="cl-order-wrap" style={{ gridTemplateColumns: "1fr", maxWidth: 480, margin: "0 auto" }}>
          <div className="cl-card" style={{ padding: 26, textAlign: "center" }}>
            <div style={{ fontSize: 44 }}>✅</div>
            <p style={{ color: "var(--cl-muted)", margin: "8px 0 20px" }}>
              Vous serez notifié à chaque étape.
            </p>
            <div style={{ textAlign: "left", background: "var(--cl-bg2)", borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cl-accent)", marginBottom: 10 }}>
                📡 Suivi en direct
              </p>
              {statusHistory.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0" }}>
                  <span style={{ flex: 1 }}>{STATUS_LABELS[h.status] ?? h.status}</span>
                  <span style={{ fontSize: 11, color: "var(--cl-muted)" }}>
                    {h.time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
            <button className="cl-btn cl-btn-outline cl-btn-block" style={{ marginTop: 20 }} onClick={resetOrder}>
              Passer une nouvelle commande
            </button>
          </div>
        </div>
      </>
    );
  }

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
              <button
                key={c}
                className={`cl-cat-pill ${c === active ? "active" : ""}`}
                onClick={() => setActive(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="cl-catalogue-grid">
            {filtered.length ? (
              filtered.map((d) => (
                <div
                  key={d.id}
                  className="cl-card cl-cat-item"
                  onClick={() => addItem(d.id, d.name, d.price)}
                >
                  <div className="cl-cat-item-img">
                    {d.image_url ? (
                      <StorageImage
                        path={d.image_url}
                        alt={d.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "🍽️"
                    )}
                  </div>
                  <div className="cl-cat-item-body">
                    <div className="cl-cat-item-name">{d.name}</div>
                    <div className="cl-cat-item-foot">
                      <span className="cl-cat-item-price">{d.price.toLocaleString("fr-FR")} F</span>
                      <button
                        className="cl-cat-item-add"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(d.id, d.name, d.price);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--cl-muted)", gridColumn: "1/-1", padding: 20 }}>
                Aucun plat.
              </p>
            )}
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
                {cart.length ? (
                  cart.map((c) => (
                    <div key={c.id} className="cl-cart-row">
                      <div className="cl-cart-row-name">{c.name}</div>
                      <div className="cl-cart-qty">
                        <button className="cl-qty-btn" onClick={() => changeQty(c.id, -1)}>
                          −
                        </button>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            minWidth: 16,
                            textAlign: "center",
                          }}
                        >
                          {c.qty}
                        </span>
                        <button className="cl-qty-btn" onClick={() => changeQty(c.id, 1)}>
                          +
                        </button>
                      </div>
                      <div className="cl-cart-row-price">
                        {(c.qty * c.price).toLocaleString("fr-FR")} F
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cl-cart-empty">Ajoutez des plats</div>
                )}
              </div>
              <div className="cl-cart-total-row">
                <span className="cl-cart-total-lbl">Total</span>
                <span className="cl-cart-total-val">{total.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="cl-cart-form">
                <div className="cl-lbl">Mode de récupération</div>
                <div className="cl-del-toggle">
                  <div
                    className={`cl-del-opt ${delMode === "place" ? "active" : ""}`}
                    onClick={() => setDelMode("place")}
                  >
                    🏠 Sur place
                  </div>
                  <div
                    className={`cl-del-opt ${delMode === "livraison" ? "active" : ""}`}
                    onClick={() => setDelMode("livraison")}
                  >
                    🛵 Livraison
                  </div>
                </div>
                <div className="cl-form-group">
                  <label>Nom *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="cl-form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+226 70 00 00 00"
                  />
                </div>
                {delMode === "livraison" && (
                  <div className="cl-form-group">
                    <label>Adresse</label>
                    <input
                      value={form.addr}
                      onChange={(e) => setForm({ ...form, addr: e.target.value })}
                      placeholder="Quartier, rue..."
                    />
                  </div>
                )}
                <div className="cl-form-group">
                  <label>Note</label>
                  <input
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Pas trop épicé..."
                  />
                </div>
                <button className="cl-btn cl-btn-green cl-btn-block" onClick={submit} disabled={busy}>
                  {busy ? "Envoi..." : "✅ Envoyer la commande"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ReserveView({
  restaurant,
  waLink,
}: {
  restaurant: TemplateProps["restaurant"];
  waLink: (t: string) => string;
}) {
  const [form, setForm] = useState({ name: "", phone: "", date: "", occ: "", msg: "" });
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const times = [
    "12h00",
    "12h30",
    "13h00",
    "13h30",
    "19h00",
    "19h30",
    "20h00",
    "20h30",
    "21h00",
    "21h30",
    "22h00",
    "22h30",
  ];
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
                <div className="cl-form-group">
                  <label>Nom *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Alassane Kaboré"
                  />
                </div>
                <div className="cl-form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+226 70 00 00 00"
                  />
                </div>
              </div>
              <p className="cl-step-title" style={{ marginTop: 18 }}>
                📅 Date & heure
              </p>
              <div className="cl-form-group" style={{ marginBottom: 14 }}>
                <label>Date *</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <p className="cl-sub-label">Heure *</p>
              <div className="cl-time-grid">
                {times.map((t) => (
                  <div
                    key={t}
                    className={`cl-time-slot ${time === t ? "active" : ""}`}
                    onClick={() => setTime(t)}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <p className="cl-step-title" style={{ marginTop: 18 }}>
                👥 Nombre de personnes *
              </p>
              <div className="cl-guests-row">
                {guestList.map((g) => (
                  <button
                    key={g}
                    className={`cl-guest-btn ${guests === g ? "active" : ""}`}
                    onClick={() => setGuests(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <p className="cl-step-title" style={{ marginTop: 18 }}>
                🎉 Extras
              </p>
              <div className="cl-form-group">
                <label>Occasion</label>
                <input
                  value={form.occ}
                  onChange={(e) => setForm({ ...form, occ: e.target.value })}
                  placeholder="Anniversaire, réunion..."
                />
              </div>
              <div className="cl-form-group">
                <label>Message</label>
                <textarea
                  value={form.msg}
                  onChange={(e) => setForm({ ...form, msg: e.target.value })}
                  placeholder="Demandes spéciales, allergies..."
                />
              </div>
              <button className="cl-btn cl-btn-green cl-btn-block" disabled={busy} onClick={submit}>
                {busy ? "Envoi..." : "✅ Confirmer ma réservation"}
              </button>
            </div>
          ) : (
            <div className="cl-card cl-success-box">
              <div className="cl-success-icon">🎉</div>
              <div className="cl-success-title">Réservation envoyée !</div>
              <div className="cl-success-sub">
                Table pour {guests} personne(s) le {form.date} à {time}.
              </div>
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button className="cl-btn cl-btn-outline" onClick={reset}>
                  + Nouvelle réservation
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="cl-card cl-side-card">
            <div className="cl-side-title">Infos pratiques</div>
            <div className="cl-side-row">
              <span className="cl-side-icon">📍</span>
              <div>
                <div className="cl-side-lbl">Adresse</div>
                <div className="cl-side-val">{restaurant.address || "—"}</div>
              </div>
            </div>
            <div className="cl-side-row">
              <span className="cl-side-icon">📞</span>
              <div>
                <div className="cl-side-lbl">Téléphone</div>
                <div className="cl-side-val">{restaurant.phone || "—"}</div>
              </div>
            </div>
            <div className="cl-side-row">
              <span className="cl-side-icon">🕐</span>
              <div>
                <div className="cl-side-lbl">Horaires</div>
                <div className="cl-side-val">{restaurant.hours || "—"}</div>
              </div>
            </div>
          </div>
          <div className="cl-wa-box">
            <p>Préférez réserver par WhatsApp ?</p>
            <a
              className="cl-btn cl-btn-block"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.4)",
              }}
              target="_blank"
              rel="noopener noreferrer"
              href={waLink(`Bonjour ${restaurant.name} ! Je voudrais réserver.`)}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function ReviewsView({
  restaurant,
  reviews,
  onAdded,
}: {
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
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const filtered = reviews.filter((r) => filterStar === 0 || r.rating === filterStar);

  const submit = async () => {
    if (!picked) return toast.error("Choisissez une note");
    if (!form.name.trim()) return toast.error("Entrez votre nom");
    if (!form.text.trim()) return toast.error("Écrivez votre avis");
    setBusy(true);
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        restaurant_id: restaurant.id,
        author_name: form.name,
        rating: picked,
        comment: form.text,
      })
      .select("id, author_name, rating, comment, created_at")
      .maybeSingle();
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
        <p>
          {reviews.length} avis · Note {avg || "—"}/5
        </p>
      </div>
      <section className="cl-section">
        <div className="cl-container">
          <div className="cl-card cl-summary-wrap">
            <div className="cl-summary-big">
              <div className="cl-summary-num">{avg || "—"}</div>
              <div className="cl-summary-stars">
                {avg
                  ? "★".repeat(Math.round(parseFloat(avg))) +
                    "☆".repeat(5 - Math.round(parseFloat(avg)))
                  : "☆☆☆☆☆"}
              </div>
              <div className="cl-summary-count">{reviews.length} avis</div>
            </div>
            <div className="cl-bars">
              {[5, 4, 3, 2, 1].map((n, i) => (
                <div key={n} className="cl-bar-row">
                  <span className="cl-bar-lbl">{n}</span>
                  <div className="cl-bar-track">
                    <div className="cl-bar-fill" style={{ width: `${(counts[i] / max) * 100}%` }} />
                  </div>
                  <span className="cl-bar-count">{counts[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cl-filt-row">
            <button
              className={`cl-filt-btn ${filterStar === 0 ? "active" : ""}`}
              onClick={() => setFilterStar(0)}
            >
              Tous
            </button>
            {[5, 4, 3].map((n) => (
              <button
                key={n}
                className={`cl-filt-btn ${filterStar === n ? "active" : ""}`}
                onClick={() => setFilterStar(n)}
              >
                {"⭐".repeat(n)}
              </button>
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
                      <div className="cl-rev-date">
                        {new Date(r.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="cl-rev-stars">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.comment && <div className="cl-rev-text">"{r.comment}"</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="cl-empty-state">
              <div className="cl-empty-icon">💬</div>
              <p>{filterStar ? `Aucun avis ${filterStar}⭐` : "Soyez le premier !"}</p>
            </div>
          )}

          <div className="cl-divider" style={{ margin: "40px 0" }} />

          <div className="cl-card cl-add-wrap">
            <div className="cl-add-title">✍️ Donnez votre avis</div>
            <div className="cl-stars-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`cl-star-pick ${n <= picked ? "on" : ""}`}
                  onClick={() => setPicked(n)}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div className="cl-form-2col">
              <div className="cl-form-group">
                <label>Nom *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Mariam O."
                />
              </div>
              <div className="cl-form-group">
                <label>Occasion</label>
                <input
                  value={form.occ}
                  onChange={(e) => setForm({ ...form, occ: e.target.value })}
                  placeholder="Déjeuner, anniversaire..."
                />
              </div>
            </div>
            <div className="cl-form-group">
              <label>Votre avis *</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Partagez votre expérience..."
              />
            </div>
            <button className="cl-btn cl-btn-green cl-btn-block" disabled={busy} onClick={submit}>
              {busy ? "Envoi..." : "⭐ Publier mon avis"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

const CL_CSS = `
.cl-root{--cl-green:#16161a;--cl-green-light:#33333a;--cl-green-soft:rgba(22,22,26,0.06);--cl-accent:#c9a227;--cl-bg:#ffffff;--cl-bg2:#f8f7f3;--cl-bg3:#efeee6;--cl-text:#17171b;--cl-muted:#6f6e68;--cl-border:#e6e4da;--cl-card:#ffffff;--cl-radius:14px;--cl-shadow:0 10px 34px rgba(23,23,27,0.07);font-family:'Inter',-apple-system,sans-serif;background:var(--cl-bg);color:var(--cl-text);min-height:100vh;}
.cl-root *,.cl-root *::before,.cl-root *::after{box-sizing:border-box;}
.cl-root h1,.cl-root h2,.cl-root h3,.cl-root .cl-brand,.cl-root .cl-hero-title,.cl-root .cl-sec-title,.cl-root .cl-page-hero h1,.cl-root .cl-dm-name,.cl-root .cl-footer-brand,.cl-root .cl-stat-num,.cl-root .cl-summary-num{font-family:'Space Grotesk',-apple-system,sans-serif;letter-spacing:-0.01em;}
.cl-nav{position:sticky;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--cl-border);height:72px;display:flex;align-items:center;padding:0 28px;gap:28px;}
.cl-brand{color:var(--cl-text);font-size:19px;font-weight:700;background:none;border:none;cursor:pointer;padding:0;}
.cl-nav-links{display:flex;gap:2px;flex:1;}
.cl-nav-link{color:var(--cl-muted);font-size:13px;font-weight:600;background:none;border:none;cursor:pointer;padding:8px 14px;border-radius:8px;transition:all 0.2s;}
.cl-nav-link:hover,.cl-nav-link.active{color:var(--cl-text);background:var(--cl-bg2);}
.cl-nav-cta{background:var(--cl-text);color:#fff;font-size:12px;font-weight:700;padding:10px 20px;border-radius:999px;border:none;cursor:pointer;flex-shrink:0;transition:all 0.2s;}
.cl-nav-cta:hover{background:var(--cl-accent);color:#17171b;transform:translateY(-1px);}
.cl-hamburger{display:none;background:none;border:none;color:var(--cl-text);font-size:22px;cursor:pointer;margin-left:auto;}
.cl-mob-menu{position:sticky;top:72px;background:#fff;border-bottom:1px solid var(--cl-border);padding:14px 24px;display:flex;flex-direction:column;gap:2px;z-index:99;}
.cl-mob-menu button{color:var(--cl-text);font-size:14px;font-weight:600;background:none;border:none;text-align:left;cursor:pointer;padding:11px 14px;border-radius:8px;}
.cl-mob-menu button:hover{background:var(--cl-bg2);}
.cl-container{max-width:1080px;margin:0 auto;padding:0 24px;}
.cl-section{padding:88px 0;}.cl-section-alt{background:var(--cl-bg2);}
.cl-sec-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:var(--cl-accent);margin-bottom:10px;}
.cl-sec-title{font-size:clamp(24px,4vw,38px);font-weight:700;color:var(--cl-text);margin-bottom:12px;}
.cl-sec-sub{font-size:14.5px;color:var(--cl-muted);line-height:1.75;max-width:480px;}
.cl-sec-head{margin-bottom:44px;}.cl-sec-head.center{text-align:center;}.cl-sec-head.center .cl-sec-sub{margin:0 auto;}
.cl-sec-head.row{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.cl-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:999px;font-size:14px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all 0.2s;font-family:'Space Grotesk',sans-serif;}
.cl-btn-green{background:var(--cl-text);color:#fff;box-shadow:0 8px 20px rgba(23,23,27,0.22);}
.cl-btn-green:hover{background:var(--cl-green-light);transform:translateY(-2px);box-shadow:0 12px 26px rgba(23,23,27,0.28);}
.cl-btn-outline{background:transparent;border:1.5px solid var(--cl-text);color:var(--cl-text);}
.cl-btn-outline:hover{background:var(--cl-text);color:#fff;}
.cl-btn-outline-light{background:transparent;border:1.5px solid rgba(255,255,255,0.45);color:#fff;}
.cl-btn-outline-light:hover{background:rgba(255,255,255,0.12);border-color:#fff;}
.cl-btn-wa{background:rgba(37,211,102,0.1);color:#1a9e50;border:1px solid rgba(37,211,102,0.3);}
.cl-btn-wa:hover{background:#25d366;color:#fff;border-color:#25d366;}
.cl-btn-sm{padding:9px 18px;font-size:12px;}.cl-btn-block{width:100%;justify-content:center;}
.cl-card{background:var(--cl-card);border:1px solid var(--cl-border);border-radius:var(--cl-radius);box-shadow:var(--cl-shadow);}
.cl-divider{height:1px;background:var(--cl-border);}
.cl-badge{display:inline-flex;align-items:center;padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700;}
.cl-badge-green{background:#fff;color:var(--cl-text);box-shadow:0 2px 8px rgba(0,0,0,0.12);}
.cl-hero{position:relative;color:#fff;padding:100px 0 0;overflow:hidden;background:#0c0c0e;}
.cl-hero::before{content:"";position:absolute;inset:0;background-image:url("/hero-jollof.png");background-size:cover;background-position:center;opacity:0.42;z-index:0;}
.cl-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,12,0.4) 0%,rgba(10,10,12,0.94) 100%);z-index:0;}
.cl-hero-inner{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
.cl-eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:var(--cl-accent);margin-bottom:16px;}
.cl-hero-title{font-size:clamp(30px,5vw,54px);font-weight:700;line-height:1.08;margin-bottom:18px;}
.cl-hero-title em{color:var(--cl-accent);font-style:normal;}
.cl-hero-sub{font-size:15.5px;opacity:0.82;line-height:1.75;margin-bottom:32px;max-width:440px;}
.cl-hero-btns{display:flex;gap:12px;flex-wrap:wrap;}
.cl-hero-img{background-image:url("/hero-jollof.png");background-size:cover;background-position:center;border-radius:20px;height:400px;box-shadow:0 30px 70px rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.08);}
.cl-hero-stats{position:relative;z-index:1;display:flex;gap:0;background:rgba(255,255,255,0.05);border-top:1px solid rgba(255,255,255,0.1);margin-top:56px;backdrop-filter:blur(10px);}
.cl-hero-stat{flex:1;text-align:center;padding:22px 12px;border-right:1px solid rgba(255,255,255,0.08);}
.cl-hero-stat:last-child{border-right:none;}
.cl-stat-num{font-size:27px;font-weight:700;color:var(--cl-accent);display:block;}
.cl-stat-lbl{font-size:10px;opacity:0.6;text-transform:uppercase;letter-spacing:1px;}
.cl-info-band{background:var(--cl-text);}
.cl-info-band-inner{max-width:1080px;margin:0 auto;padding:16px 24px;display:flex;gap:32px;align-items:center;flex-wrap:wrap;justify-content:center;}
.cl-info-item{display:flex;align-items:center;gap:8px;color:#fff;font-size:13px;font-weight:500;}
.cl-features{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;}
.cl-feat{padding:30px 24px;text-align:center;}
.cl-feat-icon{width:56px;height:56px;border-radius:50%;background:var(--cl-bg2);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px;}
.cl-feat-title{font-size:14.5px;font-weight:700;margin-bottom:7px;}
.cl-feat-desc{font-size:13px;color:var(--cl-muted);line-height:1.65;}
.cl-menu-preview{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;}
.cl-dish-mini{display:flex;align-items:center;gap:14px;padding:15px;background:var(--cl-card);border:1px solid var(--cl-border);border-radius:var(--cl-radius);box-shadow:var(--cl-shadow);cursor:pointer;text-align:left;transition:transform 0.2s,box-shadow 0.2s;}
.cl-dish-mini:hover{transform:translateY(-3px);box-shadow:0 16px 34px rgba(23,23,27,0.1);}
.cl-dish-mini-icon{width:52px;height:52px;border-radius:10px;background:var(--cl-bg2);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;}
.cl-dish-mini-name{font-size:14px;font-weight:700;margin-bottom:2px;color:var(--cl-text);}
.cl-dish-mini-cat{font-size:11px;color:var(--cl-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;}
.cl-dish-mini-price{font-size:14px;font-weight:700;color:var(--cl-accent);margin-left:auto;flex-shrink:0;}
.cl-reviews-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}
.cl-rev-card{padding:22px;}
.cl-rev-stars{color:var(--cl-accent);font-size:15px;margin-bottom:10px;}
.cl-rev-text{font-size:13px;color:var(--cl-muted);line-height:1.65;font-style:italic;margin-bottom:14px;}
.cl-rev-name{font-size:13px;font-weight:700;color:var(--cl-text);}
.cl-footer{background:var(--cl-text);color:#fff;padding:40px 24px;text-align:center;}
.cl-footer-brand{font-size:21px;font-weight:700;margin-bottom:6px;}
.cl-footer-sub{font-size:13px;opacity:0.65;margin-bottom:18px;}
.cl-footer-links{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:18px;}
.cl-footer-links button{background:none;border:none;color:rgba(255,255,255,0.7);font-size:13px;cursor:pointer;}
.cl-footer-links button:hover{color:var(--cl-accent);}
.cl-footer-credit{font-size:11px;opacity:0.45;}
.cl-footer-credit a{color:#fff;}
.cl-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;text-decoration:none;box-shadow:0 10px 28px rgba(0,0,0,0.28);z-index:200;transition:transform 0.2s;}
.cl-fab:hover{transform:scale(1.08);}
.cl-page-hero{background:var(--cl-text);color:#fff;padding:56px 24px 46px;text-align:center;}
.cl-page-hero h1{font-size:clamp(26px,4vw,42px);font-weight:700;margin-bottom:8px;}
.cl-page-hero p{font-size:14px;opacity:0.7;}
.cl-cat-bar{background:rgba(255,255,255,0.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--cl-border);position:sticky;top:72px;z-index:50;}
.cl-cat-bar-inner{max-width:1080px;margin:0 auto;padding:14px 24px;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;}
.cl-cat-bar-inner::-webkit-scrollbar{display:none;}
.cl-cat-pill{padding:8px 17px;border-radius:20px;font-size:12px;font-weight:700;border:1.5px solid var(--cl-border);background:transparent;color:var(--cl-muted);cursor:pointer;white-space:nowrap;transition:all 0.2s;}
.cl-cat-pill.active,.cl-cat-pill:hover{background:var(--cl-text);color:#fff;border-color:var(--cl-text);}
.cl-dishes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:22px;}
.cl-dish-card{cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;overflow:hidden;padding:0;text-align:left;border:1px solid var(--cl-border);background:#fff;border-radius:var(--cl-radius);}
.cl-dish-card:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(23,23,27,0.12);}
.cl-dish-img{height:158px;background:var(--cl-bg2);display:flex;align-items:center;justify-content:center;font-size:52px;position:relative;overflow:hidden;}
.cl-dish-avail{position:absolute;top:10px;right:10px;}
.cl-dish-body{padding:16px 18px;}
.cl-dish-cat{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--cl-accent);margin-bottom:4px;}
.cl-dish-name{font-size:15px;font-weight:700;margin-bottom:5px;color:var(--cl-text);}
.cl-dish-desc{font-size:12px;color:var(--cl-muted);line-height:1.55;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-line-orient:vertical;overflow:hidden;}
.cl-dish-foot{display:flex;align-items:center;justify-content:space-between;}
.cl-dish-price{font-size:16px;font-weight:700;color:var(--cl-accent);}
.cl-empty{text-align:center;padding:56px;color:var(--cl-muted);}
.cl-modal-bg{position:fixed;inset:0;background:rgba(10,10,12,0.6);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px);}
.cl-modal-box{background:#fff;border-radius:18px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;}
.cl-dm-img{height:210px;background:var(--cl-bg2);display:flex;align-items:center;justify-content:center;font-size:72px;border-radius:18px 18px 0 0;overflow:hidden;}
.cl-dm-body{padding:24px;position:relative;}
.cl-dm-cat{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--cl-accent);margin-bottom:5px;}
.cl-dm-name{font-size:22px;font-weight:700;margin-bottom:9px;color:var(--cl-text);}
.cl-dm-desc{font-size:14px;color:var(--cl-muted);line-height:1.7;margin-bottom:14px;}
.cl-dm-price{font-size:26px;font-weight:700;color:var(--cl-accent);margin-bottom:22px;font-family:'Space Grotesk',sans-serif;}
.cl-dm-actions{display:flex;gap:10px;flex-wrap:wrap;}
.cl-modal-close{position:absolute;top:12px;right:14px;background:var(--cl-bg2);border:none;border-radius:50%;width:30px;height:30px;font-size:16px;cursor:pointer;color:var(--cl-muted);padding:0;}
.cl-res-wrap{max-width:880px;margin:0 auto;display:grid;grid-template-columns:1fr 300px;gap:32px;padding:48px 24px;}
.cl-res-card{padding:30px;}
.cl-step-title{font-size:13px;font-weight:700;color:var(--cl-text);text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;padding-bottom:12px;border-bottom:1px solid var(--cl-border);}
.cl-time-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}
.cl-time-slot{padding:10px 4px;border:1.5px solid var(--cl-border);border-radius:10px;text-align:center;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;color:var(--cl-muted);background:#fff;}
.cl-time-slot:hover,.cl-time-slot.active{border-color:var(--cl-text);color:#fff;background:var(--cl-text);}
.cl-guests-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.cl-guest-btn{width:44px;height:44px;border:1.5px solid var(--cl-border);border-radius:10px;text-align:center;line-height:40px;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;color:var(--cl-muted);background:#fff;}
.cl-guest-btn:hover,.cl-guest-btn.active{border-color:var(--cl-text);color:#fff;background:var(--cl-text);}
.cl-side-card{padding:20px;margin-bottom:12px;}
.cl-side-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--cl-muted);margin-bottom:12px;}
.cl-side-row{display:flex;gap:10px;margin-bottom:10px;}
.cl-side-icon{font-size:18px;}
.cl-side-lbl{font-size:10px;font-weight:700;color:var(--cl-muted);text-transform:uppercase;}
.cl-side-val{font-size:13px;font-weight:600;color:var(--cl-text);}
.cl-wa-box{background:var(--cl-text);border-radius:var(--cl-radius);padding:20px;text-align:center;}
.cl-wa-box p{font-size:12px;color:rgba(255,255,255,0.8);margin-bottom:14px;line-height:1.55;}
.cl-success-box{text-align:center;padding:44px 20px;}
.cl-success-icon{font-size:52px;margin-bottom:16px;}
.cl-success-title{font-size:20px;font-weight:700;color:var(--cl-text);margin-bottom:8px;font-family:'Space Grotesk',sans-serif;}
.cl-success-sub{font-size:14px;color:var(--cl-muted);}
.cl-sub-label{font-size:11px;font-weight:700;color:var(--cl-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
.cl-form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:15px;}
.cl-form-group label{font-size:11px;font-weight:700;color:var(--cl-muted);text-transform:uppercase;letter-spacing:0.5px;}
.cl-form-group input,.cl-form-group select,.cl-form-group textarea{padding:12px 15px;background:var(--cl-bg2);border:1.5px solid var(--cl-border);border-radius:10px;color:var(--cl-text);font-size:14px;outline:none;transition:all 0.2s;font-family:inherit;}
.cl-form-group input:focus,.cl-form-group select:focus,.cl-form-group textarea:focus{border-color:var(--cl-text);background:#fff;box-shadow:0 0 0 3px var(--cl-green-soft);}
.cl-form-group textarea{resize:vertical;min-height:80px;}
.cl-form-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.cl-order-wrap{max-width:1080px;margin:0 auto;padding:44px 24px;display:grid;grid-template-columns:1fr 380px;gap:32px;}
.cl-catalogue-title{font-size:16px;font-weight:700;margin-bottom:16px;color:var(--cl-text);font-family:'Space Grotesk',sans-serif;}
.cl-cat-pills{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.cl-catalogue-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;}
.cl-cat-item{overflow:hidden;cursor:pointer;transition:transform 0.2s;border-radius:var(--cl-radius);}
.cl-cat-item:hover{transform:translateY(-3px);}
.cl-cat-item-img{height:104px;background:var(--cl-bg2);display:flex;align-items:center;justify-content:center;font-size:36px;overflow:hidden;}
.cl-cat-item-body{padding:12px 13px;}
.cl-cat-item-name{font-size:13px;font-weight:700;margin-bottom:7px;color:var(--cl-text);}
.cl-cat-item-foot{display:flex;align-items:center;justify-content:space-between;}
.cl-cat-item-price{font-size:13px;font-weight:700;color:var(--cl-accent);}
.cl-cat-item-add{background:var(--cl-text);color:#fff;border:none;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer;}
.cl-cat-item-add:hover{background:var(--cl-accent);color:#17171b;}
.cl-cart-sticky{position:sticky;top:90px;}
.cl-cart-box{overflow:hidden;}
.cl-cart-head{background:var(--cl-text);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;}
.cl-cart-head h3{font-size:14px;font-weight:700;color:#fff;margin:0;font-family:'Space Grotesk',sans-serif;}
.cl-cart-count{background:var(--cl-accent);color:#17171b;font-size:11px;font-weight:700;padding:2px 9px;border-radius:10px;}
.cl-cart-body{padding:16px 20px;min-height:80px;max-height:260px;overflow-y:auto;}
.cl-cart-empty{text-align:center;padding:26px 0;color:var(--cl-muted);font-size:13px;}
.cl-cart-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--cl-border);}
.cl-cart-row:last-child{border-bottom:none;}
.cl-cart-row-name{flex:1;font-size:13px;font-weight:600;color:var(--cl-text);}
.cl-cart-qty{display:flex;align-items:center;gap:5px;}
.cl-qty-btn{width:24px;height:24px;border-radius:7px;background:var(--cl-bg2);border:1px solid var(--cl-border);cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;color:var(--cl-text);}
.cl-qty-btn:hover{background:var(--cl-text);color:#fff;border-color:var(--cl-text);}
.cl-cart-row-price{font-size:13px;font-weight:700;color:var(--cl-accent);min-width:62px;text-align:right;}
.cl-cart-total-row{padding:14px 20px;border-top:2px solid var(--cl-border);display:flex;justify-content:space-between;background:var(--cl-bg2);}
.cl-cart-total-lbl{font-size:13px;font-weight:600;color:var(--cl-muted);}
.cl-cart-total-val{font-size:18px;font-weight:700;color:var(--cl-text);}
.cl-cart-form{padding:16px 20px 20px;}
.cl-del-toggle{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px;}
.cl-del-opt{padding:11px;border:1.5px solid var(--cl-border);border-radius:10px;text-align:center;cursor:pointer;font-size:12px;font-weight:700;transition:all 0.2s;color:var(--cl-muted);}
.cl-del-opt.active{border-color:var(--cl-text);color:#fff;background:var(--cl-text);}
.cl-lbl{font-size:11px;font-weight:700;color:var(--cl-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}
.cl-summary-wrap{max-width:780px;margin:0 auto 48px;display:grid;grid-template-columns:auto 1fr;gap:36px;align-items:center;padding:26px;}
.cl-summary-big{text-align:center;}
.cl-summary-num{font-size:64px;font-weight:700;color:var(--cl-text);line-height:1;}
.cl-summary-stars{font-size:22px;color:var(--cl-accent);margin:6px 0;}
.cl-summary-count{font-size:12px;color:var(--cl-muted);}
.cl-bars{display:flex;flex-direction:column;gap:8px;}
.cl-bar-row{display:flex;align-items:center;gap:10px;}
.cl-bar-lbl{font-size:12px;font-weight:700;color:var(--cl-muted);width:16px;text-align:right;}
.cl-bar-track{flex:1;height:8px;background:var(--cl-bg3);border-radius:4px;overflow:hidden;}
.cl-bar-fill{height:100%;background:var(--cl-accent);border-radius:4px;transition:width 0.7s;}
.cl-bar-count{font-size:11px;color:var(--cl-muted);width:22px;}
.cl-filt-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:26px;}
.cl-filt-btn{padding:8px 15px;border-radius:20px;font-size:12px;font-weight:700;border:1.5px solid var(--cl-border);background:#fff;color:var(--cl-muted);cursor:pointer;transition:all 0.2s;}
.cl-filt-btn.active,.cl-filt-btn:hover{background:var(--cl-text);color:#fff;border-color:var(--cl-text);}
.cl-reviews-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;margin-bottom:48px;}
.cl-rev-card2{padding:22px;}
.cl-rev-head{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.cl-rev-avatar{width:40px;height:40px;border-radius:50%;background:var(--cl-text);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0;}
.cl-rev-info{flex:1;}
.cl-rev-date{font-size:11px;color:var(--cl-muted);}
.cl-add-wrap{max-width:560px;margin:0 auto;padding:30px;}
.cl-add-title{font-size:16px;font-weight:700;margin-bottom:22px;color:var(--cl-text);font-family:'Space Grotesk',sans-serif;}
.cl-stars-row{display:flex;gap:8px;margin-bottom:22px;}
.cl-star-pick{font-size:32px;cursor:pointer;filter:grayscale(1);opacity:0.25;transition:all 0.2s;border:none;background:none;}
.cl-star-pick.on{filter:none;opacity:1;transform:scale(1.15);}
.cl-empty-state{text-align:center;padding:48px;color:var(--cl-muted);}
.cl-empty-icon{font-size:48px;margin-bottom:12px;}
@media(max-width:780px){
  .cl-nav-links,.cl-nav-cta{display:none;}
  .cl-hamburger{display:block;}
  .cl-hero-inner{grid-template-columns:1fr;}
  .cl-hero-img{height:220px;}
  .cl-section{padding:56px 0;}
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
      return <TplNuit {...props} />;
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
