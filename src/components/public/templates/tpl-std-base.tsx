import * as React from "react";
import type { TemplateProps, PublicMenuItem, Theme } from "../shared";
import {
  GalleryGrid,
  ReviewList,
  AdvancedReservationForm,
  ReviewForm,
  DishModal,
  buildWhatsAppLink,
  buildViewHref,
  avgRating,
  fmtPrice,
  groupByCategory,
} from "../shared";
import { StorageImage } from "@/components/StorageImage";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Clock,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  UtensilsCrossed,
  Mail,
  Search,
} from "lucide-react";

/**
 * Socle visuel commun aux templates STANDARD (Soleil, Savane, Vert, Épuré).
 * Même structure, même composants : seule la palette change.
 * Design de référence : app mobile-first, header vitré, hero, bandeau d'infos,
 * carrousel de signatures, navigation basse avec bouton Réserver central.
 */

export type StdPalette = {
  /** fond de page */
  bg: string;
  /** cartes (surface-container-low) */
  surface: string;
  /** cartes élevées / chips (surface-container-high) */
  surfaceHigh: string;
  text: string;
  textMuted: string;
  /** couleur d'accent (textes, icônes, liens actifs) */
  primary: string;
  /** texte posé sur primary */
  primaryInk: string;
  /** fond des boutons principaux / bouton central */
  container: string;
  /** texte posé sur container */
  containerInk: string;
  /** pastille "ouvert", petits signes positifs */
  positive: string;
  border: string;
  /** voile sur les images du hero (rgb sans alpha, ex: "14,14,16") */
  scrim: string;
  /** palette claire (change quelques ombres/contrastes) */
  light?: boolean;
};

const FONTS =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

type View = "home" | "menu" | "reserve" | "reviews" | "about";

function resolveView(view: string | null | undefined): View {
  if (view === "menu" || view === "reserve" || view === "reviews" || view === "about") return view;
  return "home";
}

function pickCover(props: TemplateProps) {
  const { gallery, menu } = props;
  return gallery[0]?.image_url ?? menu.find((m) => m.image_url)?.image_url ?? null;
}

function toTheme(p: StdPalette): Theme {
  return {
    bg: p.bg,
    surface: p.surface,
    surfaceAlt: p.surfaceHigh,
    text: p.text,
    textMuted: p.textMuted,
    accent: p.primary,
    accentInk: p.primaryInk,
    border: p.border,
    radius: "16px",
  };
}

export function StdTemplate({ palette: p, ...props }: TemplateProps & { palette: StdPalette }) {
  const { restaurant, menu, reviews, gallery } = props;
  const theme = toTheme(p);
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const canReserve = restaurant.plan !== "gratuit";
  const activeView = resolveView(props.view);
  const cover = pickCover(props);
  const rating = avgRating(reviews);
  const [openDish, setOpenDish] = React.useState<PublicMenuItem | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeView]);

  const available = menu.filter((m) => m.available);
  const signatures = [
    ...available.filter((m) => m.image_url),
    ...available.filter((m) => !m.image_url),
  ].slice(0, 6);

  const serif: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };
  const hours = restaurant.hours?.trim() || null;
  const hoursShort = hours ? hours.split("\n")[0] : null;

  return (
    <div
      className="min-h-screen pb-28"
      style={{
        background: p.bg,
        color: p.text,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        isolation: "isolate",
      }}
    >
      <link rel="stylesheet" href={FONTS} />
      <style>{`
        .std-snap::-webkit-scrollbar{display:none}
        .std-snap{scrollbar-width:none}
        .std-press{transition:transform .15s ease}
        .std-press:active{transform:scale(.96)}
      `}</style>

      {/* HEADER */}
      <header
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl"
        style={{
          background: `${p.bg}cc`,
          boxShadow: p.light ? "0 1px 0 rgba(0,0,0,0.06)" : "0 1px 8px rgba(0,0,0,0.18)",
        }}
      >
        <div className="h-16 px-5 max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-full grid place-items-center shrink-0 overflow-hidden"
              style={{ background: p.surfaceHigh, color: p.primary }}
            >
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UtensilsCrossed className="w-[18px] h-[18px]" />
              )}
            </div>
            <div className="min-w-0 leading-none">
              <div
                className="truncate text-[20px] font-medium"
                style={{ ...serif, color: p.primary }}
              >
                {restaurant.name}
              </div>
              {hoursShort && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: p.positive }}
                  />
                  <span
                    className="truncate text-[11px] tracking-wide"
                    style={{ color: p.textMuted }}
                  >
                    {hoursShort}
                  </span>
                </div>
              )}
            </div>
          </div>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="std-press w-10 h-10 rounded-full grid place-items-center shrink-0"
              style={{ background: p.surfaceHigh, color: p.primary }}
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 pt-20 flex flex-col gap-10">
        {/* ============ ACCUEIL ============ */}
        {activeView === "home" && (
          <>
            <section
              className="relative rounded-2xl overflow-hidden shadow-xl"
              style={{ background: p.surface }}
            >
              <div className="relative h-[430px] w-full flex flex-col justify-end p-6">
                {cover ? (
                  <StorageImage
                    path={cover}
                    alt={restaurant.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${p.container}, ${p.surfaceHigh})`,
                    }}
                  />
                )}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, rgba(${p.scrim},0.92) 0%, rgba(${p.scrim},0.55) 45%, rgba(${p.scrim},0.05) 100%)`,
                  }}
                />
                <div className="relative z-10 flex flex-col gap-2.5">
                  {restaurant.cuisine && (
                    <span
                      className="self-start px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest backdrop-blur-md"
                      style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}
                    >
                      {restaurant.cuisine}
                    </span>
                  )}
                  <h1
                    className="text-[34px] leading-tight font-semibold drop-shadow-md"
                    style={{ ...serif, color: "#fff" }}
                  >
                    {restaurant.name}
                  </h1>
                  <p
                    className="text-[15px] leading-relaxed max-w-xs"
                    style={{ color: "rgba(255,255,255,0.82)" }}
                  >
                    {restaurant.description ?? `Cuisine à découvrir à ${restaurant.city}.`}
                  </p>
                  <div className="flex items-center gap-2.5 pt-1">
                    {canReserve && (
                      <a
                        href={buildViewHref("reserve")}
                        className="std-press flex-1 min-h-[48px] px-4 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 shadow-lg"
                        style={{ background: p.container, color: p.containerInk }}
                      >
                        <CalendarDays className="w-5 h-5" />
                        Réserver
                      </a>
                    )}
                    <a
                      href={buildViewHref("menu")}
                      className={`std-press min-h-[48px] px-5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-1.5 backdrop-blur-md ${canReserve ? "" : "flex-1"}`}
                      style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
                    >
                      La carte
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Bandeau d'infos */}
            <section className="rounded-2xl p-4 shadow-md" style={{ background: p.surface }}>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1 p-1.5 min-w-0">
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: p.positive }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: p.positive }} />
                    Service
                  </span>
                  <span className="text-[15px] font-semibold truncate max-w-full">
                    {hoursShort ? hoursShort.split(/[·•—-]/)[0].trim() : "Horaires"}
                  </span>
                  <span className="text-[11px]" style={{ color: p.textMuted }}>
                    {hoursShort ? "Voir le détail" : "à confirmer"}
                  </span>
                </div>
                <div
                  className="flex flex-col items-center gap-1 p-1.5 rounded-lg min-w-0"
                  style={{ background: p.surfaceHigh }}
                >
                  <span
                    className="flex items-center gap-1 text-[11px] font-medium uppercase"
                    style={{ color: p.primary }}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {restaurant.city}
                  </span>
                  <span className="text-[15px] font-semibold truncate max-w-full">
                    {restaurant.address ?? "Adresse"}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 p-1.5 min-w-0">
                  <span className="flex items-center gap-1" style={{ color: p.primary }}>
                    <Star className="w-4 h-4" fill="currentColor" />
                    <span className="text-[15px] font-bold" style={{ color: p.text }}>
                      {rating ? rating.toFixed(1) : "Nouveau"}
                    </span>
                  </span>
                  <span className="text-[11px]" style={{ color: p.textMuted }}>
                    {reviews.length > 0 ? `${reviews.length} avis` : "Soyez le premier"}
                  </span>
                </div>
              </div>
            </section>

            {/* Signatures */}
            {signatures.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex items-end justify-between">
                  <div>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: p.primary }}
                    >
                      À ne pas manquer
                    </span>
                    <h2 className="text-[28px] leading-9 font-medium" style={serif}>
                      Nos plats
                    </h2>
                  </div>
                  <a
                    href={buildViewHref("menu")}
                    className="text-[12px] font-semibold flex items-center gap-1"
                    style={{ color: p.primary }}
                  >
                    Tout voir <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="std-snap flex gap-4 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory">
                  {signatures.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setOpenDish(d)}
                      className="snap-start shrink-0 w-[270px] rounded-2xl overflow-hidden shadow-lg text-left flex flex-col"
                      style={{ background: p.surfaceHigh }}
                    >
                      <div
                        className="relative h-44 w-full overflow-hidden"
                        style={{ background: p.surface }}
                      >
                        {d.image_url ? (
                          <StorageImage
                            path={d.image_url}
                            alt={d.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full grid place-items-center"
                            style={{
                              color: p.primary,
                              background: `linear-gradient(135deg, ${p.surface}, ${p.surfaceHigh})`,
                            }}
                          >
                            <UtensilsCrossed className="w-9 h-9 opacity-60" />
                          </div>
                        )}
                        <span
                          className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full text-[15px] font-bold backdrop-blur-md"
                          style={{ background: `${p.bg}d9`, color: p.primary }}
                        >
                          {fmtPrice(d.price)}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-1">
                        <h3 className="text-[17px] font-semibold leading-snug">{d.name}</h3>
                        {d.description && (
                          <p
                            className="text-[13px] leading-5 line-clamp-2"
                            style={{ color: p.textMuted }}
                          >
                            {d.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Carte WhatsApp */}
            {wa && (
              <section
                className="rounded-2xl p-6 shadow-xl flex flex-col gap-3"
                style={{ background: p.surfaceHigh }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-full grid place-items-center"
                    style={{ background: "rgba(37,211,102,0.18)", color: "#25D366" }}
                  >
                    <MessageCircle className="w-[18px] h-[18px]" />
                  </span>
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: "#25D366" }}
                  >
                    WhatsApp
                  </span>
                </div>
                <h3 className="text-[22px] leading-[30px] font-medium" style={serif}>
                  Une question ou une commande ?
                </h3>
                <p className="text-[13px] leading-5" style={{ color: p.textMuted }}>
                  Écrivez-nous directement, nous vous répondons rapidement.
                </p>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="std-press mt-1 min-h-[48px] px-6 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 text-white"
                  style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Discuter sur WhatsApp
                </a>
              </section>
            )}
          </>
        )}

        {/* ============ LA CARTE ============ */}
        {activeView === "menu" && <MenuView menu={menu} p={p} serif={serif} onOpen={setOpenDish} />}

        {/* ============ RÉSERVER ============ */}
        {activeView === "reserve" && (
          <section className="flex flex-col gap-5">
            <div>
              <span
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: p.primary }}
              >
                Réservation
              </span>
              <h1 className="text-[30px] leading-9 font-semibold" style={serif}>
                Réservez votre table
              </h1>
            </div>
            {canReserve ? (
              <div className="rounded-2xl p-4 sm:p-5" style={{ background: p.surface }}>
                <AdvancedReservationForm
                  restaurantId={restaurant.id}
                  restaurantName={restaurant.name}
                  theme={theme}
                  waLink={wa}
                />
              </div>
            ) : (
              <p className="text-[14px]" style={{ color: p.textMuted }}>
                La réservation en ligne n'est pas disponible pour le moment.
              </p>
            )}
          </section>
        )}

        {/* ============ AVIS & GALERIE ============ */}
        {activeView === "reviews" && (
          <section className="flex flex-col gap-8">
            <div>
              <span
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: p.primary }}
              >
                Ils en parlent
              </span>
              <h1 className="text-[30px] leading-9 font-semibold" style={serif}>
                Avis & galerie
              </h1>
            </div>
            {gallery.length > 0 && <GalleryGrid gallery={gallery} theme={theme} />}
            <ReviewList reviews={reviews} theme={theme} />
            <div className="rounded-2xl p-4 sm:p-5" style={{ background: p.surface }}>
              <h3 className="text-[20px] font-medium mb-4" style={serif}>
                Laissez votre avis
              </h3>
              <ReviewForm restaurantId={restaurant.id} theme={theme} />
            </div>
          </section>
        )}

        {/* ============ CONTACT / À PROPOS ============ */}
        {activeView === "about" && (
          <section className="flex flex-col gap-5">
            <div>
              <span
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: p.primary }}
              >
                L'esprit du lieu
              </span>
              <h1 className="text-[30px] leading-9 font-semibold" style={serif}>
                {restaurant.name}
              </h1>
            </div>
            {restaurant.description && (
              <p className="text-[15px] leading-6" style={{ color: p.textMuted }}>
                {restaurant.description}
              </p>
            )}
            <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: p.surface }}>
              {restaurant.address && (
                <InfoRow p={p} icon={<MapPin className="w-[18px] h-[18px]" />} label="Adresse">
                  {restaurant.address}, {restaurant.city}
                </InfoRow>
              )}
              {hours && (
                <InfoRow p={p} icon={<Clock className="w-[18px] h-[18px]" />} label="Horaires">
                  <span className="whitespace-pre-line">{hours}</span>
                </InfoRow>
              )}
              <InfoRow p={p} icon={<Phone className="w-[18px] h-[18px]" />} label="Téléphone">
                <a href={`tel:${restaurant.phone}`} className="underline underline-offset-2">
                  {restaurant.phone}
                </a>
              </InfoRow>
              <InfoRow p={p} icon={<Mail className="w-[18px] h-[18px]" />} label="E-mail">
                <a
                  href={`mailto:${restaurant.email}`}
                  className="underline underline-offset-2 break-all"
                >
                  {restaurant.email}
                </a>
              </InfoRow>
            </div>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="std-press min-h-[48px] px-6 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 text-white"
                style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
              >
                <MessageCircle className="w-5 h-5" />
                Commander sur WhatsApp
              </a>
            )}
          </section>
        )}

        {/* FOOTER */}
        <footer
          className="rounded-2xl p-5 text-center text-[11px] flex flex-col gap-1"
          style={{ background: p.surface, color: p.textMuted }}
        >
          <span>
            © {new Date().getFullYear()} {restaurant.name}. Tous droits réservés.
          </span>
          <span>
            Site propulsé par{" "}
            <a href="/" className="underline" style={{ color: p.primary }}>
              RestoBF
            </a>
          </span>
        </footer>
      </main>

      <BottomNav p={p} active={activeView} canReserve={canReserve} />
      {openDish && <DishModal dish={openDish} theme={theme} onClose={() => setOpenDish(null)} />}
    </div>
  );
}

/* ---------- Sous-composants ---------- */

function InfoRow({
  p,
  icon,
  label,
  children,
}: {
  p: StdPalette;
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="w-9 h-9 rounded-full grid place-items-center shrink-0"
        style={{ background: p.surfaceHigh, color: p.primary }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: p.textMuted }}
        >
          {label}
        </div>
        <div className="text-[14px] leading-5">{children}</div>
      </div>
    </div>
  );
}

function MenuView({
  menu,
  p,
  serif,
  onOpen,
}: {
  menu: PublicMenuItem[];
  p: StdPalette;
  serif: React.CSSProperties;
  onOpen: (d: PublicMenuItem) => void;
}) {
  const [cat, setCat] = React.useState("all");
  const [q, setQ] = React.useState("");
  const categories = Array.from(new Set(menu.filter((m) => m.available).map((m) => m.category)));
  const filtered = menu.filter((m) => {
    if (!m.available) return false;
    if (cat !== "all" && m.category !== cat) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return m.name.toLowerCase().includes(s) || (m.description ?? "").toLowerCase().includes(s);
  });
  const groups = groupByCategory(filtered);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: p.primary }}
        >
          La carte
        </span>
        <h1 className="text-[30px] leading-9 font-semibold" style={serif}>
          Notre menu
        </h1>
      </div>

      {menu.length === 0 ? (
        <p className="text-[14px]" style={{ color: p.textMuted }}>
          Le menu sera très bientôt disponible.
        </p>
      ) : (
        <>
          <div
            className="sticky top-16 z-30 -mx-5 px-5 py-2.5 backdrop-blur-xl flex flex-col gap-2"
            style={{ background: `${p.bg}e6` }}
          >
            <div className="relative">
              <Search
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: p.textMuted }}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un plat, une boisson…"
                className="w-full pl-10 pr-4 py-2.5 rounded-full text-[14px] outline-none"
                style={{ background: p.surface, color: p.text, border: `1px solid ${p.border}` }}
              />
            </div>
            <div className="std-snap flex gap-2 overflow-x-auto pb-1">
              {["all", ...categories].map((c) => {
                const on = cat === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className="std-press shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide"
                    style={{
                      background: on ? p.primary : p.surfaceHigh,
                      color: on ? p.primaryInk : p.text,
                    }}
                  >
                    {c === "all" ? "Tous" : c}
                  </button>
                );
              })}
            </div>
          </div>

          {groups.length === 0 && (
            <p className="text-[14px]" style={{ color: p.textMuted }}>
              Aucun plat ne correspond à votre recherche.
            </p>
          )}

          {groups.map(([category, items]) => (
            <div key={category} className="flex flex-col gap-4">
              <h2 className="text-[22px] font-medium pt-2" style={serif}>
                {category}
              </h2>
              {items.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onOpen(d)}
                  className="text-left rounded-2xl p-4 shadow-lg flex flex-col"
                  style={{ background: p.surface }}
                >
                  {d.image_url && (
                    <div
                      className="relative w-full h-48 rounded-xl overflow-hidden mb-3.5"
                      style={{ background: p.surfaceHigh }}
                    >
                      <StorageImage
                        path={d.image_url}
                        alt={d.name}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full text-[16px] font-semibold backdrop-blur-md"
                        style={{ background: `${p.bg}e6`, color: p.primary }}
                      >
                        {fmtPrice(d.price)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[19px] font-medium leading-snug" style={serif}>
                      {d.name}
                    </h3>
                    {!d.image_url && (
                      <span
                        className="text-[15px] font-semibold whitespace-nowrap"
                        style={{ color: p.primary }}
                      >
                        {fmtPrice(d.price)}
                      </span>
                    )}
                  </div>
                  {d.description && (
                    <p className="text-[13px] leading-5 mt-1" style={{ color: p.textMuted }}>
                      {d.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ))}
        </>
      )}
    </section>
  );
}

function BottomNav({
  p,
  active,
  canReserve,
}: {
  p: StdPalette;
  active: View;
  canReserve: boolean;
}) {
  const item = (view: View, label: string, icon: React.ReactNode) => {
    const on = active === view;
    return (
      <a
        key={view}
        href={buildViewHref(view)}
        aria-current={on ? "page" : undefined}
        className="flex flex-col items-center justify-center w-16 h-full gap-0.5 text-[11px] font-medium transition-colors"
        style={{ color: on ? p.primary : p.textMuted }}
      >
        {icon}
        {label}
      </a>
    );
  };
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl"
      style={{
        background: `${p.bg}d9`,
        boxShadow: p.light ? "0 -1px 0 rgba(0,0,0,0.06)" : "0 -1px 8px rgba(0,0,0,0.2)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="max-w-3xl mx-auto h-20 px-1 flex items-center justify-around">
        {item("home", "Accueil", <Home className="w-[22px] h-[22px]" />)}
        {item("menu", "La carte", <UtensilsCrossed className="w-[22px] h-[22px]" />)}
        {canReserve ? (
          <a href={buildViewHref("reserve")} className="flex flex-col items-center -mt-5 group">
            <span
              className="w-14 h-14 rounded-full grid place-items-center group-active:scale-95 transition-transform"
              style={{
                background: p.container,
                color: p.containerInk,
                boxShadow: "0 12px 28px -8px rgba(0,0,0,0.35)",
              }}
            >
              <CalendarDays className="w-[26px] h-[26px]" />
            </span>
            <span className="text-[11px] font-semibold mt-1" style={{ color: p.primary }}>
              Réserver
            </span>
          </a>
        ) : (
          <span className="w-16" />
        )}
        {item("reviews", "Avis", <Camera className="w-[22px] h-[22px]" />)}
        {item("about", "Contact", <Phone className="w-[22px] h-[22px]" />)}
      </div>
    </nav>
  );
}
