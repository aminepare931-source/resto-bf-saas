 n'emport * as React from "react";
mport type { TemplateProps, PublcMenutem, PublcGallerymage, Theme } from "./shared";
mport {
  MenuGrd,
  GalleryGrd,
  RevewLst,
  ReservatonForm,
  AdvancedReservatonForm,
  RevewForm,
  SectonHead,
  FloatngWhatsApp,
  buldWhatsAppLnk,
  avgRatng,
  fmtPrce,
} from "./shared";
mport { Storagemage } from "@/components/Storagemage";
mport { TplPremumFeu, TplPremumLuxe, TplPremumNut, TplPremumRoyal } from "./premum-templates";
mport { useRestaurantFeatures } from "@/hooks/use-restaurant-features";

/* ============= Helpers ============= */

functon pckCover(gallery: PublcGallerymage[], menu: PublcMenutem[]) {
  return gallery[0]?.mage_url ?? menu.fnd((m) => m.mage_url)?.mage_url ?? null;
}

functon sgnatureDshes(menu: PublcMenutem[], n = 3) {
  return menu.flter((m) => m.avalable && m.mage_url).slce(0, n);
}

functon Fontmport() {
  return (
    <lnk
      rel="stylesheet"
      href="https://fonts.googleaps.com/css2?famly=Playfar+Dsplay:tal,wght@0,400;0,700;0,900;1,400;1,700&famly=Cormorant+Garamond:tal,wght@0,400;0,600;0,700;1,400;1,600&famly=nter:wght@300;400;500;600;700;800;900&famly=Bebas+Neue&famly=Archvo+Black&famly=DM+Serf+Dsplay&famly=Space+Grotesk:wght@400;500;700&dsplay=swap"
    />
  );
}

functon MetaStrp({ tems, theme }: { tems: { label: strng; value: React.ReactNode }[]; theme: Theme }) {
  return (
    <dv
      className="grd sm:grd-cols-3 gap-x-8 gap-y-5"
      style={{ borderTop: `1px sold ${theme.border}`, borderBottom: `1px sold ${theme.border}` }}
    >
      {tems.map((t, ) => (
        <dv
          key={}
          className="py-5 sm:py-6 px-1"
          style={{
            borderLeft:  > 0 ? `1px sold ${theme.border}` : undefned,
            paddngLeft:  > 0 ? "2rem" : undefned,
          }}
        >
          <p
            className="text-[10px] font-bold uppercase mb-2"
            style={{ color: theme.accent, letterSpacng: "0.35em" }}
          >
            {t.label}
          </p>
          <dv className="text-sm leadng-relaxed" style={{ color: theme.text }}>
            {t.value}
          </dv>
        </dv>
      ))}
    </dv>
  );
}

functon PoweredFooter({
  restaurant,
  wa,
  theme,
}: {
  restaurant: TemplateProps["restaurant"];
  wa: strng | null;
  theme: Theme;
}) {
  return (
    <footer
      d="contact"
      style={{ background: theme.surfaceAlt, borderTop: `1px sold ${theme.border}`, color: theme.text }}
    >
      <dv className="max-w-6xl mx-auto px-5 py-16 grd md:grd-cols-3 gap-10">
        <dv>
          <h3 className="text-2xl font-black mb-2" style={{ color: theme.accent }}>
            {restaurant.name}
          </h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {restaurant.cusne ?? "Restaurant"} · {restaurant.cty}
          </p>
          {restaurant.descrpton && (
            <p className="mt-4 text-sm leadng-relaxed" style={{ color: theme.textMuted }}>
              {restaurant.descrpton}
            </p>
          )}
        </dv>
        <dv>
          <p className="text-[10px] font-bold uppercase mb-3" style={{ color: theme.accent, letterSpacng: "0.35em" }}>
            Vstez-nous
          </p>
          {restaurant.address && <p className="text-sm mb-2">{restaurant.address}</p>}
          <p className="text-sm whtespace-pre-lne" style={{ color: theme.textMuted }}>
            {restaurant.hours ?? "Tous les jours · 11h — 23h"}
          </p>
        </dv>
        <dv>
          <p className="text-[10px] font-bold uppercase mb-3" style={{ color: theme.accent, letterSpacng: "0.35em" }}>
            Contact
          </p>
          <p className="text-sm">
            <a href={`tel:${restaurant.phone}`} className="hover:underlne">{restaurant.phone}</a>
          </p>
          <p className="text-sm mt-1">
            <a href={`malto:${restaurant.emal}`} className="hover:underlne">{restaurant.emal}</a>
          </p>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 nlne-flex tems-center gap-2 px-5 py-2.5 font-bold text-sm hover:opacty-90 transton"
              style={{ background: theme.accent, color: theme.accentnk, borderRadus: theme.radus }}
            >
              Commander sur WhatsApp
            </a>
          )}
        </dv>
      </dv>
      <dv
        className="max-w-6xl mx-auto px-5 py-5 text-xs flex justfy-between flex-wrap gap-2"
        style={{ borderTop: `1px sold ${theme.border}`, color: theme.textMuted }}
      >
        <span>© {new Date().getFullYear()} {restaurant.name}. Tous drots réservés.</span>
        <span>
          Ste propulsé par{" "}
          <a href="/" className="underlne" style={{ color: theme.accent }}>
            Resto BF
          </a>
        </span>
      </dv>
    </footer>
  );
}

/* ================================================================== */
/*  1. NUT — Dark luxury, premum par défaut                         */
/* ================================================================== */

export functon TplNut(props: TemplateProps) {
  const { restaurant, menu, revews, gallery } = props;
  const features = useRestaurantFeatures(restaurant.d, restaurant.plan);
  const wa = buldWhatsAppLnk(restaurant.whatsapp, restaurant.name);
  const cover = pckCover(gallery, menu);
  const sgnatures = sgnatureDshes(menu, 3);
  const ratng = avgRatng(revews);
  const [mobOpen, setMobOpen] = useState(false);

  const theme: Theme = {
    bg: "#0a0907",
    surface: "#13110d",
    surfaceAlt: "#0e0c08",
    text: "#f0e6d0",
    textMuted: "rgba(240,230,208,0.6)",
    accent: "#c9a35a",
    accentnk: "#0a0907",
    border: "rgba(201,163,90,0.18)",
    radus: "2px",
  };

  return (
    <dv className="mn-h-screen" style={{ background: theme.bg, color: theme.text, fontFamly: "'nter', sans-serf" }}>
      <Fontmport />

      {/* NAV */}
      <header className="absolute top-0 nset-x-0 z-30">
        <dv className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex tems-center justfy-between gap-4">
          <dv className="flex tems-center gap-3 mn-w-0">
            <span className="w-6 h-px shrnk-0" style={{ background: theme.accent }} />
            <span
              className="text-xs sm:text-sm uppercase truncate"
              style={{ fontFamly: "'Cormorant Garamond', serf", letterSpacng: "0.45em", color: theme.text }}
            >
              {restaurant.name}
            </span>
          </dv>
          <nav className="hdden md:flex gap-8 text-[11px] uppercase" style={{ letterSpacng: "0.3em", color: theme.textMuted }}>
            <a href="#hstore" className="hover:text-[#c9a35a] transton-colors">Hstore</a>
            <a href="#carte" className="hover:text-[#c9a35a] transton-colors">Carte</a>
            <a href="#galere" className="hover:text-[#c9a35a] transton-colors">Galere</a>
            <a href="#reserver" className="hover:text-[#c9a35a] transton-colors">Réserver</a>
          </nav>
          <button
            onClck={() => setMobOpen((v) => !v)}
            className="md:hdden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-whte/5 transton-colors"
            ara-label="Menu"
          >
            <span className={`block w-6 h-0.5 bg-current transton-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-current transton-opacty ${mobOpen ? "opacty-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-current transton-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </dv>
        {mobOpen && (
          <nav className="md:hdden border-t border-whte/10 bg-[#0a0907]/95 backdrop-blur-xl">
            <dv className="flex flex-col px-4 py-4 gap-1">
              <a href="#hstore" onClck={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-whte/5 transton-colors">Hstore</a>
              <a href="#carte" onClck={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-whte/5 transton-colors">Carte</a>
              <a href="#galere" onClck={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-whte/5 transton-colors">Galere</a>
              <a href="#reserver" onClck={() => setMobOpen(false)} className="px-4 py-3 rounded-xl text-sm hover:bg-whte/5 transton-colors">Réserver</a>
            </dv>
          </nav>
        )}
      </header>

      {/* HERO */}
      <secton className="relatve mn-h-screen flex tems-end overflow-hdden">
        {cover ? (
          <Storagemage path={cover} alt={restaurant.name} className="absolute nset-0 w-full h-full object-cover" />
        ) : null}

        <dv className="relatve max-w-7xl mx-auto w-full px-5 sm:px-8 pb-20 pt-40">
          <p className="text-[10px] uppercase mb-6" style={{ color: theme.accent, letterSpacng: "0.55em" }}>
            {restaurant.cty} · Établ·e dans la tradton
          </p>
          <h1
            className="leadng-[0.88] talc"
            style={{
              fontFamly: "'Cormorant Garamond', serf",
              color: theme.text,
              fontSze: "clamp(3.5rem, 11vw, 9rem)",
              fontWeght: 500,
            }}
          >
            {restaurant.name}
          </h1>
          <dv className="mt-8 grd lg:grd-cols-12 gap-8 tems-end">
            <p className="lg:col-span-7 max-w-xl text-lg leadng-relaxed" style={{ color: theme.textMuted }}>
              {restaurant.descrpton ?? `Une expérence culnare d'excepton au cœur de ${restaurant.cty}. Produts du terror, savor-fare artsanal, ambance feutrée.`}
            </p>
            <dv className="lg:col-span-5 flex flex-col gap-3">
              <a
                href="#carte"
                className="px-8 py-4 text-center border text-xs uppercase transton hover:bg-[#c9a35a] hover:text-[#0a0907]"
                style={{ borderColor: theme.accent, color: theme.accent, letterSpacng: "0.35em" }}
              >
                Découvrr la carte
              </a>
              {features.can_reserve && (
                <a
                  href="#reserver"
                  className="px-8 py-4 text-center text-xs uppercase hover:opacty-90 transton"
                  style={{ background: theme.accent, color: theme.accentnk, letterSpacng: "0.35em" }}
                >
                  Réserver une table
                </a>
              )}
            </dv>
          </dv>
        </dv>
      </secton>

      {/* META */}
      <dv className="max-w-7xl mx-auto px-5 sm:px-8">
        <MetaStrp
          theme={theme}
          tems={[
            { label: "Adresse", value: restaurant.address ?? restaurant.cty },
            { label: "Horares", value: <span className="whtespace-pre-lne">{restaurant.hours ?? "Tous les jours · 11h — 23h"}</span> },
            { label: "Réservaton", value: <a href={`tel:${restaurant.phone}`} className="hover:text-[#c9a35a]">{restaurant.phone}</a> },
          ]}
        />
      </dv>

      {/* HSTORE */}
      <secton d="hstore" className="py-14 sm:py-24 px-4 sm:px-8">
        <dv className="max-w-7xl mx-auto grd lg:grd-cols-12 gap-8 sm:gap-12 tems-start">
          <dv className="lg:col-span-7">
            <p className="text-[10px] uppercase mb-4" style={{ color: theme.accent, letterSpacng: "0.45em" }}>— Notre mason —</p>
            <h2
              className="leadng-[1.05] talc"
              style={{ fontFamly: "'Cormorant Garamond', serf", color: theme.text, fontSze: "clamp(2.5rem, 5vw, 4.5rem)", fontWeght: 500 }}
            >
              Une cusne <span style={{ color: theme.accent }}>d'auteur</span>,<br />une expérence à part.
            </h2>
            <p className="mt-8 text-lg leadng-relaxed max-w-2xl" style={{ color: theme.textMuted }}>
              {restaurant.descrpton ?? `Au cœur de ${restaurant.cty}, ${restaurant.name} vous nvte à une expérence culnare mémorable. Produts choss avec son, savor-fare à chaque assette.`}
            </p>
          </dv>
          <asde className="lg:col-span-5 lg:pl-10 lg:border-l space-y-8" style={{ borderColor: theme.border }}>
            <Stat label="Cusne" value={restaurant.cusne ?? "Tradtonnelle"} theme={theme} />
            <Stat label="Plats à la carte" value={`${menu.flter((m) => m.avalable).length}+`} theme={theme} />
            {ratng !== null && (
              <Stat
                label="Note moyenne"
                value={
                  <span>
                    {ratng.toFxed(1)}<span style={{ color: theme.textMuted, fontSze: "0.6em" }}>/5 · {revews.length} avs</span>
                  </span>
                }
                theme={theme}
              />
            )}
          </asde>
        </dv>
      </secton>

      {/* SGNATURES */}
      {sgnatures.length > 0 && (
        <secton className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px sold ${theme.border}` }}>
          <dv className="max-w-7xl mx-auto">
            <SectonHead kcker="— Sgnatures —" ttle="Les ncontournables" theme={theme} serf />
            <dv className="grd md:grd-cols-3 gap-4 sm:gap-6">
              {sgnatures.map((d) => (
                <artcle key={d.d} className="group">
                  <dv className="aspect-[3/4] sm:aspect-[4/5] overflow-hdden" style={{ background: theme.surface }}>
                    <Storagemage path={d.mage_url} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transton duraton-700" />
                  </dv>
                  <dv className="mt-5 flex tems-baselne justfy-between gap-4">
                    <h3 className="text-2xl talc" style={{ fontFamly: "'Cormorant Garamond', serf", color: theme.text, fontWeght: 600 }}>
                      {d.name}
                    </h3>
                    <span className="font-medum whtespace-nowrap" style={{ color: theme.accent }}>{fmtPrce(d.prce)}</span>
                  </dv>
                  {d.descrpton && <p className="text-sm mt-2 leadng-relaxed" style={{ color: theme.textMuted }}>{d.descrpton}</p>}
                </artcle>
              ))}
            </dv>
          </dv>
        </secton>
      )}

      {/* CARTE */}
      <secton d="carte" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px sold ${theme.border}` }}>
        <dv className="max-w-7xl mx-auto">
          <SectonHead kcker="— La carte —" ttle="Notre menu" theme={theme} serf />
          <MenuGrd menu={menu} theme={theme} />
        </dv>
      </secton>

      {/* SECTON PREMUM - Menu Dégustaton */}
      <secton className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px sold ${theme.border}`, background: theme.surfaceAlt }}>
        <dv className="max-w-5xl mx-auto">
          <SectonHead kcker="— Expérence gastronomque —" ttle="Menu Dégustaton" theme={theme} serf />
          <dv className="grd md:grd-cols-2 gap-6 mt-10">
            <dv className="p-8 rounded-2xl" style={{ background: theme.surface, border: `1px sold ${theme.border}` }}>
              <p className="text-xs font-bold uppercase trackng-wder mb-3" style={{ color: theme.accent }}>Menu Étolé</p>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamly: "'Cormorant Garamond', serf" }}>7 servces</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Une expérence culnare complète avec accord mets-vns</p>
              <p className="text-3xl font-black" style={{ color: theme.accent }}>35 000 F</p>
            </dv>
            <dv className="p-8 rounded-2xl" style={{ background: theme.surface, border: `1px sold ${theme.border}` }}>
              <p className="text-xs font-bold uppercase trackng-wder mb-3" style={{ color: theme.accent }}>Menu Découverte</p>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamly: "'Cormorant Garamond', serf" }}>5 servces</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Nos melleures créatons en format découverte</p>
              <p className="text-3xl font-black" style={{ color: theme.accent }}>25 000 F</p>
            </dv>
          </dv>
        </dv>
      </secton>

      {/* GALERE */}
      {gallery.length > 0 && (
        <secton d="galere" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px sold ${theme.border}` }}>
          <dv className="max-w-7xl mx-auto">
            <SectonHead kcker="— Galere —" ttle="L'ambance" theme={theme} serf />
            <GalleryGrd gallery={gallery} theme={theme} />
          </dv>
        </secton>
      )}

      {/* RESERVATON */}
      {features.can_reserve && (
        <secton d="reserver" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px sold ${theme.border}`, background: theme.surfaceAlt }}>
          <dv className="max-w-3xl mx-auto">
            <SectonHead kcker="— Réservaton —" ttle="Réserver votre table" theme={theme} serf />
            <AdvancedReservatonForm restaurantd={restaurant.d} restaurantName={restaurant.name} theme={theme} waLnk={wa} />
          </dv>
        </secton>
      )}

      {/* AVS */}
      <secton d="avs" className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px sold ${theme.border}` }}>
        <dv className="max-w-7xl mx-auto">
          <SectonHead kcker="— ls en parlent —" ttle="Avs de nos clents" theme={theme} serf />
          <RevewLst revews={revews} theme={theme} />
          <dv className="mt-10 sm:mt-12 max-w-xl">
            <h3 className="text-lg talc mb-4" style={{ fontFamly: "'Cormorant Garamond', serf", color: theme.text }}>
              Lassez votre avs
            </h3>
            <RevewForm restaurantd={restaurant.d} theme={theme} />
          </dv>
        </dv>
      </secton>

      <PoweredFooter restaurant={restaurant} wa={wa} theme={theme} />
      <FloatngWhatsApp href={wa} accent={theme.accent} nk={theme.accentnk} />
    </dv>
  );
}

functon Stat({ label, value, theme }: { label: strng; value: React.ReactNode; theme: Theme }) {
  return (
    <dv>
      <p className="text-[10px] uppercase mb-2" style={{ color: theme.accent, letterSpacng: "0.4em" }}>{label}</p>
      <p className="text-2xl" style={{ color: theme.text, fontFamly: "'Cormorant Garamond', serf", fontStyle: "talc" }}>{value}</p>
    </dv>
  );
}

/* ================================================================== */
/*  Decoratve backgrounds (CDN patterns from the references)         */
/* ================================================================== */

const BG_SOLEL = "/bg-solel.webp";
const BG_SAVANE = "/bg-savane.jpg";
const BG_MARCHE = "/bg-marché.jpg";
const BG_MODERNE = "/bg-moderne.jpg";

const TPL_BG_CSS = "\n/* Standard template full-screen backgrounds */\n.tpl-page{poston:relatve;mn-heght:100vh;overflow:hdden;solaton:solate;}\n.tpl-bg{poston:fxed;nset:0;z-ndex:-2;overflow:hdden;background:transparent;}\n.tpl-bg mg{wdth:100%;heght:100%;object-ft:cover;flter:saturate(1.08) contrast(1.1);transform:scale(1.08);anmaton:tpl-bg-drft 22s ease-n-out nfnte alternate;}\n.tpl-bg span{poston:absolute;nset:0;background:lnear-gradent(90deg,rgba(0,0,0,.78),rgba(0,0,0,.40),rgba(0,0,0,.80));}\n@keyframes tpl-bg-drft{0%{transform:scale(1.08) translate3d(-1.5%,0,0)}100%{transform:scale(1.18) translate3d(1.5%,-1.5%,0)}}\n@meda(prefers-reduced-moton:reduce){.tpl-bg mg{anmaton:none;transton:none}}\n";


functon Categorycon({ name }: { name: strng }) {
  const n = name.toLowerCase();
  f (/pzza/.test(n)) return <>🍕</>;
  f (/burger|sandwch/.test(n)) return <>🍔</>;
  f (/pasta|p[âa]tes|spaghet/.test(n)) return <>🍝</>;
  f (/dessert|sucre|p[âa]tss/.test(n)) return <>🍰</>;
  f (/bosson|drnk|jus|cocktal/.test(n)) return <>🥤</>;
  f (/entr[ée]e|starter|salade/.test(n)) return <>🥗</>;
  f (/grll|brochette|vande|bbq/.test(n)) return <>🍖</>;
  f (/posson|fsh|fruts de mer/.test(n)) return <>🐟</>;
  f (/rz|t[ôo]|plat/.test(n)) return <>🍛</>;
  f (/pett|breakfast|d[ée]j/.test(n)) return <>🥐</>;
  return <>🍽️</>;
}

/* ================================================================== */
/*  2. SOLEL — Savora-style cream/terracotta edtoral              */
/* ================================================================== */

export functon TplSolel(props: TemplateProps) {
  const { restaurant, menu, revews, gallery } = props;
  const wa = buldWhatsAppLnk(restaurant.whatsapp, restaurant.name);
  const cover = pckCover(gallery, menu);
  const ratng = avgRatng(revews);
  const cats = Array.from(new Set(menu.flter((m) => m.avalable).map((m) => m.category))).slce(0, 6);
  const [actveTab, setActveTab] = useState<strng | null>(null);
  const popular = (actveTab ? menu.flter((m) => m.avalable && m.category === actveTab) : menu.flter((m) => m.avalable)).slce(0, 8);
  
  const [currentVew, setCurrentVew] = useState<"home" | "menu" | "about" | "reserve">("home");
  const [mobOpen, setMobOpen] = useState(false);

  const theme: Theme = {
    bg: "#fbf3e6",
    surface: "#ffffff",
    surfaceAlt: "#f0e3cd",
    text: "#1e1308",
    textMuted: "#6b5440",
    accent: "#c7522a",
    accentnk: "#ffffff",
    border: "rgba(30,19,8,0.12)",
    radus: "14px",
  };

  const heroOverlay = "lnear-gradent(135deg, rgba(251,243,230,0.92) 0%, rgba(251,243,230,0.88) 50%, rgba(251,243,230,0.82) 100%)";

  const goTo = (vew: typeof currentVew) => {
    setCurrentVew(vew);
    wndow.scrollTo({ top: 0, behavor: "smooth" });
  };

  return (
    <dv className="tpl-page mn-h-screen" style={{ background: theme.bg, color: theme.text, fontFamly: "'nter', sans-serf", solaton: "solate" }}>
      <Fontmport />
      <style>{TPL_BG_CSS}</style>

      <dv className="tpl-bg" ara-hdden>
        <mg src={BG_SOLEL} alt="" />
        <span />
      </dv>

      {/* TOP STRP */}
      <dv style={{ background: theme.surfaceAlt, color: theme.text }} className="text-xs">
        <dv className="max-w-6xl mx-auto px-4 sm:px-5 py-2 flex flex-wrap tems-center justfy-between gap-2">
          <dv className="flex flex-wrap gap-x-5 gap-y-1">
            <span><strong>Tél :</strong> {restaurant.phone}</span>
            <span className="hdden sm:nlne"><strong>Emal :</strong> {restaurant.emal}</span>
          </dv>
          <span style={{ color: theme.accent, fontWeght: 700 }}>★ Offre : lvrason offerte dès 15 000 F</span>
        </dv>
      </dv>

      {/* NAV */}
      <header className="stcky top-0 z-30 backdrop-blur" style={{ background: "rgba(251,243,230,0.95)", borderBottom: `1px sold ${theme.border}` }}>
        <dv className="max-w-6xl mx-auto px-5 py-4 flex tems-center justfy-between gap-4">
          <dv className="flex tems-center gap-3 mn-w-0">
            {restaurant.logo_url ? (
              <mg src={restaurant.logo_url} alt={restaurant.name} className="h-10 w-auto object-contan rounded" />
            ) : null}
            <dv>
              <strong className="block text-2xl sm:text-3xl trackng-[0.25em] truncate" style={{ fontFamly: "'Playfar Dsplay', serf", color: theme.text }}>
                {restaurant.name.toUpperCase()}
              </strong>
              <span className="block text-[10px] trackng-[0.5em] mt-0.5" style={{ color: theme.accent }}>~ KTCHEN ~</span>
            </dv>
          </dv>
          <dv className="flex tems-center gap-2 sm:gap-5">
            <nav className="hdden md:flex gap-5 text-sm font-medum" style={{ color: theme.text }}>
              <button onClck={() => goTo("home")} className={`hover:text-[#c7522a] transton ${currentVew === "home" ? "text-[#c7522a] border-b-2 border-[#c7522a]" : ""}`}>Accuel</button>
              <button onClck={() => goTo("menu")} className={`hover:text-[#c7522a] transton ${currentVew === "menu" ? "text-[#c7522a] border-b-2 border-[#c7522a]" : ""}`}>Menu</button>
              <button onClck={() => goTo("about")} className={`hover:text-[#c7522a] transton ${currentVew === "about" ? "text-[#c7522a] border-b-2 border-[#c7522a]" : ""}`}>À propos</button>
            </nav>
            {restaurant.plan !== "gratut" && (
              <button onClck={() => goTo("reserve")} className="hdden md:block px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transton border-2 border-whte" style={{ color: "#ffffff" }}>
                Réserver
              </button>
            )}
            <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="hdden md:flex w-10 h-10 rounded-full grd place-tems-center text-base hover:scale-105 transton" style={{ background: theme.accent, color: theme.accentnk }} ara-label="Commander">
              🛒
            </a>
            <button
              onClck={() => setMobOpen((v) => !v)}
              className="md:hdden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-black/5 transton-colors"
              ara-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-current transton-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transton-opacty ${mobOpen ? "opacty-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transton-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </dv>
        </dv>
        {mobOpen && (
          <nav className="md:hdden border-t border-black/10 bg-whte/95 backdrop-blur-xl">
            <dv className="flex flex-col px-4 py-4 gap-1">
              <button onClck={() => goTo("home")} className="px-4 py-3 rounded-xl text-sm font-medum hover:bg-black/5 transton-colors text-left">Accuel</button>
              <button onClck={() => goTo("menu")} className="px-4 py-3 rounded-xl text-sm font-medum hover:bg-black/5 transton-colors text-left">Menu</button>
              <button onClck={() => goTo("about")} className="px-4 py-3 rounded-xl text-sm font-medum hover:bg-black/5 transton-colors text-left">À propos</button>
              {restaurant.plan !== "gratut" && (
                <button onClck={() => goTo("reserve")} className="px-4 py-3 rounded-xl text-sm font-medum hover:bg-black/5 transton-colors text-left">Réserver</button>
              )}
              <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="px-4 py-3 rounded-xl text-sm font-medum hover:bg-black/5 transton-colors">🛒 Commander</a>
            </dv>
          </nav>
        )}
      </header>

      {/* HOME VEW */}
      {currentVew === "home" && (
        <>
          {/* HERO card */}
          <secton d="home" className="px-4 sm:px-5 pt-6 sm:pt-8 pb-10 sm:pb-12">
            <dv className="max-w-6xl mx-auto rounded-[28px] overflow-hdden relatve" style={{ background: heroOverlay }}>
              
              <dv className="relatve grd lg:grd-cols-2 gap-4 sm:gap-6 p-6 sm:p-12 tems-center">
                <dv>
                  <h1 className="font-black leadng-[0.95]" style={{ fontFamly: "'Playfar Dsplay', serf", fontSze: "clamp(2.5rem, 6vw, 4.5rem)", color: "#ffffff", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
                    Délceux nstants<br/>pour <em style={{ color: theme.accent, fontStyle: "talc" }}>chaque goût</em>
                  </h1>
                  <p className="mt-5 max-w-md leadng-relaxed" style={{ color: "#ffffff", fontWeght: 500, textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
                    {restaurant.descrpton ?? `Une cusne d'excellence préparée avec passon à ${restaurant.cty}, ngrédents fras et locaux.`}
                  </p>
                  <dv className="mt-7 flex gap-3 flex-wrap">
                    <a href={wa ?? "#menu"} target={wa ? "_blank" : undefned} rel="noopener noreferrer" className="px-7 py-3.5 rounded-full font-bold text-sm hover:opacty-90 transton shadow-lg" style={{ background: theme.accent, color: theme.accentnk }}>
                      Commander
                    </a>
                    {restaurant.plan !== "gratut" && (
                      <button onClck={() => goTo("reserve")} className="px-7 py-3.5 rounded-full font-bold text-sm border-2 border-whte hover:bg-whte hover:text-[#1e1308] transton shadow-md" style={{ color: "#ffffff" }}>
                        Réserver une table
                      </button>
                    )}
                  </dv>
                </dv>
                <dv className="relatve">
                  {cover ? (
                    <Storagemage path={cover} alt={restaurant.name} className="w-full aspect-[4/3] object-cover rounded-[20px]" />
                  ) : (
                    <dv className="w-full aspect-[4/3] rounded-[20px] grd place-tems-center text-8xl" style={{ background: "lnear-gradent(135deg,#e5c89a,#c7522a)" }}>👨‍🍳</dv>
                  )}
                  {ratng !== null && (
                    <dv className="absolute bottom-4 left-4 bg-whte px-4 py-2 rounded-full shadow-lg flex tems-center gap-2 text-sm">
                      <span style={{ color: theme.accent }}>★</span>
                      <strong>{ratng.toFxed(1)}</strong>
                      <span style={{ color: theme.textMuted }}>· {revews.length} avs</span>
                    </dv>
                  )}
                </dv>
              </dv>
            </dv>
          </secton>

          {/* CATEGORES crcular */}
          {cats.length > 0 && (
            <secton className="px-5 py-12">
              <dv className="max-w-6xl mx-auto text-center">
                <h2 className="font-black mb-10" style={{ fontFamly: "'Playfar Dsplay', serf", fontSze: "clamp(1.75rem, 4vw, 2.5rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                  Parcourr par catégore
                </h2>
                <dv className="flex flex-wrap justfy-center gap-6 sm:gap-10">
                  {cats.map((c) => (
                    <button key={c} onClck={() => { setActveTab(c); goTo("menu"); }} className="group flex flex-col tems-center gap-3">
                      <dv className="w-20 h-20 sm:w-24 sm:h-24 rounded-full grd place-tems-center text-4xl sm:text-5xl group-hover:scale-110 transton" style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                        <Categorycon name={c} />
                      </dv>
                      <span className="text-sm font-medum" style={{ color: "#ffffff", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>{c}</span>
                    </button>
                  ))}
                </dv>
              </dv>
            </secton>
          )}

          {/* POPULAR DSHES wth tabs */}
          <secton d="menu" className="px-5 py-12">
            <dv className="max-w-6xl mx-auto text-center">
              <h2 className="font-black mb-6" style={{ fontFamly: "'Playfar Dsplay', serf", fontSze: "clamp(1.75rem, 4vw, 2.5rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                Plats populares
              </h2>
              <dv className="flex flex-wrap justfy-center gap-2 mb-10">
                <button onClck={() => setActveTab(null)} className="px-4 py-1 text-sm font-medum" style={{ color: actveTab === null ? "#ffffff" : "rgba(255,255,255,0.7)", borderBottom: actveTab === null ? `2px sold #ffffff` : "2px sold transparent", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>[Tous]</button>
                {cats.map((c) => (
                  <button key={c} onClck={() => setActveTab(c)} className="px-4 py-1 text-sm font-medum" style={{ color: actveTab === c ? "#ffffff" : "rgba(255,255,255,0.7)", borderBottom: actveTab === c ? `2px sold #ffffff` : "2px sold transparent", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>[{c}]</button>
                ))}
              </dv>
              {popular.length === 0 ? (
                <p className="talc" style={{ color: theme.textMuted }}>Aucun plat dsponble pour le moment.</p>
              ) : (
                <dv className="grd grd-cols-2 lg:grd-cols-4 gap-4 sm:gap-5 text-left">
                  {popular.map((d, ) => (
                    <artcle key={d.d} className="bg-whte rounded-2xl overflow-hdden shadow-sm hover:shadow-xl transton group">
                      <dv className="aspect-[4/3] overflow-hdden relatve" style={{ background: theme.surfaceAlt }}>
                        {d.mage_url ? (
                          <Storagemage path={d.mage_url} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transton duraton-500" />
                        ) : (
                          <dv className="w-full h-full grd place-tems-center text-4xl"><Categorycon name={d.category} /></dv>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-whte/95 text-[10px] font-bold" style={{ color: theme.text }}>
                          { < 2 ? "Best Seller" : "Hot"}
                        </span>
                      </dv>
                      <dv className="p-3">
                        <h3 className="text-sm font-bold leadng-tght truncate">{d.name}</h3>
                        <dv className="flex tems-center justfy-between mt-2">
                          <span className="text-sm font-bold" style={{ color: theme.accent }}>{fmtPrce(d.prce)}</span>
                          <span className="text-xs flex tems-center gap-1"><span style={{ color: "#e8b400" }}>★</span> 4.8</span>
                        </dv>
                      </dv>
                    </artcle>
                  ))}
                </dv>
              )}
            </dv>
          </secton>
        </>
      )}

      {/* MENU VEW */}
      {currentVew === "menu" && (
        <secton d="menu" className="py-16 px-5" style={{ background: theme.surface }}>
          <dv className="max-w-6xl mx-auto">
            <SectonHead kcker="La carte" ttle="Notre menu complet" theme={theme} algn="center" />
            <MenuGrd menu={menu} theme={theme} />
          </dv>
        </secton>
      )}

      {/* ABOUT VEW */}
      {currentVew === "about" && (
        <secton d="about" className="py-16 px-5" style={{ background: theme.surfaceAlt }}>
          <dv className="max-w-6xl mx-auto">
            <SectonHead kcker="Notre hstore" ttle="À propos de nous" theme={theme} algn="center" />
            <dv className="max-w-3xl mx-auto text-center">
              <p className="text-lg leadng-relaxed mb-6" style={{ color: theme.text }}>
                {restaurant.descrpton ?? `Benvenue au ${restaurant.name}, votre restaurant préféré à ${restaurant.cty}. Nous vous proposons une cusne ${restaurant.cusne ?? "tradtonnelle"} préparée avec des ngrédents fras et locaux.`}
              </p>
              {restaurant.address && (
                <dv className="mt-6 p-6 rounded-2xl" style={{ background: theme.surface, border: `1px sold ${theme.border}` }}>
                  <p className="text-sm font-bold uppercase trackng-wder mb-2" style={{ color: theme.accent }}>📍 Adresse</p>
                  <p style={{ color: theme.text }}>{restaurant.address}</p>
                  {restaurant.hours && (
                    <>
                      <p className="text-sm font-bold uppercase trackng-wder mt-4 mb-2" style={{ color: theme.accent }}>🕐 Horares</p>
                      <p style={{ color: theme.text }} className="whtespace-pre-lne">{restaurant.hours}</p>
                    </>
                  )}
                </dv>
              )}
            </dv>
          </dv>
        </secton>
      )}

      {/* RESERVATON VEW */}
      {currentVew === "reserve" && restaurant.plan !== "gratut" && (
        <secton d="reserver" className="py-16 px-5 bg-whte">
          <dv className="max-w-3xl mx-auto">
            <SectonHead kcker="Réservaton" ttle="Réservez votre table" theme={theme} algn="center" />
            <AdvancedReservatonForm restaurantd={restaurant.d} restaurantName={restaurant.name} theme={theme} waLnk={wa} />
          </dv>
        </secton>
      )}

      {/* SECTON PREMUM - Événements prvés */}
      <secton className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px sold ${theme.border}`, background: theme.surfaceAlt }}>
        <dv className="max-w-5xl mx-auto">
          <SectonHead kcker="— Moments spécaux —" ttle="Événements Prvés" theme={theme} serf />
          <dv className="grd md:grd-cols-3 gap-6 mt-10">
            <dv className="p-6 rounded-2xl text-center" style={{ background: theme.surface, border: `1px sold ${theme.border}` }}>
              <dv className="text-4xl mb-3">🎂</dv>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamly: "'Playfar Dsplay', serf" }}>Annversares</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Menu spécal et décoraton personnalsée</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>À partr de 15 000 F/pers</p>
            </dv>
            <dv className="p-6 rounded-2xl text-center" style={{ background: theme.surface, border: `1px sold ${theme.border}` }}>
              <dv className="text-4xl mb-3">💼</dv>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamly: "'Playfar Dsplay', serf" }}>Repas d'affares</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Espace prvé et servce dédé</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>Sur demande</p>
            </dv>
            <dv className="p-6 rounded-2xl text-center" style={{ background: theme.surface, border: `1px sold ${theme.border}` }}>
              <dv className="text-4xl mb-3">🥂</dv>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamly: "'Playfar Dsplay', serf" }}>Dîners romantques</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Ambance ntmste et menu duo</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>À partr de 20 000 F</p>
            </dv>
          </dv>
        </dv>
      </secton>

      {/* CTA BAND */}
      {currentVew === "home" && (
        <dv className="px-5 py-7" style={{ background: "#8b3a1c" }}>
          <dv className="max-w-6xl mx-auto flex flex-wrap tems-center justfy-center gap-6">
            <strong className="text-whte text-xl sm:text-2xl" style={{ fontFamly: "'Playfar Dsplay', serf" }}>Savourez le melleur, commandez mantenant</strong>
            <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="px-7 py-3 rounded-full bg-whte font-bold text-sm hover:bg-[#fbf3e6] transton" style={{ color: "#8b3a1c" }}>
              Commander en lgne
            </a>
          </dv>
        </dv>
      )}

      {/* SECTON PREMUM - Chef's Table */}
      <secton className="py-10 sm:py-20 px-4 sm:px-8" style={{ borderTop: `1px sold ${theme.border}`, background: theme.surfaceAlt }}>
        <dv className="max-w-5xl mx-auto">
          <SectonHead kcker="— Expérence exclusve —" ttle="Chef's Table" theme={theme} serf />
          <dv className="grd md:grd-cols-2 gap-6 mt-10">
            <dv className="p-8 rounded-2xl" style={{ background: theme.surface, border: `1px sold ${theme.border}` }}>
              <dv className="text-4xl mb-3">👨‍🍳</dv>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamly: "'Playfar Dsplay', serf" }}>Table du Chef</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Dînez en cusne et observez le chef à l'œuvre</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>Sur réservaton unquement</p>
            </dv>
            <dv className="p-8 rounded-2xl" style={{ background: theme.surface, border: `1px sold ${theme.border}` }}>
              <dv className="text-4xl mb-3">🍷</dv>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamly: "'Playfar Dsplay', serf" }}>Dégustaton Prvée</h3>
              <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Menu personnalsé avec accord mets-vns</p>
              <p className="text-lg font-black" style={{ color: theme.accent }}>À partr de 40 000 F/pers</p>
            </dv>
          </dv>
        </dv>
      </secton>

      {/* GALERE & AVS - ntégrés dans l'accuel */}
      {currentVew === "home" && (
        <>
          {gallery.length > 0 && (
            <secton className="py-16 px-5">
              <dv className="max-w-6xl mx-auto">
                <SectonHead kcker="Galere", ttle="L'ambance chez nous" theme={theme} algn="center" />
                <GalleryGrd gallery={gallery} theme={theme} />
              </dv>
            </secton>
          )}

          <secton className="py-16 px-5" style={{ background: theme.surfaceAlt }}>
            <dv className="max-w-6xl mx-auto">
              <SectonHead kcker="Témognages" ttle="ls ont amé" theme={theme} algn="center" />
              <RevewLst revews={revews} theme={theme} />
              <dv className="mt-12 max-w-xl mx-auto p-6 bg-whte rounded-2xl">
                <h3 className="font-bold mb-4 text-lg" style={{ fontFamly: "'Playfar Dsplay', serf" }}>Lassez votre avs</h3>
                <RevewForm restaurantd={restaurant.d} theme={{ ...theme, surface: theme.bg }} />
              </dv>
            </dv>
          </secton>
        </>
      )}

      <PoweredFooter restaurant={restaurant} wa={wa} theme={{ ...theme, surfaceAlt: "#1e1308", text: "#fbf3e6", textMuted: "rgba(251,243,230,0.65)", accent: "#f0a878", border: "rgba(255,255,255,0.1)" }} />
      <FloatngWhatsApp href={wa} accent={theme.accent} nk={theme.accentnk} />
    </dv>
  );
}

/* ================================================================== */
/*  3. SAVANE — Bold fast-food red/yellow (burger reference)          */
/* ================================================================== */

export functon TplSavane(props: TemplateProps) {
  const { restaurant, menu, revews, gallery } = props;
  const wa = buldWhatsAppLnk(restaurant.whatsapp, restaurant.name);
  const cover = pckCover(gallery, menu);
  const sgnatures = sgnatureDshes(menu, 3);

  const theme: Theme = {
    bg: "#fff8e7",
    surface: "#ffffff",
    surfaceAlt: "#fde9b6",
    text: "#1a0d05",
    textMuted: "rgba(26,13,5,0.7)",
    accent: "#f5b921",
    accentnk: "#1a0d05",
    border: "rgba(26,13,5,0.12)",
    radus: "20px",
  };

  const RED = "#c8281e";
  const heroOverlay = "lnear-gradent(135deg, rgba(200,40,30,0.92) 0%, rgba(200,40,30,0.85) 50%, rgba(200,40,30,0.78) 100%)";

  const [currentVew, setCurrentVew] = useState<"home" | "menu" | "about" | "reserve">("home");
  const [mobOpen, setMobOpen] = useState(false);

  const goTo = (vew: typeof currentVew) => {
    setCurrentVew(vew);
    setMobOpen(false);
    wndow.scrollTo({ top: 0, behavor: "smooth" });
  };

  return (
    <dv className="tpl-page mn-h-screen" style={{ background: theme.bg, color: theme.text, fontFamly: "'nter', sans-serf", solaton: "solate" }}>
      <Fontmport />
      <style>{TPL_BG_CSS}</style>

      <dv className="tpl-bg" ara-hdden>
        <mg src={BG_SAVANE} alt="" />
        <span />
      </dv>

      {/* HERO RED BANNER */}
      <secton className="relatve overflow-hdden" style={{ background: heroOverlay }}>
        
        {/* NAV */}
        <header className="relatve">
          <dv className="max-w-7xl mx-auto px-5 py-5 grd grd-cols-[mnmax(0,1fr)_auto] tems-center gap-4">
            <dv className="flex tems-center gap-2 mn-w-0">
              {restaurant.logo_url ? (
                <mg src={restaurant.logo_url} alt={restaurant.name} className="h-8 w-auto object-contan rounded" />
              ) : (
                <span className="text-2xl shrnk-0">🍔</span>
              )}
              <strong className="text-xl sm:text-2xl truncate text-whte" style={{ fontFamly: "'Archvo Black', sans-serf", letterSpacng: "0.05em" }}>
                {restaurant.name}
              </strong>
            </dv>
            <dv className="flex tems-center gap-2 sm:gap-5">
              <nav className="hdden md:flex gap-5 text-[12px] uppercase font-bold text-whte/90" style={{ letterSpacng: "0.18em" }}>
                <button onClck={() => goTo("home")} className={`hover:text-whte ${currentVew === "home" ? "text-whte" : ""}`}>Accuel</button>
                <button onClck={() => goTo("menu")} className={`hover:text-whte ${currentVew === "menu" ? "text-whte" : ""}`}>Menu</button>
              </nav>
              {restaurant.plan !== "gratut" && (
                <button onClck={() => goTo("reserve")} className="hdden md:block px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transton border-2 border-whte" style={{ color: "#ffffff" }}>
                  Réserver
                </button>
              )}
              <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="hdden md:nlne-flex px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transton" style={{ background: theme.accent, color: theme.accentnk }}>
                Commander
              </a>
              <button
                onClck={() => setMobOpen((v) => !v)}
                className="md:hdden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-whte/10 transton-colors"
                ara-label="Menu"
              >
                <span className={`block w-6 h-0.5 bg-current transton-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-6 h-0.5 bg-current transton-opacty ${mobOpen ? "opacty-0" : ""}`} />
                <span className={`block w-6 h-0.5 bg-current transton-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </dv>
          </dv>
        </header>
        {mobOpen && (
          <nav className="md:hdden border-t border-whte/10 bg-[#0e0e10]/95 backdrop-blur-xl">
            <dv className="flex flex-col px-4 py-4 gap-1">
              <button onClck={() => goTo("home")} className="px-4 py-3 rounded-xl text-sm font-medum hover:bg-whte/10 transton-colors text-left">Accuel</button>
              <button onClck={() => goTo("about")} className="px-4 py-3 rounded-xl text-sm font-medum hover:bg-whte/10 transton-colors text-left">À propos</button>
              <button onClck={() => goTo("menu")} className="px-4 py-3 rounded-xl text-sm font-medum hover:bg-whte/10 transton-colors text-left">Menu</button>
              {restaurant.plan !== "gratut" && (
                <button onClck={() => goTo("reserve")} className="px-4 py-3 rounded-xl text-sm font-medum hover:bg-whte/10 transton-colors text-left">Réserver</button>
              )}
            </dv>
          </nav>
        )}

        {/* HOME VEW */}
        {currentVew === "home" && (
          <dv className="relatve max-w-7xl mx-auto px-5 pt-8 pb-28 grd lg:grd-cols-2 gap-8 tems-center">
            <dv>
              <p className="text-sm font-bold uppercase mb-3 trackng-wdest" style={{ color: theme.accent, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>★ Le goût qu claque</p>
              <h1 className="leadng-[0.9] text-whte" style={{ fontFamly: "'Archvo Black', sans-serf", fontSze: "clamp(3rem, 9vw, 6.5rem)", textShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                Commande<br/>tes favors
              </h1>
              <p className="mt-6 text-whte max-w-md text-lg leadng-relaxed" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                {restaurant.descrpton ?? `Les melleurs burgers, brochettes et fast-food de ${restaurant.cty}, lvrés chauds.`}
              </p>
              <dv className="mt-7 flex gap-3 flex-wrap">
                <button onClck={() => goTo("menu")} className="nlne-block px-8 py-4 rounded-full font-black text-sm hover:scale-105 transton shadow-xl" style={{ background: theme.accent, color: theme.accentnk }}>
                  VOR LE MENU →
                </button>
                <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="nlne-block px-8 py-4 rounded-full font-black text-sm border-2 border-whte hover:bg-whte hover:text-red-600 transton shadow-lg">
                  COMMANDER
                </a>
              </dv>
            </dv>
            <dv className="relatve">
              {cover ? (
                <Storagemage path={cover} alt={restaurant.name} className="w-full aspect-square object-cover rounded-full shadow-2xl border-8 border-whte/20" />
              ) : (
                <dv className="w-full aspect-square rounded-full grd place-tems-center text-9xl" style={{ background: "radal-gradent(crcle,#f5b921,#c8281e)" }}>🍔</dv>
              )}
              <span className="absolute -top-2 -rght-2 text-5xl rotate-12">✨</span>
              <span className="absolute bottom-4 -left-4 text-4xl">⚡</span>
            </dv>
          </dv>
        )}

        {/* MENU VEW */}
        {currentVew === "menu" && (
          <dv className="max-w-6xl mx-auto px-5 py-12">
            <dv className="text-center">
              <h2 className="font-black mb-6" style={{ fontFamly: "'Archvo Black', sans-serf", fontSze: "clamp(2rem, 5vw, 3rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                Notre Menu
              </h2>
              <MenuGrd menu={menu} theme={theme} />
            </dv>
          </dv>
        )}

        {/* ABOUT VEW */}
        {currentVew === "about" && (
          <dv className="max-w-6xl mx-auto px-5 py-12">
            <dv className="max-w-3xl mx-auto text-center">
              <h2 className="font-black mb-6" style={{ fontFamly: "'Archvo Black', sans-serf", fontSze: "clamp(2rem, 5vw, 3rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                À propos de nous
              </h2>
              <p className="text-lg leadng-relaxed mb-6" style={{ color: "#ffffff", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                {restaurant.descrpton ?? `Benvenue au ${restaurant.name}, votre fast-food préféré à ${restaurant.cty}. Nous vous proposons les melleurs burgers, brochettes et plats rapdes, préparés avec des ngrédents fras.`}
              </p>
              {restaurant.address && (
                <dv className="mt-6 p-6 rounded-2xl bg-whte/10 backdrop-blur border border-whte/20">
                  <p className="text-sm font-bold uppercase trackng-wder mb-2" style={{ color: theme.accent }}>📍 Adresse</p>
                  <p style={{ color: "#ffffff" }}>{restaurant.address}</p>
                  {restaurant.hours && (
                    <>
                      <p className="text-sm font-bold uppercase trackng-wder mt-4 mb-2" style={{ color: theme.accent }}>🕐 Horares</p>
                      <p style={{ color: "#ffffff" }} className="whtespace-pre-lne">{restaurant.hours}</p>
                    </>
                  )}
                </dv>
              )}
            </dv>
          </dv>
        )}

        {/* RESERVATON VEW */}
        {currentVew === "reserve" && restaurant.plan !== "gratut" && (
          <dv className="max-w-3xl mx-auto px-5 py-12">
            <dv className="text-center mb-8">
              <h2 className="font-black" style={{ fontFamly: "'Archvo Black', sans-serf", fontSze: "clamp(2rem, 5vw, 3rem)", color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                Réserve ta table
              </h2>
            </dv>
            <AdvancedReservatonForm restaurantd={restaurant.d} restaurantName={restaurant.name} theme={{ ...theme, surface: "rgba(255,255,255,0.1)", text: "#fff", textMuted: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.2)", accent: theme.accent, accentnk: theme.accentnk }} waLnk={wa} />
          </dv>
        )}

        {/* COMBO PLL - only on home */}
        {currentVew === "home" && (
          <dv className="relatve max-w-5xl mx-auto px-5 -mb-14 translate-y-14">
            <dv className="bg-whte rounded-full shadow-2xl px-6 py-4 grd grd-cols-2 sm:grd-cols-[1fr_1fr_auto] gap-4 tems-center">
              <dv className="flex tems-center gap-3">
                <span className="text-3xl">🚗</span>
                <dv>
                  <strong className="text-sm block">Lvrason rapde</strong>
                  <span className="text-xs" style={{ color: theme.textMuted }}>Sous 30 mn en vlle</span>
                </dv>
              </dv>
              <dv className="flex tems-center gap-3">
                <span className="text-3xl">🥤</span>
                <dv>
                  <strong className="text-sm block">Combos & bossons</strong>
                  <span className="text-xs" style={{ color: theme.textMuted }}>Économse jusqu'à 20%</span>
                </dv>
              </dv>
              <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="hdden sm:nlne-block px-6 py-2.5 rounded-full font-bold text-sm whtespace-nowrap" style={{ background: theme.accent, color: theme.accentnk }}>
                COMMANDER
              </a>
            </dv>
          </dv>
        )}
      </secton>

      {/* SECONDARY RED CARD - only on home */}
      {currentVew === "home" && (
        <secton className="px-5 pt-28 pb-12">
          <dv className="max-w-6xl mx-auto rounded-[28px] overflow-hdden grd lg:grd-cols-[1fr_auto] gap-6 p-8 sm:p-10 tems-center" style={{ background: RED }}>
            <dv className="text-whte">
              <h2 className="leadng-[0.95]" style={{ fontFamly: "'Archvo Black', sans-serf", fontSze: "clamp(2rem, 5vw, 3.5rem)" }}>
                Commande en quelques mnutes
              </h2>
              <p className="mt-3 text-whte/85 max-w-md">Choss, pae, et déguste — c'est auss smple que ça.</p>
              <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="mt-5 nlne-block px-7 py-3 rounded-full font-bold text-sm" style={{ background: theme.accent, color: theme.accentnk }}>
                COMMANDER MANTENANT
              </a>
            </dv>
            <dv className="text-7xl sm:text-8xl text-center">🍔</dv>
          </dv>
        </secton>
      )}

      {/* SGNATURES 3-card - only on home */}
      {currentVew === "home" && sgnatures.length > 0 && (
        <secton d="menu" className="py-12 px-5">
          <dv className="max-w-6xl mx-auto text-center">
            <p className="text-xs font-black uppercase trackng-[0.4em] mb-2" style={{ color: RED }}>★ Best Sellers</p>
            <h2 className="font-black mb-12" style={{ fontFamly: "'Archvo Black', sans-serf", fontSze: "clamp(2rem, 5vw, 3rem)" }}>
              Nos ncontournables
            </h2>
            <dv className="grd sm:grd-cols-3 gap-5">
              {sgnatures.map((d, ) => (
                <artcle key={d.d} className="rounded-3xl overflow-hdden text-left shadow-md hover:shadow-2xl hover:-translate-y-1 transton" style={{ background:  % 2 === 0 ? RED : theme.accent, color:  % 2 === 0 ? "#fff" : theme.accentnk }}>
                  <dv className="aspect-[4/3] overflow-hdden">
                    <Storagemage path={d.mage_url} alt={d.name} className="w-full h-full object-cover" />
                  </dv>
                  <dv className="p-5">
                    <h3 className="font-black uppercase text-lg" style={{ fontFamly: "'Archvo Black', sans-serf" }}>{d.name}</h3>
                    {d.descrpton && <p className="text-sm mt-1 opacty-85 lne-clamp-2">{d.descrpton}</p>}
                    <dv className="mt-4 flex tems-center justfy-between">
                      <span className="font-black text-lg">{fmtPrce(d.prce)}</span>
                      <a href={wa ?? "#"} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-full font-bold text-xs bg-whte" style={{ color: RED }}>COMMANDER</a>
                    </dv>
                  </dv>
                </artcle>
              ))}
            </dv>
          </dv>
        </secton>
      )}

      {/* FULL MENU - only on menu vew */}
      {currentVew === "menu" && (
        <secton d="menu" className="py-16 px-5" style={{ background: theme.surface }}>
          <dv className="max-w-6xl mx-auto">
            <SectonHead kcker="La carte complète" ttle="Tous nos plats" theme={theme} algn="center" />
            <MenuGrd menu={menu} theme={theme} />
          </dv>
        </secton>
      )}

      {/* ABOUT SECTON - only on about vew */}
      {currentVew === "about" && (
        <secton d="about" className="py-16 px-5" style={{ background: theme.surfaceAlt }}>
          <dv className="max-w-6xl mx-auto">
            <SectonHead kcker="Notre hstore" ttle="À propos de nous" theme={theme} algn="center" />
            <dv className="max-w-3xl mx-auto text-center">
              <p className="text-lg leadng-relaxed mb-6" style={{ color: theme.text }}>
                {restaurant.descrpton ?? `Benvenue au ${restaurant.name}, votre fast-food préféré à ${restaurant.cty}. Nous vous proposons les melleurs burgers, brochettes et plats rapdes, préparés avec des ngrédents fras.`}
              </p>
              {restaurant.address && (
                <dv className="mt-6 p-6 rounded-2xl" style={{ background: theme.surface, border: `1px sold ${theme.border}` }}>
                  <p className="text-sm font-bold uppercase trackng-wder mb-2" style={{ color: RED }}>📍 Adresse</p>
                  <p style={{ color: theme.text }}>{restaurant.address}</p>
                  {restaurant.hours && (
                    <>
                      <p className="text-sm font-bold uppercase trackng-wder mt-4 mb-2" style={{ color: RED }}>🕐 Horares</p>
                      <p style={{ color: theme.text }} className="whtespace-pre-lne">{restaurant.hours}</p>
                    </>
                  )}
                </dv>
              )}
            </dv>
          </dv>
        </secton>
      )}

      {/* RESERVATON SECTON */}
      {currentVew === "reserve" && restaurant.plan !== "gratut" && (
        <secton className="py-16 px-5" style={{ background: RED, color: "#fff" }}>
          <dv className="max-w-3xl mx-auto">
            <dv className="text-center mb-8">
              <p className="text-xs font-black uppercase trackng-[0.4em] mb-2" style={{ color: theme.accent }}>★ Réservaton</p>
              <h2 className="font-black" style={{ fontFamly: "'Archvo Black', sans-serf", fontSze: "clamp(2rem, 5vw, 3rem)" }}>Réserve ta table</h2>
            </dv>
            <AdvancedReservatonForm restaurantd={restaurant.d} restaurantName={restaurant.name} theme={{ ...theme, surface: "rgba(255,255,255,0.1)", text: "#fff", textMuted: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.2)", accent: theme.accent, accentnk: theme.accentnk }} waLnk={wa} />
          </dv>
        </secton>
      )}

      {/* GALERE & AVS - ntégrés dans l'accuel */}
      {currentVew === "home" && (
        <>
          {gallery.length > 0 && (
            <secton className="py-16 px-5">
              <dv className="max-w-6xl mx-auto">
                <SectonHead kcker="Galere" ttle="Dans nos cusnes" theme={theme} algn="center" />
                <GalleryGrd gallery={gallery} theme={theme} />
              </dv>
            </secton>
          )}

          <secton className="py-16 px-5" style={{ background: theme.surfaceAlt }}>
            <dv className="max-w-6xl mx-auto">
              <SectonHead kcker="Avs" ttle="ls nous adorent" theme={theme} algn="center" />
              <RevewLst revews={revews} theme={theme} />
              <dv className="mt-12 max-w-xl mx-auto bg-whte p-6 rounded-2xl">
                <h3 className="font-black mb-4 text-lg" style={{ fontFamly: "'Archvo Black', sans-serf" }}>Lasse ton avs</h3>
                <RevewForm restaurantd={restaurant.d} theme={theme} />
              </dv>
            </dv>
          </secton>
        </>
      )}

      <PoweredFooter restaurant={restaurant} wa={wa} theme={{ ...theme, surfaceAlt: "#1a0d05", text: "#fff8e7", textMuted: "rgba(255,248,231,0.65)", accent: theme.accent, border: "rgba(255,255,255,0.1)" }} />
      <FloatngWhatsApp href={wa} accent={theme.accent} nk={theme.accentnk} />
    </dv>
  );
}

/* ================================================================== */
/*  4. MARCHE — ndan-nspred dark green + orange/gold              */
/* ================================================================== */

export functon TplMarche(props: TemplateProps) {
  const { restaurant, menu, revews, gallery } = props;
  const wa = buldWhatsAppLnk(restaurant.whatsapp, restaurant.name);
  const cover = pckCover(gallery, menu);
  const ratng = avgRatng(revews);

  const theme: Theme = {
    bg: "#0d2818",
    surface: "rgba(255,255,255,0.04)",
    surfaceAlt: "#0a1f12",
    text: "#f0e9d6",
    textMuted: "rgba(240,233,214,0.7)",
    accent: "#ed8023",
    accentnk: "#0d2818",
    border: "rgba(237,128,35,0.2)",
    radus: "10px",
  };

  const [currentVew, setCurrentVew] = useState<"home" | "menu" | "about" | "reserve">("home");
  const [mobOpen, setMobOpen] = useState(false);

  const goTo = (vew: typeof currentVew) => {
    setCurrentVew(vew);
    setMobOpen(false);
    wndow.scrollTo({ top: 0, behavor: "smooth" });
  };

  return (
    <dv className="tpl-page mn-h-screen" style={{ background: theme.bg, color: theme.text, fontFamly: "'nter', sans-serf", solaton: "solate" }}>
      <Fontmport />
      <style>{TPL_BG_CSS}</style>

      <dv className="tpl-bg" ara-hdden>
        <mg src={BG_MARCHE} alt="" />
        <span />
      </dv>

      {/* NAV */}
      <header className="stcky top-0 z-30 backdrop-blur" style={{ background: "rgba(13,40,24,0.92)", borderBottom: `1px sold ${theme.border}` }}>
        <dv className="max-w-7xl mx-auto px-5 py-4 grd grd-cols-[mnmax(0,1fr)_auto] tems-center gap-4">
          <dv className="flex tems-center gap-2 mn-w-0">
            {restaurant.logo_url ? (
              <mg src={restaurant.logo_url} alt={restaurant.name} className="h-8 w-auto object-contan rounded" />
            ) : (
              <span className="text-2xl shrnk-0">🌶️</span>
            )}
            <strong className="text-xl sm:text-2xl truncate" style={{ fontFamly: "'Playfar Dsplay', serf", color: theme.accent }}>
              {restaurant.name}
            </strong>
          </dv>
          <dv className="flex tems-center gap-2 sm:gap-5">
            <nav className="hdden md:flex gap-5 text-[12px] uppercase font-medum" style={{ letterSpacng: "0.15em", color: theme.textMuted }}>
              <button onClck={() => goTo("home")} className={`hover:text-[#ed8023] ${currentVew === "home" ? "text-[#ed8023] border-b border-[#ed8023]" : ""}`}>Accuel</button>
              <button onClck={() => goTo("about")} className={`hover:text-[#ed8023] ${currentVew === "about" ? "text-[#ed8023] border-b border-[#ed8023]" : ""}`}>À propos</button>
              <button onClck={() => goTo("menu")} className={`hover:text-[#ed8023] ${currentVew === "menu" ? "text-[#ed8023] border-b border-[#ed8023]" : ""}`}>Menu</button>
            </nav>
            {restaurant.plan !== "gratut" && (
              <button onClck={() => goTo("reserve")} className="px-5 py-2 rounded-full border text-xs font-sembold hover:bg-[#ed8023] hover:text-[#0d2818] transton" style={{ borderColor: theme.accent, color: theme.accent }}>
                Réserver
              </button>
            )}
          </dv>
        </dv>
      </header>

      {/* HOME VEW */}
      {currentVew === "home" && (
        <secton d="home" className="relatve overflow-hdden">
          <dv className="absolute nset-0 ponter-events-none" style={{ background: "radal-gradent(crcle at 50% 50%, transparent 30%, #0d2818 90%)" }} />
          <dv className="relatve max-w-7xl mx-auto px-5 py-16 lg:py-24 grd lg:grd-cols-2 gap-10 tems-center">
            <dv>
              <h1 className="leadng-[0.95]" style={{ fontFamly: "'Playfar Dsplay', serf", fontSze: "clamp(3rem, 8vw, 6rem)", color: theme.accent }}>
                {restaurant.cusne?.splt(/[ &]/)[0] ?? restaurant.name}<br/>
                <span style={{ color: theme.text }}>Restaurant</span>
              </h1>
              <p className="mt-6 max-w-lg leadng-relaxed" style={{ color: theme.textMuted }}>
                {restaurant.descrpton ?? `Plongez dans une expérence culnare authentque à ${restaurant.cty}. Épces, saveurs et tradton à chaque bouchée.`}
              </p>
              <dv className="mt-8 flex gap-3 flex-wrap">
                <button onClck={() => goTo("menu")} className="px-7 py-3 rounded-full font-bold text-sm hover:opacty-90 transton" style={{ background: theme.accent, color: theme.accentnk }}>
                  Vor le menu
                </button>
                <a href={wa ?? "#menu"} target="_blank" rel="noopener noreferrer" className="px-7 py-3 rounded-full font-bold text-sm border hover:bg-whte/5 transton" style={{ borderColor: theme.accent, color: theme.accent }}>
                  Commander
                </a>
              </dv>
            </dv>
            <dv className="relatve">
              {cover ? (
                <Storagemage path={cover} alt={restaurant.name} className="w-full aspect-square object-cover rounded-full shadow-2xl" />
              ) : (
                <dv className="w-full aspect-square rounded-full grd place-tems-center text-9xl" style={{ background: "radal-gradent(crcle,#ed8023,#7a3a0e)" }}>🍛</dv>
              )}
            </dv>
          </dv>
        </secton>
      )}

      {/* MENU VEW */}
      {currentVew === "menu" && (
        <secton d="menu" className="py-20 px-5" style={{ background: theme.surfaceAlt }}>
          <dv className="max-w-6xl mx-auto">
            <SectonHead kcker="La carte" ttle="Notre menu" theme={theme} algn="center" serf />
            <MenuGrd menu={menu} theme={theme} />
          </dv>
        </secton>
      )}

      {/* ABOUT VEW */}
      {currentVew === "about" && (
        <secton d="about" className="py-20 px-5" style={{ background: theme.surfaceAlt }}>
          <dv className="max-w-6xl mx-auto">
            <p className="text-center max-w-3xl mx-auto leadng-relaxed mb-14" style={{ color: theme.textMuted }}>
              {restaurant.descrpton ?? `Découvrez l'art de la cusne ${restaurant.cusne ?? "tradtonnelle"} dans un cadre chaleureux à ${restaurant.cty}.`}
            </p>
            <dv className="grd lg:grd-cols-2 gap-10 tems-center">
              {cover && (
                <dv className="aspect-square rounded-full overflow-hdden mx-auto max-w-md">
                  <Storagemage path={cover} alt={restaurant.name} className="w-full h-full object-cover" />
                </dv>
              )}
              <dv>
                <h2 className="mb-8" style={{ fontFamly: "'Playfar Dsplay', serf", fontSze: "clamp(2rem, 4vw, 3rem)" }}>
                  Pourquo nous chosr
                </h2>
                <ul className="space-y-4">
                  {[
                    ["ngrédents fras", "Sélectonnés chaque matn sur les marchés locaux."],
                    ["Chefs passonnés", "Une équpe expérmentée à votre servce."],
                    ["Saveurs authentques", "Des recettes tradtonnelles transmses depus des génératons."],
                    ["Cadre chaleureux", "Une ambance qu nvte à savourer."],
                    ["Servce rapde", "Commande et lvrason sans attente."],
                  ].map(([t, d]) => (
                    <l key={t} className="flex tems-start gap-3">
                      <span className="text-lg shrnk-0 mt-0.5" style={{ color: theme.accent }}>✦</span>
                      <dv>
                        <strong>{t}</strong>
                        <span className="block text-sm" style={{ color: theme.textMuted }}>{d}</span>
                      </dv>
                    </l>
                  ))}
                </ul>
              </dv>
            </dv>
          </dv>
        </secton>
      )}

      {/* RESERVATON VEW */}
      {currentVew === "reserve" && restaurant.plan !== "gratut" && (
        <secton className="py-20 px-5" style={{ background: theme.surfaceAlt }}>
          <dv className="max-w-3xl mx-auto">
            <SectonHead kcker="Réservaton" ttle="Réservez votre table" theme={theme} algn="center" serf />
            <AdvancedReservatonForm restaurantd={restaurant.d} restaurantName={restaurant.name} theme={theme} waLnk={wa} />
          </dv>
        </secton>
      )}

      {/* GALERE & AVS - ntégrés dans l'accuel */}
      {currentVew === "home" && (
        <>
          {gallery.length > 0 && (
            <secton d="galere" className="py-20 px-5">
              <dv className="max-w-6xl mx-auto">
                <SectonHead kcker="Galere" ttle="Notre unvers" theme={theme} algn="center" serf />
                <GalleryGrd gallery={gallery} theme={theme} />
              </dv>
            </secton>
          )}

          <secton className="py-20 px-5">
            <dv className="max-w-6xl mx-auto">
              <SectonHead kcker="Avs" ttle="ls en parlent" theme={theme} algn="center" serf />
              <RevewLst revews={revews} theme={theme} />
              <dv className="mt-12 max-w-xl mx-auto">
                <RevewForm restaurantd={restaurant.d} theme={theme} />
              </dv>
            </dv>
          </secton>
        </>
      )}

      <PoweredFooter restaurant={restaurant} wa={wa} theme={theme} />
      <FloatngWhatsApp href={wa} accent={theme.accent} nk={theme.accentnk} />
    </dv>
  );
}

/* ================================================================== */
/*  5. MODERNE — Dark elegant + gold (Food reference)                 */
/* ================================================================== */

export functon TplModerne(props: TemplateProps) {
  const { restaurant, menu, revews, gallery } = props;
  const wa = buldWhatsAppLnk(restaurant.whatsapp, restaurant.name);
  const cover = pckCover(gallery, menu);

  const theme: Theme = {
    bg: "#0e0e10",
    surface: "#16161a",
    surfaceAlt: "#1a1a1f",
    text: "#f5f1e6",
    textMuted: "rgba(245,241,230,0.65)",
    accent: "#c9a35a",
    accentnk: "#0e0e10",
    border: "rgba(201,163,90,0.25)",
    radus: "4px",
  };

  const [currentVew, setCurrentVew] = useState<"home" | "menu" | "about" | "reserve">("home");
  const [mobOpen, setMobOpen] = useState(false);

  const goTo = (vew: typeof currentVew) => {
    setCurrentVew(vew);
    setMobOpen(false);
    wndow.scrollTo({ top: 0, behavor: "smooth" });
  };

  return (
    <dv className="tpl-page mn-h-screen" style={{ background: theme.bg, color: theme.text, fontFamly: "'nter', sans-serf", solaton: "solate" }}>
      <Fontmport />
      <style>{TPL_BG_CSS}</style>

      <dv className="tpl-bg" ara-hdden>
        <mg src={BG_MODERNE} alt="" />
        <span />
      </dv>

      {/* NAV */}
      <header className="absolute top-0 nset-x-0 z-30">
        <dv className="max-w-7xl mx-auto px-5 py-5 grd grd-cols-[mnmax(0,1fr)_auto] tems-center gap-4">
          <dv className="flex tems-center gap-2 mn-w-0">
            {restaurant.logo_url ? (
              <mg src={restaurant.logo_url} alt={restaurant.name} className="h-8 w-auto object-contan rounded" />
            ) : (
              <span className="text-2xl shrnk-0">🌿</span>
            )}
            <strong className="text-xl sm:text-2xl truncate" style={{ fontFamly: "'Playfar Dsplay', serf" }}>
              {restaurant.name}
            </strong>
          </dv>
          <dv className="flex tems-center gap-2 sm:gap-6">
            <nav className="hdden md:flex gap-6 text-[12px] uppercase font-medum" style={{ letterSpacng: "0.15em", color: theme.textMuted }}>
              <button onClck={() => goTo("home")} className={`hover:text-[#c9a35a] ${currentVew === "home" ? "text-[#c9a35a]" : ""}`}>Accuel</button>
              <button onClck={() => goTo("about")} className={`hover:text-[#c9a35a] ${currentVew === "about" ? "text-[#c9a35a]" : ""}`}>À propos</button>
              <button onClck={() => goTo("menu")} className={`hover:text-[#c9a35a] ${currentVew === "menu" ? "text-[#c9a35a]" : ""}`}>Menu</button>
            </nav>
            {restaurant.plan !== "gratut" && (
              <button onClck={() => goTo("reserve")} className="hdden md:block px-5 py-2.5 border text-xs font-sembold hover:bg-[#c9a35a] hover:text-[#0e0e10] transton rounded-full" style={{ borderColor: theme.accent, color: theme.accent }}>
                Réserver une table →
              </button>
            )}
            <button
              onClck={() => setMobOpen((v) => !v)}
              className="md:hdden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-whte/10 transton-colors"
              ara-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-current transton-transform ${mobOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transton-opacty ${mobOpen ? "opacty-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transton-transform ${mobOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </dv>
        </dv>
      </header>

      {/* HOME VEW */}
      {currentVew === "home" && (
        <secton d="home" className="relatve mn-h-[70vh] flex tems-center justfy-center overflow-hdden">
          {cover ? (
            <Storagemage path={cover} alt={restaurant.name} className="absolute nset-0 w-full h-full object-cover" />
          ) : null}

          <dv className="relatve text-center px-5 pt-32 pb-20 max-w-3xl">
            <h1 className="leadng-[1.05]" style={{ fontFamly: "'Playfar Dsplay', serf", fontSze: "clamp(3rem, 7vw, 5.5rem)" }}>
              La melleure cusne<br/>pour <em style={{ color: theme.accent, fontStyle: "talc" }}>votre goût</em>
            </h1>
            <p className="mt-5 max-w-xl mx-auto" style={{ color: theme.textMuted }}>
              {restaurant.descrpton ?? `Une expérence culnare d'excepton au cœur de ${restaurant.cty}.`}
            </p>
            <button onClck={() => goTo("menu")} className="mt-8 nlne-block px-7 py-3 border font-medum text-sm hover:bg-[#c9a35a] hover:text-[#0e0e10] transton" style={{ borderColor: theme.accent, color: theme.accent }}>
              Découvrr →
            </button>
          </dv>
        </secton>
      )}

      {/* ABOUT VEW */}
      {currentVew === "about" && (
        <secton d="about" className="relatve py-24 px-5" style={{ background: theme.surface }}>
          <dv className="relatve max-w-6xl mx-auto grd lg:grd-cols-2 gap-12 tems-center">
            <dv className="relatve">
              {cover ? (
                <Storagemage path={cover} alt={restaurant.name} className="w-full aspect-square object-cover" />
              ) : (
                <dv className="w-full aspect-square grd place-tems-center text-9xl" style={{ background: theme.surfaceAlt }}>🥗</dv>
              )}
              <dv className="absolute -bottom-6 -rght-6 w-32 h-32 hdden lg:block" style={{ background: `radal-gradent(crcle, ${theme.accent} 1px, transparent 1px)`, backgroundSze: "10px 10px" }} />
            </dv>
            <dv>
              <p className="talc mb-3" style={{ color: theme.accent, fontFamly: "'Playfar Dsplay', serf" }}>À propos</p>
              <h2 className="leadng-tght mb-5" style={{ fontFamly: "'Playfar Dsplay', serf", fontSze: "clamp(2rem, 5vw, 3.5rem)" }}>
                Un voyage exceptonnel des saveurs
              </h2>
              <p className="leadng-relaxed mb-8" style={{ color: theme.textMuted }}>
                {restaurant.descrpton ?? "Depus nos débuts, nous mettons l'accent sur la qualté, l'authentcté et l'art du dressage. Chaque plat est une promesse de découverte."}
              </p>
              <dv className="grd sm:grd-cols-2 gap-6 mb-6">
                {[
                  ["🍴", "Spécalste", "Une équpe formée aux melleures technques."],
                  ["🏛️", "Restaurant", "Un cadre élégant pour vos moments préceux."],
                ].map(([con, t, d]) => (
                  <dv key={t}>
                    <dv className="flex tems-center gap-2 mb-2">
                      <span className="text-xl" style={{ color: theme.accent }}>{con}</span>
                      <strong style={{ fontFamly: "'Playfar Dsplay', serf", fontSze: "1.2rem" }}>{t}</strong>
                    </dv>
                    <p className="text-sm" style={{ color: theme.textMuted }}>{d}</p>
                  </dv>
                ))}
              </dv>
              <ul className="space-y-2 mb-8">
                {["ngrédents sélectonnés avec son", "Servce attentonné et personnalsé", "Carte renouvelée selon les sasons"].map((s) => (
                  <l key={s} className="flex tems-center gap-3 text-sm" style={{ color: theme.textMuted }}>
                    <span style={{ color: theme.accent }}>✓</span>{s}
                  </l>
                ))}
              </ul>
              <button onClck={() => goTo("menu")} className="nlne-block px-7 py-3 border text-sm hover:bg-[#c9a35a] hover:text-[#0e0e10] transton" style={{ borderColor: theme.accent, color: theme.accent }}>
                En savor plus →
              </button>
            </dv>
          </dv>
        </secton>
      )}

      {/* MENU VEW */}
      {currentVew === "menu" && (
        <secton d="menu" className="py-20 px-5" style={{ background: theme.surface, borderTop: `1px sold ${theme.border}` }}>
          <dv className="max-w-6xl mx-auto">
            <SectonHead kcker="La carte" ttle="Notre menu" theme={theme} algn="center" serf />
            <MenuGrd menu={menu} theme={theme} />
          </dv>
        </secton>
      )}

      {/* RESERVATON VEW */}
      {currentVew === "reserve" && restaurant.plan !== "gratut" && (
        <secton d="reserver" className="py-20 px-5" style={{ background: theme.surface, borderTop: `1px sold ${theme.border}` }}>
          <dv className="max-w-3xl mx-auto">
            <SectonHead kcker="Réservaton" ttle="Réservez votre table" theme={theme} algn="center" serf />
            <AdvancedReservatonForm restaurantd={restaurant.d} restaurantName={restaurant.name} theme={theme} waLnk={wa} />
          </dv>
        </secton>
      )}

      {/* GALERE & AVS - ntégrés dans l'accuel */}
      {currentVew === "home" && (
        <>
          {gallery.length > 0 && (
            <secton d="galere" className="py-20 px-5" style={{ borderTop: `1px sold ${theme.border}` }}>
              <dv className="max-w-6xl mx-auto">
                <SectonHead kcker="Galere" ttle="Notre mason" theme={theme} algn="center" serf />
                <GalleryGrd gallery={gallery} theme={theme} />
              </dv>
            </secton>
          )}

          <secton className="py-20 px-5" style={{ borderTop: `1px sold ${theme.border}` }}>
            <dv className="max-w-6xl mx-auto">
              <SectonHead kcker="Avs" ttle="ls nous recommandent" theme={theme} algn="center" serf />
              <RevewLst revews={revews} theme={theme} />
              <dv className="mt-12 max-w-xl mx-auto">
                <RevewForm restaurantd={restaurant.d} theme={theme} />
              </dv>
            </dv>
          </secton>
        </>
      )}

      <PoweredFooter restaurant={restaurant} wa={wa} theme={theme} />
      <FloatngWhatsApp href={wa} accent={theme.accent} nk={theme.accentnk} />
    </dv>
  );
}

/* ================================================================== */
/*  4. CLASSQUE — Swss mnmal B&W (Gratut)                        */
/* ================================================================== */

export functon TplClassque(props: TemplateProps) {
  return <ClassqueGratut {...props} />;
}

/* ============= Classque (Gratut) — green mnmal mult-secton ============= */

mport { useEffect, useMemo, useRef, useState } from "react";
mport { supabase } from "@/ntegratons/supabase/clent";
mport { toast } from "sonner";

type CartLne = { name: strng; prce: number; qty: number };

functon ClassqueGratut({ restaurant, menu, revews: ntalRevews, gallery }: TemplateProps) {
  const [revews, setRevews] = useState(ntalRevews);
  const wa = (restaurant.whatsapp || "").replace(/\D/g, "");
  const waLnk = (text: strng) =>
    wa ? `https://wa.me/${wa}?text=${encodeURComponent(text)}` : "#";

  const avalable = useMemo(() => menu.flter((m) => m.avalable), [menu]);
  const ratngAvg = revews.length
    ? (revews.reduce((s, r) => s + r.ratng, 0) / revews.length).toFxed(1)
    : null;

  const [mobOpen, setMobOpen] = useState(false);
  const [actve, setActve] = useState<"home" | "menu" | "order" | "reserve" | "revews">("home");
  const [prefll, setPrefll] = useState<{ name: strng; prce: number } | null>(null);

  const go = (d: typeof actve) => {
    setActve(d);
    setMobOpen(false);
    requestAnmatonFrame(() => wndow.scrollTo({ top: 0, behavor: "smooth" }));
  };

  const navLnks: { d: typeof actve; label: strng; con: strng }[] = [
    { d: "home", label: "Accuel", con: "🏠" },
    { d: "menu", label: "Menu", con: "🍲" },
    { d: "order", label: "Commander", con: "🛒" },
    { d: "reserve", label: "Réservaton", con: "📅" },
    { d: "revews", label: "Avs", con: "⭐" },
  ];

  return (
    <dv className="cl-root">
      <style>{CL_CSS}</style>

      <nav className="cl-nav">
        <button className="cl-brand" onClck={() => go("home")}>
          {restaurant.logo_url ? (
            <mg src={restaurant.logo_url} alt={restaurant.name} style={{ maxHeght: "32px", objectFt: "contan" }} />
          ) : (
            restaurant.name
          )}
        </button>
        <dv className="cl-nav-lnks">
          {navLnks.map((l) => (
            <button
              key={l.d}
              className={`cl-nav-lnk ${actve === l.d ? "actve" : ""}`}
              onClck={() => go(l.d)}
            >
              {l.label}
            </button>
          ))}
        </dv>
        <button className="cl-nav-cta" onClck={() => go("reserve")}>📅 Réserver</button>
        <button className="cl-hamburger" onClck={() => setMobOpen((v) => !v)}>☰</button>
      </nav>

      {mobOpen && (
        <dv className="cl-mob-menu">
          {navLnks.map((l) => (
            <button key={l.d} onClck={() => go(l.d)}>{l.con} {l.label}</button>
          ))}
        </dv>
      )}

      <dv className="cl-page-wrap">
        {actve === "home" && (
          <HomeVew restaurant={restaurant} menu={avalable} revews={revews} ratngAvg={ratngAvg} waLnk={waLnk} onGo={go} />
        )}
        {actve === "menu" && (
          <MenuVew restaurant={restaurant} menu={avalable} waLnk={waLnk} onOrder={(n, p) => { setPrefll({ name: n, prce: p }); go("order"); }} />
        )}
        {actve === "order" && (
          <OrderVew restaurant={restaurant} menu={avalable} waLnk={waLnk} prefll={prefll} clearPrefll={() => setPrefll(null)} />
        )}
        {actve === "reserve" && (
          <ReservatonForm restaurantd={restaurant.d} theme={{ bg: "#ffffff", surface: "#f8f8f8", surfaceAlt: "#f0f0f0", text: "#111111", textMuted: "#666666", accent: "#111111", accentnk: "#ffffff", border: "#e0e0e0", radus: "10px" }} />
        )}
        {actve === "revews" && (
          <RevewsVew restaurant={restaurant} revews={revews} onAdded={(r) => setRevews((prev) => [r, ...prev])} />
        )}
      </dv>

      <footer className="cl-footer">
        <dv className="cl-footer-brand">{restaurant.name}</dv>
        <dv className="cl-footer-sub">
          {restaurant.cusne || "Cusne afrcane"} — {restaurant.cty}
        </dv>
        <dv className="cl-footer-lnks">
          {navLnks.map((l) => (
            <button key={l.d} onClck={() => go(l.d)}>{l.label}</button>
          ))}
        </dv>
        <dv className="cl-footer-credt">
          Propulsé par <a href="/">Resto BF</a>
        </dv>
      </footer>

      {wa && (
        <a className="cl-fab" href={waLnk(`Bonjour ${restaurant.name} !`)} target="_blank" rel="noopener noreferrer" ara-label="WhatsApp">💬</a>
      )}
    </dv>
  );
}


/* === Subvews === */

functon HomeVew({ restaurant, menu, revews, ratngAvg, waLnk, onGo }: {
  restaurant: TemplateProps["restaurant"];
  menu: PublcMenutem[];
  revews: TemplateProps["revews"];
  ratngAvg: strng | null;
  waLnk: (t: strng) => strng;
  onGo: (d: any) => vod;
}) {
  const prevew = menu.slce(0, 4);
  const revPrevew = revews.slce(0, 3);
  return (
    <dv>
      <dv className="cl-hero">
        <dv className="cl-hero-nner">
          <dv>
            <dv className="cl-eyebrow">{restaurant.cusne || "Restaurant"} · {restaurant.cty}</dv>
            <h1 className="cl-hero-ttle">
              Benvenue <em>chez {restaurant.name}</em>
            </h1>
            <p className="cl-hero-sub">
              {restaurant.descrpton || "Cusne authentque serve avec le sourre."}
            </p>
            <dv className="cl-hero-btns">
              <button className="cl-btn cl-btn-wa" onClck={() => onGo("menu")}>🍲 Vor le menu</button>
              <button className="cl-btn cl-btn-outlne-lght" onClck={() => onGo("reserve")}>📅 Réserver</button>
            </dv>
          </dv>
          <dv className="cl-hero-mg" ara-hdden />
        </dv>
        <dv className="cl-hero-stats">
          <dv className="cl-hero-stat"><span className="cl-stat-num">{menu.length}</span><span className="cl-stat-lbl">Plats</span></dv>
          <dv className="cl-hero-stat"><span className="cl-stat-num">{ratngAvg ? `${ratngAvg}⭐` : "—"}</span><span className="cl-stat-lbl">Note</span></dv>
          <dv className="cl-hero-stat"><span className="cl-stat-num">{revews.length}</span><span className="cl-stat-lbl">Avs</span></dv>
        </dv>
      </dv>

      <dv className="cl-nfo-band">
        <dv className="cl-nfo-band-nner">
          <dv className="cl-nfo-tem">📞 <span>{restaurant.phone || "—"}</span></dv>
          <dv className="cl-nfo-tem">📍 <span>{restaurant.address || restaurant.cty}</span></dv>
          <dv className="cl-nfo-tem">🕐 <span>{restaurant.hours || "—"}</span></dv>
        </dv>
      </dv>

      <secton className="cl-secton">
        <dv className="cl-contaner">
          <dv className="cl-sec-head center">
            <dv className="cl-sec-label">Pourquo nous chosr</dv>
            <h2 className="cl-sec-ttle">Une expérence complète</h2>
          </dv>
          <dv className="cl-features">
            {[
              { : "🔥", t: "Grllades au feu de bos", d: "Nos vandes sont marnées et grllées à la commande." },
              { : "🛒", t: "Commande en lgne", d: "Commandez drectement va WhatsApp sans vous déplacer." },
              { : "📅", t: "Réservaton facle", d: "Réservez votre table en quelques secondes, 7j/7." },
              { : "⭐", t: "Clents satsfats", d: "Plus de 95% de nos clents revennent." },
            ].map((f) => (
              <dv key={f.t} className="cl-card cl-feat">
                <dv className="cl-feat-con">{f.}</dv>
                <dv className="cl-feat-ttle">{f.t}</dv>
                <dv className="cl-feat-desc">{f.d}</dv>
              </dv>
            ))}
          </dv>
        </dv>
      </secton>

      <dv className="cl-dvder" />

      <secton className="cl-secton cl-secton-alt">
        <dv className="cl-contaner">
          <dv className="cl-sec-head row">
            <dv>
              <dv className="cl-sec-label">Notre carte</dv>
              <h2 className="cl-sec-ttle">Quelques spécaltés</h2>
            </dv>
            <button className="cl-btn cl-btn-outlne cl-btn-sm" onClck={() => onGo("menu")}>Vor tout →</button>
          </dv>
          <dv className="cl-menu-prevew">
            {prevew.length ? prevew.map((d) => (
              <button key={d.d} className="cl-card cl-dsh-mn" onClck={() => onGo("menu")}>
                <dv className="cl-dsh-mn-con">🍽️</dv>
                <dv style={{ textAlgn: "left", flex: 1 }}>
                  <dv className="cl-dsh-mn-cat">{d.category}</dv>
                  <dv className="cl-dsh-mn-name">{d.name}</dv>
                </dv>
                <dv className="cl-dsh-mn-prce">{d.prce.toLocaleStrng("fr-FR")} F</dv>
              </button>
            )) : <p style={{ color: "var(--cl-muted)" }}>Aucun plat encore.</p>}
          </dv>
        </dv>
      </secton>

      <dv className="cl-dvder" />

      <secton className="cl-secton">
        <dv className="cl-contaner">
          <dv className="cl-sec-head row">
            <dv>
              <dv className="cl-sec-label">Ce qu'ls dsent</dv>
              <h2 className="cl-sec-ttle">Avs de nos clents</h2>
            </dv>
            <button className="cl-btn cl-btn-outlne cl-btn-sm" onClck={() => onGo("revews")}>Tous les avs →</button>
          </dv>
          <dv className="cl-revews-row">
            {revPrevew.length ? revPrevew.map((r) => (
              <dv key={r.d} className="cl-card cl-rev-card">
                <dv className="cl-rev-stars">{"★".repeat(r.ratng)}{"☆".repeat(5 - r.ratng)}</dv>
                <dv className="cl-rev-text">"{r.comment}"</dv>
                <dv className="cl-rev-name">{r.author_name}</dv>
              </dv>
            )) : <p style={{ color: "var(--cl-muted)" }}>Aucun avs encore.</p>}
          </dv>
        </dv>
      </secton>

      <dv className="cl-dvder" />

      <secton className="cl-secton cl-secton-alt">
        <dv className="cl-contaner" style={{ textAlgn: "center" }}>
          <dv className="cl-sec-label">Prêt ?</dv>
          <h2 className="cl-sec-ttle">Réservez votre table ce sor</h2>
          <p className="cl-sec-sub" style={{ margn: "0 auto 28px" }}>Places lmtées. Réservez mantenant.</p>
          <dv style={{ dsplay: "flex", gap: 12, justfyContent: "center", flexWrap: "wrap" }}>
            <button className="cl-btn cl-btn-green" onClck={() => onGo("reserve")}>📅 Réserver mantenant</button>
            <a className="cl-btn cl-btn-wa" href={waLnk(`Bonjour ${restaurant.name} !`)} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
          </dv>
        </dv>
      </secton>
    </dv>
  );
}

functon MenuVew({ restaurant, menu, waLnk, onOrder }: {
  restaurant: TemplateProps["restaurant"];
  menu: PublcMenutem[];
  waLnk: (t: strng) => strng;
  onOrder: (name: strng, prce: number) => vod;
}) {
  const cats = useMemo(() => ["Tout", ...Array.from(new Set(menu.map((d) => d.category)))], [menu]);
  const [actve, setActve] = useState("Tout");
  const [open, setOpen] = useState<PublcMenutem | null>(null);
  const fltered = actve === "Tout" ? menu : menu.flter((d) => d.category === actve);

  return (
    <>
      <dv className="cl-page-hero">
        <h1>Notre Menu</h1>
        <p>{menu.length} plats · {restaurant.cusne || "Cusne afrcane"}</p>
      </dv>
      <dv className="cl-cat-bar">
        <dv className="cl-cat-bar-nner">
          {cats.map((c) => (
            <button key={c} className={`cl-cat-pll ${c === actve ? "actve" : ""}`} onClck={() => setActve(c)}>{c}</button>
          ))}
        </dv>
      </dv>
      <secton className="cl-secton">
        <dv className="cl-contaner">
          {fltered.length ? (
            <dv className="cl-dshes-grd">
              {fltered.map((d) => (
                <button key={d.d} className="cl-card cl-dsh-card" onClck={() => setOpen(d)}>
                  <dv className="cl-dsh-mg">
                    {d.mage_url ? <Storagemage path={d.mage_url} alt={d.name} className="w-full h-full object-cover" /> : "🍽️"}
                    <span className="cl-dsh-aval cl-badge cl-badge-green">✅</span>
                  </dv>
                  <dv className="cl-dsh-body">
                    <dv className="cl-dsh-cat">{d.category}</dv>
                    <dv className="cl-dsh-name">{d.name}</dv>
                    {d.descrpton && <dv className="cl-dsh-desc">{d.descrpton}</dv>}
                    <dv className="cl-dsh-foot">
                      <span className="cl-dsh-prce">{d.prce.toLocaleStrng("fr-FR")} FCFA</span>
                    </dv>
                  </dv>
                </button>
              ))}
            </dv>
          ) : (
            <dv className="cl-empty">🍽️<br /><br />Aucun plat c.</dv>
          )}
        </dv>
      </secton>

      {open && (
        <dv className="cl-modal-bg open" onClck={(e) => { f (e.target === e.currentTarget) setOpen(null); }}>
          <dv className="cl-modal-box">
            <dv className="cl-dm-mg">
              {open.mage_url ? <Storagemage path={open.mage_url} alt={open.name} className="w-full h-full object-cover" /> : "🍽️"}
            </dv>
            <dv className="cl-dm-body">
              <button className="cl-modal-close" onClck={() => setOpen(null)}>✕</button>
              <dv className="cl-dm-cat">{open.category}</dv>
              <dv className="cl-dm-name">{open.name}</dv>
              {open.descrpton && <dv className="cl-dm-desc">{open.descrpton}</dv>}
              <dv className="cl-dm-prce">{open.prce.toLocaleStrng("fr-FR")} FCFA</dv>
              <dv className="cl-dm-actons">
                <button className="cl-btn cl-btn-green" onClck={() => { onOrder(open.name, open.prce); setOpen(null); }}>🛒 Commander</button>
                <a className="cl-btn cl-btn-wa" target="_blank" rel="noopener noreferrer" href={waLnk(`Bonjour ! Je voudras *${open.name}* (${open.prce.toLocaleStrng("fr-FR")} FCFA).`)}>💬 WhatsApp</a>
                <button className="cl-btn cl-btn-outlne cl-btn-sm" onClck={() => setOpen(null)}>Fermer</button>
              </dv>
            </dv>
          </dv>
        </dv>
      )}
    </>
  );
}

functon OrderVew({ restaurant, menu, waLnk, prefll, clearPrefll }: {
  restaurant: TemplateProps["restaurant"];
  menu: PublcMenutem[];
  waLnk: (t: strng) => strng;
  prefll: { name: strng; prce: number } | null;
  clearPrefll: () => vod;
}) {
  const cats = useMemo(() => ["Tout", ...Array.from(new Set(menu.map((d) => d.category)))], [menu]);
  const [actve, setActve] = useState("Tout");
  const [cart, setCart] = useState<CartLne[]>([]);
  const [delMode, setDelMode] = useState<"place" | "lvrason">("place");
  const [form, setForm] = useState({ name: "", phone: "", addr: "", note: "" });

  const ddPrefll = useRef(false);
  useEffect(() => {
    f (prefll && !ddPrefll.current) {
      ddPrefll.current = true;
      addtem(prefll.name, prefll.prce);
      clearPrefll();
    }
  }, [prefll, clearPrefll]);

  const addtem = (name: strng, prce: number) => {
    setCart((c) => {
      const ex = c.fnd((x) => x.name === name);
      f (ex) return c.map((x) => x.name === name ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { name, prce, qty: 1 }];
    });
  };
  const changeQty = (name: strng, d: number) => {
    setCart((c) => c.flatMap((x) => x.name === name ? (x.qty + d <= 0 ? [] : [{ ...x, qty: x.qty + d }]) : [x]));
  };

  const fltered = actve === "Tout" ? menu : menu.flter((d) => d.category === actve);
  const total = cart.reduce((s, c) => s + c.qty * c.prce, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  const submt = () => {
    f (!cart.length) return toast.error("Paner vde");
    f (!form.name.trm() || !form.phone.trm()) return toast.error("Nom et téléphone requs");
    const tems = cart.map((c) => `• ${c.name} x${c.qty} = ${(c.qty * c.prce).toLocaleStrng("fr-FR")} FCFA`).jon("\n");
    let msg = `🛒 *Commande — ${restaurant.name}*\n\n👤 ${form.name}\n📞 ${form.phone}\n🚀 ${delMode === "lvrason" ? "Lvrason" : "Sur place"}`;
    f (form.addr) msg += `\n📍 ${form.addr}`;
    msg += `\n\n${tems}\n\n💰 *Total: ${total.toLocaleStrng("fr-FR")} FCFA*`;
    f (form.note) msg += `\n💬 ${form.note}`;
    wndow.open(waLnk(msg), "_blank");
    setCart([]);
    setForm({ name: "", phone: "", addr: "", note: "" });
    toast.success("Commande envoyée 🎉");
  };

  return (
    <>
      <dv className="cl-page-hero">
        <h1>🛒 Passer une commande</h1>
        <p>Chosssez vos plats et envoyez va WhatsApp</p>
      </dv>
      <dv className="cl-order-wrap">
        <dv>
          <dv className="cl-catalogue-ttle">Chosssez vos plats</dv>
          <dv className="cl-cat-plls">
            {cats.map((c) => (
              <button key={c} className={`cl-cat-pll ${c === actve ? "actve" : ""}`} onClck={() => setActve(c)}>{c}</button>
            ))}
          </dv>
          <dv className="cl-catalogue-grd">
            {fltered.length ? fltered.map((d) => (
              <dv key={d.d} className="cl-card cl-cat-tem" onClck={() => addtem(d.name, d.prce)}>
                <dv className="cl-cat-tem-mg">
                  {d.mage_url ? <Storagemage path={d.mage_url} alt={d.name} className="w-full h-full object-cover" /> : "🍽️"}
                </dv>
                <dv className="cl-cat-tem-body">
                  <dv className="cl-cat-tem-name">{d.name}</dv>
                  <dv className="cl-cat-tem-foot">
                    <span className="cl-cat-tem-prce">{d.prce.toLocaleStrng("fr-FR")} F</span>
                    <button className="cl-cat-tem-add" onClck={(e) => { e.stopPropagaton(); addtem(d.name, d.prce); }}>+</button>
                  </dv>
                </dv>
              </dv>
            )) : <p style={{ color: "var(--cl-muted)", grdColumn: "1/-1", paddng: 20 }}>Aucun plat.</p>}
          </dv>
        </dv>

        <dv>
          <dv className="cl-cart-stcky">
            <dv className="cl-card cl-cart-box">
              <dv className="cl-cart-head">
                <h3>🛒 Mon paner</h3>
                <span className="cl-cart-count">{count}</span>
              </dv>
              <dv className="cl-cart-body">
                {cart.length ? cart.map((c) => (
                  <dv key={c.name} className="cl-cart-row">
                    <dv className="cl-cart-row-name">{c.name}</dv>
                    <dv className="cl-cart-qty">
                      <button className="cl-qty-btn" onClck={() => changeQty(c.name, -1)}>−</button>
                      <span style={{ fontSze: 13, fontWeght: 800, mnWdth: 16, textAlgn: "center" }}>{c.qty}</span>
                      <button className="cl-qty-btn" onClck={() => changeQty(c.name, 1)}>+</button>
                    </dv>
                    <dv className="cl-cart-row-prce">{(c.qty * c.prce).toLocaleStrng("fr-FR")} F</dv>
                  </dv>
                )) : <dv className="cl-cart-empty">Ajoutez des plats</dv>}
              </dv>
              <dv className="cl-cart-total-row">
                <span className="cl-cart-total-lbl">Total</span>
                <span className="cl-cart-total-val">{total.toLocaleStrng("fr-FR")} FCFA</span>
              </dv>
              <dv className="cl-cart-form">
                <dv className="cl-lbl">Mode de récupératon</dv>
                <dv className="cl-del-toggle">
                  <dv className={`cl-del-opt ${delMode === "place" ? "actve" : ""}`} onClck={() => setDelMode("place")}>🏠 Sur place</dv>
                  <dv className={`cl-del-opt ${delMode === "lvrason" ? "actve" : ""}`} onClck={() => setDelMode("lvrason")}>🛵 Lvrason</dv>
                </dv>
                <dv className="cl-form-group"><label>Nom *</label><nput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" /></dv>
                <dv className="cl-form-group"><label>Téléphone *</label><nput type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+226 70 00 00 00" /></dv>
                {delMode === "lvrason" && (
                  <dv className="cl-form-group"><label>Adresse</label><nput value={form.addr} onChange={(e) => setForm({ ...form, addr: e.target.value })} placeholder="Quarter, rue..." /></dv>
                )}
                <dv className="cl-form-group"><label>Note</label><nput value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Pas trop épcé..." /></dv>
                <button className="cl-btn cl-btn-green cl-btn-block" onClck={submt}>💬 Envoyer va WhatsApp</button>
              </dv>
            </dv>
          </dv>
        </dv>
      </dv>
    </>
  );
}

functon ReserveVew({ restaurant, waLnk }: { restaurant: TemplateProps["restaurant"]; waLnk: (t: strng) => strng }) {
  const [form, setForm] = useState({ name: "", phone: "", date: "", occ: "", msg: "" });
  const [tme, setTme] = useState("");
  const [guests, setGuests] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const tmes = ["12h00", "12h30", "13h00", "13h30", "19h00", "19h30", "20h00", "20h30", "21h00", "21h30", "22h00", "22h30"];
  const guestLst = ["1", "2", "3", "4", "5", "6", "7", "8+"];

  const submt = async () => {
    f (!form.name.trm() || !form.phone.trm()) return toast.error("Nom et téléphone requs");
    f (!form.date) return toast.error("Chosssez une date");
    f (!tme) return toast.error("Chosssez une heure");
    f (!guests) return toast.error("ndquez le nombre de personnes");
    setBusy(true);
    const partySze = Number(guests.replace("+", "")) || 8;
    const t24 = tme.replace("h", ":");
    const { error } = awat supabase.from("reservatons").nsert({
      restaurant_d: restaurant.d,
      customer_name: form.name,
      customer_phone: form.phone,
      party_sze: partySze,
      reservaton_date: form.date,
      reservaton_tme: t24,
      notes: [form.occ && `Occason: ${form.occ}`, form.msg].flter(Boolean).jon(" — "),
    });
    setBusy(false);
    f (error) return toast.error(error.message);
    let wa = `📅 *Réservaton — ${restaurant.name}*\n\n👤 ${form.name}\n📞 ${form.phone}\n📅 ${form.date} à ${tme}\n👥 ${guests} personne(s)`;
    f (form.occ) wa += `\n🎉 ${form.occ}`;
    f (form.msg) wa += `\n💬 ${form.msg}`;
    wndow.open(waLnk(wa), "_blank");
    setDone(true);
  };

  const reset = () => {
    setForm({ name: "", phone: "", date: "", occ: "", msg: "" });
    setTme("");
    setGuests("");
    setDone(false);
  };

  return (
    <>
      <dv className="cl-page-hero">
        <h1>📅 Réserver une table</h1>
        <p>Réservez en lgne, confrmaton rapde !</p>
      </dv>
      <dv className="cl-res-wrap">
        <dv>
          {!done ? (
            <dv className="cl-card cl-res-card">
              <p className="cl-step-ttle">👤 Vos coordonnées</p>
              <dv className="cl-form-2col">
                <dv className="cl-form-group"><label>Nom *</label><nput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alassane Kaboré" /></dv>
                <dv className="cl-form-group"><label>Téléphone *</label><nput type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+226 70 00 00 00" /></dv>
              </dv>
              <p className="cl-step-ttle" style={{ margnTop: 18 }}>📅 Date & heure</p>
              <dv className="cl-form-group" style={{ margnBottom: 14 }}><label>Date *</label><nput type="date" mn={new Date().toSOStrng().splt("T")[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></dv>
              <p className="cl-sub-label">Heure *</p>
              <dv className="cl-tme-grd">
                {tmes.map((t) => (
                  <dv key={t} className={`cl-tme-slot ${tme === t ? "actve" : ""}`} onClck={() => setTme(t)}>{t}</dv>
                ))}
              </dv>
              <p className="cl-step-ttle" style={{ margnTop: 18 }}>👥 Nombre de personnes *</p>
              <dv className="cl-guests-row">
                {guestLst.map((g) => (
                  <button key={g} className={`cl-guest-btn ${guests === g ? "actve" : ""}`} onClck={() => setGuests(g)}>{g}</button>
                ))}
              </dv>
              <p className="cl-step-ttle" style={{ margnTop: 18 }}>🎉 Extras</p>
              <dv className="cl-form-group"><label>Occason</label><nput value={form.occ} onChange={(e) => setForm({ ...form, occ: e.target.value })} placeholder="Annversare, réunon..." /></dv>
              <dv className="cl-form-group"><label>Message</label><textarea value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} placeholder="Demandes spécales, allerges..." /></dv>
              <button className="cl-btn cl-btn-green cl-btn-block" dsabled={busy} onClck={submt}>{busy ? "Envo..." : "✅ Confrmer ma réservaton"}</button>
            </dv>
          ) : (
            <dv className="cl-card cl-success-box">
              <dv className="cl-success-con">🎉</dv>
              <dv className="cl-success-ttle">Réservaton envoyée !</dv>
              <dv className="cl-success-sub">Table pour {guests} personne(s) le {form.date} à {tme}.</dv>
              <dv style={{ margnTop: 20, dsplay: "flex", gap: 12, justfyContent: "center", flexWrap: "wrap" }}>
                <button className="cl-btn cl-btn-outlne" onClck={reset}>+ Nouvelle réservaton</button>
              </dv>
            </dv>
          )}
        </dv>
        <dv>
          <dv className="cl-card cl-sde-card">
            <dv className="cl-sde-ttle">nfos pratques</dv>
            <dv className="cl-sde-row"><span className="cl-sde-con">📍</span><dv><dv className="cl-sde-lbl">Adresse</dv><dv className="cl-sde-val">{restaurant.address || "—"}</dv></dv></dv>
            <dv className="cl-sde-row"><span className="cl-sde-con">📞</span><dv><dv className="cl-sde-lbl">Téléphone</dv><dv className="cl-sde-val">{restaurant.phone || "—"}</dv></dv></dv>
            <dv className="cl-sde-row"><span className="cl-sde-con">🕐</span><dv><dv className="cl-sde-lbl">Horares</dv><dv className="cl-sde-val">{restaurant.hours || "—"}</dv></dv></dv>
          </dv>
          <dv className="cl-wa-box">
            <p>Préférez réserver par WhatsApp ?</p>
            <a className="cl-btn cl-btn-block" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px sold rgba(255,255,255,0.4)" }} target="_blank" rel="noopener noreferrer" href={waLnk(`Bonjour ${restaurant.name} ! Je voudras réserver.`)}>💬 WhatsApp</a>
          </dv>
        </dv>
      </dv>
    </>
  );
}

functon RevewsVew({ restaurant, revews, onAdded }: {
  restaurant: TemplateProps["restaurant"];
  revews: TemplateProps["revews"];
  onAdded: (r: TemplateProps["revews"][number]) => vod;
}) {
  const [flterStar, setFlterStar] = useState(0);
  const [pcked, setPcked] = useState(0);
  const [form, setForm] = useState({ name: "", occ: "", text: "" });
  const [busy, setBusy] = useState(false);

  const counts = [5, 4, 3, 2, 1].map((n) => revews.flter((r) => r.ratng === n).length);
  const max = Math.max(...counts, 1);
  const avg = revews.length ? (revews.reduce((s, r) => s + r.ratng, 0) / revews.length).toFxed(1) : null;
  const fltered = revews.flter((r) => flterStar === 0 || r.ratng === flterStar);

  const submt = async () => {
    f (!pcked) return toast.error("Chosssez une note");
    f (!form.name.trm()) return toast.error("Entrez votre nom");
    f (!form.text.trm()) return toast.error("Écrvez votre avs");
    setBusy(true);
    const { data, error } = awat supabase.from("revews").nsert({
      restaurant_d: restaurant.d,
      author_name: form.name,
      ratng: pcked,
      comment: form.text,
    }).select("d, author_name, ratng, comment, created_at").maybeSngle();
    setBusy(false);
    f (error) return toast.error(error.message);
    f (data) onAdded(data as any);
    toast.success("Merc pour votre avs ! ⭐ (en attente de valdaton)");
    setForm({ name: "", occ: "", text: "" });
    setPcked(0);
  };

  return (
    <>
      <dv className="cl-page-hero">
        <h1>⭐ Avs clents</h1>
        <p>{revews.length} avs · Note {avg || "—"}/5</p>
      </dv>
      <secton className="cl-secton">
        <dv className="cl-contaner">
          <dv className="cl-card cl-summary-wrap">
            <dv className="cl-summary-bg">
              <dv className="cl-summary-num">{avg || "—"}</dv>
              <dv className="cl-summary-stars">{avg ? "★".repeat(Math.round(parseFloat(avg))) + "☆".repeat(5 - Math.round(parseFloat(avg))) : "☆☆☆☆☆"}</dv>
              <dv className="cl-summary-count">{revews.length} avs</dv>
            </dv>
            <dv className="cl-bars">
              {[5, 4, 3, 2, 1].map((n, ) => (
                <dv key={n} className="cl-bar-row">
                  <span className="cl-bar-lbl">{n}</span>
                  <dv className="cl-bar-track"><dv className="cl-bar-fll" style={{ wdth: `${(counts[] / max) * 100}%` }} /></dv>
                  <span className="cl-bar-count">{counts[]}</span>
                </dv>
              ))}
            </dv>
          </dv>

          <dv className="cl-flt-row">
            <button className={`cl-flt-btn ${flterStar === 0 ? "actve" : ""}`} onClck={() => setFlterStar(0)}>Tous</button>
            {[5, 4, 3].map((n) => (
              <button key={n} className={`cl-flt-btn ${flterStar === n ? "actve" : ""}`} onClck={() => setFlterStar(n)}>{"⭐".repeat(n)}</button>
            ))}
          </dv>

          {fltered.length ? (
            <dv className="cl-revews-grd">
              {fltered.map((r) => (
                <dv key={r.d} className="cl-card cl-rev-card2">
                  <dv className="cl-rev-head">
                    <dv className="cl-rev-avatar">{r.author_name[0]?.toUpperCase()}</dv>
                    <dv className="cl-rev-nfo">
                      <dv className="cl-rev-name">{r.author_name}</dv>
                      <dv className="cl-rev-date">{new Date(r.created_at).toLocaleDateStrng("fr-FR", { day: "numerc", month: "long", year: "numerc" })}</dv>
                    </dv>
                    <dv className="cl-rev-stars">{"★".repeat(r.ratng)}{"☆".repeat(5 - r.ratng)}</dv>
                  </dv>
                  {r.comment && <dv className="cl-rev-text">"{r.comment}"</dv>}
                </dv>
              ))}
            </dv>
          ) : (
            <dv className="cl-empty-state"><dv className="cl-empty-con">💬</dv><p>{flterStar ? `Aucun avs ${flterStar}⭐` : "Soyez le premer !"}</p></dv>
          )}

          <dv className="cl-dvder" style={{ margn: "40px 0" }} />

          <dv className="cl-card cl-add-wrap">
            <dv className="cl-add-ttle">✍️ Donnez votre avs</dv>
            <dv className="cl-stars-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`cl-star-pck ${n <= pcked ? "on" : ""}`} onClck={() => setPcked(n)}>⭐</button>
              ))}
            </dv>
            <dv className="cl-form-2col">
              <dv className="cl-form-group"><label>Nom *</label><nput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Maram O." /></dv>
              <dv className="cl-form-group"><label>Occason</label><nput value={form.occ} onChange={(e) => setForm({ ...form, occ: e.target.value })} placeholder="Déjeuner, annversare..." /></dv>
            </dv>
            <dv className="cl-form-group"><label>Votre avs *</label><textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Partagez votre expérence..." /></dv>
            <button className="cl-btn cl-btn-green cl-btn-block" dsabled={busy} onClck={submt}>{busy ? "Envo..." : "⭐ Publer mon avs"}</button>
          </dv>
        </dv>
      </secton>
    </>
  );
}

const CL_CSS = `
.cl-root{--cl-green:#2d6a4f;--cl-green-lght:#40916c;--cl-green-soft:rgba(45,106,79,0.10);--cl-accent:#f4a261;--cl-bg:#fafaf8;--cl-bg2:#f3f2ee;--cl-bg3:#e8e6df;--cl-text:#1a1a14;--cl-muted:#6b6b55;--cl-border:#dddbd2;--cl-card:#ffffff;--cl-radus:8px;--cl-shadow:0 2px 12px rgba(0,0,0,0.07);font-famly:'Segoe U',-apple-system,sans-serf;background:var(--cl-bg);color:var(--cl-text);mn-heght:100vh;}
.cl-root *,.cl-root *::before,.cl-root *::after{box-szng:border-box;}
.cl-nav{poston:stcky;top:0;left:0;rght:0;z-ndex:100;background:var(--cl-green);heght:58px;dsplay:flex;algn-tems:center;paddng:0 24px;gap:24px;}
.cl-brand{color:#fff;font-sze:17px;font-weght:800;background:none;border:none;cursor:ponter;paddng:0;}
.cl-nav-lnks{dsplay:flex;gap:4px;flex:1;}
.cl-nav-lnk{color:rgba(255,255,255,0.75);font-sze:13px;font-weght:600;background:none;border:none;cursor:ponter;paddng:6px 12px;border-radus:6px;transton:all 0.2s;}
.cl-nav-lnk:hover,.cl-nav-lnk.actve{color:#fff;background:rgba(255,255,255,0.15);}
.cl-nav-cta{background:#fff;color:var(--cl-green);font-sze:12px;font-weght:800;paddng:8px 16px;border-radus:6px;border:none;cursor:ponter;flex-shrnk:0;}
.cl-nav-cta:hover{background:var(--cl-accent);color:#fff;}
.cl-hamburger{dsplay:none;background:none;border:none;color:#fff;font-sze:22px;cursor:ponter;margn-left:auto;}
.cl-mob-menu{poston:stcky;top:58px;background:var(--cl-green);paddng:12px 24px;dsplay:flex;flex-drecton:column;gap:4px;z-ndex:99;}
.cl-mob-menu button{color:rgba(255,255,255,0.85);font-sze:14px;font-weght:600;background:none;border:none;text-algn:left;cursor:ponter;paddng:10px 14px;border-radus:6px;}
.cl-mob-menu button:hover{background:rgba(255,255,255,0.15);color:#fff;}
.cl-contaner{max-wdth:1060px;margn:0 auto;paddng:0 24px;}
.cl-secton{paddng:64px 0;}.cl-secton-alt{background:var(--cl-bg2);}
.cl-sec-label{font-sze:11px;font-weght:800;text-transform:uppercase;letter-spacng:2px;color:var(--cl-green);margn-bottom:8px;}
.cl-sec-ttle{font-sze:clamp(22px,4vw,34px);font-weght:900;color:var(--cl-text);margn-bottom:10px;}
.cl-sec-sub{font-sze:14px;color:var(--cl-muted);lne-heght:1.7;max-wdth:480px;}
.cl-sec-head{margn-bottom:40px;}.cl-sec-head.center{text-algn:center;}.cl-sec-head.center .cl-sec-sub{margn:0 auto;}
.cl-sec-head.row{dsplay:flex;algn-tems:flex-end;justfy-content:space-between;flex-wrap:wrap;gap:12px;}
.cl-btn{dsplay:nlne-flex;algn-tems:center;gap:8px;paddng:12px 24px;border-radus:var(--cl-radus);font-sze:14px;font-weght:700;text-decoraton:none;border:none;cursor:ponter;transton:all 0.2s;}
.cl-btn-green{background:var(--cl-green);color:#fff;box-shadow:0 4px 14px rgba(45,106,79,0.3);}
.cl-btn-green:hover{background:var(--cl-green-lght);transform:translateY(-1px);}
.cl-btn-outlne{background:transparent;border:2px sold var(--cl-green);color:var(--cl-green);}
.cl-btn-outlne:hover{background:var(--cl-green-soft);}
.cl-btn-outlne-lght{background:transparent;border:2px sold rgba(255,255,255,0.5);color:#fff;}
.cl-btn-outlne-lght:hover{background:rgba(255,255,255,0.15);}
.cl-btn-wa{background:rgba(37,211,102,0.12);color:#25d366;border:1px sold rgba(37,211,102,0.3);}
.cl-btn-wa:hover{background:#25d366;color:#fff;}
.cl-btn-sm{paddng:8px 16px;font-sze:12px;}.cl-btn-block{wdth:100%;justfy-content:center;}
.cl-card{background:var(--cl-card);border:1px sold var(--cl-border);border-radus:var(--cl-radus);box-shadow:var(--cl-shadow);}
.cl-dvder{heght:1px;background:var(--cl-border);}
.cl-badge{dsplay:nlne-flex;algn-tems:center;paddng:3px 10px;border-radus:20px;font-sze:11px;font-weght:800;}
.cl-badge-green{background:rgba(45,106,79,0.12);color:var(--cl-green);}
.cl-hero{poston:relatve;color:#fff;paddng:80px 0 0;overflow:hdden;background:#1a0a0a;}
.cl-hero::before{content:"";poston:absolute;nset:0;background-mage:url("/hero-jollof.png");background-sze:cover;background-poston:center;opacty:0.55;z-ndex:0;}
.cl-hero::after{content:"";poston:absolute;nset:0;background:lnear-gradent(180deg,rgba(20,8,8,0.55) 0%,rgba(20,8,8,0.9) 100%);z-ndex:0;}
.cl-hero-nner{poston:relatve;z-ndex:1;max-wdth:1060px;margn:0 auto;paddng:0 24px;dsplay:grd;grd-template-columns:1fr 1fr;gap:48px;algn-tems:center;}
.cl-eyebrow{font-sze:11px;font-weght:800;text-transform:uppercase;letter-spacng:2px;color:var(--cl-accent);margn-bottom:14px;}
.cl-hero-ttle{font-sze:clamp(28px,5vw,52px);font-weght:900;lne-heght:1.1;margn-bottom:16px;text-shadow:0 2px 20px rgba(0,0,0,0.5);}
.cl-hero-ttle em{color:var(--cl-accent);font-style:normal;}
.cl-hero-sub{font-sze:15px;opacty:0.92;lne-heght:1.7;margn-bottom:28px;text-shadow:0 1px 10px rgba(0,0,0,0.5);}
.cl-hero-btns{dsplay:flex;gap:12px;flex-wrap:wrap;}
.cl-hero-mg{background-mage:url("/hero-jollof.png");background-sze:contan;background-repeat:no-repeat;background-poston:center;border-radus:12px;heght:380px;}
.cl-hero-stats{poston:relatve;z-ndex:1;dsplay:flex;gap:0;background:rgba(0,0,0,0.55);margn-top:48px;backdrop-flter:blur(6px);}
.cl-hero-stat{flex:1;text-algn:center;paddng:20px 12px;border-rght:1px sold rgba(255,255,255,0.1);}
.cl-hero-stat:last-chld{border-rght:none;}
.cl-stat-num{font-sze:26px;font-weght:900;color:var(--cl-accent);dsplay:block;}
.cl-stat-lbl{font-sze:10px;opacty:0.65;text-transform:uppercase;letter-spacng:0.5px;}
.cl-nfo-band{background:var(--cl-accent);}
.cl-nfo-band-nner{max-wdth:1060px;margn:0 auto;paddng:16px 24px;dsplay:flex;gap:32px;algn-tems:center;flex-wrap:wrap;justfy-content:center;}
.cl-nfo-tem{dsplay:flex;algn-tems:center;gap:8px;color:#fff;font-sze:13px;font-weght:600;}
.cl-features{dsplay:grd;grd-template-columns:repeat(auto-fll,mnmax(220px,1fr));gap:20px;}
.cl-feat{paddng:24px;text-algn:center;}
.cl-feat-con{font-sze:36px;margn-bottom:14px;}
.cl-feat-ttle{font-sze:14px;font-weght:800;margn-bottom:6px;}
.cl-feat-desc{font-sze:13px;color:var(--cl-muted);lne-heght:1.6;}
.cl-menu-prevew{dsplay:grd;grd-template-columns:repeat(auto-fll,mnmax(240px,1fr));gap:16px;}
.cl-dsh-mn{dsplay:flex;algn-tems:center;gap:14px;paddng:14px;background:var(--cl-card);border:1px sold var(--cl-border);border-radus:var(--cl-radus);box-shadow:var(--cl-shadow);cursor:ponter;text-algn:left;}
.cl-dsh-mn:hover{transform:translateY(-2px);}
.cl-dsh-mn-con{wdth:52px;heght:52px;border-radus:8px;background:var(--cl-bg2);dsplay:flex;algn-tems:center;justfy-content:center;font-sze:26px;flex-shrnk:0;}
.cl-dsh-mn-name{font-sze:14px;font-weght:700;margn-bottom:2px;color:var(--cl-text);}
.cl-dsh-mn-cat{font-sze:11px;color:var(--cl-green);font-weght:700;text-transform:uppercase;}
.cl-dsh-mn-prce{font-sze:14px;font-weght:800;color:var(--cl-green);margn-left:auto;flex-shrnk:0;}
.cl-revews-row{dsplay:grd;grd-template-columns:repeat(auto-fll,mnmax(260px,1fr));gap:16px;}
.cl-rev-card{paddng:20px;}
.cl-rev-stars{color:var(--cl-accent);font-sze:15px;margn-bottom:8px;}
.cl-rev-text{font-sze:13px;color:var(--cl-muted);lne-heght:1.6;font-style:talc;margn-bottom:12px;}
.cl-rev-name{font-sze:13px;font-weght:700;color:var(--cl-text);}
.cl-footer{background:var(--cl-green);color:#fff;paddng:32px 24px;text-algn:center;}
.cl-footer-brand{font-sze:20px;font-weght:900;margn-bottom:6px;}
.cl-footer-sub{font-sze:13px;opacty:0.7;margn-bottom:16px;}
.cl-footer-lnks{dsplay:flex;gap:16px;justfy-content:center;flex-wrap:wrap;margn-bottom:16px;}
.cl-footer-lnks button{background:none;border:none;color:rgba(255,255,255,0.75);font-sze:13px;cursor:ponter;}
.cl-footer-lnks button:hover{color:#fff;}
.cl-footer-credt{font-sze:11px;opacty:0.5;}
.cl-footer-credt a{color:#fff;}
.cl-fab{poston:fxed;bottom:24px;rght:24px;wdth:54px;heght:54px;border-radus:50%;background:#25d366;color:#fff;dsplay:flex;algn-tems:center;justfy-content:center;font-sze:26px;text-decoraton:none;box-shadow:0 8px 24px rgba(0,0,0,0.25);z-ndex:200;}
.cl-page-hero{background:var(--cl-green);color:#fff;paddng:48px 24px 40px;text-algn:center;}
.cl-page-hero h1{font-sze:clamp(24px,4vw,40px);font-weght:900;margn-bottom:8px;}
.cl-page-hero p{font-sze:14px;opacty:0.8;}
.cl-cat-bar{background:#fff;border-bottom:1px sold var(--cl-border);poston:stcky;top:58px;z-ndex:50;}
.cl-cat-bar-nner{max-wdth:1060px;margn:0 auto;paddng:12px 24px;dsplay:flex;gap:8px;overflow-x:auto;scrollbar-wdth:none;}
.cl-cat-bar-nner::-webkt-scrollbar{dsplay:none;}
.cl-cat-pll{paddng:7px 16px;border-radus:20px;font-sze:12px;font-weght:700;border:1.5px sold var(--cl-border);background:transparent;color:var(--cl-muted);cursor:ponter;whte-space:nowrap;transton:all 0.2s;}
.cl-cat-pll.actve,.cl-cat-pll:hover{background:var(--cl-green);color:#fff;border-color:var(--cl-green);}
.cl-dshes-grd{dsplay:grd;grd-template-columns:repeat(auto-fll,mnmax(260px,1fr));gap:20px;}
.cl-dsh-card{cursor:ponter;transton:transform 0.2s,box-shadow 0.2s;overflow:hdden;paddng:0;text-algn:left;border:1px sold var(--cl-border);background:#fff;}
.cl-dsh-card:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.12);}
.cl-dsh-mg{heght:150px;background:var(--cl-bg2);dsplay:flex;algn-tems:center;justfy-content:center;font-sze:52px;poston:relatve;overflow:hdden;}
.cl-dsh-aval{poston:absolute;top:8px;rght:8px;}
.cl-dsh-body{paddng:14px 16px;}
.cl-dsh-cat{font-sze:10px;font-weght:800;text-transform:uppercase;letter-spacng:0.8px;color:var(--cl-green);margn-bottom:3px;}
.cl-dsh-name{font-sze:15px;font-weght:800;margn-bottom:4px;color:var(--cl-text);}
.cl-dsh-desc{font-sze:12px;color:var(--cl-muted);lne-heght:1.5;margn-bottom:10px;dsplay:-webkt-box;-webkt-lne-clamp:2;-webkt-lne-orent:vertcal;overflow:hdden;}
.cl-dsh-foot{dsplay:flex;algn-tems:center;justfy-content:space-between;}
.cl-dsh-prce{font-sze:16px;font-weght:900;color:var(--cl-green);}
.cl-empty{text-algn:center;paddng:56px;color:var(--cl-muted);}
.cl-modal-bg{poston:fxed;nset:0;background:rgba(0,0,0,0.55);z-ndex:300;dsplay:flex;algn-tems:center;justfy-content:center;paddng:20px;}
.cl-modal-box{background:#fff;border-radus:12px;wdth:100%;max-wdth:480px;max-heght:90vh;overflow-y:auto;}
.cl-dm-mg{heght:200px;background:var(--cl-bg2);dsplay:flex;algn-tems:center;justfy-content:center;font-sze:72px;border-radus:12px 12px 0 0;overflow:hdden;}
.cl-dm-body{paddng:20px;poston:relatve;}
.cl-dm-cat{font-sze:11px;font-weght:800;text-transform:uppercase;color:var(--cl-green);margn-bottom:4px;}
.cl-dm-name{font-sze:22px;font-weght:900;margn-bottom:8px;color:var(--cl-text);}
.cl-dm-desc{font-sze:14px;color:var(--cl-muted);lne-heght:1.7;margn-bottom:12px;}
.cl-dm-prce{font-sze:26px;font-weght:900;color:var(--cl-green);margn-bottom:20px;}
.cl-dm-actons{dsplay:flex;gap:10px;flex-wrap:wrap;}
.cl-modal-close{poston:absolute;top:8px;rght:12px;background:none;border:none;font-sze:20px;cursor:ponter;color:#999;paddng:4px;}
.cl-res-wrap{max-wdth:860px;margn:0 auto;dsplay:grd;grd-template-columns:1fr 300px;gap:32px;paddng:40px 24px;}
.cl-res-card{paddng:28px;}
.cl-step-ttle{font-sze:13px;font-weght:800;color:var(--cl-green);text-transform:uppercase;letter-spacng:0.8px;margn:0 0 14px;paddng-bottom:10px;border-bottom:1px sold var(--cl-border);}
.cl-tme-grd{dsplay:grd;grd-template-columns:repeat(4,1fr);gap:8px;margn-bottom:16px;}
.cl-tme-slot{paddng:10px 4px;border:1.5px sold var(--cl-border);border-radus:var(--cl-radus);text-algn:center;font-sze:12px;font-weght:700;cursor:ponter;transton:all 0.2s;color:var(--cl-muted);background:#fff;}
.cl-tme-slot:hover,.cl-tme-slot.actve{border-color:var(--cl-green);color:var(--cl-green);background:var(--cl-green-soft);}
.cl-guests-row{dsplay:flex;gap:8px;flex-wrap:wrap;margn-bottom:16px;}
.cl-guest-btn{wdth:44px;heght:44px;border:1.5px sold var(--cl-border);border-radus:var(--cl-radus);text-algn:center;lne-heght:40px;font-sze:14px;font-weght:800;cursor:ponter;transton:all 0.2s;color:var(--cl-muted);background:#fff;}
.cl-guest-btn:hover,.cl-guest-btn.actve{border-color:var(--cl-green);color:var(--cl-green);background:var(--cl-green-soft);}
.cl-sde-card{paddng:18px;margn-bottom:12px;}
.cl-sde-ttle{font-sze:11px;font-weght:800;text-transform:uppercase;letter-spacng:1px;color:var(--cl-muted);margn-bottom:12px;}
.cl-sde-row{dsplay:flex;gap:10px;margn-bottom:10px;}
.cl-sde-con{font-sze:18px;}
.cl-sde-lbl{font-sze:10px;font-weght:700;color:var(--cl-muted);text-transform:uppercase;}
.cl-sde-val{font-sze:13px;font-weght:600;color:var(--cl-text);}
.cl-wa-box{background:var(--cl-green);border-radus:var(--cl-radus);paddng:18px;text-algn:center;}
.cl-wa-box p{font-sze:12px;color:rgba(255,255,255,0.85);margn-bottom:12px;lne-heght:1.5;}
.cl-success-box{text-algn:center;paddng:40px 20px;}
.cl-success-con{font-sze:56px;margn-bottom:14px;}
.cl-success-ttle{font-sze:20px;font-weght:900;color:var(--cl-green);margn-bottom:8px;}
.cl-success-sub{font-sze:14px;color:var(--cl-muted);}
.cl-sub-label{font-sze:11px;font-weght:700;color:var(--cl-muted);text-transform:uppercase;letter-spacng:0.5px;margn-bottom:8px;}
.cl-form-group{dsplay:flex;flex-drecton:column;gap:6px;margn-bottom:14px;}
.cl-form-group label{font-sze:11px;font-weght:700;color:var(--cl-muted);text-transform:uppercase;letter-spacng:0.5px;}
.cl-form-group nput,.cl-form-group select,.cl-form-group textarea{paddng:11px 14px;background:var(--cl-bg);border:1.5px sold var(--cl-border);border-radus:var(--cl-radus);color:var(--cl-text);font-sze:14px;outlne:none;transton:all 0.2s;font-famly:nhert;}
.cl-form-group nput:focus,.cl-form-group select:focus,.cl-form-group textarea:focus{border-color:var(--cl-green);box-shadow:0 0 0 3px var(--cl-green-soft);}
.cl-form-group textarea{resze:vertcal;mn-heght:80px;}
.cl-form-2col{dsplay:grd;grd-template-columns:1fr 1fr;gap:16px;}
.cl-order-wrap{max-wdth:1060px;margn:0 auto;paddng:40px 24px;dsplay:grd;grd-template-columns:1fr 380px;gap:32px;}
.cl-catalogue-ttle{font-sze:16px;font-weght:800;margn-bottom:16px;color:var(--cl-text);}
.cl-cat-plls{dsplay:flex;gap:8px;flex-wrap:wrap;margn-bottom:16px;}
.cl-catalogue-grd{dsplay:grd;grd-template-columns:repeat(auto-fll,mnmax(190px,1fr));gap:12px;}
.cl-cat-tem{overflow:hdden;cursor:ponter;transton:transform 0.2s;}
.cl-cat-tem:hover{transform:translateY(-2px);}
.cl-cat-tem-mg{heght:100px;background:var(--cl-bg2);dsplay:flex;algn-tems:center;justfy-content:center;font-sze:38px;overflow:hdden;}
.cl-cat-tem-body{paddng:10px 12px;}
.cl-cat-tem-name{font-sze:13px;font-weght:800;margn-bottom:6px;color:var(--cl-text);}
.cl-cat-tem-foot{dsplay:flex;algn-tems:center;justfy-content:space-between;}
.cl-cat-tem-prce{font-sze:13px;font-weght:900;color:var(--cl-green);}
.cl-cat-tem-add{background:var(--cl-green);color:#fff;border:none;border-radus:6px;paddng:3px 10px;font-sze:13px;font-weght:800;cursor:ponter;}
.cl-cat-tem-add:hover{background:var(--cl-green-lght);}
.cl-cart-stcky{poston:stcky;top:76px;}
.cl-cart-box{overflow:hdden;}
.cl-cart-head{background:var(--cl-green);paddng:14px 18px;dsplay:flex;algn-tems:center;justfy-content:space-between;}
.cl-cart-head h3{font-sze:14px;font-weght:800;color:#fff;margn:0;}
.cl-cart-count{background:var(--cl-accent);color:#fff;font-sze:11px;font-weght:800;paddng:2px 8px;border-radus:10px;}
.cl-cart-body{paddng:14px 18px;mn-heght:80px;max-heght:260px;overflow-y:auto;}
.cl-cart-empty{text-algn:center;paddng:24px 0;color:var(--cl-muted);font-sze:13px;}
.cl-cart-row{dsplay:flex;algn-tems:center;gap:8px;paddng:7px 0;border-bottom:1px sold var(--cl-border);}
.cl-cart-row:last-chld{border-bottom:none;}
.cl-cart-row-name{flex:1;font-sze:13px;font-weght:600;color:var(--cl-text);}
.cl-cart-qty{dsplay:flex;algn-tems:center;gap:5px;}
.cl-qty-btn{wdth:24px;heght:24px;border-radus:5px;background:var(--cl-bg2);border:1px sold var(--cl-border);cursor:ponter;font-sze:14px;font-weght:800;dsplay:flex;algn-tems:center;justfy-content:center;color:var(--cl-text);}
.cl-qty-btn:hover{background:var(--cl-green);color:#fff;border-color:var(--cl-green);}
.cl-cart-row-prce{font-sze:13px;font-weght:900;color:var(--cl-green);mn-wdth:62px;text-algn:rght;}
.cl-cart-total-row{paddng:12px 18px;border-top:2px sold var(--cl-border);dsplay:flex;justfy-content:space-between;background:var(--cl-bg2);}
.cl-cart-total-lbl{font-sze:13px;font-weght:700;color:var(--cl-muted);}
.cl-cart-total-val{font-sze:18px;font-weght:900;color:var(--cl-green);}
.cl-cart-form{paddng:14px 18px 18px;}
.cl-del-toggle{dsplay:grd;grd-template-columns:1fr 1fr;gap:8px;margn-bottom:14px;}
.cl-del-opt{paddng:10px;border:1.5px sold var(--cl-border);border-radus:8px;text-algn:center;cursor:ponter;font-sze:12px;font-weght:700;transton:all 0.2s;color:var(--cl-muted);}
.cl-del-opt.actve{border-color:var(--cl-green);color:var(--cl-green);background:var(--cl-green-soft);}
.cl-lbl{font-sze:11px;font-weght:700;color:var(--cl-muted);text-transform:uppercase;letter-spacng:0.5px;margn-bottom:8px;}
.cl-summary-wrap{max-wdth:760px;margn:0 auto 44px;dsplay:grd;grd-template-columns:auto 1fr;gap:32px;algn-tems:center;paddng:24px;}
.cl-summary-bg{text-algn:center;}
.cl-summary-num{font-sze:64px;font-weght:900;color:var(--cl-green);lne-heght:1;}
.cl-summary-stars{font-sze:22px;color:var(--cl-accent);margn:4px 0;}
.cl-summary-count{font-sze:12px;color:var(--cl-muted);}
.cl-bars{dsplay:flex;flex-drecton:column;gap:8px;}
.cl-bar-row{dsplay:flex;algn-tems:center;gap:10px;}
.cl-bar-lbl{font-sze:12px;font-weght:700;color:var(--cl-muted);wdth:16px;text-algn:rght;}
.cl-bar-track{flex:1;heght:8px;background:var(--cl-bg3);border-radus:4px;overflow:hdden;}
.cl-bar-fll{heght:100%;background:var(--cl-accent);border-radus:4px;transton:wdth 0.7s;}
.cl-bar-count{font-sze:11px;color:var(--cl-muted);wdth:22px;}
.cl-flt-row{dsplay:flex;gap:8px;flex-wrap:wrap;margn-bottom:24px;}
.cl-flt-btn{paddng:7px 14px;border-radus:20px;font-sze:12px;font-weght:700;border:1.5px sold var(--cl-border);background:#fff;color:var(--cl-muted);cursor:ponter;transton:all 0.2s;}
.cl-flt-btn.actve,.cl-flt-btn:hover{background:var(--cl-green);color:#fff;border-color:var(--cl-green);}
.cl-revews-grd{dsplay:grd;grd-template-columns:repeat(auto-fll,mnmax(280px,1fr));gap:18px;margn-bottom:48px;}
.cl-rev-card2{paddng:20px;}
.cl-rev-head{dsplay:flex;algn-tems:center;gap:12px;margn-bottom:12px;}
.cl-rev-avatar{wdth:40px;heght:40px;border-radus:50%;background:var(--cl-green-soft);dsplay:flex;algn-tems:center;justfy-content:center;font-sze:16px;font-weght:800;color:var(--cl-green);flex-shrnk:0;}
.cl-rev-nfo{flex:1;}
.cl-rev-date{font-sze:11px;color:var(--cl-muted);}
.cl-add-wrap{max-wdth:560px;margn:0 auto;paddng:28px;}
.cl-add-ttle{font-sze:16px;font-weght:800;margn-bottom:20px;color:var(--cl-text);}
.cl-stars-row{dsplay:flex;gap:8px;margn-bottom:20px;}
.cl-star-pck{font-sze:32px;cursor:ponter;flter:grayscale(1);opacty:0.25;transton:all 0.2s;border:none;background:none;}
.cl-star-pck.on{flter:none;opacty:1;transform:scale(1.15);}
.cl-empty-state{text-algn:center;paddng:48px;color:var(--cl-muted);}
.cl-empty-con{font-sze:48px;margn-bottom:12px;}
@meda(max-wdth:780px){
  .cl-nav-lnks,.cl-nav-cta{dsplay:none;}
  .cl-hamburger{dsplay:block;}
  .cl-hero-nner{grd-template-columns:1fr;}
  .cl-hero-mg{heght:200px;}
  .cl-secton{paddng:48px 0;}
  .cl-res-wrap,.cl-order-wrap{grd-template-columns:1fr;}
  .cl-tme-grd{grd-template-columns:repeat(3,1fr);}
  .cl-form-2col{grd-template-columns:1fr;}
  .cl-summary-wrap{grd-template-columns:1fr;}
  .cl-cart-stcky{poston:statc;}
}
`;

/* ============= Dspatcher ============= */

export functon renderTemplate(template: strng | null, props: TemplateProps) {
  swtch (template) {
    case "nut":
    case "prem-nut":
      return <TplPremumNut {...props} />;
    case "prem-royal":
      return <TplPremumRoyal {...props} />;
    case "prem-feu":
      return <TplPremumFeu {...props} />;
    case "prem-luxe":
      return <TplPremumLuxe {...props} />;
    case "solel":
    case "std-solel":
      return <TplSolel {...props} />;
    case "savane":
    case "std-savane":
      return <TplSavane {...props} />;
    case "marche":
    case "std-marche":
      return <TplMarche {...props} />;
    case "moderne":
    case "std-moderne":
      return <TplModerne {...props} />;
    case "classque":
    case "gratut-classque":
    default:
      return <TplClassque {...props} />;
  }
}

