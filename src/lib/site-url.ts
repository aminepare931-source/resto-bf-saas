/**
 * Returns the URL clients should reach for the public restaurant site.
 * Priority: explicit per-restaurant override → VITE_PUBLIC_SITE_URL → current
 * browser origin. Never encodes a hardcoded host, so QR codes always match
 * wherever the site is actually deployed.
 */
export function getPublicSiteOrigin(restaurantOverride?: string | null): string {
  const override = (restaurantOverride ?? "").trim();
  if (override) return override.replace(/\/$/, "");

  const env = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/$/, "");

  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function buildRestaurantUrl(slug: string, table?: string | null, override?: string | null) {
  const base = getPublicSiteOrigin(override);
  const path = `/${slug}`;
  if (!base) {
    // No origin resolvable (SSR without env): return a relative URL rather than throw.
    return table ? `${path}?table=${encodeURIComponent(table)}` : path;
  }
  const u = new URL(path, base);
  if (table) u.searchParams.set("table", table);
  return u.toString();
}
