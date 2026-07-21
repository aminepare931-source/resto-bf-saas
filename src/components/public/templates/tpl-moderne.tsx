import * as React from "react";
import type { TemplateProps, PublicMenuItem, PublicGalleryImage, Theme } from "../shared";
import { MenuGrid, GalleryGrid, ReviewList, AdvancedReservationForm, ReviewForm, SectionHead, FloatingWhatsApp, CoverPlaceholder, DishModal, buildWhatsAppLink, buildViewHref, avgRating, fmtPrice } from "../shared";
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
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;700&display=swap"
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

function SectionHead({ kicker, title, theme, serif, align }: { kicker: string; title: string; theme: Theme; serif?: boolean; align?: "left" | "center" }) {
  const isCenter = align === "center";
  return (
    <div className={`mb-10 ${isCenter ? "text-center" : ""}`}>
      <p className="text-[10px] font-bold uppercase mb-3" style={{ color: theme.accent, letterSpacing: "0.4em" }}>{kicker}</p>
      <h2 className="leading-[1.05]" style={{ fontFamily: serif ? "'Playfair Display', serif" : "inherit", color: theme.text, fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 600 }}>
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

export function TplModerne(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery, view } = props;
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const cover = pickCover(gallery, menu);
  const signatures = signatureDishes(menu, 3);
  const rating = avgRating(reviews);

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

  const [mobOpen, setMobOpen] = React.useState(false);
  const [openDish, setOpenDish] = React.useState<PublicMenuItem | null>(null);
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
    <div className="tpl-page min-h-screen" style={{ background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif", isolation: "isolate" }}>
      <FontImport />
      <style>{`
        .tpl-page{position:relative;min-height:100vh;overflow:hidden;isolation:isolate;}
        .tpl-bg{position:fixed;inset:0;z-index:-2;overflow:hidden;background:transparent;}
        .tpl-bg img{width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.1);transform:scale(1.08);animation:tpl-bg-drift 22s ease-in-out infinite alternate;}
        .tpl-bg span{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.40),rgba(0,0,0,.80));}
        @keyframes tpl-bg-drift{0%{transform:scale(1.08) translate3d(-1.5%,0,0)}100%{transform:scale(1.18) translate3d(1.5%,-1.5%,0)}}
        @media(prefers-reduced-motion:reduce){.tpl-bg img{animation:none;transition:none}}
      `}</style>

      <div className="tpl-bg" aria-hidden>
        <img src="/bg-moderne.jpg" alt="" />
        <span />
      </div>

      {/* NAV */}
      <header className="absolute top-0 inset-x-0 z-30">
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(14,14,16,0.65) 0%, rgba(14,14,16,0) 100%)" }} />
        <div className="relative max-w-7xl mx-auto px-5 py-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="h-8 w-auto object-contain rounded" />
            ) : (
              <span className="text-2xl shrink-0">🌿</span>
            )}
            <strong className="text-xl sm:text-2xl truncate" style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
              {restaurant.name}
            </strong>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            <nav className="hidden md:flex gap-6 text-[12px] uppercase font-medium" style={{ letterSpacing: "0.15em", color: theme.textMuted, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              <a href={buildViewHref("home")} className={`hover:text-[#c9a35a] ${activeView === "home" ? "text-[#c9a35a]" : ""}`}>Accueil</a>
              <a href={buildViewHref("about")} className={`hover:text-[#c9a35a] ${activeView === "about" ? "text-[#c9a35a]" : ""}`}>À propos</a>
              <a href={buildViewHref("menu")} className={`hover:text-[#c9a35a] ${activeView === "menu" ? "text-[#c9a35a]" : ""}`}>Menu</a>
            </nav>
            {restaurant.plan !== "gratuit" && (
              <a href={buildViewHref("reserve")} className="hidden md:inline-flex px-5 py-2.5 border text-xs font-semibold hover:bg-[#c9a35a] hover:text-[#0e0e10] transition rounded-full" style={{ borderColor: theme.accent, color: theme.accent }}>
                Réserver une table →
              </a>
            )}
            <button onClick={() => setMobOpen((v) => !v)} className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Menu">
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {mobOpen && (
        <nav className="md:hidden border-t border-white/10 bg-[#0e0e10]/97 backdrop-blur-xl">
          <div className="flex flex-col px-4 py-4 gap-1">
            <a href={buildViewHref("home")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors text-left">Accueil</a>
            <a href={buildViewHref("about")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors text-left">À propos</a>
            <a href={buildViewHref("menu")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors text-left">Menu</a>
            {restaurant.plan !== "gratuit" && (
              <a href={buildViewHref("reserve")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-left" style={{ color: theme.accent }}>Réserver une table →</a>
            )}
          </div>
        </nav>
      )}

      {/* HOME VIEW */}
      {activeView === "home" && (
        <section id="home" className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {cover ? <StorageImage path={cover} alt={restaurant.name} className="absolute inset-0 w-full h-full object-cover" /> : null}
          <div className="relative text-center px-5 pt-32 pb-20 max-w-3xl">
            <h1 className="leading-[1.05]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
              La meilleure cuisine<br/>pour <em style={{ color: theme.accent, fontStyle: "italic" }}>votre goût</em>
            </h1>
            <p className="mt-5 max-w-xl mx-auto" style={{ color: theme.textMuted }}>
              {restaurant.description ?? `Une expérience culinaire d'exception au cœur de ${restaurant.city}.`}
            </p>
            <a href={buildViewHref("menu")} className="mt-8 inline-block px-7 py-3 border font-medium text-sm hover:bg-[#c9a35a] hover:text-[#0e0e10] transition" style={{ borderColor: theme.accent, color: theme.accent }}>
              Découvrir →
            </a>
          </div>
        </section>
      )}

      {/* ABOUT VIEW */}
      {activeView === "about" && (
        <section id="about" className="relative py-24 px-5" style={{ background: theme.surface }}>
          <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {cover ? (
                <StorageImage path={cover} alt={restaurant.name} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square" style={{ background: theme.surfaceAlt }}>
                  <CoverPlaceholder background="transparent" stroke={theme.accent} rounded="0px" />
                </div>
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
              <a href={buildViewHref("menu")} className="inline-block px-7 py-3 border text-sm hover:bg-[#c9a35a] hover:text-[#0e0e10] transition" style={{ borderColor: theme.accent, color: theme.accent }}>
                En savoir plus →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* MENU VIEW */}
      {activeView === "menu" && (
        <section id="menu" className="py-20 px-5" style={{ background: theme.surface, borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="La carte" title="Notre menu" theme={theme} align="center" serif />
            <MenuGrid menu={menu} theme={theme} />
          </div>
        </section>
      )}

      {/* RESERVATION VIEW */}
      {activeView === "reserve" && restaurant.plan !== "gratuit" && (
        <section id="reserver" className="py-20 px-5" style={{ background: theme.surface, borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-3xl mx-auto">
            <SectionHead kicker="Réservation" title="Réservez votre table" theme={theme} align="center" serif />
            <AdvancedReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} theme={theme} waLink={wa} />
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
                <button key={d.id} onClick={() => setOpenDish(d)} className="group text-left w-full">
                  <div className="aspect-[3/4] sm:aspect-[4/5] overflow-hidden" style={{ background: theme.surface }}>
                    <StorageImage path={d.image_url} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="text-2xl italic" style={{ fontFamily: "'Playfair Display', serif", color: theme.text, fontWeight: 600 }}>{d.name}</h3>
                    <span className="font-medium whitespace-nowrap" style={{ color: theme.accent }}>{fmtPrice(d.price)}</span>
                  </div>
                  {d.description && <p className="text-sm mt-2 leading-relaxed" style={{ color: theme.textMuted }}>{d.description}</p>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALERIE */}
      {gallery.length > 0 && (
        <section id="galerie" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}` }}>
          <div className="max-w-7xl mx-auto">
            <SectionHead kicker="— Galerie —" title="Notre maison" theme={theme} serif />
            <GalleryGrid gallery={gallery} theme={theme} />
          </div>
        </section>
      )}

      {/* AVIS */}
      <section id="avis" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead kicker="— Ils en parlent —" title="Avis de nos clients" theme={theme} serif />
          <ReviewList reviews={reviews} theme={theme} />
          <div className="mt-10 sm:mt-12 max-w-xl">
            <h3 className="text-lg italic mb-4" style={{ fontFamily: "'Playfair Display', serif", color: theme.text }}>Laissez votre avis</h3>
            <ReviewForm restaurantId={restaurant.id} theme={theme} />
          </div>
        </div>
      </section>

      <PoweredFooter restaurant={restaurant} wa={wa} theme={theme} />
      <FloatingWhatsApp href={wa} accent={theme.accent} ink={theme.accentInk} />
      {openDish && <DishModal dish={openDish} theme={theme} onClose={() => setOpenDish(null)} />}
    </div>
  );
}