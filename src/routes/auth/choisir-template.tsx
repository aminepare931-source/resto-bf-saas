import { usePlanAccess, allowedTemplateTiers } from "@/lib/plans";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { renderTemplate } from "@/components/public/templates";
import { demoData } from "@/components/public/demo-data";
import { Lock, Check, Eye, X } from "lucide-react";

const PREMIUM_FEU_BG = "/premium-bgs/premium-feu-bg.png";
const PREMIUM_GRILL_BG = "/premium-bgs/premium-grill-bg.jpg";
const PREMIUM_ROYAL_BG = "/premium-bgs/premium-royal-bg.jpg";
const PREMIUM_PASTA_BG = "/premium-bgs/premium-pasta-bg.jpg";

export const Route = createFileRoute("/auth/choisir-template")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth/connexion" });
  },
  head: () => ({ meta: [{ title: "Choisir un template — RestoBF" }] }),
  component: ChooseTemplate,
});

type PlanTier = "gratuit" | "standard" | "premium";
type Tpl = { id: string; name: string; tagline: string; plan: PlanTier; vibe: string };

const templates: Tpl[] = [
  {
    id: "gratuit-classique",
    name: "Classique",
    tagline: "Swiss minimal noir/blanc",
    plan: "gratuit",
    vibe: "linear-gradient(135deg,#1a1a24,#0a0a0f)",
  },
  {
    id: "std-soleil",
    name: "Soleil",
    tagline: "Or solaire & crème chaleureuse",
    plan: "standard",
    vibe: "linear-gradient(135deg,#fabc4d,#7e5700)",
  },
  {
    id: "std-savane",
    name: "Savane",
    tagline: "Ambre & terre d'ocre",
    plan: "standard",
    vibe: "linear-gradient(135deg,#e5a93c,#504535)",
  },
  {
    id: "std-marche",
    name: "Vert",
    tagline: "Émeraude & produits frais",
    plan: "standard",
    vibe: "linear-gradient(135deg,#49eb7b,#0d2818)",
  },
  {
    id: "std-moderne",
    name: "Épuré",
    tagline: "Minimalisme contemporain",
    plan: "standard",
    vibe: "linear-gradient(135deg,#d4c4b0,#0b0f19)",
  },
  {
    id: "prem-royal",
    name: "Palais Royal",
    tagline: "Or, QR, cave, événements",
    plan: "premium",
    vibe: `url(${PREMIUM_ROYAL_BG}) center/cover`,
  },
  {
    id: "prem-nuit",
    name: "Aurum Nuit",
    tagline: "Fine dining sombre animé",
    plan: "premium",
    vibe: `url(${PREMIUM_PASTA_BG}) center/cover`,
  },
  {
    id: "prem-feu",
    name: "Ignis Feu",
    tagline: "Braises animées & grillades",
    plan: "premium",
    vibe: `url(${PREMIUM_FEU_BG}) center/cover`,
  },
  {
    id: "prem-luxe",
    name: "Luxe Grill",
    tagline: "Grande réservation + QR",
    plan: "premium",
    vibe: `url(${PREMIUM_GRILL_BG}) center/cover`,
  },
];

const planRank: Record<PlanTier, number> = { gratuit: 0, standard: 1, premium: 2 };

// Map DB plan -> tier used for template gating.
// Trial and standard_plus give Standard-tier template access (not Premium).
function planToTier(plan: string): PlanTier {
  if (plan === "premium" || plan === "sur_mesure") return "premium";
  if (plan === "standard" || plan === "standard_plus" || plan === "trial") return "standard";
  return "gratuit";
}

function ChooseTemplate() {
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState<PlanTier>("standard");
  const [planLabel, setPlanLabel] = useState<string>("essai");
  const [selected, setSelected] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("restaurants")
        .select("plan, template")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (data) {
        setUserPlan(planToTier(data.plan));
        setPlanLabel(data.plan);
        setSelected(data.template ?? null);
      }
    })();
  }, []);

  const access = usePlanAccess(userPlan === "gratuit" ? "basique" : userPlan);
  const allowedTiers = allowedTemplateTiers(access.has);
  const canPick = (p: Tpl["plan"]) => allowedTiers.includes(p === "gratuit" ? "basique" : p);

  const save = async () => {
    if (!selected) return;
    const tpl = templates.find((t) => t.id === selected);
    if (!tpl) return;
    if (!canPick(tpl.plan)) {
      toast.error("Ce template demande un forfait supérieur.");
      return;
    }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("restaurants")
      .update({ template: selected })
      .eq("user_id", u.user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Template enregistré !");
    navigate({ to: "/dashboard" });
  };

  const grouped = {
    gratuit: templates.filter((t) => t.plan === "gratuit"),
    standard: templates.filter((t) => t.plan === "standard"),
    premium: templates.filter((t) => t.plan === "premium"),
  };

  return (
    <>
      <AuthShell
        title="Choisissez votre template"
        subtitle={`Votre forfait : ${planLabel} · Clique sur un design pour le prévisualiser en grand`}
        maxWidth="max-w-5xl"
      >
        <div className="space-y-8">
          <div className="rounded-2xl border px-5 py-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Forfait actif
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-terracotta text-white">
              {userPlan === "premium"
                ? "Premium"
                : userPlan === "standard"
                  ? "Standard"
                  : "Gratuit / Essai"}
            </span>
            {userPlan !== "premium" && (
              <span className="text-xs text-muted-foreground">
                Passez Premium pour débloquer les 4 templates animés exclusifs.
              </span>
            )}
          </div>
          {(["gratuit", "standard", "premium"] as const).map((plan) => (
            <div key={plan}>
              <h3 className="text-sm font-black uppercase tracking-widest text-terracotta-deep mb-3">
                {plan === "gratuit" ? "Gratuit" : plan === "standard" ? "Standard" : "Premium"}
                {!canPick(plan) && (
                  <span className="ml-3 text-xs text-muted-foreground normal-case tracking-normal">
                    (aperçu seulement — upgrade requis pour activer)
                  </span>
                )}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {grouped[plan].map((t) => {
                  const locked = !canPick(t.plan);
                  const active = selected === t.id;
                  return (
                    <div key={t.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => setPreviewId(t.id)}
                        className={`relative aspect-[4/5] w-full rounded-2xl border-2 overflow-hidden text-left transition-all ${
                          active
                            ? "border-terracotta shadow-elevated scale-[1.02]"
                            : "border-border hover:border-terracotta/40 hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="absolute inset-0" style={{ background: t.vibe }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {locked && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-white/90 border border-white/20 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> {t.plan}
                          </div>
                        )}
                        {active && (
                          <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-terracotta text-white flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <span className="px-3 py-1.5 rounded-lg bg-white text-foreground text-xs font-bold flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> Aperçu
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <strong className="block text-white text-base">{t.name}</strong>
                          <span className="text-xs text-white/70">{t.tagline}</span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard" })}
              className="px-5 py-3 rounded-xl border border-border text-sm font-semibold hover:border-terracotta/40 transition-colors"
            >
              Plus tard
            </button>
            <button
              type="button"
              disabled={!selected || saving}
              onClick={save}
              className="px-7 py-3 rounded-xl bg-terracotta hover:bg-terracotta-deep text-white font-bold shadow-card transition-all disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Valider mon template"}
            </button>
          </div>
        </div>
      </AuthShell>

      {previewId && (
        <PreviewModal
          tpl={templates.find((t) => t.id === previewId)!}
          canActivate={canPick(templates.find((t) => t.id === previewId)!.plan)}
          isCurrent={selected === previewId}
          onClose={() => setPreviewId(null)}
          onSelect={() => {
            setSelected(previewId);
            setPreviewId(null);
          }}
        />
      )}
    </>
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
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0a0a0f] text-white">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#e5a93c] font-bold">
            Aperçu — {tpl.plan}
          </p>
          <strong>{tpl.name}</strong>
        </div>
        <div className="flex items-center gap-2">
          {canActivate ? (
            <button
              onClick={onSelect}
              className="px-5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-deep text-white font-bold text-sm flex items-center gap-1.5"
            >
              {isCurrent && <Check className="w-4 h-4" />}
              {isCurrent ? "Sélectionné" : "Choisir ce template"}
            </button>
          ) : (
            <a
              href="https://wa.me/22600000000?text=Je%20veux%20passer%20en%20Premium%20pour%20le%20template%20"
              target="_blank"
              rel="noopener"
              className="px-5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-deep text-white font-bold text-sm"
            >
              Passer en Premium
            </a>
          )}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-white/10 hover:border-terracotta/50 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto bg-[#0a0a0f]">{renderTemplate(tpl.id, demoData)}</div>
    </div>
  );
}
