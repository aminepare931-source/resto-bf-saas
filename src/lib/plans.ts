import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { FEATURE_REGISTRY } from "@/lib/features";

/**
 * Source unique des droits par forfait.
 * - Le super admin édite la table `plan_features` (onglet « Fonctionnalités »).
 * - Le site et le dashboard lisent cette même table via `usePlanAccess`.
 * - FALLBACK_FEATURE_PLANS ne sert que si la table est vide ou injoignable.
 */

export type PlanKey = "basique" | "standard" | "premium";

export const PLAN_RANK: Record<PlanKey, number> = { basique: 0, standard: 1, premium: 2 };

/** Plan en base (trial, gratuit, sur_mesure…) → forfait de droits. */
export function planKey(plan?: string | null): PlanKey {
  if (plan === "premium" || plan === "sur_mesure") return "premium";
  if (plan === "standard" || plan === "trial") return "standard";
  return "basique"; // basique, gratuit (legacy), inconnu
}

/** Statuts d'abonnement qui coupent le site public. */
export const OFFLINE_STATUSES = ["expired", "suspended", "cancelled"] as const;

export function isSiteOffline(status?: string | null): boolean {
  return !!status && (OFFLINE_STATUSES as readonly string[]).includes(status);
}

/* ---------------- Templates ---------------- */

/** Niveau minimal de forfait requis pour un template. */
export function templateTier(templateId?: string | null): PlanKey {
  const id = templateId ?? "";
  if (id.startsWith("prem-") || id === "premium") return "premium";
  if (id.startsWith("std-") || ["soleil", "savane", "marche", "moderne", "nuit"].includes(id)) {
    return "standard";
  }
  return "basique";
}

/** Niveaux de templates autorisés d'après les cases cochées (template-basique/standard/premium). */
export function allowedTemplateTiers(has: (id: string) => boolean): PlanKey[] {
  const tiers: PlanKey[] = [];
  if (has("template-basique")) tiers.push("basique");
  if (has("template-standard")) tiers.push("standard");
  if (has("template-premium")) tiers.push("premium");
  return tiers;
}

/** Template affiché : celui choisi s'il est autorisé par les cases cochées, sinon le meilleur autorisé. */
export function effectiveTemplateFor(
  has: (id: string) => boolean,
  template?: string | null,
): string {
  const tiers = allowedTemplateTiers(has);
  if (template && tiers.includes(templateTier(template))) return template;
  if (tiers.includes("premium")) return "prem-royal";
  if (tiers.includes("standard")) return "std-soleil";
  return "gratuit-classique";
}

export function defaultTemplateFor(plan?: string | null): string {
  const k = planKey(plan);
  if (k === "premium") return "prem-royal";
  if (k === "standard") return "std-soleil";
  return "gratuit-classique";
}

/**
 * Template réellement affiché : celui choisi en base, sauf s'il dépasse le forfait
 * (alors on retombe sur le meilleur template autorisé).
 */
export function effectiveTemplate(plan?: string | null, template?: string | null): string {
  if (!template) return defaultTemplateFor(plan);
  return PLAN_RANK[templateTier(template)] <= PLAN_RANK[planKey(plan)]
    ? template
    : defaultTemplateFor(plan);
}

/* ---------------- Fonctionnalités ---------------- */

export type PlanFeatureRow = { slug: string | null; plans: string[] };

/** Valeurs de secours (réglages par défaut du registre) si la table est vide ou injoignable. */
export const FALLBACK_FEATURE_PLANS: Record<string, PlanKey[]> = Object.fromEntries(
  FEATURE_REGISTRY.map((f) => [f.id, f.defaultPlans]),
);

export function featureEnabled(
  rows: PlanFeatureRow[] | null,
  featureId: string,
  plan?: string | null,
): boolean {
  const k = planKey(plan);
  const row = rows?.find((r) => r.slug === featureId);
  if (row) return row.plans.includes(k);
  return FALLBACK_FEATURE_PLANS[featureId]?.includes(k) ?? false;
}

/** Nombre max de plats selon les cases cochées (la plus généreuse l'emporte). */
export function menuLimit(has: (id: string) => boolean): number {
  if (has("menu-illimite")) return Number.POSITIVE_INFINITY;
  if (has("menu-30-plats")) return 30;
  return 10;
}

/** Nombre max de photos en galerie. */
export function galleryPhotoLimit(has: (id: string) => boolean): number {
  return has("galerie-illimitee") ? Number.POSITIVE_INFINITY : 12;
}

export const GALLERY_VIDEO_LIMIT = 6;

/* Cache module : une seule requête partagée par tous les composants. */
let cache: PlanFeatureRow[] | null = null;
let inflight: Promise<PlanFeatureRow[] | null> | null = null;
const listeners = new Set<() => void>();

async function fetchPlanFeatures(force = false): Promise<PlanFeatureRow[] | null> {
  if (!force && cache) return cache;
  if (!inflight) {
    inflight = (async () => {
      const { data, error } = await supabase.from("plan_features" as never).select("slug, plans");
      inflight = null;
      if (error || !data) return cache; // on garde les valeurs de secours
      cache = data as unknown as PlanFeatureRow[];
      listeners.forEach((l) => l());
      return cache;
    })();
  }
  return inflight;
}

/** À appeler après modification dans le super admin pour rafraîchir. */
export function invalidatePlanFeatures() {
  cache = null;
  void fetchPlanFeatures(true);
}

export function usePlanAccess(plan?: string | null) {
  const [rows, setRows] = React.useState<PlanFeatureRow[] | null>(cache);
  const [loading, setLoading] = React.useState(!cache);

  React.useEffect(() => {
    let alive = true;
    const sync = () => alive && setRows(cache);
    listeners.add(sync);
    void fetchPlanFeatures().then(() => {
      if (!alive) return;
      setRows(cache);
      setLoading(false);
    });
    return () => {
      alive = false;
      listeners.delete(sync);
    };
  }, []);

  const has = React.useCallback(
    (featureId: string) => featureEnabled(rows, featureId, plan),
    [rows, plan],
  );
  const hasAny = React.useCallback((ids: string[]) => ids.some((id) => has(id)), [has]);

  return { has, hasAny, loading, plan: planKey(plan) };
}
