import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

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

/** Valeurs de secours (reprennent les réglages par défaut du super admin). */
export const FALLBACK_FEATURE_PLANS: Record<string, PlanKey[]> = {
  "reservations-basiques": ["basique"],
  "reservations-avancees": ["standard", "premium"],
  "galerie-photos": ["standard", "premium"],
  "galerie-illimitee": ["premium"],
  "avis-clients": ["standard", "premium"],
  "facturation-pdf": ["standard"],
  "facturation-logo": ["premium"],
  "facture-auto": ["premium"],
  devis: ["premium"],
  "gestion-employes": ["premium"],
  "gestion-stocks": ["standard", "premium"],
  "chat-interne": ["standard", "premium"],
  "messagerie-whatsapp": ["standard", "premium"],
  "plan-salle": ["standard", "premium"],
  "personnalisation-couleurs": ["standard", "premium"],
};

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
