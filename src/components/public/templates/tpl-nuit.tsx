import * as React from "react";
import type { TemplateProps, PublicMenuItem, PublicGalleryImage, Theme } from "../shared";
import { MenuGrid, GalleryGrid, ReviewList, AdvancedReservationForm, ReviewForm, SectionHead, FloatingWhatsApp, buildWhatsAppLink, buildViewHref, avgRating, fmtPrice } from "../shared";
import { StorageImage } from "@/components/StorageImage";
import { useRestaurantFeatures } from "@/hooks/use-restaurant-features";

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
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
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
          <p className="text-[10px] font-bold uppercase mb-2" style={{ color: theme.accent, letterSpacing: "0.35em" }}>
            {it.label}
          </p>
          <div className="text-sm leading-relaxed" style={{ color: theme.text }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, theme }: { label: string; value: React.ReactNode; theme: Theme }) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
      <p className="text-[10px] font-bold uppercase mb-2" style={{ color: theme.accent, letterSpacing: "0.35em" }}>{label}</p>
      <p className="text-2xl" style={{ color: theme.text, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>{value}</p>
    </div>
  );
}

function SectionHead({ kicker, title, theme, serif, align }: { kicker: string; title: string; theme: Theme; serif?: boolean; align?: "left" | "center" }) {
  const isCenter = align === "center";
  return (
    <div className={`mb-10 ${isCenter ? "text-center" : ""}`}>
      <p className="text-[10px] font-bold uppercase mb-3" style={{ color: theme.accent, letterSpacing: "0.4em" }}>{kicker}</p>
      <h2 className="leading-[1.05]" style={{ fontFamily: serif ? "'Cormorant Garamond', serif" : "inherit", color: theme.text, fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 600 }}>
        {title}
      </h2>
    </div>
  );
}

function PoweredFooter({ restaurant, wa, theme }: { restaurant: TemplateProps["restaurant"]; wa: string | null; theme: Theme }) {
  return (
    <footer id="contact" style={{ background: theme.surfaceAlt, borderTop: `1px solid ${theme.border}`, color: theme.text }}>
      <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-2xl font-black mb-2" style={{ color: theme.accent }}>{restaurant.name}</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>{restaurant.cuisine ?? "Restaurant"} · {restaurant.city}</p>
          {restaurant.description && <p className="mt-4 text-sm leading-relaxed" style={{ color: theme.textMuted }}>{restaurant.description}</p>}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase mb-3" style={{ color: theme.accent, letterSpacing: "0.35em" }}>Visitez-nous</p>
          {restaurant.address && <p className="text-sm mb-2">{restaurant.address}</p>}
          <p className="text-sm whitespace-pre-line" style={{ color: theme.textMuted }}>{restaurant.hours ?? "Tous les jours · 11h — 23h"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase mb-3" style={{ color: theme.accent, letterSpacing: "0.35em" }}>Contact</p>
          <p className="text-sm"><a href={`tel:${restaurant.phone}`} className="hover:underline">{restaurant.phone}</a></p>
          <p className="text-sm mt-1"><a href={`mailto:${restaurant.email}`} className="hover:underline">{restaurant.email}</a></p>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm hover:opacity-90 transition" style={{ background: theme.accent, color: theme.accentInk, borderRadius: theme.radius }}>
              Commander sur WhatsApp
            </a>
          )}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 py-5 text-xs flex justify-between flex-wrap gap-2" style={{ borderTop: `1px solid ${theme.border}`, color: theme.textMuted }}>
        <span>© {new Date().getFullYear()} {restaurant.name}. Tous droits réservés.</span>
        <span>Site propulsé par <a href="/" className="underline" style={{ color: theme.accent }}>Resto BF</a></span>
      </div>
    </footer>
  );
}

export function TplNuit(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery, view } = props;
  const features = useRestaurantFeatures(restaurant.id, restaurant.plan);
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const cover = pickCover(gallery, menu);
  const signatures = signatureDishes(menu, 3);
  const rating = avgRating(reviews);
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
            <span className="text-xs sm:text-sm uppercase truncate" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.45em", color: theme.text }}>{restaurant.name}</span>
          </div>
          <nav className="hidden md:flex gap-8 text-[11px] uppercase" style={{ letterSpacing: "0.3em", color: theme.textMuted }}>
            <a href={buildViewHref("about")} className="hover:text-[#c9a35a] transition-colors">Histoire</a>
            <a href={buildViewHref("menu")} className="hover:text-[#c9a35a] transition-colors">Carte</a>
            <a href={buildViewHref("home")} className="hover:text-[#c9a35a] transition-colors">Galerie</a>
            <a href={buildViewHref("reserve")} className="hover:text-[#c9a35a] transition-colors">Réserver</a>
          </nav>
          <button onClick={() => setMobOpen((v) => !v)} className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="Menu">
            <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
        {mobOpen && (
          <nav className="md:hidden border-t border-white/10 bg-[#0a0907]/95 backdrop-blur-xl">
            <div className="flex flex-col px-4 py-4 gap-1">
              <a href={buildViewHref("about")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">Histoire</a>
              <a href={buildViewHref("menu")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">Carte</a>
              <a href={buildViewHref("home")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">Galerie</a>
              <a href={buildViewHref("reserve")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-white/5 transition-colors">Réserver</a>
            </div>
          </nav>
        )}
      </header>

      {/* HERO */}
      {activeView === "home" && (
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {cover ? <StorageImage path={cover} alt={restaurant.name} className="absolute inset-0 w-full h-full object-cover" /> : null}
        <div className="relative max-w-7xl mx-auto w-full px-5 sm:px-8 pb-20 pt-40">
          <p className="text-[10px] uppercase mb-6" style={{ color: theme.accent, letterSpacing: "0.55em" }}>{restaurant.city} · Établi·e dans la tradition</p>
          <h1 className="leading-[0.88] italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: theme.text, fontSize: "clamp(3.5rem, 11vw, 9rem)", fontWeight: 500 }}>{restaurant.name}</h1>
          <div className="mt-8 grid lg:grid-cols-12 gap-8 items-end">
            <p className="lg:col-span-7 max-w-xl text-lg leading-relaxed" style={{ color: theme.textMuted }}>
              {restaurant.description ?? `Une expérience culinaire d'exception au cœur de ${restaurant.city}. Produits du terroir, savoir-faire artisanal, ambiance feutrée.`}
            </p>
            <div className="lg:col-span-5 flex flex-col gap-3">
              <a href={buildViewHref("menu")} className="px-8 py-4 text-center border text-xs uppercase transition hover:bg-[#c9a35a] hover:text-[#0a0907]" style={{ borderColor: theme.accent, color: theme.accent, letterSpacing: "0.35em" }}>Découvrir la carte</a>
              {features.can_reserve && (
                <a href={buildViewHref("reserve")} className="px-8 py-4 text-center text-xs uppercase hover:opacity-90 transition" style={{ background: theme.accent, color: theme.accentInk, letterSpacing: "0.35em" }}>Réserver une table</a>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

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
      {activeView === "about" && (
      <section id="histoire" className="py-14 sm:py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          <div className="lg:col-span-7">
            <p className="text-[10px] uppercase mb-4" style={{ color: theme.accent, letterSpacing: "0.45em" }}>— Notre maison —</p>
            <h2 className="leading-[1.05] italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: theme.text, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 500 }}>
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
              <Stat label="Note moyenne" value={<span>{rating.toFixed(1)}<span style={{ color: theme.textMuted, fontSize: "0.6em" }}>/5 · {reviews.length} avis</span></span>} theme={theme} />
            )}
          </aside>
        </div>
      </section>
      )}

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
                    <h3 className="text-2xl italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: theme.text, fontWeight: 600 }}>{d.name}</h3>
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
      {activeView === "menu" && (
      <section id="carte" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead kicker="— La carte —" title="Notre menu" theme={theme} serif />
          <MenuGrid menu={menu} theme={theme} />
        </div>
      </section>
      )}

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
      {activeView === "home" && gallery.length > 0 && (
        <section id="galerie" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-7xl mx-auto">
            <SectionHead kicker="— Galerie —" title="L'ambiance" theme={theme} serif />
            <GalleryGrid gallery={gallery} theme={theme} />
          </div>
        </section>
      )}

      {/* RESERVATION */}
      {activeView === "reserve" && features.can_reserve && (
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
            <h3 className="text-lg italic mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: theme.text }}>Laissez votre avis</h3>
            <ReviewForm restaurantId={restaurant.id} theme={theme} />
          </div>
        </div>
      </section>

      <PoweredFooter restaurant={restaurant} wa={wa} theme={theme} />
      <FloatingWhatsApp href={wa} accent={theme.accent} ink={theme.accentInk} />
    </div>
  );
}