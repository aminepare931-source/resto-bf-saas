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
} from "lucide-react";

const PREMIUM_FEU_BG = "/premium-bgs/premium-feu-bg.png";
const PREMIUM_GRILL_BG = "/premium-bgs/premium-grill-bg.png";
const PREMIUM_ORANGE_BG = "/premium-bgs/premium-orange-bg.png";
const PREMIUM_PASTA_BG = "/premium-bgs/premium-pasta-bg.png";

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
    vibe: `url(${PREMIUM_ORANGE_BG}) center/cover`,
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
    vibe: "linear-gradient(135deg, #d4a853, #7a5c00)",
    features: ["Couleurs solaires", "Menu structuré", "Module avis"],
  },
  {
    id: "std-savane",
    name: "Savane & Ocre",
    tagline: "Rustique africain authentique",
    plan: "standard",
    vibe: "linear-gradient(135deg, #b95036, #5c1f12)",
    features: ["Teintes terre d'ocre", "Authentique", "Spécialités locales"],
  },
  {
    id: "std-marche",
    name: "Marché & Terroir",
    tagline: "Vert émeraude & produits frais",
    plan: "standard",
    vibe: "linear-gradient(135deg, #0f6b4f, #053325)",
    features: ["Vert émeraude", "Terroir & marché", "Affichage réactif"],
  },
  {
    id: "std-moderne",
    name: "Moderne Épuré",
    tagline: "Design urbain & contemporain",
    plan: "standard",
    vibe: "linear-gradient(135deg, #2c3e50, #111827)",
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

  const [userPlan, setUserPlan] = useState<PlanTier>("premium");
  const [selected, setSelected] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("restobf_selected_template") || "prem-royal";
    }
    return "prem-royal";
  });
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TplCategory>("tout");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!r) return;
    setUserPlan("premium"); // Ensure user has full testing access
    const saved = typeof window !== "undefined" ? localStorage.getItem("restobf_selected_template") : null;
    if (saved) {
      setSelected(saved);
    } else if (r.template) {
      setSelected(r.template);
    }
  }, [r]);

  const selectTemplate = (id: string) => {
    setSelected(id);
    localStorage.setItem("restobf_selected_template", id);
    if (r) {
      const updated = { ...r, template: id, plan: "premium" };
      localStorage.setItem("restobf_current_restaurant", JSON.stringify(updated));
    }
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("template-changed", { detail: id }));
  };

  const canPick = (_p: PlanTier) => true; // Allow picking any template for full testing access

  const handleSave = async () => {
    if (!selected) return;
    const tpl = templates.find((t) => t.id === selected);
    if (!tpl) return;

    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id || r?.id;

      if (userId) {
        // Try updating restaurants table
        await supabase
          .from("restaurants")
          .update({ template: selected })
          .eq(u?.user?.id ? "user_id" : "id", userId);

        // Also update public_restaurants if exists
        if (r?.slug) {
          await supabase
            .from("public_restaurants" as never)
            .update({ template: selected } as never)
            .eq("slug", r.slug);
        }
      }

      // Local storage update for instant reactivity across tabs/previews
      localStorage.setItem("restobf_selected_template", selected);
      if (r) {
        const updated = { ...r, template: selected, plan: "premium" };
        localStorage.setItem("restobf_current_restaurant", JSON.stringify(updated));
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("template-changed", { detail: selected }));

      setSaving(false);
      toast.success(`Template « ${tpl.name} » enregistré avec succès ! Votre site public a été mis à jour.`);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl border border-[#d4a853]/30 bg-gradient-to-r from-[#111118] via-[#111118] to-[#1e170c] shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d4a853]/15 border border-[#d4a853]/30 text-xs font-bold text-[#f0d48a]">
            <Palette className="w-3.5 h-3.5 text-[#d4a853]" />
            <span>Design & Identité Visuelle</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-foreground">
            Galerie de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#ffffff]">
              Templates Resto
            </span>
          </h1>

          <p className="text-sm text-muted-foreground max-w-2xl">
            Personnalisez l'apparence de votre site web public en 1 clic. Chaque template est
            optimisé pour les téléphones, la commande WhatsApp et le scan de QR code sur table.
          </p>
        </div>

        {r?.slug && (
          <a
            href={`/r/${r.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl border border-[#d4a853]/50 bg-[#d4a853]/10 hover:bg-[#d4a853]/20 text-[#f0d48a] text-xs font-black flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Voir mon site public live</span>
          </a>
        )}
      </div>

      {/* PLAN STATUS BANNER */}
      <div className="p-5 rounded-2xl border border-[#d4a853]/40 bg-[#111118] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4a853]/20 border border-[#d4a853]/40 text-[#f0d48a] flex items-center justify-center font-black">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Accès Créateur & Testeur :
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f]">
                ⭐ Tous les 9 Templates Débloqués
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vous pouvez tester, personnaliser et enregistrer n'importe quel thème (Premium, Standard ou Basique) sur votre site.
            </p>
          </div>
        </div>

        {r?.slug && (
          <a
            href={`/r/${r.slug}?tpl=${selected}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:brightness-110"
          >
            <span>Tester en direct dans un nouvel onglet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: "tout", label: "Tous les Templates (9)" },
          { id: "premium", label: "⭐ Premium VIP Animés (4)" },
          { id: "standard", label: "📦 Standard (4)" },
          { id: "basique", label: "🎁 Gratuit (1)" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id as TplCategory)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === cat.id
                ? "bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] shadow-lg"
                : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* TEMPLATE CARDS GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((t) => {
          const locked = !canPick(t.plan);
          const isSelected = selected === t.id;

          return (
            <div
              key={t.id}
              className={`rounded-3xl border-2 overflow-hidden bg-[#111118] transition-all flex flex-col justify-between group ${
                isSelected
                  ? "border-[#d4a853] shadow-[0_0_30px_rgba(212,168,83,0.25)] scale-[1.01]"
                  : "border-white/10 hover:border-[#d4a853]/50 hover:-translate-y-1"
              }`}
            >
              {/* Card Banner Preview */}
              <div
                className="relative h-56 w-full p-4 flex flex-col justify-between cursor-pointer"
                style={{ background: t.vibe }}
                onClick={() => setPreviewId(t.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-[#111118]/40 to-transparent" />

                {/* Top badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#0a0a0f]/80 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-[#f0d48a]">
                    {t.plan === "premium"
                      ? "✨ Premium"
                      : t.plan === "standard"
                        ? "📦 Standard"
                        : "🎁 Gratuit"}
                  </span>

                  {isSelected && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] text-[10px] font-black shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Actif
                    </span>
                  )}
                </div>

                {/* Hover overlay preview button */}
                <div className="relative z-10 my-auto text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] text-xs font-black shadow-xl">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Aperçu interactif</span>
                  </span>
                </div>

                {/* Bottom title */}
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white">{t.name}</h3>
                  <p className="text-xs text-white/80 font-medium">{t.tagline}</p>
                </div>
              </div>

              {/* Features & Action Footer */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                    Points forts :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.features.map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-foreground font-medium"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewId(t.id)}
                    className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#d4a853]" />
                    <span>Aperçu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      selectTemplate(t.id);
                      toast.info(`Template « ${t.name} » sélectionné et appliqué !`);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] shadow-lg"
                        : "bg-white/10 border border-white/20 text-foreground hover:border-[#d4a853] hover:text-[#f0d48a]"
                    }`}
                  >
                    {isSelected ? "✓ Actif" : "Sélectionner"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SAVE FLOATING/FOOTER BAR */}
      <div className="p-6 rounded-3xl border border-[#d4a853]/40 bg-[#111118]/90 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-30">
        <div className="space-y-0.5 text-center sm:text-left">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Template Sélectionné :
          </span>
          <p className="text-base font-black text-[#f0d48a]">
            {templates.find((t) => t.id === selected)?.name} —{" "}
            {templates.find((t) => t.id === selected)?.tagline}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {r?.slug && (
            <a
              href={`/r/${r.slug}?tpl=${selected}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-xs font-bold hover:border-[#d4a853] transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tester en direct</span>
            </a>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#d4a853] text-[#0a0a0f] font-black text-xs shadow-xl hover:brightness-110 disabled:opacity-50 cursor-pointer transition-all"
          >
            {saving ? "Mise à jour..." : "💾 Enregistrer ce template"}
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
            toast.success("Template sélectionné ! Enregistrement mis à jour.");
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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0f] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d4a853]/20 border border-[#d4a853]/40 text-[#f0d48a] flex items-center justify-center font-black text-xs">
            ✨
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#f0d48a] font-bold">
              Aperçu Interactif — {tpl.plan.toUpperCase()}
            </p>
            <h3 className="text-base font-black text-white">{tpl.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canActivate ? (
            <button
              onClick={onSelect}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] font-black text-xs shadow-lg hover:brightness-110 cursor-pointer"
            >
              {isCurrent ? "✓ Déjà sélectionné" : "Choisir ce template"}
            </button>
          ) : (
            <Link
              to="/dashboard/parametres"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#f0d48a] text-[#0a0a0f] font-black text-xs shadow-lg"
            >
              👑 Activer le Forfait Premium
            </Link>
          )}

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-white/10 hover:border-white/30 flex items-center justify-center text-muted-foreground hover:text-white transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-[#09070b]">{renderTemplate(tpl.id, demoData)}</div>
    </div>
  );
}
