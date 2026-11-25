import type { PlanKey } from "@/lib/plans";

/**
 * Catalogue unique des templates de site public.
 *
 * Le dashboard (/dashboard/templates) et le choix à l'inscription (/auth/choisir-template)
 * lisent tous les deux cette liste : un template ajouté ou renommé ici apparaît partout.
 * Le rendu réel d'un template est dans components/public/render-template.tsx, et le
 * niveau de forfait requis est celui du champ `tier` (voir aussi templateTier dans plans.ts).
 */

export type TemplateEntry = {
  id: string;
  name: string;
  tagline: string;
  /** Forfait minimal conseillé ; l'accès réel dépend des cases cochées du forfait. */
  tier: PlanKey;
  /** Fond de la vignette (valeur CSS `background`). */
  vibe: string;
  features: string[];
};

const PREMIUM_FEU_BG = "/premium-bgs/premium-feu-bg.webp";
const PREMIUM_ROYAL_BG = "/premium-bgs/premium-royal-bg.webp";
const PREMIUM_GRILL_BG = "/premium-bgs/premium-grill-bg.webp";
const PREMIUM_PASTA_BG = "/premium-bgs/premium-pasta-bg.webp";

export const TEMPLATE_CATALOG: TemplateEntry[] = [
  {
    id: "prem-royal",
    name: "Palais Royal",
    tagline: "Atmosphère prestige, Or & Ébène",
    tier: "premium",
    vibe: `url(${PREMIUM_ROYAL_BG}) center/cover`,
    features: ["Bannière prestige", "Réservation VIP", "Carte des vins", "QR Code intégré"],
  },
  {
    id: "prem-nuit",
    name: "Aurum Nuit",
    tagline: "Fine dining sombre & luxueux",
    tier: "premium",
    vibe: `url(${PREMIUM_PASTA_BG}) center/cover`,
    features: ["Carte curatée", "Avis clients", "Galerie HD", "Ambiance feutrée"],
  },
  {
    id: "prem-feu",
    name: "Ignis Feu & Grillades",
    tagline: "Braises flamboyantes & Maquis",
    tier: "premium",
    vibe: `url(${PREMIUM_FEU_BG}) center/cover`,
    features: ["Spécial Maquis & Grill", "Poulet Bicyclette", "Commande WhatsApp", "Effets braises"],
  },
  {
    id: "prem-luxe",
    name: "Luxe Grill & Lounge",
    tagline: "Table d'honneur & événements",
    tier: "premium",
    vibe: `url(${PREMIUM_GRILL_BG}) center/cover`,
    features: ["Espace VIP", "Commandes QR", "Traiteur & Fêtes", "Galerie immersive"],
  },
  {
    id: "std-soleil",
    name: "Soleil Chaleureux",
    tagline: "Éditorial doré & solaire",
    tier: "standard",
    vibe: "linear-gradient(135deg, #fabc4d, #7e5700)",
    features: ["Couleurs solaires", "Menu structuré", "Module avis"],
  },
  {
    id: "std-savane",
    name: "Savane & Ocre",
    tagline: "Rustique africain authentique",
    tier: "standard",
    vibe: "linear-gradient(135deg, #e5a93c, #504535)",
    features: ["Teintes terre d'ocre", "Authentique", "Spécialités locales"],
  },
  {
    id: "std-marche",
    name: "Vert Terroir",
    tagline: "Vert émeraude & produits frais",
    tier: "standard",
    vibe: "linear-gradient(135deg, #49eb7b, #0d2818)",
    features: ["Vert émeraude", "Terroir & marché", "Affichage réactif"],
  },
  {
    id: "std-moderne",
    name: "Épuré",
    tagline: "Minimalisme contemporain",
    tier: "standard",
    vibe: "linear-gradient(135deg, #d4c4b0, #0b0f19)",
    features: ["Typographie nette", "Navigation fluide", "Adaptatif mobile"],
  },
  {
    id: "gratuit-classique",
    name: "Classique Swiss",
    tagline: "Minimalisme noir & blanc",
    tier: "basique",
    vibe: "linear-gradient(135deg, #1f1f2e, #0a0a0f)",
    features: ["Sobre & rapide", "Essentiel menu", "Inclus dans tous les forfaits"],
  },
];

export function templateEntry(id?: string | null): TemplateEntry | undefined {
  return TEMPLATE_CATALOG.find((t) => t.id === id);
}

export function templatesOfTier(tier: PlanKey): TemplateEntry[] {
  return TEMPLATE_CATALOG.filter((t) => t.tier === tier);
}
