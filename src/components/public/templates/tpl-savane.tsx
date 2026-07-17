import * as React from "react";
import type { TemplateProps, PublicMenuItem, PublicGalleryImage, Theme } from "../shared";
import { MenuGrid, GalleryGrid, ReviewList, AdvancedReservationForm, ReviewForm, SectionHead, FloatingWhatsApp, CoverPlaceholder, buildWhatsAppLink, buildViewHref, avgRating, fmtPrice } from "../shared";
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
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800;900&family=Archivo+Black&display=swap"
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
      <h2 className="leading-[1.05]" style={{ fontFamily: serif ? "'Archivo Black', sans-serif" : "inherit", color: theme.text, fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 600 }}>
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

export function TplSavane(props: TemplateProps) {
  const { restaurant, menu, reviews, gallery, view } = props;
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const cover = pickCover(gallery, menu);
  const signatures = signatureDishes(menu, 3);
  const rating = avgRating(reviews);

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
        <img src="/bg-savane.jpg" alt="" />
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
                <a href={buildViewHref("home")} className={`hover:text-white ${activeView === "home" ? "text-white" : ""}`}>Accueil</a>
                <a href={buildViewHref("menu")} className={`hover:text-white ${activeView === "menu" ? "text-white" : ""}`}>Menu</a>
              </nav>
              {restaurant.plan !== "gratuit" && (
                <a href={buildViewHref("reserve")} className="hidden md:inline-flex px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition border-2 border-white" style={{ color: "#ffffff" }}>
                  Réserver
                </a>
              )}
              <a href={wa ?? buildViewHref("menu")} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="hidden md:inline-flex px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition" style={{ background: theme.accent, color: theme.accentInk }}>
                Commander
              </a>
              <button onClick={() => setMobOpen((v) => !v)} className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Menu">
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
              <a href={buildViewHref("home")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left">Accueil</a>
              <a href={buildViewHref("about")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left">À propos</a>
              <a href={buildViewHref("menu")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left">Menu</a>
              {restaurant.plan !== "gratuit" && (
                <a href={buildViewHref("reserve")} onClick={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left">Réserver</a>
              )}
            </div>
          </nav>
        )}

        {/* HOME VIEW */}
        {activeView === "home" && (
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
                <a href={buildViewHref("menu")} className="inline-block px-8 py-4 rounded-full font-black text-sm hover:scale-105 transition shadow-xl" style={{ background: theme.accent, color: theme.accentInk }}>
                  VOIR LE MENU →
                </a>
                <a href={wa ?? buildViewHref("menu")} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="inline-block px-8 py-4 rounded-full font-black text-sm border-2 border-white hover:bg-white hover:text-red-600 transition shadow-lg">
                  COMMANDER
                </a>
              </div>
            </div>
            <div className="relative">
              {cover ? (
                <StorageImage path={cover} alt={restaurant.name} className="w-full aspect-square object-cover rounded-full shadow-2xl border-8 border-white/20" />
              ) : (
                <div className="w-full aspect-square rounded-full" style={{ background: "radial-gradient(circle,#f5b921,#c8281e)" }}>
                  <CoverPlaceholder background="transparent" stroke="rgba(255,255,255,0.92)" rounded="9999px" />
                </div>
              )}
              <span className="absolute -top-2 -right-2 text-5xl rotate-12">✨</span>
              <span className="absolute bottom-4 -left-4 text-4xl">⚡</span>
            </div>
          </div>
        )}

        {/* MENU VIEW */}
        {activeView === "menu" && (
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
        {activeView === "about" && (
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
        {activeView === "reserve" && restaurant.plan !== "gratuit" && (
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
        {activeView === "home" && (
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
              <a href={wa ?? buildViewHref("menu")} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="hidden sm:inline-block px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap" style={{ background: theme.accent, color: theme.accentInk }}>
                COMMANDER
              </a>
            </div>
          </div>
        )}
      </section>

      {/* SECONDARY RED CARD - only on home */}
      {activeView === "home" && (
        <section className="px-5 pt-28 pb-12">
          <div className="max-w-6xl mx-auto rounded-[28px] overflow-hidden grid lg:grid-cols-[1fr_auto] gap-6 p-8 sm:p-10 items-center" style={{ background: RED }}>
            <div className="text-white">
              <h2 className="leading-[0.95]" style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                Commande en quelques minutes
              </h2>
              <p className="mt-3 text-white/85 max-w-md">Choisis, paie, et déguste — c'est aussi simple que ça.</p>
              <a href={wa ?? buildViewHref("menu")} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="mt-5 inline-block px-7 py-3 rounded-full font-bold text-sm" style={{ background: theme.accent, color: theme.accentInk }}>
                COMMANDER MAINTENANT
              </a>
            </div>
            <div className="text-7xl sm:text-8xl text-center">🍔</div>
          </div>
        </section>
      )}

      {/* SIGNATURES 3-card - only on home */}
      {activeView === "home" && signatures.length > 0 && (
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
                      <a href={wa ?? buildViewHref("menu")} target={wa ? "_blank" : undefined} rel="noopener noreferrer" className="px-4 py-1.5 rounded-full font-bold text-xs bg-white" style={{ color: RED }}>COMMANDER</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FULL MENU - only on menu view */}
      {activeView === "menu" && (
        <section id="menu" className="py-16 px-5" style={{ background: theme.surface }}>
          <div className="max-w-6xl mx-auto">
            <SectionHead kicker="La carte complète" title="Tous nos plats" theme={theme} align="center" />
            <MenuGrid menu={menu} theme={theme} />
          </div>
        </section>
      )}

      {/* ABOUT SECTION - only on about view */}
      {activeView === "about" && (
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
      {activeView === "reserve" && restaurant.plan !== "gratuit" && (
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
      {activeView === "home" && (
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
