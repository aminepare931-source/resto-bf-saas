const PROJECT_ID = "7026f809-5121-4b45-95b2-1e33d36539a6";
const STABLE_PUBLISHED = `https://project--${PROJECT_ID}.lovable.app`;

/**
 * Returns the URL clients should reach for the public restaurant site.
 * Priority: explicit per-restaurant override → VITE_PUBLIC_SITE_URL → stable
 * Lovable production URL. The window.location fallback only kicks in when
 * none of those are usable, so QR codes never encode the preview host.
 */
export function getPublicSiteOrigin(restaurantOverride?: string | null): string {
  const override = (restaurantOverride ?? "").trim();
  if (override) return override.replace(/\/$/, "");

  const env = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const looksLikePreview =
      host.startsWith("id-preview--") ||
      host.startsWith("preview--") ||
      host.endsWith("lovableproject.com") ||
      host.endsWith("lovableproject-dev.com");
    if (!looksLikePreview && host !== "localhost") return window.location.origin;
  }
  return STABLE_PUBLISHED;
}

export function buildRestaurantUrl(slug: string, table?: string | null, override?: string | null) {
  const base = getPublicSiteOrigin(override);
  const u = new URL(`/r/${slug}`, base);
  if (table) u.searchParams.set("table", table);
  return u.toString();
}