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
import { usePlanAccess } from "@/lib/plans";
import { StorageImage } from "@/components/StorageImage";
import { StorageVideo } from "@/components/StorageVideo";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Clock,
  Home,
  MapPin,
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

function inkFor(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#1b1b1b" : "#ffffff";
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function StdTemplate({
  palette: basePalette,
  ...props
}: TemplateProps & { palette: StdPalette }) {
  // Couleur principale choisie par le restaurant (si son forfait l'autorise)
  const brand = props.restaurant.primary_color;
  const p: StdPalette =
    brand && HEX.test(brand)
      ? {
          ...basePalette,
          primary: brand,
          primaryInk: inkFor(brand),
          container: brand,
          containerInk: inkFor(brand),
        }
      : basePalette;
  const brandFont = props.restaurant.font_family?.trim() || null;
  const { restaurant, menu, reviews, gallery } = props;
  const videos = props.videos ?? [];
  const theme = toTheme(p);
  const wa = buildWhatsAppLink(restaurant.whatsapp, restaurant.name);
  const { hasAny } = usePlanAccess(restaurant.plan);
  const canReserve = hasAny(["reservations-basiques", "reservations-avancees"]);
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

  const serif: React.CSSProperties = {
    fontFamily: brandFont ? `'${brandFont}', serif` : "'Playfair Display', serif",
  };
  const categoryTiles = groupByCategory(available).map(([name, items]) => ({
    name,
    count: items.length,
    image: items.find((i) => i.image_url)?.image_url ?? null,
  }));
  const aboutImage = gallery[1]?.image_url ?? gallery[0]?.image_url ?? null;
  const socials = (
    [
      ["Facebook", restaurant.social_links?.facebook],
      ["Instagram", restaurant.social_links?.instagram],
      ["TikTok", restaurant.social_links?.tiktok],
    ] as [string, string | undefined][]
  ).filter(([, url]) => !!url && /^https?:\/\//.test(url as string)) as [string, string][];
  const hours = restaurant.hours?.trim() || null;
  const hoursShort = hours ? hours.split("\n")[0] : null;

  return (
    <div
      className="min-h-screen pb-28"
      style={{
        background: p.bg,
        color: p.text,
        fontFamily: brandFont
          ? `'${brandFont}', 'Plus Jakarta Sans', sans-serif`
          : "'Plus Jakarta Sans', sans-serif",
        isolation: "isolate",
      }}
    >
      <link rel="stylesheet" href={FONTS} />
      {brandFont && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(brandFont).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`}
        />
      )}
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
                    {restaurant.hero_title?.trim() || restaurant.name}
                  </h1>
                  <p
                    className="text-[15px] leading-relaxed max-w-xs"
                    style={{ color: "rgba(255,255,255,0.82)" }}
                  >
                    {restaurant.hero_subtitle?.trim() ||
                      (restaurant.description ?? `Cuisine à découvrir à ${restaurant.city}.`)}
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

            {/* Catégories */}
            {categoryTiles.length > 0 && (
              <section className="flex flex-col gap-4">
                <SectionTitle
                  p={p}
                  serif={serif}
                  kicker="Explorer"
                  title="La carte en un coup d'œil"
                />
                <div className="grid grid-cols-2 gap-3">
                  {categoryTiles.map((c) => (
                    <a
                      key={c.name}
                      href={buildViewHref("menu")}
                      className="std-press relative h-28 rounded-2xl overflow-hidden flex items-end p-3.5 shadow-md"
                      style={{ background: p.surfaceHigh }}
                    >
                      {c.image && (
                        <StorageImage
                          path={c.image}
                          alt={c.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <span
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to top, rgba(${p.scrim},0.88), rgba(${p.scrim},0.15))`,
                        }}
                      />
                      <span className="relative leading-tight">
                        <span className="block text-[15px] font-semibold text-white">{c.name}</span>
                        <span
                          className="block text-[11px]"
                          style={{ color: "rgba(255,255,255,0.75)" }}
                        >
                          {c.count} {c.count > 1 ? "plats" : "plat"}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* L'esprit du lieu */}
            <section
              className="flex flex-col gap-4 rounded-2xl p-5 shadow-md"
              style={{ background: p.surface }}
            >
              <SectionTitle
                p={p}
                serif={serif}
                kicker="L'esprit du lieu"
                title={`Bienvenue chez ${restaurant.name}`}
              />
              {aboutImage && (
                <div
                  className="relative w-full h-52 rounded-xl overflow-hidden"
                  style={{ background: p.surfaceHigh }}
                >
                  <StorageImage
                    path={aboutImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-[15px] leading-6" style={{ color: p.textMuted }}>
                {restaurant.about_text?.trim() ||
                  restaurant.description ||
                  `${restaurant.name} vous accueille à ${restaurant.city}${
                    restaurant.cuisine ? ` pour une cuisine ${restaurant.cuisine}` : ""
                  }. Venez partager un bon moment, sur place ou à emporter.`}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-3.5 flex flex-col gap-1"
                  style={{ background: p.surfaceHigh }}
                >
                  <UtensilsCrossed className="w-6 h-6" style={{ color: p.primary }} />
                  <span className="text-[17px] font-semibold">{available.length} plats</span>
                  <span className="text-[12px]" style={{ color: p.textMuted }}>
                    {categoryTiles.length} {categoryTiles.length > 1 ? "catégories" : "catégorie"}
                  </span>
                </div>
                <div
                  className="rounded-xl p-3.5 flex flex-col gap-1"
                  style={{ background: p.surfaceHigh }}
                >
                  <Star className="w-6 h-6" style={{ color: p.primary }} fill="currentColor" />
                  <span className="text-[17px] font-semibold">
                    {rating ? `${rating.toFixed(1)} / 5` : "Nouveau"}
                  </span>
                  <span className="text-[12px]" style={{ color: p.textMuted }}>
                    {reviews.length > 0
                      ? `${reviews.length} avis clients`
                      : "Aucun avis pour l'instant"}
                  </span>
                </div>
              </div>
            </section>

            {/* Galerie */}
            {gallery.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex items-end justify-between">
                  <SectionTitle p={p} serif={serif} kicker="Galerie" title="Notre univers" />
                  <a
                    href={buildViewHref("reviews")}
                    className="text-[12px] font-semibold flex items-center gap-1 pb-1"
                    style={{ color: p.primary }}
                  >
                    Voir tout <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {gallery.slice(0, 6).map((g, i) => (
                    <div
                      key={g.id}
                      className={`overflow-hidden rounded-xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                      style={{ background: p.surfaceHigh, aspectRatio: "1 / 1" }}
                    >
                      <StorageImage
                        path={g.image_url}
                        alt={g.caption ?? restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Vidéos */}
            {videos.length > 0 && (
              <section className="flex flex-col gap-4">
                <SectionTitle p={p} serif={serif} kicker="En vidéo" title="Découvrez-nous" />
                <div className="flex flex-col gap-3">
                  {videos.slice(0, 3).map((v) => (
                    <StorageVideo
                      key={v.id}
                      path={v.image_url}
                      className="w-full aspect-video rounded-2xl bg-black"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Avis */}
            {reviews.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex items-end justify-between">
                  <SectionTitle
                    p={p}
                    serif={serif}
                    kicker="Ils en parlent"
                    title="Avis de nos clients"
                  />
                  <a
                    href={buildViewHref("reviews")}
                    className="text-[12px] font-semibold flex items-center gap-1 pb-1"
                    style={{ color: p.primary }}
                  >
                    Tous les avis <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="std-snap flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory">
                  {reviews.slice(0, 5).map((r) => (
                    <article
                      key={r.id}
                      className="snap-start shrink-0 w-[260px] rounded-2xl p-4 flex flex-col gap-2.5 shadow-md"
                      style={{ background: p.surface }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-9 h-9 rounded-full grid place-items-center font-bold"
                          style={{ background: p.container, color: p.containerInk }}
                        >
                          {r.author_name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold truncate">{r.author_name}</div>
                          <div className="text-[12px]" style={{ color: p.primary }}>
                            {"★".repeat(r.rating)}
                            <span style={{ opacity: 0.25 }}>{"★".repeat(5 - r.rating)}</span>
                          </div>
                        </div>
                      </div>
                      {r.comment && (
                        <p
                          className="text-[13px] leading-5 line-clamp-4"
                          style={{ color: p.textMuted }}
                        >
                          « {r.comment} »
                        </p>
                      )}
                      {r.owner_reply && (
                        <p
                          className="text-[12px] leading-5 pl-2.5 line-clamp-3"
                          style={{ borderLeft: `2px solid ${p.primary}`, color: p.textMuted }}
                        >
                          <strong style={{ color: p.primary }}>Réponse : </strong>
                          {r.owner_reply}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Infos pratiques */}
            <section
              className="flex flex-col gap-4 rounded-2xl p-5 shadow-md"
              style={{ background: p.surface }}
            >
              <SectionTitle p={p} serif={serif} kicker="Infos pratiques" title="Nous trouver" />
              <div className="flex flex-col gap-4">
                {(restaurant.address || restaurant.city) && (
                  <InfoRow p={p} icon={<MapPin className="w-[18px] h-[18px]" />} label="Adresse">
                    {[restaurant.address, restaurant.city].filter(Boolean).join(", ")}
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
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [restaurant.name, restaurant.address, restaurant.city].filter(Boolean).join(" "),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="std-press min-h-[46px] rounded-full font-semibold text-[14px] flex items-center justify-center gap-2"
                style={{ background: p.surfaceHigh, color: p.primary }}
              >
                <MapPin className="w-[18px] h-[18px]" />
                Voir l'itinéraire
              </a>
            </section>

            {/* Bannière réservation */}
            {canReserve && (
              <section
                className="rounded-2xl p-6 flex flex-col gap-3 items-start shadow-xl"
                style={{ background: p.container, color: p.containerInk }}
              >
                <CalendarDays className="w-7 h-7" />
                <h3 className="text-[24px] leading-8 font-semibold" style={serif}>
                  Une table vous attend
                </h3>
                <a
                  href={buildViewHref("reserve")}
                  className="std-press min-h-[46px] px-6 rounded-full font-semibold text-[14px] flex items-center gap-2"
                  style={{ background: p.containerInk, color: p.container }}
                >
                  Réserver maintenant <ArrowRight className="w-4 h-4" />
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
            {videos.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {videos.map((v) => (
                  <StorageVideo
                    key={v.id}
                    path={v.image_url}
                    className="w-full aspect-video rounded-2xl bg-black"
                  />
                ))}
              </div>
            )}
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
          </section>
        )}

        {/* FOOTER */}
        <footer
          className="rounded-2xl p-5 text-center text-[11px] flex flex-col gap-1"
          style={{ background: p.surface, color: p.textMuted }}
        >
          {socials.length > 0 && (
            <div className="flex justify-center gap-4 mb-1 text-[12px] font-semibold">
              {socials.map(([label, url]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: p.primary }}
                >
                  {label}
                </a>
              ))}
            </div>
          )}
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

      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Écrire sur WhatsApp"
          className="fixed right-4 bottom-24 z-50 w-14 h-14 rounded-full grid place-items-center text-white shadow-2xl hover:scale-105 active:scale-95 transition"
          style={{ background: "#25D366", boxShadow: "0 6px 20px rgba(37,211,102,0.4)" }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
          </svg>
        </a>
      )}
      <BottomNav p={p} active={activeView} canReserve={canReserve} />
      {openDish && <DishModal dish={openDish} theme={theme} onClose={() => setOpenDish(null)} />}
    </div>
  );
}

/* ---------- Sous-composants ---------- */

function SectionTitle({
  p,
  serif,
  kicker,
  title,
}: {
  p: StdPalette;
  serif: React.CSSProperties;
  kicker: string;
  title: string;
}) {
  return (
    <div>
      <span
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: p.primary }}
      >
        {kicker}
      </span>
      <h2 className="text-[26px] leading-8 font-medium" style={serif}>
        {title}
      </h2>
    </div>
  );
}

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
