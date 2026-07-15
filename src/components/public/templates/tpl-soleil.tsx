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

export function TplSoleil(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery, view } = props;
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const cover = pickCover(gallery, menu);
  const rating = avgRating(reviews);
  const cats = Array.from(new Set(menu.filter((m) => m.available).map((m) => m.category))).slice(0, 6);
  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const popular = (activeTab ? menu.filter((m) => m.available && m.category === activeTab) : menu.filter((m) => m.available)).slice(0, 8);
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

  // Navigation is handled by the view query param via href links.

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
        <img src="/bg-soleil.webp" alt="" />
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
              <strong className="block text-2xl sm:text-3xl tracking-[0.25em] truncate" style={{ fontFamily: "'Playfair Display', serif", color: theme.text }}>{restaurant.name.toUpperCase()}</strong>
              <span className="block text-[10px] tracking-[0.5em] mt-0.5" style={{ color: theme.accent }}>~ KITCHEN ~</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <nav className="hidden md:flex gap-5 text-sm font-medium" style={{ color: theme.text }}>
                  <a href={buildViewHref("home")} className={`hover:text-[#c7522a] transition ${activeView === "home" ? "text-[#c7522a] border-b-2 border-[#c7522a]" : ""}`}>Accueil</a>
                  <a href={buildViewHref("menu")} className={`hover:text-[#c7522a] transition ${activeView === "menu" ? "text-[#c7522a] border-b-2 border-[#c7522a]" : ""}`}>Menu</a>
                  <a href={buildViewHref("about")} className={`hover:text-[#c7522a] transition ${activeView === "about" ? "text-[#c7522a] border-b-2 border-[#c7522a]" : ""}`}>À propos</a>
            </nav>
            {restaurant.plan !== "gratuit" && (
              <a href={buildViewHref("reserve")} className="hidden md:inline-flex px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition border-2 border-white" style={{ color: "#ffffff" }}>
                Réserver
              </a>
            )}
            <a href={wa ?? buildViewHref("menu")} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="hidden md:flex w-10 h-10 rounded-full grid place-items-center text-base hover:scale-105 transition" style={{ background: theme.accent, color: theme.accentInk }} aria-label="Commander">
              🛒
            </a>
            <button onClick={() => setMobOpen((v) => !v)} className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-black/5 transition-colors" aria-label="Menu">
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
            {mobOpen && (
          <nav className="md:hidden border-t border-black/10 bg-white/95 backdrop-blur-xl">
            <div className="flex flex-col px-4 py-4 gap-1">
              <a href={buildViewHref("home")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors text-left">Accueil</a>
              <a href={buildViewHref("menu")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors text-left">Menu</a>
              <a href={buildViewHref("about")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors text-left">À propos</a>
              {restaurant.plan !== "gratuit" && (
                <a href={buildViewHref("reserve")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors text-left">Réserver</a>
              )}
              <a href={wa ?? buildViewHref("menu")} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors">🛒 Commander</a>
            </div>
          </nav>
        )}
      </header>

      {/* HOME VIEW */}
      {activeView === "home" && (
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
                    <a href={wa ?? buildViewHref("menu")} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="px-7 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition shadow-lg" style={{ background: theme.accent, color: theme.accentInk }}>
                      Commander
                    </a>
                    {restaurant.plan !== "gratuit" && (
                      <a href={buildViewHref("reserve")} className="px-7 py-3.5 rounded-full font-bold text-sm border-2 border-white hover:bg-white hover:text-[#1e1308] transition shadow-md" style={{ color: "#ffffff" }}>
                        Réserver une table
                      </a>
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
                    <a key={c} href={buildViewHref("menu")} onClick={() => setActiveTab(c)} className="group flex flex-col items-center gap-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full grid place-items-center text-4xl sm:text-5xl group-hover:scale-110 transition" style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                        <CategoryIcon name={c} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#ffffff", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>{c}</span>
                    </a>
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
      {activeView === "menu" && (
        <section id="menu" className="py-16 px-5" style={{ background: theme.surface }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="La carte" title="Notre menu complet" theme={theme} align="center" />
            <MenuGrid menu={menu} theme={theme} />
          </div>
        </section>
      )}

      {/* ABOUT VIEW */}
      {activeView === "about" && (
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
      {activeView === "reserve" && restaurant.plan !== "gratuit" && (
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
      {activeView === "home" && (
        <div className="px-5 py-7" style={{ background: "#8b3a1c" }}>
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6">
            <strong className="text-white text-xl sm:text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>Savourez le meilleur, commandez maintenant</strong>
            <a href={wa ?? buildViewHref("menu")} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="px-7 py-3 rounded-full bg-white font-bold text-sm hover:bg-[#fbf3e6] transition" style={{ color: "#8b3a1c" }}>
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
      {activeView === "home" && (
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