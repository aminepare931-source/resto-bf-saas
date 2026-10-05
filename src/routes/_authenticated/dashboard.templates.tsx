import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { renderTemplate } from "@/components/public/templates";
import { demoData } from "@/components/public/demo-data";
import {
  Sparkles,
  Check,
  ExternalLink,
  Eye,
  Lock,
  Layers,
  Palette,
  ArrowRight,
  AlertTriangle,
  Crown,
  Save,
} from "lucide-react";

const PREMIUM_FEU_BG = "/premium-bgs/premium-feu-bg.png";
const PREMIUM_ROYAL_BG = "/premium-bgs/premium-royal-bg.jpg";
const PREMIUM_GRILL_BG = "/premium-bgs/premium-grill-bg.jpg";
const PREMIUM_PASTA_BG = "/premium-bgs/premium-pasta-bg.jpg";

export const Route = createFileRoute("/_authenticated/dashboard/templates")({
  component: DashboardTemplates,
});

type PlanTier = "basique" | "standard" | "premium";
type TplCategory = "tout" | "premium" | "standard" | "basique";

type Tpl = {
  id: string;
  name: string;
  tagline: string;
  plan: PlanTier;
  vibe: string;
  features: string[];
};

const templates: Tpl[] = [
  {
    id: "prem-royal",
    name: "Palais Royal",
    tagline: "Atmosphère prestige, Or & Ébène",
    plan: "premium",
    vibe: `url(${PREMIUM_ROYAL_BG}) center/cover`,
    features: ["Bannière prestige", "Réservation VIP", "Carte des vins", "QR Code intégré"],
  },
  {
    id: "prem-nuit",
    name: "Aurum Nuit",
    tagline: "Fine dining sombre & luxueux",
    plan: "premium",
    vibe: `url(${PREMIUM_PASTA_BG}) center/cover`,
    features: ["Carte curatée", "Avis clients", "Galerie HD", "Ambiance feutrée"],
  },
  {
    id: "prem-feu",
    name: "Ignis Feu & Grillades",
    tagline: "Braises flamboyantes & Maquis",
    plan: "premium",
    vibe: `url(${PREMIUM_FEU_BG}) center/cover`,
    features: [
      "Spécial Maquis & Grill",
      "Poulet Bicyclette",
      "Commande WhatsApp",
      "Effets braises",
    ],
  },
  {
    id: "prem-luxe",
    name: "Luxe Grill & Lounge",
    tagline: "Table d'honneur & événements",
    plan: "premium",
    vibe: `url(${PREMIUM_GRILL_BG}) center/cover`,
    features: ["Espace VIP", "Commandes QR", "Traiteur & Fêtes", "Galerie immersive"],
  },
  {
    id: "std-soleil",
    name: "Soleil Chaleureux",
    tagline: "Éditorial doré & solaire",
    plan: "standard",
    vibe: "linear-gradient(135deg, #fabc4d, #7e5700)",
    features: ["Couleurs solaires", "Menu structuré", "Module avis"],
  },
  {
    id: "std-savane",
    name: "Savane & Ocre",
    tagline: "Rustique africain authentique",
    plan: "standard",
    vibe: "linear-gradient(135deg, #e5a93c, #504535)",
    features: ["Teintes terre d'ocre", "Authentique", "Spécialités locales"],
  },
  {
    id: "std-marche",
    name: "Vert Terroir",
    tagline: "Vert émeraude & produits frais",
    plan: "standard",
    vibe: "linear-gradient(135deg, #49eb7b, #0d2818)",
    features: ["Vert émeraude", "Terroir & marché", "Affichage réactif"],
  },
  {
    id: "std-moderne",
    name: "Épuré",
    tagline: "Minimalisme contemporain",
    plan: "standard",
    vibe: "linear-gradient(135deg, #d4c4b0, #0b0f19)",
    features: ["Typography nette", "Navigation fluide", "Adaptatif mobile"],
  },
  {
    id: "gratuit-classique",
    name: "Classique Swiss",
    tagline: "Minimalisme noir & blanc",
    plan: "basique",
    vibe: "linear-gradient(135deg, #1f1f2e, #0a0a0f)",
    features: ["Sobre & rapide", "Essentiel menu", "100% Gratuit"],
  },
];

const planRank: Record<PlanTier, number> = { basique: 0, standard: 1, premium: 2 };

function planToTier(plan: string): PlanTier {
  if (plan === "premium" || plan === "sur_mesure") return "premium";
  if (plan === "standard" || plan === "trial") return "standard";
  return "basique";
}

function DashboardTemplates() {
  const navigate = useNavigate();
  const { restaurant: r } = useMyRestaurant();

  const [userPlan, setUserPlan] = useState<PlanTier>("basique");
  const [selected, setSelected] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return "";
    }
    return "";
  });
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TplCategory>("tout");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!r) return;
    setUserPlan(planToTier(r.plan));
    if (r.template) {
      setSelected(r.template);
      setLastSaved(r.template);
    }
  }, [r]);

  const selectTemplate = (id: string) => {
    setSelected(id);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const canPick = (p: PlanTier) => planRank[p] <= planRank[userPlan];

  const handleSave = async () => {
    if (!selected) return;
    const tpl = templates.find((t) => t.id === selected);
    if (!tpl) return;

    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();

      if (!u?.user?.id) {
        setSaving(false);
        toast.error("Session expirée — reconnectez-vous puis réessayez.");
        return;
      }

      const { error: mainError, data: mainData } = await supabase
        .from("restaurants")
        .update({ template: selected })
        .eq("user_id", u.user.id)
        .select("id");

      if (mainError) {
        setSaving(false);
        toast.error("Erreur lors de la sauvegarde : " + mainError.message);
        return;
      }

      if (!mainData || mainData.length === 0) {
        setSaving(false);
        toast.error("Aucun restaurant trouvé pour votre compte — la sauvegarde n'a pas pu s'appliquer.");
        return;
      }

      // Also update public_restaurants if exists (non bloquant : le site public
      // peut aussi lire directement depuis restaurants)
      if (r?.slug) {
        await supabase
          .from("public_restaurants" as never)
          .update({ template: selected } as never)
          .eq("slug", r.slug);
      }

      // Local storage update for instant reactivity across tabs/previews
      localStorage.setItem("restobf_selected_template", selected);
      if (r) {
        const updated = { ...r, template: selected };
        localStorage.setItem("restobf_current_restaurant", JSON.stringify(updated));
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("template-changed", { detail: selected }));

      setSaving(false);
      setLastSaved(selected);
      toast.success(`Template « ${tpl.name} » enregistré et publié sur votre site public !`);
    } catch (err: any) {
      setSaving(false);
      toast.error("Erreur lors de la sauvegarde : " + (err.message || "Impossible de sauvegarder"));
    }
  };

  const filteredTemplates = templates.filter((t) => {
    if (categoryFilter === "tout") return true;
    return t.plan === categoryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-8 rounded-3xl border border-terracotta/20 bg-gradient-to-r from-terracotta-tint/50 via-card to-amber-tint/60 shadow-xl">
        <div className="space-y-2 min-w-0">
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-terracotta-tint border border-terracotta/30 text-xs font-bold text-terracotta-deep">
            <Palette className="w-3.5 h-3.5 text-terracotta" />
            <span>Design & Identité Visuelle</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground">
            Galerie de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-amber-brand">
              Templates
            </span>
          </h1>

          <p className="hidden sm:block text-sm text-muted-foreground max-w-2xl">
            Personnalisez l'apparence de votre site web public en 1 clic. Chaque template est
            optimisé pour les téléphones, la commande WhatsApp et le scan de QR code sur table.
          </p>
        </div>

        {r?.slug && (
          <a
            href={`/${r.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-terracotta/40 bg-terracotta-tint text-terracotta-deep hover:bg-terracotta/20 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Voir mon site public</span>
          </a>
        )}
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border [&::-webkit-scrollbar]:hidden">
        {[
          { id: "tout", label: "Tous (9)" },
          { id: "premium", label: "Premium (4)" },
          { id: "standard", label: "Standard (4)" },
          { id: "basique", label: "Gratuit (1)" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id as TplCategory)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              categoryFilter === cat.id
                ? "bg-terracotta text-white shadow-sm"
                : "bg-surface-warm border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* TEMPLATE CARDS — groupés par catégorie, compacts sur mobile */}
      <div className="space-y-8">
        {(categoryFilter === "tout"
          ? [
              { key: "premium", label: "Premium", items: filteredTemplates.filter((t) => t.plan === "premium") },
              { key: "standard", label: "Standard", items: filteredTemplates.filter((t) => t.plan === "standard") },
              { key: "basique", label: "Gratuit", items: filteredTemplates.filter((t) => t.plan === "basique") },
            ]
          : [{ key: categoryFilter, label: "", items: filteredTemplates }]
        ).map(
          (group) =>
            group.items.length > 0 && (
              <div key={group.key}>
                {group.label && (
                  <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                    {group.label}
                  </h2>
                )}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {group.items.map((t) => {
                    const isSelected = selected === t.id;

                    return (
                      <div
                        key={t.id}
                        className={`rounded-2xl sm:rounded-3xl border-2 overflow-hidden bg-card transition-all flex flex-col justify-between group ${
                          isSelected
                            ? "border-terracotta shadow-lg shadow-terracotta/20"
                            : "border-border hover:border-terracotta/50 sm:hover:-translate-y-1"
                        }`}
                      >
                        {/* Card Banner Preview */}
                        <div
                          className="relative h-24 sm:h-56 w-full p-2 sm:p-4 flex flex-col justify-between cursor-pointer"
                          style={{ background: t.vibe }}
                          onClick={() => setPreviewId(t.id)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent" />

                          {/* Top badges */}
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-card/90 border border-border text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-terracotta-deep">
                              {t.plan === "premium"
                                ? "Premium"
                                : t.plan === "standard"
                                  ? "Standard"
                                  : "Gratuit"}
                            </span>

                            {isSelected && (
                              <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-terracotta text-white text-[8px] sm:text-[10px] font-black shadow-lg flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">Sélectionné</span>
                              </span>
                            )}
                          </div>

                          {/* Hover overlay preview button — desktop uniquement */}
                          <div className="relative z-10 my-auto text-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terracotta text-white text-xs font-black shadow-xl">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Aperçu interactif</span>
                            </span>
                          </div>

                          {/* Bottom title */}
                          <div className="relative z-10">
                            <h3 className="text-xs sm:text-xl font-black text-white leading-tight truncate">
                              {t.name}
                            </h3>
                            <p className="hidden sm:block text-xs text-white/80 font-medium">
                              {t.tagline}
                            </p>
                          </div>
                        </div>

                        {/* Features & Action Footer */}
                        <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-4 flex-1 flex flex-col justify-between">
                          <div className="hidden sm:block space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                              Points forts :
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {t.features.map((f) => (
                                <span
                                  key={f}
                                  className="px-2.5 py-1 rounded-lg bg-surface-warm border border-border text-[11px] text-foreground font-medium"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:pt-2 sm:border-t sm:border-border">
                            <button
                              type="button"
                              onClick={() => setPreviewId(t.id)}
                              className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 rounded-lg sm:rounded-xl border border-border bg-surface-warm hover:border-terracotta/50 text-[10px] sm:text-xs font-bold text-foreground transition-colors flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terracotta" />
                              <span>Aperçu</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                selectTemplate(t.id);
                              }}
                              className={`py-1.5 sm:py-2.5 px-1.5 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                                isSelected
                                  ? "bg-terracotta text-white shadow-sm"
                                  : "bg-surface-warm border border-border text-foreground hover:border-terracotta/50 hover:text-terracotta-deep"
                              }`}
                            >
                              {isSelected ? "✓ Sélectionné" : "Choisir"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
        )}
      </div>

      {/* SAVE FLOATING/FOOTER BAR */}
      <div className="p-4 sm:p-6 rounded-3xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 sticky bottom-4 z-30">
        <div className="space-y-0.5 text-center sm:text-left min-w-0">
          <span className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Template Sélectionné :
          </span>
          <p className="text-sm sm:text-base font-black text-terracotta-deep truncate">
            {templates.find((t) => t.id === selected)?.name}
          </p>
          {selected !== lastSaved && (
            <p className="text-[11px] text-amber-deep font-bold flex items-center gap-1 justify-center sm:justify-start">
              <AlertTriangle className="w-3.5 h-3.5" />
              Pas encore publié — cliquez sur Enregistrer
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {r?.slug && (
            <a
              href={`/${r.slug}?tpl=${selected}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-border bg-surface-warm text-xs font-bold text-muted-foreground hover:text-foreground hover:border-terracotta/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Tester</span>
            </a>
          )}

          <button
            onClick={handleSave}
            disabled={saving || selected === lastSaved}
            className="flex-1 sm:flex-none px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-terracotta text-white hover:bg-terracotta-deep font-black text-xs shadow-sm disabled:opacity-50 cursor-pointer transition-colors whitespace-nowrap"
          >
            {saving ? (
              "..."
            ) : selected === lastSaved ? (
              "✓ Publié"
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                Enregistrer
              </span>
            )}
          </button>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewId && (
        <PreviewModal
          tpl={templates.find((t) => t.id === previewId)!}
          canActivate={canPick(templates.find((t) => t.id === previewId)!.plan)}
          isCurrent={selected === previewId}
          onClose={() => setPreviewId(null)}
          onSelect={() => {
            selectTemplate(previewId);
            setPreviewId(null);
            toast.info("Sélectionné — cliquez sur « Enregistrer » en bas pour le publier.");
          }}
        />
      )}
    </div>
  );
}

function PreviewModal({
  tpl,
  canActivate,
  isCurrent,
  onClose,
  onSelect,
}: {
  tpl: Tpl;
  canActivate: boolean;
  isCurrent: boolean;
  onClose: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-terracotta-tint border border-terracotta/30 text-terracotta flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-terracotta font-bold">
              Aperçu — {tpl.plan.toUpperCase()}
            </p>
            <h3 className="text-sm sm:text-base font-black text-foreground truncate">{tpl.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {canActivate ? (
            <button
              onClick={onSelect}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-terracotta text-white hover:bg-terracotta-deep transition-colors font-black text-xs shadow-sm cursor-pointer whitespace-nowrap"
            >
              {isCurrent ? "✓ Sélectionné" : "Choisir ce template"}
            </button>
          ) : (
            <Link
              to="/dashboard/parametres"
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-terracotta text-white hover:bg-terracotta-deep transition-colors font-black text-xs shadow-sm text-center whitespace-nowrap inline-flex items-center justify-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              Activer Premium
            </Link>
          )}

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-border hover:border-charcoal/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-canvas">{renderTemplate(tpl.id, demoData)}</div>
    </div>
  );
}
